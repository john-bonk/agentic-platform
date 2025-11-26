import { useState, useEffect } from "react";
import { X, FileText, Upload, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

interface BCPWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processName?: string;
  onComplete?: (data: BCPWizardData) => void;
}

export interface BCPWizardData {
  planName: string;
  planOwner: string;
  planType: "create" | "import";
}

const planOwners = [
  "Baylor Cruz",
  "Dante Bradford",
  "Leah Sullivan",
  "Marcus Chen",
  "Sarah Johnson",
  "James Wilson",
];

type WizardStep = 1 | 2 | 3;

interface StepIndicatorProps {
  step: WizardStep;
  currentStep: WizardStep;
  label: string;
}

function StepIndicator({ step, currentStep, label }: StepIndicatorProps) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
          isActive
            ? "bg-[#266c92] text-white"
            : isCompleted
            ? "bg-[#266c92] text-white"
            : "bg-transparent border-2 border-[#cbd5e1] dark:border-slate-600 text-[#94a3b8] dark:text-slate-500"
        }`}
        data-testid={`step-indicator-${step}`}
      >
        {isCompleted ? <Check className="w-3 h-3" /> : step}
      </div>
      <span
        className={`text-[13px] ${
          isActive
            ? "text-[#266c92] font-medium"
            : "text-[#64748b] dark:text-slate-400"
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
      className={`flex-1 p-4 rounded-md border-2 transition-all text-left ${
        selected
          ? "border-[#266c92] bg-[#f0f9ff] dark:bg-slate-800"
          : "border-[#e2e8f0] dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#cbd5e1] dark:hover:border-slate-600"
      }`}
      data-testid={`card-plan-type-${type}`}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            selected
              ? "text-[#266c92]"
              : "text-[#94a3b8] dark:text-slate-500"
          }`}
        >
          {isCreate ? (
            <FileText className="w-5 h-5" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </div>
        <div>
          <p
            className={`text-[14px] font-medium ${
              selected
                ? "text-[#0f172a] dark:text-slate-100"
                : "text-[#475569] dark:text-slate-300"
            }`}
          >
            {isCreate ? "Create New Plan" : "Import Existing Plan"}
          </p>
          <p className="text-[12px] text-[#64748b] dark:text-slate-400 mt-1">
            {isCreate
              ? "Manually provide information and content within your new Business Continuity Plan"
              : "Upload an existing document to import into AuditBoard"}
          </p>
        </div>
      </div>
    </button>
  );
}

export function BCPWizard({
  open,
  onOpenChange,
  processName,
  onComplete,
}: BCPWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [planName, setPlanName] = useState(
    processName ? `${processName} - Business Continuity Plan` : ""
  );
  const [planOwner, setPlanOwner] = useState<string>("");
  const [planType, setPlanType] = useState<"create" | "import">("create");

  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setPlanName(processName ? `${processName} - Business Continuity Plan` : "");
      setPlanOwner("");
      setPlanType("create");
    }
  }, [open, processName]);

  const handleClose = () => {
    setCurrentStep(1);
    setPlanName(processName ? `${processName} - Business Continuity Plan` : "");
    setPlanOwner("");
    setPlanType("create");
    onOpenChange(false);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    } else {
      onComplete?.({
        planName,
        planOwner,
        planType,
      });
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const isStep1Valid = planName.trim() !== "" && planOwner !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[640px] p-0 gap-0 bg-white dark:bg-slate-900 border-0 rounded-lg shadow-xl"
        data-testid="dialog-bcp-wizard"
      >
        <DialogTitle className="sr-only">Create new Business Continuity Plan</DialogTitle>
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-[20px] font-semibold text-[#0f172a] dark:text-slate-100">
            Create new Business Continuity Plan
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-[#64748b] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-slate-100"
            data-testid="button-close-wizard"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center gap-16 px-6 py-4 border-b border-[#e2e8f0] dark:border-slate-700">
          <StepIndicator step={1} currentStep={currentStep} label="Plan Details" />
          <StepIndicator step={2} currentStep={currentStep} label="Plan Data" />
          <StepIndicator step={3} currentStep={currentStep} label="Select Reviewers" />
        </div>

        <div className="p-6 min-h-[300px]">
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="plan-name"
                  className="text-[13px] font-medium text-[#0f172a] dark:text-slate-100"
                >
                  Plan Name
                </Label>
                <Input
                  id="plan-name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Enter plan name"
                  className="h-10 text-[14px] border-[#e2e8f0] dark:border-slate-700 focus:border-[#266c92] focus:ring-[#266c92]"
                  data-testid="input-plan-name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="plan-owner"
                  className="text-[13px] font-medium text-[#0f172a] dark:text-slate-100"
                >
                  Plan Owner
                </Label>
                <Select value={planOwner} onValueChange={setPlanOwner}>
                  <SelectTrigger
                    id="plan-owner"
                    className="h-10 text-[14px] border-[#e2e8f0] dark:border-slate-700"
                    data-testid="select-plan-owner"
                  >
                    <SelectValue placeholder="Select an owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {planOwners.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 mt-2">
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
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col items-center justify-center h-[250px] text-center">
              <div className="text-[#94a3b8] dark:text-slate-500 mb-2">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              </div>
              <p className="text-[16px] font-medium text-[#475569] dark:text-slate-300">
                Plan Data Configuration
              </p>
              <p className="text-[13px] text-[#94a3b8] dark:text-slate-500 mt-1">
                This step will be configured in the next phase
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col items-center justify-center h-[250px] text-center">
              <div className="text-[#94a3b8] dark:text-slate-500 mb-2">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              </div>
              <p className="text-[16px] font-medium text-[#475569] dark:text-slate-300">
                Select Reviewers
              </p>
              <p className="text-[13px] text-[#94a3b8] dark:text-slate-500 mt-1">
                This step will be configured in the next phase
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 pt-4 border-t border-[#e2e8f0] dark:border-slate-700">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handleBack}
            className="h-9 px-4 text-[13px] border-[#e2e8f0] dark:border-slate-700 text-[#475569] dark:text-slate-300"
            data-testid="button-wizard-cancel"
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === 1 && !isStep1Valid}
            className="h-9 px-4 text-[13px] bg-[#266c92] hover:bg-[#1e5a7a] text-white disabled:opacity-50"
            data-testid="button-wizard-next"
          >
            {currentStep === 3 ? "Create Plan" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
