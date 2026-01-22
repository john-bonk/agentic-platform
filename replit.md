# Overview

A generic, well-structured React + Express full-stack starter template. This template provides professional UI patterns including:
- Dashboard with metrics, charts, and filterable data tables
- List Page with flat table format (no nesting)
- Hierarchy Page with multi-level expandable rows (Region > Country > State > City)
- Detail Page with tabbed sections
- Multi-step Wizard with file upload
- Config-driven navigation system

All content uses generic naming making it easy to customize for any use case. Design uses #266C92 teal as the primary accent color.

# Component Usage Policy

**IMPORTANT: Always use existing components before creating new ones.**

This template includes pre-built, tested components that should be reused. Do NOT create new components for functionality that already exists.

## Required Components (Always Use These)

### Layout Components
```typescript
import { AppLayout, PageHeader } from "@/components/layout";
```
- `AppLayout` - Main page wrapper with navigation, always wrap pages with this
- `PageHeader` - Consistent page headers with title, description, and action buttons

### Feedback Components
```typescript
import { EmptyState } from "@/components/ui/empty-state";
```
- `EmptyState` - Empty state displays with 4 variants: "search", "no-items", "no-data", "empty-folder"
- Supports illustrations (default) or icons (`useIllustration={false}`)
- Use for empty lists, search results, folders, or any "no content" state

### Wizard Components
```typescript
import { Wizard, WizardHeader, WizardContent, WizardFooter, useWizard } from "@/components/ui/wizard";
```
- Multi-step forms with progress indicators
- Built-in navigation (Next/Previous/Finish buttons)
- Use for any multi-step creation or configuration flow

### Standard Shadcn Components
Use existing Shadcn components from `@/components/ui/`:
- `Button`, `Badge`, `Card` - Core interactive elements
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Tabbed interfaces
- `Input`, `Select`, `Checkbox`, `Label` - Form inputs
- `Dialog`, `Sheet`, `Popover` - Overlays and modals
- `Table` - Data tables

## Anti-Patterns (Do NOT Do These)

- Creating custom empty states instead of using `EmptyState`
- Building new wizard/stepper components instead of using `Wizard`
- Creating custom page wrappers instead of using `AppLayout`
- Duplicating layout patterns instead of using `PageHeader`

## Navigation Configuration

All navigation is config-driven. To add new pages:
1. Add route in `client/src/App.tsx`
2. Add navigation item in `client/src/config/navigation.ts`

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React 18+ with TypeScript, using Vite as the build tool and development server.

**UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling.

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables. The theme uses a neutral base color with teal accents for primary actions.

**State Management**: 
- React Query (@tanstack/react-query) for server state management
- Zustand for local UI state (tab management)
- React Hook Form with Zod resolvers for form validation
- ThemeProvider context for dark/light mode (localStorage: "app-theme")
- SettingsPanel with localStorage persistence ("dashboard-settings") and CustomEvent sync

**Routing**: Wouter library for lightweight client-side routing.

**Key Design Patterns**:
- Reusable layout components (AppLayout, PageHeader, SideNavigation)
- Config-driven navigation system
- List-to-detail navigation with header tabs (click item → opens tab with detail view)
- Component composition with separated concerns

**Tab Management** (Zustand store in `client/src/lib/tabStore.ts`):
- Open tabs appear in AppHeader as clickable navigation items
- Click item in list → opens new tab → navigates to detail page
- Tabs can be closed, preserving navigation state

## Key Files and Folders

### Navigation Configuration
- `client/src/config/navigation.ts` - Central navigation config for icon navbar and side navigation

### Layout Components
- `client/src/components/layout/AppLayout.tsx` - Main page wrapper
- `client/src/components/layout/PageHeader.tsx` - Reusable page header
- `client/src/components/layout/SideNavigation.tsx` - Side navigation panel
- `client/src/components/layout/LeftIconNavbar.tsx` - Icon navbar

### Template Pages
- `client/src/pages/DashboardPage.tsx` - Dashboard with metrics, charts, and data table (default landing page)
- `client/src/pages/ListPage.tsx` - Flat table with search, filters, and item selection
- `client/src/pages/HierarchyPage.tsx` - Multi-level hierarchical data with expandable rows (NAME, PARENT, TYPE, DATE CREATED, ALLOWED ON columns)
- `client/src/pages/ItemDetailPage.tsx` - Detail page with tabbed sections (Tab 1-5)
- `client/src/pages/WizardPage.tsx` - Multi-step wizard with file upload
- `client/src/pages/DemoPage.tsx` - Component showcase
- `client/src/pages/SettingsPage.tsx` - Settings page example

### Backend
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Data storage layer (in-memory)
- `shared/schema.ts` - Database schemas and types

## Backend Architecture

**Technology Stack**: Express.js with TypeScript running on Node.js.

**API Structure**: RESTful API with `/api` prefix for all routes.

**Storage Layer**: 
- Interface-based design allowing multiple storage implementations
- Currently implements in-memory storage
- Prepared for database integration with Drizzle ORM

## Data Storage

**ORM**: Drizzle ORM configured for PostgreSQL with:
- Schema location: `./shared/schema.ts`
- Type-safe schema definitions using Drizzle's type inference

**Current State**: Application uses in-memory storage (`MemStorage`) but is prepared for PostgreSQL integration.

## How to Add a New Page

1. Create a component in `client/src/pages/`
2. Import and add route in `client/src/App.tsx`
3. Add navigation item in `client/src/config/navigation.ts`

## How to Add an API Endpoint

1. Define types in `shared/schema.ts`
2. Add storage methods in `server/storage.ts`
3. Create routes in `server/routes.ts`

## External Dependencies

**UI Libraries**:
- Radix UI primitives
- Lucide React icons
- React Hook Form + Zod

**Development Tools**:
- Vite for fast development
- TypeScript across the stack
- Tailwind CSS for styling

## Notable Decisions

- Uses wouter instead of React Router for smaller bundle size
- Prefers Radix UI headless components with Tailwind styling
- Uses Drizzle ORM for type-safe database access
- Implements shared types between client and server via `shared` directory
