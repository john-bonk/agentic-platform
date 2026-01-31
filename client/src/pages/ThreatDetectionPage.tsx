/**
 * Threat Detection Page
 * 
 * Rich Zero Day threat detection dashboard with real-time threat monitoring,
 * attack vector analysis, and intrusion indicator tracking.
 */

import { useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Shield, AlertTriangle, Search, Activity, Target, 
  Zap, Globe, Server, Lock, Eye, Radio, Cpu, 
  TrendingUp, TrendingDown, Clock, ChevronRight,
  Filter, Download, RefreshCw, AlertCircle, CheckCircle2,
  XCircle, Wifi, Database, Bug, Skull
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell,
  PieChart, Pie
} from "recharts";

interface ThreatIndicator {
  id: string;
  name: string;
  type: "zero-day" | "malware" | "intrusion" | "anomaly" | "exfiltration";
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  detectedAt: string;
  status: "active" | "investigating" | "contained" | "resolved";
  affectedSystems: number;
  confidence: number;
}

const threatIndicators: ThreatIndicator[] = [
  { id: "t1", name: "Log4Shell Exploitation Attempt", type: "zero-day", severity: "critical", source: "Web Application Firewall", detectedAt: "2 min ago", status: "active", affectedSystems: 12, confidence: 98 },
  { id: "t2", name: "Suspicious PowerShell Execution", type: "intrusion", severity: "high", source: "Endpoint Detection", detectedAt: "15 min ago", status: "investigating", affectedSystems: 3, confidence: 87 },
  { id: "t3", name: "Unusual Outbound Traffic Pattern", type: "exfiltration", severity: "high", source: "Network Monitor", detectedAt: "32 min ago", status: "investigating", affectedSystems: 1, confidence: 76 },
  { id: "t4", name: "CVE-2024-21762 Scan Detected", type: "zero-day", severity: "critical", source: "IDS/IPS", detectedAt: "1 hr ago", status: "contained", affectedSystems: 8, confidence: 95 },
  { id: "t5", name: "Credential Stuffing Attack", type: "intrusion", severity: "medium", source: "Auth Gateway", detectedAt: "2 hrs ago", status: "resolved", affectedSystems: 0, confidence: 92 },
  { id: "t6", name: "Memory Injection Detected", type: "malware", severity: "high", source: "EDR Agent", detectedAt: "3 hrs ago", status: "contained", affectedSystems: 2, confidence: 88 },
  { id: "t7", name: "DNS Tunneling Activity", type: "exfiltration", severity: "medium", source: "DNS Monitor", detectedAt: "4 hrs ago", status: "investigating", affectedSystems: 1, confidence: 71 },
  { id: "t8", name: "Behavioral Anomaly - Admin Account", type: "anomaly", severity: "medium", source: "UEBA", detectedAt: "5 hrs ago", status: "investigating", affectedSystems: 1, confidence: 68 },
];

const threatTimeline = [
  { time: "00:00", threats: 2, blocked: 45, alerts: 12 },
  { time: "04:00", threats: 1, blocked: 38, alerts: 8 },
  { time: "08:00", threats: 5, blocked: 67, alerts: 23 },
  { time: "12:00", threats: 8, blocked: 89, alerts: 34 },
  { time: "16:00", threats: 12, blocked: 112, alerts: 45 },
  { time: "20:00", threats: 6, blocked: 78, alerts: 28 },
  { time: "Now", threats: 4, blocked: 52, alerts: 18 },
];

const attackVectors = [
  { vector: "Web Application", attempts: 234, blocked: 228, severity: 89 },
  { vector: "API Endpoints", attempts: 156, blocked: 151, severity: 78 },
  { vector: "Email Gateway", attempts: 89, blocked: 87, severity: 65 },
  { vector: "VPN/Remote", attempts: 67, blocked: 64, severity: 72 },
  { vector: "Cloud Services", attempts: 45, blocked: 43, severity: 58 },
];

const radarData = [
  { subject: "Network", A: 92, fullMark: 100 },
  { subject: "Endpoint", A: 88, fullMark: 100 },
  { subject: "Application", A: 75, fullMark: 100 },
  { subject: "Identity", A: 95, fullMark: 100 },
  { subject: "Data", A: 82, fullMark: 100 },
  { subject: "Cloud", A: 79, fullMark: 100 },
];

const threatTypeDistribution = [
  { name: "Zero-Day", value: 2, color: "#dc2626" },
  { name: "Intrusion", value: 2, color: "#f59e0b" },
  { name: "Malware", value: 1, color: "#8b5cf6" },
  { name: "Exfiltration", value: 2, color: "#3b82f6" },
  { name: "Anomaly", value: 1, color: "#10b981" },
];

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Badge className="bg-red-600 text-white">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    case "medium":
      return <Badge className="bg-amber-500 text-white">Medium</Badge>;
    case "low":
      return <Badge className="bg-green-500 text-white">Low</Badge>;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"><Radio className="w-3 h-3 mr-1 animate-pulse" />Active</Badge>;
    case "investigating":
      return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"><Eye className="w-3 h-3 mr-1" />Investigating</Badge>;
    case "contained":
      return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"><Lock className="w-3 h-3 mr-1" />Contained</Badge>;
    case "resolved":
      return <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"><CheckCircle2 className="w-3 h-3 mr-1" />Resolved</Badge>;
    default:
      return null;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "zero-day":
      return <Skull className="w-4 h-4 text-red-500" />;
    case "malware":
      return <Bug className="w-4 h-4 text-purple-500" />;
    case "intrusion":
      return <Target className="w-4 h-4 text-orange-500" />;
    case "exfiltration":
      return <Database className="w-4 h-4 text-blue-500" />;
    case "anomaly":
      return <Activity className="w-4 h-4 text-emerald-500" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

