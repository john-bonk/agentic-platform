import { RefreshCcw, Check } from "lucide-react";
import { HeaderSection } from "./sections/HeaderSection";
import { MainContentSection } from "./sections/MainContentSection";
import { SideNavigationSection } from "./sections/SideNavigationSection";

type NavigationIcon = 
  | { type: "image"; src: string; alt: string; active: boolean }
  | { type: "lucide"; icon: "refresh-ccw"; alt: string; active: boolean };

const navigationIcons: NavigationIcon[] = [
  {
    type: "image",
    src: "/figmaAssets/module-dashboard-.svg",
    alt: "Module dashboard",
    active: false,
  },
  {
    type: "image",
    src: "/figmaAssets/module-controls-.svg",
    alt: "Module controls",
    active: false,
  },
  { type: "image", src: "/figmaAssets/module-risk-.svg", alt: "Module risk", active: false },
  { type: "image", src: "/figmaAssets/module-esg-.svg", alt: "Module esg", active: false },
  {
    type: "image",
    src: "/figmaAssets/module-crosscomply-.svg",
    alt: "Module crosscomply",
    active: false,
  },
  {
    type: "image",
    src: "/figmaAssets/module-opsaudit.svg",
    alt: "Module opsaudit",
    active: false,
  },
  { type: "image", src: "/figmaAssets/module-tprm.svg", alt: "Module tprm", active: false },
  { type: "lucide", icon: "refresh-ccw", alt: "BCM", active: true },
  { type: "image", src: "/figmaAssets/files.svg", alt: "Files", active: false },
  {
    type: "image",
    src: "/figmaAssets/module-report-.svg",
    alt: "Module report",
    active: false,
  },
  {
    type: "image",
    src: "/figmaAssets/module-workstream-.svg",
    alt: "Module workstream",
    active: false,
  },
  {
    type: "image",
    src: "/figmaAssets/module-automations-.svg",
    alt: "Module automations",
    active: false,
  },
  { type: "image", src: "/figmaAssets/plug.svg", alt: "Plug", active: false },
  {
    type: "image",
    src: "/figmaAssets/module-issues.svg",
    alt: "Module issues",
    active: false,
  },
  { type: "image", src: "/figmaAssets/module-files.svg", alt: "Module files", active: false },
  {
    type: "image",
    src: "/figmaAssets/module-timesheets.svg",
    alt: "Module timesheets",
    active: false,
  },
  {
    type: "image",
    src: "/figmaAssets/module-settings-.svg",
    alt: "Module settings",
    active: false,
  },
];

export const Integrations = (): JSX.Element => {
  return (
    <div className="flex items-start relative h-screen overflow-hidden">
      <aside
        className="flex flex-col w-14 items-center justify-between pt-2 pb-2.5 px-2 bg-gray-900 sticky top-0 h-screen z-50 flex-shrink-0"
        data-testid="side-navbar"
      >
        <nav className="flex flex-col items-center gap-1 relative flex-[0_0_auto]">
          <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-logo">
            <img
              className="w-7 h-auto"
              alt="AuditBoard Logo"
              src="/figmaAssets/auditboard-logo.png?v=2"
            />
          </div>

          {navigationIcons.map((icon, index) => (
            <div
              key={index}
              className={`w-10 h-10 rounded flex items-center justify-center ${
                icon.active ? "bg-teal-500" : ""
              }`}
              data-testid={`navbar-icon-${index}`}
            >
              {icon.type === "lucide" ? (
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <RefreshCcw className="w-4 h-4 text-white absolute" />
                  <Check className="w-2 h-2 text-white" strokeWidth={3} />
                </div>
              ) : (
                <img className={`w-4 h-4 ${icon.alt === "Plug" ? "opacity-50" : ""}`} alt={icon.alt} src={icon.src} />
              )}
            </div>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-support">
            <img
              className="w-4 h-4"
              alt="Support"
              src="/figmaAssets/circle-question-.svg"
            />
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <HeaderSection />
        <div className="flex flex-1 overflow-hidden">
          <SideNavigationSection />
          <MainContentSection />
        </div>
      </div>
    </div>
  );
};
