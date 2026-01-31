/**
 * Archetype Dashboard Renderer
 * 
 * Renders a real, functional dashboard based on the selected archetype configuration.
 * Each widget type has a dedicated component that displays actual data.
 */

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
    case "high": return "text-red-600 bg-red-100 dark:bg-red-900/30";
    case "medium": return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
    case "low": return "text-green-600 bg-green-100 dark:bg-green-900/30";
    default: return "text-gray-600 bg-gray-100 dark:bg-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "text-green-600 bg-green-100 dark:bg-green-900/30";
    case "in-progress": return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
    case "pending": return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    default: return "text-gray-600 bg-gray-100 dark:bg-gray-800";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
    case "high": return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
    case "medium": return "text-amber-600 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
    case "low": return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
    default: return "text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  }
};

function WelcomeHeaderWidget({ workspaceName, userPersona, metrics }: { workspaceName: string; userPersona?: string; metrics: MetricItem[] }) {
  const taskCount = metrics.find(m => m.label.toLowerCase().includes("task"))?.value || "12";
  const alertCount = metrics.find(m => m.label.toLowerCase().includes("alert"))?.value || "3";
  
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#266C92] via-[#1e5a7a] to-[#164557] p-5 text-white h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="relative z-10">
        <h1 className="text-xl font-bold mb-1">
          {userPersona === "Executive" ? "Welcome back!" : `Welcome, ${userPersona || "User"}`}
        </h1>
        <p className="text-white/70 text-sm">{workspaceName}</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
            <CheckSquare className="w-4 h-4" />
            <span className="text-sm font-medium">{taskCount} Tasks</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">{alertCount} Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricsBarWidget({ metrics }: { metrics: MetricItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 h-full">
      {metrics.slice(0, 4).map((metric, idx) => (
        <Card key={idx} className="h-full">
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{metric.value}</p>
              <div className={`flex items-center gap-1 text-xs ${
                metric.status === "positive" ? "text-green-600" : 
                metric.status === "negative" ? "text-red-600" : "text-gray-500"
              }`}>
                {metric.status === "positive" && <TrendingUp className="w-3 h-3" />}
                {metric.status === "negative" && <TrendingDown className="w-3 h-3" />}
                {(metric.status === "neutral" || !metric.status) && <Activity className="w-3 h-3" />}
                <span>{metric.changeLabel || (metric.change ? `${metric.change > 0 ? '+' : ''}${metric.change}%` : '')}</span>
              </div>
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
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                metric.status === "positive" ? "bg-green-100 dark:bg-green-900/30" : 
                metric.status === "negative" ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-800"
              }`}>
                {metric.status === "positive" && <TrendingUp className="w-4 h-4 text-green-600" />}
                {metric.status === "negative" && <TrendingDown className="w-4 h-4 text-red-600" />}
                {(metric.status === "neutral" || !metric.status) && <Activity className="w-4 h-4 text-gray-600" />}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className={`text-xs ${
                metric.status === "positive" ? "text-green-600" : 
                metric.status === "negative" ? "text-red-600" : "text-gray-500"
              }`}>{metric.changeLabel || (metric.change ? `${metric.change > 0 ? '+' : ''}${metric.change}%` : '')}</p>
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
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
          </div>
          My Tasks
          <Badge variant="secondary" className="ml-auto">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                  </div>
                  <Badge className={`shrink-0 text-[10px] ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                    {task.status === "completed" && <CheckCircle className="w-3 h-3" />}
                    {task.status === "in-progress" && <Activity className="w-3 h-3" />}
                    {task.status === "pending" && <Clock className="w-3 h-3" />}
                    <span className="capitalize">{task.status.replace("-", " ")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{task.dueDate}</span>
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

function ActivityFeedWidget({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-2">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium">
                  {(activity.actor || "System").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.actor || "System"}</span>{" "}
                    <span className="text-muted-foreground">{activity.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ChartAreaWidget({ charts }: { charts: ChartData[] }) {
  const chart = charts[0];
  if (!chart) return null;
  
  const maxValue = Math.max(...chart.data.map((d: { label: string; value: number }) => d.value));
  const total = chart.data.reduce((sum: number, d: { label: string; value: number }) => sum + d.value, 0);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            {chart.type === "bar" && <BarChart2 className="w-3.5 h-3.5 text-purple-600" />}
            {chart.type === "pie" && <PieChart className="w-3.5 h-3.5 text-purple-600" />}
            {chart.type === "line" && <LineChart className="w-3.5 h-3.5 text-purple-600" />}
          </div>
          {chart.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex items-center justify-center">
        {chart.type === "bar" && (
          <div className="flex items-end gap-2 h-32">
            {chart.data.map((item: { label: string; value: number }, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div 
                  className="w-8 rounded-t bg-[#266C92]"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{item.label.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        )}
        {chart.type === "pie" && (
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {chart.data.reduce((acc: { elements: JSX.Element[]; offset: number }, item: { label: string; value: number }, idx: number) => {
                const percentage = (item.value / total) * 100;
                const offset = acc.offset;
                const colors = ["#266C92", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
                acc.elements.push(
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={colors[idx % colors.length]}
                    strokeWidth="20"
                    strokeDasharray={`${percentage * 2.51} 251`}
                    strokeDashoffset={-offset * 2.51}
                  />
                );
                acc.offset += percentage;
                return acc;
              }, { elements: [] as JSX.Element[], offset: 0 }).elements}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{total}</span>
            </div>
          </div>
        )}
        {chart.type === "line" && (
          <div className="w-full h-32 flex items-end">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <polyline
                fill="none"
                stroke="#266C92"
                strokeWidth="2"
                points={chart.data.map((item: { label: string; value: number }, idx: number) => {
                  const x = (idx / (chart.data.length - 1)) * 180 + 10;
                  const y = 90 - (item.value / maxValue) * 80;
                  return `${x},${y}`;
                }).join(" ")}
              />
              {chart.data.map((item: { label: string; value: number }, idx: number) => {
                const x = (idx / (chart.data.length - 1)) * 180 + 10;
                const y = 90 - (item.value / maxValue) * 80;
                return <circle key={idx} cx={x} cy={y} r="3" fill="#266C92" />;
              })}
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrendChartWidget({ charts }: { charts: ChartData[] }) {
  return <ChartAreaWidget charts={charts} />;
}

function QuickActionsWidget({ actions }: { actions: QuickAction[] }) {
  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      "play": <Play className="w-4 h-4" />,
      "search": <Search className="w-4 h-4" />,
      "plus": <Plus className="w-4 h-4" />,
      "send": <Send className="w-4 h-4" />,
      "download": <Download className="w-4 h-4" />,
      "refresh": <RefreshCw className="w-4 h-4" />,
      "eye": <Eye className="w-4 h-4" />,
      "settings": <Settings className="w-4 h-4" />,
      "file-text": <FileText className="w-4 h-4" />,
      "shield": <Shield className="w-4 h-4" />,
      "target": <Target className="w-4 h-4" />,
      "users": <Users className="w-4 h-4" />,
    };
    return icons[iconName] || <Zap className="w-4 h-4" />;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
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
              <span className="text-xs truncate">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AICommandWidget({ actions }: { actions: QuickAction[] }) {
  return (
    <Card className="h-full flex flex-col border-purple-200 dark:border-purple-800/50">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </div>
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col">
        <p className="text-xs text-muted-foreground mb-3">Ask me about your workspace:</p>
        <div className="space-y-1.5 flex-1">
          {actions.slice(0, 3).map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground hover:text-purple-600 h-auto py-2"
            >
              <span className="truncate">"{action.label}"</span>
            </Button>
          ))}
        </div>
        <Button className="w-full gap-2 bg-purple-600 text-white mt-3">
          <Sparkles className="w-4 h-4" />
          Ask AI
        </Button>
      </CardContent>
    </Card>
  );
}

function TimelineWidget({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Timer className="w-3.5 h-3.5 text-orange-600" />
          </div>
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="relative pl-4 pr-2">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            {activities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="relative pb-3 last:pb-0">
                <div className="absolute left-[-12px] top-1.5 w-2 h-2 rounded-full bg-[#266C92]" />
                <div className="ml-2">
                  <p className="text-xs font-medium">{activity.title}</p>
                  <p className="text-[10px] text-muted-foreground">{activity.timestamp}</p>
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
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <Grid3X3 className="w-3.5 h-3.5 text-teal-600" />
          </div>
          Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="grid grid-cols-2 gap-2">
          {statuses.slice(0, 6).map((status) => (
            <div 
              key={status.id}
              className={`p-3 rounded-lg border ${
                status.status === "healthy" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
                status.status === "warning" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" :
                status.status === "critical" ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" :
                "bg-muted/30 border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {status.status === "healthy" && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                {status.status === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {status.status === "critical" && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                {status.status === "unknown" && <Clock className="w-3.5 h-3.5 text-gray-500" />}
                <span className="text-xs font-medium truncate">{status.label}</span>
              </div>
              <p className="text-lg font-bold">{status.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HeatMapWidget({ metrics }: { metrics: MetricItem[] }) {
  const cells = Array.from({ length: 20 }, (_, i) => ({
    intensity: Math.random(),
  }));
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-red-600" />
          </div>
          Risk Heat Map
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-1">
          {cells.map((cell, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded"
              style={{
                backgroundColor: `rgba(239, 68, 68, ${0.2 + cell.intensity * 0.8})`,
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DataTableWidget({ tasks }: { tasks: TaskItem[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-gray-600" />
          </div>
          Data Table
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Task</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 8).map((task) => (
                <tr key={task.id} className="border-b border-border/50">
                  <td className="py-2 truncate max-w-[150px]">{task.title}</td>
                  <td className="py-2">
                    <Badge className={`text-[9px] ${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-muted-foreground">{task.dueDate}</td>
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
    <Card className="h-full flex flex-col border-rose-200 dark:border-rose-800/50">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-rose-600" />
          </div>
          Alerts
          <Badge variant="destructive" className="ml-auto">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs opacity-80 mt-0.5">{alert.message}</p>
                    <p className="text-[10px] opacity-60 mt-1">{alert.timestamp}</p>
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
  const progressItems = metrics.slice(0, 4).map(m => ({
    label: m.label,
    value: typeof m.value === 'number' ? m.value : parseInt(String(m.value)) || Math.floor(Math.random() * 100),
  }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          Progress Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col justify-center">
        <div className="space-y-4">
          {progressItems.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{Math.min(item.value, 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(item.value, 100)}%` }}
                />
              </div>
            </div>
          ))}
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
          </div>
          Upcoming
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => (
            <div 
              key={idx}
              className={`p-2 text-center rounded ${idx === 0 ? "bg-[#266C92] text-white" : "bg-muted/30"}`}
            >
              <p className="text-[10px] uppercase">{day.toLocaleDateString("en", { weekday: "short" })}</p>
              <p className="text-lg font-bold">{day.getDate()}</p>
              {idx < 3 && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mx-auto mt-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowQueueWidget({ tasks }: { tasks: TaskItem[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <RefreshCw className="w-3.5 h-3.5 text-violet-600" />
          </div>
          Workflow Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-2">
            {tasks.filter(t => t.status === "pending").slice(0, 6).map((task, idx) => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
              >
                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-medium text-violet-600">
                  {idx + 1}
                </div>
                <p className="text-sm truncate flex-1">{task.title}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function CoverageMapWidget({ metrics }: { metrics: MetricItem[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
            <Gauge className="w-3.5 h-3.5 text-lime-600" />
          </div>
          Coverage Map
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#84cc16" 
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${72 * 2.83} 283`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">72%</span>
            <span className="text-[10px] text-muted-foreground">Coverage</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCardWidget({ content, workspaceName }: { content: WidgetContent; workspaceName: string }) {
  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#266C92]/10 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-[#266C92]" />
          </div>
          <div>
            <p className="font-semibold">{workspaceName}</p>
            <p className="text-xs text-muted-foreground">Workspace Dashboard</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-muted/30 rounded">
            <p className="text-xl font-bold">{content.tasks?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Tasks</p>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <p className="text-xl font-bold">{content.alerts?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Alerts</p>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <p className="text-xl font-bold">{content.metrics?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Metrics</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NavigationShortcutsWidget({ actions }: { actions: QuickAction[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
          </div>
          Navigation
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="flex flex-wrap gap-2">
          {actions.slice(0, 8).map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {action.label}
            </Button>
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
    gridTemplateRows: `repeat(${archetype.layout.rows}, minmax(80px, 1fr))`,
    gridTemplateAreas: archetype.layout.areas,
    gap: "16px",
    height: "100%",
    minHeight: "600px",
  }), [archetype.layout]);

  return (
    <div className="p-6 h-full" data-testid="archetype-dashboard">
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
