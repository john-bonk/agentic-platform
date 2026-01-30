import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  CheckCircle, 
  BarChart3, 
  Shield, 
  FileText, 
  Lock,
  Plus,
  MoreVertical,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useWorkspaceStore, Workspace } from "@/lib/workspaceStore";
import { WorkspaceCreationWizard } from "@/components/workspace/WorkspaceCreationWizard";

interface WorkspaceCard {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  metrics: {
    users: number;
    items: number;
    completion: number;
  };
  status: "active" | "inactive";
  isCustom?: boolean;
}

const defaultWorkspaceCards: WorkspaceCard[] = [
  {
    id: "it-security",
    name: "IT Security",
    description: "IT and cyber risk management workspace for security operations.",
    icon: Shield,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    metrics: {
      users: 35,
      items: 18,
      completion: 78,
    },
    status: "active",
    isCustom: false,
  },
  {
    id: "enterprise-risk",
    name: "Enterprise Risk Management",
    description: "Central hub for enterprise-wide risk assessment and mitigation strategies.",
    icon: BarChart3,
    color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
    metrics: {
      users: 45,
      items: 24,
      completion: 92,
    },
    status: "active",
    isCustom: false,
  },
  {
    id: "enterprise-audit",
    name: "Enterprise Audit",
    description: "Internal audit management for compliance and operational auditing.",
    icon: FileText,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    metrics: {
      users: 25,
      items: 14,
      completion: 88,
    },
    status: "active",
    isCustom: false,
  },
];

export function AdminWorkspacesPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { customWorkspaces, setWorkspace } = useWorkspaceStore();
  
  const handleWorkspaceCreated = (workspace: Workspace) => {
    setWorkspace(workspace);
    setLocation(workspace.isCustom ? "/custom-workspace" : "/");
  };
  
  // Combine default workspaces with custom ones
  const allWorkspaces = useMemo((): WorkspaceCard[] => {
    const customCards: WorkspaceCard[] = customWorkspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      description: `Custom workspace with ${ws.moduleConfig?.selectedBuckets.length || 0} modules configured.`,
      icon: LayoutDashboard,
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
      metrics: {
        users: 1,
        items: ws.moduleConfig?.selectedBuckets.reduce((acc, bucketId) => 
          acc + (ws.moduleConfig?.enabledModules[bucketId]?.length || 0), 0) || 0,
        completion: 0,
      },
      status: "active",
      isCustom: true,
    }));
    return [...defaultWorkspaceCards, ...customCards];
  }, [customWorkspaces]);
  
  // Dynamic metrics based on all workspaces
  const dynamicMetrics = useMemo(() => {
    const avgCompletion = allWorkspaces.length > 0
      ? Math.round(allWorkspaces.reduce((acc, w) => acc + w.metrics.completion, 0) / allWorkspaces.length)
      : 0;
    return [
      { label: "Total Workspaces", value: String(allWorkspaces.length), icon: Building2, color: "text-primary" },
      { label: "Active Users", value: String(105 + customWorkspaces.length), icon: Users, color: "text-green-600" },
      { label: "Active Items", value: String(56 + allWorkspaces.filter(w => w.isCustom).reduce((acc, w) => acc + w.metrics.items, 0)), icon: CheckCircle, color: "text-purple-600" },
      { label: "Avg Completion", value: `${avgCompletion}%`, icon: BarChart3, color: "text-amber-600" },
    ];
  }, [allWorkspaces, customWorkspaces.length]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader 
          title="Workspace Administration" 
          description="Configure and manage MegaCorp's GRC workspaces"
          actions={
            <Button onClick={() => setWizardOpen(true)} data-testid="button-create-workspace">
              <Plus className="w-4 h-4 mr-2" />
              Create New Workspace
            </Button>
          }
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicMetrics.map((metric) => (
            <Card key={metric.label} data-testid={`summary-card-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md bg-muted`}>
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {allWorkspaces.map((workspace) => (
            <Card 
              key={workspace.id} 
              className="hover-elevate"
              data-testid={`workspace-card-${workspace.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${workspace.color}`}>
                    <workspace.icon className="w-6 h-6" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-workspace-menu-${workspace.id}`}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem data-testid={`menu-edit-${workspace.id}`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Workspace
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid={`menu-permissions-${workspace.id}`}>
                        <Lock className="w-4 h-4 mr-2" />
                        Manage Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid={`menu-users-${workspace.id}`}>
                        <Users className="w-4 h-4 mr-2" />
                        View Users
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{workspace.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {workspace.description}
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {workspace.metrics.users} users
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={workspace.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : ''}
                  >
                    {workspace.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Items</span>
                    <span className="font-medium">{workspace.metrics.items}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium">{workspace.metrics.completion}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${workspace.metrics.completion}%` }}
                    />
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  data-testid={`button-open-workspace-${workspace.id}`}
                >
                  Open Workspace
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <WorkspaceCreationWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </AppLayout>
  );
}

export default AdminWorkspacesPage;
