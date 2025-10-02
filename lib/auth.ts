// lib/auth.ts
import { supabase } from "./supabaseClient";
import type { AuthError } from "@/types/auth";

/**
 * Stable, typed AuthService. Public API preserved (signUp, signIn, signInWithGoogle, resendVerificationEmail, resetPassword, updatePassword).
 * Throws AuthServiceError (extends Error) with `.code` and `.originalError` for reliable consumer handling.
 */

/* Minimal runtime error class so callers can rely on `.message` and `.code` */
class AuthServiceError extends Error implements Partial<AuthError> {
  code: string;
  originalError?: any;

  constructor(message: string, code = "AUTH_ERROR", originalError?: any) {
    super(message);
    this.name = "AuthServiceError";
    this.code = code;
    this.originalError = originalError;
  }
}

export default class AuthService {
  // Map Supabase messages (or other errors) to stable app codes/messages
  private static mapError(error: any) {
    const text = (error?.message ?? String(error ?? "")).toString();

    if (text.includes("Invalid login credentials")) {
      return { code: "INVALID_CREDENTIALS", message: "Invalid email or password." };
    }
    if (text.includes("Email not confirmed") || text.includes("email not confirmed")) {
      return { code: "EMAIL_NOT_VERIFIED", message: "Please verify your email address before signing in." };
    }
    if (text.includes("User already registered") || text.includes("already registered")) {
      return { code: "USER_EXISTS", message: "An account with this email already exists." };
    }
    if (text.includes("Password should be at least") || text.includes("Password must be at least")) {
      return { code: "WEAK_PASSWORD", message: "Password must meet the minimum requirements." };
    }
    if (text.includes("Invalid email")) {
      return { code: "INVALID_EMAIL", message: "Please enter a valid email address." };
    }
    if (text.includes("Email rate limit exceeded") || text.includes("Rate limit")) {
      return { code: "RATE_LIMITED", message: "Too many attempts. Please try again in a few minutes." };
    }

    // Fallback
    return { code: "AUTH_ERROR", message: error?.message ?? "Authentication failed" };
  }

  private static throwAuthError(error: any): never {
    // Convert any Supabase / network error into AuthServiceError
    const mapped = this.mapError(error);
    console.error("[AuthService] mapped auth error:", mapped, "raw:", error);
    throw new AuthServiceError(mapped.message, mapped.code, error);
  }

  static async signUp(email: string, password: string, fullName?: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: normalizedPassword,
        options: {
          data: {
            full_name: fullName?.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) this.throwAuthError(error);

      if (!data?.user) {
        throw new AuthServiceError("User creation failed - no user data returned", "NO_USER_RETURNED");
      }

      return {
        user: data.user,
        session: data.session,
        needsEmailVerification: !data.session, // stable flag for caller
      };
    } catch (err: any) {
      // normalize and rethrow
      if (err instanceof AuthServiceError) throw err;
      this.throwAuthError(err);
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      if (error) this.throwAuthError(error);

      if (!data?.user) {
        throw new AuthServiceError("Sign in failed - no user data returned", "NO_USER_RETURNED");
      }

      // Some Supabase setups will return no session if email verification is required.
      const emailVerified = Boolean((data.user as any)?.email_confirmed_at || (data.session && data.session.user?.email_confirmed_at));

      return {
        user: data.user,
        session: data.session,
        emailVerified,
      };
    } catch (err: any) {
      if (err instanceof AuthServiceError) throw err;
      this.throwAuthError(err);
    }
  }

  static async signInWithGoogle(redirectTo?: string) {
    try {
      const state = redirectTo ? btoa(JSON.stringify({ redirectTo })) : undefined;
      const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
      if (state) redirectUrl.searchParams.set("state", state);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl.toString(),
          queryParams: { access_type: "offline", prompt: "consent" },
          scopes: "email profile",
        },
      });

      if (error) this.throwAuthError(error);
      return { success: true };
    } catch (err: any) {
      if (err instanceof AuthServiceError) throw err;
      this.throwAuthError(err);
    }
  }

  static async resendVerificationEmail(email: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) this.throwAuthError(error);
      return { success: true };
    } catch (err: any) {
      if (err instanceof AuthServiceError) throw err;
      this.throwAuthError(err);
    }
  }

  static async resetPassword(email: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) this.throwAuthError(error);
      return { success: true };
    } catch (err: any) {
      if (err instanceof AuthServiceError) throw err;
      this.throwAuthError(err);
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const normalizedPassword = newPassword.trim();
      const { error } = await supabase.auth.updateUser({ password: normalizedPassword });
      if (error) this.throwAuthError(error);
      return { success: true };
    } catch (err: any) {
      if (err instanceof AuthServiceError) throw err;
      this.throwAuthError(err);
    }
  }
}

/* keep named exports for backward compatibility */
export const signUp = AuthService.signUp;
export const signIn = AuthService.signIn;
export const signInWithGoogle = AuthService.signInWithGoogle;
export const resendVerificationEmail = AuthService.resendVerificationEmail;
export const resetPassword = AuthService.resetPassword;
export const updatePassword = AuthService.updatePassword;

export { AuthServiceError }; // optional export for callers who want to `instanceof` check
