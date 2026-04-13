import { useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Zap,
  FileText,
  ArrowRight,
  X,
  Database,
  Users,
  Search,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { masterControlsList } from "@/components/workspace/WorkflowSession";
import { useWorkflowSessionStore } from "@/lib/workflowSessionStore";
import { launchControlTestingWorkflow } from "@/lib/controlTestingLauncher";

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Input Readiness Assessment",
    description: "Validate data source connectivity, verify control metadata, and confirm testing prerequisites are met.",
    icon: Database,
  },
  {
    step: 2,
    title: "Population Request & Extraction",
    description: "Extract full transaction populations from connected systems or issue PBC requests to control owners.",
    icon: FileText,
  },
  {
    step: 3,
    title: "Sample Selection",
    description: "Apply risk-based sampling methodology to select representative items for detailed testing.",
    icon: Search,
  },
  {
    step: 4,
    title: "Evidence Collection",
    description: "Gather supporting documentation from connected systems or through PBC owner responses.",
    icon: ClipboardCheck,
  },
  {
    step: 5,
    title: "Testing & Annotation",
    description: "Execute control test procedures, annotate evidence with findings, and flag exceptions.",
    icon: Shield,
  },
  {
    step: 6,
    title: "Effectiveness Determination",
    description: "Evaluate attribute pass rates and determine overall control effectiveness classification.",
    icon: BarChart3,
  },
];

export default function TestingPlanPage() {
  const [, setLocation] = useLocation();
  const addProject = useWorkflowSessionStore((s) => s.addProject);
  const setCurrentSession = useWorkflowSessionStore((s) => s.setCurrentSession);
  const activeProjects = useWorkflowSessionStore((s) => s.activeProjects);

  const stats = useMemo(() => {
    const connected = masterControlsList.filter((c) => c.dataSource === "connected").length;
    const manual = masterControlsList.filter((c) => c.dataSource === "manual").length;
    const critical = masterControlsList.filter((c) => c.riskLevel === "Critical").length;
    const categories = Array.from(new Set(masterControlsList.map((c) => c.category)));
    return { total: masterControlsList.length, connected, manual, critical, categories };
  }, []);

  const groupedControls = useMemo(() => {
    const groups: Record<string, typeof masterControlsList> = {};
    masterControlsList.forEach((c) => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, []);

  const handleConfirmStart = useCallback(async () => {
    const { workflowSessionConfigs } = await import("@/components/workspace/AgentHubHome");
    launchControlTestingWorkflow(addProject, setCurrentSession, activeProjects, workflowSessionConfigs);
    setLocation("/");
  }, [addProject, setCurrentSession, activeProjects, setLocation]);

  const handleCancel = useCallback(() => {
    setLocation("/");
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-white dark:bg-background flex flex-col" data-testid="testing-plan-page">
      <div className="border-b border-slate-200 dark:border-border bg-white dark:bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#266C92]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground" data-testid="text-page-title">
                Automated Control Testing Plan
              </h1>
              <p className="text-xs text-muted-foreground">
                Review the testing scope and workflow before initiating
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-cancel-top"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          <div className="grid grid-cols-4 gap-4" data-testid="stats-grid">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
              <p className="text-2xl font-bold text-foreground" data-testid="stat-total-controls">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Controls in Scope</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#266C92]" />
                <p className="text-2xl font-bold text-foreground" data-testid="stat-automated">{stats.connected}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Automated (Connected)</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-2xl font-bold text-foreground" data-testid="stat-manual">{stats.manual}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Manual (PBC)</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/10">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="stat-critical">{stats.critical}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Critical Risk</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4">Agentic Workflow — Per Control Pipeline</h2>
            <div className="relative">
              <div className="absolute left-[19px] top-8 bottom-4 w-px bg-slate-200 dark:bg-border" />
              <div className="space-y-3">
                {WORKFLOW_STEPS.map((step) => (
                  <div key={step.step} className="flex items-start gap-4 relative" data-testid={`workflow-step-${step.step}`}>
                    <div className="w-10 h-10 rounded-full bg-[#266C92]/10 border border-[#266C92]/20 flex items-center justify-center flex-shrink-0 z-[1]">
                      <step.icon className="w-4 h-4 text-[#266C92]" />
                    </div>
                    <div className="pt-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{step.title}</span>
                        <Badge className="text-[9px] h-4 bg-[#266C92]/10 text-[#266C92] border-0">
                          Agent-Driven
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4">Controls in Scope ({stats.total})</h2>
            <div className="space-y-5">
              {stats.categories.map((category) => (
                <div key={category} data-testid={`control-group-${category.replace(/\s+/g, "-").toLowerCase()}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</span>
                    <span className="text-[10px] text-muted-foreground">({groupedControls[category]?.length})</span>
                  </div>
                  <div className="border border-slate-200 dark:border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[5rem_1fr_6rem_6rem_8rem] gap-2 px-4 py-2 bg-slate-50 dark:bg-muted/20 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>ID</span>
                      <span>Control Name</span>
                      <span>Risk</span>
                      <span>Source</span>
                      <span>System</span>
                    </div>
                    {groupedControls[category]?.map((c) => (
                      <div
                        key={c.id}
                        className="grid grid-cols-[5rem_1fr_6rem_6rem_8rem] gap-2 px-4 py-2.5 text-xs items-center border-t border-slate-100 dark:border-border/50"
                        data-testid={`control-row-${c.id}`}
                      >
                        <span className="font-mono text-muted-foreground">{c.id}</span>
                        <span className="font-medium text-foreground">{c.name}</span>
                        <Badge
                          className={`text-[9px] h-4 w-fit ${
                            c.riskLevel === "Critical"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : c.riskLevel === "High"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {c.riskLevel}
                        </Badge>
                        <span
                          className={`text-[10px] ${
                            c.dataSource === "connected" ? "text-[#266C92]" : "text-slate-500"
                          }`}
                        >
                          {c.dataSource === "connected" ? "⚡ Auto" : "📋 Manual"}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">{c.system || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-border bg-white dark:bg-background sticky bottom-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="text-sm"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStart}
            className="bg-[#266C92] hover:bg-[#1e5a7a] text-white text-sm px-6"
            data-testid="button-confirm-start"
          >
            Confirm & Start Workflow
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
