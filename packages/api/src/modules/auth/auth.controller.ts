import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

/**
 * Interface for authenticated requests with user data from JWT
 */
interface AuthenticatedRequest extends Request {
  user: {
    userId: string
    email: string
    role: string
  }
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user
  }
}