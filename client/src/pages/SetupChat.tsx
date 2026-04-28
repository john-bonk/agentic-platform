import { useEffect, useMemo, useRef, useState } from "react";
import {
  useSetupStore,
  type ComplianceScope,
  type ConnectionId,
  type DefaultTrigger,
  type Industry,
  type SolutionId,
} from "@/lib/setupStore";
import {
  ACCENT,
  COMPLIANCE_SCOPES,
  CONNECTIONS,
  INDUSTRIES,
  SOLUTIONS,
  TOTAL_STEPS,
  TRIGGER_OPTIONS,
} from "@/lib/setupConfig";
import { ArrowUp, Sparkles } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Conversational copy — phrased like an actual chat, not a form prompt.
// ─────────────────────────────────────────────────────────────────────────────
const STEP_PROMPTS: Record<number, string> = {
  1: "Hi — I'm Optro. Let's get your workspace set up. First, what's your organization called, and what should I know about your industry and compliance scope?",
  2: "Got it. Now, which data sources should I connect? I'll use these for evidence collection and context. Tap any to toggle, or skip and I'll come back to it.",
  3: "Which solutions do you want active? You can always add more later.",
  4: "Just a few defaults — all changeable per workflow.",
  5: "All set. Here's what I've configured.",
};

interface SetupChatProps {
  onFinish: () => void;
  onSkipConfirmed: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bubble + chip primitives
// ─────────────────────────────────────────────────────────────────────────────

function OptroBubble({
  children,
  animate = false,
}: {
  children: React.ReactNode;
  animate?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 ${animate ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""}`}
      data-testid="bubble-optro"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${ACCENT}14` }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1"
          style={{ color: ACCENT }}
        >
          Optro
        </p>
        <div className="text-sm text-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300"
      data-testid="bubble-user"
    >
      <div
        className="max-w-[78%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white"
        style={{ background: ACCENT }}
      >
        {children}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      className="flex items-start gap-3 animate-in fade-in duration-200"
      data-testid="typing-indicator"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${ACCENT}14` }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
      </div>
      <div className="flex items-center gap-1 mt-3 ml-0.5">
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: ACCENT, animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: ACCENT, animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: ACCENT, animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
      {children}
    </p>
  );
}

// Subtle pill chip — the only selectable primitive used in chat mode.
function Chip({
  active,
  onClick,
  children,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
        active
          ? "border-transparent text-white shadow-sm"
          : "bg-transparent border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground"
      }`}
      style={active ? { background: ACCENT } : undefined}
    >
      {children}
    </button>
  );
}

