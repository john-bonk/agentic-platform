# REPLIT HYPERPROMPT — TPRM Solution Workflow
# Target: Apply the existing SOX Control Testing workflow archetype to TPRM (Third-Party Risk Management)
# with Vendor as the primary iterated object. This is a configurable system update: once confirmed,
# the same methodology will be applied to remaining solution workflows (Risk Assessments, Pre-IPO, Evidence Collection).

---

## CONTEXT: EXISTING ARCHETYPE TO MIRROR

The SOX Control Testing workflow is the reference implementation. Before making any changes, read and fully
internalize how it is built. The key structural patterns to carry forward exactly are:

**Configuration flow**
- Step-through wizard: object selection → connected data systems → document/artifact mapping → plan generation
- Division of objects into two tracks based on data completeness:
  - AUTOMATED TRACK: Objects where all required inputs are available via connected data sources — run end-to-end without human document requests
  - PBC/HUMAN TRACK: Objects where inputs require human-oriented document requests — workflow pauses at collection gates
- Plan view: rendered summary of the end-to-end workflow steps, rationale for why each object was selected, and which track it was assigned to

**Object iteration view**
- Bulk pipeline tracker: N objects running in parallel, each showing current step, status, and track assignment
- Status states: pending / in-progress / awaiting input / awaiting review / complete / exception flagged
- Drilldown to individual object page (the Optro Vendor page, mirroring the Optro Control page)

**Individual object page**
- Full object definition panel: all metadata, attributes, classifications
- Tab into the Testing/Assessment view: complete end-to-end workflow rendered as a step-by-step breakdown
- Each primary step expandable into granular substeps
- Each substep shows: action type (AI / automated / HITL), execution detail, outputs produced
- Automated attribute testing/annotations rendered at maximum granularity — mirror exactly how control attribute testing is currently shown for SOX

---

## TASK: IMPLEMENT TPRM AS THE SECOND SOLUTION WORKFLOW

Replace the placeholder TPRM solution with a fully functional workflow stack. Use Vendor as the primary object,
mirroring every structural pattern described above. The workflow definition, substep detail, and object schema
come from the diagram described below.

---

## TPRM WORKFLOW DEFINITION

The TPRM workflow has 9 primary steps organized into 4 phases. Implement all 9 steps in the pipeline.
Each step definition below includes: what happens (process), the agent's specific role, and the intended outcome.

---

### PHASE 1 — INTAKE & PROFILE (Steps 1–2)

**Step 1 · Vendor Intake**
- What happens: A new vendor record is created from a procurement request, manual entry, or inventory discovery
- Agent role: Normalizes intake from any source: MCP, API, CSV, or manual entry. Surfaces shadow IT and unreviewed vendors from procurement data. Creates the vendor record without requiring manual data entry.
- Substeps:
  - [AUTO] Ingest vendor record from source (procurement system, MCP feed, manual CSV, or API)
  - [AI] Deduplicate against existing vendor inventory and surface potential shadow IT matches
  - [AUTO] Enrich record with available procurement metadata (spend, contract date, category)
  - [AI] Identify any missing required fields and flag for completion
  - [AUTO] Create Vendor object in system with normalized schema
- Outcome: Complete vendor inventory with no manual data entry

**Step 2 · Risk Tiering**
- What happens: Assign a risk tier based on data access, system criticality, regulatory scope, spend, etc.
- Agent role: Applies customer-configured tiering rules across data sensitivity, access scope, criticality, spend, etc. Re-tiers automatically on material vendor changes including acquisition, new data access, contract expansion.
- Substeps:
  - [AI] Evaluate vendor against configured tiering dimensions: data access scope, system criticality, regulatory exposure, spend threshold, geographic risk
  - [AI] Apply tiering ruleset and assign Tier 1 / Tier 2 / Tier 3 risk classification
  - [AUTO] Log tiering rationale with dimension-by-dimension breakdown
  - [AUTO] Check for trigger conditions that would require re-tiering (new data access, contract change, acquisition signal)
  - [AUTO] Set workflow routing based on tier assignment — Tier 1 routes to automated track; Tier 2/3 routes to human review track
- Outcome: Assessment depth matched to actual risk. Low tier/criticality vendors fully automated.

**TRACK SPLIT — after Step 2:**
- AUTOMATED TRACK: Tier 1 (low risk) vendors proceed through Steps 3–5 fully automated, auto-close at Step 6
- HUMAN TRACK: Tier 2 and Tier 3 vendors proceed through Steps 3–5 with human document request gates, route to human review at Step 7

