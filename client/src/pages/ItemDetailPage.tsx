/**
 * Item Detail Page
 * 
 * Detail view with Figma-style layout pattern:
 * - Title and action buttons header
 * - Quick info bar with key metrics
 * - Tab navigation
 * - Two-column Details section
 */

import { useState } from "react";
import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronDown,
  AlertTriangle,
  MoreHorizontal,
  Info
} from "lucide-react";

interface DetailItem {
  id: string;
  name: string;
  priority: "Low" | "Medium" | "High";
  targetDate: string;
  estimatedTime: string;
  owner: string;
  lastUpdated: string;
  status: string;
  description: string;
  categories: string[];
  relatedItems: string[];
  tags: string[];
  attachments: string[];
}

const detailItems: Record<string, DetailItem> = {
  "1": {
    id: "1",
    name: "Website Redesign",
    priority: "High",
    targetDate: "Q2 2024",
    estimatedTime: "3 months",
    owner: "Alice Johnson",
    lastUpdated: "June 20, 2024",
    status: "Approved",
    description: "Complete overhaul of the company website with modern design and improved UX. This project includes updating the visual identity, improving navigation, optimizing for mobile devices, and implementing new features based on user feedback. The redesign will focus on conversion optimization and accessibility compliance.",
    categories: ["Marketing", "Design"],
    relatedItems: ["Brand Guidelines", "User Research", "Content Strategy"],
    tags: ["Frontend", "UX", "Responsive Design", "Accessibility"],
    attachments: ["Design Mockups"],
  },
  "2": {
    id: "2",
    name: "Mobile App Development",
    priority: "High",
    targetDate: "Q3 2024",
    estimatedTime: "6 months",
    owner: "Bob Smith",
    lastUpdated: "May 15, 2024",
    status: "In Review",
    description: "Native mobile application for iOS and Android platforms. This includes user authentication, push notifications, offline mode, and integration with existing backend services.",
    categories: ["Engineering", "Mobile"],
    relatedItems: ["API Documentation", "Security Audit"],
    tags: ["iOS", "Android", "React Native"],
    attachments: ["Technical Specs", "Wireframes"],
  },
  "3": {
    id: "3",
    name: "API Integration",
    priority: "Medium",
    targetDate: "Q1 2024",
    estimatedTime: "2 months",
    owner: "Carol Davis",
    lastUpdated: "April 10, 2024",
    status: "Completed",
    description: "Integration with third-party APIs for enhanced functionality including payment processing, analytics, and CRM synchronization.",
    categories: ["Engineering", "Integration"],
    relatedItems: ["Payment Gateway", "Analytics Dashboard"],
    tags: ["API", "Backend", "Integration"],
    attachments: ["API Docs"],
  },
  "4": {
    id: "4",
    name: "Database Migration",
    priority: "Low",
    targetDate: "Q4 2024",
    estimatedTime: "4 months",
    owner: "David Wilson",
    lastUpdated: "March 5, 2024",
    status: "Draft",
    description: "Migrate legacy database to modern cloud infrastructure with improved performance and scalability.",
    categories: ["Infrastructure", "Database"],
    relatedItems: ["Cloud Setup", "Data Backup"],
    tags: ["PostgreSQL", "AWS", "Migration"],
    attachments: ["Migration Plan"],
  },
  "5": {
    id: "5",
    name: "Security Audit",
    priority: "High",
    targetDate: "Q2 2024",
    estimatedTime: "1 month",
    owner: "Eve Martinez",
    lastUpdated: "June 1, 2024",
    status: "Approved",
    description: "Comprehensive security assessment and vulnerability testing across all systems and applications.",
    categories: ["Security", "Compliance"],
    relatedItems: ["Penetration Test", "Compliance Report"],
    tags: ["Security", "Audit", "Compliance"],
    attachments: ["Security Checklist"],
  },
};

