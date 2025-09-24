// components/learning/LessonContent.tsx
import { Box, Heading, Text, List, ListItem, Divider, VStack } from "@chakra-ui/react";

interface LessonContentProps {
  lesson: any;
  language: string;
}

export default function LessonContent({ lesson, language }: LessonContentProps) {
  console.log (lesson)
  if (!lesson?.content) {
    return <Text>No content available.</Text>;
  }

  // Ensure JSON parsing
  let content: any;
  try {
    content = typeof lesson.content === "string" ? JSON.parse(lesson.content) : lesson.content;
  } catch (err) {
    console.error("Invalid lesson content JSON:", err);
    return <Text>Could not load content.</Text>;
  }

  // Example: pick first object if lesson slug not matched
  const key = Object.keys(content)[0];
  const data = content[key];

  return (
    <VStack align="stretch" spacing={6} p={4} bg="white" shadow="md" rounded="lg">
      <Heading size="lg" color="blue.600">
        {lesson.title}
      </Heading>

      {/* Definition */}
      {data.definition && (
        <Box>
          <Heading size="md" mb={2}>
            Definition
          </Heading>
          <Text fontSize="md" mb={1}>{data.definition.text}</Text>
          <Text fontSize="sm" color="gray.600">
            Focus: {data.definition.focus}
          </Text>
        </Box>
      )}

      <Divider />

      {/* History */}
      {data.history && (
        <Box>
          <Heading size="md" mb={2}>
            History
          </Heading>
          <List spacing={2}>
            {data.history.map((h: string, idx: number) => (
              <ListItem key={idx}>• {h}</ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider />

      {/* Methods */}
      {data.methods && (
        <Box>
          <Heading size="md" mb={2}>
            Methods
          </Heading>
          <List spacing={2}>
            {data.methods.map((m: string, idx: number) => (
              <ListItem key={idx}>• {m}</ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider />

      {/* Objectives */}
      {data.objectives && (
        <Box>
          <Heading size="md" mb={2}>
            Objectives
          </Heading>
          <List spacing={2}>
            {data.objectives.map((o: string, idx: number) => (
              <ListItem key={idx}>• {o}</ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider />

      {/* Clinical Correlation */}
      {data.clinical_correlation && (
        <Box>
          <Heading size="md" mb={2}>
            Clinical Correlation
          </Heading>
          <List spacing={2}>
            {data.clinical_correlation.map((c: string, idx: number) => (
              <ListItem key={idx}>• {c}</ListItem>
            ))}
          </List>
        </Box>
      )}
    </VStack>
  );
}
