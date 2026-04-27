import { create } from "zustand";
import { useCallback } from "react";

export interface ActiveProject {
  sessionId: string;
  label: string;
  icon: string;
}

export interface WorkflowRuntimeState {
  activeIndex: number;
  completedIndices: number[];
  fullScreenView: string | null;
  blockStates: Record<string, Record<string, unknown>>;
}

interface WorkflowSessionState {
  activeProjects: ActiveProject[];
  currentSessionId: string | null;
  currentSolutionId: string | null;
  pendingCanvasView: boolean;
  pendingDetailView: string | null;
  sessionConfigs: Record<string, unknown>;
  runtimeStates: Record<string, WorkflowRuntimeState>;
  addProject: (project: ActiveProject, config: unknown) => void;
  removeProject: (sessionId: string) => void;
  setCurrentSession: (sessionId: string | null) => void;
  setCurrentSolution: (solutionId: string | null) => void;
  setPendingCanvasView: (val: boolean) => void;
  setPendingDetailView: (viewId: string | null) => void;
  getSessionConfig: (sessionId: string) => unknown | null;
  getRuntime: (sessionId: string) => WorkflowRuntimeState | null;
  setRuntime: (sessionId: string, runtime: Partial<WorkflowRuntimeState>) => void;
  setBlockState: (sessionId: string, blockId: string, key: string, value: unknown) => void;
}

const defaultRuntime = (): WorkflowRuntimeState => ({
  activeIndex: 0,
  completedIndices: [],
  fullScreenView: null,
  blockStates: {},
});

export const useWorkflowSessionStore = create<WorkflowSessionState>((set, get) => ({
  activeProjects: [],
  currentSessionId: null,
  currentSolutionId: null,
  pendingCanvasView: false,
  pendingDetailView: null,
  sessionConfigs: {},
  runtimeStates: {},
  addProject: (project, config) =>
    set((state) => {
      if (state.activeProjects.some((p) => p.sessionId === project.sessionId)) {
        return { currentSessionId: project.sessionId };
      }
      return {
        activeProjects: [...state.activeProjects, project],
        currentSessionId: project.sessionId,
        sessionConfigs: { ...state.sessionConfigs, [project.sessionId]: config },
        runtimeStates: { ...state.runtimeStates, [project.sessionId]: defaultRuntime() },
      };
    }),
  removeProject: (sessionId) =>
    set((state) => {
      const { [sessionId]: _c, ...remainingConfigs } = state.sessionConfigs;
      const { [sessionId]: _r, ...remainingRuntimes } = state.runtimeStates;
      return {
        activeProjects: state.activeProjects.filter((p) => p.sessionId !== sessionId),
        currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        sessionConfigs: remainingConfigs,
        runtimeStates: remainingRuntimes,
      };
    }),
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  setCurrentSolution: (solutionId) => set({ currentSolutionId: solutionId }),
  setPendingCanvasView: (val) => set({ pendingCanvasView: val }),
  setPendingDetailView: (viewId) => set({ pendingDetailView: viewId }),
  getSessionConfig: (sessionId) => get().sessionConfigs[sessionId] || null,
  getRuntime: (sessionId) => get().runtimeStates[sessionId] || null,
  setRuntime: (sessionId, partial) =>
    set((state) => {
      const existing = state.runtimeStates[sessionId] || defaultRuntime();
      return {
        runtimeStates: {
          ...state.runtimeStates,
          [sessionId]: { ...existing, ...partial },
        },
      };
    }),
  setBlockState: (sessionId, blockId, key, value) =>
    set((state) => {
      const existing = state.runtimeStates[sessionId] || defaultRuntime();
      const blockStates = { ...existing.blockStates };
      blockStates[blockId] = { ...(blockStates[blockId] || {}), [key]: value };
      return {
        runtimeStates: {
          ...state.runtimeStates,
          [sessionId]: { ...existing, blockStates },
        },
      };
    }),
}));

export function usePersistedBlockState<T>(
  sessionId: string,
  blockId: string,
  key: string,
  initialValue: T
): [T, (val: T | ((prev: T) => T)) => void] {
  const current = useWorkflowSessionStore((state) => {
    const bs = state.runtimeStates[sessionId]?.blockStates[blockId];
    if (bs && key in bs) return bs[key] as T;
    return initialValue;
  });

  const hasInitializedRef = { current: false };
  if (!hasInitializedRef.current) {
    const store = useWorkflowSessionStore.getState();
    const bs = store.runtimeStates[sessionId]?.blockStates[blockId];
    if (!bs || !(key in bs)) {
      store.setBlockState(sessionId, blockId, key, initialValue);
    }
    hasInitializedRef.current = true;
  }

  const setValue = useCallback(
    (val: T | ((prev: T) => T)) => {
      const store = useWorkflowSessionStore.getState();
      const bs = store.runtimeStates[sessionId]?.blockStates[blockId];
      const prev = bs && key in bs ? (bs[key] as T) : initialValue;
      const next = typeof val === "function" ? (val as (prev: T) => T)(prev) : val;
      store.setBlockState(sessionId, blockId, key, next);
    },
    [sessionId, blockId, key, initialValue]
  );

  return [current, setValue];
}
