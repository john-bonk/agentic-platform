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
} from "@/pages";

function Router() {
  return (
    <Switch>
      {/* Intelligence Hub - Default Landing Page */}
      <Route path="/" component={IntelligenceHubPage} />
      
      {/* Analytics Routes */}
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
