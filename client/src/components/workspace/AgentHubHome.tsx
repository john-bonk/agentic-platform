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
import { WorkflowSession, getRiskAssessmentConfig, getFieldworkAutomationConfig, tickFieldworkStatuses, type WorkflowSessionConfig, type ControlWorkflowStatus } from "./WorkflowSession";
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
              <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
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
            className={`h-full rounded-full transition-all duration-700 ${isComplete ? "bg-emerald-500" : "bg-[#266C92]"}`}
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
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0}%` }} />
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
                    <div className={`h-full rounded-full transition-all duration-500 ${r.status === "completed" ? "bg-emerald-500" : "bg-[#266C92]"}`} style={{ width: `${r.progress}%` }} />
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
    setRuntime(sessionId, { activeIndex: 4, completedIndices: [0, 1, 2, 3] });
  }, [sessionId, runtime, setRuntime, setBlockState]);

  const trackerExecPhase = (runtime?.blockStates?.["fieldwork-execution"]?.phase as string) ?? null;

  useEffect(() => {
    if (trackerExecPhase !== "running") return;
    const timer = setInterval(() => {
      const store = useWorkflowSessionStore.getState();
      const curr = (store.runtimeStates[sessionId]?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
      if (curr.length === 0) return;
      const next = tickFieldworkStatuses(curr);
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
      case "complete": return <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />;
      case "running": return <Loader2 className="w-2.5 h-2.5 text-[#266C92] animate-spin" />;
      case "waiting": return <Clock className="w-2.5 h-2.5 text-amber-500" />;
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
              <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
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
          <div className={`h-full rounded-full transition-all duration-700 ${isComplete ? "bg-emerald-500" : "bg-[#266C92]"}`} style={{ width: `${overallProgress}%` }} />
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
            {executionPhase === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="p-2 rounded-lg border border-slate-200 dark:border-border text-center">
              <p className="text-sm font-bold text-foreground">{completedControls}/{totalControls}</p>
              <p className="text-[9px] text-muted-foreground">Controls Done</p>
            </div>
            <div className="p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10 text-center">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{autoComplete}/{autoControls.length}</p>
              <p className="text-[9px] text-muted-foreground">Automated</p>
            </div>
            <div className="p-2 rounded-lg border border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 text-center">
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{manualComplete}/{manualControls.length}</p>
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
                  <span className={`text-[9px] font-mono font-medium ${ctrl.dataSource === "connected" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>{ctrl.controlId}</span>
                  <span className="text-[9px] text-muted-foreground truncate">{ctrl.name}</span>
                </div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.population)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.sampling)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.evidence)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.testing)}</div>
                <span className={`text-[8px] text-center font-medium ${ctrl.overallProgress === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>{ctrl.overallProgress}%</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[9px] text-muted-foreground px-1 mt-2 pt-2 border-t border-slate-100 dark:border-border">
            <div className="flex items-center gap-0.5"><Loader2 className="w-2 h-2 text-[#266C92] animate-spin" /><span>Running</span></div>
            <span>·</span>
            <div className="flex items-center gap-0.5"><Clock className="w-2 h-2 text-amber-500" /><span>Waiting</span></div>
            <span>·</span>
            <div className="flex items-center gap-0.5"><CheckCircle2 className="w-2 h-2 text-emerald-500" /><span>Done</span></div>
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
  { name: "SAP ERP", type: "ERP", controls: 4, lastSync: "2 min ago" },
  { name: "Okta IAM", type: "Identity", controls: 2, lastSync: "Just now" },
  { name: "ServiceNow", type: "ITSM", controls: 1, lastSync: "5 min ago" },
  { name: "AWS CloudTrail", type: "Cloud", controls: 1, lastSync: "1 min ago" },
  { name: "Genetec Security", type: "Physical", controls: 1, lastSync: "8 min ago" },
  { name: "Coupa", type: "Procurement", controls: 1, lastSync: "3 min ago" },
  { name: "CrowdStrike", type: "Endpoint", controls: 1, lastSync: "Just now" },
];

const fieldworkActionItems = [
  { id: "a-1", controlId: "CTL-005", title: "Missing Dual Approval", description: "2 journal entries in Q4 batch lack required dual approval signatures", severity: "high" as const },
  { id: "a-2", controlId: "CTL-007", title: "PBC Response Overdue", description: "Revenue Recognition evidence request — no response from Jun Li (3 days)", severity: "medium" as const },
  { id: "a-3", controlId: "CTL-003", title: "Manual Evidence Required", description: "SoD matrix needs manual upload for 3 departments", severity: "medium" as const },
];

function FieldworkComplexHub({ welcomeMessage }: { welcomeMessage: string }) {
  const activeProjects = useWorkflowSessionStore((s) => s.activeProjects);
  const currentSessionId = useWorkflowSessionStore((s) => s.currentSessionId);
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const addProject = useWorkflowSessionStore((s) => s.addProject);
  const setRuntime = useWorkflowSessionStore((s) => s.setRuntime);
  const setBlockState = useWorkflowSessionStore((s) => s.setBlockState);
  const activeSession = useWorkflowSessionStore((s) =>
    s.currentSessionId ? (s.sessionConfigs[s.currentSessionId] as WorkflowSessionConfig | null) ?? null : null
  );

  const fieldworkProject = activeProjects.find((p) => p.sessionId === "control-testing");
  const fieldworkRuntime = useWorkflowSessionStore((s) =>
    fieldworkProject ? s.runtimeStates[fieldworkProject.sessionId] : null
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
      if (detail?.workflowId) launchWorkflow(detail.workflowId);
    };
    window.addEventListener("agent-hub:launch-workflow", handler);
    return () => window.removeEventListener("agent-hub:launch-workflow", handler);
  }, [launchWorkflow]);

  const fastForwardDemo = useCallback(() => {
    if (!fieldworkProject) return;
    const sid = fieldworkProject.sessionId;
    const currentStatuses = (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
    const baseStatuses = currentStatuses.length > 0 ? currentStatuses : [
      { controlId: "CTL-001", name: "Access Provisioning", dataSource: "connected" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-002", name: "Change Management", dataSource: "connected" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-003", name: "Segregation of Duties", dataSource: "manual" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-005", name: "Journal Entry Approval", dataSource: "connected" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-006", name: "Bank Reconciliation", dataSource: "connected" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-007", name: "Revenue Recognition", dataSource: "manual" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-008", name: "Vendor Payment Authorization", dataSource: "connected" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-009", name: "Physical Access Controls", dataSource: "connected" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-012", name: "Procurement Approval", dataSource: "connected" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-013", name: "User Access Review", dataSource: "connected" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
      { controlId: "CTL-016", name: "Privilege Escalation Monitoring", dataSource: "connected" as const, steps: { population: "pending", sampling: "pending", evidence: "pending", testing: "pending" }, overallProgress: 0 },
    ];
    const completedStatuses = baseStatuses.map((s) => ({
      ...s,
      steps: { population: "complete", sampling: "complete", evidence: "complete", testing: "complete" },
      overallProgress: 100,
    }));
    setBlockState(sid, "fieldwork-execution", "statuses", completedStatuses);
    setBlockState(sid, "fieldwork-execution", "phase", "complete");
    setRuntime(sid, { activeIndex: 4, completedIndices: [0, 1, 2, 3] });
  }, [fieldworkProject, fieldworkRuntime, setRuntime, setBlockState]);

  const executionPhaseForTimer = (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.phase as string) ?? null;
  const isHubVisible = !(activeSession && currentSessionId);

  useEffect(() => {
    if (!isHubVisible || !fieldworkProject || executionPhaseForTimer !== "running") return;
    const sid = fieldworkProject.sessionId;
    const timer = setInterval(() => {
      const store = useWorkflowSessionStore.getState();
      const currentStatuses = (store.runtimeStates[sid]?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
      if (currentStatuses.length === 0) return;
      const next = tickFieldworkStatuses(currentStatuses);
      if (next) {
        store.setBlockState(sid, "fieldwork-execution", "statuses", next);
        const allDone = next.every((s) =>
          s.steps.population === "complete" && s.steps.sampling === "complete" &&
          s.steps.evidence === "complete" && s.steps.testing === "complete"
        );
        if (allDone) {
          store.setBlockState(sid, "fieldwork-execution", "phase", "complete");
          const rt = store.runtimeStates[sid];
          if (rt && !rt.completedIndices.includes(3)) {
            store.setRuntime(sid, {
              activeIndex: 4,
              completedIndices: [...rt.completedIndices.filter((i) => i !== 3), 3],
            });
          }
        }
      }
    }, 800);
    return () => clearInterval(timer);
  }, [isHubVisible, fieldworkProject, executionPhaseForTimer]);

  if (activeSession && currentSessionId) {
    return (
      <WorkflowSession
        config={activeSession}
        sessionId={currentSessionId}
        onBack={() => setCurrentSession(null)}
      />
    );
  }

  const controlStatuses = (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
  const executionPhase = (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.phase as string) ?? null;
  const completedIndices = new Set(fieldworkRuntime?.completedIndices ?? []);
  const activeIndex = fieldworkRuntime?.activeIndex ?? 0;
  const totalBlocks = 5;
  const overallProgress = Math.round((completedIndices.size / totalBlocks) * 100);
  const isComplete = completedIndices.size === totalBlocks;

  const totalControls = controlStatuses.length;
  const completedControls = controlStatuses.filter((s) => s.overallProgress === 100).length;
  const autoControls = controlStatuses.filter((s) => s.dataSource === "connected");
  const manualControls = controlStatuses.filter((s) => s.dataSource === "manual");
  const autoComplete = autoControls.filter((s) => s.overallProgress === 100).length;
  const manualComplete = manualControls.filter((s) => s.overallProgress === 100).length;
  const automatedPct = totalControls > 0 ? Math.round((autoControls.length / totalControls) * 100) : 0;

  const hasWorkflow = !!fieldworkProject && !!fieldworkRuntime;

  const stepDot = (status: string) => {
    switch (status) {
      case "complete": return <div className="w-2 h-2 rounded-full bg-emerald-500" />;
      case "running": return <div className="w-2 h-2 rounded-full bg-[#266C92] animate-pulse" />;
      case "waiting": return <div className="w-2 h-2 rounded-full bg-amber-400" />;
      default: return <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="fieldwork-complex-hub">
      <div
        className="text-white px-8 py-3 bg-cover bg-center bg-no-repeat relative shrink-0"
        style={{ backgroundImage: `url(${headerBgImage})` }}
      >
        <div className="w-full relative z-10 flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold truncate min-w-0" data-testid="fieldwork-hub-welcome">
            {welcomeMessage}
          </h1>
          {hasWorkflow && (
            <div className="flex items-center gap-3 text-sm text-white/70 shrink-0">
              {totalControls > 0 ? (
                <>
                  <span>{totalControls} controls in scope</span>
                  <span className="text-white/30">·</span>
                  <span>{totalControls - completedControls > 0 ? `${totalControls - completedControls} in progress` : "All complete"}</span>
                  {totalControls > 0 && fieldworkActionItems.length > 0 && (
                    <>
                      <span className="text-white/30">·</span>
                      <span className="text-amber-300">{fieldworkActionItems.length} need attention</span>
                    </>
                  )}
                </>
              ) : (
                <span>Configuring workflow</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 dark:bg-background px-8 py-5">
        {!hasWorkflow ? (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center" data-testid="fieldwork-hub-empty">
            <div className="w-16 h-16 rounded-2xl bg-[#266C92]/10 flex items-center justify-center mb-5">
              <Shield className="w-8 h-8 text-[#266C92]/60" />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-2">Automated Control Testing</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
              Configure and launch an automated control testing workflow. The platform will orchestrate population extraction, sampling, evidence collection, and testing across your connected systems.
            </p>
            <Button
              className="bg-[#266C92] hover:bg-[#1e5a7a] text-white"
              onClick={() => launchWorkflow("control-testing")}
              data-testid="button-launch-fieldwork"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Control Testing
            </Button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-5">
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
                {isComplete ? (
                  <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-[#266C92] text-white">
                    <Activity className="w-3 h-3 mr-1" />
                    {overallProgress}%
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setCurrentSession(fieldworkProject.sessionId)}
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
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] text-muted-foreground font-medium">Controls Tested</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-foreground">{completedControls}</span>
                    <span className="text-[10px] text-muted-foreground">of {totalControls}{totalControls > 0 ? ` (${Math.round((completedControls / totalControls) * 100)}%)` : ""}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 dark:border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] text-muted-foreground font-medium">Exceptions</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-foreground">{fieldworkActionItems.filter((a) => a.severity === "high").length}</span>
                    <span className="text-[10px] text-muted-foreground">{fieldworkActionItems.length} total findings</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                {controlStatuses.length > 0 && (
                  <Card className="border border-slate-200 dark:border-border" data-testid="fieldwork-pipeline-card">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-[#266C92]" />
                        Control Pipeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="grid grid-cols-[1fr_6rem_2rem_2rem_2rem_2rem] gap-2 px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-slate-100 dark:border-border mb-1">
                        <span>Control</span>
                        <span>Source</span>
                        <span className="text-center" title="Population">Pop</span>
                        <span className="text-center" title="Sampling">Smp</span>
                        <span className="text-center" title="Evidence">Evd</span>
                        <span className="text-center" title="Testing">Test</span>
                      </div>

                      {autoControls.length > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 px-2 py-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                              Automated ({autoComplete}/{autoControls.length})
                            </span>
                          </div>
                          {autoControls.map((ctrl) => (
                            <div
                              key={ctrl.controlId}
                              className="grid grid-cols-[1fr_6rem_2rem_2rem_2rem_2rem] gap-2 px-2 py-1.5 rounded items-center hover:bg-slate-50 dark:hover:bg-muted/20 transition-colors"
                              data-testid={`pipeline-row-${ctrl.controlId}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] font-mono font-semibold text-[#266C92]">{ctrl.controlId}</span>
                                <span className="text-xs text-foreground truncate">{ctrl.name}</span>
                              </div>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">Connected</span>
                              <div className="flex justify-center">{stepDot(ctrl.steps.population)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.sampling)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.evidence)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.testing)}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {manualControls.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-2 py-1.5 border-t border-slate-100 dark:border-border">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                              PBC Workflow ({manualComplete}/{manualControls.length})
                            </span>
                          </div>
                          {manualControls.map((ctrl) => (
                            <div
                              key={ctrl.controlId}
                              className="grid grid-cols-[1fr_6rem_2rem_2rem_2rem_2rem] gap-2 px-2 py-1.5 rounded items-center hover:bg-slate-50 dark:hover:bg-muted/20 transition-colors"
                              data-testid={`pipeline-row-${ctrl.controlId}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400">{ctrl.controlId}</span>
                                <span className="text-xs text-foreground truncate">{ctrl.name}</span>
                              </div>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate">PBC</span>
                              <div className="flex justify-center">{stepDot(ctrl.steps.population)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.sampling)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.evidence)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.testing)}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[9px] text-muted-foreground px-2 mt-3 pt-2 border-t border-slate-100 dark:border-border">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span>Complete</span></div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#266C92] animate-pulse" /><span>Running</span></div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /><span>Waiting</span></div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" /><span>Pending</span></div>
                      </div>
                    </CardContent>
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

                <Card className="border border-slate-200 dark:border-border" data-testid="fieldwork-actions-card">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-500" />
                      Actions Required
                      <Badge className="text-[10px] h-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ml-auto">{fieldworkActionItems.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 space-y-2">
                    {fieldworkActionItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-muted/20 ${
                          item.severity === "high"
                            ? "border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-900/5"
                            : "border-amber-200 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-900/5"
                        }`}
                        data-testid={`action-item-${item.id}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-semibold text-[#266C92]">{item.controlId}</span>
                          <span className="text-xs font-medium text-foreground">{item.title}</span>
                          <Badge className={`text-[9px] h-4 ml-auto ${
                            item.severity === "high"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}>
                            {item.severity}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border border-slate-200 dark:border-border" data-testid="fieldwork-systems-card">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Server className="w-4 h-4 text-[#266C92]" />
                      Connected Systems
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="space-y-1">
                      {fieldworkSystemStatus.map((sys) => (
                        <div key={sys.name} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-muted/20" data-testid={`system-row-${sys.name}`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{sys.name}</p>
                            <p className="text-[9px] text-muted-foreground">{sys.type} · {sys.controls} controls</p>
                          </div>
                          <span className="text-[9px] text-muted-foreground shrink-0">{sys.lastSync}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-border overflow-hidden" data-testid="fieldwork-activity-card">
                  <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-100 dark:border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                      Agent Activity
                    </CardTitle>
                  </CardHeader>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-border">
                    {fieldworkActivityFeed.map((entry) => (
                      <div
                        key={entry.id}
                        className={`px-4 py-2.5 border-l-2 ${
                          entry.type === "action-needed"
                            ? "border-l-amber-400"
                            : entry.type === "warning"
                              ? "border-l-red-400"
                              : entry.type === "success"
                                ? "border-l-emerald-400"
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
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
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

  if (isSimple) {
    return <SimpleAgentHub welcomeMessage={welcomeMessage} scenario={scenario} />;
  }

  if (scenario === "fieldwork-automation") {
    return <FieldworkComplexHub welcomeMessage={welcomeMessage} />;
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
