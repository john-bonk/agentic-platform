import { useMemo, useRef, useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import {
  archetypeTemplates,
  getRecommendedArchetype,
  generateHomeContent,
  type ArchetypeTemplate,
} from "@/config/homeViewConfig";
import { ArchetypeDashboard } from "@/components/workspace/ArchetypeDashboard";

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

function MiniGridPreview({ archetype }: { archetype: ArchetypeTemplate }) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${archetype.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${archetype.layout.rows}, 1fr)`,
    gridTemplateAreas: archetype.layout.areas,
    gap: "2px",
    height: "100%",
    padding: "3px",
  };

  return (
    <div className="bg-muted/30 dark:bg-muted/10 rounded-sm h-full">
      <div style={gridStyle}>
        {archetype.slots.map((slot) => (
          <div
            key={slot.id}
            style={{ gridArea: slot.gridArea }}
            className="rounded-[2px] bg-foreground/[0.06] dark:bg-foreground/[0.08]"
          />
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

      <div className="h-20 p-2">
        <MiniGridPreview archetype={archetype} />
      </div>

      <div className="px-3 pb-2.5 pt-1.5">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
            isSelected ? "text-[#266C92]" : "text-muted-foreground"
          }`}>
            {getArchetypeIcon(archetype.icon, "w-3 h-3")}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[11px] font-medium truncate leading-tight ${isSelected ? "text-[#266C92]" : "text-foreground"}`}>
              {archetype.name}
            </div>
            <div className="text-[10px] text-muted-foreground truncate leading-tight">
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

function LiveDashboardPreview({ archetype, selectedModules }: { archetype: ArchetypeTemplate; selectedModules: string[] }) {
  const content = useMemo(() => {
    return generateHomeContent(selectedModules, archetype.id, "My Workspace");
  }, [archetype.id, selectedModules]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const SOURCE_WIDTH = 1400;

  const updateScale = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setScale(Math.min(1, containerWidth / SOURCE_WIDTH));
    }
  }, []);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  return (
    <div
      className="bg-background rounded-lg border border-border overflow-hidden h-full flex flex-col"
      data-testid="live-dashboard-preview"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/60 bg-muted/20 shrink-0">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="w-2 h-2 rounded-full bg-amber-400/60" />
          <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[10px] text-muted-foreground bg-muted/50 rounded px-3 py-0.5 font-mono">
            app.auditboard.com/{archetype.id}
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden relative">
        <div
          className="absolute top-0 left-0"
          style={{
            width: `${SOURCE_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <ArchetypeDashboard
            archetype={archetype}
            content={{
              metrics: content.metrics,
              tasks: content.tasks,
              activities: content.activities,
              charts: content.charts,
              quickActions: content.quickActions,
              alerts: content.alerts,
              statusItems: content.statusItems,
              greeting: content.greeting,
            }}
            workspaceName="My Workspace"
            userPersona="Executive"
            compact
          />
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

  const sortedArchetypes = useMemo(() => {
    return [...archetypeTemplates].sort((a, b) => {
      if (a.id === "auditboard-default") return -1;
      if (b.id === "auditboard-default") return 1;
      if (a.id === recommendedArchetype) return -1;
      if (b.id === recommendedArchetype) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [recommendedArchetype]);

  return (
    <div className="flex h-full gap-5" data-testid="home-view-step">
      <div className="w-[340px] shrink-0 flex flex-col">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-foreground">Choose Layout</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a dashboard template for your workspace home page.
          </p>
        </div>

        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="grid grid-cols-2 gap-2 pb-4">
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
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Live Preview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentArchetype.description}
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {currentArchetype.slots.length} widgets
          </Badge>
        </div>

        <div className="flex-1 min-h-0">
          <LiveDashboardPreview archetype={currentArchetype} selectedModules={selectedModules} />
        </div>

        {selectedModules.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{selectedModules.length} module{selectedModules.length !== 1 ? "s" : ""} connected</span>
            <span className="text-border">|</span>
            <span className="truncate">
              {selectedModules
                .slice(0, 3)
                .map((m) => m.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))
                .join(", ")}
              {selectedModules.length > 3 && ` +${selectedModules.length - 3} more`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeViewStep;
