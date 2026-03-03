/**
 * Navigation Configuration
 * 
 * This file defines all navigation items for the application.
 * Modify these arrays to customize your app's navigation structure.
 * 
 * WORKSPACE PATTERN:
 * The Home module has workspace-specific navigation defined in workspaceHomeNav.
 * Each workspace (CRO, CAE, CISO) has its own side nav with links to its specific
 * Global Residual Risk dashboard.
 */

import { 
  generateNavSections as generateWizardNavSections,
  generateModuleNavGroups as generateWizardModuleNavGroups,
  productCapabilityBuckets,
} from "./workspaceWizardConfig";

export type IconNavItem = 
  | { type: "image"; src: string; alt: string; active: boolean; path?: string; modulePrefix?: string }
  | { type: "lucide"; icon: "refresh-ccw" | "home" | "settings" | "folder" | "list" | "git-branch" | "rabbit" | "fish" | "workflow" | "activity" | "bar-chart-3" | "shield" | "database"; alt: string; active: boolean; path?: string; modulePrefix?: string };

export interface SideNavItem {
  id: string;
  label: string;
  path: string;
  badge?: string;
  icon?: string;
  openInNewTab?: boolean;
}

export interface SideNavSection {
  id: string;
  title: string;
  items: SideNavItem[];
  defaultExpanded?: boolean;
  collapsible?: boolean;
}

export interface ModuleNavGroup {
  moduleId: string;
  moduleName: string;
  moduleNavShortName: string;
  moduleColor: string;
  moduleIcon: string;
  defaultExpanded?: boolean;
  sections: SideNavSection[];
}

export interface ModuleConfig {
  id: string;
  name: string;
  icon: IconNavItem;
  sideNavSections: SideNavSection[];
}

/**
 * Workspace-specific Home Navigation
 * Maps workspace persona (CRO, CAE, CISO) to their specific side nav sections.
 * The Global Residual Risk link routes to the workspace-specific dashboard.
 */
