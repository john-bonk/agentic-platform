import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Users, 
  Edit,
  Search,
  Clock,
  UserCheck,
  UserX,
  Layers,
  FileText,
  Building2,
  Settings,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Lock,
  Eye,
  Pencil,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  Server,
  Globe,
  Key,
  FileKey,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Fingerprint,
  UserCog,
  FolderLock,
  History,
  BookOpen,
  ClipboardList,
  Target,
  Workflow,
  AlertOctagon,
  Scale,
  Gavel
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowRight, Calendar, Filter, Copy, ToggleLeft, AlertCircle, ArrowLeftRight } from "lucide-react";

type PivotView = "user" | "role" | "data-classification" | "module" | "workspace";

interface PivotTab {
  id: PivotView;
  label: string;
  icon: React.ElementType;
}

const pivotTabs: PivotTab[] = [
  { id: "user", label: "By User", icon: Users },
  { id: "role", label: "By Role", icon: Shield },
  { id: "data-classification", label: "By Data Classification", icon: FileKey },
  // { id: "module", label: "By Module", icon: Layers }, // Hidden for now — ByModuleView code retained below for future reintroduction
  { id: "workspace", label: "By Workspace", icon: Building2 },
];

const roleFilters = ["Org Admin", "Workspace Admin", "Executive", "Manager", "Auditor", "Analyst", "Viewer"];
const workspaceFilters = ["IT Security", "Enterprise Risk", "Enterprise Audit", "Admin"];

interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  workspaces: string[];
  lastLogin: string;
  status: "active" | "inactive";
}

const users: User[] = [
  { id: "1", name: "James Smith", email: "james.smith@company.com", initials: "JS", role: "Org Admin", workspaces: ["IT Security", "Enterprise Risk", "Enterprise Audit", "Admin"], lastLogin: "Yesterday", status: "active" },
  { id: "2", name: "Mary Smith", email: "mary.smith@company.com", initials: "MS", role: "Org Admin", workspaces: ["IT Security", "Enterprise Risk", "Enterprise Audit", "Admin"], lastLogin: "4 days ago", status: "active" },
  { id: "3", name: "John Smith", email: "john.smith@company.com", initials: "JS", role: "Executive", workspaces: ["Enterprise Risk", "Enterprise Audit"], lastLogin: "2 days ago", status: "active" },
  { id: "4", name: "Emily Chen", email: "emily.chen@company.com", initials: "EC", role: "Manager", workspaces: ["IT Security", "Enterprise Risk"], lastLogin: "1 week ago", status: "active" },
  { id: "5", name: "Robert Johnson", email: "robert.johnson@company.com", initials: "RJ", role: "Auditor", workspaces: ["Enterprise Audit"], lastLogin: "3 days ago", status: "active" },
  { id: "6", name: "Sarah Williams", email: "sarah.williams@company.com", initials: "SW", role: "Analyst", workspaces: ["IT Security", "Enterprise Risk"], lastLogin: "Yesterday", status: "active" },
  { id: "7", name: "Michael Brown", email: "michael.brown@company.com", initials: "MB", role: "Viewer", workspaces: ["Enterprise Risk"], lastLogin: "2 weeks ago", status: "inactive" },
  { id: "8", name: "Lisa Davis", email: "lisa.davis@company.com", initials: "LD", role: "Auditor", workspaces: ["Enterprise Audit", "IT Security"], lastLogin: "5 days ago", status: "active" },
  { id: "9", name: "David Wilson", email: "david.wilson@company.com", initials: "DW", role: "Workspace Admin", workspaces: ["Enterprise Risk", "Admin"], lastLogin: "Today", status: "active" },
  { id: "10", name: "Jennifer Taylor", email: "jennifer.taylor@company.com", initials: "JT", role: "Analyst", workspaces: ["IT Security"], lastLogin: "3 weeks ago", status: "inactive" },
];

const summaryMetrics = [
  { label: "Total Users", value: "90", icon: Users, color: "text-primary" },
  { label: "Active Users", value: "45", icon: UserCheck, color: "text-green-600" },
  { label: "Inactive (14+ days)", value: "45", icon: UserX, color: "text-amber-600" },
  { label: "Active Roles", value: "7", icon: Shield, color: "text-purple-600" },
];

function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    "Org Admin": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    "Workspace Admin": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    Executive: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    Manager: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    Auditor: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
    Analyst: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    Viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };
  return colors[role] || "bg-gray-100 text-gray-700";
}

