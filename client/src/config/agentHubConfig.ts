export type AgentCategory = "direct-realtime" | "continuous" | "scheduled" | "emergent";
export type AgentStatus = "active" | "idle" | "pending-review" | "completed";

export interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  status: AgentStatus;
  agentName: string;
  lastActivity: string;
  progress: number;
  humanActionNeeded: boolean;
  humanActionDescription?: string;
  relatedItemsCount: number;
}

export interface AgentActivityEntry {
  id: string;
  timestamp: string;
  agentName: string;
  message: string;
  type: "info" | "warning" | "success" | "action-needed";
}

export interface AgentCategorySummary {
  category: AgentCategory;
  label: string;
  description: string;
  color: string;
  iconBg: string;
  activeCount: number;
  pendingCount: number;
  workflows: AgentWorkflow[];
}

export interface AgentHubData {
  workspaceId: string;
  workspaceLabel: string;
  categories: AgentCategorySummary[];
  activityFeed: AgentActivityEntry[];
  totalAgents: number;
  activeAgents: number;
  pendingReview: number;
}

const enterpriseRiskWorkflows: AgentWorkflow[] = [
  {
    id: "er-direct-1",
    name: "Run Risk Assessment",
    description: "On-demand risk assessment with pre-populated data from signals, audit findings, and KRI metrics",
    category: "direct-realtime",
    status: "active",
    agentName: "Assessment Agent",
    lastActivity: "2 min ago",
    progress: 67,
    humanActionNeeded: false,
    relatedItemsCount: 14,
  },
  {
    id: "er-direct-2",
    name: "Generate Scenario Analysis",
    description: "Tabletop exercise scenario tailored to your architecture — triggered by emerging cyber threat",
    category: "direct-realtime",
    status: "pending-review",
    agentName: "Scenario Planning Agent",
    lastActivity: "8 min ago",
    progress: 100,
    humanActionNeeded: true,
    humanActionDescription: "Review 3 generated scenarios and approve for distribution",
    relatedItemsCount: 3,
  },
  {
    id: "er-direct-3",
    name: "Propose Mitigation Plan",
    description: "Quantified mitigation options with cost-benefit analysis for top-priority risks",
    category: "direct-realtime",
    status: "completed",
    agentName: "Mitigation Agent",
    lastActivity: "25 min ago",
    progress: 100,
    humanActionNeeded: true,
    humanActionDescription: "Review proposed plan, approve actions, and assign owners",
    relatedItemsCount: 7,
  },
  {
    id: "er-cont-1",
    name: "Risk Score Monitoring",
    description: "Continuously watches KRI changes across all risk domains and updates quantified scores in real time",
    category: "continuous",
    status: "active",
    agentName: "Risk Monitor",
    lastActivity: "Just now",
    progress: 100,
    humanActionNeeded: false,
    relatedItemsCount: 42,
  },
  {
    id: "er-cont-2",
    name: "Signal Intelligence Ingestion",
    description: "Consolidates external risk intel from regulatory feeds, news, and threat sources into unified risk events",
    category: "continuous",
    status: "active",
    agentName: "Signal AI",
    lastActivity: "1 min ago",
    progress: 100,
    humanActionNeeded: false,
    relatedItemsCount: 156,
  },
  {
    id: "er-cont-3",
    name: "Control Effectiveness Tracking",
    description: "Ongoing automated control testing with evidence collection and effectiveness scoring",
    category: "continuous",
    status: "active",
    agentName: "Control Testing Agent",
    lastActivity: "5 min ago",
    progress: 100,
    humanActionNeeded: true,
    humanActionDescription: "3 controls flagged as potentially ineffective — review evidence",
    relatedItemsCount: 28,
  },
  {
    id: "er-sched-1",
    name: "Quarterly Risk Register Review",
    description: "Comprehensive risk register refresh with automated linking of new risks and deduplication recommendations",
    category: "scheduled",
    status: "idle",
    agentName: "Risk Library Agent",
    lastActivity: "3 days ago",
    progress: 0,
    humanActionNeeded: false,
    relatedItemsCount: 89,
  },
  {
    id: "er-sched-2",
    name: "Monthly KRI Report Generation",
    description: "Automated board-ready KRI dashboards with trend analysis, peer benchmarking, and executive summary",
    category: "scheduled",
    status: "completed",
    agentName: "Reporting Agent",
    lastActivity: "2 days ago",
    progress: 100,
    humanActionNeeded: true,
    humanActionDescription: "Review generated report before distribution to the board",
    relatedItemsCount: 12,
  },
  {
    id: "er-sched-3",
    name: "Annual Risk Appetite Recalibration",
    description: "Full appetite framework review using historical decisions, market conditions, and organizational changes",
    category: "scheduled",
    status: "idle",
    agentName: "Appetite Agent",
    lastActivity: "45 days ago",
    progress: 0,
    humanActionNeeded: false,
    relatedItemsCount: 6,
  },
  {
    id: "er-emerg-1",
    name: "Tariff Policy Change Detected",
    description: "New tariff regulations identified — running impact analysis across supply chain, vendor exposure, and financial models",
    category: "emergent",
    status: "active",
    agentName: "Assessment Agent",
    lastActivity: "12 min ago",
    progress: 45,
    humanActionNeeded: false,
    relatedItemsCount: 23,
  },
  {
    id: "er-emerg-2",
    name: "New Regulatory Filing — Compliance Gap Scan",
    description: "SEC filing update detected — scanning current controls and policies for compliance gaps",
    category: "emergent",
    status: "pending-review",
    agentName: "Compliance Scanner",
    lastActivity: "1 hr ago",
    progress: 100,
    humanActionNeeded: true,
    humanActionDescription: "Review 5 identified compliance gaps and prioritize remediation",
    relatedItemsCount: 5,
  },
  {
    id: "er-emerg-3",
    name: "Vendor Risk Alert — Supply Chain Exposure",
    description: "Critical vendor flagged by Signal AI — assessing downstream exposure and alternative sourcing options",
    category: "emergent",
    status: "active",
    agentName: "Mitigation Agent",
    lastActivity: "30 min ago",
    progress: 72,
    humanActionNeeded: false,
    relatedItemsCount: 8,
  },
];

