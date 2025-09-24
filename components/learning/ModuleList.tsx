// components/learning/ModuleList.tsx
import { VStack, Box, Text } from "@chakra-ui/react";

interface ModuleListProps {
  modules: any[];
  selectedModule: any | null;
  onSelect: (module: any) => void;
}

const ModuleList: React.FC<ModuleListProps> = ({ modules, selectedModule, onSelect }) => {
  return (
    <VStack align="stretch" spacing={3} w="300px">
      {modules.map((mod) => (
        <Box
          key={mod.id}
          p={4}
          borderWidth={1}
          borderRadius="md"
          cursor="pointer"
          bg={selectedModule?.id === mod.id ? "green.50" : "white"}
          _hover={{ bg: "green.100" }}
          onClick={() => onSelect(mod)}
        >
          <Text fontWeight="bold">{mod.title}</Text>
        </Box>
      ))}
    </VStack>
  );
};

export default ModuleList;
