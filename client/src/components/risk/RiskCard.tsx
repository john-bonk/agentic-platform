/**
 * RiskCard Component
 * 
 * A sophisticated risk card component for the Global Residual Risk view.
 * Displays risk information with severity badges, dollar exposure, risk scores,
 * and trend sparklines. Expandable to show mitigation details.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  User,
  Calendar,
  TrendingDown,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

export type RiskSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type MitigationStatus = "NOT STARTED" | "IN PROGRESS" | "COMPLETED" | "ON HOLD";

export interface MitigationItem {
  id: string;
  text: string;
}

export interface RiskData {
  id: string;
  name: string;
  severity: RiskSeverity;
  exposure: string;
  description: string;
  riskScore: number;
  trendData: { value: number }[];
  timeline?: string;
  owner?: string;
  mitigationStatus: MitigationStatus;
  recommendedMitigations: MitigationItem[];
  costOfMitigation: string;
  costSource?: string;
  projectedImpact: string;
}

interface RiskCardProps {
  risk: RiskData;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const severityStyles: Record<RiskSeverity, { bg: string; text: string; border: string }> = {
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

const mitigationStatusStyles: Record<MitigationStatus, { bg: string; text: string }> = {
  "NOT STARTED": {
    bg: "bg-gray-200",
    text: "text-gray-700",
  },
  "IN PROGRESS": {
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  "COMPLETED": {
    bg: "bg-green-100",
    text: "text-green-700",
  },
  "ON HOLD": {
    bg: "bg-amber-100",
    text: "text-amber-700",
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

function RiskScoreIndicator({ score, navigateTo }: { score: number; navigateTo?: string }) {
  const [, setLocation] = useLocation();
  const getColor = (s: number) => {
    if (s >= 80) return "text-red-600";
    if (s >= 60) return "text-orange-500";
    if (s >= 40) return "text-amber-500";
    return "text-green-600";
  };

  if (navigateTo) {
    return (
      <button
        className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -mx-1.5 -my-0.5 hover-elevate active-elevate-2 transition-colors group"
        onClick={(e) => {
          e.stopPropagation();
          setLocation(navigateTo);
        }}
        data-testid="button-risk-score-nav"
      >
        <AlertTriangle className={`w-4 h-4 ${getColor(score)}`} />
        <span className={`text-sm font-semibold ${getColor(score)}`}>
          {score}
        </span>
        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <AlertTriangle className={`w-4 h-4 ${getColor(score)}`} />
      <span className={`text-sm font-semibold ${getColor(score)}`}>
        {score}
      </span>
    </div>
  );
}

export function RiskCard({ risk, isExpanded = false, onToggleExpand }: RiskCardProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const handleToggle = onToggleExpand || (() => setLocalExpanded(!localExpanded));

  const severityStyle = severityStyles[risk.severity];
  const statusStyle = mitigationStatusStyles[risk.mitigationStatus];

  return (
    <Card 
      className="overflow-visible border border-gray-200 dark:border-border bg-white dark:bg-card"
      data-testid={`risk-card-${risk.id}`}
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover-elevate"
        onClick={handleToggle}
        data-testid={`risk-card-header-${risk.id}`}
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
              <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground truncate" data-testid={`text-risk-name-${risk.id}`}>
                {risk.name}
              </h3>
              <span className="text-lg font-bold text-gray-900 dark:text-foreground" data-testid={`text-exposure-${risk.id}`}>
                {risk.exposure}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 line-clamp-1" data-testid={`text-description-${risk.id}`}>
              {risk.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-muted-foreground">Risk Score</span>
              <RiskScoreIndicator
                score={risk.riskScore}
                navigateTo={risk.id === "risk-1" ? "/risk-calculation" : undefined}
              />
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
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
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
            <div className="p-4 bg-gray-50 dark:bg-muted space-y-4" data-testid={`risk-details-${risk.id}`}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground mb-1">
                    <Calendar className="w-3 h-3" />
                    TIMELINE
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-foreground" data-testid={`text-timeline-${risk.id}`}>
                    {risk.timeline || "TBD"}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground mb-1">
                    <User className="w-3 h-3" />
                    OWNER
                  </div>
                  {risk.owner ? (
                    <span className="text-sm font-medium text-gray-900 dark:text-foreground" data-testid={`text-owner-${risk.id}`}>
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
                  <div className="text-xs text-gray-500 dark:text-muted-foreground mb-1">MITIGATION STATUS</div>
                  <Badge 
                    className={`${statusStyle.bg} ${statusStyle.text} text-xs font-medium no-default-hover-elevate no-default-active-elevate`}
                    data-testid={`badge-status-${risk.id}`}
                  >
                    {risk.mitigationStatus}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground mb-2">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  RECOMMENDED MITIGATIONS
                </div>
                <ul className="space-y-1" data-testid={`list-mitigations-${risk.id}`}>
                  {risk.recommendedMitigations.map((mitigation) => (
                    <li key={mitigation.id} className="flex items-start gap-2 text-sm text-gray-700 dark:text-foreground">
                      <span className="text-gray-400 dark:text-muted-foreground">•</span>
                      {mitigation.text}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground mb-1">COST OF MITIGATION</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-foreground" data-testid={`text-cost-${risk.id}`}>
                      {risk.costOfMitigation}
                    </span>
                    {risk.costSource && (
                      <span className="text-xs text-gray-500 dark:text-muted-foreground">from {risk.costSource}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground mb-1 justify-end">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    Projected Impact
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <ArrowDown className="w-4 h-4" />
                    <span className="text-lg font-bold" data-testid={`text-impact-${risk.id}`}>
                      {risk.projectedImpact}
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
