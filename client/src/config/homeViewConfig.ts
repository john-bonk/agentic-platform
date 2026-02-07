/**
 * Home View Configuration System
 * 
 * A modular, dynamic system for generating workspace home dashboards based on:
 * - Archetype Templates: Layout patterns defining structure and widget slots
 * - Widget Definitions: Component types that populate slots with specific functionality
 * - Module Content Mappings: Contextual content injected based on selected modules
 * - Content Injection Engine: Dynamically generates widget content from module combinations
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                      ARCHETYPE TEMPLATE                             │
 * │  ┌─────────────────────────────────────────────────────────────┐   │
 * │  │ Layout Grid (rows x cols)                                   │   │
 * │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │   │
 * │  │  │  SLOT A  │ │  SLOT B  │ │  SLOT C  │  ← Widget Slots    │   │
 * │  │  │ (widget) │ │ (widget) │ │ (widget) │                    │   │
 * │  │  └──────────┘ └──────────┘ └──────────┘                    │   │
 * │  └─────────────────────────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────────────────┘
 *                              ↓
 *              Content Injection Engine
 *                              ↓
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Selected Modules → Content Pool → Widget Population → Rendered View│
 * └─────────────────────────────────────────────────────────────────────┘
 */

// =============================================================================
// CORE TYPE DEFINITIONS
// =============================================================================

export type WidgetSize = "small" | "medium" | "large" | "full";
export type WidgetType = 
  | "welcome-header"
  | "metrics-bar"
  | "task-list"
  | "activity-feed"
  | "chart-area"
  | "quick-actions"
  | "ai-command"
  | "timeline"
  | "status-grid"
  | "heat-map"
  | "data-table"
  | "alerts-panel"
  | "progress-tracker"
  | "kpi-cards"
  | "calendar-view"
  | "workflow-queue"
  | "coverage-map"
  | "trend-chart"
  | "summary-card"
  | "navigation-shortcuts";

export type LayoutPattern = 
  | "command-center"     // 70/30 split, executive focus
  | "operations-hub"     // 3-column even
  | "analytics-grid"     // 2x3 dashboard grid
  | "compliance-tracker" // Top banner + 2 columns
  | "workbench"          // Kanban-style columns
  | "oversight-panel"    // Master-detail split
  | "security-console"   // Status grid + detail
  | "minimal-clean"      // Single column, essential
  | "deep-dive";         // Chart-heavy 3x2 grid

export interface WidgetSlot {
  id: string;
  widgetType: WidgetType;
  size: WidgetSize;
  gridArea: string; // CSS grid-area value
  priority: number; // For responsive hiding
  contentKey?: string; // Links to ContentPool
}

export interface LayoutGrid {
  columns: number;
  rows: number;
  areas: string; // CSS grid-template-areas
  gap: string;
}

export interface ArchetypeTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  persona: string; // Target user persona
  layout: LayoutGrid;
  slots: WidgetSlot[];
  colorAccent: string;
  tags: string[];
}

// =============================================================================
// WIDGET CONTENT DEFINITIONS
// =============================================================================

export interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
  status?: "positive" | "negative" | "neutral" | "warning";
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "blocked" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  assignee?: string;
  module: string;
}

export interface ActivityItem {
  id: string;
  type: "update" | "alert" | "milestone" | "comment" | "action";
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
  module: string;
  icon?: string;
}

export interface ChartData {
  id: string;
  type: "bar" | "line" | "pie" | "donut" | "area" | "gauge";
  title: string;
  data: Array<{ label: string; value: number; color?: string }>;
  module: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  path: string;
  description?: string;
  module: string;
}

export interface AlertItem {
  id: string;
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  timestamp: string;
  module: string;
  actionLabel?: string;
  actionPath?: string;
}

export interface StatusItem {
  id: string;
  category: string;
  status: "healthy" | "warning" | "critical" | "unknown";
  label: string;
  value: string | number;
  module: string;
}

// Unified content container for all widget types
export interface WidgetContent {
  metrics?: MetricItem[];
  tasks?: TaskItem[];
  activities?: ActivityItem[];
  charts?: ChartData[];
  quickActions?: QuickAction[];
  alerts?: AlertItem[];
  statusItems?: StatusItem[];
  title?: string;
  subtitle?: string;
  greeting?: string;
}

// =============================================================================
// MODULE CONTENT MAPPING SYSTEM
// =============================================================================

export interface ModuleContentContribution {
  moduleId: string;
  moduleName: string;
  metrics: MetricItem[];
  tasks: TaskItem[];
  activities: ActivityItem[];
  charts: ChartData[];
  quickActions: QuickAction[];
  alerts: AlertItem[];
  statusItems: StatusItem[];
}

// =============================================================================
// ARCHETYPE TEMPLATE DEFINITIONS
// =============================================================================

