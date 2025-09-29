"use client";

import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Flex,
  Box,
  Spinner,
  useColorModeValue,
  IconButton,
  VStack,
  HStack,
  Tooltip,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Skeleton,
  SkeletonText,
  Icon,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";
import { HomeIcon, BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { fetchCourseProgress, fetchCourseWithContent } from "@/lib/learn";
import { useAuth } from "@/context/authContext";
import { recordProgress } from "@/lib/userProgress";
import type { Course, Module, Unit, Lesson, UserProgress } from "@/types/learn";
import { FiAlertCircle, FiBook } from "react-icons/fi";

// CORRECTED: Lazy load components with proper syntax
const Dashboard = lazy(() => import("@/components/learning/Dashboard"));
const ModulePage = lazy(() => import("@/components/learning/ModulePage"));
const UnitPage = lazy(() => import("@/components/learning/UnitPage"));
const LessonPage = lazy(() => import("@/components/learning/LessonPage"));
const LearningInterface = lazy(() => import("@/components/learning/LearningInterface"));
const Spaced_Repetition = lazy(() => import("@/components/learning/Spaced_Repition"));
const CoursePage = lazy(() => import("@/components/learning/CoursePage"));

type TabType = "dashboard" | "courses" | "srs";

// Optimized loading components
const LoadingFallback = () => (
  <Flex h="200px" align="center" justify="center">
    <Spinner size="lg" thickness="3px" color="blue.500" />
  </Flex>
);

const SkeletonBreadcrumb = () => (
  <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.200">
    <Skeleton height="20px" width="200px" />
  </Box>
);

const PageSkeleton = () => (
  <Box p={4}>
    <Skeleton height="40px" mb={4} />
    <SkeletonText mt="4" noOfLines={6} spacing="4" />
  </Box>
);

// Custom hook for data management
const useCourseData = (userId: string | undefined, courseId: string | undefined) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<UserProgress>({});

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadCourses = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Check cache first with timestamp validation (5 minutes)
        const cacheKey = `courses-${userId}`;
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = 5 * 60 * 1000; // 5 minutes
        
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheTime && isMounted) {
            setCourses(data.courses || []);
            setProgressMap(data.progress || {});
            setLoading(false);
            
            // Refresh data in background
            setTimeout(() => loadFreshData(userId, cacheKey), 100);
            return;
          }
        }

        await loadFreshData(userId, cacheKey);
      } catch (err) {
        if (isMounted) {
          console.error("[ERROR] Failed to load courses:", err);
          setLoading(false);
        }
      }
    };

    const loadFreshData = async (userId: string, cacheKey: string) => {
      const [coursesData] = await Promise.all([
        fetchCourseWithContent(),
        new Promise(resolve => setTimeout(resolve, 100)) // Minimal delay for fast networks
      ]);

      if (!isMounted) return;

      setCourses(coursesData || []);
      setLoading(false);

      // Cache the data
      if (coursesData) {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: { courses: coursesData, progress: progressMap },
          timestamp: Date.now()
        }));
      }

      // Load progress in background without blocking UI
      loadProgressInBackground(userId, coursesData);
    };

    const loadProgressInBackground = async (userId: string, coursesData: Course[]) => {
      try {
        const progressData: UserProgress = {};
        
        // Prioritize loading progress for current course first
        const currentCourse = coursesData.find(c => c.id === courseId);
        const coursesToLoad = currentCourse 
          ? [currentCourse, ...coursesData.filter(c => c.id !== courseId)]
          : coursesData;

        // Load in batches for better performance
        const batchSize = 3;
        for (let i = 0; i < coursesToLoad.length; i += batchSize) {
          if (!isMounted) break;
          
          const batch = coursesToLoad.slice(i, i + batchSize);
          const batchPromises = batch.map(course => 
            fetchCourseProgress(userId, course.id)
          );
          
          const batchResults = await Promise.allSettled(batchPromises);
          
          batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && isMounted) {
              progressData[batch[index].id] = result.value;
              // Update progress map progressively
              setProgressMap(prev => ({ 
                ...prev, 
                [batch[index].id]: result.value 
              }));
            }
          });
        }
      } catch (err) {
        console.error("[ERROR] Failed to load progress:", err);
      }
    };

    loadCourses();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [userId, courseId]);

  return { courses, loading, progressMap, setProgressMap };
};

const LearnPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const slugs = Array.isArray(router.query.slugs) ? router.query.slugs : [];
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [navigationInProgress, setNavigationInProgress] = useState(false);

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const sidebarBg = useColorModeValue("white", "gray.700");
  const bottomNavBg = useColorModeValue("white", "gray.700");

  const { courses, loading, progressMap } = useCourseData(user?.id, slugs[0]);

  // Memoize all derived data
  const [courseId, moduleId, unitId, lessonId] = slugs;
  
  const { selectedCourse, selectedModule, selectedUnit, selectedLesson } = useMemo(() => {
    const course = courses.find((c) => c.id === courseId) || null;
    const module = course?.modules?.find((m) => m.id === moduleId) || null;
    const unit = module?.units?.find((u) => u.id === unitId) || null;
    const lesson = unit?.lessons?.find((l) => l.id === lessonId) || null;
    
    return { selectedCourse: course, selectedModule: module, selectedUnit: unit, selectedLesson: lesson };
  }, [courses, courseId, moduleId, unitId, lessonId]);

  // Optimized navigation with progress tracking
  const navigateTo = useCallback((
    tab: TabType,
    course?: Course,
    module?: Module,
    unit?: Unit,
    lesson?: Lesson
  ) => {
    if (navigationInProgress) return;
    
    setNavigationInProgress(true);
    setActiveTab(tab);

    const path = ["/learn", course?.id, module?.id, unit?.id, lesson?.id]
      .filter(Boolean)
      .join("/");

    // Use shallow routing when possible to avoid full page reload
    const isShallow = !lesson; // Only do full navigation for lessons
    router.push(path, undefined, { shallow: isShallow })
      .then(() => setNavigationInProgress(false))
      .catch(() => setNavigationInProgress(false));

    // Record progress if we're navigating to a lesson (non-blocking)
    if (lesson && user?.id && course) {
      recordProgress(user.id, course.id, module?.id, unit?.id, lesson.id)
        .catch(err => console.error("Failed to record progress:", err));
    }
  }, [router, user?.id, navigationInProgress]);

  // Handle course completion
  const handleCourseComplete = useCallback(() => {
    toast({
      title: "Course Completed!",
      description: "Congratulations on finishing the course!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    navigateTo("courses");
  }, [toast, navigateTo]);

  // Memoized breadcrumb render
  const renderBreadcrumb = useMemo(() => {
    if (activeTab !== "courses") return null;
    if (navigationInProgress) return <SkeletonBreadcrumb />;

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

    const currentPageColor = useColorModeValue("gray.700", "gray.300");
    const linkColor = useColorModeValue("blue.600", "blue.300");

    return (
      <Box px={4} py={3} borderBottom="1px solid" borderColor={borderColor}>
        <Breadcrumb fontSize="sm" separator="/">
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={index} isCurrentPage={index === breadcrumbItems.length - 1}>
              <BreadcrumbLink 
                onClick={item.onClick}
                cursor={index === breadcrumbItems.length - 1 ? "default" : "pointer"}
                color={index === breadcrumbItems.length - 1 ? currentPageColor : linkColor}
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
  }, [activeTab, selectedCourse, selectedModule, selectedUnit, selectedLesson, navigateTo, navigationInProgress, borderColor]);

  // Memoized main content render with optimized loading states
  const renderMainContent = useMemo(() => {
    if (loading || authLoading) {
      return <PageSkeleton />;
    }

    if (navigationInProgress) {
      return (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="lg" color="blue.500" />
        </Flex>
      );
    }

    if (activeTab === "dashboard") {
      return (
        <Suspense fallback={<PageSkeleton />}>
          <Dashboard />
        </Suspense>
      );
    }

    if (activeTab === "srs") {
      return (
        <Suspense fallback={<PageSkeleton />}>
          <Spaced_Repetition userId={user?.id || ""} />
        </Suspense>
      );
    }

    if (activeTab === "courses") {
      // Drill-down navigation with optimized loading
      if (!selectedCourse) {
        return (
          <Suspense fallback={<PageSkeleton />}>
            <CoursePage
              courses={courses}
              progressMap={progressMap}
              onSelectCourse={(course) => navigateTo("courses", course)}
            />
          </Suspense>
        );
      } else if (!selectedModule) {
        return (
          <Suspense fallback={<PageSkeleton />}>
            <ModulePage
              course={selectedCourse}
              userId={user?.id || ""}
              onBack={() => navigateTo("courses")}
              onSelectModule={(module) => navigateTo("courses", selectedCourse, module)}
            />
          </Suspense>
        );
      } else if (!selectedUnit) {
        return (
          <Suspense fallback={<PageSkeleton />}>
            <UnitPage
              module={selectedModule}
              userId={user?.id || ""}
              onBack={() => navigateTo("courses", selectedCourse)}
              onSelectUnit={(unit) => navigateTo("courses", selectedCourse, selectedModule, unit)}
            />
          </Suspense>
        );
      } else if (!selectedLesson) {
        return (
          <Suspense fallback={<PageSkeleton />}>
            <LessonPage
              unit={selectedUnit}
              userId={user?.id || ""}
              onBack={() => navigateTo("courses", selectedCourse, selectedModule)}
              onSelectLesson={(lesson) => navigateTo("courses", selectedCourse, selectedModule, selectedUnit, lesson)}
            />
          </Suspense>
        );
      } else {
        return (
          <Suspense fallback={<PageSkeleton />}>
            <LearningInterface
              courseId={selectedCourse.id}
              unit={selectedUnit}
              lessons={selectedUnit.lessons || []}
              userId={user?.id || ""}
              startIndex={selectedUnit.lessons?.findIndex((l) => l.id === selectedLesson.id) || 0}
              onFinishCourse={handleCourseComplete}
              onBack={() => navigateTo("courses", selectedCourse, selectedModule, selectedUnit)}
            />
          </Suspense>
        );
      }
    }

    return null;
  }, [
    activeTab, selectedCourse, selectedModule, selectedUnit, selectedLesson, 
    courses, progressMap, user?.id, lessonId, navigateTo, handleCourseComplete, 
    loading, authLoading, navigationInProgress
  ]);

  // Memoized tab button component
  const TabButton = useCallback(({ tab, icon, label }: { tab: TabType; icon: React.ReactNode; label: string }) => (
    <Tooltip label={label} placement="right" hasArrow>
      <IconButton
        aria-label={label}
        icon={icon as any}
        size="lg"
        variant={activeTab === tab ? "solid" : "ghost"}
        colorScheme={activeTab === tab ? "blue" : "gray"}
        onClick={() => !navigationInProgress && setActiveTab(tab)}
        mb={2}
        isDisabled={navigationInProgress}
        opacity={navigationInProgress ? 0.6 : 1}
        transition="all 0.2s"
        _hover={{ transform: navigationInProgress ? "none" : "scale(1.05)" }}
      />
    </Tooltip>
  ), [activeTab, navigationInProgress]);

  // Show loading state
  if ((loading || authLoading) && courses.length === 0) {
    return (
      <Layout>
        <Flex h="80vh" align="center" justify="center" bg={bgColor}>
          <VStack spacing={4}>
            <Spinner size="xl" thickness="5px" color="blue.500" />
            <Box color={useColorModeValue("gray.600", "gray.400")}>
              Loading your learning dashboard...
            </Box>
          </VStack>
        </Flex>
      </Layout>
    );
  }

  // Auth check
if (!user) {
  return (
    <Layout>
      <Flex h="80vh" align="center" justify="center" bg={bgColor}>
        <Box 
          p={8} 
          bg={useColorModeValue("white", "gray.700")} 
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
              Authentication Required
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
            <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
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
      <Flex minH="100vh" bg={bgColor} direction="column">
        {/* Sidebar for wide screens */}
        <Flex flex="1" position="relative" minH={"100vh"}>
          <VStack
            display={{ base: "none", md: "flex" }}
            spacing={4}
            p={4}
            bg={sidebarBg}
            borderRight="1px solid"
            borderColor={borderColor}
            position="sticky"
            top={0}
            height="100vh"
            align="center"
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
          <Box flex="1" display="flex" flexDirection="column" minWidth={0}>
            {/* Breadcrumb navigation */}
            {renderBreadcrumb}
            
            {/* Main content */}
            <Box flex="1" p={4} pb={{ base: 16, md: 4 }}>
              {renderMainContent}
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
          bg={bottomNavBg}
          justify="space-around"
          p={2}
          borderTop="1px solid"
          borderColor={borderColor}
          zIndex={50}
          backdropFilter="blur(10px)"
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