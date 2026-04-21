import { useState, useMemo, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { useSettings } from "@/components/settings-panel";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";
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
  ChevronRight,
  RefreshCcw,
  ArrowUpRight,
  History,
  ClipboardCheck,
  Fingerprint,
  ShieldCheck,
  GitBranch,
  Layers,
  Hash,
  Upload,
  Send,
  ThumbsUp,
  RotateCcw,
  FileCheck,
  Table2,
  Search,
  Sparkles,
  SlidersHorizontal,
  Flag,
  Scale,
  Settings,
  MessageSquare,
  Copy,
  Bookmark,
  Link2,
  X,
  Pencil,
  Download,
  ChevronUp,
  LayoutDashboard,
  FileSpreadsheet,
  Plus,
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
import { WorkflowSession, ExecutiveReportView, getRiskAssessmentConfig, getFieldworkAutomationConfig, tickFieldworkStatuses, fieldworkBlockRules, fieldworkExceptions, fieldworkNextStepActions, masterControlsList, fieldworkStepOrder, DEMO_CONTROL_ID, type WorkflowSessionConfig, type ControlWorkflowStatus, type FieldworkException } from "./WorkflowSession";
import { useWorkflowSessionStore } from "@/lib/workflowSessionStore";
const AnnotationOverlay = lazy(() => import("./AnnotationOverlay"));

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
      steps: { readiness: "complete", population: "complete", sampling: "complete", evidence: "complete", testing: "complete", testEffectiveness: "complete" },
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
          s.steps.evidence === "complete" && s.steps.testing === "complete" && s.steps.testEffectiveness === "complete"
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
            <div className="grid grid-cols-[1fr_1.8rem_1.8rem_1.8rem_1.8rem_1.8rem_1.8rem_2.5rem] gap-0.5 px-2 py-1 text-[7px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Control</span><span className="text-center">Rdy</span><span className="text-center">Pop</span><span className="text-center">Smp</span><span className="text-center">Evd</span><span className="text-center">Tst</span><span className="text-center">Eff</span><span className="text-center">%</span>
            </div>
            {controlStatuses.map(ctrl => (
              <div key={ctrl.controlId} className="grid grid-cols-[1fr_1.8rem_1.8rem_1.8rem_1.8rem_1.8rem_1.8rem_2.5rem] gap-0.5 px-2 py-1 rounded text-xs items-center hover:bg-slate-50 dark:hover:bg-muted/20">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[9px] font-mono font-medium text-foreground">{ctrl.controlId}</span>
                  <span className="text-[9px] text-muted-foreground truncate">{ctrl.name}</span>
                </div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.readiness)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.population)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.sampling)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.evidence)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.testing)}</div>
                <div className="flex justify-center">{stepIcon(ctrl.steps.testEffectiveness)}</div>
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

  const [, setLocation] = useLocation();

  const launchControlTestingDirect = useCallback(() => {
    setLocation("/testing-plan");
  }, [setLocation]);

  const taskItems = [
    {
      id: "task-control-testing",
      title: "Test Controls for SOX Audit",
      description: "Launch automated control testing across connected systems and PBC workflows for the current audit period.",
      icon: Shield,
      iconColor: "text-slate-500 dark:text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800/30",
      action: launchControlTestingDirect,
      actionLabel: "Start",
      configAction: launchControlTestingFromCard,
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
        <div className="w-[90%] mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-1" data-testid="text-optro-welcome">Welcome to Optro</h1>
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
                      <div className="flex items-center gap-1.5 shrink-0">
                        {task.configAction && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); task.configAction!(); }}
                            data-testid={`button-config-${task.id}`}
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-[#266C92] hover:bg-[#1e5a7a] text-white shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); task.action!(); }}
                          data-testid={`button-${task.id}`}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {task.actionLabel}
                        </Button>
                      </div>
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

type ReadinessRow = { category: string; dataSource: string; status: "green" | "amber" | "red" };

const readinessAssessmentRows: ReadinessRow[] = [
  { category: "Control Description", dataSource: "SOXHUB Control Record", status: "green" },
  { category: "Testing Procedure", dataSource: "Control Record / Test Plan", status: "green" },
  { category: "Testing Attributes", dataSource: "Control Record / Test Plan", status: "amber" },
  { category: "Supplementary Docs", dataSource: "Attached to control/process", status: "green" },
  { category: "Population File", dataSource: "Uploaded / Requested", status: "red" },
  { category: "Sample Selections", dataSource: "Derived by AI / Pre-selected", status: "red" },
  { category: "Sample Evidence", dataSource: "Uploaded / Requested", status: "red" },
];

type SubStepDef = {
  id: string;
  label: string;
  description: string;
  icon: typeof FileCheck;
};

type StepActionDef = {
  id: string;
  label: string;
  variant: "primary" | "secondary" | "outline" | "destructive";
  icon: typeof FileCheck;
  showWhen: string[];
  isResolve?: boolean;
};

type OutputRow = { label: string; value: string; status?: "green" | "amber" | "red" | "neutral" };

type StepNodeInfo = {
  nodeLabel: string;
  aiDescription: string;
  userTouchpoint: string;
  substeps: SubStepDef[];
  actions: StepActionDef[];
  outputRows: OutputRow[];
};

const stepNodeInfo: Record<string, StepNodeInfo> = {
  readiness: {
    nodeLabel: "Readiness",
    aiDescription: "AI evaluates required inputs, interprets the control description, extracts testable attributes, and produces a structured test plan.",
    userTouchpoint: "Review readiness assessment and approve the interpreted test plan before workflow proceeds.",
    substeps: [
      { id: "rd-assess", label: "Input Readiness Assessment", description: "Evaluate availability and quality of all required control inputs and data sources", icon: FileCheck },
      { id: "cs-interpret", label: "Control Description Interpretation", description: "AI parses narrative control description into structured fields", icon: Search },
      { id: "cs-extract", label: "Attribute Extraction", description: "Identify testable attributes from control documentation", icon: Table2 },
      { id: "cs-plan", label: "Test Plan Generation", description: "Compose step-by-step test plan aligned to extracted attributes", icon: ClipboardCheck },
    ],
    actions: [
      { id: "approve-plan", label: "Approve Test Plan", variant: "primary", icon: ThumbsUp, showWhen: ["waiting", "running", "complete"] },
      { id: "request-revision", label: "Request Revision", variant: "outline", icon: RotateCcw, showWhen: ["waiting", "running", "complete"] },
      { id: "resolve-setup", label: "Resolve & Resume", variant: "primary", icon: CheckCircle2, showWhen: ["blocked"], isResolve: true },
    ],
    outputRows: [
      { label: "Control Objective", value: "Ensure access provisioning follows approval matrix", status: "green" },
      { label: "Test Approach", value: "Inspect sample of provisioning requests against approval logs", status: "green" },
      { label: "Attributes Identified", value: "4 testable attributes extracted", status: "green" },
      { label: "Estimated Samples", value: "25 (risk-adjusted)", status: "neutral" },
    ],
  },
  population: {
    nodeLabel: "Population Acquisition",
    aiDescription: "AI ingests the population data file, validates record completeness, and flags gaps or anomalies against the defined control period.",
    userTouchpoint: "Review validation results and resolve any flagged anomalies before sampling.",
    substeps: [
      { id: "pop-ingest", label: "File Ingestion", description: "Parse and load population data from source file", icon: Upload },
      { id: "pop-validate", label: "Schema Validation", description: "Validate field types, required columns, and format consistency", icon: FileCheck },
      { id: "pop-complete", label: "Completeness Check", description: "Verify coverage against expected control period and entity scope", icon: Table2 },
      { id: "pop-anomaly", label: "Anomaly Detection", description: "Flag duplicate records, date gaps, and statistical outliers", icon: AlertTriangle },
    ],
    actions: [
      { id: "confirm-population", label: "Confirm Population", variant: "primary", icon: ThumbsUp, showWhen: ["waiting", "running", "complete"] },
      { id: "upload-replacement", label: "Upload Replacement", variant: "outline", icon: Upload, showWhen: ["waiting", "running", "blocked"] },
      { id: "resolve-population", label: "Resolve & Resume", variant: "primary", icon: CheckCircle2, showWhen: ["blocked"], isResolve: true },
    ],
    outputRows: [
      { label: "Total Records", value: "2,847", status: "green" },
      { label: "Period Coverage", value: "Jan 2025 – Dec 2025", status: "green" },
      { label: "Gap Days", value: "0", status: "green" },
      { label: "Duplicates Found", value: "3 (auto-excluded)", status: "amber" },
      { label: "Schema Errors", value: "0", status: "green" },
    ],
  },
  sampling: {
    nodeLabel: "Sampling",
    aiDescription: "AI applies risk-weighted stratification and statistical methods to select a reproducible sample subset from the validated population.",
    userTouchpoint: "Verify methodology, sample size, exclusions, and final selections.",
    substeps: [
      { id: "smp-method", label: "Methodology Selection", description: "Determine sampling approach (statistical, judgmental, or hybrid)", icon: SlidersHorizontal },
      { id: "smp-stratify", label: "Risk Stratification", description: "Assign risk weights to population segments for proportional coverage", icon: Layers },
      { id: "smp-size", label: "Sample Size Calculation", description: "Compute minimum sample size for target confidence and tolerable error", icon: Scale },
      { id: "smp-select", label: "Selection Execution", description: "Execute random/stratified selection and record seed for reproducibility", icon: Sparkles },
    ],
    actions: [
      { id: "approve-sample", label: "Approve Sample", variant: "primary", icon: ThumbsUp, showWhen: ["waiting", "running", "complete"] },
      { id: "adjust-parameters", label: "Adjust Parameters", variant: "outline", icon: SlidersHorizontal, showWhen: ["waiting", "running", "complete"] },
      { id: "resolve-sampling", label: "Resolve & Resume", variant: "primary", icon: CheckCircle2, showWhen: ["blocked"], isResolve: true },
    ],
    outputRows: [
      { label: "Methodology", value: "Stratified random (MUS)", status: "neutral" },
      { label: "Confidence Level", value: "95%", status: "green" },
      { label: "Population Size", value: "2,847", status: "neutral" },
      { label: "Sample Size", value: "25", status: "green" },
      { label: "Strata", value: "3 risk tiers", status: "neutral" },
      { label: "Exclusions", value: "0", status: "green" },
    ],
  },
  evidence: {
    nodeLabel: "Evidence",
    aiDescription: "AI maps evidence requirements, collects from sources, classifies documents, extracts structured fields, and cross-references against sample data.",
    userTouchpoint: "Audit the evidence matrix, upload documents, and review extracted fields for accuracy.",
    substeps: [
      { id: "evd-map", label: "Requirement Mapping", description: "Map each sample item to its required evidence types", icon: Table2 },
      { id: "evd-source", label: "Source Identification", description: "Match required evidence to available connected systems or file uploads", icon: Search },
      { id: "evd-collect", label: "Collection & Upload", description: "Pull from connected sources or accept manual uploads", icon: Upload },
      { id: "eu-classify", label: "Document Classification", description: "Categorize each evidence file by type (approval, log, report, screenshot)", icon: Layers },
      { id: "eu-extract", label: "Field Extraction", description: "Extract key fields (dates, approvers, amounts, statuses) from documents", icon: Search },
      { id: "eu-parse", label: "Value Parsing", description: "Normalize extracted values into comparable, structured data", icon: Table2 },
      { id: "eu-xref", label: "Cross-Reference Validation", description: "Match extracted values against population/sample data for consistency", icon: GitBranch },
    ],
    actions: [
      { id: "upload-evidence", label: "Upload Evidence", variant: "primary", icon: Upload, showWhen: ["waiting", "running", "blocked"] },
      { id: "send-pbc", label: "Send PBC Request", variant: "outline", icon: Send, showWhen: ["waiting", "running", "blocked"] },
      { id: "confirm-extraction", label: "Confirm Extraction", variant: "primary", icon: ThumbsUp, showWhen: ["waiting", "running", "complete"] },
      { id: "resolve-evidence", label: "Resolve & Resume", variant: "primary", icon: CheckCircle2, showWhen: ["blocked"], isResolve: true },
    ],
    outputRows: [
      { label: "Items Requiring Evidence", value: "25", status: "neutral" },
      { label: "Auto-Collected", value: "18 (72%)", status: "green" },
      { label: "Manually Uploaded", value: "4 (16%)", status: "green" },
      { label: "Documents Processed", value: "22", status: "green" },
      { label: "Fields Extracted", value: "88", status: "green" },
      { label: "Cross-Ref Matches", value: "20 / 22", status: "green" },
    ],
  },
  testing: {
    nodeLabel: "Testing",
    aiDescription: "AI tests each sample against defined control attributes, producing Pass/Fail determinations with rationale and evidence references.",
    userTouchpoint: "Audit individual attribute results, review AI reasoning, and override findings where warranted.",
    substeps: [
      { id: "ae-test", label: "Attribute Testing", description: "Evaluate each sample item against each control attribute", icon: ClipboardCheck },
      { id: "ae-determine", label: "Pass/Fail Determination", description: "Apply pass/fail logic based on attribute criteria and evidence", icon: Scale },
      { id: "ae-rationale", label: "Rationale Generation", description: "Document reasoning chain and evidence links for each determination", icon: FileText },
      { id: "ae-exception", label: "Exception Identification", description: "Flag failed attributes and classify exception severity", icon: AlertTriangle },
    ],
    actions: [
      { id: "approve-results", label: "Approve Results", variant: "primary", icon: ThumbsUp, showWhen: ["waiting", "running", "complete"] },
      { id: "override-finding", label: "Override Finding", variant: "outline", icon: RotateCcw, showWhen: ["waiting", "running", "complete"] },
      { id: "resolve-evaluation", label: "Resolve & Resume", variant: "primary", icon: CheckCircle2, showWhen: ["blocked"], isResolve: true },
    ],
    outputRows: [
      { label: "Samples Evaluated", value: "25 / 25", status: "green" },
      { label: "Attributes Tested", value: "125 (5 × 25)", status: "neutral" },
      { label: "Attributes Passed", value: "2 of 5 (A2, A5)", status: "red" },
      { label: "Attributes Failed", value: "3 of 5 (A1, A3, A4)", status: "red" },
      { label: "Exceptions Identified", value: "3", status: "red" },
    ],
  },
  testEffectiveness: {
    nodeLabel: "Test Effectiveness",
    aiDescription: "AI aggregates attribute results, validates testing completeness, assesses confidence levels, and produces the control effectiveness conclusion.",
    userTouchpoint: "Address flagged items, confirm the conclusion, and escalate if needed.",
    substeps: [
      { id: "te-aggregate", label: "Results Aggregation", description: "Consolidate all attribute evaluations into control-level metrics", icon: BarChart3 },
      { id: "te-complete", label: "Completeness Validation", description: "Confirm all required samples and attributes have been evaluated", icon: FileCheck },
      { id: "te-confidence", label: "Confidence Assessment", description: "Score overall testing confidence and flag low-confidence areas", icon: Target },
      { id: "te-conclude", label: "Effectiveness Conclusion", description: "Determine Effective / Ineffective with supporting rationale", icon: ShieldCheck },
    ],
    actions: [
      { id: "finalize-conclusion", label: "Finalize Conclusion", variant: "primary", icon: ThumbsUp, showWhen: ["waiting", "running", "complete"] },
      { id: "escalate-review", label: "Escalate for Review", variant: "outline", icon: Send, showWhen: ["waiting", "running", "complete", "blocked"] },
      { id: "resolve-effectiveness", label: "Resolve & Resume", variant: "primary", icon: CheckCircle2, showWhen: ["blocked"], isResolve: true },
    ],
    outputRows: [
      { label: "Attribute Pass Rate", value: "40% (2 of 5)", status: "red" },
      { label: "Testing Coverage", value: "100%", status: "green" },
      { label: "Confidence Score", value: "Medium-High", status: "amber" },
      { label: "Exceptions", value: "3 identified", status: "red" },
      { label: "Conclusion", value: "Ineffective", status: "red" },
    ],
  },
};

function ReadinessAssessmentContent({ stepStatus, rows }: { stepStatus: string; rows?: ReadinessRow[] }) {
  const activeRows = rows ?? readinessAssessmentRows;
  const isDemo = !!rows;
  const statusDot = (s: ReadinessRow["status"]) => {
    const colors = { green: "bg-emerald-400", amber: "bg-amber-400", red: "bg-red-500" };
    return <div className={`w-3 h-3 rounded-full ${colors[s]}`} />;
  };

  return (
    <div className="mt-3" data-testid="readiness-assessment-content">
      <div className="rounded-lg border border-slate-200 dark:border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2.5 bg-slate-50 dark:bg-muted/30 border-b border-slate-200 dark:border-border">
          <span className="text-xs font-semibold text-foreground">Input Category</span>
          <span className="text-xs font-semibold text-foreground">Data Source</span>
          <span className="text-xs font-semibold text-foreground text-center">AI Assessment Status</span>
        </div>
        {activeRows.map((row) => (
          <div key={row.category} className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2.5 border-b border-slate-100 dark:border-border/50 last:border-b-0 items-center">
            <span className="text-sm text-foreground">{row.category}</span>
            <span className="text-sm text-muted-foreground">{row.dataSource}</span>
            <div className="flex justify-center w-20">{statusDot(isDemo || stepStatus === "complete" || stepStatus === "running" ? row.status : "red")}</div>
          </div>
        ))}
      </div>
      {stepStatus === "complete" && (() => {
        const hasBlockers = activeRows.some(r => r.status === "red");
        const hasWarnings = activeRows.some(r => r.status === "amber");
        if (hasBlockers) return (
          <div className="mt-3 p-3 rounded-lg bg-amber-50/80 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/30">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Assessment complete. {activeRows.filter(r => r.status === "red").length} input(s) pending — workflow proceeds with available data; outstanding items tracked for follow-up.</p>
          </div>
        );
        if (hasWarnings) return (
          <div className="mt-3 p-3 rounded-lg bg-[#266C92]/5 border border-[#266C92]/15">
            <p className="text-xs text-[#266C92] font-medium">Assessment complete with advisory findings. Workflow may proceed — review flagged items as needed.</p>
          </div>
        );
        return (
          <div className="mt-3 p-3 rounded-lg bg-[#266C92]/5 border border-[#266C92]/15">
            <p className="text-xs text-[#266C92] font-medium">All required inputs assessed. Readiness check passed — workflow may proceed.</p>
          </div>
        );
      })()}
    </div>
  );
}

const demoReadinessRows: ReadinessRow[] = [
  { category: "Control Description", dataSource: "Engagement workpaper / RCM", status: "green" },
  { category: "Control Attributes", dataSource: "RCM attribute mapping", status: "green" },
  { category: "SoD Policy Documentation", dataSource: "Uploaded — Corporate Policy P-114", status: "green" },
  { category: "SoD Conflict Matrix", dataSource: "PBC — received from David Kim", status: "green" },
  { category: "User Access Listing", dataSource: "System extract — Okta / SAP", status: "green" },
  { category: "Role-Permission Mapping", dataSource: "IT Security Team — partial coverage", status: "amber" },
  { category: "Organizational Chart", dataSource: "HR System Export", status: "green" },
  { category: "Prior Period Findings", dataSource: "Audit Management System", status: "green" },
];

type DemoStepOutputData = {
  title: string;
  headers: string[];
  rows: (string | { text: string; color?: string })[][];
  summary?: string;
};

const demoStepOutputs: Record<string, DemoStepOutputData[]> = {
  readiness: [
    {
      title: "Interpreted Control Objective",
      headers: ["Field", "AI Interpretation"],
      rows: [
        ["Objective", "Ensure incompatible duties are segregated across financial close, AP, AR, and GL functions per Policy P-114"],
        ["Frequency", "Continuous (preventive) with quarterly detective review"],
        ["Assertion", "Completeness, Existence, Rights & Obligations"],
        ["Control Type", "Preventive + Detective"],
        ["Nature", "Manual with system-enforced role constraints"],
      ],
    },
    {
      title: "Extracted Test Attributes",
      headers: ["#", "Attribute", "Test Criteria", "Evidence Required"],
      rows: [
        ["A1", "SoD Matrix Completeness", "Matrix covers all in-scope function pairs per P-114 §4.2", "Current SoD conflict matrix"],
        ["A2", "Conflict Identification", "All actual user-role conflicts detected vs. matrix", "User access listing × role mapping"],
        ["A3", "Remediation Timeliness", "Identified conflicts remediated within 5 business days", "Remediation log with timestamps"],
        ["A4", "Quarterly Review Execution", "Formal quarterly review performed by control owner", "Signed review attestation + minutes"],
        ["A5", "Exception Approval", "Any accepted SoD conflicts have documented risk acceptance", "Risk acceptance forms with sign-off"],
      ],
    },
    {
      title: "Generated Test Plan",
      headers: ["Step", "Procedure", "Sample Basis"],
      rows: [
        ["1", "Obtain and inspect the current SoD conflict matrix for completeness against P-114 function pairs", "Full population"],
        ["2", "Extract user access listing and cross-reference against role-permission mapping to identify actual conflicts", "Full population"],
        ["3", "For identified conflicts, verify remediation was completed within SLA", "25 conflicts (risk-weighted)"],
        ["4", "Inspect Q1–Q4 quarterly review packages for evidence of formal review and sign-off", "4 quarters"],
        ["5", "For any accepted/waived conflicts, verify risk acceptance documentation exists", "All exceptions"],
      ],
    },
  ],
  population: [
    {
      title: "Population Ingestion Results",
      headers: ["Metric", "Value", "Status"],
      rows: [
        ["Source File", "SoD_Conflict_Matrix_2025.xlsx", { text: "Loaded", color: "green" }],
        ["Total Function Pairs Defined", "156", { text: "Complete", color: "green" }],
        ["User Access Records", "3,421", { text: "Loaded", color: "green" }],
        ["Role-Permission Mappings", "89 roles × 312 permissions", { text: "Loaded", color: "green" }],
        ["Date Range Coverage", "Jan 1, 2025 – Dec 31, 2025", { text: "Full period", color: "green" }],
      ],
    },
    {
      title: "Validation Findings",
      headers: ["Check", "Result", "Detail"],
      rows: [
        ["Schema Compliance", { text: "Pass", color: "green" }, "All required fields present"],
        ["Duplicate Records", { text: "2 found", color: "amber" }, "UserID U-1147 and U-2903 appear twice — auto-deduplicated"],
        ["Missing Department Codes", { text: "7 records", color: "amber" }, "7 user records lack department assignment — flagged for review"],
        ["Date Gaps", { text: "None", color: "green" }, "Continuous coverage confirmed across audit period"],
        ["Orphaned Roles", { text: "3 roles", color: "red" }, "Roles R-TEMP-1, R-TEMP-2, R-LEGACY not in official role registry"],
      ],
    },
    {
      title: "Anomaly Detection",
      headers: ["Anomaly", "Count", "Severity", "Action"],
      rows: [
        ["Users with >5 conflicting role pairs", "12", { text: "High", color: "red" }, "Flagged for priority sampling"],
        ["Roles assigned to >50 users", "4", { text: "Medium", color: "amber" }, "Included in stratification"],
        ["Users in both AP-Create and AP-Approve", "23", { text: "Critical", color: "red" }, "Direct SoD violation — top priority"],
        ["Terminated users with active access", "5", { text: "High", color: "red" }, "Cross-referenced with HR termination file"],
      ],
    },
  ],
  sampling: [
    {
      title: "Sampling Parameters",
      headers: ["Parameter", "Value"],
      rows: [
        ["Methodology", "Risk-weighted stratified random (monetary unit sampling)"],
        ["Confidence Level", "95%"],
        ["Tolerable Deviation Rate", "5%"],
        ["Expected Deviation Rate", "1%"],
        ["Population Size", "156 function pairs × 3,421 users = identified conflicts"],
        ["Computed Sample Size", "25 conflict instances"],
        ["Random Seed", "0x7A3F (reproducible)"],
      ],
    },
    {
      title: "Stratification Breakdown",
      headers: ["Stratum", "Risk Tier", "Population", "Sample", "Selection Rationale"],
      rows: [
        ["Financial Close + AP", { text: "Critical", color: "red" }, "23 conflicts", "8", "Direct financial statement impact"],
        ["AP + AR Cross-Function", { text: "High", color: "red" }, "18 conflicts", "6", "Revenue/cash misstatement risk"],
        ["IT Admin + Business Roles", { text: "High", color: "amber" }, "31 conflicts", "6", "Elevated privilege escalation risk"],
        ["Operational Cross-Dept", { text: "Medium", color: "amber" }, "84 conflicts", "3", "Lower inherent risk — proportional"],
        ["Master Data + Transaction", { text: "Medium", color: "amber" }, "12 conflicts", "2", "Vendor/customer master + transaction"],
      ],
    },
    {
      title: "Selected Sample Items",
      headers: ["#", "User", "Conflicting Roles", "Function Pair", "Department"],
      rows: [
        ["S01", "U-1204 (M. Chen)", "AP-Create + AP-Approve", "Payables Create × Approve", "Finance"],
        ["S02", "U-0887 (J. Park)", "GL-Post + GL-Review", "GL Posting × Review", "Accounting"],
        ["S03", "U-2103 (L. Wang)", "AR-Invoice + AR-Receipt", "AR Invoice × Cash Receipt", "Revenue"],
        ["S04", "U-0412 (S. Chen)", "UserAdmin + FinApprove", "User Mgmt × Financial Approval", "IT/Finance"],
        ["S05", "U-1567 (K. Zhao)", "VendorMaster + AP-Create", "Vendor Master × AP Entry", "Procurement"],
        ["...", "...", "...", "...", "..."],
      ],
    },
  ],
  evidence: [
    {
      title: "Evidence Requirements Matrix",
      headers: ["Sample #", "Required Evidence", "Source", "Status"],
      rows: [
        ["S01–S25", "User access listing snapshot (per conflict date)", "PBC — David Kim", { text: "Received", color: "green" }],
        ["S01–S25", "Role assignment change logs", "System extract — IT Security", { text: "Received", color: "green" }],
        ["S01–S25", "SoD conflict resolution documentation", "PBC — Department heads", { text: "12/25 received", color: "amber" }],
        ["All", "Q1–Q4 quarterly SoD review packages", "PBC — Sarah Chen", { text: "Q1-Q3 received", color: "amber" }],
        ["All", "Risk acceptance forms (for waived conflicts)", "Audit Management System", { text: "3 forms received", color: "green" }],
        ["S01, S04", "IT change management tickets for role changes", "ServiceNow export", { text: "Pending", color: "red" }],
      ],
    },
    {
      title: "Collection Progress",
      headers: ["Category", "Required", "Collected", "Coverage"],
      rows: [
        ["Access snapshots", "25", "25", { text: "100%", color: "green" }],
        ["Role change logs", "25", "25", { text: "100%", color: "green" }],
        ["Conflict resolution docs", "25", "12", { text: "48%", color: "red" }],
        ["Quarterly review packages", "4", "3", { text: "75%", color: "amber" }],
        ["Risk acceptance forms", "3", "3", { text: "100%", color: "green" }],
        ["Change management tickets", "2", "0", { text: "0%", color: "red" }],
      ],
    },
  ],
  evidenceUnderstanding_merged: [
    {
      title: "Document Classification Results",
      headers: ["Document", "Classified As", "Pages", "Confidence"],
      rows: [
        ["SoD_Matrix_2025.xlsx", "Control matrix — conflict definitions", "1 (156 pairs)", { text: "99%", color: "green" }],
        ["UserAccess_Dec2025.csv", "User access listing — point-in-time", "3,421 records", { text: "98%", color: "green" }],
        ["Q3_SoD_Review_Package.pdf", "Quarterly review — attestation + minutes", "12 pages", { text: "95%", color: "green" }],
        ["RiskAcceptance_RF-2025-001.pdf", "Risk acceptance — Controller sign-off", "2 pages", { text: "97%", color: "green" }],
        ["Resolution_S01_MChen.msg", "Email — conflict resolution evidence", "1 page", { text: "82%", color: "amber" }],
      ],
    },
    {
      title: "Extracted Key Fields",
      headers: ["Sample", "Extracted Field", "Value", "Cross-Ref Match"],
      rows: [
        ["S01", "User: M. Chen — Roles at conflict date", "AP-Create + AP-Approve (assigned 2024-08-14)", { text: "Match", color: "green" }],
        ["S01", "Conflict first detected", "2025-02-12 (SoD scan)", { text: "Match", color: "green" }],
        ["S01", "Remediation date", "2025-02-28 (AP-Approve removed)", { text: "16 days — exceeds SLA", color: "red" }],
        ["S02", "User: J. Park — Roles at conflict date", "GL-Post + GL-Review (assigned 2024-11-01)", { text: "Match", color: "green" }],
        ["S02", "Remediation date", "2025-01-15 (GL-Review reassigned)", { text: "5 days — within SLA", color: "green" }],
      ],
    },
    {
      title: "Cross-Reference Validation",
      headers: ["Check", "Population ↔ Evidence", "Result"],
      rows: [
        ["User IDs in sample vs access listing", "25/25 matched", { text: "Pass", color: "green" }],
        ["Role assignments vs role registry", "23/25 matched", { text: "2 orphaned roles", color: "amber" }],
        ["Conflict dates vs detection log", "24/25 aligned", { text: "1 date mismatch (S14)", color: "amber" }],
        ["Remediation dates vs change logs", "12/12 aligned (received docs)", { text: "Pass (partial)", color: "amber" }],
        ["Quarterly review dates vs calendar", "3/4 confirmed", { text: "Q4 pending", color: "red" }],
      ],
    },
  ],
  testing: [
    {
      title: "Attribute A1: SoD Matrix Completeness",
      headers: ["Criteria", "Finding", "Result"],
      rows: [
        ["P-114 §4.2 function pairs covered", "156/160 pairs defined (4 missing: Treasury × IT Admin combinations)", { text: "Fail", color: "red" }],
        ["All in-scope systems included", "SAP, Okta, Coupa covered; Workday HR not included", { text: "Fail", color: "red" }],
        ["Matrix last updated date", "November 2025 — current", { text: "Pass", color: "green" }],
      ],
    },
    {
      title: "Attribute A2: Conflict Identification (Sample of 25)",
      headers: ["Sample", "Conflict Detected?", "Resolution", "Result"],
      rows: [
        ["S01 (M. Chen)", "Yes — AP-Create + AP-Approve", "AP-Approve removed (16 days)", { text: "Pass (conflict found)", color: "green" }],
        ["S02 (J. Park)", "Yes — GL-Post + GL-Review", "GL-Review reassigned (5 days)", { text: "Pass", color: "green" }],
        ["S03 (L. Wang)", "Yes — AR-Invoice + AR-Receipt", "No resolution on file", { text: "Fail", color: "red" }],
        ["S04 (S. Chen)", "Yes — UserAdmin + FinApprove", "Risk acceptance RF-2025-001", { text: "Pass (accepted risk)", color: "green" }],
        ["...", "...", "...", "..."],
      ],
      summary: "22/25 conflicts properly identified and addressed. 3 failures: S03 (no resolution), S14 (date mismatch), S21 (orphaned role not detected).",
    },
    {
      title: "Attribute A3: Remediation Timeliness",
      headers: ["Sample", "SLA (5 bus. days)", "Actual Days", "Result"],
      rows: [
        ["S01", "5 days", "16 days", { text: "Fail — SLA exceeded", color: "red" }],
        ["S02", "5 days", "5 days", { text: "Pass", color: "green" }],
        ["S05", "5 days", "3 days", { text: "Pass", color: "green" }],
        ["S08", "5 days", "8 days", { text: "Fail — SLA exceeded", color: "red" }],
        ["S12", "5 days", "2 days", { text: "Pass", color: "green" }],
        ["...", "...", "...", "..."],
      ],
      summary: "19/25 within SLA. 6 exceeded — avg overrun 7.3 days. Pattern: Finance dept remediations consistently slower.",
    },
    {
      title: "Attribute A4: Quarterly Review Execution",
      headers: ["Quarter", "Review Date", "Attendees", "Sign-off", "Result"],
      rows: [
        ["Q1 2025", "April 15, 2025", "S. Chen, D. Kim, M. Torres", "Signed", { text: "Pass", color: "green" }],
        ["Q2 2025", "July 18, 2025", "S. Chen, D. Kim", "Signed", { text: "Pass", color: "green" }],
        ["Q3 2025", "October 22, 2025", "S. Chen, D. Kim, P. Sharma", "Signed", { text: "Pass", color: "green" }],
        ["Q4 2025", "—", "—", "—", { text: "Evidence not received", color: "red" }],
      ],
    },
    {
      title: "Overall Attribute Results",
      headers: ["Attribute", "Pass", "Fail", "Rate", "Conclusion"],
      rows: [
        ["A1: Matrix Completeness", "1", "2", "33%", { text: "Fail", color: "red" }],
        ["A2: Conflict Identification", "22", "3", "88%", { text: "Pass with exceptions", color: "amber" }],
        ["A3: Remediation Timeliness", "19", "6", "76%", { text: "Fail — below threshold", color: "red" }],
        ["A4: Quarterly Review", "3", "1", "75%", { text: "Fail — Q4 missing", color: "red" }],
        ["A5: Exception Approval", "3", "0", "100%", { text: "Pass", color: "green" }],
      ],
      summary: "2 of 5 attributes passed. 3 attributes failed. Overall control assessment: Ineffective.",
    },
  ],
  testEffectiveness: [
    {
      title: "Results Aggregation",
      headers: ["Metric", "Value"],
      rows: [
        ["Total Attributes Tested", "5"],
        ["Attributes Passed", "2 (A2 — with exceptions, A5)"],
        ["Attributes Failed", "3 (A1, A3, A4)"],
        ["Overall Pass Rate", { text: "40%", color: "red" }],
        ["Samples Evaluated", "25 / 25 (100% coverage)"],
        ["Individual Sample Pass Rate", "76% (19/25)"],
      ],
    },
    {
      title: "Confidence Assessment",
      headers: ["Factor", "Assessment", "Score"],
      rows: [
        ["Evidence Completeness", "84% of required evidence collected (Q4 review + 13 resolution docs missing)", { text: "Medium", color: "amber" }],
        ["Data Quality", "Population data validated; 2 dedup + 3 orphan roles resolved", { text: "High", color: "green" }],
        ["AI Extraction Accuracy", "94% average classification confidence across 68 documents", { text: "High", color: "green" }],
        ["Cross-Reference Integrity", "96% match rate across population-evidence joins", { text: "High", color: "green" }],
        ["Overall Confidence", "Sufficient for conclusion — medium due to evidence gaps", { text: "Medium-High", color: "amber" }],
      ],
    },
    {
      title: "Effectiveness Conclusion",
      headers: ["Component", "Determination"],
      rows: [
        ["Control Design", { text: "Effective — SoD framework and policy are well-designed", color: "green" }],
        ["Operating Effectiveness", { text: "Ineffective — 3 of 5 attributes failed; remediation SLA routinely exceeded", color: "red" }],
        ["Overall Conclusion", { text: "INEFFECTIVE", color: "red" }],
        ["Exception Count", "3 reportable exceptions identified"],
        ["Remediation Priority", { text: "High — financial close impact", color: "red" }],
      ],
    },
    {
      title: "Identified Exceptions",
      headers: ["#", "Exception", "Severity", "Affected Samples"],
      rows: [
        ["EXC-A", "SoD matrix incomplete — 4 function pairs and 1 system missing from scope", { text: "High", color: "red" }, "A1 — all"],
        ["EXC-B", "Remediation SLA exceeded in 24% of cases (6/25) — avg 7.3 days overrun", { text: "High", color: "red" }, "S01,S08,S09,S14,S17,S22"],
        ["EXC-C", "Q4 quarterly review not performed or evidence not provided", { text: "Medium", color: "amber" }, "A4 — Q4"],
      ],
    },
  ],
};

const demoSubstepOutputs: Record<string, DemoStepOutputData[]> = {
  "rd-assess": [],
  "cs-interpret": [demoStepOutputs.readiness[0]],
  "cs-extract": [demoStepOutputs.readiness[1]],
  "cs-plan": [demoStepOutputs.readiness[2]],
  "pop-ingest": [demoStepOutputs.population[0]],
  "pop-validate": [demoStepOutputs.population[1]],
  "pop-complete": [{
    title: "Completeness Assessment",
    headers: ["Dimension", "Expected", "Actual", "Coverage"],
    rows: [
      ["Control Period", "Jan – Dec 2025", "Jan – Dec 2025", { text: "100%", color: "green" }],
      ["Entity Scope", "5 business units", "5 business units", { text: "100%", color: "green" }],
      ["Function Pairs (P-114)", "160", "156 defined", { text: "97.5%", color: "amber" }],
      ["User Population", "All active users", "3,421 (incl. 5 termed)", { text: "100%", color: "green" }],
      ["Source Systems", "SAP, Okta, Coupa", "3 / 3 connected", { text: "100%", color: "green" }],
    ],
  }],
  "pop-anomaly": [demoStepOutputs.population[2]],
  "smp-method": [demoStepOutputs.sampling[0]],
  "smp-stratify": [demoStepOutputs.sampling[1]],
  "smp-size": [{
    title: "Sample Size Calculation",
    headers: ["Parameter", "Value"],
    rows: [
      ["Formula", "n = (Z² × p × (1−p)) / e²"],
      ["Z-Score (95% confidence)", "1.96"],
      ["Expected Deviation Rate (p)", "1%"],
      ["Tolerable Deviation Rate (e)", "5%"],
      ["Raw Computed Size", "16"],
      ["Risk-Adjusted Final Size", { text: "25", color: "green" }],
      ["Adjustment Rationale", "Upward adjustment for 3 critical-risk strata and prior-period findings"],
    ],
  }],
  "smp-select": [demoStepOutputs.sampling[2]],
  "evd-map": [demoStepOutputs.evidence[0]],
  "evd-source": [],
  "evd-collect": [demoStepOutputs.evidence[1]],
  "eu-classify": [demoStepOutputs.evidenceUnderstanding_merged[0]],
  "eu-extract": [demoStepOutputs.evidenceUnderstanding_merged[1]],
  "eu-parse": [],
  "eu-xref": [demoStepOutputs.evidenceUnderstanding_merged[2]],
  "ae-test": [demoStepOutputs.testing[0], demoStepOutputs.testing[1]],
  "ae-determine": [demoStepOutputs.testing[2], demoStepOutputs.testing[3]],
  "ae-rationale": [demoStepOutputs.testing[4]],
  "ae-exception": [],
  "te-aggregate": [demoStepOutputs.testEffectiveness[0]],
  "te-complete": [],
  "te-confidence": [demoStepOutputs.testEffectiveness[1]],
  "te-conclude": [demoStepOutputs.testEffectiveness[2], demoStepOutputs.testEffectiveness[3]],
};

const demoStepBehavior: Record<string, { autoProgress: boolean; pauseAtSubstep?: number }> = {
  readiness: { autoProgress: true },
  population: { autoProgress: true, pauseAtSubstep: 0 },
  sampling: { autoProgress: true },
  evidence: { autoProgress: true, pauseAtSubstep: 2 },
  testing: { autoProgress: true },
  testEffectiveness: { autoProgress: true },
};

const workstreamRequestSteps = [
  { label: "Identifying data owner", detail: "David Kim — Control Owner, Finance", icon: Users, delay: 900 },
  { label: "Composing PBC request", detail: "Population data: SoD conflict report (Jan–Dec 2025)", icon: FileText, delay: 1100 },
  { label: "Dispatching to workstream", detail: "Sent via Optro Workstream → david.kim@company.com", icon: Send, delay: 800 },
  { label: "Awaiting acknowledgment", detail: "David Kim acknowledged — preparing file", icon: Clock, delay: 1800 },
  { label: "Receiving file", detail: "sod_conflict_report_2025.csv — 2.4 MB", icon: Upload, delay: 1200 },
  { label: "Validating file integrity", detail: "Schema check passed — 2,847 records, 12 fields", icon: FileCheck, delay: 800 },
];

const evidenceWorkstreamSteps = [
  { label: "Identifying evidence sources", detail: "25 sample items × 4 evidence types required", icon: Search, delay: 800 },
  { label: "Connecting to SAP GRC", detail: "Pulling access logs and role assignment records", icon: Server, delay: 1000 },
  { label: "Connecting to Okta", detail: "Pulling provisioning records for sampled users", icon: Server, delay: 900 },
  { label: "Requesting SharePoint documents", detail: "Approval screenshots and remediation docs", icon: Send, delay: 1200 },
  { label: "Downloading evidence files", detail: "68 files across 6 categories — 12.4 MB total", icon: Download, delay: 1400 },
  { label: "Validating evidence completeness", detail: "25/25 sample items covered — 2 partial gaps flagged", icon: FileCheck, delay: 800 },
];

function AgenticStepTracker({ title, steps, onComplete, staticComplete }: {
  title: string;
  steps: { label: string; detail: string; icon: typeof Users; delay: number }[];
  onComplete: () => void;
  staticComplete?: boolean;
}) {
  const [completedCount, setCompletedCount] = useState(staticComplete ? steps.length : 0);
  const completedRef = useRef(!!staticComplete);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (staticComplete) return;
    if (completedCount >= steps.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        const t = setTimeout(() => onCompleteRef.current(), 600);
        return () => clearTimeout(t);
      }
      return;
    }
    const delay = steps[completedCount].delay;
    const t = setTimeout(() => setCompletedCount(prev => prev + 1), delay);
    return () => clearTimeout(t);
  }, [completedCount, steps, staticComplete]);

  const allDone = completedCount >= steps.length;

  return (
    <div className="space-y-2" data-testid="agentic-step-tracker">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <span className={`text-[10px] font-medium ${allDone ? "text-emerald-600 dark:text-emerald-400" : "text-[#266C92]"}`}>
          {completedCount} / {steps.length} {allDone ? "complete" : "in progress"}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-muted/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-[#266C92]"}`}
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-border overflow-hidden">
        {steps.map((item, idx) => {
          const status = idx < completedCount ? "done" : idx === completedCount ? "active" : "pending";
          const StIcon = item.icon;
          return (
            <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 border-b last:border-b-0 border-slate-100 dark:border-border/50 transition-colors ${
              status === "active" ? "bg-[#266C92]/[0.04]" : ""
            }`}>
              <div className="w-5 flex items-center justify-center shrink-0">
                {status === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                ) : status === "active" ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#266C92] animate-spin" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-slate-300 dark:border-slate-600" />
                )}
              </div>
              <StIcon className={`w-3.5 h-3.5 shrink-0 ${status === "pending" ? "text-muted-foreground/40" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-medium ${status === "pending" ? "text-muted-foreground/50" : "text-foreground"}`}>{item.label}</span>
                {(status === "done" || status === "active") && (
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{renderDocLinks(item.detail, "text-[10px] text-muted-foreground")}</p>
                )}
              </div>
              {status === "done" && (
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">Done</span>
              )}
              {status === "active" && (
                <span className="text-[9px] text-[#266C92] font-medium shrink-0 animate-pulse">Running</span>
              )}
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/40 dark:border-emerald-800/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">All steps complete — data received and validated</span>
        </div>
      )}
    </div>
  );
}

const evidenceTrackerItems = [
  { label: "User access listing snapshots", source: "PBC — David Kim", icon: FileText, delay: 800 },
  { label: "Role assignment change logs", source: "System extract — IT Security", icon: Database, delay: 700 },
  { label: "SoD conflict resolution docs", source: "PBC — Department heads", icon: FileCheck, delay: 1200 },
  { label: "Quarterly SoD review packages", source: "PBC — Sarah Chen", icon: FileText, delay: 900 },
  { label: "Risk acceptance forms", source: "Audit Management System", icon: ShieldCheck, delay: 600 },
  { label: "IT change management tickets", source: "ServiceNow export", icon: ClipboardCheck, delay: 1000 },
];

function EvidenceCollectionTracker({ onComplete, staticComplete }: { onComplete: () => void; staticComplete?: boolean }) {
  const [receivedCount, setReceivedCount] = useState(staticComplete ? evidenceTrackerItems.length : 0);
  const completedRef = useRef(!!staticComplete);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (staticComplete) return;
    if (receivedCount >= evidenceTrackerItems.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        const t = setTimeout(() => onCompleteRef.current(), 600);
        return () => clearTimeout(t);
      }
      return;
    }
    const delay = evidenceTrackerItems[receivedCount].delay;
    const t = setTimeout(() => setReceivedCount(prev => prev + 1), delay);
    return () => clearTimeout(t);
  }, [receivedCount, staticComplete]);

  const allDone = receivedCount >= evidenceTrackerItems.length;

  return (
    <div className="space-y-2" data-testid="evidence-tracker">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Evidence Collection</span>
        <span className={`text-[10px] font-medium ${allDone ? "text-emerald-600 dark:text-emerald-400" : "text-[#266C92]"}`}>
          {receivedCount} / {evidenceTrackerItems.length} received
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-muted/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-[#266C92]"}`}
          style={{ width: `${(receivedCount / evidenceTrackerItems.length) * 100}%` }}
        />
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-border overflow-hidden">
        {evidenceTrackerItems.map((item, idx) => {
          const status = idx < receivedCount ? "received" : idx === receivedCount ? "receiving" : "queued";
          const EvIcon = item.icon;
          return (
            <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 border-b last:border-b-0 border-slate-100 dark:border-border/50 transition-colors ${
              status === "receiving" ? "bg-[#266C92]/[0.04]" : ""
            }`}>
              <div className="w-5 flex items-center justify-center shrink-0">
                {status === "received" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                ) : status === "receiving" ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#266C92] animate-spin" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-slate-300 dark:border-slate-600" />
                )}
              </div>
              <EvIcon className={`w-3.5 h-3.5 shrink-0 ${status === "queued" ? "text-muted-foreground/40" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                {status === "received" ? (
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-xs font-medium text-[#266C92] underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer" data-testid={`link-evidence-${idx}`}>{item.label}</a>
                ) : (
                  <span className={`text-xs font-medium ${status === "queued" ? "text-muted-foreground/50" : "text-foreground"}`}>{item.label}</span>
                )}
                {(status === "received" || status === "receiving") && (
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{item.source}</p>
                )}
              </div>
              {status === "received" && (
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">Received</span>
              )}
              {status === "receiving" && (
                <span className="text-[9px] text-[#266C92] font-medium shrink-0 animate-pulse">Receiving</span>
              )}
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/40 dark:border-emerald-800/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">All evidence collected — ready for classification</span>
        </div>
      )}
    </div>
  );
}

const docFilePattern = /\b([\w\-\.]+\.(pdf|csv|xlsx|xls|msg|docx|doc|zip|txt))\b/gi;

function renderDocLinks(text: string, className?: string) {
  const parts: (string | JSX.Element)[] = [];
  let lastIdx = 0;
  const regex = new RegExp(docFilePattern.source, "gi");
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    const fileName = m[1];
    parts.push(
      <a key={m.index} href="#" onClick={(e) => e.preventDefault()} className={`${className} underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer`} data-testid={`link-doc-${fileName}`}>
        {fileName}
      </a>
    );
    lastIdx = m.index + m[1].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  if (parts.length === 0) return <span className={className}>{text}</span>;
  return <span className={className}>{parts}</span>;
}

type AttributeResult = {
  result: "Effective" | "Ineffective" | "Missing" | "N/A";
  confidence: "High" | "Medium" | "Low";
};

type SampleAttributeDetail = {
  key: string;
  title: string;
  description: string;
  sourceDoc: string;
  sourceLocation: string;
  result: "Effective" | "Ineffective" | "Missing" | "N/A";
  confidence: "High" | "Medium" | "Low";
};

type SampleTestRow = {
  id: string;
  label: string;
  subtitle: string;
  attributes: Record<string, AttributeResult>;
  overall: "Effective" | "Ineffective" | "Incomplete";
  details: SampleAttributeDetail[];
};

const testingAttributes = [
  { key: "A1", label: "A1: Matrix" },
  { key: "A2", label: "A2: Identification" },
  { key: "A3", label: "A3: Remediation" },
  { key: "A4", label: "A4: Review" },
  { key: "A5", label: "A5: Exception" },
];

const demoSampleTestRows: SampleTestRow[] = [
  {
    id: "s01", label: "S01 — AP-Create × AP-Approve", subtitle: "Finance / U-1204 / Critical",
    attributes: {
      A1: { result: "Effective", confidence: "High" },
      A2: { result: "Effective", confidence: "High" },
      A3: { result: "Ineffective", confidence: "High" },
      A4: { result: "Effective", confidence: "High" },
      A5: { result: "N/A", confidence: "High" },
    },
    overall: "Ineffective",
    details: [
      { key: "A1", title: "SoD matrix completeness", description: "AP-Create × AP-Approve conflict pair is defined in the SoD conflict matrix (P-114 §4.2, row 47). Both functions mapped to SAP transaction codes FB01 and FK01. Conflict categorized as Critical risk.", sourceDoc: "SoD_Matrix_2025.xlsx", sourceLocation: "row 47", result: "Effective", confidence: "High" },
      { key: "A2", title: "Conflict identification accuracy", description: "Conflict detected on 2025-02-12 during automated SoD scan. User U-1204 held both AP-Create and AP-Approve roles since 2024-08-14 — 182-day exposure window. Detection confirmed within quarterly scan cycle.", sourceDoc: "UserAccess_Dec2025.csv", sourceLocation: "record 1,247", result: "Effective", confidence: "High" },
      { key: "A3", title: "Remediation timeliness", description: "AP-Approve role removed on 2025-02-28, 16 calendar days after detection. P-114 §6.1 requires remediation within 5 business days. The 16-day remediation period exceeds SLA by 11 days.", sourceDoc: "RoleChangeLog_2025.csv", sourceLocation: "change ID RC-2025-0284", result: "Ineffective", confidence: "High" },
      { key: "A4", title: "Quarterly review sign-off", description: "Q1 2025 quarterly review (April 15, 2025) confirmed this conflict was remediated. Review package signed by S. Chen, D. Kim, and M. Torres.", sourceDoc: "Q1_SoD_Review_Package.pdf", sourceLocation: "page 4, item 3", result: "Effective", confidence: "High" },
      { key: "A5", title: "Exception approval", description: "N/A — Conflict was remediated (not accepted). No risk acceptance required.", sourceDoc: "", sourceLocation: "", result: "N/A", confidence: "High" },
    ],
  },
  {
    id: "s02", label: "S02 — GL-Post × GL-Review", subtitle: "Accounting / U-0887 / Medium",
    attributes: {
      A1: { result: "Effective", confidence: "High" },
      A2: { result: "Effective", confidence: "High" },
      A3: { result: "Effective", confidence: "High" },
      A4: { result: "Effective", confidence: "High" },
      A5: { result: "N/A", confidence: "High" },
    },
    overall: "Effective",
    details: [
      { key: "A1", title: "SoD matrix completeness", description: "GL-Post × GL-Review conflict pair defined in conflict matrix (P-114 §4.2, row 82). Both functions mapped correctly. Categorized as Medium risk.", sourceDoc: "SoD_Matrix_2025.xlsx", sourceLocation: "row 82", result: "Effective", confidence: "High" },
      { key: "A2", title: "Conflict identification accuracy", description: "Conflict detected on 2025-01-10 during automated scan. User U-0887 held both roles since 2024-11-01. Detection timely within scanning cycle.", sourceDoc: "UserAccess_Dec2025.csv", sourceLocation: "record 2,891", result: "Effective", confidence: "High" },
      { key: "A3", title: "Remediation timeliness", description: "GL-Review role reassigned on 2025-01-15, 5 calendar days after detection. Within P-114 §6.1 SLA of 5 business days.", sourceDoc: "RoleChangeLog_2025.csv", sourceLocation: "change ID RC-2025-0112", result: "Effective", confidence: "High" },
      { key: "A4", title: "Quarterly review sign-off", description: "Q1 2025 quarterly review confirmed remediation sustained. All required attendees present and sign-off documented.", sourceDoc: "Q1_SoD_Review_Package.pdf", sourceLocation: "page 6, item 7", result: "Effective", confidence: "High" },
      { key: "A5", title: "Exception approval", description: "N/A — Conflict remediated. No risk acceptance required.", sourceDoc: "", sourceLocation: "", result: "N/A", confidence: "High" },
    ],
  },
  {
    id: "s03", label: "S03 — AR-Invoice × AR-Receipt", subtitle: "Revenue / U-2103 / High",
    attributes: {
      A1: { result: "Effective", confidence: "High" },
      A2: { result: "Effective", confidence: "High" },
      A3: { result: "Missing", confidence: "Low" },
      A4: { result: "Ineffective", confidence: "Medium" },
      A5: { result: "Missing", confidence: "Low" },
    },
    overall: "Incomplete",
    details: [
      { key: "A1", title: "SoD matrix completeness", description: "AR-Invoice × AR-Receipt conflict pair defined in matrix (P-114 §4.2, row 104). Mapped to SAP FV70/F-28. Categorized as High risk.", sourceDoc: "SoD_Matrix_2025.xlsx", sourceLocation: "row 104", result: "Effective", confidence: "High" },
      { key: "A2", title: "Conflict identification accuracy", description: "Conflict detected on 2025-03-22 during automated scan. User U-2103 held both roles since 2024-09-15.", sourceDoc: "UserAccess_Dec2025.csv", sourceLocation: "record 1,503", result: "Effective", confidence: "High" },
      { key: "A3", title: "Remediation timeliness", description: "No resolution documentation on file. Role assignment remains active as of testing date. Unable to verify whether remediation was attempted or risk acceptance filed.", sourceDoc: "Resolution_S03.msg", sourceLocation: "no file located", result: "Missing", confidence: "Low" },
      { key: "A4", title: "Quarterly review sign-off", description: "Q3 2025 review package lists this conflict as \"pending remediation\" but no action items documented. Conflict acknowledged but not addressed with remediation plan or risk acceptance.", sourceDoc: "Q3_SoD_Review_Package.pdf", sourceLocation: "page 8, appendix B", result: "Ineffective", confidence: "Medium" },
      { key: "A5", title: "Exception approval", description: "No risk acceptance form on file. Conflict has neither been remediated nor formally accepted with compensating controls.", sourceDoc: "", sourceLocation: "", result: "Missing", confidence: "Low" },
    ],
  },
  {
    id: "s04", label: "S04 — UserAdmin × FinApprove", subtitle: "IT/Finance / U-0412 / Critical",
    attributes: {
      A1: { result: "Effective", confidence: "High" },
      A2: { result: "Effective", confidence: "High" },
      A3: { result: "N/A", confidence: "High" },
      A4: { result: "Effective", confidence: "High" },
      A5: { result: "Effective", confidence: "High" },
    },
    overall: "Effective",
    details: [
      { key: "A1", title: "SoD matrix completeness", description: "UserAdmin × FinApprove conflict defined in matrix (P-114 §4.2, row 12). Cross-functional IT/Finance conflict. Categorized as Critical risk.", sourceDoc: "SoD_Matrix_2025.xlsx", sourceLocation: "row 12", result: "Effective", confidence: "High" },
      { key: "A2", title: "Conflict identification accuracy", description: "Conflict detected on 2025-01-18. User U-0412 held both roles since 2024-06-01. Detection confirmed against approved SoD rule set.", sourceDoc: "UserAccess_Dec2025.csv", sourceLocation: "record 412", result: "Effective", confidence: "High" },
      { key: "A3", title: "Remediation timeliness", description: "N/A — Conflict was formally accepted with compensating controls rather than remediated.", sourceDoc: "", sourceLocation: "", result: "N/A", confidence: "High" },
      { key: "A4", title: "Quarterly review sign-off", description: "Q1 2025 review confirmed the accepted risk and compensating controls remain in place. Sign-off by S. Chen and D. Kim.", sourceDoc: "Q1_SoD_Review_Package.pdf", sourceLocation: "page 8, item 12", result: "Effective", confidence: "High" },
      { key: "A5", title: "Exception approval", description: "Risk acceptance RF-2025-001 on file. Signed by Controller and CIO. Compensating control: dual-approval workflow for all financial transactions by U-0412.", sourceDoc: "RiskAcceptance_RF-2025-001.pdf", sourceLocation: "page 1–2", result: "Effective", confidence: "High" },
    ],
  },
  {
    id: "s05", label: "S05 — VendorMaster × AP-Create", subtitle: "Procurement / U-1567 / High",
    attributes: {
      A1: { result: "Effective", confidence: "High" },
      A2: { result: "Effective", confidence: "High" },
      A3: { result: "Effective", confidence: "High" },
      A4: { result: "Effective", confidence: "High" },
      A5: { result: "N/A", confidence: "High" },
    },
    overall: "Effective",
    details: [
      { key: "A1", title: "SoD matrix completeness", description: "VendorMaster × AP-Create conflict pair defined in matrix (P-114 §4.2, row 53). Mapped to SAP XK01/FB01. Categorized as High risk.", sourceDoc: "SoD_Matrix_2025.xlsx", sourceLocation: "row 53", result: "Effective", confidence: "High" },
      { key: "A2", title: "Conflict identification accuracy", description: "Conflict detected on 2025-03-01 during automated scan. User U-1567 held both roles since 2025-01-15.", sourceDoc: "UserAccess_Dec2025.csv", sourceLocation: "record 1,567", result: "Effective", confidence: "High" },
      { key: "A3", title: "Remediation timeliness", description: "VendorMaster role removed on 2025-03-04, 3 calendar days after detection. Within SLA.", sourceDoc: "RoleChangeLog_2025.csv", sourceLocation: "change ID RC-2025-0341", result: "Effective", confidence: "High" },
      { key: "A4", title: "Quarterly review sign-off", description: "Q1 2025 review confirmed remediation. Documented in review package.", sourceDoc: "Q1_SoD_Review_Package.pdf", sourceLocation: "page 5, item 5", result: "Effective", confidence: "High" },
      { key: "A5", title: "Exception approval", description: "N/A — Conflict remediated. No risk acceptance required.", sourceDoc: "", sourceLocation: "", result: "N/A", confidence: "High" },
    ],
  },
  {
    id: "s08", label: "S08 — GL-Close × GL-Adjust", subtitle: "Accounting / U-0991 / Critical",
    attributes: {
      A1: { result: "Effective", confidence: "High" },
      A2: { result: "Effective", confidence: "High" },
      A3: { result: "Ineffective", confidence: "High" },
      A4: { result: "Effective", confidence: "High" },
      A5: { result: "N/A", confidence: "High" },
    },
    overall: "Ineffective",
    details: [
      { key: "A1", title: "SoD matrix completeness", description: "GL-Close × GL-Adjust conflict pair defined in matrix (P-114 §4.2, row 91). Both functions mapped to SAP F.05/FB02. Categorized as Critical risk.", sourceDoc: "SoD_Matrix_2025.xlsx", sourceLocation: "row 91", result: "Effective", confidence: "High" },
      { key: "A2", title: "Conflict identification accuracy", description: "Conflict detected on 2025-04-02 during automated scan. User U-0991 held both roles since 2024-12-01.", sourceDoc: "UserAccess_Dec2025.csv", sourceLocation: "record 991", result: "Effective", confidence: "High" },
      { key: "A3", title: "Remediation timeliness", description: "GL-Adjust role removed on 2025-04-10, 8 calendar days after detection. Exceeds P-114 §6.1 SLA of 5 business days by 3 days.", sourceDoc: "RoleChangeLog_2025.csv", sourceLocation: "change ID RC-2025-0489", result: "Ineffective", confidence: "High" },
      { key: "A4", title: "Quarterly review sign-off", description: "Q2 2025 review confirmed remediation. Sign-off documented by S. Chen and D. Kim.", sourceDoc: "Q2_SoD_Review_Package.pdf", sourceLocation: "page 3, item 2", result: "Effective", confidence: "High" },
      { key: "A5", title: "Exception approval", description: "N/A — Conflict remediated. No risk acceptance required.", sourceDoc: "", sourceLocation: "", result: "N/A", confidence: "High" },
    ],
  },
  {
    id: "s12", label: "S12 — PO-Create × PO-Approve", subtitle: "Procurement / U-2450 / High",
    attributes: {
      A1: { result: "Effective", confidence: "High" },
      A2: { result: "Effective", confidence: "High" },
      A3: { result: "Effective", confidence: "High" },
      A4: { result: "Effective", confidence: "High" },
      A5: { result: "N/A", confidence: "High" },
    },
    overall: "Effective",
    details: [
      { key: "A1", title: "SoD matrix completeness", description: "PO-Create × PO-Approve conflict pair defined in matrix (P-114 §4.2, row 68). Mapped to SAP ME21N/ME28. Categorized as High risk.", sourceDoc: "SoD_Matrix_2025.xlsx", sourceLocation: "row 68", result: "Effective", confidence: "High" },
      { key: "A2", title: "Conflict identification accuracy", description: "Conflict detected on 2025-05-15 during automated scan. User U-2450 held both roles since 2025-02-01.", sourceDoc: "UserAccess_Dec2025.csv", sourceLocation: "record 2,450", result: "Effective", confidence: "High" },
      { key: "A3", title: "Remediation timeliness", description: "PO-Approve role removed on 2025-05-17, 2 calendar days after detection. Within SLA.", sourceDoc: "RoleChangeLog_2025.csv", sourceLocation: "change ID RC-2025-0612", result: "Effective", confidence: "High" },
      { key: "A4", title: "Quarterly review sign-off", description: "Q2 2025 review confirmed remediation sustained.", sourceDoc: "Q2_SoD_Review_Package.pdf", sourceLocation: "page 7, item 9", result: "Effective", confidence: "High" },
      { key: "A5", title: "Exception approval", description: "N/A — Conflict remediated.", sourceDoc: "", sourceLocation: "", result: "N/A", confidence: "High" },
    ],
  },
  {
    id: "s14", label: "S14 — AssetMgmt × AssetDisposal", subtitle: "Fixed Assets / U-1823 / Medium",
    attributes: {
      A1: { result: "Ineffective", confidence: "High" },
      A2: { result: "Ineffective", confidence: "Medium" },
      A3: { result: "Missing", confidence: "Low" },
      A4: { result: "Effective", confidence: "High" },
      A5: { result: "Missing", confidence: "Low" },
    },
    overall: "Ineffective",
    details: [
      { key: "A1", title: "SoD matrix completeness", description: "AssetMgmt × AssetDisposal is listed in matrix but mapped to legacy transaction codes (AS01/AS91) that were deprecated in the 2024 SAP upgrade. Current codes (ABAVN/AS02) are not reflected.", sourceDoc: "SoD_Matrix_2025.xlsx", sourceLocation: "row 131", result: "Ineffective", confidence: "High" },
      { key: "A2", title: "Conflict identification accuracy", description: "Conflict detection date in the SoD scan log (2025-04-18) does not match the role assignment date in UserAccess extract (2025-03-01). 48-day gap suggests the conflict was not detected until the next quarterly scan rather than the weekly automated scan.", sourceDoc: "UserAccess_Dec2025.csv", sourceLocation: "record 1,823", result: "Ineffective", confidence: "Medium" },
      { key: "A3", title: "Remediation timeliness", description: "No resolution documentation on file. Conflict resolution docs not among the 12/25 received. Unable to determine remediation status.", sourceDoc: "Resolution_S14.msg", sourceLocation: "no file located", result: "Missing", confidence: "Low" },
      { key: "A4", title: "Quarterly review sign-off", description: "Q2 2025 review package references this conflict. Listed under \"pending investigation.\" Review sign-off obtained.", sourceDoc: "Q2_SoD_Review_Package.pdf", sourceLocation: "page 10, appendix C", result: "Effective", confidence: "High" },
      { key: "A5", title: "Exception approval", description: "No risk acceptance form on file. Conflict has neither been remediated nor formally accepted.", sourceDoc: "", sourceLocation: "", result: "Missing", confidence: "Low" },
    ],
  },
  {
    id: "s21", label: "S21 — PayrollRun × PayrollApprove", subtitle: "HR-Payroll / U-3102 / Critical",
    attributes: {
      A1: { result: "Ineffective", confidence: "High" },
      A2: { result: "Ineffective", confidence: "High" },
      A3: { result: "N/A", confidence: "High" },
      A4: { result: "Ineffective", confidence: "High" },
      A5: { result: "N/A", confidence: "High" },
    },
    overall: "Ineffective",
    details: [
      { key: "A1", title: "SoD matrix completeness", description: "PayrollRun × PayrollApprove uses role R-LEGACY which is flagged as an orphaned role not in the official role registry. The matrix row exists (row 144) but the role definition is incomplete — no mapped SAP transaction codes.", sourceDoc: "SoD_Matrix_2025.xlsx", sourceLocation: "row 144", result: "Ineffective", confidence: "High" },
      { key: "A2", title: "Conflict identification accuracy", description: "Conflict was not detected by the automated SoD scan because R-LEGACY is excluded from the scan rule set. Conflict identified only during manual population review in this audit.", sourceDoc: "UserAccess_Dec2025.csv", sourceLocation: "record 3,102", result: "Ineffective", confidence: "High" },
      { key: "A3", title: "Remediation timeliness", description: "N/A — Conflict was not detected by the control, so remediation SLA does not apply. Newly identified during audit.", sourceDoc: "", sourceLocation: "", result: "N/A", confidence: "High" },
      { key: "A4", title: "Quarterly review sign-off", description: "Conflict does not appear in any quarterly review package (Q1–Q3). The orphaned role was not visible to the review process.", sourceDoc: "Q3_SoD_Review_Package.pdf", sourceLocation: "not found", result: "Ineffective", confidence: "High" },
      { key: "A5", title: "Exception approval", description: "N/A — Conflict newly identified. No prior risk acceptance exists.", sourceDoc: "", sourceLocation: "", result: "N/A", confidence: "High" },
    ],
  },
];

function SampleAttributeTestingGrid({ samples }: { samples: SampleTestRow[] }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [overrideAttr, setOverrideAttr] = useState<string | null>(null);
  const [overrideValues, setOverrideValues] = useState<Record<string, { result: string; rationale: string }>>({});
  const [appliedOverrides, setAppliedOverrides] = useState<Record<string, { result: string; rationale: string }>>({});
  const [annotationTarget, setAnnotationTarget] = useState<{ sampleId: string; attrKey: string } | null>(null);

  const resultColor = (r: string) =>
    r === "Effective" ? "text-emerald-600 dark:text-emerald-400" :
    r === "N/A" ? "text-slate-400 dark:text-slate-500" :
    r === "Ineffective" ? "text-red-600 dark:text-red-400" :
    "text-red-500 dark:text-red-400";

  const resultBg = (r: string) =>
    r === "Effective" ? "bg-emerald-50 dark:bg-emerald-900/10" :
    r === "N/A" ? "bg-slate-50 dark:bg-slate-900/10" :
    r === "Ineffective" ? "bg-red-50 dark:bg-red-900/10" :
    "bg-amber-50 dark:bg-amber-900/10";

  const confidenceColor = (c: string) =>
    c === "High" ? "text-emerald-600 dark:text-emerald-400" :
    c === "Medium" ? "text-amber-600 dark:text-amber-400" :
    "text-red-500 dark:text-red-400";

  const overallColor = (o: string) =>
    o === "Effective" ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" :
    o === "Ineffective" ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20" :
    "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";

  const handleApplyOverride = (sampleId: string, attrKey: string) => {
    const key = `${sampleId}-${attrKey}`;
    const vals = overrideValues[key];
    if (vals) {
      setAppliedOverrides(prev => ({ ...prev, [key]: vals }));
    }
    setOverrideAttr(null);
  };

  return (
    <div className="space-y-0" data-testid="sample-attribute-grid">
      <div className="rounded-lg border border-slate-200 dark:border-border overflow-hidden">
        <div className="grid grid-cols-[minmax(160px,1.5fr)_repeat(5,1fr)_100px] border-b border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/30">
          <div className="px-3 py-2.5 text-[10px] font-semibold text-foreground uppercase tracking-wider">Sample</div>
          {testingAttributes.map(a => (
            <div key={a.key} className="px-2 py-2.5 text-[10px] font-semibold text-foreground uppercase tracking-wider text-center">{a.label}</div>
          ))}
          <div className="px-2 py-2.5 text-[10px] font-semibold text-foreground uppercase tracking-wider text-center">Overall</div>
        </div>

        {samples.map((sample) => {
          const isExpanded = expandedRow === sample.id;
          return (
            <div key={sample.id} data-testid={`sample-row-${sample.id}`}>
              <button
                onClick={() => setExpandedRow(isExpanded ? null : sample.id)}
                className={`w-full grid grid-cols-[minmax(160px,1.5fr)_repeat(5,1fr)_100px] border-b border-slate-100 dark:border-border/50 hover:bg-slate-50/80 dark:hover:bg-muted/10 transition-colors ${isExpanded ? "bg-slate-50/60 dark:bg-muted/10" : ""}`}
                data-testid={`button-expand-sample-${sample.id}`}
              >
                <div className="px-3 py-3 flex items-center gap-2 text-left">
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-foreground block">{sample.label}</span>
                    <span className="text-[10px] text-muted-foreground">{sample.subtitle}</span>
                  </div>
                </div>
                {testingAttributes.map(a => {
                  const attr = sample.attributes[a.key];
                  const overrideKey = `${sample.id}-${a.key}`;
                  const applied = appliedOverrides[overrideKey];
                  const displayResult = applied ? applied.result : attr?.result;
                  return (
                    <div
                      key={a.key}
                      className="px-2 py-3 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-muted/20 rounded transition-colors"
                      onClick={(e) => { e.stopPropagation(); setAnnotationTarget({ sampleId: sample.id, attrKey: a.key }); }}
                      data-testid={`cell-annotate-${sample.id}-${a.key}`}
                    >
                      <span className={`text-[11px] font-semibold underline decoration-dotted underline-offset-2 ${resultColor(displayResult ?? "")}`}>{displayResult}</span>
                      <span className={`text-[9px] ${confidenceColor(attr?.confidence ?? "")}`}>{attr?.confidence}</span>
                    </div>
                  );
                })}
                <div className="px-2 py-3 flex items-center justify-center">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${overallColor(sample.overall)}`}>{sample.overall}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-b border-slate-200 dark:border-border bg-slate-50/40 dark:bg-muted/5" data-testid={`sample-detail-${sample.id}`}>
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-border/40">
                    <span className="text-xs font-semibold text-foreground">Sample {sample.label} — Detail View</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-border/30">
                    {sample.details.map((detail) => {
                      const overrideKey = `${sample.id}-${detail.key}`;
                      const isOverriding = overrideAttr === overrideKey;
                      const applied = appliedOverrides[overrideKey];
                      const displayResult = applied ? applied.result : detail.result;
                      const displayConfidence = detail.confidence;
                      return (
                        <div key={detail.key} className="px-5 py-4" data-testid={`attr-detail-${sample.id}-${detail.key}`}>
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 pt-0.5">{detail.key}</span>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">{detail.title}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[11px] font-semibold ${resultColor(displayResult)}`}>{displayResult}</span>
                                  <span className={`text-[9px] ${confidenceColor(displayConfidence)}`}>{displayConfidence}</span>
                                </div>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{detail.description}</p>
                              {detail.sourceDoc && (
                                <div className="flex items-center gap-1 mt-1">
                                  <FileText className="w-3 h-3 text-[#266C92] shrink-0" />
                                  <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] text-[#266C92] underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer" data-testid={`link-source-${sample.id}-${detail.key}`}>
                                    {detail.sourceDoc}{detail.sourceLocation ? `, ${detail.sourceLocation}` : ""}
                                  </a>
                                </div>
                              )}
                              {applied && !isOverriding && (
                                <div className="mt-1.5 p-2 rounded bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
                                  <p className="text-[10px] text-amber-700 dark:text-amber-400"><span className="font-semibold">Override applied:</span> {applied.result} — {applied.rationale}</p>
                                </div>
                              )}
                              {!isOverriding && (
                                <button
                                  onClick={() => {
                                    setOverrideAttr(overrideKey);
                                    if (!overrideValues[overrideKey]) {
                                      setOverrideValues(prev => ({ ...prev, [overrideKey]: { result: displayResult, rationale: "" } }));
                                    }
                                  }}
                                  className="text-[10px] text-[#266C92] font-medium hover:underline mt-1"
                                  data-testid={`button-override-${sample.id}-${detail.key}`}
                                >
                                  Override
                                </button>
                              )}
                              {isOverriding && (
                                <div className="mt-2 p-3 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-background space-y-2" data-testid={`override-form-${sample.id}-${detail.key}`}>
                                  <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Result:</label>
                                    <select
                                      value={overrideValues[overrideKey]?.result ?? displayResult}
                                      onChange={(e) => setOverrideValues(prev => ({ ...prev, [overrideKey]: { ...prev[overrideKey], result: e.target.value } }))}
                                      className="text-xs border border-slate-200 dark:border-border rounded px-2 py-1 bg-white dark:bg-background text-foreground"
                                      data-testid={`select-override-result-${sample.id}-${detail.key}`}
                                    >
                                      <option value="Effective">Effective</option>
                                      <option value="Ineffective">Ineffective</option>
                                      <option value="Missing">Missing</option>
                                      <option value="N/A">N/A</option>
                                    </select>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Rationale for override..."
                                    value={overrideValues[overrideKey]?.rationale ?? ""}
                                    onChange={(e) => setOverrideValues(prev => ({ ...prev, [overrideKey]: { ...prev[overrideKey], rationale: e.target.value } }))}
                                    className="w-full text-xs border border-slate-200 dark:border-border rounded px-3 py-1.5 bg-white dark:bg-background text-foreground placeholder:text-muted-foreground"
                                    data-testid={`input-override-rationale-${sample.id}-${detail.key}`}
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleApplyOverride(sample.id, detail.key)}
                                      className="text-[10px] font-semibold text-white bg-[#266C92] hover:bg-[#1e5a7a] px-3 py-1 rounded transition-colors"
                                      data-testid={`button-apply-override-${sample.id}-${detail.key}`}
                                    >
                                      Apply Override
                                    </button>
                                    <button
                                      onClick={() => setOverrideAttr(null)}
                                      className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-3 py-1 rounded border border-slate-200 dark:border-border transition-colors"
                                      data-testid={`button-cancel-override-${sample.id}-${detail.key}`}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {annotationTarget && (
        <Suspense fallback={null}>
          <AnnotationOverlay
            samples={samples}
            initialSampleId={annotationTarget.sampleId}
            initialAttributeKey={annotationTarget.attrKey}
            controlId={DEMO_CONTROL_ID}
            onClose={() => setAnnotationTarget(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

function DemoOutputTable({ data }: { data: DemoStepOutputData }) {
  const cellContent = (cell: string | { text: string; color?: string }) => {
    if (typeof cell === "string") return renderDocLinks(cell, "text-xs text-foreground");
    const colorClass = cell.color === "green" ? "text-emerald-600 dark:text-emerald-400" :
      cell.color === "red" ? "text-red-600 dark:text-red-400" :
      cell.color === "amber" ? "text-amber-600 dark:text-amber-400" : "text-foreground";
    return renderDocLinks(cell.text, `text-xs font-medium ${colorClass}`);
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-border overflow-hidden">
      <div className="px-3 py-2 bg-slate-50 dark:bg-muted/30 border-b border-slate-200 dark:border-border">
        <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{data.title}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-border/50">
              {data.headers.map((h, i) => (
                <th key={i} className="px-3 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-border/30">
            {data.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-muted/5">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5">{cellContent(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.summary && (
        <div className="px-3 py-2 border-t border-slate-100 dark:border-border/50 bg-slate-50/50 dark:bg-muted/10">
          <p className="text-[11px] text-muted-foreground italic">{data.summary}</p>
        </div>
      )}
    </div>
  );
}

function SubStepIndicator({ status }: { status: string }) {
  if (status === "complete") return <CheckCircle2 className="w-3.5 h-3.5 text-[#266C92]" />;
  if (status === "running") return <Loader2 className="w-3.5 h-3.5 text-[#266C92] animate-spin" />;
  if (status === "waiting") return <Clock className="w-3.5 h-3.5 text-amber-500" />;
  if (status === "blocked") return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
  return <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-slate-300 dark:border-slate-600" />;
}

const automationModeIcons: Record<AutomationMode, { icon: typeof Zap; color: string; title: string }> = {
  full: { icon: Zap, color: "text-emerald-400 dark:text-emerald-500", title: "Full Automation" },
  checkpoint: { icon: Flag, color: "text-amber-400 dark:text-amber-500", title: "Checkpoint" },
  manual: { icon: Fingerprint, color: "text-blue-400 dark:text-blue-500", title: "Manual" },
};

type ManualInputField = {
  id: string;
  label: string;
  type: "select" | "toggle" | "text";
  options?: string[];
  defaultValue?: string;
};

const manualSubstepInputs: Record<string, { prompt: string; fields: ManualInputField[] }> = {
  "rd-assess": { prompt: "Configure input readiness scan", fields: [
    { id: "scope", label: "Assessment Scope", type: "select", options: ["All inputs", "Critical only", "Custom selection"], defaultValue: "All inputs" },
    { id: "depth", label: "Depth", type: "select", options: ["Standard", "Deep inspection", "Surface check"], defaultValue: "Standard" },
  ]},
  "cs-interpret": { prompt: "Set control interpretation parameters", fields: [
    { id: "mode", label: "Parsing Mode", type: "select", options: ["Standard NLP", "Enhanced (multi-pass)", "Rule-based"], defaultValue: "Standard NLP" },
  ]},
  "cs-extract": { prompt: "Define attribute extraction scope", fields: [
    { id: "scope", label: "Extraction Scope", type: "select", options: ["All attributes", "Key attributes only", "Custom"], defaultValue: "All attributes" },
    { id: "confidence", label: "Min Confidence", type: "select", options: ["High (90%+)", "Medium (70%+)", "Low (50%+)"], defaultValue: "High (90%+)" },
  ]},
  "cs-plan": { prompt: "Configure test plan generation", fields: [
    { id: "template", label: "Plan Template", type: "select", options: ["SOX standard", "IA risk-based", "Custom framework"], defaultValue: "SOX standard" },
  ]},
  "pop-ingest": { prompt: "Select population data source", fields: [
    { id: "source", label: "Source Type", type: "select", options: ["File upload", "API connection", "Database query", "Manual entry"], defaultValue: "File upload" },
    { id: "format", label: "Expected Format", type: "select", options: ["CSV", "Excel (.xlsx)", "JSON", "Auto-detect"], defaultValue: "Auto-detect" },
  ]},
  "pop-validate": { prompt: "Set validation rules", fields: [
    { id: "strictness", label: "Validation Level", type: "select", options: ["Strict (reject on warning)", "Standard", "Lenient (errors only)"], defaultValue: "Standard" },
  ]},
  "pop-complete": { prompt: "Define completeness criteria", fields: [
    { id: "period", label: "Control Period", type: "select", options: ["Full year", "Current quarter", "Custom range"], defaultValue: "Full year" },
    { id: "coverage", label: "Min Coverage", type: "select", options: ["100%", "95%", "90%", "85%"], defaultValue: "100%" },
  ]},
  "pop-anomaly": { prompt: "Configure anomaly detection", fields: [
    { id: "sensitivity", label: "Sensitivity", type: "select", options: ["High", "Medium", "Low"], defaultValue: "Medium" },
    { id: "action", label: "On Detection", type: "select", options: ["Flag & continue", "Flag & pause", "Auto-exclude"], defaultValue: "Flag & continue" },
  ]},
  "smp-method": { prompt: "Select sampling methodology", fields: [
    { id: "method", label: "Approach", type: "select", options: ["Statistical (MUS)", "Random", "Judgmental", "Stratified random", "Hybrid"], defaultValue: "Stratified random" },
  ]},
  "smp-stratify": { prompt: "Configure risk stratification", fields: [
    { id: "tiers", label: "Risk Tiers", type: "select", options: ["2 tiers", "3 tiers", "4 tiers", "5 tiers"], defaultValue: "3 tiers" },
    { id: "weighting", label: "Weight Basis", type: "select", options: ["Transaction value", "Risk score", "Frequency", "Equal weight"], defaultValue: "Risk score" },
  ]},
  "smp-size": { prompt: "Set sample size parameters", fields: [
    { id: "confidence", label: "Confidence Level", type: "select", options: ["99%", "95%", "90%"], defaultValue: "95%" },
    { id: "error", label: "Tolerable Error", type: "select", options: ["1%", "3%", "5%", "10%"], defaultValue: "5%" },
  ]},
  "smp-select": { prompt: "Execute sample selection", fields: [
    { id: "seed", label: "Random Seed", type: "text", defaultValue: "auto" },
    { id: "replacement", label: "Allow Replacement", type: "select", options: ["No replacement", "With replacement"], defaultValue: "No replacement" },
  ]},
  "evd-map": { prompt: "Configure evidence mapping", fields: [
    { id: "mode", label: "Mapping Mode", type: "select", options: ["Auto-map from RCM", "Template-based", "Manual assignment"], defaultValue: "Auto-map from RCM" },
  ]},
  "evd-source": { prompt: "Define evidence search scope", fields: [
    { id: "scope", label: "Search Scope", type: "select", options: ["All connected systems", "Primary sources only", "Manual sources"], defaultValue: "All connected systems" },
    { id: "fallback", label: "If Unavailable", type: "select", options: ["Request PBC", "Flag & skip", "Substitute allowed"], defaultValue: "Request PBC" },
  ]},
  "evd-collect": { prompt: "Set collection parameters", fields: [
    { id: "method", label: "Collection Method", type: "select", options: ["Auto-pull from systems", "Manual upload", "Hybrid"], defaultValue: "Hybrid" },
  ]},
  "eu-classify": { prompt: "Configure document classification", fields: [
    { id: "model", label: "Classification Model", type: "select", options: ["AI auto-classify", "Rule-based", "Manual tagging"], defaultValue: "AI auto-classify" },
    { id: "categories", label: "Category Set", type: "select", options: ["Standard audit types", "Custom taxonomy", "PCAOB categories"], defaultValue: "Standard audit types" },
  ]},
  "eu-extract": { prompt: "Set field extraction parameters", fields: [
    { id: "depth", label: "Extraction Depth", type: "select", options: ["Key fields only", "All structured fields", "Deep extraction (incl. unstructured)"], defaultValue: "All structured fields" },
  ]},
  "eu-parse": { prompt: "Configure value normalization", fields: [
    { id: "rules", label: "Normalization Rules", type: "select", options: ["Standard (dates, currency, IDs)", "Extended (+ free text)", "Minimal"], defaultValue: "Standard (dates, currency, IDs)" },
  ]},
  "eu-xref": { prompt: "Set cross-reference parameters", fields: [
    { id: "tolerance", label: "Match Tolerance", type: "select", options: ["Exact match", "Fuzzy (±1%)", "Flexible (±5%)"], defaultValue: "Exact match" },
    { id: "unmatched", label: "Unmatched Action", type: "select", options: ["Flag as exception", "Request clarification", "Auto-resolve"], defaultValue: "Flag as exception" },
  ]},
  "ae-test": { prompt: "Configure attribute testing", fields: [
    { id: "approach", label: "Testing Approach", type: "select", options: ["Systematic (all attributes)", "Risk-prioritized", "Targeted"], defaultValue: "Systematic (all attributes)" },
  ]},
  "ae-determine": { prompt: "Set pass/fail criteria", fields: [
    { id: "threshold", label: "Pass Threshold", type: "select", options: ["100% match required", "Substantial compliance (≥95%)", "Material compliance (≥90%)"], defaultValue: "100% match required" },
  ]},
  "ae-rationale": { prompt: "Configure rationale documentation", fields: [
    { id: "detail", label: "Detail Level", type: "select", options: ["Full reasoning chain", "Summary only", "Key findings"], defaultValue: "Full reasoning chain" },
    { id: "refs", label: "Evidence References", type: "select", options: ["Include all refs", "Primary evidence only", "Exceptions only"], defaultValue: "Include all refs" },
  ]},
  "ae-exception": { prompt: "Set exception classification rules", fields: [
    { id: "scheme", label: "Severity Scheme", type: "select", options: ["3-tier (High/Med/Low)", "5-tier (Critical–Info)", "Binary (Material/Immaterial)"], defaultValue: "3-tier (High/Med/Low)" },
  ]},
  "te-aggregate": { prompt: "Configure results aggregation", fields: [
    { id: "method", label: "Aggregation Method", type: "select", options: ["Weighted average", "Worst-case", "Proportional"], defaultValue: "Weighted average" },
  ]},
  "te-complete": { prompt: "Set completeness validation criteria", fields: [
    { id: "minCoverage", label: "Minimum Coverage", type: "select", options: ["100% required", "95% acceptable", "90% acceptable"], defaultValue: "100% required" },
  ]},
  "te-confidence": { prompt: "Configure confidence scoring", fields: [
    { id: "model", label: "Confidence Model", type: "select", options: ["Statistical significance", "Expert judgment", "Blended approach"], defaultValue: "Blended approach" },
  ]},
  "te-conclude": { prompt: "Set effectiveness determination criteria", fields: [
    { id: "threshold", label: "Effectiveness Threshold", type: "select", options: ["Effective ≥ 95% pass rate", "Effective ≥ 90% pass rate", "Effective ≥ 85% pass rate"], defaultValue: "Effective ≥ 95% pass rate" },
    { id: "override", label: "Manual Override", type: "select", options: ["Allowed with justification", "Not allowed", "Escalation required"], defaultValue: "Allowed with justification" },
  ]},
};

function ManualSubstepForm({ substepId, onRun }: { substepId: string; onRun: () => void }) {
  const config = manualSubstepInputs[substepId];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    config?.fields.forEach(f => { defaults[f.id] = f.defaultValue ?? ""; });
    return defaults;
  });

  if (!config) {
    return (
      <div className="pl-12 pr-3 pb-2 pt-1">
        <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
          <Fingerprint className="w-3 h-3 text-blue-500 shrink-0" />
          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium flex-1">Manual mode — trigger when ready</span>
          <Button
            size="sm"
            className="h-6 px-2.5 text-[10px] gap-1 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onRun}
            data-testid={`button-run-substep-${substepId}`}
          >
            <Play className="w-2.5 h-2.5" />
            Run
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-12 pr-3 pb-2 pt-1">
      <div className="p-2.5 rounded-md bg-blue-50/60 dark:bg-blue-900/15 border border-blue-200/50 dark:border-blue-800/30 space-y-2">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-3 h-3 text-blue-500 shrink-0" />
          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">{config.prompt}</span>
        </div>
        <div className="grid gap-1.5">
          {config.fields.map(field => (
            <div key={field.id} className="flex items-center gap-2">
              <label className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-medium w-[110px] shrink-0 text-right">{field.label}</label>
              {field.type === "select" ? (
                <select
                  value={values[field.id] ?? field.defaultValue}
                  onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                  className="flex-1 h-6 text-[10px] rounded border border-blue-200/60 dark:border-blue-700/40 bg-white dark:bg-slate-800 text-foreground px-1.5 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-600"
                  data-testid={`manual-input-${substepId}-${field.id}`}
                >
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={values[field.id] ?? field.defaultValue}
                  onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                  className="flex-1 h-6 text-[10px] rounded border border-blue-200/60 dark:border-blue-700/40 bg-white dark:bg-slate-800 text-foreground px-1.5 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-600"
                  data-testid={`manual-input-${substepId}-${field.id}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-0.5">
          <Button
            size="sm"
            className="h-6 px-3 text-[10px] gap-1 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onRun}
            data-testid={`button-run-substep-${substepId}`}
          >
            <Play className="w-2.5 h-2.5" />
            Run Step
          </Button>
        </div>
      </div>
    </div>
  );
}

type StepNodeContentProps = {
  step: string;
  stepStatus: string;
  controlId: string;
  substepProgress: number;
  blockRule?: { controlId: string; blockAtStep: string; title: string; description: string; severity: string } | null;
  onResolve?: (controlId: string) => void;
  isResolved?: boolean;
  onAction?: (stepKey: string, actionId: string) => void;
  onSubstepAction?: (substepId: string, action: string) => void;
  autoExpandedSubs?: Set<string>;
  automationConfig?: AutomationConfig;
  onResumeSubstep?: (substepId: string) => void;
  manualTriggered?: Set<string>;
  checkpointAcked?: Set<string>;
  onAckCheckpoint?: (substepId: string) => void;
  workstreamActive?: boolean;
  evidenceWorkstreamActive?: boolean;
  completedTrackerSubs?: Set<string>;
};

function StepNodeContent({ step, stepStatus, controlId, substepProgress, blockRule, onSubstepAction, autoExpandedSubs, automationConfig, onResumeSubstep, manualTriggered, checkpointAcked, onAckCheckpoint, workstreamActive, evidenceWorkstreamActive, completedTrackerSubs }: StepNodeContentProps) {
  const info = stepNodeInfo[step];
  if (!info) return null;

  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(() => new Set());
  const isBlockedAtThisStep = blockRule && blockRule.blockAtStep === step && stepStatus === "blocked";
  const isDemo = controlId === DEMO_CONTROL_ID;
  const allSubsDone = substepProgress >= info.substeps.length;

  const blockedSubIdx = isBlockedAtThisStep && blockRule?.blockAtSubstep
    ? info.substeps.findIndex(s => s.id === blockRule.blockAtSubstep)
    : -1;
  const effectiveProgress = blockedSubIdx >= 0 ? Math.max(substepProgress, blockedSubIdx) : substepProgress;

  const stepAutoConfig = automationConfig?.[step];
  const stepMode: AutomationMode = stepAutoConfig?.mode ?? "full";

  const mergedExpanded = useMemo(() => {
    const s = new Set(expandedSubs);
    if (autoExpandedSubs) autoExpandedSubs.forEach(id => s.add(id));
    return s;
  }, [expandedSubs, autoExpandedSubs]);

  const toggleSub = (id: string) => {
    setExpandedSubs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2" data-testid={`step-node-${step}`}>
      {info.substeps.map((sub, idx) => {
        const subMode: AutomationMode = stepAutoConfig?.substeps?.[sub.id] ?? stepMode;
        const baseStatus = stepStatus === "complete" || idx < effectiveProgress
          ? "complete"
          : stepStatus === "blocked" && idx === effectiveProgress
            ? "blocked"
            : idx === effectiveProgress && stepStatus === "waiting"
              ? "waiting"
              : idx === effectiveProgress && (stepStatus === "running")
                ? "running"
                : "pending";
        const isCheckpointHeld = baseStatus === "complete" && subMode === "checkpoint" && !(checkpointAcked?.has(sub.id));
        const isManualWaiting = subMode === "manual" && stepStatus === "running" && idx === substepProgress && !manualTriggered?.has(sub.id) && (baseStatus === "pending" || baseStatus === "running");
        const subStatus = isManualWaiting ? "manual-waiting" : isCheckpointHeld ? "checkpoint-held" : baseStatus;
        const SubIcon = sub.icon;
        const isExpanded = mergedExpanded.has(sub.id);
        const outputs = isDemo ? (demoSubstepOutputs[sub.id] ?? []) : [];
        const isReadinessAssess = sub.id === "rd-assess";
        const isTestingGrid = sub.id === "ae-test" && isDemo;
        const hasContent = outputs.length > 0 || isReadinessAssess || isTestingGrid;
        const popIngestCompleted = completedTrackerSubs?.has("pop-ingest");
        const evdCollectCompleted = completedTrackerSubs?.has("evd-collect");
        const showInlineUpload = sub.id === "pop-ingest" && (baseStatus === "running" || baseStatus === "blocked" || (baseStatus === "complete" && popIngestCompleted));
        const showEvidenceUpload = sub.id === "evd-collect" && (baseStatus === "running" || baseStatus === "blocked" || (baseStatus === "complete" && evdCollectCompleted));
        const showEvidenceTracker = showEvidenceUpload;
        const hasTrackerContent = (showInlineUpload && (workstreamActive || popIngestCompleted)) || showEvidenceTracker;
        const isExpandable = baseStatus === "complete" || hasTrackerContent;
        const modeIconInfo = automationModeIcons[subMode];
        const ModeIcon = modeIconInfo.icon;

        return (
          <div
            key={sub.id}
            className="transition-colors"
            data-testid={`substep-${sub.id}`}
          >
            <button
              onClick={() => isExpandable && hasContent && toggleSub(sub.id)}
              disabled={!isExpandable || !hasContent}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                subStatus === "running" ? "bg-[#266C92]/[0.04]" :
                subStatus === "checkpoint-held" ? "bg-amber-50/40 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30" :
                subStatus === "manual-waiting" ? "bg-blue-50/40 dark:bg-blue-900/10 border border-blue-200/60 dark:border-blue-800/30" :
                subStatus === "waiting" ? "bg-amber-50/30 dark:bg-amber-900/5" :
                subStatus === "blocked" ? "bg-red-50/30 dark:bg-red-900/5" :
                isExpandable && hasContent ? "hover:bg-slate-50/80 dark:hover:bg-muted/10 cursor-pointer" :
                "cursor-default"
              } ${subStatus === "pending" ? "opacity-50" : ""}`}
              data-testid={`substep-toggle-${sub.id}`}
            >
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-muted-foreground font-mono w-4 text-right">{idx + 1}</span>
                <SubStepIndicator status={baseStatus} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SubIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className={`text-xs font-medium ${baseStatus === "complete" || baseStatus === "running" ? "text-foreground" : "text-muted-foreground"}`}>{sub.label}</span>
                  <ModeIcon className={`w-2.5 h-2.5 ${modeIconInfo.color} shrink-0 opacity-70`} title={modeIconInfo.title} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{sub.description}</p>
              </div>
              {isExpandable && hasContent && (
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              )}
            </button>

            {subStatus === "checkpoint-held" && (
              <div className="pl-12 pr-3 pb-2 pt-1">
                <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
                  <Flag className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex-1">Checkpoint — review before proceeding</span>
                  <Button
                    size="sm"
                    className="h-6 px-2.5 text-[10px] gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={(e) => { e.stopPropagation(); onAckCheckpoint?.(sub.id); }}
                    data-testid={`button-ack-checkpoint-${sub.id}`}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Confirm
                  </Button>
                </div>
              </div>
            )}

            {subStatus === "manual-waiting" && (
              <ManualSubstepForm substepId={sub.id} onRun={() => onResumeSubstep?.(sub.id)} />
            )}

            {showInlineUpload && !workstreamActive && !popIngestCompleted && (baseStatus === "running" || baseStatus === "blocked") && (
              <div className="pl-12 pr-3 pb-2 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] gap-1.5"
                    onClick={() => onSubstepAction?.("pop-ingest", "request")}
                    data-testid="button-population-request"
                  >
                    <Send className="w-3 h-3" />
                    Request via Workstream
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-[11px] gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                    onClick={() => onSubstepAction?.("pop-ingest", "upload")}
                    data-testid="button-population-upload"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Population
                  </Button>
                </div>
              </div>
            )}

            {showInlineUpload && (workstreamActive || popIngestCompleted) && (isExpanded || baseStatus === "running") && (
              <div className="pl-12 pr-3 pb-3 pt-1">
                <AgenticStepTracker
                  title="Workstream Request"
                  steps={workstreamRequestSteps}
                  onComplete={() => onSubstepAction?.("pop-ingest", "workstream-complete")}
                  staticComplete={!workstreamActive && popIngestCompleted}
                />
              </div>
            )}

            {showEvidenceUpload && !evidenceWorkstreamActive && !evdCollectCompleted && (baseStatus === "running" || baseStatus === "blocked") && (
              <div className="pl-12 pr-3 pb-2 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] gap-1.5"
                    onClick={() => onSubstepAction?.("evd-collect", "request")}
                    data-testid="button-evidence-request"
                  >
                    <Send className="w-3 h-3" />
                    Request via Workstream
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-[11px] gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                    onClick={() => onSubstepAction?.("evd-collect", "upload")}
                    data-testid="button-evidence-upload"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Evidence
                  </Button>
                </div>
              </div>
            )}

            {showEvidenceUpload && (evidenceWorkstreamActive || evdCollectCompleted) && (isExpanded || baseStatus === "running") && (
              <div className="pl-12 pr-3 pb-3 pt-1">
                <AgenticStepTracker
                  title="Evidence Workstream Request"
                  steps={evidenceWorkstreamSteps}
                  onComplete={() => onSubstepAction?.("evd-collect", "workstream-complete")}
                  staticComplete={!evidenceWorkstreamActive && evdCollectCompleted}
                />
              </div>
            )}

            {isExpanded && hasContent && (
              <div className="pl-12 pr-3 pb-3 pt-1 space-y-2">
                {isReadinessAssess ? (
                  <ReadinessAssessmentContent stepStatus={stepStatus} rows={isDemo ? demoReadinessRows : undefined} />
                ) : isTestingGrid ? (
                  <SampleAttributeTestingGrid samples={demoSampleTestRows} />
                ) : (
                  outputs.map((table, tIdx) => (
                    <DemoOutputTable key={tIdx} data={table} />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

      {isBlockedAtThisStep && blockRule && (
        <div className="p-3 rounded-lg bg-red-50/80 border border-red-200 dark:bg-red-900/10 dark:border-red-800/30 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">{blockRule.title}</span>
            <Badge className="text-[9px] h-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 ml-auto">
              {blockRule.severity}
            </Badge>
          </div>
          <p className="text-[11px] text-red-600/80 dark:text-red-400/80 leading-relaxed">{blockRule.description}</p>
        </div>
      )}

      {stepStatus === "complete" && !isBlockedAtThisStep && (
        <div className="p-2.5 rounded-lg bg-[#266C92]/5 border border-[#266C92]/15">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#266C92]" />
            <p className="text-xs text-[#266C92] font-medium">Step completed — all substeps processed successfully.</p>
          </div>
        </div>
      )}

      {stepStatus === "running" && allSubsDone && (() => {
        const lastSub = info.substeps[info.substeps.length - 1];
        const lastSubMode: AutomationMode = (lastSub && stepAutoConfig?.substeps?.[lastSub.id]) ?? stepMode;
        const lastCheckpointPending = lastSubMode === "checkpoint" && lastSub && !(checkpointAcked?.has(lastSub.id));
        if (lastCheckpointPending) {
          return null;
        }
        return (
          <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/50 dark:bg-emerald-900/10 dark:border-emerald-800/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                {stepMode === "checkpoint" ? "All substeps complete — checkpoint review passed. Confirm to proceed." :
                 stepMode === "manual" ? "All substeps triggered and complete — confirm to proceed." :
                 "All substeps complete — awaiting your confirmation to proceed."}
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
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Manual mode — substep {Math.min(substepProgress + 1, info.substeps.length)} of {info.substeps.length} awaiting trigger</p>
              </>
            ) : stepMode === "checkpoint" ? (
              <>
                <Flag className="w-3 h-3 text-amber-500" />
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Checkpoint mode — substep {Math.min(substepProgress + 1, info.substeps.length)} of {info.substeps.length}</p>
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 text-[#266C92] animate-spin" />
                <p className="text-xs text-[#266C92] font-medium">Agent processing — substep {Math.min(substepProgress + 1, info.substeps.length)} of {info.substeps.length}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type ControlDetailInfo = {
  refId: string;
  shortDesc: string;
  longDesc: string;
  process: string;
  riskCode: string;
  riskDesc: string;
  assertions: string[];
  practices: string[];
  testingProcedure: string;
  reviewer: string;
  significance: string;
  classification: string;
  frequency: string;
  nature: string;
  controlType: string;
  finAccounts: string;
  pwcReliance: boolean;
  supervisor: string | null;
  ipe: string;
  testDetail: string;
  samplingApproach: string;
  finApplications: string;
  testTypes: string[];
  attributes: { ref: string; name: string; desc: string }[];
};

const controlMetaLookup: Record<string, {
  sub: string; freq: string; nat: string; rev: string; fin?: string;
  desc?: string; longDesc?: string; testProc?: string;
  attrs?: { ref: string; name: string; desc: string }[];
}> = {
  "CTL-001": { sub: "Identity & Access Management", freq: "Upon occurrence", nat: "Preventive", rev: "David Kim",
    desc: "Access provisioning requests analyzed for appropriate approval and completeness",
    longDesc: "Upon occurrence, the IT Security team reviews and processes access provisioning requests through the identity management system. Each request is validated against the role-based access control (RBAC) matrix to ensure appropriate access levels are granted, approvals are obtained from authorized managers, and provisioning is completed within SLA.",
    testProc: "For selected samples, verify that access provisioning requests have appropriate manager approval, role assignments match the RBAC matrix, and provisioning was completed within the defined SLA.",
    attrs: [
      { ref: "A", name: "Manager approval present", desc: "Verify that access request has documented approval from authorized manager" },
      { ref: "B", name: "Role assignment accuracy", desc: "Confirm assigned roles match the RBAC matrix for the user's job function" },
      { ref: "C", name: "Provisioning timeliness", desc: "Verify access was provisioned within the 48-hour SLA" },
      { ref: "D", name: "Access scope validation", desc: "Confirm access scope does not exceed the minimum necessary principle" },
    ],
  },
  "CTL-002": { sub: "Change & Release Management", freq: "Upon occurrence", nat: "Preventive", rev: "Sarah Chen",
    desc: "Change requests reviewed for proper authorization, testing, and deployment approval",
    longDesc: "Upon occurrence, the IT Operations team manages change requests through the ITSM platform. Each change undergoes impact assessment, receives appropriate approval based on risk level, is tested in a non-production environment, and follows the approved deployment window with rollback procedures documented.",
    testProc: "For selected changes, verify that change requests have appropriate CAB approval, testing evidence is documented, deployment followed the approved window, and rollback procedures were available.",
    attrs: [
      { ref: "A", name: "CAB approval documented", desc: "Verify change advisory board approval is documented for the change request" },
      { ref: "B", name: "Testing evidence available", desc: "Confirm pre-deployment testing was performed and results documented" },
      { ref: "C", name: "Deployment window compliance", desc: "Verify the change was deployed within the approved maintenance window" },
      { ref: "D", name: "Rollback plan present", desc: "Confirm a documented rollback procedure exists for the change" },
    ],
  },
  "CTL-004": { sub: "Infrastructure & Operations", freq: "Daily", nat: "Preventive", rev: "Michael Torres", fin: "N/A — IT General Control",
    desc: "Backup and recovery procedures verified for completeness and restoration capability",
    longDesc: "Daily, the IT Infrastructure team monitors automated backup jobs across critical systems. Backup completion status is reviewed, failures are investigated and resolved, and quarterly restoration tests are performed to validate data integrity and recovery time objectives (RTO).",
    testProc: "For selected periods, verify that backup jobs completed successfully, failures were investigated and resolved, and restoration tests meet documented RTO/RPO requirements.",
    attrs: [
      { ref: "A", name: "Backup completion status", desc: "Verify daily backup jobs completed successfully for all critical systems" },
      { ref: "B", name: "Failure resolution timeliness", desc: "Confirm backup failures were investigated and resolved within 24 hours" },
      { ref: "C", name: "Restoration test performed", desc: "Verify quarterly restoration tests were performed and documented" },
      { ref: "D", name: "RTO/RPO compliance", desc: "Confirm restoration times meet the documented recovery objectives" },
    ],
  },
  "CTL-005": { sub: "General Ledger / Journal Entries", freq: "Upon occurrence", nat: "Preventive", rev: "Claire Dubois", fin: "AUT100 — General Ledger",
    desc: "Journal entries reviewed for appropriate authorization, supporting documentation, and accuracy",
    longDesc: "Upon occurrence, the Controller's team reviews all manual journal entries exceeding the materiality threshold. Entries are validated for proper authorization, adequate supporting documentation, accurate account classification, and compliance with the company's accounting policies.",
    testProc: "For selected journal entries, verify that entries have dual approval from authorized personnel, supporting documentation is adequate, account codes are accurate, and entries comply with applicable accounting standards.",
    attrs: [
      { ref: "A", name: "Dual approval present", desc: "Verify journal entry has approval from two authorized personnel" },
      { ref: "B", name: "Supporting documentation adequate", desc: "Confirm adequate supporting documentation is attached and referenced" },
      { ref: "C", name: "Account classification accuracy", desc: "Verify account codes and cost centers are correctly assigned" },
      { ref: "D", name: "Posting period compliance", desc: "Confirm entry is posted in the correct accounting period" },
    ],
  },
  "CTL-006": { sub: "Treasury / Cash Management", freq: "Monthly", nat: "Detective", rev: "Oliver Wright", fin: "AUT200 — Cash & Bank",
    desc: "Bank reconciliations prepared and reviewed for completeness and timely resolution of discrepancies",
    longDesc: "Monthly, the Treasury team prepares bank reconciliations for all active accounts. Reconciliations compare GL balances to bank statements, identify and investigate outstanding items, and are reviewed and approved by Treasury management within the prescribed deadline.",
    testProc: "For selected months, verify that bank reconciliations are prepared timely, outstanding items are investigated and resolved, and reconciliations are reviewed and approved by management.",
    attrs: [
      { ref: "A", name: "Reconciliation timeliness", desc: "Verify bank reconciliation is completed within 5 business days of month-end" },
      { ref: "B", name: "Outstanding item investigation", desc: "Confirm outstanding items over 30 days are investigated with documented resolution" },
      { ref: "C", name: "Management review sign-off", desc: "Verify reconciliation is reviewed and signed off by Treasury management" },
      { ref: "D", name: "Balance agreement", desc: "Confirm GL balance agrees to bank statement balance after reconciling items" },
    ],
  },
  "CTL-007": { sub: "Revenue Cycle / Contract Accounting", freq: "Monthly", nat: "Detective", rev: "Jun Li", fin: "AUT300 — Revenue",
    desc: "Revenue recognition calculations reviewed for compliance with ASC 606 and contract terms",
    longDesc: "Monthly, the Revenue Accounting team reviews revenue recognition for all active contracts. Reviews ensure compliance with ASC 606 requirements, proper identification of performance obligations, accurate transaction price allocation, and appropriate timing of revenue recognition based on satisfaction of performance obligations.",
    testProc: "For selected contracts, verify that performance obligations are properly identified, transaction prices are accurately allocated, revenue is recognized upon satisfaction of obligations, and calculations comply with ASC 606.",
    attrs: [
      { ref: "A", name: "Performance obligation identification", desc: "Verify all distinct performance obligations are identified per the contract" },
      { ref: "B", name: "Transaction price allocation", desc: "Confirm transaction price is allocated to obligations using standalone selling prices" },
      { ref: "C", name: "Recognition timing accuracy", desc: "Verify revenue is recognized when performance obligations are satisfied" },
      { ref: "D", name: "ASC 606 compliance", desc: "Confirm revenue recognition treatment complies with ASC 606 requirements" },
    ],
  },
  "CTL-008": { sub: "Accounts Payable / Disbursements", freq: "Upon occurrence", nat: "Preventive", rev: "Amy Lau", fin: "AUT000 — Accounts Payable",
    desc: "Vendor payments authorized through 3-way match verification and approval workflow",
    longDesc: "Upon occurrence, the AP Manager ensures that all vendor payments exceeding the tolerance threshold are processed through a 3-way match verification (purchase order, goods receipt, invoice). Discrepancies are investigated and resolved, and payments require documented manager approval before release.",
    testProc: "For selected payments, verify that 3-way match is completed, discrepancies exceeding tolerance are investigated with documented resolution, and payment release has appropriate manager authorization.",
    attrs: [
      { ref: "A", name: "3-way match completion", desc: "Verify purchase order, goods receipt, and invoice are matched and agree" },
      { ref: "B", name: "Tolerance threshold compliance", desc: "Confirm discrepancies exceeding the $3,000 tolerance are investigated" },
      { ref: "C", name: "Manager authorization present", desc: "Verify payment release has documented approval from authorized manager" },
      { ref: "D", name: "Vendor master data accuracy", desc: "Confirm payment is directed to validated vendor bank account details" },
    ],
  },
  "CTL-009": { sub: "Physical Security / Facility Access", freq: "Upon occurrence", nat: "Preventive", rev: "Claire Dubois", fin: "N/A — Entity Level Control" },
  "CTL-010": { sub: "Security Operations / Incident Management", freq: "Upon occurrence", nat: "Detective", rev: "Priya Sharma" },
  "CTL-011": { sub: "Data Governance / Information Security", freq: "Quarterly", nat: "Preventive", rev: "Sarah Chen", fin: "N/A — Entity Level Control" },
  "CTL-012": { sub: "Procurement / Purchasing", freq: "Upon occurrence", nat: "Preventive", rev: "Oliver Wright", fin: "AUT400 — Procurement" },
  "CTL-013": { sub: "Identity & Access Reviews", freq: "Quarterly", nat: "Detective", rev: "Sarah Chen" },
  "CTL-014": { sub: "Financial Reporting / Period Close", freq: "Monthly", nat: "Detective", rev: "Claire Dubois", fin: "AUT100 — General Ledger" },
  "CTL-015": { sub: "Vendor Risk Management", freq: "Annually", nat: "Preventive", rev: "Wei Zhang", fin: "N/A — Entity Level Control" },
  "CTL-016": { sub: "Security Operations / Privilege Management", freq: "Continuous", nat: "Detective", rev: "Nina Patel" },
  "CTL-017": { sub: "Cost Accounting / Inventory", freq: "Monthly", nat: "Detective", rev: "Hans Mueller", fin: "AUT500 — Inventory" },
  "CTL-018": { sub: "Accounts Receivable / Collections", freq: "Monthly", nat: "Detective", rev: "Emma Scott", fin: "AUT600 — Accounts Receivable" },
  "CTL-019": { sub: "Human Resources / Payroll", freq: "Per pay period", nat: "Preventive", rev: "Raj Anand", fin: "AUT700 — Payroll & Benefits" },
  "CTL-020": { sub: "Fixed Assets / Capital Expenditure", freq: "Monthly", nat: "Detective", rev: "Jun Li", fin: "AUT800 — Fixed Assets" },
  "CTL-021": { sub: "Database Administration / Access Control", freq: "Continuous", nat: "Detective", rev: "David Kim" },
  "CTL-022": { sub: "Network Security / Monitoring", freq: "Continuous", nat: "Detective", rev: "Michael Torres" },
  "CTL-023": { sub: "Business Continuity / Disaster Recovery", freq: "Annually", nat: "Preventive", rev: "Alex Morrison", fin: "N/A — Entity Level Control" },
  "CTL-024": { sub: "Ethics & Compliance", freq: "Upon occurrence", nat: "Detective", rev: "Ciara O'Brien", fin: "N/A — Entity Level Control" },
  "CTL-025": { sub: "Consolidation / Intercompany", freq: "Monthly", nat: "Detective", rev: "Oliver Wright", fin: "AUT900 — Intercompany" },
};

function getControlDetail(controlId: string): ControlDetailInfo | null {
  const master = masterControlsList.find(c => c.id === controlId);
  if (!master) return null;

  const num = parseInt(controlId.replace("CTL-", ""));
  const catCode = master.category === "IT General Controls" ? "IT" : master.category === "Financial Controls" ? "FN" : "EL";
  const refId = `US.${catCode}.${num}.C${num.toString().padStart(2, "0")}`;

  if (controlId === "CTL-003") {
    return {
      refId: "US.IT.3.C03",
      shortDesc: "Segregation of duties conflict matrix analyzed for appropriate role separation and access governance",
      longDesc: "Quarterly, the Internal Audit team reviews the SoD conflict matrix across all critical business processes. The team ensures that incompatible duties are properly separated and that compensating controls exist where separation is not feasible. Access conflicts are identified through automated role-permission analysis against the approved SoD rule set, with manual review of exception cases.",
      process: "Corporate / IT Security / Access Governance",
      riskCode: "R012",
      riskDesc: "Unauthorized access to critical functions may result in fraudulent transactions or undetected errors due to inadequate segregation of incompatible duties",
      assertions: ["Existence/Occurrence", "Rights & Obligations", "Completeness"],
      practices: ["D1 - Displays through policies and procedures", "D5 - Selects and develops control activities", "D7 - Evaluates and communicates deficiencies"],
      testingProcedure: "For selected samples, verify that the SoD conflict matrix is complete for all in-scope role combinations, remediation actions for identified conflicts are performed within the prescribed SLA, and quarterly review sign-offs are documented and approved.",
      reviewer: "Michael Torres",
      significance: "Key",
      classification: "Operational",
      frequency: "Quarterly",
      nature: "Detective",
      controlType: "Manual",
      finAccounts: "N/A — IT General Control",
      pwcReliance: false,
      supervisor: null,
      ipe: "#IPE.IT.3.C03: SoD conflict matrix report",
      testDetail: "For selected samples, verify that the SoD conflict matrix is complete for all in-scope role combinations, identify conflicts where incompatible access exists, confirm remediation actions are performed within the 30-day SLA, and verify quarterly review sign-offs are documented and approved by the control owner.",
      samplingApproach: "Judgmental",
      finApplications: "Okta IAM, SAP ERP",
      testTypes: ["Inspection", "Inquiry"],
      attributes: [
        { ref: "A1", name: "SoD matrix completeness", desc: "Verify the conflict matrix covers all critical function pairs per P-114 §4.2 across in-scope systems" },
        { ref: "A2", name: "Conflict identification accuracy", desc: "Confirm that identified user-role conflicts match the approved SoD rule set definitions" },
        { ref: "A3", name: "Remediation timeliness", desc: "Verify that conflict remediation actions are completed within the 5 business day SLA" },
        { ref: "A4", name: "Quarterly review sign-off", desc: "Confirm quarterly SoD review is performed and signed off by the control owner" },
        { ref: "A5", name: "Exception approval", desc: "Where conflicts cannot be resolved, verify risk acceptance is documented and approved" },
      ],
    };
  }

  const meta = controlMetaLookup[controlId] || { sub: master.name, freq: "Monthly", nat: "Detective", rev: "Review Team" };

  const processBase = master.category === "IT General Controls"
    ? "Corporate / Information Technology"
    : master.category === "Financial Controls"
      ? "Corporate / Finance & Accounting"
      : "Corporate / Enterprise Governance";

  const assertions = master.category === "Financial Controls"
    ? ["Completeness", "Existence/Occurrence", "Valuation & Accuracy", "Rights & Obligations"]
    : master.category === "IT General Controls"
      ? ["Existence/Occurrence", "Rights & Obligations", "Completeness"]
      : ["Completeness", "Existence/Occurrence", "Rights & Obligations"];

  const practices = master.category === "Financial Controls"
    ? ["D1 - Displays through policies and procedures", "D7 - Evaluates and communicates deficiencies"]
    : master.category === "IT General Controls"
      ? ["D1 - Displays through policies and procedures", "D5 - Selects and develops control activities"]
      : ["D1 - Displays through policies and procedures", "D3 - Uses relevant information"];

  const controlType = master.dataSource === "connected" ? "IT Dependent Manual" : "Manual";
  const classification = master.category === "Financial Controls" ? "Financial Reporting" : "Operational";
  const significance = master.riskLevel === "Critical" || master.riskLevel === "High" ? "Key" : "Non-Key";
  const finAccounts = meta.fin || (master.category === "IT General Controls" ? "N/A — IT General Control" : "Various");
  const riskCode = `R${(10 + num * 3).toString().padStart(3, "0")}`;

  const riskDescMap: Record<string, string> = {
    "IT General Controls": "IT systems and access controls may not operate effectively, resulting in unauthorized access or undetected changes to critical systems and data",
    "Financial Controls": "Financial statements may contain material misstatements due to errors or fraud in transaction processing and reporting",
    "Entity Level Controls": "Entity-level governance controls may not provide adequate oversight, resulting in undetected compliance or operational failures",
  };

  const shortDesc = meta.desc || `${master.name} control verification and compliance testing`;
  const longDesc = meta.longDesc || `${meta.freq === "Upon occurrence" ? "Upon occurrence" : meta.freq === "Continuous" ? "Continuously" : meta.freq}, the ${master.owner} team performs ${master.name.toLowerCase()} procedures. ${master.dataSource === "connected" ? `Data is sourced from ${master.system} for automated analysis and validation.` : "Evidence is collected through manual PBC requests and reviewed for completeness."} Results are documented and exceptions are escalated per the established remediation framework.`;
  const testProc = meta.testProc || `For selected samples, verify that ${master.name.toLowerCase()} procedures are performed in accordance with the control design, required approvals are obtained, supporting documentation is adequate, and results are accurately recorded.`;

  const defaultAttrs: { ref: string; name: string; desc: string }[] = [
    { ref: "A", name: `${master.name} execution completeness`, desc: `Verify that ${master.name.toLowerCase()} procedures were fully executed for the sample period` },
    { ref: "B", name: "Authorization and approval", desc: "Confirm appropriate authorization and approval documentation is present" },
    { ref: "C", name: "Timeliness of execution", desc: "Verify the control was performed within the prescribed timeline or frequency" },
    { ref: "D", name: "Documentation adequacy", desc: "Confirm supporting documentation is complete, accurate, and appropriately retained" },
  ];

  return {
    refId,
    shortDesc,
    longDesc,
    process: `${processBase} / ${meta.sub}`,
    riskCode,
    riskDesc: riskDescMap[master.category] || "Control failure may result in material misstatement or operational disruption",
    assertions,
    practices,
    testingProcedure: testProc,
    reviewer: meta.rev,
    significance,
    classification,
    frequency: meta.freq,
    nature: meta.nat,
    controlType,
    finAccounts,
    pwcReliance: false,
    supervisor: null,
    ipe: `#IPE.${catCode}.${num}.C${num.toString().padStart(2, "0")}: ${master.name} report`,
    testDetail: testProc,
    samplingApproach: master.riskLevel === "Critical" ? "Statistical" : "Random",
    finApplications: master.system || "N/A",
    testTypes: master.dataSource === "connected" ? ["Inspection", "Reperformance"] : ["Inspection", "Inquiry"],
    attributes: meta.attrs || defaultAttrs,
  };
}

function ControlDetailsTab({ controlId }: { controlId: string }) {
  const detail = getControlDetail(controlId);
  const master = masterControlsList.find(c => c.id === controlId);
  const [controlInfoOpen, setControlInfoOpen] = useState(true);
  const [testInfoOpen, setTestInfoOpen] = useState(true);
  const [attributesOpen, setAttributesOpen] = useState(true);

  if (!detail || !master) return null;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="w-[90%] mx-auto px-6 py-6 space-y-0">
        <div>
          <button
            onClick={() => setControlInfoOpen(!controlInfoOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-control-info"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${controlInfoOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Control Information</span>
          </button>
          {controlInfoOpen && (
            <div className="flex gap-12 pb-6">
              <div className="flex-1 space-y-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Description</p>
                  <p className="text-xs text-foreground">
                    <span className="text-[#266C92] font-medium">{detail.refId}</span>{" "}
                    {detail.shortDesc}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{detail.longDesc}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Process/Subprocess</p>
                  <p className="text-xs text-foreground mt-0.5">{detail.process}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Risk Level</p>
                  <p className={`text-xs mt-0.5 font-medium ${master.riskLevel === "Critical" ? "text-red-600 dark:text-red-400" : master.riskLevel === "High" ? "text-orange-600 dark:text-orange-400" : "text-foreground"}`}>{master.riskLevel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Risk</p>
                  <p className="text-xs text-foreground mt-0.5">
                    <span className="text-[#266C92] underline cursor-pointer">{detail.riskCode}</span>{" "}
                    {detail.riskDesc}
                  </p>
                  <ul className="mt-2 space-y-0.5 ml-8">
                    {detail.assertions.map(a => (
                      <li key={a} className="text-xs text-muted-foreground">{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Control Practices</p>
                  <div className="mt-0.5 space-y-0.5">
                    {detail.practices.map(p => (
                      <p key={p} className="text-xs text-foreground">{p}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Testing Procedure</p>
                  <p className="text-xs text-foreground leading-relaxed mt-0.5">{detail.testingProcedure}</p>
                </div>
              </div>
              <div className="w-52 shrink-0 space-y-3.5">
                {([
                  ["Control Owner", master.owner],
                  ["PBC Owners", master.pbcOwner || "—"],
                  ["Control Reviewer", detail.reviewer],
                  ["Significance", detail.significance],
                  ["Classification", detail.classification],
                  ["Frequency", detail.frequency],
                  ["Nature", detail.nature],
                  ["Control Type", detail.controlType],
                  ["Fin. Accounts", detail.finAccounts],
                  ["PWC Reliance Control", detail.pwcReliance ? "Yes" : "No"],
                  ["Supervisor", detail.supervisor || "—"],
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

        <div>
          <button
            onClick={() => setTestInfoOpen(!testInfoOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-test-info"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${testInfoOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Control Test Information</span>
          </button>
          {testInfoOpen && (
            <div className="flex gap-12 pb-6">
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">IPE</p>
                  <p className="text-xs mt-0.5">
                    <span className="text-[#266C92] font-medium">{detail.ipe}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Test Procedures</p>
                  <p className="text-xs text-foreground leading-relaxed mt-0.5">{detail.testDetail}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Sampling Approach</p>
                  <p className="text-xs text-foreground mt-0.5">{detail.samplingApproach}</p>
                </div>
              </div>
              <div className="w-52 shrink-0 space-y-3.5">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Fin. Applications</p>
                  <p className="text-xs text-foreground font-medium mt-0.5">{detail.finApplications}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Test Types</p>
                  <div className="mt-0.5 space-y-0.5">
                    {detail.testTypes.map(t => (
                      <p key={t} className="text-xs text-foreground font-medium">{t}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-border" />

        <div>
          <button
            onClick={() => setAttributesOpen(!attributesOpen)}
            className="flex items-center gap-1.5 py-4"
            data-testid="toggle-attributes"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${attributesOpen ? "" : "-rotate-90"}`} />
            <span className="text-sm font-semibold text-foreground">Attributes</span>
          </button>
          {attributesOpen && (
            <div className="pb-6">
              <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-border bg-slate-50/80 dark:bg-muted/20">
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-20">Reference</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-52">Name</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.attributes.map(attr => (
                      <tr key={attr.ref} className="border-b last:border-b-0 border-slate-100 dark:border-border/50">
                        <td className="px-4 py-3 text-foreground font-medium align-top">{attr.ref}</td>
                        <td className="px-4 py-3 text-foreground align-top">{attr.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{attr.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-3 text-xs text-[#266C92] hover:text-[#1e5a7a] font-medium flex items-center gap-1" data-testid="button-add-attribute">
                + Add Attribute
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ControlIssuesStub({ controlId }: { controlId: string }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-muted/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No Issues</h3>
        <p className="text-xs text-muted-foreground max-w-sm">Issues related to {controlId} will appear here once identified during testing or review cycles.</p>
      </div>
    </div>
  );
}

function ControlAutomationsStub({ controlId }: { controlId: string }) {
  const master = masterControlsList.find(c => c.id === controlId);
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-muted/30 flex items-center justify-center mb-4">
          <Workflow className="w-5 h-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No Automations Configured</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          {master?.dataSource === "connected"
            ? `Automation rules for ${controlId} via ${master.system} can be configured here.`
            : `Automation rules for ${controlId} can be configured here once a connected data source is available.`
          }
        </p>
      </div>
    </div>
  );
}

type ControlFocusTab = "details" | "testing" | "issues" | "automations";

type TestCycle = "walkthrough" | "interim" | "rollforward";
const testCycles: { id: TestCycle; label: string; period: string; status: string }[] = [
  { id: "walkthrough", label: "Walkthrough", period: "Q4 FY2025", status: "Complete" },
  { id: "interim", label: "Interim", period: "Q1 FY2026", status: "In Progress" },
  { id: "rollforward", label: "Roll Forward", period: "Q2 FY2026", status: "Not Started" },
];

type TestDetailInfo = {
  tester: string;
  reviewer: string;
  pbcRequest: string;
  secondaryReviewer: string;
  sampleSize: string;
  budgetedHours: string;
  sampleSelections: string;
  dueDate: string;
};

function getTestDetailInfo(controlId: string, cycle: TestCycle): TestDetailInfo {
  const master = masterControlsList.find(c => c.id === controlId);
  const detail = getControlDetail(controlId);
  if (!master || !detail) {
    return { tester: "—", reviewer: "—", pbcRequest: "N/A", secondaryReviewer: "—", sampleSize: "—", budgetedHours: "—", sampleSelections: "—", dueDate: "—" };
  }

  const sampleSizeNum = master.riskLevel === "Critical" ? 5 : master.riskLevel === "High" ? 3 : 2;
  const freq = detail.frequency;
  const riskLabel = master.riskLevel;

  const periodSelections: Record<string, string> = {
    "Upon occurrence": cycle === "interim" ? "Sample of 25 transactions from Jul–Dec 2025" : cycle === "rollforward" ? "Sample of 25 transactions from Jan–Mar 2026" : "Sample of 10 transactions from Apr–Jun 2025",
    "Daily": cycle === "interim" ? "15 randomly selected days from Jul–Dec 2025" : cycle === "rollforward" ? "10 randomly selected days from Jan–Mar 2026" : "5 randomly selected days from Apr–Jun 2025",
    "Monthly": cycle === "interim" ? "March (P1), July (P6), November (P10)" : cycle === "rollforward" ? "January (P1), February (P2), March (P3)" : "October (P1), November (P2), December (P3)",
    "Quarterly": cycle === "interim" ? "Q3 FY2025, Q4 FY2025" : cycle === "rollforward" ? "Q1 FY2026" : "Q2 FY2025",
    "Annually": cycle === "interim" ? "Annual review — FY2025" : cycle === "rollforward" ? "Annual review — FY2026" : "Annual review — FY2025 (preliminary)",
    "Per pay period": cycle === "interim" ? "PP12 (Jun), PP18 (Sep), PP24 (Dec)" : cycle === "rollforward" ? "PP2 (Jan), PP6 (Mar)" : "PP6 (Sep), PP12 (Dec)",
    "Continuous": cycle === "interim" ? "Continuous monitoring — Jul–Dec 2025 period" : cycle === "rollforward" ? "Continuous monitoring — Jan–Mar 2026 period" : "Continuous monitoring — Apr–Jun 2025 period",
  };

  const testerLookup: Record<string, string> = {
    "CTL-001": "Reginald Lee", "CTL-002": "Amanda Chen", "CTL-003": "Priya Kapoor",
    "CTL-004": "Jason Park", "CTL-005": "Reginald Lee", "CTL-006": "Amanda Chen",
    "CTL-007": "Natasha Hall", "CTL-008": "Reginald Lee", "CTL-009": "Jason Park",
    "CTL-010": "Priya Kapoor", "CTL-011": "Amanda Chen", "CTL-012": "Natasha Hall",
    "CTL-013": "Reginald Lee", "CTL-014": "Amanda Chen", "CTL-015": "Priya Kapoor",
    "CTL-016": "Jason Park", "CTL-017": "Natasha Hall", "CTL-018": "Reginald Lee",
    "CTL-019": "Amanda Chen", "CTL-020": "Priya Kapoor", "CTL-021": "Jason Park",
    "CTL-022": "Reginald Lee", "CTL-023": "Natasha Hall", "CTL-024": "Amanda Chen",
    "CTL-025": "Priya Kapoor",
  };

  const reviewerLookup: Record<string, string> = {
    "CTL-001": "Michelle Allen", "CTL-002": "Michelle Allen", "CTL-003": "Michelle Allen",
    "CTL-004": "David Okafor", "CTL-005": "Michelle Allen", "CTL-006": "David Okafor",
    "CTL-007": "Michelle Allen", "CTL-008": "David Okafor", "CTL-009": "Michelle Allen",
    "CTL-010": "David Okafor", "CTL-011": "Michelle Allen", "CTL-012": "David Okafor",
    "CTL-013": "Michelle Allen", "CTL-014": "David Okafor", "CTL-015": "Michelle Allen",
    "CTL-016": "David Okafor", "CTL-017": "Michelle Allen", "CTL-018": "David Okafor",
    "CTL-019": "Michelle Allen", "CTL-020": "David Okafor", "CTL-021": "Michelle Allen",
    "CTL-022": "David Okafor", "CTL-023": "Michelle Allen", "CTL-024": "David Okafor",
    "CTL-025": "Michelle Allen",
  };

  const secondaryReviewerLookup: Record<string, string> = {
    "CTL-001": "Natasha Hall", "CTL-002": "Priya Kapoor", "CTL-003": "Natasha Hall",
    "CTL-004": "Amanda Chen", "CTL-005": "Natasha Hall", "CTL-006": "Priya Kapoor",
    "CTL-007": "Amanda Chen", "CTL-008": "Natasha Hall", "CTL-009": "Priya Kapoor",
    "CTL-010": "Natasha Hall", "CTL-011": "Priya Kapoor", "CTL-012": "Amanda Chen",
    "CTL-013": "Natasha Hall", "CTL-014": "Amanda Chen", "CTL-015": "Natasha Hall",
    "CTL-016": "Priya Kapoor", "CTL-017": "Amanda Chen", "CTL-018": "Natasha Hall",
    "CTL-019": "Priya Kapoor", "CTL-020": "Amanda Chen", "CTL-021": "Natasha Hall",
    "CTL-022": "Priya Kapoor", "CTL-023": "Amanda Chen", "CTL-024": "Natasha Hall",
    "CTL-025": "Priya Kapoor",
  };

  const dueDates: Record<TestCycle, string> = {
    walkthrough: "Dec 15, 2025",
    interim: "Mar 31, 2026",
    rollforward: "Jun 30, 2026",
  };

  return {
    tester: testerLookup[controlId] || "Reginald Lee",
    reviewer: reviewerLookup[controlId] || "Michelle Allen",
    pbcRequest: master.dataSource === "manual" ? `PBC-${controlId.replace("CTL-", "")}-${cycle === "interim" ? "INT" : cycle === "rollforward" ? "RF" : "WT"}` : "N/A",
    secondaryReviewer: secondaryReviewerLookup[controlId] || "Natasha Hall",
    sampleSize: `${sampleSizeNum} based on control frequency of ${freq} and risk rating of ${riskLabel}`,
    budgetedHours: "—",
    sampleSelections: periodSelections[freq] || `${sampleSizeNum} items selected for the ${cycle} testing period`,
    dueDate: dueDates[cycle],
  };
}

type ControlAgentComment = {
  id: string;
  stepId: string;
  substepId?: string;
  timestamp: string;
  title: string;
  body: string;
  actions?: { label: string; bold?: boolean }[];
  status?: "info" | "blocked" | "complete" | "warning";
};

const controlAgentComments: Record<string, ControlAgentComment[]> = {
  "CTL-003": [
    {
      id: "cmt-001", stepId: "readiness", substepId: "rd-assess", timestamp: "02:51 pm",
      title: "Input Readiness Assessment",
      body: "Beginning readiness assessment for CTL-003 (Segregation of Duties). Scanning configured inputs and data source connections.\n\n- 3 inputs available\n- 1 input needs review (testing attributes - may be incomplete)\n- 3 inputs missing (population file, sample selections, evidence files)\n\n**Blocked:** Cannot proceed without a population file. The 3-way match discrepancy report from SharePoint is required for the current testing period.\n\nHow would you like to resolve?",
      actions: [
        { label: "Upload", bold: true },
        { label: "Request from control owner", bold: true },
      ],
      status: "blocked",
    },
    {
      id: "cmt-002", stepId: "readiness", substepId: "cs-interpret", timestamp: "02:51 pm",
      title: "Control Description Interpretation",
      body: "Parsed the control narrative for CTL-003. Identified segregation of duties requirements across:\n\n- Order entry vs. approval authority\n- Payment processing vs. reconciliation\n- User provisioning vs. access review\n\nThe procedure references manager approval verification which may require checking both SharePoint signature and SAP workflow confirmation.\n\nWould you like to review and confirm the attributes before I proceed?",
      status: "info",
    },
    {
      id: "cmt-003", stepId: "readiness", substepId: "cs-extract", timestamp: "02:52 pm",
      title: "Attribute Extraction Complete",
      body: "Extracted 4 testable attributes from the control documentation:\n\n1. **Conflicting role combinations** are defined in the SoD matrix (P-114)\n2. **Preventive controls** block conflicting assignments at provisioning\n3. **Detective monitoring** runs on a defined schedule\n4. **Remediation actions** are documented for identified violations\n\nI also found 4 testing attributes, but they may not cover everything in the testing procedure. The procedure references manager approval verification which may require checking both SharePoint signature and SAP workflow confirmation.",
      status: "complete",
    },
    {
      id: "cmt-004", stepId: "readiness", substepId: "cs-plan", timestamp: "02:52 pm",
      title: "Test Plan Generated",
      body: "Composed a structured test plan aligned to the 4 extracted attributes. The plan includes:\n\n- **Step 1:** Obtain SoD conflict matrix (P-114) and validate completeness\n- **Step 2:** Select sample of 25 role assignments across high-risk function pairs\n- **Step 3:** For each sample, verify preventive control enforcement in SAP\n- **Step 4:** Inspect detective monitoring reports for the testing period\n- **Step 5:** Verify remediation documentation for flagged violations\n\nReady for your review and approval.",
      status: "complete",
    },
    {
      id: "cmt-005", stepId: "population", substepId: "pop-ingest", timestamp: "02:53 pm",
      title: "Population File Ingested",
      body: "Loaded the SoD conflict report from SharePoint. File contains 2,847 role assignment records across 5 business units.\n\n- Format: CSV (UTF-8)\n- Columns: 12 fields detected\n- Date range: Jan 2025 – Dec 2025\n- Source: SAP GRC Access Risk Analysis",
      status: "complete",
    },
    {
      id: "cmt-006", stepId: "population", substepId: "pop-validate", timestamp: "02:53 pm",
      title: "Schema Validation Results",
      body: "All 12 columns validated against expected schema. No format inconsistencies detected.\n\n- Required fields: 12/12 present\n- Data types: All consistent\n- Null values: 0 critical fields\n- Encoding: UTF-8 confirmed",
      status: "complete",
    },
    {
      id: "cmt-007", stepId: "population", substepId: "pop-complete", timestamp: "02:54 pm",
      title: "Completeness Check",
      body: "Population coverage verified against the control period and entity scope:\n\n- Control period: Jan – Dec 2025 ✓\n- Entity scope: 5/5 business units ✓\n- Function pairs (P-114): 156/160 defined (97.5%)\n- User population: 3,421 users (including 5 termed)\n- Source systems: SAP, Okta, Coupa — 3/3 connected ✓\n\n4 function pairs are not represented in the population. These may need manual review.",
      status: "warning",
    },
    {
      id: "cmt-008", stepId: "population", substepId: "pop-anomaly", timestamp: "02:54 pm",
      title: "Anomaly Detection Summary",
      body: "Flagged 3 potential anomalies in the population data:\n\n- 3 duplicate role assignment records (auto-excluded)\n- 5 terminated users with active role assignments (flagged for review)\n- 0 date gaps detected\n\nThe 5 terminated user records have been retained in the population for testing as they represent potential SoD violations that occurred during the control period.",
      status: "warning",
    },
    {
      id: "cmt-009", stepId: "sampling", substepId: "smp-method", timestamp: "02:55 pm",
      title: "Sampling Methodology Selected",
      body: "Applied stratified random sampling (MUS) based on risk tier assignment:\n\n- **Tier 1 (Critical):** Payment + Approval conflicts — 40% weight\n- **Tier 2 (High):** Provisioning + Review conflicts — 35% weight\n- **Tier 3 (Medium):** Monitoring + Reporting conflicts — 25% weight\n\nThis approach ensures proportional coverage across the highest-risk function pair categories.",
      status: "complete",
    },
    {
      id: "cmt-010", stepId: "sampling", substepId: "smp-select", timestamp: "02:56 pm",
      title: "Sample Selection Complete",
      body: "25 items selected using stratified random method:\n\n- Tier 1: 10 items selected\n- Tier 2: 9 items selected\n- Tier 3: 6 items selected\n\nRandom seed: 48291 (recorded for reproducibility)\nSelection date: Mar 15, 2026",
      status: "complete",
    },
    {
      id: "cmt-011", stepId: "evidence", substepId: "evd-collect", timestamp: "02:57 pm",
      title: "Evidence Collection Status",
      body: "Collecting evidence for 25 sample items. Progress:\n\n- SAP access logs: 25/25 retrieved ✓\n- Okta provisioning records: 23/25 retrieved\n- Manager approval screenshots: 20/25 located\n- Remediation documentation: 18/25 available\n\n2 Okta records pending — system timeout. Retrying.\n5 approval screenshots not found — may require manual upload.",
      status: "warning",
    },
    {
      id: "cmt-012", stepId: "testing", substepId: "ae-test", timestamp: "02:58 pm",
      title: "Automated Testing In Progress",
      body: "Executing attribute testing across 25 sample items:\n\n- **Attribute 1** (SoD matrix defined): 25/25 passed ✓\n- **Attribute 2** (Preventive controls): 22/25 passed — 3 exceptions identified\n- **Attribute 3** (Detective monitoring): 25/25 passed ✓\n- **Attribute 4** (Remediation documented): 23/25 passed — 2 aligned with Attr 2 exceptions\n\n3 exceptions flagged for detailed review.",
      status: "warning",
    },
    {
      id: "cmt-013", stepId: "testing", substepId: "ae-determine", timestamp: "02:59 pm",
      title: "Exception Analysis",
      body: "3 exceptions identified across the sample:\n\n- **EXC-006:** User in BU-3 had conflicting payment + approval roles active for 45 days without preventive block\n- **EXC-007:** Provisioning request approved by user's direct report (below required approval level)\n- **EXC-008:** SoD violation detected but remediation action not documented within the 30-day SLA\n\nAll 3 exceptions confirmed as control deviations. Generating detailed rationale for each.",
      status: "blocked",
    },
    {
      id: "cmt-014", stepId: "testEffectiveness", substepId: "te-conclude", timestamp: "03:00 pm",
      title: "Control Effectiveness Conclusion",
      body: "**Control Effectiveness: Ineffective**\n\nOverall pass rate: 60% (15/25 attributes passed across sample)\n\nKey findings:\n- 3 unique exceptions across 2 attributes\n- Preventive control failures in BU-3 indicate systemic gap\n- Remediation SLA non-compliance suggests monitoring weakness\n\nRecommendation: Escalate to control owner for remediation plan. Consider expanding sample in Roll Forward testing cycle.",
      status: "blocked",
    },
  ],
};

function getAgentCommentsForControl(controlId: string): ControlAgentComment[] {
  if (controlAgentComments[controlId]) return controlAgentComments[controlId];
  const master = masterControlsList.find(c => c.id === controlId);
  if (!master) return [];
  return [
    {
      id: `${controlId}-auto-001`, stepId: "readiness", timestamp: "—",
      title: "Workflow Initialized",
      body: `Fieldwork agent initialized for ${controlId} — ${master.name}. Awaiting control inputs to begin readiness assessment.`,
      status: "info",
    },
  ];
}

type UtilityPanelTab = "agent" | "comments" | "notes" | "attachments" | "history";

const utilityToolbarItems: { id: UtilityPanelTab | "close"; icon: typeof MessageSquare; label: string }[] = [
  { id: "agent", icon: Bot, label: "Optro Agent" },
  { id: "comments", icon: MessageSquare, label: "Comments" },
  { id: "notes", icon: Pencil, label: "Notes" },
  { id: "attachments", icon: Copy, label: "Attachments" },
  { id: "history", icon: Clock, label: "History" },
];

const stepAgentName: Record<string, { name: string; initials: string }> = {
  readiness: { name: "READINESS AGENT", initials: "RA" },
  population: { name: "POPULATION AGENT", initials: "PA" },
  sampling: { name: "SAMPLING AGENT", initials: "SA" },
  evidence: { name: "EVIDENCE AGENT", initials: "EA" },
  testing: { name: "TESTING AGENT", initials: "TA" },
  testEffectiveness: { name: "EFFECTIVENESS AGENT", initials: "EA" },
};

const stepCompletionComments: Record<string, (controlId: string) => { title: string; body: string }> = {
  readiness: (cid) => ({
    title: "Readiness — Complete",
    body: `Readiness assessment for ${cid} finished.\n\n- Input Readiness Assessment — evaluated data sources and availability\n- Control Description Interpretation — parsed narrative into structured fields\n- Attribute Extraction — identified 4 testable attributes\n- Test Plan Generation — composed step-by-step testing plan\n\nAll readiness substeps completed. Proceeding to Population Acquisition.`,
  }),
  population: (cid) => ({
    title: "Population Acquisition — Complete",
    body: `Population data for ${cid} ingested and validated.\n\n- File Ingestion — loaded 2,847 records from source\n- Schema Validation — 12/12 columns validated\n- Completeness Check — control period and entity coverage verified\n- Anomaly Detection — 3 duplicates excluded, 5 termed users flagged\n\nPopulation confirmed. Proceeding to Sampling.`,
  }),
  sampling: (cid) => ({
    title: "Sampling — Complete",
    body: `Sample selection for ${cid} finalized.\n\n- Methodology Selection — stratified random (MUS) applied\n- Risk Stratification — 3 risk tiers weighted\n- Sample Size Calculation — 25 items at 95% confidence\n- Selection Execution — 25 items selected (seed: 48291)\n\nSample approved. Proceeding to Evidence Collection.`,
  }),
  evidence: (cid) => ({
    title: "Evidence Collection — Complete",
    body: `Evidence for ${cid} collected and processed.\n\n- Requirement Mapping — mapped evidence types per sample item\n- Source Identification — matched to SAP, Okta, and SharePoint\n- Collection & Upload — 25/25 evidence packages assembled\n- Document Classification — categorized by type\n- Field Extraction — key fields extracted from documents\n- Cross-Reference Validation — evidence matched to sample data\n\nEvidence package complete. Proceeding to Testing.`,
  }),
  testing: (cid) => ({
    title: "Attribute Testing — Complete",
    body: `Automated testing for ${cid} executed.\n\n- Execute Attribute Tests — ran 4 attributes across 25 samples\n- Determine Pass/Fail — 3 exceptions identified (EXC-006, EXC-007, EXC-008)\n- Generate Rationale — detailed findings documented per exception\n\n3 exceptions flagged. Proceeding to Effectiveness determination.`,
  }),
  testEffectiveness: (cid) => ({
    title: "Effectiveness Determination — Complete",
    body: `Control effectiveness for ${cid} concluded.\n\n- Aggregate Results — compiled pass/fail across all attributes\n- Completeness Review — verified all samples tested\n- Confidence Assessment — statistical confidence calculated\n- Final Conclusion — **Control rated Ineffective** (60% pass rate)\n\nWorkflow complete. Review the Control Summary report for full details.`,
  }),
};

function ControlUtilityPanel({ controlId, controlStatus, substepProgress, onUploadPopulation, onRequestWorkstream, workstreamActive, onUploadEvidence, onRequestEvidenceWorkstream }: { controlId: string; controlStatus: ControlWorkflowStatus | null; substepProgress: Record<string, number>; onUploadPopulation?: () => void; onRequestWorkstream?: () => void; workstreamActive?: boolean; onUploadEvidence?: () => void; onRequestEvidenceWorkstream?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [activeUtilTab, setActiveUtilTab] = useState<UtilityPanelTab>("agent");
  const [commentFilter, setCommentFilter] = useState<"open" | "closed">("open");
  const [liveComments, setLiveComments] = useState<ControlAgentComment[]>([]);
  const commentedStepsRef = useRef<Set<string>>(new Set());
  const seededStepsRef = useRef<Set<string>>(new Set());
  const hasAutoExpandedRef = useRef(false);

  useEffect(() => {
    if (liveComments.length > 0 && !hasAutoExpandedRef.current) {
      hasAutoExpandedRef.current = true;
    }
  }, [liveComments.length]);

  const workstreamSeededRef = useRef(false);
  useEffect(() => {
    if (workstreamActive && !workstreamSeededRef.current) {
      workstreamSeededRef.current = true;
      const now = new Date();
      const ts = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();
      setLiveComments(prev => [{
        id: `live-workstream-canvas-${Date.now()}`,
        stepId: "population",
        substepId: "pop-ingest",
        timestamp: ts,
        title: "Workstream Request Initiated",
        body: "Initiating automated PBC request via Optro Workstream. The agent is identifying the data owner, composing the request, and dispatching it through the integrated workstream channel.\n\nYou can monitor the request progress in the workflow panel.",
        status: "info",
      }, ...prev]);
    }
  }, [workstreamActive]);

  useEffect(() => {
    if (!controlStatus?.steps) return;
    const now = new Date();
    const ts = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();

    fieldworkStepOrder.forEach(step => {
      const status = controlStatus.steps[step as keyof typeof controlStatus.steps];

      if ((status === "running" || status === "blocked" || status === "waiting") && step === "population" && !seededStepsRef.current.has("population-blocked")) {
        seededStepsRef.current.add("population-blocked");
        setLiveComments(prev => [{
          id: `live-pop-blocked-${Date.now()}`,
          stepId: "population",
          substepId: "pop-ingest",
          timestamp: ts,
          title: "Population Data Required",
          body: "The population file is needed to proceed with testing. The 3-way match discrepancy report from SharePoint is required for the current testing period.\n\nPlease upload the population file or request it from the control owner.",
          status: "blocked",
        }, ...prev]);
      }

      if ((status === "running" || status === "blocked" || status === "waiting") && step === "evidence" && !seededStepsRef.current.has("evidence-blocked")) {
        seededStepsRef.current.add("evidence-blocked");
        setLiveComments(prev => [{
          id: `live-evd-blocked-${Date.now()}`,
          stepId: "evidence",
          substepId: "evd-collect",
          timestamp: ts,
          title: "Evidence Collection Required",
          body: "Evidence files are needed for the 25 sample items. The agent requires access logs, provisioning records, approval screenshots, and remediation documentation.\n\nPlease upload evidence files or request collection via workstream.",
          status: "warning",
        }, ...prev]);
      }

      const info = stepNodeInfo[step];
      const totalSubs = info?.substeps.length ?? 0;
      const prog = substepProgress[step] ?? 0;
      const allSubsDone = prog >= totalSubs && totalSubs > 0;

      if (allSubsDone && !commentedStepsRef.current.has(step)) {
        commentedStepsRef.current.add(step);
        const gen = stepCompletionComments[step];
        if (gen) {
          const { title, body } = gen(controlId);
          setLiveComments(prev => [{
            id: `live-${step}-${Date.now()}`,
            stepId: step,
            timestamp: ts,
            title,
            body,
            status: "info",
          }, ...prev]);
        }
      }
    });
  }, [controlStatus, controlId, substepProgress]);

  const addUploadComment = useCallback(() => {
    const now = new Date();
    const ts = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();
    setLiveComments(prev => [{
      id: `live-upload-${Date.now()}`,
      stepId: "population",
      substepId: "pop-ingest",
      timestamp: ts,
      title: "Population File Uploaded",
      body: `Population data file uploaded for ${controlId}. The agent will now validate the file schema, check completeness against the control period, and scan for anomalies.\n\nProcessing...`,
      status: "info",
    }, ...prev]);
  }, [controlId]);

  const handleUploadClick = useCallback(() => {
    addUploadComment();
    onUploadPopulation?.();
  }, [addUploadComment, onUploadPopulation]);

  const visibleComments = commentFilter === "open" ? liveComments : [];

  return (
    <div className="flex h-full shrink-0">
      <div className="w-10 shrink-0 bg-slate-50 dark:bg-muted/20 border-l border-slate-200 dark:border-border flex flex-col items-center py-2 gap-1">
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-muted/40 transition-colors"
            data-testid="utility-close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {utilityToolbarItems.map(item => {
          const Icon = item.icon;
          const isActive = expanded && activeUtilTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { if (!expanded) { setExpanded(true); setActiveUtilTab(item.id as UtilityPanelTab); } else if (activeUtilTab === item.id) { setExpanded(false); } else { setActiveUtilTab(item.id as UtilityPanelTab); } }}
              className={`relative w-7 h-7 rounded flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-[#266C92]/10 text-[#266C92]"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-muted/40"
              }`}
              title={item.label}
              data-testid={`utility-tab-${item.id}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.id === "agent" && liveComments.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#266C92] text-white text-[8px] font-bold flex items-center justify-center">{liveComments.length > 9 ? "9+" : liveComments.length}</span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => {}}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-muted/40 transition-colors"
          title="Bookmark"
          data-testid="utility-bookmark"
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {}}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-muted/40 transition-colors"
          title="Link"
          data-testid="utility-link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {}}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-muted/40 transition-colors"
          title="Team"
          data-testid="utility-team"
        >
          <Users className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {}}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-muted/40 transition-colors"
          title="Settings"
          data-testid="utility-settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="w-80 border-l border-slate-200 dark:border-border bg-white dark:bg-card flex flex-col overflow-hidden">
          <div className="shrink-0 px-4 py-3 border-b border-slate-200 dark:border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeUtilTab === "agent" && <Bot className="w-3.5 h-3.5 text-[#266C92]" />}
              <h3 className="text-sm font-semibold text-foreground">{activeUtilTab === "agent" ? "Optro Agent" : activeUtilTab.charAt(0).toUpperCase() + activeUtilTab.slice(1)}</h3>
            </div>
          </div>

          {activeUtilTab === "agent" && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto">
                {liveComments.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <Bot className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Agent readouts will appear here as the testing workflow runs</p>
                  </div>
                )}
                {liveComments.map(comment => {
                  const agent = stepAgentName[comment.stepId ?? ""] ?? { name: "OPTRO AGENT", initials: "OA" };
                  return (
                    <div key={comment.id} className="px-4 py-4 border-b border-slate-100 dark:border-border/50 animate-in fade-in slide-in-from-top-2 duration-300" data-testid={`agent-readout-${comment.id}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#266C92] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-white">{agent.initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{agent.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{comment.timestamp}</span>
                          {comment.title && (
                            <p className="text-xs font-semibold text-foreground mt-2">{comment.title}</p>
                          )}
                          <div className="mt-1.5 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                            {comment.body.split(/(\*\*.*?\*\*)/).map((part, i) => {
                              if (part.startsWith("**") && part.endsWith("**")) {
                                return <strong key={i}>{part.slice(2, -2)}</strong>;
                              }
                              return <span key={i}>{part}</span>;
                            })}
                          </div>
                          {comment.stepId === "population" && comment.status === "blocked" && onUploadPopulation && (
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={handleUploadClick}
                                className="text-[10px] font-semibold text-white bg-[#266C92] hover:bg-[#1e5a7a] px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                                data-testid="agent-action-upload"
                              >
                                <Upload className="w-3 h-3" />
                                Upload
                              </button>
                              <button
                                onClick={() => onRequestWorkstream?.()}
                                className="text-[10px] font-medium text-[#266C92] border border-[#266C92]/30 hover:bg-[#266C92]/5 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                                data-testid="agent-action-request"
                              >
                                <Send className="w-3 h-3" />
                                Request via Workstream
                              </button>
                            </div>
                          )}
                          {comment.stepId === "evidence" && (comment.status === "warning" || comment.status === "blocked") && onUploadEvidence && (
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={() => onUploadEvidence?.()}
                                className="text-[10px] font-semibold text-white bg-[#266C92] hover:bg-[#1e5a7a] px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                                data-testid="agent-action-evidence-upload"
                              >
                                <Upload className="w-3 h-3" />
                                Upload
                              </button>
                              <button
                                onClick={() => onRequestEvidenceWorkstream?.()}
                                className="text-[10px] font-medium text-[#266C92] border border-[#266C92]/30 hover:bg-[#266C92]/5 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                                data-testid="agent-action-evidence-request"
                              >
                                <Send className="w-3 h-3" />
                                Request via Workstream
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeUtilTab === "comments" && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="shrink-0 px-4 py-3">
                <div className="border border-slate-200 dark:border-border rounded-lg px-3 py-2">
                  <p className="text-xs text-muted-foreground">Start a conversation here by tagging someone using @name (ex: @Joe).</p>
                </div>
              </div>
              <div className="shrink-0 px-4 pb-2 flex items-center gap-4 border-b border-slate-200 dark:border-border">
                <button
                  onClick={() => setCommentFilter("open")}
                  className={`text-xs font-medium pb-1.5 border-b-2 transition-colors ${commentFilter === "open" ? "border-[#266C92] text-[#266C92]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  data-testid="comments-filter-open"
                >
                  Open Comments
                </button>
                <button
                  onClick={() => setCommentFilter("closed")}
                  className={`text-xs font-medium pb-1.5 border-b-2 transition-colors ${commentFilter === "closed" ? "border-[#266C92] text-[#266C92]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  data-testid="comments-filter-closed"
                >
                  Closed Comments
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="px-4 py-8 text-center">
                  <MessageSquare className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{commentFilter === "open" ? "No comments yet" : "No closed comments"}</p>
                </div>
              </div>
            </div>
          )}

          {activeUtilTab === "notes" && (
            <div className="flex-1 px-4 py-6 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No notes yet</p>
            </div>
          )}
          {activeUtilTab === "attachments" && (
            <div className="flex-1 px-4 py-6 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No attachments</p>
            </div>
          )}
          {activeUtilTab === "history" && (
            <div className="flex-1 px-4 py-6 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No history entries</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type AutomationMode = "full" | "checkpoint" | "manual";

type AutomationConfig = Record<string, { mode: AutomationMode; substeps: Record<string, AutomationMode> }>;

const automationModeLabels: Record<AutomationMode, { label: string; short: string; description: string; color: string; bg: string; mutedIcon: string }> = {
  full: { label: "Full Automation", short: "Auto", description: "Runs automatically, pausing only for missing inputs", color: "text-[#266C92] dark:text-[#4da3c9]", bg: "bg-[#266C92]/10 dark:bg-[#266C92]/15 border-[#266C92]/20 dark:border-[#266C92]/25", mutedIcon: "text-[#266C92]/70" },
  checkpoint: { label: "Checkpoint", short: "Check", description: "Pauses at each boundary for confirmation", color: "text-[#6B7280] dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700", mutedIcon: "text-slate-500/70" },
  manual: { label: "Manual", short: "Manual", description: "Must be explicitly triggered to proceed", color: "text-[#4B5563] dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-800/25 border-slate-200/80 dark:border-slate-700/60", mutedIcon: "text-slate-400/70" },
};

function buildDefaultAutomationConfig(): AutomationConfig {
  const config: AutomationConfig = {};
  for (const step of fieldworkStepOrder) {
    const info = stepNodeInfo[step];
    if (!info) continue;
    const substeps: Record<string, AutomationMode> = {};
    for (const sub of info.substeps) { substeps[sub.id] = "full"; }
    config[step] = { mode: "full", substeps };
  }
  return config;
}

function AutomationModeSelector({ value, onChange, size = "default", scopeId }: { value: AutomationMode; onChange: (m: AutomationMode) => void; size?: "default" | "small"; scopeId?: string }) {
  const modes: AutomationMode[] = ["full", "checkpoint", "manual"];
  const idSuffix = scopeId ? `-${scopeId}` : "";
  return (
    <div className={`inline-flex rounded-md border border-slate-200 dark:border-border overflow-hidden ${size === "small" ? "h-6" : "h-7"}`} data-testid={`automation-mode-selector${idSuffix}`}>
      {modes.map((m) => {
        const info = automationModeLabels[m];
        const active = value === m;
        return (
          <button
            key={m}
            onClick={(e) => { e.stopPropagation(); onChange(m); }}
            className={`${size === "small" ? "px-2 text-[10px]" : "px-2.5 text-[11px]"} font-medium transition-colors whitespace-nowrap ${
              active
                ? `bg-[#266C92]/10 dark:bg-[#266C92]/15 text-[#266C92] dark:text-[#4da3c9] border-r border-[#266C92]/20 dark:border-[#266C92]/25`
                : "bg-white dark:bg-card text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted/40 border-r border-slate-200 dark:border-border"
            } last:border-r-0`}
            data-testid={`automation-mode-${m}${idSuffix}`}
          >
            {size === "small" ? info.short : info.label}
          </button>
        );
      })}
    </div>
  );
}

function AutomationConfigModal({ open, onOpenChange, config, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; config: AutomationConfig; onSave: (config: AutomationConfig) => void }) {
  const [draft, setDraft] = useState<AutomationConfig>(() => JSON.parse(JSON.stringify(config)));
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) { setDraft(JSON.parse(JSON.stringify(config))); setExpandedSteps(new Set()); }
  }, [open, config]);

  const setStepMode = (step: string, mode: AutomationMode) => {
    setDraft(prev => {
      const next = { ...prev };
      const stepCfg = { ...next[step], substeps: { ...next[step].substeps } };
      stepCfg.mode = mode;
      for (const subId of Object.keys(stepCfg.substeps)) { stepCfg.substeps[subId] = mode; }
      next[step] = stepCfg;
      return next;
    });
  };

  const setSubstepMode = (step: string, subId: string, mode: AutomationMode) => {
    setDraft(prev => {
      const next = { ...prev };
      const stepCfg = { ...next[step], substeps: { ...next[step].substeps } };
      stepCfg.substeps[subId] = mode;
      const subModes = Object.values(stepCfg.substeps);
      if (subModes.every(m => m === subModes[0])) { stepCfg.mode = subModes[0]; }
      else { stepCfg.mode = "checkpoint"; }
      next[step] = stepCfg;
      return next;
    });
  };

  const setAllMode = (mode: AutomationMode) => {
    const next: AutomationConfig = {};
    for (const step of fieldworkStepOrder) {
      const info = stepNodeInfo[step];
      if (!info) continue;
      const substeps: Record<string, AutomationMode> = {};
      for (const sub of info.substeps) { substeps[sub.id] = mode; }
      next[step] = { mode, substeps };
    }
    setDraft(next);
  };

  const toggleExpand = (step: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step); else next.add(step);
      return next;
    });
  };

  const globalMode: AutomationMode | "mixed" = (() => {
    const stepModes = fieldworkStepOrder.map(s => draft[s]?.mode).filter(Boolean);
    if (stepModes.every(m => m === "full")) return "full";
    if (stepModes.every(m => m === "checkpoint")) return "checkpoint";
    if (stepModes.every(m => m === "manual")) return "manual";
    return "mixed";
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" data-testid="automation-config-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4 text-[#266C92]" />
            Workflow Automation Configuration
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure the degree of automation for each step and substep of the testing workflow.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-muted/30 border border-slate-200 dark:border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Global Automation Level</span>
                  {globalMode === "mixed" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#266C92]/10 dark:bg-[#266C92]/15 text-[#266C92] dark:text-[#4da3c9] font-medium">Mixed</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Apply to all steps and substeps</p>
              </div>
              <AutomationModeSelector
                value={globalMode === "mixed" ? "full" : globalMode}
                onChange={setAllMode}
                scopeId="global"
              />
            </div>

            <div className="space-y-1">
              {fieldworkStepOrder.map((step, stepIdx) => {
                const info = stepNodeInfo[step];
                if (!info) return null;
                const stepCfg = draft[step];
                if (!stepCfg) return null;
                const isExpanded = expandedSteps.has(step);
                const StepIcon = info.substeps[0]?.icon ?? FileCheck;
                const hasSubOverrides = Object.values(stepCfg.substeps).some(m => m !== stepCfg.mode);

                return (
                  <div key={step} className="border border-slate-200 dark:border-border rounded-lg overflow-hidden" data-testid={`automation-step-${step}`}>
                    <div
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-muted/20 transition-colors cursor-pointer"
                      data-testid={`automation-step-toggle-${step}`}
                    >
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-[#266C92]/10 text-[#266C92] shrink-0" onClick={() => toggleExpand(step)}>
                        <span className="text-[10px] font-bold">{stepIdx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(step)}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{info.nodeLabel}</span>
                          <span className="text-[10px] text-muted-foreground">{info.substeps.length} substeps</span>
                          {hasSubOverrides && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#266C92]/10 dark:bg-[#266C92]/15 text-[#266C92] dark:text-[#4da3c9] font-medium">Mixed</span>
                          )}
                        </div>
                      </div>
                      <AutomationModeSelector
                        value={stepCfg.mode}
                        onChange={(m) => setStepMode(step, m)}
                        size="small"
                        scopeId={step}
                      />
                      <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform cursor-pointer ${isExpanded ? "rotate-180" : ""}`} onClick={() => toggleExpand(step)} />
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-border/50 bg-slate-50/50 dark:bg-muted/10">
                        {info.substeps.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <div
                              key={sub.id}
                              className="flex items-center gap-3 px-3 py-2 pl-10 border-b border-slate-100 dark:border-border/30 last:border-b-0"
                              data-testid={`automation-substep-${sub.id}`}
                            >
                              <SubIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground">{sub.label}</div>
                                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{sub.description}</div>
                              </div>
                              <AutomationModeSelector
                                value={stepCfg.substeps[sub.id] ?? "full"}
                                onChange={(m) => setSubstepMode(step, sub.id, m)}
                                size="small"
                                scopeId={sub.id}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {(["full", "checkpoint", "manual"] as AutomationMode[]).map((m) => {
                const info = automationModeLabels[m];
                const MIcon = automationModeIcons[m].icon;
                return (
                  <div key={m} className="p-2.5 rounded-lg border border-slate-200/80 dark:border-border bg-slate-50/50 dark:bg-muted/15" data-testid={`automation-mode-info-${m}`}>
                    <div className="flex items-center gap-1.5">
                      <MIcon className={`w-3 h-3 ${info.mutedIcon}`} />
                      <div className="text-xs font-semibold text-foreground">{info.label}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{info.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} data-testid="button-cancel-automation">
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#266C92] hover:bg-[#1e5a7a] text-white"
            onClick={() => { onSave(draft); onOpenChange(false); }}
            data-testid="button-save-automation"
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ControlFocusPageProps = {
  controlId: string;
  controlStatus: ControlWorkflowStatus | null;
  onBack: () => void;
  backLabel?: string;
  onResolve?: (controlId: string) => void;
  isResolved?: boolean;
  onAdvanceStep?: (currentStep: string) => void;
  onStartWorkflow?: () => void;
  onViewReport?: () => void;
};

function WorkpaperContent({ controlId }: { controlId: string }) {
  const wpSections = [
    {
      title: "1. Control Overview",
      rows: [
        ["Control ID", controlId],
        ["Control Name", "Segregation of Duties"],
        ["Category", "IT General Controls"],
        ["Risk Level", "Critical"],
        ["Control Owner", "Sarah Chen"],
        ["PBC Owner", "David Kim"],
        ["Test Period", "FY2025 Interim (Jan–Jun 2025)"],
        ["Test Approach", "Automated Control Testing — Full Population + Statistical Sample"],
      ],
    },
    {
      title: "2. Readiness Assessment",
      rows: [
        ["Objective", "Ensure SoD conflict matrix is maintained, conflicts are detected and remediated timely, and periodic reviews are performed"],
        ["Risk Classification", "High / Preventive"],
        ["Test Plan", "5 attributes tested across risk-weighted sample of 25 conflict instances"],
        ["Data Sources", "SoD_Matrix_2025.xlsx, UserAccess_Dec2025.csv, RoleChangeLog_2025.csv, Q1–Q3 SoD Review Packages, RiskAcceptance forms"],
      ],
    },
    {
      title: "3. Population & Sampling",
      rows: [
        ["Population Source", "SoD conflict matrix — 156 defined conflict pairs across 12 business processes"],
        ["Active Conflicts Identified", "Identified conflicts across 3,421 users via role-permission cross-reference"],
        ["Sampling Method", "Risk-weighted stratified random (MUS) — 95% confidence, 5% tolerable deviation"],
        ["Sample Size", "25 conflict instances across 5 strata (Financial Close+AP: 8, AP+AR: 6, IT Admin: 6, Operational: 3, Master Data: 2)"],
        ["Key Samples", "S01 AP-Create×AP-Approve, S02 GL-Post×GL-Review, S03 AR-Invoice×AR-Receipt, S04 UserAdmin×FinApprove, S05 VendorMaster×AP-Create, ... S25"],
      ],
    },
    {
      title: "4. Evidence Collection",
      rows: [
        ["Documents Collected", "68 documents across 6 evidence categories"],
        ["Access Snapshots", "25/25 user access listing snapshots — UserAccess_Dec2025.csv (3,421 records)"],
        ["Role Change Logs", "25/25 role assignment change logs — RoleChangeLog_2025.csv (892 changes)"],
        ["Conflict Resolution Docs", "12/25 resolution documentation received (48% coverage)"],
        ["Quarterly Reviews", "Q1–Q3 SoD Review Packages received (Q4 pending)"],
        ["Risk Acceptance Forms", "3 risk acceptance forms — RiskAcceptance_RF-2025-001.pdf, RF-2025-002.pdf, RF-2025-003.pdf"],
        ["Change Management", "S01, S04 — ServiceNow tickets pending"],
      ],
    },
    {
      title: "5. Attribute Testing Results",
      rows: [
        ["A1: SoD Matrix Completeness", "Pass with exceptions — 156/160 function pairs defined; 4 Treasury×IT Admin pairs missing; Workday HR not in scope"],
        ["A2: Conflict Identification", "22/25 Pass (88%) — 3 failures: S03 no resolution on file, S14 detection date mismatch, S21 orphaned role not detected"],
        ["A3: Remediation Timeliness", "19/25 Pass (76%) — 6 exceeded 5-day SLA (S01: 16d, S08: 8d, S09: 12d, S14: unknown, S17: 9d, S22: 7d)"],
        ["A4: Quarterly Review Sign-off", "Q1–Q3 Pass, Q4 evidence not received — 75% coverage"],
        ["A5: Exception Approval", "3/3 Pass (100%) — All risk acceptance forms documented with compensating controls"],
      ],
    },
    {
      title: "6. Exceptions Identified",
      rows: [
        ["EXC-A", "SoD matrix incomplete — 4 function pairs and 1 system (Workday HR) missing from scope (A1)"],
        ["EXC-B", "Remediation SLA exceeded in 24% of cases (6/25) — avg 7.3 days overrun; Finance dept pattern (A3)"],
        ["EXC-C", "Q4 quarterly review not performed or evidence not provided (A4)"],
        ["EXC-D", "S21 PayrollRun×PayrollApprove — Orphaned role R-LEGACY excluded from scan rule set; conflict undetected (A2)"],
        ["Management Response", "Pending — Escalated to control owner for remediation plan"],
      ],
    },
    {
      title: "7. Conclusion",
      rows: [
        ["Overall Effectiveness", "Ineffective"],
        ["Confidence Level", "Medium-High — 84% evidence collected; Q4 review and 13 resolution docs outstanding"],
        ["Basis", "3 of 5 attributes failed threshold; remediation timeliness (A3) is a systemic gap across Finance department"],
        ["Overall Pass Rate", "40% (2/5 attributes passed); Individual sample pass rate: 76% (19/25)"],
        ["Recommendation", "Strengthen remediation tracking with automated SLA monitoring; update conflict matrix for system coverage; resolve orphaned roles"],
        ["Preparer", "Optro Agent — Automated Control Testing"],
        ["Review Status", "Pending Senior Review"],
      ],
    },
  ];

  return (
    <>
      {wpSections.map((section, sIdx) => (
        <div key={sIdx}>
          <h3 className="text-xs font-semibold text-foreground mb-2">{section.title}</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {section.rows.map(([label, value], rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/30" : "bg-white dark:bg-card"}>
                    <td className="px-3 py-2 font-medium text-muted-foreground w-[180px] align-top border-r border-slate-100 dark:border-slate-800">{label}</td>
                    <td className="px-3 py-2 text-foreground">{renderDocLinks(value ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

function OutputsStepContent({ controlId }: { controlId: string }) {
  const [workpaperCollapsed, setWorkpaperCollapsed] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);

  const summaryData = {
    overall: "Ineffective",
    passRate: "40%",
    samplePassRate: "76%",
    confidence: "Medium-High",
    attributes: [
      { name: "SoD Matrix Completeness", result: "Pass*", color: "text-amber-600" },
      { name: "Conflict Identification", result: "88% Pass", color: "text-red-500" },
      { name: "Remediation Timeliness", result: "76% Pass", color: "text-red-500" },
      { name: "Quarterly Review Sign-off", result: "75%", color: "text-amber-600" },
      { name: "Exception Approval", result: "100% Pass", color: "text-emerald-600" },
    ],
    exceptions: 4,
    samplesTestedCount: 25,
  };

  return (
    <div data-testid="control-step-block-outputs" className="space-y-4">
      <div className="border border-slate-200 dark:border-border rounded-xl bg-white dark:bg-card overflow-hidden">
        <button
          onClick={() => setWorkpaperCollapsed(prev => !prev)}
          className="w-full flex items-center justify-between px-5 py-3 bg-slate-50/80 dark:bg-muted/20 border-b border-slate-200 dark:border-border hover:bg-slate-100/80 dark:hover:bg-muted/30 transition-colors"
          data-testid="toggle-workpaper-collapse"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#266C92]" />
            <span className="text-sm font-semibold text-foreground">Workpaper — CTL-003 Automated Control Testing</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              onClick={(e) => { e.stopPropagation(); }}
              className="inline-flex"
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                data-testid="button-export-workpaper"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
            </span>
            {workpaperCollapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>
        {!workpaperCollapsed && (
          <div className="p-5">
            <WorkpaperContent controlId={controlId} />
          </div>
        )}
      </div>

      {summaryVisible && (
        <div className="border border-slate-200 dark:border-border rounded-xl bg-white dark:bg-card overflow-hidden" data-testid="summary-artifact">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 dark:bg-muted/20 border-b border-slate-200 dark:border-border">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-[#266C92]" />
              <span className="text-sm font-semibold text-foreground">Control Testing Summary</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-[#266C92]/30 text-[#266C92]">Dashboard</Badge>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="border rounded-lg p-3 text-center bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30">
                <p className="text-[10px] text-muted-foreground mb-1">Overall Effectiveness</p>
                <p className="text-sm font-bold text-red-600">{summaryData.overall}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Attribute Pass Rate</p>
                <p className="text-sm font-bold text-foreground">{summaryData.passRate}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Sample Pass Rate</p>
                <p className="text-sm font-bold text-foreground">{summaryData.samplePassRate}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Confidence</p>
                <p className="text-sm font-bold text-foreground">{summaryData.confidence}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Attribute Results</h4>
              <div className="space-y-1.5">
                {summaryData.attributes.map((attr, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-muted/20">
                    <span className="text-xs text-foreground">{attr.name}</span>
                    <span className={`text-xs font-semibold ${attr.color}`}>{attr.result}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs text-amber-700 dark:text-amber-400">{summaryData.exceptions} exceptions identified</span>
              </div>
              <span className="text-xs text-muted-foreground">{summaryData.samplesTestedCount} samples tested</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end">
        <DropdownMenu open={createDropdownOpen} onOpenChange={setCreateDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              data-testid="button-create-artifact"
            >
              <Plus className="w-3.5 h-3.5" />
              Create
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setSummaryVisible(true)}
              className="text-xs gap-2"
              data-testid="create-summary-artifact"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Summary Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" data-testid="create-exception-report">
              <AlertTriangle className="w-3.5 h-3.5" />
              Exception Report
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" data-testid="create-testing-matrix">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Testing Matrix
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" data-testid="create-executive-memo">
              <FileText className="w-3.5 h-3.5" />
              Executive Memo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ControlFocusPage({ controlId, controlStatus, onBack, backLabel, onResolve, isResolved, onAdvanceStep, onStartWorkflow, onViewReport }: ControlFocusPageProps) {
  const master = masterControlsList.find(c => c.id === controlId);
  const exceptionControlIds = new Set(fieldworkExceptions.map(e => e.controlId));
  const exceptions = fieldworkExceptions.filter(e => e.controlId === controlId);
  const hasException = exceptionControlIds.has(controlId);
  const isComplete = controlStatus?.steps.testEffectiveness === "complete";
  const isEffective = isComplete && !hasException;
  const isIneffective = isComplete && hasException;
  const blockRule = fieldworkBlockRules.find(r => r.controlId === controlId) ?? null;
  const isDemo = controlId === DEMO_CONTROL_ID;
  const [activeTab, setActiveTab] = useState<ControlFocusTab>("details");
  const [activeTestCycle, setActiveTestCycle] = useState<TestCycle>("interim");
  const [testDetailsOpen, setTestDetailsOpen] = useState(false);
  const [testCycleDropdownOpen, setTestCycleDropdownOpen] = useState(false);
  const storedAutomationConfigs = useWorkflowSessionStore((s) => s.runtimeStates["control-testing"]?.blockStates?.["fieldwork-execution"]?.automationConfigs as Record<string, AutomationConfig> | undefined) ?? {};
  const automationConfig = storedAutomationConfigs[controlId] ?? buildDefaultAutomationConfig();
  const setAutomationConfig = useCallback((cfg: AutomationConfig) => {
    const store = useWorkflowSessionStore.getState();
    const existing = (store.runtimeStates["control-testing"]?.blockStates?.["fieldwork-execution"]?.automationConfigs as Record<string, AutomationConfig> | undefined) ?? {};
    store.setBlockState("control-testing", "fieldwork-execution", "automationConfigs", { ...existing, [controlId]: cfg });
  }, [controlId]);
  const [automationModalOpen, setAutomationModalOpen] = useState(false);
  const cycleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cycleDropdownRef.current && !cycleDropdownRef.current.contains(e.target as Node)) {
        setTestCycleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  const initialStepIndex = useMemo(() => {
    if (!controlStatus) return 0;
    for (let i = 0; i < fieldworkStepOrder.length; i++) {
      const s = controlStatus.steps[fieldworkStepOrder[i] as keyof typeof controlStatus.steps];
      if (s !== "complete") return i;
    }
    return fieldworkStepOrder.length - 1;
  }, []);

  const [activeStepIdx, setActiveStepIdx] = useState(initialStepIndex);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoExpandedSubs, setAutoExpandedSubs] = useState<Set<string>>(() => new Set());
  const [checkpointAcked, setCheckpointAcked] = useState<Set<string>>(() => new Set());
  const [manualTriggered, setManualTriggered] = useState<Set<string>>(() => new Set());
  const [workstreamActive, setWorkstreamActive] = useState(false);
  const [evidenceWorkstreamActive, setEvidenceWorkstreamActive] = useState(false);
  const [completedTrackerSubs, setCompletedTrackerSubs] = useState<Set<string>>(() => new Set());
  const [workflowPaused, setWorkflowPaused] = useState(false);
  const outputsGenerated = useWorkflowSessionStore(s => !!(s.runtimeStates["control-testing"]?.blockStates?.["fieldwork-execution"]?.outputsGenerated as Record<string, boolean> | undefined)?.[controlId]);
  const setOutputsGenerated = useCallback((val: boolean) => {
    const store = useWorkflowSessionStore.getState();
    const existing = (store.runtimeStates["control-testing"]?.blockStates?.["fieldwork-execution"]?.outputsGenerated as Record<string, boolean> | undefined) ?? {};
    store.setBlockState("control-testing", "fieldwork-execution", "outputsGenerated", { ...existing, [controlId]: val });
  }, [controlId]);

  const assistantMirrorSeeded = useRef<Set<string>>(new Set());
  const assistantMirrorCompleted = useRef<Set<string>>(new Set());
  const assistantWorkstreamMirrored = useRef(false);

  const mirrorToAssistant = useCallback((title: string, body: string, agentStep?: string, actions?: { label: string; actionId: string; variant?: "primary" | "outline" }[]) => {
    const agentInfo = agentStep ? stepAgentName[agentStep] : undefined;
    const label = agentInfo ? agentInfo.name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : undefined;
    useHomeAssistantStore.getState().addMessage({
      id: `mirror-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: "assistant",
      content: `**${title}**\n\n${body}`,
      timestamp: new Date().toISOString(),
      agentLabel: label,
      actions,
    });
  }, []);

  const handleAckCheckpoint = useCallback((substepId: string) => {
    setCheckpointAcked(prev => new Set(prev).add(substepId));
  }, []);

  const handleResumeSubstep = useCallback((substepId: string) => {
    setManualTriggered(prev => new Set(prev).add(substepId));
  }, []);

  const initSubstepProgress = useMemo(() => {
    const prog: Record<string, number> = {};
    const br = fieldworkBlockRules.find(r => r.controlId === controlId);
    fieldworkStepOrder.forEach(step => {
      if (!controlStatus) { prog[step] = 0; return; }
      const status = controlStatus.steps[step as keyof typeof controlStatus.steps];
      const info = stepNodeInfo[step];
      if (status === "complete") {
        prog[step] = info?.substeps.length ?? 0;
      } else if (status === "blocked" && br && br.blockAtStep === step && br.blockAtSubstep && info) {
        const blockedIdx = info.substeps.findIndex(s => s.id === br.blockAtSubstep);
        prog[step] = blockedIdx >= 0 ? blockedIdx : 0;
      } else {
        prog[step] = 0;
      }
    });
    return prog;
  }, []);
  const [substepProgress, setSubstepProgress] = useState<Record<string, number>>(initSubstepProgress);

  useEffect(() => {
    if (!controlStatus?.steps) return;

    fieldworkStepOrder.forEach(step => {
      const status = controlStatus.steps[step as keyof typeof controlStatus.steps];

      if ((status === "running" || status === "blocked" || status === "waiting") && step === "population" && !assistantMirrorSeeded.current.has("population-blocked")) {
        assistantMirrorSeeded.current.add("population-blocked");
        mirrorToAssistant(
          "Population Data Required",
          "The population file is needed to proceed with testing. The 3-way match discrepancy report from SharePoint is required for the current testing period.\n\nPlease upload the population file or request it from the control owner.",
          "population",
          [
            { label: "Upload", actionId: "pop-upload", variant: "primary" },
            { label: "Request via Workstream", actionId: "pop-request", variant: "outline" },
          ]
        );
      }

      if ((status === "running" || status === "blocked" || status === "waiting") && step === "evidence" && !assistantMirrorSeeded.current.has("evidence-blocked")) {
        assistantMirrorSeeded.current.add("evidence-blocked");
        mirrorToAssistant(
          "Evidence Collection Required",
          "Evidence files are needed for the 25 sample items. The agent requires access logs, provisioning records, approval screenshots, and remediation documentation.\n\nPlease upload evidence files or request collection via workstream.",
          "evidence",
          [
            { label: "Upload", actionId: "evd-upload", variant: "primary" },
            { label: "Request via Workstream", actionId: "evd-request", variant: "outline" },
          ]
        );
      }

      const info = stepNodeInfo[step];
      const totalSubs = info?.substeps.length ?? 0;
      const prog = substepProgress[step] ?? 0;
      const allSubsDone = prog >= totalSubs && totalSubs > 0;

      if (allSubsDone && !assistantMirrorCompleted.current.has(step)) {
        assistantMirrorCompleted.current.add(step);
        const gen = stepCompletionComments[step];
        if (gen) {
          const { title, body } = gen(controlId);
          mirrorToAssistant(title, body, step);
        }
      }
    });
  }, [controlStatus, controlId, substepProgress, mirrorToAssistant]);

  useEffect(() => {
    if (workstreamActive && !assistantWorkstreamMirrored.current) {
      assistantWorkstreamMirrored.current = true;
      mirrorToAssistant(
        "Workstream Request Initiated",
        "Initiating automated PBC request via Optro Workstream. The agent is identifying the data owner, composing the request, and dispatching it through the integrated workstream channel.\n\nYou can monitor the request progress in the workflow panel.",
        "population"
      );
    }
  }, [workstreamActive, mirrorToAssistant]);

  const assistantEvdWorkstreamMirrored = useRef(false);
  useEffect(() => {
    if (evidenceWorkstreamActive && !assistantEvdWorkstreamMirrored.current) {
      assistantEvdWorkstreamMirrored.current = true;
      mirrorToAssistant(
        "Evidence Workstream Request Initiated",
        "Initiating automated evidence collection via Optro Workstream. The agent is connecting to source systems, pulling documents, and assembling evidence packages for the 25 sample items.\n\nYou can monitor the request progress in the workflow panel.",
        "evidence"
      );
    }
  }, [evidenceWorkstreamActive, mirrorToAssistant]);

  const visibleStepOrder = useMemo(() =>
    outputsGenerated ? [...fieldworkStepOrder, "outputs"] : [...fieldworkStepOrder],
    [outputsGenerated]
  );

  const activeStep = visibleStepOrder[activeStepIdx];

  useEffect(() => {
    if (!isDemo || !controlStatus || workflowPaused) return;
    const step = activeStep;
    const stepStatus = controlStatus.steps[step as keyof typeof controlStatus.steps];
    if (stepStatus !== "running") return;

    const behavior = demoStepBehavior[step];
    if (!behavior?.autoProgress) return;

    const currentProg = substepProgress[step] ?? 0;
    const info = stepNodeInfo[step];
    const totalSubs = info?.substeps.length ?? 0;

    if (currentProg >= totalSubs) return;
    if (behavior.pauseAtSubstep !== undefined && currentProg === behavior.pauseAtSubstep) return;

    const stepCfg = automationConfig?.[step];
    const currentSub = info?.substeps[currentProg];
    const subMode: AutomationMode = (currentSub && stepCfg?.substeps?.[currentSub.id]) ?? stepCfg?.mode ?? "full";

    if (subMode === "manual" && !manualTriggered.has(currentSub?.id ?? "")) return;

    if (subMode === "checkpoint" && currentProg > 0) {
      const prevSub = info?.substeps[currentProg - 1];
      if (prevSub && !checkpointAcked.has(prevSub.id)) return;
    }

    const stepKey = step;
    const timer = setTimeout(() => {
      setSubstepProgress(prev => {
        const cur = prev[stepKey] ?? 0;
        return cur >= totalSubs ? prev : { ...prev, [stepKey]: cur + 1 };
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [isDemo, activeStep, controlStatus, substepProgress, automationConfig, manualTriggered, checkpointAcked, workflowPaused]);

  const stepLabels: Record<string, string> = {
    readiness: "Readiness",
    population: "Population Acquisition",
    sampling: "Sampling",
    evidence: "Evidence",
    testing: "Testing",
    testEffectiveness: "Test Effectiveness",
    outputs: "Outputs",
  };

  const stepShortLabels: Record<string, string> = {
    readiness: "Readiness",
    population: "Population",
    sampling: "Sampling",
    evidence: "Evidence",
    testing: "Testing",
    testEffectiveness: "Effectiveness",
    outputs: "Outputs",
  };

  const stepDescriptions: Record<string, string> = {
    readiness: stepNodeInfo.readiness.aiDescription,
    population: stepNodeInfo.population.aiDescription,
    sampling: stepNodeInfo.sampling.aiDescription,
    evidence: stepNodeInfo.evidence.aiDescription,
    testing: stepNodeInfo.testing.aiDescription,
    testEffectiveness: stepNodeInfo.testEffectiveness.aiDescription,
    outputs: "Generated workpaper summarizing the full automated control testing workflow, findings, and conclusions.",
  };

  const handleSubstepAction = useCallback((substepId: string, action: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (substepId === "pop-ingest" && action === "upload") {
      setWorkstreamActive(false);
      setSubstepProgress(prev => ({ ...prev, population: (prev.population ?? 0) + 1 }));
      setAutoExpandedSubs(prev => new Set(prev).add("pop-ingest"));
      setTimeout(() => {
        setAutoExpandedSubs(prev => { const n = new Set(prev); n.delete("pop-ingest"); return n; });
      }, 2500);
      setActionToast("Population data uploaded — validating...");
      mirrorToAssistant(
        "Population File Uploaded",
        `Population data file uploaded for ${controlId}. The agent will now validate the file schema, check completeness against the control period, and scan for anomalies.\n\nProcessing...`,
        "population"
      );
      if (onResolve) onResolve(controlId);
    } else if (substepId === "pop-ingest" && action === "request") {
      setWorkstreamActive(true);
      setAutoExpandedSubs(prev => new Set(prev).add("pop-ingest"));
      setActionToast("Initiating workstream request...");
    } else if (substepId === "pop-ingest" && action === "workstream-complete") {
      setWorkstreamActive(false);
      setCompletedTrackerSubs(prev => new Set(prev).add("pop-ingest"));
      setSubstepProgress(prev => ({ ...prev, population: (prev.population ?? 0) + 1 }));
      setAutoExpandedSubs(prev => new Set(prev).add("pop-ingest"));
      setTimeout(() => {
        setAutoExpandedSubs(prev => { const n = new Set(prev); n.delete("pop-ingest"); return n; });
      }, 2500);
      setActionToast("Population data received via workstream — validating...");
    } else if (substepId === "evd-collect" && action === "upload") {
      setEvidenceWorkstreamActive(false);
      setSubstepProgress(prev => ({ ...prev, evidence: (prev.evidence ?? 0) + 1 }));
      setAutoExpandedSubs(prev => new Set(prev).add("evd-collect"));
      setTimeout(() => {
        setAutoExpandedSubs(prev => { const n = new Set(prev); n.delete("evd-collect"); return n; });
      }, 2500);
      setActionToast("Evidence files uploaded — classifying...");
      mirrorToAssistant(
        "Evidence Files Uploaded",
        `Evidence package uploaded for ${controlId}. The agent will now classify documents, extract key fields, and cross-reference against the sample data.\n\nProcessing...`,
        "evidence"
      );
      if (onResolve) onResolve(controlId);
    } else if (substepId === "evd-collect" && action === "request") {
      setEvidenceWorkstreamActive(true);
      setAutoExpandedSubs(prev => new Set(prev).add("evd-collect"));
      setActionToast("Initiating evidence workstream request...");
    } else if (substepId === "evd-collect" && action === "workstream-complete") {
      setEvidenceWorkstreamActive(false);
      setCompletedTrackerSubs(prev => new Set(prev).add("evd-collect"));
      setSubstepProgress(prev => ({ ...prev, evidence: (prev.evidence ?? 0) + 1 }));
      setAutoExpandedSubs(prev => new Set(prev).add("evd-collect"));
      setTimeout(() => {
        setAutoExpandedSubs(prev => { const n = new Set(prev); n.delete("evd-collect"); return n; });
      }, 2500);
      setActionToast("Evidence collected via workstream — classifying...");
    } else if (substepId === "evd-collect" && action === "tracker-complete") {
      setCompletedTrackerSubs(prev => new Set(prev).add("evd-collect"));
      setSubstepProgress(prev => ({ ...prev, evidence: (prev.evidence ?? 0) + 1 }));
      setAutoExpandedSubs(prev => new Set(prev).add("evd-collect"));
      setTimeout(() => {
        setAutoExpandedSubs(prev => { const n = new Set(prev); n.delete("evd-collect"); return n; });
      }, 2500);
      setActionToast("Evidence collection complete — ready for confirmation");
    }
    toastTimerRef.current = setTimeout(() => setActionToast(null), 3000);
  }, [mirrorToAssistant, controlId, onResolve]);

  const assistantActionHandler = useCallback((actionId: string) => {
    if (actionId === "pop-upload") handleSubstepAction("pop-ingest", "upload");
    else if (actionId === "pop-request") handleSubstepAction("pop-ingest", "request");
    else if (actionId === "evd-upload") handleSubstepAction("evd-collect", "upload");
    else if (actionId === "evd-request") handleSubstepAction("evd-collect", "request");
  }, [handleSubstepAction]);

  useEffect(() => {
    useHomeAssistantStore.getState().setOnMessageAction(assistantActionHandler);
    return () => { useHomeAssistantStore.getState().setOnMessageAction(null); };
  }, [assistantActionHandler]);

  const handleStepAction = useCallback((stepKey: string, actionId: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    if (isDemo && onAdvanceStep) {
      const currentStepStatus = controlStatus?.steps[stepKey as keyof typeof controlStatus.steps];
      if (currentStepStatus === "complete") return;

      if (actionId === "confirm-step") {
        const info = stepNodeInfo[stepKey];
        const totalSubs = info?.substeps.length ?? 0;
        setSubstepProgress(prev => ({ ...prev, [stepKey]: totalSubs }));
        onAdvanceStep(stepKey);
        const stepIdx = fieldworkStepOrder.indexOf(stepKey);
        if (stepIdx < fieldworkStepOrder.length - 1) {
          setActiveStepIdx(stepIdx + 1);
        }
        const nextLabel = stepIdx < fieldworkStepOrder.length - 1
          ? stepLabels[fieldworkStepOrder[stepIdx + 1]] ?? fieldworkStepOrder[stepIdx + 1]
          : null;
        setActionToast(nextLabel ? `Step confirmed — advancing to ${nextLabel}` : "All steps complete");
      }
    } else {
      setActionToast(`${actionId} triggered for ${stepKey}`);
    }
    toastTimerRef.current = setTimeout(() => setActionToast(null), 3000);
  }, [isDemo, onAdvanceStep, controlStatus, substepProgress]);

  const activeStepStatus = activeStep === "outputs" ? "complete" : controlStatus ? controlStatus.steps[activeStep as keyof typeof controlStatus.steps] : "pending";
  const activeStepInfo = stepNodeInfo[activeStep] ?? null;
  const activeVisibleActions = activeStepInfo ? activeStepInfo.actions.filter(a => a.showWhen.includes(activeStepStatus)) : [];

  const canNavigateTo = (idx: number): boolean => {
    if (!controlStatus) return false;
    const step = visibleStepOrder[idx];
    if (step === "outputs") return outputsGenerated;
    const status = controlStatus.steps[step as keyof typeof controlStatus.steps];
    if (status === "complete") return true;
    if (status === "running" || status === "waiting" || status === "blocked") return true;
    const prevIdx = idx - 1;
    if (prevIdx >= 0) {
      const prevStep = visibleStepOrder[prevIdx];
      if (prevStep === "outputs") return outputsGenerated;
      const prevStatus = controlStatus.steps[prevStep as keyof typeof controlStatus.steps];
      if (prevStatus === "complete") return true;
    }
    return idx === 0;
  };

  return (
    <div className="relative flex h-full overflow-hidden bg-white dark:bg-background" data-testid={`control-focus-${controlId}`}>
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="shrink-0 h-12 px-4 flex items-center gap-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-control-focus-back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{backLabel || "Overview"}</span>
        </button>
        <div className="w-px h-5 bg-slate-200 dark:bg-border" />
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#266C92]" />
          <h2 className="text-sm font-semibold text-foreground">{controlId}</h2>
          <span className="text-sm text-muted-foreground">—</span>
          <span className="text-sm text-foreground">{master?.name ?? controlId}</span>
        </div>
        {isEffective && <Badge className="ml-auto text-[10px] bg-[#266C92]/10 text-[#266C92] border-0">Effective</Badge>}
        {isIneffective && <Badge className="ml-auto text-[10px] bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-0">Ineffective</Badge>}
      </div>

      <div className="shrink-0 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
        <div className="px-6 flex items-center gap-6">
          {(["details", "testing", "issues", "automations"] as ControlFocusTab[]).map(tab => {
            if (tab === "testing") {
              const selectedCycle = testCycles.find(c => c.id === activeTestCycle)!;
              return (
                <div key={tab} className="relative" ref={cycleDropdownRef}>
                  <button
                    onClick={() => { if (activeTab !== "testing") { setActiveTab("testing"); setTestCycleDropdownOpen(false); } else { setTestCycleDropdownOpen(!testCycleDropdownOpen); } }}
                    className={`py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "testing"
                        ? "border-[#266C92] text-[#266C92]"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="tab-control-testing"
                  >
                    <span>Testing</span>
                    <span className="text-[10px] text-muted-foreground font-normal">({selectedCycle.label})</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${testCycleDropdownOpen && activeTab === "testing" ? "rotate-180" : ""}`} />
                  </button>
                  {testCycleDropdownOpen && activeTab === "testing" && (
                    <div className="absolute top-full left-0 mt-0.5 z-50 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg shadow-lg py-1 min-w-[180px]">
                      {testCycles.map(cycle => (
                        <button
                          key={cycle.id}
                          onClick={() => { setActiveTestCycle(cycle.id); setTestCycleDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-3 transition-colors ${
                            activeTestCycle === cycle.id
                              ? "bg-[#266C92]/5 text-[#266C92] font-medium"
                              : "text-foreground hover:bg-slate-50 dark:hover:bg-muted/30"
                          }`}
                          data-testid={`cycle-${cycle.id}`}
                        >
                          <span>{cycle.label}<span className="text-muted-foreground font-normal ml-1.5">{cycle.period}</span></span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
                            cycle.status === "Complete" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            cycle.status === "In Progress" ? "bg-[#266C92]/10 text-[#266C92]" :
                            "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}>{cycle.status}</span>
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
                data-testid={`tab-control-${tab}`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "details" && <ControlDetailsTab controlId={controlId} />}
      {activeTab === "issues" && <ControlIssuesStub controlId={controlId} />}
      {activeTab === "automations" && <ControlAutomationsStub controlId={controlId} />}

      {activeTab === "testing" && (() => {
        const allPending = !controlStatus || fieldworkStepOrder.every(s => controlStatus.steps[s as keyof typeof controlStatus.steps] === "pending");
        if (allPending) {
          return (
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="text-center max-w-md space-y-5">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-[#266C92]/10 flex items-center justify-center">
                  <Bot className="w-7 h-7 text-[#266C92]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Automated Control Testing</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Run the agent-assisted testing workflow for <span className="font-medium text-foreground">{controlId} — {master?.name ?? "Control"}</span>. The agent will guide you through readiness checks, population ingestion, sampling, evidence collection, test execution, and effectiveness assessment.
                  </p>
                </div>
                {(() => {
                  const stepModes = fieldworkStepOrder.map(s => automationConfig?.[s]?.mode ?? "full");
                  const allSame = stepModes.every(m => m === stepModes[0]);
                  const globalLabel = allSame ? automationModeLabels[stepModes[0]].label : null;
                  const GlobalIcon = allSame ? automationModeIcons[stepModes[0]].icon : null;
                  const fullCount = stepModes.filter(m => m === "full").length;
                  const checkCount = stepModes.filter(m => m === "checkpoint").length;
                  const manualCount = stepModes.filter(m => m === "manual").length;

                  return (
                    <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-200/60 dark:border-border/40 space-y-2">
                      <div className="flex items-center justify-center gap-1.5">
                        {GlobalIcon && <GlobalIcon className="w-3 h-3 text-[#266C92]/60" />}
                        <span className="text-[11px] font-semibold text-foreground/80">
                          {allSame ? `${globalLabel} across all steps` : "Mixed automation levels"}
                        </span>
                      </div>
                      {allSame && stepModes[0] === "full" && (
                        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                          The agent will execute all 6 steps end-to-end, pausing only when user input or external data is required. Use the gear icon to customize per-step behavior.
                        </p>
                      )}
                      {allSame && stepModes[0] === "checkpoint" && (
                        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                          The agent will pause after each substep for your review and confirmation before proceeding. This provides maximum visibility into the testing process.
                        </p>
                      )}
                      {allSame && stepModes[0] === "manual" && (
                        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                          Each substep must be configured and triggered manually. You control the parameters and timing of every action in the workflow.
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
                              <Flag className="w-2.5 h-2.5 text-slate-400" />
                              <span className="text-[10px] text-muted-foreground">{checkCount} checkpoint</span>
                            </div>
                          )}
                          {manualCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Fingerprint className="w-2.5 h-2.5 text-slate-400" />
                              <span className="text-[10px] text-muted-foreground">{manualCount} manual</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="pt-2 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    {onStartWorkflow ? (
                      <Button
                        size="default"
                        className="h-10 px-6 text-sm gap-2 bg-[#266C92] hover:bg-[#1e5a7a] text-white shadow-sm"
                        onClick={() => onStartWorkflow()}
                        data-testid="button-start-workflow"
                      >
                        <Play className="w-4 h-4" />
                        Test with Agent
                      </Button>
                    ) : (
                      <Button
                        size="default"
                        className="h-10 px-6 text-sm gap-2 bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed"
                        disabled
                        data-testid="button-start-workflow-disabled"
                      >
                        <Play className="w-4 h-4" />
                        Test with Agent
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => setAutomationModalOpen(true)}
                      data-testid="button-automation-config"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">6 steps · ~15 min estimated</p>
                </div>
                <AutomationConfigModal
                  open={automationModalOpen}
                  onOpenChange={setAutomationModalOpen}
                  config={automationConfig}
                  onSave={setAutomationConfig}
                />
                <div className="pt-4 border-t border-slate-200 dark:border-border">
                  <div className="flex items-center justify-center gap-6">
                    {fieldworkStepOrder.map((step, idx) => (
                      <div key={step} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-[10px] text-muted-foreground">{stepShortLabels[step]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return (
        <>
        {controlStatus && (
        <div className="shrink-0 border-b border-slate-200 dark:border-border bg-slate-50/80 dark:bg-muted/20">
          <div className="px-5 py-2 flex items-center gap-3">
            <div className="relative flex items-center h-8 flex-1 min-w-0">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              {(() => {
                const completedCount = fieldworkStepOrder.filter(
                  s => controlStatus.steps[s as keyof typeof controlStatus.steps] === "complete"
                ).length;
                const totalSteps = visibleStepOrder.length;
                const pct = totalSteps > 1 ? (completedCount / (totalSteps - 1)) * 100 : 0;
                return <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#266C92] transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />;
              })()}
              <div className="relative flex items-center justify-between w-full">
                {visibleStepOrder.map((step, idx) => {
                  const isOutputs = step === "outputs";
                  const status = isOutputs ? "complete" : controlStatus.steps[step as keyof typeof controlStatus.steps];
                  const isActive = idx === activeStepIdx;
                  const navigable = canNavigateTo(idx);
                  return (
                    <button
                      key={step}
                      onClick={() => navigable && setActiveStepIdx(idx)}
                      disabled={!navigable}
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all z-10 ring-2 ring-slate-50 dark:ring-slate-900 ${navigable ? "cursor-pointer" : "cursor-default"} ${
                        isActive
                          ? "bg-[#266C92] text-white shadow-sm"
                          : status === "complete"
                            ? "bg-slate-50 dark:bg-slate-900 text-[#266C92]"
                            : status === "blocked"
                              ? "bg-slate-50 dark:bg-slate-900 text-red-500"
                              : "bg-slate-50 dark:bg-slate-900 text-muted-foreground"
                      }`}
                      data-testid={`stepper-step-${step}`}
                    >
                      {status === "complete" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : status === "running" && isActive ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : status === "blocked" ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : null}
                      <span>{stepShortLabels[step]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {isDemo && !isComplete && (
              <div className="shrink-0 flex items-center">
                <button
                  onClick={() => setWorkflowPaused(p => !p)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    workflowPaused
                      ? "bg-[#266C92]/10 text-[#266C92] hover:bg-[#266C92]/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-muted/40"
                  }`}
                  title={workflowPaused ? "Resume workflow" : "Pause workflow"}
                  data-testid="button-workflow-pause-resume"
                >
                  {workflowPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
          <div className="border-t border-slate-200/60 dark:border-border/40">
            <button
              onClick={() => setTestDetailsOpen(!testDetailsOpen)}
              className="w-full flex items-center gap-2 px-5 py-1.5 hover:bg-slate-100/60 dark:hover:bg-muted/30 transition-colors"
              data-testid="toggle-test-details"
            >
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${testDetailsOpen ? "" : "-rotate-90"}`} />
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Test Details</span>
            </button>
            {testDetailsOpen && (() => {
              const td = getTestDetailInfo(controlId, activeTestCycle);
              return (
                <div className="px-5 pb-3">
                  <div className="grid grid-cols-2 gap-x-16 gap-y-3">
                    {([
                      ["Tester", td.tester],
                      ["Reviewer", td.reviewer],
                      ["PBC Request", td.pbcRequest],
                      ["Secondary Reviewer", td.secondaryReviewer],
                      ["Sample Size", td.sampleSize],
                      ["Budgeted Hours", td.budgetedHours],
                      ["Sample Selections", td.sampleSelections],
                      ["Due Date", td.dueDate],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} className="flex items-baseline gap-4">
                        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase w-28 shrink-0 text-right">{label}</p>
                        <p className="text-xs text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-[90%] mx-auto px-6 py-6 space-y-6">
          {controlStatus && (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{stepLabels[activeStep]}</h3>
                    <Badge className={`text-[9px] ${
                      activeStepStatus === "complete" ? "bg-[#266C92]/10 text-[#266C92]" :
                      activeStepStatus === "running" ? "bg-[#266C92]/10 text-[#266C92]" :
                      activeStepStatus === "waiting" ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" :
                      activeStepStatus === "blocked" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    } border-0`}>
                      {activeStepStatus === "complete" ? "Complete" : activeStepStatus === "running" ? "Running" : activeStepStatus === "waiting" ? "Waiting" : activeStepStatus === "blocked" ? "Blocked" : "Pending"}
                    </Badge>
                    {(() => {
                      const sMode: AutomationMode = automationConfig?.[activeStep]?.mode ?? "full";
                      const mi = automationModeIcons[sMode];
                      const MI = mi.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-medium ${mi.color} opacity-80`} title={mi.title}>
                          <MI className="w-2.5 h-2.5" />
                          {automationModeLabels[sMode].short}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Step {activeStepIdx + 1} of {visibleStepOrder.length}: {stepDescriptions[activeStep]}</p>
                </div>
              </div>

              {activeStep === "outputs" ? (
                <OutputsStepContent controlId={controlId} />
              ) : (
                <>
                  <div data-testid={`control-step-block-${activeStep}`}>
                    <StepNodeContent
                      step={activeStep}
                      stepStatus={activeStepStatus}
                      controlId={controlId}
                      substepProgress={substepProgress[activeStep] ?? 0}
                      blockRule={blockRule}
                      onResolve={onResolve}
                      isResolved={isResolved}
                      onAction={handleStepAction}
                      onSubstepAction={handleSubstepAction}
                      autoExpandedSubs={autoExpandedSubs}
                      automationConfig={automationConfig}
                      onResumeSubstep={handleResumeSubstep}
                      manualTriggered={manualTriggered}
                      checkpointAcked={checkpointAcked}
                      onAckCheckpoint={handleAckCheckpoint}
                      workstreamActive={workstreamActive}
                      evidenceWorkstreamActive={evidenceWorkstreamActive}
                      completedTrackerSubs={completedTrackerSubs}
                    />
                  </div>

                  {isComplete && (
                    <div className={`p-4 rounded-xl border ${isIneffective ? "border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10" : "border-[#266C92]/20 bg-[#266C92]/5"}`}>
                      <div className="flex items-center gap-2">
                        {isIneffective ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <ShieldCheck className="w-4 h-4 text-[#266C92]" />}
                        <span className={`text-sm font-medium ${isIneffective ? "text-red-600 dark:text-red-400" : "text-[#266C92]"}`}>
                          Control Effectiveness: {isIneffective ? "Ineffective" : "Effective"}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </div>
      </div>

      {controlStatus && (
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
              {isDemo && activeStepStatus === "running" && (() => {
                const stepInfo = stepNodeInfo[activeStep];
                const totalSubs = stepInfo?.substeps.length ?? 0;
                const currentProg = substepProgress[activeStep] ?? 0;
                const allSubsDone = currentProg >= totalSubs;
                if (allSubsDone) {
                  const isLastFieldworkStep = activeStep === "testEffectiveness";
                  return isLastFieldworkStep ? (
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                      onClick={() => {
                        handleStepAction(activeStep, "confirm-step");
                        setOutputsGenerated(true);
                        setTimeout(() => {
                          setActiveStepIdx(fieldworkStepOrder.length);
                        }, 100);
                      }}
                      data-testid={`button-generate-workpaper-${controlId}`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Generate Workpaper
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                      onClick={() => handleStepAction(activeStep, "confirm-step")}
                      data-testid={`button-confirm-${activeStep}-${controlId}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm & Continue
                    </Button>
                  );
                }
                return null;
              })()}

              {!isDemo && activeVisibleActions.length > 0 && activeVisibleActions.map((action) => {
                const Icon = action.icon;
                const handleClick = () => {
                  if (action.isResolve && onResolve) {
                    onResolve(controlId);
                    handleStepAction(activeStep, "Resolve & Resume");
                  } else {
                    handleStepAction(activeStep, action.id);
                  }
                };
                const isResolveDisabled = action.isResolve && isResolved;
                return (
                  <Button
                    key={action.id}
                    size="sm"
                    variant={action.variant === "primary" ? "default" : action.variant === "outline" ? "outline" : action.variant === "destructive" ? "destructive" : "secondary"}
                    className={`h-8 text-xs gap-1.5 ${action.variant === "primary" ? "bg-[#266C92] hover:bg-[#1e5a7a] text-white" : ""}`}
                    onClick={handleClick}
                    disabled={!!isResolveDisabled}
                    data-testid={`button-action-${action.id}-${controlId}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {isResolveDisabled ? "Resolved" : action.label}
                  </Button>
                );
              })}

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

              {isComplete && onViewReport && (
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                  onClick={onViewReport}
                  data-testid="button-view-control-report"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Control Summary
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      </>
      )
      })()}

      {actionToast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {actionToast}
          </div>
        </div>
      )}
    </div>
    <ControlUtilityPanel controlId={controlId} controlStatus={controlStatus} substepProgress={substepProgress} onUploadPopulation={() => handleSubstepAction("pop-ingest", "upload")} onRequestWorkstream={() => handleSubstepAction("pop-ingest", "request")} workstreamActive={workstreamActive} onUploadEvidence={() => handleSubstepAction("evd-collect", "upload")} onRequestEvidenceWorkstream={() => handleSubstepAction("evd-collect", "request")} />

    </div>
  );
}

function ControlSummaryReport({ controlId, onBack }: { controlId: string; onBack: () => void }) {
  const master = masterControlsList.find(c => c.id === controlId);
  const exceptions = fieldworkExceptions.filter(e => e.controlId === controlId);
  const hasException = exceptions.length > 0;
  const passed = !hasException;
  const totalSamples = exceptions.length > 0 ? Math.max(...exceptions.map(e => e.samplesTested)) : 25;

  const stepDetails = [
    { step: "Readiness", detail: "Control objective, risk classification, attributes extracted, and test plan established" },
    { step: "Population", detail: master?.dataSource === "connected" ? `Retrieved from ${master.system}` : "Population file uploaded via PBC request" },
    { step: "Sampling", detail: `${totalSamples} items selected using statistical sampling methodology` },
    { step: "Evidence", detail: master?.dataSource === "connected" ? `Automated extraction from ${master.system}, documents classified, fields extracted and cross-referenced` : "Evidence collected via PBC owner submission, documents classified, fields extracted and cross-referenced" },
    { step: "Testing", detail: passed ? `${totalSamples} samples evaluated against all testing attributes — no exceptions` : `${totalSamples} samples evaluated — ${exceptions.length} exception(s) identified across testing attributes` },
    { step: "Test of Effectiveness", detail: passed ? "All attributes satisfied — control operating effectively" : `Control determined ineffective — ${exceptions.length} exception(s) requiring remediation` },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-background">
      <div className="shrink-0 h-12 px-4 flex items-center gap-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-control-report-back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="w-px h-5 bg-slate-200 dark:bg-border" />
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#266C92]" />
          <h2 className="text-sm font-semibold text-foreground">{controlId} — Control Testing Summary</h2>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-200 dark:border-border pb-4">
            <h1 className="text-lg font-bold text-foreground" data-testid="control-report-title">{master?.name ?? controlId} — Testing Summary Report</h1>
            <p className="text-xs text-muted-foreground mt-1">{master?.category} · FY2026 Q1 Testing Cycle · Generated March 13, 2026</p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border text-center">
              <p className="text-2xl font-bold text-foreground">{controlId}</p>
              <p className="text-[10px] text-muted-foreground">Control ID</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border text-center">
              <p className={`text-2xl font-bold ${master?.riskLevel === "Critical" ? "text-red-600 dark:text-red-400" : master?.riskLevel === "High" ? "text-orange-600 dark:text-orange-400" : "text-foreground"}`}>{master?.riskLevel ?? "—"}</p>
              <p className="text-[10px] text-muted-foreground">Risk Level</p>
            </div>
            <div className={`p-3 rounded-lg border text-center ${passed ? "border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-red-200 dark:border-red-800/30 bg-red-50/30 dark:bg-red-900/10"}`}>
              <p className={`text-2xl font-bold ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{passed ? "Effective" : "Ineffective"}</p>
              <p className="text-[10px] text-muted-foreground">Result</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-border text-center">
              <p className="text-2xl font-bold text-foreground">{totalSamples}</p>
              <p className="text-[10px] text-muted-foreground">Samples Tested</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-border overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-muted/20 border-b border-slate-200 dark:border-border">
              <h3 className="text-xs font-semibold text-foreground">Control Details</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-border text-xs">
              {[
                ["Control Objective", master?.name ?? "—"],
                ["Category", master?.category ?? "—"],
                ["Risk Classification", master?.riskLevel ?? "—"],
                ["Control Owner", master?.owner ?? "—"],
                ["PBC Owner", master?.pbcOwner ?? "—"],
                ["Data Source", master?.dataSource === "connected" ? `Connected — ${master.system}` : "Manual (PBC)"],
              ].map(([label, value]) => (
                <div key={label} className="flex px-4 py-2">
                  <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-border overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-muted/20 border-b border-slate-200 dark:border-border">
              <h3 className="text-xs font-semibold text-foreground">Testing Pipeline Summary</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-border text-xs">
              {stepDetails.map(({ step, detail }) => (
                <div key={step} className="flex items-start px-4 py-2.5 gap-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground">{step}</span>
                    <p className="text-muted-foreground mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {passed && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Control Operating Effectively</h3>
              </div>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                All {totalSamples} sampled items passed attribute testing. No exceptions were identified. The {master?.name} control is operating effectively for the FY2026 Q1 testing period. No further action is required.
              </p>
            </div>
          )}

          {!passed && exceptions.map(exc => (
            <div key={exc.id} className="rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50/20 dark:bg-red-900/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <Badge className={`text-[9px] h-4 border-0 ${exc.severity === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"}`}>{exc.severity}</Badge>
                <h3 className="text-sm font-semibold text-foreground">{exc.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{exc.detail}</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5 font-medium">Root Cause</p>
                  <p className="text-foreground">{exc.rootCause}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5 font-medium">Recommendation</p>
                  <p className="text-foreground">{exc.recommendation}</p>
                </div>
              </div>
              <div className="flex gap-4 text-[10px] text-muted-foreground pt-1 border-t border-red-100 dark:border-red-900/20">
                <span>Samples tested: {exc.samplesTested}</span>
                <span className="text-red-500 font-medium">Samples failed: {exc.samplesFailed}</span>
                <span>Failure rate: {Math.round((exc.samplesFailed / exc.samplesTested) * 100)}%</span>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium mb-1.5">Recommended Next Steps</p>
                <ul className="space-y-1">
                  {exc.nextSteps.map((ns, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                      {ns}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-slate-200 dark:border-border p-4">
            <h3 className="text-xs font-semibold text-foreground mb-2">Conclusion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {passed
                ? `The ${master?.name} control (${controlId}) was tested as part of the FY2026 Q1 automated control testing cycle. ${totalSamples} samples were selected and evaluated against all relevant testing attributes. All samples passed — the control is operating effectively with no exceptions or further action required.`
                : `The ${master?.name} control (${controlId}) was tested as part of the FY2026 Q1 automated control testing cycle. ${totalSamples} samples were selected and evaluated across all testing attributes. ${exceptions.length} exception${exceptions.length > 1 ? "s were" : " was"} identified — the control is determined to be operating ineffectively. Management response and remediation plans are required within the prescribed timeline.`
              }
            </p>
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
    const pendingSteps = { readiness: "pending" as const, population: "pending" as const, sampling: "pending" as const, evidence: "pending" as const, testing: "pending" as const, testEffectiveness: "pending" as const };
    const defaultSeedControls: ControlWorkflowStatus[] = [
      { controlId: "CTL-001", name: "Access Provisioning", dataSource: "connected", system: "Okta IAM", owner: "IT Security", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-002", name: "Change Management", dataSource: "connected", system: "ServiceNow", owner: "IT Operations", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-003", name: "Segregation of Duties", dataSource: "manual", system: null, owner: "Internal Audit", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-004", name: "Backup & Recovery", dataSource: "connected", system: "AWS", owner: "IT Infrastructure", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-005", name: "Journal Entry Approval", dataSource: "connected", system: "SAP ERP", owner: "Controller", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-006", name: "Bank Reconciliation", dataSource: "connected", system: "SAP ERP", owner: "Treasury", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-007", name: "Revenue Recognition", dataSource: "manual", system: null, owner: "Revenue Accounting", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-008", name: "Vendor Payment Authorization", dataSource: "connected", system: "Coupa", owner: "AP Manager", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-009", name: "Physical Access Controls", dataSource: "connected", system: "Genetec", owner: "Facilities", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-010", name: "Incident Response", dataSource: "manual", system: null, owner: "CISO Office", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-011", name: "Data Classification", dataSource: "manual", system: null, owner: "Data Governance", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-012", name: "Procurement Approval", dataSource: "connected", system: "Coupa", owner: "Procurement", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-013", name: "User Access Review", dataSource: "connected", system: "Okta IAM", owner: "IT Security", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-014", name: "Financial Close Process", dataSource: "manual", system: null, owner: "Controller", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-015", name: "Third-Party Risk Assessment", dataSource: "manual", system: null, owner: "Vendor Management", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-016", name: "Privilege Escalation Monitoring", dataSource: "connected", system: "CrowdStrike", owner: "SOC Team", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-017", name: "Inventory Valuation", dataSource: "connected", system: "SAP ERP", owner: "Cost Accounting", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-018", name: "Accounts Receivable Aging", dataSource: "connected", system: "SAP ERP", owner: "AR Manager", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-019", name: "Payroll Processing Controls", dataSource: "manual", system: null, owner: "HR / Payroll", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-020", name: "Fixed Asset Capitalization", dataSource: "connected", system: "SAP ERP", owner: "Fixed Assets", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-021", name: "Database Administrator Access", dataSource: "connected", system: "CrowdStrike", owner: "IT Security", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-022", name: "Network Security Monitoring", dataSource: "connected", system: "CrowdStrike", owner: "SOC Team", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-023", name: "Business Continuity Planning", dataSource: "manual", system: null, owner: "Risk Management", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-024", name: "Whistleblower & Ethics Hotline", dataSource: "manual", system: null, owner: "Compliance", steps: { ...pendingSteps }, overallProgress: 0 },
      { controlId: "CTL-025", name: "Intercompany Eliminations", dataSource: "connected", system: "SAP ERP", owner: "Consolidation", steps: { ...pendingSteps }, overallProgress: 0 },
    ];
    const baseStatuses = currentStatuses.length > 0 ? currentStatuses : defaultSeedControls;
    const completedStatuses = baseStatuses.map((s) => ({
      ...s,
      steps: { readiness: "complete", population: "complete", sampling: "complete", evidence: "complete", testing: "complete", testEffectiveness: "complete" },
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
  const [exceptionsModalOpen, setExceptionsModalOpen] = useState(false);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [nextStepsExpanded, setNextStepsExpanded] = useState(false);
  const [auditLogExpanded, setAuditLogExpanded] = useState(false);
  const [hubDetailView, setHubDetailView] = useState<string | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveDialogTarget, setResolveDialogTarget] = useState<{ controlId: string; blockAtStep: string; title: string } | null>(null);
  const [resolveMode, setResolveMode] = useState<"upload" | "change-pbc" | null>(null);
  const [resolveFileName, setResolveFileName] = useState("");
  const [resolvePbcName, setResolvePbcName] = useState("");
  const [resolvePbcEmail, setResolvePbcEmail] = useState("");
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
      const next = tickFieldworkStatuses(currentStatuses, currentResolved, true);
      if (next) {
        store.setBlockState(sid, "fieldwork-execution", "statuses", next);
        const allDone = next.every((s) =>
          fieldworkStepOrder.every(step => s.steps[step as keyof typeof s.steps] === "complete")
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

  const rawControlStatuses = (fieldworkRuntime?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
  const controlStatuses = rawControlStatuses;

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

  if (hubDetailView?.startsWith("control-report:")) {
    const reportControlId = hubDetailView.replace("control-report:", "");
    return (
      <ControlSummaryReport
        controlId={reportControlId}
        onBack={() => setHubDetailView(`control:${reportControlId}`)}
      />
    );
  }

  if (hubDetailView?.startsWith("control:")) {
    const focusControlId = hubDetailView.replace("control:", "");
    const focusStatus = controlStatuses.find(s => s.controlId === focusControlId) ?? null;
    const handleStartDemoWorkflow = () => {
      if (!fieldworkProject) return;
      const sid = fieldworkProject.sessionId;
      const currentStatuses = [...controlStatuses];
      const idx = currentStatuses.findIndex(s => s.controlId === focusControlId);
      if (idx === -1) return;
      const ctrl = { ...currentStatuses[idx], steps: { ...currentStatuses[idx].steps } };
      ctrl.steps.readiness = "running";
      currentStatuses[idx] = ctrl;
      setBlockState(sid, "fieldwork-execution", "statuses", currentStatuses);
    };
    const handleAdvanceDemoStep = (currentStep: string) => {
      if (!fieldworkProject) return;
      const sid = fieldworkProject.sessionId;
      const currentStatuses = [...controlStatuses];
      const idx = currentStatuses.findIndex(s => s.controlId === focusControlId);
      if (idx === -1) return;
      const ctrl = { ...currentStatuses[idx], steps: { ...currentStatuses[idx].steps } };
      const currentStepStatus = ctrl.steps[currentStep as keyof typeof ctrl.steps];
      if (currentStepStatus === "complete") return;
      ctrl.steps[currentStep as keyof typeof ctrl.steps] = "complete";
      const stepIdx = fieldworkStepOrder.indexOf(currentStep);
      if (stepIdx < fieldworkStepOrder.length - 1) {
        const nextStep = fieldworkStepOrder[stepIdx + 1];
        const nextStatus = ctrl.steps[nextStep as keyof typeof ctrl.steps];
        if (nextStatus !== "complete") {
          ctrl.steps[nextStep as keyof typeof ctrl.steps] = "running";
        }
      }
      const completedCount = fieldworkStepOrder.filter(s => ctrl.steps[s as keyof typeof ctrl.steps] === "complete").length;
      ctrl.overallProgress = Math.round((completedCount / fieldworkStepOrder.length) * 100);
      currentStatuses[idx] = ctrl;
      setBlockState(sid, "fieldwork-execution", "statuses", currentStatuses);
    };
    return (
      <ControlFocusPage
        key={focusControlId}
        controlId={focusControlId}
        controlStatus={focusStatus}
        onBack={() => setHubDetailView(null)}
        onResolve={handleResolveAction}
        isResolved={resolvedSet.has(focusControlId)}
        onAdvanceStep={focusControlId === DEMO_CONTROL_ID ? handleAdvanceDemoStep : undefined}
        onStartWorkflow={focusControlId === DEMO_CONTROL_ID ? handleStartDemoWorkflow : undefined}
        onViewReport={() => setHubDetailView(`control-report:${focusControlId}`)}
      />
    );
  }

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
    return ctrl && ctrl.steps.testEffectiveness === "complete";
  });

  const stepDot = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle2 className="w-3 h-3 text-[#266C92]" />;
      case "running": return <Loader2 className="w-3 h-3 text-[#266C92] animate-spin" />;
      case "waiting": return <Clock className="w-3 h-3 text-slate-400" />;
      case "blocked": return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />;
    }
  };

  const effectivenessDot = (ctrl: typeof controlStatuses[number]) => {
    if (ctrl.steps.testEffectiveness !== "complete") {
      return <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />;
    }
    if (exceptionControlIds.has(ctrl.controlId)) {
      return <AlertTriangle className="w-3 h-3 text-red-500" />;
    }
    return <ShieldCheck className="w-3 h-3 text-[#266C92]" />;
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
      <div className={`flex-1 min-h-0 bg-slate-50 dark:bg-background px-8 py-5 ${hasWorkflow && !auditLogExpanded ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}>
        {!hasWorkflow ? (
          <div className="w-[90%] max-w-[1600px] mx-auto space-y-5" data-testid="fieldwork-hub-empty">
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

            <div className="space-y-4">
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

              <Card className="border border-slate-200 dark:border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">Optro Assistant: Audit Log</span>
                </div>
                <div className="px-4 py-3 bg-[#266C92]/5 dark:bg-[#266C92]/10 border-t border-slate-100 dark:border-border" data-testid="assistant-welcome-bubble-empty">
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
        ) : (
          <div className={`w-[90%] max-w-[1600px] mx-auto flex flex-col gap-5 ${!auditLogExpanded ? "h-full" : ""}`} data-testid="fieldwork-tracker-view" data-is-complete={isComplete} data-execution-phase={executionPhase} data-control-count={controlStatuses.length}>
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
                          onClick={() => {
                            setResolveDialogTarget({ controlId: action.controlId, blockAtStep: action.blockAtStep, title: action.title });
                            setResolveMode(null);
                            setResolveFileName("");
                            setResolvePbcName("");
                            setResolvePbcEmail("");
                            setResolveDialogOpen(true);
                          }}
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

            <div className={`flex flex-col gap-4 ${!auditLogExpanded ? "flex-1 min-h-0" : ""}`}>
              {controlStatuses.length > 0 && (
                <Card className={`border border-slate-200 dark:border-border flex flex-col ${!auditLogExpanded ? "flex-1 min-h-0" : ""}`} data-testid="fieldwork-pipeline-card">
                  <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-[#266C92]" />
                      Control Pipeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`px-4 pb-4 ${!auditLogExpanded ? "flex-1 min-h-0 overflow-y-auto" : ""}`}>
                    <div className="grid grid-cols-[3fr_5rem_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-2 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-slate-100 dark:border-border mb-1">
                      <span>Control</span>
                      <span>Source</span>
                      <span className="text-center">Readiness</span>
                      <span className="text-center">Population</span>
                      <span className="text-center">Sampling</span>
                      <span className="text-center">Evidence</span>
                      <span className="text-center">Testing</span>
                      <span className="text-center">Effective</span>
                      <span className="text-center">Result</span>
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
                          const isIneffective = ctrl.steps.testEffectiveness === "complete" && exceptionControlIds.has(ctrl.controlId);
                          return (
                            <div
                              key={ctrl.controlId}
                              className={`grid grid-cols-[3fr_5rem_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-2 py-1.5 rounded items-center transition-all cursor-pointer border-l-2 border-l-transparent ${isBlocked || isIneffective ? "bg-red-50/30 dark:bg-red-900/5 hover:border-l-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/15" : "hover:border-l-[#266C92] hover:bg-[#266C92]/5 dark:hover:bg-[#266C92]/10"}`}
                              onClick={() => setHubDetailView(`control:${ctrl.controlId}`)}
                              data-testid={`pipeline-row-${ctrl.controlId}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`text-[10px] font-mono font-semibold ${isBlocked || isIneffective ? "text-red-500" : "text-foreground"}`}>{ctrl.controlId}</span>
                                <span className="text-xs text-foreground truncate">{ctrl.name}</span>
                              </div>
                              <span className={`text-[10px] font-medium truncate ${isBlocked ? "text-red-500" : "text-muted-foreground"}`}>{isBlocked ? "Blocked" : "PBC"}</span>
                              <div className="flex justify-center">{stepDot(ctrl.steps.readiness)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.population)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.sampling)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.evidence)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.testing)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.testEffectiveness)}</div>
                              <div className="flex justify-center">{effectivenessDot(ctrl)}</div>
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
                          const isIneffective = ctrl.steps.testEffectiveness === "complete" && exceptionControlIds.has(ctrl.controlId);
                          return (
                            <div
                              key={ctrl.controlId}
                              className={`grid grid-cols-[3fr_5rem_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-2 py-1.5 rounded items-center transition-all cursor-pointer border-l-2 border-l-transparent ${isIneffective ? "bg-red-50/30 dark:bg-red-900/5 hover:border-l-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/15" : "hover:border-l-[#266C92] hover:bg-[#266C92]/5 dark:hover:bg-[#266C92]/10"}`}
                              onClick={() => setHubDetailView(`control:${ctrl.controlId}`)}
                              data-testid={`pipeline-row-${ctrl.controlId}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`text-[10px] font-mono font-semibold ${isIneffective ? "text-red-600 dark:text-red-400" : "text-[#266C92]"}`}>{ctrl.controlId}</span>
                                <span className="text-xs text-foreground truncate">{ctrl.name}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium truncate">Connected</span>
                              <div className="flex justify-center">{stepDot(ctrl.steps.readiness)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.population)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.sampling)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.evidence)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.testing)}</div>
                              <div className="flex justify-center">{stepDot(ctrl.steps.testEffectiveness)}</div>
                              <div className="flex justify-center">{effectivenessDot(ctrl)}</div>
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
                      <>
                        <div className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5 text-[#266C92]" /><span>Effective</span></div>
                        <div className="flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5 text-red-500" /><span>Ineffective</span></div>
                      </>
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

            <Card className="border border-slate-200 dark:border-border overflow-hidden shrink-0" data-testid="fieldwork-activity-card">
              <button
                onClick={() => setAuditLogExpanded(!auditLogExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-muted/5 transition-colors"
                data-testid="button-toggle-audit-log"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#266C92]" />
                  <span className="text-sm font-semibold text-foreground">Optro Assistant: Audit Log</span>
                  <Badge className="text-[9px] h-4 bg-[#266C92]/10 text-[#266C92] dark:bg-[#266C92]/20 dark:text-[#4da3c9]">{fieldworkActivityFeed.length} entries</Badge>
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

                  <div className="divide-y divide-slate-100 dark:divide-border max-h-64 overflow-y-auto">
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
              )}
            </Card>

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

      <Dialog open={resolveDialogOpen} onOpenChange={(open) => { setResolveDialogOpen(open); if (!open) { setResolveDialogTarget(null); setResolveMode(null); setResolveFileName(""); setResolvePbcName(""); setResolvePbcEmail(""); } }}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Resolve & Resume
            </DialogTitle>
            <DialogDescription>
              {resolveDialogTarget ? (
                <>
                  <span className="font-mono text-[#266C92]">{resolveDialogTarget.controlId}</span> — {resolveDialogTarget.title}
                </>
              ) : "Provide the required inputs to unblock and resume this control's workflow."}
            </DialogDescription>
          </DialogHeader>
          {resolveDialogTarget && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="text-[9px] h-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Blocked at {resolveDialogTarget.blockAtStep}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {resolveDialogTarget.blockAtStep === "population"
                  ? "The population file is required before the workflow can proceed. You can upload the file directly or reassign the PBC provider."
                  : "Evidence files are required before the workflow can proceed. You can upload the evidence directly or reassign the PBC provider."}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => setResolveMode("upload")}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${resolveMode === "upload" ? "border-[#266C92] bg-[#266C92]/5" : "border-slate-200 dark:border-border hover:border-[#266C92]/30"}`}
                  data-testid="resolve-option-upload"
                >
                  <Upload className="w-4 h-4 text-[#266C92] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {resolveDialogTarget.blockAtStep === "population" ? "Upload Population File" : "Upload Evidence Directly"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {resolveDialogTarget.blockAtStep === "population"
                        ? "Upload the population data file to resume automated processing"
                        : "Upload evidence files to resume testing on this control"}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setResolveMode("change-pbc")}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${resolveMode === "change-pbc" ? "border-[#266C92] bg-[#266C92]/5" : "border-slate-200 dark:border-border hover:border-[#266C92]/30"}`}
                  data-testid="resolve-option-change-pbc"
                >
                  <Users className="w-4 h-4 text-[#266C92] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Change PBC Provider</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Reassign the PBC request to a different provider</p>
                  </div>
                </button>
              </div>

              {resolveMode === "upload" && (
                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div
                    className="border-2 border-dashed border-slate-200 dark:border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#266C92]/40 hover:bg-[#266C92]/[0.02] transition-colors"
                    onClick={() => setResolveFileName(resolveDialogTarget.blockAtStep === "population" ? "population_data_Q1_2026.xlsx" : "evidence_package_Q1_2026.zip")}
                    data-testid="resolve-upload-zone"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground/40 mb-2" />
                    {resolveFileName ? (
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#266C92]" />
                        <span className="text-xs font-medium text-[#266C92]">{resolveFileName}</span>
                        <CheckCircle2 className="w-3 h-3 text-[#266C92]" />
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-foreground">Click to select file</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">.xlsx, .csv, .pdf, .zip supported</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {resolveMode === "change-pbc" && (
                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="text-[11px] font-medium text-foreground mb-1 block">New PBC Provider Name</label>
                    <input
                      type="text"
                      value={resolvePbcName}
                      onChange={(e) => setResolvePbcName(e.target.value)}
                      placeholder="e.g. Sarah Chen"
                      className="w-full h-8 px-3 text-xs rounded-md border border-slate-200 dark:border-border bg-white dark:bg-muted/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#266C92]/30 focus:border-[#266C92]/40"
                      data-testid="resolve-pbc-name"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-foreground mb-1 block">Email Address</label>
                    <input
                      type="email"
                      value={resolvePbcEmail}
                      onChange={(e) => setResolvePbcEmail(e.target.value)}
                      placeholder="e.g. s.chen@company.com"
                      className="w-full h-8 px-3 text-xs rounded-md border border-slate-200 dark:border-border bg-white dark:bg-muted/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#266C92]/30 focus:border-[#266C92]/40"
                      data-testid="resolve-pbc-email"
                    />
                  </div>
                </div>
              )}

              {resolveMode && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => { setResolveDialogOpen(false); setResolveDialogTarget(null); setResolveMode(null); }}
                    data-testid="resolve-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                    disabled={resolveMode === "upload" ? !resolveFileName : (!resolvePbcName || !resolvePbcEmail)}
                    onClick={() => {
                      if (resolveDialogTarget) {
                        handleResolveAction(resolveDialogTarget.controlId);
                      }
                      setResolveDialogOpen(false);
                      setResolveDialogTarget(null);
                      setResolveMode(null);
                      setResolveFileName("");
                      setResolvePbcName("");
                      setResolvePbcEmail("");
                    }}
                    data-testid="resolve-confirm"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {resolveMode === "upload" ? "Upload & Resume" : "Reassign & Resume"}
                  </Button>
                </div>
              )}
            </div>
          )}
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

function EnvironmentView({ initialView, onExit }: { initialView: string; onExit: () => void }) {
  const [view, setView] = useState<string>(initialView);
  const setBlockState = useWorkflowSessionStore((s) => s.setBlockState);
  const runtimeStates = useWorkflowSessionStore((s) => s.runtimeStates);

  const ensureRuntimeState = useCallback(() => {
    const store = useWorkflowSessionStore.getState();
    const currentStatuses = (store.runtimeStates["control-testing"]?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];
    if (currentStatuses.length === 0) {
      const pendingSteps = { readiness: "pending" as const, population: "pending" as const, sampling: "pending" as const, evidence: "pending" as const, testing: "pending" as const, testEffectiveness: "pending" as const };
      const seedStatuses: ControlWorkflowStatus[] = masterControlsList.map(c => ({
        controlId: c.id, name: c.name, dataSource: c.dataSource as "connected" | "manual",
        system: c.system, owner: c.owner, steps: { ...pendingSteps }, overallProgress: 0,
      })).sort((a, b) => (a.dataSource === "manual" ? 0 : 1) - (b.dataSource === "manual" ? 0 : 1));
      store.setBlockState("control-testing", "fieldwork-execution", "statuses", seedStatuses);
    }
    store.setBlockState("control-testing", "fieldwork-execution", "phase", "running");
  }, []);

  const controlStatuses = (runtimeStates["control-testing"]?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [];

  if (view.startsWith("control:")) {
    const focusControlId = view.replace("control:", "");
    const focusStatus = controlStatuses.find(s => s.controlId === focusControlId) ?? null;

    const handleStartDemoWorkflow = () => {
      ensureRuntimeState();
      const store = useWorkflowSessionStore.getState();
      const statuses = [...((store.runtimeStates["control-testing"]?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [])];
      const idx = statuses.findIndex(s => s.controlId === focusControlId);
      if (idx === -1) return;
      const ctrl = { ...statuses[idx], steps: { ...statuses[idx].steps } };
      ctrl.steps.readiness = "running";
      statuses[idx] = ctrl;
      store.setBlockState("control-testing", "fieldwork-execution", "statuses", statuses);
    };

    const handleAdvanceDemoStep = (currentStep: string) => {
      const store = useWorkflowSessionStore.getState();
      const statuses = [...((store.runtimeStates["control-testing"]?.blockStates?.["fieldwork-execution"]?.statuses as ControlWorkflowStatus[] | undefined) ?? [])];
      const idx = statuses.findIndex(s => s.controlId === focusControlId);
      if (idx === -1) return;
      const ctrl = { ...statuses[idx], steps: { ...statuses[idx].steps } };
      if (ctrl.steps[currentStep as keyof typeof ctrl.steps] === "complete") return;
      ctrl.steps[currentStep as keyof typeof ctrl.steps] = "complete";
      const stepIdx = fieldworkStepOrder.indexOf(currentStep);
      if (stepIdx < fieldworkStepOrder.length - 1) {
        const nextStep = fieldworkStepOrder[stepIdx + 1];
        if (ctrl.steps[nextStep as keyof typeof ctrl.steps] !== "complete") {
          ctrl.steps[nextStep as keyof typeof ctrl.steps] = "running";
        }
      }
      const completedCount = fieldworkStepOrder.filter(s => ctrl.steps[s as keyof typeof ctrl.steps] === "complete").length;
      ctrl.overallProgress = Math.round((completedCount / fieldworkStepOrder.length) * 100);
      statuses[idx] = ctrl;
      store.setBlockState("control-testing", "fieldwork-execution", "statuses", statuses);
    };

    return (
      <ControlFocusPage
        key={focusControlId}
        controlId={focusControlId}
        controlStatus={focusStatus}
        onBack={() => setView("controls-list")}
        backLabel="Controls"
        onAdvanceStep={focusControlId === DEMO_CONTROL_ID ? handleAdvanceDemoStep : undefined}
        onStartWorkflow={focusControlId === DEMO_CONTROL_ID ? handleStartDemoWorkflow : undefined}
      />
    );
  }

  if (view === "controls-list") {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-background">
        <div className="shrink-0 h-12 px-4 flex items-center gap-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#266C92]" />
            <h2 className="text-sm font-semibold text-foreground">Controls</h2>
          </div>
          <Badge className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0">{masterControlsList.length}</Badge>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="divide-y divide-slate-100 dark:divide-border/50">
            {masterControlsList.map((control) => (
              <button
                key={control.id}
                onClick={() => setView(`control:${control.id}`)}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-muted/20 transition-colors group"
                data-testid={`env-controls-list-item-${control.id}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{control.id}</span>
                    <span className="text-sm font-medium text-foreground truncate">{control.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{control.owner}</span>
                    {control.system && <span className="text-[11px] text-muted-foreground">· {control.system}</span>}
                    <span className={`text-[11px] font-medium ${control.dataSource === "manual" ? "text-amber-600" : "text-emerald-600"}`}>
                      {control.dataSource === "manual" ? "Manual PBC" : "Connected"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function AgentHubHome({ workspaceId, welcomeMessage }: AgentHubHomeProps) {
  const settings = useSettings();
  const isSimple = settings.agentHubViewMode !== "complex";
  const scenario = settings.agentHubScenario || "fieldwork-automation";
  const currentSessionId = useWorkflowSessionStore((s) => s.currentSessionId);
  const [envView, setEnvView] = useState<string | null>(null);

  useEffect(() => {
    const environmentHashes = ["controls", "tests", "issues", "financial-accounts", "library-controls", "control-self-assessments", "processes"];
    const checkEnvHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (environmentHashes.includes(hash)) {
        if (hash === "controls") {
          setEnvView("controls-list");
        }
      } else {
        setEnvView(null);
      }
    };
    checkEnvHash();
    window.addEventListener("hashchange", checkEnvHash);
    return () => window.removeEventListener("hashchange", checkEnvHash);
  }, []);

  if (isSimple) {
    return <SimpleAgentHub welcomeMessage={welcomeMessage} scenario={scenario} />;
  }

  if (envView) {
    return <EnvironmentView initialView={envView} onExit={() => { setEnvView(null); window.location.hash = ""; window.history.replaceState(null, "", window.location.pathname); }} />;
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
