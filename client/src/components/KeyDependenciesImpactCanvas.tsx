import { useCallback, useMemo, useState, useEffect } from "react";
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
import { RefreshCcw, Server, Building2, Database, MapPin, Globe, Minus, Plus } from "lucide-react";
import { 
  SiSlack, SiZoom, SiGithub, SiJira, SiConfluence, SiNotion, 
  SiDatadog, SiPagerduty, SiTerraform, SiSplunk, SiOkta,
  SiSalesforce, SiTableau, SiOracle,
  SiAtlassian
} from "react-icons/si";
import { FaAws, FaGoogle, FaMicrosoft, FaBuilding, FaCloud } from "react-icons/fa";
import { BsMicrosoftTeams } from "react-icons/bs";

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

type CategoryType = "root" | "category" | "itAsset" | "vendor" | "process" | "branch";

const getProductLogo = (name: string) => {
  const normalizedName = name.toLowerCase();
  
  if (normalizedName.includes("slack")) return <SiSlack className="w-4 h-4 text-[#4A154B]" />;
  if (normalizedName.includes("zoom")) return <SiZoom className="w-4 h-4 text-[#2D8CFF]" />;
  if (normalizedName.includes("github")) return <SiGithub className="w-4 h-4 text-[#181717]" />;
  if (normalizedName.includes("jira")) return <SiJira className="w-4 h-4 text-[#0052CC]" />;
  if (normalizedName.includes("confluence")) return <SiConfluence className="w-4 h-4 text-[#172B4D]" />;
  if (normalizedName.includes("notion")) return <SiNotion className="w-4 h-4 text-[#000000]" />;
  if (normalizedName.includes("datadog")) return <SiDatadog className="w-4 h-4 text-[#632CA6]" />;
  if (normalizedName.includes("pagerduty")) return <SiPagerduty className="w-4 h-4 text-[#06AC38]" />;
  if (normalizedName.includes("terraform")) return <SiTerraform className="w-4 h-4 text-[#7B42BC]" />;
  if (normalizedName.includes("splunk")) return <SiSplunk className="w-4 h-4 text-[#000000]" />;
  if (normalizedName.includes("okta")) return <SiOkta className="w-4 h-4 text-[#007DC1]" />;
  if (normalizedName.includes("aws") || normalizedName.includes("amazon")) return <FaAws className="w-4 h-4 text-[#FF9900]" />;
  if (normalizedName.includes("google cloud") || normalizedName.includes("gcp")) return <FaCloud className="w-4 h-4 text-[#4285F4]" />;
  if (normalizedName.includes("google workspace") || normalizedName.includes("google")) return <FaGoogle className="w-4 h-4 text-[#4285F4]" />;
  if (normalizedName.includes("azure")) return <FaCloud className="w-4 h-4 text-[#0078D4]" />;
  if (normalizedName.includes("microsoft teams") || normalizedName.includes("teams")) return <BsMicrosoftTeams className="w-4 h-4 text-[#6264A7]" />;
  if (normalizedName.includes("office 365") || normalizedName.includes("microsoft office")) return <FaMicrosoft className="w-4 h-4 text-[#D83B01]" />;
  if (normalizedName.includes("microsoft")) return <FaMicrosoft className="w-4 h-4 text-[#00A4EF]" />;
  if (normalizedName.includes("salesforce")) return <SiSalesforce className="w-4 h-4 text-[#00A1E0]" />;
  if (normalizedName.includes("tableau")) return <SiTableau className="w-4 h-4 text-[#E97627]" />;
  if (normalizedName.includes("netsuite") || normalizedName.includes("oracle")) return <SiOracle className="w-4 h-4 text-[#F80000]" />;
  if (normalizedName.includes("atlassian")) return <SiAtlassian className="w-4 h-4 text-[#0052CC]" />;
  
  return null;
};

