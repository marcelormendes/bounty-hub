import { Module } from '@nestjs/common'
import { IssuesService } from './issues.service'
import { IssuesController } from './issues.controller'
import { GithubModule } from '../github/github.module'
import { ApiService } from '../../common/services/api.service'

@Module({
  imports: [GithubModule],
  providers: [IssuesService, ApiService],
  controllers: [IssuesController],
  exports: [IssuesService],
})
export class IssuesModule {}