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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from "@chakra-ui/react";
import GlobalLoader, { useRouteLoading } from "./GlobalLoader";
import ErrorBoundary from "./ErrorBoundary";
import { useAuth } from "../context/authContext";
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

  // Keep all color-mode hooks at top-level so hook order is stable
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

  const { user, loading: authLoading } = useAuth();
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      // authContext listener will update state; navigate to home
      router.push("/");
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Flex direction="column" minH="100vh" bg={bodyBg} color={textColor}>
      {/* Global loader overlay (shows progress + ETA) */}
      <GlobalLoader />
      {/* ===== HEADER ===== */}
      <Box as="header" position="sticky" top="0" zIndex="40" bg={bgHeader} backdropFilter="blur(8px)" boxShadow="sm">
        <Flex maxW="6xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} h={16} align="center" justify="space-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <GlobeAltIcon className="w-7 h-7 text-blue-600" />
            RIPY
          </Link>

          {/* ===== Desktop & Tablet Nav ===== */}
          <Flex align="center" gap={2}>
            {/* ≥ 764px: full text */}
            <HStack display={{ base: "none", md: "flex" }} spacing={4}>
              {navLinks.map((link) => {
                const isActive = router.pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      leftIcon={link.icon ? <link.icon className="w-5 h-5" /> : undefined}
                      color={isActive ? activeColor : "inherit"}
                      _hover={{ bg: hoverBg }}
                      isDisabled={routeLoading}
                      fontSize="sm"
                    >
                      <Text display={{ base: "none", lg: "block" }}>{link.label}</Text>
                    </Button>
                  </Link>
                );
              })}
            </HStack>

            {/* Auth action / Avatar */}
            <Box display={{ base: "none", md: "block" }}>
              {!authLoading && (
                user ? (
                  <Menu>
                    <MenuButton as={Button} variant="ghost" size="sm" rounded="full" _hover={{ bg: avatarHover }}>
                      <HStack>
                        <Avatar size="sm" name={user.email || "User"} src={user?.user_metadata?.avatar_url} />
                        <Text display={{ base: "none", md: "inline" }}>{user.email?.split('@')[0]}</Text>
                      </HStack>
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => router.push('/profile')} isDisabled={signingOut}>{t('profile') || 'Profile'}</MenuItem>
                      {user?.user_metadata?.role === 'admin' && (
                        <MenuItem onClick={() => router.push('/admin')}>Admin</MenuItem>
                      )}
                      <MenuItem onClick={handleSignOut} isDisabled={signingOut}>{signingOut ? 'Signing out…' : (t('signout') || 'Sign out')}</MenuItem>
                    </MenuList>
                  </Menu>
                ) : (
                  <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => router.push('/auth')}>
                    {t('signin') || 'Sign in'}
                  </Button>
                )
              )}
            </Box>

            {/* 640–763px: icons only */}
            <HStack display={{ base: "none", sm: "flex", md: "none" }} spacing={1}>
              {navLinks.map((link) => {
                const isActive = router.pathname === link.href;
                return (
                  <Tooltip key={link.href} label={link.label}>
                    <Link href={link.href}>
                      <IconButton
                        aria-label={link.label}
                        icon={link.icon ? <link.icon className="w-5 h-5" /> : <Text>{link.label[0]}</Text>}
                        size="sm"
                        variant="ghost"
                        color={isActive ? activeColor : "inherit"}
                        _hover={{ bg: hoverBg }}
                        isDisabled={routeLoading}
                      />
                    </Link>
                  </Tooltip>
                );
              })}
            </HStack>

            {/* Language & Dark Mode Switch (≥640px) */}
              <Flex align="center" gap={2} display={{ base: "none", sm: "flex" }}>
              <ButtonGroup isAttached variant="ghost" size="sm" bg={bgLang} rounded="full" p="1">
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
                      className={`transition-all duration-200 ${isActive ? "shadow" : ""}`}
                      bg={isActive ? activeColor : "transparent"}
                      color={isActive ? "white" : "inherit"}
                      _hover={{ bg: isActive ? activeColor : hoverBg }}
                      isDisabled={routeLoading}
                    >
                      {lng === "en" ? "EN" : lng === "hi" ? "हिंदी" : "RU"}
                    </Button>
                  );
                })}
              </ButtonGroup>

              <IconButton
                aria-label="Toggle dark mode"
                icon={colorMode === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                size="sm"
                variant="ghost"
                rounded="full"
                onClick={toggleColorMode}
                isDisabled={routeLoading}
              />
            </Flex>

            {/* < 640px: Hamburger Drawer */}
            <Box display={{ base: "flex", sm: "none" }}>
              <IconButton
                aria-label="Menu"
                icon={<Bars3Icon className="w-6 h-6" />}
                variant="ghost"
                onClick={onOpen}
                isDisabled={routeLoading}
              />
              <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerCloseButton />
                  <DrawerHeader>Menu</DrawerHeader>
                  <DrawerBody>
                    <VStack spacing={4} align="stretch">
                      {navLinks.map((link) => {
                        const isActive = router.pathname === link.href;
                        return (
                          <Link key={link.href} href={link.href} onClick={onClose}>
                            <Button
                              variant="ghost"
                              leftIcon={link.icon ? <link.icon className="w-5 h-5" /> : undefined}
                              color={isActive ? activeColor : "inherit"}
                              width="100%"
                              justifyContent="flex-start"
                              isDisabled={routeLoading}
                            >
                              {link.label}
                            </Button>
                          </Link>
                        );
                      })}

                      {/* Mobile auth entry */}
                      <Box pt={3}>
                        {!authLoading && (
                          user ? (
                            <>
                              {user?.user_metadata?.role === 'admin' && (
                                <Button variant="ghost" width="100%" justifyContent="flex-start" onClick={() => { router.push('/admin'); onClose(); }}>
                                  Admin
                                </Button>
                              )}
                              <Button variant="ghost" width="100%" justifyContent="flex-start" onClick={() => { handleSignOut(); onClose(); }} isDisabled={signingOut}>
                                {signingOut ? 'Signing out…' : (t('signout') || 'Sign out')}
                              </Button>
                            </>
                          ) : (
                            <Button variant="ghost" width="100%" justifyContent="flex-start" onClick={() => { router.push('/auth'); onClose(); }}>
                              {t('signin') || 'Sign in'}
                            </Button>
                          )
                        )}
                      </Box>

                      {/* Language Switch */}
                      <HStack spacing={2} mt={4}>
                        {["en", "hi", "ru"].map((lng) => {
                          const isActive = router.locale === lng;
                          return (
                            <Button
                              key={lng}
                              onClick={() => {
                                changeLanguage(lng);
                                onClose();
                              }}
                              size="sm"
                              rounded="full"
                              bg={isActive ? activeColor : "transparent"}
                              color={isActive ? "white" : "inherit"}
                              _hover={{ bg: isActive ? activeColor : hoverBg }}
                              isDisabled={routeLoading}
                            >
                              {lng === "en" ? "EN" : lng === "hi" ? "हिंदी" : "RU"}
                            </Button>
                          );
                        })}
                      </HStack>

                      {/* Dark Mode Toggle */}
                      <IconButton
                        mt={4}
                        aria-label="Toggle dark mode"
                        icon={colorMode === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        onClick={toggleColorMode}
                        width="100%"
                        isDisabled={routeLoading}
                      />
                    </VStack>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* ===== MAIN with smooth page transition ===== */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={router.asPath}
          flex="1"
          pt ={2}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </MotionBox>
      </AnimatePresence>

      {/* ===== FOOTER ===== */}
      <Box as="footer" bg={footerBg} borderTop="1px solid" borderColor={footerBorder}>
        <Box maxW="6xl" mx="auto" px={4} py={6} textAlign="center" fontSize="sm" color={footerTextColor}>
          © {new Date().getFullYear()} Dr. Kumar Sumant · Evidence-based patient education
        </Box>
      </Box>
    </Flex>
  );
}
