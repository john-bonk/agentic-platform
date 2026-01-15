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

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  type: "title" | "metrics" | "bullets" | "chart" | "summary";
  metrics?: SlideMetric[];
  bulletPoints?: string[];
  chartData?: ChartDataPoint[];
  chartUnit?: "percent" | "count" | "currency" | "none";
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
          subtitle: "Q4 2025 Board Presentation | Enterprise Risk Management",
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
          title: "Exposure by Region",
          subtitle: "Geographic distribution of tariff impact",
          type: "chart",
          chartUnit: "percent",
          chartData: [
            { label: "China", value: 42, color: "#ef4444" },
            { label: "Southeast Asia", value: 28, color: "#f59e0b" },
            { label: "Mexico", value: 18, color: "#10b981" },
            { label: "EU", value: 8, color: "#3b82f6" },
            { label: "Other", value: 4, color: "#8b5cf6" },
          ],
        },
        {
          id: "slide-4",
          title: "Quarterly Trend Analysis",
          subtitle: "Exposure trajectory and mitigation effectiveness ($M)",
          type: "chart",
          chartUnit: "currency",
          chartData: [
            { label: "Q1 2025", value: 32, color: "#266C92" },
            { label: "Q2 2025", value: 38, color: "#266C92" },
            { label: "Q3 2025", value: 42, color: "#266C92" },
            { label: "Q4 2025", value: 47, color: "#ef4444" },
            { label: "Q1 2026 (Proj)", value: 38, color: "#10b981" },
            { label: "Q2 2026 (Proj)", value: 31, color: "#10b981" },
          ],
        },
        {
          id: "slide-5",
          title: "Recommended Mitigations",
          type: "bullets",
          bulletPoints: [
            "Accelerate supplier diversification in Southeast Asia (+$2.1M investment) - 18% exposure reduction",
            "Implement tariff engineering program for top 50 SKUs - 8% exposure reduction",
            "Negotiate long-term contracts with alternative suppliers - 5% exposure reduction",
            "Establish bonded warehouse strategy for high-tariff items - 3% exposure reduction",
            "Deploy real-time tariff monitoring system for proactive responses",
          ],
        },
        {
          id: "slide-6",
          title: "Executive Summary & Recommendations",
          type: "summary",
          bulletPoints: [
            "Current exposure of $47.2M requires immediate mitigation action",
            "Proposed initiatives will reduce exposure by 34% ($16M) by Q2 2026",
            "Total investment required: $3.5M with projected ROI of 4.6x",
            "Risk of inaction: Additional $8.2M exposure by Q2 2026",
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
          subtitle: "Audit Committee Update - January 2026 | VertiFarm Asia Acquisition",
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
          title: "Control Testing Progress by Domain",
          subtitle: "Coverage across key control areas",
          type: "chart",
          chartUnit: "percent",
          chartData: [
            { label: "Financial Reporting", value: 85, color: "#10b981" },
            { label: "IT General Controls", value: 62, color: "#f59e0b" },
            { label: "Procurement", value: 78, color: "#10b981" },
            { label: "HR & Payroll", value: 45, color: "#ef4444" },
            { label: "Revenue Cycle", value: 38, color: "#ef4444" },
            { label: "Treasury", value: 72, color: "#3b82f6" },
          ],
        },
        {
          id: "slide-4",
          title: "Issues by Risk Rating",
          subtitle: "Distribution of identified control gaps",
          type: "chart",
          chartUnit: "count",
          chartData: [
            { label: "Critical", value: 1, color: "#ef4444" },
            { label: "High", value: 2, color: "#f59e0b" },
            { label: "Medium", value: 3, color: "#eab308" },
            { label: "Low", value: 1, color: "#10b981" },
          ],
        },
        {
          id: "slide-5",
          title: "Key Findings & Remediation Status",
          type: "bullets",
          bulletPoints: [
            "CRITICAL: Privileged access management lacks segregation - Remediation in progress (Target: Feb 15)",
            "HIGH: Financial reporting controls require US GAAP harmonization - Gap analysis complete",
            "HIGH: Vendor master data lacks dual approval controls - Process redesign underway",
            "MEDIUM: Documentation gaps in change management procedures - Training scheduled",
            "MEDIUM: Backup verification procedures not formalized - SOP development in progress",
            "MEDIUM: Third-party risk assessments incomplete for 12 vendors - Assessments initiated",
          ],
        },
        {
          id: "slide-6",
          title: "Recommendations & Next Steps",
          type: "summary",
          bulletPoints: [
            "Extend testing timeline by 2 weeks to ensure comprehensive coverage",
            "Prioritize IT access control remediation before system cutover",
            "Engage external consultants for US GAAP control mapping",
            "Schedule bi-weekly status updates with Audit Committee",
          ],
          conclusion: "Integration on track with manageable risk profile. Critical issues have defined remediation paths.",
          cta: "Request approval for timeline extension and $85K supplemental budget",
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
          subtitle: "Security Compliance Briefing - January 2026 | CVE-2021-44228",
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
          title: "Vulnerability Distribution by System Type",
          subtitle: "Affected systems across infrastructure categories",
          type: "chart",
          chartUnit: "count",
          chartData: [
            { label: "Web Servers", value: 48, color: "#ef4444" },
            { label: "Application Servers", value: 35, color: "#f59e0b" },
            { label: "Middleware", value: 28, color: "#eab308" },
            { label: "Development Env", value: 25, color: "#3b82f6" },
            { label: "Legacy Systems", value: 14, color: "#8b5cf6" },
            { label: "Third-Party Apps", value: 6, color: "#10b981" },
          ],
        },
        {
          id: "slide-4",
          title: "Remediation Timeline",
          subtitle: "Patch deployment progress over 30-day window",
          type: "chart",
          chartUnit: "percent",
          chartData: [
            { label: "Week 1", value: 45, color: "#266C92" },
            { label: "Week 2", value: 78, color: "#266C92" },
            { label: "Week 3", value: 89, color: "#266C92" },
            { label: "Week 4", value: 91, color: "#10b981" },
            { label: "Week 5 (Proj)", value: 97, color: "#10b981" },
            { label: "Week 6 (Proj)", value: 100, color: "#10b981" },
          ],
        },
        {
          id: "slide-5",
          title: "Compliance Status & Compensating Controls",
          type: "bullets",
          bulletPoints: [
            "91% of affected systems patched within 72-hour SLA",
            "4 legacy systems (SAP ECC, Oracle EBS, Custom CRM, Legacy EDI) require application rebuild - scheduled for Q1 2026",
            "WAF rules deployed for temporary mitigation: 847 attack attempts blocked in last 7 days",
            "Network segmentation implemented for unpatched systems - reduced attack surface by 73%",
            "24/7 SOC monitoring enabled with enhanced Log4j-specific detection rules",
            "Third-party vendor attestations collected for 98% of suppliers (127/130)",
          ],
        },
        {
          id: "slide-6",
          title: "Executive Summary & Compliance Attestation",
          type: "summary",
          bulletPoints: [
            "Organization maintains SOC 2 compliance with documented remediation plan",
            "No evidence of successful exploitation in our environment",
            "Compensating controls effective: Zero security incidents post-implementation",
            "Full remediation projected by March 15, 2026",
          ],
          conclusion: "Security posture strong with active monitoring. Residual risk within acceptable tolerance pending legacy system upgrades.",
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
      destination: "/ciso/global-residual-risk",
      destinationLabel: "View Security Dashboard",
    },
    analyze: {
      title: "Running Threat Detection Scan",
      description: "AI-powered analysis of potential attack vectors and intrusion indicators",
      steps: [
        { label: "Connecting to SIEM data feeds...", duration: 900 },
        { label: "Analyzing network traffic patterns...", duration: 1400 },
        { label: "Running ML anomaly detection...", duration: 1600 },
        { label: "Correlating threat intelligence...", duration: 1100 },
        { label: "Generating threat assessment...", duration: 1000 },
      ],
      result: "Threat scan complete. 3 potential intrusion attempts blocked. No active compromises detected. Security posture: Strong.",
      destination: "/ciso/global-residual-risk",
      destinationLabel: "View Security Dashboard",
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
