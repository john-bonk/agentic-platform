/**
 * Audit Assessment — Domain data
 *
 * Shape and conventions match `tprmData.ts` exactly so the Audit Assessment
 * solution renders through the same canon-compliant focus page, hub, and
 * pipeline grammar. The only solution-specific things in this file are:
 *   - `EntityRecord` (the iterated object — an audit subject)
 *   - 9 steps × 3-5 substeps each (READINESS → NOTIFY)
 *   - Master entity list (8 mock entities)
 *   - Per-track simulator (auto-tick advancing entities through the pipeline)
 *
 * For the framework contract see `client/src/lib/solutionFramework.ts`.
 * For the canon visual spec see `docs/ui-pattern-canon.md`.
 */

import {
  // Step icons
  ClipboardList,
  Inbox,
  Gauge,
  UserCheck,
  MessageSquare,
  Pencil,
  StickyNote,
  Send,
  Bell,
  // Substep content icons
  Search,
  ShieldCheck,
  FileCheck,
  FileSearch,
  Database,
  Layers,
  BarChart3,
  Target,
  ScrollText,
  ClipboardCheck,
  GitMerge,
  FileText,
  ListChecks,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  Upload,
} from "lucide-react";

import type {
  ArchetypeConfig,
  ArchetypeStep,
  ArchetypePhase,
  ArchetypeObjectFieldDef,
  ObjectTrack,
  StepRunStatus,
} from "./workflowArchetype";

// ─────────────────────────────────────────────────────────────────────────────
// Object — Entity (audit subject)
// ─────────────────────────────────────────────────────────────────────────────

export type EntityType = "Business Unit" | "Function" | "Region" | "Process" | "Subsidiary";
export type RiskRating = "Low" | "Medium" | "High" | "Critical";
export type AuditStatus = "Not started" | "Planning" | "Fieldwork" | "Reporting" | "Closed" | "Re-audit pending";
export type AuditConclusion =
  | "Satisfactory"
  | "Partial"
  | "Unsatisfactory"
  | "Re-audit required"
  | "Pending";

export interface EntityFinding {
  id: string;
  severity: "high" | "medium" | "low";
  area: string;
  summary: string;
  status: "open" | "remediated";
}

