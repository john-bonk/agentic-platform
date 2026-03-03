import { create } from "zustand";

export interface ActiveProject {
  sessionId: string;
  label: string;
  icon: string;
}

interface WorkflowSessionState {
  activeProjects: ActiveProject[];
  currentSessionId: string | null;
  sessionConfigs: Record<string, unknown>;
  addProject: (project: ActiveProject, config: unknown) => void;
  removeProject: (sessionId: string) => void;
  setCurrentSession: (sessionId: string | null) => void;
  getSessionConfig: (sessionId: string) => unknown | null;
}

export const useWorkflowSessionStore = create<WorkflowSessionState>((set, get) => ({
  activeProjects: [],
  currentSessionId: null,
  sessionConfigs: {},
  addProject: (project, config) =>
    set((state) => {
      if (state.activeProjects.some((p) => p.sessionId === project.sessionId)) {
        return { currentSessionId: project.sessionId };
      }
      return {
        activeProjects: [...state.activeProjects, project],
        currentSessionId: project.sessionId,
        sessionConfigs: { ...state.sessionConfigs, [project.sessionId]: config },
      };
    }),
  removeProject: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...remainingConfigs } = state.sessionConfigs;
      return {
        activeProjects: state.activeProjects.filter((p) => p.sessionId !== sessionId),
        currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        sessionConfigs: remainingConfigs,
      };
    }),
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  getSessionConfig: (sessionId) => get().sessionConfigs[sessionId] || null,
}));
