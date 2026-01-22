/**
 * RegionalTreemap Component
 * 
 * A sophisticated treemap visualization showing regional risk exposure
 * with nested company/location breakdowns. Used in the Global Residual Risk view.
 */

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Globe, Pin, Bookmark, MoreHorizontal, X } from "lucide-react";

export interface LocationData {
  id: string;
  name: string;
  value: string;
  percentage: number;
}

export interface CompanyTooltipData {
  tariffRisk: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  dollarValue: string;
  tariffRate: string;
  annualVolume: string;
  importCountries: string[];
  affectedProductLines: string[];
  recommendedMitigations: string[];
}

export interface CompanyData {
  id: string;
  name: string;
  totalValue: string;
  percentage: number;
  color: string;
  locations: LocationData[];
  tooltip?: CompanyTooltipData;
}

export interface RegionData {
  id: string;
  name: string;
  totalExposure: string;
  companies: CompanyData[];
}

interface RegionalTreemapProps {
  region: RegionData;
  onViewBreakdown?: () => void;
  highlightTariffs?: boolean;
}

const companyColors = [
  { bg: "bg-[#266C92]", text: "text-white", locationBg: "bg-[#1a5270]" },
  { bg: "bg-[#3a8ab5]", text: "text-white", locationBg: "bg-[#266C92]" },
  { bg: "bg-[#5ca3c7]", text: "text-white", locationBg: "bg-[#3a8ab5]" },
  { bg: "bg-[#7ebdd8]", text: "text-gray-800", locationBg: "bg-[#5ca3c7]" },
  { bg: "bg-[#a0d4e8]", text: "text-gray-800", locationBg: "bg-[#7ebdd8]" },
  { bg: "bg-[#c2e8f5]", text: "text-gray-800", locationBg: "bg-[#a0d4e8]" },
];

// Red color scheme for high tariff risk (affected) tiles
const affectedColors = [
  { bg: "bg-red-600", text: "text-white", locationBg: "bg-red-700" },
  { bg: "bg-red-500", text: "text-white", locationBg: "bg-red-600" },
  { bg: "bg-red-400", text: "text-white", locationBg: "bg-red-500" },
  { bg: "bg-red-300", text: "text-gray-800", locationBg: "bg-red-400" },
  { bg: "bg-red-200", text: "text-gray-800", locationBg: "bg-red-300" },
  { bg: "bg-red-100", text: "text-gray-800", locationBg: "bg-red-200" },
];

// Gray color scheme for non-affected tiles
const inactiveColors = [
  { bg: "bg-gray-400", text: "text-white", locationBg: "bg-gray-500" },
  { bg: "bg-gray-300", text: "text-gray-700", locationBg: "bg-gray-400" },
  { bg: "bg-gray-200", text: "text-gray-700", locationBg: "bg-gray-300" },
  { bg: "bg-gray-200", text: "text-gray-600", locationBg: "bg-gray-300" },
  { bg: "bg-gray-100", text: "text-gray-600", locationBg: "bg-gray-200" },
  { bg: "bg-gray-100", text: "text-gray-500", locationBg: "bg-gray-200" },
];

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "Critical": return "bg-red-500";
    case "High": return "bg-orange-500";
    case "Medium": return "bg-yellow-500";
    case "Low": return "bg-green-500";
    default: return "bg-gray-500";
  }
}

interface TreemapTooltipProps {
  company: CompanyData;
  location?: LocationData;
  onClose: () => void;
  position: "right" | "left";
}

