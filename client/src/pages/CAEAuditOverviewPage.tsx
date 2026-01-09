/**
 * CAEAuditOverviewPage
 * 
 * A sophisticated dashboard for the CAE (Chief Audit Executive) workspace displaying:
 * - Overview: M&A Audit and Compliance
 * - Top Risks and Mitigation Plans with expandable audit risk cards
 * - Strategic Audit Objectives with progress tracking
 * - Critical Audit Areas treemap with audit-focused tooltips
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
  ClipboardCheck, 
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
  Share2,
  MoreHorizontal,
  Pin,
} from "lucide-react";
import { 
  AuditRiskCard, 
  StrategicAuditObjectives, 
  AuditRegionalTreemaps,
  type AuditRiskData,
  type StrategicAuditObjective,
  type AuditRegionData,
} from "@/components/risk";

const mockAuditRisks: AuditRiskData[] = [
  {
    id: "audit-risk-1",
    name: "Post-Merger Integration Controls",
    severity: "CRITICAL",
    exposure: "$8.8M",
    description: "Acquired entities requiring updated controls and compliance assessment",
    riskScore: 90,
    trendData: [
      { value: 70 }, { value: 75 }, { value: 80 }, { value: 85 }, { value: 88 }, { value: 90 }
    ],
    auditHours: 2840,
    deficiencies: 120,
    owner: "Ops Manager",
    status: "IN PROGRESS",
    recommendedMitigations: [
      { id: "am1-1", text: "Resolve material weakness for new entities lacking documented financial close process" },
      { id: "am1-2", text: "Address significant deficiency in IT controls covering gaps across 6 systems" },
      { id: "am1-3", text: "Close compliance gaps from incomplete SOX scoping for new Singapore entity" },
    ],
    costOfRemediation: "$2.1M",
    costSource: "Control remediation + documentation",
    controlEffectivenessImprovement: "+47%",
    controlEffectivenessDescription: "Projected compliance readiness improves through targeted remediation of 120 material deficiencies",
  },
  {
    id: "audit-risk-2",
    name: "Data Governance & Privacy Controls",
    severity: "HIGH",
    exposure: "$6.8M",
    description: "GDPR and data residency compliance validation for Singapore acquisition",
    riskScore: 76,
    trendData: [
      { value: 55 }, { value: 60 }, { value: 65 }, { value: 70 }, { value: 73 }, { value: 76 }
    ],
    auditHours: 1650,
    deficiencies: 45,
    owner: "Data Privacy Officer",
    status: "IN PROGRESS",
    recommendedMitigations: [
      { id: "am2-1", text: "Conduct data mapping and classification for acquired entities" },
      { id: "am2-2", text: "Implement data residency controls for Singapore operations" },
      { id: "am2-3", text: "Update privacy policies and consent mechanisms" },
    ],
    costOfRemediation: "$1.4M",
    costSource: "Privacy infrastructure + legal review",
    controlEffectivenessImprovement: "+32%",
    controlEffectivenessDescription: "Enhanced data governance posture through comprehensive privacy controls implementation",
  },
  {
    id: "audit-risk-3",
    name: "Third-Party Vendor Due Diligence",
    severity: "MEDIUM",
    exposure: "$4.2M",
    description: "238 inherited vendor relationships requiring compliance and risk assessment",
    riskScore: 64,
    trendData: [
      { value: 68 }, { value: 66 }, { value: 65 }, { value: 64 }, { value: 63 }, { value: 64 }
    ],
    auditHours: 980,
    deficiencies: 28,
    owner: "Vendor Management",
    status: "IN PROGRESS",
    recommendedMitigations: [
      { id: "am3-1", text: "Complete vendor risk assessments for all critical suppliers" },
      { id: "am3-2", text: "Establish ongoing monitoring program for high-risk vendors" },
    ],
    costOfRemediation: "$680K",
    costSource: "Assessment tools + personnel",
    controlEffectivenessImprovement: "+24%",
    controlEffectivenessDescription: "Improved third-party risk visibility through standardized assessment framework",
  },
];

const mockAuditObjectives: StrategicAuditObjective[] = [
  {
    id: "obj-1",
    title: "Complete SOX 404 Scoping for Acquired Entities",
    description: "Finalize control documentation and risk assessment for 47 entities",
    progress: 68,
    status: "In Progress",
    dueDate: "Dec 31, 2024",
    owner: "Internal Audit",
  },
  {
    id: "obj-2",
    title: "Remediate Material Weaknesses in Financial Controls",
    description: "Address 23 entities lacking documented financial close procedures",
    progress: 42,
    status: "In Progress",
    dueDate: "Q1 2025",
    owner: "Controller's Org",
  },
  {
    id: "obj-3",
    title: "Validate IT General Controls Across Legacy Systems",
    description: "Implement access controls and monitoring for 41 critical applications",
    progress: 31,
    status: "In Progress",
    dueDate: "Q2 2025",
    owner: "IT Security",
  },
];

const mockAuditRegions: AuditRegionData[] = [
  {
    id: "asia-pacific",
    name: "Asia Pacific",
    totalExposure: "$8.2M",
    companies: [
      {
        id: "sea-foodsource",
        name: "SEA FoodSource (Singapore)",
        totalValue: "$4.8M",
        percentage: 58,
        color: "#266C92",
        locations: [
          { id: "se-east-ap", name: "SE East - AP", value: "$4.8M", percentage: 100 },
        ],
        tooltip: {
          residualRisk: 94,
          severity: "Critical",
          dollarValue: "$4.8M",
          facilityName: "Singapore East - Algae Proteins",
          parentCompany: "SEA FoodSource (Singapore)",
          region: "Asia Pacific",
          recentAuditTests: [
            { id: "t1", name: "Financial Controls", date: "Oct 15, 2025", status: "passed" },
            { id: "t2", name: "IT General Controls", date: "Sep 28, 2025", status: "warning" },
            { id: "t3", name: "SOX 404 Compliance", date: "Aug 12, 2025", status: "passed" },
          ],
          issuesPastSLA: [
            { id: "i1", title: "Control Deficiency - Access Reviews", dueDate: "Dec 1, 2025", assignee: "IT Security", status: "OVERDUE" },
            { id: "i2", title: "Documentation Gap - Financial Close", dueDate: "Dec 1, 2025", assignee: "Controller", status: "OVERDUE" },
            { id: "i3", title: "SOX Scoping Incomplete", dueDate: "Dec 31, 2025", assignee: "Internal Audit", status: "AT RISK" },
          ],
          auditObjectives: { complete: 6, inProgress: 5, overdue: 3 },
        },
      },
      {
        id: "sea-regional",
        name: "SEA Regional Holdings",
        totalValue: "$3.4M",
        percentage: 42,
        color: "#3a8ab5",
        locations: [
          { id: "se-west-ap", name: "SE West - AP", value: "$3.5M", percentage: 41 },
          { id: "se-east-hm", name: "SE East - HM", value: "$4.2M", percentage: 49 },
          { id: "se-hq", name: "SE - HQ", value: "$2.6M", percentage: 31 },
        ],
        tooltip: {
          residualRisk: 72,
          severity: "High",
          dollarValue: "$3.4M",
          facilityName: "SE West - Asia Pacific",
          parentCompany: "SEA Regional Holdings",
          region: "Asia Pacific",
          recentAuditTests: [
            { id: "t4", name: "Financial Controls", date: "Oct 20, 2025", status: "passed" },
            { id: "t5", name: "IT General Controls", date: "Sep 15, 2025", status: "passed" },
          ],
          issuesPastSLA: [
            { id: "i4", title: "Vendor Assessment Pending", dueDate: "Nov 30, 2025", assignee: "Procurement", status: "OVERDUE" },
          ],
          auditObjectives: { complete: 8, inProgress: 3, overdue: 1 },
        },
      },
    ],
  },
  {
    id: "north-america",
    name: "North America",
    totalExposure: "$6.8M",
    companies: [
      {
        id: "evergrow-logistics",
        name: "Evergrow Logistics",
        totalValue: "$2.1M",
        percentage: 31,
        color: "#266C92",
        locations: [
          { id: "us-west-agro", name: "US West - Agro", value: "$3.4M", percentage: 50 },
          { id: "us-mid-pro", name: "US - Mid Pro", value: "$2.9M", percentage: 43 },
        ],
        tooltip: {
          residualRisk: 45,
          severity: "Medium",
          dollarValue: "$2.1M",
          facilityName: "US West - Agro Processing",
          parentCompany: "Evergrow Logistics",
          region: "North America",
          recentAuditTests: [
            { id: "t6", name: "Financial Controls", date: "Nov 1, 2025", status: "passed" },
            { id: "t7", name: "Operational Controls", date: "Oct 15, 2025", status: "passed" },
          ],
          issuesPastSLA: [],
          auditObjectives: { complete: 10, inProgress: 2, overdue: 0 },
        },
      },
      {
        id: "climatecare-ventures",
        name: "ClimateCare Ventures",
        totalValue: "$2.8M",
        percentage: 41,
        color: "#3a8ab5",
        locations: [
          { id: "mx-cf", name: "MX - CF", value: "$2.4M", percentage: 86 },
        ],
        tooltip: {
          residualRisk: 58,
          severity: "Medium",
          dollarValue: "$2.8M",
          facilityName: "Mexico - Carbon Facility",
          parentCompany: "ClimateCare Ventures",
          region: "North America",
          recentAuditTests: [
            { id: "t8", name: "Environmental Controls", date: "Oct 25, 2025", status: "passed" },
            { id: "t9", name: "Financial Controls", date: "Sep 30, 2025", status: "warning" },
          ],
          issuesPastSLA: [
            { id: "i5", title: "Emission Reporting Gap", dueDate: "Dec 15, 2025", assignee: "ESG Team", status: "AT RISK" },
          ],
          auditObjectives: { complete: 7, inProgress: 4, overdue: 1 },
        },
      },
      {
        id: "nuharvest-innovations",
        name: "NuHarvest Innovations",
        totalValue: "$1.9M",
        percentage: 28,
        color: "#5ca3c7",
        locations: [
          { id: "ca-se-pack", name: "CA - SE Pack", value: "$2.8M", percentage: 74 },
        ],
        tooltip: {
          residualRisk: 38,
          severity: "Low",
          dollarValue: "$1.9M",
          facilityName: "California - SE Packaging",
          parentCompany: "NuHarvest Innovations",
          region: "North America",
          recentAuditTests: [
            { id: "t10", name: "Quality Controls", date: "Nov 5, 2025", status: "passed" },
            { id: "t11", name: "Safety Controls", date: "Oct 20, 2025", status: "passed" },
          ],
          issuesPastSLA: [],
          auditObjectives: { complete: 12, inProgress: 1, overdue: 0 },
        },
      },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    totalExposure: "$4.5M",
    companies: [
      {
        id: "suncoast-foods",
        name: "SunCoast Foods",
        totalValue: "$1.8M",
        percentage: 40,
        color: "#266C92",
        locations: [
          { id: "de-north", name: "DE - North", value: "$3.6M", percentage: 80 },
        ],
        tooltip: {
          residualRisk: 52,
          severity: "Medium",
          dollarValue: "$1.8M",
          facilityName: "Germany - North Distribution",
          parentCompany: "SunCoast Foods",
          region: "Europe",
          recentAuditTests: [
            { id: "t12", name: "GDPR Compliance", date: "Oct 30, 2025", status: "passed" },
            { id: "t13", name: "Financial Controls", date: "Sep 25, 2025", status: "passed" },
          ],
          issuesPastSLA: [],
          auditObjectives: { complete: 9, inProgress: 2, overdue: 0 },
        },
      },
      {
        id: "greenfoods-holding",
        name: "GreenFoods Holding",
        totalValue: "$1.5M",
        percentage: 33,
        color: "#3a8ab5",
        locations: [
          { id: "fr-south", name: "FR - South", value: "$1.7M", percentage: 57 },
          { id: "uk-central", name: "UK - Central", value: "$3M", percentage: 100 },
        ],
        tooltip: {
          residualRisk: 48,
          severity: "Medium",
          dollarValue: "$1.5M",
          facilityName: "France - South Processing",
          parentCompany: "GreenFoods Holding",
          region: "Europe",
          recentAuditTests: [
            { id: "t14", name: "Food Safety Controls", date: "Nov 2, 2025", status: "passed" },
            { id: "t15", name: "IT Controls", date: "Oct 18, 2025", status: "passed" },
          ],
          issuesPastSLA: [],
          auditObjectives: { complete: 11, inProgress: 2, overdue: 0 },
        },
      },
      {
        id: "agrihub-dist",
        name: "AgriHub Dist.",
        totalValue: "$1.2M",
        percentage: 27,
        color: "#5ca3c7",
        locations: [
          { id: "uk-innov", name: "UK - Innov", value: "$2.1M", percentage: 88 },
        ],
        tooltip: {
          residualRisk: 35,
          severity: "Low",
          dollarValue: "$1.2M",
          facilityName: "UK - Innovation Center",
          parentCompany: "AgriHub Dist.",
          region: "Europe",
          recentAuditTests: [
            { id: "t16", name: "R&D Controls", date: "Nov 8, 2025", status: "passed" },
            { id: "t17", name: "IP Protection", date: "Oct 22, 2025", status: "passed" },
          ],
          issuesPastSLA: [],
          auditObjectives: { complete: 13, inProgress: 0, overdue: 0 },
        },
      },
    ],
  },
];

export default function CAEAuditOverviewPage() {
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);

  return (
    <AppLayout showHeader={true} showSideNav={true}>
      <div className="flex flex-col h-full overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200" data-testid="header-cae-audit">
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#266C92] flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900" data-testid="text-cae-page-title">
                  Overview: M&A Audit and Compliance
                </h1>
              </div>
              <Badge variant="secondary" className="text-xs" data-testid="badge-cae-workspace">
                CAE Workspace
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-pin">
                <Pin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-share">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-more">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Risks and Objectives */}
              <div className="space-y-6">
                <Card data-testid="panel-top-audit-risks">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Top Risks and Mitigation Plans
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockAuditRisks.length} Risks
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3" data-testid="list-audit-risks">
                    {mockAuditRisks.map((risk) => (
                      <AuditRiskCard
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

                <StrategicAuditObjectives objectives={mockAuditObjectives} />
              </div>

              {/* Right Column - Critical Audit Areas */}
              <div className="space-y-6">
                <Card data-testid="panel-critical-audit-areas">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-[#266C92]" />
                      Critical Audit Areas
                      <Badge variant="secondary" className="ml-2 text-xs">
                        3 Regions
                      </Badge>
                    </CardTitle>
                    <Button 
                      variant="link" 
                      className="text-[#266C92] text-sm p-0 h-auto"
                      data-testid="button-manage-inventory"
                    >
                      Manage Inventory
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <AuditRegionalTreemaps 
                      regions={mockAuditRegions} 
                      highlightIntegrationControls={expandedRiskId === "audit-risk-1"}
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