const enterpriseRiskActivity: AgentActivityEntry[] = [
  {
    id: "act-1",
    timestamp: "2 min ago",
    agentName: "Assessment Agent",
    message: "Started risk assessment for Q1 operational risks — 14 items in scope",
    type: "info",
  },
  {
    id: "act-2",
    timestamp: "8 min ago",
    agentName: "Scenario Planning Agent",
    message: "Completed 3 tabletop scenarios for critical cyber threat — awaiting review",
    type: "action-needed",
  },
  {
    id: "act-3",
    timestamp: "12 min ago",
    agentName: "Assessment Agent",
    message: "Tariff policy change detected — initiated impact analysis across 23 related items",
    type: "warning",
  },
  {
    id: "act-4",
    timestamp: "25 min ago",
    agentName: "Mitigation Agent",
    message: "Mitigation plan generated with 3 quantified options ($1.2M–$3.4M range)",
    type: "success",
  },
  {
    id: "act-5",
    timestamp: "30 min ago",
    agentName: "Mitigation Agent",
    message: "Vendor risk alert triggered — assessing supply chain exposure for Vendor #2847",
    type: "warning",
  },
  {
    id: "act-6",
    timestamp: "1 hr ago",
    agentName: "Compliance Scanner",
    message: "SEC filing compliance scan complete — 5 gaps identified across 2 frameworks",
    type: "action-needed",
  },
  {
    id: "act-7",
    timestamp: "1 hr ago",
    agentName: "Control Testing Agent",
    message: "3 controls flagged as potentially ineffective in SOX testing cycle",
    type: "action-needed",
  },
  {
    id: "act-8",
    timestamp: "2 hrs ago",
    agentName: "Signal AI",
    message: "Ingested 47 new risk signals from regulatory feeds and threat intelligence sources",
    type: "info",
  },
  {
    id: "act-9",
    timestamp: "2 days ago",
    agentName: "Reporting Agent",
    message: "Monthly KRI board report generated — ready for executive review",
    type: "success",
  },
  {
    id: "act-10",
    timestamp: "3 days ago",
    agentName: "Risk Monitor",
    message: "KRI threshold breach: Operational Risk Score moved from Moderate to High",
    type: "warning",
  },
];

const categoryMeta: Record<AgentCategory, { label: string; description: string; color: string; iconBg: string }> = {
  "direct-realtime": {
    label: "Direct Action",
    description: "On-demand actions — ask the orchestrator and agents execute immediately",
    color: "text-[#266C92] dark:text-[#4da3c9]",
    iconBg: "bg-[#266C92]/10 dark:bg-[#266C92]/20",
  },
  continuous: {
    label: "Continuous",
    description: "Always-on monitoring and ingestion — the enterprise immune system",
    color: "text-[#266C92] dark:text-[#4da3c9]",
    iconBg: "bg-[#266C92]/10 dark:bg-[#266C92]/20",
  },
  scheduled: {
    label: "Scheduled",
    description: "Calendar-based workflows that run on defined cadences",
    color: "text-[#1a2332] dark:text-slate-300",
    iconBg: "bg-[#1a2332]/10 dark:bg-slate-700/40",
  },
  emergent: {
    label: "Emergent",
    description: "Real-time responses triggered by changing signals and system parameters",
    color: "text-[#1a2332] dark:text-slate-300",
    iconBg: "bg-[#1a2332]/10 dark:bg-slate-700/40",
  },
};

const categoryOrder: AgentCategory[] = ["direct-realtime", "continuous", "scheduled", "emergent"];

function buildHubData(workspaceId: string, workspaceLabel: string, workflows: AgentWorkflow[], activity: AgentActivityEntry[]): AgentHubData {
  const categories: AgentCategorySummary[] = categoryOrder.map((cat) => {
    const catWorkflows = workflows.filter((w) => w.category === cat);
    return {
      category: cat,
      ...categoryMeta[cat],
      activeCount: catWorkflows.filter((w) => w.status === "active").length,
      pendingCount: catWorkflows.filter((w) => w.humanActionNeeded).length,
      workflows: catWorkflows,
    };
  });

  return {
    workspaceId,
    workspaceLabel,
    categories,
    activityFeed: activity,
    totalAgents: workflows.length,
    activeAgents: workflows.filter((w) => w.status === "active").length,
    pendingReview: workflows.filter((w) => w.humanActionNeeded).length,
  };
}

export function getAgentHubData(workspaceId: string): AgentHubData | null {
  switch (workspaceId) {
    case "enterprise-risk":
      return buildHubData("enterprise-risk", "Enterprise Risk", enterpriseRiskWorkflows, enterpriseRiskActivity);
    default:
      return null;
  }
}

export function isAgentHubSupported(workspaceId: string): boolean {
  return workspaceId === "enterprise-risk";
}
