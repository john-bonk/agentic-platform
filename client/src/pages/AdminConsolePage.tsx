import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AppLayout, PageHeader } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Plug,
  Bot,
  ListChecks,
  Trash2,
  Plus,
  Upload,
  FileText,
  RefreshCw,
  Settings,
  CheckCircle2,
  Loader2,
  Database,
  FolderOpen,
  Briefcase,
  Search,
  ChevronDown,
  ChevronRight,
  Save,
  Mail,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

type Role = "Admin" | "Reviewer" | "Viewer";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  solutions: string[];
  lastActive: string;
}

const SOLUTIONS = [
  "SOX Control Testing",
  "TPRM",
  "Issue Management",
  "Audit Planning",
  "Policy Management",
];

const initialUsers: AdminUser[] = [
  {
    id: "u-1",
    name: "Maya Patel",
    email: "maya.patel@auditco.com",
    role: "Admin",
    solutions: ["SOX Control Testing", "TPRM", "Issue Management", "Audit Planning", "Policy Management"],
    lastActive: "2 minutes ago",
  },
  {
    id: "u-2",
    name: "Daniel Reyes",
    email: "daniel.reyes@auditco.com",
    role: "Reviewer",
    solutions: ["SOX Control Testing", "TPRM"],
    lastActive: "12 minutes ago",
  },
  {
    id: "u-3",
    name: "Priya Singh",
    email: "priya.singh@auditco.com",
    role: "Reviewer",
    solutions: ["TPRM"],
    lastActive: "1 hour ago",
  },
  {
    id: "u-4",
    name: "Marcus Lin",
    email: "marcus.lin@auditco.com",
    role: "Viewer",
    solutions: ["SOX Control Testing"],
    lastActive: "Yesterday"  ,
  },
  {
    id: "u-5",
    name: "Renée Okafor",
    email: "renee.okafor@auditco.com",
    role: "Admin",
    solutions: ["SOX Control Testing", "TPRM", "Issue Management"],
    lastActive: "3 days ago",
  },
];

interface HitlGate {
  id: string;
  name: string;
  description: string;
  defaultRole: Role;
  override?: string;
}

const initialHitlGates: HitlGate[] = [
  { id: "g-1", name: "Scope confirmation", description: "Approve sample / population scope before fieldwork", defaultRole: "Reviewer" },
  { id: "g-2", name: "Exception review", description: "Disposition of failed test results and findings", defaultRole: "Reviewer", override: "Daniel Reyes" },
  { id: "g-3", name: "Conclusion approval", description: "Sign off on workpaper conclusions", defaultRole: "Admin" },
  { id: "g-4", name: "Final sign-off", description: "Workspace owner sign-off on closed assessments", defaultRole: "Admin", override: "Maya Patel" },
];

interface Connection {
  id: string;
  name: string;
  type: string;
  icon: typeof Plug;
  status: "connected" | "disconnected" | "syncing";
  lastSynced: string;
  cadence: string;
}

const initialConnections: Connection[] = [
  { id: "c-1", name: "GRC Platform", type: "Risk & compliance", icon: Briefcase, status: "connected", lastSynced: "2 hours ago", cadence: "Daily at 02:00" },
  { id: "c-2", name: "SharePoint / Document Store", type: "Document repository", icon: FolderOpen, status: "connected", lastSynced: "6 hours ago", cadence: "On demand" },
  { id: "c-3", name: "HRIS System", type: "People & access", icon: Users, status: "disconnected", lastSynced: "3 days ago", cadence: "Daily at 04:00" },
  { id: "c-4", name: "ERP / Procurement", type: "Vendors & spend", icon: Database, status: "syncing", lastSynced: "started 4 minutes ago", cadence: "Hourly" },
];

interface CorpusFile {
  id: string;
  filename: string;
  type: "PDF" | "XLSX" | "CSV";
  uploaded: string;
}

