import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Server, 
  Link2,
  Cloud,
  HardDrive,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  GitBranch,
  Box,
  Boxes,
  Network,
  Plug,
  Zap,
  Lock,
  Unlock,
  Shield,
  Activity,
  BarChart3,
  Table2,
  FileJson,
  FileSpreadsheet,
  ArrowLeftRight,
  ExternalLink,
  Copy,
  FolderTree,
  Workflow,
  Building2
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type MainView = "tenancy" | "modeling" | "connectivity" | "sync";

interface DataTenant {
  id: string;
  name: string;
  type: "production" | "staging" | "development" | "sandbox";
  region: string;
  workspaces: string[];
  dataSize: string;
  recordCount: number;
  lastSync: string;
  status: "healthy" | "warning" | "error" | "syncing";
  isolation: "full" | "shared" | "hybrid";
}

interface DataModel {
  id: string;
  name: string;
  type: "core" | "extension" | "custom" | "integration";
  entities: number;
  relationships: number;
  version: string;
  lastModified: string;
  status: "active" | "draft" | "deprecated";
  owner: string;
}

interface DataConnection {
  id: string;
  name: string;
  type: "api" | "database" | "file" | "streaming" | "webhook";
  provider: string;
  direction: "inbound" | "outbound" | "bidirectional";
  frequency: string;
  lastRun: string;
  status: "connected" | "disconnected" | "error" | "pending";
  workspaces: string[];
}

interface SyncJob {
  id: string;
  name: string;
  source: string;
  destination: string;
  type: "full" | "incremental" | "delta";
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: "running" | "completed" | "failed" | "scheduled" | "paused";
  recordsProcessed: number;
  duration: string;
}

const dataTenants: DataTenant[] = [
  { id: "1", name: "Production Global", type: "production", region: "US-East", workspaces: ["Enterprise Risk", "Enterprise Audit", "IT Security"], dataSize: "2.4 TB", recordCount: 15420000, lastSync: "2 min ago", status: "healthy", isolation: "full" },
  { id: "2", name: "Production EU", type: "production", region: "EU-West", workspaces: ["Enterprise Risk", "Enterprise Audit"], dataSize: "1.8 TB", recordCount: 12300000, lastSync: "5 min ago", status: "healthy", isolation: "full" },
  { id: "3", name: "Staging Environment", type: "staging", region: "US-West", workspaces: ["All Workspaces"], dataSize: "890 GB", recordCount: 8500000, lastSync: "1 hour ago", status: "syncing", isolation: "shared" },
  { id: "4", name: "Development Sandbox", type: "development", region: "US-East", workspaces: ["Dev Team"], dataSize: "125 GB", recordCount: 1200000, lastSync: "3 hours ago", status: "healthy", isolation: "hybrid" },
  { id: "5", name: "Training Instance", type: "sandbox", region: "US-Central", workspaces: ["Training"], dataSize: "45 GB", recordCount: 450000, lastSync: "1 day ago", status: "warning", isolation: "full" },
];

const dataModels: DataModel[] = [
  { id: "1", name: "Risk Assessment Framework", type: "core", entities: 24, relationships: 67, version: "3.2.1", lastModified: "2 days ago", status: "active", owner: "Platform Team" },
  { id: "2", name: "Audit Workflow Model", type: "core", entities: 18, relationships: 42, version: "2.8.0", lastModified: "1 week ago", status: "active", owner: "Audit Team" },
  { id: "3", name: "Compliance Controls Schema", type: "core", entities: 31, relationships: 89, version: "4.1.0", lastModified: "3 days ago", status: "active", owner: "Compliance Team" },
  { id: "4", name: "Custom KRI Extensions", type: "extension", entities: 8, relationships: 15, version: "1.2.0", lastModified: "5 days ago", status: "active", owner: "Risk Analytics" },
  { id: "5", name: "Third Party Integration", type: "integration", entities: 12, relationships: 28, version: "2.0.0", lastModified: "1 day ago", status: "active", owner: "Integration Team" },
  { id: "6", name: "ESG Reporting Model", type: "custom", entities: 15, relationships: 34, version: "1.0.0-beta", lastModified: "4 hours ago", status: "draft", owner: "ESG Team" },
  { id: "7", name: "Legacy Controls v2", type: "core", entities: 20, relationships: 45, version: "2.5.0", lastModified: "6 months ago", status: "deprecated", owner: "Platform Team" },
];

