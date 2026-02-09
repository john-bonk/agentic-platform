import { useState, useEffect } from "react";
import { useWorkspaceStore } from "@/lib/workspaceStore";
import { useBrowserTabStore } from "@/lib/browserTabStore";
import GlobalResidualRiskPage from "./GlobalResidualRiskPage";
import CAEResidualRiskPage from "./CAEResidualRiskPage";
import CISOResidualRiskPage from "./CISOResidualRiskPage";
import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingDown, BarChart3, Target, AlertTriangle, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

function RiskHeatmapView() {
  const severities = ["Critical", "High", "Medium", "Low"];
  const likelihoods = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
  const cellData: Record<string, { count: number; color: string }> = {
    "Critical-Almost Certain": { count: 2, color: "bg-red-600" },
    "Critical-Likely": { count: 1, color: "bg-red-500" },
    "Critical-Possible": { count: 0, color: "bg-red-400" },
    "Critical-Unlikely": { count: 0, color: "bg-red-300" },
    "Critical-Rare": { count: 0, color: "bg-red-200" },
    "High-Almost Certain": { count: 1, color: "bg-orange-500" },
    "High-Likely": { count: 3, color: "bg-orange-400" },
    "High-Possible": { count: 2, color: "bg-orange-300" },
    "High-Unlikely": { count: 1, color: "bg-yellow-300" },
    "High-Rare": { count: 0, color: "bg-yellow-200" },
    "Medium-Almost Certain": { count: 0, color: "bg-yellow-400" },
    "Medium-Likely": { count: 2, color: "bg-yellow-300" },
    "Medium-Possible": { count: 5, color: "bg-yellow-200" },
    "Medium-Unlikely": { count: 3, color: "bg-green-200" },
    "Medium-Rare": { count: 1, color: "bg-green-100" },
    "Low-Almost Certain": { count: 0, color: "bg-green-300" },
    "Low-Likely": { count: 1, color: "bg-green-200" },
    "Low-Possible": { count: 2, color: "bg-green-100" },
    "Low-Unlikely": { count: 4, color: "bg-green-50 dark:bg-green-900/20" },
    "Low-Rare": { count: 6, color: "bg-green-50 dark:bg-green-900/10" },
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full" data-testid="page-risk-heatmap">
        <PageHeader title="Global Residual Risk" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Risk Heatmap</h2>
            <p className="text-sm text-muted-foreground">Severity vs. Likelihood matrix across all business units</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
            <Card data-testid="card-total-risks">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">34</p>
                    <p className="text-xs text-muted-foreground">Total Active Risks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-critical-high">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">10</p>
                    <p className="text-xs text-muted-foreground">Critical & High Severity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-avg-score">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-[#266C92]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">62</p>
                    <p className="text-xs text-muted-foreground">Avg Risk Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-heatmap">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#266C92]" />
                Risk Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" data-testid="table-heatmap">
                  <thead>
                    <tr>
                      <th className="w-28 p-2 text-left text-xs font-medium text-muted-foreground">Severity / Likelihood</th>
                      {likelihoods.map(l => (
                        <th key={l} className="p-2 text-center text-xs font-medium text-muted-foreground">{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {severities.map(sev => (
                      <tr key={sev}>
                        <td className="p-2 text-sm font-medium text-foreground">{sev}</td>
                        {likelihoods.map(lik => {
                          const cell = cellData[`${sev}-${lik}`] || { count: 0, color: "bg-muted" };
                          return (
                            <td key={lik} className="p-1.5">
                              <div
                                className={`${cell.color} rounded-md h-14 flex items-center justify-center transition-colors`}
                                data-testid={`heatmap-cell-${sev}-${lik}`}
                              >
                                <span className="text-sm font-bold text-foreground/80">{cell.count || ""}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function MitigationTrackerView() {
  const mitigations = [
    { id: 1, name: "Supply Chain Diversification", risk: "US Tariffs Enacted", status: "In Progress", progress: 35, owner: "Procurement", dueDate: "Jun 2025", trend: "up" },
    { id: 2, name: "GDPR Compliance Update", risk: "EU Regulatory Changes", status: "In Progress", progress: 62, owner: "Legal & Compliance", dueDate: "Aug 2025", trend: "up" },
    { id: 3, name: "Forward Currency Contracts", risk: "Currency Fluctuation", status: "Complete", progress: 100, owner: "Treasury", dueDate: "Mar 2025", trend: "up" },
    { id: 4, name: "Alternative Supplier Qualification", risk: "Supplier Concentration", status: "Not Started", progress: 0, owner: "Procurement", dueDate: "Nov 2025", trend: "down" },
    { id: 5, name: "Tariff Exclusion Applications", risk: "US Tariffs Enacted", status: "In Progress", progress: 48, owner: "Trade Compliance", dueDate: "Jul 2025", trend: "up" },
    { id: 6, name: "Data Processing Agreement Updates", risk: "EU Regulatory Changes", status: "In Progress", progress: 80, owner: "Legal", dueDate: "May 2025", trend: "up" },
    { id: 7, name: "Strategic Inventory Reserves", risk: "Supplier Concentration", status: "In Progress", progress: 20, owner: "Operations", dueDate: "Sep 2025", trend: "down" },
    { id: 8, name: "Natural Hedging Program", risk: "Currency Fluctuation", status: "In Progress", progress: 55, owner: "Finance", dueDate: "Jul 2025", trend: "up" },
  ];

  const statusColor = (s: string) => {
    if (s === "Complete") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "In Progress") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full" data-testid="page-mitigation-tracker">
        <PageHeader title="Global Residual Risk" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Mitigation Tracker</h2>
            <p className="text-sm text-muted-foreground">Track mitigation plan progress across all identified risks</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
            <Card data-testid="card-total-mitigations">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#266C92]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{mitigations.length}</p>
                    <p className="text-xs text-muted-foreground">Total Mitigations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-in-progress">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{mitigations.filter(m => m.status === "In Progress").length}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-completed">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{mitigations.filter(m => m.status === "Complete").length}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-not-started">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{mitigations.filter(m => m.status === "Not Started").length}</p>
                    <p className="text-xs text-muted-foreground">Not Started</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-mitigation-table">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-[#266C92]" />
                Mitigation Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full" data-testid="table-mitigations">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">Mitigation</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">Related Risk</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">Progress</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">Owner</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">Due Date</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {mitigations.map(m => (
                    <tr key={m.id} className="border-b border-border/50 last:border-0" data-testid={`row-mitigation-${m.id}`}>
                      <td className="py-3 text-sm font-medium text-foreground">{m.name}</td>
                      <td className="py-3 text-sm text-muted-foreground">{m.risk}</td>
                      <td className="py-3">
                        <Badge variant="secondary" className={`text-xs ${statusColor(m.status)}`}>{m.status}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#266C92]"
                              style={{ width: `${m.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{m.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{m.owner}</td>
                      <td className="py-3 text-sm text-muted-foreground">{m.dueDate}</td>
                      <td className="py-3 text-right">
                        {m.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-500 inline-block" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500 inline-block" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function GlobalResidualRiskRouter() {
  const { currentWorkspace } = useWorkspaceStore();
  const { activeTabId, getActiveRoute } = useBrowserTabStore();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const isNewTab = activeTabId !== "main" && getActiveRoute() === "/global-residual-risk";

  if (isNewTab) {
    switch (hash) {
      case "#cae":
        return <CAEResidualRiskPage />;
      case "#ciso":
        return <CISOResidualRiskPage />;
      case "#risk-heatmap":
        return <RiskHeatmapView />;
      case "#mitigation-tracker":
        return <MitigationTrackerView />;
      default:
        return <GlobalResidualRiskPage />;
    }
  }

  switch (currentWorkspace.persona) {
    case "CRO":
      return <GlobalResidualRiskPage />;
    case "CAE":
      return <CAEResidualRiskPage />;
    case "CISO":
      return <CISOResidualRiskPage />;
    default:
      return <GlobalResidualRiskPage />;
  }
}
