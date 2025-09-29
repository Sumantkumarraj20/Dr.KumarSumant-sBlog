import { fetchModules, fetchModuleProgress } from "@/lib/learn";
import { useEffect, useState } from "react";
import {
  SimpleGrid,
  Box,
  Text,
  VStack,
  Button,
  Flex,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface Props {
  course: any;
  userId: string;
  onBack: () => void;
  onSelectModule: (module: any) => void;
}

export default function ModulePage({ course, userId, onBack, onSelectModule }: Props) {
  const [modules, setModules] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!course?.id) return;
    fetchModules(course.id).then(async (mods) => {
      setModules(mods);
      const progressObj: Record<string, number> = {};
      for (const m of mods) {
        const p = await fetchModuleProgress(userId, m.id);
        progressObj[m.id] = p || 0;
      }
      setProgressMap(progressObj);
    });
  }, [course.id, userId]);

  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Flex direction="column" w="100%" h="100%" p={8}>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {modules.map((module) => (
          <Box
            key={module.id}
            bg={cardBg}
            rounded="2xl"
            p={6}
            shadow="sm"
            cursor="pointer"
            _hover={{ shadow: "xl", transform: "translateY(-5px)", bg: "blue.50" }}
          >
            <VStack align="start" spacing={4}>
              <HStack justify="space-between" w="100%">
                <Text fontSize="xl" fontWeight="bold">
                  {module.title}
                </Text>
                <Box w="60px" h="60px">
                  <CircularProgressbar
                    value={progressMap[module.id] || 0}
                    text={`${progressMap[module.id] || 0}%`}
                    styles={buildStyles({
                      textSize: "40%",
                      pathColor: "#3182ce",
                      textColor: "#3182ce",
                      trailColor: "#e2e8f0",
                    })}
                  />
                </Box>
              </HStack>
              {module.description && (
                <Text fontSize="sm" color="gray.600">
                  {module.description}
                </Text>
              )}
              <Button colorScheme="blue" w="full" onClick={() => onSelectModule(module)}>
                Open
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
