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
  items: { id: string; label: string; path: string }[];
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
    id: "intelligence",
    name: "Intelligence Hub",
    icon: { type: "lucide", icon: "activity", alt: "Intelligence Hub", active: false, path: "/", modulePrefix: "/" },
    sideNavSections: [
      {
        title: "Command Center",
        items: [
          { id: "intelligence-hub", label: "Intelligence Hub", path: "/" },
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
];

/**
 * Left Icon Navbar Items (derived from modules)
 */
export const iconNavItems: IconNavItem[] = modules.map(m => m.icon);

/**
 * Side Navigation Sections (default - Intelligence Hub)
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
  // Default to Intelligence Hub
  return modules[0];
}

/**
 * Intelligence Hub paths - all paths that belong to the Intelligence Hub module
 */
const intelligenceHubPaths = ["/", "/list", "/hierarchy", "/settings", "/profile", "/wizard", "/demo", "/items"];

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
  
  // Check if path matches Intelligence Hub module paths
  for (const hubPath of intelligenceHubPaths) {
    if (path === hubPath || (hubPath !== "/" && path.startsWith(hubPath + "/"))) {
      return 0; // Intelligence Hub module
    }
  }
  
  // Root path always goes to Intelligence Hub
  if (path === "/") {
    return 0;
  }
  
  // Default to Intelligence Hub for any unmatched paths
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
