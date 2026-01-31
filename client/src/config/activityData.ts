/**
 * Activity Data Configuration
 * 
 * Contains hardcoded Recent and Favorites data for each workspace.
 * Each workspace has 10 distinct, contextually appropriate items.
 */

import { 
  FileText, 
  BarChart2, 
  Shield, 
  AlertTriangle, 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  Lock, 
  Server, 
  Cpu, 
  Leaf, 
  Scale, 
  Activity, 
  Eye,
  Settings,
  CheckCircle,
  Clock,
  Folder,
  Database,
  Briefcase,
  type LucideIcon
} from "lucide-react";

export type ActivityItemType = 
  | "report" 
  | "dashboard" 
  | "control" 
  | "risk" 
  | "audit" 
  | "task" 
  | "policy" 
  | "assessment" 
  | "vendor" 
  | "finding"
  | "framework"
  | "workflow"
  | "scan"
  | "document";

export interface ActivityItem {
  id: string;
  name: string;
  type: ActivityItemType;
  description: string;
  path: string;
  timestamp: string;
  icon: LucideIcon;
  metadata?: {
    status?: string;
    owner?: string;
    category?: string;
  };
}

export interface WorkspaceActivityData {
  recent: ActivityItem[];
  favorites: ActivityItem[];
}

const getTypeIcon = (type: ActivityItemType): LucideIcon => {
  const iconMap: Record<ActivityItemType, LucideIcon> = {
    report: FileText,
    dashboard: BarChart2,
    control: Shield,
    risk: AlertTriangle,
    audit: ClipboardCheck,
    task: CheckCircle,
    policy: Scale,
    assessment: Activity,
    vendor: Users,
    finding: Eye,
    framework: Folder,
    workflow: Settings,
    scan: Server,
    document: FileText,
  };
  return iconMap[type];
};

/**
 * CRO (Enterprise Risk) Workspace Activity Data
 */
const croActivityData: WorkspaceActivityData = {
  recent: [
    { id: "cro-r1", name: "Q4 Enterprise Risk Assessment", type: "assessment", description: "Quarterly risk evaluation across all business units", path: "/assessments/q4-2025", timestamp: "2 hours ago", icon: Activity, metadata: { status: "In Progress", owner: "Risk Team" } },
    { id: "cro-r2", name: "Global Residual Risk Dashboard", type: "dashboard", description: "Real-time view of residual risks by region", path: "/global-residual-risk", timestamp: "4 hours ago", icon: BarChart2, metadata: { category: "Dashboard" } },
    { id: "cro-r3", name: "Operational Risk Register", type: "risk", description: "Master list of operational risks and controls", path: "/risk-register", timestamp: "Yesterday", icon: AlertTriangle, metadata: { status: "Active", owner: "Operations" } },
    { id: "cro-r4", name: "Strategic Risk Heat Map", type: "report", description: "Visual representation of strategic risks", path: "/risk-heatmap", timestamp: "Yesterday", icon: TrendingUp, metadata: { category: "Analytics" } },
    { id: "cro-r5", name: "Third-Party Risk Assessment", type: "vendor", description: "Vendor risk evaluation for Q4", path: "/vendor-exposure", timestamp: "2 days ago", icon: Users, metadata: { status: "Review Required" } },
    { id: "cro-r6", name: "Risk Appetite Statement", type: "policy", description: "Board-approved risk tolerance levels", path: "/policies/risk-appetite", timestamp: "3 days ago", icon: Scale, metadata: { status: "Approved" } },
    { id: "cro-r7", name: "Emerging Risks Report", type: "report", description: "Analysis of new and evolving risks", path: "/reports/emerging-risks", timestamp: "4 days ago", icon: FileText, metadata: { owner: "Risk Intelligence" } },
    { id: "cro-r8", name: "Control Effectiveness Review", type: "control", description: "Annual control testing results", path: "/controls/effectiveness", timestamp: "5 days ago", icon: Shield, metadata: { status: "Completed" } },
    { id: "cro-r9", name: "Risk Mitigation Tracker", type: "task", description: "Action items for risk remediation", path: "/mitigation-tracker", timestamp: "1 week ago", icon: CheckCircle, metadata: { status: "On Track" } },
    { id: "cro-r10", name: "Board Risk Report", type: "report", description: "Executive summary for board presentation", path: "/reports/board-risk", timestamp: "1 week ago", icon: Briefcase, metadata: { status: "Draft" } },
  ],
  favorites: [
    { id: "cro-f1", name: "Enterprise Risk Dashboard", type: "dashboard", description: "Primary risk monitoring dashboard", path: "/", timestamp: "Pinned", icon: BarChart2, metadata: { category: "Dashboard" } },
    { id: "cro-f2", name: "Risk Heat Map", type: "dashboard", description: "Interactive risk visualization", path: "/risk-heatmap", timestamp: "Pinned", icon: TrendingUp, metadata: { category: "Analytics" } },
    { id: "cro-f3", name: "Critical Controls List", type: "control", description: "High-priority controls requiring attention", path: "/controls/critical", timestamp: "Pinned", icon: Shield, metadata: { status: "Monitoring" } },
    { id: "cro-f4", name: "Top 10 Risks", type: "risk", description: "Highest rated enterprise risks", path: "/risks/top-10", timestamp: "Pinned", icon: AlertTriangle, metadata: { category: "Priority" } },
    { id: "cro-f5", name: "Vendor Risk Scorecard", type: "vendor", description: "Third-party risk ratings summary", path: "/vendor-exposure", timestamp: "Pinned", icon: Users, metadata: { status: "Updated" } },
    { id: "cro-f6", name: "Risk Appetite Framework", type: "framework", description: "Reference guide for risk tolerance", path: "/frameworks/risk-appetite", timestamp: "Pinned", icon: Folder, metadata: { status: "Current" } },
    { id: "cro-f7", name: "Mitigation Action Plans", type: "task", description: "Remediation tasks and deadlines", path: "/mitigation-tracker", timestamp: "Pinned", icon: CheckCircle, metadata: { status: "Active" } },
    { id: "cro-f8", name: "Coverage Mapping", type: "report", description: "Risk to control coverage analysis", path: "/coverage-mapping", timestamp: "Pinned", icon: Activity, metadata: { category: "Analysis" } },
    { id: "cro-f9", name: "Regulatory Compliance Status", type: "assessment", description: "Compliance posture overview", path: "/compliance/status", timestamp: "Pinned", icon: Scale, metadata: { status: "Compliant" } },
    { id: "cro-f10", name: "Monthly Risk Report Template", type: "report", description: "Standard reporting template", path: "/templates/monthly-risk", timestamp: "Pinned", icon: FileText, metadata: { category: "Template" } },
  ],
};

