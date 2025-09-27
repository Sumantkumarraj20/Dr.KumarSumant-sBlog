// components/learning/SRSReview.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  VStack,
  Box,
  Text,
  Button,
  HStack,
  useToast,
  Spinner,
  Collapse,
} from "@chakra-ui/react";
import { fetchDueCards, recordReview, SRSRow } from "@/lib/srs";
import type { QuizQuestion } from "@/lib/adminApi";
import { JSONContent } from "@tiptap/react";
import { RichTextView } from "@/components/RichTextView";

interface SRSReviewProps {
  userId: string;
  language?: string;
  pageSize?: number;
}

export default function SRSReview({
  userId,
  language = "en",
  pageSize = 30,
}: SRSReviewProps) {
  const toast = useToast();
  const [deck, setDeck] = useState<SRSRow[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const emptyDoc: JSONContent = {
    type: "doc",
    content: [{ type: "paragraph", content: [] }],
  };

  const loadDeck = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await fetchDueCards(userId, pageSize);
      if (error) {
        console.error("fetchDueCards error", error);
        toast({ title: "Error loading deck", status: "error" });
        setDeck([]);
      } else {
        // Normalize question_text & explanation as JSONContent
        const normalized = (data || []).map((row) => ({
          ...row,
          quiz_questions: row.quiz_questions
            ? {
                ...row.quiz_questions,
                question_text:
                  typeof row.quiz_questions.question_text === "string"
                    ? { type: "doc", content: [{ type: "paragraph", text: row.quiz_questions.question_text }] }
                    : row.quiz_questions.question_text || emptyDoc,
                explanation:
                  typeof row.quiz_questions.explanation === "string"
                    ? { type: "doc", content: [{ type: "paragraph", text: row.quiz_questions.explanation }] }
                    : row.quiz_questions.explanation || emptyDoc,
              }
            : undefined,
        }));
        setDeck(normalized);
        setIdx(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeck();
  }, [userId]);

  const current = deck[idx];
  const q = current?.quiz_questions as QuizQuestion | undefined;

  const applyQuality = async (quality: 0 | 3 | 4 | 5 | number) => {
    if (!current) return;
    setLoading(true);
    try {
      await recordReview(userId, current.question_id, quality);

      toast({
        title: "Saved",
        description:
          quality >= 3
            ? "Good — scheduled for next review."
            : "Marked again — will repeat soon.",
        status: quality >= 3 ? "success" : "warning",
        duration: 2000,
      });

      setDeck((d) => d.filter((c) => c.id !== current.id));
      setShowAnswer(false);
      setIdx((i) => Math.min(i, Math.max(0, deck.length - 2)));
    } catch (err) {
      console.error("recordReview error", err);
      toast({ title: "Error saving", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  if (!deck.length)
    return (
      <VStack spacing={4} p={4}>
        <Text fontWeight="bold">Nothing due for review 🎉</Text>
        <Text color="gray.600">Come back when cards become due.</Text>
        <Button onClick={loadDeck}>Refresh</Button>
      </VStack>
    );

  return (
    <VStack align="stretch" spacing={6} p={4}>
      <Box>
        <Text fontSize="sm" color="gray.500">
          Due {idx + 1} / {deck.length}
        </Text>
      </Box>

      <Box p={6} borderWidth="1px" borderRadius="md" bg="white">
        {/* Question rendered as RichText */}
        <RichTextView content={q?.question_text || emptyDoc} />

        {/* Hidden answer */}
        <Collapse in={showAnswer}>
          <Box mt={4} borderTop="1px dashed" pt={3}>
            <Text fontWeight="semibold">Answer / Explanation</Text>

            {/* Options */}
            {Array.isArray(q?.options) && (
              <VStack align="start" spacing={2} mt={2}>
                {q!.options.map((opt: any, i: number) => (
                  <Text key={i} pl={2}>
                    • {typeof opt === "string" ? opt : JSON.stringify(opt)}
                  </Text>
                ))}
              </VStack>
            )}

            {/* Explanation rendered as RichText */}
            {q?.explanation && (
              <Box mt={3}>
                <RichTextView content={q.explanation || emptyDoc} />
              </Box>
            )}
          </Box>
        </Collapse>

        {!showAnswer && (
          <Button mt={4} variant="ghost" onClick={() => setShowAnswer(true)}>
            Reveal answer
          </Button>
        )}
      </Box>

      {/* Review buttons */}
      <HStack spacing={3}>
        <Button colorScheme="red" onClick={() => applyQuality(0)}>
          Again
        </Button>
        <Button colorScheme="orange" onClick={() => applyQuality(3)}>
          Hard
        </Button>
        <Button colorScheme="green" onClick={() => applyQuality(4)}>
          Good
        </Button>
        <Button colorScheme="teal" onClick={() => applyQuality(5)}>
          Easy
        </Button>
      </HStack>

      <HStack justify="space-between">
        <Button size="sm" variant="ghost" onClick={loadDeck}>
          Refresh deck
        </Button>
        <Text fontSize="sm" color="gray.500">
          Next review:{" "}
          {current?.next_review
            ? new Date(current.next_review).toLocaleString()
            : "—"}
        </Text>
      </HStack>
    </VStack>
  );
}
