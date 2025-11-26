import { Button } from "@/components/ui/button";

interface BCPEmptyStateProps {
  onCreateNew: () => void;
}

function DocumentIcon() {
  return (
    <svg 
      width="72" 
      height="72" 
      viewBox="0 0 72 72" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <g transform="translate(4.5, 5)">
        <path 
          d="M32.6304 10.4641L51.4306 52.4915L18.8023 57.0769L0 15.0515L32.6283 10.4662V10.4641Z" 
          fill="#E5FE52"
        />
        <path 
          d="M32.6304 10.4641L51.4306 52.4915L18.8023 57.0769L0 15.0515L32.6283 10.4662V10.4641Z" 
          stroke="#CBD5E1" 
          strokeWidth="0.8"
        />
        <path 
          d="M44.957 6.72684L63.7592 48.7563L31.1309 53.3417L12.3287 11.3143L44.957 6.72684Z" 
          fill="#E5FE52"
        />
        <path 
          d="M44.957 6.72684L63.7592 48.7563L31.1309 53.3417L12.3287 11.3143L44.957 6.72684Z" 
          stroke="#CBD5E1" 
          strokeWidth="0.8"
        />
        <rect 
          x="8" 
          y="8" 
          width="40" 
          height="52" 
          rx="2" 
          fill="white" 
          stroke="#CBD5E1" 
          strokeWidth="1"
        />
        <line x1="14" y1="20" x2="42" y2="20" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="28" x2="38" y2="28" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="36" x2="35" y2="36" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="44" x2="30" y2="44" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

export function BCPEmptyState({ onCreateNew }: BCPEmptyStateProps) {
  return (
    <div 
      className="flex flex-col items-center gap-2 p-4 w-full"
      data-testid="bcp-empty-state"
    >
      <div className="overflow-clip relative shrink-0 w-[72px] h-[72px]">
        <DocumentIcon />
      </div>
      
      <div className="flex flex-col gap-4 items-start w-full">
        <div className="flex flex-col gap-2 items-start pt-2 text-center w-full">
          <p 
            className="w-full text-[20px] font-medium text-[#0f172a] dark:text-slate-100 leading-[1.2]"
            data-testid="text-bcp-empty-title"
          >
            No Business Continuity Plan
          </p>
          <p 
            className="w-full text-[14px] font-normal text-[#475569] dark:text-slate-400 leading-[1.35]"
            data-testid="text-bcp-empty-description"
          >
            This process doesn't have a Business Continuity Plan yet. Create one to define recovery procedures and ensure business resilience.
          </p>
        </div>
        
        <div className="flex gap-1 items-center justify-center w-full">
          <button
            className="h-7 px-2 bg-white dark:bg-slate-800 border border-[#cbd5e1] dark:border-slate-600 rounded text-[13px] text-[#0f172a] dark:text-slate-100 leading-[1.35] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            data-testid="button-view-template"
          >
            View Template
          </button>
          <button
            onClick={onCreateNew}
            className="h-7 px-2 bg-[#266c92] border border-[#266c92] rounded text-[13px] text-white leading-[1.35] hover:bg-[#1e5a7a] transition-colors"
            data-testid="button-create-bcp"
          >
            Create Plan
          </button>
        </div>
      </div>
    </div>
  );
}
