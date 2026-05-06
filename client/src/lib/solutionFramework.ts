/**
 * Solution Framework — TypeScript schema
 *
 * The master type system for the Optro Agentic Platform's solution registration.
 * Filling out a `SolutionDefinition` is the *complete* contract for adding a new
 * solution. The framework promises a working canon-compliant UI in return.
 *
 * Companion docs:
 *  - docs/solution-framework.md      — the architectural taxonomy + this schema, in prose
 *  - docs/ui-pattern-canon.md        — pixel-level visual reference + drift audit
 *  - docs/workflow-archetype.md      — implementation recipe
 *
 * This file is types-only. It does not import any rendering code; it can be
 * referenced from anywhere. The framework's runtime guarantees are documented
 * in solution-framework.md Part 5.3.
 */

import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives (re-exported from workflowArchetype to keep one source of truth)
// ─────────────────────────────────────────────────────────────────────────────

export type SubstepActionType = "ai" | "auto" | "hitl";
export type StepRunStatus =
  | "pending"
  | "running"
  | "waiting"
  | "complete"
  | "blocked"
  | "skipped";
export type ObjectTrack = string; // tracks are per-workflow; the framework only requires that they're consistent within the workflow

// ─────────────────────────────────────────────────────────────────────────────
// L3 — Object Type
// ─────────────────────────────────────────────────────────────────────────────

export type FieldGroup = "Identity" | "Classification" | "Status" | "ConnectedData" | "Other";
export type FieldKind = "text" | "enum" | "number" | "list" | "date";

export interface ObjectFieldDef {
  id: string;
  label: string;
  group: FieldGroup;
  kind: FieldKind;
}

/**
 * Pipeline display config — how this object renders in the L4 Hub pipeline grid.
 * Formatters return strings (or React nodes) given an object instance.
 */
export interface PipelineDisplayDef<TObject> {
  idFormatter: (obj: TObject) => string;
  nameFormatter: (obj: TObject) => string;
  classificationFormatter: (obj: TObject) => string;
  sourceFormatter: (obj: TObject) => string | ReactNode;
  resultFormatter?: (obj: TObject, status: ObjectRunStatus) => ReactNode;
}

/**
 * Details/Overview tab content — the static schema view of an object record.
 * Two-column layout: descriptive content sections (left) + metadata sidebar (right).
 *
 * The framework renders the layout. Authors provide the section structure.
 */
export interface DetailsTabSection<TObject> {
  id: string;
  title: string;
  defaultCollapsed?: boolean;
  /** Renders the left-column content for this section. */
  renderContent: (obj: TObject) => ReactNode;
  /** Returns the [label, value] pairs for the right-side metadata rail. */
  sidebar: (obj: TObject) => Array<[string, string | ReactNode]>;
}

/**
 * Optional tabs are object-type-specific. They render between the Workflow tab
 * and the Audit Log tab. Examples in the wild:
 *   - Control: Issues, Automations
 *   - Vendor: (none today)
 *   - Entity (future): KRIs, Heat Map
 */
export interface OptionalTabDef<TObject> {
  id: string;
  label: string;
  render: (obj: TObject) => ReactNode;
  showWhen?: (obj: TObject) => boolean;
}

export interface ObjectTypeDef<TObject> {
  id: string;
  singular: string;
  plural: string;
  icon: LucideIcon;
  schemaFields: ObjectFieldDef[];
  pipelineDisplay: PipelineDisplayDef<TObject>;
  detailsTabSections: DetailsTabSection<TObject>[];
  /** "Details" or "Overview" — the platform should pick one and use consistently. */
  detailsTabLabel?: "Details" | "Overview";
  optionalTabs?: OptionalTabDef<TObject>[];
}

// ─────────────────────────────────────────────────────────────────────────────
// L2 — Workflow definition
// ─────────────────────────────────────────────────────────────────────────────

export interface PhaseDef {
  id: string;
  ordinal: number;
  label: string;
  description?: string;
}

export interface CycleDef {
  id: string;
  label: string;
  period: string; // "FY25" / "Q1" / "On signal" / "—"
  status: "Complete" | "In Progress" | "Not Started";
}

