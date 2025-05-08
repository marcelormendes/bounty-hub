import { Injectable, Logger, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { GithubException } from '../../common/exceptions/github.exception'

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name)
  private appOctokit: Octokit

  constructor(
    private readonly configService: ConfigService,
  ) {
    // Initialize the GitHub App client
    this.initializeAppClient()
  }

  private initializeAppClient() {
    const appId = this.configService.get<string>('GITHUB_APP_ID')
    const privateKey = this.configService.get<string>('GITHUB_APP_PRIVATE_KEY')
    
    if (!appId || !privateKey) {
      throw new GithubException('GHA100', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    try {
      this.appOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId,
          privateKey,
          clientId: this.configService.get<string>('GITHUB_APP_CLIENT_ID'),
          clientSecret: this.configService.get<string>('GITHUB_APP_CLIENT_SECRET'),
        },
      })
      this.logger.log('GitHub App client initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize GitHub App client', error)
      throw new GithubException('GHA101', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Get an installation access token for a specific installation
   */
  async getInstallationOctokit(installationId: number): Promise<Octokit> {
    try {
      const { token } = await this.appOctokit.auth({
        type: 'installation',
        installationId,
      })

      return new Octokit({ auth: token })
    } catch (error) {
      this.logger.error(`Failed to get installation token for ID ${installationId}`, error)
      throw new GithubException('GHA102', HttpStatus.UNAUTHORIZED, { id: installationId })
    }
  }

  /**
   * Get information about a GitHub App installation
   */
  async getInstallation(installationId: number) {
    try {
      const response = await this.appOctokit.apps.getInstallation({
        installation_id: installationId,
      })
      return response.data
    } catch (error) {
      this.logger.error(`Failed to get installation for ID ${installationId}`, error)
      throw new GithubException('GHA201', HttpStatus.NOT_FOUND, { id: installationId })
    }
  }

  /**
   * Get a repository from a specific installation
   */
  async getRepository(installationId: number, owner: string, repo: string) {
    try {
      const octokit = await this.getInstallationOctokit(installationId)
      const response = await octokit.repos.get({ owner, repo })
      return response.data
    } catch (error) {
      this.logger.error(`Failed to get repository ${owner}/${repo}`, error)
      throw new GithubException('GHA300', HttpStatus.NOT_FOUND, { repo: `${owner}/${repo}` })
    }
  }

  /**
   * Get an issue from a specific repository
   */
  async getIssue(installationId: number, owner: string, repo: string, issueNumber: number) {
    try {
      const octokit = await this.getInstallationOctokit(installationId)
      const response = await octokit.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      })
      return response.data
    } catch (error) {
      this.logger.error(`Failed to get issue #${issueNumber} in ${owner}/${repo}`, error)
      throw new GithubException('GHA400', HttpStatus.NOT_FOUND, { issue_number: issueNumber })
    }
  }

  /**
   * Add a comment to an issue
   */
  async addIssueComment(
    installationId: number,
    owner: string,
    repo: string,
    issueNumber: number,
    body: string,
  ) {
    try {
      const octokit = await this.getInstallationOctokit(installationId)
      const response = await octokit.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body,
      })
      return response.data
    } catch (error) {
      this.logger.error(`Failed to add comment to issue #${issueNumber} in ${owner}/${repo}`, error)
      throw new GithubException('GHA403', HttpStatus.BAD_REQUEST, { issue_number: issueNumber })
    }
  }
}