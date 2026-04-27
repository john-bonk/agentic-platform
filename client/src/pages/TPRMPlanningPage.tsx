import { useState, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  ArrowRight,
  X,
  Info,
  Sparkles,
  CalendarClock,
  TrendingUp,
  AlertTriangle,
  Layers,
  Plus,
  Search,
  Settings,
  Users,
  Zap,
  Shield,
} from "lucide-react";
import {
  masterVendorList,
  tprmSteps,
  tprmPhases,
  tprmConfigWizardSteps,
  type VendorRecord,
} from "@/lib/tprmData";
import { useWorkflowSessionStore } from "@/lib/workflowSessionStore";
import { launchTprmAssessment } from "@/lib/tprmLauncher";

const SELECTION_FACTORS = [
  { label: "Assessment Period", value: "Q2 2026", icon: CalendarClock },
  { label: "Risk Threshold", value: "All Tiers", icon: TrendingUp },
  { label: "Open Exceptions", value: "11 across 4 vendors", icon: AlertTriangle },
  { label: "Cert Expiry Watch", value: "1 within 14 days", icon: Layers },
];

const tierColor = (tier: VendorRecord["riskTier"]) =>
  tier === "Tier 3"
    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    : tier === "Tier 2"
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

export default function TPRMPlanningPage() {
  const [, setLocation] = useLocation();
  const addProject = useWorkflowSessionStore((s) => s.addProject);
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const activeProjects = useWorkflowSessionStore((s) => s.activeProjects);

  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  const activeVendors = useMemo(
    () => masterVendorList.filter((v) => !excludedIds.has(v.id)),
    [excludedIds]
  );

  const stats = useMemo(() => {
    const automated = activeVendors.filter((v) => v.track === "automated").length;
    const human = activeVendors.filter((v) => v.track === "human-review").length;
    const tier3 = activeVendors.filter((v) => v.riskTier === "Tier 3").length;
    return { total: activeVendors.length, automated, human, tier3 };
  }, [activeVendors]);

  const groupedVendors = useMemo(() => {
    const groups: Record<string, VendorRecord[]> = { "Tier 1": [], "Tier 2": [], "Tier 3": [] };
    masterVendorList.forEach((v) => {
      groups[v.riskTier].push(v);
    });
    return groups;
  }, []);

  const toggleVendor = useCallback((id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleConfirmStart = useCallback(async () => {
    const { workflowSessionConfigs } = await import("@/components/workspace/AgentHubHome");
    const ids = masterVendorList.filter((v) => !excludedIds.has(v.id)).map((v) => v.id);
    launchTprmAssessment(addProject, setCurrentSession, activeProjects, workflowSessionConfigs, ids);
    setLocation("/");
  }, [addProject, setCurrentSession, activeProjects, setLocation, excludedIds]);

  const handleCancel = useCallback(() => {
    setLocation("/");
  }, [setLocation]);

  return (
    <div className="h-screen bg-white dark:bg-background flex flex-col overflow-hidden" data-testid="tprm-planning-page">
      <div className="border-b border-slate-200 dark:border-border bg-white dark:bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-[#266C92]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground" data-testid="text-page-title">
                Third-Party Risk Assessment Plan
              </h1>
              <p className="text-xs text-muted-foreground">
                Review the assessment scope, track split, and 9-step pipeline before initiating
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-cancel-top"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          <div className="rounded-xl border border-[#266C92]/15 bg-gradient-to-r from-[#266C92]/[0.04] to-transparent p-5" data-testid="selection-callout">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#266C92]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-[#266C92]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These {masterVendorList.length} vendors were assembled from the active vendor inventory and prioritized by tier, open exceptions, certificate expiry windows, and trigger events from continuous monitoring. Tier 1 vendors will run end-to-end on the
                  <button className="inline-flex items-center gap-0.5 text-[#266C92] hover:underline mx-0.5 font-medium" data-testid="link-config">
                    <Settings className="w-3 h-3" />
                    automated track
                  </button>
                  and auto-close at triage. Tier 2 and Tier 3 vendors route to the human-review track.
                </p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {SELECTION_FACTORS.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-muted/30 border border-slate-200 dark:border-border text-[10px]"
                      data-testid={`factor-${f.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <f.icon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{f.label}:</span>
                      <span className="font-semibold text-foreground">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4" data-testid="stats-grid">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
              <p className="text-2xl font-bold text-foreground" data-testid="stat-total-vendors">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Vendors in Scope</p>
              {excludedIds.size > 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">{excludedIds.size} removed from default</p>
              )}
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#266C92]" />
                <p className="text-2xl font-bold text-foreground" data-testid="stat-automated">{stats.automated}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Automated Track</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-2xl font-bold text-foreground" data-testid="stat-human">{stats.human}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Human-Review Track</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="stat-tier3">{stats.tier3}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tier 3 (High Risk)</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">Configuration Wizard</h2>
            <p className="text-xs text-muted-foreground mb-3">5 setup screens — defaults pre-applied based on your TPRM program configuration.</p>
            <div className="grid grid-cols-5 gap-2" data-testid="wizard-strip">
              {tprmConfigWizardSteps.map((s, i) => (
                <div key={s.id} className="p-3 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] text-muted-foreground font-mono">{i + 1}</span>
                    <span className="text-[11px] font-semibold text-foreground">{s.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">Agentic Workflow — Per-Vendor Pipeline</h2>
            <p className="text-xs text-muted-foreground mb-4">9 steps grouped into 4 phases. Substep-level execution with AI / Automated / Human-in-the-loop tags.</p>
            <div className="space-y-5">
              {tprmPhases.map((phase) => {
                const phaseSteps = tprmSteps.filter((s) => s.phaseId === phase.id);
                return (
                  <div key={phase.id}>
                    <div className="flex items-baseline gap-2 mb-2 pl-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Phase {phase.ordinal} · {phase.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">{phase.description}</span>
                    </div>
                    <div className="space-y-2">
                      {phaseSteps.map((step) => {
                        const Icon = step.icon;
                        return (
                          <div
                            key={step.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card"
                            data-testid={`workflow-step-${step.id}`}
                          >
                            <div className="w-9 h-9 rounded-lg bg-[#266C92]/10 border border-[#266C92]/20 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-[#266C92]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono text-muted-foreground">Step {step.ordinal}</span>
                                <span className="text-xs font-semibold text-foreground">{step.title}</span>
                                <Badge className="text-[9px] h-4 bg-[#266C92]/10 text-[#266C92] border-0">
                                  {step.substeps.length} substeps
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Vendors in Scope</h2>
                <span className="text-xs text-muted-foreground">({stats.total} of {masterVendorList.length})</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>Uncheck to exclude from this run</span>
              </div>
            </div>
            <div className="space-y-5">
              {(["Tier 1", "Tier 2", "Tier 3"] as const).map((tier) => {
                const tierVendors = groupedVendors[tier] || [];
                const activeInTier = tierVendors.filter((v) => !excludedIds.has(v.id)).length;
                return (
                  <div key={tier} data-testid={`vendor-group-${tier.replace(/\s+/g, "-").toLowerCase()}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-[10px] h-5 ${tierColor(tier)}`}>{tier}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        ({activeInTier}/{tierVendors.length})
                      </span>
                    </div>
                    <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[2.5rem_5rem_1fr_8rem_6rem_6rem_5.5rem] gap-2 px-4 py-2 bg-slate-50 dark:bg-muted/20 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <span></span>
                        <span>ID</span>
                        <span>Vendor</span>
                        <span>Type</span>
                        <span>Data Access</span>
                        <span>Score</span>
                        <span>Track</span>
                      </div>
                      {tierVendors.map((v) => {
                        const isIncluded = !excludedIds.has(v.id);
                        return (
                          <div
                            key={v.id}
                            className={`grid grid-cols-[2.5rem_5rem_1fr_8rem_6rem_6rem_5.5rem] gap-2 px-4 py-2.5 text-xs items-center border-t border-slate-100 dark:border-border/50 transition-opacity ${
                              !isIncluded ? "opacity-40" : ""
                            }`}
                            data-testid={`vendor-row-${v.id}`}
                          >
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isIncluded}
                                onChange={() => toggleVendor(v.id)}
                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-[#266C92] focus:ring-[#266C92] cursor-pointer"
                                data-testid={`checkbox-${v.id}`}
                              />
                            </div>
                            <span className="font-mono text-muted-foreground">{v.id}</span>
                            <span className={`font-medium ${isIncluded ? "text-foreground" : "text-muted-foreground line-through"}`}>{v.vendorName}</span>
                            <span className="text-[10px] text-muted-foreground">{v.vendorType}</span>
                            <span className="text-[10px] text-muted-foreground">{v.dataAccess}</span>
                            <span className={`text-[11px] font-semibold ${
                              v.riskScore >= 70
                                ? "text-red-600 dark:text-red-400"
                                : v.riskScore >= 50
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}>{v.riskScore}/100</span>
                            <span
                              className={`text-[10px] inline-flex items-center gap-1 ${
                                v.track === "automated" ? "text-[#266C92]" : "text-slate-500"
                              }`}
                            >
                              {v.track === "automated" ? <><Zap className="w-3 h-3" /> Auto</> : <><Users className="w-3 h-3" /> Review</>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {excludedIds.size > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setExcludedIds(new Set())}
                  className="text-[11px] text-[#266C92] hover:underline font-medium flex items-center gap-1"
                  data-testid="button-reset-selection"
                >
                  <Plus className="w-3 h-3" />
                  Reset to recommended set ({masterVendorList.length})
                </button>
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-border" data-testid="search-additional-vendors">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search the vendor inventory to add additional vendors..."
                  className="w-full h-9 pl-9 pr-4 text-xs rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-muted/10 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[#266C92]/30 focus:border-[#266C92]/40 transition-colors"
                  data-testid="input-search-vendors"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
                Search the vendor inventory to add vendors beyond the prioritized scope
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-border p-5 bg-slate-50/30 dark:bg-muted/10" data-testid="plan-rationale">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#266C92]" />
              <h3 className="text-sm font-semibold text-foreground">Plan Rationale</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• <span className="font-medium text-foreground">{stats.automated}</span> Tier 1 vendors will run end-to-end on the automated track and auto-close at triage based on Tier 1 thresholds.</li>
              <li>• <span className="font-medium text-foreground">{stats.human}</span> Tier 2/3 vendors will pause at the human-review step for reviewer judgment after the assessment phase completes.</li>
              <li>• <span className="font-medium text-foreground">{stats.tier3}</span> Tier 3 vendors will route to senior reviewers and will likely generate exception records that flow into the remediation step.</li>
              <li>• Continuous monitoring is enabled for all completed assessments — material signals (cert expiry, breach disclosure, adverse news) will trigger targeted re-assessment.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-border bg-white dark:bg-background sticky bottom-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="text-sm"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            {excludedIds.size > 0 && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400">
                {excludedIds.size} vendor{excludedIds.size > 1 ? "s" : ""} excluded
              </span>
            )}
            <Button
              onClick={handleConfirmStart}
              disabled={stats.total === 0}
              className="bg-[#266C92] hover:bg-[#1e5a7a] text-white text-sm px-6 disabled:opacity-50"
              data-testid="button-confirm-start"
            >
              Confirm & Start Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
