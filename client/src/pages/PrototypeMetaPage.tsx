/**
 * Prototype Meta Page
 * 
 * A comprehensive meta view showing all hardcoded data, content, and
 * configuration in the prototype. Dynamically derives inventory from
 * actual source-of-truth data structures.
 */

import { useQuery } from "@tanstack/react-query";
import { 
  Cog, CheckCircle2, AlertCircle, Database, Workflow, 
  Shield, FileText, Layers, Globe, Bot, 
  BarChart3, Building2, ChevronDown, ChevronRight,
  Server, Code, Zap, Activity, Home, CircleCheck, CircleX
} from "lucide-react";
import { useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { type Workflow as WorkflowType } from "@shared/schema";
import { SEEDED_WORKFLOW_IDS, PROTOTYPE_EXPECTATIONS } from "@shared/seededData";

import { defaultWorkspaces, solutionCapabilities } from "@/lib/workspaceStore";
import { slideDecks } from "@/lib/reportingContent";
import { modules, workspaceHomeNav } from "@/config/navigation";
import { workspaceQuickActions, genericQuickActions, getQuickActionCounts, getTotalQuickActionCount } from "@/lib/quickActionsConfig";

function StatusBadge({ status }: { status: "hardcoded" | "session-only" | "mixed" | "verified" | "missing" }) {
  const configs = {
    hardcoded: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: CheckCircle2, label: "Hardcoded" },
    verified: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: CheckCircle2, label: "Verified" },
    "session-only": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", icon: AlertCircle, label: "Session Only" },
    mixed: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: Layers, label: "Mixed" },
    missing: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: AlertCircle, label: "Missing" },
  };
  const cfg = configs[status];
  const Icon = cfg.icon;
  return (
    <Badge className={`${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3 mr-1" />
      {cfg.label}
    </Badge>
  );
}

function LiveWorkspaceInventory() {
  const workspaceCount = defaultWorkspaces.length;
  const capabilityCount = solutionCapabilities.length;
  const quickActionCounts = getQuickActionCounts();
  
  return (
    <div className="border dark:border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-slate-50 dark:bg-muted border-b dark:border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#266C92]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-foreground">Workspaces (Live Count)</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">From workspaceStore.ts defaultWorkspaces</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{workspaceCount} workspaces</Badge>
            <StatusBadge status={workspaceCount === PROTOTYPE_EXPECTATIONS.defaultWorkspaceCount ? "verified" : "missing"} />
          </div>
        </div>
      </div>
      <div className="divide-y dark:divide-border">
        {defaultWorkspaces.map((ws) => (
          <div key={ws.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900 dark:text-foreground">{ws.name}</span>
              <span className="text-sm text-gray-500 dark:text-muted-foreground ml-2">({ws.persona} - {ws.personaTitle})</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">{ws.id}</Badge>
              <Badge className="bg-green-100 text-green-700 text-xs">
                {quickActionCounts[ws.id] || 0} quick actions
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 dark:bg-muted/50 border-t dark:border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-muted-foreground">Solution Capabilities Available</span>
          <Badge variant="secondary">{capabilityCount} capabilities</Badge>
        </div>
      </div>
    </div>
  );
}

function LiveQuickActionsInventory() {
  const quickActionCounts = getQuickActionCounts();
  const totalCount = getTotalQuickActionCount();
  
  return (
    <div className="border dark:border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-slate-50 dark:bg-muted border-b dark:border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#266C92]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-foreground">Quick Actions (Live Count)</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">From lib/quickActionsConfig.ts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{totalCount} quick actions</Badge>
            <StatusBadge status={totalCount >= 16 ? "verified" : "missing"} />
          </div>
        </div>
      </div>
      <div className="divide-y dark:divide-border">
        {Object.entries(workspaceQuickActions).map(([wsId, actions]) => (
          <div key={wsId} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">{wsId}</Badge>
                <Badge className="bg-[#266C92]/10 text-[#266C92] text-xs">{actions.length} actions</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {actions.map((action) => (
                <div key={action.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: action.color }} />
                  {action.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 dark:bg-muted/50 border-t dark:border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-muted-foreground">Generic Quick Actions (for custom workspaces)</span>
          <Badge variant="secondary">{genericQuickActions.length} actions</Badge>
        </div>
      </div>
    </div>
  );
}

function LiveNavigationInventory() {
  const moduleCount = modules.length;
  const homeNavCount = Object.keys(workspaceHomeNav).length;
  
  return (
    <div className="border dark:border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-slate-50 dark:bg-muted border-b dark:border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#266C92]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-foreground">Navigation (Live Count)</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">From config/navigation.ts modules</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{moduleCount} modules</Badge>
            <StatusBadge status={moduleCount === 5 ? "verified" : "missing"} />
          </div>
        </div>
      </div>
      <div className="divide-y dark:divide-border">
        {modules.map((mod, idx) => (
          <div key={mod.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-100 dark:bg-muted flex items-center justify-center">
                {idx === 0 && <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                {idx === 1 && <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                {idx === 2 && <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                {idx === 3 && <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                {idx === 4 && <Workflow className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-foreground">{mod.name}</span>
                <span className="text-sm text-gray-500 dark:text-muted-foreground ml-2">({mod.sideNavSections.length} nav sections)</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-mono">{mod.id}</Badge>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 dark:bg-muted/50 border-t dark:border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-muted-foreground">Workspace Home Navs (workspaceHomeNav)</span>
          <Badge variant="secondary">{homeNavCount} configurations</Badge>
        </div>
      </div>
    </div>
  );
}

function LiveReportingInventory() {
  const allDecks: { workspaceId: string; deckKey: string; deck: typeof slideDecks["enterprise-risk"]["board-report"] }[] = [];
  
  Object.entries(slideDecks).forEach(([workspaceId, decks]) => {
    Object.entries(decks).forEach(([deckKey, deck]) => {
      allDecks.push({ workspaceId, deckKey, deck });
    });
  });

  return (
    <div className="border dark:border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-slate-50 dark:bg-muted border-b dark:border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#266C92]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-foreground">Reporting Content (Live Count)</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">From lib/reportingContent.ts slideDecks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{allDecks.length} slide decks</Badge>
            <StatusBadge status={allDecks.length >= 3 ? "verified" : "missing"} />
          </div>
        </div>
      </div>
      <div className="divide-y dark:divide-border">
        {allDecks.map(({ workspaceId, deckKey, deck }) => (
          <div key={deck.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-medium text-gray-900 dark:text-foreground">{deck.title}</span>
                <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">{deck.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline" className="text-xs">{workspaceId}</Badge>
                <Badge variant="secondary" className="text-xs">{deck.slides.length} slides</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveWorkflowInventory() {
  const { data: workflows = [], isLoading, error } = useQuery<WorkflowType[]>({
    queryKey: ["/api/workflows"],
  });

  const expectedIds = [...SEEDED_WORKFLOW_IDS];
  const seededWorkflowsFound = workflows.filter(w => expectedIds.includes(w.id as typeof SEEDED_WORKFLOW_IDS[number]));
  const missingWorkflows = expectedIds.filter(
    id => !workflows.some(w => w.id === id)
  );
  const allPresent = missingWorkflows.length === 0 && seededWorkflowsFound.length === expectedIds.length;

  return (
    <div className="space-y-4">
      <div className="border dark:border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-muted border-b dark:border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
                <Workflow className="w-5 h-5 text-[#266C92]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-foreground">Seeded Workflows (Live API Check)</h3>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Verified from /api/workflows endpoint</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Badge variant="secondary">Loading...</Badge>
              ) : (
                <>
                  <Badge variant="secondary">{seededWorkflowsFound.length}/{expectedIds.length} present</Badge>
                  <StatusBadge status={allPresent ? "verified" : "missing"} />
                </>
              )}
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-4 text-red-600 dark:text-red-400">Failed to load workflows from API</div>
        ) : isLoading ? (
          <div className="p-4 text-gray-500 dark:text-muted-foreground">Loading workflows...</div>
        ) : (
          <div className="divide-y dark:divide-border">
            {expectedIds.map((expectedId) => {
              const found = workflows.find(w => w.id === expectedId);
              return (
                <div key={expectedId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {found ? (
                      <CircleCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <CircleX className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <span className="font-medium text-gray-900 dark:text-foreground">
                        {found?.name || expectedId}
                      </span>
                      {found?.description && (
                        <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5 line-clamp-1">{found.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">{expectedId}</Badge>
                    {found ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">Present</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 text-xs">Missing</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Session-Only Data Notice</p>
              <p className="text-sm text-amber-700 mt-1">
                Any workflows created during a session beyond the {SEEDED_WORKFLOW_IDS.length} seeded above 
                will NOT persist when the server restarts. Only the pre-seeded workflows are available to all visitors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LivePublishReadiness() {
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery<WorkflowType[]>({
    queryKey: ["/api/workflows"],
  });

  const expectedIds = [...SEEDED_WORKFLOW_IDS];
  const seededWorkflowsFound = workflows.filter(w => expectedIds.includes(w.id as typeof SEEDED_WORKFLOW_IDS[number]));
  
  const allDecks: { deck: typeof slideDecks["enterprise-risk"]["board-report"] }[] = [];
  Object.values(slideDecks).forEach(decks => {
    Object.values(decks).forEach(deck => {
      allDecks.push({ deck });
    });
  });

  const totalQuickActions = getTotalQuickActionCount();

  const quickActionCounts = getQuickActionCounts();
  const workspacesWithQuickActions = Object.keys(quickActionCounts).length;

  const checks = [
    { 
      id: "workflows", 
      label: `${SEEDED_WORKFLOW_IDS.length} Demo Workflows Pre-seeded`, 
      status: seededWorkflowsFound.length === SEEDED_WORKFLOW_IDS.length,
      actual: `${seededWorkflowsFound.length}/${SEEDED_WORKFLOW_IDS.length} found`,
      location: "shared/seededData.ts + server/storage.ts",
      loading: workflowsLoading,
    },
    { 
      id: "workspaces", 
      label: `${defaultWorkspaces.length} Default Workspaces Defined`, 
      status: defaultWorkspaces.length === PROTOTYPE_EXPECTATIONS.defaultWorkspaceCount,
      actual: `${defaultWorkspaces.length} defined`,
      location: "client/src/lib/workspaceStore.ts",
      loading: false,
    },
    { 
      id: "quick-actions", 
      label: `${totalQuickActions} Quick Actions (${workspacesWithQuickActions} workspaces)`, 
      status: totalQuickActions >= PROTOTYPE_EXPECTATIONS.minQuickActions,
      actual: `${totalQuickActions} total from ${workspacesWithQuickActions} workspaces`,
      location: "client/src/lib/quickActionsConfig.ts",
      loading: false,
    },
    { 
      id: "navigation", 
      label: `${modules.length} Module Navigation Configured`, 
      status: modules.length === PROTOTYPE_EXPECTATIONS.moduleCount,
      actual: `${modules.length} modules`,
      location: "client/src/config/navigation.ts",
      loading: false,
    },
    { 
      id: "reporting", 
      label: `${allDecks.length} Slide Decks with Full Content`, 
      status: allDecks.length >= PROTOTYPE_EXPECTATIONS.minSlideDecks,
      actual: `${allDecks.length} decks`,
      location: "client/src/lib/reportingContent.ts",
      loading: false,
    },
    { 
      id: "home-navs", 
      label: `${Object.keys(workspaceHomeNav).length} Workspace Home Navigations`, 
      status: Object.keys(workspaceHomeNav).length >= PROTOTYPE_EXPECTATIONS.defaultWorkspaceCount,
      actual: `${Object.keys(workspaceHomeNav).length} configs`,
      location: "client/src/config/navigation.ts workspaceHomeNav",
      loading: false,
    },
    { 
      id: "capabilities", 
      label: `${solutionCapabilities.length} Solution Capabilities`, 
      status: solutionCapabilities.length >= 9,
      actual: `${solutionCapabilities.length} capabilities`,
      location: "client/src/lib/workspaceStore.ts",
      loading: false,
    },
    { 
      id: "default-workspace", 
      label: "Enterprise Risk as Default Landing", 
      status: defaultWorkspaces[1]?.id === "enterprise-risk",
      actual: `Default: ${defaultWorkspaces[1]?.name || "unknown"}`,
      location: "client/src/lib/workspaceStore.ts currentWorkspace",
      loading: false,
    },
  ];

  const passingChecks = checks.filter(c => !c.loading && c.status);
  const failingChecks = checks.filter(c => !c.loading && !c.status);
  const loadingChecks = checks.filter(c => c.loading);

  const allPassing = failingChecks.length === 0 && loadingChecks.length === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#266C92]" />
              Publish Readiness (Live Validation)
            </CardTitle>
            <CardDescription>
              Real-time verification that all content is available
            </CardDescription>
          </div>
          {loadingChecks.length > 0 ? (
            <Badge variant="secondary">Checking...</Badge>
          ) : allPassing ? (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              All {passingChecks.length} Checks Pass
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              {failingChecks.length} Issue(s) Found
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {checks.map((check) => (
            <div key={check.id} className="flex items-center justify-between py-2 border-b dark:border-border last:border-0">
              <div className="flex items-center gap-3">
                {check.loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-[#266C92] animate-spin" />
                ) : check.status ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <span className="text-sm font-medium text-foreground">{check.label}</span>
                  <span className="text-xs text-gray-500 dark:text-muted-foreground ml-2">({check.actual})</span>
                </div>
              </div>
              <code className="text-xs text-gray-400 dark:text-gray-500 font-mono max-w-[200px] truncate" title={check.location}>
                {check.location}
              </code>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DataArchitecture() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#266C92]" />
            Storage Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Server Storage (Hardcoded)</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• MemStorage class in server/storage.ts</li>
                <li>• seedExampleData() runs on every server start</li>
                <li>• {SEEDED_WORKFLOW_IDS.length} workflows with nodes and edges pre-seeded</li>
                <li>• All visitors see the same seeded data</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-800">Client Storage (Session Only)</span>
              </div>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Zustand stores (no persistence)</li>
                <li>• Custom workspaces reset on refresh</li>
                <li>• Assistant chat history resets</li>
                <li>• Tab state resets on refresh</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 text-foreground">Data Flow on Server Start</h4>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge className="bg-[#266C92]">Server Start</Badge>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Badge variant="secondary">MemStorage Constructor</Badge>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Badge variant="secondary">seedExampleData()</Badge>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Badge className="bg-green-600 text-white">{SEEDED_WORKFLOW_IDS.length} Workflows Ready</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[#266C92]" />
            Static Content Source Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Client-Side Hardcoded</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><code className="bg-gray-100 dark:bg-muted px-1 rounded">lib/workspaceStore.ts</code> - {defaultWorkspaces.length} Workspaces</li>
                <li><code className="bg-gray-100 dark:bg-muted px-1 rounded">config/navigation.ts</code> - {modules.length} Modules</li>
                <li><code className="bg-gray-100 dark:bg-muted px-1 rounded">lib/reportingContent.ts</code> - Slide Decks</li>
                <li><code className="bg-gray-100 dark:bg-muted px-1 rounded">HomeAssistantPanel.tsx</code> - Quick Actions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Server-Side Hardcoded</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><code className="bg-gray-100 dark:bg-muted px-1 rounded">server/storage.ts</code> - {SEEDED_WORKFLOW_IDS.length} Workflows</li>
                <li><code className="bg-gray-100 dark:bg-muted px-1 rounded">server/storage.ts</code> - Workflow Nodes</li>
                <li><code className="bg-gray-100 dark:bg-muted px-1 rounded">server/storage.ts</code> - Workflow Edges</li>
                <li><code className="bg-gray-100 dark:bg-muted px-1 rounded">server/routes.ts</code> - API Endpoints</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PrototypeMetaPage() {
  return (
    <AppLayout 
      showSideNav={false}
    >
      <div className="p-6 max-w-6xl mx-auto">
        <PageHeader
          title="Prototype Meta View"
          description="Live inventory of all hardcoded data and configuration - dynamically validated from source"
          actions={
            <Badge className="bg-[#266C92] text-white">
              <Cog className="w-3 h-3 mr-1" />
              Development Tool
            </Badge>
          }
        />

        <Tabs defaultValue="readiness" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="readiness" data-testid="tab-readiness">Publish Readiness</TabsTrigger>
            <TabsTrigger value="workflows" data-testid="tab-workflows">Workflows</TabsTrigger>
            <TabsTrigger value="workspaces" data-testid="tab-workspaces">Workspaces</TabsTrigger>
            <TabsTrigger value="quick-actions" data-testid="tab-quick-actions">Quick Actions</TabsTrigger>
            <TabsTrigger value="navigation" data-testid="tab-navigation">Navigation</TabsTrigger>
            <TabsTrigger value="reporting" data-testid="tab-reporting">Reporting</TabsTrigger>
            <TabsTrigger value="architecture" data-testid="tab-architecture">Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="readiness">
            <LivePublishReadiness />
          </TabsContent>

          <TabsContent value="workflows">
            <LiveWorkflowInventory />
          </TabsContent>

          <TabsContent value="workspaces">
            <LiveWorkspaceInventory />
          </TabsContent>

          <TabsContent value="quick-actions">
            <LiveQuickActionsInventory />
          </TabsContent>

          <TabsContent value="navigation">
            <LiveNavigationInventory />
          </TabsContent>

          <TabsContent value="reporting">
            <LiveReportingInventory />
          </TabsContent>

          <TabsContent value="architecture">
            <DataArchitecture />
          </TabsContent>
        </Tabs>

        <Card className="mt-6 border-[#266C92]/30 bg-[#266C92]/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#266C92] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#266C92]">Published Prototype Guarantee</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  All items shown as <strong>"Verified"</strong> on the Publish Readiness tab are hardcoded in the source 
                  code and will be available to all visitors when published. The live API checks confirm workflows are 
                  properly seeded on server start.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
