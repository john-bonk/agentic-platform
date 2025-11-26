import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavigationSection {
  title: string;
  items: { id: string; label: string }[];
}

const navigationSections: NavigationSection[] = [
  {
    title: "DASHBOARDS",
    items: [{ id: "dashboard", label: "Dashboard" }],
  },
  {
    title: "ENVIRONMENT",
    items: [
      { id: "business-processes", label: "Business Processes" },
      { id: "business-impact-analyses", label: "Business Impact Analyses" },
      { id: "business-continuity-plans", label: "Business Continuity Plans" },
      { id: "scenario-tests", label: "Scenario Tests" },
      { id: "issues", label: "Issues" },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      { id: "branches", label: "Branches" },
      { id: "it-assets", label: "IT Assets" },
      { id: "vendors", label: "Vendors" },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { id: "bia-templates", label: "BIA Templates" },
      { id: "settings", label: "Settings" },
    ],
  },
];

export const SideNavigationSection = (): JSX.Element => {
  const [selectedItem, setSelectedItem] = useState("dashboard");

  return (
    <nav className="flex w-[272px] items-start relative self-stretch bg-gray-100 border-r-[3px] border-r-gray-100 border-solid flex-shrink-0" data-testid="side-navigation">
      <div className="flex flex-col items-start gap-2 relative flex-1 self-stretch grow bg-white overflow-hidden">
        <header className="flex items-center justify-between pl-6 pr-2 py-6 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start justify-center relative flex-1 grow">
            <div className="flex items-start relative self-stretch w-full flex-[0_0_auto]">
              <h1 className="relative font-semibold text-gray-900 text-lg leading-[1.2]" data-testid="navigation-title">BCM</h1>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-start gap-5 pt-0 pb-6 px-4 relative flex-1 self-stretch w-full grow overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title} className="flex flex-col items-start gap-1 w-full">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 pb-1">
                {section.title}
              </span>
              <ul className="flex-col items-start gap-0.5 flex w-full">
                {section.items.map((item) => (
                  <li key={item.id} className="w-full">
                    <Button
                      variant="ghost"
                      className={`h-[33px] w-full items-center gap-2 px-2 py-1.5 rounded flex justify-start ${
                        selectedItem === item.id 
                          ? "bg-teal-50 hover:bg-teal-50" 
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedItem(item.id)}
                      data-testid={`nav-item-${item.id}`}
                    >
                      <span
                        className={`relative flex-1 text-left text-sm ${
                          selectedItem === item.id
                            ? "font-semibold text-teal-600 leading-[21px]"
                            : "font-normal text-gray-600 leading-[1.5]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};
