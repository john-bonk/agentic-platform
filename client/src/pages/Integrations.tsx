import React from "react";
import { Button } from "@/components/ui/button";
import { HeaderSection } from "./sections/HeaderSection";
import { MainContentSection } from "./sections/MainContentSection";
import { SideNavigationSection } from "./sections/SideNavigationSection";

const navigationIcons = [
  {
    src: "/figmaAssets/module-dashboard-.svg",
    alt: "Module dashboard",
    active: false,
  },
  {
    src: "/figmaAssets/module-controls-.svg",
    alt: "Module controls",
    active: false,
  },
  { src: "/figmaAssets/module-risk-.svg", alt: "Module risk", active: false },
  { src: "/figmaAssets/module-esg-.svg", alt: "Module esg", active: false },
  {
    src: "/figmaAssets/module-crosscomply-.svg",
    alt: "Module crosscomply",
    active: false,
  },
  {
    src: "/figmaAssets/module-opsaudit.svg",
    alt: "Module opsaudit",
    active: false,
  },
  { src: "/figmaAssets/module-tprm.svg", alt: "Module tprm", active: false },
  { src: "/figmaAssets/vector.svg", alt: "Vector", active: false },
  { src: "/figmaAssets/files.svg", alt: "Files", active: false },
  {
    src: "/figmaAssets/module-report-.svg",
    alt: "Module report",
    active: false,
  },
  {
    src: "/figmaAssets/module-workstream-.svg",
    alt: "Module workstream",
    active: false,
  },
  {
    src: "/figmaAssets/module-automations-.svg",
    alt: "Module automations",
    active: false,
  },
  { src: "/figmaAssets/plug.svg", alt: "Plug", active: true },
  {
    src: "/figmaAssets/module-issues.svg",
    alt: "Module issues",
    active: false,
  },
  { src: "/figmaAssets/module-files.svg", alt: "Module files", active: false },
  {
    src: "/figmaAssets/module-timesheets.svg",
    alt: "Module timesheets",
    active: false,
  },
  {
    src: "/figmaAssets/module-settings-.svg",
    alt: "Module settings",
    active: false,
  },
];

export const Integrations = (): JSX.Element => {
  return (
    <div className="flex items-start relative">
      <aside
        className="flex flex-col w-14 items-start justify-between pt-2 pb-2.5 px-2 relative bg-slate-900"
        style={{ minHeight: "100vh" }}
      >
        <nav className="inline-flex flex-col items-center gap-1 relative flex-[0_0_auto]">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 p-[11px] rounded overflow-hidden"
          >
            <div className="relative w-[18px] h-[18px]">
              <img
                className="absolute top-[calc(50.00%_-_12px)] left-[calc(50.00%_-_12px)] w-6 h-6 object-cover"
                alt="Image"
                src="/figmaAssets/image-2.png"
              />
            </div>
          </Button>

          {navigationIcons.map((icon, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={`w-10 h-10 rounded overflow-hidden ${
                icon.active ? "bg-[#3172e3]" : ""
              }`}
            >
              <img className="w-4 h-4" alt={icon.alt} src={icon.src} />
            </Button>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded overflow-hidden"
        >
          <img
            className="w-4 h-4"
            alt="Circle question"
            src="/figmaAssets/circle-question-.svg"
          />
        </Button>
      </aside>

      <div className="flex flex-col items-start relative flex-1 grow">
        <HeaderSection />
        <div className="flex items-start relative flex-1 self-stretch w-full grow">
          <SideNavigationSection />
          <MainContentSection />
        </div>
      </div>
    </div>
  );
};
