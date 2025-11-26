import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BCPEmptyStateProps {
  onCreateNew: () => void;
}

export function BCPEmptyState({ onCreateNew }: BCPEmptyStateProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center gap-2 p-8 w-full min-h-[300px]"
      data-testid="bcp-empty-state"
    >
      <div className="relative w-[72px] h-[72px] flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <FileText className="w-12 h-12 text-gray-300" strokeWidth={1.5} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-sm transform rotate-12" />
            <div className="absolute top-1 -right-2 w-2 h-2 bg-yellow-300 rounded-sm transform -rotate-6" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className="flex flex-col items-center gap-2 pt-2 text-center w-full">
          <h3 
            className="text-xl font-medium text-gray-900 dark:text-gray-100 leading-tight"
            data-testid="text-bcp-empty-title"
          >
            No Business Continuity Plan
          </h3>
          <p 
            className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
            data-testid="text-bcp-empty-description"
          >
            This process doesn't have a Business Continuity Plan yet. Create one to define recovery procedures and ensure business resilience.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-1">
          <Button 
            variant="outline" 
            size="sm"
            data-testid="button-view-template"
          >
            View Template
          </Button>
          <Button 
            size="sm"
            onClick={onCreateNew}
            data-testid="button-create-bcp"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
