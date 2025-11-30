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
  | { type: "lucide"; icon: "refresh-ccw" | "home" | "settings" | "folder" | "list" | "git-branch" | "rabbit" | "fish"; alt: string; active: boolean; path?: string; modulePrefix?: string };

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
    name: "Template 1",
    icon: { type: "lucide", icon: "rabbit", alt: "Template 1", active: false, path: "/", modulePrefix: "" },
    sideNavSections: [
      {
        title: "MAIN",
        items: [
          { id: "dashboard", label: "Dashboard", path: "/" },
          { id: "list", label: "List Page", path: "/list" },
          { id: "hierarchy", label: "Hierarchy", path: "/hierarchy" },
          { id: "wizard", label: "Wizard", path: "/wizard" },
        ],
      },
      {
        title: "EXAMPLES",
        items: [
          { id: "demo", label: "Component Demo", path: "/demo" },
        ],
      },
      {
        title: "SETTINGS",
        items: [
          { id: "settings", label: "Settings", path: "/settings" },
        ],
      },
    ],
  },
  {
    id: "template2",
    name: "Template 2",
    icon: { type: "lucide", icon: "fish", alt: "Template 2", active: false, path: "/template2", modulePrefix: "/template2" },
    sideNavSections: [
      {
        title: "MAIN",
        items: [
          { id: "dashboard2", label: "Dashboard", path: "/template2" },
          { id: "list2", label: "List Page", path: "/template2/list" },
          { id: "hierarchy2", label: "Hierarchy", path: "/template2/hierarchy" },
          { id: "wizard2", label: "Wizard", path: "/template2/wizard" },
        ],
      },
      {
        title: "EXAMPLES",
        items: [
          { id: "demo2", label: "Component Demo", path: "/template2/demo" },
        ],
      },
      {
        title: "SETTINGS",
        items: [
          { id: "settings2", label: "Settings", path: "/template2/settings" },
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
  if (path.startsWith("/template2")) {
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
