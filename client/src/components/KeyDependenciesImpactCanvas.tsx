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
  
  return <FaBuilding className="w-4 h-4 text-purple-500" />;
};

const getCategoryIcon = (category: CategoryType) => {
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

const getCategoryColors = (category: CategoryType, isHighlighted: boolean) => {
  if (isHighlighted) return { border: "border-blue-500", bg: "bg-blue-50", iconBg: "bg-blue-100" };
  switch (category) {
    case "root":
      return { border: "border-orange-400", bg: "bg-orange-50", iconBg: "bg-orange-100" };
    case "category":
      return { border: "border-gray-300", bg: "bg-gray-50", iconBg: "bg-gray-100" };
    case "itAsset":
      return { border: "border-blue-300", bg: "bg-blue-50/70", iconBg: "bg-blue-100" };
    case "vendor":
      return { border: "border-purple-300", bg: "bg-purple-50/70", iconBg: "bg-purple-100" };
    case "process":
      return { border: "border-teal-300", bg: "bg-teal-50/70", iconBg: "bg-teal-100" };
    case "branch":
      return { border: "border-green-300", bg: "bg-green-50/70", iconBg: "bg-green-100" };
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
      <Handle type="source" position={Position.Right} className="!bg-orange-400 !w-3 !h-3" />
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
          <Globe className="w-5 h-5 text-orange-500" />
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

interface CategoryConfig {
  key: string;
  label: string;
  items: GenericItem[];
  childCategory: string;
}

interface BlockMeasurement {
  category: CategoryConfig;
  isExpanded: boolean;
  visibleItemCount: number;
  hasMore: boolean;
  blockHeight: number;
  categoryY: number;
  itemsStartY: number;
}

function generateMindMapData(
  processName: string, 
  dependencies: ImpactCanvasProps["dependencies"],
  expanded: ExpandedState
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const CATEGORY_NODE_HEIGHT = 48;
  const ITEM_NODE_HEIGHT = 44;
  const ITEM_VERTICAL_GAP = 12;
  const CATEGORY_VERTICAL_GAP = 32;
  const HORIZONTAL_GAP_BASE = 220;
  const MAX_VISIBLE_ITEMS = 5;
  const ROOT_NODE_HEIGHT = 60;

  const categories: CategoryConfig[] = [
    { key: "itAssets", label: "IT Assets", items: (dependencies.itAssets || []) as unknown as GenericItem[], childCategory: "itAsset" },
    { key: "vendors", label: "Vendors", items: (dependencies.vendors || []) as unknown as GenericItem[], childCategory: "vendor" },
    { key: "processes", label: "Business Processes", items: (dependencies.businessProcesses || []) as unknown as GenericItem[], childCategory: "process" },
    { key: "branches", label: "Locations", items: (dependencies.branches || []) as unknown as GenericItem[], childCategory: "branch" },
  ].filter(cat => cat.items.length > 0);

  const measurements: BlockMeasurement[] = categories.map(cat => {
    const isExpanded = expanded[cat.key as keyof ExpandedState];
    const visibleItemCount = isExpanded ? Math.min(cat.items.length, MAX_VISIBLE_ITEMS) : 0;
    const hasMore = isExpanded && cat.items.length > MAX_VISIBLE_ITEMS;
    const totalItemsShown = visibleItemCount + (hasMore ? 1 : 0);
    
    let blockHeight: number;
    if (isExpanded && totalItemsShown > 0) {
      blockHeight = totalItemsShown * ITEM_NODE_HEIGHT + (totalItemsShown - 1) * ITEM_VERTICAL_GAP;
      blockHeight = Math.max(blockHeight, CATEGORY_NODE_HEIGHT);
    } else {
      blockHeight = CATEGORY_NODE_HEIGHT;
    }

    return {
      category: cat,
      isExpanded,
      visibleItemCount,
      hasMore,
      blockHeight,
      categoryY: 0,
      itemsStartY: 0,
    };
  });

  let totalHeight = 0;
  measurements.forEach((m, idx) => {
    m.categoryY = totalHeight + m.blockHeight / 2 - CATEGORY_NODE_HEIGHT / 2;
    m.itemsStartY = totalHeight;
    totalHeight += m.blockHeight;
    if (idx < measurements.length - 1) {
      totalHeight += CATEGORY_VERTICAL_GAP;
    }
  });

  const rootY = (totalHeight - ROOT_NODE_HEIGHT) / 2;
  
  nodes.push({
    id: "root",
    type: "root",
    position: { x: 0, y: rootY },
    data: {
      id: "root",
      label: processName,
      highlighted: false,
    },
  });

  measurements.forEach((m) => {
    const categoryId = `cat-${m.category.key}`;

    nodes.push({
      id: categoryId,
      type: "category",
      position: { x: HORIZONTAL_GAP_BASE, y: m.categoryY },
      data: {
        id: categoryId,
        label: m.category.label,
        childCategory: m.category.childCategory,
        expanded: m.isExpanded,
        count: m.category.items.length,
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

    if (m.isExpanded) {
      const itemsToShow = m.category.items.slice(0, MAX_VISIBLE_ITEMS);
      const totalItemsShown = itemsToShow.length + (m.hasMore ? 1 : 0);
      
      itemsToShow.forEach((item, itemIdx) => {
        const itemId = `${m.category.key}-${itemIdx}`;
        const itemY = m.itemsStartY + itemIdx * (ITEM_NODE_HEIGHT + ITEM_VERTICAL_GAP);

        let subLabel = "";
        if (m.category.childCategory === "branch" && "type" in item) {
          subLabel = String(item.type || "");
        } else if (m.category.childCategory === "process" && "rto" in item) {
          subLabel = `RTO: ${String(item.rto || "")}`;
        } else if (m.category.childCategory === "itAsset") {
          subLabel = "IT Asset";
        } else if (m.category.childCategory === "vendor") {
          subLabel = "Vendor";
        }

        nodes.push({
          id: itemId,
          type: "item",
          position: { x: HORIZONTAL_GAP_BASE * 2, y: itemY },
          data: {
            id: itemId,
            label: item.name.length > 20 ? item.name.substring(0, 18) + "..." : item.name,
            fullName: item.name,
            category: m.category.childCategory,
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

      if (m.hasMore) {
        const moreId = `${m.category.key}-more`;
        const moreY = m.itemsStartY + itemsToShow.length * (ITEM_NODE_HEIGHT + ITEM_VERTICAL_GAP);
        
        nodes.push({
          id: moreId,
          type: "item",
          position: { x: HORIZONTAL_GAP_BASE * 2, y: moreY },
          data: {
            id: moreId,
            label: `+${m.category.items.length - MAX_VISIBLE_ITEMS} more`,
            category: m.category.childCategory,
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
    setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 100);
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
    setTimeout(() => fitView({ padding: 0.15 }), 50);
  }, [fitView, setNodes, setEdges]);

  const handleExpandAll = useCallback(() => {
    setExpanded({ itAssets: true, vendors: true, processes: true, branches: true });
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpanded({ itAssets: false, vendors: false, processes: false, branches: false });
  }, []);

  return (
    <div className="relative w-full h-[380px] bg-gradient-to-br from-slate-50 to-white border border-[#e2e8f0] rounded-md mb-6" data-testid="impact-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
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
