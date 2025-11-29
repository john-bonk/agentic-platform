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
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const quickLinks = [
  {
    title: "Dashboard",
    description: "View your analytics and metrics",
    path: "/dashboard",
  },
  {
    title: "List Page",
    description: "Browse and manage items",
    path: "/projects",
  },
  {
    title: "Demo Page",
    description: "See example components in action",
    path: "/demo",
  },
  {
    title: "Settings",
    description: "Configure your preferences",
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div 
                    className="bg-white py-4 px-4 text-center border border-gray-200 rounded cursor-pointer hover-elevate h-full"
                    data-testid={`link-card-${link.path.replace("/", "")}`}
                  >
                    <div className="text-base font-semibold text-gray-900">{link.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{link.description}</div>
                    <div className="flex items-center justify-center text-sm text-teal-600 font-medium mt-3">
                      Go to {link.title}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
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
