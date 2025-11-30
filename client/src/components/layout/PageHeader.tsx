/**
 * PageHeader Component
 * 
 * CANONICAL IMPLEMENTATION - Use this for all page headers.
 * DO NOT create custom page headers - use PageHeader instead.
 * 
 * A reusable header for page content with title and optional actions.
 * 
 * Usage:
 * ```tsx
 * import { PageHeader } from "@/components/layout";
 * 
 * <PageHeader 
 *   title="My Page"
 *   description="Optional description"
 *   actions={<Button>Create</Button>}
 * />
 * ```
 */

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className = "" }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2 py-6 px-8 w-full bg-white pl-[24px] pr-[24px] pt-[16px] pb-[16px]">
      <div className="flex gap-4 items-start w-full flex-wrap">
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <h1 
            className="font-semibold text-gray-900 text-[20px]" 
            data-testid="page-title"
          >
            {title}
          </h1>
          {description && (
            <p 
              className="text-sm text-gray-500 mt-1"
              data-testid="page-description"
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex gap-2 items-start flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
