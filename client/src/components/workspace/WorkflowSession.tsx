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
  Play,
  Zap,
  FileText,
  BarChart3,
  Target,
  RefreshCcw,
  CircleDot,
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
                In Progress
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

  const completeBlock = useCallback((index: number) => {
    setCompletedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    if (index < config.blocks.length - 1) {
      setTimeout(() => setActiveIndex(index + 1), 400);
    }
  }, [config.blocks.length]);

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

const orgHierarchy = [
  {
    entity: "North America Holdings",
    icon: Building2,
    units: [
      {
        name: "US Operations",
        locations: [
          { name: "New York HQ", assignee: "Sarah Chen", reviewer: "Michael Torres" },
          { name: "Chicago Regional", assignee: "James Park", reviewer: "Lisa Wang" },
          { name: "San Francisco Tech", assignee: "Priya Sharma", reviewer: "David Kim" },
        ],
      },
      {
        name: "Canada Operations",
        locations: [
          { name: "Toronto Office", assignee: "Alex Morrison", reviewer: "Sarah Chen" },
          { name: "Vancouver Hub", assignee: "Nina Patel", reviewer: "Michael Torres" },
        ],
      },
    ],
  },
  {
    entity: "EMEA Group",
    icon: Building2,
    units: [
      {
        name: "UK & Ireland",
        locations: [
          { name: "London HQ", assignee: "Oliver Wright", reviewer: "Emma Scott" },
          { name: "Dublin Center", assignee: "Ciara O'Brien", reviewer: "Emma Scott" },
        ],
      },
      {
        name: "Continental Europe",
        locations: [
          { name: "Frankfurt Office", assignee: "Hans Mueller", reviewer: "Oliver Wright" },
          { name: "Paris Branch", assignee: "Claire Dubois", reviewer: "Oliver Wright" },
        ],
      },
    ],
  },
  {
    entity: "APAC Region",
    icon: Building2,
    units: [
      {
        name: "Greater China",
        locations: [
          { name: "Shanghai Office", assignee: "Wei Zhang", reviewer: "Jun Li" },
          { name: "Hong Kong Hub", assignee: "Amy Lau", reviewer: "Jun Li" },
        ],
      },
      {
        name: "Southeast Asia",
        locations: [
          { name: "Singapore Center", assignee: "Raj Anand", reviewer: "Wei Zhang" },
        ],
      },
    ],
  },
];

