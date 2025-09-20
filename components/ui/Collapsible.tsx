"use client";

import React, { createContext, useContext, useState } from "react";

type CollapsibleContextType = {
  isOpen: boolean;
  toggle: () => void;
};

const CollapsibleContext = createContext<CollapsibleContextType | null>(null);

interface RootProps {
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Root container providing open/close state */
export const Collapsible: React.FC<RootProps> = ({
  defaultOpen = false,
  children,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const toggle = () => setIsOpen((p) => !p);

  return (
    <CollapsibleContext.Provider value={{ isOpen, toggle }}>
      <div className={`my-2 border rounded shadow-sm ${className}`}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

function useCollapsible() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error("Collapsible sub-components must be inside <Collapsible>");
  return ctx;
}

/** Button to toggle visibility */
export const CollapsibleTrigger: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className = "", ...props }) => {
  const { isOpen, toggle } = useCollapsible();
  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        toggle();
      }}
      aria-expanded={isOpen}
      className={`w-full text-left font-semibold py-2 px-4 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring ${className}`}
    >
      {children}
    </button>
  );
};

/** Animated content area */
export const CollapsibleContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const { isOpen } = useCollapsible();
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className={`p-4 bg-gray-50 border-t ${className}`}>{children}</div>
    </div>
  );
};

