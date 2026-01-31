/**
 * Custom Workspace Home Page
 * 
 * Dynamically configured landing page that generates UNIQUE, NOVEL content
 * based on specific module selections. This creates a truly personalized
 * workspace experience with:
 * - Module-specific tasks interpolated from actual selections
 * - Dynamic metrics matching enabled modules
 * - AI quick-actions tailored to capability combinations
 * - Navigation that exactly matches the wizard preview
 */

import { useMemo } from "react";
import { AppLayout } from "@/components/layout";
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
  Plus,
  Calculator,
  Play,
  AlertCircle,
  Search,
  UserPlus,
  ClipboardCheck,
  Cpu,
  Cloud,
  FileText,
  CheckSquare,
  BarChart2,
  TrendingUp,
  Shield,
  Users,
  Activity,
  Calendar,
  Target,
  BookOpen,
  Gauge,
  Leaf,
  Brain,
  Lock,
  Scale,
  Zap,
  Eye,
  RefreshCw,
  Send,
  Download,
  Upload,
  Flag,
  Star,
} from "lucide-react";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import { productCapabilityBuckets, getQuickActionsForWorkspace, generateNavSections } from "@/config/workspaceWizardConfig";
import { archetypeTemplates, generateHomeContent, type ArchetypeTemplate, type HomeContent } from "@/config/homeViewConfig";

interface DynamicTask {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  category: string;
  bucketId: string;
  moduleId: string;
}

interface DynamicMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  bucketId: string;
  moduleId: string;
  color: string;
}

interface ModuleTaskTemplate {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
}

