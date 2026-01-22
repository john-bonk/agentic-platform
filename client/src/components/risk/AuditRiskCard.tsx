/**
 * AuditRiskCard Component
 * 
 * A sophisticated risk card component for the CAE M&A Audit and Compliance view.
 * Displays audit risk information with severity badges, dollar exposure, risk scores,
 * and trend sparklines. Expandable to show audit metrics, mitigations, and control effectiveness.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  User,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

export type AuditRiskSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type AuditStatus = "NOT STARTED" | "IN PROGRESS" | "COMPLETED" | "ON HOLD";

export interface AuditMitigationItem {
  id: string;
  text: string;
}

export interface AuditRiskData {
  id: string;
  name: string;
  severity: AuditRiskSeverity;
  exposure: string;
  description: string;
  riskScore: number;
  trendData: { value: number }[];
  auditHours?: number;
  deficiencies?: number;
  owner?: string;
  status: AuditStatus;
  recommendedMitigations: AuditMitigationItem[];
  costOfRemediation: string;
  costSource?: string;
  controlEffectivenessImprovement: string;
  controlEffectivenessDescription?: string;
}

interface AuditRiskCardProps {
  risk: AuditRiskData;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const severityStyles: Record<AuditRiskSeverity, { bg: string; text: string; border: string }> = {
  CRITICAL: {
    bg: "bg-red-600",
    text: "text-white",
    border: "border-red-600",
  },
  HIGH: {
    bg: "bg-orange-500",
    text: "text-white",
    border: "border-orange-500",
  },
  MEDIUM: {
    bg: "bg-amber-400",
    text: "text-gray-900",
    border: "border-amber-400",
  },
  LOW: {
    bg: "bg-green-500",
    text: "text-white",
    border: "border-green-500",
  },
};

const statusStyles: Record<AuditStatus, { bg: string; text: string }> = {
  "NOT STARTED": {
    bg: "bg-gray-200 dark:bg-gray-700",
    text: "text-gray-700 dark:text-gray-300",
  },
  "IN PROGRESS": {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  "COMPLETED": {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
  },
  "ON HOLD": {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
};

function TrendSparkline({ data }: { data: { value: number }[] }) {
  const isDownward = data.length >= 2 && data[data.length - 1].value < data[0].value;
  
  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={isDownward ? "#10b981" : "#ef4444"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RiskScoreIndicator({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-red-600";
    if (s >= 60) return "text-orange-500";
    if (s >= 40) return "text-amber-500";
    return "text-green-600";
  };

  return (
    <div className="flex items-center gap-1.5">
      <AlertTriangle className={`w-4 h-4 ${getColor(score)}`} />
      <span className={`text-sm font-semibold ${getColor(score)}`}>
        {score}
      </span>
    </div>
  );
}

export function AuditRiskCard({ risk, isExpanded = false, onToggleExpand }: AuditRiskCardProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const handleToggle = onToggleExpand || (() => setLocalExpanded(!localExpanded));

  const severityStyle = severityStyles[risk.severity];
  const auditStatusStyle = statusStyles[risk.status];

  return (
    <Card 
      className="overflow-visible border border-gray-200 dark:border-border bg-white dark:bg-card"
      data-testid={`audit-risk-card-${risk.id}`}
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover-elevate"
        onClick={handleToggle}
        data-testid={`audit-risk-card-header-${risk.id}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Badge 
            className={`${severityStyle.bg} ${severityStyle.text} text-xs font-semibold px-2 py-0.5 no-default-hover-elevate no-default-active-elevate`}
            data-testid={`badge-severity-${risk.id}`}
          >
            {risk.severity}
          </Badge>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground truncate" data-testid={`text-audit-risk-name-${risk.id}`}>
                {risk.name}
              </h3>
              <span className="text-lg font-bold text-gray-900 dark:text-foreground" data-testid={`text-audit-exposure-${risk.id}`}>
                {risk.exposure}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 line-clamp-1" data-testid={`text-audit-description-${risk.id}`}>
              {risk.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-muted-foreground">Risk Score</span>
              <RiskScoreIndicator score={risk.riskScore} />
            </div>
          </div>
          
          <TrendSparkline data={risk.trendData} />
          
          <Button 
            variant="ghost" 
            size="icon"
            className="flex-shrink-0"
            data-testid={`button-expand-${risk.id}`}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Separator />
            <div className="p-4 bg-gray-50 dark:bg-muted space-y-4" data-testid={`audit-risk-details-${risk.id}`}>
              {/* Audit Metrics Row */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    AUDIT HOURS
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-foreground" data-testid={`text-audit-hours-${risk.id}`}>
                    {risk.auditHours?.toLocaleString() || "—"}
                  </span>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground mb-1">DEFICIENCIES</div>
                  <span className="text-sm font-bold text-gray-900 dark:text-foreground" data-testid={`text-deficiencies-${risk.id}`}>
                    {risk.deficiencies || "—"}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground mb-1">
                    <User className="w-3 h-3" />
                    OWNER
                  </div>
                  {risk.owner ? (
                    <span className="text-sm font-medium text-[#266C92]" data-testid={`text-audit-owner-${risk.id}`}>
                      {risk.owner}
                    </span>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      data-testid={`button-assign-owner-${risk.id}`}
                    >
                      Assign Owner
                    </Button>
                  )}
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground mb-1">STATUS</div>
                  <Badge 
                    className={`${auditStatusStyle.bg} ${auditStatusStyle.text} text-xs font-medium no-default-hover-elevate no-default-active-elevate`}
                    data-testid={`badge-audit-status-${risk.id}`}
                  >
                    {risk.status}
                  </Badge>
                </div>
              </div>

              {/* Recommended Mitigations */}
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground mb-2">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  RECOMMENDED MITIGATIONS
                </div>
                <ul className="space-y-1" data-testid={`list-audit-mitigations-${risk.id}`}>
                  {risk.recommendedMitigations.map((mitigation) => (
                    <li key={mitigation.id} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      {mitigation.text}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Cost of Remediation and Control Effectiveness */}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground mb-1">COST OF REMEDIATION</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-foreground" data-testid={`text-remediation-cost-${risk.id}`}>
                      {risk.costOfRemediation}
                    </span>
                    {risk.costSource && (
                      <span className="text-xs text-gray-500 dark:text-muted-foreground">{risk.costSource}</span>
                    )}
                  </div>
                </div>
                
                {/* Control Effectiveness Improvement Box */}
                <div className="flex-1 max-w-md bg-gradient-to-r from-[#266C92]/10 to-[#266C92]/5 dark:from-[#266C92]/20 dark:to-[#266C92]/10 border border-[#266C92]/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#266C92]" />
                    <span className="text-sm font-semibold text-[#266C92]">Control effectiveness improvement</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2" data-testid={`text-control-description-${risk.id}`}>
                    {risk.controlEffectivenessDescription || "Projected compliance readiness improvement through targeted remediation"}
                  </p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid={`text-control-improvement-${risk.id}`}>
                      {risk.controlEffectivenessImprovement}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
