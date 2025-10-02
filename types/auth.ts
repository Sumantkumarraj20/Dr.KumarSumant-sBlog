// types/auth.ts
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  full_name?: string;
  confirmPassword?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: string;
}