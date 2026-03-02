/**
 * Home Page - Complete redesign to match mockup
 * 
 * Layout structure:
 * 1. Teal hero header with welcome message
 * 2. "What would you like to do?" assistant card
 * 3. Inbox section with horizontal stat tabs
 * 4. Two-column: Task Overview donut + Task list
 * 5. Your workspaces section
 * 
 * Custom workspaces show "Welcome back!" without persona and
 * display content based on selected solution capabilities.
 * 
 * IMPORTANT: The actual rendering is done by HomePageContent component.
 * This is the SINGLE SOURCE OF TRUTH for the AuditBoard home dashboard.
 * Both this page (for default workspaces) and CustomWorkspaceHome (for 
 * "AuditBoard Default" archetype) use the exact same HomePageContent component
 * to ensure visual parity.
 */

import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
import { useWorkspaceStore, type UserPersona } from "@/lib/workspaceStore";
import {
  HomePageContent,
  workspaceContent,
  generateCustomWorkspaceContent,
} from "@/components/workspace/HomePageContent";
import { AgentHubHome } from "@/components/workspace/AgentHubHome";
import { isAgentHubSupported } from "@/config/agentHubConfig";
import { useSettings } from "@/components/settings-panel";

export default function HomePage() {
  const { currentWorkspace, refreshKey, userPersona } = useWorkspaceStore();
  const [, setLocation] = useLocation();
  const settings = useSettings();
  
  useEffect(() => {
    if (currentWorkspace.isCustom) {
      setLocation("/custom-workspace");
    }
  }, [currentWorkspace.isCustom, setLocation]);
  
  const content = useMemo(() => {
    return workspaceContent[currentWorkspace.id] || workspaceContent["enterprise-risk"];
  }, [currentWorkspace.id]);

  const getWelcomeMessage = () => {
    if (currentWorkspace.isCustom) {
      return userPersona === "Executive" ? "Welcome back!" : `Welcome back, ${userPersona}`;
    }
    return userPersona === "Executive" 
      ? `Welcome back, ${currentWorkspace.persona}` 
      : `Welcome back, ${userPersona}`;
  };
  const welcomeMessage = getWelcomeMessage();

  if (settings.agentHubEnabled && isAgentHubSupported(currentWorkspace.id)) {
    return (
      <AppLayout showHeader={true} showSideNav={true}>
        <AgentHubHome
          key={refreshKey}
          workspaceId={currentWorkspace.id}
          welcomeMessage={welcomeMessage}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={true} showSideNav={true}>
      <HomePageContent
        key={refreshKey}
        content={content}
        welcomeMessage={welcomeMessage}
        showWorkspaces={true}
      />
    </AppLayout>
  );
}
