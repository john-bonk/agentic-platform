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
    
    const exampleWorkflows: Workflow[] = [
      { 
        id: "wf1", 
        name: "Issue Review Workflow", 
        description: "Automated issue review and approval process", 
        status: "active", 
        tags: ["grc", "issues", "review"],
        ownerId: null, 
        visibility: "team",
        version: 1,
        createdAt: now, 
        updatedAt: now 
      },
      { 
        id: "wf2", 
        name: "Control Testing Automation", 
        description: "Streamlined control testing workflow", 
        status: "draft", 
        tags: ["controls", "testing"],
        ownerId: null, 
        visibility: "private",
        version: 1,
        createdAt: now, 
        updatedAt: now 
      },
      { 
        id: "wf3", 
        name: "Risk Assessment Pipeline", 
        description: "End-to-end risk assessment and mitigation", 
        status: "active", 
        tags: ["risks", "assessment"],
        ownerId: null, 
        visibility: "team",
        version: 2,
        createdAt: now, 
        updatedAt: now 
      },
    ];
    
    exampleWorkflows.forEach(w => this.workflows.set(w.id, w));
    
    const exampleNodes: WorkflowNode[] = [
      { id: "n1", workflowId: "wf1", typeId: "start", label: "Start", config: {}, positionX: 100, positionY: 200, metadata: {}, createdAt: now },
      { id: "n2", workflowId: "wf1", typeId: "ab-issues", label: "Query Open Issues", config: { action: "query", filters: { status: "open" } }, positionX: 300, positionY: 200, metadata: {}, createdAt: now },
      { id: "n3", workflowId: "wf1", typeId: "decision", label: "High Priority?", config: { conditions: [{ field: "priority", operator: "equals", value: "high" }] }, positionX: 500, positionY: 200, metadata: {}, createdAt: now },
      { id: "n4", workflowId: "wf1", typeId: "approval", label: "Manager Approval", config: { approvers: ["manager@company.com"], requiredApprovals: 1 }, positionX: 700, positionY: 100, metadata: {}, createdAt: now },
      { id: "n5", workflowId: "wf1", typeId: "human-task", label: "Standard Review", config: { assignee: "reviewer@company.com", title: "Review Issue" }, positionX: 700, positionY: 300, metadata: {}, createdAt: now },
      { id: "n6", workflowId: "wf1", typeId: "email-notification", label: "Send Summary", config: { to: ["team@company.com"], subject: "Issue Review Complete" }, positionX: 900, positionY: 200, metadata: {}, createdAt: now },
      { id: "n7", workflowId: "wf1", typeId: "end", label: "End", config: {}, positionX: 1100, positionY: 200, metadata: {}, createdAt: now },
    ];
    
    exampleNodes.forEach(n => this.nodes.set(n.id, n));
    
    const exampleEdges: WorkflowEdge[] = [
      { id: "e1", workflowId: "wf1", sourceNodeId: "n1", targetNodeId: "n2", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "e2", workflowId: "wf1", sourceNodeId: "n2", targetNodeId: "n3", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "e3", workflowId: "wf1", sourceNodeId: "n3", targetNodeId: "n4", sourceHandle: "yes", targetHandle: null, label: "High Priority", condition: { field: "priority", value: "high" }, metadata: {}, createdAt: now },
      { id: "e4", workflowId: "wf1", sourceNodeId: "n3", targetNodeId: "n5", sourceHandle: "no", targetHandle: null, label: "Normal", condition: null, metadata: {}, createdAt: now },
      { id: "e5", workflowId: "wf1", sourceNodeId: "n4", targetNodeId: "n6", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "e6", workflowId: "wf1", sourceNodeId: "n5", targetNodeId: "n6", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
      { id: "e7", workflowId: "wf1", sourceNodeId: "n6", targetNodeId: "n7", sourceHandle: null, targetHandle: null, label: null, condition: null, metadata: {}, createdAt: now },
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
