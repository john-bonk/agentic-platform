/**
 * AuditRegionalTreemap Component
 * 
 * CAE-specific treemap visualization for Critical Audit Areas.
 * Displays hierarchical view of regions, companies, and locations
 * with audit-focused tooltips showing compliance status.
 */

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink } from "lucide-react";
import { AuditTreemapTooltip, type AuditTooltipData } from "./AuditTreemapTooltip";

export interface AuditLocationData {
  id: string;
  name: string;
  value: string;
  percentage: number;
}

export interface AuditCompanyData {
  id: string;
  name: string;
  totalValue: string;
  percentage: number;
  color: string;
  locations: AuditLocationData[];
  tooltip?: AuditTooltipData;
}

export interface AuditRegionData {
  id: string;
  name: string;
  totalExposure: string;
  companies: AuditCompanyData[];
}

interface AuditRegionalTreemapProps {
  region: AuditRegionData;
  onManageInventory?: () => void;
  highlightIntegrationControls?: boolean;
}

interface AuditRegionalTreemapsProps {
  regions: AuditRegionData[];
  highlightIntegrationControls?: boolean;
}

// Light mode: vibrant teal, Dark mode: muted, elegant teal with transparency
const companyColors = [
  { bg: "bg-[#266C92] dark:bg-[#266C92]/40", text: "text-white dark:text-gray-100", locationBg: "bg-[#1a5270] dark:bg-[#1a5270]/50" },
  { bg: "bg-[#3a8ab5] dark:bg-[#3a8ab5]/35", text: "text-white dark:text-gray-100", locationBg: "bg-[#266C92] dark:bg-[#266C92]/40" },
  { bg: "bg-[#5ca3c7] dark:bg-[#5ca3c7]/30", text: "text-white dark:text-gray-100", locationBg: "bg-[#3a8ab5] dark:bg-[#3a8ab5]/35" },
  { bg: "bg-[#7ebdd8] dark:bg-[#7ebdd8]/25", text: "text-gray-800 dark:text-gray-200", locationBg: "bg-[#5ca3c7] dark:bg-[#5ca3c7]/30" },
  { bg: "bg-[#a0d4e8] dark:bg-[#a0d4e8]/20", text: "text-gray-800 dark:text-gray-200", locationBg: "bg-[#7ebdd8] dark:bg-[#7ebdd8]/25" },
  { bg: "bg-[#c2e8f5] dark:bg-[#c2e8f5]/15", text: "text-gray-800 dark:text-gray-300", locationBg: "bg-[#a0d4e8] dark:bg-[#a0d4e8]/20" },
];

// Red color scheme for high risk (affected) tiles - muted in dark mode
const affectedColors = [
  { bg: "bg-red-600 dark:bg-red-600/50", text: "text-white dark:text-gray-100", locationBg: "bg-red-700 dark:bg-red-700/50" },
  { bg: "bg-red-500 dark:bg-red-500/45", text: "text-white dark:text-gray-100", locationBg: "bg-red-600 dark:bg-red-600/50" },
  { bg: "bg-red-400 dark:bg-red-400/40", text: "text-white dark:text-gray-100", locationBg: "bg-red-500 dark:bg-red-500/45" },
  { bg: "bg-red-300 dark:bg-red-300/35", text: "text-gray-800 dark:text-gray-200", locationBg: "bg-red-400 dark:bg-red-400/40" },
  { bg: "bg-red-200 dark:bg-red-200/30", text: "text-gray-800 dark:text-gray-200", locationBg: "bg-red-300 dark:bg-red-300/35" },
  { bg: "bg-red-100 dark:bg-red-100/25", text: "text-gray-800 dark:text-gray-300", locationBg: "bg-red-200 dark:bg-red-200/30" },
];

// Gray color scheme for non-affected tiles - subtle in dark mode
const inactiveColors = [
  { bg: "bg-gray-400 dark:bg-gray-600/40", text: "text-white dark:text-gray-200", locationBg: "bg-gray-500 dark:bg-gray-500/40" },
  { bg: "bg-gray-300 dark:bg-gray-500/35", text: "text-gray-700 dark:text-gray-300", locationBg: "bg-gray-400 dark:bg-gray-600/40" },
  { bg: "bg-gray-200 dark:bg-gray-500/30", text: "text-gray-700 dark:text-gray-300", locationBg: "bg-gray-300 dark:bg-gray-500/35" },
  { bg: "bg-gray-200 dark:bg-gray-500/25", text: "text-gray-600 dark:text-gray-300", locationBg: "bg-gray-300 dark:bg-gray-500/30" },
  { bg: "bg-gray-100 dark:bg-gray-500/20", text: "text-gray-600 dark:text-gray-400", locationBg: "bg-gray-200 dark:bg-gray-500/25" },
  { bg: "bg-gray-100 dark:bg-gray-500/15", text: "text-gray-500 dark:text-gray-400", locationBg: "bg-gray-200 dark:bg-gray-500/20" },
];

