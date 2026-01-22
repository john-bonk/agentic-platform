import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, Sparkles, History, Wand2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import type { Report } from "@shared/schema";

const STORAGE_KEY = "audit-agent-recent-commands";
const MAX_RECENT = 5;

interface AuditAgentProps {
  onOpenPanel?: (prompt: string) => void;
}

const promptLibrary = [
  "Give me a summary of the current state of SOX testing",
  "Are all the evidence requests completed?",
  "Is the testing process followed correctly?",
  "Is there enough evidence to start testing?",
  "Which high-risk controls need attention?"
];

// Check if prompt should trigger report generation
function shouldGenerateReport(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  return lowerPrompt.includes('report') || lowerPrompt.includes('summary');
}

export function AuditAgent({ onOpenPanel }: AuditAgentProps) {
  const [query, setQuery] = useState("");
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentCommands(JSON.parse(stored));
      } catch {
        setRecentCommands([]);
      }
    }
  }, []);

  const generateReportMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/generate-report", { prompt });
      return response.json() as Promise<Report>;
    },
    onSuccess: (report) => {
      navigate(`/report/${report.reportId}`);
    },
  });

  const saveRecentCommand = (command: string) => {
    const updated = [command, ...recentCommands.filter(c => c !== command)].slice(0, MAX_RECENT);
    setRecentCommands(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || generateReportMutation.isPending) return;
    
    const trimmedQuery = query.trim();
    saveRecentCommand(trimmedQuery);
    
    if (shouldGenerateReport(trimmedQuery)) {
      generateReportMutation.mutate(trimmedQuery);
    } else if (onOpenPanel) {
      onOpenPanel(trimmedQuery);
    }
    setQuery("");
  };

  const handlePromptClick = (prompt: string) => {
    if (generateReportMutation.isPending) return;
    saveRecentCommand(prompt);
    
    if (shouldGenerateReport(prompt)) {
      generateReportMutation.mutate(prompt);
    } else if (onOpenPanel) {
      onOpenPanel(prompt);
    }
  };

  return (
    <Card className="p-5 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="p-3 rounded-xl bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </div>
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            Ask Your Audit Agent
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h2>
          <p className="text-sm text-muted-foreground">Get instant answers and actions on your audit program</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={generateReportMutation.isPending ? "Generating report..." : "Ask about controls, testing, evidence..."}
          className="flex-1"
          disabled={generateReportMutation.isPending}
          data-testid="input-audit-agent"
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0 h-9 w-9"
          disabled={!query.trim() || generateReportMutation.isPending}
          data-testid="button-submit-query"
        >
          {generateReportMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Prompt Library
          </p>
          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    data-testid="button-view-history"
                  >
                    <History className="h-3.5 w-3.5" />
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>View prompt history</p>
              </TooltipContent>
            </Tooltip>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Prompt History
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {recentCommands.length > 0 ? (
                  recentCommands.map((cmd, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full flex items-center gap-2 px-2 py-2 text-left text-sm rounded-md hover:bg-muted transition-colors duration-200 group"
                      onClick={() => handlePromptClick(cmd)}
                      data-testid={`history-item-${i}`}
                    >
                      <Wand2 className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors shrink-0" />
                      <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                        {cmd}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No prompt history yet. Start asking questions!
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-1">
          {promptLibrary.slice(0, 4).map((prompt, i) => (
            <button
              key={i}
              type="button"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm rounded-md hover:bg-muted/60 transition-colors duration-200 group"
              onClick={() => handlePromptClick(prompt)}
              data-testid={`prompt-library-${i}`}
            >
              <Wand2 className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors shrink-0" />
              <span className="truncate text-foreground/80 group-hover:text-foreground transition-colors">
                {prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
