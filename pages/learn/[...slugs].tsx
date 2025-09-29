// pages/learn/[...slugs].tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Flex,
  Box,
  Spinner,
  useColorModeValue,
  IconButton,
  VStack,
  HStack,
  Text,
  Tooltip,
  useToast, // Fixed: useToast instead of Toast
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { HomeIcon, BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import Dashboard from "@/components/learning/Dashboard";
import ModulePage from "@/components/learning/ModulePage";
import UnitPage from "@/components/learning/UnitPage";
import LessonPage from "@/components/learning/LessonPage";
import LearningInterface from "@/components/learning/LearningInterface";
import Spaced_Repetition from "@/components/learning/Spaced_Repition";
import { fetchCourseProgress, fetchCourseWithContent } from "@/lib/learn";
import { useAuth } from "@/context/authContext";
import { recordProgress } from "@/lib/userProgress";
import CoursePage from "@/components/learning/CoursePage";
import type { Course, Module, Unit, Lesson, UserProgress } from "@/types/learn";

type TabType = "dashboard" | "courses" | "srs";

const LearnPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const slugs = Array.isArray(router.query.slugs) ? router.query.slugs : [];
  const toast = useToast(); // Fixed: useToast hook

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [progressMap, setProgressMap] = useState<UserProgress>({});

  const bgColor = useColorModeValue("gray.50", "gray.800");

  // Load courses and progress
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const data = await fetchCourseWithContent();
        setCourses(data || []);

        // Load progress for each course
        if (user?.id) {
          const progressData: UserProgress = {};
          for (const course of data) {
            const progress = await fetchCourseProgress(user.id, course.id);
            progressData[course.id] = progress;
          }
          setProgressMap(progressData);
        }
      } catch (err) {
        console.error("[ERROR] Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [user]);

  if (loading || authLoading) {
    return (
      <Flex h="80vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" thickness="5px" color="blue.500" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex h="80vh" align="center" justify="center" bg={bgColor}>
        Please log in to access learning features.
      </Flex>
    );
  }

  // Derive current selection from slugs
  const [courseId, moduleId, unitId, lessonId] = slugs;
  const selectedCourse = courses.find((c) => c.id === courseId) || null;
  const selectedModule = selectedCourse?.modules?.find((m) => m.id === moduleId) || null;
  const selectedUnit = selectedModule?.units?.find((u) => u.id === unitId) || null;
  const selectedLesson = selectedUnit?.lessons?.find((l) => l.id === lessonId) || null;

  // Enhanced navigation helper
  const navigateTo = (
    tab: TabType,
    course?: Course,
    module?: Module,
    unit?: Unit,
    lesson?: Lesson
  ) => {
    setActiveTab(tab);

    const path = ["/learn", course?.id, module?.id, unit?.id, lesson?.id]
      .filter(Boolean)
      .join("/");

    router.push(path);

    // Record progress if we're navigating to a lesson
    if (lesson && user?.id && course) {
      recordProgress(user.id, course.id, module?.id, unit?.id, lesson.id);
    }
  };

  // Handle course completion
  const handleCourseComplete = () => {
    toast({ // Fixed: using toast from useToast hook
      title: "Course Completed!",
      description: "Congratulations on finishing the course!",
      status: "success",
      duration: 5000,
    });
    navigateTo("courses");
  };

  // Render breadcrumb based on current selection
  const renderBreadcrumb = () => {
    if (activeTab !== "courses") return null;

    const breadcrumbItems = [
      { label: "Courses", onClick: () => navigateTo("courses") }
    ];

    if (selectedCourse) {
      breadcrumbItems.push({
        label: selectedCourse.title,
        onClick: () => navigateTo("courses", selectedCourse)
      });
    }

    if (selectedModule) {
      breadcrumbItems.push({
        label: selectedModule.title,
        onClick: () => navigateTo("courses", selectedCourse, selectedModule)
      });
    }

    if (selectedUnit) {
      breadcrumbItems.push({
        label: selectedUnit.title,
        onClick: () => navigateTo("courses", selectedCourse, selectedModule, selectedUnit)
      });
    }

    if (selectedLesson) {
      breadcrumbItems.push({
        label: selectedLesson.title,
        onClick: () => navigateTo("courses", selectedCourse, selectedModule, selectedUnit, selectedLesson)
      });
    }

    return (
      <Box px={4} py={3} borderBottom="1px solid" borderColor={useColorModeValue("gray.200", "gray.600")}>
        <Breadcrumb fontSize="sm" separator="/">
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={index} isCurrentPage={index === breadcrumbItems.length - 1}>
              <BreadcrumbLink 
                onClick={item.onClick}
                cursor={index === breadcrumbItems.length - 1 ? "default" : "pointer"}
                color={index === breadcrumbItems.length - 1 ? useColorModeValue("gray.700", "gray.300") : useColorModeValue("blue.600", "blue.300")}
                fontWeight={index === breadcrumbItems.length - 1 ? "semibold" : "normal"}
                _hover={index === breadcrumbItems.length - 1 ? {} : { textDecoration: "underline" }}
              >
                {item.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </Box>
    );
  };

  // Render main content based on active tab and selection
  const renderMainContent = () => {
    if (activeTab === "dashboard") {
      return <Dashboard />;
    }

    if (activeTab === "srs") {
      return <Spaced_Repetition userId={user.id} />;
    }

    if (activeTab === "courses") {
      // Drill-down navigation
      if (!selectedCourse) {
        return (
          <CoursePage
            courses={courses}
            progressMap={progressMap}
            onSelectCourse={(course) => navigateTo("courses", course)}
          />
        );
      } else if (!selectedModule) {
        return (
          <ModulePage
            course={selectedCourse}
            userId={user.id}
            onBack={() => navigateTo("courses")}
            onSelectModule={(module) =>
              navigateTo("courses", selectedCourse, module)
            }
          />
        );
      } else if (!selectedUnit) {
        return (
          <UnitPage
            module={selectedModule}
            userId={user.id}
            onBack={() => navigateTo("courses", selectedCourse)}
            onSelectUnit={(unit) =>
              navigateTo("courses", selectedCourse, selectedModule, unit)
            }
          />
        );
      } else if (!selectedLesson) {
        return (
          <LessonPage
            unit={selectedUnit}
            lesson={lessonId}
            userId={user.id}
            onBack={() => navigateTo("courses", selectedCourse, selectedModule)}
            onSelectLesson={(lesson) =>
              navigateTo(
                "courses",
                selectedCourse,
                selectedModule,
                selectedUnit,
                lesson
              )
            }
          />
        );
      } else {
        // We have a lesson selected - show LearningInterface
        return (
          <LearningInterface
            courseId={selectedCourse.id}
            unit={selectedUnit}
            lessons={selectedUnit.lessons || []}
            userId={user.id}
            startIndex={
              selectedUnit.lessons?.findIndex(
                (l) => l.id === selectedLesson.id
              ) || 0
            }
            onFinishCourse={handleCourseComplete}
            onBack={() =>
              navigateTo(
                "courses",
                selectedCourse,
                selectedModule,
                selectedUnit
              )
            }
          />
        );
      }
    }

    return null;
  };

  // Tab button component
  const TabButton = ({
    tab,
    icon,
    label,
  }: {
    tab: TabType;
    icon: React.ReactNode;
    label: string;
  }) => (
    <Tooltip label={label} placement="right">
      <IconButton
        aria-label={label}
        icon={icon as any}
        size="lg"
        variant={activeTab === tab ? "solid" : "ghost"}
        colorScheme={activeTab === tab ? "blue" : "gray"}
        onClick={() => setActiveTab(tab)}
        mb={2}
      />
    </Tooltip>
  );

  return (
    <Layout>
      <Flex minH="100vh" bg={bgColor} direction="column">
        {/* Sidebar for wide screens */}
        <Flex flex="1">
          <VStack
            display={{ base: "none", md: "flex" }}
            spacing={4}
            p={4}
            bg={useColorModeValue("white", "gray.700")}
            borderRight="1px solid"
            borderColor={useColorModeValue("gray.200", "gray.600")}
          >
            <TabButton
              tab="dashboard"
              icon={<HomeIcon className="h-6 w-6" />}
              label="Dashboard"
            />
            <TabButton
              tab="courses"
              icon={<BookOpenIcon className="h-6 w-6" />}
              label="Courses"
            />
            <TabButton
              tab="srs"
              icon={<ClockIcon className="h-6 w-6" />}
              label="Spaced Repetition"
            />
          </VStack>

          {/* Main content area */}
          <Box flex="1" display="flex" flexDirection="column">
            {/* Breadcrumb navigation - FIXED: Now actually rendered */}
            {renderBreadcrumb()}
            
            {/* Main content */}
            <Box flex="1" p={4} pb={{ base: 16, md: 4 }}>
              {renderMainContent()}
            </Box>
          </Box>
        </Flex>

        {/* Bottom nav for small screens */}
        <HStack
          display={{ base: "flex", md: "none" }}
          position="fixed"
          bottom={0}
          left={0}
          w="100%"
          bg={useColorModeValue("white", "gray.700")}
          justify="space-around"
          p={2}
          borderTop="1px solid"
          borderColor={useColorModeValue("gray.200", "gray.600")}
          zIndex={50}
        >
          <TabButton
            tab="dashboard"
            icon={<HomeIcon className="h-6 w-6" />}
            label="Dashboard"
          />
          <TabButton
            tab="courses"
            icon={<BookOpenIcon className="h-6 w-6" />}
            label="Courses"
          />
          <TabButton
            tab="srs"
            icon={<ClockIcon className="h-6 w-6" />}
            label="SRS"
          />
        </HStack>
      </Flex>
    </Layout>
  );
};

export default LearnPage;