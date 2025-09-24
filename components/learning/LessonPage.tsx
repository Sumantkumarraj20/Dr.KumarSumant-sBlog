// components/learning/LessonPage.tsx
import { VStack, Text, Button } from "@chakra-ui/react";
import LessonQuiz from "./LessonQuiz";

interface Props {
  lesson: any;
  onBack: () => void;
}

const LessonPage = ({ lesson, onBack }: Props) => {
  return (
    <VStack align="start" spacing={4} w="100%" h="100%">
      <Button onClick={onBack}>Back to Dashboard</Button>
      <Text fontSize="2xl" fontWeight="bold">{lesson.title}</Text>
      {/* Display lesson content */}
      <Text>Lesson content goes here...</Text>
      {/* Quiz for lesson */}
      <LessonQuiz lessonId={lesson.id} userId={"currentUser"} />
    </VStack>
  );
};

export default LessonPage;
