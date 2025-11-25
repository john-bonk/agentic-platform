import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const mockAssets = [
  { tenableId: "123abc_987xyz", auditboardId: "123abc_987xyz", name: "Amazon EC2 - 123abc_987xyz", matched: true },
  { tenableId: "987xyz_123abc", auditboardId: "987xyz_123abc", name: "Amazon EC2 - 987xyz_123abc", matched: true },
  { tenableId: "456def_654fed", auditboardId: "456def_654fed", name: "Amazon S3 - 456def_654fed", matched: true },
  { tenableId: "789ghi_321ihg", auditboardId: "789ghi_321ihg", name: "Azure VM - 789ghi_321ihg", matched: true },
  { tenableId: "abc123_xyz789", auditboardId: "abc123_xyz789", name: "GCP Compute - abc123_xyz789", matched: true },
  { tenableId: "def456_uvw654", auditboardId: "def456_uvw654", name: "AWS Lambda - def456_uvw654", matched: true },
  { tenableId: "ghi789_rst321", auditboardId: "ghi789_rst321", name: "Azure SQL - ghi789_rst321", matched: true },
  { tenableId: "jkl012_opq210", auditboardId: "jkl012_opq210", name: "AWS RDS - jkl012_opq210", matched: true },
  { tenableId: "mno345_lmn543", auditboardId: "mno345_lmn543", name: "GCP Storage - mno345_lmn543", matched: true },
  { tenableId: "pqr678_ijk876", auditboardId: "pqr678_ijk876", name: "Azure Blob - pqr678_ijk876", matched: true },
  { tenableId: "stu901_fgh109", auditboardId: "stu901_fgh109", name: "AWS EKS - stu901_fgh109", matched: true },
  { tenableId: "vwx234_cde432", auditboardId: "vwx234_cde432", name: "GCP GKE - vwx234_cde432", matched: true },
  { tenableId: "yza567_bab765", auditboardId: "yza567_bab765", name: "Azure AKS - yza567_bab765", matched: true },
  { tenableId: "bcd890_zyz098", auditboardId: "bcd890_zyz098", name: "AWS DynamoDB - bcd890_zyz098", matched: true },
  { tenableId: "efg123_wvw321", auditboardId: "efg123_wvw321", name: "GCP BigQuery - efg123_wvw321", matched: true },
  { tenableId: "hij456_tut654", auditboardId: "hij456_tut654", name: "Azure CosmosDB - hij456_tut654", matched: true },
  { tenableId: "klm789_qrq987", auditboardId: "klm789_qrq987", name: "AWS CloudFront - klm789_qrq987", matched: true },
  { tenableId: "nop012_nop210", auditboardId: "nop012_nop210", name: "GCP CDN - nop012_nop210", matched: true },
  { tenableId: "qrs345_klk543", auditboardId: "qrs345_klk543", name: "Azure CDN - qrs345_klk543", matched: true },
  { tenableId: "tuv678_hih876", auditboardId: "tuv678_hih876", name: "AWS SNS - tuv678_hih876", matched: true },
  { tenableId: "wxy901_efe109", auditboardId: "wxy901_efe109", name: "GCP Pub/Sub - wxy901_efe109", matched: true },
  { tenableId: "zab234_bcb432", auditboardId: "zab234_bcb432", name: "Azure Service Bus - zab234_bcb432", matched: true },
  { tenableId: "cde567_yzy765", auditboardId: "cde567_yzy765", name: "AWS SQS - cde567_yzy765", matched: true },
  { tenableId: "fgh890_vwv098", auditboardId: "fgh890_vwv098", name: "GCP Firestore - fgh890_vwv098", matched: true },
  { tenableId: "ijk123_sts321", auditboardId: "ijk123_sts321", name: "Azure Functions - ijk123_sts321", matched: true },
  { tenableId: "lmn456_pqp654", auditboardId: "lmn456_pqp654", name: "AWS API Gateway - lmn456_pqp654", matched: true },
  { tenableId: "opq789_mnm987", auditboardId: "opq789_mnm987", name: "GCP API Gateway - opq789_mnm987", matched: true },
  { tenableId: "rst012_jkj210", auditboardId: "rst012_jkj210", name: "Azure API Mgmt - rst012_jkj210", matched: true },
  { tenableId: "uvw345_ghg543", auditboardId: "uvw345_ghg543", name: "AWS Cognito - uvw345_ghg543", matched: true },
  { tenableId: "xyz678_ded876", auditboardId: "xyz678_ded876", name: "GCP Identity - xyz678_ded876", matched: true },
  { tenableId: "345def_876pqr", auditboardId: "—", name: "—", matched: false },
  { tenableId: "32def_123abc", auditboardId: "—", name: "—", matched: false },
  { tenableId: "456hyn_766xyz", auditboardId: "—", name: "—", matched: false },
  { tenableId: "789jkl_543mno", auditboardId: "—", name: "—", matched: false },
  { tenableId: "012pqr_876stu", auditboardId: "—", name: "—", matched: false },
];

