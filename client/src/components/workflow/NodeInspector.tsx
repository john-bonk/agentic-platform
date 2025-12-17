/**
 * Node Inspector Panel
 * 
 * Configure properties of selected workflow nodes
 */

import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useWorkflowStore } from "@/lib/workflowStore";
import { apiRequest } from "@/lib/queryClient";
import { getNodeType, type WorkflowNode } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface NodeInspectorProps {
  node: WorkflowNode;
  onClose: () => void;
  onDelete: (nodeId: string) => void;
}

export function NodeInspector({ node, onClose, onDelete }: NodeInspectorProps) {
  const { toast } = useToast();
  const { updateNode } = useWorkflowStore();
  const [label, setLabel] = useState(node.label);
  const [config, setConfig] = useState<Record<string, unknown>>(
    node.config as Record<string, unknown> || {}
  );
  const [isSaving, setIsSaving] = useState(false);

  const nodeType = getNodeType(node.typeId);

  useEffect(() => {
    setLabel(node.label);
    setConfig(node.config as Record<string, unknown> || {});
  }, [node]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiRequest("PATCH", `/api/nodes/${node.id}`, {
        label,
        config,
      });
      updateNode(node.id, { label, config });
      toast({
        title: "Node updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Failed to update node:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const renderConfigField = (key: string, propSchema: {
    type: string;
    title: string;
    description?: string;
    enum?: string[];
    default?: unknown;
  }) => {
    const value = config[key] ?? propSchema.default ?? "";

    if (propSchema.enum) {
      return (
        <Select
          value={String(value)}
          onValueChange={(v) => handleConfigChange(key, v)}
        >
          <SelectTrigger data-testid={`select-config-${key}`}>
            <SelectValue placeholder={`Select ${propSchema.title}`} />
          </SelectTrigger>
          <SelectContent>
            {propSchema.enum.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    switch (propSchema.type) {
      case "boolean":
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(v) => handleConfigChange(key, v)}
            data-testid={`switch-config-${key}`}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={Number(value) || ""}
            onChange={(e) => handleConfigChange(key, Number(e.target.value))}
            data-testid={`input-config-${key}`}
          />
        );
      case "array":
        return (
          <Textarea
            value={Array.isArray(value) ? value.join(", ") : ""}
            onChange={(e) => 
              handleConfigChange(
                key, 
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
              )
            }
            placeholder="Enter comma-separated values"
            className="min-h-[60px]"
            data-testid={`textarea-config-${key}`}
          />
        );
      case "object":
        return (
          <Textarea
            value={typeof value === "object" ? JSON.stringify(value, null, 2) : "{}"}
            onChange={(e) => {
              try {
                handleConfigChange(key, JSON.parse(e.target.value));
              } catch {
              }
            }}
            placeholder="Enter JSON"
            className="min-h-[80px] font-mono text-xs"
            data-testid={`textarea-config-${key}`}
          />
        );
      default:
        return (
          <Input
            value={String(value)}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            data-testid={`input-config-${key}`}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-l w-80">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: nodeType?.color + "20" || "#e5e7eb" }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: nodeType?.color || "#6b7280" }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{nodeType?.name || node.typeId}</p>
            <p className="text-xs text-muted-foreground">Configure node</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1.5"
              data-testid="input-node-label"
            />
          </div>
          
          {nodeType && nodeType.inputSchema.properties && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-3">Configuration</p>
                <div className="space-y-4">
                  {Object.entries(nodeType.inputSchema.properties).map(([key, propSchema]) => (
                    <div key={key}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Label>{propSchema.title}</Label>
                        {propSchema.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      {propSchema.description && (
                        <p className="text-xs text-muted-foreground mb-1.5">
                          {propSchema.description}
                        </p>
                      )}
                      {renderConfigField(key, propSchema)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {nodeType && nodeType.capabilities.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Capabilities</p>
                <div className="flex flex-wrap gap-1">
                  {nodeType.capabilities.map((cap) => (
                    <Badge key={cap} variant="secondary" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t flex items-center gap-2">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex-1"
          data-testid="button-save-node"
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(node.id)}
          data-testid="button-delete-node"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
