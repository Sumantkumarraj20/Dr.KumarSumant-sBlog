// components/AuthMenu.tsx
"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useColorModeValue } from "@chakra-ui/react";
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

interface AuthMenuProps {
  user?: any | null;
  authLoading?: boolean;
  isAdmin?: boolean;
  onProfile?: () => void;
  onAdmin?: () => void;
  onSignOut?: () => Promise<void> | void;
  onSignIn?: () => void;
  translate?: (key: string) => string;
  labelMaxWidth?: string;
  className?: string;
}

export default function AuthMenu({
  user,
  authLoading = false,
  isAdmin = false,
  onProfile,
  onAdmin,
  onSignOut,
  onSignIn,
  translate = (key) => key,
  labelMaxWidth = "140px",
  className = "",
}: AuthMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Color values - all at the top level
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
  const dropdownBg = useColorModeValue("white", "gray.800");
  const dropdownBorder = useColorModeValue("gray.200", "gray.600");
  const blueColor = useColorModeValue("blue.600", "blue.400");
  const purpleColor = useColorModeValue("purple.600", "purple.400");
  const redColor = useColorModeValue("red.600", "red.400");
  const menuItemHoverBg = useColorModeValue("blue.50", "blue.900/20");
  const adminHoverBg = useColorModeValue("purple.50", "purple.900/20");
  const signOutHoverBg = useColorModeValue("red.50", "red.900/20");
  const headerBg = useColorModeValue("gray.50", "gray.700");

  // Default handlers
  const handleProfile = onProfile ?? (() => router.push("/profile"));
  const handleAdmin = onAdmin ?? (() => router.push("/admin"));
  const handleSignIn = onSignIn ?? (() => router.push("/auth"));

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown handlers
  const closeDropdown = () => {
    setIsOpen(false);
    setIsSigningOut(false);
  };

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    closeDropdown();
  };

  const handleSignOut = async () => {
    if (!onSignOut) return;
    
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      closeDropdown();
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideDropdown = dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node);
      const isOutsideButton = buttonRef.current && 
        !buttonRef.current.contains(event.target as Node);
      
      if (isOutsideDropdown && isOutsideButton && isOpen) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeDropdown();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Loading state
  if (authLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          <div className={`w-10 h-10 bg-gradient-to-br rounded-full animate-pulse ${
            useColorModeValue("from-gray-200 to-gray-300", "from-gray-700 to-gray-600")
          }`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Signed out state
  if (!user) {
    return (
      <div className={className}>
        <button
          onClick={handleSignIn}
          className="group relative px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative z-10 flex items-center gap-2">
            <UserCircleIcon className="w-4 h-4" />
            {translate("signin") || "Sign in"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toggle button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="group flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 backdrop-blur-sm border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
        aria-label="Open account menu"
        aria-expanded={isOpen}
      >
        {/* Avatar with status */}
        <div className="relative">
          <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
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
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
          
          {/* Admin badge */}
          {isAdmin && (
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-purple-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        
        {/* User info */}
        <div className="hidden lg:flex flex-col items-start min-w-0">
          <span 
            className="text-sm font-semibold truncate transition-colors duration-200 text-gray-900 dark:text-gray-100"
            style={{ maxWidth: labelMaxWidth }}
            title={displayName}
          >
            {displayName}
          </span>
          <span className="text-xs mt-0.5 text-gray-600 dark:text-gray-400">
            {isAdmin ? "Administrator" : "Member"}
          </span>
        </div>
        
        {/* Chevron icon */}
        <ChevronDownIcon 
          className={`w-4 h-4 transition-all duration-300 text-gray-600 dark:text-gray-400 ${
            isOpen ? "rotate-180 text-blue-500" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 z-50 w-72 mt-2 origin-top-right animate-in fade-in-0 zoom-in-95 slide-in-from-top-1"
        >
          <div 
            className="backdrop-blur-xl border rounded-2xl overflow-hidden bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-600 shadow-xl dark:shadow-2xl"
          >
            {/* User info header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
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
                </div>
                <div className="min-w-0 flex-1">
                  <p 
                    className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100" 
                    title={displayName}
                  >
                    {displayName}
                  </p>
                  <p 
                    className="text-xs truncate mt-0.5 text-gray-600 dark:text-gray-400" 
                    title={user.email}
                  >
                    {user.email}
                  </p>
                  {isAdmin && (
                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheckIcon className="w-3 h-3 text-purple-500" />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        Administrator
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2 space-y-1">
              {/* Profile */}
              <button
                onClick={() => handleMenuAction(handleProfile)}
                className="group flex items-center w-full px-3 py-3 text-sm rounded-xl transition-all duration-200 hover:translate-x-1 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 transition-colors duration-200 group-hover:scale-110">
                  <UserCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3 text-left">
                  <span className="font-medium block">
                    {translate("profile") || "Profile"}
                  </span>
                  <span className="text-xs mt-0.5 text-gray-600 dark:text-gray-400">
                    Manage your account
                  </span>
                </div>
              </button>

              {/* Admin Dashboard */}
              {isAdmin && (
                <button
                  onClick={() => handleMenuAction(handleAdmin)}
                  className="group flex items-center w-full px-3 py-3 text-sm rounded-xl transition-all duration-200 hover:translate-x-1 text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 transition-colors duration-200 group-hover:scale-110">
                    <Cog6ToothIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3 text-left">
                    <span className="font-medium block">
                      {translate("admin_dashboard") || "Admin Dashboard"}
                    </span>
                    <span className="text-xs mt-0.5 text-gray-600 dark:text-gray-400">
                      Manage platform settings
                    </span>
                  </div>
                </button>
              )}

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="group flex items-center w-full px-3 py-3 text-sm rounded-xl transition-all duration-200 hover:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed border-t border-gray-200 dark:border-gray-600 mt-2 pt-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 transition-colors duration-200 group-hover:scale-110">
                  {isSigningOut ? (
                    <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="ml-3 text-left">
                  <span className="font-medium block">
                    {isSigningOut 
                      ? "Signing out..." 
                      : (translate("signout") || "Sign out")
                    }
                  </span>
                  <span className="text-xs mt-0.5 text-red-500/70 dark:text-red-400/70">
                    End your session
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}