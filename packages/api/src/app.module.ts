import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { BountiesModule } from './modules/bounties/bounties.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { GithubModule } from './modules/github/github.module'
import { PrismaModule } from './common/prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BountiesModule,
    PaymentsModule,
    GithubModule,
  ],
})
export class AppModule {}
