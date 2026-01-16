import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Building2, 
  ArrowUpRight, 
  Bell, 
  Activity,
  BarChart3 
} from "lucide-react";

const metrics = [
  {
    label: "Enterprise Risk Score",
    value: "87%",
    change: "+5.2%",
    trend: "up",
    color: "teal",
    bars: [26.5, 27.6, 28.7, 30.2, 31.3, 32],
  },
  {
    label: "Control Effectiveness",
    value: "94%",
    change: "+2.8%",
    trend: "up",
    color: "green",
    bars: [29.9, 30.3, 31.0, 31.3, 31.7, 32],
  },
  {
    label: "Total Workspaces",
    value: "12",
    change: "+1.5%",
    trend: "up",
    color: "purple",
    bars: [28, 29, 30, 30.5, 31, 32],
  },
  {
    label: "Active Users",
    value: "248",
    change: "+8.4%",
    trend: "up",
    color: "amber",
    bars: [24, 26, 28, 29, 30, 32],
  },
];

const colorVariants: Record<string, { bg: string; border: string; icon: string; bar: string; barActive: string }> = {
  teal: {
    bg: "bg-[rgba(38,108,146,0.08)]",
    border: "border-[rgba(38,108,146,0.13)]",
    icon: "bg-[rgba(38,108,146,0.13)] text-[#266c92]",
    bar: "bg-[rgba(38,108,146,0.38)]",
    barActive: "bg-[#266c92]",
  },
  green: {
    bg: "bg-[rgba(54,132,74,0.08)]",
    border: "border-[rgba(54,132,74,0.13)]",
    icon: "bg-[rgba(54,132,74,0.13)] text-[#36844a]",
    bar: "bg-[rgba(54,132,74,0.38)]",
    barActive: "bg-[#36844a]",
  },
  purple: {
    bg: "bg-[rgba(105,49,227,0.08)]",
    border: "border-[rgba(105,49,227,0.13)]",
    icon: "bg-[rgba(105,49,227,0.13)] text-[#6931e3]",
    bar: "bg-[rgba(105,49,227,0.38)]",
    barActive: "bg-[#6931e3]",
  },
  amber: {
    bg: "bg-[rgba(217,119,6,0.08)]",
    border: "border-[rgba(217,119,6,0.13)]",
    icon: "bg-[rgba(217,119,6,0.13)] text-[#d97706]",
    bar: "bg-[rgba(217,119,6,0.38)]",
    barActive: "bg-[#d97706]",
  },
};

const iconMap: Record<string, React.ElementType> = {
  teal: Shield,
  green: TrendingUp,
  purple: Building2,
  amber: Users,
};

const recentActivity = [
  { user: "John Smith", action: "Updated IT Security workspace", time: "5 minutes ago", type: "workspace" },
  { user: "Sarah Johnson", action: "Modified user permissions", time: "12 minutes ago", type: "permission" },
  { user: "Mike Chen", action: "Created new workflow template", time: "1 hour ago", type: "workflow" },
  { user: "Emily Davis", action: "Exported Q4 compliance report", time: "2 hours ago", type: "report" },
  { user: "David Wilson", action: "Added 3 new users to Enterprise Risk", time: "3 hours ago", type: "user" },
];

const systemAlerts = [
  { title: "License Renewal", message: "Enterprise license expires in 30 days", severity: "warning" },
  { title: "System Update", message: "Platform update v3.2.1 available", severity: "info" },
  { title: "Storage Usage", message: "Storage at 78% capacity", severity: "warning" },
];

export function AdminOverviewPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader 
          title="MegaCorp Admin" 
          description="Platform administration and oversight"
        />
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="border-b w-full justify-start rounded-none h-12 bg-transparent p-0">
            <TabsTrigger 
              value="dashboard" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6"
              data-testid="tab-dashboard"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6"
              data-testid="tab-notifications"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <Badge variant="secondary" className="ml-2">47</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6"
              data-testid="tab-activity"
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6"
              data-testid="tab-analytics"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {metrics.map((metric) => {
                const colors = colorVariants[metric.color];
                const Icon = iconMap[metric.color];
                return (
                  <Card 
                    key={metric.label} 
                    className={`${colors.border} border overflow-hidden`}
                    data-testid={`metric-card-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div 
                      className={`absolute inset-0 opacity-10`}
                      style={{ 
                        background: `linear-gradient(154deg, transparent 0%, ${metric.color === 'teal' ? 'rgba(38,108,146,1)' : metric.color === 'green' ? 'rgba(54,132,74,1)' : metric.color === 'purple' ? 'rgba(105,49,227,1)' : 'rgba(217,119,6,1)'} 100%)`
                      }}
                    />
                    <CardContent className="p-5 relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`${colors.icon} p-2.5 rounded`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge 
                          className="bg-green-100 text-green-700 border-0"
                          data-testid={`metric-change-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          {metric.change}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                      <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                      <div className="flex gap-1 items-end h-8 mt-4">
                        {metric.bars.map((height, i) => (
                          <div 
                            key={i}
                            className={`flex-1 rounded-sm ${i === metric.bars.length - 1 ? colors.barActive : colors.bar}`}
                            style={{ height: `${height}px` }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card data-testid="card-recent-activity">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Recent Activity</h3>
                    <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.user}</p>
                          <p className="text-sm text-muted-foreground truncate">{item.action}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="card-system-alerts">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">System Alerts</h3>
                    <Button variant="ghost" size="sm" data-testid="button-manage-alerts">
                      Manage
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {systemAlerts.map((alert, i) => (
                      <div 
                        key={i} 
                        className={`p-4 rounded-md ${alert.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-blue-50 dark:bg-blue-950/20'}`}
                      >
                        <div className="flex items-start gap-3">
                          <Bell className={`w-4 h-4 mt-0.5 ${alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
                          <div>
                            <p className="font-medium text-sm">{alert.title}</p>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card data-testid="card-notifications-placeholder">
              <CardContent className="p-6 text-center">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Notification Center</h3>
                <p className="text-muted-foreground">View and manage all system notifications</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <Card data-testid="card-activity-placeholder">
              <CardContent className="p-6 text-center">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Activity Log</h3>
                <p className="text-muted-foreground">Complete audit trail of all platform activities</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Card data-testid="card-analytics-placeholder">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Usage Analytics</h3>
                <p className="text-muted-foreground">Detailed platform usage metrics and insights</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default AdminOverviewPage;
