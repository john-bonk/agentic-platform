/**
 * Workspace Creation Wizard
 * 
 * Full-screen multi-stage wizard for creating custom workspaces with:
 * - Stage 1: Workspace naming
 * - Stage 2: Product capability bucket selection (9 buckets in 3x3 grid)
 * - Stage 3: Module capability configuration per bucket (9+ modules per bucket)
 * - Stage 4: Review with live navigation preview
 */

import { useState, useMemo, useCallback, useEffect } from "react";
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

export function WorkspaceCreationWizard({
  open,
  onOpenChange,
  onWorkspaceCreated,
}: WorkspaceCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("name");
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([]);
  const [enabledModules, setEnabledModules] = useState<Record<string, string[]>>({});
  const [activeBucketTab, setActiveBucketTab] = useState<string | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([
    { id: "1", email: "admin@company.org", role: "Org Admin" }
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
    
    setCurrentStep("name");
    setWorkspaceName("");
    setSelectedBuckets([]);
    setEnabledModules({});
    setActiveBucketTab(null);
    setSelectedArchetype("auditboard-default");
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep("name");
    setWorkspaceName("");
    setSelectedBuckets([]);
    setEnabledModules({});
    setActiveBucketTab(null);
    setSelectedArchetype("auditboard-default");
  };

  if (!open) return null;

  const activeBucketData = activeBucketTab 
    ? productCapabilityBuckets.find(b => b.id === activeBucketTab) 
    : null;

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
            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">Configure your workspace modules</p>
          </div>
          <div className="flex items-center gap-6">
            <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
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
        <div className="flex-1 overflow-hidden">
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
                  
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
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
            <div className="h-full flex">
              {/* Bucket Tabs Sidebar */}
              <div className="w-64 border-r border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/30 p-4">
                <Label className="text-xs text-gray-500 dark:text-muted-foreground uppercase mb-3 block">
                  Configure Capabilities
                </Label>
                <div className="space-y-1">
                  {selectedBuckets.map(bucketId => {
                    const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
                    if (!bucket) return null;
                    const moduleCount = enabledModules[bucketId]?.length || 0;
                    
                    return (
                      <button
                        key={bucketId}
                        onClick={() => setActiveBucketTab(bucketId)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          activeBucketTab === bucketId
                            ? "bg-[#266C92]/10 text-[#266C92]"
                            : "text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted"
                        }`}
                        data-testid={`tab-${bucketId}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-muted flex items-center justify-center">
                          {getBucketIcon(bucket.icon, "w-4 h-4")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{bucket.name}</p>
                          <p className="text-xs text-gray-500 dark:text-muted-foreground">
                            {moduleCount} / {bucket.moduleCapabilities.length} capabilities
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Module Grid */}
              <div className="flex-1 p-6 overflow-auto">
                {activeBucketData ? (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${activeBucketData.color}15`, color: activeBucketData.color }}
                      >
                        {getBucketIcon(activeBucketData.icon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-foreground">{activeBucketData.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">{activeBucketData.description}</p>
                      </div>
                      <div className="ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allModuleIds = activeBucketData.moduleCapabilities.map(m => m.id);
                            const currentEnabled = enabledModules[activeBucketData.id] || [];
                            if (currentEnabled.length === allModuleIds.length) {
                              setEnabledModules(prev => ({ ...prev, [activeBucketData.id]: [] }));
                            } else {
                              setEnabledModules(prev => ({ ...prev, [activeBucketData.id]: allModuleIds }));
                            }
                          }}
                          data-testid="button-toggle-all"
                        >
                          {(enabledModules[activeBucketData.id]?.length || 0) === activeBucketData.moduleCapabilities.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                    </div>
                    
                    {/* 3x3 Module Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {activeBucketData.moduleCapabilities.map(module => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          isEnabled={(enabledModules[activeBucketData.id] || []).includes(module.id)}
                          onToggle={() => toggleModule(activeBucketData.id, module.id)}
                          bucketColor={activeBucketData.color}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-muted-foreground">
                    Select a module from the left to configure its capabilities
                  </div>
                )}
              </div>
            </div>
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
        </div>
        
        {/* Footer */}
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
      </div>
    </div>
  );
}
