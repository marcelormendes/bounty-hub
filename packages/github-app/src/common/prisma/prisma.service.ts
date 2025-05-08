import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['error', 'warn'],
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  /**
   * Cleans the entire database by deleting all records from all tables
   * Only available in non-production environments
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return

    const models = Reflect.ownKeys(this).filter((key) => {
      return (
        typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$')
      )
    })

    return Promise.all(
      models.map((modelKey) => {
        return this[modelKey as string].deleteMany()
      }),
    )
  }
}