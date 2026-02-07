import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  PieChart,
  LineChart,
  Zap,
  Bell,
  Calendar,
  Target,
  Shield,
  Users,
  AlertCircle,
  CheckSquare,
  FileText,
  RefreshCw,
  Eye,
  Send,
  Download,
  Play,
  Search,
  Plus,
  Settings,
  Layers,
  Grid3X3,
  LayoutDashboard,
  Gauge,
  Timer,
  MoreHorizontal,
  ChevronRight,
  Minus,
} from "lucide-react";
import {
  type ArchetypeTemplate,
  type WidgetContent,
  type WidgetSlot,
  type MetricItem,
  type TaskItem,
  type ActivityItem,
  type ChartData,
  type QuickAction,
  type AlertItem,
  type StatusItem,
} from "@/config/homeViewConfig";

interface ArchetypeDashboardProps {
  archetype: ArchetypeTemplate;
  content: WidgetContent;
  workspaceName: string;
  userPersona?: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400";
    case "high": return "text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400";
    case "medium": return "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400";
    case "low": return "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400";
    default: return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400";
    case "in-progress": return "text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400";
    case "blocked": return "text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400";
    case "pending": return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
    default: return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300";
    case "error": return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300";
    case "high": return "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-300";
    case "warning": return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300";
    case "medium": return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300";
    case "low": return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300";
    case "info": return "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900 text-sky-800 dark:text-sky-300";
    default: return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300";
  }
};

