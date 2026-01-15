/**
 * Side Navigation Component
 * 
 * A collapsible secondary navigation panel with grouped menu items.
 * Supports expandable/collapsible section groups driven by configuration.
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type SideNavSection, getActiveModuleIndex } from "@/config/navigation";
import { useSideNavStore } from "@/lib/sideNavStore";

interface SideNavigationProps {
  sections: SideNavSection[];
  title: string;
  className?: string;
}

interface CollapsibleSectionProps {
  section: SideNavSection;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: (path: string) => boolean;
}

function CollapsibleSection({ section, isExpanded, onToggle, isActive }: CollapsibleSectionProps) {
  const isCollapsible = section.collapsible !== false;

  return (
    <div className="flex flex-col">
      <button
        onClick={isCollapsible ? onToggle : undefined}
        className={`flex items-center justify-between px-2 py-1.5 w-full text-left ${
          isCollapsible ? "cursor-pointer hover:bg-gray-50 rounded transition-colors" : "cursor-default"
        }`}
        data-testid={`nav-section-${section.id}`}
      >
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {section.title}
        </span>
        {isCollapsible && (
          <ChevronDown 
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? "" : "-rotate-90"
            }`}
          />
        )}
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-0.5 pt-1">
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
    </div>
  );
}

export function SideNavigation({ sections, title, className = "" }: SideNavigationProps) {
  const [location] = useLocation();
  const { isCollapsed, setCollapsed } = useSideNavStore();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(section => {
      initial[section.id] = section.defaultExpanded !== false;
    });
    return initial;
  });

  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    sections.forEach(section => {
      newExpanded[section.id] = expandedSections[section.id] ?? section.defaultExpanded !== false;
    });
    setExpandedSections(newExpanded);
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

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
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer"
            data-testid="nav-collapse-toggle-inline"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
        </header>

        <div className="flex flex-col gap-4 pt-0 pb-6 px-4 flex-1 overflow-y-auto">
          {sections.map((section) => (
            <CollapsibleSection
              key={section.id}
              section={section}
              isExpanded={expandedSections[section.id] ?? true}
              onToggle={() => toggleSection(section.id)}
              isActive={isActive}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