export const workspaceHomeNav: Record<string, { title: string; sections: SideNavSection[] }> = {
  "Admin": {
    title: "Admin",
    sections: [
      {
        id: "admin-management",
        title: "Management",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "admin-workspaces", label: "Workspaces", path: "/admin/workspaces" },
          { id: "admin-permissions", label: "Permissions", path: "/admin/permissions" },
          { id: "admin-data", label: "Data", path: "/admin/data" },
        ],
      },
    ],
  },
  "CRO": {
    title: "Enterprise Risk",
    sections: [
      {
        id: "cro-dashboards",
        title: "Dashboards",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "my-dashboard", label: "My Dashboard", path: "/" },
          { id: "global-residual-risk-cro", label: "Global Residual Risk", path: "/global-residual-risk", openInNewTab: true },
          { id: "risk-calculation", label: "Risk Calculation", path: "/risk-calculation" },
          { id: "vendor-exposure", label: "Vendor Exposure", path: "/vendor-exposure" },
        ],
      },
      {
        id: "cro-environment",
        title: "Environment",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "controls", label: "Controls", path: "/controls" },
          { id: "tests", label: "Tests", path: "/tests" },
          { id: "issues", label: "Issues", path: "/issues" },
          { id: "financial-accounts", label: "Financial Accounts", path: "/financial-accounts" },
        ],
      },
      {
        id: "cro-views",
        title: "Views",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "risk-control-matrix", label: "Risk Control Matrix", path: "/risk-control-matrix" },
          { id: "coso-framework", label: "COSO Framework", path: "/coso-framework" },
          { id: "open-tasks", label: "Open Tasks", path: "/open-tasks", badge: "4" },
          { id: "financial-accounts-view", label: "Financial Accounts View", path: "/financial-accounts-view" },
          { id: "financial-applications-view", label: "Financial Applications View", path: "/financial-applications-view" },
        ],
      },
    ],
  },
  "CAE": {
    title: "Enterprise Audit",
    sections: [
      {
        id: "cae-dashboards",
        title: "Dashboards",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "my-dashboard", label: "My Dashboard", path: "/" },
          { id: "global-residual-risk-cae", label: "Global Residual Risk", path: "/global-residual-risk", openInNewTab: true },
          { id: "org-impact", label: "Org Impact Analysis", path: "/org-impact" },
        ],
      },
      {
        id: "cae-environment",
        title: "Audit Environment",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "audit-plans", label: "Audit Plans", path: "/audit-plans" },
          { id: "workpapers", label: "Workpapers", path: "/workpapers" },
          { id: "findings", label: "Findings", path: "/findings" },
          { id: "recommendations", label: "Recommendations", path: "/recommendations" },
          { id: "follow-ups", label: "Follow-ups", path: "/follow-ups" },
        ],
      },
      {
        id: "cae-views",
        title: "Audit Views",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "audit-universe", label: "Audit Universe", path: "/audit-universe" },
          { id: "annual-plan", label: "Annual Plan", path: "/annual-plan" },
          { id: "open-tasks", label: "Open Tasks", path: "/open-tasks", badge: "8" },
          { id: "resource-allocation", label: "Resource Allocation", path: "/resource-allocation" },
          { id: "stakeholder-reports", label: "Stakeholder Reports", path: "/stakeholder-reports" },
        ],
      },
    ],
  },
  "CISO": {
    title: "IT Security",
    sections: [
      {
        id: "ciso-dashboards",
        title: "My Apps",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "ai-governance", label: "AI Governance", path: "/ai-governance", openInNewTab: true },
          { id: "my-dashboard", label: "My Dashboard", path: "/" },
          { id: "global-residual-risk-ciso", label: "Global Residual Risk", path: "/global-residual-risk", openInNewTab: true },
          { id: "threat-detection", label: "Threat Detection", path: "/threat-detection" },
          { id: "vulnerability-scan", label: "Vulnerability Scan", path: "/vulnerability-scan" },
        ],
      },
      {
        id: "ciso-environment",
        title: "Security Environment",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "vulnerabilities", label: "Vulnerabilities", path: "/vulnerabilities" },
          { id: "threat-intel", label: "Threat Intelligence", path: "/threat-intel" },
          { id: "incidents", label: "Security Incidents", path: "/incidents" },
          { id: "compliance-gaps", label: "Compliance Gaps", path: "/compliance-gaps" },
          { id: "vendor-risks", label: "Vendor Security Risks", path: "/vendor-risks" },
        ],
      },
      {
        id: "ciso-views",
        title: "Security Views",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "security-posture", label: "Security Posture", path: "/security-posture" },
          { id: "compliance-matrix", label: "Compliance Matrix", path: "/compliance-matrix" },
          { id: "open-tasks", label: "Open Tasks", path: "/open-tasks", badge: "12" },
          { id: "asset-inventory", label: "Asset Inventory", path: "/asset-inventory" },
          { id: "penetration-tests", label: "Penetration Tests", path: "/pen-tests" },
        ],
      },
    ],
  },
};

export const aiGovNewTabNavSections: SideNavSection[] = [
  {
    id: "aigov-main",
    title: "",
    collapsible: false,
    defaultExpanded: true,
    items: [
      { id: "aigov-dashboard", label: "Dashboard", path: "/ai-governance", icon: "layout-dashboard" },
      { id: "aigov-my-work", label: "My Work", path: "/ai-governance#my-work", icon: "clipboard-list" },
      { id: "aigov-ai-applications", label: "AI Applications", path: "/ai-governance#ai-applications", icon: "brain" },
      { id: "aigov-vendors", label: "Vendors", path: "/ai-governance#vendors", icon: "users" },
      { id: "aigov-frameworks", label: "Frameworks", path: "/ai-governance#frameworks", icon: "shield-check" },
      { id: "aigov-admin", label: "Admin", path: "/ai-governance#admin", icon: "settings" },
      { id: "aigov-resources", label: "Resources", path: "/ai-governance#resources", icon: "book-open" },
    ],
  },
];

export const globalRiskNewTabNavSections: SideNavSection[] = [
  {
    id: "grr-dashboards",
    title: "Dashboards",
    collapsible: true,
    defaultExpanded: true,
    items: [
      { id: "grr-cro", label: "Enterprise Risk", path: "/global-residual-risk#cro", icon: "trending-up" },
      { id: "grr-cae", label: "Enterprise Audit", path: "/global-residual-risk#cae", icon: "clipboard-list" },
      { id: "grr-ciso", label: "IT Security", path: "/global-residual-risk#ciso", icon: "shield-check" },
    ],
  },
  {
    id: "grr-analytics",
    title: "Analytics",
    collapsible: true,
    defaultExpanded: true,
    items: [
      { id: "grr-risk-heatmap", label: "Risk Heatmap", path: "/global-residual-risk#risk-heatmap", icon: "flame" },
      { id: "grr-mitigation-tracker", label: "Mitigation Tracker", path: "/global-residual-risk#mitigation-tracker", icon: "target" },
    ],
  },
];

