import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateClientFromGithubDto } from './dto/create-client-from-github.dto'
import { Client } from '@prisma/client'

@Injectable()
export class GithubService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new client from GitHub App installation
   */
  async createClientFromGithub(
    createClientDto: CreateClientFromGithubDto,
  ): Promise<Client> {
    const {
      installationId,
      accountId,
      accountLogin,
      accountType,
      email,
      name,
      website,
    } = createClientDto

    // Check if a client with this installation ID already exists
    const existingClient = await this.prisma.client.findUnique({
      where: { githubInstallationId: installationId },
    })

    if (existingClient) {
      // Update the client with new information
      return this.prisma.client.update({
        where: { id: existingClient.id },
        data: {
          email,
          name,
          website,
          githubAccountId: accountId,
          githubAccountLogin: accountLogin,
          githubAccountType: accountType,
          updatedAt: new Date(),
        },
      })
    }

    // Create a new client
    return this.prisma.client.create({
      data: {
        email,
        name,
        website,
        githubInstallationId: installationId,
        githubAccountId: accountId,
        githubAccountLogin: accountLogin,
        githubAccountType: accountType,
      },
    })
  }

  /**
   * Get a client by GitHub installation ID
   */
  async getClientByInstallationId(
    installationId: number,
  ): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { githubInstallationId: installationId },
    })
  }

  /**
   * Delete GitHub installation information from client
   */
  async removeGithubInstallation(
    installationId: number,
  ): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { githubInstallationId: installationId },
    })

    if (!client) {
      return null
    }

    return this.prisma.client.update({
      where: { id: client.id },
      data: {
        githubInstallationId: null,
        githubAccountId: null,
        githubAccountLogin: null,
        githubAccountType: null,
      },
    })
  }
}
