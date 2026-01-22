/**
 * Intelligent Workflow Assistant Service
 * 
 * A sophisticated rule-based assistant that helps build workflows
 * without requiring any external API keys. Uses pattern matching,
 * keyword analysis, and domain knowledge for intelligent responses.
 */

import { 
  type ChatMessage, 
  type AssistantIntent, 
  type AssistantAction,
  type WorkflowNode,
  type WorkflowEdge,
  nodeTypeRegistry,
  getNodeType,
  type NodeTypeDefinition,
} from "@shared/schema";

interface AssistantContext {
  workflowId?: string;
  workflowName?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  selectedNodes?: WorkflowNode[];
  validationErrors?: string[];
  homeContext?: {
    workspaceId: string;
    scenario: string;
    focus: string;
  };
}

interface AssistantResponse {
  content: string;
  intent?: AssistantIntent;
  actions?: AssistantAction[];
}

interface IntentMatch {
  type: string;
  confidence: number;
  nodeType?: NodeTypeDefinition;
  label?: string;
  workflow?: string;
}

const NODE_KEYWORDS: Record<string, { nodeId: string; label: string; keywords: string[] }> = {
  start: { nodeId: "start", label: "Start", keywords: ["start", "begin", "trigger", "initiate", "kick off", "launch"] },
  end: { nodeId: "end", label: "End", keywords: ["end", "finish", "complete", "terminate", "done", "close"] },
  task: { nodeId: "human-task", label: "Human Task", keywords: ["task", "human task", "assign", "work", "action item", "todo"] },
  review: { nodeId: "human-task", label: "Review Task", keywords: ["review", "check", "verify", "examine", "inspect"] },
  approval: { nodeId: "approval", label: "Approval", keywords: ["approval", "approve", "sign off", "authorize", "manager approval", "supervisor"] },
  decision: { nodeId: "decision", label: "Decision", keywords: ["decision", "branch", "if", "condition", "check", "evaluate", "split"] },
  parallel: { nodeId: "parallel-gateway", label: "Parallel Gateway", keywords: ["parallel", "concurrent", "simultaneously", "fork", "all at once"] },
  wait: { nodeId: "wait-timer", label: "Wait Timer", keywords: ["wait", "timer", "delay", "pause", "sleep", "hold", "schedule"] },
  transform: { nodeId: "data-transform", label: "Data Transform", keywords: ["transform", "map", "convert", "calculate", "process data"] },
  api: { nodeId: "api-call", label: "API Call", keywords: ["api", "external", "http", "rest", "call", "integration", "fetch", "request"] },
  email: { nodeId: "email-notification", label: "Email", keywords: ["email", "mail", "send email", "notify", "notification"] },
  slack: { nodeId: "slack-notification", label: "Slack", keywords: ["slack", "slack message", "channel"] },
  teams: { nodeId: "teams-notification", label: "Teams", keywords: ["teams", "microsoft teams"] },
  issues: { nodeId: "ab-issues", label: "AuditBoard Issues", keywords: ["issues", "ab issues", "auditboard issues", "issue tracker"] },
  controls: { nodeId: "ab-controls", label: "AuditBoard Controls", keywords: ["controls", "ab controls", "control testing"] },
  risks: { nodeId: "ab-risks", label: "AuditBoard Risks", keywords: ["risks", "ab risks", "risk assessment", "risk register"] },
  workstreams: { nodeId: "ab-workstreams", label: "AuditBoard Workstreams", keywords: ["workstreams", "ab workstreams", "work stream"] },
  llm: { nodeId: "llm-task", label: "AI/LLM Task", keywords: ["ai", "llm", "gpt", "artificial intelligence", "machine learning", "generate text"] },
  subworkflow: { nodeId: "subworkflow", label: "Subworkflow", keywords: ["subworkflow", "sub workflow", "nested workflow", "child workflow"] },
  error: { nodeId: "error-boundary", label: "Error Handler", keywords: ["error", "exception", "catch", "error handler", "fallback"] },
  webhook: { nodeId: "webhook-trigger", label: "Webhook", keywords: ["webhook", "http trigger", "incoming webhook"] },
  schedule: { nodeId: "schedule-trigger", label: "Schedule", keywords: ["schedule", "cron", "scheduled", "recurring", "daily", "weekly", "monthly"] },
  store: { nodeId: "data-store", label: "Data Store", keywords: ["store", "save", "database", "persist", "data store", "storage"] },
};

