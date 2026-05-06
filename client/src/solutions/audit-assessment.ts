/**
 * Audit Assessment — Solution Registration
 *
 * Declares the Audit Assessment solution as a `SolutionDefinition`. Mirrors
 * the structure of `tprm.ts` exactly — only the per-solution data + content
 * differ. The framework (registerSolution + validateSolutionDefinition)
 * enforces canon invariants at startup.
 *
 * For the framework schema see `client/src/lib/solutionFramework.ts`.
 * For the canon visual spec see `docs/ui-pattern-canon.md`.
 */

import {
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Pencil,
} from "lucide-react";

import {
  masterEntityList,
  auditAssessmentSteps,
  auditAssessmentStepIds,
  type EntityRecord,
} from "@/lib/auditAssessmentData";

import {
  type SolutionDefinition,
  type WorkflowDef,
  type ObjectTypeDef,
  type StepDef,
  type SubstepDef,
} from "@/lib/solutionFramework";

// ─────────────────────────────────────────────────────────────────────────────
// Object — Entity (audit subject)
// ─────────────────────────────────────────────────────────────────────────────

const entityObjectType: ObjectTypeDef<EntityRecord> = {
  id: "entity",
  singular: "Entity",
  plural: "Entities",
  icon: ClipboardList,
  detailsTabLabel: "Overview",

  schemaFields: [
    { id: "id", label: "Entity ID", group: "Identity", kind: "text" },
    { id: "entityName", label: "Entity Name", group: "Identity", kind: "text" },
    { id: "entityType", label: "Entity Type", group: "Identity", kind: "enum" },
    { id: "ownerExec", label: "Executive Owner", group: "Identity", kind: "text" },
    { id: "region", label: "Region", group: "Identity", kind: "text" },
    { id: "riskTier", label: "Risk Tier", group: "Classification", kind: "enum" },
    { id: "inherentRisk", label: "Inherent Risk", group: "Classification", kind: "enum" },
    { id: "residualRisk", label: "Residual Risk", group: "Classification", kind: "enum" },
    { id: "regulatoryExposure", label: "Regulatory Exposure", group: "Classification", kind: "list" },
    { id: "headcount", label: "Headcount", group: "Classification", kind: "number" },
    { id: "annualRevenue", label: "Annual Revenue", group: "Classification", kind: "text" },
    { id: "auditStatus", label: "Audit Status", group: "Status", kind: "enum" },
    { id: "lastAuditDate", label: "Last Audit", group: "Status", kind: "date" },
    { id: "nextAuditDue", label: "Next Audit Due", group: "Status", kind: "date" },
    { id: "conclusion", label: "Conclusion", group: "Status", kind: "enum" },
    { id: "auditScope", label: "Audit Scope", group: "ConnectedData", kind: "list" },
    { id: "priorFindings", label: "Prior Findings", group: "ConnectedData", kind: "list" },
  ],

  pipelineDisplay: {
    idFormatter: (e) => e.id,
    nameFormatter: (e) => e.entityName,
    classificationFormatter: (e) => e.riskTier,
    sourceFormatter: (e) => (e.track === "continuous" ? "Continuous" : "Full Audit"),
  },

  // Section structure for the Overview tab. The actual rendering bodies live
  // in the session view's EntityOverviewTab; this declaration captures the
  // structure for the framework registry.
  detailsTabSections: [
    { id: "entity-info", title: "Entity Information", renderContent: () => null, sidebar: () => [] },
    { id: "risk-classification", title: "Risk Classification", renderContent: () => null, sidebar: () => [] },
    { id: "audit-status", title: "Audit Status", renderContent: () => null, sidebar: () => [] },
    { id: "scope-and-history", title: "Scope & Prior Findings", renderContent: () => null, sidebar: () => [] },
  ],

  optionalTabs: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Workflow — Entity Audit
// ─────────────────────────────────────────────────────────────────────────────

const agentNameByStep: Record<string, string> = {
  readiness: "READINESS AGENT",
  collect: "EVIDENCE AGENT",
  score: "SCORING AGENT",
  review: "REVIEW AGENT",
  comments: "COMMENTS AGENT",
  write: "DRAFTING AGENT",
  notes: "WORKPAPER AGENT",
  submit: "SUBMISSION AGENT",
  notify: "DISTRIBUTION AGENT",
};

// Adapt the existing `auditAssessmentSteps` (declared against the older
// `ArchetypeStep` type) into the framework's `StepDef`. Field shapes are
// near-identical; we lift `agentName` from the local map.
const auditFrameworkSteps: StepDef[] = auditAssessmentSteps.map((step) => ({
  id: step.id,
  ordinal: step.ordinal,
  shortLabel: step.shortLabel,
  title: step.title,
  description: step.description,
  agentName: agentNameByStep[step.id] ?? "AUDIT AGENT",
  icon: step.icon,
  phaseId: step.phaseId,
  defaultMode: "full",
  substeps: step.substeps.map<SubstepDef>((sub) => ({
    id: sub.id,
    actionType: sub.actionType,
    label: sub.label,
    description: sub.description,
    icon: sub.icon,
    isHitlGate: sub.isHitlGate,
    output: sub.output as SubstepDef["output"],
  })),
}));

const auditAssessmentWorkflow: WorkflowDef = {
  id: "audit-assessment",
  label: "Entity Audit",
  tabVerb: "Audit",
  emptyStateCtaVerb: "Run Audit",

  cycles: [
    { id: "fy26", label: "FY26 Annual", period: "FY26", status: "In Progress" },
    { id: "interim", label: "Interim Pulse", period: "H2 FY26", status: "Not Started" },
    { id: "triggered", label: "Triggered Re-audit", period: "On signal", status: "Not Started" },
  ],

  phases: [
    { id: "plan", ordinal: 1, label: "Plan", description: "Confirm readiness and gather evidence." },
    { id: "evaluate", ordinal: 2, label: "Evaluate", description: "Score, review, and gather stakeholder input." },
    { id: "report", ordinal: 3, label: "Report", description: "Compose, finalize, and submit the report." },
    { id: "communicate", ordinal: 4, label: "Communicate", description: "Distribute and confirm delivery." },
  ],

  steps: auditFrameworkSteps,

  tracks: [
    {
      id: "full-audit",
      label: "Full Audit Workflow",
      description: "Standard 9-step audit pipeline with reviewer disposition, stakeholder commentary, and director sign-off.",
      ordinal: 1,
    },
    {
      id: "continuous",
      label: "Continuous Monitoring",
      description: "Light-touch path for low-risk entities — review/comments/notes auto-pass when scoring is clean.",
      ordinal: 2,
    },
  ],
  trackSkipRules: [
    { trackId: "continuous", stepId: "review", reason: "Continuous-monitoring auto-passes reviewer disposition for clean scores." },
    { trackId: "continuous", stepId: "comments", reason: "Continuous-monitoring auto-passes stakeholder commentary." },
    { trackId: "continuous", stepId: "notes", reason: "Continuous-monitoring auto-passes workpaper notes." },
  ],

  outcomeStates: [
    { id: "satisfactory", label: "Satisfactory", tone: "success", icon: ShieldCheck },
    { id: "partial", label: "Partial", tone: "warn", icon: ShieldCheck },
    { id: "unsatisfactory", label: "Unsatisfactory", tone: "error", icon: AlertTriangle },
    { id: "re-audit", label: "Re-audit Required", tone: "follow-up", icon: Activity },
  ],

  // 8 invariant *run-context* slots (canon parity).
  runContextSchema: {
    slots: [
      { id: "leadAuditor", label: "Lead Auditor", kind: "person" },
      { id: "reviewer", label: "Reviewer", kind: "person" },
      { id: "auditPlanRef", label: "Audit Plan Ref", kind: "id" },
      { id: "secondaryReviewer", label: "Secondary Reviewer", kind: "person" },
      { id: "evidenceItems", label: "Evidence Items", kind: "text" },
      { id: "slaHours", label: "SLA Hours", kind: "text" },
      { id: "scope", label: "Scope", kind: "text" },
      { id: "dueDate", label: "Due Date", kind: "date" },
    ],
    resolveValues: (entityId, _cycleId) => {
      const entity = masterEntityList.find((e) => e.id === entityId);
      if (!entity) return ["—", "—", "—", "—", "—", "—", "—", "—"];
      const continuous = entity.track === "continuous";
      return [
        // Lead Auditor — derived from entity profile
        continuous ? "Continuous Monitoring Agent" : "Lead Auditor",
        // Reviewer
        continuous ? "—" : "Senior Audit Manager",
        // Audit Plan Ref
        `AP-${entity.id}`,
        // Secondary Reviewer (only for high/critical risk)
        entity.riskTier === "Critical" || entity.riskTier === "High"
          ? "Audit Director"
          : "—",
        // Evidence Items (count + scope coverage)
        `${entity.auditScope.length} scope areas · ${entity.priorFindings.length} prior findings`,
        // SLA Hours (varies by risk tier)
        entity.riskTier === "Critical" ? "120h"
          : entity.riskTier === "High" ? "96h"
          : entity.riskTier === "Medium" ? "72h"
          : "48h",
        // Scope
        entity.auditScope.slice(0, 3).join(" · ") + (entity.auditScope.length > 3 ? " · …" : ""),
        // Due Date
        entity.nextAuditDue,
      ];
    },
  },

  terminalArtifact: {
    label: "Audit Report",
    verb: "Generate Audit Report",
    sectionsBuilder: (entityId) => {
      const entity = masterEntityList.find((e) => e.id === entityId);
      if (!entity) {
        return [
          { title: "1. Entity Overview", rows: [["Entity ID", entityId]] },
          { title: "2. Audit Scope", rows: [["Scope", "—"]] },
          { title: "3. Findings & Conclusion", rows: [["Conclusion", "—"]] },
        ];
      }
      return [
        {
          title: "1. Entity Overview",
          rows: [
            ["Entity ID", entity.id],
            ["Entity Name", entity.entityName],
            ["Entity Type", entity.entityType],
            ["Executive Owner", `${entity.ownerExec.name} — ${entity.ownerExec.title}`],
            ["Region", entity.region],
            ["Headcount", String(entity.headcount)],
            ["Annual Revenue", entity.annualRevenue],
          ],
        },
        {
          title: "2. Risk Classification",
          rows: [
            ["Risk Tier", entity.riskTier],
            ["Inherent Risk", entity.inherentRisk],
            ["Residual Risk", entity.residualRisk],
            ["Regulatory Exposure", entity.regulatoryExposure.join(", ") || "None"],
            ["Audit Track", entity.track === "continuous" ? "Continuous Monitoring" : "Full Audit"],
          ],
        },
        {
          title: "3. Audit Scope",
          rows: entity.auditScope.map<[string, string]>((s, i) => [`Scope Area ${i + 1}`, s]),
        },
        {
          title: "4. Evidence Collection Summary",
          rows: [
            ["Connected-system pulls", "ERP transactions · IAM events · Ticketing logs · BI extracts"],
            ["PBC requests dispatched", "Per scope-area requirements"],
            ["Coverage", "94% (3 outstanding follow-ups)"],
            ["Gap items", "FY-Q3 reconciliation evidence pending"],
          ],
        },
        {
          title: "5. Findings",
          rows: entity.priorFindings.length === 0
            ? [["Findings", "No prior findings carried forward into this cycle."]]
            : entity.priorFindings.map<[string, string]>((f) => [
                `${f.id} (${f.severity})`,
                `${f.area} — ${f.summary} · status: ${f.status}`,
              ]),
        },
        {
          title: "6. Recommendations",
          rows: [
            ["Priority 1", "Remediation items per finding severity (see Findings section)"],
            ["Priority 2", "Continuous monitoring signal upgrades for medium-risk areas"],
            ["Priority 3", "Annual scope refresh against evolving regulatory exposure"],
          ],
        },
        {
          title: "7. Conclusion",
          rows: [
            ["Audit Status", entity.auditStatus],
            ["Conclusion", entity.conclusion],
            ["Last Audit", entity.lastAuditDate],
            ["Next Audit Due", entity.nextAuditDue],
            ["Notes", entity.notes || "—"],
            ["Reviewer", entity.riskTier === "Critical" || entity.riskTier === "High" ? "Audit Director" : "Senior Audit Manager"],
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

export const auditAssessmentSolution: SolutionDefinition<EntityRecord> = {
  id: "audit-assessment",
  label: "Audit Assessment",
  shortLabel: "Audit",
  description:
    "Coordinate end-to-end entity audits — readiness, evidence, scoring, review, reporting, and distribution.",
  icon: ClipboardList,
  strategicTargets: ["internal audit", "entity assurance", "audit committee reporting"],

  objectType: entityObjectType,
  workflows: [auditAssessmentWorkflow],

  solutionHome: {
    primaryTask: {
      id: "audit-task-fy26",
      label: "Run FY26 Audit — North America Operations",
      description:
        "Execute the FY26 entity audit pipeline for the largest BU. Connected-system pulls, scoring, reviewer disposition, and audit-committee distribution end-to-end.",
      ctaVerb: "Start",
      iconKey: "clipboard-list",
      priorityBadge: "Priority",
    },
    pendingApprovals: [],
    agentWorkflowsCounts: {
      direct: { active: 1, review: 0 },
      continuous: { active: 1, review: 0 },
      scheduled: { active: 4, review: 1 },
      emergent: { active: 1, review: 1 },
    },
    auditTrailEntries: [],
  },

  planDialog: {
    scopeCalloutTemplate: () => null,
    inlineMetricChips: [
      { iconKey: "calendar-range", label: "Audit Cycle", value: "FY26" },
      { iconKey: "target", label: "Risk Threshold", value: "Medium+" },
      { iconKey: "alert-triangle", label: "Open Findings", value: "3 across 3 entities" },
      { iconKey: "shield-check", label: "Reg. Watch", value: "SOX 404 · GDPR · FCPA" },
    ],
    startCtaVerb: "Confirm & Start Audit",
  },

  hubLabels: {
    objectColumnHeader: "Entity",
    sourceColumnHeader: "Track",
    resultColumnHeader: "Conclusion",
  },

  auditLogObjectFilter: (event, entityId) => {
    return (event as { entityId?: string; objectId?: string }).entityId === entityId
      || event.objectId === entityId;
  },
};

// Re-exports
export const auditAssessmentObjectType = entityObjectType;
export { auditAssessmentWorkflow };
export { auditAssessmentStepIds };
