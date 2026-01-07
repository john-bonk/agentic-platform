/**
 * Workspace Store
 * 
 * A Zustand store for managing workspace state across the application.
 * Supports workspace switching with persona-specific content.
 */

import { create } from 'zustand';

export interface Workspace {
  id: string;
  name: string;
  persona: string;
  personaTitle: string;
}

export const workspaces: Workspace[] = [
  { id: "enterprise-risk", name: "Enterprise Risk", persona: "CRO", personaTitle: "Chief Risk Officer" },
  { id: "enterprise-audit", name: "Enterprise Audit", persona: "CAE", personaTitle: "Chief Audit Executive" },
  { id: "it-security", name: "IT Security", persona: "CISO", personaTitle: "Chief Information Security Officer" },
];

interface WorkspaceStore {
  currentWorkspace: Workspace;
  setWorkspace: (workspace: Workspace) => void;
  refreshKey: number;
  refreshWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  currentWorkspace: workspaces[0], // Default to Enterprise Risk
  setWorkspace: (workspace: Workspace) => set({ currentWorkspace: workspace, refreshKey: Date.now() }),
  refreshKey: 0,
  refreshWorkspace: () => set((state) => ({ refreshKey: Date.now() })),
}));
