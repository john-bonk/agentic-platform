import { useEffect, useMemo, useState, useCallback } from "react";
import {
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Activity,
  Users,
  Zap,
  Sparkles,
  FileText,
  Globe,
  Gauge,
  GitBranch,
  Inbox,
  ClipboardCheck,
  UserCheck,
  Bot,
  History,
} from "lucide-react";
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

const stepIcon = (status: StepRunStatus) => {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="w-3 h-3 text-[#266C92]" />;
    case "running":
      return <Loader2 className="w-3 h-3 text-[#266C92] animate-spin" />;
    case "waiting":
      return <Clock className="w-3 h-3 text-amber-500" />;
    case "blocked":
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    case "skipped":
      return <span className="text-[10px] text-muted-foreground">—</span>;
    default:
      return <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />;
  }
};

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

function PhaseHeader({ phaseLabel, ordinal, description }: { phaseLabel: string; ordinal: number; description?: string }) {
  return (
    <div className="flex items-baseline gap-2 mt-2 mb-1.5 pl-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#266C92]">
        Phase {ordinal} · {phaseLabel}
      </span>
      {description && <span className="text-[10px] text-muted-foreground/80">{description}</span>}
    </div>
  );
}

function VendorPipelineGrid({
  statuses,
  onVendorClick,
}: {
  statuses: VendorRunStatus[];
  onVendorClick: (vendorId: string) => void;
}) {
  return (
    <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[1.4fr_4rem_3rem_repeat(9,_1.9rem)_3rem] gap-0.5 px-3 py-1.5 bg-slate-50 dark:bg-muted/20 text-[8px] font-semibold text-muted-foreground uppercase tracking-wider items-center">
        <span>Vendor</span>
        <span className="text-center">Tier</span>
        <span className="text-center">Trk</span>
        {tprmSteps.map((s) => (
          <span key={s.id} className="text-center" title={s.title}>
            {s.shortLabel.slice(0, 4)}
          </span>
        ))}
        <span className="text-center">Res</span>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {statuses.map((v) => {
          const allComplete = tprmStepIds.every(
            (s) => v.steps[s] === "complete" || v.steps[s] === "skipped"
          );
          return (
            <button
              key={v.vendorId}
              onClick={() => onVendorClick(v.vendorId)}
              className="w-full grid grid-cols-[1.4fr_4rem_3rem_repeat(9,_1.9rem)_3rem] gap-0.5 px-3 py-1.5 text-xs items-center border-t border-slate-100 dark:border-border/50 hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors text-left"
              data-testid={`vendor-row-${v.vendorId}`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-mono font-medium text-foreground">{v.vendorId}</span>
                <span className="text-[10px] text-muted-foreground truncate">{v.vendorName}</span>
              </div>
              <div className="flex justify-center">
                <Badge
                  className={`text-[8px] h-3.5 px-1 ${
                    v.riskTier === "Tier 3"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : v.riskTier === "Tier 2"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  T{v.riskTier.slice(-1)}
                </Badge>
              </div>
              <div className="flex justify-center">
                {v.track === "automated" ? (
                  <Zap className="w-3 h-3 text-[#266C92]" />
                ) : (
                  <Users className="w-3 h-3 text-slate-500" />
                )}
              </div>
              {tprmStepIds.map((id) => (
                <div key={id} className="flex justify-center">
                  {stepIcon(v.steps[id])}
                </div>
              ))}
              <div className="flex justify-center">
                {allComplete ? <ShieldCheck className="w-3 h-3 text-[#266C92]" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VendorSchemaPanel({ vendor }: { vendor: VendorRecord }) {
  const groups: Array<{ label: string; rows: { k: string; v: string }[] }> = [
    {
      label: "Identity",
      rows: [
        { k: "Vendor ID", v: vendor.id },
        { k: "Vendor name", v: vendor.vendorName },
        { k: "Legal entity", v: vendor.legalEntity },
        { k: "Vendor type", v: vendor.vendorType },
        { k: "Primary contact", v: `${vendor.primaryContact.name} (${vendor.primaryContact.email})` },
      ],
    },
    {
      label: "Classification",
      rows: [
        { k: "Risk tier", v: vendor.riskTier },
        { k: "Data access scope", v: vendor.dataAccess },
        { k: "System criticality", v: vendor.criticality },
        { k: "Regulatory exposure", v: vendor.regulatoryExposure.join(", ") || "—" },
        { k: "Spend category", v: vendor.spendCategory },
        { k: "Annual contract value", v: vendor.annualContractValue },
      ],
    },
    {
      label: "Status",
      rows: [
        { k: "Assessment status", v: vendor.assessmentStatus },
        { k: "Last assessment", v: vendor.lastAssessmentDate },
        { k: "Next assessment due", v: vendor.nextAssessmentDue },
        { k: "Risk score", v: `${vendor.riskScore}/100` },
        { k: "Treatment decision", v: vendor.riskTreatment },
      ],
    },
    {
      label: "Connected data",
      rows: [
        { k: "Outside-in sources", v: vendor.intelSources.join(", ") || "None" },
        {
          k: "Documents received",
          v:
            vendor.documents
              .map((d) => `${d.type} (${d.status})`)
              .join(", ") || "None",
        },
        {
          k: "Outstanding requests",
          v: vendor.outstandingRequests.length
            ? vendor.outstandingRequests
                .map((r) => `${r.type} — ${r.status} (${r.due})`)
                .join("; ")
            : "None",
        },
        {
          k: "Exception records",
          v: `${vendor.exceptionRecords.open} open · ${vendor.exceptionRecords.closed} closed`,
        },
      ],
    },
  ];

  return (
    <div className="space-y-4" data-testid="vendor-schema">
      {groups.map((g) => (
        <div key={g.label} className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {g.label}
          </div>
          <div className="divide-y divide-slate-100 dark:divide-border/50">
            {g.rows.map((r) => (
              <div key={r.k} className="grid grid-cols-[10rem_1fr] gap-2 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">{r.k}</span>
                <span className="text-foreground">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {vendor.notes && (
        <div className="rounded-lg border border-slate-200 dark:border-border p-3 bg-slate-50/50 dark:bg-muted/10">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
          <p className="text-xs text-foreground leading-relaxed">{vendor.notes}</p>
        </div>
      )}
    </div>
  );
}

function VendorAssessmentTab({
  vendor,
  status,
  onResolveHitl,
}: {
  vendor: VendorRecord;
  status: VendorRunStatus | undefined;
  onResolveHitl: (stepId: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (status) {
      tprmSteps.forEach((s) => {
        if (status.steps[s.id] === "running" || status.steps[s.id] === "waiting") {
          initial[s.id] = true;
        }
      });
    }
    return initial;
  });

  return (
    <div className="space-y-3" data-testid="vendor-assessment">
      {tprmPhases.map((phase) => {
        const phaseSteps = tprmSteps.filter((s) => s.phaseId === phase.id);
        return (
          <div key={phase.id}>
            <PhaseHeader phaseLabel={phase.label} ordinal={phase.ordinal} description={phase.description} />
            <div className="space-y-2">
              {phaseSteps.map((step) => {
                const stStatus = status?.steps[step.id] ?? "pending";
                const isOpen = expanded[step.id];
                const Icon = step.icon;
                const isHitlStep = step.substeps.some((s) => s.isHitlGate);
                return (
                  <div
                    key={step.id}
                    className="border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-card overflow-hidden"
                    data-testid={`step-${step.id}`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded((e) => ({ ...e, [step.id]: !e[step.id] }))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors"
                      data-testid={`step-toggle-${step.id}`}
                    >
                      <div className="w-7 h-7 rounded-md bg-[#266C92]/10 border border-[#266C92]/20 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#266C92]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-muted-foreground">Step {step.ordinal}</span>
                          <span className="text-xs font-semibold text-foreground">{step.title}</span>
                          <Badge className="text-[9px] h-4 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0">
                            {step.substeps.length} substeps
                          </Badge>
                          {isHitlStep && (
                            <Badge className="text-[9px] h-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                              HITL gate
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{step.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {stepIcon(stStatus)}
                        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100 dark:border-border/50 bg-slate-50/40 dark:bg-muted/10">
                        <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Agent role</div>
                        <p className="px-3 pb-2 text-[11px] text-foreground/80 leading-relaxed">{step.agentRole}</p>

                        <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-t border-slate-100 dark:border-border/50">Substeps</div>
                        <div className="divide-y divide-slate-100 dark:divide-border/50">
                          {step.substeps.map((ss, i) => (
                            <div key={ss.id} className="px-3 py-2.5" data-testid={`substep-${ss.id}`}>
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] font-mono text-muted-foreground mt-0.5">{step.ordinal}.{i + 1}</span>
                                <ActionTypeBadge actionType={ss.actionType} />
                                <p className="flex-1 text-[11px] text-foreground leading-relaxed">{ss.description}</p>
                              </div>
                              {ss.output && (
                                <div className="mt-2 ml-12 rounded-md border border-slate-200 dark:border-border bg-white dark:bg-card p-2.5">
                                  <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-[#266C92]" />
                                    {ss.output.label}
                                  </div>
                                  {ss.output.kind === "score" && (
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-lg font-bold text-foreground">{ss.output.scoreValue}</span>
                                      {ss.output.scoreLabel && (
                                        <span className="text-[10px] text-muted-foreground">{ss.output.scoreLabel}</span>
                                      )}
                                    </div>
                                  )}
                                  {ss.output.kind === "narrative" && (
                                    <p className="text-[11px] text-foreground/80 leading-relaxed">{ss.output.body}</p>
                                  )}
                                  {(ss.output.kind === "annotation" ||
                                    ss.output.kind === "list" ||
                                    ss.output.kind === "request") && (
                                    <div className="space-y-0.5">
                                      {ss.output.items?.map((it, k) => (
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
                              )}
                              {ss.isHitlGate && stStatus === "waiting" && (
                                <div className="mt-2 ml-12 flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => onResolveHitl(step.id)}
                                    className="h-7 px-2.5 text-[10px] bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                                    data-testid={`hitl-approve-${step.id}`}
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onResolveHitl(step.id)}
                                    className="h-7 px-2.5 text-[10px]"
                                    data-testid={`hitl-modify-${step.id}`}
                                  >
                                    Modify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onResolveHitl(step.id)}
                                    className="h-7 px-2.5 text-[10px] text-red-600 hover:text-red-700"
                                    data-testid={`hitl-reject-${step.id}`}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-t border-slate-100 dark:border-border/50">Outcome</div>
                        <p className="px-3 pb-3 text-[11px] text-foreground/80 leading-relaxed">{step.outcome}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {vendor.monitoring.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-3" data-testid="monitoring-events">
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
    </div>
  );
}

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

  if (events.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic px-2 py-4">
        No completed substeps yet. Audit trail entries will appear here as the assessment progresses.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden" data-testid="audit-trail">
      <div className="grid grid-cols-[5rem_8rem_4rem_1fr] gap-2 px-3 py-1.5 bg-slate-50 dark:bg-muted/20 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>When</span>
        <span>Actor</span>
        <span>Type</span>
        <span>Action</span>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-border/50">
        {events.map((e, i) => (
          <div key={i} className="grid grid-cols-[5rem_8rem_4rem_1fr] gap-2 px-3 py-1.5 text-[11px] items-center">
            <span className="text-muted-foreground font-mono">{e.ts}</span>
            <span className="text-foreground">{e.actor}</span>
            <ActionTypeBadge actionType={e.type} />
            <span className="text-foreground/90">{e.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorDetailView({
  vendor,
  status,
  onBack,
  onResolveHitl,
}: {
  vendor: VendorRecord;
  status: VendorRunStatus | undefined;
  onBack: () => void;
  onResolveHitl: (vendorId: string, stepId: string) => void;
}) {
  type Tab = "overview" | "assessment" | "audit";
  const [tab, setTab] = useState<Tab>("assessment");

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="vendor-detail">
      <div className="border-b border-slate-200 dark:border-border bg-white dark:bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            data-testid="button-back-to-pipeline"
          >
            <ArrowLeft className="w-3 h-3" />
            Pipeline
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-border" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground">{vendor.id}</span>
              <h2 className="text-base font-semibold text-foreground truncate">{vendor.vendorName}</h2>
              <Badge
                className={`text-[10px] h-5 ${
                  vendor.riskTier === "Tier 3"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : vendor.riskTier === "Tier 2"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {vendor.riskTier}
              </Badge>
              <Badge className={`text-[10px] h-5 inline-flex items-center gap-1 ${vendor.track === "automated" ? "bg-[#266C92]/10 text-[#266C92]" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"} border-0`}>
                {vendor.track === "automated" ? <><Zap className="w-2.5 h-2.5" /> Auto track</> : <><Users className="w-2.5 h-2.5" /> Human review track</>}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {vendor.vendorType} · {vendor.dataAccess} data · {vendor.criticality} criticality · Score {vendor.riskScore}/100
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-border bg-white dark:bg-card px-6">
        <div className="flex items-center gap-1">
          {([
            { id: "overview" as const, label: "Overview", icon: FileText },
            { id: "assessment" as const, label: "Assessment", icon: Gauge },
            { id: "audit" as const, label: "Audit Trail", icon: History },
          ]).map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "border-[#266C92] text-[#266C92]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-${t.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 dark:bg-background">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {tab === "overview" && <VendorSchemaPanel vendor={vendor} />}
          {tab === "assessment" && (
            <VendorAssessmentTab
              vendor={vendor}
              status={status}
              onResolveHitl={(stepId) => onResolveHitl(vendor.id, stepId)}
            />
          )}
          {tab === "audit" && <VendorAuditTrailTab status={status} />}
        </div>
      </div>
    </div>
  );
}

export default function TPRMSession() {
  const sessionId = TPRM_SESSION_ID;
  const { toast } = useToast();
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const setCurrentSolution = useWorkflowSessionStore((s) => s.setCurrentSolution);

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
    }, 900);
    return () => clearInterval(timer);
  }, [phase, resolvedSet]);

  const allDone = statuses.every((v) =>
    tprmStepIds.every((sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped" || (sid === "monitoring" && !v.fired))
  );

  useEffect(() => {
    if (allDone && phase === "running") {
      const t = setTimeout(() => setPhase("complete"), 800);
      return () => clearTimeout(t);
    }
  }, [allDone, phase]);

  const completedCount = statuses.filter((v) =>
    tprmStepIds.every((sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped" || (sid === "monitoring" && !v.fired))
  ).length;
  const auto = statuses.filter((v) => v.track === "automated");
  const review = statuses.filter((v) => v.track === "human-review");
  const autoDone = auto.filter((v) =>
    tprmStepIds.every((sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped")
  ).length;
  const reviewDone = review.filter((v) =>
    tprmStepIds.every((sid) => v.steps[sid] === "complete" || v.steps[sid] === "skipped" || (sid === "monitoring" && !v.fired))
  ).length;
  const exceptionsOpen = masterVendorList
    .filter((v) => statuses.some((s) => s.vendorId === v.id))
    .reduce((acc, v) => acc + v.exceptionRecords.open, 0);

  const handleResolveHitl = useCallback(
    (vendorId: string, stepId: string) => {
      const key = `${vendorId}:${stepId}`;
      if (!resolvedSet.has(key)) {
        setResolvedHitl((prev: string[]) => [...prev, key]);
      }
      toast({
        title: "Decision recorded",
        description: `Reviewer disposition logged for ${vendorId} · Step "${stepId}". Workflow resumed.`,
      });
    },
    [resolvedSet, setResolvedHitl, toast]
  );

  const activeVendor = activeVendorId
    ? masterVendorList.find((v) => v.id === activeVendorId)
    : null;
  const activeStatus = activeVendorId
    ? statuses.find((s) => s.vendorId === activeVendorId)
    : undefined;

  if (activeVendor) {
    return (
      <VendorDetailView
        vendor={activeVendor}
        status={activeStatus}
        onBack={() => setActiveVendorId(null)}
        onResolveHitl={handleResolveHitl}
      />
    );
  }

  const stepIconMap: Record<string, typeof Inbox> = {
    "vendor-intake": Inbox,
    "risk-tiering": GitBranch,
    "outside-in": Globe,
    "doc-analysis": FileText,
    "risk-scoring": Gauge,
    triage: ClipboardCheck,
    "human-review": UserCheck,
    exception: AlertTriangle,
    monitoring: Activity,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-background" data-testid="tprm-session">
      <div className="border-b border-slate-200 dark:border-border bg-white dark:bg-card px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentSession(null);
                setCurrentSolution("tprm");
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              data-testid="button-exit-session"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to TPRM
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-border" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-foreground">{tprmArchetypeConfig.solutionLabel} — Active Assessment</h1>
                <Badge className="text-[10px] h-5 bg-[#266C92]/10 text-[#266C92] border-0">
                  {statuses.length} vendors · 9 steps · 4 phases
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Pipeline tracker for the active TPRM run. Click any vendor to drill into its assessment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-center">
              <p className="text-xl font-bold text-foreground">{completedCount}/{statuses.length}</p>
              <p className="text-[10px] text-muted-foreground">Vendors Complete</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-center">
              <p className="text-xl font-bold text-foreground">{autoDone}/{auto.length}</p>
              <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1 justify-center">
                <Zap className="w-2.5 h-2.5 text-[#266C92]" /> Automated track
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-center">
              <p className="text-xl font-bold text-foreground">{reviewDone}/{review.length}</p>
              <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1 justify-center">
                <Users className="w-2.5 h-2.5 text-slate-500" /> Human-review track
              </p>
            </div>
            <div className="p-3 rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10 text-center">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{exceptionsOpen}</p>
              <p className="text-[10px] text-muted-foreground">Open Exceptions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {tprmPhases.map((p) => {
              const inPhase = tprmSteps.filter((s) => s.phaseId === p.id).length;
              return (
                <div key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted/20">
                  <span className="font-semibold text-foreground">P{p.ordinal}</span>
                  <span>{p.label}</span>
                  <span className="text-muted-foreground/70">· {inPhase} steps</span>
                </div>
              );
            })}
          </div>

          <VendorPipelineGrid
            statuses={statuses}
            onVendorClick={(vendorId) => setActiveVendorId(vendorId)}
          />

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground px-1 flex-wrap">
            <div className="flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 text-[#266C92] animate-spin" /><span>Agent running</span></div>
            <span>·</span>
            <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-amber-500" /><span>Awaiting reviewer</span></div>
            <span>·</span>
            <div className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-[#266C92]" /><span>Complete</span></div>
            <span>·</span>
            <div className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground">—</span><span>Skipped (auto track)</span></div>
            <span>·</span>
            <div className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5 text-[#266C92]" /><span>Assessment closed</span></div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-[#266C92]" />
              <h3 className="text-sm font-semibold text-foreground">Pipeline Step Reference</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {tprmSteps.map((s) => {
                const Icon = stepIconMap[s.id] ?? Inbox;
                return (
                  <div key={s.id} className="flex items-start gap-2 p-2 rounded-md border border-slate-100 dark:border-border/40 bg-slate-50/50 dark:bg-muted/10">
                    <div className="w-6 h-6 rounded-md bg-[#266C92]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3 h-3 text-[#266C92]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-foreground truncate">{s.ordinal}. {s.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{s.outcome}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
