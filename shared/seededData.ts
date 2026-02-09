/**
 * Seeded Data Configuration
 * 
 * Single source of truth for all pre-seeded demo data IDs.
 * This ensures consistency between server seeding and client verification.
 */

/**
 * Pre-seeded workflow IDs that are created in seedExampleData()
 * in server/storage.ts. These are the authoritative demo workflows
 * that will be available in the published prototype.
 */
export const SEEDED_WORKFLOW_IDS = [
  "wf-tariff",      // Enterprise Risk - Tariff Impact Mitigation
  "wf-ma-audit",    // Enterprise Audit - M&A Due Diligence
  "wf-incident",    // IT Security - Log4j Incident Response
  "wf4",            // Audit Evidence Collection
  "wf5",            // Vendor Risk Management
  "wf6",            // Policy Violation Response
  "wf7",            // SOX Compliance Certification
  "wf8",            // Incident Escalation Matrix
  "wf9",            // Regulatory Change Impact
  "wf10",           // Control Deficiency Remediation
] as const;

export type SeededWorkflowId = typeof SEEDED_WORKFLOW_IDS[number];

/**
 * Workspace-specific workflow mappings
 * Maps workspace IDs to their primary demo workflow
 */
export const WORKSPACE_WORKFLOW_MAP: Record<string, SeededWorkflowId> = {
  "enterprise-risk": "wf-tariff",
  "enterprise-audit": "wf-ma-audit",
  "it-security": "wf-incident",
};

/**
 * Expected counts for prototype validation
 */
export const PROTOTYPE_EXPECTATIONS = {
  workflowCount: SEEDED_WORKFLOW_IDS.length,
  defaultWorkspaceCount: 4,
  moduleCount: 6, // Home, Database, Global Risk, Reporting, Intelligence Hub, Workflows
  minSlideDecks: 3,
  minQuickActions: 16, // 4+4+4+4 (Admin now has 4 quick actions including Data)
  adminPageCount: 3, // Workspaces, Permissions, Data
  riskDashboardCount: 3, // CRO, CAE, CISO
  intelligencePageCount: 4, // Vendor Exposure, Org Impact, Threat Detection, Vulnerability Scan
  inventoryViewCount: 2, // All Inventory, Coverage Mapping
} as const;
