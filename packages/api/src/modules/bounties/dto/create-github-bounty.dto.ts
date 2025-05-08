import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { z } from 'zod'

const CreateGithubBountySchema = z.object({
  clientId: extendApi(z.string().uuid(), {
    description: 'The ID of the client',
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
  installationId: extendApi(z.number(), {
    description: 'The GitHub App installation ID',
    example: 12345,
  }),
  owner: extendApi(z.string(), {
    description: 'The repository owner',
    example: 'bounty-hub',
  }),
  repo: extendApi(z.string(), {
    description: 'The repository name',
    example: 'bounty-hub',
  }),
  issueNumber: extendApi(z.number(), {
    description: 'The GitHub issue number',
    example: 42,
  }),
  issueTitle: extendApi(z.string(), {
    description: 'The GitHub issue title',
    example: 'Fix login bug',
  }),
  issueBody: extendApi(z.string(), {
    description: 'The GitHub issue body/description',
    example: 'The login form is not submitting correctly...',
  }),
  issueUrl: extendApi(z.string().url(), {
    description: 'The full GitHub issue URL',
    example: 'https://github.com/bounty-hub/bounty-hub/issues/42',
  }),
  reward: extendApi(z.number().min(1), {
    description: 'The reward offered for completing the bounty',
    example: 100.0,
  }),
  labels: extendApi(z.array(z.string()).default(['github-integration']), {
    description: 'Labels for the bounty, defaults to ["github-integration"]',
    example: ['bug', 'enhancement', 'github-integration'],
  }),
  deadline: extendApi(z.string().datetime().optional(), {
    description: 'Optional deadline for the bounty',
    example: '2025-05-01T12:00:00Z',
  }),
})

export class CreateGithubBountyDto extends createZodDto(
  CreateGithubBountySchema,
) {}
