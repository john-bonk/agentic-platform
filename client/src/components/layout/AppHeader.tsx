/**
 * App Header Component
 * 
 * The top header bar with workspace switcher, global search, and utility icons.
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
  ClockIcon,
  MailIcon,
  User,
  Search,
  Command,
  FileText,
  AlertTriangle,
  ClipboardList,
  Lock,
  Check,
} from "lucide-react";
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
import { useWorkspaceStore, workspaces, type Workspace } from "@/lib/workspaceStore";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";

interface AppHeaderProps {
  activeTab?: Tab | null;
  className?: string;
}

const getWorkspaceIcon = (workspaceId: string) => {
  switch (workspaceId) {
    case "enterprise-risk":
      return AlertTriangle;
    case "enterprise-audit":
      return ClipboardList;
    case "it-security":
      return Lock;
    default:
      return ClipboardList;
  }
};

const quickActions = [
  { id: "risk-event", label: "Create new Risk Event", icon: AlertTriangle, category: "Create" },
  { id: "risk-assessment", label: "Start new Risk Assessment", icon: FileText, category: "Create" },
  { id: "audit", label: "Create new Audit", icon: ClipboardList, category: "Create" },
  { id: "ask-assistant", label: "Ask AuditBoard Assistant...", icon: BotIcon, category: "Get Started" },
];

const utilityIcons = [
  { icon: "bot", alt: "AI Assistant" },
  { icon: "clock", alt: "Recent Activity" },
  { icon: "mail", alt: "Messages" },
  { icon: "bell", alt: "Notifications" },
];

export function AppHeader({ className = "" }: AppHeaderProps) {
  const { currentWorkspace, setWorkspace } = useWorkspaceStore();
  const { toggleOpen: toggleAssistant } = useHomeAssistantStore();
  const [, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      case "clock":
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
      case "mail":
        return <MailIcon className="w-4 h-4 text-gray-400" />;
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
    // Always navigate to Home when switching workspaces
    setLocation("/");
  };

  const CurrentWorkspaceIcon = getWorkspaceIcon(currentWorkspace.id);

  return (
    <header 
      className={`flex h-12 items-center justify-between px-3 w-full bg-gray-900 flex-shrink-0 sticky top-0 z-40 gap-4 ${className}`}
      data-testid="app-header"
    >
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-8 px-3 text-white hover:bg-gray-800 rounded-md"
              data-testid="workspace-switcher"
            >
              <CurrentWorkspaceIcon className="w-4 h-4 text-gray-300" />
              <span className="text-sm font-medium" data-testid="current-workspace-name">{currentWorkspace.name}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56" data-testid="workspace-dropdown">
            <DropdownMenuLabel className="text-xs text-gray-500 font-normal">Your workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((workspace) => {
              const WorkspaceIcon = getWorkspaceIcon(workspace.id);
              const isActive = workspace.id === currentWorkspace.id;
              return (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleWorkspaceChange(workspace)}
                  className="flex items-center gap-2 cursor-pointer"
                  data-testid={`workspace-option-${workspace.id}`}
                >
                  <WorkspaceIcon className="w-4 h-4 text-gray-500" />
                  <span>{workspace.name}</span>
                  {isActive && (
                    <Check className="ml-auto w-4 h-4 text-[#266C92]" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="text-gray-600 select-none">/</div>
      </div>

      <div className="flex-1 flex justify-center max-w-xl">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-8 px-3 bg-gray-800 hover:bg-gray-700 rounded-md w-full max-w-md justify-between"
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
            className="w-[420px] p-0" 
            align="center"
            data-testid="global-search-popover"
          >
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by topic or ask a question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto text-sm placeholder:text-gray-400"
                  data-testid="global-search-input"
                />
              </div>
            </div>
            
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1.5">What would you like to do?</div>
              <div className="space-y-0.5">
                {quickActions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100 text-left transition-colors"
                      data-testid={`quick-action-${action.id}`}
                    >
                      <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                        <ActionIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-gray-700">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1.5">ENVIRONMENT</div>
              <button
                onClick={() => handleQuickAction("ask-assistant")}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100 text-left transition-colors"
                data-testid="quick-action-environment-assistant"
              >
                <div className="w-8 h-8 rounded-md bg-[#266C92]/10 flex items-center justify-center">
                  <BotIcon className="w-4 h-4 text-[#266C92]" />
                </div>
                <div>
                  <div className="text-sm text-gray-700">Ask AuditBoard Assistant...</div>
                  <div className="text-xs text-gray-500">Get Started</div>
                </div>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-1">
        {utilityIcons.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded hover:bg-gray-800"
            onClick={item.icon === "bot" ? toggleAssistant : undefined}
            data-testid={`header-utility-${item.icon}`}
          >
            {getUtilityIcon(item.icon)}
          </Button>
        ))}

        <Button
          variant="ghost"
          className="flex h-9 items-center gap-1 rounded hover:bg-gray-800 px-2 ml-1"
          data-testid="header-avatar-menu"
        >
          <div className="relative w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-300" />
          </div>
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
    </header>
  );
}
