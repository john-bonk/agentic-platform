/**
 * Home Page
 * 
 * The main landing page for each workspace with welcome message
 * and task list. Content adapts based on current workspace.
 */

import { useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  FileText, 
  Users,
  Calendar,
  BarChart3,
  Shield,
  Target,
  ClipboardList,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useWorkspaceStore } from "@/lib/workspaceStore";

interface Task {
  id: string;
  title: string;
  context: string;
  preparers: string[];
  dueDate: string;
  status: "incomplete" | "complete" | "in-progress";
}

interface ScenarioPlanning {
  title: string;
  progress: string;
  completed: number;
  total: number;
}

interface QuickStat {
  label: string;
  value: number;
  icon: React.ElementType;
}

const workspaceContent: Record<string, {
  criticalAlert?: { title: string; label: string };
  scenarioPlanning: ScenarioPlanning;
  tasks: Task[];
  quickStats: QuickStat[];
}> = {
  "enterprise-risk": {
    criticalAlert: {
      title: "Global tariff changes impacting supply chain",
      label: "Tariff Mitigation",
    },
    scenarioPlanning: {
      title: "Tariff Mitigation Strategy",
      progress: "2/4 Completed",
      completed: 2,
      total: 4,
    },
    tasks: [
      {
        id: "risk-1",
        title: "Assess Supply Chain Tariff Exposure",
        context: "Risk Assessment: Tariff Mitigation",
        preparers: ["Sarah Chen", "Michael Torres"],
        dueDate: "10-31-2025",
        status: "incomplete",
      },
      {
        id: "risk-2",
        title: "Update Vendor Cost Impact Analysis",
        context: "Analysis: Tariff Mitigation",
        preparers: ["James Wilson"],
        dueDate: "11-15-2025",
        status: "incomplete",
      },
      {
        id: "risk-3",
        title: "Review Alternative Sourcing Options",
        context: "Strategy: Tariff Mitigation",
        preparers: ["Sarah Chen", "Amanda Liu"],
        dueDate: "11-30-2025",
        status: "incomplete",
      },
      {
        id: "risk-4",
        title: "Board Presentation on Tariff Risk",
        context: "Report: Tariff Mitigation",
        preparers: ["Michael Torres"],
        dueDate: "12-15-2025",
        status: "incomplete",
      },
    ],
    quickStats: [
      { label: "My Tasks", value: 4, icon: ClipboardList },
      { label: "My Issues", value: 0, icon: AlertCircle },
      { label: "My Controls", value: 0, icon: Shield },
      { label: "My Narratives", value: 0, icon: FileText },
      { label: "My Risks", value: 0, icon: Target },
      { label: "My Comments", value: 0, icon: MessageSquare },
    ],
  },
  "enterprise-audit": {
    criticalAlert: {
      title: "Climate instability affecting M&A vertical farming acquisition in Singapore",
      label: "M&A Climate Instability",
    },
    scenarioPlanning: {
      title: "Climate Instability (M&A Oversight)",
      progress: "1/2 Completed",
      completed: 1,
      total: 2,
    },
    tasks: [
      {
        id: "audit-1",
        title: "Update Inventory Structure & Coverage Mapping",
        context: "Inventory: M&A",
        preparers: ["Steven Yeun", "Michelle Tu"],
        dueDate: "10-31-2025",
        status: "incomplete",
      },
      {
        id: "audit-2",
        title: "Review Organizational Impact",
        context: "Overview: M&A",
        preparers: ["Steven Yeun", "Michelle Tu"],
        dueDate: "10-31-2025",
        status: "incomplete",
      },
      {
        id: "audit-3",
        title: "Review Audit Impact Scenario",
        context: "Scenario: M&A",
        preparers: ["Steven Yeun", "Michelle Tu"],
        dueDate: "10-31-2025",
        status: "incomplete",
      },
      {
        id: "audit-4",
        title: "Update Audit Committee Presentation",
        context: "Report: M&A",
        preparers: ["Steven Yeun", "Michelle Tu"],
        dueDate: "10-31-2025",
        status: "incomplete",
      },
    ],
    quickStats: [
      { label: "My Tasks", value: 4, icon: ClipboardList },
      { label: "My Issues", value: 0, icon: AlertCircle },
      { label: "My Controls", value: 0, icon: Shield },
      { label: "My Narratives", value: 0, icon: FileText },
      { label: "My Risks", value: 0, icon: Target },
      { label: "My Comments", value: 0, icon: MessageSquare },
    ],
  },
  "it-security": {
    criticalAlert: {
      title: "Major vulnerability impacting Apache Log4j",
      label: "Apache Log4j",
    },
    scenarioPlanning: {
      title: "Apache Log4j Response",
      progress: "2/3 Completed",
      completed: 2,
      total: 3,
    },
    tasks: [
      {
        id: "sec-1",
        title: "Complete Log4j Vulnerability Assessment",
        context: "Assessment: Log4j",
        preparers: ["David Kim", "Rachel Green"],
        dueDate: "11-01-2025",
        status: "incomplete",
      },
      {
        id: "sec-2",
        title: "Patch Critical Systems for Log4j",
        context: "Remediation: Log4j",
        preparers: ["David Kim"],
        dueDate: "11-15-2025",
        status: "incomplete",
      },
      {
        id: "sec-3",
        title: "Update Incident Response for Log4j",
        context: "Response: Log4j",
        preparers: ["Rachel Green", "Tom Anderson"],
        dueDate: "11-30-2025",
        status: "incomplete",
      },
      {
        id: "sec-4",
        title: "Executive Briefing on Log4j Impact",
        context: "Report: Log4j",
        preparers: ["Tom Anderson"],
        dueDate: "12-01-2025",
        status: "incomplete",
      },
    ],
    quickStats: [
      { label: "My Tasks", value: 4, icon: ClipboardList },
      { label: "My Issues", value: 0, icon: AlertCircle },
      { label: "My Controls", value: 0, icon: Shield },
      { label: "My Narratives", value: 0, icon: FileText },
      { label: "My Risks", value: 0, icon: Target },
      { label: "My Comments", value: 0, icon: MessageSquare },
    ],
  },
};

