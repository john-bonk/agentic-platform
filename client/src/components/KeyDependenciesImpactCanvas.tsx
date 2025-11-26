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
import { RefreshCcw, Server, Database, Globe, Shield, Cloud, ChevronRight } from "lucide-react";

interface ImpactCanvasProps {
  processName: string;
  dependencies: {
    itAssets: { name: string; description: string }[];
    vendors: { name: string; description: string }[];
  };
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "root":
      return <Cloud className="w-4 h-4 text-orange-500" />;
    case "infrastructure":
      return <Server className="w-4 h-4 text-blue-500" />;
    case "service":
      return <Shield className="w-4 h-4 text-blue-600" />;
    case "application":
      return <Globe className="w-4 h-4 text-blue-500" />;
    case "endpoint":
      return <Database className="w-4 h-4 text-blue-400" />;
    default:
      return <Server className="w-4 h-4 text-gray-500" />;
  }
};

const CustomNode = ({ data }: NodeProps) => {
  const isHighlighted = data.highlighted;
  const isRoot = data.category === "root";

  return (
    <div
      className={`px-3 py-2 rounded-md border-2 transition-all ${
        isHighlighted
          ? "border-blue-500 bg-blue-50 shadow-lg"
          : isRoot
          ? "border-orange-300 bg-orange-50"
          : "border-gray-200 bg-white"
      }`}
      style={{ minWidth: "160px" }}
      data-testid={`flow-node-${data.id}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${isHighlighted ? "bg-blue-100" : isRoot ? "bg-orange-100" : "bg-gray-100"}`}>
          {getCategoryIcon(data.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type}</div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
      <div className="mt-1 text-xs text-gray-400">via {data.relationship || "powers"}</div>
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

  const horizontalSpacing = 220;
  const verticalSpacing = 90;

  nodes.push({
    id: "root",
    type: "custom",
    position: { x: 0, y: 120 },
    data: {
      id: "root",
      label: processName,
      type: "Business Process",
      category: "root",
      relationship: "powers",
      highlighted: false,
    },
  });

  const itAssets = dependencies.itAssets.slice(0, 3);
  itAssets.forEach((asset, idx) => {
    const infrastructureId = `infra-${idx}`;
    const yOffset = idx * verticalSpacing;
    
    nodes.push({
      id: infrastructureId,
      type: "custom",
      position: { x: horizontalSpacing, y: yOffset + 40 },
      data: {
        id: infrastructureId,
        label: asset.name.length > 20 ? asset.name.substring(0, 18) + "..." : asset.name,
        type: "IT System",
        category: "infrastructure",
        relationship: "powers",
        highlighted: false,
      },
    });
    
    edges.push({
      id: `edge-root-${infrastructureId}`,
      source: "root",
      target: infrastructureId,
      label: "powers",
      type: "smoothstep",
      animated: false,
      style: { stroke: "#94a3b8", strokeWidth: 1.5 },
      labelStyle: { fontSize: 10, fill: "#64748b" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
    });

    if (idx === 0) {
      const serviceId = `service-${idx}`;
      nodes.push({
        id: serviceId,
        type: "custom",
        position: { x: horizontalSpacing * 2, y: 0 },
        data: {
          id: serviceId,
          label: "Auth Service",
          type: "IT System",
          category: "service",
          relationship: "powers",
          highlighted: false,
        },
      });
      edges.push({
        id: `edge-${infrastructureId}-${serviceId}`,
        source: infrastructureId,
        target: serviceId,
        label: "powers",
        type: "smoothstep",
        animated: false,
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: "#64748b" },
        labelBgStyle: { fill: "white", fillOpacity: 0.8 },
      });

      const appId = `app-${idx}`;
      nodes.push({
        id: appId,
        type: "custom",
        position: { x: horizontalSpacing * 3, y: 60 },
        data: {
          id: appId,
          label: "Web Applications",
          type: "IT System",
          category: "application",
          relationship: "enables",
          highlighted: false,
        },
      });
      edges.push({
        id: `edge-${serviceId}-${appId}`,
        source: serviceId,
        target: appId,
        label: "enables",
        type: "smoothstep",
        animated: false,
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: "#64748b" },
        labelBgStyle: { fill: "white", fillOpacity: 0.8 },
      });

      const endpoints = ["Marketing Website", "Analytics Dashboard", "Product API", "Developer Docs", "Deploy Pipeline"];
      endpoints.forEach((name, endIdx) => {
        const endpointId = `endpoint-${idx}-${endIdx}`;
        nodes.push({
          id: endpointId,
          type: "custom",
          position: { x: horizontalSpacing * 4, y: endIdx * 75 - 40 },
          data: {
            id: endpointId,
            label: name,
            type: "IT System",
            category: "endpoint",
            relationship: "enables",
            highlighted: false,
          },
        });
        edges.push({
          id: `edge-${appId}-${endpointId}`,
          source: appId,
          target: endpointId,
          label: "enables",
          type: "smoothstep",
          animated: false,
          style: { stroke: "#94a3b8", strokeWidth: 1.5 },
          labelStyle: { fontSize: 10, fill: "#64748b" },
          labelBgStyle: { fill: "white", fillOpacity: 0.8 },
        });
      });
    } else if (idx === 1) {
      const dbId = `db-${idx}`;
      nodes.push({
        id: dbId,
        type: "custom",
        position: { x: horizontalSpacing * 2, y: verticalSpacing + 40 },
        data: {
          id: dbId,
          label: "Primary Database",
          type: "IT System",
          category: "service",
          relationship: "powers",
          highlighted: false,
        },
      });
      edges.push({
        id: `edge-${infrastructureId}-${dbId}`,
        source: infrastructureId,
        target: dbId,
        label: "powers",
        type: "smoothstep",
        animated: false,
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: "#64748b" },
        labelBgStyle: { fill: "white", fillOpacity: 0.8 },
      });
    } else {
      const cdnId = `cdn-${idx}`;
      nodes.push({
        id: cdnId,
        type: "custom",
        position: { x: horizontalSpacing * 2, y: verticalSpacing * 2 + 40 },
        data: {
          id: cdnId,
          label: "Asset CDN",
          type: "IT System",
          category: "service",
          relationship: "powers",
          highlighted: false,
        },
      });
      edges.push({
        id: `edge-${infrastructureId}-${cdnId}`,
        source: infrastructureId,
        target: cdnId,
        label: "powers",
        type: "smoothstep",
        animated: false,
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: "#64748b" },
        labelBgStyle: { fill: "white", fillOpacity: 0.8 },
      });
    }
  });

  return { nodes, edges };
}

function ImpactCanvasInner({ processName, dependencies }: ImpactCanvasProps) {
  const { fitView } = useReactFlow();
  const [highlightedPath, setHighlightedPath] = useState<Set<string>>(new Set());

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
      setHighlightedPath(connectedNodes);

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
    setHighlightedPath(new Set());
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
    <div className="relative w-full h-[300px] bg-white border border-[#e2e8f0] rounded-md mb-6" data-testid="impact-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
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