export const archetypeTemplates: ArchetypeTemplate[] = [
  {
    id: "auditboard-default",
    name: "AuditBoard Default",
    description: "The standard AuditBoard dashboard with metrics, tasks, charts, and activity feed driven by your selected modules",
    icon: "layout-dashboard",
    persona: "Any",
    colorAccent: "#266C92",
    tags: ["default", "standard", "auditboard", "classic"],
    layout: {
      columns: 12,
      rows: 4,
      areas: `
        "welcome welcome welcome welcome welcome welcome metrics metrics metrics metrics metrics metrics"
        "tasks tasks tasks tasks tasks tasks chart1 chart1 chart1 chart1 chart1 chart1"
        "tasks tasks tasks tasks tasks tasks chart2 chart2 chart2 chart2 chart2 chart2"
        "activity activity activity activity activity activity actions actions actions actions actions actions"
      `,
      gap: "1rem",
    },
    slots: [
      { id: "welcome", widgetType: "welcome-header", size: "large", gridArea: "welcome", priority: 1 },
      { id: "metrics", widgetType: "metrics-bar", size: "medium", gridArea: "metrics", priority: 2, contentKey: "kpi" },
      { id: "tasks", widgetType: "task-list", size: "large", gridArea: "tasks", priority: 3, contentKey: "tasks" },
      { id: "chart1", widgetType: "chart-area", size: "medium", gridArea: "chart1", priority: 4, contentKey: "chart-1" },
      { id: "chart2", widgetType: "chart-area", size: "medium", gridArea: "chart2", priority: 5, contentKey: "chart-2" },
      { id: "activity", widgetType: "activity-feed", size: "medium", gridArea: "activity", priority: 6, contentKey: "activity" },
      { id: "actions", widgetType: "quick-actions", size: "medium", gridArea: "actions", priority: 7 },
    ],
  },
  {
    id: "command-center",
    name: "Executive Command Center",
    description: "High-level strategic overview with prominent AI assistance and key metrics",
    icon: "layout-dashboard",
    persona: "Executive",
    colorAccent: "#266C92",
    tags: ["strategic", "executive", "high-level"],
    layout: {
      columns: 12,
      rows: 4,
      areas: `
        "welcome welcome welcome welcome welcome welcome welcome welcome metrics metrics metrics metrics"
        "main main main main main main main main sidebar sidebar sidebar sidebar"
        "main main main main main main main main sidebar sidebar sidebar sidebar"
        "charts charts charts charts charts charts actions actions actions actions actions actions"
      `,
      gap: "1rem",
    },
    slots: [
      { id: "welcome", widgetType: "welcome-header", size: "large", gridArea: "welcome", priority: 1 },
      { id: "metrics", widgetType: "metrics-bar", size: "medium", gridArea: "metrics", priority: 2, contentKey: "kpi" },
      { id: "main", widgetType: "heat-map", size: "large", gridArea: "main", priority: 3, contentKey: "heatmap" },
      { id: "sidebar", widgetType: "ai-command", size: "medium", gridArea: "sidebar", priority: 4 },
      { id: "charts", widgetType: "chart-area", size: "medium", gridArea: "charts", priority: 5, contentKey: "trends" },
      { id: "actions", widgetType: "quick-actions", size: "medium", gridArea: "actions", priority: 6 },
    ],
  },
  {
    id: "operations-hub",
    name: "Operations Hub",
    description: "Task-focused dashboard with workflows, timelines, and recent activity",
    icon: "kanban",
    persona: "Manager",
    colorAccent: "#4CAF50",
    tags: ["operational", "tasks", "workflows"],
    layout: {
      columns: 12,
      rows: 4,
      areas: `
        "welcome welcome welcome welcome timeline timeline timeline timeline timeline timeline timeline timeline"
        "tasks tasks tasks tasks tasks tasks activity activity activity activity activity activity"
        "tasks tasks tasks tasks tasks tasks activity activity activity activity activity activity"
        "workflows workflows workflows workflows actions actions actions actions shortcuts shortcuts shortcuts shortcuts"
      `,
      gap: "1rem",
    },
    slots: [
      { id: "welcome", widgetType: "welcome-header", size: "small", gridArea: "welcome", priority: 1 },
      { id: "timeline", widgetType: "timeline", size: "large", gridArea: "timeline", priority: 2, contentKey: "timeline" },
      { id: "tasks", widgetType: "task-list", size: "large", gridArea: "tasks", priority: 3, contentKey: "tasks" },
      { id: "activity", widgetType: "activity-feed", size: "medium", gridArea: "activity", priority: 4, contentKey: "activity" },
      { id: "workflows", widgetType: "workflow-queue", size: "medium", gridArea: "workflows", priority: 5 },
      { id: "actions", widgetType: "quick-actions", size: "small", gridArea: "actions", priority: 6 },
      { id: "shortcuts", widgetType: "navigation-shortcuts", size: "small", gridArea: "shortcuts", priority: 7 },
    ],
  },
  {
    id: "analytics-grid",
    name: "Analytics Deep Dive",
    description: "Data-rich dashboard with multiple chart types and trend analysis",
    icon: "bar-chart-2",
    persona: "Analyst",
    colorAccent: "#9C27B0",
    tags: ["analytics", "data", "charts"],
    layout: {
      columns: 12,
      rows: 4,
      areas: `
        "welcome welcome welcome welcome kpi kpi kpi kpi kpi kpi kpi kpi"
        "chart1 chart1 chart1 chart1 chart2 chart2 chart2 chart2 chart3 chart3 chart3 chart3"
        "chart4 chart4 chart4 chart4 chart5 chart5 chart5 chart5 chart6 chart6 chart6 chart6"
        "table table table table table table table table export export export export"
      `,
      gap: "1rem",
    },
    slots: [
      { id: "welcome", widgetType: "welcome-header", size: "small", gridArea: "welcome", priority: 1 },
      { id: "kpi", widgetType: "kpi-cards", size: "large", gridArea: "kpi", priority: 2, contentKey: "kpi" },
      { id: "chart1", widgetType: "chart-area", size: "medium", gridArea: "chart1", priority: 3, contentKey: "chart-1" },
      { id: "chart2", widgetType: "chart-area", size: "medium", gridArea: "chart2", priority: 4, contentKey: "chart-2" },
      { id: "chart3", widgetType: "chart-area", size: "medium", gridArea: "chart3", priority: 5, contentKey: "chart-3" },
      { id: "chart4", widgetType: "trend-chart", size: "medium", gridArea: "chart4", priority: 6, contentKey: "trends" },
      { id: "chart5", widgetType: "chart-area", size: "medium", gridArea: "chart5", priority: 7, contentKey: "chart-4" },
      { id: "chart6", widgetType: "chart-area", size: "medium", gridArea: "chart6", priority: 8, contentKey: "chart-5" },
      { id: "table", widgetType: "data-table", size: "large", gridArea: "table", priority: 9, contentKey: "data" },
      { id: "export", widgetType: "quick-actions", size: "medium", gridArea: "export", priority: 10 },
    ],
  },
  {
    id: "compliance-tracker",
    name: "Compliance Dashboard",
    description: "Regulatory focus with framework coverage and control status tracking",
    icon: "shield-check",
    persona: "Compliance Officer",
    colorAccent: "#FF9800",
    tags: ["compliance", "regulatory", "controls"],
    layout: {
      columns: 12,
      rows: 4,
      areas: `
        "banner banner banner banner banner banner banner banner banner banner banner banner"
        "coverage coverage coverage coverage coverage coverage status status status status status status"
        "progress progress progress progress progress progress requests requests requests requests requests requests"
        "calendar calendar calendar calendar actions actions actions actions alerts alerts alerts alerts"
      `,
      gap: "1rem",
    },
    slots: [
      { id: "banner", widgetType: "summary-card", size: "full", gridArea: "banner", priority: 1, contentKey: "summary" },
      { id: "coverage", widgetType: "coverage-map", size: "large", gridArea: "coverage", priority: 2, contentKey: "coverage" },
      { id: "status", widgetType: "status-grid", size: "medium", gridArea: "status", priority: 3, contentKey: "status" },
      { id: "progress", widgetType: "progress-tracker", size: "medium", gridArea: "progress", priority: 4, contentKey: "progress" },
      { id: "requests", widgetType: "task-list", size: "medium", gridArea: "requests", priority: 5, contentKey: "tasks" },
      { id: "calendar", widgetType: "calendar-view", size: "small", gridArea: "calendar", priority: 6 },
      { id: "actions", widgetType: "quick-actions", size: "small", gridArea: "actions", priority: 7 },
      { id: "alerts", widgetType: "alerts-panel", size: "small", gridArea: "alerts", priority: 8, contentKey: "alerts" },
    ],
  },
  {
    id: "workbench",
    name: "Audit Workbench",
    description: "Auditor-centric view with evidence pipelines and testing workflows",
    icon: "clipboard-check",
    persona: "Auditor",
    colorAccent: "#3F51B5",
    tags: ["audit", "testing", "evidence"],
    layout: {
      columns: 12,
      rows: 4,
      areas: `
        "welcome welcome welcome ai ai ai ai ai ai ai ai ai"
        "pipeline pipeline pipeline pipeline pipeline pipeline pipeline pipeline queue queue queue queue"
        "pipeline pipeline pipeline pipeline pipeline pipeline pipeline pipeline queue queue queue queue"
        "findings findings findings findings findings findings shortcuts shortcuts shortcuts shortcuts shortcuts shortcuts"
      `,
      gap: "1rem",
    },
    slots: [
      { id: "welcome", widgetType: "welcome-header", size: "small", gridArea: "welcome", priority: 1 },
      { id: "ai", widgetType: "ai-command", size: "large", gridArea: "ai", priority: 2 },
      { id: "pipeline", widgetType: "progress-tracker", size: "large", gridArea: "pipeline", priority: 3, contentKey: "pipeline" },
      { id: "queue", widgetType: "task-list", size: "medium", gridArea: "queue", priority: 4, contentKey: "tasks" },
      { id: "findings", widgetType: "activity-feed", size: "medium", gridArea: "findings", priority: 5, contentKey: "activity" },
      { id: "shortcuts", widgetType: "navigation-shortcuts", size: "medium", gridArea: "shortcuts", priority: 6 },
    ],
  },
  {
    id: "oversight-panel",
    name: "Third Party Oversight",
    description: "Vendor and supplier risk monitoring with concentration analysis",
    icon: "users",
    persona: "Vendor Manager",
    colorAccent: "#00BCD4",
    tags: ["vendors", "third-party", "suppliers"],
    layout: {
      columns: 12,
      rows: 4,
      areas: `
        "welcome welcome welcome welcome metrics metrics metrics metrics metrics metrics metrics metrics"
        "vendors vendors vendors vendors vendors vendors detail detail detail detail detail detail"
        "vendors vendors vendors vendors vendors vendors detail detail detail detail detail detail"
        "timeline timeline timeline timeline timeline timeline alerts alerts alerts alerts alerts alerts"
      `,
      gap: "1rem",
    },
    slots: [
      { id: "welcome", widgetType: "welcome-header", size: "small", gridArea: "welcome", priority: 1 },
      { id: "metrics", widgetType: "kpi-cards", size: "large", gridArea: "metrics", priority: 2, contentKey: "kpi" },
      { id: "vendors", widgetType: "data-table", size: "large", gridArea: "vendors", priority: 3, contentKey: "data" },
      { id: "detail", widgetType: "chart-area", size: "medium", gridArea: "detail", priority: 4, contentKey: "chart-1" },
      { id: "timeline", widgetType: "timeline", size: "medium", gridArea: "timeline", priority: 5, contentKey: "timeline" },
      { id: "alerts", widgetType: "alerts-panel", size: "medium", gridArea: "alerts", priority: 6, contentKey: "alerts" },
    ],
  },
  {
    id: "security-console",
    name: "IT Security Console",
    description: "Threat and vulnerability monitoring with real-time status indicators",
    icon: "shield-alert",
    persona: "Security Analyst",
    colorAccent: "#F44336",
    tags: ["security", "threats", "vulnerabilities"],
    layout: {
      columns: 12,
      rows: 4,
      areas: `
        "threat threat threat threat threat threat vuln vuln vuln vuln vuln vuln"
        "status status status status status status status status kpi kpi kpi kpi"
        "incidents incidents incidents incidents incidents incidents incidents incidents metrics metrics metrics metrics"
        "actions actions actions actions alerts alerts alerts alerts alerts alerts alerts alerts"
      `,
      gap: "1rem",
    },
    slots: [
      { id: "threat", widgetType: "summary-card", size: "medium", gridArea: "threat", priority: 1, contentKey: "summary" },
      { id: "vuln", widgetType: "chart-area", size: "medium", gridArea: "vuln", priority: 2, contentKey: "chart-1" },
      { id: "status", widgetType: "status-grid", size: "large", gridArea: "status", priority: 3, contentKey: "status" },
      { id: "kpi", widgetType: "kpi-cards", size: "small", gridArea: "kpi", priority: 4, contentKey: "kpi" },
      { id: "incidents", widgetType: "task-list", size: "large", gridArea: "incidents", priority: 5, contentKey: "tasks" },
      { id: "metrics", widgetType: "metrics-bar", size: "small", gridArea: "metrics", priority: 6 },
      { id: "actions", widgetType: "quick-actions", size: "small", gridArea: "actions", priority: 7 },
      { id: "alerts", widgetType: "alerts-panel", size: "large", gridArea: "alerts", priority: 8, contentKey: "alerts" },
    ],
  },
  {
    id: "minimal-clean",
    name: "Minimal Focus",
    description: "Clean, distraction-free layout with essential widgets only",
    icon: "layout",
    persona: "Any",
    colorAccent: "#607D8B",
    tags: ["minimal", "simple", "clean"],
    layout: {
      columns: 12,
      rows: 3,
      areas: `
        "welcome welcome welcome welcome welcome welcome welcome welcome welcome welcome welcome welcome"
        "tasks tasks tasks tasks tasks tasks tasks tasks actions actions actions actions"
        "tasks tasks tasks tasks tasks tasks tasks tasks actions actions actions actions"
      `,
      gap: "1.5rem",
    },
    slots: [
      { id: "welcome", widgetType: "welcome-header", size: "full", gridArea: "welcome", priority: 1 },
      { id: "tasks", widgetType: "task-list", size: "large", gridArea: "tasks", priority: 2, contentKey: "tasks" },
      { id: "actions", widgetType: "quick-actions", size: "medium", gridArea: "actions", priority: 3 },
    ],
  },
  {
    id: "deep-dive",
    name: "Intelligence Center",
    description: "Comprehensive analytics with AI insights and deep data exploration",
    icon: "brain",
    persona: "Analyst",
    colorAccent: "#673AB7",
    tags: ["intelligence", "ai", "insights"],
    layout: {
      columns: 12,
      rows: 4,
      areas: `
        "ai ai ai ai ai ai ai ai welcome welcome welcome welcome"
        "insights insights insights insights insights insights charts charts charts charts charts charts"
        "trends trends trends trends trends trends charts charts charts charts charts charts"
        "feed feed feed feed feed feed actions actions actions actions actions actions"
      `,
      gap: "1rem",
    },
    slots: [
      { id: "ai", widgetType: "ai-command", size: "large", gridArea: "ai", priority: 1 },
      { id: "welcome", widgetType: "summary-card", size: "medium", gridArea: "welcome", priority: 2, contentKey: "summary" },
      { id: "insights", widgetType: "activity-feed", size: "medium", gridArea: "insights", priority: 3, contentKey: "activity" },
      { id: "charts", widgetType: "chart-area", size: "large", gridArea: "charts", priority: 4, contentKey: "chart-1" },
      { id: "trends", widgetType: "trend-chart", size: "medium", gridArea: "trends", priority: 5, contentKey: "trends" },
      { id: "feed", widgetType: "alerts-panel", size: "medium", gridArea: "feed", priority: 6, contentKey: "alerts" },
      { id: "actions", widgetType: "quick-actions", size: "medium", gridArea: "actions", priority: 7 },
    ],
  },
];

