import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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
import { WorkflowSession, getRiskAssessmentConfig, type WorkflowSessionConfig } from "./WorkflowSession";
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

interface AgentHubHomeProps {
  workspaceId: string;
  welcomeMessage: string;
}

export const workflowSessionConfigs: Record<string, { create: () => WorkflowSessionConfig; label: string; icon: string }> = {
  "risk-assessment": { create: getRiskAssessmentConfig, label: "Risk Assessment", icon: "trending-up" },
};

const workflowRowToSession: Record<string, string> = {
  "er-direct-1": "risk-assessment",
};

export function AgentHubHome({ workspaceId, welcomeMessage }: AgentHubHomeProps) {
  const hubData = useMemo(() => getAgentHubData(workspaceId), [workspaceId]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { currentSessionId, addProject, setCurrentSession, getSessionConfig } = useWorkflowSessionStore();

  const activeSession = currentSessionId ? (getSessionConfig(currentSessionId) as WorkflowSessionConfig | null) : null;

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

  if (activeSession) {
    return (
      <WorkflowSession
        config={activeSession}
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
