import React from "react";
import { Button } from "@/components/ui/button";

interface MultiStepFooterProps {
  onCancel: () => void;
  onContinue: () => void;
  canContinue?: boolean;
  continueLabel?: string;
}

export const MultiStepFooter = ({
  onCancel,
  onContinue,
  canContinue = true,
  continueLabel = "Continue",
}: MultiStepFooterProps): JSX.Element => {
  return (
    <div className="bg-white flex items-start px-8 py-6 border-t border-slate-200">
      <div className="flex items-start justify-between w-full">
        <div className="flex gap-2 items-start" />
        <div className="flex gap-2 items-start">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-[38px] bg-white border border-slate-300"
            data-testid="wizard-cancel-button"
          >
            <span className="font-normal text-sm text-[#0f172a] text-center">
              Cancel
            </span>
          </Button>
          <Button
            onClick={onContinue}
            disabled={!canContinue}
            className="h-[38px] gap-2 bg-[#266c92] hover:bg-[#266c92]/90 border border-[#266c92]"
            data-testid="wizard-continue-button"
          >
            <span className="font-normal text-sm text-white text-center">
              {continueLabel}
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
