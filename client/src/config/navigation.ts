/**
 * Navigation Configuration
 * 
 * This file defines all navigation items for the application.
 * Modify these arrays to customize your app's navigation structure.
 * 
 * TODO: Replace with your own navigation items
 */

export type IconNavItem = 
  | { type: "image"; src: string; alt: string; active: boolean; path?: string }
  | { type: "lucide"; icon: "refresh-ccw" | "home" | "settings" | "folder"; alt: string; active: boolean; path?: string };

export interface SideNavSection {
  title: string;
  items: { id: string; label: string; path: string }[];
}

/**
 * Left Icon Navbar Items
 * These appear in the dark vertical navbar on the left side.
 * 
 * TODO: Customize these icons for your application
 */
export const iconNavItems: IconNavItem[] = [
  { type: "lucide", icon: "home", alt: "Dashboard", active: false, path: "/" },
  { type: "lucide", icon: "folder", alt: "List Page", active: true, path: "/projects" },
  { type: "lucide", icon: "settings", alt: "Settings", active: false, path: "/settings" },
];

/**
 * Side Navigation Sections
 * These appear in the secondary navigation panel.
 * 
 * TODO: Customize these sections for your application
 */
export const sideNavSections: SideNavSection[] = [
  {
    title: "MAIN",
    items: [
      { id: "dashboard", label: "Dashboard", path: "/" },
      { id: "projects", label: "List Page", path: "/projects" },
    ],
  },
  {
    title: "EXAMPLES",
    items: [
      { id: "demo", label: "Demo Page", path: "/demo" },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { id: "settings", label: "Settings", path: "/settings" },
    ],
  },
];

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
