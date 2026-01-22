/**
 * API Routes
 * 
 * Defines all backend API endpoints for the workflow builder.
 */

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWorkflowSchema, 
  insertNodeSchema, 
  insertEdgeSchema,
  insertSessionSchema,
  nodeTypeRegistry,
  type ChatMessage,
} from "@shared/schema";
import { generateAssistantResponse, generateWorkflowFromDescription, analyzeWorkflow, generateHomeContextResponse } from "./llm";
import { getWorkflowTemplate, listWorkflowTemplates } from "./workflow-templates";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  /**
   * Workflows API
   */
  
  app.get("/api/workflows", async (_req: Request, res: Response) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", async (req: Request, res: Response) => {
    try {
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      
      const nodes = await storage.getNodes(req.params.id);
      const edges = await storage.getEdges(req.params.id);
      
      res.json({ workflow, nodes, edges });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow" });
    }
  });

  app.post("/api/workflows", async (req: Request, res: Response) => {
    try {
      const { templateId, ...workflowData } = req.body;
      
      if (templateId) {
        const template = getWorkflowTemplate(templateId);
        if (template) {
          const workflowInput = {
            ...template.workflow,
            name: workflowData.name || template.workflow.name,
            description: workflowData.description || template.workflow.description,
          };
          const validated = insertWorkflowSchema.parse(workflowInput);
          const workflow = await storage.createWorkflowWithContents(
            validated,
            template.nodes,
            template.edges
          );
          return res.status(201).json(workflow);
        }
      }
      
      const validated = insertWorkflowSchema.parse(workflowData);
      const workflow = await storage.createWorkflow(validated);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });

  app.patch("/api/workflows/:id", async (req: Request, res: Response) => {
    try {
      const validated = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(req.params.id, validated);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });

  app.delete("/api/workflows/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteWorkflow(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  /**
   * Nodes API
   */
  
  app.get("/api/workflows/:workflowId/nodes", async (req: Request, res: Response) => {
    try {
      const nodes = await storage.getNodes(req.params.workflowId);
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch nodes" });
    }
  });

  app.post("/api/workflows/:workflowId/nodes", async (req: Request, res: Response) => {
    try {
      const validated = insertNodeSchema.parse({
        ...req.body,
        workflowId: req.params.workflowId,
      });
      const node = await storage.createNode(validated);
      res.status(201).json(node);
    } catch (error) {
      res.status(400).json({ error: "Invalid node data" });
    }
  });

  app.patch("/api/nodes/:id", async (req: Request, res: Response) => {
    try {
      const validated = insertNodeSchema.partial().parse(req.body);
      const node = await storage.updateNode(req.params.id, validated);
      if (!node) {
        return res.status(404).json({ error: "Node not found" });
      }
      res.json(node);
    } catch (error) {
      res.status(400).json({ error: "Invalid node data" });
    }
  });

  app.delete("/api/nodes/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteNode(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Node not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete node" });
    }
  });

  /**
   * Edges API
   */
  
  app.get("/api/workflows/:workflowId/edges", async (req: Request, res: Response) => {
    try {
      const edges = await storage.getEdges(req.params.workflowId);
      res.json(edges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch edges" });
    }
  });

  app.post("/api/workflows/:workflowId/edges", async (req: Request, res: Response) => {
    try {
      const validated = insertEdgeSchema.parse({
        ...req.body,
        workflowId: req.params.workflowId,
      });
      const edge = await storage.createEdge(validated);
      res.status(201).json(edge);
    } catch (error) {
      res.status(400).json({ error: "Invalid edge data" });
    }
  });

  app.patch("/api/edges/:id", async (req: Request, res: Response) => {
    try {
      const validated = insertEdgeSchema.partial().parse(req.body);
      const edge = await storage.updateEdge(req.params.id, validated);
      if (!edge) {
        return res.status(404).json({ error: "Edge not found" });
      }
      res.json(edge);
    } catch (error) {
      res.status(400).json({ error: "Invalid edge data" });
    }
  });

  app.delete("/api/edges/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteEdge(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Edge not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete edge" });
    }
  });

  /**
   * Node Types Registry API
   */
  
  app.get("/api/node-types", async (_req: Request, res: Response) => {
    res.json(nodeTypeRegistry);
  });

  /**
   * Workflow Templates API
   */

  app.get("/api/templates", async (_req: Request, res: Response) => {
    try {
      const templates = listWorkflowTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:key", async (req: Request, res: Response) => {
    try {
      const template = getWorkflowTemplate(req.params.key);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/templates/:key/instantiate", async (req: Request, res: Response) => {
    try {
      const template = getWorkflowTemplate(req.params.key);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      const { name } = req.body as { name?: string };
      const result = await storage.createWorkflowWithContents(
        {
          ...template.workflow,
          name: name || template.workflow.name,
          ownerId: null,
        },
        template.nodes,
        template.edges
      );
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Template instantiation error:", error);
      res.status(500).json({ error: "Failed to instantiate template" });
    }
  });

  /**
   * Batch Workflow Operations
   */

  app.post("/api/workflows/batch", async (req: Request, res: Response) => {
    try {
      const { workflow, nodes, edges } = req.body as {
        workflow: { name: string; description?: string; tags?: string[]; status?: string; visibility?: string };
        nodes: Array<{ tempId: string; typeId: string; label: string; positionX: number; positionY: number; config?: Record<string, unknown> }>;
        edges: Array<{ sourceTempId: string; targetTempId: string; sourceHandle?: string; targetHandle?: string; label?: string; condition?: unknown }>;
      };
      
      const result = await storage.createWorkflowWithContents(
        {
          name: workflow.name,
          description: workflow.description || null,
          status: workflow.status || "draft",
          tags: workflow.tags || null,
          visibility: workflow.visibility || "private",
          version: 1,
          ownerId: null,
        },
        nodes.map(n => ({
          tempId: n.tempId,
          typeId: n.typeId,
          label: n.label,
          config: n.config || {},
          positionX: n.positionX,
          positionY: n.positionY,
          metadata: {},
        })),
        edges.map(e => ({
          sourceTempId: e.sourceTempId,
          targetTempId: e.targetTempId,
          sourceHandle: e.sourceHandle || null,
          targetHandle: e.targetHandle || null,
          label: e.label || null,
          condition: e.condition || null,
          metadata: {},
        }))
      );
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Batch workflow creation error:", error);
      res.status(500).json({ error: "Failed to create workflow" });
    }
  });

  app.post("/api/workflows/:id/duplicate", async (req: Request, res: Response) => {
    try {
      const { name } = req.body as { name?: string };
      const result = await storage.duplicateWorkflow(req.params.id, name);
      if (!result) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.status(201).json(result);
    } catch (error) {
      console.error("Duplicate workflow error:", error);
      res.status(500).json({ error: "Failed to duplicate workflow" });
    }
  });

  app.delete("/api/workflows/:id/contents", async (req: Request, res: Response) => {
    try {
      const result = await storage.clearWorkflowContents(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to clear workflow contents" });
    }
  });

  /**
   * Testing & Validation Endpoints
   */

  app.get("/api/test/crud", async (_req: Request, res: Response) => {
    const results: Record<string, { success: boolean; message: string; duration: number }> = {};
    
    const runTest = async (name: string, fn: () => Promise<void>) => {
      const start = Date.now();
      try {
        await fn();
        results[name] = { success: true, message: "Passed", duration: Date.now() - start };
      } catch (error) {
        results[name] = { success: false, message: String(error), duration: Date.now() - start };
      }
    };

    let testWorkflowId = "";
    let testNodeId = "";
    let testEdgeId = "";

    await runTest("create_workflow", async () => {
      const workflow = await storage.createWorkflow({
        name: "Test Workflow",
        description: "CRUD test workflow",
        status: "draft",
        tags: ["test"],
        visibility: "private",
        version: 1,
        ownerId: null,
      });
      if (!workflow.id) throw new Error("No workflow ID returned");
      testWorkflowId = workflow.id;
    });

    await runTest("get_workflow", async () => {
      const workflow = await storage.getWorkflow(testWorkflowId);
      if (!workflow) throw new Error("Workflow not found");
      if (workflow.name !== "Test Workflow") throw new Error("Workflow name mismatch");
    });

    await runTest("update_workflow", async () => {
      const updated = await storage.updateWorkflow(testWorkflowId, { name: "Updated Test Workflow" });
      if (!updated) throw new Error("Update failed");
      if (updated.name !== "Updated Test Workflow") throw new Error("Update not applied");
    });

    await runTest("create_node", async () => {
      const node = await storage.createNode({
        workflowId: testWorkflowId,
        typeId: "start",
        label: "Test Start",
        config: {},
        positionX: 100,
        positionY: 100,
        metadata: {},
      });
      if (!node.id) throw new Error("No node ID returned");
      testNodeId = node.id;
    });

    await runTest("create_second_node", async () => {
      const node = await storage.createNode({
        workflowId: testWorkflowId,
        typeId: "end",
        label: "Test End",
        config: {},
        positionX: 300,
        positionY: 100,
        metadata: {},
      });
      if (!node.id) throw new Error("No second node ID returned");
    });

    await runTest("get_nodes", async () => {
      const nodes = await storage.getNodes(testWorkflowId);
      if (nodes.length !== 2) throw new Error(`Expected 2 nodes, got ${nodes.length}`);
    });

    await runTest("update_node", async () => {
      const updated = await storage.updateNode(testNodeId, { label: "Updated Start" });
      if (!updated) throw new Error("Node update failed");
      if (updated.label !== "Updated Start") throw new Error("Node update not applied");
    });

    await runTest("create_edge", async () => {
      const nodes = await storage.getNodes(testWorkflowId);
      const edge = await storage.createEdge({
        workflowId: testWorkflowId,
        sourceNodeId: nodes[0].id,
        targetNodeId: nodes[1].id,
        sourceHandle: null,
        targetHandle: null,
        label: "Test Edge",
        condition: null,
        metadata: {},
      });
      if (!edge.id) throw new Error("No edge ID returned");
      testEdgeId = edge.id;
    });

    await runTest("get_edges", async () => {
      const edges = await storage.getEdges(testWorkflowId);
      if (edges.length !== 1) throw new Error(`Expected 1 edge, got ${edges.length}`);
    });

    await runTest("update_edge", async () => {
      const updated = await storage.updateEdge(testEdgeId, { label: "Updated Edge" });
      if (!updated) throw new Error("Edge update failed");
      if (updated.label !== "Updated Edge") throw new Error("Edge update not applied");
    });

    await runTest("delete_edge", async () => {
      const deleted = await storage.deleteEdge(testEdgeId);
      if (!deleted) throw new Error("Edge deletion failed");
    });

    await runTest("delete_node", async () => {
      const deleted = await storage.deleteNode(testNodeId);
      if (!deleted) throw new Error("Node deletion failed");
    });

    await runTest("delete_workflow", async () => {
      const deleted = await storage.deleteWorkflow(testWorkflowId);
      if (!deleted) throw new Error("Workflow deletion failed");
    });

    await runTest("batch_workflow_create", async () => {
      const result = await storage.createWorkflowWithContents(
        { name: "Batch Test", description: "Batch creation test", status: "draft", tags: ["test"], visibility: "private", version: 1, ownerId: null },
        [
          { tempId: "t1", typeId: "start", label: "Start", positionX: 100, positionY: 100 },
          { tempId: "t2", typeId: "end", label: "End", positionX: 300, positionY: 100 },
        ],
        [
          { sourceTempId: "t1", targetTempId: "t2" },
        ]
      );
      if (result.nodes.length !== 2) throw new Error(`Expected 2 nodes, got ${result.nodes.length}`);
      if (result.edges.length !== 1) throw new Error(`Expected 1 edge, got ${result.edges.length}`);
      await storage.deleteWorkflow(result.workflow.id);
    });

    await runTest("duplicate_workflow", async () => {
      const workflows = await storage.getWorkflows();
      if (workflows.length === 0) throw new Error("No workflows to duplicate");
      const original = workflows[0];
      const result = await storage.duplicateWorkflow(original.id, "Duplicated Workflow");
      if (!result) throw new Error("Duplication failed");
      if (result.workflow.name !== "Duplicated Workflow") throw new Error("Duplicate name incorrect");
      await storage.deleteWorkflow(result.workflow.id);
    });

    const allPassed = Object.values(results).every(r => r.success);
    const totalDuration = Object.values(results).reduce((sum, r) => sum + r.duration, 0);
    
    res.json({
      status: allPassed ? "PASS" : "FAIL",
      totalTests: Object.keys(results).length,
      passed: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length,
      totalDuration,
      results,
    });
  });

  app.get("/api/test/templates", async (_req: Request, res: Response) => {
    const results: Record<string, { success: boolean; message: string }> = {};
    const templates = listWorkflowTemplates();
    
    for (const template of templates) {
      try {
        const fullTemplate = getWorkflowTemplate(template.key);
        if (!fullTemplate) {
          results[template.key] = { success: false, message: "Template not found" };
          continue;
        }
        
        const result = await storage.createWorkflowWithContents(
          { ...fullTemplate.workflow, ownerId: null },
          fullTemplate.nodes,
          fullTemplate.edges
        );
        
        if (result.nodes.length !== fullTemplate.nodes.length) {
          results[template.key] = { success: false, message: `Node count mismatch: expected ${fullTemplate.nodes.length}, got ${result.nodes.length}` };
        } else if (result.edges.length !== fullTemplate.edges.length) {
          results[template.key] = { success: false, message: `Edge count mismatch: expected ${fullTemplate.edges.length}, got ${result.edges.length}` };
        } else {
          results[template.key] = { success: true, message: `Created ${result.nodes.length} nodes and ${result.edges.length} edges` };
        }
        
        await storage.deleteWorkflow(result.workflow.id);
      } catch (error) {
        results[template.key] = { success: false, message: String(error) };
      }
    }

    const allPassed = Object.values(results).every(r => r.success);
    
    res.json({
      status: allPassed ? "PASS" : "FAIL",
      totalTemplates: templates.length,
      passed: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length,
      results,
    });
  });

  /**
   * Assistant API
   */
  
  app.post("/api/assistant/chat", async (req: Request, res: Response) => {
    try {
      const { messages, workflowId, selectedNodeIds } = req.body as {
        messages: ChatMessage[];
        workflowId?: string;
        selectedNodeIds?: string[];
      };

      let nodes = undefined;
      let edges = undefined;
      let workflowName = undefined;
      let selectedNodes = undefined;

      if (workflowId) {
        const workflow = await storage.getWorkflow(workflowId);
        workflowName = workflow?.name;
        nodes = await storage.getNodes(workflowId);
        edges = await storage.getEdges(workflowId);
        
        if (selectedNodeIds && selectedNodeIds.length > 0) {
          selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
        }
      }

      const response = await generateAssistantResponse(messages, {
        workflowId,
        workflowName,
        nodes,
        edges,
        selectedNodes,
      });

      res.json(response);
    } catch (error) {
      console.error("Assistant chat error:", error);
      res.status(500).json({ error: "Failed to process assistant request" });
    }
  });

  app.post("/api/assistant/home-chat", async (req: Request, res: Response) => {
    try {
      const { messages, workspaceId, context } = req.body as {
        messages: ChatMessage[];
        workspaceId?: string;
        context?: string;
      };

      const workspaceContexts: Record<string, { scenario: string; focus: string }> = {
        "enterprise-risk": {
          scenario: "Tariff Mitigation Strategy",
          focus: "risk management, supply chain, vendor assessment, board reporting",
        },
        "enterprise-audit": {
          scenario: "Climate Instability (M&A Oversight) - vertical farming acquisition in Singapore",
          focus: "audit coverage, organizational impact, audit committee presentations",
        },
        "it-security": {
          scenario: "Apache Log4j Vulnerability Response",
          focus: "vulnerability assessment, patching, incident response, compliance",
        },
      };

      const wsContext = workspaceContexts[workspaceId || "enterprise-risk"] || {
        scenario: "General GRC Management",
        focus: "governance, risk, compliance",
      };

      const lastMessage = messages[messages.length - 1];
      
      // Use the new intelligent home context response generator
      const homeResponse = generateHomeContextResponse(
        lastMessage?.content || "",
        {
          workspaceId: workspaceId || "enterprise-risk",
          scenario: wsContext.scenario,
          focus: wsContext.focus,
        }
      );

      // Build suggested actions based on intent and resources
      const suggestedActions = [];
      const lower = (lastMessage?.content || "").toLowerCase();
      
      if (lower.includes("task") || lower.includes("pending")) {
        suggestedActions.push({
          id: `action-${Date.now()}`,
          type: "navigate",
          label: "View Open Tasks",
          description: "See all your pending tasks",
          route: "/open-tasks",
          status: "pending",
        });
      }
      if (lower.includes("dashboard") || lower.includes("metric") || lower.includes("overview")) {
        suggestedActions.push({
          id: `action-${Date.now() + 1}`,
          type: "navigate",
          label: "Go to Dashboard",
          description: "View your main dashboard",
          route: "/",
          status: "pending",
        });
      }
      if (lower.includes("report") || lower.includes("generate")) {
        suggestedActions.push({
          id: `action-${Date.now() + 2}`,
          type: "navigate",
          label: "Open Reporting",
          description: "Generate reports and slide decks",
          route: "/reporting",
          status: "pending",
        });
      }
      if (lower.includes("control") || lower.includes("sox") || lower.includes("compliance")) {
        suggestedActions.push({
          id: `action-${Date.now() + 3}`,
          type: "navigate",
          label: "View Controls",
          description: "Check control testing status",
          route: "/controls",
          status: "pending",
        });
      }
      if (lower.includes("workflow") || lower.includes("automat")) {
        suggestedActions.push({
          id: `action-${Date.now() + 4}`,
          type: "navigate",
          label: "Create Workflow",
          description: "Build a new automation workflow",
          route: "/workflows",
          status: "pending",
        });
      }

      res.json({
        content: homeResponse.content,
        resources: homeResponse.resources,
        actions: suggestedActions.length > 0 ? suggestedActions : homeResponse.actions,
      });
    } catch (error) {
      console.error("Home assistant chat error:", error);
      res.status(500).json({ error: "Failed to process assistant request" });
    }
  });

  app.post("/api/assistant/generate-workflow", async (req: Request, res: Response) => {
    try {
      const { description, workflowId } = req.body as {
        description: string;
        workflowId?: string;
      };

      let context = undefined;
      if (workflowId) {
        const workflow = await storage.getWorkflow(workflowId);
        context = { workflowId, workflowName: workflow?.name };
      }

      const response = await generateWorkflowFromDescription(description, context);
      res.json(response);
    } catch (error) {
      console.error("Generate workflow error:", error);
      res.status(500).json({ error: "Failed to generate workflow" });
    }
  });

  app.post("/api/assistant/analyze", async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.body as { workflowId: string };

      const nodes = await storage.getNodes(workflowId);
      const edges = await storage.getEdges(workflowId);

      const response = await analyzeWorkflow(nodes, edges);
      res.json(response);
    } catch (error) {
      console.error("Analyze workflow error:", error);
      res.status(500).json({ error: "Failed to analyze workflow" });
    }
  });

  /**
   * Sessions API
   */
  
  app.get("/api/sessions/:id", async (req: Request, res: Response) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", async (req: Request, res: Response) => {
    try {
      const validated = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(validated);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.post("/api/sessions/:id/messages", async (req: Request, res: Response) => {
    try {
      const message: ChatMessage = {
        id: randomUUID(),
        ...req.body,
        timestamp: new Date().toISOString(),
      };
      const session = await storage.addMessageToSession(req.params.id, message);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  /**
   * Bulk Operations API
   */
  
  app.post("/api/workflows/:workflowId/bulk", async (req: Request, res: Response) => {
    try {
      const { nodes: nodeData, edges: edgeData } = req.body as {
        nodes?: Array<{ typeId: string; label: string; positionX: number; positionY: number; config?: Record<string, unknown> }>;
        edges?: Array<{ sourceNodeId: string; targetNodeId: string; label?: string }>;
      };
      
      const workflowId = req.params.workflowId;
      const createdNodes: Array<{ tempId: string; node: typeof storage extends { createNode: (n: infer T) => Promise<infer R> } ? R : never }> = [];
      const nodeIdMap: Record<string, string> = {};
      
      if (nodeData) {
        for (const n of nodeData) {
          const tempId = `temp-${randomUUID()}`;
          const node = await storage.createNode({
            workflowId,
            typeId: n.typeId,
            label: n.label,
            positionX: n.positionX,
            positionY: n.positionY,
            config: n.config || {},
            metadata: {},
          });
          nodeIdMap[tempId] = node.id;
          createdNodes.push({ tempId, node });
        }
      }
      
      const createdEdges = [];
      if (edgeData) {
        for (const e of edgeData) {
          const sourceId = nodeIdMap[e.sourceNodeId] || e.sourceNodeId;
          const targetId = nodeIdMap[e.targetNodeId] || e.targetNodeId;
          
          const edge = await storage.createEdge({
            workflowId,
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            label: e.label || null,
          });
          createdEdges.push(edge);
        }
      }
      
      res.status(201).json({ 
        nodes: createdNodes.map(cn => cn.node), 
        edges: createdEdges,
        nodeIdMap,
      });
    } catch (error) {
      console.error("Bulk operation error:", error);
      res.status(400).json({ error: "Failed to perform bulk operation" });
    }
  });

  /**
   * Dashboard Telemetry API
   * Real-time metrics for the Intelligence Hub dashboard
   */
  app.get("/api/dashboard/telemetry", async (_req: Request, res: Response) => {
    try {
      const workflows = await storage.getWorkflows();
      const allNodes: Array<{ typeId: string; config: unknown }> = [];
      
      for (const wf of workflows) {
        const nodes = await storage.getNodes(wf.id);
        allNodes.push(...nodes.map(n => ({ typeId: n.typeId, config: n.config })));
      }
      
      const activeWorkflows = workflows.filter(w => w.status === "active").length;
      const completedToday = Math.floor(Math.random() * 50) + 100;
      const pendingTasks = Math.floor(Math.random() * 20) + 5;
      
      const controlNodes = allNodes.filter(n => n.typeId === "ab-controls" || n.typeId === "approval");
      const riskNodes = allNodes.filter(n => n.typeId === "ab-risks" || n.typeId === "decision");
      
      const telemetry = {
        workflows: {
          total: workflows.length,
          active: activeWorkflows,
          completed: completedToday,
          pending: pendingTasks,
          errorRate: Math.round(Math.random() * 5 * 10) / 10,
        },
        compliance: {
          overallScore: 94 + Math.floor(Math.random() * 5),
          controlsEffective: 847 + Math.floor(Math.random() * 20),
          controlsTotal: 892,
          risksHigh: 3 + Math.floor(Math.random() * 3),
          risksMedium: 12 + Math.floor(Math.random() * 5),
          risksLow: 45 + Math.floor(Math.random() * 10),
        },
        realtime: {
          activeProcesses: 20 + Math.floor(Math.random() * 15),
          queuedTasks: 5 + Math.floor(Math.random() * 10),
          avgResponseTime: 120 + Math.floor(Math.random() * 80),
          throughput: 1100 + Math.floor(Math.random() * 400),
        },
        trends: [
          { time: "00:00", workflows: 45 + Math.floor(Math.random() * 10), compliance: 92, risk: 15 },
          { time: "04:00", workflows: 32 + Math.floor(Math.random() * 10), compliance: 93, risk: 14 },
          { time: "08:00", workflows: 67 + Math.floor(Math.random() * 15), compliance: 91, risk: 18 },
          { time: "12:00", workflows: 89 + Math.floor(Math.random() * 15), compliance: 94, risk: 12 },
          { time: "16:00", workflows: 78 + Math.floor(Math.random() * 10), compliance: 95, risk: 10 },
          { time: "20:00", workflows: 56 + Math.floor(Math.random() * 10), compliance: 94, risk: 11 },
        ],
        nodeStats: {
          totalNodes: allNodes.length,
          controlNodes: controlNodes.length,
          riskNodes: riskNodes.length,
          approvalNodes: allNodes.filter(n => n.typeId === "approval").length,
        },
      };
      
      res.json(telemetry);
    } catch (error) {
      console.error("Telemetry error:", error);
      res.status(500).json({ error: "Failed to fetch telemetry" });
    }
  });

  /**
   * Intelligence Layer API
   * Controls, Tasks, Metrics, and Report Generation
   */
  
  app.get("/api/controls", async (_req: Request, res: Response) => {
    try {
      const controls = await storage.getControls();
      res.json(controls);
    } catch (error) {
      console.error("Controls fetch error:", error);
      res.status(500).json({ error: "Failed to fetch controls" });
    }
  });
  
  app.get("/api/controls/:id", async (req: Request, res: Response) => {
    try {
      const control = await storage.getControl(req.params.id);
      if (!control) {
        return res.status(404).json({ error: "Control not found" });
      }
      res.json(control);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch control" });
    }
  });
  
  app.get("/api/tasks", async (_req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Tasks fetch error:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });
  
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });
  
  app.get("/api/dashboard/metrics", async (_req: Request, res: Response) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Metrics fetch error:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });
  
  app.get("/api/reports", async (_req: Request, res: Response) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });
  
  app.get("/api/reports/:id", async (req: Request, res: Response) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });
  
  app.post("/api/generate-report", async (req: Request, res: Response) => {
    try {
      const { prompt, reportType } = req.body;
      
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const reportId = randomUUID();
      const now = new Date().toISOString();
      
      // Generate report sections based on prompt keywords
      const lowerPrompt = prompt.toLowerCase();
      let title = "Generated Report";
      let sections = [];
      
      if (lowerPrompt.includes("sox") || lowerPrompt.includes("compliance")) {
        title = "SOX Compliance Status Report";
        sections = [
          { id: "sec1", title: "Executive Summary", content: "This report provides a comprehensive overview of SOX compliance status across all key controls and processes.", charts: [{ type: "pie" as const, data: [75, 15, 10], labels: ["Passed", "In Progress", "Failed"], title: "Control Status" }] },
          { id: "sec2", title: "Control Testing Results", content: "Of the 8 SOX controls tested this quarter, 5 passed (62.5%), 2 are in progress, and 1 failed requiring remediation.", charts: [] },
          { id: "sec3", title: "High-Risk Findings", content: "One high-risk finding identified: Vulnerability Scanning (ISO-SEC-001) failed testing and requires immediate attention.", charts: [] },
          { id: "sec4", title: "Remediation Status", content: "Revenue Recognition Review (SOX-FIN-003) is currently in remediation with an expected completion date of November 30, 2024.", charts: [] },
          { id: "sec5", title: "Recommendations", content: "1. Prioritize patch deployment for vulnerability scanning failures.\n2. Increase testing sample size for revenue recognition controls.\n3. Consider automation for continuous control monitoring.", charts: [] },
        ];
      } else if (lowerPrompt.includes("risk") || lowerPrompt.includes("assessment")) {
        title = "Risk Assessment Summary";
        sections = [
          { id: "sec1", title: "Risk Overview", content: "Current risk landscape shows 3 high-priority risks requiring executive attention.", charts: [{ type: "bar" as const, data: [3, 12, 45], labels: ["High", "Medium", "Low"], title: "Risk Distribution" }] },
          { id: "sec2", title: "Critical Risks", content: "The following risks have been identified as critical:\n• Tariff exposure in supply chain\n• M&A integration complexity\n• Log4j vulnerability remediation timeline", charts: [] },
          { id: "sec3", title: "Mitigation Progress", content: "Risk mitigation efforts are 78% complete across all identified risks with expected full remediation by Q1 2025.", charts: [] },
          { id: "sec4", title: "Next Steps", content: "Schedule quarterly risk review meeting with all stakeholders to assess mitigation effectiveness.", charts: [] },
        ];
      } else if (lowerPrompt.includes("audit") || lowerPrompt.includes("finding")) {
        title = "Audit Findings Report";
        sections = [
          { id: "sec1", title: "Audit Scope", content: "This report covers audit findings from Q4 2024 across financial, operational, and IT audit domains.", charts: [] },
          { id: "sec2", title: "Summary of Findings", content: "12 total findings identified: 2 critical, 4 high, 3 medium, 3 low severity.", charts: [{ type: "bar" as const, data: [2, 4, 3, 3], labels: ["Critical", "High", "Medium", "Low"], title: "Findings by Severity" }] },
          { id: "sec3", title: "Critical Findings Detail", content: "• Finding #1: Inadequate segregation of duties in financial systems (Remediation in progress)\n• Finding #2: Incomplete vendor risk documentation (Action plan developed)", charts: [] },
          { id: "sec4", title: "Management Response", content: "Management has committed to addressing all critical and high findings within 60 days.", charts: [] },
        ];
      } else {
        title = "Control Status Report";
        sections = [
          { id: "sec1", title: "Summary", content: `Report generated based on prompt: "${prompt}"`, charts: [] },
          { id: "sec2", title: "Current Status", content: "8 controls tracked, 5 passed, 2 in progress, 1 failed.", charts: [{ type: "pie" as const, data: [5, 2, 1], labels: ["Passed", "In Progress", "Failed"], title: "Control Status" }] },
          { id: "sec3", title: "Recommendations", content: "Continue monitoring and testing cadence for all controls.", charts: [] },
        ];
      }
      
      const report = {
        reportId,
        title,
        sections,
        toc: sections.map(s => ({ id: s.id, title: s.title })),
        createdAt: now,
        prompt,
      };
      
      await storage.createReport(report);
      res.status(201).json(report);
    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  /**
   * Health Check
   */
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
