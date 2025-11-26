import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, MoreHorizontal, Triangle } from "lucide-react";
import { HeaderSection } from "./sections/HeaderSection";
import { SideNavigationSection } from "./sections/SideNavigationSection";

interface ProcessDetailProps {
  processId: string;
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
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
    controls: "Lorem Ipsum",
  },
};

const tabs = ["Overview", "BIA", "Key Dependencies", "BCP", "Issues"];

export function ProcessDetail({ processId }: ProcessDetailProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const process = processData[processId];

  if (!process) {
    return (
      <div className="flex h-screen items-start bg-gray-50 w-full">
        <HeaderSection />
        <div className="flex items-start relative flex-1 self-stretch w-full grow pt-[60px]">
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
    );
  }

  return (
    <div className="flex h-screen items-start bg-gray-50 w-full">
      <HeaderSection />
      <div className="flex items-start relative flex-1 self-stretch w-full grow pt-[60px]">
        <SideNavigationSection />
        <div className="flex flex-col items-start relative flex-1 self-stretch grow bg-white min-w-0 overflow-y-auto">
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
                  variant="ghost"
                  size="icon"
                  className="h-[38px] w-[38px]"
                  data-testid="warning-button"
                >
                  <Triangle className="w-4 h-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
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

            <div className="flex gap-8 items-start flex-wrap py-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase">Criticality</span>
                <Badge
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    process.criticality === "High"
                      ? "bg-red-100 text-red-700 hover:bg-red-100"
                      : "bg-green-100 text-green-700 hover:bg-green-100"
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
          </main>
        </div>
      </div>
    </div>
  );
}
