/**
 * Projects Page
 * 
 * Example list page with search, filtering, and data table.
 * Demonstrates common list page patterns.
 * 
 * TODO: Connect to your actual data source
 */

import { useState, useMemo } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  FileText,
  ChevronDown 
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: "Active" | "Completed" | "On Hold" | "Draft";
  owner: string;
  dueDate: string;
  progress: number;
}

const exampleProjects: Project[] = [
  { id: "1", name: "Website Redesign", status: "Active", owner: "Alice Johnson", dueDate: "2024-02-15", progress: 65 },
  { id: "2", name: "Mobile App Development", status: "Active", owner: "Bob Smith", dueDate: "2024-03-01", progress: 40 },
  { id: "3", name: "API Integration", status: "Completed", owner: "Carol Davis", dueDate: "2024-01-20", progress: 100 },
  { id: "4", name: "Database Migration", status: "On Hold", owner: "David Wilson", dueDate: "2024-02-28", progress: 25 },
  { id: "5", name: "Security Audit", status: "Draft", owner: "Eve Martinez", dueDate: "2024-03-15", progress: 0 },
  { id: "6", name: "Performance Optimization", status: "Active", owner: "Frank Brown", dueDate: "2024-02-10", progress: 80 },
];

const getStatusBadge = (status: Project["status"]) => {
  const styles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Completed: "bg-blue-100 text-blue-700 border-blue-200",
    "On Hold": "bg-amber-100 text-amber-700 border-amber-200",
    Draft: "bg-gray-100 text-gray-700 border-gray-200",
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${styles[status]}`}
      data-testid={`status-badge-${status.toLowerCase().replace(" ", "-")}`}
    >
      {status}
    </Badge>
  );
};

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return exampleProjects;
    
    const query = searchQuery.toLowerCase();
    return exampleProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.owner.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query)
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

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader 
          title="Projects" 
          description="Manage and track your projects"
          actions={
            <Button 
              className="gap-2 bg-teal-600 hover:bg-teal-700"
              data-testid="button-create-project"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          }
        />
        
        <div className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-200 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
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
              data-testid="button-sort"
            >
              Sort
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              data-testid="button-more"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-w-fit">
            <div className="flex items-center h-10 border-b border-gray-200 bg-gray-50 sticky top-0 z-10 mx-8">
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <Checkbox data-testid="checkbox-select-all" />
              </div>
              <div className="flex-1 min-w-[200px] flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span>
              </div>
              <div className="w-[120px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
              </div>
              <div className="w-[160px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</span>
              </div>
              <div className="w-[120px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</span>
              </div>
              <div className="w-[100px] flex-shrink-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</span>
              </div>
            </div>

            <div className="flex flex-col mx-8">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center h-14 border-b border-gray-100 hover:bg-gray-50"
                  data-testid={`row-project-${project.id}`}
                >
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <Checkbox
                      checked={selectedRows.has(project.id)}
                      onCheckedChange={() => toggleRowSelection(project.id)}
                      data-testid={`checkbox-project-${project.id}`}
                    />
                  </div>
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900 font-medium truncate">
                      {project.name}
                    </span>
                  </div>
                  <div className="w-[120px] flex-shrink-0 px-3">
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="w-[160px] flex-shrink-0 px-3">
                    <span className="text-sm text-gray-600 truncate">
                      {project.owner}
                    </span>
                  </div>
                  <div className="w-[120px] flex-shrink-0 px-3">
                    <span className="text-sm text-gray-500">
                      {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="w-[100px] flex-shrink-0 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
