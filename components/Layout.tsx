"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tooltip,
  VStack,
  HStack,
  Text,
  useDisclosure,
  Avatar,
} from "@chakra-ui/react";
import GlobalLoader, { useRouteLoading } from "./GlobalLoader";
import ErrorBoundary from "./ErrorBoundary";
import { useAuth } from "../context/authContext";
import AuthMenu from "@/components/AuthMenu";

import {
  HomeIcon,
  AcademicCapIcon,
  UserCircleIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  PencilSquareIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

const MotionBox = motion.create ? motion.create(Box) : motion(Box);

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("nav");
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const routeLoading = useRouteLoading();

  const bgHeader = useColorModeValue("whiteAlpha.900", "gray.800");
  const bgLang = useColorModeValue("gray.100", "gray.700");
  const activeColor = useColorModeValue("blue.600", "blue.400");
  const textColor = useColorModeValue("slate.900", "slate.100");
  const bodyBg = useColorModeValue("gray.50", "gray.900");
  const hoverBg = useColorModeValue("gray.200", "gray.600");
  const avatarHover = useColorModeValue("gray.100", "gray.700");
  const footerBg = useColorModeValue("white", "gray.800");
  const footerBorder = useColorModeValue("gray.200", "gray.700");
  const footerTextColor = useColorModeValue("slate.600", "slate.400");
  const menuBg = useColorModeValue("white", "gray.700");
  const menuBorder = useColorModeValue("gray.200", "gray.600");

  const changeLanguage = (lng: string) => {
    router.push(router.asPath, router.asPath, { locale: lng });
  };

  const navLinks = [
    { href: "/", label: t("home"), icon: HomeIcon },
    { href: "/about", label: t("about"), icon: UserCircleIcon },
    { href: "/blog", label: t("blog"), icon: PencilSquareIcon },
    { href: "/learn", label: t("learn"), icon: AcademicCapIcon },
    { href: "/contact", label: t("contact"), icon: EnvelopeIcon },
  ];

  const { user, loading: authLoading, profile } = useAuth();
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  };

  // Check if user is admin
  const isAdmin = profile?.is_admin;
  return (
    <>
      <Flex direction="column" minH="100vh" bg={bodyBg} color={textColor}>
        {/* Global loader overlay */}
        <GlobalLoader />

        {/* HEADER */}
        <Box
          as="header"
          position="sticky"
          top="0"
          zIndex="40"
          bg={bgHeader}
          backdropFilter="blur(8px)"
          boxShadow="sm"
          borderBottom="1px solid"
          borderColor={useColorModeValue("gray.200", "gray.700")}
        >
          <Flex
            maxW="7xl"
            mx="auto"
            px={{ base: 4, sm: 6, lg: 8 }}
            h={16}
            align="center"
            justify="space-between"
          >
            {/* Left: Brand + Mobile Menu */}
            <Flex align="center" gap={4}>
              {/* Mobile Hamburger - Now on left side */}
              <Box display={{ base: "flex", md: "none" }}>
                <IconButton
                  aria-label="Open menu"
                  icon={<Bars3Icon className="w-6 h-6" />}
                  variant="ghost"
                  onClick={onOpen}
                  isDisabled={routeLoading}
                  size="sm"
                />
              </Box>

              {/* Brand */}
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-2xl hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <GlobeAltIcon className="w-7 h-7 text-blue-600" />
                <Text display={{ base: "none", sm: "block" }}>RIPY</Text>
              </Link>
            </Flex>

            {/* Center: Desktop Navigation */}
            <HStack
              spacing={1}
              display={{ base: "none", md: "flex" }}
              flex="1"
              justify="center"
              maxW="2xl"
            >
              {navLinks.map((link) => {
                const isActive = router.pathname === link.href;
                return (
                  <Tooltip
                    key={link.href}
                    label={link.label}
                    placement="bottom"
                  >
                    <Link href={link.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={
                          link.icon ? (
                            <link.icon className="w-4 h-4" />
                          ) : undefined
                        }
                        color={isActive ? activeColor : "inherit"}
                        bg={
                          isActive
                            ? useColorModeValue("blue.50", "blue.900")
                            : "transparent"
                        }
                        _hover={{
                          bg: isActive
                            ? useColorModeValue("blue.100", "blue.800")
                            : hoverBg,
                        }}
                        isDisabled={routeLoading}
                        fontSize="sm"
                        fontWeight="medium"
                        px={3}
                      >
                        <Text display={{ base: "none", lg: "block" }}>
                          {link.label}
                        </Text>
                      </Button>
                    </Link>
                  </Tooltip>
                );
              })}

              {/* Admin link for desktop */}
              {isAdmin && (
                <Tooltip label="Admin" placement="bottom">
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Cog6ToothIcon className="w-4 h-4" />}
                      color={
                        router.pathname === "/admin" ? activeColor : "inherit"
                      }
                      bg={
                        router.pathname === "/admin"
                          ? useColorModeValue("blue.50", "blue.900")
                          : "transparent"
                      }
                      _hover={{
                        bg:
                          router.pathname === "/admin"
                            ? useColorModeValue("blue.100", "blue.800")
                            : hoverBg,
                      }}
                      isDisabled={routeLoading}
                      fontSize="sm"
                      fontWeight="medium"
                      px={3}
                    >
                      <Text display={{ base: "none", lg: "block" }}>Admin</Text>
                    </Button>
                  </Link>
                </Tooltip>
              )}
            </HStack>

            {/* Right: Auth, Language, Dark Mode */}
            <Flex align="center" gap={2} ml="auto">
              {/* Language Selector */}
              <ButtonGroup
                isAttached
                variant="ghost"
                size="sm"
                bg={bgLang}
                rounded="full"
                p="1"
                display={{ base: "none", sm: "flex" }}
              >
                {["en", "hi", "ru"].map((lng) => {
                  const isActive = router.locale === lng;
                  return (
                    <Button
                      key={lng}
                      onClick={() => changeLanguage(lng)}
                      rounded="full"
                      px={3}
                      py={1}
                      fontWeight="semibold"
                      fontSize="xs"
                      bg={isActive ? activeColor : "transparent"}
                      color={isActive ? "white" : "inherit"}
                      _hover={{ bg: isActive ? activeColor : hoverBg }}
                      isDisabled={routeLoading}
                      minW="auto"
                    >
                      {lng === "en" ? "EN" : lng === "hi" ? "हिंदी" : "RU"}
                    </Button>
                  );
                })}
              </ButtonGroup>

              {/* Dark Mode Toggle */}
              <Tooltip
                label={colorMode === "light" ? "Dark mode" : "Light mode"}
              >
                <IconButton
                  aria-label="Toggle dark mode"
                  icon={
                    colorMode === "light" ? (
                      <MoonIcon className="w-4 h-4" />
                    ) : (
                      <SunIcon className="w-4 h-4" />
                    )
                  }
                  size="sm"
                  variant="ghost"
                  rounded="full"
                  onClick={toggleColorMode}
                  isDisabled={routeLoading}
                />
              </Tooltip>
              <AuthMenu
                user={user}
                authLoading={authLoading}
                signingOut={signingOut}
                isAdmin={user?.user_metadata?.role === "admin"}
                onSignOut={handleSignOut}
              />
            </Flex>
          </Flex>

          {/* Mobile Drawer */}
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent bg={menuBg}>
              <DrawerCloseButton />
              <DrawerHeader borderBottom="1px solid" borderColor={menuBorder}>
                <HStack>
                  <GlobeAltIcon className="w-6 h-6 text-blue-600" />
                  <Text fontWeight="bold">RIPY</Text>
                </HStack>
              </DrawerHeader>
              <DrawerBody py={6}>
                <VStack spacing={2} align="stretch">
                  {/* Navigation Links */}
                  {navLinks.map((link) => {
                    const isActive = router.pathname === link.href;
                    return (
                      <Link key={link.href} href={link.href} onClick={onClose}>
                        <Button
                          variant={isActive ? "solid" : "ghost"}
                          colorScheme={isActive ? "blue" : "gray"}
                          leftIcon={
                            link.icon ? (
                              <link.icon className="w-5 h-5" />
                            ) : undefined
                          }
                          width="100%"
                          justifyContent="flex-start"
                          size="lg"
                        >
                          {link.label}
                        </Button>
                      </Link>
                    );
                  })}

                  {/* Admin Link for Mobile */}
                  {isAdmin && (
                    <Link href="/admin" onClick={onClose}>
                      <Button
                        variant={
                          router.pathname === "/admin" ? "solid" : "ghost"
                        }
                        colorScheme={
                          router.pathname === "/admin" ? "blue" : "gray"
                        }
                        leftIcon={<Cog6ToothIcon className="w-5 h-5" />}
                        width="100%"
                        justifyContent="flex-start"
                        size="lg"
                      >
                        Admin
                      </Button>
                    </Link>
                  )}

                  {/* Language Selector for Mobile */}
                  <Box pt={4} borderTop="1px solid" borderColor={menuBorder}>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      mb={3}
                      color={useColorModeValue("gray.600", "gray.400")}
                    >
                      Language
                    </Text>
                    <ButtonGroup
                      variant="outline"
                      size="sm"
                      width="100%"
                      isAttached
                    >
                      {["en", "hi", "ru"].map((lng) => {
                        const isActive = router.locale === lng;
                        return (
                          <Button
                            key={lng}
                            onClick={() => {
                              changeLanguage(lng);
                              onClose();
                            }}
                            flex="1"
                            colorScheme={isActive ? "blue" : "gray"}
                            variant={isActive ? "solid" : "outline"}
                          >
                            {lng === "en"
                              ? "EN"
                              : lng === "hi"
                              ? "हिंदी"
                              : "RU"}
                          </Button>
                        );
                      })}
                    </ButtonGroup>
                  </Box>

                  {/* Auth Section for Mobile */}
                  <Box pt={4} borderTop="1px solid" borderColor={menuBorder}>
                    {user ? (
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between" px={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {user.email}
                          </Text>
                          <Avatar
                            size="sm"
                            name={user.email || "User"}
                            src={user?.user_metadata?.avatar_url}
                          />
                        </HStack>
                        <Button
                          variant="ghost"
                          width="100%"
                          justifyContent="flex-start"
                          onClick={() => {
                            router.push("/profile");
                            onClose();
                          }}
                          size="lg"
                        >
                          {t("profile") || "Profile"}
                        </Button>
                        <Button
                          variant="ghost"
                          width="100%"
                          justifyContent="flex-start"
                          onClick={handleSignOut}
                          isDisabled={signingOut}
                          color="red.500"
                          size="lg"
                        >
                          {signingOut
                            ? "Signing out..."
                            : t("signout") || "Sign out"}
                        </Button>
                      </VStack>
                    ) : (
                      <Button
                        colorScheme="blue"
                        width="100%"
                        size="lg"
                        onClick={() => {
                          router.push("/auth");
                          onClose();
                        }}
                      >
                        {t("signin") || "Sign in"}
                      </Button>
                    )}
                  </Box>
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Box>

        {/* MAIN CONTENT */}
        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          minH="0"
          overflow="hidden"
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={router.asPath}
              flex="1"
              display="flex"
              flexDirection="column"
              minW="0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorBoundary>
                <Box flex="1" display="flex" flexDirection="column">
                  {children}
                </Box>
              </ErrorBoundary>
            </MotionBox>
          </AnimatePresence>
        </Box>

        {/* FOOTER */}
        <Box
          as="footer"
          bg={footerBg}
          borderTop="1px solid"
          borderColor={footerBorder}
          mt="auto"
        >
          <Box
            maxW="7xl"
            mx="auto"
            px={{ base: 4, sm: 6, lg: 8 }}
            py={6}
            textAlign="center"
            fontSize="sm"
            color={footerTextColor}
          >
            © {new Date().getFullYear()} Dr. Kumar Sumant · Evidence-based
            patient education
          </Box>
        </Box>
      </Flex>
    </>
  );
}
