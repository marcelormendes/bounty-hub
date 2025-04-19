import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { z } from 'zod'

const LoginSchema = z.object({
  email: extendApi(z.string().email(), {
    description: 'User email address',
    example: 'john@example.com',
  }),
  password: extendApi(z.string().min(1), {
    description: 'User password',
    example: 'password123',
  }),
})

export class LoginDto extends createZodDto(LoginSchema) {}
