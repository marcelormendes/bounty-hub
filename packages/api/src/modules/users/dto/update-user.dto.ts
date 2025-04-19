import { createZodDto } from '@anatine/zod-nestjs'
import { extendApi } from '@anatine/zod-openapi'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

// Use .partial() to make all fields optional for update
const UpdateUserSchema = z.object({
  email: extendApi(z.string().email().optional(), {
    description: 'User email address',
    example: 'john@example.com',
  }),
  firstName: extendApi(z.string().optional(), {
    description: 'User first name',
    example: 'John',
  }),
  lastName: extendApi(z.string().optional(), {
    description: 'User last name',
    example: 'Doe',
  }),
  // password field removed
  role: extendApi(z.nativeEnum(UserRole).optional(), {
    description: 'User role',
    example: UserRole.DEVELOPER,
  }),
  profileImage: extendApi(z.string().optional(), {
    description: 'URL or identifier for the user profile image',
    example: 'https://example.com/images/profile.jpg',
  }),
  bio: extendApi(z.string().optional(), {
    description: 'Short user biography',
    example: 'Experienced software engineer with 5 years in web development.',
  }),
  githubUrl: extendApi(z.string().url().optional(), {
    description: 'URL to the user GitHub profile',
    example: 'https://github.com/username',
  }),
  portfolioUrl: extendApi(z.string().url().optional(), {
    description: 'URL to the user portfolio website',
    example: 'https://portfolio.example.com',
  }),
})

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
