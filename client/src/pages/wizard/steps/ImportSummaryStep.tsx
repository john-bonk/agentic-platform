import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VulnerabilityFinding {
  id: string;
  name: string;
  severity: "High" | "Critical";
  status: "New" | "In Progress";
  cvssScore: number;
}

const mockFindings: VulnerabilityFinding[] = [
  { id: "1", name: "Security Updates for Microsoft SharePoint Server 2016 (January 2022)", severity: "High", status: "New", cvssScore: 8 },
  { id: "2", name: "Missing or Permissive Content-Security-Policy frame-ancestors HTTP Response Header", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "3", name: "Apache Log4j2 Remote Code Execution Vulnerability (CVE-2021-44228)", severity: "Critical", status: "New", cvssScore: 10 },
  { id: "4", name: "OpenSSL Buffer Overflow Vulnerability (CVE-2022-3602)", severity: "High", status: "In Progress", cvssScore: 8 },
  { id: "5", name: "Microsoft Exchange Server Remote Code Execution (CVE-2022-41082)", severity: "Critical", status: "New", cvssScore: 9 },
  { id: "6", name: "Spring Framework RCE via Data Binding (CVE-2022-22965)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "7", name: "VMware Workspace ONE Access Authentication Bypass", severity: "High", status: "New", cvssScore: 8 },
  { id: "8", name: "Fortinet FortiOS SSL VPN Path Traversal (CVE-2022-42475)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "9", name: "Citrix ADC and Gateway Remote Code Execution (CVE-2022-27518)", severity: "Critical", status: "New", cvssScore: 9 },
  { id: "10", name: "F5 BIG-IP iControl REST Authentication Bypass (CVE-2022-1388)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "11", name: "Atlassian Confluence OGNL Injection (CVE-2022-26134)", severity: "Critical", status: "New", cvssScore: 9 },
  { id: "12", name: "SolarWinds Orion API Authentication Bypass (CVE-2020-10148)", severity: "High", status: "In Progress", cvssScore: 8 },
  { id: "13", name: "Zoho ManageEngine RCE via SAML (CVE-2022-47966)", severity: "Critical", status: "New", cvssScore: 9 },
  { id: "14", name: "Cisco IOS XE Web UI Privilege Escalation (CVE-2023-20198)", severity: "Critical", status: "In Progress", cvssScore: 10 },
  { id: "15", name: "MOVEit Transfer SQL Injection (CVE-2023-34362)", severity: "Critical", status: "New", cvssScore: 9 },
  { id: "16", name: "Barracuda Email Security Gateway RCE (CVE-2023-2868)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "17", name: "PaperCut NG/MF Authentication Bypass (CVE-2023-27350)", severity: "High", status: "New", cvssScore: 8 },
  { id: "18", name: "Ivanti EPMM Authentication Bypass (CVE-2023-35078)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "19", name: "Adobe ColdFusion Deserialization RCE (CVE-2023-38203)", severity: "Critical", status: "New", cvssScore: 9 },
  { id: "20", name: "JetBrains TeamCity Authentication Bypass (CVE-2023-42793)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "21", name: "Confluence Data Center Template Injection (CVE-2023-22515)", severity: "Critical", status: "New", cvssScore: 10 },
  { id: "22", name: "Curl SOCKS5 Heap Overflow (CVE-2023-38545)", severity: "High", status: "In Progress", cvssScore: 8 },
  { id: "23", name: "HTTP/2 Rapid Reset Attack (CVE-2023-44487)", severity: "High", status: "New", cvssScore: 8 },
  { id: "24", name: "Juniper Junos OS RCE (CVE-2023-36845)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "25", name: "Citrix NetScaler Information Disclosure (CVE-2023-4966)", severity: "High", status: "New", cvssScore: 8 },
  { id: "26", name: "Zyxel Firewall Command Injection (CVE-2023-28771)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "27", name: "Progress WS_FTP Server Directory Traversal (CVE-2023-40044)", severity: "Critical", status: "New", cvssScore: 9 },
  { id: "28", name: "Exim SMTP Server Buffer Overflow (CVE-2023-42115)", severity: "High", status: "In Progress", cvssScore: 8 },
  { id: "29", name: "Grafana Authentication Bypass (CVE-2023-3128)", severity: "Critical", status: "New", cvssScore: 9 },
  { id: "30", name: "Microsoft Outlook Privilege Escalation (CVE-2023-23397)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "31", name: "Redis Lua Sandbox Escape (CVE-2023-28856)", severity: "High", status: "New", cvssScore: 8 },
  { id: "32", name: "GitLab CE/EE Path Traversal RCE (CVE-2023-2825)", severity: "Critical", status: "In Progress", cvssScore: 10 },
  { id: "33", name: "Nginx LDAP Authentication Bypass", severity: "High", status: "New", cvssScore: 8 },
  { id: "34", name: "HashiCorp Vault Token Validation Bypass (CVE-2023-0620)", severity: "Critical", status: "In Progress", cvssScore: 9 },
  { id: "35", name: "Docker Desktop Privilege Escalation (CVE-2023-0626)", severity: "High", status: "New", cvssScore: 8 },
];

export const ImportSummaryStep = (): JSX.Element => {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <div className="flex flex-col gap-4 p-8 bg-white flex-shrink-0">
        <Card className="border border-gray-200 bg-gray-50" data-testid="import-summary-info-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-8 w-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#010818ed] mb-1" data-testid="import-summary-heading">
                  Confirm import job summary
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600"
                  >
                    <circle cx="8" cy="8" r="7" fill="currentColor" />
                    <path
                      d="M6 8.5L7.5 10L10.5 6.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span data-testid="import-summary-stats">
                    5,000 or more vulnerability findings will be imported from Tenable to AuditBoard
                  </span>
                </div>
                <p className="text-sm text-gray-600" data-testid="sample-limit-note">
                  Note: Vulnerabilities summarized below are limited to a sample of 5,000. However, all vulnerability assets under 10,000 records will be imported when the job is processed.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Import Job Schedule"
                  className="w-[320px] h-[34px]"
                  data-testid="import-schedule-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col flex-1 min-h-0 px-8 pb-8">
        <div className="flex flex-col flex-1 min-h-0 gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative flex-1 max-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -trangray-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="h-[30px] pl-9"
                data-testid="search-vulnerabilities-input"
              />
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-[30px] px-3 gap-2 bg-gray-100 hover:bg-gray-200"
                data-testid="filter-severity"
              >
                <span className="text-sm">Severity: High, Critical</span>
                <X className="w-3 h-3" />
              </Badge>

              <Badge
                variant="secondary"
                className="h-[30px] px-3 gap-2 bg-gray-100 hover:bg-gray-200"
                data-testid="filter-status"
              >
                <span className="text-sm">Status: New, In Progress</span>
                <X className="w-3 h-3" />
              </Badge>

              <Badge
                variant="secondary"
                className="h-[30px] px-3 gap-2 bg-gray-100 hover:bg-gray-200"
                data-testid="filter-cvss"
              >
                <span className="text-sm">CVSS Score {">"} 9.0</span>
                <X className="w-3 h-3" />
              </Badge>

              <Button
                variant="outline"
                className="h-[30px] px-3"
                data-testid="add-filter-button"
              >
                <span className="text-sm">Add Filter</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              className="h-[30px] px-0 text-sm text-gray-700"
              data-testid="clear-all-filters-button"
            >
              Clear All
            </Button>
          </div>

          <div className="flex flex-col flex-1 min-h-0 border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-auto">
              <table className="w-full" data-testid="vulnerabilities-summary-table">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-700 tracking-wide w-[928px]">
                      VULNERABILITY FINDING
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-700 tracking-wide w-[200px]">
                      SEVERITY
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-700 tracking-wide w-[200px]">
                      STATUS
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-700 tracking-wide w-[200px]">
                      CVSS SCORE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockFindings.map((finding, index) => (
                    <tr
                      key={finding.id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                      data-testid={`vulnerability-row-${index}`}
                    >
                      <td className="p-3 text-sm text-gray-900" data-testid={`vulnerability-name-${index}`}>
                        {finding.name}
                      </td>
                      <td className="p-3 text-sm" data-testid={`vulnerability-severity-${index}`}>
                        <span
                          className={`font-medium ${
                            finding.severity === "Critical"
                              ? "text-red-600"
                              : "text-orange-600"
                          }`}
                        >
                          {finding.severity}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-700" data-testid={`vulnerability-status-${index}`}>
                        {finding.status}
                      </td>
                      <td className="p-3 text-sm text-gray-900" data-testid={`vulnerability-cvss-${index}`}>
                        {finding.cvssScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-amber-600"
                >
                  <path
                    d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z"
                    fill="currentColor"
                  />
                </svg>
                <span data-testid="table-limit-message-summary">
                  This table is limited to a sample of 5,000 rows
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-[34px] px-3"
                  data-testid="page-size-button-summary"
                >
                  <span className="text-sm">50</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1"
                  >
                    <path
                      d="M3 5L6 8L9 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
                <span className="text-sm text-gray-700" data-testid="pagination-info-summary">
                  1 - 50 of 5,000
                </span>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-[34px] px-3 border-r"
                    data-testid="pagination-prev-button-summary"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                    >
                      <path
                        d="M10 3L5 8L10 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-[34px] px-3"
                    data-testid="pagination-next-button-summary"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                    >
                      <path
                        d="M6 3L11 8L6 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              className="h-auto p-0 gap-2 text-gray-700 hover:text-gray-900"
              data-testid="previous-step-button-summary"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm">Previous</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
