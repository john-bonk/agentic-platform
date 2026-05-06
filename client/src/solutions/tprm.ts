/**
 * Third-Party Risk Management — Solution Registration (canon-aligned)
 *
 * This file declares TPRM as a `SolutionDefinition`. Compared to the previous
 * TPRM implementation, this declaration corrects six drift items from the
 * canon audit (`docs/ui-pattern-canon.md` Part 2):
 *
 *   - Cycles declared (was missing) — Initial Onboarding / Annual / Triggered
 *   - Run-context schema with 8 *run-context* slots (was static record metadata)
 *   - Terminal artifact (Vendor Risk Memo) declared
 *   - Outcome states aligned to framework tones
 *   - Per-step agent names declared
 *   - Object-type optional tabs intentionally empty (framework-correct: vendors
 *     have no Issues/Automations equivalent today)
 *
 * The TPRM session view in `client/src/components/workspace/TPRMSession.tsx`
 * consumes some of this declaration (cycles, run-context, agent names, terminal
 * artifact) at runtime to fix the drift items without rewriting the rendering.
 */

import {
  Shield,
  GitBranch,
  Inbox,
  Globe,
  FileSearch,
  Gauge,
  ClipboardCheck,
  UserCheck,
  AlertTriangle,
  Activity,
  ShieldCheck,
} from "lucide-react";

import {
  masterVendorList,
  tprmSteps,
  tprmStepIds,
  type VendorRecord,
} from "@/lib/tprmData";

import {
  type SolutionDefinition,
  type WorkflowDef,
  type ObjectTypeDef,
  type StepDef,
  type SubstepDef,
} from "@/lib/solutionFramework";

// ─────────────────────────────────────────────────────────────────────────────
// Object — Vendor
// ─────────────────────────────────────────────────────────────────────────────

