/**
 * Item Detail Page
 * 
 * Template detail view with tabbed sections (Tab 1-5).
 * Features:
 * - Title and action buttons header
 * - Quick info bar with key metrics
 * - Tab navigation (Tab 1-5)
 * - Two-column details section with labels and values
 * 
 * To customize:
 * 1. Update the DetailItem interface with your data fields
 * 2. Replace detailItems with your actual data source
 * 3. Modify tab names and content as needed
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
import { useTabStore } from "@/lib/tabStore";

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
  "1-1": {
    id: "1-1",
    name: "Item 1",
    priority: "High",
    targetDate: "Q2 2024",
    estimatedTime: "3 months",
    owner: "Owner A",
    lastUpdated: "June 20, 2024",
    status: "Approved",
    description: "This is the description for Item 1. It contains detailed information about this particular item, including its purpose, scope, and any relevant background context.",
    categories: ["Category A", "Category B"],
    relatedItems: ["Related Item 1", "Related Item 2", "Related Item 3"],
    tags: ["Tag 1", "Tag 2", "Tag 3", "Tag 4"],
    attachments: ["Attachment 1"],
  },
  "1-2": {
    id: "1-2",
    name: "Item 2",
    priority: "Low",
    targetDate: "Q3 2024",
    estimatedTime: "6 months",
    owner: "Owner A",
    lastUpdated: "May 15, 2024",
    status: "In Review",
    description: "This is the description for Item 2. It provides comprehensive details about this item's requirements and specifications.",
    categories: ["Category C", "Category D"],
    relatedItems: ["Related Item 4", "Related Item 5"],
    tags: ["Tag 5", "Tag 6", "Tag 7"],
    attachments: ["Attachment 2", "Attachment 3"],
  },
  "1-3": {
    id: "1-3",
    name: "Item 3",
    priority: "Medium",
    targetDate: "Q1 2024",
    estimatedTime: "2 months",
    owner: "Owner A",
    lastUpdated: "April 10, 2024",
    status: "Completed",
    description: "This is the description for Item 3. It outlines the key objectives and deliverables for this item.",
    categories: ["Category E", "Category F"],
    relatedItems: ["Related Item 6", "Related Item 7"],
    tags: ["Tag 8", "Tag 9", "Tag 10"],
    attachments: ["Attachment 4"],
  },
  "2-1": {
    id: "2-1",
    name: "Item 4",
    priority: "Low",
    targetDate: "Q4 2024",
    estimatedTime: "4 months",
    owner: "Owner B",
    lastUpdated: "March 5, 2024",
    status: "Draft",
    description: "This is the description for Item 4. It details the scope and expected outcomes.",
    categories: ["Category G", "Category H"],
    relatedItems: ["Related Item 8", "Related Item 9"],
    tags: ["Tag 11", "Tag 12", "Tag 13"],
    attachments: ["Attachment 5"],
  },
  "2-2": {
    id: "2-2",
    name: "Item 5",
    priority: "Low",
    targetDate: "Q2 2024",
    estimatedTime: "1 month",
    owner: "Owner B",
    lastUpdated: "June 1, 2024",
    status: "Approved",
    description: "This is the description for Item 5. It provides an overview of the item's objectives.",
    categories: ["Category I", "Category J"],
    relatedItems: ["Related Item 10", "Related Item 11"],
    tags: ["Tag 14", "Tag 15", "Tag 16"],
    attachments: ["Attachment 6"],
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
  const itemId = params?.id || "1-1";
  const { openTabs } = useTabStore();
  
  const tabInfo = openTabs.find(t => t.id === itemId);
  const staticItem = detailItems[itemId] || detailItems["1-1"];
  
  const item = {
    ...staticItem,
    id: itemId,
    name: tabInfo?.name || staticItem.name,
  };
  
  const [activeTab, setActiveTab] = useState("tab1");

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
            <div className="flex items-center justify-between px-8 py-5 pl-[0px] pr-[0px]">
              <h1 className="text-xl font-semibold text-gray-900">{item.name}</h1>
              <div className="flex items-center gap-2">
                <Button 
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
              <TabsList>
                <TabsTrigger value="tab1" data-testid="tab-1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2" data-testid="tab-2">Tab 2</TabsTrigger>
                <TabsTrigger value="tab3" data-testid="tab-3">Tab 3</TabsTrigger>
                <TabsTrigger value="tab4" data-testid="tab-4">Tab 4</TabsTrigger>
                <TabsTrigger value="tab5" data-testid="tab-5">Tab 5</TabsTrigger>
              </TabsList>

              <TabsContent value="tab1" className="m-0">
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

              <TabsContent value="tab2" className="p-8 m-0">
                <div className="text-center py-16 text-gray-500">
                  <p className="text-sm font-medium">Tab 2 Content</p>
                  <p className="text-xs mt-1">Content for Tab 2 will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="tab3" className="p-8 m-0">
                <div className="text-center py-16 text-gray-500">
                  <p className="text-sm font-medium">Tab 3 Content</p>
                  <p className="text-xs mt-1">Content for Tab 3 will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="tab4" className="p-8 m-0">
                <div className="text-center py-16 text-gray-500">
                  <p className="text-sm font-medium">Tab 4 Content</p>
                  <p className="text-xs mt-1">Content for Tab 4 will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="tab5" className="p-8 m-0">
                <div className="text-center py-16 text-gray-500">
                  <p className="text-sm font-medium">Tab 5 Content</p>
                  <p className="text-xs mt-1">Content for Tab 5 will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
