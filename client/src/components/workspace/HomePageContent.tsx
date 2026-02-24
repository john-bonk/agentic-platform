import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Target,
  Shield,
  Zap,
} from "lucide-react";
import { useWorkspaceStore, workspaces as storeWorkspaces, solutionCapabilities } from "@/lib/workspaceStore";
import { useHomeAssistantStore } from "@/lib/homeAssistantStore";
import headerBgImage from "@/assets/header-background.png";

export interface Task {
  id: string;
  title: string;
  context: string;
  preparers: string[];
  dueDate: string;
  status: "incomplete" | "complete" | "in-progress";
}

export interface Issue {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  assignee: string;
  dateReported: string;
  status: "open" | "investigating" | "resolved";
}

export interface Control {
  id: string;
  controlId: string;
  title: string;
  framework: string;
  owner: string;
  testDate: string;
  effectiveness: "effective" | "ineffective" | "needs-testing";
}

export interface Narrative {
  id: string;
  title: string;
  process: string;
  author: string;
  lastUpdated: string;
  status: "draft" | "in-review" | "approved";
}

export interface Risk {
  id: string;
  title: string;
  riskCategory: string;
  likelihood: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  owner: string;
  mitigationStatus: "mitigated" | "in-progress" | "not-started";
}

export interface TabComment {
  id: string;
  title: string;
  context: string;
  author: string;
  date: string;
  threadCount: number;
  status: "new" | "read" | "flagged";
}

type TabType = "tasks" | "issues" | "controls" | "narratives" | "risks" | "comments";

interface TabContentMap {
  tasks: Task[];
  issues: Issue[];
  controls: Control[];
  narratives: Narrative[];
  risks: Risk[];
  comments: TabComment[];
}

interface ScenarioPlanning {
  title: string;
  progress: string;
  completed: number;
  total: number;
}

interface InboxStat {
  label: string;
  value: number;
}

export interface WorkspaceContentData {
  scenarioPlanning: ScenarioPlanning;
  tasks: Task[];
  inboxStats: InboxStat[];
  quickActions: { label: string; id: string }[];
  tabContent: TabContentMap;
}

