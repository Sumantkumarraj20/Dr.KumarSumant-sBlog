// pages/admin.tsx
"use client";

import { useState, Suspense } from "react";
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
} from "@chakra-ui/react";
import {
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/authContext";
import { FiAlertCircle, FiBook } from "react-icons/fi";
import { useRouter } from "next/router";

// Dynamically import sections for code-splitting
const CourseAdmin = dynamic(() => import("@/components/admin/CourseAdmin"), {
  loading: () => <Spinner size="lg" />,
});
const UserAdmin = dynamic(() => import("@/components/admin/UserAdmin"), {
  loading: () => <Spinner size="lg" />,
});
const AnalyticsAdmin = dynamic(() => import("@/components/admin/AnalyticsAdmin"), {
  loading: () => <Spinner size="lg" />,
});

type Section = "courses" | "users" | "analytics";

export default function AdminPage() {
  const [section, setSection] = useState<Section>("courses");
  const isMobile = useBreakpointValue({ base: true, md: false });
  const {profile} = useAuth()
  const isAdmin = profile?.is_admin;
  const router = useRouter()


  const renderSection = () => {
    switch (section) {
      case "users":
        return <UserAdmin />;
      case "analytics":
        return <AnalyticsAdmin />;
      default:
        return <CourseAdmin />;
    }
  };
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
            <Heading >
              Admin access required
            </Heading>
            <Text >
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

  return (
    <Layout>
      <Flex w="100%" h="100%" position="relative" overflow="hidden">
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
        >
          <Tooltip label="Courses" placement="right" hasArrow p={8}>
            <IconButton
              aria-label="Courses"
              icon={<BookOpenIcon />}
              variant={section === "courses" ? "solid" : "ghost"}
              colorScheme="blue"
              rounded="xl"
              onClick={() => setSection("courses")}
            />
          </Tooltip>
          <Tooltip label="Users" placement="right" hasArrow p={8}>
            <IconButton
              aria-label="Users"
              icon={<UserGroupIcon />}
              variant={section === "users" ? "solid" : "ghost"}
              colorScheme="blue"
              rounded="xl"
              onClick={() => setSection("users")}
            />
          </Tooltip>
          <Tooltip label="Analytics" placement="right" hasArrow p={8}>
            <IconButton
              aria-label="Analytics"
              icon={<ChartBarIcon />}
              variant={section === "analytics" ? "solid" : "ghost"}
              colorScheme="blue"
              rounded="xl"
              onClick={() => setSection("analytics")}
            />
          </Tooltip>
        </Stack>

        {/* Main Content */}
        <Box
          flex="1"
          ml={isMobile ? 0 : "70px"} // leave space for sidebar
          mb={isMobile ? "60px" : 0} // leave space for bottom bar
          p={4}
          overflowY="auto"
          w="100%"
          h="100%"
        >
          <Suspense fallback={<Spinner size="xl" />}>{renderSection()}</Suspense>
        </Box>
      </Flex>
    </Layout>
  );
}

