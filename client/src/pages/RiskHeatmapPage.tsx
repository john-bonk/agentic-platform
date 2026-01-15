/**
 * Risk Heatmap Page
 * 
 * Sophisticated 5x5 probability-impact risk matrix with interactive cells,
 * risk distribution visualization, and drill-down capabilities.
 * 
 * Path: /cro/risk-heatmap
 */

import { useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Download,
  RefreshCw,
  Info,
  ChevronRight,
  Building2,
  Globe,
  Shield,
  DollarSign,
  Zap,
  Target,
  Layers,
} from "lucide-react";

interface RiskItem {
  id: string;
  name: string;
  category: string;
  probability: number;
  impact: number;
  exposure: string;
  trend: "up" | "down" | "stable";
  owner: string;
  lastUpdated: string;
}

const mockRisks: RiskItem[] = [
  { id: "r1", name: "US Tariff Escalation", category: "Regulatory", probability: 5, impact: 5, exposure: "$10.2M", trend: "up", owner: "Legal", lastUpdated: "2 hours ago" },
  { id: "r2", name: "Supply Chain Disruption", category: "Operational", probability: 4, impact: 5, exposure: "$8.5M", trend: "up", owner: "Operations", lastUpdated: "4 hours ago" },
  { id: "r3", name: "Currency Volatility", category: "Financial", probability: 4, impact: 4, exposure: "$6.1M", trend: "stable", owner: "Treasury", lastUpdated: "1 day ago" },
  { id: "r4", name: "Cyber Attack Vector", category: "Technology", probability: 3, impact: 5, exposure: "$7.8M", trend: "up", owner: "IT Security", lastUpdated: "6 hours ago" },
  { id: "r5", name: "Key Supplier Bankruptcy", category: "Strategic", probability: 2, impact: 5, exposure: "$4.2M", trend: "down", owner: "Procurement", lastUpdated: "2 days ago" },
  { id: "r6", name: "Regulatory Non-Compliance", category: "Regulatory", probability: 3, impact: 4, exposure: "$3.5M", trend: "stable", owner: "Compliance", lastUpdated: "12 hours ago" },
  { id: "r7", name: "Market Share Erosion", category: "Strategic", probability: 3, impact: 3, exposure: "$2.8M", trend: "up", owner: "Strategy", lastUpdated: "3 days ago" },
  { id: "r8", name: "Data Privacy Breach", category: "Technology", probability: 2, impact: 4, exposure: "$5.1M", trend: "down", owner: "IT Security", lastUpdated: "1 day ago" },
  { id: "r9", name: "Labor Shortage", category: "Operational", probability: 4, impact: 3, exposure: "$2.1M", trend: "stable", owner: "HR", lastUpdated: "5 hours ago" },
  { id: "r10", name: "Interest Rate Increase", category: "Financial", probability: 5, impact: 2, exposure: "$1.8M", trend: "up", owner: "Finance", lastUpdated: "8 hours ago" },
  { id: "r11", name: "Product Recall", category: "Operational", probability: 2, impact: 4, exposure: "$3.9M", trend: "stable", owner: "Quality", lastUpdated: "4 days ago" },
  { id: "r12", name: "IP Infringement", category: "Legal", probability: 2, impact: 3, exposure: "$1.5M", trend: "down", owner: "Legal", lastUpdated: "1 week ago" },
  { id: "r13", name: "Climate Event Impact", category: "Environmental", probability: 3, impact: 4, exposure: "$4.7M", trend: "up", owner: "Operations", lastUpdated: "2 days ago" },
  { id: "r14", name: "Talent Retention", category: "Human Capital", probability: 4, impact: 2, exposure: "$1.2M", trend: "stable", owner: "HR", lastUpdated: "3 days ago" },
  { id: "r15", name: "Technology Obsolescence", category: "Technology", probability: 3, impact: 2, exposure: "$0.9M", trend: "down", owner: "IT", lastUpdated: "1 week ago" },
];

const categories = ["All", "Regulatory", "Operational", "Financial", "Technology", "Strategic", "Environmental", "Human Capital", "Legal"];

const probabilityLabels = ["Very Low", "Low", "Medium", "High", "Very High"];
const impactLabels = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"];

