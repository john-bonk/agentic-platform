# REPLIT HYPERPROMPT — Admin Console
# Scope: Add an Admin section to the left-edge sidebar and implement its four core panels.
# This is a self-contained UI addition. Do not modify any existing solution workflows.

---

## WHAT TO BUILD

A new **Admin** entry in the left-edge sidebar that opens a dedicated admin area with four panels,
accessible only to admin-role users. Build it with the existing UI component library, color system,
typography, spacing, and sidebar patterns already in use — this should feel native to the product,
not bolted on.

---

## SIDEBAR ENTRY

- Add a new icon to the left-edge sidebar, positioned at the bottom of the nav group, above any
  existing bottom-anchored items (e.g. user avatar, settings gear)
- Use a shield or sliders icon from the existing icon set — whichever is already available and
  most appropriate for "admin / configuration"
- Label: **Admin**
- Active state, hover state, and tooltip behavior must match all existing sidebar items exactly
- Clicking opens the Admin area as the main content view, replacing the current content panel
- Admin entry is only visible and accessible to users with the Admin role; hide it entirely for
  Reviewer and Viewer roles

---

## ADMIN AREA LAYOUT

The Admin area is a standard two-level layout:

**Top**: Page header — "Admin" title in the existing page header style, with a subtitle:
"Workspace configuration · AuditCo" (or whatever the active org name is)

**Second level**: Horizontal sub-nav tabs for the four panels:
1. Users & Permissions
2. Connected Sources
3. AI & Agent Config
4. Audit Log

Default to the **Users & Permissions** tab on first open.

Use the existing tab component pattern from the solution/workflow views.

---

## PANEL 1 — USERS & PERMISSIONS

A table of workspace users with role management and HITL routing configuration.

**User table** (use existing table component):
- Columns: Name · Email · Role · Solutions access · Last active · Actions
- Role values: Admin / Reviewer / Viewer — inline editable via dropdown, matching existing
  select component style
- Solutions access: pill tags showing which solutions the user has access to, editable via a
  popover multi-select
- Actions column: Remove user button

**Below the table**: two configuration blocks side by side

Left block — **HITL gate delegation**:
- A simple list of HITL gate types (Scope confirmation, Exception review, Conclusion approval,
  Final sign-off)
- Each row: gate name + assigned reviewer role dropdown + optional specific user override
- Use existing form row / label + control pattern

Right block — **Invite user**:
- Email input + Role selector + Invite button
- Match existing form input and button styles exactly

**Mock data**: populate with 4–5 realistic users across all three roles.

---

## PANEL 2 — CONNECTED SOURCES

A list of data source connections with status indicators and configuration controls.

**Connection list** (use existing card or list-row component):

Each connection row shows:
- Source name and type icon
- Connection status: Connected (green) / Disconnected (red) / Syncing (amber) — use existing
  status dot/badge component
- Last synced timestamp
- Sync cadence label (e.g. "Daily at 02:00" or "On demand")
- Two actions: Configure (opens a settings drawer) and Sync now button

**Include these mock connections** to exercise all status states:
- GRC Platform — Connected — last synced 2 hours ago — daily cadence
- SharePoint / Document Store — Connected — last synced 6 hours ago — on demand
- HRIS System — Disconnected — last synced 3 days ago
- ERP / Procurement — Syncing — started 4 minutes ago

**Below the list**: an "Add connection" button that opens a modal — the modal just needs a
placeholder state ("Connection setup coming soon") for now; do not build the full integration
flow.

**Data corpus section** below the connections list:
- Section label: "Uploaded data corpus"
- A file list showing uploaded documents with: filename, type badge (PDF / XLSX / CSV), upload
  date, and a remove button
- An upload dropzone below the list — match the existing file upload pattern if one exists,
  otherwise a standard dashed-border dropzone
- Mock data: 2–3 uploaded files

---

## PANEL 3 — AI & AGENT CONFIG

Configuration controls for AI model usage, token budgets, and guardrails.

Layout: two columns of configuration blocks.

**Left column**

Block 1 — **Model selection**:
- A list of active solutions (SOX Control Testing, TPRM, etc.)
- Each row: solution name + model selector dropdown (options: GPT-4o / Claude Sonnet / Claude
  Haiku — values are illustrative, just need to render)
- Use the existing form row pattern

Block 2 — **Token budgets**:
- Same solution list
- Each row: solution name + monthly token budget input (numeric) + current month usage bar
  (use existing progress bar component or a simple inline bar)
- Usage bar shows consumed vs. budgeted — green under 80%, amber 80–95%, red over 95%
- Mock data: SOX at 68% used, TPRM at 12% used

**Right column**

Block 3 — **Guardrails**:
- Three toggle rows using the existing toggle/switch component:
  - "Require plan preview before all workflow executions" — on
  - "Block agent actions above high-impact threshold without explicit approval" — on
  - "Log all AI outputs to audit trail" — on
- Each toggle has a one-line description below the label in muted text

Block 4 — **Content policy**:
- A single textarea with label "Custom system prompt additions" — existing textarea style
- A Save button below it — existing button style
- Placeholder text: "Add org-specific context or constraints applied to all agent prompts…"

---

## PANEL 4 — AUDIT LOG

A full-width, paginated log of all agentic activity across the workspace.

**Filter bar** at the top (use existing filter/toolbar pattern):
- Solution selector dropdown (All solutions / SOX / TPRM / etc.)
- Action type filter (All / AI / Automated / HITL)
- Date range picker (Today / Last 7 days / Last 30 days / Custom)
- Object ID search input

**Log table** below filters:
- Columns: Timestamp · Object ID · Solution · Action · Type · Actor
- Type column: colored badge — AI (blue) / auto (teal) / HITL (coral) — match existing badge
  colors exactly
- Actor: agent name for AI/auto rows, user name for HITL rows
- Rows are read-only; clicking a row expands an inline detail panel showing the full action
  description and any output summary

**Mock data**: 15–20 rows spanning both SOX and TPRM solutions, all three action types, and
at least 3 HITL rows showing real user names as actors.

**Pagination**: use existing pagination component. Show 10 rows per page.

---

## IMPLEMENTATION RULES

1. **Read the existing codebase before writing anything.** Identify the sidebar component,
   the tab component, the table component, the badge/status component, the form input styles,
   and the toggle component. Use all of them — do not create new base components.

2. **Role-gate the sidebar entry.** The Admin icon must not appear for Reviewer or Viewer role
   users. Check wherever role is currently checked in the app and apply the same pattern.

3. **No modifications to existing views.** This is purely additive. SOX, TPRM, and all other
   existing routes remain unchanged.

4. **All four panels must be reachable and render without errors.** Mock data is sufficient —
   no real API connections needed. Every interactive element (dropdowns, toggles, buttons)
   should respond visually even if the backing action is a no-op.

5. **Match the visual language exactly.** Font sizes, spacing scale, border radius, shadow
   depth, color tokens — pull from what already exists. If in doubt, match the closest
   existing component rather than inventing something new.
