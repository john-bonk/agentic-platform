/**
 * Workspace Creation Wizard
 * 
 * Multi-stage wizard for creating custom workspaces with:
 * - Stage 1: Product capability bucket selection
 * - Stage 2: Module capability configuration per bucket
 * - Stage 3: Review with live navigation preview
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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

const getBucketIcon = (iconName: string, className: string = "w-5 h-5") => {
  switch (iconName) {
    case "trending-up": return <TrendingUp className={className} />;
    case "clipboard-list": return <ClipboardList className={className} />;
    case "scale": return <Scale className={className} />;
    case "lock": return <Lock className={className} />;
    case "users": return <Users className={className} />;
    case "leaf": return <Leaf className={className} />;
    default: return <LayoutDashboard className={className} />;
  }
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
  };
  return icons[iconName] || <LayoutDashboard className={className} />;
};

function StepIndicator({ currentStep, completedSteps }: { currentStep: WizardStep; completedSteps: Set<WizardStep> }) {
  return (
    <div className="flex items-center gap-1" data-testid="wizard-step-indicator">
      {stepOrder.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = completedSteps.has(step);
        const stepIndex = index + 1;
        
        return (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#266C92] text-white"
                  : isCompleted
                  ? "bg-[#266C92]/20 text-[#266C92] dark:bg-[#266C92]/30"
                  : "bg-gray-100 dark:bg-muted text-gray-400 dark:text-muted-foreground"
              }`}
              data-testid={`step-${step}`}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepIndex}
            </div>
            <span
              className={`ml-1.5 text-xs font-medium hidden sm:inline ${
                isActive ? "text-[#266C92]" : "text-gray-500 dark:text-muted-foreground"
              }`}
            >
              {stepLabels[step]}
            </span>
            {index < stepOrder.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-300 dark:text-muted-foreground" />
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
      className={`flex flex-col p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
        isSelected
          ? "border-[#266C92] bg-[#266C92]/5 dark:bg-[#266C92]/10"
          : "border-gray-200 dark:border-border bg-white dark:bg-card"
      }`}
      data-testid={`bucket-${bucket.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSelected ? "bg-[#266C92]/15 text-[#266C92]" : "bg-gray-100 dark:bg-muted text-gray-500 dark:text-muted-foreground"
          }`}
          style={isSelected ? { backgroundColor: `${bucket.color}15`, color: bucket.color } : {}}
        >
          {getBucketIcon(bucket.icon, "w-5 h-5")}
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? "border-[#266C92] bg-[#266C92]"
              : "border-gray-300 dark:border-border"
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
      <div className={`font-medium text-sm ${isSelected ? "text-[#266C92]" : "text-gray-900 dark:text-foreground"}`}>
        {bucket.name}
      </div>
      <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 line-clamp-2">
        {bucket.description}
      </div>
      <div className="mt-2 text-[10px] text-gray-400 dark:text-muted-foreground">
        {bucket.moduleCapabilities.length} modules available
      </div>
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
      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover-elevate ${
        isEnabled
          ? "border-[#266C92] bg-[#266C92]/5 dark:bg-[#266C92]/10"
          : "border-gray-200 dark:border-border bg-white dark:bg-card"
      }`}
      data-testid={`module-${module.id}`}
    >
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
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
          {module.navContribution.items.length} nav items
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

function NavigationPreview({ sections }: { sections: SideNavSection[] }) {
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
      className="bg-gray-50 dark:bg-muted/50 rounded-lg border border-gray-200 dark:border-border overflow-hidden"
      data-testid="nav-preview"
    >
      <div className="px-3 py-2 bg-gray-100 dark:bg-muted border-b border-gray-200 dark:border-border">
        <span className="text-xs font-medium text-gray-600 dark:text-muted-foreground uppercase tracking-wide">
          Navigation Preview
        </span>
      </div>
      <ScrollArea className="h-[320px]">
        <div className="p-2 space-y-1">
          {sections.map(section => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <div key={section.id} data-testid={`preview-section-${section.id}`}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-1.5 w-full px-2 py-1.5 text-left rounded hover-elevate"
                >
                  {section.collapsible && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                        isExpanded ? "" : "-rotate-90"
                      }`}
                    />
                  )}
                  <span className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wide">
                    {section.title}
                  </span>
                </button>
                {isExpanded && (
                  <div className="ml-5 space-y-0.5">
                    {section.items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-2 py-1.5 rounded text-sm text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors"
                        data-testid={`preview-item-${item.id}`}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
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
  return (
    <div className="space-y-4" data-testid="config-summary">
      <div>
        <Label className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-wide">Workspace Name</Label>
        <div className="mt-1 font-semibold text-lg text-gray-900 dark:text-foreground">{workspaceName}</div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#266C92]/5 dark:bg-[#266C92]/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#266C92]">{stats.bucketCount}</div>
          <div className="text-xs text-gray-500 dark:text-muted-foreground">Capabilities</div>
        </div>
        <div className="bg-[#266C92]/5 dark:bg-[#266C92]/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#266C92]">{stats.totalModules}</div>
          <div className="text-xs text-gray-500 dark:text-muted-foreground">Modules</div>
        </div>
        <div className="bg-[#266C92]/5 dark:bg-[#266C92]/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#266C92]">{stats.totalNavItems + 4}</div>
          <div className="text-xs text-gray-500 dark:text-muted-foreground">Nav Items</div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-wide mb-2 block">
          Selected Capabilities
        </Label>
        <div className="space-y-2">
          {selectedBuckets.map(bucketId => {
            const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
            if (!bucket) return null;
            const modules = enabledModules[bucketId] || [];
            
            return (
              <div key={bucketId} className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${bucket.color}15`, color: bucket.color }}
                  >
                    {getBucketIcon(bucket.icon, "w-3.5 h-3.5")}
                  </div>
                  <span className="font-medium text-sm text-gray-900 dark:text-foreground">{bucket.name}</span>
                  <Badge variant="secondary" className="text-[10px] h-4 ml-auto">
                    {modules.length} modules
                  </Badge>
                </div>
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
  );
}

export function WorkspaceCreationWizard({
  open,
  onOpenChange,
  onWorkspaceCreated,
}: WorkspaceCreationWizardProps) {
  const { addWorkspace } = useWorkspaceStore();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>("name");
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([]);
  const [enabledModules, setEnabledModules] = useState<Record<string, string[]>>({});
  const [activeBucketTab, setActiveBucketTab] = useState<string>("");

  const completedSteps = useMemo(() => {
    const completed = new Set<WizardStep>();
    if (workspaceName.trim().length > 0) completed.add("name");
    if (selectedBuckets.length > 0) completed.add("buckets");
    const hasAnyModules = Object.values(enabledModules).some(arr => arr.length > 0);
    if (hasAnyModules) completed.add("modules");
    return completed;
  }, [workspaceName, selectedBuckets, enabledModules]);

  const navSections = useMemo(
    () => generateNavSections(selectedBuckets, enabledModules),
    [selectedBuckets, enabledModules]
  );

  const stats = useMemo(
    () => getCapabilityStats(selectedBuckets, enabledModules),
    [selectedBuckets, enabledModules]
  );

  const handleBucketToggle = useCallback((bucketId: string) => {
    setSelectedBuckets(prev => {
      const isSelected = prev.includes(bucketId);
      if (isSelected) {
        const next = prev.filter(id => id !== bucketId);
        setEnabledModules(current => {
          const updated = { ...current };
          delete updated[bucketId];
          return updated;
        });
        if (activeBucketTab === bucketId) {
          setActiveBucketTab(next[0] || "");
        }
        return next;
      } else {
        const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
        if (bucket) {
          const defaultModules = bucket.moduleCapabilities
            .filter(m => m.defaultEnabled)
            .map(m => m.id);
          setEnabledModules(current => ({ ...current, [bucketId]: defaultModules }));
        }
        if (!activeBucketTab) {
          setActiveBucketTab(bucketId);
        }
        return [...prev, bucketId];
      }
    });
  }, [activeBucketTab]);

  const handleModuleToggle = useCallback((bucketId: string, moduleId: string) => {
    setEnabledModules(prev => {
      const current = prev[bucketId] || [];
      const isEnabled = current.includes(moduleId);
      return {
        ...prev,
        [bucketId]: isEnabled
          ? current.filter(id => id !== moduleId)
          : [...current, moduleId],
      };
    });
  }, []);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case "name":
        return workspaceName.trim().length > 0;
      case "buckets":
        return selectedBuckets.length > 0;
      case "modules":
        return Object.values(enabledModules).some(arr => arr.length > 0);
      case "preview":
        return true;
      default:
        return false;
    }
  }, [currentStep, workspaceName, selectedBuckets, enabledModules]);

  const handleNext = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      if (nextStep === "modules" && selectedBuckets.length > 0 && !activeBucketTab) {
        setActiveBucketTab(selectedBuckets[0]);
      }
    }
  }, [currentStep, selectedBuckets, activeBucketTab]);

  const handleBack = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const handleCreate = useCallback(() => {
    const newWorkspace: Workspace = {
      id: `custom-${Date.now()}`,
      name: workspaceName.trim(),
      persona: "Custom",
      personaTitle: "Workspace Administrator",
      selectedCapabilities: selectedBuckets,
      moduleConfig: {
        selectedBuckets: [...selectedBuckets],
        enabledModules: { ...enabledModules },
      },
      isCustom: true,
    };

    addWorkspace(newWorkspace);
    onWorkspaceCreated?.(newWorkspace);
    
    setWorkspaceName("");
    setSelectedBuckets([]);
    setEnabledModules({});
    setCurrentStep("name");
    setActiveBucketTab("");
    onOpenChange(false);
  }, [workspaceName, selectedBuckets, enabledModules, addWorkspace, onWorkspaceCreated, onOpenChange]);

  const handleCancel = useCallback(() => {
    setWorkspaceName("");
    setSelectedBuckets([]);
    setEnabledModules({});
    setCurrentStep("name");
    setActiveBucketTab("");
    onOpenChange(false);
  }, [onOpenChange]);

  const renderStepContent = () => {
    switch (currentStep) {
      case "name":
        return (
          <div className="space-y-4 py-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#266C92]/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#266C92]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">Create Your Workspace</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
                Build a customized workspace tailored to your needs
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-name" className="text-sm font-medium">
                Workspace Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="workspace-name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g., Cyber Security Operations"
                className="h-11 text-base"
                autoFocus
                data-testid="input-workspace-name"
              />
              <p className="text-xs text-gray-500 dark:text-muted-foreground">
                Choose a descriptive name that reflects the workspace's purpose
              </p>
            </div>
          </div>
        );

      case "buckets":
        return (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-foreground">Select Product Capabilities</h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">
                Choose the core capability areas for your workspace
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {productCapabilityBuckets.map(bucket => (
                <BucketCard
                  key={bucket.id}
                  bucket={bucket}
                  isSelected={selectedBuckets.includes(bucket.id)}
                  onToggle={() => handleBucketToggle(bucket.id)}
                />
              ))}
            </div>
            {selectedBuckets.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedBuckets.length} selected
                </Badge>
                <span className="text-xs text-gray-500 dark:text-muted-foreground">
                  Configure modules in the next step
                </span>
              </div>
            )}
          </div>
        );

      case "modules":
        return (
          <div className="flex gap-4 py-2 h-[400px]">
            <div className="flex-1 flex flex-col min-w-0">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-foreground">Configure Modules</h3>
                <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">
                  Enable the specific modules you need for each capability
                </p>
              </div>
              
              <div className="flex gap-1 mb-3 flex-wrap">
                {selectedBuckets.map(bucketId => {
                  const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
                  if (!bucket) return null;
                  const isActive = activeBucketTab === bucketId;
                  const enabledCount = (enabledModules[bucketId] || []).length;
                  
                  return (
                    <button
                      key={bucketId}
                      onClick={() => setActiveBucketTab(bucketId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#266C92] text-white"
                          : "bg-gray-100 dark:bg-muted text-gray-700 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-muted/80"
                      }`}
                      data-testid={`tab-${bucketId}`}
                    >
                      {getBucketIcon(bucket.icon, "w-3.5 h-3.5")}
                      <span className="hidden sm:inline">{bucket.name}</span>
                      <Badge
                        variant={isActive ? "outline" : "secondary"}
                        className={`text-[10px] h-4 px-1 ml-1 ${isActive ? "border-white/50 text-white" : ""}`}
                      >
                        {enabledCount}
                      </Badge>
                    </button>
                  );
                })}
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-2">
                  {activeBucketTab && (() => {
                    const bucket = productCapabilityBuckets.find(b => b.id === activeBucketTab);
                    if (!bucket) return null;
                    return bucket.moduleCapabilities.map(module => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        isEnabled={(enabledModules[activeBucketTab] || []).includes(module.id)}
                        onToggle={() => handleModuleToggle(activeBucketTab, module.id)}
                        bucketColor={bucket.color}
                      />
                    ));
                  })()}
                </div>
              </ScrollArea>
            </div>

            <div className="w-64 shrink-0">
              <NavigationPreview sections={navSections} />
            </div>
          </div>
        );

      case "preview":
        return (
          <div className="flex gap-6 py-2 h-[400px]">
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-foreground">Review Configuration</h3>
                <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">
                  Confirm your workspace setup before creating
                </p>
              </div>
              <ScrollArea className="h-[350px] pr-2">
                <ConfigurationSummary
                  workspaceName={workspaceName}
                  selectedBuckets={selectedBuckets}
                  enabledModules={enabledModules}
                  stats={stats}
                />
              </ScrollArea>
            </div>

            <div className="w-72 shrink-0">
              <NavigationPreview sections={navSections} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl p-0 gap-0 overflow-hidden"
        data-testid="workspace-creation-wizard"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/50">
          <div className="font-semibold text-lg text-gray-900 dark:text-foreground">Create Workspace</div>
          <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
        </div>

        <div className="px-6 py-4 min-h-[300px]">
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/50">
          <Button
            variant="ghost"
            onClick={handleCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          
          <div className="flex items-center gap-2">
            {currentStep !== "name" && (
              <Button
                variant="outline"
                onClick={handleBack}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
            )}
            
            {currentStep === "preview" ? (
              <Button
                onClick={handleCreate}
                className="bg-[#266C92]"
                data-testid="button-create"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Create Workspace
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-[#266C92]"
                data-testid="button-next"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
