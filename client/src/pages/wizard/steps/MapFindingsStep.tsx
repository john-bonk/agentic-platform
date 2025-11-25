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
  fieldType: "required" | "recommended" | "custom";
}

const mockMappings: FieldMapping[] = [
  { id: "1", tenableField: "[Rule_name]", auditboardField: "", fieldType: "required" },
  { id: "2", tenableField: "Category ID", auditboardField: "", fieldType: "required" },
  { id: "3", tenableField: "Class ID", auditboardField: "", fieldType: "required" },
  { id: "4", tenableField: "Event Time", auditboardField: "", fieldType: "required" },
  { id: "5", tenableField: "Finding Information", auditboardField: "", fieldType: "required" },
  { id: "6", tenableField: "Metadata", auditboardField: "", fieldType: "required" },
  { id: "7", tenableField: "Severity ID", auditboardField: "", fieldType: "required" },
  { id: "8", tenableField: "Vulnerabilities", auditboardField: "", fieldType: "required" },
  { id: "9", tenableField: "Affected Resources", auditboardField: "", fieldType: "recommended" },
  { id: "10", tenableField: "Confidence ID", auditboardField: "", fieldType: "recommended" },
  { id: "11", tenableField: "Device", auditboardField: "", fieldType: "recommended" },
  { id: "12", tenableField: "Message", auditboardField: "", fieldType: "recommended" },
  { id: "13", tenableField: "Observables", auditboardField: "", fieldType: "recommended" },
  { id: "14", tenableField: "Status Code", auditboardField: "", fieldType: "recommended" },
  { id: "15", tenableField: "Status Detail", auditboardField: "", fieldType: "recommended" },
  { id: "16", tenableField: "Status ID", auditboardField: "", fieldType: "recommended" },
];

export const MapFindingsStep = (): JSX.Element => {
  const requiredCount = mockMappings.filter(m => m.fieldType === "required").length;
  const recommendedCount = mockMappings.filter(m => m.fieldType === "recommended").length;
  const customCount = 6;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-4 p-8 bg-white">
        <Card className="border border-gray-200 bg-gray-50" data-testid="map-findings-info-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-8 w-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#010818ed] mb-1" data-testid="map-findings-heading">
                  Provide field mappings for Vulnerability Findings, the events and metadata that make up a vulnerability
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-700">
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
                  <span data-testid="field-mapping-stats">
                    0 of {requiredCount} required fields mapped • 0 of {recommendedCount} recommended fields mapped • {customCount} custom fields mapped
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-8 gap-2 px-3 bg-white border border-gray-300"
                  data-testid="reset-mappings-button"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="font-normal text-sm text-gray-900">Reset</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-8 gap-2 px-3 bg-white border border-gray-300"
                  data-testid="suggest-mappings-button"
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
              data-testid={`field-mapping-row-${index}`}
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
                    data-testid={`auditboard-field-select-${index}`}
                  >
                    <SelectValue placeholder={mapping.fieldType === "required" ? "[Required]" : "[Recommended]"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field1" data-testid={`auditboard-option-field1-${index}`}>Field 1</SelectItem>
                    <SelectItem value="field2" data-testid={`auditboard-option-field2-${index}`}>Field 2</SelectItem>
                    <SelectItem value="field3" data-testid={`auditboard-option-field3-${index}`}>Field 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  data-testid={`help-button-${index}`}
                >
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  data-testid={`delete-mapping-${index}`}
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
              data-testid="add-field-mapping-button"
            >
              <Plus className="w-4 h-4" />
              <span className="font-normal text-sm text-gray-900">
                Add Field Mapping
              </span>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
