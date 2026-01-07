/**
 * Navigation Configuration
 * 
 * This file defines all navigation items for the application.
 * Modify these arrays to customize your app's navigation structure.
 */

export type IconNavItem = 
  | { type: "image"; src: string; alt: string; active: boolean; path?: string; modulePrefix?: string }
  | { type: "lucide"; icon: "refresh-ccw" | "home" | "settings" | "folder" | "list" | "git-branch" | "rabbit" | "fish" | "workflow" | "activity"; alt: string; active: boolean; path?: string; modulePrefix?: string };

export interface SideNavSection {
  title: string;
  items: { id: string; label: string; path: string; badge?: string }[];
}

export interface ModuleConfig {
  id: string;
  name: string;
  icon: IconNavItem;
  sideNavSections: SideNavSection[];
}

/**
 * Module Configurations
 * Each module has its own icon in the left navbar and its own side navigation sections
 */
export const modules: ModuleConfig[] = [
  {
    id: "home",
    name: "Home",
    icon: { type: "lucide", icon: "home", alt: "Home", active: false, path: "/", modulePrefix: "/" },
    sideNavSections: [
      {
        title: "Dashboards",
        items: [
          { id: "my-dashboard", label: "My Dashboard", path: "/" },
        ],
      },
      {
        title: "Inventory",
        items: [
          { id: "all-inventory", label: "All Inventory", path: "/inventory" },
          { id: "coverage-mapping", label: "Coverage Mapping", path: "/coverage-mapping" },
        ],
      },
      {
        title: "Environment",
        items: [
          { id: "controls", label: "Controls", path: "/controls" },
          { id: "tests", label: "Tests", path: "/tests" },
          { id: "issues", label: "Issues", path: "/issues" },
          { id: "financial-accounts", label: "Financial Accounts", path: "/financial-accounts" },
        ],
      },
      {
        title: "Views",
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
    id: "workflows",
    name: "Workflows",
    icon: { type: "lucide", icon: "workflow", alt: "Workflows", active: false, path: "/workflows", modulePrefix: "/workflow" },
    sideNavSections: [
      {
        title: "Workflow Operations",
        items: [
          { id: "workflow-list", label: "All Workflows", path: "/workflows" },
          { id: "workflow-new", label: "Create New", path: "/workflow/new" },
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
        title: "Command Center",
        items: [
          { id: "intelligence-hub", label: "Intelligence Hub", path: "/intelligence" },
        ],
      },
      {
        title: "Analytics",
        items: [
          { id: "list", label: "Data Explorer", path: "/list" },
          { id: "hierarchy", label: "Entity Matrix", path: "/hierarchy" },
        ],
      },
      {
        title: "System",
        items: [
          { id: "settings", label: "Configuration", path: "/settings" },
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
 */
export function getModuleFromPath(path: string): ModuleConfig {
  // Workflow module: any path starting with /workflow (includes /workflows and /workflow/:id)
  if (path.startsWith("/workflow")) {
    return modules[1];
  }
  // Intelligence Hub module
  if (path.startsWith("/intelligence")) {
    return modules[2];
  }
  // Default to Home
  return modules[0];
}

/**
 * Home paths - all paths that belong to the Home module
 */
const homePaths = [
  "/", "/my-dashboard", "/inventory", "/coverage-mapping", "/controls", "/tests", 
  "/issues", "/financial-accounts", "/risk-control-matrix", "/coso-framework", 
  "/open-tasks", "/financial-accounts-view", "/financial-applications-view", 
  "/profile", "/wizard", "/demo", "/items"
];

/**
 * Determine which module is active based on path
 * Returns the index of the active module
 * Explicitly maps all paths to ensure only one module is active at a time
 */
export function getActiveModuleIndex(path: string): number {
  // Workflow module: any path starting with /workflow
  if (path.startsWith("/workflow")) {
    return 1; // Workflows module
  }
  
  // Intelligence Hub module
  if (path.startsWith("/intelligence") || path === "/list" || path === "/hierarchy" || path === "/settings") {
    return 2; // Intelligence Hub module
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
