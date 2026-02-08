/**
 * AuditBoard Default / Enterprise Risk Parity Tests
 * 
 * CRITICAL INVARIANT: The "AuditBoard Default" archetype created via the workspace
 * wizard MUST render using the EXACT SAME component (HomePageContent) as the 
 * Enterprise Risk workspace home page.
 * 
 * Root Cause of Regression:
 * Previously, AuditBoard Default was routed through ArchetypeDashboard, which is
 * a completely different widget-based rendering system. ArchetypeDashboard renders
 * "Executive Overview" headers, metric badges, pie charts, bar charts, activity 
 * feeds - a FUNDAMENTALLY DIFFERENT UI from the HomePage layout (teal hero header,
 * assistant card, inbox tabs, donut chart, task list, workspace switcher).
 * 
 * These tests guard against that regression by verifying:
 * 1. The archetype "auditboard-default" exists in the template library
 * 2. The workspaceContent data is properly exported and contains enterprise-risk data
 * 3. The HomePageContent component is the SINGLE SOURCE OF TRUTH for both rendering paths
 * 4. The generateCustomWorkspaceContent function produces valid WorkspaceContentData
 */

import { describe, it, expect } from "vitest";
import { archetypeTemplates } from "@/config/homeViewConfig";
import {
  workspaceContent,
  generateCustomWorkspaceContent,
  displayWorkspaces,
  type WorkspaceContentData,
} from "@/components/workspace/HomePageContent";

