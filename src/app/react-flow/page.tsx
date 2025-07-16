"use client";
import { useState, useCallback, memo } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Position,
  Background,
  Controls,
  ReactFlowProvider
} from "@xyflow/react";
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  NodeTypes
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle
} from "@/features/shared/components/base-node";
import { BaseHandle } from "@/features/shared/components/base-handle";
import { Rocket } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";

const initialNodes: Node[] = [
  {
    id: "n1",
    position: { x: 250, y: 100 },
    data: { label: "Node 1" },
    type: "baseFullDemo"
  },
  {
    id: "n2",
    position: { x: 600, y: 100 },
    data: { label: "Node 2" },
    type: "baseFullDemo"
  }
];
const initialEdges: Edge[] = [];

const BaseNodeFullDemo = memo(
  ({ data, id }: { data?: { label?: string }; id?: string }) => {
    return (
      <BaseNode className="w-96 relative">
        {/* Handles: absolutely positioned, always visible, high z-index */}
        <BaseHandle
          type="source"
          position={Position.Right}
          id={id ? `${id}-source` : undefined}
          style={{
            position: "absolute",
            top: "50%",
            right: -6,
            zIndex: 20,
            transform: "translateY(-50%)"
          }}
        />
        <BaseHandle
          type="target"
          position={Position.Left}
          id={id ? `${id}-target` : undefined}
          style={{
            position: "absolute",
            top: "50%",
            left: -6,
            zIndex: 20,
            transform: "translateY(-50%)"
          }}
        />
        <BaseNodeHeader className="border-b">
          <Rocket className="size-4" />
          <BaseNodeHeaderTitle>{data?.label ?? "Header"}</BaseNodeHeaderTitle>
        </BaseNodeHeader>
        <BaseNodeContent>
          <h3 className="text-lg font-bold">Content</h3>
          <p className="text-xs">
            This is a full-featured node with a header, content, and footer. You
            can customize it as needed.
          </p>
        </BaseNodeContent>
        <BaseNodeFooter>
          <h4 className="text-md self-start font-bold">Footer</h4>
          <Button variant="outline" className="nodrag w-full">
            Action 1
          </Button>
        </BaseNodeFooter>
      </BaseNode>
    );
  }
);
BaseNodeFullDemo.displayName = "BaseNodeFullDemo";

export default function Page() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const nodeTypes: NodeTypes = {
    baseFullDemo: (props) => <BaseNodeFullDemo {...props} />
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls
          style={{
            color: "black"
          }}
          position="top-right"
        />
      </ReactFlow>
    </div>
  );
}
