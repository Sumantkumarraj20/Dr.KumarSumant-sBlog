// /components/ui/FlowDiagram.tsx
import React from "react";

type Node = {
  id: string;
  label: string;
  description: string;
};

type Edge = {
  from: string;
  to: string;
  label: string;
};

type FlowNodeProps = {
  nodes: Node[];
  edges: Edge[];
};

export const FlowNode: React.FC<FlowNodeProps> = ({ nodes, edges }) => {
  const nodeMap = nodes.reduce<Record<string, Node>>((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});

  return (
    <div className="flow-diagram p-4 border rounded bg-gray-50">
      {nodes.map((node) => (
        <div key={node.id} className="mb-4">
          <div className="p-3 bg-blue-100 rounded shadow cursor-pointer group relative">
            <strong>{node.label}</strong>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 w-max max-w-xs">
              {node.description}
            </div>
          </div>

          {edges
            .filter((e) => e.from === node.id)
            .map((edge, idx) => (
              <div key={idx} className="ml-6 mt-1 text-gray-600">
                ⬇ {edge.label} → {nodeMap[edge.to]?.label}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};