const getVendorLogo = (name: string) => {
  const normalizedName = name.toLowerCase();
  
  if (normalizedName.includes("amazon") || normalizedName.includes("aws")) return <FaAws className="w-4 h-4 text-[#FF9900]" />;
  if (normalizedName.includes("microsoft")) return <FaMicrosoft className="w-4 h-4 text-[#00A4EF]" />;
  if (normalizedName.includes("google")) return <FaGoogle className="w-4 h-4 text-[#4285F4]" />;
  if (normalizedName.includes("salesforce")) return <SiSalesforce className="w-4 h-4 text-[#00A1E0]" />;
  if (normalizedName.includes("atlassian")) return <SiAtlassian className="w-4 h-4 text-[#0052CC]" />;
  if (normalizedName.includes("slack")) return <SiSlack className="w-4 h-4 text-[#4A154B]" />;
  if (normalizedName.includes("zoom")) return <SiZoom className="w-4 h-4 text-[#2D8CFF]" />;
  if (normalizedName.includes("github")) return <SiGithub className="w-4 h-4 text-[#181717]" />;
  if (normalizedName.includes("notion")) return <SiNotion className="w-4 h-4 text-[#000000]" />;
  if (normalizedName.includes("datadog")) return <SiDatadog className="w-4 h-4 text-[#632CA6]" />;
  if (normalizedName.includes("pagerduty")) return <SiPagerduty className="w-4 h-4 text-[#06AC38]" />;
  if (normalizedName.includes("hashicorp")) return <SiTerraform className="w-4 h-4 text-[#7B42BC]" />;
  if (normalizedName.includes("splunk")) return <SiSplunk className="w-4 h-4 text-[#000000]" />;
  if (normalizedName.includes("okta")) return <SiOkta className="w-4 h-4 text-[#007DC1]" />;
  if (normalizedName.includes("oracle")) return <SiOracle className="w-4 h-4 text-[#F80000]" />;
  
  return <FaBuilding className="w-4 h-4 text-gray-500" />;
};

const getCategoryIcon = (category: CategoryType) => {
  switch (category) {
    case "root":
      return <Globe className="w-4 h-4 text-gray-500" />;
    case "itAsset":
      return <Server className="w-4 h-4 text-gray-500" />;
    case "vendor":
      return <Building2 className="w-4 h-4 text-gray-500" />;
    case "process":
      return <Database className="w-4 h-4 text-gray-500" />;
    case "branch":
      return <MapPin className="w-4 h-4 text-gray-500" />;
    default:
      return <Server className="w-4 h-4 text-gray-500" />;
  }
};

const getCategoryColors = (category: CategoryType, isHighlighted: boolean) => {
  if (isHighlighted) return { border: "border-blue-500", bg: "bg-blue-50", iconBg: "bg-blue-100" };
  switch (category) {
    case "root":
      return { border: "border-gray-300", bg: "bg-white", iconBg: "bg-gray-100" };
    case "category":
      return { border: "border-gray-300", bg: "bg-white", iconBg: "bg-gray-100" };
    case "itAsset":
      return { border: "border-gray-200", bg: "bg-white", iconBg: "bg-gray-100" };
    case "vendor":
      return { border: "border-gray-200", bg: "bg-white", iconBg: "bg-gray-100" };
    case "process":
      return { border: "border-gray-200", bg: "bg-white", iconBg: "bg-gray-100" };
    case "branch":
      return { border: "border-gray-200", bg: "bg-white", iconBg: "bg-gray-100" };
    default:
      return { border: "border-gray-200", bg: "bg-white", iconBg: "bg-gray-100" };
  }
};

