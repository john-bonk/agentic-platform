/**
 * Workspace Wizard Configuration
 * 
 * Defines the multi-stage workspace creation system with:
 * - 9 Product Capability Buckets (Stage 1) - matching AuditBoard's product suite
 * - Module Capabilities per bucket (Stage 2)
 * - Navigation structure generation from capability combinations
 */

import type { SideNavSection, ModuleNavGroup } from "./navigation";

export interface ProductCapabilityBucket {
  id: string;
  name: string;
  navShortName: string;
  description: string;
  icon: string;
  color: string;
  moduleCapabilities: ModuleCapability[];
}

export interface ModuleCapability {
  id: string;
  name: string;
  description: string;
  icon: string;
  navContribution: NavContribution;
  defaultEnabled: boolean;
}

export interface NavContribution {
  sectionId: string;
  sectionTitle: string;
  items: NavItemTemplate[];
  priority: number;
}

export interface NavItemTemplate {
  id: string;
  label: string;
  pathSuffix: string;
  badge?: string;
  icon?: string;
}

export interface WorkspaceWizardConfig {
  name: string;
  selectedBuckets: string[];
  enabledModules: Record<string, string[]>;
  customizations: Record<string, unknown>;
}

/**
 * 9 Product Capability Buckets matching AuditBoard's product suite
 * Each bucket contains 9+ module capabilities for comprehensive coverage
 */
