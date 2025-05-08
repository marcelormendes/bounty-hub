import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const createBountySchema = z.object({
  installationId: z.number(),
  owner: z.string(),
  repo: z.string(),
  issueNumber: z.number(),
  amount: z.number().min(5), // Minimum bounty amount
  currency: z.string().default('USD'),
})

export type CreateBountyDto = z.infer<typeof createBountySchema>

export class CreateBountyDto implements z.infer<typeof createBountySchema> {
  @ApiProperty({ description: 'GitHub App installation ID' })
  installationId: number

  @ApiProperty({ description: 'Repository owner' })
  owner: string

  @ApiProperty({ description: 'Repository name' })
  repo: string

  @ApiProperty({ description: 'Issue number' })
  issueNumber: number

  @ApiProperty({ description: 'Bounty amount' })
  amount: number

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  currency: string = 'USD'
}