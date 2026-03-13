/**
 * Quick Actions Configuration
 * 
 * Centralized configuration for AB Assistant quick actions.
 * This is the single source of truth for workspace-specific quick actions.
 */

export interface QuickActionConfig {
  id: string;
  label: string;
  description: string;
  iconName: string;
  type: "workflow" | "navigate" | "create" | "analyze" | "report";
  workflowTemplate?: string;
  route?: string;
  color: string;
}

export const genericQuickActions: QuickActionConfig[] = [
  {
    id: "create-item",
    label: "Create New Item",
    description: "Create a new record in your workspace - risk, control, task, or finding",
    iconName: "Plus",
    type: "create",
    color: "#266C92",
  },
  {
    id: "start-review",
    label: "Start Review Process",
    description: "Initiate a review or assessment workflow for your selected capabilities",
    iconName: "Target",
    type: "create",
    color: "#f59e0b",
  },
  {
    id: "view-dashboard",
    label: "View Dashboard",
    description: "Access your consolidated analytics and metrics dashboard",
    iconName: "BarChart3",
    type: "navigate",
    route: "/dashboard",
    color: "#10b981",
  },
  {
    id: "generate-report",
    label: "Generate Report",
    description: "Create a summary report based on your workspace activities",
    iconName: "FileText",
    type: "report",
    color: "#8b5cf6",
  },
];

export const workspaceQuickActions: Record<string, QuickActionConfig[]> = {
  "admin": [
    {
      id: "manage-workspaces",
      label: "Manage Workspaces",
      description: "Configure and manage platform workspaces and their settings",
      iconName: "Building2",
      type: "navigate",
      route: "/admin/workspaces",
      color: "#266C92",
    },
    {
      id: "manage-permissions",
      label: "Manage Permissions",
      description: "Configure role-based access control and user permissions",
      iconName: "Shield",
      type: "navigate",
      route: "/admin/permissions",
      color: "#f59e0b",
    },
    {
      id: "manage-data",
      label: "Manage Data",
      description: "Configure data tenancy, modeling, and connectivity across workspaces",
      iconName: "Database",
      type: "navigate",
      route: "/admin/data",
      color: "#10b981",
    },
    {
      id: "view-analytics",
      label: "View Platform Analytics",
      description: "Access platform-wide usage metrics and activity insights",
      iconName: "BarChart3",
      type: "navigate",
      route: "/admin",
      color: "#8b5cf6",
    },
  ],

  "enterprise-risk": [
    {
      id: "open-tariff-workflow",
      label: "Open Tariff Impact Workflow",
      description: "View the tariff exposure assessment and mitigation workflow for supply chain risk",
      iconName: "Workflow",
      type: "navigate",
      route: "/workflow/wf-tariff",
      color: "#266C92",
    },
    {
      id: "risk-assessment",
      label: "Start Risk Assessment",
      description: "Launch a comprehensive enterprise risk assessment cycle",
      iconName: "Target",
      type: "create",
      route: "/wizard",
      color: "#f59e0b",
    },
    {
      id: "vendor-analysis",
      label: "Analyze Vendor Exposure",
      description: "Deep-dive analysis of vendor tariff exposure and alternative sourcing",
      iconName: "Building2",
      type: "analyze",
      color: "#10b981",
    },
    {
      id: "board-report",
      label: "Generate Board Report",
      description: "Auto-generate executive summary of tariff risks for board presentation",
      iconName: "BarChart3",
      type: "report",
      color: "#8b5cf6",
    },
  ],
  "enterprise-risk-fieldwork": [
    {
      id: "control-testing",
      label: "Automated Control Testing",
      description: "Configure and launch parallel agentic workflows to test controls across the organization",
      iconName: "Shield",
      type: "create",
      color: "#266C92",
    },
    {
      id: "pbc-status",
      label: "View PBC Request Status",
      description: "Monitor outstanding Prepared by Client requests and collection progress",
      iconName: "FileText",
      type: "analyze",
      color: "#f59e0b",
    },
    {
      id: "evidence-review",
      label: "Review Collected Evidence",
      description: "Inspect and validate evidence gathered by agents from connected systems",
      iconName: "Search",
      type: "analyze",
      color: "#10b981",
    },
    {
      id: "exception-triage",
      label: "Triage Testing Exceptions",
      description: "Review controls flagged with exceptions or annotation issues by the agent",
      iconName: "AlertTriangle",
      type: "analyze",
      color: "#ef4444",
    },
    {
      id: "fieldwork-report",
      label: "Generate Fieldwork Summary",
      description: "Create a fieldwork completion report with testing results and coverage metrics",
      iconName: "BarChart3",
      type: "report",
      color: "#8b5cf6",
    },
  ],
  "enterprise-audit": [
    {
      id: "open-ma-workflow",
      label: "Open M&A Audit Workflow",
      description: "View the Singapore vertical farming acquisition oversight workflow",
      iconName: "Workflow",
      type: "navigate",
      route: "/workflow/wf-ma-audit",
      color: "#266C92",
    },
    {
      id: "coverage-mapping",
      label: "Update Coverage Mapping",
      description: "Map audit coverage for new Singapore entity integration",
      iconName: "Globe",
      type: "create",
      color: "#10b981",
    },
    {
      id: "org-impact",
      label: "Assess Organizational Impact",
      description: "Analyze how acquisition affects current audit structure",
      iconName: "Users",
      type: "analyze",
      color: "#f59e0b",
    },
    {
      id: "audit-committee-report",
      label: "Prepare Audit Committee Deck",
      description: "Generate presentation materials for audit committee review",
      iconName: "FileText",
      type: "report",
      color: "#8b5cf6",
    },
  ],
  "it-security": [
    {
      id: "open-incident-workflow",
      label: "Open Incident Response Workflow",
      description: "View the Log4j vulnerability response and remediation workflow",
      iconName: "Workflow",
      type: "navigate",
      route: "/workflow/wf-incident",
      color: "#266C92",
    },
    {
      id: "vulnerability-scan",
      label: "Launch Vulnerability Scan",
      description: "Initiate comprehensive Log4j and CVE scan across all systems",
      iconName: "Search",
      type: "create",
      color: "#ef4444",
    },
    {
      id: "threat-detection",
      label: "Run Threat Detection Scan",
      description: "AI-powered Zero Day threat analysis and intrusion detection",
      iconName: "Shield",
      type: "analyze",
      color: "#10b981",
    },
    {
      id: "compliance-report",
      label: "Generate Compliance Report",
      description: "Create security compliance report for executive briefing",
      iconName: "ClipboardList",
      type: "report",
      color: "#8b5cf6",
    },
  ],
};

/**
 * Get quick action counts per workspace - derived from the actual config
 */
export function getQuickActionCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  Object.entries(workspaceQuickActions).forEach(([wsId, actions]) => {
    counts[wsId] = actions.length;
  });
  return counts;
}

/**
 * Get total quick action count
 */
export function getTotalQuickActionCount(): number {
  return Object.values(workspaceQuickActions).reduce((sum, actions) => sum + actions.length, 0);
}