export const productCapabilityBuckets: ProductCapabilityBucket[] = [
  {
    id: "controls-management",
    name: "Controls Management",
    navShortName: "Controls",
    description: "Internal control framework and testing",
    icon: "shield-check",
    color: "#266C92",
    moduleCapabilities: [
      {
        id: "control-library",
        name: "Control Library",
        description: "Centralized control definitions",
        icon: "library",
        defaultEnabled: true,
        navContribution: {
          sectionId: "cm-library",
          sectionTitle: "Control Library",
          priority: 10,
          items: [
            { id: "all-controls", label: "All Controls", pathSuffix: "/controls" },
            { id: "control-catalog", label: "Control Catalog", pathSuffix: "/control-catalog" },
            { id: "control-hierarchy", label: "Control Hierarchy", pathSuffix: "/control-hierarchy" },
          ],
        },
      },
      {
        id: "control-testing",
        name: "Control Testing",
        description: "Test of design and operating effectiveness",
        icon: "clipboard-check",
        defaultEnabled: true,
        navContribution: {
          sectionId: "cm-testing",
          sectionTitle: "Testing",
          priority: 20,
          items: [
            { id: "test-plans", label: "Test Plans", pathSuffix: "/test-plans" },
            { id: "test-execution", label: "Test Execution", pathSuffix: "/test-execution" },
            { id: "test-results", label: "Test Results", pathSuffix: "/test-results" },
          ],
        },
      },
      {
        id: "control-gaps",
        name: "Gap Management",
        description: "Track control deficiencies and gaps",
        icon: "alert-triangle",
        defaultEnabled: true,
        navContribution: {
          sectionId: "cm-gaps",
          sectionTitle: "Gaps & Issues",
          priority: 30,
          items: [
            { id: "control-gaps", label: "Control Gaps", pathSuffix: "/control-gaps" },
            { id: "remediation", label: "Remediation", pathSuffix: "/remediation" },
            { id: "gap-tracking", label: "Gap Tracking", pathSuffix: "/gap-tracking" },
          ],
        },
      },
      {
        id: "control-attestation",
        name: "Attestation",
        description: "Control owner attestation workflows",
        icon: "user-check",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cm-attestation",
          sectionTitle: "Attestation",
          priority: 40,
          items: [
            { id: "attestation-campaigns", label: "Campaigns", pathSuffix: "/attestation-campaigns" },
            { id: "attestation-status", label: "Status", pathSuffix: "/attestation-status" },
          ],
        },
      },
      {
        id: "control-monitoring",
        name: "Continuous Monitoring",
        description: "Automated control monitoring",
        icon: "activity",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cm-monitoring",
          sectionTitle: "Monitoring",
          priority: 50,
          items: [
            { id: "monitoring-dashboard", label: "Dashboard", pathSuffix: "/monitoring-dashboard" },
            { id: "automated-tests", label: "Automated Tests", pathSuffix: "/automated-tests" },
            { id: "alerts", label: "Alerts", pathSuffix: "/alerts", badge: "3" },
          ],
        },
      },
      {
        id: "control-mapping",
        name: "Control Mapping",
        description: "Map controls to frameworks and risks",
        icon: "git-branch",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cm-mapping",
          sectionTitle: "Mapping",
          priority: 60,
          items: [
            { id: "framework-mapping", label: "Framework Mapping", pathSuffix: "/framework-mapping" },
            { id: "risk-mapping", label: "Risk Mapping", pathSuffix: "/risk-mapping" },
            { id: "coverage-matrix", label: "Coverage Matrix", pathSuffix: "/coverage-matrix" },
          ],
        },
      },
      {
        id: "control-evidence",
        name: "Evidence Collection",
        description: "Centralized evidence repository",
        icon: "folder",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cm-evidence",
          sectionTitle: "Evidence",
          priority: 70,
          items: [
            { id: "evidence-library", label: "Evidence Library", pathSuffix: "/evidence-library" },
            { id: "evidence-requests", label: "Requests", pathSuffix: "/evidence-requests" },
          ],
        },
      },
      {
        id: "control-analytics",
        name: "Control Analytics",
        description: "Control performance analytics",
        icon: "bar-chart-2",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cm-analytics",
          sectionTitle: "Analytics",
          priority: 80,
          items: [
            { id: "control-metrics", label: "Metrics", pathSuffix: "/control-metrics" },
            { id: "trend-analysis", label: "Trend Analysis", pathSuffix: "/trend-analysis" },
            { id: "benchmarking", label: "Benchmarking", pathSuffix: "/benchmarking" },
          ],
        },
      },
      {
        id: "control-reporting",
        name: "Control Reporting",
        description: "Control status and management reporting",
        icon: "file-text",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cm-reporting",
          sectionTitle: "Reporting",
          priority: 90,
          items: [
            { id: "control-reports", label: "Reports", pathSuffix: "/control-reports" },
            { id: "executive-summary", label: "Executive Summary", pathSuffix: "/executive-summary" },
            { id: "audit-committee", label: "Audit Committee", pathSuffix: "/audit-committee" },
          ],
        },
      },
    ],
  },
  {
    id: "enterprise-risk",
    name: "Enterprise Risk Management",
    navShortName: "Risk",
    description: "Enterprise-wide risk identification and assessment",
    icon: "trending-up",
    color: "#4CAF50",
    moduleCapabilities: [
      {
        id: "risk-register",
        name: "Risk Register",
        description: "Centralized risk inventory",
        icon: "list",
        defaultEnabled: true,
        navContribution: {
          sectionId: "erm-register",
          sectionTitle: "Risk Register",
          priority: 10,
          items: [
            { id: "all-risks", label: "All Risks", pathSuffix: "/risks" },
            { id: "risk-categories", label: "Categories", pathSuffix: "/risk-categories" },
            { id: "risk-owners", label: "Risk Owners", pathSuffix: "/risk-owners" },
          ],
        },
      },
      {
        id: "risk-assessment",
        name: "Risk Assessment",
        description: "Quantitative and qualitative scoring",
        icon: "calculator",
        defaultEnabled: true,
        navContribution: {
          sectionId: "erm-assessment",
          sectionTitle: "Assessment",
          priority: 20,
          items: [
            { id: "risk-heatmap", label: "Risk Heatmap", pathSuffix: "/risk-heatmap" },
            { id: "risk-scoring", label: "Risk Scoring", pathSuffix: "/risk-scoring" },
            { id: "impact-likelihood", label: "Impact & Likelihood", pathSuffix: "/impact-likelihood" },
          ],
        },
      },
      {
        id: "risk-mitigation",
        name: "Risk Treatment",
        description: "Treatment plans and mitigation tracking",
        icon: "shield",
        defaultEnabled: true,
        navContribution: {
          sectionId: "erm-treatment",
          sectionTitle: "Treatment",
          priority: 30,
          items: [
            { id: "treatment-plans", label: "Treatment Plans", pathSuffix: "/treatment-plans" },
            { id: "mitigation-tracker", label: "Mitigation Tracker", pathSuffix: "/mitigation-tracker" },
            { id: "action-items", label: "Action Items", pathSuffix: "/action-items", badge: "5" },
          ],
        },
      },
      {
        id: "risk-appetite",
        name: "Risk Appetite",
        description: "Define organizational risk tolerance",
        icon: "target",
        defaultEnabled: false,
        navContribution: {
          sectionId: "erm-appetite",
          sectionTitle: "Appetite",
          priority: 40,
          items: [
            { id: "appetite-framework", label: "Appetite Framework", pathSuffix: "/appetite-framework" },
            { id: "tolerance-thresholds", label: "Thresholds", pathSuffix: "/thresholds" },
          ],
        },
      },
      {
        id: "risk-indicators",
        name: "Key Risk Indicators",
        description: "KRI tracking and monitoring",
        icon: "gauge",
        defaultEnabled: false,
        navContribution: {
          sectionId: "erm-kri",
          sectionTitle: "KRIs",
          priority: 50,
          items: [
            { id: "kri-dashboard", label: "KRI Dashboard", pathSuffix: "/kri-dashboard" },
            { id: "kri-library", label: "KRI Library", pathSuffix: "/kri-library" },
            { id: "kri-alerts", label: "Alerts", pathSuffix: "/kri-alerts" },
          ],
        },
      },
      {
        id: "risk-scenarios",
        name: "Scenario Analysis",
        description: "Risk scenario modeling",
        icon: "git-compare",
        defaultEnabled: false,
        navContribution: {
          sectionId: "erm-scenarios",
          sectionTitle: "Scenarios",
          priority: 60,
          items: [
            { id: "scenario-library", label: "Scenario Library", pathSuffix: "/scenario-library" },
            { id: "stress-testing", label: "Stress Testing", pathSuffix: "/stress-testing" },
            { id: "monte-carlo", label: "Monte Carlo", pathSuffix: "/monte-carlo" },
          ],
        },
      },
      {
        id: "risk-governance",
        name: "Risk Governance",
        description: "Governance structure and committees",
        icon: "building",
        defaultEnabled: false,
        navContribution: {
          sectionId: "erm-governance",
          sectionTitle: "Governance",
          priority: 70,
          items: [
            { id: "committees", label: "Committees", pathSuffix: "/committees" },
            { id: "policies", label: "Policies", pathSuffix: "/policies" },
            { id: "escalation", label: "Escalation", pathSuffix: "/escalation" },
          ],
        },
      },
      {
        id: "risk-reporting",
        name: "Risk Reporting",
        description: "Executive and board reporting",
        icon: "presentation",
        defaultEnabled: false,
        navContribution: {
          sectionId: "erm-reporting",
          sectionTitle: "Reporting",
          priority: 80,
          items: [
            { id: "risk-reports", label: "Reports", pathSuffix: "/risk-reports" },
            { id: "board-deck", label: "Board Deck", pathSuffix: "/board-deck" },
            { id: "trend-reports", label: "Trend Reports", pathSuffix: "/trend-reports" },
          ],
        },
      },
      {
        id: "risk-integration",
        name: "Risk Integration",
        description: "Integrate with other GRC modules",
        icon: "link",
        defaultEnabled: false,
        navContribution: {
          sectionId: "erm-integration",
          sectionTitle: "Integration",
          priority: 90,
          items: [
            { id: "control-linkage", label: "Control Linkage", pathSuffix: "/control-linkage" },
            { id: "audit-linkage", label: "Audit Linkage", pathSuffix: "/audit-linkage" },
            { id: "issue-linkage", label: "Issue Linkage", pathSuffix: "/issue-linkage" },
          ],
        },
      },
    ],
  },
  {
    id: "audit-management",
    name: "Audit Management",
    navShortName: "Audit",
    description: "Internal audit planning and execution",
    icon: "clipboard-list",
    color: "#9C27B0",
    moduleCapabilities: [
      {
        id: "audit-universe",
        name: "Audit Universe",
        description: "Auditable entity management",
        icon: "globe",
        defaultEnabled: true,
        navContribution: {
          sectionId: "am-universe",
          sectionTitle: "Audit Universe",
          priority: 10,
          items: [
            { id: "entities", label: "Entities", pathSuffix: "/entities" },
            { id: "risk-ratings", label: "Risk Ratings", pathSuffix: "/risk-ratings" },
            { id: "coverage-analysis", label: "Coverage Analysis", pathSuffix: "/coverage-analysis" },
          ],
        },
      },
      {
        id: "audit-planning",
        name: "Audit Planning",
        description: "Annual and strategic planning",
        icon: "calendar",
        defaultEnabled: true,
        navContribution: {
          sectionId: "am-planning",
          sectionTitle: "Planning",
          priority: 20,
          items: [
            { id: "annual-plan", label: "Annual Plan", pathSuffix: "/annual-plan" },
            { id: "strategic-plan", label: "Strategic Plan", pathSuffix: "/strategic-plan" },
            { id: "resource-allocation", label: "Resource Allocation", pathSuffix: "/resource-allocation" },
          ],
        },
      },
      {
        id: "audit-execution",
        name: "Audit Execution",
        description: "Fieldwork and workpapers",
        icon: "file-text",
        defaultEnabled: true,
        navContribution: {
          sectionId: "am-execution",
          sectionTitle: "Execution",
          priority: 30,
          items: [
            { id: "active-audits", label: "Active Audits", pathSuffix: "/active-audits" },
            { id: "workpapers", label: "Workpapers", pathSuffix: "/workpapers" },
            { id: "testing", label: "Testing", pathSuffix: "/testing" },
          ],
        },
      },
      {
        id: "audit-findings",
        name: "Findings & Issues",
        description: "Track findings and remediation",
        icon: "alert-triangle",
        defaultEnabled: true,
        navContribution: {
          sectionId: "am-findings",
          sectionTitle: "Findings",
          priority: 40,
          items: [
            { id: "all-findings", label: "All Findings", pathSuffix: "/findings" },
            { id: "recommendations", label: "Recommendations", pathSuffix: "/recommendations" },
            { id: "follow-ups", label: "Follow-ups", pathSuffix: "/follow-ups", badge: "3" },
          ],
        },
      },
      {
        id: "audit-reporting",
        name: "Audit Reporting",
        description: "Draft and publish audit reports",
        icon: "file-signature",
        defaultEnabled: false,
        navContribution: {
          sectionId: "am-reporting",
          sectionTitle: "Reporting",
          priority: 50,
          items: [
            { id: "draft-reports", label: "Draft Reports", pathSuffix: "/draft-reports" },
            { id: "published-reports", label: "Published Reports", pathSuffix: "/published-reports" },
            { id: "stakeholder-reports", label: "Stakeholder Reports", pathSuffix: "/stakeholder-reports" },
          ],
        },
      },
      {
        id: "audit-analytics",
        name: "Audit Analytics",
        description: "Data analytics for audit",
        icon: "bar-chart",
        defaultEnabled: false,
        navContribution: {
          sectionId: "am-analytics",
          sectionTitle: "Analytics",
          priority: 60,
          items: [
            { id: "data-analytics", label: "Data Analytics", pathSuffix: "/data-analytics" },
            { id: "continuous-auditing", label: "Continuous Auditing", pathSuffix: "/continuous-auditing" },
            { id: "anomaly-detection", label: "Anomaly Detection", pathSuffix: "/anomaly-detection" },
          ],
        },
      },
      {
        id: "audit-qa",
        name: "Quality Assurance",
        description: "Audit quality review",
        icon: "check-circle",
        defaultEnabled: false,
        navContribution: {
          sectionId: "am-qa",
          sectionTitle: "Quality",
          priority: 70,
          items: [
            { id: "qa-reviews", label: "QA Reviews", pathSuffix: "/qa-reviews" },
            { id: "peer-reviews", label: "Peer Reviews", pathSuffix: "/peer-reviews" },
            { id: "qa-metrics", label: "QA Metrics", pathSuffix: "/qa-metrics" },
          ],
        },
      },
      {
        id: "audit-resources",
        name: "Resource Management",
        description: "Audit team and skills",
        icon: "users",
        defaultEnabled: false,
        navContribution: {
          sectionId: "am-resources",
          sectionTitle: "Resources",
          priority: 80,
          items: [
            { id: "team-management", label: "Team Management", pathSuffix: "/team-management" },
            { id: "skills-matrix", label: "Skills Matrix", pathSuffix: "/skills-matrix" },
            { id: "capacity-planning", label: "Capacity Planning", pathSuffix: "/capacity-planning" },
          ],
        },
      },
      {
        id: "audit-time",
        name: "Time Tracking",
        description: "Audit time and budget",
        icon: "clock",
        defaultEnabled: false,
        navContribution: {
          sectionId: "am-time",
          sectionTitle: "Time & Budget",
          priority: 90,
          items: [
            { id: "time-entry", label: "Time Entry", pathSuffix: "/time-entry" },
            { id: "budget-tracking", label: "Budget Tracking", pathSuffix: "/budget-tracking" },
            { id: "utilization", label: "Utilization", pathSuffix: "/utilization" },
          ],
        },
      },
    ],
  },
  {
    id: "cyber-it-compliance",
    name: "Cyber and IT Compliance",
    navShortName: "Cyber & IT",
    description: "IT security and compliance management",
    icon: "lock",
    color: "#F44336",
    moduleCapabilities: [
      {
        id: "it-controls",
        name: "IT Controls",
        description: "IT general and application controls",
        icon: "server",
        defaultEnabled: true,
        navContribution: {
          sectionId: "cit-controls",
          sectionTitle: "IT Controls",
          priority: 10,
          items: [
            { id: "itgc", label: "ITGC", pathSuffix: "/itgc" },
            { id: "application-controls", label: "Application Controls", pathSuffix: "/application-controls" },
            { id: "it-risks", label: "IT Risks", pathSuffix: "/it-risks" },
          ],
        },
      },
      {
        id: "vulnerability-mgmt",
        name: "Vulnerability Management",
        description: "Track and remediate vulnerabilities",
        icon: "bug",
        defaultEnabled: true,
        navContribution: {
          sectionId: "cit-vuln",
          sectionTitle: "Vulnerabilities",
          priority: 20,
          items: [
            { id: "scanner-results", label: "Scanner Results", pathSuffix: "/scanner-results" },
            { id: "remediation-queue", label: "Remediation Queue", pathSuffix: "/remediation-queue" },
            { id: "cve-tracking", label: "CVE Tracking", pathSuffix: "/cve-tracking" },
          ],
        },
      },
      {
        id: "security-incidents",
        name: "Incident Response",
        description: "Security incident management",
        icon: "alert-circle",
        defaultEnabled: true,
        navContribution: {
          sectionId: "cit-incidents",
          sectionTitle: "Incidents",
          priority: 30,
          items: [
            { id: "active-incidents", label: "Active Incidents", pathSuffix: "/active-incidents", badge: "2" },
            { id: "playbooks", label: "Playbooks", pathSuffix: "/playbooks" },
            { id: "post-mortems", label: "Post-mortems", pathSuffix: "/post-mortems" },
          ],
        },
      },
      {
        id: "threat-intel",
        name: "Threat Intelligence",
        description: "Monitor security threats",
        icon: "radar",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cit-threats",
          sectionTitle: "Threat Intel",
          priority: 40,
          items: [
            { id: "threat-feed", label: "Threat Feed", pathSuffix: "/threat-feed" },
            { id: "ioc-database", label: "IOC Database", pathSuffix: "/ioc-database" },
            { id: "threat-actors", label: "Threat Actors", pathSuffix: "/threat-actors" },
          ],
        },
      },
      {
        id: "security-assessments",
        name: "Security Assessments",
        description: "Pen tests and security reviews",
        icon: "shield-alert",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cit-assessments",
          sectionTitle: "Assessments",
          priority: 50,
          items: [
            { id: "pen-tests", label: "Penetration Tests", pathSuffix: "/pen-tests" },
            { id: "security-reviews", label: "Security Reviews", pathSuffix: "/security-reviews" },
            { id: "red-team", label: "Red Team", pathSuffix: "/red-team" },
          ],
        },
      },
      {
        id: "access-reviews",
        name: "Access Reviews",
        description: "User access certification",
        icon: "key",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cit-access",
          sectionTitle: "Access",
          priority: 60,
          items: [
            { id: "access-campaigns", label: "Access Campaigns", pathSuffix: "/access-campaigns" },
            { id: "privileged-access", label: "Privileged Access", pathSuffix: "/privileged-access" },
            { id: "sod-analysis", label: "SoD Analysis", pathSuffix: "/sod-analysis" },
          ],
        },
      },
      {
        id: "security-frameworks",
        name: "Security Frameworks",
        description: "NIST, ISO, SOC compliance",
        icon: "shield-check",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cit-frameworks",
          sectionTitle: "Frameworks",
          priority: 70,
          items: [
            { id: "nist-csf", label: "NIST CSF", pathSuffix: "/nist-csf" },
            { id: "iso-27001", label: "ISO 27001", pathSuffix: "/iso-27001" },
            { id: "soc2", label: "SOC 2", pathSuffix: "/soc2" },
          ],
        },
      },
      {
        id: "security-metrics",
        name: "Security Metrics",
        description: "Security KPIs and reporting",
        icon: "pie-chart",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cit-metrics",
          sectionTitle: "Metrics",
          priority: 80,
          items: [
            { id: "security-dashboard", label: "Security Dashboard", pathSuffix: "/security-dashboard" },
            { id: "kpi-tracking", label: "KPI Tracking", pathSuffix: "/kpi-tracking" },
            { id: "maturity-assessment", label: "Maturity Assessment", pathSuffix: "/maturity-assessment" },
          ],
        },
      },
      {
        id: "security-awareness",
        name: "Security Awareness",
        description: "Training and phishing tests",
        icon: "graduation-cap",
        defaultEnabled: false,
        navContribution: {
          sectionId: "cit-awareness",
          sectionTitle: "Awareness",
          priority: 90,
          items: [
            { id: "training-campaigns", label: "Training Campaigns", pathSuffix: "/training-campaigns" },
            { id: "phishing-tests", label: "Phishing Tests", pathSuffix: "/phishing-tests" },
            { id: "completion-tracking", label: "Completion Tracking", pathSuffix: "/completion-tracking" },
          ],
        },
      },
    ],
  },
  {
    id: "information-technology",
    name: "Information Technology",
    navShortName: "IT",
    description: "IT asset and service management",
    icon: "database",
    color: "#607D8B",
    moduleCapabilities: [
      {
        id: "asset-inventory",
        name: "Asset Inventory",
        description: "IT asset management",
        icon: "hard-drive",
        defaultEnabled: true,
        navContribution: {
          sectionId: "it-assets",
          sectionTitle: "Asset Inventory",
          priority: 10,
          items: [
            { id: "all-assets", label: "All Assets", pathSuffix: "/assets" },
            { id: "hardware", label: "Hardware", pathSuffix: "/hardware" },
            { id: "software", label: "Software", pathSuffix: "/software" },
          ],
        },
      },
      {
        id: "system-inventory",
        name: "System Inventory",
        description: "Applications and systems",
        icon: "layers",
        defaultEnabled: true,
        navContribution: {
          sectionId: "it-systems",
          sectionTitle: "Systems",
          priority: 20,
          items: [
            { id: "applications", label: "Applications", pathSuffix: "/applications" },
            { id: "databases", label: "Databases", pathSuffix: "/databases" },
            { id: "integrations", label: "Integrations", pathSuffix: "/integrations" },
          ],
        },
      },
      {
        id: "change-management",
        name: "Change Management",
        description: "IT change requests and approvals",
        icon: "git-pull-request",
        defaultEnabled: true,
        navContribution: {
          sectionId: "it-changes",
          sectionTitle: "Changes",
          priority: 30,
          items: [
            { id: "change-requests", label: "Change Requests", pathSuffix: "/change-requests" },
            { id: "change-calendar", label: "Change Calendar", pathSuffix: "/change-calendar" },
            { id: "change-approvals", label: "Approvals", pathSuffix: "/change-approvals" },
          ],
        },
      },
      {
        id: "service-catalog",
        name: "Service Catalog",
        description: "IT services and SLAs",
        icon: "book-open",
        defaultEnabled: false,
        navContribution: {
          sectionId: "it-services",
          sectionTitle: "Services",
          priority: 40,
          items: [
            { id: "service-catalog", label: "Service Catalog", pathSuffix: "/service-catalog" },
            { id: "sla-management", label: "SLA Management", pathSuffix: "/sla-management" },
            { id: "service-owners", label: "Service Owners", pathSuffix: "/service-owners" },
          ],
        },
      },
      {
        id: "bcdr-planning",
        name: "BC/DR Planning",
        description: "Business continuity and disaster recovery",
        icon: "shield-off",
        defaultEnabled: false,
        navContribution: {
          sectionId: "it-bcdr",
          sectionTitle: "BC/DR",
          priority: 50,
          items: [
            { id: "bcp-plans", label: "BCP Plans", pathSuffix: "/bcp-plans" },
            { id: "dr-plans", label: "DR Plans", pathSuffix: "/dr-plans" },
            { id: "recovery-testing", label: "Recovery Testing", pathSuffix: "/recovery-testing" },
          ],
        },
      },
      {
        id: "vendor-tech",
        name: "Technology Vendors",
        description: "IT vendor management",
        icon: "users",
        defaultEnabled: false,
        navContribution: {
          sectionId: "it-vendors",
          sectionTitle: "Vendors",
          priority: 60,
          items: [
            { id: "tech-vendors", label: "Tech Vendors", pathSuffix: "/tech-vendors" },
            { id: "contracts", label: "Contracts", pathSuffix: "/it-contracts" },
            { id: "renewals", label: "Renewals", pathSuffix: "/renewals" },
          ],
        },
      },
      {
        id: "it-policies",
        name: "IT Policies",
        description: "IT policies and procedures",
        icon: "file-text",
        defaultEnabled: false,
        navContribution: {
          sectionId: "it-policies",
          sectionTitle: "Policies",
          priority: 70,
          items: [
            { id: "policy-library", label: "Policy Library", pathSuffix: "/it-policies" },
            { id: "standards", label: "Standards", pathSuffix: "/standards" },
            { id: "procedures", label: "Procedures", pathSuffix: "/procedures" },
          ],
        },
      },
      {
        id: "it-projects",
        name: "IT Projects",
        description: "IT project tracking",
        icon: "kanban",
        defaultEnabled: false,
        navContribution: {
          sectionId: "it-projects",
          sectionTitle: "Projects",
          priority: 80,
          items: [
            { id: "active-projects", label: "Active Projects", pathSuffix: "/it-projects" },
            { id: "project-risks", label: "Project Risks", pathSuffix: "/project-risks" },
            { id: "milestones", label: "Milestones", pathSuffix: "/milestones" },
          ],
        },
      },
      {
        id: "it-metrics",
        name: "IT Metrics",
        description: "IT performance metrics",
        icon: "activity",
        defaultEnabled: false,
        navContribution: {
          sectionId: "it-metrics",
          sectionTitle: "Metrics",
          priority: 90,
          items: [
            { id: "it-dashboard", label: "IT Dashboard", pathSuffix: "/it-dashboard" },
            { id: "uptime-tracking", label: "Uptime Tracking", pathSuffix: "/uptime" },
            { id: "capacity-metrics", label: "Capacity Metrics", pathSuffix: "/capacity" },
          ],
        },
      },
    ],
  },
  {
    id: "regulatory-compliance",
    name: "Regulatory Compliance",
    navShortName: "Regulatory",
    description: "Regulatory tracking and obligations",
    icon: "scale",
    color: "#795548",
    moduleCapabilities: [
      {
        id: "regulation-library",
        name: "Regulation Library",
        description: "Track applicable regulations",
        icon: "book",
        defaultEnabled: true,
        navContribution: {
          sectionId: "rc-library",
          sectionTitle: "Regulations",
          priority: 10,
          items: [
            { id: "all-regulations", label: "All Regulations", pathSuffix: "/regulations" },
            { id: "regulation-changes", label: "Regulation Changes", pathSuffix: "/regulation-changes" },
            { id: "applicability", label: "Applicability", pathSuffix: "/applicability" },
          ],
        },
      },
      {
        id: "obligations-mgmt",
        name: "Obligations Management",
        description: "Track regulatory obligations",
        icon: "check-square",
        defaultEnabled: true,
        navContribution: {
          sectionId: "rc-obligations",
          sectionTitle: "Obligations",
          priority: 20,
          items: [
            { id: "all-obligations", label: "All Obligations", pathSuffix: "/obligations" },
            { id: "obligation-owners", label: "Owners", pathSuffix: "/obligation-owners" },
            { id: "due-dates", label: "Due Dates", pathSuffix: "/due-dates", badge: "4" },
          ],
        },
      },
      {
        id: "compliance-calendar",
        name: "Compliance Calendar",
        description: "Regulatory deadlines and filings",
        icon: "calendar",
        defaultEnabled: true,
        navContribution: {
          sectionId: "rc-calendar",
          sectionTitle: "Calendar",
          priority: 30,
          items: [
            { id: "compliance-calendar", label: "Compliance Calendar", pathSuffix: "/compliance-calendar" },
            { id: "upcoming-deadlines", label: "Upcoming Deadlines", pathSuffix: "/upcoming-deadlines" },
            { id: "filing-tracker", label: "Filing Tracker", pathSuffix: "/filing-tracker" },
          ],
        },
      },
      {
        id: "sox-compliance",
        name: "SOX Compliance",
        description: "Sarbanes-Oxley management",
        icon: "gavel",
        defaultEnabled: false,
        navContribution: {
          sectionId: "rc-sox",
          sectionTitle: "SOX",
          priority: 40,
          items: [
            { id: "sox-controls", label: "SOX Controls", pathSuffix: "/sox-controls" },
            { id: "walkthroughs", label: "Walkthroughs", pathSuffix: "/walkthroughs" },
            { id: "section-302", label: "Section 302", pathSuffix: "/section-302" },
            { id: "section-404", label: "Section 404", pathSuffix: "/section-404" },
          ],
        },
      },
      {
        id: "gdpr-privacy",
        name: "GDPR & Privacy",
        description: "Data privacy compliance",
        icon: "eye-off",
        defaultEnabled: false,
        navContribution: {
          sectionId: "rc-privacy",
          sectionTitle: "Privacy",
          priority: 50,
          items: [
            { id: "data-inventory", label: "Data Inventory", pathSuffix: "/data-inventory" },
            { id: "consent-management", label: "Consent Management", pathSuffix: "/consent" },
            { id: "dsar-requests", label: "DSAR Requests", pathSuffix: "/dsar" },
            { id: "privacy-assessments", label: "Privacy Assessments", pathSuffix: "/pia" },
          ],
        },
      },
      {
        id: "policy-mgmt",
        name: "Policy Management",
        description: "Corporate policies and procedures",
        icon: "file-text",
        defaultEnabled: false,
        navContribution: {
          sectionId: "rc-policies",
          sectionTitle: "Policies",
          priority: 60,
          items: [
            { id: "policy-library", label: "Policy Library", pathSuffix: "/policy-library" },
            { id: "policy-reviews", label: "Policy Reviews", pathSuffix: "/policy-reviews" },
            { id: "attestations", label: "Attestations", pathSuffix: "/attestations" },
          ],
        },
      },
      {
        id: "regulatory-exams",
        name: "Regulatory Exams",
        description: "Manage regulatory examinations",
        icon: "search",
        defaultEnabled: false,
        navContribution: {
          sectionId: "rc-exams",
          sectionTitle: "Exams",
          priority: 70,
          items: [
            { id: "exam-management", label: "Exam Management", pathSuffix: "/exam-management" },
            { id: "exam-findings", label: "Exam Findings", pathSuffix: "/exam-findings" },
            { id: "mras", label: "MRAs", pathSuffix: "/mras" },
          ],
        },
      },
      {
        id: "regulatory-reporting",
        name: "Regulatory Reporting",
        description: "Regulatory reports and filings",
        icon: "send",
        defaultEnabled: false,
        navContribution: {
          sectionId: "rc-reporting",
          sectionTitle: "Reporting",
          priority: 80,
          items: [
            { id: "regulatory-reports", label: "Reports", pathSuffix: "/regulatory-reports" },
            { id: "filing-history", label: "Filing History", pathSuffix: "/filing-history" },
            { id: "submission-tracking", label: "Submission Tracking", pathSuffix: "/submissions" },
          ],
        },
      },
      {
        id: "compliance-training",
        name: "Compliance Training",
        description: "Compliance training and certifications",
        icon: "graduation-cap",
        defaultEnabled: false,
        navContribution: {
          sectionId: "rc-training",
          sectionTitle: "Training",
          priority: 90,
          items: [
            { id: "training-courses", label: "Training Courses", pathSuffix: "/training-courses" },
            { id: "certifications", label: "Certifications", pathSuffix: "/certifications" },
            { id: "training-compliance", label: "Compliance Status", pathSuffix: "/training-status" },
          ],
        },
      },
    ],
  },
  {
    id: "third-party",
    name: "Third Party",
    navShortName: "3rd Party",
    description: "Vendor and third-party risk management",
    icon: "users",
    color: "#FF9800",
    moduleCapabilities: [
      {
        id: "vendor-inventory",
        name: "Vendor Inventory",
        description: "Centralized vendor database",
        icon: "building",
        defaultEnabled: true,
        navContribution: {
          sectionId: "tp-inventory",
          sectionTitle: "Vendor Inventory",
          priority: 10,
          items: [
            { id: "all-vendors", label: "All Vendors", pathSuffix: "/vendors" },
            { id: "vendor-tiers", label: "Vendor Tiers", pathSuffix: "/vendor-tiers" },
            { id: "vendor-profiles", label: "Profiles", pathSuffix: "/vendor-profiles" },
          ],
        },
      },
      {
        id: "vendor-onboarding",
        name: "Vendor Onboarding",
        description: "New vendor intake process",
        icon: "user-plus",
        defaultEnabled: true,
        navContribution: {
          sectionId: "tp-onboarding",
          sectionTitle: "Onboarding",
          priority: 20,
          items: [
            { id: "intake-requests", label: "Intake Requests", pathSuffix: "/intake-requests" },
            { id: "onboarding-workflow", label: "Workflow", pathSuffix: "/onboarding-workflow" },
            { id: "approval-queue", label: "Approval Queue", pathSuffix: "/approval-queue", badge: "5" },
          ],
        },
      },
      {
        id: "vendor-assessments",
        name: "Vendor Assessments",
        description: "Due diligence assessments",
        icon: "clipboard-check",
        defaultEnabled: true,
        navContribution: {
          sectionId: "tp-assessments",
          sectionTitle: "Assessments",
          priority: 30,
          items: [
            { id: "assessment-queue", label: "Assessment Queue", pathSuffix: "/assessment-queue" },
            { id: "questionnaires", label: "Questionnaires", pathSuffix: "/questionnaires" },
            { id: "due-diligence", label: "Due Diligence", pathSuffix: "/due-diligence" },
          ],
        },
      },
      {
        id: "vendor-monitoring",
        name: "Continuous Monitoring",
        description: "Real-time vendor monitoring",
        icon: "activity",
        defaultEnabled: false,
        navContribution: {
          sectionId: "tp-monitoring",
          sectionTitle: "Monitoring",
          priority: 40,
          items: [
            { id: "risk-signals", label: "Risk Signals", pathSuffix: "/risk-signals" },
            { id: "news-monitoring", label: "News Monitoring", pathSuffix: "/news-monitoring" },
            { id: "financial-health", label: "Financial Health", pathSuffix: "/financial-health" },
          ],
        },
      },
      {
        id: "contract-mgmt",
        name: "Contract Management",
        description: "Vendor contracts and terms",
        icon: "file-signature",
        defaultEnabled: false,
        navContribution: {
          sectionId: "tp-contracts",
          sectionTitle: "Contracts",
          priority: 50,
          items: [
            { id: "all-contracts", label: "All Contracts", pathSuffix: "/contracts" },
            { id: "contract-renewals", label: "Renewals", pathSuffix: "/contract-renewals" },
            { id: "sla-tracking", label: "SLA Tracking", pathSuffix: "/sla-tracking" },
          ],
        },
      },
      {
        id: "vendor-performance",
        name: "Vendor Performance",
        description: "Performance scorecards",
        icon: "star",
        defaultEnabled: false,
        navContribution: {
          sectionId: "tp-performance",
          sectionTitle: "Performance",
          priority: 60,
          items: [
            { id: "scorecards", label: "Scorecards", pathSuffix: "/scorecards" },
            { id: "kpi-tracking", label: "KPI Tracking", pathSuffix: "/vendor-kpis" },
            { id: "reviews", label: "Reviews", pathSuffix: "/vendor-reviews" },
          ],
        },
      },
      {
        id: "vendor-issues",
        name: "Vendor Issues",
        description: "Track vendor-related issues",
        icon: "alert-triangle",
        defaultEnabled: false,
        navContribution: {
          sectionId: "tp-issues",
          sectionTitle: "Issues",
          priority: 70,
          items: [
            { id: "vendor-issues", label: "Vendor Issues", pathSuffix: "/vendor-issues" },
            { id: "escalations", label: "Escalations", pathSuffix: "/escalations" },
            { id: "remediation", label: "Remediation", pathSuffix: "/vendor-remediation" },
          ],
        },
      },
      {
        id: "fourth-party",
        name: "Fourth Party Risk",
        description: "Subcontractor and nth-party risk",
        icon: "network",
        defaultEnabled: false,
        navContribution: {
          sectionId: "tp-fourth-party",
          sectionTitle: "Fourth Party",
          priority: 80,
          items: [
            { id: "subcontractors", label: "Subcontractors", pathSuffix: "/subcontractors" },
            { id: "supply-chain", label: "Supply Chain", pathSuffix: "/supply-chain" },
            { id: "concentration-risk", label: "Concentration Risk", pathSuffix: "/concentration" },
          ],
        },
      },
      {
        id: "vendor-offboarding",
        name: "Vendor Offboarding",
        description: "Vendor exit management",
        icon: "user-minus",
        defaultEnabled: false,
        navContribution: {
          sectionId: "tp-offboarding",
          sectionTitle: "Offboarding",
          priority: 90,
          items: [
            { id: "exit-requests", label: "Exit Requests", pathSuffix: "/exit-requests" },
            { id: "transition-plans", label: "Transition Plans", pathSuffix: "/transition-plans" },
            { id: "data-return", label: "Data Return", pathSuffix: "/data-return" },
          ],
        },
      },
    ],
  },
  {
    id: "ai-governance",
    name: "AI Governance",
    navShortName: "AI Gov",
    description: "AI/ML model risk and governance",
    icon: "brain",
    color: "#E91E63",
    moduleCapabilities: [
      {
        id: "ai-inventory",
        name: "AI Model Inventory",
        description: "Catalog of AI/ML models",
        icon: "cpu",
        defaultEnabled: true,
        navContribution: {
          sectionId: "ai-inventory",
          sectionTitle: "Model Inventory",
          priority: 10,
          items: [
            { id: "all-models", label: "All Models", pathSuffix: "/ai-models" },
            { id: "model-registry", label: "Model Registry", pathSuffix: "/model-registry" },
            { id: "use-cases", label: "Use Cases", pathSuffix: "/ai-use-cases" },
          ],
        },
      },
      {
        id: "ai-risk-assessment",
        name: "AI Risk Assessment",
        description: "Assess AI model risks",
        icon: "alert-triangle",
        defaultEnabled: true,
        navContribution: {
          sectionId: "ai-risk",
          sectionTitle: "Risk Assessment",
          priority: 20,
          items: [
            { id: "risk-assessments", label: "Risk Assessments", pathSuffix: "/ai-risk-assessments" },
            { id: "risk-scoring", label: "Risk Scoring", pathSuffix: "/ai-risk-scoring" },
            { id: "high-risk-models", label: "High Risk Models", pathSuffix: "/high-risk-models", badge: "3" },
          ],
        },
      },
      {
        id: "ai-validation",
        name: "Model Validation",
        description: "AI model validation and testing",
        icon: "check-circle",
        defaultEnabled: true,
        navContribution: {
          sectionId: "ai-validation",
          sectionTitle: "Validation",
          priority: 30,
          items: [
            { id: "validation-queue", label: "Validation Queue", pathSuffix: "/validation-queue" },
            { id: "test-results", label: "Test Results", pathSuffix: "/ai-test-results" },
            { id: "performance-metrics", label: "Performance", pathSuffix: "/ai-performance" },
          ],
        },
      },
      {
        id: "ai-ethics",
        name: "AI Ethics & Bias",
        description: "Bias detection and fairness",
        icon: "scale",
        defaultEnabled: false,
        navContribution: {
          sectionId: "ai-ethics",
          sectionTitle: "Ethics & Bias",
          priority: 40,
          items: [
            { id: "bias-assessments", label: "Bias Assessments", pathSuffix: "/bias-assessments" },
            { id: "fairness-metrics", label: "Fairness Metrics", pathSuffix: "/fairness-metrics" },
            { id: "ethical-reviews", label: "Ethical Reviews", pathSuffix: "/ethical-reviews" },
          ],
        },
      },
      {
        id: "ai-explainability",
        name: "Explainability",
        description: "Model interpretability",
        icon: "message-square",
        defaultEnabled: false,
        navContribution: {
          sectionId: "ai-explainability",
          sectionTitle: "Explainability",
          priority: 50,
          items: [
            { id: "interpretability", label: "Interpretability", pathSuffix: "/interpretability" },
            { id: "feature-importance", label: "Feature Importance", pathSuffix: "/feature-importance" },
            { id: "decision-logs", label: "Decision Logs", pathSuffix: "/decision-logs" },
          ],
        },
      },
      {
        id: "ai-monitoring",
        name: "AI Monitoring",
        description: "Production model monitoring",
        icon: "activity",
        defaultEnabled: false,
        navContribution: {
          sectionId: "ai-monitoring",
          sectionTitle: "Monitoring",
          priority: 60,
          items: [
            { id: "model-drift", label: "Model Drift", pathSuffix: "/model-drift" },
            { id: "data-drift", label: "Data Drift", pathSuffix: "/data-drift" },
            { id: "alerts", label: "Alerts", pathSuffix: "/ai-alerts" },
          ],
        },
      },
      {
        id: "ai-lifecycle",
        name: "Model Lifecycle",
        description: "End-to-end model lifecycle",
        icon: "git-merge",
        defaultEnabled: false,
        navContribution: {
          sectionId: "ai-lifecycle",
          sectionTitle: "Lifecycle",
          priority: 70,
          items: [
            { id: "development", label: "Development", pathSuffix: "/ai-development" },
            { id: "deployment", label: "Deployment", pathSuffix: "/ai-deployment" },
            { id: "retirement", label: "Retirement", pathSuffix: "/ai-retirement" },
          ],
        },
      },
      {
        id: "ai-compliance",
        name: "AI Compliance",
        description: "AI regulatory compliance",
        icon: "gavel",
        defaultEnabled: false,
        navContribution: {
          sectionId: "ai-compliance",
          sectionTitle: "Compliance",
          priority: 80,
          items: [
            { id: "eu-ai-act", label: "EU AI Act", pathSuffix: "/eu-ai-act" },
            { id: "regulatory-mapping", label: "Regulatory Mapping", pathSuffix: "/ai-regulatory" },
            { id: "compliance-status", label: "Compliance Status", pathSuffix: "/ai-compliance-status" },
          ],
        },
      },
      {
        id: "ai-documentation",
        name: "AI Documentation",
        description: "Model cards and documentation",
        icon: "file-text",
        defaultEnabled: false,
        navContribution: {
          sectionId: "ai-docs",
          sectionTitle: "Documentation",
          priority: 90,
          items: [
            { id: "model-cards", label: "Model Cards", pathSuffix: "/model-cards" },
            { id: "data-cards", label: "Data Cards", pathSuffix: "/data-cards" },
            { id: "technical-docs", label: "Technical Docs", pathSuffix: "/ai-tech-docs" },
          ],
        },
      },
    ],
  },
  {
    id: "environmental-compliance",
    name: "Environmental Compliance",
    navShortName: "ESG",
    description: "ESG and sustainability management",
    icon: "leaf",
    color: "#4CAF50",
    moduleCapabilities: [
      {
        id: "esg-metrics",
        name: "ESG Metrics",
        description: "Track ESG performance",
        icon: "bar-chart-2",
        defaultEnabled: true,
        navContribution: {
          sectionId: "env-metrics",
          sectionTitle: "ESG Metrics",
          priority: 10,
          items: [
            { id: "esg-dashboard", label: "ESG Dashboard", pathSuffix: "/esg-dashboard" },
            { id: "environmental", label: "Environmental", pathSuffix: "/environmental" },
            { id: "social", label: "Social", pathSuffix: "/social" },
            { id: "governance", label: "Governance", pathSuffix: "/governance-esg" },
          ],
        },
      },
      {
        id: "carbon-tracking",
        name: "Carbon Tracking",
        description: "Emissions and carbon footprint",
        icon: "cloud",
        defaultEnabled: true,
        navContribution: {
          sectionId: "env-carbon",
          sectionTitle: "Carbon",
          priority: 20,
          items: [
            { id: "emissions-inventory", label: "Emissions Inventory", pathSuffix: "/emissions" },
            { id: "scope-1-2-3", label: "Scope 1, 2, 3", pathSuffix: "/scope-tracking" },
            { id: "carbon-offsets", label: "Carbon Offsets", pathSuffix: "/carbon-offsets" },
          ],
        },
      },
      {
        id: "net-zero",
        name: "Net Zero Planning",
        description: "Net zero targets and roadmap",
        icon: "target",
        defaultEnabled: true,
        navContribution: {
          sectionId: "env-net-zero",
          sectionTitle: "Net Zero",
          priority: 30,
          items: [
            { id: "net-zero-targets", label: "Net Zero Targets", pathSuffix: "/net-zero-targets" },
            { id: "reduction-initiatives", label: "Initiatives", pathSuffix: "/reduction-initiatives" },
            { id: "progress-tracking", label: "Progress", pathSuffix: "/net-zero-progress" },
          ],
        },
      },
      {
        id: "sustainability-reporting",
        name: "Sustainability Reporting",
        description: "ESG disclosure and reporting",
        icon: "file-text",
        defaultEnabled: false,
        navContribution: {
          sectionId: "env-reporting",
          sectionTitle: "Reporting",
          priority: 40,
          items: [
            { id: "frameworks", label: "Frameworks", pathSuffix: "/esg-frameworks" },
            { id: "disclosures", label: "Disclosures", pathSuffix: "/disclosures" },
            { id: "stakeholder-reports", label: "Stakeholder Reports", pathSuffix: "/stakeholder-reports" },
          ],
        },
      },
      {
        id: "climate-risk",
        name: "Climate Risk",
        description: "Climate risk assessment",
        icon: "thermometer",
        defaultEnabled: false,
        navContribution: {
          sectionId: "env-climate",
          sectionTitle: "Climate Risk",
          priority: 50,
          items: [
            { id: "physical-risks", label: "Physical Risks", pathSuffix: "/physical-risks" },
            { id: "transition-risks", label: "Transition Risks", pathSuffix: "/transition-risks" },
            { id: "scenario-analysis", label: "Scenario Analysis", pathSuffix: "/climate-scenarios" },
          ],
        },
      },
      {
        id: "supply-chain-esg",
        name: "Supply Chain ESG",
        description: "Supplier sustainability",
        icon: "truck",
        defaultEnabled: false,
        navContribution: {
          sectionId: "env-supply-chain",
          sectionTitle: "Supply Chain",
          priority: 60,
          items: [
            { id: "supplier-esg", label: "Supplier ESG", pathSuffix: "/supplier-esg" },
            { id: "sustainability-audits", label: "Audits", pathSuffix: "/sustainability-audits" },
            { id: "certifications", label: "Certifications", pathSuffix: "/esg-certifications" },
          ],
        },
      },
      {
        id: "biodiversity",
        name: "Biodiversity",
        description: "Nature and biodiversity impact",
        icon: "trees",
        defaultEnabled: false,
        navContribution: {
          sectionId: "env-biodiversity",
          sectionTitle: "Biodiversity",
          priority: 70,
          items: [
            { id: "impact-assessment", label: "Impact Assessment", pathSuffix: "/biodiversity-impact" },
            { id: "conservation", label: "Conservation", pathSuffix: "/conservation" },
            { id: "tnfd", label: "TNFD", pathSuffix: "/tnfd" },
          ],
        },
      },
      {
        id: "water-waste",
        name: "Water & Waste",
        description: "Water and waste management",
        icon: "droplet",
        defaultEnabled: false,
        navContribution: {
          sectionId: "env-water-waste",
          sectionTitle: "Water & Waste",
          priority: 80,
          items: [
            { id: "water-usage", label: "Water Usage", pathSuffix: "/water-usage" },
            { id: "waste-management", label: "Waste Management", pathSuffix: "/waste-management" },
            { id: "circular-economy", label: "Circular Economy", pathSuffix: "/circular-economy" },
          ],
        },
      },
      {
        id: "dei-social",
        name: "DEI & Social",
        description: "Diversity, equity, inclusion",
        icon: "heart",
        defaultEnabled: false,
        navContribution: {
          sectionId: "env-dei",
          sectionTitle: "DEI & Social",
          priority: 90,
          items: [
            { id: "dei-metrics", label: "DEI Metrics", pathSuffix: "/dei-metrics" },
            { id: "pay-equity", label: "Pay Equity", pathSuffix: "/pay-equity" },
            { id: "community-impact", label: "Community Impact", pathSuffix: "/community-impact" },
          ],
        },
      },
    ],
  },
];

