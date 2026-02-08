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
import { ThemeProvider } from "@/hooks/use-theme";

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
  CAEResidualRiskPage,
  CISOResidualRiskPage,
  GlobalResidualRiskRouter,
  RiskHeatmapPage,
  MitigationTrackerPage,
  ThreatDetectionPage,
  VulnerabilityScanPage,
  ComingSoonPage,
  AdminOverviewPage,
  AdminWorkspacesPage,
  AdminPermissionsPage,
  AdminDataPage,
  PrototypeMetaPage,
  GeneratedReportPage,
  CustomWorkspaceHome,
  RecentPage,
  FavoritesPage,
} from "@/pages";
import { HomeAssistantPanel } from "@/components/layout/HomeAssistantPanel";
import { BrowserChrome } from "@/components/layout/BrowserChrome";
import { useSettings } from "@/components/settings-panel";

function Router() {
  return (
    <Switch>
      {/* Home - Default Landing Page */}
      <Route path="/" component={HomePage} />
      
      {/* Home Module Routes */}
      <Route path="/my-dashboard" component={HomePage} />
      <Route path="/custom-workspace" component={CustomWorkspaceHome} />
      <Route path="/recent" component={RecentPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/global-residual-risk" component={GlobalResidualRiskRouter} />
      <Route path="/vendor-exposure" component={VendorExposurePage} />
      <Route path="/org-impact" component={OrgImpactPage} />
      <Route path="/threat-detection" component={ThreatDetectionPage} />
      <Route path="/vulnerability-scan" component={VulnerabilityScanPage} />
      <Route path="/inventory" component={AllInventoryPage} />
      <Route path="/coverage-mapping" component={CoverageMappingPage} />
      <Route path="/controls" component={ComingSoonPage} />
      <Route path="/tests" component={ComingSoonPage} />
      <Route path="/issues" component={ComingSoonPage} />
      <Route path="/financial-accounts" component={ComingSoonPage} />
      <Route path="/risk-control-matrix" component={ComingSoonPage} />
      <Route path="/coso-framework" component={ComingSoonPage} />
      <Route path="/open-tasks" component={ComingSoonPage} />
      <Route path="/financial-accounts-view" component={ComingSoonPage} />
      <Route path="/financial-applications-view" component={ComingSoonPage} />
      
      {/* Intelligence Hub Routes */}
      <Route path="/intelligence" component={IntelligenceHubPage} />
      <Route path="/intelligence/data-explorer" component={ListPage} />
      <Route path="/intelligence/entity-matrix" component={HierarchyPage} />
      <Route path="/intelligence/config" component={SettingsPage} />
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
      <Route path="/reporting/generated/:reportId" component={GeneratedReportPage} />
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
      <Route path="/intelligence/threat-detection" component={ThreatDetectionPage} />
      <Route path="/intelligence/vulnerability-scan" component={VulnerabilityScanPage} />
      
      {/* CRO Workspace Routes */}
      <Route path="/cro/global-residual-risk" component={GlobalResidualRiskPage} />
      <Route path="/cro/risk-heatmap" component={RiskHeatmapPage} />
      <Route path="/cro/mitigation-tracker" component={MitigationTrackerPage} />
      
      {/* CAE Workspace Routes */}
      <Route path="/cae/global-residual-risk" component={CAEResidualRiskPage} />
      
      {/* CISO Workspace Routes */}
      <Route path="/ciso/global-residual-risk" component={CISOResidualRiskPage} />
      
      {/* Admin Workspace Routes */}
      <Route path="/admin" component={AdminWorkspacesPage} />
      <Route path="/admin/workspaces" component={AdminWorkspacesPage} />
      <Route path="/admin/permissions" component={AdminPermissionsPage} />
      <Route path="/admin/data" component={AdminDataPage} />
      
      {/* Prototype Meta View */}
      <Route path="/prototype-meta" component={PrototypeMetaPage} />
      
      {/* 404 - Must be last */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const settings = useSettings();

  return (
    <BrowserChrome visible={settings.showBrowser}>
      <Toaster />
      <Router />
      <HomeAssistantPanel />
    </BrowserChrome>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
