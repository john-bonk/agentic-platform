import { useState, useEffect, useCallback, useRef } from "react";
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
}

export interface WorkflowSessionConfig {
  id: string;
  title: string;
  blocks: WorkflowBlock[];
}

interface WorkflowSessionProps {
  config: WorkflowSessionConfig;
  onBack: () => void;
}

function BlockWrapper({
  block,
  index,
  activeIndex,
  completedIndices,
  onComplete,
  isLast,
}: {
  block: WorkflowBlock;
  index: number;
  activeIndex: number;
  completedIndices: Set<number>;
  onComplete: () => void;
  isLast: boolean;
}) {
  const isActive = index === activeIndex;
  const isCompleted = completedIndices.has(index);
  const isFuture = index > activeIndex;
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && blockRef.current) {
      blockRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isActive]);

  return (
    <div
      ref={blockRef}
      className={`transition-all duration-500 ease-in-out ${
        isActive ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
      }`}
      data-testid={`workflow-block-${block.id}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center shrink-0 pt-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              isCompleted
                ? "bg-[#266C92] text-white"
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
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`text-sm font-semibold transition-colors ${
                isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
              }`}
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
          </div>
          <p className="text-xs text-muted-foreground mb-3">{block.description}</p>

          {isActive && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <Card className="border border-slate-200 dark:border-border">
                <CardContent className="p-4">
                  {block.render({ onComplete, isActive })}
                </CardContent>
              </Card>
            </div>
          )}

          {isCompleted && (
            <div className="text-xs text-muted-foreground italic">Step completed</div>
          )}

          {isFuture && !isCompleted && (
            <div className="h-2" />
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkflowSession({ config, onBack }: WorkflowSessionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [fullScreenView, setFullScreenView] = useState<string | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setCompletedIndices(new Set());
    setFullScreenView(null);
  }, [config.id]);

  useEffect(() => {
    const handler = (e: Event) => {
      const viewId = (e as CustomEvent).detail?.viewId;
      if (viewId && fullScreenDetailViews[viewId]) {
        setFullScreenView(viewId);
      }
    };
    window.addEventListener("workflow-session:open-detail", handler);
    return () => window.removeEventListener("workflow-session:open-detail", handler);
  }, []);

  useEffect(() => {
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
    setCompletedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    if (index < config.blocks.length - 1) {
      setTimeout(() => setActiveIndex(index + 1), 400);
    }
  }, [config.blocks]);

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
          <span>Back</span>
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

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl mx-auto">
          {config.blocks.map((block, index) => (
            <BlockWrapper
              key={block.id}
              isLast={index === config.blocks.length - 1}
              block={block}
              index={index}
              activeIndex={activeIndex}
              completedIndices={completedIndices}
              onComplete={() => completeBlock(index)}
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
      <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
        <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">34 controls have gaps in test coverage</p>
          <p className="text-xs text-amber-600/80 dark:text-amber-500/70 mt-1">Of 89 total controls in scope, 34 lack recent test results. 12 of these are classified as high-priority based on risk impact scoring and regulatory requirements.</p>
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
                <Badge className={`text-[10px] h-4 ml-auto ${reg.impact === "Critical" ? "bg-red-100 text-red-700" : reg.impact === "High" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{reg.impact}</Badge>
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
                <Badge className={`text-[10px] h-4 ml-auto ${v.severity === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{v.severity}</Badge>
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
};

function SynthesisBlock({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"thinking" | "signals" | "done">("thinking");
  const [visibleSignals, setVisibleSignals] = useState(0);

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
    window.dispatchEvent(new CustomEvent("workflow-session:open-detail", { detail: { viewId } }));
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

      {phase === "done" && (
        <div className="pt-2 animate-in fade-in duration-500">
          <Button
            className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white"
            onClick={onComplete}
            data-testid="button-synthesis-continue"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            View Assessment Templates
          </Button>
        </div>
      )}
    </div>
  );
}

function TemplateSelectionBlock({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Based on the analysis, select an assessment approach:</p>
      <div className="space-y-2">
        {templateOptions.map((t) => (
          <button
            key={t.id}
            className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
              selected === t.id
                ? "border-[#266C92] bg-[#266C92]/5 dark:bg-[#266C92]/10 ring-1 ring-[#266C92]/30"
                : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600"
            }`}
            onClick={() => setSelected(t.id)}
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

      {selected && (
        <Button
          className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white animate-in fade-in duration-300"
          onClick={onComplete}
          data-testid="button-proceed-assessment"
        >
          <ArrowRight className="w-4 h-4 mr-1.5" />
          Proceed with Assessment
        </Button>
      )}
    </div>
  );
}

function BaselineParamsBlock({ onComplete }: { onComplete: () => void }) {
  const [assessmentName, setAssessmentName] = useState("Q1 2026 Enterprise Risk Assessment");
  const [riskDomain, setRiskDomain] = useState("operational");
  const [scoringMethod, setScoring] = useState("5x5");
  const [period, setPeriod] = useState("quarterly");

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Assessment Name</Label>
        <Input value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} className="text-sm" data-testid="input-assessment-name" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Risk Domain</Label>
          <Select value={riskDomain} onValueChange={setRiskDomain}>
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
          <Select value={scoringMethod} onValueChange={setScoring}>
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
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Assessment Period</Label>
        <Select value={period} onValueChange={setPeriod}>
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

      <Button className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white" onClick={onComplete} data-testid="button-confirm-params">
        <ChevronRight className="w-4 h-4 mr-1.5" />
        Confirm Parameters
      </Button>
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

function DistributionBlock({ onComplete }: { onComplete: () => void }) {
  const totalRecipients = orgHierarchy.reduce((sum, e) => sum + e.units.reduce((s, u) => s + u.locations.length, 0), 0);
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
      <Button className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white" onClick={onComplete} data-testid="button-distribute">
        <Send className="w-4 h-4 mr-1.5" />
        Approve & Begin Distribution
      </Button>
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

function DistributionTracker({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"distributing" | "monitoring" | "complete">("distributing");
  const [recipients, setRecipients] = useState<TrackerRecipient[]>(
    allLocations.map((l) => ({ name: l.name, entity: l.entity, assignee: l.assignee, status: "pending" as const, progress: 0, lastActivity: "" }))
  );
  const [autoProgress, setAutoProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);

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
        render: ({ onComplete }) => <SynthesisBlock onComplete={onComplete} />,
      },
      {
        id: "template-selection",
        title: "Assessment Approach",
        description: "Review synthesized intelligence and select an assessment template",
        type: "human-input",
        render: ({ onComplete }) => <TemplateSelectionBlock onComplete={onComplete} />,
      },
      {
        id: "baseline-params",
        title: "Assessment Configuration",
        description: "Confirm scope, scoring methodology, and assessment parameters",
        type: "human-input",
        render: ({ onComplete }) => <BaselineParamsBlock onComplete={onComplete} />,
      },
      {
        id: "distribution",
        title: "Distribution Setup",
        description: "Review auto-assembled org hierarchy of survey recipients and confirm distribution",
        type: "human-input",
        render: ({ onComplete }) => <DistributionBlock onComplete={onComplete} />,
      },
      {
        id: "tracking",
        title: "Assessment Execution",
        description: "Auto-assessment runs in parallel while survey responses are collected over time",
        type: "automated",
        render: ({ onComplete }) => <DistributionTracker onComplete={onComplete} />,
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
