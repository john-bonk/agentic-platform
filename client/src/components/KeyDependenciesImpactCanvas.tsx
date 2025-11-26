import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Server, Database, Globe, Building2, MapPin, ChevronRight } from "lucide-react";

interface ITAsset {
  name: string;
  description: string;
}

interface VendorItem {
  name: string;
  description: string;
}

interface BusinessProcessItem {
  name: string;
  description: string;
  rto: string;
  processOwner: string;
}

interface BranchItem {
  name: string;
  type: string;
}

interface ImpactCanvasProps {
  processName: string;
  dependencies: {
    itAssets: ITAsset[];
    vendors: VendorItem[];
    businessProcesses?: BusinessProcessItem[];
    branches?: BranchItem[];
  };
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "root":
      return <Globe className="w-4 h-4 text-orange-500" />;
    case "itAsset":
      return <Server className="w-4 h-4 text-blue-500" />;
    case "vendor":
      return <Building2 className="w-4 h-4 text-purple-500" />;
    case "process":
      return <Database className="w-4 h-4 text-teal-500" />;
    case "branch":
      return <MapPin className="w-4 h-4 text-green-500" />;
    default:
      return <Server className="w-4 h-4 text-gray-500" />;
  }
};

const getCategoryColor = (category: string, isHighlighted: boolean) => {
  if (isHighlighted) return "border-blue-500 bg-blue-50";
  switch (category) {
    case "root":
      return "border-orange-300 bg-orange-50";
    case "itAsset":
      return "border-blue-200 bg-blue-50/50";
    case "vendor":
      return "border-purple-200 bg-purple-50/50";
    case "process":
      return "border-teal-200 bg-teal-50/50";
    case "branch":
      return "border-green-200 bg-green-50/50";
    default:
      return "border-gray-200 bg-white";
  }
};

