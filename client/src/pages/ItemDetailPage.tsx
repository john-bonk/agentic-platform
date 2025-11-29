/**
 * Item Detail Page
 * 
 * Example detail view with tabbed content sections.
 * Opens when clicking an item name from the list view.
 * 
 * Features:
 * - Tabbed navigation for different data sections
 * - Back navigation to list view
 * - Accordion sections for organizing related data
 * 
 * TODO: Connect to your actual data source and customize tabs
 */

import { useState } from "react";
import { useRoute, Link } from "wouter";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronDown,
  FileText, 
  Users, 
  Settings, 
  History,
  Link2,
  Building2,
  MapPin,
  Server
} from "lucide-react";
import { useTabStore } from "@/lib/tabStore";

interface DetailSection {
  id: string;
  title: string;
  count: number;
  items: { name: string; description: string; status?: string }[];
}

const exampleItems: Record<string, {
  id: string;
  name: string;
  status: string;
  owner: string;
  description: string;
  createdAt: string;
  sections: DetailSection[];
}> = {
  "1": {
    id: "1",
    name: "Website Redesign",
    status: "Active",
    owner: "Alice Johnson",
    description: "Complete overhaul of the company website with modern design and improved UX.",
    createdAt: "2024-01-15",
    sections: [
      {
        id: "team",
        title: "Team Members",
        count: 4,
        items: [
          { name: "Alice Johnson", description: "Project Lead", status: "Active" },
          { name: "Bob Smith", description: "Frontend Developer", status: "Active" },
          { name: "Carol Davis", description: "Designer", status: "Active" },
          { name: "David Wilson", description: "Backend Developer", status: "Active" },
        ]
      },
      {
        id: "dependencies",
        title: "Dependencies",
        count: 3,
        items: [
          { name: "Design System", description: "UI component library", status: "Complete" },
          { name: "API Gateway", description: "Backend integration", status: "In Progress" },
          { name: "CDN Setup", description: "Content delivery network", status: "Pending" },
        ]
      },
      {
        id: "locations",
        title: "Locations",
        count: 2,
        items: [
          { name: "New York Office", description: "Primary development location" },
          { name: "London Office", description: "Secondary support" },
        ]
      }
    ]
  },
  "2": {
    id: "2",
    name: "Mobile App Development",
    status: "Active",
    owner: "Bob Smith",
    description: "Native mobile application for iOS and Android platforms.",
    createdAt: "2024-02-01",
    sections: [
      {
        id: "team",
        title: "Team Members",
        count: 3,
        items: [
          { name: "Bob Smith", description: "Tech Lead", status: "Active" },
          { name: "Eve Martinez", description: "iOS Developer", status: "Active" },
          { name: "Frank Brown", description: "Android Developer", status: "Active" },
        ]
      },
      {
        id: "dependencies",
        title: "Dependencies",
        count: 2,
        items: [
          { name: "Auth Service", description: "User authentication", status: "Complete" },
          { name: "Push Notifications", description: "Firebase integration", status: "In Progress" },
        ]
      },
      {
        id: "locations",
        title: "Locations",
        count: 1,
        items: [
          { name: "San Francisco Office", description: "Main development hub" },
        ]
      }
    ]
  },
  "3": {
    id: "3",
    name: "API Integration",
    status: "Completed",
    owner: "Carol Davis",
    description: "Integration with third-party APIs for enhanced functionality.",
    createdAt: "2023-12-01",
    sections: [
      {
        id: "team",
        title: "Team Members",
        count: 2,
        items: [
          { name: "Carol Davis", description: "Integration Specialist", status: "Active" },
          { name: "David Wilson", description: "Backend Developer", status: "Active" },
        ]
      },
      {
        id: "dependencies",
        title: "Dependencies",
        count: 4,
        items: [
          { name: "Payment Gateway", description: "Stripe integration", status: "Complete" },
          { name: "Email Service", description: "SendGrid setup", status: "Complete" },
          { name: "Analytics", description: "Mixpanel tracking", status: "Complete" },
          { name: "CRM Sync", description: "Salesforce connector", status: "Complete" },
        ]
      },
      {
        id: "locations",
        title: "Locations",
        count: 1,
        items: [
          { name: "Remote", description: "Distributed team" },
        ]
      }
    ]
  },
  "4": {
    id: "4",
    name: "Database Migration",
    status: "On Hold",
    owner: "David Wilson",
    description: "Migrate legacy database to modern cloud infrastructure.",
    createdAt: "2024-01-20",
    sections: [
      {
        id: "team",
        title: "Team Members",
        count: 2,
        items: [
          { name: "David Wilson", description: "DBA Lead", status: "Active" },
          { name: "Alice Johnson", description: "Project Manager", status: "Active" },
        ]
      },
      {
        id: "dependencies",
        title: "Dependencies",
        count: 2,
        items: [
          { name: "Cloud Setup", description: "AWS infrastructure", status: "Complete" },
          { name: "Data Backup", description: "Legacy data export", status: "Pending" },
        ]
      },
      {
        id: "locations",
        title: "Locations",
        count: 2,
        items: [
          { name: "AWS US-East", description: "Primary region" },
          { name: "AWS EU-West", description: "Disaster recovery" },
        ]
      }
    ]
  },
  "5": {
    id: "5",
    name: "Security Audit",
    status: "Draft",
    owner: "Eve Martinez",
    description: "Comprehensive security assessment and vulnerability testing.",
    createdAt: "2024-02-10",
    sections: [
      {
        id: "team",
        title: "Team Members",
        count: 1,
        items: [
          { name: "Eve Martinez", description: "Security Analyst", status: "Active" },
        ]
      },
      {
        id: "dependencies",
        title: "Dependencies",
        count: 1,
        items: [
          { name: "Penetration Testing Tools", description: "Security toolkit", status: "Pending" },
        ]
      },
      {
        id: "locations",
        title: "Locations",
        count: 1,
        items: [
          { name: "Secure Lab", description: "Isolated testing environment" },
        ]
      }
    ]
  },
  "6": {
    id: "6",
    name: "Performance Optimization",
    status: "Active",
    owner: "Frank Brown",
    description: "Improve application performance and reduce load times.",
    createdAt: "2024-01-25",
    sections: [
      {
        id: "team",
        title: "Team Members",
        count: 2,
        items: [
          { name: "Frank Brown", description: "Performance Engineer", status: "Active" },
          { name: "Bob Smith", description: "Frontend Developer", status: "Active" },
        ]
      },
      {
        id: "dependencies",
        title: "Dependencies",
        count: 3,
        items: [
          { name: "CDN Configuration", description: "Edge caching setup", status: "Complete" },
          { name: "Database Indexing", description: "Query optimization", status: "In Progress" },
          { name: "Code Splitting", description: "Bundle optimization", status: "In Progress" },
        ]
      },
      {
        id: "locations",
        title: "Locations",
        count: 1,
        items: [
          { name: "Chicago Office", description: "Performance lab" },
        ]
      }
    ]
  }
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Completed: "bg-blue-100 text-blue-700 border-blue-200",
    Complete: "bg-blue-100 text-blue-700 border-blue-200",
    "On Hold": "bg-amber-100 text-amber-700 border-amber-200",
    "In Progress": "bg-purple-100 text-purple-700 border-purple-200",
    Draft: "bg-gray-100 text-gray-700 border-gray-200",
    Pending: "bg-gray-100 text-gray-700 border-gray-200",
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${styles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {status}
    </Badge>
  );
};

