import { useMemo } from "react";
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

function MiniWidgetIcon({ widgetType, large = false }: { widgetType: string; large?: boolean }) {
  const s = large ? 1.6 : 1;
  const color = "stroke-foreground/30";
  const fill = "fill-foreground/10";

  switch (widgetType) {
    case "chart-area":
    case "trend-chart":
      return (
        <svg width={Math.round(24 * s)} height={Math.round(16 * s)} viewBox="0 0 24 16" className="opacity-60">
          <rect x="2" y="10" width="3" height="6" rx="0.5" className={fill} />
          <rect x="7" y="6" width="3" height="10" rx="0.5" className={fill} />
          <rect x="12" y="3" width="3" height="13" rx="0.5" className={fill} />
          <rect x="17" y="8" width="3" height="8" rx="0.5" className={fill} />
          {large && <line x1="1" y1="1" x2="22" y2="1" className={color} strokeWidth="0.5" strokeDasharray="2 2" />}
        </svg>
      );
    case "task-list":
    case "workflow-queue":
      return (
        <svg width={Math.round(22 * s)} height={Math.round(14 * s)} viewBox="0 0 22 14" className="opacity-60">
          <rect x="1" y="1" width="2" height="2" rx="0.5" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="5" y1="2" x2="20" y2="2" className={color} strokeWidth="1" />
          <rect x="1" y="6" width="2" height="2" rx="0.5" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="5" y1="7" x2="17" y2="7" className={color} strokeWidth="1" />
          <rect x="1" y="11" width="2" height="2" rx="0.5" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="5" y1="12" x2="19" y2="12" className={color} strokeWidth="1" />
        </svg>
      );
    case "heat-map":
    case "coverage-map":
      return (
        <svg width={Math.round(22 * s)} height={Math.round(14 * s)} viewBox="0 0 22 14" className="opacity-60">
          {[0, 1, 2, 3].map(r =>
            [0, 1, 2, 3, 4].map(c => (
              <rect
                key={`${r}-${c}`}
                x={1 + c * 4.2}
                y={1 + r * 3.2}
                width="3.5"
                height="2.5"
                rx="0.3"
                className={fill}
                style={{ opacity: 0.3 + Math.random() * 0.5 }}
              />
            ))
          )}
        </svg>
      );
    case "kpi-cards":
    case "metrics-bar":
      return (
        <svg width={Math.round(24 * s)} height={Math.round(10 * s)} viewBox="0 0 24 10" className="opacity-60">
          <rect x="1" y="1" width="6" height="8" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <rect x="9" y="1" width="6" height="8" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <rect x="17" y="1" width="6" height="8" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
        </svg>
      );
    case "welcome-header":
    case "summary-card":
      return (
        <svg width={Math.round(22 * s)} height={Math.round(10 * s)} viewBox="0 0 22 10" className="opacity-60">
          <line x1="1" y1="3" x2="14" y2="3" className={color} strokeWidth="1.5" />
          <line x1="1" y1="7" x2="10" y2="7" className={color} strokeWidth="0.8" />
        </svg>
      );
    case "activity-feed":
      return (
        <svg width={Math.round(22 * s)} height={Math.round(14 * s)} viewBox="0 0 22 14" className="opacity-60">
          <circle cx="3" cy="2.5" r="1.5" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="6" y1="2.5" x2="20" y2="2.5" className={color} strokeWidth="0.8" />
          <circle cx="3" cy="7" r="1.5" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="6" y1="7" x2="16" y2="7" className={color} strokeWidth="0.8" />
          <circle cx="3" cy="11.5" r="1.5" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="6" y1="11.5" x2="18" y2="11.5" className={color} strokeWidth="0.8" />
        </svg>
      );
    case "ai-command":
      return (
        <svg width={Math.round(22 * s)} height={Math.round(10 * s)} viewBox="0 0 22 10" className="opacity-60">
          <rect x="1" y="2" width="20" height="6" rx="3" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <circle cx="5" cy="5" r="1.2" className={color} strokeWidth="0.5" fill="none" />
          <line x1="9" y1="5" x2="18" y2="5" className={color} strokeWidth="0.6" />
        </svg>
      );
    case "quick-actions":
    case "navigation-shortcuts":
      return (
        <svg width={Math.round(20 * s)} height={Math.round(14 * s)} viewBox="0 0 20 14" className="opacity-60">
          <rect x="1" y="1" width="8" height="5" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <rect x="11" y="1" width="8" height="5" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <rect x="1" y="8" width="8" height="5" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <rect x="11" y="8" width="8" height="5" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
        </svg>
      );
    case "data-table":
      return (
        <svg width={Math.round(24 * s)} height={Math.round(14 * s)} viewBox="0 0 24 14" className="opacity-60">
          <line x1="1" y1="2" x2="23" y2="2" className={color} strokeWidth="0.8" />
          <line x1="1" y1="5.5" x2="23" y2="5.5" className={color} strokeWidth="0.4" />
          <line x1="1" y1="8.5" x2="23" y2="8.5" className={color} strokeWidth="0.4" />
          <line x1="1" y1="11.5" x2="23" y2="11.5" className={color} strokeWidth="0.4" />
          <line x1="8" y1="1" x2="8" y2="13" className={color} strokeWidth="0.3" />
          <line x1="16" y1="1" x2="16" y2="13" className={color} strokeWidth="0.3" />
        </svg>
      );
    case "alerts-panel":
      return (
        <svg width={Math.round(20 * s)} height={Math.round(14 * s)} viewBox="0 0 20 14" className="opacity-60">
          <rect x="1" y="1" width="18" height="3.5" rx="0.5" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <rect x="1" y="5.5" width="18" height="3.5" rx="0.5" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <rect x="1" y="10" width="18" height="3.5" rx="0.5" className={fill} stroke="currentColor" strokeWidth="0.3" />
        </svg>
      );
    case "progress-tracker":
      return (
        <svg width={Math.round(22 * s)} height={Math.round(10 * s)} viewBox="0 0 22 10" className="opacity-60">
          <rect x="1" y="2" width="20" height="2.5" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <rect x="1" y="2" width="14" height="2.5" rx="1" className="fill-foreground/15" />
          <rect x="1" y="6.5" width="20" height="2.5" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <rect x="1" y="6.5" width="9" height="2.5" rx="1" className="fill-foreground/15" />
        </svg>
      );
    case "calendar-view":
      return (
        <svg width={Math.round(20 * s)} height={Math.round(14 * s)} viewBox="0 0 20 14" className="opacity-60">
          <rect x="1" y="1" width="18" height="12" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="1" y1="4" x2="19" y2="4" className={color} strokeWidth="0.4" />
          {[0, 1, 2, 3, 4].map(c => (
            <line key={c} x1={4.6 + c * 3} y1="4" x2={4.6 + c * 3} y2="13" className={color} strokeWidth="0.3" />
          ))}
        </svg>
      );
    case "timeline":
      return (
        <svg width={Math.round(22 * s)} height={Math.round(14 * s)} viewBox="0 0 22 14" className="opacity-60">
          <line x1="3" y1="1" x2="3" y2="13" className={color} strokeWidth="0.5" />
          <circle cx="3" cy="3" r="1.2" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="6" y1="3" x2="18" y2="3" className={color} strokeWidth="0.6" />
          <circle cx="3" cy="7.5" r="1.2" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="6" y1="7.5" x2="15" y2="7.5" className={color} strokeWidth="0.6" />
          <circle cx="3" cy="12" r="1.2" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <line x1="6" y1="12" x2="20" y2="12" className={color} strokeWidth="0.6" />
        </svg>
      );
    case "status-grid":
      return (
        <svg width={Math.round(20 * s)} height={Math.round(14 * s)} viewBox="0 0 20 14" className="opacity-60">
          <circle cx="4" cy="4" r="2" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <circle cx="10" cy="4" r="2" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <circle cx="16" cy="4" r="2" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <circle cx="4" cy="10" r="2" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <circle cx="10" cy="10" r="2" className={fill} stroke="currentColor" strokeWidth="0.3" />
          <circle cx="16" cy="10" r="2" className={fill} stroke="currentColor" strokeWidth="0.3" />
        </svg>
      );
    default:
      return (
        <svg width={Math.round(20 * s)} height={Math.round(10 * s)} viewBox="0 0 20 10" className="opacity-60">
          <rect x="1" y="1" width="18" height="8" rx="1" className={fill} stroke="currentColor" strokeWidth="0.3" />
        </svg>
      );
  }
}

