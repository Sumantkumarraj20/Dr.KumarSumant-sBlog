// pages/admin.tsx
import { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  IconButton,
  Text,
  Collapse,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useBreakpointValue,
  Divider,
} from "@chakra-ui/react";
import {
  Bars3BottomLeftIcon,
  UserGroupIcon,
  ChartBarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "@/components/admin/Sidebar"; // nested menu sidebar
import CourseSection from "@/components/admin/CourseSection";
import UsersSection from "@/components/admin/UsersSection";
import AnalyticSection from "@/components/admin/AnalyticSection";
import Layout from "@/components/Layout";

export default function AdminPage() {
  const [section, setSection] = useState<"courses" | "users" | "analytics">(
    "courses"
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Layout>
      <Flex h="100vh" w="100vw" direction="row" overflow="hidden">
        {/* Sidebar (desktop only) */}
        {!isMobile && (
          <Collapse in={sidebarOpen} animateOpacity style={{ height: "auto" }}>
            <Box
              w="250px"
              h="100%"
              bg="gray.50"
              borderRight="1px solid"
              borderColor="gray.200"
              p={4}
            >
              <Sidebar section={section} setSection={setSection} />
            </Box>
          </Collapse>
        )}

        {/* Main Content */}
        <Flex flex="1" direction="column" h="100%" overflow="hidden">
          {/* Topbar */}
          <HStack
            h="60px"
            px={4}
            bg="white"
            _dark={{ bg: "gray.800" }}
            borderBottom="1px solid"
            borderColor="gray.200"
            justify="space-between"
          >
            <HStack spacing={3}>
              {isMobile && (
                <IconButton
                  aria-label="Menu"
                  icon={<Bars3BottomLeftIcon />}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  variant="ghost"
                />
              )}
              <Text fontSize="lg" fontWeight="bold">
                Admin Dashboard
              </Text>
            </HStack>
            <Breadcrumb fontSize="sm">
              <BreadcrumbItem>
                <BreadcrumbLink>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>{section}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </HStack>

          {/* Content */}
          <Box flex="1" overflowY="auto" p={6} bg="gray.100">
            {section === "courses" && <CourseSection />}
            {section === "users" && <UsersSection />}
            {section === "analytics" && <AnalyticSection />}
          </Box>

          {/* Bottom Mobile Nav */}
          {isMobile && (
            <HStack
              h="60px"
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              justify="space-around"
            >
              <IconButton
                aria-label="Courses"
                icon={<BookOpenIcon />}
                variant={section === "courses" ? "solid" : "ghost"}
                onClick={() => setSection("courses")}
              />
              <IconButton
                aria-label="Users"
                icon={<UserGroupIcon />}
                variant={section === "users" ? "solid" : "ghost"}
                onClick={() => setSection("users")}
              />
              <IconButton
                aria-label="Analytics"
                icon={<ChartBarIcon />}
                variant={section === "analytics" ? "solid" : "ghost"}
                onClick={() => setSection("analytics")}
              />
            </HStack>
          )}
        </Flex>
      </Flex>
    </Layout>
  );
}
