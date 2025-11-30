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
 * 
 * TODO: Add your own routes and pages
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { 
  DashboardPage, 
  ListPage,
  HierarchyPage,
  ItemDetailPage,
  DemoPage,
  SettingsPage,
  NotFound 
} from "@/pages";

function Router() {
  return (
    <Switch>
      {/* 
        Main Routes
        Add your application routes here.
        
        Example route patterns:
        - Static: <Route path="/about" component={AboutPage} />
        - With params: <Route path="/items/:id">{(params) => <ItemDetail id={params.id} />}</Route>
        - Catch-all: <Route path="/docs/:rest*" component={DocsPage} />
      */}
      
      {/* Template 1 - Dashboard and Features */}
      <Route path="/" component={DashboardPage} />
      <Route path="/list" component={ListPage} />
      <Route path="/hierarchy" component={HierarchyPage} />
      <Route path="/items/:id" component={ItemDetailPage} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/profile" component={SettingsPage} />
      
      {/* Template 2 - Same pages, different module context */}
      <Route path="/template2" component={DashboardPage} />
      <Route path="/template2/list" component={ListPage} />
      <Route path="/template2/hierarchy" component={HierarchyPage} />
      <Route path="/template2/items/:id" component={ItemDetailPage} />
      <Route path="/template2/demo" component={DemoPage} />
      <Route path="/template2/settings" component={SettingsPage} />
      
      {/* 
        TODO: Add your custom routes here
        Example:
        <Route path="/my-feature" component={MyFeaturePage} />
      */}
      
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
