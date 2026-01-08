import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineType,
  Handle,
  Position,
  NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, MoreHorizontal } from "lucide-react";
import { EntityDetailPanel, EntityDetails, generateEntityDetails } from "@/components/inventory/EntityDetailPanel";

interface ColumnNodeData {
  label: string;
  items: { id: string; label: string; highlighted?: boolean }[];
  headerColor: string;
  onItemClick?: (itemId: string, itemLabel: string, groupType: string) => void;
}

function ColumnNode({ data, id }: { data: ColumnNodeData; id: string }) {
  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-visible"
      style={{ minWidth: 160, maxWidth: 180 }}
    >
      <div 
        className="flex items-center justify-between px-3 py-2 rounded-t-lg"
        style={{ backgroundColor: data.headerColor }}
      >
        <span className="text-white text-xs font-medium">{data.label}</span>
        <button className="w-4 h-4 rounded bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
          <Plus className="w-3 h-3 text-white" />
        </button>
      </div>
      <div className="p-1.5 space-y-0.5">
        {data.items.map((item) => (
          <div 
            key={item.id}
            className={`relative px-2.5 py-1.5 text-xs rounded transition-colors cursor-pointer ${
              item.highlighted 
                ? "bg-[#266C92]/15 text-[#266C92] dark:bg-[#266C92]/25 dark:text-[#4a9bc7] font-medium border border-[#266C92]/30" 
                : "bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={() => data.onItemClick?.(item.id, item.label, id)}
            data-testid={`item-${item.id}`}
          >
            <span className="line-clamp-1">{item.label}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`source-${item.id}`}
              className="!w-1.5 !h-1.5 !bg-[#266C92] !border-0 !right-[-3px]"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
            <Handle
              type="target"
              position={Position.Left}
              id={`target-${item.id}`}
              className="!w-1.5 !h-1.5 !bg-[#266C92] !border-0 !left-[-3px]"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = {
  columnNode: ColumnNode,
};

const TEAL = "#266C92";
const PURPLE = "#7c3aed";
const MAGENTA = "#a855f7";

export default function AllInventoryPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleItemClick = useCallback((itemId: string, itemLabel: string, groupType: string) => {
    const details = generateEntityDetails(itemId, itemLabel, groupType);
    setSelectedEntity(details);
  }, []);

  const inventoryNodes: Node[] = [
    {
      id: "locations",
      type: "columnNode",
      position: { x: 0, y: 0 },
      data: {
        label: "Locations",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "north-america", label: "North America" },
          { id: "united-states", label: "United States" },
          { id: "mexico", label: "Mexico" },
          { id: "canada", label: "Canada" },
          { id: "europe", label: "Europe" },
          { id: "germany", label: "Germany" },
          { id: "france", label: "France" },
          { id: "united-kingdom", label: "United Kingdom" },
          { id: "asia-pacific", label: "Asia-Pacific", highlighted: true },
          { id: "singapore", label: "Singapore", highlighted: true },
        ],
      },
    },
    {
      id: "legal-entities",
      type: "columnNode",
      position: { x: 200, y: 0 },
      data: {
        label: "Legal Entities",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "evergrow-logistics", label: "Evergrow Logistics" },
          { id: "climatecare-ventures", label: "ClimateCare Ventures" },
          { id: "nuharvest-innovations", label: "NuHarvest Innovations" },
          { id: "suncoast-foods", label: "SunCoast Foods" },
          { id: "greenfoods-holdings", label: "GreenFoods Holdings" },
          { id: "agri-hub", label: "Agri-Hub Distributors" },
          { id: "sea-foodsource", label: "SEA FoodSource", highlighted: true },
        ],
      },
    },
    {
      id: "facilities",
      type: "columnNode",
      position: { x: 400, y: 0 },
      data: {
        label: "Facilities",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "us-west-agri", label: "US-West Agri" },
          { id: "us-mid-pro", label: "US-Mid Pro" },
          { id: "us-south-pack", label: "US-South Pack" },
          { id: "us-east-dist", label: "US-East Dist" },
          { id: "ca-se-propack", label: "CA-SE Pro/Pack" },
          { id: "mx-central-farm", label: "MX-Central Farm" },
          { id: "mx-south-hub", label: "MX-South Hub" },
          { id: "de-north-euro", label: "DE-North Euro" },
          { id: "fr-south-green", label: "FR-South Green" },
          { id: "uk-central-hub", label: "UK-Central Hub" },
          { id: "uk-innovation", label: "UK-Innovation" },
          { id: "se-east-bio", label: "SE-East Bio", highlighted: true },
          { id: "se-west-hq", label: "SE-West HQ", highlighted: true },
        ],
      },
    },
    {
      id: "product-lines",
      type: "columnNode",
      position: { x: 600, y: 0 },
      data: {
        label: "Product Lines",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "beverages", label: "Beverages" },
          { id: "frozen-foods", label: "Frozen Foods" },
          { id: "plant-based-proteins", label: "Plant-Based Proteins" },
          { id: "dairy-products", label: "Dairy Products" },
          { id: "meat-processing", label: "Meat Processing" },
          { id: "packaged-goods", label: "Packaged Goods" },
          { id: "cereals-grains", label: "Cereals & Grains" },
          { id: "organic-vegetables", label: "Organic Vegetables" },
          { id: "algae-proteins", label: "Algae-Based Proteins", highlighted: true },
          { id: "hydro-microgreens", label: "Hydro Microgreens", highlighted: true },
          { id: "seafood-alternatives", label: "Seafood Alternatives", highlighted: true },
        ],
      },
    },
    {
      id: "teams",
      type: "columnNode",
      position: { x: 800, y: 0 },
      data: {
        label: "Teams",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "sourcing-supply", label: "Sourcing & Supply", highlighted: true },
          { id: "sustainability", label: "Sustainability", highlighted: true },
          { id: "food-safety", label: "Food Safety", highlighted: true },
          { id: "distribution", label: "Distribution", highlighted: true },
          { id: "operations", label: "Operations", highlighted: true },
          { id: "corporate", label: "Corporate", highlighted: true },
        ],
      },
    },
    {
      id: "it-systems",
      type: "columnNode",
      position: { x: 1000, y: 0 },
      data: {
        label: "IT Systems",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "sap", label: "SAP" },
          { id: "oracle-fusion", label: "Oracle Fusion", highlighted: true },
          { id: "salesforce", label: "Salesforce" },
          { id: "azure-sql", label: "Azure SQL Database..." },
          { id: "bpc", label: "BPC" },
          { id: "firebase", label: "Firebase Realtime Da...", highlighted: true },
          { id: "jd-tableau", label: "JD Tableau" },
          { id: "zapier", label: "Zapier Automations" },
        ],
      },
    },
  ];

  const productLines = ["beverages", "frozen-foods", "plant-based-proteins", "dairy-products", "meat-processing", "packaged-goods", "cereals-grains", "organic-vegetables", "algae-proteins", "hydro-microgreens", "seafood-alternatives"];
  const teams = ["sourcing-supply", "sustainability", "food-safety", "distribution", "operations", "corporate"];
  const itSystems = ["sap", "oracle-fusion", "salesforce", "azure-sql", "bpc", "firebase", "jd-tableau", "zapier"];
  
  const edgeColors = [TEAL, PURPLE, MAGENTA, "#94a3b8"];
  
  const generateProductToTeamEdges = (): Edge[] => {
    const edges: Edge[] = [];
    productLines.forEach((pl, pIdx) => {
      teams.forEach((team, tIdx) => {
        const colorIdx = (pIdx + tIdx) % edgeColors.length;
        const isHighlighted = pl.includes("algae") || pl.includes("hydro") || pl.includes("seafood");
        edges.push({
          id: `e-pl-${pl}-team-${team}`,
          source: "product-lines",
          sourceHandle: `source-${pl}`,
          target: "teams",
          targetHandle: `target-${team}`,
          type: "smoothstep",
          style: { stroke: edgeColors[colorIdx], strokeWidth: isHighlighted ? 2 : 1.2, opacity: isHighlighted ? 1 : 0.6 },
          animated: false,
        });
      });
    });
    return edges;
  };

  const generateTeamToITEdges = (): Edge[] => {
    const edges: Edge[] = [];
    teams.forEach((team, tIdx) => {
      itSystems.forEach((sys, sIdx) => {
        const colorIdx = (tIdx + sIdx) % edgeColors.length;
        const isHighlighted = sys === "oracle-fusion" || sys === "firebase";
        edges.push({
          id: `e-team-${team}-it-${sys}`,
          source: "teams",
          sourceHandle: `source-${team}`,
          target: "it-systems",
          targetHandle: `target-${sys}`,
          type: "smoothstep",
          style: { stroke: edgeColors[colorIdx], strokeWidth: isHighlighted ? 2 : 1.2, opacity: isHighlighted ? 1 : 0.6 },
          animated: false,
        });
      });
    });
    return edges;
  };

  const generateReverseEdges = (): Edge[] => {
    const edges: Edge[] = [];
    
    // Teams → Product Lines (reverse: 6 teams × 11 product lines = 66 edges)
    teams.forEach((team, tIdx) => {
      productLines.forEach((pl, pIdx) => {
        const colorIdx = (tIdx + pIdx) % edgeColors.length;
        edges.push({
          id: `e-rev-team-${team}-pl-${pl}`,
          source: "teams",
          sourceHandle: `source-${team}`,
          target: "product-lines",
          targetHandle: `target-${pl}`,
          type: "smoothstep",
          style: { stroke: edgeColors[colorIdx], strokeWidth: 1, opacity: 0.35 },
          animated: false,
        });
      });
    });

    // IT Systems → Teams (reverse: 8 IT systems × 6 teams = 48 edges)
    itSystems.forEach((sys, sIdx) => {
      teams.forEach((team, tIdx) => {
        const colorIdx = (sIdx + tIdx) % edgeColors.length;
        edges.push({
          id: `e-rev-it-${sys}-team-${team}`,
          source: "it-systems",
          sourceHandle: `source-${sys}`,
          target: "teams",
          targetHandle: `target-${team}`,
          type: "smoothstep",
          style: { stroke: edgeColors[colorIdx], strokeWidth: 1, opacity: 0.35 },
          animated: false,
        });
      });
    });

    return edges;
  };

  const inventoryEdges: Edge[] = [
    { id: "e-ap-sea", source: "locations", sourceHandle: "source-asia-pacific", target: "legal-entities", targetHandle: "target-sea-foodsource", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e-sg-sea", source: "locations", sourceHandle: "source-singapore", target: "legal-entities", targetHandle: "target-sea-foodsource", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e-sea-se1", source: "legal-entities", sourceHandle: "source-sea-foodsource", target: "facilities", targetHandle: "target-se-east-bio", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e-sea-se2", source: "legal-entities", sourceHandle: "source-sea-foodsource", target: "facilities", targetHandle: "target-se-west-hq", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e-se1-algae", source: "facilities", sourceHandle: "source-se-east-bio", target: "product-lines", targetHandle: "target-algae-proteins", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e-se1-hydro", source: "facilities", sourceHandle: "source-se-east-bio", target: "product-lines", targetHandle: "target-hydro-microgreens", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e-se2-seafood", source: "facilities", sourceHandle: "source-se-west-hq", target: "product-lines", targetHandle: "target-seafood-alternatives", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    ...generateProductToTeamEdges(),
    ...generateTeamToITEdges(),
    ...generateReverseEdges(),
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(inventoryNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(inventoryEdges);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">All Inventory</h1>
          </div>
          <Button variant="ghost" size="icon" data-testid="button-inventory-more">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-6 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent p-0 h-auto gap-6 border-b border-transparent">
              <TabsTrigger 
                value="overview" 
                className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium"
                data-testid="tab-overview"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="locations" 
                className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-slate-500"
                data-testid="tab-locations"
              >
                Locations
              </TabsTrigger>
              <TabsTrigger 
                value="legal-entities" 
                className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-slate-500"
                data-testid="tab-legal-entities"
              >
                Legal Entities
              </TabsTrigger>
              <TabsTrigger 
                value="facilities" 
                className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-slate-500"
                data-testid="tab-facilities"
              >
                Facilities
              </TabsTrigger>
              <TabsTrigger 
                value="product-lines" 
                className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-slate-500"
                data-testid="tab-product-lines"
              >
                Product Lines
              </TabsTrigger>
              <TabsTrigger 
                value="teams" 
                className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-slate-500"
                data-testid="tab-teams"
              >
                Teams
              </TabsTrigger>
              <TabsTrigger 
                value="it-systems" 
                className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-slate-500"
                data-testid="tab-it-systems"
              >
                IT Systems
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="px-6 py-3">
          <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-add-filter">
            <Filter className="w-3.5 h-3.5" />
            Add Filter
          </Button>
        </div>

        <div className={`flex-1 mx-6 mb-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 overflow-hidden transition-all ${selectedEntity ? 'mr-[440px]' : ''}`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { strokeWidth: 2 },
            }}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.4}
            maxZoom={1.5}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Background color="#e2e8f0" gap={20} size={1} />
            <Controls 
              showInteractive={false}
              className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 !shadow-sm"
            />
          </ReactFlow>
        </div>
      </div>

      <EntityDetailPanel 
        entity={selectedEntity} 
        onClose={() => setSelectedEntity(null)}
        onNavigate={(id) => {
          console.log("Navigate to:", id);
        }}
      />
    </AppLayout>
  );
}