export const workspaceContent: Record<string, WorkspaceContentData> = {
  "enterprise-risk": {
    scenarioPlanning: {
      title: "Tariff Mitigation Strategy",
      progress: "2/4 Completed",
      completed: 2,
      total: 4,
    },
    tasks: [
      {
        id: "risk-1",
        title: "Assess Supply Chain Tariff Exposure",
        context: "Risk Assessment: Tariff Mitigation",
        preparers: ["Sarah Chen", "Michael Torres"],
        dueDate: "10-31-2025",
        status: "incomplete",
      },
      {
        id: "risk-2",
        title: "Update Vendor Cost Impact Analysis",
        context: "Analysis: Tariff Mitigation",
        preparers: ["James Wilson"],
        dueDate: "11-15-2025",
        status: "incomplete",
      },
      {
        id: "risk-3",
        title: "Review Alternative Sourcing Options",
        context: "Strategy: Tariff Mitigation",
        preparers: ["Sarah Chen", "Amanda Liu"],
        dueDate: "11-30-2025",
        status: "incomplete",
      },
      {
        id: "risk-4",
        title: "Board Presentation on Tariff Risk",
        context: "Report: Tariff Mitigation",
        preparers: ["Michael Torres"],
        dueDate: "12-15-2025",
        status: "incomplete",
      },
    ],
    inboxStats: [
      { label: "My Tasks", value: 4 },
      { label: "My Issues", value: 3 },
      { label: "My Controls", value: 5 },
      { label: "My Narratives", value: 2 },
      { label: "My Risks", value: 6 },
      { label: "My Comments", value: 4 },
    ],
    quickActions: [
      { label: "Create new Risk Event", id: "risk-event" },
      { label: "Start new Risk Assessment", id: "risk-assessment" },
      { label: "Review Risk Register", id: "risk-register" },
    ],
    tabContent: {
      tasks: [
        { id: "risk-1", title: "Assess Supply Chain Tariff Exposure", context: "Risk Assessment: Tariff Mitigation", preparers: ["Sarah Chen", "Michael Torres"], dueDate: "10-31-2025", status: "incomplete" },
        { id: "risk-2", title: "Update Vendor Cost Impact Analysis", context: "Analysis: Tariff Mitigation", preparers: ["James Wilson"], dueDate: "11-15-2025", status: "incomplete" },
        { id: "risk-3", title: "Review Alternative Sourcing Options", context: "Strategy: Tariff Mitigation", preparers: ["Sarah Chen", "Amanda Liu"], dueDate: "11-30-2025", status: "incomplete" },
        { id: "risk-4", title: "Board Presentation on Tariff Risk", context: "Report: Tariff Mitigation", preparers: ["Michael Torres"], dueDate: "12-15-2025", status: "incomplete" },
      ],
      issues: [
        { id: "ri-1", title: "Tariff Classification Discrepancy on Raw Materials", severity: "high", source: "Customs Audit Q3", assignee: "Sarah Chen", dateReported: "09-15-2025", status: "investigating" },
        { id: "ri-2", title: "Incomplete Country-of-Origin Documentation", severity: "medium", source: "Vendor Review", assignee: "Michael Torres", dateReported: "09-22-2025", status: "open" },
        { id: "ri-3", title: "FX Hedge Ratio Below Policy Threshold", severity: "high", source: "Treasury Report", assignee: "James Wilson", dateReported: "10-01-2025", status: "open" },
      ],
      controls: [
        { id: "rc-1", controlId: "ERM-C001", title: "Risk Appetite Statement Annual Review", framework: "COSO ERM", owner: "Sarah Chen", testDate: "09-30-2025", effectiveness: "effective" },
        { id: "rc-2", controlId: "ERM-C002", title: "KRI Threshold Monitoring & Escalation", framework: "COSO ERM", owner: "Michael Torres", testDate: "10-15-2025", effectiveness: "effective" },
        { id: "rc-3", controlId: "ERM-C003", title: "Risk Register Quarterly Refresh", framework: "ISO 31000", owner: "Amanda Liu", testDate: "10-20-2025", effectiveness: "needs-testing" },
        { id: "rc-4", controlId: "ERM-C004", title: "Board Risk Committee Reporting", framework: "COSO ERM", owner: "James Wilson", testDate: "11-01-2025", effectiveness: "effective" },
        { id: "rc-5", controlId: "ERM-C005", title: "Emerging Risk Identification Process", framework: "ISO 31000", owner: "Sarah Chen", testDate: "11-10-2025", effectiveness: "needs-testing" },
      ],
      narratives: [
        { id: "rn-1", title: "Enterprise Risk Appetite Framework Narrative", process: "Annual Risk Governance", author: "Sarah Chen", lastUpdated: "10-05-2025", status: "approved" },
        { id: "rn-2", title: "Tariff Impact Scenario Analysis Methodology", process: "Trade Risk Assessment", author: "Michael Torres", lastUpdated: "10-18-2025", status: "in-review" },
      ],
      risks: [
        { id: "rr-1", title: "Global Supply Chain Tariff Disruption", riskCategory: "Strategic", likelihood: "high", impact: "high", owner: "Sarah Chen", mitigationStatus: "in-progress" },
        { id: "rr-2", title: "FX Volatility on Emerging Market Exposure", riskCategory: "Financial", likelihood: "medium", impact: "high", owner: "James Wilson", mitigationStatus: "in-progress" },
        { id: "rr-3", title: "Key Supplier Single-Source Dependency", riskCategory: "Operational", likelihood: "high", impact: "medium", owner: "Amanda Liu", mitigationStatus: "not-started" },
        { id: "rr-4", title: "Regulatory Change in Cross-Border Trade", riskCategory: "Compliance", likelihood: "medium", impact: "medium", owner: "Michael Torres", mitigationStatus: "mitigated" },
        { id: "rr-5", title: "Geopolitical Instability in APAC Region", riskCategory: "Strategic", likelihood: "medium", impact: "high", owner: "Sarah Chen", mitigationStatus: "in-progress" },
        { id: "rr-6", title: "Commodity Price Inflation Exceeding Budget", riskCategory: "Financial", likelihood: "high", impact: "medium", owner: "James Wilson", mitigationStatus: "not-started" },
      ],
      comments: [
        { id: "rco-1", title: "Re: Tariff Exposure Assessment Methodology", context: "Risk Assessment: Tariff Mitigation", author: "Amanda Liu", date: "10-20-2025", threadCount: 5, status: "new" },
        { id: "rco-2", title: "Vendor Cost Impact Data Discrepancy", context: "Analysis: Tariff Mitigation", author: "James Wilson", date: "10-18-2025", threadCount: 3, status: "new" },
        { id: "rco-3", title: "Board Presentation Feedback - Risk Section", context: "Report: Tariff Mitigation", author: "Michael Torres", date: "10-15-2025", threadCount: 8, status: "read" },
        { id: "rco-4", title: "Alternative Sourcing RFP Evaluation Criteria", context: "Strategy: Tariff Mitigation", author: "Sarah Chen", date: "10-12-2025", threadCount: 2, status: "flagged" },
      ],
    },
  },
  "enterprise-audit": {
    scenarioPlanning: {
      title: "Vertical Farming M&A",
      progress: "3/8 Completed",
      completed: 3,
      total: 8,
    },
    tasks: [
      { id: "audit-1", title: "Update Inventory Structure & Coverage Mapping", context: "Inventory: M&A Vertical Farming", preparers: ["Steven Yeun", "Michelle Tu"], dueDate: "10-31-2025", status: "complete" },
      { id: "audit-2", title: "Review Organizational Impact Assessment", context: "Overview: M&A Integration", preparers: ["Steven Yeun", "Michelle Tu"], dueDate: "10-31-2025", status: "complete" },
      { id: "audit-3", title: "Evaluate Target Company Financial Controls", context: "Due Diligence: Vertical Farming Co.", preparers: ["Michelle Tu", "Alex Park"], dueDate: "11-05-2025", status: "in-progress" },
      { id: "audit-4", title: "Review M&A Impact Scenario Analysis", context: "Scenario: Climate Risk Mitigation", preparers: ["Steven Yeun"], dueDate: "11-10-2025", status: "in-progress" },
      { id: "audit-5", title: "Assess Supply Chain Integration Risks", context: "Risk Assessment: M&A", preparers: ["Alex Park", "Jennifer Liu"], dueDate: "11-15-2025", status: "incomplete" },
      { id: "audit-6", title: "Validate Environmental Compliance Documentation", context: "Compliance: ESG Due Diligence", preparers: ["Michelle Tu"], dueDate: "11-20-2025", status: "incomplete" },
      { id: "audit-7", title: "Update Audit Committee Presentation", context: "Report: M&A Oversight", preparers: ["Steven Yeun", "Michelle Tu"], dueDate: "11-30-2025", status: "incomplete" },
      { id: "audit-8", title: "Finalize Post-Acquisition Integration Audit Plan", context: "Planning: Post-Close Audit", preparers: ["Jennifer Liu"], dueDate: "12-05-2025", status: "complete" },
    ],
    inboxStats: [
      { label: "My Tasks", value: 8 },
      { label: "My Issues", value: 3 },
      { label: "My Controls", value: 5 },
      { label: "My Narratives", value: 2 },
      { label: "My Risks", value: 1 },
      { label: "My Comments", value: 4 },
    ],
    quickActions: [
      { label: "Create new Audit", id: "new-audit" },
      { label: "Start new Workpaper", id: "new-workpaper" },
      { label: "Log Audit Finding", id: "new-finding" },
    ],
    tabContent: {
      tasks: [
        { id: "audit-1", title: "Update Inventory Structure & Coverage Mapping", context: "Inventory: M&A Vertical Farming", preparers: ["Steven Yeun", "Michelle Tu"], dueDate: "10-31-2025", status: "complete" },
        { id: "audit-2", title: "Review Organizational Impact Assessment", context: "Overview: M&A Integration", preparers: ["Steven Yeun", "Michelle Tu"], dueDate: "10-31-2025", status: "complete" },
        { id: "audit-3", title: "Evaluate Target Company Financial Controls", context: "Due Diligence: Vertical Farming Co.", preparers: ["Michelle Tu", "Alex Park"], dueDate: "11-05-2025", status: "in-progress" },
        { id: "audit-4", title: "Review M&A Impact Scenario Analysis", context: "Scenario: Climate Risk Mitigation", preparers: ["Steven Yeun"], dueDate: "11-10-2025", status: "in-progress" },
        { id: "audit-5", title: "Assess Supply Chain Integration Risks", context: "Risk Assessment: M&A", preparers: ["Alex Park", "Jennifer Liu"], dueDate: "11-15-2025", status: "incomplete" },
        { id: "audit-6", title: "Validate Environmental Compliance Documentation", context: "Compliance: ESG Due Diligence", preparers: ["Michelle Tu"], dueDate: "11-20-2025", status: "incomplete" },
        { id: "audit-7", title: "Update Audit Committee Presentation", context: "Report: M&A Oversight", preparers: ["Steven Yeun", "Michelle Tu"], dueDate: "11-30-2025", status: "incomplete" },
        { id: "audit-8", title: "Finalize Post-Acquisition Integration Audit Plan", context: "Planning: Post-Close Audit", preparers: ["Jennifer Liu"], dueDate: "12-05-2025", status: "complete" },
      ],
      issues: [
        { id: "ai-1", title: "Unreconciled Intercompany Balances Post-Acquisition", severity: "high", source: "Financial Audit", assignee: "Michelle Tu", dateReported: "10-01-2025", status: "investigating" },
        { id: "ai-2", title: "Missing SOD Controls in Target Company ERP", severity: "critical", source: "IT Audit", assignee: "Alex Park", dateReported: "10-08-2025", status: "open" },
        { id: "ai-3", title: "Incomplete Fixed Asset Transfer Documentation", severity: "medium", source: "M&A Due Diligence", assignee: "Steven Yeun", dateReported: "10-12-2025", status: "investigating" },
      ],
      controls: [
        { id: "ac-1", controlId: "SOX-101", title: "Revenue Recognition Cutoff Procedures", framework: "SOX 404", owner: "Michelle Tu", testDate: "09-28-2025", effectiveness: "effective" },
        { id: "ac-2", controlId: "SOX-205", title: "Journal Entry Review & Approval", framework: "SOX 404", owner: "Steven Yeun", testDate: "10-05-2025", effectiveness: "effective" },
        { id: "ac-3", controlId: "ITGC-301", title: "User Access Provisioning & Deprovisioning", framework: "COBIT", owner: "Alex Park", testDate: "10-12-2025", effectiveness: "ineffective" },
        { id: "ac-4", controlId: "SOX-402", title: "Financial Close Reconciliation", framework: "SOX 404", owner: "Jennifer Liu", testDate: "10-20-2025", effectiveness: "effective" },
        { id: "ac-5", controlId: "ITGC-105", title: "Change Management Approval Workflow", framework: "COBIT", owner: "Alex Park", testDate: "10-25-2025", effectiveness: "needs-testing" },
      ],
      narratives: [
        { id: "an-1", title: "Procure-to-Pay Process Narrative", process: "Financial Controls", author: "Michelle Tu", lastUpdated: "10-10-2025", status: "approved" },
        { id: "an-2", title: "M&A Integration Audit Scope Narrative", process: "Acquisition Audit", author: "Steven Yeun", lastUpdated: "10-22-2025", status: "draft" },
      ],
      risks: [
        { id: "ar-1", title: "Post-Acquisition Integration Control Gaps", riskCategory: "Operational", likelihood: "high", impact: "high", owner: "Steven Yeun", mitigationStatus: "in-progress" },
      ],
      comments: [
        { id: "aco-1", title: "Re: Vertical Farming Co. Financial Controls", context: "Due Diligence: Vertical Farming Co.", author: "Alex Park", date: "10-25-2025", threadCount: 6, status: "new" },
        { id: "aco-2", title: "Workpaper Review Comments - IT Audit", context: "Inventory: M&A Vertical Farming", author: "Jennifer Liu", date: "10-22-2025", threadCount: 4, status: "new" },
        { id: "aco-3", title: "Exit Meeting Follow-up Items", context: "Overview: M&A Integration", author: "Michelle Tu", date: "10-18-2025", threadCount: 2, status: "read" },
        { id: "aco-4", title: "Audit Committee Pre-Read Feedback", context: "Report: M&A Oversight", author: "Steven Yeun", date: "10-15-2025", threadCount: 7, status: "flagged" },
      ],
    },
  },
  "it-security": {
    scenarioPlanning: {
      title: "Zero Day Event for Apache Log4j (CVE-2021-44228)",
      progress: "4/12 Completed",
      completed: 4,
      total: 12,
    },
    tasks: [
      { id: "sec-1", title: "Identify All Log4j Instances Across Environment", context: "Discovery: Log4j CVE-2021-44228", preparers: ["David Kim", "Rachel Green"], dueDate: "10-25-2025", status: "complete" },
      { id: "sec-2", title: "Complete Log4j Vulnerability Assessment", context: "Assessment: Critical Severity", preparers: ["David Kim"], dueDate: "10-31-2025", status: "complete" },
      { id: "sec-3", title: "Patch Critical Production Systems for Log4j", context: "Remediation: Production", preparers: ["Tom Anderson", "David Kim"], dueDate: "11-01-2025", status: "in-progress" },
      { id: "sec-4", title: "Deploy WAF Rules to Block Exploitation Attempts", context: "Mitigation: Network Defense", preparers: ["Rachel Green"], dueDate: "11-05-2025", status: "in-progress" },
      { id: "sec-5", title: "Scan Third-Party Applications for Log4j", context: "Vendor Risk: Log4j Exposure", preparers: ["Sarah Lin", "Tom Anderson"], dueDate: "11-10-2025", status: "complete" },
      { id: "sec-6", title: "Update Incident Response Playbook for Log4j", context: "IR: Zero Day Response", preparers: ["Rachel Green", "James Wu"], dueDate: "11-15-2025", status: "incomplete" },
      { id: "sec-7", title: "Conduct Forensic Analysis on Affected Systems", context: "Investigation: Compromise Detection", preparers: ["David Kim", "Sarah Lin"], dueDate: "11-20-2025", status: "incomplete" },
      { id: "sec-8", title: "Notify Affected Business Units & Stakeholders", context: "Communication: Internal", preparers: ["James Wu"], dueDate: "11-25-2025", status: "incomplete" },
      { id: "sec-9", title: "Validate Patching Completion Across All Environments", context: "Verification: Remediation", preparers: ["Tom Anderson", "David Kim"], dueDate: "11-30-2025", status: "incomplete" },
      { id: "sec-10", title: "Conduct Post-Incident Penetration Test", context: "Validation: Security Posture", preparers: ["Rachel Green"], dueDate: "12-05-2025", status: "incomplete" },
      { id: "sec-11", title: "Executive Briefing on Log4j Impact & Response", context: "Report: Board Communication", preparers: ["David Kim", "Sarah Lin"], dueDate: "12-10-2025", status: "complete" },
      { id: "sec-12", title: "Document Lessons Learned & Update Security Procedures", context: "Post-Mortem: Process Improvement", preparers: ["Sarah Lin", "Tom Anderson"], dueDate: "12-15-2025", status: "in-progress" },
    ],
    inboxStats: [
      { label: "My Tasks", value: 12 },
      { label: "My Issues", value: 7 },
      { label: "My Controls", value: 15 },
      { label: "My Narratives", value: 3 },
      { label: "My Risks", value: 8 },
      { label: "My Comments", value: 11 },
    ],
    quickActions: [
      { label: "Report Security Incident", id: "new-incident" },
      { label: "Log Vulnerability", id: "new-vulnerability" },
      { label: "Create Compliance Gap", id: "new-gap" },
    ],
    tabContent: {
      tasks: [
        { id: "sec-1", title: "Identify All Log4j Instances Across Environment", context: "Discovery: Log4j CVE-2021-44228", preparers: ["David Kim", "Rachel Green"], dueDate: "10-25-2025", status: "complete" },
        { id: "sec-2", title: "Complete Log4j Vulnerability Assessment", context: "Assessment: Critical Severity", preparers: ["David Kim"], dueDate: "10-31-2025", status: "complete" },
        { id: "sec-3", title: "Patch Critical Production Systems for Log4j", context: "Remediation: Production", preparers: ["Tom Anderson", "David Kim"], dueDate: "11-01-2025", status: "in-progress" },
        { id: "sec-4", title: "Deploy WAF Rules to Block Exploitation Attempts", context: "Mitigation: Network Defense", preparers: ["Rachel Green"], dueDate: "11-05-2025", status: "in-progress" },
        { id: "sec-5", title: "Scan Third-Party Applications for Log4j", context: "Vendor Risk: Log4j Exposure", preparers: ["Sarah Lin", "Tom Anderson"], dueDate: "11-10-2025", status: "complete" },
        { id: "sec-6", title: "Update Incident Response Playbook for Log4j", context: "IR: Zero Day Response", preparers: ["Rachel Green", "James Wu"], dueDate: "11-15-2025", status: "incomplete" },
        { id: "sec-7", title: "Conduct Forensic Analysis on Affected Systems", context: "Investigation: Compromise Detection", preparers: ["David Kim", "Sarah Lin"], dueDate: "11-20-2025", status: "incomplete" },
        { id: "sec-8", title: "Notify Affected Business Units & Stakeholders", context: "Communication: Internal", preparers: ["James Wu"], dueDate: "11-25-2025", status: "incomplete" },
        { id: "sec-9", title: "Validate Patching Completion Across All Environments", context: "Verification: Remediation", preparers: ["Tom Anderson", "David Kim"], dueDate: "11-30-2025", status: "incomplete" },
        { id: "sec-10", title: "Conduct Post-Incident Penetration Test", context: "Validation: Security Posture", preparers: ["Rachel Green"], dueDate: "12-05-2025", status: "incomplete" },
        { id: "sec-11", title: "Executive Briefing on Log4j Impact & Response", context: "Report: Board Communication", preparers: ["David Kim", "Sarah Lin"], dueDate: "12-10-2025", status: "complete" },
        { id: "sec-12", title: "Document Lessons Learned & Update Security Procedures", context: "Post-Mortem: Process Improvement", preparers: ["Sarah Lin", "Tom Anderson"], dueDate: "12-15-2025", status: "in-progress" },
      ],
      issues: [
        { id: "si-1", title: "Active Log4j Exploitation Attempt Detected", severity: "critical", source: "SIEM Alert", assignee: "David Kim", dateReported: "10-01-2025", status: "investigating" },
        { id: "si-2", title: "Unpatched Exchange Server Exposed to Internet", severity: "critical", source: "Vulnerability Scan", assignee: "Tom Anderson", dateReported: "10-03-2025", status: "open" },
        { id: "si-3", title: "Privileged Account Password Not Rotated (90+ days)", severity: "high", source: "PAM Audit", assignee: "Rachel Green", dateReported: "10-05-2025", status: "investigating" },
        { id: "si-4", title: "Third-Party VPN Concentrator EOL Firmware", severity: "high", source: "Asset Inventory", assignee: "Tom Anderson", dateReported: "10-08-2025", status: "open" },
        { id: "si-5", title: "Suspicious Outbound DNS Queries to Known C2", severity: "critical", source: "Threat Intel", assignee: "David Kim", dateReported: "10-10-2025", status: "investigating" },
        { id: "si-6", title: "MFA Bypass Vulnerability in Legacy SSO Portal", severity: "high", source: "Penetration Test", assignee: "Sarah Lin", dateReported: "10-12-2025", status: "open" },
        { id: "si-7", title: "Unauthorized Cloud Storage Bucket Publicly Accessible", severity: "medium", source: "Cloud Security Posture", assignee: "James Wu", dateReported: "10-15-2025", status: "resolved" },
      ],
      controls: [
        { id: "sc-1", controlId: "SEC-001", title: "Firewall Rule Review & Optimization", framework: "NIST CSF", owner: "Tom Anderson", testDate: "09-15-2025", effectiveness: "effective" },
        { id: "sc-2", controlId: "SEC-002", title: "Endpoint Detection & Response Coverage", framework: "NIST CSF", owner: "David Kim", testDate: "09-20-2025", effectiveness: "effective" },
        { id: "sc-3", controlId: "SEC-003", title: "Privileged Access Management Controls", framework: "CIS Controls", owner: "Rachel Green", testDate: "09-25-2025", effectiveness: "ineffective" },
        { id: "sc-4", controlId: "SEC-004", title: "Network Segmentation Validation", framework: "NIST CSF", owner: "Tom Anderson", testDate: "09-30-2025", effectiveness: "effective" },
        { id: "sc-5", controlId: "SEC-005", title: "Security Awareness Training Completion", framework: "ISO 27001", owner: "Sarah Lin", testDate: "10-01-2025", effectiveness: "effective" },
        { id: "sc-6", controlId: "SEC-006", title: "Vulnerability Scanning & Remediation SLA", framework: "CIS Controls", owner: "David Kim", testDate: "10-05-2025", effectiveness: "needs-testing" },
        { id: "sc-7", controlId: "SEC-007", title: "Data Loss Prevention Policy Enforcement", framework: "ISO 27001", owner: "Rachel Green", testDate: "10-08-2025", effectiveness: "effective" },
        { id: "sc-8", controlId: "SEC-008", title: "Incident Response Plan Testing", framework: "NIST CSF", owner: "James Wu", testDate: "10-10-2025", effectiveness: "needs-testing" },
        { id: "sc-9", controlId: "SEC-009", title: "Multi-Factor Authentication Enforcement", framework: "CIS Controls", owner: "Sarah Lin", testDate: "10-12-2025", effectiveness: "effective" },
        { id: "sc-10", controlId: "SEC-010", title: "Cloud Security Configuration Baseline", framework: "CIS Controls", owner: "Tom Anderson", testDate: "10-15-2025", effectiveness: "ineffective" },
        { id: "sc-11", controlId: "SEC-011", title: "Log Aggregation & SIEM Correlation Rules", framework: "NIST CSF", owner: "David Kim", testDate: "10-18-2025", effectiveness: "effective" },
        { id: "sc-12", controlId: "SEC-012", title: "Backup & Recovery Validation", framework: "ISO 27001", owner: "Tom Anderson", testDate: "10-20-2025", effectiveness: "effective" },
        { id: "sc-13", controlId: "SEC-013", title: "Third-Party Security Assessment Process", framework: "ISO 27001", owner: "Sarah Lin", testDate: "10-22-2025", effectiveness: "needs-testing" },
        { id: "sc-14", controlId: "SEC-014", title: "Encryption at Rest & In Transit Standards", framework: "NIST CSF", owner: "Rachel Green", testDate: "10-25-2025", effectiveness: "effective" },
        { id: "sc-15", controlId: "SEC-015", title: "Security Patch Management SLA Compliance", framework: "CIS Controls", owner: "David Kim", testDate: "10-28-2025", effectiveness: "ineffective" },
      ],
      narratives: [
        { id: "sn-1", title: "Incident Response & Escalation Process", process: "Security Operations", author: "Rachel Green", lastUpdated: "10-05-2025", status: "approved" },
        { id: "sn-2", title: "Vulnerability Management Lifecycle", process: "Threat & Vulnerability Mgmt", author: "David Kim", lastUpdated: "10-18-2025", status: "in-review" },
        { id: "sn-3", title: "Zero Day Response Playbook Narrative", process: "Incident Response", author: "James Wu", lastUpdated: "10-25-2025", status: "draft" },
      ],
      risks: [
        { id: "sr-1", title: "Log4j Remote Code Execution in Production", riskCategory: "Cyber", likelihood: "high", impact: "high", owner: "David Kim", mitigationStatus: "in-progress" },
        { id: "sr-2", title: "Ransomware Attack on Critical Infrastructure", riskCategory: "Cyber", likelihood: "medium", impact: "high", owner: "Rachel Green", mitigationStatus: "in-progress" },
        { id: "sr-3", title: "Insider Threat from Privileged Users", riskCategory: "Operational", likelihood: "medium", impact: "high", owner: "Sarah Lin", mitigationStatus: "not-started" },
        { id: "sr-4", title: "Cloud Misconfiguration Data Exposure", riskCategory: "Cyber", likelihood: "high", impact: "medium", owner: "Tom Anderson", mitigationStatus: "in-progress" },
        { id: "sr-5", title: "Supply Chain Software Compromise", riskCategory: "Cyber", likelihood: "medium", impact: "high", owner: "David Kim", mitigationStatus: "not-started" },
        { id: "sr-6", title: "Regulatory Non-Compliance (GDPR/CCPA)", riskCategory: "Compliance", likelihood: "low", impact: "high", owner: "James Wu", mitigationStatus: "mitigated" },
        { id: "sr-7", title: "Legacy System End-of-Life Security Gaps", riskCategory: "Operational", likelihood: "high", impact: "medium", owner: "Tom Anderson", mitigationStatus: "in-progress" },
        { id: "sr-8", title: "Phishing Campaign Targeting Executive Team", riskCategory: "Cyber", likelihood: "medium", impact: "medium", owner: "Sarah Lin", mitigationStatus: "mitigated" },
      ],
      comments: [
        { id: "sco-1", title: "Re: Log4j Patch Deployment Schedule", context: "Remediation: Production", author: "Tom Anderson", date: "10-28-2025", threadCount: 12, status: "new" },
        { id: "sco-2", title: "WAF Rule False Positive Analysis", context: "Mitigation: Network Defense", author: "Rachel Green", date: "10-26-2025", threadCount: 5, status: "new" },
        { id: "sco-3", title: "Third-Party App Scan Results Discussion", context: "Vendor Risk: Log4j Exposure", author: "Sarah Lin", date: "10-24-2025", threadCount: 8, status: "new" },
        { id: "sco-4", title: "IR Playbook Updates - Legal Review", context: "IR: Zero Day Response", author: "James Wu", date: "10-22-2025", threadCount: 3, status: "flagged" },
        { id: "sco-5", title: "Forensic Analysis Preliminary Findings", context: "Investigation: Compromise Detection", author: "David Kim", date: "10-20-2025", threadCount: 15, status: "new" },
        { id: "sco-6", title: "Stakeholder Communication Draft Review", context: "Communication: Internal", author: "James Wu", date: "10-18-2025", threadCount: 6, status: "read" },
        { id: "sco-7", title: "Pen Test Scope & Rules of Engagement", context: "Validation: Security Posture", author: "Rachel Green", date: "10-16-2025", threadCount: 4, status: "new" },
        { id: "sco-8", title: "Executive Briefing Deck Feedback", context: "Report: Board Communication", author: "Sarah Lin", date: "10-14-2025", threadCount: 9, status: "read" },
        { id: "sco-9", title: "Lessons Learned Template Suggestions", context: "Post-Mortem: Process Improvement", author: "Tom Anderson", date: "10-12-2025", threadCount: 2, status: "new" },
        { id: "sco-10", title: "Cloud Security Baseline Exceptions", context: "Assessment: Cloud Security", author: "David Kim", date: "10-10-2025", threadCount: 7, status: "flagged" },
        { id: "sco-11", title: "MFA Rollout Timeline Discussion", context: "Remediation: Access Controls", author: "Sarah Lin", date: "10-08-2025", threadCount: 4, status: "read" },
      ],
    },
  },
};

