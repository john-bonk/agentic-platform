import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      size: {
        sm: "h-3 px-1.5 text-[10px] leading-[1.35]",
        md: "h-4 px-1.5 text-[10px] leading-[1.35]",
        lg: "h-5 px-2 text-[11px] leading-[1.35]",
      },
      badgeColor: {
        gray: "",
        blue: "",
        red: "",
        orange: "",
        yellow: "",
        green: "",
        purple: "",
        teal: "",
      },
      weight: {
        weak: "",
        normal: "border bg-transparent",
        strong: "",
        extraStrong: "",
      },
    },
    compoundVariants: [
      { badgeColor: "gray", weight: "weak", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
      { badgeColor: "gray", weight: "normal", className: "border-gray-500 text-gray-600 dark:border-gray-400 dark:text-gray-300" },
      { badgeColor: "gray", weight: "strong", className: "bg-gray-500 text-white dark:bg-gray-600" },
      { badgeColor: "gray", weight: "extraStrong", className: "bg-gray-700 text-white dark:bg-gray-800" },
      
      { badgeColor: "blue", weight: "weak", className: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" },
      { badgeColor: "blue", weight: "normal", className: "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300" },
      { badgeColor: "blue", weight: "strong", className: "bg-[#3172e3] text-white" },
      { badgeColor: "blue", weight: "extraStrong", className: "bg-blue-700 text-white dark:bg-blue-800" },
      
      { badgeColor: "red", weight: "weak", className: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300" },
      { badgeColor: "red", weight: "normal", className: "border-red-500 text-red-600 dark:border-red-400 dark:text-red-300" },
      { badgeColor: "red", weight: "strong", className: "bg-red-500 text-white" },
      { badgeColor: "red", weight: "extraStrong", className: "bg-red-700 text-white dark:bg-red-800" },
      
      { badgeColor: "orange", weight: "weak", className: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300" },
      { badgeColor: "orange", weight: "normal", className: "border-orange-500 text-orange-600 dark:border-orange-400 dark:text-orange-300" },
      { badgeColor: "orange", weight: "strong", className: "bg-orange-500 text-white" },
      { badgeColor: "orange", weight: "extraStrong", className: "bg-orange-700 text-white dark:bg-orange-800" },
      
      { badgeColor: "yellow", weight: "weak", className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
      { badgeColor: "yellow", weight: "normal", className: "border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300" },
      { badgeColor: "yellow", weight: "strong", className: "bg-yellow-500 text-yellow-900" },
      { badgeColor: "yellow", weight: "extraStrong", className: "bg-yellow-600 text-yellow-900" },
      
      { badgeColor: "green", weight: "weak", className: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-300" },
      { badgeColor: "green", weight: "normal", className: "border-green-500 text-green-600 dark:border-green-400 dark:text-green-300" },
      { badgeColor: "green", weight: "strong", className: "bg-green-500 text-white" },
      { badgeColor: "green", weight: "extraStrong", className: "bg-green-700 text-white dark:bg-green-800" },
      
      { badgeColor: "purple", weight: "weak", className: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300" },
      { badgeColor: "purple", weight: "normal", className: "border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-300" },
      { badgeColor: "purple", weight: "strong", className: "bg-purple-500 text-white" },
      { badgeColor: "purple", weight: "extraStrong", className: "bg-purple-700 text-white dark:bg-purple-800" },
      
      { badgeColor: "teal", weight: "weak", className: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300" },
      { badgeColor: "teal", weight: "normal", className: "border-teal-500 text-teal-600 dark:border-teal-400 dark:text-teal-300" },
      { badgeColor: "teal", weight: "strong", className: "bg-[#266C92] text-white" },
      { badgeColor: "teal", weight: "extraStrong", className: "bg-teal-700 text-white dark:bg-teal-800" },
    ],
    defaultVariants: {
      size: "md",
      badgeColor: "gray",
      weight: "strong",
    },
  },
);

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
type BadgeColor = "gray" | "blue" | "red" | "orange" | "yellow" | "green" | "purple" | "teal";
type BadgeWeight = "weak" | "normal" | "strong" | "extraStrong";
type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  variant?: BadgeVariant;
  badgeColor?: BadgeColor;
  weight?: BadgeWeight;
  size?: BadgeSize;
}

function Badge({ className, size, badgeColor, weight, variant, ...props }: BadgeProps) {
  if (variant) {
    const legacyMapping: Record<BadgeVariant, { badgeColor: BadgeColor; weight: BadgeWeight }> = {
      default: { badgeColor: "gray", weight: "strong" },
      secondary: { badgeColor: "gray", weight: "weak" },
      destructive: { badgeColor: "red", weight: "strong" },
      outline: { badgeColor: "gray", weight: "normal" },
    };
    const mapped = legacyMapping[variant];
    return (
      <div className={cn(badgeVariants({ size, badgeColor: mapped.badgeColor, weight: mapped.weight }), className)} {...props} />
    );
  }
  
  return (
    <div className={cn(badgeVariants({ size, badgeColor, weight }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
