// pages/admin.tsx
"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Flex,
  IconButton,
  Spinner,
  Stack,
  useBreakpointValue,
  Tooltip,
  VStack,
  Icon,
  Heading,
  Button,
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/authContext";
import { FiAlertCircle, FiBook, FiSave } from "react-icons/fi";
import { useRouter } from "next/router";

// Dynamically import sections for code-splitting
const CourseAdmin = dynamic(() => import("@/components/admin/CourseAdmin"), {
  loading: () => <Spinner size="lg" />,
  ssr: false, // Disable SSR for better state persistence
});

const UserAdmin = dynamic(() => import("@/components/admin/UserAdmin"), {
  loading: () => <Spinner size="lg" />,
  ssr: false,
});

const AnalyticsAdmin = dynamic(() => import("@/components/admin/AnalyticsAdmin"), {
  loading: () => <Spinner size="lg" />,
  ssr: false,
});

type Section = "courses" | "users" | "analytics";

// Custom hook for handling unsaved changes
function useUnsavedChanges(hasUnsavedChanges: boolean) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return "You have unsaved changes. Are you sure you want to leave?";
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        setShowConfirm(true);
        // Store the navigation action
        setPendingAction(() => () => window.history.go(-1));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const confirmAction = useCallback(() => {
    setShowConfirm(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const cancelAction = useCallback(() => {
    setShowConfirm(false);
    setPendingAction(null);
  }, []);

  return {
    showConfirm,
    confirmAction,
    cancelAction,
    setPendingAction,
    setShowConfirm,
  };
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>("courses");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sectionStates, setSectionStates] = useState({
    courses: {},
    users: {},
    analytics: {},
  });
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { profile } = useAuth();
  const isAdmin = profile?.is_admin;
  const router = useRouter();
  const toast = useToast();

  const {
    showConfirm,
    confirmAction,
    cancelAction,
    setPendingAction,
    setShowConfirm,
  } = useUnsavedChanges(hasUnsavedChanges);

  // Save section state when switching tabs
  const handleSectionChange = useCallback((newSection: Section) => {
    if (hasUnsavedChanges) {
      setShowConfirm(true);
      setPendingAction(() => () => {
        // Save current section state before switching
        setSectionStates(prev => ({
          ...prev,
          [section]: getCurrentSectionState(), // You'll need to implement this based on your sections
        }));
        setSection(newSection);
        setHasUnsavedChanges(false);
      });
    } else {
      setSection(newSection);
    }
  }, [hasUnsavedChanges, section, setPendingAction, setShowConfirm]);

  // Mock function to get current section state - implement based on your actual sections
  const getCurrentSectionState = () => {
    // This should return the current state of the active section
    // You'll need to implement this by lifting state up or using refs
    return {};
  };

  // Handle manual save
  const handleSave = useCallback(() => {
    // Implement your save logic here
    setHasUnsavedChanges(false);
    toast({
      title: "Changes saved",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  // Handle router navigation
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleRouteChange = (url: string) => {
      if (hasUnsavedChanges && url !== router.asPath) {
        router.events.emit('routeChangeError');
        throw 'Route change aborted due to unsaved changes. Please save your work first.';
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [hasUnsavedChanges, router]);

  // Auth check
  if (!isAdmin) {
    return (
      <Layout>
        <Flex h="80vh" align="center" justify="center">
          <Box 
            p={8}  
            borderRadius="lg" 
            shadow="lg"
            textAlign="center"
            maxW="md"
            w="full"
            mx={4}
          >
            <VStack spacing={6}>
              <Icon as={FiAlertCircle} boxSize={12} color="orange.500" />
              <Heading>
                Admin access required
              </Heading>
              <Text>
                Please log in to access learning features and track your progress.
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={() => router.push("/auth")}
                leftIcon={<FiBook />}
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "lg"
                }}
                transition="all 0.2s"
              >
                Sign In to Continue Learning
              </Button>
              <Text fontSize="sm">
                Don't have an account? You can sign up from the login page.
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Layout>
    );
  }

  const renderSection = () => {
    const sectionProps = {
      onUnsavedChanges: setHasUnsavedChanges,
      initialState: sectionStates[section],
      onSave: handleSave,
    };

    switch (section) {
      case "users":
        return <UserAdmin key="users" {...sectionProps} />;
      case "analytics":
        return <AnalyticsAdmin key="analytics" {...sectionProps} />;
      default:
        return <CourseAdmin key="courses" {...sectionProps} />;
    }
  };

  return (
    <Layout>
      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog
        isOpen={showConfirm}
        leastDestructiveRef={undefined}
        onClose={cancelAction}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Unsaved Changes
            </AlertDialogHeader>

            <AlertDialogBody>
              You have unsaved changes. Are you sure you want to leave? All unsaved changes will be lost.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={cancelAction}>
                Stay on Page
              </Button>
              <Button colorScheme="red" onClick={confirmAction} ml={3}>
                Leave Anyway
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Flex w="100%" h="100%" position="relative" overflow="hidden">
        {/* Header with Save Button */}
        {hasUnsavedChanges && (
          <Box
            position="fixed"
            top="70px"
            left="50%"
            transform="translateX(-50%)"
            bg="orange.500"
            color="white"
            px={4}
            py={2}
            borderRadius="md"
            zIndex={20}
            shadow="lg"
          >
            <Flex align="center" gap={3}>
              <Text fontSize="sm" fontWeight="medium">
                You have unsaved changes
              </Text>
              <Button
                size="sm"
                colorScheme="white"
                variant="outline"
                leftIcon={<FiSave />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Flex>
          </Box>
        )}

        {/* Sidebar (desktop) or Bottom Bar (mobile) */}
        <Stack
          direction={isMobile ? "row" : "column"}
          spacing={2}
          h={isMobile ? "60px" : "100vh"}
          w={isMobile ? "100%" : "70px"}
          borderTop={isMobile ? "1px solid" : undefined}
          borderRight={isMobile ? undefined : "1px solid"}
          borderColor="gray.200"
          mt={4}
          justify="center"
          align="center"
          position="fixed"
          bottom={isMobile ? 0 : undefined}
          left={0}
          top={isMobile ? undefined : 0}
          zIndex={10}
          bg="white"
          _dark={{bg:"gray.900"}}
        >
          <Tooltip label="Courses" placement="right" hasArrow p={8}>
            <IconButton
              aria-label="Courses"
              icon={<BookOpenIcon />}
              variant={section === "courses" ? "solid" : "ghost"}
              colorScheme="blue"
              rounded="xl"
              onClick={() => handleSectionChange("courses")}
            />
          </Tooltip>
          <Tooltip label="Users" placement="right" hasArrow p={8}>
            <IconButton
              aria-label="Users"
              icon={<UserGroupIcon />}
              variant={section === "users" ? "solid" : "ghost"}
              colorScheme="blue"
              rounded="xl"
              onClick={() => handleSectionChange("users")}
            />
          </Tooltip>
          <Tooltip label="Analytics" placement="right" hasArrow p={8}>
            <IconButton
              aria-label="Analytics"
              icon={<ChartBarIcon />}
              variant={section === "analytics" ? "solid" : "ghost"}
              colorScheme="blue"
              rounded="xl"
              onClick={() => handleSectionChange("analytics")}
            />
          </Tooltip>
        </Stack>

        {/* Main Content */}
        <Box
          flex="1"
          ml={isMobile ? 0 : "70px"}
          mb={isMobile ? "60px" : 0}
          p={4}
          overflowY="auto"
          w="100%"
          h="100%"
          pt={hasUnsavedChanges ? "100px" : "20px"}
          transition="padding-top 0.2s"
        >
          <Suspense 
            fallback={
              <Flex justify="center" align="center" h="200px">
                <Spinner size="xl" />
              </Flex>
            }
          >
            {renderSection()}
          </Suspense>
        </Box>
      </Flex>
    </Layout>
  );
}