const bucketDisplayNames: Record<string, string> = {
  "controls-management": "Controls Management",
  "enterprise-risk": "Enterprise Risk Management",
  "audit-management": "Audit Management",
  "cyber-compliance": "Cyber and IT Compliance",
  "cyber-it-compliance": "Cyber and IT Compliance",
  "information-technology": "Information Technology",
  "regulatory-compliance": "Regulatory Compliance",
  "third-party": "Third Party Risk",
  "ai-governance": "AI Governance",
  "environmental-compliance": "Environmental Compliance",
};

const capabilityTaskPool: Record<string, string[]> = {
  "controls-management": [
    "Review SOX Control Documentation for Q4",
    "Complete Control Testing Cycle for Key Processes",
    "Remediate Open Control Gaps from Last Assessment",
    "Update Control Owner Attestation Records",
    "Validate Automated Monitoring Alert Thresholds",
    "Map Controls to Updated Regulatory Framework",
    "Gather Evidence for Annual Control Certification",
    "Analyze Control Effectiveness Trend Data",
    "Prepare Control Environment Board Summary",
    "Reconcile Control Library Against Process Changes",
  ],
  "enterprise-risk": [
    "Update Strategic Risk Register with Q4 Findings",
    "Complete Quarterly Enterprise Risk Assessment",
    "Review Risk Appetite Statement with Stakeholders",
    "Investigate KRI Threshold Breach on Credit Exposure",
    "Evaluate Emerging Geopolitical Risk Scenarios",
    "Finalize Risk Treatment Plans for Top 5 Risks",
    "Collect Risk Owner Attestations Across Business Units",
    "Refresh Risk Heat Map for Executive Committee",
    "Assess Concentration Risk in Key Supply Chains",
    "Prepare Board-Level Risk Briefing Materials",
  ],
  "audit-management": [
    "Finalize Q1 Annual Audit Plan for Approval",
    "Complete IT Audit Fieldwork on General Controls",
    "Escalate Overdue Audit Findings Past Remediation Date",
    "Draft Exit Meeting Summary for Operational Audit",
    "Optimize Auditor Resource Allocation for Next Quarter",
    "Upload Workpapers for Current Engagement",
    "Refresh Audit Universe Entity Risk Ratings",
    "Review Audit Committee Presentation Materials",
    "Track Corrective Action Plan Implementation Status",
    "Validate Sampling Methodology for Financial Audit",
  ],
  "cyber-compliance": [
    "Patch Critical Vulnerabilities from Latest Security Scan",
    "Complete Privileged Access Review Certification Campaign",
    "Investigate Root Cause of Recent Phishing Incident",
    "Update Ransomware Incident Response Playbook",
    "Validate ITGC Test Results for SOC 2 Readiness",
    "Review Application Control Configuration in ERP",
    "Conduct Penetration Test on External-Facing Systems",
    "Assess Third-Party Application Security Posture",
    "Generate Monthly Vulnerability Trend Analysis Report",
    "Revise Data Loss Prevention Policy and Procedures",
  ],
  "information-technology": [
    "Reconcile Physical Assets Against CMDB Records",
    "Update Application Portfolio Criticality Ratings",
    "Approve Emergency Change Requests in Queue",
    "Prepare Agenda for Weekly Change Advisory Board",
    "Review Disaster Recovery Test Results and Gaps",
    "Assess Cloud Service Provider SLA Compliance",
    "Update System Inventory with New Deployments",
    "Validate Backup and Restoration Procedures",
    "Review IT Service Desk Ticket Escalation Trends",
    "Conduct Capacity Planning Review for Core Systems",
  ],
  "regulatory-compliance": [
    "Assess Impact of New SEC Climate Disclosure Rules",
    "Prepare Quarterly Regulatory Filing Documents",
    "Update SOX Process Narratives for Key Workflows",
    "Review Materials for CFO/CEO Section 302 Certification",
    "Track Regulatory Obligation Deadlines This Month",
    "Analyze Cross-Border Data Privacy Requirements",
    "Conduct Gap Analysis Against Updated GDPR Guidance",
    "Compile Regulatory Change Impact Assessment Report",
    "Verify Compliance Training Completion Rates",
    "Review Anti-Money Laundering Program Effectiveness",
  ],
  "third-party": [
    "Complete Due Diligence for New Cloud Provider Vendor",
    "Process Pending Vendor Intake and Onboarding Requests",
    "Conduct Annual Reassessment of Tier 1 Payment Processor",
    "Validate Security Questionnaire Responses from Vendors",
    "Update Vendor Risk Tiering Based on Latest Assessments",
    "Review Vendor Contract Renewal Terms and SLAs",
    "Monitor Fourth-Party Concentration Risk Exposure",
    "Escalate Vendor Non-Compliance Findings to Procurement",
    "Refresh Vendor Inventory Contact and Contract Data",
    "Assess Business Continuity Plans for Critical Vendors",
  ],
  "ai-governance": [
    "Document New ML Models Deployed This Quarter",
    "Complete Risk Assessment for Credit Scoring AI Model",
    "Review Fairness and Bias Metrics for HR Screening Model",
    "Execute Quarterly Validation for Fraud Detection System",
    "Update Responsible AI Use Policy Documentation",
    "Assess Explainability Requirements for Customer-Facing AI",
    "Review Model Drift Monitoring Dashboard Alerts",
    "Conduct Data Quality Audit for Training Pipelines",
    "Prepare AI Governance Board Briefing Materials",
    "Evaluate Regulatory Compliance of Generative AI Tools",
  ],
  "environmental-compliance": [
    "Gather Q4 Sustainability Metrics from All Facilities",
    "Calculate and Verify Scope 1 and 2 Emissions Data",
    "Distribute Scope 3 Emissions Survey to Key Suppliers",
    "Compile Quarterly Progress Report Toward Net Zero Targets",
    "Review CSRD Reporting Requirements and Readiness",
    "Validate Water Usage and Waste Diversion Data",
    "Assess Climate Risk Scenarios for Physical Assets",
    "Update Environmental Permit Compliance Status",
    "Prepare ESG Disclosure Materials for Annual Report",
    "Benchmark Carbon Intensity Against Industry Peers",
  ],
};

