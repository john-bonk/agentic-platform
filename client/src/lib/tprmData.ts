import {
  Inbox,
  GitBranch,
  Globe,
  FileSearch,
  Gauge,
  ClipboardCheck,
  UserCheck,
  AlertTriangle,
  Activity,
} from "lucide-react";
import type {
  ArchetypeConfig,
  ArchetypeStep,
  ArchetypePhase,
  ArchetypeObjectFieldDef,
  ObjectTrack,
  StepRunStatus,
} from "./workflowArchetype";

export type VendorTier = "Tier 1" | "Tier 2" | "Tier 3";
export type VendorType = "Software" | "Infrastructure" | "Services" | "Data" | "Other";
export type DataAccessScope = "None" | "Internal" | "Confidential" | "Regulated";
export type SystemCriticality = "Low" | "Medium" | "High" | "Critical";
export type AssessmentStatus =
  | "Not started"
  | "In progress"
  | "Under review"
  | "Complete"
  | "Exception open";
export type RiskTreatment = "Accept" | "Mitigate" | "Transfer" | "Avoid" | "Pending";

export interface VendorDocument {
  type: string;
  date: string;
  expiry?: string;
  status: "current" | "expired" | "missing";
}

export interface VendorOutstandingRequest {
  type: string;
  status: "pending" | "submitted" | "overdue";
  due: string;
}

export interface VendorMonitoringEvent {
  id: string;
  timestamp: string;
  source: string;
  severity: "info" | "warning" | "critical";
  description: string;
  triggered: boolean;
}

export interface VendorRecord {
  id: string;
  vendorName: string;
  legalEntity: string;
  vendorType: VendorType;
  primaryContact: { name: string; email: string };
  riskTier: VendorTier;
  dataAccess: DataAccessScope;
  criticality: SystemCriticality;
  regulatoryExposure: string[];
  spendCategory: string;
  annualContractValue: string;
  assessmentStatus: AssessmentStatus;
  lastAssessmentDate: string;
  nextAssessmentDue: string;
  riskScore: number;
  riskTreatment: RiskTreatment;
  intelSources: string[];
  documents: VendorDocument[];
  outstandingRequests: VendorOutstandingRequest[];
  exceptionRecords: { open: number; closed: number };
  track: ObjectTrack;
  monitoring: VendorMonitoringEvent[];
  notes: string;
}

export const tprmPhases: ArchetypePhase[] = [
  { id: "intake-profile", ordinal: 1, label: "Intake & Profile", description: "Capture vendor and assign initial risk tier" },
  { id: "assess", ordinal: 2, label: "Assess", description: "Gather intelligence, analyze documents, score risk" },
  { id: "decide-act", ordinal: 3, label: "Decide & Act", description: "Triage, decide treatment, manage remediation" },
  { id: "monitor", ordinal: 4, label: "Monitor", description: "Continuous signal monitoring and re-assessment" },
];

export const tprmObjectFields: ArchetypeObjectFieldDef[] = [
  { id: "id", label: "Vendor ID", group: "Identity", kind: "text" },
  { id: "vendorName", label: "Vendor name", group: "Identity", kind: "text" },
  { id: "legalEntity", label: "Legal entity", group: "Identity", kind: "text" },
  { id: "vendorType", label: "Vendor type", group: "Identity", kind: "enum" },
  { id: "primaryContact", label: "Primary contact", group: "Identity", kind: "text" },
  { id: "riskTier", label: "Risk tier", group: "Classification", kind: "enum" },
  { id: "dataAccess", label: "Data access scope", group: "Classification", kind: "enum" },
  { id: "criticality", label: "System criticality", group: "Classification", kind: "enum" },
  { id: "regulatoryExposure", label: "Regulatory exposure", group: "Classification", kind: "list" },
  { id: "spendCategory", label: "Spend category", group: "Classification", kind: "text" },
  { id: "annualContractValue", label: "Annual contract value", group: "Classification", kind: "text" },
  { id: "assessmentStatus", label: "Assessment status", group: "Status", kind: "enum" },
  { id: "lastAssessmentDate", label: "Last assessment", group: "Status", kind: "date" },
  { id: "nextAssessmentDue", label: "Next assessment due", group: "Status", kind: "date" },
  { id: "riskScore", label: "Risk score (0–100)", group: "Status", kind: "number" },
  { id: "riskTreatment", label: "Risk treatment decision", group: "Status", kind: "enum" },
  { id: "intelSources", label: "Outside-in intel sources", group: "Connected data", kind: "list" },
  { id: "documents", label: "Documents received", group: "Connected data", kind: "list" },
  { id: "outstandingRequests", label: "Outstanding document requests", group: "Connected data", kind: "list" },
  { id: "exceptionRecords", label: "Exception records", group: "Connected data", kind: "text" },
];