/**
 * CAE (Enterprise Audit) Workspace Activity Data
 */
const caeActivityData: WorkspaceActivityData = {
  recent: [
    { id: "cae-r1", name: "IT General Controls Audit", type: "audit", description: "Annual ITGC assessment for SOX compliance", path: "/audits/itgc-2025", timestamp: "3 hours ago", icon: ClipboardCheck, metadata: { status: "In Progress", owner: "IT Audit" } },
    { id: "cae-r2", name: "Audit Planning Dashboard", type: "dashboard", description: "2025 audit universe and scheduling", path: "/audit-planning", timestamp: "5 hours ago", icon: BarChart2, metadata: { category: "Dashboard" } },
    { id: "cae-r3", name: "SOX 404 Testing Workpapers", type: "document", description: "Control testing documentation", path: "/workpapers/sox-404", timestamp: "Yesterday", icon: FileText, metadata: { status: "Under Review", owner: "SOX Team" } },
    { id: "cae-r4", name: "Finding Remediation Tracker", type: "finding", description: "Open audit findings and action items", path: "/findings/tracker", timestamp: "Yesterday", icon: Eye, metadata: { status: "15 Open Items" } },
    { id: "cae-r5", name: "Fraud Risk Assessment", type: "assessment", description: "Annual fraud risk evaluation", path: "/assessments/fraud", timestamp: "2 days ago", icon: AlertTriangle, metadata: { status: "Draft" } },
    { id: "cae-r6", name: "Vendor Audit Schedule", type: "vendor", description: "Third-party audit timeline", path: "/vendor-audits", timestamp: "3 days ago", icon: Users, metadata: { category: "Planning" } },
    { id: "cae-r7", name: "Control Deficiency Report", type: "report", description: "Summary of control weaknesses", path: "/reports/deficiencies", timestamp: "4 days ago", icon: Shield, metadata: { status: "Final" } },
    { id: "cae-r8", name: "Audit Committee Presentation", type: "report", description: "Quarterly update for audit committee", path: "/reports/ac-q4", timestamp: "5 days ago", icon: Briefcase, metadata: { status: "Approved" } },
    { id: "cae-r9", name: "Data Analytics Audit", type: "audit", description: "Continuous auditing pilot program", path: "/audits/data-analytics", timestamp: "1 week ago", icon: Database, metadata: { status: "Planning" } },
    { id: "cae-r10", name: "Internal Audit Charter", type: "policy", description: "Updated audit department charter", path: "/policies/ia-charter", timestamp: "1 week ago", icon: Scale, metadata: { status: "Board Approved" } },
  ],
  favorites: [
    { id: "cae-f1", name: "Audit Dashboard", type: "dashboard", description: "Primary audit monitoring view", path: "/", timestamp: "Pinned", icon: BarChart2, metadata: { category: "Dashboard" } },
    { id: "cae-f2", name: "2025 Audit Plan", type: "document", description: "Annual audit schedule and resources", path: "/audit-plan/2025", timestamp: "Pinned", icon: FileText, metadata: { status: "Approved" } },
    { id: "cae-f3", name: "Open Findings", type: "finding", description: "All unresolved audit findings", path: "/findings/open", timestamp: "Pinned", icon: Eye, metadata: { status: "23 Items" } },
    { id: "cae-f4", name: "SOX Control Matrix", type: "control", description: "Key controls for SOX compliance", path: "/controls/sox-matrix", timestamp: "Pinned", icon: Shield, metadata: { category: "SOX" } },
    { id: "cae-f5", name: "Audit Workpaper Templates", type: "document", description: "Standard testing templates", path: "/templates/workpapers", timestamp: "Pinned", icon: Folder, metadata: { category: "Templates" } },
    { id: "cae-f6", name: "Risk-Based Audit Universe", type: "assessment", description: "Prioritized auditable entities", path: "/audit-universe", timestamp: "Pinned", icon: Activity, metadata: { status: "Current" } },
    { id: "cae-f7", name: "QA Review Checklist", type: "workflow", description: "Quality assurance standards", path: "/qa/checklist", timestamp: "Pinned", icon: CheckCircle, metadata: { category: "QA" } },
    { id: "cae-f8", name: "Audit Resource Tracker", type: "task", description: "Team capacity and assignments", path: "/resources/tracker", timestamp: "Pinned", icon: Users, metadata: { status: "Active" } },
    { id: "cae-f9", name: "Control Testing Status", type: "report", description: "Real-time testing progress", path: "/testing/status", timestamp: "Pinned", icon: ClipboardCheck, metadata: { status: "72% Complete" } },
    { id: "cae-f10", name: "Audit Committee Calendar", type: "document", description: "Meeting schedule and deadlines", path: "/ac-calendar", timestamp: "Pinned", icon: Clock, metadata: { category: "Planning" } },
  ],
};

