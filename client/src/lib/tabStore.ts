import { create } from 'zustand';

export interface ProcessTab {
  id: string;
  name: string;
}

interface TabStore {
  openTabs: ProcessTab[];
  activeTabId: string | null;
  openTab: (tab: ProcessTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string | null) => void;
}

export const useTabStore = create<TabStore>((set, get) => ({
  openTabs: [],
  activeTabId: null,
  
  openTab: (tab: ProcessTab) => {
    const { openTabs } = get();
    const exists = openTabs.find(t => t.id === tab.id);
    if (!exists) {
      set({ 
        openTabs: [...openTabs, tab],
        activeTabId: tab.id 
      });
    } else {
      set({ activeTabId: tab.id });
    }
  },
  
  closeTab: (id: string) => {
    const { openTabs, activeTabId } = get();
    const newTabs = openTabs.filter(t => t.id !== id);
    let newActiveId = activeTabId;
    
    if (activeTabId === id) {
      const closedIndex = openTabs.findIndex(t => t.id === id);
      if (newTabs.length > 0) {
        newActiveId = newTabs[Math.min(closedIndex, newTabs.length - 1)]?.id || null;
      } else {
        newActiveId = null;
      }
    }
    
    set({ 
      openTabs: newTabs,
      activeTabId: newActiveId
    });
  },
  
  setActiveTab: (id: string | null) => {
    set({ activeTabId: id });
  },
}));
