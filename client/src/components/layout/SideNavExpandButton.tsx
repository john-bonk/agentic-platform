/**
 * SideNavExpandButton Component
 * 
 * A universal expand button for the side navigation panel.
 * This component uses fixed positioning to ensure it's always visible
 * when the side navigation is collapsed, regardless of which view is active.
 */

import { ChevronRight } from "lucide-react";
import { useSideNavStore } from "@/lib/sideNavStore";

interface SideNavExpandButtonProps {
  className?: string;
}

export function SideNavExpandButton({ className = "" }: SideNavExpandButtonProps) {
  const { setCollapsed } = useSideNavStore();

  return (
    <button
      onClick={() => setCollapsed(false)}
      className={`fixed top-[90px] left-[60px] z-50 w-5 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-r-md shadow-sm hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer ${className}`}
      data-testid="nav-expand-button"
    >
      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
    </button>
  );
}
