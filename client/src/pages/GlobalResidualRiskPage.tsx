/**
 * GlobalResidualRiskPage (CRO Workspace)
 * 
 * Global Residual Risk dashboard for the CRO (Chief Risk Officer) workspace.
 * Focus: Tariff and Supply Chain Risk
 * 
 * Features:
 * - Top Risks & Mitigation Plans with expandable risk cards
 * - Strategic Objectives with initiative/cost tables
 * - Regional treemap visualizations for North America, EMEA, Asia Pacific
 * 
 * PATTERN: This follows the workspace dashboard pattern defined in workspaceDashboards.ts.
 * Path: /cro/global-residual-risk
 * 
 * Design follows AuditBoard's professional design system with teal #266C92 accents.
 */

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  Shield, 
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import { 
  RiskCard, 
  StrategicObjectives, 
  RegionalTreemaps,
  type RiskData,
  type StrategicObjective,
  type RegionData,
} from "@/components/risk";

const mockRisks: RiskData[] = [
  {
    id: "risk-1",
    name: "US Tariffs Enacted",
    severity: "CRITICAL",
    exposure: "$10M",
    description: "New tariff policies affecting imported goods from key supply chain partners",
    riskScore: 92,
    trendData: [
      { value: 65 }, { value: 70 }, { value: 75 }, { value: 85 }, { value: 88 }, { value: 92 }
    ],
    timeline: "Q2 2025",
    owner: undefined,
    mitigationStatus: "NOT STARTED",
    recommendedMitigations: [
      { id: "m1-1", text: "Diversify supply chain to include domestic suppliers" },
      { id: "m1-2", text: "Negotiate long-term contracts with existing vendors" },
      { id: "m1-3", text: "Implement tariff classification review process" },
    ],
    costOfMitigation: "$1M",
    costSource: "Compliance with FSMA",
    projectedImpact: "-$8.5M",
  },
  {
    id: "risk-2",
    name: "EU Regulatory Changes",
    severity: "HIGH",
    exposure: "$6.2M",
    description: "Upcoming GDPR amendments and new digital services regulations",
    riskScore: 78,
    trendData: [
      { value: 50 }, { value: 55 }, { value: 60 }, { value: 68 }, { value: 72 }, { value: 78 }
    ],
    timeline: "Q3 2025",
    owner: "Legal & Compliance",
    mitigationStatus: "IN PROGRESS",
    recommendedMitigations: [
      { id: "m2-1", text: "Update data processing agreements" },
      { id: "m2-2", text: "Implement enhanced consent management" },
      { id: "m2-3", text: "Conduct privacy impact assessments" },
    ],
    costOfMitigation: "$850K",
    costSource: "IT Infrastructure",
    projectedImpact: "-$4.8M",
  },
  {
    id: "risk-3",
    name: "Currency Fluctuation Risk",
    severity: "MEDIUM",
    exposure: "$3.8M",
    description: "Volatility in EUR/USD and GBP/USD exchange rates affecting international operations",
    riskScore: 54,
    trendData: [
      { value: 60 }, { value: 55 }, { value: 58 }, { value: 52 }, { value: 50 }, { value: 54 }
    ],
    timeline: "Ongoing",
    owner: "Treasury",
    mitigationStatus: "IN PROGRESS",
    recommendedMitigations: [
      { id: "m3-1", text: "Implement forward contracts for major currencies" },
      { id: "m3-2", text: "Natural hedging through revenue matching" },
    ],
    costOfMitigation: "$120K",
    costSource: "Hedging Instruments",
    projectedImpact: "-$2.9M",
  },
  {
    id: "risk-4",
    name: "Supplier Concentration",
    severity: "HIGH",
    exposure: "$5.1M",
    description: "Over-reliance on three key suppliers for critical components",
    riskScore: 71,
    trendData: [
      { value: 75 }, { value: 72 }, { value: 70 }, { value: 68 }, { value: 69 }, { value: 71 }
    ],
    timeline: "Q4 2025",
    owner: "Procurement",
    mitigationStatus: "NOT STARTED",
    recommendedMitigations: [
      { id: "m4-1", text: "Qualify alternative suppliers" },
      { id: "m4-2", text: "Build strategic inventory reserves" },
      { id: "m4-3", text: "Develop supplier risk monitoring program" },
    ],
    costOfMitigation: "$600K",
    costSource: "Supply Chain",
    projectedImpact: "-$3.5M",
  },
];

