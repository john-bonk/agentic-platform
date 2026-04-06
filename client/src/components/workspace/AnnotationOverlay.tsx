import { useState, useMemo } from "react";
import {
  X, ChevronLeft, ChevronRight, ChevronDown, FileText, Mail, Paperclip,
  CheckCircle2, XCircle, AlertCircle, Search, ZoomIn, ZoomOut, Download,
  Pen, Square, Type, MoreHorizontal, Shield, Sparkles, ExternalLink,
  Circle, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AttributeResult = {
  result: "Effective" | "Ineffective" | "Missing" | "N/A";
  confidence: "High" | "Medium" | "Low";
};

type SampleAttributeDetail = {
  key: string;
  title: string;
  description: string;
  sourceDoc: string;
  sourceLocation: string;
  result: "Effective" | "Ineffective" | "Missing" | "N/A";
  confidence: "High" | "Medium" | "Low";
};

type SampleTestRow = {
  id: string;
  label: string;
  subtitle: string;
  attributes: Record<string, AttributeResult>;
  overall: "Effective" | "Ineffective" | "Incomplete";
  details: SampleAttributeDetail[];
};

type AnnotationOverlayProps = {
  samples: SampleTestRow[];
  initialSampleId: string;
  initialAttributeKey: string;
  controlId: string;
  onClose: () => void;
};

const attributeLabels: Record<string, string> = {
  A1: "SoD Matrix Completeness",
  A2: "Conflict Identification",
  A3: "Remediation Timeliness",
  A4: "Quarterly Review Sign-off",
  A5: "Exception Approval",
};

const attributeShortLabels: Record<string, string> = {
  A1: "A - SoD Matrix Complete...",
  A2: "B - Conflict Identificati...",
  A3: "C - Remediation Timeli...",
  A4: "D - Quarterly Review...",
  A5: "E - Exception Approval...",
};

function getEvidenceDocuments(sample: SampleTestRow, detail: SampleAttributeDetail): { name: string; type: string; hasAnnotation: boolean }[] {
  const docs: { name: string; type: string; hasAnnotation: boolean }[] = [];

  if (detail.key === "A1") {
    docs.push({ name: "SoD_Matrix_2025.xlsx", type: "spreadsheet", hasAnnotation: detail.result !== "Effective" });
    docs.push({ name: "P-114_SoD_Policy.pdf", type: "pdf", hasAnnotation: false });
  } else if (detail.key === "A2") {
    docs.push({ name: "UserAccess_Dec2025.csv", type: "spreadsheet", hasAnnotation: detail.result !== "Effective" });
    docs.push({ name: "SoD_Scan_Log_2025.pdf", type: "pdf", hasAnnotation: false });
    docs.push({ name: "conflict-detection-email.msg", type: "email", hasAnnotation: true });
  } else if (detail.key === "A3") {
    if (detail.result !== "N/A" && detail.result !== "Missing") {
      docs.push({ name: "RoleChangeLog_2025.csv", type: "spreadsheet", hasAnnotation: detail.result === "Ineffective" });
      docs.push({ name: "remediation-approval.msg", type: "email", hasAnnotation: false });
    }
    if (detail.result === "Missing") {
      docs.push({ name: "resolution-request.msg", type: "email", hasAnnotation: true });
    }
  } else if (detail.key === "A4") {
    const qPkg = detail.sourceDoc || "Q1_SoD_Review_Package.pdf";
    docs.push({ name: qPkg, type: "pdf", hasAnnotation: detail.result !== "Effective" });
    docs.push({ name: "review-signoff-email.msg", type: "email", hasAnnotation: false });
  } else if (detail.key === "A5") {
    if (detail.result === "Effective") {
      docs.push({ name: detail.sourceDoc || "RiskAcceptance_Form.pdf", type: "pdf", hasAnnotation: false });
      docs.push({ name: "exception-approval-email.msg", type: "email", hasAnnotation: false });
    }
    if (detail.result === "Missing") {
      docs.push({ name: "exception-inquiry.msg", type: "email", hasAnnotation: true });
    }
  }

  if (docs.length === 0) {
    docs.push({ name: "no-evidence-available.txt", type: "text", hasAnnotation: false });
  }

  return docs;
}

function getAnnotations(sample: SampleTestRow, detail: SampleAttributeDetail): { id: string; result: string; title: string; reasoning: string; source: string }[] {
  if (detail.result === "Effective" || detail.result === "N/A") return [];

  const sampleLabel = sample.label.replace(/^S\d+ — /, "");
  const userId = sample.subtitle.split("/")[1]?.trim() || "U-0000";

  if (detail.result === "Ineffective") {
    if (detail.key === "A3") {
      return [{
        id: "ann-1",
        result: "Ineffective",
        title: `"${userId}, SLA Breach"`,
        reasoning: `EXCEPTION: ${detail.description.split(".")[0]}. Exceeds P-114 §6.1 SLA requirement.`,
        source: `${detail.sourceDoc} · Auto Annotate AI`,
      }];
    }
    if (detail.key === "A1") {
      return [{
        id: "ann-1",
        result: "Ineffective",
        title: `"${sampleLabel}, Matrix Gap"`,
        reasoning: `EXCEPTION: ${detail.description.split(".")[0]}. Matrix definition does not meet completeness requirements.`,
        source: `${detail.sourceDoc} · Auto Annotate AI`,
      }];
    }
    if (detail.key === "A2") {
      return [{
        id: "ann-1",
        result: "Ineffective",
        title: `"${sampleLabel}, Detection Failure"`,
        reasoning: `EXCEPTION: ${detail.description.split(".")[0]}. Detection did not meet accuracy or timeliness requirements.`,
        source: `${detail.sourceDoc} · Auto Annotate AI`,
      }];
    }
    if (detail.key === "A4") {
      return [{
        id: "ann-1",
        result: "Ineffective",
        title: `"${sampleLabel}, Review Gap"`,
        reasoning: `EXCEPTION: ${detail.description.split(".")[0]}. Quarterly review did not adequately address the conflict.`,
        source: `${detail.sourceDoc} · Auto Annotate AI`,
      }];
    }
  }

  if (detail.result === "Missing") {
    return [{
      id: "ann-1",
      result: "Missing",
      title: `"${userId}, Evidence Missing"`,
      reasoning: `MISSING EVIDENCE: ${detail.description.split(".")[0]}. Required documentation not available.`,
      source: `Auto Annotate AI`,
    }];
  }

  return [];
}

function getSampleDetails(sample: SampleTestRow): { label: string; value: string }[] {
  const parts = sample.subtitle.split(" / ");
  const conflictPair = sample.label.replace(/^S\d+ — /, "");
  return [
    { label: "Sample ID", value: sample.id.toUpperCase() },
    { label: "Conflict Pair", value: conflictPair },
    { label: "Department", value: parts[0] || "—" },
    { label: "User ID", value: parts[1] || "—" },
    { label: "Risk Tier", value: parts[2] || "—" },
    { label: "Overall Result", value: sample.overall },
  ];
}

function getAttributeDetails(detail: SampleAttributeDetail): { label: string; value: string }[] {
  return [
    { label: "Attribute", value: `${detail.key}: ${detail.title}` },
    { label: "Test Result", value: detail.result },
    { label: "Confidence", value: detail.confidence },
    { label: "Source Document", value: detail.sourceDoc || "N/A" },
    { label: "Source Location", value: detail.sourceLocation || "N/A" },
  ];
}

const testProcedures = [
  "Inspect the SoD conflict matrix for completeness of conflict pair definition and risk categorization.",
  "Verify conflict was identified by the automated scanning process within the expected scan cycle.",
  "Confirm remediation was executed within the SLA defined in P-114 §6.1 (5 business days).",
  "Validate quarterly review sign-off includes all required attendees and documented action items.",
  "Where applicable, confirm exception/risk acceptance is properly documented with compensating controls.",
];

const resultStatusColor = (r: string) =>
  r === "Effective" ? "text-emerald-600 dark:text-emerald-400" :
  r === "N/A" ? "text-slate-400 dark:text-slate-500" :
  r === "Ineffective" ? "text-red-600 dark:text-red-400" :
  "text-amber-600 dark:text-amber-400";

const resultStatusBg = (r: string) =>
  r === "Effective" ? "bg-emerald-50 dark:bg-emerald-900/20" :
  r === "N/A" ? "bg-slate-100 dark:bg-slate-800/30" :
  r === "Ineffective" ? "bg-red-50 dark:bg-red-900/20" :
  "bg-amber-50 dark:bg-amber-900/20";

const resultDot = (r: string) =>
  r === "Effective" ? "bg-emerald-500" :
  r === "N/A" ? "bg-slate-400" :
  r === "Ineffective" ? "bg-red-500" :
  "bg-amber-500";

const confidenceBadgeColor = (c: string) =>
  c === "High" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
  c === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

function EmailPreview({ sample, detail }: { sample: SampleTestRow; detail: SampleAttributeDetail }) {
  const parts = sample.subtitle.split(" / ");
  const dept = parts[0] || "Finance";
  const userId = parts[1]?.trim() || "U-0000";
  const conflictPair = sample.label.replace(/^S\d+ — /, "");

  const senderNames: Record<string, { name: string; title: string; email: string }> = {
    "Finance": { name: "Michael Torres", title: "AP Manager", email: "m.torres@acmecorp.com" },
    "Accounting": { name: "Sarah Chen", title: "GL Manager", email: "s.chen@acmecorp.com" },
    "Revenue": { name: "James Park", title: "AR Supervisor", email: "j.park@acmecorp.com" },
    "IT/Finance": { name: "David Kim", title: "IT Controls Manager", email: "d.kim@acmecorp.com" },
    "Procurement": { name: "Lisa Wong", title: "Procurement Lead", email: "l.wong@acmecorp.com" },
    "Fixed Assets": { name: "Robert Martinez", title: "Asset Controller", email: "r.martinez@acmecorp.com" },
    "HR-Payroll": { name: "Jennifer Adams", title: "Payroll Manager", email: "j.adams@acmecorp.com" },
  };

  const sender = senderNames[dept] || senderNames["Finance"]!;

  let emailSubject = "";
  let emailBody = "";
  let attachmentName = "";

  if (detail.key === "A2") {
    emailSubject = `RE: SoD Conflict Detection — ${conflictPair} (${userId})`;
    emailBody = `Team,\n\nThe automated SoD scan has identified a segregation of duties conflict for user ${userId}.\n\nConflict pair: ${conflictPair}\nDetection date: ${detail.description.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "2025-01-15"}\nRisk classification: ${parts[2]?.trim() || "High"}\n\n${detail.description.split(".").slice(0, 2).join(".")}.\n\nPlease review and initiate appropriate remediation action per P-114 §6.1.\n\nRegards,\n${sender.name}\n${sender.title}\nAcme Corporation\nTel: (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
    attachmentName = `SoD_Scan_Report_${userId}.pdf`;
  } else if (detail.key === "A3") {
    emailSubject = `RE: Role Change Request — ${conflictPair} Remediation`;
    emailBody = `Team,\n\nI have reviewed the role change request for user ${userId} and ${detail.result === "Effective" ? "approve the remediation for processing" : "note the following concern"}.\n\n${detail.description.split(".").slice(0, 2).join(".")}.\n\nPlease ensure all role changes are executed per the standard change management process.\n\nRegards,\n${sender.name}\n${sender.title}\nAcme Corporation\nTel: (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
    attachmentName = `RoleChange_${userId}.pdf`;
  } else {
    emailSubject = `RE: SoD Control Testing — ${conflictPair}`;
    emailBody = `Team,\n\nRegarding the ${detail.title.toLowerCase()} testing for the ${conflictPair} conflict pair.\n\n${detail.description.split(".").slice(0, 3).join(".")}.\n\nPlease review and confirm.\n\nRegards,\n${sender.name}\n${sender.title}\nAcme Corporation\nTel: (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
    attachmentName = detail.sourceDoc || `Evidence_${detail.key}.pdf`;
  }

  const detectionDate = detail.description.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "2025-03-15";
  const dateObj = new Date(detectionDate);
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const formattedTime = "3:32 PM";

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background">
      <div className="bg-[#0078D4] dark:bg-[#1a5276] rounded-t-lg px-5 py-3 flex items-center gap-2.5">
        <Mail className="w-4 h-4 text-white/90" />
        <span className="text-sm font-medium text-white">Mail — Outlook</span>
      </div>
      <div className="px-5 py-4 border-b border-slate-200 dark:border-border space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#266C92] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {sender.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{sender.name}</span>
              <span className="text-xs text-muted-foreground">&lt;{sender.email}&gt;</span>
            </div>
            <span className="text-[11px] text-muted-foreground">To: SoD Compliance Team &lt;sod-compliance@acmecorp.com&gt;</span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{formattedDate} {formattedTime}</span>
        </div>
        <h3 className="text-sm font-semibold text-foreground">{emailSubject}</h3>
      </div>
      <div className="flex-1 px-5 py-4 overflow-auto">
        <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">{emailBody}</div>
        {attachmentName && (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/20">
            <Paperclip className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs text-[#266C92] font-medium">{attachmentName}</span>
            <span className="text-[10px] text-muted-foreground">(245 KB)</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SpreadsheetPreview({ detail }: { detail: SampleAttributeDetail }) {
  const isMatrix = detail.key === "A1";
  const isUserAccess = detail.key === "A2";
  const isRoleChange = detail.key === "A3";

  const headers = isMatrix
    ? ["Row", "Function A", "Function B", "T-Code A", "T-Code B", "Risk", "Status"]
    : isUserAccess
    ? ["Record", "User ID", "Role A", "Role B", "Assigned", "Detected", "Status"]
    : ["Change ID", "User", "Role Removed", "Requested", "Completed", "Days", "SLA Met"];

  const rowNum = detail.sourceLocation.match(/\d[\d,]*/)?.[0] || "47";

  const sampleData = isMatrix
    ? [
        [rowNum, detail.title.split(" ")[0] || "AP-Create", detail.title.split(" ")[2] || "AP-Approve", "FB01", "FK01", "Critical", detail.result],
      ]
    : isUserAccess
    ? [
        [rowNum, detail.description.match(/U-\d+/)?.[0] || "U-1204", "Role A", "Role B", "2024-08-14", detail.description.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "2025-02-12", detail.result],
      ]
    : [
        [detail.sourceLocation.match(/RC-[\d-]+/)?.[0] || "RC-2025-001", detail.description.match(/U-\d+/)?.[0] || "U-1204", "Conflicting Role", detail.description.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "2025-02-12", "2025-02-28", detail.result === "Effective" ? "Yes" : "No", detail.result],
      ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background">
      <div className="bg-[#217346] dark:bg-[#1a5a36] rounded-t-lg px-5 py-3 flex items-center gap-2.5">
        <FileText className="w-4 h-4 text-white/90" />
        <span className="text-sm font-medium text-white">Spreadsheet Viewer</span>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="border border-slate-200 dark:border-border rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-muted/30">
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold text-muted-foreground border-b border-r border-slate-200 dark:border-border last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, i) => (
                <tr key={`before-${i}`} className="text-muted-foreground/40">
                  <td className="px-3 py-1.5 border-b border-r border-slate-100 dark:border-border/30 last:border-r-0" colSpan={headers.length}>
                    <span className="text-[10px]">···</span>
                  </td>
                </tr>
              ))}
              {sampleData.map((row, ri) => (
                <tr key={ri} className="bg-amber-50/50 dark:bg-amber-900/10 ring-2 ring-inset ring-amber-400/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-3 py-2 border-b border-r border-slate-200 dark:border-border last:border-r-0 font-medium ${ci === row.length - 1 ? resultStatusColor(cell) : "text-foreground"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {[...Array(3)].map((_, i) => (
                <tr key={`after-${i}`} className="text-muted-foreground/40">
                  <td className="px-3 py-1.5 border-b border-r border-slate-100 dark:border-border/30 last:border-r-0" colSpan={headers.length}>
                    <span className="text-[10px]">···</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PdfPreview({ detail }: { detail: SampleAttributeDetail }) {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-background">
      <div className="bg-[#B30B00] dark:bg-[#8a1a12] rounded-t-lg px-5 py-3 flex items-center gap-2.5">
        <FileText className="w-4 h-4 text-white/90" />
        <span className="text-sm font-medium text-white">PDF Viewer</span>
      </div>
      <div className="flex-1 p-6 overflow-auto flex items-start justify-center">
        <div className="w-full max-w-lg bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg shadow-sm p-8 space-y-4">
          <h4 className="text-sm font-bold text-foreground border-b border-slate-200 dark:border-border pb-2">
            {detail.sourceDoc || "Document Preview"}
          </h4>
          {detail.sourceLocation && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
              <Search className="w-3 h-3 text-amber-600" />
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">Navigated to: {detail.sourceLocation}</span>
            </div>
          )}
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p>{detail.description}</p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-border/30">
            <span className="text-[10px] text-muted-foreground">Source: {detail.sourceDoc}{detail.sourceLocation ? ` — ${detail.sourceLocation}` : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnnotationOverlay({ samples, initialSampleId, initialAttributeKey, controlId, onClose }: AnnotationOverlayProps) {
  const [selectedSampleId, setSelectedSampleId] = useState(initialSampleId);
  const [selectedAttrKey, setSelectedAttrKey] = useState(initialAttributeKey);
  const [activeDocIdx, setActiveDocIdx] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set());
  const [acceptedResults, setAcceptedResults] = useState<Set<string>>(() => new Set());

  const selectedSample = useMemo(() => samples.find(s => s.id === selectedSampleId) || samples[0]!, [samples, selectedSampleId]);
  const selectedDetail = useMemo(() => selectedSample.details.find(d => d.key === selectedAttrKey) || selectedSample.details[0]!, [selectedSample, selectedAttrKey]);
  const evidenceDocs = useMemo(() => getEvidenceDocuments(selectedSample, selectedDetail), [selectedSample, selectedDetail]);
  const annotations = useMemo(() => getAnnotations(selectedSample, selectedDetail), [selectedSample, selectedDetail]);

  const allAttributeKeys = ["A1", "A2", "A3", "A4", "A5"];
  const flatPairs = useMemo(() => {
    const pairs: { sampleId: string; attrKey: string }[] = [];
    samples.forEach(s => allAttributeKeys.forEach(a => pairs.push({ sampleId: s.id, attrKey: a })));
    return pairs;
  }, [samples]);

  const currentFlatIdx = flatPairs.findIndex(p => p.sampleId === selectedSampleId && p.attrKey === selectedAttrKey);
  const reviewedCount = useMemo(() => {
    const reviewedSamples = new Set<string>();
    acceptedResults.forEach(key => { reviewedSamples.add(key.split("-")[0]!); });
    return reviewedSamples.size;
  }, [acceptedResults]);
  const totalCount = samples.length;

  const navigateTo = (sampleId: string, attrKey: string) => {
    setSelectedSampleId(sampleId);
    setSelectedAttrKey(attrKey);
    setActiveDocIdx(0);
    setExpandedSections(new Set());
  };

  const navigatePrev = () => {
    if (currentFlatIdx > 0) {
      const p = flatPairs[currentFlatIdx - 1]!;
      navigateTo(p.sampleId, p.attrKey);
    }
  };

  const navigateNext = () => {
    if (currentFlatIdx < flatPairs.length - 1) {
      const p = flatPairs[currentFlatIdx + 1]!;
      navigateTo(p.sampleId, p.attrKey);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  const resultCounts = (sample: SampleTestRow) => {
    const counts = { effective: 0, ineffective: 0, missing: 0, na: 0 };
    Object.values(sample.attributes).forEach(a => {
      if (a.result === "Effective") counts.effective++;
      else if (a.result === "Ineffective") counts.ineffective++;
      else if (a.result === "Missing") counts.missing++;
      else if (a.result === "N/A") counts.na++;
    });
    return counts;
  };

  const activeDoc = evidenceDocs[activeDocIdx] || evidenceDocs[0];

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-background flex flex-col" data-testid="annotation-overlay">
      <div className="h-11 shrink-0 flex items-center justify-between px-4 border-b border-slate-200 dark:border-border bg-slate-900 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#266C92]" />
            <span className="text-xs font-semibold text-white">{controlId} – Test 1: Interim</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          data-testid="button-back-to-control"
        >
          Back to Control
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[220px] shrink-0 border-r border-slate-200 dark:border-border flex flex-col bg-white dark:bg-card">
          <div className="px-3 py-3 border-b border-slate-200 dark:border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#266C92]" />
              <span className="text-xs font-bold text-foreground">Annotate</span>
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{reviewedCount}/{totalCount} Samples Reviewed</p>
          </div>

          <div className="px-3 py-2 border-b border-slate-200 dark:border-border">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Group By: Sample</span>
          </div>

          <div className="flex-1 overflow-y-auto px-1 py-1">
            {samples.map((sample, sIdx) => {
              const counts = resultCounts(sample);
              const isSampleSelected = sample.id === selectedSampleId;
              return (
                <div key={sample.id} className="mb-0.5" data-testid={`sidebar-sample-${sample.id}`}>
                  <button
                    onClick={() => navigateTo(sample.id, "A1")}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors ${isSampleSelected ? "bg-slate-100 dark:bg-muted/30" : "hover:bg-slate-50 dark:hover:bg-muted/10"}`}
                  >
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Sample {sIdx + 1}</div>
                    <div className="text-[11px] font-semibold text-foreground truncate">{sample.label.replace(/^S\d+ — /, "")}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {counts.effective > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {counts.effective}
                        </span>
                      )}
                      {counts.ineffective > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] text-red-600 dark:text-red-400 font-semibold">
                          <XCircle className="w-2.5 h-2.5" /> {counts.ineffective}
                        </span>
                      )}
                      {counts.missing > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                          <AlertCircle className="w-2.5 h-2.5" /> {counts.missing}
                        </span>
                      )}
                      {counts.na > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] text-slate-400 font-semibold">
                          <Minus className="w-2.5 h-2.5" /> {counts.na}
                        </span>
                      )}
                    </div>
                  </button>
                  {isSampleSelected && (
                    <div className="ml-3 pl-2 border-l-2 border-slate-200 dark:border-border space-y-0.5 py-1">
                      {sample.details.map(d => {
                        const isAttrSelected = d.key === selectedAttrKey;
                        return (
                          <button
                            key={d.key}
                            onClick={() => navigateTo(sample.id, d.key)}
                            className={`w-full text-left px-2 py-1 rounded text-[10px] transition-colors truncate ${
                              isAttrSelected
                                ? "bg-[#266C92]/10 text-[#266C92] font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-muted/10"
                            }`}
                            data-testid={`sidebar-attr-${sample.id}-${d.key}`}
                          >
                            {attributeShortLabels[d.key] || d.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="shrink-0 px-5 py-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Controls / {controlId} / Test 1: Interim / Annotate</p>
                <h2 className="text-base font-bold text-foreground mt-0.5">
                  {selectedSample.label}
                </h2>
                <p className="text-xs text-muted-foreground">{attributeLabels[selectedAttrKey] || selectedDetail.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground">Attribute {allAttributeKeys.indexOf(selectedAttrKey) + 1} of {allAttributeKeys.length} · Sample {samples.findIndex(s => s.id === selectedSampleId) + 1} of {samples.length}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={navigatePrev}
                    disabled={currentFlatIdx <= 0}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-muted/30 disabled:opacity-30 transition-colors"
                    data-testid="button-attr-prev"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <span className="text-xs text-muted-foreground">Previous</span>
                  <span className="text-xs text-muted-foreground ml-2">Next</span>
                  <button
                    onClick={navigateNext}
                    disabled={currentFlatIdx >= flatPairs.length - 1}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-muted/30 disabled:opacity-30 transition-colors"
                    data-testid="button-attr-next"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-border">
              <div className="shrink-0 flex items-center gap-0 border-b border-slate-200 dark:border-border bg-white dark:bg-card">
                {evidenceDocs.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDocIdx(idx)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs border-b-2 transition-colors ${
                      idx === activeDocIdx
                        ? "border-[#266C92] text-foreground font-semibold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`doc-tab-${idx}`}
                  >
                    <span className="truncate max-w-[160px]">{doc.name}</span>
                    {doc.hasAnnotation && (
                      <span className="w-4 h-4 rounded-full bg-[#266C92] text-white text-[9px] font-bold flex items-center justify-center shrink-0">1</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="shrink-0 flex items-center gap-1 px-4 py-1.5 border-b border-slate-100 dark:border-border/40 bg-slate-50/50 dark:bg-muted/10">
                {[
                  { icon: Circle, label: "Select" },
                  { icon: Pen, label: "Draw" },
                  { icon: Square, label: "Highlight" },
                  { icon: Type, label: "Text" },
                  { icon: ZoomIn, label: "Zoom In" },
                  { icon: ZoomOut, label: "Zoom Out" },
                  { icon: Download, label: "Download" },
                  { icon: Search, label: "Search" },
                ].map((tool, i) => (
                  <button
                    key={i}
                    className="p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-muted/30 transition-colors"
                    title={tool.label}
                  >
                    <tool.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-auto p-5 bg-slate-100/50 dark:bg-muted/5">
                {activeDoc?.type === "email" || activeDoc?.name.endsWith(".msg") ? (
                  <div className="max-w-2xl mx-auto rounded-lg border border-slate-200 dark:border-border shadow-sm overflow-hidden">
                    <EmailPreview sample={selectedSample} detail={selectedDetail} />
                  </div>
                ) : activeDoc?.type === "spreadsheet" || activeDoc?.name.endsWith(".csv") || activeDoc?.name.endsWith(".xlsx") ? (
                  <div className="max-w-2xl mx-auto rounded-lg border border-slate-200 dark:border-border shadow-sm overflow-hidden">
                    <SpreadsheetPreview detail={selectedDetail} />
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto rounded-lg border border-slate-200 dark:border-border shadow-sm overflow-hidden">
                    <PdfPreview detail={selectedDetail} />
                  </div>
                )}
              </div>
            </div>

            <div className="w-[300px] shrink-0 flex flex-col overflow-y-auto bg-white dark:bg-card">
              <div className="px-4 py-4 border-b border-slate-200 dark:border-border space-y-3">
                <h3 className="text-sm font-bold text-foreground">Result</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Effectiveness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${resultDot(selectedDetail.result)}`} />
                    <span className={`text-sm font-bold ${resultStatusColor(selectedDetail.result)}`}>{selectedDetail.result}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">AI Justification</span>
                    <Badge className={`text-[9px] border-0 ${confidenceBadgeColor(selectedDetail.confidence)}`}>
                      {selectedDetail.confidence} Confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedDetail.result === "Effective"
                      ? `PASSED: ${selectedDetail.description}`
                      : selectedDetail.result === "N/A"
                      ? selectedDetail.description
                      : `FAILED: ${selectedDetail.description}`
                    }
                  </p>
                  <a href="#" onClick={e => e.preventDefault()} className="text-[11px] text-[#266C92] hover:underline" data-testid="link-verify-ai">
                    Verify AI generated results
                  </a>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    className={`h-8 text-xs ${
                      acceptedResults.has(`${selectedSampleId}-${selectedAttrKey}`)
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-[#266C92] hover:bg-[#1e5a7a] text-white"
                    }`}
                    onClick={() => setAcceptedResults(prev => new Set(prev).add(`${selectedSampleId}-${selectedAttrKey}`))}
                    data-testid="button-accept-result"
                  >
                    {acceptedResults.has(`${selectedSampleId}-${selectedAttrKey}`) ? "Accepted" : "Accept Result"}
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" data-testid="button-edit-result">
                    Edit
                  </Button>
                </div>
              </div>

              <div className="px-4 py-3 border-b border-slate-200 dark:border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">Annotations</span>
                  {annotations.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-muted text-[10px] font-bold text-foreground flex items-center justify-center">
                      {annotations.length}
                    </span>
                  )}
                </div>

                {annotations.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {annotations.map(ann => (
                      <div key={ann.id} className={`p-3 rounded-lg border ${ann.result === "Ineffective" ? "border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10" : "border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={`text-[9px] border-0 ${ann.result === "Ineffective" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                            {ann.result === "Missing" ? "Missing" : "Ineffective"}
                          </Badge>
                          <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-semibold text-[#266C92] mb-1">{ann.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          <span className="font-semibold">Reasoning:</span> {ann.reasoning}
                        </p>
                        <p className="text-[9px] text-muted-foreground/60 mt-1.5">{ann.source}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground mt-1">No annotations for this result.</p>
                )}
              </div>

              <div className="divide-y divide-slate-200 dark:divide-border">
                <button
                  onClick={() => toggleSection("sample-details")}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors"
                  data-testid="toggle-sample-details"
                >
                  <span className="text-sm font-semibold text-foreground">Sample Details</span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.has("sample-details") ? "rotate-90" : ""}`} />
                </button>
                {expandedSections.has("sample-details") && (
                  <div className="px-4 py-3 space-y-2 bg-slate-50/50 dark:bg-muted/5">
                    {getSampleDetails(selectedSample).map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">{item.label}</span>
                        <span className={`text-[11px] font-medium ${item.label === "Overall Result" ? resultStatusColor(item.value) : "text-foreground"}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => toggleSection("attribute-details")}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors"
                  data-testid="toggle-attribute-details"
                >
                  <span className="text-sm font-semibold text-foreground">Attribute Details</span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.has("attribute-details") ? "rotate-90" : ""}`} />
                </button>
                {expandedSections.has("attribute-details") && (
                  <div className="px-4 py-3 space-y-2 bg-slate-50/50 dark:bg-muted/5">
                    {getAttributeDetails(selectedDetail).map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">{item.label}</span>
                        <span className={`text-[11px] font-medium ${item.label === "Test Result" ? resultStatusColor(item.value) : item.label === "Confidence" ? (item.value === "High" ? "text-emerald-600" : item.value === "Medium" ? "text-amber-600" : "text-red-500") : "text-foreground"}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => toggleSection("test-procedures")}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors"
                  data-testid="toggle-test-procedures"
                >
                  <span className="text-sm font-semibold text-foreground">Test Procedures</span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.has("test-procedures") ? "rotate-90" : ""}`} />
                </button>
                {expandedSections.has("test-procedures") && (
                  <div className="px-4 py-3 space-y-2 bg-slate-50/50 dark:bg-muted/5">
                    {testProcedures.map((proc, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0 w-4">{i + 1}.</span>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{proc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
