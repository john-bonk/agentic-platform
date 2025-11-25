import {
  BellIcon,
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
  {
    icon: "files",
    width: "w-36",
    text: "AS.IN.4.C08 Loss Prevention provides ma",
    active: false,
  },
];

const utilityIcons = [
  { icon: "clock", alt: "Clock" },
  { icon: "mail", alt: "Envelope" },
  { icon: "bell", alt: "Bell" },
];

export const HeaderSection = (): JSX.Element => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "x":
        return <XIcon className="w-3 h-3" />;
      case "pin":
        return <PinIcon className="w-3 h-3" />;
      case "settings":
        return <SettingsIcon className="w-3 h-3" />;
      case "files":
        return <FilesIcon className="w-3 h-3" />;
      case "plug":
        return <PlugIcon className="w-3 h-[12.5px]" />;
      case "clock":
        return <ClockIcon className="w-4 h-4" />;
      case "mail":
        return <MailIcon className="w-4 h-4" />;
      case "bell":
        return <BellIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <header className="flex h-12 items-end justify-between pl-0 pr-2 py-0 w-full bg-slate-900">
      <nav className="inline-flex items-start gap-[3px] flex-[0_0_auto]">
        {tabs.map((tab, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`flex ${tab.width} h-9 items-center gap-1.5 px-3.5 py-0 ${
              tab.active ? "bg-white" : "bg-slate-600"
            } rounded-[4px_4px_0px_0px] hover:${
              tab.active ? "bg-white" : "bg-slate-600"
            } h-auto`}
          >
            {getIcon(tab.icon)}
            {tab.text && (
              <span
                className={`flex-1 font-font-200-14px-medium font-[number:var(--font-200-14px-medium-font-weight)] ${
                  tab.active ? "text-slate-900" : "text-white"
                } text-[length:var(--font-200-14px-medium-font-size)] tracking-[var(--font-200-14px-medium-letter-spacing)] leading-[var(--font-200-14px-medium-line-height)] [font-style:var(--font-200-14px-medium-font-style)] truncate`}
              >
                {tab.text}
              </span>
            )}
          </Button>
        ))}
      </nav>

      <div className="inline-flex items-center justify-end gap-3 self-stretch flex-[0_0_auto]">
        <div className="inline-flex items-center gap-1 flex-[0_0_auto]">
          {utilityIcons.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded overflow-hidden hover:bg-slate-800"
            >
              {getIcon(item.icon)}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          className="inline-flex h-10 items-center justify-center gap-[3px] flex-[0_0_auto] rounded overflow-hidden hover:bg-slate-800 h-auto px-0"
        >
          <div className="relative w-6 h-6 bg-white rounded-[48px]">
            <div className="h-full rounded-[999px] bg-[url(/figmaAssets/-faces.png)] bg-cover bg-[50%_50%]" />
          </div>
          <ChevronDownIcon className="w-4 h-4 text-white" />
        </Button>
      </div>
    </header>
  );
};
