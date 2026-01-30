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
import { useState, useMemo } from "react";
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
  { id: "module", label: "By Module", icon: Layers },
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
            <Accordion type="multiple" className="space-y-2">
              {dataCategories.map((cat, i) => (
                <AccordionItem key={i} value={`cat-${i}`} className="border rounded-lg px-4" data-testid={`accordion-category-${i}`}>
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

function ByWorkspaceView() {
  const { customWorkspaces } = useWorkspaceStore();
  
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
  
  // Combine default workspaces with custom ones
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

  const crossWorkspaceRules = [
    { source: "Enterprise Risk", target: "Enterprise Audit", permission: "Read Findings", status: "active" },
    { source: "IT Security", target: "Enterprise Risk", permission: "Share Vulnerabilities", status: "active" },
    { source: "Enterprise Audit", target: "IT Security", permission: "Request Evidence", status: "active" },
    { source: "Enterprise Risk", target: "IT Security", permission: "View Security Metrics", status: "pending" },
  ];

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
                  {ws.delegations.map((del, i) => (
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
                  ))}
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
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Cross-Workspace Access Rules</CardTitle>
          </div>
          <CardDescription>Data sharing permissions between workspaces</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Workspace</TableHead>
                <TableHead className="text-center">Direction</TableHead>
                <TableHead>Target Workspace</TableHead>
                <TableHead>Permission Granted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crossWorkspaceRules.map((rule, i) => (
                <TableRow key={i} data-testid={`cross-workspace-rule-${i}`}>
                  <TableCell className="font-medium">{rule.source}</TableCell>
                  <TableCell className="text-center">
                    <ChevronRight className="w-4 h-4 mx-auto text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{rule.target}</TableCell>
                  <TableCell>{rule.permission}</TableCell>
                  <TableCell>
                    <Badge variant={rule.status === "active" ? "default" : "secondary"} data-testid={`cross-workspace-status-${i}`}>
                      {rule.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" data-testid={`button-edit-rule-${i}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`button-delete-rule-${i}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
        {activePivot === "module" && <ByModuleView />}
        {activePivot === "workspace" && <ByWorkspaceView />}
      </div>
    </AppLayout>
  );
}

export default AdminPermissionsPage;
