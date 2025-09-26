// components/learning/UnitPage.tsx
import { fetchUnits } from "@/lib/learn";
import { useEffect, useState } from "react";
import { SimpleGrid, Box, Text, VStack, Button, Flex, HStack } from "@chakra-ui/react";
import { Squares2X2Icon, ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import {useRouter} from "next/router";

interface Props {
  module: any;
  onBack: () => void;
  onSelectUnit: (unit: any) => void;
}

export default function UnitPage({ module, onBack, onSelectUnit }: Props) {
  const [units, setUnits] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchUnits(module.id).then(setUnits);
  }, [module.id]);
  const courseId = module.course_id;
  const handleOpenUnit = (unit: any) => {
  // Navigate to full path with unit ID
  router.push(`/learn/${courseId}/${module.id}/${unit.id}`);
};

  return (
    <Flex direction="column" w="100%" h="100%" p={8}>
      <HStack spacing={3} mb={6}>
        <Button onClick={onBack}>
          <ChevronDoubleLeftIcon className="h-6 w-6" />
        </Button>
        <Text fontSize="4xl" fontWeight="bold">{module.title}</Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {units.map((unit) => (
          <Box
            key={unit.id}
            bg="white"
            rounded="2xl"
            p={6}
            shadow="sm"
            cursor="pointer"
            _hover={{ shadow: "xl", transform: "translateY(-5px)", bg: "blue.50" }}
          >
            <VStack align="start" spacing={4}>
              <Text fontSize="xl" fontWeight="bold">{unit.title}</Text>
              {unit.description && <Text fontSize="sm" color="gray.600">{unit.description}</Text>}
              <Button colorScheme="blue" onClick={() => onSelectUnit(unit)} w="full">
                <Squares2X2Icon className="h-5 w-6 mr-1" />
                Open
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
