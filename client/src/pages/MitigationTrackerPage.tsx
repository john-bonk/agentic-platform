/**
 * Mitigation Tracker Page
 * 
 * Sophisticated mitigation tracking with Gantt-style timeline,
 * status flows, resource allocation, and progress dashboards.
 * 
 * Path: /cro/mitigation-tracker
 */

import { useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Users,
  DollarSign,
  Target,
  Play,
  Pause,
  ChevronRight,
  ArrowRight,
  MoreHorizontal,
  TrendingUp,
  Zap,
  Shield,
} from "lucide-react";

interface Mitigation {
  id: string;
  name: string;
  risk: string;
  riskSeverity: "critical" | "high" | "medium" | "low";
  status: "not-started" | "in-progress" | "blocked" | "completed" | "on-hold";
  progress: number;
  owner: string;
  ownerInitials: string;
  budget: string;
  spent: string;
  startDate: string;
  dueDate: string;
  daysRemaining: number;
  priority: "P0" | "P1" | "P2" | "P3";
  tasks: { id: string; name: string; completed: boolean }[];
  dependencies: string[];
  category: string;
}

const mockMitigations: Mitigation[] = [
  {
    id: "mit-1",
    name: "Diversify Supply Chain Partners",
    risk: "US Tariff Escalation",
    riskSeverity: "critical",
    status: "in-progress",
    progress: 42,
    owner: "Sarah Chen",
    ownerInitials: "SC",
    budget: "$850K",
    spent: "$312K",
    startDate: "Jan 02",
    dueDate: "Mar 31",
    daysRemaining: 75,
    priority: "P0",
    tasks: [
      { id: "t1", name: "Identify alternative suppliers", completed: true },
      { id: "t2", name: "RFP process", completed: true },
      { id: "t3", name: "Contract negotiations", completed: false },
      { id: "t4", name: "Pilot program", completed: false },
      { id: "t5", name: "Full transition", completed: false },
    ],
    dependencies: ["mit-3"],
    category: "Supply Chain",
  },
  {
    id: "mit-2",
    name: "Currency Hedging Program",
    risk: "Currency Volatility",
    riskSeverity: "high",
    status: "in-progress",
    progress: 78,
    owner: "Michael Torres",
    ownerInitials: "MT",
    budget: "$120K",
    spent: "$95K",
    startDate: "Dec 15",
    dueDate: "Feb 28",
    daysRemaining: 44,
    priority: "P1",
    tasks: [
      { id: "t1", name: "Treasury analysis", completed: true },
      { id: "t2", name: "Forward contract setup", completed: true },
      { id: "t3", name: "Implementation", completed: true },
      { id: "t4", name: "Monitoring dashboard", completed: false },
    ],
    dependencies: [],
    category: "Financial",
  },
  {
    id: "mit-3",
    name: "Vendor Risk Assessment Framework",
    risk: "Supply Chain Disruption",
    riskSeverity: "critical",
    status: "completed",
    progress: 100,
    owner: "Jennifer Walsh",
    ownerInitials: "JW",
    budget: "$200K",
    spent: "$187K",
    startDate: "Nov 01",
    dueDate: "Jan 10",
    daysRemaining: 0,
    priority: "P0",
    tasks: [
      { id: "t1", name: "Framework design", completed: true },
      { id: "t2", name: "Vendor categorization", completed: true },
      { id: "t3", name: "Assessment criteria", completed: true },
      { id: "t4", name: "Rollout training", completed: true },
    ],
    dependencies: [],
    category: "Operations",
  },
  {
    id: "mit-4",
    name: "Zero Trust Architecture Implementation",
    risk: "Cyber Attack Vector",
    riskSeverity: "critical",
    status: "in-progress",
    progress: 35,
    owner: "David Kim",
    ownerInitials: "DK",
    budget: "$1.2M",
    spent: "$420K",
    startDate: "Dec 01",
    dueDate: "Jun 30",
    daysRemaining: 166,
    priority: "P0",
    tasks: [
      { id: "t1", name: "Network segmentation", completed: true },
      { id: "t2", name: "Identity verification", completed: false },
      { id: "t3", name: "Device trust", completed: false },
      { id: "t4", name: "Application security", completed: false },
      { id: "t5", name: "Data protection", completed: false },
    ],
    dependencies: [],
    category: "Technology",
  },
  {
    id: "mit-5",
    name: "GDPR Compliance Enhancement",
    risk: "Regulatory Non-Compliance",
    riskSeverity: "high",
    status: "blocked",
    progress: 55,
    owner: "Emma Roberts",
    ownerInitials: "ER",
    budget: "$350K",
    spent: "$198K",
    startDate: "Nov 15",
    dueDate: "Mar 15",
    daysRemaining: 59,
    priority: "P1",
    tasks: [
      { id: "t1", name: "Gap analysis", completed: true },
      { id: "t2", name: "Policy updates", completed: true },
      { id: "t3", name: "Technical controls", completed: false },
      { id: "t4", name: "Training rollout", completed: false },
    ],
    dependencies: ["mit-4"],
    category: "Compliance",
  },
  {
    id: "mit-6",
    name: "Business Continuity Plan Update",
    risk: "Key Supplier Bankruptcy",
    riskSeverity: "high",
    status: "not-started",
    progress: 0,
    owner: "James Wilson",
    ownerInitials: "JWi",
    budget: "$75K",
    spent: "$0",
    startDate: "Feb 01",
    dueDate: "Apr 30",
    daysRemaining: 105,
    priority: "P2",
    tasks: [
      { id: "t1", name: "Current state assessment", completed: false },
      { id: "t2", name: "Scenario planning", completed: false },
      { id: "t3", name: "Response procedures", completed: false },
      { id: "t4", name: "Testing & validation", completed: false },
    ],
    dependencies: ["mit-1"],
    category: "Operations",
  },
  {
    id: "mit-7",
    name: "Climate Risk Assessment Program",
    risk: "Climate Event Impact",
    riskSeverity: "high",
    status: "in-progress",
    progress: 25,
    owner: "Lisa Chang",
    ownerInitials: "LC",
    budget: "$280K",
    spent: "$68K",
    startDate: "Jan 08",
    dueDate: "May 31",
    daysRemaining: 136,
    priority: "P2",
    tasks: [
      { id: "t1", name: "Location risk mapping", completed: true },
      { id: "t2", name: "Impact modeling", completed: false },
      { id: "t3", name: "Insurance review", completed: false },
      { id: "t4", name: "Resilience planning", completed: false },
    ],
    dependencies: [],
    category: "Environmental",
  },
];

