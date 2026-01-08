/**
 * Reporting Content Configuration
 * 
 * Contextual slide content for report-type quick actions across workspaces.
 * Each workspace has themed slide decks that provide meaningful starter content.
 */

export interface SlideMetric {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  type: "title" | "metrics" | "bullets" | "chart" | "summary";
  metrics?: SlideMetric[];
  bulletPoints?: string[];
  chartData?: { label: string; value: number; color: string }[];
  conclusion?: string;
  cta?: string;
}

export interface SlideDeck {
  id: string;
  title: string;
  description: string;
  slides: Slide[];
  workspaceId: string;
  actionType: string;
  exportPath?: string;
}

export const slideDecks: Record<string, Record<string, SlideDeck>> = {
  "enterprise-risk": {
    "board-report": {
      id: "er-board-report",
      title: "Q4 2025 Tariff Risk Executive Summary",
      description: "Board presentation on current tariff exposure and mitigation strategies",
      workspaceId: "enterprise-risk",
      actionType: "report",
      exportPath: "/reporting/board-reports",
      slides: [
        {
          id: "slide-1",
          title: "Tariff Risk Executive Summary",
          subtitle: "Q4 2025 Board Presentation",
          type: "title",
        },
        {
          id: "slide-2",
          title: "Current Exposure Analysis",
          type: "metrics",
          metrics: [
            { label: "Total Tariff Exposure", value: "$47.2M", trend: "up", trendValue: "+12%" },
            { label: "Affected Suppliers", value: "127", trend: "up", trendValue: "+23" },
            { label: "Products at Risk", value: "342", trend: "neutral" },
            { label: "Mitigation Progress", value: "68%", trend: "up", trendValue: "+15%" },
          ],
        },
        {
          id: "slide-3",
          title: "Recommended Mitigations",
          type: "bullets",
          bulletPoints: [
            "Accelerate supplier diversification in Southeast Asia (+$2.1M investment)",
            "Implement tariff engineering program for top 50 SKUs",
            "Negotiate long-term contracts with alternative suppliers",
            "Establish bonded warehouse strategy for high-tariff items",
          ],
          conclusion: "With proposed mitigations, projected exposure reduction of 34% by Q2 2026",
          cta: "Approve $3.5M mitigation budget allocation",
        },
      ],
    },
  },
  "enterprise-audit": {
    "audit-committee-report": {
      id: "ea-audit-committee",
      title: "Singapore M&A Integration Audit Update",
      description: "Audit committee presentation on acquisition integration progress",
      workspaceId: "enterprise-audit",
      actionType: "report",
      exportPath: "/reporting/audit-committee",
      slides: [
        {
          id: "slide-1",
          title: "Singapore M&A Integration Audit",
          subtitle: "Audit Committee Update - January 2026",
          type: "title",
        },
        {
          id: "slide-2",
          title: "Integration Control Status",
          type: "metrics",
          metrics: [
            { label: "Controls Mapped", value: "89/124", trend: "up", trendValue: "72%" },
            { label: "Testing Complete", value: "45%", trend: "up", trendValue: "+18%" },
            { label: "Issues Identified", value: "7", trend: "down", trendValue: "-3" },
            { label: "Days to Close", value: "42", trend: "neutral" },
          ],
        },
        {
          id: "slide-3",
          title: "Key Findings & Next Steps",
          type: "bullets",
          bulletPoints: [
            "Financial reporting controls require harmonization with US GAAP standards",
            "IT access controls show gaps in privileged user management",
            "Procurement controls aligned with corporate policy - no material issues",
            "Recommend extending testing timeline by 2 weeks for comprehensive coverage",
          ],
          conclusion: "Integration on track with manageable risk profile",
          cta: "Request approval for timeline extension",
        },
      ],
    },
  },
  "it-security": {
    "compliance-report": {
      id: "its-compliance",
      title: "Log4j Remediation Compliance Report",
      description: "Executive briefing on vulnerability remediation and compliance status",
      workspaceId: "it-security",
      actionType: "report",
      exportPath: "/reporting/compliance-reports",
      slides: [
        {
          id: "slide-1",
          title: "Log4j Remediation Status",
          subtitle: "Security Compliance Briefing - January 2026",
          type: "title",
        },
        {
          id: "slide-2",
          title: "Remediation Progress",
          type: "metrics",
          metrics: [
            { label: "Systems Scanned", value: "2,847", trend: "up", trendValue: "100%" },
            { label: "Vulnerabilities Found", value: "156", trend: "down", trendValue: "-89" },
            { label: "Patches Applied", value: "142", trend: "up", trendValue: "91%" },
            { label: "Remaining Critical", value: "4", trend: "down", trendValue: "-12" },
          ],
        },
        {
          id: "slide-3",
          title: "Compliance Status & Actions",
          type: "bullets",
          bulletPoints: [
            "91% of affected systems patched within 72-hour SLA",
            "4 legacy systems require application rebuild - scheduled for Q1",
            "WAF rules deployed for temporary mitigation on legacy systems",
            "Third-party vendor attestations collected for 98% of suppliers",
          ],
          conclusion: "Organization maintains SOC 2 compliance with documented remediation plan",
          cta: "Publish to compliance portal for auditor review",
        },
      ],
    },
  },
};

