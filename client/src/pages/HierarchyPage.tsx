/**
 * Hierarchy Page
 * 
 * Template page showing a hierarchical data table with expandable rows.
 * Features multi-level nesting (Region > Country > State > City) with progressive indentation.
 * Includes status badges, clickable links, parent references, and type labels.
 * 
 * Columns: NAME, PARENT, TYPE, DATE CREATED, ALLOWED ON
 * 
 * To customize:
 * 1. Update the HierarchyItem interface with your data fields
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
  ChevronRight,
  List,
  Columns
} from "lucide-react";
import { useTabStore } from "@/lib/tabStore";

type HierarchyType = "Region" | "Country" | "State" | "City";

interface HierarchyItem {
  id: string;
  name: string;
  parent?: string;
  type: HierarchyType;
  dateCreated: string;
  allowedOn?: string[];
  children?: HierarchyItem[];
}

const exampleData: HierarchyItem[] = [
  { 
    id: "hier-1", 
    name: "North America",
    type: "Region",
    dateCreated: "2023-01-15",
    allowedOn: ["Plans", "Exercises"],
    children: [
      { 
        id: "hier-1-1", 
        name: "United States", 
        parent: "North America",
        type: "Country", 
        dateCreated: "2023-02-10",
        allowedOn: ["Plans", "Exercises"],
        children: [
          { 
            id: "hier-1-1-1", 
            name: "California", 
            parent: "United States",
            type: "State", 
            dateCreated: "2023-03-05",
            allowedOn: ["Plans"],
            children: [
              { id: "hier-1-1-1-1", name: "Los Angeles", parent: "California", type: "City", dateCreated: "2023-04-01", allowedOn: ["Plans"] },
              { id: "hier-1-1-1-2", name: "San Francisco", parent: "California", type: "City", dateCreated: "2023-04-02", allowedOn: ["Plans"] },
            ]
          },
          { 
            id: "hier-1-1-2", 
            name: "New York", 
            parent: "United States",
            type: "State", 
            dateCreated: "2023-03-10",
            allowedOn: ["Plans", "Exercises"],
            children: [
              { id: "hier-1-1-2-1", name: "New York City", parent: "New York", type: "City", dateCreated: "2023-04-05", allowedOn: ["Plans", "Exercises"] },
            ]
          },
        ]
      },
      { 
        id: "hier-1-2", 
        name: "Canada", 
        parent: "North America",
        type: "Country", 
        dateCreated: "2023-02-15",
        allowedOn: ["Plans"],
        children: [
          { id: "hier-1-2-1", name: "Ontario", parent: "Canada", type: "State", dateCreated: "2023-03-20", allowedOn: ["Plans"] },
          { id: "hier-1-2-2", name: "British Columbia", parent: "Canada", type: "State", dateCreated: "2023-03-21", allowedOn: ["Plans"] },
        ]
      },
    ]
  },
  { 
    id: "hier-2", 
    name: "Europe",
    type: "Region",
    dateCreated: "2023-01-20",
    allowedOn: ["Plans", "Exercises"],
    children: [
      { 
        id: "hier-2-1", 
        name: "United Kingdom", 
        parent: "Europe",
        type: "Country", 
        dateCreated: "2023-02-20",
        allowedOn: ["Plans", "Exercises"],
        children: [
          { id: "hier-2-1-1", name: "England", parent: "United Kingdom", type: "State", dateCreated: "2023-03-25", allowedOn: ["Plans"] },
        ]
      },
      { 
        id: "hier-2-2", 
        name: "Germany", 
        parent: "Europe",
        type: "Country", 
        dateCreated: "2023-02-25",
        allowedOn: ["Plans"],
      },
    ]
  },
  { 
    id: "hier-3", 
    name: "Asia Pacific",
    type: "Region",
    dateCreated: "2023-01-25",
    allowedOn: ["Plans"],
    children: [
      { 
        id: "hier-3-1", 
        name: "Japan", 
        parent: "Asia Pacific",
        type: "Country", 
        dateCreated: "2023-03-01",
        allowedOn: ["Plans"],
      },
      { 
        id: "hier-3-2", 
        name: "Australia", 
        parent: "Asia Pacific",
        type: "Country", 
        dateCreated: "2023-03-05",
        allowedOn: ["Plans", "Exercises"],
      },
    ]
  },
];

const getTypeBadge = (type: HierarchyType) => {
  const styles: Record<HierarchyType, string> = {
    Region: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    Country: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    State: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    City: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  };
  
  return (
    <Badge 
      variant="outline"
      className={`text-xs px-2 py-0.5 ${styles[type]}`}
      data-testid={`badge-type-${type.toLowerCase()}`}
    >
      {type}
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

const getAllExpandableIds = (items: HierarchyItem[]): string[] => {
  const ids: string[] = [];
  const collectIds = (items: HierarchyItem[]) => {
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        ids.push(item.id);
        collectIds(item.children);
      }
    });
  };
  collectIds(items);
  return ids;
};

export function HierarchyPage() {
  const [location, setLocation] = useLocation();
  const { openTab } = useTabStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set(getAllExpandableIds(exampleData)));
  
  const isTemplate2 = location.startsWith("/template2");
  const basePath = isTemplate2 ? "/template2" : "";

  const filterItems = (items: HierarchyItem[], query: string): HierarchyItem[] => {
    return items.reduce<HierarchyItem[]>((acc, item) => {
      const matchesQuery = item.name.toLowerCase().includes(query) ||
        item.parent?.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query);
      
      const filteredChildren = item.children ? filterItems(item.children, query) : [];
      
      if (matchesQuery || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : item.children
        });
      }
      return acc;
    }, []);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return exampleData;
    return filterItems(exampleData, searchQuery.toLowerCase());
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

  const handleItemClick = (item: HierarchyItem) => {
    openTab({
      id: item.id,
      name: item.name,
      path: `${basePath}/items/${item.id}`
    });
    setLocation(`${basePath}/items/${item.id}`);
  };

  const getIndentLevel = (type: HierarchyType): number => {
    const levels: Record<HierarchyType, number> = {
      Region: 0,
      Country: 1,
      State: 2,
      City: 3,
    };
    return levels[type];
  };

  const renderRow = (item: HierarchyItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedRows.has(item.id);
    const indentPadding = 16 + (depth * 24);

    return (
      <div key={item.id}>
        <div
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
          <div 
            className="flex-1 min-w-[280px] flex items-center gap-1 px-3"
            style={{ paddingLeft: `${indentPadding}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleRowExpansion(item.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                data-testid={`button-expand-${item.id}`}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <button
              onClick={() => handleItemClick(item)}
              className="text-sm hover:underline font-medium truncate text-left text-[#3172E3]"
              data-testid={`link-${item.id}`}
            >
              {item.name}
            </button>
          </div>
          <div className="w-[180px] flex-shrink-0 px-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {item.parent || "--"}
            </span>
          </div>
          <div className="w-[120px] flex-shrink-0 px-3">
            {getTypeBadge(item.type)}
          </div>
          <div className="w-[140px] flex-shrink-0 px-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatDate(item.dateCreated)}
            </span>
          </div>
          <div className="w-[160px] flex-shrink-0 px-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {item.allowedOn?.join(", ") || "--"}
            </span>
          </div>
        </div>

        {isExpanded && item.children?.map((child) => renderRow(child, depth + 1))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader 
          title="Hierarchy" 
          description="View and manage hierarchical data with nested relationships"
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
        
        <div className="flex items-center justify-between px-8 py-3 bg-white dark:bg-card flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search hierarchy..."
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

        <div className="flex-1 overflow-auto bg-white dark:bg-card pl-[16px] pr-[16px]">
          <div className="min-w-fit">
            <div className="flex items-center h-10 border-b border-gray-200 dark:border-border sticky top-0 z-10 bg-white dark:bg-card">
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <Checkbox data-testid="checkbox-select-all" />
              </div>
              <div className="flex-1 min-w-[280px] flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Name</span>
              </div>
              <div className="w-[180px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Parent</span>
              </div>
              <div className="w-[120px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Type</span>
              </div>
              <div className="w-[140px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Date Created</span>
              </div>
              <div className="w-[160px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Allowed On</span>
              </div>
            </div>

            <div className="flex flex-col">
              {filteredData.map((item) => renderRow(item))}
            </div>

            {filteredData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-muted-foreground">
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
