/**
 * StrategicAuditObjectives Component
 * 
 * Displays CAE-specific strategic audit objectives with progress bars,
 * due dates, and owner information. Similar to StrategicObjectives but
 * tailored for audit/compliance context.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, User } from "lucide-react";

export type AuditObjectiveStatus = "In Progress" | "Complete" | "Overdue" | "At Risk";

export interface StrategicAuditObjective {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: AuditObjectiveStatus;
  dueDate: string;
  owner: string;
}

interface StrategicAuditObjectivesProps {
  objectives: StrategicAuditObjective[];
}

const statusStyles: Record<AuditObjectiveStatus, { bg: string; text: string }> = {
  "In Progress": {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  "Complete": {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
  },
  "Overdue": {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
  "At Risk": {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
};

export function StrategicAuditObjectives({ objectives }: StrategicAuditObjectivesProps) {
  return (
    <Card data-testid="panel-strategic-audit-objectives">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Target className="w-5 h-5 text-[#266C92]" />
          Strategic Audit Objectives
          <Badge variant="secondary" className="ml-2 text-xs">
            {objectives.length} Objectives
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" data-testid="list-audit-objectives">
        {objectives.map((objective) => {
          const statusStyle = statusStyles[objective.status];
          
          return (
            <div 
              key={objective.id}
              className="border border-gray-200 dark:border-border rounded-lg p-4 bg-white dark:bg-card"
              data-testid={`audit-objective-${objective.id}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-[#266C92]/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-[#266C92]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-1" data-testid={`text-objective-title-${objective.id}`}>
                      {objective.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground line-clamp-1" data-testid={`text-objective-description-${objective.id}`}>
                      {objective.description}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={`${statusStyle.bg} ${statusStyle.text} text-xs no-default-hover-elevate no-default-active-elevate`}
                  data-testid={`badge-objective-status-${objective.id}`}
                >
                  {objective.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-muted-foreground">Progress</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-foreground" data-testid={`text-objective-progress-${objective.id}`}>
                      {objective.progress}%
                    </span>
                  </div>
                  <Progress 
                    value={objective.progress} 
                    className="h-2"
                    data-testid={`progress-bar-${objective.id}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>Due: </span>
                  <span className="text-gray-700 dark:text-foreground font-medium" data-testid={`text-objective-due-${objective.id}`}>
                    {objective.dueDate}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  <span>Owner: </span>
                  <span className="text-gray-700 dark:text-foreground font-medium" data-testid={`text-objective-owner-${objective.id}`}>
                    {objective.owner}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
