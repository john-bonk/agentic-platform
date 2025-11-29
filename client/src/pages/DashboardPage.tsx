/**
 * Dashboard Template
 * 
 * Example dashboard layout with:
 * - Filter bar with dropdowns
 * - Metric cards
 * - Charts (Metric by Category, Trend, Distribution)
 * - Items Overview table
 */

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  RefreshCw,
  MoreHorizontal,
  ArrowUpDown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { useLocation } from "wouter";
import { useTabStore } from "@/lib/tabStore";

const metricByCategory = [
  { name: "Category 1", q1: 60, q2: 45, q3: 70, q4: 50 },
  { name: "Category 2", q1: 40, q2: 35, q3: 55, q4: 40 },
  { name: "Category 3", q1: 30, q2: 25, q3: 40, q4: 30 },
  { name: "Category 4", q1: 20, q2: 15, q3: 25, q4: 20 },
];

const riskTrendData = [
  { month: "Jan", low: 20, medium: 45, high: 70 },
  { month: "Feb", low: 25, medium: 50, high: 65 },
  { month: "Mar", low: 22, medium: 55, high: 60 },
  { month: "Apr", low: 28, medium: 48, high: 55 },
  { month: "May", low: 30, medium: 52, high: 50 },
  { month: "Jun", low: 25, medium: 50, high: 45 },
  { month: "Jul", low: 28, medium: 48, high: 40 },
  { month: "Aug", low: 32, medium: 45, high: 38 },
  { month: "Sep", low: 30, medium: 42, high: 35 },
  { month: "Oct", low: 28, medium: 40, high: 32 },
  { month: "Nov", low: 25, medium: 38, high: 30 },
  { month: "Dec", low: 22, medium: 35, high: 28 },
];

const distributionData = [
  { name: "Complete", value: 61, color: "#22c55e" },
  { name: "Pending", value: 24, color: "#ef4444" },
  { name: "Not Started", value: 15, color: "#94a3b8" },
];

const dashboardItems = [
  { 
    id: "1-1",
    name: "Item 1", 
    category: "Category 1", 
    priority: "High",
    status: "Not Started",
    metric: "1 hour",
    owner: "Owner A"
  },
  { 
    id: "1-2",
    name: "Item 2", 
    category: "Category 1", 
    priority: "Low",
    status: "Not Started",
    metric: "30 mins",
    owner: "Owner A"
  },
  { 
    id: "1-3",
    name: "Item 3", 
    category: "Category 1", 
    priority: "Low",
    status: "Not Started",
    metric: "24 hours",
    owner: "Owner A"
  },
  { 
    id: "2-1",
    name: "Item 4", 
    category: "Category 2", 
    priority: "Low",
    status: "Not Started",
    metric: "1 hour",
    owner: "Owner B"
  },
  { 
    id: "2-2",
    name: "Item 5", 
    category: "Category 2", 
    priority: "High",
    status: "Not Started",
    metric: "4 hours",
    owner: "Owner B"
  },
];

