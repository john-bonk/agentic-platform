/**
 * Home Assistant Panel
 * 
 * A non-modal overlay AI assistant panel for home pages and general navigation.
 * Workspace-aware with deep interactive quick actions.
 * 
 * Quick actions are imported from the centralized quickActionsConfig.ts
 * which serves as the single source of truth for the Prototype Meta View.
 */

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Send, Bot, Sparkles, X, Loader2, 
  FileText, AlertTriangle, ClipboardList, 
  BarChart3, Users, Shield, ChevronRight, ChevronDown,
  ExternalLink, Workflow, Plus, Search,
  TrendingUp, AlertCircle, CheckCircle2,
  Building2, Globe, Zap, Target, RefreshCcw,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useHomeAssistantStore, type ChatMessage, type SuggestedAction, type ResourceReference } from "@/lib/homeAssistantStore";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import { useSettings } from "@/components/settings-panel";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { getExperienceConfig } from "@/lib/reportingContent";
import { 
  genericQuickActions as configGenericActions,
  workspaceQuickActions as configWorkspaceActions,
  type QuickActionConfig 
} from "@/lib/quickActionsConfig";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  type: "workflow" | "navigate" | "create" | "analyze" | "report";
  workflowTemplate?: string;
  route?: string;
  color: string;
}

const iconMap: Record<string, LucideIcon> = {
  Plus, Target, BarChart3, FileText, Building2, Shield, Workflow,
  Globe, Users, Search, ClipboardList, Bot, Sparkles, AlertTriangle,
  ExternalLink, TrendingUp, AlertCircle, CheckCircle2, Zap
};

function mapConfigToQuickAction(config: QuickActionConfig): QuickAction {
  return {
    id: config.id,
    label: config.label,
    description: config.description,
    icon: iconMap[config.iconName] || Bot,
    type: config.type,
    workflowTemplate: config.workflowTemplate,
    route: config.route,
    color: config.color,
  };
}

const genericQuickActions: QuickAction[] = configGenericActions.map(mapConfigToQuickAction);

const workspaceQuickActions: Record<string, QuickAction[]> = Object.fromEntries(
  Object.entries(configWorkspaceActions).map(([wsId, actions]) => [
    wsId,
    actions.map(mapConfigToQuickAction)
  ])
);

interface ActionCardProps {
  action: SuggestedAction;
  onApply: (action: SuggestedAction) => void;
  onDismiss: (action: SuggestedAction) => void;
}

