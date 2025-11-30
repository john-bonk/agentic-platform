import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 px-4 py-3 border-l-4",
  {
    variants: {
      variant: {
        default: "border-l-[#508ee7]",
        info: "border-l-[#508ee7]",
        success: "border-l-green-500",
        warning: "border-l-amber-500",
        destructive: "border-l-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const alertIconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  destructive: AlertCircle,
}

const alertIconColorMap = {
  default: "text-[#3172E3]",
  info: "text-[#3172E3]",
  success: "text-green-500",
  warning: "text-amber-500",
  destructive: "text-red-500",
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  showIcon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", showIcon = true, children, ...props }, ref) => {
    const IconComponent = alertIconMap[variant || "default"];
    const iconColor = alertIconColorMap[variant || "default"];
    
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="flex gap-2 items-start">
          {showIcon && (
            <div className="shrink-0 pt-0.5">
              <IconComponent className={cn("w-3 h-3", iconColor)} />
            </div>
          )}
          <div className="flex-1 flex flex-col gap-0.5">
            {children}
          </div>
        </div>
      </div>
    );
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs font-medium text-gray-900 dark:text-gray-100 leading-[1.25]", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-gray-500 dark:text-gray-400 leading-[1.25]", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
