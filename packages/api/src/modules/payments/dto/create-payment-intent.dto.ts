import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const CreatePaymentIntentSchema = z.object({
  bountyId: extendApi(z.string().uuid(), {
    description: 'Unique identifier of the bounty to create payment intent for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
});

export class CreatePaymentIntentDto extends createZodDto(CreatePaymentIntentSchema) {}