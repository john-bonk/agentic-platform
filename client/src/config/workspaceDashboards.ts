/**
 * Workspace Dashboard Configuration
 * 
 * Central configuration for role-based Global Residual Risk dashboards.
 * Each workspace (CRO, CAE, CISO, etc.) has its own dashboard view.
 * 
 * =============================================================================
 * WORKSPACE VIEW PATTERN - READ THIS BEFORE ADDING NEW WORKSPACES
 * =============================================================================
 * 
 * There are TWO ways to access Global Residual Risk views:
 * 
 * 1. IN-FRAME (Primary): From the workspace Home side navigation
 *    - Route: /global-residual-risk (renders based on current workspace)
 *    - Keeps "Home" active in global nav
 *    - Uses workspaceStore.currentWorkspace to determine which view to render
 * 
 * 2. DIRECT (Secondary): From the Residual Risk module in global nav
 *    - Routes: /cro/global-residual-risk, /cae/global-residual-risk, etc.
 *    - Switches global nav to "Residual Risk" module
 *    - Provides explicit workspace-specific access
 * 
 * =============================================================================
 * HOW TO ADD A NEW WORKSPACE (e.g., CISO)
 * =============================================================================
 * 
 * 1. Add entry to WORKSPACE_DASHBOARDS array below with:
 *    - id, persona, label, description
 *    - inFramePath: "/global-residual-risk" (always the same)
 *    - directPath: "/ciso/global-residual-risk" (workspace-specific)
 * 
 * 2. Create page component: client/src/pages/CISOResidualRiskPage.tsx
 *    - Copy from CAEResidualRiskPage.tsx as template
 *    - Update content/data for CISO use case
 * 
 * 3. Update client/src/pages/GlobalResidualRiskRouter.tsx:
 *    - Import the new page component
 *    - Add case for "CISO" in the switch statement
 * 
 * 4. Add direct route in client/src/App.tsx:
 *    - <Route path="/ciso/global-residual-risk" component={CISOResidualRiskPage} />
 * 
 * 5. Update navigation.ts workspaceHomeNav:
 *    - Add "CISO" entry (copy from CAE, update path if needed)
 * 
 * 6. Update navigation.ts Residual Risk module sideNavSections:
 *    - Add { id: "ciso-dashboard", label: "CISO", path: "/ciso/global-residual-risk" }
 * 
 * That's it! The workspace store already has CISO defined.
 * =============================================================================
 */

export interface WorkspaceDashboard {
  id: string;
  persona: string;
  label: string;
  description: string;
  inFramePath: string;
  directPath: string;
}

/**
 * All workspace dashboards
 * The inFramePath is the same for all - renders based on workspace context
 * The directPath is workspace-specific for direct navigation
 */
export const WORKSPACE_DASHBOARDS: WorkspaceDashboard[] = [
  {
    id: "cro-dashboard",
    persona: "CRO",
    label: "CRO",
    description: "Chief Risk Officer view - Tariff and supply chain risk focus",
    inFramePath: "/global-residual-risk",
    directPath: "/cro/global-residual-risk",
  },
  {
    id: "cae-dashboard",
    persona: "CAE",
    label: "CAE",
    description: "Chief Audit Executive view - M&A audit and compliance focus",
    inFramePath: "/global-residual-risk",
    directPath: "/cae/global-residual-risk",
  },
  {
    id: "ciso-dashboard",
    persona: "CISO",
    label: "CISO",
    description: "Chief Information Security Officer view - Cybersecurity risk focus",
    inFramePath: "/global-residual-risk",
    directPath: "/ciso/global-residual-risk",
  },
];

/**
 * Get dashboard by persona
 */
export function getDashboardByPersona(persona: string): WorkspaceDashboard | undefined {
  return WORKSPACE_DASHBOARDS.find(d => d.persona === persona);
}

/**
 * Get all dashboard nav items for the Residual Risk module (direct access)
 */
export function getDashboardNavItems() {
  return WORKSPACE_DASHBOARDS.map(d => ({
    id: d.id,
    label: d.label,
    path: d.directPath,
  }));
}

/**
 * Check if a path is a direct workspace path (for Residual Risk module)
 */
export function isDirectWorkspacePath(path: string): boolean {
  return WORKSPACE_DASHBOARDS.some(d => path.startsWith(d.directPath));
}
