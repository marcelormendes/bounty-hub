import { HttpStatus } from "@nestjs/common"
import { BaseApiException } from "src/common/exceptions/api.exceptions"
import authErrorCodes from './auth.error-codes.json'

/**
 * Thrown when the Auth processing fails
 */
export class AuthException extends BaseApiException {
  constructor(
    errorCode: string,
    statusCode: number = HttpStatus.UNAUTHORIZED,
    details?: unknown,
  ) {

    const message = authErrorCodes[errorCode]
    super('AuthenticationError', message, statusCode, details, errorCode)
  }
}