// Active-step chip area — visually attached to the most recent Optro bubble.
function ActiveInputs({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="ml-10 animate-in fade-in slide-in-from-bottom-2 duration-300"
      data-testid="chat-active-inputs"
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function SetupChat({ onFinish, onSkipConfirmed }: SetupChatProps) {
  const [skipPrompt, setSkipPrompt] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const {
    currentStep,
    data,
    setStep,
    updateData,
    toggleConnection,
    toggleSolution,
    toggleCompliance,
    complete,
  } = useSetupStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  const connectionCount = useMemo(
    () => Object.values(data.connections).filter(Boolean).length,
    [data.connections],
  );
  const activeSolutions = useMemo(
    () => SOLUTIONS.filter((s) => data.solutions[s.id]),
    [data.solutions],
  );
  const anySolutionSelected = activeSolutions.length > 0;

  // advance() simulates a brief "Optro is typing" beat between turns —
  // sells the chat feel and gives the user time to register their answer
  // landing in the transcript before the next prompt appears.
  const advance = (next: number) => {
    setIsThinking(true);
    setTimeout(() => {
      setStep(next);
      setIsThinking(false);
    }, 650);
  };

  const handleSend = () => {
    if (currentStep < TOTAL_STEPS) {
      advance(currentStep + 1);
    } else {
      complete();
      setTimeout(onFinish, 240);
    }
  };

  // Auto-scroll to bottom on step change OR when the typing indicator toggles.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [currentStep, isThinking]);

  // Per-step send-disabled rules.
  const sendDisabled = (() => {
    switch (currentStep) {
      case 1:
        return !data.orgName.trim();
      case 3:
        return !anySolutionSelected;
      default:
        return false;
    }
  })();

  // Composer label: short on most steps (just an arrow), explicit on step 5.
  const sendLabel = currentStep === TOTAL_STEPS ? "Open Solutions" : null;

  // Composer helper text — inline, conversational, replaces the wizard's
  // bordered helper rows.
  const composerHelper = (() => {
    switch (currentStep) {
      case 2:
        return connectionCount === 0
          ? "Skip and I'll come back to this."
          : `${connectionCount} connected — send when ready`;
      case 3:
        return anySolutionSelected
          ? `${activeSolutions.length} selected`
          : "Tap at least one solution to continue";
      case 4:
        return "Defaults set — change per workflow anytime";
      case 5:
        return "Ready to go";
      default:
        return "";
    }
  })();

  // Summaries shown as the user's "answer" once a step is in the past.
  const stepAnswer = (step: number): React.ReactNode => {
    switch (step) {
      case 1: {
        const parts = [
          data.orgName.trim() || "—",
          data.industry,
          data.complianceScope.length > 0
            ? data.complianceScope.join(", ")
            : "no compliance scope",
        ];
        return parts.join(" · ");
      }
      case 2: {
        if (connectionCount === 0) return "Skip for now.";
        const names = CONNECTIONS.filter((c) => data.connections[c.id]).map((c) => c.name);
        return `Connected: ${names.join(", ")}`;
      }
      case 3: {
        if (activeSolutions.length === 0) return "None.";
        return `Activated: ${activeSolutions.map((s) => s.name).join(", ")}`;
      }
      case 4: {
        const trigger =
          TRIGGER_OPTIONS.find((o) => o.value === data.defaultTrigger)?.label ?? "—";
        const approver =
          data.hitlApprover === "any-admin"
            ? "Any Admin"
            : data.hitlApprover === "assigned-reviewer"
              ? "Assigned reviewer"
              : "Per workflow";
        return `${trigger.replace(" (direct action)", "")} · ${approver} · audit ${data.auditLogging ? "on" : "off"}`;
      }
      default:
        return null;
    }
  };

  // Inline chip strips for the active step. NO cards, NO labeled form rows,
  // NO Connect/toggle buttons — just subtle selectable chips.
  const activeChips = (): React.ReactNode => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 max-w-[560px]">
            <div>
              <FieldLabel>Industry</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {INDUSTRIES.map((i) => (
                  <Chip
                    key={i}
                    active={data.industry === i}
                    onClick={() => updateData("industry", i as Industry)}
                    testId={`chip-industry-${i.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {i}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Compliance scope · multi-select</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {COMPLIANCE_SCOPES.map((scope) => (
                  <Chip
                    key={scope}
                    active={data.complianceScope.includes(scope)}
                    onClick={() => toggleCompliance(scope as ComplianceScope)}
                    testId={`chip-compliance-${scope.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {scope}
                  </Chip>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              Type your org name in the message bar below.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-2 max-w-[560px]">
            <div className="flex flex-wrap gap-1.5">
              {CONNECTIONS.map((c) => (
                <Chip
                  key={c.id}
                  active={!!data.connections[c.id]}
                  onClick={() => toggleConnection(c.id as ConnectionId)}
                  testId={`chip-connection-${c.id}`}
                >
                  {c.name}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              GRC platform · document store · HRIS · ERP. Tap to toggle.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-2 max-w-[560px]">
            <div className="flex flex-wrap gap-1.5">
              {SOLUTIONS.map((s) => (
                <Chip
                  key={s.id}
                  active={!!data.solutions[s.id]}
                  onClick={() => toggleSolution(s.id as SolutionId)}
                  testId={`chip-solution-${s.id}`}
                >
                  {s.name}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pick at least one. You can add more later.
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 max-w-[560px]">
            <div>
              <FieldLabel>Default trigger</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {TRIGGER_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    active={data.defaultTrigger === opt.value}
                    onClick={() => updateData("defaultTrigger", opt.value as DefaultTrigger)}
                    testId={`chip-trigger-${opt.value}`}
                  >
                    {opt.label.replace(" (direct action)", "")}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>HITL approver</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                <Chip
                  active={data.hitlApprover === "any-admin"}
                  onClick={() => updateData("hitlApprover", "any-admin")}
                  testId="chip-approver-any-admin"
                >
                  Any Admin
                </Chip>
                <Chip
                  active={data.hitlApprover === "assigned-reviewer"}
                  onClick={() => updateData("hitlApprover", "assigned-reviewer")}
                  testId="chip-approver-assigned-reviewer"
                >
                  Assigned reviewer
                </Chip>
                <Chip
                  active={data.hitlApprover === "per-workflow"}
                  onClick={() => updateData("hitlApprover", "per-workflow")}
                  testId="chip-approver-per-workflow"
                >
                  Per workflow
                </Chip>
              </div>
            </div>
            <div>
              <FieldLabel>Audit logging</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                <Chip
                  active={data.auditLogging}
                  onClick={() => updateData("auditLogging", true)}
                  testId="chip-audit-on"
                >
                  On
                </Chip>
                <Chip
                  active={!data.auditLogging}
                  onClick={() => updateData("auditLogging", false)}
                  testId="chip-audit-off"
                >
                  Off
                </Chip>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-1.5 text-sm max-w-[560px]" data-testid="chat-summary">
            <SummaryLine
              label="Org"
              value={`${data.orgName || "—"} · ${data.industry}`}
            />
            <SummaryLine
              label="Compliance"
              value={
                data.complianceScope.length > 0
                  ? data.complianceScope.join(", ")
                  : "—"
              }
            />
            <SummaryLine
              label="Connections"
              value={
                connectionCount > 0
                  ? CONNECTIONS.filter((c) => data.connections[c.id])
                      .map((c) => c.name)
                      .join(", ")
                  : "None yet"
              }
            />
            <SummaryLine
              label="Solutions"
              value={
                activeSolutions.length > 0
                  ? activeSolutions.map((s) => s.name).join(", ")
                  : "None yet"
              }
            />
            <SummaryLine
              label="Defaults"
              value={`${TRIGGER_OPTIONS.find((o) => o.value === data.defaultTrigger)?.label.replace(" (direct action)", "") ?? "—"} · audit ${data.auditLogging ? "on" : "off"}`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Render the conversation: every prior step as Optro Q + user A,
  // plus the active step Q + chips (or typing indicator while transitioning).
  const transcript: React.ReactNode[] = [];
  for (let s = 1; s <= currentStep; s++) {
    transcript.push(
      <OptroBubble key={`q-${s}`} animate={s === currentStep && !isThinking}>
        {STEP_PROMPTS[s]}
      </OptroBubble>,
    );
    if (s < currentStep) {
      transcript.push(<UserBubble key={`a-${s}`}>{stepAnswer(s)}</UserBubble>);
    }
  }

  const showSkip = currentStep < TOTAL_STEPS;
  const showComposerInput = currentStep === 1;
  const composerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !sendDisabled) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white dark:bg-background">
      {/* Top-right meta cluster — mirrors the wizard's StepFrame for parity. */}
      <div className="absolute top-6 right-8 flex flex-col items-end gap-2 z-10">
        <span
          className="text-xs font-mono text-muted-foreground tabular-nums"
          data-testid="setup-step-counter"
        >
          {currentStep} of {TOTAL_STEPS}
        </span>
        {showSkip && (
          <div className="text-xs">
            {!skipPrompt ? (
              <button
                type="button"
                onClick={() => setSkipPrompt(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-skip-setup"
              >
                Skip setup
              </button>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Skip for now? You can return via the Setup icon.</span>
                <button
                  type="button"
                  onClick={onSkipConfirmed}
                  className="font-medium hover:underline"
                  style={{ color: ACCENT }}
                  data-testid="button-skip-confirm"
                >
                  Yes, skip
                </button>
                <button
                  type="button"
                  onClick={() => setSkipPrompt(false)}
                  className="hover:text-foreground"
                  data-testid="button-skip-cancel"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrollable transcript */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 pt-24 pb-6"
        data-testid="chat-scroll-area"
      >
        <div className="max-w-[720px] mx-auto space-y-6">
          {transcript}
          {isThinking ? (
            <TypingIndicator />
          ) : (
            <ActiveInputs key={`active-${currentStep}`}>{activeChips()}</ActiveInputs>
          )}
        </div>
      </div>

      {/* Fixed-bottom composer — the chat-app primitive that most distinguishes
          this mode from the wizard's centered card. */}
      <div className="border-t border-border bg-white dark:bg-background px-8 py-3">
        <div className="max-w-[720px] mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {showComposerInput ? (
              <input
                type="text"
                value={data.orgName}
                onChange={(e) => updateData("orgName", e.target.value)}
                onKeyDown={composerKeyDown}
                placeholder="Type your organization name…"
                autoFocus
                disabled={isThinking}
                data-testid="composer-input"
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              />
            ) : (
              <span
                className="text-xs text-muted-foreground"
                data-testid="composer-helper"
              >
                {composerHelper}
              </span>
            )}
          </div>

          {sendLabel ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={sendDisabled || isThinking}
              data-testid="composer-send"
              className="text-xs font-medium px-4 h-9 rounded-full text-white disabled:opacity-40 transition-opacity inline-flex items-center gap-1.5"
              style={{ background: ACCENT }}
            >
              {sendLabel}
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={sendDisabled || isThinking}
              data-testid="composer-send"
              aria-label="Send"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-opacity flex-shrink-0"
              style={{ background: ACCENT }}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground w-24 flex-shrink-0">
        {label}
      </span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
