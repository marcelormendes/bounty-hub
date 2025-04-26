import { HttpStatus } from '@nestjs/common'
import { CustomException } from '@common/exceptions/custom.exceptions'

export const errorCodes: Record<string, string> = {
  BHB001: 'Only clients and admins can create bounties',
  BHB002: 'Bounty with ID {id} not found',
  BHB003: 'Bounty with ID {id} is not open',
  BHB004: 'Bounty with ID {id} is not in progress',
  BHB005: 'Bounty with ID {id} is not assigned to you',
  BHB006: 'You do not have permission to update this bounty',
  BHB007: 'You can only update: githubPRUrl, status',
  BHB008: 'You can only set status to completed',
  BHB009: 'Only the admin or client can approve a bounty',
  BHB010: 'Only admins or clients can mark a bounty as paid',
  BHB011: 'Only the creator or admin can delete a bounty',
  BHB012: 'Only open bounties can be deleted',
  BHB013: 'This bounty is not available for assignment',
  BHB014: 'You cannot assign your own bounty to yourself',
  BHB015: 'Only in-progress bounties can be released',
  BHB016: 'You do not have permission to release this bounty',
  BHB017: 'User with ID {id} not found',
}
/**
 * Thrown when a landmarks operation fails.
 */
export class BountiesException extends CustomException {
  constructor(
    errorCode: string,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    id?: string,
    details?: unknown,
  ) {
    const message = errorCodes[errorCode].replace('{id}', id ?? '')
    super(message, status, details, errorCode)
  }
}