const WORKFLOW_TEMPLATES: Record<string, { name: string; keywords: string[]; nodes: { typeId: string; label: string; offsetY: number }[] }> = {
  review: {
    name: "Review Workflow",
    keywords: ["review workflow", "review process", "document review"],
    nodes: [
      { typeId: "start", label: "Start", offsetY: 0 },
      { typeId: "human-task", label: "Review Document", offsetY: 120 },
      { typeId: "approval", label: "Manager Approval", offsetY: 240 },
      { typeId: "end", label: "Complete", offsetY: 360 },
    ],
  },
  approval: {
    name: "Approval Workflow", 
    keywords: ["approval workflow", "approval process", "sign off process", "authorization workflow"],
    nodes: [
      { typeId: "start", label: "Start", offsetY: 0 },
      { typeId: "human-task", label: "Prepare Request", offsetY: 120 },
      { typeId: "approval", label: "First Approval", offsetY: 240 },
      { typeId: "decision", label: "Check Result", offsetY: 360 },
      { typeId: "email-notification", label: "Send Notification", offsetY: 480 },
      { typeId: "end", label: "Complete", offsetY: 600 },
    ],
  },
  risk: {
    name: "Risk Assessment Workflow",
    keywords: ["risk workflow", "risk assessment", "risk process", "grc workflow"],
    nodes: [
      { typeId: "start", label: "Start Assessment", offsetY: 0 },
      { typeId: "ab-risks", label: "Fetch Risk Data", offsetY: 120 },
      { typeId: "human-task", label: "Evaluate Risks", offsetY: 240 },
      { typeId: "decision", label: "Risk Level Check", offsetY: 360 },
      { typeId: "approval", label: "Risk Approval", offsetY: 480 },
      { typeId: "end", label: "Complete", offsetY: 600 },
    ],
  },
  control: {
    name: "Control Testing Workflow",
    keywords: ["control workflow", "control testing", "sox workflow", "compliance workflow"],
    nodes: [
      { typeId: "start", label: "Start Testing", offsetY: 0 },
      { typeId: "ab-controls", label: "Fetch Controls", offsetY: 120 },
      { typeId: "human-task", label: "Test Control", offsetY: 240 },
      { typeId: "decision", label: "Pass/Fail Check", offsetY: 360 },
      { typeId: "ab-issues", label: "Log Issue", offsetY: 480 },
      { typeId: "end", label: "Complete", offsetY: 600 },
    ],
  },
  notification: {
    name: "Notification Workflow",
    keywords: ["notification workflow", "alert workflow", "notify workflow"],
    nodes: [
      { typeId: "webhook-trigger", label: "Webhook Trigger", offsetY: 0 },
      { typeId: "decision", label: "Check Priority", offsetY: 120 },
      { typeId: "email-notification", label: "Send Email", offsetY: 240 },
      { typeId: "slack-notification", label: "Send Slack", offsetY: 240 },
      { typeId: "end", label: "Complete", offsetY: 360 },
    ],
  },
  scheduled: {
    name: "Scheduled Task Workflow",
    keywords: ["scheduled workflow", "cron workflow", "recurring workflow", "daily workflow", "automated workflow"],
    nodes: [
      { typeId: "schedule-trigger", label: "Schedule Trigger", offsetY: 0 },
      { typeId: "api-call", label: "Fetch Data", offsetY: 120 },
      { typeId: "data-transform", label: "Process Data", offsetY: 240 },
      { typeId: "data-store", label: "Store Results", offsetY: 360 },
      { typeId: "end", label: "Complete", offsetY: 480 },
    ],
  },
  aggregate: {
    name: "Aggregate Approval Workflow",
    keywords: ["aggregate approval", "multi-level approval", "consensus approval", "aggregate review", "parallel approval"],
    nodes: [
      { typeId: "start", label: "Start", offsetY: 0 },
      { typeId: "human-task", label: "Prepare Request", offsetY: 120 },
      { typeId: "parallel-gateway", label: "Split for Parallel Review", offsetY: 240 },
      { typeId: "approval", label: "Finance Approval", offsetY: 360 },
      { typeId: "approval", label: "Legal Approval", offsetY: 360 },
      { typeId: "approval", label: "Manager Approval", offsetY: 360 },
      { typeId: "parallel-gateway", label: "Merge Reviews", offsetY: 480 },
      { typeId: "decision", label: "All Approved?", offsetY: 600 },
      { typeId: "email-notification", label: "Send Approval Status", offsetY: 720 },
      { typeId: "end", label: "Complete", offsetY: 840 },
    ],
  },
  issue: {
    name: "Issue Management Workflow",
    keywords: ["issue workflow", "issue management", "issue tracking", "deficiency workflow"],
    nodes: [
      { typeId: "start", label: "Issue Identified", offsetY: 0 },
      { typeId: "ab-issues", label: "Create Issue", offsetY: 120 },
      { typeId: "human-task", label: "Assign Owner", offsetY: 240 },
      { typeId: "human-task", label: "Remediate Issue", offsetY: 360 },
      { typeId: "approval", label: "Approve Remediation", offsetY: 480 },
      { typeId: "decision", label: "Issue Resolved?", offsetY: 600 },
      { typeId: "end", label: "Close Issue", offsetY: 720 },
    ],
  },
};

