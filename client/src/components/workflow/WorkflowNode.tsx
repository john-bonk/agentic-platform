/**
 * Custom Workflow Node Component for React Flow
 */

import { memo, useMemo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { 
  Play, Square, User, CheckCircle, GitBranch, GitFork, Clock,
  Shuffle, Globe, AlertTriangle, Shield, AlertCircle, Briefcase,
  Mail, MessageSquare, Users, Database, Bot, Layers, AlertOctagon,
  Webhook, Calendar, Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNodeType, type NodeTypeDefinition } from "@shared/schema";

const iconMap: Record<string, typeof Play> = {
  Play, Square, User, CheckCircle, GitBranch, GitFork, Clock,
  Shuffle, Globe, AlertTriangle, Shield, AlertCircle, Briefcase,
  Mail, MessageSquare, Users, Database, Bot, Layers, AlertOctagon,
  Webhook, Calendar,
};

interface WorkflowNodeData {
  label: string;
  typeId: string;
  config: Record<string, unknown>;
  onConfigure?: (nodeId: string) => void;
}

function WorkflowNodeComponent({ id, data, selected }: NodeProps<WorkflowNodeData>) {
  const nodeType = useMemo(() => getNodeType(data.typeId), [data.typeId]);
  const IconComponent = nodeType ? iconMap[nodeType.icon] || Square : Square;
  
  const isStart = data.typeId === "start";
  const isEnd = data.typeId === "end";
  const isDecision = data.typeId === "decision";
  const isParallel = data.typeId === "parallel-gateway";

  return (
    <div
      className={`
        relative min-w-[160px] max-w-[220px] rounded-lg border-2 bg-card shadow-sm
        transition-all duration-150
        ${selected ? "border-primary ring-2 ring-primary/20" : "border-border"}
      `}
      data-testid={`canvas-node-${id}`}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background"
        />
      )}
      
      <div className="p-3">
        <div className="flex items-start gap-2">
          <div 
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: nodeType?.color + "20" || "#e5e7eb" }}
          >
            <IconComponent 
              className="w-4 h-4" 
              style={{ color: nodeType?.color || "#6b7280" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{data.label}</p>
            <p className="text-xs text-muted-foreground truncate">
              {nodeType?.name || data.typeId}
            </p>
          </div>
        </div>
        
        {Object.keys(data.config).length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex flex-wrap gap-1">
              {Object.entries(data.config).slice(0, 3).map(([key, value]) => {
                let displayValue = "";
                if (typeof value === "string") {
                  displayValue = value.length > 12 ? value.slice(0, 12) + "..." : value;
                } else if (typeof value === "number" || typeof value === "boolean") {
                  displayValue = String(value);
                } else if (Array.isArray(value)) {
                  if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
                    const firstItem = value[0] as Record<string, unknown>;
                    const itemValue = firstItem.value || firstItem.field || firstItem.name || Object.values(firstItem)[0];
                    displayValue = itemValue ? `${String(itemValue).slice(0, 10)}...` : `[${value.length}]`;
                  } else if (value.length > 0) {
                    displayValue = String(value[0]).slice(0, 10) + (value.length > 1 ? `+${value.length - 1}` : "");
                  } else {
                    displayValue = "[]";
                  }
                } else if (value && typeof value === "object") {
                  const obj = value as Record<string, unknown>;
                  const meaningfulValue = obj.value || obj.status || obj.name || obj.field || Object.values(obj)[0];
                  if (meaningfulValue && typeof meaningfulValue === "string") {
                    displayValue = meaningfulValue.length > 10 ? meaningfulValue.slice(0, 10) + "..." : meaningfulValue;
                  } else if (meaningfulValue !== undefined) {
                    displayValue = String(meaningfulValue).slice(0, 10);
                  } else {
                    displayValue = "{}";
                  }
                } else {
                  displayValue = String(value || "");
                }
                return (
                  <Badge 
                    key={key} 
                    variant="secondary" 
                    className="text-xs"
                    title={`${key}: ${JSON.stringify(value)}`}
                  >
                    <span className="text-muted-foreground mr-1">{key}:</span>
                    {displayValue}
                  </Badge>
                );
              })}
              {Object.keys(data.config).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.keys(data.config).length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {data.onConfigure && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              data.onConfigure?.(id);
            }}
          >
            <Settings className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {!isEnd && (
        <>
          {isDecision || isParallel ? (
            <>
              <Handle
                type="source"
                position={Position.Right}
                id="yes"
                className="!w-3 !h-3 !bg-green-500 !border-2 !border-background !top-1/3"
              />
              <Handle
                type="source"
                position={Position.Right}
                id="no"
                className="!w-3 !h-3 !bg-orange-500 !border-2 !border-background !top-2/3"
              />
            </>
          ) : (
            <Handle
              type="source"
              position={Position.Right}
              className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background"
            />
          )}
        </>
      )}
    </div>
  );
}

export const WorkflowNodeMemo = memo(WorkflowNodeComponent);