function WireframePreview({ archetype }: { archetype: ArchetypeTemplate }) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${archetype.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${archetype.layout.rows}, minmax(28px, 1fr))`,
    gridTemplateAreas: archetype.layout.areas,
    gap: "3px",
    height: "100%",
    padding: "6px",
  };

  return (
    <div
      className="bg-background dark:bg-muted/10 rounded-md border border-border/60 h-full"
      data-testid={`wireframe-${archetype.id}`}
    >
      <div style={gridStyle}>
        {archetype.slots.map((slot) => (
          <div
            key={slot.id}
            style={{ gridArea: slot.gridArea }}
            className="rounded-sm border border-border/40 bg-muted/20 dark:bg-muted/10 flex items-center justify-center"
          >
            <MiniWidgetIcon widgetType={slot.widgetType} />
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
      className={`relative flex flex-col rounded-md border transition-all hover-elevate active-elevate-2 text-left ${
        isSelected
          ? "border-[#266C92] ring-1 ring-[#266C92]/30 bg-card"
          : "border-border bg-card"
      }`}
      data-testid={`archetype-${archetype.id}`}
    >
      {isSelected && (
        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#266C92]" />
      )}

      <div className="h-28 p-2">
        <WireframePreview archetype={archetype} />
      </div>

      <div className="px-3 pb-3 pt-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
            isSelected ? "text-[#266C92]" : "text-muted-foreground"
          }`}>
            {getArchetypeIcon(archetype.icon, "w-3.5 h-3.5")}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-medium truncate ${isSelected ? "text-[#266C92]" : "text-foreground"}`}>
              {archetype.name}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {archetype.persona}
            </div>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-1.5 right-1.5">
          <div className="w-4 h-4 rounded-full bg-[#266C92] flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      )}

      {isRecommended && !isSelected && (
        <div className="absolute top-1.5 right-1.5">
          <Sparkles className="w-3 h-3 text-[#266C92]/60" />
        </div>
      )}
    </button>
  );
}

function LargeWireframePreview({ archetype }: { archetype: ArchetypeTemplate }) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${archetype.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${archetype.layout.rows}, minmax(56px, 1fr))`,
    gridTemplateAreas: archetype.layout.areas,
    gap: "6px",
    height: "100%",
  };

  return (
    <div
      className="bg-card rounded-md border border-border h-full p-4 flex flex-col"
      data-testid="large-wireframe-preview"
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/60">
        <div className="w-7 h-7 rounded flex items-center justify-center bg-muted/60">
          {getArchetypeIcon(archetype.icon, "w-4 h-4 text-foreground/60")}
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{archetype.name}</div>
          <div className="text-[11px] text-muted-foreground">{archetype.persona}</div>
        </div>
        <div className="flex-1" />
        <span className="text-[11px] text-muted-foreground">
          {archetype.slots.length} zones
        </span>
      </div>

      <div style={gridStyle} className="flex-1 min-h-0">
        {archetype.slots.map((slot) => (
          <div
            key={slot.id}
            style={{ gridArea: slot.gridArea }}
            className="rounded border border-border/40 bg-muted/15 dark:bg-muted/10 flex flex-col items-center justify-center gap-1 p-2"
          >
            <MiniWidgetIcon widgetType={slot.widgetType} large />
            <span className="text-[9px] font-medium text-muted-foreground/70 leading-none">
              {getWidgetLabel(slot.widgetType)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center mt-3 pt-3 border-t border-border/40">
        <span className="text-[10px] text-muted-foreground">
          {archetype.layout.columns}-col grid
        </span>
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

  const sortedArchetypes = useMemo(() => {
    return [...archetypeTemplates].sort((a, b) => {
      if (a.id === recommendedArchetype) return -1;
      if (b.id === recommendedArchetype) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [recommendedArchetype]);

  return (
    <div className="flex h-full gap-6" data-testid="home-view-step">
      <div className="w-[420px] shrink-0 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Choose Home Layout</h3>
          <p className="text-sm text-muted-foreground">
            Select a dashboard template that matches your workflow.
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

      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Layout Preview</h3>
          <p className="text-sm text-muted-foreground">
            {currentArchetype.description}
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <LargeWireframePreview archetype={currentArchetype} />
        </div>

        {selectedModules.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{selectedModules.length} module{selectedModules.length !== 1 ? "s" : ""} connected</span>
            <span className="text-border">|</span>
            <span className="truncate">
              {selectedModules
                .slice(0, 4)
                .map((m) => m.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))
                .join(", ")}
              {selectedModules.length > 4 && ` +${selectedModules.length - 4} more`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeViewStep;
