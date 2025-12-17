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
import { generateAssistantResponse, generateWorkflowFromDescription, analyzeWorkflow } from "./llm";
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
      const validated = insertWorkflowSchema.parse(req.body);
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
   * Health Check
   */
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