// =============================================================================
// MODULE CONTENT CONTRIBUTIONS
// Content pools organized by module, used for dynamic injection
// =============================================================================

export const moduleContentContributions: Record<string, ModuleContentContribution> = {
  "controls-management": {
    moduleId: "controls-management",
    moduleName: "Controls Management",
    metrics: [
      { id: "cm-1", label: "Total Controls", value: 847, icon: "shield-check", status: "neutral" },
      { id: "cm-2", label: "Tested This Quarter", value: 312, change: 12, changeLabel: "vs last quarter", icon: "check-circle", status: "positive" },
      { id: "cm-3", label: "Failed Tests", value: 23, change: -5, changeLabel: "fewer than last month", icon: "alert-triangle", status: "warning" },
      { id: "cm-4", label: "Attestation Rate", value: "94%", icon: "user-check", status: "positive" },
    ],
    tasks: [
      { id: "cm-t1", title: "Complete Q4 control testing for SOX 404", status: "in-progress", priority: "high", dueDate: "2026-02-15", assignee: "Sarah Chen", module: "controls-management", description: "12 controls remaining" },
      { id: "cm-t2", title: "Review evidence for ITGC controls", status: "pending", priority: "medium", dueDate: "2026-02-10", assignee: "Mike Johnson", module: "controls-management" },
      { id: "cm-t3", title: "Update control library with new framework", status: "pending", priority: "low", dueDate: "2026-02-28", module: "controls-management" },
      { id: "cm-t4", title: "Remediate control gap CM-2024-047", status: "blocked", priority: "critical", dueDate: "2026-01-31", assignee: "David Lee", module: "controls-management" },
    ],
    activities: [
      { id: "cm-a1", type: "update", title: "Control CTL-1847 status updated", description: "Testing completed, marked as effective", timestamp: "2h ago", actor: "Sarah Chen", module: "controls-management" },
      { id: "cm-a2", type: "alert", title: "Evidence request overdue", description: "3 evidence items pending for SOX controls", timestamp: "4h ago", module: "controls-management" },
      { id: "cm-a3", type: "milestone", title: "Q3 control testing completed", description: "298/298 controls tested", timestamp: "1d ago", module: "controls-management" },
    ],
    charts: [
      { id: "cm-c1", type: "pie", title: "Control Effectiveness", module: "controls-management", data: [
        { label: "Effective", value: 724, color: "#4CAF50" },
        { label: "Partially Effective", value: 98, color: "#FF9800" },
        { label: "Ineffective", value: 25, color: "#F44336" },
      ]},
      { id: "cm-c2", type: "bar", title: "Testing by Framework", module: "controls-management", data: [
        { label: "SOX", value: 145 },
        { label: "ISO 27001", value: 89 },
        { label: "SOC 2", value: 78 },
        { label: "GDPR", value: 42 },
      ]},
    ],
    quickActions: [
      { id: "cm-qa1", label: "New Control Test", icon: "plus-circle", path: "/test-execution/new", module: "controls-management" },
      { id: "cm-qa2", label: "Request Evidence", icon: "folder-plus", path: "/evidence-requests/new", module: "controls-management" },
      { id: "cm-qa3", label: "View Control Gaps", icon: "alert-triangle", path: "/control-gaps", module: "controls-management" },
    ],
    alerts: [
      { id: "cm-al1", severity: "warning", title: "Evidence Request Overdue", message: "3 items pending for 5+ days", timestamp: "Today", module: "controls-management", actionLabel: "Review", actionPath: "/evidence-requests" },
      { id: "cm-al2", severity: "info", title: "Attestation Campaign Starting", message: "Q1 attestation begins Feb 1", timestamp: "Tomorrow", module: "controls-management" },
    ],
    statusItems: [
      { id: "cm-s1", category: "Testing", status: "healthy", label: "On Track", value: "94%", module: "controls-management" },
      { id: "cm-s2", category: "Evidence", status: "warning", label: "3 Overdue", value: "97%", module: "controls-management" },
      { id: "cm-s3", category: "Remediation", status: "critical", label: "1 Blocked", value: "87%", module: "controls-management" },
    ],
  },
  "enterprise-risk": {
    moduleId: "enterprise-risk",
    moduleName: "Enterprise Risk Management",
    metrics: [
      { id: "erm-1", label: "Active Risks", value: 156, icon: "alert-triangle", status: "neutral" },
      { id: "erm-2", label: "High/Critical", value: 28, change: 3, changeLabel: "new this month", icon: "shield-alert", status: "warning" },
      { id: "erm-3", label: "Mitigated This Quarter", value: 42, icon: "shield-check", status: "positive" },
      { id: "erm-4", label: "Risk Appetite Score", value: "3.2/5", icon: "target", status: "neutral" },
    ],
    tasks: [
      { id: "erm-t1", title: "Update risk assessment for Supply Chain", status: "in-progress", priority: "high", dueDate: "2026-02-08", assignee: "Lisa Wang", module: "enterprise-risk", description: "Annual reassessment due" },
      { id: "erm-t2", title: "Review mitigation plan for R-2024-089", status: "pending", priority: "critical", dueDate: "2026-02-05", assignee: "Tom Bradley", module: "enterprise-risk" },
      { id: "erm-t3", title: "Complete KRI data collection", status: "in-progress", priority: "medium", dueDate: "2026-02-12", module: "enterprise-risk" },
    ],
    activities: [
      { id: "erm-a1", type: "alert", title: "New emerging risk identified", description: "Tariff policy changes affecting operations", timestamp: "1h ago", actor: "Risk Committee", module: "enterprise-risk" },
      { id: "erm-a2", type: "update", title: "Risk R-2024-067 downgraded", description: "Moved from Critical to High after mitigation", timestamp: "6h ago", actor: "Lisa Wang", module: "enterprise-risk" },
      { id: "erm-a3", type: "milestone", title: "Annual risk assessment complete", description: "156 risks reviewed across 12 categories", timestamp: "2d ago", module: "enterprise-risk" },
    ],
    charts: [
      { id: "erm-c1", type: "donut", title: "Risk by Category", module: "enterprise-risk", data: [
        { label: "Operational", value: 45, color: "#2196F3" },
        { label: "Financial", value: 32, color: "#4CAF50" },
        { label: "Strategic", value: 28, color: "#9C27B0" },
        { label: "Compliance", value: 51, color: "#FF9800" },
      ]},
      { id: "erm-c2", type: "line", title: "Risk Trend (12 Months)", module: "enterprise-risk", data: [
        { label: "Jan", value: 142 },
        { label: "Apr", value: 148 },
        { label: "Jul", value: 155 },
        { label: "Oct", value: 152 },
        { label: "Dec", value: 156 },
      ]},
    ],
    quickActions: [
      { id: "erm-qa1", label: "Register New Risk", icon: "plus-circle", path: "/risks/new", module: "enterprise-risk" },
      { id: "erm-qa2", label: "View Heatmap", icon: "grid", path: "/risk-heatmap", module: "enterprise-risk" },
      { id: "erm-qa3", label: "Run Assessment", icon: "calculator", path: "/risk-scoring", module: "enterprise-risk" },
    ],
    alerts: [
      { id: "erm-al1", severity: "critical", title: "Critical Risk Action Overdue", message: "R-2024-089 mitigation past deadline", timestamp: "2d overdue", module: "enterprise-risk", actionLabel: "View", actionPath: "/risks/R-2024-089" },
      { id: "erm-al2", severity: "warning", title: "KRI Threshold Breached", message: "Supplier concentration at 78%", timestamp: "Today", module: "enterprise-risk" },
    ],
    statusItems: [
      { id: "erm-s1", category: "Assessment", status: "healthy", label: "Current", value: "100%", module: "enterprise-risk" },
      { id: "erm-s2", category: "Mitigation", status: "warning", label: "2 Overdue", value: "92%", module: "enterprise-risk" },
      { id: "erm-s3", category: "Monitoring", status: "healthy", label: "Active", value: "98%", module: "enterprise-risk" },
    ],
  },
  "audit-management": {
    moduleId: "audit-management",
    moduleName: "Audit Management",
    metrics: [
      { id: "am-1", label: "Active Audits", value: 12, icon: "clipboard-list", status: "neutral" },
      { id: "am-2", label: "Open Findings", value: 47, change: -8, changeLabel: "closed this week", icon: "search", status: "positive" },
      { id: "am-3", label: "Audit Plan Progress", value: "67%", icon: "calendar", status: "neutral" },
      { id: "am-4", label: "Avg Days to Close", value: 18, change: -3, changeLabel: "faster than target", icon: "clock", status: "positive" },
    ],
    tasks: [
      { id: "am-t1", title: "Complete fieldwork for Procurement Audit", status: "in-progress", priority: "high", dueDate: "2026-02-20", assignee: "James Miller", module: "audit-management", description: "3 sections remaining" },
      { id: "am-t2", title: "Draft report for IT Security Audit", status: "pending", priority: "medium", dueDate: "2026-02-25", assignee: "Amy Roberts", module: "audit-management" },
      { id: "am-t3", title: "Management response due for F-2024-112", status: "blocked", priority: "critical", dueDate: "2026-01-28", module: "audit-management" },
    ],
    activities: [
      { id: "am-a1", type: "milestone", title: "HR Audit completed", description: "Final report issued, 5 findings noted", timestamp: "3h ago", actor: "James Miller", module: "audit-management" },
      { id: "am-a2", type: "comment", title: "New comment on F-2024-098", description: "Management provided additional context", timestamp: "8h ago", actor: "Finance Team", module: "audit-management" },
      { id: "am-a3", type: "action", title: "Finding F-2024-087 validated", description: "Evidence confirmed remediation complete", timestamp: "1d ago", actor: "Amy Roberts", module: "audit-management" },
    ],
    charts: [
      { id: "am-c1", type: "bar", title: "Findings by Status", module: "audit-management", data: [
        { label: "Open", value: 47, color: "#FF9800" },
        { label: "In Progress", value: 23, color: "#2196F3" },
        { label: "Closed", value: 156, color: "#4CAF50" },
      ]},
      { id: "am-c2", type: "pie", title: "Audit Coverage by Area", module: "audit-management", data: [
        { label: "Finance", value: 4 },
        { label: "Operations", value: 3 },
        { label: "IT", value: 3 },
        { label: "Compliance", value: 2 },
      ]},
    ],
    quickActions: [
      { id: "am-qa1", label: "Create Workpaper", icon: "file-plus", path: "/workpapers/new", module: "audit-management" },
      { id: "am-qa2", label: "Log Finding", icon: "alert-circle", path: "/findings/new", module: "audit-management" },
      { id: "am-qa3", label: "Request Interview", icon: "user-plus", path: "/requests/interview", module: "audit-management" },
    ],
    alerts: [
      { id: "am-al1", severity: "error", title: "Management Response Overdue", message: "F-2024-112 response 3 days late", timestamp: "3d overdue", module: "audit-management", actionLabel: "Follow Up", actionPath: "/findings/F-2024-112" },
      { id: "am-al2", severity: "info", title: "Audit Committee Meeting", message: "Q4 results presentation Feb 15", timestamp: "In 2 weeks", module: "audit-management" },
    ],
    statusItems: [
      { id: "am-s1", category: "Fieldwork", status: "healthy", label: "On Track", value: "4 audits", module: "audit-management" },
      { id: "am-s2", category: "Findings", status: "warning", label: "47 Open", value: "78% on time", module: "audit-management" },
      { id: "am-s3", category: "Reporting", status: "healthy", label: "Current", value: "3 drafts", module: "audit-management" },
    ],
  },
  "cyber-it-compliance": {
    moduleId: "cyber-it-compliance",
    moduleName: "Cyber & IT Compliance",
    metrics: [
      { id: "cit-1", label: "Threat Level", value: "Elevated", icon: "shield-alert", status: "warning" },
      { id: "cit-2", label: "Open Vulnerabilities", value: 234, change: -45, changeLabel: "remediated this week", icon: "bug", status: "positive" },
      { id: "cit-3", label: "Compliance Score", value: "91%", icon: "shield-check", status: "positive" },
      { id: "cit-4", label: "Incidents (30d)", value: 8, icon: "alert-triangle", status: "neutral" },
    ],
    tasks: [
      { id: "cit-t1", title: "Patch critical CVE-2026-1234", status: "in-progress", priority: "critical", dueDate: "2026-02-01", assignee: "Security Team", module: "cyber-it-compliance", description: "Affects 12 production servers" },
      { id: "cit-t2", title: "Complete SOC 2 Type II audit prep", status: "in-progress", priority: "high", dueDate: "2026-02-28", assignee: "Chris Park", module: "cyber-it-compliance" },
      { id: "cit-t3", title: "Review access permissions for Finance", status: "pending", priority: "medium", dueDate: "2026-02-15", module: "cyber-it-compliance" },
    ],
    activities: [
      { id: "cit-a1", type: "alert", title: "Suspicious login detected", description: "Multiple failed attempts from unknown IP", timestamp: "15m ago", module: "cyber-it-compliance" },
      { id: "cit-a2", type: "update", title: "Firewall rules updated", description: "Added new blocks for known threat actors", timestamp: "2h ago", actor: "Chris Park", module: "cyber-it-compliance" },
      { id: "cit-a3", type: "milestone", title: "Penetration test completed", description: "4 medium, 2 low vulnerabilities found", timestamp: "1d ago", module: "cyber-it-compliance" },
    ],
    charts: [
      { id: "cit-c1", type: "line", title: "Vulnerability Trend", module: "cyber-it-compliance", data: [
        { label: "Week 1", value: 312 },
        { label: "Week 2", value: 298 },
        { label: "Week 3", value: 267 },
        { label: "Week 4", value: 234 },
      ]},
      { id: "cit-c2", type: "donut", title: "Vulnerabilities by Severity", module: "cyber-it-compliance", data: [
        { label: "Critical", value: 12, color: "#F44336" },
        { label: "High", value: 45, color: "#FF9800" },
        { label: "Medium", value: 98, color: "#FFC107" },
        { label: "Low", value: 79, color: "#4CAF50" },
      ]},
    ],
    quickActions: [
      { id: "cit-qa1", label: "Report Incident", icon: "alert-circle", path: "/incidents/new", module: "cyber-it-compliance" },
      { id: "cit-qa2", label: "Run Scan", icon: "radar", path: "/vulnerability-scan", module: "cyber-it-compliance" },
      { id: "cit-qa3", label: "Access Review", icon: "key", path: "/access-reviews", module: "cyber-it-compliance" },
    ],
    alerts: [
      { id: "cit-al1", severity: "critical", title: "Critical Vulnerability", message: "CVE-2026-1234 requires immediate patching", timestamp: "Now", module: "cyber-it-compliance", actionLabel: "View Details", actionPath: "/vulnerabilities/CVE-2026-1234" },
      { id: "cit-al2", severity: "warning", title: "Certificate Expiring", message: "SSL certificate expires in 14 days", timestamp: "In 14 days", module: "cyber-it-compliance" },
    ],
    statusItems: [
      { id: "cit-s1", category: "Threats", status: "warning", label: "Elevated", value: "8 active", module: "cyber-it-compliance" },
      { id: "cit-s2", category: "Patching", status: "critical", label: "12 Critical", value: "234 total", module: "cyber-it-compliance" },
      { id: "cit-s3", category: "Compliance", status: "healthy", label: "91%", value: "On track", module: "cyber-it-compliance" },
    ],
  },
  "it-management": {
    moduleId: "it-management",
    moduleName: "Information Technology",
    metrics: [
      { id: "itm-1", label: "IT Assets", value: 2847, icon: "server", status: "neutral" },
      { id: "itm-2", label: "System Uptime", value: "99.7%", icon: "activity", status: "positive" },
      { id: "itm-3", label: "Open Tickets", value: 156, icon: "ticket", status: "neutral" },
      { id: "itm-4", label: "Change Requests", value: 23, change: 5, changeLabel: "pending approval", icon: "git-pull-request", status: "neutral" },
    ],
    tasks: [
      { id: "itm-t1", title: "Complete DR failover test", status: "in-progress", priority: "high", dueDate: "2026-02-10", assignee: "IT Ops Team", module: "it-management" },
      { id: "itm-t2", title: "Deploy new CRM integration", status: "pending", priority: "medium", dueDate: "2026-02-15", module: "it-management" },
      { id: "itm-t3", title: "Update asset inventory for Q1", status: "pending", priority: "low", dueDate: "2026-02-28", module: "it-management" },
    ],
    activities: [
      { id: "itm-a1", type: "update", title: "Server maintenance completed", description: "Production servers updated successfully", timestamp: "4h ago", actor: "IT Ops", module: "it-management" },
      { id: "itm-a2", type: "action", title: "Change request approved", description: "CR-2026-045 approved for deployment", timestamp: "1d ago", actor: "Change Board", module: "it-management" },
    ],
    charts: [
      { id: "itm-c1", type: "bar", title: "Assets by Type", module: "it-management", data: [
        { label: "Servers", value: 234 },
        { label: "Endpoints", value: 1845 },
        { label: "Network", value: 456 },
        { label: "Cloud", value: 312 },
      ]},
      { id: "itm-c2", type: "area", title: "Incident Response Time", module: "it-management", data: [
        { label: "Jan", value: 4.2 },
        { label: "Feb", value: 3.8 },
        { label: "Mar", value: 3.5 },
        { label: "Apr", value: 3.1 },
        { label: "May", value: 2.9 },
      ]},
    ],
    quickActions: [
      { id: "itm-qa1", label: "New Change Request", icon: "git-pull-request", path: "/changes/new", module: "it-management" },
      { id: "itm-qa2", label: "Asset Lookup", icon: "search", path: "/assets", module: "it-management" },
      { id: "itm-qa3", label: "System Status", icon: "activity", path: "/system-status", module: "it-management" },
    ],
    alerts: [
      { id: "itm-al1", severity: "info", title: "Scheduled Maintenance", message: "Database maintenance window Feb 8", timestamp: "In 1 week", module: "it-management" },
    ],
    statusItems: [
      { id: "itm-s1", category: "Systems", status: "healthy", label: "Online", value: "99.7%", module: "it-management" },
      { id: "itm-s2", category: "Changes", status: "healthy", label: "23 Pending", value: "On track", module: "it-management" },
    ],
  },
  "regulatory-compliance": {
    moduleId: "regulatory-compliance",
    moduleName: "Regulatory Compliance",
    metrics: [
      { id: "rc-1", label: "Active Regulations", value: 24, icon: "gavel", status: "neutral" },
      { id: "rc-2", label: "Compliance Rate", value: "96%", icon: "check-circle", status: "positive" },
      { id: "rc-3", label: "Pending Updates", value: 7, icon: "alert-circle", status: "warning" },
      { id: "rc-4", label: "Upcoming Deadlines", value: 3, icon: "calendar", status: "neutral" },
    ],
    tasks: [
      { id: "rc-t1", title: "Update GDPR data processing records", status: "in-progress", priority: "high", dueDate: "2026-02-15", assignee: "Compliance Team", module: "regulatory-compliance" },
      { id: "rc-t2", title: "Submit AML annual report", status: "pending", priority: "critical", dueDate: "2026-02-28", module: "regulatory-compliance" },
      { id: "rc-t3", title: "Review new SEC disclosure requirements", status: "pending", priority: "medium", dueDate: "2026-03-01", module: "regulatory-compliance" },
    ],
    activities: [
      { id: "rc-a1", type: "alert", title: "New regulation announced", description: "EU AI Act implementation guidance published", timestamp: "Today", module: "regulatory-compliance" },
      { id: "rc-a2", type: "milestone", title: "SOX 302 certification complete", description: "Q4 certifications signed by executives", timestamp: "1d ago", module: "regulatory-compliance" },
    ],
    charts: [
      { id: "rc-c1", type: "bar", title: "Compliance by Framework", module: "regulatory-compliance", data: [
        { label: "SOX", value: 98, color: "#4CAF50" },
        { label: "GDPR", value: 94, color: "#2196F3" },
        { label: "CCPA", value: 97, color: "#9C27B0" },
        { label: "HIPAA", value: 96, color: "#FF9800" },
      ]},
      { id: "rc-c2", type: "gauge", title: "Overall Compliance Score", module: "regulatory-compliance", data: [
        { label: "Compliance", value: 96 },
      ]},
    ],
    quickActions: [
      { id: "rc-qa1", label: "Regulatory Calendar", icon: "calendar", path: "/regulatory-calendar", module: "regulatory-compliance" },
      { id: "rc-qa2", label: "Gap Analysis", icon: "search", path: "/gap-analysis", module: "regulatory-compliance" },
      { id: "rc-qa3", label: "Submit Filing", icon: "send", path: "/filings/new", module: "regulatory-compliance" },
    ],
    alerts: [
      { id: "rc-al1", severity: "warning", title: "Regulatory Update Required", message: "EU AI Act requirements take effect Mar 1", timestamp: "In 4 weeks", module: "regulatory-compliance", actionLabel: "Review", actionPath: "/regulations/eu-ai-act" },
    ],
    statusItems: [
      { id: "rc-s1", category: "Filings", status: "healthy", label: "Current", value: "100%", module: "regulatory-compliance" },
      { id: "rc-s2", category: "Updates", status: "warning", label: "7 Pending", value: "Review needed", module: "regulatory-compliance" },
    ],
  },
  "third-party": {
    moduleId: "third-party",
    moduleName: "Third Party Risk",
    metrics: [
      { id: "tp-1", label: "Active Vendors", value: 342, icon: "users", status: "neutral" },
      { id: "tp-2", label: "High Risk", value: 28, icon: "alert-triangle", status: "warning" },
      { id: "tp-3", label: "Assessments Due", value: 15, icon: "clipboard-check", status: "neutral" },
      { id: "tp-4", label: "Contract Renewals", value: 8, change: 0, changeLabel: "next 30 days", icon: "file-text", status: "neutral" },
    ],
    tasks: [
      { id: "tp-t1", title: "Complete annual review for Vendor A", status: "in-progress", priority: "high", dueDate: "2026-02-10", assignee: "Vendor Management", module: "third-party" },
      { id: "tp-t2", title: "Assess new cloud provider", status: "pending", priority: "medium", dueDate: "2026-02-20", module: "third-party" },
      { id: "tp-t3", title: "Renew contract with critical supplier", status: "pending", priority: "critical", dueDate: "2026-02-15", module: "third-party" },
    ],
    activities: [
      { id: "tp-a1", type: "alert", title: "Vendor risk score increased", description: "Vendor B moved from Medium to High risk", timestamp: "2h ago", module: "third-party" },
      { id: "tp-a2", type: "update", title: "Assessment completed", description: "Vendor C passed security assessment", timestamp: "1d ago", actor: "Security Team", module: "third-party" },
    ],
    charts: [
      { id: "tp-c1", type: "pie", title: "Vendors by Risk Tier", module: "third-party", data: [
        { label: "Critical", value: 12, color: "#F44336" },
        { label: "High", value: 28, color: "#FF9800" },
        { label: "Medium", value: 156, color: "#FFC107" },
        { label: "Low", value: 146, color: "#4CAF50" },
      ]},
      { id: "tp-c2", type: "bar", title: "Assessments by Quarter", module: "third-party", data: [
        { label: "Q1", value: 45, color: "#2196F3" },
        { label: "Q2", value: 52, color: "#2196F3" },
        { label: "Q3", value: 38, color: "#2196F3" },
        { label: "Q4", value: 61, color: "#2196F3" },
      ]},
    ],
    quickActions: [
      { id: "tp-qa1", label: "Add Vendor", icon: "user-plus", path: "/vendors/new", module: "third-party" },
      { id: "tp-qa2", label: "Start Assessment", icon: "clipboard-check", path: "/assessments/new", module: "third-party" },
      { id: "tp-qa3", label: "View Contracts", icon: "file-text", path: "/contracts", module: "third-party" },
    ],
    alerts: [
      { id: "tp-al1", severity: "warning", title: "Contract Expiring Soon", message: "Critical supplier contract expires Feb 15", timestamp: "In 2 weeks", module: "third-party", actionLabel: "Review", actionPath: "/contracts/CS-2024-001" },
    ],
    statusItems: [
      { id: "tp-s1", category: "Assessments", status: "warning", label: "15 Due", value: "89%", module: "third-party" },
      { id: "tp-s2", category: "Contracts", status: "healthy", label: "8 Renewals", value: "Current", module: "third-party" },
    ],
  },
  "ai-governance": {
    moduleId: "ai-governance",
    moduleName: "AI Governance",
    metrics: [
      { id: "aig-1", label: "AI Models in Production", value: 23, icon: "brain", status: "neutral" },
      { id: "aig-2", label: "Model Risk Score", value: "Medium", icon: "gauge", status: "warning" },
      { id: "aig-3", label: "Bias Audits Completed", value: 18, icon: "scale", status: "neutral" },
      { id: "aig-4", label: "Explainability Score", value: "87%", icon: "eye", status: "positive" },
    ],
    tasks: [
      { id: "aig-t1", title: "Complete bias audit for credit model", status: "in-progress", priority: "high", dueDate: "2026-02-15", assignee: "AI Ethics Team", module: "ai-governance" },
      { id: "aig-t2", title: "Document model training data sources", status: "pending", priority: "medium", dueDate: "2026-02-28", module: "ai-governance" },
      { id: "aig-t3", title: "Review EU AI Act compliance", status: "pending", priority: "high", dueDate: "2026-03-01", module: "ai-governance" },
    ],
    activities: [
      { id: "aig-a1", type: "update", title: "Model performance drift detected", description: "Fraud detection model accuracy dropped 2%", timestamp: "1h ago", module: "ai-governance" },
      { id: "aig-a2", type: "milestone", title: "Quarterly model review completed", description: "All production models validated", timestamp: "3d ago", module: "ai-governance" },
    ],
    charts: [
      { id: "aig-c1", type: "bar", title: "Models by Risk Category", module: "ai-governance", data: [
        { label: "High", value: 5, color: "#F44336" },
        { label: "Medium", value: 12, color: "#FF9800" },
        { label: "Low", value: 6, color: "#4CAF50" },
      ]},
      { id: "aig-c2", type: "donut", title: "Model Usage Distribution", module: "ai-governance", data: [
        { label: "Production", value: 14, color: "#266C92" },
        { label: "Staging", value: 5, color: "#9C27B0" },
        { label: "Development", value: 4, color: "#607D8B" },
      ]},
    ],
    quickActions: [
      { id: "aig-qa1", label: "Register Model", icon: "plus-circle", path: "/models/new", module: "ai-governance" },
      { id: "aig-qa2", label: "Run Bias Audit", icon: "scale", path: "/bias-audits/new", module: "ai-governance" },
      { id: "aig-qa3", label: "Model Inventory", icon: "database", path: "/model-inventory", module: "ai-governance" },
    ],
    alerts: [
      { id: "aig-al1", severity: "warning", title: "Model Drift Detected", message: "Fraud detection accuracy below threshold", timestamp: "1h ago", module: "ai-governance", actionLabel: "Investigate", actionPath: "/models/fraud-detection" },
    ],
    statusItems: [
      { id: "aig-s1", category: "Models", status: "healthy", label: "23 Active", value: "All monitored", module: "ai-governance" },
      { id: "aig-s2", category: "Bias", status: "warning", label: "5 Pending", value: "Review needed", module: "ai-governance" },
    ],
  },
  "environmental-compliance": {
    moduleId: "environmental-compliance",
    moduleName: "Environmental Compliance",
    metrics: [
      { id: "ec-1", label: "Carbon Footprint", value: "12.4k tCO2e", icon: "leaf", status: "neutral" },
      { id: "ec-2", label: "ESG Score", value: "B+", icon: "award", status: "positive" },
      { id: "ec-3", label: "Sustainability Goals", value: "78%", icon: "target", status: "neutral" },
      { id: "ec-4", label: "Reporting Compliance", value: "100%", icon: "check-circle", status: "positive" },
    ],
    tasks: [
      { id: "ec-t1", title: "Submit annual CDP disclosure", status: "in-progress", priority: "high", dueDate: "2026-02-28", assignee: "Sustainability Team", module: "environmental-compliance" },
      { id: "ec-t2", title: "Calculate Scope 3 emissions", status: "pending", priority: "medium", dueDate: "2026-03-15", module: "environmental-compliance" },
      { id: "ec-t3", title: "Update water usage metrics", status: "pending", priority: "low", dueDate: "2026-03-01", module: "environmental-compliance" },
    ],
    activities: [
      { id: "ec-a1", type: "milestone", title: "Carbon neutrality milestone", description: "Achieved 25% reduction vs baseline", timestamp: "1w ago", module: "environmental-compliance" },
      { id: "ec-a2", type: "update", title: "ESG rating updated", description: "Upgraded from B to B+ by MSCI", timestamp: "2w ago", module: "environmental-compliance" },
    ],
    charts: [
      { id: "ec-c1", type: "line", title: "Emissions Trend", module: "environmental-compliance", data: [
        { label: "2022", value: 18.2 },
        { label: "2023", value: 15.6 },
        { label: "2024", value: 13.8 },
        { label: "2025", value: 12.4 },
      ]},
      { id: "ec-c2", type: "pie", title: "Energy Sources", module: "environmental-compliance", data: [
        { label: "Renewable", value: 62, color: "#4CAF50" },
        { label: "Natural Gas", value: 24, color: "#FF9800" },
        { label: "Grid", value: 14, color: "#607D8B" },
      ]},
    ],
    quickActions: [
      { id: "ec-qa1", label: "Log Emission Data", icon: "plus-circle", path: "/emissions/new", module: "environmental-compliance" },
      { id: "ec-qa2", label: "ESG Dashboard", icon: "pie-chart", path: "/esg-dashboard", module: "environmental-compliance" },
      { id: "ec-qa3", label: "Generate Report", icon: "file-text", path: "/reports/sustainability", module: "environmental-compliance" },
    ],
    alerts: [
      { id: "ec-al1", severity: "info", title: "CDP Deadline Approaching", message: "Annual disclosure due Feb 28", timestamp: "In 4 weeks", module: "environmental-compliance" },
    ],
    statusItems: [
      { id: "ec-s1", category: "Emissions", status: "healthy", label: "On Track", value: "-25%", module: "environmental-compliance" },
      { id: "ec-s2", category: "Reporting", status: "healthy", label: "Current", value: "100%", module: "environmental-compliance" },
    ],
  },
};

