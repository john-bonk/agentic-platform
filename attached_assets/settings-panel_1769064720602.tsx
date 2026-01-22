import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings, Moon, Sun, Layout, RefreshCw, Bot, Filter } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface SettingsState {
  refreshInterval: number;
  layoutEditMode: boolean;
  includedStatuses: string[];
  agentEnabled: boolean;
  agentTone: string;
}

const defaultSettings: SettingsState = {
  refreshInterval: 0,
  layoutEditMode: false,
  includedStatuses: ["Not Started", "In Progress", "Pending", "Blocked"],
  agentEnabled: true,
  agentTone: "professional",
};

const allStatuses = ["Not Started", "In Progress", "Pending", "Blocked", "Completed"];

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {}
    }
  }, []);

  const updateSettings = (updates: Partial<SettingsState>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem("dashboard-settings", JSON.stringify(newSettings));
    window.dispatchEvent(new CustomEvent("settings-updated", { detail: newSettings }));
  };

  const toggleStatus = (status: string) => {
    const current = settings.includedStatuses;
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateSettings({ includedStatuses: updated });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-settings">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
          <SheetDescription>
            Customize your dashboard experience
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label className="font-medium">Appearance</Label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dark Mode</span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                data-testid="switch-dark-mode"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <Label className="font-medium">Layout</Label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enable Layout Editing</span>
              <Switch
                checked={settings.layoutEditMode}
                onCheckedChange={(checked) => updateSettings({ layoutEditMode: checked })}
                data-testid="switch-layout-edit"
              />
            </div>
            {settings.layoutEditMode && (
              <p className="text-xs text-muted-foreground">
                Drag containers to reorder dashboard sections
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <Label className="font-medium">Data Refresh</Label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Refresh Interval</span>
                <span className="text-sm font-medium">
                  {settings.refreshInterval === 0 ? "Manual" : `${settings.refreshInterval}s`}
                </span>
              </div>
              <Slider
                value={[settings.refreshInterval]}
                onValueChange={([val]) => updateSettings({ refreshInterval: val })}
                max={120}
                step={15}
                className="w-full"
                data-testid="slider-refresh-interval"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Off</span>
                <span>30s</span>
                <span>60s</span>
                <span>120s</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <Label className="font-medium">Audit Agent</Label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enable Agent</span>
              <Switch
                checked={settings.agentEnabled}
                onCheckedChange={(checked) => updateSettings({ agentEnabled: checked })}
                data-testid="switch-agent-enabled"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Response Tone</Label>
              <Select
                value={settings.agentTone}
                onValueChange={(val) => updateSettings({ agentTone: val })}
              >
                <SelectTrigger data-testid="select-agent-tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label className="font-medium">Task Statuses</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Select which statuses to include in the task list
            </p>
            <div className="space-y-2">
              {allStatuses.map((status) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm">{status}</span>
                  <Switch
                    checked={settings.includedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                    data-testid={`switch-status-${status.toLowerCase().replace(" ", "-")}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {}
    }

    const handleUpdate = (e: CustomEvent<SettingsState>) => {
      setSettings(e.detail);
    };

    window.addEventListener("settings-updated", handleUpdate as EventListener);
    return () => window.removeEventListener("settings-updated", handleUpdate as EventListener);
  }, []);

  return settings;
}
