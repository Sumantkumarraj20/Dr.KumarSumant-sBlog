"use client";

import { fetchUnits, fetchUnitProgress } from "@/lib/learn";
import { useEffect, useState } from "react";
import {
  SimpleGrid,
  Box,
  Text,
  VStack,
  Button,
  Flex,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface Props {
  module: any;
  userId: string;
  onBack: () => void;
  onSelectUnit: (unit: any) => void;
}

export default function UnitPage({ module, userId, onBack, onSelectUnit }: Props) {
  const [units, setUnits] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!module?.id) return;

    fetchUnits(module.id).then(async (fetchedUnits) => {
      const normalizedUnits = fetchedUnits.map((u: any) => ({
        ...u,
        id: u.id || u._id || u.unit_id,
      }));

      setUnits(normalizedUnits);

      // fetch progress for each unit
      const progressObj: Record<string, number> = {};
      for (const u of normalizedUnits) {
        const p = await fetchUnitProgress(userId, u.id);
        progressObj[u.id] = p || 0;
      }
      setProgressMap(progressObj);
    });
  }, [module.id, userId]);

  const cardBg = useColorModeValue("white", "gray.700");
;

  return (
    <Flex direction="column" w="100%" h="100%" p={8}>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {units.map((unit) => (
          <Box
            key={unit.id}
            bg={cardBg}
            rounded="2xl"
            p={6}
            shadow="sm"
            cursor="pointer"
            _hover={{ shadow: "xl", transform: "translateY(-5px)", bg: "blue.50" }}
          >
            <VStack align="start" spacing={4}>
              <HStack justify="space-between" w="100%">
                <Text fontSize="xl" fontWeight="bold">
                  {unit.title || "Untitled Unit"}
                </Text>
                <Box w="60px" h="60px">
                  <CircularProgressbar
                    value={progressMap[unit.id] || 0}
                    text={`${progressMap[unit.id] || 0}%`}
                    styles={buildStyles({
                      textSize: "40%",
                      pathColor: "#3182ce",
                      textColor: "#3182ce",
                      trailColor: "#e2e8f0",
                    })}
                  />
                </Box>
              </HStack>
              {unit.description && (
                <Text fontSize="sm" color="gray.600">
                  {unit.description}
                </Text>
              )}
              <Button colorScheme="blue" w="full" onClick={() => onSelectUnit(unit)}>
                Open
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
