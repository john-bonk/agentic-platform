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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus, Info, Filter, MoreHorizontal } from "lucide-react";
import { EntityDetailPanel, EntityDetails, generateEntityDetails } from "@/components/inventory/EntityDetailPanel";

interface GroupNodeData {
  label: string;
  items: { id: string; label: string; highlighted?: boolean }[];
  headerColor: string;
  itemColor?: string;
  onItemClick?: (itemId: string, itemLabel: string, groupType: string) => void;
}

function GroupNode({ data, id }: { data: GroupNodeData; id: string }) {
  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 min-w-[200px] overflow-visible"
      style={{ minWidth: 200 }}
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
                ? "bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4a9bc7] font-medium" 
                : "bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            style={data.itemColor && item.highlighted ? { backgroundColor: `${data.itemColor}15`, color: data.itemColor } : undefined}
            onClick={() => data.onItemClick?.(item.id, item.label, id)}
            data-testid={`item-${item.id}`}
          >
            {item.label}
            <Handle
              type="source"
              position={Position.Right}
              id={`source-${item.id}`}
              className="!w-2 !h-2 !bg-[#266C92] !border-0 !right-[-4px]"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
            <Handle
              type="target"
              position={Position.Left}
              id={`target-${item.id}`}
              className="!w-2 !h-2 !bg-[#266C92] !border-0 !left-[-4px]"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = {
  groupNode: GroupNode,
};

const TEAL = "#266C92";
const PURPLE = "#7c3aed";
const MAGENTA = "#a855f7";

export default function CoverageMappingPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);

  const handleItemClick = useCallback((itemId: string, itemLabel: string, groupType: string) => {
    const details = generateEntityDetails(itemId, itemLabel, groupType);
    setSelectedEntity(details);
  }, []);

  const initialNodes: Node[] = [
    {
      id: "regulatory-frameworks",
      type: "groupNode",
      position: { x: 50, y: 50 },
      data: {
        label: "Regulatory Frameworks",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "ava-food-safety", label: "AVA Food Safety" },
        ],
      },
    },
    {
      id: "compliance-frameworks",
      type: "groupNode",
      position: { x: 50, y: 150 },
      data: {
        label: "Compliance Frameworks",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "iso-22000", label: "ISO 22000 (Food Safety)" },
          { id: "iso-14001", label: "ISO 14001 (Environmental Management)" },
          { id: "ohsas-18001", label: "OHSAS 18001 (Health & Safety)" },
        ],
      },
    },
    {
      id: "policies",
      type: "groupNode",
      position: { x: 50, y: 320 },
      data: {
        label: "Policies",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "sustainable-sourcing", label: "Sustainable Sourcing" },
        ],
      },
    },
    {
      id: "risks",
      type: "groupNode",
      position: { x: 50, y: 420 },
      data: {
        label: "Risks",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "climate-supply-disruption", label: "Climate-Related Supply Disruption" },
          { id: "food-contamination", label: "Food Contamination & Safety Incidents" },
          { id: "cybersecurity-breach", label: "Cybersecurity Breach" },
          { id: "market-volatility", label: "Market Volatility" },
        ],
      },
    },
    {
      id: "controls",
      type: "groupNode",
      position: { x: 50, y: 640 },
      data: {
        label: "Controls",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "climate-change-mitigation", label: "Climate Change Mitigation" },
          { id: "supply-chain-traceability", label: "Supply Chain Traceability" },
          { id: "regulatory-compliance-audits", label: "Regulatory Compliance Audits" },
        ],
      },
    },
    {
      id: "facilities",
      type: "groupNode",
      position: { x: 520, y: 50 },
      data: {
        label: "Facilities",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "se-east-bio", label: "SE-East Bio" },
          { id: "se-west-hq", label: "SE-West HQ" },
        ],
      },
    },
    {
      id: "product-lines",
      type: "groupNode",
      position: { x: 520, y: 170 },
      data: {
        label: "Product Lines",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "algae-based-proteins", label: "Algae-Based Proteins", highlighted: true },
          { id: "hydroponic-microgreens", label: "Hydroponic Microgreens" },
          { id: "seafood-alternatives", label: "Seafood Alternatives" },
        ],
      },
    },
    {
      id: "it-systems",
      type: "groupNode",
      position: { x: 520, y: 340 },
      data: {
        label: "IT Systems",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "supply-chain-mgmt", label: "Supply Chain Management" },
          { id: "environmental-monitoring", label: "Environmental Monitoring" },
          { id: "climate-data-analytics", label: "Climate Data Analytics" },
          { id: "hr-payroll", label: "HR & Payroll" },
        ],
      },
    },
    {
      id: "processes",
      type: "groupNode",
      position: { x: 520, y: 560 },
      data: {
        label: "Processes",
        headerColor: TEAL,
        onItemClick: handleItemClick,
        items: [
          { id: "raw-material-procurement", label: "Raw Material Procurement" },
          { id: "waste-treatment", label: "Waste Treatment & Disposal" },
          { id: "energy-consumption", label: "Energy Consumption & Monitoring" },
          { id: "water-usage", label: "Water Usage Optimization" },
        ],
      },
    },
  ];

  const initialEdges: Edge[] = [
    { id: "e1", source: "regulatory-frameworks", sourceHandle: "source-ava-food-safety", target: "facilities", targetHandle: "target-se-east-bio", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e2", source: "regulatory-frameworks", sourceHandle: "source-ava-food-safety", target: "facilities", targetHandle: "target-se-west-hq", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e3", source: "compliance-frameworks", sourceHandle: "source-iso-22000", target: "product-lines", targetHandle: "target-algae-based-proteins", type: "smoothstep", style: { stroke: PURPLE, strokeWidth: 2 }, animated: false },
    { id: "e4", source: "compliance-frameworks", sourceHandle: "source-iso-14001", target: "product-lines", targetHandle: "target-hydroponic-microgreens", type: "smoothstep", style: { stroke: MAGENTA, strokeWidth: 2 }, animated: false },
    { id: "e5", source: "compliance-frameworks", sourceHandle: "source-ohsas-18001", target: "product-lines", targetHandle: "target-seafood-alternatives", type: "smoothstep", style: { stroke: PURPLE, strokeWidth: 2 }, animated: false },
    { id: "e6", source: "policies", sourceHandle: "source-sustainable-sourcing", target: "it-systems", targetHandle: "target-supply-chain-mgmt", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e7", source: "risks", sourceHandle: "source-climate-supply-disruption", target: "it-systems", targetHandle: "target-environmental-monitoring", type: "smoothstep", style: { stroke: MAGENTA, strokeWidth: 2 }, animated: false },
    { id: "e8", source: "risks", sourceHandle: "source-food-contamination", target: "it-systems", targetHandle: "target-climate-data-analytics", type: "smoothstep", style: { stroke: PURPLE, strokeWidth: 2 }, animated: false },
    { id: "e9", source: "risks", sourceHandle: "source-cybersecurity-breach", target: "it-systems", targetHandle: "target-hr-payroll", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e10", source: "risks", sourceHandle: "source-market-volatility", target: "processes", targetHandle: "target-raw-material-procurement", type: "smoothstep", style: { stroke: MAGENTA, strokeWidth: 2 }, animated: false },
    { id: "e11", source: "controls", sourceHandle: "source-climate-change-mitigation", target: "processes", targetHandle: "target-waste-treatment", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    { id: "e12", source: "controls", sourceHandle: "source-supply-chain-traceability", target: "processes", targetHandle: "target-energy-consumption", type: "smoothstep", style: { stroke: PURPLE, strokeWidth: 2 }, animated: false },
    { id: "e13", source: "controls", sourceHandle: "source-regulatory-compliance-audits", target: "processes", targetHandle: "target-water-usage", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 2 }, animated: false },
    
    { id: "e14", source: "facilities", sourceHandle: "source-se-east-bio", target: "product-lines", targetHandle: "target-algae-based-proteins", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 1.5 }, animated: false },
    { id: "e15", source: "facilities", sourceHandle: "source-se-west-hq", target: "product-lines", targetHandle: "target-seafood-alternatives", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 1.5 }, animated: false },
    { id: "e16", source: "product-lines", sourceHandle: "source-algae-based-proteins", target: "it-systems", targetHandle: "target-supply-chain-mgmt", type: "smoothstep", style: { stroke: PURPLE, strokeWidth: 1.5 }, animated: false },
    { id: "e17", source: "product-lines", sourceHandle: "source-hydroponic-microgreens", target: "it-systems", targetHandle: "target-environmental-monitoring", type: "smoothstep", style: { stroke: MAGENTA, strokeWidth: 1.5 }, animated: false },
    { id: "e18", source: "it-systems", sourceHandle: "source-supply-chain-mgmt", target: "processes", targetHandle: "target-raw-material-procurement", type: "smoothstep", style: { stroke: TEAL, strokeWidth: 1.5 }, animated: false },
    { id: "e19", source: "it-systems", sourceHandle: "source-environmental-monitoring", target: "processes", targetHandle: "target-energy-consumption", type: "smoothstep", style: { stroke: MAGENTA, strokeWidth: 1.5 }, animated: false },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Coverage Mapping</h1>
          </div>
          <Button variant="ghost" size="icon" data-testid="button-coverage-more">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <div className="mx-6 mt-4 mb-2">
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Suggested Mapping for SEA FoodSource M&A
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                3 new risks added to library. Issues detected in 1 Compliance Framework, and 1 Control.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-6 mb-2">
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
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.5}
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