const dataConnections: DataConnection[] = [
  { id: "1", name: "ServiceNow CMDB", type: "api", provider: "ServiceNow", direction: "bidirectional", frequency: "Real-time", lastRun: "Just now", status: "connected", workspaces: ["IT Security", "Enterprise Audit"] },
  { id: "2", name: "Workday HR Feed", type: "api", provider: "Workday", direction: "inbound", frequency: "Daily", lastRun: "6 hours ago", status: "connected", workspaces: ["All Workspaces"] },
  { id: "3", name: "SAP GRC Integration", type: "database", provider: "SAP", direction: "bidirectional", frequency: "Hourly", lastRun: "45 min ago", status: "connected", workspaces: ["Enterprise Risk"] },
  { id: "4", name: "Qualys Vulnerability Scanner", type: "api", provider: "Qualys", direction: "inbound", frequency: "Every 4 hours", lastRun: "2 hours ago", status: "connected", workspaces: ["IT Security"] },
  { id: "5", name: "Jira Project Sync", type: "webhook", provider: "Atlassian", direction: "bidirectional", frequency: "Real-time", lastRun: "3 min ago", status: "connected", workspaces: ["Enterprise Audit"] },
  { id: "6", name: "Snowflake Data Warehouse", type: "database", provider: "Snowflake", direction: "outbound", frequency: "Nightly", lastRun: "8 hours ago", status: "connected", workspaces: ["All Workspaces"] },
  { id: "7", name: "Azure AD Identity", type: "api", provider: "Microsoft", direction: "inbound", frequency: "Every 15 min", lastRun: "12 min ago", status: "error", workspaces: ["All Workspaces"] },
  { id: "8", name: "Custom Data Lake", type: "file", provider: "AWS S3", direction: "outbound", frequency: "Weekly", lastRun: "3 days ago", status: "pending", workspaces: ["Enterprise Risk"] },
];

