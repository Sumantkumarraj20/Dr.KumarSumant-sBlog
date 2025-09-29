"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
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
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  IconButton,
} from "@chakra-ui/react";
import {
  FiBook,
  FiAward,
  FiClock,
  FiTrendingUp,
  FiBarChart2,
  FiPlayCircle,
  FiCheckCircle,
  FiTarget,
  FiAlertCircle,
  FiSearch,
  FiX,
  FiFileText,
  FiHelpCircle,
} from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import { useRouter } from "next/router";
import { debounce } from "lodash";

// Type Definitions
interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  current_module_id?: string;
  current_unit_id?: string;
  current_lesson_id?: string;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  last_accessed: string;
  courses: {
    title: string;
    description?: string;
  };
  modules?: {
    title: string;
  };
  units?: {
    title: string;
  };
  lessons?: {
    title: string;
  };
}

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  attempted_at: string;
  lessons: {
    title: string;
  };
}

interface SRSProgress {
  id: string;
  correct_attempts: number;
  wrong_attempts: number;
  score: number;
  last_reviewed?: string;
  next_review?: string;
}

interface DashboardData {
  courseProgress: CourseProgress[];
  quizPerformance: QuizAttempt[];
  srsStats: {
    totalCards: number;
    dueNow: number;
    retentionRate: number;
    totalReviews: number;
    averageScore: number;
  };
  currentLearning: CourseProgress | null;
  recentActivity: any[];
  learningStreak: number;
  overallStats: {
    totalCourses: number;
    completedLessons: number;
    totalLessons: number;
    averageQuizScore: number;
  };
}

interface SearchResult {
  id: string;
  type: 'course' | 'module' | 'unit' | 'lesson' | 'quiz';
  title: string;
  description?: string;
  content?: string;
  path: string;
  relevance: number;
  breadcrumb: string[];
  icon: any;
}

// Fixed Database response types - handle array responses from Supabase joins
interface CourseSearchResult {
  id: string;
  title: string;
  description?: string;
}

interface ModuleSearchResult {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  courses: { title: string }[]; // Array from join
}

interface UnitSearchResult {
  id: string;
  title: string;
  description?: string;
  module_id: string;
  modules: { 
    title: string; 
    course_id: string; 
    courses: { title: string }[]; // Array from join
  }[]; // Array from join
}

interface LessonSearchResult {
  id: string;
  title: string;
  content: any;
  unit_id: string;
  units: {
    title: string;
    module_id: string;
    modules: {
      title: string;
      course_id: string;
      courses: { title: string }[]; // Array from join
    }[]; // Array from join
  }[]; // Array from join
}

interface QuizSearchResult {
  id: string;
  question_text: any;
  explanation: any;
  lesson_id: string;
  lessons: {
    title: string;
    unit_id: string;
    units: {
      title: string;
      module_id: string;
      modules: {
        title: string;
        course_id: string;
        courses: { title: string }[]; // Array from join
      }[]; // Array from join
    }[]; // Array from join
  }[]; // Array from join
}

// Helper functions to safely extract data from arrays
const getFirstItem = <T,>(array: T[] | null | undefined): T | null => {
  return array && array.length > 0 ? array[0] : null;
};

const getSafeTitle = (item: { title: string } | null | undefined): string => {
  return item?.title || 'Unknown';
};

const getSafeCourseTitle = (courses: { title: string }[] | null | undefined): string => {
  const course = getFirstItem(courses);
  return course?.title || 'Unknown Course';
};

// Skeleton components (keep the same as before)
const StatSkeleton = () => (
  <Box p={3} bg="white" _dark={{ bg: "gray.700" }} borderRadius="lg">
    <Skeleton height="16px" width="60%" mb={2} />
    <Skeleton height="24px" width="40%" mb={1} />
    <Skeleton height="14px" width="70%" />
  </Box>
);

const CourseProgressSkeleton = () => (
  <Box p={4} border="1px solid" borderColor="gray.200" _dark={{ borderColor: "gray.600" }} borderRadius="lg">
    <Skeleton height="20px" width="70%" mb={3} />
    <Skeleton height="12px" width="100%" mb={2} />
    <Skeleton height="8px" width="100%" mb={2} />
    <Skeleton height="14px" width="50%" />
  </Box>
);

