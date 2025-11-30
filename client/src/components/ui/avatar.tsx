"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { User } from "lucide-react"

import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md" | "lg"
type AvatarStatus = "none" | "success" | "error"

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-12 w-12",
}

const fontSizeClasses: Record<AvatarSize, string> = {
  sm: "text-[10px]",
  md: "text-sm",
  lg: "text-xl",
}

const iconSizeClasses: Record<AvatarSize, string> = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-6 h-6",
}

const statusClasses: Record<AvatarStatus, string> = {
  none: "",
  success: "ring-2 ring-green-500",
  error: "ring-2 ring-red-500",
}

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: AvatarSize
  status?: AvatarStatus
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = "md", status = "none", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full",
      sizeClasses[size],
      statusClasses[status],
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  size?: AvatarSize
  showIcon?: boolean
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, size = "md", showIcon = false, children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-slate-500 text-white",
      fontSizeClasses[size],
      className
    )}
    {...props}
  >
    {showIcon ? (
      <User className={cn("text-white", iconSizeClasses[size])} />
    ) : (
      children
    )}
  </AvatarPrimitive.Fallback>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
export type { AvatarSize, AvatarStatus }
