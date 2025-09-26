// components/learning/LessonPage.tsx
import { fetchLessons } from "@/lib/learn";
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
import {
  ArrowTopRightOnSquareIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";

interface Props {
  unit: any;
  onBack: () => void;
  onSelectLesson: (lesson: any) => void;
}

export default function LessonPage({ unit, onBack, onSelectLesson }: Props) {
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    fetchLessons(unit.id).then(setLessons);
  }, [unit.id]);

  return (
    <Flex direction="column" w="100%" h="100%" p={8}>
      <HStack spacing={3} mb={6}>
        <Button onClick={onBack}>
          <ChevronDoubleLeftIcon className="h-6 w-6" />
        </Button>
        <Text fontSize="4xl" fontWeight="bold">
          {unit.title}
        </Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {lessons.map((lesson) => (
          <Box
            key={lesson.id}
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
                {lesson.title}
              </Text>
              {lesson.description && (
                <Text fontSize="sm" color="gray.600">
                  {lesson.description}
                </Text>
              )}
              <Button
                colorScheme="blue"
                onClick={() => onSelectLesson(lesson)}
                w="full"
              >
                Start Lesson
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
