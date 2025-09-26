// components/learning/LessonQuiz.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { recordReview } from "@/lib/srs";
import {
  Box,
  Text,
  VStack,
  Button,
  Flex,
  useColorModeValue,
  Badge,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import router from "next/router";
import Layout from "../Layout";

interface LessonQuizProps {
  lessonId: string;
  userId: string;
  onCompleteQuiz: (nextLesson?: any) => void;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string[];
  explanation?: string;
  source_exam?: string; // optional field
}

export default function LessonQuiz({
  lessonId,
  userId,
  onCompleteQuiz,
}: LessonQuizProps) {
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue("white", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");
  const correctColor = useColorModeValue("green.600", "green.300");
  const wrongColor = useColorModeValue("red.600", "red.300");
  const subtleText = useColorModeValue("gray.600", "gray.400");

  // Fetch quiz + normalize fields
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);

      const { data: quiz } = await supabase
        .from("quizzes")
        .select("id")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (!quiz?.id) {
        setDeck([]);
        setLoading(false);
        return;
      }

      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .order("created_at", { ascending: true });

      const normalized = (questions || []).map((q: any) => ({
        id: q.id,
        question_text:
          typeof q.question_text === "string"
            ? q.question_text
            : q.question_text?.text || "",
        options: Array.isArray(q.options)
          ? q.options
          : JSON.parse(q.options || "[]"),
        correct_answer: Array.isArray(q.correct_answer)
          ? q.correct_answer
          : JSON.parse(q.correct_answer || "[]"),
        explanation:
          typeof q.explanation === "string"
            ? q.explanation
            : q.explanation?.text || "",
        source_exam: q.source_exam || null,
      }));

      setDeck(normalized);
      setCurrentIdx(0);
      setLoading(false);
    };

    fetchQuiz();
  }, [lessonId]);

  if (loading)
    return (
      <Flex h="80vh" align="center" justify="center">
        <Spinner size="xl" thickness="5px" color="blue.500" />
      </Flex>
    );
  if (!deck.length)
    return (
      <Box
        borderWidth="1px"
        borderRadius="xl"
        shadow="md"
        p={8}
        textAlign="center"
      >
        <VStack spacing={6}>
          <Text fontSize="xl" fontWeight="semibold" color="gray.700">
            🚫 No quiz available for this lesson.
          </Text>
          <HStack spacing={4}>
            <Button
              colorScheme="blue"
              onClick={() => router.push(`/lesson/${lessonId}`)}
            >
              Back to Lesson Content
            </Button>
            <Button
              variant="outline"
              colorScheme="gray"
              onClick={() => router.push("/lessons")}
            >
              Back to Lessons Page
            </Button>
          </HStack>
        </VStack>
      </Box>
    );

  const currentQuestion = deck[currentIdx];

  const handleAnswer = async (option: string) => {
    setSelectedOption(option);
    const isCorrect = currentQuestion.correct_answer.includes(option);

    // Save to SRS DB
    await recordReview(userId, currentQuestion.id, isCorrect ? 4 : 0);

    setTimeout(() => {
      // Progression logic
      setDeck((prev) => {
        const copy = [...prev];
        const q = copy.splice(currentIdx, 1)[0];
        if (!isCorrect) copy.push(q); // wrong → send to end
        return copy;
      });

      setSelectedOption(null);

      if (currentIdx >= deck.length - 1) {
        onCompleteQuiz(); // finished
      } else {
        setCurrentIdx((idx) => Math.min(idx, deck.length - 2));
      }
    }, 1000);
  };

  return (
    <Layout>
      <Box
        p={6}
        borderWidth={1}
        rounded="2xl"
        shadow="md"
        maxW="2xl"
        mx="auto"
        bg={bg}
        borderColor={border}
      >
        {/* Header with question number + source exam top-right */}
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="xl" fontWeight="semibold">
            Question {currentIdx + 1} / {deck.length}
          </Text>

          {currentQuestion.source_exam && (
            <Badge
              colorScheme="blue"
              fontSize="xs"
              px={2}
              py={1}
              rounded="lg"
              whiteSpace="nowrap"
            >
              📘 {currentQuestion.source_exam}
            </Badge>
          )}
        </Flex>

        {/* Question text */}
        <Text mb={4} fontSize="lg" fontWeight="medium">
          {currentQuestion.question_text}
        </Text>

        {/* Options */}
        <VStack align="stretch" spacing={3}>
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt;
            const isCorrect = currentQuestion.correct_answer.includes(opt);

            return (
              <Button
                key={opt}
                onClick={() => handleAnswer(opt)}
                isDisabled={!!selectedOption}
                variant="outline"
                justifyContent="flex-start"
                size="lg"
                fontWeight="normal"
                borderWidth={2}
                borderColor={
                  isSelected ? (isCorrect ? "green.400" : "red.400") : border
                }
                bg={
                  isSelected
                    ? isCorrect
                      ? "green.100"
                      : "red.100"
                    : "transparent"
                }
                _hover={{ bg: useColorModeValue("gray.100", "gray.800") }}
              >
                {opt}
              </Button>
            );
          })}
        </VStack>

        {/* Feedback */}
        {selectedOption && (
          <Text
            mt={5}
            fontWeight="medium"
            color={
              currentQuestion.correct_answer.includes(selectedOption)
                ? correctColor
                : wrongColor
            }
          >
            {currentQuestion.correct_answer.includes(selectedOption)
              ? "Correct! ✅ "
              : "Incorrect ❌ "}
            {currentQuestion.explanation}
          </Text>
        )}

        {/* Subtle footer if no exam metadata */}
        {!currentQuestion.source_exam && (
          <Text mt={4} fontSize="sm" color={subtleText} fontStyle="italic">
            Practice question (not from a past exam).
          </Text>
        )}
      </Box>

      <VStack spacing={6} mt={8}>
        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={() => router.push(`/lesson/${lessonId}`)}
          >
            Back
          </Button>
          <Button
            variant="outline"
            colorScheme="gray"
            onClick={() => router.push("/lessons")}
          >
            TopicList
          </Button>
        </HStack>
      </VStack>
    </Layout>
  );
}
