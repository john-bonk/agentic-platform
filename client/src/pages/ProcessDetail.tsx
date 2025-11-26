import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MoreHorizontal, Triangle, RefreshCcw, Check } from "lucide-react";
import { HeaderSection } from "./sections/HeaderSection";
import { SideNavigationSection } from "./sections/SideNavigationSection";

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

interface DependencyItem {
  name: string;
  type?: string;
  criticality?: "Critical" | "Important" | "Standard";
}

interface Dependencies {
  itSystems: DependencyItem[];
  businessUnits: DependencyItem[];
  vendors: DependencyItem[];
  locations: DependencyItem[];
  otherProcesses: DependencyItem[];
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
      itSystems: [
        { name: "Core Banking System (CBS)", type: "Application", criticality: "Critical" },
        { name: "Customer Relationship Management (CRM)", type: "Application", criticality: "Critical" },
        { name: "Identity Management System", type: "Security", criticality: "Critical" },
        { name: "Document Management System", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Retail Banking Operations", type: "Department", criticality: "Critical" },
        { name: "Customer Experience", type: "Department", criticality: "Important" },
        { name: "Compliance", type: "Department", criticality: "Important" },
      ],
      vendors: [
        { name: "Fiserv", type: "Core Banking Provider", criticality: "Critical" },
        { name: "Experian", type: "Credit Bureau", criticality: "Important" },
      ],
      locations: [
        { name: "Main Data Center - Dallas", type: "Primary", criticality: "Critical" },
        { name: "Backup Data Center - Phoenix", type: "Secondary", criticality: "Critical" },
      ],
      otherProcesses: [
        { name: "Customer Service and Support", criticality: "Important" },
        { name: "Payment Processing", criticality: "Critical" },
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
      itSystems: [
        { name: "Loan Origination System (LOS)", type: "Application", criticality: "Critical" },
        { name: "Credit Decision Engine", type: "Application", criticality: "Critical" },
        { name: "Document Management System", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Retail Banking Operations", type: "Department", criticality: "Critical" },
        { name: "Credit Risk Management", type: "Department", criticality: "Critical" },
        { name: "Loan Servicing", type: "Department", criticality: "Important" },
      ],
      vendors: [
        { name: "Equifax", type: "Credit Bureau", criticality: "Critical" },
        { name: "TransUnion", type: "Credit Bureau", criticality: "Critical" },
      ],
      locations: [
        { name: "Loan Processing Center - Chicago", type: "Primary", criticality: "Critical" },
      ],
      otherProcesses: [
        { name: "Account Management", criticality: "Important" },
        { name: "Payment Processing", criticality: "Critical" },
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
      itSystems: [
        { name: "Contact Center Platform", type: "Application", criticality: "Critical" },
        { name: "CRM System", type: "Application", criticality: "Critical" },
        { name: "Knowledge Base", type: "Application", criticality: "Important" },
        { name: "Ticketing System", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Retail Banking Operations", type: "Department", criticality: "Critical" },
        { name: "Customer Experience", type: "Department", criticality: "Critical" },
        { name: "Quality Assurance", type: "Department", criticality: "Standard" },
      ],
      vendors: [
        { name: "Genesys", type: "Contact Center Provider", criticality: "Critical" },
        { name: "Salesforce", type: "CRM Provider", criticality: "Critical" },
      ],
      locations: [
        { name: "Call Center - Tampa", type: "Primary", criticality: "Critical" },
        { name: "Call Center - Manila", type: "Secondary", criticality: "Important" },
      ],
      otherProcesses: [
        { name: "Account Management", criticality: "Critical" },
        { name: "Loan Origination and Servicing", criticality: "Important" },
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
      itSystems: [
        { name: "HR Information System (HRIS)", type: "Application", criticality: "Critical" },
        { name: "Active Directory", type: "Security", criticality: "Critical" },
        { name: "Learning Management System", type: "Application", criticality: "Important" },
        { name: "Background Check System", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Human Resources", type: "Department", criticality: "Critical" },
        { name: "Information Technology", type: "Department", criticality: "Critical" },
        { name: "All Departments", type: "Cross-functional", criticality: "Important" },
      ],
      vendors: [
        { name: "Workday", type: "HRIS Provider", criticality: "Critical" },
        { name: "Sterling", type: "Background Check Provider", criticality: "Important" },
      ],
      locations: [
        { name: "Corporate Headquarters - New York", type: "Primary", criticality: "Critical" },
      ],
      otherProcesses: [
        { name: "Payroll Processing", criticality: "Critical" },
        { name: "Benefits Administration", criticality: "Important" },
        { name: "Training & Development", criticality: "Important" },
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
      itSystems: [
        { name: "Payroll System", type: "Application", criticality: "Critical" },
        { name: "Time & Attendance System", type: "Application", criticality: "Critical" },
        { name: "General Ledger", type: "Application", criticality: "Critical" },
        { name: "Tax Filing System", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Human Resources", type: "Department", criticality: "Critical" },
        { name: "Finance", type: "Department", criticality: "Critical" },
        { name: "All Departments", type: "Cross-functional", criticality: "Important" },
      ],
      vendors: [
        { name: "ADP", type: "Payroll Provider", criticality: "Critical" },
        { name: "Bank of America", type: "Direct Deposit Provider", criticality: "Critical" },
      ],
      locations: [
        { name: "Finance Center - Atlanta", type: "Primary", criticality: "Critical" },
      ],
      otherProcesses: [
        { name: "Employee Onboarding and Offboarding", criticality: "Critical" },
        { name: "Benefits Administration", criticality: "Important" },
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
      itSystems: [
        { name: "Benefits Administration System", type: "Application", criticality: "Critical" },
        { name: "401k Portal", type: "Application", criticality: "Important" },
        { name: "Health Insurance Portal", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Human Resources", type: "Department", criticality: "Critical" },
        { name: "All Departments", type: "Cross-functional", criticality: "Important" },
      ],
      vendors: [
        { name: "Cigna", type: "Health Insurance Provider", criticality: "Critical" },
        { name: "Fidelity", type: "401k Administrator", criticality: "Critical" },
      ],
      locations: [
        { name: "HR Services Center - Denver", type: "Primary", criticality: "Critical" },
      ],
      otherProcesses: [
        { name: "Payroll Processing", criticality: "Critical" },
        { name: "Employee Onboarding and Offboarding", criticality: "Important" },
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
      itSystems: [
        { name: "Learning Management System (LMS)", type: "Application", criticality: "Critical" },
        { name: "Video Conferencing Platform", type: "Application", criticality: "Important" },
        { name: "Training Content Repository", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Human Resources", type: "Department", criticality: "Critical" },
        { name: "Learning & Development", type: "Department", criticality: "Critical" },
        { name: "All Departments", type: "Cross-functional", criticality: "Important" },
      ],
      vendors: [
        { name: "Cornerstone OnDemand", type: "LMS Provider", criticality: "Critical" },
        { name: "LinkedIn Learning", type: "Content Provider", criticality: "Standard" },
      ],
      locations: [
        { name: "Training Center - Boston", type: "Primary", criticality: "Important" },
      ],
      otherProcesses: [
        { name: "Employee Onboarding and Offboarding", criticality: "Critical" },
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
      itSystems: [
        { name: "Treasury Management System", type: "Application", criticality: "Critical" },
        { name: "Financial Planning & Analysis Tool", type: "Application", criticality: "Critical" },
        { name: "ERP System", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Treasury & Cash Management", type: "Department", criticality: "Critical" },
        { name: "Finance", type: "Department", criticality: "Critical" },
        { name: "Financial Planning & Analysis", type: "Department", criticality: "Important" },
      ],
      vendors: [
        { name: "Kyriba", type: "Treasury System Provider", criticality: "Critical" },
        { name: "Bloomberg", type: "Market Data Provider", criticality: "Important" },
      ],
      locations: [
        { name: "Treasury Operations Center - New York", type: "Primary", criticality: "Critical" },
      ],
      otherProcesses: [
        { name: "Liquidity Management", criticality: "Critical" },
        { name: "Payment Processing", criticality: "Important" },
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
      itSystems: [
        { name: "Treasury Management System", type: "Application", criticality: "Critical" },
        { name: "Real-time Cash Position Monitor", type: "Application", criticality: "Critical" },
        { name: "Investment Portfolio System", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Treasury & Cash Management", type: "Department", criticality: "Critical" },
        { name: "Risk Management", type: "Department", criticality: "Critical" },
        { name: "Finance", type: "Department", criticality: "Important" },
      ],
      vendors: [
        { name: "Federal Reserve Bank", type: "Central Bank", criticality: "Critical" },
        { name: "JP Morgan", type: "Correspondent Bank", criticality: "Critical" },
      ],
      locations: [
        { name: "Treasury Operations Center - New York", type: "Primary", criticality: "Critical" },
        { name: "Backup Trading Floor - London", type: "Secondary", criticality: "Critical" },
      ],
      otherProcesses: [
        { name: "Cash Flow Forecasting", criticality: "Critical" },
        { name: "Payment Processing", criticality: "Critical" },
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
      itSystems: [
        { name: "Payment Gateway", type: "Application", criticality: "Critical" },
        { name: "ACH Processing System", type: "Application", criticality: "Critical" },
        { name: "Wire Transfer System", type: "Application", criticality: "Critical" },
        { name: "Fraud Detection System", type: "Security", criticality: "Critical" },
      ],
      businessUnits: [
        { name: "Treasury & Cash Management", type: "Department", criticality: "Critical" },
        { name: "Fraud Prevention", type: "Department", criticality: "Critical" },
        { name: "Operations", type: "Department", criticality: "Important" },
      ],
      vendors: [
        { name: "Visa/Mastercard", type: "Card Network", criticality: "Critical" },
        { name: "SWIFT", type: "Payment Network", criticality: "Critical" },
        { name: "The Clearing House", type: "ACH Operator", criticality: "Critical" },
      ],
      locations: [
        { name: "Payment Operations Center - Charlotte", type: "Primary", criticality: "Critical" },
        { name: "Disaster Recovery Site - Dallas", type: "Secondary", criticality: "Critical" },
      ],
      otherProcesses: [
        { name: "Account Management", criticality: "Critical" },
        { name: "Liquidity Management", criticality: "Critical" },
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
      itSystems: [
        { name: "Deferred Compensation System", type: "Application", criticality: "Critical" },
        { name: "Executive Benefits Portal", type: "Application", criticality: "Important" },
      ],
      businessUnits: [
        { name: "Treasury & Cash Management", type: "Department", criticality: "Critical" },
        { name: "Executive Leadership", type: "Department", criticality: "Important" },
      ],
      vendors: [
        { name: "Northern Trust", type: "Executive Benefits Provider", criticality: "Critical" },
      ],
      locations: [
        { name: "Treasury Operations Center - New York", type: "Primary", criticality: "Critical" },
      ],
      otherProcesses: [
        { name: "Payroll Processing", criticality: "Important" },
        { name: "Cash Flow Forecasting", criticality: "Standard" },
      ],
    },
  },
};

const tabs = ["Overview", "Business Impact Analysis", "Key Dependencies", "Business Continuity Plan", "Issues"];

function KeyDependenciesContent({ dependencies }: { dependencies: Dependencies }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    itSystems: true,
    personnel: false,
    vendors: false,
    locations: false,
    otherProcesses: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getCriticalityBadge = (criticality?: "Critical" | "Important" | "Standard") => {
    if (!criticality) return null;
    
    const colors = {
      Critical: "bg-[#db3535] text-white",
      Important: "bg-[#f59e0b] text-white",
      Standard: "bg-[#6b7280] text-white",
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors[criticality]}`}>
        {criticality}
      </span>
    );
  };

  const sections = [
    { key: "itSystems", label: "IT Systems", items: dependencies.itSystems },
    { key: "businessUnits", label: "Business Units", items: dependencies.businessUnits },
    { key: "vendors", label: "Vendors", items: dependencies.vendors },
    { key: "locations", label: "Locations", items: dependencies.locations },
    { key: "otherProcesses", label: "Other Processes", items: dependencies.otherProcesses },
  ];

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => {
        const isExpanded = expandedSections[section.key];
        
        return (
          <div
            key={section.key}
            className="w-full"
          >
            <button
              onClick={() => toggleSection(section.key)}
              className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
                isExpanded 
                  ? "bg-[#f3fafb] rounded-t" 
                  : "bg-white rounded"
              }`}
              data-testid={`accordion-${section.key}`}
            >
              {isExpanded && (
                <div className="w-1 h-10 bg-[#266c92] rounded-tl" />
              )}
              <div className={`flex items-center gap-4 ${isExpanded ? "pl-3" : "pl-4"} pr-3 flex-1`}>
                <ChevronDown
                  className={`w-3 h-3 text-[#64748b] transition-transform ${
                    !isExpanded ? "-rotate-90" : ""
                  }`}
                />
                <span className="font-bold text-sm text-[#0f172a]">{section.label}</span>
                <span className="text-sm text-[#64748b]">({section.items.length})</span>
              </div>
            </button>

            {isExpanded && (
              <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white">
                {section.items.length > 0 ? (
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b">
                        <th className="pb-2 font-medium w-[45%]">Name</th>
                        {section.key !== "otherProcesses" && (
                          <th className="pb-2 font-medium w-[35%]">Type</th>
                        )}
                        <th className={`pb-2 font-medium ${section.key === "otherProcesses" ? "w-[55%]" : "w-[20%]"}`}>Criticality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="py-2 text-sm w-[45%]">
                            <a 
                              href="#" 
                              className="text-[#266c92] hover:underline"
                              data-testid={`link-${section.key}-${idx}`}
                            >
                              {item.name}
                            </a>
                          </td>
                          {section.key !== "otherProcesses" && (
                            <td className="py-2 text-sm text-[#64748b] w-[35%]">{item.type || "-"}</td>
                          )}
                          <td className={`py-2 ${section.key === "otherProcesses" ? "w-[55%]" : "w-[20%]"}`}>{getCriticalityBadge(item.criticality)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-sm text-gray-500">No items in this category</div>
                )}
              </div>
            )}
          </div>
        );
      })}
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
              <KeyDependenciesContent dependencies={process.dependencies} />
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