export function generateNavSections(
  selectedBuckets: string[],
  enabledModules: Record<string, string[]>
): SideNavSection[] {
  const allContributions: Array<NavContribution & { bucketId: string }> = [];
  
  for (const bucketId of selectedBuckets) {
    const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
    if (!bucket) continue;
    
    const enabledForBucket = enabledModules[bucketId] || [];
    
    for (const moduleId of enabledForBucket) {
      const module = bucket.moduleCapabilities.find(m => m.id === moduleId);
      if (module) {
        allContributions.push({
          ...module.navContribution,
          bucketId,
        });
      }
    }
  }
  
  allContributions.sort((a, b) => {
    const bucketOrderA = selectedBuckets.indexOf(a.bucketId);
    const bucketOrderB = selectedBuckets.indexOf(b.bucketId);
    if (bucketOrderA !== bucketOrderB) return bucketOrderA - bucketOrderB;
    return a.priority - b.priority;
  });
  
  const dashboardSection: SideNavSection = {
    id: "workspace-dashboards",
    title: "Dashboards",
    defaultExpanded: true,
    collapsible: true,
    items: [
      { id: "my-dashboard", label: "My Dashboard", path: "/" },
      { id: "global-residual-risk", label: "Global Residual Risk", path: "/global-residual-risk" },
    ],
  };
  
  const sections: SideNavSection[] = [dashboardSection];
  
  for (const contribution of allContributions) {
    const section: SideNavSection = {
      id: contribution.sectionId,
      title: contribution.sectionTitle,
      defaultExpanded: true,
      collapsible: true,
      items: contribution.items.map(item => ({
        id: item.id,
        label: item.label,
        path: item.pathSuffix,
        badge: item.badge,
        icon: item.icon,
      })),
    };
    sections.push(section);
  }
  
  const viewsSection: SideNavSection = {
    id: "workspace-views",
    title: "Views",
    defaultExpanded: true,
    collapsible: true,
    items: [
      { id: "open-tasks", label: "Open Tasks", path: "/open-tasks", badge: "4" },
      { id: "activity-log", label: "Activity Log", path: "/activity-log" },
    ],
  };
  sections.push(viewsSection);
  
  return sections;
}

