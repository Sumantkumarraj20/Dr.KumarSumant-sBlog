// components/learning/LessonContent.tsx
"use client";

import React, { useMemo, useState } from "react";
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
} from "@chakra-ui/react";
import { JSONContent } from "@tiptap/react";
import LessonQuiz from "./LessonQuiz";
import { RichTextView } from "../RichTextView";
import { LessonContentProps } from "@/types/learn";

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
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: String(parsed) }],
          },
        ],
      };
    } catch {
      return {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: raw }] },
        ],
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
  const subtleText = useColorModeValue("gray.600", "gray.400");

  const content = useMemo(
    () => normalizeLessonContent(lesson?.content),
    [lesson]
  );

  const currentIndex = lessonsInUnit.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? lessonsInUnit[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessonsInUnit.length - 1 ? lessonsInUnit[currentIndex + 1] : null;
  const progress = ((currentIndex + 1) / lessonsInUnit.length) * 100;

  const handleQuizComplete = () => {
    if (nextLesson) {
      onNavigateLesson(nextLesson);
    } else {
      onGoToNext(lesson);
    }
  };

  const handleBackToLesson = () => {
    setShowQuiz(false);
  };

  if (showQuiz) {
    return (
      <LessonQuiz
        lessonId={lesson.id} // Use lesson.id instead of lessonId prop
        userId={userId}
        lessonTitle={lesson.title}
        onCompleteQuiz={handleQuizComplete}
        onBackToLesson={handleBackToLesson}
        hasNextLesson={!!nextLesson}
        unit={unit}
        lesson={lesson}
      />
    );
  }

  if (
    !lesson ||
    !content ||
    !Array.isArray(content.content) ||
    content.content.length === 0
  ) {
    return (
      <Box p={6} textAlign="center">
        <Alert status="info" borderRadius="md" mb={4}>
          <AlertIcon />
          Content coming soon...
        </Alert>
        <Button onClick={onBackToUnit}>
          Back to Unit
        </Button>
      </Box>
    );
  }

  return (
    <VStack
      spacing={6}
      p={6}
      bg={bgCard}
      rounded="lg"
      shadow="md"
      maxW="7xl"
      mx="auto"
      w="100%"
    >
      {/* Progress indicator */}
      <Box w="100%">
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="sm" color={subtleText}>
            Lesson {currentIndex + 1} of {lessonsInUnit.length}
          </Text>
          <Text fontSize="sm" color={subtleText}>
            {Math.round(progress)}% Complete
          </Text>
        </Flex>
        <Progress value={progress} colorScheme="blue" size="sm" borderRadius="full" />
      </Box>

      <Heading size="xl" color="blue.600" textAlign="center">
        {lesson.title}
      </Heading>

      <Text fontSize="lg" color={subtleText} textAlign="center">
        {unit.title}
      </Text>

      <Divider />

      {/* Lesson content */}
      <Box w="100%">
        <RichTextView content={content} />
      </Box>

      <Divider />

      {/* Enhanced navigation */}
      <VStack spacing={4} w="100%">
        <HStack justify="space-between" w="100%" flexWrap="wrap" spacing={4}>
          <Button onClick={onBackToUnit} variant="outline" size="lg">
            ← Back to Unit
          </Button>

          {prevLesson && (
            <Button 
              onClick={() => onNavigateLesson(prevLesson)} 
              variant="ghost"
              size="lg"
            >
              ← Previous Lesson
            </Button>
          )}
        </HStack>

        <HStack justify="center" w="100%" spacing={4}>
          <Button 
            colorScheme="green" 
            onClick={() => setShowQuiz(true)}
            size="lg"
            px={8}
          >
            Take Quiz
          </Button>
        </HStack>

        <HStack justify="space-between" w="100%" flexWrap="wrap" spacing={4}>
          {nextLesson ? (
            <Button 
              onClick={() => onNavigateLesson(nextLesson)} 
              variant="solid"
              size="lg"
              colorScheme="blue"
            >
              Skip to Next Lesson →
            </Button>
          ) : (
            <Button 
              onClick={() => onGoToNext(lesson)} 
              variant="solid"
              size="lg"
              colorScheme="blue"
            >
              Complete Unit →
            </Button>
          )}
        </HStack>
      </VStack>
    </VStack>
  );
}