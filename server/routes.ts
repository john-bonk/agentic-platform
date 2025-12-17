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
import { generateAssistantResponse, generateWorkflowFromDescription, analyzeWorkflow } from "./openai";
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
