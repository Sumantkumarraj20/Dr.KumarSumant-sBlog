"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '@chakra-ui/react';
import { UserProfile, AuthError } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isInitialized: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  recoverSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Error handler for auth operations
const handleAuthError = (error: any, toast: any, operation: string) => {
  console.error(`Auth ${operation} error:`, error);
  
  let message = 'An unexpected error occurred';
  let description = error.message || 'Please try again later';

  // Common Supabase auth errors
  if (error.message?.includes('Invalid login credentials')) {
    message = 'Invalid credentials';
    description = 'Please check your email and password';
  } else if (error.message?.includes('Email not confirmed')) {
    message = 'Email not verified';
    description = 'Please check your email to verify your account';
  } else if (error.message?.includes('User already registered')) {
    message = 'Account exists';
    description = 'An account with this email already exists';
  } else if (error.message?.includes('Email rate limit exceeded')) {
    message = 'Too many attempts';
    description = 'Please wait a few minutes before trying again';
  }

  toast({
    title: message,
    description,
    status: 'error',
    duration: 5000,
    isClosable: true,
    position: 'top-right',
  });

  return { message, description };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useToast();

  // Safe profile creation with null checks
  const createUserProfile = useCallback(async (userData: User) => {
    if (!userData?.id) {
      console.error('Cannot create profile: User ID is missing');
      return;
    }

    try {
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();

      // Profile doesn't exist, create one
      if (fetchError?.code === 'PGRST116') {
        const profileData = {
          id: userData.id,
          email: userData.email,
          full_name: userData.user_metadata?.full_name || 
                    userData.email?.split('@')[0] || 
                    'User',
          avatar_url: userData.user_metadata?.avatar_url || '',
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (insertError) {
          if (insertError.code !== '23505') { // Ignore duplicate key errors
            throw insertError;
          }
        } else {
          setProfile(profileData as UserProfile);
        }
      } else if (fetchError) {
        throw fetchError;
      } else {
        setProfile(existingProfile);
      }
    } catch (error: any) {
      handleAuthError(error, toast, 'profile creation');
    }
  }, [toast]);

  // Fetch user profile with error handling
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!userId) {
      console.error('Cannot fetch profile: User ID is missing');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createUserProfile(user!);
          return;
        }
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Don't show toast for profile fetch errors to avoid spam
    }
  }, [createUserProfile, user]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      handleAuthError(error, toast, 'sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Session recovery function
  const recoverSession = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        console.log('Session recovered successfully');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Session recovery failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        
        // Show email confirmation reminder if needed
        if (!session.user.email_confirmed_at) {
          toast({
            title: 'Email verification required',
            description: 'Please check your email to verify your account for full access.',
            status: 'warning',
            duration: 6000,
            isClosable: true,
            position: 'top-right',
          });
        }
      }
    } catch (error: any) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [fetchUserProfile, toast]);

  // Auth state change handler
  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('Auth state changed:', event);
    
    setUser(session?.user ?? null);
    
    if (session?.user) {
      await fetchUserProfile(session.user.id);
      
      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          const isNewUser = session.user.identities?.[0]?.created_at === 
                           session.user.identities?.[0]?.updated_at;
          
          if (isNewUser && !session.user.email_confirmed_at) {
            toast({
              title: 'Welcome! Verify your email',
              description: 'We sent a verification link to your email address.',
              status: 'info',
              duration: 8000,
              isClosable: true,
              position: 'top-right',
            });
          } else if (!session.user.email_confirmed_at) {
            toast({
              title: 'Email verification required',
              description: 'Please verify your email for full access.',
              status: 'warning',
              duration: 6000,
              isClosable: true,
            });
          }
          break;
          
        case 'USER_UPDATED':
          if (session.user.email_confirmed_at) {
            toast({
              title: 'Email verified!',
              description: 'Your email has been successfully verified.',
              status: 'success',
              duration: 4000,
              isClosable: true,
            });
          }
          break;
          
        case 'SIGNED_OUT':
          setProfile(null);
          toast({
            title: 'Signed out successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          break;
      }
    } else {
      setProfile(null);
    }
    
    setLoading(false);
  }, [fetchUserProfile, toast]);

  useEffect(() => {
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, [initializeAuth, handleAuthStateChange]);

  // Session recovery on mount
  useEffect(() => {
    const attemptSessionRecovery = async () => {
      const hasStoredSession = localStorage.getItem('supabase.auth.token');
      if (hasStoredSession && !user && !loading && isInitialized) {
        console.log('Attempting session recovery...');
        await recoverSession();
      }
    };

    const timer = setTimeout(attemptSessionRecovery, 1000);
    return () => clearTimeout(timer);
  }, [user, loading, isInitialized, recoverSession]);

  const value = {
    user,
    profile,
    loading,
    isInitialized,
    refreshProfile,
    signOut,
    recoverSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};