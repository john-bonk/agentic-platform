/**
 * Workspace Wizard Configuration
 * 
 * Defines the multi-stage workspace creation system with:
 * - Product Capability Buckets (Stage 1)
 * - Module Capabilities per bucket (Stage 2)
 * - Navigation structure generation from capability combinations
 */

import type { SideNavSection } from "./navigation";

export interface ProductCapabilityBucket {
  id: string;
  name: string;
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

export const productCapabilityBuckets: ProductCapabilityBucket[] = [
  {
    id: "risk-management",
    name: "Risk Management",
    description: "Enterprise risk identification, assessment, and mitigation",
    icon: "trending-up",
    color: "#266C92",
    moduleCapabilities: [
      {
        id: "risk-register",
        name: "Risk Register",
        description: "Centralized risk inventory and tracking",
        icon: "list",
        defaultEnabled: true,
        navContribution: {
          sectionId: "risk-inventory",
          sectionTitle: "Risk Inventory",
          priority: 10,
          items: [
            { id: "risk-register", label: "Risk Register", pathSuffix: "/risk-register" },
            { id: "risk-categories", label: "Risk Categories", pathSuffix: "/risk-categories" },
          ],
        },
      },
      {
        id: "risk-assessment",
        name: "Risk Assessment",
        description: "Quantitative and qualitative risk scoring",
        icon: "calculator",
        defaultEnabled: true,
        navContribution: {
          sectionId: "risk-analysis",
          sectionTitle: "Analysis",
          priority: 20,
          items: [
            { id: "risk-heatmap", label: "Risk Heatmap", pathSuffix: "/risk-heatmap" },
            { id: "risk-scoring", label: "Risk Scoring", pathSuffix: "/risk-scoring" },
            { id: "impact-analysis", label: "Impact Analysis", pathSuffix: "/impact-analysis" },
          ],
        },
      },
      {
        id: "risk-mitigation",
        name: "Mitigation Tracking",
        description: "Track risk treatment plans and progress",
        icon: "shield",
        defaultEnabled: false,
        navContribution: {
          sectionId: "risk-mitigation",
          sectionTitle: "Mitigation",
          priority: 30,
          items: [
            { id: "treatment-plans", label: "Treatment Plans", pathSuffix: "/treatment-plans" },
            { id: "mitigation-tracker", label: "Mitigation Tracker", pathSuffix: "/mitigation-tracker" },
          ],
        },
      },
      {
        id: "risk-appetite",
        name: "Risk Appetite",
        description: "Define and monitor organizational risk tolerance",
        icon: "target",
        defaultEnabled: false,
        navContribution: {
          sectionId: "risk-governance",
          sectionTitle: "Governance",
          priority: 40,
          items: [
            { id: "risk-appetite", label: "Risk Appetite", pathSuffix: "/risk-appetite" },
            { id: "key-risk-indicators", label: "Key Risk Indicators", pathSuffix: "/key-risk-indicators" },
          ],
        },
      },
    ],
  },
  {
    id: "audit-management",
    name: "Audit Management",
    description: "Internal audit planning, execution, and reporting",
    icon: "clipboard-list",
    color: "#4CAF50",
    moduleCapabilities: [
      {
        id: "audit-planning",
        name: "Audit Planning",
        description: "Annual audit plan and scheduling",
        icon: "calendar",
        defaultEnabled: true,
        navContribution: {
          sectionId: "audit-planning",
          sectionTitle: "Planning",
          priority: 10,
          items: [
            { id: "audit-universe", label: "Audit Universe", pathSuffix: "/audit-universe" },
            { id: "annual-plan", label: "Annual Plan", pathSuffix: "/annual-plan" },
            { id: "resource-allocation", label: "Resource Allocation", pathSuffix: "/resource-allocation" },
          ],
        },
      },
      {
        id: "audit-execution",
        name: "Audit Execution",
        description: "Fieldwork and workpaper management",
        icon: "file-text",
        defaultEnabled: true,
        navContribution: {
          sectionId: "audit-execution",
          sectionTitle: "Execution",
          priority: 20,
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
        description: "Track audit findings and remediation",
        icon: "alert-triangle",
        defaultEnabled: true,
        navContribution: {
          sectionId: "audit-findings",
          sectionTitle: "Findings",
          priority: 30,
          items: [
            { id: "findings", label: "All Findings", pathSuffix: "/findings" },
            { id: "recommendations", label: "Recommendations", pathSuffix: "/recommendations" },
            { id: "follow-ups", label: "Follow-ups", pathSuffix: "/follow-ups", badge: "3" },
          ],
        },
      },
      {
        id: "audit-reporting",
        name: "Audit Reporting",
        description: "Generate and distribute audit reports",
        icon: "bar-chart",
        defaultEnabled: false,
        navContribution: {
          sectionId: "audit-reporting",
          sectionTitle: "Reporting",
          priority: 40,
          items: [
            { id: "draft-reports", label: "Draft Reports", pathSuffix: "/draft-reports" },
            { id: "published-reports", label: "Published Reports", pathSuffix: "/published-reports" },
            { id: "stakeholder-reports", label: "Stakeholder Reports", pathSuffix: "/stakeholder-reports" },
          ],
        },
      },
    ],
  },
  {
    id: "compliance-management",
    name: "Compliance Management",
    description: "Regulatory and internal compliance tracking",
    icon: "scale",
    color: "#9C27B0",
    moduleCapabilities: [
      {
        id: "controls-library",
        name: "Controls Library",
        description: "Centralized control framework management",
        icon: "shield-check",
        defaultEnabled: true,
        navContribution: {
          sectionId: "compliance-controls",
          sectionTitle: "Controls",
          priority: 10,
          items: [
            { id: "all-controls", label: "All Controls", pathSuffix: "/controls" },
            { id: "control-testing", label: "Control Testing", pathSuffix: "/control-testing" },
            { id: "control-gaps", label: "Control Gaps", pathSuffix: "/control-gaps" },
          ],
        },
      },
      {
        id: "regulatory-tracking",
        name: "Regulatory Tracking",
        description: "Monitor regulatory changes and requirements",
        icon: "gavel",
        defaultEnabled: true,
        navContribution: {
          sectionId: "compliance-regulatory",
          sectionTitle: "Regulatory",
          priority: 20,
          items: [
            { id: "regulations", label: "Regulations", pathSuffix: "/regulations" },
            { id: "obligations", label: "Obligations", pathSuffix: "/obligations" },
            { id: "compliance-calendar", label: "Compliance Calendar", pathSuffix: "/compliance-calendar" },
          ],
        },
      },
      {
        id: "policy-management",
        name: "Policy Management",
        description: "Create and maintain organizational policies",
        icon: "file-text",
        defaultEnabled: false,
        navContribution: {
          sectionId: "compliance-policies",
          sectionTitle: "Policies",
          priority: 30,
          items: [
            { id: "policy-library", label: "Policy Library", pathSuffix: "/policy-library" },
            { id: "attestations", label: "Attestations", pathSuffix: "/attestations" },
          ],
        },
      },
      {
        id: "sox-compliance",
        name: "SOX Compliance",
        description: "Sarbanes-Oxley compliance management",
        icon: "check-square",
        defaultEnabled: false,
        navContribution: {
          sectionId: "compliance-sox",
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
    ],
  },
  {
    id: "security-operations",
    name: "Security Operations",
    description: "IT security, vulnerabilities, and threat management",
    icon: "lock",
    color: "#F44336",
    moduleCapabilities: [
      {
        id: "vulnerability-management",
        name: "Vulnerability Management",
        description: "Track and remediate security vulnerabilities",
        icon: "bug",
        defaultEnabled: true,
        navContribution: {
          sectionId: "security-vulnerabilities",
          sectionTitle: "Vulnerabilities",
          priority: 10,
          items: [
            { id: "vulnerability-scanner", label: "Scanner Results", pathSuffix: "/vulnerability-scanner" },
            { id: "vulnerability-queue", label: "Remediation Queue", pathSuffix: "/remediation-queue" },
            { id: "cve-tracking", label: "CVE Tracking", pathSuffix: "/cve-tracking" },
          ],
        },
      },
      {
        id: "threat-intelligence",
        name: "Threat Intelligence",
        description: "Monitor and analyze security threats",
        icon: "radar",
        defaultEnabled: true,
        navContribution: {
          sectionId: "security-threats",
          sectionTitle: "Threat Intel",
          priority: 20,
          items: [
            { id: "threat-feed", label: "Threat Feed", pathSuffix: "/threat-feed" },
            { id: "ioc-database", label: "IOC Database", pathSuffix: "/ioc-database" },
            { id: "threat-actors", label: "Threat Actors", pathSuffix: "/threat-actors" },
          ],
        },
      },
      {
        id: "incident-response",
        name: "Incident Response",
        description: "Security incident tracking and response",
        icon: "alert-circle",
        defaultEnabled: false,
        navContribution: {
          sectionId: "security-incidents",
          sectionTitle: "Incidents",
          priority: 30,
          items: [
            { id: "active-incidents", label: "Active Incidents", pathSuffix: "/active-incidents", badge: "2" },
            { id: "incident-playbooks", label: "Playbooks", pathSuffix: "/playbooks" },
            { id: "post-mortems", label: "Post-mortems", pathSuffix: "/post-mortems" },
          ],
        },
      },
      {
        id: "security-assessments",
        name: "Security Assessments",
        description: "Penetration testing and security reviews",
        icon: "shield-alert",
        defaultEnabled: false,
        navContribution: {
          sectionId: "security-assessments",
          sectionTitle: "Assessments",
          priority: 40,
          items: [
            { id: "pen-tests", label: "Penetration Tests", pathSuffix: "/pen-tests" },
            { id: "security-reviews", label: "Security Reviews", pathSuffix: "/security-reviews" },
            { id: "vendor-assessments", label: "Vendor Assessments", pathSuffix: "/vendor-assessments" },
          ],
        },
      },
    ],
  },
  {
    id: "third-party-risk",
    name: "Third Party Risk",
    description: "Vendor and supplier risk management",
    icon: "users",
    color: "#FF9800",
    moduleCapabilities: [
      {
        id: "vendor-inventory",
        name: "Vendor Inventory",
        description: "Centralized vendor database and profiles",
        icon: "building",
        defaultEnabled: true,
        navContribution: {
          sectionId: "tprm-inventory",
          sectionTitle: "Vendors",
          priority: 10,
          items: [
            { id: "all-vendors", label: "All Vendors", pathSuffix: "/vendors" },
            { id: "vendor-tiers", label: "Vendor Tiers", pathSuffix: "/vendor-tiers" },
            { id: "contracts", label: "Contracts", pathSuffix: "/contracts" },
          ],
        },
      },
      {
        id: "vendor-assessments",
        name: "Vendor Assessments",
        description: "Due diligence and ongoing monitoring",
        icon: "clipboard-check",
        defaultEnabled: true,
        navContribution: {
          sectionId: "tprm-assessments",
          sectionTitle: "Assessments",
          priority: 20,
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
        description: "Real-time vendor risk monitoring",
        icon: "activity",
        defaultEnabled: false,
        navContribution: {
          sectionId: "tprm-monitoring",
          sectionTitle: "Monitoring",
          priority: 30,
          items: [
            { id: "risk-signals", label: "Risk Signals", pathSuffix: "/risk-signals" },
            { id: "news-monitoring", label: "News Monitoring", pathSuffix: "/news-monitoring" },
            { id: "financial-health", label: "Financial Health", pathSuffix: "/financial-health" },
          ],
        },
      },
    ],
  },
  {
    id: "esg-sustainability",
    name: "ESG & Sustainability",
    description: "Environmental, social, and governance tracking",
    icon: "leaf",
    color: "#4CAF50",
    moduleCapabilities: [
      {
        id: "esg-metrics",
        name: "ESG Metrics",
        description: "Track ESG performance indicators",
        icon: "bar-chart-2",
        defaultEnabled: true,
        navContribution: {
          sectionId: "esg-metrics",
          sectionTitle: "Metrics",
          priority: 10,
          items: [
            { id: "esg-dashboard", label: "ESG Dashboard", pathSuffix: "/esg-dashboard" },
            { id: "environmental", label: "Environmental", pathSuffix: "/environmental" },
            { id: "social", label: "Social", pathSuffix: "/social" },
            { id: "governance", label: "Governance", pathSuffix: "/governance" },
          ],
        },
      },
      {
        id: "carbon-tracking",
        name: "Carbon Tracking",
        description: "Emissions tracking and net-zero planning",
        icon: "cloud",
        defaultEnabled: false,
        navContribution: {
          sectionId: "esg-carbon",
          sectionTitle: "Carbon",
          priority: 20,
          items: [
            { id: "emissions-inventory", label: "Emissions Inventory", pathSuffix: "/emissions" },
            { id: "scope-tracking", label: "Scope Tracking", pathSuffix: "/scope-tracking" },
            { id: "net-zero-plan", label: "Net Zero Plan", pathSuffix: "/net-zero" },
          ],
        },
      },
      {
        id: "esg-reporting",
        name: "ESG Reporting",
        description: "Sustainability disclosure and reporting",
        icon: "file-text",
        defaultEnabled: true,
        navContribution: {
          sectionId: "esg-reporting",
          sectionTitle: "Reporting",
          priority: 30,
          items: [
            { id: "frameworks", label: "Frameworks", pathSuffix: "/frameworks" },
            { id: "disclosures", label: "Disclosures", pathSuffix: "/disclosures" },
            { id: "stakeholder-reports", label: "Stakeholder Reports", pathSuffix: "/esg-reports" },
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
