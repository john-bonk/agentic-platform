/**
 * Generated Report Page
 * 
 * Displays rich, dynamically generated reports with sections, charts, and TOC.
 */

import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, Download, Printer, Share2, 
  ChevronLeft, Clock, User, BarChart3,
  PieChart, TrendingUp, List, CheckCircle2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ChartSpec {
  type: "bar" | "pie" | "line";
  data: number[];
  labels?: string[];
  title?: string;
}

interface ReportSection {
  id: string;
  title: string;
  content: string;
  charts: ChartSpec[];
}

interface GeneratedReport {
  reportId: string;
  title: string;
  sections: ReportSection[];
  toc: { id: string; title: string }[];
  createdAt: string;
  prompt?: string;
}

function SimpleBarChart({ data, labels, title }: ChartSpec) {
  const max = Math.max(...data);
  const colors = ["#266C92", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  
  return (
    <div className="my-4 p-4 bg-slate-50 dark:bg-muted rounded-lg">
      {title && <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-foreground">{title}</h4>}
      <div className="space-y-2">
        {data.map((value, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs w-24 text-gray-600 dark:text-muted-foreground truncate">
              {labels?.[index] || `Item ${index + 1}`}
            </span>
            <div className="flex-1 h-6 bg-slate-200 dark:bg-background rounded overflow-hidden">
              <div 
                className="h-full rounded transition-all duration-500"
                style={{ 
                  width: `${(value / max) * 100}%`,
                  backgroundColor: colors[index % colors.length]
                }}
              />
            </div>
            <span className="text-xs font-medium w-10 text-right text-gray-700 dark:text-foreground">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimplePieChart({ data, labels, title }: ChartSpec) {
  const total = data.reduce((a, b) => a + b, 0);
  const colors = ["#266C92", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  
  let cumulativePercent = 0;
  const segments = data.map((value, index) => {
    const percent = (value / total) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { value, percent, startPercent, color: colors[index % colors.length], label: labels?.[index] };
  });
  
  return (
    <div className="my-4 p-4 bg-slate-50 dark:bg-muted rounded-lg">
      {title && <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-foreground">{title}</h4>}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((seg, i) => {
              const circumference = 2 * Math.PI * 40;
              const offset = (seg.startPercent / 100) * circumference;
              const length = (seg.percent / 100) * circumference;
              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="20"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-1.5">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-gray-600 dark:text-muted-foreground">
                {seg.label}: {seg.value} ({seg.percent.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SimpleLineChart({ data, labels, title }: ChartSpec) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - ((value - min) / range) * 80 - 10,
  }));
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  return (
    <div className="my-4 p-4 bg-slate-50 dark:bg-muted rounded-lg">
      {title && <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-foreground">{title}</h4>}
      <div className="h-32 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <path d={pathD} fill="none" stroke="#266C92" strokeWidth="2" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#266C92" />
          ))}
        </svg>
      </div>
      {labels && (
        <div className="flex justify-between mt-2">
          {labels.map((label, i) => (
            <span key={i} className="text-xs text-gray-500 dark:text-muted-foreground">{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function RenderChart({ chart }: { chart: ChartSpec }) {
  switch (chart.type) {
    case "bar":
      return <SimpleBarChart {...chart} />;
    case "pie":
      return <SimplePieChart {...chart} />;
    case "line":
      return <SimpleLineChart {...chart} />;
    default:
      return null;
  }
}

export default function GeneratedReportPage() {
  const [, params] = useRoute("/reporting/generated/:reportId");
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<string>("");
  
  const { data: report, isLoading, error } = useQuery<GeneratedReport>({
    queryKey: [`/api/reports/${params?.reportId}`],
    enabled: !!params?.reportId,
  });

  useEffect(() => {
    if (report?.sections?.[0]) {
      setActiveSection(report.sections[0].id);
    }
  }, [report]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex-1 bg-slate-50 dark:bg-background min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-[#266C92] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 dark:text-muted-foreground">Loading report...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !report) {
    return (
      <AppLayout>
        <div className="flex-1 bg-slate-50 dark:bg-background min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <FileText className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-500 dark:text-muted-foreground">Report not found</p>
            <Button variant="outline" onClick={() => setLocation("/reporting")}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 bg-slate-50 dark:bg-background min-h-screen">
        <PageHeader
          title={report.title}
          description={`Generated report • ${new Date(report.createdAt).toLocaleDateString()}`}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" data-testid="button-share-report">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" data-testid="button-print-report">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button className="bg-[#266C92] hover:bg-[#1e5a7a]" size="sm" data-testid="button-download-report">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          }
        />

        <div className="flex px-8 py-6 gap-6">
          <Card className="w-64 shrink-0 h-fit sticky top-6" data-testid="report-toc">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <List className="w-4 h-4" />
                Contents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <nav className="space-y-1">
                {report.toc.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === item.id
                        ? "bg-[#266C92]/10 text-[#266C92] font-medium"
                        : "text-gray-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                    }`}
                    data-testid={`toc-item-${item.id}`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          <div className="flex-1 space-y-6">
            <Card data-testid="report-meta">
              <CardContent className="pt-6">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Created {new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{report.sections.length} sections</span>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                </div>
                {report.prompt && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-muted rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Generated from prompt:</p>
                    <p className="text-sm text-gray-700 dark:text-foreground italic">"{report.prompt}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {report.sections.map((section) => (
              <Card key={section.id} id={section.id} data-testid={`report-section-${section.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {section.content.split('\n').map((paragraph, i) => (
                      <p key={i} className="text-gray-700 dark:text-foreground mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.charts.map((chart, i) => (
                    <RenderChart key={i} chart={chart} />
                  ))}
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setLocation("/reporting")} data-testid="button-back-reports">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Button>
              <Button className="bg-[#266C92] hover:bg-[#1e5a7a]" data-testid="button-export-final">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
