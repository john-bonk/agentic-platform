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

export interface IssueItem {
  id: string;
  title: string;
  location: string;
  status: "Pending remediation" | "In progress" | "Resolved" | "Open";
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
    costPerHour?: string;
    costPerDay?: string;
  };
  dependencies: Dependencies;
  issues?: IssueItem[];
}

export interface Category {
  id: string;
  name: string;
  processes: ProcessDetail[];
}

// Business Continuity Plan interface
export interface BusinessContinuityPlan {
  id: string;
  name: string;
  planOwner: string;
  planType: "create" | "import";
  importFileName?: string;
  processIds: string[];
  reviewGranularity: "entire" | "section";
  reviewType: "single" | "nonsequential" | "sequential";
  status: "Draft" | "In Review" | "Approved";
  createdAt: string;
  originProcessId: string;
}

// In-memory storage for BCPs with subscription support
let bcpStorage: BusinessContinuityPlan[] = [];
let bcpIdCounter = 1;
const bcpListeners = new Set<() => void>();

export function subscribeToBCPs(listener: () => void): () => void {
  bcpListeners.add(listener);
  listener();
  return () => {
    bcpListeners.delete(listener);
  };
}

function notifyBCPListeners() {
  bcpListeners.forEach((listener) => listener());
}

export function createBCP(bcp: Omit<BusinessContinuityPlan, "id" | "createdAt" | "status">): BusinessContinuityPlan {
  const newBCP: BusinessContinuityPlan = {
    ...bcp,
    id: `bcp-${bcpIdCounter++}`,
    status: "Draft",
    createdAt: new Date().toISOString(),
  };
  bcpStorage.push(newBCP);
  notifyBCPListeners();
  return newBCP;
}

export function getAllBCPs(): BusinessContinuityPlan[] {
  return [...bcpStorage];
}

export function getBCPById(id: string): BusinessContinuityPlan | undefined {
  return bcpStorage.find((bcp) => bcp.id === id);
}