export const agentHubNavSections: SideNavSection[] = [
  {
    id: "agent-hub-projects",
    title: "Projects",
    collapsible: false,
    defaultExpanded: true,
    items: [
      { id: "ah-risk-assessment", label: "Risk Assessment", path: "/", icon: "trending-up" },
      { id: "ah-scenario-analysis", label: "Scenario Analysis", path: "/#scenarios", icon: "flame" },
      { id: "ah-mitigation-plans", label: "Mitigation Plans", path: "/#mitigation", icon: "target" },
    ],
  },
  {
    id: "agent-hub-monitoring",
    title: "Monitoring",
    collapsible: true,
    defaultExpanded: true,
    items: [
      { id: "ah-risk-scores", label: "Risk Scores", path: "/#risk-scores", icon: "trending-up" },
      { id: "ah-signal-intel", label: "Signal Intelligence", path: "/#signals", icon: "brain" },
      { id: "ah-control-tracking", label: "Control Tracking", path: "/#controls", icon: "shield-check" },
    ],
  },
  {
    id: "agent-hub-scheduled",
    title: "Scheduled",
    collapsible: true,
    defaultExpanded: false,
    items: [
      { id: "ah-quarterly-review", label: "Quarterly Review", path: "/#quarterly", icon: "clipboard-list" },
      { id: "ah-kri-report", label: "KRI Report", path: "/#kri-report", icon: "trending-up" },
      { id: "ah-risk-appetite", label: "Risk Appetite", path: "/#appetite", icon: "target" },
    ],
  },
];

/**
 * Get workspace-specific home navigation
 * For custom workspaces with moduleConfig, uses generateWizardNavSections from
 * workspaceWizardConfig to generate dynamic navigation with full bucket/module support.
 */
export function getWorkspaceHomeNav(
  persona: string, 
  moduleConfig?: { selectedBuckets: string[]; enabledModules: Record<string, string[]> }
): { title: string; sections: SideNavSection[]; moduleGroups?: ModuleNavGroup[] } {
  if (moduleConfig && moduleConfig.selectedBuckets.length > 0) {
    return {
      title: "Custom Workspace",
      sections: generateWizardNavSections(moduleConfig.selectedBuckets, moduleConfig.enabledModules),
      moduleGroups: generateWizardModuleNavGroups(moduleConfig.selectedBuckets, moduleConfig.enabledModules),
    };
  }
  const nav = workspaceHomeNav[persona] || workspaceHomeNav["CRO"];
  return { ...nav, moduleGroups: undefined };
}

/**
 * Module Configurations
 * Each module has its own icon in the left navbar and its own side navigation sections
 * ORDER: Home, Global Risk, Reports, Intel Hub, Workflows (top to bottom)
 */
