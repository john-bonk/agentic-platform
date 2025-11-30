/**
 * List Page
 * 
 * Template page showing a flat data table without hierarchical nesting.
 * Features simple rows with status badges, clickable links, and search/filter controls.
 * 
 * Columns: NAME, OWNER, STATUS, CATEGORY, LAST MODIFIED
 * 
 * To customize:
 * 1. Update the ListItem interface with your data fields
 * 2. Replace exampleData with your actual data source
 * 3. Modify column headers and cell content as needed
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
  List,
  Columns
} from "lucide-react";
import { useTabStore } from "@/lib/tabStore";

type ItemStatus = "Active" | "Pending" | "Inactive" | "Archived";
type ItemCategory = "Primary" | "Secondary" | "Tertiary";

interface ListItem {
  id: string;
  name: string;
  owner: string;
  status: ItemStatus;
  category: ItemCategory;
  lastModified: string;
}

const exampleData: ListItem[] = [
  { id: "list-1", name: "Item Alpha", owner: "Owner A", status: "Active", category: "Primary", lastModified: "2024-11-15" },
  { id: "list-2", name: "Item Beta", owner: "Owner B", status: "Pending", category: "Secondary", lastModified: "2024-11-14" },
  { id: "list-3", name: "Item Gamma", owner: "Owner A", status: "Active", category: "Primary", lastModified: "2024-11-13" },
  { id: "list-4", name: "Item Delta", owner: "Owner C", status: "Inactive", category: "Tertiary", lastModified: "2024-11-12" },
  { id: "list-5", name: "Item Epsilon", owner: "Owner B", status: "Active", category: "Secondary", lastModified: "2024-11-11" },
  { id: "list-6", name: "Item Zeta", owner: "Owner A", status: "Pending", category: "Primary", lastModified: "2024-11-10" },
  { id: "list-7", name: "Item Eta", owner: "Owner D", status: "Archived", category: "Tertiary", lastModified: "2024-11-09" },
  { id: "list-8", name: "Item Theta", owner: "Owner C", status: "Active", category: "Secondary", lastModified: "2024-11-08" },
  { id: "list-9", name: "Item Iota", owner: "Owner B", status: "Active", category: "Primary", lastModified: "2024-11-07" },
  { id: "list-10", name: "Item Kappa", owner: "Owner D", status: "Pending", category: "Tertiary", lastModified: "2024-11-06" },
];

const getStatusBadge = (status: ItemStatus) => {
  const styles: Record<ItemStatus, string> = {
    Active: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    Pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    Inactive: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    Archived: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  };
  
  return (
    <Badge 
      variant="outline"
      className={`text-xs px-2 py-0.5 ${styles[status]}`}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      {status}
    </Badge>
  );
};


const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
};

export function ListPage() {
  const [, setLocation] = useLocation();
  const { openTab } = useTabStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return exampleData;
    
    const query = searchQuery.toLowerCase();
    return exampleData.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.owner.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
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

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map(item => item.id)));
    }
  };

  const handleItemClick = (item: ListItem) => {
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
          title="List Page" 
          description="View and manage items in a flat table format"
          actions={
            <Button 
              className="gap-2"
              data-testid="button-create-item"
            >
              <Plus className="w-4 h-4" />
              Create Item
            </Button>
          }
        />
        
        <div className="flex items-center justify-between px-8 py-3 bg-white dark:bg-gray-900 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-[200px] sm:w-[280px] text-sm"
                data-testid="input-search"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-1.5 text-gray-600 dark:text-gray-400"
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
              className="h-9 gap-1.5 text-gray-600 dark:text-gray-400"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-1.5 text-gray-600 dark:text-gray-400"
              data-testid="button-view-columns"
            >
              <Columns className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-1.5 text-gray-600 dark:text-gray-400"
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

        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 pl-[16px] pr-[16px]">
          <div className="min-w-fit">
            <div className="flex items-center h-10 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 bg-white dark:bg-gray-900">
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <Checkbox 
                  checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                  onCheckedChange={toggleSelectAll}
                  data-testid="checkbox-select-all" 
                />
              </div>
              <div className="flex-1 min-w-[280px] flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span>
              </div>
              <div className="w-[160px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</span>
              </div>
              <div className="w-[120px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
              </div>
              <div className="w-[120px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</span>
              </div>
              <div className="w-[140px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</span>
              </div>
            </div>

            <div className="flex flex-col">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center h-12 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  data-testid={`row-${item.id}`}
                >
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <Checkbox
                      checked={selectedRows.has(item.id)}
                      onCheckedChange={() => toggleRowSelection(item.id)}
                      data-testid={`checkbox-${item.id}`}
                    />
                  </div>
                  <div className="flex-1 min-w-[280px] flex items-center gap-2 px-3">
                    <button
                      onClick={() => handleItemClick(item)}
                      className="text-sm hover:underline font-medium truncate text-left text-[#3172E3]"
                      data-testid={`link-${item.id}`}
                    >
                      {item.name}
                    </button>
                  </div>
                  <div className="w-[160px] flex-shrink-0 px-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.owner}
                    </span>
                  </div>
                  <div className="w-[120px] flex-shrink-0 px-3">
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="w-[120px] flex-shrink-0 px-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300" data-testid={`text-category-${item.id}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="w-[140px] flex-shrink-0 px-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(item.lastModified)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
