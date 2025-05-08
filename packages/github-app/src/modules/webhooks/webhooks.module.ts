import { Module } from '@nestjs/common'
import { WebhooksService } from './webhooks.service'
import { WebhooksController } from './webhooks.controller'
import { GithubModule } from '../github/github.module'
import { IssuesModule } from '../issues/issues.module'

@Module({
  imports: [GithubModule, IssuesModule],
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}