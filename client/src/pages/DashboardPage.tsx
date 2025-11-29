/**
 * Dashboard Page
 * 
 * Example dashboard with metrics cards, filter options, and charts.
 * Demonstrates card layouts with proper border radius and background colors.
 * 
 * Features:
 * - Filter dropdown options
 * - Metric cards with consistent styling
 * - Chart placeholder
 * - Activity feed
 * 
 * TODO: Replace placeholder data with real metrics
 */

import { useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  Filter,
  Calendar,
  RefreshCw
} from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12%",
    trend: "up" as const,
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Active Projects",
    value: "48",
    change: "+5%",
    trend: "up" as const,
    icon: FileText,
    description: "vs last month",
  },
  {
    title: "Completed Tasks",
    value: "1,234",
    change: "+23%",
    trend: "up" as const,
    icon: CheckCircle,
    description: "vs last month",
  },
  {
    title: "Pending Reviews",
    value: "18",
    change: "-8%",
    trend: "down" as const,
    icon: Clock,
    description: "vs last month",
  },
];

const recentActivity = [
  { id: 1, action: "Created new project", user: "Alice Johnson", time: "2 minutes ago" },
  { id: 2, action: "Completed task review", user: "Bob Smith", time: "15 minutes ago" },
  { id: 3, action: "Updated documentation", user: "Carol Davis", time: "1 hour ago" },
  { id: 4, action: "Added team member", user: "David Wilson", time: "2 hours ago" },
  { id: 5, action: "Published report", user: "Eve Martinez", time: "3 hours ago" },
];

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [category, setCategory] = useState("all");

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your workspace metrics and activity"
          actions={
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          }
        />
        
        <div className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-200 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Filters:</span>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger 
                className="w-[140px] h-9 text-sm"
                data-testid="select-time-range"
              >
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger 
                className="w-[140px] h-9 text-sm"
                data-testid="select-category"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="users">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-gray-600"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card 
                key={stat.title} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm"
                data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                  <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-2xl font-bold text-gray-900" 
                    data-testid={`stat-value-${stat.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1.5 py-0 ${
                        stat.trend === "up" 
                          ? "text-green-600 border-green-200 bg-green-50" 
                          : "text-red-600 border-red-200 bg-red-50"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      )}
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-gray-500">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Analytics Overview</CardTitle>
                    <CardDescription>
                      Your performance metrics over time
                    </CardDescription>
                  </div>
                  <Select defaultValue="projects">
                    <SelectTrigger className="w-[120px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="projects">Projects</SelectItem>
                      <SelectItem value="tasks">Tasks</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md bg-gray-50">
                  <div className="text-center text-gray-500">
                    <p className="text-sm font-medium">Chart Placeholder</p>
                    <p className="text-xs mt-1">
                      TODO: Add your preferred charting library
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-500"
                  >
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Latest actions in your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex flex-col gap-1 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                      data-testid={`activity-item-${activity.id}`}
                    >
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{activity.user}</span>
                        <span>-</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: "78%" }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">78%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">On-Time Delivery</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "92%" }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Team Utilization</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "65%" }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">65%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>
                  Tasks due in the next 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-sm text-gray-900">Website launch review</span>
                    </div>
                    <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50">
                      Tomorrow
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-sm text-gray-900">API documentation update</span>
                    </div>
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                      3 days
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-900">Team retrospective</span>
                    </div>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                      5 days
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
