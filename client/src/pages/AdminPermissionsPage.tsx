import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  MoreVertical
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
} from "@/components/ui/dropdown-menu";

type PivotView = "framework" | "data-classification" | "workspace-domain" | "system-functions" | "compliance" | "user";

interface PivotTab {
  id: PivotView;
  label: string;
  icon: React.ElementType;
}

const pivotTabs: PivotTab[] = [
  { id: "framework", label: "By Framework & Standards", icon: Layers },
  { id: "data-classification", label: "By Data Classification", icon: Shield },
  { id: "workspace-domain", label: "By Workspace Domain", icon: Building2 },
  { id: "system-functions", label: "By System Functions", icon: Settings },
  { id: "compliance", label: "By Compliance Activities", icon: FileText },
  { id: "user", label: "By User", icon: Users },
];

const roleFilters = ["Admin", "Executive", "Manager", "Auditor", "Analyst", "Viewer"];
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
  { id: "1", name: "James Smith", email: "james.smith@company.com", initials: "JS", role: "Admin", workspaces: ["IT Security", "Enterprise Risk", "Enterprise Audit", "Admin"], lastLogin: "Yesterday", status: "active" },
  { id: "2", name: "Mary Smith", email: "mary.smith@company.com", initials: "MS", role: "Admin", workspaces: ["IT Security", "Enterprise Risk", "Enterprise Audit", "Admin"], lastLogin: "4 days ago", status: "active" },
  { id: "3", name: "John Smith", email: "john.smith@company.com", initials: "JS", role: "Executive", workspaces: ["Enterprise Risk", "Enterprise Audit"], lastLogin: "2 days ago", status: "active" },
  { id: "4", name: "Emily Chen", email: "emily.chen@company.com", initials: "EC", role: "Manager", workspaces: ["IT Security", "Enterprise Risk"], lastLogin: "1 week ago", status: "active" },
  { id: "5", name: "Robert Johnson", email: "robert.johnson@company.com", initials: "RJ", role: "Auditor", workspaces: ["Enterprise Audit"], lastLogin: "3 days ago", status: "active" },
  { id: "6", name: "Sarah Williams", email: "sarah.williams@company.com", initials: "SW", role: "Analyst", workspaces: ["IT Security", "Enterprise Risk"], lastLogin: "Yesterday", status: "active" },
  { id: "7", name: "Michael Brown", email: "michael.brown@company.com", initials: "MB", role: "Viewer", workspaces: ["Enterprise Risk"], lastLogin: "2 weeks ago", status: "inactive" },
  { id: "8", name: "Lisa Davis", email: "lisa.davis@company.com", initials: "LD", role: "Auditor", workspaces: ["Enterprise Audit", "IT Security"], lastLogin: "5 days ago", status: "active" },
  { id: "9", name: "David Wilson", email: "david.wilson@company.com", initials: "DW", role: "Manager", workspaces: ["Enterprise Risk", "Admin"], lastLogin: "Today", status: "active" },
  { id: "10", name: "Jennifer Taylor", email: "jennifer.taylor@company.com", initials: "JT", role: "Analyst", workspaces: ["IT Security"], lastLogin: "3 weeks ago", status: "inactive" },
];

const summaryMetrics = [
  { label: "Total Users", value: "90", icon: Users, color: "text-primary" },
  { label: "Active Users", value: "45", icon: UserCheck, color: "text-green-600" },
  { label: "Inactive (14+ days)", value: "45", icon: UserX, color: "text-amber-600" },
  { label: "Active Roles", value: "6", icon: Shield, color: "text-purple-600" },
];

function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    Admin: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
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

export function AdminPermissionsPage() {
  const [activePivot, setActivePivot] = useState<PivotView>("user");
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
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="p-6 pb-0">
          <PageHeader 
            title="Permissions Management" 
            description="Granular role-based access control across frameworks, workspaces, and compliance activities"
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

        {activePivot === "user" && (
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
        )}

        {activePivot !== "user" && (
          <div className="flex-1 p-6 flex items-center justify-center">
            <Card className="max-w-md w-full" data-testid={`placeholder-${activePivot}`}>
              <CardContent className="p-8 text-center">
                {(() => {
                  const tab = pivotTabs.find(t => t.id === activePivot);
                  const Icon = tab?.icon || Shield;
                  return (
                    <>
                      <Icon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{tab?.label}</h3>
                      <p className="text-muted-foreground">
                        View and manage permissions organized by {tab?.label.toLowerCase().replace("by ", "")}
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default AdminPermissionsPage;
