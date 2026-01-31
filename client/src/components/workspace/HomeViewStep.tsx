/**
 * Home View Step Component
 * 
 * Step 4 of the workspace creation wizard - allows users to select
 * a home dashboard archetype and preview the wireframe layout.
 * 
 * Features:
 * - Archetype template selection grid
 * - Wireframe preview of selected layout
 * - Recommended archetype based on module selection
 * - Persona filtering
 */

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Kanban,
  BarChart2,
  ShieldCheck,
  ClipboardCheck,
  Users,
  ShieldAlert,
  Layout,
  Brain,
  Check,
  Sparkles,
  Star,
} from "lucide-react";
import {
  archetypeTemplates,
  getRecommendedArchetype,
  type ArchetypeTemplate,
  type WidgetSlot,
} from "@/config/homeViewConfig";

interface HomeViewStepProps {
  selectedArchetype: string;
  onArchetypeChange: (archetypeId: string) => void;
  selectedModules: string[];
}

const getArchetypeIcon = (iconName: string, className: string = "w-5 h-5") => {
  const icons: Record<string, JSX.Element> = {
    "layout-dashboard": <LayoutDashboard className={className} />,
    "kanban": <Kanban className={className} />,
    "bar-chart-2": <BarChart2 className={className} />,
    "shield-check": <ShieldCheck className={className} />,
    "clipboard-check": <ClipboardCheck className={className} />,
    "users": <Users className={className} />,
    "shield-alert": <ShieldAlert className={className} />,
    "layout": <Layout className={className} />,
    "brain": <Brain className={className} />,
  };
  return icons[iconName] || <LayoutDashboard className={className} />;
};

const getWidgetLabel = (widgetType: string): string => {
  const labels: Record<string, string> = {
    "welcome-header": "Welcome",
    "metrics-bar": "Metrics",
    "task-list": "Tasks",
    "activity-feed": "Activity",
    "chart-area": "Chart",
    "quick-actions": "Actions",
    "ai-command": "AI Assistant",
    "timeline": "Timeline",
    "status-grid": "Status",
    "heat-map": "Heatmap",
    "data-table": "Data Table",
    "alerts-panel": "Alerts",
    "progress-tracker": "Progress",
    "kpi-cards": "KPIs",
    "calendar-view": "Calendar",
    "workflow-queue": "Workflows",
    "coverage-map": "Coverage",
    "trend-chart": "Trends",
    "summary-card": "Summary",
    "navigation-shortcuts": "Shortcuts",
  };
  return labels[widgetType] || widgetType;
};

const getWidgetColor = (widgetType: string): string => {
  const colors: Record<string, string> = {
    "welcome-header": "bg-[#266C92]/20 border-[#266C92]/40",
    "metrics-bar": "bg-emerald-500/20 border-emerald-500/40",
    "kpi-cards": "bg-emerald-500/20 border-emerald-500/40",
    "task-list": "bg-amber-500/20 border-amber-500/40",
    "activity-feed": "bg-blue-500/20 border-blue-500/40",
    "chart-area": "bg-purple-500/20 border-purple-500/40",
    "trend-chart": "bg-purple-500/20 border-purple-500/40",
    "quick-actions": "bg-cyan-500/20 border-cyan-500/40",
    "ai-command": "bg-pink-500/20 border-pink-500/40",
    "timeline": "bg-orange-500/20 border-orange-500/40",
    "status-grid": "bg-teal-500/20 border-teal-500/40",
    "heat-map": "bg-red-500/20 border-red-500/40",
    "data-table": "bg-gray-500/20 border-gray-500/40",
    "alerts-panel": "bg-rose-500/20 border-rose-500/40",
    "progress-tracker": "bg-indigo-500/20 border-indigo-500/40",
    "calendar-view": "bg-sky-500/20 border-sky-500/40",
    "workflow-queue": "bg-violet-500/20 border-violet-500/40",
    "coverage-map": "bg-lime-500/20 border-lime-500/40",
    "summary-card": "bg-[#266C92]/20 border-[#266C92]/40",
    "navigation-shortcuts": "bg-slate-500/20 border-slate-500/40",
  };
  return colors[widgetType] || "bg-gray-500/20 border-gray-500/40";
};

