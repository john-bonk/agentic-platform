# REPLIT HYPERPROMPT — Onboarding Setup Wizard
# Scope: A new left-edge sidebar icon that launches a full-screen onboarding flow.
# Five steps. Hyperminimal. Smooth animated transitions. Concludes on the Solutions home view.

---

## WHAT TO BUILD

A new **Setup** entry in the left-edge sidebar that opens a full-screen onboarding wizard.
The wizard walks a new org through workspace initialization in five steps, then resolves
directly into the Solutions hub as the default home view.

Design register: **hyperminimal**. Maximum whitespace, single focused element per screen,
no chrome beyond what is essential. Every step transition is animated. The experience should
feel calm, deliberate, and fast.

---

## SIDEBAR ENTRY

- Add a new icon to the left-edge sidebar — use a sparkle, wand, or play-circle icon from
  the existing icon set; whichever reads most as "get started"
- Label: **Setup**
- Positioned near the top of the nav, above the solution icons
- Dot indicator on the icon when setup is incomplete (same pattern used elsewhere in the app
  for unread/pending states if one exists; otherwise a small filled accent-color dot)
- Dot disappears permanently once setup is completed
- Active / hover / tooltip behavior must match all other sidebar items exactly
- Visible to all roles; the wizard itself is only completable by Admin role users — show a
  locked/read-only state for Reviewer and Viewer if they open it

---

## FULL-SCREEN OVERLAY

When Setup is clicked, the wizard takes over the full content area — not a modal, not a
drawer. It replaces the main content panel entirely, using the same background and container
as every other full-page view in the app.

**Persistent elements across all steps:**
- Top-left: the existing app logo / wordmark (already present in the shell — don't duplicate
  it, just ensure the shell header remains visible)
- Top-right: step progress indicator — "2 of 5" in muted mono text, nothing more
- Top-right below the counter: a plain text "Skip setup" link in muted style — only visible
  on steps 1–4, not on step 5
- No sidebar icons are highlighted while the wizard is active; the Setup icon remains active

---

## STEP TRANSITION ANIMATION

All step transitions use the same animation. Define it once and reuse it across all steps:

- Outgoing content: fade to 0 opacity + translate up 8px — duration 180ms, ease-in
- Incoming content: fade from 0 opacity + translate up 8px to position — duration 220ms,
  ease-out, starts after outgoing completes
- Total transition: ~400ms
- The step counter updates mid-transition (between out and in)
- Progress bar (if used) animates width smoothly using the same 220ms ease-out

Use the existing animation/transition utilities in the codebase. Do not import a new
animation library.

---

## STEP LAYOUT PATTERN

Every step uses the same layout grid. Define it once:

- Centered content column, max-width 520px, horizontally and vertically centered in the
  content area
- Step label at top: small mono uppercase text in accent color — e.g. "STEP 1 OF 5"
- Step title below: large, bold, tight letter-spacing — the primary heading
- Step subtitle below title: one line, muted, regular weight
- Input area below subtitle: the step-specific controls (varies per step)
- Primary action button at bottom of column: full-width, existing primary button style
- Secondary action (where applicable): plain text link below the button, muted

---

## THE FIVE STEPS

**Step 1 · Org Context**

Title: "Tell us about your org"
Subtitle: "This helps Optro configure your workspace intelligently."

Controls (use existing input components):
- Org name — text input, autofocused
- Industry — select dropdown (Financial Services / Technology / Healthcare / Manufacturing /
  Other)
- Compliance scope — multi-select pill input (SOX / TPRM / ISO 27001 / HIPAA / PCI / Other)

Primary action: "Continue →"

Interaction note: the Continue button is disabled until Org name is filled. No other
validation required — the other fields have sensible defaults.

---

**Step 2 · Connect Your Data**

Title: "Connect your data sources"
Subtitle: "Optro uses these to automate evidence collection and analysis."

Controls:
- A vertical list of 4 connection tiles, each with:
  - Source icon + source name + one-line description
  - A "Connect" button on the right that toggles to a green "Connected ✓" state on click
  - No real auth flow needed — clicking Connect immediately shows the connected state
