"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { User } from "@supabase/supabase-js";
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";

type AuthMenuProps = {
  user?: any | null;
  authLoading?: boolean;
  signingOut?: boolean;
  isAdmin?: boolean;
  onProfile?: () => void;
  onAdmin?: () => void;
  onSignOut?: () => Promise<void> | void;
  onSignIn?: () => void;
  translate?: (k: string) => string;
  labelMaxWidth?: string;
};

export default function AuthMenu({
  user,
  authLoading = false,
  signingOut = false,
  isAdmin = false,
  onProfile,
  onAdmin,
  onSignOut,
  onSignIn,
  translate = (k) => k,
  labelMaxWidth = "120px",
}: AuthMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfile = onProfile ?? (() => router.push("/profile"));
  const handleAdmin = onAdmin ?? (() => router.push("/admin"));
  const handleSignIn = onSignIn ?? (() => router.push("/auth"));
  const handleSignOut = onSignOut ?? (() => router.push("/auth?signout=1"));

  const displayName = useMemo(() => {
    if (!user) return "";
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user.email) return user.email.split("@")[0];
    return "User";
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Enhanced loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Enhanced sign in button
  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="group relative px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
      >
        <span className="relative z-10">{translate("signin") || "Sign in"}</span>
        <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </button>
    );
  }

  // Enhanced dropdown menu
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        aria-label="Open account menu"
      >
        <div className="relative">
          <div className="flex items-center justify-center w-9 h-9 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-200">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(displayName)
            )}
          </div>
          {/* Online status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
        </div>
        
        <span 
          className="hidden lg:inline text-sm font-semibold text-gray-900 dark:text-gray-200 truncate transition-colors duration-200"
          style={{ maxWidth: labelMaxWidth }}
        >
          {displayName}
        </span>
        
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`} 
        />
      </button>

      {/* Enhanced dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 w-64 mt-3 origin-top-right backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 focus:outline-none animate-in fade-in-0 zoom-in-95">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-semibold truncate">
              {displayName}
            </p>
            <p className="text-xs truncate mt-0.5">
              {user.email}
            </p>
          </div>

          <div className="p-2">
            {/* Profile button */}
            <button
              onClick={() => {
                handleProfile();
                setIsOpen(false);
              }}
              disabled={signingOut}
              className="group flex items-center w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors duration-200">
                <UserCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="ml-3 font-medium">
                {translate("profile") || "Profile"}
              </span>
            </button>

            {/* Admin Dashboard */}
            {isAdmin && (
              <button
                onClick={() => {
                  handleAdmin();
                  setIsOpen(false);
                }}
                className="group flex items-center w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200"
              >
                <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 transition-colors duration-200">
                  <Cog6ToothIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="ml-3 font-medium">
                  {translate("admin_dashboard") || "Admin Dashboard"}
                </span>
              </button>
            )}

            {/* Sign out button */}
            <button
              onClick={async () => {
                if (onSignOut) {
                  await handleSignOut();
                } else {
                  void handleSignOut();
                }
                setIsOpen(false);
              }}
              disabled={signingOut}
              className="group flex items-center w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              <div className="p-1.5 bg-red-50 dark:bg-red-500/10 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors duration-200">
                {signingOut ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <span className="ml-3 font-medium">
                {signingOut 
                  ? "Signing out..." 
                  : (translate("signout") || "Sign out")
                }
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}