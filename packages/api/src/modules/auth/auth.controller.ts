import { Controller, Get, UseGuards, Request } from '@nestjs/common' // Added Get, UseGuards, Request
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger' // Added ApiBearerAuth
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard' // Import the guard

// Define an interface for the user payload attached by JwtStrategy
interface AuthenticatedRequest extends Request {
  user: {
    userId: string
    email: string
    role: string // Adjust type if role is an enum or different type
  }
}

// LoginDto and CreateUserDto removed as endpoints are removed

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Removed login and register endpoints as auth is handled by Supabase frontend

  @Get('profile')
  @UseGuards(JwtAuthGuard) // Protect this route with JWT guard
  @ApiBearerAuth() // Indicate that Bearer token is required in Swagger
  @ApiOperation({ summary: 'Get authenticated user profile' })
  getProfile(@Request() req: AuthenticatedRequest) {
    // Apply the interface type
    // req.user is populated by JwtStrategy.validate and now typed
    return req.user
    // Optionally, you could use req.user.userId to fetch more details
    // from your UsersService if needed.
  }
}
