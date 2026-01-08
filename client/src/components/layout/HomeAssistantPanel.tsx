/**
 * Home Assistant Panel
 * 
 * A generalized AI assistant panel for home pages and general navigation.
 * Adapted from the workflow AssistantPanel but context-aware for workspace actions.
 */

import { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, Sparkles, X, Loader2, 
  FileText, AlertTriangle, ClipboardList, 
  BarChart3, Users, Shield, ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useHomeAssistantStore, type ChatMessage, type SuggestedAction } from "@/lib/homeAssistantStore";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

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
              className="bg-[#266C92] hover:bg-[#1e5a7a]"
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

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`
          max-w-[85%] rounded-lg px-3 py-2
          ${isUser 
            ? "bg-[#266C92] text-white" 
            : "bg-slate-100 text-gray-900"
          }
        `}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <Bot className="w-3 h-3 text-[#266C92]" />
            <span className="text-xs font-medium text-[#266C92]">AuditBoard Assistant</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? "text-white/70" : "text-gray-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit" 
          })}
        </p>
      </div>
    </div>
  );
}

export function HomeAssistantPanel() {
  const [inputValue, setInputValue] = useState("");
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

  const getContextualPrompts = () => {
    switch (currentWorkspace.id) {
      case "enterprise-risk":
        return [
          "What are my open risk tasks?",
          "Show tariff mitigation status",
          "Create a risk assessment",
          "View risk dashboard",
        ];
      case "enterprise-audit":
        return [
          "Show M&A audit tasks",
          "What audits need attention?",
          "Create new audit finding",
          "View audit coverage",
        ];
      case "it-security":
        return [
          "Log4j remediation status",
          "Show security vulnerabilities",
          "Create security incident",
          "View compliance status",
        ];
      default:
        return [
          "What are my open tasks?",
          "Show dashboard overview",
          "Create new workflow",
          "Help me get started",
        ];
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
    setInputValue("");
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = getContextualPrompts();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent 
        side="right" 
        className="w-[400px] sm:w-[450px] p-0 flex flex-col"
        data-testid="home-assistant-panel"
      >
        <SheetHeader className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#266C92]/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#266C92]" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold text-gray-900">
                AuditBoard Assistant
              </SheetTitle>
              <p className="text-xs text-gray-500">
                AI-powered help for {currentWorkspace.name}
              </p>
            </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#266C92]/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-[#266C92]" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">How can I help you?</h4>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Ask me about your tasks, create new items, or get insights about your {currentWorkspace.name} workspace.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(prompt)}
                    className="text-xs border-slate-200 text-gray-600 hover:border-[#266C92] hover:text-[#266C92]"
                    data-testid={`quick-prompt-${prompt.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
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
            <div className="p-3 bg-slate-50">
              <p className="text-xs font-medium text-gray-500 mb-2">
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
        
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 border-slate-200 focus-visible:ring-[#266C92]"
              data-testid="input-home-assistant-message"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-[#266C92] hover:bg-[#1e5a7a]"
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
      </SheetContent>
    </Sheet>
  );
}
