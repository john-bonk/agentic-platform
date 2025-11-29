/**
 * Dashboard Page
 * 
 * Example dashboard with metrics cards and charts placeholder.
 * Demonstrates card layouts and stat displays.
 * 
 * TODO: Replace placeholder data with real metrics
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Users, FileText, CheckCircle, Clock } from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12%",
    trend: "up",
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Active Projects",
    value: "48",
    change: "+5%",
    trend: "up",
    icon: FileText,
    description: "vs last month",
  },
  {
    title: "Completed Tasks",
    value: "1,234",
    change: "+23%",
    trend: "up",
    icon: CheckCircle,
    description: "vs last month",
  },
  {
    title: "Pending Reviews",
    value: "18",
    change: "-8%",
    trend: "down",
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
  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your workspace metrics and activity"
        />
        
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card 
                key={stat.title} 
                className="border border-gray-200"
                data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900" data-testid={`stat-value-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
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
            <Card className="lg:col-span-2 border border-gray-200">
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Your performance metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-center text-gray-500">
                    <p className="text-sm font-medium">Chart Placeholder</p>
                    <p className="text-xs mt-1">
                      TODO: Add your preferred charting library
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
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
        </div>
      </div>
    </AppLayout>
  );
}
