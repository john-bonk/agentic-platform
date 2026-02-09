import { useEffect, useCallback } from "react";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import { useBrowserTabStore } from "@/lib/browserTabStore";
import { X } from "lucide-react";
import { useLocation } from "wouter";

export const BROWSER_CHROME_HEIGHT = 70;

export interface BrowserTab {
  id: string;
  label: string;
  faviconUrl?: string;
  isActive: boolean;
}

interface BrowserChromeProps {
  children: React.ReactNode;
  visible: boolean;
  tabs?: BrowserTab[];
}

export function BrowserChrome({ children, visible, tabs: externalTabs }: BrowserChromeProps) {
  const { currentWorkspace } = useWorkspaceStore();
  const { tabs: storeTabs, activeTabId, setActiveTab, closeTab } = useBrowserTabStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (visible) {
      document.documentElement.style.setProperty("--browser-chrome-height", `${BROWSER_CHROME_HEIGHT}px`);
    } else {
      document.documentElement.style.setProperty("--browser-chrome-height", "0px");
    }
  }, [visible]);

  const mainTab: BrowserTab = {
    id: "main",
    label: currentWorkspace.name,
    faviconUrl: "/figmaAssets/auditboard-logo.png",
    isActive: activeTabId === "main",
  };

  const dynamicTabs: BrowserTab[] = storeTabs.map(t => ({
    id: t.id,
    label: t.label,
    faviconUrl: t.faviconUrl,
    isActive: activeTabId === t.id,
  }));

  const allTabs = externalTabs || [mainTab, ...dynamicTabs];

  const handleTabClick = useCallback((tabId: string) => {
    if (externalTabs) return;
    setActiveTab(tabId);
    if (tabId === "main") {
      const store = useBrowserTabStore.getState();
      setLocation(store.previousRoute || "/");
    } else {
      const tab = storeTabs.find(t => t.id === tabId);
      if (tab) {
        setLocation(tab.route);
      }
    }
  }, [externalTabs, setActiveTab, setLocation, storeTabs]);

  const handleTabClose = useCallback((e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (externalTabs) return;
    if (tabId === "main") return;

    const wasActive = activeTabId === tabId;
    closeTab(tabId);

    if (wasActive) {
      const store = useBrowserTabStore.getState();
      setLocation(store.previousRoute || "/");
    }
  }, [externalTabs, activeTabId, closeTab, setLocation]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" data-testid="browser-chrome-wrapper">
      {visible && (
        <div
          className="flex-shrink-0 select-none flex flex-col"
          style={{ backgroundColor: '#202124', height: `${BROWSER_CHROME_HEIGHT}px` }}
          data-testid="browser-chrome-bar"
        >
          <div className="flex items-end h-[38px] pl-[76px] pr-2 pt-[8px] gap-0 relative">
            <div className="flex items-center gap-[6px] absolute left-3 top-[13px]">
              <div className="w-[12px] h-[12px] rounded-full" style={{ backgroundColor: '#ed6a5e' }} />
              <div className="w-[12px] h-[12px] rounded-full" style={{ backgroundColor: '#f5bf4f' }} />
              <div className="w-[12px] h-[12px] rounded-full" style={{ backgroundColor: '#62c554' }} />
            </div>

            {allTabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 h-[30px] px-3 text-xs max-w-[220px] min-w-[120px] rounded-t-lg cursor-pointer transition-colors ${
                  tab.isActive
                    ? "bg-[#35363a]"
                    : "bg-[#292a2d] hover:bg-[#303134]"
                }`}
                data-testid={`browser-tab-${tab.id}`}
              >
                {tab.faviconUrl && (
                  <img
                    src={tab.faviconUrl}
                    alt=""
                    className="w-[14px] h-[14px] flex-shrink-0 object-contain"
                  />
                )}
                <span className="truncate flex-1 text-[12px] text-[#e8eaed]">
                  {tab.label}
                </span>
                {tab.id !== "main" ? (
                  <button
                    onClick={(e) => handleTabClose(e, tab.id)}
                    className="flex-shrink-0 rounded-sm hover:bg-[#5f6368] p-0.5 transition-colors"
                    data-testid={`browser-tab-close-${tab.id}`}
                  >
                    <X className="w-3 h-3 text-[#9aa0a6]" />
                  </button>
                ) : (
                  <X className="w-3 h-3 text-[#9aa0a6] flex-shrink-0 opacity-0" />
                )}
              </div>
            ))}
          </div>

          <div
            className="flex items-center h-[32px] px-2 gap-2"
            style={{ backgroundColor: '#35363a' }}
            data-testid="browser-url-bar-row"
          >
            <div className="flex items-center gap-1 flex-shrink-0 px-1">
              <svg className="w-[14px] h-[14px] text-[#9aa0a6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <svg className="w-[14px] h-[14px] text-[#5f6368]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
              <svg className="w-[14px] h-[14px] text-[#9aa0a6] ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </div>

            <div
              className="flex-1 flex items-center h-[24px] rounded-full px-3 text-[12px] text-[#9aa0a6]"
              style={{ backgroundColor: '#202124' }}
              data-testid="browser-url-bar"
            >
              <svg className="w-[12px] h-[12px] mr-1.5 text-[#9aa0a6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span className="truncate">app.auditboard.com</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
