/**
 * Workflow Canvas Component
 * 
 * Main React Flow canvas for building workflows
 */

import { useCallback, useRef, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { WorkflowNodeMemo } from "./WorkflowNode";
import { useWorkflowStore } from "@/lib/workflowStore";
import { type NodeTypeDefinition, type WorkflowNode, type WorkflowEdge } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const nodeTypes = {
  workflowNode: WorkflowNodeMemo,
};

/**
 * Generates a simple hash of the config object for change detection.
 * This ensures React Flow re-renders nodes when config changes.
 */
function computeConfigHash(config: Record<string, unknown> | null): string {
  if (!config || Object.keys(config).length === 0) return "";
  return JSON.stringify(config);
}

function toReactFlowNode(node: WorkflowNode, onConfigure: (id: string) => void): Node {
  const config = (node.config as Record<string, unknown>) || {};
  return {
    id: node.id,
    type: "workflowNode",
    position: { x: node.positionX, y: node.positionY },
    data: {
      label: node.label,
      typeId: node.typeId,
      config: config,
      configHash: computeConfigHash(config),
      onConfigure,
    },
    draggable: true,
    selectable: true,
  };
}

function toReactFlowEdge(edge: WorkflowEdge): Edge {
  return {
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
    label: edge.label || undefined,
    type: "smoothstep",
    animated: false,
    style: { stroke: "#94a3b8", strokeWidth: 2 },
  };
}

interface WorkflowCanvasInnerProps {
  workflowId: string;
  onNodeConfigure: (nodeId: string) => void;
}

function WorkflowCanvasInner({ workflowId, onNodeConfigure }: WorkflowCanvasInnerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    setNodes, 
    setEdges,
    addNode,
    updateNode,
    removeNode,
    addEdge: addStoreEdge,
    removeEdge,
    setSelectedNodeIds,
    setInspectorNodeId,
  } = useWorkflowStore();

  // Convert store nodes to React Flow nodes
  // Using useMemo with configHash comparison ensures re-renders on config changes
  const nodes = useMemo(() => {
    return storeNodes.map((n) => toReactFlowNode(n, onNodeConfigure));
  }, [storeNodes, onNodeConfigure]);
  
  const edges = useMemo(
    () => storeEdges.map(toReactFlowEdge),
    [storeEdges]
  );
  

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === "position" && change.dragging === false && change.position) {
          const node = storeNodes.find((n) => n.id === change.id);
          if (node) {
            apiRequest("PATCH", `/api/nodes/${change.id}`, {
              positionX: change.position.x,
              positionY: change.position.y,
            }).then(() => {
              updateNode(change.id, {
                positionX: change.position!.x,
                positionY: change.position!.y,
              });
            }).catch((error) => {
              console.error("Failed to update node position:", error);
            });
          }
        } else if (change.type === "position" && change.dragging) {
          if (change.position) {
            updateNode(change.id, {
              positionX: change.position.x,
              positionY: change.position.y,
            });
          }
        } else if (change.type === "remove") {
          apiRequest("DELETE", `/api/nodes/${change.id}`, undefined)
            .then(() => removeNode(change.id))
            .catch((error) => console.error("Failed to delete node:", error));
        } else if (change.type === "select") {
          if (change.selected) {
            setSelectedNodeIds([change.id]);
            setInspectorNodeId(change.id);
          }
        }
      }
    },
    [storeNodes, updateNode, removeNode, setSelectedNodeIds, setInspectorNodeId]
  );

  const onEdgesChange = useCallback(
    async (changes: EdgeChange[]) => {
      for (const change of changes) {
        if (change.type === "remove") {
          try {
            await apiRequest("DELETE", `/api/edges/${change.id}`, undefined);
            removeEdge(change.id);
          } catch (error) {
            console.error("Failed to delete edge:", error);
          }
        }
      }
    },
    [removeEdge]
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      
      try {
        const response = await apiRequest("POST", `/api/workflows/${workflowId}/edges`, {
          sourceNodeId: connection.source,
          targetNodeId: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        });
        const newEdge = await response.json();
        addStoreEdge(newEdge);
      } catch (error) {
        console.error("Failed to create edge:", error);
      }
    },
    [workflowId, addStoreEdge]
  );

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      const nodeTypeData = event.dataTransfer.getData("application/workflow-node");
      if (!nodeTypeData) return;

      const nodeType: NodeTypeDefinition = JSON.parse(nodeTypeData);
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      try {
        const response = await apiRequest("POST", `/api/workflows/${workflowId}/nodes`, {
          typeId: nodeType.id,
          label: nodeType.name,
          positionX: position.x,
          positionY: position.y,
          config: nodeType.defaultConfig || {},
          metadata: {},
        });
        const newNode = await response.json();
        addNode(newNode);
        setSelectedNodeIds([newNode.id]);
        setInspectorNodeId(newNode.id);
      } catch (error) {
        console.error("Failed to create node:", error);
      }
    },
    [workflowId, screenToFlowPosition, addNode, setSelectedNodeIds, setInspectorNodeId]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeIds([]);
    setInspectorNodeId(null);
  }, [setSelectedNodeIds, setInspectorNodeId]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full" data-testid="workflow-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
        <Controls className="!bg-card !border !border-border !shadow-sm" />
        <MiniMap 
          className="!bg-card !border !border-border"
          nodeColor={(node) => {
            const nodeType = storeNodes.find((n) => n.id === node.id);
            return nodeType ? "#266c92" : "#94a3b8";
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}

interface WorkflowCanvasProps {
  workflowId: string;
  onNodeConfigure: (nodeId: string) => void;
}

export function WorkflowCanvas({ workflowId, onNodeConfigure }: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner workflowId={workflowId} onNodeConfigure={onNodeConfigure} />
    </ReactFlowProvider>
  );
}
