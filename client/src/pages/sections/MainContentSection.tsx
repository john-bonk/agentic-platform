import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { importJobStore, type ImportJob } from "@/lib/importJobStore";
import { useToast } from "@/hooks/use-toast";

const tabItems = [
  { label: "Workflow Library", value: "workflow" },
  { label: "Import Library", value: "import" },
  { label: "Permissions", value: "permissions" },
  { label: "Installation", value: "installation" },
];

const tableHeaders = [
  { label: "ENABLED", width: "w-20" },
  { label: "AUDITBOARD INVENTORY TYPE", width: "flex-1" },
  { label: "TENABLE ASSET TYPE", width: "flex-1" },
  { label: "FREQUENCY", width: "flex-1" },
  { label: "STATUS", width: "flex-1" },
  { label: "LAST IMPORT", width: "flex-1" },
  { label: "NEXT IMPORT", width: "flex-1" },
];

export const MainContentSection = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [showLiabilityCard, setShowLiabilityCard] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setImportJobs(importJobStore.getJobs());
    const unsubscribe = importJobStore.subscribe(() => {
      setImportJobs(importJobStore.getJobs());
    });
    return unsubscribe;
  }, []);

  const handleAcceptLiability = () => {
    setShowLiabilityCard(false);
    toast({
      title: "Liability Accepted",
      description: "You have accepted the liability statement for Tenable Vulnerability Import Jobs.",
    });
  };

  const handleDeclineLiability = () => {
    setShowLiabilityCard(false);
    toast({
      title: "Liability Declined",
      description: "You have declined the liability statement. Some features may be limited.",
    });
  };

  return (
    <div className="flex flex-col items-start relative flex-1 self-stretch grow bg-white">
      <header className="flex flex-col gap-2 pt-6 pb-0 px-8 w-full bg-white">
        {/* Level 1: Subhead + Heading + Actions */}
        <div className="flex gap-3 items-start w-full">
          {/* Text Section */}
          <div className="flex flex-col flex-1 gap-1 items-start justify-center">
            {/* Subhead */}
            <span className="text-[13px] font-semibold text-gray-500 leading-[1.35]">
              Installed Service
            </span>
            {/* Heading with Badge */}
            <div className="flex items-center gap-2 w-full">
              <h1 className="text-xl font-semibold text-gray-900 leading-[1.2]">
                Tenable
              </h1>
              <Badge className="h-4 bg-gray-200/60 text-gray-700 hover:bg-gray-200/60 rounded-full px-1.5 py-0 text-[10px] font-semibold">
                Valid
              </Badge>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-end gap-1">
            <Button
              variant="outline"
              className="h-8 gap-1.5 px-2.5 bg-white border border-gray-300 text-gray-900 text-[13px] font-normal rounded"
              data-testid="object-header-docs-button"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H3.5C2.67157 14 2 13.3284 2 12.5V3.5Z" stroke="currentColor" strokeWidth="1.25" />
                <path d="M5 5H11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                <path d="M5 8H11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                <path d="M5 11H8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
              Tenable Documentation
            </Button>
          </div>
        </div>

        {/* Level 2: Tabs */}
        <div className="pt-2 w-full">
          <Tabs
            defaultValue="import"
            className="w-full"
          >
            <TabsList className="h-9 bg-transparent p-0 gap-3 border-b border-gray-200 w-full justify-start rounded-none">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-9 px-0.5 pb-1 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-[3px] border-transparent data-[state=active]:border-teal-500 text-sm font-semibold text-gray-600 data-[state=active]:text-teal-500"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="flex items-start relative flex-1 self-stretch w-full grow overflow-y-scroll">
        <div className="flex items-start justify-between relative flex-1 self-stretch grow">
          <div className="flex flex-col items-start gap-6 pt-6 pb-0 px-8 relative flex-1 self-stretch grow">
            {showLiabilityCard && (
              <Card className="self-stretch w-full rounded-lg border border-gray-200 [background:radial-gradient(50%_50%_at_115%_-44%,rgba(1,51,101,0.03)_0%,rgba(1,51,101,0.03)_100%)]" data-testid="liability-card">
                <CardContent className="flex flex-col items-start gap-6 p-6">
                  <div className="gap-1 flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                    <h2 className="relative self-stretch mt-[-1.00px] font-font-400-18px-semibold font-[number:var(--font-400-18px-semibold-font-weight)] text-gray-900 text-[length:var(--font-400-18px-semibold-font-size)] tracking-[var(--font-400-18px-semibold-letter-spacing)] leading-[var(--font-400-18px-semibold-line-height)] [font-style:var(--font-400-18px-semibold-font-style)]" data-testid="liability-card-title">
                      Liability Statement for Tenable Vulnerability Import Jobs
                    </h2>

                    <p className="relative self-stretch font-font-200-14px-light font-[number:var(--font-200-14px-light-font-weight)] text-gray-900 text-[length:var(--font-200-14px-light-font-size)] tracking-[var(--font-200-14px-light-letter-spacing)] leading-[var(--font-200-14px-light-line-height)] [font-style:var(--font-200-14px-light-font-style)]" data-testid="liability-card-content">
                      AuditBoard may make certain content available through the
                      Service, Customer retains sole responsibility for verifying
                      such content prior to use. The content is provided on an
                      &quot;as is&quot; basis and all warranties, conditions,
                      representations, indemnities and guarantees with respect to
                      the content, and all components thereof, whether express or
                      implied, arising by law, custom, or prior oral or written
                      statements made by AuditBoard, their representatives, third
                      parties, or otherwise, including but not limited to its
                      accuracy, completeness, fitness for any particular purpose,
                      non-infringement, or that the use of or reliance upon any
                      content will cause Customer or any of its Affiliates to
                      achieve compliance with any laws, regulations, or authority
                      documents are hereby excluded and disclaimed to the fullest
                      extent permitted by applicable law.
                    </p>
                  </div>

                  <footer className="inline-flex items-center gap-1 relative flex-[0_0_auto] bg-transparent">
                    <Button 
                      onClick={handleAcceptLiability}
                      className="h-[34px] gap-2 px-[10.4px] bg-teal-500 hover:bg-teal-500/90 rounded border border-solid shadow-shadow-100"
                      data-testid="liability-accept-button"
                    >
                      <span className="font-font-200-14px-regular font-[number:var(--font-200-14px-regular-font-weight)] text-white text-[length:var(--font-200-14px-regular-font-size)] tracking-[var(--font-200-14px-regular-letter-spacing)] leading-[var(--font-200-14px-regular-line-height)] [font-style:var(--font-200-14px-regular-font-style)]">
                        Accept
                      </span>
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={handleDeclineLiability}
                      className="h-[34px] gap-2 px-[10.4px] bg-gray-100 hover:bg-gray-200 rounded"
                      data-testid="liability-decline-button"
                    >
                      <span className="font-font-200-14px-regular font-[number:var(--font-200-14px-regular-font-weight)] text-gray-900 text-[length:var(--font-200-14px-regular-font-size)] tracking-[var(--font-200-14px-regular-letter-spacing)] leading-[var(--font-200-14px-regular-line-height)] [font-style:var(--font-200-14px-regular-font-style)]">
                        Decline
                      </span>
                    </Button>
                  </footer>
                </CardContent>
              </Card>
            )}

            <section className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
              <h2 className="relative self-stretch mt-[-1.00px] font-font-400-18px-semibold font-[number:var(--font-400-18px-semibold-font-weight)] text-gray-900 text-[length:var(--font-400-18px-semibold-font-size)] tracking-[var(--font-400-18px-semibold-letter-spacing)] leading-[var(--font-400-18px-semibold-line-height)] [font-style:var(--font-400-18px-semibold-font-style)]">
                Vulnerability Import Jobs
              </h2>

              <p className="relative self-stretch font-font-200-14px-regular font-[number:var(--font-200-14px-regular-font-weight)] text-gray-700 text-[length:var(--font-200-14px-regular-font-size)] tracking-[var(--font-200-14px-regular-letter-spacing)] leading-[var(--font-200-14px-regular-line-height)] [font-style:var(--font-200-14px-regular-font-style)]">
                Import vulnerability assets (both findings and details) from
                Tenable. Match them to existing AuditBoard inventory, map
                specific fields, and filter for critical vulnerabilities. Please
                note, this product uses the NVD API but is not endorsed or
                certified by the NVD.
              </p>
            </section>

            <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
              <div className="self-stretch w-full flex-[0_0_auto] border-b border-[#01377e1c] flex items-start relative">
                {tableHeaders.map((header, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${header.width} justify-center gap-2 p-3 items-start relative`}
                  >
                    <div className="flex items-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="inline-flex flex-[0_0_auto] items-start relative">
                        <div className="relative w-fit mt-[-1.00px] [font-family:'SF_Pro_Display-Medium',Helvetica] font-medium text-gray-700 text-xs tracking-[0.35px] leading-[18px] whitespace-nowrap">
                          {header.label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {importJobs.length === 0 ? (
                <div className="flex flex-col max-w-[400px] items-center gap-2 px-4 py-5 relative w-full flex-[0_0_auto] rounded">
                  <div className="gap-4 flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                    <div className="gap-2 pt-2 pb-0 px-0 flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                      <h3 className="relative flex items-center justify-center self-stretch mt-[-1.00px] font-font-400-18px-medium font-[number:var(--font-400-18px-medium-font-weight)] text-gray-900 text-[length:var(--font-400-18px-medium-font-size)] text-center tracking-[var(--font-400-18px-medium-letter-spacing)] leading-[var(--font-400-18px-medium-line-height)] [font-style:var(--font-400-18px-medium-font-style)]">
                        No vulnerability import jobs found
                      </h3>

                      <p className="relative self-stretch font-font-200-14px-regular font-[number:var(--font-200-14px-regular-font-weight)] text-gray-700 text-[length:var(--font-200-14px-regular-font-size)] text-center tracking-[var(--font-200-14px-regular-letter-spacing)] leading-[var(--font-200-14px-regular-line-height)] [font-style:var(--font-200-14px-regular-font-style)]">
                        Currently there are no import jobs between Tenable and
                        AuditBoard. Add one below.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
                      <Button
                        variant="outline"
                        className="h-[30px] gap-2 px-[10.4px] ml-[-8.30px] bg-white border-gray-300"
                      >
                        <div className="w-3.5 h-3.5 bg-[url(/figmaAssets/module-narrative-.svg)] bg-[100%_100%]" />
                        <span className="font-font-100-12px-regular font-[number:var(--font-100-12px-regular-font-weight)] text-gray-900 text-[length:var(--font-100-12px-regular-font-size)] tracking-[var(--font-100-12px-regular-letter-spacing)] leading-[var(--font-100-12px-regular-line-height)] [font-style:var(--font-100-12px-regular-font-style)]">
                          Vulnerability Import Documentation
                        </span>
                      </Button>

                      <Button 
                        onClick={() => setLocation("/vulnerability-import-wizard")}
                        className="h-[30px] gap-2 px-[10.4px] mr-[-8.30px] bg-teal-500 hover:bg-teal-500/90 border-teal-500 shadow-shadow-100"
                        data-testid="add-vulnerability-import-job-button"
                      >
                        <div className="w-3.5 h-3.5 bg-[url(/figmaAssets/plus-lg.svg)] bg-[100%_100%]" />
                        <span className="font-font-100-12px-regular font-[number:var(--font-100-12px-regular-font-weight)] text-[#e3f0f2] text-[length:var(--font-100-12px-regular-font-size)] tracking-[var(--font-100-12px-regular-letter-spacing)] leading-[var(--font-100-12px-regular-line-height)] [font-style:var(--font-100-12px-regular-font-style)]">
                          Vulnerability Import Job
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col w-full" data-testid="import-jobs-table">
                  {importJobs.map((job, index) => (
                    <div
                      key={job.id}
                      className={`flex items-start self-stretch w-full ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-b border-gray-200`}
                      data-testid={`import-job-row-${index}`}
                    >
                      <div className="flex flex-col w-20 justify-center gap-2 p-3 items-start relative">
                        <div className="flex items-center justify-center w-9 h-5 bg-teal-500 rounded-full relative">
                          <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 justify-center gap-2 p-3 items-start relative">
                        <span className="text-sm text-gray-900" data-testid={`job-auditboard-type-${index}`}>
                          {job.auditboardType}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 justify-center gap-2 p-3 items-start relative">
                        <span className="text-sm text-gray-900" data-testid={`job-tenable-type-${index}`}>
                          {job.tenableType}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 justify-center gap-2 p-3 items-start relative">
                        <span className="text-sm text-gray-900" data-testid={`job-frequency-${index}`}>
                          {job.frequency}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 justify-center gap-2 p-3 items-start relative">
                        <Badge className="h-5 bg-green-100 text-green-800 hover:bg-green-100" data-testid={`job-status-${index}`}>
                          <span className="text-xs">{job.status}</span>
                        </Badge>
                      </div>
                      <div className="flex flex-col flex-1 justify-center gap-2 p-3 items-start relative">
                        <span className="text-sm text-gray-900" data-testid={`job-last-import-${index}`}>
                          {job.lastImport}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 justify-center gap-2 p-3 items-start relative">
                        <span className="text-sm text-gray-900" data-testid={`job-next-import-${index}`}>
                          {job.nextImport}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-center gap-1 py-6 relative self-stretch w-full flex-[0_0_auto]">
                    <Button 
                      onClick={() => setLocation("/vulnerability-import-wizard")}
                      className="h-[30px] gap-2 px-[10.4px] bg-teal-500 hover:bg-teal-500/90 border-teal-500 shadow-shadow-100"
                      data-testid="add-another-vulnerability-import-job-button"
                    >
                      <div className="w-3.5 h-3.5 bg-[url(/figmaAssets/plus-lg.svg)] bg-[100%_100%]" />
                      <span className="font-font-100-12px-regular font-[number:var(--font-100-12px-regular-font-weight)] text-[#e3f0f2] text-[length:var(--font-100-12px-regular-font-size)] tracking-[var(--font-100-12px-regular-letter-spacing)] leading-[var(--font-100-12px-regular-line-height)] [font-style:var(--font-100-12px-regular-font-style)]">
                        Vulnerability Import Job
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
