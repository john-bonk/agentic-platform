/**
 * Navigation Configuration
 * 
 * This file defines all navigation items for the application.
 * Modify these arrays to customize your app's navigation structure.
 * 
 * TODO: Replace with your own navigation items
 */

export type IconNavItem = 
  | { type: "image"; src: string; alt: string; active: boolean; path?: string; modulePrefix?: string }
  | { type: "lucide"; icon: "refresh-ccw" | "home" | "settings" | "folder" | "list" | "git-branch" | "rabbit" | "fish" | "workflow"; alt: string; active: boolean; path?: string; modulePrefix?: string };

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
    id: "template1",
    name: "AuditBoard",
    icon: { type: "lucide", icon: "rabbit", alt: "AuditBoard", active: false, path: "/", modulePrefix: "" },
    sideNavSections: [
      {
        title: "Main",
        items: [
          { id: "dashboard", label: "Dashboard", path: "/" },
          { id: "workflows", label: "Workflow Builder", path: "/workflows" },
        ],
      },
      {
        title: "Data",
        items: [
          { id: "list", label: "List Page", path: "/list" },
          { id: "hierarchy", label: "Hierarchy", path: "/hierarchy" },
        ],
      },
      {
        title: "Settings",
        items: [
          { id: "settings", label: "Settings", path: "/settings" },
        ],
      },
    ],
  },
  {
    id: "workflows",
    name: "Workflow Builder",
    icon: { type: "lucide", icon: "workflow", alt: "Workflow Builder", active: false, path: "/workflows", modulePrefix: "/workflows" },
    sideNavSections: [
      {
        title: "Workflows",
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
 * Side Navigation Sections (default - Template 1)
 * Use getModuleSideNav() for dynamic module-based navigation
 */
export const sideNavSections: SideNavSection[] = modules[0].sideNavSections;

/**
 * Get side navigation sections for a specific module based on current path
 */
export function getModuleFromPath(path: string): ModuleConfig {
  if (path.startsWith("/workflow")) {
    return modules[1];
  }
  return modules[0];
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
  name: "Starter Template",
  shortName: "Template",
  logoPath: "/figmaAssets/auditboard-logo.png",
};
