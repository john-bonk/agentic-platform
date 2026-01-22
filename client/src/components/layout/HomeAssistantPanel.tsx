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
  BarChart3, Users, Shield, ChevronRight,
  ExternalLink, Workflow, Plus, Search,
  TrendingUp, AlertCircle, CheckCircle2,
  Building2, Globe, Zap, Target,
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
            <p className="text-sm font-medium text-gray-900">{action.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
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
}

function MessageBubble({ message, onResourceNavigate }: MessageBubbleProps) {
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
            <span className="text-xs font-medium text-[#266C92]">AuditBoard Assistant</span>
          </div>
        )}
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&_strong]:font-semibold">
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
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${action.color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color: action.color }} />
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
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200" data-testid="interactive-experience">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{experience.title}</h4>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">{experience.description}</p>
      
      <div className="space-y-2 mb-4">
        {experience.steps.map((stepConfig, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {idx < step ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : idx === step && !completed ? (
              <Loader2 className="w-4 h-4 text-[#266C92] animate-spin flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
            )}
            <span className={`text-sm ${idx <= step ? "text-gray-700" : "text-gray-400"}`}>
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
  } = useHomeAssistantStore();

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
  }, [buildingReport]);

  const quickActions = currentWorkspace.isCustom 
    ? genericQuickActions 
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
    setBuildingReport({ active: true, deckKey: "generated", step: 0 });
    
    try {
      const res = await apiRequest("POST", "/api/generate-report", { prompt });
      const report = await res.json();
      
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
    } catch (error) {
      console.error("Report generation error:", error);
      setBuildingReport(null);
      addMessage({
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: "I encountered an error generating the report. Please try again.",
        timestamp: new Date().toISOString(),
      });
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

  const handleQuickAction = async (action: QuickAction) => {
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
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setOpen(false)}
        data-testid="home-assistant-backdrop"
      />
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
              AuditBoard Assistant
            </h3>
          </div>
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
              
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <QuickActionCard
                    key={action.id}
                    action={action}
                    onExecute={handleQuickAction}
                  />
                ))}
              </div>
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

              {buildingReport.step >= reportBuildSteps.length && (
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
    </>
  );
}