export const modules: ModuleConfig[] = [
  {
    id: "home",
    name: "Home",
    icon: { type: "lucide", icon: "home", alt: "Home", active: false, path: "/", modulePrefix: "/" },
    sideNavSections: [
      {
        id: "home-dashboards",
        title: "Dashboards",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "my-dashboard", label: "My Dashboard", path: "/" },
          { id: "global-residual-risk-home", label: "Global Residual Risk", path: "/global-residual-risk" },
        ],
      },
      {
        id: "home-environment",
        title: "Environment",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "controls", label: "Controls", path: "/controls" },
          { id: "tests", label: "Tests", path: "/tests" },
          { id: "issues", label: "Issues", path: "/issues" },
          { id: "financial-accounts", label: "Financial Accounts", path: "/financial-accounts" },
        ],
      },
      {
        id: "home-views",
        title: "Views",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "risk-control-matrix", label: "Risk Control Matrix", path: "/risk-control-matrix" },
          { id: "coso-framework", label: "COSO Framework", path: "/coso-framework" },
          { id: "open-tasks", label: "Open Tasks", path: "/open-tasks", badge: "4" },
          { id: "financial-accounts-view", label: "Financial Accounts View", path: "/financial-accounts-view" },
          { id: "financial-applications-view", label: "Financial Applications View", path: "/financial-applications-view" },
        ],
      },
    ],
  },
  {
    id: "database",
    name: "Database",
    icon: { type: "lucide", icon: "database", alt: "Database", active: false, path: "/inventory", modulePrefix: "/inventory" },
    sideNavSections: [
      {
        id: "db-inventory",
        title: "Inventory",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "all-inventory", label: "All Inventory", path: "/inventory" },
          { id: "coverage-mapping", label: "Coverage Mapping", path: "/coverage-mapping" },
        ],
      },
    ],
  },
  {
    id: "residual-risk",
    name: "Global Risk",
    icon: { type: "lucide", icon: "shield", alt: "Global Risk", active: false, path: "/cro/global-residual-risk", modulePrefix: "/residual-risk" },
    sideNavSections: [
      {
        id: "risk-dashboards",
        title: "Dashboards",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "cro-dashboard", label: "CRO", path: "/cro/global-residual-risk" },
          { id: "cae-dashboard", label: "CAE", path: "/cae/global-residual-risk" },
          { id: "ciso-dashboard", label: "CISO", path: "/ciso/global-residual-risk" },
        ],
      },
      {
        id: "risk-analytics",
        title: "Analytics",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "risk-heatmap", label: "Risk Heatmap", path: "/cro/risk-heatmap" },
          { id: "mitigation-tracker", label: "Mitigation Tracker", path: "/cro/mitigation-tracker" },
        ],
      },
    ],
  },
  {
    id: "reporting",
    name: "Reporting",
    icon: { type: "lucide", icon: "bar-chart-3", alt: "Reporting", active: false, path: "/reporting", modulePrefix: "/reporting" },
    sideNavSections: [
      {
        id: "reporting-reports",
        title: "Reports",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "reporting-overview", label: "Report Library", path: "/reporting" },
        ],
      },
      {
        id: "reporting-artifacts",
        title: "Artifacts",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "board-reports", label: "Board Reports", path: "/reporting/board-reports" },
          { id: "audit-committee", label: "Audit Committee", path: "/reporting/audit-committee" },
          { id: "compliance-reports", label: "Compliance Reports", path: "/reporting/compliance-reports" },
        ],
      },
      {
        id: "reporting-tools",
        title: "Tools",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "slide-builder", label: "Slide Builder", path: "/reporting/slide-builder" },
          { id: "export-center", label: "Export Center", path: "/reporting/export-center" },
        ],
      },
    ],
  },
  {
    id: "intelligence",
    name: "Intelligence Hub",
    icon: { type: "lucide", icon: "activity", alt: "Intelligence Hub", active: false, path: "/intelligence", modulePrefix: "/intelligence" },
    sideNavSections: [
      {
        id: "intel-command",
        title: "Command Center",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "intelligence-overview", label: "Overview", path: "/intelligence" },
        ],
      },
      {
        id: "intel-analytics",
        title: "Analytics",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "vendor-exposure", label: "Vendor Exposure", path: "/intelligence/vendor-exposure" },
          { id: "org-impact", label: "Org Impact Analysis", path: "/intelligence/org-impact" },
          { id: "threat-detection", label: "Threat Detection", path: "/intelligence/threat-detection" },
          { id: "vulnerability-scan", label: "Vulnerability Scan", path: "/intelligence/vulnerability-scan" },
        ],
      },
      {
        id: "intel-system",
        title: "System",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "data-explorer", label: "Data Explorer", path: "/intelligence/data-explorer" },
          { id: "entity-matrix", label: "Entity Matrix", path: "/intelligence/entity-matrix" },
          { id: "intel-config", label: "Configuration", path: "/intelligence/config" },
        ],
      },
    ],
  },
  {
    id: "workflows",
    name: "Workflows",
    icon: { type: "lucide", icon: "workflow", alt: "Workflows", active: false, path: "/workflows", modulePrefix: "/workflow" },
    sideNavSections: [
      {
        id: "workflow-operations",
        title: "Workflow Operations",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "workflow-list", label: "All Workflows", path: "/workflows" },
          { id: "workflow-new", label: "Create New", path: "/workflow/new" },
        ],
      },
    ],
  },
];

/**
 * Left Icon Navbar Items (derived from modules)
 */
export const iconNavItems: IconNavItem[] = modules.map(m => m.icon);

/**
 * Side Navigation Sections (default - Home)
 * Use getModuleSideNav() for dynamic module-based navigation
 */
