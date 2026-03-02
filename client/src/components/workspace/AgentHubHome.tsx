import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
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
  Send,
} from "lucide-react";
import headerBgImage from "@/assets/header-background.png";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";
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
  "pending-review": { label: "Pending Review", className: "bg-[#1a2332] hover:bg-[#1a2332] text-white dark:bg-slate-600" },
  completed: { label: "Completed", className: "bg-[#266C92]/70 hover:bg-[#266C92]/70 text-white" },
};

function StatusBadge({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];
  return (
    <Badge className={`text-xs font-medium ${config.className}`} data-testid={`badge-status-${status}`}>
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
    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all bg-[#266C92]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function WorkflowRow({ workflow }: { workflow: AgentWorkflow }) {
  return (
    <div
      className={`border rounded-lg bg-white dark:bg-card transition-all ${
        workflow.humanActionNeeded
          ? "border-[#266C92]/40 dark:border-[#266C92]/50"
          : "border-slate-200 dark:border-border"
      }`}
      data-testid={`workflow-card-${workflow.id}`}
    >
      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <h4 className="text-sm font-semibold text-foreground">{workflow.name}</h4>
              <StatusBadge status={workflow.status} />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>

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
          </div>

          {workflow.status === "active" && workflow.progress < 100 && (
            <div className="w-32 shrink-0 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span className="font-medium">{workflow.progress}%</span>
              </div>
              <ProgressBar value={workflow.progress} />
            </div>
          )}

          {workflow.humanActionNeeded && (
            <Button
              size="sm"
              className="shrink-0 bg-[#266C92] hover:bg-[#1e5a7a] text-white text-xs h-8"
              data-testid={`button-review-${workflow.id}`}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Review
            </Button>
          )}
        </div>

        {workflow.humanActionNeeded && workflow.humanActionDescription && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-[#266C92]/5 dark:bg-[#266C92]/10 rounded border border-[#266C92]/15 dark:border-[#266C92]/20">
            <Eye className="w-3.5 h-3.5 text-[#266C92] shrink-0" />
            <p className="text-xs text-[#266C92] dark:text-[#4da3c9]">{workflow.humanActionDescription}</p>
          </div>
        )}
      </div>
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
    <div ref={sectionRef} className="space-y-3" data-testid={`category-section-${category.category}`}>
      <button
        className="flex items-center gap-3 w-full group cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        data-testid={`category-toggle-${category.category}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.iconBg}`}>
          <Icon className={`w-4 h-4 ${category.color}`} />
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
          <p className="text-xs text-muted-foreground">{category.description}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="space-y-2 pl-11">
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
    <Card className="border border-slate-200 dark:border-border" data-testid="activity-feed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          Agent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 dark:divide-border">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`px-4 py-3 border-l-2 ${
                entry.type === "action-needed"
                  ? "border-l-[#266C92]"
                  : "border-l-slate-300 dark:border-l-slate-600"
              }`}
              data-testid={`activity-entry-${entry.id}`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">{entry.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Bot className="w-3 h-3" />
                    <span>{entry.agentName}</span>
                    <span>·</span>
                    <span>{entry.timestamp}</span>
                  </div>
                </div>
                {entry.type === "action-needed" && (
                  <Badge className="text-xs bg-[#266C92] hover:bg-[#266C92] text-white shrink-0">Action Needed</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface AgentHubHomeProps {
  workspaceId: string;
  welcomeMessage: string;
}

export function AgentHubHome({ workspaceId, welcomeMessage }: AgentHubHomeProps) {
  const hubData = useMemo(() => getAgentHubData(workspaceId), [workspaceId]);
  const { setOpen: setAssistantOpen } = useHomeAssistantStore();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToCategory = (categoryId: string) => {
    const el = sectionRefs.current[categoryId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!hubData) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div
        className="text-white px-8 pt-6 pb-36 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${headerBgImage})` }}
      >
        <div className="max-w-6xl relative z-10">
          <h1 className="text-2xl font-semibold mb-1" data-testid="agent-hub-welcome">
            {welcomeMessage}
          </h1>
          <p className="text-sm text-white/70">
            {hubData.activeAgents} agents active · {hubData.pendingReview} awaiting your review
          </p>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-background px-8 py-6 -mt-28 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="shadow-md border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="orchestrator-input">
            <CardContent className="p-5">
              <h2 className="text-base font-semibold text-foreground text-center mb-3">
                What should we work on?
              </h2>
              <div className="flex items-center gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                  <Input
                    placeholder="Ask Optro Assistant to run an assessment, generate a report, analyze a risk..."
                    className="pl-10 h-10 bg-slate-50 dark:bg-muted border-slate-200 dark:border-border"
                    data-testid="input-orchestrator"
                    onFocus={() => setAssistantOpen(true)}
                  />
                </div>
                <Button
                  className="bg-[#266C92] hover:bg-[#1e5a7a] text-white px-5"
                  data-testid="button-orchestrator-send"
                  onClick={() => setAssistantOpen(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>

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
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.iconBg}`}>
                      <Icon className={`w-5 h-5 ${cat.color}`} />
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

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {hubData.categories.map((cat) => (
                <CategorySection
                  key={cat.category}
                  category={cat}
                  sectionRef={(el) => { sectionRefs.current[cat.category] = el; }}
                />
              ))}
            </div>

            <div className="space-y-4">
              <Card className="border border-slate-200 dark:border-border" data-testid="hub-overview">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Orchestrator Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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

              <ActivityFeed entries={hubData.activityFeed} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
