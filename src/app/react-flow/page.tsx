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
  ReactFlowProvider,
  MiniMap
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
  ({
    data,
    id
  }: {
    data?: { label?: string; showTopSource?: boolean };
    id?: string;
  }) => {
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
        {/* Handle mới ở top nếu có showTopSource */}
        {data?.showTopSource && (
          <BaseHandle
            type="source"
            position={Position.Top}
            id={id ? `${id}-top-source` : undefined}
            style={{
              position: "absolute",
              top: -6,
              left: "50%",
              zIndex: 20,
              transform: "translateX(-50%)"
            }}
          />
        )}
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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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

  // Thêm node mới vào flow
  const addNewNode = () => {
    setNodes((nds) => [
      ...nds,
      {
        id: `n${nds.length + 1}`,
        position: { x: 300 + nds.length * 200, y: 200 },
        data: { label: `Node ${nds.length + 1}` },
        type: "baseFullDemo"
      }
    ]);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* Sidebar bên trái */}
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 80,
          height: "100vh",
          background: "#23272f",
          color: "#fff",
          boxShadow: "2px 0 8px #0002",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 24
        }}
      >
        <button
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "#3b82f6",
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            border: "none",
            marginBottom: 16,
            cursor: "pointer"
          }}
          title="Thêm node mới"
          onClick={addNewNode}
        >
          +
        </button>
        <span style={{ fontSize: 12, textAlign: "center" }}>Add Node</span>
      </aside>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        onEdgeClick={(_event, edge) => {
          setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }}
        onNodeClick={(_event, node) => setSelectedNode(node)}
      >
        <Background />
        <Controls
          style={{
            color: "black"
          }}
          position="top-right"
        />
        <MiniMap />
      </ReactFlow>
      {selectedNode && (
        <aside
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: 320,
            height: "100vh",
            background: "#18181b",
            color: "#fff",
            boxShadow: "-2px 0 8px #0002",
            zIndex: 1000,
            padding: 24
          }}
        >
          <h2 className="font-bold text-lg mb-2">Node info</h2>
          <div className="mb-2">
            ID: <span className="font-mono">{selectedNode.id}</span>
          </div>
          <div className="mb-2">
            Label:{" "}
            <span className="font-mono">
              {String((selectedNode.data as any)?.label ?? "")}
            </span>
          </div>
          <div className="mb-2">
            Type: <span className="font-mono">{selectedNode.type}</span>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
            onClick={() => setSelectedNode(null)}
          >
            Đóng
          </button>
        </aside>
      )}
    </div>
  );
}
