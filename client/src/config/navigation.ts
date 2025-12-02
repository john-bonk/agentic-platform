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
    name: "القالب الأول",
    icon: { type: "lucide", icon: "rabbit", alt: "القالب الأول", active: false, path: "/", modulePrefix: "" },
    sideNavSections: [
      {
        title: "الرئيسية",
        items: [
          { id: "dashboard", label: "لوحة التحكم", path: "/" },
          { id: "list", label: "صفحة القائمة", path: "/list" },
          { id: "hierarchy", label: "التسلسل الهرمي", path: "/hierarchy" },
          { id: "wizard", label: "المعالج", path: "/wizard" },
        ],
      },
      {
        title: "الأمثلة",
        items: [
          { id: "demo", label: "عرض المكونات", path: "/demo" },
        ],
      },
      {
        title: "الإعدادات",
        items: [
          { id: "settings", label: "الإعدادات", path: "/settings" },
        ],
      },
    ],
  },
  {
    id: "template2",
    name: "القالب الثاني",
    icon: { type: "lucide", icon: "fish", alt: "القالب الثاني", active: false, path: "/template2", modulePrefix: "/template2" },
    sideNavSections: [
      {
        title: "الرئيسية",
        items: [
          { id: "dashboard2", label: "لوحة التحكم", path: "/template2" },
          { id: "list2", label: "صفحة القائمة", path: "/template2/list" },
          { id: "hierarchy2", label: "التسلسل الهرمي", path: "/template2/hierarchy" },
          { id: "wizard2", label: "المعالج", path: "/template2/wizard" },
        ],
      },
      {
        title: "الأمثلة",
        items: [
          { id: "demo2", label: "عرض المكونات", path: "/template2/demo" },
        ],
      },
      {
        title: "الإعدادات",
        items: [
          { id: "settings2", label: "الإعدادات", path: "/template2/settings" },
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
  { icon: "bot", alt: "المساعد الذكي" },
  { icon: "clock", alt: "النشاط الأخير" },
  { icon: "mail", alt: "الرسائل" },
  { icon: "bell", alt: "الإشعارات" },
];

/**
 * App Configuration
 */
export const appConfig = {
  name: "قالب البداية",
  shortName: "القالب",
  logoPath: "/figmaAssets/auditboard-logo.png",
};
