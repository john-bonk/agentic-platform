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
import { useWorkspaceStore, workspaces as storeWorkspaces, solutionCapabilities } from "@/lib/workspaceStore";
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

export interface WorkspaceContentData {
  scenarioPlanning: ScenarioPlanning;
  tasks: Task[];
  inboxStats: InboxStat[];
  quickActions: { label: string; id: string }[];
}

export const workspaceContent: Record<string, WorkspaceContentData> = {
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
      { id: "audit-1", title: "Update Inventory Structure & Coverage Mapping", context: "Inventory: M&A Vertical Farming", preparers: ["Steven Yeun", "Michelle Tu"], dueDate: "10-31-2025", status: "complete" },
      { id: "audit-2", title: "Review Organizational Impact Assessment", context: "Overview: M&A Integration", preparers: ["Steven Yeun", "Michelle Tu"], dueDate: "10-31-2025", status: "complete" },
      { id: "audit-3", title: "Evaluate Target Company Financial Controls", context: "Due Diligence: Vertical Farming Co.", preparers: ["Michelle Tu", "Alex Park"], dueDate: "11-05-2025", status: "in-progress" },
      { id: "audit-4", title: "Review M&A Impact Scenario Analysis", context: "Scenario: Climate Risk Mitigation", preparers: ["Steven Yeun"], dueDate: "11-10-2025", status: "in-progress" },
      { id: "audit-5", title: "Assess Supply Chain Integration Risks", context: "Risk Assessment: M&A", preparers: ["Alex Park", "Jennifer Liu"], dueDate: "11-15-2025", status: "incomplete" },
      { id: "audit-6", title: "Validate Environmental Compliance Documentation", context: "Compliance: ESG Due Diligence", preparers: ["Michelle Tu"], dueDate: "11-20-2025", status: "incomplete" },
      { id: "audit-7", title: "Update Audit Committee Presentation", context: "Report: M&A Oversight", preparers: ["Steven Yeun", "Michelle Tu"], dueDate: "11-30-2025", status: "incomplete" },
      { id: "audit-8", title: "Finalize Post-Acquisition Integration Audit Plan", context: "Planning: Post-Close Audit", preparers: ["Jennifer Liu"], dueDate: "12-05-2025", status: "complete" },
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
      { id: "sec-1", title: "Identify All Log4j Instances Across Environment", context: "Discovery: Log4j CVE-2021-44228", preparers: ["David Kim", "Rachel Green"], dueDate: "10-25-2025", status: "complete" },
      { id: "sec-2", title: "Complete Log4j Vulnerability Assessment", context: "Assessment: Critical Severity", preparers: ["David Kim"], dueDate: "10-31-2025", status: "complete" },
      { id: "sec-3", title: "Patch Critical Production Systems for Log4j", context: "Remediation: Production", preparers: ["Tom Anderson", "David Kim"], dueDate: "11-01-2025", status: "in-progress" },
      { id: "sec-4", title: "Deploy WAF Rules to Block Exploitation Attempts", context: "Mitigation: Network Defense", preparers: ["Rachel Green"], dueDate: "11-05-2025", status: "in-progress" },
      { id: "sec-5", title: "Scan Third-Party Applications for Log4j", context: "Vendor Risk: Log4j Exposure", preparers: ["Sarah Lin", "Tom Anderson"], dueDate: "11-10-2025", status: "complete" },
      { id: "sec-6", title: "Update Incident Response Playbook for Log4j", context: "IR: Zero Day Response", preparers: ["Rachel Green", "James Wu"], dueDate: "11-15-2025", status: "incomplete" },
      { id: "sec-7", title: "Conduct Forensic Analysis on Affected Systems", context: "Investigation: Compromise Detection", preparers: ["David Kim", "Sarah Lin"], dueDate: "11-20-2025", status: "incomplete" },
      { id: "sec-8", title: "Notify Affected Business Units & Stakeholders", context: "Communication: Internal", preparers: ["James Wu"], dueDate: "11-25-2025", status: "incomplete" },
      { id: "sec-9", title: "Validate Patching Completion Across All Environments", context: "Verification: Remediation", preparers: ["Tom Anderson", "David Kim"], dueDate: "11-30-2025", status: "incomplete" },
      { id: "sec-10", title: "Conduct Post-Incident Penetration Test", context: "Validation: Security Posture", preparers: ["Rachel Green"], dueDate: "12-05-2025", status: "incomplete" },
      { id: "sec-11", title: "Executive Briefing on Log4j Impact & Response", context: "Report: Board Communication", preparers: ["David Kim", "Sarah Lin"], dueDate: "12-10-2025", status: "complete" },
      { id: "sec-12", title: "Document Lessons Learned & Update Security Procedures", context: "Post-Mortem: Process Improvement", preparers: ["Sarah Lin", "Tom Anderson"], dueDate: "12-15-2025", status: "in-progress" },
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

const bucketDisplayNames: Record<string, string> = {
  "controls-management": "Controls Management",
  "enterprise-risk": "Enterprise Risk Management",
  "audit-management": "Audit Management",
  "cyber-compliance": "Cyber and IT Compliance",
  "cyber-it-compliance": "Cyber and IT Compliance",
  "information-technology": "Information Technology",
  "regulatory-compliance": "Regulatory Compliance",
  "third-party": "Third Party Risk",
  "ai-governance": "AI Governance",
  "environmental-compliance": "Environmental Compliance",
};

const capabilityTaskPool: Record<string, string[]> = {
  "controls-management": [
    "Review SOX Control Documentation for Q4",
    "Complete Control Testing Cycle for Key Processes",
    "Remediate Open Control Gaps from Last Assessment",
    "Update Control Owner Attestation Records",
    "Validate Automated Monitoring Alert Thresholds",
    "Map Controls to Updated Regulatory Framework",
    "Gather Evidence for Annual Control Certification",
    "Analyze Control Effectiveness Trend Data",
    "Prepare Control Environment Board Summary",
    "Reconcile Control Library Against Process Changes",
  ],
  "enterprise-risk": [
    "Update Strategic Risk Register with Q4 Findings",
    "Complete Quarterly Enterprise Risk Assessment",
    "Review Risk Appetite Statement with Stakeholders",
    "Investigate KRI Threshold Breach on Credit Exposure",
    "Evaluate Emerging Geopolitical Risk Scenarios",
    "Finalize Risk Treatment Plans for Top 5 Risks",
    "Collect Risk Owner Attestations Across Business Units",
    "Refresh Risk Heat Map for Executive Committee",
    "Assess Concentration Risk in Key Supply Chains",
    "Prepare Board-Level Risk Briefing Materials",
  ],
  "audit-management": [
    "Finalize Q1 Annual Audit Plan for Approval",
    "Complete IT Audit Fieldwork on General Controls",
    "Escalate Overdue Audit Findings Past Remediation Date",
    "Draft Exit Meeting Summary for Operational Audit",
    "Optimize Auditor Resource Allocation for Next Quarter",
    "Upload Workpapers for Current Engagement",
    "Refresh Audit Universe Entity Risk Ratings",
    "Review Audit Committee Presentation Materials",
    "Track Corrective Action Plan Implementation Status",
    "Validate Sampling Methodology for Financial Audit",
  ],
  "cyber-compliance": [
    "Patch Critical Vulnerabilities from Latest Security Scan",
    "Complete Privileged Access Review Certification Campaign",
    "Investigate Root Cause of Recent Phishing Incident",
    "Update Ransomware Incident Response Playbook",
    "Validate ITGC Test Results for SOC 2 Readiness",
    "Review Application Control Configuration in ERP",
    "Conduct Penetration Test on External-Facing Systems",
    "Assess Third-Party Application Security Posture",
    "Generate Monthly Vulnerability Trend Analysis Report",
    "Revise Data Loss Prevention Policy and Procedures",
  ],
  "information-technology": [
    "Reconcile Physical Assets Against CMDB Records",
    "Update Application Portfolio Criticality Ratings",
    "Approve Emergency Change Requests in Queue",
    "Prepare Agenda for Weekly Change Advisory Board",
    "Review Disaster Recovery Test Results and Gaps",
    "Assess Cloud Service Provider SLA Compliance",
    "Update System Inventory with New Deployments",
    "Validate Backup and Restoration Procedures",
    "Review IT Service Desk Ticket Escalation Trends",
    "Conduct Capacity Planning Review for Core Systems",
  ],
  "regulatory-compliance": [
    "Assess Impact of New SEC Climate Disclosure Rules",
    "Prepare Quarterly Regulatory Filing Documents",
    "Update SOX Process Narratives for Key Workflows",
    "Review Materials for CFO/CEO Section 302 Certification",
    "Track Regulatory Obligation Deadlines This Month",
    "Analyze Cross-Border Data Privacy Requirements",
    "Conduct Gap Analysis Against Updated GDPR Guidance",
    "Compile Regulatory Change Impact Assessment Report",
    "Verify Compliance Training Completion Rates",
    "Review Anti-Money Laundering Program Effectiveness",
  ],
  "third-party": [
    "Complete Due Diligence for New Cloud Provider Vendor",
    "Process Pending Vendor Intake and Onboarding Requests",
    "Conduct Annual Reassessment of Tier 1 Payment Processor",
    "Validate Security Questionnaire Responses from Vendors",
    "Update Vendor Risk Tiering Based on Latest Assessments",
    "Review Vendor Contract Renewal Terms and SLAs",
    "Monitor Fourth-Party Concentration Risk Exposure",
    "Escalate Vendor Non-Compliance Findings to Procurement",
    "Refresh Vendor Inventory Contact and Contract Data",
    "Assess Business Continuity Plans for Critical Vendors",
  ],
  "ai-governance": [
    "Document New ML Models Deployed This Quarter",
    "Complete Risk Assessment for Credit Scoring AI Model",
    "Review Fairness and Bias Metrics for HR Screening Model",
    "Execute Quarterly Validation for Fraud Detection System",
    "Update Responsible AI Use Policy Documentation",
    "Assess Explainability Requirements for Customer-Facing AI",
    "Review Model Drift Monitoring Dashboard Alerts",
    "Conduct Data Quality Audit for Training Pipelines",
    "Prepare AI Governance Board Briefing Materials",
    "Evaluate Regulatory Compliance of Generative AI Tools",
  ],
  "environmental-compliance": [
    "Gather Q4 Sustainability Metrics from All Facilities",
    "Calculate and Verify Scope 1 and 2 Emissions Data",
    "Distribute Scope 3 Emissions Survey to Key Suppliers",
    "Compile Quarterly Progress Report Toward Net Zero Targets",
    "Review CSRD Reporting Requirements and Readiness",
    "Validate Water Usage and Waste Diversion Data",
    "Assess Climate Risk Scenarios for Physical Assets",
    "Update Environmental Permit Compliance Status",
    "Prepare ESG Disclosure Materials for Annual Report",
    "Benchmark Carbon Intensity Against Industry Peers",
  ],
};

const bucketIdAliases: Record<string, string> = {
  "cyber-it-compliance": "cyber-compliance",
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

function resolveBucketId(id: string): string {
  return bucketIdAliases[id] || id;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const preparerPool = [
  "Sarah Chen", "Michael Torres", "James Wilson", "Amanda Liu",
  "Steven Yeun", "Michelle Tu", "Alex Park", "Jennifer Liu",
  "David Kim", "Rachel Green", "Tom Anderson", "Sarah Lin",
];

const statusOptions: Task["status"][] = ["incomplete", "incomplete", "in-progress", "incomplete", "in-progress"];

function buildTaskFromPool(bucketId: string, titleIndex: number, taskIdCounter: number, seed: number): Task {
  const resolvedId = resolveBucketId(bucketId);
  const pool = capabilityTaskPool[resolvedId] || capabilityTaskPool["controls-management"];
  const title = pool[titleIndex % pool.length];
  const displayName = bucketDisplayNames[resolvedId] || resolvedId;

  const s = (seed * 1664525 + 1013904223) & 0x7fffffff;
  const prepCount = (s % 2) + 1;
  const shuffledPreparers = seededShuffle(preparerPool, seed + taskIdCounter);
  const preparers = shuffledPreparers.slice(0, prepCount);

  const baseDays = 10 + (taskIdCounter * 3) % 60;
  const dueMonth = 10 + Math.floor(baseDays / 30);
  const dueDay = (baseDays % 28) + 1;
  const dueDate = `${dueMonth}-${String(dueDay).padStart(2, "0")}-2025`;

  const status = statusOptions[taskIdCounter % statusOptions.length];

  return {
    id: `dyn-${taskIdCounter}`,
    title,
    context: `${displayName}: Workspace Initiative`,
    preparers,
    dueDate,
    status,
  };
}

export function generateCustomWorkspaceContent(capabilities: string[]): WorkspaceContentData {
  const resolvedCaps = capabilities.map(resolveBucketId);
  const uniqueCaps = Array.from(new Set(resolvedCaps));

  const isSingleModule = uniqueCaps.length === 1;

  const seed = uniqueCaps.sort().join(",").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const taskCount = isSingleModule
    ? 10
    : Math.min(4 + (seed % 9), 12);

  const tasks: Task[] = [];
  let taskIdCounter = 0;

  if (isSingleModule) {
    const bucketId = uniqueCaps[0];
    const pool = capabilityTaskPool[bucketId] || [];
    const shuffled = seededShuffle(pool, seed);
    for (let i = 0; i < Math.min(taskCount, shuffled.length); i++) {
      tasks.push(buildTaskFromPool(bucketId, i, taskIdCounter++, seed));
    }
  } else {
    for (const bucketId of uniqueCaps) {
      tasks.push(buildTaskFromPool(bucketId, 0, taskIdCounter++, seed));
    }

    const remaining = taskCount - tasks.length;
    if (remaining > 0) {
      const extraPool: { bucketId: string; titleIndex: number }[] = [];
      for (const bucketId of uniqueCaps) {
        const pool = capabilityTaskPool[bucketId] || [];
        for (let i = 1; i < pool.length; i++) {
          extraPool.push({ bucketId, titleIndex: i });
        }
      }
      const shuffledExtra = seededShuffle(extraPool, seed + 99);
      for (let i = 0; i < Math.min(remaining, shuffledExtra.length); i++) {
        const { bucketId, titleIndex } = shuffledExtra[i];
        tasks.push(buildTaskFromPool(bucketId, titleIndex, taskIdCounter++, seed));
      }
    }
  }

  const singleBucketName = isSingleModule
    ? (bucketDisplayNames[uniqueCaps[0]] || uniqueCaps[0])
    : "";
  const headerTitle = isSingleModule
    ? `${singleBucketName} Tasks`
    : "Workspace Tasks";

  const complete = tasks.filter(t => t.status === "complete").length;

  const quickActionsMap: { [key: string]: { label: string; id: string } } = {};
  uniqueCaps.forEach(capId => {
    const capActions = capabilityQuickActions[capId] || [];
    capActions.forEach(action => {
      quickActionsMap[action.id] = action;
    });
  });
  const quickActions = Object.values(quickActionsMap).slice(0, 4);

  return {
    scenarioPlanning: {
      title: headerTitle,
      progress: `${complete}/${tasks.length} Completed`,
      completed: complete,
      total: tasks.length,
    },
    tasks,
    inboxStats: [
      { label: "My Tasks", value: tasks.length },
      { label: "My Issues", value: 2 + (seed % 4) },
      { label: "My Controls", value: uniqueCaps.includes("controls-management") ? 8 : 2 },
      { label: "My Narratives", value: uniqueCaps.includes("audit-management") ? 3 : 0 },
      { label: "My Risks", value: uniqueCaps.includes("enterprise-risk") ? 6 : 1 },
      { label: "My Comments", value: 1 + (seed % 7) },
    ],
    quickActions: quickActions.length > 0 ? quickActions : [
      { label: "Create New Item", id: "new-item" },
      { label: "Start Review", id: "start-review" },
      { label: "Generate Report", id: "new-report" },
    ],
  };
}

export const displayWorkspaces = [
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
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        {stats.complete > 0 && (
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="10"
            strokeDasharray={`${(completePercent / 100) * circumference} ${circumference}`}
            strokeDashoffset={-(completeOffset / 100) * circumference}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        )}
        {stats.inProgress > 0 && (
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="10"
            strokeDasharray={`${(inProgressPercent / 100) * circumference} ${circumference}`}
            strokeDashoffset={-(inProgressOffset / 100) * circumference}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        )}
        {stats.incomplete > 0 && (
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="10"
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

interface HomePageContentProps {
  content: WorkspaceContentData;
  welcomeMessage: string;
  showWorkspaces?: boolean;
  compact?: boolean;
}

export function HomePageContent({ content, welcomeMessage, showWorkspaces = true, compact = false }: HomePageContentProps) {
  const { currentWorkspace, setWorkspace } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState("My Tasks");
  const [scenarioExpanded, setScenarioExpanded] = useState(true);
  const { setOpen: setAssistantOpen } = useHomeAssistantStore();

  const taskStats: TaskStats = useMemo(() => ({
    incomplete: content.tasks.filter(t => t.status === "incomplete").length,
    inProgress: content.tasks.filter(t => t.status === "in-progress").length,
    complete: content.tasks.filter(t => t.status === "complete").length,
    total: content.tasks.length,
  }), [content.tasks]);

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
              {taskStats.incomplete} New critical{" "}
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

            <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="scenario-card">
              <CardContent className="p-0 flex flex-col h-[340px]">
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

                {scenarioExpanded && (
                  <div
                    className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-border"
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

          {showWorkspaces && (
            <div data-testid="workspaces-section">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">Your workspaces</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {displayWorkspaces.map((ws) => {
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
          )}

        </div>
      </div>
    </div>
  );
}