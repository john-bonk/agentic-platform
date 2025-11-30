import { LucideIcon, Search, FileX, Inbox, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateVariant = "search" | "no-data" | "no-items" | "empty-folder";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline";
}

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  heading?: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  tertiaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantDefaults: Record<EmptyStateVariant, { icon: LucideIcon; heading: string; description: string }> = {
  search: {
    icon: Search,
    heading: "No results found",
    description: "We couldn't find any matches for your search. Try adjusting your keywords or filters to find what you're looking for.",
  },
  "no-data": {
    icon: FileX,
    heading: "No data available",
    description: "There's no data to display at the moment. Check back later or try refreshing the page.",
  },
  "no-items": {
    icon: Inbox,
    heading: "No items yet",
    description: "Get started by creating your first item. It only takes a few moments to set up.",
  },
  "empty-folder": {
    icon: FolderOpen,
    heading: "This folder is empty",
    description: "There are no files or items in this location. Add something to get started.",
  },
};

export function EmptyState({
  variant = "no-items",
  icon,
  heading,
  description,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  className = "",
}: EmptyStateProps) {
  const defaults = variantDefaults[variant];
  const IconComponent = icon || defaults.icon;
  const displayHeading = heading || defaults.heading;
  const displayDescription = description || defaults.description;

  return (
    <div 
      className={`flex flex-col items-center gap-2 max-w-[400px] p-4 rounded ${className}`}
      data-testid="empty-state"
    >
      <div className="w-[72px] h-[72px] flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <IconComponent className="w-8 h-8 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-2 items-center pt-2 text-center w-full">
        <h3 
          className="text-xl font-medium text-gray-900 dark:text-gray-100 leading-[1.2]"
          data-testid="empty-state-heading"
        >
          {displayHeading}
        </h3>
        <p 
          className="text-sm text-gray-500 dark:text-gray-400 leading-[1.35]"
          data-testid="empty-state-description"
        >
          {displayDescription}
        </p>
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex gap-1 items-center justify-center w-full pt-2">
          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              data-testid="empty-state-secondary-action"
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant="default"
              size="sm"
              onClick={primaryAction.onClick}
              data-testid="empty-state-primary-action"
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}

      {tertiaryAction && (
        <div className="flex items-center justify-center w-full">
          <button
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            onClick={tertiaryAction.onClick}
            data-testid="empty-state-tertiary-action"
          >
            {tertiaryAction.label}
          </button>
        </div>
      )}
    </div>
  );
}
