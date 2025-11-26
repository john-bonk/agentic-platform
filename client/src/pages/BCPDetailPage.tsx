import { useRoute, Link } from "wouter";
import { RefreshCcw, Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBCPById } from "@/data/businessProcessData";
import { SideNavigationSection } from "./sections/SideNavigationSection";
import { HeaderSection } from "./sections/HeaderSection";

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

function LeftNavbar() {
  return (
    <aside
      className="flex flex-col w-14 items-center justify-between pt-2 pb-2.5 px-2 bg-gray-900 sticky top-0 h-screen z-50 flex-shrink-0"
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
}

export function BCPDetailPage() {
  const [, params] = useRoute("/bcp/:bcpId");
  const bcpId = params?.bcpId || "";
  const bcp = getBCPById(bcpId);

  if (!bcp) {
    return (
      <div className="flex h-screen w-full bg-background" data-testid="bcp-detail-page">
        <LeftNavbar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <HeaderSection />
          <div className="flex items-stretch relative flex-1 self-stretch w-full grow">
            <SideNavigationSection />
            <div className="flex flex-col relative flex-1 self-stretch grow bg-white min-w-0 p-8">
              <div className="text-center py-20">
                <h1 className="text-xl font-semibold text-slate-900">BCP Not Found</h1>
                <p className="text-sm text-slate-500 mt-2">
                  The Business Continuity Plan you're looking for doesn't exist.
                </p>
                <Link href="/">
                  <Button variant="outline" className="mt-4">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Business Processes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Draft</Badge>;
      case "In Review":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">In Review</Badge>;
      case "Approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background" data-testid="bcp-detail-page">
      <LeftNavbar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <HeaderSection />
        <div className="flex items-stretch relative flex-1 self-stretch w-full grow">
          <SideNavigationSection />
          <div className="flex flex-col relative flex-1 self-stretch grow bg-white min-w-0" style={{ maxHeight: "calc(100vh - 60px)" }}>
            {/* BCP Header */}
            <div className="flex flex-col gap-4 p-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Link href={`/process/${bcp.originProcessId}`}>
                  <Button variant="ghost" size="sm" className="text-slate-500">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Process
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-[rgba(1,8,24,0.93)]" data-testid="bcp-title">
                    {bcp.name}
                  </h1>
                  {getStatusBadge(bcp.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" data-testid="button-edit-bcp">
                    Edit
                  </Button>
                  <Button data-testid="button-submit-for-review">
                    Submit for Review
                  </Button>
                </div>
              </div>
            </div>

            {/* BCP Content - Placeholder for now */}
            <div className="flex-1 overflow-auto p-8">
              <div className="max-w-4xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500 uppercase">Plan Owner</span>
                    <span className="text-sm text-slate-900">{bcp.planOwner}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500 uppercase">Plan Type</span>
                    <span className="text-sm text-slate-900 capitalize">{bcp.planType}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500 uppercase">Review Granularity</span>
                    <span className="text-sm text-slate-900 capitalize">{bcp.reviewGranularity === "entire" ? "Entire Plan" : "By Section"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500 uppercase">Review Type</span>
                    <span className="text-sm text-slate-900 capitalize">{bcp.reviewType}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500 uppercase">Covered Processes</span>
                    <span className="text-sm text-slate-900">{bcp.processIds.length} process(es)</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500 uppercase">Created</span>
                    <span className="text-sm text-slate-900">{new Date(bcp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
