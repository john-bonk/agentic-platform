import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Integrations } from "@/pages/Integrations";
import { ProcessDetail } from "@/pages/ProcessDetail";
import { VulnerabilityImportWizard } from "@/pages/wizard/VulnerabilityImportWizard";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={Integrations} />
      <Route path="/process/:id">
        {(params) => <ProcessDetail processId={params.id} />}
      </Route>
      <Route path="/vulnerability-import-wizard" component={VulnerabilityImportWizard} />
      
      {/* Dashboard */}
      <Route path="/dashboard">
        {() => <PlaceholderPage title="Dashboard" />}
      </Route>
      
      {/* Environment */}
      <Route path="/business-impact-analyses">
        {() => <PlaceholderPage title="Business Impact Analyses" />}
      </Route>
      <Route path="/business-continuity-plans">
        {() => <PlaceholderPage title="Business Continuity Plans" />}
      </Route>
      <Route path="/scenario-tests">
        {() => <PlaceholderPage title="Scenario Tests" />}
      </Route>
      <Route path="/issues">
        {() => <PlaceholderPage title="Issues" />}
      </Route>
      
      {/* Inventory */}
      <Route path="/business-units">
        {() => <PlaceholderPage title="Business Units" />}
      </Route>
      <Route path="/locations">
        {() => <PlaceholderPage title="Locations" />}
      </Route>
      <Route path="/it-systems">
        {() => <PlaceholderPage title="IT Systems" />}
      </Route>
      <Route path="/vendors">
        {() => <PlaceholderPage title="Vendors" />}
      </Route>
      
      {/* Administration */}
      <Route path="/bia-templates">
        {() => <PlaceholderPage title="BIA Templates" />}
      </Route>
      <Route path="/settings">
        {() => <PlaceholderPage title="Settings" />}
      </Route>
      
      {/* Fallback to 404 */}
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
