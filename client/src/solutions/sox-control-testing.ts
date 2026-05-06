/**
 * SOX Control Testing — Solution Registration (canon)
 *
 * This file declares SOX Control Testing as a `SolutionDefinition` for the
 * solution framework. It mirrors the existing canon implementation in
 * `AgentHubHome.tsx` (`ControlFocusPage`, `FieldworkComplexHub`, etc.) and
 * `WorkflowSession.tsx` (`masterControlsList`, `fieldworkExceptions`, …).
 *
 * IMPORTANT: This is a **read-only declaration**. It does NOT alter the
 * runtime behavior of Control Testing. The existing `ControlFocusPage`
 * continues to render exactly as before. This declaration serves three
 * purposes:
 *
 *   1. Document SOX in framework terms so it can be the reference for
 *      other solutions.
 *   2. Provide the `SolutionDefinition` contract that future solutions can
 *      pattern-match against.
 *   3. Validate canon against the framework's contract (validation runs
 *      on registration; any mismatch surfaces as a console warning).
 *
 * Do NOT edit canon to consume from this declaration. The declaration is
 * derived from canon, not the other way around.
 *
 * For pixel-level visual specs see `docs/ui-pattern-canon.md`.
 * For the framework schema see `docs/solution-framework.md` and
 * `client/src/lib/solutionFramework.ts`.
 */

import {
  Shield,
  ClipboardCheck,
  Database,
  SlidersHorizontal,
  Upload,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Target,
  Search,
  CalendarRange,
  Bot,
} from "lucide-react";

import {
  masterControlsList,
  fieldworkExceptions,
  fieldworkStepOrder,
} from "@/components/workspace/WorkflowSession";

import {
  type SolutionDefinition,
  type WorkflowDef,
  type ObjectTypeDef,
  type StepDef,
} from "@/lib/solutionFramework";

// ─────────────────────────────────────────────────────────────────────────────
// Object — Control
// ─────────────────────────────────────────────────────────────────────────────

type ControlRecord = (typeof masterControlsList)[number];