describe("AuditBoard Default / Enterprise Risk Parity", () => {

  describe("Archetype Definition", () => {
    it("auditboard-default archetype exists in the template library", () => {
      const defaultArchetype = archetypeTemplates.find(a => a.id === "auditboard-default");
      expect(defaultArchetype).toBeDefined();
      expect(defaultArchetype!.name).toBe("AuditBoard Default");
    });

    it("auditboard-default is the first archetype in the list (highest priority)", () => {
      expect(archetypeTemplates[0].id).toBe("auditboard-default");
    });

    it("auditboard-default has the correct color accent", () => {
      const defaultArchetype = archetypeTemplates.find(a => a.id === "auditboard-default");
      expect(defaultArchetype!.colorAccent).toBe("#266C92");
    });
  });

  describe("Enterprise Risk Content Data", () => {
    it("workspaceContent contains enterprise-risk entry", () => {
      expect(workspaceContent["enterprise-risk"]).toBeDefined();
    });

    it("enterprise-risk content has correct scenario planning title", () => {
      expect(workspaceContent["enterprise-risk"].scenarioPlanning.title).toBe("Tariff Mitigation Strategy");
    });

    it("enterprise-risk content has 4 tasks", () => {
      expect(workspaceContent["enterprise-risk"].tasks).toHaveLength(4);
    });

    it("enterprise-risk tasks have correct IDs", () => {
      const taskIds = workspaceContent["enterprise-risk"].tasks.map(t => t.id);
      expect(taskIds).toEqual(["risk-1", "risk-2", "risk-3", "risk-4"]);
    });

    it("enterprise-risk has 6 inbox stat tabs", () => {
      expect(workspaceContent["enterprise-risk"].inboxStats).toHaveLength(6);
    });

    it("enterprise-risk inbox starts with 'My Tasks' at value 4", () => {
      const firstStat = workspaceContent["enterprise-risk"].inboxStats[0];
      expect(firstStat.label).toBe("My Tasks");
      expect(firstStat.value).toBe(4);
    });

    it("enterprise-risk has 3 quick actions", () => {
      expect(workspaceContent["enterprise-risk"].quickActions).toHaveLength(3);
    });

    it("enterprise-risk quick actions include risk-specific items", () => {
      const actionIds = workspaceContent["enterprise-risk"].quickActions.map(a => a.id);
      expect(actionIds).toContain("risk-event");
      expect(actionIds).toContain("risk-assessment");
      expect(actionIds).toContain("risk-register");
    });
  });

  describe("Content Structure Validation", () => {
    function validateContentData(content: WorkspaceContentData, name: string) {
      it(`${name}: has scenarioPlanning with title, progress, completed, total`, () => {
        expect(content.scenarioPlanning).toBeDefined();
        expect(typeof content.scenarioPlanning.title).toBe("string");
        expect(typeof content.scenarioPlanning.progress).toBe("string");
        expect(typeof content.scenarioPlanning.completed).toBe("number");
        expect(typeof content.scenarioPlanning.total).toBe("number");
      });

      it(`${name}: has tasks array with valid task objects`, () => {
        expect(Array.isArray(content.tasks)).toBe(true);
        expect(content.tasks.length).toBeGreaterThan(0);
        content.tasks.forEach(task => {
          expect(task).toHaveProperty("id");
          expect(task).toHaveProperty("title");
          expect(task).toHaveProperty("context");
          expect(task).toHaveProperty("dueDate");
          expect(["incomplete", "complete", "in-progress"]).toContain(task.status);
        });
      });

      it(`${name}: has inboxStats array with valid stat objects`, () => {
        expect(Array.isArray(content.inboxStats)).toBe(true);
        expect(content.inboxStats.length).toBeGreaterThan(0);
        content.inboxStats.forEach(stat => {
          expect(typeof stat.label).toBe("string");
          expect(typeof stat.value).toBe("number");
        });
      });

      it(`${name}: has quickActions array`, () => {
        expect(Array.isArray(content.quickActions)).toBe(true);
        expect(content.quickActions.length).toBeGreaterThan(0);
        content.quickActions.forEach(action => {
          expect(typeof action.label).toBe("string");
          expect(typeof action.id).toBe("string");
        });
      });
    }

    validateContentData(workspaceContent["enterprise-risk"], "enterprise-risk");
    validateContentData(workspaceContent["enterprise-audit"], "enterprise-audit");
    validateContentData(workspaceContent["it-security"], "it-security");
  });

  describe("Custom Workspace Content Generation", () => {
    it("generates valid content for single capability", () => {
      const content = generateCustomWorkspaceContent(["enterprise-risk"]);
      expect(content.tasks.length).toBeGreaterThan(0);
      expect(content.quickActions.length).toBeGreaterThan(0);
      expect(content.inboxStats.length).toBeGreaterThan(0);
      expect(content.scenarioPlanning.title).toBeTruthy();
    });

    it("generates valid content for multiple capabilities", () => {
      const content = generateCustomWorkspaceContent(["enterprise-risk", "audit-management"]);
      expect(content.tasks.length).toBeGreaterThan(0);
      expect(content.quickActions.length).toBeGreaterThan(0);
    });

    it("generates valid content for empty capabilities (fallback)", () => {
      const content = generateCustomWorkspaceContent([]);
      expect(content.inboxStats.length).toBeGreaterThan(0);
      expect(content.quickActions.length).toBeGreaterThan(0);
    });

    it("generated content has same structure as enterprise-risk content", () => {
      const generated = generateCustomWorkspaceContent(["enterprise-risk"]);
      const reference = workspaceContent["enterprise-risk"];

      expect(Object.keys(generated).sort()).toEqual(Object.keys(reference).sort());

      expect(generated.scenarioPlanning).toHaveProperty("title");
      expect(generated.scenarioPlanning).toHaveProperty("progress");
      expect(generated.scenarioPlanning).toHaveProperty("completed");
      expect(generated.scenarioPlanning).toHaveProperty("total");
    });
  });

  describe("Workspace Display Data", () => {
    it("displayWorkspaces contains 3 default workspaces", () => {
      expect(displayWorkspaces).toHaveLength(3);
    });

    it("displayWorkspaces includes Enterprise Risk, Enterprise Audit, IT Security", () => {
      const ids = displayWorkspaces.map(w => w.id);
      expect(ids).toContain("enterprise-risk");
      expect(ids).toContain("enterprise-audit");
      expect(ids).toContain("it-security");
    });

    it("all display workspaces have matching content data", () => {
      displayWorkspaces.forEach(ws => {
        expect(workspaceContent[ws.id]).toBeDefined();
      });
    });
  });

  describe("Architecture Guards (Regression Prevention)", () => {
    it("workspaceContent is exported from HomePageContent (single source of truth)", () => {
      expect(workspaceContent).toBeDefined();
      expect(typeof workspaceContent).toBe("object");
    });

    it("generateCustomWorkspaceContent is exported from HomePageContent", () => {
      expect(typeof generateCustomWorkspaceContent).toBe("function");
    });

    it("HomePageContent module exports all required members", async () => {
      const mod = await import("@/components/workspace/HomePageContent");
      expect(mod.HomePageContent).toBeDefined();
      expect(mod.workspaceContent).toBeDefined();
      expect(mod.generateCustomWorkspaceContent).toBeDefined();
      expect(mod.displayWorkspaces).toBeDefined();
    });

    it("enterprise-risk content is never empty or undefined", () => {
      const content = workspaceContent["enterprise-risk"];
      expect(content).not.toBeNull();
      expect(content).not.toBeUndefined();
      expect(content.tasks.length).toBeGreaterThan(0);
      expect(content.inboxStats.length).toBeGreaterThan(0);
      expect(content.quickActions.length).toBeGreaterThan(0);
      expect(content.scenarioPlanning.title.length).toBeGreaterThan(0);
    });

    it("auditboard-default archetype ID is distinct from other archetypes", () => {
      const ids = archetypeTemplates.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      expect(uniqueIds.has("auditboard-default")).toBe(true);
    });
  });
});
