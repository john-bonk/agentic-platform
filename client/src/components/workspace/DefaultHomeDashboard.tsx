import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Target,
  Shield,
  Zap,
} from "lucide-react";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";
import { useSettings } from "@/components/settings-panel";
import { useWorkspaceStore, workspaces as storeWorkspaces } from "@/lib/workspaceStore";
import headerBgImage from "@/assets/header-background.png";
import type { UserPersona } from "@/lib/workspaceStore";
import { generateCustomWorkspaceContent } from "./HomePageContent";
import type { WorkspaceContentData, Issue, Control, Narrative, Risk, TabComment, Task } from "./HomePageContent";

const defaultWorkspaces = [
  {
    id: "enterprise-risk",
    name: "Enterprise Risk",
    icon: Target,
    color: "#266C92",
    description: "Integration description lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc malesuada libero id nisl bibendum ultrices.",
  },
  {
    id: "enterprise-audit",
    name: "Enterprise Audit",
    icon: Shield,
    color: "#266C92",
    description: "Integration description lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc malesuada libero id nisl bibendum ultrices.",
  },
  {
    id: "it-security",
    name: "IT Security",
    icon: Zap,
    color: "#266C92",
    description: "Integration description lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc malesuada libero id nisl bibendum ultrices.",
  },
];

interface ChartStats {
  segments: { count: number; color: string; label: string }[];
  total: number;
  openCount: number;
  centerLabel: string;
}

function getTabChartStats(activeTab: string, content: WorkspaceContentData): ChartStats {
  const tc = content.tabContent;
  switch (activeTab) {
    case "My Tasks": {
      const items = tc?.tasks || content.tasks;
      const incomplete = items.filter(t => t.status === "incomplete").length;
      const inProgress = items.filter(t => t.status === "in-progress").length;
      const complete = items.filter(t => t.status === "complete").length;
      return {
        segments: [
          { count: incomplete, color: "#f59e0b", label: "Incomplete" },
          { count: inProgress, color: "#3b82f6", label: "In Progress" },
          { count: complete, color: "#10b981", label: "Complete" },
        ],
        total: items.length,
        openCount: incomplete + inProgress,
        centerLabel: "Open Tasks",
      };
    }
    case "My Issues": {
      const items = tc?.issues || [];
      const open = items.filter(i => i.status === "open").length;
      const investigating = items.filter(i => i.status === "investigating").length;
      const resolved = items.filter(i => i.status === "resolved").length;
      return {
        segments: [
          { count: open, color: "#f59e0b", label: "Open" },
          { count: investigating, color: "#3b82f6", label: "Investigating" },
          { count: resolved, color: "#10b981", label: "Resolved" },
        ],
        total: items.length,
        openCount: open + investigating,
        centerLabel: "Open Issues",
      };
    }
    case "My Controls": {
      const items = tc?.controls || [];
      const needsTesting = items.filter(c => c.effectiveness === "needs-testing").length;
      const ineffective = items.filter(c => c.effectiveness === "ineffective").length;
      const effective = items.filter(c => c.effectiveness === "effective").length;
      return {
        segments: [
          { count: needsTesting, color: "#f59e0b", label: "Needs Testing" },
          { count: ineffective, color: "#ef4444", label: "Ineffective" },
          { count: effective, color: "#10b981", label: "Effective" },
        ],
        total: items.length,
        openCount: needsTesting + ineffective,
        centerLabel: "Action Needed",
      };
    }
    case "My Narratives": {
      const items = tc?.narratives || [];
      const draft = items.filter(n => n.status === "draft").length;
      const inReview = items.filter(n => n.status === "in-review").length;
      const approved = items.filter(n => n.status === "approved").length;
      return {
        segments: [
          { count: draft, color: "#f59e0b", label: "Draft" },
          { count: inReview, color: "#3b82f6", label: "In Review" },
          { count: approved, color: "#10b981", label: "Approved" },
        ],
        total: items.length,
        openCount: draft + inReview,
        centerLabel: "Pending",
      };
    }
    case "My Risks": {
      const items = tc?.risks || [];
      const notStarted = items.filter(r => r.mitigationStatus === "not-started").length;
      const inProgress = items.filter(r => r.mitigationStatus === "in-progress").length;
      const mitigated = items.filter(r => r.mitigationStatus === "mitigated").length;
      return {
        segments: [
          { count: notStarted, color: "#f59e0b", label: "Not Started" },
          { count: inProgress, color: "#3b82f6", label: "In Progress" },
          { count: mitigated, color: "#10b981", label: "Mitigated" },
        ],
        total: items.length,
        openCount: notStarted + inProgress,
        centerLabel: "Open Risks",
      };
    }
    case "My Comments": {
      const items = tc?.comments || [];
      const newC = items.filter(c => c.status === "new").length;
      const flagged = items.filter(c => c.status === "flagged").length;
      const read = items.filter(c => c.status === "read").length;
      return {
        segments: [
          { count: newC, color: "#f59e0b", label: "New" },
          { count: flagged, color: "#ef4444", label: "Flagged" },
          { count: read, color: "#10b981", label: "Read" },
        ],
        total: items.length,
        openCount: newC + flagged,
        centerLabel: "Unread",
      };
    }
    default:
      return { segments: [], total: 0, openCount: 0, centerLabel: "" };
  }
}