// =============================================================================
// CONTENT INJECTION ENGINE
// =============================================================================

export interface InjectedHomeContent {
  archetypeId: string;
  workspaceName: string;
  greeting: string;
  metrics: MetricItem[];
  tasks: TaskItem[];
  activities: ActivityItem[];
  charts: ChartData[];
  quickActions: QuickAction[];
  alerts: AlertItem[];
  statusItems: StatusItem[];
  moduleSummary: string[];
}

const taskActionVerbs: Record<string, string[]> = {
  "control-library": ["Review control definitions in", "Update documentation for", "Validate framework alignment in"],
  "control-testing": ["Execute test plan for", "Complete operating effectiveness test for", "Schedule design testing for"],
  "control-gaps": ["Remediate gap identified in", "Track deficiency for", "Close open finding in"],
  "control-attestation": ["Complete attestation cycle for", "Follow up on pending attestation in", "Launch attestation campaign for"],
  "control-monitoring": ["Review monitoring alerts for", "Configure automated checks in", "Analyze monitoring trends in"],
  "control-mapping": ["Update framework mapping for", "Verify risk-control linkage in", "Complete coverage matrix for"],
  "control-evidence": ["Collect evidence for", "Review evidence submissions in", "Upload supporting documents for"],
  "control-analytics": ["Run performance analysis for", "Generate trend report for", "Review benchmarking data in"],
  "control-reporting": ["Prepare executive summary for", "Generate board report for", "Compile status report on"],
  "risk-register": ["Update risk assessments in", "Review emerging risks in", "Validate risk ratings for"],
  "risk-assessment": ["Complete quarterly assessment for", "Score inherent risk in", "Evaluate residual risk for"],
  "risk-mitigation": ["Track mitigation progress for", "Implement response plan for", "Evaluate treatment options in"],
  "risk-appetite": ["Review appetite statements for", "Align tolerance levels in", "Update risk limits for"],
  "risk-indicators": ["Review KRI thresholds in", "Update leading indicators for", "Calibrate trigger points in"],
  "risk-scenarios": ["Model scenario outcomes for", "Update stress test parameters in", "Run Monte Carlo simulation for"],
  "risk-governance": ["Review governance framework for", "Update committee charter for", "Prepare governance report on"],
  "risk-reporting": ["Compile risk report for", "Prepare committee briefing on", "Generate dashboard for"],
  "risk-integration": ["Integrate risk data across", "Consolidate risk information for", "Synchronize risk feeds in"],
  "audit-universe": ["Update audit universe for", "Prioritize audit entities in", "Review coverage map for"],
  "audit-planning": ["Finalize audit plan for", "Allocate resources for", "Define scope for"],
  "audit-execution": ["Complete fieldwork testing for", "Document observations in", "Gather evidence for"],
  "audit-findings": ["Draft finding for", "Validate remediation for", "Track management response in"],
  "audit-reporting": ["Prepare audit report for", "Review draft report for", "Distribute findings from"],
  "audit-analytics": ["Run data analytics for", "Identify anomalies in", "Generate insights for"],
  "audit-qa": ["Complete quality review for", "Validate workpaper standards in", "Perform peer review for"],
  "audit-resources": ["Allocate team resources for", "Manage staff assignments in", "Track utilization for"],
  "audit-time": ["Log time entries for", "Review time budgets for", "Analyze time variance in"],
  "it-controls": ["Test IT general controls for", "Review access provisioning in", "Validate segregation of duties for"],
  "vulnerability-mgmt": ["Scan for vulnerabilities in", "Prioritize remediation for", "Patch critical systems in"],
  "security-incidents": ["Update incident playbook for", "Conduct tabletop exercise for", "Review incident logs in"],
  "threat-intel": ["Analyze threat landscape for", "Update threat feeds in", "Brief stakeholders on"],
  "security-assessments": ["Complete security review for", "Evaluate threat posture in", "Assess control maturity for"],
  "access-reviews": ["Certify access rights for", "Review privileged accounts in", "Validate entitlements for"],
  "security-frameworks": ["Map framework requirements for", "Assess maturity level in", "Update crosswalk for"],
  "security-metrics": ["Collect security KPIs for", "Generate metrics dashboard for", "Analyze trend data in"],
  "security-awareness": ["Launch awareness campaign for", "Track training completion for", "Update training materials for"],
  "asset-inventory": ["Catalog IT assets for", "Update asset registry in", "Validate lifecycle data for"],
  "system-inventory": ["Inventory systems for", "Update system registry in", "Validate system dependencies for"],
  "change-management": ["Review change request for", "Approve deployment for", "Document change impact in"],
  "service-catalog": ["Update service offerings for", "Review catalog entries in", "Publish new services for"],
  "bcdr-planning": ["Test disaster recovery plan for", "Validate backup procedures in", "Review RTO/RPO targets for"],
  "vendor-tech": ["Assess technology vendor for", "Review vendor SLAs for", "Evaluate vendor performance in"],
  "it-policies": ["Update IT policies for", "Review policy compliance in", "Distribute policy changes for"],
  "it-projects": ["Track project milestones for", "Review budget variance in", "Assess delivery risk for"],
  "it-metrics": ["Collect IT performance data for", "Analyze availability metrics for", "Report on SLA compliance for"],
  "regulation-library": ["Catalog regulations for", "Update regulatory library in", "Index requirements for"],
  "obligations-mgmt": ["Track obligations for", "Review compliance status for", "Map requirements for"],
  "compliance-calendar": ["Review upcoming deadlines for", "Prepare filing for", "Track regulatory submissions in"],
  "sox-compliance": ["Complete SOX testing for", "Review key controls for", "Prepare 302/404 materials for"],
  "gdpr-privacy": ["Review privacy controls for", "Update data processing records in", "Conduct DPIA for"],
  "policy-mgmt": ["Review policy effectiveness for", "Update procedures in", "Distribute policy changes for"],
  "regulatory-exams": ["Prepare for examination in", "Compile exam materials for", "Respond to findings in"],
  "regulatory-reporting": ["Generate compliance report for", "Compile regulatory filings for", "Prepare disclosure for"],
  "compliance-training": ["Complete compliance training for", "Track certifications in", "Update training requirements for"],
  "vendor-inventory": ["Update vendor registry for", "Catalog active vendors in", "Classify vendors by risk in"],
  "vendor-onboarding": ["Complete onboarding for", "Verify vendor credentials for", "Set up monitoring for"],
  "vendor-assessments": ["Complete risk assessment for", "Score vendor criticality in", "Evaluate compliance of"],
  "vendor-monitoring": ["Monitor vendor performance for", "Track SLA compliance for", "Review vendor alerts in"],
  "contract-mgmt": ["Review contract terms for", "Track renewal dates for", "Negotiate terms for"],
  "vendor-performance": ["Evaluate performance of", "Collect scorecard data for", "Review KPIs for"],
  "vendor-issues": ["Track vendor issue for", "Escalate findings for", "Resolve remediation for"],
  "fourth-party": ["Identify subcontractors for", "Assess concentration risk in", "Map supply chain for"],
  "vendor-offboarding": ["Plan offboarding for", "Transfer services from", "Archive records for"],
  "ai-inventory": ["Catalog AI models for", "Update model registry in", "Verify model documentation for"],
  "ai-risk-assessment": ["Assess AI model risk for", "Evaluate bias potential in", "Review ethical compliance of"],
  "ai-validation": ["Validate model accuracy for", "Run backtesting for", "Verify model outputs in"],
  "ai-ethics": ["Review ethical guidelines for", "Assess societal impact of", "Evaluate fairness in"],
  "ai-explainability": ["Document model decisions for", "Generate interpretability report for", "Review transparency of"],
  "ai-monitoring": ["Monitor model performance for", "Track drift metrics in", "Review prediction accuracy for"],
  "ai-lifecycle": ["Track model lifecycle for", "Review deployment status of", "Plan retirement of"],
  "ai-compliance": ["Verify AI regulatory compliance for", "Map AI requirements for", "Prepare AI disclosure for"],
  "ai-documentation": ["Document model architecture for", "Update lineage records for", "Archive training data for"],
  "esg-metrics": ["Collect ESG metrics for", "Update sustainability KPIs in", "Benchmark ESG performance for"],
  "carbon-tracking": ["Log carbon data for", "Validate emissions measurement for", "Reconcile scope data for"],
  "net-zero": ["Track net-zero progress for", "Update reduction targets for", "Report on pathway in"],
  "sustainability-reporting": ["Prepare sustainability disclosure for", "Compile ESG data for", "Generate impact report for"],
  "climate-risk": ["Assess climate risk exposure for", "Model physical risk for", "Evaluate transition risk in"],
  "supply-chain-esg": ["Assess supply chain ESG for", "Monitor supplier compliance in", "Track scope 3 emissions for"],
  "biodiversity": ["Monitor biodiversity impact for", "Assess ecological footprint of", "Report on habitat metrics for"],
  "water-waste": ["Track water usage for", "Monitor waste metrics for", "Optimize resource efficiency in"],
  "dei-social": ["Review DEI metrics for", "Assess community impact of", "Track social initiatives in"],
};

