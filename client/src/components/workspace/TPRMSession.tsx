import { useEffect, useMemo, useState, useCallback } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePersistedBlockState, useWorkflowSessionStore } from "@/lib/workflowSessionStore";
import {
  ACTION_TYPE_META,
  type StepRunStatus,
  type SubstepActionType,
} from "@/lib/workflowArchetype";
import {
  masterVendorList,
  tprmArchetypeConfig,
  tprmPhases,
  tprmSteps,
  tprmStepIds,
  tickVendorStatuses,
  type VendorRecord,
  type VendorRunStatus,
} from "@/lib/tprmData";
import { TPRM_SESSION_ID } from "@/lib/tprmLauncher";

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

const actionTypeColors: Record<SubstepActionType, { color: string; title: string }> = {
  ai: { color: "text-violet-500 dark:text-violet-400", title: "AI" },
  auto: { color: "text-sky-500 dark:text-sky-400", title: "Automated" },
  hitl: { color: "text-amber-500 dark:text-amber-400", title: "Human-in-the-loop" },
};

// Decide overall vendor outcome for "Effective"-equivalent badge in header / tracker
function getVendorOutcome(vendor: VendorRecord, status: VendorRunStatus | undefined): {
  label: string;
  tone: "approved" | "conditional" | "rejected" | "monitor" | "in-progress" | "pending";
} | null {
  if (!status) return null;
  const allDone = tprmStepIds.every(
    (s) => status.steps[s] === "complete" || status.steps[s] === "skipped" || (s === "monitoring" && !status.fired)
  );
  if (!allDone) {
    const anyRunning = tprmStepIds.some((s) => status.steps[s] === "running" || status.steps[s] === "waiting");
    return anyRunning ? { label: "In Progress", tone: "in-progress" } : { label: "Pending", tone: "pending" };
  }
  if (status.fired) return { label: "Re-Assess", tone: "monitor" };
  if (vendor.exceptionRecords.open > 0) return { label: "Conditional", tone: "conditional" };
  if (vendor.riskTreatment === "Avoid") return { label: "Rejected", tone: "rejected" };
  if (vendor.riskTreatment === "Mitigate") return { label: "Conditional", tone: "conditional" };
  return { label: "Approved", tone: "approved" };
}

function outcomeBadgeClasses(tone: NonNullable<ReturnType<typeof getVendorOutcome>>["tone"]) {
  switch (tone) {
    case "approved":
      return "bg-[#266C92]/10 text-[#266C92]";
    case "conditional":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "rejected":
      return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
    case "monitor":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";
    case "in-progress":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  }
}

function tierBadgeClasses(tier: string) {
  if (tier === "Tier 3") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (tier === "Tier 2") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
}

// Vendor "test details" — direct analog of SOX getTestDetailInfo / Test Details strip
function getVendorTestDetails(vendor: VendorRecord) {
  return [
    ["Vendor Owner", vendor.primaryContact.name],
    ["Risk Tier", vendor.riskTier],
    ["Track", vendor.track === "automated" ? "Automated" : "Human-Review"],
    ["Data Access", vendor.dataAccess],
    ["Criticality", vendor.criticality],
    ["Risk Score", `${vendor.riskScore}/100`],
    ["Annual Spend", vendor.annualContractValue],
    ["Next Assessment", vendor.nextAssessmentDue],
  ] as [string, string][];
}

// ─────────────────────────────────────────────────────────────────────────────
// Vendor Overview Tab — analog of ControlDetailsTab (collapsible sections)
// ─────────────────────────────────────────────────────────────────────────────

