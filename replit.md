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
-   **Agent Hub System**: A toggle in Prototype Settings (`agentHubEnabled`) replaces the Home page with an agent-centric experience for supported workspaces. Config-driven via `client/src/config/agentHubConfig.ts`, which exports typed workflow data per workspace. Component: `client/src/components/workspace/AgentHubHome.tsx`. Currently supports `enterprise-risk` with 12 agent workflows across 4 categories (Direct Action, Continuous, Scheduled, Emergent). To add a new workspace: add workflow/activity arrays to the config, add a case to `getAgentHubData()`, and add the workspace id to `isAgentHubSupported()`. When enabled, the assistant is branded "Optro Assistant" across all surfaces (AppHeader, HomeAssistantPanel, HomePageContent, DefaultHomeDashboard, ReportingPage). The assistant panel auto-opens on the Agent Hub home page via `useHomeAssistantStore`. **Navigation override**: When Agent Hub is active, `AppLayout` replaces the normal workspace side nav with `agentHubNavSections` (defined in `navigation.ts`) — a stripped-down Projects/Monitoring/Scheduled structure focused on the agent workflow context. The LeftIconNavbar switches to `homeOnly` mode (logo + home icon only), quick access items (Home/Recent/Favorites) are hidden, and the side nav title reads "Optro". **Dynamic project nav items**: When a workflow session is launched (e.g., "Risk Assessment"), it is registered in the `useWorkflowSessionStore` (Zustand store at `client/src/lib/workflowSessionStore.ts`), which holds `activeProjects`, `currentSessionId`, and `sessionConfigs`. `AppLayout` reads the store and dynamically injects active projects into the "Projects" nav section with an "Active" badge. Clicking a project nav item sets `currentSessionId` in the store and navigates to `/`, where `AgentHubHome` reads the store and renders the corresponding `WorkflowSession`. Session state persists across SPA navigation within the session.
-   **Workflow Session System**: A generalized full-screen workflow session overlay (`client/src/components/workspace/WorkflowSession.tsx`) for in-session agentic workflows. Features a stepper-based block progression with animated transitions between human-input steps and automated agent steps. Blocks collapse on completion and the next block expands. Currently implements a Risk Assessment workflow with 6 blocks: 1) Intelligence Synthesis (automated — agent analyzes signals), 2) Assessment Approach (human — template selection with auto/survey bifurcation), 3) Assessment Configuration (HITL — params, scoring methodology), 4) Distribution Setup (HITL — org hierarchy with auto-assessed vs. survey-items breakdown), 5) Assessment Execution (automated — dual-track: agent auto-scores 42 items in parallel while surveys collect asynchronously from 12 locations with real-time status tracking), 6) Next Steps (human — 6 post-assessment quick actions). Launched via `CustomEvent("agent-hub:launch-workflow")` from the assistant panel or "Launch Workflow" button on workflow rows. Emits `CustomEvent("workflow-session:block-event")` with `{blockId, type}` on block activation and completion, consumed by the assistant panel sidecar. **Detail views**: Synthesis signals and Next Steps actions are clickable — they dispatch `CustomEvent("workflow-session:open-detail")` which renders a full-screen detail view as an absolute overlay (preserving block state underneath via `invisible pointer-events-none`). Detail views registered in `fullScreenDetailViews` map, keyed by `signal-*` and `ns-*` prefixes. To add new workflow sessions: create a config function returning `WorkflowSessionConfig`, register in `workflowSessionConfigs` and `workflowRowToSession` maps in `AgentHubHome.tsx`.
-   **Agentic Chat Sidecar**: When a workflow session is launched from the assistant panel, the chat activates as a conversational sidecar. The assistant panel listens for `workflow-session:block-event` CustomEvents and injects contextual agent messages that narrate and explain each step. Defined in `HomeAssistantPanel.tsx` via `sidecarMessages` map keyed by blockId. The initial launch message is injected immediately when the "Start Risk Assessment" quick action is clicked. This creates an industry-standard agentic collaboration pattern where the main frame shows the workflow and the side panel provides conversational context.
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