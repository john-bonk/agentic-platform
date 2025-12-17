/**
 * Node Palette Component
 * 
 * Displays available node types organized by category for drag-and-drop
 */

import { useState } from "react";
import { 
  Play, Square, User, CheckCircle, GitBranch, GitFork, Clock,
  Shuffle, Globe, AlertTriangle, Shield, AlertCircle, Briefcase,
  Mail, MessageSquare, Users, Database, Bot, Layers, AlertOctagon,
  Webhook, Calendar, ChevronDown, ChevronRight, Search, GripVertical
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  type NodeTypeDefinition, 
  type NodeTypeFamily,
  getNodeTypesByFamily 
} from "@shared/schema";

const iconMap: Record<string, typeof Play> = {
  Play, Square, User, CheckCircle, GitBranch, GitFork, Clock,
  Shuffle, Globe, AlertTriangle, Shield, AlertCircle, Briefcase,
  Mail, MessageSquare, Users, Database, Bot, Layers, AlertOctagon,
  Webhook, Calendar,
};

const familyLabels: Record<NodeTypeFamily, string> = {
  trigger: "Triggers",
  action: "Actions",
  logic: "Logic & Flow",
  integration: "Integrations",
  auditboard: "AuditBoard",
  communication: "Communication",
  data: "Data Operations",
  utility: "Utilities",
};

const familyOrder: NodeTypeFamily[] = [
  "trigger",
  "action",
  "logic",
  "auditboard",
  "integration",
  "communication",
  "data",
  "utility",
];

interface NodePaletteItemProps {
  nodeType: NodeTypeDefinition;
  onDragStart: (e: React.DragEvent, nodeType: NodeTypeDefinition) => void;
}

function NodePaletteItem({ nodeType, onDragStart }: NodePaletteItemProps) {
  const IconComponent = iconMap[nodeType.icon] || Square;
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, nodeType)}
      className="flex items-center gap-2 p-2 rounded-md cursor-grab hover-elevate active-elevate-2 border border-transparent hover:border-border transition-colors"
      data-testid={`palette-node-${nodeType.id}`}
    >
      <GripVertical className="w-3 h-3 text-muted-foreground" />
      <div 
        className="w-6 h-6 rounded flex items-center justify-center"
        style={{ backgroundColor: nodeType.color + "20" }}
      >
        <IconComponent 
          className="w-3.5 h-3.5" 
          style={{ color: nodeType.color }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{nodeType.name}</p>
      </div>
    </div>
  );
}

interface NodePaletteProps {
  onDragStart: (e: React.DragEvent, nodeType: NodeTypeDefinition) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFamilies, setExpandedFamilies] = useState<Set<NodeTypeFamily>>(
    new Set<NodeTypeFamily>(["trigger", "action", "logic", "auditboard"])
  );
  
  const nodeTypesByFamily = getNodeTypesByFamily();
  
  const filteredTypes = searchQuery.trim()
    ? Object.fromEntries(
        Object.entries(nodeTypesByFamily).map(([family, types]) => [
          family,
          types.filter(
            (t) =>
              t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.description.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        ])
      )
    : nodeTypesByFamily;

  const toggleFamily = (family: NodeTypeFamily) => {
    setExpandedFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(family)) {
        next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold mb-2">Node Palette</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
            data-testid="input-node-search"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {familyOrder.map((family) => {
            const types = filteredTypes[family] || [];
            if (types.length === 0) return null;
            
            const isExpanded = expandedFamilies.has(family);
            
            return (
              <Collapsible
                key={family}
                open={isExpanded}
                onOpenChange={() => toggleFamily(family)}
                className="mb-1"
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-md hover-elevate text-left">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {familyLabels[family]}
                  </span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {types.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-2">
                  {types.map((nodeType) => (
                    <NodePaletteItem
                      key={nodeType.id}
                      nodeType={nodeType}
                      onDragStart={onDragStart}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
