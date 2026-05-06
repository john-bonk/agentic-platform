/**
 * Friction gate for the static prototype.
 *
 * IMPORTANT — security framing:
 * The prototype is a client-only static build hosted on GitHub Pages, so this
 * password is bundled into the JavaScript that ships to every visitor. Anyone
 * with browser devtools can read `PROTOTYPE_PASSWORD` from the source. This
 * component is a deliberate *friction gate* — it discourages casual visitors
 * and search crawlers from poking around — not a security boundary. Do not
 * put anything sensitive behind it.
 *
 * Persistence: the unlock flag lives in `sessionStorage`, which means it
 * survives navigation within the tab/window but clears when the visitor
 * closes the tab. Matches the user's "don't re-prompt while nav'ing within
 * the session" requirement.
 */

import { useState, type FormEvent, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PROTOTYPE_PASSWORD = "AgenticOptro!";
const SESSION_KEY = "optro-prototype-unlocked";

function isUnlockedInStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(isUnlockedInStorage);
  const [input, setInput] = useState("");
  const [showError, setShowError] = useState(false);

  if (unlocked) {
    return <>{children}</>;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input === PROTOTYPE_PASSWORD) {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // sessionStorage may be unavailable in private browsing or via a
        // policy block — proceed in-memory for this tab anyway.
      }
      setUnlocked(true);
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background px-4">
      <div className="w-full max-w-sm" data-testid="password-gate">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#266C92] flex items-center justify-center shadow-sm">
            <img
              src={`${import.meta.env.BASE_URL}figmaAssets/auditboard-logo.png`}
              alt=""
              className="w-9 h-auto brightness-0 invert"
            />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Optro Agentic Platform</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vision prototype — enter access password to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-5 shadow-sm space-y-3"
        >
          <div>
            <label
              htmlFor="prototype-password"
              className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mb-1.5 flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              Access password
            </label>
            <Input
              id="prototype-password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (showError) setShowError(false);
              }}
              className={
                showError
                  ? "border-red-300 focus-visible:ring-red-500 dark:border-red-700"
                  : ""
              }
              data-testid="password-gate-input"
            />
            {showError && (
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-1.5" data-testid="password-gate-error">
                Incorrect password — try again.
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#266C92] hover:bg-[#1e5a7a] text-white"
            data-testid="password-gate-submit"
          >
            Unlock prototype
          </Button>
        </form>

        <p className="text-[10px] text-muted-foreground/70 text-center mt-4">
          Friction gate for the prototype demo — not a security boundary.
        </p>
      </div>
    </div>
  );
}
