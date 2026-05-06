import { create } from "zustand";

export interface BrowserTabData {
  id: string;
  label: string;
  faviconUrl: string;
  route: string;
  isNewTab?: boolean;
  metadata?: Record<string, string>;
}

interface BrowserTabState {
  tabs: BrowserTabData[];
  activeTabId: string;
  previousRoute: string;
  openTab: (route: string, label: string, metadata?: Record<string, string>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setPreviousRoute: (route: string) => void;
  getActiveRoute: () => string | null;
  getActiveTab: () => BrowserTabData | null;
  resetTabs: () => void;
}

// Vite injects BASE_URL = "/" in dev and "/agentic-platform/" in the GH Pages
// production build, so this resolves correctly under both deployments.
const FAVICON_URL = `${import.meta.env.BASE_URL}figmaAssets/auditboard-logo.png`;
const MAIN_TAB_ID = "main";

function makeTabId(route: string): string {
  return `tab-${route.replace(/\//g, "-")}`;
}

export const useBrowserTabStore = create<BrowserTabState>((set, get) => ({
  tabs: [],
  activeTabId: MAIN_TAB_ID,
  previousRoute: "/",

  openTab: (route: string, label: string, metadata?: Record<string, string>) => {
    const state = get();
    const tabId = makeTabId(route);
    const existingTab = state.tabs.find(t => t.id === tabId);

    if (existingTab) {
      set({ activeTabId: tabId });
      return;
    }

    const newTab: BrowserTabData = {
      id: tabId,
      label,
      faviconUrl: FAVICON_URL,
      route,
      isNewTab: true,
      metadata,
    };

    set({
      tabs: [...state.tabs, newTab],
      activeTabId: tabId,
    });
  },

  setPreviousRoute: (route: string) => {
    set({ previousRoute: route });
  },

  closeTab: (id: string) => {
    const state = get();
    if (id === MAIN_TAB_ID) return;

    const newTabs = state.tabs.filter(t => t.id !== id);

    if (state.activeTabId === id) {
      set({
        tabs: newTabs,
        activeTabId: MAIN_TAB_ID,
      });
    } else {
      set({ tabs: newTabs });
    }
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id });
  },

  getActiveRoute: () => {
    const state = get();
    if (state.activeTabId === MAIN_TAB_ID) return null;
    const tab = state.tabs.find(t => t.id === state.activeTabId);
    return tab?.route || null;
  },

  getActiveTab: () => {
    const state = get();
    if (state.activeTabId === MAIN_TAB_ID) return null;
    return state.tabs.find(t => t.id === state.activeTabId) || null;
  },

  resetTabs: () => {
    set({ tabs: [], activeTabId: MAIN_TAB_ID });
  },
}));