export const MapAssetsStep = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-4 p-8 bg-white">
        <Card className="border border-gray-200 bg-gray-50" data-testid="map-assets-info-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-8 w-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#010818ed] mb-1" data-testid="map-assets-heading">
                  Identify matching assets between Tenable and AuditBoard to import as vulnerabilities
                </h3>
                {!isLoading && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
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
                      <span data-testid="matching-stats">
                        4,996 or more matching assets • 2 unmatched in Tenable • 2 unmatched in AuditBoard
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2" data-testid="sample-note">
                      Note: Assets matched below are limited to a sample of 5,000. However, all matched assets will be imported when the job is processed.
                    </p>
                  </>
                )}
                {isLoading && (
                  <p className="text-sm text-gray-500 mt-1" data-testid="loading-message">
                    Processing asset data from Tenable and AuditBoard...
                  </p>
                )}
              </div>

              {!isLoading && (
                <div className="flex items-center gap-4">
                  <Select defaultValue="tenable-id">
                    <SelectTrigger className="w-[320px] h-[34px]" data-testid="mapping-key-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenable-id" data-testid="mapping-key-option-tenable-id">Mapping Key Column: Tenable ID</SelectItem>
                      <SelectItem value="asset-name" data-testid="mapping-key-option-asset-name">Mapping Key Column: Asset Name</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    className="h-8 gap-2 px-3 bg-white border border-gray-300"
                    data-testid="identify-matched-button"
                  >
                    <span className="font-normal text-sm text-gray-900">
                      Identify Matched for Mapping
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col px-8 pb-8">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="assets-mapping-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-gray-700 tracking-wide">
                    TENABLE ASSET UID
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gray-700 tracking-wide">
                    AUDITBOARD INVENTORY UID
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gray-700 tracking-wide">
                    AUDITBOARD INVENTORY NAME
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gray-700 tracking-wide">
                    IS MATCHED
                  </th>
                </tr>
              </thead>
              {!isLoading && (
                <tbody>
                  {mockAssets.map((asset, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                      data-testid={`asset-row-${index}`}
                    >
                      <td className="p-3 text-sm text-gray-900" data-testid={`tenable-id-${index}`}>{asset.tenableId}</td>
                      <td className="p-3 text-sm text-gray-900" data-testid={`auditboard-id-${index}`}>{asset.auditboardId}</td>
                      <td className="p-3 text-sm text-gray-900" data-testid={`asset-name-${index}`}>{asset.name}</td>
                      <td className="p-3 text-sm" data-testid={`is-matched-${index}`}>
                        {asset.matched ? (
                          <span className="text-green-600 font-medium">True</span>
                        ) : (
                          <span className="text-gray-400">False</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 bg-white" data-testid="loading-spinner-container">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" data-testid="loading-spinner" />
              <p className="mt-4 text-sm text-gray-600">Loading asset data...</p>
            </div>
          )}

          {!isLoading && (
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
                <span data-testid="table-limit-message">This table is limited to a sample of 5,000 rows</span>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="h-[34px] px-3" data-testid="page-size-button">
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
                <span className="text-sm text-gray-700" data-testid="pagination-info">1 - 50 of 5,000</span>
                <div className="flex">
                  <Button variant="ghost" size="sm" className="h-[34px] px-3 border-r" data-testid="pagination-prev-button">
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
                  <Button variant="ghost" size="sm" className="h-[34px] px-3" data-testid="pagination-next-button">
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
          )}
        </div>
      </div>
    </div>
  );
};