export interface TrackDef {
  id: string;
  label: string;
  description: string;
  ordinal: number; // group order in pipeline (lower = top); convention: human-touched first
}

export interface SkipRule {
  trackId: string;
  stepId: string;
  reason: string;
}

export type OutcomeTone = "success" | "warn" | "error" | "follow-up" | "in-progress" | "pending";

export interface OutcomeStateDef {
  id: string;
  label: string;
  tone: OutcomeTone;
  icon: LucideIcon;
}

/**
 * The 8-slot run-context schema. Slot semantics are invariant; labels and
 * value formats vary per workflow. A workflow that doesn't have a natural
 * value for a slot uses "—" rather than omitting the slot.
 */
export interface RunContextSlotDef {
  id: string;
  label: string; // displayed in the run-context band
  kind: "person" | "id" | "text" | "date" | "number";
}

export interface RunContextSchema {
  /** Exactly 8 slots. The 8 invariant semantics are documented in solution-framework.md § 3.5. */
  slots: [
    RunContextSlotDef, RunContextSlotDef, RunContextSlotDef, RunContextSlotDef,
    RunContextSlotDef, RunContextSlotDef, RunContextSlotDef, RunContextSlotDef,
  ];
  /** Resolves slot values for a given object + run cycle. */
  resolveValues: (objectId: string, cycleId?: string) => Array<string | ReactNode>;
}

// ─────────────────────────────────────────────────────────────────────────────
// L4 — Step / Substep definition language
// ─────────────────────────────────────────────────────────────────────────────

export type AutomationMode = "full" | "checkpoint" | "manual";

export interface SubstepOutputDef {
  kind: "score" | "narrative" | "annotation" | "list" | "request";
  label: string;
  scoreValue?: number;
  scoreLabel?: string;
  body?: string;
  items?: { label: string; value?: string; status?: "ok" | "warn" | "gap" | "info" }[];
}

export interface InlineAffordanceDef {
  id: string; // "upload" | "request-via-workstream" | "manual-run" | …
  label: string;
  variant: "primary" | "outline";
  icon: LucideIcon;
  /** Statuses that surface this button. */
  showWhen: ("running" | "blocked" | "waiting")[];
}

export interface SubstepDef {
  id: string;
  actionType: SubstepActionType;
  label: string; // canonical short name; SOX uses "label", TPRM has used "description"
  description: string;
  detail?: string;
  icon?: LucideIcon;
  /** True if this substep blocks the step until a human resolves it. */
  isHitlGate?: boolean;
  /** Buttons that appear in the substep's indent when status is in `showWhen`. */
  inlineAffordances?: InlineAffordanceDef[];
  /** Artifact that expands when the row is clicked once complete. */
  output?: SubstepOutputDef;
}

export interface BlockRuleDef {
  stepId: string;
  blockAtSubstepId?: string;
  title: string;
  description: string;
  severity: "high" | "medium";
}

export interface StepDef {
  id: string;
  ordinal: number;
  shortLabel: string; // ≤ 4 chars, used in pipeline grid header
  title: string;
  description: string; // shown as step subtitle
  agentName: string; // "EVIDENCE AGENT" — drives utility-panel agent narration
  icon: LucideIcon;
  phaseId?: string;
  defaultMode?: AutomationMode;
  substeps: SubstepDef[];
  blockRules?: BlockRuleDef[];
}

// ─────────────────────────────────────────────────────────────────────────────
// L6 — Terminal artifact
// ─────────────────────────────────────────────────────────────────────────────

export interface ArtifactSection {
  title: string;
  rows: Array<[string, string]>;
}

