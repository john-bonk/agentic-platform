/**
 * Workflow Builder Page
 * 
 * Main page for the meta workflow builder with canvas and assistant panel
 */

import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, Save, Play, MoreHorizontal, ChevronLeft, 
  PanelRightClose, PanelRight, Loader2, Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useWorkflowStore } from "@/lib/workflowStore";
import { NodePalette } from "@/components/workflow/NodePalette";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { AssistantPanel } from "@/components/workflow/AssistantPanel";
import { NodeInspector } from "@/components/workflow/NodeInspector";
import { 
  type Workflow as WorkflowType, 
  type WorkflowNode, 
  type WorkflowEdge,
  type NodeTypeDefinition,
  type AssistantAction,
} from "@shared/schema";

interface WorkflowData {
  workflow: WorkflowType;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

function WorkflowBuilderHeader({ 
  workflow, 
  onBack, 
  isPanelOpen, 
  onTogglePanel,
  onSave,
}: {
  workflow: WorkflowType | null;
  onBack: () => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onSave: () => void;
}) {
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between gap-4 px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Workflow className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">
              {workflow?.name || "New Workflow"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {workflow?.status || "draft"}
            </p>
          </div>
        </div>
        {workflow?.tags && workflow.tags.length > 0 && (
          <div className="flex gap-1 ml-2">
            {workflow.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSave} data-testid="button-save-workflow">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button size="sm" data-testid="button-run-workflow">
          <Play className="w-4 h-4 mr-1" />
          Run
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem>Version History</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onTogglePanel}
          data-testid="button-toggle-assistant"
        >
          {isPanelOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRight className="w-4 h-4" />
          )}
        </Button>
      </div>
    </header>
  );
}

export function WorkflowBuilderPage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/workflow/:id");
  const { toast } = useToast();
  
  const workflowId = params?.id;
  const isNewWorkflow = workflowId === "new";
  
