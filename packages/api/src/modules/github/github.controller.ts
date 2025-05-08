import { Body, Controller, Post, HttpCode, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { GithubService } from './github.service'
import { CreateClientFromGithubDto } from './dto/create-client-from-github.dto'

@ApiTags('github')
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Post('installation')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create a new client from GitHub App installation' })
  async createClientFromGithub(
    @Body() createClientDto: CreateClientFromGithubDto,
  ) {
    return this.githubService.createClientFromGithub(createClientDto)
  }

  @Get('client/:installationId')
  @ApiOperation({ summary: 'Get client by GitHub installation ID' })
  @ApiParam({ name: 'installationId', description: 'GitHub installation ID' })
  async getClientByInstallationId(
    @Param('installationId') installationId: string,
  ) {
    return this.githubService.getClientByInstallationId(
      parseInt(installationId, 10),
    )
  }
}
