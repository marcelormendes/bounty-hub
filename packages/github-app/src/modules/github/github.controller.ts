import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common'
import { GithubService } from './github.service'
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger'

@ApiTags('github')
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('installation/:id')
  @ApiOperation({ summary: 'Get GitHub App installation details' })
  @ApiParam({ name: 'id', description: 'Installation ID' })
  async getInstallation(@Param('id') id: string) {
    const installationId = parseInt(id, 10)
    const installation = await this.githubService.getInstallation(installationId)
    return { installation }
  }

  @Get('repository/:installationId/:owner/:repo')
  @ApiOperation({ summary: 'Get repository information' })
  @ApiParam({ name: 'installationId', description: 'Installation ID' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  async getRepository(
    @Param('installationId') installationId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const repository = await this.githubService.getRepository(
      parseInt(installationId, 10),
      owner,
      repo,
    )
    return { repository }
  }

  @Get('issue/:installationId/:owner/:repo/:issueNumber')
  @ApiOperation({ summary: 'Get issue information' })
  @ApiParam({ name: 'installationId', description: 'Installation ID' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'issueNumber', description: 'Issue number' })
  async getIssue(
    @Param('installationId') installationId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('issueNumber') issueNumber: string,
  ) {
    const issue = await this.githubService.getIssue(
      parseInt(installationId, 10),
      owner,
      repo,
      parseInt(issueNumber, 10),
    )
    return { issue }
  }

  @Post('issue/:installationId/:owner/:repo/:issueNumber/comment')
  @ApiOperation({ summary: 'Add a comment to an issue' })
  @ApiParam({ name: 'installationId', description: 'Installation ID' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'issueNumber', description: 'Issue number' })
  async addIssueComment(
    @Param('installationId') installationId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('issueNumber') issueNumber: string,
    @Body() data: { body: string },
  ) {
    const comment = await this.githubService.addIssueComment(
      parseInt(installationId, 10),
      owner,
      repo,
      parseInt(issueNumber, 10),
      data.body,
    )
    return { comment }
  }
}