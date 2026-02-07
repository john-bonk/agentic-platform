import { useState } from "react";
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
  Tooltip
} from "recharts";

const metricByCategory = [
  { name: "Category 1", q1: 60, q2: 45, q3: 70, q4: 50 },
  { name: "Category 2", q1: 40, q2: 35, q3: 55, q4: 40 },
  { name: "Category 3", q1: 30, q2: 25, q3: 40, q4: 30 },
  { name: "Category 4", q1: 20, q2: 15, q3: 25, q4: 20 },
];

const trendData = [
  { month: "Jan", series1: 20, series2: 45, series3: 70 },
  { month: "Feb", series1: 25, series2: 50, series3: 65 },
  { month: "Mar", series1: 22, series2: 55, series3: 60 },
  { month: "Apr", series1: 28, series2: 48, series3: 55 },
  { month: "May", series1: 30, series2: 52, series3: 50 },
  { month: "Jun", series1: 25, series2: 50, series3: 45 },
  { month: "Jul", series1: 28, series2: 48, series3: 40 },
  { month: "Aug", series1: 32, series2: 45, series3: 38 },
  { month: "Sep", series1: 30, series2: 42, series3: 35 },
  { month: "Oct", series1: 28, series2: 40, series3: 32 },
  { month: "Nov", series1: 25, series2: 38, series3: 30 },
  { month: "Dec", series1: 22, series2: 35, series3: 28 },
];

const distributionData = [
  { name: "Complete", value: 61, color: "#266C92" },
  { name: "Pending", value: 24, color: "#94a3b8" },
  { name: "Not Started", value: 15, color: "#e2e8f0" },
];

const defaultItems = [
  { id: "1-1", name: "Item 1", category: "Category 1", priority: "High", status: "Not Started", metric: "1 hour", owner: "Owner A" },
  { id: "1-2", name: "Item 2", category: "Category 1", priority: "Low", status: "Not Started", metric: "30 mins", owner: "Owner A" },
  { id: "1-3", name: "Item 3", category: "Category 1", priority: "Low", status: "Not Started", metric: "24 hours", owner: "Owner A" },
  { id: "2-1", name: "Item 4", category: "Category 2", priority: "Low", status: "Not Started", metric: "1 hour", owner: "Owner B" },
  { id: "2-2", name: "Item 5", category: "Category 2", priority: "High", status: "Not Started", metric: "4 hours", owner: "Owner B" },
];

export interface DashboardItem {
  id: string;
  name: string;
  category: string;
  priority: string;
  status: string;
  metric: string;
  owner: string;
}

interface DefaultDashboardContentProps {
  title?: string;
  items?: DashboardItem[];
  compact?: boolean;
}

