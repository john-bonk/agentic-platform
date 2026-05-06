# Optro Agentic Platform — UI Pattern Canon

**Pixel-level visual + interaction reference for the platform.** Companion to [`solution-framework.md`](./solution-framework.md), which defines the architectural taxonomy and the registration schema.

The canon is **SOX Control Testing**, drilled down to **CTL-003 Segregation of Duties**. Every claim is grounded in code references in `client/src/components/workspace/AgentHubHome.tsx` and `client/src/components/workspace/WorkflowSession.tsx`. The TPRM implementation (`TPRMSession.tsx`) deliberately tries to mirror canon and *mostly* succeeds; the gaps are catalogued in **Part 2: TPRM Drift Audit**.

> **Doc layering.** `solution-framework.md` defines *what* the platform is (taxonomy + schema). This doc defines *how every component looks and behaves*. When the two disagree, framework wins on architecture; canon wins on pixels.

> **Tab model — corrected.** A previous version of this doc declared a four-tab focus page (`Details / Testing / Issues / Automations`) as the invariant. That was over-prescription. The framework-correct model is **3 required tab slots** (Details/Overview, Workflow, Audit Log) plus **N optional object-type-specific tabs** (Issues and Automations are *Control-specific* extensions; Vendor today has zero optional tabs and that is correct). Part 1.5.2 below has been rewritten accordingly, and Part 2 has been re-graded.

---

## Table of contents