export const sideNavSections: SideNavSection[] = modules[0].sideNavSections;

/**
 * Get module configuration based on current path
 * Ensures exclusive active state - only one module active at a time
 * ORDER: Home (0), Database (1), Global Risk (2), Reporting (3), Intelligence (4), Workflows (5)
 */
export function getModuleFromPath(path: string): ModuleConfig {
  // Database module (Inventory & Coverage Mapping)
  if (path.startsWith("/inventory") || path.startsWith("/coverage-mapping")) {
    return modules[1]; // Database
  }
  // Residual Risk module (CRO, CAE, CISO direct paths)
  if (path.startsWith("/cro") || path.startsWith("/cae") || path.startsWith("/ciso")) {
    return modules[2]; // Global Risk
  }
  // Reporting module
  if (path.startsWith("/reporting")) {
    return modules[3]; // Reporting
  }
  // Intelligence Hub module
  if (path.startsWith("/intelligence")) {
    return modules[4]; // Intelligence Hub
  }
  // Workflow module: any path starting with /workflow (includes /workflows and /workflow/:id)
  if (path.startsWith("/workflow")) {
    return modules[5]; // Workflows
  }
  // Default to Home
  return modules[0];
}

/**
 * Home paths - all paths that belong to the Home module
 */
const homePaths = [
  "/", "/my-dashboard", "/custom-workspace", "/controls", "/tests", 
  "/issues", "/financial-accounts", "/risk-control-matrix", "/coso-framework", 
  "/open-tasks", "/financial-accounts-view", "/financial-applications-view", 
  "/profile", "/wizard", "/demo", "/items", "/global-residual-risk",
  "/risk-calculation", "/vendor-exposure", "/org-impact", "/threat-detection", "/vulnerability-scan",
  "/admin", "/admin/workspaces", "/admin/permissions", "/admin/data",
  "/audit-plans", "/workpapers", "/findings", "/recommendations", "/follow-ups",
  "/audit-universe", "/annual-plan", "/resource-allocation", "/stakeholder-reports",
  "/vulnerabilities", "/threat-intel", "/incidents", "/compliance-gaps", "/vendor-risks",
  "/security-posture", "/compliance-matrix", "/asset-inventory", "/pen-tests",
  "/recent", "/favorites", "/ai-governance",
];

/**
 * Determine which module is active based on path
 * Returns the index of the active module, or -1 for special pages (prototype-meta)
 * ORDER: Home (0), Database (1), Global Risk (2), Reporting (3), Intelligence (4), Workflows (5)
 */
export function getActiveModuleIndex(path: string): number {
  // Special pages that don't belong to any module
  if (path === "/prototype-meta") {
    return -1; // No module active - the Cog icon handles its own active state
  }
  
  // Database module (Inventory & Coverage Mapping)
  if (path.startsWith("/inventory") || path.startsWith("/coverage-mapping")) {
    return 1; // Database module
  }
  
  // Residual Risk module (CRO, CAE, CISO direct paths)
  if (path.startsWith("/cro") || path.startsWith("/cae") || path.startsWith("/ciso")) {
    return 2; // Global Risk module
  }
  
  // Reporting module
  if (path.startsWith("/reporting")) {
    return 3; // Reporting module
  }
  
  // Intelligence Hub module
  if (path.startsWith("/intelligence")) {
    return 4; // Intelligence Hub module
  }
  
  // Workflow module: any path starting with /workflow
  if (path.startsWith("/workflow")) {
    return 5; // Workflows module
  }
  
  // Check if path matches Home module paths
  for (const homePath of homePaths) {
    if (path === homePath || (homePath !== "/" && path.startsWith(homePath + "/"))) {
      return 0; // Home module
    }
  }
  
  // Root path always goes to Home
  if (path === "/") {
    return 0;
  }
  
  // Default to Home for any unmatched paths
  return 0;
}

/**
 * Header Utility Icons
 * These appear in the top right corner of the header.
 */
export const headerUtilityIcons = [
  { icon: "bot", alt: "AI Assistant" },
  { icon: "clock", alt: "Recent Activity" },
  { icon: "mail", alt: "Messages" },
  { icon: "bell", alt: "Notifications" },
];

/**
 * App Configuration
 */
export const appConfig = {
  name: "AuditBoard Intelligence",
  shortName: "AuditBoard",
  logoPath: "/figmaAssets/auditboard-logo.png",
};
