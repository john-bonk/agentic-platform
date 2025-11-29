/**
 * Settings Page
 * 
 * Template settings page with two-column layout pattern.
 * Left column: Section title + description (400px)
 * Right column: White card with form controls
 * 
 * To customize:
 * 1. Update section titles and descriptions
 * 2. Add/remove form fields as needed
 * 3. Connect to your settings storage/API
 */

import { AppLayout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="flex gap-4 px-8 py-4">
      <div className="flex flex-col gap-2 w-[400px] shrink-0">
        <span className="text-[13px] font-medium text-slate-900">{title}</span>
        <span className="text-xs text-slate-500 leading-[1.25]">{description}</span>
      </div>
      <div className="flex-1 bg-white border border-slate-200 rounded p-4">
        <div className="flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}

interface FormInputProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  testId?: string;
}

function FormInput({ label, value, onChange, placeholder, testId }: FormInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[13px] font-medium text-slate-900">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="h-7 text-xs border-slate-300 rounded"
        data-testid={testId}
      />
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  tooltip?: string;
  testId?: string;
}

function ToggleRow({ label, checked, onCheckedChange, tooltip, testId }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-1">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-4 w-8 data-[state=unchecked]:bg-slate-300"
        data-testid={testId}
      />
      <div className="flex-1 flex items-center gap-1">
        <span className="text-[13px] font-medium text-slate-900">{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-3 h-3 rounded-full bg-slate-200 flex items-center justify-center cursor-help">
                <HelpCircle className="w-2 h-2 text-slate-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [fontSize, setFontSize] = useState("14");
  
  const [autoSave, setAutoSave] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("28800");

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white px-8 pt-8 pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900" data-testid="text-settings-title">
            Settings
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SettingsSection
            title="Profile Settings"
            description="Manage your personal account information and display preferences."
          >
            <FormInput
              label="First Name"
              value={firstName}
              onChange={setFirstName}
              testId="input-first-name"
            />
            <FormInput
              label="Last Name"
              value={lastName}
              onChange={setLastName}
              testId="input-last-name"
            />
            <FormInput
              label="Email Address"
              value={email}
              onChange={setEmail}
              testId="input-email"
            />
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            description="Configure how and when you receive notifications."
          >
            <ToggleRow
              label="Push Notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
              tooltip="Receive real-time notifications in your browser"
              testId="switch-push-notifications"
            />
            <ToggleRow
              label="Email Digest"
              checked={emailDigest}
              onCheckedChange={setEmailDigest}
              tooltip="Receive a weekly summary of activity via email"
              testId="switch-email-digest"
            />
          </SettingsSection>

          <SettingsSection
            title="Appearance"
            description="Customize the visual appearance of the application."
          >
            <div className="flex flex-col gap-1">
              <Label className="text-[13px] font-medium text-slate-900">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="h-7 text-xs border-slate-300 rounded" data-testid="select-theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[13px] font-medium text-slate-900">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-7 text-xs border-slate-300 rounded" data-testid="select-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormInput
              label="Font Size (px)"
              value={fontSize}
              onChange={setFontSize}
              testId="input-font-size"
            />
          </SettingsSection>

          <SettingsSection
            title="Session Management"
            description="Manage session policies and security settings."
          >
            <FormInput
              label="Idle session length (seconds)"
              value={sessionTimeout}
              onChange={setSessionTimeout}
              testId="input-session-timeout"
            />
            <ToggleRow
              label="Auto-save changes"
              checked={autoSave}
              onCheckedChange={setAutoSave}
              tooltip="Automatically save changes as you make them"
              testId="switch-auto-save"
            />
          </SettingsSection>
        </div>
      </div>
    </AppLayout>
  );
}
