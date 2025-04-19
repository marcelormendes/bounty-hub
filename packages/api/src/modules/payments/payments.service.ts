import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BountyStatus } from '@prisma/client'
import Stripe from 'stripe'
import { BountiesService } from '../bounties/bounties.service'
import { UsersService } from '../users/users.service'
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'

@Injectable()
export class PaymentsService {
  private stripe: Stripe

  constructor(
    private configService: ConfigService,
    private bountiesService: BountiesService,
    private usersService: UsersService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2024-04-10' as any,
      },
    )
  }

  async createPaymentIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const bounty = await this.bountiesService.findOne(
      createPaymentIntentDto.bountyId,
    )

    if (bounty.status !== BountyStatus.OPEN) {
      throw new BadRequestException('This bounty is not available for payment')
    }

    if (bounty.creatorId !== userId) {
      throw new BadRequestException('You can only pay for your own bounties')
    }

    // Get or create Stripe customer
    const user = await this.usersService.findOneById(userId)
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      })

      customerId = customer.id
      await this.usersService.updateStripeCustomerId(user.id, customerId)
    }

    // Calculate amount including platform fee (5%)
    const amount = Math.round(Number(bounty.price) * 100) // Convert to cents
    const platformFee = Math.round(amount * 0.05) // 5% fee
    const totalAmount = amount + platformFee

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      customer: customerId,
      metadata: {
        bountyId: bounty.id,
        userId: user.id,
        platformFee,
        bountyAmount: amount,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount / 100, // Convert back to dollars for display
      bountyAmount: amount / 100,
      platformFee: platformFee / 100,
    }
  }

  async createConnectAccount(userId: string) {
    const user = await this.usersService.findOneById(userId)

    if (user.stripeConnectAccountId) {
      return { accountId: user.stripeConnectAccountId }
    }

    const account = await this.stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        url: user.portfolioUrl || 'https://bountyhub.com',
      },
    })

    await this.usersService.updateStripeConnectAccountId(userId, account.id)

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${this.configService.get('FRONTEND_URL')}/settings/payments`,
      return_url: `${this.configService.get('FRONTEND_URL')}/settings/payments/complete`,
      type: 'account_onboarding',
    })

    return {
      accountId: account.id,
      url: accountLink.url,
    }
  }

  async getConnectAccountLink(userId: string) {
    const user = await this.usersService.findOneById(userId)

    if (!user.stripeConnectAccountId) {
      throw new NotFoundException('No Stripe Connect account found')
    }

    const accountLink = await this.stripe.accountLinks.create({
      account: user.stripeConnectAccountId,
      refresh_url: `${this.configService.get('FRONTEND_URL')}/settings/payments`,
      return_url: `${this.configService.get('FRONTEND_URL')}/settings/payments/complete`,
      type: 'account_onboarding',
    })

    return { url: accountLink.url }
  }

  async processBountyPayment(bountyId: string) {
    const bounty = await this.bountiesService.findOne(bountyId)

    if (bounty.status !== BountyStatus.APPROVED || !bounty.assigneeId) {
      throw new BadRequestException('Bounty is not ready for payment')
    }

    const assignee = await this.usersService.findOneById(bounty.assigneeId)
    if (!assignee.stripeConnectAccountId) {
      throw new BadRequestException(
        'Assignee has not set up payment information',
      )
    }

    const amount = Math.round(Number(bounty.price) * 100) // Convert to cents
    const platformFee = Math.round(amount * 0.05) // 5% fee
    const developerAmount = amount - platformFee

    // Create a transfer to the developer's connected account
    const transfer = await this.stripe.transfers.create({
      amount: developerAmount,
      currency: 'usd',
      destination: assignee.stripeConnectAccountId,
      metadata: {
        bountyId: bounty.id,
        assigneeId: bounty.assigneeId,
        creatorId: bounty.creatorId,
      },
    })

    // Update bounty status to paid
    await this.bountiesService.update(
      bountyId,
      { status: BountyStatus.PAID },
      { id: 'system', role: 'admin' } as any, // System update
    )

    return {
      transferId: transfer.id,
      amount: developerAmount / 100, // Convert back to dollars for display
      platformFee: platformFee / 100,
    }
  }
}
