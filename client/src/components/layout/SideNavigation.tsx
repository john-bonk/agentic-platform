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
import { useWorkflowSessionStore } from "@/lib/workflowSessionStore";
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
  TrendingUp,
  ClipboardList,
  Scale,
  Lock,
  Users,
  Leaf,
  ShieldCheck,
  Database,
  Brain,
  LayoutDashboard,
  Layers,
  GitBranch,
  ExternalLink,
  Settings,
  BookOpen,
  Flame,
  Target,
  type LucideIcon,
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
import { type SideNavSection, type ModuleNavGroup, getActiveModuleIndex } from "@/config/navigation";
import { useSideNavStore } from "@/lib/sideNavStore";
import { useWorkspaceStore, type Workspace } from "@/lib/workspaceStore";
import { useBrowserTabStore } from "@/lib/browserTabStore";

// Determine if quick access items (Home/Recent/Favorites) should be shown
// Only show on Home module (index 0) and NOT for Admin workspace
function shouldShowQuickAccess(location: string, workspace: Workspace): boolean {
  const activeModuleIndex = getActiveModuleIndex(location);
  const isHomeModule = activeModuleIndex === 0;
  const isAdminWorkspace = workspace.persona === "Admin";
  return isHomeModule && !isAdminWorkspace;
}

function isDatabaseModule(location: string): boolean {
  return getActiveModuleIndex(location) === 1;
}

const navIconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "clipboard-list": ClipboardList,
  "brain": Brain,
  "users": Users,
  "shield-check": ShieldCheck,
  "settings": Settings,
  "book-open": BookOpen,
  "trending-up": TrendingUp,
  "flame": Flame,
  "target": Target,
};

import { WorkspaceCreationWizard } from "@/components/workspace/WorkspaceCreationWizard";

interface SideNavigationProps {
  sections: SideNavSection[];
  moduleGroups?: ModuleNavGroup[];
  title: string;
  className?: string;
  hideQuickAccess?: boolean;
  staticTitle?: boolean;
  onWorkspaceCreated?: (workspace: Workspace) => void;
}

interface CollapsibleSectionProps {
  section: SideNavSection;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: (path: string) => boolean;
  onOpenInNewTab?: (path: string, label: string) => void;
}

