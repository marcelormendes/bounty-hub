import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import { GithubException } from '../exceptions/github.exception'
import { HttpStatus } from '@nestjs/common'

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name)
  private readonly apiClient: AxiosInstance
  private readonly apiBaseUrl: string
  private readonly apiKey: string

  constructor(private readonly configService: ConfigService) {
    this.apiBaseUrl = this.configService.get<string>('BOUNTY_HUB_API_URL') || 'http://localhost:4000'
    this.apiKey = this.configService.get<string>('BOUNTY_HUB_API_KEY') || ''
    
    if (!this.apiKey) {
      this.logger.warn('No API key configured. API requests may fail authorization.')
    }

    this.apiClient = axios.create({
      baseURL: this.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    // Add request/response interceptors for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        this.logger.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    this.apiClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`API Response: ${response.status} ${response.statusText}`)
        return response
      },
      (error) => {
        this.logger.error('API Response Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Create a client from GitHub installation
   */
  async createClient(data: {
    installationId: number
    accountId: number
    accountLogin: string
    accountType: string
    email: string
    name: string
    website?: string
  }) {
    try {
      const response = await this.apiClient.post('/github/installation', data)
      return response.data
    } catch (error) {
      this.logger.error(`Failed to create client for installation ${data.installationId}`, error)
      throw new GithubException('GHA603', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Get a client by GitHub installation ID
   */
  async getClientByInstallationId(installationId: number) {
    try {
      const response = await this.apiClient.get(`/github/client/${installationId}`)
      return response.data
    } catch (error) {
      this.logger.error(`Failed to get client for installation ${installationId}`, error)
      return null
    }
  }

  /**
   * Remove GitHub installation from a client
   */
  async removeGithubInstallation(installationId: number) {
    try {
      const response = await this.apiClient.post(`/github/installation/${installationId}/remove`)
      return response.data
    } catch (error) {
      this.logger.error(`Failed to remove installation ${installationId} from client`, error)
      return null
    }
  }

  /**
   * Create a bounty from a GitHub issue
   */
  async createBounty(data: {
    clientId: string
    installationId: number
    owner: string
    repo: string
    issueNumber: number
    issueTitle: string
    issueBody: string
    issueUrl: string
    reward: number
    labels?: string[]
    deadline?: string
  }) {
    try {
      const response = await this.apiClient.post('/bounties/github', data)
      return response.data
    } catch (error) {
      this.logger.error(`Failed to create bounty for issue #${data.issueNumber}`, error)
      throw new GithubException('GHA600', HttpStatus.INTERNAL_SERVER_ERROR, {
        issue_number: data.issueNumber,
      })
    }
  }

  /**
   * Get a bounty by GitHub issue URL
   */
  async getBountyByGithubUrl(githubIssueUrl: string) {
    try {
      const response = await this.apiClient.get('/bounties', {
        params: {
          githubIssueUrl,
        },
      })
      
      // The API returns an array, we expect at most one match
      const bounties = response.data
      return bounties.length > 0 ? bounties[0] : null
    } catch (error) {
      this.logger.error(`Failed to get bounty for GitHub URL: ${githubIssueUrl}`, error)
      return null
    }
  }

  /**
   * Update a bounty status
   */
  async updateBountyStatus(bountyId: string, status: string) {
    try {
      const response = await this.apiClient.patch(`/bounties/${bountyId}`, {
        status,
      })
      return response.data
    } catch (error) {
      this.logger.error(`Failed to update bounty ${bountyId} status to ${status}`, error)
      throw new GithubException('GHA601', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Get all clients
   */
  async getClients() {
    try {
      const response = await this.apiClient.get('/clients')
      return response.data
    } catch (error) {
      this.logger.error('Failed to get clients', error)
      throw new GithubException('GHA603', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Get a client by ID
   */
  async getClientById(clientId: string) {
    try {
      const response = await this.apiClient.get(`/clients/${clientId}`)
      return response.data
    } catch (error) {
      this.logger.error(`Failed to get client ${clientId}`, error)
      return null
    }
  }
}