interface ModuleMetricTemplate {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

const moduleTaskTemplates: Record<string, Record<string, ModuleTaskTemplate[]>> = {
  "controls-management": {
    "control-library": [
      { title: "Update Control Library Mappings", description: "Review and update framework mappings for 12 controls", priority: "medium", status: "pending", dueDate: "3 days" },
      { title: "Archive Deprecated Controls", description: "Mark obsolete controls from legacy system", priority: "low", status: "pending", dueDate: "1 week" },
    ],
    "control-testing": [
      { title: "Complete Q4 Control Testing Cycle", description: "Execute test procedures for 28 SOX controls", priority: "high", status: "in-progress", dueDate: "2 days" },
      { title: "Review Test Evidence Quality", description: "Validate documentation for recent test submissions", priority: "medium", status: "pending", dueDate: "4 days" },
    ],
    "control-gaps": [
      { title: "Remediate Access Control Gap", description: "Implement MFA for privileged accounts", priority: "high", status: "in-progress", dueDate: "Today" },
      { title: "Gap Analysis Report", description: "Compile quarterly gap analysis for audit committee", priority: "medium", status: "pending", dueDate: "5 days" },
    ],
    "control-monitoring": [
      { title: "Configure Continuous Monitoring", description: "Set up automated control monitoring for 15 key controls", priority: "medium", status: "pending", dueDate: "1 week" },
    ],
  },
  "enterprise-risk": {
    "risk-register": [
      { title: "Update Strategic Risk Register", description: "Incorporate Q4 risk assessment findings", priority: "high", status: "pending", dueDate: "3 days" },
      { title: "Risk Owner Attestations Due", description: "Collect attestations from 8 risk owners", priority: "medium", status: "in-progress", dueDate: "5 days" },
    ],
    "risk-assessment": [
      { title: "Quarterly Risk Assessment", description: "Complete inherent and residual risk scoring", priority: "high", status: "in-progress", dueDate: "2 days" },
      { title: "Emerging Risk Analysis", description: "Evaluate new geopolitical risk scenarios", priority: "medium", status: "pending", dueDate: "1 week" },
    ],
    "risk-mitigation": [
      { title: "Treatment Plan Review", description: "Review effectiveness of 5 active treatment plans", priority: "medium", status: "pending", dueDate: "4 days" },
    ],
    "kri-monitoring": [
      { title: "KRI Threshold Breach Alert", description: "Investigate credit exposure KRI exceeding threshold", priority: "high", status: "pending", dueDate: "Today" },
      { title: "Monthly KRI Dashboard Update", description: "Refresh KRI visualizations with latest data", priority: "low", status: "pending", dueDate: "1 week" },
    ],
  },
  "audit-management": {
    "audit-universe": [
      { title: "Annual Universe Refresh", description: "Update entity risk ratings based on new data", priority: "medium", status: "pending", dueDate: "2 weeks" },
    ],
    "audit-planning": [
      { title: "Q1 Audit Plan Approval", description: "Finalize and submit annual audit plan", priority: "high", status: "in-progress", dueDate: "3 days" },
      { title: "Resource Allocation Review", description: "Optimize auditor assignments for upcoming engagements", priority: "medium", status: "pending", dueDate: "1 week" },
    ],
    "audit-execution": [
      { title: "IT Audit Fieldwork", description: "Complete testing for IT general controls", priority: "high", status: "in-progress", dueDate: "1 day" },
      { title: "Document Management Review", description: "Upload workpapers for operational audit", priority: "medium", status: "pending", dueDate: "4 days" },
    ],
    "audit-findings": [
      { title: "Draft Finding Discussion", description: "Schedule exit meeting with business stakeholders", priority: "high", status: "pending", dueDate: "2 days" },
      { title: "Overdue Finding Follow-up", description: "Escalate 3 findings past remediation date", priority: "high", status: "in-progress", dueDate: "Today" },
    ],
  },
  "cyber-it-compliance": {
    "it-controls": [
      { title: "ITGC Testing Cycle", description: "Complete testing for 18 IT general controls", priority: "high", status: "in-progress", dueDate: "3 days" },
      { title: "Application Control Review", description: "Validate automated controls in ERP system", priority: "medium", status: "pending", dueDate: "1 week" },
    ],
    "vulnerability-mgmt": [
      { title: "Critical CVE Remediation", description: "Patch 7 critical vulnerabilities from latest scan", priority: "high", status: "in-progress", dueDate: "Today" },
      { title: "Vulnerability Trend Analysis", description: "Generate monthly vulnerability metrics report", priority: "low", status: "pending", dueDate: "5 days" },
    ],
    "security-incidents": [
      { title: "Incident Post-Mortem", description: "Complete root cause analysis for phishing incident", priority: "high", status: "pending", dueDate: "2 days" },
      { title: "Update Playbook Procedures", description: "Revise ransomware response playbook", priority: "medium", status: "pending", dueDate: "1 week" },
    ],
    "access-reviews": [
      { title: "Privileged Access Review", description: "Complete quarterly PAM certification campaign", priority: "high", status: "in-progress", dueDate: "4 days" },
    ],
  },
  "information-technology": {
    "asset-inventory": [
      { title: "Hardware Reconciliation", description: "Match physical assets to CMDB records", priority: "medium", status: "pending", dueDate: "1 week" },
    ],
    "system-inventory": [
      { title: "Application Portfolio Review", description: "Update criticality ratings for 45 applications", priority: "medium", status: "pending", dueDate: "2 weeks" },
    ],
    "change-management": [
      { title: "Emergency Change Approval", description: "Review and approve 3 urgent change requests", priority: "high", status: "pending", dueDate: "Today" },
      { title: "CAB Meeting Preparation", description: "Compile change agenda for weekly CAB", priority: "medium", status: "in-progress", dueDate: "1 day" },
    ],
  },
  "regulatory-compliance": {
    "regulation-library": [
      { title: "Regulatory Update Analysis", description: "Assess impact of new SEC climate disclosure rules", priority: "high", status: "in-progress", dueDate: "3 days" },
    ],
    "obligations-mgmt": [
      { title: "Obligation Deadline Approaching", description: "4 regulatory filings due this month", priority: "high", status: "pending", dueDate: "5 days" },
    ],
    "sox-compliance": [
      { title: "Section 302 Certification", description: "Prepare materials for CFO/CEO certification", priority: "high", status: "in-progress", dueDate: "2 days" },
      { title: "SOX Walkthrough Updates", description: "Refresh process narratives for 6 key processes", priority: "medium", status: "pending", dueDate: "1 week" },
    ],
  },
  "third-party": {
    "vendor-inventory": [
      { title: "Vendor Data Refresh", description: "Update contact and contract info for 120 vendors", priority: "low", status: "pending", dueDate: "2 weeks" },
    ],
    "vendor-onboarding": [
      { title: "New Vendor Due Diligence", description: "Complete risk assessment for cloud provider", priority: "high", status: "in-progress", dueDate: "3 days" },
      { title: "Onboarding Queue Review", description: "Process 8 pending vendor intake requests", priority: "medium", status: "pending", dueDate: "4 days" },
    ],
    "vendor-assessments": [
      { title: "Critical Vendor Reassessment", description: "Annual review for Tier 1 payment processor", priority: "high", status: "pending", dueDate: "1 week" },
      { title: "Questionnaire Response Review", description: "Validate responses from 5 pending assessments", priority: "medium", status: "in-progress", dueDate: "2 days" },
    ],
  },
  "ai-governance": {
    "ai-inventory": [
      { title: "Model Registry Update", description: "Document 4 new ML models deployed this quarter", priority: "medium", status: "pending", dueDate: "5 days" },
    ],
    "ai-risk-assessment": [
      { title: "High-Risk Model Review", description: "Complete risk assessment for credit scoring model", priority: "high", status: "in-progress", dueDate: "3 days" },
      { title: "Bias Assessment Analysis", description: "Review fairness metrics for HR screening model", priority: "high", status: "pending", dueDate: "1 week" },
    ],
    "ai-validation": [
      { title: "Model Performance Validation", description: "Execute quarterly validation for fraud detection", priority: "high", status: "in-progress", dueDate: "2 days" },
    ],
  },
  "environmental-compliance": {
    "esg-metrics": [
      { title: "ESG Data Collection", description: "Gather Q4 sustainability metrics from 12 facilities", priority: "high", status: "in-progress", dueDate: "4 days" },
    ],
    "carbon-tracking": [
      { title: "Scope 1 & 2 Calculations", description: "Calculate and verify direct emissions data", priority: "high", status: "in-progress", dueDate: "3 days" },
      { title: "Scope 3 Supplier Survey", description: "Distribute emissions questionnaire to key suppliers", priority: "medium", status: "pending", dueDate: "2 weeks" },
    ],
    "net-zero": [
      { title: "Net Zero Progress Report", description: "Compile quarterly progress toward 2030 targets", priority: "medium", status: "pending", dueDate: "1 week" },
    ],
  },
};

const moduleMetricTemplates: Record<string, Record<string, ModuleMetricTemplate>> = {
  "controls-management": {
    "control-library": { label: "Total Controls", value: "234", change: "+12", trend: "up" },
    "control-testing": { label: "Test Completion", value: "87%", change: "+5%", trend: "up" },
    "control-gaps": { label: "Open Gaps", value: "8", change: "-2", trend: "down" },
    "control-monitoring": { label: "Alerts This Week", value: "3", change: "-1", trend: "down" },
  },
  "enterprise-risk": {
    "risk-register": { label: "Active Risks", value: "42", change: "+3", trend: "up" },
    "risk-assessment": { label: "Residual Risk Score", value: "Low", change: "-5pts", trend: "down" },
    "risk-mitigation": { label: "Treatment Plans", value: "18", change: "stable", trend: "neutral" },
    "kri-monitoring": { label: "KRIs Breached", value: "2", change: "+1", trend: "up" },
  },
  "audit-management": {
    "audit-universe": { label: "Auditable Entities", value: "156", change: "+8", trend: "up" },
    "audit-planning": { label: "Planned Audits", value: "24", change: "stable", trend: "neutral" },
    "audit-execution": { label: "Active Audits", value: "6", change: "-1", trend: "down" },
    "audit-findings": { label: "Open Findings", value: "12", change: "-3", trend: "down" },
  },
  "cyber-it-compliance": {
    "it-controls": { label: "ITGC Effectiveness", value: "94%", change: "+2%", trend: "up" },
    "vulnerability-mgmt": { label: "Critical Vulns", value: "7", change: "+2", trend: "up" },
    "security-incidents": { label: "Active Incidents", value: "2", change: "-1", trend: "down" },
    "access-reviews": { label: "Reviews Complete", value: "78%", change: "+12%", trend: "up" },
  },
  "information-technology": {
    "asset-inventory": { label: "Total Assets", value: "3,847", change: "+156", trend: "up" },
    "system-inventory": { label: "Applications", value: "245", change: "+8", trend: "up" },
    "change-management": { label: "Pending Changes", value: "14", change: "+3", trend: "up" },
  },
  "regulatory-compliance": {
    "regulation-library": { label: "Regulations Tracked", value: "67", change: "+4", trend: "up" },
    "obligations-mgmt": { label: "Due This Month", value: "8", change: "-2", trend: "down" },
    "sox-compliance": { label: "SOX Score", value: "A", change: "stable", trend: "neutral" },
  },
  "third-party": {
    "vendor-inventory": { label: "Total Vendors", value: "342", change: "+18", trend: "up" },
    "vendor-onboarding": { label: "Pending Intake", value: "12", change: "+4", trend: "up" },
    "vendor-assessments": { label: "Assessments Due", value: "23", change: "-5", trend: "down" },
  },
  "ai-governance": {
    "ai-inventory": { label: "AI Models", value: "23", change: "+4", trend: "up" },
    "ai-risk-assessment": { label: "High Risk Models", value: "5", change: "+1", trend: "up" },
    "ai-validation": { label: "Validation Rate", value: "92%", change: "+3%", trend: "up" },
  },
  "environmental-compliance": {
    "esg-metrics": { label: "ESG Score", value: "B+", change: "+1", trend: "up" },
    "carbon-tracking": { label: "Carbon Emissions", value: "12.4K", change: "-8%", trend: "down" },
    "net-zero": { label: "Progress to 2030", value: "34%", change: "+4%", trend: "up" },
  },
};

function generateTasksFromModules(
  selectedBuckets: string[],
  enabledModules: Record<string, string[]>
): DynamicTask[] {
  const tasks: DynamicTask[] = [];
  let taskIndex = 0;
  
  for (const bucketId of selectedBuckets) {
    const modules = enabledModules[bucketId] || [];
    const bucketTemplates = moduleTaskTemplates[bucketId] || {};
    const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
    
    for (const moduleId of modules) {
      const moduleTasks = bucketTemplates[moduleId] || [];
      const moduleInfo = bucket?.moduleCapabilities.find(m => m.id === moduleId);
      
      for (const template of moduleTasks) {
        tasks.push({
          id: `task-${bucketId}-${moduleId}-${taskIndex++}`,
          title: template.title,
          description: template.description,
          priority: template.priority,
          status: template.status,
          dueDate: template.dueDate,
          category: moduleInfo?.name || moduleId,
          bucketId,
          moduleId,
        });
      }
    }
  }
  
  return tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const statusOrder = { "in-progress": 0, pending: 1, completed: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

function generateMetricsFromModules(
  selectedBuckets: string[],
  enabledModules: Record<string, string[]>
): DynamicMetric[] {
  const metrics: DynamicMetric[] = [];
  
  for (const bucketId of selectedBuckets) {
    const modules = enabledModules[bucketId] || [];
    const bucketMetrics = moduleMetricTemplates[bucketId] || {};
    const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
    
    for (const moduleId of modules) {
      const template = bucketMetrics[moduleId];
      if (template) {
        metrics.push({
          id: `metric-${bucketId}-${moduleId}`,
          ...template,
          bucketId,
          moduleId,
          color: bucket?.color || "#266C92",
        });
      }
    }
  }
  
  return metrics.slice(0, 6);
}

const getActionIcon = (iconName: string) => {
  const icons: Record<string, JSX.Element> = {
    "plus": <Plus className="w-4 h-4" />,
    "play": <Play className="w-4 h-4" />,
    "calculator": <Calculator className="w-4 h-4" />,
    "alert-triangle": <AlertTriangle className="w-4 h-4" />,
    "alert-circle": <AlertCircle className="w-4 h-4" />,
    "search": <Search className="w-4 h-4" />,
    "user-plus": <UserPlus className="w-4 h-4" />,
    "clipboard-check": <ClipboardCheck className="w-4 h-4" />,
    "cpu": <Cpu className="w-4 h-4" />,
    "check-circle": <CheckCircle className="w-4 h-4" />,
    "cloud": <Cloud className="w-4 h-4" />,
    "file-text": <FileText className="w-4 h-4" />,
    "target": <Target className="w-4 h-4" />,
    "calendar": <Calendar className="w-4 h-4" />,
    "eye": <Eye className="w-4 h-4" />,
    "refresh": <RefreshCw className="w-4 h-4" />,
    "send": <Send className="w-4 h-4" />,
    "download": <Download className="w-4 h-4" />,
    "upload": <Upload className="w-4 h-4" />,
    "flag": <Flag className="w-4 h-4" />,
    "zap": <Zap className="w-4 h-4" />,
  };
  return icons[iconName] || <Sparkles className="w-4 h-4" />;
};

const getPriorityBadge = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive" className="text-[10px]">High</Badge>;
    case "medium":
      return <Badge variant="secondary" className="text-[10px]">Medium</Badge>;
    case "low":
      return <Badge variant="outline" className="text-[10px]">Low</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4" />;
    case "in-progress":
      return <Activity className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    case "in-progress":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-gray-100 dark:bg-muted text-gray-500 dark:text-muted-foreground";
  }
};

const getTrendIcon = (trend: "up" | "down" | "neutral") => {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    case "down":
      return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
    default:
      return <Activity className="w-3 h-3 text-gray-400" />;
  }
};

