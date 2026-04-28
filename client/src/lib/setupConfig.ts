import {
  Briefcase,
  Database,
  FolderOpen,
  Users as UsersIcon,
  type LucideIcon,
} from "lucide-react";
import type {
  ComplianceScope,
  ConnectionId,
  DefaultTrigger,
  Industry,
  SolutionId,
} from "./setupStore";

export const ACCENT = "#266C92";
export const TOTAL_STEPS = 5;

export const INDUSTRIES: Industry[] = [
  "Financial Services",
  "Technology",
  "Healthcare",
  "Manufacturing",
  "Other",
];

export const COMPLIANCE_SCOPES: ComplianceScope[] = [
  "SOX",
  "TPRM",
  "ISO 27001",
  "HIPAA",
  "PCI",
  "Other",
];

export interface ConnectionDef {
  id: ConnectionId;
  name: string;
  description: string;
  Icon: LucideIcon;
}

export const CONNECTIONS: ConnectionDef[] = [
  {
    id: "grc",
    name: "GRC Platform",
    description: "Import controls, risks, and frameworks",
    Icon: Briefcase,
  },
  {
    id: "documents",
    name: "Document Store",
    description: "SharePoint, Google Drive, or file upload",
    Icon: FolderOpen,
  },
  {
    id: "hris",
    name: "HRIS",
    description: "Sync team and org structure",
    Icon: UsersIcon,
  },
  {
    id: "erp",
    name: "ERP / Procurement",
    description: "Vendor and spend data",
    Icon: Database,
  },
];

export interface SolutionDef {
  id: SolutionId;
  name: string;
  description: string;
}

export const SOLUTIONS: SolutionDef[] = [
  { id: "sox-control-testing", name: "SOX Control Testing", description: "Automated end-to-end control testing" },
  { id: "tprm", name: "TPRM", description: "Vendor risk assessment and monitoring" },
  { id: "risk-assessments", name: "Risk Assessments", description: "Identify, score, and treat risks" },
  { id: "pre-ipo-readiness", name: "Pre-IPO Readiness", description: "Track readiness across workstreams" },
  { id: "evidence-collection", name: "Evidence Collection", description: "Automate evidence request and intake" },
];

export interface TriggerOption {
  value: DefaultTrigger;
  label: string;
}

export const TRIGGER_OPTIONS: TriggerOption[] = [
  { value: "manual", label: "Manual (direct action)" },
  { value: "scheduled", label: "Scheduled" },
  { value: "per-workflow", label: "I'll configure per workflow" },
];
