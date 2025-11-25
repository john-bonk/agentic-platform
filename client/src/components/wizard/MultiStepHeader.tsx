import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  completed: boolean;
}

interface MultiStepHeaderProps {
  currentStep: number;
  steps: Step[];
}

export const MultiStepHeader = ({ currentStep, steps }: MultiStepHeaderProps): JSX.Element => {
  return (
    <div className="bg-white flex flex-col gap-8 pb-3 pt-8 px-8 w-full flex-shrink-0">
      <div className="flex gap-4 items-end w-full">
        <p className="flex-1 font-semibold text-lg text-[#010818ed]">
          Add Vulnerability Import Job
        </p>
        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            className="h-[38px] gap-2 px-[10.4px] bg-white shadow-sm border border-gray-200"
            data-testid="vulnerability-documentation-button"
          >
            <div className="w-4 h-4 opacity-85 bg-[url(/figmaAssets/module-narrative-.svg)] bg-[100%_100%]" />
            <span className="font-normal text-sm text-gray-600">
              Vulnerability Import Documentation
            </span>
          </Button>
        </div>
      </div>

      <div className="flex gap-8 items-start overflow-hidden w-full relative">
        <div className="absolute h-0 left-0 right-0 top-[13px]">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t-2 border-gray-200" />
        </div>

        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col gap-4 items-start w-40 relative z-10" data-testid={`step-indicator-${index + 1}`}>
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                index < currentStep
                  ? "border-green-600 bg-green-600"
                  : index === currentStep
                  ? "border-[#18315399] bg-white"
                  : "border-[#01377e1c] bg-white"
              }`}
              data-testid={`step-circle-${index + 1}`}
            >
              {index < currentStep && (
                <Check className="w-4 h-4 text-white" strokeWidth={3} data-testid={`step-check-${index + 1}`} />
              )}
              {index === currentStep && (
                <div className="w-4 h-4 rounded-full bg-[#18315399]" />
              )}
            </div>
            <p
              className={`text-sm font-normal min-w-full ${
                index <= currentStep ? "text-[#010818ed]" : "text-[#18315399]"
              }`}
              data-testid={`step-label-${index + 1}`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
