import { AppLayout } from "@/components/layout";
import { Bell, Bot, Shield, Settings, ExternalLink as LinkIcon, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MetricCard({ title, icon, iconBg, metrics }: {
  title: string;
  icon: JSX.Element;
  iconBg: string;
  metrics: Array<{ value: number; label: string }>;
}) {
  return (
    <Card className="flex-1 min-w-0" data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className={`w-6 h-6 rounded flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-baseline gap-0">
          {metrics.map((m, i) => (
            <div key={i} className={`flex-1 ${i > 0 ? "border-l border-border pl-3" : ""}`}>
              <div className="text-2xl font-bold text-foreground">{m.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
    <Card className="flex-1" data-testid="card-risk-levels">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span>Risk Levels</span>
            <LinkIcon className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#266C92]" />
            <span className="text-xs font-normal text-muted-foreground">Risk Levels</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <svg viewBox={`0 0 ${totalW} ${chartH + 30}`} className="w-full" style={{ maxHeight: 220 }}>
          {[0, 10, 20, 30, 40, 50].map((v) => {
            const y = 10 + (chartH - ((v / maxVal) * chartH));
            return (
              <g key={v}>
                <line x1={startX - 5} y1={y} x2={totalW - 10} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                <text x={startX - 10} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="10">{v}</text>
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
                <text x={x + barW / 2} y={chartH + 25} textAnchor="middle" className="fill-muted-foreground" fontSize="10">{d.label}</text>
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
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
          <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={strokeW} />
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
          <span className="text-lg font-bold text-foreground">{total}</span>
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
    <Card className="flex-1" data-testid="card-dev-statuses">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <span>Development Statuses</span>
          <LinkIcon className="w-3 h-3 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex gap-6">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-xs font-medium text-muted-foreground mb-2">Pre-Deployment</span>
            <DonutChart data={preDeployData} size={110} />
            <div className="flex items-center gap-3 mt-2">
              {preDeployData.map((d, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-xs font-medium text-muted-foreground mb-2">Deployed</span>
            <DonutChart data={deployedData} size={110} />
            <div className="flex items-center gap-3 mt-2">
              {deployedData.map((d, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationHistory() {
  const notifications = [
    { text: "The application Kiki is ready for your approval", date: "February 4, 2026" },
    { text: "The application Kiki is ready for your approval", date: "February 2, 2026" },
    { text: "The application Kiki has been approved!", date: "January 30, 2026" },
  ];

  return (
    <Card className="flex-1" data-testid="card-notification-history">
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-sm font-semibold">Notification History</CardTitle>
        <p className="text-xs text-muted-foreground">Recent notifications from the last 90 days.</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-3">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3" data-testid={`notification-item-${i}`}>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{n.text}</p>
                <p className="text-xs text-muted-foreground">{n.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
    <Card className="flex-1" data-testid="card-compliance">
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <span>Compliance</span>
          <LinkIcon className="w-3 h-3 text-muted-foreground" />
        </CardTitle>
        <p className="text-xs text-muted-foreground">Active frameworks compliance summary</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <table className="w-full text-sm" data-testid="table-compliance">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-xs font-medium text-muted-foreground">Name</th>
              <th className="text-right py-2 text-xs font-medium text-muted-foreground">Company Controls</th>
              <th className="text-right py-2 text-xs font-medium text-muted-foreground">Application Controls</th>
              <th className="text-right py-2 text-xs font-medium text-muted-foreground">% Ready</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0" data-testid={`row-compliance-${i}`}>
                <td className="py-2.5 text-foreground text-sm">{row.name}</td>
                <td className="py-2.5 text-right text-muted-foreground">{row.companyControls}</td>
                <td className="py-2.5 text-right text-muted-foreground">{row.appControls}</td>
                <td className="py-2.5">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${row.readyPct}%`,
                          backgroundColor: row.readyPct > 15 ? "#f87171" : row.readyPct > 10 ? "#fb923c" : "#ef4444"
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{row.readyPct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default function AIGovernancePage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full" data-testid="page-ai-governance">
        <div className="flex-1 overflow-auto p-5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4" data-testid="aigov-breadcrumb">
            <span>Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">AI Governance Dashboard</span>
          </div>

          <div className="flex gap-4 mb-4 flex-wrap">
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

          <div className="flex gap-4 mb-4 flex-wrap">
            <RiskLevelsChart />
            <DevelopmentStatusesSection />
          </div>

          <div className="flex gap-4 mb-4 flex-wrap">
            <NotificationHistory />
            <ComplianceTable />
          </div>

          <Card className="bg-[#266C92] dark:bg-[#266C92] border-[#266C92]" data-testid="aigov-banner">
            <CardContent className="py-2 px-4 text-center">
              <span className="text-xs text-white">
                FairNow has been acquired by AuditBoard and is now AuditBoard AI Governance. See the{" "}
                <span className="underline cursor-pointer" data-testid="link-press-release">press release</span>{" "}
                for more details.
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