const mockObjectives: StrategicObjective[] = [
  {
    id: "obj-1",
    number: 1,
    title: "Expand into advanced farming",
    target: "Q3 2025",
    owner: "Innovation & Growth",
    initiatives: [
      { id: "init-1-1", name: "Precision Agriculture Platform", cost: "$2.5M" },
      { id: "init-1-2", name: "Drone Monitoring System", cost: "$800K" },
      { id: "init-1-3", name: "IoT Sensor Network", cost: "$450K" },
    ],
  },
  {
    id: "obj-2",
    number: 2,
    title: "Compliance with FSMA",
    target: "Q2 2025",
    owner: "Quality & Regulatory",
    initiatives: [
      { id: "init-2-1", name: "Traceability System Upgrade", cost: "$1.2M" },
      { id: "init-2-2", name: "Employee Training Program", cost: "$350K" },
      { id: "init-2-3", name: "Third-Party Audits", cost: "$180K" },
    ],
  },
  {
    id: "obj-3",
    number: 3,
    title: "Increase Nutrition of Top Product Lines",
    target: "Q4 2025",
    owner: "Product Development",
    initiatives: [
      { id: "init-3-1", name: "R&D Formulation Studies", cost: "$900K" },
      { id: "init-3-2", name: "Supplier Ingredient Sourcing", cost: "$400K" },
      { id: "init-3-3", name: "Consumer Testing", cost: "$150K" },
    ],
  },
];