export default function ThreatDetectionPage() {
  const [activeView, setActiveView] = useState<"threats" | "vectors" | "timeline">("threats");
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "complete">("idle");
  
  const activeThreats = threatIndicators.filter(t => t.status === "active" || t.status === "investigating").length;
  const criticalThreats = threatIndicators.filter(t => t.severity === "critical").length;
  const containedToday = threatIndicators.filter(t => t.status === "contained" || t.status === "resolved").length;
  
  const handleRunScan = () => {
    setScanStatus("scanning");
    setTimeout(() => setScanStatus("complete"), 3000);
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <PageHeader 
          title="Threat Detection" 
          description="AI-powered Zero Day threat analysis and intrusion detection"
          actions={
            <div className="flex items-center gap-2">
              <Button 
                variant={scanStatus === "scanning" ? "outline" : "default"}
                className={scanStatus !== "scanning" ? "bg-[#266C92]" : ""}
                onClick={handleRunScan}
                disabled={scanStatus === "scanning"}
                data-testid="button-run-threat-scan"
              >
                {scanStatus === "scanning" ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Run Threat Scan
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" data-testid="button-filter-threats">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" data-testid="button-export-threats">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          }
        />

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-5 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card data-testid="metric-active-threats">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{activeThreats}</p>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">Active Threats</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card data-testid="metric-critical-threats">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Skull className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{criticalThreats}</p>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">Zero-Day Threats</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card data-testid="metric-blocked-attacks">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-foreground">487</p>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">Attacks Blocked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card data-testid="metric-contained-today">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{containedToday}</p>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">Contained Today</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card data-testid="metric-detection-rate">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-[#266C92]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-foreground">99.2%</p>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">Detection Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {scanStatus === "complete" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20" data-testid="scan-complete-alert">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800 dark:text-green-300">Threat scan complete</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Scanned 1,247 endpoints, 89 applications, 34 network segments. 2 new indicators detected.</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-green-300 dark:border-green-700" onClick={() => setScanStatus("idle")} data-testid="button-dismiss-scan-alert">
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Threat Activity Timeline</CardTitle>
                      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
                        <TabsList className="h-8">
                          <TabsTrigger value="threats" className="text-xs px-3" data-testid="tab-threats">Threats</TabsTrigger>
                          <TabsTrigger value="vectors" className="text-xs px-3" data-testid="tab-vectors">Vectors</TabsTrigger>
                          <TabsTrigger value="timeline" className="text-xs px-3" data-testid="tab-timeline">Timeline</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeView === "threats" && (
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={threatTimeline}>
                            <defs>
                              <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="time" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                            <Tooltip
                              contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                              labelStyle={{ color: "hsl(var(--foreground))" }}
                            />
                            <Area type="monotone" dataKey="blocked" stroke="#10b981" fill="url(#blockedGradient)" strokeWidth={2} name="Blocked" />
                            <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="url(#threatGradient)" strokeWidth={2} name="Active Threats" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {activeView === "vectors" && (
                      <div className="space-y-4">
                        {attackVectors.map((vector, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-32 text-sm font-medium text-gray-700 dark:text-foreground">{vector.vector}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Progress value={(vector.blocked / vector.attempts) * 100} className="h-2 flex-1" />
                                <span className="text-xs text-gray-500 dark:text-muted-foreground w-16">{vector.blocked}/{vector.attempts}</span>
                              </div>
                            </div>
                            <div className="w-20">
                              <Badge className={vector.severity > 80 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : vector.severity > 60 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"}>
                                {vector.severity}% Risk
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeView === "timeline" && (
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={threatTimeline}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="time" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                            <Tooltip
                              contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                              labelStyle={{ color: "hsl(var(--foreground))" }}
                            />
                            <Bar dataKey="alerts" fill="#266C92" radius={[4, 4, 0, 0]} name="Security Alerts" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Defense Posture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid className="stroke-border" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                          <Radar name="Coverage" dataKey="A" stroke="#266C92" fill="#266C92" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Threat Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[140px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={threatTypeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={50}
                            dataKey="value"
                            strokeWidth={2}
                            stroke="hsl(var(--card))"
                          >
                            {threatTypeDistribution.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                      {threatTypeDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600 dark:text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Active Threat Indicators</CardTitle>
                  <Badge variant="outline" className="text-gray-600 dark:text-muted-foreground">
                    {threatIndicators.length} Indicators
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {threatIndicators.map((threat) => (
                    <motion.div
                      key={threat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-4 p-3 rounded-lg border ${
                        threat.status === "active" 
                          ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20" 
                          : threat.status === "investigating"
                            ? "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10"
                            : "border-gray-100 dark:border-border bg-gray-50/50 dark:bg-muted/30"
                      }`}
                      data-testid={`threat-indicator-${threat.id}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-card border border-gray-200 dark:border-border flex items-center justify-center">
                        {getTypeIcon(threat.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-foreground text-sm truncate">{threat.name}</p>
                          {getSeverityBadge(threat.severity)}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Wifi className="w-3 h-3" />
                            {threat.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {threat.detectedAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Server className="w-3 h-3" />
                            {threat.affectedSystems} systems
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-muted-foreground">Confidence</p>
                          <p className="font-semibold text-sm text-gray-900 dark:text-foreground">{threat.confidence}%</p>
                        </div>
                        {getStatusBadge(threat.status)}
                        <Button size="sm" variant="ghost" data-testid={`button-investigate-${threat.id}`}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
