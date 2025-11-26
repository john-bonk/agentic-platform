import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MoreHorizontal, Triangle, RefreshCcw, Check, Link2 } from "lucide-react";
import { HeaderSection } from "./sections/HeaderSection";
import { SideNavigationSection } from "./sections/SideNavigationSection";
import { 
  getApplicationsForTeam, 
  getVendorsForApplications, 
  getLocationsForApplications,
  getTeamsUsingApplications,
  getDepartmentForTeam,
  getTeamByName,
  type Application,
  type Vendor,
  type Location,
  type BusinessUnit
} from "../data/inventoryData";

interface ProcessDetailProps {
  processId: string;
}

type NavigationIcon = 
  | { type: "image"; src: string; alt: string; active: boolean }
  | { type: "lucide"; icon: "refresh-ccw"; alt: string; active: boolean };

const navigationIcons: NavigationIcon[] = [
  { type: "image", src: "/figmaAssets/module-dashboard-.svg", alt: "Module dashboard", active: false },
  { type: "image", src: "/figmaAssets/module-controls-.svg", alt: "Module controls", active: false },
  { type: "image", src: "/figmaAssets/module-risk-.svg", alt: "Module risk", active: false },
  { type: "image", src: "/figmaAssets/module-esg-.svg", alt: "Module esg", active: false },
  { type: "image", src: "/figmaAssets/module-crosscomply-.svg", alt: "Module crosscomply", active: false },
  { type: "image", src: "/figmaAssets/module-opsaudit.svg", alt: "Module opsaudit", active: false },
  { type: "image", src: "/figmaAssets/module-tprm.svg", alt: "Module tprm", active: false },
  { type: "lucide", icon: "refresh-ccw", alt: "BCM", active: true },
  { type: "image", src: "/figmaAssets/files.svg", alt: "Files", active: false },
  { type: "image", src: "/figmaAssets/module-report-.svg", alt: "Module report", active: false },
  { type: "image", src: "/figmaAssets/module-workstream-.svg", alt: "Module workstream", active: false },
  { type: "image", src: "/figmaAssets/module-automations-.svg", alt: "Module automations", active: false },
  { type: "image", src: "/figmaAssets/plug.svg", alt: "Plug", active: false },
  { type: "image", src: "/figmaAssets/module-issues.svg", alt: "Module issues", active: false },
  { type: "image", src: "/figmaAssets/module-files.svg", alt: "Module files", active: false },
  { type: "image", src: "/figmaAssets/module-timesheets.svg", alt: "Module timesheets", active: false },
  { type: "image", src: "/figmaAssets/module-settings-.svg", alt: "Module settings", active: false },
];

type ImpactLevel = "High" | "Medium" | "Low";

interface ITAssetItem {
  name: string;
  description: string;
  recoveryTimeframe: string;
  recoveryGap: "met" | "gap";
  assetOwner: string;
}

interface VendorItem {
  name: string;
  description: string;
  vendorContact: string;
}

interface BusinessProcessItem {
  name: string;
  description: string;
  rto: string;
  processOwner: string;
}

interface BranchItem {
  name: string;
  type: string;
}

interface Dependencies {
  itAssets: ITAssetItem[];
  vendors: VendorItem[];
  businessProcesses: BusinessProcessItem[];
  branches: BranchItem[];
}

