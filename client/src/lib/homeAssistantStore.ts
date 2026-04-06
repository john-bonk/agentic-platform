/**
 * Home Assistant Store
 * 
 * Zustand store for managing the global assistant panel state
 * used on home pages and throughout the app (not workflow-specific)
 */

import { create } from "zustand";

interface ChatMessageAction {
  label: string;
  actionId: string;
  variant?: "primary" | "outline";
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  resources?: ResourceReference[];
  agentLabel?: string;
  actions?: ChatMessageAction[];
}

interface ResourceReference {
  type: "Task" | "Report" | "Control" | "Risk";
  title: string;
  id?: string;
  assignee?: string;
  dueDate?: string;
  status?: string;
  route?: string;
}

interface SuggestedAction {
  id: string;
  type: string;
  label: string;
  description: string;
  route?: string;
  status: "pending" | "applied" | "dismissed";
}

interface HomeAssistantState {
  isOpen: boolean;
  messages: ChatMessage[];
  suggestedActions: SuggestedAction[];
  isLoading: boolean;
  onMessageAction: ((actionId: string) => void) | null;
  
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setSuggestedActions: (actions: SuggestedAction[]) => void;
  updateActionStatus: (actionId: string, status: SuggestedAction["status"]) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
  setOnMessageAction: (handler: ((actionId: string) => void) | null) => void;
}

export const useHomeAssistantStore = create<HomeAssistantState>((set) => ({
  isOpen: false,
  messages: [],
  suggestedActions: [],
  isLoading: false,
  onMessageAction: null,

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  
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
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearChat: () => set({ messages: [], suggestedActions: [] }),
  setOnMessageAction: (handler) => set({ onMessageAction: handler }),
}));

export type { ChatMessage, ChatMessageAction, SuggestedAction, ResourceReference };
