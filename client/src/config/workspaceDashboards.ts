/**
 * Workspace Dashboard Configuration
 * 
 * Central configuration for role-based Global Residual Risk dashboards.
 * Each workspace (CRO, CAE, CISO, etc.) has its own dashboard view within
 * the "Residual Risk" navigation module.
 * 
 * PATTERN FOR ADDING NEW DASHBOARDS:
 * 1. Add entry to WORKSPACE_DASHBOARDS array below
 * 2. Create page component in client/src/pages/ following naming: {Workspace}ResidualRiskPage.tsx
 * 3. Add route in client/src/App.tsx: <Route path={dashboard.path} component={Page} />
 * 4. Navigation is auto-generated from this config
 * 
 * The navigation.ts file references this config to build the Dashboards section.
 */

export interface WorkspaceDashboard {
  id: string;
  workspace: string;
  label: string;
  path: string;
  description: string;
  icon?: string;
}

/**
 * All workspace dashboards in the Residual Risk module
 * Add new workspaces here - navigation will auto-update
 */
export const WORKSPACE_DASHBOARDS: WorkspaceDashboard[] = [
  {
    id: "cro-dashboard",
    workspace: "CRO",
    label: "CRO",
    path: "/cro/global-residual-risk",
    description: "Chief Risk Officer view - Tariff and supply chain risk focus",
  },
  {
    id: "cae-dashboard",
    workspace: "CAE",
    label: "CAE",
    path: "/cae/global-residual-risk",
    description: "Chief Audit Executive view - M&A audit and compliance focus",
  },
  // FUTURE: Add CISO dashboard here
  // {
  //   id: "ciso-dashboard",
  //   workspace: "CISO",
  //   label: "CISO",
  //   path: "/ciso/global-residual-risk",
  //   description: "Chief Information Security Officer view - Cybersecurity risk focus",
  // },
];

/**
 * Get dashboard by workspace ID
 */
export function getDashboardByWorkspace(workspace: string): WorkspaceDashboard | undefined {
  return WORKSPACE_DASHBOARDS.find(d => d.workspace === workspace);
}

/**
 * Get all dashboard nav items for the Residual Risk module
 */
export function getDashboardNavItems() {
  return WORKSPACE_DASHBOARDS.map(d => ({
    id: d.id,
    label: d.label,
    path: d.path,
  }));
}

/**
 * Check if a path belongs to the Residual Risk module
 */
export function isResidualRiskPath(path: string): boolean {
  return WORKSPACE_DASHBOARDS.some(d => path.startsWith(d.path.split('/')[1] ? `/${d.path.split('/')[1]}` : d.path));
}