const bucketIdAliases: Record<string, string> = {
  "cyber-it-compliance": "cyber-compliance",
};

const capabilityQuickActions: Record<string, { label: string; id: string }[]> = {
  "controls-management": [{ label: "Create Control", id: "new-control" }, { label: "Start Testing", id: "new-test" }],
  "enterprise-risk": [{ label: "Create Risk Event", id: "risk-event" }, { label: "Start Assessment", id: "risk-assessment" }],
  "audit-management": [{ label: "Create Audit", id: "new-audit" }, { label: "Log Finding", id: "new-finding" }],
  "cyber-compliance": [{ label: "Report Incident", id: "new-incident" }, { label: "Log Vulnerability", id: "new-vuln" }],
  "information-technology": [{ label: "Create IT Request", id: "it-request" }, { label: "Log Issue", id: "it-issue" }],
  "regulatory-compliance": [{ label: "Create Filing", id: "new-filing" }, { label: "Log Gap", id: "new-gap" }],
  "third-party": [{ label: "Add Vendor", id: "new-vendor" }, { label: "Start Review", id: "vendor-review" }],
  "ai-governance": [{ label: "Log AI Model", id: "new-model" }, { label: "Start AI Review", id: "ai-review" }],
  "environmental-compliance": [{ label: "Log Emission", id: "new-emission" }, { label: "ESG Report", id: "esg-report" }],
};

