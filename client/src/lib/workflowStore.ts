/**
 * Workflow Builder State Management
 * 
 * Uses Zustand for managing workflow canvas state
 */

import { create } from "zustand";
import {
  type WorkflowNode,
  type WorkflowEdge,
  type Workflow,
  type NodeTypeDefinition,
  type ChatMessage,
  type AssistantAction,
} from "@shared/schema";

interface WorkflowState {
  workflow: Workflow | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeIds: string[];
  isLoading: boolean;
  isPanelOpen: boolean;
  inspectorNodeId: string | null;
  
  messages: ChatMessage[];
  suggestedActions: AssistantAction[];
  isAssistantLoading: boolean;
  
  setWorkflow: (workflow: Workflow | null) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  removeEdge: (id: string) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  toggleNodeSelection: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  setPanelOpen: (open: boolean) => void;
  setInspectorNodeId: (id: string | null) => void;
  
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setSuggestedActions: (actions: AssistantAction[]) => void;
  updateActionStatus: (actionId: string, status: AssistantAction["status"]) => void;
  setAssistantLoading: (loading: boolean) => void;
  
  getSelectedNodes: () => WorkflowNode[];
  getNodeById: (id: string) => WorkflowNode | undefined;
  reset: () => void;
}

const initialState = {
  workflow: null,
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  isLoading: false,
  isPanelOpen: true,
  inspectorNodeId: null,
  messages: [],
  suggestedActions: [],
  isAssistantLoading: false,
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  ...initialState,

  setWorkflow: (workflow) => set({ workflow }),
  
  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node] 
  })),
  
  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((n) => 
      n.id === id ? { ...n, ...updates } : n
    ),
  })),
  
  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== id),
    edges: state.edges.filter((e) => e.sourceNodeId !== id && e.targetNodeId !== id),
    selectedNodeIds: state.selectedNodeIds.filter((nid) => nid !== id),
    inspectorNodeId: state.inspectorNodeId === id ? null : state.inspectorNodeId,
  })),
  
  addEdge: (edge) => set((state) => ({ 
    edges: [...state.edges, edge] 
  })),
  
  removeEdge: (id) => set((state) => ({
    edges: state.edges.filter((e) => e.id !== id),
  })),
  
  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  
  toggleNodeSelection: (id) => set((state) => ({
    selectedNodeIds: state.selectedNodeIds.includes(id)
      ? state.selectedNodeIds.filter((nid) => nid !== id)
      : [...state.selectedNodeIds, id],
  })),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  
  setInspectorNodeId: (id) => set({ inspectorNodeId: id }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  setMessages: (messages) => set({ messages }),
  
  setSuggestedActions: (actions) => set({ suggestedActions: actions }),
  
  updateActionStatus: (actionId, status) => set((state) => ({
    suggestedActions: state.suggestedActions.map((a) =>
      a.id === actionId ? { ...a, status } : a
    ),
  })),
  
  setAssistantLoading: (loading) => set({ isAssistantLoading: loading }),
  
  getSelectedNodes: () => {
    const state = get();
    return state.nodes.filter((n) => state.selectedNodeIds.includes(n.id));
  },
  
  getNodeById: (id) => {
    return get().nodes.find((n) => n.id === id);
  },
  
  reset: () => set(initialState),
}));
