import { fetchLessons, Lesson } from "@/lib/learn";
import { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import LearningInterface from "./LearningInterface";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  unit: any;
  userId: string;
  lesson: any;
  onBack: () => void;
  onSelectLesson: (lesson: any) => void;
}

interface LessonProgress {
  percent: number;
  completed: boolean;
  quizScore?: number;
  srsReviews?: number;
}

export default function LessonPage({ unit, userId, onBack, onSelectLesson }: Props) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<
    Record<string, LessonProgress>
  >({});
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);

  const cardBg = useColorModeValue("white", "gray.700");
  const cardHover = useColorModeValue("blue.50", "gray.600");

  // Fetch lessons and progress
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Get lessons
      const lessonList = await fetchLessons(unit.id);
      setLessons(lessonList);

      const newMap: Record<string, LessonProgress> = {};

      for (const lesson of lessonList) {
        // 1. Course progress
        const { data: courseProg } = await supabase
          .from("user_course_progress")
          .select("completed_lessons,total_lessons,current_lesson_id")
          .eq("user_id", userId)
          .eq("current_lesson_id", lesson.id)
          .maybeSingle();

        // 2. Quiz attempts
        const { data: quizAttempts } = await supabase
          .from("user_quiz_attempts")
          .select("score,passed")
          .eq("user_id", userId)
          .eq("lesson_id", lesson.id)
          .order("attempted_at", { ascending: false })
          .limit(1);

        const lastQuiz = quizAttempts?.[0];

        // 3. SRS reviews
        const { count: srsReviews } = await supabase
          .from("user_srs_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        // Compute percent
        let percent = 0;
        let completed = false;
        if (courseProg?.total_lessons > 0) {
          percent = Math.round(
            (courseProg.completed_lessons / courseProg.total_lessons) * 100
          );
          completed = percent >= 100;
        }

        newMap[lesson.id] = {
          percent,
          completed,
          quizScore: lastQuiz?.score ?? undefined,
          srsReviews: srsReviews ?? 0,
        };
      }

      setProgressMap(newMap);
      setLoading(false);
    };

    load();
  }, [unit.id, userId]);

  if (loading) {
    return (
      <Flex h="80vh" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="blue.500" />
        <Text fontSize="md" color="gray.500">
          Loading lessons...
        </Text>
      </Flex>
    );
  }

  if (activeLesson) {
    const startIndex = lessons.findIndex((l) => l.id === activeLesson.id);

    return (
      <LearningInterface
        userId={userId}
        courseId={unit.course_id} // adjust to your schema
        unit={unit}
        lessons={lessons}
        startIndex={startIndex >= 0 ? startIndex : 0}
        onFinishCourse={() => setActiveLesson(null)} // <-- replaces onBack
      />
    );
  }

  return (
    <Flex direction="column" w="100%" h="100%" p={8}>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {lessons.map((lesson) => {
          const prog = progressMap[lesson.id] ?? {
            percent: 0,
            completed: false,
          };
          const isCompleted = prog.completed;

          return (
            <Box
              key={lesson.id}
              bg={cardBg}
              rounded="2xl"
              p={6}
              shadow="md"
              transition="all 0.2s"
              cursor="pointer"
              _hover={{
                shadow: "xl",
                transform: "translateY(-5px)",
                bg: cardHover,
              }}
            >
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="xl" fontWeight="bold" noOfLines={1}>
                    {lesson.title}
                  </Text>
                  <Box w="64px" h="64px">
                    <CircularProgressbar
                      value={prog.percent}
                      text={prog.percent > 0 ? `${prog.percent}%` : ""}
                      styles={buildStyles({
                        textSize: "36%",
                        pathColor: isCompleted ? "#38a169" : "#3182ce",
                        textColor: isCompleted ? "#38a169" : "#3182ce",
                        trailColor: "#e2e8f0",
                      })}
                    />
                  </Box>
                </HStack>

                {lesson.description && (
                  <Text fontSize="sm" color="gray.500" noOfLines={3}>
                    {lesson.description}
                  </Text>
                )}

                {prog.quizScore !== undefined && (
                  <Text fontSize="sm" color="gray.600">
                    Last Quiz Score: <b>{prog.quizScore}</b>
                  </Text>
                )}

                {prog.srsReviews > 0 && (
                  <Text fontSize="sm" color="gray.600">
                    SRS Reviews: <b>{prog.srsReviews}</b>
                  </Text>
                )}

                <HStack w="full" justify="space-between">
                  {isCompleted ? (
                    <Badge colorScheme="green" px={3} py={1} rounded="lg">
                      ✅ Completed
                    </Badge>
                  ) : prog.percent > 0 ? (
                    <Badge colorScheme="blue" px={3} py={1} rounded="lg">
                      In Progress
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray" px={3} py={1} rounded="lg">
                      Not Started
                    </Badge>
                  )}
                  <Button
                    colorScheme={isCompleted ? "green" : "blue"}
                    size="sm"
                    onClick={() => setActiveLesson(lesson)}
                  >
                    {prog.percent > 0 && !isCompleted
                      ? "Continue"
                      : "Start Lesson"}
                  </Button>
                </HStack>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Flex>
  );
}