export const tprmSteps: ArchetypeStep[] = [
  {
    id: "vendor-intake",
    ordinal: 1,
    phaseId: "intake-profile",
    title: "Vendor Intake",
    shortLabel: "Intake",
    description:
      "A new vendor record is created from a procurement request, manual entry, or inventory discovery.",
    agentRole:
      "Normalizes intake from any source: MCP, API, CSV, or manual entry. Surfaces shadow IT and unreviewed vendors from procurement data. Creates the vendor record without requiring manual data entry.",
    outcome: "Complete vendor inventory with no manual data entry",
    icon: Inbox,
    substeps: [
      {
        id: "intake-1",
        actionType: "auto",
        description: "Ingest vendor record from source (procurement system, MCP feed, manual CSV, or API)",
        output: {
          kind: "list",
          label: "Source",
          items: [
            { label: "Source system", value: "Coupa procurement" },
            { label: "Source record", value: "REQ-2026-04-118" },
            { label: "Submitted by", value: "Procurement team" },
          ],
        },
      },
      {
        id: "intake-2",
        actionType: "ai",
        description: "Deduplicate against existing vendor inventory and surface potential shadow IT matches",
        output: {
          kind: "annotation",
          label: "Dedup result",
          items: [
            { label: "Inventory matches", value: "0 confirmed", status: "ok" },
            { label: "Shadow IT signals", value: "1 SaaS spend in expense reports", status: "warn" },
          ],
        },
      },
      {
        id: "intake-3",
        actionType: "auto",
        description: "Enrich record with available procurement metadata (spend, contract date, category)",
      },
      {
        id: "intake-4",
        actionType: "ai",
        description: "Identify any missing required fields and flag for completion",
      },
      {
        id: "intake-5",
        actionType: "auto",
        description: "Create Vendor object in system with normalized schema",
      },
    ],
  },
  {
    id: "risk-tiering",
    ordinal: 2,
    phaseId: "intake-profile",
    title: "Risk Tiering",
    shortLabel: "Tier",
    description:
      "Assign a risk tier based on data access, system criticality, regulatory scope, spend, etc.",
    agentRole:
      "Applies customer-configured tiering rules across data sensitivity, access scope, criticality, spend, etc. Re-tiers automatically on material vendor changes.",
    outcome: "Assessment depth matched to actual risk. Low tier/criticality vendors fully automated.",
    icon: GitBranch,
    substeps: [
      {
        id: "tier-1",
        actionType: "ai",
        description:
          "Evaluate vendor against configured tiering dimensions: data access scope, system criticality, regulatory exposure, spend threshold, geographic risk",
        output: {
          kind: "annotation",
          label: "Dimension evaluation",
          items: [
            { label: "Data access", value: "Internal", status: "ok" },
            { label: "System criticality", value: "Low", status: "ok" },
            { label: "Regulatory exposure", value: "None", status: "ok" },
            { label: "Annual spend", value: "$24K", status: "ok" },
            { label: "Geographic risk", value: "US-only", status: "ok" },
          ],
        },
      },
      {
        id: "tier-2",
        actionType: "ai",
        description: "Apply tiering ruleset and assign Tier 1 / Tier 2 / Tier 3 risk classification",
      },
      {
        id: "tier-3",
        actionType: "auto",
        description: "Log tiering rationale with dimension-by-dimension breakdown",
      },
      {
        id: "tier-4",
        actionType: "auto",
        description:
          "Check for trigger conditions that would require re-tiering (new data access, contract change, acquisition signal)",
      },
      {
        id: "tier-5",
        actionType: "auto",
        description:
          "Set workflow routing — Tier 1 routes to automated track; Tier 2/3 routes to human review track",
      },
    ],
  },
  {
    id: "outside-in",
    ordinal: 3,
    phaseId: "assess",
    title: "Outside-In Intelligence",
    shortLabel: "Outside-In",
    description: "Gather public and third-party intelligence on the vendor without contacting them.",
    agentRole:
      "Dispatches parallel retrieval across sanctions lists, financial data, cyber risk platforms, adverse news, and trust centers. Reconciles conflicts. Flags absence of data as a signal.",
    outcome: "Full outside-in risk picture assembled without any vendor interaction",
    icon: Globe,
    substeps: [
      {
        id: "out-1",
        actionType: "auto",
        description: "Query sanctions and watchlist databases (OFAC, EU, UN)",
        output: {
          kind: "list",
          label: "Sanctions check",
          items: [
            { label: "OFAC", value: "Clear", status: "ok" },
            { label: "EU consolidated", value: "Clear", status: "ok" },
            { label: "UN", value: "Clear", status: "ok" },
          ],
        },
      },
      {
        id: "out-2",
        actionType: "auto",
        description: "Retrieve cyber risk posture score from configured cyber risk platform",
        output: {
          kind: "score",
          label: "BitSight",
          scoreValue: 740,
          scoreLabel: "Advanced posture",
        },
      },
      {
        id: "out-3",
        actionType: "auto",
        description: "Pull adverse news and media signals from configured news feed",
      },
      {
        id: "out-4",
        actionType: "auto",
        description: "Check financial health indicators from financial data provider if configured",
      },
      {
        id: "out-5",
        actionType: "auto",
        description: "Retrieve public trust center documents (SOC 2, ISO certifications, published policies)",
      },
      {
        id: "out-6",
        actionType: "ai",
        description: "Reconcile conflicting signals across sources and flag data absence as a risk indicator",
      },
      {
        id: "out-7",
        actionType: "ai",
        description: "Produce structured outside-in risk summary with source attribution",
        output: {
          kind: "narrative",
          label: "Outside-in summary",
          body:
            "All public signals indicate a stable vendor: no sanctions hits, advanced cyber posture, no adverse news in the last 18 months, and a current SOC 2 Type II in the public trust center.",
        },
      },
    ],
  },
  {
    id: "doc-analysis",
    ordinal: 4,
    phaseId: "assess",
    title: "Document Analysis",
    shortLabel: "Docs",
    description:
      "Collect and review vendor-provided security artifacts against internal control frameworks or policies/procedures.",
    agentRole:
      "Extracts findings from SOC2, ISO certs, pen test reports, policies, and contracts. Maps evidence to control framework. Identifies gaps, expired certs, scope limitations. Requests missing documents.",
    outcome: "Evidence-backed control coverage mapped to framework, gaps surfaced with rationale",
    icon: FileSearch,
    substeps: [
      {
        id: "doc-1",
        actionType: "auto",
        description: "Ingest available vendor-provided documents (SOC 2, ISO cert, pen test, DPA, MSA, security policy)",
      },
      {
        id: "doc-2",
        actionType: "ai",
        description: "Extract key findings, scope statements, and control assertions from each document",
      },
      {
        id: "doc-3",
        actionType: "ai",
        description: "Map extracted findings to internal control framework or policy requirements",
        output: {
          kind: "annotation",
          label: "Framework coverage map",
          items: [
            { label: "Access control", value: "Covered (SOC 2 CC6.1)", status: "ok" },
            { label: "Encryption at rest", value: "Covered (SOC 2 CC6.7)", status: "ok" },
            { label: "Incident response", value: "Covered (SOC 2 CC7.4)", status: "ok" },
            { label: "Subprocessor mgmt", value: "Gap — DPA missing list", status: "gap" },
          ],
        },
      },
      {
        id: "doc-4",
        actionType: "ai",
        description: "Identify coverage gaps, expired certificates, and scope exclusions",
      },
      {
        id: "doc-5",
        actionType: "ai",
        description: "Annotate each control framework requirement with: covered / gap / expired / out-of-scope",
      },
      {
        id: "doc-6",
        actionType: "auto",
        description: "For documents not yet received: generate structured document request and dispatch via secure vendor portal",
      },
      {
        id: "doc-7",
        actionType: "hitl",
        isHitlGate: true,
        description: "If critical documents missing after request window: surface for human escalation decision",
      },
    ],
  },
  {
    id: "risk-scoring",
    ordinal: 5,
    phaseId: "assess",
    title: "Risk Scoring",
    shortLabel: "Score",
    description: "Synthesize all evidence into a score and links to traceable evidence.",
    agentRole:
      "Generates a score and links to traceable evidence. Produces structured, audit-ready output the reviewer can interrogate finding by finding.",
    outcome: "Structured, auditable risk score and analysis with traceable evidence",
    icon: Gauge,
    substeps: [
      {
        id: "score-1",
        actionType: "ai",
        description:
          "Aggregate outside-in intelligence signals into quantitative risk dimensions (cyber posture, financial stability, news/adverse events, regulatory exposure)",
      },
      {
        id: "score-2",
        actionType: "ai",
        description:
          "Aggregate document analysis findings into control coverage dimensions (security controls, data protection, operational resilience, compliance)",
      },
      {
        id: "score-3",
        actionType: "ai",
        description: "Compute weighted composite risk score using configured scoring model",
        output: {
          kind: "score",
          label: "Composite risk score",
          scoreValue: 22,
          scoreLabel: "Low risk (Tier 1)",
        },
      },
      {
        id: "score-4",
        actionType: "ai",
        description: "Produce structured risk scorecard: dimension scores, confidence levels, supporting evidence links, key findings",
      },
      {
        id: "score-5",
        actionType: "ai",
        description: "Generate audit-ready narrative summary: score rationale, top risk drivers, finding-by-finding breakdown",
      },
      {
        id: "score-6",
        actionType: "auto",
        description: "Log full scoring model inputs, weights, and outputs for auditability",
      },
    ],
  },
  {
    id: "triage",
    ordinal: 6,
    phaseId: "decide-act",
    title: "Triage & Routing",
    shortLabel: "Triage",
    description: "Approve low-risk assessments or route high-risk and ambiguous cases for human review.",
    agentRole:
      "Auto-closes high-confidence Tier 1 assessments within defined thresholds. Routes Tier 2 and Tier 3 cases to the appropriate reviewer with a structured summary and suggested disposition.",
    outcome: "Human effort reserved for judgment calls, not routine approvals",
    icon: ClipboardCheck,
    substeps: [
      {
        id: "tri-1",
        actionType: "ai",
        description: "Evaluate risk score and confidence level against auto-close thresholds",
      },
      {
        id: "tri-2",
        actionType: "auto",
        description: "For Tier 1 vendors meeting auto-close criteria: mark assessment complete, generate closure summary, update vendor record",
      },
      {
        id: "tri-3",
        actionType: "ai",
        description: "For all other vendors: prepare structured reviewer brief with score breakdown, key findings, confidence level, and suggested disposition",
      },
      {
        id: "tri-4",
        actionType: "auto",
        description: "Route to assigned reviewer based on vendor tier, risk domain, and configured routing rules",
      },
      {
        id: "tri-5",
        actionType: "hitl",
        isHitlGate: true,
        description: "Reviewer receives structured brief and confirms routing or overrides disposition",
      },
    ],
  },
  {
    id: "human-review",
    ordinal: 7,
    phaseId: "decide-act",
    title: "Human Review",
    shortLabel: "Review",
    description: "Apply judgment to escalated assessments and make a documented risk treatment decision.",
    agentRole:
      "Presents reviewer with score breakdown, key findings, confidence level, suggested disposition. Captures the reviewer's decision and rationale. Updates the vendor record accordingly.",
    outcome: "Defensible risk decision on record with full rationale",
    icon: UserCheck,
    substeps: [
      {
        id: "hr-1",
        actionType: "ai",
        description: "Render reviewer brief: score, dimension breakdown, top findings, suggested disposition, comparable vendors for reference",
      },
      {
        id: "hr-2",
        actionType: "hitl",
        isHitlGate: true,
        description: "Reviewer reviews brief and makes risk treatment decision: Accept / Mitigate / Transfer / Avoid",
      },
      {
        id: "hr-3",
        actionType: "hitl",
        description: "Reviewer documents rationale for decision (free text, required)",
      },
      {
        id: "hr-4",
        actionType: "auto",
        description: "Capture decision, rationale, reviewer identity, and timestamp in vendor record and audit trail",
      },
      {
        id: "hr-5",
        actionType: "auto",
        description: "Update vendor risk status, treatment decision, and next review date in system",
      },
    ],
  },
  {
    id: "exception",
    ordinal: 8,
    phaseId: "decide-act",
    title: "Exception & Remediation",
    shortLabel: "Remediate",
    description: "Track identified gaps to resolution — assign owners, notify vendor, validate the fix.",
    agentRole:
      "Drafts exception records from findings. Suggests owners and severity. Generates vendor-facing remediation requests. Tracks vendor responses and validates evidence of fix.",
    outcome: "Risk lifecycle owned end-to-end in Optro from finding to verified fix",
    icon: AlertTriangle,
    substeps: [
      {
        id: "exc-1",
        actionType: "ai",
        description: "Generate structured exception records for each identified gap or finding (description, severity, owner, deadline)",
      },
      {
        id: "exc-2",
        actionType: "hitl",
        isHitlGate: true,
        description: "Reviewer confirms exception records and assigns owners",
      },
      {
        id: "exc-3",
        actionType: "auto",
        description: "Dispatch vendor-facing remediation request via configured channel",
      },
      {
        id: "exc-4",
        actionType: "auto",
        description: "Track vendor response status and monitor for evidence of remediation submission",
      },
      {
        id: "exc-5",
        actionType: "ai",
        description: "Validate submitted remediation evidence against the original finding requirement",
      },
      {
        id: "exc-6",
        actionType: "auto",
        description: "On validated closure: update exception record, trigger partial or full re-assessment as configured",
      },
      {
        id: "exc-7",
        actionType: "hitl",
        isHitlGate: true,
        description: "On disputed or inadequate remediation: surface for human escalation",
      },
    ],
  },
  {
    id: "monitoring",
    ordinal: 9,
    phaseId: "monitor",
    title: "Continuous Monitoring",
    shortLabel: "Monitor",
    description:
      "Maintain an always-current vendor risk profile by reacting to new signals and contract renewals.",
    agentRole:
      "Monitors trigger events: adverse news, cert expirations, breach disclosures, ownership changes, contract renewal dates. Re-scores and re-tiers automatically. Alerts the TPRM manager when action is required.",
    outcome: "Always-current vendor risk profile; contract renewals informed by live posture",
    icon: Activity,
    substeps: [
      {
        id: "mon-1",
        actionType: "auto",
        description: "Continuously poll configured signal sources for vendor-specific trigger events",
      },
      {
        id: "mon-2",
        actionType: "ai",
        description: "Evaluate each signal for materiality: re-tier, partial re-assessment, or full re-assessment?",
      },
      {
        id: "mon-3",
        actionType: "auto",
        description: "On immaterial signal: log to vendor record and update risk profile metadata",
      },
      {
        id: "mon-4",
        actionType: "auto",
        description:
          "On material signal (cert expiry, breach disclosure, adverse news threshold): trigger targeted re-assessment of relevant workflow steps",
      },
      {
        id: "mon-5",
        actionType: "ai",
        description: "On contract renewal approaching: generate renewal readiness summary and flag for review",
      },
      {
        id: "mon-6",
        actionType: "hitl",
        isHitlGate: true,
        description: "Alert TPRM manager with structured briefing on what changed, why it matters, and recommended action",
      },
      {
        id: "mon-7",
        actionType: "auto",
        description: "Log all monitoring events, evaluations, and triggered actions to vendor audit trail",
      },
    ],
  },
];

