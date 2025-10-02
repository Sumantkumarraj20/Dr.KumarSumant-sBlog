"use client";

import {
  useState,
  useEffect,
  lazy,
  Suspense,
  useMemo,
  useCallback,
} from "react";
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
import SEO from "@/components/Seo";

// Lazy load components with proper error boundaries
const Dashboard = lazy(() =>
  import("@/components/learning/Dashboard").catch(() => ({
    default: () => <Text>Failed to load Dashboard</Text>,
  }))
);
const ModulePage = lazy(() =>
  import("@/components/learning/ModulePage").catch(() => ({
    default: () => <Text>Failed to load Module</Text>,
  }))
);
const UnitPage = lazy(() =>
  import("@/components/learning/UnitPage").catch(() => ({
    default: () => <Text>Failed to load Unit</Text>,
  }))
);
const LessonPage = lazy(() =>
  import("@/components/learning/LessonPage").catch(() => ({
    default: () => <Text>Failed to load Lesson</Text>,
  }))
);
const LearningInterface = lazy(() =>
  import("@/components/learning/LearningInterface").catch(() => ({
    default: () => <Text>Failed to load Learning Interface</Text>,
  }))
);
const Spaced_Repetition = lazy(() =>
  import("@/components/learning/Spaced_Repition").catch(() => ({
    default: () => <Text>Failed to load Spaced Repetition</Text>,
  }))
);
const CoursePage = lazy(() =>
  import("@/components/learning/CoursePage").catch(() => ({
    default: () => <Text>Failed to load Courses</Text>,
  }))
);

type TabType = "dashboard" | "courses" | "srs";

// Optimized loading components with better skeletons
const LoadingFallback = () => (
  <Flex h="200px" align="center" justify="center">
    <Spinner size="lg" thickness="3px" color="blue.500" speed="0.65s" />
  </Flex>
);

const SkeletonBreadcrumb = () => (
  <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.200">
    <Skeleton height="20px" width="200px" speed={1.2} />
  </Box>
);

const PageSkeleton = () => (
  <Box p={4}>
    <Skeleton height="40px" mb={4} speed={1.2} />
    <SkeletonText mt="4" noOfLines={6} spacing="4" speed={1.2} />
  </Box>
);