const processData: Record<string, {
  name: string;
  description: string;
  processOwner: string;
  criticality: "High" | "Low";
  rto: string;
  rpo: string;
  biaLastUpdated: string;
  businessUnits: string;
  ownerTeam: string;
  relatedRisks: string;
  frameworks: string;
  controls: string;
  bia: {
    financialImpact: ImpactLevel;
    operationalImpact: ImpactLevel;
    reputationalImpact: ImpactLevel;
    legalImpact: ImpactLevel;
    regulatoryImpact: ImpactLevel;
    mtd: string;
    rto: string;
    rpo: string;
  };
  dependencies: Dependencies;
}> = {
  "1": {
    name: "Account Management",
    description: "Account Management ensures the smooth and secure management of customer accounts, including account creation, updates, and closures. This process is critical to daily banking operations and customer satisfaction.",
    processOwner: "Baylor Cruz",
    criticality: "High",
    rto: "1 hour",
    rpo: "1 hour",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Retail Banking Operations",
    ownerTeam: "Accounting",
    relatedRisks: "Credit Risk, System Outages, Data Breaches",
    frameworks: "PCI-DSS, SOX, Anti-Money Laundering (AML) regulations, Federal Reserve requirements",
    controls: "AC-01 Multi-Factor Authentication, AC-02 Customer Identity Verification, AC-03 Account Activity Monitoring, AC-04 Suspicious Activity Reporting, AC-05 Data Encryption at Rest",
    bia: {
      financialImpact: "High",
      operationalImpact: "High",
      reputationalImpact: "High",
      legalImpact: "High",
      regulatoryImpact: "High",
      mtd: "2 hours",
      rto: "1 hour",
      rpo: "30 minutes",
    },
    dependencies: {
      itAssets: [
        { name: "Core Banking System (CBS)", description: "Primary account management platform", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "John Smith" },
        { name: "Customer Relationship Management", description: "Customer data and interaction tracking", recoveryTimeframe: "2 hours", recoveryGap: "gap", assetOwner: "John Smith" },
        { name: "Identity Management System", description: "Authentication and access control", recoveryTimeframe: "4 hours", recoveryGap: "gap", assetOwner: "John Smith" },
      ],
      vendors: [
        { name: "Fiserv", description: "Core Banking Provider", vendorContact: "Jane Smith" },
        { name: "Experian", description: "Credit Bureau", vendorContact: "Jane Smith" },
        { name: "AWS", description: "Cloud Hosting Provider", vendorContact: "Jane Smith" },
      ],
      businessProcesses: [
        { name: "Customer Service and Support", description: "Ensures payment processing is tied to correct customer accounts.", rto: "4 hours", processOwner: "Maria Silver" },
        { name: "Payment Processing", description: "Alerts and flags for suspicious transactions.", rto: "2 hours", processOwner: "Jay Li" },
      ],
      branches: [
        { name: "Main Data Center - Dallas", type: "Primary" },
        { name: "Backup Data Center - Phoenix", type: "Secondary" },
      ],
    },
  },
  "2": {
    name: "Loan Origination and Servicing",
    description: "Loan Origination and Servicing handles the complete lifecycle of loans from application to repayment. This includes credit assessment, approval workflows, and ongoing loan management.",
    processOwner: "Baylor Cruz",
    criticality: "Low",
    rto: "30 mins",
    rpo: "30 mins",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Retail Banking Operations",
    ownerTeam: "Financial Planning",
    relatedRisks: "Credit Risk, Compliance Risk",
    frameworks: "SOX, Consumer Financial Protection Bureau (CFPB) regulations",
    controls: "LN-01 Credit Score Verification, LN-02 Income Documentation Review, LN-03 Dual Approval for Large Loans, LN-04 Automated Underwriting Validation, LN-05 Loan Document Retention",
    bia: {
      financialImpact: "High",
      operationalImpact: "Medium",
      reputationalImpact: "Medium",
      legalImpact: "High",
      regulatoryImpact: "High",
      mtd: "4 hours",
      rto: "2 hours",
      rpo: "1 hour",
    },
    dependencies: {
      itAssets: [
        { name: "Loan Origination System (LOS)", description: "End-to-end loan processing", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Sarah Chen" },
        { name: "Credit Decision Engine", description: "Automated credit scoring", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Sarah Chen" },
        { name: "Document Management System", description: "Loan document storage", recoveryTimeframe: "4 hours", recoveryGap: "gap", assetOwner: "Sarah Chen" },
      ],
      vendors: [
        { name: "Equifax", description: "Credit Bureau", vendorContact: "Mike Johnson" },
        { name: "TransUnion", description: "Credit Bureau", vendorContact: "Mike Johnson" },
      ],
      businessProcesses: [
        { name: "Account Management", description: "Links loan accounts to customer profiles.", rto: "1 hour", processOwner: "Baylor Cruz" },
        { name: "Payment Processing", description: "Processes loan payment transactions.", rto: "2 hours", processOwner: "Jay Li" },
      ],
      branches: [
        { name: "Loan Processing Center - Chicago", type: "Primary" },
      ],
    },
  },
  "3": {
    name: "Customer Service and Support",
    description: "Customer Service and Support provides assistance to customers through various channels including phone, email, and chat. This process handles inquiries, complaints, and service requests.",
    processOwner: "Baylor Cruz",
    criticality: "Low",
    rto: "24 hours",
    rpo: "24 hours",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Retail Banking Operations",
    ownerTeam: "Recruiting",
    relatedRisks: "Reputation Risk, Operational Risk",
    frameworks: "Consumer Protection regulations",
    controls: "CS-01 Call Recording and Monitoring, CS-02 Customer Authentication Protocol, CS-03 Complaint Escalation Procedures, CS-04 Service Level Agreement Tracking, CS-05 Quality Assurance Reviews",
    bia: {
      financialImpact: "Low",
      operationalImpact: "Medium",
      reputationalImpact: "High",
      legalImpact: "Low",
      regulatoryImpact: "Medium",
      mtd: "24 hours",
      rto: "8 hours",
      rpo: "4 hours",
    },
    dependencies: {
      itAssets: [
        { name: "Contact Center Platform", description: "Customer call handling system", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Tom Wilson" },
        { name: "CRM System", description: "Customer relationship management", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Tom Wilson" },
        { name: "Knowledge Base", description: "Support documentation portal", recoveryTimeframe: "8 hours", recoveryGap: "gap", assetOwner: "Tom Wilson" },
      ],
      vendors: [
        { name: "Genesys", description: "Contact Center Provider", vendorContact: "Lisa Park" },
        { name: "Salesforce", description: "CRM Provider", vendorContact: "Lisa Park" },
      ],
      businessProcesses: [
        { name: "Account Management", description: "Access customer account information.", rto: "1 hour", processOwner: "Baylor Cruz" },
        { name: "Loan Origination and Servicing", description: "Handle loan-related inquiries.", rto: "30 mins", processOwner: "Baylor Cruz" },
      ],
      branches: [
        { name: "Call Center - Tampa", type: "Primary" },
        { name: "Call Center - Manila", type: "Secondary" },
      ],
    },
  },
  "4": {
    name: "Employee Onboarding and Offboarding",
    description: "Employee Onboarding and Offboarding manages the complete employee lifecycle from hiring to separation. This includes provisioning access, training, and deprovisioning upon departure.",
    processOwner: "Dante Bradford",
    criticality: "Low",
    rto: "1 hour",
    rpo: "1 hour",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Human Resources",
    ownerTeam: "Recruiting",
    relatedRisks: "Access Control Risk, Compliance Risk",
    frameworks: "SOX, GDPR, Employment regulations",
    controls: "HR-01 Background Check Verification, HR-02 Access Provisioning Workflow, HR-03 Mandatory Security Training, HR-04 Same-Day Access Revocation, HR-05 Exit Interview Documentation",
    bia: {
      financialImpact: "Low",
      operationalImpact: "Medium",
      reputationalImpact: "Low",
      legalImpact: "Medium",
      regulatoryImpact: "Medium",
      mtd: "48 hours",
      rto: "24 hours",
      rpo: "8 hours",
    },
    dependencies: {
      itAssets: [
        { name: "HR Information System (HRIS)", description: "Employee records and workflow", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Emily Davis" },
        { name: "Active Directory", description: "Identity and access management", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Emily Davis" },
        { name: "Learning Management System", description: "Training platform", recoveryTimeframe: "24 hours", recoveryGap: "gap", assetOwner: "Emily Davis" },
      ],
      vendors: [
        { name: "Workday", description: "HRIS Provider", vendorContact: "David Brown" },
        { name: "Sterling", description: "Background Check Provider", vendorContact: "David Brown" },
      ],
      businessProcesses: [
        { name: "Payroll Processing", description: "Setup payroll for new hires.", rto: "1 hour", processOwner: "Dante Bradford" },
        { name: "Benefits Administration", description: "Enroll new hires in benefits.", rto: "1 hour", processOwner: "Dante Bradford" },
        { name: "Training & Development", description: "Assign required training courses.", rto: "1 hour", processOwner: "Dante Bradford" },
      ],
      branches: [
        { name: "Corporate Headquarters - New York", type: "Primary" },
      ],
    },
  },
  "5": {
    name: "Payroll Processing",
    description: "Payroll Processing ensures accurate and timely payment of employee salaries, benefits, and deductions. This includes tax calculations and regulatory compliance.",
    processOwner: "Dante Bradford",
    criticality: "Low",
    rto: "1 hour",
    rpo: "1 hour",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Human Resources",
    ownerTeam: "Payroll",
    relatedRisks: "Financial Risk, Compliance Risk",
    frameworks: "Tax regulations, Labor laws",
    controls: "PR-01 Payroll Reconciliation Review, PR-02 Segregation of Duties, PR-03 Tax Withholding Validation, PR-04 Direct Deposit Verification, PR-05 Payroll Audit Trail",
    bia: {
      financialImpact: "High",
      operationalImpact: "High",
      reputationalImpact: "Medium",
      legalImpact: "High",
      regulatoryImpact: "High",
      mtd: "24 hours",
      rto: "4 hours",
      rpo: "1 hour",
    },
    dependencies: {
      itAssets: [
        { name: "Payroll System", description: "Salary and deduction processing", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Rachel Kim" },
        { name: "Time & Attendance System", description: "Employee time tracking", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Rachel Kim" },
        { name: "General Ledger", description: "Financial accounting system", recoveryTimeframe: "4 hours", recoveryGap: "gap", assetOwner: "Rachel Kim" },
      ],
      vendors: [
        { name: "ADP", description: "Payroll Provider", vendorContact: "Chris Lee" },
        { name: "Bank of America", description: "Direct Deposit Provider", vendorContact: "Chris Lee" },
      ],
      businessProcesses: [
        { name: "Employee Onboarding and Offboarding", description: "New hire payroll setup.", rto: "1 hour", processOwner: "Dante Bradford" },
        { name: "Benefits Administration", description: "Deduction processing coordination.", rto: "1 hour", processOwner: "Dante Bradford" },
      ],
      branches: [
        { name: "Finance Center - Atlanta", type: "Primary" },
      ],
    },
  },
  "6": {
    name: "Benefits Administration",
    description: "Benefits Administration manages employee benefits including health insurance, retirement plans, and other perks. This process handles enrollment, changes, and claims processing.",
    processOwner: "Dante Bradford",
    criticality: "Low",
    rto: "1 hour",
    rpo: "1 hour",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Human Resources",
    ownerTeam: "Employee Relations",
    relatedRisks: "Compliance Risk, Financial Risk",
    frameworks: "ERISA, ACA regulations",
    controls: "BN-01 Eligibility Verification, BN-02 Open Enrollment Controls, BN-03 COBRA Compliance Tracking, BN-04 401k Contribution Limits, BN-05 Benefits Cost Reconciliation",
    bia: {
      financialImpact: "Medium",
      operationalImpact: "Low",
      reputationalImpact: "Medium",
      legalImpact: "Medium",
      regulatoryImpact: "High",
      mtd: "72 hours",
      rto: "24 hours",
      rpo: "12 hours",
    },
    dependencies: {
      itAssets: [
        { name: "Benefits Administration System", description: "Benefits enrollment and management", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Karen White" },
        { name: "401k Portal", description: "Retirement plan management", recoveryTimeframe: "24 hours", recoveryGap: "gap", assetOwner: "Karen White" },
        { name: "Health Insurance Portal", description: "Health benefits portal", recoveryTimeframe: "8 hours", recoveryGap: "gap", assetOwner: "Karen White" },
      ],
      vendors: [
        { name: "Cigna", description: "Health Insurance Provider", vendorContact: "Amy Zhang" },
        { name: "Fidelity", description: "401k Administrator", vendorContact: "Amy Zhang" },
      ],
      businessProcesses: [
        { name: "Payroll Processing", description: "Benefits deduction coordination.", rto: "1 hour", processOwner: "Dante Bradford" },
        { name: "Employee Onboarding and Offboarding", description: "Benefits enrollment/termination.", rto: "1 hour", processOwner: "Dante Bradford" },
      ],
      branches: [
        { name: "HR Services Center - Denver", type: "Primary" },
      ],
    },
  },
  "7": {
    name: "Training & Development",
    description: "Training & Development provides learning opportunities and skill development programs for employees. This includes onboarding training, compliance training, and professional development.",
    processOwner: "Dante Bradford",
    criticality: "Low",
    rto: "1 hour",
    rpo: "1 hour",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Human Resources",
    ownerTeam: "Recruiting",
    relatedRisks: "Compliance Risk, Skill Gap Risk",
    frameworks: "Industry training standards",
    controls: "TR-01 Mandatory Training Completion Tracking, TR-02 Annual Compliance Certification, TR-03 Training Effectiveness Assessment, TR-04 Skills Gap Analysis, TR-05 Training Record Retention",
    bia: {
      financialImpact: "Low",
      operationalImpact: "Low",
      reputationalImpact: "Low",
      legalImpact: "Low",
      regulatoryImpact: "Medium",
      mtd: "1 week",
      rto: "72 hours",
      rpo: "24 hours",
    },
    dependencies: {
      itAssets: [
        { name: "Learning Management System (LMS)", description: "Training course delivery", recoveryTimeframe: "8 hours", recoveryGap: "met", assetOwner: "Steve Martin" },
        { name: "Video Conferencing Platform", description: "Virtual training sessions", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Steve Martin" },
        { name: "Training Content Repository", description: "Course content storage", recoveryTimeframe: "24 hours", recoveryGap: "gap", assetOwner: "Steve Martin" },
      ],
      vendors: [
        { name: "Cornerstone OnDemand", description: "LMS Provider", vendorContact: "Nina Patel" },
        { name: "LinkedIn Learning", description: "Content Provider", vendorContact: "Nina Patel" },
      ],
      businessProcesses: [
        { name: "Employee Onboarding and Offboarding", description: "Mandatory training assignments.", rto: "1 hour", processOwner: "Dante Bradford" },
      ],
      branches: [
        { name: "Training Center - Boston", type: "Primary" },
      ],
    },
  },
  "8": {
    name: "Cash Flow Forecasting",
    description: "Cash Flow Forecasting predicts future cash positions to ensure adequate liquidity. This process analyzes historical data and business projections to optimize cash management.",
    processOwner: "Leah Sullivan",
    criticality: "Low",
    rto: "1 hour",
    rpo: "1 hour",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Treasury & Cash Management",
    ownerTeam: "Treasury",
    relatedRisks: "Liquidity Risk, Market Risk",
    frameworks: "Basel III requirements, Internal treasury policies",
    controls: "CF-01 Daily Cash Position Reporting, CF-02 Variance Analysis Review, CF-03 Forecast Model Validation, CF-04 Management Approval for Projections, CF-05 Historical Data Integrity Checks",
    bia: {
      financialImpact: "High",
      operationalImpact: "Medium",
      reputationalImpact: "Low",
      legalImpact: "Low",
      regulatoryImpact: "Medium",
      mtd: "8 hours",
      rto: "4 hours",
      rpo: "2 hours",
    },
    dependencies: {
      itAssets: [
        { name: "Treasury Management System", description: "Cash position and forecasting", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Michael Chen" },
        { name: "Financial Planning & Analysis Tool", description: "Financial modeling platform", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Michael Chen" },
        { name: "ERP System", description: "Enterprise resource planning", recoveryTimeframe: "8 hours", recoveryGap: "gap", assetOwner: "Michael Chen" },
      ],
      vendors: [
        { name: "Kyriba", description: "Treasury System Provider", vendorContact: "Robert Taylor" },
        { name: "Bloomberg", description: "Market Data Provider", vendorContact: "Robert Taylor" },
      ],
      businessProcesses: [
        { name: "Liquidity Management", description: "Cash position optimization.", rto: "1 hour", processOwner: "Leah Sullivan" },
        { name: "Payment Processing", description: "Fund disbursement planning.", rto: "4 hours", processOwner: "Leah Sullivan" },
      ],
      branches: [
        { name: "Treasury Operations Center - New York", type: "Primary" },
      ],
    },
  },
  "9": {
    name: "Liquidity Management",
    description: "Liquidity Management ensures the organization maintains adequate cash and liquid assets to meet obligations. This includes monitoring cash positions and managing short-term investments.",
    processOwner: "Leah Sullivan",
    criticality: "Low",
    rto: "1 hour",
    rpo: "1 hour",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Treasury & Cash Management",
    ownerTeam: "Treasury",
    relatedRisks: "Liquidity Risk, Credit Risk",
    frameworks: "Basel III requirements, Federal Reserve regulations",
    controls: "LQ-01 Liquidity Coverage Ratio Monitoring, LQ-02 Stress Testing Procedures, LQ-03 Counterparty Exposure Limits, LQ-04 Collateral Management, LQ-05 Intraday Liquidity Monitoring",
    bia: {
      financialImpact: "High",
      operationalImpact: "High",
      reputationalImpact: "Medium",
      legalImpact: "Medium",
      regulatoryImpact: "High",
      mtd: "4 hours",
      rto: "2 hours",
      rpo: "30 minutes",
    },
    dependencies: {
      itAssets: [
        { name: "Treasury Management System", description: "Real-time liquidity tracking", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Jennifer Adams" },
        { name: "Real-time Cash Position Monitor", description: "Live cash position dashboard", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Jennifer Adams" },
        { name: "Investment Portfolio System", description: "Short-term investment tracking", recoveryTimeframe: "4 hours", recoveryGap: "gap", assetOwner: "Jennifer Adams" },
      ],
      vendors: [
        { name: "Federal Reserve Bank", description: "Central Bank", vendorContact: "Daniel Moore" },
        { name: "JP Morgan", description: "Correspondent Bank", vendorContact: "Daniel Moore" },
      ],
      businessProcesses: [
        { name: "Cash Flow Forecasting", description: "Liquidity requirement projections.", rto: "1 hour", processOwner: "Leah Sullivan" },
        { name: "Payment Processing", description: "Fund availability coordination.", rto: "4 hours", processOwner: "Leah Sullivan" },
      ],
      branches: [
        { name: "Treasury Operations Center - New York", type: "Primary" },
        { name: "Backup Trading Floor - London", type: "Secondary" },
      ],
    },
  },
  "10": {
    name: "Payment Processing",
    description: "Payment Processing ensures the smooth and secure transfer of funds between accounts, including customer payments, vendor transactions, and interbank transfers. This process is critical to daily banking operations and financial stability. The process includes automated clearinghouse (ACH) transactions, wire transfers, and card payment settlements.",
    processOwner: "Leah Sullivan",
    criticality: "Low",
    rto: "4 hours",
    rpo: "4 hours",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Treasury & Cash Management",
    ownerTeam: "Treasury",
    relatedRisks: "Credit Risk, System Outages, Data Breaches",
    frameworks: "PCI-DSS, SOX, Anti-Money Laundering (AML) regulations, Federal Reserve requirements",
    controls: "PP-01 Transaction Authorization Limits, PP-02 Dual Approval for Wire Transfers, PP-03 OFAC Sanctions Screening, PP-04 Fraud Detection Algorithms, PP-05 End-of-Day Reconciliation",
    bia: {
      financialImpact: "High",
      operationalImpact: "High",
      reputationalImpact: "High",
      legalImpact: "High",
      regulatoryImpact: "High",
      mtd: "2 hours",
      rto: "1 hour",
      rpo: "15 minutes",
    },
    dependencies: {
      itAssets: [
        { name: "Payment Gateway", description: "Transaction routing system", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Alex Thompson" },
        { name: "ACH Processing System", description: "Automated Clearing House", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Alex Thompson" },
        { name: "Wire Transfer System", description: "Wire payment processing", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Alex Thompson" },
        { name: "Fraud Detection System", description: "Real-time fraud monitoring", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Alex Thompson" },
      ],
      vendors: [
        { name: "Visa/Mastercard", description: "Card Network", vendorContact: "Patricia Williams" },
        { name: "SWIFT", description: "Payment Network", vendorContact: "Patricia Williams" },
        { name: "The Clearing House", description: "ACH Operator", vendorContact: "Patricia Williams" },
      ],
      businessProcesses: [
        { name: "Account Management", description: "Customer account fund transfers.", rto: "1 hour", processOwner: "Baylor Cruz" },
        { name: "Liquidity Management", description: "Fund availability verification.", rto: "1 hour", processOwner: "Leah Sullivan" },
      ],
      branches: [
        { name: "Payment Operations Center - Charlotte", type: "Primary" },
        { name: "Disaster Recovery Site - Dallas", type: "Secondary" },
      ],
    },
  },
  "11": {
    name: "Benefits Administration",
    description: "Benefits Administration in Treasury manages financial benefits and treasury-related employee compensation programs.",
    processOwner: "Leah Sullivan",
    criticality: "Low",
    rto: "1 hour",
    rpo: "1 hour",
    biaLastUpdated: "June 20, 2024",
    businessUnits: "Treasury & Cash Management",
    ownerTeam: "Treasury",
    relatedRisks: "Financial Risk, Compliance Risk",
    frameworks: "Treasury management standards",
    controls: "TB-01 Deferred Compensation Tracking, TB-02 Executive Benefits Approval, TB-03 Investment Option Monitoring, TB-04 Vesting Schedule Compliance, TB-05 Tax Reporting Accuracy",
    bia: {
      financialImpact: "Medium",
      operationalImpact: "Low",
      reputationalImpact: "Low",
      legalImpact: "Medium",
      regulatoryImpact: "Medium",
      mtd: "48 hours",
      rto: "24 hours",
      rpo: "8 hours",
    },
    dependencies: {
      itAssets: [
        { name: "Deferred Compensation System", description: "Executive compensation tracking", recoveryTimeframe: "8 hours", recoveryGap: "met", assetOwner: "Linda Garcia" },
        { name: "Executive Benefits Portal", description: "Executive benefits management", recoveryTimeframe: "24 hours", recoveryGap: "gap", assetOwner: "Linda Garcia" },
      ],
      vendors: [
        { name: "Northern Trust", description: "Executive Benefits Provider", vendorContact: "James Wilson" },
      ],
      businessProcesses: [
        { name: "Payroll Processing", description: "Deferred compensation disbursement.", rto: "1 hour", processOwner: "Dante Bradford" },
        { name: "Cash Flow Forecasting", description: "Benefits liability projections.", rto: "1 hour", processOwner: "Leah Sullivan" },
      ],
      branches: [
        { name: "Treasury Operations Center - New York", type: "Primary" },
      ],
    },
  },
};

const tabs = ["Overview", "Business Impact Analysis", "Key Dependencies", "Business Continuity Plan", "Issues"];

interface SemanticRelationships {
  itSystems: Application[];
  semanticVendors: Vendor[];
  relatedTeams: BusinessUnit[];
  deploymentLocations: Location[];
}

function KeyDependenciesContent({ dependencies, ownerTeam }: { dependencies: Dependencies; ownerTeam: string }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    itAssets: true,
    vendors: false,
    businessProcesses: false,
    branches: false,
    semanticItSystems: false,
    semanticVendors: false,
    semanticTeams: false,
    semanticLocations: false,
  });

  const semanticRelationships = useMemo<SemanticRelationships>(() => {
    const apps = getApplicationsForTeam(ownerTeam);
    const vendorsList = getVendorsForApplications(apps);
    const locationsList = getLocationsForApplications(apps);
    const teamsList = getTeamsUsingApplications(apps).filter(t => t.name !== ownerTeam);
    
    return {
      itSystems: apps,
      semanticVendors: vendorsList,
      relatedTeams: teamsList,
      deploymentLocations: locationsList,
    };
  }, [ownerTeam]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const RecoveryGapIcon = ({ gap }: { gap: "met" | "gap" }) => {
    if (gap === "met") {
      return (
        <div className="w-5 h-5 rounded-full bg-[#dcfce7] flex items-center justify-center">
          <Check className="w-3 h-3 text-[#36844a]" />
        </div>
      );
    }
    return (
      <Triangle className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* IT Assets Section */}
      <div className="w-full">
        <button
          onClick={() => toggleSection("itAssets")}
          className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
            expandedSections.itAssets 
              ? "bg-[#f3fafb] rounded-t" 
              : "bg-white rounded"
          }`}
          data-testid="accordion-itAssets"
        >
          {expandedSections.itAssets && (
            <div className="w-1 h-10 bg-[#266c92] rounded-tl" />
          )}
          <div className={`flex items-center gap-4 ${expandedSections.itAssets ? "pl-3" : "pl-4"} pr-3 flex-1`}>
            <ChevronDown
              className={`w-3 h-3 text-[#64748b] transition-transform ${
                !expandedSections.itAssets ? "-rotate-90" : ""
              }`}
            />
            <span className="font-bold text-sm text-[#0f172a]">IT Assets</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#e2e8f0] text-[#64748b]">{dependencies.itAssets.length}</span>
          </div>
        </button>
        {expandedSections.itAssets && (
          <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Name</th>
                  <th className="pb-2 font-medium" style={{ width: "280px" }}>Description</th>
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Recovery Timeframe Capability</th>
                  <th className="pb-2 font-medium" style={{ width: "120px" }}>Recovery Time Gap</th>
                  <th className="pb-2 font-medium">Asset Owner</th>
                </tr>
              </thead>
              <tbody>
                {dependencies.itAssets.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2 text-sm" style={{ width: "180px" }}>
                      <a href="#" className="text-[#266c92] hover:underline" data-testid={`link-itAssets-${idx}`}>
                        {item.name}
                      </a>
                    </td>
                    <td className="py-2 text-sm text-[#64748b]" style={{ width: "280px" }}>{item.description}</td>
                    <td className="py-2 text-sm text-[#64748b]" style={{ width: "180px" }}>{item.recoveryTimeframe}</td>
                    <td className="py-2" style={{ width: "120px" }}><RecoveryGapIcon gap={item.recoveryGap} /></td>
                    <td className="py-2 text-sm">
                      <a href="#" className="text-[#266c92] hover:underline">{item.assetOwner}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vendors Section */}
      <div className="w-full">
        <button
          onClick={() => toggleSection("vendors")}
          className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
            expandedSections.vendors 
              ? "bg-[#f3fafb] rounded-t" 
              : "bg-white rounded"
          }`}
          data-testid="accordion-vendors"
        >
          {expandedSections.vendors && (
            <div className="w-1 h-10 bg-[#266c92] rounded-tl" />
          )}
          <div className={`flex items-center gap-4 ${expandedSections.vendors ? "pl-3" : "pl-4"} pr-3 flex-1`}>
            <ChevronDown
              className={`w-3 h-3 text-[#64748b] transition-transform ${
                !expandedSections.vendors ? "-rotate-90" : ""
              }`}
            />
            <span className="font-bold text-sm text-[#0f172a]">Vendors</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#e2e8f0] text-[#64748b]">{dependencies.vendors.length}</span>
          </div>
        </button>
        {expandedSections.vendors && (
          <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Name</th>
                  <th className="pb-2 font-medium" style={{ width: "280px" }}>Description</th>
                  <th className="pb-2 font-medium">Vendor Contact</th>
                </tr>
              </thead>
              <tbody>
                {dependencies.vendors.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2 text-sm" style={{ width: "180px" }}>
                      <a href="#" className="text-[#266c92] hover:underline" data-testid={`link-vendors-${idx}`}>
                        {item.name}
                      </a>
                    </td>
                    <td className="py-2 text-sm text-[#64748b]" style={{ width: "280px" }}>{item.description}</td>
                    <td className="py-2 text-sm">
                      <a href="#" className="text-[#266c92] hover:underline">{item.vendorContact}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Business Processes Section */}
      <div className="w-full">
        <button
          onClick={() => toggleSection("businessProcesses")}
          className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
            expandedSections.businessProcesses 
              ? "bg-[#f3fafb] rounded-t" 
              : "bg-white rounded"
          }`}
          data-testid="accordion-businessProcesses"
        >
          {expandedSections.businessProcesses && (
            <div className="w-1 h-10 bg-[#266c92] rounded-tl" />
          )}
          <div className={`flex items-center gap-4 ${expandedSections.businessProcesses ? "pl-3" : "pl-4"} pr-3 flex-1`}>
            <ChevronDown
              className={`w-3 h-3 text-[#64748b] transition-transform ${
                !expandedSections.businessProcesses ? "-rotate-90" : ""
              }`}
            />
            <span className="font-bold text-sm text-[#0f172a]">Business Processes</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#e2e8f0] text-[#64748b]">{dependencies.businessProcesses.length}</span>
          </div>
        </button>
        {expandedSections.businessProcesses && (
          <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Name</th>
                  <th className="pb-2 font-medium" style={{ width: "280px" }}>Description</th>
                  <th className="pb-2 font-medium" style={{ width: "100px" }}>RTO</th>
                  <th className="pb-2 font-medium">Process Owner</th>
                </tr>
              </thead>
              <tbody>
                {dependencies.businessProcesses.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2 text-sm" style={{ width: "180px" }}>
                      <a href="#" className="text-[#266c92] hover:underline" data-testid={`link-businessProcesses-${idx}`}>
                        {item.name}
                      </a>
                    </td>
                    <td className="py-2 text-sm text-[#64748b]" style={{ width: "280px" }}>{item.description}</td>
                    <td className="py-2 text-sm" style={{ width: "100px" }}>
                      <a href="#" className="text-[#266c92] hover:underline">{item.rto}</a>
                    </td>
                    <td className="py-2 text-sm">
                      <a href="#" className="text-[#266c92] hover:underline">{item.processOwner}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Branches Section */}
      <div className="w-full">
        <button
          onClick={() => toggleSection("branches")}
          className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
            expandedSections.branches 
              ? "bg-[#f3fafb] rounded-t" 
              : "bg-white rounded"
          }`}
          data-testid="accordion-branches"
        >
          {expandedSections.branches && (
            <div className="w-1 h-10 bg-[#266c92] rounded-tl" />
          )}
          <div className={`flex items-center gap-4 ${expandedSections.branches ? "pl-3" : "pl-4"} pr-3 flex-1`}>
            <ChevronDown
              className={`w-3 h-3 text-[#64748b] transition-transform ${
                !expandedSections.branches ? "-rotate-90" : ""
              }`}
            />
            <span className="font-bold text-sm text-[#0f172a]">Branches</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#e2e8f0] text-[#64748b]">{dependencies.branches.length}</span>
          </div>
        </button>
        {expandedSections.branches && (
          <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Name</th>
                  <th className="pb-2 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {dependencies.branches.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2 text-sm" style={{ width: "180px" }}>
                      <a href="#" className="text-[#266c92] hover:underline" data-testid={`link-branches-${idx}`}>
                        {item.name}
                      </a>
                    </td>
                    <td className="py-2 text-sm text-[#64748b]">{item.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Semantic Relationships Section Header */}
      <div className="mt-6 mb-4 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-[#266c92]" />
        <span className="text-sm font-semibold text-[#0f172a]">Semantic Relationships</span>
        <span className="text-xs text-[#64748b]">(Derived from {ownerTeam} team inventory)</span>
      </div>

      {/* Semantic IT Systems Section */}
      <div className="w-full">
        <button
          onClick={() => toggleSection("semanticItSystems")}
          className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
            expandedSections.semanticItSystems 
              ? "bg-[#f0fdf4] rounded-t" 
              : "bg-white rounded"
          }`}
          data-testid="accordion-semanticItSystems"
        >
          {expandedSections.semanticItSystems && (
            <div className="w-1 h-10 bg-[#22c55e] rounded-tl" />
          )}
          <div className={`flex items-center gap-4 ${expandedSections.semanticItSystems ? "pl-3" : "pl-4"} pr-3 flex-1`}>
            <ChevronDown
              className={`w-3 h-3 text-[#64748b] transition-transform ${
                !expandedSections.semanticItSystems ? "-rotate-90" : ""
              }`}
            />
            <span className="font-bold text-sm text-[#0f172a]">IT Systems</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#dcfce7] text-[#166534]">{semanticRelationships.itSystems.length}</span>
          </div>
        </button>
        {expandedSections.semanticItSystems && (
          <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Name</th>
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Vendor</th>
                  <th className="pb-2 font-medium" style={{ width: "120px" }}>Risk Level</th>
                  <th className="pb-2 font-medium">Deployed Locations</th>
                </tr>
              </thead>
              <tbody>
                {semanticRelationships.itSystems.map((app, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2 text-sm" style={{ width: "180px" }}>
                      <a href="#" className="text-[#266c92] hover:underline" data-testid={`link-semanticItSystems-${idx}`}>
                        {app.name}
                      </a>
                    </td>
                    <td className="py-2 text-sm text-[#64748b]" style={{ width: "180px" }}>{app.vendor}</td>
                    <td className="py-2 text-sm" style={{ width: "120px" }}>
                      <Badge variant={app.residualRisk === "High" ? "destructive" : app.residualRisk === "Medium" ? "secondary" : "outline"} className="text-xs">
                        {app.residualRisk}
                      </Badge>
                    </td>
                    <td className="py-2 text-sm text-[#64748b]">{app.deployedInLocations.length > 0 ? app.deployedInLocations.slice(0, 3).join(", ") + (app.deployedInLocations.length > 3 ? "..." : "") : "Cloud-based"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Semantic Vendors Section */}
      <div className="w-full mt-4">
        <button
          onClick={() => toggleSection("semanticVendors")}
          className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
            expandedSections.semanticVendors 
              ? "bg-[#f0fdf4] rounded-t" 
              : "bg-white rounded"
          }`}
          data-testid="accordion-semanticVendors"
        >
          {expandedSections.semanticVendors && (
            <div className="w-1 h-10 bg-[#22c55e] rounded-tl" />
          )}
          <div className={`flex items-center gap-4 ${expandedSections.semanticVendors ? "pl-3" : "pl-4"} pr-3 flex-1`}>
            <ChevronDown
              className={`w-3 h-3 text-[#64748b] transition-transform ${
                !expandedSections.semanticVendors ? "-rotate-90" : ""
              }`}
            />
            <span className="font-bold text-sm text-[#0f172a]">Vendors</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#dcfce7] text-[#166534]">{semanticRelationships.semanticVendors.length}</span>
          </div>
        </button>
        {expandedSections.semanticVendors && (
          <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Name</th>
                  <th className="pb-2 font-medium" style={{ width: "280px" }}>Products</th>
                  <th className="pb-2 font-medium">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {semanticRelationships.semanticVendors.map((vendor, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2 text-sm" style={{ width: "180px" }}>
                      <a href="#" className="text-[#266c92] hover:underline" data-testid={`link-semanticVendors-${idx}`}>
                        {vendor.name}
                      </a>
                    </td>
                    <td className="py-2 text-sm text-[#64748b]" style={{ width: "280px" }}>{vendor.products.slice(0, 3).join(", ")}{vendor.products.length > 3 ? "..." : ""}</td>
                    <td className="py-2 text-sm">
                      <Badge variant={vendor.residualRisk === "High" ? "destructive" : vendor.residualRisk === "Medium" ? "secondary" : "outline"} className="text-xs">
                        {vendor.residualRisk}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Semantic Business Units Section */}
      <div className="w-full mt-4">
        <button
          onClick={() => toggleSection("semanticTeams")}
          className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
            expandedSections.semanticTeams 
              ? "bg-[#f0fdf4] rounded-t" 
              : "bg-white rounded"
          }`}
          data-testid="accordion-semanticTeams"
        >
          {expandedSections.semanticTeams && (
            <div className="w-1 h-10 bg-[#22c55e] rounded-tl" />
          )}
          <div className={`flex items-center gap-4 ${expandedSections.semanticTeams ? "pl-3" : "pl-4"} pr-3 flex-1`}>
            <ChevronDown
              className={`w-3 h-3 text-[#64748b] transition-transform ${
                !expandedSections.semanticTeams ? "-rotate-90" : ""
              }`}
            />
            <span className="font-bold text-sm text-[#0f172a]">Business Units</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#dcfce7] text-[#166534]">{semanticRelationships.relatedTeams.length}</span>
          </div>
        </button>
        {expandedSections.semanticTeams && (
          <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Name</th>
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Type</th>
                  <th className="pb-2 font-medium">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {semanticRelationships.relatedTeams.map((team, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2 text-sm" style={{ width: "180px" }}>
                      <a href="#" className="text-[#266c92] hover:underline" data-testid={`link-semanticTeams-${idx}`}>
                        {team.name}
                      </a>
                    </td>
                    <td className="py-2 text-sm text-[#64748b]" style={{ width: "180px" }}>{team.type}</td>
                    <td className="py-2 text-sm">
                      <Badge variant={team.residualRisk === "High" ? "destructive" : team.residualRisk === "Medium" ? "secondary" : "outline"} className="text-xs">
                        {team.residualRisk}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Semantic Locations Section */}
      <div className="w-full mt-4">
        <button
          onClick={() => toggleSection("semanticLocations")}
          className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
            expandedSections.semanticLocations 
              ? "bg-[#f0fdf4] rounded-t" 
              : "bg-white rounded"
          }`}
          data-testid="accordion-semanticLocations"
        >
          {expandedSections.semanticLocations && (
            <div className="w-1 h-10 bg-[#22c55e] rounded-tl" />
          )}
          <div className={`flex items-center gap-4 ${expandedSections.semanticLocations ? "pl-3" : "pl-4"} pr-3 flex-1`}>
            <ChevronDown
              className={`w-3 h-3 text-[#64748b] transition-transform ${
                !expandedSections.semanticLocations ? "-rotate-90" : ""
              }`}
            />
            <span className="font-bold text-sm text-[#0f172a]">Locations</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#dcfce7] text-[#166534]">{semanticRelationships.deploymentLocations.length}</span>
          </div>
        </button>
        {expandedSections.semanticLocations && (
          <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Name</th>
                  <th className="pb-2 font-medium" style={{ width: "180px" }}>Type</th>
                  <th className="pb-2 font-medium">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {semanticRelationships.deploymentLocations.map((loc, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2 text-sm" style={{ width: "180px" }}>
                      <a href="#" className="text-[#266c92] hover:underline" data-testid={`link-semanticLocations-${idx}`}>
                        {loc.name}
                      </a>
                    </td>
                    <td className="py-2 text-sm text-[#64748b]" style={{ width: "180px" }}>{loc.type}</td>
                    <td className="py-2 text-sm">
                      <Badge variant={loc.residualRisk === "High" ? "destructive" : loc.residualRisk === "Medium" ? "secondary" : "outline"} className="text-xs">
                        {loc.residualRisk}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProcessDetail({ processId }: ProcessDetailProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const process = processData[processId];

  const LeftNavbar = () => (
    <aside
      className="flex flex-col w-14 items-center justify-between pt-2 pb-2.5 px-2 relative bg-gray-900"
      style={{ minHeight: "100vh" }}
      data-testid="side-navbar"
    >
      <nav className="flex flex-col items-center gap-1 relative flex-[0_0_auto]">
        <Link href="/">
          <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-logo">
            <img
              className="w-7 h-auto"
              alt="AuditBoard Logo"
              src="/figmaAssets/auditboard-logo.png?v=2"
            />
          </div>
        </Link>

        {navigationIcons.map((icon, index) => (
          <div
            key={index}
            className={`w-10 h-10 rounded flex items-center justify-center ${
              icon.active ? "bg-teal-500" : ""
            }`}
            data-testid={`navbar-icon-${index}`}
          >
            {icon.type === "lucide" ? (
              <div className="relative w-4 h-4 flex items-center justify-center">
                <RefreshCcw className="w-4 h-4 text-white absolute" />
                <Check className="w-2 h-2 text-white" strokeWidth={3} />
              </div>
            ) : (
              <img className={`w-4 h-4 ${icon.alt === "Plug" ? "opacity-50" : ""}`} alt={icon.alt} src={icon.src} />
            )}
          </div>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded flex items-center justify-center" data-testid="navbar-support">
          <img
            className="w-4 h-4"
            alt="Support"
            src="/figmaAssets/circle-question-.svg"
          />
        </div>
      </div>
    </aside>
  );

  if (!process) {
    return (
      <div className="flex items-start relative">
        <LeftNavbar />
        <div className="flex flex-col items-start relative flex-1 grow">
          <HeaderSection activeProcess={null} />
          <div className="flex items-start relative flex-1 self-stretch w-full grow">
            <SideNavigationSection />
            <div className="flex flex-col items-center justify-center flex-1 self-stretch bg-white p-8">
              <h1 className="text-2xl font-semibold text-gray-900">Process not found</h1>
              <Link href="/">
                <Button variant="link" className="mt-4 text-blue-600">
                  Back to Business Processes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start relative">
      <LeftNavbar />
      <div className="flex flex-col items-start relative flex-1 grow">
        <HeaderSection activeProcess={{ id: processId, name: process.name }} />
        <div className="flex items-start relative flex-1 self-stretch w-full grow">
          <SideNavigationSection />
          <div className="flex flex-col items-start relative flex-1 self-stretch grow bg-white min-w-0 overflow-y-auto" style={{ maxHeight: "calc(100vh - 60px)" }}>
          <header className="flex flex-col gap-4 py-6 px-8 w-full bg-white">
            <div className="flex gap-4 items-start w-full flex-wrap">
              <div className="flex flex-1 flex-col justify-center min-w-0">
                <h1 className="text-[28px] font-semibold text-gray-900 leading-[1.33]" data-testid="process-detail-title">
                  {process.name}
                </h1>
              </div>

              <div className="flex gap-2 items-center flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-[38px] w-[38px]"
                  data-testid="more-button"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>

            <div className="flex gap-1 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
                    activeTab === tab
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  data-testid={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Overview" && (
              <div className="flex gap-8 items-start flex-wrap py-4 pb-6 border-b border-gray-200">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 uppercase">Criticality</span>
                  <Badge
                    className={`text-[10px] font-semibold px-1.5 py-0 rounded-full ${
                      process.criticality === "High"
                        ? "bg-[#db3535] text-white hover:bg-[#db3535]"
                        : "bg-[#36844a] text-white hover:bg-[#36844a]"
                    }`}
                    data-testid="criticality-value"
                  >
                    {process.criticality}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 uppercase">RTO</span>
                  <span className="text-sm text-gray-900" data-testid="rto-value">{process.rto}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 uppercase">RPO</span>
                  <span className="text-sm text-gray-500" data-testid="rpo-value">{process.rpo}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 uppercase">Process Owner</span>
                  <span className="text-sm text-gray-900" data-testid="owner-value">{process.processOwner}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 uppercase">BIA Last Updated</span>
                  <span className="text-sm text-gray-900" data-testid="bia-updated-value">{process.biaLastUpdated}</span>
                </div>
              </div>
            )}
          </header>

          <main className="flex flex-col flex-1 w-full px-8 py-6">
            {activeTab === "Overview" && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Details</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Name</span>
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                      <span className="text-sm text-gray-900" data-testid="detail-name">{process.name}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Description</span>
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed" data-testid="detail-description">
                        {process.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Process Owner</span>
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                      <span className="text-sm text-gray-900" data-testid="detail-owner">{process.processOwner}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Business Units</span>
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                      <a href="#" className="text-sm text-blue-600 hover:underline" data-testid="detail-business-units">
                        {process.businessUnits}
                      </a>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Related Risks</span>
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                      <a href="#" className="text-sm text-blue-600 hover:underline" data-testid="detail-related-risks">
                        {process.relatedRisks}
                      </a>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Frameworks</span>
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                      <a href="#" className="text-sm text-blue-600 hover:underline" data-testid="detail-frameworks">
                        {process.frameworks}
                      </a>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Controls</span>
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                      <a href="#" className="text-sm text-blue-600 hover:underline" data-testid="detail-controls">
                        {process.controls}
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "Business Impact Analysis" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Financial Impact</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <Badge className={`text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit ${
                      process.bia.financialImpact === "High" ? "bg-[#db3535] text-white hover:bg-[#db3535]" :
                      process.bia.financialImpact === "Medium" ? "bg-[#f59e0b] text-white hover:bg-[#f59e0b]" :
                      "bg-[#36844a] text-white hover:bg-[#36844a]"
                    }`} data-testid="bia-financial-impact">
                      {process.bia.financialImpact}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Operational Impact</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <Badge className={`text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit ${
                      process.bia.operationalImpact === "High" ? "bg-[#db3535] text-white hover:bg-[#db3535]" :
                      process.bia.operationalImpact === "Medium" ? "bg-[#f59e0b] text-white hover:bg-[#f59e0b]" :
                      "bg-[#36844a] text-white hover:bg-[#36844a]"
                    }`} data-testid="bia-operational-impact">
                      {process.bia.operationalImpact}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Reputational Impact</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <Badge className={`text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit ${
                      process.bia.reputationalImpact === "High" ? "bg-[#db3535] text-white hover:bg-[#db3535]" :
                      process.bia.reputationalImpact === "Medium" ? "bg-[#f59e0b] text-white hover:bg-[#f59e0b]" :
                      "bg-[#36844a] text-white hover:bg-[#36844a]"
                    }`} data-testid="bia-reputational-impact">
                      {process.bia.reputationalImpact}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Legal Impact</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <Badge className={`text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit ${
                      process.bia.legalImpact === "High" ? "bg-[#db3535] text-white hover:bg-[#db3535]" :
                      process.bia.legalImpact === "Medium" ? "bg-[#f59e0b] text-white hover:bg-[#f59e0b]" :
                      "bg-[#36844a] text-white hover:bg-[#36844a]"
                    }`} data-testid="bia-legal-impact">
                      {process.bia.legalImpact}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Regulatory Impact</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <Badge className={`text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit ${
                      process.bia.regulatoryImpact === "High" ? "bg-[#db3535] text-white hover:bg-[#db3535]" :
                      process.bia.regulatoryImpact === "Medium" ? "bg-[#f59e0b] text-white hover:bg-[#f59e0b]" :
                      "bg-[#36844a] text-white hover:bg-[#36844a]"
                    }`} data-testid="bia-regulatory-impact">
                      {process.bia.regulatoryImpact}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Maximum Time Down (MTD)</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-mtd">{process.bia.mtd}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Recovery Time Objective (RTO)</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-rto">{process.bia.rto}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Recovery Point Objective (RPO)</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-rpo">{process.bia.rpo}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-last-updated">{process.biaLastUpdated}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Latest BIA Update</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <a href="#" className="text-sm text-blue-600 hover:underline" data-testid="bia-latest-update">View</a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Key Dependencies" && process.dependencies && (
              <KeyDependenciesContent dependencies={process.dependencies} ownerTeam={process.ownerTeam} />
            )}

            {activeTab === "Business Continuity Plan" && (
              <div className="text-sm text-gray-500">Business Continuity Plan content coming soon...</div>
            )}

            {activeTab === "Issues" && (
              <div className="text-sm text-gray-500">Issues content coming soon...</div>
            )}
          </main>
          </div>
        </div>
      </div>
    </div>
  );
}
