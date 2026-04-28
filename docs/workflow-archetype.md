# Workflow Archetype

Optro implements its agentic GRC solutions on top of a shared **workflow archetype** — a reusable pattern that defines how a "solution" turns a population of objects into completed assessments. The first two solutions on the archetype are:

- **SOX Control Testing** — object: `Control`
- **Third-Party Risk Management (TPRM)** — object: `Vendor`

This document describes the archetype contract and the step-by-step process for adding a new solution that uses it.

---

## 1. The archetype

Every solution that conforms to the archetype answers the same five questions:

| # | Question | Where it lives |
|---|----------|----------------|
| 1 | What is the **iterated object**? (Control, Vendor, Risk, …) | `ArchetypeConfig.objectType` + `objectFields` |
| 2 | What are the **phases** of the workflow? | `ArchetypeConfig.phases` |
| 3 | What are the **steps** within each phase, and what **substeps** make up each step? | `ArchetypeConfig.steps[].substeps` |
| 4 | For each substep, **who acts** — AI, Automation, or Human-in-the-loop? | `ArchetypeSubstep.actionType` |
| 5 | What **tracks** can an object travel down? (e.g. fully automated vs human-review) | `ArchetypeConfig.trackingRules` |

The contract is defined in `client/src/lib/workflowArchetype.ts`.

```ts
type SubstepActionType = "ai" | "auto" | "hitl";

interface ArchetypeSubstep {
  id: string;
  actionType: SubstepActionType;
  description: string;
  detail?: string;
  output?: ArchetypeOutput;     // optional inline annotation/score/list/narrative
  isHitlGate?: boolean;         // true if this substep blocks the step until a human resolves it
}

interface ArchetypeStep {
  id: string;
  ordinal: number;
  phaseId: string;
  title: string;
  shortLabel: string;           // <= 4 chars for grid headers
  description: string;
  agentRole: string;
  outcome: string;
  icon: LucideIcon;
  substeps: ArchetypeSubstep[];
}

interface ArchetypePhase {
  id: string;
  ordinal: number;
  label: string;
  description?: string;
}

interface ArchetypeConfig {
  id: string;
  solutionLabel: string;
  objectType: string;           // "Control" | "Vendor" | …
  objectTypePlural: string;
  phases: ArchetypePhase[];
  steps: ArchetypeStep[];
  objectFields: ArchetypeObjectFieldDef[];
  configWizardSteps: ArchetypeWizardStep[];
  trackingRules: ArchetypeTrackingRule[];
  description: string;
}
```

The same module exports:

- `ACTION_TYPE_META` — display metadata (label, short-label, color tone) for each `SubstepActionType`. Used by the `ActionTypeBadge` rendering pattern in TPRM and reusable by future solutions.
- `getStepProgress(statuses, stepIds)` — computes (completed / running / total / percent) for any object's run.
- `StepRunStatus` — `"pending" | "running" | "waiting" | "complete" | "blocked" | "skipped"` — the canonical per-step status used in pipeline tickers.

---

## 2. How SOX and TPRM consume the archetype

Both solutions consume the same conceptual contract but render slightly different UIs because SOX predates the formal archetype and uses its own evidence-collection metaphors.

| Aspect | SOX (`control-testing`) | TPRM (`tprm-assessment`) |
|--------|-------------------------|--------------------------|
| Object | `MasterControl` | `VendorRecord` |
| Phases | (implicit in fieldworkStepOrder) | 4 explicit phases |
| Steps | 6 (readiness → testEffectiveness) | 9 (intake → monitoring) |
| Tracks | manual / connected | automated / human-review |
| Planning page | `TestingPlanPage` | `TPRMPlanningPage` |
| Session | `FieldworkComplexHub` | `TPRMSession` |
| Domain data | `WorkflowSession.tsx` | `lib/tprmData.ts` |
| Launcher | `controlTestingLauncher.ts` | `lib/tprmLauncher.ts` |