function findNodeByLabel(nodes: WorkflowNode[], searchTerm: string): WorkflowNode | undefined {
  const lowerSearch = searchTerm.toLowerCase();
  return nodes.find(n => 
    n.label.toLowerCase().includes(lowerSearch) || 
    n.typeId.toLowerCase().includes(lowerSearch)
  );
}

function findInsertPosition(message: string, context: AssistantContext): { afterNode?: WorkflowNode; beforeNode?: WorkflowNode; position: { x: number; y: number } } {
  const nodes = context.nodes || [];
  const edges = context.edges || [];
  
  const lowerMessage = message.toLowerCase();
  
  const afterMatch = lowerMessage.match(/after\s+(?:the\s+)?["']?([^"']+?)["']?\s*(?:step|node|task)?/i);
  const beforeMatch = lowerMessage.match(/before\s+(?:the\s+)?["']?([^"']+?)["']?\s*(?:step|node|task)?/i);
  
  if (afterMatch) {
    const afterNode = findNodeByLabel(nodes, afterMatch[1].trim());
    if (afterNode) {
      const connectedEdge = edges.find(e => e.sourceNodeId === afterNode.id);
      const targetNode = connectedEdge ? nodes.find(n => n.id === connectedEdge.targetNodeId) : undefined;
      return {
        afterNode,
        beforeNode: targetNode,
        position: {
          x: afterNode.positionX,
          y: afterNode.positionY + 120,
        },
      };
    }
  }
  
  if (beforeMatch) {
    const beforeNode = findNodeByLabel(nodes, beforeMatch[1].trim());
    if (beforeNode) {
      const connectedEdge = edges.find(e => e.targetNodeId === beforeNode.id);
      const sourceNode = connectedEdge ? nodes.find(n => n.id === connectedEdge.sourceNodeId) : undefined;
      return {
        afterNode: sourceNode,
        beforeNode,
        position: {
          x: beforeNode.positionX,
          y: beforeNode.positionY - 120,
        },
      };
    }
  }
  
  const maxY = nodes.length > 0 ? Math.max(...nodes.map(n => n.positionY)) : 0;
  const avgX = nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.positionX, 0) / nodes.length : 400;
  
  return {
    position: { x: avgX, y: maxY + 120 },
  };
}

function buildWorkflowSummary(context: AssistantContext): string {
  const nodes = context.nodes || [];
  const edges = context.edges || [];
  
  if (nodes.length === 0) return "Your workflow is currently empty.";
  
  const nodeList = nodes.map(n => `• ${n.label} (${n.typeId})`).join("\n");
  const connectionCount = edges.length;
  
  return `Current workflow has ${nodes.length} nodes and ${connectionCount} connections:\n${nodeList}`;
}

function detectIntent(message: string, context: AssistantContext): IntentMatch {
  const lowerMessage = message.toLowerCase().trim();
  const hasExistingNodes = (context.nodes?.length || 0) > 0;
  
  // Check for workflow template requests
  for (const [key, template] of Object.entries(WORKFLOW_TEMPLATES)) {
    for (const keyword of template.keywords) {
      if (lowerMessage.includes(keyword)) {
        return { type: "GENERATE_WORKFLOW", confidence: 0.95, workflow: key };
      }
    }
  }
  
  // Check for general workflow creation
  if ((lowerMessage.includes("create") || lowerMessage.includes("build") || lowerMessage.includes("make") || lowerMessage.includes("generate")) &&
      lowerMessage.includes("workflow")) {
    // Try to find a matching template
    for (const [key, template] of Object.entries(WORKFLOW_TEMPLATES)) {
      for (const keyword of template.keywords) {
        const shortKeyword = keyword.split(" ")[0];
        if (lowerMessage.includes(shortKeyword)) {
          return { type: "GENERATE_WORKFLOW", confidence: 0.85, workflow: key };
        }
      }
    }
    return { type: "GENERATE_WORKFLOW", confidence: 0.7, workflow: "review" };
  }
  
  // Check for contextual node creation (after/before specific nodes)
  const positionPatterns = ["after", "before", "between"];
  const hasPositionContext = positionPatterns.some(p => lowerMessage.includes(p)) && hasExistingNodes;
  
  // Check for node creation requests
  const createPatterns = ["add", "create", "insert", "new", "put", "include", "need"];
  const isCreateIntent = createPatterns.some(p => lowerMessage.includes(p));
  
  if (isCreateIntent) {
    for (const [key, nodeInfo] of Object.entries(NODE_KEYWORDS)) {
      for (const keyword of nodeInfo.keywords) {
        if (lowerMessage.includes(keyword)) {
          const nodeDef = nodeTypeRegistry.find(n => n.id === nodeInfo.nodeId);
          if (nodeDef) {
            return { 
              type: "CREATE_NODE", 
              confidence: 0.9, 
              nodeType: nodeDef, 
              label: nodeInfo.label 
            };
          }
        }
      }
    }
  }
  
  // Check for delete requests
  if (lowerMessage.includes("delete") || lowerMessage.includes("remove") || lowerMessage.includes("drop")) {
    if (context.selectedNodes && context.selectedNodes.length > 0) {
      return { type: "DELETE_NODE", confidence: 0.85 };
    }
  }
  
  // Check for connect requests
  if (lowerMessage.includes("connect") || lowerMessage.includes("link") || lowerMessage.includes("join") || lowerMessage.includes("wire")) {
    return { type: "CONNECT_NODES", confidence: 0.8 };
  }
  
  // Check for analysis requests
  if (lowerMessage.includes("analyze") || lowerMessage.includes("review") && lowerMessage.includes("workflow") ||
      lowerMessage.includes("check") || lowerMessage.includes("validate") || lowerMessage.includes("suggest")) {
    return { type: "REVIEW_WORKFLOW", confidence: 0.85 };
  }
  
  // Check for help requests
  if (lowerMessage.includes("help") || lowerMessage.includes("what can you") || lowerMessage.includes("how do i") ||
      lowerMessage.includes("?") || lowerMessage.includes("explain")) {
    return { type: "CONVERSATION", confidence: 0.9 };
  }
  
  // Default to conversation
  return { type: "CONVERSATION", confidence: 0.5 };
}

