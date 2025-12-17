/**
 * Database Schema
 * 
 * Defines all database tables and types using Drizzle ORM.
 * This file is shared between frontend and backend for type safety.
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users Table
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

/**
 * Node Type Registry
 * Defines all available node types in the workflow builder
 */
export type NodeTypeFamily = 
  | "trigger"
  | "action" 
  | "logic"
  | "integration"
  | "auditboard"
  | "communication"
  | "data"
  | "utility";

export type NodeTypeId =
  | "start"
  | "end"
  | "human-task"
  | "approval"
  | "decision"
  | "parallel-gateway"
  | "wait-timer"
  | "data-transform"
  | "api-call"
  | "ab-issues"
  | "ab-controls"
  | "ab-risks"
  | "ab-workstreams"
  | "email-notification"
  | "slack-notification"
  | "teams-notification"
  | "data-store"
  | "llm-task"
  | "subworkflow"
  | "error-boundary"
  | "webhook-trigger"
  | "schedule-trigger";

export interface NodeTypeSchema {
  type: "object";
  properties: Record<string, {
    type: "string" | "number" | "boolean" | "array" | "object";
    title: string;
    description?: string;
    default?: unknown;
    enum?: string[];
    required?: boolean;
  }>;
}

export interface NodeTypeDefinition {
  id: NodeTypeId;
  name: string;
  family: NodeTypeFamily;
  description: string;
  icon: string;
  color: string;
  inputSchema: NodeTypeSchema;
  outputSchema: NodeTypeSchema;
  defaultConfig: Record<string, unknown>;
  capabilities: string[];
}

/**
 * Workflow Table
 */
