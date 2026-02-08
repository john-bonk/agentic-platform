import { X, Building2, MapPin, Users, Server, Package, FileText, Shield, AlertTriangle, CheckCircle2, Clock, TrendingUp, Link2, ChevronRight, Activity, Calendar, User, BarChart3, ExternalLink, Edit2, Trash2, Copy, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export interface EntityDetails {
  id: string;
  name: string;
  type: "location" | "legal-entity" | "facility" | "product-line" | "team" | "it-system" | "framework" | "policy" | "risk" | "control" | "process";
  description?: string;
  status?: "active" | "pending" | "review" | "new";
  riskLevel?: "low" | "medium" | "high" | "critical";
  complianceScore?: number;
  owner?: string;
  lastReviewed?: string;
  createdDate?: string;
  relatedEntities?: { id: string; name: string; type: string; relationship: string }[];
  recentActivity?: { action: string; user: string; date: string; details?: string }[];
  metrics?: { label: string; value: string | number; trend?: "up" | "down" | "stable" }[];
  controls?: { id: string; name: string; status: "effective" | "needs-improvement" | "ineffective" }[];
  risks?: { id: string; name: string; severity: "low" | "medium" | "high" | "critical" }[];
  tags?: string[];
}

interface EntityDetailPanelProps {
  entity: EntityDetails | null;
  onClose: () => void;
  onNavigate?: (entityId: string) => void;
}

const typeIcons: Record<string, typeof Building2> = {
  "location": MapPin,
  "legal-entity": Building2,
  "facility": Building2,
  "product-line": Package,
  "team": Users,
  "it-system": Server,
  "framework": Shield,
  "policy": FileText,
  "risk": AlertTriangle,
  "control": CheckCircle2,
  "process": Activity,
};

const typeLabels: Record<string, string> = {
  "location": "Location",
  "legal-entity": "Legal Entity",
  "facility": "Facility",
  "product-line": "Product Line",
  "team": "Team",
  "it-system": "IT System",
  "framework": "Framework",
  "policy": "Policy",
  "risk": "Risk",
  "control": "Control",
  "process": "Process",
};

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  new: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const controlStatusColors: Record<string, string> = {
  "effective": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "needs-improvement": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "ineffective": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function EntityDetailPanel({ entity, onClose, onNavigate }: EntityDetailPanelProps) {
  if (!entity) return null;

  const Icon = typeIcons[entity.type] || Building2;

  return (
    <div 
      className="fixed right-0 top-0 h-full w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl z-50 flex flex-col"
      style={{ animation: 'slideInPanel 0.3s ease-in-out' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#266C92]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{entity.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{typeLabels[entity.type]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" data-testid="button-entity-more">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-panel">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex-wrap">
        {entity.status && (
          <Badge variant="secondary" className={`${statusColors[entity.status]} text-xs`}>
            {entity.status.charAt(0).toUpperCase() + entity.status.slice(1)}
          </Badge>
        )}
        {entity.riskLevel && (
          <Badge variant="secondary" className={`${riskColors[entity.riskLevel]} text-xs`}>
            {entity.riskLevel.charAt(0).toUpperCase() + entity.riskLevel.slice(1)} Risk
          </Badge>
        )}
        {entity.tags?.slice(0, 1).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-transparent p-0 px-6 pt-2 h-auto gap-4 border-b border-slate-200 dark:border-slate-700 rounded-none">
          <TabsTrigger value="overview" className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-medium text-slate-500" data-testid="tab-entity-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="relationships" className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-medium text-slate-500" data-testid="tab-entity-relationships">
            Relationships
          </TabsTrigger>
          <TabsTrigger value="activity" className="bg-transparent px-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#266C92] data-[state=active]:text-[#266C92] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-medium text-slate-500" data-testid="tab-entity-activity">
            Activity
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="m-0 p-4 space-y-5">
            {entity.description && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{entity.description}</p>
              </div>
            )}

            {entity.complianceScore !== undefined && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Compliance Score</h4>
                <div className="flex items-center gap-3">
                  <Progress value={entity.complianceScore} className="flex-1 h-2" />
                  <span className={`text-sm font-semibold ${
                    entity.complianceScore >= 80 ? "text-green-600" : 
                    entity.complianceScore >= 60 ? "text-yellow-600" : "text-red-600"
                  }`}>{entity.complianceScore}%</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {entity.owner && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <User className="w-3.5 h-3.5" />
                    Owner
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{entity.owner}</p>
                </div>
              )}
              {entity.lastReviewed && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Last Reviewed
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{entity.lastReviewed}</p>
                </div>
              )}
            </div>

            {entity.metrics && entity.metrics.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Key Metrics</h4>
                <div className="space-y-2">
                  {entity.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{metric.value}</span>
                        {metric.trend && (
                          <TrendingUp className={`w-4 h-4 ${
                            metric.trend === "up" ? "text-green-500" : 
                            metric.trend === "down" ? "text-red-500 rotate-180" : "text-slate-400"
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entity.controls && entity.controls.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Associated Controls</h4>
                <div className="space-y-2">
                  {entity.controls.map((control) => (
                    <div key={control.id} className="flex items-center justify-between py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg hover-elevate cursor-pointer">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{control.name}</span>
                      <Badge variant="secondary" className={`${controlStatusColors[control.status]} text-xs`}>
                        {control.status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entity.risks && entity.risks.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Linked Risks</h4>
                <div className="space-y-2">
                  {entity.risks.map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg hover-elevate cursor-pointer">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          risk.severity === "critical" ? "text-red-500" :
                          risk.severity === "high" ? "text-orange-500" :
                          risk.severity === "medium" ? "text-yellow-500" : "text-green-500"
                        }`} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{risk.name}</span>
                      </div>
                      <Badge variant="secondary" className={`${riskColors[risk.severity]} text-xs`}>
                        {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="relationships" className="m-0 p-4 space-y-4">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connected Entities</h4>
            {entity.relatedEntities && entity.relatedEntities.length > 0 ? (
              <div className="space-y-2">
                {entity.relatedEntities.map((related) => {
                  const RelIcon = typeIcons[related.type] || Building2;
                  return (
                    <div 
                      key={related.id}
                      className="flex items-center justify-between py-2.5 px-3 border border-slate-200 dark:border-slate-700 rounded-lg hover-elevate cursor-pointer group"
                      onClick={() => onNavigate?.(related.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <RelIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{related.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{related.relationship}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Link2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No relationships defined</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="m-0 p-4 space-y-4">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Activity</h4>
            {entity.recentActivity && entity.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {entity.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-white">{activity.action}</p>
                      {activity.details && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activity.details}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{activity.user}</span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span>{activity.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="flex-1 bg-[#266C92] hover:bg-[#1e5270]" data-testid="button-edit-entity">
            <Edit2 className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" data-testid="button-duplicate-entity">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" data-testid="button-open-external">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function generateEntityDetails(nodeId: string, nodeLabel: string, nodeType: string): EntityDetails {
  const typeMap: Record<string, EntityDetails["type"]> = {
    "locations": "location",
    "legal-entities": "legal-entity",
    "facilities": "facility",
    "product-lines": "product-line",
    "teams": "team",
    "it-systems": "it-system",
    "regulatory-frameworks": "framework",
    "compliance-frameworks": "framework",
    "policies": "policy",
    "risks": "risk",
    "controls": "control",
    "processes": "process",
  };

  const entityType = typeMap[nodeType] || "facility";
  
  const descriptions: Record<string, string> = {
    "location": `${nodeLabel} is a strategic geographic region within MegaCorp's global operations footprint, encompassing multiple business units and regulatory jurisdictions.`,
    "legal-entity": `${nodeLabel} is a registered legal entity operating under MegaCorp's corporate structure, responsible for specific business operations and regulatory compliance in its jurisdiction.`,
    "facility": `${nodeLabel} is a key operational facility supporting MegaCorp's production, distribution, or administrative functions with dedicated infrastructure and workforce.`,
    "product-line": `${nodeLabel} represents a distinct product category within MegaCorp's portfolio, targeting specific market segments with dedicated R&D and manufacturing capabilities.`,
    "team": `${nodeLabel} is a functional team responsible for critical business operations, maintaining cross-departmental coordination and specialized expertise.`,
    "it-system": `${nodeLabel} is an enterprise application supporting MegaCorp's digital infrastructure, integrated with core business processes and data governance frameworks.`,
    "framework": `${nodeLabel} defines the regulatory and compliance requirements governing MegaCorp's operations, ensuring adherence to industry standards and legal obligations.`,
    "policy": `${nodeLabel} establishes organizational guidelines and procedures for consistent operations across all business units and geographic regions.`,
    "risk": `${nodeLabel} represents an identified threat to MegaCorp's operations, requiring active monitoring, mitigation strategies, and contingency planning.`,
    "control": `${nodeLabel} is a safeguard mechanism implemented to mitigate risks and ensure compliance with internal policies and external regulations.`,
    "process": `${nodeLabel} defines a standardized workflow supporting MegaCorp's operational efficiency, quality assurance, and continuous improvement initiatives.`,
  };

  const owners = ["Sarah Chen", "Michael Rodriguez", "Jennifer Kim", "David Thompson", "Lisa Wang", "Robert Johnson"];
  const dates = ["Dec 15, 2025", "Jan 3, 2026", "Nov 28, 2025", "Jan 5, 2026", "Dec 20, 2025"];
  
  const relatedEntities: EntityDetails["relatedEntities"] = [
    { id: "rel-1", name: "ISO 14001 Certification", type: "framework", relationship: "Compliance Framework" },
    { id: "rel-2", name: "Supply Chain Management", type: "it-system", relationship: "Primary System" },
    { id: "rel-3", name: "Sustainability Team", type: "team", relationship: "Responsible Team" },
    { id: "rel-4", name: "Climate Risk Assessment", type: "risk", relationship: "Associated Risk" },
  ];

  const recentActivity: EntityDetails["recentActivity"] = [
    { action: "Compliance assessment completed", user: "Sarah Chen", date: "2 hours ago", details: "Annual review passed with 94% score" },
    { action: "Risk rating updated", user: "Michael Rodriguez", date: "1 day ago", details: "Changed from Medium to Low" },
    { action: "Control mapping added", user: "Jennifer Kim", date: "3 days ago", details: "Linked to 3 new controls" },
    { action: "Documentation updated", user: "David Thompson", date: "1 week ago" },
  ];

  const metrics: EntityDetails["metrics"] = [
    { label: "Controls Mapped", value: Math.floor(Math.random() * 20) + 5, trend: "up" },
    { label: "Open Issues", value: Math.floor(Math.random() * 5), trend: "down" },
    { label: "Test Coverage", value: `${Math.floor(Math.random() * 30) + 70}%`, trend: "stable" },
    { label: "Risk Score", value: Math.floor(Math.random() * 40) + 20, trend: "down" },
  ];

  const controls: EntityDetails["controls"] = [
    { id: "ctrl-1", name: "Access Control Review", status: "effective" },
    { id: "ctrl-2", name: "Data Integrity Check", status: "effective" },
    { id: "ctrl-3", name: "Change Management", status: "needs-improvement" },
  ];

  const risks: EntityDetails["risks"] = [
    { id: "risk-1", name: "Data Security Breach", severity: "high" },
    { id: "risk-2", name: "Regulatory Non-Compliance", severity: "medium" },
    { id: "risk-3", name: "Operational Disruption", severity: "low" },
  ];

  if (nodeId === "sea-foodsource") {
    return {
      id: nodeId,
      name: nodeLabel,
      type: entityType,
      description: `${nodeLabel} is a recently acquired legal entity specializing in sustainable seafood and plant-based marine protein alternatives across Southeast Asia.`,
      status: "new",
      riskLevel: "medium",
      complianceScore: 72,
      owner: "Sarah Chen",
      lastReviewed: "Jan 3, 2026",
      createdDate: "Dec 15, 2025",
      relatedEntities,
      recentActivity,
      metrics: [
        { label: "Controls Mapped", value: 4, trend: "up" },
        { label: "Open Issues", value: 3, trend: "down" },
        { label: "Test Coverage", value: "72%", trend: "stable" },
      ],
      controls,
      risks,
      tags: ["M&A Integration"],
    };
  }

  const statuses: EntityDetails["status"][] = ["active", "pending", "review", "new"];
  const riskLevels: EntityDetails["riskLevel"][] = ["low", "medium", "high"];

  return {
    id: nodeId,
    name: nodeLabel,
    type: entityType,
    description: descriptions[entityType],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    complianceScore: Math.floor(Math.random() * 30) + 70,
    owner: owners[Math.floor(Math.random() * owners.length)],
    lastReviewed: dates[Math.floor(Math.random() * dates.length)],
    createdDate: "Mar 15, 2024",
    relatedEntities,
    recentActivity,
    metrics,
    controls,
    risks,
    tags: nodeType.includes("sea") || nodeLabel.includes("Singapore") || nodeLabel.includes("SEA") 
      ? ["M&A Integration"] 
      : undefined,
  };
}
