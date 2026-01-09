/**
 * RegionalTreemap Component
 * 
 * A sophisticated treemap visualization showing regional risk exposure
 * with nested company/location breakdowns. Used in the Global Residual Risk view.
 */

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Globe, Pin, Bookmark, MoreHorizontal } from "lucide-react";

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
}

const companyColors = [
  { bg: "bg-[#266C92]", text: "text-white", locationBg: "bg-[#1a5270]" },
  { bg: "bg-[#3a8ab5]", text: "text-white", locationBg: "bg-[#266C92]" },
  { bg: "bg-[#5ca3c7]", text: "text-white", locationBg: "bg-[#3a8ab5]" },
  { bg: "bg-[#7ebdd8]", text: "text-gray-800", locationBg: "bg-[#5ca3c7]" },
  { bg: "bg-[#a0d4e8]", text: "text-gray-800", locationBg: "bg-[#7ebdd8]" },
  { bg: "bg-[#c2e8f5]", text: "text-gray-800", locationBg: "bg-[#a0d4e8]" },
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
}

function TreemapTooltip({ company, location }: TreemapTooltipProps) {
  const tooltip = company.tooltip;
  if (!tooltip) return null;
  
  return (
    <div 
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72"
      style={{ 
        top: "-10px",
        left: "calc(100% - 4px)"
      }}
      data-testid={`tooltip-${company.id}`}
    >
      {/* Header with actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-[#266C92]">
          <Pin className="w-4 h-4" />
          <span className="font-semibold text-sm">{company.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            data-testid={`button-pin-${company.id}`}
          >
            <Pin className="w-3 h-3 text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            data-testid={`button-bookmark-${company.id}`}
          >
            <Bookmark className="w-3 h-3 text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            data-testid={`button-more-${company.id}`}
          >
            <MoreHorizontal className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Location */}
      {location && (
        <div className="text-sm text-gray-600 mb-3">{location.name}</div>
      )}
      
      {/* Tariff Risk Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase">Tariff Risk</span>
          <span className="text-xl font-bold text-gray-900">{tooltip.tariffRisk}</span>
          <Badge 
            className={`${getSeverityColor(tooltip.severity)} text-white text-[10px] px-2 py-0.5`}
          >
            {tooltip.severity}
          </Badge>
        </div>
        <span className="text-lg font-semibold text-gray-900">{tooltip.dollarValue}</span>
      </div>
      
      {/* Tariff Rate & Annual Volume */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Tariff Rate</div>
          <div className="text-sm font-semibold text-[#266C92]">{tooltip.tariffRate}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Annual Volume</div>
          <div className="text-sm font-semibold text-gray-900">{tooltip.annualVolume}</div>
        </div>
      </div>
      
      {/* Import Countries */}
      <div className="mb-4">
        <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Import Countries</div>
        <div className="flex flex-wrap gap-1">
          {tooltip.importCountries.map((country, idx) => (
            <Badge 
              key={idx} 
              variant="outline" 
              className="text-[10px] px-2 py-0.5 bg-gray-50 border-gray-200 text-gray-700"
            >
              {country}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Affected Product Lines */}
      <div className="mb-4">
        <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Affected Product Lines</div>
        <ul className="space-y-0.5">
          {tooltip.affectedProductLines.map((line, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#266C92]"></span>
              {line}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Recommended Mitigations */}
      <div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Recommended Mitigations</div>
        <ul className="space-y-0.5">
          {tooltip.recommendedMitigations.map((mitigation, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
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
  colorIndex 
}: { 
  company: CompanyData; 
  colorIndex: number;
}) {
  const [hoveredLocation, setHoveredLocation] = useState<LocationData | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colors = companyColors[colorIndex % companyColors.length];
  const hasLocations = company.locations.length > 0;
  
  const widthPercentage = Math.max(company.percentage, 15);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setHoveredLocation(null);
    }, 200);
  };
  
  return (
    <div 
      className={`${colors.bg} ${colors.text} rounded-sm overflow-visible flex flex-col relative`}
      style={{ 
        flex: `${widthPercentage} 0 0`,
        minWidth: "80px"
      }}
      data-testid={`treemap-company-${company.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-2 border-b border-white/20">
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
              className={`${colors.locationBg} rounded-sm p-1.5 flex-1 min-h-[36px] cursor-pointer transition-opacity hover:opacity-90`}
              data-testid={`treemap-location-${location.id}`}
              onMouseEnter={() => setHoveredLocation(location)}
            >
              <div className="text-[10px] font-medium truncate">{location.name}</div>
              <div className="text-[10px] opacity-80">{location.value}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Tooltip */}
      {isHovered && company.tooltip && (
        <div 
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave}
        >
          <TreemapTooltip company={company} location={hoveredLocation || undefined} />
        </div>
      )}
    </div>
  );
}

export function RegionalTreemap({ region, onViewBreakdown }: RegionalTreemapProps) {
  return (
    <div 
      className="border border-gray-200 rounded-md bg-white"
      data-testid={`panel-region-${region.id}`}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface RegionalTreemapsProps {
  regions: RegionData[];
}

export function RegionalTreemaps({ regions }: RegionalTreemapsProps) {
  return (
    <div className="space-y-4" data-testid="panel-regional-treemaps">
      {regions.map((region) => (
        <RegionalTreemap 
          key={region.id} 
          region={region}
          onViewBreakdown={() => console.log(`View breakdown for ${region.name}`)}
        />
      ))}
    </div>
  );
}
