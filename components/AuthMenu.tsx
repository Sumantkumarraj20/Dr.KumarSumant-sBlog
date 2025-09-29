// components/AuthMenu.tsx
"use client";

import React, { useMemo } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Portal,
  Avatar,
  Button,
  HStack,
  Text,
  Spinner,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { User } from "@supabase/supabase-js"; // optional, adjust to your User type
import { UserCircleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

type AuthMenuProps = {
  user?: any | null; // replace `any` with your User type if available
  authLoading?: boolean;
  signingOut?: boolean;
  isAdmin?: boolean;
  // callbacks (if not provided component will use router)
  onProfile?: () => void;
  onAdmin?: () => void;
  onSignOut?: () => Promise<void> | void;
  onSignIn?: () => void;
  translate?: (k: string) => string; // optional translation function (i18n), default identity
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

  // sensible defaults if caller didn't pass callbacks
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

  const avatarHover = useColorModeValue("gray.100", "gray.700");
  const menuBg = useColorModeValue("white", "gray.800");
  const menuBorder = useColorModeValue("gray.200", "gray.700");

  // Loading state shows a small spinner (keeps header stable)
  if (authLoading) {
    return <Spinner size="sm" color="blue.500" />;
  }

  // Not logged in -> sign in button
  if (!user) {
    return (
      <Button
        size="sm"
        colorScheme="blue"
        variant="solid"
        onClick={handleSignIn}
        fontWeight="semibold"
      >
        {translate("signin") || "Sign in"}
      </Button>
    );
  }

  // Logged in -> menu
  return (
    <Menu isLazy>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        rounded="full"
        px={2}
        _hover={{ bg: avatarHover }}
        aria-label="Open account menu"
      >
        <HStack spacing={2}>
          <Avatar
            size="sm"
            name={displayName}
            src={user?.user_metadata?.avatar_url}
            bg="blue.500"
            color="white"
            fontSize="xs"
          />
          <Text
            display={{ base: "none", lg: "inline" }}
            fontSize="sm"
            fontWeight="medium"
            maxW={labelMaxWidth}
            isTruncated
          >
            {displayName}
          </Text>
        </HStack>
      </MenuButton>

      {/* Portal ensures the list renders at document root (avoids overflow clipping) */}
      <Portal>
        <MenuList
          zIndex={9999}
          bg={menuBg}
          borderColor={menuBorder}
          shadow="xl"
          minW="220px"
        >
          <MenuItem
            icon={<Icon as={UserCircleIcon} w={4} h={4} />}
            onClick={handleProfile}
            closeOnSelect
            isDisabled={signingOut}
          >
            {translate("profile") || "Profile"}
          </MenuItem>

          {isAdmin && (
            <MenuItem
              icon={<Icon as={Cog6ToothIcon} w={4} h={4} />}
              onClick={handleAdmin}
              closeOnSelect
            >
              {translate("admin_dashboard") || "Admin Dashboard"}
            </MenuItem>
          )}

          <MenuDivider />

          <MenuItem
            onClick={async () => {
              // show spinner inside the item while signing out
              if (onSignOut) {
                await handleSignOut();
              } else {
                void handleSignOut();
              }
            }}
            isDisabled={signingOut}
            _hover={{ bg: "red.50" }}
          >
            {signingOut ? (
              <HStack>
                <Spinner size="xs" />
                <Text>Signing out…</Text>
              </HStack>
            ) : (
              <Text color="red.600">{translate("signout") || "Sign out"}</Text>
            )}
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
}