- Sources:
  - GRC Platform — "Import controls, risks, and frameworks"
  - Document Store — "SharePoint, Google Drive, or file upload"
  - HRIS — "Sync team and org structure"
  - ERP / Procurement — "Vendor and spend data"

Below the tiles: a small muted line — "You can add or change connections later in Admin"

Primary action: "Continue →"
Secondary action: "Skip for now" (plain text link)

The Continue button is always enabled on this step.

---

**Step 3 · Choose Your Solutions**

Title: "Which solutions do you need?"
Subtitle: "Activate the workflows your team will run. You can add more later."

Controls:
- A 2×3 grid of solution toggle cards (or 3×2 depending on aspect ratio)
- Each card: solution name + one-line description + a toggle switch
- Solutions:
  - SOX Control Testing — "Automated end-to-end control testing"
  - TPRM — "Vendor risk assessment and monitoring"
  - Risk Assessments — "Identify, score, and treat risks"
  - Pre-IPO Readiness — "Track readiness across workstreams"
  - Evidence Collection — "Automate evidence request and intake"
- SOX Control Testing is toggled ON by default; all others OFF
- Toggling a card ON shows a subtle highlight on the card (existing selected/active card style)

Primary action: "Continue →" — disabled until at least one solution is toggled on

---

**Step 4 · Configure Workflows**

Title: "Set your defaults"
Subtitle: "These can be changed per workflow at any time."

Controls — three simple rows using existing form row / label + control pattern:

Row 1 — Default workflow trigger:
Label: "How should workflows start by default?"
Control: segmented control or radio group — "Manual (direct action)" selected / "Scheduled" / "I'll configure per workflow"

Row 2 — HITL approvals:
Label: "Who approves flagged findings by default?"
Control: select dropdown — "Any Admin" / "Assigned reviewer" / "I'll configure per workflow"

Row 3 — Audit logging:
Label: "Log all agentic actions to audit trail?"
Control: toggle — on by default

Below the three rows: a muted note — "Advanced configuration is available in Admin"

Primary action: "Finish setup →"
No secondary action on this step.

---

**Step 5 · Ready**

This step has no inputs. It is purely a confirmation moment before the transition into the app.

Title: "You're ready."
Subtitle: "Your workspace is configured. Let's get to work."

Below the subtitle: a summary block — a minimal bordered card listing what was set up:
- Org name (from step 1)
- Solutions activated (from step 3, shown as pill tags)
- Connections added (count from step 2, e.g. "2 connected")
- Default trigger (from step 4)

This card uses the existing bordered card / summary component style.

Primary action button: "Open Solutions →"
Full width, primary style. This is the only interactive element on this step.

**On click:** animate the wizard content out using the standard step transition (fade + translate),
then resolve to the Solutions hub view. The Setup sidebar icon dot disappears at this moment.
Do not navigate away abruptly — the transition should feel like the wizard exhales into the app.

---

## SKIP SETUP BEHAVIOR

Clicking "Skip setup" on any of steps 1–4:
- Shows a brief inline confirmation prompt replacing the secondary link:
  "Skip for now? You can always return via the Setup icon. [Yes, skip] [Cancel]"
- "Yes, skip" navigates immediately to the Solutions hub
- The Setup sidebar dot remains visible so the user can return
- No animation required for the skip confirmation — just an inline state change

---

## RETURN STATE

If a user navigates away mid-wizard (by clicking a sidebar icon) and returns to Setup later:
- Resume at the last completed step + 1
- Restore any values already entered (store in component state or equivalent — no persistence
  to backend required)
- No "welcome back" messaging needed — just resume cleanly

---

## IMPLEMENTATION RULES

1. **Read the existing sidebar, layout shell, form inputs, buttons, toggles, and card
   components before writing any code.** Every control in this wizard must use an existing
   component. Do not create new base components.

2. **Define the step layout and transition animation once.** All five steps render inside
   the same wrapper component with the same layout grid. Step-specific content is slotted in.
   The transition fires whenever the active step index changes.

3. **No backend required.** All state lives in component memory. The wizard is purely
   presentational with mock completion.

4. **The Solutions hub is the exit destination.** On completion, navigate to whatever route
   currently renders the Solutions home view. Do not build a new landing page.

5. **No modifications to existing views.** Purely additive. All existing routes, components,
   and solution workflows remain untouched.
