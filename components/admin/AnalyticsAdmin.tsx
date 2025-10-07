// components/analytics/AnalyticsSection.tsx
"use client";

import React, { useEffect, useState } from 'react';
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
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Tooltip,
  Divider,
  Avatar,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiBook,
  FiAward,
  FiTrendingUp,
  FiActivity,
  FiBarChart2,
  FiClock,
  FiTarget,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiUserCheck,
  FiBookOpen,
} from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/authContext';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalLessons: number;
    totalQuizzes: number;
    activeUsers: number;
    completionRate: number;
    avgQuizScore: number;
    totalSRSReviews: number;
  };
  userGrowth: {
    labels: string[];
    data: number[];
  };
  coursePerformance: {
    course: string;
    enrolled: number;
    completed: number;
    avgScore: number;
    completionRate: number;
  }[];
  quizAnalytics: {
    labels: string[];
    scores: number[];
    attempts: number[];
  };
  userActivity: {
    user: any;
    lastActivity: string;
    coursesEnrolled: number;
    lessonsCompleted: number;
    avgScore: number;
    streak: number;
  }[];
  srsStats: {
    totalCards: number;
    dueCards: number;
    retentionRate: number;
    avgEaseFactor: number;
  };
  recentRegistrations: any[];
  topPerformers: any[];
}

