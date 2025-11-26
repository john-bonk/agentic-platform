import { useState, useMemo, useRef } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { X, PlusCircle, Download, Check, RefreshCcw, Upload, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProcessById } from "@/data/businessProcessData";
import { SideNavigationSection } from "./sections/SideNavigationSection";
import { HeaderSection } from "./sections/HeaderSection";

type WizardStep = 1 | 2 | 3;

const STEP_LABELS = ["Plan Details", "Plan Data", "Select Reviewers"];

const BASE_PLAN_OWNERS = [
  { value: "john-smith", label: "John Smith" },
  { value: "sarah-johnson", label: "Sarah Johnson" },
  { value: "michael-chen", label: "Michael Chen" },
  { value: "emily-davis", label: "Emily Davis" },
  { value: "david-wilson", label: "David Wilson" },
];

type NavigationIcon = 
  | { type: "image"; src: string; alt: string; active: boolean }
  | { type: "lucide"; icon: "refresh-ccw"; alt: string; active: boolean };

const navigationIcons: NavigationIcon[] = [
  { type: "image", src: "/figmaAssets/module-dashboard-.svg", alt: "Module dashboard", active: false },
  { type: "image", src: "/figmaAssets/module-controls-.svg", alt: "Module controls", active: false },
  { type: "image", src: "/figmaAssets/module-risk-.svg", alt: "Module risk", active: false },
  { type: "image", src: "/figmaAssets/module-esg-.svg", alt: "Module esg", active: false },
  { type: "image", src: "/figmaAssets/module-crosscomply-.svg", alt: "Module crosscomply", active: false },
  { type: "image", src: "/figmaAssets/module-opsaudit.svg", alt: "Module opsaudit", active: false },
  { type: "image", src: "/figmaAssets/module-tprm.svg", alt: "Module tprm", active: false },
  { type: "lucide", icon: "refresh-ccw", alt: "BCM", active: true },
  { type: "image", src: "/figmaAssets/files.svg", alt: "Files", active: false },
  { type: "image", src: "/figmaAssets/module-report-.svg", alt: "Module report", active: false },
  { type: "image", src: "/figmaAssets/module-workstream-.svg", alt: "Module workstream", active: false },
  { type: "image", src: "/figmaAssets/module-automations-.svg", alt: "Module automations", active: false },
  { type: "image", src: "/figmaAssets/plug.svg", alt: "Plug", active: false },
  { type: "image", src: "/figmaAssets/module-issues.svg", alt: "Module issues", active: false },
  { type: "image", src: "/figmaAssets/module-files.svg", alt: "Module files", active: false },
  { type: "image", src: "/figmaAssets/module-timesheets.svg", alt: "Module timesheets", active: false },
  { type: "image", src: "/figmaAssets/module-settings-.svg", alt: "Module settings", active: false },
];

interface StepIndicatorProps {
  step: WizardStep;
  currentStep: WizardStep;
  label: string;
}

function StepIndicator({ step, currentStep, label }: StepIndicatorProps) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex flex-col gap-4 items-start w-40">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
          isCompleted
            ? "bg-[#266c92] text-white"
            : isActive
            ? "bg-white border-2 border-[#183153] p-1"
            : "bg-white border border-[rgba(1,55,126,0.11)] text-[rgba(24,49,83,0.67)]"
        }`}
        data-testid={`step-indicator-${step}`}
      >
        {isCompleted ? (
          <Check className="w-3 h-3" />
        ) : isActive ? (
          <div className="w-full h-full rounded-full bg-[#183153]" />
        ) : (
          step
        )}
      </div>
      <span
        className={`text-sm ${
          isActive
            ? "text-[rgba(1,8,24,0.93)]"
            : isCompleted
            ? "text-[rgba(1,8,24,0.93)]"
            : "text-[rgba(24,49,83,0.67)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

interface PlanTypeCardProps {
  type: "create" | "import";
  selected: boolean;
  onSelect: () => void;
}

function PlanTypeCard({ type, selected, onSelect }: PlanTypeCardProps) {
  const isCreate = type === "create";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex-1 rounded border p-4 text-center transition-colors ${
        selected
          ? "border-[#266c92] bg-white"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
      data-testid={`card-${type}-plan`}
    >
      <div className="flex flex-col items-center gap-1.5">
        {isCreate ? (
          <PlusCircle className="w-3 h-3 text-slate-500" />
        ) : (
          <Download className="w-3 h-3 text-slate-500" />
        )}
        <span className="text-sm text-slate-900">
          {isCreate ? "Create New Plan" : "Import Existing Plan"}
        </span>
        <p className="text-xs text-[rgba(24,49,83,0.67)] text-center">
          {isCreate
            ? "Manually provide information and content within your new Business Continuity Plan."
            : "Upload an existing document to import into AuditBoard"}
        </p>
      </div>
    </button>
  );
}

const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.xls,.xlsx";
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

interface FileDropZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

function FileDropZone({ file, onFileSelect }: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && ACCEPTED_MIME_TYPES.includes(droppedFile.type)) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded" data-testid="file-preview">
        <div className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded">
          <FileText className="w-5 h-5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate" data-testid="file-name">
            {file.name}
          </p>
          <p className="text-xs text-slate-500">
            {getFileExtension(file.name)} - {formatFileSize(file.size)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemoveFile}
          className="text-slate-400 hover:text-slate-600"
          data-testid="button-remove-file"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 p-4 border border-dashed rounded transition-colors ${
        isDragging
          ? "border-[#266c92] bg-[#266c92]/5"
          : "border-slate-300 bg-slate-50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="file-dropzone"
    >
      <Upload className="w-3.5 h-3.5 text-slate-500" />
      <span className="text-xs text-slate-900">Drag and drop file or</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleBrowseClick}
        className="h-[30px] px-2.5 text-xs border-slate-200"
        data-testid="button-browse-files"
      >
        Browse Files
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-file-upload"
      />
    </div>
  );
}

