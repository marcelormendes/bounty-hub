import { Controller, Post, Headers, Body, RawBodyRequest, Req } from '@nestjs/common'
import { Request } from 'express'
import { WebhooksService } from './webhooks.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('github')
  @ApiOperation({ summary: 'Handle GitHub webhook events' })
  async handleGithubWebhook(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const payload = JSON.parse(request.body.toString())
    return this.webhooksService.handleWebhook(headers, payload)
  }
}