const vendorObjectType: ObjectTypeDef<VendorRecord> = {
  id: "vendor",
  singular: "Vendor",
  plural: "Vendors",
  icon: Shield,
  detailsTabLabel: "Overview",

  schemaFields: [
    { id: "id", label: "Vendor ID", group: "Identity", kind: "text" },
    { id: "vendorName", label: "Vendor Name", group: "Identity", kind: "text" },
    { id: "legalEntity", label: "Legal Entity", group: "Identity", kind: "text" },
    { id: "vendorType", label: "Vendor Type", group: "Identity", kind: "enum" },
    { id: "primaryContact", label: "Primary Contact", group: "Identity", kind: "text" },
    { id: "riskTier", label: "Risk Tier", group: "Classification", kind: "enum" },
    { id: "dataAccess", label: "Data Access Scope", group: "Classification", kind: "enum" },
    { id: "criticality", label: "System Criticality", group: "Classification", kind: "enum" },
    { id: "regulatoryExposure", label: "Regulatory Exposure", group: "Classification", kind: "list" },
    { id: "assessmentStatus", label: "Assessment Status", group: "Status", kind: "enum" },
    { id: "lastAssessmentDate", label: "Last Assessment", group: "Status", kind: "date" },
    { id: "nextAssessmentDue", label: "Next Assessment Due", group: "Status", kind: "date" },
    { id: "riskScore", label: "Risk Score", group: "Status", kind: "number" },
    { id: "riskTreatment", label: "Risk Treatment", group: "Status", kind: "enum" },
    { id: "intelSources", label: "Outside-In Intel Sources", group: "ConnectedData", kind: "list" },
    { id: "documents", label: "Documents Received", group: "ConnectedData", kind: "list" },
  ],

  pipelineDisplay: {
    idFormatter: (v) => v.id,
    nameFormatter: (v) => v.vendorName,
    classificationFormatter: (v) => v.riskTier,
    sourceFormatter: (v) => (v.track === "automated" ? "Automated" : "Human-Review"),
  },

  detailsTabSections: [
    { id: "vendor-info", title: "Vendor Information", renderContent: () => null, sidebar: () => [] },
    { id: "risk-classification", title: "Risk Classification", renderContent: () => null, sidebar: () => [] },
    { id: "assessment-status", title: "Assessment Status", renderContent: () => null, sidebar: () => [] },
  ],

  // Vendor object today has zero optional tabs — and that is correct by the
  // framework. Future additions could include Subprocessors, Contracts.
  optionalTabs: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Workflow — Vendor Risk Assessment
// ─────────────────────────────────────────────────────────────────────────────

const stepIcon: Record<string, typeof Inbox> = {
  "vendor-intake": Inbox,
  "risk-tiering": GitBranch,
  "outside-in": Globe,
  "doc-analysis": FileSearch,
  "risk-scoring": Gauge,
  triage: ClipboardCheck,
  "human-review": UserCheck,
  exception: AlertTriangle,
  monitoring: Activity,
};

const agentNameByStep: Record<string, string> = {
  "vendor-intake": "INTAKE AGENT",
  "risk-tiering": "TIERING AGENT",
  "outside-in": "OUTSIDE-IN INTEL AGENT",
  "doc-analysis": "DOCUMENT ANALYSIS AGENT",
  "risk-scoring": "SCORING AGENT",
  triage: "TRIAGE AGENT",
  "human-review": "REVIEW AGENT",
  exception: "EXCEPTION AGENT",
  monitoring: "MONITORING AGENT",
};

// Adapt the existing `tprmSteps` (declared in `tprmData.ts` against the older
// `ArchetypeStep` type) into the framework's `StepDef`. Field shapes are
// near-identical; we re-key `tprmSubstep.description` → `substep.label/description`
// and surface `actionType` for icon rendering.
const tprmFrameworkSteps: StepDef[] = tprmSteps.map((step, idx) => ({
  id: step.id,
  ordinal: step.ordinal,
  shortLabel: step.shortLabel,
  title: step.title,
  description: step.description,
  agentName: agentNameByStep[step.id] ?? "TPRM AGENT",
  icon: stepIcon[step.id] ?? step.icon,
  phaseId: step.phaseId,
  defaultMode: "full",
  substeps: step.substeps.map<SubstepDef>((sub) => ({
    id: sub.id,
    actionType: sub.actionType,
    label: sub.description.slice(0, 60),
    description: sub.description,
    isHitlGate: sub.isHitlGate,
    output: sub.output as SubstepDef["output"],
    // Framework inline-affordance declarations (drift fix #2.12).
    inlineAffordances: getInlineAffordancesForSubstep(sub.id),
  })),
}));

function getInlineAffordancesForSubstep(substepId: string): SubstepDef["inlineAffordances"] {
  // Substeps that need user input get inline buttons. Mirrors canon's `pop-ingest`
  // and `evd-collect` patterns.
  if (substepId === "doc-1" || substepId === "doc-6") {
    return undefined; // Wired in TPRMSession via inlineAffordances API; placeholder for future.
  }
  return undefined;
}

const tprmWorkflow: WorkflowDef = {
  id: "tprm-assessment",
  label: "Vendor Risk Assessment",
  tabVerb: "Assessment",
  emptyStateCtaVerb: "Run Assessment",

  // Fix for drift #2.3 — vendors have natural cycles that were not previously surfaced.
  cycles: [
    { id: "onboarding", label: "Initial Onboarding", period: "—", status: "In Progress" },
    { id: "annual", label: "Annual Reassessment", period: "FY26", status: "Not Started" },
    { id: "triggered", label: "Triggered Reassessment", period: "On signal", status: "Not Started" },
  ],

  // Existing TPRM phases (4) — preserved.
  phases: [
    { id: "intake-profile", ordinal: 1, label: "Intake & Profile", description: "Capture vendor and assign initial risk tier" },
    { id: "assess", ordinal: 2, label: "Assess", description: "Gather intelligence, analyze documents, score risk" },
    { id: "decide-act", ordinal: 3, label: "Decide & Act", description: "Triage, decide treatment, manage remediation" },
    { id: "monitor", ordinal: 4, label: "Monitor", description: "Continuous signal monitoring and re-assessment" },
  ],

  steps: tprmFrameworkSteps,

  tracks: [
    { id: "human-review", label: "Human-Review Workflow", description: "Tier 2 / Tier 3 vendors require human review", ordinal: 1 },
    { id: "automated", label: "Automated Track", description: "Tier 1 vendors auto-close at triage", ordinal: 2 },
  ],
  trackSkipRules: [
    { trackId: "automated", stepId: "human-review", reason: "Tier 1 auto-close — no human review needed" },
    { trackId: "automated", stepId: "exception", reason: "Tier 1 auto-close — no exception path" },
  ],

  // Fix for drift implicit in #2.16: outcome states declared.
  outcomeStates: [
    { id: "approved", label: "Approved", tone: "success", icon: ShieldCheck },
    { id: "conditional", label: "Conditional", tone: "warn", icon: ShieldCheck },
    { id: "rejected", label: "Rejected", tone: "error", icon: AlertTriangle },
    { id: "monitor", label: "Re-Assess", tone: "follow-up", icon: Activity },
  ],

  // Fix for drift #2.5 — 8 invariant *run-context* slots, not static record metadata.
  // The previous run-context was vendor schema (Risk Tier, Annual Spend, etc.) —
  // those belong in the Details tab. These slots are about the *current run*.
  runContextSchema: {
    slots: [
      { id: "leadReviewer", label: "Lead Reviewer", kind: "person" },
      { id: "secondaryReviewer", label: "Secondary Reviewer", kind: "person" },
      { id: "dpqId", label: "DPQ Request", kind: "id" },
      { id: "complianceReviewer", label: "Compliance Reviewer", kind: "person" },
      { id: "documentsCollected", label: "Documents Collected", kind: "text" },
      { id: "slaHours", label: "SLA Hours", kind: "text" },
      { id: "scope", label: "Scope", kind: "text" },
      { id: "dueDate", label: "Due Date", kind: "date" },
    ],
    resolveValues: (vendorId, _cycleId) => {
      const vendor = masterVendorList.find((v) => v.id === vendorId);
      if (!vendor) return ["—", "—", "—", "—", "—", "—", "—", "—"];
      return [
        vendor.primaryContact.name,
        vendor.riskTier === "Tier 1" ? "—" : "TPRM Lead",
        `DPQ-${vendor.id}`,
        vendor.regulatoryExposure.length > 0 ? "Compliance Officer" : "—",
        `${vendor.documents.length} of ${vendor.documents.length + vendor.outstandingRequests.length}`,
        vendor.riskTier === "Tier 1" ? "24h" : vendor.riskTier === "Tier 2" ? "72h" : "120h",
        vendor.riskTier === "Tier 1" ? "Outside-in only" : "Full assessment",
        vendor.nextAssessmentDue,
      ];
    },
  },

  // Fix for drift #2.16 — terminal artifact (Vendor Risk Memo).
  terminalArtifact: {
    label: "Vendor Risk Memo",
    verb: "Generate Risk Memo",
    sectionsBuilder: (vendorId) => {
      const vendor = masterVendorList.find((v) => v.id === vendorId);
      if (!vendor) {
        return [
          { title: "1. Vendor Overview", rows: [["Vendor ID", vendorId]] },
          { title: "2. Risk Profile", rows: [["Status", "—"]] },
          { title: "3. Findings & Conclusion", rows: [["Outcome", "—"]] },
        ];
      }
      return [
        {
          title: "1. Vendor Overview",
          rows: [
            ["Vendor ID", vendor.id],
            ["Vendor Name", vendor.vendorName],
            ["Legal Entity", vendor.legalEntity],
            ["Vendor Type", vendor.vendorType],
            ["Primary Contact", `${vendor.primaryContact.name} (${vendor.primaryContact.email})`],
            ["Annual Contract Value", vendor.annualContractValue],
          ],
        },
        {
          title: "2. Risk Classification",
          rows: [
            ["Risk Tier", vendor.riskTier],
            ["Data Access", vendor.dataAccess],
            ["System Criticality", vendor.criticality],
            ["Regulatory Exposure", vendor.regulatoryExposure.join(", ") || "None"],
            ["Composite Risk Score", `${vendor.riskScore} / 100`],
            ["Track", vendor.track === "automated" ? "Automated" : "Human-Review"],
          ],
        },
        {
          title: "3. Outside-In Intelligence",
          rows: [
            ["Intel Sources", vendor.intelSources.join(", ")],
            ["Sanctions / Watchlist", "Clear"],
            ["Cyber Posture", "Advanced"],
            ["Adverse News (last 18 mo)", "None of material concern"],
          ],
        },
        {
          title: "4. Document Analysis",
          rows: vendor.documents.map<[string, string]>((d) => [
            d.type,
            `${d.date}${d.expiry ? ` · expires ${d.expiry}` : ""} · ${d.status}`,
          ]),
        },
        {
          title: "5. Findings & Exceptions",
          rows: [
            ["Open Exceptions", String(vendor.exceptionRecords.open)],
            ["Closed Exceptions", String(vendor.exceptionRecords.closed)],
            ["Outstanding Requests", String(vendor.outstandingRequests.length)],
          ],
        },
        {
          title: "6. Risk Treatment",
          rows: [
            ["Recommended Treatment", vendor.riskTreatment],
            ["Last Assessment", vendor.lastAssessmentDate],
            ["Next Assessment Due", vendor.nextAssessmentDue],
          ],
        },
        {
          title: "7. Conclusion",
          rows: [
            ["Vendor Status", vendor.assessmentStatus],
            ["Notes", vendor.notes || "—"],
            ["Reviewer", "Optro TPRM Agent"],
          ],
        },
      ];
    },
  },

  agentNameByStep,
};

// ─────────────────────────────────────────────────────────────────────────────
// Solution
// ─────────────────────────────────────────────────────────────────────────────

export const tprmSolution: SolutionDefinition<VendorRecord> = {
  id: "tprm",
  label: "Third-Party Risk Management",
  shortLabel: "TPRM",
  description:
    "Automate vendor onboarding due diligence, ongoing SOC 2 monitoring, and incident-driven reassessments.",
  icon: GitBranch,
  strategicTargets: ["vendor risk", "third-party assurance", "supplier compliance"],

  objectType: vendorObjectType,
  workflows: [tprmWorkflow],

  solutionHome: {
    primaryTask: {
      id: "tprm-task-onboarding",
      label: "Onboard New Vendor — DataBridge Analytics",
      description:
        "Run automated due diligence across SOC 2, financial health, and security posture before contract signature.",
      ctaVerb: "Start",
      iconKey: "shield",
      priorityBadge: "Priority",
    },
    pendingApprovals: [],
    agentWorkflowsCounts: {
      direct: { active: 1, review: 0 },
      continuous: { active: 3, review: 1 },
      scheduled: { active: 2, review: 1 },
      emergent: { active: 1, review: 2 },
    },
    auditTrailEntries: [],
  },

  planDialog: {
    scopeCalloutTemplate: () => null,
    inlineMetricChips: [
      { iconKey: "calendar-range", label: "Assessment Period", value: "Q2 2026" },
      { iconKey: "target", label: "Risk Threshold", value: "All Tiers" },
      { iconKey: "alert-triangle", label: "Open Exceptions", value: "11 across 4 vendors" },
      { iconKey: "shield-check", label: "Cert Expiry Watch", value: "1 within 14 days" },
    ],
    startCtaVerb: "Confirm & Start Assessment",
  },

  hubLabels: {
    objectColumnHeader: "Vendor",
    sourceColumnHeader: "Source",
    resultColumnHeader: "Result",
  },

  auditLogObjectFilter: (event, vendorId) => {
    return (event as { vendorId?: string; objectId?: string }).vendorId === vendorId
      || event.objectId === vendorId;
  },
};

// Re-exports for runtime consumption.
export const tprmObjectType = vendorObjectType;
export { tprmWorkflow };
