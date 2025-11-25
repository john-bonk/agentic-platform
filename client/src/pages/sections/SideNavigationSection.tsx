import { ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { id: "available", label: "Available Services" },
  { id: "installed", label: "Installed Services" },
  { id: "api-logs", label: "API Access Logs" },
  { id: "inventory-logs", label: "Inventory Import Logs" },
];

export const SideNavigationSection = (): JSX.Element => {
  const [selectedItem, setSelectedItem] = useState("installed");

  return (
    <nav className="flex w-[272px] items-start relative self-stretch bg-gray-100 border-r-[3px] border-r-gray-100 border-solid flex-shrink-0" data-testid="side-navigation">
      <div className="flex flex-col items-start gap-2 relative flex-1 self-stretch grow bg-white overflow-hidden">
        <header className="flex items-center justify-between pl-6 pr-2 py-6 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start justify-center relative flex-1 grow">
            <div className="flex items-start relative self-stretch w-full flex-[0_0_auto]">
              <h1 className="relative font-semibold text-gray-900 text-lg leading-[1.2]" data-testid="navigation-title">
                Integrations
              </h1>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-auto items-center justify-center gap-1.5 px-2 py-0 rounded hover:bg-transparent"
            data-testid="navigation-collapse-button"
          >
            <div className="relative w-3 h-3">
              <ChevronDownIcon className="w-3 h-3 text-gray-500" />
            </div>
          </Button>
        </header>

        <div className="flex flex-col items-start gap-7 pt-0 pb-6 px-4 relative flex-1 self-stretch w-full grow">
          <ul className="flex-col items-start gap-0.5 flex-[0_0_auto] flex relative self-stretch w-full">
            {navigationItems.map((item) => (
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
      </div>
    </nav>
  );
};
