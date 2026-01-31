/**
 * Vendor Exposure Page
 * 
 * Deep analysis of vendor tariff exposure with heatmap visualization.
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, AlertTriangle, TrendingUp, DollarSign,
  Globe, Filter, Download, ChevronRight
} from "lucide-react";
import { useLocation } from "wouter";

interface VendorRisk {
  id: string;
  name: string;
  country: string;
  exposure: number;
  riskLevel: "high" | "medium" | "low";
  products: number;
  alternativesCount: number;
}

const vendors: VendorRisk[] = [
  { id: "v1", name: "Shenzhen Electronics Co.", country: "China", exposure: 4200000, riskLevel: "high", products: 24, alternativesCount: 3 },
  { id: "v2", name: "Guangzhou Components Ltd.", country: "China", exposure: 3100000, riskLevel: "high", products: 18, alternativesCount: 2 },
  { id: "v3", name: "Shanghai Manufacturing", country: "China", exposure: 2800000, riskLevel: "high", products: 15, alternativesCount: 4 },
  { id: "v4", name: "Dongguan Industries", country: "China", exposure: 1900000, riskLevel: "medium", products: 12, alternativesCount: 5 },
  { id: "v5", name: "Vietnam Tech Solutions", country: "Vietnam", exposure: 1200000, riskLevel: "medium", products: 8, alternativesCount: 6 },
  { id: "v6", name: "Thai Components Inc.", country: "Thailand", exposure: 890000, riskLevel: "low", products: 6, alternativesCount: 4 },
];

const getRiskBadge = (level: string) => {
  switch (level) {
    case "high":
      return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">High Risk</Badge>;
    case "medium":
      return <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">Medium</Badge>;
    case "low":
      return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Low</Badge>;
    default:
      return null;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function VendorExposurePage() {
  const [, setLocation] = useLocation();
  const totalExposure = vendors.reduce((sum, v) => sum + v.exposure, 0);
  const highRiskCount = vendors.filter(v => v.riskLevel === "high").length;

  return (
    <AppLayout>
      <div className="flex-1 bg-slate-50 dark:bg-background min-h-screen">
        <PageHeader
          title="Vendor Exposure Analysis"
          description="Comprehensive tariff risk assessment across your supplier network"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-filter-vendors">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button 
                className="bg-[#266C92] hover:bg-[#1e5a7a]"
                data-testid="button-export-analysis"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          }
        />

        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card data-testid="metric-total-exposure">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-foreground">{formatCurrency(totalExposure)}</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">Total Exposure</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-vendors-analyzed">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#266C92]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">127</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">Vendors Analyzed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-high-risk">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{highRiskCount}</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-alternatives">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">14</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">Alternatives Found</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2" data-testid="exposure-heatmap">
              <CardHeader>
                <CardTitle>Exposure Heatmap</CardTitle>
                <CardDescription>Tariff exposure by region and vendor concentration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <p className="font-medium text-red-800 dark:text-red-300">China</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-200">$12.0M</p>
                    <p className="text-sm text-red-700 dark:text-red-400">69 vendors</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="font-medium text-amber-800 dark:text-amber-300">Vietnam</p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">$3.2M</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">28 vendors</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="font-medium text-green-800 dark:text-green-300">Thailand</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-200">$1.8M</p>
                    <p className="text-sm text-green-700 dark:text-green-400">18 vendors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="mitigation-summary">
              <CardHeader>
                <CardTitle>Mitigation Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-muted-foreground">Supplier Diversification</span>
                      <span className="font-medium text-foreground">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-muted-foreground">Contract Negotiations</span>
                      <span className="font-medium text-foreground">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-muted-foreground">Tariff Engineering</span>
                      <span className="font-medium text-foreground">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="vendor-list">
            <CardHeader>
              <CardTitle>High Exposure Vendors</CardTitle>
              <CardDescription>Top vendors by tariff exposure with alternative sourcing options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vendors.map((vendor) => (
                  <div 
                    key={vendor.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card hover-elevate cursor-pointer"
                    data-testid={`vendor-${vendor.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-foreground">{vendor.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-muted-foreground">{vendor.country}</span>
                          <span className="text-xs text-gray-300 dark:text-muted-foreground/50">|</span>
                          <span className="text-xs text-gray-500 dark:text-muted-foreground">{vendor.products} products</span>
                          <span className="text-xs text-gray-300 dark:text-muted-foreground/50">|</span>
                          <span className="text-xs text-green-600 dark:text-green-400">{vendor.alternativesCount} alternatives</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-foreground">{formatCurrency(vendor.exposure)}</p>
                        {getRiskBadge(vendor.riskLevel)}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