const capabilityIssuePool: Record<string, Issue[]> = {
  "controls-management": [
    { id: "ci-1", title: "Control Design Gap in Procure-to-Pay", severity: "high", source: "Control Assessment", assignee: "Control Team", dateReported: "10-01-2025", status: "open" },
    { id: "ci-2", title: "Incomplete Evidence for Key Control SOX-204", severity: "medium", source: "Testing Cycle", assignee: "Sarah Chen", dateReported: "10-05-2025", status: "investigating" },
  ],
  "enterprise-risk": [
    { id: "ei-1", title: "Risk Appetite Breach on Credit Concentration", severity: "high", source: "KRI Dashboard", assignee: "Risk Manager", dateReported: "10-02-2025", status: "investigating" },
    { id: "ei-2", title: "Incomplete Risk Owner Attestation for Q3", severity: "medium", source: "Attestation Review", assignee: "Risk Analyst", dateReported: "10-08-2025", status: "open" },
  ],
  "audit-management": [
    { id: "ami-1", title: "Overdue Finding Remediation Past SLA", severity: "high", source: "Finding Tracker", assignee: "Audit Lead", dateReported: "10-03-2025", status: "open" },
    { id: "ami-2", title: "Sampling Error in Financial Audit Workpaper", severity: "high", source: "QA Review", assignee: "Michelle Tu", dateReported: "10-14-2025", status: "investigating" },
  ],
  "cyber-compliance": [
    { id: "cci-1", title: "Critical Vulnerability Unpatched Beyond SLA", severity: "critical", source: "Vuln Scanner", assignee: "Security Ops", dateReported: "10-01-2025", status: "open" },
    { id: "cci-2", title: "Phishing Incident Investigation Pending", severity: "high", source: "SIEM", assignee: "IR Team", dateReported: "10-06-2025", status: "investigating" },
  ],
  "information-technology": [
    { id: "iti-1", title: "CMDB Record Mismatch with Production Assets", severity: "medium", source: "Asset Audit", assignee: "IT Admin", dateReported: "10-04-2025", status: "open" },
    { id: "iti-2", title: "Unauthorized Change Deployed to Production", severity: "high", source: "Change Mgmt", assignee: "Release Mgr", dateReported: "10-09-2025", status: "investigating" },
  ],
  "regulatory-compliance": [
    { id: "rci-1", title: "Filing Deadline at Risk for SEC Submission", severity: "high", source: "Obligation Tracker", assignee: "Compliance Lead", dateReported: "10-02-2025", status: "open" },
    { id: "rci-2", title: "GDPR Data Subject Request Overdue", severity: "critical", source: "Privacy Office", assignee: "Privacy Analyst", dateReported: "10-07-2025", status: "investigating" },
  ],
  "third-party": [
    { id: "tpi-1", title: "Critical Vendor Failed Security Assessment", severity: "high", source: "Vendor Review", assignee: "Vendor Manager", dateReported: "10-03-2025", status: "open" },
    { id: "tpi-2", title: "Fourth-Party Concentration Risk Identified", severity: "medium", source: "Risk Analysis", assignee: "Procurement", dateReported: "10-08-2025", status: "investigating" },
  ],
  "ai-governance": [
    { id: "agi-1", title: "Bias Detected in Credit Scoring Model Output", severity: "critical", source: "Model Monitoring", assignee: "AI Ethics Lead", dateReported: "10-05-2025", status: "investigating" },
    { id: "agi-2", title: "AI Model Deployed Without Governance Approval", severity: "high", source: "Deployment Audit", assignee: "AI Governance", dateReported: "10-10-2025", status: "open" },
  ],
  "environmental-compliance": [
    { id: "eci-1", title: "Scope 3 Supplier Data Missing for Q3", severity: "medium", source: "Supplier Survey", assignee: "ESG Analyst", dateReported: "10-06-2025", status: "open" },
    { id: "eci-2", title: "Environmental Permit Renewal Overdue", severity: "high", source: "Permit Tracker", assignee: "Compliance Mgr", dateReported: "10-11-2025", status: "investigating" },
  ],
};

const capabilityControlPool: Record<string, Control[]> = {
  "controls-management": [
    { id: "cc-1", controlId: "SOX-101", title: "Revenue Recognition Cutoff", framework: "SOX 404", owner: "Control Lead", testDate: "10-01-2025", effectiveness: "effective" },
    { id: "cc-2", controlId: "SOX-205", title: "Journal Entry Approval", framework: "SOX 404", owner: "Finance", testDate: "10-10-2025", effectiveness: "effective" },
    { id: "cc-3", controlId: "SOX-310", title: "Bank Reconciliation Review", framework: "SOX 404", owner: "Treasury", testDate: "10-15-2025", effectiveness: "needs-testing" },
  ],
  "enterprise-risk": [
    { id: "ec-1", controlId: "ERM-001", title: "Risk Appetite Monitoring", framework: "COSO ERM", owner: "CRO", testDate: "10-01-2025", effectiveness: "effective" },
    { id: "ec-2", controlId: "ERM-002", title: "KRI Dashboard Review", framework: "ISO 31000", owner: "Risk Mgr", testDate: "10-12-2025", effectiveness: "needs-testing" },
  ],
  "audit-management": [
    { id: "amc-1", controlId: "AUD-101", title: "Audit Plan Approval Workflow", framework: "IIA Standards", owner: "CAE", testDate: "10-05-2025", effectiveness: "effective" },
    { id: "amc-2", controlId: "AUD-205", title: "Workpaper QA Review", framework: "IIA Standards", owner: "Audit Lead", testDate: "10-15-2025", effectiveness: "effective" },
  ],
  "cyber-compliance": [
    { id: "ccc-1", controlId: "SEC-001", title: "Firewall Rule Review", framework: "NIST CSF", owner: "Security Ops", testDate: "10-01-2025", effectiveness: "effective" },
    { id: "ccc-2", controlId: "SEC-005", title: "EDR Coverage Validation", framework: "CIS Controls", owner: "SecOps Lead", testDate: "10-10-2025", effectiveness: "effective" },
    { id: "ccc-3", controlId: "SEC-010", title: "Vulnerability SLA Compliance", framework: "NIST CSF", owner: "Vuln Mgmt", testDate: "10-18-2025", effectiveness: "ineffective" },
  ],
  "information-technology": [
    { id: "itc-1", controlId: "ITGC-001", title: "Change Advisory Board Approval", framework: "ITIL", owner: "IT Mgr", testDate: "10-03-2025", effectiveness: "effective" },
    { id: "itc-2", controlId: "ITGC-005", title: "Backup Verification Testing", framework: "ISO 27001", owner: "IT Ops", testDate: "10-12-2025", effectiveness: "needs-testing" },
  ],
  "regulatory-compliance": [
    { id: "rcc-1", controlId: "REG-001", title: "Regulatory Change Impact Assessment", framework: "Compliance", owner: "Compliance Lead", testDate: "10-05-2025", effectiveness: "effective" },
    { id: "rcc-2", controlId: "REG-010", title: "Filing Deadline Tracking", framework: "SEC Rules", owner: "Legal", testDate: "10-15-2025", effectiveness: "effective" },
  ],
  "third-party": [
    { id: "tpc-1", controlId: "VRM-001", title: "Vendor Due Diligence Process", framework: "TPRM", owner: "Vendor Mgr", testDate: "10-02-2025", effectiveness: "effective" },
    { id: "tpc-2", controlId: "VRM-005", title: "Vendor SLA Monitoring", framework: "TPRM", owner: "Procurement", testDate: "10-10-2025", effectiveness: "needs-testing" },
  ],
  "ai-governance": [
    { id: "agc-1", controlId: "AI-001", title: "Model Risk Assessment Approval", framework: "AI RMF", owner: "AI Ethics", testDate: "10-05-2025", effectiveness: "effective" },
    { id: "agc-2", controlId: "AI-005", title: "Bias Monitoring Dashboard Review", framework: "AI RMF", owner: "Data Science", testDate: "10-15-2025", effectiveness: "needs-testing" },
  ],
  "environmental-compliance": [
    { id: "ecc-1", controlId: "ESG-001", title: "Emissions Data Validation", framework: "GRI", owner: "ESG Lead", testDate: "10-01-2025", effectiveness: "effective" },
    { id: "ecc-2", controlId: "ESG-005", title: "Permit Compliance Tracking", framework: "EPA", owner: "EHS Mgr", testDate: "10-12-2025", effectiveness: "effective" },
  ],
};