/**
 * CISO (IT Security) Workspace Activity Data
 */
const cisoActivityData: WorkspaceActivityData = {
  recent: [
    { id: "ciso-r1", name: "Vulnerability Scan Results", type: "scan", description: "Weekly infrastructure vulnerability assessment", path: "/vulnerability-scan", timestamp: "1 hour ago", icon: Server, metadata: { status: "Critical: 3", owner: "SecOps" } },
    { id: "ciso-r2", name: "Security Operations Dashboard", type: "dashboard", description: "Real-time threat monitoring", path: "/", timestamp: "2 hours ago", icon: BarChart2, metadata: { category: "Dashboard" } },
    { id: "ciso-r3", name: "Threat Detection Alerts", type: "finding", description: "Active security incidents", path: "/threat-detection", timestamp: "4 hours ago", icon: AlertTriangle, metadata: { status: "5 Active" } },
    { id: "ciso-r4", name: "SOC 2 Compliance Report", type: "report", description: "Annual SOC 2 Type II assessment", path: "/reports/soc2", timestamp: "Yesterday", icon: Shield, metadata: { status: "In Progress" } },
    { id: "ciso-r5", name: "Penetration Test Results", type: "assessment", description: "Q4 external penetration testing", path: "/assessments/pentest-q4", timestamp: "2 days ago", icon: Lock, metadata: { status: "Findings Review" } },
    { id: "ciso-r6", name: "Cloud Security Posture", type: "scan", description: "AWS/Azure configuration audit", path: "/cloud-security", timestamp: "3 days ago", icon: Cpu, metadata: { status: "85% Compliant" } },
    { id: "ciso-r7", name: "Security Awareness Metrics", type: "report", description: "Phishing simulation results", path: "/reports/awareness", timestamp: "4 days ago", icon: Users, metadata: { status: "Improved" } },
    { id: "ciso-r8", name: "Incident Response Playbook", type: "policy", description: "Updated IR procedures", path: "/playbooks/incident-response", timestamp: "5 days ago", icon: FileText, metadata: { status: "Approved" } },
    { id: "ciso-r9", name: "Access Review Report", type: "audit", description: "Quarterly user access certification", path: "/access-review/q4", timestamp: "1 week ago", icon: Eye, metadata: { status: "Completed" } },
    { id: "ciso-r10", name: "Vendor Security Assessments", type: "vendor", description: "Third-party security evaluations", path: "/vendor-security", timestamp: "1 week ago", icon: Briefcase, metadata: { status: "3 Pending" } },
  ],
  favorites: [
    { id: "ciso-f1", name: "Security Dashboard", type: "dashboard", description: "Primary security monitoring", path: "/", timestamp: "Pinned", icon: BarChart2, metadata: { category: "Dashboard" } },
    { id: "ciso-f2", name: "Threat Detection Center", type: "dashboard", description: "Active threat monitoring", path: "/threat-detection", timestamp: "Pinned", icon: AlertTriangle, metadata: { status: "Monitoring" } },
    { id: "ciso-f3", name: "Vulnerability Dashboard", type: "scan", description: "Infrastructure vulnerability status", path: "/vulnerability-scan", timestamp: "Pinned", icon: Server, metadata: { status: "Active" } },
    { id: "ciso-f4", name: "Compliance Frameworks", type: "framework", description: "SOC 2, ISO 27001, NIST mappings", path: "/frameworks", timestamp: "Pinned", icon: Folder, metadata: { category: "Compliance" } },
    { id: "ciso-f5", name: "Security Controls", type: "control", description: "Technical control inventory", path: "/controls/security", timestamp: "Pinned", icon: Shield, metadata: { status: "143 Active" } },
    { id: "ciso-f6", name: "Risk Register", type: "risk", description: "Cybersecurity risk inventory", path: "/risks/cyber", timestamp: "Pinned", icon: Activity, metadata: { status: "Current" } },
    { id: "ciso-f7", name: "Incident Tracker", type: "finding", description: "Security incident management", path: "/incidents", timestamp: "Pinned", icon: Eye, metadata: { status: "2 Open" } },
    { id: "ciso-f8", name: "Security Policies", type: "policy", description: "Information security policies", path: "/policies/security", timestamp: "Pinned", icon: Scale, metadata: { status: "Current" } },
    { id: "ciso-f9", name: "Vendor Security Ratings", type: "vendor", description: "Third-party security scores", path: "/vendor-security", timestamp: "Pinned", icon: Users, metadata: { category: "Vendors" } },
    { id: "ciso-f10", name: "Security KPIs", type: "report", description: "Key performance indicators", path: "/reports/kpis", timestamp: "Pinned", icon: TrendingUp, metadata: { category: "Metrics" } },
  ],
};