interface AuditTreemapCellProps {
  company: AuditCompanyData;
  colorIndex: number;
  highlightIntegrationControls: boolean;
}

function AuditTreemapCell({ company, colorIndex, highlightIntegrationControls }: AuditTreemapCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<AuditLocationData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<"left" | "right">("right");
  const cellRef = useRef<HTMLDivElement>(null);
  const colors = companyColors[colorIndex % companyColors.length];
  const hasLocations = company.locations.length > 0;
  
  const widthPercentage = Math.max(company.percentage, 15);
  
  // Check if this company has high residual risk (affected by integration controls)
  const isHighResidualRisk = company.tooltip && company.tooltip.residualRisk >= 60;
  
  // Select color scheme based on highlighting state
  let activeColors;
  if (highlightIntegrationControls) {
    activeColors = isHighResidualRisk 
      ? affectedColors[colorIndex % affectedColors.length]
      : inactiveColors[colorIndex % inactiveColors.length];
  } else {
    activeColors = colors;
  }

  const calculateTooltipPosition = () => {
    if (cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - rect.right;
      setTooltipPosition(spaceOnRight < 300 ? "left" : "right");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedLocation(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCompanyClick = () => {
    if (isOpen && selectedLocation === null) {
      setIsOpen(false);
    } else {
      calculateTooltipPosition();
      setSelectedLocation(null);
      setIsOpen(true);
    }
  };

  const handleLocationClick = (location: AuditLocationData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen && selectedLocation?.id === location.id) {
      setIsOpen(false);
      setSelectedLocation(null);
    } else {
      calculateTooltipPosition();
      setSelectedLocation(location);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedLocation(null);
  };
  
  return (
    <div 
      ref={cellRef}
      className={`${activeColors.bg} ${activeColors.text} rounded-sm overflow-visible flex flex-col relative cursor-pointer transition-colors duration-200`}
      style={{ 
        flex: `${widthPercentage} 0 0`,
        minWidth: "80px"
      }}
      data-testid={`audit-treemap-company-${company.id}`}
      onClick={handleCompanyClick}
    >
      <div className="p-2 border-b border-black/10">
        <div className="text-xs font-semibold truncate" data-testid={`text-audit-company-name-${company.id}`}>
          {company.name}
        </div>
        <div className="text-xs opacity-80" data-testid={`text-audit-company-value-${company.id}`}>
          {company.totalValue}
        </div>
      </div>
      
      {hasLocations && (
        <div className="flex-1 flex flex-col gap-px p-1">
          {company.locations.map((location) => (
            <div 
              key={location.id}
              className={`${activeColors.locationBg} rounded-sm p-1.5 flex-1 min-h-[36px] cursor-pointer transition-all hover:opacity-90 ${
                selectedLocation?.id === location.id ? "ring-2 ring-[#266C92] ring-opacity-70" : ""
              }`}
              data-testid={`audit-treemap-location-${location.id}`}
              onClick={(e) => handleLocationClick(location, e)}
            >
              <div className="text-[10px] font-medium truncate">{location.name}</div>
              <div className="text-[10px] opacity-80">{location.value}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Tooltip */}
      {isOpen && company.tooltip && (
        <AuditTreemapTooltip 
          companyName={company.name}
          locationName={selectedLocation?.name}
          tooltip={company.tooltip}
          onClose={handleClose}
          position={tooltipPosition}
        />
      )}
    </div>
  );
}

export function AuditRegionalTreemap({ region, onManageInventory, highlightIntegrationControls = false }: AuditRegionalTreemapProps) {
  return (
    <div 
      className="border border-gray-200 dark:border-border rounded-md bg-white dark:bg-card"
      data-testid={`audit-panel-region-${region.id}`}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-border">
        <div className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#266C92]" />
          {region.name}
          <Badge variant="secondary" className="ml-2 text-xs font-medium">
            {region.totalExposure}
          </Badge>
        </div>
      </div>
      
      <div className="p-3 overflow-x-auto">
        <div className="flex gap-1 min-h-[120px] min-w-[600px]" data-testid={`audit-treemap-container-${region.id}`}>
          {region.companies.map((company, index) => (
            <AuditTreemapCell 
              key={company.id} 
              company={company} 
              colorIndex={index}
              highlightIntegrationControls={highlightIntegrationControls}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuditRegionalTreemaps({ regions, highlightIntegrationControls = false }: AuditRegionalTreemapsProps) {
  return (
    <div className="space-y-4" data-testid="audit-regional-treemaps">
      {regions.map((region) => (
        <AuditRegionalTreemap 
          key={region.id} 
          region={region}
          highlightIntegrationControls={highlightIntegrationControls}
        />
      ))}
    </div>
  );
}