export function DashboardPage() {
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [, setLocation] = useLocation();
  const { openTab } = useTabStore();

  const clearFilters = () => {
    setCategory("all");
    setPriority("all");
    setStatus("all");
  };

  const filteredItems = dashboardItems.filter(item => {
    const matchesCategory = category === "all" || 
      (category === "cat1" && item.category === "Category 1") ||
      (category === "cat2" && item.category === "Category 2");
    const matchesPriority = priority === "all" || 
      item.priority.toLowerCase() === priority;
    const matchesStatus = status === "all" || 
      (status === "not-started" && item.status === "Not Started") ||
      (status === "in-progress" && item.status === "In Progress") ||
      (status === "complete" && item.status === "Complete");
    return matchesCategory && matchesPriority && matchesStatus;
  });

  const highPriorityCount = filteredItems.filter(p => p.priority === "High").length;

  const handleItemClick = (item: typeof dashboardItems[0]) => {
    const tab = {
      id: `item-${item.id}`,
      name: item.name,
      path: `/items/${item.id}`,
    };
    openTab(tab);
    setLocation(`/items/${item.id}`);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900" data-testid="text-dashboard-title">Dashboard Template</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-more"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Category</span>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger 
                className="w-[200px] h-9 text-sm bg-white"
                data-testid="select-category"
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cat1">Category 1</SelectItem>
                <SelectItem value="cat2">Category 2</SelectItem>
                <SelectItem value="cat3">Category 3</SelectItem>
                <SelectItem value="cat4">Category 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Priority</span>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger 
                className="w-[200px] h-9 text-sm bg-white"
                data-testid="select-priority"
              >
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger 
                className="w-[200px] h-9 text-sm bg-white"
                data-testid="select-status"
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end h-full ml-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="text-gray-600"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-6 space-y-6 bg-[#f9fafb]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white py-4 text-center border border-gray-200 rounded">
              <div className="text-2xl font-semibold text-gray-900" data-testid="metric-total-items">{filteredItems.length}</div>
              <div className="text-sm text-gray-500 mt-1">Total Items</div>
            </div>
            <div className="bg-white py-4 text-center border border-gray-200 rounded">
              <div className="text-2xl font-semibold text-gray-900" data-testid="metric-1">92%</div>
              <div className="text-sm text-gray-500 mt-1">Metric 1</div>
            </div>
            <div className="bg-white py-4 text-center border border-gray-200 rounded">
              <div className="text-2xl font-semibold text-gray-900" data-testid="metric-2">8</div>
              <div className="text-sm text-gray-500 mt-1">Metric 2</div>
            </div>
            <div className="bg-white py-4 text-center border border-gray-200 rounded">
              <div className="text-2xl font-semibold text-gray-900" data-testid="metric-3">1</div>
              <div className="text-sm text-gray-500 mt-1">Metric 3</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded bg-white">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-medium text-gray-700">Metric by Category</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metricByCategory} layout="vertical" barGap={1} barSize={12}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => v} fontSize={10} />
                      <YAxis type="category" dataKey="name" width={80} fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="q1" fill="#3b82f6" name="Q1" />
                      <Bar dataKey="q2" fill="#1d4ed8" name="Q2" />
                      <Bar dataKey="q3" fill="#60a5fa" name="Q3" />
                      <Bar dataKey="q4" fill="#93c5fd" name="Q4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Q1</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-700" />
                    <span>Q2</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <span>Q3</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-300" />
                    <span>Q4</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded bg-white">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-medium text-gray-700">Trend Chart</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={10} />
                      <YAxis domain={[0, 100]} fontSize={10} />
                      <Tooltip />
                      <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={false} name="Low" />
                      <Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={2} dot={false} name="Medium" />
                      <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={false} name="High" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded bg-white">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-medium text-gray-700">Distribution</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">61%</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-400" />
                    <span>Not Started</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-red-500" />
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                    <span>Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded bg-white">
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium text-gray-700">Items Overview</h3>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">{filteredItems.length} items</span>
                  <span className="mx-2">|</span>
                  <span>{highPriorityCount} high priority</span>
                </div>
              </div>
            </div>
            <div className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Name
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">Category</TableHead>
                    <TableHead className="font-medium text-gray-600">Priority</TableHead>
                    <TableHead className="font-medium text-gray-600">Status</TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Metric
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      data-testid={`row-item-${item.id}`}
                    >
                      <TableCell>
                        <button
                          onClick={() => handleItemClick(item)}
                          className="text-teal-600 hover:underline text-left font-medium"
                          data-testid={`link-item-${item.id}`}
                        >
                          {item.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-gray-600">{item.category}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            item.priority === "High" 
                              ? "text-red-600 border-red-200 bg-red-50" 
                              : "text-blue-600 border-blue-200 bg-blue-50"
                          }`}
                        >
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="text-xs text-gray-600 border-gray-300 bg-gray-100"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{item.metric}</TableCell>
                      <TableCell className="text-gray-600">{item.owner}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
