/**
 * Side Navigation Component
 * 
 * A sophisticated navigation panel with:
 * - Full viewport height extending into header area
 * - Workspace switcher as functional panel header
 * - Home/Recent/Favorites quick access (non-collapsible)
 * - Collapsible section groups for module navigation
 * - Narrow collapsed state with quick-access icons
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  ChevronDown, 
  Home, 
  Clock, 
  Star, 
  PanelLeftClose,
  PanelLeft,
  ChevronDownIcon,
  Check,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { type SideNavSection, getActiveModuleIndex } from "@/config/navigation";
import { useSideNavStore } from "@/lib/sideNavStore";
import { useWorkspaceStore, type Workspace } from "@/lib/workspaceStore";
import { WorkspaceCreationWizard } from "@/components/workspace/WorkspaceCreationWizard";

interface SideNavigationProps {
  sections: SideNavSection[];
  title: string;
  className?: string;
  onWorkspaceCreated?: (workspace: Workspace) => void;
}

interface CollapsibleSectionProps {
  section: SideNavSection;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: (path: string) => boolean;
}

function CollapsibleSection({ section, isExpanded, onToggle, isActive }: CollapsibleSectionProps) {
  const isCollapsible = section.collapsible !== false;

  return (
    <div className="flex flex-col">
      <button
        onClick={isCollapsible ? onToggle : undefined}
        className={`flex items-center justify-between px-2 py-1.5 w-full text-left ${
          isCollapsible ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-accent rounded transition-colors" : "cursor-default"
        }`}
        data-testid={`nav-section-${section.id}`}
      >
        <span className="text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-wider">
          {section.title}
        </span>
        {isCollapsible && (
          <ChevronDown 
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? "" : "-rotate-90"
            }`}
          />
        )}
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-0.5 pt-1">
          {section.items.map((item) => (
            <li key={item.id}>
              <Link href={item.path}>
                <Button
                  variant="ghost"
                  className={`h-[33px] w-full items-center gap-2 px-2 py-1.5 rounded flex justify-start ${
                    isActive(item.path)
                      ? "bg-teal-50 dark:bg-primary/10 hover:bg-teal-50 dark:hover:bg-primary/10" 
                      : "hover:bg-gray-100 dark:hover:bg-accent"
                  }`}
                  data-testid={`nav-item-${item.id}`}
                >
                  <span
                    className={`flex-1 text-left text-sm whitespace-nowrap ${
                      isActive(item.path)
                        ? "font-semibold text-teal-600 dark:text-primary"
                        : "font-normal text-gray-600 dark:text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="bg-[#266C92] text-white text-xs h-5 min-w-5 flex items-center justify-center"
                      data-testid={`nav-badge-${item.id}`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Quick access item component for Home/Recent/Favorites
interface QuickAccessItemProps {
  icon: typeof Home;
  label: string;
  path?: string;
  isActive?: boolean;
  onClick?: () => void;
}

function QuickAccessItem({ icon: Icon, label, path, isActive, onClick }: QuickAccessItemProps) {
  const content = (
    <Button
      variant="ghost"
      className={`h-[36px] w-full items-center gap-3 px-3 py-2 rounded flex justify-start ${
        isActive
          ? "bg-teal-50 dark:bg-primary/10 hover:bg-teal-50 dark:hover:bg-primary/10" 
          : "hover:bg-gray-100 dark:hover:bg-accent"
      }`}
      onClick={onClick}
      data-testid={`nav-quick-${label.toLowerCase()}`}
    >
      <Icon className={`w-4 h-4 ${isActive ? "text-teal-600 dark:text-primary" : "text-gray-500 dark:text-muted-foreground"}`} />
      <span
        className={`text-sm ${
          isActive
            ? "font-semibold text-teal-600 dark:text-primary"
            : "font-normal text-gray-600 dark:text-foreground"
        }`}
      >
        {label}
      </span>
    </Button>
  );

  if (path) {
    return <Link href={path}>{content}</Link>;
  }
  return content;
}

export function SideNavigation({ sections, title, className = "", onWorkspaceCreated }: SideNavigationProps) {
  const [location, setLocation] = useLocation();
  const { isCollapsed, setCollapsed } = useSideNavStore();
  const { currentWorkspace, setWorkspace, getAllWorkspaces, refreshKey } = useWorkspaceStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const allWorkspaces = useMemo(() => getAllWorkspaces(), [refreshKey, getAllWorkspaces]);
  
  // Filter out "My Dashboard" items since we now have top-level Home quick access
  const filteredSections = useMemo(() => {
    return sections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.path !== "/" && 
        item.label !== "My Dashboard" &&
        item.id !== "my-dashboard"
      )
    })).filter(section => section.items.length > 0);
  }, [sections]);
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(section => {
      initial[section.id] = section.defaultExpanded !== false;
    });
    return initial;
  });

  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    sections.forEach(section => {
      newExpanded[section.id] = expandedSections[section.id] ?? section.defaultExpanded !== false;
    });
    setExpandedSections(newExpanded);
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const activeModuleIndex = getActiveModuleIndex(location);

  const isActive = (path: string) => {
    if (activeModuleIndex === 0) {
      if (path === "/") {
        return location === "/" || location === "/my-dashboard";
      }
      if (path === "/global-residual-risk") {
        return location === "/global-residual-risk";
      }
      if (path === "/admin") {
        return location === "/admin";
      }
      return location === path || location.startsWith(path + "/");
    }
    
    if (activeModuleIndex === 1) {
      return location === path || location.startsWith(path + "/");
    }

    if (activeModuleIndex === 2) {
      return location === path || location.startsWith(path + "/");
    }

    if (activeModuleIndex === 3) {
      if (path === "/intelligence") {
        return location === "/intelligence";
      }
      return location === path || location.startsWith(path + "/");
    }

    if (activeModuleIndex === 4) {
      if (path === "/workflows") {
        return location === "/workflows";
      }
      if (path === "/workflow/new") {
        return location === "/workflow/new";
      }
      return location === path || location.startsWith(path + "/");
    }
    
    return false;
  };

  const handleWorkspaceChange = (workspace: Workspace) => {
    setWorkspace(workspace);
    if (workspace.isCustom) {
      setLocation("/custom-workspace");
    } else if (workspace.persona === "Admin") {
      setLocation("/admin");
    } else {
      setLocation("/");
    }
  };

  const handleWorkspaceCreatedInternal = (workspace: Workspace) => {
    if (workspace.isCustom) {
      setLocation("/custom-workspace");
    } else {
      setLocation("/");
    }
    onWorkspaceCreated?.(workspace);
  };

  const isHomeActive = location === "/" || location === "/my-dashboard" || location === "/custom-workspace";

  return (
    <>
      <nav 
        className={`flex h-screen flex-shrink-0 z-30 transition-all duration-300 ease-in-out ${className}`}
        data-testid="side-navigation"
      >
        {/* Collapsed Toolbar - Narrow vertical strip, full height */}
        <div 
          className={`flex flex-col bg-white dark:bg-card border-r border-gray-200 dark:border-border h-full transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-[36px] opacity-100" : "w-0 opacity-0 overflow-hidden"
          }`}
        >
          {/* Dark header section matching top header */}
          <div 
            className="flex items-center justify-center h-12 flex-shrink-0"
            style={{ backgroundColor: '#101827' }}
          >
            <button
              onClick={() => setCollapsed(false)}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded transition-colors cursor-pointer"
              data-testid="nav-expand-button"
            >
              <PanelLeft className="w-3 h-3 text-gray-400" />
            </button>
          </div>

          {/* Quick access icons */}
          <div className="flex flex-col items-center gap-0.5 pt-2 px-1">
            <Link href={currentWorkspace.isCustom ? "/custom-workspace" : "/"}>
              <button
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                  isHomeActive 
                    ? "bg-teal-50 dark:bg-primary/10" 
                    : "hover:bg-gray-100 dark:hover:bg-accent"
                }`}
                data-testid="nav-collapsed-home"
                title="Home"
              >
                <Home className={`w-3 h-3 ${isHomeActive ? "text-teal-600 dark:text-primary" : "text-gray-500 dark:text-muted-foreground"}`} />
              </button>
            </Link>
            <button
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-accent rounded transition-colors"
              data-testid="nav-collapsed-recent"
              title="Recent"
            >
              <Clock className="w-3 h-3 text-gray-500 dark:text-muted-foreground" />
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-accent rounded transition-colors"
              data-testid="nav-collapsed-favorites"
              title="Favorites"
            >
              <Star className="w-3 h-3 text-gray-500 dark:text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Main Content Area - Slides left when collapsed */}
        <div className={`flex flex-col h-full bg-white dark:bg-card border-r border-gray-200 dark:border-border transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0 overflow-hidden" : "w-[236px]"
        }`}>
          {/* Panel Header - Dark background matching header, with Workspace Switcher */}
          <div 
            className="flex items-center justify-between h-12 px-3 flex-shrink-0 transition-all duration-300 ease-in-out"
            style={{ backgroundColor: '#101827' }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 h-8 px-2 text-white hover:bg-gray-700"
                  data-testid="sidenav-workspace-switcher"
                >
                  <span className="text-sm font-semibold truncate max-w-[160px]">{currentWorkspace.name}</span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56" data-testid="sidenav-workspace-dropdown">
                <DropdownMenuLabel className="text-xs text-gray-500 font-normal">Your workspaces</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allWorkspaces.map((workspace) => {
                  const isActiveWs = workspace.id === currentWorkspace.id;
                  return (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => handleWorkspaceChange(workspace)}
                      className="flex items-center gap-2 cursor-pointer"
                      data-testid={`sidenav-workspace-option-${workspace.id}`}
                    >
                      <span>{workspace.name}</span>
                      {isActiveWs && (
                        <Check className="ml-auto w-4 h-4 text-[#266C92]" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setCreateDialogOpen(true)}
                  className="flex items-center gap-2 cursor-pointer text-[#266C92]"
                  data-testid="sidenav-workspace-create-new"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create new</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setCollapsed(true)}
              className={`w-7 h-7 flex items-center justify-center hover:bg-gray-700 rounded transition-all duration-300 cursor-pointer ${
                isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              data-testid="nav-collapse-button"
            >
              <PanelLeftClose className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Quick Access Items - Home, Recent, Favorites */}
          <div className={`flex flex-col gap-0.5 px-3 pt-3 pb-2 border-b border-gray-100 dark:border-border transition-all duration-300 ease-in-out ${
            isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}>
            <QuickAccessItem 
              icon={Home} 
              label="Home" 
              path={currentWorkspace.isCustom ? "/custom-workspace" : "/"} 
              isActive={isHomeActive}
            />
            <QuickAccessItem 
              icon={Clock} 
              label="Recent" 
            />
            <QuickAccessItem 
              icon={Star} 
              label="Favorites" 
            />
          </div>

          {/* Scrollable Navigation Sections */}
          <div className={`flex flex-col gap-4 pt-3 pb-6 px-3 flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
            isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}>
            {filteredSections.map((section) => (
              <CollapsibleSection
                key={section.id}
                section={section}
                isExpanded={expandedSections[section.id] ?? true}
                onToggle={() => toggleSection(section.id)}
                isActive={isActive}
              />
            ))}
          </div>
        </div>
      </nav>

      <WorkspaceCreationWizard
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onWorkspaceCreated={handleWorkspaceCreatedInternal}
      />
    </>
  );
}
