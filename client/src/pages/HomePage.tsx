/**
 * Home Page
 * 
 * The landing page of the application.
 * Displays a welcome message and quick navigation links.
 * 
 * TODO: Customize this page with your app's branding and content
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Layers, FileText, Settings, Zap } from "lucide-react";

const quickLinks = [
  {
    title: "Dashboard",
    description: "View your analytics and metrics",
    icon: Layers,
    path: "/dashboard",
  },
  {
    title: "Projects",
    description: "Manage your projects and tasks",
    icon: FileText,
    path: "/projects",
  },
  {
    title: "Demo Page",
    description: "See example components in action",
    icon: Zap,
    path: "/demo",
  },
  {
    title: "Settings",
    description: "Configure your preferences",
    icon: Settings,
    path: "/settings",
  },
];

export function HomePage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto">
        <PageHeader 
          title="Welcome to the Starter Template" 
          description="A clean, well-structured React application template ready for customization"
        />
        
        <div className="flex-1 p-8 bg-[#f9fafb]">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Quick Links
              </h2>
              <p className="text-sm text-gray-500">
                Get started by exploring these example pages
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {quickLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <Card 
                    className="hover-elevate cursor-pointer border border-gray-200 h-full"
                    data-testid={`link-card-${link.path.replace("/", "")}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 rounded-md">
                          <link.icon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{link.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {link.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-teal-600 font-medium">
                        Go to {link.title}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Learn how to customize this template for your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      1
                    </div>
                    <div>
                      <strong className="text-gray-900">Edit navigation config</strong>
                      <p>Modify <code className="bg-gray-100 px-1 rounded">src/config/navigation.ts</code> to customize menu items</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      2
                    </div>
                    <div>
                      <strong className="text-gray-900">Add new pages</strong>
                      <p>Create components in <code className="bg-gray-100 px-1 rounded">src/pages/</code> and register routes in <code className="bg-gray-100 px-1 rounded">App.tsx</code></p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      3
                    </div>
                    <div>
                      <strong className="text-gray-900">Customize styling</strong>
                      <p>Update colors and themes in <code className="bg-gray-100 px-1 rounded">src/index.css</code></p>
                    </div>
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
