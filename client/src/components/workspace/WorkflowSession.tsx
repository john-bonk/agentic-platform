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
  CircleDot,
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

  useEffect(() => {
    setActiveIndex(0);
    setCompletedIndices(new Set());
  }, [config.id]);

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

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-background animate-in slide-in-from-right-8 fade-in duration-300">
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
  );
}

interface SignalItem {
  icon: typeof Brain;
  label: string;
  detail: string;
  type: "insight" | "recommendation" | "data";
}

const synthesisSignals: SignalItem[] = [
  { icon: TrendingUp, label: "Industry Benchmark", detail: "Peer companies assess operational risk quarterly — your last cycle was 147 days ago", type: "data" },
  { icon: Shield, label: "Control Coverage", detail: "34 of 89 controls lack recent test results — 12 flagged as high-priority gaps", type: "insight" },
  { icon: AlertTriangle, label: "Emerging Risks", detail: "3 new regulatory changes and 2 vendor alerts detected since last assessment", type: "insight" },
  { icon: Gauge, label: "KRI Drift", detail: "7 key risk indicators have exceeded threshold tolerances in the past 30 days", type: "data" },
  { icon: Brain, label: "Historical Pattern", detail: "Previous assessments averaged 23-day cycle time with 78% first-pass completion rate", type: "data" },
  { icon: Bot, label: "Auto-Assessment Eligible", detail: "42 risk items can be automatically scored from existing data sources — 47 require human survey", type: "recommendation" },
];

const templateOptions = [
  { id: "comprehensive", label: "Comprehensive Assessment", description: "Full enterprise-wide risk evaluation across all domains, entities, and control frameworks", recommended: true, autoItems: 42, surveyItems: 47, estimatedDays: 18 },
  { id: "targeted", label: "Targeted Assessment", description: "Focused evaluation on high-priority risk areas and recently triggered alerts only", recommended: false, autoItems: 28, surveyItems: 15, estimatedDays: 7 },
  { id: "delta", label: "Delta Assessment", description: "Incremental review — only assess risks with material changes since last cycle", recommended: false, autoItems: 35, surveyItems: 12, estimatedDays: 5 },
];

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
      setTimeout(() => setPhase("done"), 600);
    }
  }, [phase, visibleSignals]);

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
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  signal.type === "recommendation"
                    ? "border-[#266C92]/30 bg-[#266C92]/5 dark:bg-[#266C92]/10"
                    : "border-slate-200 dark:border-border bg-white dark:bg-card"
                }`}
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                  signal.type === "recommendation" ? "bg-[#266C92]/15" : "bg-slate-100 dark:bg-slate-800"
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${signal.type === "recommendation" ? "text-[#266C92]" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${signal.type === "recommendation" ? "text-[#266C92] dark:text-[#4da3c9]" : "text-foreground"}`}>{signal.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{signal.detail}</p>
                </div>
                {signal.type === "recommendation" && (
                  <Badge className="text-[9px] h-4 bg-[#266C92] text-white shrink-0 ml-auto">Key Signal</Badge>
                )}
              </div>
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
      setTimeout(() => {
        setAutoProgress(15);
        setPhase("monitoring");
      }, 500);
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
      setTimeout(() => {
        setPhase("complete");
        onComplete();
      }, 1000);
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
  { id: "consolidate", label: "Consolidate Risk Register", description: "Merge auto-scored and survey results into a unified enterprise risk register", icon: FileText, color: "bg-[#266C92]/10 text-[#266C92]" },
  { id: "analyze", label: "Run Trend Analysis", description: "Compare current assessment against previous cycles and identify emerging patterns", icon: BarChart3, color: "bg-[#266C92]/10 text-[#266C92]" },
  { id: "heatmap", label: "Generate Risk Heat Map", description: "Visualize risk distribution across entities, domains, and severity levels", icon: Target, color: "bg-[#266C92]/10 text-[#266C92]" },
  { id: "action-plans", label: "Create Action Plans", description: "Auto-generate mitigation plans for high-priority risks with owner assignments", icon: Zap, color: "bg-[#266C92]/10 text-[#266C92]" },
  { id: "board-report", label: "Draft Board Report", description: "Generate executive summary with key findings, trends, and recommendations", icon: FileText, color: "bg-[#266C92]/10 text-[#266C92]" },
  { id: "reassess", label: "Schedule Re-assessment", description: "Set follow-up cadence for high-priority risks and open action items", icon: RefreshCcw, color: "bg-[#266C92]/10 text-[#266C92]" },
];

function NextStepsBlock() {
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
            <button key={action.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-border hover:border-[#266C92]/40 hover:bg-[#266C92]/5 transition-colors text-left cursor-pointer" data-testid={`next-step-${action.id}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{action.description}</p>
              </div>
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
