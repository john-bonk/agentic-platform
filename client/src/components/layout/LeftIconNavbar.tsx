/**
 * Left Icon Navbar Component
 * 
 * A vertical navigation bar with icons that appears on the left side of the app.
 * This component renders icons for quick navigation between major sections.
 * 
 * WORKSPACE BEHAVIOR:
 * - Admin workspace: Only shows Home icon (navigates to /admin)
 * - All other workspaces: Shows all module icons
 */

import { Link, useLocation } from "wouter";
import { LayoutGrid, Settings, Folder, RefreshCcw, Check, HelpCircle, List, GitBranch, Rabbit, Fish, Workflow, Activity, BarChart3, Shield, Cog, Database, SlidersHorizontal } from "lucide-react";
import { type IconNavItem, getActiveModuleIndex } from "@/config/navigation";
import { useWorkspaceStore } from "@/lib/workspaceStore";

interface LeftIconNavbarProps {
  items: IconNavItem[];
  logoPath: string;
  className?: string;
  homeOnly?: boolean;
}

export function LeftIconNavbar({ items, logoPath, className = "", homeOnly }: LeftIconNavbarProps) {
  const [location] = useLocation();
  const { currentWorkspace } = useWorkspaceStore();
  
  // Admin workspace only shows Home icon
  const isAdminWorkspace = currentWorkspace.persona === "Admin";
  const isCustomWorkspace = currentWorkspace.isCustom === true;
  
  // Determine home path based on workspace type
  const homePath = isAdminWorkspace ? "/admin" : isCustomWorkspace ? "/custom-workspace" : "/";

  const renderLucideIcon = (icon: string, isActive: boolean) => {
    const colorClass = isActive ? "text-white" : "text-gray-400";
    
    switch (icon) {
      case "home":
        return <LayoutGrid className={`w-4 h-4 ${colorClass}`} />;
      case "settings":
        return <Settings className={`w-4 h-4 ${colorClass}`} />;
      case "folder":
        return <Folder className={`w-4 h-4 ${colorClass}`} />;
      case "list":
        return <List className={`w-4 h-4 ${colorClass}`} />;
      case "git-branch":
        return <GitBranch className={`w-4 h-4 ${colorClass}`} />;
      case "rabbit":
        return <Rabbit className={`w-4 h-4 ${colorClass}`} />;
      case "fish":
        return <Fish className={`w-4 h-4 ${colorClass}`} />;
      case "workflow":
        return <Workflow className={`w-4 h-4 ${colorClass}`} />;
      case "activity":
        return <Activity className={`w-4 h-4 ${colorClass}`} />;
      case "bar-chart-3":
        return <BarChart3 className={`w-4 h-4 ${colorClass}`} />;
      case "shield":
        return <Shield className={`w-4 h-4 ${colorClass}`} />;
      case "database":
        return <Database className={`w-4 h-4 ${colorClass}`} />;
      case "sliders":
        return <SlidersHorizontal className={`w-4 h-4 ${colorClass}`} />;
      case "refresh-ccw":
        return (
          <div className="relative w-4 h-4 flex items-center justify-center">
            <RefreshCcw className={`w-4 h-4 ${colorClass} absolute`} />
            <Check className={`w-2 h-2 ${colorClass}`} strokeWidth={3} />
          </div>
        );
      default:
        return <Folder className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  // Get the index of the currently active module based on path
  const activeModuleIndex = getActiveModuleIndex(location);

  return (
    <aside
      className={`flex flex-col w-14 items-center justify-between pt-2 pb-2.5 px-2 bg-gray-900 sticky top-0 z-50 flex-shrink-0 ${className}`}
      style={{ height: 'calc(100vh - var(--browser-chrome-height, 0px))' }}
      data-testid="icon-navbar"
    >
      <nav className="flex flex-col items-center gap-1 relative flex-[0_0_auto]">
        <Link href={homePath}>
          <div 
            className="w-10 h-10 rounded flex items-center justify-center hover-elevate cursor-pointer" 
            data-testid="navbar-logo"
          >
            <img
              className="w-7 h-auto"
              alt="Logo"
              src={logoPath}
            />
          </div>
        </Link>

        {items.map((item, index) => {
          // Admin workspace or homeOnly mode: only show Home icon (index 0)
          // Exception: the global Admin Console toolkit is always visible.
          if ((isAdminWorkspace || homeOnly) && index !== 0 && item.modulePrefix !== "/admin-console") {
            return null;
          }
          
          // Only the module at activeModuleIndex is active
          const active = index === activeModuleIndex;
          
          // Navigate home based on workspace type
          const itemPath = index === 0 ? homePath : item.path;
          
          const content = (
            <div
              className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer transition-colors ${
                active ? "bg-teal-500" : "hover:bg-gray-800"
              }`}
              data-testid={`navbar-icon-${index}`}
            >
              {item.type === "lucide" ? (
                renderLucideIcon(item.icon, active)
              ) : (
                <img 
                  className={`w-4 h-4 ${!active ? "opacity-60" : ""}`} 
                  alt={item.alt} 
                  src={item.src} 
                />
              )}
            </div>
          );

          if (itemPath) {
            return (
              <Link key={index} href={itemPath}>
                {content}
              </Link>
            );
          }

          return <div key={index}>{content}</div>;
        })}
      </nav>

      <div className="flex flex-col items-center gap-1">
        <Link href="/prototype-meta">
          <div 
            className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer transition-colors ${
              location === "/prototype-meta" ? "bg-teal-500" : "hover:bg-gray-800"
            }`}
            data-testid="navbar-prototype-meta"
            title="Prototype Meta View"
          >
            <Cog className={`w-4 h-4 ${location === "/prototype-meta" ? "text-white" : "text-gray-400"}`} />
          </div>
        </Link>
        {!homeOnly && (
          <div 
            className="w-10 h-10 rounded flex items-center justify-center hover:bg-gray-800 cursor-pointer" 
            data-testid="navbar-help"
          >
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    </aside>
  );
}