function TreemapTooltip({ company, location, onClose, position }: TreemapTooltipProps) {
  const tooltip = company.tooltip;
  if (!tooltip) return null;
  
  const positionStyles = position === "right" 
    ? { top: "-10px", left: "calc(100% + 4px)" }
    : { top: "-10px", right: "calc(100% + 4px)" };
  
  return (
    <div 
      className="absolute z-50 bg-white dark:bg-card rounded-lg shadow-xl border border-gray-200 dark:border-border p-4 w-72"
      style={positionStyles}
      data-testid={`tooltip-${company.id}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-[#266C92]">
          <Pin className="w-4 h-4" />
          <span className="font-semibold text-sm">{company.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-accent rounded"
            data-testid={`button-pin-${company.id}`}
          >
            <Pin className="w-3 h-3 text-gray-400 dark:text-muted-foreground" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-accent rounded"
            data-testid={`button-bookmark-${company.id}`}
          >
            <Bookmark className="w-3 h-3 text-gray-400 dark:text-muted-foreground" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 dark:hover:bg-accent rounded"
            data-testid={`button-close-${company.id}`}
            onClick={onClose}
          >
            <X className="w-3 h-3 text-gray-400 dark:text-muted-foreground" />
          </button>
        </div>
      </div>
      
      {/* Location */}
      {location && (
        <div className="text-sm text-gray-600 dark:text-foreground mb-3">{location.name}</div>
      )}
      
      {/* Tariff Risk Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-muted-foreground uppercase">Tariff Risk</span>
          <span className="text-xl font-bold text-gray-900 dark:text-foreground">{tooltip.tariffRisk}</span>
          <Badge 
            className={`${getSeverityColor(tooltip.severity)} text-white text-[10px] px-2 py-0.5`}
          >
            {tooltip.severity}
          </Badge>
        </div>
        <span className="text-lg font-semibold text-gray-900 dark:text-foreground">{tooltip.dollarValue}</span>
      </div>
      
      {/* Tariff Rate & Annual Volume */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase tracking-wide">Tariff Rate</div>
          <div className="text-sm font-semibold text-[#266C92]">{tooltip.tariffRate}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase tracking-wide">Annual Volume</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-foreground">{tooltip.annualVolume}</div>
        </div>
      </div>
      
      {/* Import Countries */}
      <div className="mb-4">
        <div className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase tracking-wide mb-1">Import Countries</div>
        <div className="flex flex-wrap gap-1">
          {tooltip.importCountries.map((country, idx) => (
            <Badge 
              key={idx} 
              variant="outline" 
              className="text-[10px] px-2 py-0.5 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-700 dark:text-foreground"
            >
              {country}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Affected Product Lines */}
      <div className="mb-4">
        <div className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase tracking-wide mb-1">Affected Product Lines</div>
        <ul className="space-y-0.5">
          {tooltip.affectedProductLines.map((line, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs text-gray-700 dark:text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-[#266C92]"></span>
              {line}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Recommended Mitigations */}
      <div>
        <div className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase tracking-wide mb-1">Recommended Mitigations</div>
        <ul className="space-y-0.5">
          {tooltip.recommendedMitigations.map((mitigation, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-foreground">
              <span className="w-1 h-1 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
              {mitigation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TreemapCell({ 
  company, 
  colorIndex,
  highlightTariffs = false
}: { 
  company: CompanyData; 
  colorIndex: number;
  highlightTariffs?: boolean;
}) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<"right" | "left">("right");
  const cellRef = useRef<HTMLDivElement>(null);
  const colors = companyColors[colorIndex % companyColors.length];
  const hasLocations = company.locations.length > 0;
  
  const widthPercentage = Math.max(company.percentage, 15);
  
  // Determine if this company/location should be highlighted based on tariff risk
  const isHighTariffRisk = company.tooltip && company.tooltip.tariffRisk >= 60;
  
  // Select color scheme based on highlighting state
  let activeColors;
  if (highlightTariffs) {
    // When tariff highlighting is active, use red for affected, gray for non-affected
    activeColors = isHighTariffRisk 
      ? affectedColors[colorIndex % affectedColors.length]
      : inactiveColors[colorIndex % inactiveColors.length];
  } else {
    // Normal mode - use teal color scheme
    activeColors = colors;
  }

  // Calculate tooltip position based on available space
  const calculateTooltipPosition = () => {
    if (cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      const tooltipWidth = 288; // w-72 = 18rem = 288px
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - rect.right;
      
      // If not enough space on right, show on left
      if (spaceOnRight < tooltipWidth + 20) {
        setTooltipPosition("left");
      } else {
        setTooltipPosition("right");
      }
    }
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedLocation(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCompanyClick = () => {
    if (isOpen && selectedLocation === null) {
      // If tooltip is open at company level, close it
      setIsOpen(false);
    } else {
      // Open tooltip at company level
      calculateTooltipPosition();
      setSelectedLocation(null);
      setIsOpen(true);
    }
  };

  const handleLocationClick = (location: LocationData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen && selectedLocation?.id === location.id) {
      // Clicking same location closes tooltip
      setIsOpen(false);
      setSelectedLocation(null);
    } else {
      // Open/switch to new location
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
      data-testid={`treemap-company-${company.id}`}
      onClick={handleCompanyClick}
    >
      <div className="p-2 border-b border-black/10">
        <div className="text-xs font-semibold truncate" data-testid={`text-company-name-${company.id}`}>
          {company.name}
        </div>
        <div className="text-xs opacity-80" data-testid={`text-company-value-${company.id}`}>
          {company.totalValue}
        </div>
      </div>
      
      {hasLocations && (
        <div className="flex-1 flex flex-col gap-px p-1">
          {company.locations.map((location) => (
            <div 
              key={location.id}
              className={`${activeColors.locationBg} rounded-sm p-1.5 flex-1 min-h-[36px] cursor-pointer transition-all hover:opacity-90 ${
                selectedLocation?.id === location.id ? "ring-2 ring-white ring-opacity-50" : ""
              }`}
              data-testid={`treemap-location-${location.id}`}
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
        <TreemapTooltip 
          company={company} 
          location={selectedLocation || undefined} 
          onClose={handleClose}
          position={tooltipPosition}
        />
      )}
    </div>
  );
}

export function RegionalTreemap({ region, onViewBreakdown, highlightTariffs = false }: RegionalTreemapProps) {
  return (
    <div 
      className="border border-gray-200 dark:border-border rounded-md bg-white dark:bg-card"
      data-testid={`panel-region-${region.id}`}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-border">
        <div className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#266C92]" />
          {region.name}
          <Badge variant="secondary" className="ml-2 text-xs font-medium">
            {region.totalExposure}
          </Badge>
        </div>
        {onViewBreakdown && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs text-[#266C92] hover:text-[#1a5270]"
            onClick={onViewBreakdown}
            data-testid={`button-view-breakdown-${region.id}`}
          >
            View Breakdown
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
      <div className="p-4">
        <div 
          className="flex gap-1 h-48 rounded-md overflow-visible border border-gray-200"
          data-testid={`treemap-container-${region.id}`}
        >
          {region.companies.map((company, index) => (
            <TreemapCell 
              key={company.id} 
              company={company} 
              colorIndex={index}
              highlightTariffs={highlightTariffs}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface RegionalTreemapsProps {
  regions: RegionData[];
  highlightTariffs?: boolean;
}

export function RegionalTreemaps({ regions, highlightTariffs = false }: RegionalTreemapsProps) {
  return (
    <div className="space-y-4" data-testid="panel-regional-treemaps">
      {regions.map((region) => (
        <RegionalTreemap 
          key={region.id} 
          region={region}
          onViewBreakdown={() => console.log(`View breakdown for ${region.name}`)}
          highlightTariffs={highlightTariffs}
        />
      ))}
    </div>
  );
}
