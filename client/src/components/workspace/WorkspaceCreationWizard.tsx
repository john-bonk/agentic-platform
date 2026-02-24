/**
 * Workspace Creation Wizard
 * 
 * Full-screen multi-stage wizard for creating custom workspaces with:
 * - Stage 1: Workspace naming
 * - Stage 2: Product capability bucket selection (9 buckets in 3x3 grid)
 * - Stage 3: Module capability configuration per bucket (9+ modules per bucket)
 * - Stage 4: Review with live navigation preview
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  ClipboardList,
  Scale,
  Lock,
  Users,
  Leaf,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  List,
  Calculator,
  Shield,
  Target,
  Calendar,
  FileText,
  AlertTriangle,
  BarChart,
  ShieldCheck,
  Gavel,
  CheckSquare,
  Bug,
  Radar,
  AlertCircle,
  ShieldAlert,
  Building,
  ClipboardCheck,
  Activity,
  BarChart2,
  Cloud,
  Database,
  Cpu,
  Brain,
  X,
  Library,
  UserCheck,
  GitBranch,
  Folder,
  Globe,
  FileSignature,
  CheckCircle,
  Clock,
  Server,
  Key,
  PieChart,
  GraduationCap,
  HardDrive,
  Layers,
  GitPullRequest,
  BookOpen,
  ShieldOff,
  Kanban,
  Book,
  EyeOff,
  Search,
  Send,
  UserPlus,
  Star,
  Network,
  UserMinus,
  MessageSquare,
  GitMerge,
  Thermometer,
  Truck,
  Trees,
  Droplet,
  Heart,
  Gauge,
  GitCompare,
  Presentation,
  Link,
  Bot,
  Wand2,
  Zap,
  RefreshCw,
} from "lucide-react";
import {
  productCapabilityBuckets,
  generateNavSections,
  generateModuleNavGroups,
  initializeEnabledModules,
  getCapabilityStats,
  type ProductCapabilityBucket,
  type ModuleCapability,
} from "@/config/workspaceWizardConfig";
import {
  archetypeTemplates,
  getRecommendedArchetype,
} from "@/config/homeViewConfig";
import { HomeViewStep } from "./HomeViewStep";
import type { SideNavSection, ModuleNavGroup } from "@/config/navigation";
import { type Workspace, useWorkspaceStore } from "@/lib/workspaceStore";

interface WorkspaceCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkspaceCreated?: (workspace: Workspace) => void;
}

type WizardStep = "name" | "buckets" | "modules" | "homeView" | "preview";

const stepOrder: WizardStep[] = ["name", "buckets", "modules", "homeView", "preview"];
const stepLabels: Record<WizardStep, string> = {
  name: "Name",
  buckets: "Modules",
  modules: "Capabilities",
  homeView: "Home View",
  preview: "Preview",
};

const getBucketIcon = (iconName: string, className: string = "w-6 h-6") => {
  const icons: Record<string, JSX.Element> = {
    "trending-up": <TrendingUp className={className} />,
    "clipboard-list": <ClipboardList className={className} />,
    "scale": <Scale className={className} />,
    "lock": <Lock className={className} />,
    "users": <Users className={className} />,
    "leaf": <Leaf className={className} />,
    "shield-check": <ShieldCheck className={className} />,
    "database": <Database className={className} />,
    "brain": <Brain className={className} />,
  };
  return icons[iconName] || <LayoutDashboard className={className} />;
};

const getModuleIcon = (iconName: string, className: string = "w-4 h-4") => {
  const icons: Record<string, JSX.Element> = {
    "list": <List className={className} />,
    "calculator": <Calculator className={className} />,
    "shield": <Shield className={className} />,
    "target": <Target className={className} />,
    "calendar": <Calendar className={className} />,
    "file-text": <FileText className={className} />,
    "alert-triangle": <AlertTriangle className={className} />,
    "bar-chart": <BarChart className={className} />,
    "shield-check": <ShieldCheck className={className} />,
    "gavel": <Gavel className={className} />,
    "check-square": <CheckSquare className={className} />,
    "bug": <Bug className={className} />,
    "radar": <Radar className={className} />,
    "alert-circle": <AlertCircle className={className} />,
    "shield-alert": <ShieldAlert className={className} />,
    "building": <Building className={className} />,
    "clipboard-check": <ClipboardCheck className={className} />,
    "activity": <Activity className={className} />,
    "bar-chart-2": <BarChart2 className={className} />,
    "cloud": <Cloud className={className} />,
    "library": <Library className={className} />,
    "user-check": <UserCheck className={className} />,
    "git-branch": <GitBranch className={className} />,
    "folder": <Folder className={className} />,
    "globe": <Globe className={className} />,
    "file-signature": <FileSignature className={className} />,
    "check-circle": <CheckCircle className={className} />,
    "users": <Users className={className} />,
    "clock": <Clock className={className} />,
    "server": <Server className={className} />,
    "key": <Key className={className} />,
    "pie-chart": <PieChart className={className} />,
    "graduation-cap": <GraduationCap className={className} />,
    "hard-drive": <HardDrive className={className} />,
    "layers": <Layers className={className} />,
    "git-pull-request": <GitPullRequest className={className} />,
    "book-open": <BookOpen className={className} />,
    "shield-off": <ShieldOff className={className} />,
    "kanban": <Kanban className={className} />,
    "book": <Book className={className} />,
    "eye-off": <EyeOff className={className} />,
    "search": <Search className={className} />,
    "send": <Send className={className} />,
    "user-plus": <UserPlus className={className} />,
    "star": <Star className={className} />,
    "network": <Network className={className} />,
    "user-minus": <UserMinus className={className} />,
    "cpu": <Cpu className={className} />,
    "message-square": <MessageSquare className={className} />,
    "git-merge": <GitMerge className={className} />,
    "scale": <Scale className={className} />,
    "thermometer": <Thermometer className={className} />,
    "truck": <Truck className={className} />,
    "trees": <Trees className={className} />,
    "droplet": <Droplet className={className} />,
    "heart": <Heart className={className} />,
    "gauge": <Gauge className={className} />,
    "git-compare": <GitCompare className={className} />,
    "presentation": <Presentation className={className} />,
    "link": <Link className={className} />,
  };
  return icons[iconName] || <LayoutDashboard className={className} />;
};

function StepIndicator({ currentStep, completedSteps }: { currentStep: WizardStep; completedSteps: Set<WizardStep> }) {
  return (
    <div className="flex items-center justify-center gap-2" data-testid="wizard-step-indicator">
      {stepOrder.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = completedSteps.has(step);
        const stepIndex = index + 1;
        
        return (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#266C92] text-white"
                  : isCompleted
                  ? "bg-[#266C92]/20 text-[#266C92] dark:bg-[#266C92]/30"
                  : "bg-gray-200 dark:bg-muted text-gray-500 dark:text-muted-foreground"
              }`}
              data-testid={`step-${step}`}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : stepIndex}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                isActive ? "text-[#266C92]" : "text-gray-500 dark:text-muted-foreground"
              }`}
            >
              {stepLabels[step]}
            </span>
            {index < stepOrder.length - 1 && (
              <ChevronRight className="w-5 h-5 mx-3 text-gray-300 dark:text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BucketCard({
  bucket,
  isSelected,
  onToggle,
}: {
  bucket: ProductCapabilityBucket;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative p-3 flex flex-col items-center justify-center rounded-xl border text-center transition-all hover-elevate active-elevate-2 ${
        isSelected
          ? "border-[#266C92] bg-[#266C92]/5 dark:bg-[#266C92]/10"
          : "border-gray-200 dark:border-border bg-white dark:bg-card"
      }`}
      data-testid={`bucket-${bucket.id}`}
    >
      {/* Content */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
            isSelected 
              ? "bg-[#266C92]/10 text-[#266C92]" 
              : "bg-gray-100 dark:bg-muted text-gray-400 dark:text-muted-foreground"
          }`}
        >
          {getBucketIcon(bucket.icon, "w-5 h-5")}
        </div>
        <div 
          className={`font-medium text-xs px-1 ${
            isSelected ? "text-[#266C92]" : "text-gray-700 dark:text-foreground"
          }`}
        >
          {bucket.name}
        </div>
        <div className="text-[9px] text-gray-400 dark:text-muted-foreground mt-0.5">
          {bucket.moduleCapabilities.length} capabilities
        </div>
      </div>
      
      {/* Selection checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 rounded-full bg-[#266C92] flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      )}
    </button>
  );
}

function ModuleCard({
  module,
  isEnabled,
  onToggle,
  bucketColor,
}: {
  module: ModuleCapability;
  isEnabled: boolean;
  onToggle: () => void;
  bucketColor: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 p-3 rounded-lg border text-left overflow-visible hover-elevate active-elevate-2 ${
        isEnabled
          ? "border-[#266C92] bg-[#266C92]/5 dark:bg-[#266C92]/10"
          : "border-gray-200 dark:border-border bg-white dark:bg-card"
      }`}
      data-testid={`module-${module.id}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isEnabled ? "text-[#266C92]" : "bg-gray-100 dark:bg-muted text-gray-400 dark:text-muted-foreground"
        }`}
        style={isEnabled ? { backgroundColor: `${bucketColor}15`, color: bucketColor } : {}}
      >
        {getModuleIcon(module.icon)}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm truncate ${isEnabled ? "text-[#266C92]" : "text-gray-900 dark:text-foreground"}`}>
          {module.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-muted-foreground truncate">
          {module.description}
        </div>
      </div>
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          isEnabled
            ? "border-[#266C92] bg-[#266C92]"
            : "border-gray-300 dark:border-border"
        }`}
      >
        {isEnabled && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function NavigationPreview({ 
  moduleGroups, 
  workspaceName 
}: { 
  moduleGroups: ModuleNavGroup[]; 
  workspaceName: string;
}) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(moduleGroups.filter(g => g.defaultExpanded).map(g => g.moduleId))
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(moduleGroups.flatMap(g => g.sections.filter(s => s.defaultExpanded).map(s => s.id)))
  );

  useEffect(() => {
    setExpandedModules(new Set(moduleGroups.filter(g => g.defaultExpanded).map(g => g.moduleId)));
    setExpandedSections(new Set(moduleGroups.flatMap(g => g.sections.filter(s => s.defaultExpanded).map(s => s.id))));
  }, [moduleGroups.length, moduleGroups.map(g => g.moduleId).join(",")]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const totalSections = moduleGroups.reduce((acc, g) => acc + g.sections.length, 0);

  return (
    <div
      className="relative bg-sidebar dark:bg-sidebar rounded-xl border border-border overflow-hidden h-full flex flex-col"
      data-testid="nav-preview"
    >
      {/* Panel header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar-accent/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#266C92] flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-sidebar-foreground truncate">{workspaceName || "Custom Workspace"}</div>
          <div className="text-[10px] text-sidebar-foreground/60">{moduleGroups.length} modules, {totalSections} sections</div>
        </div>
      </div>
      
      {/* Navigation with module-level grouping */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {moduleGroups.map(group => {
            const isModuleExpanded = expandedModules.has(group.moduleId);
            return (
              <div key={group.moduleId} className="border border-border rounded-lg overflow-hidden" data-testid={`preview-module-${group.moduleId}`}>
                {/* Module header */}
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover-elevate"
                  onClick={() => toggleModule(group.moduleId)}
                  data-testid={`preview-toggle-module-${group.moduleId}`}
                >
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isModuleExpanded ? "" : "-rotate-90"}`} />
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-gray-100 dark:bg-accent text-gray-600 dark:text-gray-300"
                  >
                    {getBucketIcon(group.moduleIcon, `w-3 h-3`)}
                  </div>
                  <span className="text-xs font-normal truncate text-gray-700 dark:text-foreground">
                    {group.moduleName}
                  </span>
                </button>
                
                {/* Module sections */}
                {isModuleExpanded && (
                  <div className="border-t border-border bg-sidebar-accent/30">
                    <div className="p-2 space-y-1">
                      {group.sections.map(section => {
                        const isSectionExpanded = section.collapsible ? expandedSections.has(section.id) : true;
                        return (
                          <div key={section.id} data-testid={`preview-section-${section.id}`}>
                            <div
                              className={`flex items-center gap-2 w-full px-2 py-1 text-left rounded-md ${section.collapsible ? "hover-elevate cursor-pointer" : ""}`}
                              onClick={section.collapsible ? () => toggleSection(section.id) : undefined}
                              onKeyDown={section.collapsible ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  toggleSection(section.id);
                                }
                              } : undefined}
                              role={section.collapsible ? "button" : undefined}
                              tabIndex={section.collapsible ? 0 : undefined}
                              data-testid={section.collapsible ? `preview-toggle-${section.id}` : undefined}
                            >
                              {section.collapsible && (
                                <ChevronDown className={`w-2.5 h-2.5 text-gray-400 transition-transform ${isSectionExpanded ? "" : "-rotate-90"}`} />
                              )}
                              <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {section.title}
                              </span>
                            </div>
                            {isSectionExpanded && (
                              <div className="ml-4 space-y-0.5">
                                {section.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between px-2 py-1 rounded-md text-[10px] text-gray-600 dark:text-gray-300"
                                    data-testid={`preview-item-${item.id}`}
                                  >
                                    <span className="truncate">{item.label}</span>
                                    {item.badge && (
                                      <span className="text-[8px] px-1 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ConfigurationSummary({
  workspaceName,
  selectedBuckets,
  enabledModules,
  stats,
}: {
  workspaceName: string;
  selectedBuckets: string[];
  enabledModules: Record<string, string[]>;
  stats: { totalModules: number; totalNavItems: number; bucketCount: number };
}) {
  const selectedBucketData = productCapabilityBuckets.filter(b => selectedBuckets.includes(b.id));
  // Default to all expanded
  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(
    new Set(selectedBuckets)
  );
  
  // Keep expanded state in sync with selected buckets
  useEffect(() => {
    setExpandedCapabilities(new Set(selectedBuckets));
  }, [selectedBuckets.join(",")]);
  
  // Calculate additional metrics
  const totalPossibleModules = selectedBucketData.reduce((acc, b) => acc + b.moduleCapabilities.length, 0);
  const moduleUtilization = totalPossibleModules > 0 ? Math.round((stats.totalModules / totalPossibleModules) * 100) : 0;
  
  const toggleCapability = (bucketId: string) => {
    setExpandedCapabilities(prev => {
      const next = new Set(prev);
      if (next.has(bucketId)) {
        next.delete(bucketId);
      } else {
        next.add(bucketId);
      }
      return next;
    });
  };
  
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4 h-full flex flex-col">
      {/* Header with workspace name and inline stats */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <p className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase tracking-wide">Workspace</p>
          <p className="font-semibold text-gray-900 dark:text-foreground">{workspaceName || "Untitled"}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="text-center">
            <span className="font-bold text-[#266C92]">{stats.bucketCount}</span>
            <span className="text-gray-400 ml-1">modules</span>
          </div>
          <div className="h-3 w-px bg-gray-200 dark:bg-border" />
          <div className="text-center">
            <span className="font-bold text-[#266C92]">{stats.totalModules}</span>
            <span className="text-gray-400 ml-1">capabilities</span>
          </div>
          <div className="h-3 w-px bg-gray-200 dark:bg-border" />
          <div className="text-center">
            <span className="font-bold text-[#266C92]">{stats.totalNavItems}</span>
            <span className="text-gray-400 ml-1">nav</span>
          </div>
        </div>
      </div>
      
      {/* Capability utilization bar */}
      <div className="mb-3 shrink-0">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-gray-500 dark:text-muted-foreground">Capability Utilization</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{moduleUtilization}% enabled</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#266C92] rounded-full transition-all duration-300"
            style={{ width: `${moduleUtilization}%` }}
          />
        </div>
      </div>
      
      {/* Module breakdown - expandable cards */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {selectedBucketData.map(bucket => {
          const modules = enabledModules[bucket.id] || [];
          const totalBucketModules = bucket.moduleCapabilities.length;
          const enabledCount = modules.length;
          const isExpanded = expandedCapabilities.has(bucket.id);
          
          return (
            <div 
              key={bucket.id} 
              className="rounded-lg bg-gray-50 dark:bg-muted/30"
            >
              <div 
                className="flex items-center gap-2 p-2 cursor-pointer rounded-lg hover-elevate"
                onClick={() => toggleCapability(bucket.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleCapability(bucket.id);
                  }
                }}
                data-testid={`toggle-capability-${bucket.id}`}
              >
                <div className="w-6 h-6 rounded bg-[#266C92]/10 flex items-center justify-center shrink-0">
                  <Layers className="w-3 h-3 text-[#266C92]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-800 dark:text-foreground truncate">{bucket.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-gray-500 dark:text-muted-foreground">
                        {enabledCount}/{totalBucketModules}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                    </div>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-2 pb-2 pt-0">
                  <div className="pl-8 space-y-1.5">
                    {modules.map(moduleId => {
                      const module = bucket.moduleCapabilities.find(m => m.id === moduleId);
                      return module ? (
                        <div 
                          key={moduleId} 
                          className="flex items-start gap-2 p-1.5 rounded bg-white dark:bg-muted border border-gray-100 dark:border-border"
                        >
                          <CheckCircle className="w-3 h-3 text-[#266C92] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-medium text-gray-700 dark:text-foreground">{module.name}</p>
                            <p className="text-[9px] text-gray-400 dark:text-muted-foreground line-clamp-1">{module.description}</p>
                          </div>
                        </div>
                      ) : null;
                    })}
                    {modules.length === 0 && (
                      <p className="text-[10px] text-gray-400 dark:text-muted-foreground italic">No capabilities enabled</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WorkspaceMember {
  id: string;
  email: string;
  role: string;
}

const WORKSPACE_ROLES = [
  "Org Admin",
  "Workspace Admin", 
  "Executive",
  "Manager",
  "Auditor",
  "Analyst",
  "Viewer",
];

// Role capability descriptions
const ROLE_CAPABILITIES: Record<string, string[]> = {
  "Org Admin": ["Full platform access", "User management", "Workspace creation", "Settings configuration", "All audit trails"],
  "Workspace Admin": ["Workspace configuration", "Member management", "Module settings", "Report generation", "Workflow creation"],
  "Executive": ["Dashboard access", "Executive reports", "Approval authority", "Read-only modules", "Board reporting"],
  "Manager": ["Team oversight", "Task assignment", "Workflow management", "Report access", "Control review"],
  "Auditor": ["Audit execution", "Evidence collection", "Finding documentation", "Control testing", "Report creation"],
  "Analyst": ["Data analysis", "Risk assessment", "Control monitoring", "Report drafting", "Issue tracking"],
  "Viewer": ["Read-only access", "Dashboard viewing", "Report viewing", "Limited navigation"],
};

function HomeViewSummary({ selectedArchetype }: { selectedArchetype: string }) {
  const archetype = archetypeTemplates.find(t => t.id === selectedArchetype);
  
  if (!archetype) {
    return (
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4 h-full flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-muted-foreground">No home view selected</p>
      </div>
    );
  }

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${archetype.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${archetype.layout.rows}, minmax(20px, 1fr))`,
    gridTemplateAreas: archetype.layout.areas,
    gap: "2px",
    height: "100%",
  };

  const getWidgetColor = (widgetType: string): string => {
    const colors: Record<string, string> = {
      "welcome-header": "bg-[#266C92]/20",
      "metrics-bar": "bg-emerald-500/20",
      "kpi-cards": "bg-emerald-500/20",
      "task-list": "bg-amber-500/20",
      "activity-feed": "bg-blue-500/20",
      "chart-area": "bg-purple-500/20",
      "trend-chart": "bg-purple-500/20",
      "quick-actions": "bg-cyan-500/20",
      "ai-command": "bg-pink-500/20",
      "timeline": "bg-orange-500/20",
      "status-grid": "bg-teal-500/20",
      "heat-map": "bg-red-500/20",
      "data-table": "bg-gray-500/20",
      "alerts-panel": "bg-rose-500/20",
      "progress-tracker": "bg-indigo-500/20",
      "calendar-view": "bg-sky-500/20",
      "workflow-queue": "bg-violet-500/20",
      "coverage-map": "bg-lime-500/20",
      "summary-card": "bg-[#266C92]/20",
      "navigation-shortcuts": "bg-slate-500/20",
    };
    return colors[widgetType] || "bg-gray-500/20";
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <div 
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${archetype.colorAccent}15`, color: archetype.colorAccent }}
        >
          <LayoutDashboard className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 dark:text-foreground truncate">{archetype.name}</p>
          <p className="text-[10px] text-gray-500 dark:text-muted-foreground">{archetype.persona} View</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border p-1.5">
        <div style={gridStyle}>
          {archetype.slots.map((slot) => (
            <div
              key={slot.id}
              style={{ gridArea: slot.gridArea }}
              className={`rounded ${getWidgetColor(slot.widgetType)}`}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-2 shrink-0">
        <p className="text-[9px] text-gray-500 dark:text-muted-foreground text-center">
          {archetype.slots.length} widgets &middot; {archetype.layout.columns}x{archetype.layout.rows} grid
        </p>
      </div>
    </div>
  );
}

function MembersSummary({ members }: { members: WorkspaceMember[] }) {
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(
    new Set(members.map(m => m.id))
  );
  
  // Keep expanded state in sync with members list (all expanded by default)
  useEffect(() => {
    setExpandedMembers(new Set(members.map(m => m.id)));
  }, [members.map(m => m.id).join(",")]);
  
  const toggleMember = (memberId: string) => {
    setExpandedMembers(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };
  
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <p className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase tracking-wide">Team</p>
          <p className="font-semibold text-gray-900 dark:text-foreground">Workspace Members</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="text-center">
            <span className="font-bold text-[#266C92]">{members.length}</span>
            <span className="text-gray-400 ml-1">{members.length === 1 ? 'member' : 'members'}</span>
          </div>
        </div>
      </div>
      
      {/* Member list - expandable cards */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {members.map(member => {
          const isExpanded = expandedMembers.has(member.id);
          const capabilities = ROLE_CAPABILITIES[member.role] || ["Custom access"];
          
          return (
            <div 
              key={member.id} 
              className="rounded-lg bg-gray-50 dark:bg-muted/30"
            >
              <div 
                className="flex items-center gap-2 p-2 cursor-pointer rounded-lg hover-elevate"
                onClick={() => toggleMember(member.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleMember(member.id);
                  }
                }}
                data-testid={`toggle-member-${member.id}`}
              >
                <div className="w-6 h-6 rounded-full bg-[#266C92]/10 flex items-center justify-center shrink-0">
                  <Users className="w-3 h-3 text-[#266C92]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-800 dark:text-foreground truncate">
                      {member.email || "Unnamed member"}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-[#266C92] font-medium bg-[#266C92]/10 px-1.5 py-0.5 rounded">
                        {member.role}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                    </div>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-2 pb-2 pt-0">
                  <div className="pl-8 space-y-1">
                    <p className="text-[9px] text-gray-400 dark:text-muted-foreground uppercase tracking-wide mb-1">Capabilities</p>
                    {capabilities.map((capability, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-2 p-1 rounded"
                      >
                        <CheckCircle className="w-2.5 h-2.5 text-[#266C92] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-600 dark:text-muted-foreground">{capability}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {members.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No members added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CapabilitiesStep({
  selectedBuckets,
  enabledModules,
  setEnabledModules,
  activeBucketTab,
  setActiveBucketTab,
  toggleModule,
}: {
  selectedBuckets: string[];
  enabledModules: Record<string, string[]>;
  setEnabledModules: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  activeBucketTab: string | null;
  setActiveBucketTab: (id: string) => void;
  toggleModule: (bucketId: string, moduleId: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToSection = (bucketId: string) => {
    setActiveBucketTab(bucketId);
    const el = sectionRefs.current[bucketId];
    const container = scrollContainerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const scrollOffset = elRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({ top: scrollOffset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const threshold = containerRect.top + 100;
      let closest: string | null = null;
      let closestDist = Infinity;

      for (const bucketId of selectedBuckets) {
        const el = sectionRefs.current[bucketId];
        if (el) {
          const elRect = el.getBoundingClientRect();
          const dist = Math.abs(elRect.top - threshold);
          if (dist < closestDist) {
            closestDist = dist;
            closest = bucketId;
          }
        }
      }

      if (closest && closest !== activeBucketTab) {
        setActiveBucketTab(closest);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedBuckets, activeBucketTab, setActiveBucketTab]);

  const selectedBucketData = selectedBuckets
    .map(id => productCapabilityBuckets.find(b => b.id === id))
    .filter(Boolean) as ProductCapabilityBucket[];

  return (
    <div className="h-full flex">
      <div className="w-56 border-r border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/30 p-4 flex flex-col">
        <Label className="text-xs text-gray-500 dark:text-muted-foreground uppercase mb-3 block">
          Modules
        </Label>
        <div className="space-y-1 flex-1 overflow-y-auto">
          {selectedBuckets.map(bucketId => {
            const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
            if (!bucket) return null;
            const moduleCount = enabledModules[bucketId]?.length || 0;

            return (
              <button
                key={bucketId}
                onClick={() => scrollToSection(bucketId)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeBucketTab === bucketId
                    ? "bg-[#266C92]/10 text-[#266C92]"
                    : "text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted"
                }`}
                data-testid={`tab-${bucketId}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  activeBucketTab === bucketId
                    ? "bg-[#266C92]/15 text-[#266C92]"
                    : "bg-gray-100 dark:bg-muted text-gray-500"
                }`}>
                  {getBucketIcon(bucket.icon, "w-3.5 h-3.5")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{bucket.navShortName || bucket.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-muted-foreground">
                    {moduleCount}/{bucket.moduleCapabilities.length}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-8 max-w-4xl mx-auto">
          {selectedBucketData.map(bucket => {
            const bucketModules = enabledModules[bucket.id] || [];
            const allModuleIds = bucket.moduleCapabilities.map(m => m.id);
            const allSelected = bucketModules.length === allModuleIds.length;

            return (
              <div
                key={bucket.id}
                ref={el => { sectionRefs.current[bucket.id] = el; }}
                data-testid={`capabilities-section-${bucket.id}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${bucket.color}15`, color: bucket.color }}
                  >
                    {getBucketIcon(bucket.icon, "w-4.5 h-4.5")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-foreground">{bucket.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">{bucket.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (allSelected) {
                        setEnabledModules(prev => ({ ...prev, [bucket.id]: [] }));
                      } else {
                        setEnabledModules(prev => ({ ...prev, [bucket.id]: allModuleIds }));
                      }
                    }}
                    data-testid={`button-toggle-all-${bucket.id}`}
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {bucket.moduleCapabilities.map(module => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      isEnabled={bucketModules.includes(module.id)}
                      onToggle={() => toggleModule(bucket.id, module.id)}
                      bucketColor={bucket.color}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {selectedBucketData.length === 0 && (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-muted-foreground">
              <p className="text-sm">No modules selected. Go back and select modules first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type AIStage = "greeting" | "name" | "members" | "modules" | "capabilities" | "homeview" | "confirm";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  options?: ChatOption[];
  multiSelect?: boolean;
  selectedOptions?: string[];
  inputType?: "text" | "none";
  inputPlaceholder?: string;
  stage: AIStage;
  rendered?: boolean;
}

interface ChatOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  recommended?: boolean;
}

const ROLE_RECOMMENDATIONS: Record<string, string[]> = {
  "risk": ["Org Admin", "Executive", "Manager", "Analyst"],
  "audit": ["Org Admin", "Auditor", "Manager", "Analyst"],
  "security": ["Org Admin", "Manager", "Analyst", "Viewer"],
  "compliance": ["Org Admin", "Executive", "Auditor", "Analyst"],
  "default": ["Org Admin", "Executive", "Manager", "Analyst"],
};

const MODULE_KEYWORDS: Record<string, string[]> = {
  "controls-management": ["controls", "internal controls", "sox", "testing", "control framework"],
  "enterprise-risk": ["risk", "erm", "enterprise risk", "risk assessment", "risk management"],
  "audit-management": ["audit", "internal audit", "audit plan", "fieldwork", "findings"],
  "cyber-it-compliance": ["cyber", "security", "it compliance", "infosec", "cybersecurity", "vulnerabilities"],
  "information-technology": ["it", "technology", "it management", "assets", "infrastructure"],
  "regulatory-compliance": ["regulatory", "compliance", "regulations", "policy", "frameworks"],
  "third-party": ["vendor", "third party", "supplier", "tprm", "vendor risk"],
  "ai-governance": ["ai", "artificial intelligence", "ai governance", "machine learning", "model risk"],
  "environmental-compliance": ["esg", "environmental", "sustainability", "climate", "carbon"],
};

function getModuleRecommendations(description: string): string[] {
  const lower = description.toLowerCase();
  const matches: string[] = [];
  for (const [bucketId, keywords] of Object.entries(MODULE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matches.push(bucketId);
    }
  }
  if (matches.length === 0) {
    return ["controls-management", "enterprise-risk", "audit-management"];
  }
  return matches;
}

function getRoleSetForModules(modules: string[]): string[] {
  if (modules.some(m => m === "audit-management")) return ROLE_RECOMMENDATIONS["audit"];
  if (modules.some(m => m === "cyber-it-compliance" || m === "information-technology")) return ROLE_RECOMMENDATIONS["security"];
  if (modules.some(m => m === "regulatory-compliance")) return ROLE_RECOMMENDATIONS["compliance"];
  if (modules.some(m => m === "enterprise-risk")) return ROLE_RECOMMENDATIONS["risk"];
  return ROLE_RECOMMENDATIONS["default"];
}

function AIAssistantFlow({
  workspaceName,
  setWorkspaceName,
  workspaceMembers,
  setWorkspaceMembers,
  selectedBuckets,
  setSelectedBuckets,
  enabledModules,
  setEnabledModules,
  selectedArchetype,
  setSelectedArchetype,
  onComplete,
}: {
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  workspaceMembers: WorkspaceMember[];
  setWorkspaceMembers: React.Dispatch<React.SetStateAction<WorkspaceMember[]>>;
  selectedBuckets: string[];
  setSelectedBuckets: React.Dispatch<React.SetStateAction<string[]>>;
  enabledModules: Record<string, string[]>;
  setEnabledModules: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  selectedArchetype: string;
  setSelectedArchetype: (id: string) => void;
  onComplete: () => void;
}) {
  const [currentStage, setCurrentStage] = useState<AIStage>("greeting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingSelections, setPendingSelections] = useState<Set<string>>(new Set());
  const [showConfirmPanel, setShowConfirmPanel] = useState(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const addAIMessage = useCallback((text: string, stage: AIStage, options?: ChatOption[], multiSelect?: boolean, inputType?: "text" | "none", inputPlaceholder?: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}-${Math.random()}`,
        sender: "ai",
        text,
        options,
        multiSelect,
        inputType,
        inputPlaceholder,
        stage,
      }]);
      setIsTyping(false);
      scrollToBottom();
    }, 600);
  }, [scrollToBottom]);

  const addUserMessage = useCallback((text: string, stage: AIStage) => {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: "user",
      text,
      stage,
    }]);
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) {
      addAIMessage(
        "Hi! I'm your workspace assistant. I'll help you set up a workspace tailored to your team's needs. Let's start — what would you like to call this workspace?",
        "greeting",
        undefined,
        false,
        "text",
        "e.g., Enterprise Risk & Compliance"
      );
    }
  }, []);

  const advanceToMembers = useCallback((name: string) => {
    setWorkspaceName(name);
    addUserMessage(name, "name");
    
    setTimeout(() => {
      const suggestedRoles = getRoleSetForModules([]);
      addAIMessage(
        `Great name! Now let's set up your team for "${name}". I've pre-populated recommended members based on common workspace patterns. You can adjust these, or tell me about your team structure.`,
        "members",
        suggestedRoles.map(role => ({
          id: role,
          label: role,
          description: (ROLE_CAPABILITIES[role] || []).slice(0, 2).join(", "),
          recommended: true,
        })),
        true,
        "text",
        "Add custom member email, or type 'next' to continue"
      );
      setPendingSelections(new Set(suggestedRoles));
      setCurrentStage("members");
    }, 300);
  }, [addAIMessage, addUserMessage, setWorkspaceName]);

  const advanceToModules = useCallback(() => {
    addUserMessage(
      workspaceMembers.length > 0
        ? `Team set: ${workspaceMembers.map(m => `${m.email} (${m.role})`).join(", ")}`
        : "Using default team setup",
      "members"
    );
    
    setTimeout(() => {
      const bucketOptions: ChatOption[] = productCapabilityBuckets.map(b => ({
        id: b.id,
        label: b.name,
        description: b.description,
        icon: b.icon,
        recommended: ["controls-management", "enterprise-risk", "audit-management"].includes(b.id),
      }));
      
      addAIMessage(
        "Now let's choose the product modules for your workspace. What areas does your team focus on? Select all that apply, or describe your team's work and I'll recommend the right modules.",
        "modules",
        bucketOptions,
        true,
        "text",
        "Describe your focus, e.g. 'We do SOX audits and risk assessments'"
      );
      setPendingSelections(new Set());
      setCurrentStage("modules");
    }, 300);
  }, [addAIMessage, addUserMessage, workspaceMembers]);

  const advanceToCapabilities = useCallback((buckets: string[]) => {
    const bucketNames = buckets.map(id => 
      productCapabilityBuckets.find(b => b.id === id)?.name || id
    ).join(", ");
    addUserMessage(`Selected modules: ${bucketNames}`, "modules");

    setSelectedBuckets(buckets);
    const initialModules = initializeEnabledModules(buckets);
    setEnabledModules(initialModules);

    setTimeout(() => {
      const totalCaps = buckets.reduce((sum, bId) => {
        const bucket = productCapabilityBuckets.find(b => b.id === bId);
        return sum + (bucket?.moduleCapabilities.length || 0);
      }, 0);
      const enabledCount = Object.values(initialModules).reduce((sum, arr) => sum + arr.length, 0);

      const capOptions: ChatOption[] = buckets.flatMap(bId => {
        const bucket = productCapabilityBuckets.find(b => b.id === bId);
        if (!bucket) return [];
        return bucket.moduleCapabilities.map(mc => ({
          id: `${bId}::${mc.id}`,
          label: mc.name,
          description: `${bucket.navShortName} — ${mc.description}`,
          recommended: mc.defaultEnabled,
        }));
      });

      const defaultEnabled = new Set(
        buckets.flatMap(bId => (initialModules[bId] || []).map(mId => `${bId}::${mId}`))
      );
      setPendingSelections(defaultEnabled);

      addAIMessage(
        `I've enabled ${enabledCount} of ${totalCaps} available capabilities across your ${buckets.length} modules. The recommended ones are pre-selected. You can toggle any on/off, or type 'all' to enable everything.`,
        "capabilities",
        capOptions,
        true,
        "text",
        "Type 'all' to enable everything, or 'next' to continue"
      );
      setCurrentStage("capabilities");
    }, 300);
  }, [addAIMessage, addUserMessage, setSelectedBuckets, setEnabledModules]);

  const advanceToHomeView = useCallback((buckets: string[]) => {
    const enabledCount = Object.values(enabledModules).reduce((sum, arr) => sum + arr.length, 0);
    addUserMessage(`Configured ${enabledCount} capabilities`, "capabilities");

    setTimeout(() => {
      const recommended = getRecommendedArchetype(buckets);
      const archOptions: ChatOption[] = archetypeTemplates.map(t => ({
        id: t.id,
        label: t.name,
        description: `${t.persona} — ${t.description}`,
        recommended: t.id === recommended,
      }));

      addAIMessage(
        `Almost done! Let's pick the right home view layout for your workspace. Based on your modules, I recommend the "${archetypeTemplates.find(t => t.id === recommended)?.name}" layout. Choose one or I'll use the recommendation.`,
        "homeview",
        archOptions,
        false,
        "text",
        "Type 'recommended' to use my suggestion, or pick one"
      );
      setPendingSelections(new Set([recommended]));
      setCurrentStage("homeview");
    }, 300);
  }, [addAIMessage, addUserMessage, enabledModules]);

  const advanceToConfirm = useCallback((archetypeId: string) => {
    const arch = archetypeTemplates.find(t => t.id === archetypeId);
    addUserMessage(`Home view: ${arch?.name || archetypeId}`, "homeview");
    setSelectedArchetype(archetypeId);

    setTimeout(() => {
      setShowConfirmPanel(true);
      addAIMessage(
        `Here's your workspace summary. Everything look good? Click "Create Workspace" to build it, or tell me what you'd like to change.`,
        "confirm",
        [
          { id: "create", label: "Create Workspace", description: "Build this workspace now", recommended: true },
          { id: "restart", label: "Start Over", description: "Reset and begin again" },
        ],
        false,
        "text",
        "Tell me what to change, or click Create"
      );
      setCurrentStage("confirm");
    }, 300);
  }, [addAIMessage, addUserMessage, setSelectedArchetype]);

  const handleOptionToggle = useCallback((optionId: string) => {
    setPendingSelections(prev => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  }, []);

  const handleSingleSelect = useCallback((optionId: string) => {
    setPendingSelections(new Set([optionId]));
  }, []);

  const handleConfirmSelections = useCallback(() => {
    const selected = Array.from(pendingSelections);
    
    if (currentStage === "members") {
      const memberRoles = selected;
      const roleMembers: WorkspaceMember[] = memberRoles.map((role, i) => {
        const existing = workspaceMembers.find(m => m.role === role);
        return existing || {
          id: `ai-member-${Date.now()}-${i}`,
          email: `${role.toLowerCase().replace(/\s+/g, ".")}@company.org`,
          role,
        };
      });
      const customMembers = workspaceMembers.filter(m => 
        !memberRoles.includes(m.role) && m.email && !m.email.endsWith("@company.org")
      );
      setWorkspaceMembers([...roleMembers, ...customMembers]);
      advanceToModules();
    } else if (currentStage === "modules") {
      advanceToCapabilities(selected);
    } else if (currentStage === "capabilities") {
      const newEnabledModules: Record<string, string[]> = {};
      for (const key of selected) {
        const [bucketId, moduleId] = key.split("::");
        if (!newEnabledModules[bucketId]) newEnabledModules[bucketId] = [];
        newEnabledModules[bucketId].push(moduleId);
      }
      setEnabledModules(newEnabledModules);
      advanceToHomeView(selectedBuckets);
    } else if (currentStage === "homeview") {
      const archId = selected[0] || "auditboard-default";
      advanceToConfirm(archId);
    } else if (currentStage === "confirm") {
      if (selected.includes("create")) {
        onComplete();
      } else if (selected.includes("restart")) {
        setMessages([]);
        setCurrentStage("greeting");
        setPendingSelections(new Set());
        setShowConfirmPanel(false);
        setWorkspaceName("");
        setSelectedBuckets([]);
        setEnabledModules({});
        setSelectedArchetype("auditboard-default");
        setWorkspaceMembers([
          { id: "1", email: "admin@company.org", role: "Org Admin" },
          { id: "2", email: "exec@company.org", role: "Executive" },
          { id: "3", email: "manager@company.org", role: "Manager" },
          { id: "4", email: "analyst@company.org", role: "Analyst" },
        ]);
        setTimeout(() => {
          addAIMessage(
            "Let's start fresh! What would you like to call your workspace?",
            "greeting",
            undefined,
            false,
            "text",
            "e.g., Enterprise Risk & Compliance"
          );
        }, 100);
      }
    }
  }, [currentStage, pendingSelections, advanceToModules, advanceToCapabilities, advanceToHomeView, advanceToConfirm, onComplete, workspaceMembers, selectedBuckets, setWorkspaceMembers, setEnabledModules, addAIMessage]);

  const handleSendMessage = useCallback(() => {
    const text = userInput.trim();
    if (!text) return;
    setUserInput("");

    if (currentStage === "greeting" || currentStage === "name") {
      advanceToMembers(text);
    } else if (currentStage === "members") {
      if (text.toLowerCase() === "next" || text.toLowerCase() === "continue") {
        const selected = Array.from(pendingSelections);
        const roleMembers: WorkspaceMember[] = selected.map((role, i) => {
          const existing = workspaceMembers.find(m => m.role === role);
          return existing || {
            id: `ai-member-${Date.now()}-${i}`,
            email: `${role.toLowerCase().replace(/\s+/g, ".")}@company.org`,
            role,
          };
        });
        const customMembers = workspaceMembers.filter(m => 
          !selected.includes(m.role) && m.email && !m.email.endsWith("@company.org")
        );
        setWorkspaceMembers([...roleMembers, ...customMembers]);
        advanceToModules();
      } else if (text.includes("@")) {
        const newMember: WorkspaceMember = {
          id: `ai-member-${Date.now()}`,
          email: text,
          role: "Analyst",
        };
        setWorkspaceMembers(prev => [...prev, newMember]);
        addUserMessage(`Added ${text}`, "members");
        setTimeout(() => {
          addAIMessage(
            `Added ${text} as Analyst. Add more members or type 'next' to continue.`,
            "members",
            undefined,
            false,
            "text",
            "Add another email, or type 'next'"
          );
        }, 200);
      } else {
        addUserMessage(text, "members");
        setTimeout(() => {
          addAIMessage(
            `I see. Select the roles above, add member emails, or type 'next' to continue with the current team setup.`,
            "members",
            undefined,
            false,
            "text",
            "Type 'next' to continue"
          );
        }, 200);
      }
    } else if (currentStage === "modules") {
      addUserMessage(text, "modules");
      const recommended = getModuleRecommendations(text);
      setPendingSelections(new Set(recommended));
      setTimeout(() => {
        const names = recommended.map(id => productCapabilityBuckets.find(b => b.id === id)?.name).filter(Boolean).join(", ");
        addAIMessage(
          `Based on "${text}", I recommend: ${names}. I've selected these for you. Adjust if needed, then click the confirm button to proceed.`,
          "modules",
          undefined,
          false,
          "text",
          "Type 'next' to confirm selections"
        );
      }, 200);
    } else if (currentStage === "capabilities") {
      if (text.toLowerCase() === "all") {
        const allCaps = new Set(
          selectedBuckets.flatMap(bId => {
            const bucket = productCapabilityBuckets.find(b => b.id === bId);
            return bucket ? bucket.moduleCapabilities.map(mc => `${bId}::${mc.id}`) : [];
          })
        );
        setPendingSelections(allCaps);
        addUserMessage("Enable all capabilities", "capabilities");
        setTimeout(() => {
          addAIMessage(
            `All capabilities enabled! Click confirm to proceed, or deselect any you don't need.`,
            "capabilities",
            undefined,
            false,
            "text",
            "Type 'next' to confirm"
          );
        }, 200);
      } else if (text.toLowerCase() === "next" || text.toLowerCase() === "continue") {
        handleConfirmSelections();
      } else {
        addUserMessage(text, "capabilities");
        setTimeout(() => {
          addAIMessage(
            `Toggle capabilities above, type 'all' to enable everything, or 'next' to continue.`,
            "capabilities"
          );
        }, 200);
      }
    } else if (currentStage === "homeview") {
      if (text.toLowerCase().includes("recommend")) {
        handleConfirmSelections();
      } else {
        addUserMessage(text, "homeview");
        const match = archetypeTemplates.find(t => 
          t.name.toLowerCase().includes(text.toLowerCase()) ||
          t.tags.some(tag => text.toLowerCase().includes(tag))
        );
        if (match) {
          setPendingSelections(new Set([match.id]));
          setTimeout(() => {
            addAIMessage(
              `Selected "${match.name}". Click confirm to proceed.`,
              "homeview"
            );
          }, 200);
        } else {
          setTimeout(() => {
            addAIMessage(
              `I couldn't find that layout. Please select one from the options above, or type 'recommended'.`,
              "homeview"
            );
          }, 200);
        }
      }
    } else if (currentStage === "confirm") {
      addUserMessage(text, "confirm");
      setTimeout(() => {
        addAIMessage(
          `Click "Create Workspace" when you're ready, or "Start Over" to begin again.`,
          "confirm"
        );
      }, 200);
    }
  }, [userInput, currentStage, advanceToMembers, advanceToModules, handleConfirmSelections, addUserMessage, addAIMessage, pendingSelections, selectedBuckets, workspaceMembers, setWorkspaceMembers]);

  const stats = useMemo(() => 
    getCapabilityStats(selectedBuckets, enabledModules),
    [selectedBuckets, enabledModules]
  );

  const lastAIMessage = messages.filter(m => m.sender === "ai").at(-1);

  return (
    <div className="flex h-full" data-testid="ai-assistant-flow">
      <div className={`flex flex-col ${showConfirmPanel ? "flex-1" : "flex-1"}`}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="ai-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[700px] ${msg.sender === "ai" ? "w-full" : ""}`}>
                <div className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-[#266C92]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-[#266C92]" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.sender === "ai" 
                      ? "bg-gray-50 dark:bg-muted/50 text-gray-800 dark:text-foreground" 
                      : "bg-[#266C92] text-white"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>

                {msg.sender === "ai" && msg.options && msg === lastAIMessage && (
                  <div className="mt-3 ml-11">
                    <div className={`flex flex-wrap gap-2 ${msg.options.length > 5 ? "max-h-[240px] overflow-y-auto pr-1" : ""}`}>
                      {msg.options.map(opt => {
                        const isSelected = pendingSelections.has(opt.id);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => msg.multiSelect ? handleOptionToggle(opt.id) : handleSingleSelect(opt.id)}
                            className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all text-sm ${
                              isSelected
                                ? "border-[#266C92] bg-[#266C92]/5 dark:bg-[#266C92]/10 text-[#266C92]"
                                : "border-gray-200 dark:border-border bg-white dark:bg-card text-gray-700 dark:text-foreground hover:border-[#266C92]/50"
                            }`}
                            data-testid={`ai-option-${opt.id}`}
                          >
                            {msg.multiSelect && (
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? "border-[#266C92] bg-[#266C92]" : "border-gray-300 dark:border-border"
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                            )}
                            {!msg.multiSelect && (
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? "border-[#266C92]" : "border-gray-300 dark:border-border"
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-[#266C92]" />}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-medium">{opt.label}</span>
                              {opt.description && (
                                <p className="text-[10px] text-gray-500 dark:text-muted-foreground truncate max-w-[200px]">{opt.description}</p>
                              )}
                            </div>
                            {opt.recommended && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-[#266C92]/10 text-[#266C92] border-0 shrink-0">
                                <Zap className="w-2.5 h-2.5 mr-0.5" />
                                Rec
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {pendingSelections.size > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleConfirmSelections}
                          className="bg-[#266C92] gap-1.5"
                          data-testid="ai-confirm-selections"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Confirm {pendingSelections.size > 0 ? `(${pendingSelections.size})` : ""}
                        </Button>
                        {msg.multiSelect && (
                          <span className="text-[10px] text-gray-400 dark:text-muted-foreground">
                            {pendingSelections.size} selected
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#266C92]/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#266C92]" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-gray-50 dark:bg-muted/50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-gray-200 dark:border-border bg-white dark:bg-card px-6 py-4">
          <div className="flex items-center gap-3 max-w-[700px] mx-auto">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                placeholder={lastAIMessage?.inputPlaceholder || "Type your response..."}
                className="h-11 pr-10 rounded-xl"
                data-testid="ai-chat-input"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSendMessage}
                disabled={!userInput.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-[#266C92]"
                data-testid="ai-send-button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${currentStage === "greeting" || currentStage === "name" ? "bg-[#266C92]" : "bg-gray-300 dark:bg-muted"}`} />
              <span>Name</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${currentStage === "members" ? "bg-[#266C92]" : "bg-gray-300 dark:bg-muted"}`} />
              <span>Team</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${currentStage === "modules" ? "bg-[#266C92]" : "bg-gray-300 dark:bg-muted"}`} />
              <span>Modules</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${currentStage === "capabilities" ? "bg-[#266C92]" : "bg-gray-300 dark:bg-muted"}`} />
              <span>Capabilities</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${currentStage === "homeview" ? "bg-[#266C92]" : "bg-gray-300 dark:bg-muted"}`} />
              <span>Home View</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${currentStage === "confirm" ? "bg-[#266C92]" : "bg-gray-300 dark:bg-muted"}`} />
              <span>Confirm</span>
            </div>
          </div>
        </div>
      </div>

      {showConfirmPanel && (
        <div className="w-[380px] border-l border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/20 p-4 overflow-y-auto shrink-0">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#266C92]" />
                Workspace Preview
              </h3>
            </div>

            <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Name</p>
              <p className="font-semibold text-gray-900 dark:text-foreground">{workspaceName || "Untitled"}</p>
            </div>

            <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Team ({workspaceMembers.length})</p>
              <div className="space-y-1.5">
                {workspaceMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 dark:text-foreground truncate">{m.email}</span>
                    <Badge variant="secondary" className="text-[9px] shrink-0">{m.role}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Modules ({selectedBuckets.length})</p>
              <div className="space-y-1">
                {selectedBuckets.map(bId => {
                  const bucket = productCapabilityBuckets.find(b => b.id === bId);
                  const modCount = enabledModules[bId]?.length || 0;
                  return bucket ? (
                    <div key={bId} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 dark:text-foreground">{bucket.name}</span>
                      <span className="text-gray-400">{modCount} caps</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Home Layout</p>
              <p className="text-sm font-medium text-gray-700 dark:text-foreground">
                {archetypeTemplates.find(t => t.id === selectedArchetype)?.name || "Default"}
              </p>
            </div>

            <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">Total Capabilities</span>
                <span className="font-bold text-[#266C92]">{stats.totalModules}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Nav Items</span>
                <span className="font-bold text-[#266C92]">{stats.totalNavItems}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkspaceCreationWizard({
  open,
  onOpenChange,
  onWorkspaceCreated,
}: WorkspaceCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("name");
  const [assistantMode, setAssistantMode] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([]);
  const [enabledModules, setEnabledModules] = useState<Record<string, string[]>>({});
  const [activeBucketTab, setActiveBucketTab] = useState<string | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([
    { id: "1", email: "admin@company.org", role: "Org Admin" },
    { id: "2", email: "exec@company.org", role: "Executive" },
    { id: "3", email: "manager@company.org", role: "Manager" },
    { id: "4", email: "analyst@company.org", role: "Analyst" },
  ]);
  const [selectedArchetype, setSelectedArchetype] = useState<string>("auditboard-default");
  
  const addWorkspace = useWorkspaceStore(state => state.addWorkspace);
  
  const addMember = () => {
    setWorkspaceMembers(prev => [
      ...prev,
      { id: `member-${Date.now()}`, email: "", role: "Viewer" }
    ]);
  };
  
  const removeMember = (id: string) => {
    setWorkspaceMembers(prev => prev.filter(m => m.id !== id));
  };
  
  const updateMember = (id: string, field: "email" | "role", value: string) => {
    setWorkspaceMembers(prev => 
      prev.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  const completedSteps = useMemo(() => {
    const completed = new Set<WizardStep>();
    if (workspaceName.trim()) completed.add("name");
    if (selectedBuckets.length > 0) completed.add("buckets");
    const totalModules = Object.values(enabledModules).reduce((sum, arr) => sum + arr.length, 0);
    if (totalModules > 0) completed.add("modules");
    if (selectedArchetype) completed.add("homeView");
    return completed;
  }, [workspaceName, selectedBuckets, enabledModules, selectedArchetype]);
  
  // Auto-update recommended archetype when modules change (only if not already set to auditboard-default)
  useEffect(() => {
    if (selectedBuckets.length > 0 && selectedArchetype !== "auditboard-default") {
      const recommended = getRecommendedArchetype(selectedBuckets);
      setSelectedArchetype(recommended);
    }
  }, [selectedBuckets.join(",")]);

  const stats = useMemo(() => 
    getCapabilityStats(selectedBuckets, enabledModules),
    [selectedBuckets, enabledModules]
  );

  const navSections = useMemo(() => 
    generateNavSections(selectedBuckets, enabledModules),
    [selectedBuckets, enabledModules]
  );
  
  const moduleNavGroups = useMemo(() => 
    generateModuleNavGroups(selectedBuckets, enabledModules),
    [selectedBuckets, enabledModules]
  );

  const toggleBucket = useCallback((bucketId: string) => {
    setSelectedBuckets(prev => {
      if (prev.includes(bucketId)) {
        const newSelected = prev.filter(id => id !== bucketId);
        setEnabledModules(current => {
          const updated = { ...current };
          delete updated[bucketId];
          return updated;
        });
        if (activeBucketTab === bucketId) {
          setActiveBucketTab(newSelected[0] || null);
        }
        return newSelected;
      } else {
        const newSelected = [...prev, bucketId];
        setEnabledModules(current => ({
          ...current,
          ...initializeEnabledModules([bucketId]),
        }));
        if (!activeBucketTab) {
          setActiveBucketTab(bucketId);
        }
        return newSelected;
      }
    });
  }, [activeBucketTab]);

  const toggleModule = useCallback((bucketId: string, moduleId: string) => {
    setEnabledModules(prev => {
      const current = prev[bucketId] || [];
      if (current.includes(moduleId)) {
        return { ...prev, [bucketId]: current.filter(id => id !== moduleId) };
      } else {
        return { ...prev, [bucketId]: [...current, moduleId] };
      }
    });
  }, []);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case "name": return workspaceName.trim().length > 0;
      case "buckets": return selectedBuckets.length > 0;
      case "modules": return Object.values(enabledModules).some(arr => arr.length > 0);
      case "homeView": return !!selectedArchetype;
      case "preview": return true;
      default: return false;
    }
  }, [currentStep, workspaceName, selectedBuckets, enabledModules, selectedArchetype]);

  const goNext = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      if (nextStep === "modules" && selectedBuckets.length > 0 && !activeBucketTab) {
        setActiveBucketTab(selectedBuckets[0]);
      }
    }
  };

  const goBack = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const resetWizard = () => {
    setCurrentStep("name");
    setAssistantMode(false);
    setWorkspaceName("");
    setSelectedBuckets([]);
    setEnabledModules({});
    setActiveBucketTab(null);
    setSelectedArchetype("auditboard-default");
    setWorkspaceMembers([
      { id: "1", email: "admin@company.org", role: "Org Admin" },
      { id: "2", email: "exec@company.org", role: "Executive" },
      { id: "3", email: "manager@company.org", role: "Manager" },
      { id: "4", email: "analyst@company.org", role: "Analyst" },
    ]);
  };

  const handleCreate = () => {
    if (!workspaceName.trim()) return;
    
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: workspaceName.trim(),
      type: "custom",
      persona: "custom",
      icon: "layout-dashboard",
      isCustom: true,
      moduleConfig: {
        selectedBuckets,
        enabledModules,
      },
      homeViewConfig: {
        archetypeId: selectedArchetype,
      },
    };
    
    addWorkspace(newWorkspace);
    onWorkspaceCreated?.(newWorkspace);
    onOpenChange(false);
    resetWizard();
  };

  const handleClose = () => {
    onOpenChange(false);
    resetWizard();
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center"
      data-testid="workspace-wizard"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Full-screen Modal - True fullscreen, no rounded corners */}
      <div className="relative w-full h-full bg-white dark:bg-background shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-border">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-foreground">Create New Workspace</h1>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">
              {assistantMode ? "AI-guided workspace setup" : "Configure your workspace modules"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {!assistantMode && (
              <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground"
              data-testid="button-close-wizard"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Mode Toggle - segmented control */}
          <div className="absolute top-4 right-6 z-10" data-testid="toggle-assistant-mode">
            <div className="flex items-center bg-gray-100 dark:bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setAssistantMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  !assistantMode
                    ? "bg-white dark:bg-background text-gray-900 dark:text-foreground shadow-sm"
                    : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground"
                }`}
                data-testid="toggle-manual-mode"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Manual</span>
              </button>
              <button
                onClick={() => setAssistantMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  assistantMode
                    ? "bg-white dark:bg-background text-[#266C92] shadow-sm"
                    : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground"
                }`}
                data-testid="toggle-ai-mode"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Assistant</span>
              </button>
            </div>
          </div>

          {assistantMode ? (
            <AIAssistantFlow
              workspaceName={workspaceName}
              setWorkspaceName={setWorkspaceName}
              workspaceMembers={workspaceMembers}
              setWorkspaceMembers={setWorkspaceMembers}
              selectedBuckets={selectedBuckets}
              setSelectedBuckets={setSelectedBuckets}
              enabledModules={enabledModules}
              setEnabledModules={setEnabledModules}
              selectedArchetype={selectedArchetype}
              setSelectedArchetype={setSelectedArchetype}
              onComplete={handleCreate}
            />
          ) : (<>
          {currentStep === "name" && (
            <div className="flex items-center justify-center h-full p-8 overflow-auto">
              <div className="w-full max-w-xl space-y-6">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#266C92]/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-7 h-7 text-[#266C92]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">Create Your Workspace</h2>
                  <p className="text-gray-500 dark:text-muted-foreground mt-1 text-sm">
                    Name your workspace and add initial team members
                  </p>
                </div>
                
                {/* Workspace Name */}
                <div>
                  <Label htmlFor="workspace-name" className="text-sm font-medium">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={workspaceName}
                    onChange={e => setWorkspaceName(e.target.value)}
                    placeholder="e.g., Enterprise Risk & Compliance"
                    className="mt-2 h-11"
                    data-testid="input-workspace-name"
                    autoFocus
                  />
                </div>
                
                {/* Workspace Members */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Workspace Members</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addMember}
                      className="gap-1 text-[#266C92]"
                      data-testid="button-add-member"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Member
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {workspaceMembers.map((member, index) => (
                      <div 
                        key={member.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/30"
                      >
                        <Input
                          value={member.email}
                          onChange={e => updateMember(member.id, "email", e.target.value)}
                          placeholder="email@company.org"
                          className="flex-1 h-8 text-sm"
                          data-testid={`input-member-email-${index}`}
                        />
                        <Select
                          value={member.role}
                          onValueChange={value => updateMember(member.id, "role", value)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs" data-testid={`select-member-role-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WORKSPACE_ROLES.map(role => (
                              <SelectItem key={role} value={role} className="text-xs">
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {workspaceMembers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMember(member.id)}
                            className="text-gray-400 hover:text-red-500"
                            data-testid={`button-remove-member-${index}`}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-400 dark:text-muted-foreground mt-2">
                    Users will receive an invitation to join this workspace
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === "buckets" && (
            <div className="h-full p-8 overflow-auto flex items-center justify-center">
              <div className="w-full max-w-[640px]">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#266C92]/10 text-[#266C92] text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    Product Modules
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground">Select Your Modules</h2>
                  <p className="text-gray-500 dark:text-muted-foreground mt-2 max-w-md mx-auto">
                    Choose which product areas to include in your workspace. Each module unlocks specialized capabilities and workflows.
                  </p>
                </div>
                
                {/* Perfect 3x3 Grid of Buckets - Fixed Size Squares */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  {productCapabilityBuckets.map(bucket => (
                    <BucketCard
                      key={bucket.id}
                      bucket={bucket}
                      isSelected={selectedBuckets.includes(bucket.id)}
                      onToggle={() => toggleBucket(bucket.id)}
                    />
                  ))}
                </div>
                
                {/* Selection indicator */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                  <div className="flex items-center gap-2 text-sm">
                    {selectedBuckets.length > 0 ? (
                      <>
                        <div className="flex -space-x-1">
                          {selectedBuckets.slice(0, 3).map(bucketId => {
                            const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
                            return bucket ? (
                              <div 
                                key={bucketId}
                                className="w-6 h-6 rounded-full border-2 border-white dark:border-background flex items-center justify-center"
                                style={{ backgroundColor: bucket.color }}
                              >
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : null;
                          })}
                          {selectedBuckets.length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-background bg-gray-200 dark:bg-muted flex items-center justify-center text-[10px] font-bold text-gray-600">
                              +{selectedBuckets.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-gray-600 dark:text-muted-foreground font-medium">
                          {selectedBuckets.length} {selectedBuckets.length === 1 ? "module" : "modules"} selected
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-muted-foreground">
                        Click tiles to select modules
                      </span>
                    )}
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                </div>
              </div>
            </div>
          )}
          
          {currentStep === "modules" && (
            <CapabilitiesStep
              selectedBuckets={selectedBuckets}
              enabledModules={enabledModules}
              setEnabledModules={setEnabledModules}
              activeBucketTab={activeBucketTab}
              setActiveBucketTab={setActiveBucketTab}
              toggleModule={toggleModule}
            />
          )}
          
          {currentStep === "homeView" && (
            <div className="h-full p-6 overflow-hidden">
              <HomeViewStep
                selectedArchetype={selectedArchetype}
                onArchetypeChange={setSelectedArchetype}
                selectedModules={selectedBuckets}
                enabledModules={enabledModules}
              />
            </div>
          )}
          
          {currentStep === "preview" && (
            <div className="h-full p-6 overflow-hidden flex flex-col">
              <div className="text-center mb-4 shrink-0">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">Review Your Workspace</h2>
              </div>
              
              <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                {/* Configuration Summary - modules column */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-2 shrink-0">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                    <span className="text-[10px] font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wide">
                      Workspace Summary
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                  </div>
                  <ConfigurationSummary
                    workspaceName={workspaceName}
                    selectedBuckets={selectedBuckets}
                    enabledModules={enabledModules}
                    stats={stats}
                  />
                </div>
                
                {/* Members Summary - middle column */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-2 shrink-0">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                    <span className="text-[10px] font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wide">
                      Team Members
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                  </div>
                  <MembersSummary members={workspaceMembers} />
                </div>
                
                {/* Navigation Preview - fixed width to match actual nav panel */}
                <div className="w-[312px] shrink-0 flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-2 shrink-0">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                    <span className="text-[10px] font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wide">
                      Nav Preview
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <NavigationPreview moduleGroups={moduleNavGroups} workspaceName={workspaceName} />
                  </div>
                </div>
              </div>
            </div>
          )}
          </>)}
        </div>
        
        {!assistantMode && (
        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/30">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === "name"}
            className="gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="text-sm text-gray-500 dark:text-muted-foreground">
            Step {stepOrder.indexOf(currentStep) + 1} of {stepOrder.length}
          </div>
          
          {currentStep === "preview" ? (
            <Button
              onClick={handleCreate}
              className="gap-2 bg-[#266C92]"
              data-testid="button-create"
            >
              <Sparkles className="w-4 h-4" />
              Create Workspace
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={!canProceed}
              className="gap-2"
              data-testid="button-next"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
