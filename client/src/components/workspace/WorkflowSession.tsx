import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkflowSessionStore, usePersistedBlockState } from "@/lib/workflowSessionStore";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Check,
  Loader2,
  Bot,
  Users,
  Building2,
  MapPin,
  Send,
  FileText,
  BarChart3,
  Target,
  RefreshCcw,
  Sparkles,
  Brain,
  Shield,
  TrendingUp,
  AlertTriangle,
  Gauge,
  Clock,
  Eye,
  Mail,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Zap,
  ArrowUpRight,
  X,
  Activity,
  Globe,
  Layers,
  AlertCircle,
  ListChecks,
  PieChart,
} from "lucide-react";

export interface WorkflowBlock {
  id: string;
  title: string;
  description: string;
  type: "human-input" | "automated" | "next-steps";
  render: (props: WorkflowBlockRenderProps) => JSX.Element;
}

export interface WorkflowBlockRenderProps {
  onComplete: () => void;
  isActive: boolean;
  sessionId: string;
  isReviewMode?: boolean;
}

export interface WorkflowSessionConfig {
  id: string;
  title: string;
  blocks: WorkflowBlock[];
}

interface WorkflowSessionProps {
  config: WorkflowSessionConfig;
  sessionId: string;
  onBack: () => void;
}

