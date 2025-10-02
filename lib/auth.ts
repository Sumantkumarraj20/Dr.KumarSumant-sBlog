// lib/auth.ts
import { supabase } from './supabaseClient';
import { AuthFormData, AuthError } from '@/types/auth';

// Enhanced error handling for auth operations
class AuthService {
  private static handleAuthError(error: any): never {
    console.error('Auth operation failed:', error);
    
    let message = error.message || 'Authentication failed';
    let code = 'AUTH_ERROR';

    // Map common Supabase auth errors
    if (error.message?.includes('Invalid login credentials')) {
      message = 'Invalid email or password';
      code = 'INVALID_CREDENTIALS';
    } else if (error.message?.includes('Email not confirmed')) {
      message = 'Please verify your email address before signing in';
      code = 'EMAIL_NOT_VERIFIED';
    } else if (error.message?.includes('User already registered')) {
      message = 'An account with this email already exists';
      code = 'USER_EXISTS';
    } else if (error.message?.includes('Password should be at least')) {
      message = 'Password must be at least 6 characters long';
      code = 'WEAK_PASSWORD';
    } else if (error.message?.includes('Invalid email')) {
      message = 'Please enter a valid email address';
      code = 'INVALID_EMAIL';
    } else if (error.message?.includes('Email rate limit exceeded')) {
      message = 'Too many attempts. Please try again in a few minutes';
      code = 'RATE_LIMITED';
    }

    throw {
      code,
      message,
      originalError: error,
    } as AuthError;
  }

  static async signUp(email: string, password: string, fullName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName?.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('User creation failed - no user data returned');
      }

      // Don't wait for profile creation - it will be handled by the auth context
      return {
        user: data.user,
        session: data.session,
        needsEmailVerification: !data.session, // No session means email verification required
      };
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Sign in failed - no user data returned');
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        // Allow login but warn about email verification
        console.warn('User logged in with unverified email:', data.user.email);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  static async signInWithGoogle(redirectTo?: string) {
    try {
      const state = redirectTo ? btoa(JSON.stringify({ redirectTo })) : undefined;
      const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
      
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile',
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  static async resendVerificationEmail(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }
}

// Export individual functions for backward compatibility
export const signUp = AuthService.signUp;
export const signIn = AuthService.signIn;
export const signInWithGoogle = AuthService.signInWithGoogle;
export const resendVerificationEmail = AuthService.resendVerificationEmail;
export const resetPassword = AuthService.resetPassword;
export const updatePassword = AuthService.updatePassword;

export default AuthService;