export function generateModuleNavGroups(
  selectedBuckets: string[],
  enabledModules: Record<string, string[]>
): ModuleNavGroup[] {
  const groups: ModuleNavGroup[] = [];
  
  for (const bucketId of selectedBuckets) {
    const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
    if (!bucket) continue;
    
    const enabledForBucket = enabledModules[bucketId] || [];
    if (enabledForBucket.length === 0) continue;
    
    const sections: SideNavSection[] = [];
    
    for (const moduleId of enabledForBucket) {
      const module = bucket.moduleCapabilities.find(m => m.id === moduleId);
      if (module) {
        const section: SideNavSection = {
          id: module.navContribution.sectionId,
          title: module.navContribution.sectionTitle,
          defaultExpanded: true,
          collapsible: true,
          items: module.navContribution.items.map(item => ({
            id: item.id,
            label: item.label,
            path: item.pathSuffix,
            badge: item.badge,
            icon: item.icon,
          })),
        };
        sections.push(section);
      }
    }
    
    if (sections.length > 0) {
      groups.push({
        moduleId: bucket.id,
        moduleName: bucket.name,
        moduleNavShortName: bucket.navShortName,
        moduleColor: bucket.color,
        moduleIcon: bucket.icon,
        defaultExpanded: true,
        sections,
      });
    }
  }
  
  return groups;
}