function calculatePosition(context: AssistantContext, offsetY: number = 0): { x: number; y: number } {
  const baseX = 400;
  const baseY = 150;
  
  if (!context.nodes || context.nodes.length === 0) {
    return { x: baseX, y: baseY + offsetY };
  }
  
  const maxX = Math.max(...context.nodes.map(n => n.positionX));
  const avgY = context.nodes.reduce((sum, n) => sum + n.positionY, 0) / context.nodes.length;
  
  return { x: maxX + 280, y: avgY + offsetY };
}

function generateNodeActions(
  nodeType: NodeTypeDefinition, 
  label: string, 
  context: AssistantContext,
  message?: string
): AssistantAction[] {
  const insertInfo = message ? findInsertPosition(message, context) : null;
  const pos = insertInfo?.position || calculatePosition(context);
  const actionId = `action-${Date.now()}`;
  
  let description = nodeType.description;
  if (insertInfo?.afterNode) {
    description = `Insert after "${insertInfo.afterNode.label}"`;
  } else if (insertInfo?.beforeNode) {
    description = `Insert before "${insertInfo.beforeNode.label}"`;
  }
  
  return [{
    id: actionId,
    type: "add_node",
    label: `Add ${nodeType.name}`,
    description,
    payload: {
      typeId: nodeType.id,
      label: label,
      positionX: pos.x,
      positionY: pos.y,
      config: nodeType.defaultConfig || {},
    },
    status: "pending",
  }];
}

import { 
  type BatchWorkflowPayload,
  type WorkflowNodeSpec,
  type WorkflowEdgeSpec,
} from "@shared/schema";

function generateBatchWorkflowAction(templateKey: string, context: AssistantContext): AssistantAction[] {
  const template = WORKFLOW_TEMPLATES[templateKey];
  if (!template) return [];
  
  const baseX = context.nodes?.length 
    ? Math.max(...context.nodes.map(n => n.positionX)) + 300 
    : 400;
  const baseY = 100;
  const actionId = Date.now();
  
  const nodes: WorkflowNodeSpec[] = template.nodes.map((node, index) => ({
    tempId: `temp-${actionId}-${index}`,
    typeId: node.typeId,
    label: node.label,
    positionX: baseX,
    positionY: baseY + node.offsetY,
    config: {},
  }));
  
  const edges: WorkflowEdgeSpec[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      sourceTempId: nodes[i].tempId,
      targetTempId: nodes[i + 1].tempId,
    });
  }
  
  const batchPayload: BatchWorkflowPayload = {
    nodes,
    edges,
    description: template.name,
  };
  
  return [{
    id: `action-${actionId}`,
    type: "batch_workflow",
    label: `Apply ${template.name}`,
    description: `Creates ${nodes.length} nodes with ${edges.length} connections`,
    payload: {},
    batchPayload,
    status: "pending",
  }];
}

function getWorkflowSummary(template: { name: string; nodes: { label: string }[] }): string {
  const nodeList = template.nodes.map((n, i) => `${i + 1}. ${n.label}`).join("\n");
  const connectionList = template.nodes.slice(0, -1).map((n, i) => 
    `   ${n.label} → ${template.nodes[i + 1].label}`
  ).join("\n");
  
  return `**${template.name}** (${template.nodes.length} steps)\n\n**Nodes:**\n${nodeList}\n\n**Connections:**\n${connectionList}`;
}

