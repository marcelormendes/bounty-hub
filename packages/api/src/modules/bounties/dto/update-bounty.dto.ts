import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { BountyStatus, BountyType } from '@prisma/client';
import { z } from 'zod';

// Use .partial() to make all fields optional for update
const UpdateBountySchema = z
  .object({
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
      example: 100.00,
    }),
    status: extendApi(z.nativeEnum(BountyStatus), {
      description: 'The current status of the bounty',
      example: BountyStatus.OPEN,
    }),
    githubIssueUrl: extendApi(z.string().url(), {
      description: 'URL to the related GitHub issue',
      example: 'https://github.com/org/repo/issues/1',
    }),
    githubPRUrl: extendApi(z.string().url(), {
      description: 'URL to the related GitHub pull request',
      example: 'https://github.com/org/repo/pull/2',
    }),
    attachments: extendApi(z.array(z.string()), {
      description: 'List of attachment URLs or identifiers',
    }),
  })
  .partial(); // Make all fields optional

export class UpdateBountyDto extends createZodDto(UpdateBountySchema) {}