function CollapsibleSection({ section, isExpanded, onToggle, isActive, onOpenInNewTab }: CollapsibleSectionProps) {
  const [, setLocation] = useLocation();
  const { setCurrentSession } = useWorkflowSessionStore();
  const isCollapsible = section.collapsible !== false;

  return (
    <div className="flex flex-col">
      {section.title && (
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
      )}
      
      <div 
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-0.5 pt-1">
          {section.items.map((item) => {
            const hasHash = item.path.includes("#");
            const navButton = (
                  <Button
                    variant="ghost"
                    className={`h-[33px] w-full items-center gap-2 px-2 py-1.5 rounded flex justify-start ${
                      isActive(item.path)
                        ? "bg-teal-50 dark:bg-primary/10 hover:bg-teal-50 dark:hover:bg-primary/10" 
                        : "hover:bg-gray-100 dark:hover:bg-accent"
                    } ${item.openInNewTab ? "pr-1" : ""}`}
                    data-testid={`nav-item-${item.id}`}
                    onClick={hasHash ? (e) => {
                      e.preventDefault();
                      const hashPart = item.path.split("#")[1] || "";
                      if (hashPart.startsWith("project-")) {
                        const sessionId = hashPart.replace("project-", "");
                        setCurrentSession(sessionId);
                        setLocation("/");
                        return;
                      }
                      window.location.hash = hashPart ? `#${hashPart}` : "";
                      if (!hashPart) {
                        window.location.hash = "";
                        window.history.replaceState(null, "", window.location.pathname);
                      }
                    } : undefined}
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
            );
            return (
            <li key={item.id}>
              <div className="flex items-center group/navitem">
                {hasHash ? (
                  <div className="flex-1 min-w-0 cursor-pointer">{navButton}</div>
                ) : (
                  <Link href={item.path} className="flex-1 min-w-0">{navButton}</Link>
                )}
                {item.openInNewTab && onOpenInNewTab && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenInNewTab(item.path, item.label);
                    }}
                    className="flex-shrink-0 opacity-0 group-hover/navitem:opacity-100"
                    title={`Open ${item.label} in new tab`}
                    data-testid={`nav-open-tab-${item.id}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-muted-foreground" />
                  </Button>
                )}
              </div>
            </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Helper to get bucket icon by name
const getBucketIcon = (iconName: string, className: string = "w-6 h-6") => {
  const icons: Record<string, JSX.Element> = {
    "trending-up": <TrendingUp className={className} />,
    "clipboard-list": <ClipboardList className={className} />,
    "scale": <Scale className={className} />,
    "lock": <Lock className={className} />,
    "users": <Users className={className} />,
    "leaf": <Leaf className={className} />,
    "shield-check": <ShieldCheck className={className} />,
    "database": <Database className={className} />,
    "brain": <Brain className={className} />,
  };
  return icons[iconName] || <LayoutDashboard className={className} />;
};

interface ModuleGroupSectionProps {
  group: ModuleNavGroup;
  isModuleExpanded: boolean;
  expandedSections: Record<string, boolean>;
  onModuleToggle: () => void;
  onSectionToggle: (sectionId: string) => void;
  isActive: (path: string) => boolean;
}

function ModuleGroupSection({ 
  group, 
  isModuleExpanded, 
  expandedSections,
  onModuleToggle, 
  onSectionToggle,
  isActive 
}: ModuleGroupSectionProps) {
  return (
    <div className="border border-gray-200 dark:border-border rounded-lg overflow-visible" data-testid={`nav-module-group-${group.moduleId}`}>
      <Button
        variant="ghost"
        onClick={onModuleToggle}
        className="flex items-center gap-1.5 w-full px-2.5 justify-start hover-elevate rounded-lg rounded-b-none"
        data-testid={`nav-module-toggle-${group.moduleId}`}
      >
        <ChevronDown 
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 shrink-0 ${
            isModuleExpanded ? "" : "-rotate-90"
          }`}
        />
        <span className="text-[13px] font-medium truncate text-gray-700 dark:text-foreground">
          {group.moduleNavShortName || group.moduleName}
        </span>
      </Button>
      
      {isModuleExpanded && (
        <div className="border-t border-gray-200 dark:border-border bg-gray-50/50 dark:bg-accent/30 rounded-b-lg">
          <div className="py-1 space-y-1">
            {group.sections.map(section => {
              const isSectionExpanded = expandedSections[section.id] ?? section.defaultExpanded !== false;
              return (
                <div key={section.id} className="px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSectionToggle(section.id)}
                    className="flex items-center justify-between w-full px-2 justify-start hover-elevate"
                    data-testid={`nav-section-${section.id}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronDown 
                        className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                          isSectionExpanded ? "" : "-rotate-90"
                        }`}
                      />
                      <span className="text-[10px] font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                        {section.title}
                      </span>
                    </div>
                  </Button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      isSectionExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="flex flex-col gap-0.5 pt-0.5 ml-3">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <Link href={item.path}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`w-full items-center gap-2 px-2 rounded flex justify-start ${
                                isActive(item.path)
                                  ? "bg-teal-50 dark:bg-primary/10" 
                                  : ""
                              }`}
                              data-testid={`nav-item-${item.id}`}
                            >
                              <span
                                className={`flex-1 text-left text-xs whitespace-nowrap ${
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
                                  className="bg-[#266C92] text-white text-[10px]"
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
            })}
          </div>
        </div>
      )}
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

export function SideNavigation({ sections, moduleGroups, title, className = "", hideQuickAccess, staticTitle, onWorkspaceCreated }: SideNavigationProps) {
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
    if (moduleGroups) {
      moduleGroups.forEach(group => {
        group.sections.forEach(section => {
          initial[section.id] = section.defaultExpanded !== false;
        });
      });
    }
    return initial;
  });
  
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (moduleGroups) {
      moduleGroups.forEach(group => {
        initial[group.moduleId] = group.defaultExpanded !== false;
      });
    }
    return initial;
  });

  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    sections.forEach(section => {
      newExpanded[section.id] = expandedSections[section.id] ?? section.defaultExpanded !== false;
    });
    if (moduleGroups) {
      moduleGroups.forEach(group => {
        group.sections.forEach(section => {
          newExpanded[section.id] = expandedSections[section.id] ?? section.defaultExpanded !== false;
        });
      });
    }
    setExpandedSections(newExpanded);
  }, [sections, moduleGroups]);
  
  useEffect(() => {
    if (moduleGroups) {
      const newExpanded: Record<string, boolean> = {};
      moduleGroups.forEach(group => {
        newExpanded[group.moduleId] = expandedModules[group.moduleId] ?? group.defaultExpanded !== false;
      });
      setExpandedModules(newExpanded);
    }
  }, [moduleGroups]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const activeModuleIndex = getActiveModuleIndex(location);

  const [currentHash, setCurrentHash] = useState(window.location.hash);
  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const { currentSessionId } = useWorkflowSessionStore();

  const isActive = (path: string) => {
    if (path.includes("#")) {
      const [basePath, hashPart] = path.split("#");
      if (hashPart.startsWith("project-")) {
        const sessionId = hashPart.replace("project-", "");
        return currentSessionId === sessionId;
      }
      return location === basePath && currentHash === `#${hashPart}`;
    }
    if (activeModuleIndex === 0) {
      if (path === "/") {
        return location === "/" || location === "/my-dashboard";
      }
      if (path === "/admin/workspaces") {
        return location === "/admin" || location === "/admin/workspaces";
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

  const { openTab, setPreviousRoute } = useBrowserTabStore();

  const handleOpenInNewTab = (path: string, label: string) => {
    const STORAGE_KEY = "dashboard-settings";
    const SETTINGS_EVENT = "settings-updated";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      if (!settings.showBrowser) {
        const newSettings = { ...settings, showBrowser: true };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: newSettings }));
      }
    } catch (e) {
      // fallback
    }

    setPreviousRoute(location);
    openTab(path, label, { originPersona: currentWorkspace.persona || "CRO" });
    setLocation(path);
  };

  return (
    <>
      <nav 
        className={`flex flex-shrink-0 z-30 transition-all duration-300 ease-in-out ${className}`}
        style={{ height: 'calc(100vh - var(--browser-chrome-height, 0px))' }}
        data-testid="side-navigation"
      >
        {/* Collapsed Toolbar - Narrow vertical strip, full height */}
        <div 
          className={`flex flex-col bg-white dark:bg-card h-full transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-border ${
            isCollapsed ? "w-[36px] opacity-100" : "w-0 opacity-0 overflow-hidden border-r-0"
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

          {/* Quick access icons - Only show on Home module, not Admin, not new-tab */}
          {!hideQuickAccess && shouldShowQuickAccess(location, currentWorkspace) && (
            <div className="flex flex-col items-center gap-0.5 pt-2 px-1">
              <Link href={currentWorkspace.isCustom ? "/custom-workspace" : "/"}>
                <button
                  className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${isHomeActive ? "bg-teal-50 dark:bg-primary/10" : ""}`}
                  data-testid="nav-collapsed-home"
                  title="Home"
                >
                  <Home className={`w-3 h-3 ${isHomeActive ? "text-teal-600 dark:text-primary" : "text-gray-500 dark:text-muted-foreground"}`} />
                </button>
              </Link>
              <Link href="/recent">
                <button
                  className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${location === "/recent" ? "bg-teal-50 dark:bg-primary/10" : ""}`}
                  data-testid="nav-collapsed-recent"
                  title="Recent"
                >
                  <Clock className={`w-3 h-3 ${location === "/recent" ? "text-teal-600 dark:text-primary" : "text-gray-500 dark:text-muted-foreground"}`} />
                </button>
              </Link>
              <Link href="/favorites">
                <button
                  className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${location === "/favorites" ? "bg-teal-50 dark:bg-primary/10" : ""}`}
                  data-testid="nav-collapsed-favorites"
                  title="Favorites"
                >
                  <Star className={`w-3 h-3 ${location === "/favorites" ? "text-teal-600 dark:text-primary" : "text-gray-500 dark:text-muted-foreground"}`} />
                </button>
              </Link>
            </div>
          )}

          {isDatabaseModule(location) && (
            <div className="flex flex-col items-center gap-0.5 pt-2 px-1">
              <Link href="/inventory">
                <button
                  className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${location === "/inventory" ? "bg-teal-50 dark:bg-primary/10" : ""}`}
                  data-testid="nav-collapsed-inventory"
                  title="All Inventory"
                >
                  <Layers className={`w-3 h-3 ${location === "/inventory" ? "text-teal-600 dark:text-primary" : "text-gray-500 dark:text-muted-foreground"}`} />
                </button>
              </Link>
              <Link href="/coverage-mapping">
                <button
                  className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${location === "/coverage-mapping" ? "bg-teal-50 dark:bg-primary/10" : ""}`}
                  data-testid="nav-collapsed-coverage"
                  title="Coverage Mapping"
                >
                  <GitBranch className={`w-3 h-3 ${location === "/coverage-mapping" ? "text-teal-600 dark:text-primary" : "text-gray-500 dark:text-muted-foreground"}`} />
                </button>
              </Link>
            </div>
          )}

          {hideQuickAccess && (
            <div className="flex flex-col items-center gap-0.5 pt-2 px-1">
              {sections.flatMap(s => s.items).map(item => {
                if (!item.icon) return null;
                const IconComp = navIconMap[item.icon];
                if (!IconComp) return null;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${active ? "bg-teal-50 dark:bg-primary/10" : ""}`}
                    data-testid={`nav-collapsed-${item.id}`}
                    title={item.label}
                    onClick={() => {
                      const hasHash = item.path.includes("#");
                      if (hasHash) {
                        const hashPart = item.path.split("#")[1] || "";
                        window.location.hash = hashPart ? `#${hashPart}` : "";
                      } else {
                        window.location.hash = "";
                        window.history.replaceState(null, "", item.path);
                        setLocation(item.path);
                      }
                    }}
                  >
                    <IconComp className={`w-3 h-3 ${active ? "text-teal-600 dark:text-primary" : "text-gray-500 dark:text-muted-foreground"}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Content Area - Slides left when collapsed, slides right when expanding */}
        <div className={`flex flex-col h-full bg-white dark:bg-card border-r border-gray-200 dark:border-border transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0 overflow-hidden border-r-0" : "w-[236px]"
        }`}>
          {/* Panel Header - Dark background matching header, with Workspace Switcher */}
          <div 
            className="flex items-center justify-between h-12 px-3 flex-shrink-0 transition-all duration-300 ease-in-out"
            style={{ backgroundColor: '#101827' }}
          >
            {staticTitle ? (
              <span className="text-sm font-semibold text-white truncate max-w-[160px] px-2" data-testid="sidenav-static-title">{title}</span>
            ) : (
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
            )}

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

          {/* Quick Access Items - Home, Recent, Favorites - Only show on Home module and not Admin */}
          {!hideQuickAccess && shouldShowQuickAccess(location, currentWorkspace) && (
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
                path="/recent"
                isActive={location === "/recent"}
              />
              <QuickAccessItem 
                icon={Star} 
                label="Favorites" 
                path="/favorites"
                isActive={location === "/favorites"}
              />
            </div>
          )}

          {/* Scrollable Navigation Sections */}
          <div className={`flex flex-col gap-3 pt-3 pb-6 px-3 flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
            isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}>
            {moduleGroups && moduleGroups.length > 0 ? (
              moduleGroups.map((group) => (
                <ModuleGroupSection
                  key={group.moduleId}
                  group={group}
                  isModuleExpanded={expandedModules[group.moduleId] ?? true}
                  expandedSections={expandedSections}
                  onModuleToggle={() => toggleModule(group.moduleId)}
                  onSectionToggle={toggleSection}
                  isActive={isActive}
                />
              ))
            ) : (
              filteredSections.map((section) => (
                <CollapsibleSection
                  key={section.id}
                  section={section}
                  isExpanded={expandedSections[section.id] ?? true}
                  onToggle={() => toggleSection(section.id)}
                  isActive={isActive}
                  onOpenInNewTab={handleOpenInNewTab}
                />
              ))
            )}
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