/**
 * Admin Workspace Activity Data
 */
const adminActivityData: WorkspaceActivityData = {
  recent: [
    { id: "admin-r1", name: "User Access Review", type: "audit", description: "Quarterly user permissions audit", path: "/admin/permissions", timestamp: "30 minutes ago", icon: Users, metadata: { status: "In Progress" } },
    { id: "admin-r2", name: "System Configuration", type: "workflow", description: "Platform settings and preferences", path: "/admin/settings", timestamp: "2 hours ago", icon: Settings, metadata: { category: "Admin" } },
    { id: "admin-r3", name: "Data Import Log", type: "document", description: "Recent data ingestion status", path: "/admin/data", timestamp: "4 hours ago", icon: Database, metadata: { status: "Completed" } },
    { id: "admin-r4", name: "Workspace Configuration", type: "workflow", description: "Workspace setup and modules", path: "/admin/workspaces", timestamp: "Yesterday", icon: Folder, metadata: { status: "Active" } },
    { id: "admin-r5", name: "Role Assignment Report", type: "report", description: "User role distribution", path: "/admin/roles-report", timestamp: "2 days ago", icon: FileText, metadata: { owner: "IT Admin" } },
    { id: "admin-r6", name: "Integration Status", type: "scan", description: "Third-party integration health", path: "/admin/integrations", timestamp: "3 days ago", icon: Cpu, metadata: { status: "All Connected" } },
    { id: "admin-r7", name: "Audit Trail Export", type: "document", description: "System activity log export", path: "/admin/audit-trail", timestamp: "4 days ago", icon: Eye, metadata: { category: "Compliance" } },
    { id: "admin-r8", name: "License Management", type: "report", description: "User license allocation", path: "/admin/licenses", timestamp: "5 days ago", icon: Briefcase, metadata: { status: "95% Utilized" } },
    { id: "admin-r9", name: "SSO Configuration", type: "workflow", description: "Single sign-on settings", path: "/admin/sso", timestamp: "1 week ago", icon: Lock, metadata: { status: "Configured" } },
    { id: "admin-r10", name: "Backup Schedule", type: "task", description: "Data backup configuration", path: "/admin/backups", timestamp: "1 week ago", icon: Server, metadata: { status: "Active" } },
  ],
  favorites: [
    { id: "admin-f1", name: "Admin Dashboard", type: "dashboard", description: "System overview and health", path: "/admin", timestamp: "Pinned", icon: BarChart2, metadata: { category: "Dashboard" } },
    { id: "admin-f2", name: "User Management", type: "workflow", description: "Add, edit, and manage users", path: "/admin/permissions", timestamp: "Pinned", icon: Users, metadata: { status: "Active" } },
    { id: "admin-f3", name: "Workspace Settings", type: "workflow", description: "Configure workspaces", path: "/admin/workspaces", timestamp: "Pinned", icon: Folder, metadata: { category: "Config" } },
    { id: "admin-f4", name: "Data Management", type: "document", description: "Import and export data", path: "/admin/data", timestamp: "Pinned", icon: Database, metadata: { status: "Active" } },
    { id: "admin-f5", name: "System Audit Logs", type: "document", description: "Platform activity history", path: "/admin/audit-logs", timestamp: "Pinned", icon: Eye, metadata: { category: "Audit" } },
    { id: "admin-f6", name: "Integration Hub", type: "workflow", description: "Manage third-party connections", path: "/admin/integrations", timestamp: "Pinned", icon: Cpu, metadata: { status: "5 Active" } },
    { id: "admin-f7", name: "Security Settings", type: "policy", description: "Platform security configuration", path: "/admin/security", timestamp: "Pinned", icon: Shield, metadata: { status: "Secure" } },
    { id: "admin-f8", name: "Notification Rules", type: "workflow", description: "Alert and notification settings", path: "/admin/notifications", timestamp: "Pinned", icon: Activity, metadata: { category: "Config" } },
    { id: "admin-f9", name: "API Configuration", type: "workflow", description: "API keys and access", path: "/admin/api", timestamp: "Pinned", icon: Lock, metadata: { status: "Active" } },
    { id: "admin-f10", name: "Help Documentation", type: "document", description: "Admin user guides", path: "/admin/docs", timestamp: "Pinned", icon: FileText, metadata: { category: "Support" } },
  ],
};

