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
  Progress,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { JSONContent } from "@tiptap/react";
import { RichTextView } from "../RichTextView";

interface LessonQuizProps {
  lessonId: string;
  userId: string;
  lessonTitle: string;
  unitTitle: string;
  onCompleteQuiz: (results: QuizResults) => void;
  onBackToLesson: () => void;
  onBackToUnit: () => void;
}

interface QuizQuestion {
  id: string;
  question_text: JSONContent;
  options: string[];
  correct_answer: string[];
  explanation?: JSONContent;
  source_exam?: string;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
}

export default function LessonQuiz({
  lessonId,
  userId,
  lessonTitle,
  unitTitle,
  onCompleteQuiz,
  onBackToLesson,
  onBackToUnit,
}: LessonQuizProps) {
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState({ correct: 0, total: 0 });
  const [quizCompleted, setQuizCompleted] = useState(false);

  const bg = useColorModeValue("white", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");
  const correctColor = useColorModeValue("green.600", "green.300");
  const wrongColor = useColorModeValue("red.600", "red.300");
  const subtleText = useColorModeValue("gray.600", "gray.400");

  // Fetch quiz questions
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: quiz, error: quizError } = await supabase
          .from("quizzes")
          .select("id")
          .eq("lesson_id", lessonId)
          .maybeSingle();

        if (quizError) throw quizError;

        if (!quiz?.id) {
          setDeck([]);
          return;
        }

        const { data: questions, error: questionsError } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quiz.id)
          .order("created_at", { ascending: true });

        if (questionsError) throw questionsError;

        const normalized = (questions || []).map((q: any) => ({
          id: q.id,
          question_text: normalizeContent(q.question_text),
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]"),
          correct_answer: Array.isArray(q.correct_answer) 
            ? q.correct_answer 
            : JSON.parse(q.correct_answer || "[]"),
          explanation: normalizeContent(q.explanation),
          source_exam: q.source_exam || null,
        }));

        setDeck(normalized);
        setResults(prev => ({ ...prev, total: normalized.length }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [lessonId]);

  const normalizeContent = (content: string | JSONContent): JSONContent => {
    if (typeof content === "string") {
      return {
        type: "doc",
        content: [{ type: "paragraph", text: content }],
      };
    }
    return content || { type: "doc", content: [] };
  };

  const handleAnswer = async (option: string) => {
    if (selectedOption || quizCompleted) return;

    const isCorrect = currentQuestion.correct_answer.includes(option);
    setSelectedOption(option);

    // Update results
    if (isCorrect) {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    }

    // Save to SRS
    await recordReview(userId, currentQuestion.id, isCorrect ? 4 : 0);

    setTimeout(() => {
      const nextIndex = currentIdx + 1;
      
      if (nextIndex >= deck.length) {
        // Quiz completed
        const quizResults: QuizResults = {
          totalQuestions: deck.length,
          correctAnswers: results.correct + (isCorrect ? 1 : 0),
          score: Math.round(((results.correct + (isCorrect ? 1 : 0)) / deck.length) * 100),
          passed: (results.correct + (isCorrect ? 1 : 0)) / deck.length >= 0.7, // 70% to pass
        };
        setQuizCompleted(true);
        onCompleteQuiz(quizResults);
      } else {
        // Move to next question
        setCurrentIdx(nextIndex);
        setSelectedOption(null);
      }
    }, 1500);
  };

  const progress = deck.length > 0 ? ((currentIdx + 1) / deck.length) * 100 : 0;

  if (loading) {
    return (
      <Flex h="80vh" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" thickness="5px" color="blue.500" />
        <Text color="gray.600">Loading quiz questions...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex h="80vh" align="center" justify="center">
        <Alert status="error" borderRadius="lg" maxW="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      </Flex>
    );
  }

  if (!deck.length) {
    return (
      <Box borderWidth="1px" borderRadius="xl" shadow="md" p={8} maxW="2xl" mx="auto">
        <VStack spacing={6}>
          <Text fontSize="xl" fontWeight="semibold" color="gray.700" textAlign="center">
            📚 No Quiz Available
          </Text>
          <Text color="gray.600" textAlign="center">
            This lesson doesn't have a quiz yet. You can proceed to the next lesson or review the content.
          </Text>
          <HStack spacing={4}>
            <Button colorScheme="blue" onClick={onBackToLesson}>
              Back to Lesson
            </Button>
            <Button variant="outline" onClick={onBackToUnit}>
              Back to Unit
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  const currentQuestion = deck[currentIdx];

  return (
    <Flex direction="column" align="center" p={6} minH="80vh" maxW="4xl" mx="auto" w="100%">
      {/* Header with navigation */}
      <VStack w="100%" spacing={4} mb={6}>
        <HStack w="100%" justify="space-between">
          <Button variant="ghost" onClick={onBackToLesson} size="sm">
            ← Back to Lesson
          </Button>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {unitTitle} • {lessonTitle}
          </Text>
        </HStack>
        
        <VStack w="100%" spacing={2}>
          <HStack w="100%" justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Lesson Quiz
            </Text>
            <Text fontSize="sm" color="gray.600">
              Question {currentIdx + 1} of {deck.length}
            </Text>
          </HStack>
          <Progress value={progress} w="100%" size="sm" colorScheme="blue" borderRadius="full" />
        </VStack>
      </VStack>

      {/* Quiz Content */}
      <Box
        p={6}
        borderWidth={1}
        rounded="2xl"
        shadow="md"
        w="100%"
        bg={bg}
        borderColor={border}
      >
        {/* Question header */}
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="lg" fontWeight="medium" color="gray.700">
            Question {currentIdx + 1}
          </Text>

          {currentQuestion.source_exam && (
            <Badge colorScheme="blue" fontSize="xs" px={2} py={1} rounded="lg">
              📘 {currentQuestion.source_exam}
            </Badge>
          )}
        </Flex>

        {/* Question text */}
        <Box mb={6}>
          <RichTextView content={currentQuestion.question_text} />
        </Box>

        {/* Options */}
        <VStack align="stretch" spacing={3} mb={6}>
          {currentQuestion.options.map((opt, index) => {
            const isSelected = selectedOption === opt;
            const isCorrect = currentQuestion.correct_answer.includes(opt);
            const letter = String.fromCharCode(65 + index); // A, B, C, D

            return (
              <Button
                key={opt}
                onClick={() => handleAnswer(opt)}
                isDisabled={!!selectedOption || quizCompleted}
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
                      ? "green.50"
                      : "red.50"
                    : "transparent"
                }
                _hover={{ bg: useColorModeValue("gray.50", "gray.800") }}
                leftIcon={<Text fontWeight="bold">{letter}.</Text>}
              >
                {opt}
              </Button>
            );
          })}
        </VStack>

        {/* Feedback */}
        {selectedOption && (
          <Box 
            mt={6} 
            p={4} 
            borderRadius="lg" 
            bg={currentQuestion.correct_answer.includes(selectedOption) ? "green.50" : "red.50"}
            borderColor={currentQuestion.correct_answer.includes(selectedOption) ? "green.200" : "red.200"}
            borderWidth={1}
          >
            <Text
              fontWeight="semibold"
              color={
                currentQuestion.correct_answer.includes(selectedOption)
                  ? correctColor
                  : wrongColor
              }
              mb={2}
            >
              {currentQuestion.correct_answer.includes(selectedOption)
                ? "✓ Correct! "
                : "✗ Incorrect "}
            </Text>
            <RichTextView content={currentQuestion.explanation} />
          </Box>
        )}

        {/* Navigation for completed quiz */}
        {quizCompleted && (
          <VStack mt={6} spacing={4}>
            <Text fontSize="lg" fontWeight="semibold" color="green.600">
              Quiz Completed! 🎉
            </Text>
            <Text>
              Score: {results.correct}/{deck.length} ({Math.round((results.correct / deck.length) * 100)}%)
            </Text>
            <Button colorScheme="blue" w="100%" onClick={() => onCompleteQuiz({
              totalQuestions: deck.length,
              correctAnswers: results.correct,
              score: Math.round((results.correct / deck.length) * 100),
              passed: results.correct / deck.length >= 0.7,
            })}>
              Continue Learning
            </Button>
          </VStack>
        )}
      </Box>
    </Flex>
  );
}