---

### PHASE 2 — ASSESS (Steps 3–5)

**Step 3 · Outside-In Intelligence**
- What happens: Gather public and third-party intelligence on the vendor without contacting them
- Agent role: Dispatches parallel retrieval across sanctions lists, financial data providers, cyber risk platforms (BitSight, SecurityScorecard, Black Kite), adverse news feeds, and trust centers. Reconciles conflicts. Flags absence of data as a signal.
- Substeps:
  - [AUTO] Query sanctions and watchlist databases (OFAC, EU, UN)
  - [AUTO] Retrieve cyber risk posture score from configured cyber risk platform (BitSight / SecurityScorecard / Black Kite)
  - [AUTO] Pull adverse news and media signals from configured news feed
  - [AUTO] Check financial health indicators from financial data provider if configured
  - [AUTO] Retrieve public trust center documents (SOC 2, ISO certifications, published policies)
  - [AI] Reconcile conflicting signals across sources and flag data absence as a risk indicator
  - [AI] Produce structured outside-in risk summary with source attribution
- Outcome: Full outside-in risk picture assembled without any vendor interaction

**Step 4 · Document Analysis**
- What happens: Collect and review vendor-provided security artifacts against internal control frameworks or policies/procedures
- Agent role: Extracts findings from SOC2, ISO certs, pen test reports, policies, and contracts. Maps evidence to control framework. Identifies gaps, expired certs, and scope limitations. Requests missing documents via secure vendor portal.
- Substeps:
  - [AUTO] Ingest available vendor-provided documents (SOC 2 report, ISO cert, pen test, DPA, MSA, security policy)
  - [AI] Extract key findings, scope statements, and control assertions from each document
  - [AI] Map extracted findings to internal control framework or policy requirements
  - [AI] Identify coverage gaps, expired certificates, and scope exclusions
  - [AI] Annotate each control framework requirement with: covered / gap / expired / out-of-scope
  - [AUTO] For documents not yet received: generate structured document request and dispatch via secure vendor portal
  - [HITL] If critical documents missing after request window: surface for human escalation decision
- Outcome: Evidence-backed control coverage mapped to framework, gaps surfaced with rationale

**Step 5 · Risk Scoring**
- What happens: Synthesize all evidence into a score and links to traceable evidence
- Agent role: Generates a score and links to traceable evidence. Produces structured, audit-ready output the reviewer can interrogate finding by finding.
- Substeps:
  - [AI] Aggregate outside-in intelligence signals into quantitative risk dimensions (cyber posture, financial stability, news/adverse events, regulatory exposure)
  - [AI] Aggregate document analysis findings into control coverage dimensions (security controls, data protection, operational resilience, compliance)
  - [AI] Compute weighted composite risk score using configured scoring model
  - [AI] Produce structured risk scorecard: dimension scores, confidence levels, supporting evidence links, key findings
  - [AI] Generate audit-ready narrative summary: score rationale, top risk drivers, finding-by-finding breakdown
  - [AUTO] Log full scoring model inputs, weights, and outputs for auditability
- Outcome: Structured, auditable risk score and analysis with traceable evidence

---

### PHASE 3 — DECIDE & ACT (Steps 6–8)

**Step 6 · Triage & Routing**
- What happens: Approve low-risk assessments or route high-risk and ambiguous cases for human review
- Agent role: Auto-closes high-confidence Tier 1 (low risk) assessments within defined thresholds. Routes Tier 2 and Tier 3 cases and low-confidence scores to the appropriate reviewer with a structured summary and suggested disposition.
- Substeps:
  - [AI] Evaluate risk score and confidence level against auto-close thresholds
  - [AUTO] For Tier 1 vendors meeting auto-close criteria: mark assessment complete, generate closure summary, update vendor record
  - [AI] For all other vendors: prepare structured reviewer brief with score breakdown, key findings, confidence level, and suggested disposition
  - [AUTO] Route to assigned reviewer based on vendor tier, risk domain, and configured routing rules
  - [HITL] Reviewer receives structured brief and confirms routing or overrides disposition
- Outcome: Human effort reserved for judgment calls, not routine approvals

