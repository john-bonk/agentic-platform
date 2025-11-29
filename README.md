# Starter Template

A clean, well-structured React + Express full-stack application template. Built with modern best practices, this template provides a solid foundation for building web applications with a professional UI and organized codebase.

## Overview

This template includes:

- **React 18** with TypeScript for the frontend
- **Express.js** with TypeScript for the backend
- **Shadcn/UI** component library (Radix primitives + Tailwind CSS)
- **React Query** for data fetching and caching
- **Wouter** for lightweight client-side routing
- **React Hook Form** with Zod validation
- **Drizzle ORM** ready for PostgreSQL
- **Vite** for fast development and builds

## Quick Start

1. **Install dependencies** (automatically done on Replit)
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   The app runs on port 5000. Click the "Open in new tab" button in the webview.

## Project Structure

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Layout components (AppLayout, PageHeader, etc.)
│   │   │   └── ui/            # Shadcn UI components
│   │   ├── config/
│   │   │   └── navigation.ts  # Navigation configuration
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and stores
│   │   ├── pages/             # Page components
│   │   ├── App.tsx            # Main app with routing
│   │   └── main.tsx           # Entry point
│   └── index.html
├── server/                    # Backend Express application
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # Data storage layer
│   └── vite.ts                # Vite dev server integration
├── shared/
│   └── schema.ts              # Database schemas and types
└── public/                    # Static assets
```

## How to Add Your Own Pages

### 1. Create a New Page Component

Create a new file in `client/src/pages/`:

```tsx
// client/src/pages/MyNewPage.tsx
import { AppLayout, PageHeader } from "@/components/layout";

export function MyNewPage() {
  return (
    <AppLayout>
      <PageHeader 
        title="My New Page" 
        description="Description of your page"
      />
      <div className="p-8">
        {/* Your content here */}
      </div>
    </AppLayout>
  );
}
```

### 2. Register the Route

Add the route to `client/src/App.tsx`:

```tsx
import { MyNewPage } from "@/pages/MyNewPage";

// In the Router component:
<Route path="/my-new-page" component={MyNewPage} />
```

### 3. Add to Navigation

Update `client/src/config/navigation.ts`:

```typescript
export const sideNavSections: SideNavSection[] = [
  {
    title: "MY SECTION",
    items: [
      { id: "my-page", label: "My New Page", path: "/my-new-page" },
    ],
  },
  // ... other sections
];
```

## How to Reuse Components

### Layout Components

```tsx
import { AppLayout, PageHeader } from "@/components/layout";

// Full layout with navigation
<AppLayout>
  <PageHeader title="Page Title" actions={<Button>Action</Button>} />
  <div className="p-8">Content</div>
</AppLayout>

// Layout without side navigation
<AppLayout showSideNav={false}>
  <div>Full-width content</div>
</AppLayout>
```

### UI Components

All Shadcn components are in `client/src/components/ui/`. Import them like:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### Forms

See `client/src/pages/FormExamplePage.tsx` for a complete form example with:
- React Hook Form integration
- Zod validation
- Shadcn form components

## How to Customize Navigation

Edit `client/src/config/navigation.ts`:

### Icon Navbar (Left sidebar with icons)

```typescript
export const iconNavItems: IconNavItem[] = [
  { type: "lucide", icon: "home", alt: "Home", active: false, path: "/" },
  { type: "lucide", icon: "folder", alt: "Projects", active: true, path: "/projects" },
  // Add more icons...
];
```

### Side Navigation (Secondary nav with text)

```typescript
export const sideNavSections: SideNavSection[] = [
  {
    title: "SECTION NAME",
    items: [
      { id: "item-1", label: "Item Label", path: "/path" },
    ],
  },
];
```

### App Configuration

```typescript
export const appConfig = {
  name: "Your App Name",
  shortName: "App",
  logoPath: "/path/to/logo.png",
};
```

## How to Add API Endpoints

### 1. Define Types in Schema

Add your types to `shared/schema.ts`:

```typescript
export const myItems = pgTable("my_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  // ... more fields
});

export const insertMyItemSchema = createInsertSchema(myItems).omit({
  id: true,
});

export type InsertMyItem = z.infer<typeof insertMyItemSchema>;
export type MyItem = typeof myItems.$inferSelect;
```

### 2. Add Storage Methods

Update `server/storage.ts`:

```typescript
export interface IStorage {
  // ... existing methods
  getMyItems(): Promise<MyItem[]>;
  createMyItem(item: InsertMyItem): Promise<MyItem>;
}
```

### 3. Create API Routes

Add routes to `server/routes.ts`:

```typescript
app.get("/api/my-items", async (req, res) => {
  const items = await storage.getMyItems();
  res.json(items);
});

app.post("/api/my-items", async (req, res) => {
  const validated = insertMyItemSchema.parse(req.body);
  const item = await storage.createMyItem(validated);
  res.status(201).json(item);
});
```

### 4. Fetch Data in Frontend

Use React Query:

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ["/api/my-items"],
});

// Create item
const mutation = useMutation({
  mutationFn: (newItem) => apiRequest("POST", "/api/my-items", newItem),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/my-items"] });
  },
});
```

## Styling Guide

### Colors

Colors are defined in `client/src/index.css` using CSS variables. The template supports light and dark modes.

### Tailwind Classes

Use Tailwind CSS utilities for styling. Key patterns:

```tsx
// Spacing
<div className="p-8">             {/* padding */}
<div className="gap-4">           {/* gap between flex/grid items */}

// Typography
<h1 className="text-2xl font-bold text-gray-900">
<p className="text-sm text-gray-500">

// Borders & Backgrounds
<div className="border border-gray-200 rounded-md bg-white">

// Interactive states
<div className="hover-elevate cursor-pointer">  {/* subtle hover effect */}
```

### Component Patterns

- Use `<Card>` for content sections
- Use `<Badge>` for status indicators
- Use `<Button>` variants: `default`, `secondary`, `outline`, `ghost`, `destructive`

## Tips for Remixing

1. **Start with navigation**: Update `config/navigation.ts` to match your app structure
2. **Customize colors**: Edit CSS variables in `index.css` 
3. **Build incrementally**: Start with simple pages using `<AppLayout>` and add complexity
4. **Use example pages**: Reference `DemoPage.tsx` and `FormExamplePage.tsx` for patterns
5. **Keep it simple**: The template uses in-memory storage; add database when needed

## Common Patterns

### Page with List

See `client/src/pages/ProjectsPage.tsx` for:
- Search filtering
- Sortable table
- Row selection
- Empty states

### Form Page

See `client/src/pages/FormExamplePage.tsx` for:
- Validated forms
- Select dropdowns
- Error handling
- Success notifications

### Dashboard

See `client/src/pages/DashboardPage.tsx` for:
- Metric cards
- Activity feeds
- Chart placeholders

## Troubleshooting

### Server Not Starting
- Check the workflow logs for errors
- Ensure all dependencies are installed

### Styles Not Loading
- Make sure Tailwind is configured correctly
- Check for CSS import errors

### API Requests Failing
- Verify the route exists in `server/routes.ts`
- Check browser console for CORS or network errors

## License

MIT License - feel free to use this template for any project!

---

Happy building! If you have questions, check the example pages for reference implementations.
