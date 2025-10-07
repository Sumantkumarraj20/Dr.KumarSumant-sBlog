// components/learning/LearningInterface.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Divider,
  Button,
  Text,
  useColorModeValue,
  Progress,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useToast,
} from "@chakra-ui/react";
import { JSONContent } from "@tiptap/react";
import { supabase } from "@/lib/supabaseClient";
import { RichTextView } from "../RichTextView";
import {
  recordProgress,
  recordQuizAnswer,
  recordReview as recordReviewIfExists,
} from "@/lib/srs";
import type { Lesson, Unit, Module, QuizQuestion } from "@/types/learn";

// Local types matching your database schema
type QuizQuestionRow = {
  id: string;
  quiz_id: string;
  question_text: JSONContent;
  options: any;
  correct_answer: any;
  explanation?: JSONContent;
  source_exam?: string;
  created_at?: string;
  lesson_id?: string;
};

type LearningInterfaceProps = {
  courseId: string;
  unit?: Unit;
  module?: Module;
  lessons: Lesson[];
  userId: string;
  startIndex?: number;
  onFinishCourse?: () => void;
  onBack?: () => void;
  onNavigateLesson?: (lesson: Lesson) => void;
};

export default function LearningInterface({
  courseId,
  module,
  unit,
  lessons,
  userId,
  startIndex = 0,
  onFinishCourse,
  onBack,
  onNavigateLesson,
}: LearningInterfaceProps) {
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const subtleText = useColorModeValue("gray.600", "gray.400");

  // UI + flow state
  const [index, setIndex] = useState(startIndex);
  const [mode, setMode] = useState<"read" | "quiz">("read");
  const [loading, setLoading] = useState(false);

  // quiz state
  const [quizId, setQuizId] = useState<string | null>(null);
  const [deck, setDeck] = useState<QuizQuestionRow[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<number>(0);

  // Prefetch cache for question arrays keyed by lesson.id
  const [questionCache, setQuestionCache] = useState<
    Record<string, QuizQuestionRow[]>
  >({});

  const lesson = lessons[index] || null;
  const nextLesson = lessons[index + 1] ?? null;

  // Helper: normalize content into JSONContent - handles your JSONB data properly
  // Enhanced helper: normalize content into JSONContent
  const normalizeContent = (raw: any): JSONContent => {
    // Default empty document
    const emptyDoc: JSONContent = { type: "doc", content: [] };

    if (!raw) return emptyDoc;

    try {
      // Case 1: Already proper JSONContent
      if (
        typeof raw === "object" &&
        raw.type === "doc" &&
        Array.isArray(raw.content)
      ) {
        return raw as JSONContent;
      }

      // Case 2: Array of content blocks (your current data format)
      if (Array.isArray(raw)) {
        // Validate that it's an array of valid content
        const validContent = raw.filter(
          (item) => item && typeof item === "object" && item.type
        );
        if (validContent.length > 0) {
          return {
            type: "doc",
            content: validContent,
          };
        }
      }

      // Case 3: String that might be JSON
      if (typeof raw === "string") {
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(raw);
          return normalizeContent(parsed); // Recursively handle parsed content
        } catch {
          // If it's plain text, create a paragraph
          if (raw.trim().length > 0) {
            return {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: raw }],
                },
              ],
            };
          }
        }
      }

      // Case 4: Single content object (not wrapped in array)
      if (typeof raw === "object" && raw.type && !Array.isArray(raw)) {
        return {
          type: "doc",
          content: [raw],
        };
      }
    } catch (error) {
      console.error("Error normalizing content:", error, raw);
    }

    // Fallback: empty document
    return emptyDoc;
  };
  // ---------- Fetch helpers ----------

  // Fetch quiz id for given lesson
  const fetchQuizIdForLesson = useCallback(
    async (lessonId: string | undefined) => {
      if (!lessonId) return null;
      const { data, error } = await supabase
        .from("quizzes")
        .select("id")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error) {
        console.error("fetchQuizIdForLesson error", error);
        return null;
      }
      return data?.id ?? null;
    },
    []
  );

  // Fetch questions for a quiz id - properly handles JSONB fields
  const fetchQuestionsForQuiz = useCallback(async (quiz_id: string | null) => {
    if (!quiz_id) return [];

    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("fetchQuestionsForQuiz error", error);
      return [];
    }

    return (data || []).map((q: any) => {
      // question_text is JSONB - ensure it's properly formatted for RichTextView
      let questionText: JSONContent;
      if (typeof q.question_text === "string") {
        try {
          questionText = JSON.parse(q.question_text);
        } catch {
          questionText = {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: q.question_text }],
              },
            ],
          };
        }
      } else {
        questionText = q.question_text || { type: "doc", content: [] };
      }

      // explanation is JSONB - ensure it's properly formatted for RichTextView
      let explanation: JSONContent | undefined;
      if (q.explanation) {
        if (typeof q.explanation === "string") {
          try {
            explanation = JSON.parse(q.explanation);
          } catch {
            explanation = {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: q.explanation }],
                },
              ],
            };
          }
        } else {
          explanation = q.explanation;
        }
      }

      return {
        id: q.id,
        quiz_id: q.quiz_id,
        question_text: questionText,
        options: Array.isArray(q.options)
          ? q.options
          : JSON.parse(q.options || "[]"),
        correct_answer: Array.isArray(q.correct_answer)
          ? q.correct_answer
          : JSON.parse(q.correct_answer || "[]"),
        explanation: explanation,
        source_exam: q.source_exam,
        created_at: q.created_at,
        lesson_id: q.lesson_id,
      } as QuizQuestionRow;
    });
  }, []);

  // Prefetch questions for lesson (and cache)
  const prefetchQuestionsForLesson = useCallback(
    async (lessonId: string | null) => {
      if (!lessonId) return;
      if (questionCache[lessonId]) return; // already cached

      const qid = await fetchQuizIdForLesson(lessonId);
      if (!qid) {
        setQuestionCache((prev) => ({ ...prev, [lessonId]: [] }));
        return;
      }
      const questions = await fetchQuestionsForQuiz(qid);
      setQuestionCache((prev) => ({ ...prev, [lessonId]: questions }));
    },
    [fetchQuizIdForLesson, fetchQuestionsForQuiz, questionCache]
  );

  // Fetch and initialize quiz for current lesson
  const initQuizForCurrentLesson = useCallback(
    async (lessonId: string | null) => {
      if (!lessonId) return false;
      setLoading(true);
      try {
        // use cache if available
        let questions = questionCache[lessonId];
        let qid = null;

        if (!questions) {
          qid = await fetchQuizIdForLesson(lessonId);
          questions = qid ? await fetchQuestionsForQuiz(qid) : [];
        } else {
          // if we have cached questions we might still need quiz id
          qid = await fetchQuizIdForLesson(lessonId);
        }

        setDeck(questions);
        setQuizId(qid);
        setCurrentIdx(0);
        setSelectedOption(null);
        setScore({ correct: 0, total: questions.length });
        setQuizCompleted(false);

        // prefetch next lesson questions for instant transitions
        if (nextLesson) prefetchQuestionsForLesson(nextLesson.id);
        // prefetch two more lessons ahead
        if (lessons[index + 2])
          prefetchQuestionsForLesson(lessons[index + 2].id);

        return true;
      } catch (err) {
        console.error("initQuizForCurrentLesson error", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      fetchQuizIdForLesson,
      fetchQuestionsForQuiz,
      prefetchQuestionsForLesson,
      questionCache,
      nextLesson,
      lessons,
      index,
    ]
  );

  // ---------- DB update helpers ----------

  // Upsert user_quiz_attempts when quiz finishes
  const recordQuizAttempt = async (opts: {
    user_id: string;
    quiz_id: string | null;
    lesson_id: string;
    score: number;
    passed: boolean;
  }) => {
    try {
      const { error } = await supabase.from("user_quiz_attempts").insert({
        user_id: opts.user_id,
        quiz_id: opts.quiz_id,
        lesson_id: opts.lesson_id,
        score: opts.score,
        passed: opts.passed,
        attempted_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err) {
      console.error("recordQuizAttempt error", err);
    }
  };

  // Update user_srs_progress per question
  const updateSRSForQuestion = async (
    user_id: string,
    question_id: string,
    isCorrect: boolean
  ) => {
    try {
      // Use your optimized SRS library
      await recordQuizAnswer(
        user_id,
        question_id,
        isCorrect,
        courseId,
        module?.id ? module.id :
        lesson?.unit_id ? undefined : undefined, // module_id not directly available
        unit?.id,
        lesson?.id
      );
    } catch (err) {
      console.error("SRS update failed", err);
      // Fallback to simple update
      await simpleSRSFallback(user_id, question_id, isCorrect);
    }
  };

  // Simple fallback without SM-2 algorithm
  const simpleSRSFallback = async (
    user_id: string,
    question_id: string,
    isCorrect: boolean
  ) => {
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from("user_srs_progress")
      .select("*")
      .eq("user_id", user_id)
      .eq("question_id", question_id)
      .maybeSingle();

    const basePayload = {
      user_id,
      question_id,
      course_id: courseId,
      unit_id: unit?.id,
      lesson_id: lesson?.id,
      updated_at: now,
      last_reviewed: now,
    };

    if (existing) {
      await supabase
        .from("user_srs_progress")
        .update({
          ...basePayload,
          correct_attempts: isCorrect
            ? (existing.correct_attempts || 0) + 1
            : existing.correct_attempts,
          wrong_attempts: !isCorrect
            ? (existing.wrong_attempts || 0) + 1
            : existing.wrong_attempts,
          repetitions: isCorrect ? (existing.repetitions || 0) + 1 : 0,
          ease_factor: isCorrect
            ? Math.max(1.3, (existing.ease_factor || 2.5) - 0.05)
            : (existing.ease_factor || 2.5) + 0.1,
          interval_days: isCorrect
            ? Math.min(365, (existing.interval_days || 1) * 2)
            : 1,
          next_review: isCorrect
            ? new Date(
                Date.now() + (existing.interval_days || 1) * 24 * 60 * 60 * 1000
              ).toISOString()
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("user_srs_progress").insert({
        ...basePayload,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: isCorrect ? 1 : 0,
        correct_attempts: isCorrect ? 1 : 0,
        wrong_attempts: isCorrect ? 0 : 1,
        next_review: isCorrect
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : null,
        created_at: now,
      });
    }
  };

  // Update user_course_progress when a lesson is completed
  const updateCourseProgressOnLessonComplete = async (
    user_id: string,
    course_id: string,
    lesson_id: string,
    module_id?: string,
    unit_id?: string
  ) => {
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from("user_course_progress")
        .select("*")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      const now = new Date().toISOString();
      if (existing) {
        const { data: attempts } = await supabase
          .from("user_quiz_attempts")
          .select("id")
          .eq("user_id", user_id)
          .eq("lesson_id", lesson_id)
          .eq("passed", true)
          .limit(1);

        const alreadyCompleted = attempts && attempts.length > 0;

        const updates: any = {
          current_lesson_id: lesson_id,
          current_unit_id: unit_id || existing.current_unit_id,
          current_module_id: module_id || existing.current_module_id,
          updated_at: now,
          last_accessed: now,
        };

        if (!alreadyCompleted) {
          updates.completed_lessons = (existing.completed_lessons || 0) + 1;
        }

        await supabase
          .from("user_course_progress")
          .update(updates)
          .eq("id", existing.id);
      } else {
        const { error } = await supabase.from("user_course_progress").insert({
          user_id,
          course_id,
          current_module_id: module_id || null,
          current_unit_id: unit_id || null,
          current_lesson_id: lesson_id,
          completed_lessons: 1,
          total_lessons: lessons?.length ?? null,
          last_accessed: now,
          updated_at: now,
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error("updateCourseProgressOnLessonComplete error", err);
    }
  };

  // ---------- Actions ----------

  const startQuiz = async () => {
    if (!lesson) return;
    setMode("quiz");
    const ok = await initQuizForCurrentLesson(lesson.id);
    if (!ok) {
      toast({
        title: "No quiz available for this lesson",
        status: "info",
        duration: 3000,
      });
      setMode("read");
    }
  };

 const handleAnswer = async (option: string) => {
  if (!deck[currentIdx] || selectedOption) return;
  setSelectedOption(option);

  const isCorrect = deck[currentIdx].correct_answer.includes(option);
  if (isCorrect) setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));

  // Record SRS progress
  try {
    await updateSRSForQuestion(userId, deck[currentIdx].id, isCorrect);
  } catch (err) {
    console.error("SRS update error:", err);
  }

  // Record general progress
  try {
    await recordProgress(userId, courseId, undefined, unit?.id, lesson?.id);
  } catch (err) {
    console.error("Progress recording error:", err);
  }

  setTimeout(async () => {
      const next = currentIdx + 1;
      if (next < deck.length) {
        setCurrentIdx(next);
        setSelectedOption(null);
        const answeredCount = currentIdx + 1;
        const pct = Math.round((answeredCount / deck.length) * 100);
        setLessonProgress(pct);
      } else {
        setQuizCompleted(true);
        const finalPct = Math.round(
          ((score.correct + (isCorrect ? 1 : 0)) / deck.length) * 100
        );
        setLessonProgress(finalPct);

        const passed = finalPct >= 70;
        try {
          await recordQuizAttempt({
            user_id: userId,
            quiz_id: quizId,
            lesson_id: lesson.id,
            score: finalPct,
            passed,
          });
        } catch (err) {
          console.error("recordQuizAttempt failed", err);
        }

        if (passed) {
          await updateCourseProgressOnLessonComplete(
            userId,
            courseId,
            lesson.id,
            undefined, // module_id not available in lesson
            unit?.id
          );
        }
      }
    }, 900);
  };

  const retryQuiz = async () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore({ correct: 0, total: deck.length });
    setQuizCompleted(false);
    setLessonProgress(0);
  };

  const goToNextLesson = async () => {
    if (index + 1 < lessons.length) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setMode("read");
      setDeck([]);
      setQuizId(null);

      if (onNavigateLesson && lessons[nextIndex]) {
        onNavigateLesson(lessons[nextIndex]);
      }

      const nextId = lessons[nextIndex]?.id;
      if (nextId) prefetchQuestionsForLesson(nextId);
    } else {
      if (onFinishCourse) onFinishCourse();
    }
  };

  const goToPreviousLesson = () => {
    if (index > 0) {
      const prevIndex = index - 1;
      setIndex(prevIndex);
      setMode("read");
      setDeck([]);
      setQuizId(null);

      if (onNavigateLesson && lessons[prevIndex]) {
        onNavigateLesson(lessons[prevIndex]);
      }
    }
  };

  const goToLesson = (targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < lessons.length) {
      setIndex(targetIndex);
      setMode("read");
      setDeck([]);
      setQuizId(null);

      if (onNavigateLesson && lessons[targetIndex]) {
        onNavigateLesson(lessons[targetIndex]);
      }
    }
  };

  const markLessonAsRead = async () => {
    if (!lesson) return;
    try {
      await supabase.from("user_quiz_attempts").insert({
        user_id: userId,
        quiz_id: null,
        lesson_id: lesson.id,
        score: 100,
        passed: true,
        attempted_at: new Date().toISOString(),
      });
      await updateCourseProgressOnLessonComplete(
        userId,
        courseId,
        lesson.id,
        undefined, // module_id not available
        unit?.id
      );
      toast({
        title: "Lesson marked complete",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("markLessonAsRead error", err);
      toast({
        title: "Failed to mark complete",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Effects
  useEffect(() => {
    if (!lesson) return;
    prefetchQuestionsForLesson(lesson.id);
    if (lessons[index + 1]) prefetchQuestionsForLesson(lessons[index + 1].id);
    if (lessons[index + 2]) prefetchQuestionsForLesson(lessons[index + 2].id);

    setLessonProgress(0);
    setQuizCompleted(false);
    setDeck([]);
    setQuizId(null);
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore({ correct: 0, total: 0 });
  }, [index, lesson, lessons, prefetchQuestionsForLesson]);

  useEffect(() => {
    (async () => {
      if (mode === "quiz" && lesson) {
        if (questionCache[lesson.id]) {
          const q = questionCache[lesson.id];
          setDeck(q);
          const qid = await fetchQuizIdForLesson(lesson.id);
          setQuizId(qid);
          setScore({ correct: 0, total: q.length });
        } else {
          await initQuizForCurrentLesson(lesson.id);
        }
      }
    })();
  }, [
    mode,
    lesson,
    questionCache,
    fetchQuizIdForLesson,
    initQuizForCurrentLesson,
  ]);

  // Render states
  if (!lesson) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Text>No lesson selected</Text>
      </Flex>
    );
  }

  // Reading view
  if (mode === "read") {
    const content = normalizeContent(lesson.content);
    const currentIndex = index + 1;
    const totalLessons = lessons.length;
    const progressPercent = Math.round((currentIndex / totalLessons) * 100);

    return (
      <VStack
        spacing={6}
        p={6}
        bg={bg}
        rounded="lg"
        shadow="md"
        maxW="7xl"
        mx="auto"
        w="100%"
      >
        <Box w="100%">
          <Breadcrumb fontSize="sm" mb={2} separator="/">
            {unit && (
              <BreadcrumbItem>
                <BreadcrumbLink onClick={onBack} cursor="pointer">
                  {unit.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{lesson.title}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="lg">
              {lesson.title}
            </Heading>
            <Text color={subtleText}>
              {currentIndex}/{totalLessons} • {progressPercent}%
            </Text>
          </Flex>
          <Progress
            value={progressPercent}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
            mt={3}
          />
        </Box>

        <Divider />
        {/* Lesson content */}
        <Box w="100%">
          {content.content.length === 0 ? (
            <Alert status="info" borderRadius="md" mb={4}>
              <AlertIcon />
              Content coming soon...
            </Alert>
          ) : (
            <RichTextView content={content} />
          )}
        </Box>
        <Divider />

        <HStack w="100%" justify="space-between" flexWrap="wrap">
          <Button
            variant="ghost"
            onClick={goToPreviousLesson}
            isDisabled={index === 0}
          >
            ← Previous
          </Button>

          <HStack spacing={4}>
            <Button size="md" variant="outline" onClick={markLessonAsRead}>
              Mark Complete
            </Button>
            <Button colorScheme="green" size="md" onClick={startQuiz}>
              Take Quiz
            </Button>
            <Button colorScheme="blue" size="md" onClick={goToNextLesson}>
              {index + 1 < lessons.length ? "Next Lesson →" : "Finish Course"}
            </Button>
          </HStack>
        </HStack>

        {/* Lesson navigation dots */}
        {lessons.length > 1 && (
          <HStack spacing={2} mt={4}>
            {lessons.map((_, i) => (
              <Box
                key={i}
                w="8px"
                h="8px"
                borderRadius="full"
                bg={i === index ? "blue.500" : "gray.300"}
                cursor="pointer"
                onClick={() => goToLesson(i)}
                _hover={{ bg: i === index ? "blue.600" : "gray.400" }}
              />
            ))}
          </HStack>
        )}
      </VStack>
    );
  }

  // Quiz loading state
  if (loading) {
    return (
      <Flex h="60vh" align="center" justify="center" direction="column">
        <Spinner size="xl" color="blue.500" />
        <Text mt={3} color={subtleText}>
          Preparing quiz...
        </Text>
      </Flex>
    );
  }

  // No quiz content
  if (!deck.length) {
    return (
      <Box
        p={6}
        maxW="3xl"
        mx="auto"
        borderWidth={1}
        borderRadius="lg"
        shadow="md"
        textAlign="center"
      >
        <Alert status="info" mb={4}>
          <AlertIcon />
          No quiz content for this lesson.
        </Alert>
        <HStack justify="center">
          <Button variant="outline" onClick={() => setMode("read")}>
            Back to Lesson
          </Button>
          <Button colorScheme="blue" onClick={goToNextLesson}>
            {index + 1 < lessons.length ? "Next Lesson" : "Finish"}
          </Button>
        </HStack>
      </Box>
    );
  }

  // Active quiz question
  const q = deck[currentIdx];
  const answeredCount = Math.min(
    currentIdx + (selectedOption ? 1 : 0),
    deck.length
  );
  const questionProgress = Math.round((answeredCount / deck.length) * 100);

  return (
    <Flex direction="column" align="center" p={4} minH="80vh" w="full">
      <Breadcrumb fontSize="sm" mb={2} separator="/">
        {unit && (
          <BreadcrumbItem>
            <BreadcrumbLink onClick={onBack} cursor="pointer">
              {unit.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => setMode("read")} cursor="pointer">
            {lesson.title}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Quiz</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box
        maxW="3xl"
        w="full"
        p={6}
        borderWidth={1}
        borderRadius="2xl"
        shadow="lg"
        bg={bg}
        borderColor={border}
      >
        <Flex justify="space-between" mb={3} align="center">
          <Text fontSize="lg" fontWeight="bold">
            Lesson Quiz — {lesson.title}
          </Text>
          <Text fontSize="sm" color={subtleText}>
            {currentIdx + 1}/{deck.length}
          </Text>
        </Flex>

        <Progress
          value={questionProgress}
          size="sm"
          colorScheme="blue"
          borderRadius="full"
          mb={4}
        />

        <Flex justify="space-between" mb={2} align="center">
          <Text fontSize="xl" fontWeight="semibold">
            Q{currentIdx + 1}
          </Text>
          {q.source_exam && (
            <Badge colorScheme="blue" fontSize="xs">
              📘 {q.source_exam}
            </Badge>
          )}
        </Flex>

        {/* Question text using RichTextView for JSON content */}
        <Box mb={6}>
          <RichTextView content={q.question_text} />
        </Box>

        <VStack align="stretch" spacing={3}>
          {q.options.map((opt: string) => {
            const isSelected = selectedOption === opt;
            const isCorrect = q.correct_answer.includes(opt);
            const showCorrectness = !!selectedOption && isCorrect;

            return (
              <Button
                key={opt}
                onClick={() => handleAnswer(opt)}
                isDisabled={!!selectedOption}
                variant="outline"
                justifyContent="flex-start"
                size="md"
                fontWeight="normal"
                textAlign="left"
                py={3}
                px={4}
                borderWidth={2}
                borderColor={
                  isSelected
                    ? isCorrect
                      ? "green.400"
                      : "red.400"
                    : showCorrectness
                    ? "green.400"
                    : border
                }
                bg={
                  isSelected
                    ? isCorrect
                      ? "green.50"
                      : "red.50"
                    : showCorrectness
                    ? "green.50"
                    : "transparent"
                }
                _hover={{
                  bg: !selectedOption
                    ? useColorModeValue("gray.50", "gray.800")
                    : undefined,
                }}
                transition="all 0.15s"
                _disabled={{ opacity: 1, cursor: "not-allowed" }}
                aria-label={`Answer option ${opt}`}
              >
                <Text flex="1">{opt}</Text>
                {showCorrectness && !isSelected && (
                  <Text color="green.500" ml={3}>
                    ✓
                  </Text>
                )}
              </Button>
            );
          })}
        </VStack>

        {/* Explanation using RichTextView for JSON content */}
        {selectedOption && (
          <Box
            mt={4}
            p={4}
            borderRadius="lg"
            bg={useColorModeValue("gray.50", "gray.800")}
          >
            <Text
              fontWeight="medium"
              color={
                q.correct_answer.includes(selectedOption)
                  ? "green.600"
                  : "red.600"
              }
              mb={2}
            >
              {q.correct_answer.includes(selectedOption)
                ? "Correct ✅"
                : "Incorrect ❌"}
            </Text>
            {q.explanation && <RichTextView content={q.explanation} />}
          </Box>
        )}

        <Box mt={6}>
          {quizCompleted ? (
            <VStack spacing={4}>
              <Text fontSize="2xl" fontWeight="bold">
                {Math.round((score.correct / score.total) * 100)}%
              </Text>
              <Text color={subtleText}>
                You scored {score.correct} out of {score.total} questions
                correctly.
              </Text>
              <HStack spacing={3} justify="center" wrap="wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMode("read")}
                >
                  Review Lesson
                </Button>
                <Button size="sm" colorScheme="orange" onClick={retryQuiz}>
                  Retry Quiz
                </Button>
                <Button size="sm" colorScheme="blue" onClick={goToNextLesson}>
                  {index + 1 < lessons.length ? "Next Lesson" : "Finish Course"}
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Flex justify="space-between" align="center">
              <Button size="sm" variant="ghost" onClick={() => setMode("read")}>
                ← Back to Lesson
              </Button>
              <Text fontSize="sm" color={subtleText}>
                {questionProgress}% answered
              </Text>
            </Flex>
          )}
        </Box>
      </Box>
    </Flex>
  );
}