function AssistantWelcomeMessage({ configId, activeIndex, completedCount }: { configId: string; activeIndex: number; completedCount: number }) {
  const [visible, setVisible] = useState(false);

  const message = configId === "control-testing"
    ? completedCount === 0 && activeIndex === 0
      ? "I've set up the Automated Control Testing workflow for you. We'll walk through control selection, data source configuration, and PBC owner mapping before kicking off parallel fieldwork execution across all selected controls. Let's start by choosing which controls to include in this testing cycle."
      : completedCount >= 4
        ? "All testing is complete. You can review the results below, triage any exceptions, or generate the executive report from the Next Steps panel."
        : `Welcome back — you're on step ${activeIndex + 1}. Let's continue where you left off.`
    : "Welcome — let's get started with your workflow.";

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500" data-testid="assistant-welcome-message">
      <div className="w-7 h-7 rounded-full bg-[#266C92] flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-[#266C92] mb-1">Optro Assistant</p>
        <p className="text-sm text-foreground leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

function BlockWrapper({
  block,
  index,
  activeIndex,
  completedIndices,
  onComplete,
  isLast,
  sessionId,
  isReviewing,
  onToggleReview,
}: {
  block: WorkflowBlock;
  index: number;
  activeIndex: number;
  completedIndices: Set<number>;
  onComplete: () => void;
  isLast: boolean;
  sessionId: string;
  isReviewing: boolean;
  onToggleReview: () => void;
}) {
  const isActive = index === activeIndex;
  const isCompleted = completedIndices.has(index);
  const isFuture = index > activeIndex;
  const showContent = isActive || isReviewing;
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && blockRef.current) {
      blockRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isActive]);

  useEffect(() => {
    if (isReviewing && blockRef.current) {
      blockRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isReviewing]);

  return (
    <div
      ref={blockRef}
      className={`transition-all duration-500 ease-in-out ${
        isActive || isReviewing ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
      }`}
      data-testid={`workflow-block-${block.id}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center shrink-0 pt-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              isCompleted
                ? isReviewing
                  ? "bg-[#266C92] text-white ring-4 ring-[#266C92]/20"
                  : "bg-[#266C92] text-white"
                : isActive
                ? "bg-[#266C92] text-white ring-4 ring-[#266C92]/20"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
            }`}
          >
            {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
          </div>
          {!isLast && (
            <div
              className={`w-0.5 flex-1 min-h-[2rem] mt-2 transition-colors ${
                isCompleted ? "bg-[#266C92]" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 pb-6">
          <div
            className={`flex items-center gap-2 mb-1 ${isCompleted && !isActive ? "cursor-pointer group/header" : ""}`}
            onClick={isCompleted && !isActive ? onToggleReview : undefined}
            data-testid={isCompleted && !isActive ? `block-review-toggle-${block.id}` : undefined}
          >
            <h3
              className={`text-sm font-semibold transition-colors ${
                isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
              } ${isCompleted && !isActive ? "group-hover/header:text-[#266C92] dark:group-hover/header:text-[#4da3c9]" : ""}`}
            >
              {block.title}
            </h3>
            {isCompleted && (
              <Badge className="text-[10px] h-4 bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]">
                Complete
              </Badge>
            )}
            {isActive && block.type === "automated" && (
              <Badge className="text-[10px] h-4 bg-[#266C92] text-white">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Processing
              </Badge>
            )}
            {isCompleted && !isActive && (
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${isReviewing ? "rotate-180" : ""}`} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">{block.description}</p>

          {showContent && (
            <div className={isActive ? "animate-in slide-in-from-bottom-4 fade-in duration-500" : "animate-in fade-in duration-300"}>
              <Card className={`border ${isReviewing && !isActive ? "border-[#266C92]/20 bg-slate-50/50 dark:bg-muted/10" : "border-slate-200 dark:border-border"}`}>
                <CardContent className="p-4">
                  {isReviewing && !isActive && (
                    <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-slate-100 dark:border-border">
                      <Eye className="w-3 h-3 text-[#266C92]" />
                      <span className="text-[10px] font-medium text-[#266C92] dark:text-[#4da3c9] uppercase tracking-wider">Reviewing completed step</span>
                    </div>
                  )}
                  {block.render({ onComplete, isActive, sessionId, isReviewMode: isReviewing && !isActive })}
                </CardContent>
              </Card>
            </div>
          )}

          {isCompleted && !showContent && (
            <div className="text-xs text-muted-foreground italic cursor-pointer hover:text-[#266C92] dark:hover:text-[#4da3c9] transition-colors" onClick={onToggleReview} data-testid={`block-expand-hint-${block.id}`}>
              Step completed — click to review
            </div>
          )}

          {isFuture && !isCompleted && (
            <div className="h-2" />
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkflowSession({ config, sessionId, onBack }: WorkflowSessionProps) {
  const activeIndex = useWorkflowSessionStore((s) => s.runtimeStates[sessionId]?.activeIndex ?? 0);
  const completedIndicesArr = useWorkflowSessionStore((s) => s.runtimeStates[sessionId]?.completedIndices ?? []);
  const completedIndices = new Set(completedIndicesArr);
  const fullScreenView = useWorkflowSessionStore((s) => s.runtimeStates[sessionId]?.fullScreenView ?? null);
  const setRuntime = useWorkflowSessionStore((s) => s.setRuntime);
  const [reviewingBlock, setReviewingBlock] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevActiveRef = useRef(activeIndex);
  useEffect(() => {
    if (prevActiveRef.current !== activeIndex) {
      prevActiveRef.current = activeIndex;
      setReviewingBlock(null);
    }
  }, [activeIndex]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  const setActiveIndex = useCallback((idx: number) => {
    setRuntime(sessionId, { activeIndex: idx });
  }, [sessionId, setRuntime]);

  const setFullScreenView = useCallback((view: string | null) => {
    setRuntime(sessionId, { fullScreenView: view });
  }, [sessionId, setRuntime]);

  const lastFiredBlockRef = useRef<number>(activeIndex);

  useEffect(() => {
    const handler = (e: Event) => {
      const viewId = (e as CustomEvent).detail?.viewId;
      if (viewId && fullScreenDetailViews[viewId]) {
        setFullScreenView(viewId);
      }
    };
    window.addEventListener("workflow-session:open-detail", handler);
    return () => window.removeEventListener("workflow-session:open-detail", handler);
  }, [setFullScreenView]);

  useEffect(() => {
    const pending = useWorkflowSessionStore.getState().pendingDetailView;
    if (pending && fullScreenDetailViews[pending]) {
      setFullScreenView(pending);
      useWorkflowSessionStore.getState().setPendingDetailView(null);
    }
  }, [setFullScreenView]);

  useEffect(() => {
    if (lastFiredBlockRef.current === activeIndex) return;
    lastFiredBlockRef.current = activeIndex;
    const block = config.blocks[activeIndex];
    if (block) {
      window.dispatchEvent(new CustomEvent("workflow-session:block-event", { detail: { blockId: block.id, type: "activated" } }));
    }
  }, [activeIndex, config.blocks]);

  const completeBlock = useCallback((index: number) => {
    const block = config.blocks[index];
    if (block) {
      window.dispatchEvent(new CustomEvent("workflow-session:block-event", { detail: { blockId: `${block.id}-complete`, type: "completed" } }));
    }
    const store = useWorkflowSessionStore.getState();
    const existing = store.runtimeStates[sessionId]?.completedIndices ?? [];
    if (!existing.includes(index)) {
      setRuntime(sessionId, { completedIndices: [...existing, index] });
    }
    if (index < config.blocks.length - 1) {
      setTimeout(() => setActiveIndex(index + 1), 400);
    }
  }, [config.blocks, sessionId, setRuntime, setActiveIndex]);

  const activeDetailView = fullScreenView ? fullScreenDetailViews[fullScreenView] : null;

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white dark:bg-background">
      {activeDetailView && (
        <div className="absolute inset-0 z-10 flex flex-col overflow-hidden bg-white dark:bg-background animate-in fade-in duration-200">
          <div className="shrink-0 h-12 px-4 flex items-center gap-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
            <button
              onClick={() => setFullScreenView(null)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-detail-back"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to workflow</span>
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-border" />
            <div className="flex items-center gap-2">
              {activeDetailView.headerIcon}
              <h2 className="text-sm font-semibold text-foreground">{activeDetailView.title}</h2>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {activeDetailView.render()}
          </div>
        </div>
      )}

      <div className={`flex flex-col h-full overflow-hidden ${fullScreenView ? 'invisible pointer-events-none' : 'animate-in slide-in-from-right-8 fade-in duration-300'}`}>
      <div className="shrink-0 h-12 px-4 flex items-center gap-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-workflow-back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Overview</span>
        </button>
        <div className="w-px h-5 bg-slate-200 dark:bg-border" />
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#266C92]" />
          <h2 className="text-sm font-semibold text-foreground">{config.title}</h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Step {Math.min(activeIndex + 1, config.blocks.length)} of {config.blocks.length}
          </span>
          <div className="flex gap-1">
            {config.blocks.map((_, i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full transition-colors ${
                  completedIndices.has(i)
                    ? "bg-[#266C92]"
                    : i === activeIndex
                    ? "bg-[#266C92]/50"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto">
          
          {config.blocks.map((block, index) => (
            <BlockWrapper
              key={block.id}
              isLast={index === config.blocks.length - 1}
              block={block}
              index={index}
              activeIndex={activeIndex}
              completedIndices={completedIndices}
              onComplete={() => completeBlock(index)}
              sessionId={sessionId}
              isReviewing={reviewingBlock === index}
              onToggleReview={() => setReviewingBlock(reviewingBlock === index ? null : index)}
            />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

interface SignalDetailData {
  icon: typeof Brain;
  label: string;
  detail: string;
  type: "insight" | "recommendation" | "data";
  detailViewId: string;
}

const synthesisSignals: SignalDetailData[] = [
  { icon: TrendingUp, label: "Industry Benchmark", detail: "Peer companies assess operational risk quarterly — your last cycle was 147 days ago", type: "data", detailViewId: "signal-benchmark" },
  { icon: Shield, label: "Control Coverage", detail: "34 of 89 controls lack recent test results — 12 flagged as high-priority gaps", type: "insight", detailViewId: "signal-controls" },
  { icon: AlertTriangle, label: "Emerging Risks", detail: "3 new regulatory changes and 2 vendor alerts detected since last assessment", type: "insight", detailViewId: "signal-emerging" },
  { icon: Gauge, label: "KRI Drift", detail: "7 key risk indicators have exceeded threshold tolerances in the past 30 days", type: "data", detailViewId: "signal-kri" },
  { icon: Brain, label: "Historical Pattern", detail: "Previous assessments averaged 23-day cycle time with 78% first-pass completion rate", type: "data", detailViewId: "signal-historical" },
  { icon: Bot, label: "Auto-Assessment Eligible", detail: "42 risk items can be automatically scored from existing data sources — 47 require human survey", type: "recommendation", detailViewId: "signal-auto" },
];

const templateOptions = [
  { id: "comprehensive", label: "Comprehensive Assessment", description: "Full enterprise-wide risk evaluation across all domains, entities, and control frameworks", recommended: true, autoItems: 42, surveyItems: 47, estimatedDays: 18 },
  { id: "targeted", label: "Targeted Assessment", description: "Focused evaluation on high-priority risk areas and recently triggered alerts only", recommended: false, autoItems: 28, surveyItems: 15, estimatedDays: 7 },
  { id: "delta", label: "Delta Assessment", description: "Incremental review — only assess risks with material changes since last cycle", recommended: false, autoItems: 35, surveyItems: 12, estimatedDays: 5 },
];

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${accent ? "border-[#266C92]/30 bg-[#266C92]/5 dark:bg-[#266C92]/10" : "border-slate-200 dark:border-border bg-white dark:bg-card"}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ? "text-[#266C92]" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-muted/30">
            {headers.map((h, i) => <th key={i} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-muted/20">
              {row.map((cell, j) => <td key={j} className="px-3 py-2 text-foreground">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BenchmarkDetailView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border">
        <TrendingUp className="w-5 h-5 text-[#266C92] mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Your assessment cycle is overdue relative to peer benchmarks</p>
          <p className="text-xs text-muted-foreground mt-1">Based on analysis of 847 companies in your industry vertical (Financial Services, $5B+ revenue), your 147-day gap since the last completed assessment places you in the bottom quartile for assessment frequency.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Days Since Last Assessment" value="147" sub="Target: ≤90 days" accent />
        <MetricCard label="Industry Median" value="78 days" sub="Quarterly cadence" />
        <MetricCard label="Peer Percentile" value="23rd" sub="Bottom quartile" />
        <MetricCard label="Recommended Frequency" value="Quarterly" sub="Every 90 days" />
      </div>
      <DetailSection title="Peer Comparison by Industry">
        <DataTable
          headers={["Industry Segment", "Median Cycle (Days)", "Your Cycle", "Gap", "Percentile"]}
          rows={[
            ["Financial Services (Large)", "72", "147", "+75 days", "18th"],
            ["Financial Services (All)", "85", "147", "+62 days", "23rd"],
            ["Cross-Industry (Large Cap)", "91", "147", "+56 days", "28th"],
            ["Regulated Industries", "68", "147", "+79 days", "15th"],
          ]}
        />
      </DetailSection>
      <DetailSection title="Historical Assessment Timeline">
        <DataTable
          headers={["Assessment", "Start Date", "Completion", "Cycle Length", "Response Rate"]}
          rows={[
            ["Q2 2025 Comprehensive", "Apr 12, 2025", "May 8, 2025", "26 days", "94%"],
            ["Q1 2025 Targeted", "Jan 15, 2025", "Feb 2, 2025", "18 days", "88%"],
            ["Q4 2024 Annual", "Oct 1, 2024", "Nov 14, 2024", "44 days", "96%"],
            ["Q3 2024 Delta", "Jul 8, 2024", "Jul 19, 2024", "11 days", "82%"],
          ]}
        />
      </DetailSection>
    </div>
  );
}

function ControlCoverageDetailView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border">
        <Shield className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">34 controls have gaps in test coverage</p>
          <p className="text-xs text-muted-foreground mt-1">Of 89 total controls in scope, 34 lack recent test results. 12 of these are classified as high-priority based on risk impact scoring and regulatory requirements.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Total Controls" value="89" sub="In scope for assessment" />
        <MetricCard label="Fully Tested" value="55" sub="62% coverage" />
        <MetricCard label="Missing Tests" value="34" sub="38% gap rate" accent />
        <MetricCard label="High-Priority Gaps" value="12" sub="Require immediate attention" accent />
      </div>
      <DetailSection title="High-Priority Control Gaps">
        <DataTable
          headers={["Control ID", "Control Name", "Domain", "Last Tested", "Risk Level", "Owner"]}
          rows={[
            ["CTL-007", "Vendor Access Review", "IT Security", "Never", "Critical", "Sarah Chen"],
            ["CTL-012", "Data Classification Enforcement", "Data Privacy", "189 days ago", "Critical", "James Park"],
            ["CTL-019", "Privileged Account Monitoring", "IT Security", "201 days ago", "Critical", "Priya Sharma"],
            ["CTL-023", "Business Continuity Plan Testing", "Operational", "312 days ago", "High", "Alex Morrison"],
            ["CTL-031", "Third-Party Risk Assessment", "Vendor Mgmt", "156 days ago", "High", "Oliver Wright"],
            ["CTL-034", "Change Management Approval", "IT Operations", "134 days ago", "High", "Nina Patel"],
            ["CTL-041", "Incident Response Drill", "Security", "245 days ago", "High", "Hans Mueller"],
            ["CTL-048", "Segregation of Duties Review", "Compliance", "178 days ago", "High", "Wei Zhang"],
            ["CTL-052", "Encryption Key Rotation", "IT Security", "289 days ago", "High", "Amy Lau"],
            ["CTL-056", "Regulatory Filing Validation", "Compliance", "167 days ago", "High", "Claire Dubois"],
            ["CTL-063", "Physical Access Control Audit", "Facilities", "223 days ago", "High", "Raj Anand"],
            ["CTL-071", "Anti-Money Laundering Screening", "Compliance", "198 days ago", "High", "Ciara O'Brien"],
          ]}
        />
      </DetailSection>
      <DetailSection title="Coverage by Domain">
        <DataTable
          headers={["Domain", "Total Controls", "Tested", "Gaps", "Coverage %"]}
          rows={[
            ["IT Security", "22", "14", "8", "64%"],
            ["Compliance", "18", "11", "7", "61%"],
            ["Operational", "16", "10", "6", "63%"],
            ["Data Privacy", "12", "7", "5", "58%"],
            ["Vendor Management", "11", "6", "5", "55%"],
            ["Financial", "10", "7", "3", "70%"],
          ]}
        />
      </DetailSection>
    </div>
  );
}

function EmergingRisksDetailView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">5 emerging risk signals detected since last assessment</p>
          <p className="text-xs text-red-600/80 dark:text-red-500/70 mt-1">3 regulatory changes and 2 vendor risk alerts have been identified through continuous monitoring that may impact your risk posture and control effectiveness.</p>
        </div>
      </div>
      <DetailSection title="Regulatory Changes">
        <div className="space-y-3">
          {[
            { title: "EU Digital Operational Resilience Act (DORA) — Enforcement Phase", date: "Effective Jan 17, 2025", impact: "Critical", desc: "Mandates ICT risk management, incident reporting, and third-party oversight for financial entities. 14 of your existing controls require updates to meet DORA testing requirements." },
            { title: "SEC Cybersecurity Disclosure Rules — Annual Reporting Update", date: "Effective Dec 15, 2024", impact: "High", desc: "Requires annual disclosure of cybersecurity risk management strategy. Board-level risk governance documentation needs enhancement." },
            { title: "NIST CSF 2.0 Framework Release", date: "Published Feb 26, 2025", impact: "Medium", desc: "Updated framework adds Govern function and supply chain risk management. 8 controls reference the prior version and should be remapped." },
          ].map((reg, i) => (
            <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-border">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-[#266C92]" />
                <span className="text-sm font-semibold text-foreground">{reg.title}</span>
                <Badge className={`text-[10px] h-4 ml-auto ${reg.impact === "Critical" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>{reg.impact}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mb-1">{reg.date}</p>
              <p className="text-xs text-foreground leading-relaxed">{reg.desc}</p>
            </div>
          ))}
        </div>
      </DetailSection>
      <DetailSection title="Vendor Risk Alerts">
        <div className="space-y-3">
          {[
            { vendor: "CloudPeak Infrastructure (Tier-1 Cloud Provider)", alert: "SOC 2 Type II report revealed 3 control deficiencies in access management", severity: "High", affected: "12 dependent services, 4 business units", action: "Vendor remediation plan due by Mar 15 — reassessment of shared controls recommended" },
            { vendor: "DataStream Analytics (Data Processing Partner)", alert: "Data breach notification — 2.3M records potentially exposed in partner environment", severity: "Critical", affected: "PII handling for EU/UK operations, 3 data flows impacted", action: "Incident response triggered — cross-border data impact assessment in progress" },
          ].map((v, i) => (
            <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-border">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-foreground">{v.vendor}</span>
                <Badge className={`text-[10px] h-4 ml-auto ${v.severity === "Critical" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>{v.severity}</Badge>
              </div>
              <p className="text-xs text-foreground mb-1">{v.alert}</p>
              <p className="text-[11px] text-muted-foreground">Affected: {v.affected}</p>
              <p className="text-[11px] text-[#266C92] dark:text-[#4da3c9] mt-1">{v.action}</p>
            </div>
          ))}
        </div>
      </DetailSection>
    </div>
  );
}

function KRIDriftDetailView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
        <Gauge className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">7 Key Risk Indicators have breached thresholds</p>
          <p className="text-xs text-amber-600/80 dark:text-amber-500/70 mt-1">These KRIs exceeded their defined tolerance levels in the past 30 days, signaling increased risk exposure that should be factored into the upcoming assessment.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Total KRIs Tracked" value="43" sub="Across all domains" />
        <MetricCard label="Within Tolerance" value="36" sub="84% healthy" />
        <MetricCard label="Breached" value="7" sub="16% need attention" accent />
        <MetricCard label="Avg. Drift" value="+23%" sub="Above threshold" />
      </div>
      <DetailSection title="KRI Breach Details">
        <DataTable
          headers={["KRI", "Domain", "Current Value", "Threshold", "Breach %", "Trend", "Days Breached"]}
          rows={[
            ["Vendor SLA Violations", "Vendor Mgmt", "14", "≤8 per month", "+75%", "↑ Worsening", "22"],
            ["Failed Login Attempts", "IT Security", "3,847", "≤2,000/day", "+92%", "↑ Worsening", "18"],
            ["Open Audit Findings >90d", "Compliance", "23", "≤15", "+53%", "→ Stable", "31"],
            ["Mean Time to Patch (Critical)", "IT Ops", "14.2 days", "≤7 days", "+103%", "↑ Worsening", "12"],
            ["Customer Complaint Rate", "Operational", "2.1%", "≤1.5%", "+40%", "↑ Rising", "8"],
            ["Capital Adequacy Ratio", "Financial", "11.8%", "≥12.5%", "-5.6%", "↓ Below min", "5"],
            ["Employee Turnover (Risk)", "People", "18.4%", "≤15%", "+23%", "→ Stable", "26"],
          ]}
        />
      </DetailSection>
    </div>
  );
}

function HistoricalPatternDetailView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border">
        <Brain className="w-5 h-5 text-[#266C92] mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Assessment performance analysis from last 8 cycles</p>
          <p className="text-xs text-muted-foreground mt-1">Historical data reveals patterns in completion times, response rates, and bottlenecks that can optimize the upcoming assessment's approach and timeline.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Avg. Cycle Time" value="23 days" sub="Last 8 assessments" />
        <MetricCard label="First-Pass Completion" value="78%" sub="Without reminders" />
        <MetricCard label="Avg. Response Rate" value="91%" sub="Across all locations" />
        <MetricCard label="Bottleneck Region" value="APAC" sub="Avg. +4 days delay" accent />
      </div>
      <DetailSection title="Cycle Performance History">
        <DataTable
          headers={["Assessment", "Type", "Cycle Time", "Response Rate", "First-Pass %", "Reminders Sent", "Escalations"]}
          rows={[
            ["Q2 2025", "Comprehensive", "26 days", "94%", "81%", "18", "2"],
            ["Q1 2025", "Targeted", "18 days", "88%", "72%", "24", "4"],
            ["Q4 2024", "Annual", "44 days", "96%", "85%", "12", "1"],
            ["Q3 2024", "Delta", "11 days", "82%", "69%", "28", "5"],
            ["Q2 2024", "Comprehensive", "28 days", "93%", "79%", "16", "2"],
            ["Q1 2024", "Targeted", "15 days", "87%", "74%", "22", "3"],
            ["Q4 2023", "Annual", "38 days", "95%", "83%", "14", "1"],
            ["Q3 2023", "Delta", "9 days", "80%", "66%", "31", "6"],
          ]}
        />
      </DetailSection>
      <DetailSection title="Response Time by Region">
        <DataTable
          headers={["Region", "Avg. Response Time", "Completion Rate", "Common Bottleneck", "Recommended Action"]}
          rows={[
            ["North America", "4.2 days", "95%", "Chicago Regional (IT delays)", "Pre-notify IT leads 48hrs prior"],
            ["EMEA", "5.8 days", "92%", "Frankfurt (language/translation)", "Provide bilingual survey option"],
            ["APAC", "8.1 days", "86%", "Singapore (timezone overlap)", "Stagger distribution timing"],
          ]}
        />
      </DetailSection>
    </div>
  );
}

function AutoAssessmentDetailView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-[#266C92]/5 dark:bg-[#266C92]/10 border border-[#266C92]/20">
        <Bot className="w-5 h-5 text-[#266C92] mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#266C92] dark:text-[#4da3c9]">42 items eligible for automated scoring — 47 require human survey</p>
          <p className="text-xs text-muted-foreground mt-1">The agent has analyzed all 89 risk items and determined which can be scored from existing data sources (control test results, KRI feeds, incident logs) versus which require subjective human judgment via distributed surveys.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Total Risk Items" value="89" sub="In assessment scope" />
        <MetricCard label="Auto-Assessable" value="42" sub="47% of total" accent />
        <MetricCard label="Survey Required" value="47" sub="53% of total" />
        <MetricCard label="Est. Time Saved" value="~68 hrs" sub="vs. fully manual" accent />
      </div>
      <DetailSection title="Auto-Assessment Data Sources">
        <DataTable
          headers={["Data Source", "Items Covered", "Data Freshness", "Confidence Level", "Last Updated"]}
          rows={[
            ["Control Test Results", "18 items", "Real-time", "High (95%+)", "Continuous feed"],
            ["KRI Dashboard Feeds", "11 items", "Daily refresh", "High (92%)", "Today, 6:00 AM"],
            ["Incident Management System", "7 items", "Real-time", "Medium (85%)", "Continuous feed"],
            ["Vendor Risk Scores", "4 items", "Weekly", "Medium (80%)", "Feb 28, 2026"],
            ["Compliance Monitoring", "2 items", "Daily", "High (90%)", "Today, 12:00 AM"],
          ]}
        />
      </DetailSection>
      <DetailSection title="Survey Distribution Breakdown">
        <DataTable
          headers={["Category", "Items", "Reason for Human Input", "Survey Type", "Est. Time per Response"]}
          rows={[
            ["Strategic Risk Assessment", "12", "Subjective business judgment required", "Likert + narrative", "25 min"],
            ["Emerging Risk Identification", "9", "Forward-looking scenarios — no historical data", "Scenario-based", "20 min"],
            ["Culture & Conduct Risk", "8", "Qualitative behavioral indicators", "Multi-choice + comment", "15 min"],
            ["Operational Resilience", "7", "Site-specific process knowledge needed", "Checklist + evidence", "30 min"],
            ["Third-Party Dependencies", "6", "Relationship-specific context", "Structured interview", "20 min"],
            ["Regulatory Horizon", "5", "Jurisdiction-specific interpretation", "Free-form + reference", "15 min"],
          ]}
        />
      </DetailSection>
    </div>
  );
}

function ConsolidateResultsView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
        <ListChecks className="w-5 h-5 text-emerald-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Unified Risk Register — Consolidated from all sources</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-500/70 mt-1">89 risk items merged from auto-scored data (42) and survey responses (47) into a single enterprise risk register with normalized scores.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Critical Risks" value="8" sub="Require immediate action" accent />
        <MetricCard label="High Risks" value="19" sub="Active monitoring" />
        <MetricCard label="Medium Risks" value="34" sub="Standard oversight" />
        <MetricCard label="Low Risks" value="28" sub="Accepted / within tolerance" />
      </div>
      <DetailSection title="Top Critical Risks">
        <DataTable
          headers={["Rank", "Risk Item", "Domain", "Score", "Source", "Owner", "Mitigation Status"]}
          rows={[
            ["1", "Supply Chain Single-Source Dependency", "Operational", "24/25", "Survey", "Sarah Chen", "Plan Required"],
            ["2", "Privileged Access Overprovisioning", "IT Security", "23/25", "Auto-Scored", "James Park", "In Progress"],
            ["3", "DORA Compliance Gap", "Regulatory", "22/25", "Auto-Scored", "Oliver Wright", "Plan Required"],
            ["4", "Data Breach Exposure (Vendor)", "Data Privacy", "22/25", "Survey", "Priya Sharma", "Active Response"],
            ["5", "Ransomware Recovery Capability", "IT Security", "21/25", "Survey", "Alex Morrison", "Testing Phase"],
          ]}
        />
      </DetailSection>
    </div>
  );
}

function TrendAnalysisView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Trend Analysis — Q1 2026 vs. Previous Cycles</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-500/70 mt-1">Comparative analysis across the last 4 assessment cycles reveals risk trajectory and emerging patterns.</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Overall Risk Score" value="3.2/5" sub="↑ 0.4 from Q2 2025" accent />
        <MetricCard label="New Risks Identified" value="7" sub="vs. 3 in prior cycle" />
        <MetricCard label="Risks Mitigated" value="5" sub="Closed since last cycle" />
        <MetricCard label="Trend Direction" value="Increasing" sub="Driven by IT & vendor risk" accent />
      </div>
      <DetailSection title="Risk Score Trajectory by Domain">
        <DataTable
          headers={["Domain", "Q3 2024", "Q4 2024", "Q1 2025", "Q2 2025", "Q1 2026", "Trend"]}
          rows={[
            ["IT Security", "2.8", "2.9", "3.1", "3.3", "3.7", "↑ Worsening"],
            ["Vendor Management", "2.4", "2.6", "2.8", "3.0", "3.4", "↑ Worsening"],
            ["Compliance", "3.2", "3.0", "2.9", "2.8", "2.7", "↓ Improving"],
            ["Operational", "2.6", "2.7", "2.7", "2.8", "3.0", "→ Stable"],
            ["Financial", "2.1", "2.0", "2.1", "2.0", "2.1", "→ Stable"],
            ["Strategic", "2.9", "3.0", "3.1", "3.2", "3.3", "↑ Rising"],
          ]}
        />
      </DetailSection>
    </div>
  );
}

function HeatMapView() {
  const cells = [
    { entity: "North America", domain: "IT Security", score: 4.1, level: "critical" },
    { entity: "North America", domain: "Vendor", score: 3.5, level: "high" },
    { entity: "North America", domain: "Compliance", score: 2.4, level: "medium" },
    { entity: "EMEA", domain: "IT Security", score: 3.3, level: "high" },
    { entity: "EMEA", domain: "Regulatory", score: 3.8, level: "critical" },
    { entity: "EMEA", domain: "Operational", score: 2.6, level: "medium" },
    { entity: "APAC", domain: "Vendor", score: 3.0, level: "high" },
    { entity: "APAC", domain: "Data Privacy", score: 3.6, level: "critical" },
    { entity: "APAC", domain: "Compliance", score: 2.2, level: "low" },
  ];
  const colorMap: Record<string, string> = {
    critical: "bg-red-500 text-white",
    high: "bg-amber-400 text-amber-900",
    medium: "bg-yellow-200 text-yellow-800",
    low: "bg-emerald-200 text-emerald-800",
  };
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30">
        <PieChart className="w-5 h-5 text-purple-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">Enterprise Risk Heat Map</p>
          <p className="text-xs text-purple-600/80 dark:text-purple-500/70 mt-1">Cross-reference of risk scores by entity and domain, highlighting concentrations of high-severity risks.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cells.map((c, i) => (
          <div key={i} className={`p-4 rounded-lg ${colorMap[c.level]} text-center`}>
            <p className="text-xs font-bold">{c.entity}</p>
            <p className="text-[11px] opacity-80">{c.domain}</p>
            <p className="text-lg font-bold mt-1">{c.score}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 justify-center text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Critical (≥3.5)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400" /> High (3.0–3.4)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-200 border" /> Medium (2.0–2.9)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-200 border" /> Low (&lt;2.0)</span>
      </div>
    </div>
  );
}

function ActionPlansView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-[#266C92]/5 dark:bg-[#266C92]/10 border border-[#266C92]/20">
        <Zap className="w-5 h-5 text-[#266C92] mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#266C92] dark:text-[#4da3c9]">Auto-Generated Mitigation Plans</p>
          <p className="text-xs text-muted-foreground mt-1">Agent-generated action plans for the 8 critical risks, with recommended owners, timelines, and control enhancements.</p>
        </div>
      </div>
      <DetailSection title="Critical Risk Action Plans">
        <DataTable
          headers={["Risk", "Proposed Action", "Owner", "Deadline", "Priority", "Status"]}
          rows={[
            ["Supply Chain Dependency", "Identify 2 alternate suppliers for Tier-1 components", "Sarah Chen", "Apr 30, 2026", "P1", "Draft"],
            ["Privileged Access", "Implement PAM tool + quarterly access review", "James Park", "Mar 31, 2026", "P1", "Draft"],
            ["DORA Compliance", "Gap analysis + remediation roadmap for ICT controls", "Oliver Wright", "May 15, 2026", "P1", "Draft"],
            ["Vendor Data Breach", "Enhanced due diligence + contractual SLA updates", "Priya Sharma", "Mar 15, 2026", "P1", "In Review"],
            ["Ransomware Recovery", "Tabletop exercise + backup validation drill", "Alex Morrison", "Apr 15, 2026", "P1", "Draft"],
          ]}
        />
      </DetailSection>
    </div>
  );
}

function BoardReportView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border">
        <FileText className="w-5 h-5 text-[#266C92] mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Board Report Draft — Q1 2026 Enterprise Risk Assessment</p>
          <p className="text-xs text-muted-foreground mt-1">Executive summary auto-generated from assessment data. Review and edit before distribution to board members.</p>
        </div>
      </div>
      <Card className="border border-slate-200 dark:border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground">Executive Summary</h3>
          <p className="text-sm text-foreground leading-relaxed">The Q1 2026 Enterprise Risk Assessment evaluated 89 risk items across 6 domains, spanning 3 regions and 12 locations. 42 items were auto-scored using existing data feeds, while 47 required human survey responses, achieving a 100% completion rate.</p>
          <p className="text-sm text-foreground leading-relaxed"><strong>Key finding:</strong> Overall enterprise risk score increased to 3.2/5.0 (from 2.8 in Q2 2025), driven primarily by elevated IT Security and Vendor Management exposures. 8 risks are classified as critical, up from 5 in the prior cycle.</p>
          <div className="grid grid-cols-3 gap-3 py-2">
            <MetricCard label="Overall Risk Score" value="3.2/5.0" sub="↑ 0.4 from prior" accent />
            <MetricCard label="Critical Risks" value="8" sub="↑ 3 from prior" />
            <MetricCard label="Completion Rate" value="100%" sub="All 89 items assessed" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Recommendations to the Board</h4>
          <ol className="text-sm text-foreground space-y-1.5 list-decimal list-inside">
            <li>Approve increased cybersecurity budget allocation for privileged access management</li>
            <li>Mandate quarterly vendor risk reassessment for all Tier-1 providers</li>
            <li>Establish DORA compliance task force with executive sponsorship</li>
            <li>Review and update risk appetite statement to reflect current threat landscape</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function ReassessmentView() {
  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-[#266C92]/5 dark:bg-[#266C92]/10 border border-[#266C92]/20">
        <RefreshCcw className="w-5 h-5 text-[#266C92] mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#266C92] dark:text-[#4da3c9]">Re-Assessment Schedule</p>
          <p className="text-xs text-muted-foreground mt-1">Proposed cadence for follow-up assessments based on risk severity and open action items.</p>
        </div>
      </div>
      <DetailSection title="Proposed Schedule">
        <DataTable
          headers={["Assessment Type", "Scope", "Frequency", "Next Due", "Items Covered", "Owner"]}
          rows={[
            ["Critical Risk Review", "8 critical items + action plan progress", "Monthly", "Apr 1, 2026", "8", "Sarah Chen"],
            ["High Risk Monitoring", "19 high-risk items — KRI checks", "Bi-weekly", "Mar 18, 2026", "19", "Michael Torres"],
            ["Comprehensive Re-Assessment", "Full enterprise scope (89 items)", "Quarterly", "Jun 1, 2026", "89", "Assessment Committee"],
            ["Vendor Risk Reassessment", "Tier-1 & Tier-2 vendors only", "Quarterly", "May 1, 2026", "15", "Oliver Wright"],
            ["Regulatory Impact Check", "DORA / SEC / NIST alignment", "Monthly", "Apr 1, 2026", "14", "Emma Scott"],
          ]}
        />
      </DetailSection>
    </div>
  );
}

export function ExecutiveReportView() {
  const totalControls = masterControlsList.length;
  const autoControls = masterControlsList.filter(c => c.dataSource === "connected").length;
  const manualControls = masterControlsList.filter(c => c.dataSource === "manual").length;
  const highExceptions = fieldworkExceptions.filter(e => e.severity === "high").length;
  const mediumExceptions = fieldworkExceptions.filter(e => e.severity === "medium").length;
  const passedControls = totalControls - fieldworkExceptions.length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-border pb-4">
        <h1 className="text-lg font-bold text-foreground" data-testid="report-title">Automated Control Testing — Executive Summary Report</h1>
        <p className="text-xs text-muted-foreground mt-1">SOX Compliance · FY2026 Q1 Testing Cycle · Generated March 13, 2026</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-slate-200 dark:border-border text-center">
          <p className="text-2xl font-bold text-foreground">{totalControls}</p>
          <p className="text-[10px] text-muted-foreground">Controls Tested</p>
        </div>
        <div className="p-3 rounded-lg border border-slate-200 dark:border-border text-center">
          <p className="text-2xl font-bold text-[#266C92]">{passedControls}</p>
          <p className="text-[10px] text-muted-foreground">Passed</p>
        </div>
        <div className="p-3 rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50/30 dark:bg-red-900/10 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{fieldworkExceptions.length}</p>
          <p className="text-[10px] text-muted-foreground">Exceptions</p>
        </div>
        <div className="p-3 rounded-lg border border-slate-200 dark:border-border text-center">
          <p className="text-2xl font-bold text-foreground">{Math.round((passedControls / totalControls) * 100)}%</p>
          <p className="text-[10px] text-muted-foreground">Pass Rate</p>
        </div>
      </div>

      <DetailSection title="Testing Scope & Coverage">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Testing Methodology</p>
              <p className="text-foreground font-medium">4-stage pipeline: Population → Sampling → Evidence → Testing</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Automation Coverage</p>
              <p className="text-foreground font-medium">{autoControls} automated ({Math.round((autoControls / totalControls) * 100)}%) · {manualControls} PBC manual ({Math.round((manualControls / totalControls) * 100)}%)</p>
            </div>
          </div>
          <DataTable
            headers={["Category", "Controls", "Method", "Status"]}
            rows={[
              ["IT General Controls", `${masterControlsList.filter(c => ["CTL-001","CTL-002","CTL-009","CTL-013","CTL-016","CTL-021","CTL-022"].includes(c.id)).length}`, "Connected Systems", "Complete"],
              ["Financial Controls", `${masterControlsList.filter(c => ["CTL-005","CTL-006","CTL-014","CTL-017","CTL-018","CTL-020","CTL-025"].includes(c.id)).length}`, "Connected + PBC", "Complete"],
              ["Compliance Controls", `${masterControlsList.filter(c => ["CTL-003","CTL-004","CTL-008","CTL-010","CTL-011","CTL-012","CTL-015","CTL-019","CTL-023","CTL-024"].includes(c.id)).length}`, "PBC + Connected", "Complete"],
            ]}
          />
        </div>
      </DetailSection>

      <DetailSection title="Connected Systems Used">
        <DataTable
          headers={["System", "Type", "Controls", "Data Retrieved"]}
          rows={[
            ["Okta IAM", "Identity & Access", "CTL-001, CTL-013", "Provisioning logs, access reviews"],
            ["SAP ERP", "Financial System", "CTL-005, CTL-006, CTL-017, CTL-018, CTL-020, CTL-025", "Journal entries, reconciliations, asset records"],
            ["ServiceNow", "ITSM", "CTL-002", "Change tickets, approval workflows"],
            ["CrowdStrike", "Security", "CTL-016, CTL-021, CTL-022", "Privilege escalations, admin access, network alerts"],
            ["Coupa", "Procurement", "CTL-008, CTL-012", "Payment authorizations, PO approvals"],
            ["AWS", "Cloud Infrastructure", "CTL-004", "Backup configurations, recovery tests"],
            ["Genetec", "Physical Security", "CTL-009", "Access logs, badge events"],
          ]}
        />
      </DetailSection>

      <DetailSection title={`Exceptions Summary (${fieldworkExceptions.length})`}>
        <div className="space-y-3">
          <div className="flex gap-3 mb-2">
            <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{highExceptions} High</Badge>
            <Badge className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{mediumExceptions} Medium</Badge>
          </div>
          {fieldworkExceptions.map(exc => (
            <div key={exc.id} className="p-3 rounded-lg border border-slate-200 dark:border-border">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-[9px] h-4 ${exc.severity === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{exc.severity}</Badge>
                <span className="text-[10px] font-mono font-semibold text-[#266C92]">{exc.controlId}</span>
                <span className="text-xs font-medium text-foreground">{exc.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{exc.summary}</p>
              <div className="flex gap-4 text-[10px]">
                <span className="text-muted-foreground">Samples: {exc.samplesTested} tested, <span className="text-red-500 font-medium">{exc.samplesFailed} failed</span></span>
              </div>
            </div>
          ))}
        </div>
      </DetailSection>

      <DetailSection title="Root Cause Analysis">
        <DataTable
          headers={["Exception", "Control", "Root Cause", "Recommendation"]}
          rows={fieldworkExceptions.map(exc => [
            exc.id,
            `${exc.controlId} — ${exc.controlName}`,
            exc.rootCause.length > 80 ? exc.rootCause.slice(0, 80) + "…" : exc.rootCause,
            exc.recommendation.length > 80 ? exc.recommendation.slice(0, 80) + "…" : exc.recommendation,
          ])}
        />
      </DetailSection>

      <DetailSection title="Remediation Timeline">
        <DataTable
          headers={["Exception", "Control", "Severity", "Response Due", "Re-Test Target"]}
          rows={fieldworkExceptions.map(exc => [
            exc.id,
            exc.controlId,
            exc.severity === "high" ? "High" : "Medium",
            exc.severity === "high" ? "10 business days" : "15 business days",
            exc.severity === "high" ? "Apr 15, 2026" : "May 1, 2026",
          ])}
        />
      </DetailSection>

      <DetailSection title="Conclusion & Recommendations">
        <div className="space-y-3 text-xs text-foreground leading-relaxed">
          <p>The Q1 FY2026 automated control testing cycle covered {totalControls} controls across IT General Controls, Financial Controls, and Compliance Controls. {autoControls} controls ({Math.round((autoControls / totalControls) * 100)}%) were tested via automated system connections, while {manualControls} controls ({Math.round((manualControls / totalControls) * 100)}%) required PBC-based evidence collection.</p>
          <p>{passedControls} controls ({Math.round((passedControls / totalControls) * 100)}%) passed all testing procedures. {fieldworkExceptions.length} exceptions were identified — {highExceptions} high severity and {mediumExceptions} medium severity. The high-severity exceptions involve unauthorized access provisioning, journal entry segregation failures, and vendor payment structuring — all requiring immediate management attention and formal remediation plans.</p>
          <p className="font-medium">Key Recommendations:</p>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
            <li>Escalate the 3 high-severity exceptions to the Audit Committee at the next scheduled meeting</li>
            <li>Request formal management responses within the prescribed timelines</li>
            <li>Schedule targeted re-testing for Q2 to validate remediation effectiveness</li>
            <li>Review automation rules in Okta and SAP that enable approval bypass</li>
            <li>Implement cumulative vendor spend monitoring to detect future structuring</li>
          </ul>
        </div>
      </DetailSection>
    </div>
  );
}

const fullScreenDetailViews: Record<string, { title: string; headerIcon: JSX.Element; render: () => JSX.Element }> = {
  "signal-benchmark": { title: "Industry Benchmark Analysis", headerIcon: <TrendingUp className="w-4 h-4 text-[#266C92]" />, render: () => <BenchmarkDetailView /> },
  "signal-controls": { title: "Control Coverage Analysis", headerIcon: <Shield className="w-4 h-4 text-[#266C92]" />, render: () => <ControlCoverageDetailView /> },
  "signal-emerging": { title: "Emerging Risk Signals", headerIcon: <AlertTriangle className="w-4 h-4 text-[#266C92]" />, render: () => <EmergingRisksDetailView /> },
  "signal-kri": { title: "KRI Drift Analysis", headerIcon: <Gauge className="w-4 h-4 text-[#266C92]" />, render: () => <KRIDriftDetailView /> },
  "signal-historical": { title: "Historical Assessment Patterns", headerIcon: <Brain className="w-4 h-4 text-[#266C92]" />, render: () => <HistoricalPatternDetailView /> },
  "signal-auto": { title: "Auto-Assessment Eligibility", headerIcon: <Bot className="w-4 h-4 text-[#266C92]" />, render: () => <AutoAssessmentDetailView /> },
  "ns-consolidate": { title: "Consolidated Risk Register", headerIcon: <ListChecks className="w-4 h-4 text-[#266C92]" />, render: () => <ConsolidateResultsView /> },
  "ns-analyze": { title: "Trend Analysis", headerIcon: <TrendingUp className="w-4 h-4 text-[#266C92]" />, render: () => <TrendAnalysisView /> },
  "ns-heatmap": { title: "Risk Heat Map", headerIcon: <PieChart className="w-4 h-4 text-[#266C92]" />, render: () => <HeatMapView /> },
  "ns-action-plans": { title: "Mitigation Action Plans", headerIcon: <Zap className="w-4 h-4 text-[#266C92]" />, render: () => <ActionPlansView /> },
  "ns-board-report": { title: "Board Report Draft", headerIcon: <FileText className="w-4 h-4 text-[#266C92]" />, render: () => <BoardReportView /> },
  "ns-reassess": { title: "Re-Assessment Schedule", headerIcon: <RefreshCcw className="w-4 h-4 text-[#266C92]" />, render: () => <ReassessmentView /> },
  "executive-report": { title: "Executive Testing Report", headerIcon: <FileText className="w-4 h-4 text-[#266C92]" />, render: () => <ExecutiveReportView /> },
};

function SynthesisBlock({ onComplete, sessionId, isReviewMode }: { onComplete: () => void; sessionId: string; isReviewMode?: boolean }) {
  const [phase, setPhase] = usePersistedBlockState<"thinking" | "signals" | "done">(sessionId, "synthesis", "phase", "thinking");
  const [visibleSignals, setVisibleSignals] = usePersistedBlockState<number>(sessionId, "synthesis", "visibleSignals", 0);
  const [signalClickCount, setSignalClickCount] = usePersistedBlockState<number>(sessionId, "synthesis", "signalClickCount", 0);
  const [skippedAtCompletion, setSkippedAtCompletion] = usePersistedBlockState<boolean | null>(sessionId, "synthesis", "skippedAtCompletion", null);

  useEffect(() => {
    if (phase === "thinking") {
      const timer = setTimeout(() => setPhase("signals"), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "signals" && visibleSignals < synthesisSignals.length) {
      const timer = setTimeout(() => setVisibleSignals((v) => v + 1), 400);
      return () => clearTimeout(timer);
    }
    if (phase === "signals" && visibleSignals === synthesisSignals.length) {
      const timer = setTimeout(() => setPhase("done"), 600);
      return () => clearTimeout(timer);
    }
  }, [phase, visibleSignals]);

  const openDetail = (viewId: string) => {
    if (!isReviewMode) {
      setSignalClickCount((c) => c + 1);
    }
    window.dispatchEvent(new CustomEvent("workflow-session:open-detail", { detail: { viewId } }));
  };

  const hasEngaged = signalClickCount > 0;

  const handleComplete = () => {
    setSkippedAtCompletion(!hasEngaged);
    onComplete();
  };

  return (
    <div className="space-y-4">
      {phase === "thinking" && (
        <div className="flex items-center gap-3 py-8 justify-center animate-pulse">
          <Brain className="w-5 h-5 text-[#266C92]" />
          <span className="text-sm text-muted-foreground">Analyzing company profile, historical data, and industry benchmarks...</span>
          <Loader2 className="w-4 h-4 text-[#266C92] animate-spin" />
        </div>
      )}

      {(phase === "signals" || phase === "done") && (
        <div className="space-y-2">
          {synthesisSignals.slice(0, visibleSignals).map((signal, i) => {
            const Icon = signal.icon;
            return (
              <button
                key={i}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border animate-in fade-in slide-in-from-bottom-2 duration-300 cursor-pointer transition-all group ${
                  signal.type === "recommendation"
                    ? "border-[#266C92]/30 bg-[#266C92]/5 dark:bg-[#266C92]/10 hover:border-[#266C92]/50 hover:bg-[#266C92]/10"
                    : "border-slate-200 dark:border-border bg-white dark:bg-card hover:border-[#266C92]/30 hover:bg-slate-50 dark:hover:bg-muted/30"
                }`}
                onClick={() => openDetail(signal.detailViewId)}
                data-testid={`signal-expand-${signal.detailViewId}`}
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                  signal.type === "recommendation" ? "bg-[#266C92]/15" : "bg-slate-100 dark:bg-slate-800"
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${signal.type === "recommendation" ? "text-[#266C92]" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${signal.type === "recommendation" ? "text-[#266C92] dark:text-[#4da3c9]" : "text-foreground"}`}>{signal.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{signal.detail}</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {signal.type === "recommendation" && (
                  <Badge className="text-[9px] h-4 bg-[#266C92] text-white shrink-0">Key Signal</Badge>
                )}
              </button>
            );
          })}
        </div>
      )}

      {phase === "done" && !isReviewMode && (
        <div className="pt-2 animate-in fade-in duration-500 space-y-2">
          {!hasEngaged && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400">You haven't reviewed any intelligence signals. Consider clicking on the findings above to understand the context before proceeding.</p>
            </div>
          )}
          <Button
            className={`w-full ${hasEngaged ? "bg-[#266C92] hover:bg-[#1e5a7a]" : "bg-amber-600 hover:bg-amber-700"} text-white`}
            onClick={handleComplete}
            data-testid="button-synthesis-continue"
          >
            {hasEngaged ? (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                View Assessment Templates
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Skip Intelligence Review & Continue
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function TemplateSelectionBlock({ onComplete, sessionId, isReviewMode }: { onComplete: () => void; sessionId: string; isReviewMode?: boolean }) {
  const [selected, setSelected] = usePersistedBlockState<string | null>(sessionId, "template-selection", "selected", null);

  const handleSelectTemplate = (id: string) => {
    if (isReviewMode) return;
    setSelected(id);
  };

  const selectedTemplate = templateOptions.find((t) => t.id === selected);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Based on the analysis, select an assessment approach:</p>
      <div className="space-y-2">
        {templateOptions.map((t) => (
          <button
            key={t.id}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              isReviewMode ? "cursor-default" : "cursor-pointer"
            } ${
              selected === t.id
                ? "border-[#266C92] bg-[#266C92]/5 dark:bg-[#266C92]/10 ring-1 ring-[#266C92]/30"
                : isReviewMode
                  ? "border-slate-200 dark:border-border opacity-50"
                  : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600"
            }`}
            onClick={() => handleSelectTemplate(t.id)}
            data-testid={`template-${t.id}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">{t.label}</span>
              {t.recommended && (
                <Badge className="text-[9px] h-4 bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]">Recommended</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{t.description}</p>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Bot className="w-3 h-3 text-[#266C92]" />{t.autoItems} auto-assessed</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.surveyItems} survey items</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{t.estimatedDays} days</span>
            </div>
          </button>
        ))}
      </div>

      {selected && selectedTemplate && !isReviewMode && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-lg border border-slate-200 dark:border-border overflow-hidden" data-testid="automation-awareness-panel">
            <div className="px-3 py-2 bg-slate-50 dark:bg-muted/20 border-b border-slate-200 dark:border-border">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#266C92]" />
                Automation Transparency
              </p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-border">
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bot className="w-3.5 h-3.5 text-[#266C92]" />
                  <span className="text-[11px] font-semibold text-[#266C92] dark:text-[#4da3c9]">Agent Handles</span>
                </div>
                <p className="text-xs text-foreground font-medium">{selectedTemplate.autoItems} risk items</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">Scored by AI from historical data and existing integrations</p>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Human Judgment</span>
                </div>
                <p className="text-xs text-foreground font-medium">{selectedTemplate.surveyItems} survey items</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">Sent to domain experts for nuanced evaluation</p>
              </div>
            </div>
            <div className="px-3 py-2 bg-amber-50/50 dark:bg-amber-950/10 border-t border-slate-200 dark:border-border">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Auto-assessed items use historical patterns and may not capture emerging risks. Survey items ensure domain experts weigh in on nuanced areas.
              </p>
            </div>
          </div>

          <Button
            className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white"
            onClick={onComplete}
            data-testid="button-proceed-assessment"
          >
            <ArrowRight className="w-4 h-4 mr-1.5" />
            Proceed with Assessment
          </Button>
        </div>
      )}
    </div>
  );
}

const scoringMethodImpact: Record<string, { description: string; confidence: "high" | "medium" | "low"; note: string }> = {
  "5x5": { description: "Prioritizes likelihood-weighted risk ranking with structured 5-level scales", confidence: "high", note: "Well-established pattern matching — agent has high accuracy with this methodology" },
  "3x3": { description: "Simplified risk categorization for rapid initial screening", confidence: "high", note: "Straightforward scoring — agent can reliably auto-score with minimal variance" },
  "quantitative": { description: "Dollar-impact estimation requiring financial data correlation", confidence: "medium", note: "Requires financial data validation — consider reviewing auto-scored items after completion" },
  "hybrid": { description: "Combines qualitative assessment with quantitative dollar impact analysis", confidence: "low", note: "Needs human calibration between qualitative and quantitative scales — higher variance in automated scoring" },
};

const confidenceColors = {
  high: { bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-800/30", text: "text-emerald-700 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  medium: { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800/30", text: "text-amber-700 dark:text-amber-400", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  low: { bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-800/30", text: "text-orange-700 dark:text-orange-400", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

function BaselineParamsBlock({ onComplete, sessionId, isReviewMode }: { onComplete: () => void; sessionId: string; isReviewMode?: boolean }) {
  const [assessmentName, setAssessmentName] = usePersistedBlockState(sessionId, "baseline-params", "assessmentName", "Q1 2026 Enterprise Risk Assessment");
  const [riskDomain, setRiskDomain] = usePersistedBlockState(sessionId, "baseline-params", "riskDomain", "operational");
  const [scoringMethod, setScoring] = usePersistedBlockState(sessionId, "baseline-params", "scoringMethod", "5x5");
  const [period, setPeriod] = usePersistedBlockState(sessionId, "baseline-params", "period", "quarterly");
  const [buttonReady, setButtonReady] = usePersistedBlockState<boolean>(sessionId, "baseline-params", "buttonReady", false);

  useEffect(() => {
    if (!buttonReady && !isReviewMode) {
      const timer = setTimeout(() => setButtonReady(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [buttonReady, isReviewMode]);

  const impact = scoringMethodImpact[scoringMethod];
  const colors = impact ? confidenceColors[impact.confidence] : null;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Assessment Name</Label>
        <Input value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} className="text-sm" data-testid="input-assessment-name" disabled={isReviewMode} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Risk Domain</Label>
          <Select value={riskDomain} onValueChange={setRiskDomain} disabled={isReviewMode}>
            <SelectTrigger className="text-sm" data-testid="select-risk-domain"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="strategic">Strategic</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="all">All Domains</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Scoring Methodology</Label>
          <Select value={scoringMethod} onValueChange={setScoring} disabled={isReviewMode}>
            <SelectTrigger className="text-sm" data-testid="select-scoring"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5x5">5×5 Matrix (Likelihood × Impact)</SelectItem>
              <SelectItem value="3x3">3×3 Simplified Matrix</SelectItem>
              <SelectItem value="quantitative">Quantitative (Dollar Impact)</SelectItem>
              <SelectItem value="hybrid">Hybrid (Qual + Quant)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {impact && colors && (
        <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border} animate-in fade-in duration-200`} data-testid="scoring-impact-preview">
          <div className="flex items-center gap-2 mb-1.5">
            <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-foreground">Methodology Impact</span>
            <Badge className={`text-[9px] h-4 ml-auto ${colors.badge}`}>
              {impact.confidence === "high" ? "High" : impact.confidence === "medium" ? "Medium" : "Low"} AI Confidence
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-1.5">{impact.description}</p>
          <p className={`text-[11px] ${colors.text} font-medium`}>{impact.note}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Assessment Period</Label>
        <Select value={period} onValueChange={setPeriod} disabled={isReviewMode}>
          <SelectTrigger className="text-sm" data-testid="select-period"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="semi-annual">Semi-Annual</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-3 rounded-lg bg-[#266C92]/5 dark:bg-[#266C92]/10 border border-[#266C92]/15">
        <p className="text-xs text-[#266C92] dark:text-[#4da3c9] font-medium mb-1">Agent will automatically:</p>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#266C92]" />Score 42 risk items from existing data sources</li>
          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#266C92]" />Generate survey questionnaires for 47 items requiring human input</li>
          <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#266C92]" />Map assessment recipients to organizational hierarchy</li>
        </ul>
      </div>

      {!isReviewMode && (
        <Button
          className={`w-full text-white transition-all ${buttonReady ? "bg-[#266C92] hover:bg-[#1e5a7a]" : "bg-[#266C92]/60 cursor-wait"}`}
          onClick={buttonReady ? onComplete : undefined}
          disabled={!buttonReady}
          data-testid="button-confirm-params"
        >
          {buttonReady ? (
            <>
              <ChevronRight className="w-4 h-4 mr-1.5" />
              Confirm Parameters
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Reviewing parameters...
            </>
          )}
        </Button>
      )}
    </div>
  );
}

const orgHierarchy = [
  {
    entity: "North America Holdings", icon: Building2,
    units: [
      { name: "US Operations", locations: [
        { name: "New York HQ", assignee: "Sarah Chen", reviewer: "Michael Torres" },
        { name: "Chicago Regional", assignee: "James Park", reviewer: "Lisa Wang" },
        { name: "San Francisco Tech", assignee: "Priya Sharma", reviewer: "David Kim" },
      ]},
      { name: "Canada Operations", locations: [
        { name: "Toronto Office", assignee: "Alex Morrison", reviewer: "Sarah Chen" },
        { name: "Vancouver Hub", assignee: "Nina Patel", reviewer: "Michael Torres" },
      ]},
    ],
  },
  {
    entity: "EMEA Group", icon: Building2,
    units: [
      { name: "UK & Ireland", locations: [
        { name: "London HQ", assignee: "Oliver Wright", reviewer: "Emma Scott" },
        { name: "Dublin Center", assignee: "Ciara O'Brien", reviewer: "Emma Scott" },
      ]},
      { name: "Continental Europe", locations: [
        { name: "Frankfurt Office", assignee: "Hans Mueller", reviewer: "Oliver Wright" },
        { name: "Paris Branch", assignee: "Claire Dubois", reviewer: "Oliver Wright" },
      ]},
    ],
  },
  {
    entity: "APAC Region", icon: Building2,
    units: [
      { name: "Greater China", locations: [
        { name: "Shanghai Office", assignee: "Wei Zhang", reviewer: "Jun Li" },
        { name: "Hong Kong Hub", assignee: "Amy Lau", reviewer: "Jun Li" },
      ]},
      { name: "Southeast Asia", locations: [
        { name: "Singapore Center", assignee: "Raj Anand", reviewer: "Wei Zhang" },
      ]},
    ],
  },
];

function OrgNode({ entity }: { entity: typeof orgHierarchy[0] }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = entity.icon;
  const totalLocations = entity.units.reduce((sum, u) => sum + u.locations.length, 0);
  return (
    <div className="border border-slate-200 dark:border-border rounded-lg" data-testid={`org-entity-${entity.entity}`}>
      <button className="w-full px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-muted/30 rounded-lg transition-colors" onClick={() => setExpanded(!expanded)}>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expanded ? "" : "-rotate-90"}`} />
        <Icon className="w-4 h-4 text-[#266C92]" />
        <span className="text-sm font-medium flex-1 text-left">{entity.entity}</span>
        <span className="text-xs text-muted-foreground">{totalLocations} recipients</span>
        <div className="w-4 h-4 rounded border-2 border-[#266C92] bg-[#266C92] flex items-center justify-center shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 ml-6">
          {entity.units.map((unit) => <UnitNode key={unit.name} unit={unit} />)}
        </div>
      )}
    </div>
  );
}

function UnitNode({ unit }: { unit: typeof orgHierarchy[0]["units"][0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button className="w-full px-2 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-muted/30 rounded transition-colors" onClick={() => setExpanded(!expanded)}>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expanded ? "" : "-rotate-90"}`} />
        <Users className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium flex-1 text-left">{unit.name}</span>
        <span className="text-[11px] text-muted-foreground">{unit.locations.length} locations</span>
      </button>
      {expanded && (
        <div className="ml-5 mt-1 space-y-1">
          {unit.locations.map((loc) => (
            <div key={loc.name} className="flex items-center gap-2 px-2 py-1.5 rounded bg-slate-50 dark:bg-muted/20 text-xs">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-medium min-w-0 truncate">{loc.name}</span>
              <span className="text-muted-foreground ml-auto shrink-0">{loc.assignee}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-[#266C92] dark:text-[#4da3c9] shrink-0">{loc.reviewer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DistributionBlock({ onComplete, sessionId, isReviewMode }: { onComplete: () => void; sessionId: string; isReviewMode?: boolean }) {
  const totalRecipients = orgHierarchy.reduce((sum, e) => sum + e.units.reduce((s, u) => s + u.locations.length, 0), 0);
  const totalLocationsCount = orgHierarchy.reduce((sum, e) => sum + e.units.reduce((s, u) => s + u.locations.length, 0), 0);
  const uniqueAssignees = new Set(orgHierarchy.flatMap(e => e.units.flatMap(u => u.locations.map(l => l.assignee)))).size;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{orgHierarchy.length} entities · {totalRecipients} survey recipients</span>
        <span className="text-[#266C92] dark:text-[#4da3c9] font-medium">All selected</span>
      </div>
      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border mb-2">
        <div className="flex items-center gap-2 text-xs">
          <Bot className="w-3.5 h-3.5 text-[#266C92]" />
          <span className="text-muted-foreground"><span className="font-medium text-foreground">42 items</span> will be auto-assessed by agents in parallel</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <Mail className="w-3.5 h-3.5 text-[#266C92]" />
          <span className="text-muted-foreground"><span className="font-medium text-foreground">47 items</span> distributed as surveys to the recipients below</span>
        </div>
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {orgHierarchy.map((entity) => <OrgNode key={entity.entity} entity={entity} />)}
      </div>

      {!isReviewMode && (
        <>
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/10 overflow-hidden" data-testid="distribution-accountability-summary">
            <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/30">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Distribution Scope Confirmation
              </p>
            </div>
            <div className="px-3 py-2.5 space-y-2">
              <p className="text-xs text-foreground leading-relaxed">
                You are authorizing the agent to distribute assessment surveys to <span className="font-semibold">{uniqueAssignees} people</span> across <span className="font-semibold">{totalLocationsCount} locations</span> in <span className="font-semibold">{orgHierarchy.length} entities</span>. Survey responses will be collected asynchronously.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Expected completion: ~18 business days based on your Comprehensive Assessment selection
              </p>
            </div>
          </div>

          <Button
            className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white"
            onClick={onComplete}
            data-testid="button-distribute"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Approve & Begin Distribution
          </Button>
        </>
      )}
    </div>
  );
}

const allLocations = orgHierarchy.flatMap(e => e.units.flatMap(u => u.locations.map(l => ({ ...l, entity: e.entity, unit: u.name }))));

interface TrackerRecipient {
  name: string;
  entity: string;
  assignee: string;
  status: "pending" | "sent" | "opened" | "in-progress" | "completed";
  progress: number;
  lastActivity: string;
}

function DistributionTracker({ onComplete, sessionId }: { onComplete: () => void; sessionId: string }) {
  const defaultRecipients = allLocations.map((l) => ({ name: l.name, entity: l.entity, assignee: l.assignee, status: "pending" as const, progress: 0, lastActivity: "" }));
  const [phase, setPhase] = usePersistedBlockState<"distributing" | "monitoring" | "complete">(sessionId, "tracking", "phase", "distributing");
  const [recipients, setRecipients] = usePersistedBlockState<TrackerRecipient[]>(sessionId, "tracking", "recipients", defaultRecipients);
  const [autoProgress, setAutoProgress] = usePersistedBlockState<number>(sessionId, "tracking", "autoProgress", 0);
  const [sentCount, setSentCount] = usePersistedBlockState<number>(sessionId, "tracking", "sentCount", 0);

  useEffect(() => {
    if (phase === "distributing" && sentCount < recipients.length) {
      const timer = setTimeout(() => {
        setSentCount((c) => c + 1);
        setRecipients((prev) => prev.map((r, i) => i === sentCount ? { ...r, status: "sent" as const, lastActivity: "Just now" } : r));
      }, 250);
      return () => clearTimeout(timer);
    }
    if (phase === "distributing" && sentCount === recipients.length) {
      const timer = setTimeout(() => {
        setAutoProgress(15);
        setPhase("monitoring");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, sentCount, recipients.length]);

  useEffect(() => {
    if (phase === "monitoring" && autoProgress < 42) {
      const timer = setTimeout(() => setAutoProgress((p) => Math.min(p + 3, 42)), 400);
      return () => clearTimeout(timer);
    }
  }, [phase, autoProgress]);

  useEffect(() => {
    if (phase !== "monitoring") return;
    const timer = setInterval(() => {
      setRecipients((prev) => {
        const pending = prev.filter((r) => r.status === "sent" || r.status === "opened" || r.status === "in-progress");
        if (pending.length === 0) {
          clearInterval(timer);
          return prev;
        }
        const target = pending[Math.floor(Math.random() * pending.length)];
        return prev.map((r) => {
          if (r.name !== target.name) return r;
          const nextStatus = r.status === "sent" ? "opened" : r.status === "opened" ? "in-progress" : "completed";
          const nextProg = nextStatus === "opened" ? 10 : nextStatus === "in-progress" ? 60 : 100;
          return { ...r, status: nextStatus as TrackerRecipient["status"], progress: nextProg, lastActivity: nextStatus === "completed" ? "Completed" : "Just now" };
        });
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [phase]);

  const completedSurveys = recipients.filter((r) => r.status === "completed").length;
  const totalSurveys = recipients.length;
  const autoComplete = autoProgress >= 42;
  const allDone = completedSurveys === totalSurveys && autoComplete;

  useEffect(() => {
    if (allDone && phase === "monitoring") {
      const timer = setTimeout(() => {
        setPhase("complete");
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allDone, phase, onComplete]);

  const statusIcon = (status: TrackerRecipient["status"]) => {
    switch (status) {
      case "pending": return <Clock className="w-3 h-3 text-slate-400" />;
      case "sent": return <Mail className="w-3 h-3 text-[#266C92]" />;
      case "opened": return <Eye className="w-3 h-3 text-amber-500" />;
      case "in-progress": return <Loader2 className="w-3 h-3 text-[#266C92] animate-spin" />;
      case "completed": return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
    }
  };

  const statusLabel = (status: TrackerRecipient["status"]) => {
    switch (status) {
      case "pending": return "Queued";
      case "sent": return "Sent";
      case "opened": return "Opened";
      case "in-progress": return "In Progress";
      case "completed": return "Complete";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg border border-slate-200 dark:border-border">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-[#266C92]" />
            <span className="text-xs font-semibold">Auto-Assessment</span>
            {autoComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
            <div className="h-full rounded-full bg-[#266C92] transition-all duration-500" style={{ width: `${(autoProgress / 42) * 100}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground">{autoProgress}/42 items scored</p>
        </div>
        <div className="p-3 rounded-lg border border-slate-200 dark:border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#266C92]" />
            <span className="text-xs font-semibold">Survey Responses</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${(completedSurveys / totalSurveys) * 100}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground">{completedSurveys}/{totalSurveys} responses collected</p>
        </div>
      </div>

      {phase === "monitoring" && !allDone && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
          <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Assessment in progress — monitored over time</p>
            <p className="text-[11px] text-amber-600/70 dark:text-amber-500/70">Responses will be collected asynchronously. You'll be notified as milestones are reached. The agent continues scoring auto-assessable items in parallel.</p>
          </div>
        </div>
      )}

      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        <div className="grid grid-cols-[1fr_5rem_4rem_5rem] gap-2 px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Location</span>
          <span>Assignee</span>
          <span>Status</span>
          <span>Progress</span>
        </div>
        {recipients.map((r) => (
          <div key={r.name} className="grid grid-cols-[1fr_5rem_4rem_5rem] gap-2 px-2 py-1.5 rounded text-xs items-center hover:bg-slate-50 dark:hover:bg-muted/20 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="truncate font-medium">{r.name}</span>
            </div>
            <span className="text-muted-foreground truncate">{r.assignee.split(" ")[0]}</span>
            <div className="flex items-center gap-1">
              {statusIcon(r.status)}
              <span className="text-[10px]">{statusLabel(r.status)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${r.status === "completed" ? "bg-emerald-500" : "bg-[#266C92]"}`} style={{ width: `${r.progress}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground w-6 text-right">{r.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      {phase === "complete" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 animate-in fade-in duration-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">All assessments complete — 42 auto-scored, {totalSurveys} survey responses collected</p>
        </div>
      )}
    </div>
  );
}

const nextStepActions = [
  { id: "consolidate", label: "Consolidate Risk Register", description: "Merge auto-scored and survey results into a unified enterprise risk register", icon: ListChecks, color: "bg-[#266C92]/10 text-[#266C92]", viewId: "ns-consolidate" },
  { id: "analyze", label: "Run Trend Analysis", description: "Compare current assessment against previous cycles and identify emerging patterns", icon: BarChart3, color: "bg-[#266C92]/10 text-[#266C92]", viewId: "ns-analyze" },
  { id: "heatmap", label: "Generate Risk Heat Map", description: "Visualize risk distribution across entities, domains, and severity levels", icon: Target, color: "bg-[#266C92]/10 text-[#266C92]", viewId: "ns-heatmap" },
  { id: "action-plans", label: "Create Action Plans", description: "Auto-generate mitigation plans for high-priority risks with owner assignments", icon: Zap, color: "bg-[#266C92]/10 text-[#266C92]", viewId: "ns-action-plans" },
  { id: "board-report", label: "Draft Board Report", description: "Generate executive summary with key findings, trends, and recommendations", icon: FileText, color: "bg-[#266C92]/10 text-[#266C92]", viewId: "ns-board-report" },
  { id: "reassess", label: "Schedule Re-assessment", description: "Set follow-up cadence for high-priority risks and open action items", icon: RefreshCcw, color: "bg-[#266C92]/10 text-[#266C92]", viewId: "ns-reassess" },
];

function NextStepsBlock() {
  const openDetail = (viewId: string) => {
    window.dispatchEvent(new CustomEvent("workflow-session:open-detail", { detail: { viewId } }));
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Assessment Complete</span>
        </div>
        <p className="text-xs text-emerald-600/80 dark:text-emerald-500/70">89 total risk items assessed — 42 automatically scored, 47 via survey collection across 12 locations in 3 regions.</p>
      </div>
      <p className="text-xs text-muted-foreground font-medium">What would you like to do next?</p>
      <div className="grid grid-cols-2 gap-2">
        {nextStepActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-border hover:border-[#266C92]/40 hover:bg-[#266C92]/5 transition-colors text-left cursor-pointer group"
              onClick={() => openDetail(action.viewId)}
              data-testid={`next-step-${action.id}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{action.description}</p>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const masterControlsList = [
  { id: "CTL-001", name: "Access Provisioning", category: "IT General Controls", riskLevel: "High", owner: "Sarah Chen", pbcOwner: "James Park", dataSource: "connected", system: "Okta IAM" },
  { id: "CTL-002", name: "Change Management", category: "IT General Controls", riskLevel: "High", owner: "Michael Torres", pbcOwner: "Lisa Wang", dataSource: "connected", system: "ServiceNow" },
  { id: "CTL-003", name: "Segregation of Duties", category: "IT General Controls", riskLevel: "Critical", owner: "Sarah Chen", pbcOwner: "David Kim", dataSource: "manual", system: null },
  { id: "CTL-004", name: "Backup & Recovery", category: "IT General Controls", riskLevel: "Medium", owner: "Priya Sharma", pbcOwner: "Alex Morrison", dataSource: "connected", system: "AWS CloudTrail" },
  { id: "CTL-005", name: "Journal Entry Approval", category: "Financial Controls", riskLevel: "Critical", owner: "Oliver Wright", pbcOwner: "Emma Scott", dataSource: "connected", system: "SAP ERP" },
  { id: "CTL-006", name: "Bank Reconciliation", category: "Financial Controls", riskLevel: "High", owner: "Claire Dubois", pbcOwner: "Hans Mueller", dataSource: "connected", system: "SAP ERP" },
  { id: "CTL-007", name: "Revenue Recognition", category: "Financial Controls", riskLevel: "Critical", owner: "Wei Zhang", pbcOwner: "Jun Li", dataSource: "manual", system: null },
  { id: "CTL-008", name: "Vendor Payment Authorization", category: "Financial Controls", riskLevel: "High", owner: "Amy Lau", pbcOwner: "Raj Anand", dataSource: "connected", system: "SAP ERP" },
  { id: "CTL-009", name: "Physical Access Controls", category: "Entity Level Controls", riskLevel: "Medium", owner: "Ciara O'Brien", pbcOwner: "Oliver Wright", dataSource: "connected", system: "Genetec Security" },
  { id: "CTL-010", name: "Incident Response", category: "IT General Controls", riskLevel: "High", owner: "Nina Patel", pbcOwner: "Michael Torres", dataSource: "manual", system: null },
  { id: "CTL-011", name: "Data Classification", category: "Entity Level Controls", riskLevel: "Medium", owner: "Alex Morrison", pbcOwner: "Sarah Chen", dataSource: "manual", system: null },
  { id: "CTL-012", name: "Procurement Approval", category: "Financial Controls", riskLevel: "High", owner: "Hans Mueller", pbcOwner: "Claire Dubois", dataSource: "connected", system: "Coupa" },
  { id: "CTL-013", name: "User Access Review", category: "IT General Controls", riskLevel: "High", owner: "David Kim", pbcOwner: "Priya Sharma", dataSource: "connected", system: "Okta IAM" },
  { id: "CTL-014", name: "Financial Close Process", category: "Financial Controls", riskLevel: "Critical", owner: "Emma Scott", pbcOwner: "Oliver Wright", dataSource: "manual", system: null },
  { id: "CTL-015", name: "Third-Party Risk Assessment", category: "Entity Level Controls", riskLevel: "High", owner: "Jun Li", pbcOwner: "Wei Zhang", dataSource: "manual", system: null },
  { id: "CTL-016", name: "Privilege Escalation Monitoring", category: "IT General Controls", riskLevel: "Critical", owner: "Raj Anand", pbcOwner: "Amy Lau", dataSource: "connected", system: "CrowdStrike" },
  { id: "CTL-017", name: "Inventory Valuation", category: "Financial Controls", riskLevel: "High", owner: "Claire Dubois", pbcOwner: "Hans Mueller", dataSource: "connected", system: "SAP ERP" },
  { id: "CTL-018", name: "Accounts Receivable Aging", category: "Financial Controls", riskLevel: "High", owner: "Oliver Wright", pbcOwner: "Emma Scott", dataSource: "connected", system: "SAP ERP" },
  { id: "CTL-019", name: "Payroll Processing Controls", category: "Financial Controls", riskLevel: "Critical", owner: "Amy Lau", pbcOwner: "Raj Anand", dataSource: "manual", system: null },
  { id: "CTL-020", name: "Fixed Asset Capitalization", category: "Financial Controls", riskLevel: "Medium", owner: "Wei Zhang", pbcOwner: "Jun Li", dataSource: "connected", system: "SAP ERP" },
  { id: "CTL-021", name: "Database Administrator Access", category: "IT General Controls", riskLevel: "Critical", owner: "Michael Torres", pbcOwner: "David Kim", dataSource: "connected", system: "CrowdStrike" },
  { id: "CTL-022", name: "Network Security Monitoring", category: "IT General Controls", riskLevel: "High", owner: "Nina Patel", pbcOwner: "Priya Sharma", dataSource: "connected", system: "CrowdStrike" },
  { id: "CTL-023", name: "Business Continuity Planning", category: "Entity Level Controls", riskLevel: "High", owner: "Ciara O'Brien", pbcOwner: "Alex Morrison", dataSource: "manual", system: null },
  { id: "CTL-024", name: "Whistleblower & Ethics Hotline", category: "Entity Level Controls", riskLevel: "Medium", owner: "Alex Morrison", pbcOwner: "Ciara O'Brien", dataSource: "manual", system: null },
  { id: "CTL-025", name: "Intercompany Eliminations", category: "Financial Controls", riskLevel: "Critical", owner: "Emma Scott", pbcOwner: "Claire Dubois", dataSource: "connected", system: "SAP ERP" },
];

const connectedSystems = [
  { id: "sys-1", name: "SAP ERP", type: "ERP", status: "connected", coverage: 7 },
  { id: "sys-2", name: "Okta IAM", type: "Identity", status: "connected", coverage: 2 },
  { id: "sys-3", name: "ServiceNow", type: "ITSM", status: "connected", coverage: 1 },
  { id: "sys-4", name: "AWS CloudTrail", type: "Cloud", status: "connected", coverage: 1 },
  { id: "sys-5", name: "Genetec Security", type: "Physical Security", status: "connected", coverage: 1 },
  { id: "sys-6", name: "Coupa", type: "Procurement", status: "connected", coverage: 1 },
  { id: "sys-7", name: "CrowdStrike", type: "Endpoint Security", status: "connected", coverage: 3 },
];

function ControlSelectionBlock({ onComplete, sessionId, isReviewMode }: { onComplete: () => void; sessionId: string; isReviewMode?: boolean }) {
  const [selection, setSelection] = usePersistedBlockState<"all" | "subset">(sessionId, "control-selection", "mode", "all");
  const [selectedIds, setSelectedIds] = usePersistedBlockState<string[]>(sessionId, "control-selection", "selectedIds", masterControlsList.map(c => c.id));
  const [filterCat, setFilterCat] = useState<string>("all");

  const categories = Array.from(new Set(masterControlsList.map(c => c.category)));
  const filtered = filterCat === "all" ? masterControlsList : masterControlsList.filter(c => c.category === filterCat);
  const connectedCount = masterControlsList.filter(c => selectedIds.includes(c.id) && c.dataSource === "connected").length;
  const manualCount = masterControlsList.filter(c => selectedIds.includes(c.id) && c.dataSource === "manual").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${selection === "all" ? "border-[#266C92] bg-[#266C92]/10 text-[#266C92]" : "border-slate-200 dark:border-border text-muted-foreground"}`}
          onClick={() => { setSelection("all"); setSelectedIds(masterControlsList.map(c => c.id)); }}
          data-testid="button-select-all-controls"
        >
          All Controls ({masterControlsList.length})
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${selection === "subset" ? "border-[#266C92] bg-[#266C92]/10 text-[#266C92]" : "border-slate-200 dark:border-border text-muted-foreground"}`}
          onClick={() => setSelection("subset")}
          data-testid="button-select-subset-controls"
        >
          Select Subset
        </button>
      </div>

      {selection === "subset" && (
        <div className="flex gap-2 items-center">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="h-7 text-xs w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
        <div className="grid grid-cols-[2rem_1fr_8rem_5rem_5rem] gap-2 px-3 py-1.5 bg-slate-50 dark:bg-muted/20 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0">
          <span></span><span>Control</span><span>Category</span><span>Risk</span><span>Source</span>
        </div>
        {filtered.map(c => {
          const isSelected = selectedIds.includes(c.id);
          return (
            <div key={c.id} className={`grid grid-cols-[2rem_1fr_8rem_5rem_5rem] gap-2 px-3 py-1.5 text-xs items-center border-t border-slate-100 dark:border-border/50 hover:bg-slate-50 dark:hover:bg-muted/10 ${!isSelected ? "opacity-40" : ""}`}>
              <input
                type="checkbox"
                checked={isSelected}
                disabled={selection === "all"}
                onChange={() => {
                  setSelectedIds(prev => isSelected ? prev.filter(id => id !== c.id) : [...prev, c.id]);
                }}
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#266C92] focus:ring-[#266C92]"
                data-testid={`checkbox-control-${c.id}`}
              />
              <div>
                <span className="font-medium">{c.id}</span>
                <span className="text-muted-foreground ml-1.5">{c.name}</span>
              </div>
              <span className="text-muted-foreground truncate">{c.category}</span>
              <Badge className={`text-[9px] h-4 ${c.riskLevel === "Critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : c.riskLevel === "High" ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>{c.riskLevel}</Badge>
              <span className={`text-[10px] ${c.dataSource === "connected" ? "text-[#266C92]" : "text-slate-500"}`}>
                {c.dataSource === "connected" ? "⚡ Auto" : "📋 Manual"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-2.5 rounded-lg bg-[#266C92]/5 border border-[#266C92]/20">
          <p className="text-lg font-bold text-[#266C92]">{selectedIds.length}</p>
          <p className="text-[10px] text-muted-foreground">Controls selected</p>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border">
          <p className="text-lg font-bold text-foreground">{connectedCount}</p>
          <p className="text-[10px] text-muted-foreground">Fully automated</p>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border">
          <p className="text-lg font-bold text-foreground">{manualCount}</p>
          <p className="text-[10px] text-muted-foreground">PBC required</p>
        </div>
      </div>

      {!isReviewMode && (
        <Button onClick={onComplete} disabled={selectedIds.length === 0} className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white disabled:opacity-50" data-testid="button-confirm-controls">
          <ListChecks className="w-4 h-4 mr-2" />
          {selectedIds.length === 0 ? "Select at least one control" : `Confirm ${selectedIds.length} Controls`}
        </Button>
      )}
    </div>
  );
}

function DataSourceConfigBlock({ onComplete, sessionId, isReviewMode }: { onComplete: () => void; sessionId: string; isReviewMode?: boolean }) {
  const [acknowledgedSystems, setAcknowledgedSystems] = usePersistedBlockState<string[]>(sessionId, "data-sources", "acknowledged", connectedSystems.map(s => s.id));
  const [autoPopulation, setAutoPopulation] = usePersistedBlockState<boolean>(sessionId, "data-sources", "autoPopulation", true);
  const [autoSampling, setAutoSampling] = usePersistedBlockState<boolean>(sessionId, "data-sources", "autoSampling", true);
  const [systemsExpanded, setSystemsExpanded] = useState(false);

  const allAcknowledged = acknowledgedSystems.length === connectedSystems.length;
  const enabledCount = acknowledgedSystems.length;
  const totalCoverage = connectedSystems.filter(s => acknowledgedSystems.includes(s.id)).reduce((sum, s) => sum + s.coverage, 0);

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-[#266C92]/5 border border-[#266C92]/20">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-4 h-4 text-[#266C92]" />
          <span className="text-xs font-semibold text-[#266C92]">Agent Capability Assessment</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Connected systems allow the agent to automatically query populations, extract samples, and collect evidence. Controls without system connections will follow the manual PBC request/response workflow.
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setSystemsExpanded(!systemsExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-border hover:border-[#266C92]/30 transition-colors bg-white dark:bg-card"
          data-testid="button-toggle-systems"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-muted/30 flex items-center justify-center">
              <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground">
                {enabledCount} of {connectedSystems.length} Systems Enabled
              </p>
              <p className="text-[10px] text-muted-foreground">
                {connectedSystems.filter(s => acknowledgedSystems.includes(s.id)).map(s => s.name).join(" · ")} — covering {totalCoverage} controls
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allAcknowledged && (
              <Badge className="text-[9px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">All Active</Badge>
            )}
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${systemsExpanded ? "rotate-180" : ""}`} />
          </div>
        </button>

        {systemsExpanded && (
          <div className="space-y-1.5 pl-2 animate-in slide-in-from-top-2 fade-in duration-200">
            {connectedSystems.map(sys => {
              const isAcked = acknowledgedSystems.includes(sys.id);
              return (
                <div key={sys.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-border hover:border-[#266C92]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#266C92]" />
                    <div>
                      <p className="text-xs font-medium">{sys.name}</p>
                      <p className="text-[10px] text-muted-foreground">{sys.type} · {sys.coverage} control{sys.coverage !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAcknowledgedSystems(prev => isAcked ? prev.filter(id => id !== sys.id) : [...prev, sys.id])}
                    className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${isAcked ? "bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]" : "bg-slate-100 dark:bg-muted/30 text-muted-foreground hover:bg-[#266C92]/10 hover:text-[#266C92]"}`}
                    data-testid={`button-ack-system-${sys.id}`}
                  >
                    {isAcked ? "✓ Enabled" : "Enable"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-border">
        <span className="text-xs font-semibold text-foreground">Automation Preferences</span>
        <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-border">
          <div>
            <p className="text-xs font-medium">Auto-populate populations</p>
            <p className="text-[10px] text-muted-foreground">Agent queries systems to build population sets automatically</p>
          </div>
          <button
            onClick={() => setAutoPopulation(!autoPopulation)}
            className={`w-8 h-4 rounded-full transition-colors ${autoPopulation ? "bg-[#266C92]" : "bg-slate-300 dark:bg-slate-600"}`}
          >
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoPopulation ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-border">
          <div>
            <p className="text-xs font-medium">Automated sampling</p>
            <p className="text-[10px] text-muted-foreground">Agent applies statistical sampling methodology to population data</p>
          </div>
          <button
            onClick={() => setAutoSampling(!autoSampling)}
            className={`w-8 h-4 rounded-full transition-colors ${autoSampling ? "bg-[#266C92]" : "bg-slate-300 dark:bg-slate-600"}`}
          >
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoSampling ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {!isReviewMode && (
        <Button
          onClick={onComplete}
          disabled={!allAcknowledged}
          className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white disabled:opacity-50"
          data-testid="button-confirm-datasources"
        >
          <Zap className="w-4 h-4 mr-2" />
          {allAcknowledged ? "Confirm Data Sources" : `Enable all systems to continue (${enabledCount}/${connectedSystems.length})`}
        </Button>
      )}
    </div>
  );
}

function PBCMappingBlock({ onComplete, sessionId, isReviewMode }: { onComplete: () => void; sessionId: string; isReviewMode?: boolean }) {
  const selectedIds = useWorkflowSessionStore(s => {
    const bs = s.runtimeStates[sessionId]?.blockStates?.["control-selection"];
    return (bs?.selectedIds as string[] | undefined) ?? masterControlsList.map(c => c.id);
  });

  const manualControls = masterControlsList.filter(c => selectedIds.includes(c.id) && c.dataSource === "manual");
  const autoControls = masterControlsList.filter(c => selectedIds.includes(c.id) && c.dataSource === "connected");
  const [pbcExpanded, setPbcExpanded] = useState(true);
  const [autoExpanded, setAutoExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-semibold text-foreground">PBC Distribution Required</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {manualControls.length} control{manualControls.length !== 1 ? "s" : ""} require manual evidence collection via PBC requests.
          The system has auto-mapped Control Owners and PBC Owners as recipients based on the master controls register.
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setPbcExpanded(!pbcExpanded)}
          className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          data-testid="button-toggle-pbc-controls"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-xs font-semibold text-foreground">PBC Request Recipients</span>
            <Badge className="text-[9px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{manualControls.length} requests</Badge>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${pbcExpanded ? "" : "-rotate-90"}`} />
        </button>
        {pbcExpanded && (
          <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden max-h-44 overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="grid grid-cols-[1fr_6rem_6rem] gap-2 px-3 py-1.5 bg-slate-50 dark:bg-muted/20 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0">
              <span>Control</span><span>Owner</span><span>PBC Owner</span>
            </div>
            {manualControls.map(c => (
              <div key={c.id} className="grid grid-cols-[1fr_6rem_6rem] gap-2 px-3 py-1.5 text-xs items-center border-t border-slate-100 dark:border-border/50">
                <span><span className="font-medium text-[#266C92]">{c.id}</span> <span className="text-muted-foreground">{c.name}</span></span>
                <span className="text-[10px] truncate">{c.owner}</span>
                <span className="text-[10px] truncate text-muted-foreground">{c.pbcOwner}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setAutoExpanded(!autoExpanded)}
          className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          data-testid="button-toggle-auto-controls"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-xs font-semibold text-foreground">Automated (No PBC needed)</span>
            <Badge className="text-[9px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{autoControls.length} automated</Badge>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${autoExpanded ? "" : "-rotate-90"}`} />
        </button>
        {autoExpanded && (
          <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden max-h-36 overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200">
            {autoControls.map(c => (
              <div key={c.id} className="flex items-center justify-between px-3 py-1.5 text-xs border-t first:border-t-0 border-slate-100 dark:border-border/50">
                <span><span className="font-medium text-foreground">{c.id}</span> <span className="text-muted-foreground">{c.name}</span></span>
                <span className="text-[10px] text-muted-foreground">⚡ {c.system}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-2.5 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {manualControls.length} PBC requests will be distributed to the mapped owners
          and {autoControls.length} controls will be tested automatically via system connections.
        </p>
      </div>

      {!isReviewMode && (
        <Button
          onClick={onComplete}
          className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white"
          data-testid="button-confirm-pbc-mapping"
        >
          <Send className="w-4 h-4 mr-2" />
          Confirm Mapping & Initiate Workflow
        </Button>
      )}
    </div>
  );
}

export type FieldworkStepStatus = "pending" | "running" | "waiting" | "complete" | "blocked";

export interface ControlWorkflowStatus {
  controlId: string;
  name: string;
  dataSource: "connected" | "manual";
  system: string | null;
  owner: string;
  steps: {
    population: FieldworkStepStatus;
    sampling: FieldworkStepStatus;
    evidence: FieldworkStepStatus;
    testing: FieldworkStepStatus;
  };
  overallProgress: number;
}

export interface FieldworkBlockRule {
  controlId: string;
  blockAtStep: keyof ControlWorkflowStatus["steps"];
  title: string;
  description: string;
  severity: "high" | "medium";
}

export interface FieldworkException {
  id: string;
  controlId: string;
  controlName: string;
  severity: "high" | "medium";
  title: string;
  summary: string;
  detail: string;
  samplesTested: number;
  samplesFailed: number;
  rootCause: string;
  recommendation: string;
  nextSteps: string[];
}

export const fieldworkExceptions: FieldworkException[] = [
  {
    id: "EXC-001",
    controlId: "CTL-001",
    controlName: "Access Provisioning",
    severity: "high",
    title: "Unauthorized Access Grants Without Approval",
    summary: "3 of 25 sampled provisioning events lacked documented manager approval before access was granted in Okta IAM.",
    detail: "During testing of the Access Provisioning control, the agent identified 3 instances where user accounts were provisioned with elevated privileges (Admin or Power User roles) without the required two-level approval chain. The affected grants occurred between Jan 15–Feb 2 and involved the Finance and IT departments. System logs confirm the approval workflow was bypassed via a direct API call, suggesting either a misconfigured automation rule or intentional circumvention.",
    samplesTested: 25,
    samplesFailed: 3,
    rootCause: "Automated provisioning script in the HR onboarding pipeline bypasses the standard Okta approval workflow for bulk provisioning requests exceeding 5 users.",
    recommendation: "Restrict bulk provisioning API access to require explicit approval tokens. Add detective control to flag any provisioning events that bypass the standard workflow.",
    nextSteps: ["Create formal issue in audit management system", "Assign remediation owner (IT Security Lead)", "Request management response within 15 business days", "Schedule re-test after remediation"],
  },
  {
    id: "EXC-002",
    controlId: "CTL-005",
    controlName: "Journal Entry Approval",
    severity: "high",
    title: "Post-Close Journal Entries Missing Segregation Review",
    summary: "5 of 40 sampled post-close journal entries were prepared and approved by the same individual, violating the segregation of duties requirement.",
    detail: "The testing agent flagged 5 manual journal entries posted during the Q3 and Q4 close periods where the preparer and approver were the same individual (Controller — M. Chen). These entries ranged from $45K to $1.2M and involved intercompany reclass and accrual adjustments. The SAP workflow shows the entries were approved via mobile, suggesting the dual-approval step was auto-bypassed due to a delegation rule active during the close window.",
    samplesTested: 40,
    samplesFailed: 5,
    rootCause: "Temporary delegation rule granted during quarter-end close periods allows the Controller to self-approve entries under $2M, overriding the standard dual-approval requirement.",
    recommendation: "Remove or restrict the delegation rule. Implement a hard block preventing self-approval regardless of delegation status for all entries above materiality threshold.",
    nextSteps: ["Create formal issue in audit management system", "Escalate to Audit Committee given financial reporting impact", "Request management action plan within 10 business days", "Assess impact on financial statement assertions"],
  },
  {
    id: "EXC-003",
    controlId: "CTL-013",
    controlName: "User Access Review",
    severity: "medium",
    title: "Stale Privileged Accounts Not Revoked During Quarterly Review",
    summary: "8 of 60 privileged accounts flagged as inactive (>90 days) were certified as 'appropriate' without investigation during the Q4 access review.",
    detail: "The quarterly User Access Review for Q4 revealed that 8 privileged accounts in Okta IAM had no login activity for over 90 days but were still certified as active and appropriate by their respective managers. The accounts span 3 departments (IT, Finance, HR) and include 2 accounts with Domain Admin privileges. Reviewer timestamps show all 8 certifications were completed within a 4-minute window, suggesting bulk approval without individual review.",
    samplesTested: 60,
    samplesFailed: 8,
    rootCause: "Access review tool allows bulk 'certify all' action without forcing individual account review. Reviewers are not presented with last-login data during the certification flow.",
    recommendation: "Disable bulk certification for privileged accounts. Surface last-login timestamps and risk indicators in the review interface. Require attestation comments for any account inactive >60 days.",
    nextSteps: ["Create formal issue in audit management system", "Assign remediation to IT Security team", "Request management response within 15 business days", "Verify revocation of the 8 flagged accounts"],
  },
  {
    id: "EXC-004",
    controlId: "CTL-008",
    controlName: "Vendor Payment Authorization",
    severity: "high",
    title: "Payments Executed Below Dual-Authorization Threshold Without Review",
    summary: "4 of 30 sampled vendor payments between $9,000–$9,900 appeared to be structured to avoid the $10,000 dual-authorization threshold.",
    detail: "During testing of the Vendor Payment Authorization control, the agent detected a pattern of payments to 2 vendors (TechServ Solutions and Global Consulting Partners) where invoices were consistently submitted just below the $10,000 dual-authorization threshold. 4 payments across Q3–Q4 showed identical timing patterns — submitted within 48 hours of each other to the same vendor. Coupa workflow logs confirm these payments only required single-signer approval, bypassing the dual-authorization requirement.",
    samplesTested: 30,
    samplesFailed: 4,
    rootCause: "No detective control exists to identify potential invoice splitting or structuring patterns. The $10,000 threshold is a hard cutoff with no lookback window for cumulative vendor spend.",
    recommendation: "Implement a rolling 30-day cumulative vendor spend check. Flag any vendor with 3+ payments within 10% of the dual-authorization threshold for mandatory secondary review.",
    nextSteps: ["Create formal issue in audit management system", "Refer to Fraud Risk team for preliminary assessment", "Request management response within 10 business days", "Expand sample to full population for the 2 flagged vendors"],
  },
  {
    id: "EXC-005",
    controlId: "CTL-016",
    controlName: "Privilege Escalation Monitoring",
    severity: "medium",
    title: "Temporary Privilege Escalations Not Reverted Within SLA",
    summary: "6 of 20 sampled temporary privilege escalations exceeded the 24-hour auto-revert SLA by an average of 5 days.",
    detail: "Testing of the Privilege Escalation Monitoring control identified 6 instances where temporary admin privileges were granted for production troubleshooting but were not reverted within the 24-hour policy window. The CrowdStrike monitoring agent detected the escalations but the auto-revert mechanism failed to trigger due to an exception list maintained by the SOC team. The longest escalation remained active for 12 days before manual intervention. None of the 6 cases had documented extension approvals.",
    samplesTested: 20,
    samplesFailed: 6,
    rootCause: "SOC team maintains a manual exception list that suppresses auto-revert for accounts flagged as 'active investigation.' No expiry or review cadence exists for the exception list entries.",
    recommendation: "Implement a maximum 72-hour cap on the SOC exception list with mandatory re-approval. Add automated alerting for any escalation exceeding SLA regardless of exception status.",
    nextSteps: ["Create formal issue in audit management system", "Assign remediation to SOC Team Lead", "Request management response within 15 business days", "Verify exception list has been purged of stale entries"],
  },
];

export const fieldworkBlockRules: FieldworkBlockRule[] = [
  {
    controlId: "CTL-003",
    blockAtStep: "evidence",
    title: "SoD Matrix Upload Required",
    description: "Segregation of Duties evidence collection paused — manual SoD matrix upload needed for 3 departments. Control owner must provide the current access conflict report.",
    severity: "high",
  },
  {
    controlId: "CTL-007",
    blockAtStep: "population",
    title: "PBC Response Overdue",
    description: "Revenue Recognition population extraction paused — PBC request to Jun Li has been pending for 3 business days. Escalation or manual data submission required to proceed.",
    severity: "high",
  },
  {
    controlId: "CTL-019",
    blockAtStep: "sampling",
    title: "Payroll Data Access Pending",
    description: "Payroll Processing sampling paused — HR payroll system requires additional authorization grant before sample selection can proceed. Approve access request to continue.",
    severity: "medium",
  },
];

const fieldworkStepOrder: (keyof ControlWorkflowStatus["steps"])[] = ["population", "sampling", "evidence", "testing"];

export function tickFieldworkStatuses(prev: ControlWorkflowStatus[], resolvedBlockIds?: Set<string>): ControlWorkflowStatus[] | null {
  let anyChange = false;
  const resolved = resolvedBlockIds ?? new Set<string>();
  const next = prev.map((ctrl) => {
    const steps = { ...ctrl.steps };
    const isAuto = ctrl.dataSource === "connected";
    const blockRule = fieldworkBlockRules.find(r => r.controlId === ctrl.controlId);
    for (const step of fieldworkStepOrder) {
      if (steps[step] === "complete") continue;
      if (steps[step] === "blocked") {
        if (resolved.has(ctrl.controlId)) {
          steps[step] = isAuto ? "running" : (step === "population" || step === "evidence" ? "waiting" : "running");
          anyChange = true;
        }
        break;
      }
      const prevIdx = fieldworkStepOrder.indexOf(step);
      const prevStep = prevIdx > 0 ? fieldworkStepOrder[prevIdx - 1] : null;
      if (prevStep && steps[prevStep] !== "complete") break;
      if (steps[step] === "pending") {
        if (blockRule && blockRule.blockAtStep === step && !resolved.has(ctrl.controlId)) {
          steps[step] = "blocked";
          anyChange = true;
          break;
        }
        steps[step] = isAuto ? "running" : (step === "population" || step === "evidence" ? "waiting" : "running");
        anyChange = true;
        break;
      }
      if (steps[step] === "running" || steps[step] === "waiting") {
        const speed = isAuto ? 0.7 : (steps[step] === "waiting" ? 0.08 : 0.15);
        if (Math.random() < speed) {
          steps[step] = "complete";
          anyChange = true;
        }
        break;
      }
    }
    const completedSteps = fieldworkStepOrder.filter((s) => steps[s] === "complete").length;
    const runningSteps = fieldworkStepOrder.filter((s) => steps[s] === "running" || steps[s] === "waiting").length;
    const overallProgress = Math.round(((completedSteps * 100) + (runningSteps * 40)) / 4);
    return { ...ctrl, steps, overallProgress };
  });
  return anyChange ? next : null;
}

function FieldworkExecutionBlock({ onComplete, sessionId }: { onComplete: () => void; sessionId: string }) {
  const selectedIds = useWorkflowSessionStore(s => {
    const bs = s.runtimeStates[sessionId]?.blockStates?.["control-selection"];
    return (bs?.selectedIds as string[] | undefined) ?? masterControlsList.map(c => c.id);
  });

  const defaultStatuses: ControlWorkflowStatus[] = masterControlsList
    .filter(c => selectedIds.includes(c.id))
    .map(c => ({
      controlId: c.id,
      name: c.name,
      dataSource: c.dataSource as "connected" | "manual",
      system: c.system,
      owner: c.owner,
      steps: { population: "pending" as const, sampling: "pending" as const, evidence: "pending" as const, testing: "pending" as const },
      overallProgress: 0,
    }))
    .sort((a, b) => (a.dataSource === "manual" ? 0 : 1) - (b.dataSource === "manual" ? 0 : 1));

  const [statuses, setStatuses] = usePersistedBlockState<ControlWorkflowStatus[]>(sessionId, "fieldwork-execution", "statuses", defaultStatuses);
  const [phase, setPhase] = usePersistedBlockState<"initializing" | "running" | "complete">(sessionId, "fieldwork-execution", "phase", "initializing");
  const [resolvedBlocks, setResolvedBlocks] = usePersistedBlockState<string[]>(sessionId, "fieldwork-execution", "resolvedBlocks", []);
  const resolvedSet = useMemo(() => new Set(resolvedBlocks), [resolvedBlocks]);

  useEffect(() => {
    if (phase === "initializing") {
      const timer = setTimeout(() => setPhase("running"), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "running") return;
    const timer = setInterval(() => {
      setStatuses((prev: ControlWorkflowStatus[]) => {
        const next = tickFieldworkStatuses(prev, resolvedSet);
        return next ?? prev;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [phase, resolvedSet]);

  const allComplete = statuses.every(s => fieldworkStepOrder.every(step => s.steps[step] === "complete"));

  useEffect(() => {
    if (allComplete && phase === "running") {
      const timer = setTimeout(() => { setPhase("complete"); onComplete(); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allComplete, phase, onComplete]);

  const completedControls = statuses.filter(s => s.overallProgress === 100).length;
  const autoControls = statuses.filter(s => s.dataSource === "connected");
  const manualControls = statuses.filter(s => s.dataSource === "manual");
  const autoComplete = autoControls.filter(s => s.overallProgress === 100).length;
  const manualComplete = manualControls.filter(s => s.overallProgress === 100).length;

  const exceptionControlIds = useMemo(() => new Set(fieldworkExceptions.map(e => e.controlId)), []);
  const exceptionsForControl = useCallback((controlId: string) => fieldworkExceptions.filter(e => e.controlId === controlId), []);

  const stepIcon = (status: string, controlId?: string, step?: string) => {
    if (step === "testing" && status === "complete" && exceptionControlIds.has(controlId ?? "")) {
      return <AlertTriangle className="w-3 h-3 text-red-500" />;
    }
    switch (status) {
      case "complete": return <CheckCircle2 className="w-3 h-3 text-[#266C92]" />;
      case "running": return <Loader2 className="w-3 h-3 text-[#266C92] animate-spin" />;
      case "waiting": return <Clock className="w-3 h-3 text-slate-400" />;
      case "blocked": return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {phase === "initializing" ? (
        <div className="flex flex-col items-center py-8 gap-3">
          <Loader2 className="w-8 h-8 text-[#266C92] animate-spin" />
          <p className="text-sm font-medium text-foreground">Initializing {statuses.length} parallel control workflows...</p>
          <p className="text-xs text-muted-foreground">Provisioning agents and connecting to data sources</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-border text-center">
              <p className="text-lg font-bold text-foreground">{completedControls}/{statuses.length}</p>
              <p className="text-[10px] text-muted-foreground">Controls Complete</p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10 text-center">
              <p className="text-lg font-bold text-foreground">{autoComplete}/{autoControls.length}</p>
              <p className="text-[10px] text-muted-foreground">Automated</p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10 text-center">
              <p className="text-lg font-bold text-foreground">{manualComplete}/{manualControls.length}</p>
              <p className="text-[10px] text-muted-foreground">PBC Workflow</p>
            </div>
            {phase === "complete" && (
              <div className="p-2.5 rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10 text-center">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{fieldworkExceptions.length}</p>
                <p className="text-[10px] text-muted-foreground">Exceptions</p>
              </div>
            )}
          </div>

          <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_3rem_3rem_3rem_3rem_3rem] gap-1 px-3 py-1.5 bg-slate-50 dark:bg-muted/20 text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Control</span><span className="text-center">Pop.</span><span className="text-center">Samp.</span><span className="text-center">Evid.</span><span className="text-center">Test</span><span className="text-center">%</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {statuses.map(ctrl => (
                <div key={ctrl.controlId} className={`grid grid-cols-[1fr_3rem_3rem_3rem_3rem_3rem] gap-1 px-3 py-1.5 text-xs items-center border-t border-slate-100 dark:border-border/50 hover:bg-slate-50 dark:hover:bg-muted/10 ${phase === "complete" && exceptionControlIds.has(ctrl.controlId) ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-[10px] font-mono font-medium ${phase === "complete" && exceptionControlIds.has(ctrl.controlId) ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>{ctrl.controlId}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{ctrl.name}</span>
                  </div>
                  {fieldworkStepOrder.map(step => (
                    <div key={step} className="flex justify-center">{stepIcon(ctrl.steps[step], ctrl.controlId, step)}</div>
                  ))}
                  <div className="flex items-center justify-center">
                    <span className={`text-[9px] font-medium ${ctrl.overallProgress === 100 ? (exceptionControlIds.has(ctrl.controlId) ? "text-red-500" : "text-[#266C92]") : "text-muted-foreground"}`}>{ctrl.overallProgress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
            <div className="flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 text-[#266C92] animate-spin" /><span>Agent running</span></div>
            <span>·</span>
            <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-slate-400" /><span>Waiting on PBC</span></div>
            <span>·</span>
            <div className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-[#266C92]" /><span>Complete</span></div>
            {phase === "complete" && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5 text-red-500" /><span>Exception</span></div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export const fieldworkNextStepActions = [
  { icon: "FileText", label: "Generate Executive Report", desc: "Full summary report with testing coverage, exceptions, and recommendations for audit committee", actionId: "executive-report" },
  { icon: "AlertTriangle", label: "Triage Exceptions", desc: `Review ${fieldworkExceptions.length} controls flagged with testing exceptions`, actionId: "triage-exceptions" },
  { icon: "Target", label: "Remediation Tracking", desc: "Assign and track remediation actions for failed controls", actionId: "remediation" },
  { icon: "FileText", label: "Review Testing Results", desc: "Examine agent-annotated workpapers and testing conclusions", actionId: "review-results" },
  { icon: "Users", label: "Share with Audit Committee", desc: "Prepare executive summary for committee review", actionId: "share-committee" },
  { icon: "RefreshCcw", label: "Schedule Re-test", desc: "Plan follow-up testing for remediated controls", actionId: "schedule-retest" },
];

const nextStepIconMap: Record<string, typeof FileText> = { FileText, AlertTriangle, Target, Users, RefreshCcw, BarChart3 };

function FieldworkNextStepsBlock() {
  const setFullScreenView = useWorkflowSessionStore((s) => s.setRuntime);

  return (
    <div className="grid grid-cols-2 gap-2">
      {fieldworkNextStepActions.map((a, i) => {
        const Icon = nextStepIconMap[a.icon] || FileText;
        return (
          <button
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-border hover:border-[#266C92]/30 hover:bg-[#266C92]/5 transition-all text-left group"
            data-testid={`fieldwork-next-step-${i}`}
            onClick={() => {
              if (a.actionId === "executive-report") {
                window.dispatchEvent(new CustomEvent("workflow-session:open-detail", { detail: { viewId: "executive-report" } }));
              }
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-[#266C92]/10">
              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-[#266C92]" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground group-hover:text-[#266C92]">{a.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function getFieldworkAutomationConfig(): WorkflowSessionConfig {
  return {
    id: "control-testing",
    title: "Automated Control Testing",
    blocks: [
      {
        id: "control-selection",
        title: "Control Selection",
        description: "Select which controls from the master list to include in this testing cycle",
        type: "human-input",
        render: ({ onComplete, sessionId, isReviewMode }) => <ControlSelectionBlock onComplete={onComplete} sessionId={sessionId} isReviewMode={isReviewMode} />,
      },
      {
        id: "data-sources",
        title: "Data Source Configuration",
        description: "Configure connected systems for automated population, sampling, and evidence collection",
        type: "human-input",
        render: ({ onComplete, sessionId, isReviewMode }) => <DataSourceConfigBlock onComplete={onComplete} sessionId={sessionId} isReviewMode={isReviewMode} />,
      },
      {
        id: "pbc-mapping",
        title: "PBC Owner Mapping",
        description: "Review auto-mapped Control Owners and PBC Owners for manual evidence collection requests",
        type: "human-input",
        render: ({ onComplete, sessionId, isReviewMode }) => <PBCMappingBlock onComplete={onComplete} sessionId={sessionId} isReviewMode={isReviewMode} />,
      },
      {
        id: "fieldwork-execution",
        title: "Fieldwork Execution",
        description: "Parallel agentic workflows executing the 4-step PBC pipeline across all selected controls",
        type: "automated",
        render: ({ onComplete, sessionId }) => <FieldworkExecutionBlock onComplete={onComplete} sessionId={sessionId} />,
      },
      {
        id: "fieldwork-next-steps",
        title: "Next Steps",
        description: "Fieldwork complete — review results and plan follow-up actions",
        type: "next-steps",
        render: () => <FieldworkNextStepsBlock />,
      },
    ],
  };
}

export function getRiskAssessmentConfig(): WorkflowSessionConfig {
  return {
    id: "risk-assessment",
    title: "Risk Assessment",
    blocks: [
      {
        id: "synthesis",
        title: "Intelligence Synthesis",
        description: "Agent analyzes company profile, historical data, and industry signals to inform the assessment approach",
        type: "automated",
        render: ({ onComplete, sessionId, isReviewMode }) => <SynthesisBlock onComplete={onComplete} sessionId={sessionId} isReviewMode={isReviewMode} />,
      },
      {
        id: "template-selection",
        title: "Assessment Approach",
        description: "Review synthesized intelligence and select an assessment template",
        type: "human-input",
        render: ({ onComplete, sessionId, isReviewMode }) => <TemplateSelectionBlock onComplete={onComplete} sessionId={sessionId} isReviewMode={isReviewMode} />,
      },
      {
        id: "baseline-params",
        title: "Assessment Configuration",
        description: "Confirm scope, scoring methodology, and assessment parameters",
        type: "human-input",
        render: ({ onComplete, sessionId, isReviewMode }) => <BaselineParamsBlock onComplete={onComplete} sessionId={sessionId} isReviewMode={isReviewMode} />,
      },
      {
        id: "distribution",
        title: "Distribution Setup",
        description: "Review auto-assembled org hierarchy of survey recipients and confirm distribution",
        type: "human-input",
        render: ({ onComplete, sessionId, isReviewMode }) => <DistributionBlock onComplete={onComplete} sessionId={sessionId} isReviewMode={isReviewMode} />,
      },
      {
        id: "tracking",
        title: "Assessment Execution",
        description: "Auto-assessment runs in parallel while survey responses are collected over time",
        type: "automated",
        render: ({ onComplete, sessionId }) => <DistributionTracker onComplete={onComplete} sessionId={sessionId} />,
      },
      {
        id: "next-steps",
        title: "Next Steps",
        description: "Assessment complete — choose follow-up actions",
        type: "next-steps",
        render: () => <NextStepsBlock />,
      },
    ],
  };
}
