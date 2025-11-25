import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RotateCcw, HelpCircle, Trash2 } from "lucide-react";

interface FieldMapping {
  id: string;
  tenableField: string;
  auditboardField: string;
  fieldType: "required" | "recommended";
}

const mockMappings: FieldMapping[] = [
  { id: "1", tenableField: "[field_name]", auditboardField: "", fieldType: "required" },
  { id: "2", tenableField: "CVE ID", auditboardField: "", fieldType: "required" },
  { id: "3", tenableField: "Created Time", auditboardField: "", fieldType: "recommended" },
  { id: "4", tenableField: "CVSS Score", auditboardField: "", fieldType: "recommended" },
  { id: "5", tenableField: "References", auditboardField: "", fieldType: "recommended" },
  { id: "6", tenableField: "Title", auditboardField: "", fieldType: "recommended" },
  { id: "7", tenableField: "Vulnerability Type", auditboardField: "", fieldType: "recommended" },
];

export const MapDetailsStep = (): JSX.Element => {
  const requiredCount = mockMappings.filter(m => m.fieldType === "required").length;
  const recommendedCount = mockMappings.filter(m => m.fieldType === "recommended").length;
  const customCount = 0;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-4 p-8 bg-white">
        <Card className="border border-gray-200" data-testid="map-details-info-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-8 w-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#010818ed] mb-1" data-testid="map-details-heading">
                  Provide field mappings for Vulnerability Details, the parent object to which vulnerability findings are attached
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-500"
                  >
                    <path
                      d="M8 2v12M2 8h12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span data-testid="field-mapping-stats-details">
                    0 of {requiredCount} required fields mapped • 0 of {recommendedCount} recommended fields mapped • {customCount} custom fields mapped
                  </span>
                </div>
                <p className="text-sm text-gray-600" data-testid="nvd-disclaimer">
                  Note: This product uses the NVD API but is not endorsed or certified by the NVD.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-8 gap-2 px-3 bg-white border border-gray-300"
                  data-testid="reset-mappings-button-details"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="font-normal text-sm text-gray-900">Reset</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-8 gap-2 px-3 bg-white border border-gray-300"
                  data-testid="suggest-mappings-button-details"
                >
                  <span className="font-normal text-sm text-gray-900">
                    Suggest Field Mappings
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col px-8 pb-8">
        <div className="flex flex-col gap-0">
          <div className="flex items-center mb-4">
            <div className="w-[707px] text-xs font-medium text-gray-700 tracking-wide">
              FIELD, TENABLE
            </div>
            <div className="w-4 mx-2" />
            <div className="flex-1 text-xs font-medium text-gray-700 tracking-wide">
              FIELD, AUDITBOARD
            </div>
          </div>

          {mockMappings.map((mapping, index) => (
            <div
              key={mapping.id}
              className={`flex items-center ${index === 0 ? "mb-2" : ""}`}
              data-testid={`field-mapping-row-details-${index}`}
            >
              <div className="w-[707px]">
                <div className={`h-[34px] flex items-center px-3 rounded border border-gray-300 bg-white ${index === 0 ? "pt-4 pb-4" : ""}`}>
                  <span className="text-sm text-gray-900">{mapping.tenableField}</span>
                  {mapping.fieldType === "required" && (
                    <span className="ml-auto text-xs text-gray-500 px-2 py-0.5 rounded bg-gray-100">
                      Required
                    </span>
                  )}
                  {mapping.fieldType === "recommended" && (
                    <span className="ml-auto text-xs text-gray-500 px-2 py-0.5 rounded bg-gray-100">
                      Recommended
                    </span>
                  )}
                </div>
              </div>

              <div className="w-4 mx-2 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-500"
                >
                  <path
                    d="M2 8h12M10 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <Select>
                  <SelectTrigger 
                    className="h-[34px] border-gray-300" 
                    data-testid={`auditboard-field-select-details-${index}`}
                  >
                    <SelectValue placeholder={mapping.fieldType === "required" ? "[Required]" : "[Recommended]"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field1" data-testid={`auditboard-option-field1-details-${index}`}>Field 1</SelectItem>
                    <SelectItem value="field2" data-testid={`auditboard-option-field2-details-${index}`}>Field 2</SelectItem>
                    <SelectItem value="field3" data-testid={`auditboard-option-field3-details-${index}`}>Field 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  data-testid={`help-button-details-${index}`}
                >
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  data-testid={`delete-mapping-details-${index}`}
                >
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <Button
              variant="outline"
              className="h-[34px] gap-2 px-3 bg-white border border-gray-300"
              data-testid="add-field-mapping-button-details"
            >
              <Plus className="w-4 h-4" />
              <span className="font-normal text-sm text-gray-900">
                Add Field Mapping
              </span>
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              className="h-auto p-0 gap-2 text-gray-700 hover:text-gray-900"
              data-testid="previous-step-button-details"
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
