/**
 * Component Registry
 * 
 * Central export file for all reusable components in this template.
 * ALWAYS import components from here or their specific paths.
 * DO NOT create new components for functionality that already exists.
 */

// Layout Components - Use for all page structures
export { AppLayout, PageHeader } from "./layout";

// Feedback Components - Use for empty states and user feedback
export { EmptyState } from "./ui/empty-state";

// Wizard Components - Use for multi-step forms and flows
export { 
  Wizard, 
  WizardHeader, 
  WizardContent, 
  WizardFooter,
  useWizard 
} from "./ui/wizard";

// Re-export common Shadcn components for convenience
export { Button } from "./ui/button";
export { Badge } from "./ui/badge";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
export { Input } from "./ui/input";
export { Label } from "./ui/label";
export { Checkbox } from "./ui/checkbox";
export { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
export { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
export { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
export { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
