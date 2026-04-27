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