function generateHelpResponse(): AssistantResponse {
  return {
    content: `Welcome to the AuditBoard Workflow Assistant! I can help you build sophisticated GRC workflows.

**What I can do:**

**Add Nodes** - Just tell me what you need:
• "Add an approval step"
• "Create a human task"
• "Add a decision branch"
• "Insert an email notification"

**Build Complete Workflows** - Describe what you want:
• "Create a review workflow"
• "Build an approval process"
• "Make a risk assessment workflow"
• "Generate a control testing workflow"

**Available Node Types:**
• **Triggers**: Start, End, Webhook, Schedule
• **Tasks**: Human Task, Approval, AI/LLM Task
• **Logic**: Decision Branch, Parallel Gateway, Wait Timer
• **AuditBoard**: Issues, Controls, Risks, Workstreams
• **Communication**: Email, Slack, Teams notifications
• **Data**: API Call, Data Transform, Data Store

**Tips:**
• Drag nodes from the left palette to the canvas
• Connect nodes by dragging from one handle to another
• Click a node to configure its properties
• Ask me to analyze your workflow for suggestions

How would you like to get started?`,
    intent: { type: "CONVERSATION", confidence: 1.0, parameters: {} },
  };
}

function generateConversationalResponse(message: string, context: AssistantContext): AssistantResponse {
  const hasNodes = context.nodes && context.nodes.length > 0;
  const workflowSummary = buildWorkflowSummary(context);
  
  let content = "I'm here to help you build your workflow. ";
  
  if (hasNodes) {
    content += `\n\n**Current State:**\n${workflowSummary}\n\n`;
    content += "What would you like to add or modify? You can:\n";
    content += "• Add nodes: \"add an approval after Review Document\"\n";
    content += "• Analyze: \"check my workflow\" or \"suggest improvements\"\n";
    content += "• Expand: \"add error handling\" or \"add notifications\"";
  } else {
    content += "Try saying:\n";
    content += "• \"Add a start node\" to begin your workflow\n";
    content += "• \"Create a review workflow\" for a complete template\n";
    content += "• \"Create an aggregate approval workflow\" for multi-level approvals\n";
    content += "• \"Help\" to see all available options";
  }
  
  return {
    content,
    intent: { type: "CONVERSATION", confidence: 0.7, parameters: {} },
  };
}

export async function generateAssistantResponse(
  messages: ChatMessage[],
  context: AssistantContext
): Promise<AssistantResponse> {
  if (messages.length === 0) {
    return generateHelpResponse();
  }
  
  const lastMessage = messages[messages.length - 1].content;
  const intent = detectIntent(lastMessage, context);
  
  switch (intent.type) {
    case "CREATE_NODE": {
      if (!intent.nodeType) {
        return {
          content: "I can help you add a node. Which type would you like? Try: task, approval, decision, email, or start/end.",
          intent: { type: "CREATE_NODE", confidence: 0.5, parameters: {} },
        };
      }
      
      const insertInfo = findInsertPosition(lastMessage, context);
      const actions = generateNodeActions(intent.nodeType, intent.label || intent.nodeType.name, context, lastMessage);
      
      let positionNote = "";
      if (insertInfo.afterNode) {
        positionNote = ` I'll position it after **${insertInfo.afterNode.label}**.`;
        if (insertInfo.beforeNode) {
          positionNote += ` You may want to reconnect the edges: ${insertInfo.afterNode.label} → New Node → ${insertInfo.beforeNode.label}.`;
        }
      } else if (insertInfo.beforeNode) {
        positionNote = ` I'll position it before **${insertInfo.beforeNode.label}**.`;
      } else if (context.nodes && context.nodes.length > 0) {
        positionNote = ` I'll add it below your existing nodes.`;
      }
      
      return {
        content: `I'll add a **${intent.nodeType.name}** to your workflow.${positionNote}\n\n${intent.nodeType.description}\n\nClick **Apply** to add it to the canvas.`,
        intent: { type: "CREATE_NODE", confidence: intent.confidence, parameters: { nodeType: intent.nodeType.id } },
        actions,
      };
    }
    
    case "GENERATE_WORKFLOW": {
      const templateKey = intent.workflow || "review";
      const template = WORKFLOW_TEMPLATES[templateKey];
      const actions = generateBatchWorkflowAction(templateKey, context);
      const summary = getWorkflowSummary(template);
      
      return {
        content: `I'll create this workflow for you:\n\n${summary}\n\nClick **Apply** to add all nodes and connections to your canvas at once.`,
        intent: { type: "GENERATE_WORKFLOW", confidence: intent.confidence, parameters: { template: templateKey } },
        actions,
      };
    }
    
    case "DELETE_NODE": {
      if (context.selectedNodes && context.selectedNodes.length > 0) {
        const selectedNode = context.selectedNodes[0];
        return {
          content: `To delete "${selectedNode.label}", press the Delete key or right-click and select Delete. I can't delete nodes directly for safety reasons.`,
          intent: { type: "DELETE_NODE", confidence: 0.8, parameters: { nodeId: selectedNode.id } },
        };
      }
      return {
        content: "Select a node on the canvas first, then ask me to delete it.",
        intent: { type: "DELETE_NODE", confidence: 0.5, parameters: {} },
      };
    }
    
    case "CONNECT_NODES": {
      return {
        content: "To connect nodes:\n\n1. Hover over the source node to see connection handles\n2. Drag from a handle to the target node\n3. Release to create the connection\n\nConnections show the flow of your workflow from one step to the next.",
        intent: { type: "CONNECT_NODES", confidence: 0.8, parameters: {} },
      };
    }
    
    case "REVIEW_WORKFLOW": {
      return analyzeWorkflow(context.nodes || [], context.edges || []);
    }
    
    case "CONVERSATION": {
      // Check if this is a help request
      const lowerMessage = lastMessage.toLowerCase();
      if (lowerMessage.includes("help") || lowerMessage.includes("what can you") || lowerMessage.includes("how do i")) {
        return generateHelpResponse();
      }
      return generateConversationalResponse(lastMessage, context);
    }
    
    default: {
      return generateConversationalResponse(lastMessage, context);
    }
  }
}

