/**
 * OpenAI Integration for AuditBoard Assistant
 * 
 * Provides LLM-powered workflow building assistance
 * the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
 */

import OpenAI from "openai";
import { 
  type ChatMessage, 
  type AssistantIntent, 
  type AssistantAction,
  type WorkflowNode,
  type WorkflowEdge,
  nodeTypeRegistry,
  getNodeType,
} from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "missing-key"
});

const SYSTEM_PROMPT = `You are the AuditBoard Assistant, a specialized AI that helps GRC (Governance, Risk, Compliance) administrators build sophisticated workflows using a visual workflow builder.

You can help users:
1. Create and configure workflow nodes (tasks, approvals, decisions, integrations, etc.)
2. Connect nodes to build complete workflows
3. Generate entire workflow templates from descriptions
4. Explain node configurations and best practices
5. Suggest optimizations for existing workflows

Available Node Types:
${nodeTypeRegistry.map(nt => `- ${nt.name} (${nt.id}): ${nt.description}`).join('\n')}

When users ask to create or modify workflows, you should:
1. Understand their requirements
2. Suggest appropriate node types
3. Provide specific configurations
4. Generate structured actions that can be applied to the canvas

Always respond with both conversational text AND structured actions when modifications are requested.

Output Format:
When suggesting workflow changes, include a JSON block with your intent and actions:
\`\`\`json
{
  "intent": {
    "type": "CREATE_NODE" | "DELETE_NODE" | "MODIFY_CONFIG" | "CONNECT_NODES" | "GENERATE_WORKFLOW" | "REVIEW_WORKFLOW" | "EXPLAIN_NODE" | "SUGGEST_OPTIMIZATION" | "CONVERSATION",
    "confidence": 0.0-1.0,
    "parameters": {}
  },
  "actions": [
    {
      "id": "unique-action-id",
      "type": "add_node" | "delete_node" | "update_node" | "connect_nodes" | "generate_workflow",
      "label": "Human-readable action label",
      "description": "What this action does",
      "payload": { ... node/edge configuration ... },
      "status": "pending"
    }
  ]
}
\`\`\`

Be helpful, precise, and always explain your recommendations. Focus on GRC best practices and workflow efficiency.`;

interface AssistantContext {
  workflowId?: string;
  workflowName?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  selectedNodes?: WorkflowNode[];
  validationErrors?: string[];
}

interface AssistantResponse {
  content: string;
  intent?: AssistantIntent;
  actions?: AssistantAction[];
}

function buildContextMessage(context: AssistantContext): string {
  const parts: string[] = [];
  
  if (context.workflowName) {
    parts.push(`Current Workflow: "${context.workflowName}"`);
  }
  
  if (context.nodes && context.nodes.length > 0) {
    const nodesSummary = context.nodes.map(n => {
      const nodeType = getNodeType(n.typeId);
      return `  - ${n.label} (${nodeType?.name || n.typeId}) at position (${n.positionX}, ${n.positionY})`;
    }).join('\n');
    parts.push(`Canvas Nodes (${context.nodes.length}):\n${nodesSummary}`);
  }
  
  if (context.edges && context.edges.length > 0) {
    const edgesSummary = context.edges.map(e => 
      `  - ${e.sourceNodeId} -> ${e.targetNodeId}${e.label ? ` (${e.label})` : ''}`
    ).join('\n');
    parts.push(`Connections (${context.edges.length}):\n${edgesSummary}`);
  }
  
  if (context.selectedNodes && context.selectedNodes.length > 0) {
    const selectedSummary = context.selectedNodes.map(n => 
      `  - ${n.label} (${n.typeId}): ${JSON.stringify(n.config)}`
    ).join('\n');
    parts.push(`Selected Nodes:\n${selectedSummary}`);
  }
  
  if (context.validationErrors && context.validationErrors.length > 0) {
    parts.push(`Validation Errors:\n${context.validationErrors.map(e => `  - ${e}`).join('\n')}`);
  }
  
  return parts.length > 0 ? `\n\n[CURRENT CONTEXT]\n${parts.join('\n\n')}` : '';
}

function parseAssistantResponse(content: string): AssistantResponse {
  const result: AssistantResponse = { content };
  
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.intent) {
        result.intent = parsed.intent;
      }
      if (parsed.actions) {
        result.actions = parsed.actions;
      }
      result.content = content.replace(/```json\s*[\s\S]*?```/, '').trim();
    } catch {
    }
  }
  
  return result;
}

export async function generateAssistantResponse(
  messages: ChatMessage[],
  context: AssistantContext
): Promise<AssistantResponse> {
  const contextMessage = buildContextMessage(context);
  
  const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT + contextMessage },
    ...messages.map(m => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: formattedMessages,
      max_completion_tokens: 4096,
    });

    const content = response.choices[0].message.content || "";
    return parseAssistantResponse(content);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      content: "I apologize, but I encountered an error processing your request. Please try again.",
    };
  }
}

export async function generateWorkflowFromDescription(
  description: string,
  context?: AssistantContext
): Promise<AssistantResponse> {
  const prompt = `Generate a complete workflow based on this description: "${description}"

Please create a full workflow with:
1. Appropriate start/end nodes
2. All necessary intermediate steps (tasks, approvals, decisions, etc.)
3. Proper connections between nodes
4. Sensible default configurations for each node
5. Position coordinates that create a clean visual layout

Return the complete workflow as structured actions that can be applied to the canvas.`;

  const messages: ChatMessage[] = [{
    id: "gen-" + Date.now(),
    role: "user",
    content: prompt,
    timestamp: new Date().toISOString(),
  }];

  return generateAssistantResponse(messages, context || {});
}

export async function analyzeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<AssistantResponse> {
  const messages: ChatMessage[] = [{
    id: "analyze-" + Date.now(),
    role: "user",
    content: "Please analyze this workflow and suggest any improvements or identify potential issues.",
    timestamp: new Date().toISOString(),
  }];

  return generateAssistantResponse(messages, { nodes, edges });
}
