/**
 * Home Page - Complete redesign to match mockup
 * 
 * Layout structure:
 * 1. Teal hero header with welcome message
 * 2. "What would you like to do?" assistant card
 * 3. Inbox section with horizontal stat tabs
 * 4. Two-column: Task Overview donut + Task list
 * 5. Your workspaces section
 * 
 * Custom workspaces show "Welcome back!" without persona and
 * display content based on selected solution capabilities.
 */

import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
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
import { useWorkspaceStore, workspaces as storeWorkspaces, solutionCapabilities, type UserPersona } from "@/lib/workspaceStore";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";
import headerBgImage from "@/assets/header-background.png";

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

interface WorkspaceContentData {
  scenarioPlanning: ScenarioPlanning;
  tasks: Task[];
  inboxStats: InboxStat[];
  quickActions: { label: string; id: string }[];
}

const workspaceContent: Record<string, WorkspaceContentData> = {
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
      { label: "Review Risk Register", id: "risk-register" },
    ],
  },
  "enterprise-audit": {
    scenarioPlanning: {
      title: "Vertical Farming M&A",
      progress: "3/8 Completed",
      completed: 3,
      total: 8,
    },
    tasks: [
      {
        id: "audit-1",
        title: "Update Inventory Structure & Coverage Mapping",
        context: "Inventory: M&A Vertical Farming",
        preparers: ["Steven Yeun", "Michelle Tu"],
        dueDate: "10-31-2025",
        status: "complete",
      },
      {
        id: "audit-2",
        title: "Review Organizational Impact Assessment",
        context: "Overview: M&A Integration",
        preparers: ["Steven Yeun", "Michelle Tu"],
        dueDate: "10-31-2025",
        status: "complete",
      },
      {
        id: "audit-3",
        title: "Evaluate Target Company Financial Controls",
        context: "Due Diligence: Vertical Farming Co.",
        preparers: ["Michelle Tu", "Alex Park"],
        dueDate: "11-05-2025",
        status: "in-progress",
      },
      {
        id: "audit-4",
        title: "Review M&A Impact Scenario Analysis",
        context: "Scenario: Climate Risk Mitigation",
        preparers: ["Steven Yeun"],
        dueDate: "11-10-2025",
        status: "in-progress",
      },
      {
        id: "audit-5",
        title: "Assess Supply Chain Integration Risks",
        context: "Risk Assessment: M&A",
        preparers: ["Alex Park", "Jennifer Liu"],
        dueDate: "11-15-2025",
        status: "incomplete",
      },
      {
        id: "audit-6",
        title: "Validate Environmental Compliance Documentation",
        context: "Compliance: ESG Due Diligence",
        preparers: ["Michelle Tu"],
        dueDate: "11-20-2025",
        status: "incomplete",
      },
      {
        id: "audit-7",
        title: "Update Audit Committee Presentation",
        context: "Report: M&A Oversight",
        preparers: ["Steven Yeun", "Michelle Tu"],
        dueDate: "11-30-2025",
        status: "incomplete",
      },
      {
        id: "audit-8",
        title: "Finalize Post-Acquisition Integration Audit Plan",
        context: "Planning: Post-Close Audit",
        preparers: ["Jennifer Liu"],
        dueDate: "12-05-2025",
        status: "complete",
      },
    ],
    inboxStats: [
      { label: "My Tasks", value: 8 },
      { label: "My Issues", value: 3 },
      { label: "My Controls", value: 5 },
      { label: "My Narratives", value: 2 },
      { label: "My Risks", value: 1 },
      { label: "My Comments", value: 4 },
    ],
    quickActions: [
      { label: "Create new Audit", id: "new-audit" },
      { label: "Start new Workpaper", id: "new-workpaper" },
      { label: "Log Audit Finding", id: "new-finding" },
    ],
  },
  "it-security": {
    scenarioPlanning: {
      title: "Zero Day Event for Apache Log4j (CVE-2021-44228)",
      progress: "4/12 Completed",
      completed: 4,
      total: 12,
    },
    tasks: [
      {
        id: "sec-1",
        title: "Identify All Log4j Instances Across Environment",
        context: "Discovery: Log4j CVE-2021-44228",
        preparers: ["David Kim", "Rachel Green"],
        dueDate: "10-25-2025",
        status: "complete",
      },
      {
        id: "sec-2",
        title: "Complete Log4j Vulnerability Assessment",
        context: "Assessment: Critical Severity",
        preparers: ["David Kim"],
        dueDate: "10-31-2025",
        status: "complete",
      },
      {
        id: "sec-3",
        title: "Patch Critical Production Systems for Log4j",
        context: "Remediation: Production",
        preparers: ["Tom Anderson", "David Kim"],
        dueDate: "11-01-2025",
        status: "in-progress",
      },
      {
        id: "sec-4",
        title: "Deploy WAF Rules to Block Exploitation Attempts",
        context: "Mitigation: Network Defense",
        preparers: ["Rachel Green"],
        dueDate: "11-05-2025",
        status: "in-progress",
      },
      {
        id: "sec-5",
        title: "Scan Third-Party Applications for Log4j",
        context: "Vendor Risk: Log4j Exposure",
        preparers: ["Sarah Lin", "Tom Anderson"],
        dueDate: "11-10-2025",
        status: "complete",
      },
      {
        id: "sec-6",
        title: "Update Incident Response Playbook for Log4j",
        context: "IR: Zero Day Response",
        preparers: ["Rachel Green", "James Wu"],
        dueDate: "11-15-2025",
        status: "incomplete",
      },
      {
        id: "sec-7",
        title: "Conduct Forensic Analysis on Affected Systems",
        context: "Investigation: Compromise Detection",
        preparers: ["David Kim", "Sarah Lin"],
        dueDate: "11-20-2025",
        status: "incomplete",
      },
      {
        id: "sec-8",
        title: "Notify Affected Business Units & Stakeholders",
        context: "Communication: Internal",
        preparers: ["James Wu"],
        dueDate: "11-25-2025",
        status: "incomplete",
      },
      {
        id: "sec-9",
        title: "Validate Patching Completion Across All Environments",
        context: "Verification: Remediation",
        preparers: ["Tom Anderson", "David Kim"],
        dueDate: "11-30-2025",
        status: "incomplete",
      },
      {
        id: "sec-10",
        title: "Conduct Post-Incident Penetration Test",
        context: "Validation: Security Posture",
        preparers: ["Rachel Green"],
        dueDate: "12-05-2025",
        status: "incomplete",
      },
      {
        id: "sec-11",
        title: "Executive Briefing on Log4j Impact & Response",
        context: "Report: Board Communication",
        preparers: ["David Kim", "Sarah Lin"],
        dueDate: "12-10-2025",
        status: "complete",
      },
      {
        id: "sec-12",
        title: "Document Lessons Learned & Update Security Procedures",
        context: "Post-Mortem: Process Improvement",
        preparers: ["Sarah Lin", "Tom Anderson"],
        dueDate: "12-15-2025",
        status: "in-progress",
      },
    ],
    inboxStats: [
      { label: "My Tasks", value: 12 },
      { label: "My Issues", value: 7 },
      { label: "My Controls", value: 15 },
      { label: "My Narratives", value: 0 },
      { label: "My Risks", value: 8 },
      { label: "My Comments", value: 11 },
    ],
    quickActions: [
      { label: "Report Security Incident", id: "new-incident" },
      { label: "Log Vulnerability", id: "new-vulnerability" },
      { label: "Create Compliance Gap", id: "new-gap" },
    ],
  },
};