const capabilityNarrativePool: Record<string, Narrative[]> = {
  "controls-management": [{ id: "cn-1", title: "SOX Control Environment Overview", process: "Financial Controls", author: "Control Lead", lastUpdated: "10-05-2025", status: "approved" }],
  "enterprise-risk": [{ id: "en-1", title: "Enterprise Risk Appetite Framework", process: "Risk Governance", author: "CRO", lastUpdated: "10-08-2025", status: "approved" }],
  "audit-management": [{ id: "amn-1", title: "Audit Methodology & Standards Narrative", process: "Audit Framework", author: "CAE", lastUpdated: "10-10-2025", status: "in-review" }],
  "cyber-compliance": [{ id: "ccn-1", title: "Incident Response Process Narrative", process: "Security Operations", author: "CISO", lastUpdated: "10-12-2025", status: "approved" }],
  "information-technology": [{ id: "itn-1", title: "IT Change Management Process", process: "ITSM", author: "IT Director", lastUpdated: "10-06-2025", status: "in-review" }],
  "regulatory-compliance": [{ id: "rcn-1", title: "Regulatory Obligation Mapping Narrative", process: "Compliance Framework", author: "CCO", lastUpdated: "10-14-2025", status: "draft" }],
  "third-party": [{ id: "tpn-1", title: "Vendor Risk Management Lifecycle", process: "TPRM", author: "Vendor Mgr", lastUpdated: "10-09-2025", status: "approved" }],
  "ai-governance": [{ id: "agn-1", title: "AI Model Governance Process", process: "AI Governance", author: "AI Ethics Lead", lastUpdated: "10-11-2025", status: "draft" }],
  "environmental-compliance": [{ id: "ecn-1", title: "ESG Reporting Methodology", process: "Sustainability", author: "ESG Lead", lastUpdated: "10-07-2025", status: "in-review" }],
};

const capabilityRiskPool: Record<string, Risk[]> = {
  "controls-management": [{ id: "cr-1", title: "Key Control Failure in Financial Reporting", riskCategory: "Financial", likelihood: "medium", impact: "high", owner: "Control Lead", mitigationStatus: "in-progress" }],
  "enterprise-risk": [
    { id: "er-1", title: "Strategic Risk from Market Disruption", riskCategory: "Strategic", likelihood: "high", impact: "high", owner: "CRO", mitigationStatus: "in-progress" },
    { id: "er-2", title: "Operational Resilience Gap", riskCategory: "Operational", likelihood: "medium", impact: "medium", owner: "Risk Mgr", mitigationStatus: "not-started" },
  ],
  "audit-management": [{ id: "amr-1", title: "Audit Coverage Gap in New Business Line", riskCategory: "Operational", likelihood: "medium", impact: "medium", owner: "CAE", mitigationStatus: "in-progress" }],
  "cyber-compliance": [
    { id: "ccr-1", title: "Zero Day Exploitation Risk", riskCategory: "Cyber", likelihood: "high", impact: "high", owner: "CISO", mitigationStatus: "in-progress" },
    { id: "ccr-2", title: "Ransomware Business Continuity Impact", riskCategory: "Cyber", likelihood: "medium", impact: "high", owner: "Security Ops", mitigationStatus: "not-started" },
  ],
  "information-technology": [{ id: "itr-1", title: "Legacy System End-of-Life Risk", riskCategory: "Operational", likelihood: "high", impact: "medium", owner: "IT Director", mitigationStatus: "in-progress" }],
  "regulatory-compliance": [{ id: "rcr-1", title: "Regulatory Non-Compliance Penalty Exposure", riskCategory: "Compliance", likelihood: "low", impact: "high", owner: "CCO", mitigationStatus: "mitigated" }],
  "third-party": [{ id: "tpr-1", title: "Critical Vendor Service Disruption", riskCategory: "Operational", likelihood: "medium", impact: "high", owner: "Vendor Mgr", mitigationStatus: "in-progress" }],
  "ai-governance": [{ id: "agr-1", title: "AI Model Bias Leading to Discrimination", riskCategory: "Compliance", likelihood: "medium", impact: "high", owner: "AI Ethics", mitigationStatus: "in-progress" }],
  "environmental-compliance": [{ id: "ecr-1", title: "Carbon Target Miss Reputational Risk", riskCategory: "Strategic", likelihood: "medium", impact: "medium", owner: "ESG Lead", mitigationStatus: "not-started" }],
};

const capabilityCommentPool: Record<string, TabComment[]> = {
  "controls-management": [{ id: "cco-1", title: "Re: SOX Testing Cycle Updates", context: "Controls: Q4 Review", author: "Control Lead", date: "10-20-2025", threadCount: 4, status: "new" }],
  "enterprise-risk": [{ id: "eco-1", title: "Risk Register Update Discussion", context: "ERM: Quarterly Review", author: "Risk Mgr", date: "10-18-2025", threadCount: 6, status: "new" }],
  "audit-management": [{ id: "amco-1", title: "Audit Finding Remediation Follow-up", context: "Audit: Finding Tracker", author: "Audit Lead", date: "10-22-2025", threadCount: 3, status: "flagged" }],
  "cyber-compliance": [{ id: "ccco-1", title: "Vulnerability Scan Results Discussion", context: "Security: Vuln Mgmt", author: "SecOps Lead", date: "10-19-2025", threadCount: 8, status: "new" }],
  "information-technology": [{ id: "itco-1", title: "Change Advisory Board Notes", context: "IT: CAB Meeting", author: "IT Mgr", date: "10-16-2025", threadCount: 5, status: "read" }],
  "regulatory-compliance": [{ id: "rcco-1", title: "SEC Filing Preparation Comments", context: "Compliance: Q4 Filing", author: "Legal", date: "10-21-2025", threadCount: 3, status: "new" }],
  "third-party": [{ id: "tpco-1", title: "Vendor Assessment Score Discussion", context: "TPRM: Annual Review", author: "Vendor Mgr", date: "10-17-2025", threadCount: 4, status: "new" }],
  "ai-governance": [{ id: "agco-1", title: "AI Model Risk Review Comments", context: "AI: Governance Board", author: "AI Ethics", date: "10-23-2025", threadCount: 7, status: "flagged" }],
  "environmental-compliance": [{ id: "ecco-1", title: "ESG Metrics Data Quality Discussion", context: "ESG: Quarterly Report", author: "ESG Analyst", date: "10-15-2025", threadCount: 2, status: "new" }],
};