export async function generateWorkflowFromDescription(
  description: string,
  context?: AssistantContext
): Promise<AssistantResponse> {
  const messages: ChatMessage[] = [{
    id: "gen-" + Date.now(),
    role: "user",
    content: description,
    timestamp: new Date().toISOString(),
  }];

  return generateAssistantResponse(messages, context || {});
}

/**
 * Home Context Intelligence
 * Keyword-based routing for home page assistant queries
 */

interface HomeContextResponse {
  content: string;
  resources?: Array<{
    type: "Task" | "Report" | "Control" | "Risk";
    title: string;
    id?: string;
    assignee?: string;
    dueDate?: string;
    status?: string;
    route?: string;
  }>;
  actions?: AssistantAction[];
}

interface HomeContext {
  workspaceId: string;
  scenario: string;
  focus: string;
}

const HOME_KEYWORDS = {
  // Task-related keywords
  tasks: ["task", "tasks", "todo", "to-do", "pending", "my work", "assigned", "overdue", "deadline"],
  // Control-related keywords
  controls: ["control", "controls", "sox", "testing", "compliance", "audit control", "deficiency"],
  // Risk-related keywords  
  risks: ["risk", "risks", "assessment", "mitigation", "exposure", "threat"],
  // Report-related keywords
  reports: ["report", "reports", "summary", "status report", "generate report", "create report", "board report"],
  // Dashboard-related keywords
  dashboard: ["dashboard", "metrics", "kpis", "overview", "status"],
  // Workflow-related keywords
  workflows: ["workflow", "workflows", "automation", "process", "create workflow"],
  // Audit-related keywords
  audit: ["audit", "audits", "finding", "evidence", "walthrough", "sample"],
  // Help keywords
  help: ["help", "what can you", "how do i", "assist"],
};

function detectHomeIntent(message: string): string {
  const lower = message.toLowerCase();
  
  for (const [intent, keywords] of Object.entries(HOME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return intent;
      }
    }
  }
  
  return "general";
}