export interface TerminalArtifactDef {
  /** "Workpaper" / "Risk Memo" / "Briefing" */
  label: string;
  /** Verb used as the terminal CTA on the last step: "Generate Workpaper" / … */
  verb: string;
  /** Function that builds the artifact sections for an object. */
  sectionsBuilder: (objectId: string, runStatus?: ObjectRunStatus) => ArtifactSection[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow def (the agentic process)
// ─────────────────────────────────────────────────────────────────────────────

export interface ObjectRunStatus {
  objectId: string;
  steps: Record<string, StepRunStatus>;
  overallProgress: number;
  /** Workflow-specific extension state; see solution-specific run-status types. */
  extra?: Record<string, unknown>;
}

export interface WorkflowDef {
  id: string;
  label: string;
  /** Verb shown in the focus-page tab label: "Testing" / "Assessment" / "Review". */
  tabVerb: string;
  /** Verb used in the empty-state CTA: "Test with Agent" / "Run Assessment". */
  emptyStateCtaVerb: string;
  terminalArtifact: TerminalArtifactDef;

  /** When present, a chevron dropdown is rendered on the workflow tab label. */
  cycles?: CycleDef[];
  /** When present, plan view groups steps by phase + step header shows "Phase n · Label". */
  phases?: PhaseDef[];

  steps: StepDef[];

  /** At least one. Pipeline groups rows by track. */
  tracks: TrackDef[];
  trackSkipRules?: SkipRule[];

  /** 2–5 outcome states for the terminal banner + pipeline result column. */
  outcomeStates: OutcomeStateDef[];

  runContextSchema: RunContextSchema;

  /** Agent name per step (drives utility-panel comments). */
  agentNameByStep: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// L1/L2/L3 — Solution-level definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface PrimaryTaskDef {
  id: string;
  label: string;
  description: string;
  ctaVerb: string; // "Start"
  iconKey: string;
  priorityBadge?: "Priority" | "High" | "Critical";
}

export interface PendingApprovalDef {
  id: string;
  title: string;
  agent: string;
  type: string;
  timestamp: string;
  severity: "high" | "medium" | "low";
}

export interface AgentWorkflowCountDef {
  active: number;
  review?: number;
}

export interface AgentWorkflowCountsDef {
  direct: AgentWorkflowCountDef;
  continuous: AgentWorkflowCountDef;
  scheduled: AgentWorkflowCountDef;
  emergent: AgentWorkflowCountDef;
}

export interface AuditTrailEntryDef {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  type: "info" | "success" | "escalation" | "warning";
}

export interface SolutionHomeDef {
  primaryTask: PrimaryTaskDef;
  pendingApprovals: PendingApprovalDef[];
  agentWorkflowsCounts: AgentWorkflowCountsDef;
  auditTrailEntries: AuditTrailEntryDef[];
}

export interface PlanDialogMetricChip {
  iconKey: string;
  label: string;
  value: string;
}

export interface PlanDialogDef {
  /** Narrative explanation of how the in-scope set was selected. */
  scopeCalloutTemplate: (scopeStats: { totalScope: number; tracks: Array<{ trackId: string; count: number }> }) => ReactNode;
  /** Up to 4 inline metric chips. */
  inlineMetricChips: PlanDialogMetricChip[];
  /** "Confirm & Start Workflow" / "… Assessment" / "… Review". */
  startCtaVerb: string;
}

export interface HubLabelsDef {
  objectColumnHeader: string;
  sourceColumnHeader?: string;
  resultColumnHeader: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// The master type — SolutionDefinition
// ─────────────────────────────────────────────────────────────────────────────

export interface SolutionDefinition<TObject = unknown> {
  /** Identity */
  id: string;
  label: string;
  shortLabel?: string;
  description: string; // ≤ 120 chars
  icon: LucideIcon;
  strategicTargets: string[];

  /** L3 — Object Type */
  objectType: ObjectTypeDef<TObject>;

  /** L2 — Workflows (1-to-many; today: 1, but the model supports many) */
  workflows: WorkflowDef[];

  /** L2 — Solution Home content */
  solutionHome: SolutionHomeDef;

  /** L3 — Plan dialog */
  planDialog: PlanDialogDef;

  /** L4 — Hub labels */
  hubLabels: HubLabelsDef;

  /** Audit log filter — drives both Hub-level audit log and L5 Audit Log tab. */
  auditLogObjectFilter?: (event: { objectId?: string }, objectId: string) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
}

/**
 * Validates a SolutionDefinition against the framework's contract.
 * Returns an empty array when the definition is canon-compliant.
 *
 * See solution-framework.md § 5.2 for the rule set.
 */
export function validateSolutionDefinition(def: SolutionDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!/^[a-z][a-z0-9-]*$/.test(def.id)) {
    issues.push({ severity: "error", message: `Solution id must be kebab-case (got '${def.id}').` });
  }

  if (def.description.length > 120) {
    issues.push({ severity: "error", message: `Solution description must be ≤ 120 chars (got ${def.description.length}).` });
  }

  if (def.workflows.length < 1) {
    issues.push({ severity: "error", message: `A solution must declare at least one workflow.` });
  }

  for (const wf of def.workflows) {
    if (wf.steps.length < 2) {
      issues.push({ severity: "error", message: `Workflow '${wf.id}' must have at least 2 steps.` });
    }

    for (const step of wf.steps) {
      if (step.substeps.length < 1) {
        issues.push({ severity: "error", message: `Step '${wf.id}.${step.id}' must have at least 1 substep.` });
      }
      for (const sub of step.substeps) {
        if (!sub.actionType) {
          issues.push({ severity: "error", message: `Substep '${wf.id}.${step.id}.${sub.id}' must declare actionType (ai/auto/hitl).` });
        }
      }
    }

    if (wf.tracks.length < 1) {
      issues.push({ severity: "error", message: `Workflow '${wf.id}' must have at least 1 track.` });
    }

    if (wf.runContextSchema.slots.length !== 8) {
      issues.push({ severity: "error", message: `Workflow '${wf.id}' run-context schema must have exactly 8 slots.` });
    }

    if (wf.outcomeStates.length < 2 || wf.outcomeStates.length > 5) {
      issues.push({ severity: "error", message: `Workflow '${wf.id}' must declare 2–5 outcome states (got ${wf.outcomeStates.length}).` });
    }

    const sampleSections = wf.terminalArtifact.sectionsBuilder("__sample__");
    if (sampleSections.length < 3) {
      issues.push({ severity: "error", message: `Terminal artifact for workflow '${wf.id}' must have ≥ 3 sections (got ${sampleSections.length}).` });
    }

    const hasHitl = wf.steps.some((s) => s.substeps.some((sub) => sub.actionType === "hitl"));
    if (!hasHitl) {
      issues.push({ severity: "warning", message: `Workflow '${wf.id}' has no HITL substep — is the agent supposed to run fully unsupervised?` });
    }
  }

  const groups = new Set(def.objectType.schemaFields.map((f) => f.group));
  const required = ["Identity", "Classification", "Status", "ConnectedData"] as const;
  const missing = required.filter((g) => !groups.has(g));
  if (missing.length > 0) {
    issues.push({
      severity: "warning",
      message: `Object type '${def.objectType.id}' should have fields in Identity, Classification, Status, and Connected Data groups (missing: ${missing.join(", ")}).`,
    });
  }

  const reservedTabIds = new Set(["details", "overview", "audit", "audit-log"]);
  // The workflow tab is dynamic by verb so we don't reserve a single id; instead reserve the workflow ids themselves.
  for (const wf of def.workflows) reservedTabIds.add(wf.id);
  for (const tab of def.objectType.optionalTabs ?? []) {
    if (reservedTabIds.has(tab.id)) {
      issues.push({
        severity: "error",
        message: `Optional tab '${tab.id}' would shadow a required tab — choose a different id.`,
      });
    }
  }

  return issues;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

const _registry = new Map<string, SolutionDefinition>();

export function registerSolution(def: SolutionDefinition): void {
  const issues = validateSolutionDefinition(def);
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `[solutionFramework] Cannot register solution '${def.id}' — ${errors.length} error(s):\n` +
        errors.map((e) => `  - ${e.message}`).join("\n"),
    );
    throw new Error(`Solution '${def.id}' failed validation. See console for details.`);
  }
  for (const w of issues.filter((i) => i.severity === "warning")) {
    // eslint-disable-next-line no-console
    console.warn(`[solutionFramework] ${def.id}: ${w.message}`);
  }
  _registry.set(def.id, def);
}

export function getRegisteredSolution(id: string): SolutionDefinition | undefined {
  return _registry.get(id);
}

export function getRegisteredWorkflow(solutionId: string, workflowId: string): WorkflowDef | undefined {
  const sol = _registry.get(solutionId);
  return sol?.workflows.find((w) => w.id === workflowId);
}

export function listRegisteredSolutions(): SolutionDefinition[] {
  return Array.from(_registry.values());
}
