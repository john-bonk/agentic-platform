/**
 * Workflow List Page
 * 
 * Lists all workflows and allows creating new ones
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, Search, Filter, MoreHorizontal, Workflow, 
  Play, Edit2, Trash2, Copy, Clock, User
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Workflow as WorkflowType } from "@shared/schema";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  archived: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

interface WorkflowCardProps {
  workflow: WorkflowType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function WorkflowCard({ workflow, onEdit, onDelete, onDuplicate }: WorkflowCardProps) {
  return (
    <Card className="hover-elevate cursor-pointer" data-testid={`card-workflow-${workflow.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Workflow className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium truncate">{workflow.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {workflow.description || "No description"}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(workflow.id)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(workflow.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(workflow.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-3 mt-4">
          <Badge className={statusColors[workflow.status] || statusColors.draft}>
            {workflow.status}
          </Badge>
          {workflow.tags && workflow.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {workflow.updatedAt 
                ? new Date(workflow.updatedAt).toLocaleDateString() 
                : "Never"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>v{workflow.version}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEdit(workflow.id)}
            className="flex-1"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" className="flex-1">
            <Play className="w-3 h-3 mr-1" />
            Run
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-24 mt-4" />
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkflowListPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: workflows, isLoading } = useQuery<WorkflowType[]>({
    queryKey: ["/api/workflows"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/workflows/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow deleted",
        description: "The workflow has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete workflow. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredWorkflows = workflows?.filter((wf) => {
    const matchesSearch = 
      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || wf.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id: string) => {
    navigate(`/workflow/${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this workflow? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (id: string) => {
    toast({
      title: "Coming soon",
      description: "Workflow duplication will be available soon.",
    });
  };

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader
          title="Workflow Builder"
          description="Design and automate GRC workflows with AI assistance"
        />
        
        <div className="flex items-center justify-between gap-4 mt-6 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-workflows"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => navigate("/workflow/new")} data-testid="button-new-workflow">
            <Plus className="w-4 h-4 mr-1" />
            New Workflow
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <WorkflowCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredWorkflows && filteredWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No workflows found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first workflow to get started"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => navigate("/workflow/new")}>
                <Plus className="w-4 h-4 mr-1" />
                Create Workflow
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
