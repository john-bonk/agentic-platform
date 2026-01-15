/**
 * Create Workspace Dialog
 * 
 * Dialog for creating a new workspace with name and solution capabilities selection.
 * Team member invites are optional (can be configured later).
 * Solution capabilities support multi-select.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  TrendingUp,
  ClipboardList,
  Lock,
  Server,
  Scale,
  Users,
  Cpu,
  Leaf,
  Plus,
  X,
} from "lucide-react";
import { solutionCapabilities, type SolutionCapability, type Workspace, useWorkspaceStore } from "@/lib/workspaceStore";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkspaceCreated?: (workspace: Workspace) => void;
}

interface TeamMember {
  id: string;
  email: string;
  role: "Admin" | "Member" | "Viewer";
}

const getCapabilityIcon = (iconName: string) => {
  const iconClass = "w-5 h-5";
  switch (iconName) {
    case "shield-check": return <ShieldCheck className={iconClass} />;
    case "trending-up": return <TrendingUp className={iconClass} />;
    case "clipboard-list": return <ClipboardList className={iconClass} />;
    case "lock": return <Lock className={iconClass} />;
    case "server": return <Server className={iconClass} />;
    case "scale": return <Scale className={iconClass} />;
    case "users": return <Users className={iconClass} />;
    case "cpu": return <Cpu className={iconClass} />;
    case "leaf": return <Leaf className={iconClass} />;
    default: return <ShieldCheck className={iconClass} />;
  }
};

export function CreateWorkspaceDialog({ open, onOpenChange, onWorkspaceCreated }: CreateWorkspaceDialogProps) {
  const { addWorkspace } = useWorkspaceStore();
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "1", email: "", role: "Member" }
  ]);

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { id: Date.now().toString(), email: "", role: "Member" }]);
  };

  const handleRemoveMember = (id: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    }
  };

  const handleMemberChange = (id: string, field: "email" | "role", value: string) => {
    setTeamMembers(teamMembers.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleCapabilityToggle = (capabilityId: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(capabilityId)
        ? prev.filter(id => id !== capabilityId)
        : [...prev, capabilityId]
    );
  };

  const handleCreate = () => {
    if (!workspaceName.trim() || selectedCapabilities.length === 0) return;

    const newWorkspace: Workspace = {
      id: `custom-${Date.now()}`,
      name: workspaceName.trim(),
      persona: "Custom",
      personaTitle: "Workspace Administrator",
      selectedCapabilities: selectedCapabilities,
      isCustom: true,
    };

    addWorkspace(newWorkspace);
    onWorkspaceCreated?.(newWorkspace);
    
    setWorkspaceName("");
    setSelectedCapabilities([]);
    setTeamMembers([{ id: "1", email: "", role: "Member" }]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setWorkspaceName("");
    setSelectedCapabilities([]);
    setTeamMembers([{ id: "1", email: "", role: "Member" }]);
    onOpenChange(false);
  };

  const isValid = workspaceName.trim().length > 0 && selectedCapabilities.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto" data-testid="create-workspace-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold" data-testid="dialog-title">
            Create a New Workspace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name" className="text-sm font-medium">
              Workspace Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g., Cyber Security"
              className="h-10"
              data-testid="input-workspace-name"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium flex-1">
                Email
              </Label>
              <Label className="text-sm font-medium w-28">Role</Label>
              <div className="w-8" />
            </div>
            
            {teamMembers.map((member, index) => (
              <div key={member.id} className="flex items-center gap-3">
                <Input
                  value={member.email}
                  onChange={(e) => handleMemberChange(member.id, "email", e.target.value)}
                  placeholder="email@company.com"
                  className="flex-1 h-9"
                  data-testid={`input-member-email-${index}`}
                />
                <Select
                  value={member.role}
                  onValueChange={(value) => handleMemberChange(member.id, "role", value as TeamMember["role"])}
                >
                  <SelectTrigger className="w-28 h-9" data-testid={`select-member-role-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={teamMembers.length === 1}
                  data-testid={`button-remove-member-${index}`}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMember}
                className="text-sm"
                data-testid="button-add-member"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add more
              </Button>
              <span className="text-sm text-gray-500">
                Or set up <Button variant="link" className="p-0 h-auto text-[#266C92]" data-testid="button-advanced-permissions">advanced permissions</Button>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Solution Capabilities<span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">(Select one or more)</span>
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {solutionCapabilities.map((capability) => {
                const isSelected = selectedCapabilities.includes(capability.id);
                return (
                  <button
                    key={capability.id}
                    onClick={() => handleCapabilityToggle(capability.id)}
                    className={`flex items-center gap-3 p-3 rounded-md border text-left transition-colors hover-elevate ${
                      isSelected 
                        ? "border-[#266C92] bg-[#266C92]/5" 
                        : "border-gray-200"
                    }`}
                    data-testid={`capability-${capability.id}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleCapabilityToggle(capability.id)}
                      className="data-[state=checked]:bg-[#266C92] data-[state=checked]:border-[#266C92]"
                      data-testid={`checkbox-capability-${capability.id}`}
                    />
                    <div className={`${isSelected ? "text-[#266C92]" : "text-gray-500"}`}>
                      {getCapabilityIcon(capability.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isSelected ? "text-[#266C92]" : "text-gray-900"}`}>
                        {capability.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {capability.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-create"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValid}
            className="bg-[#266C92]"
            data-testid="button-create-workspace"
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
