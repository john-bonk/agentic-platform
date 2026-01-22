import { useEffect, useState } from "react";
import { WelcomeHeader } from "@/components/home/welcome-header";
import { GanttTimeline } from "@/components/home/gantt-timeline";
import { JumpBackIn } from "@/components/home/jump-back-in";
import { OutstandingTasks } from "@/components/home/outstanding-tasks";
import { InsightsFeed } from "@/components/home/insights-feed";
import { InsightsCharts } from "@/components/home/insights-charts";
import { WorkflowsLibrary } from "@/components/home/workflows-library";
import { AuditAgent } from "@/components/home/audit-agent";
import { QuickActions } from "@/components/home/quick-actions";
import { AISummary } from "@/components/home/ai-summary";
import { AIAssistantPanel } from "@/components/home/ai-assistant-panel";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiPanelPrompt, setAIPanelPrompt] = useState<string | undefined>();

  const handleOpenAIPanel = (prompt: string) => {
    setAIPanelPrompt(prompt);
    setIsAIPanelOpen(true);
  };

  const handleCloseAIPanel = () => {
    setIsAIPanelOpen(false);
    setAIPanelPrompt(undefined);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.querySelector("[data-testid='input-task-search']") as HTMLInputElement;
        searchInput?.focus();
        toast({ title: "Search", description: "Press / to search tasks" });
      }
      
      if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const settingsBtn = document.querySelector("[data-testid='button-settings']") as HTMLButtonElement;
        settingsBtn?.click();
      }
      
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const addBtn = document.querySelector("[data-testid='button-add-work-item']") as HTMLButtonElement;
        addBtn?.click();
      }

      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        toast({
          title: "Keyboard Shortcuts",
          description: "/ Search | S Settings | N New Item | ? Help",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toast]);

  return (
    <div className="flex flex-col h-full bg-background">
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-5 lg:px-6 pb-8 page-transition">
          <WelcomeHeader />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-5 h-auto p-0 bg-transparent border-b border-border rounded-none w-full justify-start gap-6">
              <TabsTrigger 
                value="overview" 
                data-testid="tab-overview"
                className="px-0 pb-2.5 pt-0 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                data-testid="tab-insights"
                className="px-0 pb-2.5 pt-0 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium flex items-center gap-2"
              >
                Insights
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
                  New
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="workflows" 
                data-testid="tab-workflows"
                className="px-0 pb-2.5 pt-0 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                Workflows
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 space-y-5">
              <AISummary onNavigateToInsights={() => setActiveTab("insights")} />
              <GanttTimeline />

              <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-5">
                  <JumpBackIn />
                  <OutstandingTasks />
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <AuditAgent onOpenPanel={handleOpenAIPanel} />
                  <QuickActions />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0 space-y-5">
              <InsightsCharts />
              <InsightsFeed onOpenPanel={handleOpenAIPanel} />
            </TabsContent>

            <TabsContent value="workflows" className="mt-0 space-y-5">
              <WorkflowsLibrary />
            </TabsContent>
          </Tabs>

          <div className="fixed bottom-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M50 10 L50 25 M50 75 L50 90 M10 50 L25 50 M75 50 L90 50" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </main>

      <AIAssistantPanel 
        isOpen={isAIPanelOpen}
        onClose={handleCloseAIPanel}
        initialPrompt={aiPanelPrompt}
      />
    </div>
  );
}
