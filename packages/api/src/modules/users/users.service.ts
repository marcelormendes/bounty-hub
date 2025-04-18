import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/client' // Restore User import
import { PrismaService } from '../../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
// bcrypt import removed

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Restore User type
    return await this.prisma.user.create({
      data: {
        ...createUserDto,
      },
    })
  }

  async findAll(): Promise<User[]> {
    // Restore User type
    return await this.prisma.user.findMany()
  }

  async findOneById(id: string): Promise<User> {
    // Restore User type
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  async findOneByEmail(email: string): Promise<User | null> {
    // Restore User type
    return await this.prisma.user.findUnique({ where: { email } })
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Restore User type
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    })
  }

  async remove(id: string): Promise<User> {
    // Restore User type
    return await this.prisma.user.delete({ where: { id } })
  }

  async updateStripeCustomerId(
    userId: string,
    customerId: string,
  ): Promise<User> {
    // Restore User type
    return await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    })
  }

  async updateStripeConnectAccountId(
    userId: string,
    accountId: string,
  ): Promise<User> {
    // Restore User type
    return await this.prisma.user.update({
      where: { id: userId },
      data: { stripeConnectAccountId: accountId },
    })
  }
}
