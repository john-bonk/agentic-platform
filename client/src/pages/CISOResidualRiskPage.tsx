/**
 * CISOResidualRiskPage
 * 
 * Global Residual Risk dashboard for the CISO (Chief Information Security Officer) workspace.
 * Focus: Cybersecurity Risk Management
 * 
 * Features:
 * - Critical Vendor Security Risks with expandable cyber risk cards
 * - Strategic Security Objectives with progress tracking
 * - Tier 1/2 Vendor treemaps with security-focused tooltips
 * 
 * PATTERN: This follows the workspace dashboard pattern defined in workspaceDashboards.ts.
 * Path: /ciso/global-residual-risk
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
  Shield, 
  Share2,
  MoreHorizontal,
  Pin,
  Bug,
  Server,
} from "lucide-react";
import { 
  AuditRiskCard, 
  StrategicAuditObjectives, 
  AuditRegionalTreemaps,
  type AuditRiskData,
  type StrategicAuditObjective,
  type AuditRegionData,
} from "@/components/risk";

const mockCyberRisks: AuditRiskData[] = [
  {
    id: "cyber-risk-1",
    name: "Log4j Vulnerability in Vendor Systems",
    severity: "CRITICAL",
    exposure: "$10.0M",
    description: "Critical remote code execution vulnerability (CVE-2021-44228) identified in 23 vendor applications",
    riskScore: 95,
    trendData: [
      { value: 78 }, { value: 82 }, { value: 88 }, { value: 92 }, { value: 94 }, { value: 95 }
    ],
    auditHours: 1240,
    deficiencies: 47,
    owner: "Security Operations",
    status: "IN PROGRESS",
    recommendedMitigations: [
      { id: "cm1-1", text: "Deploy emergency patches for Apache Log4j across all affected vendor systems within 72 hours" },
      { id: "cm1-2", text: "Implement WAF rules to block known Log4j exploit patterns across perimeter" },
      { id: "cm1-3", text: "Enable enhanced logging and SIEM correlation for Log4j attack indicators" },
    ],
    costOfRemediation: "$3.2M",
    costSource: "Emergency patching + vendor coordination",
    controlEffectivenessImprovement: "+62%",
    controlEffectivenessDescription: "Attack surface reduction through coordinated vendor patch deployment and compensating controls",
  },
  {
    id: "cyber-risk-2",
    name: "Third-Party Data Breach Exposure",
    severity: "HIGH",
    exposure: "$6.2M",
    description: "Sensitive data shared with 47 vendors lacking adequate security controls",
    riskScore: 82,
    trendData: [
      { value: 65 }, { value: 70 }, { value: 74 }, { value: 78 }, { value: 80 }, { value: 82 }
    ],
    auditHours: 890,
    deficiencies: 31,
    owner: "Vendor Risk Management",
    status: "IN PROGRESS",
    recommendedMitigations: [
      { id: "cm2-1", text: "Complete security assessments for all Tier 1 vendors handling PII/PHI" },
      { id: "cm2-2", text: "Implement data loss prevention controls for vendor data sharing" },
      { id: "cm2-3", text: "Require SOC 2 Type II attestation from critical vendors" },
    ],
    costOfRemediation: "$1.8M",
    costSource: "Vendor assessments + DLP implementation",
    controlEffectivenessImprovement: "+44%",
    controlEffectivenessDescription: "Enhanced third-party risk visibility through continuous monitoring and contractual security requirements",
  },
  {
    id: "cyber-risk-3",
    name: "Network Segmentation Gaps",
    severity: "HIGH",
    exposure: "$4.8M",
    description: "Legacy infrastructure lacking proper network isolation between critical and non-critical systems",
    riskScore: 71,
    trendData: [
      { value: 75 }, { value: 73 }, { value: 72 }, { value: 71 }, { value: 71 }, { value: 71 }
    ],
    auditHours: 620,
    deficiencies: 18,
    owner: "Network Security",
    status: "IN PROGRESS",
    recommendedMitigations: [
      { id: "cm3-1", text: "Implement zero-trust microsegmentation for crown jewel systems" },
      { id: "cm3-2", text: "Deploy next-gen firewalls at critical network boundaries" },
    ],
    costOfRemediation: "$2.4M",
    costSource: "Infrastructure modernization",
    controlEffectivenessImprovement: "+38%",
    controlEffectivenessDescription: "Reduced lateral movement risk through zero-trust architecture implementation",
  },
  {
    id: "cyber-risk-4",
    name: "Privileged Access Management Deficiencies",
    severity: "MEDIUM",
    exposure: "$3.1M",
    description: "Insufficient controls over administrative accounts across cloud and on-premise environments",
    riskScore: 58,
    trendData: [
      { value: 62 }, { value: 61 }, { value: 60 }, { value: 59 }, { value: 58 }, { value: 58 }
    ],
    auditHours: 480,
    deficiencies: 12,
    owner: "Identity & Access",
    status: "IN PROGRESS",
    recommendedMitigations: [
      { id: "cm4-1", text: "Deploy PAM solution with just-in-time access provisioning" },
      { id: "cm4-2", text: "Implement session recording for all privileged access" },
    ],
    costOfRemediation: "$890K",
    costSource: "PAM platform + integration",
    controlEffectivenessImprovement: "+29%",
    controlEffectivenessDescription: "Improved privileged access governance through automated controls and monitoring",
  },
];

const mockSecurityObjectives: StrategicAuditObjective[] = [
  {
    id: "sec-obj-1",
    title: "Emergency Vendor Patching Initiative",
    description: "Complete Log4j remediation across all 23 affected vendor applications",
    progress: 43,
    status: "In Progress",
    dueDate: "Jan 15, 2026",
    owner: "Security Operations",
  },
  {
    id: "sec-obj-2",
    title: "Zero-Trust Network Segmentation",
    description: "Implement microsegmentation for 15 critical application environments",
    progress: 28,
    status: "In Progress",
    dueDate: "Q1 2026",
    owner: "Network Security",
  },
  {
    id: "sec-obj-3",
    title: "Third-Party Security Assessment Program",
    description: "Complete security reviews for all 47 Tier 1 vendors with data access",
    progress: 61,
    status: "In Progress",
    dueDate: "Feb 28, 2026",
    owner: "Vendor Risk Management",
  },
];

const mockVendorTiers: AuditRegionData[] = [
  {
    id: "tier-1-critical",
    name: "Tier 1 - Critical Vendors",
    totalExposure: "$12.4M",
    companies: [
      {
        id: "apache-software",
        name: "Apache Software Foundation",
        totalValue: "$6.2M",
        percentage: 50,
        color: "#266C92",
        locations: [
          { id: "log4j-libs", name: "Log4j Libraries", value: "$4.8M", percentage: 77 },
          { id: "tomcat-server", name: "Tomcat Server", value: "$1.4M", percentage: 23 },
        ],
        tooltip: {
          residualRisk: 95,
          severity: "Critical",
          dollarValue: "$6.2M",
          facilityName: "Apache Log4j Framework",
          parentCompany: "Apache Software Foundation",
          region: "Open Source Dependencies",
          recentAuditTests: [
            { id: "t1", name: "Vulnerability Scan", date: "Jan 5, 2026", status: "failed" },
            { id: "t2", name: "Patch Validation", date: "Jan 3, 2026", status: "warning" },
            { id: "t3", name: "Exploit Testing", date: "Dec 28, 2025", status: "failed" },
          ],
          issuesPastSLA: [
            { id: "i1", title: "CVE-2021-44228 Unpatched", dueDate: "Dec 20, 2025", assignee: "SecOps Team", status: "OVERDUE" },
            { id: "i2", title: "Log4j 2.17.0 Deployment Pending", dueDate: "Jan 2, 2026", assignee: "Platform Team", status: "OVERDUE" },
            { id: "i3", title: "WAF Rule Updates Required", dueDate: "Jan 8, 2026", assignee: "Network Security", status: "AT RISK" },
          ],
          auditObjectives: { complete: 2, inProgress: 8, overdue: 4 },
        },
      },
      {
        id: "amazon-web-services",
        name: "Amazon Web Services",
        totalValue: "$3.8M",
        percentage: 31,
        color: "#3a8ab5",
        locations: [
          { id: "aws-eks", name: "EKS Clusters", value: "$2.1M", percentage: 55 },
          { id: "aws-lambda", name: "Lambda Functions", value: "$1.7M", percentage: 45 },
        ],
        tooltip: {
          residualRisk: 68,
          severity: "High",
          dollarValue: "$3.8M",
          facilityName: "AWS Cloud Infrastructure",
          parentCompany: "Amazon Web Services",
          region: "Cloud Service Providers",
          recentAuditTests: [
            { id: "t4", name: "Security Config Review", date: "Jan 6, 2026", status: "warning" },
            { id: "t5", name: "IAM Policy Audit", date: "Dec 30, 2025", status: "passed" },
          ],
          issuesPastSLA: [
            { id: "i4", title: "S3 Bucket Exposure", dueDate: "Jan 5, 2026", assignee: "Cloud Security", status: "OVERDUE" },
          ],
          auditObjectives: { complete: 6, inProgress: 4, overdue: 1 },
        },
      },
      {
        id: "microsoft-azure",
        name: "Microsoft Azure",
        totalValue: "$2.4M",
        percentage: 19,
        color: "#5ca3c7",
        locations: [
          { id: "azure-ad", name: "Azure AD", value: "$1.6M", percentage: 67 },
          { id: "azure-sql", name: "Azure SQL", value: "$0.8M", percentage: 33 },
        ],
        tooltip: {
          residualRisk: 52,
          severity: "Medium",
          dollarValue: "$2.4M",
          facilityName: "Microsoft Azure Platform",
          parentCompany: "Microsoft Azure",
          region: "Cloud Service Providers",
          recentAuditTests: [
            { id: "t6", name: "Identity Review", date: "Jan 4, 2026", status: "passed" },
            { id: "t7", name: "Data Encryption Audit", date: "Dec 29, 2025", status: "passed" },
          ],
          issuesPastSLA: [],
          auditObjectives: { complete: 9, inProgress: 2, overdue: 0 },
        },
      },
    ],
  },
  {
    id: "tier-2-important",
    name: "Tier 2 - Important Vendors",
    totalExposure: "$8.1M",
    companies: [
      {
        id: "salesforce",
        name: "Salesforce",
        totalValue: "$2.9M",
        percentage: 36,
        color: "#266C92",
        locations: [
          { id: "sf-crm", name: "CRM Platform", value: "$2.9M", percentage: 100 },
        ],
        tooltip: {
          residualRisk: 48,
          severity: "Medium",
          dollarValue: "$2.9M",
          facilityName: "Salesforce CRM",
          parentCompany: "Salesforce",
          region: "SaaS Applications",
          recentAuditTests: [
            { id: "t8", name: "API Security Review", date: "Jan 3, 2026", status: "passed" },
            { id: "t9", name: "SSO Integration Test", date: "Dec 28, 2025", status: "passed" },
          ],
          issuesPastSLA: [],
          auditObjectives: { complete: 7, inProgress: 2, overdue: 0 },
        },
      },
      {
        id: "snowflake",
        name: "Snowflake",
        totalValue: "$2.4M",
        percentage: 30,
        color: "#3a8ab5",
        locations: [
          { id: "sf-warehouse", name: "Data Warehouse", value: "$2.4M", percentage: 100 },
        ],
        tooltip: {
          residualRisk: 55,
          severity: "Medium",
          dollarValue: "$2.4M",
          facilityName: "Snowflake Data Cloud",
          parentCompany: "Snowflake",
          region: "Data Platforms",
          recentAuditTests: [
            { id: "t10", name: "Access Control Audit", date: "Jan 2, 2026", status: "warning" },
            { id: "t11", name: "Data Masking Review", date: "Dec 26, 2025", status: "passed" },
          ],
          issuesPastSLA: [
            { id: "i5", title: "Excessive Sharing Permissions", dueDate: "Jan 10, 2026", assignee: "Data Team", status: "AT RISK" },
          ],
          auditObjectives: { complete: 5, inProgress: 3, overdue: 0 },
        },
      },
      {
        id: "okta",
        name: "Okta",
        totalValue: "$1.6M",
        percentage: 20,
        color: "#5ca3c7",
        locations: [
          { id: "okta-sso", name: "SSO Platform", value: "$1.2M", percentage: 75 },
          { id: "okta-mfa", name: "MFA Services", value: "$0.4M", percentage: 25 },
        ],
        tooltip: {
          residualRisk: 42,
          severity: "Medium",
          dollarValue: "$1.6M",
          facilityName: "Okta Identity Platform",
          parentCompany: "Okta",
          region: "Identity Providers",
          recentAuditTests: [
            { id: "t12", name: "SSO Config Review", date: "Jan 4, 2026", status: "passed" },
            { id: "t13", name: "MFA Enrollment Audit", date: "Dec 30, 2025", status: "passed" },
          ],
          issuesPastSLA: [],
          auditObjectives: { complete: 8, inProgress: 1, overdue: 0 },
        },
      },
      {
        id: "palo-alto",
        name: "Palo Alto Networks",
        totalValue: "$1.2M",
        percentage: 14,
        color: "#7bbad6",
        locations: [
          { id: "pan-firewall", name: "NGFW", value: "$0.8M", percentage: 67 },
          { id: "pan-prisma", name: "Prisma Cloud", value: "$0.4M", percentage: 33 },
        ],
        tooltip: {
          residualRisk: 35,
          severity: "Low",
          dollarValue: "$1.2M",
          facilityName: "Network Security Stack",
          parentCompany: "Palo Alto Networks",
          region: "Security Vendors",
          recentAuditTests: [
            { id: "t14", name: "Firewall Rule Review", date: "Jan 5, 2026", status: "passed" },
            { id: "t15", name: "Policy Compliance", date: "Dec 29, 2025", status: "passed" },
          ],
          issuesPastSLA: [],
          auditObjectives: { complete: 10, inProgress: 0, overdue: 0 },
        },
      },
    ],
  },
];

export default function CISOResidualRiskPage() {
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);

  return (
    <AppLayout showHeader={true} showSideNav={true}>
      <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-200 dark:border-border" data-testid="header-ciso-security">
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#266C92] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-foreground" data-testid="text-ciso-page-title">
                  Overview: Cybersecurity Risk Management
                </h1>
              </div>
              <Badge variant="secondary" className="text-xs" data-testid="badge-ciso-workspace">
                CISO Workspace
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
              {/* Left Column - Cyber Risks and Objectives */}
              <div className="space-y-6">
                <Card data-testid="panel-critical-vendor-risks">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                      <Bug className="w-5 h-5 text-red-500" />
                      Critical Vendor Security Risks
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockCyberRisks.length} Risks
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3" data-testid="list-cyber-risks">
                    {mockCyberRisks.map((risk) => (
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

                <StrategicAuditObjectives objectives={mockSecurityObjectives} />
              </div>

              {/* Right Column - Vendor Security Tiers */}
              <div className="space-y-6">
                <Card data-testid="panel-vendor-security-tiers">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                      <Server className="w-5 h-5 text-[#266C92]" />
                      Vendor Security Risk by Tier
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockVendorTiers.length} Tiers
                      </Badge>
                    </CardTitle>
                    <Button 
                      variant="link" 
                      className="text-[#266C92] text-sm p-0 h-auto"
                      data-testid="button-manage-vendors"
                    >
                      Manage Vendors
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <AuditRegionalTreemaps 
                      regions={mockVendorTiers} 
                      highlightIntegrationControls={expandedRiskId === "cyber-risk-1"}
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
