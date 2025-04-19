import { CustomException } from './custom.exceptions'
import { HttpStatus } from '@nestjs/common'

/**
 * Base custom exception class with standardized error structure
 * All domain-specific exceptions should extend this class
 */
export class BaseApiException extends CustomException {
  constructor(
    error: string,
    message: string,
    statusCode: number,
    details?: unknown,
    errorCode?: string,
  ) {
    super(message, statusCode)
    this.error = error
    this.details = details
    this.errorCode = errorCode
    this.timestamp = new Date().toISOString()
  }

  error: string
  message: string
  details?: unknown
  errorCode?: string
  timestamp: string
}
