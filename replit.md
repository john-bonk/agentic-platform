# Overview

This is a clean, well-structured React + Express full-stack starter template. It provides a professional UI foundation with organized code patterns that are easy to learn from and extend.

The application is built with a modern TypeScript stack featuring React on the frontend and Express on the backend, with support for both development and production environments.

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

### Example Pages
- `client/src/pages/HomePage.tsx` - Landing page with quick links
- `client/src/pages/DashboardPage.tsx` - Example dashboard with metrics and filter controls
- `client/src/pages/ProjectsPage.tsx` - Example list page with table (clickable items open tabs)
- `client/src/pages/ItemDetailPage.tsx` - Detail page with tabbed sections and accordions
- `client/src/pages/DemoPage.tsx` - Component showcase
- `client/src/pages/FormExamplePage.tsx` - Form handling example
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
