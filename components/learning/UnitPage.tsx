// components/learning/UnitPage.tsx
"use client";

import { fetchUnits } from "@/lib/learn";
import { useEffect, useState } from "react";
import {
  SimpleGrid,
  Box,
  Text,
  VStack,
  Button,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";

interface Props {
  module: any;
  onBack: () => void;
  onSelectUnit: (unit: any) => void;
}

export default function UnitPage({ module, onBack, onSelectUnit }: Props) {
  const [units, setUnits] = useState<any[]>([]);

  // Fetch units and normalize IDs
  useEffect(() => {
    if (!module?.id) return;

    fetchUnits(module.id).then((fetchedUnits) => {
      console.log("[DEBUG] Raw fetched units:", fetchedUnits);

      // Normalize ID field
      const normalizedUnits = fetchedUnits.map((u: any) => ({
        ...u,
        id: u.id || u._id || u.unit_id, // ensure we have a proper `id`
      }));

      console.log("[DEBUG] Normalized units:", normalizedUnits);

      setUnits(normalizedUnits);
    });
  }, [module.id]);

  // Debug current module
  console.log("[DEBUG] Current module:", module);

  return (
    <Flex direction="column" w="100%" h="100%" p={8}>
      <HStack spacing={3} mb={6}>
        <Button onClick={onBack}>
          <ChevronDoubleLeftIcon className="h-6 w-6" />
        </Button>
        <Text fontSize="4xl" fontWeight="bold">
          {module.title}
        </Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {units.map((unit) => {
          if (!unit.id) {
            console.warn("[WARN] Skipping unit with missing ID:", unit);
            return null;
          }

          return (
            <Box
              key={unit.id}
              bg="white"
              rounded="2xl"
              p={6}
              shadow="sm"
              cursor="pointer"
              _hover={{
                shadow: "xl",
                transform: "translateY(-5px)",
                bg: "blue.50",
              }}
            >
              <VStack align="start" spacing={4}>
                <Text fontSize="xl" fontWeight="bold">
                  {unit.title || "Untitled Unit"}
                </Text>
                {unit.description && (
                  <Text fontSize="sm" color="gray.600">
                    {unit.description}
                  </Text>
                )}
                <Button
                  colorScheme="blue"
                  w="full"
                  onClick={() => {
                    console.log("[DEBUG] Unit selected:", unit);
                    onSelectUnit(unit);
                  }}
                >
                  Open
                </Button>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Flex>
  );
}
