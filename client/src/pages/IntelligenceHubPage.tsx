import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity,
  Zap,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Database,
  Cpu,
  Network,
  Lock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Target
} from "lucide-react";
import { 
  AreaChart, 
  Area,
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface TelemetryData {
  workflows: {
    total: number;
    active: number;
    completed: number;
    failed: number;
  };
  nodes: {
    total: number;
    byType: Record<string, number>;
  };
  compliance: {
    controlsTotal: number;
    controlsEffective: number;
    risksHigh: number;
    risksMedium: number;
    risksLow: number;
    overallScore: number;
  };
  realtime: {
    activeProcesses: number;
    queuedTasks: number;
    avgResponseTime: number;
    throughput: number;
  };
  trends: Array<{ time: string; workflows: number; compliance: number; risk: number }>;
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  color = "primary",
  testId
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: number;
  color?: "primary" | "success" | "warning" | "danger";
  testId?: string;
}) {
  const colorClasses = {
    primary: "text-[#266C92] bg-[#266C92]/10",
    success: "text-emerald-600 bg-emerald-50",
    warning: "text-amber-600 bg-amber-50",
    danger: "text-red-600 bg-red-50",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
      data-testid={testId || `metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-semibold text-gray-900 dark:text-foreground" data-testid={`${testId || `metric-${label.toLowerCase().replace(/\s+/g, '-')}`}-value`}>{value}</div>
        <div className="text-sm text-gray-500 dark:text-muted-foreground">{label}</div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`} data-testid={`${testId || `metric-${label.toLowerCase().replace(/\s+/g, '-')}`}-trend`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(trend)}%
        </div>
      )}
    </motion.div>
  );
}

function ComplianceRing({ progress, size = 120 }: { progress: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#266C92"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-3xl font-bold text-gray-900 dark:text-foreground">{progress}%</span>
        <span className="text-xs text-gray-500 dark:text-muted-foreground">Compliant</span>
      </div>
    </div>
  );
}

function RiskHeatmapCell({ level, label }: { level: number; label: string }) {
  const getColor = (level: number) => {
    if (level <= 2) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (level <= 4) return "bg-amber-100 text-amber-700 border-amber-200";
    if (level <= 6) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className={`p-2 rounded-md border text-center ${getColor(level)}`}>
      <div className="text-xs font-medium">{label}</div>
      <div className="text-xs opacity-75">{level}/10</div>
    </div>
  );
}