export const tprmConfigWizardSteps = [
  {
    id: "vendor-selection",
    title: "Vendor selection",
    description: "Select vendors to include in this assessment run.",
  },
  {
    id: "connected-systems",
    title: "Connected data systems",
    description: "Configure outside-in intel sources, document storage, and vendor portal settings.",
  },
  {
    id: "framework-mapping",
    title: "Framework mapping",
    description: "Select the internal control framework and configure dimension weights.",
  },
  {
    id: "tiering-rules",
    title: "Tiering rules",
    description: "Confirm tiering ruleset and Tier 1 auto-close thresholds.",
  },
  {
    id: "plan-view",
    title: "Plan view",
    description: "Review the execution plan with rationale and confirm.",
  },
];

export const tprmArchetypeConfig: ArchetypeConfig = {
  id: "tprm",
  solutionLabel: "Third-Party Risk Management",
  objectType: "Vendor",
  objectTypePlural: "Vendors",
  description:
    "End-to-end vendor risk lifecycle: intake → tier → assess → decide → remediate → monitor.",
  phases: tprmPhases,
  steps: tprmSteps,
  objectFields: tprmObjectFields,
  configWizardSteps: tprmConfigWizardSteps,
  trackingRules: [
    {
      trackId: "automated",
      label: "Automated track",
      description: "Tier 1 vendors run end-to-end with no human gates and auto-close at triage.",
    },
    {
      trackId: "human-review",
      label: "Human-review track",
      description: "Tier 2 and Tier 3 vendors pause for reviewer judgment at the human review step.",
    },
  ],
};

