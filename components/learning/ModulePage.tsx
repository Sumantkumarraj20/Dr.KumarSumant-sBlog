import { fetchModules } from "@/lib/learn";
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
  Square3Stack3DIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import Layout from "../Layout";

interface Props {
  course: any;
  onBack: () => void;
  onSelectModule: (module: any) => void;
}

const ModulePage = ({ course, onBack, onSelectModule }: Props) => {
  const [modules, setModules] = useState<any[]>([]);
  useEffect(() => {
    fetchModules(course.id).then(setModules);
  }, [course.id]);

  return (
    <Layout>
      <Flex direction="column" w="100%" h="100%" p={8} bg="gray.50 " _dark={{ bg: "gray.900" }}>
        <HStack className="p-3" spacing={3}>
          <Button onClick={onBack}>
            <ChevronDoubleLeftIcon className="h-6 w-6" />
          </Button>
          <Text fontSize="4xl" fontWeight="bold">
            {course.title}
          </Text>
        </HStack>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {modules.map((mod: any) => (
            <Box
              key={mod.id}
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
                  {mod.title}
                </Text>

                {mod.description && (
                  <Text fontSize="sm" color="gray.600">
                    {mod.description}
                  </Text>
                )}
                <Button
                  colorScheme="blue"
                  alignSelf="stretch"
                  onClick={() => onSelectModule(mod)}
                >
                  <Square3Stack3DIcon className="h-5 w-8 mr-1" />
                  <Text className="ml-1" fontSize="md">
                    Open
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

export default ModulePage;
