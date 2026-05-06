/**
 * Audit Assessment — Launcher
 * Mirrors `tprmLauncher.ts` exactly. Only the session id, masterEntityList,
 * and seed function differ.
 */

import { useWorkflowSessionStore } from "@/lib/workflowSessionStore";
import {
  masterEntityList,
  seedEntityRunStatus,
  type EntityRunStatus,
} from "@/lib/auditAssessmentData";
import type { StepRunStatus } from "@/lib/workflowArchetype";

export const AUDIT_ASSESSMENT_SESSION_ID = "audit-assessment";

export function launchAuditAssessment(
  addProject: ReturnType<typeof useWorkflowSessionStore.getState>["addProject"],
  setCurrentSession: ReturnType<typeof useWorkflowSessionStore.getState>["setCurrentSession"],
  activeProjects: ReturnType<typeof useWorkflowSessionStore.getState>["activeProjects"],
  workflowSessionConfigs: Record<string, { create: () => any; label: string; icon: string }>,
  selectedEntityIds?: string[]
) {
  const meta = workflowSessionConfigs[AUDIT_ASSESSMENT_SESSION_ID];
  if (!meta) return;

  const existing = activeProjects.find((p) => p.sessionId === AUDIT_ASSESSMENT_SESSION_ID);
  if (existing) {
    setCurrentSession(AUDIT_ASSESSMENT_SESSION_ID);
  } else {
    const config = meta.create();
    addProject(
      { sessionId: AUDIT_ASSESSMENT_SESSION_ID, label: meta.label, icon: meta.icon },
      config
    );
  }

  const store = useWorkflowSessionStore.getState();
  const currentStatuses =
    (store.runtimeStates[AUDIT_ASSESSMENT_SESSION_ID]?.blockStates?.["pipeline"]?.statuses as
      | EntityRunStatus[]
      | undefined) ?? [];

  const idsToInclude = selectedEntityIds && selectedEntityIds.length > 0
    ? new Set(selectedEntityIds)
    : new Set(masterEntityList.map((e) => e.id));

  const seed: EntityRunStatus[] = masterEntityList
    .filter((e) => idsToInclude.has(e.id))
    .map((e) => {
      const base = seedEntityRunStatus(e);
      // ENT-008 (Legal & Compliance) is in re-audit pending state — surface that as
      // a fired continuous-monitoring signal for demo richness.
      if (e.id === "ENT-008") {
        const steps: Record<string, StepRunStatus> = {
          ...base.steps,
          readiness: "complete",
          collect: "complete",
          score: "complete",
          review: "complete",
          comments: "complete",
          write: "complete",
          notes: "complete",
        };
        return {
          ...base,
          fired: true,
          steps,
          overallProgress: 78,
        };
      }
      return base;
    })
    .sort((a, b) => (a.track === "full-audit" ? 0 : 1) - (b.track === "full-audit" ? 0 : 1));

  if (currentStatuses.length === 0) {
    store.setBlockState(AUDIT_ASSESSMENT_SESSION_ID, "pipeline", "statuses", seed);
    store.setBlockState(AUDIT_ASSESSMENT_SESSION_ID, "pipeline", "phase", "running");
    store.setBlockState(AUDIT_ASSESSMENT_SESSION_ID, "pipeline", "resolvedHitl", []);
  }
}
