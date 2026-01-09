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
import { iconNavItems, appConfig, getModuleFromPath, getWorkspaceHomeNav } from "@/config/navigation";
import { type Tab } from "@/lib/tabStore";
import { useWorkspaceStore } from "@/lib/workspaceStore";

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
  
  const isHomeModule = currentModule.id === "home";
  const workspaceNav = isHomeModule ? getWorkspaceHomeNav(currentWorkspace.persona) : null;
  
  const sideNavSections = workspaceNav ? workspaceNav.sections : currentModule.sideNavSections;
  const sideNavTitle = workspaceNav ? workspaceNav.title : currentModule.name;
  
  return (
    <div className={`flex items-start relative h-screen overflow-hidden ${className}`}>
      {showIconNav && (
        <LeftIconNavbar 
          items={iconNavItems} 
          logoPath={appConfig.logoPath}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {showHeader && <AppHeader activeTab={activeTab} />}
        
        <div className="flex flex-1 overflow-hidden">
          {showSideNav && (
            <SideNavigation 
              sections={sideNavSections} 
              title={sideNavTitle}
            />
          )}
          
          <main className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
