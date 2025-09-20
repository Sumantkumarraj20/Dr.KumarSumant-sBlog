// /components/ui/Tooltip.tsx
import React from "react";

type TooltipProps = {
  children: React.ReactNode;
  content: string;
};

export const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  return (
    <span className="relative group cursor-help">
      {children}
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs rounded bg-gray-800 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {content}
      </span>
    </span>
  );
};
