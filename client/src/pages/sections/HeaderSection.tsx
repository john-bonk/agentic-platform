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
  RefreshCcw,
  Check,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface HeaderSectionProps {
  activeProcess?: {
    id: string;
    name: string;
  } | null;
}

const baseTabs = [
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
];

const utilityIcons = [
  { icon: "bot", alt: "AB Assistant" },
  { icon: "clock", alt: "Clock" },
  { icon: "mail", alt: "Envelope" },
  { icon: "bell", alt: "Bell" },
];

export const HeaderSection = ({ activeProcess }: HeaderSectionProps): JSX.Element => {
  const getTabIcon = (iconName: string, isActive: boolean) => {
    const colorClass = isActive ? "text-gray-700" : "text-gray-400";
    switch (iconName) {
      case "x":
        return <XIcon className={`w-3 h-3 ${colorClass}`} />;
      case "pin":
        return <PinIcon className={`w-3 h-3 ${colorClass}`} />;
      case "settings":
        return <SettingsIcon className={`w-3 h-3 ${colorClass}`} />;
      case "files":
        return <FilesIcon className={`w-3 h-3 ${colorClass}`} />;
      case "plug":
        return <PlugIcon className={`w-3 h-[12.5px] ${colorClass}`} />;
      default:
        return null;
    }
  };

  const getUtilityIcon = (iconName: string) => {
    switch (iconName) {
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

  const BcmIcon = ({ className }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
      <RefreshCcw className="w-full h-full absolute" />
      <Check className="w-[50%] h-[50%]" strokeWidth={3} />
    </div>
  );

  return (
    <header className="flex h-12 items-end justify-between pl-0 pr-2 py-0 w-full bg-gray-900 flex-shrink-0">
      <nav className="inline-flex items-end gap-1 flex-[0_0_auto] h-full">
        {baseTabs.map((tab, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`flex ${tab.width} h-10 items-center justify-center gap-1.5 px-2 py-0 bg-gray-600 rounded-t-[4px] rounded-b-none hover:bg-gray-600`}
            data-testid={`header-tab-${index}`}
          >
            {getTabIcon(tab.icon, false)}
          </Button>
        ))}
        
        {activeProcess && (
          <Link href={`/process/${activeProcess.id}`}>
            <Button
              variant="ghost"
              className="flex h-10 items-center justify-start gap-2 px-3 py-0 bg-white rounded-t-[4px] rounded-b-none hover:bg-white"
              data-testid="header-tab-process"
            >
              <BcmIcon className="w-4 h-4 text-gray-700" />
              <span className="text-left font-semibold text-base text-gray-900 whitespace-nowrap">
                {activeProcess.name}
              </span>
            </Button>
          </Link>
        )}
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
              {getUtilityIcon(item.icon)}
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
