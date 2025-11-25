import React from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <div className="flex flex-col items-start relative flex-1 self-stretch grow bg-white">
      <header className="items-start justify-center pt-8 pb-0 px-8 self-stretch w-full flex-[0_0_auto] bg-white flex flex-col relative">
        <div className="flex h-6 items-center gap-2 relative self-stretch w-full z-[2]">
          <div className="relative flex-1 font-font-200-14px-semibold font-[number:var(--font-200-14px-semibold-font-weight)] text-[#152741c9] text-[length:var(--font-200-14px-semibold-font-size)] tracking-[var(--font-200-14px-semibold-letter-spacing)] leading-[var(--font-200-14px-semibold-line-height)] [font-style:var(--font-200-14px-semibold-font-style)]">
            Installed Service
          </div>
        </div>

        <div className="flex items-start gap-4 relative self-stretch w-full flex-[0_0_auto] z-[1]">
          <div className="flex flex-col items-start justify-center gap-1 relative flex-1 grow">
            <h1 className="relative mt-[-1.00px] font-font-500-24px-medium font-[number:var(--font-500-24px-medium-font-weight)] text-[#010818ed] text-[length:var(--font-500-24px-medium-font-size)] tracking-[var(--font-500-24px-medium-letter-spacing)] leading-[var(--font-500-24px-medium-line-height)] [font-style:var(--font-500-24px-medium-font-style)]">
              Tenable
            </h1>

            <div className="flex items-center gap-1 pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
                <Badge className="h-4 bg-[#dbeaff] text-[#0e48a1] hover:bg-[#dbeaff] rounded-[999px] px-1.5 py-0">
                  <span className="font-font-50-11px-semibold font-[number:var(--font-50-11px-semibold-font-weight)] text-[length:var(--font-50-11px-semibold-font-size)] tracking-[var(--font-50-11px-semibold-letter-spacing)] leading-[var(--font-50-11px-semibold-line-height)] [font-style:var(--font-50-11px-semibold-font-style)]">
                    Valid
                  </span>
                </Badge>
              </div>

              <p className="relative flex-1 mt-[-0.50px] font-font-100-12px-regular font-[number:var(--font-100-12px-regular-font-weight)] text-[#010818ed] text-[length:var(--font-100-12px-regular-font-size)] tracking-[var(--font-100-12px-regular-letter-spacing)] leading-[var(--font-100-12px-regular-line-height)] [font-style:var(--font-100-12px-regular-font-style)]">
                Installation last checked January 1, 2025
              </p>
            </div>
          </div>

          <div className="w-[341px] items-end gap-3 flex flex-col relative">
            <div className="inline-flex items-center gap-3 relative flex-[0_0_auto]">
              <Button
                variant="outline"
                className="h-[34px] gap-2 px-[10.4px] bg-white shadow-shadow-100 border-none before:content-[''] before:absolute before:inset-0 before:p-px before:rounded before:[background:linear-gradient(180deg,rgba(226,232,240,1)_0%,rgba(203,213,225,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
              >
                <div className="w-4 h-4 ml-[-0.40px] opacity-85 bg-[url(/figmaAssets/module-narrative-.svg)] bg-[100%_100%]" />
                <span className="font-font-200-14px-regular font-[number:var(--font-200-14px-regular-font-weight)] text-slate-600 text-[length:var(--font-200-14px-regular-font-size)] tracking-[var(--font-200-14px-regular-letter-spacing)] leading-[var(--font-200-14px-regular-line-height)] [font-style:var(--font-200-14px-regular-font-style)]">
                  Tenable Documentation
                </span>
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="import"
          className="flex items-center pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] z-0 border-b border-slate-200"
        >
          <TabsList className="h-auto bg-transparent p-0 gap-0">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="inline-flex items-center gap-1 px-3 py-0 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#3172e3]"
              >
                <span className="[font-family:'SF_Pro_Display-Semibold',Helvetica] font-normal text-sm tracking-[0] leading-10 data-[state=active]:text-[#3172e3] text-[#152741c9]">
                  {tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      <main className="flex items-start relative flex-1 self-stretch w-full grow overflow-y-scroll">
        <div className="flex items-start justify-between relative flex-1 self-stretch grow">
          <div className="flex flex-col items-start gap-6 pt-6 pb-0 px-8 relative flex-1 self-stretch grow">
            <Card className="self-stretch w-full rounded-lg border border-slate-200 [background:radial-gradient(50%_50%_at_115%_-44%,rgba(1,51,101,0.03)_0%,rgba(1,51,101,0.03)_100%)]">
              <CardContent className="flex flex-col items-start gap-6 p-6">
                <div className="gap-1 flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                  <h2 className="relative self-stretch mt-[-1.00px] font-font-400-18px-semibold font-[number:var(--font-400-18px-semibold-font-weight)] text-slate-900 text-[length:var(--font-400-18px-semibold-font-size)] tracking-[var(--font-400-18px-semibold-letter-spacing)] leading-[var(--font-400-18px-semibold-line-height)] [font-style:var(--font-400-18px-semibold-font-style)]">
                    Liability Statement for Tenable Vulnerability Import Jobs
                  </h2>

                  <p className="relative self-stretch font-font-200-14px-light font-[number:var(--font-200-14px-light-font-weight)] text-slate-900 text-[length:var(--font-200-14px-light-font-size)] tracking-[var(--font-200-14px-light-letter-spacing)] leading-[var(--font-200-14px-light-line-height)] [font-style:var(--font-200-14px-light-font-style)]">
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
                  <Button className="h-[34px] gap-2 px-[10.4px] bg-[#266c92] hover:bg-[#266c92]/90 rounded border border-solid shadow-shadow-100">
                    <span className="font-font-200-14px-regular font-[number:var(--font-200-14px-regular-font-weight)] text-white text-[length:var(--font-200-14px-regular-font-size)] tracking-[var(--font-200-14px-regular-letter-spacing)] leading-[var(--font-200-14px-regular-line-height)] [font-style:var(--font-200-14px-regular-font-style)]">
                      Accept
                    </span>
                  </Button>

                  <Button
                    variant="secondary"
                    className="h-[34px] gap-2 px-[10.4px] bg-slate-100 hover:bg-slate-200 rounded"
                  >
                    <span className="font-font-200-14px-regular font-[number:var(--font-200-14px-regular-font-weight)] text-slate-900 text-[length:var(--font-200-14px-regular-font-size)] tracking-[var(--font-200-14px-regular-letter-spacing)] leading-[var(--font-200-14px-regular-line-height)] [font-style:var(--font-200-14px-regular-font-style)]">
                      Decline
                    </span>
                  </Button>
                </footer>
              </CardContent>
            </Card>

            <section className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
              <h2 className="relative self-stretch mt-[-1.00px] font-font-400-18px-semibold font-[number:var(--font-400-18px-semibold-font-weight)] text-slate-900 text-[length:var(--font-400-18px-semibold-font-size)] tracking-[var(--font-400-18px-semibold-letter-spacing)] leading-[var(--font-400-18px-semibold-line-height)] [font-style:var(--font-400-18px-semibold-font-style)]">
                Vulnerability Import Jobs
              </h2>

              <p className="relative self-stretch font-font-200-14px-regular font-[number:var(--font-200-14px-regular-font-weight)] text-slate-700 text-[length:var(--font-200-14px-regular-font-size)] tracking-[var(--font-200-14px-regular-letter-spacing)] leading-[var(--font-200-14px-regular-line-height)] [font-style:var(--font-200-14px-regular-font-style)]">
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
                        <div className="relative w-fit mt-[-1.00px] [font-family:'SF_Pro_Display-Medium',Helvetica] font-medium text-slate-700 text-xs tracking-[0.35px] leading-[18px] whitespace-nowrap">
                          {header.label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col max-w-[400px] items-center gap-2 px-4 py-5 relative w-full flex-[0_0_auto] rounded">
                <div className="gap-4 flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                  <div className="gap-2 pt-2 pb-0 px-0 flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                    <h3 className="relative flex items-center justify-center self-stretch mt-[-1.00px] font-font-400-18px-medium font-[number:var(--font-400-18px-medium-font-weight)] text-slate-900 text-[length:var(--font-400-18px-medium-font-size)] text-center tracking-[var(--font-400-18px-medium-letter-spacing)] leading-[var(--font-400-18px-medium-line-height)] [font-style:var(--font-400-18px-medium-font-style)]">
                      No vulnerability import jobs found
                    </h3>

                    <p className="relative self-stretch font-font-200-14px-regular font-[number:var(--font-200-14px-regular-font-weight)] text-slate-700 text-[length:var(--font-200-14px-regular-font-size)] text-center tracking-[var(--font-200-14px-regular-letter-spacing)] leading-[var(--font-200-14px-regular-line-height)] [font-style:var(--font-200-14px-regular-font-style)]">
                      Currently there are no import jobs between Tenable and
                      AuditBoard. Add one below.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
                    <Button
                      variant="outline"
                      className="h-[30px] gap-2 px-[10.4px] ml-[-8.30px] bg-white border-slate-300"
                    >
                      <div className="w-3.5 h-3.5 bg-[url(/figmaAssets/module-narrative-.svg)] bg-[100%_100%]" />
                      <span className="font-font-100-12px-regular font-[number:var(--font-100-12px-regular-font-weight)] text-slate-900 text-[length:var(--font-100-12px-regular-font-size)] tracking-[var(--font-100-12px-regular-letter-spacing)] leading-[var(--font-100-12px-regular-line-height)] [font-style:var(--font-100-12px-regular-font-style)]">
                        Vulnerability Import Documentation
                      </span>
                    </Button>

                    <Button 
                      onClick={() => setLocation("/vulnerability-import-wizard")}
                      className="h-[30px] gap-2 px-[10.4px] mr-[-8.30px] bg-[#3f85b2] hover:bg-[#3f85b2]/90 border-[#266c92] shadow-shadow-100"
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
