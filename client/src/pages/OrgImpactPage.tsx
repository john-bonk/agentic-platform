/**
 * Organizational Impact Page
 * 
 * Analysis of how acquisition affects audit structure and coverage.
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Building2, GitBranch, ArrowRight,
  Plus, Minus, AlertTriangle, CheckCircle2, Download
} from "lucide-react";

interface OrgChange {
  id: string;
  type: "addition" | "modification" | "removal";
  entity: string;
  description: string;
  impact: "high" | "medium" | "low";
  auditCoverage: string;
}

const orgChanges: OrgChange[] = [
  {
    id: "ch-1",
    type: "addition",
    entity: "Singapore Operations",
    description: "New vertical farming entity with 3 subsidiaries",
    impact: "high",
    auditCoverage: "Requires new audit domain",
  },
  {
    id: "ch-2",
    type: "modification",
    entity: "APAC Regional Office",
    description: "Expanded oversight responsibilities for Singapore",
    impact: "medium",
    auditCoverage: "Existing coverage + extension",
  },
  {
    id: "ch-3",
    type: "addition",
    entity: "AgriTech R&D Center",
    description: "Research facility with specialized IP controls",
    impact: "high",
    auditCoverage: "New specialized audit program",
  },
  {
    id: "ch-4",
    type: "modification",
    entity: "Global Procurement",
    description: "Integration of Singapore supplier network",
    impact: "medium",
    auditCoverage: "Updated vendor audit procedures",
  },
];

const getChangeIcon = (type: string) => {
  switch (type) {
    case "addition":
      return <Plus className="w-4 h-4 text-green-600" />;
    case "removal":
      return <Minus className="w-4 h-4 text-red-600" />;
    default:
      return <ArrowRight className="w-4 h-4 text-amber-600" />;
  }
};

const getImpactBadge = (impact: string) => {
  switch (impact) {
    case "high":
      return <Badge className="bg-red-100 text-red-800">High Impact</Badge>;
    case "medium":
      return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>;
    case "low":
      return <Badge className="bg-green-100 text-green-800">Low</Badge>;
    default:
      return null;
  }
};

export default function OrgImpactPage() {
  return (
    <AppLayout>
      <div className="flex-1 bg-slate-50 min-h-screen">
        <PageHeader
          title="Organizational Impact Analysis"
          description="Singapore M&A integration effects on audit structure and coverage requirements"
          actions={
            <Button 
              className="bg-[#266C92] hover:bg-[#1e5a7a]"
              data-testid="button-export-impact"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </Button>
          }
        />

        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card data-testid="metric-new-entities">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">4</p>
                    <p className="text-sm text-gray-500">New Entities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-modified">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">6</p>
                    <p className="text-sm text-gray-500">Modified Roles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-new-domains">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-[#266C92]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-sm text-gray-500">New Audit Domains</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-fte-required">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">+2</p>
                    <p className="text-sm text-gray-500">FTEs Required</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card data-testid="org-structure">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#266C92]" />
                  Restructuring Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#266C92]" />
                      <span className="font-medium text-gray-900">Corporate HQ</span>
                    </div>
                    <div className="ml-4 space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-sm text-gray-700">APAC Regional</span>
                        <Badge variant="outline" className="ml-auto text-xs">Modified</Badge>
                      </div>
                      <div className="ml-4 space-y-1">
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-100">
                          <Plus className="w-3 h-3 text-green-600" />
                          <span className="text-sm text-green-800">Singapore Operations</span>
                          <Badge className="ml-auto bg-green-100 text-green-800 text-xs">New</Badge>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-100">
                          <Plus className="w-3 h-3 text-green-600" />
                          <span className="text-sm text-green-800">AgriTech R&D</span>
                          <Badge className="ml-auto bg-green-100 text-green-800 text-xs">New</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="coverage-requirements">
              <CardHeader>
                <CardTitle>Coverage Requirements</CardTitle>
                <CardDescription>New audit coverage needed for integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Financial Controls</span>
                      <span className="font-medium">+45 controls</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">IT General Controls</span>
                      <span className="font-medium">+28 controls</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Operational Controls</span>
                      <span className="font-medium">+18 controls</span>
                    </div>
                    <Progress value={48} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Compliance Controls</span>
                      <span className="font-medium">+12 controls</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="change-log">
            <CardHeader>
              <CardTitle>Impact Change Log</CardTitle>
              <CardDescription>Detailed changes requiring audit attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orgChanges.map((change) => (
                  <div 
                    key={change.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-slate-200"
                    data-testid={`change-${change.id}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {getChangeIcon(change.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{change.entity}</h4>
                        {getImpactBadge(change.impact)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{change.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-[#266C92]" />
                        <span className="text-gray-500">{change.auditCoverage}</span>
                      </div>
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
