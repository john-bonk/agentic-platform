# Overview

This project is a generic, well-structured React and Express full-stack starter template. Its primary purpose is to provide a robust foundation for building professional web applications, incorporating common UI patterns and architectural best practices. Key capabilities include:

-   **Professional UI Patterns**: Dashboards with metrics and charts, list pages, hierarchical data displays, detailed views with tabbed sections, and multi-step wizards with file uploads.
-   **Config-Driven Navigation**: A flexible system for managing application navigation.
-   **Reusable Components**: A library of pre-built, tested components for consistent UI and accelerated development.
-   **Full-Stack Integration**: Seamless interaction between a React frontend and an Express.js backend.

The template uses generic naming to facilitate customization across various use cases and features a consistent design with teal (#266C92) as the primary accent color.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React 18+ with TypeScript, utilizing Vite for development and bundling.

**UI Framework**: Shadcn/ui components, built on Radix UI primitives, styled with Tailwind CSS.

**Styling**: Tailwind CSS with custom design tokens defined via CSS variables, featuring a neutral base and teal accents.

**State Management**:
-   **Server State**: React Query for data fetching, caching, and synchronization.
-   **Local UI State**: Zustand for managing transient UI states (e.g., tab management, wizard session data).
-   **Form Management**: React Hook Form with Zod for robust form validation.
-   **Theming**: `ThemeProvider` context for dark/light mode, persisted in local storage.
-   **Settings**: A `SettingsPanel` with local storage persistence and `CustomEvent` for synchronization.

**Routing**: Wouter library for lightweight, client-side routing.

**Key Design Patterns**:
-   **Component Reusability**: Emphasis on `AppLayout`, `PageHeader`, and `SideNavigation`.
-   **Config-Driven Navigation**: Centralized configuration for all navigation elements.
-   **List-to-Detail Flow**: Navigation from list views to detailed views via dynamic tabs.
-   **Component Composition**: Clear separation of concerns within components.

**Tab Management**: Utilizes a Zustand store (`client/src/lib/tabStore.ts`) to manage dynamic tabs in the `AppHeader`, enabling navigation to detail pages and preserving state upon closure.

**Core Components**:
-   **Layout**: `AppLayout`, `PageHeader`, `SideNavigation`, `LeftIconNavbar`, `BrowserChrome`.
-   **Feedback**: `EmptyState` with various variants.
-   **Wizard**: `Wizard`, `WizardHeader`, `WizardContent`, `WizardFooter`.
-   **Shadcn UI**: Standard components like `Button`, `Badge`, `Card`, `Tabs`, `Input`, `Select`, `Dialog`, `Table`.

**Key Features**:
-   **Dynamic Inbox Tab Content System**: Configurable `HomePageContent.tsx` to display workspace-specific data across multiple tabs (Tasks, Issues, Controls, Narratives, Risks, Comments) with dynamic charts, overview cards, and list renders.
-   **Agent Hub System**: Config-driven agent workflow management (`client/src/config/agentHubConfig.ts`) for specific workspaces, enabling an "Agent Hub Mode" with an "Optro Assistant."
-   **AI Governance Page**: A dedicated page (`client/src/pages/AIGovernancePage.tsx`) integrated into the IT Security workspace, mirroring a professional AI governance dashboard with metrics, charts, and tables.

## Backend Architecture

**Technology Stack**: Express.js with TypeScript running on Node.js.

**API Structure**: RESTful API with all endpoints prefixed by `/api`.

**Storage Layer**: Interface-based design supporting multiple storage implementations. Currently uses in-memory storage (`MemStorage`) but is designed for future integration with Drizzle ORM and PostgreSQL.

**Data Storage**:
-   **ORM**: Drizzle ORM configured for PostgreSQL, with type-safe schema definitions in `./shared/schema.ts`.
-   **Current State**: In-memory storage is used, with Drizzle ORM configured for future PostgreSQL integration.

## Intelligence System

An integrated intelligence layer provides context-aware responses and report generation:

-   **Backend Services**: `server/llm.ts` uses keyword-based intent detection (`generateHomeContextResponse()`) for tasks, controls, risks, reports, etc., with workspace-aware context.
-   **API Routes**: Dedicated routes for fetching controls, tasks, dashboard metrics, reports, and generating new reports (`/api/controls`, `/api/tasks`, `/api/dashboard/metrics`, `/api/reports`, `/api/generate-report`).
-   **Data Schemas**: Zod-validated schemas in `shared/schema.ts` for controls, tasks, generated reports, and resource references.
-   **Frontend Components**: `HomeAssistantPanel` for AI interaction, `ResourceCard` for clickable references, `GeneratedReportPage` for rich report visualization, and `ReportingPage` to list reports.
-   **AI Report Generation**: Detects report requests from user prompts, supports various report types (SOX, cyber, risk assessment), extracts topics dynamically, and generates rich reports with embedded charts (bar, pie, line). Reports persist in session storage.

# External Dependencies

**UI Libraries**:
-   Radix UI (primitives)
-   Lucide React (icons)
-   React Hook Form
-   Zod (schema validation)

**Development Tools**:
-   Vite (build tool and development server)
-   TypeScript (language)
-   Tailwind CSS (styling framework)

**Data Storage**:
-   Drizzle ORM (for future PostgreSQL integration)