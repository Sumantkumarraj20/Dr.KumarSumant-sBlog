import {
  SimpleGrid,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface Props {
  courses: any[];
  progressMap: Record<string, number>; // { courseId: percent }
  onSelectCourse: (course: any) => void;
}

const CoursePage = ({ courses, progressMap, onSelectCourse }: Props) => {
  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Flex direction="column" w="100%" h="100%" p={8} bg="gray.50" _dark={{ bg: "gray.900" }}>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {courses.map((course) => (
          <Box
            key={course.id}
            bg={cardBg}
            rounded="2xl"
            p={6}
            shadow="sm"
            transition="all 0.3s"
            _hover={{ shadow: "xl", transform: "translateY(-5px)", bg: "blue.50" }}
            cursor="pointer"
          >
            <VStack align="start" spacing={4}>
              <HStack justify="space-between" w="100%">
                <Text fontSize="xl" fontWeight="bold">
                  {course.title}
                </Text>
                <Box w="60px" h="60px">
                  <CircularProgressbar
                    value={progressMap[course.id] || 0}
                    text={`${progressMap[course.id] || 0}%`}
                    styles={buildStyles({
                      textSize: "40%",
                      pathColor: "#3182ce",
                      textColor: "#3182ce",
                      trailColor: "#e2e8f0",
                    })}
                  />
                </Box>
              </HStack>

              {course.description && (
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                  {course.description}
                </Text>
              )}
              <Button
                colorScheme="blue"
                alignSelf="stretch"
                p={3}
                onClick={() => onSelectCourse(course)}
              >
                <ComputerDesktopIcon className="h-5 w-8 mr-1" />
                <Text className="ml-1" fontSize="md">
                  Open
                </Text>
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
};

export default CoursePage;
