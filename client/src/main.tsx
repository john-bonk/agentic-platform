import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register all solutions with the framework as a startup side effect.
// See docs/solution-framework.md Part 7 for how to add a new one.
import "./solutions";

// Production builds (e.g. GitHub Pages) have no Express backend — install a
// fetch shim that returns canned responses for /api/* endpoints so the SPA
// degrades gracefully instead of throwing on every query.
if (import.meta.env.PROD) {
  void import("./lib/staticApiShim").then(({ installStaticApiShim }) =>
    installStaticApiShim(),
  );
}

createRoot(document.getElementById("root")!).render(<App />);