const taskAssignees = [
  "Sarah Chen", "Michael Torres", "James Wilson", "Amanda Liu", "David Kim",
  "Rachel Green", "Tom Anderson", "Lisa Park", "Steven Yeun", "Michelle Tu",
  "Alex Park", "Jennifer Lee", "Robert Nguyen", "Emily Zhang", "Kevin Wu",
];

const taskStatuses: Array<"pending" | "in-progress" | "completed"> = ["pending", "in-progress", "pending", "in-progress", "pending"];
const taskPriorities: Array<"low" | "medium" | "high" | "critical"> = ["high", "medium", "high", "medium", "low", "critical", "medium"];

function generateDynamicTasks(
  selectedModules: string[],
  enabledModules?: Record<string, string[]>
): TaskItem[] {
  const tasks: TaskItem[] = [];
  let idx = 0;

  const today = new Date();
  const generateDueDate = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const dueDateOffsets = [3, 7, 10, 14, 5, 21, 2, 8, 12, 6, 15, 4, 9, 18, 1];

  for (const bucketId of selectedModules) {
    const capabilityIds = enabledModules?.[bucketId] || [];

    if (capabilityIds.length === 0) {
      const contribution = moduleContentContributions[bucketId];
      if (contribution) {
        tasks.push(...contribution.tasks);
      }
      continue;
    }

    for (const capId of capabilityIds) {
      const verbs = taskActionVerbs[capId] || [`Review and update`, `Complete assessment for`, `Prepare documentation for`];

      const verb = verbs[idx % verbs.length];
      const moduleName = moduleContentContributions[bucketId]?.moduleName || bucketId;
      const status = taskStatuses[idx % taskStatuses.length];
      const priority = taskPriorities[idx % taskPriorities.length];
      const assignee = taskAssignees[idx % taskAssignees.length];
      const dueOffset = dueDateOffsets[idx % dueDateOffsets.length];

      tasks.push({
        id: `dyn-${bucketId}-${capId}-${idx}`,
        title: `${verb} ${moduleName}`,
        status,
        priority,
        dueDate: generateDueDate(dueOffset),
        assignee,
        module: bucketId,
      });
      idx++;
    }
  }

  return tasks;
}