function getCellColor(prob: number, impact: number): string {
  const score = prob * impact;
  if (score >= 20) return "bg-red-500 dark:bg-red-600";
  if (score >= 12) return "bg-orange-500 dark:bg-orange-600";
  if (score >= 6) return "bg-yellow-500 dark:bg-yellow-600";
  if (score >= 3) return "bg-green-400 dark:bg-green-600";
  return "bg-green-300 dark:bg-green-700";
}

function getCellOpacity(count: number): string {
  if (count === 0) return "opacity-60";
  if (count >= 3) return "opacity-100 ring-2 ring-white/50";
  return "opacity-90";
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Regulatory": return <Shield className="w-4 h-4" />;
    case "Operational": return <Zap className="w-4 h-4" />;
    case "Financial": return <DollarSign className="w-4 h-4" />;
    case "Technology": return <Layers className="w-4 h-4" />;
    case "Strategic": return <Target className="w-4 h-4" />;
    case "Environmental": return <Globe className="w-4 h-4" />;
    case "Human Capital": return <Building2 className="w-4 h-4" />;
    default: return <AlertTriangle className="w-4 h-4" />;
  }
}

export default function RiskHeatmapPage() {
  const [selectedCell, setSelectedCell] = useState<{ prob: number; impact: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"matrix" | "distribution">("matrix");

  const filteredRisks = selectedCategory === "All" 
    ? mockRisks 
    : mockRisks.filter(r => r.category === selectedCategory);

  const getRisksInCell = (prob: number, impact: number) => 
    filteredRisks.filter(r => r.probability === prob && r.impact === impact);

  const selectedRisks = selectedCell 
    ? getRisksInCell(selectedCell.prob, selectedCell.impact)
    : [];

  const totalExposure = filteredRisks.reduce((acc, r) => 
    acc + parseFloat(r.exposure.replace(/[$M,]/g, "")), 0
  );

  const criticalCount = filteredRisks.filter(r => r.probability * r.impact >= 20).length;
  const highCount = filteredRisks.filter(r => r.probability * r.impact >= 12 && r.probability * r.impact < 20).length;
  const mediumCount = filteredRisks.filter(r => r.probability * r.impact >= 6 && r.probability * r.impact < 12).length;
  const lowCount = filteredRisks.filter(r => r.probability * r.impact < 6).length;

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader 
          title="Risk Heatmap" 
          description="Interactive probability-impact matrix for enterprise risk visualization"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" data-testid="button-filter-heatmap">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" data-testid="button-export-heatmap">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" data-testid="button-refresh-heatmap">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          }
        />

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Exposure</p>
                      <p className="text-2xl font-bold text-[#266C92]">${totalExposure.toFixed(1)}M</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#266C92]/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-[#266C92]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Critical Risks</p>
                      <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">High Risks</p>
                      <p className="text-2xl font-bold text-orange-600">{highCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Medium / Low</p>
                      <p className="text-2xl font-bold text-green-600">{mediumCount + lowCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? "bg-[#266C92] hover:bg-[#1e5a7a]" : ""}
                  data-testid={`filter-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Probability × Impact Matrix</CardTitle>
                      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "matrix" | "distribution")}>
                        <TabsList className="h-8">
                          <TabsTrigger value="matrix" className="text-xs px-3">Matrix</TabsTrigger>
                          <TabsTrigger value="distribution" className="text-xs px-3">Distribution</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {viewMode === "matrix" ? (
                      <div className="relative">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground whitespace-nowrap">
                          PROBABILITY
                        </div>
                        <div className="ml-8">
                          <div className="grid grid-cols-6 gap-1">
                            <div />
                            {impactLabels.map((label, idx) => (
                              <div key={idx} className="text-center text-xs text-muted-foreground py-2 font-medium">
                                {label}
                              </div>
                            ))}
                          </div>
                          
                          {[5, 4, 3, 2, 1].map(prob => (
                            <div key={prob} className="grid grid-cols-6 gap-1 mb-1">
                              <div className="flex items-center justify-end pr-2 text-xs text-muted-foreground font-medium">
                                {probabilityLabels[prob - 1]}
                              </div>
                              {[1, 2, 3, 4, 5].map(impact => {
                                const risksInCell = getRisksInCell(prob, impact);
                                const isSelected = selectedCell?.prob === prob && selectedCell?.impact === impact;
                                return (
                                  <button
                                    key={impact}
                                    onClick={() => setSelectedCell(isSelected ? null : { prob, impact })}
                                    className={`
                                      aspect-square rounded-lg ${getCellColor(prob, impact)} ${getCellOpacity(risksInCell.length)}
                                      flex items-center justify-center transition-all duration-200
                                      hover:scale-105 hover:shadow-lg cursor-pointer
                                      ${isSelected ? "ring-4 ring-[#266C92] scale-105 shadow-xl" : ""}
                                    `}
                                    data-testid={`heatmap-cell-${prob}-${impact}`}
                                  >
                                    {risksInCell.length > 0 && (
                                      <span className="text-white font-bold text-lg drop-shadow-md">
                                        {risksInCell.length}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                          
                          <div className="text-center text-xs font-medium text-muted-foreground mt-4">
                            IMPACT
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500" />
                            <span className="text-xs text-muted-foreground">Critical (20-25)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-orange-500" />
                            <span className="text-xs text-muted-foreground">High (12-19)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-500" />
                            <span className="text-xs text-muted-foreground">Medium (6-11)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-400" />
                            <span className="text-xs text-muted-foreground">Low (1-5)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        {["Critical", "High", "Medium", "Low"].map((level, idx) => {
                          const counts = [criticalCount, highCount, mediumCount, lowCount];
                          const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-400"];
                          const maxCount = Math.max(...counts) || 1;
                          return (
                            <div key={level} className="flex items-center gap-4">
                              <span className="w-20 text-sm font-medium text-right">{level}</span>
                              <div className="flex-1 h-10 bg-muted rounded-lg overflow-hidden relative">
                                <div 
                                  className={`h-full ${colors[idx]} transition-all duration-500`}
                                  style={{ width: `${(counts[idx] / maxCount) * 100}%` }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow">
                                  {counts[idx]} risks
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-1">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {selectedCell ? (
                        <>
                          <Info className="w-4 h-4 text-[#266C92]" />
                          Cell Details
                          <Badge variant="secondary" className="ml-auto">
                            {selectedRisks.length} risks
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 text-[#266C92]" />
                          All Risks ({filteredRisks.length})
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {(selectedCell ? selectedRisks : filteredRisks).map(risk => (
                          <div 
                            key={risk.id}
                            className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                            data-testid={`risk-item-${risk.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(risk.category)}
                                  <span className="font-medium text-sm truncate">{risk.name}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {risk.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{risk.owner}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-[#266C92]">{risk.exposure}</p>
                                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                  {risk.trend === "up" && <TrendingUp className="w-3 h-3 text-red-500" />}
                                  {risk.trend === "down" && <TrendingDown className="w-3 h-3 text-green-500" />}
                                  <span>{risk.lastUpdated}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs">
                              <span className="text-muted-foreground">
                                P: <span className="font-medium text-foreground">{risk.probability}</span>
                              </span>
                              <span className="text-muted-foreground">
                                I: <span className="font-medium text-foreground">{risk.impact}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Score: <span className="font-bold text-foreground">{risk.probability * risk.impact}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Velocity Trends (90 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {filteredRisks.slice(0, 5).map((risk, idx) => (
                    <div key={risk.id} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium truncate">{risk.name}</span>
                        {risk.trend === "up" && <TrendingUp className="w-4 h-4 text-red-500" />}
                        {risk.trend === "down" && <TrendingDown className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="h-16 flex items-end gap-1">
                        {[...Array(12)].map((_, i) => {
                          const baseHeight = 30 + Math.random() * 40;
                          const trend = risk.trend === "up" ? i * 2 : risk.trend === "down" ? -i * 1.5 : 0;
                          const height = Math.min(100, Math.max(15, baseHeight + trend));
                          return (
                            <div 
                              key={i}
                              className="flex-1 rounded-t transition-all"
                              style={{ 
                                height: `${height}%`,
                                backgroundColor: height > 70 ? "#ef4444" : height > 50 ? "#f59e0b" : "#10b981"
                              }}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {risk.trend === "up" ? "Increasing" : risk.trend === "down" ? "Decreasing" : "Stable"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
