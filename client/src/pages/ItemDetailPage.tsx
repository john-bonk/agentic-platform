/**
 * Item Detail Page - Business Process Overview
 * 
 * Detail view matching Figma design with:
 * - Title and action buttons header
 * - Quick info bar (Criticality, RTO, RPO, etc.)
 * - Tab navigation (Overview, BIA, Key Dependencies, BCP, Issues)
 * - Two-column Details section
 */

import { useState } from "react";
import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronDown,
  AlertTriangle,
  MoreHorizontal,
  Info
} from "lucide-react";

interface BusinessProcess {
  id: string;
  name: string;
  criticality: "Low" | "Medium" | "High";
  rto: string;
  rpo: string;
  processOwner: string;
  biaLastUpdated: string;
  status: string;
  description: string;
  businessUnits: string[];
  relatedRisks: string[];
  frameworks: string[];
  controls: string[];
}

const businessProcesses: Record<string, BusinessProcess> = {
  "1": {
    id: "1",
    name: "Payment Processing",
    criticality: "Low",
    rto: "4 Hours",
    rpo: "4 hours",
    processOwner: "Dante Bradford",
    biaLastUpdated: "June 20, 2024",
    status: "Approved",
    description: "Payment Processing ensures the smooth and secure transfer of funds between accounts, including customer payments, vendor transactions, and interbank transfers. This process is critical to daily banking operations and financial stability. The process includes automated clearinghouse (ACH) transactions, wire transfers, and card payment settlements.",
    businessUnits: ["Treasury & Cash Management"],
    relatedRisks: ["Credit Risk", "System Outages", "Data Breaches"],
    frameworks: ["PCI-DSS", "SOX", "Anti-Money Laundering (AML) regulations", "Federal Reserve requirements"],
    controls: ["Lorem Ipsum"],
  },
  "2": {
    id: "2",
    name: "Loan Origination",
    criticality: "High",
    rto: "2 Hours",
    rpo: "1 hour",
    processOwner: "Sarah Chen",
    biaLastUpdated: "May 15, 2024",
    status: "In Review",
    description: "Loan Origination handles the end-to-end process of creating new loans, from application intake through approval and funding. This includes credit assessment, documentation verification, and regulatory compliance checks.",
    businessUnits: ["Retail Banking Operations"],
    relatedRisks: ["Credit Risk", "Compliance Risk", "Fraud Risk"],
    frameworks: ["TILA", "RESPA", "Fair Lending Laws"],
    controls: ["Credit Scoring Model", "Document Verification"],
  },
  "3": {
    id: "3",
    name: "Customer Service and Support",
    criticality: "Medium",
    rto: "24 Hours",
    rpo: "4 hours",
    processOwner: "Baylor Cruz",
    biaLastUpdated: "April 10, 2024",
    status: "Approved",
    description: "Customer Service and Support provides assistance to customers through multiple channels including phone, email, and chat. This process handles inquiries, complaints, and service requests.",
    businessUnits: ["Retail Banking Operations"],
    relatedRisks: ["Reputation Risk", "Operational Risk"],
    frameworks: ["Consumer Protection Act", "GDPR"],
    controls: ["Call Recording", "Quality Monitoring"],
  },
  "4": {
    id: "4",
    name: "Employee Onboarding",
    criticality: "Low",
    rto: "48 Hours",
    rpo: "24 hours",
    processOwner: "Dante Bradford",
    biaLastUpdated: "March 5, 2024",
    status: "Draft",
    description: "Employee Onboarding manages the process of integrating new employees into the organization, including documentation, system access provisioning, and training coordination.",
    businessUnits: ["Human Resources"],
    relatedRisks: ["Compliance Risk", "Security Risk"],
    frameworks: ["Employment Law", "Data Protection"],
    controls: ["Background Checks", "Access Controls"],
  },
  "5": {
    id: "5",
    name: "Payroll Processing",
    criticality: "High",
    rto: "4 Hours",
    rpo: "1 hour",
    processOwner: "Dante Bradford",
    biaLastUpdated: "June 1, 2024",
    status: "Approved",
    description: "Payroll Processing handles the calculation and distribution of employee compensation, including salary, benefits, taxes, and deductions.",
    businessUnits: ["Human Resources"],
    relatedRisks: ["Financial Risk", "Compliance Risk"],
    frameworks: ["Tax Regulations", "Labor Laws"],
    controls: ["Segregation of Duties", "Audit Trail"],
  },
};

