import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const CreateUserSchema = z.object({
  email: extendApi(z.string().email(), {
    description: 'User email address',
    example: 'john@example.com',
  }),
  firstName: extendApi(z.string().min(1), {
    description: 'User first name',
    example: 'John',
  }),
  lastName: extendApi(z.string().min(1), {
    description: 'User last name',
    example: 'Doe',
  }),
  password: extendApi(z.string().min(8), {
    description: 'User password (min 8 characters)',
    example: 'password123',
  }),
  role: extendApi(z.nativeEnum(UserRole).optional(), {
    description: 'User role',
    example: UserRole.DEVELOPER,
  }),
  profileImage: extendApi(z.string().optional(), {
    description: 'URL or identifier for the user profile image',
  }),
  bio: extendApi(z.string().optional(), {
    description: 'Short user biography',
  }),
  // Assuming these should be URLs, adding .url() validation
  githubUrl: extendApi(z.string().url().optional(), {
    description: 'URL to the user GitHub profile',
  }),
  portfolioUrl: extendApi(z.string().url().optional(), {
    description: 'URL to the user portfolio website',
  }),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
