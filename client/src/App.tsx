/**
 * Main Application Component
 * 
 * This is the root component that sets up:
 * - React Query for data fetching
 * - Routing configuration
 * - Global providers (Tooltip, Toast)
 * 
 * To add a new page:
 * 1. Create a component in src/pages/
 * 2. Import it here
 * 3. Add a Route below
 * 4. Update navigation config in src/config/navigation.ts
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { 
  DashboardPage,
  HomePage,
  IntelligenceHubPage,
  ListPage,
  HierarchyPage,
  ItemDetailPage,
  DemoPage,
  SettingsPage,
  WizardPage,
  NotFound,
  WorkflowBuilderPage,
  WorkflowListPage,
  ReportingPage,
  SlideViewerPage,
  VendorExposurePage,
  OrgImpactPage,
  CoverageMappingPage,
  AllInventoryPage,
  GlobalResidualRiskPage,
} from "@/pages";
import { HomeAssistantPanel } from "@/components/layout/HomeAssistantPanel";

function Router() {
  return (
    <Switch>
      {/* Home - Default Landing Page */}
      <Route path="/" component={HomePage} />
      
      {/* Home Module Routes */}
      <Route path="/my-dashboard" component={HomePage} />
      <Route path="/inventory" component={AllInventoryPage} />
      <Route path="/coverage-mapping" component={CoverageMappingPage} />
      <Route path="/controls" component={HomePage} />
      <Route path="/tests" component={HomePage} />
      <Route path="/issues" component={HomePage} />
      <Route path="/financial-accounts" component={HomePage} />
      <Route path="/risk-control-matrix" component={HomePage} />
      <Route path="/coso-framework" component={HomePage} />
      <Route path="/open-tasks" component={HomePage} />
      <Route path="/financial-accounts-view" component={HomePage} />
      <Route path="/financial-applications-view" component={HomePage} />
      
      {/* Intelligence Hub Routes */}
      <Route path="/intelligence" component={IntelligenceHubPage} />
      <Route path="/list" component={ListPage} />
      <Route path="/hierarchy" component={HierarchyPage} />
      <Route path="/wizard" component={WizardPage} />
      <Route path="/items/:id" component={ItemDetailPage} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/profile" component={SettingsPage} />
      <Route path="/dashboard-old" component={DashboardPage} />
      
      {/* Workflow Routes */}
      <Route path="/workflows" component={WorkflowListPage} />
      <Route path="/workflow/:id" component={WorkflowBuilderPage} />
      
      {/* Reporting Routes */}
      <Route path="/reporting" component={ReportingPage} />
      <Route path="/reporting/view/:deckId" component={SlideViewerPage} />
      <Route path="/reporting/board-reports" component={ReportingPage} />
      <Route path="/reporting/audit-committee" component={ReportingPage} />
      <Route path="/reporting/compliance-reports" component={ReportingPage} />
      <Route path="/reporting/slide-builder" component={ReportingPage} />
      <Route path="/reporting/export-center" component={ReportingPage} />
      <Route path="/reporting/artifacts/:id" component={SlideViewerPage} />
      
      {/* Intelligence Hub Sub-Routes */}
      <Route path="/intelligence/vendor-exposure" component={VendorExposurePage} />
      <Route path="/intelligence/org-impact" component={OrgImpactPage} />
      
      {/* CRO Workspace Routes */}
      <Route path="/cro/global-residual-risk" component={GlobalResidualRiskPage} />
      
      {/* 404 - Must be last */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <HomeAssistantPanel />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