const mockRegions: RegionData[] = [
  {
    id: "north-america",
    name: "North America",
    totalExposure: "$12.4M",
    companies: [
      {
        id: "abc-tech",
        name: "ABC Tech LLC",
        totalValue: "$4.2M",
        percentage: 34,
        color: "#266C92",
        locations: [
          { id: "dallas", name: "Dallas TX", value: "$1.8M", percentage: 43 },
          { id: "phoenix", name: "Phoenix AZ", value: "$1.4M", percentage: 33 },
          { id: "seattle", name: "Seattle WA", value: "$1.0M", percentage: 24 },
        ],
        tooltip: {
          tariffRisk: 85,
          severity: "Critical",
          dollarValue: "$1.8M",
          tariffRate: "25%",
          annualVolume: "24,000 units",
          importCountries: ["China", "Vietnam", "Taiwan"],
          affectedProductLines: ["Semiconductor Components", "Electronic Assemblies", "Industrial IoT Devices"],
          recommendedMitigations: [
            "Source semiconductors from Malaysia and Thailand suppliers",
            "Negotiate duty drawback on re-exported finished goods",
            "Apply for Section 301 tariff exclusions for critical components"
          ],
        },
      },
      {
        id: "xyz-corp",
        name: "XYZ Corp",
        totalValue: "$3.1M",
        percentage: 25,
        color: "#3a8ab5",
        locations: [
          { id: "new-york", name: "New York", value: "$1.6M", percentage: 52 },
          { id: "boston", name: "Boston", value: "$1.5M", percentage: 48 },
        ],
        tooltip: {
          tariffRisk: 72,
          severity: "High",
          dollarValue: "$3.1M",
          tariffRate: "18%",
          annualVolume: "18,500 units",
          importCountries: ["Mexico", "Canada"],
          affectedProductLines: ["Industrial Equipment", "Machinery Parts"],
          recommendedMitigations: [
            "Leverage USMCA provisions for qualifying goods",
            "Establish bonded warehouse operations"
          ],
        },
      },
      {
        id: "global-trade",
        name: "Global Trade Inc",
        totalValue: "$2.4M",
        percentage: 19,
        color: "#5ca3c7",
        locations: [
          { id: "la", name: "Los Angeles", value: "$1.4M", percentage: 58 },
          { id: "seattle", name: "Seattle", value: "$1.0M", percentage: 42 },
        ],
        tooltip: {
          tariffRisk: 58,
          severity: "Medium",
          dollarValue: "$2.4M",
          tariffRate: "12%",
          annualVolume: "32,000 units",
          importCountries: ["Japan", "South Korea"],
          affectedProductLines: ["Consumer Electronics", "Display Panels"],
          recommendedMitigations: [
            "Utilize foreign trade zone benefits",
            "Implement first sale valuation"
          ],
        },
      },
      {
        id: "supply-co",
        name: "Supply Co",
        totalValue: "$1.5M",
        percentage: 12,
        color: "#7ebdd8",
        locations: [
          { id: "denver", name: "Denver", value: "$0.9M", percentage: 60 },
          { id: "phoenix", name: "Phoenix", value: "$0.6M", percentage: 40 },
        ],
        tooltip: {
          tariffRisk: 45,
          severity: "Medium",
          dollarValue: "$1.5M",
          tariffRate: "8%",
          annualVolume: "15,000 units",
          importCountries: ["Germany", "UK"],
          affectedProductLines: ["Precision Instruments"],
          recommendedMitigations: [
            "Apply for temporary importation bonds"
          ],
        },
      },
      {
        id: "american-logistics",
        name: "American Logistics",
        totalValue: "$1.2M",
        percentage: 10,
        color: "#a0d4e8",
        locations: [
          { id: "atlanta", name: "Atlanta", value: "$1.2M", percentage: 100 },
        ],
        tooltip: {
          tariffRisk: 32,
          severity: "Low",
          dollarValue: "$1.2M",
          tariffRate: "5%",
          annualVolume: "8,000 units",
          importCountries: ["India"],
          affectedProductLines: ["Packaging Materials"],
          recommendedMitigations: [
            "Review HTS classifications for optimization"
          ],
        },
      },
    ],
  },
  {
    id: "emea",
    name: "EMEA",
    totalExposure: "$8.7M",
    companies: [
      {
        id: "euro-partners",
        name: "EU Holdings GmbH",
        totalValue: "$3.2M",
        percentage: 37,
        color: "#266C92",
        locations: [
          { id: "berlin", name: "Berlin", value: "$1.4M", percentage: 44 },
          { id: "munich", name: "Munich", value: "$1.1M", percentage: 34 },
          { id: "hamburg", name: "Hamburg", value: "$0.7M", percentage: 22 },
        ],
        tooltip: {
          tariffRisk: 68,
          severity: "High",
          dollarValue: "$3.2M",
          tariffRate: "15%",
          annualVolume: "28,000 units",
          importCountries: ["China", "South Korea", "Japan"],
          affectedProductLines: ["Automotive Components", "Industrial Machinery"],
          recommendedMitigations: [
            "Qualify EU-based alternative suppliers",
            "Apply for duty suspension on critical inputs"
          ],
        },
      },
      {
        id: "uk-solutions",
        name: "Continental Trading",
        totalValue: "$2.5M",
        percentage: 29,
        color: "#3a8ab5",
        locations: [
          { id: "paris", name: "Paris", value: "$1.6M", percentage: 64 },
          { id: "lyon", name: "Lyon", value: "$0.9M", percentage: 36 },
        ],
        tooltip: {
          tariffRisk: 52,
          severity: "Medium",
          dollarValue: "$2.5M",
          tariffRate: "10%",
          annualVolume: "19,000 units",
          importCountries: ["UK", "Switzerland"],
          affectedProductLines: ["Precision Equipment", "Medical Devices"],
          recommendedMitigations: [
            "Leverage EU trade agreements",
            "Establish regional distribution hub"
          ],
        },
      },
      {
        id: "nordic-trading",
        name: "Nordic Imports",
        totalValue: "$1.8M",
        percentage: 21,
        color: "#5ca3c7",
        locations: [
          { id: "stockholm", name: "Stockholm", value: "$1.0M", percentage: 56 },
          { id: "oslo", name: "Oslo", value: "$0.8M", percentage: 44 },
        ],
        tooltip: {
          tariffRisk: 38,
          severity: "Low",
          dollarValue: "$1.8M",
          tariffRate: "6%",
          annualVolume: "12,000 units",
          importCountries: ["Norway", "Iceland"],
          affectedProductLines: ["Marine Equipment", "Energy Systems"],
          recommendedMitigations: [
            "Utilize EEA preferential rates"
          ],
        },
      },
      {
        id: "med-supply",
        name: "Western Supply",
        totalValue: "$1.2M",
        percentage: 13,
        color: "#7ebdd8",
        locations: [
          { id: "amsterdam", name: "Amsterdam", value: "$0.9M", percentage: 75 },
          { id: "brussels", name: "Brussels", value: "$0.3M", percentage: 25 },
        ],
        tooltip: {
          tariffRisk: 28,
          severity: "Low",
          dollarValue: "$1.2M",
          tariffRate: "4%",
          annualVolume: "8,500 units",
          importCountries: ["Belgium", "Netherlands"],
          affectedProductLines: ["Logistics Equipment"],
          recommendedMitigations: [
            "Consolidate shipments for volume discounts"
          ],
        },
      },
    ],
  },
  {
    id: "asia-pacific",
    name: "Asia Pacific",
    totalExposure: "$6.3M",
    companies: [
      {
        id: "asia-tech",
        name: "Asia Tech Pte",
        totalValue: "$2.4M",
        percentage: 38,
        color: "#266C92",
        locations: [
          { id: "singapore", name: "Singapore", value: "$1.2M", percentage: 50 },
          { id: "hong-kong", name: "Hong Kong", value: "$0.8M", percentage: 33 },
          { id: "tokyo", name: "Tokyo", value: "$0.4M", percentage: 17 },
        ],
        tooltip: {
          tariffRisk: 75,
          severity: "High",
          dollarValue: "$2.4M",
          tariffRate: "20%",
          annualVolume: "35,000 units",
          importCountries: ["China", "Taiwan", "Vietnam"],
          affectedProductLines: ["Electronics", "Semiconductors", "Components"],
          recommendedMitigations: [
            "Diversify manufacturing to ASEAN countries",
            "Apply for tariff exemptions on tech components"
          ],
        },
      },
      {
        id: "pacific-partners",
        name: "Pacific Partners",
        totalValue: "$1.9M",
        percentage: 30,
        color: "#3a8ab5",
        locations: [
          { id: "sydney", name: "Sydney", value: "$1.1M", percentage: 58 },
          { id: "melbourne", name: "Melbourne", value: "$0.8M", percentage: 42 },
        ],
        tooltip: {
          tariffRisk: 42,
          severity: "Medium",
          dollarValue: "$1.9M",
          tariffRate: "8%",
          annualVolume: "15,000 units",
          importCountries: ["Australia", "New Zealand"],
          affectedProductLines: ["Agricultural Equipment", "Mining Tools"],
          recommendedMitigations: [
            "Leverage AUKUS trade benefits"
          ],
        },
      },
      {
        id: "china-trade",
        name: "China Trade Co",
        totalValue: "$1.2M",
        percentage: 19,
        color: "#5ca3c7",
        locations: [
          { id: "shanghai", name: "Shanghai", value: "$0.8M", percentage: 67 },
          { id: "beijing", name: "Beijing", value: "$0.4M", percentage: 33 },
        ],
        tooltip: {
          tariffRisk: 88,
          severity: "Critical",
          dollarValue: "$1.2M",
          tariffRate: "25%",
          annualVolume: "22,000 units",
          importCountries: ["China"],
          affectedProductLines: ["Consumer Goods", "Textiles"],
          recommendedMitigations: [
            "Shift production to Vietnam or Thailand",
            "Apply for Section 301 exclusions"
          ],
        },
      },
      {
        id: "india-solutions",
        name: "India Solutions",
        totalValue: "$0.8M",
        percentage: 13,
        color: "#7ebdd8",
        locations: [
          { id: "mumbai", name: "Mumbai", value: "$0.5M", percentage: 63 },
          { id: "bangalore", name: "Bangalore", value: "$0.3M", percentage: 37 },
        ],
        tooltip: {
          tariffRisk: 35,
          severity: "Low",
          dollarValue: "$0.8M",
          tariffRate: "5%",
          annualVolume: "10,000 units",
          importCountries: ["India"],
          affectedProductLines: ["IT Services Equipment", "Software"],
          recommendedMitigations: [
            "Utilize India FTA provisions"
          ],
        },
      },
    ],
  },
];