const capabilityTaskTemplates: Record<string, Task[]> = {
  "controls-management": [
    { id: "ctrl-1", title: "Review SOX Control Documentation", context: "Controls: Q4 Review", preparers: ["Control Team"], dueDate: "11-15-2025", status: "incomplete" },
    { id: "ctrl-2", title: "Update Control Testing Schedule", context: "Planning: Control Testing", preparers: ["Audit Lead"], dueDate: "11-20-2025", status: "in-progress" },
  ],
  "enterprise-risk": [
    { id: "erm-1", title: "Complete Risk Assessment", context: "Risk: Enterprise Review", preparers: ["Risk Team"], dueDate: "11-10-2025", status: "incomplete" },
    { id: "erm-2", title: "Update Risk Register", context: "Risk: Quarterly Update", preparers: ["Risk Analyst"], dueDate: "11-25-2025", status: "in-progress" },
  ],
  "audit-management": [
    { id: "aud-1", title: "Finalize Audit Workpapers", context: "Audit: Q4 Engagement", preparers: ["Audit Team"], dueDate: "11-12-2025", status: "incomplete" },
    { id: "aud-2", title: "Review Audit Findings", context: "Report: Findings Summary", preparers: ["CAE"], dueDate: "11-30-2025", status: "incomplete" },
  ],
  "cyber-compliance": [
    { id: "cyber-1", title: "Complete Cyber Risk Assessment", context: "Security: Annual Review", preparers: ["Security Team"], dueDate: "11-08-2025", status: "in-progress" },
    { id: "cyber-2", title: "Update Security Policies", context: "Compliance: Policy Review", preparers: ["CISO"], dueDate: "11-22-2025", status: "incomplete" },
  ],
  "information-technology": [
    { id: "it-1", title: "Review IT General Controls", context: "IT: Control Assessment", preparers: ["IT Team"], dueDate: "11-18-2025", status: "incomplete" },
    { id: "it-2", title: "Update System Inventory", context: "IT: Asset Management", preparers: ["IT Admin"], dueDate: "12-01-2025", status: "incomplete" },
  ],
  "regulatory-compliance": [
    { id: "reg-1", title: "ESG Disclosure Review", context: "Compliance: ESG Reporting", preparers: ["Compliance Team"], dueDate: "11-14-2025", status: "in-progress" },
    { id: "reg-2", title: "Regulatory Filing Preparation", context: "Compliance: Q4 Filing", preparers: ["Legal Team"], dueDate: "12-05-2025", status: "incomplete" },
  ],
  "third-party": [
    { id: "tp-1", title: "Vendor Risk Assessment", context: "Vendor: Annual Review", preparers: ["Vendor Team"], dueDate: "11-16-2025", status: "incomplete" },
    { id: "tp-2", title: "Update Vendor Contracts", context: "Vendor: Contract Review", preparers: ["Procurement"], dueDate: "11-28-2025", status: "in-progress" },
  ],
  "ai-governance": [
    { id: "ai-1", title: "AI Model Risk Assessment", context: "AI: Governance Review", preparers: ["AI Team"], dueDate: "11-20-2025", status: "incomplete" },
    { id: "ai-2", title: "Update AI Use Policies", context: "AI: Policy Development", preparers: ["Data Science"], dueDate: "12-10-2025", status: "incomplete" },
  ],
  "environmental-compliance": [
    { id: "env-1", title: "Environmental Impact Assessment", context: "ESG: Environmental Review", preparers: ["ESG Team"], dueDate: "11-22-2025", status: "in-progress" },
    { id: "env-2", title: "Carbon Emissions Reporting", context: "ESG: Emissions Tracking", preparers: ["Sustainability"], dueDate: "12-15-2025", status: "incomplete" },
  ],
};