**Step 7 · Human Review**
- What happens: Apply judgment to escalated assessments and make a documented risk treatment decision
- Agent role: Presents reviewer with score breakdown, key findings, confidence level, and suggested disposition. Captures the reviewer's decision and rationale. Updates the vendor record accordingly.
- Substeps:
  - [AI] Render reviewer brief: score, dimension breakdown, top findings, suggested disposition, comparable vendors for reference
  - [HITL] Reviewer reviews brief and makes risk treatment decision: Accept / Mitigate / Transfer / Avoid
  - [HITL] Reviewer documents rationale for decision (free text, required)
  - [AUTO] Capture decision, rationale, reviewer identity, and timestamp in vendor record and audit trail
  - [AUTO] Update vendor risk status, treatment decision, and next review date in system
- Outcome: Defensible risk decision on record with full rationale

**Step 8 · Exception & Remediation**
- What happens: Track identified gaps to resolution — assign owners, notify vendor, validate the fix
- Agent role: Drafts exception records from findings. Suggests owners and severity. Generates vendor-facing remediation requests. Tracks vendor responses and validates evidence of fix. Triggers re-assessment on closure.
- Substeps:
  - [AI] Generate structured exception records for each identified gap or finding, with: description, severity, owner suggestion, remediation deadline
  - [HITL] Reviewer confirms exception records and assigns owners
  - [AUTO] Dispatch vendor-facing remediation request via configured channel (email, portal, or ticketing system)
  - [AUTO] Track vendor response status and monitor for evidence of remediation submission
  - [AI] Validate submitted remediation evidence against the original finding requirement
  - [AUTO] On validated closure: update exception record, trigger partial or full re-assessment as configured
  - [HITL] On disputed or inadequate remediation: surface for human escalation
- Outcome: Risk lifecycle owned end-to-end in Optro from finding to verified fix

---

### PHASE 4 — MONITOR (Step 9)

**Step 9 · Continuous Monitoring**
- What happens: Maintain an always-current vendor risk profile by reacting to new signals and contract renewals
- Agent role: Monitors for trigger events: adverse news, cert expirations, breach disclosures, ownership changes, contract renewal dates. Re-scores and re-tiers automatically. Alerts the TPRM manager when action is required.
- Substeps:
  - [AUTO] Continuously poll configured signal sources for vendor-specific trigger events
  - [AI] Evaluate each signal for materiality: does this warrant re-tiering, partial re-assessment, or full re-assessment?
  - [AUTO] On immaterial signal: log to vendor record and update risk profile metadata
  - [AUTO] On material signal (cert expiry, breach disclosure, adverse news threshold exceeded): trigger targeted re-assessment of relevant workflow steps
  - [AI] On contract renewal approaching (configurable lead time): generate renewal readiness summary and flag for review
  - [HITL] Alert TPRM manager with structured briefing on what changed, why it matters, and recommended action
  - [AUTO] Log all monitoring events, evaluations, and triggered actions to vendor audit trail
- Outcome: Always-current vendor risk profile; contract renewals informed by live posture

---

## VENDOR OBJECT SCHEMA

The Vendor object should mirror the Control object schema in structure. Implement the following fields:

**Identity**
- Vendor ID (auto-generated)
- Vendor name
- Legal entity name
- Vendor type (Software / Infrastructure / Services / Data / Other)
- Primary contact name and email

**Classification**
- Risk tier (Tier 1 / Tier 2 / Tier 3)
- Data access scope (None / Internal / Confidential / Regulated)
- System criticality (Low / Medium / High / Critical)
- Regulatory exposure (list: SOC2, ISO 27001, GDPR, HIPAA, PCI, etc.)
- Spend category
- Annual contract value (range)

**Status**
- Assessment status (Not started / In progress / Under review / Complete / Exception open)
- Last assessment date
- Next assessment due date
- Current risk score (0–100)
- Current risk treatment decision (Accept / Mitigate / Transfer / Avoid / Pending)

**Connected data**
- Outside-in intel sources connected (BitSight / SecurityScorecard / Black Kite / Adverse news / None)
- Documents received (list with type, date, expiry)
- Outstanding document requests (list with status)
- Exception records (count open / count closed)

---

## CONFIGURATION WIZARD — TPRM

Mirror the SOX configuration wizard exactly. The TPRM configuration wizard should step through:

