import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Shield,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Activity,
  Users,
  Zap,
  Sparkles,
  FileText,
  Gauge,
  Bot,
  History,
  Workflow,
  Target,
  BarChart3,
  ListChecks,
  Play,
  ExternalLink,
  Radio,
  X,
  Pencil,
  Settings,
  Send,
  Upload,
  MessageSquare,
  Copy,
  Download,
  Plus,
  Flag,
  Fingerprint,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { usePersistedBlockState, useWorkflowSessionStore } from "@/lib/workflowSessionStore";
import {
  ACTION_TYPE_META,
  type StepRunStatus,
  type SubstepActionType,
} from "@/lib/workflowArchetype";
import {
  masterEntityList,
  auditAssessmentArchetypeConfig,
  auditAssessmentPhases,
  auditAssessmentSteps,
  auditAssessmentStepIds,
  auditAssessmentBlockRules,
  tickEntityStatuses,
  seedEntityRunStatus,
  type EntityRecord,
  type EntityRunStatus,
  type AuditAssessmentBlockRule,
} from "@/lib/auditAssessmentData";
import { AUDIT_ASSESSMENT_SESSION_ID } from "@/lib/auditAssessmentLauncher";
// Canon utilities — reused so the automation-mode pill, mode selector, and config
// modal share visual contract with SOX (canon). See docs/ui-pattern-canon.md § 1.5.6.
import {
  AutomationModeSelector,
  automationModeIcons,
  automationModeLabels,
  type AutomationMode,
} from "./AgentHubHome";
import { auditAssessmentWorkflow } from "@/solutions/audit-assessment";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";

// ─────────────────────────────────────────────────────────────────────────────
// Visual primitives (mirrored from SOX FieldworkComplexHub / ControlFocusPage)
// ─────────────────────────────────────────────────────────────────────────────

function SubStepIndicator({ status }: { status: string }) {
  if (status === "complete") return <CheckCircle2 className="w-3.5 h-3.5 text-[#266C92]" />;
  if (status === "running") return <Loader2 className="w-3.5 h-3.5 text-[#266C92] animate-spin" />;
  if (status === "waiting") return <Clock className="w-3.5 h-3.5 text-amber-500" />;
  if (status === "blocked") return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
  return <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-slate-300 dark:border-slate-600" />;
}

function stepDot(status: StepRunStatus) {
  if (status === "complete") return <CheckCircle2 className="w-3 h-3 text-[#266C92]" />;
  if (status === "running") return <Loader2 className="w-3 h-3 text-[#266C92] animate-spin" />;
  if (status === "waiting") return <Clock className="w-3 h-3 text-amber-500" />;
  if (status === "blocked") return <AlertCircle className="w-3 h-3 text-red-500" />;
  if (status === "skipped") return <span className="text-[10px] text-muted-foreground">—</span>;
  return <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />;
}

