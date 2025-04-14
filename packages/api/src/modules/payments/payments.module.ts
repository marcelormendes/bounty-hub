import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { BountiesModule } from '../bounties/bounties.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [BountiesModule, UsersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}