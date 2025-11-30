/**
 * Demo Page
 * 
 * Showcases all UI components available in this template.
 * Use this as a reference for building your own pages.
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogBody, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { 
  Bell, 
  Check, 
  AlertCircle, 
  Info,
  Loader2,
  ChevronDown,
  ChevronsUpDown,
  Terminal,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal,
  User,
  Settings,
  LogOut,
  Home,
  FileText,
  Calendar as CalendarIcon,
  Mail,
  MessageSquare,
  PlusCircle,
  UserPlus,
  Cloud,
  CreditCard,
  Keyboard,
  LifeBuoy,
  Users
} from "lucide-react";
import { useState } from "react";

export function DemoPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [progress, setProgress] = useState(60);
  const [sliderValue, setSliderValue] = useState([50]);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto">
        <PageHeader 
          title="Component Demo" 
          description="Examples of all UI components available in this template"
        />
        
        <div className="flex-1 p-8">
          <Tabs defaultValue="basic" className="max-w-5xl">
            <TabsList className="mb-8" data-testid="demo-tabs">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="data">Data Display</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="overlays">Overlays</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-10">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Accordion</h3>
                  <p className="text-sm text-slate-500">A vertically stacked set of interactive headings</p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It comes with default styles that matches the other components.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It's animated by default with smooth transitions.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Alert</h3>
                  <p className="text-sm text-slate-500">Displays a callout for user attention</p>
                </div>
                <div className="space-y-4">
                  <Alert variant="info">
                    <AlertTitle>Notice Title in Title Case</AlertTitle>
                    <AlertDescription>
                      Additional information in support of the title written in sentence case.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="success">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      Your changes have been saved successfully.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="warning">
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Please review the changes before proceeding.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Your session has expired. Please log in again.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Avatar</h3>
                  <p className="text-sm text-slate-500">An image element with fallback</p>
                </div>
                <div className="flex gap-4 items-center">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Badge</h3>
                  <p className="text-sm text-slate-500">Displays a badge or label with colors and weights</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Colors (Strong weight)</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge badgeColor="gray" weight="strong">Gray</Badge>
                      <Badge badgeColor="blue" weight="strong">Blue</Badge>
                      <Badge badgeColor="red" weight="strong">Red</Badge>
                      <Badge badgeColor="orange" weight="strong">Orange</Badge>
                      <Badge badgeColor="yellow" weight="strong">Yellow</Badge>
                      <Badge badgeColor="green" weight="strong">Green</Badge>
                      <Badge badgeColor="purple" weight="strong">Purple</Badge>
                      <Badge badgeColor="teal" weight="strong">Teal</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Weights (Blue)</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge badgeColor="blue" weight="weak">Weak</Badge>
                      <Badge badgeColor="blue" weight="normal">Normal</Badge>
                      <Badge badgeColor="blue" weight="strong">Strong</Badge>
                      <Badge badgeColor="blue" weight="extraStrong">Extra Strong</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Sizes</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge badgeColor="teal" weight="strong" size="sm">Small</Badge>
                      <Badge badgeColor="teal" weight="strong" size="md">Medium</Badge>
                      <Badge badgeColor="teal" weight="strong" size="lg">Large</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Legacy variants (backward compatible)</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Button</h3>
                  <p className="text-sm text-slate-500">Displays a button or link styled as a button</p>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button>Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Bell className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled>Disabled</Button>
                    <Button onClick={handleLoadingDemo}>
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
                      ) : "Click to Load"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Calendar</h3>
                  <p className="text-sm text-slate-500">A date field component for picking dates</p>
                </div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Card</h3>
                  <p className="text-sm text-slate-500">Displays a card with header, content, and footer</p>
                </div>
                <Card className="w-[350px]">
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card Content goes here.</p>
                  </CardContent>
                  <CardFooter>
                    <Button>Action</Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Collapsible</h3>
                  <p className="text-sm text-slate-500">An interactive component which expands/collapses</p>
                </div>
                <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen} className="w-[350px] space-y-2">
                  <div className="flex items-center justify-between space-x-4 px-4">
                    <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                    @radix-ui/primitives
                  </div>
                  <CollapsibleContent className="space-y-2">
                    <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                      @radix-ui/colors
                    </div>
                    <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                      @stitches/react
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Separator</h3>
                  <p className="text-sm text-slate-500">Visually separates content</p>
                </div>
                <div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
                    <p className="text-sm text-muted-foreground">An open-source UI component library.</p>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex h-5 items-center space-x-4 text-sm">
                    <div>Blog</div>
                    <Separator orientation="vertical" />
                    <div>Docs</div>
                    <Separator orientation="vertical" />
                    <div>Source</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Skeleton</h3>
                  <p className="text-sm text-slate-500">Loading placeholder for content</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Toggle</h3>
                  <p className="text-sm text-slate-500">A two-state button that can be on or off</p>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Toggle aria-label="Toggle bold"><Bold className="h-4 w-4" /></Toggle>
                    <Toggle aria-label="Toggle italic"><Italic className="h-4 w-4" /></Toggle>
                    <Toggle aria-label="Toggle underline"><Underline className="h-4 w-4" /></Toggle>
                  </div>
                  <div>
                    <ToggleGroup type="single">
                      <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                      <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                      <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forms" className="space-y-10">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Checkbox</h3>
                  <p className="text-sm text-slate-500">A control for selecting options</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="newsletter" defaultChecked />
                    <Label htmlFor="newsletter">Subscribe to newsletter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="disabled" disabled />
                    <Label htmlFor="disabled" className="text-muted-foreground">Disabled option</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Input</h3>
                  <p className="text-sm text-slate-500">A text input field</p>
                </div>
                <div className="space-y-4">
                  <div className="grid w-full max-w-sm gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" placeholder="Email" />
                  </div>
                  <div className="grid w-full max-w-sm gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" id="password" placeholder="Password" />
                  </div>
                  <div className="grid w-full max-w-sm gap-1.5">
                    <Label htmlFor="disabled-input">Disabled</Label>
                    <Input id="disabled-input" placeholder="Disabled" disabled />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Input OTP</h3>
                  <p className="text-sm text-slate-500">One-time password input field</p>
                </div>
                <InputOTP maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Radio Group</h3>
                  <p className="text-sm text-slate-500">A set of checkable buttons for selecting one option</p>
                </div>
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Option Two</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-three" id="option-three" />
                    <Label htmlFor="option-three">Option Three</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Select</h3>
                  <p className="text-sm text-slate-500">Displays a list of options for selection</p>
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Slider</h3>
                  <p className="text-sm text-slate-500">An input for selecting a value within a range</p>
                </div>
                <div className="space-y-4">
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="w-[60%]"
                  />
                  <p className="text-sm text-muted-foreground">Value: {sliderValue[0]}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Switch</h3>
                  <p className="text-sm text-slate-500">A control that toggles between two states</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="airplane-mode" checked={switchValue} onCheckedChange={setSwitchValue} />
                    <Label htmlFor="airplane-mode">Airplane Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" defaultChecked />
                    <Label htmlFor="notifications">Notifications</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Textarea</h3>
                  <p className="text-sm text-slate-500">A multi-line text input</p>
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="message">Your message</Label>
                  <Textarea placeholder="Type your message here." id="message" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-10">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Command</h3>
                  <p className="text-sm text-slate-500">A command menu / palette for search</p>
                </div>
                <Command className="rounded-lg border shadow-md">
                  <CommandInput placeholder="Type a command or search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      <CommandItem><CalendarIcon className="mr-2 h-4 w-4" /><span>Calendar</span></CommandItem>
                      <CommandItem><Mail className="mr-2 h-4 w-4" /><span>Mail</span></CommandItem>
                      <CommandItem><MessageSquare className="mr-2 h-4 w-4" /><span>Messages</span></CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Settings">
                      <CommandItem><User className="mr-2 h-4 w-4" /><span>Profile</span></CommandItem>
                      <CommandItem><Settings className="mr-2 h-4 w-4" /><span>Settings</span></CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Progress</h3>
                  <p className="text-sm text-slate-500">Displays progress of a task</p>
                </div>
                <div className="space-y-4">
                  <Progress value={progress} className="w-[60%]" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-10</Button>
                    <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+10</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Scroll Area</h3>
                  <p className="text-sm text-slate-500">Augments native scroll with custom styling</p>
                </div>
                <ScrollArea className="h-72 w-48 rounded-md border">
                  <div className="p-4">
                    <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div key={i} className="text-sm py-1">Tag {i + 1}</div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Table</h3>
                  <p className="text-sm text-slate-500">A responsive table component</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV001</TableCell>
                      <TableCell>Paid</TableCell>
                      <TableCell>Credit Card</TableCell>
                      <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV002</TableCell>
                      <TableCell>Pending</TableCell>
                      <TableCell>PayPal</TableCell>
                      <TableCell className="text-right">$150.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV003</TableCell>
                      <TableCell>Unpaid</TableCell>
                      <TableCell>Bank Transfer</TableCell>
                      <TableCell className="text-right">$350.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Tabs</h3>
                  <p className="text-sm text-slate-500">A set of layered sections of content</p>
                </div>
                <Tabs defaultValue="account" className="w-[400px]">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className="p-4 border rounded-b-md">
                    <p className="text-sm text-muted-foreground">Make changes to your account here.</p>
                  </TabsContent>
                  <TabsContent value="password" className="p-4 border rounded-b-md">
                    <p className="text-sm text-muted-foreground">Change your password here.</p>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-10">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Toast</h3>
                  <p className="text-sm text-slate-500">Displays a notification message</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => toast({ title: "Default Toast", description: "This is a default toast message" })}
                  >
                    Default Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast({ 
                      title: "Success!", 
                      description: "Your changes have been saved",
                    })}
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
                  >
                    Error Toast
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Tooltip</h3>
                  <p className="text-sm text-slate-500">A popup that displays information on hover</p>
                </div>
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="outline"><Info className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>More information</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Hover Card</h3>
                  <p className="text-sm text-slate-500">Shows content on hover over a trigger</p>
                </div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link">@nextjs</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/vercel.png" />
                        <AvatarFallback>VC</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">@nextjs</h4>
                        <p className="text-sm">The React Framework - created and maintained by @vercel.</p>
                        <div className="flex items-center pt-2">
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                          <span className="text-xs text-muted-foreground">Joined December 2021</span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </TabsContent>

            <TabsContent value="overlays" className="space-y-10">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Modal</h3>
                  <p className="text-sm text-slate-500">A modal window styled with teal top border and action buttons</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Modal</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Modal Title</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                      <div className="bg-purple-100 border border-purple-200 rounded p-6 min-h-[200px] flex items-center justify-center">
                        <span className="text-purple-500 text-lg">Content goes here</span>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <Button variant="ghost" className="text-slate-900">Cancel</Button>
                      <Button>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Dropdown Menu</h3>
                  <p className="text-sm text-slate-500">Displays a menu with actions</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Open Menu <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><User className="mr-2 h-4 w-4" /><span>Profile</span></DropdownMenuItem>
                    <DropdownMenuItem><CreditCard className="mr-2 h-4 w-4" /><span>Billing</span></DropdownMenuItem>
                    <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /><span>Settings</span></DropdownMenuItem>
                    <DropdownMenuItem><Keyboard className="mr-2 h-4 w-4" /><span>Keyboard shortcuts</span></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><Users className="mr-2 h-4 w-4" /><span>Team</span></DropdownMenuItem>
                    <DropdownMenuItem><UserPlus className="mr-2 h-4 w-4" /><span>Invite users</span></DropdownMenuItem>
                    <DropdownMenuItem><PlusCircle className="mr-2 h-4 w-4" /><span>New Team</span></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><LifeBuoy className="mr-2 h-4 w-4" /><span>Support</span></DropdownMenuItem>
                    <DropdownMenuItem><Cloud className="mr-2 h-4 w-4" /><span>API</span></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Popover</h3>
                  <p className="text-sm text-slate-500">Displays floating content</p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Dimensions</h4>
                        <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="width">Width</Label>
                          <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">Height</Label>
                          <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Sheet (Quick View Panel)</h3>
                  <p className="text-sm text-slate-500">A wider slide-out panel styled like the Item Detail page</p>
                </div>
                <div className="flex gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">Open Quick View</Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[500px] p-0 flex flex-col">
                      <div className="flex flex-col h-full">
                        <div className="px-8 pt-8 pb-0">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-slate-500 font-semibold">Inventory Item</span>
                              <h2 className="text-2xl font-semibold text-slate-900">AWS</h2>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button variant="outline" size="sm">Create Entity Risk</Button>
                              <Button variant="outline" size="sm">
                                Create Assessment
                                <ChevronDown className="ml-1 h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-9 w-9">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-5 border-b border-slate-200">
                            <button className="pb-3 text-sm font-semibold text-slate-500">Overview</button>
                            <button className="pb-3 text-sm font-semibold text-slate-500">Questionnaires</button>
                            <button className="pb-3 text-sm font-semibold text-slate-500">Issues</button>
                            <button className="pb-3 text-sm font-semibold text-teal-600 border-b-[3px] border-teal-600">Relationships</button>
                            <button className="pb-3 text-sm font-semibold text-slate-500">Contracts</button>
                          </div>
                        </div>
                        <div className="flex-1 px-8 py-6 overflow-y-auto">
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">Relationships</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="w-[140px] text-right text-xs text-slate-900">Vendor</span>
                              <span className="text-sm text-blue-600">Amazon</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-[140px] text-right text-xs text-slate-900">Used by</span>
                              <span className="text-sm text-blue-600">AuditBoard</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-[140px] text-right text-xs text-slate-900">Category</span>
                              <span className="text-sm text-slate-700">Cloud Infrastructure</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-[140px] text-right text-xs text-slate-900">Status</span>
                              <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">Active</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="navigation" className="space-y-10">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Breadcrumb</h3>
                  <p className="text-sm text-slate-500">Displays the current page location</p>
                </div>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Components</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Menubar</h3>
                  <p className="text-sm text-slate-500">A visually persistent menu for navigation</p>
                </div>
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>New Tab</MenubarItem>
                      <MenubarItem>New Window</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Share</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Print</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>Undo</MenubarItem>
                      <MenubarItem>Redo</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Cut</MenubarItem>
                      <MenubarItem>Copy</MenubarItem>
                      <MenubarItem>Paste</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>View</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>Always Show Bookmarks Bar</MenubarItem>
                      <MenubarItem>Always Show Full URLs</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Reload</MenubarItem>
                      <MenubarItem>Force Reload</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Pagination</h3>
                  <p className="text-sm text-slate-500">Navigation for paginated content</p>
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
