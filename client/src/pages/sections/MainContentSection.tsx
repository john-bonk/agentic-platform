import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search, Filter, List, GitBranch, Columns, MoreHorizontal, FileText } from "lucide-react";
import { businessProcessData, type Category, getAllBCPs, subscribeToBCPs, type BusinessContinuityPlan } from "../../data/businessProcessData";

function DocumentIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M37.4844 15.0945L56.2846 57.1219L23.6563 61.7073L4.854 19.6819L37.4823 15.0965H37.4844V15.0945Z" fill="#E5FE52"/>
      <path d="M37.2363 63.4201L37.27 63.4952L16.5389 66.4072L16.4927 66.4136L16.474 66.371L7.68555 46.5312L7.76651 46.52L28.3056 43.6335L37.2363 63.4201ZM7.86454 46.6307L16.5678 66.2784L37.0898 63.3958L28.2311 43.7685L7.86454 46.6307Z" fill="#00263F"/>
      <path d="M30.4514 48.7095L9.91287 51.5588L9.896 51.4365L30.4345 48.5874L30.4514 48.7095Z" fill="#00263F"/>
      <path d="M32.72 53.563L32.7286 53.6241L12.1345 56.5555L12.1172 56.4334L32.7111 53.502L32.72 53.563Z" fill="#00263F"/>
      <path d="M34.9361 58.5201L14.2434 61.4413L14.2261 61.3191L34.9188 58.3979L34.9361 58.5201Z" fill="#00263F"/>
      <path d="M32.0544 64.0931L31.998 64.1184L31.9417 64.1435L23.1372 44.4401L23.2497 44.3899L32.0544 64.0931Z" fill="#00263F"/>
      <path d="M26.9358 64.8684L26.8796 64.8939L26.8233 64.9192L17.918 45.1746L18.0305 45.124L26.9358 64.8684Z" fill="#00263F"/>
      <path d="M21.6575 65.6094L21.601 65.6343L21.5446 65.6594L12.814 45.8902L12.9269 45.8403L21.6575 65.6094Z" fill="#00263F"/>
      <path d="M42.7875 9.79126L61.5878 51.8187L28.9594 56.4041L10.1592 14.3766L42.7875 9.79126Z" fill="#C4C4C4"/>
      <path d="M48.0002 4.67678L48.0586 4.66432L66.8923 46.7666L66.8112 46.7779L34.1828 51.3633L34.1368 51.3699L34.1179 51.3275L15.2842 9.2272L47.9938 4.63037L48.0002 4.67678ZM15.4636 9.32644L34.2115 51.2345L66.7128 46.667L47.9656 4.75874L15.4636 9.32644Z" fill="#00263F"/>
      <path d="M46.8175 13.6667L47.161 14.4361L31.0804 16.6949L30.7368 15.9255L46.8175 13.6667Z" fill="#00263F"/>
      <path d="M45.8527 11.5068L46.1962 12.2762L30.1155 14.535L29.772 13.7656L45.8527 11.5068Z" fill="#00263F"/>
      <path d="M49.8971 20.5459L50.2406 21.3153L34.16 23.5761L33.8164 22.8067L49.8971 20.5459Z" fill="#00263F"/>
      <path d="M50.8619 22.7058L51.2055 23.4752L35.1248 25.736L34.7812 24.9666L50.8619 22.7079V22.7058Z" fill="#00263F"/>
      <path d="M54.9065 31.7449L55.25 32.5142L39.1693 34.775L38.8237 34.0057L54.9065 31.7449Z" fill="#00263F"/>
      <path d="M53.9415 29.5872L54.2851 30.3565L38.2044 32.6173L37.8608 31.848L53.9415 29.5872Z" fill="#00263F"/>
      <path d="M57.986 38.6262L58.3295 39.3956L42.2488 41.6564L41.9053 40.887L57.986 38.6262Z" fill="#00263F"/>
      <path d="M58.9508 40.7842L59.2943 41.5536L43.2137 43.8144L42.8701 43.045L58.9508 40.7842Z" fill="#00263F"/>
      <path d="M24.3209 14.1337C24.8146 14.0885 25.3392 14.2263 25.7959 14.4896C26.2855 14.7694 26.6989 15.1932 26.9232 15.6931L26.9623 15.7877C27.1453 16.2547 27.1268 16.7031 26.9417 17.059C26.7565 17.4149 26.4089 17.6741 25.9357 17.7667L25.8391 17.7831C25.3165 17.8572 24.7529 17.7193 24.2653 17.4396C23.8066 17.1763 23.4137 16.7875 23.1833 16.3287L23.1401 16.2361C22.9159 15.7363 22.9241 15.2508 23.1216 14.8723C23.3191 14.4937 23.7017 14.2222 24.2242 14.1481L24.3229 14.1379V14.1337H24.3209Z" fill="white"/>
      <path d="M24.3149 14.0722C24.8234 14.0256 25.3604 14.1677 25.826 14.4361H25.8262C26.2943 14.7035 26.6956 15.1008 26.9337 15.5725L26.9792 15.6679L26.98 15.6695L27.0189 15.7642L27.0193 15.7652L27.0523 15.8552C27.2051 16.3042 27.1785 16.7368 26.996 17.0874C26.8013 17.4617 26.4369 17.7315 25.9474 17.8273L25.9458 17.8275L25.8491 17.844L25.8473 17.8442C25.3423 17.9158 24.8033 17.7952 24.3284 17.5449L24.2344 17.493C23.7666 17.2246 23.3644 16.8274 23.1278 16.3564L23.127 16.3548L23.0838 16.2622L23.0834 16.2612L23.0505 16.1712C22.8544 15.6893 22.8741 15.2272 23.0915 14.8478C23.2997 14.4833 23.66 14.2257 24.1377 14.1588L24.1393 14.1585L24.238 14.1483L24.2399 14.1482L24.3149 14.0722ZM24.2201 14.2089L24.1298 14.2185L24.1286 14.2186C23.693 14.2797 23.3712 14.5115 23.1869 14.8347C23.0027 15.1578 22.9768 15.5665 23.1488 15.9956C23.1491 15.9963 23.1495 15.997 23.1498 15.9977L23.1931 16.0904L23.1932 16.0906C23.4101 16.5218 23.7857 16.8897 24.2179 17.1359L24.3102 17.1868L24.3119 17.1877C24.7447 17.4149 25.233 17.5221 25.6895 17.4574L25.7841 17.4412C26.2076 17.3605 26.5186 17.1335 26.6783 16.8317L26.6801 16.8284C26.8306 16.535 26.8531 16.1612 26.7169 15.7624C26.7167 15.7617 26.7164 15.761 26.7162 15.7602L26.6833 15.6702L26.6765 15.6551L26.6442 15.5817L26.6425 15.5801C26.4247 15.1527 26.0498 14.786 25.6196 14.5398C25.1893 14.2937 24.7018 14.1681 24.2412 14.2089L24.2201 14.2089Z" fill="#00263F"/>
    </svg>
  );
}

