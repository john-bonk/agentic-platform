/**
 * Storage Interface
 * 
 * Defines the storage layer for the application.
 * Uses in-memory storage by default, easy to switch to database.
 */

import { 
  type User, type InsertUser,
  type Workflow, type InsertWorkflow,
  type WorkflowNode, type InsertNode,
  type WorkflowEdge, type InsertEdge,
  type AssistantSession, type InsertSession,
  type ChatMessage,
} from "@shared/schema";
import { SEEDED_WORKFLOW_IDS } from "@shared/seededData";
import { randomUUID } from "crypto";

/**
 * Batch Operation Types
 */
export interface BatchNodeSpec {
  tempId: string;
  typeId: string;
  label: string;
  config?: Record<string, unknown>;
  positionX: number;
  positionY: number;
  metadata?: Record<string, unknown>;
}

export interface BatchEdgeSpec {
  sourceTempId: string;
  targetTempId: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string | null;
  condition?: unknown;
  metadata?: Record<string, unknown>;
}

export interface BatchWorkflowResult {
  workflow: Workflow;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  tempIdMapping: Record<string, string>;
}

/**
 * Storage Interface
 */
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: string): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: string): Promise<boolean>;
  
  getNodes(workflowId: string): Promise<WorkflowNode[]>;
  getNode(id: string): Promise<WorkflowNode | undefined>;
  createNode(node: InsertNode): Promise<WorkflowNode>;
  updateNode(id: string, node: Partial<InsertNode>): Promise<WorkflowNode | undefined>;
  deleteNode(id: string): Promise<boolean>;
  deleteNodesByWorkflow(workflowId: string): Promise<number>;
  
  getEdges(workflowId: string): Promise<WorkflowEdge[]>;
  getEdge(id: string): Promise<WorkflowEdge | undefined>;
  createEdge(edge: InsertEdge): Promise<WorkflowEdge>;
  updateEdge(id: string, edge: Partial<InsertEdge>): Promise<WorkflowEdge | undefined>;
  deleteEdge(id: string): Promise<boolean>;
  deleteEdgesByWorkflow(workflowId: string): Promise<number>;
  
  createWorkflowWithContents(
    workflow: InsertWorkflow,
    nodes: BatchNodeSpec[],
    edges: BatchEdgeSpec[]
  ): Promise<BatchWorkflowResult>;
  
  duplicateWorkflow(id: string, newName?: string): Promise<BatchWorkflowResult | undefined>;
  
  clearWorkflowContents(workflowId: string): Promise<{ nodesDeleted: number; edgesDeleted: number }>;
  
  getSession(id: string): Promise<AssistantSession | undefined>;
  getSessionByWorkflow(workflowId: string): Promise<AssistantSession | undefined>;
  createSession(session: InsertSession): Promise<AssistantSession>;
  updateSession(id: string, session: Partial<InsertSession>): Promise<AssistantSession | undefined>;
  addMessageToSession(sessionId: string, message: ChatMessage): Promise<AssistantSession | undefined>;
}

