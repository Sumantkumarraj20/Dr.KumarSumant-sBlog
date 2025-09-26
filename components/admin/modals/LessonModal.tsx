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
  Input,
  useToast,
  Box,
  Divider,
} from "@chakra-ui/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";

import { createLesson, updateLesson, Lesson, Quiz } from "@/lib/adminApi";
import QuizModal from "./QuizModal";

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  lesson?: Lesson | null;
  refresh: () => void;
}

export default function LessonModal({
  isOpen,
  onClose,
  unitId,
  lesson,
  refresh,
}: LessonModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Quiz state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link,
    ],
    content: lesson?.content || {},
  });

  // Prefill data on open
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      editor?.commands.setContent(lesson.content || {});
      setQuizzes(lesson.quizzes || []);
    } else {
      setTitle("");
      editor?.commands.setContent({});
      setQuizzes([]);
    }
  }, [lesson, editor, isOpen]);

  // Upload image to Cloudinary
  const addImage = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      editor?.commands.setImage({ src: data.secure_url });
    },
    [editor]
  );

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Cast editor JSON safely
      const content = editor?.getJSON() ?? {};
      if (lesson) {
        await updateLesson(lesson.id, { title, content });
        toast({ title: "Lesson updated", status: "success" });
      } else {
        await createLesson({ unit_id: unitId, title, content });
        toast({ title: "Lesson created", status: "success" });
      }
      refresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Try again",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent rounded="lg" shadow="lg">
          <ModalHeader>{lesson ? "Edit Lesson" : "Add Lesson"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Content</FormLabel>
              <EditorContent editor={editor} />
              <Box mt={2}>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) addImage(file);
                  }}
                />
              </Box>
            </FormControl>

            <Divider my={4} />

            <Box>
              <Button
                size="sm"
                colorScheme="purple"
                onClick={() => {
                  setSelectedQuiz(quizzes[0] || null);
                  setQuizModalOpen(true);
                }}
              >
                Add/Edit Quizzes
              </Button>

              {quizzes.map((q) => (
                <Box key={q.id} p={2} borderWidth={1} borderRadius="md" mt={2}>
                  Quiz ID: {q.id} | Passing Score: {q.passing_score} |
                  Questions: {q.questions?.length || 0}
                </Box>
              ))}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSubmit}
              isLoading={loading}
            >
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Quiz modal */}
      {selectedQuiz && (
        <QuizModal
          isOpen={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          lessonId={lesson?.id || unitId}
          quiz={selectedQuiz}
          refresh={(updatedQuiz: Quiz) => {
            setQuizzes((prev) => {
              const index = prev.findIndex((q) => q.id === updatedQuiz.id);
              if (index >= 0) prev[index] = updatedQuiz;
              else prev.push(updatedQuiz);
              return [...prev];
            });
          }}
        />
      )}
    </>
  );
}