function DonutChart({ stats }: { stats: ChartStats }) {
  const circumference = 2 * Math.PI * 45;
  if (stats.total === 0) {
    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-foreground">0</span>
          <span className="text-sm text-gray-500 dark:text-muted-foreground">{stats.centerLabel}</span>
        </div>
      </div>
    );
  }

  let offset = 0;
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90 transition-all duration-500 ease-out" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        {stats.segments.map((seg, idx) => {
          const pct = (seg.count / stats.total) * 100;
          const el = seg.count > 0 ? (
            <circle
              key={idx}
              cx="50" cy="50" r="45" fill="none" stroke={seg.color} strokeWidth="10"
              strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
              strokeDashoffset={-(offset / 100) * circumference}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          ) : null;
          offset += pct;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300">
        <span className="text-4xl font-bold text-gray-900 dark:text-foreground">{stats.openCount}</span>
        <span className="text-sm text-gray-500 dark:text-muted-foreground">{stats.centerLabel}</span>
      </div>
    </div>
  );
}

function getStatusBadge(status: Task["status"]) {
  switch (status) {
    case "complete":
      return { label: "Complete", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "in-progress":
      return { label: "In Progress", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" };
    default:
      return { label: "Incomplete", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getIssueSeverityBadge(severity: Issue["severity"]) {
  switch (severity) {
    case "critical":
      return { label: "Critical", className: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" };
    case "high":
      return { label: "High", className: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400" };
    case "medium":
      return { label: "Medium", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
    default:
      return { label: "Low", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" };
  }
}

function getControlBadge(effectiveness: Control["effectiveness"]) {
  switch (effectiveness) {
    case "effective":
      return { label: "Effective", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "ineffective":
      return { label: "Ineffective", className: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" };
    default:
      return { label: "Needs Testing", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getNarrativeBadge(status: Narrative["status"]) {
  switch (status) {
    case "approved":
      return { label: "Approved", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "in-review":
      return { label: "In Review", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" };
    default:
      return { label: "Draft", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getRiskBadge(status: Risk["mitigationStatus"]) {
  switch (status) {
    case "mitigated":
      return { label: "Mitigated", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "in-progress":
      return { label: "In Progress", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" };
    default:
      return { label: "Not Started", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getCommentBadge(status: TabComment["status"]) {
  switch (status) {
    case "read":
      return { label: "Read", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "flagged":
      return { label: "Flagged", className: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" };
    default:
      return { label: "New", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getTabOverviewTitle(activeTab: string): string {
  switch (activeTab) {
    case "My Tasks": return "Task Overview";
    case "My Issues": return "Issue Overview";
    case "My Controls": return "Control Overview";
    case "My Narratives": return "Narrative Overview";
    case "My Risks": return "Risk Overview";
    case "My Comments": return "Comment Overview";
    default: return "Overview";
  }
}

function getTabListTitle(activeTab: string, content: WorkspaceContentData): string {
  switch (activeTab) {
    case "My Tasks": return content.scenarioPlanning.title;
    case "My Issues": return "Open Issues";
    case "My Controls": return "Control Status";
    case "My Narratives": return "Narratives";
    case "My Risks": return "Risk Register";
    case "My Comments": return "Recent Comments";
    default: return content.scenarioPlanning.title;
  }
}

interface DefaultHomeDashboardProps {
  workspaceName: string;
  userPersona: UserPersona;
  selectedModules: string[];
}

export function DefaultHomeDashboard({ workspaceName, userPersona, selectedModules }: DefaultHomeDashboardProps) {
  const [activeTab, setActiveTab] = useState("My Tasks");
  const [scenarioExpanded, setScenarioExpanded] = useState(true);
  const { setOpen: setAssistantOpen } = useHomeAssistantStore();
  const { currentWorkspace, setWorkspace } = useWorkspaceStore();
  const dhdSettings = useSettings();
  const dhdAssistantLabel = dhdSettings.agentHubEnabled ? "Optro Assistant" : "AuditBoard Assistant";

  const content = useMemo(() => generateCustomWorkspaceContent(selectedModules), [selectedModules]);
  const chartStats = useMemo(() => getTabChartStats(activeTab, content), [activeTab, content]);

  const welcomeMessage = (() => {
    switch (userPersona) {
      case "CRO": return "Chief Risk Officer Dashboard";
      case "CAE": return "Chief Audit Executive Dashboard";
      case "CISO": return "Security Operations Dashboard";
      case "Executive": return "Welcome back!";
      default: return `Welcome back, ${userPersona}`;
    }
  })();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div
        className="text-white px-8 pt-6 pb-32 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${headerBgImage})` }}
      >
        <div className="max-w-6xl relative z-10">
          <h1 className="text-2xl font-semibold" data-testid="welcome-message">
            {welcomeMessage}
            <span className="ml-4 text-base font-normal text-white/80">
              {chartStats.openCount} New critical{" "}
              <span className="underline cursor-pointer hover:text-white">tasks to review</span>
            </span>
          </h1>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-background px-8 py-6 -mt-24 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">

          <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="assistant-card">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground text-center mb-4">
                What would you like to do?
              </h2>
              <div className="flex items-center gap-3 max-w-2xl mx-auto mb-4">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                  <Input
                    placeholder={`Ask ${dhdAssistantLabel}...`}
                    className="pl-10 h-10 bg-slate-50 dark:bg-muted border-slate-200 dark:border-border"
                    data-testid="input-assistant-default"
                    onFocus={() => setAssistantOpen(true)}
                  />
                </div>
                <Button
                  className="bg-[#266C92] hover:bg-[#1e5a7a] text-white px-6"
                  data-testid="button-get-started-default"
                  onClick={() => setAssistantOpen(true)}
                >
                  Get Started
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {content.quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className="text-sm text-gray-600 dark:text-muted-foreground gap-2"
                    data-testid={`button-quick-action-${action.id}`}
                    onClick={() => setAssistantOpen(true)}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div data-testid="inbox-section">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-3">Inbox</h2>
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-border overflow-x-auto">
              {content.inboxStats.map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => setActiveTab(stat.label)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${
                    activeTab === stat.label
                      ? "text-[#266C92]"
                      : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground"
                  }`}
                  data-testid={`tab-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {stat.label}{" "}
                  <span className={`ml-1 ${activeTab === stat.label ? "text-[#266C92]" : "text-gray-400 dark:text-muted-foreground"}`}>
                    {stat.value}
                  </span>
                  {activeTab === stat.label && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#266C92]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="task-overview-card">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-1">{getTabOverviewTitle(activeTab)}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground mb-6 flex-wrap">
                  {chartStats.segments.filter(s => s.count > 0).map((seg) => (
                    <div key={seg.label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span>{seg.count} {seg.label}</span>
                    </div>
                  ))}
                </div>
                <DonutChart stats={chartStats} />
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-muted-foreground flex-wrap">
                  {chartStats.segments.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                      {seg.label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="scenario-card">
              <CardContent className="p-0 flex flex-col h-[340px]">
                <button
                  onClick={() => setScenarioExpanded(!scenarioExpanded)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-muted border-b border-slate-200 dark:border-border text-left hover-elevate transition-colors flex-shrink-0"
                  data-testid="button-scenario-toggle-default"
                >
                  {scenarioExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-foreground">{getTabListTitle(activeTab, content)}</span>
                </button>

                {scenarioExpanded && (
                  <div
                    className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-border"
                    data-testid="task-list-default"
                  >
                    {activeTab === "My Tasks" && (content.tabContent?.tasks || content.tasks).map((task) => {
                      const badge = getStatusBadge(task.status);
                      return (
                        <div key={task.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`task-item-${task.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer" data-testid={`task-title-${task.id}`}>{task.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{task.context}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Due Date</div>
                            <div className="text-sm text-gray-700 dark:text-foreground" data-testid={`task-due-${task.id}`}>{task.dueDate}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Issues" && (content.tabContent?.issues || []).map((issue) => {
                      const badge = getIssueSeverityBadge(issue.severity);
                      return (
                        <div key={issue.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`issue-item-${issue.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{issue.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{issue.source} &middot; {issue.assignee}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Reported</div>
                            <div className="text-sm text-gray-700 dark:text-foreground">{issue.dateReported}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Controls" && (content.tabContent?.controls || []).map((ctrl) => {
                      const badge = getControlBadge(ctrl.effectiveness);
                      return (
                        <div key={ctrl.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`control-item-${ctrl.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{ctrl.controlId} - {ctrl.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{ctrl.framework} &middot; {ctrl.owner}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Last Test</div>
                            <div className="text-sm text-gray-700 dark:text-foreground">{ctrl.testDate}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Narratives" && (content.tabContent?.narratives || []).map((narr) => {
                      const badge = getNarrativeBadge(narr.status);
                      return (
                        <div key={narr.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`narrative-item-${narr.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{narr.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{narr.process} &middot; {narr.author}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Updated</div>
                            <div className="text-sm text-gray-700 dark:text-foreground">{narr.lastUpdated}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Risks" && (content.tabContent?.risks || []).map((risk) => {
                      const badge = getRiskBadge(risk.mitigationStatus);
                      return (
                        <div key={risk.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`risk-item-${risk.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{risk.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{risk.riskCategory} &middot; L: {risk.likelihood} / I: {risk.impact} &middot; {risk.owner}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Comments" && (content.tabContent?.comments || []).map((comment) => {
                      const badge = getCommentBadge(comment.status);
                      return (
                        <div key={comment.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`comment-item-${comment.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{comment.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{comment.context} &middot; {comment.author} &middot; {comment.threadCount} replies</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Date</div>
                            <div className="text-sm text-gray-700 dark:text-foreground">{comment.date}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div data-testid="workspaces-section">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">Your workspaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {defaultWorkspaces.map((ws) => {
                const Icon = ws.icon;
                const isActive = currentWorkspace && ws.id === currentWorkspace.id;
                return (
                  <Card
                    key={ws.id}
                    className={`shadow-sm border ${
                      isActive ? "border-[#266C92] bg-white dark:bg-card" : "border-slate-200 dark:border-border bg-white dark:bg-card"
                    }`}
                    data-testid={`workspace-card-${ws.id}`}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${ws.color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: ws.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-foreground text-sm">{ws.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
                          {ws.description}
                        </p>
                      </div>
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={`flex-shrink-0 ${isActive ? "bg-[#266C92]" : ""}`}
                        data-testid={`button-workspace-${ws.id}`}
                        onClick={() => {
                          if (!isActive) {
                            const storeWs = storeWorkspaces.find(w => w.id === ws.id);
                            if (storeWs) setWorkspace(storeWs);
                          }
                        }}
                      >
                        {isActive ? "Active" : "Switch"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
