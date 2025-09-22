// /components/ui/Tooltip.tsx
import React from 'react';
import { Tooltip as ChakraTooltip } from '@chakra-ui/react';

type TooltipProps = {
  children: React.ReactNode;
  content: string;
  className?: string;
};

export const Tooltip: React.FC<TooltipProps> = ({ children, content, className }) => {
  return (
    <ChakraTooltip label={content} hasArrow placement="top">
      <span className={className} style={{ textDecoration: 'underline dotted', cursor: 'help' }}>
        {children}
      </span>
    </ChakraTooltip>
  );
};
