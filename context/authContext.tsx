// context/authContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '@chakra-ui/react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  recoverSession: () => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Create or update user profile
  const createUserProfile = async (user: User) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If profile doesn't exist, create one
      if (!existingProfile) {
        const profileData = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || '',
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (insertError) throw insertError;

        setProfile(profileData as Profile);
      } else {
        setProfile(existingProfile);
      }
    } catch (error: any) {
      console.error('Error creating/updating profile:', error);
      toast({
        title: 'Error creating profile',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
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
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Session recovery function
  const recoverSession = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        console.log('Session recovered successfully');
      }
    } catch (error: any) {
      console.error('Session recovery failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
        
        // Show toast for email confirmation
        if (event === 'SIGNED_IN') {
          const isNewUser = session.user.identities?.[0]?.created_at === session.user.identities?.[0]?.updated_at;
          
          if (isNewUser && !session.user.email_confirmed_at) {
            toast({
              title: 'Email confirmation required',
              description: 'Please check your email to confirm your account.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for session recovery on mount
  useEffect(() => {
    const checkStoredSession = async () => {
      const storedSession = localStorage.getItem('supabase.auth.token');
      if (storedSession && !user && !loading) {
        console.log('Attempting session recovery...');
        await recoverSession();
      }
    };

    checkStoredSession();
  }, []);

  const value = {
    user,
    profile,
    loading,
    refreshProfile,
    signOut,
    recoverSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};