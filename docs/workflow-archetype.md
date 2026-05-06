# Workflow Archetype — implementation recipe

> **Doc role.** This doc is the **engineering implementation recipe** — file structure, wiring conventions, gotchas. For the architectural taxonomy + the prompt-fillable registration schema, see [`solution-framework.md`](./solution-framework.md). For the pixel-level visual reference and TPRM drift audit, see [`ui-pattern-canon.md`](./ui-pattern-canon.md).

Optro implements its agentic GRC solutions on top of a shared **workflow archetype** — a reusable pattern that defines how a "solution" turns a population of objects into completed assessments. The first two solutions on the archetype are:

- **SOX Control Testing** — object: `Control`
- **Third-Party Risk Management (TPRM)** — object: `Vendor`

The next batch of solutions (**Risk Assessments** → object: `Entity`; **Pre-IPO** → object: `Control` (in IPO scope); **Evidence Collection** → object: `Evidence Request`; **Issue Management** → object: `Issue`) will be authored against the same archetype.

This document describes the archetype contract and the engineer-facing process for adding a new solution.

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

Both solutions consume the same conceptual contract. **SOX Control Testing is the visual/interaction canon** — its `ControlFocusPage` (drilled to CTL-003) is the reference implementation for the per-object Focus page that every solution must mirror. TPRM was built next and *mostly* mirrors canon, but has known drift points that are tracked in [`docs/ui-pattern-canon.md`](./ui-pattern-canon.md) Part 2 (the TPRM Drift Audit).

| Aspect | SOX (`control-testing`) | TPRM (`tprm-assessment`) |
|--------|-------------------------|--------------------------|
| Object | `MasterControl` | `VendorRecord` |
| Phases | (implicit in fieldworkStepOrder) | 4 explicit phases |
| Steps | 6 (readiness → testEffectiveness) | 9 (intake → monitoring) |
| Tracks | manual / connected | automated / human-review |
| Planning page | `TestingPlanPage` | `TPRMPlanningPage` |
| Hub | `FieldworkComplexHub` | `TPRMHub` |
| Focus page (the canon contract) | `ControlFocusPage` (`AgentHubHome.tsx` ≈ line 4912) | `VendorFocusPage` (`TPRMSession.tsx` ≈ line 898) |
| Domain data | `WorkflowSession.tsx` (inline) | `lib/tprmData.ts` |
| Launcher | `controlTestingLauncher.ts` | `lib/tprmLauncher.ts` |

TPRM publishes its config as `tprmArchetypeConfig: ArchetypeConfig`, fully consuming the shared types — that part is the reference for the data shape. For the visual + interaction grammar, **`ControlFocusPage` is the reference**, and any deviation is drift to be reconciled against the canon doc.

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

Mirror `ControlFocusPage` in `AgentHubHome.tsx` (the canon). The visual + interaction grammar is defined in [`ui-pattern-canon.md`](./ui-pattern-canon.md) Part 1. The architectural contract — what tab slots are required, what's optional, what runs where — is in [`solution-framework.md`](./solution-framework.md) Part 2.6.

Headline contract:

- A bulk pipeline tracker grid: rows × steps with status icons (= the **Hub**, § 1.4 of the canon doc).
- A focus view per object with:
  - **3 required tab slots**: Details/Overview · [Workflow verb] · Audit Log.
  - **N optional object-type-specific tabs** declared in the registration (between Workflow and Audit Log). Examples: Control declares `Issues` + `Automations`; Vendor declares none today; Entity (Risk Assessments) will declare `KRIs` + `Heat Map`.
  - The Workflow-tab label is dynamic (`Testing` / `Assessment` / `Review` / `Diligence` / `Readiness`).
  - When the workflow declares `cycles`, the framework auto-renders a chevron dropdown on the Workflow tab (e.g. *Testing (Interim)* / *Assessment (Annual)*).
- The workflow tab body is a **stepper sub-band** (pills with progress fill, including a `—` glyph for track-skipped steps) → **collapsible Run-Context band** with 8 invariant slots → **step content area** that renders `<StepNodeContent>` substeps with inline action affordances → **footer** with `Previous Step` / terminal CTA / `Next Step`.
- Substeps render with **icon-only** action-type markers (`Zap`/`Bot`/`Fingerprint`), never colored pills.
- HITL gates surface **inline under the gate substep** as an amber Approve/Modify/Reject card. The footer never holds these buttons.
- A **right-side utility panel** is always present with **4 tabs**: Optro Agent · Comments · Notes · Attachments. (The History tab from earlier versions has been promoted to the top-level Audit Log tab.)
- Every confirmation emits a **bottom-center toast** *and* mirrors to the home assistant via `useHomeAssistantStore.addMessage()`.
- Auto-tick simulation using your `tick<Solution>Statuses` function feeds the stepper.

> If you find yourself building a 4th *required* tab (e.g. forcing an "Issues" or "Automations" tab on every solution), stop — Issues and Automations are *Control-specific* optional tabs. The required tab spine is exactly three (Details / Workflow / Audit Log).

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

## 5. Companion docs (where the design system lives)

The platform's design system spans three docs that work together. This implementation recipe is one of them:

- **[`solution-framework.md`](./solution-framework.md)** — *the headlining architectural contract*. Defines the 7-level taxonomy (Org Workspace → Solutions → Workflows → Object Types → Pipeline → Focus → Artifact), the required component spine, the per-solution flex points, and the **fillable `SolutionDefinition` registration schema**. This is what you fill in to add a new solution; the framework promises a working canon-compliant UI in return.
- **[`ui-pattern-canon.md`](./ui-pattern-canon.md)** — *the pixel-level visual reference + live drift audit*. Layer-by-layer specification of every component referenced in the architecture, anchored to SOX Control Testing (CTL-003). Part 2 contains the re-graded TPRM drift audit with severity ranking and recommended retrofit order.
- **`workflow-archetype.md`** *(this doc)* — *the engineering implementation recipe*. File structure, wiring conventions, persistence patterns, and gotchas.

### Why the docs are split this way

A previous single-doc version conflated "the architecture" with "the visuals" with "the implementation recipe", and it accidentally promoted TPRM's tab structure (`Overview / Assessment / Audit Trail`) to canon. The corrected model is:

- **3 required tab slots**: Details/Overview · [Workflow verb] · Audit Log. Platform-uniform.
- **N optional object-type-specific tabs**: declared per object type in the registration (e.g. Control declares `Issues` + `Automations`; Vendor declares none).
- **A cycle dropdown on the Workflow tab**: optional per-workflow.

If you're adding a new solution, **start with `solution-framework.md` Part 5** and fill out the `SolutionDefinition`. The framework + canon docs together define everything else.
