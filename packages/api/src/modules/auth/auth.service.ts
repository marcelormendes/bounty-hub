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
      throw new AuthException('BH001')
    }

    return user
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
}
