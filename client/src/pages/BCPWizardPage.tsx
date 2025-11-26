import { useState, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { X, PlusCircle, Download, Check } from "lucide-react";
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

type WizardStep = 1 | 2 | 3;

const STEP_LABELS = ["Plan Details", "Plan Data", "Select Reviewers"];

const BASE_PLAN_OWNERS = [
  { value: "john-smith", label: "John Smith" },
  { value: "sarah-johnson", label: "Sarah Johnson" },
  { value: "michael-chen", label: "Michael Chen" },
  { value: "emily-davis", label: "Emily Davis" },
  { value: "david-wilson", label: "David Wilson" },
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
      console.log("Complete wizard", { planName, planOwner, planType });
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
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-8 pt-8 px-8 bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-[rgba(1,8,24,0.93)] dark:text-white">
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
        <div className="flex gap-8 items-start relative overflow-hidden">
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-20">
        {renderStepContent()}
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between w-[700px]">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-10 px-3 border-[rgba(14,59,113,0.21)] text-[rgba(1,8,24,0.93)] dark:text-white"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-10 px-3 border-[rgba(14,59,113,0.21)] text-[rgba(1,8,24,0.93)] dark:text-white"
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
  );
}

export default BCPWizardPage;