/**
 * Custom Workspace Activity Data
 * Generated dynamically based on enabled modules
 */
const customActivityData: WorkspaceActivityData = {
  recent: [
    { id: "custom-r1", name: "Workspace Dashboard", type: "dashboard", description: "Custom workspace overview", path: "/custom-workspace", timestamp: "1 hour ago", icon: BarChart2, metadata: { category: "Dashboard" } },
    { id: "custom-r2", name: "My Tasks", type: "task", description: "Assigned action items", path: "/tasks", timestamp: "2 hours ago", icon: CheckCircle, metadata: { status: "8 Active" } },
    { id: "custom-r3", name: "Control Assessment", type: "control", description: "Control effectiveness review", path: "/controls/assessment", timestamp: "4 hours ago", icon: Shield, metadata: { status: "In Progress" } },
    { id: "custom-r4", name: "Risk Register", type: "risk", description: "Module-specific risks", path: "/risks", timestamp: "Yesterday", icon: AlertTriangle, metadata: { status: "12 Items" } },
    { id: "custom-r5", name: "Compliance Status", type: "report", description: "Regulatory compliance overview", path: "/compliance", timestamp: "2 days ago", icon: Scale, metadata: { status: "89% Compliant" } },
    { id: "custom-r6", name: "Audit Findings", type: "finding", description: "Outstanding audit items", path: "/findings", timestamp: "3 days ago", icon: Eye, metadata: { status: "5 Open" } },
    { id: "custom-r7", name: "Vendor Assessment", type: "vendor", description: "Third-party evaluation", path: "/vendors", timestamp: "4 days ago", icon: Users, metadata: { status: "Review" } },
    { id: "custom-r8", name: "Policy Library", type: "policy", description: "Applicable policies", path: "/policies", timestamp: "5 days ago", icon: FileText, metadata: { category: "Reference" } },
    { id: "custom-r9", name: "Workflow Automation", type: "workflow", description: "Configured workflows", path: "/workflows", timestamp: "1 week ago", icon: Settings, metadata: { status: "Active" } },
    { id: "custom-r10", name: "Analytics Report", type: "report", description: "Module analytics", path: "/analytics", timestamp: "1 week ago", icon: TrendingUp, metadata: { category: "Analytics" } },
  ],
  favorites: [
    { id: "custom-f1", name: "My Dashboard", type: "dashboard", description: "Personal workspace view", path: "/custom-workspace", timestamp: "Pinned", icon: BarChart2, metadata: { category: "Dashboard" } },
    { id: "custom-f2", name: "Active Tasks", type: "task", description: "Current action items", path: "/tasks/active", timestamp: "Pinned", icon: CheckCircle, metadata: { status: "Active" } },
    { id: "custom-f3", name: "Key Controls", type: "control", description: "Priority controls", path: "/controls/key", timestamp: "Pinned", icon: Shield, metadata: { status: "Monitoring" } },
    { id: "custom-f4", name: "High Risks", type: "risk", description: "Top-rated risks", path: "/risks/high", timestamp: "Pinned", icon: AlertTriangle, metadata: { category: "Priority" } },
    { id: "custom-f5", name: "Compliance Calendar", type: "document", description: "Regulatory deadlines", path: "/compliance/calendar", timestamp: "Pinned", icon: Clock, metadata: { status: "Current" } },
    { id: "custom-f6", name: "Open Findings", type: "finding", description: "Unresolved items", path: "/findings/open", timestamp: "Pinned", icon: Eye, metadata: { status: "Action Required" } },
    { id: "custom-f7", name: "Key Vendors", type: "vendor", description: "Critical vendors", path: "/vendors/key", timestamp: "Pinned", icon: Users, metadata: { category: "Critical" } },
    { id: "custom-f8", name: "Framework Mapping", type: "framework", description: "Control frameworks", path: "/frameworks", timestamp: "Pinned", icon: Folder, metadata: { status: "Current" } },
    { id: "custom-f9", name: "Quick Reports", type: "report", description: "Frequently used reports", path: "/reports/quick", timestamp: "Pinned", icon: FileText, metadata: { category: "Reports" } },
    { id: "custom-f10", name: "Team Activity", type: "dashboard", description: "Team performance", path: "/team-activity", timestamp: "Pinned", icon: Activity, metadata: { category: "Team" } },
  ],
};

/**
 * Get activity data for a specific workspace
 */
export const getWorkspaceActivityData = (workspacePersona: string, isCustom?: boolean): WorkspaceActivityData => {
  if (isCustom) {
    return customActivityData;
  }
  
  switch (workspacePersona) {
    case "CRO":
      return croActivityData;
    case "CAE":
      return caeActivityData;
    case "CISO":
      return cisoActivityData;
    case "Admin":
      return adminActivityData;
    default:
      return croActivityData;
  }
};

/**
 * Get type label for display
 */
export const getTypeLabel = (type: ActivityItemType): string => {
  const labels: Record<ActivityItemType, string> = {
    report: "Report",
    dashboard: "Dashboard",
    control: "Control",
    risk: "Risk",
    audit: "Audit",
    task: "Task",
    policy: "Policy",
    assessment: "Assessment",
    vendor: "Vendor",
    finding: "Finding",
    framework: "Framework",
    workflow: "Workflow",
    scan: "Scan",
    document: "Document",
  };
  return labels[type];
};
