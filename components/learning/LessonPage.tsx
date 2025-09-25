import {fetchLessons} from '@/lib/learn'
import { useEffect, useState } from "react";
import {
  SimpleGrid,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
} from "@chakra-ui/react";
import {
  ArrowTopRightOnSquareIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import Layout from "../Layout";

interface Props {
  unit: any;
  lesson?: any;
  onBack: () => void;
  onSelectLesson: (unit: any) => void;
}

const LessonPage = ({ unit, onBack, onSelectLesson }: Props) => {
  const [lessons, setLessons] = useState<any[]>([]);
    useEffect(() => {
      fetchLessons(unit.id).then(setLessons);
    }, [unit.id]);


  return (
    <Layout>
          <Flex direction="column" w="100%" h="100%" p={8} bg="gray.50" _dark={{ bg: "gray.900" }}>
            <HStack className="p-3" spacing={3}>
              <Button onClick={onBack}>
                <ChevronDoubleLeftIcon className="h-6 w-6" />
              </Button>
              <Text fontSize="4xl" fontWeight="bold">
                {unit.title}
              </Text>
            </HStack>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {lessons.map((lesson: any) => (
                <Box
                  key={lesson.id}
                  bg="white"
                  _dark={{ bg: "gray.700" }}
                  rounded="2xl"
                  p={6}
                  shadow="sm"
                  transition="all 0.3s"
                  _hover={{
                    shadow: "xl",
                    transform: "translateY(-5px)",
                    bg: "blue.50",
                  }}
                  cursor="pointer"
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
                      alignSelf="stretch"
                      onClick={() => onSelectLesson(lesson)}
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-8 mr-1" />
                      <Text className="ml-1" fontSize="md">
                        Start Lesson
                      </Text>
                    </Button>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Flex>
        </Layout>
  );
};

export default LessonPage;
