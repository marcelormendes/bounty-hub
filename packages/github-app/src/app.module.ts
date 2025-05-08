import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GithubModule } from './modules/github/github.module'
import { IssuesModule } from './modules/issues/issues.module'
import { WebhooksModule } from './modules/webhooks/webhooks.module'
import { ApiService } from './common/services/api.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GithubModule,
    IssuesModule,
    WebhooksModule,
  ],
  providers: [ApiService],
  exports: [ApiService],
})
export class AppModule {}