const initialCorpus: CorpusFile[] = [
  { id: "f-1", filename: "SOX 404 framework v2025.pdf", type: "PDF", uploaded: "Apr 14, 2026" },
  { id: "f-2", filename: "vendor-tier-thresholds.xlsx", type: "XLSX", uploaded: "Apr 09, 2026" },
  { id: "f-3", filename: "control-population-q1.csv", type: "CSV", uploaded: "Mar 28, 2026" },
];

interface ModelAssignment {
  solution: string;
  model: string;
  budget: number;
  used: number;
}

const initialModels: ModelAssignment[] = [
  { solution: "SOX Control Testing", model: "GPT-4o", budget: 5_000_000, used: 3_400_000 },
  { solution: "TPRM", model: "Claude Sonnet", budget: 3_000_000, used: 360_000 },
  { solution: "Issue Management", model: "Claude Haiku", budget: 1_000_000, used: 410_000 },
];

interface AuditEntry {
  id: string;
  timestamp: string;
  objectId: string;
  solution: "SOX" | "TPRM" | "Issue";
  action: string;
  type: "AI" | "auto" | "HITL";
  actor: string;
  detail: string;
  outputSummary: string;
}

const initialAudit: AuditEntry[] = [
  { id: "a-001", timestamp: "Apr 28 09:48", objectId: "CTL-1042", solution: "SOX",  action: "Generated test plan",                type: "AI",   actor: "TestPlan Agent", detail: "Sampled 25 of 312 transactions covering Q1 fiscal cycle.", outputSummary: "Test plan v3 — 25 samples, 4 attributes, 1 stratum." },
  { id: "a-002", timestamp: "Apr 28 09:51", objectId: "CTL-1042", solution: "SOX",  action: "Pulled evidence from GRC Platform",  type: "auto", actor: "Evidence Connector", detail: "Fetched 25 sample documents via API, 100% retrieved.", outputSummary: "25/25 evidence files attached." },
  { id: "a-003", timestamp: "Apr 28 09:54", objectId: "CTL-1042", solution: "SOX",  action: "Reviewer scope approval",            type: "HITL", actor: "Daniel Reyes", detail: "Approved population definition and sampling strategy.", outputSummary: "Disposition: Approved." },
  { id: "a-004", timestamp: "Apr 28 10:02", objectId: "VEN-0341", solution: "TPRM", action: "Composite risk score computed",       type: "AI",   actor: "Risk Scoring Agent", detail: "Scored vendor across 6 risk domains.", outputSummary: "Composite 72 / 100 (Tier 2)." },
  { id: "a-005", timestamp: "Apr 28 10:04", objectId: "VEN-0341", solution: "TPRM", action: "SOC 2 watcher polled",                type: "auto", actor: "Monitoring Worker", detail: "No new SOC 2 events in feed.", outputSummary: "0 new events since last poll." },
  { id: "a-006", timestamp: "Apr 28 10:11", objectId: "VEN-0341", solution: "TPRM", action: "Reviewer disposition",                type: "HITL", actor: "Priya Singh", detail: "Selected Mitigate; assigned 3 remediation items.", outputSummary: "Disposition: Mitigate · 3 items opened." },
  { id: "a-007", timestamp: "Apr 28 10:14", objectId: "ISS-220",  solution: "Issue",action: "Issue routing classification",        type: "AI",   actor: "Triage Agent", detail: "Classified as Operational · Medium severity.", outputSummary: "Routed to Ops queue." },
  { id: "a-008", timestamp: "Apr 28 10:18", objectId: "CTL-2210", solution: "SOX",  action: "Re-perform calculation",              type: "auto", actor: "Recompute Worker", detail: "Reproduced 25 calculations from source ledgers.", outputSummary: "25/25 matched." },
  { id: "a-009", timestamp: "Apr 28 10:21", objectId: "CTL-2210", solution: "SOX",  action: "Test conclusion drafted",             type: "AI",   actor: "Conclusion Agent", detail: "Drafted positive conclusion with 0 exceptions.", outputSummary: "Result: Effective. 0 exceptions." },
  { id: "a-010", timestamp: "Apr 28 10:23", objectId: "CTL-2210", solution: "SOX",  action: "Conclusion approval",                 type: "HITL", actor: "Maya Patel", detail: "Signed off on conclusion.", outputSummary: "Disposition: Approved." },
  { id: "a-011", timestamp: "Apr 28 10:30", objectId: "VEN-0298", solution: "TPRM", action: "Adverse-news scan",                   type: "auto", actor: "Monitoring Worker", detail: "No critical events in last 24h.", outputSummary: "0 critical, 1 informational." },
  { id: "a-012", timestamp: "Apr 28 10:34", objectId: "VEN-0298", solution: "TPRM", action: "Reviewer brief generated",            type: "AI",   actor: "Reviewer Brief Agent", detail: "Composite 41, low-risk, suggested Approve.", outputSummary: "Suggested disposition: Approve." },
  { id: "a-013", timestamp: "Apr 28 10:42", objectId: "CTL-1180", solution: "SOX",  action: "Population pulled",                   type: "auto", actor: "Population Worker", detail: "Pulled 1,228 records from source system.", outputSummary: "1,228 records." },
  { id: "a-014", timestamp: "Apr 28 10:45", objectId: "CTL-1180", solution: "SOX",  action: "Sampling plan computed",              type: "AI",   actor: "Sampling Agent", detail: "Stratified random sample of 40.", outputSummary: "40 samples in 3 strata." },
  { id: "a-015", timestamp: "Apr 28 10:48", objectId: "VEN-0512", solution: "TPRM", action: "Document analysis",                   type: "AI",   actor: "Doc Analyzer", detail: "Parsed SOC 2 Type II + ISO 27001 attestations.", outputSummary: "All controls present, no gaps flagged." },
  { id: "a-016", timestamp: "Apr 28 10:55", objectId: "CTL-1180", solution: "SOX",  action: "Evidence retrieval",                  type: "auto", actor: "Evidence Connector", detail: "37 of 40 retrieved automatically.", outputSummary: "37/40 retrieved · 3 outstanding." },
  { id: "a-017", timestamp: "Apr 28 11:01", objectId: "ISS-221",  solution: "Issue",action: "Auto-assign to owner",                type: "auto", actor: "Routing Worker", detail: "Auto-assigned to Marcus Lin.", outputSummary: "Owner: Marcus Lin." },
  { id: "a-018", timestamp: "Apr 28 11:08", objectId: "VEN-0512", solution: "TPRM", action: "Final sign-off",                      type: "HITL", actor: "Maya Patel", detail: "Approved vendor for onboarding.", outputSummary: "Disposition: Approved." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_BADGE_CLASS: Record<AuditEntry["type"], string> = {
  AI: "bg-blue-100 text-blue-700 border-0 dark:bg-blue-900/30 dark:text-blue-400",
  auto: "bg-teal-100 text-teal-700 border-0 dark:bg-teal-900/30 dark:text-teal-400",
  HITL: "bg-rose-100 text-rose-700 border-0 dark:bg-rose-900/30 dark:text-rose-400",
};

function statusBadge(status: Connection["status"]) {
  switch (status) {
    case "connected":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Connected
        </span>
      );
    case "disconnected":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Disconnected
        </span>
      );
    case "syncing":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          Syncing
        </span>
      );
  }
}