TPRM **also** publishes its config as `tprmArchetypeConfig: ArchetypeConfig`, fully consuming the shared types. This is the reference implementation for any future solution.

---

## 3. Adding a new solution that uses the archetype

To add a new fully-functional solution (e.g. "Issue Management"), follow this 9-file recipe.

### a. Domain data — `client/src/lib/<solution>Data.ts`

1. Define the object type (e.g. `IssueRecord`).
2. Build the `phases: ArchetypePhase[]`.
3. Build the `steps: ArchetypeStep[]`, each with full `substeps[]` carrying:
   - `actionType` — AI / AUTO / HITL.
   - Optional `output` for substeps that produce visible artifacts.
   - `isHitlGate: true` for substeps that gate the step.
4. Define a master object list (a small mock population, ~6–12 records).
5. Export `<solution>ArchetypeConfig: ArchetypeConfig`.
6. Export a per-object run-status type and a `tick<Solution>Statuses(prev, resolvedHitlSet)` simulator that advances steps over time and respects HITL gates and any track-skip rules.

### b. Launcher — `client/src/lib/<solution>Launcher.ts`

- Define the session id (e.g. `"issue-management"`).
- Implement `launch<Solution>(addProject, setCurrentSession, activeProjects, workflowSessionConfigs, selectedIds?)` that:
  - Creates the project if needed (calling `workflowSessionConfigs[<id>].create()`).
  - Seeds `pipeline.statuses`, `pipeline.phase`, `pipeline.resolvedHitl` block state.
  - Pre-populates demo state for any "already in flight" objects.

### c. Register the session — `AgentHubHome.tsx`

Add an entry to `workflowSessionConfigs` with a minimal `create()` returning a stub `WorkflowSessionConfig`. The actual session view reads its own state directly.

### d. Planning page — `client/src/pages/<Solution>PlanningPage.tsx`

Mirror `TestingPlanPage` / `TPRMPlanningPage`:

- Header + cancel.
- Selection callout listing the factors that produced the recommended set.
- Stats grid (Total / Track A / Track B / High-priority).
- Configuration-wizard strip (the wizard steps from `ArchetypeConfig.configWizardSteps`).
- Workflow diagram grouped by phase.
- Object selection table grouped by some classification (tier / criticality / type) with checkboxes.
- Plan rationale block.
- Footer with "Confirm & Start" wired to the launcher.

### e. Session view — `client/src/components/workspace/<Solution>Session.tsx`

Mirror `TPRMSession.tsx`:

- A bulk pipeline tracker grid: rows × steps with status icons.
- A focus view per object with three tabs: Overview (full schema), Assessment (steps grouped into phases, expandable into substeps with `ActionTypeBadge` + outputs + HITL Approve/Modify/Reject), and Audit Trail.
- Auto-tick simulation using your `tick<Solution>Statuses` function.

### f. Wire into `AgentHubHome.tsx`

1. Import `<Solution>Session`.
2. In the session router (where SOX checks `currentSessionId === "control-testing"`), add a check for your session id and render `<Solution>Session`.
3. In `OptroHome`, add an `is<Solution>` flag and route the primary-task action to your planning page when the user clicks "Start" on the matching solution.

### g. Register the route

1. Export your planning page from `client/src/pages/index.ts`.
2. Add `<Route path="/<solution>-planning" component={<Solution>PlanningPage} />` to `client/src/App.tsx`.

### h. (Optional) Update solution config

Make sure the solution shows up in `solutionConfigs` (in `AgentHubHome.tsx`) with a primary task that has `primary: true` so the "Start" CTA appears.

### i. Document and validate

- Update `replit.md` with the new solution.
- Manually walk: solutions home → solution → "Start" → planning → confirm → bulk tracker → drill-in → assessment tab → HITL approve → audit trail.

---

## 4. Conventions and gotchas