export function generateHomeContextResponse(
  message: string,
  context: HomeContext
): HomeContextResponse {
  const intent = detectHomeIntent(message);
  const { workspaceId, scenario, focus } = context;
  
  switch (intent) {
    case "tasks": {
      return {
        content: `Here's a summary of your current tasks related to **${scenario}**:\n\n` +
          `You have **4 high-priority tasks** requiring attention:\n\n` +
          `1. **Q4 Access Review Testing** - In Progress, due Nov 15\n` +
          `2. **Vulnerability Remediation** - Blocked (waiting for vendor patch)\n` +
          `3. **Revenue Recognition Sample Testing** - In Progress, due Nov 8\n` +
          `4. **Change Management Evidence** - Pending, due Nov 20\n\n` +
          `Would you like me to help prioritize these or show more details?`,
        resources: [
          { type: "Task", title: "Q4 Access Review Testing", id: "task-1", assignee: "John Smith", dueDate: "Nov 15, 2024", status: "In Progress", route: "/open-tasks" },
          { type: "Task", title: "Vulnerability Remediation", id: "task-4", assignee: "David Lee", dueDate: "Nov 10, 2024", status: "Blocked", route: "/open-tasks" },
          { type: "Task", title: "Revenue Recognition Testing", id: "task-5", assignee: "Anna Martinez", dueDate: "Nov 8, 2024", status: "In Progress", route: "/open-tasks" },
        ],
      };
    }
    
    case "controls": {
      return {
        content: `**Control Testing Status** for ${scenario}:\n\n` +
          `• **8 total controls** tracked\n` +
          `• **5 passed** (62.5%)\n` +
          `• **2 in progress**\n` +
          `• **1 failed** - requires remediation\n\n` +
          `**Attention Needed:**\n` +
          `• Vulnerability Scanning (ISO-SEC-001) - Failed\n` +
          `• Revenue Recognition Review (SOX-FIN-003) - In Remediation\n\n` +
          `Would you like me to generate a detailed control status report?`,
        resources: [
          { type: "Control", title: "Vulnerability Scanning", id: "ctrl-5", status: "Failed", route: "/controls" },
          { type: "Control", title: "Revenue Recognition Review", id: "ctrl-8", status: "Remediation", route: "/controls" },
        ],
      };
    }
    
    case "risks": {
      const riskContent = workspaceId === "enterprise-risk" 
        ? `Based on the **${scenario}** scenario:\n\n` +
          `**Current Risk Exposure:**\n` +
          `• 3 High-priority risks requiring executive attention\n` +
          `• 12 Medium-priority risks under monitoring\n` +
          `• 45 Low-priority risks tracked\n\n` +
          `**Key Focus Areas:**\n` +
          `• Supply chain tariff exposure across 12 vendors\n` +
          `• Alternative sourcing strategy in progress\n` +
          `• Board presentation scheduled for next week\n\n` +
          `I can help you create a risk mitigation workflow or generate a board summary report.`
        : `**Risk Assessment Status:**\n\n` +
          `Your organization currently has 60 tracked risks across all domains.\n\n` +
          `Would you like me to focus on a specific risk category or generate a risk summary report?`;
      
      return {
        content: riskContent,
        resources: [
          { type: "Risk", title: "Tariff Exposure Assessment", id: "risk-1", status: "High", route: "/risk-register" },
          { type: "Risk", title: "Vendor Concentration Risk", id: "risk-2", status: "High", route: "/risk-register" },
        ],
      };
    }
    
    case "reports": {
      return {
        content: `I can help you generate reports for **${scenario}**. Available options:\n\n` +
          `📊 **SOX Compliance Status Report** - Control testing summary\n` +
          `📈 **Risk Assessment Summary** - Current risk landscape\n` +
          `📋 **Audit Findings Report** - Q4 audit results\n` +
          `🎯 **Board Summary Report** - Executive presentation deck\n\n` +
          `Just tell me which report you'd like, or describe what information you need and I'll generate a custom report.`,
        resources: [
          { type: "Report", title: "Generate SOX Report", route: "/reporting" },
          { type: "Report", title: "Generate Risk Report", route: "/reporting" },
        ],
      };
    }
    
    case "dashboard": {
      return {
        content: `**Dashboard Overview** for ${scenario}:\n\n` +
          `**Key Metrics:**\n` +
          `• 94% overall compliance score\n` +
          `• 847 of 892 controls effective\n` +
          `• 3 high-priority risks active\n` +
          `• 12 total findings this quarter\n\n` +
          `• 10 active workflows running\n` +
          `• 145 completed today\n` +
          `• 2.1% error rate\n\n` +
          `Would you like to drill into any specific area?`,
      };
    }
    
    case "workflows": {
      return {
        content: `I can help you create workflows for **${focus}**. Here are some options:\n\n` +
          `🔄 **Pre-built Templates:**\n` +
          `• Risk Assessment Workflow\n` +
          `• Control Testing Workflow\n` +
          `• Approval Process\n` +
          `• Incident Response\n\n` +
          `Or describe what you need and I'll help build a custom workflow.\n\n` +
          `Try: "Create a tariff mitigation workflow" or "Build a control testing process"`,
      };
    }
    
    case "audit": {
      const auditContent = workspaceId === "enterprise-audit"
        ? `**M&A Due Diligence Audit** for Singapore acquisition:\n\n` +
          `**Due Diligence Status:**\n` +
          `• Financial DD: 85% complete\n` +
          `• Operational DD: 70% complete\n` +
          `• Compliance DD: 90% complete\n` +
          `• IT DD: 60% complete\n\n` +
          `**Key Findings:** 4 critical, 8 high priority\n\n` +
          `Would you like me to generate the Audit Committee presentation deck?`
        : `**Audit Status:**\n\n` +
          `• 3 active audits in progress\n` +
          `• 12 findings to address\n` +
          `• 1 audit pending committee review\n\n` +
          `I can help you with evidence collection, findings tracking, or audit planning.`;
      
      return {
        content: auditContent,
        resources: [
          { type: "Report", title: "Audit Committee Report", route: "/reporting" },
        ],
      };
    }
    
    case "help": {
      return {
        content: `Welcome to the AuditBoard Assistant! I'm here to help with your **${scenario}** work.\n\n` +
          `**What I can do:**\n\n` +
          `📋 **Tasks & Work** - "Show my tasks" or "What's overdue?"\n` +
          `🎛️ **Controls** - "Control testing status" or "Failed controls"\n` +
          `⚠️ **Risks** - "Risk assessment summary" or "High-priority risks"\n` +
          `📊 **Reports** - "Generate SOX report" or "Create board summary"\n` +
          `🔄 **Workflows** - "Create a new workflow" or "Build approval process"\n` +
          `📈 **Dashboard** - "Show metrics" or "Dashboard overview"\n\n` +
          `Just ask naturally - I understand context from your workspace!`,
      };
    }
    
    default: {
      return {
        content: `I'm your AuditBoard Assistant for **${scenario}**.\n\n` +
          `Based on your current focus on *${focus}*, I can help with:\n\n` +
          `• Viewing and managing your tasks\n` +
          `• Checking control testing status\n` +
          `• Generating reports for stakeholders\n` +
          `• Creating automation workflows\n\n` +
          `What would you like to focus on?`,
      };
    }
  }
}

