/**
 * Reporting Page
 * 
 * Central hub for all report artifacts, slide decks, and exports.
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Download, Calendar, Clock, 
  BarChart3, PieChart, TrendingUp, Users,
  Shield, AlertTriangle, CheckCircle2, Plus
} from "lucide-react";
import { useLocation } from "wouter";

interface ReportArtifact {
  id: string;
  title: string;
  description: string;
  type: "board" | "audit" | "compliance" | "executive";
  createdAt: string;
  status: "draft" | "published" | "archived";
  slides: number;
  workspace: string;
}

const mockReports: ReportArtifact[] = [
  {
    id: "rpt-1",
    title: "Q4 2025 Tariff Risk Executive Summary",
    description: "Board presentation on current tariff exposure and mitigation strategies",
    type: "board",
    createdAt: "2026-01-05",
    status: "published",
    slides: 6,
    workspace: "Enterprise Risk",
  },
  {
    id: "rpt-2",
    title: "Singapore M&A Integration Audit",
    description: "Audit committee update on acquisition integration progress",
    type: "audit",
    createdAt: "2026-01-03",
    status: "draft",
    slides: 6,
    workspace: "Enterprise Audit",
  },
  {
    id: "rpt-3",
    title: "Log4j Remediation Status Report",
    description: "Security compliance briefing on vulnerability remediation",
    type: "compliance",
    createdAt: "2026-01-02",
    status: "published",
    slides: 6,
    workspace: "IT Security",
  },
  {
    id: "rpt-4",
    title: "Annual Risk Assessment Summary",
    description: "Comprehensive overview of enterprise risk landscape",
    type: "executive",
    createdAt: "2025-12-15",
    status: "archived",
    slides: 8,
    workspace: "Enterprise Risk",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "board":
      return <BarChart3 className="w-5 h-5 text-[#266C92]" />;
    case "audit":
      return <FileText className="w-5 h-5 text-green-600" />;
    case "compliance":
      return <Shield className="w-5 h-5 text-purple-600" />;
    case "executive":
      return <TrendingUp className="w-5 h-5 text-amber-600" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "published":
      return <Badge variant="default" className="bg-green-100 text-green-800">Published</Badge>;
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "archived":
      return <Badge variant="outline" className="text-gray-500">Archived</Badge>;
    default:
      return null;
  }
};

export default function ReportingPage() {
  const [, setLocation] = useLocation();

  return (
    <AppLayout>
      <div className="flex-1 bg-slate-50 min-h-screen">
        <PageHeader
          title="Report Library"
          description="Manage and export presentation artifacts across all workspaces"
          actions={
            <Button 
              className="bg-[#266C92] hover:bg-[#1e5a7a]"
              onClick={() => setLocation("/reporting/slide-builder")}
              data-testid="button-create-report"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          }
        />

        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card data-testid="metric-total-reports">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#266C92]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#266C92]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">24</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-published">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">18</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-drafts">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">4</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">Drafts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="metric-this-month">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">7</p>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="reports-list">
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Your latest presentation artifacts and exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockReports.map((report) => (
                  <div 
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card hover-elevate cursor-pointer"
                    onClick={() => setLocation(`/reporting/view/${report.id === "rpt-1" ? "board-report" : report.id === "rpt-2" ? "audit-committee-report" : report.id === "rpt-3" ? "compliance-report" : "board-report"}`)}
                    data-testid={`report-item-${report.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center">
                        {getTypeIcon(report.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-foreground">{report.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-muted-foreground">{report.workspace}</span>
                          <span className="text-xs text-gray-300 dark:text-border">|</span>
                          <span className="text-xs text-gray-500 dark:text-muted-foreground">{report.slides} slides</span>
                          <span className="text-xs text-gray-300 dark:text-border">|</span>
                          <span className="text-xs text-gray-500 dark:text-muted-foreground">{report.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(report.status)}
                      <Button size="icon" variant="ghost" data-testid={`button-download-${report.id}`}>
                        <Download className="w-4 h-4" />
                      </Button>
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