function BCPEmptyState({ onCreatePlan }: { onCreatePlan: () => void }) {
  return (
    <div 
      className="flex flex-col items-center justify-center gap-2 p-8 w-full h-full min-h-[400px]"
      data-testid="bcp-list-empty-state"
    >
      <div className="flex flex-col items-center gap-2 w-full max-w-[320px]">
        <div className="overflow-clip relative shrink-0 w-[72px] h-[72px]">
          <DocumentIcon />
        </div>
        
        <div className="flex flex-col gap-4 items-start w-full">
          <div className="flex flex-col gap-2 items-start pt-2 text-center w-full">
            <p 
              className="w-full text-[20px] font-medium text-[#0f172a] dark:text-slate-100 leading-[1.2]"
              data-testid="text-bcp-list-empty-title"
            >
              No Business Continuity Plans
            </p>
            <p 
              className="w-full text-[14px] font-normal text-[#475569] dark:text-slate-400 leading-[1.35]"
              data-testid="text-bcp-list-empty-description"
            >
              Create your first Business Continuity Plan to define recovery procedures and ensure business resilience.
            </p>
          </div>
          
          <div className="flex gap-1 items-center justify-center w-full">
            <button
              className="h-7 px-2 bg-white dark:bg-slate-800 border border-[#cbd5e1] dark:border-slate-600 rounded text-[13px] text-[#0f172a] dark:text-slate-100 leading-[1.35] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              data-testid="button-import-bcp"
            >Import</button>
            <button
              onClick={onCreatePlan}
              className="h-7 px-2 bg-[#266c92] border border-[#266c92] rounded text-[13px] text-white leading-[1.35] hover:bg-[#1e5a7a] transition-colors"
              data-testid="button-create-first-bcp"
            >
              Create Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Draft":
      return (
        <Badge
          className="text-[10px] font-semibold px-1.5 py-0 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-200"
          data-testid="status-badge-draft"
        >
          Draft
        </Badge>
      );
    case "In Review":
      return (
        <Badge
          className="text-[10px] font-semibold px-1.5 py-0 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100"
          data-testid="status-badge-review"
        >
          In Review
        </Badge>
      );
    case "Approved":
      return (
        <Badge
          className="text-[10px] font-semibold px-1.5 py-0 rounded-full bg-[#36844a] text-white hover:bg-[#36844a]"
          data-testid="status-badge-approved"
        >
          Approved
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] h-5">
          {status}
        </Badge>
      );
  }
};

