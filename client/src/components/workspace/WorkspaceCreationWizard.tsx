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
  initializeEnabledModules,
  getCapabilityStats,
  type ProductCapabilityBucket,
  type ModuleCapability,
} from "@/config/workspaceWizardConfig";
import type { SideNavSection } from "@/config/navigation";
import { type Workspace, useWorkspaceStore } from "@/lib/workspaceStore";

interface WorkspaceCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkspaceCreated?: (workspace: Workspace) => void;
}

type WizardStep = "name" | "buckets" | "modules" | "preview";

const stepOrder: WizardStep[] = ["name", "buckets", "modules", "preview"];
const stepLabels: Record<WizardStep, string> = {
  name: "Name",
  buckets: "Capabilities",
  modules: "Modules",
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
      className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl border-2 text-center transition-all overflow-visible hover-elevate active-elevate-2 ${
        isSelected
          ? "border-[#266C92] shadow-lg shadow-[#266C92]/20"
          : "border-gray-200 dark:border-border"
      }`}
      data-testid={`bucket-${bucket.id}`}
    >
      {/* Background gradient - static based on selection */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ 
            background: `linear-gradient(135deg, ${bucket.color}08 0%, ${bucket.color}15 100%)`
          }}
        />
      )}
      
      {/* Decorative corner accent - only when selected */}
      {isSelected && (
        <div 
          className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-20 pointer-events-none"
          style={{ backgroundColor: bucket.color }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{ 
            backgroundColor: isSelected ? `${bucket.color}20` : undefined,
            color: isSelected ? bucket.color : undefined
          }}
        >
          <div className={isSelected ? "" : "text-gray-400 dark:text-muted-foreground"}>
            {getBucketIcon(bucket.icon, "w-7 h-7")}
          </div>
        </div>
        <div 
          className={`font-semibold text-sm px-2 ${isSelected ? "" : "text-gray-700 dark:text-foreground"}`}
          style={{ color: isSelected ? bucket.color : undefined }}
        >
          {bucket.name}
        </div>
        <div className="text-[10px] text-gray-400 dark:text-muted-foreground mt-1 px-3 text-center leading-tight">
          {bucket.moduleCapabilities.length} modules
        </div>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-20">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: bucket.color }}
          >
            <Check className="w-3.5 h-3.5 text-white" />
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

function NavigationPreview({ sections, workspaceName }: { sections: SideNavSection[]; workspaceName: string }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded).map(s => s.id))
  );

  useEffect(() => {
    setExpandedSections(new Set(sections.filter(s => s.defaultExpanded).map(s => s.id)));
  }, [sections.length, sections.map(s => s.id).join(",")]);

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

  return (
    <div
      className="relative bg-sidebar dark:bg-sidebar rounded-xl border border-border overflow-hidden h-full flex flex-col"
      data-testid="nav-preview"
    >
      {/* Panel header - matches actual SideNavigation header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar-accent/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#266C92] flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-sidebar-foreground truncate">{workspaceName || "Custom Workspace"}</div>
          <div className="text-[10px] text-sidebar-foreground/60">{sections.length} sections</div>
        </div>
      </div>
      
      {/* Navigation sections - matches actual SideNavigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-1">
            {sections.map(section => {
              const isExpanded = section.collapsible ? expandedSections.has(section.id) : true;
              return (
                <div key={section.id} data-testid={`preview-section-${section.id}`}>
                  <div
                    className={`flex items-center gap-2 w-full px-3 py-1.5 text-left rounded-md ${section.collapsible ? "hover-elevate" : ""}`}
                    onClick={section.collapsible ? () => toggleSection(section.id) : undefined}
                    onKeyDown={section.collapsible ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleSection(section.id);
                      }
                    } : undefined}
                    role={section.collapsible ? "button" : undefined}
                    tabIndex={section.collapsible ? 0 : undefined}
                    style={{ cursor: section.collapsible ? "pointer" : "default" }}
                    data-testid={section.collapsible ? `preview-toggle-${section.id}` : undefined}
                  >
                    {section.collapsible && (
                      <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                    )}
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {section.title}
                    </span>
                  </div>
                  {isExpanded && (
                    <div className="ml-5 space-y-0.5">
                      {section.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs ${
                            idx === 0 
                              ? "bg-[#266C92]/10 text-[#266C92] font-medium" 
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                          data-testid={`preview-item-${item.id}`}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#266C92]/20 text-[#266C92] font-medium">
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
      
      {/* "1:1 Preview" label */}
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-[#266C92]/90 text-[9px] font-bold text-white uppercase tracking-wide">
        Live Preview
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
  
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5">
      <h3 className="font-semibold text-gray-900 dark:text-foreground mb-4">Configuration Summary</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-xs text-gray-500 dark:text-muted-foreground uppercase">Workspace Name</Label>
          <p className="font-medium text-gray-900 dark:text-foreground">{workspaceName || "Untitled Workspace"}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#266C92]">{stats.bucketCount}</p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">Capabilities</p>
          </div>
          <div className="bg-gray-50 dark:bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#266C92]">{stats.totalModules}</p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">Modules</p>
          </div>
          <div className="bg-gray-50 dark:bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#266C92]">{stats.totalNavItems}</p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">Nav Items</p>
          </div>
        </div>
        
        <div>
          <Label className="text-xs text-gray-500 dark:text-muted-foreground uppercase mb-2 block">Selected Capabilities</Label>
          <div className="flex flex-wrap gap-2">
            {selectedBucketData.map(bucket => (
              <Badge 
                key={bucket.id} 
                variant="secondary"
                className="text-xs"
              >
                {bucket.name}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="text-xs text-gray-500 dark:text-muted-foreground uppercase mb-2 block">Enabled Modules</Label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {selectedBucketData.map(bucket => {
              const modules = enabledModules[bucket.id] || [];
              if (modules.length === 0) return null;
              
              return (
                <div key={bucket.id}>
                  <p className="text-xs font-medium text-gray-600 dark:text-muted-foreground mb-1">{bucket.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {modules.map(moduleId => {
                      const module = bucket.moduleCapabilities.find(m => m.id === moduleId);
                      return module ? (
                        <Badge key={moduleId} variant="outline" className="text-[10px]">
                          {module.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
  
  const addWorkspace = useWorkspaceStore(state => state.addWorkspace);

  const completedSteps = useMemo(() => {
    const completed = new Set<WizardStep>();
    if (workspaceName.trim()) completed.add("name");
    if (selectedBuckets.length > 0) completed.add("buckets");
    const totalModules = Object.values(enabledModules).reduce((sum, arr) => sum + arr.length, 0);
    if (totalModules > 0) completed.add("modules");
    return completed;
  }, [workspaceName, selectedBuckets, enabledModules]);

  const stats = useMemo(() => 
    getCapabilityStats(selectedBuckets, enabledModules),
    [selectedBuckets, enabledModules]
  );

  const navSections = useMemo(() => 
    generateNavSections(selectedBuckets, enabledModules),
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
      case "preview": return true;
      default: return false;
    }
  }, [currentStep, workspaceName, selectedBuckets, enabledModules]);

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
      moduleConfig: {
        selectedBuckets,
        enabledModules,
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
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep("name");
    setWorkspaceName("");
    setSelectedBuckets([]);
    setEnabledModules({});
    setActiveBucketTab(null);
  };

  if (!open) return null;

  const activeBucketData = activeBucketTab 
    ? productCapabilityBuckets.find(b => b.id === activeBucketTab) 
    : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="workspace-wizard"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Full-screen Modal */}
      <div className="relative w-full h-full max-w-[1400px] max-h-[900px] m-4 bg-white dark:bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-border">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-foreground">Create New Workspace</h1>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">Configure your workspace capabilities</p>
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
            <div className="flex items-center justify-center h-full p-8">
              <div className="w-full max-w-md space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#266C92]/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[#266C92]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground">Name Your Workspace</h2>
                  <p className="text-gray-500 dark:text-muted-foreground mt-2">
                    Choose a name that reflects the purpose of this workspace
                  </p>
                </div>
                <div>
                  <Label htmlFor="workspace-name" className="text-sm font-medium">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={workspaceName}
                    onChange={e => setWorkspaceName(e.target.value)}
                    placeholder="e.g., Enterprise Risk & Compliance"
                    className="mt-2 h-12 text-lg"
                    data-testid="input-workspace-name"
                    autoFocus
                  />
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
                    Product Capabilities
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground">Select Your Capabilities</h2>
                  <p className="text-gray-500 dark:text-muted-foreground mt-2 max-w-md mx-auto">
                    Choose which product areas to include in your workspace. Each capability unlocks specialized modules and workflows.
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
                          {selectedBuckets.length} {selectedBuckets.length === 1 ? "capability" : "capabilities"} selected
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-muted-foreground">
                        Click tiles to select capabilities
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
                  Configure Modules
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
                            {moduleCount} / {bucket.moduleCapabilities.length} modules
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
                    Select a capability from the left to configure its modules
                  </div>
                )}
              </div>
            </div>
          )}
          
          {currentStep === "preview" && (
            <div className="h-full p-8 overflow-auto">
              <div className="max-w-6xl mx-auto h-full flex flex-col">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
                    <CheckCircle className="w-4 h-4" />
                    Ready to Create
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground">Review Your Workspace</h2>
                  <p className="text-gray-500 dark:text-muted-foreground mt-2">
                    Your workspace is configured and ready. The navigation panel preview shows exactly how it will appear.
                  </p>
                </div>
                
                <div className="flex-1 grid grid-cols-5 gap-6 min-h-0">
                  {/* Configuration Summary - narrower */}
                  <div className="col-span-2">
                    <ConfigurationSummary
                      workspaceName={workspaceName}
                      selectedBuckets={selectedBuckets}
                      enabledModules={enabledModules}
                      stats={stats}
                    />
                  </div>
                  
                  {/* Navigation Preview - wider, emphasized as the true preview */}
                  <div className="col-span-3 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                      <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wide">
                        Live Panel Preview
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-border to-transparent" />
                    </div>
                    <div className="flex-1">
                      <NavigationPreview sections={navSections} workspaceName={workspaceName} />
                    </div>
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
