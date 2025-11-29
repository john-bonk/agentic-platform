/**
 * Projects Page
 * 
 * Example list page with hierarchical data table matching Figma design.
 * Features expandable parent rows with children, status badges, and clickable links.
 * 
 * Columns: NAME, PROCESS OWNER, CRITICALITY, RTO, RPO, LATEST BIA
 * 
 * TODO: Connect to your actual data source
 */

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  ChevronDown,
  ChevronRight,
  GripVertical,
  List,
  Columns
} from "lucide-react";
import { useTabStore } from "@/lib/tabStore";

interface ProcessItem {
  id: string;
  name: string;
  processOwner?: string;
  criticality?: "High" | "Medium" | "Low";
  rto?: string;
  rpo?: string;
  latestBia?: string;
  children?: ProcessItem[];
}

const exampleData: ProcessItem[] = [
  { 
    id: "1", 
    name: "Retail Banking Operations",
    children: [
      { id: "1-1", name: "Account Management", processOwner: "Baylor Cruz", criticality: "High", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "1-2", name: "Loan Origination and Servicing", processOwner: "Baylor Cruz", criticality: "Low", rto: "30 mins", rpo: "30 mins", latestBia: "2024" },
      { id: "1-3", name: "Customer Service and Support", processOwner: "Baylor Cruz", criticality: "Low", rto: "24 hours", rpo: "24 hours", latestBia: "2024" },
    ]
  },
  { 
    id: "2", 
    name: "Human Resources",
    children: [
      { id: "2-1", name: "Employee Onboarding and Offboarding", processOwner: "Dante Bradford", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "2-2", name: "Benefits Administration", processOwner: "Dante Bradford", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "2-3", name: "Training & Development", processOwner: "Dante Bradford", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
    ]
  },
  { 
    id: "3", 
    name: "Treasury & Cash Management",
    children: [
      { id: "3-1", name: "Cash Flow Forecasting", processOwner: "Leah Sullivan", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "3-2", name: "Liquidity Management", processOwner: "Leah Sullivan", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "3-3", name: "Payment Processing", processOwner: "Leah Sullivan", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
      { id: "3-4", name: "Benefits Administration", processOwner: "Leah Sullivan", criticality: "Low", rto: "1 hour", rpo: "1 hour", latestBia: "2024" },
    ]
  },
];

const getCriticalityBadge = (criticality?: ProcessItem["criticality"]) => {
  if (!criticality) return null;
  
  const styles = {
    High: "bg-red-500 text-white border-red-500",
    Medium: "bg-amber-500 text-white border-amber-500",
    Low: "bg-green-500 text-white border-green-500",
  };
  
  return (
    <Badge 
      className={`text-xs px-2 py-0.5 ${styles[criticality]}`}
      data-testid={`badge-criticality-${criticality.toLowerCase()}`}
    >
      {criticality}
    </Badge>
  );
};

export function ProjectsPage() {
  const [, setLocation] = useLocation();
  const { openTab } = useTabStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(["1", "2", "3"]));

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return exampleData;
    
    const query = searchQuery.toLowerCase();
    return exampleData.map(parent => {
      const matchingChildren = parent.children?.filter(
        child =>
          child.name.toLowerCase().includes(query) ||
          child.processOwner?.toLowerCase().includes(query)
      ) || [];
      
      if (parent.name.toLowerCase().includes(query) || matchingChildren.length > 0) {
        return { ...parent, children: matchingChildren.length > 0 ? matchingChildren : parent.children };
      }
      return null;
    }).filter(Boolean) as ProcessItem[];
  }, [searchQuery]);

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: ProcessItem) => {
    openTab({
      id: item.id,
      name: item.name,
      path: `/items/${item.id}`
    });
    setLocation(`/items/${item.id}`);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader 
          title="Projects" 
          description="Manage and track your business processes"
          actions={
            <Button 
              className="gap-2 bg-teal-600 hover:bg-teal-700"
              data-testid="button-create-project"
            >
              <Plus className="w-4 h-4" />
              Create Process
            </Button>
          }
        />
        
        <div className="flex items-center justify-between px-8 py-3 bg-white flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search processes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-[200px] sm:w-[280px] text-sm"
                data-testid="input-search"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-1.5 text-gray-600"
              data-testid="button-filter"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Add Filter</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-1.5 text-gray-600"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-1.5 text-gray-600"
              data-testid="button-view-columns"
            >
              <Columns className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-1.5 text-gray-600"
              data-testid="button-sort"
            >
              Sort
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              data-testid="button-more"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <div className="min-w-fit">
            <div className="flex items-center h-10 border-b border-gray-200 sticky top-0 z-10 bg-white">
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <Checkbox data-testid="checkbox-select-all" />
              </div>
              <div className="flex-1 min-w-[280px] flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span>
              </div>
              <div className="w-[180px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Process Owner</span>
              </div>
              <div className="w-[120px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Criticality</span>
              </div>
              <div className="w-[100px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">RTO</span>
              </div>
              <div className="w-[100px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">RPO</span>
              </div>
              <div className="w-[120px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Latest BIA</span>
              </div>
            </div>

            <div className="flex flex-col">
              {filteredData.map((parent) => (
                <div key={parent.id}>
                  <div
                    className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50"
                    data-testid={`row-parent-${parent.id}`}
                  >
                    <div className="w-10 flex-shrink-0 flex items-center justify-center">
                      <Checkbox
                        checked={selectedRows.has(parent.id)}
                        onCheckedChange={() => toggleRowSelection(parent.id)}
                        data-testid={`checkbox-parent-${parent.id}`}
                      />
                    </div>
                    <div className="flex-1 min-w-[280px] flex items-center gap-1 px-3">
                      <button
                        onClick={() => toggleRowExpansion(parent.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        data-testid={`button-expand-${parent.id}`}
                      >
                        {expandedRows.has(parent.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <span className="text-sm font-medium text-gray-900">
                        {parent.name}
                      </span>
                    </div>
                    <div className="w-[180px] flex-shrink-0 px-3" />
                    <div className="w-[120px] flex-shrink-0 px-3" />
                    <div className="w-[100px] flex-shrink-0 px-3" />
                    <div className="w-[100px] flex-shrink-0 px-3" />
                    <div className="w-[120px] flex-shrink-0 px-3" />
                  </div>

                  {expandedRows.has(parent.id) && parent.children?.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50"
                      data-testid={`row-child-${child.id}`}
                    >
                      <div className="w-10 flex-shrink-0 flex items-center justify-center">
                        <Checkbox
                          checked={selectedRows.has(child.id)}
                          onCheckedChange={() => toggleRowSelection(child.id)}
                          data-testid={`checkbox-child-${child.id}`}
                        />
                      </div>
                      <div className="flex-1 min-w-[280px] flex items-center gap-2 px-3 pl-10">
                        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 invisible group-hover:visible" />
                        <button
                          onClick={() => handleItemClick(child)}
                          className="text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium truncate text-left"
                          data-testid={`link-child-${child.id}`}
                        >
                          {child.name}
                        </button>
                      </div>
                      <div className="w-[180px] flex-shrink-0 px-3">
                        <span className="text-sm text-gray-700">
                          {child.processOwner}
                        </span>
                      </div>
                      <div className="w-[120px] flex-shrink-0 px-3">
                        {getCriticalityBadge(child.criticality)}
                      </div>
                      <div className="w-[100px] flex-shrink-0 px-3">
                        <span className="text-sm text-gray-700">
                          {child.rto}
                        </span>
                      </div>
                      <div className="w-[100px] flex-shrink-0 px-3">
                        <span className="text-sm text-gray-700">
                          {child.rpo}
                        </span>
                      </div>
                      <div className="w-[120px] flex-shrink-0 px-3">
                        <button
                          className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                          data-testid={`link-bia-${child.id}`}
                        >
                          {child.latestBia}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {filteredData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <p className="text-lg font-medium">No processes found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