export default function GlobalResidualRiskPage() {
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);

  const totalExposure = "$27.4M";
  const mitigatedValue = "$19.7M";
  const residualRisk = "$7.7M";

  return (
    <AppLayout showHeader={true} showSideNav={true}>
      <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-background">
        <div className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-200 dark:border-border" data-testid="header-global-risk">
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#266C92] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-foreground" data-testid="text-page-title">
                  Global Residual Risk
                </h1>
              </div>
              <Badge variant="secondary" className="text-xs" data-testid="badge-workspace">
                CRO Workspace
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 dark:text-muted-foreground">Total Exposure</span>
                  <span className="font-bold text-red-600" data-testid="text-total-exposure">{totalExposure}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 dark:text-muted-foreground">Mitigated</span>
                  <span className="font-bold text-emerald-600" data-testid="text-mitigated">{mitigatedValue}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 dark:text-muted-foreground">Residual</span>
                  <span className="font-bold text-amber-600" data-testid="text-residual">{residualRisk}</span>
                </div>
              </div>
              
              <div className="h-6 w-px bg-gray-200 dark:bg-border" />
              
              <Button variant="outline" size="sm" data-testid="button-filter">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm" data-testid="button-refresh">
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button variant="default" size="sm" className="bg-[#266C92] hover:bg-[#1a5270]" data-testid="button-export">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="bg-white dark:bg-card border-gray-200 dark:border-border" data-testid="panel-top-risks">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Top Risks & Mitigation Plans
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockRisks.length} Risks
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3" data-testid="list-risks">
                    {mockRisks.map((risk) => (
                      <RiskCard
                        key={risk.id}
                        risk={risk}
                        isExpanded={expandedRiskId === risk.id}
                        onToggleExpand={() => 
                          setExpandedRiskId(expandedRiskId === risk.id ? null : risk.id)
                        }
                      />
                    ))}
                  </CardContent>
                </Card>

                <StrategicObjectives objectives={mockObjectives} />
              </div>

              <div className="space-y-6">
                <Card data-testid="panel-regional-exposure">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-[#266C92]" />
                      Regional Risk Exposure
                      <Badge variant="secondary" className="ml-2 text-xs">
                        3 Regions
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RegionalTreemaps 
                      regions={mockRegions} 
                      highlightTariffs={expandedRiskId === "risk-1"}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