function LeftNavbar() {
  return (
    <aside
      className="flex flex-col w-14 items-center justify-between pt-2 pb-2.5 px-2 bg-gray-900 sticky top-0 h-screen z-50 flex-shrink-0"
      data-testid="side-navbar"
    >
      <nav className="flex flex-col items-center gap-1 relative flex-[0_0_auto]">
        <Link href="/">
          <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-logo">
            <img
              className="w-7 h-auto"
              alt="AuditBoard Logo"
              src="/figmaAssets/auditboard-logo.png?v=2"
            />
          </div>
        </Link>

        {navigationIcons.map((icon, index) => (
          <div
            key={index}
            className={`w-10 h-10 rounded flex items-center justify-center ${
              icon.active ? "bg-teal-500" : ""
            }`}
            data-testid={`navbar-icon-${index}`}
          >
            {icon.type === "lucide" ? (
              <div className="relative w-4 h-4 flex items-center justify-center">
                <RefreshCcw className="w-4 h-4 text-white absolute" />
                <Check className="w-2 h-2 text-white" strokeWidth={3} />
              </div>
            ) : (
              <img className={`w-4 h-4 ${icon.alt === "Plug" ? "opacity-50" : ""}`} alt={icon.alt} src={icon.src} />
            )}
          </div>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-support">
          <img
            className="w-4 h-4"
            alt="Support"
            src="/figmaAssets/circle-question-.svg"
          />
        </div>
      </div>
    </aside>
  );
}

export function BCPWizardPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/create-bcp/:processId");
  const processId = params?.processId || "";
  const process = getProcessById(processId);

  const planOwners = useMemo(() => {
    if (!process?.ownerTeam) return BASE_PLAN_OWNERS;
    
    const ownerValue = process.ownerTeam.toLowerCase().replace(/\s+/g, '-');
    const existsInBase = BASE_PLAN_OWNERS.some(o => o.value === ownerValue);
    
    if (existsInBase) return BASE_PLAN_OWNERS;
    
    return [
      { value: ownerValue, label: process.ownerTeam },
      ...BASE_PLAN_OWNERS,
    ];
  }, [process?.ownerTeam]);

  const defaultOwnerValue = process?.ownerTeam 
    ? process.ownerTeam.toLowerCase().replace(/\s+/g, '-') 
    : "";

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [planName, setPlanName] = useState(
    process ? `${process.name} - Business Continuity Plan` : ""
  );
  const [planOwner, setPlanOwner] = useState<string>(defaultOwnerValue);
  const [planType, setPlanType] = useState<"create" | "import">("create");
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleClose = () => {
    if (processId) {
      navigate(`/process/${processId}`);
    } else {
      navigate("/");
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    } else {
      console.log("Complete wizard", { planName, planOwner, planType, importFile: importFile?.name });
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const isStep1Valid = planName.trim() !== "" && planOwner !== "";

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-4 w-[700px]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <Label className="text-sm font-medium text-slate-900 mb-1">
                  Plan Name
                </Label>
                <Input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="h-8 border-slate-200 rounded"
                  data-testid="input-plan-name"
                />
              </div>

              <div className="flex flex-col">
                <Label className="text-sm font-medium text-slate-900 mb-1">
                  Plan Owner
                </Label>
                <Select value={planOwner} onValueChange={setPlanOwner}>
                  <SelectTrigger 
                    className="h-8 border-slate-200 rounded"
                    data-testid="select-plan-owner"
                  >
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {planOwners.map((owner) => (
                      <SelectItem key={owner.value} value={owner.value}>
                        {owner.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <PlanTypeCard
                type="create"
                selected={planType === "create"}
                onSelect={() => setPlanType("create")}
              />
              <PlanTypeCard
                type="import"
                selected={planType === "import"}
                onSelect={() => setPlanType("import")}
              />
            </div>

            {planType === "import" && (
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-900">
                  Upload Document
                </Label>
                <FileDropZone
                  file={importFile}
                  onFileSelect={setImportFile}
                />
                <p className="text-xs text-slate-500">
                  Supported formats: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-4 w-[700px]">
            <div className="text-center py-20">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Plan Data</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Configure the data and content for your Business Continuity Plan
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-4 w-[700px]">
            <div className="text-center py-20">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Select Reviewers</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Choose the reviewers who will approve your Business Continuity Plan
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background" data-testid="bcp-wizard-page">
      <LeftNavbar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <HeaderSection activeProcess={process || undefined} />
        <div className="flex items-stretch relative flex-1 self-stretch w-full grow">
          <SideNavigationSection />
          <div className="flex flex-col relative flex-1 self-stretch grow bg-white min-w-0" style={{ maxHeight: "calc(100vh - 60px)" }}>
            {/* Wizard Header */}
            <div className="flex flex-col gap-8 pt-8 px-8 bg-white border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold text-[rgba(1,8,24,0.93)]">
                  Create new Business Continuity Plan
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-slate-500 hover:text-slate-700"
                  data-testid="button-close-wizard"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Step Indicator */}
              <div className="flex gap-8 items-start relative overflow-hidden pb-6">
                {/* Connecting line */}
                <div className="absolute top-3 left-0 right-0 h-px bg-[#01377e] z-0" />
                
                {STEP_LABELS.map((label, index) => (
                  <div key={label} className="z-10">
                    <StepIndicator
                      step={(index + 1) as WizardStep}
                      currentStep={currentStep}
                      label={label}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Wizard Content */}
            <div className="flex-1 overflow-y-auto px-8 pt-8 pb-20">
              {renderStepContent()}
            </div>

            {/* Wizard Footer */}
            <div className="bg-white px-8 py-6 border-t border-slate-200">
              <div className="flex items-center justify-between w-[700px]">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="h-10 px-3 border-[rgba(14,59,113,0.21)] text-[rgba(1,8,24,0.93)]"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="h-10 px-3 border-[rgba(14,59,113,0.21)] text-[rgba(1,8,24,0.93)]"
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={currentStep === 1 && !isStep1Valid}
                  className="h-10 px-3 bg-[#266c92] hover:bg-[#1e5a7a] text-white"
                  data-testid="button-next"
                >
                  {currentStep === 3 ? "Complete" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BCPWizardPage;
