/**
 * Patch Status Page
 * 
 * Real-time dashboard showing vulnerability remediation progress.
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, AlertTriangle, CheckCircle2, Clock, 
  Server, RefreshCw, Download, Filter
} from "lucide-react";

interface VulnerabilityItem {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedSystems: number;
  patchedSystems: number;
  status: "in-progress" | "completed" | "pending";
  eta?: string;
}

const vulnerabilities: VulnerabilityItem[] = [
  {
    id: "vuln-1",
    name: "CVE-2021-44228 (Log4Shell)",
    severity: "critical",
    affectedSystems: 156,
    patchedSystems: 142,
    status: "in-progress",
    eta: "2 days",
  },
  {
    id: "vuln-2",
    name: "CVE-2021-45046 (Log4j 2.x)",
    severity: "critical",
    affectedSystems: 89,
    patchedSystems: 89,
    status: "completed",
  },
  {
    id: "vuln-3",
    name: "CVE-2021-45105 (Log4j DoS)",
    severity: "high",
    affectedSystems: 67,
    patchedSystems: 61,
    status: "in-progress",
    eta: "5 days",
  },
  {
    id: "vuln-4",
    name: "CVE-2021-44832 (Log4j JNDI)",
    severity: "medium",
    affectedSystems: 34,
    patchedSystems: 28,
    status: "in-progress",
    eta: "1 week",
  },
];

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    case "low":
      return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
    default:
      return null;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "in-progress":
      return <RefreshCw className="w-5 h-5 text-[#266C92] animate-spin" />;
    case "pending":
      return <Clock className="w-5 h-5 text-gray-400" />;
    default:
      return null;
  }
};

export default function PatchStatusPage() {
  const totalAffected = vulnerabilities.reduce((sum, v) => sum + v.affectedSystems, 0);
  const totalPatched = vulnerabilities.reduce((sum, v) => sum + v.patchedSystems, 0);
  const overallProgress = Math.round((totalPatched / totalAffected) * 100);

  return (
    <AppLayout>
      <div className="flex-1 bg-slate-50 min-h-screen">
        <PageHeader
          title="Patch Status Dashboard"
          description="Real-time vulnerability remediation progress across all systems"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-filter">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button 
                className="bg-[#266C92] hover:bg-[#1e5a7a]"
                data-testid="button-export-status"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          }
        />

        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card data-testid="metric-overall-progress">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Overall Progress</p>
                  <span className="text-2xl font-bold text-[#266C92]">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </CardContent>
            </Card>
            <Card data-testid="metric-systems-scanned">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
                    <Server className="w-5 h-5 text-[#266C92]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">2,847</p>
                    <p className="text-sm text-gray-500">Systems Scanned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-vulnerabilities">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalAffected - totalPatched}</p>
                    <p className="text-sm text-gray-500">Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-patched">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalPatched}</p>
                    <p className="text-sm text-gray-500">Patched</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="vulnerability-list">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#266C92]" />
                Active Vulnerabilities
              </CardTitle>
              <CardDescription>
                Track remediation progress for each identified vulnerability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vulnerabilities.map((vuln) => {
                  const progress = Math.round((vuln.patchedSystems / vuln.affectedSystems) * 100);
                  return (
                    <div 
                      key={vuln.id}
                      className="p-4 rounded-lg border border-slate-200"
                      data-testid={`vulnerability-${vuln.id}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(vuln.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">{vuln.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {getSeverityBadge(vuln.severity)}
                              {vuln.eta && (
                                <span className="text-xs text-gray-500">ETA: {vuln.eta}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{progress}%</p>
                          <p className="text-xs text-gray-500">
                            {vuln.patchedSystems}/{vuln.affectedSystems} systems
                          </p>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