- [Part 1 — Canon (Control Testing, CTL-003)](#part-1--canon-control-testing-ctl-003) — pixel-level visual reference
  - [1.1 Page hierarchy](#11-page-hierarchy)
  - [1.2 Solution-level Home (`OptroHome`)](#12-solution-level-home-optrohome)
  - [1.3 Plan dialog](#13-plan-dialog)
  - [1.4 Hub view (`FieldworkComplexHub`)](#14-hub-view-fieldworkcomplexhub)
  - [1.5 Focus page (`ControlFocusPage`)](#15-focus-page-controlfocuspage)
  - [1.6 Substep rendering (`StepNodeContent`)](#16-substep-rendering-stepnodecontent)
  - [1.7 Right-side utility panel (`ControlUtilityPanel`)](#17-right-side-utility-panel-controlutilitypanel)
  - [1.8 Generated artifact step ("Outputs")](#18-generated-artifact-step-outputs)
  - [1.9 Summary report page (`ControlSummaryReport`)](#19-summary-report-page-controlsummaryreport)
  - [1.10 Assistant integration (mirroring)](#110-assistant-integration-mirroring)
  - [1.11 State vocabulary](#111-state-vocabulary)
  - [1.12 Visual tokens](#112-visual-tokens)
- [Part 2 — TPRM Drift Audit](#part-2--tprm-drift-audit-databridge-analytics-ven-004) — re-graded against the corrected framework
- [Part 3 — Pattern framework](#part-3--pattern-framework--see-solution-frameworkmd) — pointer to [`solution-framework.md`](./solution-framework.md)

---

# Part 1 — Canon (Control Testing, CTL-003)

## 1.1 Page hierarchy

A canonical solution lives inside a **seven-level platform taxonomy** (see [`solution-framework.md`](./solution-framework.md) Part 1 for the full architectural model). For the pixel-level pattern reference here, the page-level hierarchy is:

```
L0  Org Workspace shell           ─ left icon nav, side nav, top bar, persistent home assistant
L1  Solutions Home                ─ "Welcome to Optro / Pick a solution area"
L2  Solution Home                 ─ OptroHome({ solutionId })  (Tasks · Pending Approvals · Agent Workflows · Audit Trail)
L3  Plan dialog                   ─ pre-launch confirmation, modal layered over L2
L4  Hub                           ─ FieldworkComplexHub  (4-card stats · Actions · Pipeline grid · Audit Log)
L5  Focus page                    ─ ControlFocusPage  (Header · tab strip · Stepper · Step content · Footer · Utility panel)
L6  Generated artifact pages      ─ ControlSummaryReport, ExecutiveReportView (full-screen, headed)
```

`L5` is the **center of gravity** of the experience. Every visible interaction with the agent — start, configure, watch, intervene, approve, conclude, export — happens in `L5`. The drift in TPRM is concentrated entirely in `L5`.

> Section numbers below refer to canon source code where it lives today; the level-letters above are the architectural hierarchy. The two are aligned but not identical: § 1.2 is *the canonical visual spec for what the L2 Solution Home looks like*, etc.

## 1.2 Solution-level Home (`OptroHome`)

File: `client/src/components/workspace/AgentHubHome.tsx` → `OptroHome({ solutionId })` (≈ line 1289).

```
┌── ← All solutions ────────────────────────────────────────────────┐
│   [Solution title]                                                  │
│                                                                     │
│   YOUR TASKS                                                        │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │ [icon] Primary task label   [Priority] ………… [⚙][▶ Start]   │    │
│   │ Sub-text                                                    │    │
│   └────────────────────────────────────────────────────────────┘    │
│   > More tasks (n)                                                  │
│                                                                     │
│   PENDING APPROVALS    (4)                AGENT WORKFLOWS    (n)    │
│   ┌─────────────────────────────────┐    ┌──────────────────────┐   │
│   │ • Approval row 1   …………… [tag]  │    │ ✦ Direct Action      │   │
│   │ • Approval row 2   …………… [tag]  │    │ ↻ Continuous         │   │
│   │ • Approval row 3   …………… [tag]  │    │ ⌚ Scheduled          │   │
│   │ • Approval row 4   …………… [tag]  │    │ ⚡ Emergent           │   │
│   └─────────────────────────────────┘    └──────────────────────┘   │
│                                                                     │
│   AUDIT TRAIL  (n events)                                       >   │
└─────────────────────────────────────────────────────────────────────┘
```

Invariant rules:

- The **Tasks card** has at most one `primary: true` task that owns the prominent **Start** CTA. The Start button must launch directly into the **Plan dialog** (L2), not the Hub.
- The Start CTA is paired with a **gear** (configure) icon button that opens the same Plan dialog with the wizard pre-expanded. (The TPRM solution-home omits this gear today; that is itself a drift.)
- Pending Approvals, Agent Workflows, and Audit Trail are **always present**, even when empty (render an empty state, not nothing).
- Section ordering is fixed: Your Tasks → Pending Approvals + Agent Workflows (side by side) → Audit Trail.
- The four `Agent Workflows` categories are fixed for the whole platform: `Direct Action`, `Continuous`, `Scheduled`, `Emergent`. Counts vary; categories don't.

## 1.3 Plan dialog

The Plan dialog is the user's last chance to confirm scope before the workflow launches. It is also the only surface on which the **configuration wizard** is exposed for the cold-start case.

Required structure (top → bottom):

1. **Header strip** — solution icon + title + 1-line summary. Close button (×) in the top right.
2. **Scope callout** (single paragraph, slate-50 card) — *narrative* explanation of how the system selected the in-scope set, with up to four small inline metrics chips (Period · Threshold · Prior Findings · Coverage Gaps).
3. **4-stat grid** — the same four stats that will appear in the Hub when running. The numbers must reconcile.
4. **Configuration Wizard strip** *(when wizard steps are defined)* — a horizontal numbered strip (1·2·3·4·5) showing each `configWizardSteps[i]` with title + sub-text. Read-only here; clickable in the gear flow.
5. **Per-object workflow preview** — a vertical list of the steps with `agentRole` blurb each. (No phase grouping unless the solution declares phases.)
6. **Selection table** — the in-scope objects, grouped by their classification (category, tier, criticality), with checkboxes to opt out.
7. **Footer** — `Cancel` (left), `Confirm & Start <verb>` primary button (right). The verb matches the solution: "Workflow" / "Assessment" / "Review" / etc.

## 1.4 Hub view (`FieldworkComplexHub`)

File: `client/src/components/workspace/AgentHubHome.tsx` → `FieldworkComplexHub` (≈ line 5980).

```
╔════════════════════════════════════════════════════════════════════════════════╗
║  [Shield] Solution title                          [✓ Complete?]  [↗ Open Wf] [⋮]
║  Sub-status sentence
╠════════════════════════════════════════════════════════════════════════════════╣
║  ┌─────────────┬─────────────┬─────────────┬───────────────────┐               ║
║  │  Scope      │  Auto Cov   │  Tested     │  Exceptions ▶     │  ← stat band  ║
║  │  25         │  64%        │  0 of 25    │  0 from testing   │  (4 cards)    ║
║  └─────────────┴─────────────┴─────────────┴───────────────────┘               ║
║                                                                                ║
║  ┌── Actions Required (n blocking) ────────────────────────────  [▾]──┐       ║
║  └────────────────────────────────────────────────────────────────────┘       ║
║                                                                                ║
║  ┌── Control Pipeline ─────────────────────────────────────────────────┐      ║
║  │  CONTROL  | SOURCE | RDY | POP | SMP | EVD | TST | EFF | RES        │      ║
║  │  • PBC WORKFLOW (n/m)                                                │      ║
║  │    CTL-003   PBC    ✓   …                                            │      ║
║  │    …                                                                  │      ║
║  │  • AUTOMATED (n/m)                                                    │      ║
║  │    CTL-001   ⚡Auto  ◐   …                                            │      ║
║  │    …                                                                  │      ║
║  │  Legend: complete · running · waiting · blocked · pending · effective │      ║
║  └──────────────────────────────────────────────────────────────────────┘      ║
║                                                                                ║
║  ┌── [✦] Optro Assistant: Audit Log  (n entries)                  [▾]──┐      ║
║  └──────────────────────────────────────────────────────────────────────┘      ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

### 1.4.1 Header

- Left cluster: solution `Shield` icon (`#266C92`), title (text-sm font-semibold), one-line dynamic sub-status.
- Right cluster: optional `Complete` badge (`bg-[#266C92]/10`), **`Open Workflow`** outline button with `ExternalLink` icon, **`⋮` kebab menu** (always present). The kebab contains:
  - `Fast-forward demo` (canon places it here, *not* as a top-level button).
  - Future: `Pause workflow`, `Reset state`.

### 1.4.2 Stats grid

Always **4** cards in `grid grid-cols-4 gap-3`. The slot semantics are fixed even if the labels change per solution:

| Slot | Canon label (SOX) | Generic label | Behavior |
|------|-------------------|----------------|----------|
| 1 | Controls in Scope | "<Object> in Scope" | Static count; no interactivity. |
| 2 | Automated Coverage | "Automated Coverage" | % auto-track + sub-line "n connected systems" / "n auto-track <objects>". |
| 3 | Controls Tested | "<Object>s Closed" | Live counter: completed / total + percentage. |
| 4 | Exceptions | "Open Exceptions" | **Clickable when count > 0** → opens an `<Dialog>` (`max-w-3xl max-h-[80vh]`) with finding rows that drill into the focus view. Border + count text turn red. Subtitle copy switches: `from testing` → `n high severity`. |

### 1.4.3 Actions Required panel

- **Default collapsed.** Header row: `AlertCircle red-500` + `Actions Required` + count badge. Chevron rotates `-90°` when collapsed.
- Expanded body lists `blockedActions[]`. Each item:
  - Row 1: severity icon (`AlertCircle red` for blocked, `Clock amber` for waiting) + `OBJECT-ID` (mono, `#266C92`) + object title + right-aligned status badge ("Blocked at <Step>" / "Awaiting reviewer · <Step>").
  - Row 2: muted description (`text-[11px] leading-relaxed`).
  - Row 3: actions — primary `Resolve & Resume` (canon) **or** secondary `Open <Object>` + tertiary `Quick Approve` (when `kind === "waiting"`).

### 1.4.4 Pipeline card

Grid template: `grid-cols-[3fr_5rem_repeat(<stepCount>,1fr)_1fr]` — *(Object | Source | step columns | Result)*. Step short labels are 3–4 chars (`Rdy / Pop / Smp / Evd / Tst / Eff` for SOX; `Intake / Tier / Outside-In / Docs / Score / Triage / Review / Remediate / Monitor` for TPRM).

- Rows are grouped by **track**, in this order:
  1. Whichever track is *more human-touched* (PBC for SOX, Human-Review for TPRM).
  2. Whichever track is *more automated* (Connected for SOX, Automated for TPRM).
- Each group has a 1-line header: `[colored dot] TRACK NAME (n/m)` in `text-[10px] uppercase tracking-wider`.
- Row hover: `border-l-2 border-l-transparent hover:border-l-[#266C92] hover:bg-[#266C92]/5`. Rows that have a blocked/red outcome use `border-l-red-400 bg-red-50/30` instead.
- Row click → drills into the focus page (L4).
- Step status icons: `CheckCircle2 #266C92` complete, `Loader2 animate-spin #266C92` running, `Clock slate-400` waiting, `AlertCircle red-500` blocked, hollow circle pending. Result column adopts a step-terminal icon: `ShieldCheck #266C92` (effective/approved), `AlertTriangle red-500` (ineffective/rejected), `Activity violet-500` (re-assess), or stays hollow.
- The **Legend** is always rendered at the bottom of the card, as a single `flex items-center gap-2 text-[10px] text-muted-foreground` line. **Every** symbol that can appear in any row in any state must be listed in the legend. (TPRM does this well.)

### 1.4.5 Audit Log

- **Default collapsed.** Header `Bot` icon + `Optro Assistant: Audit Log (n entries)`.
- Expanded body: a top welcome bubble with `Bot` avatar (`bg-[#266C92]`) + `text-[10px] font-semibold text-[#266C92]` agent name + `text-[11px] leading-relaxed` body text, then a `divide-y` chronological list. Entry types: `success / warning / action-needed / info`, each with a `border-l-2` colored cue and timestamp prefix `T-MMm`.

### 1.4.6 Scroll modality

Two scroll modes (both implemented in canon and TPRM):

| Condition | Outer wrapper | Inner column | Pipeline card body |
|-----------|---------------|--------------|--------------------|
| Both Actions Required + Audit Log collapsed (default) | `flex flex-col overflow-hidden` (fixed viewport) | `h-full` | `flex-1 min-h-0 overflow-y-auto` (scrolls *inside the pipeline*) |
| Either expanded | `overflow-y-auto` (full-pane scroll) | _no `h-full`_ | _no inner scroll_ |

Single derived flag: `const fullPaneScroll = actionsExpanded || auditLogExpanded;`. The tracker **must never shrink** when a section expands — push the page instead.

### 1.4.7 Next Steps card (terminal state)

Only when `isComplete === true`. Border `#266C92/20`, background `#266C92/[0.03]`, header `ListChecks #266C92` + "Next Steps" + count badge. Body is a 2-column grid of action tiles, each a `<button>` that emits `window.dispatchEvent(new CustomEvent("workflow-session:open-detail", { detail: { viewId: ... } }))` to open the corresponding L5 artifact view.

## 1.5 Focus page (`ControlFocusPage`)

File: `client/src/components/workspace/AgentHubHome.tsx` → `ControlFocusPage` (≈ line 4912). **The most important contract in the platform.**

```
╔════════════════════════════════════════════════════════════════════════════════╗
║ ←Overview │ [🛡] CTL-003 — Segregation of Duties              [Effective?]   ║   h-12 header bar
╠════════════════════════════════════════════════════════════════════════════════╣
║  Details │ Testing (Interim ▾) │ Issues │ Automations                          ║   border-b-2 tab bar
╠════════════════════════════════════════════════════════════════════════════════╣
║  ╳━━━━━●━━━━━━━●━━━━━━━●━━━━━━━●━━━━━━━○━━━━━━━○                          [⏸]║   stepper sub-band
║  Readiness  Population  Sampling  Evidence  Testing  Effectiveness            ║
║  ▾  TEST DETAILS                                                              ║   collapsible
║     Tester · PBC Request · Sample Size · Sample Selections                    ║
║     Reviewer · Secondary Reviewer · Budgeted Hours · Due Date                 ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║   Evidence  [Blocked]  [⚡ Auto]                                               ║
║   Step 4 of 6: AI maps evidence requirements …                                 ║
║                                                                                ║
║   1 ✓ □ Requirement Mapping   (description, mode icon)                        ║   <— substep rows
║   2 ✓ □ Source Identification                                                  ║
║   3 ◐ □ Collection & Upload                                                    ║
║       [📤 Request via Workstream] [⬆ Upload Evidence]                          ║   <— inline action row
║   4 ○ □ Document Classification                                                ║
║   5 ○ □ Field Extraction                                                       ║
║   6 ○ □ Value Parsing                                                          ║
║   7 ○ □ Cross-Reference Validation                                             ║
║                                                                                ║
║  ╔══ ⚠ SoD Matrix Upload Required ════════════════════════════ [high] ══╗     ║   block notice
║  ╚══════════════════════════════════════════════════════════════════════╝     ║
║                                                                                ║
╠════════════════════════════════════════════════════════════════════════════════╣  │  ✦
║  ‹ Previous Step                            [✓ Confirm & Continue] [Next ›]   ║  │  💬   ← utility
╚════════════════════════════════════════════════════════════════════════════════╝  │  📝     panel
                                                                                       │  📎     icon strip
                                                                                       │  ⌚
```

### 1.5.1 Header bar (`h-12`)

- `Back button` — `ChevronLeft` + literal text `"Overview"`. **Always "Overview"**, never "Hub", "Pipeline", "Tracker".
- Vertical separator (`w-px h-5 bg-slate-200`).
- Solution `Shield` icon (`#266C92`) + `OBJECT-ID` (mono, semibold) + ` — ` em-dash + object name (foreground).
- (Optional) inline classification badge — risk level / tier — next to the name. Canon does NOT render one for SOX (the level is in the Details tab); TPRM renders a `Tier 2` badge here. Both are acceptable, but the framework picks **canon-strict (no inline badge)**: the badge belongs to the Details tab. *(See drift §2.6.)*
- Right side: outcome badge (`ml-auto`). Tones: Effective (`#266C92/10`) · Ineffective (`red-50/red-600`) · Approved · Conditional (`amber-50`) · Rejected (`red-50`) · Re-Assess (`violet-50`) · In Progress (`slate-100`). Use `border-0`, `text-[10px]`.

### 1.5.2 Tab bar — **3 required slots + N optional**

The tab bar has three **invariant required slots** plus zero or more **optional object-type-specific tabs**. The required slots are platform-uniform; the optional tabs are declared per object type in the registration schema (see [`solution-framework.md`](./solution-framework.md) Part 3.3).

#### Required tab slots (always present, in this order)

| Slot | Tab label | Purpose | Body component |
|------|-----------|---------|----------------|
| 1 | **Details** *(or `Overview`)* | Static schema view of the object record. Two-column layout: descriptive content sections (left) + metadata sidebar (right, `grid grid-cols-[1fr_220px]`). Read-only. | `<ObjectDetailsTab>` |
| 2 | **<Workflow verb>** *(dynamic — `Testing` / `Assessment` / `Review` / `Diligence` / `Readiness` / …)* | The agentic execution surface. Default tab on entry. May have a **cycle dropdown** (chevron) appended to the tab label when the workflow declares cycles. | Stepper + run-context band + step content + footer. |
| 3 | **Audit Log** | Object-filtered view of the master Hub-level Audit Log. Tabular: When · Actor · Type (AI/AUTO/HITL pill) · Action. | `<ObjectAuditLogTab>` (framework-rendered; `auditLogObjectFilter` from registration drives the filter) |

The Workflow-tab label is the **only** required tab whose label varies. Details/Overview and Audit Log are platform-uniform labels (a solution picks "Details" or "Overview" once for its object type; don't switch terminology mid-platform).

#### Optional object-type-specific tabs

Inserted **between the Workflow tab and the Audit Log tab**. Declared per object type:

| Object type | Optional tabs (canon today / proposed) |
|-------------|----------------------------------------|
| Control | `Issues`, `Automations` |
| Vendor | *(none today)* — the framework correctly accepts zero optional tabs |
| Entity *(future Risk Assessments)* | `KRIs`, `Heat Map` |
| Audit *(future)* | `Workpapers`, `Findings`, `Recommendations` |
| Risk *(future)* | `Mitigations`, `Treatments`, `KRIs` |
| Issue *(future)* | `Remediation`, `Linked Records` |

Discipline rule: an optional tab must represent a **substantively different surface** from any required tab — not a re-cut of the same data. If your "Issues" tab would just filter the Audit Log, don't add it; add it only if Issues have their own lifecycle (open / in remediation / closed).

#### Tab styling (invariant)

- `py-2.5 text-sm font-medium border-b-2 transition-colors`.
- Active: `border-[#266C92] text-[#266C92]`.
- Inactive: `border-transparent text-muted-foreground hover:text-foreground`.
- Tab labels are sentence case.
- The Workflow-tab cycle suffix (when present): `text-[10px] text-muted-foreground font-normal`, in parentheses, with a chevron.

### 1.5.3 Cycle dropdown (Testing tab only)

Critical canon pattern. The Testing tab uniquely shows `(Walkthrough)` / `(Interim)` / `(Rollforward)` next to its label — the **current test cycle** for the active object. Clicking the tab while it is already active opens a dropdown with all cycles, each labelled with its period and a status pill (`Complete` emerald · `In Progress` `#266C92/10` · `Not Started` slate). Selecting a cycle filters the entire stepper + step content beneath it.

Why it matters: this is the platform's first-class abstraction for *re-running* a workflow against the same object. Other solutions need an equivalent: TPRM's parallel concept is the `lastAssessmentDate / nextAssessmentDue / monitoring trigger` — those should be exposed as cycles (Walkthrough → Periodic → Triggered re-assessment). Currently TPRM does **not** expose a cycle dropdown, which means a vendor's prior assessment results are not navigable from the same UI. *(See drift §2.3.)*

### 1.5.4 Stepper sub-band (Testing tab only)

- Background `bg-slate-50/80 dark:bg-muted/20` — visually distinguishes the workflow band from the page chrome.
- Progress line: 1px `bg-slate-200` track with a `bg-[#266C92]` fill sized by `(completed / (total - 1)) * 100%`.
- Step pills: `rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-2 ring-slate-50` (the ring punches them out of the line). Status mapping:
  - active → `bg-[#266C92] text-white shadow-sm`
  - complete → `bg-slate-50 text-[#266C92]` + `CheckCircle2 w-3`
  - running + active → `Loader2 animate-spin w-3`
  - waiting → `text-amber-600` + `Clock w-3`
  - blocked → `text-red-500` + `AlertCircle w-3`
  - skipped (track-skip) → `text-muted-foreground/60` + `—` glyph
  - pending → muted, no icon
- Pills are clickable when their step is reachable (`canNavigateTo(idx)` — running, complete, blocked, waiting; or immediately after a complete step). Otherwise `cursor-default disabled`.
- A 7×7 **Pause/Resume button** sits at the right end of the stepper band when in demo mode.
- `Outputs` step pill is appended dynamically once `outputsGenerated === true` (see § 1.8).

### 1.5.5 Run-context band ("TEST DETAILS")

Below the stepper, a collapsible section labelled `TEST DETAILS` (canon) — generically the **run-context band**. **Default collapsed.** Toggle is a `ChevronDown` (rotates `-90` when collapsed) + uppercase mini-label.

Body: a `grid grid-cols-2 gap-x-16 gap-y-3` of `[uppercase right-aligned label, w-28][value]` pairs. Required fields:

| Slot | Canon | Generic semantics |
|------|-------|-------------------|
| 1 | Tester | Person/agent currently executing |
| 2 | Reviewer | Person/agent reviewing work product |
| 3 | PBC Request | The request id this run is bound to (PBC, RFI, DPQ, …) |
| 4 | Secondary Reviewer | Optional second-line reviewer |
| 5 | Sample Size | Cardinality of the work this run will perform |
| 6 | Budgeted Hours | Time budget (`—` if unset) |
| 7 | Sample Selections | Which slice of the population was selected |
| 8 | Due Date | Hard deadline for this run |

Translation rule: every solution must define an 8-field run-context schema. The slot semantics (executor / reviewer / request id / second-line / cardinality / time budget / scope slice / due date) are invariant; the *labels* and *value formats* vary.

### 1.5.6 Step header

- `flex items-center gap-2`. Left: step title `text-base font-semibold`, status badge (`text-[9px] border-0`, tone-keyed), **automation-mode pill** (`Zap`/`Flag`/`Fingerprint` icon + uppercase short label `AUTO`/`CHECK`/`MAN`).
- Right side: empty (action lives in footer).
- Sub-line: `Step n of N: <step.aiDescription>` in `text-xs text-muted-foreground`.

The automation-mode pill is critical: it is what tells the user *whether the agent is allowed to advance without their explicit confirmation on this step*. It is **not** the same as the action-type icon on individual substeps; that is the agent species (AI / AUTO / HITL). The mode is per-step policy.

### 1.5.7 Empty state — "Test with Agent" gate

If `controlStatus` is `null` *or* every step is `pending`, render the empty-state CTA panel instead of the stepper + content. This is the **cold-start UI** for a freshly-loaded object.

Layout: `flex-1 min-h-0 flex items-center justify-center` with a centered `max-w-md text-center space-y-5` column:

1. `Bot` icon in a `w-14 h-14 rounded-2xl bg-[#266C92]/10` square.
2. Title `text-lg font-semibold`: **"Automated Control Testing"** *(per-solution verb)*.
3. Description sentence with `<OBJECT-ID> — <Object name>` highlighted.
4. **Automation-mode summary card** (`p-3 rounded-lg bg-slate-50/80 border border-slate-200/60`):
   - If all steps share the same mode: header line "<Mode label> across all steps" + 1-sentence description of what that means.
   - If mixed: small icon row showing `n auto · n checkpoint · n manual` counts.
5. **Action row**: `Test with Agent` primary button (`h-10 bg-[#266C92]`) + `Settings` gear icon button (opens `<AutomationConfigModal>`).
6. **Footnote**: `text-[11px] text-muted-foreground` summarising step count + estimated duration.
7. **Step preview chips**: a horizontal `gap-6` row of `[• step short label]` for every step in this workflow, with a 2px slate dot — gives the user a final preview before committing.

TPRM is missing this entire empty state today. *(See drift §2.7.)*

### 1.5.8 Step content area

`flex-1 min-h-0 overflow-y-auto` containing a `w-[90%] mx-auto px-6 py-6 space-y-6` wrapper.

Order:
1. Step header (§ 1.5.6).
2. `<StepNodeContent>` — substep list (§ 1.6).
3. Step-specific extra panels — only when `step.id === "monitoring"` render `<MonitoringLivePanel>`.
4. **Effectiveness/Outcome banner** *only when `isComplete && step === lastStep`* (§ 1.5.10).

### 1.5.9 Footer bar

`shrink-0 h-12 px-6 py-3 border-t bg-card`. The footer **never** holds the HITL Approve/Modify/Reject buttons — those are inline in the substep area (§ 1.6.3). The footer's responsibility is only step navigation:

| Left | Right |
|------|-------|
| `‹ Previous Step` (ghost, `disabled` on first step) | Order from outside in: **inline-action buttons** (per `stepNodeInfo[step].actions[]` filtered by `showWhen`), then a **terminal CTA** (`Confirm & Continue` while running with all substeps done; `Generate Workpaper` on the last fieldwork step; `View Control Summary` when `isComplete && onViewReport`), then `Next Step ›` when the active step is complete and not the last. |

If `activeStepStatus === "waiting"` and the active step has an HITL gate, the right side shows the italic muted note `"Awaiting reviewer disposition above ↑"` and **no buttons**.

### 1.5.10 Outcome banner

Inside the step content area, only on the terminal step, only when `isComplete`. Container: `p-4 rounded-xl border`. Tone matrix:

| Tone | Border | Background | Text | Icon |
|------|--------|------------|------|------|
| effective / approved | `[#266C92]/20` | `[#266C92]/5` | `[#266C92]` | `ShieldCheck` |
| conditional | `amber-200` | `amber-50/50` | `amber-700` | `ShieldCheck amber-600` |
| ineffective / rejected | `red-200` | `red-50/50` | `red-600` | `AlertTriangle red-500` |
| re-assess / monitor | `violet-200` | `violet-50/50` | `violet-700` | `Activity violet-500` |

Body: `flex items-center gap-2` with the icon then `<Outcome label>: <Outcome verb>`.

### 1.5.11 Toast feedback

Bottom-centered, absolute, `bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-medium shadow-lg flex items-center gap-2` with a `CheckCircle2 w-3.5`. Auto-dismisses after 3s. Used for *every* substep- or step-level confirmation: "Population data uploaded — validating…", "Step confirmed — advancing to Sampling", etc. TPRM omits the toast entirely. *(See drift §2.10.)*

## 1.6 Substep rendering (`StepNodeContent`)

File: `client/src/components/workspace/AgentHubHome.tsx` → `StepNodeContent` (≈ line 3078).

### 1.6.1 Row anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│  [N]  [●]  [⚡] Substep title                                  [▾]     │
│                Description, two muted lines if present                  │
└────────────────────────────────────────────────────────────────────────┘
```

- `N` — plain integer index `{idx + 1}`. Width `w-4 text-right font-mono text-[9px] text-muted-foreground`. **Never** `{ordinal}.{idx+1}`.
- `●` — `<SubStepIndicator>` (`w-3.5 h-3.5`). States: complete (`CheckCircle2 #266C92`), running (`Loader2 animate-spin #266C92`), waiting (`Clock amber-500`), blocked (`AlertCircle red-500`), pending (hollow circle).
- `⚡` — automation **action-type** icon: `Zap` emerald (auto) · `Bot` blue (ai) · `Fingerprint` amber (hitl). Always `w-2.5 h-2.5 opacity-70` and **icon-only** — never a colored pill.
- Title — `text-xs font-medium`, foreground when complete/running, muted otherwise.
- Description — `text-[11px] text-muted-foreground leading-relaxed mt-0.5`.
- Right-edge chevron `ChevronDown w-3.5` only when the row is expandable.

Row background by status: running `bg-[#266C92]/[0.04]` · waiting `bg-amber-50/40 border border-amber-200/60` · blocked `bg-red-50/30` · checkpoint-held `bg-amber-50/40 border border-amber-200/60` · manual-waiting `bg-blue-50/40 border border-blue-200/60` · pending `opacity-50`.

### 1.6.2 Inline action affordances (canon-only, must replicate per solution)

When a substep is in a state that requires user input, **inline buttons appear under the substep row** in a `pl-12 pr-3 pb-2 pt-1` indent matched to the left cluster.

Patterns:

| Trigger | Substep id | Buttons | Purpose |
|---------|-----------|---------|---------|
| Population blocked | `pop-ingest` | `[📤 Request via Workstream] [⬆ Upload Population]` | User chooses how to unblock. Click "Request via Workstream" inflates an `<AgenticStepTracker>` showing the workstream automation simulation. "Upload" advances immediately. |
| Evidence blocked | `evd-collect` | `[📤 Request via Workstream] [⬆ Upload Evidence]` | Same dual-affordance. |
| Checkpoint held | any complete substep with mode `"checkpoint"` | `[✓ Confirm]` | User explicitly acknowledges before next substep starts. |
| Manual mode | any pending substep with mode `"manual"` | `<ManualSubstepForm>` with substep-specific input fields | User configures parameters and triggers the substep manually. |

This is **canon's most underrepresented pattern in TPRM**. TPRM's substeps render as static rows; they never sprout inline buttons. *(See drift §2.8.)*

### 1.6.3 Inline HITL gate card

When a substep has `isHitlGate: true` AND `step.status === "waiting"`, render an **inline amber checkpoint card directly under that substep** (matching `subStatus === "checkpoint-held"` pattern in canon, but with a different action set):

```
ml-12 mr-3 mb-1 mt-1 rounded-lg
border border-amber-200 dark:border-amber-800/40
bg-amber-50/70 dark:bg-amber-900/15
p-3
```

Body:
- Header line: `Clock w-3.5 amber-600` + `Reviewer checkpoint — record disposition before proceeding` (`text-[11px] font-semibold text-amber-800`).
- Description sentence: `text-[11px] text-amber-900/80 leading-relaxed`.
- Action button row (`flex items-center gap-2 flex-wrap`): **Approve / Modify / Reject** — primary `bg-[#266C92] hover:bg-[#1e5a7a] text-white` for Approve, `variant="outline"` with `Pencil` for Modify, `variant="outline" text-red-600 border-red-200` with `AlertCircle` for Reject. Each fires `onResolveHitl(objectId, stepId, decision)`.

The footer keeps only Previous Step / Confirm & Continue / Next Step during HITL waiting; the right side shows the italic note instead of buttons. **The Approve/Modify/Reject buttons MUST live inline, not in the footer.** This is canon (see anti-pattern list in § 4.3) — TPRM gets this right.

### 1.6.4 Substep output rendering

When a substep has an `output` and is complete, the row becomes expandable. Click expands a `pl-12 pr-3 pb-3 pt-1` panel containing `<SubstepOutput>` (a generic component that handles all `kind`s):

| `kind` | Visual |
|--------|--------|
| `score` | Big number `text-lg font-bold` + `scoreLabel` muted |
| `narrative` | `text-[11px] text-foreground/80 leading-relaxed` paragraph + optional 3-col grid `[label, value, status pill]` separated by `border-t` |
| `annotation` / `list` / `request` | 3-col grid `[label, value, status pill]` with `text-[10px]` |

Status pills use `text-[9px] font-semibold` color-coded: `ok` emerald, `warn` amber, `gap` red, `info` `[#266C92]`.

## 1.7 Right-side utility panel (`ControlUtilityPanel`)

File: `client/src/components/workspace/AgentHubHome.tsx` → `ControlUtilityPanel` (≈ line 4075). **Always present** on the focus page across all tabs.

Collapsed state: a `w-12` vertical icon strip at the right edge of the focus page with **four tabs** (the original "History" tab has been promoted to a top-level Audit Log tab — see § 1.5.2):

| Icon | Tab | Content |
|------|-----|---------|
| `Bot` | Optro Agent | Live agent narration tied to the active step + action chips |
| `MessageSquare` | Comments | Threaded comments by agent + human, filterable open/closed |
| `Pencil` | Notes | Free-form authored notes |
| `Copy` | Attachments | Files associated with this object/run |

Expanded state: panel grows to `w-96` with the active tab body filling the column. Closing collapses it back to the icon strip.

The Optro Agent tab is the **primary mediator between this page and the home assistant**. Every event on the workflow (step started, step completed, blocked, HITL fired) gets a comment in this panel *and* mirrors to the home assistant via `useHomeAssistantStore.addMessage()`. Agent comments tie to the current step via `agentNameByStep` from the workflow registration (e.g. `EVIDENCE AGENT` for the evidence step).

> **Why History moved out.** The narrow `w-96` rail is a poor fit for a tabular audit log with timestamps, actor columns, and filters. The Audit Log surface needs full-width column real estate, which is why it now lives as a top-level tab (§ 1.5.2). The four remaining utility-panel tabs are all "scratch surfaces" for ongoing human work and benefit from staying in the side rail.

TPRM today has no right-side utility panel. The Optro Agent / Comments / Notes / Attachments surfaces are missing entirely. *(See drift §2.10 — still consequential.)*

## 1.8 Generated artifact step ("Outputs")

When the user reaches the last fieldwork step (`testEffectiveness`) and confirms, the footer button changes from "Confirm & Continue" to **"Generate Workpaper"**. Clicking it sets `outputsGenerated[objectId] = true` and dynamically appends an extra `Outputs` step pill to the stepper.

The Outputs step content is:
1. **Workpaper card** (`OutputsStepContent` → `WorkpaperContent`) — collapsible, header `FileText #266C92` + `Workpaper — <OBJECT-ID> <Solution name>` + `Export` ghost button (right). Body is a vertical list of section cards, each with a 2-col `[label, value]` table.
2. (Optional, after a `+ Create` dropdown action) **Summary dashboard card** — `LayoutDashboard #266C92` + 4 stat cards + attribute results + exception count.
3. `+ Create` dropdown (right-aligned) with future artifact templates.

Translation rule: every solution defines its own **terminal artifact** (Workpaper for SOX, Vendor Risk Memo for TPRM, Risk Briefing for Risk Assessment, Coverage Report for Evidence Collection) and the **last step's footer button verb** mirrors the artifact ("Generate Workpaper", "Generate Risk Memo", …). The artifact must be a structured table-based document, not a free narrative.

## 1.9 Summary report page (`ControlSummaryReport`)

A full-screen page (L5) reachable from `View Control Summary` in the focus footer once complete. Header pattern is the same `h-12` back-bar as the focus page but with `FileText` instead of `Shield` and the literal label "Control Summary Report" or equivalent. Body is a single-column scroll of formal sections (Executive Summary · Methodology · Findings · Conclusion · Sign-off block).

Translation rule: every solution provides one canonical L5 summary report.

## 1.10 Assistant integration (mirroring)

Every event on the focus page is **mirrored** to the home assistant via `useHomeAssistantStore.getState().addMessage()`. The mirror message has:

```ts
{
  role: "assistant",
  content: `**${title}**\n\n${body}`,
  agentLabel: stepAgentName[step].name,  // "READINESS AGENT", "EVIDENCE AGENT", …
  actions?: [{ label, actionId, variant }],  // optional inline action chips
}
```

Mirroring fires at three moments per step:
1. **Step blocked / requires input** — title `<Step Title> — <Reason>`, action chips Upload / Request via Workstream / etc.
2. **Step completed** — title `<Step> — Complete`, body summarising what the agent did.
3. **Workstream initiated** — title `<Step> Workstream Request Initiated`, body describing the dispatch.

Action chips clicked in the home assistant call `setOnMessageAction(handler)` registered by the focus page so the home chat can drive the work canvas. **TPRM does no mirroring.** This means the home assistant is silent while the vendor workflow runs — a major coherence gap. *(See drift §2.11.)*

## 1.11 State vocabulary

Canonical step states. Every solution must use these exact tokens:

| State | Where it appears |
|-------|------------------|
| `pending` | Not yet reached |
| `running` | Agent currently executing |
| `waiting` | HITL gate active OR an external dependency (PBC) outstanding |
| `complete` | Step finished and validated |
| `blocked` | Step cannot proceed; needs human resolution before it can return to running/waiting |
| `skipped` | This step is not applicable to this object's track (e.g. Tier 1 vendors skip human-review/exception). Stepper renders `—` glyph |

**Bad shadows to avoid**: `done`, `success`, `paused`, `errored`, `awaiting`, `submitted`. They all collapse into one of the canonical states.

Outcome (terminal) states:

| State | Tone |
|-------|------|
| `effective` / `approved` | success — `#266C92` |
| `conditional` | warn — amber |
| `ineffective` / `rejected` | error — red |
| `re-assess` / `monitor` | follow-up — violet |

## 1.12 Visual tokens

| Token | Tailwind / hex | Use |
|-------|----------------|-----|
| Primary brand | `#266C92`, `text-[#266C92]`, `bg-[#266C92]/5..20` | Workflow chrome, active step pill, success cues |
| AUTO substep | `text-emerald-400` `bg-emerald-100/30` | `Zap` icon |
| AI substep | `text-blue-400` `bg-blue-100/30` | `Bot` icon |
| HITL substep | `text-amber-500` `bg-amber-50` | `Fingerprint` icon |
| Blocked / rejected | `text-red-500/600` `bg-red-50/60` `border-red-200` | Blocked steps, exceptions card |
| Re-assess / monitoring | `text-violet-500/700` `bg-violet-100` | Re-assess outcome |
| Subtle band | `bg-slate-50/80 dark:bg-muted/20` | Stepper sub-band, run-context band, panel headers |
| Card border | `border-slate-200 dark:border-border` | Default card stroke |

Mode markers (per-step automation policy, distinct from per-substep action type):

| Mode | Icon | Short label | Behavior |
|------|------|-------------|----------|
| `full` | `Zap #266C92/60` | `AUTO` | Agent advances autonomously |
| `checkpoint` | `Flag slate-400` | `CHECK` | Agent pauses after each substep for confirmation |
| `manual` | `Fingerprint slate-400` | `MAN` | User must trigger every substep |

The mode pill is rendered next to the status badge in the step header (§ 1.5.6). The mode is configurable per object via the gear button → `<AutomationConfigModal>`.

---

# Part 2 — TPRM Drift Audit (DataBridge Analytics, VEN-004)

A line-by-line audit of how `VendorFocusPage` (and the surrounding TPRM surface) deviates from canon. **Re-graded against the corrected 3-required-tabs framework** (see [`solution-framework.md`](./solution-framework.md) Part 2.6.1):

- Items 2.1, 2.2 *previously rated 🔴/🟠* are now **canon-compliant** — TPRM has the three required tab slots (Overview, Assessment, Audit Trail). The four-tab claim was over-prescription on the canon side.
- Item 2.10 (utility panel) is still 🔴 but with reduced scope — the History tab moved out, so the panel is 4 tabs (Agent / Comments / Notes / Attachments) instead of 5.
- Items 2.7, 2.8, 2.9, 2.11 remain 🔴 — these are all UI fundamentals from canon.

Severity legend:

- 🔴 **Critical** — actively misleading, breaks the unified mental model, OR violates a canon UI fundamental
- 🟠 **High** — meaningfully different surface; will block clean translation to new solutions
- 🟡 **Medium** — visible inconsistency; degrades the "single product" feel
- 🟢 **Low** — cosmetic / acceptable variance
- ✅ — canon-compliant; no action needed

## 2.A Drift table

| # | Item | Severity | Where | Canon expectation | TPRM-as-is | Fix |
|---|------|----------|-------|-------------------|------------|-----|
| 2.1 | Tab structure: 3 tabs total | ✅ | `VendorFocusPage` ≈ line 896 | **3 required slots**: Details/Overview · Workflow · Audit Log. Optional object-specific tabs are per-object-type. | Overview · Assessment · Audit Trail | None — TPRM has the three required slots and zero optional tabs (correct: vendors have no Issues/Automations equivalent). The previous "missing 4 tabs" diagnosis was wrong; Issues/Automations are Control-specific extensions, not framework invariants. |
| 2.2 | Required-slot label: "Overview" vs "Details" | 🟢 | tab map ≈ line 987 | Either label is acceptable for the static-schema slot — but pick once per platform | Uses "Overview" | Optional. The platform should pick one (Details *or* Overview) and use it everywhere; both choices are framework-valid. |
| 2.3 | No cycle dropdown on the workflow tab — but vendors have natural cycles | 🟠 | `VendorFocusPage` tab map | Cycle dropdown is **optional** per-workflow. Used when a workflow has cycles. | No dropdown rendered. But vendor data clearly has cycles: Initial Onboarding (`lastAssessmentDate === "—"`), Annual Reassessment (`nextAssessmentDue` driven), Triggered Reassessment (`monitoring.triggered === true`). | Declare `cycles` on the TPRM workflow registration. The framework will auto-render the dropdown. |
| 2.4 | Run-context band defaults to expanded | 🟡 | `useState(true)` for `testDetailsOpen` (line 912) | Default **collapsed** | Default expanded | Change initial state to `useState(false)`. |
| 2.5 | Run-context band content is record metadata, not run context | 🟠 | `getVendorTestDetails(vendor)` (~line 153) | 8 invariant slots, all *current run* attributes (executor / reviewer / request id / second-line / cardinality / time / scope / due) | Vendor Owner / Track / Criticality / Annual Spend / Risk Tier / Data Access / Risk Score / Next Assessment — all *static record* attrs that belong on the Details tab | Restructure into the 8-slot run-context schema. Move static attrs (Risk Tier, Data Access, Annual Spend, Risk Score) to the Details tab where they already live. |
| 2.6 | Tier badge inline in header | 🟢 | `VendorFocusPage` header (~line 973) | No inline classification badge — risk level lives in Details tab | Inline `Tier 2` badge between name and outcome | Acceptable variance; framework picks "no inline badge" but does not block. If kept, every solution must commit to it. |
| 2.7 | No empty-state CTA when no run is active | 🔴 | `{activeTab === "assessment" && status && (...)}` (~line 1007) | Centered Bot icon panel + automation-mode summary card + primary CTA + Settings gear + step preview chips | Renders nothing | Add the empty state with `Run Assessment` CTA + `<AutomationConfigModal>` + 9-step preview chips. |
| 2.8 | No automation-mode pill on step header | 🔴 | step header (~line 1132) | `[⚡ AUTO]` / `[🚩 CHECK]` / `[🔒 MAN]` pill next to status | "Phase 2 · Assess" label (different metadata) | Add the mode pill. The phase label can be kept as a *subtitle*, not a replacement. Phase = content metadata; mode = policy axis. |
| 2.9 | No `<AutomationConfigModal>` access | 🔴 | absent | Gear icon in empty state opens the modal | No surface; mode cannot be configured per-object | Reuse `AutomationConfigModal` directly. Wire it to the gear in the new empty state. |
| 2.10 | No right-side utility panel | 🔴 | absent | `<ControlUtilityPanel>` always present (Agent / Comments / Notes / Attachments) — **4 tabs**, since History moved to top-level Audit Log | No utility panel of any kind. The Audit Trail tab covers part of what History used to. | Build `<VendorUtilityPanel>` with the four canon tabs. Wire the Optro Agent tab to per-step `agentNameByStep` from registration. |
| 2.11 | No assistant mirroring | 🔴 | absent | Step blocked / completed / workstream-initiated → mirror to `useHomeAssistantStore.addMessage()` | Home assistant is silent during TPRM runs | Build `mirrorToAssistant(title, body, stepId, actions?)` and call it from the same three trigger points. |
| 2.12 | Step substeps render as static rows | 🟠 | `VendorStepNodeContent` (line 527) | Substeps that need input grow inline buttons (Upload / Request via Workstream / Confirm checkpoint / Manual run) | Substeps render description + status only; only the HITL gate substep grows an action card | Add inline-action affordances. The `<AgenticStepTracker>` for the workstream simulation is reusable as-is. |
| 2.13 | Substep iconography | ✅ | `ActionTypeIcon` (line 97) | Icon-only (`Zap`/`Bot`/`Fingerprint`); no colored pill | Icon-only ✓ | None. |
| 2.14 | No toast feedback | 🟡 | absent | Bottom-centered `bg-slate-900` toast for every confirmation event | Confirmations are silent | Add a toast portal at the focus-page root + 3s timer. |
| 2.15 | No pause/resume button on stepper | 🟡 | absent | Demo mode shows a 7×7 pause/resume button | No control | Generalize the canon button (currently demo-only) and expose for both. |
| 2.16 | Terminal CTA does not produce an artifact | 🟠 | footer (~line 1232) | Terminal CTA flips `outputsGenerated`, appends an `Outputs` step pill, renders `<WorkpaperContent>` | Footer button is text-only; no artifact panel; no extra pill | Implement `outputsGenerated[vendorId]` flag and a `<VendorRiskMemoContent>` (analog of `<WorkpaperContent>`). |
| 2.17 | HITL inline placement | ✅ | `VendorStepNodeContent` (~line 621) | HITL inline; footer note italic | Same | None — TPRM nailed it. |
| 2.18 | Outcome banner restraint to last step | ✅ | `VendorFocusPage` (~line 1162) | Banner only on terminal step | Same | None. |
| 2.19 | `<MonitoringLivePanel>` only on monitoring step | ✅ | `VendorFocusPage` (line 1157) | Only on monitoring step | Same | None. |
| 2.20 | Hub: Fast-forward exposed as top-level button | 🟡 | `TPRMHub` header | In kebab menu (`MoreVertical`) | Top-level ghost button | Move into a kebab menu next to "Back to TPRM". |
| 2.21 | Hub: "Back to TPRM" verb | 🟢 | `TPRMHub` header | "Open Workflow" external-link semantic | "Back to TPRM" navigates to solution home | Rename to "Open Workflow Canvas" to align verb. |
| 2.22 | Plan dialog includes Configuration Wizard preview | ✅ | `TPRMPlanningPage` | Adopted by the framework as a canonical Plan-dialog element (Part 2.4 of solution-framework.md) | Has it | None — TPRM informed the canon here. |
| 2.23 | Plan dialog groups steps by phase | ✅ | `TPRMPlanningPage` | Phases are optional per-workflow | Phase-grouped | Acceptable variance — phases are per-solution metadata. |
| 2.24 | Per-vendor stepper has 9 steps | ✅ | data | Step count is per-workflow | 9 steps | Correct. |
| 2.25 | TPRM pipeline legend lists 10 symbols | ✅ | `TPRMHub` legend | Legend MUST list every symbol that can appear | TPRM exhaustively does | Correct. |
| 2.26 | Tier-1 auto-skip renders `—` glyph in stepper | ✅ | `tickVendorStatuses` | `skipped` is a canonical state | Renders correctly | None. |

## 2.B Tally

After re-grading against the corrected 3-required-tabs framework:

- 🔴 Critical: **5** (2.7, 2.8, 2.9, 2.10, 2.11) — was 6, dropped 2.1 (re-graded to ✅)
- 🟠 High: **4** (2.3, 2.5, 2.12, 2.16) — net same; 2.2 dropped to 🟢, 2.3 added (was 🔴)
- 🟡 Medium: **4** (2.4, 2.14, 2.15, 2.20) — unchanged
- 🟢 Cosmetic: **3** (2.2, 2.6, 2.21)
- ✅ Canon-compliant: **10** (2.1, 2.13, 2.17, 2.18, 2.19, 2.22, 2.23, 2.24, 2.25, 2.26)

## 2.C Reduced root-cause set

All five 🔴 critical drifts trace back to **three** missing fundamentals on the focus page:

1. **No empty-state CTA** (2.7) → leads to no `<AutomationConfigModal>` access (2.9), no automation-mode pill (2.8) — together these are the cold-start UI.
2. **No right-side utility panel** (2.10) → leads to no agent narration → leads to no assistant mirroring (2.11).
3. **No automation policy axis** (2.8 + 2.9) — TPRM exposes phases instead, conflating two orthogonal concepts.

Fix those three and **9 of the 12 non-✅ drift items collapse**. The remaining items (run-context semantics, inline action affordances, terminal artifact, cycles, toast, pause button, hub kebab, header verbs) are independent surface-level fixes.

## 2.D Recommended retrofit order

When the time comes to retrofit TPRM against canon, work in this order — each step unlocks the next:

1. **Declare cycles on the TPRM workflow registration** (resolves 2.3). Two-line change in `tprmArchetypeConfig`.
2. **Restructure the run-context band** to use the 8-slot schema with run attributes (resolves 2.4 + 2.5). Replace `getVendorTestDetails` body.
3. **Add the empty-state CTA** to the Assessment tab (resolves 2.7). Reuses canon's `<AutomationConfigModal>`.
4. **Add the automation-mode pill** to the step header (resolves 2.8 + 2.9 once the modal is wired).
5. **Build the right-side utility panel** with the four canon tabs (resolves 2.10). Move the existing `VendorAuditTrailTab` content into the framework-rendered top-level Audit Log tab body.
6. **Wire assistant mirroring** on the three trigger points (resolves 2.11).
7. **Add inline action affordances** to substeps that need input (resolves 2.12).
8. **Implement the terminal artifact** (Vendor Risk Memo) (resolves 2.16).
9. **Add toast feedback** (resolves 2.14).
10. **Generalize the pause button** (resolves 2.15).
11. **Move Hub Fast-forward into a kebab menu** (resolves 2.20).
12. **Cosmetics** — rename Overview → Details if standardizing on Details (2.2), drop Tier badge from header if removing (2.6), rename "Back to TPRM" → "Open Workflow Canvas" (2.21).

Steps 1–6 should land before the next solution (Risk Assessments) is implemented, so the second solution can be authored against a clean canon-compliant pattern set.

---

# Part 3 — Pattern framework → see `solution-framework.md`

The unified pattern framework (architectural taxonomy, required component spine, flex points, registration schema, anti-pattern list, acceptance checklist, per-solution implementation status, quick-reference card) has been promoted to its own document so it can serve as the actionable contract for adding new solutions: **[`docs/solution-framework.md`](./solution-framework.md)**.

What you find there:

- **Part 1** — The Architectural Hierarchy (Org Workspace → Solutions → Workflows → Object Types → Pipeline → Focus → Artifact, with cardinality rules and the corrected tab model).
- **Part 2** — The Required Component Spine (L0–L6 invariants).
- **Part 3** — The Flex Points (object type, Details schema, optional tabs, workflow definition, run-context schema, cycles, phases, tracks, outcome states, terminal artifact).
- **Part 4** — Step / Substep Definition Language (declarative shape).
- **Part 5** — Solution Registration Schema (the prompt-template; `SolutionDefinition` master type, validation rules, the "if you fill this in, you get a working UI" contract).
- **Part 6** — Worked Examples (SOX, TPRM-corrected, Risk Assessments stub).
- **Part 7** — Walkthrough: Registering a new solution.

This canon doc retains its role as the **pixel-level visual reference** (Part 1 above) and the **drift audit** (Part 2 above).

---

## Maintenance notes

- This doc is **the** source of truth for the visual + interaction grammar (Part 1) and the live drift state (Part 2). For architectural taxonomy + the registration schema, see [`solution-framework.md`](./solution-framework.md).
- If you change a canon pattern, change this doc *first*, then update both `ControlFocusPage` and `VendorFocusPage` (and any other solution's focus page) in lockstep.
- The canon implementation in `ControlFocusPage` is the reference. If this doc and `ControlFocusPage` ever diverge, the implementation wins — and the doc is updated to match.
- TPRM drift items in Part 2 should be filed as individual tickets and burned down in the priority order suggested in Part 2.D (🔴 first; cycles → run-context → empty state → mode pill → utility panel → mirroring → inline affordances → terminal artifact → toast → pause → kebab → cosmetics).
- New solution work begins by filling out the `SolutionDefinition` schema in [`solution-framework.md`](./solution-framework.md) Part 5 and walking the registration recipe in Part 7.
