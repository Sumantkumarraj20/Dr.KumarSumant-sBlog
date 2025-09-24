// components/learning/CourseList.tsx
import { VStack, Box, Text } from "@chakra-ui/react";

interface CourseListProps {
  courses: any[];
  selectedCourse: any | null;
  onSelect: (course: any) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, selectedCourse, onSelect }) => {
  return (
    <VStack align="stretch" spacing={3} w="300px">
      {courses.map((course) => (
        <Box
          key={course.id}
          p={4}
          borderWidth={1}
          borderRadius="md"
          cursor="pointer"
          bg={selectedCourse?.id === course.id ? "blue.50" : "white"}
          _hover={{ bg: "blue.100" }}
          onClick={() => onSelect(course)}
        >
          <Text fontWeight="bold">{course.title}</Text>
        </Box>
      ))}
    </VStack>
  );
};

export default CourseList;