const getIconBgColor = (category: string, isHighlighted: boolean) => {
  if (isHighlighted) return "bg-blue-100";
  switch (category) {
    case "root":
      return "bg-orange-100";
    case "itAsset":
      return "bg-blue-100";
    case "vendor":
      return "bg-purple-100";
    case "process":
      return "bg-teal-100";
    case "branch":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
};

const CustomNode = ({ data }: NodeProps) => {
  const isHighlighted = data.highlighted;

  return (
    <div
      className={`px-3 py-2 rounded-md border-2 transition-all shadow-sm ${getCategoryColor(data.category, isHighlighted)}`}
      style={{ minWidth: "150px", maxWidth: "180px" }}
      data-testid={`flow-node-${data.id}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${getIconBgColor(data.category, isHighlighted)}`}>
          {getCategoryIcon(data.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-900 truncate">{data.label}</div>
          <div className="text-[10px] text-gray-500">{data.type}</div>
        </div>
        {data.category !== "root" && (
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
        )}
      </div>
      {data.relationship && (
        <div className="mt-1 text-[10px] text-gray-400">via {data.relationship}</div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

function generateCascadeData(processName: string, dependencies: ImpactCanvasProps["dependencies"]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const horizontalSpacing = 200;
  const verticalSpacing = 80;

  nodes.push({
    id: "root",
    type: "custom",
    position: { x: 0, y: 150 },
    data: {
      id: "root",
      label: processName,
      type: "Business Process",
      category: "root",
      relationship: null,
      highlighted: false,
    },
  });

  let currentLevel = 1;
  let yOffset = 0;

  const itAssets = dependencies.itAssets || [];
  const itAssetStartY = 0;
  itAssets.forEach((asset, idx) => {
    const nodeId = `itAsset-${idx}`;
    nodes.push({
      id: nodeId,
      type: "custom",
      position: { x: horizontalSpacing * currentLevel, y: itAssetStartY + idx * verticalSpacing },
      data: {
        id: nodeId,
        label: asset.name.length > 22 ? asset.name.substring(0, 20) + "..." : asset.name,
        type: "IT Asset",
        category: "itAsset",
        relationship: "powers",
        highlighted: false,
      },
    });
    edges.push({
      id: `edge-root-${nodeId}`,
      source: "root",
      target: nodeId,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    });
  });
  yOffset = itAssets.length * verticalSpacing;

  currentLevel = 2;

  const vendors = dependencies.vendors || [];
  vendors.forEach((vendor, idx) => {
    const nodeId = `vendor-${idx}`;
    const connectedItAsset = itAssets.length > 0 ? `itAsset-${Math.min(idx, itAssets.length - 1)}` : "root";
    
    nodes.push({
      id: nodeId,
      type: "custom",
      position: { x: horizontalSpacing * currentLevel, y: idx * verticalSpacing },
      data: {
        id: nodeId,
        label: vendor.name.length > 22 ? vendor.name.substring(0, 20) + "..." : vendor.name,
        type: "Vendor",
        category: "vendor",
        relationship: "provides",
        highlighted: false,
      },
    });
    edges.push({
      id: `edge-${connectedItAsset}-${nodeId}`,
      source: connectedItAsset,
      target: nodeId,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    });
  });

  currentLevel = 3;

  const businessProcesses = dependencies.businessProcesses || [];
  businessProcesses.forEach((proc, idx) => {
    const nodeId = `process-${idx}`;
    const connectedVendor = vendors.length > 0 ? `vendor-${Math.min(idx, vendors.length - 1)}` : 
                           itAssets.length > 0 ? `itAsset-${Math.min(idx, itAssets.length - 1)}` : "root";
    
    nodes.push({
      id: nodeId,
      type: "custom",
      position: { x: horizontalSpacing * currentLevel, y: idx * verticalSpacing },
      data: {
        id: nodeId,
        label: proc.name.length > 22 ? proc.name.substring(0, 20) + "..." : proc.name,
        type: "Business Process",
        category: "process",
        relationship: "depends on",
        highlighted: false,
      },
    });
    edges.push({
      id: `edge-${connectedVendor}-${nodeId}`,
      source: connectedVendor,
      target: nodeId,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    });
  });

  currentLevel = 4;

  const branches = dependencies.branches || [];
  branches.forEach((branch, idx) => {
    const nodeId = `branch-${idx}`;
    const connectedProcess = businessProcesses.length > 0 ? `process-${Math.min(idx, businessProcesses.length - 1)}` :
                            vendors.length > 0 ? `vendor-${Math.min(idx, vendors.length - 1)}` :
                            itAssets.length > 0 ? `itAsset-${Math.min(idx, itAssets.length - 1)}` : "root";
    
    nodes.push({
      id: nodeId,
      type: "custom",
      position: { x: horizontalSpacing * currentLevel, y: idx * verticalSpacing },
      data: {
        id: nodeId,
        label: branch.name.length > 22 ? branch.name.substring(0, 20) + "..." : branch.name,
        type: branch.type,
        category: "branch",
        relationship: "operates at",
        highlighted: false,
      },
    });
    edges.push({
      id: `edge-${connectedProcess}-${nodeId}`,
      source: connectedProcess,
      target: nodeId,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    });
  });

  const maxItems = Math.max(itAssets.length, vendors.length, businessProcesses.length, branches.length, 1);
  const totalHeight = maxItems * verticalSpacing;
  const rootNode = nodes.find(n => n.id === "root");
  if (rootNode) {
    rootNode.position.y = (totalHeight - verticalSpacing) / 2;
  }

  return { nodes, edges };
}

function ImpactCanvasInner({ processName, dependencies }: ImpactCanvasProps) {
  const { fitView } = useReactFlow();

  const { initialNodes, initialEdges } = useMemo(() => {
    const cascadeData = generateCascadeData(processName, dependencies);
    return { initialNodes: cascadeData.nodes, initialEdges: cascadeData.edges };
  }, [processName, dependencies]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const findConnectedNodes = useCallback((nodeId: string, edgeList: Edge[]): Set<string> => {
    const connected = new Set<string>([nodeId]);
    const queue = [nodeId];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      edgeList.forEach((edge) => {
        if (edge.source === current && !connected.has(edge.target)) {
          connected.add(edge.target);
          queue.push(edge.target);
        }
      });
    }

    const reverseQueue = [nodeId];
    while (reverseQueue.length > 0) {
      const current = reverseQueue.shift()!;
      edgeList.forEach((edge) => {
        if (edge.target === current && !connected.has(edge.source)) {
          connected.add(edge.source);
          reverseQueue.push(edge.source);
        }
      });
    }

    return connected;
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const connectedNodes = findConnectedNodes(node.id, edges);

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            highlighted: connectedNodes.has(n.id),
          },
        }))
      );

      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: connectedNodes.has(e.source) && connectedNodes.has(e.target),
          style: {
            ...e.style,
            stroke: connectedNodes.has(e.source) && connectedNodes.has(e.target) ? "#3b82f6" : "#94a3b8",
            strokeWidth: connectedNodes.has(e.source) && connectedNodes.has(e.target) ? 2.5 : 1.5,
          },
        }))
      );
    },
    [edges, findConnectedNodes, setNodes, setEdges]
  );

  const handleResetView = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          highlighted: false,
        },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated: false,
        style: {
          ...e.style,
          stroke: "#94a3b8",
          strokeWidth: 1.5,
        },
      }))
    );
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [fitView, setNodes, setEdges]);

  return (
    <div className="relative w-full h-[280px] bg-white border border-[#e2e8f0] rounded-md mb-6" data-testid="impact-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#f1f5f9" gap={16} />
        <Controls
          showInteractive={false}
          className="!left-2 !bottom-2 !shadow-sm"
        />
      </ReactFlow>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResetView}
        className="absolute top-3 right-3 gap-2 bg-white shadow-sm"
        data-testid="button-reset-view"
      >
        <RefreshCcw className="w-4 h-4" />
        Reset View
      </Button>
    </div>
  );
}

export function KeyDependenciesImpactCanvas(props: ImpactCanvasProps) {
  return (
    <ReactFlowProvider>
      <ImpactCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
