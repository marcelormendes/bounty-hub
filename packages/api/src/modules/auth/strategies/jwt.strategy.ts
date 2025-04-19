import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
// UsersService is removed as validation relies on Supabase JWT payload

// Define interface for the expected JWT payload structure
interface JwtPayload {
  sub: string
  email: string
  role: string // Adjust if necessary
  // Add other fields if present in the Supabase JWT and needed
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    // UsersService removed
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use Supabase JWT secret from environment variables
      secretOrKey: configService.getOrThrow('SUPABASE_JWT_SECRET'),
    })
  }

  // The payload is the decoded Supabase JWT
  validate(payload: JwtPayload) {
    // Remove async, apply JwtPayload type
    // The payload itself contains the validated user information from Supabase.
    // We just need to ensure it has the necessary fields, like 'sub' for user ID.
    // Type guard ensures payload and sub exist
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid JWT payload')
    }
    // Return the essential parts of the payload (or the whole payload)
    // This will be attached to request.user
    // Properties are now safely accessed due to JwtPayload type
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role, // Adjust based on actual Supabase payload structure
    }
  }
}
