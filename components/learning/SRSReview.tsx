// components/learning/SRSReview.tsx
import { useState, useEffect } from "react";
import { VStack, Box, Text, Button, useToast } from "@chakra-ui/react";
import { supabase } from "../../lib/supabaseClient";

// Placeholder SRS logic
interface SRSReviewProps {
  userId: string;
  language: string;
}

const SRSReview: React.FC<SRSReviewProps> = ({ userId }) => {
  const [deck, setDeck] = useState<any[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const toast = useToast();

  useEffect(() => {
    async function fetchSRSDeck() {
      if (!userId) return;
      const { data, error } = await supabase
        .from("user_progress")
        .select(
          `
        lesson_id,
        lesson:lessons(title),
        quiz_questions:quiz_questions(*),
        interval,
        next_review
      `
        )
        .eq("user_id", userId)
        .order("next_review", { ascending: true });

      if (error) console.error("Error fetching SRS deck:", error);
      else if (data) setDeck(data);
    }

    fetchSRSDeck();
  }, [userId]);

  const handleCorrect = () => {
    toast({ title: "Marked Correct", status: "success", duration: 2000 });
    setCurrent((prev) => (prev + 1 < deck.length ? prev + 1 : 0));
    // TODO: Update SRS deck in DB with interval
  };

  const handleIncorrect = () => {
    toast({ title: "Marked Incorrect", status: "error", duration: 2000 });
    setCurrent((prev) => (prev + 1 < deck.length ? prev + 1 : 0));
    // TODO: Reset interval in DB
  };

  if (!deck.length) return <Text>Nothing to review yet!</Text>;

  const card = deck[current];

  return (
    <VStack align="stretch" spacing={6} p={4} borderWidth={1} borderRadius="md">
      <Box>
        <Text fontWeight="bold" fontSize="lg">
          {card.question_text}
        </Text>
      </Box>
      <VStack spacing={3}>
        <Button colorScheme="green" onClick={handleCorrect} w="full">
          Correct
        </Button>
        <Button colorScheme="red" onClick={handleIncorrect} w="full">
          Incorrect
        </Button>
      </VStack>
      <Text fontSize="sm" color="gray.500">
        Card {current + 1} of {deck.length}
      </Text>
    </VStack>
  );
};

export default SRSReview;
