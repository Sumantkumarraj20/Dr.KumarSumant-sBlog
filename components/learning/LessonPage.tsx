// components/learning/LessonPage.tsx
import { fetchLessons, Lesson } from "@/lib/learn";
import { useEffect, useState, useCallback } from "react";
import {
  SimpleGrid,
  Box,
  Text,
  VStack,
  Button,
  Flex,
  HStack,
  useColorModeValue,
  Spinner,
  Badge,
  Card,
  CardBody,
  Progress,
  Icon,
  Skeleton,
  Grid,
  GridItem,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { 
  FiBook, 
  FiAward, 
  FiClock, 
  FiPlay, 
  FiCheckCircle, 
  FiBarChart2,
  FiArrowLeft,
  FiTarget
} from "react-icons/fi";
import LearningInterface from "./LearningInterface";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  unit: any;
  userId: string;
  onBack: () => void;
  onSelectLesson: (lesson: any) => void;
}

interface LessonProgress {
  percent: number;
  completed: boolean;
  quizScore?: number;
  srsReviews?: number;
  lastAccessed?: string;
  timeSpent?: number;
}

export default function LessonPage({ unit, userId, onBack, onSelectLesson }: Props) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [cachedProgress, setCachedProgress] = useState<Record<string, LessonProgress>>({});

  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("blue.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  // Memoized progress calculation
  const calculateLessonProgress = useCallback(async (lessonId: string): Promise<LessonProgress> => {
    // Check cache first
    if (cachedProgress[lessonId]) {
      return cachedProgress[lessonId];
    }

    try {
      const [
        { data: courseProg },
        { data: quizAttempts },
        { data: srsData },
        { data: timeData }
      ] = await Promise.all([
        supabase
          .from("user_course_progress")
          .select("completed_lessons, total_lessons, current_lesson_id, last_accessed")
          .eq("user_id", userId)
          .eq("current_lesson_id", lessonId)
          .maybeSingle(),
        
        supabase
          .from("user_quiz_attempts")
          .select("score, passed, attempted_at")
          .eq("user_id", userId)
          .eq("lesson_id", lessonId)
          .order("attempted_at", { ascending: false })
          .limit(1),
        
        supabase
          .from("user_srs_progress")
          .select("correct_attempts, wrong_attempts, last_reviewed")
          .eq("user_id", userId)
          .maybeSingle(),
        
        supabase
          .from("user_quiz_attempts")
          .select("attempted_at")
          .eq("user_id", userId)
          .eq("lesson_id", lessonId)
          .order("attempted_at", { ascending: false })
          .limit(1)
      ]);

      const lastQuiz = quizAttempts?.[0];
      const srsReviews = (srsData?.correct_attempts || 0) + (srsData?.wrong_attempts || 0);
      
      let percent = 0;
      let completed = false;

      // Calculate completion based on quiz attempts and progress
      if (lastQuiz?.passed) {
        percent = 100;
        completed = true;
      } else if (courseProg?.completed_lessons && courseProg.total_lessons) {
        percent = Math.round((courseProg.completed_lessons / courseProg.total_lessons) * 100);
        completed = percent >= 100;
      } else if (lastQuiz) {
        percent = Math.min(lastQuiz.score || 0, 100);
        completed = lastQuiz.passed || false;
      }

      // Estimate time spent: use quiz attempts timestamps window (if available)
      let timeSpent = 0;
      try {
        if (quizAttempts && quizAttempts.length > 0) {
          const times = quizAttempts
            .map((a: any) => new Date(a.attempted_at).getTime())
            .filter(Boolean)
            .sort((a: number, b: number) => a - b);
          if (times.length >= 2) {
            // convert ms to minutes
            timeSpent = Math.round((times[times.length - 1] - times[0]) / 60000);
          } else if (times.length === 1) {
            // Single attempt — assign a default of 5-15 minutes depending on score
            timeSpent = lastQuiz?.score ? Math.min(30, Math.max(5, Math.round((lastQuiz.score / 100) * 20))) : 10;
          }
        }
      } catch (e) {
        console.warn("Failed to estimate timeSpent for lesson", lessonId, e);
      }

      const progress: LessonProgress = {
        percent,
        completed,
        quizScore: lastQuiz?.score,
        srsReviews,
        lastAccessed: courseProg?.last_accessed || lastQuiz?.attempted_at,
        timeSpent,
      };

      // Update cache
      setCachedProgress(prev => ({ ...prev, [lessonId]: progress }));
      
      return progress;
    } catch (error) {
      console.error("Error calculating progress for lesson:", lessonId, error);
      return { percent: 0, completed: false };
    }
  }, [userId, cachedProgress]);

  // Optimized data loading with batching
  const loadLessonsAndProgress = useCallback(async () => {
    setLoading(true);
    try {
      const lessonList = await fetchLessons(unit.id);
      setLessons(lessonList);

      // Load progress for all lessons in parallel with limited concurrency
      const progressPromises = lessonList.map(lesson => 
        calculateLessonProgress(lesson.id)
      );
      
      const progressResults = await Promise.all(progressPromises);
      
      const newProgressMap: Record<string, LessonProgress> = {};
      lessonList.forEach((lesson, index) => {
        newProgressMap[lesson.id] = progressResults[index];
      });
      
      setProgressMap(newProgressMap);
    } catch (error) {
      console.error("Error loading lessons:", error);
      toast({
        title: "Failed to load lessons",
        description: "Please try again later",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [unit.id, calculateLessonProgress, toast]);

  useEffect(() => {
    loadLessonsAndProgress();
  }, [loadLessonsAndProgress]);

  const getProgressColor = (percent: number, completed: boolean) => {
    if (completed) return "green";
    if (percent >= 75) return "blue";
    if (percent >= 50) return "orange";
    if (percent >= 25) return "yellow";
    return "gray";
  };

  const getStatusBadge = (progress: LessonProgress) => {
    if (progress.completed) {
      return (
        <Badge colorScheme="green" px={3} py={1} rounded="full" fontSize="xs">
          <HStack spacing={1}>
            <Icon as={FiCheckCircle} />
            <Text>Completed</Text>
          </HStack>
        </Badge>
      );
    }
    
    if (progress.percent > 0) {
      return (
        <Badge colorScheme="blue" px={3} py={1} rounded="full" fontSize="xs">
          <HStack spacing={1}>
            <Icon as={FiBarChart2} />
            <Text>{progress.percent}% Done</Text>
          </HStack>
        </Badge>
      );
    }
    
    return (
      <Badge colorScheme="gray" px={3} py={1} rounded="full" fontSize="xs">
        <HStack spacing={1}>
          <Icon as={FiBook} />
          <Text>Not Started</Text>
        </HStack>
      </Badge>
    );
  };

  const getCardGradient = (progress: LessonProgress) => {
    if (progress.completed) {
      return useColorModeValue(
        "linear(to-br, green.50, green.100)",
        "linear(to-br, green.900, green.800)"
      );
    }
    
    if (progress.percent > 0) {
      return useColorModeValue(
        "linear(to-br, blue.50, purple.50)",
        "linear(to-br, blue.900, purple.900)"
      );
    }
    
    return useColorModeValue(
      "linear(to-br, gray.50, gray.100)",
      "linear(to-br, gray.800, gray.700)"
    );
  };

  const handleLessonSelect = (lesson: any) => {
    setActiveLesson(lesson);
    // Call parent navigation if provided
    if (onSelectLesson) {
      onSelectLesson(lesson);
    }
  };

  if (loading) {
    return (
      <Flex direction="column" w="100%" minH="80vh" p={6}>
        {/* Back Button Skeleton */}
        <Skeleton height="40px" width="120px" mb={6} rounded="lg" />
        
        {/* Lessons Grid Skeleton */}
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)"
          }}
          gap={6}
        >
          {[...Array(8)].map((_, index) => (
            <GridItem key={index}>
              <Card bg={cardBg} border="1px solid" borderColor={cardBorder} h="200px">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Skeleton height="20px" rounded="md" />
                    <Skeleton height="16px" rounded="md" />
                    <Skeleton height="12px" rounded="md" />
                    <Skeleton height="40px" rounded="lg" mt={2} />
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </Flex>
    );
  }

  if (activeLesson) {
    const startIndex = lessons.findIndex((l) => l.id === activeLesson.id);

    return (
      <LearningInterface
        userId={userId}
        courseId={unit.course_id}
        unit={unit}
        lessons={lessons}
        startIndex={Math.max(startIndex, 0)}
        onFinishCourse={() => setActiveLesson(null)}
        onBack={() => setActiveLesson(null)}
      />
    );
  }

  return (
    <Flex direction="column" w="100%" minH="100vh" p={6}>
      {/* Header */}
      <VStack align="start" spacing={4} mb={8}>
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          leftIcon={<Icon as={FiArrowLeft} />}
          color={mutedText}
          _hover={{ bg: hoverBg }}
        >
          Back to Units
        </Button>
        
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            {unit.title}
          </Text>
          <Text fontSize="md" color={mutedText}>
            {lessons.length} lessons • Choose a lesson to begin
          </Text>
        </VStack>
      </VStack>

      {/* Lessons Grid */}
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)"
        }}
        gap={6}
        flex="1"
      >
        {lessons.map((lesson, index) => {
          const progress = progressMap[lesson.id] || { percent: 0, completed: false };
          const progressColor = getProgressColor(progress.percent, progress.completed);
          const cardGradient = getCardGradient(progress);

          return (
            <GridItem key={lesson.id}>
              <Card
                bgGradient={cardGradient}
                border="1px solid"
                borderColor={cardBorder}
                shadow="md"
                transition="all 0.3s ease-in-out"
                _hover={{
                  transform: "translateY(-4px)",
                  shadow: "xl",
                  borderColor: useColorModeValue("blue.300", "blue.500"),
                }}
                cursor="pointer"
                onClick={() => handleLessonSelect(lesson)}
                position="relative"
                overflow="hidden"
              >
                {/* Progress indicator bar */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  h="4px"
                  bg={`${progressColor}.500`}
                  opacity={progress.percent > 0 ? 1 : 0.3}
                />

                <CardBody p={5}>
                  <VStack align="stretch" spacing={4}>
                    {/* Lesson header */}
                    <HStack justify="space-between" align="start">
                      <Box flex="1">
                        <HStack spacing={2} mb={2}>
                          <Box
                            w="8px"
                            h="8px"
                            rounded="full"
                            bg={`${progressColor}.500`}
                            flexShrink={0}
                          />
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={mutedText}
                          >
                            Lesson {index + 1}
                          </Text>
                        </HStack>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color={textColor}
                          noOfLines={2}
                          lineHeight="tall"
                        >
                          {lesson.title}
                        </Text>
                      </Box>
                    </HStack>

                    {/* Progress bar */}
                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" color={mutedText} fontWeight="medium">
                          Progress
                        </Text>
                        <Text fontSize="xs" color={mutedText} fontWeight="bold">
                          {progress.percent}%
                        </Text>
                      </HStack>
                      <Progress
                        value={progress.percent}
                        colorScheme={progressColor}
                        size="sm"
                        rounded="full"
                        bg={useColorModeValue("gray.200", "gray.600")}
                      />
                    </Box>

                    {/* Stats row */}
                    <HStack justify="space-between" spacing={4}>
                      {progress.quizScore !== undefined && (
                        <Tooltip label="Best Quiz Score">
                          <HStack spacing={1}>
                            <Icon as={FiAward} color={`${progressColor}.500`} size="14px" />
                            <Text fontSize="xs" color={mutedText}>
                              {progress.quizScore}%
                            </Text>
                          </HStack>
                        </Tooltip>
                      )}
                      
                      {progress.srsReviews > 0 && (
                        <Tooltip label="SRS Reviews Completed">
                          <HStack spacing={1}>
                            <Icon as={FiTarget} color={`${progressColor}.500`} size="14px" />
                            <Text fontSize="xs" color={mutedText}>
                              {progress.srsReviews}
                            </Text>
                          </HStack>
                        </Tooltip>
                      )}
                      
                      {progress.timeSpent && (
                        <Tooltip label="Estimated Time Spent">
                          <HStack spacing={1}>
                            <Icon as={FiClock} color={`${progressColor}.500`} size="14px" />
                            <Text fontSize="xs" color={mutedText}>
                              {progress.timeSpent}m
                            </Text>
                          </HStack>
                        </Tooltip>
                      )}
                    </HStack>

                    {/* Action section */}
                    <VStack spacing={3} pt={2}>
                      {getStatusBadge(progress)}
                      <Button
                        colorScheme={progress.completed ? "green" : "blue"}
                        size="sm"
                        w="full"
                        leftIcon={<Icon as={progress.completed ? FiCheckCircle : FiPlay} />}
                        variant={progress.completed ? "outline" : "solid"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLessonSelect(lesson);
                        }}
                        _hover={{
                          transform: "scale(1.02)",
                        }}
                        transition="all 0.2s"
                      >
                        {progress.completed ? "Review" : 
                         progress.percent > 0 ? "Continue" : "Start Lesson"}
                      </Button>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          );
        })}
      </Grid>

      {/* Empty state */}
      {lessons.length === 0 && !loading && (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          flex="1" 
          py={20}
          color={mutedText}
        >
          <Icon as={FiBook} boxSize={12} mb={4} opacity={0.5} />
          <Text fontSize="xl" fontWeight="medium" mb={2}>
            No Lessons Available
          </Text>
          <Text textAlign="center" maxW="md">
            This unit doesn't contain any lessons yet. Check back later or contact the course administrator.
          </Text>
        </Flex>
      )}
    </Flex>
  );
}