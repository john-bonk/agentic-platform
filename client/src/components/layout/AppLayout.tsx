/**
 * AppLayout Component
 * 
 * CANONICAL IMPLEMENTATION - Always wrap pages with this component.
 * DO NOT create custom page wrappers - use AppLayout instead.
 * 
 * The main layout wrapper that provides consistent structure across all pages.
 * Includes the icon navbar, side navigation, header, and content area.
 * 
 * Usage:
 * ```tsx
 * import { AppLayout } from "@/components/layout";
 * 
 * <AppLayout>
 *   <YourPageContent />
 * </AppLayout>
 * ```
 */

import { useLocation } from "wouter";
import { LeftIconNavbar } from "./LeftIconNavbar";
import { SideNavigation } from "./SideNavigation";
import { AppHeader } from "./AppHeader";
import { iconNavItems, appConfig, getModuleFromPath, getWorkspaceHomeNav, aiGovNewTabNavSections } from "@/config/navigation";
import { type Tab } from "@/lib/tabStore";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";
import { useBrowserTabStore } from "@/lib/browserTabStore";

const ASSISTANT_PANEL_WIDTH = 420;

interface AppLayoutProps {
  children: React.ReactNode;
  showSideNav?: boolean;
  showHeader?: boolean;
  showIconNav?: boolean;
  activeTab?: Tab | null;
  className?: string;
}

export function AppLayout({ 
  children, 
  showSideNav = true,
  showHeader = true,
  showIconNav = true,
  activeTab,
  className = "",
}: AppLayoutProps) {
  const [location] = useLocation();
  const currentModule = getModuleFromPath(location);
  const { currentWorkspace } = useWorkspaceStore();
  const { isOpen: isAssistantOpen } = useHomeAssistantStore();
  const { activeTabId, getActiveRoute } = useBrowserTabStore();
  
  const isAiGovNewTab = location === "/ai-governance" && activeTabId !== "main" && getActiveRoute() === "/ai-governance";
  
  const isHomeModule = currentModule.id === "home";
  const workspaceNav = isHomeModule 
    ? getWorkspaceHomeNav(currentWorkspace.persona, currentWorkspace.moduleConfig) 
    : null;
  
  const sideNavSections = isAiGovNewTab 
    ? aiGovNewTabNavSections 
    : (workspaceNav ? workspaceNav.sections : currentModule.sideNavSections);
  const sideNavModuleGroups = isAiGovNewTab ? undefined : workspaceNav?.moduleGroups;
  const sideNavTitle = isAiGovNewTab ? "AI Governance" : (isHomeModule ? currentWorkspace.name : currentModule.name);
  
  return (
    <div 
      className={`flex items-start relative overflow-hidden bg-background ${className}`}
      style={{ height: 'calc(100vh - var(--browser-chrome-height, 0px))' }}
    >
      {showIconNav && !isAiGovNewTab && (
        <LeftIconNavbar 
          items={iconNavItems} 
          logoPath={appConfig.logoPath}
        />
      )}

      {/* Side Navigation - Full viewport height, adjacent to icon navbar */}
      {showSideNav && (
        <SideNavigation 
          sections={sideNavSections} 
          moduleGroups={sideNavModuleGroups}
          title={sideNavTitle}
          hideQuickAccess={isAiGovNewTab}
        />
      )}

      <div 
        className="flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{ height: 'calc(100vh - var(--browser-chrome-height, 0px))' }}
      >
        {showHeader && <AppHeader activeTab={activeTab} />}
        
        <div className="flex flex-1 overflow-hidden relative">
          <main 
            className="flex flex-col flex-1 min-w-0 overflow-auto bg-white dark:bg-background transition-all duration-300 ease-in-out"
            style={{ marginRight: isAssistantOpen ? `${ASSISTANT_PANEL_WIDTH}px` : 0 }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