export interface ExperienceStep {
  label: string;
  duration: number;
}

export interface InteractiveExperienceConfig {
  title: string;
  description: string;
  steps: ExperienceStep[];
  result: string;
  destination: string;
  destinationLabel: string;
}

export const experienceConfigs: Record<string, Record<string, InteractiveExperienceConfig>> = {
  "enterprise-risk": {
    analyze: {
      title: "Analyzing Vendor Exposure",
      description: "Deep-dive analysis of vendor tariff exposure and alternative sourcing options",
      steps: [
        { label: "Connecting to vendor database...", duration: 800 },
        { label: "Analyzing 127 active suppliers...", duration: 1200 },
        { label: "Calculating tariff exposure by region...", duration: 1000 },
        { label: "Identifying alternative sourcing options...", duration: 1400 },
        { label: "Generating exposure heatmap...", duration: 900 },
      ],
      result: "Analysis complete. 23 high-risk vendors identified with $18.7M combined exposure. 14 alternative suppliers recommended.",
      destination: "/intelligence/vendor-exposure",
      destinationLabel: "View Vendor Analysis",
    },
    create: {
      title: "Launching Risk Assessment",
      description: "Starting comprehensive risk assessment for current tariff scenarios",
      steps: [
        { label: "Initializing assessment framework...", duration: 700 },
        { label: "Loading risk taxonomy...", duration: 900 },
        { label: "Preparing questionnaire templates...", duration: 1100 },
        { label: "Setting up scoring matrix...", duration: 800 },
      ],
      result: "Risk assessment ready. Framework configured with 42 assessment questions across 6 risk categories.",
      destination: "/wizard",
      destinationLabel: "Start Assessment",
    },
  },
  "enterprise-audit": {
    analyze: {
      title: "Assessing Organizational Impact",
      description: "Analyzing how acquisition affects current audit structure",
      steps: [
        { label: "Loading organizational hierarchy...", duration: 900 },
        { label: "Mapping Singapore entity structure...", duration: 1100 },
        { label: "Analyzing reporting relationships...", duration: 1300 },
        { label: "Calculating coverage requirements...", duration: 1000 },
        { label: "Generating restructuring matrix...", duration: 1200 },
      ],
      result: "Impact analysis complete. 3 new audit domains required. Recommending 2 additional FTEs for coverage.",
      destination: "/intelligence/org-impact",
      destinationLabel: "View Impact Analysis",
    },
    create: {
      title: "Updating Coverage Mapping",
      description: "Preparing coverage mapping updates for Singapore integration",
      steps: [
        { label: "Loading current coverage matrix...", duration: 800 },
        { label: "Mapping new Singapore entities...", duration: 1200 },
        { label: "Calculating audit universe expansion...", duration: 1000 },
        { label: "Generating control mapping...", duration: 1100 },
      ],
      result: "Coverage mapping updated. 4 new entities added to audit universe. 45 new controls identified for testing.",
      destination: "/coverage-mapping",
      destinationLabel: "View Coverage Map",
    },
  },
  "it-security": {
    create: {
      title: "Launching Vulnerability Scan",
      description: "Initiating comprehensive Log4j scan across all systems",
      steps: [
        { label: "Connecting to asset inventory...", duration: 800 },
        { label: "Deploying scanning agents...", duration: 1500 },
        { label: "Scanning 2,847 systems...", duration: 2000 },
        { label: "Correlating with CVE database...", duration: 1100 },
        { label: "Generating remediation priorities...", duration: 900 },
      ],
      result: "Scan complete. 14 new vulnerabilities detected. 4 critical, 6 high, 4 medium priority.",
      destination: "/reporting/patch-status",
      destinationLabel: "View Scan Results",
    },
    analyze: {
      title: "Analyzing Patch Compliance",
      description: "Real-time analysis of patch deployment status and compliance gaps",
      steps: [
        { label: "Querying CMDB for asset status...", duration: 900 },
        { label: "Correlating patch deployment logs...", duration: 1300 },
        { label: "Identifying unpatched systems...", duration: 1100 },
        { label: "Calculating compliance score...", duration: 800 },
        { label: "Generating compliance report...", duration: 1000 },
      ],
      result: "Compliance analysis complete. 91% patch compliance achieved. 14 systems require immediate attention.",
      destination: "/reporting/patch-status",
      destinationLabel: "View Compliance Status",
    },
  },
};

export function getSlideDeck(workspaceId: string, actionId: string): SlideDeck | null {
  const workspaceDecks = slideDecks[workspaceId];
  if (!workspaceDecks) return null;
  return workspaceDecks[actionId] || null;
}

export function getExperienceConfig(workspaceId: string, actionType: string): InteractiveExperienceConfig | null {
  const workspaceExperiences = experienceConfigs[workspaceId];
  if (!workspaceExperiences) return null;
  return workspaceExperiences[actionType] || null;
}
