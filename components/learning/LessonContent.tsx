// components/learning/LessonContent.tsx
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  Divider,
  VStack,
  Image,
  AspectRatio,
  Link,
  Button,
  HStack,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useColorModeValue,
} from "@chakra-ui/react";
import { LinkIcon } from "@heroicons/react/24/outline";
import { Lesson } from "@/lib/learn";
import { useMemo } from "react";

interface LessonContentProps {
  unit: any;
  lesson: Lesson;
  lessonsInUnit: Lesson[];
  onBackToUnit: () => void;
  onNavigateLesson: (lesson: Lesson) => void;
  onGoToQuiz: (lesson: Lesson) => void;
}

/**
 * Normalize lesson content into array of blocks
 */
function normalizeLessonContent(rawContent: any) {
  if (!rawContent) return [];
  if (Array.isArray(rawContent)) return rawContent;
  if (typeof rawContent === "string") {
    try {
      return normalizeLessonContent(JSON.parse(rawContent));
    } catch {
      return [];
    }
  }
  if (typeof rawContent === "object") {
    const blocks: any[] = [];
    Object.entries(rawContent).forEach(([section, sectionData]) => {
      if (typeof sectionData === "object" && sectionData !== null) {
        Object.entries(sectionData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) =>
              blocks.push({ type: "text", content: item, section, key })
            );
          } else if (typeof value === "string") {
            blocks.push({ type: "text", content: value, section, key });
          }
        });
      }
    });
    return blocks;
  }
  return [];
}

/**
 * Render individual content blocks
 */
function RenderBlock({ block }: { block: any }) {
  const textColor = useColorModeValue("gray.800", "gray.100");
  switch (block.type) {
    case "text":
      return (
        <Text fontSize="md" mb={3} color={textColor} _dark={{ color: "gray.300" }}>
          {block.content}
        </Text>
      );

    case "heading":
      return (
        <Heading size={block.level || "md"} mt={6} mb={3}>
          {block.content}
        </Heading>
      );

    case "list":
      return (
        <List spacing={2} styleType={block.ordered ? "decimal" : "disc"} pl={6} mb={3}>
          {block.items?.map((item: string, idx: number) => (
            <ListItem key={idx}>{item}</ListItem>
          ))}
        </List>
      );

    case "image":
      return (
        <Image
          src={block.image}
          alt={block.alt || "Lesson image"}
          borderRadius="md"
          shadow="sm"
          my={4}
        />
      );

    case "video":
      return (
        <AspectRatio ratio={16 / 9} my={4}>
          <iframe src={block.url} title="Lesson Video" allowFullScreen />
        </AspectRatio>
      );

    case "table":
      return (
        <Box overflowX="auto" my={4}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                {block.headers?.map((h: string, i: number) => (
                  <Th key={i}>{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {block.rows?.map((row: string[], ri: number) => (
                <Tr key={ri}>
                  {row.map((cell: string, ci: number) => (
                    <Td key={ci}>{cell}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      );

    case "citation":
      return (
        <Text fontSize="sm" color="blue.500" my={2}>
          <Link href={block.url} isExternal>
            {block.label || block.url} <LinkIcon className="inline w-4 h-4 ml-1" />
          </Link>
        </Text>
      );

    case "quiz":
      return (
        <Button colorScheme="blue" my={3}>
          Take Quiz {block.quizId}
        </Button>
      );

    default:
      return (
        <Text color="red.500" mb={3}>
          Unsupported content block
        </Text>
      );
  }
}

export default function LessonContent({
  lesson,
  lessonsInUnit,
  onBackToUnit,
  onNavigateLesson,
  onGoToQuiz,
}: LessonContentProps) {
  const bgCard = useColorModeValue("white", "gray.700");

  const content = useMemo(() => normalizeLessonContent(lesson?.content), [lesson]);

  if (!lesson || content.length === 0) {
    return <Text p={6}>Content coming soon…</Text>;
  }

  const currentIndex = lessonsInUnit.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? lessonsInUnit[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessonsInUnit.length - 1 ? lessonsInUnit[currentIndex + 1] : null;

  return (
    <VStack
      align="stretch"
      spacing={6}
      p={6}
      bg={bgCard}
      shadow="md"
      rounded="lg"
      maxW="100%"
      mx="auto"
    >
      <Heading size="xl" color="blue.600">
        {lesson.title}
      </Heading>

      <Divider />

      {/* Lesson Blocks */}
      {content.map((block, idx) => (
        <Box
          key={idx}
          p={4}
          bg={useColorModeValue("gray.50", "gray.600")}
          borderRadius="md"
          shadow="sm"
        >
          <RenderBlock block={block} />
        </Box>
      ))}

      <Divider />

      {/* Navigation Controls */}
      <HStack justify="space-between" flexWrap="wrap" spacing={4}>
        <Button onClick={onBackToUnit} variant="outline">
          Back to Unit
        </Button>

        {prevLesson && (
          <Button onClick={() => onNavigateLesson(prevLesson)} variant="ghost">
            ← {prevLesson.title}
          </Button>
        )}

        <Button colorScheme="green" onClick={() => onGoToQuiz(lesson)}>
          Go to Quiz
        </Button>

        {nextLesson && (
          <Button onClick={() => onNavigateLesson(nextLesson)} variant="solid">
            {nextLesson.title} →
          </Button>
        )}
      </HStack>
    </VStack>
  );
}