/**
 * In-Memory Storage Implementation
 */
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private workflows: Map<string, Workflow>;
  private nodes: Map<string, WorkflowNode>;
  private edges: Map<string, WorkflowEdge>;
  private sessions: Map<string, AssistantSession>;

  constructor() {
    this.users = new Map();
    this.workflows = new Map();
    this.nodes = new Map();
    this.edges = new Map();
    this.sessions = new Map();
    
    this.seedExampleData();
  }

  private seedExampleData() {
    const now = new Date();
    
    // WORKSPACE-SPECIFIC WORKFLOWS - IDs must match SEEDED_WORKFLOW_IDS in shared/seededData.ts
    // This is the single source of truth for demo workflow IDs
    // wf-tariff: Enterprise Risk (CRO) - Tariff Impact Mitigation
    // wf-ma-audit: Enterprise Audit (CAE) - M&A Audit Workflow  
    // wf-incident: IT Security (CISO) - Incident Response
    
    // Use the shared source of truth for workflow IDs
    const [id0, id1, id2, id3, id4, id5, id6, id7, id8, id9] = SEEDED_WORKFLOW_IDS;
    
    const exampleWorkflows: Workflow[] = [
      { id: id0, name: "Tariff Impact Mitigation Workflow", description: "Automated workflow to assess and mitigate tariff exposure across supply chain with vendor analysis and board reporting", status: "active", tags: ["tariff", "supply-chain", "risk", "mitigation"], ownerId: null, visibility: "team", version: 1, createdAt: now, updatedAt: now },
      { id: id1, name: "M&A Due Diligence Audit", description: "Comprehensive audit workflow for Singapore vertical farming acquisition oversight with control mapping and integration planning", status: "active", tags: ["ma", "audit", "acquisition", "due-diligence"], ownerId: null, visibility: "team", version: 1, createdAt: now, updatedAt: now },
      { id: id2, name: "Log4j Incident Response Workflow", description: "Real-time vulnerability response workflow with triage, patching coordination, and compliance reporting", status: "active", tags: ["security", "incident", "vulnerability", "log4j"], ownerId: null, visibility: "team", version: 1, createdAt: now, updatedAt: now },
      { id: id3, name: "Audit Evidence Collection", description: "Streamlined audit evidence gathering and validation workflow", status: "active", tags: ["audit", "evidence", "compliance"], ownerId: null, visibility: "team", version: 1, createdAt: now, updatedAt: now },
      { id: id4, name: "Vendor Risk Management", description: "Third-party vendor assessment and ongoing monitoring", status: "active", tags: ["vendor", "third-party", "risk"], ownerId: null, visibility: "team", version: 1, createdAt: now, updatedAt: now },
      { id: id5, name: "Policy Violation Response", description: "Automated response to detected policy violations", status: "active", tags: ["policy", "violation", "response"], ownerId: null, visibility: "team", version: 1, createdAt: now, updatedAt: now },
      { id: id6, name: "SOX Compliance Certification", description: "SOX 404 control certification and sign-off workflow", status: "active", tags: ["sox", "compliance", "certification"], ownerId: null, visibility: "organization", version: 1, createdAt: now, updatedAt: now },
      { id: id7, name: "Incident Escalation Matrix", description: "Multi-tier incident escalation based on severity and impact", status: "active", tags: ["incident", "escalation", "response"], ownerId: null, visibility: "team", version: 1, createdAt: now, updatedAt: now },
      { id: id8, name: "Regulatory Change Impact", description: "Assess and implement regulatory requirement changes", status: "active", tags: ["regulatory", "change", "impact"], ownerId: null, visibility: "team", version: 1, createdAt: now, updatedAt: now },
      { id: id9, name: "Control Deficiency Remediation", description: "Track and remediate identified control deficiencies", status: "active", tags: ["controls", "deficiency", "remediation"], ownerId: null, visibility: "team", version: 1, createdAt: now, updatedAt: now },
    ];
    
    exampleWorkflows.forEach(w => this.workflows.set(w.id, w));
    
    const exampleNodes: WorkflowNode[] = [
      // WF-TARIFF: Tariff Impact Mitigation Workflow (CRO/Enterprise Risk)
      { id: "tariff-n1", workflowId: "wf-tariff", typeId: "start", label: "Tariff Alert Received", config: {}, positionX: 80, positionY: 250, metadata: {}, createdAt: now },
      { id: "tariff-n2", workflowId: "wf-tariff", typeId: "webhook-trigger", label: "Trade Policy Monitor", config: { path: "/tariff/alerts", method: "POST", source: "Trade Policy API" }, positionX: 360, positionY: 250, metadata: {}, createdAt: now },
      { id: "tariff-n3", workflowId: "wf-tariff", typeId: "llm-task", label: "AI Impact Analysis", config: { prompt: "Analyze tariff impact on supply chain. Identify affected vendors, products, and estimate cost increase percentages." }, positionX: 640, positionY: 250, metadata: {}, createdAt: now },
      { id: "tariff-n4", workflowId: "wf-tariff", typeId: "ab-risks", label: "Create Risk Record", config: { action: "create", data: { type: "tariff-exposure", category: "supply-chain" } }, positionX: 920, positionY: 250, metadata: {}, createdAt: now },
      { id: "tariff-n5", workflowId: "wf-tariff", typeId: "decision", label: "Impact Level?", config: { conditions: [{ field: "impactScore", operator: "greaterThan", value: 75 }] }, positionX: 1200, positionY: 250, metadata: {}, createdAt: now },
      { id: "tariff-n6", workflowId: "wf-tariff", typeId: "parallel-gateway", label: "Critical Response", config: { branches: ["vendor", "sourcing", "finance"] }, positionX: 1480, positionY: 100, metadata: {}, createdAt: now },
      { id: "tariff-n7", workflowId: "wf-tariff", typeId: "human-task", label: "Vendor Negotiation", config: { assignee: "procurement@company.com", title: "Negotiate Cost Sharing", priority: "critical" }, positionX: 1760, positionY: 0, metadata: {}, createdAt: now },
      { id: "tariff-n8", workflowId: "wf-tariff", typeId: "human-task", label: "Alternative Sourcing", config: { assignee: "supply-chain@company.com", title: "Identify Alternative Suppliers", priority: "high" }, positionX: 1760, positionY: 140, metadata: {}, createdAt: now },
      { id: "tariff-n9", workflowId: "wf-tariff", typeId: "human-task", label: "Financial Modeling", config: { assignee: "finance@company.com", title: "Model P&L Impact", priority: "high" }, positionX: 1760, positionY: 280, metadata: {}, createdAt: now },
      { id: "tariff-n10", workflowId: "wf-tariff", typeId: "human-task", label: "Standard Mitigation", config: { assignee: "risk-analyst@company.com", title: "Develop Mitigation Plan", priority: "medium" }, positionX: 1480, positionY: 400, metadata: {}, createdAt: now },
      { id: "tariff-n11", workflowId: "wf-tariff", typeId: "transform", label: "Consolidate Actions", config: { mapping: { mitigationPlan: "{{actions}}", estimatedSavings: "{{savings}}" } }, positionX: 2040, positionY: 250, metadata: {}, createdAt: now },
      { id: "tariff-n12", workflowId: "wf-tariff", typeId: "approval", label: "CRO Approval", config: { approvers: ["cro@company.com"], requiredApprovals: 1 }, positionX: 2320, positionY: 250, metadata: {}, createdAt: now },
      { id: "tariff-n13", workflowId: "wf-tariff", typeId: "email-notification", label: "Board Summary", config: { to: ["board@company.com"], subject: "Tariff Mitigation Status Update" }, positionX: 2600, positionY: 250, metadata: {}, createdAt: now },
      { id: "tariff-n14", workflowId: "wf-tariff", typeId: "end", label: "Mitigation Complete", config: {}, positionX: 2880, positionY: 250, metadata: {}, createdAt: now },
      
      // WF-MA-AUDIT: M&A Due Diligence Audit (CAE/Enterprise Audit)
      { id: "ma-n1", workflowId: "wf-ma-audit", typeId: "start", label: "M&A Announced", config: {}, positionX: 80, positionY: 300, metadata: {}, createdAt: now },
      { id: "ma-n2", workflowId: "wf-ma-audit", typeId: "human-task", label: "Initial Scoping", config: { assignee: "cae@company.com", title: "Define Audit Scope for Singapore Acquisition", priority: "high" }, positionX: 360, positionY: 300, metadata: {}, createdAt: now },
      { id: "ma-n3", workflowId: "wf-ma-audit", typeId: "parallel-gateway", label: "Due Diligence Tracks", config: { branches: ["financial", "operational", "compliance", "it"] }, positionX: 640, positionY: 300, metadata: {}, createdAt: now },
      { id: "ma-n4", workflowId: "wf-ma-audit", typeId: "human-task", label: "Financial DD", config: { assignee: "financial-audit@company.com", title: "Review Financial Statements", priority: "critical" }, positionX: 920, positionY: 60, metadata: {}, createdAt: now },
      { id: "ma-n5", workflowId: "wf-ma-audit", typeId: "human-task", label: "Operational DD", config: { assignee: "ops-audit@company.com", title: "Assess Vertical Farming Operations", priority: "high" }, positionX: 920, positionY: 200, metadata: {}, createdAt: now },
      { id: "ma-n6", workflowId: "wf-ma-audit", typeId: "human-task", label: "Compliance DD", config: { assignee: "compliance-audit@company.com", title: "Singapore Regulatory Compliance Review", priority: "high" }, positionX: 920, positionY: 340, metadata: {}, createdAt: now },
      { id: "ma-n7", workflowId: "wf-ma-audit", typeId: "human-task", label: "IT DD", config: { assignee: "it-audit@company.com", title: "Technology & Cybersecurity Assessment", priority: "high" }, positionX: 920, positionY: 480, metadata: {}, createdAt: now },
      { id: "ma-n8", workflowId: "wf-ma-audit", typeId: "transform", label: "Consolidate Findings", config: { mapping: { redFlags: "{{criticalFindings}}", recommendations: "{{actions}}" } }, positionX: 1200, positionY: 300, metadata: {}, createdAt: now },
      { id: "ma-n9", workflowId: "wf-ma-audit", typeId: "ab-issues", label: "Create Finding Issues", config: { action: "create", data: { type: "ma-finding", source: "singapore-acquisition" } }, positionX: 1480, positionY: 300, metadata: {}, createdAt: now },
      { id: "ma-n10", workflowId: "wf-ma-audit", typeId: "decision", label: "Material Issues?", config: { conditions: [{ field: "materialIssues", operator: "greaterThan", value: 0 }] }, positionX: 1760, positionY: 300, metadata: {}, createdAt: now },
      { id: "ma-n11", workflowId: "wf-ma-audit", typeId: "approval", label: "Deal Structure Review", config: { approvers: ["cfo@company.com", "cae@company.com"], requiredApprovals: 2 }, positionX: 2040, positionY: 140, metadata: {}, createdAt: now },
      { id: "ma-n12", workflowId: "wf-ma-audit", typeId: "human-task", label: "Integration Planning", config: { assignee: "integration-lead@company.com", title: "Develop Integration Audit Plan", priority: "medium" }, positionX: 2040, positionY: 460, metadata: {}, createdAt: now },
      { id: "ma-n13", workflowId: "wf-ma-audit", typeId: "email-notification", label: "Audit Committee Report", config: { to: ["audit-committee@company.com"], subject: "Singapore M&A Due Diligence Complete" }, positionX: 2320, positionY: 300, metadata: {}, createdAt: now },
      { id: "ma-n14", workflowId: "wf-ma-audit", typeId: "end", label: "DD Complete", config: {}, positionX: 2600, positionY: 300, metadata: {}, createdAt: now },
      
      // WF-INCIDENT: Log4j Incident Response (CISO/IT Security)
      { id: "inc-n1", workflowId: "wf-incident", typeId: "webhook-trigger", label: "Vulnerability Alert", config: { path: "/security/cve", method: "POST", source: "CVE Monitor" }, positionX: 80, positionY: 250, metadata: {}, createdAt: now },
      { id: "inc-n2", workflowId: "wf-incident", typeId: "data-store", label: "Log Incident", config: { store: "security_incidents", action: "create" }, positionX: 360, positionY: 250, metadata: {}, createdAt: now },
      { id: "inc-n3", workflowId: "wf-incident", typeId: "slack-notification", label: "Alert Security Team", config: { channel: "#security-ops", message: "CRITICAL: Log4j vulnerability detected", priority: "urgent" }, positionX: 640, positionY: 250, metadata: {}, createdAt: now },
      { id: "inc-n4", workflowId: "wf-incident", typeId: "human-task", label: "Initial Triage", config: { assignee: "soc-analyst@company.com", title: "Triage Log4j Alert", priority: "critical", sla: "15m" }, positionX: 920, positionY: 250, metadata: {}, createdAt: now },
      { id: "inc-n5", workflowId: "wf-incident", typeId: "api-call", label: "Scan Infrastructure", config: { url: "/api/security/scan", method: "POST", payload: { scanType: "log4j", scope: "all-systems" } }, positionX: 1200, positionY: 250, metadata: {}, createdAt: now },
      { id: "inc-n6", workflowId: "wf-incident", typeId: "decision", label: "Systems Affected?", config: { conditions: [{ field: "affectedCount", operator: "greaterThan", value: 0 }] }, positionX: 1480, positionY: 250, metadata: {}, createdAt: now },
      { id: "inc-n7", workflowId: "wf-incident", typeId: "parallel-gateway", label: "Remediation Actions", config: { branches: ["patch", "isolate", "notify"] }, positionX: 1760, positionY: 120, metadata: {}, createdAt: now },
      { id: "inc-n8", workflowId: "wf-incident", typeId: "human-task", label: "Deploy Patches", config: { assignee: "infra-team@company.com", title: "Apply Log4j Patches", priority: "critical" }, positionX: 2040, positionY: 0, metadata: {}, createdAt: now },
      { id: "inc-n9", workflowId: "wf-incident", typeId: "api-call", label: "Network Isolation", config: { url: "/api/network/isolate", method: "POST", payload: { affectedHosts: "{{vulnerableHosts}}" } }, positionX: 2040, positionY: 140, metadata: {}, createdAt: now },
      { id: "inc-n10", workflowId: "wf-incident", typeId: "email-notification", label: "Stakeholder Notice", config: { to: ["ciso@company.com", "cro@company.com"], subject: "Log4j Incident Status" }, positionX: 2040, positionY: 280, metadata: {}, createdAt: now },
      { id: "inc-n11", workflowId: "wf-incident", typeId: "human-task", label: "Monitor Only", config: { assignee: "soc-analyst@company.com", title: "Continue Monitoring", priority: "low" }, positionX: 1760, positionY: 400, metadata: {}, createdAt: now },
      { id: "inc-n12", workflowId: "wf-incident", typeId: "human-task", label: "Verify Remediation", config: { assignee: "security-engineer@company.com", title: "Validate Patch Deployment", priority: "high" }, positionX: 2320, positionY: 180, metadata: {}, createdAt: now },
      { id: "inc-n13", workflowId: "wf-incident", typeId: "ab-issues", label: "Compliance Report", config: { action: "create", data: { type: "security-incident", status: "resolved", cve: "CVE-2021-44228" } }, positionX: 2600, positionY: 250, metadata: {}, createdAt: now },
      { id: "inc-n14", workflowId: "wf-incident", typeId: "email-notification", label: "Incident Closed", config: { to: ["security-team@company.com", "compliance@company.com"], subject: "Log4j Incident Resolved" }, positionX: 2880, positionY: 250, metadata: {}, createdAt: now },
      { id: "inc-n15", workflowId: "wf-incident", typeId: "end", label: "Incident Complete", config: {}, positionX: 3160, positionY: 250, metadata: {}, createdAt: now },
      
      // WF4: Audit Evidence Collection - 280px horizontal, 180px vertical
      { id: "wf4-n1", workflowId: "wf4", typeId: "start", label: "Audit Initiated", config: {}, positionX: 80, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf4-n2", workflowId: "wf4", typeId: "ab-audits", label: "Load Audit Scope", config: { action: "query", filters: { auditId: "{{auditId}}", status: "planning" } }, positionX: 360, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf4-n3", workflowId: "wf4", typeId: "ab-controls", label: "Get In-Scope Controls", config: { action: "query", filters: { auditScope: "{{auditId}}" } }, positionX: 640, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf4-n4", workflowId: "wf4", typeId: "loop", label: "For Each Control", config: { iteratorVariable: "control", maxIterations: 50 }, positionX: 920, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf4-n5", workflowId: "wf4", typeId: "human-task", label: "Collect Evidence", config: { assignee: "{{control.owner}}", title: "Submit Evidence for {{control.name}}", priority: "medium", description: "Upload evidence supporting control effectiveness" }, positionX: 1200, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf4-n6", workflowId: "wf4", typeId: "decision", label: "Evidence Sufficient?", config: { conditions: [{ field: "evidenceStatus", operator: "equals", value: "sufficient" }] }, positionX: 1480, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf4-n7", workflowId: "wf4", typeId: "email-notification", label: "Request Additional Evidence", config: { to: ["{{control.owner}}"], subject: "Additional Evidence Required - {{control.name}}" }, positionX: 1760, positionY: 70, metadata: {}, createdAt: now },
      { id: "wf4-n8", workflowId: "wf4", typeId: "approval", label: "Auditor Review", config: { approvers: ["auditor@company.com"], requiredApprovals: 1 }, positionX: 1760, positionY: 430, metadata: {}, createdAt: now },
      { id: "wf4-n9", workflowId: "wf4", typeId: "ab-audits", label: "Update Audit Status", config: { action: "update", data: { evidenceStatus: "complete" } }, positionX: 2040, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf4-n10", workflowId: "wf4", typeId: "end", label: "Collection Complete", config: {}, positionX: 2320, positionY: 250, metadata: {}, createdAt: now },
      
      // WF5: Vendor Risk Management - 280px horizontal, 140px vertical for parallel
      { id: "wf5-n1", workflowId: "wf5", typeId: "start", label: "New Vendor Request", config: {}, positionX: 80, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf5-n2", workflowId: "wf5", typeId: "human-task", label: "Initial Questionnaire", config: { assignee: "vendor-manager@company.com", title: "Complete Vendor Assessment Questionnaire", priority: "medium", description: "Gather initial vendor information" }, positionX: 360, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf5-n3", workflowId: "wf5", typeId: "script", label: "Calculate Criticality", config: { language: "javascript", code: "return calculateVendorCriticality(vendor);" }, positionX: 640, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf5-n4", workflowId: "wf5", typeId: "decision", label: "Critical Vendor?", config: { conditions: [{ field: "criticality", operator: "greaterThan", value: 7 }] }, positionX: 920, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf5-n5", workflowId: "wf5", typeId: "parallel-gateway", label: "Full Assessment", config: { branches: ["security", "financial", "compliance"] }, positionX: 1200, positionY: 120, metadata: {}, createdAt: now },
      { id: "wf5-n6", workflowId: "wf5", typeId: "human-task", label: "Security Review", config: { assignee: "security@company.com", title: "Vendor Security Assessment", priority: "high", description: "Evaluate vendor security posture" }, positionX: 1480, positionY: 0, metadata: {}, createdAt: now },
      { id: "wf5-n7", workflowId: "wf5", typeId: "human-task", label: "Financial Review", config: { assignee: "finance@company.com", title: "Vendor Financial Assessment", priority: "medium", description: "Evaluate vendor financial stability" }, positionX: 1480, positionY: 140, metadata: {}, createdAt: now },
      { id: "wf5-n8", workflowId: "wf5", typeId: "human-task", label: "Compliance Check", config: { assignee: "compliance@company.com", title: "Vendor Compliance Assessment", priority: "medium", description: "Verify regulatory compliance" }, positionX: 1480, positionY: 280, metadata: {}, createdAt: now },
      { id: "wf5-n9", workflowId: "wf5", typeId: "human-task", label: "Standard Review", config: { assignee: "vendor-manager@company.com", title: "Standard Vendor Review", priority: "low", description: "Complete standard vendor evaluation" }, positionX: 1200, positionY: 480, metadata: {}, createdAt: now },
      { id: "wf5-n10", workflowId: "wf5", typeId: "transform", label: "Compile Assessment", config: { mapping: { overallRisk: "{{avgScore}}", recommendation: "{{decision}}" } }, positionX: 1760, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf5-n11", workflowId: "wf5", typeId: "approval", label: "Final Approval", config: { approvers: ["procurement-head@company.com"], requiredApprovals: 1 }, positionX: 2040, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf5-n12", workflowId: "wf5", typeId: "end", label: "Assessment Complete", config: {}, positionX: 2320, positionY: 300, metadata: {}, createdAt: now },
      
      // WF6: Policy Violation Response - 280px horizontal, 200px vertical for branches
      { id: "wf6-n1", workflowId: "wf6", typeId: "start", label: "Violation Detected", config: {}, positionX: 80, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf6-n2", workflowId: "wf6", typeId: "ab-issues", label: "Log Violation", config: { action: "create", data: { type: "policy-violation", status: "new" } }, positionX: 360, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf6-n3", workflowId: "wf6", typeId: "decision", label: "Severity Level?", config: { conditions: [{ field: "severity", operator: "equals", value: "critical" }] }, positionX: 640, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf6-n4", workflowId: "wf6", typeId: "email-notification", label: "Alert Leadership", config: { to: ["ciso@company.com", "cro@company.com"], subject: "CRITICAL: Policy Violation Detected" }, positionX: 920, positionY: 50, metadata: {}, createdAt: now },
      { id: "wf6-n5", workflowId: "wf6", typeId: "human-task", label: "Immediate Investigation", config: { assignee: "security-lead@company.com", title: "Investigate Critical Violation", priority: "critical", description: "Immediate investigation required" }, positionX: 1200, positionY: 50, metadata: {}, createdAt: now },
      { id: "wf6-n6", workflowId: "wf6", typeId: "human-task", label: "Standard Investigation", config: { assignee: "compliance-analyst@company.com", title: "Investigate Policy Violation", priority: "medium", description: "Review violation details and determine root cause" }, positionX: 920, positionY: 450, metadata: {}, createdAt: now },
      { id: "wf6-n7", workflowId: "wf6", typeId: "human-task", label: "Develop Response Plan", config: { assignee: "{{investigator}}", title: "Create Remediation Plan", priority: "high", description: "Develop corrective action plan" }, positionX: 1480, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf6-n8", workflowId: "wf6", typeId: "approval", label: "Response Approval", config: { approvers: ["compliance-head@company.com"], requiredApprovals: 1 }, positionX: 1760, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf6-n9", workflowId: "wf6", typeId: "ab-issues", label: "Update Violation Record", config: { action: "update", data: { status: "remediated", closedDate: "{{now}}" } }, positionX: 2040, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf6-n10", workflowId: "wf6", typeId: "end", label: "Case Closed", config: {}, positionX: 2320, positionY: 250, metadata: {}, createdAt: now },
      
      // WF7: SOX Compliance Certification - 280px horizontal, 200px vertical
      { id: "wf7-n1", workflowId: "wf7", typeId: "start", label: "Certification Period Start", config: {}, positionX: 80, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf7-n2", workflowId: "wf7", typeId: "ab-controls", label: "Get SOX Controls", config: { action: "query", filters: { framework: "SOX", section: "404" } }, positionX: 360, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf7-n3", workflowId: "wf7", typeId: "loop", label: "For Each Control", config: { iteratorVariable: "control", maxIterations: 200 }, positionX: 640, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf7-n4", workflowId: "wf7", typeId: "human-task", label: "Control Owner Attestation", config: { assignee: "{{control.owner}}", title: "Certify Control: {{control.name}}", priority: "high", description: "Confirm control operated effectively during the period" }, positionX: 920, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf7-n5", workflowId: "wf7", typeId: "decision", label: "Exceptions Identified?", config: { conditions: [{ field: "hasExceptions", operator: "equals", value: true }] }, positionX: 1200, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf7-n6", workflowId: "wf7", typeId: "ab-issues", label: "Log Exception", config: { action: "create", data: { type: "sox-exception", priority: "high" } }, positionX: 1480, positionY: 100, metadata: {}, createdAt: now },
      { id: "wf7-n7", workflowId: "wf7", typeId: "approval", label: "Exception Review", config: { approvers: ["sox-coordinator@company.com"], requiredApprovals: 1 }, positionX: 1760, positionY: 100, metadata: {}, createdAt: now },
      { id: "wf7-n8", workflowId: "wf7", typeId: "transform", label: "Compile Certification", config: { mapping: { totalControls: "{{count}}", exceptions: "{{exceptionCount}}", certificationStatus: "{{status}}" } }, positionX: 1480, positionY: 500, metadata: {}, createdAt: now },
      { id: "wf7-n9", workflowId: "wf7", typeId: "approval", label: "CFO Sign-off", config: { approvers: ["cfo@company.com"], requiredApprovals: 1, escalationDays: 3 }, positionX: 1760, positionY: 500, metadata: {}, createdAt: now },
      { id: "wf7-n10", workflowId: "wf7", typeId: "approval", label: "CEO Sign-off", config: { approvers: ["ceo@company.com"], requiredApprovals: 1, escalationDays: 3 }, positionX: 2040, positionY: 500, metadata: {}, createdAt: now },
      { id: "wf7-n11", workflowId: "wf7", typeId: "email-notification", label: "Certification Complete", config: { to: ["audit-committee@company.com", "external-auditor@firm.com"], subject: "SOX 404 Certification Complete" }, positionX: 2320, positionY: 300, metadata: {}, createdAt: now },
      { id: "wf7-n12", workflowId: "wf7", typeId: "end", label: "Period Closed", config: {}, positionX: 2600, positionY: 300, metadata: {}, createdAt: now },
      
      // WF8: Incident Escalation Matrix - 280px horizontal, 140px vertical for dense parallel
      { id: "wf8-n1", workflowId: "wf8", typeId: "start", label: "Incident Reported", config: {}, positionX: 80, positionY: 350, metadata: {}, createdAt: now },
      { id: "wf8-n2", workflowId: "wf8", typeId: "ab-issues", label: "Create Incident", config: { action: "create", data: { type: "incident", status: "new" } }, positionX: 360, positionY: 350, metadata: {}, createdAt: now },
      { id: "wf8-n3", workflowId: "wf8", typeId: "script", label: "Classify Severity", config: { language: "javascript", code: "return classifyIncidentSeverity(incident);" }, positionX: 640, positionY: 350, metadata: {}, createdAt: now },
      { id: "wf8-n4", workflowId: "wf8", typeId: "decision", label: "P1 Critical?", config: { conditions: [{ field: "severity", operator: "equals", value: "P1" }] }, positionX: 920, positionY: 350, metadata: {}, createdAt: now },
      { id: "wf8-n5", workflowId: "wf8", typeId: "parallel-gateway", label: "P1 Response", config: { branches: ["executive", "technical", "communications"] }, positionX: 1200, positionY: 100, metadata: {}, createdAt: now },
      { id: "wf8-n6", workflowId: "wf8", typeId: "email-notification", label: "Executive Alert", config: { to: ["ceo@company.com", "board@company.com"], subject: "P1 INCIDENT: Immediate Executive Attention Required" }, positionX: 1480, positionY: 0, metadata: {}, createdAt: now },
      { id: "wf8-n7", workflowId: "wf8", typeId: "human-task", label: "War Room Activation", config: { assignee: "incident-commander@company.com", title: "Activate Incident Response Team", priority: "critical", description: "Coordinate cross-functional response" }, positionX: 1480, positionY: 140, metadata: {}, createdAt: now },
      { id: "wf8-n8", workflowId: "wf8", typeId: "webhook", label: "Alert PagerDuty", config: { url: "https://events.pagerduty.com/v2/enqueue", method: "POST" }, positionX: 1480, positionY: 280, metadata: {}, createdAt: now },
      { id: "wf8-n9", workflowId: "wf8", typeId: "decision", label: "P2 High?", config: { conditions: [{ field: "severity", operator: "equals", value: "P2" }] }, positionX: 1200, positionY: 500, metadata: {}, createdAt: now },
      { id: "wf8-n10", workflowId: "wf8", typeId: "human-task", label: "Manager Response", config: { assignee: "{{department.manager}}", title: "P2 Incident Response Required", priority: "high", description: "Coordinate department response" }, positionX: 1480, positionY: 420, metadata: {}, createdAt: now },
      { id: "wf8-n11", workflowId: "wf8", typeId: "human-task", label: "Team Lead Response", config: { assignee: "{{team.lead}}", title: "P3/P4 Incident Assignment", priority: "medium", description: "Assign and track resolution" }, positionX: 1480, positionY: 580, metadata: {}, createdAt: now },
      { id: "wf8-n12", workflowId: "wf8", typeId: "transform", label: "Track Resolution", config: { mapping: { responseTime: "{{duration}}", status: "{{currentStatus}}" } }, positionX: 1760, positionY: 350, metadata: {}, createdAt: now },
      { id: "wf8-n13", workflowId: "wf8", typeId: "ab-issues", label: "Close Incident", config: { action: "update", data: { status: "resolved", resolvedDate: "{{now}}" } }, positionX: 2040, positionY: 350, metadata: {}, createdAt: now },
      { id: "wf8-n14", workflowId: "wf8", typeId: "end", label: "Incident Closed", config: {}, positionX: 2320, positionY: 350, metadata: {}, createdAt: now },
      
      // WF9: Regulatory Change Impact - 280px horizontal, 180px vertical
      { id: "wf9-n1", workflowId: "wf9", typeId: "start", label: "Regulatory Update Received", config: {}, positionX: 80, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf9-n2", workflowId: "wf9", typeId: "human-task", label: "Initial Assessment", config: { assignee: "compliance-analyst@company.com", title: "Assess Regulatory Change", priority: "medium", description: "Review new/updated regulation for applicability" }, positionX: 360, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf9-n3", workflowId: "wf9", typeId: "decision", label: "Applicable?", config: { conditions: [{ field: "applicable", operator: "equals", value: true }] }, positionX: 640, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf9-n4", workflowId: "wf9", typeId: "ab-controls", label: "Identify Impacted Controls", config: { action: "query", filters: { regulatoryMapping: "{{regulationId}}" } }, positionX: 920, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf9-n5", workflowId: "wf9", typeId: "ab-risks", label: "Assess Compliance Risk", config: { action: "create", data: { type: "regulatory-risk", source: "{{regulationId}}" } }, positionX: 1200, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf9-n6", workflowId: "wf9", typeId: "human-task", label: "Gap Analysis", config: { assignee: "compliance-lead@company.com", title: "Perform Gap Analysis", priority: "high", description: "Identify gaps between current state and new requirements" }, positionX: 1480, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf9-n7", workflowId: "wf9", typeId: "approval", label: "Implementation Plan Approval", config: { approvers: ["cco@company.com"], requiredApprovals: 1 }, positionX: 1760, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf9-n8", workflowId: "wf9", typeId: "loop", label: "For Each Gap", config: { iteratorVariable: "gap", maxIterations: 20 }, positionX: 2040, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf9-n9", workflowId: "wf9", typeId: "human-task", label: "Implement Change", config: { assignee: "{{gap.owner}}", title: "Implement: {{gap.description}}", priority: "high", description: "Execute remediation action" }, positionX: 2320, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf9-n10", workflowId: "wf9", typeId: "email-notification", label: "Not Applicable Notice", config: { to: ["compliance-team@company.com"], subject: "Regulatory Change - Not Applicable: {{regulationName}}" }, positionX: 640, positionY: 470, metadata: {}, createdAt: now },
      { id: "wf9-n11", workflowId: "wf9", typeId: "end", label: "Complete", config: {}, positionX: 2600, positionY: 250, metadata: {}, createdAt: now },
      
      // WF10: Control Deficiency Remediation - 280px horizontal, 200px vertical
      { id: "wf10-n1", workflowId: "wf10", typeId: "start", label: "Deficiency Identified", config: {}, positionX: 80, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf10-n2", workflowId: "wf10", typeId: "ab-issues", label: "Create Remediation Ticket", config: { action: "create", data: { type: "control-deficiency", status: "open" } }, positionX: 360, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf10-n3", workflowId: "wf10", typeId: "decision", label: "Material Weakness?", config: { conditions: [{ field: "classification", operator: "equals", value: "material-weakness" }] }, positionX: 640, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf10-n4", workflowId: "wf10", typeId: "email-notification", label: "Executive Notification", config: { to: ["cfo@company.com", "audit-committee@company.com"], subject: "MATERIAL WEAKNESS: Immediate Remediation Required" }, positionX: 920, positionY: 50, metadata: {}, createdAt: now },
      { id: "wf10-n5", workflowId: "wf10", typeId: "approval", label: "Remediation Plan Approval", config: { approvers: ["cfo@company.com", "cio@company.com"], requiredApprovals: 2, escalationDays: 2 }, positionX: 1200, positionY: 50, metadata: {}, createdAt: now },
      { id: "wf10-n6", workflowId: "wf10", typeId: "human-task", label: "Standard Remediation Plan", config: { assignee: "control-owner@company.com", title: "Develop Remediation Plan", priority: "medium", description: "Create action plan to address deficiency" }, positionX: 920, positionY: 450, metadata: {}, createdAt: now },
      { id: "wf10-n7", workflowId: "wf10", typeId: "human-task", label: "Execute Remediation", config: { assignee: "{{remediationOwner}}", title: "Execute Remediation Actions", priority: "high", description: "Implement approved remediation steps" }, positionX: 1480, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf10-n8", workflowId: "wf10", typeId: "human-task", label: "Validate Fix", config: { assignee: "internal-audit@company.com", title: "Validate Remediation Effectiveness", priority: "high", description: "Test that remediation addressed the deficiency" }, positionX: 1760, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf10-n9", workflowId: "wf10", typeId: "decision", label: "Validation Passed?", config: { conditions: [{ field: "validationResult", operator: "equals", value: "passed" }] }, positionX: 2040, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf10-n10", workflowId: "wf10", typeId: "ab-issues", label: "Close Deficiency", config: { action: "update", data: { status: "closed", closedDate: "{{now}}" } }, positionX: 2320, positionY: 250, metadata: {}, createdAt: now },
      { id: "wf10-n11", workflowId: "wf10", typeId: "email-notification", label: "Reopen for Rework", config: { to: ["{{remediationOwner}}"], subject: "Remediation Validation Failed - Rework Required" }, positionX: 2040, positionY: 470, metadata: {}, createdAt: now },
      { id: "wf10-n12", workflowId: "wf10", typeId: "end", label: "Remediation Complete", config: {}, positionX: 2600, positionY: 250, metadata: {}, createdAt: now },
    ];
    
    exampleNodes.forEach(n => this.nodes.set(n.id, n));
    
    const exampleEdges: WorkflowEdge[] = [
      // WF-TARIFF: Tariff Impact Mitigation Workflow edges
      { id: "tariff-e1", workflowId: "wf-tariff", sourceNodeId: "tariff-n1", targetNodeId: "tariff-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e2", workflowId: "wf-tariff", sourceNodeId: "tariff-n2", targetNodeId: "tariff-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e3", workflowId: "wf-tariff", sourceNodeId: "tariff-n3", targetNodeId: "tariff-n4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e4", workflowId: "wf-tariff", sourceNodeId: "tariff-n4", targetNodeId: "tariff-n5", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e5", workflowId: "wf-tariff", sourceNodeId: "tariff-n5", targetNodeId: "tariff-n6", sourceHandle: "yes", targetHandle: null, label: "Critical Impact", condition: { impactScore: ">75" }, metadata: {}, createdAt: now },
      { id: "tariff-e6", workflowId: "wf-tariff", sourceNodeId: "tariff-n5", targetNodeId: "tariff-n10", sourceHandle: "no", targetHandle: null, label: "Moderate", condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e7", workflowId: "wf-tariff", sourceNodeId: "tariff-n6", targetNodeId: "tariff-n7", sourceHandle: "branch-1", targetHandle: null, label: "Vendor", condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e8", workflowId: "wf-tariff", sourceNodeId: "tariff-n6", targetNodeId: "tariff-n8", sourceHandle: "branch-2", targetHandle: null, label: "Sourcing", condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e9", workflowId: "wf-tariff", sourceNodeId: "tariff-n6", targetNodeId: "tariff-n9", sourceHandle: "branch-3", targetHandle: null, label: "Finance", condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e10", workflowId: "wf-tariff", sourceNodeId: "tariff-n7", targetNodeId: "tariff-n11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e11", workflowId: "wf-tariff", sourceNodeId: "tariff-n8", targetNodeId: "tariff-n11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e12", workflowId: "wf-tariff", sourceNodeId: "tariff-n9", targetNodeId: "tariff-n11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e13", workflowId: "wf-tariff", sourceNodeId: "tariff-n10", targetNodeId: "tariff-n11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e14", workflowId: "wf-tariff", sourceNodeId: "tariff-n11", targetNodeId: "tariff-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e15", workflowId: "wf-tariff", sourceNodeId: "tariff-n12", targetNodeId: "tariff-n13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "tariff-e16", workflowId: "wf-tariff", sourceNodeId: "tariff-n13", targetNodeId: "tariff-n14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      
      // WF-MA-AUDIT: M&A Due Diligence Audit edges
      { id: "ma-e1", workflowId: "wf-ma-audit", sourceNodeId: "ma-n1", targetNodeId: "ma-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e2", workflowId: "wf-ma-audit", sourceNodeId: "ma-n2", targetNodeId: "ma-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e3", workflowId: "wf-ma-audit", sourceNodeId: "ma-n3", targetNodeId: "ma-n4", sourceHandle: "branch-1", targetHandle: null, label: "Financial", condition: null, metadata: {}, createdAt: now },
      { id: "ma-e4", workflowId: "wf-ma-audit", sourceNodeId: "ma-n3", targetNodeId: "ma-n5", sourceHandle: "branch-2", targetHandle: null, label: "Operational", condition: null, metadata: {}, createdAt: now },
      { id: "ma-e5", workflowId: "wf-ma-audit", sourceNodeId: "ma-n3", targetNodeId: "ma-n6", sourceHandle: "branch-3", targetHandle: null, label: "Compliance", condition: null, metadata: {}, createdAt: now },
      { id: "ma-e6", workflowId: "wf-ma-audit", sourceNodeId: "ma-n3", targetNodeId: "ma-n7", sourceHandle: "branch-4", targetHandle: null, label: "IT", condition: null, metadata: {}, createdAt: now },
      { id: "ma-e7", workflowId: "wf-ma-audit", sourceNodeId: "ma-n4", targetNodeId: "ma-n8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e8", workflowId: "wf-ma-audit", sourceNodeId: "ma-n5", targetNodeId: "ma-n8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e9", workflowId: "wf-ma-audit", sourceNodeId: "ma-n6", targetNodeId: "ma-n8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e10", workflowId: "wf-ma-audit", sourceNodeId: "ma-n7", targetNodeId: "ma-n8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e11", workflowId: "wf-ma-audit", sourceNodeId: "ma-n8", targetNodeId: "ma-n9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e12", workflowId: "wf-ma-audit", sourceNodeId: "ma-n9", targetNodeId: "ma-n10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e13", workflowId: "wf-ma-audit", sourceNodeId: "ma-n10", targetNodeId: "ma-n11", sourceHandle: "yes", targetHandle: null, label: "Material Issues", condition: { materialIssues: ">0" }, metadata: {}, createdAt: now },
      { id: "ma-e14", workflowId: "wf-ma-audit", sourceNodeId: "ma-n10", targetNodeId: "ma-n12", sourceHandle: "no", targetHandle: null, label: "Proceed", condition: null, metadata: {}, createdAt: now },
      { id: "ma-e15", workflowId: "wf-ma-audit", sourceNodeId: "ma-n11", targetNodeId: "ma-n13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e16", workflowId: "wf-ma-audit", sourceNodeId: "ma-n12", targetNodeId: "ma-n13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "ma-e17", workflowId: "wf-ma-audit", sourceNodeId: "ma-n13", targetNodeId: "ma-n14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      
      // WF-INCIDENT: Log4j Incident Response edges
      { id: "inc-e1", workflowId: "wf-incident", sourceNodeId: "inc-n1", targetNodeId: "inc-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e2", workflowId: "wf-incident", sourceNodeId: "inc-n2", targetNodeId: "inc-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e3", workflowId: "wf-incident", sourceNodeId: "inc-n3", targetNodeId: "inc-n4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e4", workflowId: "wf-incident", sourceNodeId: "inc-n4", targetNodeId: "inc-n5", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e5", workflowId: "wf-incident", sourceNodeId: "inc-n5", targetNodeId: "inc-n6", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e6", workflowId: "wf-incident", sourceNodeId: "inc-n6", targetNodeId: "inc-n7", sourceHandle: "yes", targetHandle: null, label: "Systems Affected", condition: { affectedCount: ">0" }, metadata: {}, createdAt: now },
      { id: "inc-e7", workflowId: "wf-incident", sourceNodeId: "inc-n6", targetNodeId: "inc-n11", sourceHandle: "no", targetHandle: null, label: "No Impact", condition: null, metadata: {}, createdAt: now },
      { id: "inc-e8", workflowId: "wf-incident", sourceNodeId: "inc-n7", targetNodeId: "inc-n8", sourceHandle: "branch-1", targetHandle: null, label: "Patch", condition: null, metadata: {}, createdAt: now },
      { id: "inc-e9", workflowId: "wf-incident", sourceNodeId: "inc-n7", targetNodeId: "inc-n9", sourceHandle: "branch-2", targetHandle: null, label: "Isolate", condition: null, metadata: {}, createdAt: now },
      { id: "inc-e10", workflowId: "wf-incident", sourceNodeId: "inc-n7", targetNodeId: "inc-n10", sourceHandle: "branch-3", targetHandle: null, label: "Notify", condition: null, metadata: {}, createdAt: now },
      { id: "inc-e11", workflowId: "wf-incident", sourceNodeId: "inc-n8", targetNodeId: "inc-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e12", workflowId: "wf-incident", sourceNodeId: "inc-n9", targetNodeId: "inc-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e13", workflowId: "wf-incident", sourceNodeId: "inc-n10", targetNodeId: "inc-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e14", workflowId: "wf-incident", sourceNodeId: "inc-n11", targetNodeId: "inc-n13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e15", workflowId: "wf-incident", sourceNodeId: "inc-n12", targetNodeId: "inc-n13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e16", workflowId: "wf-incident", sourceNodeId: "inc-n13", targetNodeId: "inc-n14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "inc-e17", workflowId: "wf-incident", sourceNodeId: "inc-n14", targetNodeId: "inc-n15", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      
      // WF4: Audit Evidence Collection
      { id: "wf4-e1", workflowId: "wf4", sourceNodeId: "wf4-n1", targetNodeId: "wf4-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf4-e2", workflowId: "wf4", sourceNodeId: "wf4-n2", targetNodeId: "wf4-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf4-e3", workflowId: "wf4", sourceNodeId: "wf4-n3", targetNodeId: "wf4-n4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf4-e4", workflowId: "wf4", sourceNodeId: "wf4-n4", targetNodeId: "wf4-n5", sourceHandle: null, targetHandle: null, label: "Loop Body", condition: null, metadata: {}, createdAt: now },
      { id: "wf4-e5", workflowId: "wf4", sourceNodeId: "wf4-n5", targetNodeId: "wf4-n6", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf4-e6", workflowId: "wf4", sourceNodeId: "wf4-n6", targetNodeId: "wf4-n7", sourceHandle: "no", targetHandle: null, label: "Insufficient", condition: null, metadata: {}, createdAt: now },
      { id: "wf4-e7", workflowId: "wf4", sourceNodeId: "wf4-n6", targetNodeId: "wf4-n8", sourceHandle: "yes", targetHandle: null, label: "Sufficient", condition: null, metadata: {}, createdAt: now },
      { id: "wf4-e8", workflowId: "wf4", sourceNodeId: "wf4-n7", targetNodeId: "wf4-n5", sourceHandle: null, targetHandle: null, label: "Retry", condition: null, metadata: {}, createdAt: now },
      { id: "wf4-e9", workflowId: "wf4", sourceNodeId: "wf4-n8", targetNodeId: "wf4-n9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf4-e10", workflowId: "wf4", sourceNodeId: "wf4-n9", targetNodeId: "wf4-n10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      
      // WF5: Vendor Risk Management
      { id: "wf5-e1", workflowId: "wf5", sourceNodeId: "wf5-n1", targetNodeId: "wf5-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e2", workflowId: "wf5", sourceNodeId: "wf5-n2", targetNodeId: "wf5-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e3", workflowId: "wf5", sourceNodeId: "wf5-n3", targetNodeId: "wf5-n4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e4", workflowId: "wf5", sourceNodeId: "wf5-n4", targetNodeId: "wf5-n5", sourceHandle: "yes", targetHandle: null, label: "Critical", condition: { criticality: ">7" }, metadata: {}, createdAt: now },
      { id: "wf5-e5", workflowId: "wf5", sourceNodeId: "wf5-n4", targetNodeId: "wf5-n9", sourceHandle: "no", targetHandle: null, label: "Standard", condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e6", workflowId: "wf5", sourceNodeId: "wf5-n5", targetNodeId: "wf5-n6", sourceHandle: "branch-1", targetHandle: null, label: "Security", condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e7", workflowId: "wf5", sourceNodeId: "wf5-n5", targetNodeId: "wf5-n7", sourceHandle: "branch-2", targetHandle: null, label: "Financial", condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e8", workflowId: "wf5", sourceNodeId: "wf5-n5", targetNodeId: "wf5-n8", sourceHandle: "branch-3", targetHandle: null, label: "Compliance", condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e9", workflowId: "wf5", sourceNodeId: "wf5-n6", targetNodeId: "wf5-n10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e10", workflowId: "wf5", sourceNodeId: "wf5-n7", targetNodeId: "wf5-n10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e11", workflowId: "wf5", sourceNodeId: "wf5-n8", targetNodeId: "wf5-n10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e12", workflowId: "wf5", sourceNodeId: "wf5-n9", targetNodeId: "wf5-n10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e13", workflowId: "wf5", sourceNodeId: "wf5-n10", targetNodeId: "wf5-n11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf5-e14", workflowId: "wf5", sourceNodeId: "wf5-n11", targetNodeId: "wf5-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      
      // WF6: Policy Violation Response
      { id: "wf6-e1", workflowId: "wf6", sourceNodeId: "wf6-n1", targetNodeId: "wf6-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf6-e2", workflowId: "wf6", sourceNodeId: "wf6-n2", targetNodeId: "wf6-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf6-e3", workflowId: "wf6", sourceNodeId: "wf6-n3", targetNodeId: "wf6-n4", sourceHandle: "yes", targetHandle: null, label: "Critical", condition: { severity: "critical" }, metadata: {}, createdAt: now },
      { id: "wf6-e4", workflowId: "wf6", sourceNodeId: "wf6-n3", targetNodeId: "wf6-n6", sourceHandle: "no", targetHandle: null, label: "Standard", condition: null, metadata: {}, createdAt: now },
      { id: "wf6-e5", workflowId: "wf6", sourceNodeId: "wf6-n4", targetNodeId: "wf6-n5", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf6-e6", workflowId: "wf6", sourceNodeId: "wf6-n5", targetNodeId: "wf6-n7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf6-e7", workflowId: "wf6", sourceNodeId: "wf6-n6", targetNodeId: "wf6-n7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf6-e8", workflowId: "wf6", sourceNodeId: "wf6-n7", targetNodeId: "wf6-n8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf6-e9", workflowId: "wf6", sourceNodeId: "wf6-n8", targetNodeId: "wf6-n9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf6-e10", workflowId: "wf6", sourceNodeId: "wf6-n9", targetNodeId: "wf6-n10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      
      // WF7: SOX Compliance Certification
      { id: "wf7-e1", workflowId: "wf7", sourceNodeId: "wf7-n1", targetNodeId: "wf7-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e2", workflowId: "wf7", sourceNodeId: "wf7-n2", targetNodeId: "wf7-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e3", workflowId: "wf7", sourceNodeId: "wf7-n3", targetNodeId: "wf7-n4", sourceHandle: null, targetHandle: null, label: "Loop Body", condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e4", workflowId: "wf7", sourceNodeId: "wf7-n4", targetNodeId: "wf7-n5", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e5", workflowId: "wf7", sourceNodeId: "wf7-n5", targetNodeId: "wf7-n6", sourceHandle: "yes", targetHandle: null, label: "Has Exceptions", condition: { hasExceptions: true }, metadata: {}, createdAt: now },
      { id: "wf7-e6", workflowId: "wf7", sourceNodeId: "wf7-n5", targetNodeId: "wf7-n8", sourceHandle: "no", targetHandle: null, label: "No Exceptions", condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e7", workflowId: "wf7", sourceNodeId: "wf7-n6", targetNodeId: "wf7-n7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e8", workflowId: "wf7", sourceNodeId: "wf7-n7", targetNodeId: "wf7-n8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e9", workflowId: "wf7", sourceNodeId: "wf7-n8", targetNodeId: "wf7-n9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e10", workflowId: "wf7", sourceNodeId: "wf7-n9", targetNodeId: "wf7-n10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e11", workflowId: "wf7", sourceNodeId: "wf7-n10", targetNodeId: "wf7-n11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf7-e12", workflowId: "wf7", sourceNodeId: "wf7-n11", targetNodeId: "wf7-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      
      // WF8: Incident Escalation Matrix
      { id: "wf8-e1", workflowId: "wf8", sourceNodeId: "wf8-n1", targetNodeId: "wf8-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e2", workflowId: "wf8", sourceNodeId: "wf8-n2", targetNodeId: "wf8-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e3", workflowId: "wf8", sourceNodeId: "wf8-n3", targetNodeId: "wf8-n4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e4", workflowId: "wf8", sourceNodeId: "wf8-n4", targetNodeId: "wf8-n5", sourceHandle: "yes", targetHandle: null, label: "P1 Critical", condition: { severity: "P1" }, metadata: {}, createdAt: now },
      { id: "wf8-e5", workflowId: "wf8", sourceNodeId: "wf8-n4", targetNodeId: "wf8-n9", sourceHandle: "no", targetHandle: null, label: "Check P2", condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e6", workflowId: "wf8", sourceNodeId: "wf8-n5", targetNodeId: "wf8-n6", sourceHandle: "branch-1", targetHandle: null, label: "Executive", condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e7", workflowId: "wf8", sourceNodeId: "wf8-n5", targetNodeId: "wf8-n7", sourceHandle: "branch-2", targetHandle: null, label: "Technical", condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e8", workflowId: "wf8", sourceNodeId: "wf8-n5", targetNodeId: "wf8-n8", sourceHandle: "branch-3", targetHandle: null, label: "Communications", condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e9", workflowId: "wf8", sourceNodeId: "wf8-n6", targetNodeId: "wf8-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e10", workflowId: "wf8", sourceNodeId: "wf8-n7", targetNodeId: "wf8-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e11", workflowId: "wf8", sourceNodeId: "wf8-n8", targetNodeId: "wf8-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e12", workflowId: "wf8", sourceNodeId: "wf8-n9", targetNodeId: "wf8-n10", sourceHandle: "yes", targetHandle: null, label: "P2 High", condition: { severity: "P2" }, metadata: {}, createdAt: now },
      { id: "wf8-e13", workflowId: "wf8", sourceNodeId: "wf8-n9", targetNodeId: "wf8-n11", sourceHandle: "no", targetHandle: null, label: "P3/P4", condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e14", workflowId: "wf8", sourceNodeId: "wf8-n10", targetNodeId: "wf8-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e15", workflowId: "wf8", sourceNodeId: "wf8-n11", targetNodeId: "wf8-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e16", workflowId: "wf8", sourceNodeId: "wf8-n12", targetNodeId: "wf8-n13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf8-e17", workflowId: "wf8", sourceNodeId: "wf8-n13", targetNodeId: "wf8-n14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      
      // WF9: Regulatory Change Impact
      { id: "wf9-e1", workflowId: "wf9", sourceNodeId: "wf9-n1", targetNodeId: "wf9-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf9-e2", workflowId: "wf9", sourceNodeId: "wf9-n2", targetNodeId: "wf9-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf9-e3", workflowId: "wf9", sourceNodeId: "wf9-n3", targetNodeId: "wf9-n4", sourceHandle: "yes", targetHandle: null, label: "Applicable", condition: { applicable: true }, metadata: {}, createdAt: now },
      { id: "wf9-e4", workflowId: "wf9", sourceNodeId: "wf9-n3", targetNodeId: "wf9-n10", sourceHandle: "no", targetHandle: null, label: "Not Applicable", condition: null, metadata: {}, createdAt: now },
      { id: "wf9-e5", workflowId: "wf9", sourceNodeId: "wf9-n4", targetNodeId: "wf9-n5", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf9-e6", workflowId: "wf9", sourceNodeId: "wf9-n5", targetNodeId: "wf9-n6", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf9-e7", workflowId: "wf9", sourceNodeId: "wf9-n6", targetNodeId: "wf9-n7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf9-e8", workflowId: "wf9", sourceNodeId: "wf9-n7", targetNodeId: "wf9-n8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf9-e9", workflowId: "wf9", sourceNodeId: "wf9-n8", targetNodeId: "wf9-n9", sourceHandle: null, targetHandle: null, label: "Loop Body", condition: null, metadata: {}, createdAt: now },
      { id: "wf9-e10", workflowId: "wf9", sourceNodeId: "wf9-n9", targetNodeId: "wf9-n11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf9-e11", workflowId: "wf9", sourceNodeId: "wf9-n10", targetNodeId: "wf9-n11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      
      // WF10: Control Deficiency Remediation
      { id: "wf10-e1", workflowId: "wf10", sourceNodeId: "wf10-n1", targetNodeId: "wf10-n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e2", workflowId: "wf10", sourceNodeId: "wf10-n2", targetNodeId: "wf10-n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e3", workflowId: "wf10", sourceNodeId: "wf10-n3", targetNodeId: "wf10-n4", sourceHandle: "yes", targetHandle: null, label: "Material", condition: { classification: "material-weakness" }, metadata: {}, createdAt: now },
      { id: "wf10-e4", workflowId: "wf10", sourceNodeId: "wf10-n3", targetNodeId: "wf10-n6", sourceHandle: "no", targetHandle: null, label: "Non-Material", condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e5", workflowId: "wf10", sourceNodeId: "wf10-n4", targetNodeId: "wf10-n5", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e6", workflowId: "wf10", sourceNodeId: "wf10-n5", targetNodeId: "wf10-n7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e7", workflowId: "wf10", sourceNodeId: "wf10-n6", targetNodeId: "wf10-n7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e8", workflowId: "wf10", sourceNodeId: "wf10-n7", targetNodeId: "wf10-n8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e9", workflowId: "wf10", sourceNodeId: "wf10-n8", targetNodeId: "wf10-n9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e10", workflowId: "wf10", sourceNodeId: "wf10-n9", targetNodeId: "wf10-n10", sourceHandle: "yes", targetHandle: null, label: "Passed", condition: { validationResult: "passed" }, metadata: {}, createdAt: now },
      { id: "wf10-e11", workflowId: "wf10", sourceNodeId: "wf10-n9", targetNodeId: "wf10-n11", sourceHandle: "no", targetHandle: null, label: "Failed", condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e12", workflowId: "wf10", sourceNodeId: "wf10-n10", targetNodeId: "wf10-n12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "wf10-e13", workflowId: "wf10", sourceNodeId: "wf10-n11", targetNodeId: "wf10-n7", sourceHandle: null, targetHandle: null, label: "Retry", condition: null, metadata: {}, createdAt: now },
    ];
    
    exampleEdges.forEach(e => this.edges.set(e.id, e));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      email: insertUser.email || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = randomUUID();
    const now = new Date();
    const workflow: Workflow = {
      id,
      name: insertWorkflow.name,
      description: insertWorkflow.description || null,
      status: insertWorkflow.status || "draft",
      tags: insertWorkflow.tags || null,
      ownerId: insertWorkflow.ownerId || null,
      visibility: insertWorkflow.visibility || "private",
      version: insertWorkflow.version || 1,
      createdAt: now,
      updatedAt: now,
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: string, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updated: Workflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date(),
    };
    this.workflows.set(id, updated);
    return updated;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    const nodes = await this.getNodes(id);
    nodes.forEach(n => this.nodes.delete(n.id));
    
    const edges = await this.getEdges(id);
    edges.forEach(e => this.edges.delete(e.id));
    
    return this.workflows.delete(id);
  }

  async getNodes(workflowId: string): Promise<WorkflowNode[]> {
    return Array.from(this.nodes.values()).filter(n => n.workflowId === workflowId);
  }

  async getNode(id: string): Promise<WorkflowNode | undefined> {
    return this.nodes.get(id);
  }

  async createNode(insertNode: InsertNode): Promise<WorkflowNode> {
    const id = randomUUID();
    const node: WorkflowNode = {
      id,
      workflowId: insertNode.workflowId,
      typeId: insertNode.typeId,
      label: insertNode.label,
      config: insertNode.config || {},
      positionX: insertNode.positionX ?? 0,
      positionY: insertNode.positionY ?? 0,
      metadata: insertNode.metadata || {},
      createdAt: new Date(),
    };
    this.nodes.set(id, node);
    return node;
  }

  async updateNode(id: string, updates: Partial<InsertNode>): Promise<WorkflowNode | undefined> {
    const node = this.nodes.get(id);
    if (!node) return undefined;
    
    const updated: WorkflowNode = { ...node, ...updates };
    this.nodes.set(id, updated);
    return updated;
  }

  async deleteNode(id: string): Promise<boolean> {
    const edges = Array.from(this.edges.values()).filter(
      e => e.sourceNodeId === id || e.targetNodeId === id
    );
    edges.forEach(e => this.edges.delete(e.id));
    
    return this.nodes.delete(id);
  }

  async getEdges(workflowId: string): Promise<WorkflowEdge[]> {
    return Array.from(this.edges.values()).filter(e => e.workflowId === workflowId);
  }

  async getEdge(id: string): Promise<WorkflowEdge | undefined> {
    return this.edges.get(id);
  }

  async createEdge(insertEdge: InsertEdge): Promise<WorkflowEdge> {
    const id = randomUUID();
    const edge: WorkflowEdge = {
      id,
      workflowId: insertEdge.workflowId,
      sourceNodeId: insertEdge.sourceNodeId,
      targetNodeId: insertEdge.targetNodeId,
      sourceHandle: insertEdge.sourceHandle || null,
      targetHandle: insertEdge.targetHandle || null,
      label: insertEdge.label || null,
      condition: insertEdge.condition || null,
      metadata: insertEdge.metadata || {},
      createdAt: new Date(),
    };
    this.edges.set(id, edge);
    return edge;
  }

  async updateEdge(id: string, updates: Partial<InsertEdge>): Promise<WorkflowEdge | undefined> {
    const edge = this.edges.get(id);
    if (!edge) return undefined;
    
    const updated: WorkflowEdge = { ...edge, ...updates };
    this.edges.set(id, updated);
    return updated;
  }

  async deleteEdge(id: string): Promise<boolean> {
    return this.edges.delete(id);
  }

  async deleteNodesByWorkflow(workflowId: string): Promise<number> {
    const nodes = await this.getNodes(workflowId);
    nodes.forEach(n => this.nodes.delete(n.id));
    return nodes.length;
  }

  async deleteEdgesByWorkflow(workflowId: string): Promise<number> {
    const edges = await this.getEdges(workflowId);
    edges.forEach(e => this.edges.delete(e.id));
    return edges.length;
  }

  async createWorkflowWithContents(
    workflowData: InsertWorkflow,
    nodeSpecs: BatchNodeSpec[],
    edgeSpecs: BatchEdgeSpec[]
  ): Promise<BatchWorkflowResult> {
    const workflow = await this.createWorkflow(workflowData);
    const tempIdMapping: Record<string, string> = {};
    const nodes: WorkflowNode[] = [];
    const edges: WorkflowEdge[] = [];

    for (const spec of nodeSpecs) {
      const node = await this.createNode({
        workflowId: workflow.id,
        typeId: spec.typeId,
        label: spec.label,
        config: spec.config || {},
        positionX: spec.positionX,
        positionY: spec.positionY,
        metadata: spec.metadata || {},
      });
      tempIdMapping[spec.tempId] = node.id;
      nodes.push(node);
    }

    for (const spec of edgeSpecs) {
      const sourceNodeId = tempIdMapping[spec.sourceTempId];
      const targetNodeId = tempIdMapping[spec.targetTempId];
      if (!sourceNodeId || !targetNodeId) {
        console.warn(`Skipping edge: missing mapping for ${spec.sourceTempId} -> ${spec.targetTempId}`);
        continue;
      }
      const edge = await this.createEdge({
        workflowId: workflow.id,
        sourceNodeId,
        targetNodeId,
        sourceHandle: spec.sourceHandle || null,
        targetHandle: spec.targetHandle || null,
        label: spec.label || null,
        condition: spec.condition || null,
        metadata: spec.metadata || {},
      });
      edges.push(edge);
    }

    return { workflow, nodes, edges, tempIdMapping };
  }

  async duplicateWorkflow(id: string, newName?: string): Promise<BatchWorkflowResult | undefined> {
    const original = await this.getWorkflow(id);
    if (!original) return undefined;

    const originalNodes = await this.getNodes(id);
    const originalEdges = await this.getEdges(id);

    const nodeSpecs: BatchNodeSpec[] = originalNodes.map((n, i) => ({
      tempId: `dup-${i}`,
      typeId: n.typeId,
      label: n.label,
      config: n.config as Record<string, unknown>,
      positionX: n.positionX,
      positionY: n.positionY,
      metadata: n.metadata as Record<string, unknown>,
    }));

    const oldIdToTempId: Record<string, string> = {};
    originalNodes.forEach((n, i) => {
      oldIdToTempId[n.id] = `dup-${i}`;
    });

    const edgeSpecs: BatchEdgeSpec[] = originalEdges.map(e => ({
      sourceTempId: oldIdToTempId[e.sourceNodeId],
      targetTempId: oldIdToTempId[e.targetNodeId],
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      label: e.label,
      condition: e.condition,
      metadata: e.metadata as Record<string, unknown>,
    }));

    return this.createWorkflowWithContents(
      {
        name: newName || `${original.name} (Copy)`,
        description: original.description,
        status: "draft",
        tags: original.tags,
        visibility: original.visibility,
        version: 1,
      },
      nodeSpecs,
      edgeSpecs
    );
  }

  async clearWorkflowContents(workflowId: string): Promise<{ nodesDeleted: number; edgesDeleted: number }> {
    const edgesDeleted = await this.deleteEdgesByWorkflow(workflowId);
    const nodesDeleted = await this.deleteNodesByWorkflow(workflowId);
    return { nodesDeleted, edgesDeleted };
  }

  async getSession(id: string): Promise<AssistantSession | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByWorkflow(workflowId: string): Promise<AssistantSession | undefined> {
    return Array.from(this.sessions.values()).find(s => s.workflowId === workflowId);
  }

  async createSession(insertSession: InsertSession): Promise<AssistantSession> {
    const id = randomUUID();
    const now = new Date();
    const session: AssistantSession = {
      id,
      workflowId: insertSession.workflowId || null,
      messages: insertSession.messages || [],
      selectedNodeIds: insertSession.selectedNodeIds || null,
      currentIntent: insertSession.currentIntent || null,
      suggestedActions: insertSession.suggestedActions || [],
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<InsertSession>): Promise<AssistantSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updated: AssistantSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };
    this.sessions.set(id, updated);
    return updated;
  }

  async addMessageToSession(sessionId: string, message: ChatMessage): Promise<AssistantSession | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    const messages = Array.isArray(session.messages) ? session.messages : [];
    const updated: AssistantSession = {
      ...session,
      messages: [...messages, message],
      updatedAt: new Date(),
    };
    this.sessions.set(sessionId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
