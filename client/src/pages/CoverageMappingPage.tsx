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
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus, Info, Filter, MoreHorizontal } from "lucide-react";
import { EntityDetailPanel, EntityDetails, generateEntityDetails } from "@/components/inventory/EntityDetailPanel";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import {
  getWorkspaceViewConfig,
  buildCoverageNodes,
  buildCoverageEdges,
} from "@/config/inventoryMappingConfig";

interface GroupNodeData {
  label: string;
  items: { id: string; label: string; highlighted?: boolean }[];
  headerColor: string;
  column: "left" | "right";
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
            onClick={() => data.onItemClick?.(item.id, item.label, id)}
            data-testid={`item-${item.id}`}
          >
            {item.label}
            {data.column === "left" && (
              <Handle
                type="source"
                position={Position.Right}
                id={`source-${item.id}`}
                className="!w-2 !h-2 !bg-[#266C92] !border-0 !right-[-4px]"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              />
            )}
            {data.column === "right" && (
              <Handle
                type="target"
                position={Position.Left}
                id={`target-${item.id}`}
                className="!w-2 !h-2 !bg-[#266C92] !border-0 !left-[-4px]"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = {
  groupNode: GroupNode,
};

export default function CoverageMappingPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);

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
    () => buildCoverageNodes(config.coverage, handleItemClick),
    [config, handleItemClick]
  );

  const initialEdges = useMemo(
    () => buildCoverageEdges(config.coverage),
    [config]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [config]);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-lg font-semibold" data-testid="text-page-title">Coverage Mapping</h1>
          <Button variant="ghost" size="icon" data-testid="button-coverage-more">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <div className="mx-6 mt-4 mb-2">
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {config.coverage.banner.title}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                {config.coverage.banner.subtitle}
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
            connectionLineType={ConnectionLineType.Bezier}
            defaultEdgeOptions={{
              type: "default",
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
