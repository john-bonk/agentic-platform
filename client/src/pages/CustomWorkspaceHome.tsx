/**
 * Custom Workspace Home Page
 * 
 * Dynamically configured landing page for custom workspaces featuring:
 * - Module-aware task lists
 * - AI quick-actions based on selected capabilities
 * - AB Assistant panel integration
 * - Dynamic metrics matching capability combinations
 */

import { useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plus,
  Calculator,
  Play,
  AlertCircle,
  Search,
  UserPlus,
  ClipboardCheck,
  Cpu,
  Cloud,
  FileText,
  CheckSquare,
  BarChart2,
  TrendingUp,
  Shield,
  Users,
  Activity,
} from "lucide-react";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import { productCapabilityBuckets, getQuickActionsForWorkspace } from "@/config/workspaceWizardConfig";

interface DynamicTask {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  category: string;
  bucketId: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

function getTasksForBuckets(selectedBuckets: string[]): DynamicTask[] {
  const taskTemplates: Record<string, DynamicTask[]> = {
    "controls-management": [
      { id: "cm-1", title: "Complete Q4 Control Testing", description: "Finish SOX control testing for Q4 cycle", priority: "high", dueDate: "2 days", status: "in-progress", category: "Control Testing", bucketId: "controls-management" },
      { id: "cm-2", title: "Review Control Gap Remediation", description: "Validate remediation actions for 3 open gaps", priority: "medium", dueDate: "5 days", status: "pending", category: "Gap Management", bucketId: "controls-management" },
      { id: "cm-3", title: "Update Control Library", description: "Add new ITGC controls for cloud migration", priority: "low", dueDate: "2 weeks", status: "pending", category: "Control Library", bucketId: "controls-management" },
    ],
    "enterprise-risk": [
      { id: "erm-1", title: "Quarterly Risk Assessment", description: "Complete Q4 enterprise risk assessment", priority: "high", dueDate: "3 days", status: "pending", category: "Risk Assessment", bucketId: "enterprise-risk" },
      { id: "erm-2", title: "Update Risk Heatmap", description: "Refresh risk heatmap with latest scores", priority: "medium", dueDate: "1 week", status: "pending", category: "Analysis", bucketId: "enterprise-risk" },
      { id: "erm-3", title: "Review KRI Thresholds", description: "Annual review of key risk indicator thresholds", priority: "low", dueDate: "2 weeks", status: "pending", category: "KRIs", bucketId: "enterprise-risk" },
    ],
    "audit-management": [
      { id: "am-1", title: "Finalize IT Audit Report", description: "Complete draft and send for review", priority: "high", dueDate: "1 day", status: "in-progress", category: "Reporting", bucketId: "audit-management" },
      { id: "am-2", title: "Schedule Audit Exit Meeting", description: "Coordinate with auditees for findings walkthrough", priority: "medium", dueDate: "4 days", status: "pending", category: "Execution", bucketId: "audit-management" },
      { id: "am-3", title: "Update Annual Audit Plan", description: "Revise Q1 audit schedule based on new priorities", priority: "medium", dueDate: "1 week", status: "pending", category: "Planning", bucketId: "audit-management" },
    ],
    "cyber-it-compliance": [
      { id: "cit-1", title: "Critical Vulnerability Remediation", description: "Patch 5 critical CVEs identified in last scan", priority: "high", dueDate: "Today", status: "in-progress", category: "Vulnerabilities", bucketId: "cyber-it-compliance" },
      { id: "cit-2", title: "Review Security Incident", description: "Complete post-mortem for last week's incident", priority: "high", dueDate: "2 days", status: "pending", category: "Incidents", bucketId: "cyber-it-compliance" },
      { id: "cit-3", title: "Access Review Campaign", description: "Launch quarterly privileged access review", priority: "medium", dueDate: "1 week", status: "pending", category: "Access Reviews", bucketId: "cyber-it-compliance" },
    ],
    "information-technology": [
      { id: "it-1", title: "Change Request Approval", description: "Review and approve pending change requests", priority: "medium", dueDate: "Today", status: "pending", category: "Change Management", bucketId: "information-technology" },
      { id: "it-2", title: "Update Asset Inventory", description: "Reconcile hardware assets with discovery scan", priority: "low", dueDate: "1 week", status: "pending", category: "Assets", bucketId: "information-technology" },
    ],
    "regulatory-compliance": [
      { id: "rc-1", title: "SOX 302 Certification", description: "Prepare materials for CFO certification", priority: "high", dueDate: "5 days", status: "in-progress", category: "SOX", bucketId: "regulatory-compliance" },
      { id: "rc-2", title: "Regulatory Filing Review", description: "Review quarterly compliance filing", priority: "medium", dueDate: "1 week", status: "pending", category: "Filings", bucketId: "regulatory-compliance" },
    ],
    "third-party": [
      { id: "tp-1", title: "Vendor Due Diligence", description: "Complete assessment for new cloud vendor", priority: "high", dueDate: "3 days", status: "in-progress", category: "Assessments", bucketId: "third-party" },
      { id: "tp-2", title: "Contract Renewal Review", description: "Review terms for 5 vendors up for renewal", priority: "medium", dueDate: "2 weeks", status: "pending", category: "Contracts", bucketId: "third-party" },
    ],
    "ai-governance": [
      { id: "ai-1", title: "AI Model Validation", description: "Complete validation for new credit scoring model", priority: "high", dueDate: "1 week", status: "pending", category: "Validation", bucketId: "ai-governance" },
      { id: "ai-2", title: "Bias Assessment Review", description: "Review bias assessment results for HR model", priority: "medium", dueDate: "2 weeks", status: "pending", category: "Ethics", bucketId: "ai-governance" },
    ],
    "environmental-compliance": [
      { id: "env-1", title: "Q4 Emissions Reporting", description: "Finalize scope 1 & 2 emissions data", priority: "high", dueDate: "1 week", status: "in-progress", category: "Carbon", bucketId: "environmental-compliance" },
      { id: "env-2", title: "ESG Disclosure Review", description: "Review annual sustainability report draft", priority: "medium", dueDate: "2 weeks", status: "pending", category: "Reporting", bucketId: "environmental-compliance" },
    ],
  };

  const tasks: DynamicTask[] = [];
  for (const bucketId of selectedBuckets) {
    const bucketTasks = taskTemplates[bucketId] || [];
    tasks.push(...bucketTasks);
  }
  
  return tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function getMetricsForBuckets(selectedBuckets: string[]): Array<{ label: string; value: string; change: string; trend: "up" | "down" | "neutral" }> {
  const metrics: Array<{ label: string; value: string; change: string; trend: "up" | "down" | "neutral" }> = [];
  
  if (selectedBuckets.includes("controls-management")) {
    metrics.push({ label: "Control Effectiveness", value: "94%", change: "+2%", trend: "up" });
  }
  if (selectedBuckets.includes("enterprise-risk")) {
    metrics.push({ label: "Residual Risk Score", value: "Low", change: "-5pts", trend: "down" });
  }
  if (selectedBuckets.includes("audit-management")) {
    metrics.push({ label: "Open Findings", value: "12", change: "-3", trend: "down" });
  }
  if (selectedBuckets.includes("cyber-it-compliance")) {
    metrics.push({ label: "Critical Vulns", value: "5", change: "+2", trend: "up" });
  }
  if (selectedBuckets.includes("third-party")) {
    metrics.push({ label: "Vendor Risk Score", value: "B+", change: "stable", trend: "neutral" });
  }
  if (selectedBuckets.includes("ai-governance")) {
    metrics.push({ label: "Models in Production", value: "23", change: "+4", trend: "up" });
  }
  if (selectedBuckets.includes("environmental-compliance")) {
    metrics.push({ label: "Carbon Emissions", value: "12.4K", change: "-8%", trend: "down" });
  }
  
  return metrics.slice(0, 4);
}

const getActionIcon = (iconName: string) => {
  const icons: Record<string, JSX.Element> = {
    "plus": <Plus className="w-4 h-4" />,
    "play": <Play className="w-4 h-4" />,
    "calculator": <Calculator className="w-4 h-4" />,
    "alert-triangle": <AlertTriangle className="w-4 h-4" />,
    "alert-circle": <AlertCircle className="w-4 h-4" />,
    "search": <Search className="w-4 h-4" />,
    "user-plus": <UserPlus className="w-4 h-4" />,
    "clipboard-check": <ClipboardCheck className="w-4 h-4" />,
    "cpu": <Cpu className="w-4 h-4" />,
    "check-circle": <CheckCircle className="w-4 h-4" />,
    "cloud": <Cloud className="w-4 h-4" />,
    "file-text": <FileText className="w-4 h-4" />,
  };
  return icons[iconName] || <Sparkles className="w-4 h-4" />;
};

const getPriorityBadge = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive" className="text-[10px]">High</Badge>;
    case "medium":
      return <Badge variant="secondary" className="text-[10px]">Medium</Badge>;
    case "low":
      return <Badge variant="outline" className="text-[10px]">Low</Badge>;
  }
};

