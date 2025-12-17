import { useQuery } from "@tanstack/react-query";
import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Shield, 
  TrendingUp, 
  Zap,
  Radio,
  Cpu,
  Database,
  Network,
  Eye,
  Target,
  BarChart3,
  PieChart,
  Layers,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  PieChart as RechartsPie,
  Pie
} from "recharts";

interface DashboardTelemetry {
  workflows: {
    total: number;
    active: number;
    completed: number;
    pending: number;
    errorRate: number;
  };
  compliance: {
    overallScore: number;
    controlsEffective: number;
    controlsTotal: number;
    risksHigh: number;
    risksMedium: number;
    risksLow: number;
  };
  realtime: {
    activeProcesses: number;
    queuedTasks: number;
    avgResponseTime: number;
    throughput: number;
  };
  trends: Array<{ time: string; workflows: number; compliance: number; risk: number }>;
}

function LCARSPanel({ 
  children, 
  title, 
  color = "teal",
  className = "",
  testId
}: { 
  children: React.ReactNode; 
  title: string; 
  color?: "teal" | "amber" | "rose" | "violet" | "emerald" | "cyan";
  className?: string;
  testId?: string;
}) {
  const colorClasses = {
    teal: "border-teal-500/50 bg-gradient-to-br from-teal-950/80 to-gray-950/90",
    amber: "border-amber-500/50 bg-gradient-to-br from-amber-950/80 to-gray-950/90",
    rose: "border-rose-500/50 bg-gradient-to-br from-rose-950/80 to-gray-950/90",
    violet: "border-violet-500/50 bg-gradient-to-br from-violet-950/80 to-gray-950/90",
    emerald: "border-emerald-500/50 bg-gradient-to-br from-emerald-950/80 to-gray-950/90",
    cyan: "border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-gray-950/90",
  };

  const accentColors = {
    teal: "bg-teal-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    cyan: "bg-cyan-500",
  };

  const textColors = {
    teal: "text-teal-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
    violet: "text-violet-400",
    emerald: "text-emerald-400",
    cyan: "text-cyan-400",
  };

  return (
    <div 
      className={`relative rounded-lg border-2 ${colorClasses[color]} backdrop-blur-sm overflow-hidden ${className}`}
      data-testid={testId || `panel-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1 flex gap-0.5">
        <div className={`flex-1 ${accentColors[color]} opacity-80`} />
        <div className={`w-8 ${accentColors[color]} opacity-60`} />
        <div className={`w-4 ${accentColors[color]} opacity-40`} />
      </div>
      <div className="pt-3 px-4 pb-4">
        <div className={`text-xs font-mono uppercase tracking-widest ${textColors[color]} mb-3 flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${accentColors[color]} animate-pulse`} />
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  color = "teal",
  testId
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: number;
  color?: "teal" | "amber" | "rose" | "emerald";
  testId?: string;
}) {
  const colorClasses = {
    teal: "text-teal-400 bg-teal-500/20",
    amber: "text-amber-400 bg-amber-500/20",
    rose: "text-rose-400 bg-rose-500/20",
    emerald: "text-emerald-400 bg-emerald-500/20",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
      data-testid={testId || `metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white font-mono" data-testid={`${testId || `metric-${label.toLowerCase().replace(/\s+/g, '-')}`}-value`}>{value}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
      </div>
      {trend !== undefined && (
        <div className={`ml-auto text-xs font-mono ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} data-testid={`${testId || `metric-${label.toLowerCase().replace(/\s+/g, '-')}`}-trend`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      )}
    </motion.div>
  );
}

function PulsingDot({ color = "teal" }: { color?: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 bg-${color}-500`} />
    </span>
  );
}

function ScanlineEffect() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent h-[2px] animate-scanline" />
    </div>
  );
}

function GlowingRing({ progress, size = 120, color = "teal" }: { progress: number; size?: number; color?: string }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color === "teal" ? "#14b8a6" : color === "emerald" ? "#10b981" : "#f59e0b"} />
            <stop offset="100%" stopColor={color === "teal" ? "#0d9488" : color === "emerald" ? "#059669" : "#d97706"} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white font-mono">{progress}%</span>
      </div>
    </div>
  );
}

