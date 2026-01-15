/**
 * Workspace Store
 * 
 * A Zustand store for managing workspace state across the application.
 * Supports workspace switching with persona-specific content.
 * Now supports dynamic workspace creation stored in session.
 */

import { create } from 'zustand';

export interface Workspace {
  id: string;
  name: string;
  persona: string;
  personaTitle: string;
  workspaceType?: WorkspaceType;
  isCustom?: boolean;
}

export interface WorkspaceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultPersona: string;
}

export const workspaceTypes: WorkspaceType[] = [
  { id: "controls-management", name: "Controls Management", description: "Simplified SOX management", icon: "shield-check", defaultPersona: "CRO" },
  { id: "enterprise-risk", name: "Enterprise Risk Management", description: "Centralized risk management", icon: "trending-up", defaultPersona: "CRO" },
  { id: "audit-management", name: "Audit Management", description: "Streamlined internal audit", icon: "clipboard-list", defaultPersona: "CAE" },
  { id: "cyber-compliance", name: "Cyber and IT Compliance", description: "Unified compliance", icon: "lock", defaultPersona: "CISO" },
  { id: "information-technology", name: "Information Technology", description: "Basic IT management", icon: "server", defaultPersona: "CISO" },
  { id: "regulatory-compliance", name: "Regulatory Compliance", description: "ESG compliance", icon: "scale", defaultPersona: "CRO" },
  { id: "third-party", name: "Third Party", description: "Vendor management", icon: "users", defaultPersona: "CRO" },
  { id: "ai-governance", name: "AI Governance", description: "AI IT management", icon: "cpu", defaultPersona: "CISO" },
  { id: "environmental-compliance", name: "Environmental Compliance", description: "Environmental compliance", icon: "leaf", defaultPersona: "CRO" },
];

export const defaultWorkspaces: Workspace[] = [
  { id: "enterprise-risk", name: "Enterprise Risk", persona: "CRO", personaTitle: "Chief Risk Officer" },
  { id: "enterprise-audit", name: "Enterprise Audit", persona: "CAE", personaTitle: "Chief Audit Executive" },
  { id: "it-security", name: "IT Security", persona: "CISO", personaTitle: "Chief Information Security Officer" },
];

const isClient = typeof window !== "undefined" && typeof sessionStorage !== "undefined";

const getSessionWorkspaces = (): Workspace[] => {
  if (!isClient) return [];
  try {
    const stored = sessionStorage.getItem('custom-workspaces');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSessionWorkspaces = (workspaces: Workspace[]) => {
  if (!isClient) return;
  try {
    sessionStorage.setItem('custom-workspaces', JSON.stringify(workspaces));
  } catch {
    console.warn('Failed to save workspaces to session storage');
  }
};

export const workspaces: Workspace[] = defaultWorkspaces;

interface WorkspaceStore {
  currentWorkspace: Workspace;
  customWorkspaces: Workspace[];
  setWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
  getAllWorkspaces: () => Workspace[];
  refreshKey: number;
  refreshWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  currentWorkspace: defaultWorkspaces[0],
  customWorkspaces: [],
  setWorkspace: (workspace: Workspace) => set({ currentWorkspace: workspace, refreshKey: Date.now() }),
  addWorkspace: (workspace: Workspace) => {
    const current = get().customWorkspaces;
    const updated = [...current, workspace];
    saveSessionWorkspaces(updated);
    set({ customWorkspaces: updated, currentWorkspace: workspace, refreshKey: Date.now() });
  },
  getAllWorkspaces: () => {
    const state = get();
    if (state.customWorkspaces.length === 0 && isClient) {
      const stored = getSessionWorkspaces();
      if (stored.length > 0) {
        set({ customWorkspaces: stored });
        return [...defaultWorkspaces, ...stored];
      }
    }
    return [...defaultWorkspaces, ...state.customWorkspaces];
  },
  refreshKey: 0,
  refreshWorkspace: () => set({ refreshKey: Date.now() }),
}));