function getWorkspaceBadgeColor(workspace: string): string {
  const colors: Record<string, string> = {
    "IT Security": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
    "Enterprise Risk": "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800",
    "Enterprise Audit": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800",
    "Admin": "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  };
  return colors[workspace] || "bg-gray-50 text-gray-700 border-gray-200";
}

function ByUserView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [activeRoleFilters, setActiveRoleFilters] = useState<Set<string>>(new Set());
  const [activeWorkspaceFilters, setActiveWorkspaceFilters] = useState<Set<string>>(new Set());

  const toggleRoleFilter = (role: string) => {
    const newFilters = new Set(activeRoleFilters);
    if (newFilters.has(role)) {
      newFilters.delete(role);
    } else {
      newFilters.add(role);
    }
    setActiveRoleFilters(newFilters);
  };

  const toggleWorkspaceFilter = (workspace: string) => {
    const newFilters = new Set(activeWorkspaceFilters);
    if (newFilters.has(workspace)) {
      newFilters.delete(workspace);
    } else {
      newFilters.add(workspace);
    }
    setActiveWorkspaceFilters(newFilters);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = activeRoleFilters.size === 0 || activeRoleFilters.has(user.role);
    
    const matchesWorkspace = activeWorkspaceFilters.size === 0 || 
      user.workspaces.some(w => activeWorkspaceFilters.has(w));
    
    return matchesSearch && matchesRole && matchesWorkspace;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "role": return a.role.localeCompare(b.role);
      case "lastLogin": return a.lastLogin.localeCompare(b.lastLogin);
      default: return 0;
    }
  });

  return (
    <div className="flex-1 p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-users"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] h-12" data-testid="select-sort-by">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name" data-testid="sort-option-name">Sort by Name</SelectItem>
            <SelectItem value="role" data-testid="sort-option-role">Sort by Role</SelectItem>
            <SelectItem value="lastLogin" data-testid="sort-option-lastlogin">Sort by Last Login</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        <div className="flex flex-wrap gap-2">
          {roleFilters.map((role) => (
            <button
              key={role}
              onClick={() => toggleRoleFilter(role)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                activeRoleFilters.has(role)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover-elevate"
              }`}
              data-testid={`filter-role-${role.toLowerCase()}`}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {workspaceFilters.map((workspace) => (
            <button
              key={workspace}
              onClick={() => toggleWorkspaceFilter(workspace)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                activeWorkspaceFilters.has(workspace)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover-elevate"
              }`}
              data-testid={`filter-workspace-${workspace.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {workspace}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((metric) => (
          <Card key={metric.label} className="border" data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <span className="text-2xl font-bold">{metric.value}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="flex-1 border overflow-hidden" data-testid="user-permissions-table">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[280px]">User</TableHead>
                <TableHead className="min-w-[120px]">Role</TableHead>
                <TableHead className="min-w-[300px]">Workspaces</TableHead>
                <TableHead className="min-w-[140px]">Last Login</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="w-[80px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => (
                <TableRow key={user.id} className="hover-elevate" data-testid={`user-row-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getRoleBadgeColor(user.role)} border-0`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {user.workspaces.map((workspace) => (
                        <span 
                          key={workspace}
                          className={`px-2 py-1 rounded text-xs font-medium border ${getWorkspaceBadgeColor(workspace)}`}
                        >
                          {workspace}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{user.lastLogin}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm capitalize">{user.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-user-actions-${user.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem data-testid={`menu-edit-user-${user.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid={`menu-view-user-${user.id}`}>
                            <Users className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function ByRoleView() {
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(["org-admin"]));

  const roles = [
    {
      id: "org-admin",
      name: "Org Admin",
      description: "Full organization-wide access with ability to manage all configurations, workspaces, and users",
      userCount: 2,
      color: "bg-red-500",
      permissions: {
        system: ["Full Configuration Access", "User Management", "Role Management", "Audit Log Access", "System Integrations", "API Key Management", "Workspace Creation"],
        data: ["All Data Read/Write", "Delete Records", "Export All Data", "Bulk Operations", "Data Classification Override"],
        workflows: ["Create/Edit All Workflows", "Delete Workflows", "Execute System Workflows", "Workflow Templates"],
      }
    },
    {
      id: "workspace-admin",
      name: "Workspace Admin",
      description: "Full access within assigned workspaces with ability to manage workspace-specific configurations and users",
      userCount: 3,
      color: "bg-orange-500",
      permissions: {
        system: ["Workspace Configuration", "Workspace User Management", "Workspace Role Assignment", "Workspace Integrations"],
        data: ["Workspace Data Read/Write", "Delete Workspace Records", "Export Workspace Data", "Workspace Bulk Operations"],
        workflows: ["Create/Edit Workspace Workflows", "Delete Workspace Workflows", "Execute Workspace Workflows"],
      }
    },
    {
      id: "executive",
      name: "Executive",
      description: "Read access to dashboards, reports, and high-level metrics across all modules",
      userCount: 5,
      color: "bg-purple-500",
      permissions: {
        system: ["Dashboard Access", "Executive Reports", "Board Presentations", "Strategic Metrics"],
        data: ["Read All High-Level Data", "Export Executive Summaries", "Aggregate Views Only"],
        workflows: ["View Workflow Status", "Approve Critical Actions", "Delegation Management"],
      }
    },
    {
      id: "manager",
      name: "Manager",
      description: "Full access to assigned workspaces with team management capabilities",
      userCount: 12,
      color: "bg-blue-500",
      permissions: {
        system: ["Workspace Configuration", "Team Member Assignment", "Task Delegation", "Report Generation"],
        data: ["Read/Write Assigned Data", "Approve Team Submissions", "Limited Export", "Cross-Reference Views"],
        workflows: ["Create Team Workflows", "Edit Assigned Workflows", "Workflow Scheduling"],
      }
    },
    {
      id: "auditor",
      name: "Auditor",
      description: "Comprehensive read access with ability to create findings and recommendations",
      userCount: 18,
      color: "bg-teal-500",
      permissions: {
        system: ["Audit Trail Access", "Evidence Repository", "Compliance Dashboards", "Testing Modules"],
        data: ["Read All Audit Scope Data", "Create Findings", "Link Evidence", "Generate Workpapers"],
        workflows: ["Execute Audit Workflows", "Create Audit Tasks", "Request Information"],
      }
    },
    {
      id: "analyst",
      name: "Analyst",
      description: "Read access with ability to create and modify assigned records",
      userCount: 35,
      color: "bg-amber-500",
      permissions: {
        system: ["Assigned Module Access", "Basic Reports", "Personal Dashboard", "Notification Settings"],
        data: ["Read Assigned Data", "Create New Records", "Edit Own Records", "Basic Export"],
        workflows: ["Execute Assigned Tasks", "Update Task Status", "Add Comments"],
      }
    },
    {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access to permitted areas with no modification capabilities",
      userCount: 18,
      color: "bg-gray-500",
      permissions: {
        system: ["View Dashboards", "View Reports", "Personal Profile Only"],
        data: ["Read Permitted Data Only", "No Export", "No Modifications"],
        workflows: ["View Status Only", "Receive Notifications"],
      }
    },
  ];

  const toggleRole = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Role Hierarchy & Permissions</h3>
          <p className="text-sm text-muted-foreground">Configure granular permissions for each role in the system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-export-role-matrix">
            <Download className="w-4 h-4 mr-2" />
            Export Matrix
          </Button>
          <Button size="sm" data-testid="button-create-custom-role">
            <Shield className="w-4 h-4 mr-2" />
            Create Custom Role
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="border overflow-hidden" data-testid={`role-card-${role.id}`}>
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover-elevate"
              onClick={() => toggleRole(role.id)}
              data-testid={`role-header-${role.id}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-12 rounded-full ${role.color}`} />
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-lg">{role.name}</h4>
                    <Badge variant="secondary" data-testid={`role-user-count-${role.id}`}>{role.userCount} users</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} data-testid={`button-edit-role-${role.id}`}>
                  <Edit className="w-4 h-4" />
                </Button>
                {expandedRoles.has(role.id) ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
            
            {expandedRoles.has(role.id) && (
              <div className="border-t bg-muted/30 p-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <h5 className="font-medium text-sm">System Permissions</h5>
                    </div>
                    <div className="space-y-2">
                      {role.permissions.system.map((perm, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Checkbox checked id={`${role.id}-sys-${i}`} data-testid={`checkbox-${role.id}-sys-${i}`} />
                          <Label htmlFor={`${role.id}-sys-${i}`} className="text-sm">{perm}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <h5 className="font-medium text-sm">Data Permissions</h5>
                    </div>
                    <div className="space-y-2">
                      {role.permissions.data.map((perm, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Checkbox checked id={`${role.id}-data-${i}`} data-testid={`checkbox-${role.id}-data-${i}`} />
                          <Label htmlFor={`${role.id}-data-${i}`} className="text-sm">{perm}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Workflow className="w-4 h-4 text-muted-foreground" />
                      <h5 className="font-medium text-sm">Workflow Permissions</h5>
                    </div>
                    <div className="space-y-2">
                      {role.permissions.workflows.map((perm, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Checkbox checked id={`${role.id}-wf-${i}`} data-testid={`checkbox-${role.id}-wf-${i}`} />
                          <Label htmlFor={`${role.id}-wf-${i}`} className="text-sm">{perm}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ByDataClassificationView() {
  const [selectedClassification, setSelectedClassification] = useState("confidential");

  const classifications = [
    { 
      id: "public", 
      name: "Public", 
      icon: Globe, 
      color: "text-green-600 bg-green-50 border-green-200",
      description: "Information approved for public disclosure",
      recordCount: 1240,
    },
    { 
      id: "internal", 
      name: "Internal", 
      icon: Building2, 
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "General business information for internal use",
      recordCount: 8450,
    },
    { 
      id: "confidential", 
      name: "Confidential", 
      icon: Lock, 
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description: "Sensitive business data requiring protection",
      recordCount: 3280,
    },
    { 
      id: "restricted", 
      name: "Restricted", 
      icon: ShieldAlert, 
      color: "text-red-600 bg-red-50 border-red-200",
      description: "Highly sensitive data with strict access controls",
      recordCount: 890,
    },
    { 
      id: "pii", 
      name: "PII / Personal Data", 
      icon: Fingerprint, 
      color: "text-purple-600 bg-purple-50 border-purple-200",
      description: "Personally identifiable information requiring GDPR/CCPA compliance",
      recordCount: 2150,
    },
    { 
      id: "regulated", 
      name: "Regulated Data", 
      icon: Scale, 
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      description: "Data subject to regulatory requirements (SOX, HIPAA, etc.)",
      recordCount: 1680,
    },
  ];

  const accessMatrix = {
    confidential: {
      view: {
        "Org Admin": true, "Workspace Admin": true, Executive: true, Manager: true, Auditor: true, Analyst: false, Viewer: false,
      },
      edit: {
        "Org Admin": true, "Workspace Admin": true, Executive: false, Manager: true, Auditor: false, Analyst: false, Viewer: false,
      },
      delete: {
        "Org Admin": true, "Workspace Admin": false, Executive: false, Manager: false, Auditor: false, Analyst: false, Viewer: false,
      },
      export: {
        "Org Admin": true, "Workspace Admin": true, Executive: true, Manager: true, Auditor: true, Analyst: false, Viewer: false,
      },
      share: {
        "Org Admin": true, "Workspace Admin": true, Executive: false, Manager: true, Auditor: false, Analyst: false, Viewer: false,
      },
    },
    restricted: {
      view: {
        "Org Admin": true, "Workspace Admin": false, Executive: true, Manager: false, Auditor: true, Analyst: false, Viewer: false,
      },
      edit: {
        "Org Admin": true, "Workspace Admin": false, Executive: false, Manager: false, Auditor: false, Analyst: false, Viewer: false,
      },
      delete: {
        "Org Admin": true, "Workspace Admin": false, Executive: false, Manager: false, Auditor: false, Analyst: false, Viewer: false,
      },
      export: {
        "Org Admin": true, "Workspace Admin": false, Executive: false, Manager: false, Auditor: false, Analyst: false, Viewer: false,
      },
      share: {
        "Org Admin": true, "Workspace Admin": false, Executive: false, Manager: false, Auditor: false, Analyst: false, Viewer: false,
      },
    },
  };

  const dataCategories = [
    {
      category: "Risk Assessments",
      subCategories: [
        { name: "Inherent Risk Scores", classification: "Confidential", accessLevel: "Manager+" },
        { name: "Residual Risk Calculations", classification: "Confidential", accessLevel: "Manager+" },
        { name: "Control Effectiveness", classification: "Internal", accessLevel: "Analyst+" },
        { name: "Risk Appetite Thresholds", classification: "Restricted", accessLevel: "Executive+" },
      ]
    },
    {
      category: "Audit Findings",
      subCategories: [
        { name: "Draft Findings", classification: "Confidential", accessLevel: "Auditor+" },
        { name: "Published Findings", classification: "Internal", accessLevel: "Analyst+" },
        { name: "Remediation Plans", classification: "Confidential", accessLevel: "Manager+" },
        { name: "Management Responses", classification: "Confidential", accessLevel: "Manager+" },
      ]
    },
    {
      category: "Compliance Records",
      subCategories: [
        { name: "Regulatory Filings", classification: "Regulated", accessLevel: "Manager+" },
        { name: "Certification Status", classification: "Internal", accessLevel: "Analyst+" },
        { name: "Violation Records", classification: "Restricted", accessLevel: "Executive+" },
        { name: "Remediation Evidence", classification: "Confidential", accessLevel: "Auditor+" },
      ]
    },
    {
      category: "Personnel Data",
      subCategories: [
        { name: "User Profiles", classification: "PII", accessLevel: "Admin" },
        { name: "Training Records", classification: "Internal", accessLevel: "Manager+" },
        { name: "Performance Metrics", classification: "Confidential", accessLevel: "Manager+" },
        { name: "Access Logs", classification: "Restricted", accessLevel: "Admin" },
      ]
    },
  ];

  const retentionPolicies = [
    { classification: "Public", retention: "Indefinite", archival: "Not Required", destruction: "N/A" },
    { classification: "Internal", retention: "7 Years", archival: "Annual Review", destruction: "Secure Delete" },
    { classification: "Confidential", retention: "10 Years", archival: "Quarterly Review", destruction: "Certified Destruction" },
    { classification: "Restricted", retention: "Permanent", archival: "Monthly Review", destruction: "Board Approval Required" },
    { classification: "PII", retention: "As Required by Law", archival: "GDPR Compliant", destruction: "Right to Erasure" },
    { classification: "Regulated", retention: "Per Regulation", archival: "Regulatory Schedule", destruction: "Audit Trail Required" },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Data Classification Access Matrix</h3>
          <p className="text-sm text-muted-foreground">Control access based on data sensitivity levels and regulatory requirements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-audit-history">
            <History className="w-4 h-4 mr-2" />
            Audit History
          </Button>
          <Button size="sm" data-testid="button-add-classification">
            <FileKey className="w-4 h-4 mr-2" />
            Add Classification
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {classifications.map((cls) => (
          <Card 
            key={cls.id}
            className={`border cursor-pointer transition-all ${
              selectedClassification === cls.id 
                ? "ring-2 ring-primary ring-offset-2" 
                : "hover-elevate"
            }`}
            onClick={() => setSelectedClassification(cls.id)}
            data-testid={`classification-${cls.id}`}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${cls.color}`}>
                <cls.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm">{cls.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{cls.recordCount.toLocaleString()} records</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Role Access by Classification</CardTitle>
            </div>
            <CardDescription>Permission matrix for {classifications.find(c => c.id === selectedClassification)?.name} data</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <Eye className="w-4 h-4 mb-1" />
                      <span className="text-xs">View</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <Pencil className="w-4 h-4 mb-1" />
                      <span className="text-xs">Edit</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <Trash2 className="w-4 h-4 mb-1" />
                      <span className="text-xs">Delete</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <Download className="w-4 h-4 mb-1" />
                      <span className="text-xs">Export</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-4 h-4 mb-1" />
                      <span className="text-xs">Share</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {["Org Admin", "Workspace Admin", "Executive", "Manager", "Auditor", "Analyst", "Viewer"].map((role) => {
                  const matrix = accessMatrix[selectedClassification as keyof typeof accessMatrix] || accessMatrix.confidential;
                  return (
                    <TableRow key={role} data-testid={`matrix-row-${role.toLowerCase()}`}>
                      <TableCell className="font-medium">{role}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox checked={matrix.view[role as keyof typeof matrix.view]} data-testid={`checkbox-matrix-${role.toLowerCase()}-view`} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox checked={matrix.edit[role as keyof typeof matrix.edit]} data-testid={`checkbox-matrix-${role.toLowerCase()}-edit`} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox checked={matrix.delete[role as keyof typeof matrix.delete]} data-testid={`checkbox-matrix-${role.toLowerCase()}-delete`} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox checked={matrix.export[role as keyof typeof matrix.export]} data-testid={`checkbox-matrix-${role.toLowerCase()}-export`} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox checked={matrix.share[role as keyof typeof matrix.share]} data-testid={`checkbox-matrix-${role.toLowerCase()}-share`} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Data Category Assignments</CardTitle>
            </div>
            <CardDescription>Classification assignments by data category</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[360px] overflow-y-auto">
            <Accordion type="multiple" className="w-full space-y-2">
              {dataCategories.map((cat, i) => (
                <AccordionItem key={i} value={`cat-${i}`} data-testid={`accordion-category-${i}`}>
                  <AccordionTrigger className="text-sm font-medium hover:no-underline" data-testid={`accordion-trigger-${i}`}>
                    {cat.category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {cat.subCategories.map((sub, j) => (
                        <div key={j} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                          <span className="text-sm">{sub.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{sub.classification}</Badge>
                            <Badge variant="secondary" className="text-xs">{sub.accessLevel}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Data Retention & Lifecycle Policies</CardTitle>
          </div>
          <CardDescription>Retention, archival, and destruction policies by classification level</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Classification</TableHead>
                <TableHead>Retention Period</TableHead>
                <TableHead>Archival Schedule</TableHead>
                <TableHead>Destruction Method</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retentionPolicies.map((policy) => (
                <TableRow key={policy.classification} data-testid={`retention-row-${policy.classification.toLowerCase().replace(/\s+/g, '-')}`}>
                  <TableCell className="font-medium">{policy.classification}</TableCell>
                  <TableCell>{policy.retention}</TableCell>
                  <TableCell>{policy.archival}</TableCell>
                  <TableCell>{policy.destruction}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" data-testid={`button-edit-retention-${policy.classification.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-base">Data Access Alerts & Monitoring</CardTitle>
          </div>
          <CardDescription>Configure automated alerts for sensitive data access patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: "bulk-export", label: "Alert on bulk export attempts", enabled: true, threshold: "100+ records" },
              { id: "after-hours", label: "Alert on after-hours access", enabled: true, threshold: "Outside 6AM-10PM" },
              { id: "cross-classification", label: "Alert on cross-classification access", enabled: false, threshold: "Any" },
              { id: "failed-access", label: "Alert on failed access attempts", enabled: true, threshold: "3+ attempts" },
              { id: "new-user", label: "Alert on new user first access", enabled: true, threshold: "First 30 days" },
              { id: "privilege-escalation", label: "Alert on privilege escalation", enabled: true, threshold: "Any role change" },
            ].map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`alert-config-${alert.id}`}>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.label}</p>
                  <p className="text-xs text-muted-foreground">{alert.threshold}</p>
                </div>
                <Switch checked={alert.enabled} data-testid={`switch-alert-${alert.id}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ByModuleView() {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["risk-management"]));

  const modules = [
    {
      id: "risk-management",
      name: "Risk Management",
      icon: Target,
      description: "Enterprise risk identification, assessment, and mitigation",
      features: [
        { name: "Risk Register", actions: ["View", "Create", "Edit", "Delete", "Approve", "Export"] },
        { name: "Risk Assessments", actions: ["View", "Create", "Edit", "Delete", "Submit", "Approve"] },
        { name: "Heat Maps", actions: ["View", "Configure", "Export", "Share"] },
        { name: "Mitigation Plans", actions: ["View", "Create", "Edit", "Assign", "Track", "Close"] },
        { name: "KRI Monitoring", actions: ["View", "Configure", "Set Thresholds", "Alerts"] },
      ]
    },
    {
      id: "audit-management",
      name: "Audit Management",
      icon: ClipboardList,
      description: "Internal audit planning, execution, and reporting",
      features: [
        { name: "Audit Plans", actions: ["View", "Create", "Edit", "Approve", "Schedule"] },
        { name: "Workpapers", actions: ["View", "Create", "Edit", "Review", "Sign-off"] },
        { name: "Findings", actions: ["View", "Create", "Edit", "Rate", "Assign", "Close"] },
        { name: "Evidence Repository", actions: ["View", "Upload", "Download", "Link", "Archive"] },
        { name: "Audit Reports", actions: ["View", "Generate", "Edit", "Distribute", "Archive"] },
      ]
    },
    {
      id: "compliance",
      name: "Compliance Management",
      icon: Scale,
      description: "Regulatory compliance tracking and certification management",
      features: [
        { name: "Requirements Library", actions: ["View", "Create", "Edit", "Map", "Archive"] },
        { name: "Control Mapping", actions: ["View", "Create", "Edit", "Test", "Certify"] },
        { name: "Gap Analysis", actions: ["View", "Run", "Configure", "Export"] },
        { name: "Certifications", actions: ["View", "Schedule", "Submit", "Track", "Renew"] },
        { name: "Policy Management", actions: ["View", "Create", "Edit", "Publish", "Attest"] },
      ]
    },
    {
      id: "it-security",
      name: "IT Security & Controls",
      icon: Shield,
      description: "IT general controls, security assessments, and vulnerability management",
      features: [
        { name: "ITGC Testing", actions: ["View", "Create", "Execute", "Review", "Report"] },
        { name: "Vulnerability Tracking", actions: ["View", "Import", "Triage", "Assign", "Remediate"] },
        { name: "Security Incidents", actions: ["View", "Create", "Investigate", "Escalate", "Close"] },
        { name: "Access Reviews", actions: ["View", "Schedule", "Execute", "Certify", "Remediate"] },
        { name: "Penetration Tests", actions: ["View", "Schedule", "Review", "Track Findings"] },
      ]
    },
    {
      id: "third-party",
      name: "Third Party Risk",
      icon: Users,
      description: "Vendor risk assessment and ongoing monitoring",
      features: [
        { name: "Vendor Registry", actions: ["View", "Create", "Edit", "Classify", "Archive"] },
        { name: "Due Diligence", actions: ["View", "Initiate", "Review", "Approve", "Document"] },
        { name: "Risk Assessments", actions: ["View", "Create", "Score", "Review", "Reassess"] },
        { name: "Contract Tracking", actions: ["View", "Upload", "Link", "Expire Alerts"] },
        { name: "Monitoring Alerts", actions: ["View", "Configure", "Acknowledge", "Investigate"] },
      ]
    },
  ];

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Module-Level Permissions</h3>
          <p className="text-sm text-muted-foreground">Configure feature-level access controls per module</p>
        </div>
        <Button variant="outline" size="sm" data-testid="button-export-module-matrix">
          <Download className="w-4 h-4 mr-2" />
          Export Full Matrix
        </Button>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="border overflow-hidden" data-testid={`module-card-${module.id}`}>
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover-elevate"
              onClick={() => toggleModule(module.id)}
              data-testid={`module-header-${module.id}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <module.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{module.name}</h4>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{module.features.length} features</Badge>
                {expandedModules.has(module.id) ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
            
            {expandedModules.has(module.id) && (
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px]">Feature</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Executive</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Auditor</TableHead>
                      <TableHead>Analyst</TableHead>
                      <TableHead>Viewer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {module.features.map((feature, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{feature.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Full</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">View+</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Edit</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Audit</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">Limited</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">View</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

type AccessDirection = "one-way" | "bidirectional";
type AccessLevel = "read" | "read-write" | "read-export" | "full";
type RuleStatus = "active" | "pending-approval" | "expired" | "suspended" | "draft";
type DataScope = "all-data" | "findings" | "risks" | "controls" | "evidence" | "assessments" | "incidents" | "vulnerabilities" | "reports" | "workpapers" | "custom";
type ApprovalRequirement = "none" | "workspace-owner" | "org-admin" | "dual-approval";

interface CrossWorkspaceRule {
  id: string;
  name: string;
  sourceWorkspace: string;
  targetWorkspace: string;
  direction: AccessDirection;
  dataScope: DataScope[];
  customScopeDescription: string;
  accessLevel: AccessLevel;
  status: RuleStatus;
  approvalRequirement: ApprovalRequirement;
  approvedBy: string;
  approvalDate: string;
  expiresAt: string;
  allowedRoles: string[];
  conditions: string[];
  rationale: string;
  lastModified: string;
  createdBy: string;
}

const accessLevelLabels: Record<AccessLevel, string> = {
  "read": "Read Only",
  "read-write": "Read & Write",
  "read-export": "Read & Export",
  "full": "Full Access",
};

const accessLevelColors: Record<AccessLevel, string> = {
  "read": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
  "read-write": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400",
  "read-export": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400",
  "full": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",
};

const statusLabels: Record<RuleStatus, string> = {
  "active": "Active",
  "pending-approval": "Pending Approval",
  "expired": "Expired",
  "suspended": "Suspended",
  "draft": "Draft",
};

const statusColors: Record<RuleStatus, string> = {
  "active": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  "pending-approval": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  "expired": "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  "suspended": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  "draft": "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
};

const dataScopeLabels: Record<DataScope, string> = {
  "all-data": "All Data",
  "findings": "Audit Findings",
  "risks": "Risk Records",
  "controls": "Controls & Testing",
  "evidence": "Evidence & Attachments",
  "assessments": "Risk Assessments",
  "incidents": "Security Incidents",
  "vulnerabilities": "Vulnerabilities",
  "reports": "Reports & Dashboards",
  "workpapers": "Workpapers",
  "custom": "Custom Scope",
};

const allDataScopes: DataScope[] = ["all-data", "findings", "risks", "controls", "evidence", "assessments", "incidents", "vulnerabilities", "reports", "workpapers", "custom"];
const allAccessLevels: AccessLevel[] = ["read", "read-write", "read-export", "full"];
const allRoleOptions = ["Org Admin", "Workspace Admin", "Executive", "Manager", "Auditor", "Analyst", "Viewer"];
const allConditionOptions = [
  "Require MFA authentication",
  "Business hours only (6AM–10PM)",
  "VPN connection required",
  "IP whitelist enforced",
  "Data masking for PII fields",
  "No bulk export (max 100 records)",
  "Watermark on exported documents",
  "Read-only during audit freeze periods",
  "Requires active NDA on file",
  "Auto-revoke after 24h inactivity",
];

const defaultCrossWorkspaceRules: CrossWorkspaceRule[] = [
  {
    id: "rule-1",
    name: "Risk Findings Sharing",
    sourceWorkspace: "Enterprise Risk",
    targetWorkspace: "Enterprise Audit",
    direction: "bidirectional",
    dataScope: ["findings", "risks", "assessments"],
    customScopeDescription: "",
    accessLevel: "read-export",
    status: "active",
    approvalRequirement: "workspace-owner",
    approvedBy: "James Smith (Org Admin)",
    approvalDate: "2025-11-15",
    expiresAt: "2026-11-15",
    allowedRoles: ["Executive", "Manager", "Auditor"],
    conditions: ["Require MFA authentication", "Data masking for PII fields"],
    rationale: "Audit needs visibility into risk assessment findings to plan audit engagements and verify control effectiveness. Risk team needs access to audit findings to update risk registers.",
    lastModified: "2026-01-10",
    createdBy: "James Smith",
  },
  {
    id: "rule-2",
    name: "Vulnerability Intelligence Feed",
    sourceWorkspace: "IT Security",
    targetWorkspace: "Enterprise Risk",
    direction: "one-way",
    dataScope: ["vulnerabilities", "incidents"],
    customScopeDescription: "",
    accessLevel: "read",
    status: "active",
    approvalRequirement: "org-admin",
    approvedBy: "James Smith (Org Admin)",
    approvalDate: "2025-09-01",
    expiresAt: "2026-09-01",
    allowedRoles: ["Manager", "Analyst"],
    conditions: ["Require MFA authentication", "No bulk export (max 100 records)", "VPN connection required"],
    rationale: "Risk management requires real-time vulnerability intelligence to accurately assess technology risk exposure and update KRIs. One-way flow prevents risk team from modifying security data.",
    lastModified: "2026-02-05",
    createdBy: "Mary Smith",
  },
  {
    id: "rule-3",
    name: "Audit Evidence Collection",
    sourceWorkspace: "Enterprise Audit",
    targetWorkspace: "IT Security",
    direction: "bidirectional",
    dataScope: ["evidence", "controls", "workpapers"],
    customScopeDescription: "",
    accessLevel: "read-write",
    status: "active",
    approvalRequirement: "dual-approval",
    approvedBy: "James Smith & Mary Smith",
    approvalDate: "2025-12-01",
    expiresAt: "2026-06-30",
    allowedRoles: ["Auditor", "Manager"],
    conditions: ["Require MFA authentication", "Watermark on exported documents", "Read-only during audit freeze periods"],
    rationale: "IT Security must provide evidence for ITGC testing. Auditors need write access to link evidence to workpapers. Bidirectional flow enables the security team to fulfill audit requests directly.",
    lastModified: "2026-02-18",
    createdBy: "James Smith",
  },
  {
    id: "rule-4",
    name: "Security Metrics Dashboard",
    sourceWorkspace: "Enterprise Risk",
    targetWorkspace: "IT Security",
    direction: "one-way",
    dataScope: ["reports"],
    customScopeDescription: "",
    accessLevel: "read",
    status: "pending-approval",
    approvalRequirement: "workspace-owner",
    approvedBy: "",
    approvalDate: "",
    expiresAt: "2026-12-31",
    allowedRoles: ["Executive", "Manager"],
    conditions: ["Business hours only (6AM–10PM)"],
    rationale: "CISO team requests read-only access to enterprise risk dashboards and reports to align security strategy with organizational risk appetite.",
    lastModified: "2026-02-20",
    createdBy: "Emily Chen",
  },
  {
    id: "rule-5",
    name: "Cross-Audit Control Testing",
    sourceWorkspace: "Enterprise Audit",
    targetWorkspace: "Enterprise Risk",
    direction: "one-way",
    dataScope: ["controls"],
    customScopeDescription: "",
    accessLevel: "read",
    status: "active",
    approvalRequirement: "workspace-owner",
    approvedBy: "David Wilson (Workspace Admin)",
    approvalDate: "2026-01-05",
    expiresAt: "2026-07-05",
    allowedRoles: ["Auditor", "Analyst"],
    conditions: ["Require MFA authentication", "Auto-revoke after 24h inactivity"],
    rationale: "Risk team needs read access to audit control testing results to validate control effectiveness ratings in the risk register and recalibrate residual risk scores.",
    lastModified: "2026-01-05",
    createdBy: "David Wilson",
  },
  {
    id: "rule-6",
    name: "Incident Response Coordination",
    sourceWorkspace: "IT Security",
    targetWorkspace: "Enterprise Audit",
    direction: "one-way",
    dataScope: ["incidents"],
    customScopeDescription: "",
    accessLevel: "read",
    status: "suspended",
    approvalRequirement: "org-admin",
    approvedBy: "James Smith (Org Admin)",
    approvalDate: "2025-08-15",
    expiresAt: "2026-08-15",
    allowedRoles: ["Auditor"],
    conditions: ["Require MFA authentication", "IP whitelist enforced", "Data masking for PII fields"],
    rationale: "Audit team had temporary read access to security incidents for annual IT audit. Suspended after audit completion; will reactivate for next audit cycle.",
    lastModified: "2026-02-01",
    createdBy: "Mary Smith",
  },
  {
    id: "rule-7",
    name: "Vendor Risk Intelligence Sync",
    sourceWorkspace: "Enterprise Risk",
    targetWorkspace: "IT Security",
    direction: "bidirectional",
    dataScope: ["assessments", "risks"],
    customScopeDescription: "",
    accessLevel: "read-write",
    status: "expired",
    approvalRequirement: "dual-approval",
    approvedBy: "James Smith & Mary Smith",
    approvalDate: "2025-06-01",
    expiresAt: "2025-12-01",
    allowedRoles: ["Manager", "Analyst"],
    conditions: ["Require MFA authentication", "Requires active NDA on file"],
    rationale: "Third-party vendor risk assessments require input from both security and risk teams. Expired — pending renewal with updated scope.",
    lastModified: "2025-12-01",
    createdBy: "James Smith",
  },
];

const emptyRule: Omit<CrossWorkspaceRule, "id"> = {
  name: "",
  sourceWorkspace: "Enterprise Risk",
  targetWorkspace: "Enterprise Audit",
  direction: "one-way",
  dataScope: [],
  customScopeDescription: "",
  accessLevel: "read",
  status: "draft",
  approvalRequirement: "workspace-owner",
  approvedBy: "",
  approvalDate: "",
  expiresAt: "",
  allowedRoles: [],
  conditions: [],
  rationale: "",
  lastModified: new Date().toISOString().split("T")[0],
  createdBy: "James Smith",
};

function ByWorkspaceView() {
  const { customWorkspaces } = useWorkspaceStore();
  const [rules, setRules] = useState<CrossWorkspaceRule[]>(defaultCrossWorkspaceRules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CrossWorkspaceRule | null>(null);
  const [formData, setFormData] = useState<Omit<CrossWorkspaceRule, "id">>(emptyRule);
  const [statusFilter, setStatusFilter] = useState<RuleStatus | "all">("all");
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const defaultWorkspaces = [
    {
      id: "enterprise-risk",
      name: "Enterprise Risk",
      persona: "CRO",
      userCount: 28,
      color: "bg-teal-500",
      modules: ["Risk Management", "Third Party Risk", "Compliance"],
      delegations: [
        { from: "CRO", to: "Risk Manager", scope: "Risk Assessments", expires: "2026-03-15" },
        { from: "Risk Manager", to: "Risk Analyst", scope: "KRI Monitoring", expires: "2026-02-28" },
      ]
    },
    {
      id: "enterprise-audit",
      name: "Enterprise Audit",
      persona: "CAE",
      userCount: 22,
      color: "bg-purple-500",
      modules: ["Audit Management", "Compliance"],
      delegations: [
        { from: "CAE", to: "Audit Manager", scope: "Audit Planning", expires: "2026-04-01" },
        { from: "Audit Manager", to: "Staff Auditor", scope: "Workpapers", expires: "2026-03-01" },
      ]
    },
    {
      id: "it-security",
      name: "IT Security",
      persona: "CISO",
      userCount: 18,
      color: "bg-blue-500",
      modules: ["IT Security & Controls", "Third Party Risk"],
      delegations: [
        { from: "CISO", to: "Security Manager", scope: "Incident Response", expires: "2026-06-30" },
        { from: "Security Manager", to: "Security Analyst", scope: "Vulnerability Triage", expires: "2026-02-15" },
      ]
    },
  ];

  const workspaces = useMemo(() => {
    const customWsCards = customWorkspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      persona: "Custom",
      userCount: 1,
      color: "bg-emerald-500",
      modules: ws.moduleConfig?.selectedBuckets.map(b => b.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) || [],
      delegations: [] as { from: string; to: string; scope: string; expires: string }[],
    }));
    return [...defaultWorkspaces, ...customWsCards];
  }, [customWorkspaces]);

  const workspaceNames = useMemo(() => workspaces.map(ws => ws.name), [workspaces]);

  const filteredRules = useMemo(() => {
    if (statusFilter === "all") return rules;
    return rules.filter(r => r.status === statusFilter);
  }, [rules, statusFilter]);

  const ruleStats = useMemo(() => ({
    total: rules.length,
    active: rules.filter(r => r.status === "active").length,
    pending: rules.filter(r => r.status === "pending-approval").length,
    expired: rules.filter(r => r.status === "expired").length,
    suspended: rules.filter(r => r.status === "suspended").length,
  }), [rules]);

  const openAddDialog = useCallback(() => {
    setEditingRule(null);
    setFormData({ ...emptyRule });
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((rule: CrossWorkspaceRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      sourceWorkspace: rule.sourceWorkspace,
      targetWorkspace: rule.targetWorkspace,
      direction: rule.direction,
      dataScope: [...rule.dataScope],
      customScopeDescription: rule.customScopeDescription,
      accessLevel: rule.accessLevel,
      status: rule.status,
      approvalRequirement: rule.approvalRequirement,
      approvedBy: rule.approvedBy,
      approvalDate: rule.approvalDate,
      expiresAt: rule.expiresAt,
      allowedRoles: [...rule.allowedRoles],
      conditions: [...rule.conditions],
      rationale: rule.rationale,
      lastModified: rule.lastModified,
      createdBy: rule.createdBy,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule.id ? { ...formData, id: editingRule.id, lastModified: new Date().toISOString().split("T")[0] } : r));
    } else {
      const newRule: CrossWorkspaceRule = {
        ...formData,
        id: `rule-${Date.now()}`,
        lastModified: new Date().toISOString().split("T")[0],
      };
      setRules(prev => [...prev, newRule]);
    }
    setDialogOpen(false);
    setEditingRule(null);
  }, [editingRule, formData]);

  const handleDelete = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    setDeleteConfirmId(null);
  }, []);

  const handleDuplicate = useCallback((rule: CrossWorkspaceRule) => {
    const duplicate: CrossWorkspaceRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      name: `${rule.name} (Copy)`,
      status: "draft",
      approvedBy: "",
      approvalDate: "",
      lastModified: new Date().toISOString().split("T")[0],
    };
    setRules(prev => [...prev, duplicate]);
  }, []);

  const handleToggleStatus = useCallback((ruleId: string) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const newStatus: RuleStatus = r.status === "active" ? "suspended" : r.status === "suspended" ? "active" : r.status;
      return { ...r, status: newStatus, lastModified: new Date().toISOString().split("T")[0] };
    }));
  }, []);

  const toggleDataScope = (scope: DataScope) => {
    setFormData(prev => ({
      ...prev,
      dataScope: prev.dataScope.includes(scope)
        ? prev.dataScope.filter(s => s !== scope)
        : [...prev.dataScope, scope],
    }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(role)
        ? prev.allowedRoles.filter(r => r !== role)
        : [...prev.allowedRoles, role],
    }));
  };

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workspace Access & Delegation</h3>
          <p className="text-sm text-muted-foreground">Manage cross-workspace permissions and delegation chains</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-bulk-assign">
            <Users className="w-4 h-4 mr-2" />
            Bulk Assign
          </Button>
          <Button size="sm" data-testid="button-create-delegation">
            <Key className="w-4 h-4 mr-2" />
            Create Delegation
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <Card key={ws.id} className="border" data-testid={`workspace-perm-card-${ws.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-12 rounded-full ${ws.color}`} />
                <div className="flex-1">
                  <CardTitle className="text-base">{ws.name}</CardTitle>
                  <CardDescription>{ws.persona} Workspace</CardDescription>
                </div>
                <Badge variant="secondary">{ws.userCount} users</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Active Modules</h5>
                <div className="flex flex-wrap gap-1">
                  {ws.modules.map((mod) => (
                    <Badge key={mod} variant="outline" className="text-xs">{mod}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Active Delegations</h5>
                <div className="space-y-2">
                  {ws.delegations.length > 0 ? ws.delegations.map((del, i) => (
                    <div key={i} className="p-2 bg-muted/50 rounded text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium">{del.from}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="font-medium">{del.to}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>{del.scope}</span>
                        <span>Exp: {del.expires}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-muted-foreground">No active delegations</p>
                  )}
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" data-testid={`button-manage-workspace-${ws.id}`}>
                <UserCog className="w-4 h-4 mr-2" />
                Manage Workspace
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Cross-Workspace Access Rules</CardTitle>
              </div>
              <CardDescription className="mt-1">Define data sharing policies, access levels, and approval workflows between workspaces</CardDescription>
            </div>
            <Button size="sm" onClick={openAddDialog} data-testid="button-add-access-rule">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status:</span>
            </div>
            {([["all", `All (${ruleStats.total})`], ["active", `Active (${ruleStats.active})`], ["pending-approval", `Pending (${ruleStats.pending})`], ["expired", `Expired (${ruleStats.expired})`], ["suspended", `Suspended (${ruleStats.suspended})`]] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value as RuleStatus | "all")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  statusFilter === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover-elevate"
                }`}
                data-testid={`filter-rule-status-${value}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredRules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No rules match the selected filter</p>
              </div>
            )}
            {filteredRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg overflow-hidden" data-testid={`access-rule-${rule.id}`}>
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover-elevate transition-colors"
                  onClick={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
                  data-testid={`access-rule-header-${rule.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{rule.name}</span>
                      <Badge className={`text-xs border-0 ${statusColors[rule.status]}`}>{statusLabels[rule.status]}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{rule.sourceWorkspace}</span>
                      {rule.direction === "bidirectional" ? (
                        <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span className="font-medium text-foreground">{rule.targetWorkspace}</span>
                      <span className="mx-1">·</span>
                      <Badge variant="outline" className={`text-xs ${accessLevelColors[rule.accessLevel]}`}>
                        {accessLevelLabels[rule.accessLevel]}
                      </Badge>
                      <span className="mx-1">·</span>
                      <span>{rule.dataScope.map(s => dataScopeLabels[s]).join(", ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEditDialog(rule); }} data-testid={`button-edit-rule-${rule.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDuplicate(rule); }} data-testid={`button-duplicate-rule-${rule.id}`}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    {(rule.status === "active" || rule.status === "suspended") && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleToggleStatus(rule.id); }} data-testid={`button-toggle-rule-${rule.id}`}>
                        <ToggleLeft className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(rule.id); }} data-testid={`button-delete-rule-${rule.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedRuleId === rule.id ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expandedRuleId === rule.id && (
                  <div className="border-t bg-muted/20 p-4">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div>
                          <h6 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Data Scope</h6>
                          <div className="flex flex-wrap gap-1">
                            {rule.dataScope.map(scope => (
                              <Badge key={scope} variant="outline" className="text-xs">{dataScopeLabels[scope]}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Allowed Roles</h6>
                          <div className="flex flex-wrap gap-1">
                            {rule.allowedRoles.map(role => (
                              <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h6 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Conditions</h6>
                          <div className="space-y-1">
                            {rule.conditions.map((cond, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs">
                                <ShieldCheck className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                <span>{cond}</span>
                              </div>
                            ))}
                            {rule.conditions.length === 0 && <span className="text-xs text-muted-foreground">No conditions applied</span>}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Approval</h6>
                          <p className="text-xs">{rule.approvalRequirement === "none" ? "No approval required" : rule.approvalRequirement === "dual-approval" ? "Dual approval required" : `${rule.approvalRequirement.replace("-", " ")} approval`}</p>
                          {rule.approvedBy && <p className="text-xs text-muted-foreground">Approved by: {rule.approvedBy}</p>}
                          {rule.approvalDate && <p className="text-xs text-muted-foreground">Date: {rule.approvalDate}</p>}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h6 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Rationale</h6>
                          <p className="text-xs text-muted-foreground leading-relaxed">{rule.rationale || "No rationale provided"}</p>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Expires: {rule.expiresAt || "No expiry"}</div>
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Modified: {rule.lastModified}</div>
                          <div className="flex items-center gap-1"><Users className="w-3 h-3" /> Created by: {rule.createdBy}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {deleteConfirmId === rule.id && (
                  <div className="border-t bg-red-50 dark:bg-red-950/30 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-700 dark:text-red-400">Delete this access rule permanently?</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)} data-testid={`button-cancel-delete-${rule.id}`}>Cancel</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(rule.id)} data-testid={`button-confirm-delete-${rule.id}`}>Delete</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Workspace Governance Policies</CardTitle>
          </div>
          <CardDescription>Automated enforcement rules for workspace access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { id: "manager-approval", label: "Require manager approval for cross-workspace access", enabled: true },
              { id: "delegation-expire", label: "Auto-expire delegations after 90 days", enabled: true },
              { id: "notify-owner", label: "Notify workspace owner on new user assignment", enabled: true },
              { id: "mfa-restricted", label: "Require MFA for restricted workspace access", enabled: false },
              { id: "lock-inactive", label: "Lock inactive users from workspace after 30 days", enabled: true },
              { id: "audit-transfers", label: "Audit all cross-workspace data transfers", enabled: true },
            ].map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`governance-policy-${policy.id}`}>
                <span className="text-sm">{policy.label}</span>
                <Switch checked={policy.enabled} data-testid={`switch-governance-${policy.id}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Access Rule" : "Create Access Rule"}</DialogTitle>
            <DialogDescription>
              {editingRule ? "Modify the cross-workspace data access rule" : "Define a new data sharing policy between workspaces"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <Label className="text-sm font-medium">Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Risk Findings Sharing"
                className="mt-1.5"
                data-testid="input-rule-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Source Workspace</Label>
                <Select value={formData.sourceWorkspace} onValueChange={(v) => setFormData(prev => ({ ...prev, sourceWorkspace: v }))}>
                  <SelectTrigger className="mt-1.5" data-testid="select-source-workspace">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaceNames.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Target Workspace</Label>
                <Select value={formData.targetWorkspace} onValueChange={(v) => setFormData(prev => ({ ...prev, targetWorkspace: v }))}>
                  <SelectTrigger className="mt-1.5" data-testid="select-target-workspace">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaceNames.filter(n => n !== formData.sourceWorkspace).map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Direction</Label>
                <Select value={formData.direction} onValueChange={(v) => setFormData(prev => ({ ...prev, direction: v as AccessDirection }))}>
                  <SelectTrigger className="mt-1.5" data-testid="select-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-way">One-Way (Source → Target)</SelectItem>
                    <SelectItem value="bidirectional">Bidirectional (Both Ways)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Access Level</Label>
                <Select value={formData.accessLevel} onValueChange={(v) => setFormData(prev => ({ ...prev, accessLevel: v as AccessLevel }))}>
                  <SelectTrigger className="mt-1.5" data-testid="select-access-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allAccessLevels.map(level => (
                      <SelectItem key={level} value={level}>{accessLevelLabels[level]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Data Scope</Label>
              <p className="text-xs text-muted-foreground mb-2">Select which data types this rule grants access to</p>
              <div className="grid grid-cols-3 gap-2">
                {allDataScopes.map(scope => (
                  <div
                    key={scope}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      formData.dataScope.includes(scope) ? "bg-primary/10 border-primary" : "hover-elevate"
                    }`}
                    onClick={() => toggleDataScope(scope)}
                    data-testid={`scope-toggle-${scope}`}
                  >
                    <Checkbox checked={formData.dataScope.includes(scope)} />
                    <span className="text-xs">{dataScopeLabels[scope]}</span>
                  </div>
                ))}
              </div>
              {formData.dataScope.includes("custom") && (
                <Textarea
                  value={formData.customScopeDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, customScopeDescription: e.target.value }))}
                  placeholder="Describe the custom data scope..."
                  className="mt-2"
                  rows={2}
                  data-testid="input-custom-scope"
                />
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Allowed Roles</Label>
              <p className="text-xs text-muted-foreground mb-2">Only users in these roles can access shared data</p>
              <div className="flex flex-wrap gap-2">
                {allRoleOptions.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      formData.allowedRoles.includes(role)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover-elevate"
                    }`}
                    data-testid={`role-toggle-${role.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Access Conditions</Label>
              <p className="text-xs text-muted-foreground mb-2">Security and compliance guardrails for this rule</p>
              <div className="grid grid-cols-2 gap-2">
                {allConditionOptions.map(condition => (
                  <div
                    key={condition}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      formData.conditions.includes(condition) ? "bg-primary/10 border-primary" : "hover-elevate"
                    }`}
                    onClick={() => toggleCondition(condition)}
                    data-testid={`condition-toggle-${condition.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`}
                  >
                    <Checkbox checked={formData.conditions.includes(condition)} />
                    <span className="text-xs">{condition}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Approval Requirement</Label>
                <Select value={formData.approvalRequirement} onValueChange={(v) => setFormData(prev => ({ ...prev, approvalRequirement: v as ApprovalRequirement }))}>
                  <SelectTrigger className="mt-1.5" data-testid="select-approval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Approval Required</SelectItem>
                    <SelectItem value="workspace-owner">Workspace Owner Approval</SelectItem>
                    <SelectItem value="org-admin">Org Admin Approval</SelectItem>
                    <SelectItem value="dual-approval">Dual Approval (Two Approvers)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Expiration Date</Label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="mt-1.5"
                  data-testid="input-expires-at"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Business Rationale</Label>
              <Textarea
                value={formData.rationale}
                onChange={(e) => setFormData(prev => ({ ...prev, rationale: e.target.value }))}
                placeholder="Explain the business justification for this cross-workspace data sharing rule..."
                className="mt-1.5"
                rows={3}
                data-testid="input-rationale"
              />
            </div>

            {editingRule && (
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as RuleStatus }))}>
                  <SelectTrigger className="mt-1.5" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending-approval">Pending Approval</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-rule">Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.sourceWorkspace || !formData.targetWorkspace || formData.dataScope.length === 0}
              data-testid="button-save-rule"
            >
              {editingRule ? "Save Changes" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminPermissionsPage() {
  const [activePivot, setActivePivot] = useState<PivotView>("user");

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="p-6 pb-0">
          <PageHeader 
            title="Permissions Management" 
            description="Granular role-based access control across users, roles, data classifications, modules, and workspaces"
            actions={
              <Button variant="outline" data-testid="button-edit-mode">
                <Edit className="w-4 h-4 mr-2" />
                Edit Mode
              </Button>
            }
          />
        </div>

        <div className="px-6 pt-6">
          <div className="flex flex-wrap border rounded-lg bg-muted/30 p-2 gap-1">
            {pivotTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePivot(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activePivot === tab.id 
                    ? "bg-white dark:bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover-elevate"
                }`}
                data-testid={`pivot-tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {activePivot === "user" && <ByUserView />}
        {activePivot === "role" && <ByRoleView />}
        {activePivot === "data-classification" && <ByDataClassificationView />}
        {/* ByModuleView hidden from navigation — code retained for future reintroduction */}
        {activePivot === "module" && <ByModuleView />}
        {activePivot === "workspace" && <ByWorkspaceView />}
      </div>
    </AppLayout>
  );
}

export default AdminPermissionsPage;