function RiskHeatmapCell({ level, label }: { level: number; label: string }) {
  const getColor = (lvl: number) => {
    if (lvl <= 2) return "bg-emerald-500/80";
    if (lvl <= 4) return "bg-yellow-500/80";
    if (lvl <= 6) return "bg-amber-500/80";
    if (lvl <= 8) return "bg-orange-500/80";
    return "bg-rose-500/80";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${getColor(level)} w-full h-12 rounded flex items-center justify-center cursor-pointer transition-all`}
    >
      <span className="text-xs font-mono text-white/90">{label}</span>
    </motion.div>
  );
}

export default function IntelligenceHubPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlerts, setActiveAlerts] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: telemetry, isLoading } = useQuery<DashboardTelemetry>({
    queryKey: ["/api/dashboard/telemetry"],
    refetchInterval: 5000,
  });

  const defaultTelemetry: DashboardTelemetry = {
    workflows: { total: 10, active: 7, completed: 156, pending: 12, errorRate: 2.3 },
    compliance: { overallScore: 94, controlsEffective: 847, controlsTotal: 892, risksHigh: 3, risksMedium: 12, risksLow: 45 },
    realtime: { activeProcesses: 23, queuedTasks: 8, avgResponseTime: 142, throughput: 1247 },
    trends: [
      { time: "00:00", workflows: 45, compliance: 92, risk: 15 },
      { time: "04:00", workflows: 32, compliance: 93, risk: 14 },
      { time: "08:00", workflows: 67, compliance: 91, risk: 18 },
      { time: "12:00", workflows: 89, compliance: 94, risk: 12 },
      { time: "16:00", workflows: 78, compliance: 95, risk: 10 },
      { time: "20:00", workflows: 56, compliance: 94, risk: 11 },
    ],
  };

  const data = telemetry || defaultTelemetry;

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

  const stardate = useMemo(() => {
    const year = currentTime.getFullYear();
    const start = new Date(year, 0, 0);
    const diff = currentTime.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return `${year - 1700}.${day.toString().padStart(3, '0')}`;
  }, [currentTime]);

  return (
    <AppLayout 
      showHeader={true}
      showSideNav={true}
    >
      <div className="min-h-screen bg-gray-950 text-white overflow-auto relative">
        <ScanlineEffect />
        
        <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-sm border-b border-teal-500/30" data-testid="header-intelligence-hub">
          <div className="flex items-center justify-between px-6 py-3 gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-teal-400" />
                <span className="text-xl font-bold tracking-tight" data-testid="text-hub-title">AUDITBOARD INTELLIGENCE HUB</span>
              </div>
              <Badge variant="outline" className="border-teal-500/50 text-teal-400 font-mono text-xs" data-testid="badge-stardate">
                STARDATE {stardate}
              </Badge>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-mono" data-testid="status-systems">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400">SYSTEMS NOMINAL</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-mono text-amber-400" data-testid="status-alerts">
                <AlertTriangle className="w-4 h-4" />
                <span data-testid="text-alert-count">{activeAlerts} ALERTS</span>
              </div>
              <div className="text-lg font-mono text-gray-300" data-testid="text-current-time">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <LCARSPanel title="Workflow Engine" color="teal">
              <MetricCard 
                label="Active Workflows" 
                value={data.workflows.active} 
                icon={Zap} 
                color="teal"
                trend={12}
              />
            </LCARSPanel>
            <LCARSPanel title="Control Matrix" color="emerald">
              <MetricCard 
                label="Controls Effective" 
                value={`${data.compliance.controlsEffective}/${data.compliance.controlsTotal}`} 
                icon={Shield} 
                color="emerald"
                trend={3}
              />
            </LCARSPanel>
            <LCARSPanel title="Risk Posture" color="amber">
              <MetricCard 
                label="High Risks" 
                value={data.compliance.risksHigh} 
                icon={AlertTriangle} 
                color="amber"
                trend={-15}
              />
            </LCARSPanel>
            <LCARSPanel title="Process Queue" color="cyan">
              <MetricCard 
                label="Avg Response" 
                value={`${data.realtime.avgResponseTime}ms`} 
                icon={Clock} 
                color="teal"
              />
            </LCARSPanel>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <LCARSPanel title="Compliance Score Matrix" color="emerald" className="col-span-1">
              <div className="flex flex-col items-center justify-center py-4">
                <GlowingRing progress={data.compliance.overallScore} size={160} color="emerald" />
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Overall Compliance</div>
                  <div className="text-xs text-emerald-400 font-mono mt-1">TARGET: 95%</div>
                </div>
              </div>
            </LCARSPanel>

            <LCARSPanel title="Temporal Analysis" color="teal" className="col-span-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends}>
                    <defs>
                      <linearGradient id="colorWorkflows" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                    <Area type="monotone" dataKey="workflows" stroke="#14b8a6" fillOpacity={1} fill="url(#colorWorkflows)" />
                    <Area type="monotone" dataKey="compliance" stroke="#10b981" fillOpacity={1} fill="url(#colorCompliance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </LCARSPanel>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <LCARSPanel title="GRC Domain Coverage" color="violet" className="col-span-1">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 8 }} />
                    <Radar name="Coverage" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </LCARSPanel>

            <LCARSPanel title="Risk Distribution" color="amber" className="col-span-1">
              <div className="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-400">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </LCARSPanel>

            <LCARSPanel title="Risk Heat Matrix" color="rose" className="col-span-2">
              <div className="grid grid-cols-5 gap-1">
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
            </LCARSPanel>
          </div>

          <div className="grid grid-cols-6 gap-4">
            <LCARSPanel title="System Status" color="cyan" className="col-span-2" testId="panel-system-status">
              <div className="space-y-3" data-testid="list-system-status">
                <div className="flex items-center justify-between gap-2" data-testid="status-database">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">Database Cluster</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs" data-testid="badge-database-status">ONLINE</Badge>
                </div>
                <div className="flex items-center justify-between gap-2" data-testid="status-compute">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">Compute Nodes</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs" data-testid="badge-compute-status">8/8 ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between gap-2" data-testid="status-gateway">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">API Gateway</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs" data-testid="badge-gateway-status">NOMINAL</Badge>
                </div>
                <div className="flex items-center justify-between gap-2" data-testid="status-security">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">Security Layer</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs" data-testid="badge-security-status">SECURED</Badge>
                </div>
              </div>
            </LCARSPanel>

            <LCARSPanel title="Workflow Pipeline" color="teal" className="col-span-2" testId="panel-workflow-pipeline">
              <div className="space-y-3">
                <div data-testid="pipeline-active-executions">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-xs text-gray-400">Active Executions</span>
                    <span className="text-xs font-mono text-teal-400" data-testid="text-active-executions">{data.realtime.activeProcesses}</span>
                  </div>
                  <Progress value={75} className="h-2 bg-gray-800" />
                </div>
                <div data-testid="pipeline-queue-depth">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-xs text-gray-400">Queue Depth</span>
                    <span className="text-xs font-mono text-teal-400" data-testid="text-queue-depth">{data.realtime.queuedTasks}</span>
                  </div>
                  <Progress value={32} className="h-2 bg-gray-800" />
                </div>
                <div data-testid="pipeline-throughput">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-xs text-gray-400">Throughput (ops/min)</span>
                    <span className="text-xs font-mono text-teal-400" data-testid="text-throughput">{data.realtime.throughput}</span>
                  </div>
                  <Progress value={89} className="h-2 bg-gray-800" />
                </div>
              </div>
            </LCARSPanel>

            <LCARSPanel title="Alert Stream" color="rose" className="col-span-2" testId="panel-alert-stream">
              <div className="space-y-2 max-h-32 overflow-y-auto" data-testid="list-alerts">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-2 rounded bg-rose-500/10 border border-rose-500/30"
                  data-testid="alert-item-ctl-847"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="text-xs text-gray-300">Control CTL-847 requires attestation</span>
                  <span className="text-xs text-gray-500 ml-auto">2m ago</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/30"
                  data-testid="alert-item-rsk-023"
                >
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-gray-300">Risk RSK-023 assessment due</span>
                  <span className="text-xs text-gray-500 ml-auto">15m ago</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/30"
                  data-testid="alert-item-aud-156"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-gray-300">Audit AUD-156 completed</span>
                  <span className="text-xs text-gray-500 ml-auto">1h ago</span>
                </motion.div>
              </div>
            </LCARSPanel>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}</style>
    </AppLayout>
  );
}