const getCriticalityBadge = (criticality: string) => {
  const styles: Record<string, string> = {
    Low: "bg-green-100 text-green-700 border-green-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    High: "bg-red-100 text-red-700 border-red-200",
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${styles[criticality] || "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {criticality}
    </Badge>
  );
};

export function ItemDetailPage() {
  const [, params] = useRoute("/items/:id");
  const itemId = params?.id || "1";
  const process = businessProcesses[itemId] || businessProcesses["1"];
  
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AppLayout 
      activeTab={{ 
        id: process.id, 
        name: process.name, 
        path: `/items/${process.id}` 
      }}
    >
      <div className="flex flex-col h-full overflow-hidden bg-white">
        <div className="flex items-center justify-between px-8 py-5 bg-white">
          <h1 className="text-xl font-semibold text-gray-900">{process.name}</h1>
          <div className="flex items-center gap-2">
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              data-testid="button-send-questionnaire"
            >
              Send Questionnaire
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              data-testid="button-status"
            >
              {process.status}
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-alert">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-more">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-200 bg-white px-8">
            <TabsList className="h-auto p-0 bg-transparent border-0">
              <TabsTrigger 
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                data-testid="tab-overview"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="bia"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                data-testid="tab-bia"
              >
                BIA
              </TabsTrigger>
              <TabsTrigger 
                value="dependencies"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                data-testid="tab-dependencies"
              >
                Key Dependencies
              </TabsTrigger>
              <TabsTrigger 
                value="bcp"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                data-testid="tab-bcp"
              >
                BCP
              </TabsTrigger>
              <TabsTrigger 
                value="issues"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-medium px-4 py-3 text-gray-600"
                data-testid="tab-issues"
              >
                Issues
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            <TabsContent value="overview" className="m-0">
              <div className="px-8 py-4 border-b border-gray-100">
                <div className="flex items-center gap-12">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Criticality</span>
                    <div className="mt-1">
                      {getCriticalityBadge(process.criticality)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">RTO</span>
                    <span className="text-sm text-gray-900 mt-1">{process.rto}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">RPO</span>
                    <span className="text-sm text-gray-400 mt-1">{process.rpo}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Process Owner</span>
                    <span className="text-sm text-gray-900 mt-1">{process.processOwner}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">BIA Last Updated</span>
                    <span className="text-sm text-gray-900 mt-1">{process.biaLastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-base font-semibold text-gray-900 mb-6">Details</h2>
                
                <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Name</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-900">{process.name}</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Description</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed">{process.description}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Process Owner</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-900">{process.processOwner}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Business Units</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {process.businessUnits.map((unit, idx) => (
                          <a 
                            key={idx} 
                            href="#" 
                            className="text-sm text-blue-600 hover:underline"
                            data-testid={`link-business-unit-${idx}`}
                          >
                            {unit}
                          </a>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Related Risks</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {process.relatedRisks.map((risk, idx) => (
                          <span key={idx}>
                            <a 
                              href="#" 
                              className="text-sm text-blue-600 hover:underline"
                              data-testid={`link-risk-${idx}`}
                            >
                              {risk}
                            </a>
                            {idx < process.relatedRisks.length - 1 && <span className="text-gray-400">, </span>}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Frameworks</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {process.frameworks.map((framework, idx) => (
                          <span key={idx}>
                            <a 
                              href="#" 
                              className="text-sm text-blue-600 hover:underline"
                              data-testid={`link-framework-${idx}`}
                            >
                              {framework}
                            </a>
                            {idx < process.frameworks.length - 1 && <span className="text-gray-400">, </span>}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Controls</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {process.controls.map((control, idx) => (
                          <a 
                            key={idx} 
                            href="#" 
                            className="text-sm text-blue-600 hover:underline"
                            data-testid={`link-control-${idx}`}
                          >
                            {control}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bia" className="p-8 m-0">
              <div className="text-center py-16 text-gray-500">
                <p className="text-sm font-medium">Business Impact Analysis</p>
                <p className="text-xs mt-1">BIA content will be displayed here</p>
              </div>
            </TabsContent>

            <TabsContent value="dependencies" className="p-8 m-0">
              <div className="text-center py-16 text-gray-500">
                <p className="text-sm font-medium">Key Dependencies</p>
                <p className="text-xs mt-1">Dependencies content will be displayed here</p>
              </div>
            </TabsContent>

            <TabsContent value="bcp" className="p-8 m-0">
              <div className="text-center py-16 text-gray-500">
                <p className="text-sm font-medium">Business Continuity Plan</p>
                <p className="text-xs mt-1">BCP content will be displayed here</p>
              </div>
            </TabsContent>

            <TabsContent value="issues" className="p-8 m-0">
              <div className="text-center py-16 text-gray-500">
                <p className="text-sm font-medium">Issues</p>
                <p className="text-xs mt-1">Issues will be displayed here</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
