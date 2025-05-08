import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { z } from 'zod'

const CreateClientFromGithubSchema = z.object({
  installationId: extendApi(z.number(), {
    description: 'GitHub App installation ID',
    example: 12345678,
  }),
  accountId: extendApi(z.number(), {
    description: 'GitHub account ID',
    example: 87654321,
  }),
  accountLogin: extendApi(z.string(), {
    description: 'GitHub account login name',
    example: 'acme-corp',
  }),
  accountType: extendApi(z.enum(['User', 'Organization']), {
    description: 'Type of GitHub account (User or Organization)',
    example: 'Organization',
  }),
  email: extendApi(z.string().email(), {
    description: 'Contact email for the client',
    example: 'support@acme-corp.com',
  }),
  name: extendApi(z.string(), {
    description: 'Client name',
    example: 'ACME Corporation',
  }),
  website: extendApi(z.string().url().optional(), {
    description: 'Client website URL',
    example: 'https://acme-corp.com',
  }),
})

export class CreateClientFromGithubDto extends createZodDto(
  CreateClientFromGithubSchema,
) {}