function BCPListContent() {
  const [, navigate] = useLocation();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [bcps, setBCPs] = useState<BusinessContinuityPlan[]>(getAllBCPs);

  const handleBCPChange = useCallback(() => {
    setBCPs(getAllBCPs());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToBCPs(handleBCPChange);
    return unsubscribe;
  }, [handleBCPChange]);

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

  const filteredBCPs = useMemo(() => {
    if (!searchQuery.trim()) {
      return bcps;
    }
    
    const query = searchQuery.toLowerCase();
    
    return bcps.filter((bcp) =>
      bcp.name.toLowerCase().includes(query) ||
      bcp.planOwner.toLowerCase().includes(query) ||
      bcp.status.toLowerCase().includes(query) ||
      bcp.planType.toLowerCase().includes(query)
    );
  }, [bcps, searchQuery]);

  const handleCreatePlan = () => {
    navigate("/create-bcp/new");
  };

  if (bcps.length === 0) {
    return (
      <div className="flex flex-col items-start relative flex-1 self-stretch grow bg-white min-w-0">
        <header className="flex flex-col gap-2 py-8 px-8 w-full bg-white pt-[24px] pb-[24px]">
          <div className="flex gap-4 items-start w-full flex-wrap">
            <div className="flex flex-1 flex-col justify-center min-w-0">
              <h1 className="font-semibold text-gray-900 text-[28px]" data-testid="page-title">
                Business Continuity Plans
              </h1>
            </div>
          </div>
        </header>
        <main className="flex flex-col relative flex-1 self-stretch w-full items-center justify-center">
          <BCPEmptyState onCreatePlan={handleCreatePlan} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start relative flex-1 self-stretch grow bg-white min-w-0">
      <header className="flex flex-col gap-2 py-8 px-8 w-full bg-white pt-[24px] pb-[24px]">
        <div className="flex gap-4 items-start w-full flex-wrap">
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <h1 className="font-semibold text-gray-900 text-[28px]" data-testid="page-title">
              Business Continuity Plans
            </h1>
          </div>

          <div className="flex gap-1 items-start flex-shrink-0">
            <Button
              onClick={handleCreatePlan}
              className="h-[38px] gap-2 px-4 bg-teal-500 hover:bg-teal-500/90 border border-teal-500 text-white text-sm font-normal rounded"
              data-testid="create-bcp-button"
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
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-r border-gray-200 bg-[#256c92] text-[#ffffff]" data-testid="list-view-button">
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
            <div className="flex-1 min-w-[200px] flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</span>
            </div>
            <div className="w-[140px] lg:w-[180px] flex-shrink-0 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">PLAN OWNER</span>
            </div>
            <div className="w-[100px] lg:w-[120px] flex-shrink-0 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</span>
            </div>
            <div className="w-[100px] lg:w-[120px] flex-shrink-0 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">PLAN TYPE</span>
            </div>
            <div className="w-[90px] lg:w-[110px] flex-shrink-0 flex items-center px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">CREATED</span>
            </div>
          </div>

          <div className="flex flex-col mx-4">
            {filteredBCPs.map((bcp) => (
              <div
                key={bcp.id}
                className="flex items-center h-12 border-b border-gray-100 hover:bg-gray-50"
                data-testid={`bcp-row-${bcp.id}`}
              >
                <div className="w-10 flex-shrink-0 flex items-center justify-center">
                  <Checkbox
                    checked={selectedRows.has(bcp.id)}
                    onCheckedChange={() => toggleRowSelection(bcp.id)}
                    data-testid={`checkbox-bcp-${bcp.id}`}
                  />
                </div>
                <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <Link
                    href={`/bcp/${bcp.id}`}
                    className="text-sm text-blue-600 hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`bcp-link-${bcp.id}`}
                  >
                    {bcp.name}
                  </Link>
                </div>
                <div className="w-[140px] lg:w-[180px] flex-shrink-0 px-3">
                  <span className="text-sm text-gray-900 truncate block capitalize">
                    {bcp.planOwner.replace(/-/g, ' ')}
                  </span>
                </div>
                <div className="w-[100px] lg:w-[120px] flex-shrink-0 px-3">
                  {getStatusBadge(bcp.status)}
                </div>
                <div className="w-[100px] lg:w-[120px] flex-shrink-0 px-3">
                  <span className="text-sm text-gray-900 capitalize">
                    {bcp.planType.replace(/-/g, ' ')}
                  </span>
                </div>
                <div className="w-[90px] lg:w-[110px] flex-shrink-0 px-3">
                  <span className="text-sm text-gray-500">
                    {new Date(bcp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function BusinessProcessesContent() {
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
}

export const MainContentSection = (): JSX.Element => {
  const [location] = useLocation();
  
  if (location === "/business-continuity-plans") {
    return <BCPListContent />;
  }
  
  return <BusinessProcessesContent />;
};