export function getDefaultEnabledModules(bucketId: string): string[] {
  const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
  if (!bucket) return [];
  return bucket.moduleCapabilities
    .filter(m => m.defaultEnabled)
    .map(m => m.id);
}

export function initializeEnabledModules(selectedBuckets: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const bucketId of selectedBuckets) {
    result[bucketId] = getDefaultEnabledModules(bucketId);
  }
  return result;
}

export function getCapabilityStats(
  selectedBuckets: string[],
  enabledModules: Record<string, string[]>
): { totalModules: number; totalNavItems: number; bucketCount: number } {
  let totalModules = 0;
  let totalNavItems = 0;
  
  for (const bucketId of selectedBuckets) {
    const modules = enabledModules[bucketId] || [];
    totalModules += modules.length;
    
    const bucket = productCapabilityBuckets.find(b => b.id === bucketId);
    if (bucket) {
      for (const moduleId of modules) {
        const module = bucket.moduleCapabilities.find(m => m.id === moduleId);
        if (module) {
          totalNavItems += module.navContribution.items.length;
        }
      }
    }
  }
  
  return { totalModules, totalNavItems, bucketCount: selectedBuckets.length };
}

/**
 * Get AI quick actions based on selected buckets and modules
 */
export function getQuickActionsForWorkspace(
  selectedBuckets: string[],
  enabledModules: Record<string, string[]>
): Array<{ id: string; label: string; icon: string; action: string }> {
  const actions: Array<{ id: string; label: string; icon: string; action: string }> = [];
  
  for (const bucketId of selectedBuckets) {
    switch (bucketId) {
      case "controls-management":
        actions.push(
          { id: "create-control", label: "Create Control", icon: "plus", action: "create-control" },
          { id: "run-test", label: "Run Control Test", icon: "play", action: "run-test" }
        );
        break;
      case "enterprise-risk":
        actions.push(
          { id: "assess-risk", label: "Assess Risk", icon: "calculator", action: "assess-risk" },
          { id: "add-risk", label: "Add Risk", icon: "plus", action: "add-risk" }
        );
        break;
      case "audit-management":
        actions.push(
          { id: "start-audit", label: "Start Audit", icon: "play", action: "start-audit" },
          { id: "log-finding", label: "Log Finding", icon: "alert-triangle", action: "log-finding" }
        );
        break;
      case "cyber-it-compliance":
        actions.push(
          { id: "report-incident", label: "Report Incident", icon: "alert-circle", action: "report-incident" },
          { id: "scan-vulnerabilities", label: "Scan Vulnerabilities", icon: "search", action: "scan-vulnerabilities" }
        );
        break;
      case "third-party":
        actions.push(
          { id: "add-vendor", label: "Add Vendor", icon: "user-plus", action: "add-vendor" },
          { id: "assess-vendor", label: "Assess Vendor", icon: "clipboard-check", action: "assess-vendor" }
        );
        break;
      case "ai-governance":
        actions.push(
          { id: "register-model", label: "Register AI Model", icon: "cpu", action: "register-model" },
          { id: "validate-model", label: "Validate Model", icon: "check-circle", action: "validate-model" }
        );
        break;
      case "environmental-compliance":
        actions.push(
          { id: "log-emissions", label: "Log Emissions", icon: "cloud", action: "log-emissions" },
          { id: "create-report", label: "Create ESG Report", icon: "file-text", action: "create-esg-report" }
        );
        break;
      default:
        break;
    }
  }
  
  return actions.slice(0, 6);
}