function AccordionSection({ section, isExpanded, onToggle }: { 
  section: DetailSection; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const getIcon = (id: string) => {
    switch (id) {
      case "team": return <Users className="w-4 h-4 text-gray-500" />;
      case "dependencies": return <Link2 className="w-4 h-4 text-gray-500" />;
      case "locations": return <MapPin className="w-4 h-4 text-gray-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full flex items-center h-11 px-4 ${
          isExpanded ? "bg-teal-50 border-l-2 border-l-teal-600" : "bg-white"
        }`}
        data-testid={`accordion-${section.id}`}
      >
        <ChevronDown
          className={`w-4 h-4 text-gray-500 mr-3 transition-transform ${
            !isExpanded ? "-rotate-90" : ""
          }`}
        />
        {getIcon(section.id)}
        <span className="ml-2 text-sm font-medium text-gray-900">
          {section.title}
        </span>
        <Badge variant="outline" className="ml-2 text-xs bg-gray-100 text-gray-600 border-gray-200">
          {section.count}
        </Badge>
      </button>
      
      {isExpanded && (
        <div className="bg-white border-t border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Description</th>
                {section.items[0]?.status && (
                  <th className="px-4 py-2 font-medium">Status</th>
                )}
              </tr>
            </thead>
            <tbody>
              {section.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 text-sm">
                    <Link 
                      href="#" 
                      className="text-teal-600 hover:underline"
                      data-testid={`link-${section.id}-${idx}`}
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">
                    {item.description}
                  </td>
                  {item.status && (
                    <td className="px-4 py-2.5">
                      {getStatusBadge(item.status)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ItemDetailPage() {
  const [, params] = useRoute("/items/:id");
  const itemId = params?.id || "1";
  const item = exampleItems[itemId] || exampleItems["1"];
  
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    team: true,
    dependencies: false,
    locations: false,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppLayout 
      activeTab={{ 
        id: item.id, 
        name: item.name, 
        path: `/items/${item.id}` 
      }}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-500"
                data-testid="button-back"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-teal-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{item.name}</h1>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
            <div className="ml-4">
              {getStatusBadge(item.status)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-edit">
              Edit
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              data-testid="button-submit"
            >
              Submit for Review
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-200 bg-white">
            <TabsList className="h-auto p-0 bg-transparent border-0 px-8">
              <TabsTrigger 
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3"
                data-testid="tab-overview"
              >
                <FileText className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="dependencies"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3"
                data-testid="tab-dependencies"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Dependencies
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3"
                data-testid="tab-team"
              >
                <Users className="w-4 h-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3"
                data-testid="tab-history"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3"
                data-testid="tab-settings"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="overview" className="p-8 m-0">
              <div className="max-w-4xl space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">Owner</span>
                        <span className="text-sm text-gray-900">{item.owner}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                        <span className="text-sm text-gray-900">{item.status}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">Created</span>
                        <span className="text-sm text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">ID</span>
                        <span className="text-sm text-gray-900">PRJ-{item.id.padStart(4, '0')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dependencies" className="p-8 m-0">
              <div className="max-w-4xl space-y-4">
                {item.sections.map((section) => (
                  <AccordionSection
                    key={section.id}
                    section={section}
                    isExpanded={expandedSections[section.id] || false}
                    onToggle={() => toggleSection(section.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="team" className="p-8 m-0">
              <div className="max-w-4xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {item.sections.find(s => s.id === "team")?.items.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.description}</p>
                            </div>
                          </div>
                          {member.status && getStatusBadge(member.status)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-8 m-0">
              <div className="max-w-4xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Activity History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm font-medium">No recent activity</p>
                      <p className="text-xs mt-1">Activity will appear here as changes are made</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-8 m-0">
              <div className="max-w-4xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm font-medium">Configure item settings</p>
                      <p className="text-xs mt-1">TODO: Add your settings options here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
