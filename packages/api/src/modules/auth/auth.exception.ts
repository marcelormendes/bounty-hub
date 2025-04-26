import { HttpStatus } from '@nestjs/common'
import { CustomException } from '@common/exceptions/custom.exceptions'

export const errorCodes: Record<string, string> = {
  BHA001: 'Invalid or expired token',
  BHA002: 'Supabase configuration is missing',
}
/**
 * Thrown when a landmarks operation fails.
 */
export class AuthException extends CustomException {
  constructor(
    errorCode: string,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: unknown,
  ) {
    const message = errorCodes[errorCode]
    super(message, status, details, errorCode)
  }
}