function VendorOverviewTab({ vendor }: { vendor: VendorRecord }) {
  const [identityOpen, setIdentityOpen] = useState(true);
  const [classificationOpen, setClassificationOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);
  const [dataOpen, setDataOpen] = useState(true);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="w-[90%] mx-auto px-6 py-6 space-y-0">
        {/* Vendor Identity */}
        <div>
          <button
            onClick={() => setIdentityOpen(!identityOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-vendor-identity"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${identityOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Vendor Information</span>
          </button>
          {identityOpen && (
            <div className="flex gap-12 pb-6">
              <div className="flex-1 space-y-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Description</p>
                  <p className="text-xs text-foreground">
                    <span className="text-[#266C92] font-medium">{vendor.id}</span> {vendor.vendorName}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    {vendor.legalEntity} · {vendor.vendorType} vendor providing {vendor.spendCategory.toLowerCase()} services to the organization. Primary contact: {vendor.primaryContact.name} ({vendor.primaryContact.email}).
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Spend Category</p>
                  <p className="text-xs text-foreground mt-0.5">{vendor.spendCategory}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Notes</p>
                  <p className="text-xs text-foreground/90 leading-relaxed mt-0.5">{vendor.notes || "—"}</p>
                </div>
              </div>
              <div className="w-52 shrink-0 space-y-3.5">
                {([
                  ["Vendor ID", vendor.id],
                  ["Legal Entity", vendor.legalEntity],
                  ["Vendor Type", vendor.vendorType],
                  ["Primary Contact", vendor.primaryContact.name],
                  ["Contact Email", vendor.primaryContact.email],
                  ["Annual Contract Value", vendor.annualContractValue],
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

        {/* Classification */}
        <div>
          <button
            onClick={() => setClassificationOpen(!classificationOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-vendor-classification"
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
                      vendor.riskTier === "Tier 3"
                        ? "text-red-600 dark:text-red-400"
                        : vendor.riskTier === "Tier 2"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground"
                    }`}
                  >
                    {vendor.riskTier}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Regulatory Exposure</p>
                  <ul className="mt-1 space-y-0.5 ml-4">
                    {vendor.regulatoryExposure.length === 0 ? (
                      <li className="text-xs text-muted-foreground">None</li>
                    ) : (
                      vendor.regulatoryExposure.map((r) => (
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
                  ["Data Access Scope", vendor.dataAccess],
                  ["System Criticality", vendor.criticality],
                  ["Track", vendor.track === "automated" ? "Automated" : "Human-Review"],
                  ["Risk Score", `${vendor.riskScore}/100`],
                  ["Risk Treatment", vendor.riskTreatment],
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

        {/* Assessment Status */}
        <div>
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-vendor-status"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${statusOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Assessment Status</span>
          </button>
          {statusOpen && (
            <div className="flex gap-12 pb-6">
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Status</p>
                  <p className="text-xs text-foreground mt-0.5">{vendor.assessmentStatus}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Assessment History</p>
                  <p className="text-xs text-foreground mt-0.5">
                    Last assessment: <span className="font-medium">{vendor.lastAssessmentDate}</span>
                  </p>
                  <p className="text-xs text-foreground mt-0.5">
                    Next due: <span className="font-medium">{vendor.nextAssessmentDue}</span>
                  </p>
                </div>
                {vendor.exceptionRecords.open + vendor.exceptionRecords.closed > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Exception Records</p>
                    <p className="text-xs text-foreground mt-0.5">
                      <span className={vendor.exceptionRecords.open > 0 ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                        {vendor.exceptionRecords.open} open
                      </span>{" "}
                      · {vendor.exceptionRecords.closed} closed
                    </p>
                  </div>
                )}
              </div>
              <div className="w-52 shrink-0 space-y-3.5">
                {([
                  ["Assessment Status", vendor.assessmentStatus],
                  ["Last Assessment", vendor.lastAssessmentDate],
                  ["Next Due", vendor.nextAssessmentDue],
                  ["Open Exceptions", String(vendor.exceptionRecords.open)],
                  ["Closed Exceptions", String(vendor.exceptionRecords.closed)],
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

        {/* Connected Data */}
        <div>
          <button
            onClick={() => setDataOpen(!dataOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-vendor-data"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dataOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Documents & Connected Data</span>
          </button>
          {dataOpen && (
            <div className="pb-6 space-y-3">
              <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-border bg-slate-50/80 dark:bg-muted/20">
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-44">Document Type</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-32">Date</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-32">Expiry</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.documents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-muted-foreground italic">No documents on file</td>
                      </tr>
                    )}
                    {vendor.documents.map((doc, i) => (
                      <tr key={i} className="border-b last:border-b-0 border-slate-100 dark:border-border/50">
                        <td className="px-4 py-3 text-foreground font-medium align-top">{doc.type}</td>
                        <td className="px-4 py-3 text-foreground align-top">{doc.date}</td>
                        <td className="px-4 py-3 text-foreground align-top">{doc.expiry || "—"}</td>
                        <td className="px-4 py-3 align-top">
                          <Badge
                            className={`text-[10px] h-4 ${
                              doc.status === "current"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : doc.status === "expired"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            } border-0`}
                          >
                            {doc.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-1">Outside-In Intel Sources</p>
                <p className="text-xs text-foreground">{vendor.intelSources.join(", ") || "None configured"}</p>
              </div>

              {vendor.outstandingRequests.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-1">Outstanding Requests</p>
                  <ul className="space-y-1">
                    {vendor.outstandingRequests.map((r, i) => (
                      <li key={i} className="text-xs text-foreground flex items-center gap-2">
                        <span className="font-medium">{r.type}</span>
                        <span className="text-muted-foreground">— due {r.due}</span>
                        <Badge
                          className={`text-[9px] h-4 ${
                            r.status === "overdue"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : r.status === "submitted"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          } border-0`}
                        >
                          {r.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vendor StepNodeContent — analog of SOX StepNodeContent (substep rows)
// ─────────────────────────────────────────────────────────────────────────────

interface VendorStepNodeContentProps {
  step: typeof tprmSteps[number];
  stepStatus: StepRunStatus;
}

function SubstepOutput({ output }: { output: NonNullable<typeof tprmSteps[number]["substeps"][number]["output"]> }) {
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
        <p className="text-[11px] text-foreground/80 leading-relaxed">{output.body}</p>
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

function VendorStepNodeContent({ step, stepStatus }: VendorStepNodeContentProps) {
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(() => new Set());

  // Mirror SOX semantics: when step is complete, all substeps complete; when running, first substep running, rest pending; when waiting, the HITL substep is waiting.
  const subStatusFor = (idx: number): "complete" | "running" | "waiting" | "blocked" | "pending" => {
    if (stepStatus === "complete") return "complete";
    if (stepStatus === "blocked") return idx === 0 ? "blocked" : "pending";
    const isHitlIdx = step.substeps.findIndex((s) => s.isHitlGate);
    if (stepStatus === "waiting") {
      if (idx < (isHitlIdx === -1 ? step.substeps.length - 1 : isHitlIdx)) return "complete";
      if (idx === (isHitlIdx === -1 ? step.substeps.length - 1 : isHitlIdx)) return "waiting";
      return "pending";
    }
    if (stepStatus === "running") {
      if (idx === 0) return "running";
      return "pending";
    }
    return "pending";
  };

  const toggleSub = (id: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSubsDone = stepStatus === "complete";

  return (
    <div className="space-y-2" data-testid={`step-node-${step.id}`}>
      {step.substeps.map((sub, idx) => {
        const baseStatus = subStatusFor(idx);
        const hasOutput = !!sub.output;
        const isExpandable = baseStatus === "complete" && hasOutput;
        const isExpanded = expandedSubs.has(sub.id);
        const modeInfo = actionTypeColors[sub.actionType];

        return (
          <div key={sub.id} className="transition-colors" data-testid={`substep-${sub.id}`}>
            <button
              onClick={() => isExpandable && toggleSub(sub.id)}
              disabled={!isExpandable}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                baseStatus === "running"
                  ? "bg-[#266C92]/[0.04]"
                  : baseStatus === "waiting"
                    ? "bg-amber-50/40 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30"
                    : baseStatus === "blocked"
                      ? "bg-red-50/30 dark:bg-red-900/5"
                      : isExpandable
                        ? "hover:bg-slate-50/80 dark:hover:bg-muted/10 cursor-pointer"
                        : "cursor-default"
              } ${baseStatus === "pending" ? "opacity-50" : ""}`}
              data-testid={`substep-toggle-${sub.id}`}
            >
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-muted-foreground font-mono w-6 text-right">
                  {step.ordinal}.{idx + 1}
                </span>
                <SubStepIndicator status={baseStatus} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      baseStatus === "complete" || baseStatus === "running"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {sub.description}
                  </span>
                  <ActionTypeBadge actionType={sub.actionType} />
                  {sub.isHitlGate && (
                    <span className={`inline-flex items-center text-[9px] font-medium ${modeInfo.color} opacity-80`} title="HITL gate">
                      Gate
                    </span>
                  )}
                </div>
                {sub.detail && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{sub.detail}</p>
                )}
              </div>
              {isExpandable && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {isExpanded && hasOutput && sub.output && (
              <div className="pl-12 pr-3 pb-3 pt-1">
                <SubstepOutput output={sub.output} />
              </div>
            )}
          </div>
        );
      })}

      {stepStatus === "complete" && (
        <div className="p-2.5 rounded-lg bg-[#266C92]/5 border border-[#266C92]/15">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#266C92]" />
            <p className="text-xs text-[#266C92] font-medium">Step completed — outcome: {step.outcome}</p>
          </div>
        </div>
      )}

      {stepStatus === "waiting" && (
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Waiting for human-in-the-loop reviewer disposition. Use the action buttons below to record a decision.
            </p>
          </div>
        </div>
      )}

      {stepStatus === "running" && !allSubsDone && (
        <div className="p-2.5 rounded-lg bg-[#266C92]/5 border border-[#266C92]/15">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 text-[#266C92] animate-spin" />
            <p className="text-xs text-[#266C92] font-medium">Agent processing — substep 1 of {step.substeps.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vendor Audit Trail — chronological substep history
// ─────────────────────────────────────────────────────────────────────────────

function VendorAuditTrailTab({ status }: { status: VendorRunStatus | undefined }) {
  const events = useMemo(() => {
    if (!status) return [];
    const out: { ts: string; actor: string; action: string; type: SubstepActionType }[] = [];
    let n = 0;
    tprmSteps.forEach((step) => {
      const st = status.steps[step.id];
      if (st === "complete") {
        step.substeps.forEach((ss) => {
          out.push({
            ts: `T-${(60 - n).toString().padStart(2, "0")}m`,
            actor: ss.actionType === "hitl" ? "Reviewer" : "TPRM Agent",
            action: ss.description,
            type: ss.actionType,
          });
          n += 2;
        });
      } else if (st === "skipped") {
        out.push({
          ts: `T-${(60 - n).toString().padStart(2, "0")}m`,
          actor: "Routing Engine",
          action: `Skipped ${step.title} (Tier 1 auto-track)`,
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
// Vendor Focus Page — analog of SOX ControlFocusPage (header / tabs / stepper / step content / footer)
// ─────────────────────────────────────────────────────────────────────────────

type VendorFocusTab = "overview" | "assessment" | "audit";

function VendorFocusPage({
  vendor,
  status,
  onBack,
  onAdvanceStep,
  onResolveHitl,
}: {
  vendor: VendorRecord;
  status: VendorRunStatus | undefined;
  onBack: () => void;
  onAdvanceStep: (stepId: string) => void;
  onResolveHitl: (vendorId: string, stepId: string, decision: "approve" | "modify" | "reject") => void;
}) {
  const [activeTab, setActiveTab] = useState<VendorFocusTab>("assessment");
  const [testDetailsOpen, setTestDetailsOpen] = useState(true);

  // Compute first-non-complete step (active step) — analog of SOX activeStepIdx
  const firstActiveIdx = useMemo(() => {
    if (!status) return 0;
    const idx = tprmStepIds.findIndex((s) => {
      const st = status.steps[s];
      return st !== "complete" && st !== "skipped";
    });
    return idx === -1 ? tprmStepIds.length - 1 : idx;
  }, [status]);

  const [activeStepIdx, setActiveStepIdx] = useState(firstActiveIdx);
  useEffect(() => {
    setActiveStepIdx(firstActiveIdx);
  }, [vendor.id, firstActiveIdx]);

  const activeStep = tprmSteps[activeStepIdx];
  const activeStepStatus: StepRunStatus = status
    ? status.steps[activeStep.id] ?? "pending"
    : "pending";

  const outcome = getVendorOutcome(vendor, status);
  const isComplete = outcome?.tone === "approved" || outcome?.tone === "conditional" || outcome?.tone === "rejected" || outcome?.tone === "monitor";
  const testDetails = getVendorTestDetails(vendor);

  const canNavigateTo = (idx: number): boolean => {
    if (!status) return idx === 0;
    const step = tprmSteps[idx];
    const st = status.steps[step.id];
    if (st === "complete" || st === "skipped" || st === "running" || st === "waiting" || st === "blocked") return true;
    const prev = idx > 0 ? tprmSteps[idx - 1] : null;
    if (prev) {
      const ps = status.steps[prev.id];
      if (ps === "complete" || ps === "skipped") return true;
    }
    return idx === 0;
  };

  const isLastStep = activeStepIdx === tprmSteps.length - 1;
  const stepHasHitlGate = activeStep.substeps.some((s) => s.isHitlGate);

  return (
    <div className="relative flex h-full overflow-hidden bg-white dark:bg-background" data-testid={`vendor-focus-${vendor.id}`}>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar — exact SOX pattern */}
        <div className="shrink-0 h-12 px-4 flex items-center gap-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-vendor-focus-back"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Pipeline</span>
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-border" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#266C92]" />
            <h2 className="text-sm font-semibold text-foreground">{vendor.id}</h2>
            <span className="text-sm text-muted-foreground">—</span>
            <span className="text-sm text-foreground">{vendor.vendorName}</span>
            <Badge className={`text-[10px] h-5 ${tierBadgeClasses(vendor.riskTier)} border-0 ml-2`}>
              {vendor.riskTier}
            </Badge>
          </div>
          {outcome && (
            <Badge className={`ml-auto text-[10px] ${outcomeBadgeClasses(outcome.tone)} border-0`}>
              {outcome.label}
            </Badge>
          )}
        </div>

        {/* Tab bar — exact SOX pattern */}
        <div className="shrink-0 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
          <div className="px-6 flex items-center gap-6">
            {(["overview", "assessment", "audit"] as VendorFocusTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-[#266C92] text-[#266C92]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-vendor-${tab}`}
              >
                {tab === "audit" ? "Audit Trail" : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && <VendorOverviewTab vendor={vendor} />}
        {activeTab === "audit" && <VendorAuditTrailTab status={status} />}

        {activeTab === "assessment" && status && (
          <>
            {/* Horizontal stepper — exact SOX pattern (progress line + pills) */}
            <div className="shrink-0 border-b border-slate-200 dark:border-border bg-slate-50/80 dark:bg-muted/20">
              <div className="px-5 py-2 flex items-center gap-3">
                <div className="relative flex items-center h-8 flex-1 min-w-0">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                  {(() => {
                    const completedCount = tprmStepIds.filter(
                      (s) => status.steps[s] === "complete" || status.steps[s] === "skipped"
                    ).length;
                    const total = tprmSteps.length;
                    const pct = total > 1 ? (completedCount / (total - 1)) * 100 : 0;
                    return (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#266C92] transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    );
                  })()}
                  <div className="relative flex items-center justify-between w-full">
                    {tprmSteps.map((step, idx) => {
                      const st = status.steps[step.id];
                      const isActive = idx === activeStepIdx;
                      const navigable = canNavigateTo(idx);
                      return (
                        <button
                          key={step.id}
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
                          data-testid={`stepper-step-${step.id}`}
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
                          <span>{step.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Test Details collapsible — exact SOX pattern */}
              <div className="border-t border-slate-200/60 dark:border-border/40">
                <button
                  onClick={() => setTestDetailsOpen(!testDetailsOpen)}
                  className="w-full flex items-center gap-2 px-5 py-1.5 hover:bg-slate-100/60 dark:hover:bg-muted/30 transition-colors"
                  data-testid="toggle-test-details"
                >
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${testDetailsOpen ? "" : "-rotate-90"}`} />
                  <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Vendor Details</span>
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
                      {(() => {
                        const phase = tprmPhases.find((p) => p.id === activeStep.phaseId);
                        return phase ? (
                          <span className="inline-flex items-center text-[9px] font-medium text-muted-foreground">
                            Phase {phase.ordinal} · {phase.label}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Step {activeStepIdx + 1} of {tprmSteps.length}: {activeStep.description}
                    </p>
                  </div>
                </div>

                <div data-testid={`vendor-step-block-${activeStep.id}`}>
                  <VendorStepNodeContent step={activeStep} stepStatus={activeStepStatus} />
                </div>

                {/* Agent role / outcome footer info */}
                <div className="rounded-lg border border-slate-200 dark:border-border bg-slate-50/40 dark:bg-muted/10 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-3.5 h-3.5 text-[#266C92]" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Agent Role</span>
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-relaxed">{activeStep.agentRole}</p>
                </div>

                {/* Monitoring trigger — only on monitoring step for fired vendor */}
                {activeStep.id === "monitoring" && status.fired && vendor.monitoring.length > 0 && (
                  <div className="rounded-lg border border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-3" data-testid="monitoring-events">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-foreground">Monitoring trigger events</span>
                    </div>
                    <ul className="space-y-1.5">
                      {vendor.monitoring.map((m) => (
                        <li key={m.id} className="text-[11px] text-foreground/90">
                          <span className="text-muted-foreground">[{m.timestamp}] {m.source}:</span> {m.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Final outcome banner */}
                {isComplete && outcome && (
                  <div
                    className={`p-4 rounded-xl border ${
                      outcome.tone === "rejected"
                        ? "border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10"
                        : outcome.tone === "monitor"
                          ? "border-violet-200 dark:border-violet-800/30 bg-violet-50/50 dark:bg-violet-900/10"
                          : outcome.tone === "conditional"
                            ? "border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10"
                            : "border-[#266C92]/20 bg-[#266C92]/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {outcome.tone === "rejected" ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : outcome.tone === "monitor" ? (
                        <Activity className="w-4 h-4 text-violet-500" />
                      ) : (
                        <ShieldCheck className={`w-4 h-4 ${outcome.tone === "conditional" ? "text-amber-600 dark:text-amber-400" : "text-[#266C92]"}`} />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          outcome.tone === "rejected"
                            ? "text-red-600 dark:text-red-400"
                            : outcome.tone === "monitor"
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
                  {activeStepStatus === "waiting" && stepHasHitlGate && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5 text-red-600 hover:text-red-700 border-red-200"
                        onClick={() => onResolveHitl(vendor.id, activeStep.id, "reject")}
                        data-testid={`hitl-reject-${activeStep.id}`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => onResolveHitl(vendor.id, activeStep.id, "modify")}
                        data-testid={`hitl-modify-${activeStep.id}`}
                      >
                        Modify
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                        onClick={() => onResolveHitl(vendor.id, activeStep.id, "approve")}
                        data-testid={`hitl-approve-${activeStep.id}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve & Continue
                      </Button>
                    </>
                  )}

                  {activeStepStatus === "running" && !stepHasHitlGate && (
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                      onClick={() => onAdvanceStep(activeStep.id)}
                      data-testid={`button-confirm-${activeStep.id}`}
                    >
                      {isLastStep ? (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          Generate Assessment Report
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm & Continue
                        </>
                      )}
                    </Button>
                  )}

                  {activeStepStatus === "complete" && activeStepIdx < tprmSteps.length - 1 && (
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TPRM Hub view — analog of SOX FieldworkComplexHub (header / stats / actions / pipeline / audit log)
// ─────────────────────────────────────────────────────────────────────────────

function TPRMHub({
  statuses,
  onVendorClick,
  onResolveHitl,
  fastForward,
}: {
  statuses: VendorRunStatus[];
  onVendorClick: (vendorId: string) => void;
  onResolveHitl: (vendorId: string, stepId: string, decision: "approve" | "modify" | "reject") => void;
  fastForward: () => void;
}) {
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const setCurrentSolution = useWorkflowSessionStore((s) => s.setCurrentSolution);
  const [actionsExpanded, setActionsExpanded] = useState(true);
  const [auditLogExpanded, setAuditLogExpanded] = useState(false);

  const totalVendors = statuses.length;
  const completedVendors = statuses.filter((v) =>
    tprmStepIds.every(
      (sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped" || (sid === "monitoring" && !v.fired)
    )
  ).length;
  const autoVendors = statuses.filter((v) => v.track === "automated");
  const reviewVendors = statuses.filter((v) => v.track === "human-review");
  const automatedPct = totalVendors > 0 ? Math.round((autoVendors.length / totalVendors) * 100) : 0;
  const exceptionsOpen = masterVendorList
    .filter((v) => statuses.some((s) => s.vendorId === v.id))
    .reduce((acc, v) => acc + v.exceptionRecords.open, 0);

  // Action items: vendors with a step in waiting (HITL) or blocked state
  const blockedActions = statuses
    .map((v) => {
      const waitingStep = tprmSteps.find((s) => v.steps[s.id] === "waiting");
      const blockedStep = tprmSteps.find((s) => v.steps[s.id] === "blocked");
      if (!waitingStep && !blockedStep) return null;
      const step = waitingStep ?? blockedStep!;
      const vendor = masterVendorList.find((m) => m.id === v.vendorId)!;
      return {
        vendorId: v.vendorId,
        vendorName: v.vendorName,
        riskTier: v.riskTier,
        track: v.track,
        stepId: step.id,
        stepLabel: step.title,
        kind: waitingStep ? ("waiting" as const) : ("blocked" as const),
        vendor,
      };
    })
    .filter(Boolean) as Array<{
      vendorId: string;
      vendorName: string;
      riskTier: string;
      track: string;
      stepId: string;
      stepLabel: string;
      kind: "waiting" | "blocked";
      vendor: VendorRecord;
    }>;

  const isComplete = completedVendors === totalVendors && totalVendors > 0;

  // Audit log entries for the hub-level activity feed
  const activityFeed = useMemo(() => {
    const out: { id: string; ts: string; vendorId: string; type: "info" | "success" | "warning" | "action-needed"; message: string }[] = [];
    let n = 0;
    statuses.forEach((s) => {
      tprmSteps.forEach((step) => {
        const st = s.steps[step.id];
        if (st === "complete" && step.ordinal <= 4) {
          out.push({
            id: `${s.vendorId}-${step.id}-c`,
            ts: `T-${(60 - n).toString().padStart(2, "0")}m`,
            vendorId: s.vendorId,
            type: "success",
            message: `${s.vendorName} — ${step.title} complete`,
          });
          n += 1;
        } else if (st === "waiting") {
          out.push({
            id: `${s.vendorId}-${step.id}-w`,
            ts: `T-${(60 - n).toString().padStart(2, "0")}m`,
            vendorId: s.vendorId,
            type: "action-needed",
            message: `${s.vendorName} — Awaiting reviewer for ${step.title}`,
          });
          n += 1;
        }
      });
    });
    return out.slice(0, 20);
  }, [statuses]);

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="tprm-hub">
      <div className={`flex-1 min-h-0 bg-slate-50 dark:bg-background px-8 py-5 ${!auditLogExpanded ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}>
        <div className={`w-[90%] max-w-[1600px] mx-auto flex flex-col gap-5 ${!auditLogExpanded ? "h-full" : ""}`} data-testid="tprm-tracker-view">
          {/* Header — mirror SOX FieldworkComplexHub header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#266C92]" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">{tprmArchetypeConfig.solutionLabel}</h2>
                <p className="text-xs text-muted-foreground">
                  {isComplete
                    ? "All vendors processed"
                    : `Vendor assessment pipeline — ${completedVendors}/${totalVendors} vendors complete`}
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
                data-testid="button-back-to-tprm"
              >
                Back to TPRM
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
          <div className="grid grid-cols-4 gap-3" data-testid="tprm-stats-bar">
            <Card className="border border-slate-200 dark:border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3.5 h-3.5 text-[#266C92]" />
                  <span className="text-[11px] text-muted-foreground font-medium">Vendors in Scope</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-foreground">{totalVendors}</span>
                  <span className="text-[10px] text-muted-foreground">{autoVendors.length} auto · {reviewVendors.length} review</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 dark:border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-3.5 h-3.5 text-[#266C92]" />
                  <span className="text-[11px] text-muted-foreground font-medium">Automated Coverage</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-foreground">{automatedPct}%</span>
                  <span className="text-[10px] text-muted-foreground">{autoVendors.length} auto-track vendors</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 dark:border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#266C92]" />
                  <span className="text-[11px] text-muted-foreground font-medium">Vendors Closed</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-foreground">{completedVendors}</span>
                  <span className="text-[10px] text-muted-foreground">
                    of {totalVendors}
                    {totalVendors > 0 ? ` (${Math.round((completedVendors / totalVendors) * 100)}%)` : ""}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`border ${exceptionsOpen > 0 ? "border-red-200 dark:border-red-800/30" : "border-slate-200 dark:border-border"}`}
              data-testid="tprm-exceptions-card"
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-3.5 h-3.5 ${exceptionsOpen > 0 ? "text-red-500" : "text-slate-400"}`} />
                  <span className="text-[11px] text-muted-foreground font-medium">Open Exceptions</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xl font-bold ${exceptionsOpen > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                    {exceptionsOpen}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{exceptionsOpen > 0 ? "from assessments" : "none open"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Required panel — appears when waiting/blocked */}
          {blockedActions.length > 0 && (
            <Card className="border border-slate-200 dark:border-border" data-testid="tprm-actions-card">
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
                      key={`${action.vendorId}-${action.stepId}`}
                      className="p-3 rounded-lg border border-slate-200 dark:border-border bg-slate-50/40 dark:bg-muted/10 transition-colors"
                      data-testid={`action-item-${action.vendorId}`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {action.kind === "blocked" ? (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        )}
                        <span className="text-[10px] font-mono font-semibold text-[#266C92]">{action.vendorId}</span>
                        <span className="text-xs font-medium text-foreground">{action.vendorName}</span>
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
                        {action.kind === "waiting"
                          ? `Reviewer disposition required for ${action.stepLabel.toLowerCase()}. Open the vendor to record an Approve / Modify / Reject decision.`
                          : `${action.stepLabel} blocked — investigate the vendor record.`}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-6 text-[10px] bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                          onClick={() => onVendorClick(action.vendorId)}
                          data-testid={`button-open-vendor-${action.vendorId}`}
                        >
                          <ChevronRight className="w-3 h-3 mr-1" />
                          Open Vendor
                        </Button>
                        {action.kind === "waiting" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px]"
                            onClick={() => onResolveHitl(action.vendorId, action.stepId, "approve")}
                            data-testid={`button-quick-approve-${action.vendorId}`}
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
          <div className={`flex flex-col gap-4 ${!auditLogExpanded ? "flex-1 min-h-0" : ""}`}>
            <Card className={`border border-slate-200 dark:border-border flex flex-col ${!auditLogExpanded ? "flex-1 min-h-0" : ""}`} data-testid="tprm-pipeline-card">
              <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-[#266C92]" />
                  Vendor Assessment Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className={`px-4 pb-4 ${!auditLogExpanded ? "flex-1 min-h-0 overflow-y-auto" : ""}`}>
                {/* Header row — Vendor | Source | 9 step columns | Result */}
                <div className="grid grid-cols-[3fr_5rem_repeat(9,1fr)_1fr] gap-2 px-2 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-slate-100 dark:border-border mb-1">
                  <span>Vendor</span>
                  <span>Source</span>
                  {tprmSteps.map((s) => (
                    <span key={s.id} className="text-center" title={s.title}>
                      {s.shortLabel}
                    </span>
                  ))}
                  <span className="text-center">Result</span>
                </div>

                <div>
                  {/* Human-Review track — analog of SOX PBC group */}
                  {reviewVendors.length > 0 && (() => {
                    const reviewComplete = reviewVendors.filter((v) =>
                      tprmStepIds.every(
                        (sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped" || (sid === "monitoring" && !v.fired)
                      )
                    ).length;
                    return (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 px-2 py-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Human-Review Workflow ({reviewComplete}/{reviewVendors.length})
                          </span>
                        </div>
                        {reviewVendors.map((v) => {
                          const vendor = masterVendorList.find((m) => m.id === v.vendorId)!;
                          const outcome = getVendorOutcome(vendor, v);
                          const isWarn =
                            Object.values(v.steps).some((s) => s === "blocked") ||
                            outcome?.tone === "rejected" ||
                            outcome?.tone === "monitor";
                          return (
                            <div
                              key={v.vendorId}
                              className={`grid grid-cols-[3fr_5rem_repeat(9,1fr)_1fr] gap-2 px-2 py-1.5 rounded items-center transition-all cursor-pointer border-l-2 border-l-transparent ${
                                isWarn
                                  ? "bg-red-50/30 dark:bg-red-900/5 hover:border-l-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/15"
                                  : "hover:border-l-[#266C92] hover:bg-[#266C92]/5 dark:hover:bg-[#266C92]/10"
                              }`}
                              onClick={() => onVendorClick(v.vendorId)}
                              data-testid={`pipeline-row-${v.vendorId}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`text-[10px] font-mono font-semibold ${isWarn ? "text-red-500" : "text-foreground"}`}>{v.vendorId}</span>
                                <span className="text-xs text-foreground truncate">{v.vendorName}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium truncate">
                                {v.riskTier === "Tier 3" ? "Tier 3" : v.riskTier === "Tier 2" ? "Tier 2" : "Tier 1"}
                              </span>
                              {tprmSteps.map((step) => (
                                <div key={step.id} className="flex justify-center">
                                  {stepDot(v.steps[step.id])}
                                </div>
                              ))}
                              <div className="flex justify-center">
                                {outcome?.tone === "approved" ? (
                                  <ShieldCheck className="w-3 h-3 text-[#266C92]" />
                                ) : outcome?.tone === "rejected" ? (
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                ) : outcome?.tone === "monitor" ? (
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

                  {/* Automated track — analog of SOX Automated group */}
                  {autoVendors.length > 0 && (() => {
                    const autoComplete = autoVendors.filter((v) =>
                      tprmStepIds.every(
                        (sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped"
                      )
                    ).length;
                    return (
                      <div>
                        <div className="flex items-center gap-2 px-2 py-1.5 border-t border-slate-100 dark:border-border">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Automated ({autoComplete}/{autoVendors.length})
                          </span>
                        </div>
                        {autoVendors.map((v) => {
                          const vendor = masterVendorList.find((m) => m.id === v.vendorId)!;
                          const outcome = getVendorOutcome(vendor, v);
                          return (
                            <div
                              key={v.vendorId}
                              className="grid grid-cols-[3fr_5rem_repeat(9,1fr)_1fr] gap-2 px-2 py-1.5 rounded items-center transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-[#266C92] hover:bg-[#266C92]/5 dark:hover:bg-[#266C92]/10"
                              onClick={() => onVendorClick(v.vendorId)}
                              data-testid={`pipeline-row-${v.vendorId}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] font-mono font-semibold text-[#266C92]">{v.vendorId}</span>
                                <span className="text-xs text-foreground truncate">{v.vendorName}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium truncate inline-flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" />
                                Auto
                              </span>
                              {tprmSteps.map((step) => (
                                <div key={step.id} className="flex justify-center">
                                  {stepDot(v.steps[step.id])}
                                </div>
                              ))}
                              <div className="flex justify-center">
                                {outcome?.tone === "approved" ? (
                                  <ShieldCheck className="w-3 h-3 text-[#266C92]" />
                                ) : outcome?.tone === "rejected" ? (
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
                          ? `Assessment complete across all ${totalVendors} vendors. ${exceptionsOpen} exception${exceptionsOpen !== 1 ? "s" : ""} open — review the findings below.`
                          : `Vendor assessment is underway — ${completedVendors} of ${totalVendors} vendors processed so far.${blockedActions.length > 0 ? ` ${blockedActions.length} action${blockedActions.length !== 1 ? "s" : ""} await your disposition.` : ""}`}
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Top-level TPRMSession (chooses Hub vs Focus, owns state + simulation)
// ─────────────────────────────────────────────────────────────────────────────

export default function TPRMSession() {
  const sessionId = TPRM_SESSION_ID;
  const { toast } = useToast();

  const [statuses, setStatuses] = usePersistedBlockState<VendorRunStatus[]>(
    sessionId,
    "pipeline",
    "statuses",
    masterVendorList.map((v) => ({
      vendorId: v.id,
      vendorName: v.vendorName,
      riskTier: v.riskTier,
      track: v.track,
      steps: tprmStepIds.reduce(
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

  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);

  const resolvedSet = useMemo(() => new Set(resolvedHitl), [resolvedHitl]);

  useEffect(() => {
    if (phase !== "running") return;
    const timer = setInterval(() => {
      setStatuses((prev: VendorRunStatus[]) => {
        const next = tickVendorStatuses(prev, resolvedSet);
        return next ?? prev;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [phase, resolvedSet]);

  const allDone = statuses.every((v) =>
    tprmStepIds.every(
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
    (vendorId: string, stepId: string, decision: "approve" | "modify" | "reject") => {
      const key = `${vendorId}:${stepId}`;
      if (decision === "reject") {
        // Mark step blocked rather than resuming the pipeline
        setStatuses((prev: VendorRunStatus[]) =>
          prev.map((v) =>
            v.vendorId === vendorId
              ? { ...v, steps: { ...v.steps, [stepId]: "blocked" as StepRunStatus } }
              : v
          )
        );
        toast({
          title: "Reviewer rejected step",
          description: `${vendorId} · ${stepId} flagged as blocked. Vendor returned to remediation queue.`,
          variant: "destructive",
        });
        return;
      }

      // Approve and Modify both resume the pipeline; Modify also annotates the audit trail
      if (!resolvedSet.has(key)) {
        setResolvedHitl((prev: string[]) => [...prev, key]);
      }
      toast({
        title: decision === "modify" ? "Reviewer modified disposition" : "Reviewer approved",
        description:
          decision === "modify"
            ? `Modifications applied to ${vendorId} · ${stepId}. Workflow resumed with updated parameters.`
            : `Approval recorded for ${vendorId} · ${stepId}. Workflow resumed.`,
      });
    },
    [resolvedSet, setResolvedHitl, setStatuses, toast]
  );

  const handleAdvanceStep = useCallback(
    (stepId: string) => {
      if (!activeVendorId) return;
      setStatuses((prev: VendorRunStatus[]) =>
        prev.map((v) =>
          v.vendorId === activeVendorId
            ? { ...v, steps: { ...v.steps, [stepId]: "complete" as StepRunStatus } }
            : v
        )
      );
      toast({
        title: "Step confirmed",
        description: `${stepId} marked complete for ${activeVendorId}.`,
      });
    },
    [activeVendorId, setStatuses, toast]
  );

  const fastForward = useCallback(() => {
    setStatuses((prev: VendorRunStatus[]) =>
      prev.map((v) => {
        const isAuto = v.track === "automated";
        const nextSteps: Record<string, StepRunStatus> = {};
        tprmStepIds.forEach((sid) => {
          if (sid === "monitoring") {
            nextSteps[sid] = v.fired ? "complete" : "pending";
          } else if (isAuto && (sid === "human-review" || sid === "exception")) {
            nextSteps[sid] = "skipped";
          } else {
            nextSteps[sid] = "complete";
          }
        });
        return { ...v, steps: nextSteps, overallProgress: 100 };
      })
    );
    toast({ title: "Fast-forwarded", description: "Pipeline advanced to terminal state." });
  }, [setStatuses, toast]);

  const activeVendor = activeVendorId
    ? masterVendorList.find((v) => v.id === activeVendorId)
    : null;
  const activeStatus = activeVendorId ? statuses.find((s) => s.vendorId === activeVendorId) : undefined;

  if (activeVendor) {
    return (
      <VendorFocusPage
        vendor={activeVendor}
        status={activeStatus}
        onBack={() => setActiveVendorId(null)}
        onAdvanceStep={handleAdvanceStep}
        onResolveHitl={handleResolveHitl}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-background" data-testid="tprm-session">
      <TPRMHub
        statuses={statuses}
        onVendorClick={(vendorId) => setActiveVendorId(vendorId)}
        onResolveHitl={handleResolveHitl}
        fastForward={fastForward}
      />
    </div>
  );
}