/**
 * Generates dynamic home content based on selected modules and archetype
 * 
 * @param selectedModules - Array of module IDs selected by user
 * @param archetypeId - Selected archetype template ID
 * @param workspaceName - Custom workspace name
 * @param enabledModules - Optional map of bucket ID to enabled capability IDs for dynamic task generation
 * @returns Fully populated content for the home view
 */
export function generateHomeContent(
  selectedModules: string[],
  archetypeId: string,
  workspaceName: string,
  enabledModules?: Record<string, string[]>
): InjectedHomeContent {
  const archetype = archetypeTemplates.find(t => t.id === archetypeId) || archetypeTemplates[0];
  
  const allMetrics: MetricItem[] = [];
  const allActivities: ActivityItem[] = [];
  const allCharts: ChartData[] = [];
  const allQuickActions: QuickAction[] = [];
  const allAlerts: AlertItem[] = [];
  const allStatusItems: StatusItem[] = [];
  const moduleSummary: string[] = [];

  for (const moduleId of selectedModules) {
    const contribution = moduleContentContributions[moduleId];
    if (contribution) {
      allMetrics.push(...contribution.metrics);
      allActivities.push(...contribution.activities);
      allCharts.push(...contribution.charts);
      allQuickActions.push(...contribution.quickActions);
      allAlerts.push(...contribution.alerts);
      allStatusItems.push(...contribution.statusItems);
      moduleSummary.push(contribution.moduleName);
    }
  }

  const allTasks = generateDynamicTasks(selectedModules, enabledModules);

  const slotCounts = {
    metrics: archetype.slots.filter(s => s.widgetType === "metrics-bar" || s.widgetType === "kpi-cards").length,
    tasks: archetype.slots.filter(s => s.widgetType === "task-list").length,
    charts: archetype.slots.filter(s => s.widgetType === "chart-area" || s.widgetType === "trend-chart").length,
    activities: archetype.slots.filter(s => s.widgetType === "activity-feed").length,
    alerts: archetype.slots.filter(s => s.widgetType === "alerts-panel").length,
  };

  const shuffleAndLimit = <T>(arr: T[], limit: number): T[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  };

  const metricsLimit = Math.max(4, slotCounts.metrics * 4);
  const tasksLimit = Math.max(4, slotCounts.tasks * 5);
  const chartsLimit = Math.max(2, slotCounts.charts * 2);
  const activitiesLimit = Math.max(3, slotCounts.activities * 4);
  const alertsLimit = Math.max(2, slotCounts.alerts * 3);

  return {
    archetypeId,
    workspaceName,
    greeting: `Welcome to ${workspaceName}`,
    metrics: shuffleAndLimit(allMetrics, metricsLimit),
    tasks: allTasks.sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
    }).slice(0, tasksLimit),
    activities: shuffleAndLimit(allActivities, activitiesLimit),
    charts: shuffleAndLimit(allCharts, chartsLimit),
    quickActions: shuffleAndLimit(allQuickActions, 6),
    alerts: allAlerts.sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, error: 1, warning: 2, info: 3 };
      return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
    }).slice(0, alertsLimit),
    statusItems: shuffleAndLimit(allStatusItems, 6),
    moduleSummary,
  };
}

