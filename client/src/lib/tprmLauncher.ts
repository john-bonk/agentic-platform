import { useWorkflowSessionStore } from "@/lib/workflowSessionStore";
import { masterVendorList, seedVendorRunStatus, type VendorRunStatus } from "@/lib/tprmData";
import type { StepRunStatus } from "@/lib/workflowArchetype";

export const TPRM_SESSION_ID = "tprm-assessment";

export function launchTprmAssessment(
  addProject: ReturnType<typeof useWorkflowSessionStore.getState>["addProject"],
  setCurrentSession: ReturnType<typeof useWorkflowSessionStore.getState>["setCurrentSession"],
  activeProjects: ReturnType<typeof useWorkflowSessionStore.getState>["activeProjects"],
  workflowSessionConfigs: Record<string, { create: () => any; label: string; icon: string }>,
  selectedVendorIds?: string[]
) {
  const meta = workflowSessionConfigs[TPRM_SESSION_ID];
  if (!meta) return;

  const existing = activeProjects.find((p) => p.sessionId === TPRM_SESSION_ID);
  if (existing) {
    setCurrentSession(TPRM_SESSION_ID);
  } else {
    const config = meta.create();
    addProject(
      { sessionId: TPRM_SESSION_ID, label: meta.label, icon: meta.icon },
      config
    );
  }

  const store = useWorkflowSessionStore.getState();
  const currentStatuses =
    (store.runtimeStates[TPRM_SESSION_ID]?.blockStates?.["pipeline"]?.statuses as
      | VendorRunStatus[]
      | undefined) ?? [];

  const idsToInclude = selectedVendorIds && selectedVendorIds.length > 0
    ? new Set(selectedVendorIds)
    : new Set(masterVendorList.map((v) => v.id));

  const seed: VendorRunStatus[] = masterVendorList
    .filter((v) => idsToInclude.has(v.id))
    .map((v) => {
      // Vendor 9 is in the "monitoring with fired trigger" state for demo
      const base = seedVendorRunStatus(v);
      if (v.id === "VEN-009") {
        const steps: Record<string, StepRunStatus> = {
          ...base.steps,
          "vendor-intake": "complete",
          "risk-tiering": "complete",
          "outside-in": "complete",
          "doc-analysis": "complete",
          "risk-scoring": "complete",
          triage: "complete",
          "human-review": "complete",
          exception: "complete",
        };
        return {
          ...base,
          fired: true,
          steps,
          overallProgress: 92,
        };
      }
      return base;
    })
    .sort((a, b) => (a.track === "human-review" ? 0 : 1) - (b.track === "human-review" ? 0 : 1));

  if (currentStatuses.length === 0) {
    store.setBlockState(TPRM_SESSION_ID, "pipeline", "statuses", seed);
    store.setBlockState(TPRM_SESSION_ID, "pipeline", "phase", "running");
    store.setBlockState(TPRM_SESSION_ID, "pipeline", "resolvedHitl", []);
  }
}
