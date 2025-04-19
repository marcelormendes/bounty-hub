import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { BountyType } from '@prisma/client'
import { z } from 'zod'

const CreateBountySchema = z.object({
  title: extendApi(z.string().min(1), {
    description: 'The title of the bounty',
    example: 'Fix login bug',
  }),
  description: extendApi(z.string().min(1), {
    description: 'A detailed description of the bounty task',
    example: 'The login form is not submitting correctly...',
  }),
  type: extendApi(z.nativeEnum(BountyType), {
    description: 'The type of the bounty',
    example: BountyType.DEVELOPMENT,
  }),
  price: extendApi(z.number().min(1), {
    description: 'The price offered for completing the bounty',
    example: 100.0,
  }),
  githubIssueUrl: extendApi(z.string().url().optional(), {
    description: 'Optional URL to the related GitHub issue',
    example: 'https://github.com/org/repo/issues/1',
  }),
  attachments: extendApi(z.array(z.string()).optional(), {
    description: 'Optional list of attachment URLs or identifiers',
  }),
})

export class CreateBountyDto extends createZodDto(CreateBountySchema) {}
