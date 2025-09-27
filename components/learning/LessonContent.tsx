// components/learning/LessonContent.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Divider,
  Button,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { JSONContent } from "@tiptap/react";
import LessonQuiz from "./LessonQuiz";
import { RichTextView } from "../RichTextView";

export interface Lesson {
  id: string;
  title: string;
  content: JSONContent | string | null;
}

export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface LessonContentProps {
  unit: Unit;
  lesson: Lesson;
  lessonsInUnit: Lesson[];
  onBackToUnit: () => void;
  onNavigateLesson: (lesson: Lesson) => void;
  onGoToNext: (completedLesson?: Lesson) => void;
  userId: string;
}

/**
 * Normalize incoming lesson content into valid JSONContent.
 */
function normalizeLessonContent(raw: any): JSONContent {
  if (!raw) return { type: "doc", content: [] };

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.type === "doc") {
        return parsed as JSONContent;
      }
      return {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: String(parsed) }] }],
      };
    } catch {
      return {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: raw }] }],
      };
    }
  }

  if (typeof raw === "object" && raw.type === "doc") {
    return raw as JSONContent;
  }

  return { type: "doc", content: [] };
}

export default function LessonContent({
  unit,
  lesson,
  lessonsInUnit,
  onBackToUnit,
  onNavigateLesson,
  onGoToNext,
  userId,
}: LessonContentProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const bgCard = useColorModeValue("white", "gray.700");

  const content = useMemo(() => normalizeLessonContent(lesson?.content), [lesson]);

  if (showQuiz) {
    return (
      <LessonQuiz
        lessonId={lesson.id}
        userId={userId}
        onCompleteQuiz={() => {
          const currentIdx = lessonsInUnit.findIndex((l) => l.id === lesson.id);
          const nextLesson = lessonsInUnit[currentIdx + 1];
          if (nextLesson) onNavigateLesson(nextLesson);
          else onGoToNext(lesson);
        }}
      />
    );
  }

  if (!lesson || !content || !Array.isArray(content.content) || content.content.length === 0) {
    return <Text p={6}>Content coming soon…</Text>;
  }

  const currentIndex = lessonsInUnit.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? lessonsInUnit[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessonsInUnit.length - 1 ? lessonsInUnit[currentIndex + 1] : null;

  return (
    <VStack spacing={6} p={6} bg={bgCard} rounded="lg" shadow="md" maxW="7xl" mx="auto" w="100%">
      <Heading size="2xl" color="blue.600">
        {lesson.title}
      </Heading>

      <Divider />

      {/* Universal RichText renderer */}
      <Box w="100%">
        <RichTextView content={content} />
      </Box>

      <Divider />

      <HStack justify="space-between" flexWrap="wrap" spacing={4} w="100%">
        <Button onClick={onBackToUnit} variant="outline">
          Back to Unit
        </Button>

        {prevLesson && (
          <Button onClick={() => onNavigateLesson(prevLesson)} variant="ghost">
            ← {prevLesson.title}
          </Button>
        )}

        <Button colorScheme="green" onClick={() => setShowQuiz(true)}>
          Go to Quiz
        </Button>

        {nextLesson && (
          <Button onClick={() => onNavigateLesson(nextLesson)} variant="solid">
            {nextLesson.title} →
          </Button>
        )}
      </HStack>
    </VStack>
  );
}
