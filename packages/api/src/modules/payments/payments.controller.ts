import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  HttpStatus,
  Headers,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaymentsService } from './payments.service'
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'
import { Request } from 'express'
import { PaymentsException } from './payments.exception'
import stripe, { Stripe } from 'stripe'
interface AuthUser extends Request {
  user: { id: string }
}

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
  createConnectAccount(@Req() req: AuthUser) {
    if (!req.user) {
      throw new PaymentsException('BHP007', HttpStatus.UNAUTHORIZED)
    }

    return this.paymentsService.createConnectAccount(req.user.id)
  }

  @Get('connect-account/link')
  @ApiOperation({ summary: 'Get a link to the Stripe Connect onboarding page' })
  getConnectAccountLink(@Req() req: AuthUser) {
    if (!req.user) {
      throw new PaymentsException('BHP007', HttpStatus.UNAUTHORIZED)
    }

    return this.paymentsService.getConnectAccountLink(req.user.id)
  }

  @Post('connect-account/webhook')
  @ApiOperation({ summary: 'Handle a Stripe webhook for a Connect account' })
  async handleStripe(
    @Req() req: Request,
    @Headers('Stripe-Signature') sig: string,
  ) {
    return this.paymentsService.processConnectAccountWebhook(req, sig)
  }

  //disconnect stripe account
  @Post('connect-account/disconnect')
  @ApiOperation({ summary: 'Disconnect a Stripe Connect account' })
  disconnectStripeAccount(@Req() req: AuthUser) {
    if (!req.user) {
      throw new PaymentsException('BHP007', HttpStatus.UNAUTHORIZED)
    }

    return this.paymentsService.disconnectStripeAccount(req.user.id)
  }

  @Post('process/:bountyId')
  @ApiOperation({ summary: 'Process payment for an approved bounty' })
  processBountyPayment(@Param('bountyId') bountyId: string) {
    return this.paymentsService.processBountyPayment(bountyId)
  }
}
