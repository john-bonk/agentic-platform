/**
 * Comprehensive GRC Workflow Template Library
 * 
 * Contains 10 fully-defined workflow templates with all nodes and edges,
 * maximizing permutations of GRC compliance patterns.
 */

import type { InsertWorkflow } from "@shared/schema";
import type { BatchNodeSpec, BatchEdgeSpec } from "./storage";

export interface WorkflowTemplate {
  workflow: Omit<InsertWorkflow, "ownerId">;
  nodes: BatchNodeSpec[];
  edges: BatchEdgeSpec[];
}

/**
 * Template 1: Issue Review Workflow
 * Linear flow with priority-based branching
 */
const issueReviewWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Issue Review Workflow",
    description: "Automated issue review and approval process with priority routing",
    status: "active",
    tags: ["grc", "issues", "review"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "start", label: "Start", config: {}, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "ab-issues", label: "Query Open Issues", config: { action: "query", filters: { status: "open" } }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "decision", label: "High Priority?", config: { conditions: [{ field: "priority", operator: "equals", value: "high" }] }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "approval", label: "Manager Approval", config: { approvers: ["manager@company.com"], requiredApprovals: 1 }, positionX: 700, positionY: 100, metadata: {} },
    { tempId: "t5", typeId: "human-task", label: "Standard Review", config: { assignee: "reviewer@company.com", title: "Review Issue" }, positionX: 700, positionY: 300, metadata: {} },
    { tempId: "t6", typeId: "email-notification", label: "Send Summary", config: { to: ["team@company.com"], subject: "Issue Review Complete" }, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t7", typeId: "end", label: "End", config: {}, positionX: 1100, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: "yes", targetHandle: null, label: "High Priority", condition: { field: "priority", value: "high" }, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t5", sourceHandle: "no", targetHandle: null, label: "Normal", condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t6", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t6", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 2: Control Testing Automation
 * Scheduled workflow with parallel testing paths
 */
const controlTestingWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Control Testing Automation",
    description: "Automated control testing with parallel execution and consolidated results",
    status: "active",
    tags: ["controls", "testing", "automation"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "schedule-trigger", label: "Quarterly Schedule", config: { cron: "0 0 1 */3 *", timezone: "UTC" }, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "ab-controls", label: "Get Active Controls", config: { action: "query", filters: { status: "active" } }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "parallel-gateway", label: "Split Testing", config: { mode: "all" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "human-task", label: "Manual Testing", config: { assignee: "auditor@company.com", title: "Perform Manual Test" }, positionX: 700, positionY: 100, metadata: {} },
    { tempId: "t5", typeId: "api-call", label: "Automated Testing", config: { url: "/api/controls/autotest", method: "POST" }, positionX: 700, positionY: 300, metadata: {} },
    { tempId: "t6", typeId: "parallel-gateway", label: "Join Results", config: { mode: "all" }, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t7", typeId: "data-transform", label: "Consolidate Results", config: { transformation: "merge" }, positionX: 1100, positionY: 200, metadata: {} },
    { tempId: "t8", typeId: "email-notification", label: "Send Report", config: { to: ["compliance@company.com"], subject: "Control Testing Complete" }, positionX: 1300, positionY: 200, metadata: {} },
    { tempId: "t9", typeId: "end", label: "End", config: {}, positionX: 1500, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: "branch-1", targetHandle: null, label: "Manual Path", condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t5", sourceHandle: "branch-2", targetHandle: null, label: "Automated Path", condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t6", sourceHandle: null, targetHandle: "join-1", label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t6", sourceHandle: null, targetHandle: "join-2", label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 3: Risk Assessment Pipeline
 * Multi-stage risk evaluation with escalation paths
 */
const riskAssessmentWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Risk Assessment Pipeline",
    description: "End-to-end risk assessment with severity-based routing and mitigation tracking",
    status: "active",
    tags: ["risks", "assessment", "mitigation"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "webhook-trigger", label: "Risk Identified", config: { path: "/risks/new", method: "POST" }, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "ab-risks", label: "Create Risk Record", config: { action: "create" }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "llm-task", label: "AI Risk Scoring", config: { prompt: "Analyze risk severity based on impact and likelihood" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "decision", label: "Severity Level?", config: { conditions: [{ field: "severity", operator: "gte", value: 8 }] }, positionX: 700, positionY: 200, metadata: {} },
    { tempId: "t5", typeId: "approval", label: "Executive Review", config: { approvers: ["cro@company.com", "ciso@company.com"], requiredApprovals: 2 }, positionX: 900, positionY: 80, metadata: {} },
    { tempId: "t6", typeId: "approval", label: "Manager Review", config: { approvers: ["risk-manager@company.com"], requiredApprovals: 1 }, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t7", typeId: "human-task", label: "Standard Assessment", config: { assignee: "risk-analyst@company.com" }, positionX: 900, positionY: 320, metadata: {} },
    { tempId: "t8", typeId: "human-task", label: "Develop Mitigation Plan", config: { assignee: "risk-owner@company.com", title: "Create Mitigation Strategy" }, positionX: 1100, positionY: 200, metadata: {} },
    { tempId: "t9", typeId: "ab-risks", label: "Update Risk Status", config: { action: "update", status: "mitigated" }, positionX: 1300, positionY: 200, metadata: {} },
    { tempId: "t10", typeId: "email-notification", label: "Notify Stakeholders", config: { to: ["stakeholders@company.com"] }, positionX: 1500, positionY: 200, metadata: {} },
    { tempId: "t11", typeId: "end", label: "End", config: {}, positionX: 1700, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t5", sourceHandle: "critical", targetHandle: null, label: "Critical (8-10)", condition: { field: "severity", operator: "gte", value: 8 }, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t6", sourceHandle: "high", targetHandle: null, label: "High (5-7)", condition: { field: "severity", operator: "between", value: [5, 7] }, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t7", sourceHandle: "low", targetHandle: null, label: "Low (1-4)", condition: { field: "severity", operator: "lt", value: 5 }, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 4: Aggregate Approval Workflow
 * Parallel reviews with consolidated final approval (GRC compliance pattern)
 */
const aggregateApprovalWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Aggregate Approval Workflow",
    description: "Multi-reviewer parallel assessment with consolidated final approval for compliance",
    status: "active",
    tags: ["approval", "compliance", "multi-level"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "start", label: "Start", config: {}, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "human-task", label: "Prepare Documentation", config: { assignee: "preparer@company.com" }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "parallel-gateway", label: "Distribute Reviews", config: { mode: "all" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "approval", label: "Legal Review", config: { approvers: ["legal@company.com"], department: "Legal" }, positionX: 700, positionY: 50, metadata: {} },
    { tempId: "t5", typeId: "approval", label: "Finance Review", config: { approvers: ["finance@company.com"], department: "Finance" }, positionX: 700, positionY: 150, metadata: {} },
    { tempId: "t6", typeId: "approval", label: "Compliance Review", config: { approvers: ["compliance@company.com"], department: "Compliance" }, positionX: 700, positionY: 250, metadata: {} },
    { tempId: "t7", typeId: "approval", label: "Security Review", config: { approvers: ["security@company.com"], department: "Security" }, positionX: 700, positionY: 350, metadata: {} },
    { tempId: "t8", typeId: "parallel-gateway", label: "Collect Responses", config: { mode: "all" }, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t9", typeId: "data-transform", label: "Aggregate Decisions", config: { transformation: "aggregate", rule: "all-approved" }, positionX: 1100, positionY: 200, metadata: {} },
    { tempId: "t10", typeId: "decision", label: "All Approved?", config: { conditions: [{ field: "allApproved", operator: "equals", value: true }] }, positionX: 1300, positionY: 200, metadata: {} },
    { tempId: "t11", typeId: "approval", label: "Final Executive Approval", config: { approvers: ["ceo@company.com"], requiredApprovals: 1 }, positionX: 1500, positionY: 100, metadata: {} },
    { tempId: "t12", typeId: "human-task", label: "Address Rejections", config: { assignee: "preparer@company.com" }, positionX: 1500, positionY: 300, metadata: {} },
    { tempId: "t13", typeId: "email-notification", label: "Approval Complete", config: { to: ["stakeholders@company.com"], subject: "Approval Complete" }, positionX: 1700, positionY: 100, metadata: {} },
    { tempId: "t14", typeId: "end", label: "End", config: {}, positionX: 1900, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: "branch-1", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t5", sourceHandle: "branch-2", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t6", sourceHandle: "branch-3", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t7", sourceHandle: "branch-4", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t8", sourceHandle: null, targetHandle: "join-1", label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t8", sourceHandle: null, targetHandle: "join-2", label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t8", sourceHandle: null, targetHandle: "join-3", label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t8", sourceHandle: null, targetHandle: "join-4", label: null, condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: "yes", targetHandle: null, label: "Approved", condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t12", sourceHandle: "no", targetHandle: null, label: "Rejected", condition: null, metadata: {} },
    { sourceTempId: "t11", targetTempId: "t13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: "Retry", condition: null, metadata: {} },
    { sourceTempId: "t13", targetTempId: "t14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 5: Policy Exception Workflow
 * Exception request with tiered approval and expiration tracking
 */
const policyExceptionWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Policy Exception Workflow",
    description: "Structured policy exception request with risk assessment and time-bound approval",
    status: "active",
    tags: ["policy", "exception", "governance"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "start", label: "Exception Request", config: {}, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "human-task", label: "Document Exception", config: { assignee: "requestor@company.com", fields: ["justification", "duration", "impact"] }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "llm-task", label: "Risk Analysis", config: { prompt: "Analyze policy exception risk and suggest controls" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "decision", label: "Risk Level?", config: {}, positionX: 700, positionY: 200, metadata: {} },
    { tempId: "t5", typeId: "approval", label: "Department Head", config: { approvers: ["dept-head@company.com"] }, positionX: 900, positionY: 300, metadata: {} },
    { tempId: "t6", typeId: "approval", label: "Compliance Officer", config: { approvers: ["compliance@company.com"] }, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t7", typeId: "approval", label: "Executive Committee", config: { approvers: ["exec-committee@company.com"], requiredApprovals: 3 }, positionX: 900, positionY: 100, metadata: {} },
    { tempId: "t8", typeId: "decision", label: "Approved?", config: {}, positionX: 1100, positionY: 200, metadata: {} },
    { tempId: "t9", typeId: "data-store", label: "Record Exception", config: { store: "policy_exceptions" }, positionX: 1300, positionY: 150, metadata: {} },
    { tempId: "t10", typeId: "wait-timer", label: "Wait Until Expiry", config: { duration: "{{exceptionDuration}}" }, positionX: 1500, positionY: 150, metadata: {} },
    { tempId: "t11", typeId: "email-notification", label: "Expiry Notice", config: { to: ["requestor@company.com"], subject: "Policy Exception Expiring" }, positionX: 1700, positionY: 150, metadata: {} },
    { tempId: "t12", typeId: "email-notification", label: "Rejection Notice", config: { to: ["requestor@company.com"], subject: "Exception Denied" }, positionX: 1300, positionY: 300, metadata: {} },
    { tempId: "t13", typeId: "end", label: "End", config: {}, positionX: 1900, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t5", sourceHandle: "low", targetHandle: null, label: "Low Risk", condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t6", sourceHandle: "medium", targetHandle: null, label: "Medium Risk", condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t7", sourceHandle: "high", targetHandle: null, label: "High Risk", condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t8", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t9", sourceHandle: "yes", targetHandle: null, label: "Approved", condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t12", sourceHandle: "no", targetHandle: null, label: "Rejected", condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t11", targetTempId: "t13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 6: Incident Response Workflow
 * Real-time incident handling with escalation and communication
 */
const incidentResponseWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Incident Response Workflow",
    description: "Real-time security incident response with triage, escalation, and resolution tracking",
    status: "active",
    tags: ["incident", "security", "response"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "webhook-trigger", label: "Incident Alert", config: { path: "/incidents/alert", method: "POST" }, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "data-store", label: "Log Incident", config: { store: "incidents", action: "create" }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "slack-notification", label: "Alert On-Call", config: { channel: "#incident-response", message: "New incident reported" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "human-task", label: "Initial Triage", config: { assignee: "on-call@company.com", sla: "15m" }, positionX: 700, positionY: 200, metadata: {} },
    { tempId: "t5", typeId: "decision", label: "Severity?", config: {}, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t6", typeId: "parallel-gateway", label: "Critical Response", config: { mode: "all" }, positionX: 1100, positionY: 80, metadata: {} },
    { tempId: "t7", typeId: "slack-notification", label: "Page Leadership", config: { channel: "#executives", priority: "critical" }, positionX: 1300, positionY: 30, metadata: {} },
    { tempId: "t8", typeId: "human-task", label: "War Room Setup", config: { assignee: "incident-commander@company.com" }, positionX: 1300, positionY: 130, metadata: {} },
    { tempId: "t9", typeId: "human-task", label: "Containment", config: { assignee: "security-team@company.com" }, positionX: 1100, positionY: 200, metadata: {} },
    { tempId: "t10", typeId: "human-task", label: "Quick Fix", config: { assignee: "on-call@company.com" }, positionX: 1100, positionY: 320, metadata: {} },
    { tempId: "t11", typeId: "human-task", label: "Resolution", config: { assignee: "assigned-engineer@company.com" }, positionX: 1500, positionY: 200, metadata: {} },
    { tempId: "t12", typeId: "human-task", label: "Post-Mortem", config: { assignee: "incident-commander@company.com" }, positionX: 1700, positionY: 200, metadata: {} },
    { tempId: "t13", typeId: "email-notification", label: "Close Notification", config: { to: ["stakeholders@company.com"] }, positionX: 1900, positionY: 200, metadata: {} },
    { tempId: "t14", typeId: "end", label: "End", config: {}, positionX: 2100, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t5", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t6", sourceHandle: "critical", targetHandle: null, label: "P1 Critical", condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t9", sourceHandle: "high", targetHandle: null, label: "P2 High", condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t10", sourceHandle: "low", targetHandle: null, label: "P3/P4 Low", condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t7", sourceHandle: "branch-1", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t8", sourceHandle: "branch-2", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t11", targetTempId: "t12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t13", targetTempId: "t14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 7: Vendor Due Diligence Workflow
 * Third-party risk assessment and onboarding
 */
const vendorDueDiligenceWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Vendor Due Diligence Workflow",
    description: "Comprehensive vendor assessment including security, compliance, and financial review",
    status: "active",
    tags: ["vendor", "due-diligence", "third-party"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "start", label: "Vendor Request", config: {}, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "human-task", label: "Collect Questionnaire", config: { assignee: "procurement@company.com" }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "parallel-gateway", label: "Parallel Reviews", config: { mode: "all" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "human-task", label: "Security Assessment", config: { assignee: "security@company.com" }, positionX: 700, positionY: 80, metadata: {} },
    { tempId: "t5", typeId: "human-task", label: "Compliance Check", config: { assignee: "compliance@company.com" }, positionX: 700, positionY: 180, metadata: {} },
    { tempId: "t6", typeId: "human-task", label: "Financial Review", config: { assignee: "finance@company.com" }, positionX: 700, positionY: 280, metadata: {} },
    { tempId: "t7", typeId: "api-call", label: "Credit Check API", config: { url: "https://api.creditcheck.com/vendor", method: "POST" }, positionX: 700, positionY: 380, metadata: {} },
    { tempId: "t8", typeId: "parallel-gateway", label: "Consolidate", config: { mode: "all" }, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t9", typeId: "data-transform", label: "Calculate Risk Score", config: { formula: "weighted-average" }, positionX: 1100, positionY: 200, metadata: {} },
    { tempId: "t10", typeId: "decision", label: "Risk Acceptable?", config: {}, positionX: 1300, positionY: 200, metadata: {} },
    { tempId: "t11", typeId: "approval", label: "Procurement Approval", config: { approvers: ["cpo@company.com"] }, positionX: 1500, positionY: 150, metadata: {} },
    { tempId: "t12", typeId: "email-notification", label: "Rejection Notice", config: { to: ["vendor@external.com"] }, positionX: 1500, positionY: 300, metadata: {} },
    { tempId: "t13", typeId: "data-store", label: "Add to Vendor Registry", config: { store: "approved_vendors" }, positionX: 1700, positionY: 150, metadata: {} },
    { tempId: "t14", typeId: "end", label: "End", config: {}, positionX: 1900, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: "branch-1", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t5", sourceHandle: "branch-2", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t6", sourceHandle: "branch-3", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t7", sourceHandle: "branch-4", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t8", sourceHandle: null, targetHandle: "join-1", label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t8", sourceHandle: null, targetHandle: "join-2", label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t8", sourceHandle: null, targetHandle: "join-3", label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t8", sourceHandle: null, targetHandle: "join-4", label: null, condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: "yes", targetHandle: null, label: "Acceptable", condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t12", sourceHandle: "no", targetHandle: null, label: "Too Risky", condition: null, metadata: {} },
    { sourceTempId: "t11", targetTempId: "t13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t13", targetTempId: "t14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 8: Audit Preparation Workflow
 * Comprehensive audit readiness with evidence collection
 */
const auditPreparationWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Audit Preparation Workflow",
    description: "Systematic audit preparation including evidence gathering and stakeholder coordination",
    status: "active",
    tags: ["audit", "preparation", "evidence"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "schedule-trigger", label: "30 Days Before Audit", config: { cron: "0 9 * * 1" }, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "ab-controls", label: "Get In-Scope Controls", config: { action: "query", filters: { inScope: true } }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "parallel-gateway", label: "Assign Evidence Tasks", config: { mode: "all" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "human-task", label: "IT Evidence", config: { assignee: "it@company.com", type: "evidence-collection" }, positionX: 700, positionY: 80, metadata: {} },
    { tempId: "t5", typeId: "human-task", label: "Finance Evidence", config: { assignee: "finance@company.com", type: "evidence-collection" }, positionX: 700, positionY: 180, metadata: {} },
    { tempId: "t6", typeId: "human-task", label: "HR Evidence", config: { assignee: "hr@company.com", type: "evidence-collection" }, positionX: 700, positionY: 280, metadata: {} },
    { tempId: "t7", typeId: "human-task", label: "Operations Evidence", config: { assignee: "ops@company.com", type: "evidence-collection" }, positionX: 700, positionY: 380, metadata: {} },
    { tempId: "t8", typeId: "parallel-gateway", label: "Collect Evidence", config: { mode: "all" }, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t9", typeId: "human-task", label: "Review Completeness", config: { assignee: "audit-lead@company.com" }, positionX: 1100, positionY: 200, metadata: {} },
    { tempId: "t10", typeId: "decision", label: "Evidence Complete?", config: {}, positionX: 1300, positionY: 200, metadata: {} },
    { tempId: "t11", typeId: "email-notification", label: "Request Missing Items", config: { subject: "Missing Audit Evidence Required" }, positionX: 1500, positionY: 300, metadata: {} },
    { tempId: "t12", typeId: "data-store", label: "Package Evidence", config: { store: "audit_packages" }, positionX: 1500, positionY: 150, metadata: {} },
    { tempId: "t13", typeId: "email-notification", label: "Notify Auditors", config: { to: ["external-auditors@audit.com"], subject: "Evidence Package Ready" }, positionX: 1700, positionY: 150, metadata: {} },
    { tempId: "t14", typeId: "end", label: "End", config: {}, positionX: 1900, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: "branch-1", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t5", sourceHandle: "branch-2", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t6", sourceHandle: "branch-3", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t7", sourceHandle: "branch-4", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t8", sourceHandle: null, targetHandle: "join-1", label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t8", sourceHandle: null, targetHandle: "join-2", label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t8", sourceHandle: null, targetHandle: "join-3", label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t8", sourceHandle: null, targetHandle: "join-4", label: null, condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t12", sourceHandle: "yes", targetHandle: null, label: "Complete", condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: "no", targetHandle: null, label: "Incomplete", condition: null, metadata: {} },
    { sourceTempId: "t11", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: "Retry", condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t13", targetTempId: "t14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 9: Change Management Workflow
 * IT change request with CAB review
 */
const changeManagementWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Change Management Workflow",
    description: "IT change request process with risk assessment and CAB approval",
    status: "active",
    tags: ["change", "itil", "cab"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "start", label: "Change Request", config: {}, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "human-task", label: "Document Change", config: { assignee: "requestor@company.com", fields: ["description", "impact", "rollback"] }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "decision", label: "Change Type?", config: {}, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "approval", label: "Standard Approval", config: { approvers: ["change-manager@company.com"] }, positionX: 700, positionY: 300, metadata: {} },
    { tempId: "t5", typeId: "approval", label: "CAB Review", config: { approvers: ["cab@company.com"], requiredApprovals: 3 }, positionX: 700, positionY: 200, metadata: {} },
    { tempId: "t6", typeId: "approval", label: "Emergency CAB", config: { approvers: ["ecab@company.com"], sla: "1h" }, positionX: 700, positionY: 100, metadata: {} },
    { tempId: "t7", typeId: "decision", label: "Approved?", config: {}, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t8", typeId: "human-task", label: "Schedule Implementation", config: { assignee: "change-manager@company.com" }, positionX: 1100, positionY: 150, metadata: {} },
    { tempId: "t9", typeId: "email-notification", label: "Rejection Notice", config: { to: ["requestor@company.com"] }, positionX: 1100, positionY: 300, metadata: {} },
    { tempId: "t10", typeId: "human-task", label: "Implement Change", config: { assignee: "implementation-team@company.com" }, positionX: 1300, positionY: 150, metadata: {} },
    { tempId: "t11", typeId: "human-task", label: "Verify Success", config: { assignee: "qa@company.com" }, positionX: 1500, positionY: 150, metadata: {} },
    { tempId: "t12", typeId: "decision", label: "Successful?", config: {}, positionX: 1700, positionY: 150, metadata: {} },
    { tempId: "t13", typeId: "human-task", label: "Execute Rollback", config: { assignee: "implementation-team@company.com" }, positionX: 1900, positionY: 250, metadata: {} },
    { tempId: "t14", typeId: "email-notification", label: "Close Change", config: { to: ["stakeholders@company.com"] }, positionX: 1900, positionY: 100, metadata: {} },
    { tempId: "t15", typeId: "end", label: "End", config: {}, positionX: 2100, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: "standard", targetHandle: null, label: "Standard", condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t5", sourceHandle: "normal", targetHandle: null, label: "Normal", condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t6", sourceHandle: "emergency", targetHandle: null, label: "Emergency", condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t8", sourceHandle: "yes", targetHandle: null, label: "Approved", condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t9", sourceHandle: "no", targetHandle: null, label: "Rejected", condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t15", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t11", targetTempId: "t12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t14", sourceHandle: "yes", targetHandle: null, label: "Success", condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t13", sourceHandle: "no", targetHandle: null, label: "Failed", condition: null, metadata: {} },
    { sourceTempId: "t13", targetTempId: "t15", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t14", targetTempId: "t15", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 10: Compliance Training Workflow
 * Employee training assignment and completion tracking
 */
const complianceTrainingWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Compliance Training Workflow",
    description: "Automated compliance training assignment, tracking, and escalation",
    status: "active",
    tags: ["training", "compliance", "hr"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "schedule-trigger", label: "Annual Training Cycle", config: { cron: "0 9 1 1 *" }, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "api-call", label: "Get All Employees", config: { url: "/api/employees", method: "GET" }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "data-transform", label: "Assign Training", config: { transformation: "map-training-by-role" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "email-notification", label: "Training Assignment", config: { subject: "Required Compliance Training", template: "training-assigned" }, positionX: 700, positionY: 200, metadata: {} },
    { tempId: "t5", typeId: "wait-timer", label: "Wait 14 Days", config: { duration: "14d" }, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t6", typeId: "api-call", label: "Check Completion", config: { url: "/api/training/status", method: "GET" }, positionX: 1100, positionY: 200, metadata: {} },
    { tempId: "t7", typeId: "decision", label: "All Complete?", config: {}, positionX: 1300, positionY: 200, metadata: {} },
    { tempId: "t8", typeId: "email-notification", label: "Reminder Email", config: { subject: "Training Deadline Approaching", priority: "high" }, positionX: 1500, positionY: 300, metadata: {} },
    { tempId: "t9", typeId: "wait-timer", label: "Wait 7 Days", config: { duration: "7d" }, positionX: 1700, positionY: 300, metadata: {} },
    { tempId: "t10", typeId: "decision", label: "Still Incomplete?", config: {}, positionX: 1900, positionY: 300, metadata: {} },
    { tempId: "t11", typeId: "email-notification", label: "Manager Escalation", config: { to: ["{{employee.manager}}"], subject: "Training Non-Compliance" }, positionX: 2100, positionY: 350, metadata: {} },
    { tempId: "t12", typeId: "data-store", label: "Record Completion", config: { store: "training_records" }, positionX: 1500, positionY: 150, metadata: {} },
    { tempId: "t13", typeId: "email-notification", label: "Compliance Certificate", config: { subject: "Training Complete - Certificate Attached" }, positionX: 1700, positionY: 150, metadata: {} },
    { tempId: "t14", typeId: "end", label: "End", config: {}, positionX: 2300, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t5", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t6", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t12", sourceHandle: "yes", targetHandle: null, label: "Complete", condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t8", sourceHandle: "no", targetHandle: null, label: "Incomplete", condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: "yes", targetHandle: null, label: "Escalate", condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t12", sourceHandle: "no", targetHandle: null, label: "Completed", condition: null, metadata: {} },
    { sourceTempId: "t11", targetTempId: "t14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t13", targetTempId: "t14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 11: Tariff Impact Mitigation Workflow
 * Supply chain tariff exposure assessment and mitigation
 */
const tariffMitigationWorkflow: WorkflowTemplate = {
  workflow: {
    name: "Tariff Impact Mitigation",
    description: "Automated workflow to assess and mitigate tariff exposure across supply chain",
    status: "active",
    tags: ["tariff", "supply-chain", "risk", "mitigation"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "start", label: "Tariff Alert Received", config: {}, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "ab-risks", label: "Query Impacted Vendors", config: { action: "query", filters: { category: "supply-chain", region: "affected" } }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "llm-task", label: "AI Impact Analysis", config: { prompt: "Analyze tariff impact on vendor relationships and calculate exposure" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "decision", label: "Exposure Level?", config: { conditions: [{ field: "exposure", operator: "gte", value: 5000000 }] }, positionX: 700, positionY: 200, metadata: {} },
    { tempId: "t5", typeId: "parallel-gateway", label: "Critical Actions", config: { mode: "all" }, positionX: 900, positionY: 100, metadata: {} },
    { tempId: "t6", typeId: "human-task", label: "Identify Alt Suppliers", config: { assignee: "procurement@company.com", title: "Source Alternative Suppliers" }, positionX: 1100, positionY: 50, metadata: {} },
    { tempId: "t7", typeId: "human-task", label: "Renegotiate Contracts", config: { assignee: "legal@company.com", title: "Contract Renegotiation" }, positionX: 1100, positionY: 150, metadata: {} },
    { tempId: "t8", typeId: "email-notification", label: "Board Alert", config: { to: ["cro@company.com", "cfo@company.com"], subject: "Critical Tariff Exposure Alert", priority: "high" }, positionX: 1100, positionY: 250, metadata: {} },
    { tempId: "t9", typeId: "parallel-gateway", label: "Consolidate", config: { mode: "all" }, positionX: 1300, positionY: 100, metadata: {} },
    { tempId: "t10", typeId: "human-task", label: "Standard Review", config: { assignee: "risk-analyst@company.com" }, positionX: 900, positionY: 300, metadata: {} },
    { tempId: "t11", typeId: "approval", label: "Risk Owner Approval", config: { approvers: ["cro@company.com"], requiredApprovals: 1 }, positionX: 1300, positionY: 200, metadata: {} },
    { tempId: "t12", typeId: "ab-risks", label: "Update Risk Register", config: { action: "update", fields: ["mitigation_status", "exposure_amount"] }, positionX: 1500, positionY: 200, metadata: {} },
    { tempId: "t13", typeId: "email-notification", label: "Notify Stakeholders", config: { to: ["stakeholders@company.com"], subject: "Tariff Mitigation Update" }, positionX: 1700, positionY: 200, metadata: {} },
    { tempId: "t14", typeId: "end", label: "End", config: {}, positionX: 1900, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t5", sourceHandle: "critical", targetHandle: null, label: "Critical ($5M+)", condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t10", sourceHandle: "moderate", targetHandle: null, label: "Moderate", condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t6", sourceHandle: "branch-1", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t7", sourceHandle: "branch-2", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t8", sourceHandle: "branch-3", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t9", sourceHandle: null, targetHandle: "join-1", label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t9", sourceHandle: null, targetHandle: "join-2", label: null, condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t9", sourceHandle: null, targetHandle: "join-3", label: null, condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t11", targetTempId: "t12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t13", targetTempId: "t14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * Template 12: M&A Audit Workflow
 * Acquisition integration audit and oversight
 */
const maAuditWorkflow: WorkflowTemplate = {
  workflow: {
    name: "M&A Integration Audit",
    description: "Build workflow for acquisition oversight and integration audit",
    status: "active",
    tags: ["ma", "acquisition", "audit", "integration"],
    visibility: "team",
    version: 1,
  },
  nodes: [
    { tempId: "t1", typeId: "start", label: "M&A Announced", config: {}, positionX: 100, positionY: 200, metadata: {} },
    { tempId: "t2", typeId: "human-task", label: "Collect Entity Data", config: { assignee: "ma-lead@company.com", title: "Gather Target Company Information" }, positionX: 300, positionY: 200, metadata: {} },
    { tempId: "t3", typeId: "parallel-gateway", label: "Due Diligence Tracks", config: { mode: "all" }, positionX: 500, positionY: 200, metadata: {} },
    { tempId: "t4", typeId: "human-task", label: "Financial Audit", config: { assignee: "finance-audit@company.com", title: "Review Financial Statements" }, positionX: 700, positionY: 80, metadata: {} },
    { tempId: "t5", typeId: "human-task", label: "IT Systems Audit", config: { assignee: "it-audit@company.com", title: "Assess IT Infrastructure" }, positionX: 700, positionY: 180, metadata: {} },
    { tempId: "t6", typeId: "human-task", label: "Compliance Review", config: { assignee: "compliance@company.com", title: "Regulatory Compliance Check" }, positionX: 700, positionY: 280, metadata: {} },
    { tempId: "t7", typeId: "human-task", label: "HR & Culture", config: { assignee: "hr@company.com", title: "Organizational Assessment" }, positionX: 700, positionY: 380, metadata: {} },
    { tempId: "t8", typeId: "parallel-gateway", label: "Consolidate Findings", config: { mode: "all" }, positionX: 900, positionY: 200, metadata: {} },
    { tempId: "t9", typeId: "llm-task", label: "AI Risk Synthesis", config: { prompt: "Synthesize due diligence findings and identify integration risks" }, positionX: 1100, positionY: 200, metadata: {} },
    { tempId: "t10", typeId: "data-transform", label: "Generate Risk Matrix", config: { transformation: "risk-matrix" }, positionX: 1300, positionY: 200, metadata: {} },
    { tempId: "t11", typeId: "approval", label: "CAE Sign-off", config: { approvers: ["cae@company.com"], requiredApprovals: 1 }, positionX: 1500, positionY: 200, metadata: {} },
    { tempId: "t12", typeId: "email-notification", label: "Board Report", config: { to: ["board@company.com", "audit-committee@company.com"], subject: "M&A Integration Audit Complete" }, positionX: 1700, positionY: 200, metadata: {} },
    { tempId: "t13", typeId: "schedule-trigger", label: "30-Day Follow-up", config: { delay: "30d" }, positionX: 1900, positionY: 200, metadata: {} },
    { tempId: "t14", typeId: "human-task", label: "Integration Progress Check", config: { assignee: "ma-lead@company.com" }, positionX: 2100, positionY: 200, metadata: {} },
    { tempId: "t15", typeId: "end", label: "End", config: {}, positionX: 2300, positionY: 200, metadata: {} },
  ],
  edges: [
    { sourceTempId: "t1", targetTempId: "t2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t2", targetTempId: "t3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t4", sourceHandle: "branch-1", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t5", sourceHandle: "branch-2", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t6", sourceHandle: "branch-3", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t3", targetTempId: "t7", sourceHandle: "branch-4", targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t4", targetTempId: "t8", sourceHandle: null, targetHandle: "join-1", label: null, condition: null, metadata: {} },
    { sourceTempId: "t5", targetTempId: "t8", sourceHandle: null, targetHandle: "join-2", label: null, condition: null, metadata: {} },
    { sourceTempId: "t6", targetTempId: "t8", sourceHandle: null, targetHandle: "join-3", label: null, condition: null, metadata: {} },
    { sourceTempId: "t7", targetTempId: "t8", sourceHandle: null, targetHandle: "join-4", label: null, condition: null, metadata: {} },
    { sourceTempId: "t8", targetTempId: "t9", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t9", targetTempId: "t10", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t10", targetTempId: "t11", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t11", targetTempId: "t12", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t12", targetTempId: "t13", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t13", targetTempId: "t14", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
    { sourceTempId: "t14", targetTempId: "t15", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {} },
  ],
};

/**
 * All workflow templates indexed by key
 */
export const workflowTemplates: Record<string, WorkflowTemplate> = {
  "issue-review": issueReviewWorkflow,
  "control-testing": controlTestingWorkflow,
  "risk-assessment": riskAssessmentWorkflow,
  "aggregate-approval": aggregateApprovalWorkflow,
  "policy-exception": policyExceptionWorkflow,
  "incident-response": incidentResponseWorkflow,
  "vendor-due-diligence": vendorDueDiligenceWorkflow,
  "audit-preparation": auditPreparationWorkflow,
  "change-management": changeManagementWorkflow,
  "compliance-training": complianceTrainingWorkflow,
  "tariff-mitigation": tariffMitigationWorkflow,
  "ma-audit": maAuditWorkflow,
};

/**
 * Get template by key
 */
export function getWorkflowTemplate(key: string): WorkflowTemplate | undefined {
  return workflowTemplates[key];
}

/**
 * List all available templates with metadata
 */
export function listWorkflowTemplates(): Array<{ key: string; name: string; description: string; tags: string[]; nodeCount: number; edgeCount: number }> {
  return Object.entries(workflowTemplates).map(([key, template]) => ({
    key,
    name: template.workflow.name,
    description: template.workflow.description || "",
    tags: template.workflow.tags || [],
    nodeCount: template.nodes.length,
    edgeCount: template.edges.length,
  }));
}