export const tprmStepIds = tprmSteps.map((s) => s.id);

export const masterVendorList: VendorRecord[] = [
  {
    id: "VEN-001",
    vendorName: "Acme Marketing Forms",
    legalEntity: "Acme Forms Inc.",
    vendorType: "Software",
    primaryContact: { name: "Jenna Park", email: "jenna@acmeforms.com" },
    riskTier: "Tier 1",
    dataAccess: "Internal",
    criticality: "Low",
    regulatoryExposure: [],
    spendCategory: "Marketing tooling",
    annualContractValue: "$15K–$30K",
    assessmentStatus: "Not started",
    lastAssessmentDate: "—",
    nextAssessmentDue: "Q3 2026",
    riskScore: 22,
    riskTreatment: "Pending",
    intelSources: ["BitSight", "Adverse news"],
    documents: [
      { type: "SOC 2 Type II", date: "2025-11", expiry: "2026-11", status: "current" },
    ],
    outstandingRequests: [],
    exceptionRecords: { open: 0, closed: 0 },
    track: "automated",
    monitoring: [],
    notes: "Lightweight web forms vendor. Limited exposure; eligible for auto-close path.",
  },
  {
    id: "VEN-002",
    vendorName: "PixelHost Images",
    legalEntity: "PixelHost LLC",
    vendorType: "Infrastructure",
    primaryContact: { name: "Marcus Lee", email: "marcus@pixelhost.io" },
    riskTier: "Tier 1",
    dataAccess: "None",
    criticality: "Low",
    regulatoryExposure: [],
    spendCategory: "CDN / static assets",
    annualContractValue: "$8K–$12K",
    assessmentStatus: "Not started",
    lastAssessmentDate: "—",
    nextAssessmentDue: "Q3 2026",
    riskScore: 18,
    riskTreatment: "Pending",
    intelSources: ["BitSight", "Adverse news"],
    documents: [
      { type: "SOC 2 Type II", date: "2025-09", expiry: "2026-09", status: "current" },
    ],
    outstandingRequests: [],
    exceptionRecords: { open: 0, closed: 0 },
    track: "automated",
    monitoring: [],
    notes: "Public asset CDN. No customer data ever transits. Auto-close eligible.",
  },
  {
    id: "VEN-003",
    vendorName: "Nightowl Schedulers",
    legalEntity: "Nightowl Software Ltd.",
    vendorType: "Software",
    primaryContact: { name: "Priya Subramanian", email: "priya@nightowl.app" },
    riskTier: "Tier 1",
    dataAccess: "Internal",
    criticality: "Low",
    regulatoryExposure: [],
    spendCategory: "Scheduling add-on",
    annualContractValue: "$24K",
    assessmentStatus: "Not started",
    lastAssessmentDate: "—",
    nextAssessmentDue: "Q3 2026",
    riskScore: 28,
    riskTreatment: "Pending",
    intelSources: ["BitSight"],
    documents: [
      { type: "Security Whitepaper", date: "2026-01", status: "current" },
    ],
    outstandingRequests: [],
    exceptionRecords: { open: 0, closed: 0 },
    track: "automated",
    monitoring: [],
    notes: "Calendar scheduling tool. Internal data only. Auto-close eligible.",
  },
  {
    id: "VEN-004",
    vendorName: "DataBridge Analytics",
    legalEntity: "DataBridge Analytics Corp.",
    vendorType: "Data",
    primaryContact: { name: "Rachel Kim", email: "rkim@databridge.com" },
    riskTier: "Tier 2",
    dataAccess: "Confidential",
    criticality: "Medium",
    regulatoryExposure: ["SOC 2", "GDPR"],
    spendCategory: "Analytics platform",
    annualContractValue: "$180K",
    assessmentStatus: "In progress",
    lastAssessmentDate: "2025-04",
    nextAssessmentDue: "2026-04",
    riskScore: 54,
    riskTreatment: "Pending",
    intelSources: ["BitSight", "SecurityScorecard", "Adverse news"],
    documents: [
      { type: "SOC 2 Type II", date: "2025-08", expiry: "2026-08", status: "current" },
      { type: "Pen test summary", date: "2025-12", status: "current" },
      { type: "DPA", date: "2024-03", status: "current" },
    ],
    outstandingRequests: [
      { type: "Subprocessor list", status: "submitted", due: "in 5 days" },
    ],
    exceptionRecords: { open: 1, closed: 2 },
    track: "human-review",
    monitoring: [],
    notes: "Handles confidential analytics data. Pending subprocessor list to validate scope.",
  },
  {
    id: "VEN-005",
    vendorName: "Stratus CRM",
    legalEntity: "Stratus Cloud, Inc.",
    vendorType: "Software",
    primaryContact: { name: "Jordan Reyes", email: "jordan@stratus.io" },
    riskTier: "Tier 2",
    dataAccess: "Regulated",
    criticality: "High",
    regulatoryExposure: ["SOC 2", "GDPR", "HIPAA"],
    spendCategory: "CRM",
    annualContractValue: "$320K",
    assessmentStatus: "Under review",
    lastAssessmentDate: "2025-05",
    nextAssessmentDue: "2026-05",
    riskScore: 61,
    riskTreatment: "Pending",
    intelSources: ["BitSight", "SecurityScorecard"],
    documents: [
      { type: "SOC 2 Type II", date: "2025-07", expiry: "2026-07", status: "current" },
      { type: "ISO 27001", date: "2024-11", expiry: "2027-11", status: "current" },
      { type: "DPA", date: "2024-08", status: "current" },
    ],
    outstandingRequests: [],
    exceptionRecords: { open: 2, closed: 4 },
    track: "human-review",
    monitoring: [],
    notes: "Stores PHI for one BU. Two open exceptions on access reviews.",
  },
  {
    id: "VEN-006",
    vendorName: "SilverPay Processing",
    legalEntity: "SilverPay Services LLC",
    vendorType: "Services",
    primaryContact: { name: "Tomás Alvarez", email: "tomas@silverpay.com" },
    riskTier: "Tier 2",
    dataAccess: "Regulated",
    criticality: "High",
    regulatoryExposure: ["SOC 2", "PCI-DSS"],
    spendCategory: "Payment processing",
    annualContractValue: "$420K",
    assessmentStatus: "In progress",
    lastAssessmentDate: "2025-06",
    nextAssessmentDue: "2026-06",
    riskScore: 58,
    riskTreatment: "Pending",
    intelSources: ["BitSight", "Black Kite", "Adverse news"],
    documents: [
      { type: "SOC 2 Type II", date: "2025-09", expiry: "2026-09", status: "current" },
      { type: "PCI-DSS AOC", date: "2025-10", expiry: "2026-10", status: "current" },
    ],
    outstandingRequests: [
      { type: "Pen test (full report)", status: "pending", due: "in 14 days" },
    ],
    exceptionRecords: { open: 1, closed: 1 },
    track: "human-review",
    monitoring: [],
    notes: "Card processor. Awaiting full pen test report before scoring concludes.",
  },
  {
    id: "VEN-007",
    vendorName: "Quantum Cloud Infrastructure",
    legalEntity: "Quantum Cloud, Inc.",
    vendorType: "Infrastructure",
    primaryContact: { name: "Aisha Al-Sayed", email: "aisha@quantumcloud.com" },
    riskTier: "Tier 3",
    dataAccess: "Regulated",
    criticality: "Critical",
    regulatoryExposure: ["SOC 2", "ISO 27001", "GDPR", "HIPAA"],
    spendCategory: "Cloud hosting",
    annualContractValue: "$1.4M",
    assessmentStatus: "Exception open",
    lastAssessmentDate: "2025-02",
    nextAssessmentDue: "2026-02",
    riskScore: 78,
    riskTreatment: "Mitigate",
    intelSources: ["BitSight", "SecurityScorecard", "Black Kite", "Adverse news"],
    documents: [
      { type: "SOC 2 Type II", date: "2025-06", expiry: "2026-06", status: "current" },
      { type: "ISO 27001", date: "2024-10", expiry: "2027-10", status: "current" },
      { type: "Pen test (full)", date: "2025-11", status: "current" },
    ],
    outstandingRequests: [
      { type: "Subprocessor list update", status: "overdue", due: "5 days overdue" },
    ],
    exceptionRecords: { open: 3, closed: 6 },
    track: "human-review",
    monitoring: [],
    notes:
      "Mission-critical cloud host. Three open exceptions: subprocessor disclosure, MFA gap on legacy console, DR test cadence.",
  },
  {
    id: "VEN-008",
    vendorName: "MeridianBank API",
    legalEntity: "Meridian Financial Group",
    vendorType: "Services",
    primaryContact: { name: "Daniel Cho", email: "dcho@meridianbank.com" },
    riskTier: "Tier 3",
    dataAccess: "Regulated",
    criticality: "Critical",
    regulatoryExposure: ["SOC 2", "PCI-DSS", "GLBA"],
    spendCategory: "Banking integration",
    annualContractValue: "$2.2M",
    assessmentStatus: "Exception open",
    lastAssessmentDate: "2025-03",
    nextAssessmentDue: "2026-03",
    riskScore: 82,
    riskTreatment: "Mitigate",
    intelSources: ["BitSight", "SecurityScorecard", "Adverse news"],
    documents: [
      { type: "SOC 2 Type II", date: "2025-05", expiry: "2026-05", status: "current" },
      { type: "PCI-DSS AOC", date: "2025-08", expiry: "2026-08", status: "current" },
    ],
    outstandingRequests: [
      { type: "Updated incident response plan", status: "submitted", due: "delivered yesterday" },
    ],
    exceptionRecords: { open: 4, closed: 9 },
    track: "human-review",
    monitoring: [],
    notes:
      "Material banking integration. Four open exceptions span IR plan, key management, and adverse news from regional outage in Q1.",
  },
  {
    id: "VEN-009",
    vendorName: "Helio Identity Provider",
    legalEntity: "Helio Identity Corp.",
    vendorType: "Infrastructure",
    primaryContact: { name: "Mei Nakamura", email: "mei@helio.id" },
    riskTier: "Tier 2",
    dataAccess: "Regulated",
    criticality: "Critical",
    regulatoryExposure: ["SOC 2", "ISO 27001", "GDPR"],
    spendCategory: "Identity / SSO",
    annualContractValue: "$540K",
    assessmentStatus: "Complete",
    lastAssessmentDate: "2025-12",
    nextAssessmentDue: "2026-12",
    riskScore: 41,
    riskTreatment: "Accept",
    intelSources: ["BitSight", "SecurityScorecard", "Adverse news"],
    documents: [
      { type: "SOC 2 Type II", date: "2025-04", expiry: "2026-05", status: "current" },
      { type: "ISO 27001", date: "2024-12", expiry: "2027-12", status: "current" },
    ],
    outstandingRequests: [],
    exceptionRecords: { open: 0, closed: 3 },
    track: "human-review",
    monitoring: [
      {
        id: "mon-evt-1",
        timestamp: "2 days ago",
        source: "Document expiry monitor",
        severity: "warning",
        description:
          "Helio SOC 2 Type II expires in 14 days. Targeted re-assessment of the Document Analysis step has been queued.",
        triggered: true,
      },
    ],
    notes: "Last assessment complete. Continuous monitoring active; one trigger fired (cert expiry).",
  },
];

