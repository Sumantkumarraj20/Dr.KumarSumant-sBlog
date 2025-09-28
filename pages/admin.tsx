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
  Stack,
} from "@chakra-ui/react";
import {
  Bars3BottomLeftIcon,
  UserGroupIcon,
  ChartBarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import CourseAdmin from "@/components/admin/CourseAdmin";
import Layout from "@/components/Layout";

export default function AdminPage() {
  const [section, setSection] = useState<"courses" | "users" | "analytics">(
    "courses"
  );
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Layout>
      <Flex w="100%" h="100vh" position="relative">
        {/* Sidebar (vertical) or Bottom Bar (horizontal) */}
        <Stack
          direction={isMobile ? "row" : "column"}
          spacing={4}
          h={isMobile ? "60px" : "100vh"}
          w={isMobile ? "100%" : "60px"}
          borderTop={isMobile ? "1px solid" : undefined}
          borderLeft={isMobile ? undefined : "1px solid"}
          borderColor="gray.200"
          justify="space-around"
          align="center"
          position="fixed"
          bottom={isMobile ? 0 : undefined}
          left={isMobile ? 0 : undefined}
          top={isMobile ? undefined : 0}
          zIndex={1000} // ensure it stays above content
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
        </Stack>

        {/* Main content */}
        <Box
          flex="1"
          ml={isMobile ? 0 : "60px"} // leave space for sidebar
          mb={isMobile ? "60px" : 0} // leave space for bottom bar
          p={4}
          w="100%"
          h="100%"
          overflowY="auto"
        >
          <CourseAdmin />
        </Box>
      </Flex>
    </Layout>
  );
}