function getStatusColor(status: string): string {
  switch (status) {
    case "completed": return "bg-green-500";
    case "in-progress": return "bg-blue-500";
    case "blocked": return "bg-red-500";
    case "on-hold": return "bg-yellow-500";
    default: return "bg-gray-400";
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "completed": "default",
    "in-progress": "secondary",
    "blocked": "destructive",
    "on-hold": "outline",
    "not-started": "outline",
  };
  const labels: Record<string, string> = {
    "completed": "Completed",
    "in-progress": "In Progress",
    "blocked": "Blocked",
    "on-hold": "On Hold",
    "not-started": "Not Started",
  };
  return (
    <Badge 
      variant={variants[status] || "outline"}
      className={status === "completed" ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {labels[status] || status}
    </Badge>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "P0": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "P1": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "P2": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical": return "text-red-600";
    case "high": return "text-orange-600";
    case "medium": return "text-yellow-600";
    default: return "text-green-600";
  }
}

export default function MitigationTrackerPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "timeline" | "list">("kanban");
  const [selectedMitigation, setSelectedMitigation] = useState<Mitigation | null>(null);

  const totalBudget = mockMitigations.reduce((acc, m) => 
    acc + parseFloat(m.budget.replace(/[$K,M]/g, "")) * (m.budget.includes("M") ? 1000 : 1), 0
  );
  const totalSpent = mockMitigations.reduce((acc, m) => 
    acc + parseFloat(m.spent.replace(/[$K,M]/g, "")) * (m.spent.includes("M") ? 1000 : 1), 0
  );

  const statusGroups = {
    "not-started": mockMitigations.filter(m => m.status === "not-started"),
    "in-progress": mockMitigations.filter(m => m.status === "in-progress"),
    "blocked": mockMitigations.filter(m => m.status === "blocked"),
    "completed": mockMitigations.filter(m => m.status === "completed"),
  };

  const overallProgress = Math.round(
    mockMitigations.reduce((acc, m) => acc + m.progress, 0) / mockMitigations.length
  );

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader 
          title="Mitigation Tracker" 
          description="Track and manage risk mitigation initiatives across the enterprise"
          actions={
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "kanban" | "timeline" | "list")}>
                <TabsList className="h-9">
                  <TabsTrigger value="kanban" className="px-3">Kanban</TabsTrigger>
                  <TabsTrigger value="timeline" className="px-3">Timeline</TabsTrigger>
                  <TabsTrigger value="list" className="px-3">List</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" data-testid="button-filter-mitigations">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" data-testid="button-export-mitigations">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          }
        />

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <Target className="w-4 h-4 text-[#266C92]" />
                  </div>
                  <p className="text-2xl font-bold text-[#266C92]">{overallProgress}%</p>
                  <Progress value={overallProgress} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Active Mitigations</p>
                    <Play className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{statusGroups["in-progress"].length}</p>
                  <p className="text-xs text-muted-foreground mt-1">of {mockMitigations.length} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Blocked</p>
                    <Pause className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{statusGroups["blocked"].length}</p>
                  <p className="text-xs text-muted-foreground mt-1">requires attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Budget Utilized</p>
                    <DollarSign className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">${(totalSpent / 1000).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground mt-1">of ${(totalBudget / 1000).toFixed(1)}M allocated</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{statusGroups["completed"].length}</p>
                  <p className="text-xs text-muted-foreground mt-1">this quarter</p>
                </CardContent>
              </Card>
            </div>

            {viewMode === "kanban" && (
              <div className="grid grid-cols-4 gap-4">
                {(["not-started", "in-progress", "blocked", "completed"] as const).map(status => (
                  <div key={status} className="flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <span className="font-medium capitalize">{status.replace("-", " ")}</span>
                      </div>
                      <Badge variant="outline">{statusGroups[status].length}</Badge>
                    </div>
                    <div className="flex-1 space-y-3 min-h-[400px] p-3 rounded-lg bg-muted/30">
                      {statusGroups[status].map(mit => (
                        <Card 
                          key={mit.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedMitigation(mit)}
                          data-testid={`mitigation-card-${mit.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <Badge className={getPriorityColor(mit.priority)}>{mit.priority}</Badge>
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                            <h4 className="font-medium text-sm mb-2 line-clamp-2">{mit.name}</h4>
                            <div className="flex items-center gap-1 mb-3">
                              <AlertTriangle className={`w-3 h-3 ${getSeverityColor(mit.riskSeverity)}`} />
                              <span className="text-xs text-muted-foreground truncate">{mit.risk}</span>
                            </div>
                            
                            {mit.status !== "not-started" && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{mit.progress}%</span>
                                </div>
                                <Progress value={mit.progress} className="h-1.5" />
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-[10px] bg-[#266C92]/10 text-[#266C92]">
                                    {mit.ownerInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{mit.owner.split(" ")[0]}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {mit.dueDate}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "timeline" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mitigation Timeline (Q1 2026)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="grid grid-cols-12 gap-px mb-4">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].flatMap(month => 
                        [1, 2].map(half => (
                          <div key={`${month}-${half}`} className="text-center text-xs text-muted-foreground py-2 border-b">
                            {half === 1 ? month : ""}
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {mockMitigations.map((mit, idx) => {
                        const startCol = Math.max(1, (idx % 6) + 1);
                        const spanCols = Math.min(12 - startCol + 1, Math.floor(mit.daysRemaining / 15) + 2);
                        
                        return (
                          <div key={mit.id} className="flex items-center gap-4">
                            <div className="w-48 flex-shrink-0">
                              <p className="text-sm font-medium truncate">{mit.name}</p>
                              <p className="text-xs text-muted-foreground">{mit.owner}</p>
                            </div>
                            <div className="flex-1 grid grid-cols-12 gap-px h-8">
                              <div 
                                className={`rounded ${getStatusColor(mit.status)} flex items-center justify-center`}
                                style={{
                                  gridColumn: `${startCol} / span ${spanCols}`,
                                }}
                              >
                                <span className="text-[10px] text-white font-medium">{mit.progress}%</span>
                              </div>
                            </div>
                            <div className="w-20 text-right">
                              <Badge className={getPriorityColor(mit.priority)}>{mit.priority}</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="absolute left-48 top-0 bottom-0 w-0.5 bg-red-500 opacity-50" style={{ left: "calc(16rem + 16.67%)" }}>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-red-500 font-medium whitespace-nowrap">
                        Today
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {viewMode === "list" && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium text-sm">Mitigation</th>
                          <th className="text-left p-4 font-medium text-sm">Risk</th>
                          <th className="text-left p-4 font-medium text-sm">Status</th>
                          <th className="text-left p-4 font-medium text-sm">Progress</th>
                          <th className="text-left p-4 font-medium text-sm">Owner</th>
                          <th className="text-left p-4 font-medium text-sm">Budget</th>
                          <th className="text-left p-4 font-medium text-sm">Due Date</th>
                          <th className="text-left p-4 font-medium text-sm">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockMitigations.map(mit => (
                          <tr 
                            key={mit.id} 
                            className="border-b hover:bg-muted/30 cursor-pointer"
                            onClick={() => setSelectedMitigation(mit)}
                            data-testid={`mitigation-row-${mit.id}`}
                          >
                            <td className="p-4">
                              <p className="font-medium text-sm">{mit.name}</p>
                              <p className="text-xs text-muted-foreground">{mit.category}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className={`w-4 h-4 ${getSeverityColor(mit.riskSeverity)}`} />
                                <span className="text-sm">{mit.risk}</span>
                              </div>
                            </td>
                            <td className="p-4">{getStatusBadge(mit.status)}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Progress value={mit.progress} className="w-20 h-2" />
                                <span className="text-sm font-medium">{mit.progress}%</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-[10px] bg-[#266C92]/10 text-[#266C92]">
                                    {mit.ownerInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{mit.owner}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-medium">{mit.spent}</p>
                              <p className="text-xs text-muted-foreground">of {mit.budget}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm">{mit.dueDate}</p>
                              <p className="text-xs text-muted-foreground">{mit.daysRemaining}d remaining</p>
                            </td>
                            <td className="p-4">
                              <Badge className={getPriorityColor(mit.priority)}>{mit.priority}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#266C92]" />
                    Resource Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Sarah Chen", role: "Supply Chain Lead", utilization: 92, mitigations: 2 },
                      { name: "David Kim", role: "Security Architect", utilization: 85, mitigations: 1 },
                      { name: "Michael Torres", role: "Treasury Manager", utilization: 78, mitigations: 1 },
                      { name: "Emma Roberts", role: "Compliance Director", utilization: 65, mitigations: 1 },
                      { name: "Lisa Chang", role: "Risk Analyst", utilization: 45, mitigations: 1 },
                    ].map((person, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-[#266C92]/10 text-[#266C92] text-sm">
                            {person.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <p className="font-medium text-sm">{person.name}</p>
                              <p className="text-xs text-muted-foreground">{person.role}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{person.utilization}%</p>
                              <p className="text-xs text-muted-foreground">{person.mitigations} mitigations</p>
                            </div>
                          </div>
                          <Progress 
                            value={person.utilization} 
                            className={`h-2 ${person.utilization > 85 ? "[&>div]:bg-red-500" : person.utilization > 70 ? "[&>div]:bg-yellow-500" : ""}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#266C92]" />
                    Dependency Chain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMitigations.filter(m => m.dependencies.length > 0 || mockMitigations.some(other => other.dependencies.includes(m.id))).slice(0, 4).map(mit => (
                      <div key={mit.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(mit.status)}`} />
                          <span className="font-medium text-sm">{mit.name}</span>
                        </div>
                        {mit.dependencies.length > 0 && (
                          <div className="ml-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Blocked by:</span>
                            {mit.dependencies.map(depId => {
                              const dep = mockMitigations.find(m => m.id === depId);
                              return dep ? (
                                <Badge key={depId} variant="outline" className="text-xs">
                                  {dep.name.split(" ").slice(0, 3).join(" ")}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                        {mockMitigations.filter(m => m.dependencies.includes(mit.id)).length > 0 && (
                          <div className="ml-4 flex items-center gap-2 text-xs text-green-600 mt-1">
                            <span>Unlocks:</span>
                            {mockMitigations.filter(m => m.dependencies.includes(mit.id)).map(dep => (
                              <Badge key={dep.id} variant="secondary" className="text-xs">
                                {dep.name.split(" ").slice(0, 3).join(" ")}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
