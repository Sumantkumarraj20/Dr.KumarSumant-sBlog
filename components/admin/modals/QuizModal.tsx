"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  Textarea,
  NumberInputField,
  Input,
  Box,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { createQuiz, updateQuiz, Quiz, QuizQuestion, createQuizQuestion, updateQuizQuestion } from "@/lib/adminApi";
import { v4 as uuidv4 } from "uuid";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz?: Quiz | null;
  lessonId: string;
  refreshQuizzes: (updatedQuiz: Quiz) => void;
}

export default function QuizModal({ isOpen, onClose, quiz, lessonId, refreshQuizzes }: QuizModalProps) {
  const toast = useToast();
  const [passingScore, setPassingScore] = useState(70);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);
  const [newCorrect, setNewCorrect] = useState<number[]>([]); // indices of correct options
  const [newExplanation, setNewExplanation] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (quiz) {
      setPassingScore(quiz.passing_score || 70);
      setQuestions(quiz.questions || []);
    } else {
      setPassingScore(70);
      setQuestions([]);
    }
  }, [quiz, isOpen]);

  // Upload image to Cloudinary and return URL
  const uploadImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url as string;
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, status: "error" });
      return null;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim() || newCorrect.length === 0) {
      toast({ title: "Incomplete", description: "Question text and correct answer required", status: "warning" });
      return;
    }

    const question: Partial<QuizQuestion> = {
      lesson_id: lessonId,
      quiz_id: quiz?.id!,
      question_text: newQuestionText,
      options: newOptions,
      correct_answer: newCorrect.map(i => newOptions[i]),
      explanation: { text: newExplanation },
    };

    try {
      let created: QuizQuestion;
      if (quiz) {
        created = (await createQuizQuestion(question)).data!;
        setQuestions((prev) => [...prev, created]);
      } else {
        toast({ title: "Create quiz first", status: "warning" });
      }
      setNewQuestionText("");
      setNewOptions(["", "", "", ""]);
      setNewCorrect([]);
      setNewExplanation("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Try again", status: "error" });
    }
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    try {
      let updatedQuiz: Quiz;
      if (quiz) {
        updatedQuiz = (await updateQuiz(quiz.id, { lesson_id: lessonId, passing_score: passingScore })).data!;
      } else {
        updatedQuiz = (await createQuiz({ lesson_id: lessonId, passing_score: passingScore })).data!;
      }
      refreshQuizzes(updatedQuiz);
      toast({ title: quiz ? "Quiz updated" : "Quiz created", status: "success" });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Try again", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{quiz ? "Edit Quiz" : "Add Quiz"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Passing Score</FormLabel>
            <NumberInput value={passingScore} min={0} max={100} onChange={(v) => setPassingScore(Number(v))}>
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <Divider my={4} />

          <Box>
            <FormControl mb={2}>
              <FormLabel>Question Text</FormLabel>
              <Textarea value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} placeholder="Enter question text" />
            </FormControl>

            {newOptions.map((opt, idx) => (
              <FormControl key={idx} mb={2}>
                <FormLabel>Option {idx + 1}</FormLabel>
                <Input
                  value={opt}
                  onChange={(e) => {
                    const copy = [...newOptions];
                    copy[idx] = e.target.value;
                    setNewOptions(copy);
                  }}
                  placeholder="Option text"
                />
                <Button size="xs" mt={1} onClick={() => setNewCorrect((prev) => [...prev, idx])} disabled={newCorrect.includes(idx)}>
                  Mark Correct
                </Button>
              </FormControl>
            ))}

            <FormControl mb={2}>
              <FormLabel>Explanation</FormLabel>
              <Textarea value={newExplanation} onChange={(e) => setNewExplanation(e.target.value)} placeholder="Explanation" />
            </FormControl>

            <FormControl mb={2}>
              <FormLabel>Upload Image (Optional)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadImage(file);
                  if (url) setNewExplanation((prev) => prev + `\n![image](${url})`);
                }}
              />
            </FormControl>

            <Button mt={2} colorScheme="purple" size="sm" onClick={handleAddQuestion} isLoading={uploading}>
              Add Question
            </Button>
          </Box>

          <Divider my={4} />

          <Box>
            <strong>Questions Preview:</strong>
            {questions.map((q, idx) => (
              <Box key={q.id} p={2} borderWidth={1} borderRadius="md" mt={2}>
                <strong>Q{idx + 1}:</strong> {q.question_text} | Correct: {q.correct_answer.join(", ")}
              </Box>
            ))}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmitQuiz} isLoading={loading}>
            Save Quiz
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
