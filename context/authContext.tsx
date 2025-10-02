// context/authContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "@chakra-ui/react";
import { UserProfile } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const toast = useToast();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) return null;
      return data as UserProfile;
    } catch {
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const profileData = await fetchUserProfile(user.id);
    if (profileData) setProfile(profileData);
  }, [user, fetchUserProfile]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      toast({
        title: "Signed out successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Error signing out",
        description: err.message || "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleUserUpdate = useCallback(
    async (newUser: User | null) => {
      setUser(newUser);
      if (newUser?.id) {
        const profileData = await fetchUserProfile(newUser.id);
        if (profileData) setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    },
    [fetchUserProfile]
  );

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error || !data.session) {
          setUser(null);
          setProfile(null);
        } else {
          await handleUserUpdate(data.session.user);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        handleUserUpdate(session.user);
      } else {
        handleUserUpdate(null);
      }
    });

    // Cross-tab sync: listen for session storage changes
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "supabase.auth.token") {
        initialize();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [handleUserUpdate]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    initialized,
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