const RootNode = ({ data }: NodeProps) => {
  const colors = getCategoryColors("root", data.highlighted);
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-md ${colors.border} ${colors.bg}`}
      style={{ minWidth: "180px" }}
      data-testid={`flow-node-${data.id}`}
    >
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-3 !h-3" />
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
          <Globe className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{data.label}</div>
          <div className="text-xs text-gray-500">Business Process</div>
        </div>
      </div>
    </div>
  );
};

const CategoryNode = ({ data }: NodeProps) => {
  const colors = getCategoryColors(data.childCategory as CategoryType, data.highlighted);
  const isExpanded = data.expanded;
  const count = data.count || 0;

  return (
    <div
      className={`px-3 py-2 rounded-md border-2 shadow-sm cursor-pointer transition-all hover:shadow-md ${colors.border} ${colors.bg}`}
      style={{ minWidth: "140px" }}
      data-testid={`flow-node-${data.id}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${colors.iconBg}`}>
          {getCategoryIcon(data.childCategory as CategoryType)}
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-900">{data.label}</div>
          <div className="text-[10px] text-gray-500">{count} item{count !== 1 ? 's' : ''}</div>
        </div>
        <div className={`p-1 rounded ${isExpanded ? 'bg-gray-200' : 'bg-gray-100'}`}>
          {isExpanded ? (
            <Minus className="w-3 h-3 text-gray-600" />
          ) : (
            <Plus className="w-3 h-3 text-gray-600" />
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
};

const ItemNode = ({ data }: NodeProps) => {
  const colors = getCategoryColors(data.category as CategoryType, data.highlighted);
  
  const logo = data.category === "itAsset" 
    ? getProductLogo(data.fullName || data.label)
    : data.category === "vendor"
    ? getVendorLogo(data.fullName || data.label)
    : null;

  return (
    <div
      className={`px-3 py-2 rounded-md border shadow-sm transition-all ${colors.border} ${colors.bg}`}
      style={{ minWidth: "130px", maxWidth: "170px" }}
      data-testid={`flow-node-${data.id}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${colors.iconBg} flex items-center justify-center`}>
          {logo || getCategoryIcon(data.category as CategoryType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-medium text-gray-900 truncate">{data.label}</div>
          <div className="text-[9px] text-gray-500 truncate">{data.subLabel || data.category}</div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { 
  root: RootNode,
  category: CategoryNode, 
  item: ItemNode,
};

interface ExpandedState {
  itAssets: boolean;
  vendors: boolean;
  processes: boolean;
  branches: boolean;
}

interface GenericItem {
  name: string;
  [key: string]: unknown;
}

function generateMindMapData(
  processName: string, 
  dependencies: ImpactCanvasProps["dependencies"],
  expanded: ExpandedState
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const ROOT_NODE_WIDTH = 200;
  const ROOT_NODE_HEIGHT = 72;
  const CATEGORY_NODE_HEIGHT = 52;
  const ITEM_NODE_HEIGHT = 48;
  const ITEM_GAP = 10;
  const CATEGORY_GAP = 50;
  const COLUMN_GAP = 140;
  const MAX_ITEMS = 5;
  
  const ROOT_X = 0;
  const CATEGORY_X = ROOT_X + ROOT_NODE_WIDTH + COLUMN_GAP;
  const ITEM_X = CATEGORY_X + 160 + COLUMN_GAP;

  const allCategories = [
    { key: "itAssets", label: "IT Assets", items: (dependencies.itAssets || []) as unknown as GenericItem[], childCategory: "itAsset" },
    { key: "vendors", label: "Vendors", items: (dependencies.vendors || []) as unknown as GenericItem[], childCategory: "vendor" },
    { key: "processes", label: "Business Processes", items: (dependencies.businessProcesses || []) as unknown as GenericItem[], childCategory: "process" },
    { key: "branches", label: "Locations", items: (dependencies.branches || []) as unknown as GenericItem[], childCategory: "branch" },
  ].filter(cat => cat.items.length > 0);

  let currentY = 0;
  const categoryPositions: { key: string; y: number; itemsStartY: number; itemCount: number }[] = [];

  allCategories.forEach((cat, catIndex) => {
    const isExpanded = expanded[cat.key as keyof ExpandedState];
    const visibleItems = isExpanded ? Math.min(cat.items.length, MAX_ITEMS) : 0;
    const hasMore = isExpanded && cat.items.length > MAX_ITEMS;
    const totalRows = visibleItems + (hasMore ? 1 : 0);
    
    const blockHeight = isExpanded && totalRows > 0 
      ? totalRows * ITEM_NODE_HEIGHT + (totalRows - 1) * ITEM_GAP
      : CATEGORY_NODE_HEIGHT;

    const categoryY = currentY + blockHeight / 2 - CATEGORY_NODE_HEIGHT / 2;
    
    categoryPositions.push({
      key: cat.key,
      y: categoryY,
      itemsStartY: currentY,
      itemCount: totalRows
    });

    currentY += blockHeight + CATEGORY_GAP;
  });

  const totalHeight = currentY - CATEGORY_GAP;
  const rootY = totalHeight / 2 - ROOT_NODE_HEIGHT / 2;

  nodes.push({
    id: "root",
    type: "root",
    position: { x: ROOT_X, y: Math.max(0, rootY) },
    data: { id: "root", label: processName, highlighted: false },
  });

  allCategories.forEach((cat, catIndex) => {
    const pos = categoryPositions[catIndex];
    const categoryId = `cat-${cat.key}`;
    const isExpanded = expanded[cat.key as keyof ExpandedState];

    nodes.push({
      id: categoryId,
      type: "category",
      position: { x: CATEGORY_X, y: pos.y },
      data: {
        id: categoryId,
        label: cat.label,
        childCategory: cat.childCategory,
        expanded: isExpanded,
        count: cat.items.length,
        highlighted: false,
      },
    });

    edges.push({
      id: `edge-root-${categoryId}`,
      source: "root",
      target: categoryId,
      type: "smoothstep",
      style: { stroke: "#94a3b8", strokeWidth: 2 },
    });

    if (isExpanded) {
      const itemsToShow = cat.items.slice(0, MAX_ITEMS);
      const hasMore = cat.items.length > MAX_ITEMS;

      itemsToShow.forEach((item, itemIdx) => {
        const itemId = `${cat.key}-${itemIdx}`;
        const itemY = pos.itemsStartY + itemIdx * (ITEM_NODE_HEIGHT + ITEM_GAP);

        let subLabel = "";
        if (cat.childCategory === "branch" && "type" in item) {
          subLabel = String(item.type || "");
        } else if (cat.childCategory === "process" && "rto" in item) {
          subLabel = `RTO: ${String(item.rto || "")}`;
        } else if (cat.childCategory === "itAsset") {
          subLabel = "IT Asset";
        } else if (cat.childCategory === "vendor") {
          subLabel = "Vendor";
        }

        nodes.push({
          id: itemId,
          type: "item",
          position: { x: ITEM_X, y: itemY },
          data: {
            id: itemId,
            label: item.name.length > 20 ? item.name.substring(0, 18) + "..." : item.name,
            fullName: item.name,
            category: cat.childCategory,
            subLabel,
            highlighted: false,
          },
        });

        edges.push({
          id: `edge-${categoryId}-${itemId}`,
          source: categoryId,
          target: itemId,
          type: "smoothstep",
          style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
        });
      });

      if (hasMore) {
        const moreId = `${cat.key}-more`;
        const moreY = pos.itemsStartY + itemsToShow.length * (ITEM_NODE_HEIGHT + ITEM_GAP);
        
        nodes.push({
          id: moreId,
          type: "item",
          position: { x: ITEM_X, y: moreY },
          data: {
            id: moreId,
            label: `+${cat.items.length - MAX_ITEMS} more`,
            category: cat.childCategory,
            subLabel: "",
            highlighted: false,
          },
        });
        
        edges.push({
          id: `edge-${categoryId}-${moreId}`,
          source: categoryId,
          target: moreId,
          type: "smoothstep",
          style: { stroke: "#e2e8f0", strokeWidth: 1.5, strokeDasharray: "4 2" },
        });
      }
    }
  });

  return { nodes, edges };
}

function ImpactCanvasInner({ processName, dependencies }: ImpactCanvasProps) {
  const { fitView } = useReactFlow();
  const [expanded, setExpanded] = useState<ExpandedState>({
    itAssets: true,
    vendors: false,
    processes: false,
    branches: false,
  });

  const { nodes: generatedNodes, edges: generatedEdges } = useMemo(() => {
    return generateMindMapData(processName, dependencies, expanded);
  }, [processName, dependencies, expanded]);

  const [nodes, setNodes, onNodesChange] = useNodesState(generatedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(generatedEdges);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateMindMapData(processName, dependencies, expanded);
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.1, duration: 250 }), 50);
  }, [expanded, processName, dependencies, setNodes, setEdges, fitView]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "category") {
        const categoryKey = node.id.replace("cat-", "") as keyof ExpandedState;
        setExpanded(prev => ({
          ...prev,
          [categoryKey]: !prev[categoryKey],
        }));
      } else {
        const connectedNodes = new Set<string>([node.id]);
        edges.forEach((edge) => {
          if (edge.source === node.id) connectedNodes.add(edge.target);
          if (edge.target === node.id) connectedNodes.add(edge.source);
        });

        if (node.type === "item") {
          const parentEdge = edges.find(e => e.target === node.id);
          if (parentEdge) {
            connectedNodes.add(parentEdge.source);
            connectedNodes.add("root");
          }
        }

        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, highlighted: connectedNodes.has(n.id) },
          }))
        );

        setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            animated: connectedNodes.has(e.source) && connectedNodes.has(e.target),
            style: {
              ...e.style,
              stroke: connectedNodes.has(e.source) && connectedNodes.has(e.target) ? "#3b82f6" : e.style?.stroke || "#94a3b8",
              strokeWidth: connectedNodes.has(e.source) && connectedNodes.has(e.target) ? 2.5 : e.style?.strokeWidth || 1.5,
            },
          }))
        );
      }
    },
    [edges, setNodes, setEdges]
  );

  const handleResetView = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, highlighted: false } }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated: false,
        style: {
          ...e.style,
          stroke: e.id.includes("root") ? "#94a3b8" : "#cbd5e1",
          strokeWidth: e.id.includes("root") ? 2 : 1.5,
        },
      }))
    );
    setTimeout(() => fitView({ padding: 0.1 }), 50);
  }, [fitView, setNodes, setEdges]);

  const handleExpandAll = useCallback(() => {
    setExpanded({ itAssets: true, vendors: true, processes: true, branches: true });
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpanded({ itAssets: false, vendors: false, processes: false, branches: false });
  }, []);

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-slate-50 to-white border border-[#e2e8f0] rounded-md mb-6" data-testid="impact-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#f1f5f9" gap={20} />
        <Controls
          showInteractive={false}
          className="!left-2 !bottom-2 !shadow-sm"
        />
      </ReactFlow>
      <div className="absolute top-3 right-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExpandAll}
          className="gap-1 bg-white shadow-sm text-xs"
          data-testid="button-expand-all"
        >
          <Plus className="w-3 h-3" />
          Expand
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCollapseAll}
          className="gap-1 bg-white shadow-sm text-xs"
          data-testid="button-collapse-all"
        >
          <Minus className="w-3 h-3" />
          Collapse
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetView}
          className="gap-1 bg-white shadow-sm text-xs"
          data-testid="button-reset-view"
        >
          <RefreshCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>
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