/**
 * Gets archetype recommendation based on selected modules
 */
export function getRecommendedArchetype(selectedModules: string[]): string {
  // Map module combinations to ideal archetypes
  if (selectedModules.includes("cyber-it-compliance") || selectedModules.includes("it-management")) {
    return "security-console";
  }
  if (selectedModules.includes("audit-management")) {
    return "workbench";
  }
  if (selectedModules.includes("enterprise-risk")) {
    return "command-center";
  }
  if (selectedModules.includes("regulatory-compliance") || selectedModules.includes("controls-management")) {
    return "compliance-tracker";
  }
  if (selectedModules.includes("third-party")) {
    return "oversight-panel";
  }
  if (selectedModules.includes("ai-governance")) {
    return "deep-dive";
  }
  if (selectedModules.length <= 2) {
    return "minimal-clean";
  }
  if (selectedModules.length >= 4) {
    return "analytics-grid";
  }
  return "operations-hub";
}

/**
 * Gets archetype templates filtered by tags
 */
export function getArchetypesByTag(tag: string): ArchetypeTemplate[] {
  return archetypeTemplates.filter(t => t.tags.includes(tag));
}

/**
 * Gets archetype templates filtered by persona
 */
export function getArchetypesByPersona(persona: string): ArchetypeTemplate[] {
  return archetypeTemplates.filter(t => t.persona === persona || t.persona === "Any");
}
