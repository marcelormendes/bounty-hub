import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaymentsService } from './payments.service'
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @ApiOperation({ summary: 'Create a payment intent for a bounty' })
  createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Req() req,
  ) {
    return this.paymentsService.createPaymentIntent(
      req.user.id,
      createPaymentIntentDto,
    )
  }

  @Post('connect-account')
  @ApiOperation({ summary: 'Create or retrieve a Stripe Connect account' })
  createConnectAccount(@Req() req) {
    return this.paymentsService.createConnectAccount(req.user.id)
  }

  @Get('connect-account/link')
  @ApiOperation({ summary: 'Get a link to the Stripe Connect onboarding page' })
  getConnectAccountLink(@Req() req) {
    return this.paymentsService.getConnectAccountLink(req.user.id)
  }

  @Post('process/:bountyId')
  @ApiOperation({ summary: 'Process payment for an approved bounty' })
  processBountyPayment(@Param('bountyId') bountyId: string) {
    return this.paymentsService.processBountyPayment(bountyId)
  }
}
