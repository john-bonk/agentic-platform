import { useCallback, useState, useMemo, useEffect } from "react";
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
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, MoreHorizontal } from "lucide-react";
import { EntityDetailPanel, EntityDetails, generateEntityDetails } from "@/components/inventory/EntityDetailPanel";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import {
  getWorkspaceViewConfig,
  buildInventoryNodes,
  buildInventoryEdges,
} from "@/config/inventoryMappingConfig";

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

export default function AllInventoryPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();
  const { currentWorkspace } = useWorkspaceStore();

  const handleItemClick = useCallback((itemId: string, itemLabel: string, groupType: string) => {
    const details = generateEntityDetails(itemId, itemLabel, groupType);
    setSelectedEntity(details);
  }, []);

  const config = useMemo(
    () => getWorkspaceViewConfig(currentWorkspace.id, currentWorkspace.isCustom),
    [currentWorkspace.id, currentWorkspace.isCustom]
  );

  const initialNodes = useMemo(
    () => buildInventoryNodes(config.inventory, handleItemClick),
    [config, handleItemClick]
  );

  const initialEdges = useMemo(
    () => buildInventoryEdges(config.inventory),
    [config]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [config]);

  const tabLabels = useMemo(() => {
    return config.inventory.columns.map((col) => ({
      value: col.id,
      label: col.data.label,
    }));
  }, [config]);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700">
          <Tabs value="inventory" className="w-auto">
            <TabsList className="bg-transparent p-0 h-auto gap-6 border-b border-transparent">
              <TabsTrigger 
                value="inventory"
                className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-slate-500"
                data-testid="toggle-all-inventory"
              >
                All Inventory
              </TabsTrigger>
              <TabsTrigger 
                value="coverage"
                className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-slate-500"
                onClick={() => setLocation("/coverage-mapping")}
                data-testid="toggle-coverage-mapping"
              >
                Coverage Mapping
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
              {tabLabels.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-slate-500"
                  data-testid={`tab-${tab.value}`}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
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
