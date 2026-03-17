import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useSettings } from "@/components/settings-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Zap,
  Activity,
  CalendarClock,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  Pause,
  Bot,
  ArrowRight,
  CircleDot,
  FileText,
  AlertCircle,
  Play,
  Shield,
  MoreVertical,
  FastForward,
  Loader2,
  ListChecks,
  Database,
  Workflow,
  Server,
  BarChart3,
  Target,
  ExternalLink,
  Users,
  ChevronLeft,
  RefreshCcw,
  ArrowUpRight,
  History,
  ClipboardCheck,
  Fingerprint,
  ShieldCheck,
  GitBranch,
  Layers,
  Hash,
} from "lucide-react";
import headerBgImage from "@/assets/header-background.png";
import {
  getAgentHubData,
  type AgentCategory,
  type AgentStatus,
  type AgentWorkflow,
  type AgentActivityEntry,
  type AgentCategorySummary,
} from "@/config/agentHubConfig";
import { WorkflowSession, ExecutiveReportView, getRiskAssessmentConfig, getFieldworkAutomationConfig, tickFieldworkStatuses, fieldworkBlockRules, fieldworkExceptions, fieldworkNextStepActions, type WorkflowSessionConfig, type ControlWorkflowStatus, type FieldworkException } from "./WorkflowSession";
import { useWorkflowSessionStore } from "@/lib/workflowSessionStore";

const categoryIcons: Record<AgentCategory, typeof Zap> = {
  "direct-realtime": Zap,
  continuous: Activity,
  scheduled: CalendarClock,
  emergent: AlertTriangle,
};

const categoryLabels: Record<AgentCategory, string> = {
  "direct-realtime": "Direct Action",
  continuous: "Continuous",
  scheduled: "Scheduled",
  emergent: "Emergent",
};

