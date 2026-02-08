import { useCallback, useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
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
import { useSideNavStore } from "@/lib/sideNavStore";
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
  nodeWidth?: number;
  connectedItemIds?: Set<string>;
  onItemClick?: (itemId: string, itemLabel: string, groupType: string) => void;
  onItemHover?: (itemId: string) => void;
  onItemLeave?: () => void;
}

function GroupNode({ data, id }: { data: GroupNodeData; id: string }) {
  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-visible"
      style={{ width: data.nodeWidth ?? 200, minWidth: data.nodeWidth ?? 200 }}
    >
      <div 
        className="flex items-center justify-between px-3 py-2 rounded-t-lg"
        style={{ backgroundColor: data.headerColor, opacity: 0.82 }}
      >
        <span className="text-white text-xs font-medium">{data.label}</span>
        <button className="w-4 h-4 rounded bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
          <Plus className="w-3 h-3 text-white" />
        </button>
      </div>
      <div className="p-1.5 space-y-0.5">
        {data.items.map((item) => {
          const isConnected = data.connectedItemIds?.has(item.id);
          return (
            <div 
              key={item.id}
              className={`relative px-2.5 py-1.5 text-xs rounded cursor-pointer ${
                item.highlighted 
                  ? "bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4a9bc7] font-medium" 
                  : "bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
              }`}
              style={{ transition: 'background-color 0.2s ease, color 0.2s ease' }}
              onMouseEnter={(e) => {
                if (isConnected) {
                  e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.15)';
                  e.currentTarget.style.color = '#7c3aed';
                  data.onItemHover?.(item.id);
                }
              }}
              onMouseLeave={(e) => {
                if (isConnected) {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                  data.onItemLeave?.();
                }
              }}
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
          );
        })}
      </div>
    </div>
  );
}

const nodeTypes = {
  groupNode: GroupNode,
};

function CoverageMappingFlow() {
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const { fitView } = useReactFlow();

  const { currentWorkspace } = useWorkspaceStore();
  const { isCollapsed } = useSideNavStore();

  const handleItemClick = useCallback((itemId: string, itemLabel: string, groupType: string) => {
    const details = generateEntityDetails(itemId, itemLabel, groupType);
    setSelectedEntity(details);
  }, []);

  const onItemHover = useCallback((itemId: string) => setHoveredItemId(itemId), []);
  const onItemLeave = useCallback(() => setHoveredItemId(null), []);

  const config = useMemo(
    () => getWorkspaceViewConfig(currentWorkspace.id, currentWorkspace.isCustom),
    [currentWorkspace.id, currentWorkspace.isCustom]
  );

  const connectedItemIds = useMemo(() => {
    const ids = new Set<string>();
    config.coverage.edges.forEach((e) => {
      const srcId = e.sourceHandle.replace("source-", "");
      const tgtId = e.targetHandle.replace("target-", "");
      ids.add(srcId);
      ids.add(tgtId);
    });
    return ids;
  }, [config]);

  const initialNodes = useMemo(
    () => buildCoverageNodes(config.coverage, handleItemClick).map((n) => ({
      ...n,
      data: { ...n.data, connectedItemIds, onItemHover, onItemLeave },
    })),
    [config, handleItemClick, connectedItemIds, onItemHover, onItemLeave]
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

  useEffect(() => {
    if (hoveredItemId) {
      setEdges((eds) =>
        eds.map((e) => {
          const srcId = e.sourceHandle?.replace("source-", "");
          const tgtId = e.targetHandle?.replace("target-", "");
          const isRelated = srcId === hoveredItemId || tgtId === hoveredItemId;
          return {
            ...e,
            style: {
              ...e.style,
              stroke: isRelated ? '#7c3aed' : '#266C92',
              strokeWidth: isRelated ? 2.5 : 2,
            },
          };
        })
      );
    } else {
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          style: { ...e.style, stroke: '#266C92', strokeWidth: 2 },
        }))
      );
    }
  }, [hoveredItemId, setEdges]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 350);
    return () => clearTimeout(timer);
  }, [isCollapsed, selectedEntity, fitView]);

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
          <div className="flex items-start gap-3 px-4 py-3 bg-[#266C92]/8 dark:bg-[#266C92]/15 border border-[#266C92]/20 dark:border-[#266C92]/30 rounded-lg">
            <Info className="w-5 h-5 text-[#266C92] dark:text-[#4a9bc7] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#1a4f6e] dark:text-[#7ec0e0]">
                {config.coverage.banner.title}
              </p>
              <p className="text-xs text-[#266C92] dark:text-[#4a9bc7] mt-0.5">
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

export default function CoverageMappingPage() {
  return (
    <ReactFlowProvider>
      <CoverageMappingFlow />
    </ReactFlowProvider>
  );
}
