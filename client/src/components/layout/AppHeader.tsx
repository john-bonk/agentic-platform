/**
 * App Header Component
 * 
 * The top header bar with tabs and utility icons.
 * Supports dynamic tabs that can be opened/closed.
 * 
 * Usage:
 * <AppHeader />
 * 
 * TODO: Customize utility icons and tab behavior as needed
 */

import {
  BellIcon,
  BotIcon,
  ChevronDownIcon,
  ClockIcon,
  MailIcon,
  XIcon,
  PinIcon,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTabStore, type Tab } from "@/lib/tabStore";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AppHeaderProps {
  activeTab?: Tab | null;
  className?: string;
}

const utilityIcons = [
  { icon: "bot", alt: "AI Assistant" },
  { icon: "clock", alt: "Recent Activity" },
  { icon: "mail", alt: "Messages" },
  { icon: "bell", alt: "Notifications" },
];

export function AppHeader({ activeTab, className = "" }: AppHeaderProps) {
  const [, setLocation] = useLocation();
  const { openTabs, activeTabId, openTab, closeTab, setActiveTab } = useTabStore();
  
  useEffect(() => {
    if (activeTab) {
      openTab(activeTab);
    } else {
      setActiveTab(null);
    }
  }, [activeTab?.id]);

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

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    closeTab(tabId);
    
    const remainingTabs = openTabs.filter(t => t.id !== tabId);
    if (remainingTabs.length === 0) {
      setLocation('/');
    } else if (activeTabId === tabId) {
      const closedIndex = openTabs.findIndex(t => t.id === tabId);
      const newActiveTab = remainingTabs[Math.min(closedIndex, remainingTabs.length - 1)];
      if (newActiveTab) {
        setLocation(newActiveTab.path || '/');
      }
    }
  };

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
    if (tab.path) {
      setLocation(tab.path);
    }
  };

  return (
    <header 
      className={`flex h-12 items-end justify-between pl-0 pr-2 py-0 w-full bg-gray-900 flex-shrink-0 sticky top-0 z-40 ${className}`}
      data-testid="app-header"
    >
      <nav className="inline-flex items-end gap-1 flex-[0_0_auto] h-full">
        <Button
          variant="ghost"
          className="flex w-10 h-10 items-center justify-center gap-1.5 px-2 py-0 bg-gray-600 rounded-t-[4px] rounded-b-none hover:bg-gray-600"
          data-testid="header-tab-close"
        >
          <XIcon className="w-3 h-3 text-gray-400" />
        </Button>
        
        <Button
          variant="ghost"
          className="flex w-10 h-10 items-center justify-center gap-1.5 px-2 py-0 bg-gray-600 rounded-t-[4px] rounded-b-none hover:bg-gray-600"
          data-testid="header-tab-pin"
        >
          <PinIcon className="w-3 h-3 text-gray-400" />
        </Button>
        
        {openTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex h-10 items-center justify-start gap-2 px-3 py-0 rounded-t-[4px] rounded-b-none cursor-pointer ${
                isActive ? "bg-white" : "bg-gray-600"
              }`}
              data-testid={`header-tab-${tab.id}`}
            >
              <span className={`text-left font-semibold text-[14px] whitespace-nowrap ${
                isActive ? "text-gray-900" : "text-white"
              }`}>
                {tab.name}
              </span>
              <button
                onClick={(e) => handleCloseTab(e, tab.id)}
                className={`ml-1 p-0.5 rounded ${
                  isActive ? "text-gray-500 hover:text-gray-700 hover:bg-gray-200" : "text-gray-300 hover:text-white hover:bg-gray-500"
                }`}
                data-testid={`header-tab-close-${tab.id}`}
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </nav>

      <div className="inline-flex items-center justify-end gap-3 h-full flex-[0_0_auto]">
        <div className="inline-flex items-center gap-1 flex-[0_0_auto]">
          {utilityIcons.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded hover:bg-gray-800"
              data-testid={`header-utility-${item.icon}`}
            >
              {getUtilityIcon(item.icon)}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          className="inline-flex h-10 items-center justify-center gap-[3px] flex-[0_0_auto] rounded hover:bg-gray-800 px-0"
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