function ActionCard({ action, onApply, onDismiss }: ActionCardProps) {
  const getActionIcon = () => {
    switch (action.type) {
      case "navigate":
        return <ExternalLink className="w-4 h-4 text-blue-500" />;
      case "create_risk":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "create_audit":
        return <ClipboardList className="w-4 h-4 text-green-500" />;
      case "view_report":
        return <BarChart3 className="w-4 h-4 text-purple-500" />;
      case "assign_task":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "security_review":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "workflow":
        return <Workflow className="w-4 h-4 text-[#266C92]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#266C92]" />;
    }
  };

  return (
    <Card className="border-dashed border-slate-200">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">{getActionIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-foreground">{action.label}</p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{action.description}</p>
          </div>
        </div>
        {action.status === "pending" && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              className="bg-[#266C92]"
              onClick={() => onApply(action)}
              data-testid={`button-apply-action-${action.id}`}
            >
              <ChevronRight className="w-3 h-3 mr-1" />
              Go
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(action)}
            >
              <X className="w-3 h-3 mr-1" />
              Dismiss
            </Button>
          </div>
        )}
        {action.status === "applied" && (
          <Badge variant="secondary" className="mt-2 text-green-600 bg-green-50">
            Completed
          </Badge>
        )}
        {action.status === "dismissed" && (
          <Badge variant="secondary" className="mt-2 text-gray-500">
            Dismissed
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

interface ResourceCardProps {
  resource: ResourceReference;
  onNavigate?: (route: string) => void;
}

function ResourceCard({ resource, onNavigate }: ResourceCardProps) {
  const getResourceIcon = () => {
    switch (resource.type) {
      case "Task":
        return <ClipboardList className="w-4 h-4 text-blue-500" />;
      case "Report":
        return <FileText className="w-4 h-4 text-purple-500" />;
      case "Control":
        return <Shield className="w-4 h-4 text-green-500" />;
      case "Risk":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (resource.status?.toLowerCase()) {
      case "failed":
      case "blocked":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "in progress":
      case "remediation":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "passed":
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-muted dark:text-muted-foreground";
    }
  };

  return (
    <div 
      className="flex items-start gap-2 p-2 bg-white dark:bg-card rounded-md border border-slate-200 dark:border-border hover-elevate cursor-pointer"
      onClick={() => resource.route && onNavigate?.(resource.route)}
      data-testid={`resource-card-${resource.id || resource.title}`}
    >
      <div className="mt-0.5 flex-shrink-0">{getResourceIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">{resource.title}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {resource.status && (
            <Badge variant="secondary" className={`text-xs ${getStatusColor()}`}>
              {resource.status}
            </Badge>
          )}
          {resource.dueDate && (
            <span className="text-xs text-gray-500 dark:text-muted-foreground">Due: {resource.dueDate}</span>
          )}
          {resource.assignee && (
            <span className="text-xs text-gray-500 dark:text-muted-foreground">• {resource.assignee}</span>
          )}
        </div>
      </div>
      {resource.route && (
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onResourceNavigate?: (route: string) => void;
  assistantLabel: string;
}

function MessageBubble({ message, onResourceNavigate, assistantLabel }: MessageBubbleProps) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`
          max-w-[85%] rounded-lg px-3 py-2
          ${isUser 
            ? "bg-[#266C92] text-white" 
            : "bg-slate-100 dark:bg-muted text-gray-900 dark:text-foreground"
          }
        `}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <Bot className="w-3 h-3 text-[#266C92]" />
            <span className="text-xs font-medium text-[#266C92]">{assistantLabel}</span>
          </div>
        )}
        <div className={`text-sm max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&_strong]:font-semibold ${
          isUser 
            ? "text-white [&_p]:text-white [&_li]:text-white [&_strong]:text-white [&_em]:text-white [&_a]:text-white/80 [&_a]:underline [&_code]:text-white/90" 
            : "prose prose-sm dark:prose-invert text-gray-900 dark:text-foreground"
        }`}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        {!isUser && message.resources && message.resources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-muted-foreground">Related Items:</p>
            {message.resources.map((resource, idx) => (
              <ResourceCard 
                key={`${resource.id || resource.title}-${idx}`}
                resource={resource}
                onNavigate={onResourceNavigate}
              />
            ))}
          </div>
        )}
        
        <p className={`text-xs mt-1 ${isUser ? "text-white/70" : "text-gray-400 dark:text-muted-foreground"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit" 
          })}
        </p>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  action: QuickAction;
  onExecute: (action: QuickAction) => void;
}

function QuickActionCard({ action, onExecute }: QuickActionCardProps) {
  const Icon = action.icon;
  
  return (
    <button
      onClick={() => onExecute(action)}
      className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-border hover:border-[#266C92] dark:hover:border-[#266C92] hover:bg-slate-50 dark:hover:bg-muted transition-all group"
      data-testid={`quick-action-${action.id}`}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800/30"
        >
          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-foreground group-hover:text-[#266C92]">
            {action.label}
          </p>
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 line-clamp-2">
            {action.description}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-muted-foreground group-hover:text-[#266C92] flex-shrink-0 mt-0.5" />
      </div>
    </button>
  );
}

function QuickActionsSection({ quickActions, isAgentHub, onExecute }: { quickActions: QuickAction[]; isAgentHub: boolean; onExecute: (action: QuickAction) => void }) {
  const [moreOpen, setMoreOpen] = useState(false);

  if (!isAgentHub) {
    return (
      <div className="space-y-2">
        {quickActions.map((action) => (
          <QuickActionCard key={action.id} action={action} onExecute={onExecute} />
        ))}
      </div>
    );
  }

  const primary = quickActions.find((a) => a.id === "risk-assessment" || a.id === "control-testing");
  const secondary = quickActions.filter((a) => a.id !== "risk-assessment" && a.id !== "control-testing");

  return (
    <div className="space-y-2">
      {primary && <QuickActionCard action={primary} onExecute={onExecute} />}
      {secondary.length > 0 && (
        <div>
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 px-1"
            data-testid="toggle-more-actions"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "" : "-rotate-90"}`} />
            <span>More actions</span>
          </button>
          {moreOpen && (
            <div className="space-y-2 mt-1">
              {secondary.map((action) => (
                <QuickActionCard key={action.id} action={action} onExecute={onExecute} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface InteractiveExperienceProps {
  type: string;
  workspaceId: string;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

function InteractiveExperience({ type, workspaceId, onClose, onNavigate }: InteractiveExperienceProps) {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const experience = getExperienceConfig(workspaceId, type);

  useEffect(() => {
    if (!experience) return;
    
    let currentStep = 0;
    const runSteps = async () => {
      for (const stepConfig of experience.steps) {
        await new Promise(resolve => setTimeout(resolve, stepConfig.duration));
        currentStep++;
        setStep(currentStep);
      }
      setCompleted(true);
    };
    
    runSteps();
  }, [experience]);

  if (!experience) {
    return (
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-800">Experience Not Available</span>
        </div>
        <p className="text-sm text-amber-700 mb-3">
          This action type ({type}) is not yet configured for {workspaceId}.
        </p>
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 dark:bg-muted rounded-lg border border-slate-200 dark:border-border" data-testid="interactive-experience">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-foreground">{experience.title}</h4>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4">{experience.description}</p>
      
      <div className="space-y-2 mb-4">
        {experience.steps.map((stepConfig, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {idx < step ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : idx === step && !completed ? (
              <Loader2 className="w-4 h-4 text-[#266C92] animate-spin flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0" />
            )}
            <span className={`text-sm ${idx <= step ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
              {stepConfig.label}
            </span>
          </div>
        ))}
      </div>

      {completed && (
        <div className="bg-white p-3 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">{experience.result}</p>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  className="bg-[#266C92]"
                  onClick={() => onNavigate(experience.destination)}
                  data-testid="button-view-results"
                >
                  {experience.destinationLabel}
                </Button>
                <Button size="sm" variant="outline" onClick={onClose} data-testid="button-close-experience">
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BuildingReportState {
  active: boolean;
  deckKey: string;
  step: number;
  isCustomQuery?: boolean;
  reportResult?: { title: string; reportId: string; sections: any[] } | null;
  error?: boolean;
}

const reportBuildSteps = [
  { label: "Querying data sources...", duration: 800 },
  { label: "Analyzing metrics and KPIs...", duration: 1000 },
  { label: "Generating visualizations...", duration: 900 },
  { label: "Compiling executive summary...", duration: 1100 },
  { label: "Finalizing presentation...", duration: 700 },
];

export function HomeAssistantPanel() {
  const [inputValue, setInputValue] = useState("");
  const [activeExperience, setActiveExperience] = useState<string | null>(null);
  const [buildingReport, setBuildingReport] = useState<BuildingReportState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidecarTimers = useRef<number[]>([]);
  const [, setLocation] = useLocation();
  
  const {
    isOpen,
    setOpen,
    messages,
    suggestedActions,
    isLoading,
    addMessage,
    setSuggestedActions,
    updateActionStatus,
    setLoading,
    clearChat,
  } = useHomeAssistantStore();

  const settings = useSettings();
  const assistantName = settings.agentHubEnabled ? "Optro Assistant" : "AuditBoard Assistant";

  const { currentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (buildingReport?.active && buildingReport.step < reportBuildSteps.length) {
      const timer = setTimeout(() => {
        setBuildingReport(prev => prev ? { ...prev, step: prev.step + 1 } : null);
      }, reportBuildSteps[buildingReport.step].duration);
      return () => clearTimeout(timer);
    }
    if (buildingReport?.active && buildingReport.step >= reportBuildSteps.length && buildingReport.reportResult) {
      const report = buildingReport.reportResult;
      addMessage({
        id: `msg-${Date.now()}-report`,
        role: "assistant",
        content: `I've generated a comprehensive report: **${report.title}**\n\nThe report includes ${report.sections.length} sections with detailed analysis and visualizations. Click the report card below to view the full report.`,
        timestamp: new Date().toISOString(),
        resources: [{
          type: "Report",
          title: report.title,
          id: report.reportId,
          status: "Generated",
          route: `/reporting/generated/${report.reportId}`,
        }],
      });
      setBuildingReport(null);
    }
    if (buildingReport?.active && buildingReport.step >= reportBuildSteps.length && buildingReport.error) {
      addMessage({
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: "I encountered an error generating the report. Please try again.",
        timestamp: new Date().toISOString(),
      });
      setBuildingReport(null);
    }
  }, [buildingReport]);

  const quickActions = currentWorkspace.isCustom 
    ? genericQuickActions 
    : settings.agentHubEnabled && settings.agentHubScenario === "fieldwork-automation" && currentWorkspace.id === "enterprise-risk"
      ? (workspaceQuickActions["enterprise-risk-fieldwork"] || workspaceQuickActions["enterprise-risk"])
      : (workspaceQuickActions[currentWorkspace.id] || workspaceQuickActions["enterprise-risk"]);

  const isReportRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    // Check for action verbs followed eventually by "report"
    const actionVerbs = ["create", "generate", "make", "build", "write", "produce", "prepare", "draft", "compile"];
    const hasActionVerb = actionVerbs.some(verb => lower.includes(verb));
    const hasReport = lower.includes("report");
    return hasActionVerb && hasReport;
  };

  const handleGenerateReport = async (prompt: string) => {
    setBuildingReport({ active: true, deckKey: "generated", step: 0, isCustomQuery: true });
    
    try {
      const res = await apiRequest("POST", "/api/generate-report", { prompt });
      const report = await res.json();
      
      setBuildingReport(prev => prev ? { ...prev, reportResult: report } : null);
    } catch (error) {
      console.error("Report generation error:", error);
      setBuildingReport(prev => prev ? { ...prev, error: true } : null);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };
    
    addMessage(userMessage);
    const messageText = inputValue.trim();
    setInputValue("");
    
    if (isReportRequest(messageText)) {
      await handleGenerateReport(messageText);
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await apiRequest("POST", "/api/assistant/home-chat", {
        messages: [...messages, userMessage],
        workspaceId: currentWorkspace.id,
        context: "home",
      });
      const response = await res.json();
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        resources: response.resources,
      };
      
      addMessage(assistantMessage);
      
      if (response.actions && response.actions.length > 0) {
        setSuggestedActions(response.actions);
      }
    } catch (error) {
      console.error("Assistant error:", error);
      addMessage({
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAction = (action: SuggestedAction) => {
    updateActionStatus(action.id, "applied");
    if (action.route) {
      setLocation(action.route);
      setOpen(false);
    }
  };

  const handleDismissAction = (action: SuggestedAction) => {
    updateActionStatus(action.id, "dismissed");
  };

  useEffect(() => {
    if (!settings.agentHubEnabled) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.blockId) return;
      const blockId = detail.blockId as string;

      const sidecarMessages: Record<string, { content: string; delay: number }> = {
        "synthesis": {
          delay: 800,
          content: "I'm scanning your company profile, historical assessments, and real-time risk signals now. I'll surface everything relevant so we can make an informed decision on the assessment approach.",
        },
        "synthesis-complete": {
          delay: 600,
          content: "Analysis complete. I found **6 key signals** that should shape this assessment:\n\n- Your last cycle was **147 days ago** — peer companies assess quarterly\n- **34 controls** lack recent test results (12 high-priority)\n- **3 regulatory changes** and **2 vendor alerts** detected since last cycle\n- **7 KRIs** have breached tolerance thresholds\n- **42 risk items** can be auto-scored from existing data — no survey needed\n- **47 items** will require human input via distributed surveys\n\nReview the templates I've prepared and select the approach that fits your needs.",
        },
        "template-selection-complete": {
          delay: 500,
          content: "Good choice. I've pre-populated the assessment parameters based on your selection and our historical patterns. Review and adjust anything before we lock it in.",
        },
        "baseline-params-complete": {
          delay: 500,
          content: "Parameters confirmed. I've auto-assembled the distribution list by mapping your org hierarchy to the **47 survey items**. Each location gets a primary assignee and a reviewer.\n\nThe **42 auto-assessable items** will be scored by me in parallel once you approve — no human involvement needed for those.",
        },
        "distribution-complete": {
          delay: 600,
          content: "Distribution approved. Here's what's happening now:\n\n**Auto-assessment track:** I'm scoring 42 risk items using existing control test results, KRI data, and incident history. This runs in parallel — no waiting.\n\n**Survey track:** Assessment questionnaires are being sent to 12 locations across 3 regions. Responses will come in asynchronously over the coming days. I'll track progress, send reminders at 48hr and 72hr marks, and notify you at key milestones.\n\nYou don't need to stay on this screen — I'll keep working in the background.",
        },
        "tracking-complete": {
          delay: 500,
          content: "All done. **89 total risk items** have been assessed:\n- **42** auto-scored from existing data sources (control tests, KRI feeds, incident logs)\n- **47** collected via survey responses across 12 locations\n\nI've consolidated everything into a unified view. You can now generate the risk register, run trend analysis, create heat maps, or draft the board report. What would you like to do next?",
        },
        "control-selection": {
          delay: 800,
          content: "I've loaded the **master controls register** with all SOX controls in scope. You can select which controls to include in this testing cycle — or keep them all selected for a full-scope run.\n\nI've pre-checked all 25 controls. Uncheck any you want to exclude.",
        },
        "control-selection-complete": {
          delay: 500,
          content: "Control selection locked in. Now let's configure the data source connections — I'll map each control to its source system and identify which ones can be tested automatically vs. those needing PBC requests.",
        },
        "data-sources": {
          delay: 600,
          content: "I'm mapping your **7 connected systems** to the selected controls. Each system connection determines whether a control can be tested automatically or needs manual evidence via PBC.\n\nReview the coverage — you can toggle individual systems on or off.",
        },
        "data-sources-complete": {
          delay: 500,
          content: "Data sources confirmed. I've identified the split:\n\n- **Automated:** Controls connected to SAP ERP, Okta, ServiceNow, AWS, Genetec, Coupa, and CrowdStrike will be tested automatically\n- **PBC Workflow:** Remaining controls need manual evidence collection from control owners\n\nLet's map the PBC owners for the manual controls.",
        },
        "pbc-mapping": {
          delay: 600,
          content: "I've auto-mapped **PBC owners** based on the master controls register. Each manual control has a designated Control Owner and PBC Owner who will receive evidence requests.\n\nReview the mapping — you can expand each section to verify assignments before confirming.",
        },
        "pbc-mapping-complete": {
          delay: 500,
          content: "PBC mapping confirmed. I'm now initializing **parallel agentic workflows** for all selected controls. Automated controls will begin extracting populations immediately. PBC requests are being distributed to mapped owners.\n\nYou can monitor progress on the hub dashboard — I'll work in the background.",
        },
        "fieldwork-execution": {
          delay: 800,
          content: "All control workflows are now **running in parallel**. Here's what's happening:\n\n- **Automated controls:** Agents are extracting populations, applying sampling methodologies, collecting evidence, and executing test procedures\n- **PBC controls:** Evidence requests have been sent — I'm tracking responses and will process each as it arrives\n\nI'll surface any exceptions or findings that need your attention.",
        },
        "fieldwork-execution-complete": {
          delay: 600,
          content: "All control testing workflows are **complete**. Every control has been through the full pipeline — population extraction, sampling, evidence collection, and testing.\n\nCheck the hub dashboard for a summary of findings, exceptions, and next steps. You can generate workpapers or export results from the actions panel.",
        },
      };

      const msg = sidecarMessages[blockId];
      if (!msg) return;

      const timerId = window.setTimeout(() => {
        addMessage({
          id: `msg-sidecar-${blockId}-${Date.now()}`,
          role: "assistant",
          content: msg.content,
          timestamp: new Date().toISOString(),
        });
      }, msg.delay);
      sidecarTimers.current.push(timerId);
    };

    window.addEventListener("workflow-session:block-event", handler);
    return () => {
      window.removeEventListener("workflow-session:block-event", handler);
      sidecarTimers.current.forEach((t) => clearTimeout(t));
      sidecarTimers.current = [];
    };
  }, [settings.agentHubEnabled, addMessage]);

  useEffect(() => {
    if (!settings.agentHubEnabled) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.workflowId === "control-testing") {
        clearChat();
        addMessage({
          id: `msg-sidecar-init-${Date.now()}`,
          role: "assistant",
          content: "Launching **Automated Control Testing** workflow. I'll guide you through selecting controls, configuring data sources, mapping PBC owners, and then orchestrate parallel agentic workflows across all selected controls.\n\nLet's start by selecting which controls from the master register to include in this testing cycle.",
          timestamp: new Date().toISOString(),
        });
        setOpen(true);
      } else if (detail?.workflowId === "risk-assessment") {
        clearChat();
        addMessage({
          id: `msg-sidecar-init-${Date.now()}`,
          role: "assistant",
          content: "Starting **Risk Assessment** workflow. I'll be working alongside you through each step — analyzing signals, recommending approaches, and handling the heavy lifting.\n\nLet me begin by synthesizing all available data points to inform our assessment strategy.",
          timestamp: new Date().toISOString(),
        });
        setOpen(true);
      }
    };
    window.addEventListener("agent-hub:launch-workflow", handler);
    return () => window.removeEventListener("agent-hub:launch-workflow", handler);
  }, [settings.agentHubEnabled, addMessage, clearChat, setOpen]);

  const handleQuickAction = async (action: QuickAction) => {
    if (settings.agentHubEnabled && (action.id === "control-testing" || action.id === "risk-assessment")) {
      window.dispatchEvent(new CustomEvent("agent-hub:launch-workflow", { detail: { workflowId: action.id } }));
      return;
    }
    if (action.type === "workflow") {
      try {
        const res = await apiRequest("POST", "/api/workflows", {
          name: action.label.replace("Create ", ""),
          description: action.description,
          templateId: action.workflowTemplate,
        });
        const workflow = await res.json();
        setOpen(false);
        setLocation(`/workflow/${workflow.id}`);
      } catch (error) {
        console.error("Failed to create workflow:", error);
      }
    } else if (action.type === "navigate" && action.route) {
      setOpen(false);
      setLocation(action.route);
    } else if (action.type === "report") {
      const deckKey = action.id.includes("board") ? "board-report" 
        : action.id.includes("audit-committee") ? "audit-committee-report"
        : action.id.includes("compliance") ? "compliance-report"
        : "board-report";
      setBuildingReport({ active: true, deckKey, step: 0 });
    } else if (action.type === "analyze" || action.type === "create") {
      setActiveExperience(action.type);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed right-0 top-0 bottom-0 w-[420px] bg-white dark:bg-card shadow-xl border-l border-slate-200 dark:border-border flex flex-col z-50 overflow-hidden"
      data-testid="home-assistant-panel"
    >
        <div className="h-12 px-3 flex items-center justify-between bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-white">
              {assistantName}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-gray-400 w-9 h-9"
              onClick={() => {
                clearChat();
                setActiveExperience(null);
                setBuildingReport(null);
                setInputValue("");
              }}
              data-testid="button-refresh-assistant"
              title="Reset chat"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-gray-400 w-9 h-9"
              onClick={() => setOpen(false)}
              data-testid="button-close-assistant"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && !activeExperience && !buildingReport && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#266C92]/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-[#266C92]" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-foreground mb-1">How can I help you?</h4>
                <p className="text-sm text-gray-500 dark:text-muted-foreground max-w-xs mx-auto">
                  Quick actions for {currentWorkspace.name}
                </p>
              </div>
              
              <QuickActionsSection
                quickActions={quickActions}
                isAgentHub={settings.agentHubEnabled}
                onExecute={handleQuickAction}
              />
            </div>
          )}

          {activeExperience && (
            <InteractiveExperience
              type={activeExperience}
              workspaceId={currentWorkspace.id}
              onClose={() => setActiveExperience(null)}
              onNavigate={(route) => {
                setActiveExperience(null);
                setOpen(false);
                setLocation(route);
              }}
            />
          )}

          {buildingReport && (
            <div className="bg-slate-50 dark:bg-muted rounded-lg p-4 space-y-4" data-testid="building-report-block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#266C92]/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#266C92]" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-foreground">Building Report</h4>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">Generating presentation slides...</p>
                </div>
              </div>

              <div className="space-y-2">
                {reportBuildSteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                      idx < buildingReport.step 
                        ? "text-green-600" 
                        : idx === buildingReport.step 
                          ? "text-[#266C92]" 
                          : "text-gray-400"
                    }`}
                  >
                    {idx < buildingReport.step ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : idx === buildingReport.step ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>

              {buildingReport.step >= reportBuildSteps.length && buildingReport.isCustomQuery && !buildingReport.reportResult && !buildingReport.error && (
                <div className="flex items-center gap-2 text-sm text-[#266C92]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizing report data...</span>
                </div>
              )}

              {buildingReport.step >= reportBuildSteps.length && !buildingReport.isCustomQuery && (
                <div className="bg-white dark:bg-card p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-foreground">Report generated successfully. Your presentation is ready to view.</p>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          className="bg-[#266C92]"
                          onClick={() => {
                            setOpen(false);
                            setLocation(`/reporting/view/${buildingReport.deckKey}`);
                            setBuildingReport(null);
                          }}
                          data-testid="button-open-report"
                        >
                          Open Report
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setBuildingReport(null)}
                          data-testid="button-close-building"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              assistantLabel={assistantName}
              onResourceNavigate={(route) => {
                setOpen(false);
                setLocation(route);
              }} 
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#266C92]" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        {suggestedActions.filter(a => a.status === "pending").length > 0 && (
          <>
            <Separator />
            <div className="p-3 bg-slate-50 dark:bg-muted">
              <p className="text-xs font-medium text-gray-500 dark:text-muted-foreground mb-2">
                Suggested Actions
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {suggestedActions.filter(a => a.status === "pending").map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onApply={handleApplyAction}
                    onDismiss={handleDismissAction}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        
        <div className="p-4 border-t border-slate-200 dark:border-border bg-white dark:bg-card">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 border-slate-200 dark:border-border focus-visible:ring-[#266C92]"
              data-testid="input-home-assistant-message"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-[#266C92]"
              data-testid="button-home-assistant-send"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
    </div>
  );
}
