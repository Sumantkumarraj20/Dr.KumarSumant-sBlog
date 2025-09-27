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
import { JSONContent } from "@tiptap/react";
import { RichTextView } from "../RichTextView";

interface LessonQuizProps {
  lessonId: string;
  userId: string;
  onCompleteQuiz: (nextLesson?: any) => void;
}

interface QuizQuestion {
  id: string;
  question_text: JSONContent;
  options: string[];
  correct_answer: string[];
  explanation?: JSONContent;
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
            ? {
                type: "doc",
                content: [{ type: "paragraph", text: q.question_text }],
              }
            : q.question_text, // ✅ already JSONContent
        options: Array.isArray(q.options)
          ? q.options
          : JSON.parse(q.options || "[]"),
        correct_answer: Array.isArray(q.correct_answer)
          ? q.correct_answer
          : JSON.parse(q.correct_answer || "[]"),
        explanation:
          typeof q.explanation === "string"
            ? {
                type: "doc",
                content: [{ type: "paragraph", text: q.explanation }],
              }
            : q.explanation,
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
        onCompleteQuiz();
      } else {
        setCurrentIdx((idx) => Math.min(idx, deck.length - 2));
      }
    }, 1000);
  };

  return (
    <Flex direction="column" align="center" p={6} minH="80vh">
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
        <Box mb={4}>
          <RichTextView content={currentQuestion.question_text} />
        </Box>

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
          <Box mt={5}>
            <Text
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
            </Text>
            <RichTextView content={currentQuestion.explanation} />
          </Box>
        )}

        {/* Subtle footer if no exam metadata */}
        {!currentQuestion.source_exam && (
          <Text mt={4} fontSize="sm" color={subtleText} fontStyle="italic">
            Practice question (not from a past exam).
          </Text>
        )}
      </Box>
    </Flex>
  );
}
