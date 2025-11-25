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
        className="flex flex-col w-14 items-center justify-between pt-2 pb-2.5 px-2 relative bg-slate-900"
        style={{ minHeight: "100vh" }}
        data-testid="side-navbar"
      >
        <nav className="flex flex-col items-center gap-1 relative flex-[0_0_auto]">
          <div className="w-10 h-10 p-[11px] rounded flex items-center justify-center" data-testid="navbar-logo">
            <div className="relative w-7 h-7">
              <img
                className="w-full h-full object-cover"
                alt="AuditBoard Logo"
                src="/figmaAssets/image-2.png"
              />
            </div>
          </div>

          {navigationIcons.map((icon, index) => (
            <div
              key={index}
              className={`w-10 h-10 rounded flex items-center justify-center ${
                icon.active ? "bg-[#266c92]" : ""
              }`}
              data-testid={`navbar-icon-${index}`}
            >
              <img className="w-4 h-4" alt={icon.alt} src={icon.src} />
            </div>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-settings">
            <img
              className="w-4 h-4"
              alt="Settings"
              src="/figmaAssets/gear.svg"
            />
          </div>
          <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-support">
            <img
              className="w-4 h-4"
              alt="Support"
              src="/figmaAssets/circle-question-.svg"
            />
          </div>
        </div>
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