function ActionTypeBadge({ actionType }: { actionType: SubstepActionType }) {
  const meta = ACTION_TYPE_META[actionType];
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide ${meta.tone}`}
      data-testid={`action-tag-${actionType}`}
    >
      {meta.shortLabel}
    </span>
  );
}

/**
 * SOX-canonical inline mode marker — small Lucide icon next to the substep description.
 * - `auto` → Zap (emerald)
 * - `ai`   → Bot (blue)
 * - `hitl` → Fingerprint (amber)
 *
 * Mirrors `automationModeIcons` in AgentHubHome around line 2868.
 */
function ActionTypeIcon({ actionType }: { actionType: SubstepActionType }) {
  const meta = ACTION_TYPE_META[actionType];
  const Icon = meta.icon;
  return (
    <Icon
      className={`w-3 h-3 shrink-0 ${meta.iconColor}`}
      data-testid={`action-icon-${actionType}`}
      aria-label={meta.title}
    />
  );
}

// Decide overall entity outcome for "Effective"-equivalent badge in header / tracker
function getEntityOutcome(entity: EntityRecord, status: EntityRunStatus | undefined): {
  label: string;
  tone: "satisfactory" | "conditional" | "unsatisfactory" | "re-audit" | "in-progress" | "pending";
} | null {
  if (!status) return null;
  const allDone = auditAssessmentStepIds.every(
    (s) => status.steps[s] === "complete" || status.steps[s] === "skipped"
  );
  if (!allDone) {
    const anyRunning = auditAssessmentStepIds.some((s) => status.steps[s] === "running" || status.steps[s] === "waiting");
    return anyRunning ? { label: "In Progress", tone: "in-progress" } : { label: "Pending", tone: "pending" };
  }
  // `fired` indicates a continuous-monitoring re-audit signal.
  if (status.fired) return { label: "Re-audit Required", tone: "re-audit" };
  // Open prior findings degrade the conclusion to Partial when the agent's
  // run-context shows them carrying forward into the cycle.
  const openFindings = entity.priorFindings.filter((f) => f.status === "open").length;
  if (openFindings > 0 && entity.conclusion === "Pending") return { label: "Partial", tone: "conditional" };
  if (entity.conclusion === "Unsatisfactory") return { label: "Unsatisfactory", tone: "unsatisfactory" };
  if (entity.conclusion === "Re-audit required") return { label: "Re-audit Required", tone: "re-audit" };
  if (entity.conclusion === "Partial") return { label: "Partial", tone: "conditional" };
  return { label: "Satisfactory", tone: "satisfactory" };
}

function outcomeBadgeClasses(tone: NonNullable<ReturnType<typeof getEntityOutcome>>["tone"]) {
  switch (tone) {
    case "satisfactory":
      return "bg-[#266C92]/10 text-[#266C92]";
    case "conditional":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "unsatisfactory":
      return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
    case "re-audit":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";
    case "in-progress":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  }
}

function tierBadgeClasses(tier: string) {
  if (tier === "Critical") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (tier === "High") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (tier === "Medium") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
}

// Entity run-context — direct analog of SOX getTestDetailInfo / Test Details strip.
// Drift-fix #2.5: previously this returned static record metadata (Risk Tier, Annual
// Spend, etc.). The framework run-context schema requires the *current run* attributes:
// who is executing, who is reviewing, what request kicked it off, time/scope/due.
// Static record data lives on the Details/Overview tab.
function getEntityRunContext(entity: EntityRecord, cycleId: string): [string, string][] {
  const labels = auditAssessmentWorkflow.runContextSchema.slots.map((slot) => slot.label);
  const values = auditAssessmentWorkflow.runContextSchema.resolveValues(entity.id, cycleId);
  return labels.map((label, i) => [label, String(values[i] ?? "—")]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Overview Tab — analog of ControlDetailsTab (collapsible sections)
// ─────────────────────────────────────────────────────────────────────────────

function EntityOverviewTab({ entity }: { entity: EntityRecord }) {
  const [identityOpen, setIdentityOpen] = useState(true);
  const [classificationOpen, setClassificationOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);
  const [dataOpen, setDataOpen] = useState(true);

  const openFindings = entity.priorFindings.filter((f) => f.status === "open").length;
  const closedFindings = entity.priorFindings.filter((f) => f.status === "remediated").length;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="w-[90%] mx-auto px-6 py-6 space-y-0">
        {/* Entity Information */}
        <div>
          <button
            onClick={() => setIdentityOpen(!identityOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-entity-identity"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${identityOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Entity Information</span>
          </button>
          {identityOpen && (
            <div className="flex gap-12 pb-6">
              <div className="flex-1 space-y-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Description</p>
                  <p className="text-xs text-foreground">
                    <span className="text-[#266C92] font-medium">{entity.id}</span> {entity.entityName}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    {entity.entityType} in {entity.region}. Executive owner: {entity.ownerExec.name} ({entity.ownerExec.title}, {entity.ownerExec.email}).
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Notes</p>
                  <p className="text-xs text-foreground/90 leading-relaxed mt-0.5">{entity.notes || "—"}</p>
                </div>
              </div>
              <div className="w-52 shrink-0 space-y-3.5">
                {([
                  ["Entity ID", entity.id],
                  ["Entity Type", entity.entityType],
                  ["Region", entity.region],
                  ["Executive Owner", entity.ownerExec.name],
                  ["Title", entity.ownerExec.title],
                  ["Headcount", entity.headcount.toLocaleString()],
                  ["Annual Revenue", entity.annualRevenue],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">{label}</p>
                    <p className="text-xs text-foreground font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-border" />

        {/* Risk Classification */}
        <div>
          <button
            onClick={() => setClassificationOpen(!classificationOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-entity-classification"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${classificationOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Risk Classification</span>
          </button>
          {classificationOpen && (
            <div className="flex gap-12 pb-6">
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Risk Tier</p>
                  <p
                    className={`text-xs mt-0.5 font-medium ${
                      entity.riskTier === "Critical"
                        ? "text-red-600 dark:text-red-400"
                        : entity.riskTier === "High"
                          ? "text-red-600 dark:text-red-400"
                          : entity.riskTier === "Medium"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground"
                    }`}
                  >
                    {entity.riskTier}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Regulatory Exposure</p>
                  <ul className="mt-1 space-y-0.5 ml-4">
                    {entity.regulatoryExposure.length === 0 ? (
                      <li className="text-xs text-muted-foreground">None</li>
                    ) : (
                      entity.regulatoryExposure.map((r) => (
                        <li key={r} className="text-xs text-foreground">
                          <span className="text-[#266C92] font-medium">{r}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              <div className="w-52 shrink-0 space-y-3.5">
                {([
                  ["Inherent Risk", entity.inherentRisk],
                  ["Residual Risk", entity.residualRisk],
                  ["Track", entity.track === "continuous" ? "Continuous Monitoring" : "Full Audit"],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">{label}</p>
                    <p className="text-xs text-foreground font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-border" />

        {/* Audit Status */}
        <div>
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-entity-status"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${statusOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Audit Status</span>
          </button>
          {statusOpen && (
            <div className="flex gap-12 pb-6">
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Status</p>
                  <p className="text-xs text-foreground mt-0.5">{entity.auditStatus}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Audit History</p>
                  <p className="text-xs text-foreground mt-0.5">
                    Last audit: <span className="font-medium">{entity.lastAuditDate}</span>
                  </p>
                  <p className="text-xs text-foreground mt-0.5">
                    Next due: <span className="font-medium">{entity.nextAuditDue}</span>
                  </p>
                </div>
                {(openFindings + closedFindings) > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Prior Findings</p>
                    <p className="text-xs text-foreground mt-0.5">
                      <span className={openFindings > 0 ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                        {openFindings} open
                      </span>{" "}
                      · {closedFindings} remediated
                    </p>
                  </div>
                )}
              </div>
              <div className="w-52 shrink-0 space-y-3.5">
                {([
                  ["Audit Status", entity.auditStatus],
                  ["Conclusion", entity.conclusion],
                  ["Last Audit", entity.lastAuditDate],
                  ["Next Due", entity.nextAuditDue],
                  ["Open Findings", String(openFindings)],
                  ["Remediated", String(closedFindings)],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">{label}</p>
                    <p className="text-xs text-foreground font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-border" />

        {/* Scope & Prior Findings */}
        <div>
          <button
            onClick={() => setDataOpen(!dataOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-entity-data"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dataOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Scope & Prior Findings</span>
          </button>
          {dataOpen && (
            <div className="pb-6 space-y-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-1">Audit Scope</p>
                <ul className="space-y-1 ml-4 list-disc">
                  {entity.auditScope.length === 0 ? (
                    <li className="text-xs text-muted-foreground">No scope areas defined.</li>
                  ) : (
                    entity.auditScope.map((s) => (
                      <li key={s} className="text-xs text-foreground">{s}</li>
                    ))
                  )}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-1">Prior Findings</p>
                <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-border bg-slate-50/80 dark:bg-muted/20">
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-24">Finding</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-24">Severity</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-36">Area</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Summary</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-28">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entity.priorFindings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-muted-foreground italic">No prior findings carried forward.</td>
                        </tr>
                      )}
                      {entity.priorFindings.map((f) => (
                        <tr key={f.id} className="border-b last:border-b-0 border-slate-100 dark:border-border/50">
                          <td className="px-4 py-3 text-foreground font-mono text-[11px] align-top">{f.id}</td>
                          <td className="px-4 py-3 align-top">
                            <Badge
                              className={`text-[10px] h-4 ${
                                f.severity === "high"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : f.severity === "medium"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              } border-0 capitalize`}
                            >
                              {f.severity}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-foreground align-top">{f.area}</td>
                          <td className="px-4 py-3 text-foreground/80 align-top">{f.summary}</td>
                          <td className="px-4 py-3 align-top">
                            <Badge
                              className={`text-[10px] h-4 ${
                                f.status === "open"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              } border-0 capitalize`}
                            >
                              {f.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity StepNodeContent — analog of SOX StepNodeContent (substep rows)
// ─────────────────────────────────────────────────────────────────────────────

interface EntityStepNodeContentProps {
  step: typeof auditAssessmentSteps[number];
  stepStatus: StepRunStatus;
  entityId: string;
  /** Number of substeps already complete in this step (canon parity — drives progressive reveal). */
  substepProgress: number;
  /** Per-substep automation mode — drives the mode icon next to each substep label. */
  automationConfig?: { mode: AutomationMode; substeps: Record<string, AutomationMode> };
  onResolveHitl: (entityId: string, stepId: string, decision: "approve" | "modify" | "reject") => void;
  /** Universal block-resolution handler. Fires when the user clicks any inline
   * affordance under a substep. Mirrors canon's `onSubstepAction` semantics. */
  onResolveBlocker?: (entityId: string, stepId: string, substepId: string, affordanceId: string) => void;
  onSubstepAction?: (substepId: string, action: string) => void;
  autoExpandedSubs?: Set<string>;
  manualTriggered?: Set<string>;
  checkpointAcked?: Set<string>;
  onResumeSubstep?: (substepId: string) => void;
  onAckCheckpoint?: (substepId: string) => void;
}

function SubstepOutput({ output }: { output: NonNullable<typeof auditAssessmentSteps[number]["substeps"][number]["output"]> }) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-border bg-white dark:bg-card p-2.5">
      <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
        <Sparkles className="w-2.5 h-2.5 text-[#266C92]" />
        {output.label}
      </div>
      {output.kind === "score" && (
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">{output.scoreValue}</span>
          {output.scoreLabel && <span className="text-[10px] text-muted-foreground">{output.scoreLabel}</span>}
        </div>
      )}
      {output.kind === "narrative" && (
        <>
          <p className="text-[11px] text-foreground/80 leading-relaxed">{output.body}</p>
          {output.items && output.items.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-border/50 space-y-0.5">
              {output.items.map((it, k) => (
                <div key={k} className="grid grid-cols-[8rem_1fr_auto] gap-2 text-[10px]">
                  <span className="text-muted-foreground">{it.label}</span>
                  <span className="text-foreground">{it.value ?? ""}</span>
                  {it.status && (
                    <span
                      className={`text-[9px] font-semibold ${
                        it.status === "ok"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : it.status === "warn"
                            ? "text-amber-600 dark:text-amber-400"
                            : it.status === "gap"
                              ? "text-red-600 dark:text-red-400"
                              : it.status === "info"
                                ? "text-[#266C92] dark:text-sky-400"
                                : "text-muted-foreground"
                      }`}
                    >
                      {it.status.toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {(output.kind === "annotation" || output.kind === "list" || output.kind === "request") && (
        <div className="space-y-0.5">
          {output.items?.map((it, k) => (
            <div key={k} className="grid grid-cols-[8rem_1fr_auto] gap-2 text-[10px]">
              <span className="text-muted-foreground">{it.label}</span>
              <span className="text-foreground">{it.value ?? ""}</span>
              {it.status && (
                <span
                  className={`text-[9px] font-semibold ${
                    it.status === "ok"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : it.status === "warn"
                        ? "text-amber-600 dark:text-amber-400"
                        : it.status === "gap"
                          ? "text-red-600 dark:text-red-400"
                          : it.status === "info"
                            ? "text-[#266C92] dark:text-sky-400"
                            : "text-muted-foreground"
                  }`}
                >
                  {it.status.toUpperCase()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Faithful structural clone of canon's `StepNodeContent` (AgentHubHome.tsx ≈ 3078).
 * Same row layout (number / status / content icon / label / mode icon / description / chevron),
 * same substep state machine (pending/running/waiting/blocked/complete + checkpoint-held + manual-waiting),
 * same inline affordances pattern, same bottom-of-step status messages.
 *
 * The ONLY divergences from canon are the data source (auditAssessmentSteps[].substeps vs stepNodeInfo[step].substeps)
 * and the inline-affordance set (per the framework's per-substep `inlineAffordances` declarations).
 */
function EntityStepNodeContent({
  step,
  stepStatus,
  entityId,
  substepProgress,
  automationConfig,
  onResolveHitl,
  onResolveBlocker,
  onSubstepAction,
  autoExpandedSubs,
  manualTriggered,
  checkpointAcked,
  onResumeSubstep,
  onAckCheckpoint,
}: EntityStepNodeContentProps) {
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(() => new Set());

  const stepMode: AutomationMode = automationConfig?.mode ?? "full";
  const allSubsDone = substepProgress >= step.substeps.length;

  const mergedExpanded = useMemo(() => {
    const s = new Set(expandedSubs);
    if (autoExpandedSubs) autoExpandedSubs.forEach((id) => s.add(id));
    return s;
  }, [expandedSubs, autoExpandedSubs]);

  const toggleSub = (id: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2" data-testid={`step-node-${step.id}`}>
      {step.substeps.map((sub, idx) => {
        const subMode: AutomationMode = automationConfig?.substeps?.[sub.id] ?? stepMode;

        // Canon-identical substep status computation. Progresses through substeps
        // one-by-one driven by `substepProgress`, with checkpoint/manual gates
        // surfacing at the active substep when relevant.
        const baseStatus: StepRunStatus =
          stepStatus === "complete" || idx < substepProgress
            ? "complete"
            : stepStatus === "blocked" && idx === substepProgress
              ? "blocked"
              : idx === substepProgress && stepStatus === "waiting"
                ? "waiting"
                : idx === substepProgress && stepStatus === "running"
                  ? "running"
                  : "pending";

        const isCheckpointHeld =
          baseStatus === "complete" && subMode === "checkpoint" && !checkpointAcked?.has(sub.id);
        const isManualWaiting =
          subMode === "manual" &&
          stepStatus === "running" &&
          idx === substepProgress &&
          !manualTriggered?.has(sub.id) &&
          (baseStatus === "pending" || baseStatus === "running");
        const subStatus: string = isManualWaiting
          ? "manual-waiting"
          : isCheckpointHeld
            ? "checkpoint-held"
            : baseStatus;

        const SubIcon = sub.icon;
        const hasOutput = !!sub.output;
        const isExpanded = mergedExpanded.has(sub.id);
        const isExpandable = baseStatus === "complete" && hasOutput;
        const modeIconInfo = automationModeIcons[subMode];
        const ModeIcon = modeIconInfo.icon;

        // Inline affordances (canon parity). Currently any substep with a HITL
        // gate uses the inline approve/modify/reject pattern below; non-HITL
        // affordances (Upload / Request via Workstream) can be added per-substep
        // in tprmData.ts via the `inlineAffordances` declaration on SubstepDef.
        return (
          <div key={sub.id} className="transition-colors" data-testid={`substep-${sub.id}`}>
            <button
              onClick={() => isExpandable && hasOutput && toggleSub(sub.id)}
              disabled={!isExpandable || !hasOutput}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                subStatus === "running"
                  ? "bg-[#266C92]/[0.04]"
                  : subStatus === "checkpoint-held"
                    ? "bg-amber-50/40 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30"
                    : subStatus === "manual-waiting"
                      ? "bg-blue-50/40 dark:bg-blue-900/10 border border-blue-200/60 dark:border-blue-800/30"
                      : subStatus === "waiting"
                        ? "bg-amber-50/30 dark:bg-amber-900/5"
                        : subStatus === "blocked"
                          ? "bg-red-50/30 dark:bg-red-900/5"
                          : isExpandable && hasOutput
                            ? "hover:bg-slate-50/80 dark:hover:bg-muted/10 cursor-pointer"
                            : "cursor-default"
              } ${subStatus === "pending" ? "opacity-50" : ""}`}
              data-testid={`substep-toggle-${sub.id}`}
            >
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-muted-foreground font-mono w-4 text-right">
                  {idx + 1}
                </span>
                <SubStepIndicator status={baseStatus} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SubIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span
                    className={`text-xs font-medium ${
                      baseStatus === "complete" || baseStatus === "running"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {sub.label}
                  </span>
                  <ModeIcon
                    className={`w-2.5 h-2.5 ${modeIconInfo.color} shrink-0 opacity-70`}
                    title={modeIconInfo.title}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{sub.description}</p>
              </div>
              {isExpandable && hasOutput && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {/* Checkpoint-held state — canon parity (AgentHubHome.tsx ≈ 3180). */}
            {subStatus === "checkpoint-held" && (
              <div className="pl-12 pr-3 pb-2 pt-1">
                <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
                  <Flag className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex-1">
                    Checkpoint — review before proceeding
                  </span>
                  <Button
                    size="sm"
                    className="h-6 px-2.5 text-[10px] gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAckCheckpoint?.(sub.id);
                    }}
                    data-testid={`button-ack-checkpoint-${sub.id}`}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Confirm
                  </Button>
                </div>
              </div>
            )}

            {/* Manual-waiting state — canon parity. Renders a simple "Run substep"
                trigger; canon uses a per-substep form, but tprmData substeps don't
                declare per-substep input schemas, so we use a generic Run button. */}
            {subStatus === "manual-waiting" && (
              <div className="pl-12 pr-3 pb-2 pt-1">
                <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
                  <Fingerprint className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium flex-1">
                    Manual mode — trigger this substep to continue
                  </span>
                  <Button
                    size="sm"
                    className="h-6 px-2.5 text-[10px] gap-1 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResumeSubstep?.(sub.id);
                    }}
                    data-testid={`button-run-manual-${sub.id}`}
                  >
                    <Play className="w-2.5 h-2.5" />
                    Run substep
                  </Button>
                </div>
              </div>
            )}

            {/* Output expansion — canon parity. */}
            {isExpanded && hasOutput && sub.output && (
              <div className="pl-12 pr-3 pb-3 pt-1">
                <SubstepOutput output={sub.output} />
              </div>
            )}

            {/* Universal inline-affordance row — canon parity with the
                pop-ingest / evd-collect Upload + Request buttons. Surfaces
                whenever the substep is the active one and its status is in
                the affordance's `showWhen` set. Click marks the block resolved. */}
            {sub.inlineAffordances && idx === substepProgress && sub.inlineAffordances.some((a) => a.showWhen.includes(baseStatus as "running" | "blocked" | "waiting")) && (
              <div className="pl-12 pr-3 pb-2 pt-1" data-testid={`substep-affordances-${sub.id}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  {sub.inlineAffordances
                    .filter((a) => a.showWhen.includes(baseStatus as "running" | "blocked" | "waiting"))
                    .map((aff) => {
                      const Icon = aff.icon;
                      const isPrimary = aff.variant === "primary";
                      return (
                        <Button
                          key={aff.id}
                          size="sm"
                          variant={isPrimary ? "default" : "outline"}
                          className={`h-7 text-[11px] gap-1.5 ${isPrimary ? "bg-[#266C92] hover:bg-[#1e5a7a] text-white" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveBlocker?.(entityId, step.id, sub.id, aff.id);
                          }}
                          data-testid={`affordance-${sub.id}-${aff.id}`}
                        >
                          <Icon className="w-3 h-3" />
                          {aff.label}
                        </Button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Inline HITL approve/modify/reject card — sits directly under the gate
                substep when the step is in "waiting" status. Mirrors canon's
                inline-checkpoint pattern (different verb set; same anchor). */}
            {baseStatus === "waiting" && sub.isHitlGate && (
              <div
                className="ml-12 mr-3 mb-1 mt-1 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-900/15 p-3"
                data-testid={`hitl-checkpoint-${sub.id}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                    Reviewer checkpoint — record disposition before proceeding
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed mb-3">
                  Approve to resume the workflow, Modify to apply reviewer overrides and resume,
                  or Reject to block this step pending remediation.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className="h-7 text-[11px] gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                    onClick={() => onResolveHitl(entityId, step.id, "approve")}
                    data-testid={`hitl-approve-${step.id}`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] gap-1.5"
                    onClick={() => onResolveHitl(entityId, step.id, "modify")}
                    data-testid={`hitl-modify-${step.id}`}
                  >
                    <Pencil className="w-3 h-3" />
                    Modify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] gap-1.5 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    onClick={() => onResolveHitl(entityId, step.id, "reject")}
                    data-testid={`hitl-reject-${step.id}`}
                  >
                    <AlertCircle className="w-3 h-3" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom-of-step status messages — canon parity (AgentHubHome.tsx ≈ 3306). */}
      {stepStatus === "complete" && (
        <div className="p-2.5 rounded-lg bg-[#266C92]/5 border border-[#266C92]/15">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#266C92]" />
            <p className="text-xs text-[#266C92] font-medium">Step completed — all substeps processed successfully.</p>
          </div>
        </div>
      )}

      {stepStatus === "running" && allSubsDone && (() => {
        const lastSub = step.substeps[step.substeps.length - 1];
        const lastSubMode: AutomationMode =
          (lastSub && automationConfig?.substeps?.[lastSub.id]) ?? stepMode;
        const lastCheckpointPending =
          lastSubMode === "checkpoint" && lastSub && !checkpointAcked?.has(lastSub.id);
        if (lastCheckpointPending) return null;
        return (
          <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/50 dark:bg-emerald-900/10 dark:border-emerald-800/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                {stepMode === "checkpoint"
                  ? "All substeps complete — checkpoint review passed. Confirm to proceed."
                  : stepMode === "manual"
                    ? "All substeps triggered and complete — confirm to proceed."
                    : "All substeps complete — awaiting your confirmation to proceed."}
              </p>
            </div>
          </div>
        );
      })()}

      {stepStatus === "running" && !allSubsDone && (
        <div className="p-2.5 rounded-lg bg-[#266C92]/5 border border-[#266C92]/15">
          <div className="flex items-center gap-2">
            {stepMode === "manual" ? (
              <>
                <Fingerprint className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Manual mode — substep {Math.min(substepProgress + 1, step.substeps.length)} of {step.substeps.length} awaiting trigger
                </p>
              </>
            ) : stepMode === "checkpoint" ? (
              <>
                <Flag className="w-3 h-3 text-amber-500" />
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Checkpoint mode — substep {Math.min(substepProgress + 1, step.substeps.length)} of {step.substeps.length}
                </p>
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 text-[#266C92] animate-spin" />
                <p className="text-xs text-[#266C92] font-medium">
                  Agent processing — substep {Math.min(substepProgress + 1, step.substeps.length)} of {step.substeps.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Audit Trail — chronological substep history
// ─────────────────────────────────────────────────────────────────────────────

function EntityAuditTrailTab({ status }: { status: EntityRunStatus | undefined }) {
  const events = useMemo(() => {
    if (!status) return [];
    const out: { ts: string; actor: string; action: string; type: SubstepActionType }[] = [];
    let n = 0;
    auditAssessmentSteps.forEach((step) => {
      const st = status.steps[step.id];
      if (st === "complete") {
        step.substeps.forEach((ss) => {
          out.push({
            ts: `T-${(60 - n).toString().padStart(2, "0")}m`,
            actor: ss.actionType === "hitl" ? "Reviewer" : "Audit Agent",
            action: ss.description,
            type: ss.actionType,
          });
          n += 2;
        });
      } else if (st === "skipped") {
        out.push({
          ts: `T-${(60 - n).toString().padStart(2, "0")}m`,
          actor: "Routing Engine",
          action: `Skipped ${step.title} (Low auto-track)`,
          type: "auto",
        });
        n += 1;
      }
    });
    return out;
  }, [status]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="w-[90%] mx-auto px-6 py-6">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <History className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">No Audit Entries Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Audit trail entries will appear here as the assessment progresses.
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden" data-testid="audit-trail">
            <div className="grid grid-cols-[5rem_8rem_4rem_1fr] gap-2 px-3 py-2 bg-slate-50 dark:bg-muted/20 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-slate-200 dark:border-border">
              <span>When</span>
              <span>Actor</span>
              <span>Type</span>
              <span>Action</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-border/50">
              {events.map((e, i) => (
                <div key={i} className="grid grid-cols-[5rem_8rem_4rem_1fr] gap-2 px-3 py-2 text-[11px] items-center">
                  <span className="text-muted-foreground font-mono">{e.ts}</span>
                  <span className="text-foreground">{e.actor}</span>
                  <ActionTypeBadge actionType={e.type} />
                  <span className="text-foreground/90">{e.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Monitoring Live Panel — "alive" feel for the Continuous Monitoring step.
// Pulsing live dot, signal-source health badges, and a ticker that surfaces
// new monitoring entries on a 1.6s rolling cadence (synthetic in-memory).
// ─────────────────────────────────────────────────────────────────────────────

const MONITORING_SOURCES: { id: string; label: string }[] = [
  { id: "adverse-news", label: "Adverse News" },
  { id: "soc2-watch", label: "SOC 2 Watch" },
  { id: "breach-feed", label: "Breach Feed" },
  { id: "ownership", label: "Ownership Changes" },
  { id: "renewals", label: "Contract Renewals" },
];

function MonitoringLivePanel({ entity, fired }: { entity: EntityRecord; fired: boolean }) {
  // Synthetic ticker entries — Audit has no per-entity monitoring records, so we
  // seed empty and let the synthetic-tick effect populate. This component is
  // dead code for the audit workflow today (no step has id "monitoring") but
  // is preserved structurally for future continuous-audit triggers.
  type Tick = { id: string; ts: string; source: string; description: string; severity: "info" | "warn" | "critical" };

  const seedEntries: Tick[] = useMemo(() => [], [entity.id, fired]);

  const [ticks, setTicks] = useState<Tick[]>(seedEntries);
  const [pulseTick, setPulseTick] = useState(0);

  // Refresh seed if entity changes
  useEffect(() => {
    setTicks(seedEntries);
  }, [entity.id, seedEntries]);

  // Pulse + rolling ticker
  useEffect(() => {
    const pulse = setInterval(() => setPulseTick((t) => t + 1), 1600);
    return () => clearInterval(pulse);
  }, []);

  useEffect(() => {
    const synthetic: Omit<Tick, "id" | "ts">[] = [
      { source: "Adverse News", description: "No new alerts in last polling window.", severity: "info" },
      { source: "SOC 2 Watch", description: "Certificate scan complete — no expiry change.", severity: "info" },
      { source: "Breach Feed", description: "Cross-checked against HaveIBeenPwned & Recorded Future. Clean.", severity: "info" },
      { source: "Ownership", description: "EDGAR scrape complete — no ownership change detected.", severity: "info" },
      { source: "Renewals", description: "Contract renewal in 124 days — no action required yet.", severity: "info" },
    ];
    if (fired) {
      synthetic.push(
        { source: "SOC 2 Watch", description: "SOC 2 expires in 18 days — re-assessment scheduled.", severity: "warn" },
        { source: "Adverse News", description: "Material adverse event flagged — partial re-assessment triggered.", severity: "critical" }
      );
    }

    const timer = setInterval(() => {
      setTicks((prev) => {
        const next = synthetic[Math.floor(Math.random() * synthetic.length)];
        const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const entry: Tick = { id: `tick-${Date.now()}`, ts, ...next };
        return [entry, ...prev].slice(0, 10);
      });
    }, 2400);
    return () => clearInterval(timer);
  }, [fired]);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card overflow-hidden" data-testid="monitoring-live-panel">
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-border bg-slate-50/80 dark:bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-semibold text-foreground">Continuous Monitoring — Live</span>
          <span className="relative flex h-2 w-2" key={pulseTick}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">Polling every 60s · {MONITORING_SOURCES.length} sources</span>
      </div>

      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-border flex items-center gap-1.5 flex-wrap">
        {MONITORING_SOURCES.map((s) => (
          <Badge
            key={s.id}
            className="text-[9px] h-5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/30"
            data-testid={`monitoring-source-${s.id}`}
          >
            <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1" />
            {s.label}
          </Badge>
        ))}
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-border">
        {ticks.length === 0 ? (
          <div className="px-4 py-3 text-[11px] text-muted-foreground italic">Waiting for first signal…</div>
        ) : (
          ticks.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-2 border-l-2 ${
                t.severity === "critical"
                  ? "border-l-red-400 bg-red-50/40 dark:bg-red-900/10"
                  : t.severity === "warn"
                    ? "border-l-amber-400 bg-amber-50/40 dark:bg-amber-900/10"
                    : "border-l-emerald-400/60"
              }`}
              data-testid={`monitoring-tick-${t.id}`}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-mono text-muted-foreground shrink-0 w-20">{t.ts}</span>
                <span className="text-[10px] font-semibold text-foreground/80 shrink-0">{t.source}:</span>
                <p className="text-[11px] text-foreground/90 leading-relaxed">{t.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Focus Page — analog of SOX ControlFocusPage (header / tabs / stepper / step content / footer)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Drift-fix #2.7 — EntityAuditEmptyState
// Mirrors canon's "Test with Agent" cold-start panel.
// ─────────────────────────────────────────────────────────────────────────────

function EntityAuditEmptyState({
  entity,
  automationConfig,
  onStart,
  onConfigure,
}: {
  entity: EntityRecord;
  automationConfig: EntityAutomationConfig;
  onStart: () => void;
  onConfigure: () => void;
}) {
  const stepModes: AutomationMode[] = auditAssessmentSteps.map((s) => automationConfig[s.id]?.mode ?? "full");
  const allSame = stepModes.every((m) => m === stepModes[0]);
  const globalLabel = allSame ? automationModeLabels[stepModes[0]].label : null;
  const GlobalIcon = allSame ? automationModeIcons[stepModes[0]].icon : null;
  const fullCount = stepModes.filter((m) => m === "full").length;
  const checkCount = stepModes.filter((m) => m === "checkpoint").length;
  const manualCount = stepModes.filter((m) => m === "manual").length;

  return (
    <div className="flex-1 min-h-0 flex items-center justify-center" data-testid="entity-assessment-empty">
      <div className="text-center max-w-md space-y-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#266C92]/10 flex items-center justify-center">
          <Bot className="w-7 h-7 text-[#266C92]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Entity Audit</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Run the agent-assisted audit workflow for{" "}
            <span className="font-medium text-foreground">
              {entity.id} — {entity.entityName}
            </span>
            . The agent will guide you through readiness, evidence collection, scoring, reviewer disposition, stakeholder commentary, report composition, workpaper notes, submission, and distribution.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-200/60 dark:border-border/40 space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            {GlobalIcon && <GlobalIcon className="w-3 h-3 text-[#266C92]/60" />}
            <span className="text-[11px] font-semibold text-foreground/80">
              {allSame ? `${globalLabel} across all steps` : "Mixed automation levels"}
            </span>
          </div>
          {allSame && stepModes[0] === "full" && (
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              The agent will execute all 9 steps end-to-end, pausing only when reviewer disposition or external data is required. Use the gear icon to customize per-step behavior.
            </p>
          )}
          {allSame && stepModes[0] === "checkpoint" && (
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              The agent will pause after each substep for your review and confirmation before proceeding.
            </p>
          )}
          {allSame && stepModes[0] === "manual" && (
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              Each substep must be configured and triggered manually.
            </p>
          )}
          {!allSame && (
            <div className="flex items-center justify-center gap-3">
              {fullCount > 0 && (
                <div className="flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-[#266C92]/50" />
                  <span className="text-[10px] text-muted-foreground">{fullCount} auto</span>
                </div>
              )}
              {checkCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{checkCount} checkpoint</span>
                </div>
              )}
              {manualCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{manualCount} manual</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="default"
              className="h-10 px-6 text-sm gap-2 bg-[#266C92] hover:bg-[#1e5a7a] text-white shadow-sm"
              onClick={onStart}
              data-testid="button-start-audit"
            >
              <Play className="w-4 h-4" />
              Run Assessment
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={onConfigure}
              data-testid="button-automation-config"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">9 steps · ~25 min estimated</p>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-border">
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2">
            {auditAssessmentSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-[10px] text-muted-foreground">{step.shortLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drift-fix #2.16 — EntityAuditReportContent (terminal artifact for the Outputs step).
// Analog of canon's WorkpaperContent. Sections come from auditAssessmentWorkflow.terminalArtifact.
// ─────────────────────────────────────────────────────────────────────────────

function EntityAuditReportContent({ entity }: { entity: EntityRecord }) {
  const [collapsed, setCollapsed] = useState(false);
  const sections = auditAssessmentWorkflow.terminalArtifact.sectionsBuilder(entity.id);

  return (
    <div data-testid="entity-risk-memo" className="space-y-4">
      <div className="border border-slate-200 dark:border-border rounded-xl bg-white dark:bg-card overflow-hidden">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-between px-5 py-3 bg-slate-50/80 dark:bg-muted/20 border-b border-slate-200 dark:border-border hover:bg-slate-100/80 dark:hover:bg-muted/30 transition-colors"
          data-testid="toggle-audit-report-collapse"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#266C92]" />
            <span className="text-sm font-semibold text-foreground">
              Audit Report — {entity.id} {entity.entityName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
              data-testid="button-export-audit-report"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
            {collapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>
        {!collapsed && (
          <div className="p-5 space-y-5">
            {sections.map((section, sIdx) => (
              <div key={sIdx}>
                <h3 className="text-xs font-semibold text-foreground mb-2">{section.title}</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody>
                      {section.rows.map(([label, value], rIdx) => (
                        <tr
                          key={rIdx}
                          className={
                            rIdx % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/30" : "bg-white dark:bg-card"
                          }
                        >
                          <td className="px-3 py-2 font-medium text-muted-foreground w-[180px] align-top border-r border-slate-100 dark:border-slate-800">
                            {label}
                          </td>
                          <td className="px-3 py-2 text-foreground">{value || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drift-fix #2.10 — EntityUtilityPanel (right-side rail).
// 4 tabs: Optro Agent · Comments · Notes · Attachments.
// (History is now the top-level Audit Log tab — see ui-pattern-canon.md § 1.7.)
// ─────────────────────────────────────────────────────────────────────────────

type UtilityPanelTab = "agent" | "comments" | "notes" | "attachments";

const utilityToolbarItems: { id: UtilityPanelTab | "close"; icon: typeof Bot; label: string }[] = [
  { id: "agent", icon: Bot, label: "Optro Agent" },
  { id: "comments", icon: MessageSquare, label: "Comments" },
  { id: "notes", icon: Pencil, label: "Notes" },
  { id: "attachments", icon: Copy, label: "Attachments" },
];

function EntityUtilityPanel({
  entity,
  status,
  activeStepId,
}: {
  entity: EntityRecord;
  status: EntityRunStatus | undefined;
  activeStepId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<UtilityPanelTab>("agent");

  const activeStep = activeStepId ? auditAssessmentSteps.find((s) => s.id === activeStepId) : undefined;
  const agentName = activeStep ? auditAssessmentWorkflow.agentNameByStep[activeStep.id] : "Audit AGENT";
  const agentDisplay = agentName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // Generate a small list of agent comments tied to completed steps for this entity.
  const agentComments = useMemo(() => {
    if (!status) return [];
    const out: { id: string; stepId: string; title: string; body: string; timestamp: string }[] = [];
    let n = 0;
    for (const step of auditAssessmentSteps) {
      const st = status.steps[step.id];
      if (st === "complete") {
        out.push({
          id: `cmt-${entity.id}-${step.id}`,
          stepId: step.id,
          title: `${step.title} — Complete`,
          body: step.outcome,
          timestamp: `${5 + n}m ago`,
        });
        n += 3;
      } else if (st === "waiting" || st === "blocked") {
        out.push({
          id: `cmt-${entity.id}-${step.id}-w`,
          stepId: step.id,
          title: `${step.title} — ${st === "blocked" ? "Blocked" : "Awaiting Reviewer"}`,
          body: step.description,
          timestamp: `just now`,
        });
        break;
      }
    }
    return out.reverse();
  }, [status, entity.id]);

  if (!expanded) {
    return (
      <div
        className="shrink-0 w-12 border-l border-slate-200 dark:border-border bg-white dark:bg-card flex flex-col items-center py-3 gap-1"
        data-testid="entity-utility-panel-collapsed"
      >
        {utilityToolbarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as UtilityPanelTab);
                setExpanded(true);
              }}
              className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted/30 transition-colors"
              title={item.label}
              data-testid={`utility-tab-${item.id}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="shrink-0 w-96 border-l border-slate-200 dark:border-border bg-white dark:bg-card flex flex-col"
      data-testid="entity-utility-panel-expanded"
    >
      <div className="shrink-0 h-12 px-3 flex items-center justify-between gap-2 border-b border-slate-200 dark:border-border">
        <div className="flex items-center gap-1">
          {utilityToolbarItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as UtilityPanelTab)}
                className={`px-2 py-1 rounded-md flex items-center gap-1.5 text-xs transition-colors ${
                  active
                    ? "bg-[#266C92]/10 text-[#266C92]"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted/30"
                }`}
                title={item.label}
                data-testid={`utility-tab-active-${item.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {active && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted/30 transition-colors"
          data-testid="utility-panel-close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {activeTab === "agent" && (
          <div className="space-y-3" data-testid="utility-panel-agent">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#266C92]/5">
              <div className="w-6 h-6 rounded-full bg-[#266C92] flex items-center justify-center shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#266C92]">{agentDisplay}</p>
                <p className="text-[10px] text-muted-foreground">Active on {activeStep?.title ?? entity.entityName}</p>
              </div>
            </div>
            {agentComments.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-6">
                The agent will narrate progress here as the workflow runs.
              </p>
            ) : (
              agentComments.map((cmt) => (
                <div key={cmt.id} className="border border-slate-200 dark:border-border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-foreground">{cmt.title}</p>
                    <span className="text-[10px] text-muted-foreground">{cmt.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{cmt.body}</p>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === "comments" && (
          <div className="text-center py-8" data-testid="utility-panel-comments">
            <MessageSquare className="w-6 h-6 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-[11px] text-muted-foreground">No comments yet. Reviewers can leave notes here.</p>
          </div>
        )}
        {activeTab === "notes" && (
          <div className="text-center py-8" data-testid="utility-panel-notes">
            <Pencil className="w-6 h-6 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-[11px] text-muted-foreground">No notes for {entity.entityName}.</p>
          </div>
        )}
        {activeTab === "attachments" && (
          <div className="space-y-2" data-testid="utility-panel-attachments">
            {entity.priorFindings.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-6">No prior findings on file.</p>
            ) : (
              entity.priorFindings.map((f, i) => (
                <div key={i} className="border border-slate-200 dark:border-border rounded-lg p-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#266C92] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">
                      {f.id} — {f.area}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{f.summary}</p>
                  </div>
                  <Badge
                    className={`text-[9px] ${
                      f.severity === "high"
                        ? "bg-red-50 text-red-700"
                        : f.severity === "medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-50 text-slate-600"
                    } border-0`}
                  >
                    {f.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drift-fix #2.9 — EntityAutomationConfigModal.
// Per-step automation policy selector. Reuses canon's AutomationModeSelector
// for the actual mode-pill UI so the visual contract stays unified.
// ─────────────────────────────────────────────────────────────────────────────

type EntityAutomationConfig = Record<string, { mode: AutomationMode; substeps: Record<string, AutomationMode> }>;

function EntityAutomationConfigModal({
  open,
  onOpenChange,
  config,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  config: EntityAutomationConfig;
  onSave: (c: EntityAutomationConfig) => void;
}) {
  const [draft, setDraft] = useState<EntityAutomationConfig>(config);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  useEffect(() => {
    if (open) setDraft(config);
  }, [open, config]);

  const setStepMode = (stepId: string, mode: AutomationMode) => {
    setDraft((d) => {
      const cur = d[stepId] ?? { mode: "full", substeps: {} };
      // Cascade to all substeps unless they were individually overridden.
      const nextSubsteps: Record<string, AutomationMode> = {};
      const step = auditAssessmentSteps.find((s) => s.id === stepId);
      if (step) for (const sub of step.substeps) nextSubsteps[sub.id] = mode;
      return { ...d, [stepId]: { mode, substeps: nextSubsteps } };
    });
  };

  const setSubstepMode = (stepId: string, substepId: string, mode: AutomationMode) => {
    setDraft((d) => {
      const cur = d[stepId] ?? { mode: "full", substeps: {} };
      return {
        ...d,
        [stepId]: { ...cur, substeps: { ...cur.substeps, [substepId]: mode } },
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="entity-automation-modal">
        <DialogHeader>
          <DialogTitle>Automation Policy — Entity Audit</DialogTitle>
          <DialogDescription>
            Configure each step (and individual substeps) to run fully automatically, pause at checkpoints, or require manual triggering.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {auditAssessmentSteps.map((step) => {
            const stepCfg = draft[step.id] ?? { mode: "full" as AutomationMode, substeps: {} };
            const isExpanded = expandedStep === step.id;
            return (
              <div
                key={step.id}
                className="border border-slate-200 dark:border-border rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 p-3">
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    className="flex-1 min-w-0 text-left flex items-center gap-2"
                    data-testid={`config-toggle-${step.id}`}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{step.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {step.substeps.length} substeps
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>
                    </div>
                  </button>
                  <AutomationModeSelector
                    value={stepCfg.mode}
                    onChange={(m) => setStepMode(step.id, m)}
                    size="small"
                    scopeId={`entity-${step.id}`}
                  />
                </div>
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10 p-3 space-y-2">
                    {step.substeps.map((sub, idx) => (
                      <div key={sub.id} className="flex items-center gap-3">
                        <span className="text-[9px] text-muted-foreground font-mono w-4 text-right">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground">{sub.label}</p>
                          <p className="text-[10px] text-muted-foreground">{sub.description}</p>
                        </div>
                        <AutomationModeSelector
                          value={stepCfg.substeps[sub.id] ?? stepCfg.mode}
                          onChange={(m) => setSubstepMode(step.id, sub.id, m)}
                          size="small"
                          scopeId={`entity-${step.id}-${sub.id}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-border">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#266C92] hover:bg-[#1e5a7a] text-white"
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save policy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type EntityFocusTab = "overview" | "assessment" | "audit";

function EntityFocusPage({
  entity,
  status,
  onBack,
  onStartAssessment,
  onAdvanceStep,
  onResolveHitl,
  onResolveBlocker,
}: {
  entity: EntityRecord;
  status: EntityRunStatus | undefined;
  onBack: () => void;
  /** Drift-fix #2.7 — empty-state CTA. Called when the user clicks "Run Assessment". */
  onStartAssessment?: (entityId: string) => void;
  onAdvanceStep: (stepId: string) => void;
  onResolveHitl: (entityId: string, stepId: string, decision: "approve" | "modify" | "reject") => void;
  /** Universal block-resolution handler — fires when an inline affordance is clicked. */
  onResolveBlocker?: (entityId: string, stepId: string, substepId: string, affordanceId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<EntityFocusTab>("assessment");
  // Drift-fix #2.4 — run-context band defaults to **collapsed** (was true).
  const [testDetailsOpen, setTestDetailsOpen] = useState(false);

  // Drift-fix #2.3 — cycle dropdown. Cycles are declared in auditAssessmentWorkflow.cycles.
  const cycles = auditAssessmentWorkflow.cycles ?? [];
  const initialCycleId = useMemo(() => {
    // Pick the cycle that's "In Progress" if present, else the first.
    return cycles.find((c) => c.status === "In Progress")?.id ?? cycles[0]?.id ?? "onboarding";
  }, [cycles]);
  const [activeCycleId, setActiveCycleId] = useState<string>(initialCycleId);
  const [cycleDropdownOpen, setCycleDropdownOpen] = useState(false);
  const cycleDropdownRef = useRef<HTMLDivElement>(null);
  const activeCycle = cycles.find((c) => c.id === activeCycleId) ?? cycles[0];

  // Close cycle dropdown on outside click — mirrors canon's pattern.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cycleDropdownRef.current && !cycleDropdownRef.current.contains(e.target as Node)) {
        setCycleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Per-step + per-substep automation config — canon-shape
  // (Record<stepId, { mode, substeps: Record<substepId, mode> }>). This is a
  // structural match for `AutomationConfig` in AgentHubHome.tsx and unlocks
  // canon's substep-level mode mixing (full / checkpoint / manual).
  const [automationConfig, setAutomationConfig] = useState<Record<string, { mode: AutomationMode; substeps: Record<string, AutomationMode> }>>(() => {
    const cfg: Record<string, { mode: AutomationMode; substeps: Record<string, AutomationMode> }> = {};
    for (const s of auditAssessmentSteps) {
      const substepModes: Record<string, AutomationMode> = {};
      for (const sub of s.substeps) substepModes[sub.id] = "full";
      cfg[s.id] = { mode: "full", substeps: substepModes };
    }
    return cfg;
  });
  const [automationModalOpen, setAutomationModalOpen] = useState(false);

  // Substep-progression state — canon parity. Tracks how many substeps inside
  // each step have completed. Drives the progressive reveal of substep status
  // (pending → running → complete) over the canon 1200ms tick cadence.
  const [substepProgress, setSubstepProgress] = useState<Record<string, number>>(() => {
    const prog: Record<string, number> = {};
    for (const s of auditAssessmentSteps) prog[s.id] = 0;
    return prog;
  });
  const [autoExpandedSubs, setAutoExpandedSubs] = useState<Set<string>>(() => new Set());
  const [checkpointAcked, setCheckpointAcked] = useState<Set<string>>(() => new Set());
  const [manualTriggered, setManualTriggered] = useState<Set<string>>(() => new Set());
  const [workflowPaused, setWorkflowPaused] = useState(false);

  const handleAckCheckpoint = useCallback((substepId: string) => {
    setCheckpointAcked((prev) => new Set(prev).add(substepId));
  }, []);
  const handleResumeSubstep = useCallback((substepId: string) => {
    setManualTriggered((prev) => new Set(prev).add(substepId));
  }, []);

  // Reset substep progression bookkeeping when switching entities.
  useEffect(() => {
    const prog: Record<string, number> = {};
    for (const s of auditAssessmentSteps) prog[s.id] = 0;
    setSubstepProgress(prog);
    setAutoExpandedSubs(new Set());
    setCheckpointAcked(new Set());
    setManualTriggered(new Set());
  }, [entity.id]);

  // Drift-fix #2.16 — terminal artifact (Audit Report) flag.
  const [outputsGenerated, setOutputsGenerated] = useState<boolean>(false);

  // Toast feedback portal state — canon parity. Used as the SOLE feedback channel
  // for all focus-page action confirmations (matches canon, which never uses the
  // shadcn `useToast` hook for focus-page actions).
  const [actionToast, setActionToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActionToast(msg);
    toastTimerRef.current = setTimeout(() => setActionToast(null), 3000);
  }, []);

  // Wrap the parent's onResolveHitl to fire the local toast on Approve/Modify/Reject.
  // Mirrors canon, where focus-page actions feed back via the actionToast portal only.
  const localResolveHitl = useCallback(
    (vId: string, sId: string, decision: "approve" | "modify" | "reject") => {
      if (decision === "approve") showToast("Approved — workflow resumed");
      else if (decision === "modify") showToast("Modifications applied — workflow resumed");
      else showToast("Rejected — step blocked pending remediation");
      onResolveHitl(vId, sId, decision);
    },
    [onResolveHitl, showToast]
  );

  // Local block-resolution wrapper — emits a contextual toast for each
  // affordance variant, then defers to the parent handler which marks the
  // block resolved and lets the simulator advance the step.
  const localResolveBlocker = useCallback(
    (vId: string, sId: string, subId: string, affId: string) => {
      const verb =
        affId === "upload" ? "uploaded"
        : affId === "request" ? "request dispatched"
        : affId === "configure" ? "configuration applied"
        : "resolved";
      showToast(`Block ${verb} — workflow resumed`);
      if (onResolveBlocker) onResolveBlocker(vId, sId, subId, affId);
    },
    [onResolveBlocker, showToast]
  );

  // Drift-fix #2.11 — assistant mirroring. Emits structured events to the home
  // assistant store on the three canonical triggers (blocked / completed /
  // workstream-initiated). See ui-pattern-canon.md § 1.10.
  const mirrorToAssistant = useCallback(
    (title: string, body: string, stepId?: string) => {
      const agentLabel = stepId ? auditAssessmentWorkflow.agentNameByStep[stepId] : undefined;
      useHomeAssistantStore.getState().addMessage({
        id: `audit-mirror-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "assistant",
        content: `**${title}**\n\n${body}`,
        timestamp: new Date().toISOString(),
        agentLabel: agentLabel
          ? agentLabel
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ")
          : undefined,
      });
    },
    [],
  );

  const mirroredEventsRef = useRef<Set<string>>(new Set());

  // Compute first-non-complete step (active step) — analog of SOX activeStepIdx
  const firstActiveIdx = useMemo(() => {
    if (!status) return 0;
    const idx = auditAssessmentStepIds.findIndex((s) => {
      const st = status.steps[s];
      return st !== "complete" && st !== "skipped";
    });
    return idx === -1 ? auditAssessmentStepIds.length - 1 : idx;
  }, [status]);

  const [activeStepIdx, setActiveStepIdx] = useState(firstActiveIdx);
  useEffect(() => {
    setActiveStepIdx(firstActiveIdx);
  }, [entity.id, firstActiveIdx]);

  // Visible step order — append "outputs" once the terminal artifact is generated.
  const visibleStepOrder = useMemo(
    () => (outputsGenerated ? [...auditAssessmentStepIds, "outputs"] : auditAssessmentStepIds),
    [outputsGenerated],
  );

  const activeStepId = visibleStepOrder[activeStepIdx];
  const isOutputsStep = activeStepId === "outputs";
  const activeStep = isOutputsStep ? null : auditAssessmentSteps[activeStepIdx];
  const activeStepStatus: StepRunStatus = isOutputsStep
    ? "complete"
    : status
      ? status.steps[(activeStep as typeof auditAssessmentSteps[number]).id] ?? "pending"
      : "pending";

  // Automation-mode pill on step header — canon parity.
  const activeStepMode: AutomationMode = activeStep ? automationConfig[activeStep.id]?.mode ?? "full" : "full";

  // Substep auto-progression — canon's 1200ms tick (AgentHubHome.tsx ≈ 5096).
  // Advances `substepProgress` while the step is "running", subject to the
  // configured per-substep mode (manual = wait for user trigger, checkpoint =
  // wait for ack on previous substep).
  useEffect(() => {
    if (!activeStep || workflowPaused) return;
    if (activeStepStatus !== "running") return;

    const stepCfg = automationConfig[activeStep.id];
    const currentProg = substepProgress[activeStep.id] ?? 0;
    const totalSubs = activeStep.substeps.length;
    if (currentProg >= totalSubs) return;

    const currentSub = activeStep.substeps[currentProg];
    const subMode: AutomationMode = stepCfg?.substeps?.[currentSub.id] ?? stepCfg?.mode ?? "full";

    // Manual mode — wait for user to click "Run substep" before advancing.
    if (subMode === "manual" && !manualTriggered.has(currentSub.id)) return;

    // Checkpoint mode — wait for previous substep's ack before advancing.
    if (subMode === "checkpoint" && currentProg > 0) {
      const prevSub = activeStep.substeps[currentProg - 1];
      if (prevSub && !checkpointAcked.has(prevSub.id)) return;
    }

    const stepKey = activeStep.id;
    const timer = setTimeout(() => {
      setSubstepProgress((prev) => {
        const cur = prev[stepKey] ?? 0;
        return cur >= totalSubs ? prev : { ...prev, [stepKey]: cur + 1 };
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [
    activeStep,
    activeStepStatus,
    automationConfig,
    substepProgress,
    manualTriggered,
    checkpointAcked,
    workflowPaused,
  ]);

  // Mirror events (drift-fix #2.11)
  useEffect(() => {
    if (!status) return;
    for (const step of auditAssessmentSteps) {
      const st = status.steps[step.id];
      const completedKey = `${entity.id}:${step.id}:complete`;
      if (st === "complete" && !mirroredEventsRef.current.has(completedKey)) {
        mirroredEventsRef.current.add(completedKey);
        mirrorToAssistant(
          `${step.title} — Complete`,
          `${entity.entityName}: ${step.title} step finished. ${step.outcome}`,
          step.id,
        );
      }
      const blockedKey = `${entity.id}:${step.id}:blocked`;
      if ((st === "waiting" || st === "blocked") && !mirroredEventsRef.current.has(blockedKey)) {
        mirroredEventsRef.current.add(blockedKey);
        const reason = st === "blocked" ? "Step is blocked." : "Reviewer disposition required.";
        mirrorToAssistant(`${step.title} — ${st === "blocked" ? "Blocked" : "Awaiting Reviewer"}`,
          `${entity.entityName}: ${reason} Open the entity focus view to record a decision.`,
          step.id,
        );
      }
    }
  }, [status, entity.id, entity.entityName, mirrorToAssistant]);

  const outcome = getEntityOutcome(entity, status);
  const isComplete = outcome?.tone === "satisfactory" || outcome?.tone === "conditional" || outcome?.tone === "unsatisfactory" || outcome?.tone === "re-audit";
  const testDetails = getEntityRunContext(entity, activeCycleId);

  const canNavigateTo = (idx: number): boolean => {
    if (!status) return idx === 0;
    const stepId = visibleStepOrder[idx];
    if (stepId === "outputs") return outputsGenerated;
    const step = auditAssessmentSteps[idx];
    const st = status.steps[step.id];
    if (st === "complete" || st === "skipped" || st === "running" || st === "waiting" || st === "blocked") return true;
    const prev = idx > 0 ? auditAssessmentSteps[idx - 1] : null;
    if (prev) {
      const ps = status.steps[prev.id];
      if (ps === "complete" || ps === "skipped") return true;
    }
    return idx === 0;
  };

  const isLastStep = activeStep ? activeStepIdx === auditAssessmentSteps.length - 1 : false;
  const stepHasHitlGate = activeStep ? activeStep.substeps.some((s) => s.isHitlGate) : false;

  return (
    <div className="relative flex h-full overflow-hidden bg-white dark:bg-background" data-testid={`entity-focus-${entity.id}`}>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar — exact SOX pattern */}
        <div className="shrink-0 h-12 px-4 flex items-center gap-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-entity-focus-back"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-border" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#266C92]" />
            <h2 className="text-sm font-semibold text-foreground">{entity.id}</h2>
            <span className="text-sm text-muted-foreground">—</span>
            <span className="text-sm text-foreground">{entity.entityName}</span>
            <Badge className={`text-[10px] h-5 ${tierBadgeClasses(entity.riskTier)} border-0 ml-2`}>
              {entity.riskTier}
            </Badge>
          </div>
          {outcome && (
            <Badge className={`ml-auto text-[10px] ${outcomeBadgeClasses(outcome.tone)} border-0`}>
              {outcome.label}
            </Badge>
          )}
        </div>

        {/* Tab bar — 3 required slots (Overview · Assessment · Audit Log).
            Drift-fix #2.3: the Assessment tab now carries a cycle dropdown
            (Initial Onboarding / Annual / Triggered) — mirrors canon's Testing
            tab dropdown for walkthrough/interim/rollforward. */}
        <div className="shrink-0 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
          <div className="px-6 flex items-center gap-6">
            {(["overview", "assessment", "audit"] as EntityFocusTab[]).map((tab) => {
              if (tab === "assessment") {
                return (
                  <div key={tab} className="relative" ref={cycleDropdownRef}>
                    <button
                      onClick={() => {
                        if (activeTab !== "assessment") {
                          setActiveTab("assessment");
                          setCycleDropdownOpen(false);
                        } else {
                          setCycleDropdownOpen((o) => !o);
                        }
                      }}
                      className={`py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeTab === "assessment"
                          ? "border-[#266C92] text-[#266C92]"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid="tab-entity-assessment"
                    >
                      <span>Assessment</span>
                      {activeCycle && (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({activeCycle.label})
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          cycleDropdownOpen && activeTab === "assessment" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {cycleDropdownOpen && activeTab === "assessment" && (
                      <div className="absolute top-full left-0 mt-0.5 z-50 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg shadow-lg py-1 min-w-[200px]">
                        {cycles.map((cycle) => (
                          <button
                            key={cycle.id}
                            onClick={() => {
                              setActiveCycleId(cycle.id);
                              setCycleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-3 transition-colors ${
                              activeCycleId === cycle.id
                                ? "bg-[#266C92]/5 text-[#266C92] font-medium"
                                : "text-foreground hover:bg-slate-50 dark:hover:bg-muted/30"
                            }`}
                            data-testid={`cycle-${cycle.id}`}
                          >
                            <span>
                              {cycle.label}
                              <span className="text-muted-foreground font-normal ml-1.5">
                                {cycle.period}
                              </span>
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
                                cycle.status === "Complete"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : cycle.status === "In Progress"
                                    ? "bg-[#266C92]/10 text-[#266C92]"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {cycle.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? "border-[#266C92] text-[#266C92]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`tab-entity-${tab}`}
                >
                  {tab === "audit" ? "Audit Log" : tab}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "overview" && <EntityOverviewTab entity={entity} />}
        {activeTab === "audit" && <EntityAuditTrailTab status={status} />}

        {/* Empty-state CTA when no run is active — canon parity with the
            "Test with Agent" panel for cold-start objects. */}
        {activeTab === "assessment" && !status && (
          <EntityAuditEmptyState
            entity={entity}
            automationConfig={automationConfig}
            onStart={() => {
              if (onStartAssessment) onStartAssessment(entity.id);
              showToast("Assessment started — agent dispatching");
            }}
            onConfigure={() => setAutomationModalOpen(true)}
          />
        )}

        {activeTab === "assessment" && status && (
          <>
            {/* Horizontal stepper — exact SOX pattern (progress line + pills) */}
            <div className="shrink-0 border-b border-slate-200 dark:border-border bg-slate-50/80 dark:bg-muted/20">
              <div className="px-5 py-2 flex items-center gap-3">
                <div className="relative flex items-center h-8 flex-1 min-w-0">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                  {(() => {
                    const completedCount = auditAssessmentStepIds.filter(
                      (s) => status.steps[s] === "complete" || status.steps[s] === "skipped"
                    ).length;
                    const total = auditAssessmentSteps.length;
                    const pct = total > 1 ? (completedCount / (total - 1)) * 100 : 0;
                    return (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#266C92] transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    );
                  })()}
                  <div className="relative flex items-center justify-between w-full">
                    {visibleStepOrder.map((stepId, idx) => {
                      const isOutputs = stepId === "outputs";
                      const step = isOutputs ? null : auditAssessmentSteps[idx];
                      const st: StepRunStatus = isOutputs ? "complete" : status.steps[(step as typeof auditAssessmentSteps[number]).id];
                      const isActive = idx === activeStepIdx;
                      const navigable = canNavigateTo(idx);
                      const shortLabel = isOutputs ? "Output" : (step as typeof auditAssessmentSteps[number]).shortLabel;
                      return (
                        <button
                          key={stepId}
                          onClick={() => navigable && setActiveStepIdx(idx)}
                          disabled={!navigable}
                          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all z-10 ring-2 ring-slate-50 dark:ring-slate-900 ${
                            navigable ? "cursor-pointer" : "cursor-default"
                          } ${
                            isActive
                              ? "bg-[#266C92] text-white shadow-sm"
                              : st === "complete"
                                ? "bg-slate-50 dark:bg-slate-900 text-[#266C92]"
                                : st === "skipped"
                                  ? "bg-slate-50 dark:bg-slate-900 text-muted-foreground/60"
                                  : st === "blocked"
                                    ? "bg-slate-50 dark:bg-slate-900 text-red-500"
                                    : st === "waiting"
                                      ? "bg-slate-50 dark:bg-slate-900 text-amber-600"
                                      : "bg-slate-50 dark:bg-slate-900 text-muted-foreground"
                          }`}
                          data-testid={`stepper-step-${stepId}`}
                        >
                          {st === "complete" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : st === "skipped" ? (
                            <span className="text-[9px]">—</span>
                          ) : st === "running" && isActive ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : st === "waiting" ? (
                            <Clock className="w-3 h-3" />
                          ) : st === "blocked" ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : null}
                          <span>{shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Run-context band — drift-fix #2.5: now contains the 8 invariant
                  *current run* slots from the framework's runContextSchema, not
                  static record metadata. Default collapsed (drift-fix #2.4). */}
              <div className="border-t border-slate-200/60 dark:border-border/40">
                <button
                  onClick={() => setTestDetailsOpen(!testDetailsOpen)}
                  className="w-full flex items-center gap-2 px-5 py-1.5 hover:bg-slate-100/60 dark:hover:bg-muted/30 transition-colors"
                  data-testid="toggle-test-details"
                >
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${testDetailsOpen ? "" : "-rotate-90"}`} />
                  <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Run Context</span>
                </button>
                {testDetailsOpen && (
                  <div className="px-5 pb-3">
                    <div className="grid grid-cols-2 gap-x-16 gap-y-3">
                      {testDetails.map(([label, value]) => (
                        <div key={label} className="flex items-baseline gap-4">
                          <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase w-32 shrink-0 text-right">{label}</p>
                          <p className="text-xs text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step content — title row + StepNodeContent */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="w-[90%] mx-auto px-6 py-6 space-y-6">
                {isOutputsStep ? (
                  <EntityAuditReportContent entity={entity} />
                ) : activeStep ? (
                <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{activeStep.title}</h3>
                      <Badge
                        className={`text-[9px] ${
                          activeStepStatus === "complete"
                            ? "bg-[#266C92]/10 text-[#266C92]"
                            : activeStepStatus === "running"
                              ? "bg-[#266C92]/10 text-[#266C92]"
                              : activeStepStatus === "waiting"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                : activeStepStatus === "skipped"
                                  ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                  : activeStepStatus === "blocked"
                                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        } border-0`}
                      >
                        {activeStepStatus === "complete"
                          ? "Complete"
                          : activeStepStatus === "running"
                            ? "Running"
                            : activeStepStatus === "waiting"
                              ? "Awaiting Reviewer"
                              : activeStepStatus === "skipped"
                                ? "Skipped"
                                : activeStepStatus === "blocked"
                                  ? "Blocked"
                                  : "Pending"}
                      </Badge>
                      {/* Drift-fix #2.8 — automation-mode pill (canon-shared). */}
                      {(() => {
                        const mi = automationModeIcons[activeStepMode];
                        const MI = mi.icon;
                        return (
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-medium ${mi.color} opacity-80`}
                            title={mi.title}
                            data-testid="step-mode-pill"
                          >
                            <MI className="w-2.5 h-2.5" />
                            {automationModeLabels[activeStepMode].short}
                          </span>
                        );
                      })()}
                      {(() => {
                        const phase = auditAssessmentPhases.find((p) => p.id === activeStep.phaseId);
                        return phase ? (
                          <span className="inline-flex items-center text-[9px] font-medium text-muted-foreground">
                            Phase {phase.ordinal} · {phase.label}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Step {activeStepIdx + 1} of {auditAssessmentSteps.length}: {activeStep.description}
                    </p>
                  </div>
                </div>

                <div data-testid={`entity-step-block-${activeStep.id}`}>
                  <EntityStepNodeContent
                    step={activeStep}
                    stepStatus={activeStepStatus}
                    entityId={entity.id}
                    substepProgress={(() => {
                      // Effective-progress pinning. Both blocked + waiting are
                      // variants of the same inline-resolution pattern; we pin
                      // substepProgress to the substep whose UI surfaces the
                      // resolution card so the affordances render in the right
                      // place (not always idx 0). Mirrors canon's `effectiveProgress`.
                      const stored = substepProgress[activeStep.id] ?? 0;

                      // Variant A — declarative block rule targets a substep.
                      if (activeStepStatus === "blocked") {
                        const rule = auditAssessmentBlockRules.find(
                          (r) => r.entityId === entity.id && r.blockAtStep === activeStep.id
                        );
                        if (rule?.blockAtSubstep) {
                          const idx = activeStep.substeps.findIndex((s) => s.id === rule.blockAtSubstep);
                          if (idx >= 0) return Math.max(stored, idx);
                        }
                      }

                      // Variant B — HITL gate substep (Approve / Modify / Reject).
                      // When the step is awaiting reviewer disposition, pin to
                      // the gate substep so the amber checkpoint card surfaces.
                      if (activeStepStatus === "waiting") {
                        const gateIdx = activeStep.substeps.findIndex((s) => s.isHitlGate);
                        if (gateIdx >= 0) return Math.max(stored, gateIdx);
                      }

                      return stored;
                    })()}
                    automationConfig={automationConfig[activeStep.id]}
                    onResolveHitl={localResolveHitl}
                    onResolveBlocker={localResolveBlocker}
                    autoExpandedSubs={autoExpandedSubs}
                    manualTriggered={manualTriggered}
                    checkpointAcked={checkpointAcked}
                    onResumeSubstep={handleResumeSubstep}
                    onAckCheckpoint={handleAckCheckpoint}
                  />
                </div>

                {/* Live monitoring panel — only shown on the Monitoring step. Mirrors SOX "alive" feel. */}
                {activeStep.id === "monitoring" && (
                  <MonitoringLivePanel entity={entity} fired={!!status.fired} />
                )}

                {/* Final risk decision banner — SOX canon: only render on the LAST step (terminal view). */}
                {isComplete && outcome && isLastStep && (
                  <div
                    className={`p-4 rounded-xl border ${
                      outcome.tone === "unsatisfactory"
                        ? "border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10"
                        : outcome.tone === "re-audit"
                          ? "border-violet-200 dark:border-violet-800/30 bg-violet-50/50 dark:bg-violet-900/10"
                          : outcome.tone === "conditional"
                            ? "border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10"
                            : "border-[#266C92]/20 bg-[#266C92]/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {outcome.tone === "unsatisfactory" ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : outcome.tone === "re-audit" ? (
                        <Activity className="w-4 h-4 text-violet-500" />
                      ) : (
                        <ShieldCheck className={`w-4 h-4 ${outcome.tone === "conditional" ? "text-amber-600 dark:text-amber-400" : "text-[#266C92]"}`} />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          outcome.tone === "unsatisfactory"
                            ? "text-red-600 dark:text-red-400"
                            : outcome.tone === "re-audit"
                              ? "text-violet-700 dark:text-violet-300"
                              : outcome.tone === "conditional"
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-[#266C92]"
                        }`}
                      >
                        Risk Decision: {outcome.label}
                      </span>
                    </div>
                  </div>
                )}
                </>
                ) : null}
              </div>
            </div>

            {/* Footer — Prev / actions / Next, mirrors SOX */}
            <div className="shrink-0 px-6 py-3 border-t border-slate-200 dark:border-border bg-white dark:bg-card">
              <div className="w-[90%] max-w-6xl mx-auto flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setActiveStepIdx(Math.max(0, activeStepIdx - 1))}
                  disabled={activeStepIdx === 0}
                  data-testid="button-step-prev"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous Step
                </Button>

                <div className="flex items-center gap-2">
                  {/* SOX canon: HITL Approve / Modify / Reject is recorded inline under the gate substep,
                      NOT in the footer. The footer keeps Prev / Confirm / Next only. */}
                  {activeStep && activeStepStatus === "waiting" && stepHasHitlGate && (
                    <span className="text-[11px] text-amber-700 dark:text-amber-300 italic" data-testid="footer-waiting-note">
                      Awaiting reviewer disposition above ↑
                    </span>
                  )}

                  {/* Canon parity: terminal CTA only renders when ALL substeps in
                      the active step are done. Mirrors canon's `allSubsDone` gate
                      (AgentHubHome.tsx ≈ 5707). */}
                  {activeStep && activeStepStatus === "running" && !stepHasHitlGate && (() => {
                    const totalSubs = activeStep.substeps.length;
                    const currentProg = substepProgress[activeStep.id] ?? 0;
                    const allSubsDone = currentProg >= totalSubs;
                    if (!allSubsDone) return null;
                    return (
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                      onClick={() => {
                        if (isLastStep) {
                          // Terminal CTA produces an artifact and appends Outputs step.
                          onAdvanceStep(activeStep.id);
                          setOutputsGenerated(true);
                          setTimeout(() => setActiveStepIdx(auditAssessmentSteps.length), 50);
                          showToast("Audit Report generated");
                          mirrorToAssistant(
                            "Audit Report — Generated",
                            `${entity.entityName}: terminal artifact ready in the Outputs step.`,
                            activeStep.id,
                          );
                        } else {
                          onAdvanceStep(activeStep.id);
                          showToast(`Step confirmed — advancing`);
                        }
                      }}
                      data-testid={`button-confirm-${activeStep.id}`}
                    >
                      {isLastStep ? (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          Generate Audit Report
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm & Continue
                        </>
                      )}
                    </Button>
                    );
                  })()}

                  {activeStepStatus === "complete" && activeStepIdx < visibleStepOrder.length - 1 && (
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                      onClick={() => setActiveStepIdx(activeStepIdx + 1)}
                      data-testid="button-step-next"
                    >
                      Next Step
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right-side utility panel — drift-fix #2.10. Always present across all tabs. */}
      <EntityUtilityPanel entity={entity} status={status} activeStepId={activeStep?.id} />

      {/* Drift-fix #2.9 — Automation Config Modal access from empty state + future surfaces. */}
      <EntityAutomationConfigModal
        open={automationModalOpen}
        onOpenChange={setAutomationModalOpen}
        config={automationConfig}
        onSave={(c) => {
          setAutomationConfig(c);
          showToast("Automation policy saved");
        }}
      />

      {/* Drift-fix #2.14 — toast feedback portal. */}
      {actionToast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {actionToast}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Hub view — analog of SOX FieldworkComplexHub (header / stats / actions / pipeline / audit log)
// ─────────────────────────────────────────────────────────────────────────────

function AuditAssessmentHub({
  statuses,
  onEntityClick,
  onResolveHitl,
  fastForward,
}: {
  statuses: EntityRunStatus[];
  onEntityClick: (entityId: string) => void;
  onResolveHitl: (entityId: string, stepId: string, decision: "approve" | "modify" | "reject") => void;
  fastForward: () => void;
}) {
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const setCurrentSolution = useWorkflowSessionStore((s) => s.setCurrentSolution);
  // SOX canon: Actions Required is collapsed by default to keep the pipeline + tracker fully visible on first load.
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [auditLogExpanded, setAuditLogExpanded] = useState(false);
  // SOX canon: Open Exceptions stat card is clickable when count > 0 and opens an exceptions dialog.
  const [exceptionsModalOpen, setExceptionsModalOpen] = useState(false);

  // Full-pane scroll mode is engaged when ANY of the collapsible sections is expanded — that way
  // the tracker is "pushed down" by expansion rather than the pipeline shrinking inside a fixed viewport.
  const fullPaneScroll = actionsExpanded || auditLogExpanded;

  const totalEntities = statuses.length;
  const completedEntities = statuses.filter((v) =>
    auditAssessmentStepIds.every(
      (sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped" || (sid === "monitoring" && !v.fired)
    )
  ).length;
  const autoEntities = statuses.filter((v) => v.track === "continuous");
  const reviewEntities = statuses.filter((v) => v.track === "full-audit");
  const automatedPct = totalEntities > 0 ? Math.round((autoEntities.length / totalEntities) * 100) : 0;
  // For audit, "open exceptions" = open prior findings carried forward into the cycle.
  const exceptionsOpen = masterEntityList
    .filter((v) => statuses.some((s) => s.entityId === v.id))
    .reduce((acc, v) => acc + v.priorFindings.filter((f) => f.status === "open").length, 0);

  // Action items: entities with a step in waiting (HITL) or blocked state
  const blockedActions = statuses
    .map((v) => {
      const waitingStep = auditAssessmentSteps.find((s) => v.steps[s.id] === "waiting");
      const blockedStep = auditAssessmentSteps.find((s) => v.steps[s.id] === "blocked");
      if (!waitingStep && !blockedStep) return null;
      const step = waitingStep ?? blockedStep!;
      const entity = masterEntityList.find((m) => m.id === v.entityId)!;
      // Pull rich block-rule detail (title, description, severity) when this is a
      // declarative block. Falls back to generic copy for HITL waiting.
      const blockRule = blockedStep
        ? auditAssessmentBlockRules.find(
            (r) => r.entityId === v.entityId && r.blockAtStep === step.id
          )
        : undefined;
      return {
        entityId: v.entityId,
        entityName: v.entityName,
        riskTier: v.riskTier,
        track: v.track,
        stepId: step.id,
        stepLabel: step.title,
        kind: waitingStep ? ("waiting" as const) : ("blocked" as const),
        entity,
        blockRule,
      };
    })
    .filter(Boolean) as Array<{
      entityId: string;
      entityName: string;
      riskTier: string;
      track: string;
      stepId: string;
      stepLabel: string;
      kind: "waiting" | "blocked";
      entity: EntityRecord;
      blockRule?: AuditAssessmentBlockRule;
    }>;

  const isComplete = completedEntities === totalEntities && totalEntities > 0;

  // Audit log entries for the hub-level activity feed
  const activityFeed = useMemo(() => {
    const out: { id: string; ts: string; entityId: string; type: "info" | "success" | "warning" | "action-needed"; message: string }[] = [];
    let n = 0;
    statuses.forEach((s) => {
      auditAssessmentSteps.forEach((step) => {
        const st = s.steps[step.id];
        if (st === "complete" && step.ordinal <= 4) {
          out.push({
            id: `${s.entityId}-${step.id}-c`,
            ts: `T-${(60 - n).toString().padStart(2, "0")}m`,
            entityId: s.entityId,
            type: "success",
            message: `${s.entityName} — ${step.title} complete`,
          });
          n += 1;
        } else if (st === "waiting") {
          out.push({
            id: `${s.entityId}-${step.id}-w`,
            ts: `T-${(60 - n).toString().padStart(2, "0")}m`,
            entityId: s.entityId,
            type: "action-needed",
            message: `${s.entityName} — Awaiting reviewer for ${step.title}`,
          });
          n += 1;
        }
      });
    });
    return out.slice(0, 20);
  }, [statuses]);

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="audit-assessment-hub">
      <div className={`flex-1 min-h-0 bg-slate-50 dark:bg-background px-8 py-5 ${fullPaneScroll ? "overflow-y-auto" : "flex flex-col overflow-hidden"}`}>
        <div className={`w-[90%] max-w-[1600px] mx-auto flex flex-col gap-5 ${fullPaneScroll ? "" : "h-full"}`} data-testid="audit-tracker-view">
          {/* Header — mirror SOX FieldworkComplexHub header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#266C92]" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">{auditAssessmentArchetypeConfig.solutionLabel}</h2>
                <p className="text-xs text-muted-foreground">
                  {isComplete
                    ? "All entities processed"
                    : `Entity assessment pipeline — ${completedEntities}/${totalEntities} entities complete`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isComplete && (
                <Badge className="text-xs bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setCurrentSession(null);
                  setCurrentSolution("tprm");
                }}
                data-testid="button-back-to-audit"
              >
                Back to Audit
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px]"
                onClick={fastForward}
                data-testid="button-fast-forward"
              >
                <Play className="w-3 h-3 mr-1" />
                Fast-forward
              </Button>
            </div>
          </div>

          {/* Stats bar — 4 cards mirror SOX */}
          <div className="grid grid-cols-4 gap-3" data-testid="audit-stats-bar">
            <Card className="border border-slate-200 dark:border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3.5 h-3.5 text-[#266C92]" />
                  <span className="text-[11px] text-muted-foreground font-medium">Entities in Scope</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-foreground">{totalEntities}</span>
                  <span className="text-[10px] text-muted-foreground">{autoEntities.length} auto · {reviewEntities.length} review</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 dark:border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-3.5 h-3.5 text-[#266C92]" />
                  <span className="text-[11px] text-muted-foreground font-medium">Continuous Coverage</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-foreground">{automatedPct}%</span>
                  <span className="text-[10px] text-muted-foreground">{autoEntities.length} auto-track entities</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 dark:border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#266C92]" />
                  <span className="text-[11px] text-muted-foreground font-medium">Entities Closed</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-foreground">{completedEntities}</span>
                  <span className="text-[10px] text-muted-foreground">
                    of {totalEntities}
                    {totalEntities > 0 ? ` (${Math.round((completedEntities / totalEntities) * 100)}%)` : ""}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`border ${exceptionsOpen > 0 ? "border-red-200 dark:border-red-800/30 cursor-pointer hover:border-red-300 dark:hover:border-red-700/50 transition-colors" : "border-slate-200 dark:border-border"}`}
              onClick={() => exceptionsOpen > 0 && setExceptionsModalOpen(true)}
              data-testid="audit-exceptions-card"
              role={exceptionsOpen > 0 ? "button" : undefined}
              tabIndex={exceptionsOpen > 0 ? 0 : undefined}
              onKeyDown={(e) => {
                if (exceptionsOpen > 0 && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  setExceptionsModalOpen(true);
                }
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-3.5 h-3.5 ${exceptionsOpen > 0 ? "text-red-500" : "text-slate-400"}`} />
                  <span className="text-[11px] text-muted-foreground font-medium">Open Exceptions</span>
                  {exceptionsOpen > 0 && (
                    <ChevronRight className="w-3 h-3 text-red-500 ml-auto" />
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xl font-bold ${exceptionsOpen > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                    {exceptionsOpen}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{exceptionsOpen > 0 ? "click to review" : "none open"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Required panel — appears when waiting/blocked */}
          {blockedActions.length > 0 && (
            <Card className="border border-slate-200 dark:border-border" data-testid="audit-actions-card">
              <button
                onClick={() => setActionsExpanded(!actionsExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors"
                data-testid="button-toggle-actions"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-foreground">Actions Required</span>
                  <Badge className="text-[10px] h-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {blockedActions.length} pending
                  </Badge>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${actionsExpanded ? "" : "-rotate-90"}`} />
              </button>
              {actionsExpanded && (
                <CardContent className="px-4 pb-4 pt-0 space-y-2 border-t border-slate-100 dark:border-border">
                  {blockedActions.map((action) => (
                    <div
                      key={`${action.entityId}-${action.stepId}`}
                      className="p-3 rounded-lg border border-slate-200 dark:border-border bg-slate-50/40 dark:bg-muted/10 transition-colors"
                      data-testid={`action-item-${action.entityId}`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {action.kind === "blocked" ? (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        )}
                        <span className="text-[10px] font-mono font-semibold text-[#266C92]">{action.entityId}</span>
                        <span className="text-xs font-medium text-foreground">{action.entityName}</span>
                        {action.blockRule?.title && (
                          <span className="text-xs text-foreground/70">— {action.blockRule.title}</span>
                        )}
                        <Badge className={`text-[9px] h-4 ml-auto shrink-0 ${
                          action.kind === "blocked"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {action.kind === "blocked" ? "Blocked at " : "Awaiting reviewer · "}
                          {action.stepLabel}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                        {action.blockRule?.description
                          ?? (action.kind === "waiting"
                            ? `Reviewer disposition required for ${action.stepLabel.toLowerCase()}. Open the entity to record an Approve / Modify / Reject decision.`
                            : `${action.stepLabel} blocked — investigate the entity record.`)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-6 text-[10px] bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                          onClick={() => onEntityClick(action.entityId)}
                          data-testid={`button-open-entity-${action.entityId}`}
                        >
                          <ChevronRight className="w-3 h-3 mr-1" />
                          Open Entity to Resolve
                        </Button>
                        {action.kind === "waiting" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px]"
                            onClick={() => onResolveHitl(action.entityId, action.stepId, "approve")}
                            data-testid={`button-quick-approve-${action.entityId}`}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Quick Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Pipeline card — exact SOX grid pattern, grouped by track */}
          <div className={`flex flex-col gap-4 ${fullPaneScroll ? "" : "flex-1 min-h-0"}`}>
            <Card className={`border border-slate-200 dark:border-border flex flex-col ${fullPaneScroll ? "" : "flex-1 min-h-0"}`} data-testid="audit-pipeline-card">
              <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-[#266C92]" />
                  Entity Assessment Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className={`px-4 pb-4 ${fullPaneScroll ? "" : "flex-1 min-h-0 overflow-y-auto"}`}>
                {/* Header row — Entity | Source | 9 step columns | Result */}
                <div className="grid grid-cols-[3fr_5rem_repeat(9,1fr)_1fr] gap-2 px-2 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-slate-100 dark:border-border mb-1">
                  <span>Entity</span>
                  <span>Source</span>
                  {auditAssessmentSteps.map((s) => (
                    <span key={s.id} className="text-center" title={s.title}>
                      {s.shortLabel}
                    </span>
                  ))}
                  <span className="text-center">Result</span>
                </div>

                <div>
                  {/* Full Audit track — analog of SOX PBC group */}
                  {reviewEntities.length > 0 && (() => {
                    const reviewComplete = reviewEntities.filter((v) =>
                      auditAssessmentStepIds.every(
                        (sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped" || (sid === "monitoring" && !v.fired)
                      )
                    ).length;
                    return (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 px-2 py-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Full Audit Workflow ({reviewComplete}/{reviewEntities.length})
                          </span>
                        </div>
                        {reviewEntities.map((v) => {
                          const entity = masterEntityList.find((m) => m.id === v.entityId)!;
                          const outcome = getEntityOutcome(entity, v);
                          const isWarn =
                            Object.values(v.steps).some((s) => s === "blocked") ||
                            outcome?.tone === "unsatisfactory" ||
                            outcome?.tone === "re-audit";
                          return (
                            <div
                              key={v.entityId}
                              className={`grid grid-cols-[3fr_5rem_repeat(9,1fr)_1fr] gap-2 px-2 py-1.5 rounded items-center transition-all cursor-pointer border-l-2 border-l-transparent ${
                                isWarn
                                  ? "bg-red-50/30 dark:bg-red-900/5 hover:border-l-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/15"
                                  : "hover:border-l-[#266C92] hover:bg-[#266C92]/5 dark:hover:bg-[#266C92]/10"
                              }`}
                              onClick={() => onEntityClick(v.entityId)}
                              data-testid={`pipeline-row-${v.entityId}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`text-[10px] font-mono font-semibold ${isWarn ? "text-red-500" : "text-foreground"}`}>{v.entityId}</span>
                                <span className="text-xs text-foreground truncate">{v.entityName}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium truncate">
                                {v.riskTier === "High" ? "High" : v.riskTier === "Medium" ? "Medium" : "Low"}
                              </span>
                              {auditAssessmentSteps.map((step) => (
                                <div key={step.id} className="flex justify-center">
                                  {stepDot(v.steps[step.id])}
                                </div>
                              ))}
                              <div className="flex justify-center">
                                {outcome?.tone === "satisfactory" ? (
                                  <ShieldCheck className="w-3 h-3 text-[#266C92]" />
                                ) : outcome?.tone === "unsatisfactory" ? (
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                ) : outcome?.tone === "re-audit" ? (
                                  <Activity className="w-3 h-3 text-violet-500" />
                                ) : outcome?.tone === "conditional" ? (
                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Continuous track — analog of SOX Continuous group */}
                  {autoEntities.length > 0 && (() => {
                    const autoComplete = autoEntities.filter((v) =>
                      auditAssessmentStepIds.every(
                        (sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped"
                      )
                    ).length;
                    return (
                      <div>
                        <div className="flex items-center gap-2 px-2 py-1.5 border-t border-slate-100 dark:border-border">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Continuous ({autoComplete}/{autoEntities.length})
                          </span>
                        </div>
                        {autoEntities.map((v) => {
                          const entity = masterEntityList.find((m) => m.id === v.entityId)!;
                          const outcome = getEntityOutcome(entity, v);
                          return (
                            <div
                              key={v.entityId}
                              className="grid grid-cols-[3fr_5rem_repeat(9,1fr)_1fr] gap-2 px-2 py-1.5 rounded items-center transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-[#266C92] hover:bg-[#266C92]/5 dark:hover:bg-[#266C92]/10"
                              onClick={() => onEntityClick(v.entityId)}
                              data-testid={`pipeline-row-${v.entityId}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] font-mono font-semibold text-[#266C92]">{v.entityId}</span>
                                <span className="text-xs text-foreground truncate">{v.entityName}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium truncate inline-flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" />
                                Auto
                              </span>
                              {auditAssessmentSteps.map((step) => (
                                <div key={step.id} className="flex justify-center">
                                  {stepDot(v.steps[step.id])}
                                </div>
                              ))}
                              <div className="flex justify-center">
                                {outcome?.tone === "satisfactory" ? (
                                  <ShieldCheck className="w-3 h-3 text-[#266C92]" />
                                ) : outcome?.tone === "unsatisfactory" ? (
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                ) : outcome?.tone === "conditional" ? (
                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
              {/* Legend — exact SOX pattern */}
              <div className="flex items-center gap-3 text-[9px] text-muted-foreground px-4 py-2 border-t border-slate-100 dark:border-border shrink-0 flex-wrap">
                <div className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-[#266C92]" /><span>Complete</span></div>
                <div className="flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 text-[#266C92] animate-spin" /><span>Running</span></div>
                <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-amber-500" /><span>Awaiting Reviewer</span></div>
                <div className="flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5 text-red-500" /><span>Blocked</span></div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600" /><span>Pending</span></div>
                <div className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground">—</span><span>Skipped (auto-track)</span></div>
                <div className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5 text-[#266C92]" /><span>Approved</span></div>
                <div className="flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5 text-amber-500" /><span>Conditional</span></div>
                <div className="flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5 text-red-500" /><span>Rejected</span></div>
                <div className="flex items-center gap-1"><Activity className="w-2.5 h-2.5 text-violet-500" /><span>Re-Assess</span></div>
              </div>
            </Card>
          </div>

          {/* Audit Log — collapsible, mirror SOX */}
          <Card className="border border-slate-200 dark:border-border overflow-hidden shrink-0" data-testid="tprm-activity-card">
            <button
              onClick={() => setAuditLogExpanded(!auditLogExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-muted/5 transition-colors"
              data-testid="button-toggle-audit-log"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#266C92]" />
                <span className="text-sm font-semibold text-foreground">Optro Assistant: Audit Log</span>
                <Badge className="text-[9px] h-4 bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]">
                  {activityFeed.length} entries
                </Badge>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${auditLogExpanded ? "" : "-rotate-90"}`} />
            </button>
            {auditLogExpanded && (
              <div className="border-t border-slate-100 dark:border-border">
                <div className="px-4 py-3 bg-[#266C92]/5 dark:bg-[#266C92]/10 border-b border-slate-100 dark:border-border" data-testid="assistant-welcome-bubble">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#266C92] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-[#266C92] dark:text-[#4da3c9] mb-0.5">Optro Assistant</p>
                      <p className="text-[11px] text-foreground leading-relaxed">
                        {isComplete
                          ? `Assessment complete across all ${totalEntities} entities. ${exceptionsOpen} exception${exceptionsOpen !== 1 ? "s" : ""} open — review the findings below.`
                          : `Entity assessment is underway — ${completedEntities} of ${totalEntities} entities processed so far.${blockedActions.length > 0 ? ` ${blockedActions.length} action${blockedActions.length !== 1 ? "s" : ""} await your disposition.` : ""}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-border max-h-64 overflow-y-auto">
                  {activityFeed.length === 0 && (
                    <div className="px-4 py-3 text-xs text-muted-foreground italic">No activity yet — pipeline is initializing.</div>
                  )}
                  {activityFeed.map((entry) => (
                    <div
                      key={entry.id}
                      className={`px-4 py-2.5 border-l-2 ${
                        entry.type === "action-needed"
                          ? "border-l-amber-400"
                          : entry.type === "warning"
                            ? "border-l-red-400"
                            : entry.type === "success"
                              ? "border-l-[#266C92]"
                              : "border-l-slate-200 dark:border-l-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0 w-12">{entry.ts}</span>
                        <p className="text-[11px] text-foreground/90 leading-relaxed">{entry.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Next Steps when complete */}
          {isComplete && (
            <Card className="border border-[#266C92]/20 dark:border-[#266C92]/30 bg-[#266C92]/[0.03] dark:bg-[#266C92]/[0.05]" data-testid="tprm-next-steps-card">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-[#266C92]" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 py-1.5">
                    <FileText className="w-3 h-3 shrink-0 text-[#266C92]" />
                    <span className="text-xs text-foreground flex-1">Generate executive risk report</span>
                    <ArrowRight className="w-3 h-3 text-[#266C92]" />
                  </div>
                  <div className="flex items-center gap-2 py-1.5">
                    <AlertTriangle className="w-3 h-3 shrink-0 text-[#266C92]" />
                    <span className="text-xs text-foreground flex-1">Review {exceptionsOpen} open exceptions</span>
                    <ArrowRight className="w-3 h-3 text-[#266C92]" />
                  </div>
                  <div className="flex items-center gap-2 py-1.5">
                    <Activity className="w-3 h-3 shrink-0 text-[#266C92]" />
                    <span className="text-xs text-foreground flex-1">Configure continuous monitoring triggers</span>
                    <ArrowRight className="w-3 h-3 text-[#266C92]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Open Exceptions Dialog — opened from the clickable Open Exceptions stat card. Mirrors SOX exceptions modal. */}
      <Dialog open={exceptionsModalOpen} onOpenChange={setExceptionsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="dialog-tprm-exceptions">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Open Exceptions ({exceptionsOpen})
            </DialogTitle>
            <DialogDescription>
              Findings from completed assessments that require remediation.
              Owners and deadlines have been assigned per the routing engine.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {(() => {
              // Surface every open prior finding across in-scope entities. Each
              // finding becomes a row (not each entity) — finer-grained than TPRM's
              // per-vendor count.
              type Row = {
                entityId: string;
                entityName: string;
                ownerName: string;
                finding: { id: string; severity: "high" | "medium" | "low"; area: string; summary: string };
              };
              const rows: Row[] = masterEntityList
                .filter((v) => statuses.some((s) => s.entityId === v.id))
                .flatMap<Row>((v) =>
                  v.priorFindings
                    .filter((f) => f.status === "open")
                    .map<Row>((f) => ({
                      entityId: v.id,
                      entityName: v.entityName,
                      ownerName: v.ownerExec.name.split(" ").slice(0, 2).join(" "),
                      finding: f,
                    }))
                );
              if (rows.length === 0) {
                return (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No open findings</p>
                  </div>
                );
              }
              return (
                <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[8rem_1fr_5rem_6rem_6rem] gap-2 px-3 py-2 bg-slate-50 dark:bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-slate-200 dark:border-border">
                    <span>Entity</span>
                    <span>Finding</span>
                    <span className="text-center">Severity</span>
                    <span className="text-center">Area</span>
                    <span>Owner</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-border/50">
                    {rows.map((row) => (
                      <div
                        key={`${row.entityId}-${row.finding.id}`}
                        role="button"
                        tabIndex={0}
                        className="grid grid-cols-[8rem_1fr_5rem_6rem_6rem] gap-2 px-3 py-2.5 text-[11px] items-center hover:bg-slate-50/60 dark:hover:bg-muted/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#266C92]/40 focus:bg-slate-50 dark:focus:bg-muted/20"
                        onClick={() => {
                          setExceptionsModalOpen(false);
                          onEntityClick(row.entityId);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setExceptionsModalOpen(false);
                            onEntityClick(row.entityId);
                          }
                        }}
                        data-testid={`finding-row-${row.entityId}-${row.finding.id}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-[10px] font-semibold text-[#266C92]">{row.entityId}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground truncate font-medium">{row.entityName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            <span className="font-mono">{row.finding.id}</span> — {row.finding.summary}
                          </p>
                        </div>
                        <div className="text-center">
                          <Badge className={`text-[9px] h-4 ${
                            row.finding.severity === "high"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : row.finding.severity === "medium"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          } border-0 capitalize`}>
                            {row.finding.severity}
                          </Badge>
                        </div>
                        <span className="text-center text-foreground/80 truncate">{row.finding.area}</span>
                        <span className="text-foreground/80 truncate">{row.ownerName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Top-level AuditAssessmentSession (chooses Hub vs Focus, owns state + simulation)
// ─────────────────────────────────────────────────────────────────────────────

export default function AuditAssessmentSession() {
  const sessionId = AUDIT_ASSESSMENT_SESSION_ID;
  const { toast } = useToast();

  const [statuses, setStatuses] = usePersistedBlockState<EntityRunStatus[]>(
    sessionId,
    "pipeline",
    "statuses",
    masterEntityList.map((v) => ({
      entityId: v.id,
      entityName: v.entityName,
      riskTier: v.riskTier,
      track: v.track,
      steps: auditAssessmentStepIds.reduce(
        (acc, sid) => ({ ...acc, [sid]: "pending" as StepRunStatus }),
        {} as Record<string, StepRunStatus>
      ),
      overallProgress: 0,
      fired: v.id === "VEN-009",
    }))
  );

  const [phase, setPhase] = usePersistedBlockState<"initializing" | "running" | "complete">(
    sessionId,
    "pipeline",
    "phase",
    "running"
  );

  const [resolvedHitl, setResolvedHitl] = usePersistedBlockState<string[]>(
    sessionId,
    "pipeline",
    "resolvedHitl",
    []
  );

  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);

  const resolvedSet = useMemo(() => new Set(resolvedHitl), [resolvedHitl]);

  useEffect(() => {
    if (phase !== "running") return;
    const timer = setInterval(() => {
      setStatuses((prev: EntityRunStatus[]) => {
        const next = tickEntityStatuses(prev, resolvedSet);
        return next ?? prev;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [phase, resolvedSet]);

  const allDone = statuses.every((v) =>
    auditAssessmentStepIds.every(
      (sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped" || (sid === "monitoring" && !v.fired)
    )
  );

  useEffect(() => {
    if (allDone && phase === "running") {
      const t = setTimeout(() => setPhase("complete"), 800);
      return () => clearTimeout(t);
    }
  }, [allDone, phase]);

  const handleResolveHitl = useCallback(
    (entityId: string, stepId: string, decision: "approve" | "modify" | "reject") => {
      const key = `${entityId}:${stepId}`;
      if (decision === "reject") {
        // Mark step blocked rather than resuming the pipeline
        setStatuses((prev: EntityRunStatus[]) =>
          prev.map((v) =>
            v.entityId === entityId
              ? { ...v, steps: { ...v.steps, [stepId]: "blocked" as StepRunStatus } }
              : v
          )
        );
        // Toast feedback is rendered by the focus page's `actionToast` portal
        // (canon parity — no shadcn `useToast` call for focus-page actions).
        return;
      }

      // Approve and Modify both resume the pipeline; Modify also annotates the audit trail
      if (!resolvedSet.has(key)) {
        setResolvedHitl((prev: string[]) => [...prev, key]);
      }
    },
    [resolvedSet, setResolvedHitl, setStatuses]
  );

  // Universal block-resolution handler — surfaces any inline-affordance click
  // back into the simulator via the shared `resolvedHitl` set. The simulator
  // checks the same `resolvedSet` for both HITL waiting and blocked states, so
  // a single key resolves both. Mirrors SOX canon's `handleResolveAction`
  // (AgentHubHome.tsx ≈ 6080).
  const handleResolveBlocker = useCallback(
    (entityId: string, stepId: string, _substepId: string, _affordanceId: string) => {
      const key = `${entityId}:${stepId}`;
      if (!resolvedSet.has(key)) {
        setResolvedHitl((prev: string[]) => [...prev, key]);
      }
    },
    [resolvedSet, setResolvedHitl]
  );

  // Drift-fix #2.7 — empty-state "Run Assessment" CTA seeds a fresh status row
  // (or wakes an existing one) so the workflow tab transitions from cold-start
  // to active. Mirrors canon's `handleStartDemoWorkflow` in `FieldworkComplexHub`.
  const handleStartAssessment = useCallback(
    (entityId: string) => {
      const entity = masterEntityList.find((v) => v.id === entityId);
      if (!entity) return;
      setStatuses((prev: EntityRunStatus[]) => {
        const existing = prev.find((s) => s.entityId === entityId);
        if (existing) {
          // Wake the first non-complete step into "running".
          const nextSteps = { ...existing.steps };
          const firstPending = auditAssessmentStepIds.find((sid) => nextSteps[sid] === "pending");
          if (firstPending) nextSteps[firstPending] = "running";
          return prev.map((s) => (s.entityId === entityId ? { ...s, steps: nextSteps } : s));
        }
        const fresh = seedEntityRunStatus(entity);
        const firstStepId = auditAssessmentStepIds[0];
        fresh.steps[firstStepId] = "running";
        return [...prev, fresh];
      });
      // Focus-page actionToast already rendered "Assessment started — agent dispatching".
    },
    [setStatuses]
  );

  const handleAdvanceStep = useCallback(
    (stepId: string) => {
      if (!activeEntityId) return;
      setStatuses((prev: EntityRunStatus[]) =>
        prev.map((v) =>
          v.entityId === activeEntityId
            ? { ...v, steps: { ...v.steps, [stepId]: "complete" as StepRunStatus } }
            : v
        )
      );
      // Focus-page actionToast already rendered "Step confirmed — advancing".
    },
    [activeEntityId, setStatuses]
  );

  const fastForward = useCallback(() => {
    setStatuses((prev: EntityRunStatus[]) =>
      prev.map((v) => {
        const isAuto = v.track === "continuous";
        const nextSteps: Record<string, StepRunStatus> = {};
        auditAssessmentStepIds.forEach((sid) => {
          if (sid === "monitoring") {
            nextSteps[sid] = v.fired ? "complete" : "pending";
          } else if (isAuto && (sid === "full-audit" || sid === "exception")) {
            nextSteps[sid] = "skipped";
          } else {
            nextSteps[sid] = "complete";
          }
        });
        return { ...v, steps: nextSteps, overallProgress: 100 };
      })
    );
    // Canon parity — no shadcn toast on hub-level fast-forward.
  }, [setStatuses]);

  const activeEntity = activeEntityId
    ? masterEntityList.find((v) => v.id === activeEntityId)
    : null;
  const activeStatus = activeEntityId ? statuses.find((s) => s.entityId === activeEntityId) : undefined;

  if (activeEntity) {
    return (
      <EntityFocusPage
        entity={activeEntity}
        status={activeStatus}
        onBack={() => setActiveEntityId(null)}
        onStartAssessment={handleStartAssessment}
        onAdvanceStep={handleAdvanceStep}
        onResolveHitl={handleResolveHitl}
        onResolveBlocker={handleResolveBlocker}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-background" data-testid="tprm-session">
      <AuditAssessmentHub
        statuses={statuses}
        onEntityClick={(entityId) => setActiveEntityId(entityId)}
        onResolveHitl={handleResolveHitl}
        fastForward={fastForward}
      />
    </div>
  );
}