const getPriorityBadge = (priority: string) => {
  const styles: Record<string, string> = {
    Low: "bg-green-100 text-green-700 border-green-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    High: "bg-red-100 text-red-700 border-red-200",
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${styles[priority] || "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {priority}
    </Badge>
  );
};

export function ItemDetailPage() {
  const [, params] = useRoute("/items/:id");
  const itemId = params?.id || "1";
  const item = detailItems[itemId] || detailItems["1"];
  
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AppLayout 
      activeTab={{ 
        id: item.id, 
        name: item.name, 
        path: `/items/${item.id}` 
      }}
    >
      <div className="flex flex-col h-full overflow-auto bg-[#ffffff]">
        <div className="p-6 pt-[0px] pb-[0px]">
          <div className="bg-white rounded-md">
            <div className="flex items-center justify-between px-8 py-5">
              <h1 className="text-xl font-semibold text-gray-900">{item.name}</h1>
              <div className="flex items-center gap-2">
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  data-testid="button-primary-action"
                >
                  Submit for Review
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  data-testid="button-status"
                >
                  {item.status}
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-alert">
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-more">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200 px-8">
                <TabsList className="h-auto p-0 bg-transparent border-0">
                  <TabsTrigger 
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                    data-testid="tab-overview"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="details"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                    data-testid="tab-details"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dependencies"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                    data-testid="tab-dependencies"
                  >
                    Dependencies
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                    data-testid="tab-activity"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="attachments"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                    data-testid="tab-attachments"
                  >
                    Attachments
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="m-0">
                <div className="px-8 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-12 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Priority</span>
                      <div className="mt-1">
                        {getPriorityBadge(item.priority)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Target Date</span>
                      <span className="text-sm text-gray-900 mt-1">{item.targetDate}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Estimated Time</span>
                      <span className="text-sm text-gray-400 mt-1">{item.estimatedTime}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Owner</span>
                      <span className="text-sm text-gray-900 mt-1">{item.owner}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Last Updated</span>
                      <span className="text-sm text-gray-900 mt-1">{item.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-6">Details</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Name</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-900">{item.name}</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Description</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-900 leading-relaxed">{item.description}</p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Owner</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-900">{item.owner}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Categories</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.categories.map((category, idx) => (
                            <span key={idx}>
                              <a 
                                href="#" 
                                className="text-sm text-blue-600 hover:underline"
                                data-testid={`link-category-${idx}`}
                              >
                                {category}
                              </a>
                              {idx < item.categories.length - 1 && <span className="text-gray-400">, </span>}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Related Items</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.relatedItems.map((relatedItem, idx) => (
                            <span key={idx}>
                              <a 
                                href="#" 
                                className="text-sm text-blue-600 hover:underline"
                                data-testid={`link-related-${idx}`}
                              >
                                {relatedItem}
                              </a>
                              {idx < item.relatedItems.length - 1 && <span className="text-gray-400">, </span>}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Tags</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, idx) => (
                            <span key={idx}>
                              <a 
                                href="#" 
                                className="text-sm text-blue-600 hover:underline"
                                data-testid={`link-tag-${idx}`}
                              >
                                {tag}
                              </a>
                              {idx < item.tags.length - 1 && <span className="text-gray-400">, </span>}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Attachments</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.attachments.map((attachment, idx) => (
                            <a 
                              key={idx} 
                              href="#" 
                              className="text-sm text-blue-600 hover:underline"
                              data-testid={`link-attachment-${idx}`}
                            >
                              {attachment}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="p-8 m-0">
                <div className="text-center py-16 text-gray-500">
                  <p className="text-sm font-medium">Additional Details</p>
                  <p className="text-xs mt-1">More details will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="dependencies" className="p-8 m-0">
                <div className="text-center py-16 text-gray-500">
                  <p className="text-sm font-medium">Dependencies</p>
                  <p className="text-xs mt-1">Dependencies will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="p-8 m-0">
                <div className="text-center py-16 text-gray-500">
                  <p className="text-sm font-medium">Activity Log</p>
                  <p className="text-xs mt-1">Activity history will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="p-8 m-0">
                <div className="text-center py-16 text-gray-500">
                  <p className="text-sm font-medium">Attachments</p>
                  <p className="text-xs mt-1">File attachments will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