const AnalyticsAdmin = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [searchTerm, setSearchTerm] = useState('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d': startDate.setDate(now.getDate() - 7); break;
        case '30d': startDate.setDate(now.getDate() - 30); break;
        case '90d': startDate.setDate(now.getDate() - 90); break;
        case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
      }

      // Fetch all necessary data
      const [
        { data: profiles, count: totalUsers },
        { data: courses, count: totalCourses },
        { data: lessons, count: totalLessons },
        { data: quizzes, count: totalQuizzes },
        { data: userProgress },
        { data: quizAttempts },
        { data: srsProgress },
        { data: recentUsers },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('courses').select('*', { count: 'exact' }),
        supabase.from('lessons').select('*', { count: 'exact' }),
        supabase.from('quizzes').select('*', { count: 'exact' }),
        supabase.from('user_course_progress').select('*'),
        supabase.from('user_quiz_attempts')
          .select('*')
          .gte('attempted_at', startDate.toISOString()),
        supabase.from('user_srs_progress').select('*'),
        supabase.from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      // Calculate active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUserIds = new Set();
      quizAttempts?.forEach(attempt => {
        if (new Date(attempt.attempted_at) >= thirtyDaysAgo) {
          activeUserIds.add(attempt.user_id);
        }
      });

      // Calculate completion rate
      const totalEnrollments = userProgress?.length || 0;
      const completedCourses = userProgress?.filter(progress => 
        progress.completed_lessons >= progress.total_lessons
      ).length || 0;
      const completionRate = totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0;

      // Calculate average quiz score
      const totalScore = quizAttempts?.reduce((sum, attempt) => sum + (attempt.score || 0), 0) || 0;
      const avgQuizScore = quizAttempts?.length > 0 ? Math.round(totalScore / quizAttempts.length) : 0;

      // Calculate SRS statistics
      const totalSRSReviews = srsProgress?.reduce((sum, card) => 
        sum + (card.correct_attempts || 0) + (card.wrong_attempts || 0), 0
      ) || 0;

      const dueCards = srsProgress?.filter(card => 
        card.next_review && new Date(card.next_review) <= new Date()
      ).length || 0;

      const correctReviews = srsProgress?.reduce((sum, card) => sum + (card.correct_attempts || 0), 0) || 0;
      const totalReviews = srsProgress?.reduce((sum, card) => 
        sum + (card.correct_attempts || 0) + (card.wrong_attempts || 0), 0
      ) || 0;
      const retentionRate = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

      const avgEaseFactor = srsProgress?.length > 0 ? 
        srsProgress.reduce((sum, card) => sum + (card.ease_factor || 2.5), 0) / srsProgress.length : 2.5;

      // Build user growth data by daily buckets in the selected range
      const generateDateLabels = (start: Date, end: Date) => {
        const labels: string[] = [];
        const cur = new Date(start);
        while (cur <= end) {
          labels.push(cur.toISOString().slice(0, 10));
          cur.setDate(cur.getDate() + 1);
        }
        return labels;
      };

      const start = startDate;
      const end = now;
      const dateLabels = generateDateLabels(start, end);
      const userGrowthData = dateLabels.map((d) =>
        (profiles || []).filter((p: any) => p.created_at && p.created_at.slice(0, 10) === d).length || 0
      );

      const userGrowth = { labels: dateLabels, data: userGrowthData };

      // Course performance computed from user progress and quiz attempts
      const coursePerformance = (courses || []).map((course: any) => {
        const courseProgress = (userProgress || []).filter((p: any) => p.course_id === course.id) || [];
        const enrolled = courseProgress.length;
        const completed = courseProgress.filter((p: any) => p.completed_lessons >= (p.total_lessons || 0)).length;
        const courseAttempts = (quizAttempts || []).filter((a: any) =>
          courseProgress.some((p: any) => p.user_id === a.user_id)
        ) || [];
        const avgScore = courseAttempts.length > 0 ? Math.round(courseAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / courseAttempts.length) : 0;

        return {
          course: course.title || 'Untitled',
          enrolled,
          completed,
          avgScore,
          completionRate: enrolled > 0 ? (completed / enrolled) * 100 : 0,
        };
      }) || [];

      // Quiz analytics: aggregate by quiz id
      const quizById: Record<string, { scores: number[]; attempts: number }> = {};
      (quizAttempts || []).forEach((a: any) => {
        const qid = a.quiz_id || 'unknown';
        if (!quizById[qid]) quizById[qid] = { scores: [], attempts: 0 };
        if (typeof a.score === 'number') quizById[qid].scores.push(a.score);
        quizById[qid].attempts += 1;
      });

      const quizIds = Object.keys(quizById).slice(0, 6);
      const quizAnalytics = {
        labels: quizIds,
        scores: quizIds.map((id) => {
          const s = quizById[id].scores;
          return s.length ? Math.round(s.reduce((x, y) => x + y, 0) / s.length) : 0;
        }),
        attempts: quizIds.map((id) => quizById[id].attempts || 0),
      };

      // User activity from recent users and available progress/attempts
      const userActivity = (recentUsers || []).map((profile: any) => {
        const coursesEnrolled = (userProgress || []).filter((p: any) => p.user_id === profile.id).length;
        const lessonsCompleted = (userProgress || []).filter((p: any) => p.user_id === profile.id).reduce((sum: number, p: any) => sum + (p.completed_lessons || 0), 0);
        const userAttempts = (quizAttempts || []).filter((a: any) => a.user_id === profile.id);
        const avgScore = userAttempts.length ? Math.round(userAttempts.reduce((s: number, a: any) => s + (a.score || 0), 0) / userAttempts.length) : 0;
        return {
          user: profile,
          lastActivity: profile?.updated_at || profile?.created_at || new Date().toISOString(),
          coursesEnrolled,
          lessonsCompleted,
          avgScore,
          streak: 0,
        };
      }) || [];

      const topPerformers = userActivity.slice().sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);

      const analyticsData: AnalyticsData = {
        overview: {
          totalUsers: totalUsers || 0,
          totalCourses: totalCourses || 0,
          totalLessons: totalLessons || 0,
          totalQuizzes: totalQuizzes || 0,
          activeUsers: activeUserIds.size,
          completionRate,
          avgQuizScore,
          totalSRSReviews,
        },
        userGrowth,
        coursePerformance: coursePerformance.slice(0, 5),
        quizAnalytics,
        userActivity,
        srsStats: {
          totalCards: srsProgress?.length || 0,
          dueCards,
          retentionRate,
          avgEaseFactor: Number(avgEaseFactor.toFixed(2)),
        },
        recentRegistrations: recentUsers || [],
        topPerformers,
      };

      setData(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [user, timeRange]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading analytics dashboard...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        {error}
        <Button ml="auto" size="sm" onClick={loadAnalyticsData}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="lg" mb={4}>Analytics Dashboard</Heading>
        <Text color="gray.600">No data available</Text>
      </Box>
    );
  }

  // Chart data configurations
  const userGrowthChart = {
    labels: data.userGrowth.labels,
    datasets: [
      {
        label: 'User Growth',
        data: data.userGrowth.data,
        borderColor: accentColor,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const quizPerformanceChart = {
    labels: data.quizAnalytics.labels,
    datasets: [
      {
        label: 'Average Score',
        data: data.quizAnalytics.scores,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
      },
      {
        label: 'Attempts',
        data: data.quizAnalytics.attempts,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
    ],
  };

  const completionRateChart = {
    labels: data.coursePerformance.map(c => c.course),
    datasets: [
      {
        data: data.coursePerformance.map(c => c.completionRate),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
      },
    ],
  };

  return (
    <Box p={6} maxW="1400px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={2}>
          <Heading size="xl" bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text">
            Analytics Dashboard
          </Heading>
          <Text color="gray.600">Comprehensive insights into learning platform performance</Text>
        </VStack>
        
        <HStack spacing={4}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            size="sm"
            w="auto"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </Select>
          
          <InputGroup size="sm" w="auto">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Button leftIcon={<FiDownload />} size="sm" variant="outline">
            Export
          </Button>
        </HStack>
      </Flex>

      {/* Overview Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Total Users</StatLabel>
              <StatNumber>{data.overview.totalUsers}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                23.36%
              </StatHelpText>
            </Stat>
            <HStack mt={2}>
              <Icon as={FiUsers} color="blue.500" />
              <Text fontSize="sm" color="gray.600">{data.overview.activeUsers} active</Text>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Course Completion</StatLabel>
              <StatNumber>{data.overview.completionRate.toFixed(1)}%</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                5.2%
              </StatHelpText>
            </Stat>
            <HStack mt={2}>
              <Icon as={FiBook} color="green.500" />
              <Text fontSize="sm" color="gray.600">{data.overview.totalCourses} courses</Text>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Avg Quiz Score</StatLabel>
              <StatNumber>{data.overview.avgQuizScore}%</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                2.1%
              </StatHelpText>
            </Stat>
            <HStack mt={2}>
              <Icon as={FiAward} color="orange.500" />
              <Text fontSize="sm" color="gray.600">{data.overview.totalQuizzes} quizzes</Text>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">SRS Reviews</StatLabel>
              <StatNumber>{data.overview.totalSRSReviews.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                15.7%
              </StatHelpText>
            </Stat>
            <HStack mt={2}>
              <Icon as={FiTarget} color="purple.500" />
              <Text fontSize="sm" color="gray.600">{data.srsStats.retentionRate.toFixed(1)}% retention</Text>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
        {/* Main Charts */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* User Growth Chart */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">User Growth Trend</Heading>
              </CardHeader>
              <CardBody>
                <Box h="300px">
                  <Line 
                    data={userGrowthChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                    }}
                  />
                </Box>
              </CardBody>
            </Card>

            {/* Quiz Performance */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Quiz Performance by Level</Heading>
              </CardHeader>
              <CardBody>
                <Box h="300px">
                  <Bar 
                    data={quizPerformanceChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                      },
                    }}
                  />
                </Box>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        {/* Sidebar Stats */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Course Completion */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Course Completion Rates</Heading>
              </CardHeader>
              <CardBody>
                <Box h="250px">
                  <Doughnut 
                    data={completionRateChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </Box>
              </CardBody>
            </Card>

            {/* SRS Statistics */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Spaced Repetition</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between">
                    <Text>Total Cards</Text>
                    <Badge colorScheme="blue">{data.srsStats.totalCards}</Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Due Cards</Text>
                    <Badge colorScheme="orange">{data.srsStats.dueCards}</Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Retention Rate</Text>
                    <Badge colorScheme="green">{data.srsStats.retentionRate.toFixed(1)}%</Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Avg Ease Factor</Text>
                    <Badge colorScheme="purple">{data.srsStats.avgEaseFactor}</Badge>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </Grid>

      {/* User Activity Table */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Recent User Activity</Heading>
            <Button size="sm" variant="ghost" rightIcon={<FiEye />}>
              View All
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Courses</Th>
                <Th>Lessons Completed</Th>
                <Th>Avg Score</Th>
                <Th>Streak</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.userActivity.slice(0, 8).map((activity, index) => (
                <Tr key={index}>
                  <Td>
                    <HStack>
                      <Avatar size="sm" name={activity.user.full_name || activity.user.email} />
                      <Box>
                        <Text fontWeight="medium">{activity.user.full_name || 'Unknown User'}</Text>
                        <Text fontSize="sm" color="gray.600">{activity.user.email}</Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td>{activity.coursesEnrolled}</Td>
                  <Td>{activity.lessonsCompleted}</Td>
                  <Td>
                    <Badge colorScheme={activity.avgScore >= 80 ? 'green' : activity.avgScore >= 70 ? 'orange' : 'red'}>
                      {activity.avgScore}%
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue">{activity.streak} days</Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={activity.avgScore >= 80 ? 'green' : 'blue'}>
                      {activity.avgScore >= 80 ? 'Advanced' : 'Intermediate'}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Course Performance */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Course Performance</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {data.coursePerformance.map((course, index) => (
              <Card key={index} variant="outline">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="bold" fontSize="lg">{course.course}</Text>
                    
                    <Box>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" color="gray.600">Completion</Text>
                        <Text fontSize="sm" fontWeight="medium">{course.completionRate.toFixed(1)}%</Text>
                      </Flex>
                      <Progress value={course.completionRate} colorScheme="blue" size="sm" borderRadius="full" />
                    </Box>

                    <SimpleGrid columns={2} spacing={2}>
                      <Box textAlign="center">
                        <Text fontSize="sm" color="gray.600">Enrolled</Text>
                        <Text fontWeight="bold">{course.enrolled}</Text>
                      </Box>
                      <Box textAlign="center">
                        <Text fontSize="sm" color="gray.600">Avg Score</Text>
                        <Text fontWeight="bold">{course.avgScore}%</Text>
                      </Box>
                    </SimpleGrid>

                    <Button size="sm" variant="outline" w="full">
                      View Details
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AnalyticsAdmin;