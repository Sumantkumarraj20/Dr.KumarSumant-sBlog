"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, VStack, Text, HStack, Badge } from "@chakra-ui/react";

type MCQProps = {
  question: string;
  choices: string[];
  answer: number; // index of correct choice
  id?: string;
};

export default function MCQ({ question, choices, answer, id }: MCQProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // enable interactive behavior only on client (hydration)
  }, []);

  const onChoose = (i: number) => {
    if (selected !== null) return; // prevent changing answer
    setSelected(i);
    setShowResult(true);
  };

  return (
    <Box borderWidth={1} borderRadius="md" p={4} my={6} bg="white" _dark={{ bg: "gray.700" }} shadow="sm">
      <HStack justify="space-between" mb={3}>
        <Text fontWeight="semibold">{question}</Text>
        {id ? <Badge colorScheme="purple">Q: {id}</Badge> : null}
      </HStack>

      <VStack align="stretch" spacing={3}>
        {choices.map((c, i) => {
          const isCorrect = showResult && i === answer;
          const isWrong = showResult && selected === i && i !== answer;
          return (
            <Button
              key={i}
              onClick={() => onChoose(i)}
              variant={selected === null ? "outline" : isCorrect ? "solid" : isWrong ? "ghost" : "outline"}
              colorScheme={isCorrect ? "green" : isWrong ? "red" : "blue"}
              justifyContent="flex-start"
              aria-pressed={selected === i}
            >
              <Text textAlign="left">{c}</Text>
            </Button>
          );
        })}
      </VStack>

      {showResult && (
        <Box mt={4}>
          {selected === answer ? (
            <Text color="green.600" fontWeight="semibold">Correct — well done!</Text>
          ) : (
            <Text color="red.500" fontWeight="semibold">Incorrect — the correct answer is: {choices[answer]}</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
