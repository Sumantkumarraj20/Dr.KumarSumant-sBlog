import { Box, SimpleGrid, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";

interface Item {
  id: string;
  title: string;
  description?: string;
}

interface ItemListProps {
  items: Item[];
  onSelect: (item: Item) => void;
}

const MotionBox = motion(Box);

export const ItemList: React.FC<ItemListProps> = ({ items, onSelect }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardHover = useColorModeValue("blue.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.200");

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} w="full">
      {items.map((item) => (
        <MotionBox
          key={item.id}
          bg={cardBg}
          shadow="md"
          rounded="xl"
          p={6}
          cursor="pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition="0.2s"
          onClick={() => onSelect(item)}
          _hover={{ bg: cardHover }}
        >
          <VStack align="start" spacing={3}>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              {item.title}
            </Text>
            {item.description && (
              <Text fontSize="sm" color="gray.500" noOfLines={3}>
                {item.description}
              </Text>
            )}
          </VStack>
        </MotionBox>
      ))}
    </SimpleGrid>
  );
};
