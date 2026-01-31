/**
 * Activity List Component
 * 
 * Shared UI pattern for displaying Recent and Favorites lists.
 * Features selectable items with icons, descriptions, and metadata.
 */

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Star,
  Clock,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityItem, getTypeLabel } from "@/config/activityData";

export type ActivityListMode = "recent" | "favorites";

interface ActivityListProps {
  items: ActivityItem[];
  mode: ActivityListMode;
  title?: string;
  description?: string;
  onItemClick?: (item: ActivityItem) => void;
  showSearch?: boolean;
  showCheckboxes?: boolean;
}

const getTypeBadgeStyles = (type: string): string => {
  const styles: Record<string, string> = {
    report: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    dashboard: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    control: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    risk: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    audit: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    task: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
    policy: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    assessment: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
    vendor: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    finding: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    framework: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    workflow: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
    scan: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    document: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };
  return styles[type] || styles.document;
};

export function ActivityList({
  items,
  mode,
  onItemClick,
  showSearch = true,
  showCheckboxes = true,
}: ActivityListProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) => {
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
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleItemClick = (item: ActivityItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      setLocation(item.path);
    }
  };

  const ModeIcon = mode === "recent" ? Clock : Star;

  return (
    <div className="flex flex-col h-full">
      {showSearch && (
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${mode}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              data-testid={`input-search-${mode}`}
            />
          </div>
          {selectedItems.size > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedItems.size} selected
            </Badge>
          )}
        </div>
      )}

      <Card className="flex-1 overflow-hidden">
        <div className="border-b bg-muted/30">
          <div className="grid grid-cols-[auto_1fr_150px_120px_100px_40px] gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {showCheckboxes && (
              <div className="flex items-center">
                <Checkbox
                  checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                  data-testid={`checkbox-select-all-${mode}`}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <ModeIcon className="w-3.5 h-3.5" />
              <span>Name</span>
            </div>
            <div>Type</div>
            <div>Status</div>
            <div>{mode === "recent" ? "Accessed" : ""}</div>
            <div></div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-48px)]">
          <CardContent className="p-0">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ModeIcon className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? `No ${mode} items match your search` : `No ${mode} items yet`}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[auto_1fr_150px_120px_100px_40px] gap-4 px-4 py-3 hover-elevate cursor-pointer items-center"
                      onClick={() => handleItemClick(item)}
                      data-testid={`row-${mode}-${item.id}`}
                    >
                      {showCheckboxes && (
                        <div 
                          className="flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={() => toggleSelection(item.id)}
                            data-testid={`checkbox-${item.id}`}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate" data-testid={`text-name-${item.id}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeBadgeStyles(item.type)}`}
                          data-testid={`badge-type-${item.id}`}
                        >
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>

                      <div>
                        {item.metadata?.status && (
                          <span className="text-xs text-muted-foreground">
                            {item.metadata.status}
                          </span>
                        )}
                        {item.metadata?.category && !item.metadata.status && (
                          <span className="text-xs text-muted-foreground">
                            {item.metadata.category}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {item.timestamp}
                      </div>

                      <div 
                        className="flex items-center justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-menu-${item.id}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem data-testid={`menu-open-${item.id}`}>
                              <ChevronRight className="w-4 h-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            {mode === "recent" ? (
                              <DropdownMenuItem data-testid={`menu-favorite-${item.id}`}>
                                <Star className="w-4 h-4 mr-2" />
                                Add to Favorites
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem data-testid={`menu-unfavorite-${item.id}`}>
                                <Star className="w-4 h-4 mr-2" />
                                Remove from Favorites
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
