import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, MoreHorizontal, Triangle, RefreshCcw, Check } from "lucide-react";
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
  },
};

const tabs = ["Overview", "Business Impact Analysis", "Key Dependencies", "Business Continuity Plan", "Issues"];

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
                  className="h-[38px] gap-2 px-4 bg-teal-600 hover:bg-teal-600/90 border border-teal-600 text-white text-sm font-normal rounded"
                  data-testid="send-questionnaire-button"
                >
                  Send Questionnaire
                </Button>
                <Button
                  variant="outline"
                  className="h-[38px] gap-2 px-4 text-sm font-normal rounded"
                  data-testid="approved-button"
                >
                  Approved
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-[38px] w-[38px]"
                  data-testid="warning-button"
                >
                  <Triangle className="w-4 h-4 text-gray-500" />
                </Button>
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
                    <Badge className="bg-[#db3535] text-white hover:bg-[#db3535] text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit" data-testid="bia-financial-impact">
                      High
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Operational Impact</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <Badge className="bg-[#db3535] text-white hover:bg-[#db3535] text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit" data-testid="bia-operational-impact">
                      High
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Reputational Impact</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <Badge className="bg-[#db3535] text-white hover:bg-[#db3535] text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit" data-testid="bia-reputational-impact">
                      High
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Legal Impact</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <Badge className="bg-[#db3535] text-white hover:bg-[#db3535] text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit" data-testid="bia-legal-impact">
                      High
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Regulatory Impact</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <Badge className="bg-[#db3535] text-white hover:bg-[#db3535] text-[10px] font-semibold px-1.5 py-0 rounded-full w-fit" data-testid="bia-regulatory-impact">
                      High
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Maximum Time Down (MTD)</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-mtd">2 hours</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Recovery Time Objective (RTO)</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-rto">2 hours</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Recovery point Objective (RPO)</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-rpo">30 minutes</span>
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
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Maximum Time Down (MTD)</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-mtd-right">2 hours</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Recovery Time Objective (RTO)</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-rto-right">2 hours</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Recovery point Objective (RPO)</span>
                      <span className="text-gray-400 text-xs">?</span>
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-rpo-right">30 minutes</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Key Dependencies" && (
              <div className="text-sm text-gray-500">Key Dependencies content coming soon...</div>
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
