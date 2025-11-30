import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type StepState = "complete" | "active" | "pending"

interface WizardStep {
  id: string
  label: string
  state?: StepState
}

interface WizardContextValue {
  steps: WizardStep[]
  currentStep: number
  setCurrentStep: (step: number) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const WizardContext = React.createContext<WizardContextValue | undefined>(undefined)

function useWizard() {
  const context = React.useContext(WizardContext)
  if (!context) {
    throw new Error("useWizard must be used within a Wizard")
  }
  return context
}

interface WizardProps {
  children: React.ReactNode
  steps: WizardStep[]
  defaultStep?: number
  onStepChange?: (step: number) => void
  className?: string
}

function Wizard({ 
  children, 
  steps, 
  defaultStep = 0, 
  onStepChange,
  className 
}: WizardProps) {
  const [currentStep, setCurrentStepInternal] = React.useState(defaultStep)

  const stepsWithState = steps.map((step, index) => ({
    ...step,
    state: (index < currentStep ? "complete" : index === currentStep ? "active" : "pending") as StepState
  }))

  const setCurrentStep = (step: number) => {
    setCurrentStepInternal(step)
    onStepChange?.(step)
  }

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <WizardContext.Provider
      value={{
        steps: stepsWithState,
        currentStep,
        setCurrentStep,
        goToNextStep,
        goToPreviousStep,
        isFirstStep: currentStep === 0,
        isLastStep: currentStep === steps.length - 1,
      }}
    >
      <div className={cn("flex flex-col bg-white dark:bg-gray-900", className)}>
        {children}
      </div>
    </WizardContext.Provider>
  )
}

interface WizardHeaderProps {
  title: string
  children?: React.ReactNode
  className?: string
}

function WizardHeader({ title, children, className }: WizardHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-8 px-8 pt-8 pb-3", className)}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
      <WizardStepIndicator />
    </div>
  )
}

function WizardStepIndicator({ className }: { className?: string }) {
  const { steps, currentStep } = useWizard()

  return (
    <div className={cn("relative flex gap-8 overflow-hidden", className)}>
      <div className="absolute left-0 right-0 top-3 h-px bg-slate-200 dark:bg-slate-700 z-0" />
      <div 
        className="absolute left-0 top-3 h-px bg-[#266C92] z-0 transition-all duration-300" 
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />
      
      {steps.map((step, index) => (
        <WizardStepItem 
          key={step.id} 
          step={step} 
          index={index}
        />
      ))}
    </div>
  )
}

interface WizardStepItemProps {
  step: WizardStep
  index: number
}

function WizardStepItem({ step }: WizardStepItemProps) {
  const state = step.state || "pending"

  return (
    <div className="flex flex-col gap-4 items-start w-40 relative z-10">
      <div
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full",
          state === "complete" && "bg-slate-200 dark:bg-slate-600",
          state === "active" && "bg-white dark:bg-gray-900 border-2 border-[#266C92] p-1",
          state === "pending" && "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700"
        )}
        data-testid={`wizard-step-indicator-${step.id}`}
      >
        {state === "complete" && (
          <Check className="w-4 h-4 text-slate-700 dark:text-slate-200" />
        )}
        {state === "active" && (
          <div className="w-full h-full rounded-full bg-[#266C92]" />
        )}
      </div>
      <span
        className={cn(
          "text-sm",
          state === "active" 
            ? "text-gray-900 dark:text-gray-100 font-medium" 
            : "text-slate-500 dark:text-slate-400"
        )}
        data-testid={`wizard-step-label-${step.id}`}
      >
        {step.label}
      </span>
    </div>
  )
}

interface WizardContentProps {
  children: React.ReactNode
  className?: string
}

function WizardContent({ children, className }: WizardContentProps) {
  return (
    <div className={cn("flex-1 p-6", className)}>
      {children}
    </div>
  )
}

interface WizardFooterProps {
  children?: React.ReactNode
  className?: string
  showDefaultButtons?: boolean
  previousLabel?: string
  nextLabel?: string
  finishLabel?: string
  secondaryLabel?: string
  tertiaryLabel?: string
  showSecondaryButton?: boolean
  showTertiaryButton?: boolean
  onFinish?: () => void
  onSecondary?: () => void
  onTertiary?: () => void
}

function WizardFooter({ 
  children, 
  className,
  showDefaultButtons = true,
  previousLabel = "Previous",
  nextLabel = "Next",
  finishLabel = "Finish",
  secondaryLabel = "Cancel",
  tertiaryLabel = "Save Draft",
  showSecondaryButton = true,
  showTertiaryButton = true,
  onFinish,
  onSecondary,
  onTertiary
}: WizardFooterProps) {
  const { goToNextStep, goToPreviousStep, isFirstStep, isLastStep } = useWizard()

  if (children) {
    return (
      <div className={cn("flex items-center justify-between gap-4 px-8 py-6", className)}>
        {children}
      </div>
    )
  }

  if (!showDefaultButtons) return null

  return (
    <div className={cn("flex items-center justify-between gap-4 px-8 py-6", className)}>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          data-testid="wizard-button-previous"
        >
          {previousLabel}
        </Button>
        {showTertiaryButton && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onTertiary}
            data-testid="wizard-button-tertiary"
          >
            {tertiaryLabel}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showSecondaryButton && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSecondary}
            data-testid="wizard-button-secondary"
          >
            {secondaryLabel}
          </Button>
        )}
        {isLastStep ? (
          <Button 
            size="sm"
            onClick={onFinish}
            data-testid="wizard-button-finish"
          >
            {finishLabel}
          </Button>
        ) : (
          <Button 
            size="sm"
            onClick={goToNextStep}
            data-testid="wizard-button-next"
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export { 
  Wizard, 
  WizardHeader, 
  WizardStepIndicator, 
  WizardContent, 
  WizardFooter,
  useWizard
}
export type { WizardStep, StepState }
