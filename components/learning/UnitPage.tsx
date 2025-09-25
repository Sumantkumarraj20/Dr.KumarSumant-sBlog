import {fetchUnits} from '@/lib/learn'
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
  Squares2X2Icon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import Layout from "../Layout";

interface Props {
  module: any;
  onBack: () => void;
  onSelectUnit: (unit: any) => void;
}

const UnitPage = ({ module, onBack, onSelectUnit }: Props) => {
  const [units, setUnits] = useState<any[]>([]);
    useEffect(() => {
      fetchUnits(module.id).then(setUnits);
    }, [module.id]);


  return (
    <Layout>
          <Flex direction="column" w="100%" h="100%" p={8} bg="gray.50" _dark={{ bg: "gray.900" }}>
            <HStack className="p-3" spacing={3}>
              <Button onClick={onBack}>
                <ChevronDoubleLeftIcon className="h-6 w-6" />
              </Button>
              <Text fontSize="4xl" fontWeight="bold">
                {module.title}
              </Text>
            </HStack>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {units.map((unit: any) => (
                <Box
                  key={unit.id}
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
                      {unit.title}
                    </Text>
    
                    {unit.description && (
                      <Text fontSize="sm" color="gray.600">
                        {unit.description}
                      </Text>
                    )}
                    <Button
                      colorScheme="blue"
                      alignSelf="stretch"
                      onClick={() => onSelectUnit(unit)}
                    >
                      <Squares2X2Icon className="h-5 w-8 mr-1" />
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

export default UnitPage;
