import { useState, useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, FormControl, FormLabel, Input, Textarea, useToast
} from "@chakra-ui/react";
import { createQuizQuestion, updateQuizQuestion } from "@/lib/adminApi";
import { QuizQuestion, Quiz } from "@/lib/adminApi";

interface QuizQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: QuizQuestion | null;
  quizId: string;
  refresh: () => void;
}

export default function QuizQuestionModal({ isOpen, onClose, question, quizId, refresh }: QuizQuestionModalProps) {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<string[]>([]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
      setOptions(question.options || ["", "", "", ""]);
      setCorrectAnswer(question.correct_answer || []);
      setExplanation(question.explanation?.text || "");
    } else {
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer([]);
      setExplanation("");
    }
  }, [question, isOpen]);

  const handleSubmit = async () => {
    if (!questionText.trim()) return toast({ title: "Question text is required", status: "warning" });
    if (options.some(o => !o.trim())) return toast({ title: "All options are required", status: "warning" });
    if (correctAnswer.length === 0) return toast({ title: "At least one correct answer required", status: "warning" });

    setLoading(true);
    try {
      const payload = {
        quiz_id: quizId,
        question_text: questionText,
        options,
        correct_answer: correctAnswer,
        explanation: { text: explanation },
      };
      if (question) await updateQuizQuestion(question.id, payload);
      else await createQuizQuestion(payload);

      toast({ title: question ? "Question updated" : "Question created", status: "success" });
      refresh();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Try again", status: "error" });
    } finally { setLoading(false); }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerToggle = (option: string) => {
    if (correctAnswer.includes(option)) setCorrectAnswer(correctAnswer.filter(o => o !== option));
    else setCorrectAnswer([...correctAnswer, option]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{question ? "Edit Question" : "Add Question"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Question Text</FormLabel>
            <Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Enter question" rows={3} />
          </FormControl>

          {options.map((opt, i) => (
            <FormControl mb={2} key={i}>
              <FormLabel>Option {i + 1}</FormLabel>
              <Input
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              <Button size="xs" mt={1} onClick={() => handleCorrectAnswerToggle(opt)} colorScheme={correctAnswer.includes(opt) ? "green" : "gray"}>
                {correctAnswer.includes(opt) ? "Correct ✅" : "Mark Correct"}
              </Button>
            </FormControl>
          ))}

          <FormControl mt={3}>
            <FormLabel>Explanation</FormLabel>
            <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Enter explanation" rows={3} />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={loading}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
