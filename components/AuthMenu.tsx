"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  useColorModeValue,
  Box,
  Text
} from "@chakra-ui/react";

import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
  ShieldCheckIcon
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
  className?: string;
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
  labelMaxWidth = "140px",
  className = "",
}: AuthMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Move ALL useColorModeValue calls to the top - never conditionally
  const bgColor = useColorModeValue("white", "gray.800");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
  const dropdownBg = useColorModeValue("white", "gray.800");
  const dropdownBorder = useColorModeValue("gray.200", "gray.600");
  const dropdownShadow = useColorModeValue("0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1)");
  const menuItemHoverBg = useColorModeValue("blue.50", "blue.900/20");
  const adminHoverBg = useColorModeValue("purple.50", "purple.900/20");
  const signOutHoverBg = useColorModeValue("red.50", "red.900/20");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const blueColor = useColorModeValue("blue.600", "blue.400");
  const purpleColor = useColorModeValue("purple.600", "purple.400");
  const redColor = useColorModeValue("red.600", "red.400");

  // Enhanced click outside handler with animation support
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the dropdown and the toggle button
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
      const isOutsideButton = buttonRef.current && !buttonRef.current.contains(event.target as Node);
      
      if (isOutsideDropdown && isOutsideButton && isOpen) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsAnimating(false);
        }, 150);
      }
    };

    // Use capture phase to ensure we catch the event
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isOpen]); // Add isOpen as dependency

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsAnimating(false);
        }, 150);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

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

  const handleToggle = () => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 150);
    } else {
      setIsOpen(true);
    }
  };

  const handleMenuAction = (action: () => void) => {
    action();
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 200);
  };

  // Enhanced loading state with smooth animation
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

  // Enhanced sign in button with modern design
  if (!user) {
    return (
      <div className={className}>
        <button
          onClick={handleSignIn}
          className="group relative px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-xl hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] hover:shadow-blue-500/25 overflow-hidden"
        >
          {/* Animated background shine */}
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
      {/* Enhanced toggle button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="group flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 backdrop-blur-sm border"
        style={{
          backgroundColor: useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)'),
          borderColor: useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)'),
        }}
        aria-label="Open account menu"
        aria-expanded={isOpen}
      >
        {/* Enhanced avatar with status */}
        <div className="relative">
          <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 via-blue-600 to-purple-500 rounded-full shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
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
          
          {/* Enhanced online status indicator */}
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[2.5px] border-white dark:border-gray-900 rounded-full shadow-sm">
            <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Admin badge */}
          {isAdmin && (
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-purple-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        
        {/* User name with smooth truncation */}
        <div className="hidden lg:flex flex-col items-start min-w-0">
          <span 
            className="text-sm font-semibold truncate transition-colors duration-200"
            style={{ 
              maxWidth: labelMaxWidth,
              color: textColor
            }}
            title={displayName}
          >
            {displayName}
          </span>
          <span 
            className="text-xs mt-0.5"
            style={{ color: secondaryTextColor }}
          >
            {isAdmin ? "Administrator" : "Member"}
          </span>
        </div>
        
        {/* Animated chevron */}
        <ChevronDownIcon 
          className={`w-4 h-4 transition-all duration-300 ${
            isOpen ? "rotate-180 text-blue-500" : "rotate-0"
          }`}
          style={{ color: secondaryTextColor }}
        />
      </button>

      {/* Enhanced dropdown menu with smooth animations */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className={`absolute right-0 z-50 w-72 mt-2 origin-top-right ${
            isOpen 
              ? "animate-in fade-in-0 zoom-in-95 slide-in-from-top-1" 
              : isAnimating 
                ? "animate-out fade-out-0 zoom-out-95 slide-out-to-top-1" 
                : "hidden"
          }`}
        >
          <div 
            className="backdrop-blur-xl border rounded-2xl overflow-hidden"
            style={{
              backgroundColor: dropdownBg,
              borderColor: dropdownBorder,
              boxShadow: dropdownShadow,
              background: useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)'),
            }}
          >
            {/* Enhanced user info header */}
            <div 
              className="px-5 py-4 border-b"
              style={{
                backgroundColor: headerBg,
                borderColor: useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)'),
              }}
            >
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
                    className="text-sm font-semibold truncate" 
                    title={displayName}
                    style={{ color: textColor }}
                  >
                    {displayName}
                  </p>
                  <p 
                    className="text-xs truncate mt-0.5" 
                    title={user.email}
                    style={{ color: secondaryTextColor }}
                  >
                    {user.email}
                  </p>
                  {isAdmin && (
                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheckIcon className="w-3 h-3 text-purple-500" />
                      <span 
                        className="text-xs font-medium"
                        style={{ color: useColorModeValue('purple.600', 'purple.400') }}
                      >
                        Administrator
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items with enhanced styling */}
            <div className="p-2 space-y-1">
              {/* Profile button */}
              <button
                onClick={() => handleMenuAction(handleProfile)}
                disabled={signingOut}
                className="group flex items-center w-full px-3 py-3 text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-1"
                style={{
                  color: textColor,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = menuItemHoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div 
                  className="p-2 rounded-lg transition-colors duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: useColorModeValue('blue.100', 'blue.900/30'),
                  }}
                >
                  <UserCircleIcon 
                    className="w-4 h-4"
                    style={{
                      color: useColorModeValue('blue.600', 'blue.400'),
                    }}
                  />
                </div>
                <div className="ml-3 text-left">
                  <span className="font-medium block">
                    {translate("profile") || "Profile"}
                  </span>
                  <span 
                    className="text-xs mt-0.5"
                    style={{ color: secondaryTextColor }}
                  >
                    Manage your account
                  </span>
                </div>
              </button>

              {/* Admin Dashboard */}
              {isAdmin && (
                <button
                  onClick={() => handleMenuAction(handleAdmin)}
                  className="group flex items-center w-full px-3 py-3 text-sm rounded-xl transition-all duration-200 hover:translate-x-1"
                  style={{
                    color: textColor,
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = adminHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div 
                    className="p-2 rounded-lg transition-colors duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor: useColorModeValue('purple.100', 'purple.900/30'),
                    }}
                  >
                    <Cog6ToothIcon 
                      className="w-4 h-4"
                      style={{
                        color: useColorModeValue('purple.600', 'purple.400'),
                      }}
                    />
                  </div>
                  <div className="ml-3 text-left">
                    <span className="font-medium block">
                      {translate("admin_dashboard") || "Admin Dashboard"}
                    </span>
                    <span 
                      className="text-xs mt-0.5"
                      style={{ color: secondaryTextColor }}
                    >
                      Manage platform settings
                    </span>
                  </div>
                </button>
              )}

              {/* Enhanced sign out button */}
              <button
                onClick={async () => {
                  if (onSignOut) {
                    await handleSignOut();
                  } else {
                    void handleSignOut();
                  }
                  setIsAnimating(true);
                  setTimeout(() => {
                    setIsOpen(false);
                    setIsAnimating(false);
                  }, 200);
                }}
                disabled={signingOut}
                className="group flex items-center w-full px-3 py-3 text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-1 border-t mt-2 pt-3"
                style={{
                  color: useColorModeValue('red.600', 'red.400'),
                  borderColor: useColorModeValue('gray.200', 'gray.600'),
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = signOutHoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div 
                  className="p-2 rounded-lg transition-colors duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: useColorModeValue('red.100', 'red.900/30'),
                  }}
                >
                  {signingOut ? (
                    <div 
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: useColorModeValue('red.600', 'red.400'),
                        borderTopColor: 'transparent',
                      }}
                    />
                  ) : (
                    <ArrowRightStartOnRectangleIcon 
                      className="w-4 h-4"
                      style={{
                        color: useColorModeValue('red.600', 'red.400'),
                      }}
                    />
                  )}
                </div>
                <div className="ml-3 text-left">
                  <span className="font-medium block">
                    {signingOut 
                      ? "Signing out..." 
                      : (translate("signout") || "Sign out")
                    }
                  </span>
                  <span 
                    className="text-xs mt-0.5"
                    style={{
                      color: useColorModeValue('rgba(239, 68, 68, 0.7)', 'rgba(248, 113, 113, 0.7)'),
                    }}
                  >
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