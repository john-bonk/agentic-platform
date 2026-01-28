/**
 * App Header Component
 * 
 * The top header bar with workspace switcher, global search, and utility icons.
 * Includes "Create new" workspace option.
 * 
 * Usage:
 * <AppHeader />
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  BellIcon,
  BotIcon,
  ChevronDownIcon,
  // ClockIcon, // Temporarily hidden - will re-introduce later
  // MailIcon,  // Temporarily hidden - will re-introduce later
  User,
  Search,
  Command,
  FileText,
  AlertTriangle,
  ClipboardList,
  Check,
  Plus,
} from "lucide-react";
import { SettingsPanel } from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { type Tab } from "@/lib/tabStore";
import { useWorkspaceStore, type Workspace } from "@/lib/workspaceStore";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";
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
  const { currentWorkspace, setWorkspace, getAllWorkspaces, refreshKey } = useWorkspaceStore();
  const { toggleOpen: toggleAssistant, isOpen: isAssistantOpen } = useHomeAssistantStore();
  const [, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allWorkspaces = useMemo(() => getAllWorkspaces(), [refreshKey, getAllWorkspaces]);

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

  const handleWorkspaceChange = (workspace: Workspace) => {
    setWorkspace(workspace);
    // Navigate to /admin for Admin workspace, / for all others
    setLocation(workspace.persona === "Admin" ? "/admin" : "/");
  };

  const handleWorkspaceCreated = (workspace: Workspace) => {
    setLocation("/");
  };

  return (
    <>
      <header 
        className={`relative flex h-12 items-center justify-between px-3 w-full bg-gray-900 flex-shrink-0 sticky top-0 z-40 ${className}`}
        data-testid="app-header"
      >
        <div className="flex items-center z-10 ml-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-8 px-2 text-white"
                data-testid="workspace-switcher"
              >
                <span className="text-sm font-medium" data-testid="current-workspace-name">{currentWorkspace.name}</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56" data-testid="workspace-dropdown">
              <DropdownMenuLabel className="text-xs text-gray-500 font-normal">Your workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allWorkspaces.map((workspace) => {
                const isActive = workspace.id === currentWorkspace.id;
                return (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => handleWorkspaceChange(workspace)}
                    className="flex items-center gap-2 cursor-pointer"
                    data-testid={`workspace-option-${workspace.id}`}
                  >
                    <span>{workspace.name}</span>
                    {isActive && (
                      <Check className="ml-auto w-4 h-4 text-[#266C92]" />
                    )}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setCreateDialogOpen(true)}
                className="flex items-center gap-2 cursor-pointer text-[#266C92]"
                data-testid="workspace-create-new"
              >
                <Plus className="w-4 h-4" />
                <span>Create new</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                        <span className="text-sm text-gray-700 dark:text-foreground">{action.label}</span>
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
                    <div className="text-sm text-gray-700 dark:text-foreground">Ask AuditBoard Assistant...</div>
                    <div className="text-xs text-gray-500 dark:text-muted-foreground">Get Started</div>
                  </div>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div 
          className="flex items-center gap-1 z-10 transition-all duration-300"
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
        </div>
      </header>

      <WorkspaceCreationWizard
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </>
  );
}
