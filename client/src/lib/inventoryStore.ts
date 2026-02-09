import { create } from "zustand";

interface InventorySessionState {
  uploadedWorkspaces: Set<string>;

  isUploaded: (workspaceId: string) => boolean;
  markUploaded: (workspaceId: string) => void;
}

export const useInventoryStore = create<InventorySessionState>((set, get) => ({
  uploadedWorkspaces: new Set(),

  isUploaded: (workspaceId: string) => get().uploadedWorkspaces.has(workspaceId),

  markUploaded: (workspaceId: string) =>
    set((state) => {
      const next = new Set(state.uploadedWorkspaces);
      next.add(workspaceId);
      return { uploadedWorkspaces: next };
    }),
}));