const ActivitySkeleton = () => (
  <Flex align="center" gap={3} p={2}>
    <Skeleton height="32px" width="32px" borderRadius="full" />
    <Box flex={1}>
      <Skeleton height="16px" width="80%" mb={1} />
      <Skeleton height="12px" width="60%" />
    </Box>
    <Skeleton height="20px" width="40px" />
  </Flex>
);

const SearchResultSkeleton = () => (
  <VStack spacing={3} align="stretch">
    {[...Array(5)].map((_, i) => (
      <Flex key={i} align="center" gap={3} p={3}>
        <Skeleton height="40px" width="40px" borderRadius="md" />
        <Box flex={1}>
          <Skeleton height="16px" width="70%" mb={2} />
          <Skeleton height="12px" width="90%" />
          <Skeleton height="10px" width="40%" mt={1} />
        </Box>
      </Flex>
    ))}
  </VStack>
);

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Color values with proper dark/light mode support
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const successColor = useColorModeValue("green.500", "green.300");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");
  const statBg = useColorModeValue("gray.50", "gray.700");
  const searchBg = useColorModeValue("white", "gray.700");
  const searchBorder = useColorModeValue("gray.300", "gray.600");

  // Memoized data fetching function (keep your existing implementation)
  const loadDashboardData = useCallback(async () => {
    // ... your existing loadDashboardData implementation
  }, [user?.id, toast]);

  // Search function with debouncing - FIXED VERSION
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      try {
        setSearchLoading(true);
        setSearchError(null);

        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        
        // Search across all learning content in parallel
        const [
          coursesResponse,
          modulesResponse,
          unitsResponse,
          lessonsResponse,
          quizzesResponse
        ] = await Promise.allSettled([
          supabase.from('courses').select('id, title, description').or(`title.ilike.%${query}%,description.ilike.%${query}%`),
          supabase.from('modules').select('id, title, description, course_id, courses(title)').or(`title.ilike.%${query}%,description.ilike.%${query}%`),
          supabase.from('units').select('id, title, description, module_id, modules(title, course_id, courses(title))').or(`title.ilike.%${query}%,description.ilike.%${query}%`),
          supabase.from('lessons').select('id, title, content, unit_id, units(title, module_id, modules(title, course_id, courses(title)))').or(`title.ilike.%${query}%,content->>\'text\'.ilike.%${query}%`),
          supabase.from('quiz_questions').select('id, question_text, explanation, lesson_id, lessons(title, unit_id, units(title, module_id, modules(title, course_id, courses(title))))').or(`question_text->>\'text\'.ilike.%${query}%,explanation->>\'text\'.ilike.%${query}%`)
        ]);

        const results: SearchResult[] = [];

        // Process courses - FIXED
        if (coursesResponse.status === 'fulfilled' && coursesResponse.value.data) {
          coursesResponse.value.data.forEach((course: CourseSearchResult) => {
            const relevance = calculateRelevance(course.title + ' ' + (course.description || ''), searchTerms);
            results.push({
              id: course.id,
              type: 'course',
              title: course.title,
              description: course.description,
              path: `/learn/${course.id}`,
              relevance,
              breadcrumb: [course.title],
              icon: FiBook
            });
          });
        }

        // Process modules - FIXED
        if (modulesResponse.status === 'fulfilled' && modulesResponse.value.data) {
          modulesResponse.value.data.forEach((module: ModuleSearchResult) => {
            const relevance = calculateRelevance(module.title + ' ' + (module.description || ''), searchTerms);
            const courseTitle = getSafeCourseTitle(module.courses);
            results.push({
              id: module.id,
              type: 'module',
              title: module.title,
              description: module.description,
              path: `/learn/${module.course_id}/${module.id}`,
              relevance,
              breadcrumb: [courseTitle, module.title],
              icon: FiFileText
            });
          });
        }

        // Process units - FIXED
        if (unitsResponse.status === 'fulfilled' && unitsResponse.value.data) {
          unitsResponse.value.data.forEach((unit: UnitSearchResult) => {
            const relevance = calculateRelevance(unit.title + ' ' + (unit.description || ''), searchTerms);
            const moduleItem = getFirstItem(unit.modules);
            const courseTitle = getSafeCourseTitle(moduleItem?.courses);
            const moduleTitle = getSafeTitle(moduleItem);
            
            results.push({
              id: unit.id,
              type: 'unit',
              title: unit.title,
              description: unit.description,
              path: `/learn/${moduleItem?.course_id}/${unit.module_id}/${unit.id}`,
              relevance,
              breadcrumb: [courseTitle, moduleTitle, unit.title].filter(Boolean),
              icon: FiFileText
            });
          });
        }

        // Process lessons - FIXED
        if (lessonsResponse.status === 'fulfilled' && lessonsResponse.value.data) {
          lessonsResponse.value.data.forEach((lesson: LessonSearchResult) => {
            const contentText = extractTextFromContent(lesson.content);
            const relevance = calculateRelevance(lesson.title + ' ' + contentText, searchTerms);
            
            const unitItem = getFirstItem(lesson.units);
            const moduleItem = getFirstItem(unitItem?.modules);
            const courseTitle = getSafeCourseTitle(moduleItem?.courses);
            const moduleTitle = getSafeTitle(moduleItem);
            const unitTitle = getSafeTitle(unitItem);
            
            results.push({
              id: lesson.id,
              type: 'lesson',
              title: lesson.title,
              description: contentText?.substring(0, 150) + '...',
              content: contentText,
              path: `/learn/${moduleItem?.course_id}/${unitItem?.module_id}/${lesson.unit_id}/${lesson.id}`,
              relevance,
              breadcrumb: [courseTitle, moduleTitle, unitTitle, lesson.title].filter(Boolean),
              icon: FiPlayCircle
            });
          });
        }

        // Process quiz questions - FIXED
        if (quizzesResponse.status === 'fulfilled' && quizzesResponse.value.data) {
          quizzesResponse.value.data.forEach((question: QuizSearchResult) => {
            const questionText = extractTextFromContent(question.question_text);
            const explanationText = extractTextFromContent(question.explanation);
            const relevance = calculateRelevance(questionText + ' ' + explanationText, searchTerms);
            
            const lessonItem = getFirstItem(question.lessons);
            const unitItem = getFirstItem(lessonItem?.units);
            const moduleItem = getFirstItem(unitItem?.modules);
            const courseTitle = getSafeCourseTitle(moduleItem?.courses);
            const moduleTitle = getSafeTitle(moduleItem);
            const unitTitle = getSafeTitle(unitItem);
            const lessonTitle = getSafeTitle(lessonItem);
            
            results.push({
              id: question.id,
              type: 'quiz',
              title: `Quiz: ${questionText?.substring(0, 60)}...` || 'Quiz Question',
              description: explanationText?.substring(0, 100) + '...',
              path: `/learn/${moduleItem?.course_id}/${unitItem?.module_id}/${lessonItem?.unit_id}/${question.lesson_id}`,
              relevance,
              breadcrumb: [courseTitle, moduleTitle, unitTitle, lessonTitle, 'Quiz'].filter(Boolean),
              icon: FiHelpCircle
            });
          });
        }

        // Sort by relevance and limit results
        const sortedResults = results
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 10);

        setSearchResults(sortedResults);

      } catch (err) {
        console.error('Search error:', err);
        setSearchError('Failed to search content. Please try again.');
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  // Helper function to calculate relevance score
  const calculateRelevance = (text: string, searchTerms: string[]): number => {
    if (!text) return 0;
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    searchTerms.forEach(term => {
      if (lowerText.includes(term)) {
        score += 10;
        // Bonus for exact matches and title matches
        if (lowerText === term) score += 20;
        if (lowerText.startsWith(term)) score += 15;
      }
    });
    
    return score;
  };

  // Helper function to extract text from JSON content
  const extractTextFromContent = (content: any): string => {
    if (!content) return '';
    
    try {
      if (typeof content === 'string') {
        return content;
      }
      
      if (content.text) {
        return content.text;
      }
      
      if (Array.isArray(content)) {
        return content
          .map((item: any) => item.text || item.content || '')
          .filter(Boolean)
          .join(' ');
      }
      
      return JSON.stringify(content);
    } catch {
      return '';
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  // Handle search result click
  const handleResultClick = (result: SearchResult) => {
    router.push(result.path);
    onClose();
    clearSearch();
  };

  // Open search modal with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onOpen]);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Memoized progress calculations
  const progressPercentage = useMemo(() => {
    if (!data) return 0;
    return data.overallStats.totalLessons > 0
      ? Math.round((data.overallStats.completedLessons / data.overallStats.totalLessons) * 100)
      : 0;
  }, [data]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "green";
    if (percentage >= 50) return "blue";
    if (percentage >= 25) return "orange";
    return "red";
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "green";
    if (streak >= 3) return "blue";
    return "orange";
  };

  // Loading state
  if (loading) {
    return (
      <Box p={6} maxW="1400px" mx="auto">
        {/* Header Skeleton */}
        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" spacing={2}>
            <Skeleton height="32px" width="300px" />
            <Skeleton height="20px" width="200px" />
          </VStack>
          <HStack spacing={4}>
            <Skeleton height="24px" width="80px" borderRadius="full" />
            <Skeleton height="40px" width="40px" borderRadius="full" />
          </HStack>
        </Flex>

        {/* Overall Progress Skeleton */}
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Skeleton height="24px" width="200px" />
                <Skeleton height="28px" width="60px" />
              </Flex>
              <Skeleton height="20px" width="100%" borderRadius="full" />
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {[...Array(4)].map((_, i) => (
                  <StatSkeleton key={i} />
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Current Learning Skeleton */}
              <Card>
                <CardBody>
                  <SkeletonText noOfLines={4} spacing="3" />
                </CardBody>
              </Card>

              {/* Course Progress Skeletons */}
              <Card>
                <CardHeader>
                  <Skeleton height="24px" width="200px" />
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {[...Array(3)].map((_, i) => (
                      <CourseProgressSkeleton key={i} />
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* SRS Stats Skeleton */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Skeleton height="80px" borderRadius="lg" />
                    <SimpleGrid columns={2} spacing={3}>
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} height="60px" borderRadius="lg" />
                      ))}
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Activity Skeletons */}
              <Card>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {[...Array(4)].map((_, i) => (
                      <ActivitySkeleton key={i} />
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={6} maxW="1400px" mx="auto">
        <Alert status="error" borderRadius="lg" mb={6}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Unable to load dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
          <Button colorScheme="red" variant="outline" size="sm" onClick={loadDashboardData}>
            Retry
          </Button>
        </Alert>
        
        {/* Fallback empty state */}
        <Box textAlign="center" py={10}>
          <Icon as={FiAlertCircle} boxSize={12} color="gray.400" mb={4} />
          <Heading size="lg" mb={4}>
            Welcome to Your Learning Journey
          </Heading>
          <Text color={mutedTextColor} mb={6}>
            Start by exploring available courses and taking your first quiz.
          </Text>
          <Button colorScheme="blue" size="lg">
            <Link href="/learn/courses">Browse Courses</Link>
          </Button>
        </Box>
      </Box>
    );
  }

  // Empty state - no data
  if (!data || data.courseProgress.length === 0) {
    return (
      <Box p={6} maxW="1400px" mx="auto" textAlign="center" py={20}>
        <Icon as={FiBook} boxSize={16} color={accentColor} mb={6} />
        <Heading size="xl" mb={4} bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text">
          Ready to Start Learning?
        </Heading>
        <Text fontSize="lg" color={mutedTextColor} mb={8} maxW="500px" mx="auto">
          Begin your educational journey by enrolling in courses and tracking your progress with interactive quizzes and spaced repetition.
        </Text>
        <VStack spacing={4}>
          <Button colorScheme="blue" size="lg">
            <Link href="/learn/courses">Explore Courses</Link>
          </Button>
          <Text fontSize="sm" color={mutedTextColor}>
            Your learning statistics will appear here once you start.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <Box p={6} maxW="1400px" mx="auto">
        {/* Header with Search */}
        <Flex justify="space-between" align="center" mb={8} gap={4} flexDirection={{ base: "column", md: "row" }}>
          <VStack align="start" spacing={2} flex={1} width={{ base: "100%", md: "auto" }}>
            <Heading
              size="xl"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
            >
              Learning Dashboard
            </Heading>
            <Text color={mutedTextColor} fontSize="lg">
              Track your progress and optimize your learning
            </Text>
          </VStack>
          
          {/* Search Box */}
          <Box flex={{ base: 1, md: 0.5 }} width={{ base: "100%", md: "auto" }}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color={mutedTextColor} />
              </InputLeftElement>
              <Input
                placeholder="Search courses, lessons, quizzes... (Ctrl+K)"
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={onOpen}
                bg={searchBg}
                borderColor={searchBorder}
                _hover={{ borderColor: accentColor }}
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                readOnly
              />
              <InputRightElement>
                <Text fontSize="xs" color={mutedTextColor} mr={10}>
                  Ctrl+K
                </Text>
              </InputRightElement>
            </InputGroup>
          </Box>

          <HStack spacing={4}>
            {data.learningStreak > 0 && (
              <Badge
                colorScheme={getStreakColor(data.learningStreak)}
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                🔥 {data.learningStreak} day streak
              </Badge>
            )}
            <Avatar
              size="md"
              name={user?.email}
              src={user?.user_metadata?.avatar_url}
            />
          </HStack>
        </Flex>

        {/* Dashboard content remains the same as your existing implementation */}
        {/* ... include all your existing dashboard content here ... */}
        
      </Box>

      {/* Search Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={true}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} mx={4}>
          <ModalHeader pb={2}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color={mutedTextColor} />
              </InputLeftElement>
              <Input
                placeholder="Search across all learning content..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
                bg={searchBg}
                borderColor={searchBorder}
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
              />
              {searchQuery && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search"
                    icon={<FiX />}
                    size="sm"
                    variant="ghost"
                    onClick={clearSearch}
                  />
                </InputRightElement>
              )}
            </InputGroup>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {searchLoading ? (
              <SearchResultSkeleton />
            ) : searchError ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Text>{searchError}</Text>
              </Alert>
            ) : searchResults.length > 0 ? (
              <List spacing={3}>
                {searchResults.map((result, index) => (
                  <ListItem
                    key={`${result.type}-${result.id}-${index}`}
                    p={3}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{
                      bg: statBg,
                      borderColor: accentColor,
                      transform: 'translateY(-1px)',
                      shadow: 'sm'
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <Flex align="start" gap={3}>
                      <Icon as={result.icon} color={accentColor} boxSize={5} mt={1} />
                      <Box flex={1}>
                        <Text fontWeight="semibold" fontSize="md" mb={1}>
                          {result.title}
                        </Text>
                        {result.description && (
                          <Text fontSize="sm" color={mutedTextColor} noOfLines={2} mb={2}>
                            {result.description}
                          </Text>
                        )}
                        <HStack spacing={2} fontSize="xs" color={mutedTextColor}>
                          <Badge
                            colorScheme={
                              result.type === 'course' ? 'blue' :
                              result.type === 'lesson' ? 'green' :
                              result.type === 'quiz' ? 'purple' : 'gray'
                            }
                            variant="subtle"
                            fontSize="2xs"
                          >
                            {result.type}
                          </Badge>
                          <Text>•</Text>
                          <Text>{result.breadcrumb.join(' › ')}</Text>
                        </HStack>
                      </Box>
                    </Flex>
                  </ListItem>
                ))}
              </List>
            ) : searchQuery.length >= 2 ? (
              <Box textAlign="center" py={8}>
                <Icon as={FiSearch} boxSize={8} color={mutedTextColor} mb={3} />
                <Text color={mutedTextColor}>
                  No results found for "<Text as="span" fontWeight="semibold">{searchQuery}</Text>"
                </Text>
                <Text fontSize="sm" color={mutedTextColor} mt={2}>
                  Try different keywords or browse the courses directly.
                </Text>
              </Box>
            ) : (
              <Box textAlign="center" py={8}>
                <Icon as={FiSearch} boxSize={8} color={mutedTextColor} mb={3} />
                <Text color={mutedTextColor}>
                  Type to search across courses, lessons, and quizzes
                </Text>
                <Text fontSize="sm" color={mutedTextColor} mt={2}>
                  Minimum 2 characters required
                </Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Dashboard;