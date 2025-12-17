/**
 * Side Navigation Component
 * 
 * A secondary navigation panel with grouped menu items.
 * This appears to the right of the icon navbar and shows detailed navigation.
 */

import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { type SideNavSection, getActiveModuleIndex } from "@/config/navigation";

interface SideNavigationProps {
  sections: SideNavSection[];
  title: string;
  className?: string;
}

export function SideNavigation({ sections, title, className = "" }: SideNavigationProps) {
  const [location] = useLocation();

  // Get active module to ensure exclusive active states
  const activeModuleIndex = getActiveModuleIndex(location);

  const isActive = (path: string) => {
    // For the Intelligence Hub (index 0), check standard path matching
    if (activeModuleIndex === 0) {
      // Root path exact match
      if (path === "/") {
        return location === "/";
      }
      // For other paths in this module, exact match or child paths
      return location === path || location.startsWith(path + "/");
    }
    
    // For Workflows module (index 1)
    if (activeModuleIndex === 1) {
      // /workflows exact match
      if (path === "/workflows") {
        return location === "/workflows";
      }
      // /workflow/new exact match
      if (path === "/workflow/new") {
        return location === "/workflow/new";
      }
      // For individual workflow pages
      return location === path || location.startsWith(path + "/");
    }
    
    return false;
  };

  return (
    <nav 
      className={`flex w-[272px] items-start relative bg-gray-100 border-r-[3px] border-r-gray-100 border-solid flex-shrink-0 h-full z-30 ${className}`}
      data-testid="side-navigation"
    >
      <div className="flex flex-col items-start gap-2 relative flex-1 h-full bg-white overflow-hidden">
        <header className="flex items-center justify-between pl-6 pr-2 py-6 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start justify-center relative flex-1 grow">
            <div className="flex items-start relative self-stretch w-full flex-[0_0_auto]">
              <h1 
                className="relative font-semibold text-gray-900 text-lg leading-[1.2]" 
                data-testid="navigation-title"
              >
                {title}
              </h1>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-start gap-5 pt-0 pb-6 px-4 relative flex-1 self-stretch w-full grow overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col items-start gap-1 w-full">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 pb-1">
                {section.title}
              </span>
              <ul className="flex-col items-start gap-0.5 flex w-full">
                {section.items.map((item) => (
                  <li key={item.id} className="w-full">
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
                          className={`relative flex-1 text-left text-sm ${
                            isActive(item.path)
                              ? "font-semibold text-teal-600 leading-[21px]"
                              : "font-normal text-gray-600 leading-[1.5]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
