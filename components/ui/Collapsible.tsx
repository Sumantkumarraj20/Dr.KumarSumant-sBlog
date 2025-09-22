import { Accordion, AccordionItem, AccordionButton, AccordionPanel, Box } from '@chakra-ui/react';

interface CollapsibleProps {
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Simple Chakra-based collapsible implementation. It preserves the exported
 * component names used throughout the app so MDX content can import
 * Collapsible, CollapsibleTrigger, and CollapsibleContent without changes.
 */
export const Collapsible = ({ defaultOpen = false, children }: CollapsibleProps) => {
  // Chakra's Accordion can be used to create a single collapsible region.
  return (
    <Accordion allowToggle defaultIndex={defaultOpen ? [0] : []} className="my-2">
      <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
        {children as any}
      </AccordionItem>
    </Accordion>
  );
};

export const CollapsibleTrigger = ({ children, ...props }: any) => (
  <AccordionButton as={Box} px={4} py={3} fontWeight="semibold" {...props}>
    {children}
  </AccordionButton>
);

export const CollapsibleContent = ({ children, ...props }: any) => (
  <AccordionPanel px={4} py={3} bg="gray.50" {...props}>
    {children}
  </AccordionPanel>
);

// Provide a simple Chakra-based Collapse component that matches the
// MDX usage: <Collapse title="...">content</Collapse>
export const Collapse = ({ title, children }: { title?: React.ReactNode; children: React.ReactNode }) => {
  return (
    <Accordion allowToggle className="my-2">
      <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
        <AccordionButton as={Box} px={4} py={3} fontWeight="semibold">
          <Box flex="1" textAlign="left">{title}</Box>
        </AccordionButton>
        <AccordionPanel px={4} py={3} bg="gray.50">{children}</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

