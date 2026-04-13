import { masterControlsList } from "@/components/workspace/WorkflowSession";
import { useWorkflowSessionStore } from "@/lib/workflowSessionStore";
import type { ControlWorkflowStatus } from "@/lib/workflowSessionStore";

export function launchControlTestingWorkflow(
  addProject: ReturnType<typeof useWorkflowSessionStore.getState>["addProject"],
  setCurrentSession: ReturnType<typeof useWorkflowSessionStore.getState>["setCurrentSession"],
  activeProjects: ReturnType<typeof useWorkflowSessionStore.getState>["activeProjects"],
  workflowSessionConfigs: Record<string, { create: () => any; label: string; icon: string }>
) {
  const meta = workflowSessionConfigs["control-testing"];
  if (!meta) return;

  const existing = activeProjects.find((p) => p.sessionId === "control-testing");
  if (existing) {
    setCurrentSession("control-testing");
  } else {
    const config = meta.create();
    addProject({ sessionId: "control-testing", label: meta.label, icon: meta.icon }, config);
  }

  const sid = "control-testing";
  const store = useWorkflowSessionStore.getState();
  const currentStatuses =
    (store.runtimeStates[sid]?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
  if (currentStatuses.length === 0) {
    const pendingSteps = {
      readiness: "pending" as const,
      population: "pending" as const,
      sampling: "pending" as const,
      evidence: "pending" as const,
      testing: "pending" as const,
      testEffectiveness: "pending" as const,
    };
    const seedStatuses: ControlWorkflowStatus[] = masterControlsList
      .map((c) => ({
        controlId: c.id,
        name: c.name,
        dataSource: c.dataSource as "connected" | "manual",
        system: c.system,
        owner: c.owner,
        steps: { ...pendingSteps },
        overallProgress: 0,
      }))
      .sort((a, b) => (a.dataSource === "manual" ? 0 : 1) - (b.dataSource === "manual" ? 0 : 1));
    store.setBlockState(sid, "fieldwork-execution", "statuses", seedStatuses);
  }
  store.setBlockState(sid, "fieldwork-execution", "phase", "running");
}
