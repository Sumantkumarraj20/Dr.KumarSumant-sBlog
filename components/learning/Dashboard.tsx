// components/learning/Dashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Heading,
  Flex,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Avatar,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Spinner,
  SimpleGrid,
  Icon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  FiBook,
  FiAward,
  FiClock,
  FiTrendingUp,
  FiBarChart2,
  FiCalendar,
  FiPlayCircle,
  FiCheckCircle,
  FiTarget,
} from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/authContext";
import Link from "next/link";

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

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const successColor = useColorModeValue("green.500", "green.300");

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Load course progress with related data
      const { data: courseProgress, error: progressError } = await supabase
        .from("user_course_progress")
        .select(
          `
        *,
        courses(title, description),
        modules(title),
        units(title),
        lessons(title)
      `
        )
        .eq("user_id", user.id)
        .order("last_accessed", { ascending: false });

      if (progressError) throw progressError;

      // Load quiz performance
      const { data: quizAttempts, error: quizError } = await supabase
        .from("user_quiz_attempts")
        .select(
          `
        *,
        lessons(title),
        quizzes(passing_score)
      `
        )
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: false })
        .limit(10);

      if (quizError) throw quizError;

      // Load SRS statistics
      const { data: srsProgress, error: srsError } = await supabase
        .from("user_srs_progress")
        .select("*")
        .eq("user_id", user.id);

      if (srsError) throw srsError;

      // Calculate SRS stats
      const totalCards = srsProgress?.length || 0;
      const dueNow =
        srsProgress?.filter(
          (card) => card.next_review && new Date(card.next_review) <= new Date()
        ).length || 0;

      const totalReviews =
        srsProgress?.reduce(
          (acc, curr) =>
            acc + (curr.correct_attempts || 0) + (curr.wrong_attempts || 0),
          0
        ) || 0;

      const correctReviews =
        srsProgress?.reduce(
          (acc, curr) => acc + (curr.correct_attempts || 0),
          0
        ) || 0;

      const retentionRate =
        totalReviews > 0
          ? Math.round((correctReviews / totalReviews) * 100)
          : 0;

      const averageScore =
        srsProgress?.length > 0
          ? srsProgress.reduce((acc, curr) => acc + (curr.score || 0), 0) /
            srsProgress.length
          : 0;

      // Find current learning position
      const currentLearning = courseProgress?.[0] || null;

      // Calculate learning streak (last 7 days with activity)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Make separate queries for activities
      const { data: quizActivities } = await supabase
        .from("user_quiz_attempts")
        .select("attempted_at")
        .eq("user_id", user.id)
        .gte("attempted_at", sevenDaysAgo.toISOString());

      const { data: srsActivities } = await supabase
        .from("user_srs_progress")
        .select("last_reviewed")
        .eq("user_id", user.id)
        .gte("last_reviewed", sevenDaysAgo.toISOString());

      // Combine activities
      const combinedActivities = [
        ...(quizActivities?.map((activity) => ({
          attempted_at: activity.attempted_at,
          type: "quiz",
        })) || []),
        ...(srsActivities?.map((activity) => ({
          attempted_at: activity.last_reviewed,
          type: "srs",
        })) || []),
      ];

      // Calculate learning streak
      const learningStreak = combinedActivities.length > 0 ? 1 : 0;

      // Calculate overall stats
      const totalCourses = courseProgress?.length || 0;
      const completedLessons =
        courseProgress?.reduce(
          (acc, curr) => acc + (curr.completed_lessons || 0),
          0
        ) || 0;

      const totalLessons =
        courseProgress?.reduce(
          (acc, curr) => acc + (curr.total_lessons || 0),
          0
        ) || 0;

      const averageQuizScore =
        quizAttempts?.length > 0
          ? Math.round(
              quizAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) /
                quizAttempts.length
            )
          : 0;

      // Prepare recent activity
      const recentActivityData = [
        ...(quizAttempts?.map((attempt) => ({
          type: "quiz",
          title: attempt.lessons?.title || "Unknown Lesson",
          score: attempt.score,
          passed: attempt.passed,
          timestamp: attempt.attempted_at,
          icon: FiAward,
        })) || []),
        ...(srsProgress?.slice(0, 5).map((card) => ({
          type: "srs",
          title: "SRS Review Completed",
          score: card.score,
          timestamp: card.last_reviewed,
          icon: FiBook,
        })) || []),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
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
        currentLearning,
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
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading your learning dashboard...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        {error}
        <Button ml="auto" size="sm" onClick={loadDashboardData}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="lg" mb={4}>
          Welcome to Your Learning Journey! 🎓
        </Heading>
        <Text color="gray.600" mb={6}>
          Start your learning adventure by enrolling in courses and taking
          quizzes.
        </Text>
        <Button colorScheme="blue" size="lg">
          <Link href="/learn/courses">Explore Courses</Link>
        </Button>
      </Box>
    );
  }

  const progressPercentage =
    data.overallStats.totalLessons > 0
      ? Math.round(
          (data.overallStats.completedLessons /
            data.overallStats.totalLessons) *
            100
        )
      : 0;

  return (
    <Box p={6} maxW="1400px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={2}>
          <Heading
            size="xl"
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
          >
            Learning Dashboard
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Track your progress and optimize your learning journey
          </Text>
        </VStack>
        <HStack spacing={4}>
          <Badge
            colorScheme="blue"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
          >
            Day {data.learningStreak}
          </Badge>
          <Avatar
            size="md"
            name={user?.email}
            src={user?.user_metadata?.avatar_url}
          />
        </HStack>
      </Flex>

      {/* Overall Progress */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontSize="xl" fontWeight="bold">
                Overall Learning Progress
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
                {progressPercentage}%
              </Text>
            </Flex>
            <Progress
              value={progressPercentage}
              size="lg"
              colorScheme="blue"
              borderRadius="full"
              height="20px"
            />
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Stat>
                <StatLabel>Courses</StatLabel>
                <StatNumber>{data.overallStats.totalCourses}</StatNumber>
                <StatHelpText>Enrolled</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Lessons</StatLabel>
                <StatNumber>{data.overallStats.completedLessons}</StatNumber>
                <StatHelpText>of {data.overallStats.totalLessons}</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Avg Score</StatLabel>
                <StatNumber>{data.overallStats.averageQuizScore}%</StatNumber>
                <StatHelpText>Quizzes</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Retention</StatLabel>
                <StatNumber>{data.srsStats.retentionRate}%</StatNumber>
                <StatHelpText>SRS Cards</StatHelpText>
              </Stat>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
        {/* Current Learning & Courses */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Current Learning Position */}
            {data.currentLearning && (
              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardHeader pb={0}>
                  <Flex align="center" gap={3}>
                    <Icon as={FiPlayCircle} color={accentColor} boxSize={6} />
                    <Heading size="md">Continue Learning</Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color={accentColor}>
                        {data.currentLearning.courses?.title}
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        {data.currentLearning.lessons?.title || "Next Lesson"}
                      </Text>
                    </Box>
                    <Flex justify="space-between" align="center">
                      <HStack>
                        <Badge colorScheme="blue">
                          {data.currentLearning.modules?.title || "Module"}
                        </Badge>
                        <Badge colorScheme="green">
                          {data.currentLearning.units?.title || "Unit"}
                        </Badge>
                      </HStack>
                      <Button colorScheme="blue" size="sm">
                        Continue
                      </Button>
                    </Flex>
                    <Progress
                      value={
                        (data.currentLearning.completed_lessons /
                          data.currentLearning.total_lessons) *
                        100
                      }
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                    />
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Course Progress */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Flex align="center" gap={3}>
                  <Icon as={FiBarChart2} color={accentColor} boxSize={6} />
                  <Heading size="md">Course Progress</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {data.courseProgress.map((course) => (
                    <Box
                      key={course.id}
                      p={4}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="lg"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="bold">{course.courses?.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {course.completed_lessons}/{course.total_lessons}{" "}
                          lessons
                        </Text>
                      </Flex>
                      <Progress
                        value={
                          (course.completed_lessons / course.total_lessons) *
                          100
                        }
                        colorScheme="green"
                        size="sm"
                        borderRadius="full"
                        mb={2}
                      />
                      <Flex
                        justify="space-between"
                        fontSize="sm"
                        color="gray.600"
                      >
                        <Text>
                          Last accessed:{" "}
                          {new Date(course.last_accessed).toLocaleDateString()}
                        </Text>
                        <Badge
                          colorScheme={
                            course.completed_lessons / course.total_lessons >
                            0.8
                              ? "green"
                              : course.completed_lessons /
                                  course.total_lessons >
                                0.5
                              ? "blue"
                              : "orange"
                          }
                        >
                          {Math.round(
                            (course.completed_lessons / course.total_lessons) *
                              100
                          )}
                          %
                        </Badge>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        {/* Sidebar - Stats & Activity */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* SRS Stats */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader pb={0}>
                <Flex align="center" gap={3}>
                  <Icon as={FiTarget} color={successColor} boxSize={6} />
                  <Heading size="md">Spaced Repetition</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Flex
                    justify="space-between"
                    align="center"
                    p={3}
                    bg="blue.50"
                    borderRadius="lg"
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color="blue.700">
                        Cards Due
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                        {data.srsStats.dueNow}
                      </Text>
                    </VStack>
                    <Icon as={FiClock} color="blue.500" boxSize={8} />
                  </Flex>

                  <SimpleGrid columns={2} spacing={3}>
                    <Box
                      textAlign="center"
                      p={3}
                      bg="gray.50"
                      borderRadius="lg"
                    >
                      <Text fontSize="sm" color="gray.600">
                        Total Cards
                      </Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {data.srsStats.totalCards}
                      </Text>
                    </Box>
                    <Box
                      textAlign="center"
                      p={3}
                      bg="gray.50"
                      borderRadius="lg"
                    >
                      <Text fontSize="sm" color="gray.600">
                        Reviews
                      </Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {data.srsStats.totalReviews}
                      </Text>
                    </Box>
                    <Box
                      textAlign="center"
                      p={3}
                      bg="gray.50"
                      borderRadius="lg"
                    >
                      <Text fontSize="sm" color="gray.600">
                        Retention
                      </Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {data.srsStats.retentionRate}%
                      </Text>
                    </Box>
                    <Box
                      textAlign="center"
                      p={3}
                      bg="gray.50"
                      borderRadius="lg"
                    >
                      <Text fontSize="sm" color="gray.600">
                        Avg Score
                      </Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {data.srsStats.averageScore}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <Button colorScheme="blue" size="sm" w="full">
                    Review Due Cards
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Quiz Performance */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Flex align="center" gap={3}>
                  <Icon as={FiAward} color={accentColor} boxSize={6} />
                  <Heading size="md">Recent Quizzes</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {data.quizPerformance.slice(0, 5).map((quiz) => (
                    <Flex
                      key={quiz.id}
                      justify="space-between"
                      align="center"
                      p={2}
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                          {quiz.lessons?.title || "Quiz"}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(quiz.attempted_at).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={quiz.passed ? "green" : "red"}
                        fontSize="sm"
                      >
                        {quiz.score}%
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Flex align="center" gap={3}>
                  <Icon as={FiTrendingUp} color={accentColor} boxSize={6} />
                  <Heading size="md">Recent Activity</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {data.recentActivity.map((activity, index) => (
                    <Flex key={index} align="center" gap={3} p={2}>
                      <Icon as={activity.icon} color="gray.500" boxSize={4} />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm" noOfLines={1}>
                          {activity.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </Text>
                      </VStack>
                      {activity.score && (
                        <Badge
                          colorScheme={activity.passed ? "green" : "red"}
                          fontSize="xs"
                        >
                          {activity.score}%
                        </Badge>
                      )}
                    </Flex>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </Grid>

      {/* Quick Actions */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Button colorScheme="blue" leftIcon={<FiBook />} height="60px">
              Continue Learning
            </Button>
            <Button colorScheme="green" leftIcon={<FiTarget />} height="60px">
              Review Cards
            </Button>
            <Button colorScheme="purple" leftIcon={<FiAward />} height="60px">
              Take Quiz
            </Button>
            <Button
              colorScheme="orange"
              leftIcon={<FiBarChart2 />}
              height="60px"
            >
              View Analytics
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
