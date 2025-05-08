import { Module } from '@nestjs/common'
import { GithubService } from './github.service'
import { GithubController } from './github.controller'
import { ApiService } from '../../common/services/api.service'

@Module({
  providers: [GithubService, ApiService],
  controllers: [GithubController],
  exports: [GithubService],
})
export class GithubModule {}