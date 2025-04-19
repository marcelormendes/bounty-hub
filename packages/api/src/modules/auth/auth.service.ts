import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js' // Import Supabase User type
import { ConfigService } from '@nestjs/config' // Import ConfigService
import { AuthException } from './auth.exception'

@Injectable()
export class AuthService {
  private supabase: SupabaseClient // Declare Supabase client instance variable

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService, // Inject ConfigService
  ) {
    // Initialize Supabase client
    if (
      !this.configService.get<string>('SUPABASE_URL') ||
      !this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')
    ) {
      // BH002: Supabase configuration is missing
      throw new AuthException('BH002')
    }
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  // Validate user based on Supabase JWT token
  async validateUserByToken(token: string): Promise<any> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token)
    if (error || !user) {
      // BH001: Invalid or expired token
      throw new AuthException('BH001')
    }
    // Optionally: Fetch user details from your own database if needed
    // const appUser = await this.usersService.findOneById(user.id);
    // if (!appUser) {
    //   throw new UnauthorizedException('User not found in application database');
    // }
    return user // Return Supabase user object
  }

  // Generate application-specific JWT if needed, or rely on Supabase token
  generateAppToken(user: User) {
    // Use the imported User type
    const payload = {
      email: user.email, // Access should be safe now
      sub: user.id, // Access should be safe now /* add other relevant claims */
    }
    return {
      accessToken: this.jwtService.sign(payload),
    }
  }

  // Login and Register methods are removed as they are handled by Supabase on the frontend.
  // The backend only needs to validate the token provided by the frontend.
}
