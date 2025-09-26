// components/learning/DeckDashboard.tsx
import { VStack, Box, Button, Text } from "@chakra-ui/react";
import { fetchDueCards } from "@/lib/srs";
import React from "react";

export default function DeckDashboard({ userId }: { userId: string }) {
  const [dueCount, setDueCount] = React.useState(0);

  const loadDue = async () => {
    const { data } = await fetchDueCards(userId, 100);
    setDueCount(data.length);
  };

  React.useEffect(() => {
    loadDue();
  }, [userId]);

  return (
    <VStack spacing={4}>
      <Box p={4} borderWidth="1px" borderRadius="md">
        <Text fontWeight="bold">Your SRS Deck</Text>
        <Text>Due Questions: {dueCount}</Text>
      </Box>

      <Button colorScheme="blue" onClick={loadDue}>
        Refresh Stats
      </Button>
      <Button colorScheme="green" onClick={() => console.log("Launch review")}>
        Review Due Questions
      </Button>
      <Button colorScheme="purple" onClick={() => console.log("Launch Analytics")}>
        Analytics
      </Button>
    </VStack>
  );
}
