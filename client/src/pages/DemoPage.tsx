/**
 * Demo Page
 * 
 * Showcases core UI components and patterns used in this template.
 * Use this as a reference for building your own pages.
 * 
 * TODO: Add your own component examples
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Check, 
  AlertCircle, 
  Info,
  Loader2
} from "lucide-react";
import { useState } from "react";

export function DemoPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto">
        <PageHeader 
          title="Component Demo" 
          description="Examples of UI components and patterns available in this template"
        />
        
        <div className="flex-1 p-8">
          <Tabs defaultValue="buttons" className="max-w-4xl">
            <TabsList className="mb-6" data-testid="demo-tabs">
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="toasts">Toasts</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="buttons">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                  <CardDescription>
                    Different button styles for various use cases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Variants</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button data-testid="button-default">Default</Button>
                      <Button variant="secondary" data-testid="button-secondary">Secondary</Button>
                      <Button variant="outline" data-testid="button-outline">Outline</Button>
                      <Button variant="ghost" data-testid="button-ghost">Ghost</Button>
                      <Button variant="destructive" data-testid="button-destructive">Destructive</Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Sizes</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" data-testid="button-sm">Small</Button>
                      <Button data-testid="button-md">Default</Button>
                      <Button size="lg" data-testid="button-lg">Large</Button>
                      <Button size="icon" data-testid="button-icon">
                        <Bell className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">States</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button disabled data-testid="button-disabled">Disabled</Button>
                      <Button onClick={handleLoadingDemo} data-testid="button-loading">
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Click to Load"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Badge Variants</CardTitle>
                  <CardDescription>
                    Status indicators and labels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Standard Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge data-testid="badge-default">Default</Badge>
                      <Badge variant="secondary" data-testid="badge-secondary">Secondary</Badge>
                      <Badge variant="outline" data-testid="badge-outline">Outline</Badge>
                      <Badge variant="destructive" data-testid="badge-destructive">Destructive</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Status Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">
                        <Check className="w-3 h-3 mr-1" />
                        Success
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200" variant="outline">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Warning
                      </Badge>
                      <Badge className="bg-red-100 text-red-700 border-red-200" variant="outline">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Error
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200" variant="outline">
                        <Info className="w-3 h-3 mr-1" />
                        Info
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forms">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Form Elements</CardTitle>
                  <CardDescription>
                    Input components for building forms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email"
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password"
                        data-testid="input-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" data-testid="checkbox-terms" />
                      <Label htmlFor="terms" className="text-sm">
                        Accept terms and conditions
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="notifications" 
                        checked={switchValue}
                        onCheckedChange={setSwitchValue}
                        data-testid="switch-notifications"
                      />
                      <Label htmlFor="notifications" className="text-sm">
                        Enable notifications
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="toasts">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Toast Notifications</CardTitle>
                  <CardDescription>
                    Display feedback messages to users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => toast({ title: "Default Toast", description: "This is a default toast message" })}
                      data-testid="button-toast-default"
                    >
                      Default Toast
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toast({ 
                        title: "Success!", 
                        description: "Your changes have been saved",
                      })}
                      data-testid="button-toast-success"
                    >
                      Success Toast
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => toast({ 
                        title: "Error", 
                        description: "Something went wrong. Please try again.",
                        variant: "destructive"
                      })}
                      data-testid="button-toast-error"
                    >
                      Error Toast
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cards">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Basic Card</CardTitle>
                    <CardDescription>
                      A simple card with header and content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Cards are versatile containers for grouping related content.
                      They provide structure and visual hierarchy.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover-elevate cursor-pointer">
                  <CardHeader>
                    <CardTitle>Interactive Card</CardTitle>
                    <CardDescription>
                      Hover to see the elevation effect
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Use the <code className="bg-gray-100 px-1 rounded">hover-elevate</code> class
                      to add subtle hover effects.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