const syncJobs: SyncJob[] = [
  { id: "1", name: "Full Risk Data Sync", source: "Production Global", destination: "Staging Environment", type: "full", schedule: "Weekly", lastRun: "3 days ago", nextRun: "In 4 days", status: "completed", recordsProcessed: 15420000, duration: "2h 34m" },
  { id: "2", name: "Incremental Control Updates", source: "Production Global", destination: "Production EU", type: "incremental", schedule: "Hourly", lastRun: "45 min ago", nextRun: "In 15 min", status: "completed", recordsProcessed: 1250, duration: "2m 15s" },
  { id: "3", name: "Development Data Refresh", source: "Staging Environment", destination: "Development Sandbox", type: "delta", schedule: "Daily", lastRun: "Running", nextRun: "-", status: "running", recordsProcessed: 4520000, duration: "1h 12m" },
  { id: "4", name: "Training Data Anonymization", source: "Production Global", destination: "Training Instance", type: "full", schedule: "Monthly", lastRun: "28 days ago", nextRun: "In 2 days", status: "scheduled", recordsProcessed: 450000, duration: "45m" },
  { id: "5", name: "EU Data Replication", source: "Production Global", destination: "Production EU", type: "incremental", schedule: "Every 5 min", lastRun: "3 min ago", nextRun: "In 2 min", status: "completed", recordsProcessed: 89, duration: "15s" },
  { id: "6", name: "Audit Trail Archive", source: "Production Global", destination: "Snowflake Data Warehouse", type: "incremental", schedule: "Nightly", lastRun: "Failed", nextRun: "Tonight", status: "failed", recordsProcessed: 0, duration: "-" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "healthy":
    case "connected":
    case "completed":
    case "active":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" />{status}</Badge>;
    case "warning":
    case "pending":
    case "draft":
    case "scheduled":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"><AlertTriangle className="w-3 h-3 mr-1" />{status}</Badge>;
    case "error":
    case "disconnected":
    case "failed":
    case "deprecated":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"><XCircle className="w-3 h-3 mr-1" />{status}</Badge>;
    case "syncing":
    case "running":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />{status}</Badge>;
    case "paused":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"><Clock className="w-3 h-3 mr-1" />{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "production":
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400">Production</Badge>;
    case "staging":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">Staging</Badge>;
    case "development":
      return <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">Development</Badge>;
    case "sandbox":
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400">Sandbox</Badge>;
    case "core":
      return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400">Core</Badge>;
    case "extension":
      return <Badge className="bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400">Extension</Badge>;
    case "custom":
      return <Badge className="bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400">Custom</Badge>;
    case "integration":
      return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400">Integration</Badge>;
    case "api":
      return <Badge className="bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400">API</Badge>;
    case "database":
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">Database</Badge>;
    case "file":
      return <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400">File</Badge>;
    case "streaming":
      return <Badge className="bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400">Streaming</Badge>;
    case "webhook":
      return <Badge className="bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-900/20 dark:text-lime-400">Webhook</Badge>;
    case "full":
      return <Badge variant="outline">Full Sync</Badge>;
    case "incremental":
      return <Badge variant="outline">Incremental</Badge>;
    case "delta":
      return <Badge variant="outline">Delta</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

function TenancyView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Server className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Data Tenants</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">5.3 TB</div>
                <div className="text-sm text-muted-foreground">Total Storage</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">37.9M</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">80%</div>
                <div className="text-sm text-muted-foreground">Healthy Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Data Tenants</CardTitle>
            <CardDescription>Manage data isolation and multi-tenancy across environments</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search tenants..." 
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-tenants"
              />
            </div>
            <Button size="sm" data-testid="button-add-tenant">
              <Plus className="w-4 h-4 mr-1" />
              Add Tenant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Data Size</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Isolation</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTenants.map((tenant) => (
                <TableRow key={tenant.id} data-testid={`tenant-row-${tenant.id}`}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{getTypeBadge(tenant.type)}</TableCell>
                  <TableCell>{tenant.region}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tenant.workspaces.slice(0, 2).map((ws, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{ws}</Badge>
                      ))}
                      {tenant.workspaces.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{tenant.workspaces.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{tenant.dataSize}</TableCell>
                  <TableCell>{tenant.recordCount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{tenant.lastSync}</TableCell>
                  <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {tenant.isolation === "full" && <Lock className="w-3 h-3 mr-1" />}
                      {tenant.isolation === "shared" && <Unlock className="w-3 h-3 mr-1" />}
                      {tenant.isolation === "hybrid" && <Shield className="w-3 h-3 mr-1" />}
                      {tenant.isolation}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`tenant-menu-${tenant.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit Configuration</DropdownMenuItem>
                        <DropdownMenuItem><RefreshCw className="w-4 h-4 mr-2" />Force Sync</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete Tenant</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ModelingView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-muted-foreground">Data Models</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">128</div>
                <div className="text-sm text-muted-foreground">Total Entities</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">320</div>
                <div className="text-sm text-muted-foreground">Relationships</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Active Models</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Data Models</CardTitle>
            <CardDescription>Define entity schemas, relationships, and data structures</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search models..." 
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-models"
              />
            </div>
            <Button size="sm" variant="outline" data-testid="button-import-model">
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <Button size="sm" data-testid="button-create-model">
              <Plus className="w-4 h-4 mr-1" />
              Create Model
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entities</TableHead>
                <TableHead>Relationships</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataModels.map((model) => (
                <TableRow key={model.id} data-testid={`model-row-${model.id}`}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{getTypeBadge(model.type)}</TableCell>
                  <TableCell>{model.entities}</TableCell>
                  <TableCell>{model.relationships}</TableCell>
                  <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{model.version}</code></TableCell>
                  <TableCell>{model.owner}</TableCell>
                  <TableCell className="text-muted-foreground">{model.lastModified}</TableCell>
                  <TableCell>{getStatusBadge(model.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`model-menu-${model.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Schema</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit Model</DropdownMenuItem>
                        <DropdownMenuItem><FolderTree className="w-4 h-4 mr-2" />View Relationships</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="w-4 h-4 mr-2" />Clone Model</DropdownMenuItem>
                        <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Export Schema</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete Model</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Schema Visualization Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Entity Relationship Diagram</CardTitle>
          <CardDescription>Visual representation of data model relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a model to view entity relationships</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Boxes className="w-4 h-4 mr-2" />
                Open Model Viewer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConnectivityView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                <Plug className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">6</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Bidirectional</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connections Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Data Connections</CardTitle>
            <CardDescription>Manage integrations and data pipelines across systems</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search connections..." 
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-connections"
              />
            </div>
            <Button size="sm" data-testid="button-add-connection">
              <Plus className="w-4 h-4 mr-1" />
              Add Connection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Connection Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataConnections.map((conn) => (
                <TableRow key={conn.id} data-testid={`connection-row-${conn.id}`}>
                  <TableCell className="font-medium">{conn.name}</TableCell>
                  <TableCell>{getTypeBadge(conn.type)}</TableCell>
                  <TableCell>{conn.provider}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {conn.direction === "inbound" && "← Inbound"}
                      {conn.direction === "outbound" && "→ Outbound"}
                      {conn.direction === "bidirectional" && "↔ Bidirectional"}
                    </Badge>
                  </TableCell>
                  <TableCell>{conn.frequency}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {conn.workspaces.slice(0, 2).map((ws, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{ws}</Badge>
                      ))}
                      {conn.workspaces.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{conn.workspaces.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{conn.lastRun}</TableCell>
                  <TableCell>{getStatusBadge(conn.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`connection-menu-${conn.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit Connection</DropdownMenuItem>
                        <DropdownMenuItem><RefreshCw className="w-4 h-4 mr-2" />Test Connection</DropdownMenuItem>
                        <DropdownMenuItem><Activity className="w-4 h-4 mr-2" />View Logs</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete Connection</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SyncView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">6</div>
                <div className="text-sm text-muted-foreground">Sync Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm text-muted-foreground">Running Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">20.4M</div>
                <div className="text-sm text-muted-foreground">Records Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm text-muted-foreground">Failed Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Jobs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Synchronization Jobs</CardTitle>
            <CardDescription>Monitor and manage data synchronization across tenants</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search jobs..." 
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-sync"
              />
            </div>
            <Button size="sm" data-testid="button-create-sync">
              <Plus className="w-4 h-4 mr-1" />
              Create Job
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncJobs.map((job) => (
                <TableRow key={job.id} data-testid={`sync-row-${job.id}`}>
                  <TableCell className="font-medium">{job.name}</TableCell>
                  <TableCell>{job.source}</TableCell>
                  <TableCell>{job.destination}</TableCell>
                  <TableCell>{getTypeBadge(job.type)}</TableCell>
                  <TableCell>{job.schedule}</TableCell>
                  <TableCell className="text-muted-foreground">{job.lastRun}</TableCell>
                  <TableCell>{job.recordsProcessed.toLocaleString()}</TableCell>
                  <TableCell>{job.duration}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`sync-menu-${job.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                        <DropdownMenuItem><RefreshCw className="w-4 h-4 mr-2" />Run Now</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit Schedule</DropdownMenuItem>
                        <DropdownMenuItem><Activity className="w-4 h-4 mr-2" />View Logs</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete Job</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Running Job Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            Active Sync: Development Data Refresh
          </CardTitle>
          <CardDescription>Syncing from Staging Environment to Development Sandbox</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Progress: 4,520,000 / 8,500,000 records</span>
            <span className="font-medium">53%</span>
          </div>
          <Progress value={53} className="h-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Started 1h 12m ago</span>
            <span>Est. remaining: 58 minutes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDataPage() {
  const [activeView, setActiveView] = useState<MainView>("tenancy");

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <PageHeader 
          title="Data Management"
          description="Configure data tenancy, modeling, and connectivity across workspaces"
        />

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as MainView)} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="tenancy" className="gap-2" data-testid="tab-tenancy">
                <Server className="w-4 h-4" />
                Tenancy
              </TabsTrigger>
              <TabsTrigger value="modeling" className="gap-2" data-testid="tab-modeling">
                <Boxes className="w-4 h-4" />
                Modeling
              </TabsTrigger>
              <TabsTrigger value="connectivity" className="gap-2" data-testid="tab-connectivity">
                <Plug className="w-4 h-4" />
                Connectivity
              </TabsTrigger>
              <TabsTrigger value="sync" className="gap-2" data-testid="tab-sync">
                <RefreshCw className="w-4 h-4" />
                Sync
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tenancy">
              <TenancyView />
            </TabsContent>

            <TabsContent value="modeling">
              <ModelingView />
            </TabsContent>

            <TabsContent value="connectivity">
              <ConnectivityView />
            </TabsContent>

            <TabsContent value="sync">
              <SyncView />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
