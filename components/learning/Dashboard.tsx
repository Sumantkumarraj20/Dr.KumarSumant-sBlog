// components/learning/Dashboard.tsx
import { VStack, Text, Button, Box } from "@chakra-ui/react";

interface Props {
  onSelectLesson: (lesson: any) => void;
}

const Dashboard = ({ onSelectLesson }: Props) => {
  // Example: list of courses or modules
  const courses = [
    { id: "c1", title: "Cardiology Basics" },
    { id: "c2", title: "Nephrology Essentials" },
  ];

  return (
    <VStack align="start" spacing={4} w="100%">
      <Text fontSize="2xl" fontWeight="bold">Learning Dashboard</Text>
      {courses.map((course) => (
        <Box key={course.id} p={4} borderWidth="1px" rounded="md" w="100%">
          <Text fontWeight="bold">{course.title}</Text>
          <Button mt={2} onClick={() => onSelectLesson({ id: course.id, title: course.title })}>
            Open Course
          </Button>
        </Box>
      ))}
    </VStack>
  );
};

export default Dashboard;
