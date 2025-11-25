import {
  BellIcon,
  BotIcon,
  ChevronDownIcon,
  ClockIcon,
  FilesIcon,
  MailIcon,
  PinIcon,
  PlugIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

const tabs = [
  {
    icon: "x",
    width: "w-10",
    text: null,
    active: false,
  },
  {
    icon: "pin",
    width: "w-10",
    text: null,
    active: false,
  },
  {
    icon: "settings",
    width: "w-10",
    text: null,
    active: false,
  },
  {
    icon: "files",
    width: "w-36",
    text: "AS.IN.1.C18 Peachtree Invento",
    active: false,
  },
  {
    icon: "plug",
    width: "w-36",
    text: "Tenable",
    active: true,
  },
];

const utilityIcons = [
  { icon: "bot", alt: "AB Assistant" },
  { icon: "clock", alt: "Clock" },
  { icon: "mail", alt: "Envelope" },
  { icon: "bell", alt: "Bell" },
];

export const HeaderSection = (): JSX.Element => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "x":
        return <XIcon className="w-3 h-3 text-gray-400" />;
      case "pin":
        return <PinIcon className="w-3 h-3 text-gray-400" />;
      case "settings":
        return <SettingsIcon className="w-3 h-3 text-gray-400" />;
      case "files":
        return <FilesIcon className="w-3 h-3 text-gray-400" />;
      case "plug":
        return <PlugIcon className="w-3 h-[12.5px] text-gray-400" />;
      case "bot":
        return <BotIcon className="w-4 h-4 text-gray-400" />;
      case "clock":
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
      case "mail":
        return <MailIcon className="w-4 h-4 text-gray-400" />;
      case "bell":
        return <BellIcon className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <header className="flex h-12 items-end justify-between pl-0 pr-2 py-0 w-full bg-gray-900">
      <nav className="inline-flex items-end gap-1 flex-[0_0_auto] h-full">
        {tabs.map((tab, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`flex ${tab.width} h-10 items-center ${
              tab.text ? "gap-1.5" : "gap-1.5"
            } px-3.5 py-0 ${
              tab.active ? "bg-white" : "bg-gray-600"
            } rounded-t-[4px] hover:${
              tab.active ? "bg-white" : "bg-gray-600"
            } min-w-fit`}
            data-testid={`header-tab-${index}`}
          >
            {getIcon(tab.icon)}
            {tab.text && (
              <span
                className={`flex-1 font-medium text-sm ${
                  tab.active ? "text-gray-900" : "text-white"
                } truncate whitespace-nowrap overflow-hidden`}
              >
                {tab.text}
              </span>
            )}
          </Button>
        ))}
      </nav>

      <div className="inline-flex items-center justify-end gap-3 h-full flex-[0_0_auto]">
        <div className="inline-flex items-center gap-1 flex-[0_0_auto]">
          {utilityIcons.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded hover:bg-gray-800"
              data-testid={`header-utility-${item.icon}`}
            >
              {getIcon(item.icon)}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          className="inline-flex h-10 items-center justify-center gap-[3px] flex-[0_0_auto] rounded hover:bg-gray-800 h-auto px-0"
          data-testid="header-avatar-menu"
        >
          <div className="relative w-6 h-6 bg-white rounded-full">
            <div className="h-full rounded-full bg-[url(/figmaAssets/-faces.png)] bg-cover bg-[50%_50%]" />
          </div>
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
    </header>
  );
};
