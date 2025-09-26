// components/learning/LearningSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { VStack, Box, Button, Text, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, useDisclosure } from "@chakra-ui/react";
import SRSReview from "./SRSReview";
import { fetchDueCards } from "@/lib/srs";

interface LearningSidebarProps {
  userId: string;
}

export default function LearningSidebar({ userId }: LearningSidebarProps) {
  const [dueCount, setDueCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadDue = async () => {
    const { data } = await fetchDueCards(userId, 100);
    setDueCount(data.length);
  };

  useEffect(() => {
    loadDue();
  }, [userId]);

  return (
    <>
      <VStack spacing={3} p={4} borderWidth="1px" borderRadius="md" position="fixed" top="20%" right={4} zIndex={50}>
        <Box textAlign="center">
          <Text fontWeight="bold">Your SRS Deck</Text>
          <Text>Due Questions: {dueCount}</Text>
        </Box>
        <Button colorScheme="blue" onClick={loadDue} size="sm">
          Refresh Stats
        </Button>
        <Button colorScheme="green" onClick={onOpen} size="sm">
          Review Due Questions
        </Button>
      </VStack>

      {/* Drawer for Review */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">SRS Review</DrawerHeader>
          <DrawerBody>
            <SRSReview userId={userId} pageSize={30} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