export default function IntelligenceHubPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data = {
    workflows: { total: 47, active: 12, completed: 32, failed: 3 },
    nodes: { total: 284, byType: { trigger: 47, action: 156, condition: 52, approval: 29 } },
    compliance: { controlsTotal: 156, controlsEffective: 142, risksHigh: 8, risksMedium: 23, risksLow: 45, overallScore: 91 },
    realtime: { activeProcesses: 23, queuedTasks: 7, avgResponseTime: 142, throughput: 847 },
    trends: []
  }} = useQuery<TelemetryData>({
    queryKey: ['/api/dashboard/telemetry'],
    refetchInterval: 5000,
  });

  const activeAlerts = useMemo(() => 
    data.compliance.risksHigh + Math.floor(data.compliance.risksMedium / 3), 
    [data.compliance.risksHigh, data.compliance.risksMedium]
  );

  const radarData = [
    { subject: "Controls", A: 95, fullMark: 100 },
    { subject: "Risks", A: 78, fullMark: 100 },
    { subject: "Audits", A: 88, fullMark: 100 },
    { subject: "Policies", A: 92, fullMark: 100 },
    { subject: "Vendors", A: 85, fullMark: 100 },
    { subject: "Incidents", A: 90, fullMark: 100 },
  ];

  const riskDistribution = [
    { name: "Low", value: data.compliance.risksLow, color: "#10b981" },
    { name: "Medium", value: data.compliance.risksMedium, color: "#f59e0b" },
    { name: "High", value: data.compliance.risksHigh, color: "#ef4444" },
  ];

  const trendData = data.trends.length > 0 ? data.trends : [
    { time: "00:00", workflows: 12, compliance: 89, risk: 15 },
    { time: "04:00", workflows: 8, compliance: 90, risk: 14 },
    { time: "08:00", workflows: 24, compliance: 91, risk: 12 },
    { time: "12:00", workflows: 35, compliance: 92, risk: 11 },
    { time: "16:00", workflows: 28, compliance: 91, risk: 13 },
    { time: "20:00", workflows: 18, compliance: 90, risk: 12 },
  ];

  return (
    <AppLayout 
      showHeader={true}
      showSideNav={true}
    >
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50 dark:bg-background">
        <div className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-200 dark:border-border" data-testid="header-intelligence-hub">
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#266C92] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-foreground" data-testid="text-hub-title">Intelligence Hub</h1>
              </div>
              <Badge variant="secondary" className="text-xs" data-testid="badge-stardate">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Badge>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm" data-testid="status-systems">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-gray-600 dark:text-muted-foreground">All Systems Operational</span>
              </div>
              {activeAlerts > 0 && (
                <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50" data-testid="status-alerts">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  <span data-testid="text-alert-count">{activeAlerts} Alerts</span>
                </Badge>
              )}
              <span className="text-sm text-gray-500 dark:text-muted-foreground font-medium" data-testid="text-current-time">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-card border-gray-200 dark:border-border" data-testid="panel-workflow-engine">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Workflow Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MetricCard 
                  label="Active Workflows" 
                  value={data.workflows.active} 
                  icon={Activity} 
                  color="primary"
                  trend={12}
                />
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-card border-gray-200 dark:border-border" data-testid="panel-control-matrix">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Control Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MetricCard 
                  label="Controls Effective" 
                  value={`${data.compliance.controlsEffective}/${data.compliance.controlsTotal}`} 
                  icon={CheckCircle2} 
                  color="success"
                  trend={3}
                />
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-card border-gray-200 dark:border-border" data-testid="panel-risk-posture">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Posture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MetricCard 
                  label="High Risks" 
                  value={data.compliance.risksHigh} 
                  icon={Target} 
                  color="danger"
                  trend={-15}
                />
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-card border-gray-200 dark:border-border" data-testid="panel-process-queue">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Process Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MetricCard 
                  label="Avg Response" 
                  value={`${data.realtime.avgResponseTime}ms`} 
                  icon={BarChart3} 
                  color="primary"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card data-testid="panel-compliance-score-matrix">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  Compliance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  <ComplianceRing progress={data.compliance.overallScore} size={140} />
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-500">Overall Compliance</div>
                    <div className="text-xs text-[#266C92] font-medium mt-1">Target: 95%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="panel-coverage-analysis">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Coverage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Radar
                        name="Coverage"
                        dataKey="A"
                        stroke="#266C92"
                        fill="#266C92"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="panel-risk-distribution">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {riskDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="panel-activity-trends">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Activity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="workflows" stroke="#266C92" fill="#266C92" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="compliance" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="panel-risk-heat-matrix">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Risk Heat Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  <RiskHeatmapCell level={2} label="SOX" />
                  <RiskHeatmapCell level={4} label="GDPR" />
                  <RiskHeatmapCell level={1} label="PCI" />
                  <RiskHeatmapCell level={6} label="HIPAA" />
                  <RiskHeatmapCell level={3} label="SOC2" />
                  <RiskHeatmapCell level={5} label="ISO" />
                  <RiskHeatmapCell level={2} label="NIST" />
                  <RiskHeatmapCell level={8} label="CCPA" />
                  <RiskHeatmapCell level={3} label="FERPA" />
                  <RiskHeatmapCell level={1} label="FedRAMP" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card data-testid="panel-system-status">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3" data-testid="list-system-status">
                  <div className="flex items-center justify-between gap-2" data-testid="status-database">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Database Cluster</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs" data-testid="badge-database-status">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2" data-testid="status-compute">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Compute Nodes</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs" data-testid="badge-compute-status">8/8 Active</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2" data-testid="status-gateway">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">API Gateway</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs" data-testid="badge-gateway-status">Nominal</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2" data-testid="status-security">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Security Layer</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs" data-testid="badge-security-status">Secured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="panel-workflow-pipeline">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Workflow Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div data-testid="pipeline-active-executions">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-sm text-gray-600">Active Executions</span>
                      <span className="text-sm font-medium text-gray-900" data-testid="text-active-executions">{data.realtime.activeProcesses}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div data-testid="pipeline-queue-depth">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-sm text-gray-600">Queue Depth</span>
                      <span className="text-sm font-medium text-gray-900" data-testid="text-queue-depth">{data.realtime.queuedTasks}</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div data-testid="pipeline-throughput">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-sm text-gray-600">Throughput (ops/min)</span>
                      <span className="text-sm font-medium text-gray-900" data-testid="text-throughput">{data.realtime.throughput}</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="panel-alert-stream">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alert Stream
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2" data-testid="list-alerts">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-2 rounded-md bg-red-50 border border-red-100"
                    data-testid="alert-item-ctl-847"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">Control CTL-847 requires attestation</span>
                    <span className="text-xs text-gray-400">2m ago</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 p-2 rounded-md bg-amber-50 border border-amber-100"
                    data-testid="alert-item-rsk-023"
                  >
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">Risk RSK-023 assessment due</span>
                    <span className="text-xs text-gray-400">15m ago</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 p-2 rounded-md bg-emerald-50 border border-emerald-100"
                    data-testid="alert-item-aud-156"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">Audit AUD-156 completed</span>
                    <span className="text-xs text-gray-400">1h ago</span>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
