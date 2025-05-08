import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common'
import { IssuesService } from './issues.service'
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger'
import { CreateBountyDto } from './dto/create-bounty.dto'

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post('bounty')
  @ApiOperation({ summary: 'Create a bounty for a GitHub issue' })
  async createBounty(@Body() createBountyDto: CreateBountyDto) {
    return this.issuesService.createBounty(createBountyDto)
  }

  @Post('comment/:installationId/:owner/:repo/:issueNumber')
  @ApiOperation({ summary: 'Process a comment on a GitHub issue' })
  @ApiParam({ name: 'installationId', description: 'Installation ID' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'issueNumber', description: 'Issue number' })
  async processComment(
    @Param('installationId') installationId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('issueNumber') issueNumber: string,
    @Body() data: { body: string },
  ) {
    const comment = { body: data.body }
    return this.issuesService.handleIssueComment(
      parseInt(installationId, 10),
      owner,
      repo,
      parseInt(issueNumber, 10),
      comment,
    )
  }
}