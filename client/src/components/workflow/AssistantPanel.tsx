/**
 * AuditBoard Assistant Panel
 * 
 * AI-powered assistant for building workflows through natural language
 */

import { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, Sparkles, X, Check, Loader2, 
  PlusCircle, Trash2, Settings, Zap, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useWorkflowStore } from "@/lib/workflowStore";
import { useSettings } from "@/components/settings-panel";
import { apiRequest } from "@/lib/queryClient";
import { 
  type ChatMessage, 
  type AssistantAction,
  type WorkflowNode,
} from "@shared/schema";

interface ActionCardProps {
  action: AssistantAction;
  onApply: (action: AssistantAction) => void;
  onReject: (action: AssistantAction) => void;
  isPending: boolean;
}

function ActionCard({ action, onApply, onReject, isPending }: ActionCardProps) {
  const getActionIcon = () => {
    switch (action.type) {
      case "add_node":
        return <PlusCircle className="w-4 h-4 text-green-500" />;
      case "delete_node":
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case "update_node":
        return <Settings className="w-4 h-4 text-blue-500" />;
      case "connect_nodes":
        return <Zap className="w-4 h-4 text-purple-500" />;
      case "generate_workflow":
      case "batch_workflow":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <ChevronRight className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">{getActionIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{action.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {action.description}
            </p>
          </div>
        </div>
        {action.status === "pending" && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="default"
              onClick={() => onApply(action)}
              disabled={isPending}
              data-testid={`button-apply-action-${action.id}`}
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              <span className="ml-1">Apply</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReject(action)}
              disabled={isPending}
            >
              <X className="w-3 h-3" />
              <span className="ml-1">Dismiss</span>
            </Button>
          </div>
        )}
        {action.status === "applied" && (
          <Badge variant="secondary" className="mt-2 text-green-600">
            Applied
          </Badge>
        )}
        {action.status === "rejected" && (
          <Badge variant="secondary" className="mt-2 text-muted-foreground">
            Dismissed
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  assistantLabel?: string;
}

function MessageBubble({ message, assistantLabel = "AuditBoard Assistant" }: MessageBubbleProps) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`
          max-w-[85%] rounded-lg px-3 py-2
          ${isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
          }
        `}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <Bot className="w-3 h-3" />
            <span className="text-xs font-medium">{assistantLabel}</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs opacity-60 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit" 
          })}
        </p>
      </div>
    </div>
  );
}

interface AssistantPanelProps {
  workflowId: string | null;
  onApplyAction: (action: AssistantAction) => Promise<void>;
}

export function AssistantPanel({ workflowId, onApplyAction }: AssistantPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [applyingActionId, setApplyingActionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    suggestedActions,
    isAssistantLoading,
    addMessage,
    setSuggestedActions,
    updateActionStatus,
    setAssistantLoading,
    selectedNodeIds,
  } = useWorkflowStore();
  const apSettings = useSettings();
  const apAssistantName = apSettings.agentHubEnabled ? "Optro Assistant" : "AuditBoard Assistant";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isAssistantLoading) return;
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };
    
    addMessage(userMessage);
    setInputValue("");
    setAssistantLoading(true);
    
    try {
      const res = await apiRequest("POST", "/api/assistant/chat", {
        messages: [...messages, userMessage],
        workflowId,
        selectedNodeIds,
      });
      const response = await res.json();
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        intent: response.intent,
        actions: response.actions,
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
      setAssistantLoading(false);
    }
  };

  const handleApplyAction = async (action: AssistantAction) => {
    setApplyingActionId(action.id);
    try {
      await onApplyAction(action);
      updateActionStatus(action.id, "applied");
    } catch (error) {
      console.error("Failed to apply action:", error);
    } finally {
      setApplyingActionId(null);
    }
  };

  const handleRejectAction = (action: AssistantAction) => {
    updateActionStatus(action.id, "rejected");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Create a review workflow",
    "Add an approval step",
    "Connect to AuditBoard Issues",
    "Add error handling",
  ];

  return (
    <div className="h-full flex flex-col bg-background border-l">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{apAssistantName}</h3>
            <p className="text-xs text-muted-foreground">
              AI-powered workflow builder
            </p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-medium mb-2">How can I help you?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Describe your workflow needs and I&apos;ll help you build it.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(prompt)}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} assistantLabel={apAssistantName} />
        ))}
        
        {isAssistantLoading && (
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      {suggestedActions.length > 0 && (
        <>
          <Separator />
          <div className="p-3 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Suggested Actions
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {suggestedActions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onApply={handleApplyAction}
                  onReject={handleRejectAction}
                  isPending={applyingActionId === action.id}
                />
              ))}
            </div>
          </div>
        </>
      )}
      
      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Describe what you want to build..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAssistantLoading}
            className="flex-1"
            data-testid="input-assistant-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || isAssistantLoading}
            data-testid="button-send-message"
          >
            {isAssistantLoading ? (
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
