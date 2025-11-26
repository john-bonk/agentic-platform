import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search, Filter, List, GitBranch, Columns, MoreHorizontal } from "lucide-react";
import { businessProcessData, type Category } from "../../data/businessProcessData";

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

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return businessProcessData;
    }
    
    const query = searchQuery.toLowerCase();
    
    return businessProcessData
      .map((category) => {
        const categoryMatches = category.name.toLowerCase().includes(query);
        const filteredProcesses = category.processes.filter(
          (process) =>
            process.name.toLowerCase().includes(query) ||
            process.processOwner.toLowerCase().includes(query) ||
            process.criticality.toLowerCase().includes(query)
        );
        
        if (categoryMatches || filteredProcesses.length > 0) {
          return {
            ...category,
            processes: categoryMatches ? category.processes : filteredProcesses,
          };
        }
        return null;
      })
      .filter((category): category is Category => category !== null);
  }, [searchQuery]);

  return (
    <div className="flex flex-col items-start relative flex-1 self-stretch grow bg-white min-w-0">
      <header className="flex flex-col gap-2 py-8 px-8 w-full bg-white pt-[24px] pb-[24px]">
        <div className="flex gap-4 items-start w-full flex-wrap">
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <h1 className="font-semibold text-gray-900 text-[28px]" data-testid="page-title">
              Business Processes
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
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-r border-gray-200 bg-[#256c92] text-[#ffffff]" data-testid="tree-view-button">
              <GitBranch className="w-4 h-4 text-white" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" data-testid="list-view-button">
              <List className="w-4 h-4 text-gray-500" />
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
            <div className="flex-1 min-w-[200px] flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</span>
            </div>
            <div className="w-[140px] lg:w-[180px] flex-shrink-0 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">PROCESS OWNER</span>
            </div>
            <div className="w-[100px] lg:w-[120px] flex-shrink-0 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">CRITICALITY</span>
            </div>
            <div className="w-[80px] lg:w-[100px] flex-shrink-0 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">RTO</span>
            </div>
            <div className="w-[80px] lg:w-[100px] flex-shrink-0 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">RPO</span>
            </div>
            <div className="w-[90px] lg:w-[110px] flex-shrink-0 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">LATEST BIA</span>
            </div>
          </div>

          <div className="flex flex-col mx-4">
            {filteredData.map((category) => (
              <div key={category.id}>
                <div
                  className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                  data-testid={`category-row-${category.id}`}
                >
                  <div className="w-10 flex-shrink-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.has(category.id)}
                      onCheckedChange={() => toggleRowSelection(category.id)}
                      data-testid={`checkbox-category-${category.id}`}
                    />
                  </div>
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3">
                    <button className="flex items-center justify-center w-4 h-4 flex-shrink-0" data-testid={`toggle-${category.id}`}>
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <span
                      className="text-sm font-medium text-gray-900 truncate"
                      data-testid={`category-link-${category.id}`}
                    >
                      {category.name}
                    </span>
                  </div>
                  <div className="w-[140px] lg:w-[180px] flex-shrink-0 px-3"></div>
                  <div className="w-[100px] lg:w-[120px] flex-shrink-0 px-3"></div>
                  <div className="w-[80px] lg:w-[100px] flex-shrink-0 px-3"></div>
                  <div className="w-[80px] lg:w-[100px] flex-shrink-0 px-3"></div>
                  <div className="w-[90px] lg:w-[110px] flex-shrink-0 px-3"></div>
                </div>

                {expandedCategories.has(category.id) &&
                  category.processes.map((process) => (
                    <div
                      key={process.id}
                      className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50"
                      data-testid={`process-row-${process.id}`}
                    >
                      <div className="w-10 flex-shrink-0 flex items-center justify-center">
                        <Checkbox
                          checked={selectedRows.has(process.id)}
                          onCheckedChange={() => toggleRowSelection(process.id)}
                          data-testid={`checkbox-process-${process.id}`}
                        />
                      </div>
                      <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 pl-10">
                        <span className="text-gray-400 text-lg leading-none flex-shrink-0">&#8226;</span>
                        <Link
                          href={`/process/${process.id}`}
                          className="text-sm text-blue-600 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`process-link-${process.id}`}
                        >
                          {process.name}
                        </Link>
                      </div>
                      <div className="w-[140px] lg:w-[180px] flex-shrink-0 px-3">
                        <span className="text-sm text-gray-900 truncate block">{process.processOwner}</span>
                      </div>
                      <div className="w-[100px] lg:w-[120px] flex-shrink-0 px-3">
                        <Badge
                          className={`text-[10px] font-semibold px-1.5 py-0 rounded-full ${
                            process.criticality === "High"
                              ? "bg-[#db3535] text-white hover:bg-[#db3535]"
                              : "bg-[#36844a] text-white hover:bg-[#36844a]"
                          }`}
                          data-testid={`criticality-badge-${process.id}`}
                        >
                          {process.criticality}
                        </Badge>
                      </div>
                      <div className="w-[80px] lg:w-[100px] flex-shrink-0 px-3">
                        <span className="text-sm text-gray-900">{process.rto}</span>
                      </div>
                      <div className="w-[80px] lg:w-[100px] flex-shrink-0 px-3">
                        <span className="text-sm text-gray-900">{process.rpo}</span>
                      </div>
                      <div className="w-[90px] lg:w-[110px] flex-shrink-0 px-3">
                        <a
                          href="#"
                          className="text-sm text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`bia-link-${process.id}`}
                        >
                          {process.biaLastUpdated.split(" ").pop()}
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
