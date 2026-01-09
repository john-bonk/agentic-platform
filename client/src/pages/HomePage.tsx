/**
 * Home Page - Complete redesign to match mockup
 * 
 * Layout structure:
 * 1. Teal hero header with welcome message
 * 2. "What would you like to do?" assistant card
 * 3. Inbox section with horizontal stat tabs
 * 4. Two-column: Task Overview donut + Task list
 * 5. Your workspaces section
 */

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown,
  ChevronRight, 
  Sparkles,
  Send,
  Target,
  Shield,
  Zap,
} from "lucide-react";
import { useWorkspaceStore, workspaces as storeWorkspaces } from "@/lib/workspaceStore";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";
import headerBgImage from "@assets/Welcome_Image_1767849747805.png";

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

interface InboxStat {
  label: string;
  value: number;
}

const workspaceContent: Record<string, {
  scenarioPlanning: ScenarioPlanning;
  tasks: Task[];
  inboxStats: InboxStat[];
  quickActions: { label: string; id: string }[];
}> = {
  "enterprise-risk": {
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
    inboxStats: [
      { label: "My Tasks", value: 4 },
      { label: "My Issues", value: 0 },
      { label: "My Controls", value: 0 },
      { label: "My Narratives", value: 0 },
      { label: "My Risks", value: 0 },
      { label: "My Comments", value: 0 },
    ],
    quickActions: [
      { label: "Create new Risk Event", id: "risk-event" },
      { label: "Start new Risk Assessment", id: "risk-assessment" },
      { label: "Create new Audit", id: "audit" },
    ],
  },
  "enterprise-audit": {
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
    inboxStats: [
      { label: "My Tasks", value: 4 },
      { label: "My Issues", value: 0 },
      { label: "My Controls", value: 0 },
      { label: "My Narratives", value: 0 },
      { label: "My Risks", value: 0 },
      { label: "My Comments", value: 0 },
    ],
    quickActions: [
      { label: "Create new Risk Event", id: "risk-event" },
      { label: "Start new Risk Assessment", id: "risk-assessment" },
      { label: "Create new Audit", id: "audit" },
    ],
  },
  "it-security": {
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
    inboxStats: [
      { label: "My Tasks", value: 4 },
      { label: "My Issues", value: 0 },
      { label: "My Controls", value: 0 },
      { label: "My Narratives", value: 0 },
      { label: "My Risks", value: 0 },
      { label: "My Comments", value: 0 },
    ],
    quickActions: [
      { label: "Create new Risk Event", id: "risk-event" },
      { label: "Start new Risk Assessment", id: "risk-assessment" },
      { label: "Create new Audit", id: "audit" },
    ],
  },
};