const capabilityQuickActions: Record<string, { label: string; id: string }[]> = {
  "controls-management": [{ label: "Create Control", id: "new-control" }, { label: "Start Testing", id: "new-test" }],
  "enterprise-risk": [{ label: "Create Risk Event", id: "risk-event" }, { label: "Start Assessment", id: "risk-assessment" }],
  "audit-management": [{ label: "Create Audit", id: "new-audit" }, { label: "Log Finding", id: "new-finding" }],
  "cyber-compliance": [{ label: "Report Incident", id: "new-incident" }, { label: "Log Vulnerability", id: "new-vuln" }],
  "information-technology": [{ label: "Create IT Request", id: "it-request" }, { label: "Log Issue", id: "it-issue" }],
  "regulatory-compliance": [{ label: "Create Filing", id: "new-filing" }, { label: "Log Gap", id: "new-gap" }],
  "third-party": [{ label: "Add Vendor", id: "new-vendor" }, { label: "Start Review", id: "vendor-review" }],
  "ai-governance": [{ label: "Log AI Model", id: "new-model" }, { label: "Start AI Review", id: "ai-review" }],
  "environmental-compliance": [{ label: "Log Emission", id: "new-emission" }, { label: "ESG Report", id: "esg-report" }],
};

function generateCustomWorkspaceContent(capabilities: string[]): WorkspaceContentData {
  const tasks: Task[] = [];
  const quickActionsMap: { [key: string]: { label: string; id: string } } = {};
  
  capabilities.forEach(capId => {
    const capTasks = capabilityTaskTemplates[capId] || [];
    tasks.push(...capTasks);
    
    const capActions = capabilityQuickActions[capId] || [];
    capActions.forEach(action => {
      quickActionsMap[action.id] = action;
    });
  });

  const uniqueTasks = tasks.slice(0, 8);
  const quickActions = Object.values(quickActionsMap).slice(0, 4);

  const incomplete = uniqueTasks.filter(t => t.status === "incomplete").length;
  const inProgress = uniqueTasks.filter(t => t.status === "in-progress").length;
  const complete = uniqueTasks.filter(t => t.status === "complete").length;

  const capabilityNames = capabilities.map(id => 
    solutionCapabilities.find(c => c.id === id)?.name || id
  ).slice(0, 2).join(" & ");

  return {
    scenarioPlanning: {
      title: `${capabilityNames} Initiative`,
      progress: `${complete}/${uniqueTasks.length} Completed`,
      completed: complete,
      total: uniqueTasks.length,
    },
    tasks: uniqueTasks,
    inboxStats: [
      { label: "My Tasks", value: uniqueTasks.length },
      { label: "My Issues", value: Math.floor(Math.random() * 5) },
      { label: "My Controls", value: capabilities.includes("controls-management") ? 8 : 2 },
      { label: "My Narratives", value: capabilities.includes("audit-management") ? 3 : 0 },
      { label: "My Risks", value: capabilities.includes("enterprise-risk") ? 6 : 1 },
      { label: "My Comments", value: Math.floor(Math.random() * 8) },
    ],
    quickActions: quickActions.length > 0 ? quickActions : [
      { label: "Create New Item", id: "new-item" },
      { label: "Start Review", id: "start-review" },
      { label: "Generate Report", id: "new-report" },
    ],
  };
}

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

