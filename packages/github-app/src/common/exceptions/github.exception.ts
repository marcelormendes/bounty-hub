import { HttpStatus } from '@nestjs/common'
import { CustomException } from './custom.exceptions'

/**
 * Error codes for the GitHub App integration
 * Organized by categories with specific ranges
 */
export const githubErrorCodes = Object.freeze({
  // Authentication Errors (100-199)
  GHA100: 'GitHub App credentials are missing or invalid',
  GHA101: 'Failed to authenticate with GitHub',
  GHA102: 'Invalid installation ID or permission denied',
  GHA103: 'Missing required token for this operation',
  
  // Installation Errors (200-299)
  GHA200: 'Failed to install GitHub App',
  GHA201: 'GitHub App installation not found for ID: {id}',
  GHA202: 'Failed to uninstall GitHub App',
  
  // Repository Errors (300-399)
  GHA300: 'Repository not found: {repo}',
  GHA301: 'No permission to access repository: {repo}',
  GHA302: 'Failed to fetch repository data',
  
  // Issue Errors (400-499)
  GHA400: 'Issue not found: {issue_number}',
  GHA401: 'Failed to fetch issue data',
  GHA402: 'Failed to update issue',
  GHA403: 'Failed to add comment to issue',
  
  // Webhook Errors (500-599)
  GHA500: 'Invalid webhook payload',
  GHA501: 'Webhook signature verification failed',
  GHA502: 'Unsupported webhook event type: {event_type}',
  
  // Bounty Integration Errors (600-699)
  GHA600: 'Failed to create bounty for issue: {issue_number}',
  GHA601: 'Failed to update bounty',
  GHA602: 'Bounty already exists for issue: {issue_number}',
  GHA603: 'Failed to communicate with Bounty Hub API',
  GHA604: 'No client found for installation ID: {installation_id}',
  
  // General Errors (900-999)
  GHA900: 'Unknown GitHub API error',
  GHA901: 'GitHub API rate limit exceeded',
  GHA999: 'Internal server error in GitHub App'
})

/**
 * GitHub-specific exception class
 * Provides detailed error messages with interpolated parameters
 */
export class GithubException extends CustomException {
  constructor(
    errorCode: keyof typeof githubErrorCodes,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: Record<string, unknown>,
  ) {
    let message = githubErrorCodes[errorCode]
    
    if (details) {
      Object.entries(details).forEach(([key, value]) => {
        message = message.replaceAll(`{${key}}`, String(value))
      })
    }
    
    super(message, status, details, errorCode)
  }
}