const statusConfig: Record<AgentStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[#266C92] hover:bg-[#266C92] text-white" },
  idle: { label: "Idle", className: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300" },
  "pending-review": { label: "Pending", className: "bg-[#1a2332] hover:bg-[#1a2332] text-white dark:bg-slate-600" },
  completed: { label: "Complete", className: "bg-[#266C92]/70 hover:bg-[#266C92]/70 text-white" },
};

function StatusBadge({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];
  return (
    <Badge className={`text-xs font-medium w-[5.5rem] justify-center ${config.className}`} data-testid={`badge-status-${status}`}>
      {status === "active" && <CircleDot className="w-3 h-3 mr-1" />}
      {status === "pending-review" && <Eye className="w-3 h-3 mr-1" />}
      {status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === "idle" && <Pause className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all bg-[#266C92]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ReviewDialog({ workflow, open, onClose }: { workflow: AgentWorkflow; open: boolean; onClose: () => void }) {
  const CatIcon = categoryIcons[workflow.category];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Eye className="w-4 h-4 text-[#266C92]" />
            Review: {workflow.name}
          </DialogTitle>
          <DialogDescription>
            This workflow requires your review before proceeding.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={workflow.status} />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CatIcon className="w-3.5 h-3.5" />
              <span>{categoryLabels[workflow.category]}</span>
            </div>
            {workflow.progress > 0 && workflow.progress < 100 && (
              <div className="flex items-center gap-2 ml-auto">
                <ProgressBar value={workflow.progress} />
                <span className="text-xs text-muted-foreground font-medium">{workflow.progress}%</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</h4>
            <p className="text-sm text-foreground leading-relaxed">{workflow.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1 p-3 rounded-lg bg-slate-50 dark:bg-muted/30">
              <p className="text-xs text-muted-foreground">Agent</p>
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#266C92]" />
                <span className="text-sm font-medium">{workflow.agentName}</span>
              </div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-slate-50 dark:bg-muted/30">
              <p className="text-xs text-muted-foreground">Last Activity</p>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{workflow.lastActivity}</span>
              </div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-slate-50 dark:bg-muted/30">
              <p className="text-xs text-muted-foreground">Related Items</p>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{workflow.relatedItemsCount}</span>
              </div>
            </div>
          </div>

          {workflow.humanActionDescription && (
            <div className="flex gap-3 p-3 bg-[#266C92]/5 dark:bg-[#266C92]/10 rounded-lg border border-[#266C92]/15 dark:border-[#266C92]/20">
              <AlertCircle className="w-4 h-4 text-[#266C92] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#266C92] dark:text-[#4da3c9]">Action Required</p>
                <p className="text-sm text-foreground leading-relaxed">{workflow.humanActionDescription}</p>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-review-cancel">
            Close
          </Button>
          <Button className="bg-[#266C92] hover:bg-[#1e5a7a] text-white" data-testid="button-review-approve">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Approve & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WorkflowRow({ workflow, onLaunch }: { workflow: AgentWorkflow; onLaunch?: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <>
      <div
        className={`border rounded-lg bg-white dark:bg-card transition-all ${
          workflow.humanActionNeeded
            ? "border-[#266C92]/40 dark:border-[#266C92]/50"
            : "border-slate-200 dark:border-border"
        }`}
        data-testid={`workflow-card-${workflow.id}`}
      >
        <div
          className="px-4 py-2.5 cursor-pointer grid items-center gap-3"
          style={{ gridTemplateColumns: "auto 1fr 5.5rem 9.5rem 1.75rem" }}
          onClick={() => setExpanded(!expanded)}
          data-testid={`workflow-toggle-${workflow.id}`}
        >
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${expanded ? "rotate-180" : "-rotate-90"}`} />
          <h4 className="text-sm font-medium text-foreground min-w-0 truncate">{workflow.name}</h4>

          <StatusBadge status={workflow.status} />

          <div>
            {workflow.status === "active" && workflow.progress < 100 ? (
              <div className="flex items-center gap-2">
                <ProgressBar value={workflow.progress} />
                <span className="text-xs text-muted-foreground font-medium w-8 text-right">{workflow.progress}%</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-center">
            {workflow.humanActionNeeded ? (
              <button
                className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Review workflow"
                title="Review"
                data-testid={`button-review-${workflow.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setReviewOpen(true);
                }}
              >
                <Eye className="w-3.5 h-3.5 text-[#266C92]" />
              </button>
            ) : null}
          </div>
        </div>

        {expanded && (
          <div className="px-4 pb-3 pt-0 border-t border-slate-100 dark:border-border">
            <div className="pt-3 space-y-2.5">
              <p className="text-sm text-muted-foreground">{workflow.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span className="font-medium">{workflow.agentName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{workflow.lastActivity}</span>
                </div>
                <span>{workflow.relatedItemsCount} related items</span>
              </div>

              {workflow.humanActionNeeded && workflow.humanActionDescription && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#266C92]/5 dark:bg-[#266C92]/10 rounded border border-[#266C92]/15 dark:border-[#266C92]/20">
                  <Eye className="w-3.5 h-3.5 text-[#266C92] shrink-0" />
                  <p className="text-xs text-[#266C92] dark:text-[#4da3c9]">{workflow.humanActionDescription}</p>
                </div>
              )}

              {onLaunch && (
                <Button
                  size="sm"
                  className="bg-[#266C92] hover:bg-[#1e5a7a] text-white text-xs h-7 mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunch(workflow.id);
                  }}
                  data-testid={`button-launch-${workflow.id}`}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Launch Workflow
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {workflow.humanActionNeeded && (
        <ReviewDialog workflow={workflow} open={reviewOpen} onClose={() => setReviewOpen(false)} />
      )}
    </>
  );
}

interface CategorySectionProps {
  category: AgentCategorySummary;
  sectionRef: (el: HTMLDivElement | null) => void;
  onLaunchWorkflow?: (workflowId: string) => void;
}

function CategorySection({ category, sectionRef, onLaunchWorkflow }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const Icon = categoryIcons[category.category];

  return (
    <div ref={sectionRef} className="space-y-2" data-testid={`category-section-${category.category}`}>
      <button
        className="flex items-center gap-3 w-full group cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        data-testid={`category-toggle-${category.category}`}
      >
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${category.iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${category.color}`} />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-semibold ${category.color}`}>{category.label}</h3>
            <span className="text-xs text-muted-foreground">
              {category.activeCount} active
              {category.pendingCount > 0 && (
                <span className="text-[#266C92] dark:text-[#4da3c9] ml-1">· {category.pendingCount} need review</span>
              )}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="space-y-1.5">
          {category.workflows.map((wf) => (
            <WorkflowRow
              key={wf.id}
              workflow={wf}
              onLaunch={workflowRowToSession[wf.id] ? onLaunchWorkflow : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityFeed({ entries }: { entries: AgentActivityEntry[] }) {
  return (
    <div className="flex flex-col h-full border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-card overflow-hidden" data-testid="activity-feed">
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-border shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          Agent Activity
        </h3>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-border">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`px-4 py-2.5 border-l-2 ${
              entry.type === "action-needed"
                ? "border-l-[#266C92]"
                : "border-l-slate-300 dark:border-l-slate-600"
            }`}
            data-testid={`activity-entry-${entry.id}`}
          >
            <p className="text-xs text-foreground leading-relaxed">{entry.message}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Bot className="w-3 h-3" />
              <span>{entry.agentName}</span>
              <span>·</span>
              <span>{entry.timestamp}</span>
              {entry.type === "action-needed" && (
                <Badge className="text-[10px] h-4 bg-[#266C92] hover:bg-[#266C92] text-white ml-auto">Action Needed</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TrackerRecipient {
  name: string;
  entity: string;
  assignee: string;
  status: "pending" | "sent" | "opened" | "in-progress" | "completed";
  progress: number;
  lastActivity: string;
}

const blockLabels: Record<string, string> = {
  synthesis: "Intelligence Synthesis",
  "template-selection": "Assessment Approach",
  "baseline-params": "Assessment Configuration",
  distribution: "Distribution Setup",
  tracking: "Assessment Execution",
  "next-steps": "Next Steps",
};

function WorkflowTracker({ sessionId }: { sessionId: string }) {
  const runtime = useWorkflowSessionStore((s) => s.runtimeStates[sessionId]);
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const setRuntime = useWorkflowSessionStore((s) => s.setRuntime);
  const setBlockState = useWorkflowSessionStore((s) => s.setBlockState);

  const fastForwardDemo = useCallback(() => {
    const defaultRecipientNames = [
      { name: "New York HQ", entity: "North America Holdings", assignee: "Sarah Chen" },
      { name: "Chicago Regional", entity: "North America Holdings", assignee: "James Park" },
      { name: "San Francisco Tech", entity: "North America Holdings", assignee: "Priya Sharma" },
      { name: "Toronto Office", entity: "North America Holdings", assignee: "Alex Morrison" },
      { name: "Vancouver Hub", entity: "North America Holdings", assignee: "Nina Patel" },
      { name: "London HQ", entity: "EMEA Group", assignee: "Oliver Wright" },
      { name: "Dublin Center", entity: "EMEA Group", assignee: "Ciara O'Brien" },
      { name: "Frankfurt Office", entity: "EMEA Group", assignee: "Hans Mueller" },
      { name: "Paris Branch", entity: "EMEA Group", assignee: "Claire Dubois" },
      { name: "Shanghai Office", entity: "APAC Region", assignee: "Wei Zhang" },
      { name: "Hong Kong Hub", entity: "APAC Region", assignee: "Amy Lau" },
      { name: "Singapore Center", entity: "APAC Region", assignee: "Raj Anand" },
    ];
    const trackingRecipients = (runtime?.blockStates?.["tracking"]?.recipients as TrackerRecipient[] | undefined);
    const baseRecipients = trackingRecipients && trackingRecipients.length > 0
      ? trackingRecipients
      : defaultRecipientNames.map((r) => ({ ...r, status: "pending" as const, progress: 0, lastActivity: "" }));
    const completedRecipients = baseRecipients.map((r) => ({
      ...r,
      status: "completed" as const,
      progress: 100,
      lastActivity: "Completed",
    }));
    setBlockState(sessionId, "tracking", "recipients", completedRecipients);
    setBlockState(sessionId, "tracking", "autoProgress", 42);
    setBlockState(sessionId, "tracking", "phase", "complete");
    setBlockState(sessionId, "tracking", "sentCount", completedRecipients.length);
    setRuntime(sessionId, {
      activeIndex: 5,
      completedIndices: [0, 1, 2, 3, 4],
    });
  }, [sessionId, runtime, setRuntime, setBlockState]);

  if (!runtime) return null;

  const totalBlocks = 6;
  const activeIndex = runtime.activeIndex;
  const completedIndices = new Set(runtime.completedIndices);
  const blockIds = ["synthesis", "template-selection", "baseline-params", "distribution", "tracking", "next-steps"];
  const overallProgress = Math.round((completedIndices.size / totalBlocks) * 100);

  const trackingState = runtime.blockStates?.["tracking"];
  const trackingPhase = (trackingState?.phase as string) ?? null;
  const recipients = (trackingState?.recipients as TrackerRecipient[] | undefined) ?? [];
  const autoProgress = (trackingState?.autoProgress as number) ?? 0;
  const completedSurveys = recipients.filter((r) => r.status === "completed").length;
  const totalSurveys = recipients.length;

  const isInTrackingPhase = activeIndex >= 4 || completedIndices.has(4);
  const isComplete = completedIndices.size === totalBlocks;
  const currentBlockId = blockIds[Math.min(activeIndex, blockIds.length - 1)];
  const currentBlockLabel = blockLabels[currentBlockId] || currentBlockId;

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3 h-3 text-slate-400" />;
      case "sent": return <ArrowRight className="w-3 h-3 text-[#266C92]" />;
      case "opened": return <Eye className="w-3 h-3 text-amber-500" />;
      case "in-progress": return <Activity className="w-3 h-3 text-[#266C92]" />;
      case "completed": return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      default: return <Clock className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-border overflow-hidden" data-testid="simple-workflow-tracker">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-border bg-white dark:bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#266C92]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground" data-testid="text-workflow-title">Risk Assessment</h3>
              <p className="text-xs text-muted-foreground">
                {isComplete ? "Assessment complete" : `Step ${activeIndex + 1} of ${totalBlocks} — ${currentBlockLabel}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isComplete ? (
              <Badge className="text-xs bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge className="text-xs bg-[#266C92] text-white">
                <Activity className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => setCurrentSession(sessionId)}
              data-testid="button-open-workflow"
            >
              Open
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" data-testid="button-tracker-menu">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={fastForwardDemo} data-testid="menu-item-fast-forward">
                  <FastForward className="w-4 h-4 mr-2" />
                  Fast-forward demo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-700 bg-[#266C92]"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground text-right">{overallProgress}% complete</p>
      </div>

      <div className="px-5 py-3 bg-slate-50/50 dark:bg-muted/5">
        <div className="flex gap-1">
          {blockIds.map((id, i) => {
            const done = completedIndices.has(i);
            const active = i === activeIndex;
            const blockStates = runtime.blockStates || {};

            const skippedAtCompletion = (blockStates["synthesis"]?.skippedAtCompletion as boolean) ?? false;
            const templateAck = (blockStates["template-selection"]?.automationAcknowledged as boolean) ?? false;
            const distConfirm = (blockStates["distribution"]?.scopeConfirmed as boolean) ?? false;

            let engagementIcon = null;
            if (done) {
              if (id === "synthesis" && skippedAtCompletion) {
                engagementIcon = <div className="w-2 h-2 rounded-full bg-amber-400" title="Skipped intelligence review" />;
              } else if (id === "template-selection" && templateAck) {
                engagementIcon = <Shield className="w-2.5 h-2.5 text-[#266C92]" />;
              } else if (id === "distribution" && distConfirm) {
                engagementIcon = <Shield className="w-2.5 h-2.5 text-[#266C92]" />;
              }
            }

            return (
              <div key={id} className="flex-1 flex flex-col items-center gap-1" data-testid={`step-indicator-${id}`}>
                <div className="flex items-center gap-0.5 w-full">
                  <div
                    className={`flex-1 h-1 rounded-full transition-all ${
                      done ? "bg-[#266C92]" : active ? "bg-[#266C92]/40" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                  {engagementIcon && <div className="shrink-0 flex items-center justify-center">{engagementIcon}</div>}
                </div>
                <span className={`text-[9px] truncate max-w-full px-0.5 ${done ? "text-[#266C92] font-medium" : active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {blockLabels[id]?.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isInTrackingPhase && totalSurveys > 0 && (
        <div className="px-5 py-4 border-t border-slate-100 dark:border-border">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-[#266C92]" />
            <span className="text-xs font-semibold text-foreground">Assessment Execution — Live Tracker</span>
            {trackingPhase === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <Bot className="w-3.5 h-3.5 text-[#266C92]" />
                <span className="text-[11px] font-semibold">Auto-Assessment</span>
                {autoProgress >= 42 && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />}
              </div>
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                <div className="h-full rounded-full bg-[#266C92] transition-all duration-500" style={{ width: `${(autoProgress / 42) * 100}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{autoProgress}/42 items scored</p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-[#266C92]" />
                <span className="text-[11px] font-semibold">Survey Responses</span>
                {completedSurveys === totalSurveys && totalSurveys > 0 && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />}
              </div>
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                <div className="h-full rounded-full bg-[#266C92] transition-all duration-500" style={{ width: `${totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{completedSurveys}/{totalSurveys} responses</p>
            </div>
          </div>

          <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
            <div className="grid grid-cols-[1fr_4rem_4rem] gap-2 px-2 py-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Location</span>
              <span>Status</span>
              <span>Progress</span>
            </div>
            {recipients.map((r) => (
              <div key={r.name} className="grid grid-cols-[1fr_4rem_4rem] gap-2 px-2 py-1 rounded text-xs items-center hover:bg-slate-50 dark:hover:bg-muted/20">
                <span className="truncate font-medium text-[11px]">{r.name}</span>
                <div className="flex items-center gap-1">
                  {statusIcon(r.status)}
                  <span className="text-[9px] capitalize">{r.status === "in-progress" ? "Active" : r.status}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${r.status === "completed" ? "bg-[#266C92]" : "bg-[#266C92]"}`} style={{ width: `${r.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground w-5 text-right">{r.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function FieldworkTracker({ sessionId }: { sessionId: string }) {
  const runtime = useWorkflowSessionStore((s) => s.runtimeStates[sessionId]);
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const setRuntime = useWorkflowSessionStore((s) => s.setRuntime);
  const setBlockState = useWorkflowSessionStore((s) => s.setBlockState);

  const fastForwardDemo = useCallback(() => {
    const currentStatuses = (runtime?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
    const completedStatuses = currentStatuses.map(s => ({
      ...s,
      steps: { population: "complete", sampling: "complete", evidence: "complete", testing: "complete" },
      overallProgress: 100,
    }));
    if (completedStatuses.length > 0) {
      setBlockState(sessionId, "fieldwork-execution", "statuses", completedStatuses);
    }
    setBlockState(sessionId, "fieldwork-execution", "phase", "complete");
    setBlockState(sessionId, "fieldwork-execution", "resolvedBlocks", fieldworkBlockRules.map(r => r.controlId));
    setRuntime(sessionId, { activeIndex: 4, completedIndices: [0, 1, 2, 3] });
  }, [sessionId, runtime, setRuntime, setBlockState]);

  const trackerExecPhase = (runtime?.blockStates?.["fieldwork-execution"]?.phase as string) ?? null;

  useEffect(() => {
    if (trackerExecPhase !== "running") return;
    const timer = setInterval(() => {
      const store = useWorkflowSessionStore.getState();
      const curr = (store.runtimeStates[sessionId]?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
      if (curr.length === 0) return;
      const currentResolved = new Set((store.runtimeStates[sessionId]?.blockStates?.["fieldwork-execution"]?.resolvedBlocks as string[] | undefined) ?? []);
      const next = tickFieldworkStatuses(curr, currentResolved);
      if (next) {
        store.setBlockState(sessionId, "fieldwork-execution", "statuses", next);
        const allDone = next.every((s) =>
          s.steps.population === "complete" && s.steps.sampling === "complete" &&
          s.steps.evidence === "complete" && s.steps.testing === "complete"
        );
        if (allDone) {
          store.setBlockState(sessionId, "fieldwork-execution", "phase", "complete");
          const rt = store.runtimeStates[sessionId];
          if (rt && !rt.completedIndices.includes(3)) {
            store.setRuntime(sessionId, {
              activeIndex: 4,
              completedIndices: [...rt.completedIndices.filter((i) => i !== 3), 3],
            });
          }
        }
      }
    }, 800);
    return () => clearInterval(timer);
  }, [sessionId, trackerExecPhase]);

  if (!runtime) return null;

  const totalBlocks = 5;
  const activeIndex = runtime.activeIndex;
  const completedIndices = new Set(runtime.completedIndices);
  const blockIds = ["control-selection", "data-sources", "pbc-mapping", "fieldwork-execution", "fieldwork-next-steps"];
  const blockLabelsMap: Record<string, string> = {
    "control-selection": "Controls",
    "data-sources": "Data Sources",
    "pbc-mapping": "PBC Mapping",
    "fieldwork-execution": "Execution",
    "fieldwork-next-steps": "Next Steps",
  };
  const overallProgress = Math.round((completedIndices.size / totalBlocks) * 100);
  const isComplete = completedIndices.size === totalBlocks;
  const currentBlockLabel = blockLabelsMap[blockIds[Math.min(activeIndex, blockIds.length - 1)]] || "";

  const executionState = runtime.blockStates?.["fieldwork-execution"];
  const controlStatuses = (executionState?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
  const executionPhase = (executionState?.phase as string) ?? null;
  const isInExecution = activeIndex >= 3 || completedIndices.has(3);

  const completedControls = controlStatuses.filter(s => s.overallProgress === 100).length;
  const totalControls = controlStatuses.length;
  const autoControls = controlStatuses.filter(s => s.dataSource === "connected");
  const manualControls = controlStatuses.filter(s => s.dataSource === "manual");
  const autoComplete = autoControls.filter(s => s.overallProgress === 100).length;
  const manualComplete = manualControls.filter(s => s.overallProgress === 100).length;

  const stepIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle2 className="w-2.5 h-2.5 text-[#266C92]" />;
      case "running": return <Loader2 className="w-2.5 h-2.5 text-[#266C92] animate-spin" />;
      case "waiting": return <Clock className="w-2.5 h-2.5 text-slate-400" />;
      case "blocked": return <AlertCircle className="w-2.5 h-2.5 text-red-500" />;
      default: return <div className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600" />;
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-border overflow-hidden" data-testid="fieldwork-tracker">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-border bg-white dark:bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#266C92]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground" data-testid="text-fieldwork-title">Automated Control Testing</h3>
              <p className="text-xs text-muted-foreground">
                {isComplete ? "Testing complete" : `Step ${activeIndex + 1} of ${totalBlocks} — ${currentBlockLabel}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isComplete ? (
              <Badge className="text-xs bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge className="text-xs bg-[#266C92] text-white">
                <Activity className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
            )}
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setCurrentSession(sessionId)} data-testid="button-open-fieldwork">
              Open
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" data-testid="button-fieldwork-menu">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={fastForwardDemo} data-testid="menu-item-fieldwork-fast-forward">
                  <FastForward className="w-4 h-4 mr-2" />
                  Fast-forward demo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
          <div className="h-full rounded-full transition-all duration-700 bg-[#266C92]" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="text-[11px] text-muted-foreground text-right">{overallProgress}% complete</p>
      </div>

      <div className="px-5 py-3 bg-slate-50/50 dark:bg-muted/5">
        <div className="flex gap-1">
          {blockIds.map((id, i) => {
            const done = completedIndices.has(i);
            const active = i === activeIndex;
            return (
              <div key={id} className="flex-1 flex flex-col items-center gap-1" data-testid={`fieldwork-step-${id}`}>
                <div className={`w-full h-1 rounded-full transition-all ${done ? "bg-[#266C92]" : active ? "bg-[#266C92]/40" : "bg-slate-200 dark:bg-slate-700"}`} />
                <span className={`text-[9px] truncate max-w-full px-0.5 ${done ? "text-[#266C92] font-medium" : active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {blockLabelsMap[id]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isInExecution && totalControls > 0 && (
        <div className="px-5 py-4 border-t border-slate-100 dark:border-border">
          <div className="flex items-center gap-2 mb-3">
            <Workflow className="w-3.5 h-3.5 text-[#266C92]" />
            <span className="text-xs font-semibold text-foreground">Control Testing — Live Pipeline</span>
            {executionPhase === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-[#266C92] ml-auto" />}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="p-2 rounded-lg border border-slate-200 dark:border-border text-center">
              <p className="text-sm font-bold text-foreground">{completedControls}/{totalControls}</p>
              <p className="text-[9px] text-muted-foreground">Controls Done</p>
            </div>
            <div className="p-2 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10 text-center">
              <p className="text-sm font-bold text-foreground">{autoComplete}/{autoControls.length}</p>
              <p className="text-[9px] text-muted-foreground">Automated</p>
            </div>
            <div className="p-2 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10 text-center">
              <p className="text-sm font-bold text-foreground">{manualComplete}/{manualControls.length}</p>
              <p className="text-[9px] text-muted-foreground">PBC Workflow</p>
            </div>
          </div>

          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            <div className="grid grid-cols-[1fr_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem] gap-1 px-2 py-1 text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Control</span><span className="text-center">Pop</span><span className="text-center">Smp</span><span className="text-center">Evd</span><span className="text-center">Test</span><span className="text-center">%</span>
            </div>
            {controlStatuses.map(ctrl => (
              <div key={ctrl.controlId} className="grid grid-cols-[1fr_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem] gap-1 px-2 py-1 rounded text-xs items-center hover:bg-slate-50 dark:hover:bg-muted/20">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[9px] font-mono font-medium text-foreground">{ctrl.controlId}</span>
                  <span className="text-[9px] text-muted-foreground truncate">{ctrl.name}</span>
                </div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.population)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.sampling)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.evidence)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.testing)}</div>
                <span className={`text-[8px] text-center font-medium ${ctrl.overallProgress === 100 ? "text-[#266C92]" : "text-muted-foreground"}`}>{ctrl.overallProgress}%</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[9px] text-muted-foreground px-1 mt-2 pt-2 border-t border-slate-100 dark:border-border">
            <div className="flex items-center gap-0.5"><Loader2 className="w-2 h-2 text-[#266C92] animate-spin" /><span>Running</span></div>
            <span>·</span>
            <div className="flex items-center gap-0.5"><Clock className="w-2 h-2 text-slate-400" /><span>Waiting</span></div>
            <span>·</span>
            <div className="flex items-center gap-0.5"><CheckCircle2 className="w-2 h-2 text-[#266C92]" /><span>Done</span></div>
          </div>
        </div>
      )}
    </Card>
  );
}

const fieldworkActivityFeed = [
  { id: "fw-1", timestamp: "Just now", agent: "Population Agent", message: "Extracted 2,847 journal entries from SAP ERP for Journal Entry Approval", type: "info" as const },
  { id: "fw-2", timestamp: "1 min ago", agent: "Sampling Agent", message: "Statistical sample of 45 items selected for Access Provisioning (CTL-001)", type: "info" as const },
  { id: "fw-3", timestamp: "3 min ago", agent: "Evidence Agent", message: "Collected 12 approval screenshots from Okta IAM for User Access Review", type: "success" as const },
  { id: "fw-4", timestamp: "5 min ago", agent: "Testing Agent", message: "Exception: 2 journal entries missing dual approval — CTL-005 flagged", type: "warning" as const },
  { id: "fw-5", timestamp: "8 min ago", agent: "PBC Coordinator", message: "PBC request sent to David Kim for Segregation of Duties evidence", type: "info" as const },
  { id: "fw-6", timestamp: "12 min ago", agent: "Testing Agent", message: "CTL-012 Procurement Approval — all 30 samples passed. Effective.", type: "success" as const },
  { id: "fw-7", timestamp: "15 min ago", agent: "Evidence Agent", message: "Awaiting PBC response from Jun Li — Revenue Recognition (CTL-007)", type: "action-needed" as const },
  { id: "fw-8", timestamp: "20 min ago", agent: "Population Agent", message: "Identified 1,204 change requests from ServiceNow for Change Management", type: "info" as const },
];

const fieldworkSystemStatus = [
  { name: "SAP ERP", type: "ERP", controls: 7, lastSync: "2 min ago" },
  { name: "Okta IAM", type: "Identity", controls: 2, lastSync: "Just now" },
  { name: "ServiceNow", type: "ITSM", controls: 1, lastSync: "5 min ago" },
  { name: "AWS CloudTrail", type: "Cloud", controls: 1, lastSync: "1 min ago" },
  { name: "Genetec Security", type: "Physical", controls: 1, lastSync: "8 min ago" },
  { name: "Coupa", type: "Procurement", controls: 1, lastSync: "3 min ago" },
  { name: "CrowdStrike", type: "Endpoint", controls: 3, lastSync: "Just now" },
];


const agentWorkflows = [
  { id: "aw-1", name: "SOX Control Testing", agent: "Control Testing Agent", category: "direct-realtime" as AgentCategory, status: "active" as AgentStatus, progress: 0, lastActivity: "Ready to launch", humanAction: false },
  { id: "aw-2", name: "Risk Score Monitoring", agent: "Risk Monitor", category: "continuous" as AgentCategory, status: "active" as AgentStatus, progress: 100, lastActivity: "Just now", humanAction: false },
  { id: "aw-3", name: "Control Effectiveness Tracking", agent: "Effectiveness Agent", category: "continuous" as AgentCategory, status: "active" as AgentStatus, progress: 100, lastActivity: "5 min ago", humanAction: true },
  { id: "aw-4", name: "Evidence Integrity Validation", agent: "Validation Agent", category: "continuous" as AgentCategory, status: "active" as AgentStatus, progress: 100, lastActivity: "2 min ago", humanAction: false },
  { id: "aw-5", name: "Quarterly Control Review", agent: "Review Agent", category: "scheduled" as AgentCategory, status: "idle" as AgentStatus, progress: 0, lastActivity: "Scheduled: Apr 1", humanAction: false },
  { id: "aw-6", name: "Monthly Testing Report", agent: "Reporting Agent", category: "scheduled" as AgentCategory, status: "completed" as AgentStatus, progress: 100, lastActivity: "2 days ago", humanAction: true },
  { id: "aw-7", name: "PBC Evidence Collection", agent: "PBC Coordinator", category: "scheduled" as AgentCategory, status: "active" as AgentStatus, progress: 68, lastActivity: "12 min ago", humanAction: false },
  { id: "aw-8", name: "Control Gap Detected — Access Mgmt", agent: "Gap Analysis Agent", category: "emergent" as AgentCategory, status: "active" as AgentStatus, progress: 45, lastActivity: "8 min ago", humanAction: false },
  { id: "aw-9", name: "Policy Change — SOX Scope Update", agent: "Compliance Scanner", category: "emergent" as AgentCategory, status: "pending-review" as AgentStatus, progress: 100, lastActivity: "1 hr ago", humanAction: true },
];

const pendingApprovals = [
  { id: "pa-1", title: "Approve Testing Exception — CTL-005", agent: "Testing Agent", type: "Exception Triage", timestamp: "5 min ago", severity: "high" as const },
  { id: "pa-2", title: "Review Monthly Testing Report", agent: "Reporting Agent", type: "Report Review", timestamp: "2 days ago", severity: "medium" as const },
  { id: "pa-3", title: "Confirm SOX Scope Change Impact", agent: "Compliance Scanner", type: "Policy Change", timestamp: "1 hr ago", severity: "high" as const },
  { id: "pa-4", title: "Validate 3 Ineffective Controls", agent: "Effectiveness Agent", type: "Control Review", timestamp: "5 min ago", severity: "medium" as const },
];

const auditTrailEntries = [
  { id: "at-1", timestamp: "Just now", agent: "Risk Monitor", action: "Updated 4 risk scores based on KRI feed changes", type: "auto" as const },
  { id: "at-2", timestamp: "2 min ago", agent: "Validation Agent", action: "Verified evidence integrity for 12 samples — all passed hash check", type: "auto" as const },
  { id: "at-3", timestamp: "5 min ago", agent: "Testing Agent", action: "Flagged CTL-005 exception — 2 journal entries missing dual approval", type: "escalation" as const },
  { id: "at-4", timestamp: "8 min ago", agent: "Gap Analysis Agent", action: "Initiated control gap analysis for Access Management domain", type: "auto" as const },
  { id: "at-5", timestamp: "12 min ago", agent: "PBC Coordinator", action: "Sent follow-up to David Kim — Segregation of Duties evidence overdue", type: "auto" as const },
  { id: "at-6", timestamp: "30 min ago", agent: "Effectiveness Agent", action: "Completed effectiveness assessment for 28 controls — 3 flagged", type: "escalation" as const },
  { id: "at-7", timestamp: "1 hr ago", agent: "Compliance Scanner", action: "SOX scope update detected — new controls identified for review", type: "escalation" as const },
  { id: "at-8", timestamp: "2 hrs ago", agent: "Reporting Agent", action: "Generated monthly testing status report — pending human review", type: "approval" as const },
];

function OptroHome() {
  const addProject = useWorkflowSessionStore((s) => s.addProject);
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const setPendingCanvasView = useWorkflowSessionStore((s) => s.setPendingCanvasView);
  const activeProjects = useWorkflowSessionStore((s) => s.activeProjects);
  const [agentSectionExpanded, setAgentSectionExpanded] = useState(false);
  const [auditTrailExpanded, setAuditTrailExpanded] = useState(false);
  const [moreTasksOpen, setMoreTasksOpen] = useState(false);

  const launchControlTesting = useCallback(() => {
    const meta = workflowSessionConfigs["control-testing"];
    if (meta) {
      setPendingCanvasView(true);
      const existing = activeProjects.find((p) => p.sessionId === "control-testing");
      if (existing) {
        setCurrentSession("control-testing");
      } else {
        const config = meta.create();
        addProject({ sessionId: "control-testing", label: meta.label, icon: meta.icon }, config);
      }
    }
  }, [addProject, setCurrentSession, setPendingCanvasView, activeProjects]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.workflowId === "control-testing") launchControlTesting();
    };
    window.addEventListener("agent-hub:launch-workflow", handler);
    return () => window.removeEventListener("agent-hub:launch-workflow", handler);
  }, [launchControlTesting]);

  const launchControlTestingFromCard = useCallback(() => {
    window.dispatchEvent(new CustomEvent("agent-hub:launch-workflow", { detail: { workflowId: "control-testing" } }));
  }, []);

  const taskItems = [
    {
      id: "task-control-testing",
      title: "Test Controls for SOX Audit",
      description: "Launch automated control testing across connected systems and PBC workflows for the current audit period.",
      icon: Shield,
      iconColor: "text-slate-500 dark:text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800/30",
      action: launchControlTestingFromCard,
      actionLabel: "Start Testing",
      priority: "high" as const,
    },
    {
      id: "task-review-exceptions",
      title: "Review Open Exceptions",
      description: "3 control exceptions from prior testing cycle awaiting management response and remediation plans.",
      icon: AlertTriangle,
      iconColor: "text-slate-500 dark:text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800/30",
      priority: "medium" as const,
    },
    {
      id: "task-evidence-requests",
      title: "Follow Up on Evidence Requests",
      description: "5 PBC evidence requests are pending — 2 overdue by more than 3 business days.",
      icon: FileText,
      iconColor: "text-slate-500 dark:text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800/30",
      priority: "medium" as const,
    },
    {
      id: "task-risk-assessment",
      title: "Complete Risk Assessment Updates",
      description: "Quarterly risk assessment scoring due for 4 process areas. Last updated 87 days ago.",
      icon: BarChart3,
      iconColor: "text-slate-500 dark:text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800/30",
      priority: "low" as const,
    },
    {
      id: "task-walkthrough-scheduling",
      title: "Schedule Control Walkthroughs",
      description: "Annual walkthrough cycle begins next month — 12 control owners need scheduling confirmation.",
      icon: Users,
      iconColor: "text-slate-500 dark:text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800/30",
      priority: "low" as const,
    },
    {
      id: "task-report-preparation",
      title: "Prepare Committee Report",
      description: "Audit committee meeting in 3 weeks — draft testing status report and exception summary.",
      icon: ListChecks,
      iconColor: "text-slate-500 dark:text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800/30",
      priority: "low" as const,
    },
  ];

  const activeAgentCount = agentWorkflows.filter(w => w.status === "active").length;
  const pendingCount = pendingApprovals.length;
  const continuousCount = agentWorkflows.filter(w => w.category === "continuous" && w.status === "active").length;
  const escalationCount = auditTrailEntries.filter(e => e.type === "escalation").length;

  const groupedWorkflows = [
    { key: "direct-realtime" as AgentCategory, label: "Direct Action", icon: Zap, workflows: agentWorkflows.filter(w => w.category === "direct-realtime") },
    { key: "continuous" as AgentCategory, label: "Continuous", icon: Activity, workflows: agentWorkflows.filter(w => w.category === "continuous") },
    { key: "scheduled" as AgentCategory, label: "Scheduled", icon: CalendarClock, workflows: agentWorkflows.filter(w => w.category === "scheduled") },
    { key: "emergent" as AgentCategory, label: "Emergent", icon: AlertTriangle, workflows: agentWorkflows.filter(w => w.category === "emergent") },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="optro-home">
      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 dark:bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-1" data-testid="text-optro-welcome">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Here's what needs your attention today.</p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6" data-testid="optro-stats-bar">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-1.5">
                <Bot className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-muted-foreground font-medium">Active Agents</span>
              </div>
              <span className="text-xl font-bold text-foreground">{activeAgentCount}</span>
              <span className="text-[10px] text-muted-foreground ml-1.5">of {agentWorkflows.length}</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-muted-foreground font-medium">Pending Approvals</span>
              </div>
              <span className="text-xl font-bold text-foreground">{pendingCount}</span>
              <span className="text-[10px] text-muted-foreground ml-1.5">awaiting review</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-muted-foreground font-medium">Continuous</span>
              </div>
              <span className="text-xl font-bold text-foreground">{continuousCount}</span>
              <span className="text-[10px] text-muted-foreground ml-1.5">monitoring</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-muted-foreground font-medium">Escalations</span>
              </div>
              <span className="text-xl font-bold text-foreground">{escalationCount}</span>
              <span className="text-[10px] text-muted-foreground ml-1.5">in audit trail</span>
            </div>
          </div>

          <div className="space-y-2 mb-6" data-testid="optro-task-list">
            <div className="flex items-center gap-2 mb-1 px-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Tasks</h2>
            </div>
            {(() => {
              const primaryTask = taskItems.find((t) => t.priority === "high");
              const secondaryTasks = taskItems.filter((t) => t.priority !== "high");
              const renderTask = (task: typeof taskItems[number]) => {
                const IconComp = task.icon;
                return (
                  <div
                    key={task.id}
                    className={`group flex items-start gap-4 p-4 rounded-lg border bg-white dark:bg-card transition-all ${
                      task.action
                        ? "border-[#266C92]/30 hover:border-[#266C92] hover:shadow-sm cursor-pointer"
                        : "border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-muted/10"
                    }`}
                    onClick={task.action}
                    data-testid={task.id}
                  >
                    <div className={`w-9 h-9 rounded-lg ${task.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <IconComp className={`w-4.5 h-4.5 ${task.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-foreground">{task.title}</h3>
                        {task.priority === "high" && (
                          <Badge className="text-[9px] h-4 bg-[#266C92]/10 text-[#266C92] border-0">Priority</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                    </div>
                    {task.action && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-[#266C92] hover:bg-[#1e5a7a] text-white shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); task.action!(); }}
                        data-testid={`button-${task.id}`}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        {task.actionLabel}
                      </Button>
                    )}
                    {!task.action && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-2 opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                  </div>
                );
              };
              return (
                <>
                  {primaryTask && renderTask(primaryTask)}
                  {secondaryTasks.length > 0 && (
                    <div>
                      <button
                        onClick={() => setMoreTasksOpen((v) => !v)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 px-1"
                        data-testid="toggle-more-tasks"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreTasksOpen ? "" : "-rotate-90"}`} />
                        <span>More tasks</span>
                        <span className="text-[10px] text-muted-foreground/60">({secondaryTasks.length})</span>
                      </button>
                      {moreTasksOpen && (
                        <div className="space-y-2 mt-1">
                          {secondaryTasks.map(renderTask)}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            <div className="space-y-3" data-testid="optro-pending-approvals">
              <div className="flex items-center gap-2 px-1">
                <ClipboardCheck className="w-3.5 h-3.5 text-slate-400" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Approvals</h2>
                <Badge className="text-[9px] h-4 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0 ml-auto">{pendingApprovals.length}</Badge>
              </div>
              <div className="border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-card overflow-hidden divide-y divide-slate-100 dark:divide-border">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors cursor-pointer group" data-testid={`approval-${item.id}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${item.severity === "high" ? "bg-red-400" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <Bot className="w-3 h-3" />
                        <span>{item.agent}</span>
                        <span>·</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                    <Badge className="text-[9px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 shrink-0 mt-0.5">{item.type}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3" data-testid="optro-agent-workflows">
              <button
                onClick={() => setAgentSectionExpanded(!agentSectionExpanded)}
                className="flex items-center gap-2 px-1 w-full"
              >
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Workflows</h2>
                <Badge className="text-[9px] h-4 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0">{agentWorkflows.length}</Badge>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform ${agentSectionExpanded ? "" : "-rotate-90"}`} />
              </button>
              <div className="border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-card overflow-hidden">
                {groupedWorkflows.map((group) => {
                  const GroupIcon = group.icon;
                  const activeInGroup = group.workflows.filter(w => w.status === "active").length;
                  const pendingInGroup = group.workflows.filter(w => w.humanAction).length;
                  return (
                    <div key={group.key} className="border-b last:border-b-0 border-slate-100 dark:border-border">
                      <div className="px-4 py-2.5 flex items-center gap-3">
                        <GroupIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-foreground flex-1">{group.label}</span>
                        <span className="text-[11px] text-muted-foreground">{activeInGroup} active</span>
                        {pendingInGroup > 0 && (
                          <Badge className="text-[9px] h-4 bg-[#266C92]/10 text-[#266C92] border-0">{pendingInGroup} review</Badge>
                        )}
                      </div>
                      {agentSectionExpanded && (
                        <div className="pb-2 px-4 space-y-1">
                          {group.workflows.map((wf) => (
                            <div key={wf.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-muted/20 transition-colors" data-testid={`agent-wf-${wf.id}`}>
                              {wf.status === "active" ? (
                                <CircleDot className="w-2.5 h-2.5 text-[#266C92] shrink-0" />
                              ) : wf.status === "pending-review" ? (
                                <Eye className="w-2.5 h-2.5 text-[#266C92] shrink-0" />
                              ) : wf.status === "completed" ? (
                                <CheckCircle2 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              ) : (
                                <Pause className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                              )}
                              <span className="text-xs text-foreground flex-1 truncate">{wf.name}</span>
                              {wf.progress > 0 && wf.progress < 100 && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-[#266C92]" style={{ width: `${wf.progress}%` }} />
                                  </div>
                                  <span className="text-[9px] text-muted-foreground w-5 text-right">{wf.progress}%</span>
                                </div>
                              )}
                              <span className="text-[10px] text-muted-foreground shrink-0">{wf.lastActivity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3" data-testid="optro-audit-trail">
            <button
              onClick={() => setAuditTrailExpanded(!auditTrailExpanded)}
              className="flex items-center gap-2 px-1 w-full"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Audit Trail</h2>
              <Badge className="text-[9px] h-4 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0">{auditTrailEntries.length} events</Badge>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform ${auditTrailExpanded ? "" : "-rotate-90"}`} />
            </button>
            {auditTrailExpanded && (
              <div className="border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-card overflow-hidden divide-y divide-slate-100 dark:divide-border animate-in slide-in-from-top-2 fade-in duration-200" data-testid="audit-trail-list">
                {auditTrailEntries.map((entry) => (
                  <div key={entry.id} className={`px-4 py-2.5 flex items-start gap-3 border-l-2 ${entry.type === "escalation" ? "border-l-red-300 dark:border-l-red-700" : entry.type === "approval" ? "border-l-[#266C92]" : "border-l-slate-200 dark:border-l-slate-700"}`} data-testid={`audit-entry-${entry.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{entry.action}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <Bot className="w-2.5 h-2.5" />
                        <span>{entry.agent}</span>
                        <span>·</span>
                        <span>{entry.timestamp}</span>
                      </div>
                    </div>
                    {entry.type === "escalation" && (
                      <Badge className="text-[9px] h-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-0 shrink-0">Escalated</Badge>
                    )}
                    {entry.type === "approval" && (
                      <Badge className="text-[9px] h-4 bg-[#266C92]/10 text-[#266C92] border-0 shrink-0">Needs Review</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldworkComplexHub() {
  const activeProjects = useWorkflowSessionStore((s) => s.activeProjects);
  const addProject = useWorkflowSessionStore((s) => s.addProject);
  const setRuntime = useWorkflowSessionStore((s) => s.setRuntime);
  const setBlockState = useWorkflowSessionStore((s) => s.setBlockState);
  const pendingCanvasView = useWorkflowSessionStore((s) => s.pendingCanvasView);
  const setPendingCanvasView = useWorkflowSessionStore((s) => s.setPendingCanvasView);

  const fieldworkProject = activeProjects.find((p) => p.sessionId === "control-testing");
  const fieldworkRuntime = useWorkflowSessionStore((s) =>
    fieldworkProject ? s.runtimeStates[fieldworkProject.sessionId] : null
  );
  const fieldworkConfig = useWorkflowSessionStore((s) =>
    fieldworkProject ? (s.sessionConfigs[fieldworkProject.sessionId] as WorkflowSessionConfig | null) ?? null : null
  );

  const [showCanvas, setShowCanvas] = useState(() => {
    if (pendingCanvasView) {
      setPendingCanvasView(false);
      return true;
    }
    return false;
  });

  const launchWorkflow = useCallback((id: string) => {
    const sessionId = workflowRowToSession[id] || id;
    const meta = workflowSessionConfigs[sessionId];
    if (meta) {
      const config = meta.create();
      addProject({ sessionId, label: meta.label, icon: meta.icon }, config);
    }
  }, [addProject]);

  const fastForwardDemo = useCallback(() => {
    if (!fieldworkProject) return;
    const sid = fieldworkProject.sessionId;
    const currentStatuses = (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
    const defaultSeedControls: ControlWorkflowStatus[] = [
      { controlId: "CTL-001", name: "Access Provisioning", dataSource: "connected", system: "Okta IAM", owner: "IT Security", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-002", name: "Change Management", dataSource: "connected", system: "ServiceNow", owner: "IT Operations", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-003", name: "Segregation of Duties", dataSource: "manual", system: null, owner: "Internal Audit", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-004", name: "Backup & Recovery", dataSource: "connected", system: "AWS", owner: "IT Infrastructure", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-005", name: "Journal Entry Approval", dataSource: "connected", system: "SAP ERP", owner: "Controller", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-006", name: "Bank Reconciliation", dataSource: "connected", system: "SAP ERP", owner: "Treasury", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-007", name: "Revenue Recognition", dataSource: "manual", system: null, owner: "Revenue Accounting", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-008", name: "Vendor Payment Authorization", dataSource: "connected", system: "Coupa", owner: "AP Manager", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-009", name: "Physical Access Controls", dataSource: "connected", system: "Genetec", owner: "Facilities", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-010", name: "Incident Response", dataSource: "manual", system: null, owner: "CISO Office", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-011", name: "Data Classification", dataSource: "manual", system: null, owner: "Data Governance", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-012", name: "Procurement Approval", dataSource: "connected", system: "Coupa", owner: "Procurement", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-013", name: "User Access Review", dataSource: "connected", system: "Okta IAM", owner: "IT Security", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-014", name: "Financial Close Process", dataSource: "manual", system: null, owner: "Controller", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-015", name: "Third-Party Risk Assessment", dataSource: "manual", system: null, owner: "Vendor Management", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-016", name: "Privilege Escalation Monitoring", dataSource: "connected", system: "CrowdStrike", owner: "SOC Team", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-017", name: "Inventory Valuation", dataSource: "connected", system: "SAP ERP", owner: "Cost Accounting", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-018", name: "Accounts Receivable Aging", dataSource: "connected", system: "SAP ERP", owner: "AR Manager", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-019", name: "Payroll Processing Controls", dataSource: "manual", system: null, owner: "HR / Payroll", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-020", name: "Fixed Asset Capitalization", dataSource: "connected", system: "SAP ERP", owner: "Fixed Assets", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-021", name: "Database Administrator Access", dataSource: "connected", system: "CrowdStrike", owner: "IT Security", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-022", name: "Network Security Monitoring", dataSource: "connected", system: "CrowdStrike", owner: "SOC Team", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-023", name: "Business Continuity Planning", dataSource: "manual", system: null, owner: "Risk Management", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-024", name: "Whistleblower & Ethics Hotline", dataSource: "manual", system: null, owner: "Compliance", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-025", name: "Intercompany Eliminations", dataSource: "connected", system: "SAP ERP", owner: "Consolidation", steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
    ];
    const baseStatuses = currentStatuses.length > 0 ? currentStatuses : defaultSeedControls;
    const completedStatuses = baseStatuses.map((s) => ({
      ...s,
      steps: { population: "complete", sampling: "complete", evidence: "complete", testing: "complete" },
      overallProgress: 100,
    }));
    setBlockState(sid, "fieldwork-execution", "statuses", completedStatuses);
    setBlockState(sid, "fieldwork-execution", "phase", "complete");
    setBlockState(sid, "fieldwork-execution", "resolvedBlocks", fieldworkBlockRules.map(r => r.controlId));
    setRuntime(sid, { activeIndex: 4, completedIndices: [0, 1, 2, 3, 4] });
  }, [fieldworkProject, fieldworkRuntime, setRuntime, setBlockState]);

  const executionPhaseForTimer = (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.phase as string) ?? null;
  const isHubVisible = !showCanvas;

  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [systemsExpanded, setSystemsExpanded] = useState(false);
  const [exceptionsModalOpen, setExceptionsModalOpen] = useState(false);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [nextStepsExpanded, setNextStepsExpanded] = useState(false);
  const [hubDetailView, setHubDetailView] = useState<string | null>(null);

  const resolvedBlocksList = useMemo(() => {
    if (!fieldworkProject) return [] as string[];
    return (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.resolvedBlocks as string[] | undefined) ?? [];
  }, [fieldworkProject, fieldworkRuntime]);

  const resolvedSet = useMemo(() => new Set(resolvedBlocksList), [resolvedBlocksList]);
  const exceptionControlIds = useMemo(() => new Set(fieldworkExceptions.map(e => e.controlId)), []);

  const handleResolveAction = useCallback((controlId: string) => {
    if (!fieldworkProject) return;
    const sid = fieldworkProject.sessionId;
    const prev = (useWorkflowSessionStore.getState().runtimeStates[sid]?.blockStates?.["fieldwork-execution"]?.resolvedBlocks as string[] | undefined) ?? [];
    if (!prev.includes(controlId)) {
      setBlockState(sid, "fieldwork-execution", "resolvedBlocks", [...prev, controlId]);
    }
  }, [fieldworkProject, setBlockState]);

  useEffect(() => {
    if (!isHubVisible || !fieldworkProject || executionPhaseForTimer !== "running") return;
    const sid = fieldworkProject.sessionId;
    const timer = setInterval(() => {
      const store = useWorkflowSessionStore.getState();
      const currentStatuses = (store.runtimeStates[sid]?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
      if (currentStatuses.length === 0) return;
      const currentResolved = new Set((store.runtimeStates[sid]?.blockStates?.["fieldwork-execution"]?.resolvedBlocks as string[] | undefined) ?? []);
      const next = tickFieldworkStatuses(currentStatuses, currentResolved);
      if (next) {
        store.setBlockState(sid, "fieldwork-execution", "statuses", next);
        const allDone = next.every((s) =>
          s.steps.population === "complete" && s.steps.sampling === "complete" &&
          s.steps.evidence === "complete" && s.steps.testing === "complete"
        );
        if (allDone) {
          store.setBlockState(sid, "fieldwork-execution", "phase", "complete");
          const rt = store.runtimeStates[sid];
          if (rt) {
            const existing = new Set(rt.completedIndices);
            existing.add(3);
            existing.add(4);
            store.setRuntime(sid, {
              activeIndex: 4,
              completedIndices: Array.from(existing),
            });
          }
        }
      }
    }, 800);
    return () => clearInterval(timer);
  }, [isHubVisible, fieldworkProject, executionPhaseForTimer]);

  if (showCanvas && fieldworkConfig && fieldworkProject) {
    return (
      <WorkflowSession
        config={fieldworkConfig}
        sessionId={fieldworkProject.sessionId}
        onBack={() => setShowCanvas(false)}
      />
    );
  }

  if (hubDetailView === "executive-report") {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-background">
        <div className="shrink-0 h-12 px-4 flex items-center gap-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
          <button
            onClick={() => setHubDetailView(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-hub-detail-back"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-border" />
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#266C92]" />
            <h2 className="text-sm font-semibold text-foreground">Executive Testing Report</h2>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ExecutiveReportView />
        </div>
      </div>
    );
  }

  const controlStatuses = (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
  const executionPhase = (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.phase as string) ?? null;
  const completedIndices = new Set(fieldworkRuntime?.completedIndices ?? []);
  const activeIndex = fieldworkRuntime?.activeIndex ?? 0;
  const totalBlocks = 5;
  const isComplete = executionPhase === "complete" && controlStatuses.length > 0 && controlStatuses.every(s => s.overallProgress === 100);

  const totalControls = controlStatuses.length;
  const completedControls = controlStatuses.filter((s) => s.overallProgress === 100).length;
  const autoControls = controlStatuses.filter((s) => s.dataSource === "connected");
  const manualControls = controlStatuses.filter((s) => s.dataSource === "manual");
  const autoComplete = autoControls.filter((s) => s.overallProgress === 100).length;
  const manualComplete = manualControls.filter((s) => s.overallProgress === 100).length;
  const automatedPct = totalControls > 0 ? Math.round((autoControls.length / totalControls) * 100) : 0;

  const hasWorkflow = !!fieldworkProject && !!fieldworkRuntime;

  const detectedExceptions = fieldworkExceptions.filter(exc => {
    const ctrl = controlStatuses.find(c => c.controlId === exc.controlId);
    return ctrl && ctrl.steps.testing === "complete";
  });

  const stepDot = (status: string, controlId?: string, step?: string) => {
    if (step === "testing" && status === "complete" && controlId && exceptionControlIds.has(controlId)) {
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

  const blockedActions = fieldworkBlockRules
    .filter(rule => {
      if (resolvedSet.has(rule.controlId)) return false;
      const ctrl = controlStatuses.find(c => c.controlId === rule.controlId);
      if (!ctrl) return false;
      return Object.values(ctrl.steps).some(s => s === "blocked");
    });

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="fieldwork-complex-hub">
      <div className={`flex-1 min-h-0 bg-slate-50 dark:bg-background px-8 py-5 ${hasWorkflow ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}>
        {!hasWorkflow ? (
          <div className="max-w-6xl mx-auto space-y-5" data-testid="fieldwork-hub-empty">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#266C92]" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Automated Control Testing</h2>
                  <p className="text-xs text-muted-foreground">No active workflow — launch to begin</p>
                </div>
              </div>
              <Button
                className="bg-[#266C92] hover:bg-[#1e5a7a] text-white text-xs h-8"
                onClick={() => launchWorkflow("control-testing")}
                data-testid="button-launch-fieldwork"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Start Control Testing
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-3" data-testid="fieldwork-stats-bar-empty">
              <Card className="border border-slate-200 dark:border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">Controls in Scope</span>
                  </div>
                  <span className="text-xl font-bold text-muted-foreground/40">—</span>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 dark:border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">Automated Coverage</span>
                  </div>
                  <span className="text-xl font-bold text-muted-foreground/40">—</span>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 dark:border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">Controls Tested</span>
                  </div>
                  <span className="text-xl font-bold text-muted-foreground/40">—</span>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 dark:border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">Exceptions</span>
                  </div>
                  <span className="text-xl font-bold text-muted-foreground/40">—</span>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border border-slate-200 dark:border-border">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Workflow className="w-4 h-4" />
                      Control Pipeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-muted/20 flex items-center justify-center mb-3">
                        <Shield className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">No active control pipeline</p>
                      <p className="text-xs text-muted-foreground/60">Launch a workflow to begin automated control testing</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-border">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <AlertTriangle className="w-4 h-4" />
                      Actions Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground/60 py-4 text-center">No actions pending</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border border-slate-200 dark:border-border">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Database className="w-4 h-4" />
                      Connected Systems
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {fieldworkSystemStatus.map((sys) => (
                        <div key={sys.name} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#266C92]" />
                            <span className="text-xs text-foreground">{sys.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{sys.type}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-border overflow-hidden">
                  <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-100 dark:border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Bot className="w-4 h-4" />
                      Optro Assistant
                    </CardTitle>
                  </CardHeader>
                  <div className="px-4 py-3 bg-[#266C92]/5 dark:bg-[#266C92]/10" data-testid="assistant-welcome-bubble-empty">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#266C92] flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-[#266C92] dark:text-[#4da3c9] mb-0.5">Optro Assistant</p>
                        <p className="text-[11px] text-foreground leading-relaxed">
                          Welcome to Automated Control Testing. Launch a workflow to begin — I'll guide you through control selection, data source mapping, and parallel test execution.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto flex flex-col h-full gap-5" data-testid="fieldwork-tracker-view" data-is-complete={isComplete} data-execution-phase={executionPhase} data-control-count={controlStatuses.length}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#266C92]" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Automated Control Testing</h2>
                  <p className="text-xs text-muted-foreground">
                    {isComplete
                      ? "All controls tested"
                      : executionPhase
                        ? `Fieldwork execution — ${completedControls}/${totalControls} controls complete`
                        : `Step ${activeIndex + 1} of ${totalBlocks} — Configuration`}
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
                  onClick={() => setShowCanvas(true)}
                  data-testid="button-open-fieldwork-session"
                >
                  Open Workflow
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" data-testid="button-fieldwork-hub-menu">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={fastForwardDemo} data-testid="menu-item-hub-fast-forward">
                      <FastForward className="w-4 h-4 mr-2" />
                      Fast-forward demo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3" data-testid="fieldwork-stats-bar">
              <Card className="border border-slate-200 dark:border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3.5 h-3.5 text-[#266C92]" />
                    <span className="text-[11px] text-muted-foreground font-medium">Controls in Scope</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-foreground">{totalControls}</span>
                    <span className="text-[10px] text-muted-foreground">{autoControls.length} auto · {manualControls.length} manual</span>
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
                    <span className="text-[10px] text-muted-foreground">{autoControls.length} connected systems</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 dark:border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#266C92]" />
                    <span className="text-[11px] text-muted-foreground font-medium">Controls Tested</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-foreground">{completedControls}</span>
                    <span className="text-[10px] text-muted-foreground">of {totalControls}{totalControls > 0 ? ` (${Math.round((completedControls / totalControls) * 100)}%)` : ""}</span>
                  </div>
                </CardContent>
              </Card>
              <Card
                className={`border ${detectedExceptions.length > 0 ? "border-red-200 dark:border-red-800/30 cursor-pointer hover:shadow-sm transition-shadow" : "border-slate-200 dark:border-border"}`}
                onClick={detectedExceptions.length > 0 ? () => setExceptionsModalOpen(true) : undefined}
                data-testid="fieldwork-exceptions-card"
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`w-3.5 h-3.5 ${detectedExceptions.length > 0 ? "text-red-500" : "text-slate-400"}`} />
                    <span className="text-[11px] text-muted-foreground font-medium">Exceptions</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-xl font-bold ${detectedExceptions.length > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>{detectedExceptions.length}</span>
                    <span className="text-[10px] text-muted-foreground">{detectedExceptions.length > 0 ? `${detectedExceptions.filter(e => e.severity === "high").length} high severity` : "from testing"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {blockedActions.length > 0 && (
              <Card className="border border-slate-200 dark:border-border" data-testid="fieldwork-actions-card">
                <button
                  onClick={() => setActionsExpanded(!actionsExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors"
                  data-testid="button-toggle-actions"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-foreground">Actions Required</span>
                    <Badge className="text-[10px] h-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{blockedActions.length} blocking</Badge>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${actionsExpanded ? "" : "-rotate-90"}`} />
                </button>
                {actionsExpanded && (
                  <CardContent className="px-4 pb-4 pt-0 space-y-2 border-t border-slate-100 dark:border-border">
                    {blockedActions.map((action) => (
                      <div
                        key={action.controlId}
                        className="p-3 rounded-lg border border-slate-200 dark:border-border bg-slate-50/40 dark:bg-muted/10 transition-colors"
                        data-testid={`action-item-${action.controlId}`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                          <span className="text-[10px] font-mono font-semibold text-[#266C92]">{action.controlId}</span>
                          <span className="text-xs font-medium text-foreground">{action.title}</span>
                          <Badge className="text-[9px] h-4 ml-auto shrink-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Blocked at {action.blockAtStep}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{action.description}</p>
                        <Button
                          size="sm"
                          className="h-6 text-[10px] bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                          onClick={() => handleResolveAction(action.controlId)}
                          data-testid={`button-resolve-${action.controlId}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Resolve & Resume
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}

            {isComplete && (
              <Card className="border border-[#266C92]/20 dark:border-[#266C92]/30 bg-[#266C92]/[0.03] dark:bg-[#266C92]/[0.05]" data-testid="fieldwork-next-steps-card">
                <button
                  onClick={() => setNextStepsExpanded(!nextStepsExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#266C92]/5 dark:hover:bg-[#266C92]/10 transition-colors"
                  data-testid="button-toggle-next-steps"
                >
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-[#266C92]" />
                    <span className="text-sm font-semibold text-foreground">Next Steps</span>
                    <Badge className="text-[10px] h-4 bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]">{fieldworkNextStepActions.length} actions</Badge>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${nextStepsExpanded ? "" : "-rotate-90"}`} />
                </button>
                {nextStepsExpanded && (
                  <CardContent className="px-4 pb-3 pt-0 border-t border-[#266C92]/10 dark:border-[#266C92]/20">
                    {fieldworkNextStepActions.map((a, i) => {
                      const iconMap: Record<string, typeof FileText> = { FileText, AlertTriangle, Target, Users, RefreshCcw, BarChart3 };
                      const Icon = iconMap[a.icon] || FileText;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 py-1.5 px-1 group"
                          data-testid={`tracker-next-step-${a.actionId}`}
                        >
                          <Icon className="w-3 h-3 shrink-0 text-[#266C92]" />
                          <span className="text-xs text-foreground flex-1 min-w-0 truncate">
                            {a.actionId === "triage-exceptions" ? `Review ${detectedExceptions.length} testing exceptions` : a.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2 text-[10px] text-[#266C92] hover:text-[#1e5a7a] hover:bg-[#266C92]/5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity shrink-0"
                            onClick={() => {
                              if (a.actionId === "executive-report") {
                                setHubDetailView("executive-report");
                              }
                              if (a.actionId === "triage-exceptions") {
                                setExceptionsModalOpen(true);
                              }
                            }}
                            data-testid={`button-next-step-${a.actionId}`}
                          >
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-5 flex-1 min-h-0">
              <div className="lg:col-span-2 min-h-0 flex flex-col">
                {controlStatuses.length > 0 && (
                  <Card className="border border-slate-200 dark:border-border flex flex-col min-h-0 flex-1" data-testid="fieldwork-pipeline-card">
                    <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-[#266C92]" />
                        Control Pipeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 flex-1 min-h-0 overflow-y-auto">
                      <div className="grid grid-cols-[1fr_6rem_2rem_2rem_2rem_2rem] gap-2 px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-slate-100 dark:border-border mb-1">
                        <span>Control</span>
                        <span>Source</span>
                        <span className="text-center" title="Population">Pop</span>
                        <span className="text-center" title="Sampling">Smp</span>
                        <span className="text-center" title="Evidence">Evd</span>
                        <span className="text-center" title="Testing">Test</span>
                      </div>

                      <div>
                      {manualControls.length > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 px-2 py-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              PBC Workflow ({manualComplete}/{manualControls.length})
                            </span>
                          </div>
                          {manualControls.map((ctrl) => {
                            const isBlocked = Object.values(ctrl.steps).some(s => s === "blocked");
                            const hasException = ctrl.steps.testing === "complete" && exceptionControlIds.has(ctrl.controlId);
                            return (
                              <div
                                key={ctrl.controlId}
                                className={`grid grid-cols-[1fr_6rem_2rem_2rem_2rem_2rem] gap-2 px-2 py-1.5 rounded items-center hover:bg-slate-50 dark:hover:bg-muted/20 transition-colors ${isBlocked || hasException ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}
                                data-testid={`pipeline-row-${ctrl.controlId}`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`text-[10px] font-mono font-semibold ${isBlocked || hasException ? "text-red-500" : "text-foreground"}`}>{ctrl.controlId}</span>
                                  <span className="text-xs text-foreground truncate">{ctrl.name}</span>
                                </div>
                                <span className={`text-[10px] font-medium truncate ${isBlocked ? "text-red-500" : "text-muted-foreground"}`}>{isBlocked ? "Blocked" : "PBC"}</span>
                                <div className="flex justify-center">{stepDot(ctrl.steps.population, ctrl.controlId, "population")}</div>
                                <div className="flex justify-center">{stepDot(ctrl.steps.sampling, ctrl.controlId, "sampling")}</div>
                                <div className="flex justify-center">{stepDot(ctrl.steps.evidence, ctrl.controlId, "evidence")}</div>
                                <div className="flex justify-center">{stepDot(ctrl.steps.testing, ctrl.controlId, "testing")}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {autoControls.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-2 py-1.5 border-t border-slate-100 dark:border-border">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Automated ({autoComplete}/{autoControls.length})
                            </span>
                          </div>
                          {autoControls.map((ctrl) => {
                            const hasException = ctrl.steps.testing === "complete" && exceptionControlIds.has(ctrl.controlId);
                            return (
                              <div
                                key={ctrl.controlId}
                                className={`grid grid-cols-[1fr_6rem_2rem_2rem_2rem_2rem] gap-2 px-2 py-1.5 rounded items-center hover:bg-slate-50 dark:hover:bg-muted/20 transition-colors ${hasException ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}
                                data-testid={`pipeline-row-${ctrl.controlId}`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`text-[10px] font-mono font-semibold ${hasException ? "text-red-600 dark:text-red-400" : "text-[#266C92]"}`}>{ctrl.controlId}</span>
                                  <span className="text-xs text-foreground truncate">{ctrl.name}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium truncate">Connected</span>
                                <div className="flex justify-center">{stepDot(ctrl.steps.population, ctrl.controlId, "population")}</div>
                                <div className="flex justify-center">{stepDot(ctrl.steps.sampling, ctrl.controlId, "sampling")}</div>
                                <div className="flex justify-center">{stepDot(ctrl.steps.evidence, ctrl.controlId, "evidence")}</div>
                                <div className="flex justify-center">{stepDot(ctrl.steps.testing, ctrl.controlId, "testing")}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      </div>
                    </CardContent>
                    <div className="flex items-center gap-3 text-[9px] text-muted-foreground px-4 py-2 border-t border-slate-100 dark:border-border shrink-0">
                      <div className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-[#266C92]" /><span>Complete</span></div>
                      <div className="flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 text-[#266C92] animate-spin" /><span>Running</span></div>
                      <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-slate-400" /><span>Waiting</span></div>
                      <div className="flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5 text-red-500" /><span>Blocked</span></div>
                      <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600" /><span>Pending</span></div>
                      {isComplete && (
                        <div className="flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5 text-red-500" /><span>Exception</span></div>
                      )}
                    </div>
                  </Card>
                )}

                {controlStatuses.length === 0 && (
                  <Card className="border border-slate-200 dark:border-border" data-testid="fieldwork-config-status">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <Workflow className="w-4 h-4 text-[#266C92]" />
                        <span className="text-sm font-semibold text-foreground">Workflow Configuration</span>
                        <Badge className="text-xs bg-[#266C92] text-white ml-auto">
                          Step {activeIndex + 1} of {totalBlocks}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mb-3">
                        {["Controls", "Data Sources", "PBC Mapping", "Execution", "Next Steps"].map((label, i) => (
                          <div key={label} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full h-1 rounded-full transition-all ${completedIndices.has(i) ? "bg-[#266C92]" : i === activeIndex ? "bg-[#266C92]/40" : "bg-slate-200 dark:bg-slate-700"}`} />
                            <span className={`text-[9px] ${completedIndices.has(i) ? "text-[#266C92] font-medium" : i === activeIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Open the workflow to continue configuring control selection, data sources, and PBC owner mapping before execution begins.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="min-h-0 flex flex-col gap-4">
                <Card className="border border-slate-200 dark:border-border shrink-0" data-testid="fieldwork-systems-card">
                  <button
                    onClick={() => setSystemsExpanded(!systemsExpanded)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-muted/5 transition-colors"
                    data-testid="button-toggle-systems"
                  >
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-[#266C92]" />
                      <span className="text-sm font-semibold text-foreground">Connected Systems</span>
                      <Badge className="text-[9px] h-4 bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]">{fieldworkSystemStatus.length}</Badge>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${systemsExpanded ? "" : "-rotate-90"}`} />
                  </button>
                  {systemsExpanded && (
                    <CardContent className="px-4 pb-3 pt-0 border-t border-slate-100 dark:border-border">
                      <div className="space-y-1">
                        {fieldworkSystemStatus.map((sys) => (
                          <div key={sys.name} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-muted/20" data-testid={`system-row-${sys.name}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#266C92] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{sys.name}</p>
                              <p className="text-[9px] text-muted-foreground">{sys.type} · {sys.controls} controls</p>
                            </div>
                            <span className="text-[9px] text-muted-foreground shrink-0">{sys.lastSync}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                <Card className="border border-slate-200 dark:border-border overflow-hidden flex flex-col flex-1 min-h-0" data-testid="fieldwork-activity-card">
                  <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-100 dark:border-border shrink-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#266C92]" />
                      Optro Assistant
                    </CardTitle>
                  </CardHeader>
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="px-4 py-3 bg-[#266C92]/5 dark:bg-[#266C92]/10 border-b border-slate-100 dark:border-border" data-testid="assistant-welcome-bubble">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#266C92] flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-[#266C92] dark:text-[#4da3c9] mb-0.5">Optro Assistant</p>
                          <p className="text-[11px] text-foreground leading-relaxed">
                            {isComplete
                              ? `Testing complete across all ${totalControls} controls. ${detectedExceptions.length} exception${detectedExceptions.length !== 1 ? "s" : ""} identified — review the findings and next steps below.`
                              : executionPhase === "running"
                                ? `Fieldwork execution is underway — ${completedControls} of ${totalControls} controls tested so far.${detectedExceptions.length > 0 ? ` ${detectedExceptions.length} exception${detectedExceptions.length !== 1 ? "s" : ""} detected from completed tests.` : ""} I'll continue running the remaining controls in parallel.`
                                : executionPhase
                                  ? `Execution is ${executionPhase}. Open the workflow to continue.`
                                  : "I've set up the Automated Control Testing workflow. We'll walk through control selection, data sources, and PBC mapping before kicking off parallel execution across all selected controls."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-border">
                      {fieldworkActivityFeed.map((entry) => (
                        <div
                          key={entry.id}
                          className={`px-4 py-2.5 border-l-2 ${
                            entry.type === "action-needed"
                              ? "border-l-red-400"
                              : entry.type === "warning"
                                ? "border-l-red-400"
                                : entry.type === "success"
                                  ? "border-l-[#266C92]"
                                  : "border-l-slate-200 dark:border-l-slate-700"
                          }`}
                          data-testid={`activity-${entry.id}`}
                        >
                          <p className="text-[11px] text-foreground leading-relaxed">{entry.message}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            <Bot className="w-2.5 h-2.5" />
                            <span>{entry.agent}</span>
                            <span>·</span>
                            <span>{entry.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        )}
      </div>

      <Dialog open={exceptionsModalOpen} onOpenChange={(open) => { setExceptionsModalOpen(open); if (!open) setSelectedExceptionId(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Testing Exceptions ({detectedExceptions.length})
            </DialogTitle>
            <DialogDescription>
              Controls flagged during automated testing that require review and remediation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
            {selectedExceptionId ? (() => {
              const exc = detectedExceptions.find(e => e.id === selectedExceptionId);
              if (!exc) return null;
              return (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedExceptionId(null)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-exception-back"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to all exceptions
                  </button>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${exc.severity === "high" ? "bg-red-100 dark:bg-red-900/20" : "bg-orange-100 dark:bg-orange-900/20"}`}>
                      <AlertTriangle className={`w-4 h-4 ${exc.severity === "high" ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{exc.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[9px] ${exc.severity === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                          {exc.severity === "high" ? "High Severity" : "Medium Severity"}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">{exc.controlId}</span>
                        <span className="text-[10px] text-muted-foreground">· {exc.controlName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-muted/10 rounded-lg p-3 border border-slate-100 dark:border-border">
                    <p className="text-xs text-foreground leading-relaxed">{exc.summary}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-[10px] text-muted-foreground">Samples tested: <strong className="text-foreground">{exc.samplesTested}</strong></span>
                      <span className="text-[10px] text-red-600 dark:text-red-400">Failed: <strong>{exc.samplesFailed}</strong></span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1.5">Detailed Findings</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{exc.detail}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1.5">Root Cause</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{exc.rootCause}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1.5">Recommendation</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{exc.recommendation}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2">Recommended Next Steps</h4>
                    <div className="space-y-1.5">
                      {exc.nextSteps.map((step, si) => (
                        <div key={si} className="flex items-start gap-2 p-2 rounded border border-slate-200 dark:border-border">
                          <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[8px] font-bold text-muted-foreground">{si + 1}</span>
                          </div>
                          <p className="text-[11px] text-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="space-y-2">
                {detectedExceptions.map((exc) => (
                  <button
                    key={exc.id}
                    onClick={() => setSelectedExceptionId(exc.id)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-border hover:border-red-200 dark:hover:border-red-800/30 hover:bg-red-50/30 dark:hover:bg-red-900/5 transition-all group"
                    data-testid={`exception-card-${exc.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${exc.severity === "high" ? "bg-red-100 dark:bg-red-900/20" : "bg-orange-100 dark:bg-orange-900/20"}`}>
                        <AlertTriangle className={`w-3.5 h-3.5 ${exc.severity === "high" ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground group-hover:text-red-700 dark:group-hover:text-red-400 truncate">{exc.title}</span>
                          <Badge className={`text-[8px] shrink-0 ${exc.severity === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                            {exc.severity}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{exc.summary}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-mono text-muted-foreground">{exc.controlId}</span>
                          <span className="text-[9px] text-muted-foreground">{exc.controlName}</span>
                          <span className="text-[9px] text-red-600 dark:text-red-400">{exc.samplesFailed}/{exc.samplesTested} failed</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-500 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SimpleAgentHub({ welcomeMessage, scenario }: { welcomeMessage: string; scenario: string }) {
  const activeProjects = useWorkflowSessionStore((s) => s.activeProjects);
  const currentSessionId = useWorkflowSessionStore((s) => s.currentSessionId);
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const addProject = useWorkflowSessionStore((s) => s.addProject);
  const activeSession = useWorkflowSessionStore((s) =>
    s.currentSessionId ? (s.sessionConfigs[s.currentSessionId] as WorkflowSessionConfig | null) ?? null : null
  );

  const launchWorkflow = useCallback((id: string) => {
    const sessionId = workflowRowToSession[id] || id;
    const meta = workflowSessionConfigs[sessionId];
    if (meta) {
      const config = meta.create();
      addProject({ sessionId, label: meta.label, icon: meta.icon }, config);
    }
  }, [addProject]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.workflowId) {
        launchWorkflow(detail.workflowId);
      }
    };
    window.addEventListener("agent-hub:launch-workflow", handler);
    return () => window.removeEventListener("agent-hub:launch-workflow", handler);
  }, [launchWorkflow]);

  if (activeSession && currentSessionId) {
    return (
      <WorkflowSession
        config={activeSession}
        sessionId={currentSessionId}
        onBack={() => setCurrentSession(null)}
      />
    );
  }

  const hasProjects = activeProjects.length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="text-white px-8 py-3 bg-cover bg-center bg-no-repeat relative shrink-0"
        style={{ backgroundImage: `url(${headerBgImage})` }}
      >
        <div className="w-full relative z-10 flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold truncate min-w-0" data-testid="simple-hub-welcome">
            {welcomeMessage}
          </h1>
          {hasProjects && (
            <p className="text-sm text-white/70 shrink-0 whitespace-nowrap">
              {activeProjects.length} active workflow{activeProjects.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 dark:bg-background px-8 py-6">
        <div className="max-w-3xl mx-auto">
          {hasProjects ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[#266C92]" />
                <h2 className="text-sm font-semibold text-foreground">Active Workflows</h2>
              </div>
              {activeProjects.map((project) => {
                const isFieldwork = project.sessionId === "control-testing";
                return isFieldwork
                  ? <FieldworkTracker key={project.sessionId} sessionId={project.sessionId} />
                  : <WorkflowTracker key={project.sessionId} sessionId={project.sessionId} />;
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="simple-hub-empty">
              <div className="w-16 h-16 rounded-2xl bg-[#266C92]/10 flex items-center justify-center mb-5">
                {scenario === "fieldwork-automation" ? (
                  <Shield className="w-8 h-8 text-[#266C92]/60" />
                ) : (
                  <Bot className="w-8 h-8 text-[#266C92]/60" />
                )}
              </div>
              <h2 className="text-base font-semibold text-foreground mb-2">No active workflows</h2>
              <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                {scenario === "fieldwork-automation"
                  ? "Use the Optro Assistant to configure and launch automated control testing workflows across your organization."
                  : "Use the Optro Assistant to start a workflow. Ask it to run a risk assessment, generate a scenario analysis, or propose a mitigation plan."}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60 bg-slate-100 dark:bg-muted/20 rounded-full px-4 py-2">
                <Bot className="w-3.5 h-3.5" />
                <span>{scenario === "fieldwork-automation" ? 'Try: "Start automated control testing"' : 'Try: "Start a risk assessment"'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AgentHubHomeProps {
  workspaceId: string;
  welcomeMessage: string;
}

export const workflowSessionConfigs: Record<string, { create: () => WorkflowSessionConfig; label: string; icon: string }> = {
  "risk-assessment": { create: getRiskAssessmentConfig, label: "Risk Assessment", icon: "trending-up" },
  "control-testing": { create: getFieldworkAutomationConfig, label: "Automated Control Testing", icon: "shield" },
};

const workflowRowToSession: Record<string, string> = {
  "er-direct-1": "risk-assessment",
};

export function AgentHubHome({ workspaceId, welcomeMessage }: AgentHubHomeProps) {
  const settings = useSettings();
  const isSimple = settings.agentHubViewMode !== "complex";
  const scenario = settings.agentHubScenario || "fieldwork-automation";
  const currentSessionId = useWorkflowSessionStore((s) => s.currentSessionId);

  if (isSimple) {
    return <SimpleAgentHub welcomeMessage={welcomeMessage} scenario={scenario} />;
  }

  if (scenario === "fieldwork-automation") {
    if (currentSessionId === "control-testing") {
      return <FieldworkComplexHub />;
    }
    return <OptroHome />;
  }

  return <ComplexAgentHub workspaceId={workspaceId} welcomeMessage={welcomeMessage} scenario={scenario} />;
}

function ComplexAgentHub({ workspaceId, welcomeMessage, scenario }: AgentHubHomeProps & { scenario: string }) {
  const hubData = useMemo(() => getAgentHubData(workspaceId), [workspaceId]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentSessionId = useWorkflowSessionStore((s) => s.currentSessionId);
  const addProject = useWorkflowSessionStore((s) => s.addProject);
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const activeSession = useWorkflowSessionStore((s) =>
    s.currentSessionId ? (s.sessionConfigs[s.currentSessionId] as WorkflowSessionConfig | null) ?? null : null
  );

  const launchWorkflow = useCallback((id: string) => {
    const sessionId = workflowRowToSession[id] || id;
    const meta = workflowSessionConfigs[sessionId];
    if (meta) {
      const config = meta.create();
      addProject({ sessionId, label: meta.label, icon: meta.icon }, config);
    }
  }, [addProject]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.workflowId) {
        launchWorkflow(detail.workflowId);
      }
    };
    window.addEventListener("agent-hub:launch-workflow", handler);
    return () => window.removeEventListener("agent-hub:launch-workflow", handler);
  }, [launchWorkflow]);

  const scrollToCategory = useCallback((categoryId: string) => {
    const el = sectionRefs.current[categoryId];
    if (el && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elTop = el.offsetTop - container.offsetTop;
      container.scrollTo({ top: elTop, behavior: "smooth" });
    }
  }, []);

  if (!hubData) return null;

  if (activeSession && currentSessionId) {
    return (
      <WorkflowSession
        config={activeSession}
        sessionId={currentSessionId}
        onBack={() => setCurrentSession(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="text-white px-8 py-3 bg-cover bg-center bg-no-repeat relative shrink-0"
        style={{ backgroundImage: `url(${headerBgImage})` }}
      >
        <div className="w-full relative z-10 flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold truncate min-w-0" data-testid="agent-hub-welcome">
            {welcomeMessage}
          </h1>
          <p className="text-sm text-white/70 shrink-0 whitespace-nowrap">
            {hubData.activeAgents} agents active · {hubData.pendingReview} awaiting your review
          </p>
        </div>
      </div>

      <div className="shrink-0 bg-slate-50 dark:bg-background px-8 pt-3 pb-3">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-testid="category-summary-bar">
            {hubData.categories.map((cat) => {
              const Icon = categoryIcons[cat.category];
              return (
                <Card
                  key={cat.category}
                  className="border border-slate-200 dark:border-border hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => scrollToCategory(cat.category)}
                  data-testid={`category-stat-${cat.category}`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.iconBg}`}>
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{cat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">{cat.activeCount}</span>
                        <span className="text-xs text-muted-foreground">active</span>
                        {cat.pendingCount > 0 && (
                          <Badge className="text-xs bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9] border-[#266C92]/20" variant="outline">
                            {cat.pendingCount}
                            <Eye className="w-3 h-3 ml-1" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-slate-50 dark:bg-background px-8 pb-4">
        <div className="max-w-6xl mx-auto h-full">
          <div className="grid lg:grid-cols-3 gap-5 h-full">
            <div
              ref={scrollContainerRef}
              className="lg:col-span-2 overflow-y-auto space-y-5 pr-1"
            >
              {hubData.categories.map((cat) => (
                <CategorySection
                  key={cat.category}
                  category={cat}
                  sectionRef={(el) => { sectionRefs.current[cat.category] = el; }}
                  onLaunchWorkflow={launchWorkflow}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
              <Card className="border border-slate-200 dark:border-border shrink-0" data-testid="hub-overview">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm font-semibold">Orchestrator Overview</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Agents</span>
                    <span className="font-semibold">{hubData.totalAgents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Now</span>
                    <span className="font-semibold text-[#266C92]">{hubData.activeAgents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pending Review</span>
                    <span className="font-semibold text-[#1a2332] dark:text-slate-300">{hubData.pendingReview}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      data-testid="button-view-all-pending"
                    >
                      View All Pending Reviews
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex-1 min-h-0 overflow-hidden">
                <ActivityFeed entries={hubData.activityFeed} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
