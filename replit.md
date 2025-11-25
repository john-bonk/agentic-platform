# Overview

This is a full-stack web application for managing vulnerability imports and integrations, specifically designed to work with Tenable security data and AuditBoard. The application provides a multi-step wizard interface for configuring vulnerability import jobs, mapping assets and findings between systems, and managing integration workflows.

The application is built with a modern TypeScript stack featuring React on the frontend and Express on the backend, with support for both development and production environments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React 18+ with TypeScript, using Vite as the build tool and development server.

**UI Framework**: The application uses shadcn/ui components (New York style variant) built on top of Radix UI primitives. This provides a comprehensive set of accessible, customizable UI components including dialogs, forms, tables, tabs, tooltips, and more.

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables. The theme uses a neutral base color with teal accents for primary actions. Custom fonts include SF Pro Display, DM Sans, Fira Code, Geist Mono, and Architects Daughter.

**State Management**: 
- React Query (@tanstack/react-query) for server state management with infinite stale time and disabled automatic refetching
- Local state stores for specific features (e.g., `importJobStore` for managing import job subscriptions)
- React Hook Form with Zod resolvers for form validation

**Routing**: Wouter library for lightweight client-side routing with two main routes:
- `/` - Main integrations page
- `/vulnerability-import-wizard` - Multi-step import configuration wizard

**Key Design Patterns**:
- Component composition with separated concerns (Header, SideNavigation, MainContent sections)
- Multi-step wizard pattern with step indicators and navigation
- Custom hooks for mobile responsiveness and toast notifications
- Query client with custom fetch wrapper handling 401 responses

## Backend Architecture

**Technology Stack**: Express.js with TypeScript running on Node.js, using ESM module format.

**Development Server**: Custom Vite integration in development mode with:
- Hot Module Replacement (HMR) over the HTTP server
- Runtime error overlays
- Replit-specific plugins (cartographer, dev-banner) in Replit environment
- Custom logging middleware for API requests

**API Structure**: RESTful API with `/api` prefix for all routes. The application uses a storage abstraction layer (`IStorage` interface) with an in-memory implementation (`MemStorage`) for development.

**Storage Layer**: 
- Interface-based design allowing multiple storage implementations
- Currently implements in-memory storage with Map-based data structures
- Prepared for database integration with Drizzle ORM schema definitions

**Build Process**:
- Frontend: Vite build outputting to `dist/public`
- Backend: ESBuild bundling server code to `dist/index.js`
- Separate TypeScript compilation check via `tsc`

**Key Design Patterns**:
- Dependency injection via storage interface
- Middleware-based request/response logging
- Error handling middleware with status code normalization
- Separate route registration abstraction

## Data Storage Solutions

**ORM**: Drizzle ORM configured for PostgreSQL with:
- Schema location: `./shared/schema.ts`
- Migrations directory: `./migrations`
- Type-safe schema definitions using Drizzle's type inference

**Database Schema** (Prepared):
- `users` table with UUID primary keys (generated via PostgreSQL's `gen_random_uuid()`)
- Unique username constraint
- Password field (expects pre-hashed values)
- Schema validation using Zod via `drizzle-zod`

**Current State**: Application uses in-memory storage (`MemStorage`) but is prepared to integrate with PostgreSQL via Neon serverless driver. The schema and configuration are ready, but database connection is not currently active.

**Migration Strategy**: Drizzle Kit push command (`npm run db:push`) configured for schema deployment.

## Authentication and Authorization

**Current State**: Authentication infrastructure is prepared but not actively implemented:
- User schema exists with username/password fields
- Storage interface includes user CRUD methods
- No active authentication middleware or session management
- Frontend query client has 401 response handling configured

**Prepared Infrastructure**:
- `connect-pg-simple` dependency suggests intention for PostgreSQL-backed sessions
- User creation and retrieval methods in storage interface

## External Dependencies

**Database Services**:
- Neon Serverless PostgreSQL (via `@neondatabase/serverless` package)
- Connection expected via `DATABASE_URL` environment variable

**UI Component Libraries**:
- Radix UI (comprehensive set of primitives for accessible components)
- Embla Carousel for carousel functionality
- Lucide React for icon components
- Recharts for data visualization (prepared but not actively used)

**Development Tools**:
- Replit-specific Vite plugins for development experience
- TypeScript for type safety across the stack
- PostCSS with Tailwind CSS and Autoprefixer

**Form and Validation**:
- React Hook Form for form state management
- Zod for runtime type validation
- @hookform/resolvers for integration between the two

**Date Handling**:
- date-fns library for date manipulation and formatting

**Key Third-Party Integrations** (Application Domain):
- Tenable (vulnerability scanning platform)
- AuditBoard (compliance and audit management platform)
- The application facilitates data synchronization between these systems

**Notable Decisions**:
- Uses wouter instead of React Router for smaller bundle size
- Prefers Radix UI headless components with custom styling over pre-styled component libraries
- Chooses Drizzle ORM over Prisma or TypeORM for lighter weight and better TypeScript inference
- Uses Vite instead of webpack for faster development experience
- Implements shared TypeScript types between client and server via `shared` directory