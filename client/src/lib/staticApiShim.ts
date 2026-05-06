/**
 * Static-mode API shim
 *
 * The prototype is normally served by an Express backend on port 5000. When
 * the static build is hosted on GitHub Pages there's no server, so any
 * `/api/*` fetch would 404 and propagate errors into React Query.
 *
 * This shim monkey-patches `window.fetch` in production-only and returns
 * sensible canned responses for the known endpoints the SPA still calls. The
 * canon framework demo (Solutions Home → SOX / TPRM / Audit Assessment →
 * focus pages → inline HITL/blocker resolution) doesn't depend on these
 * endpoints because all of that data is sourced from client-side data
 * modules (`masterControlsList`, `tprmSteps`, `masterEntityList`, etc.).
 *
 * For surfaces that DO call /api (Workflow Builder, Reporting, etc.) the
 * shim returns empty arrays/objects so the page renders an empty state
 * instead of throwing.
 */

interface ShimRoute {
  /** Path or regex that the request URL must match. */
  match: (url: URL) => boolean;
  /** JSON body to return. */
  body: unknown;
}

const seededWorkflows = [
  { id: "wf-tariff", name: "Tariff Impact Mitigation Workflow", description: "Demo workflow", status: "active", tags: [], visibility: "team", version: 1, ownerId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "wf-ma-audit", name: "M&A Due Diligence Audit", description: "Demo workflow", status: "active", tags: [], visibility: "team", version: 1, ownerId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "wf-incident", name: "Log4j Incident Response Workflow", description: "Demo workflow", status: "active", tags: [], visibility: "team", version: 1, ownerId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const ROUTES: ShimRoute[] = [
  { match: (u) => u.pathname === "/api/health", body: { status: "ok", static: true } },
  { match: (u) => u.pathname === "/api/workflows", body: seededWorkflows },
  { match: (u) => /^\/api\/workflows\/[^/]+$/.test(u.pathname), body: { workflow: seededWorkflows[0], nodes: [], edges: [] } },
  { match: (u) => /^\/api\/workflows\/[^/]+\/nodes$/.test(u.pathname), body: [] },
  { match: (u) => /^\/api\/workflows\/[^/]+\/edges$/.test(u.pathname), body: [] },
  { match: (u) => u.pathname === "/api/templates", body: [] },
  { match: (u) => u.pathname === "/api/node-types", body: [] },
  { match: (u) => u.pathname === "/api/controls", body: [] },
  { match: (u) => u.pathname === "/api/tasks", body: [] },
  { match: (u) => u.pathname === "/api/reports", body: [] },
  { match: (u) => u.pathname === "/api/dashboard/metrics", body: { overall: 0, controls: { total: 0, effective: 0 }, risks: { total: 0, high: 0, medium: 0, low: 0 } } },
  {
    match: (u) => u.pathname === "/api/dashboard/telemetry",
    body: {
      workflows: { total: 0, active: 0, completed: 0, pending: 0, errorRate: 0 },
      compliance: { overallScore: 0, controlsEffective: 0, controlsTotal: 0, risksHigh: 0, risksMedium: 0, risksLow: 0 },
      realtime: { activeProcesses: 0, queuedTasks: 0, avgResponseTime: 0, throughput: 0 },
      trends: [],
      nodeStats: { totalNodes: 0, controlNodes: 0, riskNodes: 0, approvalNodes: 0 },
    },
  },
  { match: (u) => u.pathname === "/api/assistant/chat", body: { content: "Static demo — assistant disabled. Run the prototype locally for full assistant functionality.", actions: [] } },
  { match: (u) => u.pathname === "/api/assistant/home-chat", body: { content: "Static demo — assistant disabled. Run the prototype locally for full assistant functionality.", resources: [], actions: [] } },
  { match: (u) => u.pathname === "/api/assistant/generate-workflow", body: { content: "Static demo — workflow generation disabled.", actions: [] } },
  { match: (u) => u.pathname === "/api/assistant/analyze", body: { content: "Static demo — workflow analysis disabled.", actions: [] } },
  { match: (u) => u.pathname === "/api/generate-report", body: { reportId: "static-demo", title: "Static Demo Report", sections: [], toc: [], createdAt: new Date().toISOString() } },
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Install a fetch shim that intercepts /api/* requests and returns canned
 * data instead of hitting the network. Idempotent — safe to call once at
 * startup.
 */
export function installStaticApiShim(): void {
  if (typeof window === "undefined") return;
  if ((window as unknown as { __staticApiShim?: true }).__staticApiShim) return;
  (window as unknown as { __staticApiShim?: true }).__staticApiShim = true;

  const origFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let urlString: string;
    if (typeof input === "string") urlString = input;
    else if (input instanceof URL) urlString = input.toString();
    else urlString = input.url;

    let url: URL;
    try {
      url = new URL(urlString, window.location.origin);
    } catch {
      return origFetch(input, init);
    }

    if (!url.pathname.startsWith("/api/")) {
      return origFetch(input, init);
    }

    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

    // POST/PATCH/DELETE — return a generic success response so mutations don't
    // throw. The shim doesn't persist anything; the page will simply re-fetch
    // the GET endpoint after invalidation and get the same canned data.
    if (method !== "GET") {
      return jsonResponse({ ok: true, static: true });
    }

    for (const route of ROUTES) {
      if (route.match(url)) {
        return jsonResponse(route.body);
      }
    }

    // Unknown /api endpoint — return an empty array. Most queries expect a
    // list; pages that get back an unexpected shape will simply render
    // empty states rather than crashing.
    return jsonResponse([]);
  };
}