function OrgNode({ entity }: { entity: typeof orgHierarchy[0] }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = entity.icon;
  const totalLocations = entity.units.reduce((sum, u) => sum + u.locations.length, 0);

  return (
    <div className="border border-slate-200 dark:border-border rounded-lg" data-testid={`org-entity-${entity.entity}`}>
      <button
        className="w-full px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-muted/30 rounded-lg transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
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
          {entity.units.map((unit) => (
            <UnitNode key={unit.name} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}

function UnitNode({ unit }: { unit: typeof orgHierarchy[0]["units"][0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        className="w-full px-2 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-muted/30 rounded transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
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

function DistributionTracker({ onComplete }: { onComplete: () => void }) {
  const [sent, setSent] = useState(0);
  const [responded, setResponded] = useState(0);
  const total = 12;
  const [phase, setPhase] = useState<"sending" | "collecting" | "done">("sending");

  useEffect(() => {
    if (phase === "sending" && sent < total) {
      const timer = setTimeout(() => setSent((s) => s + 1), 300);
      return () => clearTimeout(timer);
    }
    if (phase === "sending" && sent === total) {
      setTimeout(() => setPhase("collecting"), 600);
    }
  }, [sent, phase]);

  useEffect(() => {
    if (phase === "collecting" && responded < total) {
      const timer = setTimeout(() => setResponded((r) => r + 1), 500);
      return () => clearTimeout(timer);
    }
    if (phase === "collecting" && responded === total) {
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 800);
    }
  }, [responded, phase, onComplete]);

  const pct = phase === "sending" ? (sent / total) * 50 : 50 + (responded / total) * 50;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {phase !== "done" ? (
            <Loader2 className="w-4 h-4 text-[#266C92] animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-[#266C92]" />
          )}
          <span className="text-sm font-medium">
            {phase === "sending" && "Distributing assessment requests..."}
            {phase === "collecting" && "Collecting responses..."}
            {phase === "done" && "All responses collected"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{Math.round(pct)}%</span>
      </div>

      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#266C92] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2.5 rounded-lg bg-slate-50 dark:bg-muted/30">
          <p className="text-lg font-bold text-foreground">{sent}/{total}</p>
          <p className="text-[11px] text-muted-foreground">Sent</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-slate-50 dark:bg-muted/30">
          <p className="text-lg font-bold text-[#266C92]">{responded}/{total}</p>
          <p className="text-[11px] text-muted-foreground">Responded</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-slate-50 dark:bg-muted/30">
          <p className="text-lg font-bold text-foreground">{total - responded}</p>
          <p className="text-[11px] text-muted-foreground">Pending</p>
        </div>
      </div>

      {phase !== "done" && (
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {Array.from({ length: Math.min(sent, 5) }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CircleDot className="w-3 h-3 text-[#266C92]" />
              <span>{orgHierarchy.flatMap(e => e.units.flatMap(u => u.locations))[i % 12]?.name || "Location"}</span>
              <span className="ml-auto">{i < responded ? "✓ Responded" : "Awaiting..."}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const nextStepActions = [
  { id: "consolidate", label: "Consolidate Results", description: "Merge all responses into a unified risk register", icon: FileText, color: "bg-[#266C92]/10 text-[#266C92]" },
  { id: "analyze", label: "Run Trend Analysis", description: "Compare against previous assessment cycles", icon: BarChart3, color: "bg-[#266C92]/10 text-[#266C92]" },
  { id: "score", label: "Generate Risk Scores", description: "Auto-calculate risk ratings from collected data", icon: Target, color: "bg-[#266C92]/10 text-[#266C92]" },
  { id: "reassess", label: "Schedule Re-assessment", description: "Set follow-up cadence for high-priority risks", icon: RefreshCcw, color: "bg-[#266C92]/10 text-[#266C92]" },
];

export function getRiskAssessmentConfig(): WorkflowSessionConfig {
  return {
    id: "risk-assessment",
    title: "Risk Assessment",
    blocks: [
      {
        id: "baseline-params",
        title: "Assessment Configuration",
        description: "Define the scope and parameters for this risk assessment cycle",
        type: "human-input",
        render: ({ onComplete }) => <BaselineParamsBlock onComplete={onComplete} />,
      },
      {
        id: "distribution",
        title: "Distribution Setup",
        description: "Review and confirm the organizational recipients for automated assessment distribution",
        type: "human-input",
        render: ({ onComplete }) => <DistributionBlock onComplete={onComplete} />,
      },
      {
        id: "tracking",
        title: "Automated Distribution & Collection",
        description: "Assessment requests are being sent and responses collected automatically",
        type: "automated",
        render: ({ onComplete }) => <DistributionTracker onComplete={onComplete} />,
      },
      {
        id: "next-steps",
        title: "Next Steps",
        description: "Assessment complete — choose what to do next with the collected data",
        type: "next-steps",
        render: () => <NextStepsBlock />,
      },
    ],
  };
}

function BaselineParamsBlock({ onComplete }: { onComplete: () => void }) {
  const [assessmentName, setAssessmentName] = useState("Q1 2026 Enterprise Risk Assessment");
  const [assessmentType, setAssessmentType] = useState("comprehensive");
  const [riskDomain, setRiskDomain] = useState("operational");
  const [period, setPeriod] = useState("quarterly");

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Assessment Name</Label>
        <Input
          value={assessmentName}
          onChange={(e) => setAssessmentName(e.target.value)}
          className="text-sm"
          data-testid="input-assessment-name"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Assessment Type</Label>
          <Select value={assessmentType} onValueChange={setAssessmentType}>
            <SelectTrigger className="text-sm" data-testid="select-assessment-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
              <SelectItem value="targeted">Targeted</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="ad-hoc">Ad-hoc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Risk Domain</Label>
          <Select value={riskDomain} onValueChange={setRiskDomain}>
            <SelectTrigger className="text-sm" data-testid="select-risk-domain">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="strategic">Strategic</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="all">All Domains</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Assessment Period</Label>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="text-sm" data-testid="select-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="semi-annual">Semi-Annual</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="custom">Custom Period</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white"
        onClick={onComplete}
        data-testid="button-confirm-params"
      >
        <ChevronRight className="w-4 h-4 mr-1.5" />
        Continue to Distribution
      </Button>
    </div>
  );
}

function DistributionBlock({ onComplete }: { onComplete: () => void }) {
  const totalRecipients = orgHierarchy.reduce(
    (sum, e) => sum + e.units.reduce((s, u) => s + u.locations.length, 0),
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{orgHierarchy.length} entities · {totalRecipients} recipients</span>
        <span className="text-[#266C92] dark:text-[#4da3c9] font-medium">All selected</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {orgHierarchy.map((entity) => (
          <OrgNode key={entity.entity} entity={entity} />
        ))}
      </div>

      <Button
        className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white"
        onClick={onComplete}
        data-testid="button-distribute"
      >
        <Send className="w-4 h-4 mr-1.5" />
        Distribute Assessment
      </Button>
    </div>
  );
}

function NextStepsBlock() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {nextStepActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-border hover:border-[#266C92]/40 hover:bg-[#266C92]/5 transition-colors text-left cursor-pointer"
              data-testid={`next-step-${action.id}`}
            >
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