export function DefaultDashboardContent({ title = "Dashboard Template", items, compact }: DefaultDashboardContentProps) {
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");

  const displayItems = items || defaultItems;

  const uniqueCategories = Array.from(new Set(displayItems.map(i => i.category)));

  const clearFilters = () => {
    setCategory("all");
    setPriority("all");
    setStatus("all");
  };

  const filteredItems = displayItems.filter(item => {
    const matchesCategory = category === "all" || item.category === category;
    const matchesPriority = priority === "all" ||
      item.priority.toLowerCase() === priority;
    const matchesStatus = status === "all" ||
      (status === "not-started" && item.status === "Not Started") ||
      (status === "in-progress" && item.status === "In Progress") ||
      (status === "complete" && item.status === "Complete");
    return matchesCategory && matchesPriority && matchesStatus;
  });

  const highPriorityCount = filteredItems.filter(p => p.priority === "High").length;

  const chartHeight = compact ? 120 : 192;
  const fontSize = compact ? 8 : 10;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white dark:bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-foreground" data-testid="text-dashboard-title">{title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-more">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 dark:bg-muted/50 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 dark:text-muted-foreground">Category</span>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px] h-9 text-sm bg-white dark:bg-card" data-testid="select-category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 dark:text-muted-foreground">Priority</span>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[200px] h-9 text-sm bg-white dark:bg-card" data-testid="select-priority">
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
          <span className="text-xs text-gray-500 dark:text-muted-foreground">Status</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px] h-9 text-sm bg-white dark:bg-card" data-testid="select-status">
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
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-600 dark:text-muted-foreground" data-testid="button-clear-filters">
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 bg-[#f9fafb] dark:bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-card py-4 text-center border border-gray-200 dark:border-border rounded">
            <div className="text-2xl font-semibold text-gray-900 dark:text-foreground" data-testid="metric-total-items">{filteredItems.length}</div>
            <div className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Total Items</div>
          </div>
          <div className="bg-white dark:bg-card py-4 text-center border border-gray-200 dark:border-border rounded">
            <div className="text-2xl font-semibold text-gray-900 dark:text-foreground" data-testid="metric-1">92%</div>
            <div className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Metric 1</div>
          </div>
          <div className="bg-white dark:bg-card py-4 text-center border border-gray-200 dark:border-border rounded">
            <div className="text-2xl font-semibold text-gray-900 dark:text-foreground" data-testid="metric-2">8</div>
            <div className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Metric 2</div>
          </div>
          <div className="bg-white dark:bg-card py-4 text-center border border-gray-200 dark:border-border rounded">
            <div className="text-2xl font-semibold text-gray-900 dark:text-foreground" data-testid="metric-3">1</div>
            <div className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Metric 3</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 dark:border-border rounded bg-white dark:bg-card">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-foreground">Metric by Category</h3>
            </div>
            <div className="px-4 pb-4">
              <div style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricByCategory} layout="vertical" barGap={1} barSize={compact ? 8 : 12}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => v} fontSize={fontSize} />
                    <YAxis type="category" dataKey="name" width={80} fontSize={fontSize} />
                    <Tooltip />
                    <Bar dataKey="q1" fill="#266C92" name="Q1" />
                    <Bar dataKey="q2" fill="#1e5a7a" name="Q2" />
                    <Bar dataKey="q3" fill="#5ba0c4" name="Q3" />
                    <Bar dataKey="q4" fill="#94c8de" name="Q4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#266C92" }} />
                  <span>Q1</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#1e5a7a" }} />
                  <span>Q2</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#5ba0c4" }} />
                  <span>Q3</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#94c8de" }} />
                  <span>Q4</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-border rounded bg-white dark:bg-card">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-foreground">Trend Chart</h3>
            </div>
            <div className="px-4 pb-4">
              <div style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={fontSize} />
                    <YAxis domain={[0, 100]} fontSize={fontSize} />
                    <Tooltip />
                    <Line type="monotone" dataKey="series1" stroke="#266C92" strokeWidth={2} dot={false} name="Series 1" />
                    <Line type="monotone" dataKey="series2" stroke="#5ba0c4" strokeWidth={2} dot={false} name="Series 2" />
                    <Line type="monotone" dataKey="series3" stroke="#94a3b8" strokeWidth={2} dot={false} name="Series 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#266C92" }} />
                  <span>Series 1</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#5ba0c4" }} />
                  <span>Series 2</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <span>Series 3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-border rounded bg-white dark:bg-card">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-foreground">Distribution</h3>
            </div>
            <div className="px-4 pb-4">
              <div style={{ height: chartHeight }} className="relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={compact ? 30 : 50}
                      outerRadius={compact ? 45 : 70}
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
                  <span className="text-2xl font-bold text-gray-900 dark:text-foreground">61%</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#266C92" }} />
                  <span>Complete</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-slate-400" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-slate-200" />
                  <span>Not Started</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-border rounded bg-white dark:bg-card">
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-foreground">Items Overview</h3>
              <div className="text-xs text-gray-500 dark:text-muted-foreground">
                <span className="font-medium">{filteredItems.length} items</span>
                <span className="mx-2">|</span>
                <span>{highPriorityCount} high priority</span>
              </div>
            </div>
          </div>
          <div className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-muted hover:bg-gray-50 dark:hover:bg-muted">
                  <TableHead className="font-medium text-gray-600 dark:text-muted-foreground">
                    <div className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-600 dark:text-muted-foreground">Category</TableHead>
                  <TableHead className="font-medium text-gray-600 dark:text-muted-foreground">Priority</TableHead>
                  <TableHead className="font-medium text-gray-600 dark:text-muted-foreground">Status</TableHead>
                  <TableHead className="font-medium text-gray-600 dark:text-muted-foreground">
                    <div className="flex items-center gap-1">
                      Metric
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-600 dark:text-muted-foreground">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-muted"
                    data-testid={`row-item-${item.id}`}
                  >
                    <TableCell>
                      <span className="font-medium text-[#3172E3]" data-testid={`link-item-${item.id}`}>
                        {item.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-foreground">{item.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          item.priority === "High"
                            ? "text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"
                            : "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
                        }`}
                      >
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs text-gray-600 dark:text-muted-foreground border-gray-300 dark:border-border bg-gray-100 dark:bg-muted"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-foreground">{item.metric}</TableCell>
                    <TableCell className="text-gray-600 dark:text-foreground">{item.owner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}