- **Persisted state.** Pipeline statuses live in `useWorkflowSessionStore` block state under `pipeline.statuses`. Use `usePersistedBlockState(sessionId, "pipeline", "statuses", initial)` so the simulation survives navigation.
- **HITL gates.** A step containing a substep with `isHitlGate: true` will sit in the `"waiting"` status until its `${objectId}:${stepId}` key appears in the `resolvedHitl` array. The session view writes that key when the user clicks Approve/Modify/Reject.
- **Track skipping.** A step can be skipped for a given track entirely (e.g. TPRM's automated track skips `human-review` and `exception`). Implement skip rules inside your `tick<Solution>Statuses`.
- **No new packages.** The archetype is type-only and renders with shadcn primitives that are already available.
- **Iconography.** Use `lucide-react` for step icons. The standard Optro accent is `#266C92` for primary brand tone; AI/AUTO/HITL tone classes live in `ACTION_TYPE_META`.

---

## 5. UI Pattern Specification (canon)

This section is the **single source of truth** for how a workflow that conforms to the archetype should *look*. Both SOX (`AgentHubHome.tsx` → `FieldworkComplexHub` + `ControlFocusPage`) and TPRM (`TPRMSession.tsx` → `TPRMHub` + `VendorFocusPage`) implement these patterns identically. Future workflows must mirror this section exactly so the only thing that changes is the underlying domain data.

### 5.1 Color tokens

| Token | Tailwind class | Use |
|-------|---------------|-----|
| Primary brand | `#266C92` (literal) and `text-[#266C92]`, `bg-[#266C92]/5..20` | All workflow chrome, active step pill, success indicators |
| Auto / fully-automated | `text-emerald-400 dark:text-emerald-500`, `bg-emerald-100/50/etc.` | `auto` substep marker, monitoring "Live" pulse, source health |
| AI | `text-blue-400 dark:text-blue-500`, `bg-blue-100/etc.` | `ai` substep marker |
| HITL / human checkpoint | `text-amber-500 dark:text-amber-400`, `bg-amber-50/200/etc.` | `hitl` substep marker, inline checkpoint card, "Awaiting Reviewer" pill |
| Blocked / rejected | `text-red-500/600`, `bg-red-50/60/etc.`, `border-red-200/300` | Blocked steps, exceptions card, rejected outcomes |
| Re-assess / monitoring fired | `text-violet-500/700`, `bg-violet-100/etc.` | Re-assess outcome badge |

**Substep mode markers are icon-only** (mirroring SOX `automationModeIcons` near `AgentHubHome.tsx:2868`):

| `actionType` | Icon | Color |
|--------------|------|-------|
| `auto` | `Zap` | emerald |
| `ai` | `Bot` | blue |
| `hitl` | `Fingerprint` | amber |

These come from `ACTION_TYPE_META` in `client/src/lib/workflowArchetype.ts` — use the `icon` + `iconColor` fields, not a coloured pill. Pills (`label`/`shortLabel`/`tone`) remain available for the Audit Trail table where text labels read better.

### 5.2 Bulk Tracker layout (Hub view)

Implementation references: `AgentHubHome.tsx` lines ~6385–6802 (SOX), `TPRMSession.tsx` `TPRMHub` (TPRM).

The Hub is a vertically stacked column with `gap-5` between blocks:

1. **Header row** — solution icon (`#266C92`), title + subtitle, optional Complete badge, "Open Workflow" / "Back to TPRM" external-link button, kebab/fast-forward menu.
2. **4-stat grid** — `grid grid-cols-4 gap-3`. Each card is `border border-slate-200 dark:border-border` with `CardContent p-3`. The 4 cards are conventionally:
   - Scope count
   - Automated coverage %
   - Closed / completed count
   - **Open Exceptions** (see 5.3 — special, clickable)
3. **Actions Required** — collapsible card. **Default collapsed** (`useState(false)`). Header row shows `AlertCircle amber` + `Actions Required` + amber count badge + chevron. When expanded, body lists items with vendor/control id, label badge, brief, primary action (`Open …`) + optional secondary (`Quick Approve`).
4. **Pipeline card** — header with `Workflow` icon + title; body is a grid `grid-cols-[3fr_5rem_repeat(<stepCount>,1fr)_1fr]` (Object | Source | step columns | Result). Rows are grouped by track (e.g. "Human-Review Workflow (n/m)" + "Automated (n/m)") with `border-l-2 border-l-transparent hover:border-l-[#266C92]` row hover. **Legend** at the bottom of the card lists every dot meaning + every result icon.
5. **Audit Log** — collapsible card. Default collapsed. When expanded, shows the assistant welcome bubble (`Bot` icon, `bg-[#266C92]/5`, `Optro Assistant` header + status sentence) followed by a `divide-y` list of activity entries with `border-l-2` colored by entry type (success `#266C92`, warning `red-400`, action-needed `amber-400`).
6. **Next Steps card** — only when fully complete. `border-[#266C92]/20 bg-[#266C92]/[0.03]` card with `ListChecks` header and a list of follow-ups.

### 5.3 Scroll modality

There are **two scroll modes** for the Hub:

| Condition | Outer wrapper | Inner column | Pipeline card body |
|-----------|---------------|--------------|--------------------|
| All collapsibles closed (default) | `flex flex-col overflow-hidden` (fixed viewport) | `h-full` | `flex-1 min-h-0 overflow-y-auto` (scrolls inside) |
| Any of (Actions Required \| Audit Log) expanded | `overflow-y-auto` (full-pane scroll) | _no `h-full`_ | _no inner scroll_ |

In `TPRMHub` this is gated by a single derived flag:
```ts
const fullPaneScroll = actionsExpanded || auditLogExpanded;
```
The same flag drives all three classes. **Never** let the tracker shrink under an expanding section — push the page instead. The Open Exceptions modal is rendered outside the scroll wrapper as a `<Dialog>`.

### 5.4 Open Exceptions card

- Card is `cursor-pointer hover:border-red-300` and gets `role="button"` + `tabIndex={0}` + Enter/Space handler **only when `count > 0`**.
- Header row gets a trailing `ChevronRight` in red when active.
- Subtitle text changes from `none open` → `click to review`.
- Click opens an `<Dialog>` with `max-w-3xl max-h-[80vh]` showing a table of `[Object id | Finding summary | Severity | Open count | Owner]`. Rows are clickable: close the dialog and navigate into the focus view for that object.

### 5.5 Focus Page layout (per-object drill-in)

Implementation references: `AgentHubHome.tsx` `ControlFocusPage` (SOX), `TPRMSession.tsx` `VendorFocusPage` (TPRM).

Vertical column inside `flex h-full overflow-hidden`:

1. **Header bar** — `shrink-0 h-12 px-4 flex items-center gap-3 border-b`. Contains:
   - **Back button** with `ChevronLeft` and the literal text `"Overview"` (not "Pipeline").
   - Vertical separator `w-px h-5 bg-slate-200`.
   - Solution icon + object id + em-dash + object name + tier badge.
   - Outcome badge pinned to the right (`ml-auto`).
2. **Tab bar** — three tabs: `Overview` (object schema), `Assessment` (default — the steps), `Audit Trail`. Active tab is a `border-b-2 border-[#266C92] text-[#266C92]` underline.
3. **Horizontal stepper** — only on Assessment tab. Progress line (`h-1 rounded-full bg-slate-200`) with a filled `bg-[#266C92]` overlay sized by completed/total. Each step is a clickable pill with status icon (`CheckCircle2`, `Loader2`, `Clock` amber, `AlertCircle` red, `—`) + short label. Active pill is `bg-[#266C92] text-white`.
4. **Object Details strip** — collapsible (`ChevronDown` toggle, default open). Two-column grid of `[uppercase label][value]` pairs.
5. **Step content area** — `flex-1 min-h-0 overflow-y-auto` with a centered `w-[90%] mx-auto px-6 py-6 space-y-6` container:
   - Step title row — title + status badge + `Phase n · Phase Label` + step counter sentence.
   - **`StepNodeContent`** rendering the substeps (see 5.6).
   - **Live monitoring panel** if `step.id === "monitoring"` (see 5.9).
   - **Risk Decision banner** *only* when `isComplete && isLastStep` (see 5.8).
6. **Footer** — `shrink-0 px-6 py-3 border-t`. Left side: `Previous Step` (ghost). Right side: **Confirm & Continue** (or `Generate … Report` on the last step) when running, **Next Step** when complete. **No Approve / Modify / Reject buttons in the footer** — those live inline (see 5.7).

### 5.6 Substep row spec

Each substep row inside `StepNodeContent` is a `button` (or div if not expandable) with a left cluster + body + chevron:

```
[ #N ] [ status indicator ] [ mode icon ]   <description text>           [ chevron ]
                                            <optional muted detail line>
```

- **Number** — plain integer `{idx + 1}`. **Not** `{step.ordinal}.{idx + 1}`. Width `w-4 text-right font-mono text-[9px] text-muted-foreground`.
- **Status indicator** — `SubStepIndicator` (`w-3.5 h-3.5`): `CheckCircle2` `#266C92` complete, `Loader2 animate-spin` `#266C92` running, `Clock` amber waiting, `AlertCircle` red blocked, hollow circle pending.
- **Mode icon** — `ActionTypeIcon` (`w-3 h-3 shrink-0` + `iconColor` from `ACTION_TYPE_META`). Icon-only. **No coloured pill**.
- **Row background** — running `bg-[#266C92]/[0.04]`, waiting `bg-amber-50/40 border border-amber-200/60`, blocked `bg-red-50/30`, complete-with-output `hover:bg-slate-50/80 cursor-pointer`, pending `opacity-50`.
- **Expanded output** — when complete + has output, render `<SubstepOutput>` in a `pl-12 pr-3 pb-3 pt-1` container (12-pad indent matches the 32-px left cluster).

### 5.7 HITL gate spec

When a substep has `isHitlGate: true` and the step is in `"waiting"` status, render an **inline amber checkpoint card directly under the gate substep** (mirroring SOX `subStatus === "checkpoint-held"` block around `AgentHubHome.tsx:3178-3198`):

```
ml-12 mr-3 mb-1 mt-1 rounded-lg
border border-amber-200 dark:border-amber-800/40
bg-amber-50/70 dark:bg-amber-900/15
p-3
```

Body:
- Header line — `Clock w-3.5 amber-600` + `Reviewer checkpoint — record disposition before proceeding` (`text-[11px] font-semibold text-amber-800`).
- Description paragraph — `text-[11px] text-amber-900/80`.
- Three buttons in a `flex items-center gap-2 flex-wrap`:
  - **Approve** — `bg-[#266C92] hover:bg-[#1e5a7a] text-white`, `CheckCircle2` icon. Fires `onResolveHitl(id, stepId, "approve")`.
  - **Modify** — `variant="outline"`, `Pencil` icon. Fires `onResolveHitl(id, stepId, "modify")`.
  - **Reject** — `variant="outline" text-red-600 border-red-200`, `AlertCircle` icon. Fires `onResolveHitl(id, stepId, "reject")`.

The footer keeps only **Previous Step / Confirm & Continue / Next Step** during HITL waiting; the right side shows an italic `Awaiting reviewer disposition above ↑` note instead of buttons.

### 5.8 Final Risk Decision banner

The terminal "Risk Decision: \<Outcome>" banner is rendered **inside the step content area** but **only when `isComplete && isLastStep`**. The container is `p-4 rounded-xl border` with tone-keyed palette:

| Tone | Border | Background | Text | Icon |
|------|--------|------------|------|------|
| approved | `border-[#266C92]/20` | `bg-[#266C92]/5` | `text-[#266C92]` | `ShieldCheck` |
| conditional | `border-amber-200` | `bg-amber-50/50` | `text-amber-700` | `ShieldCheck amber-600` |
| rejected | `border-red-200` | `bg-red-50/50` | `text-red-600` | `AlertTriangle red-500` |
| monitor / re-assess | `border-violet-200` | `bg-violet-50/50` | `text-violet-700` | `Activity violet-500` |

Never show this on intermediate steps — it would imply finality before the workflow is done.

### 5.9 Live monitoring panel (`MonitoringLivePanel`)

Only render on the step whose `id === "monitoring"` (or the equivalent terminal continuous-monitoring step in your workflow). The panel signals "this is alive":

1. **Header** — `Radio` icon emerald + title + a pulsing dot `<span class="animate-ping ... bg-emerald-400 opacity-75">` overlay on a solid `bg-emerald-500` 2-px circle. Right side: polling cadence + source count.
2. **Source health row** — small `Badge`s (`bg-emerald-50 text-emerald-700`) for each monitoring source ("Adverse News", "SOC 2 Watch", "Breach Feed", "Ownership", "Renewals"…). Each badge has a 1-px emerald dot prefix.
3. **Ticker** — `max-h-64 overflow-y-auto divide-y` list. New entries are inserted on a 2.4-second interval. Each entry has `border-l-2` color-keyed by severity (`emerald-400/60` info, `amber-400 bg-amber-50/40` warn, `red-400 bg-red-50/40` critical), monospace timestamp, source label, description.

### 5.10 Reviewer Brief artifact

The Review (HITL judgment) step has a substep that renders a structured `Reviewer Brief` artifact on expand. Define this on the substep itself in your `<solution>Data.ts`:

```ts
{
  id: "hr-1",
  actionType: "ai",
  description: "Render reviewer brief: …",
  output: {
    kind: "narrative",
    label: "Reviewer Brief",
    body: "Composite risk score 72 …",
    items: [
      { label: "Composite score", value: "72 / 100", status: "warn" },
      { label: "Findings (open)", value: "3 — 1 critical, 2 medium", status: "warn" },
      { label: "Confidence", value: "High (0.91)", status: "ok" },
      { label: "Suggested disposition", value: "Mitigate", status: "info" },
      { label: "Comparable vendors", value: "…", status: "info" },
    ],
  },
}
```

`SubstepOutput` already knows how to render `kind: "narrative"` with both a body paragraph and an items grid; no extra UI work is needed.

### 5.11 Anti-patterns to avoid

These were drift risks we intentionally removed from TPRM. Do not re-introduce them in any workflow that conforms to this archetype:

- ❌ Substep numbering in `{ordinal}.{idx+1}` form — use plain `{idx+1}`.
- ❌ Coloured AI/AUTO/HITL pills next to the substep description — use the canonical Lucide icon (`Bot`/`Zap`/`Fingerprint`).
- ❌ Footer-level Approve/Modify/Reject buttons — those belong inline under the gate substep.
- ❌ "Risk Decision" banner on intermediate steps — terminal step only.
- ❌ "Pipeline" back link text on the focus page — use "Overview".
- ❌ Standalone `Agent Role` block on the per-step view — the agent role is implicit from the substeps.
- ❌ Open Exceptions card that is non-interactive when count > 0 — must open the exceptions dialog.
- ❌ Tracker that shrinks when Actions Required expands — switch to full-pane scroll instead.
- ❌ Static monitoring view — the monitoring step must feel alive (pulsing dot + ticker).
- ❌ Default `actionsExpanded: true` — collapsed by default per SOX canon.
