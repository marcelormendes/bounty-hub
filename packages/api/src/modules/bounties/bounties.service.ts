import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Bounty, BountyStatus, BountyType, User, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { UpdateBountyDto } from './dto/update-bounty.dto';

@Injectable()
export class BountiesService {
  constructor(private prisma: PrismaService) {}

  async create(createBountyDto: CreateBountyDto, creator: User): Promise<Bounty> {
    if (creator.role !== UserRole.CLIENT && creator.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only clients and admins can create bounties');
    }

    return this.prisma.bounty.create({
      data: {
        ...createBountyDto,
        creatorId: creator.id,
        status: BountyStatus.OPEN,
      },
    });
  }

  async findAll(options?: { status?: BountyStatus; type?: BountyType }): Promise<Bounty[]> {
    const where: any = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.type) {
      where.type = options.type;
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
    });
  }

  async findOne(id: string): Promise<Bounty> {
    const bounty = await this.prisma.bounty.findUnique({
      where: { id },
      include: {
        creator: true,
        assignee: true,
      },
    });

    if (!bounty) {
      throw new NotFoundException(`Bounty with ID ${id} not found`);
    }

    return bounty;
  }

  async update(id: string, updateBountyDto: UpdateBountyDto, user: User): Promise<Bounty> {
    const bounty = await this.findOne(id);

    // Only allow creator or admin to update most properties
    if (bounty.creatorId !== user.id && user.role !== UserRole.ADMIN) {
      // If not creator or admin, only allow assignee to update PR URL and status to completed
      if (bounty.assigneeId !== user.id) {
        throw new ForbiddenException('You do not have permission to update this bounty');
      }

      // Assignee can only update specific fields
      const allowedFields = ['githubPRUrl', 'status'];
      const attemptedFields = Object.keys(updateBountyDto);
      const invalidFields = attemptedFields.filter(field => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        throw new ForbiddenException(`You can only update: ${allowedFields.join(', ')}`);
      }

      // Assignee can only set status to completed
      if (updateBountyDto.status && updateBountyDto.status !== BountyStatus.COMPLETED) {
        throw new ForbiddenException('You can only set status to completed');
      }
    }

    // Prepare data for update
    const data: any = { ...updateBountyDto };

    // Handle status transitions
    if (updateBountyDto.status) {
      switch (updateBountyDto.status) {
        case BountyStatus.COMPLETED:
          data.completedAt = new Date();
          break;
        case BountyStatus.APPROVED:
          if (user.id !== bounty.creatorId && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only the creator or admin can approve a bounty');
          }
          data.approvedAt = new Date();
          break;
        case BountyStatus.PAID:
          if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admins can mark a bounty as paid');
          }
          data.paidAt = new Date();
          break;
      }
    }

    return this.prisma.bounty.update({
      where: { id },
      data,
      include: {
        creator: true,
        assignee: true,
      },
    });
  }

  async remove(id: string, user: User): Promise<Bounty> {
    const bounty = await this.findOne(id);

    if (bounty.creatorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only the creator or admin can delete a bounty');
    }

    if (bounty.status !== BountyStatus.OPEN) {
      throw new ForbiddenException('Only open bounties can be deleted');
    }

    return this.prisma.bounty.delete({ where: { id } });
  }

  async assignBounty(id: string, user: User): Promise<Bounty> {
    const bounty = await this.findOne(id);

    if (bounty.status !== BountyStatus.OPEN) {
      throw new ForbiddenException('This bounty is not available for assignment');
    }

    if (bounty.creatorId === user.id) {
      throw new ForbiddenException('You cannot assign your own bounty to yourself');
    }

    return this.prisma.bounty.update({
      where: { id },
      data: {
        assigneeId: user.id,
        assignedAt: new Date(),
        status: BountyStatus.IN_PROGRESS,
      },
      include: {
        creator: true,
        assignee: true,
      },
    });
  }

  async releaseBounty(id: string, user: User): Promise<Bounty> {
    const bounty = await this.findOne(id);

    if (bounty.status !== BountyStatus.IN_PROGRESS) {
      throw new ForbiddenException('Only in-progress bounties can be released');
    }

    if (
      bounty.assigneeId !== user.id && // Assignee can release
      bounty.creatorId !== user.id && // Creator can release
      user.role !== UserRole.ADMIN // Admin can release
    ) {
      throw new ForbiddenException('You do not have permission to release this bounty');
    }

    return this.prisma.bounty.update({
      where: { id },
      data: {
        assigneeId: null,
        assignedAt: null,
        status: BountyStatus.OPEN,
      },
      include: {
        creator: true,
        assignee: true,
      },
    });
  }
}