import { Injectable, Logger, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GithubService } from '../github/github.service'
import { CreateBountyDto } from './dto/create-bounty.dto'
import { GithubException } from '../../common/exceptions/github.exception'
import { ApiService } from '../../common/services/api.service'

@Injectable()
export class IssuesService {
  private readonly logger = new Logger(IssuesService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly githubService: GithubService,
    private readonly apiService: ApiService,
  ) {}

  /**
   * Create a new bounty for a GitHub issue
   */
  async createBounty(createBountyDto: CreateBountyDto) {
    const { installationId, owner, repo, issueNumber, amount, currency } = createBountyDto

    try {
      // Get the GitHub issue
      const issue = await this.githubService.getIssue(
        installationId,
        owner,
        repo,
        issueNumber,
      )

      // Check if a bounty already exists for this issue
      const existingBounty = await this.apiService.getBountyByGithubUrl(issue.html_url)

      if (existingBounty) {
        throw new GithubException('GHA602', HttpStatus.CONFLICT, { issue_number: issueNumber })
      }

      // Get client by installation ID
      const client = await this.apiService.getClientByInstallationId(installationId)
      
      if (!client) {
        throw new GithubException('GHA604', HttpStatus.NOT_FOUND, { installation_id: installationId })
      }

      // Create the bounty using the API
      const bounty = await this.apiService.createBounty({
        clientId: client.id,
        installationId,
        owner,
        repo,
        issueNumber,
        issueTitle: issue.title,
        issueBody: issue.body || '',
        issueUrl: issue.html_url,
        reward: amount,
        labels: ['github-integration'],
      })

      // Add a comment to the issue about the bounty
      await this.githubService.addIssueComment(
        installationId,
        owner,
        repo,
        issueNumber,
        this.generateBountyComment(amount, currency, bounty.id),
      )

      return { bounty }
    } catch (error) {
      if (error instanceof GithubException) {
        throw error
      }
      this.logger.error(`Failed to create bounty for issue #${issueNumber}`, error)
      throw new GithubException('GHA600', HttpStatus.INTERNAL_SERVER_ERROR, {
        issue_number: issueNumber,
      })
    }
  }

  /**
   * Generate a comment to add to the GitHub issue
   */
  private generateBountyComment(amount: number, currency: string, bountyId: string): string {
    const bountyUrl = `${this.configService.get<string>('BOUNTY_HUB_URL') || 'https://bounty-hub.com'}/bounties/${bountyId}`
    
    return `
🤠 **Bounty Created: ${amount} ${currency}**

This issue is now available as a bounty on Bounty Hub! 

Interested in working on this issue? Claim the bounty here: [Bounty Hub - #${bountyId}](${bountyUrl})

Happy coding, partner! 🌵
`
  }

  /**
   * Handle issue updates
   */
  async handleIssueUpdate(
    installationId: number,
    owner: string,
    repo: string,
    issueNumber: number,
    issueData: any,
  ) {
    try {
      // Check if there's a bounty for this issue
      const issue = await this.githubService.getIssue(
        installationId,
        owner,
        repo,
        issueNumber,
      )
      
      const bounty = await this.apiService.getBountyByGithubUrl(issue.html_url)

      // If we don't have a bounty for this issue, do nothing
      if (!bounty) {
        return { updated: false }
      }

      // Update the bounty details via API if title/description changed
      if (issueData.title !== bounty.title || issueData.body !== bounty.description) {
        await this.apiService.updateBountyStatus(bounty.id, bounty.status)
      }

      return { updated: true }
    } catch (error) {
      this.logger.error(`Failed to handle update for issue #${issueNumber}`, error)
      return { updated: false, error: 'Failed to update bounty' }
    }
  }

  /**
   * Handle issue close event
   */
  async handleIssueClosed(
    installationId: number,
    owner: string,
    repo: string,
    issueNumber: number,
  ) {
    try {
      // Get the issue
      const issue = await this.githubService.getIssue(
        installationId,
        owner,
        repo,
        issueNumber,
      )
      
      // Check if there's a bounty for this issue
      const bounty = await this.apiService.getBountyByGithubUrl(issue.html_url)

      // If we don't have a bounty for this issue, do nothing
      if (!bounty) {
        return { updated: false }
      }

      // Update the bounty status to COMPLETED
      await this.apiService.updateBountyStatus(bounty.id, 'COMPLETED')

      return { updated: true }
    } catch (error) {
      this.logger.error(`Failed to handle close for issue #${issueNumber}`, error)
      return { updated: false, error: 'Failed to update bounty' }
    }
  }

  /**
   * Handle issue reopen event
   */
  async handleIssueReopened(
    installationId: number,
    owner: string,
    repo: string,
    issueNumber: number,
  ) {
    try {
      // Get the issue
      const issue = await this.githubService.getIssue(
        installationId,
        owner,
        repo,
        issueNumber,
      )
      
      // Check if there's a bounty for this issue
      const bounty = await this.apiService.getBountyByGithubUrl(issue.html_url)

      // If we don't have a bounty for this issue, do nothing
      if (!bounty) {
        return { updated: false }
      }

      // Update the bounty status to OPEN
      await this.apiService.updateBountyStatus(bounty.id, 'OPEN')

      return { updated: true }
    } catch (error) {
      this.logger.error(`Failed to handle reopen for issue #${issueNumber}`, error)
      return { updated: false, error: 'Failed to update bounty' }
    }
  }

  /**
   * Handle issue comments for bounty commands
   */
  async handleIssueComment(
    installationId: number,
    owner: string,
    repo: string,
    issueNumber: number,
    comment: any,
  ) {
    try {
      // Check if the comment contains a bounty command
      const content = comment.body.toLowerCase()
      
      // Example command: /bounty 100 USD
      const bountyMatch = content.match(/\/bounty\s+(\d+)(?:\s+([a-z]{3}))?/i)
      
      if (bountyMatch) {
        const amount = parseFloat(bountyMatch[1])
        const currency = (bountyMatch[2] || 'USD').toUpperCase()
        
        // Create a bounty for this issue
        return await this.createBounty({
          installationId,
          owner,
          repo,
          issueNumber,
          amount,
          currency,
        })
      }
      
      return { processed: false }
    } catch (error) {
      this.logger.error(`Failed to process comment on issue #${issueNumber}`, error)
      return { processed: false, error: error.message }
    }
  }
}