const getTrendIcon = (trend: "up" | "down" | "neutral") => {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    case "down":
      return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
    default:
      return <Activity className="w-3 h-3 text-gray-400" />;
  }
};

const getBucketIcon = (bucketId: string) => {
  const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
  if (!bucket) return <CheckSquare className="w-3 h-3" />;
  
  const iconMap: Record<string, JSX.Element> = {
    "controls-management": <Shield className="w-3 h-3" />,
    "enterprise-risk": <BarChart2 className="w-3 h-3" />,
    "audit-management": <ClipboardCheck className="w-3 h-3" />,
    "cyber-it-compliance": <AlertCircle className="w-3 h-3" />,
    "information-technology": <Cpu className="w-3 h-3" />,
    "regulatory-compliance": <FileText className="w-3 h-3" />,
    "third-party": <Users className="w-3 h-3" />,
    "ai-governance": <Sparkles className="w-3 h-3" />,
    "environmental-compliance": <Cloud className="w-3 h-3" />,
  };
  
  return iconMap[bucketId] || <CheckSquare className="w-3 h-3" />;
};

export default function CustomWorkspaceHome() {
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const workspaces = useWorkspaceStore(state => state.workspaces);
  
  const workspace = useMemo(() => {
    if (!activeWorkspace) return null;
    return workspaces.find(w => w.id === activeWorkspace);
  }, [activeWorkspace, workspaces]);
  
  const selectedBuckets = workspace?.moduleConfig?.selectedBuckets || [];
  const enabledModules = workspace?.moduleConfig?.enabledModules || {};
  
  const tasks = useMemo(() => getTasksForBuckets(selectedBuckets), [selectedBuckets]);
  const quickActions = useMemo(() => getQuickActionsForWorkspace(selectedBuckets, enabledModules), [selectedBuckets, enabledModules]);
  const metrics = useMemo(() => getMetricsForBuckets(selectedBuckets), [selectedBuckets]);
  
  const selectedBucketData = productCapabilityBuckets.filter(b => selectedBuckets.includes(b.id));
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-foreground">
              Welcome to {workspace?.name || "Your Workspace"}
            </h1>
            <p className="text-gray-500 dark:text-muted-foreground mt-1">
              Here's what's happening across your {selectedBuckets.length} active capabilities
            </p>
          </div>
          <div className="flex gap-2">
            {selectedBucketData.slice(0, 4).map(bucket => (
              <Badge 
                key={bucket.id} 
                variant="secondary"
                className="text-xs"
                style={{ borderColor: bucket.color, borderWidth: 1 }}
              >
                {bucket.name}
              </Badge>
            ))}
            {selectedBucketData.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{selectedBucketData.length - 4} more
              </Badge>
            )}
          </div>
        </div>
        
        {/* Metrics Row */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">{metric.label}</p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-xs ${
                        metric.trend === "up" ? "text-green-500" : 
                        metric.trend === "down" ? "text-red-500" : 
                        "text-gray-400"
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-foreground mt-1">{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-6">
          {/* Tasks Column */}
          <div className="col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">My Tasks</CardTitle>
                <Badge variant="secondary">{tasks.length} tasks</Badge>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {tasks.slice(0, 10).map(task => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors cursor-pointer"
                        data-testid={`task-${task.id}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          task.status === "completed" ? "bg-green-100 text-green-600" :
                          task.status === "in-progress" ? "bg-blue-100 text-blue-600" :
                          "bg-gray-100 dark:bg-muted text-gray-500"
                        }`}>
                          {task.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : task.status === "in-progress" ? (
                            <Activity className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-900 dark:text-foreground truncate">
                              {task.title}
                            </p>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 truncate">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              {getBucketIcon(task.bucketId)}
                              <span>{task.category}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <CheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-sm">No tasks at the moment</p>
                        <p className="text-xs text-gray-400">Tasks will appear here based on your capabilities</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions & AI Panel Column */}
          <div className="space-y-6">
            {/* AI Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#266C92]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map(action => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-3 px-3"
                      data-testid={`action-${action.id}`}
                    >
                      {getActionIcon(action.icon)}
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                  {quickActions.length === 0 && (
                    <div className="col-span-2 py-6 text-center text-gray-500 text-sm">
                      Quick actions will appear based on your capabilities
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* AB Assistant Panel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AB Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-muted/50 border border-gray-200 dark:border-border">
                    <p className="text-sm text-gray-700 dark:text-foreground mb-2">
                      How can I help you today?
                    </p>
                    <div className="space-y-2">
                      {selectedBuckets.slice(0, 3).map(bucketId => {
                        const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
                        if (!bucket) return null;
                        
                        const prompts: Record<string, string> = {
                          "controls-management": "Summarize control testing status",
                          "enterprise-risk": "Show top 5 enterprise risks",
                          "audit-management": "List open audit findings",
                          "cyber-it-compliance": "Report on critical vulnerabilities",
                          "information-technology": "Show pending change requests",
                          "regulatory-compliance": "Upcoming compliance deadlines",
                          "third-party": "Vendors requiring assessment",
                          "ai-governance": "AI models pending validation",
                          "environmental-compliance": "ESG metrics summary",
                        };
                        
                        return (
                          <Button
                            key={bucketId}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs text-gray-600 dark:text-muted-foreground hover:text-[#266C92]"
                          >
                            "{prompts[bucketId] || `Help with ${bucket.name}`}"
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <Button className="w-full gap-2 bg-[#266C92] hover:bg-[#1e5a7a]">
                    <Sparkles className="w-4 h-4" />
                    Ask AB Assistant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