export function getBCPsByProcessId(processId: string): BusinessContinuityPlan[] {
  return bcpStorage.filter((bcp) => bcp.processIds.includes(processId) || bcp.originProcessId === processId);
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
        issues: [
          { id: "1#228", title: "Lack of Baseline of Network Operations & Expected Data Flows", location: "Cerritos", status: "Pending remediation" },
          { id: "1#229", title: "Insufficient Access Control Monitoring", location: "Los Angeles", status: "Pending remediation" },
        ],
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
        issues: [
          { id: "2#145", title: "Credit Decision Engine Response Time Degradation", location: "Chicago", status: "In progress" },
        ],
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
        issues: [
          { id: "3#301", title: "Customer Data Validation Gaps in CRM System", location: "Tampa", status: "Open" },
        ],
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
        issues: [
          { id: "5#412", title: "Time & Attendance System Integration Failure", location: "Atlanta", status: "Pending remediation" },
          { id: "5#413", title: "Tax Calculation Module Requires Update for Q4 Regulations", location: "Atlanta", status: "In progress" },
        ],
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
        issues: [
          { id: "10#501", title: "OFAC Screening List Update Delay - Compliance Gap", location: "Jacksonville", status: "Open" },
          { id: "10#502", title: "Payment Reconciliation System Nightly Batch Failures", location: "Dallas", status: "In progress" },
        ],
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
        description: "Infrastructure Management oversees the organization's computing infrastructure including servers, networks, storage, and cloud resources. This process ensures high availability, performance optimization, and capacity planning for all business-critical systems.",
        processOwner: "Marcus Chen",
        criticality: "High",
        rto: "1 hour",
        rpo: "30 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Infrastructure Engineering",
        relatedRisks: "System Downtime, Data Loss, Security Breaches, Capacity Constraints",
        frameworks: "ITIL, ISO 27001, SOC 2, NIST",
        controls: "IF-01 Server Health Monitoring, IF-02 Network Redundancy Verification, IF-03 Capacity Threshold Alerts, IF-04 Disaster Recovery Testing, IF-05 Change Management Approval",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "High",
          legalImpact: "Medium",
          regulatoryImpact: "High",
          mtd: "2 hours",
          rto: "1 hour",
          rpo: "30 mins",
          costPerHour: "$125,000",
          costPerDay: "$3,000,000",
        },
        dependencies: {
          itAssets: [
            { name: "AWS Cloud Infrastructure", description: "Primary cloud hosting platform with EC2, ECS, and Lambda services", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Marcus Chen" },
            { name: "Kubernetes Cluster", description: "Container orchestration platform running 200+ microservices", recoveryTimeframe: "45 mins", recoveryGap: "met", assetOwner: "Marcus Chen" },
            { name: "Terraform Configuration", description: "Infrastructure as code for automated provisioning", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Marcus Chen" },
            { name: "Datadog Monitoring", description: "Real-time infrastructure metrics and alerting", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Marcus Chen" },
            { name: "Azure Cloud Services", description: "Secondary cloud provider for multi-cloud strategy", recoveryTimeframe: "45 mins", recoveryGap: "met", assetOwner: "Marcus Chen" },
            { name: "Cloudflare CDN", description: "Content delivery and DDoS protection", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Marcus Chen" },
            { name: "VMware vSphere", description: "On-premise virtualization platform", recoveryTimeframe: "2 hours", recoveryGap: "gap", assetOwner: "Marcus Chen" },
            { name: "Ansible Automation", description: "Configuration management and automation", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Marcus Chen" },
          ],
          vendors: [
            { name: "Amazon Web Services", description: "Primary Cloud Infrastructure Provider", vendorContact: "Sarah Thompson - TAM" },
            { name: "Microsoft Azure", description: "Secondary Cloud Provider", vendorContact: "Mike Reynolds - CSM" },
            { name: "Datadog", description: "Observability Platform Provider", vendorContact: "Jennifer Wu - Support" },
            { name: "HashiCorp", description: "Infrastructure Automation Provider", vendorContact: "David Park - Enterprise" },
            { name: "Cloudflare", description: "CDN and Security Provider", vendorContact: "Lisa Chen - Account Exec" },
            { name: "VMware", description: "Virtualization Provider", vendorContact: "Robert Kim - Support" },
          ],
          businessProcesses: [
            { name: "Payment Processing", description: "Critical infrastructure for payment gateway and transaction systems.", rto: "1 hour", processOwner: "Leah Sullivan" },
            { name: "Account Management", description: "Core banking system infrastructure support.", rto: "1 hour", processOwner: "Baylor Cruz" },
            { name: "Incident Management", description: "Infrastructure incident response and escalation.", rto: "30 mins", processOwner: "Sarah Kim" },
            { name: "Security Operations", description: "Infrastructure security monitoring and threat response.", rto: "1 hour", processOwner: "James Liu" },
          ],
          branches: [
            { name: "Primary Data Center - AWS US-East-1", type: "Primary" },
            { name: "DR Site - AWS US-West-2", type: "Secondary" },
            { name: "Edge Location - AWS EU-West-1", type: "Edge" },
            { name: "On-Premise DC - Dallas", type: "Hybrid" },
          ],
        },
      },
      {
        id: "13",
        name: "Incident Management",
        description: "Incident Management handles the detection, response, and resolution of IT incidents impacting business operations. This process ensures minimal service disruption through structured escalation procedures, real-time communication, and root cause analysis.",
        processOwner: "Sarah Kim",
        criticality: "High",
        rto: "30 mins",
        rpo: "15 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Site Reliability Engineering",
        relatedRisks: "Service Disruption, Customer Impact, SLA Violations, Revenue Loss",
        frameworks: "ITIL, ISO 20000, SRE Practices",
        controls: "IM-01 24/7 On-Call Rotation, IM-02 Incident Severity Classification, IM-03 Escalation Matrix, IM-04 Post-Incident Review, IM-05 Communication Protocol",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "High",
          legalImpact: "Medium",
          regulatoryImpact: "Medium",
          mtd: "1 hour",
          rto: "30 mins",
          rpo: "15 mins",
          costPerHour: "$85,000",
          costPerDay: "$2,040,000",
        },
        dependencies: {
          itAssets: [
            { name: "PagerDuty", description: "24/7 incident alerting and on-call rotation management", recoveryTimeframe: "5 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
            { name: "Slack", description: "Real-time team communication and dedicated incident channels", recoveryTimeframe: "10 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
            { name: "Jira Service Management", description: "Incident ticketing, tracking, and workflow automation", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
            { name: "Splunk", description: "Centralized log aggregation and analysis for root cause investigation", recoveryTimeframe: "1 hour", recoveryGap: "gap", assetOwner: "Sarah Kim" },
            { name: "Zoom", description: "Video conferencing for incident war rooms", recoveryTimeframe: "5 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
            { name: "StatusPage", description: "External status communication to customers", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
            { name: "Opsgenie", description: "Backup alerting platform for redundancy", recoveryTimeframe: "10 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
            { name: "Grafana", description: "Metrics visualization and dashboards", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Sarah Kim" },
          ],
          vendors: [
            { name: "PagerDuty", description: "Incident Response Platform", vendorContact: "Alex Rivera - Enterprise Support" },
            { name: "Atlassian", description: "ITSM and Collaboration Suite", vendorContact: "Maria Santos - Account Manager" },
            { name: "Splunk", description: "Log Analytics Provider", vendorContact: "Kevin Chang - Technical Support" },
            { name: "Zoom", description: "Video Communications Provider", vendorContact: "Enterprise Support Line" },
            { name: "Slack", description: "Team Messaging Platform", vendorContact: "Business Support Team" },
          ],
          businessProcesses: [
            { name: "Payment Processing", description: "Critical payment system incident coordination and escalation.", rto: "1 hour", processOwner: "Leah Sullivan" },
            { name: "Customer Service and Support", description: "Customer-facing incident communication and status updates.", rto: "4 hours", processOwner: "Baylor Cruz" },
            { name: "Infrastructure Management", description: "Infrastructure incident escalation and coordination.", rto: "1 hour", processOwner: "Marcus Chen" },
            { name: "Security Operations", description: "Security incident escalation path and threat response.", rto: "1 hour", processOwner: "James Liu" },
          ],
          branches: [
            { name: "NOC - San Francisco", type: "Primary" },
            { name: "NOC - London", type: "Secondary" },
            { name: "NOC - Singapore", type: "APAC" },
            { name: "Remote On-Call Team", type: "Distributed" },
          ],
        },
      },
      {
        id: "14",
        name: "Change Management",
        description: "Change Management controls modifications to IT systems and infrastructure supporting business operations. This process ensures changes are properly tested, approved, and documented to minimize risk, maintain system stability, and comply with regulatory requirements.",
        processOwner: "Kevin Park",
        criticality: "Low",
        rto: "4 hours",
        rpo: "1 hour",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Release Management",
        relatedRisks: "Unplanned Outages, Configuration Drift, Compliance Violations, Failed Deployments",
        frameworks: "ITIL, SOX, Change Advisory Board procedures, COBIT",
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
          costPerHour: "$15,000",
          costPerDay: "$360,000",
        },
        dependencies: {
          itAssets: [
            { name: "ServiceNow", description: "Enterprise ITSM platform for change workflow management", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Kevin Park" },
            { name: "GitHub Enterprise", description: "Source code management and pull request tracking", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Kevin Park" },
            { name: "Jenkins", description: "CI/CD pipeline automation for build and deployment", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Kevin Park" },
            { name: "Confluence", description: "Change documentation and runbook repository", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Kevin Park" },
            { name: "Microsoft Teams", description: "CAB meeting coordination and communication", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Kevin Park" },
            { name: "SonarQube", description: "Code quality and security scanning", recoveryTimeframe: "4 hours", recoveryGap: "gap", assetOwner: "Kevin Park" },
          ],
          vendors: [
            { name: "ServiceNow", description: "ITSM Platform Provider", vendorContact: "Jessica Brown - Account Manager" },
            { name: "GitHub", description: "Source Control Provider", vendorContact: "Tom Wilson - Enterprise Support" },
            { name: "Microsoft", description: "Collaboration Suite Provider", vendorContact: "Enterprise Agreement Team" },
            { name: "SonarSource", description: "Code Quality Platform", vendorContact: "Support Team" },
          ],
          businessProcesses: [
            { name: "Loan Origination and Servicing", description: "Loan system change coordination and testing windows.", rto: "2 hours", processOwner: "Baylor Cruz" },
            { name: "Payroll Processing", description: "Payroll system change freeze periods and testing.", rto: "4 hours", processOwner: "Dante Bradford" },
            { name: "Software Deployment", description: "Application release coordination and deployment windows.", rto: "2 hours", processOwner: "David Martinez" },
            { name: "Security Operations", description: "Security review and approval for system changes.", rto: "1 hour", processOwner: "James Liu" },
          ],
          branches: [
            { name: "IT Operations Center - Austin", type: "Primary" },
            { name: "Remote Change Board", type: "Virtual" },
          ],
        },
      },
      {
        id: "15",
        name: "Application Support",
        description: "Application Support maintains and troubleshoots business-critical applications including core banking, payment systems, and customer-facing platforms. This process handles application performance, bug fixes, and user support to ensure optimal system functionality.",
        processOwner: "Lisa Wong",
        criticality: "High",
        rto: "2 hours",
        rpo: "1 hour",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Application Support",
        relatedRisks: "Application Downtime, Data Corruption, User Productivity Loss, Transaction Failures",
        frameworks: "ITIL, Application Lifecycle Management, SLA Management",
        controls: "AS-01 Application Health Checks, AS-02 Error Log Monitoring, AS-03 Database Performance Tuning, AS-04 User Issue Triage, AS-05 Hotfix Deployment Protocol",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "Medium",
          legalImpact: "Low",
          regulatoryImpact: "Medium",
          mtd: "4 hours",
          rto: "2 hours",
          rpo: "1 hour",
          costPerHour: "$65,000",
          costPerDay: "$1,560,000",
        },
        dependencies: {
          itAssets: [
            { name: "New Relic APM", description: "Real-time application performance monitoring and tracing", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Lisa Wong" },
            { name: "PostgreSQL Database", description: "Primary relational database cluster with streaming replication", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Lisa Wong" },
            { name: "Redis Cache", description: "In-memory caching layer for session and data caching", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Lisa Wong" },
            { name: "Elasticsearch", description: "Full-text search engine and log aggregation", recoveryTimeframe: "2 hours", recoveryGap: "gap", assetOwner: "Lisa Wong" },
            { name: "MongoDB Atlas", description: "Document database for unstructured data", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Lisa Wong" },
            { name: "RabbitMQ", description: "Message queue for async processing", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Lisa Wong" },
            { name: "Sentry", description: "Error tracking and performance monitoring", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "Lisa Wong" },
            { name: "AWS S3", description: "Object storage for application assets", recoveryTimeframe: "10 mins", recoveryGap: "met", assetOwner: "Lisa Wong" },
          ],
          vendors: [
            { name: "New Relic", description: "APM and Observability Platform", vendorContact: "Chris Anderson - Technical Support" },
            { name: "Elastic", description: "Search and Analytics Platform", vendorContact: "Support Team" },
            { name: "MongoDB", description: "Database Platform Provider", vendorContact: "Enterprise Support" },
            { name: "Sentry", description: "Error Monitoring Provider", vendorContact: "Business Support" },
            { name: "Amazon Web Services", description: "Cloud Storage Provider", vendorContact: "TAM Team" },
          ],
          businessProcesses: [
            { name: "Account Management", description: "Core banking application support and maintenance.", rto: "1 hour", processOwner: "Baylor Cruz" },
            { name: "Payment Processing", description: "Payment gateway application monitoring and support.", rto: "1 hour", processOwner: "Leah Sullivan" },
            { name: "Incident Management", description: "Application incident escalation and response.", rto: "30 mins", processOwner: "Sarah Kim" },
            { name: "Software Development Lifecycle", description: "Bug fix prioritization and development handoff.", rto: "4 hours", processOwner: "Rajesh Patel" },
          ],
          branches: [
            { name: "Application Support Center - Seattle", type: "Primary" },
            { name: "L1 Support - Manila", type: "Follow-the-Sun" },
            { name: "L2 Support - Dublin", type: "Follow-the-Sun" },
          ],
        },
      },
      {
        id: "16",
        name: "Security Operations",
        description: "Security Operations monitors and protects IT systems from security threats across all business operations. This process includes threat detection, vulnerability management, security incident response, compliance monitoring, and protection of customer financial data.",
        processOwner: "James Liu",
        criticality: "High",
        rto: "1 hour",
        rpo: "30 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "IT Operations",
        categoryId: "it-operations",
        ownerTeam: "Security Operations Center",
        relatedRisks: "Data Breach, Ransomware, Insider Threats, Compliance Violations, Financial Fraud",
        frameworks: "NIST Cybersecurity Framework, ISO 27001, SOC 2, PCI-DSS, GLBA",
        controls: "SO-01 24/7 Security Monitoring, SO-02 Intrusion Detection, SO-03 Vulnerability Scanning, SO-04 Security Incident Response, SO-05 Penetration Testing",
        bia: {
          financialImpact: "High",
          operationalImpact: "High",
          reputationalImpact: "High",
          legalImpact: "High",
          regulatoryImpact: "High",
          mtd: "2 hours",
          rto: "1 hour",
          rpo: "30 mins",
          costPerHour: "$250,000",
          costPerDay: "$6,000,000",
        },
        dependencies: {
          itAssets: [
            { name: "CrowdStrike Falcon", description: "Next-gen endpoint detection and response platform", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "Okta Identity", description: "Enterprise identity and single sign-on platform", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "Splunk SIEM", description: "Security event correlation and threat detection", recoveryTimeframe: "45 mins", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "Qualys Scanner", description: "Continuous vulnerability assessment and compliance", recoveryTimeframe: "2 hours", recoveryGap: "gap", assetOwner: "James Liu" },
            { name: "Palo Alto Firewall", description: "Next-gen firewall and network security", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "Snyk", description: "Developer security for code and dependencies", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "HashiCorp Vault", description: "Secrets management and data encryption", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "Proofpoint", description: "Email security and threat protection", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "James Liu" },
            { name: "Zscaler", description: "Cloud security and zero trust access", recoveryTimeframe: "20 mins", recoveryGap: "met", assetOwner: "James Liu" },
          ],
          vendors: [
            { name: "CrowdStrike", description: "Endpoint Security Platform", vendorContact: "Security Response Team" },
            { name: "Okta", description: "Identity and Access Management", vendorContact: "Nina Patel - Enterprise Support" },
            { name: "Splunk", description: "Security Analytics Platform", vendorContact: "Security Support Line" },
            { name: "Qualys", description: "Vulnerability Management Provider", vendorContact: "Technical Support" },
            { name: "Palo Alto Networks", description: "Network Security Provider", vendorContact: "TAC Support" },
            { name: "Snyk", description: "Developer Security Provider", vendorContact: "Enterprise Team" },
          ],
          businessProcesses: [
            { name: "Payment Processing", description: "PCI-DSS compliance and payment security monitoring.", rto: "1 hour", processOwner: "Leah Sullivan" },
            { name: "Account Management", description: "Customer data protection and access control.", rto: "1 hour", processOwner: "Baylor Cruz" },
            { name: "Employee Onboarding and Offboarding", description: "Identity lifecycle and access provisioning security.", rto: "4 hours", processOwner: "Dante Bradford" },
            { name: "Incident Management", description: "Security incident escalation and coordinated response.", rto: "30 mins", processOwner: "Sarah Kim" },
          ],
          branches: [
            { name: "Security Operations Center - Denver", type: "Primary" },
            { name: "SOC - Singapore", type: "APAC" },
            { name: "SOC - Dublin", type: "EMEA" },
            { name: "Threat Intelligence Team", type: "Virtual" },
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
        description: "Software Development Lifecycle manages the end-to-end process of building software products that power business operations. This includes requirements gathering, design, development, testing, and deployment following agile methodologies to deliver features for banking, HR, and treasury systems.",
        processOwner: "Rajesh Patel",
        criticality: "High",
        rto: "4 hours",
        rpo: "1 hour",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "Engineering",
        relatedRisks: "Delivery Delays, Technical Debt, Quality Issues, Feature Gaps",
        frameworks: "Agile/Scrum, DevOps practices, SDLC best practices, SAFe",
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
          costPerHour: "$45,000",
          costPerDay: "$1,080,000",
        },
        dependencies: {
          itAssets: [
            { name: "GitHub Enterprise", description: "Enterprise source code repository with advanced security features", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Rajesh Patel" },
            { name: "Jira", description: "Agile project management and sprint tracking", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Rajesh Patel" },
            { name: "Confluence", description: "Technical documentation and knowledge base", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Rajesh Patel" },
            { name: "Figma", description: "Collaborative design and prototyping platform", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Rajesh Patel" },
            { name: "Slack", description: "Team communication and integration hub", recoveryTimeframe: "10 mins", recoveryGap: "met", assetOwner: "Rajesh Patel" },
            { name: "VS Code Remote", description: "Cloud-based development environment", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Rajesh Patel" },
            { name: "Linear", description: "Issue tracking for product teams", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Rajesh Patel" },
            { name: "Notion", description: "Product requirements and specs documentation", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Rajesh Patel" },
          ],
          vendors: [
            { name: "GitHub", description: "Source Control and CI/CD Platform", vendorContact: "Rachel Kim - Enterprise Support" },
            { name: "Atlassian", description: "Project Management Suite", vendorContact: "Tom Chen - Account Manager" },
            { name: "Figma", description: "Design Collaboration Platform", vendorContact: "Design Enterprise Team" },
            { name: "Slack", description: "Team Communication Platform", vendorContact: "Business Support" },
            { name: "Linear", description: "Issue Tracking Provider", vendorContact: "Support Team" },
          ],
          businessProcesses: [
            { name: "Account Management", description: "Core banking feature development and enhancements.", rto: "1 hour", processOwner: "Baylor Cruz" },
            { name: "Payment Processing", description: "Payment system feature development and improvements.", rto: "1 hour", processOwner: "Leah Sullivan" },
            { name: "Software Deployment", description: "Code release and deployment coordination.", rto: "2 hours", processOwner: "David Martinez" },
            { name: "Quality Assurance", description: "Testing and quality validation.", rto: "4 hours", processOwner: "Anna Thompson" },
          ],
          branches: [
            { name: "Engineering Office - San Francisco", type: "Primary" },
            { name: "Engineering Office - Bangalore", type: "Secondary" },
            { name: "Engineering Office - London", type: "EMEA" },
            { name: "Remote Engineering Team", type: "Distributed" },
          ],
        },
      },
      {
        id: "18",
        name: "Software Deployment",
        description: "Software Deployment manages the release of code changes to production environments powering core business systems. This process includes CI/CD pipeline management, deployment automation, feature flags, and rollback procedures for banking, payment, and customer-facing applications.",
        processOwner: "David Martinez",
        criticality: "High",
        rto: "2 hours",
        rpo: "30 mins",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "Platform Engineering",
        relatedRisks: "Deployment Failures, Service Disruption, Configuration Errors, Rollback Failures",
        frameworks: "DevOps, GitOps, Continuous Deployment best practices, SRE",
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
          costPerHour: "$75,000",
          costPerDay: "$1,800,000",
        },
        dependencies: {
          itAssets: [
            { name: "GitHub Actions", description: "Enterprise CI/CD automation with 50+ workflows", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "David Martinez" },
            { name: "ArgoCD", description: "GitOps continuous delivery for Kubernetes", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "David Martinez" },
            { name: "Docker Registry (ECR)", description: "AWS container image repository", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "David Martinez" },
            { name: "LaunchDarkly", description: "Feature flag and progressive rollout management", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "David Martinez" },
            { name: "Kubernetes", description: "Production container orchestration platform", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "David Martinez" },
            { name: "Helm Charts", description: "Kubernetes package management", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "David Martinez" },
            { name: "Terraform Cloud", description: "Infrastructure provisioning automation", recoveryTimeframe: "2 hours", recoveryGap: "gap", assetOwner: "David Martinez" },
            { name: "Datadog APM", description: "Deployment monitoring and rollback triggers", recoveryTimeframe: "15 mins", recoveryGap: "met", assetOwner: "David Martinez" },
          ],
          vendors: [
            { name: "GitHub", description: "CI/CD Platform Provider", vendorContact: "DevOps Support Team" },
            { name: "LaunchDarkly", description: "Feature Management Platform", vendorContact: "Emily Zhang - Technical Support" },
            { name: "Amazon Web Services", description: "Container Registry Provider", vendorContact: "TAM Team" },
            { name: "HashiCorp", description: "Infrastructure Automation", vendorContact: "Enterprise Support" },
            { name: "Datadog", description: "Observability Platform", vendorContact: "DevOps Support" },
          ],
          businessProcesses: [
            { name: "Account Management", description: "Core banking system deployment coordination.", rto: "1 hour", processOwner: "Baylor Cruz" },
            { name: "Payment Processing", description: "Payment gateway deployment windows and coordination.", rto: "1 hour", processOwner: "Leah Sullivan" },
            { name: "Change Management", description: "Deployment change approval and CAB coordination.", rto: "4 hours", processOwner: "Kevin Park" },
            { name: "Infrastructure Management", description: "Deployment infrastructure support and capacity.", rto: "1 hour", processOwner: "Marcus Chen" },
          ],
          branches: [
            { name: "DevOps Center - Austin", type: "Primary" },
            { name: "DevOps - Bangalore", type: "Secondary" },
            { name: "On-Call Release Team", type: "Distributed" },
          ],
        },
      },
      {
        id: "19",
        name: "Quality Assurance",
        description: "Quality Assurance ensures software quality for all business-critical applications through comprehensive testing strategies. This includes automated testing, manual testing, performance testing, and security testing before releases to banking, payment, and HR systems.",
        processOwner: "Anna Thompson",
        criticality: "High",
        rto: "4 hours",
        rpo: "2 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "QA Engineering",
        relatedRisks: "Quality Defects, Customer Complaints, Regression Issues, Compliance Failures",
        frameworks: "ISTQB, Test Automation best practices, ISO 25010",
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
          costPerHour: "$25,000",
          costPerDay: "$600,000",
        },
        dependencies: {
          itAssets: [
            { name: "Cypress", description: "End-to-end testing framework with visual testing", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Anna Thompson" },
            { name: "Jest", description: "JavaScript unit and integration testing", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Anna Thompson" },
            { name: "BrowserStack", description: "Cross-browser and mobile testing cloud", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Anna Thompson" },
            { name: "k6", description: "Performance and load testing platform", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Anna Thompson" },
            { name: "Playwright", description: "Cross-browser automation testing", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Anna Thompson" },
            { name: "Postman", description: "API testing and documentation", recoveryTimeframe: "30 mins", recoveryGap: "met", assetOwner: "Anna Thompson" },
            { name: "TestRail", description: "Test case management and reporting", recoveryTimeframe: "2 hours", recoveryGap: "gap", assetOwner: "Anna Thompson" },
            { name: "Applitools", description: "Visual regression testing platform", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Anna Thompson" },
          ],
          vendors: [
            { name: "BrowserStack", description: "Cross-Browser Testing Platform", vendorContact: "Mark Johnson - Support Team" },
            { name: "Grafana Labs", description: "k6 Performance Testing Provider", vendorContact: "Enterprise Support" },
            { name: "Applitools", description: "Visual Testing Provider", vendorContact: "Technical Support" },
            { name: "Postman", description: "API Platform Provider", vendorContact: "Business Support" },
            { name: "Gurock", description: "TestRail Provider", vendorContact: "Account Manager" },
          ],
          businessProcesses: [
            { name: "Account Management", description: "Core banking system testing and validation.", rto: "1 hour", processOwner: "Baylor Cruz" },
            { name: "Loan Origination and Servicing", description: "Loan system integration and regression testing.", rto: "2 hours", processOwner: "Baylor Cruz" },
            { name: "Software Deployment", description: "Pre-deployment testing gates and sign-off.", rto: "2 hours", processOwner: "David Martinez" },
            { name: "Security Operations", description: "Security testing coordination and vulnerability scanning.", rto: "1 hour", processOwner: "James Liu" },
          ],
          branches: [
            { name: "QA Center - Portland", type: "Primary" },
            { name: "QA Automation - Bangalore", type: "Secondary" },
            { name: "Manual QA Team - Manila", type: "Offshore" },
          ],
        },
      },
      {
        id: "20",
        name: "Product Management",
        description: "Product Management defines product vision, strategy, and roadmap for banking, treasury, and HR applications. This process includes market research, feature prioritization, stakeholder alignment, and product metrics tracking to drive business value.",
        processOwner: "Michael Ross",
        criticality: "Low",
        rto: "24 hours",
        rpo: "8 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "Product",
        relatedRisks: "Market Misalignment, Feature Creep, Competitive Pressure, Stakeholder Misalignment",
        frameworks: "Product-Led Growth, OKR methodology, Jobs-to-be-Done",
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
          costPerHour: "$8,000",
          costPerDay: "$192,000",
        },
        dependencies: {
          itAssets: [
            { name: "Productboard", description: "Centralized product roadmap and feature prioritization", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Michael Ross" },
            { name: "Amplitude", description: "Product analytics and user behavior tracking", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Michael Ross" },
            { name: "Notion", description: "Product documentation, PRDs, and specs", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Michael Ross" },
            { name: "Miro", description: "Collaborative whiteboarding and strategy sessions", recoveryTimeframe: "4 hours", recoveryGap: "gap", assetOwner: "Michael Ross" },
            { name: "Mixpanel", description: "Event analytics and funnel analysis", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Michael Ross" },
            { name: "Pendo", description: "In-app guidance and feature adoption tracking", recoveryTimeframe: "3 hours", recoveryGap: "met", assetOwner: "Michael Ross" },
            { name: "Coda", description: "Product planning documents and OKRs", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Michael Ross" },
          ],
          vendors: [
            { name: "Productboard", description: "Product Management Platform", vendorContact: "Sarah Lee - Customer Success" },
            { name: "Amplitude", description: "Product Analytics Provider", vendorContact: "Analytics Support Team" },
            { name: "Notion", description: "Collaboration Workspace Provider", vendorContact: "Enterprise Support" },
            { name: "Miro", description: "Visual Collaboration Platform", vendorContact: "Business Support" },
            { name: "Pendo", description: "Product Experience Platform", vendorContact: "Account Manager" },
          ],
          businessProcesses: [
            { name: "Customer Service and Support", description: "Customer feedback and feature request pipeline.", rto: "4 hours", processOwner: "Baylor Cruz" },
            { name: "Account Management", description: "Banking product feature requirements and roadmap.", rto: "1 hour", processOwner: "Baylor Cruz" },
            { name: "Software Development Lifecycle", description: "Feature requirements handoff and sprint planning.", rto: "4 hours", processOwner: "Rajesh Patel" },
            { name: "UX Research and Design", description: "Design collaboration and user research coordination.", rto: "8 hours", processOwner: "Emma Wilson" },
          ],
          branches: [
            { name: "Product Office - San Francisco", type: "Primary" },
            { name: "Product Team - New York", type: "Secondary" },
            { name: "Product Analytics - Remote", type: "Distributed" },
          ],
        },
      },
      {
        id: "21",
        name: "UX Research and Design",
        description: "UX Research and Design creates user-centered product experiences for banking, payment, and internal applications. This process includes user research, interaction design, visual design, prototyping, and usability testing to improve customer satisfaction.",
        processOwner: "Emma Wilson",
        criticality: "Low",
        rto: "8 hours",
        rpo: "4 hours",
        biaLastUpdated: "June 20, 2024",
        businessUnits: "Product Development",
        categoryId: "product-development",
        ownerTeam: "Design",
        relatedRisks: "Poor User Experience, Design Inconsistency, Accessibility Issues, Customer Churn",
        frameworks: "Design Thinking, WCAG Accessibility Guidelines, Human-Centered Design",
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
          costPerHour: "$6,000",
          costPerDay: "$144,000",
        },
        dependencies: {
          itAssets: [
            { name: "Figma", description: "Enterprise UI/UX design and prototyping platform", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Emma Wilson" },
            { name: "UserTesting", description: "Remote moderated and unmoderated usability testing", recoveryTimeframe: "4 hours", recoveryGap: "met", assetOwner: "Emma Wilson" },
            { name: "Hotjar", description: "Heatmaps, session recordings, and user feedback", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Emma Wilson" },
            { name: "Zeplin", description: "Design-to-development handoff and style guides", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Emma Wilson" },
            { name: "Maze", description: "Rapid user testing and prototype validation", recoveryTimeframe: "3 hours", recoveryGap: "met", assetOwner: "Emma Wilson" },
            { name: "Dovetail", description: "User research repository and insights management", recoveryTimeframe: "4 hours", recoveryGap: "gap", assetOwner: "Emma Wilson" },
            { name: "Abstract", description: "Design version control and collaboration", recoveryTimeframe: "2 hours", recoveryGap: "met", assetOwner: "Emma Wilson" },
            { name: "Loom", description: "Video recording for design presentations", recoveryTimeframe: "1 hour", recoveryGap: "met", assetOwner: "Emma Wilson" },
          ],
          vendors: [
            { name: "Figma", description: "Design Platform Provider", vendorContact: "Design Enterprise Support" },
            { name: "UserTesting", description: "User Research Platform", vendorContact: "James Park - Account Manager" },
            { name: "Hotjar", description: "Behavior Analytics Provider", vendorContact: "Support Team" },
            { name: "Maze", description: "Product Research Platform", vendorContact: "Customer Success" },
            { name: "Dovetail", description: "Research Repository Provider", vendorContact: "Enterprise Support" },
          ],
          businessProcesses: [
            { name: "Customer Service and Support", description: "Customer feedback and usability insights.", rto: "4 hours", processOwner: "Baylor Cruz" },
            { name: "Product Management", description: "Feature design requirements and validation.", rto: "24 hours", processOwner: "Michael Ross" },
            { name: "Software Development Lifecycle", description: "Design implementation handoff and specifications.", rto: "4 hours", processOwner: "Rajesh Patel" },
            { name: "Quality Assurance", description: "Visual and usability testing coordination.", rto: "4 hours", processOwner: "Anna Thompson" },
          ],
          branches: [
            { name: "Design Studio - New York", type: "Primary" },
            { name: "UX Research - San Francisco", type: "Secondary" },
            { name: "Design Team - London", type: "EMEA" },
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