function resolveBucketId(id: string): string {
  return bucketIdAliases[id] || id;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const preparerPool = [
  "Sarah Chen", "Michael Torres", "James Wilson", "Amanda Liu",
  "Steven Yeun", "Michelle Tu", "Alex Park", "Jennifer Liu",
  "David Kim", "Rachel Green", "Tom Anderson", "Sarah Lin",
];

const statusOptions: Task["status"][] = ["incomplete", "incomplete", "in-progress", "incomplete", "in-progress"];

function buildTaskFromPool(bucketId: string, titleIndex: number, taskIdCounter: number, seed: number): Task {
  const resolvedId = resolveBucketId(bucketId);
  const pool = capabilityTaskPool[resolvedId] || capabilityTaskPool["controls-management"];
  const title = pool[titleIndex % pool.length];
  const displayName = bucketDisplayNames[resolvedId] || resolvedId;

  const s = (seed * 1664525 + 1013904223) & 0x7fffffff;
  const prepCount = (s % 2) + 1;
  const shuffledPreparers = seededShuffle(preparerPool, seed + taskIdCounter);
  const preparers = shuffledPreparers.slice(0, prepCount);

  const baseDays = 10 + (taskIdCounter * 3) % 60;
  const dueMonth = 10 + Math.floor(baseDays / 30);
  const dueDay = (baseDays % 28) + 1;
  const dueDate = `${dueMonth}-${String(dueDay).padStart(2, "0")}-2025`;

  const status = statusOptions[taskIdCounter % statusOptions.length];

  return {
    id: `dyn-${taskIdCounter}`,
    title,
    context: `${displayName}: Workspace Initiative`,
    preparers,
    dueDate,
    status,
  };
}

export function generateCustomWorkspaceContent(capabilities: string[]): WorkspaceContentData {
  const resolvedCaps = capabilities.map(resolveBucketId);
  const uniqueCaps = Array.from(new Set(resolvedCaps));

  const isSingleModule = uniqueCaps.length === 1;

  const seed = uniqueCaps.sort().join(",").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const taskCount = isSingleModule
    ? 10
    : Math.min(4 + (seed % 9), 12);

  const tasks: Task[] = [];
  let taskIdCounter = 0;

  if (isSingleModule) {
    const bucketId = uniqueCaps[0];
    const pool = capabilityTaskPool[bucketId] || [];
    const shuffled = seededShuffle(pool, seed);
    for (let i = 0; i < Math.min(taskCount, shuffled.length); i++) {
      tasks.push(buildTaskFromPool(bucketId, i, taskIdCounter++, seed));
    }
  } else {
    for (const bucketId of uniqueCaps) {
      tasks.push(buildTaskFromPool(bucketId, 0, taskIdCounter++, seed));
    }

    const remaining = taskCount - tasks.length;
    if (remaining > 0) {
      const extraPool: { bucketId: string; titleIndex: number }[] = [];
      for (const bucketId of uniqueCaps) {
        const pool = capabilityTaskPool[bucketId] || [];
        for (let i = 1; i < pool.length; i++) {
          extraPool.push({ bucketId, titleIndex: i });
        }
      }
      const shuffledExtra = seededShuffle(extraPool, seed + 99);
      for (let i = 0; i < Math.min(remaining, shuffledExtra.length); i++) {
        const { bucketId, titleIndex } = shuffledExtra[i];
        tasks.push(buildTaskFromPool(bucketId, titleIndex, taskIdCounter++, seed));
      }
    }
  }

  const singleBucketName = isSingleModule
    ? (bucketDisplayNames[uniqueCaps[0]] || uniqueCaps[0])
    : "";
  const headerTitle = isSingleModule
    ? `${singleBucketName} Tasks`
    : "Workspace Tasks";

  const complete = tasks.filter(t => t.status === "complete").length;

  const quickActionsMap: { [key: string]: { label: string; id: string } } = {};
  uniqueCaps.forEach(capId => {
    const capActions = capabilityQuickActions[capId] || [];
    capActions.forEach(action => {
      quickActionsMap[action.id] = action;
    });
  });
  const quickActions = Object.values(quickActionsMap).slice(0, 4);

  const issues: Issue[] = [];
  const controls: Control[] = [];
  const narratives: Narrative[] = [];
  const risks: Risk[] = [];
  const comments: TabComment[] = [];

  uniqueCaps.forEach(capId => {
    const capIssues = capabilityIssuePool[capId] || [];
    capIssues.forEach((item, i) => issues.push({ ...item, id: `dyn-i-${capId}-${i}` }));
    const capControls = capabilityControlPool[capId] || [];
    capControls.forEach((item, i) => controls.push({ ...item, id: `dyn-c-${capId}-${i}` }));
    const capNarratives = capabilityNarrativePool[capId] || [];
    capNarratives.forEach((item, i) => narratives.push({ ...item, id: `dyn-n-${capId}-${i}` }));
    const capRisks = capabilityRiskPool[capId] || [];
    capRisks.forEach((item, i) => risks.push({ ...item, id: `dyn-r-${capId}-${i}` }));
    const capComments = capabilityCommentPool[capId] || [];
    capComments.forEach((item, i) => comments.push({ ...item, id: `dyn-co-${capId}-${i}` }));
  });

  return {
    scenarioPlanning: {
      title: headerTitle,
      progress: `${complete}/${tasks.length} Completed`,
      completed: complete,
      total: tasks.length,
    },
    tasks,
    inboxStats: [
      { label: "My Tasks", value: tasks.length },
      { label: "My Issues", value: issues.length },
      { label: "My Controls", value: controls.length },
      { label: "My Narratives", value: narratives.length },
      { label: "My Risks", value: risks.length },
      { label: "My Comments", value: comments.length },
    ],
    quickActions: quickActions.length > 0 ? quickActions : [
      { label: "Create New Item", id: "new-item" },
      { label: "Start Review", id: "start-review" },
      { label: "Generate Report", id: "new-report" },
    ],
    tabContent: { tasks, issues, controls, narratives, risks, comments },
  };
}

export const displayWorkspaces = [
  {
    id: "enterprise-risk",
    name: "Enterprise Risk",
    icon: Target,
    color: "#266C92",
    description: "Integration description lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc malesuada libero id nisl bibendum ultrices.",
  },
  {
    id: "enterprise-audit",
    name: "Enterprise Audit",
    icon: Shield,
    color: "#266C92",
    description: "Integration description lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc malesuada libero id nisl bibendum ultrices.",
  },
  {
    id: "it-security",
    name: "IT Security",
    icon: Zap,
    color: "#266C92",
    description: "Integration description lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc malesuada libero id nisl bibendum ultrices.",
  },
];

interface ChartStats {
  segments: { count: number; color: string; label: string }[];
  total: number;
  openCount: number;
  centerLabel: string;
}

function getTabChartStats(activeTab: string, content: WorkspaceContentData): ChartStats {
  const tc = content.tabContent;
  switch (activeTab) {
    case "My Tasks": {
      const items = tc?.tasks || content.tasks;
      const incomplete = items.filter(t => t.status === "incomplete").length;
      const inProgress = items.filter(t => t.status === "in-progress").length;
      const complete = items.filter(t => t.status === "complete").length;
      return {
        segments: [
          { count: incomplete, color: "#f59e0b", label: "Incomplete" },
          { count: inProgress, color: "#3b82f6", label: "In Progress" },
          { count: complete, color: "#10b981", label: "Complete" },
        ],
        total: items.length,
        openCount: incomplete + inProgress,
        centerLabel: "Open Tasks",
      };
    }
    case "My Issues": {
      const items = tc?.issues || [];
      const open = items.filter(i => i.status === "open").length;
      const investigating = items.filter(i => i.status === "investigating").length;
      const resolved = items.filter(i => i.status === "resolved").length;
      return {
        segments: [
          { count: open, color: "#f59e0b", label: "Open" },
          { count: investigating, color: "#3b82f6", label: "Investigating" },
          { count: resolved, color: "#10b981", label: "Resolved" },
        ],
        total: items.length,
        openCount: open + investigating,
        centerLabel: "Open Issues",
      };
    }
    case "My Controls": {
      const items = tc?.controls || [];
      const needsTesting = items.filter(c => c.effectiveness === "needs-testing").length;
      const ineffective = items.filter(c => c.effectiveness === "ineffective").length;
      const effective = items.filter(c => c.effectiveness === "effective").length;
      return {
        segments: [
          { count: needsTesting, color: "#f59e0b", label: "Needs Testing" },
          { count: ineffective, color: "#ef4444", label: "Ineffective" },
          { count: effective, color: "#10b981", label: "Effective" },
        ],
        total: items.length,
        openCount: needsTesting + ineffective,
        centerLabel: "Action Needed",
      };
    }
    case "My Narratives": {
      const items = tc?.narratives || [];
      const draft = items.filter(n => n.status === "draft").length;
      const inReview = items.filter(n => n.status === "in-review").length;
      const approved = items.filter(n => n.status === "approved").length;
      return {
        segments: [
          { count: draft, color: "#f59e0b", label: "Draft" },
          { count: inReview, color: "#3b82f6", label: "In Review" },
          { count: approved, color: "#10b981", label: "Approved" },
        ],
        total: items.length,
        openCount: draft + inReview,
        centerLabel: "Pending",
      };
    }
    case "My Risks": {
      const items = tc?.risks || [];
      const notStarted = items.filter(r => r.mitigationStatus === "not-started").length;
      const inProgress = items.filter(r => r.mitigationStatus === "in-progress").length;
      const mitigated = items.filter(r => r.mitigationStatus === "mitigated").length;
      return {
        segments: [
          { count: notStarted, color: "#f59e0b", label: "Not Started" },
          { count: inProgress, color: "#3b82f6", label: "In Progress" },
          { count: mitigated, color: "#10b981", label: "Mitigated" },
        ],
        total: items.length,
        openCount: notStarted + inProgress,
        centerLabel: "Open Risks",
      };
    }
    case "My Comments": {
      const items = tc?.comments || [];
      const newC = items.filter(c => c.status === "new").length;
      const flagged = items.filter(c => c.status === "flagged").length;
      const read = items.filter(c => c.status === "read").length;
      return {
        segments: [
          { count: newC, color: "#f59e0b", label: "New" },
          { count: flagged, color: "#ef4444", label: "Flagged" },
          { count: read, color: "#10b981", label: "Read" },
        ],
        total: items.length,
        openCount: newC + flagged,
        centerLabel: "Unread",
      };
    }
    default:
      return { segments: [], total: 0, openCount: 0, centerLabel: "" };
  }
}

function DonutChart({ stats }: { stats: ChartStats }) {
  const circumference = 2 * Math.PI * 45;
  if (stats.total === 0) {
    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-foreground">0</span>
          <span className="text-sm text-gray-500 dark:text-muted-foreground">{stats.centerLabel}</span>
        </div>
      </div>
    );
  }

  let offset = 0;
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90 transition-all duration-500 ease-out" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        {stats.segments.map((seg, idx) => {
          const pct = (seg.count / stats.total) * 100;
          const el = seg.count > 0 ? (
            <circle
              key={idx}
              cx="50" cy="50" r="45" fill="none" stroke={seg.color} strokeWidth="10"
              strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
              strokeDashoffset={-(offset / 100) * circumference}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          ) : null;
          offset += pct;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300">
        <span className="text-4xl font-bold text-gray-900 dark:text-foreground">{stats.openCount}</span>
        <span className="text-sm text-gray-500 dark:text-muted-foreground">{stats.centerLabel}</span>
      </div>
    </div>
  );
}

