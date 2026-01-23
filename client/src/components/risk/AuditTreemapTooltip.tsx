/**
 * AuditTreemapTooltip Component
 * 
 * Displays CAE-specific tooltip content for the treemap including:
 * - Facility/Location info with residual risk score
 * - Recent Audit Testing status
 * - Issues Past SLA
 * - Audit Objectives summary
 */

import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Building2, 
  Check, 
  AlertCircle,
  Clock,
} from "lucide-react";

export interface AuditTest {
  id: string;
  name: string;
  date: string;
  status: "passed" | "warning" | "failed";
}

export interface IssuePastSLA {
  id: string;
  title: string;
  dueDate: string;
  assignee: string;
  status: "OVERDUE" | "AT RISK";
}

export interface AuditTooltipData {
  residualRisk: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  dollarValue: string;
  facilityName: string;
  parentCompany: string;
  region: string;
  recentAuditTests: AuditTest[];
  issuesPastSLA: IssuePastSLA[];
  auditObjectives: {
    complete: number;
    inProgress: number;
    overdue: number;
  };
}

interface AuditTreemapTooltipProps {
  companyName: string;
  locationName?: string;
  tooltip: AuditTooltipData;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export function AuditTreemapTooltip({ 
  companyName, 
  locationName, 
  tooltip, 
  onClose,
  anchorRect
}: AuditTreemapTooltipProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-600 text-white";
      case "High": return "bg-orange-500 text-white";
      case "Medium": return "bg-amber-400 text-gray-900";
      case "Low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <Check className="w-3 h-3 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-3 h-3 text-amber-500" />;
      case "failed":
        return <X className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getIssueStatusStyle = (status: string) => {
    switch (status) {
      case "OVERDUE":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "AT RISK":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      default:
        return "bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground";
    }
  };

  if (!anchorRect) return null;

  const tooltipWidth = 288;
  const viewportWidth = window.innerWidth;
  const spaceOnRight = viewportWidth - anchorRect.right;
  
  const positionStyles: React.CSSProperties = spaceOnRight >= tooltipWidth + 20
    ? { top: anchorRect.top + window.scrollY, left: anchorRect.right + 8 }
    : { top: anchorRect.top + window.scrollY, left: anchorRect.left - tooltipWidth - 8 };

  return createPortal(
    <div 
      className="fixed z-[9999] w-72 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg shadow-xl"
      style={positionStyles}
      onClick={(e) => e.stopPropagation()}
      data-testid={`audit-tooltip-${locationName || companyName}`}
    >
      {/* Header */}
      <div className="p-3 bg-gray-50 dark:bg-muted border-b border-gray-100 dark:border-border rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground">
            <Building2 className="w-3 h-3" />
            FACILITY
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 -mr-1"
            onClick={onClose}
            data-testid="button-close-audit-tooltip"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        <h4 className="font-semibold text-[#266C92] text-sm" data-testid="text-audit-facility-name">
          {tooltip.facilityName}
        </h4>
        <p className="text-xs text-gray-500 dark:text-muted-foreground">
          {tooltip.parentCompany} • {tooltip.region}
        </p>
      </div>

      {/* Residual Risk Score */}
      <div className="p-3 border-b border-gray-100 dark:border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-muted-foreground">RESIDUAL RISK</span>
            <span className="text-xl font-bold text-gray-900 dark:text-foreground" data-testid="text-audit-residual-risk">
              {tooltip.residualRisk}
            </span>
            <Badge 
              className={`${getSeverityColor(tooltip.severity)} text-xs no-default-hover-elevate no-default-active-elevate`}
              data-testid="badge-audit-severity"
            >
              {tooltip.severity.toUpperCase()}
            </Badge>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-foreground" data-testid="text-audit-dollar-value">
            {tooltip.dollarValue}
          </span>
        </div>
      </div>

      {/* Recent Audit Testing */}
      <div className="p-3 border-b border-gray-100 dark:border-border">
        <div className="text-xs text-gray-500 dark:text-muted-foreground mb-2">RECENT AUDIT TESTING</div>
        <div className="space-y-1.5" data-testid="list-audit-tests">
          {tooltip.recentAuditTests.map((test) => (
            <div key={test.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#266C92]">•</span>
                <span className="text-gray-700 dark:text-foreground">{test.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 dark:text-muted-foreground">{test.date}</span>
                {getTestStatusIcon(test.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues Past SLA */}
      {tooltip.issuesPastSLA.length > 0 && (
        <div className="p-3 border-b border-gray-100 dark:border-border">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-muted-foreground mb-2">
            <span>ISSUES PAST SLA</span>
            <Badge 
              variant="destructive" 
              className="h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full no-default-hover-elevate no-default-active-elevate"
            >
              {tooltip.issuesPastSLA.length}
            </Badge>
          </div>
          <div className="space-y-2" data-testid="list-issues-past-sla">
            {tooltip.issuesPastSLA.map((issue) => (
              <div key={issue.id} className="text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-gray-900 dark:text-foreground truncate max-w-[180px]">{issue.title}</span>
                  <Badge 
                    className={`${getIssueStatusStyle(issue.status)} text-[10px] px-1.5 py-0 no-default-hover-elevate no-default-active-elevate`}
                  >
                    {issue.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-400 dark:text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Due: {issue.dueDate}</span>
                  <span>•</span>
                  <span>Assigned: {issue.assignee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Objectives Summary */}
      <div className="p-3">
        <div className="text-xs text-gray-500 dark:text-muted-foreground mb-2">ALL AUDIT OBJECTIVES</div>
        <div className="flex items-center gap-3" data-testid="audit-objectives-summary">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold flex items-center justify-center">
              {tooltip.auditObjectives.complete}
            </span>
            <span className="text-xs text-gray-600 dark:text-muted-foreground">Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center">
              {tooltip.auditObjectives.inProgress}
            </span>
            <span className="text-xs text-gray-600 dark:text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold flex items-center justify-center">
              {tooltip.auditObjectives.overdue}
            </span>
            <span className="text-xs text-gray-600 dark:text-muted-foreground">Overdue</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