const getBucketIcon = (bucketId: string) => {
  const iconMap: Record<string, JSX.Element> = {
    "controls-management": <Shield className="w-4 h-4" />,
    "enterprise-risk": <BarChart2 className="w-4 h-4" />,
    "audit-management": <ClipboardCheck className="w-4 h-4" />,
    "cyber-it-compliance": <Lock className="w-4 h-4" />,
    "information-technology": <Cpu className="w-4 h-4" />,
    "regulatory-compliance": <Scale className="w-4 h-4" />,
    "third-party": <Users className="w-4 h-4" />,
    "ai-governance": <Brain className="w-4 h-4" />,
    "environmental-compliance": <Leaf className="w-4 h-4" />,
  };
  return iconMap[bucketId] || <CheckSquare className="w-4 h-4" />;
};

export default function CustomWorkspaceHome() {
  // Use currentWorkspace directly - the reactive state field, not the getter
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace);
  const refreshKey = useWorkspaceStore(state => state.refreshKey);
  const userPersona = useWorkspaceStore(state => state.userPersona);
  
  // Extract module config from current workspace
  const selectedBuckets = useMemo(() => {
    return currentWorkspace?.moduleConfig?.selectedBuckets || [];
  }, [currentWorkspace?.moduleConfig?.selectedBuckets, refreshKey]);
  
  const enabledModules = useMemo(() => {
    return currentWorkspace?.moduleConfig?.enabledModules || {};
  }, [currentWorkspace?.moduleConfig?.enabledModules, refreshKey]);
  
  // Get archetype configuration
  const selectedArchetype = useMemo<ArchetypeTemplate | null>(() => {
    const archetypeId = currentWorkspace?.homeViewConfig?.archetypeId;
    if (!archetypeId) return null;
    return archetypeTemplates.find(a => a.id === archetypeId) || null;
  }, [currentWorkspace?.homeViewConfig?.archetypeId, refreshKey]);
  
  // Generate dynamic content based on archetype and modules
  const archetypeContent = useMemo<HomeContent | null>(() => {
    if (!selectedArchetype) return null;
    return generateHomeContent(selectedArchetype.id, selectedBuckets);
  }, [selectedArchetype, selectedBuckets]);
  
  const tasks = useMemo(() => {
    const generatedTasks = generateTasksFromModules(selectedBuckets, enabledModules);
    return generatedTasks;
  }, [selectedBuckets, enabledModules]);
  
  const metrics = useMemo(
    () => generateMetricsFromModules(selectedBuckets, enabledModules),
    [selectedBuckets, enabledModules]
  );
  
  const quickActions = useMemo(
    () => getQuickActionsForWorkspace(selectedBuckets, enabledModules),
    [selectedBuckets, enabledModules]
  );
  
  const selectedBucketData = productCapabilityBuckets.filter(b => selectedBuckets.includes(b.id));
  
  const totalModules = Object.values(enabledModules).reduce((sum, arr) => sum + arr.length, 0);
  
  const taskStats = useMemo(() => {
    const highPriority = tasks.filter(t => t.priority === "high").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const dueToday = tasks.filter(t => t.dueDate === "Today").length;
    return { highPriority, inProgress, dueToday };
  }, [tasks]);
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6" data-testid="page-custom-workspace-home">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#266C92] via-[#1e5a7a] to-[#164557] p-6 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {userPersona === "Executive" ? "Welcome back!" : `Welcome back, ${userPersona}`}
                </h1>
                <p className="text-white/70 text-sm max-w-lg">
                  {currentWorkspace?.name} • {selectedBuckets.length} capabilities • {totalModules} active modules
                  {selectedArchetype && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-white/10 text-[10px] uppercase tracking-wide">
                      {selectedArchetype.name}
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold">{taskStats.highPriority}</p>
                  <p className="text-[10px] text-white/60 uppercase">High Priority</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                  <p className="text-[10px] text-white/60 uppercase">In Progress</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{taskStats.dueToday}</p>
                  <p className="text-[10px] text-white/60 uppercase">Due Today</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedBucketData.map(bucket => (
                <div 
                  key={bucket.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium"
                >
                  {getBucketIcon(bucket.id)}
                  <span>{bucket.name}</span>
                  <span className="text-white/50">
                    ({enabledModules[bucket.id]?.length || 0} modules)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Metrics Row */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-6 gap-3">
            {metrics.map((metric) => (
              <Card key={metric.id} className="relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: metric.color }}
                />
                <CardContent className="p-4 pl-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">{metric.label}</p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-[10px] ${
                        metric.trend === "up" ? "text-green-500" : 
                        metric.trend === "down" ? "text-red-500" : 
                        "text-gray-400"
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-foreground">{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-6">
          {/* Tasks Column */}
          <div className="col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <div>
                  <CardTitle className="text-lg font-semibold">My Tasks</CardTitle>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
                    Tasks across your {totalModules} enabled modules
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {tasks.filter(t => t.status === "in-progress").length} active
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {tasks.length} total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[420px]">
                  <div className="space-y-2">
                    {tasks.slice(0, 12).map(task => {
                      const bucket = productCapabilityBuckets.find(b => b.id === task.bucketId);
                      return (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors cursor-pointer group"
                          data-testid={`task-${task.id}`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm text-gray-900 dark:text-foreground">
                                {task.title}
                              </p>
                              {getPriorityBadge(task.priority)}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 line-clamp-1">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div 
                                className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full"
                                style={{ 
                                  backgroundColor: `${bucket?.color}15`,
                                  color: bucket?.color
                                }}
                              >
                                {getBucketIcon(task.bucketId)}
                                <span className="font-medium">{task.category}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{task.dueDate}</span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                    {tasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mb-4">
                          <CheckCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="font-medium">No tasks found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Enable more modules to see relevant tasks
                        </p>
                      </div>
                    )}
                    {tasks.length > 12 && (
                      <div className="pt-2 text-center">
                        <Button variant="outline" size="sm" className="gap-2">
                          View All {tasks.length} Tasks
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions & AI Panel Column */}
          <div className="space-y-4">
            {/* AI Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#266C92]" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.slice(0, 6).map(action => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-2.5 px-3 text-left"
                      data-testid={`action-${action.id}`}
                    >
                      {getActionIcon(action.icon)}
                      <span className="text-xs truncate">{action.label}</span>
                    </Button>
                  ))}
                </div>
                {quickActions.length === 0 && (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                    Actions will appear based on your modules
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* AB Assistant Panel */}
            <Card className="border-purple-200 dark:border-purple-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  AB Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 dark:text-muted-foreground">
                    Ask me about your workspace capabilities:
                  </p>
                  <div className="space-y-1.5">
                    {selectedBuckets.slice(0, 4).map(bucketId => {
                      const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
                      if (!bucket) return null;
                      
                      const moduleCount = enabledModules[bucketId]?.length || 0;
                      const prompts: Record<string, string> = {
                        "controls-management": `Summarize ${moduleCount} control modules status`,
                        "enterprise-risk": `Show top enterprise risks from ${moduleCount} modules`,
                        "audit-management": `List open findings across audit modules`,
                        "cyber-it-compliance": `Report critical security issues`,
                        "information-technology": `Show pending IT changes`,
                        "regulatory-compliance": `Upcoming compliance deadlines`,
                        "third-party": `Vendors requiring immediate attention`,
                        "ai-governance": `AI models pending validation`,
                        "environmental-compliance": `ESG performance summary`,
                      };
                      
                      return (
                        <Button
                          key={bucketId}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs text-gray-600 dark:text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 h-auto py-2"
                        >
                          <div 
                            className="w-5 h-5 rounded flex items-center justify-center shrink-0 mr-2"
                            style={{ backgroundColor: `${bucket.color}15`, color: bucket.color }}
                          >
                            {getBucketIcon(bucketId)}
                          </div>
                          <span className="truncate">"{prompts[bucketId]}"</span>
                        </Button>
                      );
                    })}
                  </div>
                  <Button className="w-full gap-2 bg-purple-600 text-white mt-2">
                    <Sparkles className="w-4 h-4" />
                    Ask AB Assistant
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Capability Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-muted flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  Capability Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedBucketData.slice(0, 5).map(bucket => {
                    const moduleCount = enabledModules[bucket.id]?.length || 0;
                    const totalModules = bucket.moduleCapabilities.length;
                    const percentage = Math.round((moduleCount / totalModules) * 100);
                    
                    return (
                      <div key={bucket.id} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${bucket.color}15`, color: bucket.color }}
                        >
                          {getBucketIcon(bucket.id)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-gray-700 dark:text-foreground truncate">
                              {bucket.name}
                            </p>
                            <span className="text-[10px] text-gray-500">{moduleCount}/{totalModules}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: bucket.color
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
