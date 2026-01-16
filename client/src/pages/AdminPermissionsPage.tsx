import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Users, 
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Check,
  X
} from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Permission {
  id: string;
  name: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  isSystem: boolean;
  permissions: Permission[];
}

const roles: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access with all permissions",
    users: 5,
    isSystem: true,
    permissions: [
      { id: "users", name: "User Management", read: true, write: true, delete: true, admin: true },
      { id: "workspaces", name: "Workspaces", read: true, write: true, delete: true, admin: true },
      { id: "reports", name: "Reports", read: true, write: true, delete: true, admin: true },
      { id: "settings", name: "System Settings", read: true, write: true, delete: true, admin: true },
    ],
  },
  {
    id: "risk-manager",
    name: "Risk Manager",
    description: "Manage risks, controls, and assessments",
    users: 23,
    isSystem: false,
    permissions: [
      { id: "users", name: "User Management", read: true, write: false, delete: false, admin: false },
      { id: "workspaces", name: "Workspaces", read: true, write: true, delete: false, admin: false },
      { id: "reports", name: "Reports", read: true, write: true, delete: false, admin: false },
      { id: "settings", name: "System Settings", read: true, write: false, delete: false, admin: false },
    ],
  },
  {
    id: "auditor",
    name: "Auditor",
    description: "View and document audit findings",
    users: 42,
    isSystem: false,
    permissions: [
      { id: "users", name: "User Management", read: true, write: false, delete: false, admin: false },
      { id: "workspaces", name: "Workspaces", read: true, write: true, delete: false, admin: false },
      { id: "reports", name: "Reports", read: true, write: true, delete: true, admin: false },
      { id: "settings", name: "System Settings", read: false, write: false, delete: false, admin: false },
    ],
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to assigned workspaces",
    users: 35,
    isSystem: true,
    permissions: [
      { id: "users", name: "User Management", read: false, write: false, delete: false, admin: false },
      { id: "workspaces", name: "Workspaces", read: true, write: false, delete: false, admin: false },
      { id: "reports", name: "Reports", read: true, write: false, delete: false, admin: false },
      { id: "settings", name: "System Settings", read: false, write: false, delete: false, admin: false },
    ],
  },
];

function PermissionIndicator({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <Check className="w-4 h-4 text-green-600" />
  ) : (
    <X className="w-4 h-4 text-muted-foreground/40" />
  );
}

function RoleCard({ role, isExpanded, onToggle }: { role: Role; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Card className="mb-3" data-testid={`role-card-${role.id}`}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover-elevate" data-testid={`role-trigger-${role.id}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{role.name}</h3>
                    {role.isSystem && (
                      <Badge variant="secondary" className="text-xs">System</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{role.users} users</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`button-edit-role-${role.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`button-duplicate-role-${role.id}`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {!role.isSystem && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`button-delete-role-${role.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[200px]">Permission</TableHead>
                    <TableHead className="text-center w-[100px]">Read</TableHead>
                    <TableHead className="text-center w-[100px]">Write</TableHead>
                    <TableHead className="text-center w-[100px]">Delete</TableHead>
                    <TableHead className="text-center w-[100px]">Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {role.permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <PermissionIndicator allowed={permission.read} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <PermissionIndicator allowed={permission.write} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <PermissionIndicator allowed={permission.delete} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <PermissionIndicator allowed={permission.admin} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function AdminPermissionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(["admin"]));

  const toggleRole = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader 
          title="Permissions Management" 
          description="Configure roles and access permissions across the platform"
          actions={
            <Button data-testid="button-create-role">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          }
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card data-testid="summary-total-roles">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{roles.length}</p>
                  <p className="text-xs text-muted-foreground">Total Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="summary-system-roles">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-950">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{roles.filter(r => r.isSystem).length}</p>
                  <p className="text-xs text-muted-foreground">System Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="summary-total-users">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-green-100 dark:bg-green-950">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{roles.reduce((sum, r) => sum + r.users, 0)}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search roles..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-roles"
            />
          </div>
        </div>
        
        <div>
          {filteredRoles.map((role) => (
            <RoleCard 
              key={role.id} 
              role={role} 
              isExpanded={expandedRoles.has(role.id)}
              onToggle={() => toggleRole(role.id)}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminPermissionsPage;