1. **Vendor selection**: Select vendors to include in this assessment run. Filter by: tier, status, domain, date last assessed. Show count by track assignment (automated vs. PBC).
2. **Connected data systems**: Configure outside-in intel sources (cyber risk platform, adverse news, sanctions feed, financial data), document storage integrations, and vendor portal settings.
3. **Framework mapping**: Select or upload the internal control framework or policy standard against which vendor documents will be assessed. Configure dimension weights for risk scoring.
4. **Tiering rules**: Define or confirm the tiering ruleset — which dimension combinations produce Tier 1 / 2 / 3, and what the auto-close thresholds are for Tier 1.
5. **Plan view**: Render the execution plan — list of selected vendors, their track assignment (automated vs. human-review), estimated steps, and rationale. User confirms to proceed.

---

## IMPLEMENTATION INSTRUCTIONS

1. **Read the existing SOX implementation fully before writing any code.** Understand every component: the config wizard, plan view, bulk tracker, individual control page, testing tab, substep expansion, automated attribute annotation. Map each to its equivalent in the TPRM context before writing a single line.

2. **Create a shared workflow archetype module.** The SOX and TPRM implementations should both derive from a common workflow engine with a configuration layer, not two separate implementations. The archetype should accept:
   - `objectType` — the primary iterated object (Control, Vendor, etc.)
   - `objectSchema` — the field definitions for the object
   - `workflowSteps` — the ordered array of primary steps with their substep definitions
   - `phases` — grouping of steps into named phases
   - `trackingRules` — logic for automated vs. human-track assignment
   - `configWizardSteps` — the ordered configuration screens
   This module will be the foundation for all future solution workflows.

3. **Implement TPRM using this archetype.** Do not hard-code TPRM-specific logic outside of the configuration layer. Every structural component — the wizard, plan view, bulk tracker, object page, workflow tab, substep drilldown, audit trail — should be rendered by the shared archetype consuming the TPRM configuration.

4. **Validate parity with SOX.** After implementing TPRM, do a feature-by-feature comparison against the SOX implementation to confirm every capability is present:
   - [ ] Configuration wizard with all steps
   - [ ] Track split (automated vs. human) with counts displayed
   - [ ] Plan view with vendor list and rationale
   - [ ] Bulk pipeline tracker with parallel execution status
   - [ ] Individual vendor page with full object schema
   - [ ] Assessment tab with full 9-step pipeline
   - [ ] Substep drilldown with action type tags (AI / auto / HITL)
   - [ ] Automated attribute annotations at maximum granularity
   - [ ] HITL gate surfaces at correct substeps
   - [ ] Audit trail on vendor record

5. **Preserve the SOX implementation exactly.** Make no changes to the SOX Control Testing workflow, its data, its components, or its routing. The TPRM implementation is purely additive.

6. **Document the archetype.** After TPRM is implemented and validated, produce a brief internal developer note describing the archetype module API — the configuration schema, the component contract, and the process for adding a new solution workflow. This document will be used to implement Risk Assessments, Pre-IPO, and Evidence Collection following the same process.

---

## MOCK DATA FOR TPRM

Seed the TPRM workflow with representative mock vendors that exercise all workflow paths:

- 3× Tier 1 vendors (auto-close path): fully automated, outside-in data available, no document requests needed
- 3× Tier 2 vendors (human review path): mixed data availability, some document gaps, route to human review
- 2× Tier 3 vendors (high-risk, escalated): significant findings, exception records generated, remediation tracked
- 1× vendor in continuous monitoring state: prior assessment complete, monitoring active, one trigger event fired

Each vendor should have realistic field values, a plausible risk score, at least one completed workflow run in the audit trail, and representative substep outputs including annotated findings from the document analysis step.

---

## ACCEPTANCE CRITERIA

The implementation is complete when:

1. TPRM appears in the Solutions Hub alongside SOX Control Testing as a fully navigable solution
2. The TPRM configuration wizard is completable end-to-end with mock data
3. The plan view correctly splits vendors into automated and human-review tracks with counts and rationale
4. The bulk pipeline tracker shows all 9 mock vendors running in parallel across the 9-step pipeline
5. Drilling into any vendor opens the Vendor object page with all schema fields populated
6. The Assessment tab on the vendor page shows the full 9-step workflow with correct phase groupings
7. Each step is expandable to show substeps with action type tags
8. Substeps tagged [AI] render granular output annotations matching the style of SOX control attribute testing
9. HITL gates appear at the correct substeps and are interactable (approve / reject / modify)
10. The audit trail on each vendor records all completed substeps with attribution
11. The shared archetype module is in place and SOX is provably consuming it
12. A developer note documents how to add the next solution workflow
