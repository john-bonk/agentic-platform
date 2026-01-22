import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Paperclip, Send, User, Calendar, FileText, Bot, CheckSquare } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  resources?: ResourceReference[];
}

interface ResourceReference {
  type: "Task" | "Report" | "Control" | "PDF" | "Document";
  title: string;
  assignee?: string;
  dueDate?: string;
  recipients?: string;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const getAIResponse = (userMessage: string): { content: string; resources?: ResourceReference[] } => {
  const lower = userMessage.toLowerCase();
  
  if (lower.includes("overdue")) {
    return {
      content: "You have 3 overdue tasks that need immediate attention. The highest priority is FIN-001 (Bank Reconciliation) which was due 2 days ago. I recommend addressing these first to prevent audit timeline delays.",
      resources: [
        { type: "Task", title: "Overdue Tasks Summary", assignee: "Jordan Mitchell", dueDate: "Overdue" }
      ]
    };
  }
  
  if (lower.includes("summary") || lower.includes("state") || lower.includes("sox testing")) {
    return {
      content: "Based on your current workload, Q1 SOX testing is 68% complete with 17 of 25 controls tested. 3 controls are overdue and require immediate attention. FIN-001 (Bank Reconciliation) is the highest priority.",
      resources: [
        { type: "Report", title: "Q1 SOX Testing Summary", recipients: "8 recipients" }
      ]
    };
  }
  
  if (lower.includes("evidence") || lower.includes("documentation")) {
    return {
      content: "Evidence collection is at 85%. 4 controls still need documentation: 2 require bank statements (due in 3 days), 1 needs system screenshots, and 1 is awaiting third-party confirmation.",
      resources: [
        { type: "Document", title: "Evidence Status Report", assignee: "Jordan Mitchell", dueDate: "01/25/26" }
      ]
    };
  }
  
  if (lower.includes("high-risk") || lower.includes("priority") || lower.includes("attention")) {
    return {
      content: "You have 3 high-risk controls requiring attention: Climate Change Mitigation, Supply Chain Traceability, and Regulatory Compliance Audits. I recommend prioritizing FIN-001 today.",
      resources: [
        { type: "Control", title: "High-Risk Controls Dashboard", assignee: "3 controls" }
      ]
    };
  }
  
  if (lower.includes("qa") || lower.includes("review") || lower.includes("testing completed")) {
    return {
      content: "I've analyzed the testing completed. 5 controls are pending QA review. The pass rate is 92% which exceeds the 90% target. No material exceptions were identified in the latest batch.",
      resources: [
        { type: "Report", title: "QA Review Summary", recipients: "Audit Committee" }
      ]
    };
  }
  
  if (lower.includes("task") || lower.includes("assign")) {
    return {
      content: "A task has been created for the assigned team member to complete the automated testing setup for 3 Controls: Climate Change Mitigation, Supply Chain Traceability, and Regulatory Compliance Audits.",
      resources: [
        { type: "Task", title: "Automated Control Testing", assignee: "Mark Stevens", dueDate: "12/31/25" }
      ]
    };
  }
  
  if (lower.includes("report") || lower.includes("slides") || lower.includes("executive")) {
    return {
      content: "Here is a summary report including risk exposure, audit strategy, and scenario results for your executive committee briefing.",
      resources: [
        { type: "Report", title: "Executive Audit Impact Summary", recipients: "8 recipients" }
      ]
    };
  }
  
  return {
    content: `I've analyzed your request about "${userMessage.slice(0, 50)}${userMessage.length > 50 ? "..." : ""}". Based on your current audit workload and control status, I can help you with specific actions. Would you like me to create a task, generate a report, or provide detailed analysis?`
  };
};

export function AIAssistantPanel({ isOpen, onClose, initialPrompt }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedInitialPrompt = useRef<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt !== processedInitialPrompt.current) {
      processedInitialPrompt.current = initialPrompt;
      
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: "user",
        content: initialPrompt,
        timestamp: new Date(),
      };
      
      setMessages([userMessage]);
      setIsTyping(true);
      
      setTimeout(() => {
        const response = getAIResponse(initialPrompt);
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: response.content,
          timestamp: new Date(),
          resources: response.resources,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 800);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    if (!isOpen) {
      processedInitialPrompt.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    setTimeout(() => {
      const response = getAIResponse(userMessage.content);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        resources: response.resources,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "Task": return CheckSquare;
      case "Report": return FileText;
      case "PDF": return FileText;
      default: return FileText;
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
          data-testid="ai-panel-overlay"
        />
      )}
      
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-background border-l shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="ai-assistant-panel"
      >
        <div className="flex items-center justify-between px-4 py-4 bg-[#3d6a7a] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/10">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-base">AuditBoard Audit Agent</h2>
              <p className="text-xs text-white/70">AI-powered help for Enterprise Risk</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onClose}
            data-testid="button-close-panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">Audit Agent</h3>
              <p className="text-sm text-muted-foreground">
                Ask me about your controls, testing progress, evidence status, or let me help you create tasks and reports.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {message.type === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {message.resources && message.resources.map((resource, idx) => {
                    const Icon = getResourceIcon(resource.type);
                    return (
                      <div
                        key={idx}
                        className="bg-purple-50 dark:bg-purple-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs text-purple-600 dark:text-purple-400">
                            {resource.type}
                          </span>
                        </div>
                        <p className="font-medium text-sm mb-2">{resource.title}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {resource.assignee && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {resource.assignee}
                              </span>
                            )}
                            {resource.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {resource.dueDate}
                              </span>
                            )}
                            {resource.recipients && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {resource.recipients}
                              </span>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-xs px-2"
                            data-testid={`button-view-resource-${idx}`}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 space-y-2">
          <div className="border rounded-lg overflow-hidden">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a prompt for Audit Agent"
              className="border-0 resize-none min-h-[80px] focus-visible:ring-0 text-sm"
              data-testid="input-panel-prompt"
            />
            <div className="flex items-center justify-between px-2 py-1.5 border-t bg-muted/30">
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  data-testid="button-attach-file"
                >
                  <Paperclip className="h-3.5 w-3.5 text-slate-500" />
                </Button>
              </div>
              <Button
                size="sm"
                className="h-6 text-xs px-3"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                data-testid="button-send-message"
              >
                Send
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-center text-muted-foreground">
            Content generated by AI. Verify responses before use
          </p>
        </div>
      </div>
    </>
  );
}
