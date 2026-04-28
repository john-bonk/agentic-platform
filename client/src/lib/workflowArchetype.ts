import type { ComponentType } from "react";
import { Bot, Fingerprint, Zap, type LucideIcon } from "lucide-react";

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

/**
 * ACTION_TYPE_META — canonical metadata for the three substep automation modes.
 *
 * Visual contract (mirrors SOX `automationModeIcons` in AgentHubHome.tsx around line 2868):
 *   - `auto`  → Zap icon, emerald tint, used for fully automated substeps
 *   - `ai`    → Bot icon, blue tint, used for AI-only substeps with no checkpoint
 *   - `hitl`  → Fingerprint icon, amber tint, used for human-in-the-loop gates
 *
 * Use `icon` + `iconColor` for the in-line marker that sits next to a substep description
 * (the SOX canon uses an icon-only marker, NOT a coloured pill). Use `label`/`shortLabel`/`tone`
 * for the Audit Trail table and other places where text labels read better than icons.
 */
export const ACTION_TYPE_META: Record<
  SubstepActionType,
  {
    label: string;
    shortLabel: string;
    tone: string;
    icon: LucideIcon;
    iconColor: string;
    title: string;
  }
> = {
  ai: {
    label: "AI",
    shortLabel: "AI",
    tone:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    icon: Bot,
    iconColor: "text-blue-400 dark:text-blue-500",
    title: "AI substep",
  },
  auto: {
    label: "Automated",
    shortLabel: "AUTO",
    tone:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: Zap,
    iconColor: "text-emerald-400 dark:text-emerald-500",
    title: "Fully automated substep",
  },
  hitl: {
    label: "Human-in-the-loop",
    shortLabel: "HITL",
    tone:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    icon: Fingerprint,
    iconColor: "text-amber-500 dark:text-amber-400",
    title: "Human-in-the-loop substep",
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
