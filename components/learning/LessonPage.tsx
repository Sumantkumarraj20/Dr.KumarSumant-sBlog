// components/learning/LessonContentView.tsx
import { Box, Text, VStack, Button, Flex, HStack } from "@chakra-ui/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { RichTextView } from "../RichTextView";

interface LessonContentViewProps {
  lesson: any;
  lessonContent: any;
  onCompleteLesson: () => void;
  onBack: () => void;
}

export default function LessonContentView({
  lesson,
  lessonContent,
  onCompleteLesson,
  onBack,
}: LessonContentViewProps) {
  return (
    <Flex direction="column" w="100%" minH="100vh" p={8} maxW="6xl" mx="auto">
      {/* Header */}
      <VStack align="start" spacing={4} mb={8}>
        <Button 
          variant="ghost" 
          onClick={onBack} 
          leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          size="sm"
        >
          Back to Lessons
        </Button>
        
        <VStack align="start" spacing={2}>
          <Text fontSize="3xl" fontWeight="bold">
            {lesson.title}
          </Text>
          {lesson.description && (
            <Text fontSize="lg" color="gray.600">
              {lesson.description}
            </Text>
          )}
        </VStack>
      </VStack>

      {/* Content */}
      <Box bg="white" borderRadius="xl" p={8} shadow="sm">
        <RichTextView content={lessonContent} />
      </Box>

      {/* Navigation */}
      <Flex justify="flex-end" mt={8}>
        <Button colorScheme="blue" size="lg" onClick={onCompleteLesson}>
          Continue to Quiz →
        </Button>
      </Flex>
    </Flex>
  );
}