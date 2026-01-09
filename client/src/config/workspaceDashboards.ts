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
 *    - Keeps "Home" active in global nav (NOT the Residual Risk module)
 *    - Uses workspaceStore.currentWorkspace to determine which view to render
 *    - GlobalResidualRiskRouter delegates to the appropriate component
 * 
 * 2. DIRECT (Secondary): From the Residual Risk module in global nav
 *    - Routes: /cro/global-residual-risk, /cae/global-residual-risk, etc.
 *    - Switches global nav to "Residual Risk" module
 *    - Provides explicit workspace-specific access
 * 
 * =============================================================================
 * CRITICAL NAVIGATION BEHAVIOR
 * =============================================================================
 * 
 * - /global-residual-risk → Home module stays active (in-frame rendering)
 * - /cro/*, /cae/*, /ciso/* → Residual Risk module becomes active
 * 
 * This is enforced by:
 * - homePaths array in navigation.ts includes "/global-residual-risk"
 * - getModuleFromPath() and getActiveModuleIndex() check for /cro, /cae, /ciso
 * 
 * =============================================================================
 * HOW TO ADD A NEW WORKSPACE (CHECKLIST)
 * =============================================================================
 * 
 * Step 1: Add entry to WORKSPACE_DASHBOARDS array below (this file)
 *   □ id: unique identifier (e.g., "ciso-dashboard")
 *   □ persona: matches workspaceStore persona (e.g., "CISO")
 *   □ label: display name (e.g., "CISO")
 *   □ description: helpful description
 *   □ componentName: page component name (e.g., "CISOResidualRiskPage")
 *   □ inFramePath: "/global-residual-risk" (ALWAYS the same)
 *   □ directPath: "/ciso/global-residual-risk" (workspace-specific)
 * 
 * Step 2: Create page component
 *   □ File: client/src/pages/{Persona}ResidualRiskPage.tsx
 *   □ Copy from CAEResidualRiskPage.tsx as template
 *   □ Export from client/src/pages/index.ts
 * 
 * Step 3: Update GlobalResidualRiskRouter.tsx
 *   □ Import the new page component
 *   □ Add case for the persona in switch statement
 * 
 * Step 4: Add direct route in App.tsx
 *   □ <Route path="/{persona}/global-residual-risk" component={Page} />
 * 
 * Step 5: Update navigation.ts
 *   □ getModuleFromPath(): Add path.startsWith("/{persona}") check
 *   □ getActiveModuleIndex(): Add path.startsWith("/{persona}") check
 *   □ Residual Risk sideNavSections: Add dashboard item
 * 
 * Step 6: Verify workspaceHomeNav has the persona's Home navigation
 *   □ Should already point to "/global-residual-risk" (in-frame path)
 * 
 * =============================================================================
 * TESTING CHECKLIST (after adding workspace)
 * =============================================================================
 * 
 * □ Switch to new workspace via workspace selector
 * □ Click "Global Residual Risk" in Home side nav → view loads, Home stays active
 * □ Click Residual Risk module in global nav → dashboard list shows new workspace
 * □ Click new workspace in Residual Risk module → view loads, Residual Risk active
 * □ URL /global-residual-risk with new workspace selected → correct view renders
 * □ URL /{persona}/global-residual-risk → Residual Risk module active
 * 
 * =============================================================================
 */

export interface WorkspaceDashboard {
  id: string;
  persona: string;
  label: string;
  description: string;
  componentName: string;
  inFramePath: string;
  directPath: string;
}

/**
 * All workspace dashboards - SINGLE SOURCE OF TRUTH
 * 
 * The inFramePath is the same for all - renders based on workspace context
 * The directPath is workspace-specific for direct navigation
 * The componentName documents which component renders this dashboard
 */
export const WORKSPACE_DASHBOARDS: WorkspaceDashboard[] = [
  {
    id: "cro-dashboard",
    persona: "CRO",
    label: "CRO",
    description: "Chief Risk Officer view - Tariff and supply chain risk focus",
    componentName: "GlobalResidualRiskPage",
    inFramePath: "/global-residual-risk",
    directPath: "/cro/global-residual-risk",
  },
  {
    id: "cae-dashboard",
    persona: "CAE",
    label: "CAE",
    description: "Chief Audit Executive view - M&A audit and compliance focus",
    componentName: "CAEResidualRiskPage",
    inFramePath: "/global-residual-risk",
    directPath: "/cae/global-residual-risk",
  },
  {
    id: "ciso-dashboard",
    persona: "CISO",
    label: "CISO",
    description: "Chief Information Security Officer view - Cybersecurity risk focus",
    componentName: "GlobalResidualRiskPage",
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
 * Used to determine if Residual Risk module should be active
 */
export function isDirectWorkspacePath(path: string): boolean {
  return WORKSPACE_DASHBOARDS.some(d => path.startsWith(d.directPath));
}

/**
 * Get all direct workspace path prefixes
 * These are the prefixes that trigger the Residual Risk module
 */
export function getDirectPathPrefixes(): string[] {
  return WORKSPACE_DASHBOARDS.map(d => `/${d.persona.toLowerCase()}`);
}

/**
 * Get the in-frame path (same for all workspaces)
 * This path keeps the Home module active
 */
export const IN_FRAME_PATH = "/global-residual-risk";
