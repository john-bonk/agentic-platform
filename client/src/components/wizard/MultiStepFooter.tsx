import React from "react";
import { Button } from "@/components/ui/button";

interface MultiStepFooterProps {
  onCancel: () => void;
  onContinue: () => void;
  onPrevious?: () => void;
  canContinue?: boolean;
  continueLabel?: string;
  currentStep?: number;
}

export const MultiStepFooter = ({
  onCancel,
  onContinue,
  onPrevious,
  canContinue = true,
  continueLabel = "Continue",
  currentStep,
}: MultiStepFooterProps): JSX.Element => {
  const isLastStep = currentStep === 3;
  const isFirstStep = currentStep === 0;
  const buttonLabel = isLastStep ? "Start Import" : continueLabel;
  return (
    <div className="bg-white flex items-start px-8 py-6 border-t border-gray-200 w-full flex-shrink-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2 items-center">
          {!isFirstStep && onPrevious && (
            <Button
              variant="ghost"
              onClick={onPrevious}
              className="h-[38px] gap-2 text-gray-700 hover:text-gray-900"
              data-testid="wizard-previous-button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm">Previous</span>
            </Button>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-[38px] bg-white border border-gray-300"
            data-testid="wizard-cancel-button"
          >
            <span className="font-normal text-sm text-gray-900 text-center">
              Cancel
            </span>
          </Button>
          <Button
            onClick={onContinue}
            disabled={!canContinue}
            className="h-[38px] gap-2 bg-teal-500 hover:bg-teal-500/90 border border-teal-500"
            data-testid="wizard-continue-button"
          >
            <span className="font-normal text-sm text-white text-center">
              {buttonLabel}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
            >
              <path
                d="M5.5 3.5L10.5 8L5.5 12.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
