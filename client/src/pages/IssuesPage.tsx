import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Check, Search, Filter, List, Columns, MoreHorizontal } from "lucide-react";
import { SideNavigationSection } from "./sections/SideNavigationSection";
import { HeaderSection } from "./sections/HeaderSection";
import { businessProcessData, type IssueItem } from "../data/businessProcessData";

type NavigationIcon = 
  | { type: "image"; src: string; alt: string; active: boolean }
  | { type: "lucide"; icon: "refresh-ccw"; alt: string; active: boolean };

const navigationIcons: NavigationIcon[] = [
  { type: "image", src: "/figmaAssets/module-dashboard-.svg", alt: "Module dashboard", active: false },
  { type: "image", src: "/figmaAssets/module-controls-.svg", alt: "Module controls", active: false },
  { type: "image", src: "/figmaAssets/module-risk-.svg", alt: "Module risk", active: false },
  { type: "image", src: "/figmaAssets/module-esg-.svg", alt: "Module esg", active: false },
  { type: "image", src: "/figmaAssets/module-crosscomply-.svg", alt: "Module crosscomply", active: false },
  { type: "image", src: "/figmaAssets/module-opsaudit.svg", alt: "Module opsaudit", active: false },
  { type: "image", src: "/figmaAssets/module-tprm.svg", alt: "Module tprm", active: false },
  { type: "lucide", icon: "refresh-ccw", alt: "BCM", active: true },
  { type: "image", src: "/figmaAssets/files.svg", alt: "Files", active: false },
  { type: "image", src: "/figmaAssets/module-report-.svg", alt: "Module report", active: false },
  { type: "image", src: "/figmaAssets/module-workstream-.svg", alt: "Module workstream", active: false },
  { type: "image", src: "/figmaAssets/module-automations-.svg", alt: "Module automations", active: false },
  { type: "image", src: "/figmaAssets/plug.svg", alt: "Plug", active: false },
  { type: "image", src: "/figmaAssets/module-issues.svg", alt: "Module issues", active: false },
  { type: "image", src: "/figmaAssets/module-files.svg", alt: "Module files", active: false },
  { type: "image", src: "/figmaAssets/module-timesheets.svg", alt: "Module timesheets", active: false },
  { type: "image", src: "/figmaAssets/module-settings-.svg", alt: "Module settings", active: false },
];

interface AggregatedIssue extends IssueItem {
  processId: string;
  processName: string;
  categoryName: string;
}

function IssueIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.13397 1.5C5.51888 0.833333 6.48113 0.833333 6.86603 1.5L11.1962 9C11.5811 9.66667 11.0999 10.5 10.3301 10.5H1.66987C0.900073 10.5 0.418948 9.66667 0.803848 9L5.13397 1.5Z" fill="#BA2A2A"/>
      <path d="M6 4V6.5M6 8.5V8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IssuesPage() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const allIssues: AggregatedIssue[] = useMemo(() => {
    const issues: AggregatedIssue[] = [];
    
    businessProcessData.forEach((category) => {
      category.processes.forEach((process) => {
        if (process.issues && process.issues.length > 0) {
          process.issues.forEach((issue) => {
            issues.push({
              ...issue,
              processId: process.id,
              processName: process.name,
              categoryName: category.name,
            });
          });
        }
      });
    });
    
    return issues;
  }, []);

  const filteredIssues = useMemo(() => {
    if (!searchQuery.trim()) {
      return allIssues;
    }
    
    const query = searchQuery.toLowerCase();
    
    return allIssues.filter(
      (issue) =>
        issue.id.toLowerCase().includes(query) ||
        issue.title.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query) ||
        issue.status.toLowerCase().includes(query) ||
        issue.processName.toLowerCase().includes(query)
    );
  }, [searchQuery, allIssues]);

  const toggleRowSelection = (rowId: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const getStatusBadgeStyle = (status: IssueItem["status"]) => {
    switch (status) {
      case "Pending remediation":
        return "bg-[#3172e3] text-white hover:bg-[#3172e3]";
      case "In progress":
        return "bg-[#f59e0b] text-white hover:bg-[#f59e0b]";
      case "Resolved":
        return "bg-[#36844a] text-white hover:bg-[#36844a]";
      case "Open":
        return "bg-[#db3535] text-white hover:bg-[#db3535]";
      default:
        return "bg-[#64748b] text-white hover:bg-[#64748b]";
    }
  };

  const LeftNavbar = () => (
    <aside
      className="flex flex-col w-14 items-center justify-between pt-2 pb-2.5 px-2 bg-gray-900 sticky top-0 h-screen z-50 flex-shrink-0"
      data-testid="side-navbar"
    >
      <nav className="flex flex-col items-center gap-1 relative flex-[0_0_auto]">
        <Link href="/">
          <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-logo">
            <img
              className="w-7 h-auto"
              alt="AuditBoard Logo"
              src="/figmaAssets/auditboard-logo.png?v=2"
            />
          </div>
        </Link>

        {navigationIcons.map((icon, index) => (
          <div
            key={index}
            className={`w-10 h-10 rounded flex items-center justify-center ${
              icon.active ? "bg-teal-500" : ""
            }`}
            data-testid={`navbar-icon-${index}`}
          >
            {icon.type === "lucide" ? (
              <div className="relative w-4 h-4 flex items-center justify-center">
                <RefreshCcw className="w-4 h-4 text-white absolute" />
                <Check className="w-2 h-2 text-white" strokeWidth={3} />
              </div>
            ) : (
              <img className={`w-4 h-4 ${icon.alt === "Plug" ? "opacity-50" : ""}`} alt={icon.alt} src={icon.src} />
            )}
          </div>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-support">
          <img
            className="w-4 h-4"
            alt="Support"
            src="/figmaAssets/circle-question-.svg"
          />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex items-start relative h-screen overflow-hidden">
      <LeftNavbar />
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <HeaderSection />
        <div className="flex flex-1 overflow-hidden">
          <SideNavigationSection />
          <div className="flex flex-col items-start relative flex-1 self-stretch grow bg-white min-w-0">
            <header className="flex flex-col gap-2 py-8 px-8 w-full bg-white pt-[24px] pb-[24px]">
              <div className="flex gap-4 items-start w-full flex-wrap">
                <div className="flex flex-1 flex-col justify-center min-w-0">
                  <h1 className="font-semibold text-gray-900 text-[28px]" data-testid="page-title">
                    Issues
                  </h1>
                </div>

                <div className="flex gap-1 items-start flex-shrink-0">
                  <Button
                    className="h-[38px] gap-2 px-4 bg-teal-600 hover:bg-teal-600/90 border border-teal-600 text-white text-sm font-normal rounded"
                    data-testid="create-button"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Create
                  </Button>
                </div>
              </div>
            </header>
            <div className="flex items-center justify-between px-8 py-3 w-full bg-white flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 w-[200px] sm:w-[240px] text-sm"
                    data-testid="search-input"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-gray-600" data-testid="add-filter-button">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Filter</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none bg-[#256c92] text-[#ffffff]" data-testid="list-view-button">
                    <List className="w-4 h-4 text-white" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-gray-600 hidden md:flex" data-testid="manage-columns-button">
                  <Columns className="w-4 h-4" />
                  Manage Columns
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="more-options-button">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>
            <main className="flex flex-col relative flex-1 self-stretch w-full overflow-x-auto overflow-y-auto">
              <div className="min-w-fit overflow-y-auto">
                <div className="flex items-center h-10 border-b border-gray-200 bg-white sticky top-0 z-10 mx-4">
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <Checkbox data-testid="select-all-checkbox" />
                  </div>
                  <div className="w-[100px] flex-shrink-0 flex items-center px-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID</span>
                  </div>
                  <div className="flex-1 min-w-[250px] flex items-center px-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">TITLE</span>
                  </div>
                  <div className="w-[200px] flex-shrink-0 flex items-center px-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">BUSINESS PROCESS</span>
                  </div>
                  <div className="w-[140px] flex-shrink-0 flex items-center px-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</span>
                  </div>
                  <div className="w-[160px] flex-shrink-0 flex items-center px-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</span>
                  </div>
                </div>

                <div className="flex flex-col mx-4">
                  {filteredIssues.map((issue, index) => (
                    <div
                      key={`${issue.processId}-${issue.id}`}
                      className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50"
                      data-testid={`issue-row-${index}`}
                    >
                      <div className="w-10 flex-shrink-0 flex items-center justify-center">
                        <Checkbox
                          checked={selectedRows.has(`${issue.processId}-${issue.id}`)}
                          onCheckedChange={() => toggleRowSelection(`${issue.processId}-${issue.id}`)}
                          data-testid={`checkbox-issue-${index}`}
                        />
                      </div>
                      <div className="w-[100px] flex-shrink-0 flex items-center gap-2 px-3">
                        <IssueIcon />
                        <span className="text-sm font-medium text-gray-900">{issue.id}</span>
                      </div>
                      <div className="flex-1 min-w-[250px] flex items-center px-3">
                        <span className="text-sm text-gray-900 truncate">{issue.title}</span>
                      </div>
                      <div className="w-[200px] flex-shrink-0 px-3">
                        <Link
                          href={`/process/${issue.processId}`}
                          className="text-sm text-blue-600 hover:underline truncate block"
                          data-testid={`process-link-${index}`}
                        >
                          {issue.processName}
                        </Link>
                      </div>
                      <div className="w-[140px] flex-shrink-0 px-3">
                        <span className="text-sm text-gray-900 truncate block">{issue.location}</span>
                      </div>
                      <div className="w-[160px] flex-shrink-0 px-3">
                        <Badge
                          className={`text-[10px] font-semibold px-1.5 py-0 rounded-full ${getStatusBadgeStyle(issue.status)}`}
                          data-testid={`status-badge-${index}`}
                        >
                          {issue.status}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {filteredIssues.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      <p className="text-sm">No issues found</p>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
