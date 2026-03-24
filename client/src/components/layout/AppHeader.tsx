/**
 * App Header Component
 * 
 * The top header bar with centered global search and utility icons.
 * Workspace switcher has been moved to SideNavigation panel header.
 * 
 * Usage:
 * <AppHeader />
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  BellIcon,
  BotIcon,
  ChevronDownIcon,
  User,
  Search,
  Command,
  FileText,
  AlertTriangle,
  ClipboardList,
  Check,
  Plus,
} from "lucide-react";
import { SettingsPanel, useSettings } from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { type Tab } from "@/lib/tabStore";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";
import { useSideNavStore } from "@/lib/sideNavStore";
import { useWorkspaceStore, type Workspace, type UserPersona } from "@/lib/workspaceStore";
import { WorkspaceCreationWizard } from "@/components/workspace/WorkspaceCreationWizard";

const ASSISTANT_PANEL_WIDTH = 420;

interface AppHeaderProps {
  activeTab?: Tab | null;
  className?: string;
}


const quickActions = [
  { id: "risk-event", label: "Create new Risk Event", icon: AlertTriangle, category: "Create" },
  { id: "risk-assessment", label: "Start new Risk Assessment", icon: FileText, category: "Create" },
  { id: "audit", label: "Create new Audit", icon: ClipboardList, category: "Create" },
  { id: "ask-assistant", label: "Ask AuditBoard Assistant...", icon: BotIcon, category: "Get Started" },
];

const utilityIcons = [
  { icon: "bot", alt: "AI Assistant" },
  // { icon: "clock", alt: "Recent Activity" },  // Temporarily hidden - will re-introduce later
  // { icon: "mail", alt: "Messages" },          // Temporarily hidden - will re-introduce later
  { icon: "bell", alt: "Notifications" },
];

export function AppHeader({ className = "" }: AppHeaderProps) {
  const { toggleOpen: toggleAssistant, isOpen: isAssistantOpen } = useHomeAssistantStore();
  const { isCollapsed } = useSideNavStore();
  const { currentWorkspace, workspaces: allWorkspaces, setWorkspace, userPersona, setUserPersona } = useWorkspaceStore();
  const [, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerSettings = useSettings();
  const headerAssistantName = headerSettings.agentHubEnabled ? "Optro Assistant" : "AuditBoard Assistant";

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

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getUtilityIcon = (iconName: string) => {
    switch (iconName) {
      case "bot":
        return <BotIcon className="w-4 h-4 text-gray-400" />;
      // case "clock":  // Temporarily hidden - will re-introduce later
      //   return <ClockIcon className="w-4 h-4 text-gray-400" />;
      // case "mail":   // Temporarily hidden - will re-introduce later
      //   return <MailIcon className="w-4 h-4 text-gray-400" />;
      case "bell":
        return <BellIcon className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const handleQuickAction = (actionId: string) => {
    console.log("Quick action:", actionId);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <header 
        className={`relative flex h-12 items-center justify-center px-3 w-full bg-gray-900 flex-shrink-0 sticky top-0 z-40 ${className}`}
        data-testid="app-header"
      >
        {/* Workspace Switcher / Optro branding - Shows when nav panel is collapsed with fade-in animation */}
        <div 
          className={`absolute left-3 flex items-center gap-2 transition-all duration-300 ease-in-out ${
            isCollapsed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
          }`}
        >
          {headerSettings.agentHubEnabled ? (
            <span className="text-sm font-semibold text-white px-2" data-testid="header-optro-brand">Optro</span>
          ) : (
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 h-8 px-2 text-white hover:bg-gray-700"
                  data-testid="header-workspace-switcher"
                >
                  <span className="text-sm font-semibold truncate max-w-[160px]">{currentWorkspace.name}</span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56" data-testid="header-workspace-dropdown">
                <DropdownMenuLabel className="text-xs text-gray-500 font-normal">Your workspaces</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allWorkspaces.map((workspace) => {
                  const isActiveWs = workspace.id === currentWorkspace.id;
                  return (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => handleWorkspaceChange(workspace)}
                      className="flex items-center gap-2 cursor-pointer"
                      data-testid={`header-workspace-option-${workspace.id}`}
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
                  data-testid="header-workspace-create-new"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create new</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div 
          className="absolute w-full max-w-md px-4 transition-all duration-300"
          style={{ 
            left: isAssistantOpen ? `calc(50% - ${ASSISTANT_PANEL_WIDTH / 2}px)` : '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-8 px-3 bg-gray-800 rounded-md w-full justify-between"
                data-testid="global-search-trigger"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Search by topic or ask a question</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Command className="w-3 h-3" />
                  <span className="text-xs">+ K</span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[420px] p-0 bg-white dark:bg-card border border-gray-200 dark:border-border" 
              align="center"
              data-testid="global-search-popover"
            >
              <div className="p-3 border-b border-gray-200 dark:border-border">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-muted rounded-md px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by topic or ask a question..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto text-sm placeholder:text-gray-400 dark:placeholder:text-muted-foreground text-gray-900 dark:text-foreground"
                    data-testid="global-search-input"
                  />
                </div>
              </div>
              
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-muted-foreground px-2 py-1.5">What would you like to do?</div>
                <div className="space-y-0.5">
                  {quickActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors hover-elevate"
                        data-testid={`quick-action-${action.id}`}
                      >
                        <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-muted flex items-center justify-center">
                          <ActionIcon className="w-4 h-4 text-gray-600 dark:text-muted-foreground" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-foreground">
                          {action.id === "ask-assistant" ? `Ask ${headerAssistantName}...` : action.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-border p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-muted-foreground px-2 py-1.5">ENVIRONMENT</div>
                <button
                  onClick={() => handleQuickAction("ask-assistant")}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors hover-elevate"
                  data-testid="quick-action-environment-assistant"
                >
                  <div className="w-8 h-8 rounded-md bg-[#266C92]/10 flex items-center justify-center">
                    <BotIcon className="w-4 h-4 text-[#266C92]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 dark:text-foreground">Ask {headerAssistantName}...</div>
                    <div className="text-xs text-gray-500 dark:text-muted-foreground">Get Started</div>
                  </div>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div 
          className="absolute right-3 flex items-center gap-1 z-10 transition-all duration-300"
          style={{ marginRight: isAssistantOpen ? `${ASSISTANT_PANEL_WIDTH}px` : 0 }}
        >
          {utilityIcons.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded"
              onClick={item.icon === "bot" ? toggleAssistant : undefined}
              data-testid={`header-utility-${item.icon}`}
            >
              {getUtilityIcon(item.icon)}
            </Button>
          ))}

          <SettingsPanel />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-9 items-center gap-1 rounded px-2 ml-1"
                data-testid="header-avatar-menu"
              >
                <div className="relative w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>View As</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["Executive", "Manager", "Auditor", "Analyst"] as UserPersona[]).map((persona) => (
                <DropdownMenuItem
                  key={persona}
                  onClick={() => setUserPersona(persona)}
                  className="flex items-center justify-between"
                  data-testid={`persona-option-${persona.toLowerCase()}`}
                >
                  <span>{persona}</span>
                  {userPersona === persona && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <WorkspaceCreationWizard
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