interface TaskStats {
  incomplete: number;
  inProgress: number;
  complete: number;
  total: number;
}

function DonutChart({ stats }: { stats: TaskStats }) {
  const circumference = 2 * Math.PI * 45;
  
  const incompletePercent = (stats.incomplete / stats.total) * 100;
  const inProgressPercent = (stats.inProgress / stats.total) * 100;
  const completePercent = (stats.complete / stats.total) * 100;
  
  const incompleteOffset = 0;
  const inProgressOffset = incompletePercent;
  const completeOffset = incompletePercent + inProgressPercent;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90 transition-all duration-500 ease-out" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        {stats.complete > 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#10b981"
            strokeWidth="10"
            strokeDasharray={`${(completePercent / 100) * circumference} ${circumference}`}
            strokeDashoffset={-(completeOffset / 100) * circumference}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        )}
        {stats.inProgress > 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="10"
            strokeDasharray={`${(inProgressPercent / 100) * circumference} ${circumference}`}
            strokeDashoffset={-(inProgressOffset / 100) * circumference}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        )}
        {stats.incomplete > 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="10"
            strokeDasharray={`${(incompletePercent / 100) * circumference} ${circumference}`}
            strokeDashoffset={-(incompleteOffset / 100) * circumference}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300">
        <span className="text-4xl font-bold text-gray-900 dark:text-foreground">{stats.incomplete + stats.inProgress}</span>
        <span className="text-sm text-gray-500 dark:text-muted-foreground">Open Tasks</span>
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

export default function HomePage() {
  const { currentWorkspace, refreshKey, setWorkspace, userPersona } = useWorkspaceStore();
  const [, setLocation] = useLocation();
  
  // Redirect custom workspaces to their dedicated page
  useEffect(() => {
    if (currentWorkspace.isCustom) {
      setLocation("/custom-workspace");
    }
  }, [currentWorkspace.isCustom, setLocation]);
  
  const content = useMemo(() => {
    // This should not be reached for custom workspaces due to redirect above
    return workspaceContent[currentWorkspace.id] || workspaceContent["enterprise-risk"];
  }, [currentWorkspace.id]);

  const [activeTab, setActiveTab] = useState("My Tasks");
  const [scenarioExpanded, setScenarioExpanded] = useState(true);
  const { setOpen: setAssistantOpen } = useHomeAssistantStore();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setActiveTab("My Tasks");
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  const taskStats: TaskStats = {
    incomplete: content.tasks.filter(t => t.status === "incomplete").length,
    inProgress: content.tasks.filter(t => t.status === "in-progress").length,
    complete: content.tasks.filter(t => t.status === "complete").length,
    total: content.tasks.length,
  };

  const getWelcomeMessage = () => {
    if (currentWorkspace.isCustom) {
      return userPersona === "Executive" ? "Welcome back!" : `Welcome back, ${userPersona}`;
    }
    return userPersona === "Executive" 
      ? `Welcome back, ${currentWorkspace.persona}` 
      : `Welcome back, ${userPersona}`;
  };
  const welcomeMessage = getWelcomeMessage();

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
              {welcomeMessage}
              <span className="ml-4 text-base font-normal text-white/80">
                {taskStats.incomplete} New critical{" "}
                <span className="underline cursor-pointer hover:text-white">tasks to review</span>
              </span>
            </h1>
          </div>
        </div>

        {/* Main Content - negative margin to overlap the header, higher z-index */}
        <div className="flex-1 bg-slate-50 dark:bg-background px-8 py-6 -mt-24 relative z-10">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* What would you like to do? Card */}
            <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="assistant-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground text-center mb-4">
                  What would you like to do?
                </h2>
                <div className="flex items-center gap-3 max-w-2xl mx-auto mb-4">
                  <div className="relative flex-1">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                    <Input
                      placeholder="Ask AuditBoard Assistant..."
                      className="pl-10 h-10 bg-slate-50 dark:bg-muted border-slate-200 dark:border-border"
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

            {/* Inbox Section */}
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

            {/* Task Overview + Scenario Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              {/* Left: Task Overview Donut */}
              <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="task-overview-card">
                <CardContent className={`p-6 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-1">Task Overview</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground mb-6 flex-wrap">
                    {taskStats.incomplete > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>{taskStats.incomplete} Incomplete</span>
                      </div>
                    )}
                    {taskStats.inProgress > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{taskStats.inProgress} In Progress</span>
                      </div>
                    )}
                    {taskStats.complete > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{taskStats.complete} Complete</span>
                      </div>
                    )}
                  </div>
                  <DonutChart stats={taskStats} />
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Incomplete
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      In Progress
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Complete
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right: Scenario Task List */}
              <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="scenario-card">
                <CardContent className="p-0 flex flex-col h-[340px]">
                  {/* Scenario Header */}
                  <button
                    onClick={() => setScenarioExpanded(!scenarioExpanded)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-muted border-b border-slate-200 dark:border-border text-left hover-elevate transition-colors flex-shrink-0"
                    data-testid="button-scenario-toggle"
                  >
                    {scenarioExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-foreground">{content.scenarioPlanning.title}</span>
                  </button>

                  {/* Scrollable Task List */}
                  {scenarioExpanded && (
                    <div 
                      className={`flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-border transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`} 
                      data-testid="task-list"
                    >
                      {content.tasks.map((task) => {
                        const badge = getStatusBadge(task.status);
                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors"
                            data-testid={`task-item-${task.id}`}
                          >
                            <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>
                              {badge.label}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer" data-testid={`task-title-${task.id}`}>
                                {task.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{task.context}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-gray-400 dark:text-muted-foreground">Due Date</div>
                              <div className="text-sm text-gray-700 dark:text-foreground" data-testid={`task-due-${task.id}`}>{task.dueDate}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Your Workspaces Section */}
            <div data-testid="workspaces-section">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">Your workspaces</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {workspaces.map((ws) => {
                  const Icon = ws.icon;
                  const isActive = ws.id === currentWorkspace.id;
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