  const [showNewDialog, setShowNewDialog] = useState(isNewWorkflow);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDesc, setNewWorkflowDesc] = useState("");
  
  const {
    workflow,
    nodes,
    edges,
    isPanelOpen,
    inspectorNodeId,
    setWorkflow,
    setNodes,
    setEdges,
    addNode,
    removeNode,
    setPanelOpen,
    setInspectorNodeId,
    reset,
  } = useWorkflowStore();

  const { data, isLoading, error } = useQuery<WorkflowData>({
    queryKey: ["/api/workflows", workflowId],
    enabled: !!workflowId && !isNewWorkflow,
  });

  useEffect(() => {
    if (data) {
      setWorkflow(data.workflow);
      setNodes(data.nodes);
      setEdges(data.edges);
    }
  }, [data, setWorkflow, setNodes, setEdges]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }): Promise<WorkflowType> => {
      const res = await apiRequest("POST", "/api/workflows", data);
      return res.json();
    },
    onSuccess: (newWorkflow: WorkflowType) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      setShowNewDialog(false);
      navigate(`/workflow/${newWorkflow.id}`, { replace: true });
      toast({
        title: "Workflow created",
        description: `"${newWorkflow.name}" has been created.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create workflow. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateWorkflow = () => {
    if (!newWorkflowName.trim()) return;
    createWorkflowMutation.mutate({
      name: newWorkflowName.trim(),
      description: newWorkflowDesc.trim(),
    });
  };

  const handleDragStart = (e: React.DragEvent, nodeType: NodeTypeDefinition) => {
    e.dataTransfer.setData("application/workflow-node", JSON.stringify(nodeType));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleNodeConfigure = useCallback((nodeId: string) => {
    setInspectorNodeId(nodeId);
  }, [setInspectorNodeId]);

  const handleDeleteNode = async (nodeId: string) => {
    try {
      await apiRequest("DELETE", `/api/nodes/${nodeId}`, undefined);
      removeNode(nodeId);
      setInspectorNodeId(null);
      toast({
        title: "Node deleted",
        description: "The node has been removed from the workflow.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete node. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyAction = async (action: AssistantAction) => {
    if (!workflowId || isNewWorkflow) return;
    
    try {
      switch (action.type) {
        case "add_node": {
          const payload = action.payload as {
            typeId: string;
            label: string;
            positionX: number;
            positionY: number;
            config?: Record<string, unknown>;
          };
          const res = await apiRequest("POST", `/api/workflows/${workflowId}/nodes`, {
            typeId: payload.typeId,
            label: payload.label,
            positionX: payload.positionX || 400,
            positionY: payload.positionY || 200,
            config: payload.config || {},
            metadata: {},
          });
          const newNode = await res.json();
          addNode(newNode);
          break;
        }
        case "generate_workflow": {
          const payload = action.payload as {
            nodes: Array<{ typeId: string; label: string; positionX: number; positionY: number; config?: Record<string, unknown> }>;
            edges: Array<{ sourceNodeId: string; targetNodeId: string; label?: string }>;
          };
          const res = await apiRequest("POST", `/api/workflows/${workflowId}/bulk`, {
            nodes: payload.nodes,
            edges: payload.edges,
          });
          const result = await res.json();
          result.nodes.forEach((n: WorkflowNode) => addNode(n));
          queryClient.invalidateQueries({ queryKey: ["/api/workflows", workflowId] });
          break;
        }
        default:
          console.log("Unhandled action type:", action.type);
      }
      
      toast({
        title: "Action applied",
        description: action.label,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to apply action. Please try again.",
        variant: "destructive",
      });
      throw new Error("Failed to apply action");
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflow) return;
    try {
      await apiRequest("PATCH", `/api/workflows/${workflow.id}`, {
        name: workflow.name,
        description: workflow.description,
      });
      toast({
        title: "Workflow saved",
        description: "Your changes have been saved.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const inspectorNode = inspectorNodeId 
    ? nodes.find((n) => n.id === inspectorNodeId) 
    : null;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      <WorkflowBuilderHeader
        workflow={workflow}
        onBack={() => navigate("/workflows")}
        isPanelOpen={isPanelOpen}
        onTogglePanel={() => setPanelOpen(!isPanelOpen)}
        onSave={handleSaveWorkflow}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 shrink-0">
          <NodePalette onDragStart={handleDragStart} />
        </div>
        
        <div className="flex-1 relative">
          {workflowId && !isNewWorkflow && (
            <WorkflowCanvas 
              workflowId={workflowId} 
              onNodeConfigure={handleNodeConfigure}
            />
          )}
          {isNewWorkflow && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Create a new workflow to get started
                </p>
              </div>
            </div>
          )}
        </div>
        
        {inspectorNode && (
          <NodeInspector
            node={inspectorNode}
            onClose={() => setInspectorNodeId(null)}
            onDelete={handleDeleteNode}
          />
        )}
        
        {isPanelOpen && !inspectorNode && (
          <div className="w-96 shrink-0">
            <AssistantPanel
              workflowId={workflowId && !isNewWorkflow ? workflowId : null}
              onApplyAction={handleApplyAction}
            />
          </div>
        )}
      </div>
      
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Give your workflow a name and description to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="workflow-name">Name</Label>
              <Input
                id="workflow-name"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder="e.g., Issue Review Workflow"
                className="mt-1.5"
                data-testid="input-workflow-name"
              />
            </div>
            <div>
              <Label htmlFor="workflow-desc">Description</Label>
              <Textarea
                id="workflow-desc"
                value={newWorkflowDesc}
                onChange={(e) => setNewWorkflowDesc(e.target.value)}
                placeholder="Describe what this workflow does..."
                className="mt-1.5"
                data-testid="input-workflow-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/workflows")}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWorkflow}
              disabled={!newWorkflowName.trim() || createWorkflowMutation.isPending}
              data-testid="button-create-workflow"
            >
              {createWorkflowMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              )}
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
