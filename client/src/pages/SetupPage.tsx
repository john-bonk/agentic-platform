import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
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
  type SetupMode,
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
  ListChecks,
  MessageSquare,
} from "lucide-react";
import SetupChat from "./SetupChat";

// ─────────────────────────────────────────────────────────────────────────────
// Step transition wrapper — fade + 8px translate, ~400ms total.
// Outgoing: 180ms ease-in. Incoming: 220ms ease-out. Counter updates mid-transition.
// ─────────────────────────────────────────────────────────────────────────────

interface StepFrameProps {
  step: number;
  total: number;
  showSkip: boolean;
  onSkipConfirmed: () => void;
  children: React.ReactNode;
}

function StepFrame({ step, total, showSkip, onSkipConfirmed, children }: StepFrameProps) {
  const [skipPrompt, setSkipPrompt] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [renderedStep, setRenderedStep] = useState(step);
  const [renderedChildren, setRenderedChildren] = useState(children);
  const [renderedCounter, setRenderedCounter] = useState(step);

  useEffect(() => {
    if (step === renderedStep) {
      setRenderedChildren(children);
      return;
    }
    setPhase("out");
    const outTimer = setTimeout(() => {
      setRenderedCounter(step);
      setRenderedChildren(children);
      setRenderedStep(step);
      setPhase("in");
    }, 180);
    return () => clearTimeout(outTimer);
  }, [step, children, renderedStep]);

  return (
    <div className="absolute inset-0 flex flex-col bg-white dark:bg-background">
      {/* Top-right meta cluster */}
      <div className="absolute top-6 right-8 flex flex-col items-end gap-2 z-10">
        <span
          className="text-xs font-mono text-muted-foreground tabular-nums"
          data-testid="setup-step-counter"
        >
          {renderedCounter} of {total}
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
                  className="font-medium text-[var(--accent-color)] hover:underline"
                  style={{ ["--accent-color" as never]: ACCENT } as React.CSSProperties}
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

      {/* Centered content column */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div
          className="w-full max-w-[520px] transition-all"
          style={{
            opacity: phase === "in" ? 1 : 0,
            transform: phase === "in" ? "translateY(0)" : "translateY(-8px)",
            transitionDuration: phase === "in" ? "220ms" : "180ms",
            transitionTimingFunction: phase === "in" ? "ease-out" : "ease-in",
          }}
          data-testid="setup-step-content"
        >
          {renderedChildren}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared step header
// ─────────────────────────────────────────────────────────────────────────────

interface StepHeaderProps {
  index: number;
  total: number;
  title: string;
  subtitle: string;
}

function StepHeader({ index, total, title, subtitle }: StepHeaderProps) {
  return (
    <div className="mb-10 space-y-3">
      <p
        className="text-[11px] font-mono uppercase tracking-[0.18em]"
        style={{ color: ACCENT }}
        data-testid="text-step-label"
      >
        Step {index} of {total}
      </p>
      <h1 className="text-3xl font-bold tracking-tight leading-tight" data-testid="text-step-title">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground" data-testid="text-step-subtitle">
        {subtitle}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode toggle — segmented control between Wizard and Chat experiences.
// Always visible at top-center across both modes so the user can flip freely.
// ─────────────────────────────────────────────────────────────────────────────

function ModeToggle({ mode, onChange }: { mode: SetupMode; onChange: (m: SetupMode) => void }) {
  const options: { value: SetupMode; label: string; Icon: typeof ListChecks }[] = [
    { value: "wizard", label: "Wizard", Icon: ListChecks },
    { value: "chat", label: "Chat", Icon: MessageSquare },
  ];
  return (
    <div
      className="absolute top-6 left-1/2 -translate-x-1/2 z-20 inline-flex items-center p-0.5 rounded-full border bg-card/90 backdrop-blur shadow-sm"
      data-testid="setup-mode-toggle"
    >
      {options.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              active
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={active ? { background: ACCENT } : undefined}
            data-testid={`button-mode-${value}`}
            aria-pressed={active}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function SetupPage() {
  const [, setLocation] = useLocation();
  const {
    currentStep,
    mode,
    data,
    setStep,
    setMode,
    updateData,
    toggleConnection,
    toggleSolution,
    toggleCompliance,
    complete,
  } = useSetupStore();

  const goNext = () => setStep(Math.min(currentStep + 1, TOTAL_STEPS));
  const exitToHome = () => setLocation("/");

  const handleFinish = () => {
    complete();
    // Brief exhale before navigating, matching the standard transition feel.
    setTimeout(() => setLocation("/"), 240);
  };

  const connectionCount = useMemo(
    () => Object.values(data.connections).filter(Boolean).length,
    [data.connections],
  );
  const activeSolutions = useMemo(
    () => SOLUTIONS.filter((s) => data.solutions[s.id]),
    [data.solutions],
  );

  // ───── Step content ─────
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <StepHeader
              index={1}
              total={TOTAL_STEPS}
              title="Tell us about your org"
              subtitle="This helps Optro configure your workspace intelligently."
            />
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="org-name">Org name</Label>
                <Input
                  id="org-name"
                  autoFocus
                  value={data.orgName}
                  onChange={(e) => updateData("orgName", e.target.value)}
                  placeholder="Acme, Inc."
                  data-testid="input-org-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
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
              <div className="space-y-2">
                <Label>Compliance scope</Label>
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
            </div>
            <div className="mt-10">
              <Button
                onClick={goNext}
                disabled={!data.orgName.trim()}
                className="w-full text-white disabled:opacity-50"
                style={{ background: ACCENT }}
                data-testid="button-step-continue"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <StepHeader
              index={2}
              total={TOTAL_STEPS}
              title="Connect your data sources"
              subtitle="Optro uses these to automate evidence collection and analysis."
            />
            <div className="space-y-3">
              {CONNECTIONS.map(({ id, name, description, Icon }) => {
                const connected = data.connections[id];
                return (
                  <div
                    key={id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                    data-testid={`connection-tile-${id}`}
                  >
                    <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
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
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              You can add or change connections later in Admin
            </p>
            <div className="mt-8 space-y-3">
              <Button
                onClick={goNext}
                className="w-full text-white"
                style={{ background: ACCENT }}
                data-testid="button-step-continue"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                type="button"
                onClick={goNext}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                data-testid="button-step-skip-now"
              >
                Skip for now
              </button>
            </div>
          </>
        );

      case 3: {
        const anySelected = Object.values(data.solutions).some(Boolean);
        return (
          <>
            <StepHeader
              index={3}
              total={TOTAL_STEPS}
              title="Which solutions do you need?"
              subtitle="Activate the workflows your team will run. You can add more later."
            />
            <div className="grid grid-cols-2 gap-3">
              {SOLUTIONS.map(({ id, name, description }) => {
                const active = data.solutions[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSolution(id)}
                    className={`text-left p-4 rounded-lg border transition-all ${
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
                    <div className="flex items-start justify-between gap-3 mb-1.5">
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
            <div className="mt-10">
              <Button
                onClick={goNext}
                disabled={!anySelected}
                className="w-full text-white disabled:opacity-50"
                style={{ background: ACCENT }}
                data-testid="button-step-continue"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        );
      }

      case 4:
        return (
          <>
            <StepHeader
              index={4}
              total={TOTAL_STEPS}
              title="Set your defaults"
              subtitle="These can be changed per workflow at any time."
            />
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>How should workflows start by default?</Label>
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

              <div className="space-y-2">
                <Label>Who approves flagged findings by default?</Label>
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
                  <Label className="block">Log all agentic actions to audit trail?</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recommended for SOX and regulated workloads.
                  </p>
                </div>
                <Switch
                  checked={data.auditLogging}
                  onCheckedChange={(v) => updateData("auditLogging", v)}
                  data-testid="switch-audit-logging"
                />
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Advanced configuration is available in Admin
            </p>

            <div className="mt-8">
              <Button
                onClick={goNext}
                className="w-full text-white"
                style={{ background: ACCENT }}
                data-testid="button-step-finish"
              >
                Finish setup <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <StepHeader
              index={5}
              total={TOTAL_STEPS}
              title="You're ready."
              subtitle="Your workspace is configured. Let's get to work."
            />
            <Card>
              <CardContent className="p-5 space-y-4">
                <SummaryRow label="Organization" value={data.orgName || "—"} />
                <SummaryRow
                  label="Solutions activated"
                  value={
                    activeSolutions.length === 0 ? (
                      <span className="text-muted-foreground">None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
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
                <SummaryRow
                  label="Connections added"
                  value={`${connectionCount} connected`}
                />
                <SummaryRow
                  label="Default trigger"
                  value={
                    TRIGGER_OPTIONS.find((o) => o.value === data.defaultTrigger)?.label ?? "—"
                  }
                />
              </CardContent>
            </Card>
            <div className="mt-8">
              <Button
                onClick={handleFinish}
                className="w-full text-white"
                style={{ background: ACCENT }}
                data-testid="button-open-solutions"
              >
                Open Solutions <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const showSkip = currentStep < TOTAL_STEPS;

  return (
    <AppLayout showSideNav={false}>
      <div className="relative w-full h-full">
        <ModeToggle mode={mode} onChange={setMode} />
        {mode === "wizard" ? (
          <StepFrame
            step={currentStep}
            total={TOTAL_STEPS}
            showSkip={showSkip}
            onSkipConfirmed={exitToHome}
          >
            {renderStep()}
          </StepFrame>
        ) : (
          <SetupChat onFinish={exitToHome} onSkipConfirmed={exitToHome} />
        )}
      </div>
    </AppLayout>
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

