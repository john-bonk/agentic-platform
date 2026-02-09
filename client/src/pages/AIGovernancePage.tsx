import { useState } from "react";
import { ChevronDown, ChevronRight, LayoutDashboard, Briefcase, Bot, Building2, Shield, Settings, BookOpen, Bell, ExternalLink as LinkIcon } from "lucide-react";

const SIDEBAR_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "my-work", label: "My Work", icon: Briefcase },
  { id: "ai-applications", label: "AI Applications", icon: Bot },
  { id: "vendors", label: "Vendors", icon: Building2 },
  { id: "frameworks", label: "Frameworks", icon: Shield },
  { id: "admin", label: "Admin", icon: Settings, expandable: true },
  { id: "resources", label: "Resources", icon: BookOpen },
];

function AIGovSidebar() {
  const [adminExpanded, setAdminExpanded] = useState(false);

  return (
    <div className="w-[200px] flex-shrink-0 bg-[#1e3a4f] text-white flex flex-col">
      <div className="px-4 py-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex gap-1.5 ml-auto">
          <button className="text-white/60 hover:text-white" data-testid="button-aigov-back">
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <button className="text-white/60 hover:text-white" data-testid="button-aigov-forward">
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {SIDEBAR_NAV.map((item) => (
          <div key={item.id}>
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                item.active
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => item.expandable && setAdminExpanded(!adminExpanded)}
              data-testid={`aigov-nav-${item.id}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.expandable && (
                adminExpanded
                  ? <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                  : <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              )}
            </button>
            {item.expandable && adminExpanded && (
              <div className="ml-9 flex flex-col gap-0.5 mt-0.5">
                <button className="text-left text-white/70 hover:text-white text-sm py-1.5 px-2 rounded hover:bg-white/10" data-testid="aigov-nav-admin-settings">
                  Settings
                </button>
                <button className="text-left text-white/70 hover:text-white text-sm py-1.5 px-2 rounded hover:bg-white/10" data-testid="aigov-nav-admin-users">
                  Users
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

function MetricCard({ title, icon, iconBg, metrics }: {
  title: string;
  icon: JSX.Element;
  iconBg: string;
  metrics: Array<{ value: number; label: string }>;
}) {
  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-md p-4 flex-1 min-w-0" data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-foreground">{title}</span>
      </div>
      <div className="flex items-baseline gap-0">
        {metrics.map((m, i) => (
          <div key={i} className={`flex-1 ${i > 0 ? "border-l border-gray-200 dark:border-border pl-3" : ""}`}>
            <div className="text-2xl font-bold text-gray-900 dark:text-foreground">{m.value}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskLevelsChart() {
  const data = [
    { label: "Low", value: 0, color: "#a3d5e8" },
    { label: "Medium", value: 6, color: "#5ba8c8" },
    { label: "High", value: 4, color: "#3d8eb0" },
    { label: "Prohibited", value: 0, color: "#2d7a9e" },
    { label: "Not Assigned", value: 44, color: "#266C92" },
  ];
  const maxVal = 50;
  const chartH = 180;
  const barW = 44;
  const gap = 24;
  const startX = 40;
  const totalW = startX + data.length * (barW + gap) + 10;

  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-md p-4 flex-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-800 dark:text-foreground">Risk Levels</span>
          <LinkIcon className="w-3 h-3 text-gray-400" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#266C92]" />
          <span className="text-xs text-gray-500 dark:text-muted-foreground">Risk Levels</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${totalW} ${chartH + 30}`} className="w-full" style={{ maxHeight: 220 }}>
        {[0, 10, 20, 30, 40, 50].map((v) => {
          const y = 10 + (chartH - ((v / maxVal) * chartH));
          return (
            <g key={v}>
              <line x1={startX - 5} y1={y} x2={totalW - 10} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={startX - 10} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize="10">{v}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = startX + i * (barW + gap);
          const barH = (d.value / maxVal) * chartH;
          const y = 10 + chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={d.color} rx="2" />
              {d.value > 0 && (
                <g>
                  <rect x={x + barW / 2 - 12} y={y - 20} width="24" height="16" rx="3" fill="#266C92" />
                  <text x={x + barW / 2} y={y - 9} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">{d.value}</text>
                </g>
              )}
              <text x={x + barW / 2} y={chartH + 25} textAnchor="middle" className="fill-gray-500" fontSize="10">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DonutChart({ data, size = 120 }: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 42;
  const strokeW = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
          <circle cx="55" cy="55" r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeW} />
          {data.map((item, idx) => {
            const pct = (item.value / total) * circumference;
            const el = (
              <circle
                key={idx}
                cx="55"
                cy="55"
                r={r}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeW}
                strokeDasharray={`${pct} ${circumference - pct}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800 dark:text-foreground">{total}</span>
        </div>
      </div>
    </div>
  );
}

function DevelopmentStatusesSection() {
  const preDeployData = [
    { label: "Approved", value: 10, color: "#4ade80" },
    { label: "Not Approved", value: 3, color: "#fb923c" },
  ];

  const deployedData = [
    { label: "Approved", value: 9, color: "#4ade80" },
    { label: "Not Approved", value: 1, color: "#f87171" },
  ];

  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-md p-4 flex-1">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-sm font-semibold text-gray-800 dark:text-foreground">Development Statuses</span>
        <LinkIcon className="w-3 h-3 text-gray-400" />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-xs font-medium text-gray-600 dark:text-muted-foreground mb-2">Pre-Deployment</span>
          <DonutChart data={preDeployData} size={110} />
          <div className="flex items-center gap-3 mt-2">
            {preDeployData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] text-gray-500 dark:text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-xs font-medium text-gray-600 dark:text-muted-foreground mb-2">Deployed</span>
          <DonutChart data={deployedData} size={110} />
          <div className="flex items-center gap-3 mt-2">
            {deployedData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] text-gray-500 dark:text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationHistory() {
  const notifications = [
    { text: "The application Kiki is ready for your approval", date: "February 4, 2026" },
    { text: "The application Kiki is ready for your approval", date: "February 2, 2026" },
    { text: "The application Kiki has been approved!", date: "January 30, 2026" },
  ];

  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-md p-4 flex-1">
      <div className="mb-1">
        <span className="text-sm font-semibold text-gray-800 dark:text-foreground">Notification History</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-3">Recent notifications from the last 90 days.</p>

      <div className="flex flex-col gap-3">
        {notifications.map((n, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-foreground">{n.text}</p>
              <p className="text-xs text-gray-400 dark:text-muted-foreground">{n.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceTable() {
  const rows = [
    { name: "EU AI Act - Transparency", companyControls: "0/1", appControls: "3/18", readyPct: 16 },
    { name: "EU AI Act - High Risk Deployer", companyControls: "0/4", appControls: "2/16", readyPct: 11 },
    { name: "EU AI Act - High Risk Provider", companyControls: "0/6", appControls: "4/42", readyPct: 8 },
    { name: "NIST AI RMF", companyControls: "0/3", appControls: "1/26", readyPct: 3 },
  ];

  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-md p-4 flex-1">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm font-semibold text-gray-800 dark:text-foreground">Compliance</span>
        <LinkIcon className="w-3 h-3 text-gray-400" />
      </div>
      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-3">Active frameworks compliance summary</p>

      <table className="w-full text-sm" data-testid="table-compliance">
        <thead>
          <tr className="border-b border-gray-200 dark:border-border">
            <th className="text-left py-2 text-xs font-medium text-gray-500 dark:text-muted-foreground">Name</th>
            <th className="text-right py-2 text-xs font-medium text-gray-500 dark:text-muted-foreground">Company Controls</th>
            <th className="text-right py-2 text-xs font-medium text-gray-500 dark:text-muted-foreground">Application Controls</th>
            <th className="text-right py-2 text-xs font-medium text-gray-500 dark:text-muted-foreground">% Ready</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-border/50 last:border-0">
              <td className="py-2.5 text-gray-700 dark:text-foreground text-sm">{row.name}</td>
              <td className="py-2.5 text-right text-gray-600 dark:text-muted-foreground">{row.companyControls}</td>
              <td className="py-2.5 text-right text-gray-600 dark:text-muted-foreground">{row.appControls}</td>
              <td className="py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-2 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.readyPct}%`,
                        backgroundColor: row.readyPct > 15 ? "#f87171" : row.readyPct > 10 ? "#fb923c" : "#ef4444"
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-muted-foreground w-8 text-right">{row.readyPct}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AIGovernancePage() {
  return (
    <div className="flex h-full bg-gray-50 dark:bg-background" data-testid="page-ai-governance">
      <AIGovSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="flex items-center justify-between px-5 py-3 bg-white dark:bg-card border-b border-gray-200 dark:border-border flex-shrink-0" data-testid="aigov-header">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground" data-testid="aigov-breadcrumb">
            <span>Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-gray-800 dark:text-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative" data-testid="button-aigov-notifications">
              <Bell className="w-5 h-5 text-gray-500 dark:text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#266C92] text-white text-[9px] font-bold rounded-full flex items-center justify-center" data-testid="text-notification-count">25</span>
            </button>
            <div className="flex items-center gap-2" data-testid="aigov-user-profile">
              <div className="w-8 h-8 rounded-full bg-[#266C92] flex items-center justify-center text-white text-xs font-semibold">JB</div>
              <span className="text-sm font-medium text-gray-700 dark:text-foreground" data-testid="text-username">John Bonk</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-5">
          <div className="flex gap-4 mb-4">
            <MetricCard
              title="Applications"
              icon={<Bot className="w-3.5 h-3.5 text-white" />}
              iconBg="bg-[#266C92]"
              metrics={[
                { value: 55, label: "Total" },
                { value: 13, label: "Updated" },
                { value: 26, label: "New" },
              ]}
            />
            <MetricCard
              title="Frameworks"
              icon={<Shield className="w-3.5 h-3.5 text-white" />}
              iconBg="bg-emerald-600"
              metrics={[
                { value: 27, label: "Active" },
                { value: 102, label: "Total Controls" },
              ]}
            />
            <MetricCard
              title="Development Status Counts"
              icon={<Settings className="w-3.5 h-3.5 text-white" />}
              iconBg="bg-orange-500"
              metrics={[
                { value: 13, label: "Pre-deployment" },
                { value: 10, label: "Deployed" },
              ]}
            />
          </div>

          <div className="flex gap-4 mb-4">
            <RiskLevelsChart />
            <DevelopmentStatusesSection />
          </div>

          <div className="flex gap-4 mb-4">
            <NotificationHistory />
            <ComplianceTable />
          </div>

          <div className="bg-[#1e3a4f] text-white text-xs text-center py-2 rounded-md" data-testid="aigov-banner">
            FairNow has been acquired by AuditBoard and is now AuditBoard AI Governance. See the{" "}
            <button className="underline hover:text-white/80" data-testid="link-press-release">press release</button>{" "}
            for more details.
          </div>
        </div>
      </div>
    </div>
  );
}
