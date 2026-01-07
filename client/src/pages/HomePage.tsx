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
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart3,
  Shield,
  Target,
  ClipboardList,
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
  criticalAlert?: { title: string; description: string };
  scenarioPlanning: ScenarioPlanning;
  tasks: Task[];
  quickStats: QuickStat[];
}> = {
  "enterprise-risk": {
    criticalAlert: {
      title: "Major vulnerability impacting Apache Log4j",
      description: "Critical security vulnerability requires immediate attention across all systems",
    },
    scenarioPlanning: {
      title: "Climate Instability (M&A Oversight)",
      progress: "1/2 Completed",
      completed: 1,
      total: 2,
    },
    tasks: [
      {
        id: "risk-1",
        title: "Update Risk Register for Q4 Assessment",
        context: "Risk Register: Corporate",
        preparers: ["Sarah Chen", "Michael Torres"],
        dueDate: "10-31-2025",
        status: "incomplete",
      },
      {
        id: "risk-2",
        title: "Review Third-Party Vendor Risk Scores",
        context: "Vendor Risk: Technology",
        preparers: ["James Wilson"],
        dueDate: "11-15-2025",
        status: "incomplete",
      },
      {
        id: "risk-3",
        title: "Complete ERM Framework Gap Analysis",
        context: "Framework: ERM",
        preparers: ["Sarah Chen", "Amanda Liu"],
        dueDate: "11-30-2025",
        status: "incomplete",
      },
      {
        id: "risk-4",
        title: "Update Board Risk Appetite Statement",
        context: "Governance: Board",
        preparers: ["Michael Torres"],
        dueDate: "12-15-2025",
        status: "incomplete",
      },
    ],
    quickStats: [
      { label: "My Tasks", value: 4, icon: ClipboardList },
      { label: "My Risks", value: 12, icon: Target },
      { label: "My Controls", value: 8, icon: Shield },
      { label: "My Comments", value: 3, icon: FileText },
    ],
  },
  "enterprise-audit": {
    criticalAlert: {
      title: "Major vulnerability impacting Apache Log4j",
      description: "Critical security vulnerability requires immediate attention",
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
      { label: "My Issues", value: 0, icon: AlertTriangle },
      { label: "My Controls", value: 0, icon: Shield },
      { label: "My Narratives", value: 0, icon: FileText },
    ],
  },
  "it-security": {
    criticalAlert: {
      title: "Zero-day exploit detected in network infrastructure",
      description: "Immediate patching required for critical systems",
    },
    scenarioPlanning: {
      title: "Ransomware Response Drill",
      progress: "2/3 Completed",
      completed: 2,
      total: 3,
    },
    tasks: [
      {
        id: "sec-1",
        title: "Complete SOC 2 Type II Evidence Collection",
        context: "Compliance: SOC 2",
        preparers: ["David Kim", "Rachel Green"],
        dueDate: "11-01-2025",
        status: "incomplete",
      },
      {
        id: "sec-2",
        title: "Review Access Control Matrix Updates",
        context: "Security: IAM",
        preparers: ["David Kim"],
        dueDate: "11-15-2025",
        status: "incomplete",
      },
      {
        id: "sec-3",
        title: "Update Incident Response Playbook",
        context: "Security: IR",
        preparers: ["Rachel Green", "Tom Anderson"],
        dueDate: "11-30-2025",
        status: "incomplete",
      },
      {
        id: "sec-4",
        title: "Complete Penetration Test Remediation",
        context: "Security: Assessment",
        preparers: ["Tom Anderson"],
        dueDate: "12-01-2025",
        status: "incomplete",
      },
    ],
    quickStats: [
      { label: "My Tasks", value: 4, icon: ClipboardList },
      { label: "My Vulnerabilities", value: 7, icon: AlertTriangle },
      { label: "My Controls", value: 15, icon: Shield },
      { label: "My Incidents", value: 2, icon: Target },
    ],
  },
};

export default function HomePage() {
  const { currentWorkspace, refreshKey } = useWorkspaceStore();
  const content = workspaceContent[currentWorkspace.id] || workspaceContent["enterprise-risk"];

  useEffect(() => {
    // This effect runs when workspace changes (refreshKey updates)
  }, [refreshKey]);

  return (
    <AppLayout 
      showHeader={true}
      showSideNav={true}
    >
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50" key={refreshKey}>
        <div className="bg-[#266C92] text-white">
          <div className="px-6 py-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold mb-1" data-testid="welcome-message">
                  Welcome back, {currentWorkspace.persona}
                </h1>
                <p className="text-white/80 text-sm" data-testid="welcome-subtitle">
                  {content.tasks.filter(t => t.status === "incomplete").length} New critical tasks to review
                </p>
              </div>
              {content.criticalAlert && (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 max-w-md">
                  <Badge variant="destructive" className="bg-red-500 text-white text-xs font-medium" data-testid="critical-badge">
                    CRITICAL
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" data-testid="critical-alert-title">{content.criticalAlert.title}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" data-testid="critical-alert-action">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {content.quickStats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <Card key={index} className="hover-elevate cursor-pointer" data-testid={`quick-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-2xl font-bold text-gray-900" data-testid={`stat-value-${index}`}>{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <StatIcon className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card data-testid="task-overview-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base font-semibold text-gray-900">Task Overview</CardTitle>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700" data-testid="incomplete-count">
                      Incomplete {content.tasks.filter(t => t.status === "incomplete").length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100" data-testid="task-list">
                    {content.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        data-testid={`task-item-${task.id}`}
                      >
                        <div className="flex-shrink-0">
                          {task.status === "complete" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center">
                              <Clock className="w-3 h-3 text-amber-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                              Incomplete
                            </Badge>
                          </div>
                          <div className="font-medium text-gray-900 text-sm" data-testid={`task-title-${task.id}`}>{task.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{task.context}</div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs text-gray-500 mb-1">Preparer(s)</div>
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
                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs text-gray-500 mb-1">Due Date</div>
                          <div className="text-sm text-gray-700" data-testid={`task-due-${task.id}`}>{task.dueDate}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card data-testid="scenario-planning-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Scenario Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-700" data-testid="scenario-title">{content.scenarioPlanning.title}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#266C92] h-2 rounded-full transition-all" 
                        style={{ width: `${(content.scenarioPlanning.completed / content.scenarioPlanning.total) * 100}%` }}
                        data-testid="scenario-progress"
                      />
                    </div>
                    <div className="text-xs text-gray-500" data-testid="scenario-progress-text">{content.scenarioPlanning.progress}</div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="reports-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3" data-testid="report-frameworks">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Frameworks</span>
                      <Badge variant="secondary" className="ml-auto text-xs bg-amber-100 text-amber-700">Incomplete</Badge>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3" data-testid="report-test-files">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Test Files</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="recent-submissions-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Recent Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded bg-[#266C92]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#266C92]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">SIG LITE Questionnaire</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Steven Yeun</span>
                        <Calendar className="w-3 h-3 text-gray-400 ml-2" />
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