export default function HomePage() {
  const { currentWorkspace, refreshKey } = useWorkspaceStore();
  const content = workspaceContent[currentWorkspace.id] || workspaceContent["enterprise-risk"];

  useEffect(() => {
  }, [refreshKey]);

  return (
    <AppLayout 
      showHeader={true}
      showSideNav={true}
    >
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50" key={refreshKey}>
        <div className="bg-[#266C92] text-white">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-semibold mb-0.5" data-testid="welcome-message">
                  Welcome back, {currentWorkspace.personaTitle}
                </h1>
                <p className="text-white/80 text-sm" data-testid="welcome-subtitle">
                  {content.tasks.filter(t => t.status === "incomplete").length} New critical tasks to review
                </p>
              </div>
              {content.criticalAlert && (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-md px-4 py-2.5">
                  <Badge variant="destructive" className="bg-red-500 text-white text-xs font-medium uppercase" data-testid="critical-badge">
                    Critical
                  </Badge>
                  <span className="text-sm" data-testid="critical-alert-title">{content.criticalAlert.title}</span>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-7 w-7" data-testid="critical-alert-action">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {content.quickStats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <Card key={index} className="hover-elevate cursor-pointer" data-testid={`quick-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center gap-1">
                      <div className="text-xl font-bold text-gray-900" data-testid={`stat-value-${index}`}>{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card data-testid="task-overview-card">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm font-semibold text-gray-900">Task Overview</CardTitle>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs" data-testid="incomplete-count">
                      Incomplete {content.tasks.filter(t => t.status === "incomplete").length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100" data-testid="task-list">
                    {content.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        data-testid={`task-item-${task.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50 h-5">
                              Incomplete
                            </Badge>
                          </div>
                          <div className="font-medium text-gray-900 text-sm" data-testid={`task-title-${task.id}`}>{task.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{task.context}</div>
                        </div>
                        <div className="flex-shrink-0 text-right hidden sm:block">
                          <div className="text-xs text-gray-400 mb-0.5">Preparer(s)</div>
                          <div className="flex items-center gap-1 justify-end">
                            {task.preparers.slice(0, 2).map((preparer, idx) => (
                              <div 
                                key={idx} 
                                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                                title={preparer}
                              >
                                {preparer.split(' ').map(n => n[0]).join('')}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right hidden sm:block">
                          <div className="text-xs text-gray-400 mb-0.5">Due Date</div>
                          <div className="text-sm text-gray-700" data-testid={`task-due-${task.id}`}>{task.dueDate}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card data-testid="scenario-planning-card">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold text-gray-900">Scenario Planning</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700" data-testid="scenario-title">{content.scenarioPlanning.title}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-[#266C92] h-1.5 rounded-full transition-all" 
                        style={{ width: `${(content.scenarioPlanning.completed / content.scenarioPlanning.total) * 100}%` }}
                        data-testid="scenario-progress"
                      />
                    </div>
                    <div className="text-xs text-gray-500" data-testid="scenario-progress-text">{content.scenarioPlanning.progress}</div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="reports-card">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold text-gray-900">Reports</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-2 h-8 px-2 text-sm" data-testid="report-frameworks">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span>Frameworks</span>
                      <Badge variant="secondary" className="ml-auto text-xs bg-amber-100 text-amber-700 h-5">Incomplete</Badge>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-8 px-2 text-sm" data-testid="report-test-files">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Test Files</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="recent-submissions-card">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#266C92]/10 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-[#266C92]" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-gray-900">The New Asgard</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-400 mb-0.5">Preparer(s)</div>
                      <div className="text-sm text-gray-700">SIG LITE Questionnaire</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Steven Yeun</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-0.5">Submitted</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">10-31-2025</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
