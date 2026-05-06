# Optro Solution Framework

**The taxonomic architecture and registration schema for the Optro Agentic Platform.**

This document is the **headlining contract** for the platform. It defines:
1. The architectural hierarchy that everything in Optro hangs off of (Org → Solutions → Workflows → Objects → Pipeline → Focus → Artifact).
2. The required component spine that is invariant across every solution.
3. The flex points where solutions vary, and how they vary.
4. A **registration schema** — fill it in, get a working UI by construction.

Companion docs:
- [`ui-pattern-canon.md`](./ui-pattern-canon.md) — pixel-level visual reference for every component referenced here, plus the live TPRM drift audit.
- [`workflow-archetype.md`](./workflow-archetype.md) — implementation recipe for engineers (file structure, wiring, conventions).

> **Naming convention**: when this doc references an *object type*, it always means a solution-specific record (Control / Vendor / Entity / Risk / Issue / Audit / …). When it says *workflow object*, it means the runtime instance of that record passing through a workflow.

---

## Table of contents

- [Part 1 — The Architectural Hierarchy](#part-1--the-architectural-hierarchy)
- [Part 2 — The Required Component Spine](#part-2--the-required-component-spine)
- [Part 3 — The Flex Points](#part-3--the-flex-points)
- [Part 4 — Step / Substep Definition Language](#part-4--step--substep-definition-language)
- [Part 5 — Solution Registration Schema](#part-5--solution-registration-schema)
- [Part 6 — Worked Examples](#part-6--worked-examples)
- [Part 7 — Walkthrough: Registering a new solution](#part-7--walkthrough-registering-a-new-solution)

---

# Part 1 — The Architectural Hierarchy

Optro is structured as a **seven-level taxonomy**. Every page, every component, every piece of state belongs to exactly one level. Levels can have many children but only one parent.

```
┌────────────────────────────────────────────────────────────────────────┐
│ L0  ORG WORKSPACE                                                      │
│     The platform shell — chrome, setup, admin, identity, persistent    │
│     home assistant. Owned by the org tenant.                           │
│                                                                        │
│   ├─ L1  SOLUTIONS                                                     │
│   │     Strategic problem domains. Each solution targets one or more   │
│   │     Optro outcomes. Examples: SOX Control Testing, TPRM, Risk      │
│   │     Assessments, Pre-IPO, Evidence Collection, Issue Management.   │
│   │                                                                    │
│   │   ├─ L2  WORKFLOWS                                                 │
│   │   │     The agentic process within a solution. A solution can      │
│   │   │     have one or more workflows. Each workflow is end-to-end    │
│   │   │     automated and acts on a specific object type. Today: SOX  │
│   │   │     has the "Testing" workflow; TPRM has the "Assessment"     │
│   │   │     workflow. A solution may add more (e.g. SOX adds          │
│   │   │     "Self-Assessment" later, TPRM adds "Reassessment", etc.). │
│   │   │                                                                │
│   │   │   ├─ L3  OBJECT TYPE                                           │
│   │   │   │     The unit of iteration the workflow acts on. Defined   │
│   │   │   │     by a schema (fields grouped by Identity /              │
│   │   │   │     Classification / Status / Connected Data) and a       │
│   │   │   │     focus-page personality (what optional tabs it gets).  │
│   │   │   │     Examples: Control, Vendor, Entity, Risk, Issue, Audit. │
│   │   │   │                                                            │
│   │   │   │   ├─ L4  PIPELINE (population view)                        │
│   │   │   │   │     The bulk-execution view: all objects in scope     │
│   │   │   │   │     for a workflow run, grouped by track, status'd    │
│   │   │   │   │     per step.                                          │
│   │   │   │   │                                                        │
│   │   │   │   ├─ L5  FOCUS (per-object drilldown)                     │
│   │   │   │   │     The single-object workflow execution view. Has    │
│   │   │   │   │     three required tab slots and N optional tabs.     │
│   │   │   │   │                                                        │
│   │   │   │   └─ L6  ARTIFACTS                                         │
│   │   │   │         The terminal output for a workflow run on this    │
│   │   │   │         object: workpaper, risk memo, briefing, …          │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Cardinality rules

| From | To | Cardinality |
|------|----|-------------|
| Org Workspace | Solution | 1-to-many |
| Solution | Workflow | 1-to-many *(today: 1, but the model supports many)* |
| Workflow | Object Type | 1-to-1 *(a workflow always targets exactly one object type)* |
| Object Type | Object Instance | 1-to-many |
| Workflow | Pipeline | 1-to-1 per workflow run |
| Object Instance + Workflow | Focus page | 1-to-1 |
| Focus page | Artifact | 1-to-many *(a workflow run produces one canonical artifact; the user can spawn additional artifacts via the Create dropdown)* |

### 1.2 The mental model

Read top-down: *the org workspace contains solutions; each solution drives one or more workflows; each workflow runs end-to-end across a population of one object type; the user enters at the pipeline and drills into a focus view per object; each focus view ends in an artifact*.

Read bottom-up: *every artifact is the terminal output of a workflow run on one object instance; that object lives in a population that fed the pipeline of one workflow; that workflow is one of one-or-more inside a solution; that solution is a tenant feature inside the org workspace*.

**This taxonomy is the load-bearing wall of the platform.** Every UI surface, every config object, every piece of state lives on this tree. If you can't place a thing on the tree, it doesn't belong in Optro.

### 1.3 What about the focus page tabs?

A common mis-frame: "the canon focus page has 4 tabs (Details / Testing / Issues / Automations) and that is the invariant." It is not. Issues and Automations are **Control-object-specific** tab extensions — the Control object type happens to expose them because Controls have their own issue lifecycle and their own automation policy. Vendors do not have an Issues lifecycle in the same shape (vendor issues are exception records embedded in the assessment); Entities won't have Automations in the same shape.

The **invariant** at the focus level is:

| Slot | Role | Required? |
|------|------|-----------|
| Details/Overview tab | Static schema view of the object record | ✅ always |
| Workflow tab (dynamic verb) | The agentic execution surface | ✅ always |
| Audit Log tab | Object-filtered view of the master agentic audit log | ✅ always |
| Cycle dropdown on the Workflow tab | Run cycle selector | ⬜ optional, per-workflow |
| Object-specific extension tabs | Per-object-type accents (Issues, Automations, Subprocessors, Sub-entities, …) | ⬜ optional, per-object-type |
| Right-side utility panel | Agent narration / Comments / Notes / Attachments | ✅ always |

This is the corrected canon. The Control object happens to have **5 visible tabs** (3 required + 2 optional) because its object type exposes Issues and Automations. The Vendor object should have **3 visible tabs** (3 required + 0 optional) — currently TPRM has exactly 3, which is *correct by the new framework*.

---

# Part 2 — The Required Component Spine

These components, layouts, and behaviors are **invariant** across every solution. They are described for use; for pixel-level specs and code refs see [`ui-pattern-canon.md`](./ui-pattern-canon.md) Part 1.

## 2.1 L0 — Org Workspace shell

Provides:
- **Left icon nav** (modules — Home, Workflows, Settings, …)
- **Side nav** (within a module — Home, Recent, Favorites, Workflows section, Environment section)
- **Top bar** with global search (`⌘+K`) and right-hand actions
- **Persistent home assistant panel** (slides in from right; receives mirrored events from focus pages)

The shell never changes per-solution. Solutions decorate it via the side nav (their session entry, their environment items).

## 2.2 L1 — Solutions Home

A `Welcome to Optro / Pick a solution area to get started` page. Single column of solution cards. Each card: icon · title · 1-line description · click → L2.

A new solution registration adds exactly one card here.

## 2.3 L2 — Solution Home

A solution-level "what's happening" page. Uniform structure for every solution:

```
← All solutions
[Solution Title]

YOUR TASKS
  ┌─ [icon] [primary task label]   [Priority] ……… [⚙ config][▶ Start CTA]
  │  Sub-text                                                   ─┘
  > More tasks (n)

PENDING APPROVALS  (n)         AGENT WORKFLOWS  (n)
  • Approval 1 ……… [tag]         ✦ Direct Action
  • Approval 2 ……… [tag]         ↻ Continuous
  • Approval 3 ……… [tag]         ⌚ Scheduled
  • Approval 4 ……… [tag]         ⚡ Emergent

AUDIT TRAIL  (n events)                                       >
```

Invariants:
- **One** primary task with the prominent Start CTA (and the gear icon for opening the Plan dialog with the wizard pre-expanded).
- The four `Agent Workflows` categories are platform-fixed: Direct Action / Continuous / Scheduled / Emergent. Counts vary; categories don't.
- Section ordering is fixed.

## 2.4 L3 — Plan dialog

The pre-launch confirmation modal. Uniform structure:

1. **Header** — solution icon + title + 1-line summary + close.
2. **Scope callout** — narrative explanation of how the in-scope set was selected, with up to 4 inline metric chips.
3. **4-stat grid** — the same four stats that appear in the Hub when running.
4. **Configuration Wizard strip** *(when `cycles` or `wizardSteps` are declared)* — horizontal numbered (1·2·3·4·5).
5. **Per-object workflow preview** — list of steps with `agentRole` blurb each. If `phases` are declared, group by phase; otherwise flat.
6. **Selection table** — in-scope objects grouped by classification, with checkboxes.
7. **Footer** — `Cancel` | `Confirm & Start <verb>`. Verb matches the workflow's `tabVerb`.

## 2.5 L4 — Hub

The pipeline view. Uniform structure:

```
[Shield] Solution title                          [✓ Complete?]  [↗ Open Wf] [⋮]
Sub-status sentence

┌─Scope─┬─Auto Cov─┬─Closed─┬─Exceptions ▶─┐    ← 4-stat band, slot semantics fixed
│       │          │        │              │
└───────┴──────────┴────────┴──────────────┘

▾ Actions Required (n blocking)                 ← collapsed by default

▾ <Object> Pipeline
  CONTROL │ SOURCE │ <step shorts...> │ RESULT
  • [GROUP A] (n/m)
    OBJ-001  …
  • [GROUP B] (n/m)
    OBJ-002  …
  Legend: every symbol that can appear

▾ [✦] Optro Assistant: Audit Log (n entries)    ← collapsed by default
```

Invariants:
- 4-card stat band, slot-semantic-fixed (Scope / Auto Coverage / Closed / Exceptions). Slot 4 is clickable when count > 0 → opens the master Open Exceptions dialog.
- Pipeline grid grouped by track. Group order: human-touched first, automated second.
- Two-mode scroll: when both Actions Required and Audit Log are collapsed, the pipeline scrolls inside its card; when either is expanded, the page scrolls and the pipeline pushes down.
- Row click → focus page (L5).

## 2.6 L5 — Focus page

The single most important contract. Three required tab slots, N optional tabs, and an always-present right-side utility panel.

```
←Overview │ [🛡] OBJ-ID — Object name              [outcome badge]  ← header (h-12)
─────────────────────────────────────────────────────────────────  
Details │ [Workflow ▾] │ Audit Log │ [+ object-specific tabs…]      ← tab strip
─────────────────────────────────────────────────────────────────  
                                                                       │
[ tab body — varies per active tab ]                                   │ ← right
                                                                       │   utility
                                                                       │   panel
─────────────────────────────────────────────────────────────────     │   (always
‹ Previous Step                  [terminal CTA]    Next Step ›        │   present)
```

### 2.6.1 Required tab slots

| Tab slot | Body | Per-solution variability |
|----------|------|--------------------------|
| **Details / Overview** | Static schema view of the object record. Two-column layout: descriptive content sections (left) + metadata sidebar (right). Read-only. | The schema fields and section grouping are object-specific; the layout grammar is invariant. |
| **Workflow** *(dynamic verb)* | The agentic execution surface — stepper sub-band → run-context band → step content area → footer. | The verb in the tab label is per-workflow ("Testing" / "Assessment" / "Review" / "Diligence" / "Readiness"). A cycle dropdown is optional. |
| **Audit Log** | Tabular chronological log of every event for this object. **Same data as the master Hub-level Audit Log, filtered by `objectId`**. Columns: When · Actor · Type (AI/AUTO/HITL pill) · Action. | Empty state when no run yet. Filterable by step. |

The label of the workflow tab is the only required tab whose label varies. Details/Overview and Audit Log are platform-uniform labels.

> **Naming choice for the Details tab**: pick *Details* OR *Overview* per object (slight preference for *Details* when the schema is dense; *Overview* when the schema is summary-level). Don't switch terminology mid-platform.

### 2.6.2 Optional tab slots

A solution may declare per-object-type additional tabs. Examples in the wild:

| Object type | Optional tabs |
|-------------|---------------|
| Control | Issues, Automations |
| Vendor | *(none today)* — could add Subprocessors, Contracts |
| Entity | *(future)* — Sub-entities, Org Chart, Policies |
| Risk | *(future)* — Mitigations, Treatments, KRIs |
| Audit | *(future)* — Workpapers, Findings, Recommendations |

Optional tabs go **after** the Workflow tab and **before** the Audit Log tab in tab-strip order. They follow the same `border-b-2` styling as required tabs. Their bodies are object-type-specific; the framework only requires that they live in the same vertical column as the required tab bodies (no side panels masquerading as tabs).

### 2.6.3 Workflow tab — the inner spine

This is the heart of canon. Within the Workflow tab body:

```
╳━━●━━●━━●━━●━━○━━○                          [⏸ pause]              ← stepper sub-band
Step1 Step2 Step3 Step4 Step5 Step6                                    (slate-50/80 bg)
▾ RUN CONTEXT                                                          ← collapsible
  [Tester]   [Reviewer]   [Request id]   [Secondary reviewer]            run-context band
  [Cardinality] [Time]    [Scope slice]  [Due date]                      (default collapsed)

[Step Title] [Status badge] [⚡ AUTO]                                  ← step header
Step n of N: <agent description>                                         (mode pill)

1 ✓ □ Substep one                                              [▾]      ← substep rows
2 ✓ □ Substep two                                                       
3 ◐ □ Substep three                                            [▾]
    ┌─ Reviewer checkpoint — record disposition before proceeding  ─┐
    │ [✓ Approve]  [✏ Modify]  [✕ Reject]                            │   ← inline HITL
    └────────────────────────────────────────────────────────────────┘
4 ○ □ Substep four
…

(optional outcome banner — last step only)
```

Invariant patterns inside the Workflow tab:
- **Stepper** — pills with progress fill, `skipped` glyph for track-skipped steps, click-to-navigate.
- **Run-context band** — collapsible (default collapsed); 8 invariant slots (see § 3.5).
- **Step header** — title + status badge + automation-mode pill (Auto / Checkpoint / Manual).
- **Step description** — `Step n of N: <agent description>`.
- **Substep rows** — integer numbering, status indicator, action-type icon (icon-only, no pills), description.
- **Inline action affordances** — Upload / Request via Workstream / Confirm checkpoint / Manual run buttons appear under the substep that needs them, in the substep's indent.
- **Inline HITL gate card** — Approve / Modify / Reject buttons inline under the gate substep when the step is in `waiting` status.
- **Empty state** — when no run has happened yet, render the centered "Run Workflow" CTA panel with Bot icon, automation-mode summary card, primary CTA + Settings gear (opens AutomationConfigModal), and step-preview chips.
- **Outcome banner** — only on the terminal step when complete. Tone-keyed.
- **Footer** — Previous Step | terminal CTA / Next Step. Never holds the HITL Approve/Modify/Reject buttons.
- **Toast feedback** — bottom-center, every action confirmation.
- **Assistant mirroring** — every blocked / completed / workstream-initiated event mirrors to the home assistant.

### 2.6.4 Right-side utility panel (always present)

A `w-12` collapsed icon strip at the right edge of the focus page, expandable to `w-96` when a tab is active. Four invariant tabs (Audit Log moved out into its own top-level tab — see § 2.6.1):

| Icon | Tab | Content |
|------|-----|---------|
| `Bot` | Optro Agent | Live agent narration tied to the active step + action chips |
| `MessageSquare` | Comments | Threaded comments; filterable open / closed |
| `Pencil` | Notes | Free-form authored notes |
| `Copy` | Attachments | Files attached to the object/run |

> **Migration note from the original 5-tab utility panel**: The "History" tab is now the top-level Audit Log tab. The utility panel's narrow width was always a bad fit for an audit log; the top-level tab body is wider and supports filters/columns properly. The four remaining utility-panel tabs are all "scratch surfaces" for ongoing human work and benefit from staying in the side rail.

## 2.7 L6 — Artifacts

Every workflow run on every object terminates in **one canonical artifact**. The artifact is a structured document (table-driven sections, not free narrative) reachable two ways:

1. As an **Outputs step** appended to the stepper after the user clicks the terminal CTA on the last fieldwork step (the CTA verb is `Generate <Artifact label>`).
2. As a **full-screen Summary Report page** reachable via "View <Object> Summary" in the focus footer.

The artifact is per-workflow, not per-object. A single object can have multiple artifacts if it has been run through multiple workflows or multiple cycles.

---

# Part 3 — The Flex Points

These are the dimensions that vary between solutions. Everything not on this list should look identical across all solutions.

## 3.1 Object type

The unit of iteration. Defined by:

```ts
interface ObjectTypeDef {
  id: string;                            // "control", "vendor", "entity", …
  singular: string;                      // "Control"
  plural: string;                        // "Controls"
  icon: LucideIcon;                      // typically Shield
  schemaFields: ObjectFieldDef[];        // grouped by Identity / Classification / Status / Connected Data
  pipelineDisplay: {                     // how the object appears in pipeline rows
    idFormatter: (obj) => string;        // e.g. mono "CTL-003"
    nameFormatter: (obj) => string;
    classificationFormatter: (obj) => string;
    sourceFormatter: (obj) => string;    // e.g. "PBC" / "⚡ Auto" / "Tier 2"
    resultFormatter?: (obj, status) => ReactNode;
  };
  detailsTabSections: DetailsTabSection[];  // see 3.2
  optionalTabs?: OptionalTabDef[];          // see 3.3
}
```

## 3.2 Details/Overview tab schema

The structure of the Details tab is invariant (two-column layout with content sections and metadata sidebar). The *content* is per-object-type, expressed as:

```ts
interface DetailsTabSection {
  id: string;
  title: string;                         // "Control Information" / "Vendor Information"
  defaultCollapsed?: boolean;
  content: DetailsRow[];                 // [label, value] pairs OR markdown-like blocks
  sidebar: SidebarRow[];                 // [label, value] pairs in the right rail
}
```

Examples:
- Control → `Control Information` / `Control Test Information` sections; sidebar has Owner / PBC Owners / Reviewer / Significance / Classification / Frequency / …
- Vendor → `Vendor Information` / `Risk Classification` / `Assessment Status` sections; sidebar has Vendor ID / Legal Entity / Vendor Type / Primary Contact / Annual Contract Value.
- Entity (future) → `Entity Information` / `Operating Profile` / `Risk Posture` sections; sidebar has Entity ID / Legal Form / Geography / Headcount / Revenue.

## 3.3 Optional tabs (object-type-specific)

Declared per object type. Renders between the Workflow tab and the Audit Log tab.

```ts
interface OptionalTabDef {
  id: string;                            // "issues" | "automations" | …
  label: string;
  render: (object) => ReactNode;
  showWhen?: (object) => boolean;        // optional visibility predicate
}
```

Today:
- Control → `Issues`, `Automations`
- Vendor → *(none)*
- Future per object type as the platform expands.

> **Discipline rule**: optional tabs must represent a *substantively different surface* from any required tab — not a re-cut of the same data. If an "Issues" tab would just filter the Audit Log, don't add it. Add it only if Issues have their own lifecycle (open, in remediation, closed) that is meaningful independent of the runs that produced them.

## 3.4 Workflow definition

The agentic process. The most variable thing in the framework.

```ts
interface WorkflowDef {
  id: string;                            // "control-testing" / "tprm-assessment"
  label: string;                         // "Automated Control Testing"
  tabVerb: string;                       // "Testing" / "Assessment" / "Review"
  emptyStateCtaVerb: string;             // "Test with Agent" / "Run Assessment"
  terminalArtifact: TerminalArtifactDef;

  cycles?: CycleDef[];                   // optional — when present, render cycle dropdown on workflow tab
  phases?: PhaseDef[];                   // optional — when present, group steps in plan view + step header subtitle
  steps: StepDef[];                      // required — see Part 4
  tracks: TrackDef[];                    // required — at least one
  trackSkipRules?: SkipRule[];           // e.g. Tier 1 vendors skip human-review + exception steps
  outcomeStates: OutcomeStateDef[];      // 2–5 terminal outcomes
  runContextSchema: RunContextSchema;    // 8 slots — see 3.5
  agentNameByStep: Record<string, string>; // for utility-panel agent narration
}
```

## 3.5 Run-context schema

The 8 invariant slots in the run-context band on the workflow tab. Slot semantics are fixed; labels and values are per-workflow.

| Slot | Semantic | SOX label | TPRM label (proposed) | Generic |
|------|----------|-----------|------------------------|---------|
| 1 | Executor | Tester | Lead Reviewer | "who performs the work" |
| 2 | Second-line reviewer | Reviewer | Secondary Reviewer | "who reviews the work" |
| 3 | Inbound request id | PBC Request | DPQ id | "what request initiated this run" |
| 4 | Cross-functional reviewer | Secondary Reviewer | Compliance Reviewer | "additional sign-off" |
| 5 | Cardinality | Sample Size | Documents Collected | "how much work this run is" |
| 6 | Time budget | Budgeted Hours | SLA Hours | "time allotted" |
| 7 | Scope slice | Sample Selections | Scope (substep set) | "which subset of work this run does" |
| 8 | Due date | Due Date | Due Date | "hard deadline" |

When a workflow doesn't naturally have one of these, set the value to `—` rather than omitting the slot. Future objects with fewer applicable slots can be addressed by relaxing this to ≥4 required + 4 optional slots, but today the slot set is locked at 8.

## 3.6 Cycles

Optional. When a workflow has cycles, the workflow tab gets a chevron dropdown on the tab label showing the active cycle. Clicking the active tab opens a dropdown of all cycles, each with a status pill.

```ts
interface CycleDef {
  id: string;                            // "walkthrough" / "interim" / "rollforward"
  label: string;                         // "Walkthrough" / "Interim" / "Rollforward"
  period: string;                        // "FY25" / "Q1" / "2026 Annual"
  status: "Complete" | "In Progress" | "Not Started";
}
```

Today:
- SOX Control Testing has cycles: Walkthrough / Interim / Rollforward.
- TPRM Assessment **should** have cycles: Initial Onboarding / Annual / Triggered Re-assessment (driven by monitoring).
- Risk Assessments will have cycles: Quarterly / Annual / Ad-hoc.
- Pre-IPO probably won't have cycles (or will have a single "Pre-IPO Readiness" cycle).
- Evidence Collection is per-run, no cycles.

## 3.7 Phases

Optional. When a workflow has phases, the plan view groups steps by phase and the step header shows `Phase n · Phase Label` as a subtitle.

```ts
interface PhaseDef {
  id: string;
  ordinal: number;
  label: string;                         // "Intake & Profile" / "Assess" / "Decide & Act" / "Monitor"
  description?: string;
}
```

Today:
- SOX Control Testing has no declared phases (steps are flat).
- TPRM Assessment has 4 phases.

Phases are content metadata, not chrome. The automation-mode pill is **not** the phase label — they're orthogonal.

## 3.8 Tracks and skip rules

Every workflow has at least one track. The pipeline groups rows by track.

```ts
interface TrackDef {
  id: string;                            // "automated" / "human-review" / "connected" / "manual"
  label: string;                         // "Automated Track" / …
  description: string;
  ordinal: number;                       // group order in pipeline (lower = top); convention is human-touched first
}

interface SkipRule {
  trackId: string;                       // which track gets the skip
  stepId: string;                        // which step is skipped
  reason: string;                        // e.g. "Tier 1 auto-close — no human review needed"
}
```

Skip rules render as `—` glyph in the stepper pill for skipped steps.

## 3.9 Outcome states

The terminal states that appear in the outcome banner and as result-column icons in the pipeline.

```ts
interface OutcomeStateDef {
  id: string;
  label: string;                         // "Effective" / "Approved" / "Conditional"
  tone: "success" | "warn" | "error" | "follow-up";
  icon: LucideIcon;
}
```

Tones are the only color palette (see § 3.10). Don't invent new tones.

## 3.10 Visual tokens (invariant — included here for completeness)

| Token | Use |
|-------|-----|
| `#266C92` | Primary brand. Active step pill, success cues, terminal CTA. |
| emerald | AUTO action type, monitoring "live" pulse, `success` outcome tone. |
| blue | AI action type. |
| amber | HITL action type, `waiting` step state, `warn` outcome tone, checkpoint card. |
| red | `blocked` step state, `error` outcome tone, exceptions card. |
| violet | `follow-up` outcome tone (re-assess / monitor). |
| `slate-50/80` | Stepper sub-band, run-context band, panel headers. |
| `slate-200 / border` | Default card stroke. |

## 3.11 Terminal artifact

Every workflow declares its terminal artifact:

```ts
interface TerminalArtifactDef {
  label: string;                         // "Workpaper" / "Risk Memo" / "Briefing"
  verb: string;                          // "Generate Workpaper" / "Generate Risk Memo" — used as terminal CTA on last step
  sectionsBuilder: (objectId, runStatus) => ArtifactSection[];
}

interface ArtifactSection {
  title: string;                         // "1. Control Overview" / "2. Readiness Assessment" / …
  rows: [string, string][];              // [label, value] pairs
}
```

The artifact appends an "Outputs" step pill to the stepper when generated, and is also the body of the L6 Summary Report page.

---

# Part 4 — Step / Substep Definition Language

The step/substep language is **fully declarative**. A workflow author writes a list of steps with their substeps; the framework renders them.

## 4.1 Step shape

```ts
interface StepDef {
  id: string;
  ordinal: number;
  shortLabel: string;                    // ≤ 4 chars, used in pipeline grid header
  title: string;                         // "Population Acquisition"
  description: string;                   // the agent's role/description, shown in step subtitle
  agentName: string;                     // "POPULATION AGENT" — drives utility-panel agent comments
  icon: LucideIcon;
  phaseId?: string;                      // optional — when phases declared
  defaultMode?: "full" | "checkpoint" | "manual";  // automation policy default; user can override per-object via AutomationConfigModal
  substeps: SubstepDef[];                // required, ≥1
  blockRules?: BlockRule[];              // optional — triggers a "blocked" status with inline action affordances
}
```

## 4.2 Substep shape

```ts
interface SubstepDef {
  id: string;
  actionType: "ai" | "auto" | "hitl";    // the agent species — drives the icon (Bot / Zap / Fingerprint)
  label: string;                         // "Schema Validation"
  description: string;                   // "Validate field types, required columns, …"
  detail?: string;                       // optional extra muted line
  icon?: LucideIcon;                     // optional secondary icon for the row
  isHitlGate?: boolean;                  // true if this substep blocks the step until a human resolves it
  inlineAffordances?: InlineAffordanceDef[];  // optional — buttons that appear in the substep's indent when it needs input
  output?: SubstepOutputDef;             // optional — the artifact that expands when the row is clicked once complete
}
```

Mandatory rules:
- Every substep declares its action type; this is non-optional. The framework renders the icon-only marker accordingly.
- HITL substeps (action type `hitl` AND `isHitlGate: true`) must include a description that explains what the reviewer is being asked to decide.
- If a substep needs human input outside of HITL (upload a file, send a request), declare `inlineAffordances` — the buttons render under the row automatically.

## 4.3 Inline affordance shape

```ts
interface InlineAffordanceDef {
  id: string;                            // "upload" | "request-via-workstream" | "manual-run"
  label: string;                         // "Upload Population"
  variant: "primary" | "outline";
  icon: LucideIcon;                      // Upload / Send / Play / …
  showWhen: ("running" | "blocked" | "waiting")[];  // statuses that surface the button
  onAction: (substepId, action) => void; // the framework wires this to the workflow tick simulator
}
```

The pattern is canon (`pop-ingest` and `evd-collect` substeps) and is the *most replicable* surface for "agent paused, user input required" moments.

## 4.4 HITL gate semantics

A step is in `waiting` status when:
- it contains a substep with `isHitlGate: true` AND
- the gate is unresolved (the gate's resolution key `${objectId}:${stepId}` is not in the workflow's `resolvedHitl` set).

When `waiting`, the framework auto-renders the inline amber checkpoint card directly under the gate substep with three buttons: **Approve / Modify / Reject**. The buttons fire `onResolveHitl(objectId, stepId, decision)` which writes the resolution key.

The gate vocabulary is fixed at Approve / Modify / Reject — solutions cannot rename or add buttons. If a workflow needs additional decision options, those should be expressed as Modify outcomes (e.g. Modify → "request additional documents" subdialog).

## 4.5 Substep output shape

When a substep is complete and has an `output`, the row becomes expandable and shows the output below.

```ts
interface SubstepOutputDef {
  kind: "score" | "narrative" | "annotation" | "list" | "request";
  label: string;
  scoreValue?: number;                   // for kind: "score"
  scoreLabel?: string;                   // for kind: "score"
  body?: string;                         // for kind: "narrative"
  items?: { label: string; value?: string; status?: "ok" | "warn" | "gap" | "info" }[];
}
```

Status pills color-code: `ok` emerald, `warn` amber, `gap` red, `info` `#266C92`.

## 4.6 Status state machine

The six canonical states (no extensions allowed):

```
pending  →  running  →  complete
              │
              ├─ waiting  ─→  resolved → running → complete
              │
              ├─ blocked  ─→  resolved → running → complete
              │
              └─ skipped  (terminal, no transitions)
```

- `pending`: not yet reached
- `running`: agent currently executing
- `waiting`: HITL gate active OR external dependency outstanding
- `complete`: validated and finished
- `blocked`: cannot proceed; needs human resolution before returning to running/waiting
- `skipped`: not applicable to this object's track (per `trackSkipRules`); stepper renders `—` glyph

---

# Part 5 — Solution Registration Schema

This is the master type definition for adding a new solution. Filling out an instance of `SolutionDefinition` is the **complete contract** — there are no hidden requirements; if your `SolutionDefinition` is valid, the framework promises a working canon-compliant UI.

## 5.1 The master type

```ts
// docs/solution-framework.md — registration schema (proposed addition to client/src/lib/solutionFramework.ts)

interface SolutionDefinition {
  // ─── Identity ─────────────────────────────────────────────────
  id: string;                              // "sox-control-testing" / "tprm" / "risk-assessments" / "issue-management"
  label: string;                           // "SOX Control Testing"
  shortLabel?: string;                     // "SOX" — for breadcrumbs
  description: string;                     // ≤ 120 chars — appears on the L1 solution card
  icon: LucideIcon;                        // typically Shield, ClipboardCheck, Compass, …

  // ─── Strategic context ───────────────────────────────────────
  strategicTargets: string[];              // e.g. ["control assurance", "audit efficiency"]

  // ─── Object type ─────────────────────────────────────────────
  objectType: ObjectTypeDef;               // Part 3.1

  // ─── Workflows (1-to-many) ───────────────────────────────────
  workflows: WorkflowDef[];                // Part 3.4

  // ─── Solution Home (L2) ──────────────────────────────────────
  solutionHome: SolutionHomeDef;           // see 5.2

  // ─── Plan dialog (L3) ────────────────────────────────────────
  planDialog: PlanDialogDef;               // see 5.3

  // ─── Hub (L4) — most fields are derived from the workflow + object type
  hubLabels: {
    objectColumnHeader: string;            // "Control" / "Vendor" / "Entity"
    sourceColumnHeader?: string;           // "Source" — shown when objects have varying source flags
    resultColumnHeader: string;            // "Result"
  };

  // ─── Master audit log filter binding ──────────────────────────
  auditLogObjectFilter: (event, objectId) => boolean;  // returns true if the event belongs to this object — drives both Hub-level audit log and L5 Audit Log tab
}
```

Cross-references inside this type:

```ts
interface SolutionHomeDef {
  primaryTask: PrimaryTaskDef;
  pendingApprovals: PendingApprovalDef[];
  agentWorkflowsCounts: AgentWorkflowCountsDef;        // Direct/Continuous/Scheduled/Emergent
  auditTrailEntries: AuditTrailEntryDef[];
}

interface PrimaryTaskDef {
  label: string;                                       // "Test Controls for SOX Audit"
  description: string;                                 // "Launch automated control testing across …"
  ctaVerb: string;                                     // "Start"
  iconKey: string;                                     // resolves to a lucide icon
  priorityBadge?: "Priority" | "High" | "Critical";
}

interface PlanDialogDef {
  scopeCalloutTemplate: (scopeStats) => ReactNode;     // narrative explanation
  inlineMetricChips: PlanMetricChip[];                 // up to 4
  startCtaVerb: string;                                // "Confirm & Start Workflow" / "… Assessment" / "… Review"
}

interface AgentWorkflowCountsDef {
  direct: { active: number; review?: number };
  continuous: { active: number; review?: number };
  scheduled: { active: number; review?: number };
  emergent: { active: number; review?: number };
}
```

## 5.2 Validation rules (enforced when the solution is registered)

| Rule | Error message |
|------|---------------|
| `id` is a kebab-case slug | `"Solution id must be kebab-case (got 'SOX_Control_Testing')."` |
| `description.length <= 120` | `"Solution description must be ≤ 120 chars."` |
| `workflows.length >= 1` | `"A solution must declare at least one workflow."` |
| Every workflow has `steps.length >= 2` | `"Workflow '<id>' must have at least 2 steps."` |
| Every step has `substeps.length >= 1` | `"Step '<workflowId>.<stepId>' must have at least 1 substep."` |
| Every substep declares `actionType` | `"Substep '<…>' must declare actionType (ai/auto/hitl)."` |
| Every workflow has `tracks.length >= 1` | `"Workflow '<id>' must have at least 1 track."` |
| `runContextSchema` has exactly 8 entries | `"Workflow '<id>' run-context schema must have exactly 8 slots."` |
| `outcomeStates.length` between 2 and 5 | `"Workflow '<id>' must declare 2–5 outcome states."` |
| `terminalArtifact.sectionsBuilder` returns ≥ 3 sections | `"Terminal artifact for workflow '<id>' must have ≥ 3 sections."` |
| At least one substep is action type `hitl` *(soft warning)* | `"Workflow '<id>' has no HITL substep — is the agent supposed to run fully unsupervised?"` |
| Object type has fields in all 4 schema groups | `"Object type '<id>' should have fields in Identity, Classification, Status, and Connected Data groups (got: [<groups>])."` |
| Required tab slots are not over-ridden | `"Optional tab '<id>' would shadow the required '<details/workflow/audit>' tab — choose a different id."` |

## 5.3 The "if you fill this in, you get a working UI" contract

When a `SolutionDefinition` passes validation, the framework guarantees:

1. **L1 Solutions Home** — a card appears with the icon, label, and description.
2. **L2 Solution Home** — the OptroHome shell renders with Tasks/Pending Approvals/Agent Workflows/Audit Trail wired to the declared content.
3. **L3 Plan dialog** — the plan dialog renders with the scope callout, 4-stat band, optional configuration wizard (when `cycles` are declared), step preview (grouped by phase if phases are declared), selection table, and Confirm & Start CTA.
4. **L4 Hub** — the pipeline grid, 4-stat band, Actions Required, and Audit Log render with the right counts and groupings.
5. **L5 Focus page** — header, three required tabs (Details/Workflow/Audit Log) + any optional tabs, stepper, run-context band, step content, footer, right-side utility panel — all wired.
6. **L6 Artifact** — the terminal artifact renders both as the Outputs step body and as the full-screen Summary Report.
7. **State management** — pipeline ticks, HITL resolution, automation mode overrides, and skip rules all work without per-solution code.
8. **Assistant integration** — every blocked / completed / workstream-initiated event mirrors to the home assistant with the right `agentName`.

If any of these guarantees fail for a validated `SolutionDefinition`, that is a framework bug, not a solution bug.

---

# Part 6 — Worked Examples

## 6.1 SOX Control Testing — full registration (canon)

```ts
const sox: SolutionDefinition = {
  id: "sox-control-testing",
  label: "SOX Control Testing",
  shortLabel: "SOX",
  description:
    "Run automated, agentic control testing across connected systems with PBC workflows for the manual remainder.",
  icon: Shield,
  strategicTargets: ["control assurance", "SOX 404 compliance", "audit efficiency"],

  objectType: {
    id: "control",
    singular: "Control",
    plural: "Controls",
    icon: Shield,
    schemaFields: [
      { id: "id", label: "Control ID", group: "Identity", kind: "text" },
      { id: "name", label: "Control Name", group: "Identity", kind: "text" },
      { id: "category", label: "Category", group: "Classification", kind: "enum" },
      { id: "riskLevel", label: "Risk Level", group: "Classification", kind: "enum" },
      { id: "owner", label: "Control Owner", group: "Status", kind: "text" },
      { id: "pbcOwner", label: "PBC Owner", group: "Status", kind: "text" },
      { id: "dataSource", label: "Data Source", group: "ConnectedData", kind: "enum" },
      { id: "system", label: "Connected System", group: "ConnectedData", kind: "text" },
      // …
    ],
    pipelineDisplay: { /* … */ },
    detailsTabSections: [
      { id: "control-info", title: "Control Information", content: [/*…*/], sidebar: [/*…*/] },
      { id: "control-test-info", title: "Control Test Information", content: [/*…*/], sidebar: [/*…*/] },
    ],
    optionalTabs: [
      { id: "issues", label: "Issues", render: (ctrl) => <ControlIssuesTab control={ctrl} /> },
      { id: "automations", label: "Automations", render: (ctrl) => <ControlAutomationsTab control={ctrl} /> },
    ],
  },

  workflows: [{
    id: "control-testing",
    label: "Automated Control Testing",
    tabVerb: "Testing",
    emptyStateCtaVerb: "Test with Agent",

    cycles: [
      { id: "walkthrough",  label: "Walkthrough",  period: "FY25",       status: "Complete" },
      { id: "interim",      label: "Interim",      period: "Jan–Jun 25", status: "In Progress" },
      { id: "rollforward",  label: "Rollforward",  period: "Jul–Dec 25", status: "Not Started" },
    ],

    // No phases — steps are flat
    steps: [
      { id: "readiness",         ordinal: 1, shortLabel: "Rdy",  title: "Readiness",            agentName: "READINESS AGENT",     icon: FileCheck,      defaultMode: "full",     substeps: [/*…*/] },
      { id: "population",        ordinal: 2, shortLabel: "Pop",  title: "Population Acquisition", agentName: "POPULATION AGENT",   icon: Database,       defaultMode: "full",     substeps: [/*…*/] },
      { id: "sampling",          ordinal: 3, shortLabel: "Smp",  title: "Sampling",             agentName: "SAMPLING AGENT",      icon: SlidersHorizontal, defaultMode: "full",  substeps: [/*…*/] },
      { id: "evidence",          ordinal: 4, shortLabel: "Evd",  title: "Evidence",             agentName: "EVIDENCE AGENT",      icon: Upload,         defaultMode: "full",     substeps: [/*…*/] },
      { id: "testing",           ordinal: 5, shortLabel: "Tst",  title: "Testing",              agentName: "TESTING AGENT",       icon: ClipboardCheck, defaultMode: "full",     substeps: [/*…*/] },
      { id: "testEffectiveness", ordinal: 6, shortLabel: "Eff",  title: "Test Effectiveness",   agentName: "EFFECTIVENESS AGENT", icon: ShieldCheck,    defaultMode: "full",     substeps: [/*…*/] },
    ],

    tracks: [
      { id: "manual",    label: "PBC Workflow",   description: "Manual evidence collection via PBC requests",     ordinal: 1 },
      { id: "connected", label: "Automated",       description: "Automated evidence collection from connected systems", ordinal: 2 },
    ],
    trackSkipRules: [],

    outcomeStates: [
      { id: "effective",   label: "Effective",   tone: "success", icon: ShieldCheck },
      { id: "ineffective", label: "Ineffective", tone: "error",   icon: AlertTriangle },
    ],

    runContextSchema: {
      slots: [
        { id: "tester",            label: "Tester",            kind: "person" },
        { id: "reviewer",          label: "Reviewer",          kind: "person" },
        { id: "pbcRequest",        label: "PBC Request",       kind: "id" },
        { id: "secondaryReviewer", label: "Secondary Reviewer", kind: "person" },
        { id: "sampleSize",        label: "Sample Size",       kind: "text" },
        { id: "budgetedHours",     label: "Budgeted Hours",    kind: "text" },
        { id: "sampleSelections",  label: "Sample Selections", kind: "text" },
        { id: "dueDate",           label: "Due Date",          kind: "date" },
      ],
    },

    terminalArtifact: {
      label: "Workpaper",
      verb: "Generate Workpaper",
      sectionsBuilder: (controlId) => buildWorkpaperSections(controlId),
    },

    agentNameByStep: {
      readiness: "READINESS AGENT",
      population: "POPULATION AGENT",
      sampling: "SAMPLING AGENT",
      evidence: "EVIDENCE AGENT",
      testing: "TESTING AGENT",
      testEffectiveness: "EFFECTIVENESS AGENT",
    },
  }],

  solutionHome: {
    primaryTask: {
      label: "Test Controls for SOX Audit",
      description: "Launch automated control testing across connected systems and PBC workflows for the current audit period.",
      ctaVerb: "Start",
      iconKey: "shield",
      priorityBadge: "Priority",
    },
    pendingApprovals: [
      { /* … */ }, // 4 entries
    ],
    agentWorkflowsCounts: {
      direct:     { active: 1, review: 0 },
      continuous: { active: 3, review: 1 },
      scheduled:  { active: 1, review: 1 },
      emergent:   { active: 1, review: 1 },
    },
    auditTrailEntries: [/* … */],
  },

  planDialog: {
    scopeCalloutTemplate: (s) =>
      `These ${s.totalScope} controls were automatically selected based on the current audit period, prior testing results, identified gaps, and risk materiality thresholds defined in your @workflow configuration. …`,
    inlineMetricChips: [
      { icon: CalendarRange, label: "Audit Period", value: "Q1 2026" },
      { icon: Target,        label: "Risk Threshold", value: "Medium+" },
      { icon: AlertTriangle, label: "Prior Exceptions", value: "3 flagged" },
      { icon: Search,        label: "Coverage Gaps", value: "2 identified" },
    ],
    startCtaVerb: "Confirm & Start Workflow",
  },

  hubLabels: {
    objectColumnHeader: "Control",
    sourceColumnHeader: "Source",
    resultColumnHeader: "Result",
  },

  auditLogObjectFilter: (event, controlId) => event.objectId === controlId,
};
```

## 6.2 TPRM — full registration (post-canon-retrofit; what TPRM should look like)

```ts
const tprm: SolutionDefinition = {
  id: "tprm",
  label: "Third-Party Risk Management",
  shortLabel: "TPRM",
  description:
    "Automate vendor onboarding due diligence, ongoing SOC 2 monitoring, and incident-driven reassessments.",
  icon: GitBranch,
  strategicTargets: ["vendor risk", "third-party assurance", "supplier compliance"],

  objectType: {
    id: "vendor",
    singular: "Vendor",
    plural: "Vendors",
    icon: Shield,
    schemaFields: tprmObjectFields,         // existing in client/src/lib/tprmData.ts
    pipelineDisplay: { /* … */ },
    detailsTabSections: [
      { id: "vendor-info",         title: "Vendor Information",   content: [/*…*/], sidebar: [/*…*/] },
      { id: "risk-classification", title: "Risk Classification",  content: [/*…*/], sidebar: [/*…*/] },
      { id: "assessment-status",   title: "Assessment Status",    content: [/*…*/], sidebar: [/*…*/] },
    ],
    optionalTabs: [],                       // none today; could add Subprocessors / Contracts later
  },

  workflows: [{
    id: "tprm-assessment",
    label: "Vendor Risk Assessment",
    tabVerb: "Assessment",
    emptyStateCtaVerb: "Run Assessment",

    cycles: [
      { id: "onboarding", label: "Initial Onboarding", period: "—",            status: "In Progress" },
      { id: "annual",     label: "Annual Reassessment", period: "FY26",         status: "Not Started" },
      { id: "triggered",  label: "Triggered Reassessment", period: "On signal", status: "Not Started" },
    ],

    phases: tprmPhases,                     // 4 phases — existing
    steps: tprmSteps,                       // 9 steps — existing

    tracks: [
      { id: "human-review", label: "Human-Review Workflow", description: "Tier 2 / Tier 3 vendors", ordinal: 1 },
      { id: "automated",    label: "Automated Track",       description: "Tier 1 vendors auto-close", ordinal: 2 },
    ],
    trackSkipRules: [
      { trackId: "automated", stepId: "human-review", reason: "Tier 1 auto-close — no human review needed" },
      { trackId: "automated", stepId: "exception",    reason: "Tier 1 auto-close — no exception path" },
    ],

    outcomeStates: [
      { id: "approved",    label: "Approved",    tone: "success",   icon: ShieldCheck },
      { id: "conditional", label: "Conditional", tone: "warn",      icon: ShieldCheck },
      { id: "rejected",    label: "Rejected",    tone: "error",     icon: AlertTriangle },
      { id: "monitor",     label: "Re-Assess",   tone: "follow-up", icon: Activity },
    ],

    runContextSchema: {
      slots: [
        { id: "leadReviewer",      label: "Lead Reviewer",        kind: "person" },
        { id: "secondaryReviewer", label: "Secondary Reviewer",   kind: "person" },
        { id: "dpqId",             label: "DPQ Request",          kind: "id" },
        { id: "complianceReviewer", label: "Compliance Reviewer", kind: "person" },
        { id: "documentsCollected", label: "Documents Collected", kind: "text" },
        { id: "slaHours",           label: "SLA Hours",           kind: "text" },
        { id: "scopeSlice",         label: "Scope",               kind: "text" },  // e.g. "Outside-in only" / "Full assessment"
        { id: "dueDate",            label: "Due Date",            kind: "date" },
      ],
    },

    terminalArtifact: {
      label: "Vendor Risk Memo",
      verb: "Generate Risk Memo",
      sectionsBuilder: (vendorId) => buildVendorMemoSections(vendorId),
    },

    agentNameByStep: {
      "vendor-intake":  "INTAKE AGENT",
      "risk-tiering":   "TIERING AGENT",
      "outside-in":     "OUTSIDE-IN INTEL AGENT",
      "doc-analysis":   "DOCUMENT ANALYSIS AGENT",
      "risk-scoring":   "SCORING AGENT",
      "triage":         "TRIAGE AGENT",
      "human-review":   "REVIEW AGENT",
      "exception":      "EXCEPTION AGENT",
      "monitoring":     "MONITORING AGENT",
    },
  }],

  // … solutionHome, planDialog, hubLabels — existing TPRM content
  auditLogObjectFilter: (event, vendorId) => event.objectId === vendorId,
};
```

## 6.3 Risk Assessments — stub registration (the next-up solution)

```ts
const riskAssessments: SolutionDefinition = {
  id: "risk-assessments",
  label: "Risk Assessments",
  description:
    "Coordinate enterprise risk surveys, auto-score operational items, and surface drift in heat maps as it happens.",
  icon: Compass,
  strategicTargets: ["enterprise risk", "operational risk", "ERM coordination"],

  objectType: {
    id: "entity",
    singular: "Entity",
    plural: "Entities",
    icon: Building2,
    schemaFields: [
      { id: "id",            label: "Entity ID",         group: "Identity",        kind: "text" },
      { id: "entityName",    label: "Entity Name",       group: "Identity",        kind: "text" },
      { id: "legalForm",     label: "Legal Form",        group: "Identity",        kind: "enum" },
      { id: "geography",     label: "Geography",         group: "Classification",  kind: "enum" },
      { id: "businessUnit",  label: "Business Unit",     group: "Classification",  kind: "enum" },
      { id: "headcount",     label: "Headcount",         group: "Classification",  kind: "number" },
      { id: "revenue",       label: "Revenue",           group: "Classification",  kind: "text" },
      { id: "riskScore",     label: "Risk Score",        group: "Status",          kind: "number" },
      { id: "lastAssessed",  label: "Last Assessed",     group: "Status",          kind: "date" },
      { id: "respondents",   label: "Respondents",       group: "ConnectedData",   kind: "list" },
      { id: "kriDataSources", label: "KRI Data Sources", group: "ConnectedData",   kind: "list" },
    ],
    pipelineDisplay: { /* … */ },
    detailsTabSections: [
      { id: "entity-info",      title: "Entity Information",   content: [/*…*/], sidebar: [/*…*/] },
      { id: "operating-profile", title: "Operating Profile",   content: [/*…*/], sidebar: [/*…*/] },
      { id: "risk-posture",      title: "Risk Posture",        content: [/*…*/], sidebar: [/*…*/] },
    ],
    optionalTabs: [
      // Risk-specific:
      { id: "kris", label: "KRIs", render: (e) => <EntityKrisTab entity={e} /> },
      { id: "heatmap", label: "Heat Map", render: (e) => <EntityHeatmapTab entity={e} /> },
    ],
  },

  workflows: [{
    id: "risk-assessment",
    label: "Risk Assessment",
    tabVerb: "Assessment",
    emptyStateCtaVerb: "Run Assessment",

    cycles: [
      { id: "quarterly", label: "Quarterly Assessment", period: "Q1 2026", status: "Not Started" },
      { id: "annual",    label: "Annual Assessment",    period: "FY26",     status: "In Progress" },
      { id: "ad-hoc",    label: "Ad-hoc Assessment",    period: "—",         status: "Not Started" },
    ],

    steps: [
      // (steps to be authored — illustrative only)
      { id: "synthesis",       ordinal: 1, shortLabel: "Syn",  title: "Intelligence Synthesis", /*…*/ },
      { id: "template",        ordinal: 2, shortLabel: "Tmpl", title: "Template Selection",     /*…*/ },
      { id: "scope",           ordinal: 3, shortLabel: "Scope", title: "Scope Confirmation",    /*…*/ },
      { id: "distribution",    ordinal: 4, shortLabel: "Dist", title: "Survey Distribution",    /*…*/ },
      { id: "tracking",        ordinal: 5, shortLabel: "Trk",  title: "Response Collection",    /*…*/ },
      { id: "scoring",         ordinal: 6, shortLabel: "Scr",  title: "Risk Scoring",           /*…*/ },
      { id: "consolidation",   ordinal: 7, shortLabel: "Cons", title: "Consolidate Findings",   /*…*/ },
      { id: "reporting",       ordinal: 8, shortLabel: "Rpt",  title: "Report Generation",      /*…*/ },
    ],

    tracks: [
      { id: "auto-assess",  label: "Auto-Assessment Track",  description: "Operational entities scored from KRI data", ordinal: 1 },
      { id: "survey-track", label: "Survey-Driven Track",    description: "Entities requiring respondent surveys",     ordinal: 2 },
    ],
    trackSkipRules: [
      { trackId: "auto-assess", stepId: "distribution", reason: "Auto-track skips distribution; KRI data drives scoring" },
      { trackId: "auto-assess", stepId: "tracking",     reason: "Auto-track skips tracking; no respondents to monitor" },
    ],

    outcomeStates: [
      { id: "low",     label: "Low Risk",    tone: "success",   icon: ShieldCheck },
      { id: "medium",  label: "Medium Risk", tone: "warn",      icon: ShieldCheck },
      { id: "high",    label: "High Risk",   tone: "error",     icon: AlertTriangle },
      { id: "drifting", label: "Drifting",    tone: "follow-up", icon: Activity },
    ],

    runContextSchema: {
      slots: [
        { id: "leadAssessor",   label: "Lead Assessor",       kind: "person" },
        { id: "reviewer",       label: "Reviewer",            kind: "person" },
        { id: "templateId",     label: "Template",            kind: "id" },
        { id: "executiveSponsor", label: "Executive Sponsor", kind: "person" },
        { id: "respondentCount",  label: "Respondents",       kind: "text" },
        { id: "windowDays",       label: "Survey Window",     kind: "text" },
        { id: "scopeBoundary",    label: "Scope",             kind: "text" },
        { id: "dueDate",          label: "Due Date",          kind: "date" },
      ],
    },

    terminalArtifact: {
      label: "Risk Briefing",
      verb: "Generate Risk Briefing",
      sectionsBuilder: (entityId) => buildRiskBriefingSections(entityId),
    },

    agentNameByStep: { /* … */ },
  }],

  // … solutionHome, planDialog — to be authored
  auditLogObjectFilter: (event, entityId) => event.objectId === entityId,
};
```

---

# Part 7 — Walkthrough: Registering a new solution

The recipe for taking a `SolutionDefinition` from "drafted" to "shipping in the prototype." Replaces and supersedes `workflow-archetype.md` § 3.

## Step 1 — Author the `SolutionDefinition`

Create `client/src/solutions/<solution-id>/definition.ts` and export a complete `SolutionDefinition`. Use Part 6 examples as templates.

You only have to fill in declarative data. **No layout code.** No tab wiring. No stepper code. No HITL plumbing.

## Step 2 — Author per-tab body components (only for optional tabs)

Required tab bodies (Details / Workflow / Audit Log) are rendered by the framework. You only need to author bodies for the optional tabs your object type declares.

Example:
- Control declares `optionalTabs: [issues, automations]` → author `<ControlIssuesTab>` and `<ControlAutomationsTab>`.
- Vendor declares `optionalTabs: []` → no extra components needed.
- Entity declares `optionalTabs: [kris, heatmap]` → author `<EntityKrisTab>` and `<EntityHeatmapTab>`.

## Step 3 — Author the simulator (tick function)

A pure function that advances the workflow status one tick. Signature:

```ts
function tick<Solution>Statuses(
  prev: ObjectRunStatus[],
  resolvedHitlSet: Set<string>
): ObjectRunStatus[] | null;  // returns null when no change
```

The framework calls this on a 800ms interval while the workflow is `"running"`. The framework already handles HITL gates, skip rules, and inline-affordance side effects — your tick function only models the agent's progress speed.

## Step 4 — Register the solution

```ts
// client/src/solutions/index.ts
import { sox } from "./sox-control-testing/definition";
import { tprm } from "./tprm/definition";
import { riskAssessments } from "./risk-assessments/definition";

export const registeredSolutions: SolutionDefinition[] = [
  sox,
  tprm,
  riskAssessments,
];
```

The framework picks up the registration on load. The L1 Solutions Home, the side nav, the session router — everything wires automatically.

## Step 5 — Add a route (one line)

```tsx
// client/src/App.tsx
<Route path="/<solution-id>-planning" component={SolutionPlanningPage} />
```

`SolutionPlanningPage` is a single shared component that takes the active solution from the route param and renders the Plan dialog from the registration.

## Step 6 — Walk the acceptance checklist

Before merging, walk every row of the [acceptance checklist](./ui-pattern-canon.md#44-acceptance-checklist). Any failed row is either:
- a bug in your registration (your `SolutionDefinition` is incorrect — fix it), or
- a bug in the framework (the framework guarantee is broken — file a P0).

**There is no third option.** If a feature is missing because "I'll add it later", that means your registration is incomplete and not ready to merge.

## Step 7 — Update solution status

Append a row to [`ui-pattern-canon.md` § 4.6 Per-solution implementation status](./ui-pattern-canon.md#46-per-solution-implementation-status).

---

## Companion docs

- [`ui-pattern-canon.md`](./ui-pattern-canon.md) — pixel-level visual reference for every component referenced here, plus the live TPRM drift audit (now framed against the corrected 3-required-tabs model).
- [`workflow-archetype.md`](./workflow-archetype.md) — implementation recipe for engineers, file structure, conventions.

## Maintenance notes

- The `SolutionDefinition` schema in Part 5 is the contract. Adding a new field to the schema is allowed but counts as a breaking change to all existing solutions — they need to be updated in lockstep.
- The required tab slots in Part 2.6.1 (Details / Workflow / Audit Log) are immutable. If a future need surfaces, do not add a fourth required tab — declare it as an optional object-type-specific tab and let solutions opt in.
- The 8-slot run-context schema is locked at 8. Future relaxation to "4 required + 4 optional" is on the roadmap when a solution legitimately can't fill all 8.
- The HITL gate vocabulary (Approve / Modify / Reject) is locked. Solutions with additional decision options should express them as Modify subdialogs.
