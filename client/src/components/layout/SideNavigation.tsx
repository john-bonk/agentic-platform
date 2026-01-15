/**
 * Side Navigation Component
 * 
 * A collapsible secondary navigation panel with grouped menu items.
 * This appears to the right of the icon navbar and shows detailed navigation.
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type SideNavSection, getActiveModuleIndex } from "@/config/navigation";

interface SideNavigationProps {
  sections: SideNavSection[];
  title: string;
  className?: string;
}

export function SideNavigation({ sections, title, className = "" }: SideNavigationProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeModuleIndex = getActiveModuleIndex(location);

  const isActive = (path: string) => {
    if (activeModuleIndex === 0) {
      if (path === "/") {
        return location === "/" || location === "/my-dashboard";
      }
      if (path === "/global-residual-risk") {
        return location === "/global-residual-risk";
      }
      return location === path || location.startsWith(path + "/");
    }
    
    if (activeModuleIndex === 1) {
      if (path === "/workflows") {
        return location === "/workflows";
      }
      if (path === "/workflow/new") {
        return location === "/workflow/new";
      }
      return location === path || location.startsWith(path + "/");
    }

    if (activeModuleIndex === 2) {
      if (path === "/intelligence") {
        return location === "/intelligence";
      }
      return location === path || location.startsWith(path + "/");
    }

    if (activeModuleIndex === 3) {
      return location === path || location.startsWith(path + "/");
    }

    if (activeModuleIndex === 4) {
      return location === path || location.startsWith(path + "/");
    }
    
    return false;
  };

  return (
    <nav 
      className={`relative flex items-start bg-gray-100 flex-shrink-0 h-full z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-0 border-r-0" : "w-[272px] border-r-[3px] border-r-gray-100"
      } ${className}`}
      data-testid="side-navigation"
    >
      <div className={`flex flex-col h-full bg-white overflow-hidden transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-0 opacity-0" : "w-full opacity-100"
      }`}>
        <header className="flex items-center justify-between pl-6 pr-1 py-6 flex-shrink-0">
          <h1 
            className="font-semibold text-gray-900 text-lg leading-[1.2] whitespace-nowrap" 
            data-testid="navigation-title"
          >
            {title}
          </h1>
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer"
            data-testid="nav-collapse-toggle-inline"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
        </header>

        <div className="flex flex-col gap-5 pt-0 pb-6 px-4 flex-1 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 pb-1 whitespace-nowrap">
                {section.title}
              </span>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <Link href={item.path}>
                      <Button
                        variant="ghost"
                        className={`h-[33px] w-full items-center gap-2 px-2 py-1.5 rounded flex justify-start ${
                          isActive(item.path)
                            ? "bg-teal-50 hover:bg-teal-50" 
                            : "hover:bg-gray-100"
                        }`}
                        data-testid={`nav-item-${item.id}`}
                      >
                        <span
                          className={`flex-1 text-left text-sm whitespace-nowrap ${
                            isActive(item.path)
                              ? "font-semibold text-teal-600"
                              : "font-normal text-gray-600"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className="bg-[#266C92] text-white text-xs h-5 min-w-5 flex items-center justify-center"
                            data-testid={`nav-badge-${item.id}`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute top-[26px] left-0 w-5 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-r-md shadow-sm hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer"
          data-testid="nav-collapse-toggle"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}
    </nav>
  );
}