const workspaces = [
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

function DonutChart({ value, total }: { value: number; total: number }) {
  const percentage = (value / total) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="10"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">Open Tasks</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { currentWorkspace, refreshKey, setWorkspace } = useWorkspaceStore();
  const content = workspaceContent[currentWorkspace.id] || workspaceContent["enterprise-risk"];
  const [activeTab, setActiveTab] = useState("My Tasks");
  const [scenarioExpanded, setScenarioExpanded] = useState(true);
  const { setOpen: setAssistantOpen } = useHomeAssistantStore();

  useEffect(() => {
    setActiveTab("My Tasks");
  }, [refreshKey]);

  const incompleteTasks = content.tasks.filter(t => t.status === "incomplete").length;

  return (
    <AppLayout showHeader={true} showSideNav={true}>
      <div className="flex flex-col h-full overflow-y-auto" key={refreshKey}>
        {/* Hero Header with Background Image - extends behind the assistant card */}
        <div 
          className="text-white px-8 pt-6 pb-32 bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${headerBgImage})` }}
        >
          <div className="max-w-6xl relative z-10">
            <h1 className="text-2xl font-semibold" data-testid="welcome-message">
              Welcome back, {currentWorkspace.personaTitle}
              <span className="ml-4 text-base font-normal text-white/80">
                {incompleteTasks} New critical{" "}
                <span className="underline cursor-pointer hover:text-white">tasks to review</span>
              </span>
            </h1>
          </div>
        </div>

        {/* Main Content - negative margin to overlap the header, higher z-index */}
        <div className="flex-1 bg-slate-50 px-8 py-6 -mt-24 relative z-10">
          <div className="max-w-6xl space-y-6">
            
            {/* What would you like to do? Card */}
            <Card className="shadow-sm border border-slate-200 bg-white" data-testid="assistant-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
                  What would you like to do?
                </h2>
                <div className="flex items-center gap-3 max-w-2xl mx-auto mb-4">
                  <div className="relative flex-1">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Ask AuditBoard Assistant..."
                      className="pl-10 h-10 bg-slate-50 border-slate-200"
                      data-testid="input-assistant"
                      onFocus={() => setAssistantOpen(true)}
                    />
                  </div>
                  <Button 
                    className="bg-[#266C92] hover:bg-[#1e5a7a] text-white px-6" 
                    data-testid="button-get-started"
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
                      className="text-sm text-gray-600 gap-2"
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

            {/* Inbox Section */}
            <div data-testid="inbox-section">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Inbox</h2>
              <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
                {content.inboxStats.map((stat) => (
                  <button
                    key={stat.label}
                    onClick={() => setActiveTab(stat.label)}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${
                      activeTab === stat.label
                        ? "text-[#266C92]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    data-testid={`tab-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {stat.label}{" "}
                    <span className={`ml-1 ${activeTab === stat.label ? "text-[#266C92]" : "text-gray-400"}`}>
                      {stat.value}
                    </span>
                    {activeTab === stat.label && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#266C92]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Overview + Scenario Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              {/* Left: Task Overview Donut */}
              <Card className="shadow-sm border border-slate-200" data-testid="task-overview-card">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Task Overview</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <span>Incomplete</span>
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    <span>{incompleteTasks}</span>
                  </div>
                  <DonutChart value={incompleteTasks} total={incompleteTasks || 1} />
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Incomplete
                  </div>
                </CardContent>
              </Card>

              {/* Right: Scenario Task List */}
              <Card className="shadow-sm border border-slate-200" data-testid="scenario-card">
                <CardContent className="p-0">
                  {/* Scenario Header */}
                  <button
                    onClick={() => setScenarioExpanded(!scenarioExpanded)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 text-left hover:bg-slate-100 transition-colors"
                    data-testid="button-scenario-toggle"
                  >
                    {scenarioExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="font-medium text-gray-900">{content.scenarioPlanning.title}</span>
                  </button>

                  {/* Task List */}
                  {scenarioExpanded && (
                    <div className="divide-y divide-slate-100" data-testid="task-list">
                      {content.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-4 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                          data-testid={`task-item-${task.id}`}
                        >
                          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded mt-0.5">
                            Incomplete
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] hover:underline cursor-pointer" data-testid={`task-title-${task.id}`}>
                              {task.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{task.context}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400">Due Date</div>
                            <div className="text-sm text-gray-700" data-testid={`task-due-${task.id}`}>{task.dueDate}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Your Workspaces Section */}
            <div data-testid="workspaces-section">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Your workspaces</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {workspaces.map((ws) => {
                  const Icon = ws.icon;
                  const isActive = ws.id === currentWorkspace.id;
                  return (
                    <Card
                      key={ws.id}
                      className={`shadow-sm border ${
                        isActive ? "border-[#266C92] bg-white" : "border-slate-200 bg-white"
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
                          <h3 className="font-semibold text-gray-900 text-sm">{ws.name}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {ws.description}
                          </p>
                        </div>
                        <Button
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className={`flex-shrink-0 ${isActive ? "bg-[#266C92] hover:bg-[#1e5a7a]" : ""}`}
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
    </AppLayout>
  );
}
