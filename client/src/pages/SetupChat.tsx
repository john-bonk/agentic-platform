import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSetupStore,
  type Industry,
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
import {
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

const STEP_PROMPTS: Record<number, string> = {
  1: "Welcome to Optro. Let's get your workspace set up — should take about a minute. First, tell me about your organization.",
  2: "Now let's connect your data sources. I'll use these to automate evidence collection and pull context for analysis.",
  3: "Which solutions do you want to activate? You can always add more later.",
  4: "Just a few defaults to set — these can all be changed per workflow at any time.",
  5: "All set. Here's what I've configured for your workspace.",
};

interface SetupChatProps {
  onFinish: () => void;
  onSkipConfirmed: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bubble primitives
// ─────────────────────────────────────────────────────────────────────────────

function OptroBubble({ children, animate = false }: { children: React.ReactNode; animate?: boolean }) {
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
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1" style={{ color: ACCENT }}>
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

// Active-step input area: visually attached to the most recent Optro bubble.
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
// Per-step renderers — the answer summary (when step is past) and the inputs
// (when step is active).
// ─────────────────────────────────────────────────────────────────────────────

export default function SetupChat({ onFinish, onSkipConfirmed }: SetupChatProps) {
  const [skipPrompt, setSkipPrompt] = useState(false);
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

  const goNext = () => setStep(Math.min(currentStep + 1, TOTAL_STEPS));
  const handleFinish = () => {
    complete();
    setTimeout(onFinish, 240);
  };

  const connectionCount = useMemo(
    () => Object.values(data.connections).filter(Boolean).length,
    [data.connections],
  );
  const activeSolutions = useMemo(
    () => SOLUTIONS.filter((s) => data.solutions[s.id]),
    [data.solutions],
  );

  // Auto-scroll to bottom whenever the step advances or the active inputs change.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [currentStep]);

  // Summaries shown as the user's "answer" once a step is in the past.
  const stepAnswer = (step: number): React.ReactNode => {
    switch (step) {
      case 1: {
        const parts = [
          data.orgName.trim() || "—",
          data.industry,
          data.complianceScope.length > 0 ? data.complianceScope.join(", ") : "No compliance scope",
        ];
        return parts.join(" · ");
      }
      case 2: {
        if (connectionCount === 0) return "Skipped for now — I'll connect data sources later.";
        const names = CONNECTIONS.filter((c) => data.connections[c.id]).map((c) => c.name);
        return `Connected ${connectionCount}: ${names.join(", ")}`;
      }
      case 3: {
        if (activeSolutions.length === 0) return "No solutions activated yet.";
        return `Activated: ${activeSolutions.map((s) => s.name).join(", ")}`;
      }
      case 4: {
        const trigger = TRIGGER_OPTIONS.find((o) => o.value === data.defaultTrigger)?.label ?? "—";
        const approver =
          data.hitlApprover === "any-admin"
            ? "Any Admin"
            : data.hitlApprover === "assigned-reviewer"
              ? "Assigned reviewer"
              : "Per workflow";
        return `Trigger: ${trigger.replace(" (direct action)", "")} · Approver: ${approver} · Audit: ${data.auditLogging ? "On" : "Off"}`;
      }
      default:
        return null;
    }
  };

  // Inputs panel for the active step.
  const activeInputs = (): React.ReactNode => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 max-w-[480px]">
            <div className="space-y-1.5">
              <Label htmlFor="chat-org-name" className="text-xs">Org name</Label>
              <Input
                id="chat-org-name"
                autoFocus
                value={data.orgName}
                onChange={(e) => updateData("orgName", e.target.value)}
                placeholder="Acme, Inc."
                data-testid="input-org-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Industry</Label>
              <Select
                value={data.industry}
                onValueChange={(v) => updateData("industry", v as Industry)}
              >
                <SelectTrigger data-testid="select-industry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i} data-testid={`option-industry-${i.replace(/\s+/g, "-").toLowerCase()}`}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Compliance scope</Label>
              <div className="flex flex-wrap gap-2">
                {COMPLIANCE_SCOPES.map((scope) => {
                  const active = data.complianceScope.includes(scope);
                  return (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => toggleCompliance(scope)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "text-white border-transparent"
                          : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                      style={active ? { background: ACCENT } : undefined}
                      data-testid={`pill-compliance-${scope.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      {scope}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              onClick={goNext}
              disabled={!data.orgName.trim()}
              className="text-white disabled:opacity-50"
              style={{ background: ACCENT }}
              data-testid="button-step-continue"
            >
              Send <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 max-w-[520px]">
            {CONNECTIONS.map(({ id, name, description, Icon }) => {
              const connected = data.connections[id];
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  data-testid={`connection-tile-${id}`}
                >
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Button
                    type="button"
                    variant={connected ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleConnection(id)}
                    className={
                      connected
                        ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        : "text-white"
                    }
                    style={!connected ? { background: ACCENT } : undefined}
                    data-testid={`button-connect-${id}`}
                  >
                    {connected ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Connected
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
              );
            })}
            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={goNext}
                className="text-white"
                style={{ background: ACCENT }}
                data-testid="button-step-continue"
              >
                {connectionCount > 0 ? "Send" : "Skip for now"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <span className="text-xs text-muted-foreground">
                You can change connections later in Admin
              </span>
            </div>
          </div>
        );

      case 3: {
        const anySelected = Object.values(data.solutions).some(Boolean);
        return (
          <div className="space-y-4 max-w-[560px]">
            <div className="grid grid-cols-2 gap-2.5">
              {SOLUTIONS.map(({ id, name, description }) => {
                const active = data.solutions[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSolution(id)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      active
                        ? "bg-[var(--accent-soft)] border-[var(--accent-color)]/30"
                        : "bg-card border-border hover:border-foreground/20"
                    }`}
                    style={
                      {
                        ["--accent-color" as never]: ACCENT,
                        ["--accent-soft" as never]: `${ACCENT}10`,
                      } as React.CSSProperties
                    }
                    data-testid={`card-solution-${id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium leading-tight">{name}</p>
                      <Switch
                        checked={active}
                        tabIndex={-1}
                        className="pointer-events-none"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </button>
                );
              })}
            </div>
            <Button
              onClick={goNext}
              disabled={!anySelected}
              className="text-white disabled:opacity-50"
              style={{ background: ACCENT }}
              data-testid="button-step-continue"
            >
              Send <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );
      }

      case 4:
        return (
          <div className="space-y-5 max-w-[520px]">
            <div className="space-y-1.5">
              <Label className="text-xs">How should workflows start by default?</Label>
              <div className="grid grid-cols-1 gap-1.5">
                {TRIGGER_OPTIONS.map((opt) => {
                  const active = data.defaultTrigger === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateData("defaultTrigger", opt.value)}
                      className={`text-left text-sm px-3 py-2 rounded-md border transition-colors ${
                        active
                          ? "border-[var(--accent-color)] bg-[var(--accent-soft)]"
                          : "border-border hover:border-foreground/20"
                      }`}
                      style={
                        {
                          ["--accent-color" as never]: ACCENT,
                          ["--accent-soft" as never]: `${ACCENT}10`,
                        } as React.CSSProperties
                      }
                      data-testid={`option-trigger-${opt.value}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Who approves flagged findings by default?</Label>
              <Select
                value={data.hitlApprover}
                onValueChange={(v) => updateData("hitlApprover", v as typeof data.hitlApprover)}
              >
                <SelectTrigger data-testid="select-hitl-approver">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any-admin">Any Admin</SelectItem>
                  <SelectItem value="assigned-reviewer">Assigned reviewer</SelectItem>
                  <SelectItem value="per-workflow">I'll configure per workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <Label className="block text-xs">Log all agentic actions to audit trail?</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Recommended for SOX and regulated workloads.
                </p>
              </div>
              <Switch
                checked={data.auditLogging}
                onCheckedChange={(v) => updateData("auditLogging", v)}
                data-testid="switch-audit-logging"
              />
            </div>

            <Button
              onClick={goNext}
              className="text-white"
              style={{ background: ACCENT }}
              data-testid="button-step-finish"
            >
              Finish setup <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 max-w-[520px]">
            <Card>
              <CardContent className="p-4 space-y-3">
                <SummaryRow label="Organization" value={data.orgName || "—"} />
                <SummaryRow
                  label="Solutions activated"
                  value={
                    activeSolutions.length === 0 ? (
                      <span className="text-muted-foreground">None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {activeSolutions.map((s) => (
                          <Badge
                            key={s.id}
                            variant="secondary"
                            className="text-[10px] font-medium"
                            style={{ background: `${ACCENT}14`, color: ACCENT }}
                            data-testid={`summary-solution-${s.id}`}
                          >
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    )
                  }
                />
                <SummaryRow label="Connections added" value={`${connectionCount} connected`} />
                <SummaryRow
                  label="Default trigger"
                  value={
                    TRIGGER_OPTIONS.find((o) => o.value === data.defaultTrigger)?.label ?? "—"
                  }
                />
              </CardContent>
            </Card>
            <Button
              onClick={handleFinish}
              className="text-white"
              style={{ background: ACCENT }}
              data-testid="button-open-solutions"
            >
              Open Solutions <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // Render the conversation: every prior step as Q + A, plus the active step Q + inputs.
  const transcript: React.ReactNode[] = [];
  for (let s = 1; s <= currentStep; s++) {
    transcript.push(
      <OptroBubble key={`q-${s}`} animate={s === currentStep}>
        {STEP_PROMPTS[s]}
      </OptroBubble>,
    );
    if (s < currentStep) {
      transcript.push(<UserBubble key={`a-${s}`}>{stepAnswer(s)}</UserBubble>);
    }
  }

  const showSkip = currentStep < TOTAL_STEPS;

  return (
    <div className="absolute inset-0 flex flex-col bg-white dark:bg-background">
      {/* Top-right meta cluster — mirrors the wizard's StepFrame for cross-mode parity. */}
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
                <span>Skip for now? You can always return via the Setup icon.</span>
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

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 pt-24 pb-10"
        data-testid="chat-scroll-area"
      >
        <div className="max-w-[720px] mx-auto space-y-6">
          {transcript}
          <ActiveInputs key={`active-${currentStep}`}>{activeInputs()}</ActiveInputs>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground pt-0.5">
        {label}
      </span>
      <div className="text-sm text-right max-w-[60%]">{value}</div>
    </div>
  );
}
