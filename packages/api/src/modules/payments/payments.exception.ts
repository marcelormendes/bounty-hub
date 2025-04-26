import { HttpStatus } from '@nestjs/common'
import { CustomException } from '@common/exceptions/custom.exceptions'

export const errorCodes: Record<string, string> = {
  BHP001: 'STRIPE_SECRET_KEY is not set',
  BHP002: 'This bounty is not available for payment',
  BHP003: 'You can only pay for your own bounties',
  BHP004: 'Bounty is not ready for payment',
  BHP005: 'Assignee has not set up payment information',
  BHP006: 'No Stripe Connect account found',
  BHP007: 'User not found',
  BHP008: 'Stripe webhook secret is not set',
  BHP009: 'Failed to disconnect Stripe Connect account',
  BHP010: 'STRIPE_CLIENT_ID is not set',
}
/**
 * Thrown when a landmarks operation fails.
 */
export class PaymentsException extends CustomException {
  constructor(
    errorCode: string,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: unknown,
  ) {
    const message = errorCodes[errorCode]
    super(message, status, details, errorCode)
  }
}
