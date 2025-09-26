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
        setDeck(data);
        setIdx(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const current = deck[idx];

  const applyQuality = async (quality: 0 | 3 | 4 | 5 | number) => {
    if (!current) return;
    setLoading(true);
    try {
      // update DB
      await recordReview(userId, current.question_id, quality);
      toast({
        title: "Saved",
        description:
          quality >= 3 ? "Good — scheduled for next review." : "Marked again — will repeat soon.",
        status: quality >= 3 ? "success" : "warning",
        duration: 2000,
      });

      // Remove card from local deck
      setDeck((d) => d.filter((c) => c.id !== current.id));

      // Reset answer view
      setShowAnswer(false);
      // keep idx at current value (since we've removed current), but ensure bounds
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

  const q = current.quiz_questions as QuizQuestion | undefined;

  return (
    <VStack align="stretch" spacing={6} p={4}>
      <Box>
        <Text fontSize="sm" color="gray.500">
          Due {idx + 1} / {deck.length}
        </Text>
      </Box>

      <Box p={6} borderWidth="1px" borderRadius="md" bg="white">
        <Text fontWeight="bold" fontSize="lg" mb={3}>
          {q?.question_text || "Question text missing"}
        </Text>

        {/* hidden answer, reveal on click */}
        <Collapse in={showAnswer}>
          <Box mt={4} borderTop="1px dashed" pt={3}>
            <Text fontWeight="semibold">Answer / Explanation</Text>

            {/* Options (if present) */}
            {Array.isArray(q?.options) && (
              <VStack align="start" spacing={2} mt={2}>
                {(q!.options || []).map((opt: any, i: number) => (
                  <Text key={i} pl={2}>
                    • {typeof opt === "string" ? opt : JSON.stringify(opt)}
                  </Text>
                ))}
              </VStack>
            )}

            {/* explanation (may be JSON text) */}
            {q?.explanation && (
              <Box mt={3}>
                <Text fontSize="sm" color="gray.700">
                  {typeof q.explanation === "string"
                    ? q.explanation
                    : (q.explanation as any).text || JSON.stringify(q.explanation)}
                </Text>
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

      {/* Review action buttons */}
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
          Next review: {current.next_review ? new Date(current.next_review).toLocaleString() : "—"}
        </Text>
      </HStack>
    </VStack>
  );
}