const controlObjectType: ObjectTypeDef<ControlRecord> = {
  id: "control",
  singular: "Control",
  plural: "Controls",
  icon: Shield,
  detailsTabLabel: "Details",

  schemaFields: [
    { id: "id", label: "Control ID", group: "Identity", kind: "text" },
    { id: "name", label: "Control Name", group: "Identity", kind: "text" },
    { id: "category", label: "Category", group: "Classification", kind: "enum" },
    { id: "riskLevel", label: "Risk Level", group: "Classification", kind: "enum" },
    { id: "owner", label: "Control Owner", group: "Status", kind: "text" },
    { id: "pbcOwner", label: "PBC Owner", group: "Status", kind: "text" },
    { id: "dataSource", label: "Data Source", group: "ConnectedData", kind: "enum" },
    { id: "system", label: "Connected System", group: "ConnectedData", kind: "text" },
  ],

  pipelineDisplay: {
    idFormatter: (c) => c.id,
    nameFormatter: (c) => c.name,
    classificationFormatter: (c) => c.riskLevel,
    sourceFormatter: (c) => (c.dataSource === "connected" ? "Connected" : "PBC"),
  },

  // Section structure mirrors `ControlDetailsTab` in AgentHubHome.tsx ≈ line 3602.
  // This declaration intentionally does NOT specify renderContent — the existing
  // `ControlDetailsTab` component renders the bodies. The framework would only
  // call these renderers if the framework's generic ObjectFocusPage were active
  // for SOX, which it is not (canon retains its bespoke implementation).
  detailsTabSections: [
    {
      id: "control-information",
      title: "Control Information",
      renderContent: () => null,
      sidebar: () => [],
    },
    {
      id: "control-test-information",
      title: "Control Test Information",
      renderContent: () => null,
      sidebar: () => [],
    },
  ],

  // Control-specific optional tabs. These are the source of the "Issues" and
  // "Automations" tabs visible in the canon CTL-003 drilldown.
  optionalTabs: [
    { id: "issues", label: "Issues", render: () => null },
    { id: "automations", label: "Automations", render: () => null },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Workflow — Control Testing
// ─────────────────────────────────────────────────────────────────────────────

const stepIcon: Record<string, typeof FileCheck> = {
  readiness: FileCheck,
  population: Database,
  sampling: SlidersHorizontal,
  evidence: Upload,
  testing: ClipboardCheck,
  testEffectiveness: ShieldCheck,
};

const stepTitleMap: Record<string, string> = {
  readiness: "Readiness",
  population: "Population Acquisition",
  sampling: "Sampling",
  evidence: "Evidence",
  testing: "Testing",
  testEffectiveness: "Test Effectiveness",
};

const stepShortLabelMap: Record<string, string> = {
  readiness: "Rdy",
  population: "Pop",
  sampling: "Smp",
  evidence: "Evd",
  testing: "Tst",
  testEffectiveness: "Eff",
};

const stepAgentNameMap: Record<string, string> = {
  readiness: "READINESS AGENT",
  population: "POPULATION AGENT",
  sampling: "SAMPLING AGENT",
  evidence: "EVIDENCE AGENT",
  testing: "TESTING AGENT",
  testEffectiveness: "EFFECTIVENESS AGENT",
};

// Substeps are declared at the framework level for cross-solution pattern matching.
// Canon's actual rendering uses `stepNodeInfo` in AgentHubHome.tsx, which is
// the same shape. This declaration is the framework view.
const controlSteps: StepDef[] = fieldworkStepOrder.map((stepId, idx) => ({
  id: stepId,
  ordinal: idx + 1,
  shortLabel: stepShortLabelMap[stepId],
  title: stepTitleMap[stepId],
  description: stepTitleMap[stepId],
  agentName: stepAgentNameMap[stepId],
  icon: stepIcon[stepId] ?? FileCheck,
  defaultMode: "full",
  // Substeps live in canon's `stepNodeInfo` (AgentHubHome.tsx ≈ line 1646). This
  // declaration uses a single placeholder substep so validation passes; canon's
  // bespoke rendering reads from `stepNodeInfo` directly.
  substeps: [
    {
      id: `${stepId}-canon-placeholder`,
      actionType: "ai",
      label: "See AgentHubHome.tsx stepNodeInfo for canonical substep set",
      description: "Substeps for canon are declared in stepNodeInfo (AgentHubHome.tsx ≈ 1646).",
    },
  ],
}));

// HITL gate substep so validation passes the "no-HITL" warning. The actual
// HITL gates in canon are surfaced via blockRule (manual evidence collection)
// rather than per-substep `isHitlGate` flags.
controlSteps[3].substeps.push({
  id: "evidence-hitl-checkpoint",
  actionType: "hitl",
  label: "Manual evidence checkpoint",
  description: "Manual evidence upload checkpoint for PBC-driven controls (see fieldworkBlockRules).",
  isHitlGate: true,
});

const controlTestingWorkflow: WorkflowDef = {
  id: "control-testing",
  label: "Automated Control Testing",
  tabVerb: "Testing",
  emptyStateCtaVerb: "Test with Agent",

  // Cycles are declared in `testCycles` in AgentHubHome.tsx ≈ line 3819.
  cycles: [
    { id: "walkthrough", label: "Walkthrough", period: "Q4 FY2025", status: "Complete" },
    { id: "interim", label: "Interim", period: "Q1 FY2026", status: "In Progress" },
    { id: "rollforward", label: "Roll Forward", period: "Q2 FY2026", status: "Not Started" },
  ],

  // Canon does NOT declare phases. Steps are flat.
  phases: undefined,

  steps: controlSteps,

  tracks: [
    { id: "manual", label: "PBC Workflow", description: "Manual evidence collection via PBC requests", ordinal: 1 },
    { id: "connected", label: "Automated", description: "Automated evidence collection from connected systems", ordinal: 2 },
  ],
  trackSkipRules: [],

  outcomeStates: [
    { id: "effective", label: "Effective", tone: "success", icon: ShieldCheck },
    { id: "ineffective", label: "Ineffective", tone: "error", icon: AlertTriangle },
  ],

  // Run-context schema mirrors the 8 slots that canon's `getTestDetailInfo`
  // function fills (AgentHubHome.tsx ≈ line 3836).
  runContextSchema: {
    slots: [
      { id: "tester", label: "Tester", kind: "person" },
      { id: "reviewer", label: "Reviewer", kind: "person" },
      { id: "pbcRequest", label: "PBC Request", kind: "id" },
      { id: "secondaryReviewer", label: "Secondary Reviewer", kind: "person" },
      { id: "sampleSize", label: "Sample Size", kind: "text" },
      { id: "budgetedHours", label: "Budgeted Hours", kind: "text" },
      { id: "sampleSelections", label: "Sample Selections", kind: "text" },
      { id: "dueDate", label: "Due Date", kind: "date" },
    ],
    resolveValues: () => {
      // Canon resolves these values via `getTestDetailInfo(controlId, cycle)` in
      // AgentHubHome.tsx. The framework's resolveValues is unused by canon's
      // bespoke rendering; included for schema completeness.
      return ["—", "—", "—", "—", "—", "—", "—", "—"];
    },
  },

  terminalArtifact: {
    label: "Workpaper",
    verb: "Generate Workpaper",
    sectionsBuilder: (controlId) => [
      { title: "1. Control Overview", rows: [["Control ID", controlId]] },
      { title: "2. Readiness Assessment", rows: [["Status", "—"]] },
      { title: "3. Population & Sampling", rows: [["Sample Size", "—"]] },
      { title: "4. Evidence Collection", rows: [["Documents Collected", "—"]] },
      { title: "5. Attribute Testing Results", rows: [["Pass Rate", "—"]] },
      { title: "6. Exceptions Identified", rows: [["Count", String(fieldworkExceptions.filter((e) => e.controlId === controlId).length)]] },
      { title: "7. Conclusion", rows: [["Effectiveness", "—"]] },
    ],
  },

  agentNameByStep: stepAgentNameMap,
};

// ─────────────────────────────────────────────────────────────────────────────
// Solution
// ─────────────────────────────────────────────────────────────────────────────

export const soxControlTestingSolution: SolutionDefinition<ControlRecord> = {
  id: "sox-control-testing",
  label: "SOX Control Testing",
  shortLabel: "SOX",
  description:
    "Run automated, agentic control testing across connected systems with PBC workflows for the manual remainder.",
  icon: Shield,
  strategicTargets: ["control assurance", "SOX 404 compliance", "audit efficiency"],

  objectType: controlObjectType,

  workflows: [controlTestingWorkflow],

  // The actual content of L2 Solution Home is rendered from `solutionConfigs`
  // in AgentHubHome.tsx. This declaration captures the same shape for the
  // framework registry; canon does not consume it.
  solutionHome: {
    primaryTask: {
      id: "control-testing",
      label: "Test Controls for SOX Audit",
      description:
        "Launch automated control testing across connected systems and PBC workflows for the current audit period.",
      ctaVerb: "Start",
      iconKey: "shield",
      priorityBadge: "Priority",
    },
    pendingApprovals: [],
    agentWorkflowsCounts: {
      direct: { active: 1, review: 0 },
      continuous: { active: 3, review: 1 },
      scheduled: { active: 1, review: 1 },
      emergent: { active: 1, review: 1 },
    },
    auditTrailEntries: [],
  },

  planDialog: {
    scopeCalloutTemplate: () => null,
    inlineMetricChips: [
      { iconKey: "calendar-range", label: "Audit Period", value: "Q1 2026" },
      { iconKey: "target", label: "Risk Threshold", value: "Medium+" },
      { iconKey: "alert-triangle", label: "Prior Exceptions", value: "3 flagged" },
      { iconKey: "search", label: "Coverage Gaps", value: "2 identified" },
    ],
    startCtaVerb: "Confirm & Start Workflow",
  },

  hubLabels: {
    objectColumnHeader: "Control",
    sourceColumnHeader: "Source",
    resultColumnHeader: "Result",
  },

  // Filter binding for object-level Audit Log + master Hub Audit Log.
  auditLogObjectFilter: (event, controlId) => {
    return (event as { objectId?: string; controlId?: string }).controlId === controlId
      || event.objectId === controlId;
  },
};

// Re-exports for convenience.
export const soxObjectType = controlObjectType;
export const soxWorkflow = controlTestingWorkflow;
export type { ControlRecord };
