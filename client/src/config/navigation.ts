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
  { type: "lucide", icon: "home", alt: "Home", active: false, path: "/" },
  { type: "lucide", icon: "folder", alt: "Projects", active: true, path: "/projects" },
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
    title: "DASHBOARDS",
    items: [
      { id: "dashboard", label: "Dashboard", path: "/dashboard" },
    ],
  },
  {
    title: "ENVIRONMENT",
    items: [
      { id: "business-processes", label: "Business Processes", path: "/projects" },
      { id: "business-impact", label: "Business Impact Analyses", path: "/projects" },
      { id: "continuity-plans", label: "Business Continuity Plans", path: "/projects" },
      { id: "scenario-tests", label: "Scenario Tests", path: "/projects" },
      { id: "issues", label: "Issues", path: "/projects" },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      { id: "business-units", label: "Business Units", path: "/projects" },
      { id: "locations", label: "Locations", path: "/projects" },
      { id: "it-systems", label: "IT Systems", path: "/projects" },
      { id: "vendors", label: "Vendors", path: "/projects" },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { id: "bia-templates", label: "BIA Templates", path: "/settings" },
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
  name: "BCM",
  shortName: "BCM",
  logoPath: "/figmaAssets/auditboard-logo.png",
};
