import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Wrench, Moon, Sun, Layout, RefreshCw, Bot, Filter } from "lucide-react";
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

const STORAGE_KEY = "dashboard-settings";
const SETTINGS_EVENT = "settings-updated";

const allStatuses = ["Not Started", "In Progress", "Pending", "Blocked", "Completed", "Cancelled"];

function loadSettings(): SettingsState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return defaultSettings;
}

function saveSettings(settings: SettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SettingsState>;
      setSettings(customEvent.detail);
    };

    window.addEventListener(SETTINGS_EVENT, handleUpdate);
    return () => window.removeEventListener(SETTINGS_EVENT, handleUpdate);
  }, []);

  return settings;
}

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const { theme, setTheme } = useTheme();

  const updateSetting = useCallback(<K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const toggleStatus = useCallback((status: string) => {
    const currentStatuses = settings.includedStatuses;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    updateSetting("includedStatuses", newStatuses);
  }, [settings.includedStatuses, updateSetting]);

  const formatRefreshInterval = (value: number) => {
    return value === 0 ? "Manual" : `${value}s`;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded"
          data-testid="button-settings"
        >
          <Wrench className="w-4 h-4 text-gray-400" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 overflow-y-auto p-6" data-testid="settings-panel">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Prototype Settings
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
              <span>Appearance</span>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm text-muted-foreground">
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                data-testid="switch-dark-mode"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layout className="w-4 h-4 text-muted-foreground" />
              <span>Layout</span>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="layout-edit" className="text-sm text-muted-foreground">
                Enable Layout Editing
              </Label>
              <Switch
                id="layout-edit"
                checked={settings.layoutEditMode}
                onCheckedChange={(checked) => updateSetting("layoutEditMode", checked)}
                data-testid="switch-layout-edit"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <span>Data Refresh</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  Auto-refresh Interval
                </Label>
                <span className="text-sm font-medium">
                  {formatRefreshInterval(settings.refreshInterval)}
                </span>
              </div>
              <Slider
                value={[settings.refreshInterval]}
                onValueChange={([value]) => updateSetting("refreshInterval", value)}
                min={0}
                max={120}
                step={15}
                className="w-full"
                data-testid="slider-refresh-interval"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Manual</span>
                <span>120s</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bot className="w-4 h-4 text-muted-foreground" />
              <span>AB Assistant</span>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="agent-enabled" className="text-sm text-muted-foreground">
                Enable Assistant
              </Label>
              <Switch
                id="agent-enabled"
                checked={settings.agentEnabled}
                onCheckedChange={(checked) => updateSetting("agentEnabled", checked)}
                data-testid="switch-agent-enabled"
              />
            </div>
            {settings.agentEnabled && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Response Tone
                </Label>
                <Select
                  value={settings.agentTone}
                  onValueChange={(value) => updateSetting("agentTone", value)}
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
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span>Task Statuses</span>
            </div>
            <div className="space-y-2">
              {allStatuses.map((status) => {
                const statusId = status.toLowerCase().replace(/\s+/g, "-");
                return (
                  <div key={status} className="flex items-center justify-between">
                    <Label htmlFor={`status-${statusId}`} className="text-sm text-muted-foreground">
                      {status}
                    </Label>
                    <Switch
                      id={`status-${statusId}`}
                      checked={settings.includedStatuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                      data-testid={`switch-status-${statusId}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