// Optimized custom hook for data management
const useCourseData = (
  userId: string | undefined,
  courseId: string | undefined
) => {
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
        // Enhanced caching with versioning
        const cacheKey = `courses-v2-${userId}`;
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = 10 * 60 * 1000; // 10 minutes

        if (cached) {
          const { data, timestamp, version = 1 } = JSON.parse(cached);
          const isFresh = Date.now() - timestamp < cacheTime;

          if (isFresh && isMounted && version >= 1) {
            setCourses(data.courses || []);
            setProgressMap(data.progress || {});
            setLoading(false);

            // Background refresh for stale data
            if (Date.now() - timestamp > cacheTime / 2) {
              setTimeout(() => loadFreshData(userId, cacheKey), 500);
            }
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
      try {
        const [coursesData] = await Promise.all([
          fetchCourseWithContent(),
          // Small delay to show loading state for better UX
          new Promise((resolve) => setTimeout(resolve, 300)),
        ]);

        if (!isMounted) return;

        setCourses(coursesData || []);
        setLoading(false);

        if (coursesData) {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: { courses: coursesData, progress: progressMap },
              timestamp: Date.now(),
              version: 2,
            })
          );
        }

        // Load progress in background without blocking
        loadProgressInBackground(userId, coursesData);
      } catch (error) {
        if (isMounted) {
          setLoading(false);
          console.error("Failed to load fresh data:", error);
        }
      }
    };

    const loadProgressInBackground = async (
      userId: string,
      coursesData: Course[]
    ) => {
      try {
        const progressData: UserProgress = {};

        // Only load progress for current course immediately, others in background
        const currentCourse = coursesData.find((c) => c.id === courseId);
        const coursesToLoad = currentCourse
          ? [currentCourse] // Load current course first
          : coursesData.slice(0, 2); // Load first 2 courses for dashboard

        // Load initial batch
        const initialPromises = coursesToLoad.map((course) =>
          fetchCourseProgress(userId, course.id)
        );

        const initialResults = await Promise.allSettled(initialPromises);

        initialResults.forEach((result, index) => {
          if (result.status === "fulfilled" && isMounted) {
            progressData[coursesToLoad[index].id] = result.value;
            setProgressMap((prev) => ({
              ...prev,
              [coursesToLoad[index].id]: result.value,
            }));
          }
        });

        // Load remaining courses in background
        if (coursesData.length > coursesToLoad.length) {
          setTimeout(async () => {
            const remainingCourses = coursesData.filter(
              (c) => !coursesToLoad.includes(c)
            );
            const remainingPromises = remainingCourses.map((course) =>
              fetchCourseProgress(userId, course.id)
            );

            const remainingResults = await Promise.allSettled(
              remainingPromises
            );

            remainingResults.forEach((result, index) => {
              if (result.status === "fulfilled" && isMounted) {
                setProgressMap((prev) => ({
                  ...prev,
                  [remainingCourses[index].id]: result.value,
                }));
              }
            });
          }, 1000);
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

// Optimized route detection logic
const useRouteDetection = (slugs: string[]) => {
  return useMemo(() => {
    // Handle empty route - show courses by default
    if (slugs.length === 0) {
      return {
        activeTab: "courses" as TabType,
        courseId: undefined,
        moduleId: undefined,
        unitId: undefined,
        lessonId: undefined,
      };
    }

    const [firstSlug, ...restSlugs] = slugs;

    // Handle special routes
    if (firstSlug === "dashboard") {
      return { activeTab: "dashboard" as TabType };
    }

    if (firstSlug === "srs" || firstSlug === "spaced_repetition") {
      return { activeTab: "srs" as TabType };
    }

    // Handle course drill-down routes
    return {
      activeTab: "courses" as TabType,
      courseId: firstSlug,
      moduleId: restSlugs[0],
      unitId: restSlugs[1],
      lessonId: restSlugs[2],
    };
  }, [slugs]);
};

// Optimized course data derivation
const useCourseDerivation = (
  courses: Course[],
  routeInfo: ReturnType<typeof useRouteDetection>,
  activeTab: TabType
) => {
  return useMemo(() => {
    if (activeTab !== "courses" || !routeInfo.courseId) {
      return {
        selectedCourse: null,
        selectedModule: null,
        selectedUnit: null,
        selectedLesson: null,
      };
    }

    // Fast course lookup using Map for better performance
    const courseMap = new Map(courses.map((c) => [c.id, c]));
    const courseBySlug = new Map(courses.map((c) => [c.slug, c]));

    const course =
      courseMap.get(routeInfo.courseId) ||
      courseBySlug.get(routeInfo.courseId) ||
      null;

    if (!course) {
      return {
        selectedCourse: null,
        selectedModule: null,
        selectedUnit: null,
        selectedLesson: null,
      };
    }

    // Only proceed with module lookup if moduleId exists
    const module = routeInfo.moduleId
      ? (course.modules || []).find(
          (m) => m.id === routeInfo.moduleId || m.slug === routeInfo.moduleId
        ) || null
      : null;

    // Only proceed with unit lookup if unitId exists and module exists
    const unit =
      routeInfo.unitId && module
        ? (module.units || []).find(
            (u) => u.id === routeInfo.unitId || u.slug === routeInfo.unitId
          ) || null
        : null;

    // Only proceed with lesson lookup if lessonId exists and unit exists
    const lesson =
      routeInfo.lessonId && unit
        ? (unit.lessons || []).find(
            (l) => l.id === routeInfo.lessonId || l.slug === routeInfo.lessonId
          ) || null
        : null;

    return {
      selectedCourse: course,
      selectedModule: module,
      selectedUnit: unit,
      selectedLesson: lesson,
    };
  }, [courses, routeInfo, activeTab]);
};

const LearnPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const slugs = Array.isArray(router.query.slugs) ? router.query.slugs : [];
  const toast = useToast();

  // Optimized state management
  const routeInfo = useRouteDetection(slugs);
  const [activeTab, setActiveTab] = useState<TabType>(routeInfo.activeTab);
  const [navigationInProgress, setNavigationInProgress] = useState(false);

  // Move useColorModeValue calls directly into the component (not memoized)
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const sidebarBg = useColorModeValue("white", "gray.700");
  const bottomNavBg = useColorModeValue("white", "gray.700");
  const currentPageColor = useColorModeValue("gray.700", "gray.300");
  const linkColor = useColorModeValue("blue.600", "blue.300");
  const textColor = useColorModeValue("gray.600", "gray.400");

  // Optimized data loading
  const shouldLoadCourses = activeTab === "courses";
  const { courses, loading, progressMap } = useCourseData(
    user?.id,
    shouldLoadCourses ? routeInfo.courseId : undefined
  );

  // Optimized course derivation
  const { selectedCourse, selectedModule, selectedUnit, selectedLesson } =
    useCourseDerivation(courses, routeInfo, activeTab);

  // Sync active tab with route changes
  useEffect(() => {
    if (routeInfo.activeTab !== activeTab) {
      setActiveTab(routeInfo.activeTab);
    }
  }, [routeInfo.activeTab, activeTab]);

  // Optimized navigation with debouncing
  const navigateTo = useCallback(
    (
      tab: TabType,
      course?: Course,
      module?: Module,
      unit?: Unit,
      lesson?: Lesson
    ) => {
      if (navigationInProgress) return;

      setNavigationInProgress(true);

      let path = "/learn";

      // Build optimized path
      if (tab === "dashboard") {
        path = "/learn/dashboard";
      } else if (tab === "srs") {
        path = "/learn/srs";
      } else if (tab === "courses") {
        if (course) {
          const pathParts = [course.slug || course.id];
          if (module) pathParts.push(module.slug || module.id);
          if (unit) pathParts.push(unit.slug || unit.id);
          if (lesson) pathParts.push(lesson.slug || lesson.id);
          path = `/learn/${pathParts.join("/")}`;
        } else {
          path = "/learn";
        }
      }

      // Smart shallow routing
      const isShallow = tab !== "courses" || !lesson;

      router
        .push(path, undefined, { shallow: isShallow })
        .then(() => setNavigationInProgress(false))
        .catch(() => setNavigationInProgress(false));

      // Non-blocking progress recording
      if (lesson && user?.id && course) {
        recordProgress(
          user.id,
          course.id,
          module?.id,
          unit?.id,
          lesson.id
        ).catch((err) => console.error("Failed to record progress:", err));
      }
    },
    [router, user?.id, navigationInProgress]
  );

  // Memoized course completion handler
  const handleCourseComplete = useCallback(() => {
    toast({
      title: "Course Completed!",
      description: "Congratulations on finishing the course!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigateTo("courses");
  }, [toast, navigateTo]);

  // Optimized breadcrumb render
  const renderBreadcrumb = useMemo(() => {
    if (activeTab !== "courses") return null;
    if (navigationInProgress) return <SkeletonBreadcrumb />;

    const breadcrumbItems = [
      { label: "Courses", onClick: () => navigateTo("courses") },
    ];

    if (selectedCourse) {
      breadcrumbItems.push({
        label: selectedCourse.title,
        onClick: () => navigateTo("courses", selectedCourse),
      });
    }

    if (selectedModule) {
      breadcrumbItems.push({
        label: selectedModule.title,
        onClick: () => navigateTo("courses", selectedCourse, selectedModule),
      });
    }

    if (selectedUnit) {
      breadcrumbItems.push({
        label: selectedUnit.title,
        onClick: () =>
          navigateTo("courses", selectedCourse, selectedModule, selectedUnit),
      });
    }

    if (selectedLesson) {
      breadcrumbItems.push({
        label: selectedLesson.title,
        onClick: () =>
          navigateTo(
            "courses",
            selectedCourse,
            selectedModule,
            selectedUnit,
            selectedLesson
          ),
      });
    }

    return (
      <Box px={4} py={3} borderBottom="1px solid" borderColor={borderColor}>
        <Breadcrumb fontSize="sm" separator="/">
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem
              key={index}
              isCurrentPage={index === breadcrumbItems.length - 1}
            >
              <BreadcrumbLink
                onClick={item.onClick}
                cursor={
                  index === breadcrumbItems.length - 1 ? "default" : "pointer"
                }
                color={
                  index === breadcrumbItems.length - 1
                    ? currentPageColor
                    : linkColor
                }
                fontWeight={
                  index === breadcrumbItems.length - 1 ? "semibold" : "normal"
                }
                _hover={
                  index === breadcrumbItems.length - 1
                    ? {}
                    : { textDecoration: "underline" }
                }
              >
                {item.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </Box>
    );
  }, [
    activeTab,
    selectedCourse,
    selectedModule,
    selectedUnit,
    selectedLesson,
    navigateTo,
    navigationInProgress,
    borderColor,
    currentPageColor,
    linkColor,
  ]);

  // Optimized main content render with proper level detection
  const renderMainContent = useMemo(() => {
    if (loading || authLoading) return <PageSkeleton />;
    if (navigationInProgress) return <LoadingFallback />;

    switch (activeTab) {
      case "dashboard":
        return (
          <Suspense fallback={<PageSkeleton />}>
            <Dashboard />
          </Suspense>
        );

      case "srs":
        return (
          <Suspense fallback={<PageSkeleton />}>
            <Spaced_Repetition userId={user?.id || ""} />
          </Suspense>
        );

      case "courses":
        // Course list level
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
        }

        // Course level - show modules
        if (!selectedModule) {
          return (
            <Suspense fallback={<PageSkeleton />}>
              <ModulePage
                course={selectedCourse}
                userId={user?.id || ""}
                onBack={() => navigateTo("courses")}
                onSelectModule={(module) =>
                  navigateTo("courses", selectedCourse, module)
                }
              />
            </Suspense>
          );
        }

        // Module level - show units
        if (!selectedUnit) {
          return (
            <Suspense fallback={<PageSkeleton />}>
              <UnitPage
                module={selectedModule}
                userId={user?.id || ""}
                onBack={() => navigateTo("courses", selectedCourse)}
                onSelectUnit={(unit) =>
                  navigateTo("courses", selectedCourse, selectedModule, unit)
                }
              />
            </Suspense>
          );
        }

        // Unit level - show lessons
        if (!selectedLesson) {
          return (
            <Suspense fallback={<PageSkeleton />}>
              <LessonPage
                unit={selectedUnit}
                userId={user?.id || ""}
                onBack={() =>
                  navigateTo("courses", selectedCourse, selectedModule)
                }
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
            </Suspense>
          );
        }

        // Lesson level - show learning interface
        return (
          <Suspense fallback={<PageSkeleton />}>
            <LearningInterface
              courseId={selectedCourse.id}
              unit={selectedUnit}
              lessons={selectedUnit.lessons || []}
              userId={user?.id || ""}
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
          </Suspense>
        );

      default:
        return null;
    }
  }, [
    activeTab,
    selectedCourse,
    selectedModule,
    selectedUnit,
    selectedLesson,
    courses,
    progressMap,
    user?.id,
    navigateTo,
    handleCourseComplete,
    loading,
    authLoading,
    navigationInProgress,
  ]);

  // Optimized tab button component
  const TabButton = useCallback(
    ({
      tab,
      icon,
      label,
    }: {
      tab: TabType;
      icon: React.ReactNode;
      label: string;
    }) => (
      <Tooltip label={label} placement="right" hasArrow>
        <IconButton
          aria-label={label}
          icon={icon as any}
          size="lg"
          variant={activeTab === tab ? "solid" : "ghost"}
          colorScheme={activeTab === tab ? "blue" : "gray"}
          onClick={() => !navigationInProgress && navigateTo(tab)}
          mb={2}
          isDisabled={navigationInProgress}
          opacity={navigationInProgress ? 0.6 : 1}
          transition="all 0.2s ease-in-out"
          _hover={{
            transform: navigationInProgress ? "none" : "scale(1.05)",
            shadow: "md",
          }}
        />
      </Tooltip>
    ),
    [activeTab, navigationInProgress, navigateTo]
  );

  // Loading state
  if ((loading || authLoading) && courses.length === 0) {
    return (
      <>
        <SEO title="Identifying you" />
        <Layout>
          <Flex h="80vh" align="center" justify="center" bg={bgColor}>
            <VStack spacing={4}>
              <Spinner
                size="xl"
                thickness="4px"
                color="blue.500"
                speed="0.65s"
              />
              <Text color={textColor}>Loading your learning dashboard...</Text>
            </VStack>
          </Flex>
        </Layout>
      </>
    );
  }

  // Auth check
  if (!user) {
    return (
      <>
        <SEO title="You are Unknown to me" />
        <Layout>
          <Flex h="80vh" align="center" justify="center" bg={bgColor}>
            <Box
              p={8}
              bg={sidebarBg}
              borderRadius="lg"
              shadow="xl"
              textAlign="center"
              maxW="md"
              w="full"
              mx={4}
            >
              <VStack spacing={6}>
                <Icon as={FiAlertCircle} boxSize={12} color="orange.500" />
                <Heading size="lg">Authentication Required</Heading>
                <Text color={textColor}>
                  Please log in to access learning features and track your
                  progress.
                </Text>
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  onClick={() => router.push("/auth")}
                  leftIcon={<FiBook />}
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s ease-in-out"
                >
                  Sign In to Continue Learning
                </Button>
                <Text fontSize="sm" color={textColor}>
                  Don't have an account? You can sign up from the login page.
                </Text>
              </VStack>
            </Box>
          </Flex>
        </Layout>
      </>
    );
  }

  return (
    <>
      <SEO title="Learn" />
      <Layout>
        <Flex minH="100vh" bg={bgColor} direction="column">
          {/* Sidebar for wide screens */}
          <Flex flex="1" position="relative" minH="100vh">
            <VStack
              display={{ base: "none", md: "flex" }}
              spacing={3}
              p={3}
              bg={sidebarBg}
              borderRight="1px solid"
              borderColor={borderColor}
              position="sticky"
              top={0}
              height="100vh"
              align="center"
              flexShrink={0}
            >
              <TabButton
                tab="dashboard"
                icon={<HomeIcon className="h-5 w-5" />}
                label="Dashboard"
              />
              <TabButton
                tab="courses"
                icon={<BookOpenIcon className="h-5 w-5" />}
                label="Courses"
              />
              <TabButton
                tab="srs"
                icon={<ClockIcon className="h-5 w-5" />}
                label="Spaced Repetition"
              />
            </VStack>

            {/* Main content area */}
            <Box flex="1" display="flex" flexDirection="column" minWidth={0}>
              {renderBreadcrumb}
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
            right={0}
            bg={bottomNavBg}
            justify="space-around"
            p={2}
            borderTop="1px solid"
            borderColor={borderColor}
            zIndex={1000}
            backdropFilter="blur(8px)"
            shadow="lg"
          >
            <TabButton
              tab="dashboard"
              icon={<HomeIcon className="h-5 w-5" />}
              label="Dashboard"
            />
            <TabButton
              tab="courses"
              icon={<BookOpenIcon className="h-5 w-5" />}
              label="Courses"
            />
            <TabButton
              tab="srs"
              icon={<ClockIcon className="h-5 w-5" />}
              label="SRS"
            />
          </HStack>
        </Flex>
      </Layout>
    </>
  );
};

export default LearnPage;
