import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { z } from 'zod'

const CreateBountySchema = z.object({
  clientId: extendApi(z.string().uuid(), {
    description: 'The ID of the client',
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
  title: extendApi(z.string().min(1), {
    description: 'The title of the bounty',
    example: 'Fix login bug',
  }),
  description: extendApi(z.string().min(1), {
    description: 'A detailed description of the bounty task',
    example: 'The login form is not submitting correctly...',
  }),
  reward: extendApi(z.number().min(1), {
    description: 'The reward offered for completing the bounty',
    example: 100.0,
  }),
  githubIssueUrl: extendApi(z.string().url(), {
    description: 'Required GitHub Issue URL',
    example: 'https://github.com/org/repo/issues/1',
  }),
  labels: extendApi(z.array(z.string()).min(2), {
    description: 'At least two labels are required',
    example: ['bug', 'enhancement'],
  }),
  attachments: extendApi(z.array(z.string()).optional(), {
    description: 'Optional list of attachment URLs or identifiers',
  }),
  deadline: extendApi(z.string().datetime(), {
    description: 'The deadline for the bounty',
    example: '2025-05-01T12:00:00Z',
  }),
})

export class CreateBountyDto extends createZodDto(CreateBountySchema) {}
