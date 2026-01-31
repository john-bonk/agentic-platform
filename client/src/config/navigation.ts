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
  | { type: "lucide"; icon: "refresh-ccw" | "home" | "settings" | "folder" | "list" | "git-branch" | "rabbit" | "fish" | "workflow" | "activity" | "bar-chart-3" | "shield"; alt: string; active: boolean; path?: string; modulePrefix?: string };

export interface SideNavItem {
  id: string;
  label: string;
  path: string;
  badge?: string;
  icon?: string;
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
        id: "admin-quick-access",
        title: "Quick Access",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "admin-recent", label: "Recent", path: "/recent", icon: "clock" },
          { id: "admin-favorites", label: "Favorites", path: "/favorites", icon: "star" },
        ],
      },
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
        id: "cro-quick-access",
        title: "Quick Access",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "cro-recent", label: "Recent", path: "/recent", icon: "clock" },
          { id: "cro-favorites", label: "Favorites", path: "/favorites", icon: "star" },
        ],
      },
      {
        id: "cro-dashboards",
        title: "Dashboards",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "my-dashboard", label: "My Dashboard", path: "/" },
          { id: "global-residual-risk-cro", label: "Global Residual Risk", path: "/global-residual-risk" },
        ],
      },
      {
        id: "cro-inventory",
        title: "Inventory",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "all-inventory", label: "All Inventory", path: "/inventory" },
          { id: "coverage-mapping", label: "Coverage Mapping", path: "/coverage-mapping" },
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
        id: "cae-quick-access",
        title: "Quick Access",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "cae-recent", label: "Recent", path: "/recent", icon: "clock" },
          { id: "cae-favorites", label: "Favorites", path: "/favorites", icon: "star" },
        ],
      },
      {
        id: "cae-dashboards",
        title: "Dashboards",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "my-dashboard", label: "My Dashboard", path: "/" },
          { id: "global-residual-risk-cae", label: "Global Residual Risk", path: "/global-residual-risk" },
        ],
      },
      {
        id: "cae-inventory",
        title: "Inventory",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "all-inventory", label: "All Inventory", path: "/inventory" },
          { id: "coverage-mapping", label: "Coverage Mapping", path: "/coverage-mapping" },
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
        id: "ciso-quick-access",
        title: "Quick Access",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "ciso-recent", label: "Recent", path: "/recent", icon: "clock" },
          { id: "ciso-favorites", label: "Favorites", path: "/favorites", icon: "star" },
        ],
      },
      {
        id: "ciso-dashboards",
        title: "Dashboards",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "my-dashboard", label: "My Dashboard", path: "/" },
          { id: "global-residual-risk-ciso", label: "Global Residual Risk", path: "/global-residual-risk" },
        ],
      },
      {
        id: "ciso-inventory",
        title: "Inventory",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "all-inventory", label: "All Inventory", path: "/inventory" },
          { id: "coverage-mapping", label: "Coverage Mapping", path: "/coverage-mapping" },
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
        id: "home-inventory",
        title: "Inventory",
        defaultExpanded: true,
        collapsible: true,
        items: [
          { id: "all-inventory", label: "All Inventory", path: "/inventory" },
          { id: "coverage-mapping", label: "Coverage Mapping", path: "/coverage-mapping" },
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
 * ORDER: Home (0), Global Risk (1), Reporting (2), Intelligence (3), Workflows (4)
 */
export function getModuleFromPath(path: string): ModuleConfig {
  // Residual Risk module (CRO, CAE, CISO direct paths)
  if (path.startsWith("/cro") || path.startsWith("/cae") || path.startsWith("/ciso")) {
    return modules[1]; // Global Risk
  }
  // Reporting module
  if (path.startsWith("/reporting")) {
    return modules[2]; // Reporting
  }
  // Intelligence Hub module
  if (path.startsWith("/intelligence")) {
    return modules[3]; // Intelligence Hub
  }
  // Workflow module: any path starting with /workflow (includes /workflows and /workflow/:id)
  if (path.startsWith("/workflow")) {
    return modules[4]; // Workflows
  }
  // Default to Home
  return modules[0];
}

/**
 * Home paths - all paths that belong to the Home module
 */
const homePaths = [
  "/", "/my-dashboard", "/custom-workspace", "/inventory", "/coverage-mapping", "/controls", "/tests", 
  "/issues", "/financial-accounts", "/risk-control-matrix", "/coso-framework", 
  "/open-tasks", "/financial-accounts-view", "/financial-applications-view", 
  "/profile", "/wizard", "/demo", "/items", "/global-residual-risk",
  "/admin", "/admin/workspaces", "/admin/permissions"
];

/**
 * Determine which module is active based on path
 * Returns the index of the active module, or -1 for special pages (prototype-meta)
 * ORDER: Home (0), Global Risk (1), Reporting (2), Intelligence (3), Workflows (4)
 */
export function getActiveModuleIndex(path: string): number {
  // Special pages that don't belong to any module
  if (path === "/prototype-meta") {
    return -1; // No module active - the Cog icon handles its own active state
  }
  
  // Residual Risk module (CRO, CAE, CISO direct paths)
  if (path.startsWith("/cro") || path.startsWith("/cae") || path.startsWith("/ciso")) {
    return 1; // Global Risk module
  }
  
  // Reporting module
  if (path.startsWith("/reporting")) {
    return 2; // Reporting module
  }
  
  // Intelligence Hub module
  if (path.startsWith("/intelligence")) {
    return 3; // Intelligence Hub module
  }
  
  // Workflow module: any path starting with /workflow
  if (path.startsWith("/workflow")) {
    return 4; // Workflows module
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
