// components/learning/Dashboard.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/authContext";
import {
  FiBook,
  FiAward,
  FiClock,
  FiTrendingUp,
  FiBarChart2,
  FiPlayCircle,
  FiTarget,
  FiArrowRight,
  FiActivity,
} from "react-icons/fi";
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  Grid,
  GridItem,
  Progress,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  Avatar,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
} from "@chakra-ui/react";

interface DashboardData {
  courseProgress: any[];
  quizPerformance: any[];
  srsStats: {
    totalCards: number;
    dueNow: number;
    retentionRate: number;
    totalReviews: number;
    averageScore: number;
  };
  currentLearning: any | null;
  recentActivity: any[];
  learningStreak: number;
  overallStats: {
    totalCourses: number;
    completedLessons: number;
    totalLessons: number;
    averageQuizScore: number;
  };
}

// Skeleton loader component using Chakra UI Skeleton components
const DashboardSkeleton = () => (
  <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }} p={6}>
    <Box maxW="7xl" mx="auto">
      {/* Header Skeleton */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={2}>
          <Skeleton height="32px" width="256px" />
          <Skeleton height="16px" width="192px" />
        </VStack>
        <HStack spacing={4}>
          <Skeleton height="24px" width="80px" borderRadius="full" />
          <SkeletonCircle size="40px" />
        </HStack>
      </Flex>

      {/* Progress Card Skeleton */}
      <Box 
        bg="white" 
        _dark={{ bg: "gray.800", borderColor: "gray.700"}} 
        rounded="2xl" 
        shadow="sm" 
        border="1px" 
        borderColor="gray.200" 
        p={6} 
        mb={6}
      >
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between">
            <Skeleton height="24px" width="192px" />
            <Skeleton height="32px" width="64px" />
          </Flex>
          <Skeleton height="20px" borderRadius="full" />
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {[...Array(4)].map((_, i) => (
              <VStack key={i} spacing={2}>
                <Skeleton height="16px" width="80px" />
                <Skeleton height="24px" width="48px" />
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Main Content Skeleton */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <VStack spacing={6} align="stretch">
          {[...Array(2)].map((_, i) => (
            <Box 
              key={i} 
              bg="white" 
              _dark={{ bg: "gray.800", borderColor: "gray.700" }} 
              rounded="2xl" 
              shadow="sm" 
              border="1px" 
              borderColor="gray.200" 
              p={6}
            >
              <Skeleton height="24px" width="192px" mb={4} />
              <VStack spacing={4} align="stretch">
                {[...Array(3)].map((_, j) => (
                  <VStack key={j} spacing={2}>
                    <Skeleton height="16px" width="75%" />
                    <Skeleton height="8px" borderRadius="full" />
                  </VStack>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>

        <VStack spacing={6} align="stretch">
          {[...Array(3)].map((_, i) => (
            <Box 
              key={i} 
              bg="white" 
              _dark={{ bg: "gray.800", borderColor: "gray.700" }} 
              rounded="2xl" 
              shadow="sm" 
              border="1px" 
              borderColor="gray.200" 
              p={6}
            >
              <Skeleton height="24px" width="128px" mb={4} />
              <VStack spacing={3} align="stretch">
                {[...Array(4)].map((_, j) => (
                  <Flex key={j} justify="space-between" align="center">
                    <Skeleton height="16px" width="96px" />
                    <Skeleton height="16px" width="32px" />
                  </Flex>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </Grid>
    </Box>
  </Box>
);

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic color values using Chakra UI hooks
  const bgBody = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textPrimary = useColorModeValue("gray.900", "white");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const textAccent = useColorModeValue("blue.600", "blue.400");
  const bgPrimary50 = useColorModeValue("blue.50", "blue.900/20");
  const bgPrimary100 = useColorModeValue("blue.100", "blue.900/30");
  const hoverBg = useColorModeValue("gray.50", "gray.700/50");
  const progressBg = useColorModeValue("gray.200", "gray.700");

  // Memoized data loading function
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Parallel data fetching for better performance
      const [
        courseProgressPromise,
        quizAttemptsPromise,
        srsProgressPromise,
        quizActivitiesPromise,
        srsActivitiesPromise
      ] = await Promise.allSettled([
        // Course progress
        supabase
          .from("user_course_progress")
          .select(
            `
            *,
            courses(title, description, slug),
            modules(title, slug),
            units(title, slug),
            lessons(title, slug)
          `
          )
          .eq("user_id", user.id)
          .order("last_accessed", { ascending: false }),

        // Quiz attempts
        supabase
          .from("user_quiz_attempts")
          .select(
            `
            *,
            lessons(title, slug),
            quizzes(passing_score, title)
          `
          )
          .eq("user_id", user.id)
          .order("attempted_at", { ascending: false })
          .limit(10),

        // SRS progress
        supabase
          .from("user_srs_progress")
          .select("*")
          .eq("user_id", user.id),

        // Recent quiz activities
        supabase
          .from("user_quiz_attempts")
          .select("attempted_at")
          .eq("user_id", user.id)
          .gte("attempted_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

        // Recent SRS activities
        supabase
          .from("user_srs_progress")
          .select("last_reviewed")
          .eq("user_id", user.id)
          .gte("last_reviewed", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Handle results with error checking
      const courseProgress = courseProgressPromise.status === 'fulfilled' && !courseProgressPromise.value.error 
        ? courseProgressPromise.value.data 
        : [];
      
      const quizAttempts = quizAttemptsPromise.status === 'fulfilled' && !quizAttemptsPromise.value.error
        ? quizAttemptsPromise.value.data
        : [];

      const srsProgress = srsProgressPromise.status === 'fulfilled' && !srsProgressPromise.value.error
        ? srsProgressPromise.value.data
        : [];

      // Calculate SRS stats
      const totalCards = srsProgress?.length || 0;
      const dueNow = srsProgress?.filter(
        (card: any) => card.next_review && new Date(card.next_review) <= new Date()
      ).length || 0;

      const totalReviews = srsProgress?.reduce(
        (acc: number, curr: any) => acc + (curr.correct_attempts || 0) + (curr.wrong_attempts || 0),
        0
      ) || 0;

      const correctReviews = srsProgress?.reduce(
        (acc: number, curr: any) => acc + (curr.correct_attempts || 0),
        0
      ) || 0;

      const retentionRate = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;
      const averageScore = srsProgress?.length > 0 
        ? srsProgress.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / srsProgress.length
        : 0;

      // Calculate learning streak
      const quizActivities = quizActivitiesPromise.status === 'fulfilled' ? quizActivitiesPromise.value.data : [];
      const srsActivities = srsActivitiesPromise.status === 'fulfilled' ? srsActivitiesPromise.value.data : [];
      
      const uniqueDays = new Set([
        ...(quizActivities?.map((a: any) => new Date(a.attempted_at).toDateString()) || []),
        ...(srsActivities?.map((a: any) => new Date(a.last_reviewed).toDateString()) || [])
      ]);
      
      const learningStreak = uniqueDays.size;

      // Calculate overall stats
      const totalCourses = courseProgress?.length || 0;
      const completedLessons = courseProgress?.reduce(
        (acc: number, curr: any) => acc + (curr.completed_lessons || 0),
        0
      ) || 0;

      const totalLessons = courseProgress?.reduce(
        (acc: number, curr: any) => acc + (curr.total_lessons || 0),
        0
      ) || 0;

      const averageQuizScore = quizAttempts?.length > 0
        ? Math.round(
            quizAttempts.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / quizAttempts.length
          )
        : 0;

      // Prepare recent activity
      const recentActivityData = [
        ...(quizAttempts?.map((attempt: any) => ({
          type: "quiz",
          title: attempt.quizzes?.title || attempt.lessons?.title || "Quiz",
          score: attempt.score,
          passed: attempt.passed,
          timestamp: attempt.attempted_at,
          icon: FiAward,
          lessonSlug: attempt.lessons?.slug,
        })) || []),
        ...(srsProgress?.slice(0, 5).map((card: any) => ({
          type: "srs",
          title: "SRS Review Completed",
          score: card.score,
          timestamp: card.last_reviewed,
          icon: FiBook,
        })) || []),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

      const dashboardData: DashboardData = {
        courseProgress: courseProgress || [],
        quizPerformance: quizAttempts || [],
        srsStats: {
          totalCards,
          dueNow,
          retentionRate,
          totalReviews,
          averageScore: Math.round(averageScore),
        },
        currentLearning: courseProgress?.[0] || null,
        recentActivity: recentActivityData,
        learningStreak,
        overallStats: {
          totalCourses,
          completedLessons,
          totalLessons,
          averageQuizScore,
        },
      };

      setData(dashboardData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Navigation handlers
  const navigateToCourse = useCallback((course: any) => {
    if (course.courses?.slug) {
      router.push(`/learn/courses/${course.courses.slug}`);
    } else {
      router.push('/learn/courses');
    }
  }, [router]);

  const navigateToSRS = useCallback(() => {
    router.push('/learn/srs');
  }, [router]);

  const navigateToQuizzes = useCallback(() => {
    router.push('/learn/quizzes');
  }, [router]);

  const navigateToAnalytics = useCallback(() => {
    router.push('/learn/analytics');
  }, [router]);

  const continueLearning = useCallback(() => {
    if (data?.currentLearning) {
      const course = data.currentLearning;
      if (course.lessons?.slug) {
        router.push(`/learn/courses/${course.courses?.slug}/lessons/${course.lessons.slug}`);
      } else {
        router.push(`/learn/courses/${course.courses?.slug}`);
      }
    } else {
      router.push('/learn/courses');
    }
  }, [data, router]);

  // Memoized progress percentage
  const progressPercentage = useMemo(() => {
    if (!data?.overallStats.totalLessons) return 0;
    return Math.round((data.overallStats.completedLessons / data.overallStats.totalLessons) * 100);
  }, [data]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={6} bg={bgBody}>
        <Box maxW="md" w="full">
          <VStack 
            bg="red.50" 
            _dark={{ bg: "red.900/20", borderColor: "red.800" }}
            border="1px"
            borderColor="red.200"
            rounded="2xl" 
            p={6} 
            textAlign="center"
          >
            <Box w={12} h={12} bg="red.100" _dark={{ bg: "red.800" }} rounded="full" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={4}>
              <Icon as={FiActivity} w={6} h={6} color="red.600" _dark={{ color: "red.400" }} />
            </Box>
            <Text fontSize="lg" fontWeight="semibold" color="red.800" _dark={{ color: "red.200" }} mb={2}>
              Unable to Load Dashboard
            </Text>
            <Text color="red.600" _dark={{ color: "red.300" }} mb={4}>{error}</Text>
            <Button
              onClick={loadDashboardData}
              bg="red.600"
              _hover={{ bg: "red.700" }}
              color="white"
              rounded="lg"
              transition="colors"
              fontWeight="medium"
            >
              Try Again
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={6} bg={bgBody}>
        <VStack textAlign="center" maxW="md" spacing={6}>
          <Box w={20} h={20} bg="blue.100" _dark={{ bg: "blue.900" }} rounded="full" display="flex" alignItems="center" justifyContent="center">
            <Icon as={FiBook} w={10} h={10} color="blue.600" _dark={{ color: "blue.400" }} />
          </Box>
          <Text fontSize="3xl" fontWeight="bold" color={textPrimary}>
            Start Your Learning Journey! 🎓
          </Text>
          <Text color={textSecondary} fontSize="lg">
            Begin your learning adventure by exploring courses and taking your first lesson.
          </Text>
          <Link href="/learn/courses" passHref>
            <Button
              as="a"
              display="inline-flex"
              alignItems="center"
              px={6}
              py={3}
              bg="blue.600"
              _hover={{ bg: "blue.700", shadow: "xl" }}
              color="white"
              fontWeight="semibold"
              rounded="lg"
              transition="all 0.2s"
              shadow="lg"
            >
              Explore Courses
              <Icon as={FiArrowRight} ml={2} w={5} h={5} />
            </Button>
          </Link>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" p={{ base: 4, sm: 6 }} bg={bgBody}>
      <Box maxW="7xl" mx="auto">
        {/* Header */}
        <Flex flexDir={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={4} mb={8}>
          <VStack align="start" spacing={2}>
            <Text
              fontSize={{ base: "3xl", sm: "4xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, blue.600, blue.500)"
              bgClip="text"
            >
              Learning Dashboard
            </Text>
            <Text color={textSecondary} fontSize="lg">
              Track your progress and optimize your learning journey
            </Text>
          </VStack>
          <HStack spacing={4}>
            <Badge
              bg="blue.100"
              _dark={{ bg: "blue.900", color: "blue.200" }}
              color="blue.800"
              px={3}
              py={1}
              rounded="full"
              fontSize="sm"
              fontWeight="medium"
            >
              Day {data.learningStreak}
            </Badge>
            <Avatar
              size="md"
              name={user?.email || "User"}
              src={user?.user_metadata?.avatar_url}
              bgGradient="linear(to-br, blue.500, blue.600)"
              color="white"
            />
          </HStack>
        </Flex>

        {/* Overall Progress */}
        <Box
          bg={bgCard}
          rounded="2xl"
          shadow="sm"
          border="1px"
          borderColor={borderColor}
          p={6}
          mb={6}
        >
          <VStack spacing={4} align="stretch">
            <Flex flexDir={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={4}>
              <Text fontSize="xl" fontWeight="bold" color={textPrimary}>
                Overall Learning Progress
              </Text>
              <Text fontSize="3xl" fontWeight="bold" color={textAccent}>
                {progressPercentage}%
              </Text>
            </Flex>
            
            <Progress
              value={progressPercentage}
              size="lg"
              colorScheme="blue"
              bg={progressBg}
              rounded="full"
            />

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <VStack textAlign="center" p={3} bg={bgPrimary50} rounded="lg">
                <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                  {data.overallStats.totalCourses}
                </Text>
                <Text fontSize="sm" color={textSecondary}>Courses</Text>
              </VStack>
              <VStack textAlign="center" p={3} bg={bgPrimary50} rounded="lg">
                <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                  {data.overallStats.completedLessons}
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  of {data.overallStats.totalLessons} Lessons
                </Text>
              </VStack>
              <VStack textAlign="center" p={3} bg={bgPrimary50} rounded="lg">
                <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                  {data.overallStats.averageQuizScore}%
                </Text>
                <Text fontSize="sm" color={textSecondary}>Avg Score</Text>
              </VStack>
              <VStack textAlign="center" p={3} bg={bgPrimary50} rounded="lg">
                <Text fontSize="2xl" fontWeight="bold" color={textPrimary}>
                  {data.srsStats.retentionRate}%
                </Text>
                <Text fontSize="sm" color={textSecondary}>Retention</Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
          {/* Left Column - Current Learning & Courses */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Current Learning Position */}
              {data.currentLearning && (
                <Box bg={bgCard} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor} p={6}>
                  <HStack spacing={3} mb={4}>
                    <Box w={8} h={8} bg={bgPrimary50} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                      <Icon as={FiPlayCircle} w={5} h={5} color={textAccent} />
                    </Box>
                    <Text fontSize="xl" fontWeight="semibold" color={textPrimary}>
                      Continue Learning
                    </Text>
                  </HStack>
                  
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold" color={textAccent}>
                        {data.currentLearning.courses?.title}
                      </Text>
                      <Text color={textSecondary} fontSize="sm">
                        {data.currentLearning.lessons?.title || "Next Lesson"}
                      </Text>
                    </Box>
                    
                    <Flex flexDir={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={4}>
                      <HStack>
                        <Badge colorScheme="blue">
                          {data.currentLearning.modules?.title || "Module"}
                        </Badge>
                        <Badge colorScheme="green">
                          {data.currentLearning.units?.title || "Unit"}
                        </Badge>
                      </HStack>
                      <Button
                        onClick={continueLearning}
                        colorScheme="blue"
                        size="sm"
                        rightIcon={<Icon as={FiArrowRight} w={4} h={4} />}
                      >
                        Continue
                      </Button>
                    </Flex>

                    <Progress
                      value={(data.currentLearning.completed_lessons / data.currentLearning.total_lessons) * 100}
                      colorScheme="green"
                      size="sm"
                      rounded="full"
                    />
                  </VStack>
                </Box>
              )}

              {/* Course Progress */}
              <Box bg={bgCard} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor} p={6}>
                <HStack spacing={3} mb={6}>
                  <Box w={8} h={8} bg={bgPrimary50} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiBarChart2} w={5} h={5} color={textAccent} />
                  </Box>
                  <Text fontSize="xl" fontWeight="semibold" color={textPrimary}>
                    Course Progress
                  </Text>
                </HStack>

                <VStack spacing={4} align="stretch">
                  {data.courseProgress.map((course) => {
                    const courseProgress = (course.completed_lessons / course.total_lessons) * 100;
                    const progressColor = courseProgress > 80 ? "green" : courseProgress > 50 ? "blue" : "orange";

                    return (
                      <Box
                        key={course.id}
                        p={4}
                        border="1px"
                        borderColor={borderColor}
                        rounded="xl"
                        _hover={{ borderColor: "blue.300", cursor: "pointer" }}
                        onClick={() => navigateToCourse(course)}
                      >
                        <Flex flexDir={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={2} mb={3}>
                          <Text fontWeight="semibold" color={textPrimary}>
                            {course.courses?.title}
                          </Text>
                          <Text fontSize="sm" color={textSecondary}>
                            {course.completed_lessons}/{course.total_lessons} lessons
                          </Text>
                        </Flex>

                        <Progress
                          value={courseProgress}
                          colorScheme={progressColor}
                          size="sm"
                          rounded="full"
                          mb={2}
                        />

                        <Flex flexDir={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={2} fontSize="sm">
                          <Text color={textSecondary}>
                            Last accessed: {new Date(course.last_accessed).toLocaleDateString()}
                          </Text>
                          <Badge
                            colorScheme={progressColor}
                            fontSize="xs"
                          >
                            {Math.round(courseProgress)}%
                          </Badge>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            </VStack>
          </GridItem>

          {/* Right Column - Stats & Activity */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* SRS Stats */}
              <Box bg={bgCard} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor} p={6}>
                <HStack spacing={3} mb={4}>
                  <Box w={8} h={8} bg={bgPrimary50} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiTarget} w={5} h={5} color={textAccent} />
                  </Box>
                  <Text fontSize="xl" fontWeight="semibold" color={textPrimary}>
                    Spaced Repetition
                  </Text>
                </HStack>

                <VStack spacing={4} align="stretch">
                  <Box bg={bgPrimary50} p={4} rounded="xl">
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text color="blue.800" _dark={{ color: "blue.200" }} fontWeight="semibold">
                          Cards Due
                        </Text>
                        <Text fontSize="3xl" fontWeight="bold" color="blue.600" _dark={{ color: "blue.400" }}>
                          {data.srsStats.dueNow}
                        </Text>
                      </Box>
                      <Icon as={FiClock} w={8} h={8} color="blue.500" />
                    </Flex>
                  </Box>

                  <SimpleGrid columns={2} spacing={3}>
                    <VStack textAlign="center" p={3} bg={bgPrimary50} rounded="lg">
                      <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                        {data.srsStats.totalCards}
                      </Text>
                      <Text fontSize="xs" color={textSecondary}>Total Cards</Text>
                    </VStack>
                    <VStack textAlign="center" p={3} bg={bgPrimary50} rounded="lg">
                      <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                        {data.srsStats.totalReviews}
                      </Text>
                      <Text fontSize="xs" color={textSecondary}>Reviews</Text>
                    </VStack>
                    <VStack textAlign="center" p={3} bg={bgPrimary50} rounded="lg">
                      <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                        {data.srsStats.retentionRate}%
                      </Text>
                      <Text fontSize="xs" color={textSecondary}>Retention</Text>
                    </VStack>
                    <VStack textAlign="center" p={3} bg={bgPrimary50} rounded="lg">
                      <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
                        {data.srsStats.averageScore}
                      </Text>
                      <Text fontSize="xs" color={textSecondary}>Avg Score</Text>
                    </VStack>
                  </SimpleGrid>

                  <Button
                    onClick={navigateToSRS}
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<Icon as={FiTarget} w={4} h={4} />}
                  >
                    Review Due Cards
                  </Button>
                </VStack>
              </Box>

              {/* Recent Quiz Performance */}
              <Box bg={bgCard} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor} p={6}>
                <HStack spacing={3} mb={4}>
                  <Box w={8} h={8} bg={bgPrimary50} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiAward} w={5} h={5} color={textAccent} />
                  </Box>
                  <Text fontSize="xl" fontWeight="semibold" color={textPrimary}>
                    Recent Quizzes
                  </Text>
                </HStack>

                <VStack spacing={3} align="stretch">
                  {data.quizPerformance.slice(0, 5).map((quiz) => (
                    <Flex
                      key={quiz.id}
                      justify="space-between"
                      align="center"
                      p={2}
                      _hover={{ bg: hoverBg, cursor: "pointer" }}
                      rounded="lg"
                      transition="colors"
                      onClick={() => quiz.lessons?.slug && router.push(`/learn/lessons/${quiz.lessons.slug}/quiz`)}
                    >
                      <Box minW={0} flex={1}>
                        <Text fontSize="sm" fontWeight="medium" color={textPrimary} noOfLines={1}>
                          {quiz.quizzes?.title || quiz.lessons?.title || "Quiz"}
                        </Text>
                        <Text fontSize="xs" color={textSecondary}>
                          {new Date(quiz.attempted_at).toLocaleDateString()}
                        </Text>
                      </Box>
                      <Badge
                        colorScheme={quiz.passed ? "green" : "red"}
                        fontSize="sm"
                      >
                        {quiz.score}%
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              </Box>

              {/* Recent Activity */}
              <Box bg={bgCard} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor} p={6}>
                <HStack spacing={3} mb={4}>
                  <Box w={8} h={8} bg={bgPrimary50} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiTrendingUp} w={5} h={5} color={textAccent} />
                  </Box>
                  <Text fontSize="xl" fontWeight="semibold" color={textPrimary}>
                    Recent Activity
                  </Text>
                </HStack>

                <VStack spacing={3} align="stretch">
                  {data.recentActivity.map((activity, index) => (
                    <HStack key={index} spacing={3} p={2}>
                      <Box w={6} h={6} bg={bgPrimary50} rounded="md" display="flex" alignItems="center" justifyContent="center">
                        <Icon as={activity.icon} w={3} h={3} color={textAccent} />
                      </Box>
                      <Box minW={0} flex={1}>
                        <Text fontSize="sm" color={textPrimary} noOfLines={1}>
                          {activity.title}
                        </Text>
                        <Text fontSize="xs" color={textSecondary}>
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </Text>
                      </Box>
                      {activity.score && (
                        <Badge
                          colorScheme={activity.passed ? "green" : "red"}
                          fontSize="xs"
                        >
                          {activity.score}%
                        </Badge>
                      )}
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>

        {/* Quick Actions */}
        <Box bg={bgCard} rounded="2xl" shadow="sm" border="1px" borderColor={borderColor} p={6}>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
            <Button
              onClick={continueLearning}
              variant="outline"
              colorScheme="blue"
              size="lg"
              height="auto"
              py={4}
              leftIcon={<Icon as={FiBook} w={6} h={6} />}
              _hover={{ transform: "scale(1.02)" }}
              transition="all 0.2s"
            >
              Continue Learning
            </Button>

            <Button
              onClick={navigateToSRS}
              variant="outline"
              colorScheme="blue"
              size="lg"
              height="auto"
              py={4}
              leftIcon={<Icon as={FiTarget} w={6} h={6} />}
              _hover={{ transform: "scale(1.02)" }}
              transition="all 0.2s"
            >
              Review Cards
            </Button>

            <Button
              onClick={navigateToQuizzes}
              variant="outline"
              colorScheme="blue"
              size="lg"
              height="auto"
              py={4}
              leftIcon={<Icon as={FiAward} w={6} h={6} />}
              _hover={{ transform: "scale(1.02)" }}
              transition="all 0.2s"
            >
              Take Quiz
            </Button>

            <Button
              onClick={navigateToAnalytics}
              variant="outline"
              colorScheme="blue"
              size="lg"
              height="auto"
              py={4}
              leftIcon={<Icon as={FiBarChart2} w={6} h={6} />}
              _hover={{ transform: "scale(1.02)" }}
              transition="all 0.2s"
            >
              View Analytics
            </Button>
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;