function getStatusBadge(status: Task["status"]) {
  switch (status) {
    case "complete":
      return { label: "Complete", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "in-progress":
      return { label: "In Progress", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" };
    default:
      return { label: "Incomplete", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getIssueSeverityBadge(severity: Issue["severity"]) {
  switch (severity) {
    case "critical":
      return { label: "Critical", className: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" };
    case "high":
      return { label: "High", className: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400" };
    case "medium":
      return { label: "Medium", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
    default:
      return { label: "Low", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" };
  }
}

function getControlBadge(effectiveness: Control["effectiveness"]) {
  switch (effectiveness) {
    case "effective":
      return { label: "Effective", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "ineffective":
      return { label: "Ineffective", className: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" };
    default:
      return { label: "Needs Testing", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getNarrativeBadge(status: Narrative["status"]) {
  switch (status) {
    case "approved":
      return { label: "Approved", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "in-review":
      return { label: "In Review", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" };
    default:
      return { label: "Draft", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getRiskBadge(status: Risk["mitigationStatus"]) {
  switch (status) {
    case "mitigated":
      return { label: "Mitigated", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "in-progress":
      return { label: "In Progress", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" };
    default:
      return { label: "Not Started", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getCommentBadge(status: TabComment["status"]) {
  switch (status) {
    case "read":
      return { label: "Read", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "flagged":
      return { label: "Flagged", className: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" };
    default:
      return { label: "New", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" };
  }
}

function getTabOverviewTitle(activeTab: string): string {
  switch (activeTab) {
    case "My Tasks": return "Task Overview";
    case "My Issues": return "Issue Overview";
    case "My Controls": return "Control Overview";
    case "My Narratives": return "Narrative Overview";
    case "My Risks": return "Risk Overview";
    case "My Comments": return "Comment Overview";
    default: return "Overview";
  }
}

function getTabListTitle(activeTab: string, content: WorkspaceContentData): string {
  switch (activeTab) {
    case "My Tasks": return content.scenarioPlanning.title;
    case "My Issues": return "Open Issues";
    case "My Controls": return "Control Status";
    case "My Narratives": return "Narratives";
    case "My Risks": return "Risk Register";
    case "My Comments": return "Recent Comments";
    default: return content.scenarioPlanning.title;
  }
}

interface HomePageContentProps {
  content: WorkspaceContentData;
  welcomeMessage: string;
  showWorkspaces?: boolean;
  compact?: boolean;
}

export function HomePageContent({ content, welcomeMessage, showWorkspaces = true, compact = false }: HomePageContentProps) {
  const { currentWorkspace, setWorkspace } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState("My Tasks");
  const [scenarioExpanded, setScenarioExpanded] = useState(true);
  const { setOpen: setAssistantOpen } = useHomeAssistantStore();

  const chartStats = useMemo(() => getTabChartStats(activeTab, content), [activeTab, content]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div
        className="text-white px-8 pt-6 pb-32 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${headerBgImage})` }}
      >
        <div className="max-w-6xl relative z-10">
          <h1 className="text-2xl font-semibold" data-testid="welcome-message">
            {welcomeMessage}
            <span className="ml-4 text-base font-normal text-white/80">
              {chartStats.openCount} New critical{" "}
              <span className="underline cursor-pointer hover:text-white">tasks to review</span>
            </span>
          </h1>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-background px-8 py-6 -mt-24 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">

          <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="assistant-card">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground text-center mb-4">
                What would you like to do?
              </h2>
              <div className="flex items-center gap-3 max-w-2xl mx-auto mb-4">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                  <Input
                    placeholder="Ask AuditBoard Assistant..."
                    className="pl-10 h-10 bg-slate-50 dark:bg-muted border-slate-200 dark:border-border"
                    data-testid="input-assistant"
                    onFocus={() => setAssistantOpen(true)}
                  />
                </div>
                <Button
                  className="bg-[#266C92] hover:bg-[#1e5a7a] text-white px-6"
                  data-testid="button-get-started"
                  onClick={() => setAssistantOpen(true)}
                >
                  Get Started
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {content.quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className="text-sm text-gray-600 dark:text-muted-foreground gap-2"
                    data-testid={`button-quick-action-${action.id}`}
                    onClick={() => setAssistantOpen(true)}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div data-testid="inbox-section">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-3">Inbox</h2>
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-border overflow-x-auto">
              {content.inboxStats.map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => setActiveTab(stat.label)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${
                    activeTab === stat.label
                      ? "text-[#266C92]"
                      : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground"
                  }`}
                  data-testid={`tab-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {stat.label}{" "}
                  <span className={`ml-1 ${activeTab === stat.label ? "text-[#266C92]" : "text-gray-400 dark:text-muted-foreground"}`}>
                    {stat.value}
                  </span>
                  {activeTab === stat.label && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#266C92]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="task-overview-card">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-1">{getTabOverviewTitle(activeTab)}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground mb-6 flex-wrap">
                  {chartStats.segments.filter(s => s.count > 0).map((seg) => (
                    <div key={seg.label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span>{seg.count} {seg.label}</span>
                    </div>
                  ))}
                </div>
                <DonutChart stats={chartStats} />
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-muted-foreground flex-wrap">
                  {chartStats.segments.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                      {seg.label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200 dark:border-border bg-white dark:bg-card" data-testid="scenario-card">
              <CardContent className="p-0 flex flex-col h-[340px]">
                <button
                  onClick={() => setScenarioExpanded(!scenarioExpanded)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-muted border-b border-slate-200 dark:border-border text-left hover-elevate transition-colors flex-shrink-0"
                  data-testid="button-scenario-toggle"
                >
                  {scenarioExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-foreground">{getTabListTitle(activeTab, content)}</span>
                </button>

                {scenarioExpanded && (
                  <div
                    className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-border"
                    data-testid="task-list"
                  >
                    {activeTab === "My Tasks" && (content.tabContent?.tasks || content.tasks).map((task) => {
                      const badge = getStatusBadge(task.status);
                      return (
                        <div key={task.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`task-item-${task.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{task.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{task.context}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Due Date</div>
                            <div className="text-sm text-gray-700 dark:text-foreground">{task.dueDate}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Issues" && (content.tabContent?.issues || []).map((issue) => {
                      const badge = getIssueSeverityBadge(issue.severity);
                      return (
                        <div key={issue.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`issue-item-${issue.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{issue.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{issue.source} &middot; {issue.assignee}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Reported</div>
                            <div className="text-sm text-gray-700 dark:text-foreground">{issue.dateReported}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Controls" && (content.tabContent?.controls || []).map((ctrl) => {
                      const badge = getControlBadge(ctrl.effectiveness);
                      return (
                        <div key={ctrl.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`control-item-${ctrl.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{ctrl.controlId} - {ctrl.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{ctrl.framework} &middot; {ctrl.owner}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Last Test</div>
                            <div className="text-sm text-gray-700 dark:text-foreground">{ctrl.testDate}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Narratives" && (content.tabContent?.narratives || []).map((narr) => {
                      const badge = getNarrativeBadge(narr.status);
                      return (
                        <div key={narr.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`narrative-item-${narr.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{narr.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{narr.process} &middot; {narr.author}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Updated</div>
                            <div className="text-sm text-gray-700 dark:text-foreground">{narr.lastUpdated}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Risks" && (content.tabContent?.risks || []).map((risk) => {
                      const badge = getRiskBadge(risk.mitigationStatus);
                      return (
                        <div key={risk.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`risk-item-${risk.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{risk.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{risk.riskCategory} &middot; L: {risk.likelihood} / I: {risk.impact} &middot; {risk.owner}</div>
                          </div>
                        </div>
                      );
                    })}
                    {activeTab === "My Comments" && (content.tabContent?.comments || []).map((comment) => {
                      const badge = getCommentBadge(comment.status);
                      return (
                        <div key={comment.id} className="flex items-start gap-4 px-4 py-3 hover-elevate cursor-pointer transition-colors" data-testid={`comment-item-${comment.id}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${badge.className}`}>{badge.label}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#266C92] dark:text-[#7BC4E0] hover:underline cursor-pointer">{comment.title}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{comment.context} &middot; {comment.author} &middot; {comment.threadCount} replies</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-400 dark:text-muted-foreground">Date</div>
                            <div className="text-sm text-gray-700 dark:text-foreground">{comment.date}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {showWorkspaces && (
            <div data-testid="workspaces-section">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">Your workspaces</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {displayWorkspaces.map((ws) => {
                  const Icon = ws.icon;
                  const isActive = ws.id === currentWorkspace.id;
                  return (
                    <Card
                      key={ws.id}
                      className={`shadow-sm border ${
                        isActive ? "border-[#266C92] bg-white dark:bg-card" : "border-slate-200 dark:border-border bg-white dark:bg-card"
                      }`}
                      data-testid={`workspace-card-${ws.id}`}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${ws.color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: ws.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-foreground text-sm">{ws.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
                            {ws.description}
                          </p>
                        </div>
                        <Button
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className={`flex-shrink-0 ${isActive ? "bg-[#266C92] hover:bg-[#1e5a7a]" : ""}`}
                          data-testid={`button-workspace-${ws.id}`}
                          onClick={() => {
                            if (!isActive) {
                              const storeWs = storeWorkspaces.find(w => w.id === ws.id);
                              if (storeWs) setWorkspace(storeWs);
                            }
                          }}
                        >
                          {isActive ? "Active" : "Switch"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}