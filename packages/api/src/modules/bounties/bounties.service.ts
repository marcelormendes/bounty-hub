import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bounty, BountyStatus } from './entities/bounty.entity';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { UpdateBountyDto } from './dto/update-bounty.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class BountiesService {
  constructor(
    @InjectRepository(Bounty)
    private bountiesRepository: Repository<Bounty>,
  ) {}

  async create(createBountyDto: CreateBountyDto, creator: User): Promise<Bounty> {
    if (creator.role !== UserRole.CLIENT && creator.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only clients and admins can create bounties');
    }

    const bounty = this.bountiesRepository.create({
      ...createBountyDto,
      creator,
      creatorId: creator.id,
      status: BountyStatus.OPEN,
    });

    return this.bountiesRepository.save(bounty);
  }

  async findAll(options?: { status?: BountyStatus; type?: string }): Promise<Bounty[]> {
    const queryBuilder = this.bountiesRepository.createQueryBuilder('bounty');
    queryBuilder.leftJoinAndSelect('bounty.creator', 'creator');
    queryBuilder.leftJoinAndSelect('bounty.assignee', 'assignee');

    if (options?.status) {
      queryBuilder.andWhere('bounty.status = :status', { status: options.status });
    }

    if (options?.type) {
      queryBuilder.andWhere('bounty.type = :type', { type: options.type });
    }

    queryBuilder.orderBy('bounty.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Bounty> {
    const bounty = await this.bountiesRepository.findOne({
      where: { id },
      relations: ['creator', 'assignee'],
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

    // Handle status transitions
    if (updateBountyDto.status) {
      switch (updateBountyDto.status) {
        case BountyStatus.COMPLETED:
          bounty.completedAt = new Date();
          break;
        case BountyStatus.APPROVED:
          if (user.id !== bounty.creatorId && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only the creator or admin can approve a bounty');
          }
          bounty.approvedAt = new Date();
          break;
        case BountyStatus.PAID:
          if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admins can mark a bounty as paid');
          }
          bounty.paidAt = new Date();
          break;
      }
    }

    Object.assign(bounty, updateBountyDto);
    return this.bountiesRepository.save(bounty);
  }

  async remove(id: string, user: User): Promise<void> {
    const bounty = await this.findOne(id);

    if (bounty.creatorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only the creator or admin can delete a bounty');
    }

    if (bounty.status !== BountyStatus.OPEN) {
      throw new ForbiddenException('Only open bounties can be deleted');
    }

    await this.bountiesRepository.remove(bounty);
  }

  async assignBounty(id: string, user: User): Promise<Bounty> {
    const bounty = await this.findOne(id);

    if (bounty.status !== BountyStatus.OPEN) {
      throw new ForbiddenException('This bounty is not available for assignment');
    }

    if (bounty.creatorId === user.id) {
      throw new ForbiddenException('You cannot assign your own bounty to yourself');
    }

    bounty.assignee = user;
    bounty.assigneeId = user.id;
    bounty.assignedAt = new Date();
    bounty.status = BountyStatus.IN_PROGRESS;

    return this.bountiesRepository.save(bounty);
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

    bounty.assignee = null;
    bounty.assigneeId = null;
    bounty.assignedAt = null;
    bounty.status = BountyStatus.OPEN;

    return this.bountiesRepository.save(bounty);
  }
}