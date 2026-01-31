/**
 * Workspace Store
 * 
 * A Zustand store for managing workspace state across the application.
 * Supports workspace switching with persona-specific content.
 * Custom workspaces are session-only (cleared on page refresh).
 */

import { create } from 'zustand';

export interface WorkspaceModuleConfig {
  selectedBuckets: string[];
  enabledModules: Record<string, string[]>;
}

export interface WorkspaceHomeViewConfig {
  archetypeId: string;
}

export interface Workspace {
  id: string;
  name: string;
  persona: string;
  personaTitle?: string;
  type?: "default" | "custom";
  icon?: string;
  selectedCapabilities?: string[];
  moduleConfig?: WorkspaceModuleConfig;
  homeViewConfig?: WorkspaceHomeViewConfig;
  isCustom?: boolean;
}

export interface SolutionCapability {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "risk" | "audit" | "security" | "compliance";
}

export const solutionCapabilities: SolutionCapability[] = [
  { id: "controls-management", name: "Controls Management", description: "Simplified SOX management", icon: "shield-check", category: "compliance" },
  { id: "enterprise-risk", name: "Enterprise Risk Management", description: "Centralized risk management", icon: "trending-up", category: "risk" },
  { id: "audit-management", name: "Audit Management", description: "Streamlined internal audit", icon: "clipboard-list", category: "audit" },
  { id: "cyber-compliance", name: "Cyber and IT Compliance", description: "Unified compliance", icon: "lock", category: "security" },
  { id: "information-technology", name: "Information Technology", description: "Basic IT management", icon: "server", category: "security" },
  { id: "regulatory-compliance", name: "Regulatory Compliance", description: "ESG compliance", icon: "scale", category: "compliance" },
  { id: "third-party", name: "Third Party", description: "Vendor management", icon: "users", category: "risk" },
  { id: "ai-governance", name: "AI Governance", description: "AI IT management", icon: "cpu", category: "security" },
  { id: "environmental-compliance", name: "Environmental Compliance", description: "Environmental compliance", icon: "leaf", category: "compliance" },
];

export const defaultWorkspaces: Workspace[] = [
  { id: "admin", name: "Admin", persona: "Admin", personaTitle: "Administrator" },
  { id: "enterprise-risk", name: "Enterprise Risk", persona: "CRO", personaTitle: "Chief Risk Officer" },
  { id: "enterprise-audit", name: "Enterprise Audit", persona: "CAE", personaTitle: "Chief Audit Executive" },
  { id: "it-security", name: "IT Security", persona: "CISO", personaTitle: "Chief Information Security Officer" },
];

export const workspaces: Workspace[] = defaultWorkspaces;

export type UserPersona = "Executive" | "Manager" | "Auditor" | "Analyst";

interface WorkspaceStore {
  currentWorkspace: Workspace;
  customWorkspaces: Workspace[];
  userPersona: UserPersona;
  setWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
  setUserPersona: (persona: UserPersona) => void;
  getAllWorkspaces: () => Workspace[];
  refreshKey: number;
  refreshWorkspace: () => void;
  activeWorkspace: string | null;
  workspaces: Workspace[];
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  // Default to Enterprise Risk (index 1) instead of Admin for the prototype landing view
  currentWorkspace: defaultWorkspaces[1],
  customWorkspaces: [],
  userPersona: "Executive" as UserPersona,
  setWorkspace: (workspace: Workspace) => set({ currentWorkspace: workspace, refreshKey: Date.now() }),
  addWorkspace: (workspace: Workspace) => {
    const current = get().customWorkspaces;
    const updated = [...current, workspace];
    set({ customWorkspaces: updated, currentWorkspace: workspace, refreshKey: Date.now() });
  },
  setUserPersona: (persona: UserPersona) => set({ userPersona: persona, refreshKey: Date.now() }),
  getAllWorkspaces: () => {
    const state = get();
    return [...defaultWorkspaces, ...state.customWorkspaces];
  },
  refreshKey: 0,
  refreshWorkspace: () => set({ refreshKey: Date.now() }),
  get activeWorkspace() {
    return get().currentWorkspace?.id || null;
  },
  get workspaces() {
    return get().getAllWorkspaces();
  },
}));
