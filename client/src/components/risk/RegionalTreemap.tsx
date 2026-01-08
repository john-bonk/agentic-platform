/**
 * RegionalTreemap Component
 * 
 * A sophisticated treemap visualization showing regional risk exposure
 * with nested company/location breakdowns. Used in the Global Residual Risk view.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Globe } from "lucide-react";

export interface LocationData {
  id: string;
  name: string;
  value: string;
  percentage: number;
}

export interface CompanyData {
  id: string;
  name: string;
  totalValue: string;
  percentage: number;
  color: string;
  locations: LocationData[];
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

function TreemapCell({ 
  company, 
  colorIndex 
}: { 
  company: CompanyData; 
  colorIndex: number;
}) {
  const colors = companyColors[colorIndex % companyColors.length];
  const hasLocations = company.locations.length > 0;
  
  const widthPercentage = Math.max(company.percentage, 15);
  
  return (
    <div 
      className={`${colors.bg} ${colors.text} rounded-sm overflow-hidden flex flex-col`}
      style={{ 
        flex: `${widthPercentage} 0 0`,
        minWidth: "80px"
      }}
      data-testid={`treemap-company-${company.id}`}
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
              className={`${colors.locationBg} rounded-sm p-1.5 flex-1 min-h-[28px]`}
              data-testid={`treemap-location-${location.id}`}
            >
              <div className="text-[10px] font-medium truncate">{location.name}</div>
              <div className="text-[10px] opacity-80">{location.value}</div>
            </div>
          ))}
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
          className="flex gap-1 h-32 rounded-md overflow-hidden border border-gray-200"
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
