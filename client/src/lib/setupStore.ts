import { create } from "zustand";

export type Industry =
  | "Financial Services"
  | "Technology"
  | "Healthcare"
  | "Manufacturing"
  | "Other";

export type ComplianceScope =
  | "SOX"
  | "TPRM"
  | "ISO 27001"
  | "HIPAA"
  | "PCI"
  | "Other";

export type ConnectionId = "grc" | "documents" | "hris" | "erp";

export type SolutionId =
  | "sox-control-testing"
  | "tprm"
  | "risk-assessments"
  | "pre-ipo-readiness"
  | "evidence-collection";

export type DefaultTrigger = "manual" | "scheduled" | "per-workflow";
export type HitlApprover = "any-admin" | "assigned-reviewer" | "per-workflow";

export interface SetupData {
  orgName: string;
  industry: Industry;
  complianceScope: ComplianceScope[];
  connections: Record<ConnectionId, boolean>;
  solutions: Record<SolutionId, boolean>;
  defaultTrigger: DefaultTrigger;
  hitlApprover: HitlApprover;
  auditLogging: boolean;
}

const initialData: SetupData = {
  orgName: "",
  industry: "Financial Services",
  complianceScope: ["SOX"],
  connections: { grc: false, documents: false, hris: false, erp: false },
  solutions: {
    "sox-control-testing": true,
    tprm: false,
    "risk-assessments": false,
    "pre-ipo-readiness": false,
    "evidence-collection": false,
  },
  defaultTrigger: "manual",
  hitlApprover: "any-admin",
  auditLogging: true,
};

export type SetupMode = "wizard" | "chat";

interface SetupState {
  isComplete: boolean;
  currentStep: number;
  mode: SetupMode;
  data: SetupData;
  setStep: (step: number) => void;
  setMode: (mode: SetupMode) => void;
  updateData: <K extends keyof SetupData>(key: K, value: SetupData[K]) => void;
  toggleConnection: (id: ConnectionId) => void;
  toggleSolution: (id: SolutionId) => void;
  toggleCompliance: (scope: ComplianceScope) => void;
  complete: () => void;
  resetIfComplete: () => void;
}

export const useSetupStore = create<SetupState>((set) => ({
  isComplete: false,
  currentStep: 1,
  mode: "wizard",
  data: initialData,
  setStep: (step) => set({ currentStep: step }),
  setMode: (mode) => set({ mode }),
  updateData: (key, value) =>
    set((s) => ({ data: { ...s.data, [key]: value } })),
  toggleConnection: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        connections: { ...s.data.connections, [id]: !s.data.connections[id] },
      },
    })),
  toggleSolution: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        solutions: { ...s.data.solutions, [id]: !s.data.solutions[id] },
      },
    })),
  toggleCompliance: (scope) =>
    set((s) => {
      const has = s.data.complianceScope.includes(scope);
      return {
        data: {
          ...s.data,
          complianceScope: has
            ? s.data.complianceScope.filter((c) => c !== scope)
            : [...s.data.complianceScope, scope],
        },
      };
    }),
  complete: () => set({ isComplete: true }),
  resetIfComplete: () => {
    // No-op: kept for future hook points; we preserve in-memory state per spec.
  },
}));