export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  tags: text("tags").array(),
  ownerId: varchar("owner_id").references(() => users.id),
  visibility: text("visibility").notNull().default("private"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

/**
 * Workflow Node Table
 */
export const workflowNodes = pgTable("workflow_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  typeId: text("type_id").notNull(),
  label: text("label").notNull(),
  config: jsonb("config").default({}),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNodeSchema = createInsertSchema(workflowNodes).omit({
  id: true,
  createdAt: true,
});

export type InsertNode = z.infer<typeof insertNodeSchema>;
export type WorkflowNode = typeof workflowNodes.$inferSelect;

/**
 * Workflow Edge Table
 */
export const workflowEdges = pgTable("workflow_edges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  sourceNodeId: varchar("source_node_id").notNull(),
  targetNodeId: varchar("target_node_id").notNull(),
  sourceHandle: text("source_handle"),
  targetHandle: text("target_handle"),
  label: text("label"),
  condition: jsonb("condition"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEdgeSchema = createInsertSchema(workflowEdges).omit({
  id: true,
  createdAt: true,
});

export type InsertEdge = z.infer<typeof insertEdgeSchema>;
export type WorkflowEdge = typeof workflowEdges.$inferSelect;

/**
 * Assistant Session Table
 */
export const assistantSessions = pgTable("assistant_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").references(() => workflows.id, { onDelete: "cascade" }),
  messages: jsonb("messages").default([]),
  selectedNodeIds: text("selected_node_ids").array(),
  currentIntent: text("current_intent"),
  suggestedActions: jsonb("suggested_actions").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSessionSchema = createInsertSchema(assistantSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type AssistantSession = typeof assistantSessions.$inferSelect;

/**
 * Chat Message Type
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  intent?: AssistantIntent;
  actions?: AssistantAction[];
}

/**
 * Assistant Intent Types
 */
export type AssistantIntentType =
  | "CREATE_NODE"
  | "DELETE_NODE"
  | "MODIFY_CONFIG"
  | "CONNECT_NODES"
  | "GENERATE_WORKFLOW"
  | "REVIEW_WORKFLOW"
  | "RUN_SIMULATION"
  | "EXPLAIN_NODE"
  | "SUGGEST_OPTIMIZATION"
  | "QUERY_INFO"
  | "CONVERSATION";

export interface AssistantIntent {
  type: AssistantIntentType;
  confidence: number;
  parameters: Record<string, unknown>;
}

export interface AssistantAction {
  id: string;
  type: "add_node" | "delete_node" | "update_node" | "connect_nodes" | "generate_workflow";
  label: string;
  description: string;
  payload: Record<string, unknown>;
  status: "pending" | "applied" | "rejected";
}

/**
 * Integration Descriptor
 */
export interface IntegrationDescriptor {
  id: string;
  name: string;
  provider: string;
  authType: "oauth2" | "api_key" | "basic" | "none";
  scopes: string[];
  endpoints: {
    name: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    description: string;
  }[];
  iconUrl?: string;
  category: "crm" | "erp" | "communication" | "storage" | "analytics" | "security" | "custom";
}

/**
 * Workflow Execution State
 */
export interface ExecutionState {
  workflowId: string;
  status: "idle" | "running" | "paused" | "completed" | "failed";
  currentNodeId?: string;
  variables: Record<string, unknown>;
  logs: {
    nodeId: string;
    timestamp: string;
    level: "info" | "warning" | "error";
    message: string;
  }[];
  startedAt?: string;
  completedAt?: string;
}

/**
 * Node Type Registry Data
 */
export const nodeTypeRegistry: NodeTypeDefinition[] = [
  {
    id: "start",
    name: "Start",
    family: "trigger",
    description: "Entry point for the workflow",
    icon: "Play",
    color: "#10b981",
    inputSchema: { type: "object", properties: {} },
    outputSchema: {
      type: "object",
      properties: {
        triggeredAt: { type: "string", title: "Triggered At" },
        triggeredBy: { type: "string", title: "Triggered By" },
      },
    },
    defaultConfig: {},
    capabilities: ["trigger"],
  },
  {
    id: "end",
    name: "End",
    family: "trigger",
    description: "Exit point for the workflow",
    icon: "Square",
    color: "#ef4444",
    inputSchema: {
      type: "object",
      properties: {
        result: { type: "object", title: "Final Result" },
      },
    },
    outputSchema: { type: "object", properties: {} },
    defaultConfig: {},
    capabilities: ["terminate"],
  },
  {
    id: "human-task",
    name: "Human Task",
    family: "action",
    description: "Assign a task to a user for manual completion",
    icon: "User",
    color: "#3b82f6",
    inputSchema: {
      type: "object",
      properties: {
        assignee: { type: "string", title: "Assignee", required: true },
        title: { type: "string", title: "Task Title", required: true },
        description: { type: "string", title: "Description" },
        dueDate: { type: "string", title: "Due Date" },
        priority: { type: "string", title: "Priority", enum: ["low", "medium", "high", "critical"] },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        completedBy: { type: "string", title: "Completed By" },
        completedAt: { type: "string", title: "Completed At" },
        response: { type: "object", title: "Response Data" },
      },
    },
    defaultConfig: { priority: "medium" },
    capabilities: ["assign", "notify", "wait"],
  },
  {
    id: "approval",
    name: "Approval",
    family: "action",
    description: "Request approval from one or more reviewers",
    icon: "CheckCircle",
    color: "#8b5cf6",
    inputSchema: {
      type: "object",
      properties: {
        approvers: { type: "array", title: "Approvers", required: true },
        title: { type: "string", title: "Approval Title", required: true },
        description: { type: "string", title: "Description" },
        requiredApprovals: { type: "number", title: "Required Approvals" },
        deadline: { type: "string", title: "Deadline" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        approved: { type: "boolean", title: "Approved" },
        approvedBy: { type: "array", title: "Approved By" },
        rejectedBy: { type: "array", title: "Rejected By" },
        comments: { type: "array", title: "Comments" },
      },
    },
    defaultConfig: { requiredApprovals: 1 },
    capabilities: ["approve", "reject", "notify", "wait"],
  },
  {
    id: "decision",
    name: "Decision Branch",
    family: "logic",
    description: "Route workflow based on conditions",
    icon: "GitBranch",
    color: "#f59e0b",
    inputSchema: {
      type: "object",
      properties: {
        conditions: { type: "array", title: "Conditions", required: true },
        defaultPath: { type: "string", title: "Default Path" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        selectedPath: { type: "string", title: "Selected Path" },
        evaluatedConditions: { type: "object", title: "Evaluated Conditions" },
      },
    },
    defaultConfig: { conditions: [], defaultPath: "default" },
    capabilities: ["branch", "evaluate"],
  },
  {
    id: "parallel-gateway",
    name: "Parallel Gateway",
    family: "logic",
    description: "Execute multiple paths simultaneously",
    icon: "GitFork",
    color: "#06b6d4",
    inputSchema: {
      type: "object",
      properties: {
        waitForAll: { type: "boolean", title: "Wait for All Paths" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        pathResults: { type: "object", title: "Path Results" },
      },
    },
    defaultConfig: { waitForAll: true },
    capabilities: ["parallel", "merge"],
  },
  {
    id: "wait-timer",
    name: "Wait / Timer",
    family: "utility",
    description: "Pause workflow execution for a specified duration",
    icon: "Clock",
    color: "#64748b",
    inputSchema: {
      type: "object",
      properties: {
        duration: { type: "number", title: "Duration (minutes)" },
        until: { type: "string", title: "Wait Until (datetime)" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        resumedAt: { type: "string", title: "Resumed At" },
      },
    },
    defaultConfig: { duration: 60 },
    capabilities: ["delay", "schedule"],
  },
  {
    id: "data-transform",
    name: "Data Transform",
    family: "data",
    description: "Transform, map, or filter data",
    icon: "Shuffle",
    color: "#ec4899",
    inputSchema: {
      type: "object",
      properties: {
        input: { type: "object", title: "Input Data" },
        transformType: { type: "string", title: "Transform Type", enum: ["map", "filter", "reduce", "custom"] },
        expression: { type: "string", title: "Transform Expression" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        result: { type: "object", title: "Transformed Data" },
      },
    },
    defaultConfig: { transformType: "map", expression: "" },
    capabilities: ["transform", "map", "filter"],
  },
  {
    id: "api-call",
    name: "API Call",
    family: "integration",
    description: "Make HTTP requests to external APIs",
    icon: "Globe",
    color: "#14b8a6",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", title: "URL", required: true },
        method: { type: "string", title: "Method", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
        headers: { type: "object", title: "Headers" },
        body: { type: "object", title: "Request Body" },
        authentication: { type: "object", title: "Authentication" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        status: { type: "number", title: "Status Code" },
        data: { type: "object", title: "Response Data" },
        headers: { type: "object", title: "Response Headers" },
      },
    },
    defaultConfig: { method: "GET", headers: {}, body: {} },
    capabilities: ["http", "rest", "webhook"],
  },
  {
    id: "ab-issues",
    name: "AB Issues",
    family: "auditboard",
    description: "Create, update, or query AuditBoard Issues",
    icon: "AlertTriangle",
    color: "#266c92",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", title: "Action", enum: ["create", "update", "query", "close"], required: true },
        issueData: { type: "object", title: "Issue Data" },
        filters: { type: "object", title: "Query Filters" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        issues: { type: "array", title: "Issues" },
        created: { type: "object", title: "Created Issue" },
      },
    },
    defaultConfig: { action: "query" },
    capabilities: ["auditboard", "issues", "grc"],
  },
  {
    id: "ab-controls",
    name: "AB Controls",
    family: "auditboard",
    description: "Manage AuditBoard Controls",
    icon: "Shield",
    color: "#266c92",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", title: "Action", enum: ["query", "test", "update", "certify"], required: true },
        controlId: { type: "string", title: "Control ID" },
        testData: { type: "object", title: "Test Data" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        controls: { type: "array", title: "Controls" },
        testResult: { type: "object", title: "Test Result" },
      },
    },
    defaultConfig: { action: "query" },
    capabilities: ["auditboard", "controls", "grc"],
  },
  {
    id: "ab-risks",
    name: "AB Risks",
    family: "auditboard",
    description: "Manage AuditBoard Risk assessments",
    icon: "AlertCircle",
    color: "#266c92",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", title: "Action", enum: ["query", "assess", "update", "mitigate"], required: true },
        riskId: { type: "string", title: "Risk ID" },
        assessmentData: { type: "object", title: "Assessment Data" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        risks: { type: "array", title: "Risks" },
        assessment: { type: "object", title: "Assessment Result" },
      },
    },
    defaultConfig: { action: "query" },
    capabilities: ["auditboard", "risks", "grc"],
  },
  {
    id: "ab-workstreams",
    name: "AB Workstreams",
    family: "auditboard",
    description: "Manage AuditBoard Workstreams and projects",
    icon: "Briefcase",
    color: "#266c92",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", title: "Action", enum: ["query", "create", "update", "assign"], required: true },
        workstreamId: { type: "string", title: "Workstream ID" },
        workstreamData: { type: "object", title: "Workstream Data" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        workstreams: { type: "array", title: "Workstreams" },
        result: { type: "object", title: "Operation Result" },
      },
    },
    defaultConfig: { action: "query" },
    capabilities: ["auditboard", "workstreams", "grc"],
  },
  {
    id: "email-notification",
    name: "Email Notification",
    family: "communication",
    description: "Send email notifications",
    icon: "Mail",
    color: "#6366f1",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "array", title: "Recipients", required: true },
        cc: { type: "array", title: "CC" },
        subject: { type: "string", title: "Subject", required: true },
        body: { type: "string", title: "Body", required: true },
        template: { type: "string", title: "Template ID" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        sent: { type: "boolean", title: "Sent" },
        messageId: { type: "string", title: "Message ID" },
      },
    },
    defaultConfig: { to: [], cc: [] },
    capabilities: ["email", "notify"],
  },
  {
    id: "slack-notification",
    name: "Slack Notification",
    family: "communication",
    description: "Send Slack messages",
    icon: "MessageSquare",
    color: "#4a154b",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", title: "Channel", required: true },
        message: { type: "string", title: "Message", required: true },
        blocks: { type: "array", title: "Block Kit Blocks" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        sent: { type: "boolean", title: "Sent" },
        ts: { type: "string", title: "Timestamp" },
      },
    },
    defaultConfig: {},
    capabilities: ["slack", "notify"],
  },
  {
    id: "teams-notification",
    name: "Teams Notification",
    family: "communication",
    description: "Send Microsoft Teams messages",
    icon: "Users",
    color: "#5059c9",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", title: "Channel/Team" },
        webhookUrl: { type: "string", title: "Webhook URL" },
        message: { type: "string", title: "Message", required: true },
        card: { type: "object", title: "Adaptive Card" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        sent: { type: "boolean", title: "Sent" },
      },
    },
    defaultConfig: {},
    capabilities: ["teams", "notify"],
  },
  {
    id: "data-store",
    name: "Data Store",
    family: "data",
    description: "CRUD operations on workflow data stores",
    icon: "Database",
    color: "#059669",
    inputSchema: {
      type: "object",
      properties: {
        operation: { type: "string", title: "Operation", enum: ["read", "write", "update", "delete"], required: true },
        store: { type: "string", title: "Store Name", required: true },
        key: { type: "string", title: "Key" },
        data: { type: "object", title: "Data" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean", title: "Success" },
        data: { type: "object", title: "Retrieved Data" },
      },
    },
    defaultConfig: { operation: "read" },
    capabilities: ["storage", "crud"],
  },
  {
    id: "llm-task",
    name: "LLM Task",
    family: "utility",
    description: "Execute AI/LLM-powered tasks",
    icon: "Bot",
    color: "#a855f7",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", title: "Prompt", required: true },
        context: { type: "object", title: "Context Data" },
        outputFormat: { type: "string", title: "Output Format", enum: ["text", "json", "structured"] },
        model: { type: "string", title: "Model" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        response: { type: "string", title: "LLM Response" },
        structured: { type: "object", title: "Structured Output" },
      },
    },
    defaultConfig: { outputFormat: "text", model: "gpt-5" },
    capabilities: ["ai", "llm", "generation"],
  },
  {
    id: "subworkflow",
    name: "Subworkflow",
    family: "utility",
    description: "Execute another workflow as a subroutine",
    icon: "Layers",
    color: "#0ea5e9",
    inputSchema: {
      type: "object",
      properties: {
        workflowId: { type: "string", title: "Workflow ID", required: true },
        inputs: { type: "object", title: "Input Variables" },
        waitForCompletion: { type: "boolean", title: "Wait for Completion" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        outputs: { type: "object", title: "Workflow Outputs" },
        executionId: { type: "string", title: "Execution ID" },
      },
    },
    defaultConfig: { waitForCompletion: true },
    capabilities: ["workflow", "reusable"],
  },
  {
    id: "error-boundary",
    name: "Error Boundary",
    family: "utility",
    description: "Handle errors and define retry logic",
    icon: "AlertOctagon",
    color: "#dc2626",
    inputSchema: {
      type: "object",
      properties: {
        maxRetries: { type: "number", title: "Max Retries" },
        retryDelay: { type: "number", title: "Retry Delay (seconds)" },
        onError: { type: "string", title: "On Error Action", enum: ["retry", "skip", "fail", "fallback"] },
        fallbackNodeId: { type: "string", title: "Fallback Node ID" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        error: { type: "object", title: "Error Details" },
        retryCount: { type: "number", title: "Retry Count" },
        handled: { type: "boolean", title: "Error Handled" },
      },
    },
    defaultConfig: { maxRetries: 3, retryDelay: 10, onError: "retry" },
    capabilities: ["error", "retry", "fallback"],
  },
  {
    id: "webhook-trigger",
    name: "Webhook Trigger",
    family: "trigger",
    description: "Trigger workflow via incoming webhook",
    icon: "Webhook",
    color: "#f97316",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", title: "Webhook Path" },
        method: { type: "string", title: "HTTP Method", enum: ["POST", "GET", "PUT"] },
        authentication: { type: "object", title: "Authentication" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        payload: { type: "object", title: "Request Payload" },
        headers: { type: "object", title: "Request Headers" },
      },
    },
    defaultConfig: { method: "POST" },
    capabilities: ["trigger", "webhook"],
  },
  {
    id: "schedule-trigger",
    name: "Schedule Trigger",
    family: "trigger",
    description: "Trigger workflow on a schedule",
    icon: "Calendar",
    color: "#84cc16",
    inputSchema: {
      type: "object",
      properties: {
        cron: { type: "string", title: "Cron Expression" },
        timezone: { type: "string", title: "Timezone" },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        scheduledTime: { type: "string", title: "Scheduled Time" },
        executionTime: { type: "string", title: "Execution Time" },
      },
    },
    defaultConfig: { cron: "0 9 * * *", timezone: "UTC" },
    capabilities: ["trigger", "schedule"],
  },
];

/**
 * Helper to get node type by ID
 */
export function getNodeType(typeId: string): NodeTypeDefinition | undefined {
  return nodeTypeRegistry.find((nt) => nt.id === typeId);
}

/**
 * Group node types by family
 */
export function getNodeTypesByFamily(): Record<NodeTypeFamily, NodeTypeDefinition[]> {
  const grouped: Record<NodeTypeFamily, NodeTypeDefinition[]> = {
    trigger: [],
    action: [],
    logic: [],
    integration: [],
    auditboard: [],
    communication: [],
    data: [],
    utility: [],
  };
  
  nodeTypeRegistry.forEach((nt) => {
    grouped[nt.family].push(nt);
  });
  
  return grouped;
}
