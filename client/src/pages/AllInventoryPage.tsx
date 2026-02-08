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
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Building2, Package, Users, Server, Plus, Filter, MoreHorizontal, Search, ChevronRight, Circle } from "lucide-react";
import { EntityDetailPanel, EntityDetails, generateEntityDetails } from "@/components/inventory/EntityDetailPanel";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import { useSideNavStore } from "@/lib/sideNavStore";
import {
  getWorkspaceViewConfig,
  buildInventoryNodes,
  buildInventoryEdges,
  InventoryColumnItem,
} from "@/config/inventoryMappingConfig";

const columnIcons: Record<string, typeof Building2> = {
  "locations": MapPin,
  "legal-entities": Building2,
  "facilities": Building2,
  "product-lines": Package,
  "teams": Users,
  "it-systems": Server,
};

interface ColumnNodeData {
  label: string;
  items: { id: string; label: string; highlighted?: boolean }[];
  headerColor: string;
  connectedItemIds?: Set<string>;
  onItemClick?: (itemId: string, itemLabel: string, groupType: string) => void;
  onItemHover?: (itemId: string) => void;
  onItemLeave?: () => void;
}

function ColumnNode({ data, id }: { data: ColumnNodeData; id: string }) {
  const Icon = columnIcons[id] || Building2;
  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-visible"
      style={{ minWidth: 160, maxWidth: 180 }}
    >
      <div 
        className="flex items-center justify-between px-3 py-2 rounded-t-lg"
        style={{ backgroundColor: data.headerColor, opacity: 0.82 }}
      >
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-white/90" />
          <span className="text-white text-xs font-medium">{data.label}</span>
        </div>
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
                  ? "bg-[#266C92]/15 text-[#266C92] dark:bg-[#266C92]/25 dark:text-[#4a9bc7] font-medium border border-[#266C92]/30" 
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
          );
        })}
      </div>
    </div>
  );
}

const nodeTypes = {
  columnNode: ColumnNode,
};

const columnTypeLabels: Record<string, string> = {
  "locations": "Location",
  "legal-entities": "Legal Entity",
  "facilities": "Facility",
  "product-lines": "Product Line",
  "teams": "Team",
  "it-systems": "IT System",
};

const statusOptions = ["Active", "In Review", "Pending", "New"];
const getStatusForItem = (id: string) => {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return statusOptions[hash % statusOptions.length];
};

const statusBadgeStyles: Record<string, string> = {
  "Active": "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  "In Review": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "Pending": "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  "New": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
};

interface InventoryListViewProps {
  columnId: string;
  columnLabel: string;
  items: InventoryColumnItem[];
  connectedItemIds: Set<string>;
  onItemClick: (itemId: string, itemLabel: string, groupType: string) => void;
  selectedEntityId?: string;
}

function InventoryListView({ columnId, columnLabel, items, connectedItemIds, onItemClick, selectedEntityId }: InventoryListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const Icon = columnIcons[columnId] || Building2;

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(query));
  }, [items, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${columnLabel.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
            data-testid={`input-search-${columnId}`}
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      <Card className="flex-1 overflow-hidden">
        <div className="border-b bg-muted/30">
          <div className="grid grid-cols-[1fr_120px_100px_40px] gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5" />
              <span>Name</span>
            </div>
            <div>Status</div>
            <div>Mapped</div>
            <div></div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-48px)]">
          <CardContent className="p-0">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? `No ${columnLabel.toLowerCase()} match your search` : `No ${columnLabel.toLowerCase()} found`}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredItems.map((item) => {
                  const status = getStatusForItem(item.id);
                  const isSelected = selectedEntityId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-[1fr_120px_100px_40px] gap-4 px-4 py-3 hover-elevate cursor-pointer items-center ${isSelected ? "bg-[#266C92]/5" : ""}`}
                      onClick={() => onItemClick(item.id, item.label, columnId)}
                      data-testid={`row-inventory-${item.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(38, 108, 146, 0.1)" }}>
                          <Icon className="w-4 h-4" style={{ color: "#266C92" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate" data-testid={`text-name-${item.id}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {columnTypeLabels[columnId] || columnId}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusBadgeStyles[status] || ""}`}
                          data-testid={`badge-status-${item.id}`}
                        >
                          {status}
                        </Badge>
                      </div>

                      <div>
                        {connectedItemIds.has(item.id) ? (
                          <Circle className="w-3.5 h-3.5 fill-[#266C92] text-[#266C92]" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-muted-foreground/30" />
                        )}
                      </div>

                      <div className="flex items-center justify-end">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}

function AllInventoryFlow() {
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
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
    config.inventory.edges.forEach((e) => {
      const srcId = e.sourceHandle.replace("source-", "");
      const tgtId = e.targetHandle.replace("target-", "");
      ids.add(srcId);
      ids.add(tgtId);
    });
    return ids;
  }, [config]);

  const initialNodes = useMemo(
    () => buildInventoryNodes(config.inventory, handleItemClick).map((n) => ({
      ...n,
      data: { ...n.data, connectedItemIds, onItemHover, onItemLeave },
    })),
    [config, handleItemClick, connectedItemIds, onItemHover, onItemLeave]
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
    if (activeTab === "overview") {
      const timer = setTimeout(() => {
        fitView({ padding: 0.15, duration: 300 });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed, selectedEntity, fitView, activeTab]);

  const tabLabels = useMemo(() => {
    return config.inventory.columns.map((col) => ({
      value: col.id,
      label: col.data.label,
    }));
  }, [config]);

  const activeColumn = useMemo(() => {
    if (activeTab === "overview") return null;
    return config.inventory.columns.find((col) => col.id === activeTab) || null;
  }, [activeTab, config]);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-lg font-semibold" data-testid="text-page-title">All Inventory</h1>
          <Button variant="ghost" size="icon" data-testid="button-inventory-more">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-6 pt-4">
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedEntity(null); }} className="w-full">
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

        {activeTab === "overview" ? (
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
        ) : activeColumn ? (
          <div className={`flex-1 px-6 pb-6 overflow-hidden transition-all ${selectedEntity ? 'mr-[440px]' : ''}`}>
            <InventoryListView
              columnId={activeColumn.id}
              columnLabel={activeColumn.data.label}
              items={activeColumn.data.items}
              connectedItemIds={connectedItemIds}
              onItemClick={handleItemClick}
              selectedEntityId={selectedEntity?.id}
            />
          </div>
        ) : null}
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

export default function AllInventoryPage() {
  return (
    <ReactFlowProvider>
      <AllInventoryFlow />
    </ReactFlowProvider>
  );
}
