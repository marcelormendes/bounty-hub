import { Injectable, Logger, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Webhooks } from '@octokit/webhooks'
import { GithubService } from '../github/github.service'
import { IssuesService } from '../issues/issues.service'
import { GithubException } from '../../common/exceptions/github.exception'
import { ApiService } from '../../common/services/api.service'

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)
  private webhooks: Webhooks

  constructor(
    private readonly configService: ConfigService,
    private readonly githubService: GithubService,
    private readonly issuesService: IssuesService,
    private readonly apiService: ApiService,
  ) {
    // Initialize the webhooks handler
    this.initializeWebhooks()
  }

  private initializeWebhooks() {
    const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET')
    
    if (!secret) {
      this.logger.warn('GITHUB_WEBHOOK_SECRET is not set, webhook signatures will not be verified')
    }

    this.webhooks = new Webhooks({
      secret,
    })

    // Register webhook event handlers
    this.registerEventHandlers()
  }

  private registerEventHandlers() {
    // Handle app installation events
    this.webhooks.on('installation.created', async ({ payload }) => {
      this.logger.log(`App installed on account ${payload.installation.account.login}`)
      
      try {
        // Extract the necessary information
        const installation = payload.installation
        const account = installation.account
        
        // Create a client in the API
        await this.apiService.createClient({
          installationId: installation.id,
          accountId: account.id,
          accountLogin: account.login,
          accountType: account.type,
          // Default email and name (the user will update these later)
          email: `${account.login}@github.com`,
          name: account.login,
          website: account.html_url,
        })
        
        this.logger.log(`Created client for installation ${installation.id}`)
      } catch (error) {
        this.logger.error(`Failed to create client for installation`, error)
      }
    })

    this.webhooks.on('installation.deleted', async ({ payload }) => {
      this.logger.log(`App uninstalled from account ${payload.installation.account.login}`)
      
      try {
        // Remove GitHub installation information from client
        await this.apiService.removeGithubInstallation(payload.installation.id)
        
        this.logger.log(`Removed GitHub installation ${payload.installation.id} from client`)
      } catch (error) {
        this.logger.error(`Failed to remove GitHub installation from client`, error)
      }
    })

    // Handle issue events
    this.webhooks.on('issues.opened', async ({ payload }) => {
      this.logger.log(`New issue opened: ${payload.issue.title}`)
      // We don't create bounties automatically, just log the new issue
    })

    this.webhooks.on('issues.edited', async ({ payload }) => {
      this.logger.log(`Issue edited: ${payload.issue.title}`)
      // Check if this issue has a bounty and update if needed
      await this.issuesService.handleIssueUpdate(
        payload.installation.id,
        payload.repository.owner.login,
        payload.repository.name,
        payload.issue.number,
        payload.issue,
      )
    })

    this.webhooks.on('issues.closed', async ({ payload }) => {
      this.logger.log(`Issue closed: ${payload.issue.title}`)
      // Update bounty status if applicable
      await this.issuesService.handleIssueClosed(
        payload.installation.id,
        payload.repository.owner.login,
        payload.repository.name,
        payload.issue.number,
      )
    })

    this.webhooks.on('issues.reopened', async ({ payload }) => {
      this.logger.log(`Issue reopened: ${payload.issue.title}`)
      // Update bounty status if applicable
      await this.issuesService.handleIssueReopened(
        payload.installation.id,
        payload.repository.owner.login,
        payload.repository.name,
        payload.issue.number,
      )
    })

    // Handle issue comment events
    this.webhooks.on('issue_comment.created', async ({ payload }) => {
      this.logger.log(`New comment on issue #${payload.issue.number}`)
      // Check if the comment contains bounty-related commands
      await this.issuesService.handleIssueComment(
        payload.installation.id,
        payload.repository.owner.login,
        payload.repository.name,
        payload.issue.number,
        payload.comment,
      )
    })

    this.logger.log('All webhook event handlers registered')
  }

  /**
   * Process a webhook event from GitHub
   */
  async handleWebhook(
    headers: Record<string, string | string[] | undefined>,
    payload: any,
  ) {
    try {
      const id = headers['x-github-delivery'] as string
      const name = headers['x-github-event'] as string
      const signature = headers['x-hub-signature-256'] as string

      if (!id || !name) {
        throw new GithubException('GHA500', HttpStatus.BAD_REQUEST)
      }

      // Verify webhook signature if secret is configured
      const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET')
      if (secret && signature) {
        try {
          await this.webhooks.verify(payload, signature)
        } catch (error) {
          throw new GithubException('GHA501', HttpStatus.UNAUTHORIZED)
        }
      }

      // Process the webhook event
      await this.webhooks.receive({
        id,
        name,
        payload,
      })

      return { success: true, event: name }
    } catch (error) {
      if (error instanceof GithubException) {
        throw error
      }
      this.logger.error('Error processing webhook', error)
      throw new GithubException('GHA500', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}