export interface EntityRecord {
  id: string;
  entityName: string;
  entityType: EntityType;
  ownerExec: { name: string; title: string; email: string };
  riskTier: RiskRating;
  inherentRisk: RiskRating;
  residualRisk: RiskRating;
  regulatoryExposure: string[];
  region: string;
  headcount: number;
  annualRevenue: string;
  auditStatus: AuditStatus;
  lastAuditDate: string;
  nextAuditDue: string;
  auditScope: string[];
  conclusion: AuditConclusion;
  priorFindings: EntityFinding[];
  /** Track determines whether this entity uses the full audit pipeline or the
   *  light-touch continuous track (which auto-passes through review/comments/notes). */
  track: ObjectTrack;
  notes: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phases (optional grouping — surfaced as "Phase n · Label" subtitles)
// ─────────────────────────────────────────────────────────────────────────────

export const auditAssessmentPhases: ArchetypePhase[] = [
  { id: "plan", ordinal: 1, label: "Plan", description: "Confirm readiness and scope; gather audit evidence." },
  { id: "evaluate", ordinal: 2, label: "Evaluate", description: "Score the entity, review findings, and gather stakeholder input." },
  { id: "report", ordinal: 3, label: "Report", description: "Compose the report, finalize notes, and submit for sign-off." },
  { id: "communicate", ordinal: 4, label: "Communicate", description: "Distribute the report and confirm delivery." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Object schema fields (drives the Details tab + run-context resolution)
// ─────────────────────────────────────────────────────────────────────────────

export const auditAssessmentObjectFields: ArchetypeObjectFieldDef[] = [
  { id: "id", label: "Entity ID", group: "Identity", kind: "text" },
  { id: "entityName", label: "Entity name", group: "Identity", kind: "text" },
  { id: "entityType", label: "Entity type", group: "Identity", kind: "enum" },
  { id: "ownerExec", label: "Executive owner", group: "Identity", kind: "text" },
  { id: "region", label: "Region", group: "Identity", kind: "text" },
  { id: "riskTier", label: "Risk tier", group: "Classification", kind: "enum" },
  { id: "inherentRisk", label: "Inherent risk", group: "Classification", kind: "enum" },
  { id: "residualRisk", label: "Residual risk", group: "Classification", kind: "enum" },
  { id: "regulatoryExposure", label: "Regulatory exposure", group: "Classification", kind: "list" },
  { id: "headcount", label: "Headcount", group: "Classification", kind: "number" },
  { id: "annualRevenue", label: "Annual revenue", group: "Classification", kind: "text" },
  { id: "auditStatus", label: "Audit status", group: "Status", kind: "enum" },
  { id: "lastAuditDate", label: "Last audit", group: "Status", kind: "date" },
  { id: "nextAuditDue", label: "Next audit due", group: "Status", kind: "date" },
  { id: "conclusion", label: "Conclusion", group: "Status", kind: "enum" },
  { id: "auditScope", label: "Audit scope", group: "ConnectedData", kind: "list" },
  { id: "priorFindings", label: "Prior findings", group: "ConnectedData", kind: "list" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Steps + substeps — 9 prime steps from the user's spec
// READINESS → COLLECT → SCORE → REVIEW → COMMENTS → WRITE → NOTES → SUBMIT → NOTIFY
// Each substep declares actionType (ai/auto/hitl), label, icon, description.
// ─────────────────────────────────────────────────────────────────────────────

export const auditAssessmentSteps: ArchetypeStep[] = [
  {
    id: "readiness",
    ordinal: 1,
    phaseId: "plan",
    title: "Readiness",
    shortLabel: "Readiness",
    description: "Confirm the entity is ready for audit — scope, prior history, and data source connectivity.",
    agentRole:
      "Pulls entity profile and prior-audit history, validates audit scope against the current audit plan, and confirms required data sources are connected before fieldwork begins.",
    outcome: "Entity confirmed in scope with all readiness prerequisites met",
    icon: ClipboardList,
    substeps: [
      {
        id: "rdy-1",
        actionType: "auto",
        label: "Entity Profile Pull",
        icon: Database,
        description: "Pull entity profile, prior audit history, and open findings from the audit management system",
        output: {
          kind: "list",
          label: "Entity profile",
          items: [
            { label: "Last audit", value: "FY24 Annual" },
            { label: "Prior findings (open)", value: "2" },
            { label: "Scope definition", value: "Loaded from audit plan" },
          ],
        },
      },
      {
        id: "rdy-2",
        actionType: "ai",
        label: "Scope Validation",
        icon: Search,
        description: "Validate the proposed audit scope against current audit plan and material risk inventory",
        output: {
          kind: "annotation",
          label: "Scope validation",
          items: [
            { label: "Plan alignment", value: "Confirmed", status: "ok" },
            { label: "Material risks covered", value: "8 of 8", status: "ok" },
            { label: "Out-of-scope flagged", value: "0", status: "ok" },
          ],
        },
      },
      {
        id: "rdy-3",
        actionType: "ai",
        label: "Risk-Control Mapping",
        icon: Layers,
        description: "Identify in-scope risks, controls, and processes; map to the entity's RACI",
      },
      {
        id: "rdy-4",
        actionType: "auto",
        label: "Source Connectivity Check",
        icon: ShieldCheck,
        description: "Verify connected systems (ERP, IAM, ticketing, BI) are reachable for evidence collection",
      },
      {
        id: "rdy-5",
        actionType: "auto",
        label: "Readiness Confirmation",
        icon: FileCheck,
        description: "Log readiness checklist; mark entity ready for evidence collection",
      },
    ],
  },
  {
    id: "collect",
    ordinal: 2,
    phaseId: "plan",
    title: "Evidence Collection",
    shortLabel: "Collect",
    description: "Gather audit evidence from connected systems and entity-owned PBC requests.",
    agentRole:
      "Identifies required evidence types per audit area, pulls connected-system evidence in parallel, dispatches PBC requests to entity owners, and validates completeness against scope.",
    outcome: "Complete, classified evidence package mapped to audit scope",
    icon: Inbox,
    substeps: [
      {
        id: "col-1",
        actionType: "auto",
        label: "Evidence Inventory",
        icon: ListChecks,
        description: "Identify required evidence types per audit area (transactional, configurational, attestational)",
      },
      {
        id: "col-2",
        actionType: "auto",
        label: "Connected-System Pull",
        icon: Database,
        description: "Pull evidence from connected systems in parallel: ERP transactions, IAM logs, ticketing records, BI extracts",
        // Universal block-resolution affordances — surface inline when this
        // substep's source connectivity stalls or fails (canon parity with SOX
        // pop-ingest's Upload / Request via Workstream pattern).
        inlineAffordances: [
          {
            id: "request",
            label: "Request System Access",
            variant: "outline",
            icon: Send,
            showWhen: ["running", "blocked"],
          },
          {
            id: "upload",
            label: "Upload Manual Evidence",
            variant: "primary",
            icon: Upload,
            showWhen: ["running", "blocked"],
          },
        ],
        output: {
          kind: "list",
          label: "System pulls",
          items: [
            { label: "ERP records", value: "12,847 transactions" },
            { label: "IAM events", value: "2,103 access changes" },
            { label: "Ticketing logs", value: "486 change tickets" },
            { label: "BI extracts", value: "9 reports" },
          ],
        },
      },
      {
        id: "col-3",
        actionType: "auto",
        label: "PBC Dispatch",
        icon: Send,
        description: "Dispatch evidence requests to entity owners via the PBC portal with deadlines",
        inlineAffordances: [
          {
            id: "request",
            label: "Send PBC Request",
            variant: "outline",
            icon: Send,
            showWhen: ["running", "blocked"],
          },
          {
            id: "upload",
            label: "Upload Evidence Directly",
            variant: "primary",
            icon: Upload,
            showWhen: ["running", "blocked"],
          },
        ],
      },
      {
        id: "col-4",
        actionType: "ai",
        label: "Classification & Tagging",
        icon: Layers,
        description: "Classify each evidence artifact by type, area, and control; tag with audit-area metadata",
      },
      {
        id: "col-5",
        actionType: "ai",
        label: "Completeness Check",
        icon: FileCheck,
        description: "Validate evidence completeness against scope; surface gaps as PBC follow-ups",
        output: {
          kind: "annotation",
          label: "Completeness",
          items: [
            { label: "Coverage", value: "94%", status: "ok" },
            { label: "Outstanding requests", value: "3", status: "warn" },
            { label: "Gap items", value: "FY-Q3 reconciliation evidence", status: "warn" },
          ],
        },
      },
    ],
  },
  {
    id: "score",
    ordinal: 3,
    phaseId: "evaluate",
    title: "Scoring",
    shortLabel: "Score",
    description: "Score the entity's control posture against assessment criteria with traceable evidence.",
    agentRole:
      "Applies the assessment ruleset to collected evidence, computes a composite score with confidence rating, and surfaces outliers and exceptions with citations to source evidence.",
    outcome: "Auditable composite score with finding-by-finding rationale and evidence links",
    icon: Gauge,
    substeps: [
      {
        id: "scr-1",
        actionType: "ai",
        label: "Criteria Application",
        icon: Target,
        description: "Apply control assessment criteria from the audit plan to the collected evidence per audit area",
      },
      {
        id: "scr-2",
        actionType: "ai",
        label: "Composite Scoring",
        icon: Gauge,
        description: "Compute weighted composite control score using the configured scoring model",
        output: {
          kind: "score",
          label: "Composite control score",
          scoreValue: 78,
          scoreLabel: "Effective with exceptions",
        },
      },
      {
        id: "scr-3",
        actionType: "ai",
        label: "Outlier Detection",
        icon: AlertTriangle,
        description: "Identify outliers, exceptions, and anomalies that require reviewer attention",
        output: {
          kind: "annotation",
          label: "Exceptions",
          items: [
            { label: "Access provisioning lag", value: "8 of 240 — outside SLA", status: "warn" },
            { label: "Journal entry segregation", value: "2 self-approvals", status: "gap" },
            { label: "Vendor onboarding", value: "All within tolerance", status: "ok" },
          ],
        },
      },
      {
        id: "scr-4",
        actionType: "auto",
        label: "Rationale & Citations",
        icon: ScrollText,
        description: "Log scoring rationale with finding-by-finding breakdown and source-evidence citations",
      },
    ],
  },
  {
    id: "review",
    ordinal: 4,
    phaseId: "evaluate",
    title: "Reviewer Disposition",
    shortLabel: "Review",
    description: "Reviewer evaluates findings, confirms ratings, and records disposition with rationale.",
    agentRole:
      "Renders a structured reviewer brief with score breakdown, top findings, suggested rating, and comparable entities. Captures the reviewer's confirmation, modifications, or rejection.",
    outcome: "Defensible reviewer disposition on record with full rationale",
    icon: UserCheck,
    substeps: [
      {
        id: "rev-1",
        actionType: "ai",
        label: "Reviewer Brief",
        icon: ScrollText,
        description: "Render reviewer brief with score, top findings, suggested rating, and comparable-entity benchmarks",
        output: {
          kind: "narrative",
          label: "Reviewer Brief",
          body:
            "Composite score 78 (Effective with exceptions). Two finding clusters above threshold: access-provisioning SLA breaches (8/240) and journal-entry self-approval (2 instances). Suggested rating: Partial — require remediation plan for SoD finding before next cycle. Comparable entities at this profile (NA Ops FY24, EMEA Sales FY24) closed at Partial with 30-day remediation cycle.",
          items: [
            { label: "Composite score", value: "78 / 100", status: "warn" },
            { label: "Findings (open)", value: "2 — 1 high, 1 medium", status: "warn" },
            { label: "Confidence", value: "High (0.93)", status: "ok" },
            { label: "Suggested rating", value: "Partial", status: "info" },
            { label: "Comparable entities", value: "NA Ops FY24 · EMEA Sales FY24", status: "info" },
          ],
        },
      },
      {
        id: "rev-2",
        actionType: "hitl",
        isHitlGate: true,
        label: "Reviewer Disposition",
        icon: ClipboardCheck,
        description: "Reviewer confirms or modifies the rating: Approve / Modify / Reject",
      },
      {
        id: "rev-3",
        actionType: "auto",
        label: "Disposition Capture",
        icon: Database,
        description: "Capture reviewer identity, decision, rationale, and timestamp in the entity audit trail",
      },
    ],
  },
  {
    id: "comments",
    ordinal: 5,
    phaseId: "evaluate",
    title: "Stakeholder Comments",
    shortLabel: "Comments",
    description: "Solicit and reconcile entity stakeholder commentary on draft findings.",
    agentRole:
      "Dispatches finding drafts to entity stakeholders, consolidates responses by finding, and reconciles comments against the original finding language for inclusion in the report.",
    outcome: "Stakeholder commentary collected and reconciled to findings",
    icon: MessageSquare,
    substeps: [
      {
        id: "cmt-1",
        actionType: "auto",
        label: "Draft Dispatch",
        icon: Send,
        description: "Send finding drafts to entity stakeholders with response deadlines and structured response forms",
      },
      {
        id: "cmt-2",
        actionType: "auto",
        label: "Response Consolidation",
        icon: GitMerge,
        description: "Collect and consolidate stakeholder responses; group by finding and severity",
      },
      {
        id: "cmt-3",
        actionType: "ai",
        label: "Reconciliation",
        icon: Layers,
        description: "Reconcile stakeholder comments against original findings; flag disputed items for reviewer adjudication",
        output: {
          kind: "annotation",
          label: "Reconciliation summary",
          items: [
            { label: "Findings acknowledged", value: "1 of 2", status: "ok" },
            { label: "Findings disputed", value: "1 — SoD self-approval interpretation", status: "warn" },
            { label: "Mgmt commentary", value: "Received and attached", status: "ok" },
          ],
        },
      },
    ],
  },
  {
    id: "write",
    ordinal: 6,
    phaseId: "report",
    title: "Report Composition",
    shortLabel: "Write",
    description: "Compose the audit narrative, executive summary, and recommendations.",
    agentRole:
      "Drafts the audit narrative from findings, evidence, and reconciled commentary; generates the executive summary and recommendations; validates citations and cross-references.",
    outcome: "Complete report draft with traceable citations across narrative, summary, and recommendations",
    icon: Pencil,
    substeps: [
      {
        id: "wri-1",
        actionType: "ai",
        label: "Narrative Draft",
        icon: FileText,
        description: "Draft the audit narrative from findings, evidence, scoring rationale, and reconciled commentary",
      },
      {
        id: "wri-2",
        actionType: "ai",
        label: "Executive Summary",
        icon: Sparkles,
        description: "Generate a concise executive summary of the audit conclusion, top findings, and recommendations",
      },
      {
        id: "wri-3",
        actionType: "ai",
        label: "Recommendations",
        icon: ListChecks,
        description: "Compose remediation recommendations with severity, owner, deadline, and acceptance criteria",
      },
      {
        id: "wri-4",
        actionType: "auto",
        label: "Citation Validation",
        icon: FileCheck,
        description: "Validate every citation in the report against the evidence package; flag any orphaned references",
      },
    ],
  },
  {
    id: "notes",
    ordinal: 7,
    phaseId: "report",
    title: "Workpaper Notes",
    shortLabel: "Notes",
    description: "Generate auditable workpaper notes and finalize annotations.",
    agentRole:
      "Generates workpaper notes from substep outputs, cross-references each note to evidence and applicable standards, and routes for auditor finalization.",
    outcome: "Audit-ready workpaper notes with full evidence and standards traceability",
    icon: StickyNote,
    substeps: [
      {
        id: "nte-1",
        actionType: "ai",
        label: "Notes Generation",
        icon: Pencil,
        description: "Generate workpaper notes from agentic substep outputs and reviewer disposition rationale",
      },
      {
        id: "nte-2",
        actionType: "auto",
        label: "Standards Cross-Ref",
        icon: Layers,
        description: "Cross-reference each note to source evidence and applicable audit standards (IIA, COSO, COBIT)",
      },
      {
        id: "nte-3",
        actionType: "hitl",
        label: "Auditor Finalization",
        icon: UserCheck,
        description: "Auditor reviews and finalizes annotations; adds judgmental commentary where warranted",
      },
    ],
  },
  {
    id: "submit",
    ordinal: 8,
    phaseId: "report",
    title: "Submission",
    shortLabel: "Submit",
    description: "Compile the final report package, run quality checks, and capture sign-off.",
    agentRole:
      "Compiles the final report package, runs automated quality checks (citation completeness, internal consistency), captures the audit director's sign-off, and locks the report version.",
    outcome: "Final report locked, signed off, and version-controlled",
    icon: Send,
    substeps: [
      {
        id: "sub-1",
        actionType: "ai",
        label: "Report Compilation",
        icon: FileText,
        description: "Compile the final report package: narrative, executive summary, recommendations, workpapers, and citations",
      },
      {
        id: "sub-2",
        actionType: "auto",
        label: "Quality Checks",
        icon: ClipboardCheck,
        description: "Run automated QA: citation completeness, terminology consistency, missing-section detection",
      },
      {
        id: "sub-3",
        actionType: "hitl",
        isHitlGate: true,
        label: "Director Sign-off",
        icon: UserCheck,
        description: "Audit Director reviews the final package and records sign-off: Approve / Modify / Reject",
      },
      {
        id: "sub-4",
        actionType: "auto",
        label: "Lock & Version",
        icon: Lock,
        description: "Lock the report; store immutable version with hash; mark distribution-ready",
      },
    ],
  },
  {
    id: "notify",
    ordinal: 9,
    phaseId: "communicate",
    title: "Distribution",
    shortLabel: "Notify",
    description: "Distribute the final report to stakeholders and confirm delivery.",
    agentRole:
      "Compiles the configured distribution list (audit committee, stakeholders, regulators), dispatches notifications via configured channels, and logs delivery confirmations.",
    outcome: "Report distributed to all configured recipients with delivery confirmation",
    icon: Bell,
    substeps: [
      {
        id: "nty-1",
        actionType: "auto",
        label: "Distribution List",
        icon: ListChecks,
        description: "Compile the distribution list: audit committee, executive owner, control owners, regulators (if applicable)",
      },
      {
        id: "nty-2",
        actionType: "auto",
        label: "Channel Dispatch",
        icon: Mail,
        description: "Send report and executive summary via configured channels (secure portal, email, audit-committee package)",
      },
      {
        id: "nty-3",
        actionType: "auto",
        label: "Delivery Confirmation",
        icon: CheckCircle2,
        description: "Log delivery confirmations and read receipts; surface non-delivery for follow-up",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Wizard config (used by the Plan Dialog's configuration strip)
// ─────────────────────────────────────────────────────────────────────────────

export const auditAssessmentConfigWizardSteps = [
  { id: "entity-selection", title: "Entity selection", description: "Select entities to include in this audit cycle." },
  { id: "scope-mapping", title: "Scope mapping", description: "Confirm risk-control mapping and audit standards alignment." },
  { id: "data-sources", title: "Connected data sources", description: "Confirm ERP / IAM / ticketing / BI sources are reachable." },
  { id: "scoring-model", title: "Scoring model", description: "Select the scoring model and confidence thresholds." },
  { id: "plan-view", title: "Plan view", description: "Review the audit plan with rationale and confirm." },
];

// ─────────────────────────────────────────────────────────────────────────────
// ArchetypeConfig (consumed by tprm-style runtime; the framework's
// SolutionDefinition wraps this and adds cycles/outcomes/run-context/artifact)
// ─────────────────────────────────────────────────────────────────────────────

export const auditAssessmentArchetypeConfig: ArchetypeConfig = {
  id: "audit-assessment",
  solutionLabel: "Audit Assessment",
  objectType: "Entity",
  objectTypePlural: "Entities",
  description:
    "End-to-end entity audit lifecycle: readiness → collect → score → review → comments → write → notes → submit → notify.",
  phases: auditAssessmentPhases,
  steps: auditAssessmentSteps,
  objectFields: auditAssessmentObjectFields,
  configWizardSteps: auditAssessmentConfigWizardSteps,
  trackingRules: [
    {
      trackId: "full-audit",
      label: "Full audit track",
      description: "Standard 9-step audit pipeline with reviewer disposition, stakeholder commentary, and director sign-off.",
    },
    {
      trackId: "continuous",
      label: "Continuous-monitoring track",
      description: "Light-touch path for low-risk entities — reviewer/comments/notes auto-pass when scoring is clean.",
    },
  ],
};

export const auditAssessmentStepIds = auditAssessmentSteps.map((s) => s.id);

// ─────────────────────────────────────────────────────────────────────────────
// Master entity list — 8 mock entities with diverse profiles
// ─────────────────────────────────────────────────────────────────────────────

export const masterEntityList: EntityRecord[] = [
  {
    id: "ENT-001",
    entityName: "North America Operations",
    entityType: "Business Unit",
    ownerExec: { name: "Daniel Reeves", title: "President, NA Ops", email: "dreeves@company.com" },
    riskTier: "High",
    inherentRisk: "High",
    residualRisk: "Medium",
    regulatoryExposure: ["SOX", "OSHA"],
    region: "North America",
    headcount: 4820,
    annualRevenue: "$2.1B",
    auditStatus: "Fieldwork",
    lastAuditDate: "FY24",
    nextAuditDue: "FY26",
    auditScope: ["Procurement", "Inventory", "Logistics", "HR onboarding"],
    conclusion: "Pending",
    priorFindings: [
      { id: "F-001", severity: "medium", area: "Procurement", summary: "Vendor onboarding SLA exceeded", status: "remediated" },
      { id: "F-002", severity: "low", area: "HR", summary: "Quarterly access review timing", status: "remediated" },
    ],
    track: "full-audit",
    notes: "Largest BU by revenue. Two open prior findings remediated; ready for FY26 cycle.",
  },
  {
    id: "ENT-002",
    entityName: "EMEA Sales",
    entityType: "Business Unit",
    ownerExec: { name: "Helena Schmitt", title: "VP, EMEA Sales", email: "hschmitt@company.com" },
    riskTier: "Medium",
    inherentRisk: "Medium",
    residualRisk: "Medium",
    regulatoryExposure: ["GDPR", "MAR"],
    region: "EMEA",
    headcount: 1340,
    annualRevenue: "$680M",
    auditStatus: "Reporting",
    lastAuditDate: "FY24",
    nextAuditDue: "FY26",
    auditScope: ["Revenue recognition", "Channel partner contracts", "GDPR data handling"],
    conclusion: "Pending",
    priorFindings: [
      { id: "F-101", severity: "high", area: "Revenue", summary: "Channel-partner side agreements not centrally tracked", status: "open" },
    ],
    track: "full-audit",
    notes: "Open high finding from FY24 carries forward; revenue scope amplified.",
  },
  {
    id: "ENT-003",
    entityName: "APAC Manufacturing",
    entityType: "Business Unit",
    ownerExec: { name: "Kenji Watanabe", title: "GM, APAC Mfg", email: "kwatanabe@company.com" },
    riskTier: "High",
    inherentRisk: "High",
    residualRisk: "High",
    regulatoryExposure: ["FCPA", "ISO 9001", "Local labor law"],
    region: "APAC",
    headcount: 2680,
    annualRevenue: "$910M",
    auditStatus: "Planning",
    lastAuditDate: "FY24",
    nextAuditDue: "FY26",
    auditScope: ["Procurement (anti-bribery)", "Inventory valuation", "Worker safety"],
    conclusion: "Pending",
    priorFindings: [
      { id: "F-201", severity: "high", area: "FCPA", summary: "Third-party intermediary documentation gaps", status: "open" },
      { id: "F-202", severity: "medium", area: "Inventory", summary: "Cycle-count cadence below standard", status: "remediated" },
    ],
    track: "full-audit",
    notes: "Elevated regulatory exposure. FCPA finding requires extended evidence collection.",
  },
  {
    id: "ENT-004",
    entityName: "Treasury Function",
    entityType: "Function",
    ownerExec: { name: "Priya Anand", title: "Group Treasurer", email: "panand@company.com" },
    riskTier: "Critical",
    inherentRisk: "Critical",
    residualRisk: "High",
    regulatoryExposure: ["SOX 404", "Dodd-Frank", "Basel III reporting"],
    region: "Global",
    headcount: 78,
    annualRevenue: "—",
    auditStatus: "Fieldwork",
    lastAuditDate: "FY24",
    nextAuditDue: "FY26",
    auditScope: ["Cash management", "Hedging", "Counterparty risk", "Bank reconciliation"],
    conclusion: "Pending",
    priorFindings: [
      { id: "F-301", severity: "high", area: "Hedging", summary: "Hedge effectiveness documentation incomplete", status: "remediated" },
    ],
    track: "full-audit",
    notes: "Material to financial reporting. Audit cycle synced with SOX 404 testing window.",
  },
  {
    id: "ENT-005",
    entityName: "IT Infrastructure",
    entityType: "Function",
    ownerExec: { name: "Marcus Reilly", title: "CIO", email: "mreilly@company.com" },
    riskTier: "High",
    inherentRisk: "Critical",
    residualRisk: "Medium",
    regulatoryExposure: ["SOX ITGC", "ISO 27001", "GDPR"],
    region: "Global",
    headcount: 430,
    annualRevenue: "—",
    auditStatus: "Fieldwork",
    lastAuditDate: "FY24",
    nextAuditDue: "FY26",
    auditScope: ["Access management", "Change management", "Backup & recovery", "Cybersecurity controls"],
    conclusion: "Pending",
    priorFindings: [],
    track: "full-audit",
    notes: "ITGC scope. No prior findings; strong control environment.",
  },
  {
    id: "ENT-006",
    entityName: "Marketing Department",
    entityType: "Function",
    ownerExec: { name: "Layla Brooks", title: "CMO", email: "lbrooks@company.com" },
    riskTier: "Low",
    inherentRisk: "Low",
    residualRisk: "Low",
    regulatoryExposure: ["FTC ad standards"],
    region: "Global",
    headcount: 220,
    annualRevenue: "—",
    auditStatus: "Closed",
    lastAuditDate: "FY24",
    nextAuditDue: "FY27",
    auditScope: ["Marketing spend approval", "Vendor selection"],
    conclusion: "Satisfactory",
    priorFindings: [],
    track: "continuous",
    notes: "Low-risk, light-touch continuous monitoring track. Closed in FY24 with no findings.",
  },
  {
    id: "ENT-007",
    entityName: "Vendor Operations",
    entityType: "Process",
    ownerExec: { name: "Owen Patel", title: "VP, Procurement", email: "opatel@company.com" },
    riskTier: "Medium",
    inherentRisk: "High",
    residualRisk: "Medium",
    regulatoryExposure: ["FCPA", "Modern Slavery Act"],
    region: "Global",
    headcount: 165,
    annualRevenue: "—",
    auditStatus: "Not started",
    lastAuditDate: "FY23",
    nextAuditDue: "FY26",
    auditScope: ["Vendor onboarding", "Sanctions screening", "Subprocessor management"],
    conclusion: "Pending",
    priorFindings: [
      { id: "F-501", severity: "medium", area: "Sanctions", summary: "Quarterly sanctions re-screen not consistently performed", status: "remediated" },
    ],
    track: "full-audit",
    notes: "Cross-functional process; coordinates with TPRM for vendor data.",
  },
  {
    id: "ENT-008",
    entityName: "Legal & Compliance",
    entityType: "Function",
    ownerExec: { name: "Rebecca Yi", title: "GC & CCO", email: "ryi@company.com" },
    riskTier: "Medium",
    inherentRisk: "Medium",
    residualRisk: "Low",
    regulatoryExposure: ["Multiple — depends on filings"],
    region: "Global",
    headcount: 92,
    annualRevenue: "—",
    auditStatus: "Re-audit pending",
    lastAuditDate: "FY24",
    nextAuditDue: "FY26",
    auditScope: ["Litigation tracking", "Regulatory filings", "Whistleblower process"],
    conclusion: "Re-audit required",
    priorFindings: [
      { id: "F-701", severity: "high", area: "Whistleblower", summary: "Hotline disposition tracking incomplete", status: "open" },
    ],
    track: "full-audit",
    notes: "Re-audit triggered by FY24 high finding (whistleblower hotline tracking). Targeted re-audit of process areas only.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Block rules — universal pattern for workflow stoppages.
// Mirrors SOX canon's `fieldworkBlockRules` (WorkflowSession.tsx ≈ 2397). Each
// rule causes the named entity's step to enter `blocked` status when the agent
// reaches it. The Hub's Action Required panel surfaces the block; the focus
// view renders the substep's `inlineAffordances` so the user can resolve inline.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditAssessmentBlockRule {
  entityId: string;
  blockAtStep: string;
  blockAtSubstep?: string;
  title: string;
  description: string;
  severity: "high" | "medium";
}

export const auditAssessmentBlockRules: AuditAssessmentBlockRule[] = [
  {
    entityId: "ENT-003",
    blockAtStep: "collect",
    blockAtSubstep: "col-3",
    title: "FCPA Documentation Pending",
    description:
      "Third-party intermediary documentation gaps from FY24 require expanded evidence collection. The PBC owner must provide updated agency agreements and due-diligence records before scoring can proceed.",
    severity: "high",
  },
  {
    entityId: "ENT-007",
    blockAtStep: "collect",
    blockAtSubstep: "col-2",
    title: "Sanctions Re-screen Evidence Required",
    description:
      "Quarterly sanctions re-screen evidence not on file. The agent's automated pull from the procurement system returned partial results — upload directly or request access expansion.",
    severity: "medium",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Run-status type + simulator
// ─────────────────────────────────────────────────────────────────────────────

export interface EntityRunStatus {
  entityId: string;
  entityName: string;
  riskTier: RiskRating;
  track: ObjectTrack;
  steps: Record<string, StepRunStatus>;
  overallProgress: number;
  /** True when continuous-monitoring track has fired a re-audit signal. */
  fired: boolean;
}

const initialStepStatuses = (): Record<string, StepRunStatus> => {
  const map: Record<string, StepRunStatus> = {};
  auditAssessmentStepIds.forEach((id) => {
    map[id] = "pending";
  });
  return map;
};

export function seedEntityRunStatus(entity: EntityRecord): EntityRunStatus {
  return {
    entityId: entity.id,
    entityName: entity.entityName,
    riskTier: entity.riskTier,
    track: entity.track,
    steps: initialStepStatuses(),
    overallProgress: 0,
    fired: false,
  };
}

/**
 * Auto-tick simulator. Mirrors `tickVendorStatuses` semantics:
 *  - Steps advance left-to-right, one substep-aware tick at a time.
 *  - `continuous` track skips REVIEW + COMMENTS + NOTES (auto-passes them).
 *  - Steps with HITL gates pause in `waiting` until resolvedSet contains
 *    `${entityId}:${stepId}`.
 *  - Block rules (`auditAssessmentBlockRules`) cause the matching step to enter
 *    `blocked` status; resolution is via the same `resolvedSet` (clicking an
 *    inline-affordance button on the focus view marks the block resolved).
 */
export function tickEntityStatuses(
  prev: EntityRunStatus[],
  resolvedSet: Set<string>
): EntityRunStatus[] | null {
  let anyChange = false;
  const next = prev.map((e) => {
    const steps = { ...e.steps };
    let advanced = false;
    for (const stepId of auditAssessmentStepIds) {
      if (steps[stepId] === "complete" || steps[stepId] === "skipped") continue;
      const stepDef = auditAssessmentSteps.find((s) => s.id === stepId)!;
      const idx = auditAssessmentStepIds.indexOf(stepId);
      const prevId = idx > 0 ? auditAssessmentStepIds[idx - 1] : null;
      if (prevId && steps[prevId] !== "complete" && steps[prevId] !== "skipped") break;

      // Continuous-monitoring track skips REVIEW / COMMENTS / NOTES.
      const isAutoTrack = e.track === "continuous";
      if (isAutoTrack && (stepId === "review" || stepId === "comments" || stepId === "notes")) {
        steps[stepId] = "skipped";
        advanced = true;
        anyChange = true;
        continue;
      }

      const hitlStep = stepDef.substeps.some((s) => s.isHitlGate);
      const blockKey = `${e.entityId}:${stepId}`;
      const blockRule = auditAssessmentBlockRules.find(
        (r) => r.entityId === e.entityId && r.blockAtStep === stepId
      );

      if (steps[stepId] === "pending") {
        // Block rule fires before HITL — represents external dependencies that
        // halt the agent before any human review can take place.
        if (blockRule && !resolvedSet.has(blockKey)) {
          steps[stepId] = "blocked";
          advanced = true;
          anyChange = true;
          break;
        }
        if (hitlStep && !isAutoTrack && !resolvedSet.has(blockKey)) {
          steps[stepId] = "waiting";
          advanced = true;
          anyChange = true;
          break;
        }
        steps[stepId] = "running";
        advanced = true;
        anyChange = true;
        break;
      }

      if (steps[stepId] === "blocked") {
        if (resolvedSet.has(blockKey)) {
          steps[stepId] = "running";
          advanced = true;
          anyChange = true;
        }
        break;
      }

      if (steps[stepId] === "waiting") {
        if (resolvedSet.has(blockKey)) {
          steps[stepId] = "running";
          advanced = true;
          anyChange = true;
        }
        break;
      }

      if (steps[stepId] === "running") {
        const speed = isAutoTrack ? 0.7 : 0.32;
        if (Math.random() < speed) {
          steps[stepId] = "complete";
          advanced = true;
          anyChange = true;
        }
        break;
      }
    }

    if (!advanced) return e;

    const completed = auditAssessmentStepIds.filter(
      (s) => steps[s] === "complete" || steps[s] === "skipped"
    ).length;
    const running = auditAssessmentStepIds.filter(
      (s) => steps[s] === "running" || steps[s] === "waiting" || steps[s] === "blocked"
    ).length;
    const overallProgress = Math.round(
      ((completed * 100) + (running * 40)) / auditAssessmentStepIds.length
    );
    return { ...e, steps, overallProgress };
  });
  return anyChange ? next : null;
}
