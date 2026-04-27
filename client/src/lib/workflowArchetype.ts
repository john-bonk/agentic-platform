import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type SubstepActionType = "ai" | "auto" | "hitl";

export type StepRunStatus =
  | "pending"
  | "running"
  | "waiting"
  | "complete"
  | "blocked"
  | "skipped";

export type ObjectTrack = "automated" | "human-review";

export interface ArchetypeOutput {
  kind: "annotation" | "list" | "score" | "narrative" | "request";
  label: string;
  items?: { label: string; value?: string; status?: "ok" | "gap" | "warn" | "info" }[];
  body?: string;
  scoreValue?: number;
  scoreLabel?: string;
}

export interface ArchetypeSubstep {
  id: string;
  actionType: SubstepActionType;
  description: string;
  detail?: string;
  output?: ArchetypeOutput;
  isHitlGate?: boolean;
}

export interface ArchetypeStep {
  id: string;
  ordinal: number;
  phaseId: string;
  title: string;
  shortLabel: string;
  description: string;
  agentRole: string;
  outcome: string;
  icon: LucideIcon;
  substeps: ArchetypeSubstep[];
}

export interface ArchetypePhase {
  id: string;
  ordinal: number;
  label: string;
  description?: string;
}

export type ArchetypeFieldGroup =
  | "Identity"
  | "Classification"
  | "Status"
  | "Connected data"
  | "Other";

export interface ArchetypeObjectFieldDef {
  id: string;
  label: string;
  group: ArchetypeFieldGroup;
  kind: "text" | "enum" | "number" | "list" | "date";
}

export interface ArchetypeWizardStep {
  id: string;
  title: string;
  description: string;
}

export interface ArchetypeTrackingRule {
  trackId: ObjectTrack;
  label: string;
  description: string;
}

export interface ArchetypeConfig {
  id: string;
  solutionLabel: string;
  objectType: string;
  objectTypePlural: string;
  phases: ArchetypePhase[];
  steps: ArchetypeStep[];
  objectFields: ArchetypeObjectFieldDef[];
  configWizardSteps: ArchetypeWizardStep[];
  trackingRules: ArchetypeTrackingRule[];
  description: string;
}

export const ACTION_TYPE_META: Record<
  SubstepActionType,
  { label: string; shortLabel: string; tone: string }
> = {
  ai: {
    label: "AI",
    shortLabel: "AI",
    tone:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
  auto: {
    label: "Automated",
    shortLabel: "AUTO",
    tone:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  },
  hitl: {
    label: "Human-in-the-loop",
    shortLabel: "HITL",
    tone:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
};

export function getStepProgress(
  statuses: Record<string, StepRunStatus>,
  stepIds: string[]
): { completed: number; running: number; total: number; percent: number } {
  const total = stepIds.length;
  const completed = stepIds.filter((id) => statuses[id] === "complete").length;
  const running = stepIds.filter(
    (id) => statuses[id] === "running" || statuses[id] === "waiting"
  ).length;
  const percent = total === 0 ? 0 : Math.round(((completed * 100) + (running * 40)) / total);
  return { completed, running, total, percent };
}

export interface ArchetypeRendererProps<TObj> {
  config: ArchetypeConfig;
  object: TObj;
}

export type ArchetypeRenderer<TObj> = ComponentType<ArchetypeRendererProps<TObj>>;
