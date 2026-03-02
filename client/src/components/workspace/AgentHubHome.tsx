import { useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const categoryIcons: Record<AgentCategory, typeof Zap> = {
  "direct-realtime": Zap,
  continuous: Activity,
  scheduled: CalendarClock,
  emergent: AlertTriangle,
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

function WorkflowRow({ workflow }: { workflow: AgentWorkflow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-lg bg-white dark:bg-card transition-all ${
        workflow.humanActionNeeded
          ? "border-[#266C92]/40 dark:border-[#266C92]/50"
          : "border-slate-200 dark:border-border"
      }`}
      data-testid={`workflow-card-${workflow.id}`}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        data-testid={`workflow-toggle-${workflow.id}`}
      >
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${expanded ? "rotate-180" : "-rotate-90"}`} />
        <h4 className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">{workflow.name}</h4>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-[5.5rem] shrink-0">
            <StatusBadge status={workflow.status} />
          </div>

          <div className="w-[9.5rem] shrink-0">
            {workflow.status === "active" && workflow.progress < 100 ? (
              <div className="flex items-center gap-2">
                <ProgressBar value={workflow.progress} />
                <span className="text-xs text-muted-foreground font-medium w-8 text-right">{workflow.progress}%</span>
              </div>
            ) : null}
          </div>

          {workflow.humanActionNeeded && (
            <button
              className="shrink-0 w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Review workflow"
              title="Review"
              data-testid={`button-review-${workflow.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="w-3.5 h-3.5 text-[#266C92]" />
            </button>
          )}
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
          </div>
        </div>
      )}
    </div>
  );
}

interface CategorySectionProps {
  category: AgentCategorySummary;
  sectionRef: (el: HTMLDivElement | null) => void;
}

function CategorySection({ category, sectionRef }: CategorySectionProps) {
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
            <WorkflowRow key={wf.id} workflow={wf} />
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
          <Activity className="w-4 h-4 text-muted-foreground" />
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

export function AgentHubHome({ workspaceId, welcomeMessage }: AgentHubHomeProps) {
  const hubData = useMemo(() => getAgentHubData(workspaceId), [workspaceId]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToCategory = useCallback((categoryId: string) => {
    const el = sectionRefs.current[categoryId];
    if (el && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elTop = el.offsetTop - container.offsetTop;
      container.scrollTo({ top: elTop, behavior: "smooth" });
    }
  }, []);

  if (!hubData) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="text-white px-8 py-3 bg-cover bg-center bg-no-repeat relative shrink-0"
        style={{ backgroundImage: `url(${headerBgImage})` }}
      >
        <div className="max-w-6xl relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-lg font-semibold truncate min-w-0" data-testid="agent-hub-welcome">
            {welcomeMessage}
          </h1>
          <p className="text-sm text-white/70 shrink-0">
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
