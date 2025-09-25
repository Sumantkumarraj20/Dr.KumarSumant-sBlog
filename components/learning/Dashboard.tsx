// components/learning/Dashboard.tsx
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
  AcademicCapIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import Layout from "../Layout";

interface Props {
  courses: any[];
  onSelectCourse: (course: any) => void;
}

const Dashboard = ({ courses, onSelectCourse }: Props) => {
  return (
    <Layout>
      <Flex direction="column" w="100%" h="100%" p={8} bg="gray.50" _dark={{ bg: "gray.900" }}>
        <Text fontSize="4xl" fontWeight="extrabold" mb={6}>
          Learning Dashboard
        </Text>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {courses.map((course) => (
            <Box
              key={course.id}
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
                  {course.title}
                </Text>

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
    </Layout>
  );
};

export default Dashboard;