function WireframePreview({ archetype }: { archetype: ArchetypeTemplate }) {
  // Create a simplified grid representation for wireframe
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${archetype.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${archetype.layout.rows}, minmax(40px, 1fr))`,
    gridTemplateAreas: archetype.layout.areas,
    gap: "4px",
    height: "100%",
    padding: "8px",
  };

  return (
    <div 
      className="bg-muted/30 dark:bg-muted/20 rounded-lg border border-border h-full"
      data-testid={`wireframe-${archetype.id}`}
    >
      <div style={gridStyle}>
        {archetype.slots.map((slot) => (
          <div
            key={slot.id}
            style={{ gridArea: slot.gridArea }}
            className={`rounded border ${getWidgetColor(slot.widgetType)} flex items-center justify-center p-1`}
          >
            <span className="text-[8px] font-medium text-foreground/60 text-center leading-tight">
              {getWidgetLabel(slot.widgetType)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchetypeCard({
  archetype,
  isSelected,
  isRecommended,
  onSelect,
}: {
  archetype: ArchetypeTemplate;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col rounded-xl border transition-all hover-elevate active-elevate-2 overflow-hidden ${
        isSelected
          ? "border-[#266C92] ring-2 ring-[#266C92]/20 bg-[#266C92]/5 dark:bg-[#266C92]/10"
          : "border-border bg-card"
      }`}
      data-testid={`archetype-${archetype.id}`}
    >
      {/* Wireframe preview area */}
      <div className="h-32 p-2">
        <WireframePreview archetype={archetype} />
      </div>

      {/* Info section */}
      <div className="p-3 border-t border-border bg-background/50">
        <div className="flex items-start gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isSelected
                ? "bg-[#266C92]/10 text-[#266C92]"
                : "bg-muted text-muted-foreground"
            }`}
            style={isSelected ? { backgroundColor: `${archetype.colorAccent}15`, color: archetype.colorAccent } : {}}
          >
            {getArchetypeIcon(archetype.icon, "w-4 h-4")}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className={`font-medium text-sm truncate ${isSelected ? "text-[#266C92]" : "text-foreground"}`}>
              {archetype.name}
            </div>
            <div className="text-[10px] text-muted-foreground line-clamp-2">
              {archetype.description}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            {archetype.persona}
          </Badge>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            {archetype.slots.length} widgets
          </Badge>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-[#266C92] flex items-center justify-center shadow-sm">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-2 left-2">
          <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0 gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            Recommended
          </Badge>
        </div>
      )}
    </button>
  );
}

function LargeWireframePreview({ archetype }: { archetype: ArchetypeTemplate }) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${archetype.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${archetype.layout.rows}, minmax(60px, 1fr))`,
    gridTemplateAreas: archetype.layout.areas,
    gap: "8px",
    height: "100%",
  };

  return (
    <div 
      className="bg-background rounded-xl border border-border h-full p-4"
      data-testid="large-wireframe-preview"
    >
      {/* Header simulation */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#266C92]/10">
          {getArchetypeIcon(archetype.icon, "w-4 h-4 text-[#266C92]")}
        </div>
        <div>
          <div className="font-semibold text-foreground">{archetype.name}</div>
          <div className="text-xs text-muted-foreground">{archetype.persona} View</div>
        </div>
        <div className="flex-1" />
        <Badge style={{ backgroundColor: `${archetype.colorAccent}20`, color: archetype.colorAccent }}>
          {archetype.slots.length} widgets
        </Badge>
      </div>

      {/* Grid preview */}
      <div style={gridStyle} className="flex-1">
        {archetype.slots.map((slot) => (
          <div
            key={slot.id}
            style={{ gridArea: slot.gridArea }}
            className={`rounded-lg border-2 border-dashed ${getWidgetColor(slot.widgetType)} flex flex-col items-center justify-center p-2 transition-all hover:scale-[1.02]`}
          >
            <div className="text-[10px] font-semibold text-foreground/70 text-center">
              {getWidgetLabel(slot.widgetType)}
            </div>
            <div className="text-[8px] text-muted-foreground mt-0.5 capitalize">
              {slot.size}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex gap-1">
          {archetype.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground">
          Layout: {archetype.layout.columns}x{archetype.layout.rows} grid
        </div>
      </div>
    </div>
  );
}

export function HomeViewStep({
  selectedArchetype,
  onArchetypeChange,
  selectedModules,
}: HomeViewStepProps) {
  const recommendedArchetype = useMemo(
    () => getRecommendedArchetype(selectedModules),
    [selectedModules]
  );

  const currentArchetype = useMemo(
    () => archetypeTemplates.find((t) => t.id === selectedArchetype) || archetypeTemplates[0],
    [selectedArchetype]
  );

  // Sort archetypes: recommended first, then alphabetically
  const sortedArchetypes = useMemo(() => {
    return [...archetypeTemplates].sort((a, b) => {
      if (a.id === recommendedArchetype) return -1;
      if (b.id === recommendedArchetype) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [recommendedArchetype]);

  return (
    <div className="flex h-full gap-6" data-testid="home-view-step">
      {/* Left panel: Archetype selection */}
      <div className="w-[420px] shrink-0 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Choose Home Layout</h3>
          <p className="text-sm text-muted-foreground">
            Select a dashboard archetype that matches your workflow. Content will be dynamically 
            populated based on your selected modules.
          </p>
        </div>

        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="grid grid-cols-2 gap-3 pb-4">
            {sortedArchetypes.map((archetype) => (
              <ArchetypeCard
                key={archetype.id}
                archetype={archetype}
                isSelected={selectedArchetype === archetype.id}
                isRecommended={archetype.id === recommendedArchetype}
                onSelect={() => onArchetypeChange(archetype.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right panel: Large wireframe preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Layout Preview</h3>
          <p className="text-sm text-muted-foreground">
            Wireframe view of the selected dashboard layout. Widgets will be populated with 
            content from your {selectedModules.length} selected module{selectedModules.length !== 1 ? "s" : ""}.
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <LargeWireframePreview archetype={currentArchetype} />
        </div>

        {/* Module summary */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">Content Sources</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedModules.length > 0 ? (
              selectedModules.map((moduleId) => (
                <Badge key={moduleId} variant="secondary" className="text-xs">
                  {moduleId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No modules selected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeViewStep;