function usagePercent(used: number, budget: number) {
  return Math.min(100, Math.round((used / budget) * 100));
}

function usageColor(pct: number) {
  if (pct < 80) return "bg-emerald-500";
  if (pct < 95) return "bg-amber-500";
  return "bg-red-500";
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel 1 — Users & Permissions
// ─────────────────────────────────────────────────────────────────────────────

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [gates, setGates] = useState<HitlGate[]>(initialHitlGates);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Reviewer");

  const updateRole = (id: string, role: Role) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));

  const toggleSolution = (id: string, solution: string) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              solutions: u.solutions.includes(solution)
                ? u.solutions.filter((s) => s !== solution)
                : [...u.solutions, solution],
            }
          : u,
      ),
    );

  const removeUser = (id: string) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  const updateGateRole = (id: string, role: Role) =>
    setGates((prev) => prev.map((g) => (g.id === id ? { ...g, defaultRole: role } : g)));

  const updateGateOverride = (id: string, override: string) =>
    setGates((prev) =>
      prev.map((g) => (g.id === id ? { ...g, override: override === "__none__" ? undefined : override } : g)),
    );

  return (
    <div className="space-y-6">
      <Card data-testid="card-users-table">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Workspace users</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{users.length} members across all roles</p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[140px]">Role</TableHead>
                <TableHead>Solutions access</TableHead>
                <TableHead className="w-[140px]">Last active</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(v: Role) => updateRole(u.id, v)}>
                      <SelectTrigger className="h-8 text-xs" data-testid={`select-role-${u.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Reviewer">Reviewer</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex flex-wrap gap-1 max-w-[280px] text-left hover:opacity-80"
                          data-testid={`button-solutions-${u.id}`}
                        >
                          {u.solutions.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">No solutions</span>
                          )}
                          {u.solutions.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                          <ChevronDown className="w-3 h-3 ml-1 opacity-50 self-center" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2" align="start">
                        <p className="text-xs text-muted-foreground px-2 py-1">Toggle solution access</p>
                        <Separator className="my-1" />
                        <div className="space-y-0.5">
                          {SOLUTIONS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleSolution(u.id, s)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-muted text-left"
                              data-testid={`toggle-solution-${u.id}-${s.replace(/\s+/g, "-").toLowerCase()}`}
                            >
                              <Checkbox
                                checked={u.solutions.includes(s)}
                                tabIndex={-1}
                                className="pointer-events-none"
                              />
                              <span>{s}</span>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeUser(u.id)}
                      data-testid={`button-remove-${u.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-hitl-delegation">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#266C92]" />
                HITL gate delegation
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Default reviewer role per gate, with optional specific user overrides.
              </p>
            </div>
            <div className="space-y-3">
              {gates.map((g) => (
                <div
                  key={g.id}
                  className="border rounded-lg p-3 space-y-2"
                  data-testid={`gate-${g.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Default role</Label>
                      <Select value={g.defaultRole} onValueChange={(v: Role) => updateGateRole(g.id, v)}>
                        <SelectTrigger className="h-8 text-xs mt-1" data-testid={`select-gate-role-${g.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Reviewer">Reviewer</SelectItem>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Override user</Label>
                      <Select
                        value={g.override ?? "__none__"}
                        onValueChange={(v) => updateGateOverride(g.id, v)}
                      >
                        <SelectTrigger className="h-8 text-xs mt-1" data-testid={`select-gate-override-${g.id}`}>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None — use default role</SelectItem>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.name}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-invite-user">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#266C92]" />
                Invite user
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                New invitees receive an email with sign-up instructions.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="invite-email" className="text-xs">Email address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="name@auditco.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1"
                  data-testid="input-invite-email"
                />
              </div>
              <div>
                <Label htmlFor="invite-role" className="text-xs">Role</Label>
                <Select value={inviteRole} onValueChange={(v: Role) => setInviteRole(v)}>
                  <SelectTrigger id="invite-role" className="mt-1" data-testid="select-invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Reviewer">Reviewer</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-[#266C92] hover:bg-[#1e5a7a]"
                disabled={!inviteEmail.trim()}
                onClick={() => setInviteEmail("")}
                data-testid="button-invite"
              >
                <Plus className="w-4 h-4 mr-1" /> Send invite
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel 2 — Connected Sources
// ─────────────────────────────────────────────────────────────────────────────

function SourcesPanel() {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [corpus, setCorpus] = useState<CorpusFile[]>(initialCorpus);
  const [addOpen, setAddOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState<string | null>(null);

  const syncNow = (id: string) =>
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, status: "syncing", lastSynced: "starting…" } : c)));

  const removeFile = (id: string) =>
    setCorpus((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="space-y-6">
      <Card data-testid="card-connections">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Connected sources</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Data sources powering ingest, monitoring, and evidence retrieval.
              </p>
            </div>
            <Button onClick={() => setAddOpen(true)} className="bg-[#266C92] hover:bg-[#1e5a7a]" data-testid="button-add-connection">
              <Plus className="w-4 h-4 mr-1" /> Add connection
            </Button>
          </div>
          <div className="divide-y">
            {connections.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-muted/30"
                  data-testid={`connection-${c.id}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm font-medium">{c.name}</p>
                      <span className="text-xs text-muted-foreground">{c.type}</span>
                      {statusBadge(c.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last synced {c.lastSynced} · {c.cadence}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfigureOpen(c.id)}
                      data-testid={`button-configure-${c.id}`}
                    >
                      <Settings className="w-3.5 h-3.5 mr-1" /> Configure
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncNow(c.id)}
                      disabled={c.status === "syncing"}
                      data-testid={`button-sync-${c.id}`}
                    >
                      {c.status === "syncing" ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      )}
                      Sync now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-corpus">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Uploaded data corpus</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Org-specific reference documents available to the agent.
            </p>
          </div>
          <div className="border rounded-lg divide-y">
            {corpus.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No documents uploaded yet.</div>
            )}
            {corpus.map((f) => (
              <div
                key={f.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30"
                data-testid={`corpus-file-${f.id}`}
              >
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-sm flex-1 truncate">{f.filename}</p>
                <Badge className="bg-slate-100 text-slate-700 border-0 dark:bg-slate-800 dark:text-slate-300 text-[10px] uppercase">
                  {f.type}
                </Badge>
                <span className="text-xs text-muted-foreground w-28 text-right">{f.uploaded}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  onClick={() => removeFile(f.id)}
                  data-testid={`button-remove-corpus-${f.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <div
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-[#266C92] transition-colors cursor-pointer"
            data-testid="dropzone-corpus"
          >
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">Supports PDF, XLSX, CSV up to 50 MB each.</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-testid="dialog-add-connection">
          <DialogHeader>
            <DialogTitle>Add connection</DialogTitle>
            <DialogDescription>Connection setup coming soon.</DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Plug className="w-10 h-10 mx-auto mb-3 opacity-50" />
            The integration catalog and credential flow will land in a later milestone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!configureOpen} onOpenChange={(o) => !o && setConfigureOpen(null)}>
        <DialogContent data-testid="dialog-configure-connection">
          <DialogHeader>
            <DialogTitle>Configure connection</DialogTitle>
            <DialogDescription>
              {connections.find((c) => c.id === configureOpen)?.name} — sync schedule, scope, and credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Settings className="w-10 h-10 mx-auto mb-3 opacity-50" />
            Configuration drawer coming soon.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigureOpen(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel 3 — AI & Agent Config
// ─────────────────────────────────────────────────────────────────────────────

function AIPanel() {
  const [models, setModels] = useState<ModelAssignment[]>(initialModels);
  const [guardrail1, setGuardrail1] = useState(true);
  const [guardrail2, setGuardrail2] = useState(true);
  const [guardrail3, setGuardrail3] = useState(true);
  const [policy, setPolicy] = useState("");

  const updateModel = (idx: number, model: string) =>
    setModels((prev) => prev.map((m, i) => (i === idx ? { ...m, model } : m)));

  const updateBudget = (idx: number, budget: number) =>
    setModels((prev) => prev.map((m, i) => (i === idx ? { ...m, budget } : m)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        <Card data-testid="card-model-selection">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#266C92]" />
                Model selection
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Per-solution underlying model.</p>
            </div>
            <div className="space-y-3">
              {models.map((m, i) => (
                <div key={m.solution} className="flex items-center gap-3" data-testid={`model-row-${i}`}>
                  <span className="text-sm flex-1">{m.solution}</span>
                  <Select value={m.model} onValueChange={(v) => updateModel(i, v)}>
                    <SelectTrigger className="w-[180px] h-9 text-xs" data-testid={`select-model-${i}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GPT-4o">GPT-4o</SelectItem>
                      <SelectItem value="Claude Sonnet">Claude Sonnet</SelectItem>
                      <SelectItem value="Claude Haiku">Claude Haiku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-token-budgets">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-[#266C92]" />
                Token budgets
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monthly cap and current consumption per solution.
              </p>
            </div>
            <div className="space-y-4">
              {models.map((m, i) => {
                const pct = usagePercent(m.used, m.budget);
                return (
                  <div key={m.solution} className="space-y-1.5" data-testid={`budget-row-${i}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm flex-1">{m.solution}</span>
                      <Input
                        type="number"
                        value={m.budget}
                        onChange={(e) => updateBudget(i, Number(e.target.value) || 0)}
                        className="w-32 h-8 text-xs"
                        data-testid={`input-budget-${i}`}
                      />
                      <span className="text-xs text-muted-foreground w-14 text-right">{pct}%</span>
                    </div>
                    <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${usageColor(pct)} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {(m.used / 1_000_000).toFixed(2)} M / {(m.budget / 1_000_000).toFixed(2)} M tokens used
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">
        <Card data-testid="card-guardrails">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#266C92]" />
                Guardrails
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Workspace-wide safety policies.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4" data-testid="guardrail-plan">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Require plan preview before all workflow executions</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The agent must surface its plan for human review before any workflow runs.
                  </p>
                </div>
                <Switch checked={guardrail1} onCheckedChange={setGuardrail1} data-testid="switch-guardrail-plan" />
              </div>
              <Separator />
              <div className="flex items-start justify-between gap-4" data-testid="guardrail-impact">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Block agent actions above high-impact threshold without explicit approval</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sensitive actions (writes, terminations, vendor offboarding) require sign-off.
                  </p>
                </div>
                <Switch checked={guardrail2} onCheckedChange={setGuardrail2} data-testid="switch-guardrail-impact" />
              </div>
              <Separator />
              <div className="flex items-start justify-between gap-4" data-testid="guardrail-log">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Log all AI outputs to audit trail</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Every model response is captured with input prompt and citations.
                  </p>
                </div>
                <Switch checked={guardrail3} onCheckedChange={setGuardrail3} data-testid="switch-guardrail-log" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-content-policy">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#266C92]" />
                Content policy
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Custom system prompt additions applied to every agent prompt.
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="policy" className="text-xs">Custom system prompt additions</Label>
              <Textarea
                id="policy"
                placeholder="Add org-specific context or constraints applied to all agent prompts…"
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
                className="min-h-[140px] text-sm"
                data-testid="textarea-policy"
              />
              <Button className="bg-[#266C92] hover:bg-[#1e5a7a]" data-testid="button-save-policy">
                <Save className="w-4 h-4 mr-1" /> Save policy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel 4 — Audit Log
// ─────────────────────────────────────────────────────────────────────────────

function AuditPanel() {
  const [solutionFilter, setSolutionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7d");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = initialAudit.filter((a) => {
    if (solutionFilter !== "all" && a.solution.toLowerCase() !== solutionFilter) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (search.trim() && !a.objectId.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change beyond bounds
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  return (
    <div className="space-y-4">
      <Card data-testid="card-audit-filters">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Solution</Label>
              <Select value={solutionFilter} onValueChange={setSolutionFilter}>
                <SelectTrigger className="mt-1 h-9 text-xs" data-testid="select-filter-solution">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All solutions</SelectItem>
                  <SelectItem value="sox">SOX</SelectItem>
                  <SelectItem value="tprm">TPRM</SelectItem>
                  <SelectItem value="issue">Issue Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Action type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-1 h-9 text-xs" data-testid="select-filter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="AI">AI</SelectItem>
                  <SelectItem value="auto">Automated</SelectItem>
                  <SelectItem value="HITL">HITL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Date range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="mt-1 h-9 text-xs" data-testid="select-filter-date">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="custom">Custom…</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Object ID</Label>
              <div className="relative mt-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="CTL-1042, VEN-0341…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 text-xs pl-8"
                  data-testid="input-filter-search"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-audit-table">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Timestamp</TableHead>
                <TableHead className="w-[110px]">Object ID</TableHead>
                <TableHead className="w-[100px]">Solution</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead className="w-[180px]">Actor</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    No entries match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {pageRows.flatMap((row) => {
                const expanded = expandedId === row.id;
                const rows: JSX.Element[] = [
                  <TableRow
                    key={`${row.id}-row`}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setExpandedId(expanded ? null : row.id)}
                    data-testid={`audit-row-${row.id}`}
                  >
                      <TableCell className="text-xs font-mono text-muted-foreground">{row.timestamp}</TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-[#266C92]">{row.objectId}</TableCell>
                      <TableCell className="text-xs">{row.solution}</TableCell>
                      <TableCell className="text-sm">{row.action}</TableCell>
                      <TableCell>
                        <Badge className={`${TYPE_BADGE_CLASS[row.type]} text-[10px]`}>{row.type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{row.actor}</TableCell>
                      <TableCell>
                        {expanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                ];
                if (expanded) {
                  rows.push(
                    <TableRow
                      key={`${row.id}-detail`}
                      className="bg-slate-50/60 dark:bg-muted/20"
                      data-testid={`audit-detail-${row.id}`}
                    >
                      <TableCell colSpan={7} className="py-3">
                        <div className="px-4 space-y-2 text-sm">
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Description</span>
                            <p className="mt-0.5">{row.detail}</p>
                          </div>
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Output summary</span>
                            <p className="mt-0.5 font-mono text-xs">{row.outputSummary}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }
                return rows;
              })}
            </TableBody>
          </Table>
          <div className="px-5 py-3 border-t flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {pageRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + pageRows.length} of {filtered.length}
            </p>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    aria-disabled={page === 1}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    data-testid="pagination-prev"
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={page === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                      data-testid={`pagination-page-${i + 1}`}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                    data-testid="pagination-next"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page shell
// ─────────────────────────────────────────────────────────────────────────────

const TAB_VALUES = ["users", "sources", "ai", "audit"] as const;
type TabValue = typeof TAB_VALUES[number];

export default function AdminConsolePage() {
  const [location] = useLocation();
  const [tab, setTab] = useState<TabValue>(() => {
    if (typeof window === "undefined") return "users";
    const h = window.location.hash.replace("#", "");
    return (TAB_VALUES.includes(h as TabValue) ? h : "users") as TabValue;
  });

  // Sync tab with URL hash so sidebar deep links work, including same-page
  // hash-only navigation (which doesn't trigger wouter's location change).
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (TAB_VALUES.includes(hash as TabValue)) {
        setTab(hash as TabValue);
      } else if (hash === "") {
        setTab("users");
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [location]);

  const onTabChange = (v: string) => {
    setTab(v as TabValue);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/admin-console#${v}`);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Admin"
        description="Workspace configuration · AuditCo"
      />
      <div className="px-6 pb-10">
        <Tabs value={tab} onValueChange={onTabChange} className="w-full">
          <TabsList className="border-b w-full justify-start rounded-none h-12 bg-transparent p-0">
            <TabsTrigger
              value="users"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:bg-transparent data-[state=active]:text-[#266C92] px-6"
              data-testid="tab-users"
            >
              <Users className="w-4 h-4 mr-2" />
              Users & Permissions
            </TabsTrigger>
            <TabsTrigger
              value="sources"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:bg-transparent data-[state=active]:text-[#266C92] px-6"
              data-testid="tab-sources"
            >
              <Plug className="w-4 h-4 mr-2" />
              Connected Sources
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:bg-transparent data-[state=active]:text-[#266C92] px-6"
              data-testid="tab-ai"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI & Agent Config
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:bg-transparent data-[state=active]:text-[#266C92] px-6"
              data-testid="tab-audit"
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersPanel />
          </TabsContent>
          <TabsContent value="sources" className="mt-6">
            <SourcesPanel />
          </TabsContent>
          <TabsContent value="ai" className="mt-6">
            <AIPanel />
          </TabsContent>
          <TabsContent value="audit" className="mt-6">
            <AuditPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
