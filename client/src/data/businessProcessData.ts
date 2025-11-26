export type ImpactLevel = "High" | "Medium" | "Low";

export interface ITAssetItem {
  name: string;
  description: string;
  recoveryTimeframe: string;
  recoveryGap: "met" | "gap";
  assetOwner: string;
}

export interface VendorItem {
  name: string;
  description: string;
  vendorContact: string;
}

export interface BusinessProcessItem {
  name: string;
  description: string;
  rto: string;
  processOwner: string;
}

export interface BranchItem {
  name: string;
  type: string;
}

export interface Dependencies {
  itAssets: ITAssetItem[];
  vendors: VendorItem[];
  businessProcesses: BusinessProcessItem[];
  branches: BranchItem[];
}

export interface ProcessDetail {
  id: string;
  name: string;
  description: string;
  processOwner: string;
  criticality: "High" | "Low";
  rto: string;
  rpo: string;
  biaLastUpdated: string;
  businessUnits: string;
  categoryId: string;
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
}

export interface Category {
  id: string;
  name: string;
  processes: ProcessDetail[];
}

export const businessProcessData: Category[] = [
  {
    id: "retail-banking",
    name: "Retail Banking Operations",
    processes: [
      {
        id: "1",
        name: "Account Management",
        description: "Account Management ensures the smooth and secure management of customer accounts, including account creation, updates, and closures. This process is critical to daily banking operations and customer satisfaction.",
        processOwner: "Baylor Cruz",
        criticality: "High",
        rto: "1 hour",
        rpo: "1 hour",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Retail Banking Operations",
        categoryId: "retail-banking",
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
      {
        id: "2",
        name: "Loan Origination and Servicing",
        description: "Loan Origination and Servicing handles the complete lifecycle of loans from application to repayment. This includes credit assessment, approval workflows, and ongoing loan management.",
        processOwner: "Baylor Cruz",
        criticality: "Low",
        rto: "30 mins",
        rpo: "30 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Retail Banking Operations",
        categoryId: "retail-banking",
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
      {
        id: "3",
        name: "Customer Service and Support",
        description: "Customer Service and Support provides assistance to customers through various channels including phone, email, and chat. This process handles inquiries, complaints, and service requests.",
        processOwner: "Baylor Cruz",
        criticality: "Low",
        rto: "24 hours",
        rpo: "24 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Retail Banking Operations",
        categoryId: "retail-banking",
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
    ],
  },
  {
    id: "human-resources",
    name: "Human Resources",
    processes: [
      {
        id: "4",
        name: "Employee Onboarding and Offboarding",
        description: "Employee Onboarding and Offboarding manages the complete employee lifecycle from hiring to separation. This includes provisioning access, training, and deprovisioning upon departure.",
        processOwner: "Dante Bradford",
        criticality: "Low",
        rto: "1 hour",
        rpo: "1 hour",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Human Resources",
        categoryId: "human-resources",
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
      {
        id: "5",
        name: "Payroll Processing",
        description: "Payroll Processing ensures accurate and timely payment of employee salaries, benefits, and deductions. This includes tax calculations and regulatory compliance.",
        processOwner: "Dante Bradford",
        criticality: "High",
        rto: "4 hours",
        rpo: "1 hour",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Human Resources",
        categoryId: "human-resources",
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
      {
        id: "6",
        name: "Benefits Administration",
        description: "Benefits Administration manages employee benefits including health insurance, retirement plans, and other perks. This process handles enrollment, changes, and claims processing.",
        processOwner: "Dante Bradford",
        criticality: "Low",
        rto: "24 hours",
        rpo: "12 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Human Resources",
        categoryId: "human-resources",
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
      {
        id: "7",
        name: "Training & Development",
        description: "Training & Development provides learning opportunities and skill development programs for employees. This includes onboarding training, compliance training, and professional development.",
        processOwner: "Dante Bradford",
        criticality: "Low",
        rto: "72 hours",
        rpo: "24 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Human Resources",
        categoryId: "human-resources",
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
    ],
  },
  {
    id: "treasury",
    name: "Treasury & Cash Management",
    processes: [
      {
        id: "8",
        name: "Cash Flow Forecasting",
        description: "Cash Flow Forecasting predicts future cash positions to ensure adequate liquidity. This process analyzes historical data and business projections to optimize cash management.",
        processOwner: "Leah Sullivan",
        criticality: "Low",
        rto: "8 hours",
        rpo: "4 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Treasury & Cash Management",
        categoryId: "treasury",
        ownerTeam: "Treasury Operations",
        relatedRisks: "Liquidity Risk, Financial Risk",
        frameworks: "Basel III, Internal risk management policies",
        controls: "CF-01 Daily Cash Position Review, CF-02 Variance Analysis, CF-03 Stress Testing, CF-04 Model Validation, CF-05 Forecast Accuracy Tracking",
        bia: {
          financialImpact: "Medium",
          operationalImpact: "Medium",
          reputationalImpact: "Low",
          legalImpact: "Low",
          regulatoryImpact: "Medium",
          mtd: "48 hours",
          rto: "8 hours",
          rpo: "4 hours",
        },
        dependencies: {
          itAssets: [
            { name: "Treasury Management System", description: "Cash forecasting and analysis", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Mark Taylor" },
            { name: "Business Intelligence Platform", description: "Reporting and analytics", recoveryTimeframe: "8 hours", recoveryGap: "met", assetOwner: "Mark Taylor" },
            { name: "ERP System", description: "Financial data integration", recoveryTimeframe: "12 hours", recoveryGap: "gap", assetOwner: "Mark Taylor" },
          ],
          vendors: [
            { name: "Kyriba", description: "Treasury Management Provider", vendorContact: "Paul Anderson" },
            { name: "Bloomberg", description: "Market Data Provider", vendorContact: "Paul Anderson" },
          ],
          businessProcesses: [
            { name: "Liquidity Management", description: "Cash position optimization.", rto: "2 hours", processOwner: "Leah Sullivan" },
            { name: "Payment Processing", description: "Outgoing payment forecasts.", rto: "1 hour", processOwner: "Leah Sullivan" },
          ],
          branches: [
            { name: "Treasury Operations Center - Charlotte", type: "Primary" },
          ],
        },
      },
      {
        id: "9",
        name: "Liquidity Management",
        description: "Liquidity Management ensures the organization maintains adequate cash reserves to meet obligations. This includes optimizing cash positions across accounts and managing short-term investments.",
        processOwner: "Leah Sullivan",
        criticality: "High",
        rto: "2 hours",
        rpo: "1 hour",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Treasury & Cash Management",
        categoryId: "treasury",
        ownerTeam: "Treasury Operations",
        relatedRisks: "Liquidity Risk, Market Risk",
        frameworks: "Basel III, Liquidity Coverage Ratio requirements",
        controls: "LQ-01 Daily Liquidity Ratio Monitoring, LQ-02 Counterparty Exposure Limits, LQ-03 Intraday Liquidity Reporting, LQ-04 Stress Testing, LQ-05 Contingency Funding Plan",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "High",
          legalImpact: "Medium",
          regulatoryImpact: "High",
          mtd: "4 hours",
          rto: "2 hours",
          rpo: "1 hour",
        },
        dependencies: {
          itAssets: [
            { name: "Liquidity Management System", description: "Real-time cash position monitoring", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Jennifer Wu" },
            { name: "SWIFT Network Interface", description: "International payment processing", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Jennifer Wu" },
            { name: "Market Data Terminal", description: "Real-time market rates", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Jennifer Wu" },
          ],
          vendors: [
            { name: "SWIFT", description: "Payment Network Provider", vendorContact: "Robert Chen" },
            { name: "Reuters", description: "Market Data Provider", vendorContact: "Robert Chen" },
          ],
          businessProcesses: [
            { name: "Cash Flow Forecasting", description: "Liquidity projection inputs.", rto: "8 hours", processOwner: "Leah Sullivan" },
            { name: "Payment Processing", description: "Payment execution coordination.", rto: "1 hour", processOwner: "Leah Sullivan" },
          ],
          branches: [
            { name: "Treasury Operations Center - Charlotte", type: "Primary" },
            { name: "London Treasury Office", type: "Secondary" },
          ],
        },
      },
      {
        id: "10",
        name: "Payment Processing",
        description: "Payment Processing handles all outgoing and incoming payment transactions. This includes wire transfers, ACH payments, and international transfers while ensuring compliance and fraud prevention.",
        processOwner: "Leah Sullivan",
        criticality: "High",
        rto: "1 hour",
        rpo: "30 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Treasury & Cash Management",
        categoryId: "treasury",
        ownerTeam: "Payment Operations",
        relatedRisks: "Fraud Risk, Operational Risk, Compliance Risk",
        frameworks: "PCI-DSS, NACHA rules, OFAC compliance",
        controls: "PP-01 Dual Authorization for Large Payments, PP-02 OFAC Screening, PP-03 Fraud Detection Algorithms, PP-04 Payment Reconciliation, PP-05 Audit Trail Maintenance",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "High",
          legalImpact: "High",
          regulatoryImpact: "High",
          mtd: "2 hours",
          rto: "1 hour",
          rpo: "30 mins",
        },
        dependencies: {
          itAssets: [
            { name: "Payment Gateway", description: "Payment routing and processing", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Alex Rivera" },
            { name: "Fraud Detection System", description: "Real-time transaction monitoring", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Alex Rivera" },
            { name: "Payment Reconciliation System", description: "Transaction matching and settlement", recoveryTimeframe: "2 hours", recoveryGap: "gap", assetOwner: "Alex Rivera" },
          ],
          vendors: [
            { name: "FIS Global", description: "Payment Processing Provider", vendorContact: "Sandra Lopez" },
            { name: "Federal Reserve", description: "Fedwire Access", vendorContact: "Sandra Lopez" },
          ],
          businessProcesses: [
            { name: "Account Management", description: "Customer account debit/credit.", rto: "1 hour", processOwner: "Baylor Cruz" },
            { name: "Loan Origination and Servicing", description: "Loan payment processing.", rto: "30 mins", processOwner: "Baylor Cruz" },
          ],
          branches: [
            { name: "Payment Operations Center - Jacksonville", type: "Primary" },
            { name: "Backup Payment Center - Dallas", type: "Secondary" },
          ],
        },
      },
      {
        id: "11",
        name: "Investment Management",
        description: "Investment Management handles short-term investment decisions for excess cash positions. This includes money market investments, commercial paper, and other liquid instruments.",
        processOwner: "Leah Sullivan",
        criticality: "Low",
        rto: "24 hours",
        rpo: "8 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Treasury & Cash Management",
        categoryId: "treasury",
        ownerTeam: "Investment Operations",
        relatedRisks: "Market Risk, Credit Risk, Liquidity Risk",
        frameworks: "Investment policy guidelines, Regulatory capital requirements",
        controls: "IM-01 Investment Policy Compliance Check, IM-02 Counterparty Credit Review, IM-03 Duration Limit Monitoring, IM-04 Daily Valuation, IM-05 Performance Attribution",
        bia: {
          financialImpact: "Medium",
          operationalImpact: "Low",
          reputationalImpact: "Low",
          legalImpact: "Low",
          regulatoryImpact: "Medium",
          mtd: "72 hours",
          rto: "24 hours",
          rpo: "8 hours",
        },
        dependencies: {
          itAssets: [
            { name: "Investment Management System", description: "Portfolio management and trading", recoveryTimeframe: "8 hours", recoveryGap: "met", assetOwner: "Michelle Lee" },
            { name: "Market Data Feed", description: "Real-time pricing data", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Michelle Lee" },
            { name: "Risk Analytics Platform", description: "Portfolio risk measurement", recoveryTimeframe: "12 hours", recoveryGap: "gap", assetOwner: "Michelle Lee" },
          ],
          vendors: [
            { name: "BlackRock Aladdin", description: "Investment Platform Provider", vendorContact: "James Park" },
            { name: "ICE Data Services", description: "Pricing Data Provider", vendorContact: "James Park" },
          ],
          businessProcesses: [
            { name: "Liquidity Management", description: "Cash allocation decisions.", rto: "2 hours", processOwner: "Leah Sullivan" },
            { name: "Cash Flow Forecasting", description: "Investment horizon planning.", rto: "8 hours", processOwner: "Leah Sullivan" },
          ],
          branches: [
            { name: "Investment Office - New York", type: "Primary" },
          ],
        },
      },
    ],
  },
  {
    id: "it-operations",
    name: "IT Operations",
    processes: [
      {
        id: "12",
        name: "Infrastructure Management",
        description: "Infrastructure Management oversees the organization's computing infrastructure including servers, networks, storage, and cloud resources. This process ensures high availability, performance optimization, and capacity planning.",
        processOwner: "Marcus Chen",
        criticality: "High",
        rto: "30 mins",
        rpo: "15 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Infrastructure",
        relatedRisks: "System Downtime, Data Loss, Security Breaches",
        frameworks: "ITIL, ISO 27001, SOC 2",
        controls: "IF-01 Server Health Monitoring, IF-02 Network Redundancy Verification, IF-03 Capacity Threshold Alerts, IF-04 Disaster Recovery Testing, IF-05 Change Management Approval",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "High",
          legalImpact: "Medium",
          regulatoryImpact: "High",
          mtd: "1 hour",
          rto: "30 mins",
          rpo: "15 mins",
        },
        dependencies: {
          itAssets: [
            { name: "AWS Cloud Infrastructure", description: "Primary cloud hosting platform", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Marcus Chen" },
            { name: "Kubernetes Cluster", description: "Container orchestration platform", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Marcus Chen" },
            { name: "Terraform Configuration", description: "Infrastructure as code management", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Marcus Chen" },
            { name: "Datadog Monitoring", description: "Infrastructure monitoring and alerting", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Marcus Chen" },
          ],
          vendors: [
            { name: "Amazon Web Services", description: "Cloud Infrastructure Provider", vendorContact: "Technical Account Manager" },
            { name: "Datadog", description: "Monitoring Platform Provider", vendorContact: "Support Team" },
            { name: "HashiCorp", description: "Infrastructure Automation Provider", vendorContact: "Enterprise Support" },
          ],
          businessProcesses: [
            { name: "Incident Management", description: "Infrastructure incident response.", rto: "15 mins", processOwner: "Marcus Chen" },
            { name: "Change Management", description: "Infrastructure change coordination.", rto: "4 hours", processOwner: "Marcus Chen" },
          ],
          branches: [
            { name: "Primary Data Center - AWS US-East-1", type: "Primary" },
            { name: "DR Site - AWS US-West-2", type: "Secondary" },
          ],
        },
      },
      {
        id: "13",
        name: "Incident Management",
        description: "Incident Management handles the detection, response, and resolution of IT incidents. This process ensures minimal service disruption through structured escalation procedures and root cause analysis.",
        processOwner: "Marcus Chen",
        criticality: "High",
        rto: "15 mins",
        rpo: "5 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Site Reliability",
        relatedRisks: "Service Disruption, Customer Impact, SLA Violations",
        frameworks: "ITIL, ISO 20000",
        controls: "IM-01 24/7 On-Call Rotation, IM-02 Incident Severity Classification, IM-03 Escalation Matrix, IM-04 Post-Incident Review, IM-05 Communication Protocol",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "High",
          legalImpact: "Medium",
          regulatoryImpact: "Medium",
          mtd: "30 mins",
          rto: "15 mins",
          rpo: "5 mins",
        },
        dependencies: {
          itAssets: [
            { name: "PagerDuty", description: "Incident alerting and on-call management", recoveryTimeframe: "5 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
            { name: "Slack", description: "Team communication and incident channels", recoveryTimeframe: "10 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
            { name: "Jira Service Management", description: "Incident ticketing system", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
            { name: "Splunk", description: "Log analysis and investigation", recoveryTimeframe: "1 hour", recoveryGap: "gap", assetOwner: "Sarah Kim" },
          ],
          vendors: [
            { name: "PagerDuty", description: "Incident Response Platform", vendorContact: "Enterprise Support" },
            { name: "Atlassian", description: "ITSM Platform Provider", vendorContact: "Support Team" },
            { name: "Splunk", description: "Log Analytics Provider", vendorContact: "Technical Support" },
          ],
          businessProcesses: [
            { name: "Infrastructure Management", description: "Infrastructure incident escalation.", rto: "30 mins", processOwner: "Marcus Chen" },
            { name: "Application Support", description: "Application-level incident coordination.", rto: "1 hour", processOwner: "Marcus Chen" },
          ],
          branches: [
            { name: "NOC - San Francisco", type: "Primary" },
            { name: "NOC - London", type: "Secondary" },
          ],
        },
      },
      {
        id: "14",
        name: "Change Management",
        description: "Change Management controls modifications to IT systems and infrastructure. This process ensures changes are properly tested, approved, and documented to minimize risk and maintain system stability.",
        processOwner: "Marcus Chen",
        criticality: "Low",
        rto: "4 hours",
        rpo: "1 hour",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Release Management",
        relatedRisks: "Unplanned Outages, Configuration Drift, Compliance Violations",
        frameworks: "ITIL, SOX, Change Advisory Board procedures",
        controls: "CM-01 Change Request Documentation, CM-02 Impact Assessment, CM-03 CAB Approval, CM-04 Rollback Plan Verification, CM-05 Post-Implementation Review",
        bia: {
          financialImpact: "Medium",
          operationalImpact: "Medium",
          reputationalImpact: "Low",
          legalImpact: "Medium",
          regulatoryImpact: "High",
          mtd: "24 hours",
          rto: "4 hours",
          rpo: "1 hour",
        },
        dependencies: {
          itAssets: [
            { name: "ServiceNow", description: "Change management workflow system", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Kevin Park" },
            { name: "GitHub Enterprise", description: "Source code and change tracking", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Kevin Park" },
            { name: "Jenkins", description: "CI/CD pipeline automation", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Kevin Park" },
          ],
          vendors: [
            { name: "ServiceNow", description: "ITSM Platform Provider", vendorContact: "Account Manager" },
            { name: "GitHub", description: "Source Control Provider", vendorContact: "Enterprise Support" },
          ],
          businessProcesses: [
            { name: "Infrastructure Management", description: "Infrastructure change implementation.", rto: "30 mins", processOwner: "Marcus Chen" },
            { name: "Software Deployment", description: "Application release coordination.", rto: "2 hours", processOwner: "Priya Sharma" },
          ],
          branches: [
            { name: "IT Operations Center - Austin", type: "Primary" },
          ],
        },
      },
      {
        id: "15",
        name: "Application Support",
        description: "Application Support maintains and troubleshoots business applications. This process handles application performance, bug fixes, and user support to ensure optimal system functionality.",
        processOwner: "Marcus Chen",
        criticality: "High",
        rto: "1 hour",
        rpo: "30 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Application Support",
        relatedRisks: "Application Downtime, Data Corruption, User Productivity Loss",
        frameworks: "ITIL, Application Lifecycle Management",
        controls: "AS-01 Application Health Checks, AS-02 Error Log Monitoring, AS-03 Database Performance Tuning, AS-04 User Issue Triage, AS-05 Hotfix Deployment Protocol",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "Medium",
          legalImpact: "Low",
          regulatoryImpact: "Medium",
          mtd: "2 hours",
          rto: "1 hour",
          rpo: "30 mins",
        },
        dependencies: {
          itAssets: [
            { name: "New Relic APM", description: "Application performance monitoring", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Lisa Wong" },
            { name: "PostgreSQL Database", description: "Primary application database", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Lisa Wong" },
            { name: "Redis Cache", description: "Application caching layer", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Lisa Wong" },
            { name: "Elasticsearch", description: "Search and logging infrastructure", recoveryTimeframe: "2 hours", recoveryGap: "gap", assetOwner: "Lisa Wong" },
          ],
          vendors: [
            { name: "New Relic", description: "APM Provider", vendorContact: "Technical Support" },
            { name: "Elastic", description: "Search Platform Provider", vendorContact: "Support Team" },
          ],
          businessProcesses: [
            { name: "Incident Management", description: "Application incident escalation.", rto: "15 mins", processOwner: "Marcus Chen" },
            { name: "Software Deployment", description: "Application update coordination.", rto: "2 hours", processOwner: "Priya Sharma" },
          ],
          branches: [
            { name: "Application Support Center - Seattle", type: "Primary" },
          ],
        },
      },
      {
        id: "16",
        name: "Security Operations",
        description: "Security Operations monitors and protects IT systems from security threats. This process includes threat detection, vulnerability management, security incident response, and compliance monitoring.",
        processOwner: "Marcus Chen",
        criticality: "High",
        rto: "15 mins",
        rpo: "5 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Security Operations Center",
        relatedRisks: "Data Breach, Ransomware, Insider Threats, Compliance Violations",
        frameworks: "NIST Cybersecurity Framework, ISO 27001, SOC 2, PCI-DSS",
        controls: "SO-01 24/7 Security Monitoring, SO-02 Intrusion Detection, SO-03 Vulnerability Scanning, SO-04 Security Incident Response, SO-05 Penetration Testing",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "High",
          legalImpact: "High",
          regulatoryImpact: "High",
          mtd: "30 mins",
          rto: "15 mins",
          rpo: "5 mins",
        },
        dependencies: {
          itAssets: [
            { name: "CrowdStrike Falcon", description: "Endpoint detection and response", recoveryTimeframe: "10 mins", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "Okta Identity", description: "Identity and access management", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "Splunk SIEM", description: "Security information and event management", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "Qualys Scanner", description: "Vulnerability assessment platform", recoveryTimeframe: "2 hours", recoveryGap: "gap", assetOwner: "James Liu" },
          ],
          vendors: [
            { name: "CrowdStrike", description: "Endpoint Security Provider", vendorContact: "Security Team" },
            { name: "Okta", description: "Identity Provider", vendorContact: "Enterprise Support" },
            { name: "Splunk", description: "SIEM Provider", vendorContact: "Security Support" },
          ],
          businessProcesses: [
            { name: "Incident Management", description: "Security incident coordination.", rto: "15 mins", processOwner: "Marcus Chen" },
            { name: "Infrastructure Management", description: "Security infrastructure protection.", rto: "30 mins", processOwner: "Marcus Chen" },
          ],
          branches: [
            { name: "Security Operations Center - Denver", type: "Primary" },
            { name: "SOC - Singapore", type: "Secondary" },
          ],
        },
      },
    ],
  },
  {
    id: "product-development",
    name: "Product Development",
    processes: [
      {
        id: "17",
        name: "Software Development Lifecycle",
        description: "Software Development Lifecycle manages the end-to-end process of building software products. This includes requirements gathering, design, development, testing, and deployment following agile methodologies.",
        processOwner: "Priya Sharma",
        criticality: "High",
        rto: "4 hours",
        rpo: "1 hour",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "Engineering",
        relatedRisks: "Delivery Delays, Technical Debt, Quality Issues",
        frameworks: "Agile/Scrum, DevOps practices, SDLC best practices",
        controls: "SD-01 Sprint Planning Review, SD-02 Code Review Requirements, SD-03 Automated Testing Coverage, SD-04 Definition of Done Checklist, SD-05 Technical Design Review",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "Medium",
          legalImpact: "Low",
          regulatoryImpact: "Low",
          mtd: "8 hours",
          rto: "4 hours",
          rpo: "1 hour",
        },
        dependencies: {
          itAssets: [
            { name: "GitHub Enterprise", description: "Source code repository and collaboration", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Priya Sharma" },
            { name: "Jira", description: "Project and issue tracking", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Priya Sharma" },
            { name: "Confluence", description: "Documentation and knowledge base", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Priya Sharma" },
            { name: "Figma", description: "Design collaboration platform", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Priya Sharma" },
          ],
          vendors: [
            { name: "GitHub", description: "Source Control Provider", vendorContact: "Enterprise Support" },
            { name: "Atlassian", description: "Project Management Provider", vendorContact: "Account Manager" },
            { name: "Figma", description: "Design Tool Provider", vendorContact: "Enterprise Support" },
          ],
          businessProcesses: [
            { name: "Software Deployment", description: "Release and deployment coordination.", rto: "2 hours", processOwner: "Priya Sharma" },
            { name: "Quality Assurance", description: "Testing and quality validation.", rto: "4 hours", processOwner: "Priya Sharma" },
          ],
          branches: [
            { name: "Engineering Office - San Francisco", type: "Primary" },
            { name: "Engineering Office - Bangalore", type: "Secondary" },
          ],
        },
      },
      {
        id: "18",
        name: "Software Deployment",
        description: "Software Deployment manages the release of code changes to production environments. This process includes CI/CD pipeline management, deployment automation, feature flags, and rollback procedures.",
        processOwner: "Priya Sharma",
        criticality: "High",
        rto: "2 hours",
        rpo: "30 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "DevOps",
        relatedRisks: "Deployment Failures, Service Disruption, Configuration Errors",
        frameworks: "DevOps, GitOps, Continuous Deployment best practices",
        controls: "DP-01 Automated CI/CD Pipeline, DP-02 Staging Environment Validation, DP-03 Canary Deployment Strategy, DP-04 Automated Rollback Triggers, DP-05 Deployment Approval Gates",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "Medium",
          legalImpact: "Low",
          regulatoryImpact: "Medium",
          mtd: "4 hours",
          rto: "2 hours",
          rpo: "30 mins",
        },
        dependencies: {
          itAssets: [
            { name: "GitHub Actions", description: "CI/CD automation platform", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "David Martinez" },
            { name: "ArgoCD", description: "GitOps continuous delivery", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "David Martinez" },
            { name: "Docker Registry", description: "Container image repository", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "David Martinez" },
            { name: "LaunchDarkly", description: "Feature flag management", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "David Martinez" },
          ],
          vendors: [
            { name: "GitHub", description: "CI/CD Platform Provider", vendorContact: "Enterprise Support" },
            { name: "LaunchDarkly", description: "Feature Flag Provider", vendorContact: "Technical Support" },
          ],
          businessProcesses: [
            { name: "Software Development Lifecycle", description: "Code ready for deployment.", rto: "4 hours", processOwner: "Priya Sharma" },
            { name: "Change Management", description: "Deployment change approval.", rto: "4 hours", processOwner: "Marcus Chen" },
          ],
          branches: [
            { name: "DevOps Center - Austin", type: "Primary" },
          ],
        },
      },
      {
        id: "19",
        name: "Quality Assurance",
        description: "Quality Assurance ensures software quality through comprehensive testing strategies. This includes automated testing, manual testing, performance testing, and security testing before releases.",
        processOwner: "Priya Sharma",
        criticality: "High",
        rto: "4 hours",
        rpo: "2 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "QA Engineering",
        relatedRisks: "Quality Defects, Customer Complaints, Regression Issues",
        frameworks: "ISTQB, Test Automation best practices",
        controls: "QA-01 Test Coverage Requirements, QA-02 Automated Regression Suite, QA-03 Performance Benchmark Tests, QA-04 Security Scan Integration, QA-05 Bug Triage Process",
        bia: {
          financialImpact: "Medium",
          operationalImpact: "High",
          reputationalImpact: "High",
          legalImpact: "Low",
          regulatoryImpact: "Medium",
          mtd: "8 hours",
          rto: "4 hours",
          rpo: "2 hours",
        },
        dependencies: {
          itAssets: [
            { name: "Cypress", description: "End-to-end testing framework", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Anna Thompson" },
            { name: "Jest", description: "Unit testing framework", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Anna Thompson" },
            { name: "BrowserStack", description: "Cross-browser testing platform", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Anna Thompson" },
            { name: "k6", description: "Load testing platform", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Anna Thompson" },
          ],
          vendors: [
            { name: "BrowserStack", description: "Testing Platform Provider", vendorContact: "Support Team" },
            { name: "Grafana Labs", description: "k6 Testing Provider", vendorContact: "Enterprise Support" },
          ],
          businessProcesses: [
            { name: "Software Development Lifecycle", description: "Code quality validation.", rto: "4 hours", processOwner: "Priya Sharma" },
            { name: "Software Deployment", description: "Pre-deployment testing.", rto: "2 hours", processOwner: "Priya Sharma" },
          ],
          branches: [
            { name: "QA Center - Portland", type: "Primary" },
          ],
        },
      },
      {
        id: "20",
        name: "Product Management",
        description: "Product Management defines product vision, strategy, and roadmap. This process includes market research, feature prioritization, stakeholder alignment, and product metrics tracking.",
        processOwner: "Priya Sharma",
        criticality: "Low",
        rto: "24 hours",
        rpo: "8 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "Product",
        relatedRisks: "Market Misalignment, Feature Creep, Competitive Pressure",
        frameworks: "Product-Led Growth, OKR methodology",
        controls: "PM-01 Roadmap Review Cadence, PM-02 Customer Feedback Analysis, PM-03 Feature Prioritization Framework, PM-04 Stakeholder Communication, PM-05 Product Metrics Dashboard",
        bia: {
          financialImpact: "Medium",
          operationalImpact: "Low",
          reputationalImpact: "Medium",
          legalImpact: "Low",
          regulatoryImpact: "Low",
          mtd: "72 hours",
          rto: "24 hours",
          rpo: "8 hours",
        },
        dependencies: {
          itAssets: [
            { name: "Productboard", description: "Product management platform", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Michael Ross" },
            { name: "Amplitude", description: "Product analytics platform", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Michael Ross" },
            { name: "Notion", description: "Product documentation and specs", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Michael Ross" },
            { name: "Miro", description: "Collaborative whiteboarding", recoveryTimeframe: "4 hours", recoveryGap: "gap", assetOwner: "Michael Ross" },
          ],
          vendors: [
            { name: "Productboard", description: "Product Management Provider", vendorContact: "Customer Success" },
            { name: "Amplitude", description: "Analytics Provider", vendorContact: "Support Team" },
            { name: "Notion", description: "Workspace Provider", vendorContact: "Enterprise Support" },
          ],
          businessProcesses: [
            { name: "Software Development Lifecycle", description: "Feature requirements handoff.", rto: "4 hours", processOwner: "Priya Sharma" },
            { name: "UX Research and Design", description: "Design collaboration.", rto: "8 hours", processOwner: "Priya Sharma" },
          ],
          branches: [
            { name: "Product Office - San Francisco", type: "Primary" },
          ],
        },
      },
      {
        id: "21",
        name: "UX Research and Design",
        description: "UX Research and Design creates user-centered product experiences. This process includes user research, interaction design, visual design, prototyping, and usability testing.",
        processOwner: "Priya Sharma",
        criticality: "Low",
        rto: "8 hours",
        rpo: "4 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "Design",
        relatedRisks: "Poor User Experience, Design Inconsistency, Accessibility Issues",
        frameworks: "Design Thinking, WCAG Accessibility Guidelines",
        controls: "UX-01 User Research Validation, UX-02 Design System Compliance, UX-03 Accessibility Audit, UX-04 Usability Testing Protocol, UX-05 Design Review Process",
        bia: {
          financialImpact: "Low",
          operationalImpact: "Medium",
          reputationalImpact: "Medium",
          legalImpact: "Low",
          regulatoryImpact: "Low",
          mtd: "48 hours",
          rto: "8 hours",
          rpo: "4 hours",
        },
        dependencies: {
          itAssets: [
            { name: "Figma", description: "UI/UX design and prototyping", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Emma Wilson" },
            { name: "UserTesting", description: "Remote usability testing platform", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Emma Wilson" },
            { name: "Hotjar", description: "User behavior analytics", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Emma Wilson" },
            { name: "Zeplin", description: "Design handoff platform", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Emma Wilson" },
          ],
          vendors: [
            { name: "Figma", description: "Design Platform Provider", vendorContact: "Enterprise Support" },
            { name: "UserTesting", description: "Research Platform Provider", vendorContact: "Account Manager" },
          ],
          businessProcesses: [
            { name: "Product Management", description: "Feature design requirements.", rto: "24 hours", processOwner: "Priya Sharma" },
            { name: "Software Development Lifecycle", description: "Design implementation handoff.", rto: "4 hours", processOwner: "Priya Sharma" },
          ],
          branches: [
            { name: "Design Studio - New York", type: "Primary" },
          ],
        },
      },
    ],
  },
];

export function getProcessById(id: string): ProcessDetail | undefined {
  for (const category of businessProcessData) {
    const process = category.processes.find(p => p.id === id);
    if (process) return process;
  }
  return undefined;
}

export function getAllProcesses(): ProcessDetail[] {
  return businessProcessData.flatMap(category => category.processes);
}
