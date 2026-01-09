/**
 * GlobalResidualRiskRouter
 * 
 * A router component that renders the appropriate Global Residual Risk view
 * based on the current workspace persona.
 * 
 * This is used for IN-FRAME navigation from the workspace Home side nav.
 * The route `/global-residual-risk` renders this component, which then
 * delegates to the workspace-specific view (CRO, CAE, CISO).
 * 
 * This keeps the "Home" icon active in the global nav while showing
 * the workspace-appropriate GRR dashboard.
 * 
 * =============================================================================
 * TO ADD A NEW WORKSPACE VIEW:
 * =============================================================================
 * 1. Import the new page component
 * 2. Add a case for the persona in the switch statement
 * 
 * Example for CISO:
 *   import CISOResidualRiskPage from "./CISOResidualRiskPage";
 *   case "CISO": return <CISOResidualRiskPage />;
 * =============================================================================
 */

import { useWorkspaceStore } from "@/lib/workspaceStore";
import GlobalResidualRiskPage from "./GlobalResidualRiskPage";
import CAEResidualRiskPage from "./CAEResidualRiskPage";

export default function GlobalResidualRiskRouter() {
  const { currentWorkspace } = useWorkspaceStore();
  
  switch (currentWorkspace.persona) {
    case "CRO":
      return <GlobalResidualRiskPage />;
    case "CAE":
      return <CAEResidualRiskPage />;
    case "CISO":
      return <GlobalResidualRiskPage />;
    default:
      return <GlobalResidualRiskPage />;
  }
}
