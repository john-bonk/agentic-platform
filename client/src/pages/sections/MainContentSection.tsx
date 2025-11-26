import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search, Filter, List, GitBranch, Columns, MoreHorizontal } from "lucide-react";

interface Process {
  id: string;
  name: string;
  processOwner: string;
  criticality: "High" | "Low";
  rto: string;
  rpo: string;
  latestBia: string;
}

interface Category {
  id: string;
  name: string;
  processes: Process[];
}

const businessProcessData: Category[] = [
  {
    id: "retail-banking",
    name: "Retail Banking Operations",
    processes: [
      { id: "1", name: "Account Management", processOwner: "Baylor Cruz", criticality: "High", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "2", name: "Loan Origination and Servicing", processOwner: "Baylor Cruz", criticality: "Low", rto: "30 mins", rpo: "30 mins", latestBia: "2024" },
      { id: "3", name: "Customer Service and Support", processOwner: "Baylor Cruz", criticality: "Low", rto: "24 hours", rpo: "24 hours", latestBia: "2024" },
    ],
  },
  {
    id: "human-resources",
    name: "Human Resources",
    processes: [
      { id: "4", name: "Employee Onboarding and Offboarding", processOwner: "Dante Bradford", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "5", name: "Payroll Processing", processOwner: "Dante Bradford", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "6", name: "Benefits Administration", processOwner: "Dante Bradford", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "7", name: "Training & Development", processOwner: "Dante Bradford", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
    ],
  },
  {
    id: "treasury",
    name: "Treasury & Cash Management",
    processes: [
      { id: "8", name: "Cash Flow Forecasting", processOwner: "Leah Sullivan", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "9", name: "Liquidity Management", processOwner: "Leah Sullivan", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "10", name: "Payment Processing", processOwner: "Leah Sullivan", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "11", name: "Benefits Administration", processOwner: "Leah Sullivan", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
    ],
  },
];

const tableHeaders = [
  { label: "NAME", width: "w-[295px]" },
  { label: "PROCESS OWNER", width: "w-[200px]" },
  { label: "CRITICALITY", width: "w-[200px]" },
  { label: "RTO", width: "w-[200px]" },
  { label: "RPO", width: "w-[200px]" },
  { label: "LATEST BIA", width: "w-[200px]" },
];

export const MainContentSection = (): JSX.Element => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(businessProcessData.map((cat) => cat.id))
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

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

  return (
    <div className="flex flex-col items-start relative flex-1 self-stretch grow bg-white">
      <header className="flex flex-col gap-2 py-8 px-8 w-full bg-white border-b border-[rgba(1,55,126,0.11)]">
        <div className="flex gap-4 items-start w-full">
          <div className="flex flex-1 flex-col justify-center">
            <h1 className="text-[32px] font-semibold text-gray-900 leading-[1.33]" data-testid="page-title">
              Business Processes
            </h1>
          </div>

          <div className="flex gap-1 items-start">
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

      <div className="flex items-center justify-between px-8 py-3 w-full border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-[240px] text-sm"
              data-testid="search-input"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-gray-600" data-testid="add-filter-button">
            <Filter className="w-4 h-4" />
            Add Filter
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-r border-gray-200" data-testid="tree-view-button">
              <GitBranch className="w-4 h-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" data-testid="list-view-button">
              <List className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-gray-600" data-testid="manage-columns-button">
            <Columns className="w-4 h-4" />
            Manage Columns
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="more-options-button">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <main className="flex flex-col relative flex-1 self-stretch w-full overflow-y-auto">
        <div className="flex items-center h-10 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="w-10 flex items-center justify-center">
            <Checkbox data-testid="select-all-checkbox" />
          </div>
          {tableHeaders.map((header, index) => (
            <div
              key={index}
              className={`flex items-center px-3 ${header.width}`}
            >
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {businessProcessData.map((category) => (
            <div key={category.id}>
              <div
                className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleCategory(category.id)}
                data-testid={`category-row-${category.id}`}
              >
                <div className="w-10 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedRows.has(category.id)}
                    onCheckedChange={() => toggleRowSelection(category.id)}
                    data-testid={`checkbox-category-${category.id}`}
                  />
                </div>
                <div className="flex items-center gap-2 w-[295px] px-3">
                  <button className="flex items-center justify-center w-4 h-4" data-testid={`toggle-${category.id}`}>
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="w-[200px] px-3"></div>
                <div className="w-[200px] px-3"></div>
                <div className="w-[200px] px-3"></div>
                <div className="w-[200px] px-3"></div>
                <div className="w-[200px] px-3"></div>
              </div>

              {expandedCategories.has(category.id) &&
                category.processes.map((process) => (
                  <div
                    key={process.id}
                    className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50"
                    data-testid={`process-row-${process.id}`}
                  >
                    <div className="w-10 flex items-center justify-center">
                      <Checkbox
                        checked={selectedRows.has(process.id)}
                        onCheckedChange={() => toggleRowSelection(process.id)}
                        data-testid={`checkbox-process-${process.id}`}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-[295px] px-3 pl-10">
                      <span className="text-gray-400 mr-1">-</span>
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`process-link-${process.id}`}
                      >
                        {process.name}
                      </a>
                    </div>
                    <div className="w-[200px] px-3">
                      <span className="text-sm text-gray-900">{process.processOwner}</span>
                    </div>
                    <div className="w-[200px] px-3">
                      <Badge
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          process.criticality === "High"
                            ? "bg-red-100 text-red-700 hover:bg-red-100"
                            : "bg-green-100 text-green-700 hover:bg-green-100"
                        }`}
                        data-testid={`criticality-badge-${process.id}`}
                      >
                        {process.criticality}
                      </Badge>
                    </div>
                    <div className="w-[200px] px-3">
                      <span className="text-sm text-gray-900">{process.rto}</span>
                    </div>
                    <div className="w-[200px] px-3">
                      <span className="text-sm text-gray-900">{process.rpo}</span>
                    </div>
                    <div className="w-[200px] px-3">
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`bia-link-${process.id}`}
                      >
                        {process.latestBia}
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
