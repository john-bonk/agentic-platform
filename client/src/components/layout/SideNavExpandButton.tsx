/**
 * SideNavExpandButton Component
 * 
 * A universal expand button for the side navigation panel.
 * Use this component in layouts that need to show the expand button
 * even when the side navigation is not directly rendered.
 */

import { ChevronRight } from "lucide-react";
import { useSideNavStore } from "@/lib/sideNavStore";

interface SideNavExpandButtonProps {
  className?: string;
}

export function SideNavExpandButton({ className = "" }: SideNavExpandButtonProps) {
  const { isCollapsed, setCollapsed } = useSideNavStore();

  if (!isCollapsed) return null;

  return (
    <button
      onClick={() => setCollapsed(false)}
      className={`fixed top-[90px] left-[60px] z-40 w-5 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-r-md shadow-sm hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer ${className}`}
      data-testid="nav-expand-button"
    >
      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
    </button>
  );
}
