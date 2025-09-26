// components/learning/ModulePage.tsx
import { fetchModules } from "@/lib/learn";
import { useEffect, useState } from "react";
import { SimpleGrid, Box, Text, VStack, Button, Flex, HStack } from "@chakra-ui/react";
import { Square3Stack3DIcon, ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";

interface Props {
  course: any;
  onBack: () => void;
  onSelectModule: (module: any) => void;
}

export default function ModulePage({ course, onBack, onSelectModule }: Props) {
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    fetchModules(course.id).then(setModules);
  }, [course.id]);

  return (
    <Flex direction="column" w="100%" h="100%" p={8}>
      <HStack spacing={3} mb={6}>
        <Button onClick={onBack}>
          <ChevronDoubleLeftIcon className="h-6 w-6" />
        </Button>
        <Text fontSize="4xl" fontWeight="bold">{course.title}</Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {modules.map((mod) => (
          <Box
            key={mod.id}
            bg="white"
            rounded="2xl"
            p={6}
            shadow="sm"
            cursor="pointer"
            _hover={{ shadow: "xl", transform: "translateY(-5px)", bg: "blue.50" }}
          >
            <VStack align="start" spacing={4}>
              <Text fontSize="xl" fontWeight="bold">{mod.title}</Text>
              {mod.description && <Text fontSize="sm" color="gray.600">{mod.description}</Text>}
              <Button colorScheme="blue" onClick={() => onSelectModule(mod)} w="full">
                <Square3Stack3DIcon className="h-5 w-6 mr-1" />
                Open
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
