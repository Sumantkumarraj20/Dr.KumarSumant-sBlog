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
  Alert,
  AlertIcon,
  Progress,
} from "@chakra-ui/react";
import { JSONContent } from "@tiptap/react";
import { RichTextView } from "../RichTextView";
import { LessonQuizProps } from "@/types/learn";

interface QuizQuestion {
  id: string;
  question_text: JSONContent;
  options: string[];
  correct_answer: string[];
  explanation?: JSONContent;
  source_exam?: string;
}

export default function LessonQuiz({
  lessonId,
  userId,
  lessonTitle,
  onCompleteQuiz,
  onBackToLesson,
  hasNextLesson,
  unit,
  lesson,
}: LessonQuizProps) {
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  
  const bg = useColorModeValue("white", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");
  const correctColor = useColorModeValue("green.600", "green.300");
  const wrongColor = useColorModeValue("red.600", "red.300");
  const subtleText = useColorModeValue("gray.600", "gray.400");

  // Enhanced quiz fetching with error handling
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
          question_text:
            typeof q.question_text === "string"
              ? {
                  type: "doc",
                  content: [{ type: "paragraph", text: q.question_text }],
                }
              : q.question_text,
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
        setScore(prev => ({ ...prev, total: normalized.length }));
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [lessonId]);

  const handleAnswer = async (option: string) => {
    if (selectedOption || !deck[currentIdx]) return;

    setSelectedOption(option);
    const isCorrect = deck[currentIdx].correct_answer.includes(option);
    
    // Update score
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }

    // Save to SRS DB
    try {
      await recordReview(userId, deck[currentIdx].id, isCorrect ? 4 : 0);
    } catch (err) {
      console.error("Error recording review:", err);
    }

    // Move to next question or complete quiz
    setTimeout(() => {
      const nextIndex = currentIdx + 1;
      
      if (nextIndex < deck.length) {
        setCurrentIdx(nextIndex);
        setSelectedOption(null);
      } else {
        setQuizCompleted(true);
      }
    }, 1500);
  };

  const handleQuizCompletion = () => {
    onCompleteQuiz();
  };

  const handleRetryQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setQuizCompleted(false);
    setScore({ correct: 0, total: deck.length });
  };

  // Loading state
  if (loading) {
    return (
      <Flex h="80vh" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" thickness="5px" color="blue.500" />
        <Text color={subtleText}>Loading quiz...</Text>
      </Flex>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="xl"
        shadow="md"
        p={8}
        textAlign="center"
        maxW="2xl"
        mx="auto"
      >
        <VStack spacing={6}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
          <HStack spacing={4}>
            <Button onClick={onBackToLesson} colorScheme="blue">
              Back to Lesson
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  // No quiz available
  if (!deck.length) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="xl"
        shadow="md"
        p={8}
        textAlign="center"
        maxW="2xl"
        mx="auto"
      >
        <VStack spacing={6}>
          <Text fontSize="xl" fontWeight="semibold" color="gray.700">
            🚫 No quiz available for this lesson.
          </Text>
          <HStack spacing={4}>
            <Button onClick={onBackToLesson} colorScheme="blue">
              Back to Lesson Content
            </Button>
            <Button onClick={handleQuizCompletion} variant="outline">
              Continue Anyway
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  // Quiz completion screen
  if (quizCompleted) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const isPassing = percentage >= 70;

    return (
      <Box
        p={8}
        borderWidth={1}
        rounded="2xl"
        shadow="lg"
        maxW="2xl"
        mx="auto"
        bg={bg}
        borderColor={border}
        textAlign="center"
      >
        <VStack spacing={6}>
          <Box>
            <Text fontSize="4xl" mb={2}>
              {isPassing ? "🎉" : "📚"}
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {isPassing ? "Quiz Completed!" : "Keep Practicing"}
            </Text>
            <Text color={subtleText}>
              Lesson: {lessonTitle}
            </Text>
            {unit && (
              <Text fontSize="sm" color={subtleText}>
                Unit: {unit.title}
              </Text>
            )}
          </Box>

          <Box w="100%">
            <Progress 
              value={percentage} 
              colorScheme={isPassing ? "green" : "orange"} 
              size="lg" 
              borderRadius="full"
              mb={2}
            />
            <Text fontSize="xl" fontWeight="semibold">
              {score.correct} / {score.total} Correct ({percentage}%)
            </Text>
          </Box>

          <Alert status={isPassing ? "success" : "info"} borderRadius="md">
            <AlertIcon />
            {isPassing 
              ? "Great job! You're ready to move forward." 
              : "Review the material and try again for better results."}
          </Alert>

          <HStack spacing={4} flexWrap="wrap" justify="center">
            <Button onClick={onBackToLesson} variant="outline">
              Review Lesson
            </Button>
            
            {!isPassing && (
              <Button onClick={handleRetryQuiz} colorScheme="orange">
                Retry Quiz
              </Button>
            )}
            
            <Button 
              onClick={handleQuizCompletion} 
              colorScheme={isPassing ? "green" : "blue"}
            >
              {hasNextLesson ? "Next Lesson" : "Continue"}
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  const currentQuestion = deck[currentIdx];
  const progress = ((currentIdx) / deck.length) * 100;

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
        w="100%"
      >
        {/* Header with progress */}
        <VStack spacing={4} align="stretch" mb={6}>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Lesson Quiz: {lessonTitle}
            </Text>
            <Text fontSize="sm" color={subtleText}>
              {currentIdx + 1} / {deck.length}
            </Text>
          </Flex>
          
          <Progress 
            value={progress} 
            colorScheme="blue" 
            size="sm" 
            borderRadius="full" 
          />
        </VStack>

        {/* Question metadata */}
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="xl" fontWeight="semibold">
            Question {currentIdx + 1}
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
        <Box mb={6}>
          <RichTextView content={currentQuestion.question_text} />
        </Box>

        {/* Options */}
        <VStack align="stretch" spacing={3} mb={4}>
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt;
            const isCorrect = currentQuestion.correct_answer.includes(opt);
            const showCorrectness = selectedOption && isCorrect;

            return (
              <Button
                key={opt}
                onClick={() => handleAnswer(opt)}
                isDisabled={!!selectedOption}
                variant="outline"
                justifyContent="flex-start"
                size="lg"
                fontWeight="normal"
                textAlign="left"
                whiteSpace="normal"
                height="auto"
                py={3}
                px={4}
                borderWidth={2}
                borderColor={
                  isSelected 
                    ? (isCorrect ? "green.400" : "red.400") 
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
                  bg: !selectedOption ? useColorModeValue("gray.50", "gray.800") : undefined 
                }}
                transition="all 0.2s"
                _disabled={{
                  opacity: 1,
                  cursor: 'not-allowed'
                }}
              >
                <Text as="span" textAlign="left">
                  {opt}
                  {showCorrectness && !isSelected && (
                    <Text as="span" ml={2} color="green.500">
                      ✓
                    </Text>
                  )}
                </Text>
              </Button>
            );
          })}
        </VStack>

        {/* Feedback */}
        {selectedOption && (
          <Box 
            mt={5} 
            p={4} 
            borderRadius="lg" 
            bg={useColorModeValue("gray.50", "gray.800")}
          >
            <Text
              fontWeight="medium"
              color={
                currentQuestion.correct_answer.includes(selectedOption)
                  ? correctColor
                  : wrongColor
              }
              mb={2}
            >
              {currentQuestion.correct_answer.includes(selectedOption)
                ? "Correct! ✅"
                : "Incorrect ❌"}
            </Text>
            {currentQuestion.explanation && (
              <RichTextView content={currentQuestion.explanation} />
            )}
          </Box>
        )}

        {/* Navigation */}
        <Flex justify="space-between" mt={6} pt={4} borderTopWidth={1} borderColor={border}>
          <Button onClick={onBackToLesson} variant="ghost" size="sm">
            ← Back to Lesson
          </Button>
          
          {selectedOption && currentIdx < deck.length - 1 && (
            <Text color={subtleText} fontSize="sm">
              Next question in a moment...
            </Text>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}