export interface VendorRunStatus {
  vendorId: string;
  vendorName: string;
  riskTier: VendorTier;
  track: ObjectTrack;
  steps: Record<string, StepRunStatus>;
  overallProgress: number;
  fired: boolean;
}

const initialStepStatuses = (): Record<string, StepRunStatus> => {
  const map: Record<string, StepRunStatus> = {};
  tprmStepIds.forEach((id) => {
    map[id] = "pending";
  });
  return map;
};

export function seedVendorRunStatus(vendor: VendorRecord): VendorRunStatus {
  const steps = initialStepStatuses();
  return {
    vendorId: vendor.id,
    vendorName: vendor.vendorName,
    riskTier: vendor.riskTier,
    track: vendor.track,
    steps,
    overallProgress: 0,
    fired: false,
  };
}

export function tickVendorStatuses(
  prev: VendorRunStatus[],
  resolvedHitlSet: Set<string>
): VendorRunStatus[] | null {
  let anyChange = false;
  const next = prev.map((v) => {
    const steps = { ...v.steps };
    let advanced = false;
    for (const stepId of tprmStepIds) {
      if (steps[stepId] === "complete" || steps[stepId] === "skipped") continue;
      const stepDef = tprmSteps.find((s) => s.id === stepId)!;
      const idx = tprmStepIds.indexOf(stepId);
      const prevId = idx > 0 ? tprmStepIds[idx - 1] : null;
      if (prevId && steps[prevId] !== "complete" && steps[prevId] !== "skipped") break;

      // Tier 1 vendors auto-close at triage; skip human-review and exception
      const isAutoTrack = v.track === "automated";
      if (isAutoTrack && (stepId === "human-review" || stepId === "exception")) {
        steps[stepId] = "skipped";
        advanced = true;
        anyChange = true;
        continue;
      }

      // Continuous monitoring: only the monitoring vendor advances through step 9
      if (stepId === "monitoring") {
        if (v.fired) {
          steps[stepId] = "running";
          advanced = true;
          anyChange = true;
          break;
        } else {
          // Idle monitoring: stay pending — workflow considered complete after step 8 / triage
          break;
        }
      }

      const hitlStep = stepDef.substeps.some((s) => s.isHitlGate);
      const blockKey = `${v.vendorId}:${stepId}`;

      if (steps[stepId] === "pending") {
        if (hitlStep && !isAutoTrack && !resolvedHitlSet.has(blockKey)) {
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

      if (steps[stepId] === "waiting") {
        if (resolvedHitlSet.has(blockKey)) {
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

    if (!advanced) return v;

    const completed = tprmStepIds.filter(
      (s) => steps[s] === "complete" || steps[s] === "skipped"
    ).length;
    const running = tprmStepIds.filter(
      (s) => steps[s] === "running" || steps[s] === "waiting"
    ).length;
    const overallProgress = Math.round(((completed * 100) + (running * 40)) / tprmStepIds.length);
    return { ...v, steps, overallProgress };
  });
  return anyChange ? next : null;
}
