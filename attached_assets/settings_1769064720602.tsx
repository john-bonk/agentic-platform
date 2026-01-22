import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Bell, Palette, Shield, LogOut, Save, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";

const SETTINGS_KEY = "user-preferences";

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  deadlineReminders: boolean;
  reminderDays: string;
  weeklyDigest: boolean;
  showCompletedTasks: boolean;
  defaultView: string;
}

const defaultPreferences: UserPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  deadlineReminders: true,
  reminderDays: "3",
  weeklyDigest: true,
  showCompletedTasks: false,
  defaultView: "home",
};

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      } catch {
        setPreferences(defaultPreferences);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(preferences));
    setIsSaving(false);
    setSaved(true);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Settings" },
        ]}
      />

      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-5 page-transition">
          <div className="mb-6">
            <h2 className="text-2xl font-bold" data-testid="text-settings-title">Settings</h2>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Profile</CardTitle>
              </div>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">JM</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Jordan Mitchell</h3>
                  <p className="text-sm text-muted-foreground">Senior SOX Tester</p>
                  <p className="text-sm text-muted-foreground">Internal Audit Department</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value="jordan.mitchell@company.com" disabled data-testid="input-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value="Senior SOX Tester" disabled data-testid="input-role" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value="Internal Audit" disabled data-testid="input-department" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input id="manager" value="Sarah Chen" disabled data-testid="input-manager" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Appearance</CardTitle>
              </div>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <Select value={theme} onValueChange={(value: "light" | "dark") => setTheme(value)}>
                  <SelectTrigger className="w-32" data-testid="select-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Default View</Label>
                  <p className="text-sm text-muted-foreground">Choose your default landing page</p>
                </div>
                <Select 
                  value={preferences.defaultView} 
                  onValueChange={(value) => updatePreference("defaultView", value)}
                >
                  <SelectTrigger className="w-32" data-testid="select-default-view">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="controls">Controls</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Completed Tasks</Label>
                  <p className="text-sm text-muted-foreground">Display completed tasks in lists</p>
                </div>
                <Switch 
                  checked={preferences.showCompletedTasks}
                  onCheckedChange={(checked) => updatePreference("showCompletedTasks", checked)}
                  data-testid="switch-show-completed"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
              <CardDescription>Configure how you receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch 
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
                  data-testid="switch-email-notifications"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                </div>
                <Switch 
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => updatePreference("pushNotifications", checked)}
                  data-testid="switch-push-notifications"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Deadline Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded before due dates</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={preferences.reminderDays}
                    onValueChange={(value) => updatePreference("reminderDays", value)}
                    disabled={!preferences.deadlineReminders}
                  >
                    <SelectTrigger className="w-20" data-testid="select-reminder-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch 
                    checked={preferences.deadlineReminders}
                    onCheckedChange={(checked) => updatePreference("deadlineReminders", checked)}
                    data-testid="switch-deadline-reminders"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary email</p>
                </div>
                <Switch 
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) => updatePreference("weeklyDigest", checked)}
                  data-testid="switch-weekly-digest"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm" data-testid="button-setup-2fa">
                  Set Up
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Change Password</Label>
                  <p className="text-sm text-muted-foreground">Update your password</p>
                </div>
                <Button variant="outline" size="sm" data-testid="button-change-password">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              data-testid="button-save-settings"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