export async function analyzeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<AssistantResponse> {
  if (nodes.length === 0) {
    return {
      content: "Your workflow is empty. Start by adding nodes:\n\n• Say \"add a start node\"\n• Or \"create a review workflow\" for a complete template",
      intent: { type: "REVIEW_WORKFLOW", confidence: 1.0, parameters: {} },
    };
  }
  
  const issues: string[] = [];
  const suggestions: string[] = [];
  const stats = {
    triggers: 0,
    actions: 0,
    logic: 0,
    integrations: 0,
  };
  
  // Analyze nodes
  for (const node of nodes) {
    const nodeType = getNodeType(node.typeId);
    if (nodeType) {
      if (nodeType.family === "trigger") stats.triggers++;
      else if (nodeType.family === "action") stats.actions++;
      else if (nodeType.family === "logic") stats.logic++;
      else stats.integrations++;
    }
  }
  
  // Check for start node
  const hasStart = nodes.some(n => n.typeId === "start" || n.typeId === "webhook-trigger" || n.typeId === "schedule-trigger");
  if (!hasStart) {
    issues.push("No start trigger - add a Start, Webhook, or Schedule trigger node");
  }
  
  // Check for end node
  const hasEnd = nodes.some(n => n.typeId === "end");
  if (!hasEnd) {
    issues.push("No End node - workflows should have a clear completion point");
  }
  
  // Check connectivity
  const connectedNodes = new Set<string>();
  edges.forEach(e => {
    connectedNodes.add(e.sourceNodeId);
    connectedNodes.add(e.targetNodeId);
  });
  
  if (nodes.length > 1 && edges.length === 0) {
    issues.push("No connections between nodes - connect your nodes to define the workflow flow");
  } else if (nodes.length > 1) {
    const disconnected = nodes.filter(n => !connectedNodes.has(n.id));
    if (disconnected.length > 0) {
      issues.push(`${disconnected.length} node(s) are not connected: ${disconnected.map(n => n.label).join(", ")}`);
    }
  }
  
  // Suggestions
  if (nodes.length === 1) {
    suggestions.push("Add more nodes to build out your workflow");
  }
  
  if (!nodes.some(n => n.typeId === "approval") && nodes.length >= 2) {
    suggestions.push("Consider adding an approval step for governance compliance");
  }
  
  if (!nodes.some(n => n.typeId === "decision") && nodes.length >= 3) {
    suggestions.push("A decision branch could add conditional logic to your workflow");
  }
  
  if (!nodes.some(n => n.typeId.includes("notification") || n.typeId === "email-notification")) {
    suggestions.push("Add notification nodes to keep stakeholders informed");
  }
  
  // Build response
  let content = `## Workflow Analysis\n\n`;
  content += `**${nodes.length}** nodes • **${edges.length}** connections\n\n`;
  content += `Node breakdown: ${stats.triggers} triggers, ${stats.actions} actions, ${stats.logic} logic, ${stats.integrations} integrations\n\n`;
  
  if (issues.length > 0) {
    content += `### Issues Found\n${issues.map(i => `• ${i}`).join("\n")}\n\n`;
  } else {
    content += `### Status: Good\nNo critical issues found.\n\n`;
  }
  
  if (suggestions.length > 0) {
    content += `### Suggestions\n${suggestions.map(s => `• ${s}`).join("\n")}`;
  }
  
  return {
    content,
    intent: { type: "REVIEW_WORKFLOW", confidence: 1.0, parameters: {} },
  };
}
