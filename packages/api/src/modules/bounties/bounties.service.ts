import { Injectable, HttpStatus } from '@nestjs/common'
import { Bounty, BountyStatus, User, UserRole } from '@prisma/client'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateBountyDto } from './dto/create-bounty.dto'
import { UpdateBountyDto } from './dto/update-bounty.dto'
import { BountiesException } from './bounties.exception'
import { UsersService } from '../users/users.service'
import { CreateGithubBountyDto } from './dto/create-github-bounty.dto'

@Injectable()
export class BountiesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(
    createBountyDto: CreateBountyDto,
    creator: User,
  ): Promise<Bounty> {
    if (creator.role !== UserRole.CLIENT && creator.role !== UserRole.ADMIN) {
      throw new BountiesException('BHB001', HttpStatus.FORBIDDEN)
    }

    // Extract required fields from DTO to ensure they are present
    const {
      title,
      description,
      reward,
      labels,
      githubIssueUrl,
      attachments,
      deadline,
      clientId,
    } = createBountyDto

    return this.prisma.bounty.create({
      data: {
        clientId,
        creatorId: creator.id,
        title,
        description,
        reward,
        ...(labels && { labels }),
        ...(attachments && { attachments }),
        ...(deadline && { deadline }),
        status: BountyStatus.OPEN,
        githubIssueUrl,
      },
    })
  }

  async createFromGithub(
    createGithubBountyDto: CreateGithubBountyDto,
  ): Promise<Bounty> {
    const {
      clientId,
      issueTitle,
      issueBody,
      issueUrl,
      reward,
      labels,
      deadline,
    } = createGithubBountyDto

    // First, check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      throw new BountiesException('BHB018', HttpStatus.NOT_FOUND, clientId)
    }

    // Check if there's already a bounty for this GitHub issue
    const existingBounty = await this.prisma.bounty.findFirst({
      where: { githubIssueUrl: issueUrl },
    })

    if (existingBounty) {
      throw new BountiesException('BHB019', HttpStatus.CONFLICT, issueUrl)
    }

    // Find a creator user associated with the client
    const clientUser = await this.prisma.clientUser.findFirst({
      where: { clientId },
      include: { user: true },
    })

    if (!clientUser) {
      throw new BountiesException('BHB020', HttpStatus.NOT_FOUND, clientId)
    }

    // Create the bounty
    return this.prisma.bounty.create({
      data: {
        clientId,
        creatorId: clientUser.userId,
        title: issueTitle,
        description: issueBody,
        reward,
        labels: labels || ['github-integration'],
        ...(deadline && { deadline: new Date(deadline) }),
        status: BountyStatus.OPEN,
        githubIssueUrl: issueUrl,
      },
    })
  }

  async findAll(options?: {
    status?: BountyStatus
    rewardMin?: number
    rewardMax?: number
  }): Promise<Bounty[]> {
    const where: any = {}

    if (options?.status) {
      where.status = options.status
    }

    if (options?.rewardMin) {
      where.price = {
        gte: options.rewardMin,
      }
    }

    if (options?.rewardMax) {
      where.price = {
        lte: options.rewardMax,
      }
    }

    return this.prisma.bounty.findMany({
      where,
      include: {
        creator: true,
        assignee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: string): Promise<Bounty> {
    const bounty = await this.prisma.bounty.findUnique({
      where: { id },
      include: {
        creator: true,
        assignee: true,
      },
    })

    if (!bounty) {
      throw new BountiesException('BHB002', HttpStatus.NOT_FOUND, id)
    }

    return bounty
  }

  async update(
    id: string,
    updateBountyDto: UpdateBountyDto,
    user: User,
  ): Promise<Bounty> {
    const bounty = await this.findOne(id)

    //check if user has access to this client
    const hasAccess = await this.usersService.checkIfUserHasAccessToClient(
      user.id,
      bounty.clientId,
    )

    if (!hasAccess) {
      throw new BountiesException('BHB017', HttpStatus.FORBIDDEN, user.id)
    }

    // Only allow client users to update most properties
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.CLIENT) {
      // If not client or admin, only allow assignee to update PR URL and status to completed
      if (bounty.assigneeId !== user.id) {
        throw new BountiesException('BHB006', HttpStatus.FORBIDDEN)
      }

      // Assignee can only update specific fields
      const allowedFields = ['githubPRUrl', 'status']
      const attemptedFields = Object.keys(updateBountyDto)
      const invalidFields = attemptedFields.filter(
        (field) => !allowedFields.includes(field),
      )

      if (invalidFields.length > 0) {
        throw new BountiesException('BHB007', HttpStatus.FORBIDDEN)
      }

      // Assignee can only set status to completed
      if (
        updateBountyDto.status &&
        updateBountyDto.status !== BountyStatus.COMPLETED
      ) {
        throw new BountiesException('BHB008', HttpStatus.FORBIDDEN)
      }
    }

    // Prepare data for update
    const data: any = { ...updateBountyDto }

    // Handle status transitions
    if (updateBountyDto.status) {
      switch (updateBountyDto.status) {
        case BountyStatus.COMPLETED:
          data.completedAt = new Date()
          break
        case BountyStatus.APPROVED:
          if (user.role !== UserRole.ADMIN && user.role !== UserRole.CLIENT) {
            throw new BountiesException('BHB009', HttpStatus.FORBIDDEN)
          }
          data.approvedAt = new Date()
          break
        case BountyStatus.PAID:
          if (user.role !== UserRole.ADMIN && user.role !== UserRole.CLIENT) {
            throw new BountiesException('BHB010', HttpStatus.FORBIDDEN)
          }
          data.paidAt = new Date()
          break
      }
    }

    return this.prisma.bounty.update({
      where: { id },
      data,
      include: {
        creator: true,
        assignee: true,
      },
    })
  }

  async remove(id: string, user: User): Promise<Bounty> {
    const bounty = await this.findOne(id)

    if (bounty.creatorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new BountiesException('BHB011', HttpStatus.FORBIDDEN)
    }

    if (bounty.status !== BountyStatus.OPEN) {
      throw new BountiesException('BHB012')
    }

    return this.prisma.bounty.delete({ where: { id } })
  }

  async assignBounty(id: string, user: User): Promise<Bounty> {
    const bounty = await this.findOne(id)

    if (bounty.status !== BountyStatus.OPEN) {
      throw new BountiesException('BHB013')
    }

    if (bounty.creatorId === user.id) {
      throw new BountiesException('BHB014', HttpStatus.FORBIDDEN)
    }

    return this.prisma.bounty.update({
      where: { id },
      data: {
        assigneeId: user.id,
        updatedAt: new Date(),
        status: BountyStatus.IN_PROGRESS,
      },
      include: {
        creator: true,
        assignee: true,
      },
    })
  }

  async releaseBounty(id: string, user: User): Promise<Bounty> {
    const bounty = await this.findOne(id)
    const hasAccess = await this.usersService.checkIfUserHasAccessToClient(
      user.id,
      bounty.clientId,
    )

    if (!hasAccess) {
      throw new BountiesException('BHB017', HttpStatus.FORBIDDEN, user.id)
    }

    if (bounty.status !== BountyStatus.IN_PROGRESS) {
      throw new BountiesException('BHB015')
    }

    if (
      bounty.assigneeId !== user.id &&
      bounty.creatorId !== user.id &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.CLIENT
    ) {
      throw new BountiesException('BHB016', HttpStatus.FORBIDDEN)
    }

    return this.prisma.bounty.update({
      where: { id },
      data: {
        assigneeId: null,
        status: BountyStatus.OPEN,
        releasedAt: new Date(),
      },
      include: {
        creator: true,
        assignee: true,
      },
    })
  }
}