const CHART_COLORS = ["#266C92", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#6366f1"];

function WelcomeHeaderWidget({ workspaceName, userPersona, metrics }: { workspaceName: string; userPersona?: string; metrics: MetricItem[] }) {
  const topMetrics = metrics.slice(0, 3);

  const personaGreeting = (() => {
    switch (userPersona) {
      case "CRO": return { title: "Chief Risk Officer Dashboard", subtitle: "Enterprise risk posture and strategic priorities" };
      case "CAE": return { title: "Chief Audit Executive Dashboard", subtitle: "Audit plan progress and key findings" };
      case "CISO": return { title: "Security Operations Dashboard", subtitle: "Threat landscape and compliance posture" };
      case "Executive": return { title: "Executive Overview", subtitle: "Strategic metrics across your organization" };
      default: return { title: `Welcome, ${userPersona || "User"}`, subtitle: "Here's your workspace at a glance" };
    }
  })();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#266C92] via-[#1e5a7a] to-[#164557] p-6 text-white h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.03] rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/[0.03] rounded-full translate-y-1/3 -translate-x-1/3" />
      <div className="relative z-10">
        <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">{workspaceName}</p>
        <h1 className="text-2xl font-bold mb-0.5" data-testid="welcome-heading">
          {personaGreeting.title}
        </h1>
        <p className="text-white/60 text-sm">{personaGreeting.subtitle}</p>
      </div>
      {topMetrics.length > 0 && (
        <div className="relative z-10 flex items-center gap-3 mt-4">
          {topMetrics.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white/[0.08] rounded-lg border border-white/[0.08]">
              <span className="text-white/60 text-xs">{m.label}</span>
              <span className="text-sm font-semibold">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricsBarWidget({ metrics }: { metrics: MetricItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 h-full">
      {metrics.slice(0, 4).map((metric, idx) => (
        <Card key={idx} className="h-full">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{metric.label}</p>
              <div className={`w-2 h-2 rounded-full ${
                metric.status === "positive" ? "bg-emerald-500" : 
                metric.status === "negative" ? "bg-red-500" : 
                metric.status === "warning" ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
              }`} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
              {(metric.changeLabel || metric.change) && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  metric.status === "positive" ? "text-emerald-600 dark:text-emerald-400" : 
                  metric.status === "negative" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                }`}>
                  {metric.status === "positive" && <TrendingUp className="w-3 h-3" />}
                  {metric.status === "negative" && <TrendingDown className="w-3 h-3" />}
                  {metric.status === "warning" && <AlertTriangle className="w-3 h-3" />}
                  <span>{metric.changeLabel || `${metric.change! > 0 ? '+' : ''}${metric.change}%`}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function KPICardsWidget({ metrics }: { metrics: MetricItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {metrics.slice(0, 4).map((metric, idx) => (
        <Card key={idx} className="h-full">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{metric.label}</p>
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                metric.status === "positive" ? "bg-emerald-100 dark:bg-emerald-900/30" : 
                metric.status === "negative" ? "bg-red-100 dark:bg-red-900/30" :
                metric.status === "warning" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"
              }`}>
                {metric.status === "positive" && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                {metric.status === "negative" && <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                {metric.status === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {(metric.status === "neutral" || !metric.status) && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
              {(metric.changeLabel || metric.change) && (
                <p className={`text-xs mt-1 ${
                  metric.status === "positive" ? "text-emerald-600 dark:text-emerald-400" : 
                  metric.status === "negative" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                }`}>{metric.changeLabel || `${metric.change! > 0 ? '+' : ''}${metric.change}%`}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TaskListWidget({ tasks }: { tasks: TaskItem[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#266C92]" />
            <span>Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">{tasks.length} items</Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 pr-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className="px-3 py-2.5 rounded-md border border-transparent hover:border-border hover:bg-muted/40 transition-colors cursor-pointer group"
                data-testid={`task-${task.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    task.priority === "critical" ? "bg-red-500" :
                    task.priority === "high" ? "bg-orange-500" :
                    task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">{task.title}</p>
                    {task.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className={`text-[10px] px-1.5 py-0 h-4 ${getStatusColor(task.status)}`}>
                        {task.status === "completed" && <CheckCircle className="w-2.5 h-2.5 mr-0.5" />}
                        {task.status === "in-progress" && <Activity className="w-2.5 h-2.5 mr-0.5" />}
                        {task.status === "blocked" && <AlertCircle className="w-2.5 h-2.5 mr-0.5" />}
                        {task.status.replace("-", " ")}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />{task.dueDate}
                        </span>
                      )}
                      {task.assignee && (
                        <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                      )}
                    </div>
                  </div>
                  <Badge className={`shrink-0 text-[9px] px-1.5 py-0 h-4 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ActivityFeedWidget({ activities }: { activities: ActivityItem[] }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case "milestone": return <Target className="w-3.5 h-3.5 text-emerald-600" />;
      case "comment": return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case "action": return <CheckCircle className="w-3.5 h-3.5 text-[#266C92]" />;
      default: return <Activity className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#266C92]" />
            <span>Recent Activity</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-0.5 pr-2">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 px-2 py-2.5 rounded-md hover:bg-muted/40 transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight">
                    {activity.actor && <span className="font-medium">{activity.actor} </span>}
                    <span className="text-muted-foreground">{activity.title}</span>
                  </p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function BarChartSVG({ data, height = 140 }: { data: Array<{ label: string; value: number; color?: string }>; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(40, Math.max(16, 160 / data.length));
  const chartWidth = data.length * (barWidth + 12) + 40;
  const chartHeight = height;
  const plotH = chartHeight - 30;
  const gridLines = 4;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = 5 + (plotH / gridLines) * i;
        const val = Math.round(maxValue - (maxValue / gridLines) * i);
        return (
          <g key={i}>
            <line x1="35" y1={y} x2={chartWidth - 5} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
            <text x="30" y={y + 3} textAnchor="end" fill="currentColor" fillOpacity="0.35" fontSize="8">{val}</text>
          </g>
        );
      })}
      {data.map((item, idx) => {
        const barH = (item.value / maxValue) * plotH;
        const x = 40 + idx * (barWidth + 12);
        const y = 5 + plotH - barH;
        const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];
        return (
          <g key={idx}>
            <rect x={x} y={y} width={barWidth} height={barH} rx="3" fill={color} fillOpacity="0.85" />
            <text x={x + barWidth / 2} y={chartHeight - 5} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="8">
              {item.label.length > 6 ? item.label.slice(0, 5) + "." : item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChartSVG({ data, height = 140, color = "#266C92" }: { data: Array<{ label: string; value: number }>; height?: number; color?: string }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const chartWidth = 220;
  const chartHeight = height;
  const plotH = chartHeight - 30;
  const plotW = chartWidth - 45;
  const gridLines = 4;

  const points = data.map((item, idx) => ({
    x: 40 + (idx / Math.max(data.length - 1, 1)) * plotW,
    y: 8 + plotH - ((item.value - minValue) / range) * plotH,
  }));
  const pointsStr = points.map(p => `${p.x},${p.y}`).join(" ");
  const areaPoints = `${points[0].x},${8 + plotH} ${pointsStr} ${points[points.length - 1].x},${8 + plotH}`;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`area-fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = 8 + (plotH / gridLines) * i;
        const val = Math.round(maxValue - (range / gridLines) * i);
        return (
          <g key={i}>
            <line x1="38" y1={y} x2={chartWidth - 5} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
            <text x="33" y={y + 3} textAnchor="end" fill="currentColor" fillOpacity="0.35" fontSize="8">{val}</text>
          </g>
        );
      })}
      <polygon points={areaPoints} fill={`url(#area-fill-${color.replace("#", "")})`} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pointsStr} />
      {points.map((p, idx) => (
        <g key={idx}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
          <text x={p.x} y={chartHeight - 5} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="7">
            {data[idx].label.length > 5 ? data[idx].label.slice(0, 4) : data[idx].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DonutChartSVG({ data, size = 120 }: { data: Array<{ label: string; value: number; color?: string }>; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 40;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="16" />
          {data.map((item, idx) => {
            const pct = (item.value / total) * circumference;
            const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];
            const el = (
              <circle
                key={idx}
                cx="50" cy="50" r={r}
                fill="none"
                stroke={color}
                strokeWidth="16"
                strokeDasharray={`${pct} ${circumference - pct}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{total}</span>
          <span className="text-[9px] text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="space-y-1.5 min-w-0">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color || CHART_COLORS[idx % CHART_COLORS.length] }} />
            <span className="text-muted-foreground truncate">{item.label}</span>
            <span className="font-medium ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartAreaWidget({ charts }: { charts: ChartData[] }) {
  const chart = charts[0];
  if (!chart) return (
    <Card className="h-full flex items-center justify-center">
      <p className="text-xs text-muted-foreground">No chart data</p>
    </Card>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {(chart.type === "bar") && <BarChart2 className="w-4 h-4 text-[#266C92]" />}
            {(chart.type === "pie" || chart.type === "donut") && <PieChart className="w-4 h-4 text-[#266C92]" />}
            {(chart.type === "line" || chart.type === "area") && <LineChart className="w-4 h-4 text-[#266C92]" />}
            {chart.type === "gauge" && <Gauge className="w-4 h-4 text-[#266C92]" />}
            <span>{chart.title}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex items-center justify-center p-4">
        {chart.type === "bar" && <BarChartSVG data={chart.data} />}
        {(chart.type === "pie" || chart.type === "donut") && <DonutChartSVG data={chart.data} />}
        {(chart.type === "line" || chart.type === "area") && <LineChartSVG data={chart.data} />}
        {chart.type === "gauge" && <GaugeChartSVG value={typeof chart.data[0]?.value === "number" ? chart.data[0].value : 72} label={chart.data[0]?.label || "Score"} />}
      </CardContent>
    </Card>
  );
}

function GaugeChartSVG({ value, label }: { value: number; label: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = 42;
  const circumference = Math.PI * r;
  const filled = (pct / 100) * circumference;
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 60" className="w-32 h-20">
        <path d="M 8 55 A 42 42 0 0 1 92 55" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="10" strokeLinecap="round" />
        <path d="M 8 55 A 42 42 0 0 1 92 55" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`} />
        <text x="50" y="48" textAnchor="middle" fill="currentColor" fontSize="18" fontWeight="bold">{pct}%</text>
      </svg>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

function TrendChartWidget({ charts }: { charts: ChartData[] }) {
  const chart = charts[0];
  if (!chart) return <ChartAreaWidget charts={charts} />;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#266C92]" />
            <span>{chart.title}</span>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {chart.data.length} periods
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex items-center justify-center p-4">
        <LineChartSVG data={chart.data} color="#266C92" />
      </CardContent>
    </Card>
  );
}

function QuickActionsWidget({ actions }: { actions: QuickAction[] }) {
  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      "play": <Play className="w-4 h-4" />, "search": <Search className="w-4 h-4" />,
      "plus": <Plus className="w-4 h-4" />, "plus-circle": <Plus className="w-4 h-4" />,
      "send": <Send className="w-4 h-4" />, "download": <Download className="w-4 h-4" />,
      "refresh": <RefreshCw className="w-4 h-4" />, "eye": <Eye className="w-4 h-4" />,
      "settings": <Settings className="w-4 h-4" />, "file-text": <FileText className="w-4 h-4" />,
      "file-plus": <FileText className="w-4 h-4" />, "shield": <Shield className="w-4 h-4" />,
      "target": <Target className="w-4 h-4" />, "users": <Users className="w-4 h-4" />,
      "user-plus": <Users className="w-4 h-4" />, "calendar": <Calendar className="w-4 h-4" />,
      "alert-circle": <AlertCircle className="w-4 h-4" />, "alert-triangle": <AlertTriangle className="w-4 h-4" />,
      "clipboard-check": <CheckSquare className="w-4 h-4" />, "folder-plus": <FileText className="w-4 h-4" />,
      "grid": <Grid3X3 className="w-4 h-4" />, "calculator": <BarChart2 className="w-4 h-4" />,
      "database": <Layers className="w-4 h-4" />, "scale": <Gauge className="w-4 h-4" />,
      "key": <Shield className="w-4 h-4" />, "radar": <Target className="w-4 h-4" />,
      "activity": <Activity className="w-4 h-4" />, "git-pull-request": <RefreshCw className="w-4 h-4" />,
    };
    return icons[iconName] || <Zap className="w-4 h-4" />;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#266C92]" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <div className="grid grid-cols-2 gap-2">
          {actions.slice(0, 6).map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-2.5 px-3"
              data-testid={`action-${action.id}`}
            >
              {getIcon(action.icon)}
              <div className="text-left min-w-0">
                <span className="text-xs truncate block">{action.label}</span>
                {action.description && <span className="text-[10px] text-muted-foreground truncate block">{action.description}</span>}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AICommandWidget({ actions }: { actions: QuickAction[] }) {
  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#266C92]/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#266C92]" />
          </div>
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col pt-0">
        <div className="rounded-lg border border-border bg-background p-3 mb-3">
          <p className="text-xs text-muted-foreground mb-2">Suggested queries:</p>
          <div className="space-y-1.5">
            {(actions.length > 0 ? actions.slice(0, 3) : [
              { id: "1", label: "Summarize my open tasks" },
              { id: "2", label: "Show compliance status" },
              { id: "3", label: "What needs attention?" },
            ]).map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="truncate">{action.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto flex gap-2">
          <div className="flex-1 h-9 rounded-md border border-border bg-background px-3 flex items-center">
            <span className="text-xs text-muted-foreground">Ask anything...</span>
          </div>
          <Button size="icon" className="bg-[#266C92] shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineWidget({ activities }: { activities: ActivityItem[] }) {
  const getTimelineColor = (type: string) => {
    switch (type) {
      case "alert": return "bg-amber-500";
      case "milestone": return "bg-emerald-500";
      case "action": return "bg-[#266C92]";
      default: return "bg-muted-foreground/40";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Timer className="w-4 h-4 text-[#266C92]" />
          <span>Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <ScrollArea className="h-full">
          <div className="relative pl-5 pr-2">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
            {activities.slice(0, 10).map((activity, idx) => (
              <div key={activity.id} className="relative pb-4 last:pb-0">
                <div className={`absolute left-[-14px] top-1 w-2.5 h-2.5 rounded-full ${getTimelineColor(activity.type)} ring-2 ring-background`} />
                <div className="ml-2">
                  <p className="text-xs font-medium leading-tight">{activity.title}</p>
                  {activity.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground/60">{activity.timestamp}</span>
                    {activity.actor && <span className="text-[10px] text-muted-foreground/60">by {activity.actor}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function StatusGridWidget({ statuses }: { statuses: StatusItem[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-[#266C92]" />
          <span>Status Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <div className="grid grid-cols-2 gap-2">
          {statuses.slice(0, 6).map((status) => (
            <div 
              key={status.id}
              className={`p-3 rounded-lg border transition-colors ${
                status.status === "healthy" ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40" :
                status.status === "warning" ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40" :
                status.status === "critical" ? "bg-red-50/50 dark:bg-red-950/20 border-red-200/60 dark:border-red-800/40" :
                "bg-muted/20 border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{status.category}</span>
                {status.status === "healthy" && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                {status.status === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {status.status === "critical" && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                {status.status === "unknown" && <Clock className="w-3.5 h-3.5 text-gray-500" />}
              </div>
              <p className="text-lg font-bold leading-none">{status.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{status.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HeatMapWidget({ metrics }: { metrics: MetricItem[] }) {
  const categories = ["Operational", "Financial", "Strategic", "Compliance", "Technology"];
  const impacts = ["Critical", "High", "Medium", "Low"];
  const cells = categories.flatMap((cat, ci) =>
    impacts.map((imp, ii) => ({
      cat, imp, ci, ii,
      intensity: Math.max(0.05, Math.min(1, 0.15 + Math.random() * 0.85 * (1 - ii * 0.2) * (ci % 3 === 0 ? 1.2 : 0.8))),
      count: Math.floor(Math.random() * 8) + (ii < 2 ? 1 : 0),
    }))
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#266C92]" />
          <span>Risk Heat Map</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0 flex items-center justify-center">
        <div className="w-full">
          <div className="flex mb-1">
            <div className="w-20" />
            {impacts.map((imp) => (
              <div key={imp} className="flex-1 text-center text-[9px] text-muted-foreground font-medium">{imp}</div>
            ))}
          </div>
          {categories.map((cat, ci) => (
            <div key={cat} className="flex items-center mb-1">
              <div className="w-20 text-[9px] text-muted-foreground font-medium pr-2 text-right truncate">{cat}</div>
              {impacts.map((_, ii) => {
                const cell = cells.find(c => c.ci === ci && c.ii === ii)!;
                return (
                  <div key={ii} className="flex-1 px-0.5">
                    <div
                      className="aspect-[1.6] rounded-sm flex items-center justify-center text-[9px] font-medium"
                      style={{
                        backgroundColor: `rgba(239, 68, 68, ${cell.intensity * 0.7})`,
                        color: cell.intensity > 0.5 ? "white" : "rgba(0,0,0,0.5)",
                      }}
                    >
                      {cell.count > 0 ? cell.count : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DataTableWidget({ tasks }: { tasks: TaskItem[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#266C92]" />
            <span>Data Table</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px]">{tasks.length} records</Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6"><Search className="w-3 h-3" /></Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <ScrollArea className="h-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Item</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Status</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Priority</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Due</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 10).map((task) => (
                <tr key={task.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        task.priority === "critical" ? "bg-red-500" : task.priority === "high" ? "bg-orange-500" :
                        task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      <span className="truncate font-medium">{task.title}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <Badge className={`text-[9px] px-1.5 py-0 h-4 ${getStatusColor(task.status)}`}>
                      {task.status.replace("-", " ")}
                    </Badge>
                  </td>
                  <td className="py-2 px-2">
                    <Badge className={`text-[9px] px-1.5 py-0 h-4 ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">{task.dueDate || "-"}</td>
                  <td className="py-2 px-2 text-muted-foreground">{task.assignee || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AlertsPanelWidget({ alerts }: { alerts: AlertItem[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#266C92]" />
            <span>Alerts</span>
          </div>
          <Badge variant="destructive" className="text-[10px]">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {(alert.severity === "critical" || alert.severity === "error") && <AlertCircle className="w-4 h-4" />}
                    {(alert.severity === "warning" || alert.severity === "high" || alert.severity === "medium") && <AlertTriangle className="w-4 h-4" />}
                    {(alert.severity === "info" || alert.severity === "low") && <Bell className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{alert.title}</p>
                    <p className="text-xs opacity-70 mt-0.5 line-clamp-2">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] opacity-50">{alert.timestamp}</span>
                      {alert.actionLabel && (
                        <Button variant="ghost" size="sm" className="h-5 px-2 text-[10px]">
                          {alert.actionLabel} <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ProgressTrackerWidget({ metrics }: { metrics: MetricItem[] }) {
  const progressItems = metrics.slice(0, 5).map(m => ({
    label: m.label,
    value: typeof m.value === "number" ? Math.min(m.value, 100) : parseInt(String(m.value)) || Math.floor(Math.random() * 40 + 60),
    status: m.status,
  }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-[#266C92]" />
          <span>Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col justify-center pt-0">
        <div className="space-y-4">
          {progressItems.map((item, idx) => {
            const color = item.value >= 80 ? "bg-emerald-500" : item.value >= 50 ? "bg-[#266C92]" : "bg-amber-500";
            return (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-foreground font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarViewWidget({ tasks }: { tasks: TaskItem[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const taskDays = [0, 1, 3, 5];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#266C92]" />
            <span>Upcoming</span>
          </div>
          <span className="text-xs text-muted-foreground font-normal">
            {today.toLocaleDateString("en", { month: "short", year: "numeric" })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, idx) => (
            <div 
              key={idx}
              className={`p-2 text-center rounded-lg transition-colors ${
                idx === 0 ? "bg-[#266C92] text-white" : "bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <p className="text-[9px] uppercase font-medium opacity-70">{day.toLocaleDateString("en", { weekday: "short" })}</p>
              <p className="text-lg font-bold leading-tight">{day.getDate()}</p>
              {taskDays.includes(idx) && (
                <div className="flex justify-center gap-0.5 mt-1">
                  <div className={`w-1 h-1 rounded-full ${idx === 0 ? "bg-white/70" : "bg-amber-500"}`} />
                  {idx < 2 && <div className={`w-1 h-1 rounded-full ${idx === 0 ? "bg-white/50" : "bg-[#266C92]"}`} />}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          {tasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted/40 transition-colors cursor-pointer">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                task.priority === "critical" || task.priority === "high" ? "bg-red-500" : "bg-amber-500"
              }`} />
              <span className="truncate flex-1">{task.title}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{task.dueDate}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowQueueWidget({ tasks }: { tasks: TaskItem[] }) {
  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in-progress").slice(0, 6);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#266C92]" />
            <span>Workflow Queue</span>
          </div>
          <Badge variant="secondary" className="text-[10px]">{pendingTasks.length} pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 pr-2">
            {pendingTasks.map((task, idx) => (
              <div 
                key={task.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full border-2 border-[#266C92]/30 flex items-center justify-center text-[9px] font-bold text-[#266C92]">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium">{task.title}</p>
                  {task.assignee && <p className="text-[10px] text-muted-foreground">{task.assignee}</p>}
                </div>
                <Badge className={`text-[9px] px-1.5 py-0 h-4 ${getStatusColor(task.status)}`}>
                  {task.status.replace("-", " ")}
                </Badge>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function CoverageMapWidget({ metrics }: { metrics: MetricItem[] }) {
  const coverageValue = (() => {
    const m = metrics.find(m => typeof m.value === "number" && m.value <= 100);
    return m ? (typeof m.value === "number" ? m.value : 72) : 72;
  })();
  const segments = [
    { label: "SOX Controls", pct: 94, color: "#10b981" },
    { label: "ISO 27001", pct: 78, color: "#266C92" },
    { label: "GDPR Articles", pct: 88, color: "#8b5cf6" },
    { label: "SOC 2 Criteria", pct: 65, color: "#f59e0b" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#266C92]" />
          <span>Coverage Map</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0 flex flex-col items-center justify-center gap-4">
        <GaugeChartSVG value={coverageValue} label="Overall Coverage" />
        <div className="w-full space-y-2">
          {segments.map((seg, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-muted-foreground">{seg.label}</span>
                <span className="font-medium">{seg.pct}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCardWidget({ content, workspaceName }: { content: WidgetContent; workspaceName: string }) {
  const taskCount = content.tasks?.length || 0;
  const alertCount = content.alerts?.length || 0;
  const completedCount = content.tasks?.filter(t => t.status === "completed").length || 0;

  return (
    <Card className="h-full bg-gradient-to-r from-[#266C92]/5 to-transparent">
      <CardContent className="p-5 h-full flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#266C92]/10 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-[#266C92]" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{workspaceName}</p>
            <p className="text-xs text-muted-foreground">Workspace Summary</p>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{taskCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{alertCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Alerts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{content.metrics?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Metrics</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NavigationShortcutsWidget({ actions }: { actions: QuickAction[] }) {
  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      "play": <Play className="w-3.5 h-3.5" />, "search": <Search className="w-3.5 h-3.5" />,
      "plus": <Plus className="w-3.5 h-3.5" />, "send": <Send className="w-3.5 h-3.5" />,
      "settings": <Settings className="w-3.5 h-3.5" />, "file-text": <FileText className="w-3.5 h-3.5" />,
      "shield": <Shield className="w-3.5 h-3.5" />, "target": <Target className="w-3.5 h-3.5" />,
    };
    return icons[iconName] || <ArrowRight className="w-3.5 h-3.5" />;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#266C92]" />
          <span>Navigation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <div className="grid grid-cols-2 gap-1.5">
          {actions.slice(0, 8).map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
            >
              <span className="text-muted-foreground">{getIcon(action.icon)}</span>
              <span className="truncate">{action.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function renderWidget(slot: WidgetSlot, content: WidgetContent, workspaceName: string, userPersona?: string) {
  const props = { workspaceName, userPersona };
  
  switch (slot.widgetType) {
    case "welcome-header":
      return <WelcomeHeaderWidget {...props} metrics={content.metrics || []} />;
    case "metrics-bar":
      return <MetricsBarWidget metrics={content.metrics || []} />;
    case "kpi-cards":
      return <KPICardsWidget metrics={content.metrics || []} />;
    case "task-list":
      return <TaskListWidget tasks={content.tasks || []} />;
    case "activity-feed":
      return <ActivityFeedWidget activities={content.activities || []} />;
    case "chart-area":
      return <ChartAreaWidget charts={content.charts || []} />;
    case "trend-chart":
      return <TrendChartWidget charts={content.charts || []} />;
    case "quick-actions":
      return <QuickActionsWidget actions={content.quickActions || []} />;
    case "ai-command":
      return <AICommandWidget actions={content.quickActions || []} />;
    case "timeline":
      return <TimelineWidget activities={content.activities || []} />;
    case "status-grid":
      return <StatusGridWidget statuses={content.statusItems || []} />;
    case "heat-map":
      return <HeatMapWidget metrics={content.metrics || []} />;
    case "data-table":
      return <DataTableWidget tasks={content.tasks || []} />;
    case "alerts-panel":
      return <AlertsPanelWidget alerts={content.alerts || []} />;
    case "progress-tracker":
      return <ProgressTrackerWidget metrics={content.metrics || []} />;
    case "calendar-view":
      return <CalendarViewWidget tasks={content.tasks || []} />;
    case "workflow-queue":
      return <WorkflowQueueWidget tasks={content.tasks || []} />;
    case "coverage-map":
      return <CoverageMapWidget metrics={content.metrics || []} />;
    case "summary-card":
      return <SummaryCardWidget content={content} workspaceName={workspaceName} />;
    case "navigation-shortcuts":
      return <NavigationShortcutsWidget actions={content.quickActions || []} />;
    default:
      return (
        <Card className="h-full flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{slot.widgetType}</p>
        </Card>
      );
  }
}

export function ArchetypeDashboard({ archetype, content, workspaceName, userPersona }: ArchetypeDashboardProps) {
  const gridStyle = useMemo(() => ({
    display: "grid",
    gridTemplateColumns: `repeat(${archetype.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${archetype.layout.rows}, minmax(160px, 1fr))`,
    gridTemplateAreas: archetype.layout.areas,
    gap: archetype.layout.gap || "16px",
    minHeight: "700px",
  }), [archetype.layout]);

  return (
    <div className="p-6 pb-12" data-testid="archetype-dashboard">
      <div style={gridStyle}>
        {archetype.slots.map((slot) => (
          <div 
            key={slot.id} 
            style={{ gridArea: slot.gridArea }}
            data-testid={`widget-${slot.widgetType}`}
          >
            {renderWidget(slot, content, workspaceName, userPersona)}
          </div>
        ))}
      </div>
    </div>
  );
}
