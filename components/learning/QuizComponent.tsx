// components/learning/QuizComponent.tsx
import { useEffect, useState } from "react";
import { VStack, Box, Text, RadioGroup, Radio, Button, useToast } from "@chakra-ui/react";
import { supabase } from "../../lib/supabaseClient";

interface QuizComponentProps {
  lesson: any;
  language: string;
  userId?: string; // pass logged-in user ID here
}

const QuizComponent: React.FC<QuizComponentProps> = ({ lesson, userId }) => {
  // ✅ State for quiz questions
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  // ✅ Fetch quiz questions when lesson changes
  useEffect(() => {
    async function fetchQuizQuestions() {
      if (!lesson) return;
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("lesson_id", lesson.id);

      if (error) console.error("Error fetching quiz:", error);
      else if (data) setQuestions(data);
    }
    fetchQuizQuestions();
  }, [lesson]);

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "User not logged in",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const correct = questions.every(
      (q) => answers[q.id] && q.correct_answer.includes(answers[q.id])
    );

    // Update user_progress table for SRS
    for (const q of questions) {
      const { error } = await supabase.from("user_progress").upsert({
        user_id: userId,
        lesson_id: lesson.id,
        quiz_question_id: q.id,
        last_answer_correct: correct,
        next_review: correct
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : new Date(), // basic SRS interval
      });
      if (error) console.error("Error updating SRS:", error);
    }

    setSubmitted(true);

    toast({
      title: correct ? "Correct!" : "Some answers are incorrect",
      status: correct ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack align="stretch" spacing={6} p={4} borderWidth={1} borderRadius="md">
      <Text fontSize="lg" fontWeight="bold">
        Quiz
      </Text>
      {questions.length === 0 && <Text>No quiz questions available.</Text>}
      {questions.map((q) => (
        <Box key={q.id}>
          <Text fontWeight="medium">{q.question_text}</Text>
          <RadioGroup
            mt={2}
            value={answers[q.id] || ""}
            onChange={(val) => setAnswers({ ...answers, [q.id]: val })}
          >
            <VStack align="start">
              {q.options?.map((opt: string) => (
                <Radio key={opt} value={opt}>
                  {opt}
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
          {submitted && (
            <Text mt={1} fontSize="sm" color="gray.600">
              Explanation: {q.explanation}
            </Text>
          )}
        </Box>
      ))}
      <Button colorScheme="blue" onClick={handleSubmit}>
        Submit Quiz
      </Button>
    </VStack>
  );
};

export default QuizComponent;
