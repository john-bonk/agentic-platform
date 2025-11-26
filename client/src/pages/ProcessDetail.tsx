import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MoreHorizontal, Triangle, RefreshCcw, Check, Link2 } from "lucide-react";

function HelpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="12" height="12" rx="6" fill="#E2E8F0"/>
      <path d="M3.521 4.23129C3.5337 3.92057 3.60853 3.61554 3.74105 3.33421C3.87358 3.05288 4.06112 2.80095 4.29261 2.5933C4.5241 2.38564 4.79484 2.22646 5.08886 2.12515C5.38287 2.02385 5.69421 1.98247 6.00448 2.00346C6.60623 1.96237 7.20045 2.15641 7.66199 2.54472C8.12353 2.93302 8.41636 3.48529 8.47883 4.0852C8.48239 4.46896 8.38675 4.84713 8.20119 5.18306C8.01563 5.51899 7.74643 5.80129 7.4197 6.00259C7.17194 6.16616 6.94504 6.35932 6.74404 6.57781C6.51511 6.85496 6.39214 7.20446 6.39709 7.5639H5.2923C5.24947 7.40904 5.22496 7.24969 5.21926 7.08912C5.21926 5.45477 7.20056 5.31781 7.20056 4.16737C7.19248 4.01937 7.15494 3.87446 7.09014 3.74115C7.02533 3.60784 6.93458 3.4888 6.82318 3.39101C6.71179 3.29322 6.582 3.21865 6.44141 3.17166C6.30083 3.12468 6.15228 3.10622 6.00448 3.11737C5.6759 3.12217 5.36241 3.25607 5.13176 3.49014C4.90111 3.72421 4.77183 4.03963 4.77187 4.36824C4.76287 4.46238 4.76287 4.55715 4.77187 4.65129H3.53926C3.53013 4.51433 3.521 4.36824 3.521 4.23129ZM5.84926 10.0017C6.05681 10.0018 6.25613 9.9206 6.40459 9.77556C6.55304 9.63052 6.63884 9.43313 6.64361 9.22564C6.6412 9.01655 6.55645 8.81684 6.40774 8.66984C6.25904 8.52284 6.05836 8.44041 5.84926 8.44042C5.74657 8.44042 5.6449 8.46079 5.55014 8.50036C5.45538 8.53993 5.36942 8.59792 5.29723 8.67095C5.22504 8.74399 5.16807 8.83062 5.12961 8.92584C5.09115 9.02106 5.07196 9.12296 5.07317 9.22564H5.09143C5.09022 9.32712 5.10917 9.42784 5.14717 9.52195C5.18517 9.61605 5.24148 9.70168 5.31281 9.77387C5.38415 9.84606 5.46911 9.90337 5.56276 9.94249C5.65641 9.9816 5.7569 10.0017 5.85839 10.0017H5.84926Z" fill="#64748B"/>
    </svg>
  );
}
import { HeaderSection } from "./sections/HeaderSection";
import { SideNavigationSection } from "./sections/SideNavigationSection";
import { KeyDependenciesImpactCanvas } from "@/components/KeyDependenciesImpactCanvas";
import { BCPEmptyState } from "@/components/BCPEmptyState";
import { BCPWizard } from "@/components/BCPWizard";
import { getProcessById, type IssueItem } from "../data/businessProcessData";
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

const tabs = ["Overview", "Business Impact Analysis", "Key Dependencies", "Business Continuity Plan", "Issues"];

interface SemanticRelationships {
  itSystems: Application[];
  semanticVendors: Vendor[];
  relatedTeams: BusinessUnit[];
  deploymentLocations: Location[];
}

function KeyDependenciesContent({ dependencies, ownerTeam, processName }: { dependencies: Dependencies; ownerTeam: string; processName: string }) {
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
    
    const ownerTeamObj = getTeamByName(ownerTeam);
    const ownerDepartment = ownerTeamObj ? getDepartmentForTeam(ownerTeamObj) : undefined;
    const teamsList = getTeamsUsingApplications(apps).filter(t => 
      t.name !== ownerTeam && t.name !== ownerDepartment?.name
    );
    
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
      {/* Impact Cascade Canvas */}
      <KeyDependenciesImpactCanvas
        processName={processName}
        dependencies={{
          itAssets: dependencies.itAssets.map(a => ({ name: a.name, description: a.description })),
          vendors: dependencies.vendors.map(v => ({ name: v.name, description: v.description })),
          businessProcesses: dependencies.businessProcesses.map(p => ({ 
            name: p.name, 
            description: p.description, 
            rto: p.rto, 
            processOwner: p.processOwner 
          })),
          branches: dependencies.branches.map(b => ({ name: b.name, type: b.type })),
        }}
      />

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

      {/* Semantic Relationships Section - Hidden for now */}
    </div>
  );
}

function IssueIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.13397 1.5C5.51888 0.833333 6.48113 0.833333 6.86603 1.5L11.1962 9C11.5811 9.66667 11.0999 10.5 10.3301 10.5H1.66987C0.900073 10.5 0.418948 9.66667 0.803848 9L5.13397 1.5Z" fill="#BA2A2A"/>
      <path d="M6 4V6.5M6 8.5V8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IssuesContent({ issues }: { issues: IssueItem[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusBadgeStyle = (status: IssueItem["status"]) => {
    switch (status) {
      case "Pending remediation":
        return "bg-[#3172e3] text-white";
      case "In progress":
        return "bg-[#f59e0b] text-white";
      case "Resolved":
        return "bg-[#36844a] text-white";
      case "Open":
        return "bg-[#db3535] text-white";
      default:
        return "bg-[#64748b] text-white";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Issues Accordion */}
      <div className="w-full">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center h-10 border border-[#e2e8f0] ${
            isExpanded 
              ? "bg-[#f3fafb] rounded-t" 
              : "bg-white rounded"
          }`}
          data-testid="accordion-issues"
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
            <span className="font-bold text-sm text-[#0f172a]">Issues</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(24,49,83,0.67)] text-white">{issues.length}</span>
          </div>
        </button>
        {isExpanded && (
          <div className="border border-t-0 border-[#e2e8f0] rounded-b p-4 bg-white flex flex-col gap-2">
            {issues.map((issue, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between px-4 py-2 bg-[#fff5e8] border border-[#ffeacf] rounded"
                data-testid={`issue-row-${idx}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <IssueIcon />
                  <span className="font-bold text-sm text-[#0f172a]">
                    {issue.id} - {issue.title}
                  </span>
                  <span className="text-sm text-[#0f172a]">
                    {issue.location}
                  </span>
                </div>
                <Badge 
                  className={`text-[11px] font-semibold px-1.5 py-0 rounded-full ${getStatusBadgeStyle(issue.status)}`}
                  data-testid={`issue-status-${idx}`}
                >
                  {issue.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProcessDetail({ processId }: ProcessDetailProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [wizardOpen, setWizardOpen] = useState(false);
  const process = getProcessById(processId);

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
      <div className="flex items-stretch relative h-screen overflow-hidden">
        <LeftNavbar />
        <div className="flex flex-col items-start relative flex-1 grow min-h-0">
          <HeaderSection activeProcess={null} />
          <div className="flex items-stretch relative flex-1 self-stretch w-full grow min-h-0">
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
    <div className="flex items-stretch relative h-screen overflow-hidden">
      <LeftNavbar />
      <div className="flex flex-col items-start relative flex-1 grow min-h-0">
        <HeaderSection activeProcess={{ id: processId, name: process.name }} />
        <div className="flex items-stretch relative flex-1 self-stretch w-full grow min-h-0">
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
                <div className="flex flex-col gap-1 items-start">
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
                        <HelpIcon />
                      </div>
                      <span className="text-sm text-gray-900" data-testid="detail-name">{process.name}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Description</span>
                        <HelpIcon />
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed" data-testid="detail-description">
                        {process.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Process Owner</span>
                        <HelpIcon />
                      </div>
                      <span className="text-sm text-gray-900" data-testid="detail-owner">{process.processOwner}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Business Units</span>
                        <HelpIcon />
                      </div>
                      <a href="#" className="text-sm text-blue-600 hover:underline" data-testid="detail-business-units">
                        {process.businessUnits}
                      </a>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Related Risks</span>
                        <HelpIcon />
                      </div>
                      <a href="#" className="text-sm text-blue-600 hover:underline" data-testid="detail-related-risks">
                        {process.relatedRisks}
                      </a>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Frameworks</span>
                        <HelpIcon />
                      </div>
                      <a href="#" className="text-sm text-blue-600 hover:underline" data-testid="detail-frameworks">
                        {process.frameworks}
                      </a>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Controls</span>
                        <HelpIcon />
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
                      <HelpIcon />
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
                      <HelpIcon />
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
                      <HelpIcon />
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
                      <HelpIcon />
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
                      <HelpIcon />
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
                      <HelpIcon />
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-mtd">{process.bia.mtd}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Recovery Time Objective (RTO)</span>
                      <HelpIcon />
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-rto">{process.bia.rto}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Recovery Point Objective (RPO)</span>
                      <HelpIcon />
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-rpo">{process.bia.rpo}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <HelpIcon />
                    </div>
                    <span className="text-sm text-gray-900" data-testid="bia-last-updated">{process.biaLastUpdated}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Latest BIA Update</span>
                      <HelpIcon />
                    </div>
                    <a href="#" className="text-sm text-blue-600 hover:underline" data-testid="bia-latest-update">View</a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Key Dependencies" && process.dependencies && (
              <KeyDependenciesContent dependencies={process.dependencies} ownerTeam={process.ownerTeam} processName={process.name} />
            )}

            {activeTab === "Business Continuity Plan" && (
              <BCPEmptyState 
                onCreateNew={() => setWizardOpen(true)} 
              />
            )}
            
            <BCPWizard
              open={wizardOpen}
              onOpenChange={setWizardOpen}
              processName={process.name}
              onComplete={(data) => {
                console.log("BCP created:", data);
              }}
            />

            {activeTab === "Issues" && (
              <IssuesContent issues={process.issues || []} />
            )}
          </main>
          </div>
        </div>
      </div>
    </div>
  );
}
