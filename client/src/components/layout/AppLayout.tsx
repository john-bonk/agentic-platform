/**
 * App Layout Component
 * 
 * The main layout wrapper that provides consistent structure across all pages.
 * Includes the icon navbar, side navigation, header, and content area.
 * 
 * Usage:
 * <AppLayout>
 *   <YourPageContent />
 * </AppLayout>
 * 
 * Or with props:
 * <AppLayout 
 *   showSideNav={false}
 *   pageTitle="My Page"
 * >
 *   <YourPageContent />
 * </AppLayout>
 * 
 * TODO: Customize layout sections as needed
 */

import { LeftIconNavbar } from "./LeftIconNavbar";
import { SideNavigation } from "./SideNavigation";
import { AppHeader } from "./AppHeader";
import { iconNavItems, sideNavSections, appConfig } from "@/config/navigation";
import { type Tab } from "@/lib/tabStore";

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
              title={appConfig.shortName}
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
