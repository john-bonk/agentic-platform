import { z } from "zod";

// Enums
export const riskRatings = ["High", "Medium", "Low"] as const;
export type RiskRating = (typeof riskRatings)[number];

export const controlTypes = ["Preventive", "Detective", "Corrective"] as const;
export type ControlType = (typeof controlTypes)[number];

export const testStatuses = [
  "Not Started",
  "In Progress",
  "Pending Review",
  "Failed",
  "Passed",
  "Remediation",
] as const;
export type TestStatus = (typeof testStatuses)[number];

export const auditPhases = [
  "Planning",
  "Fieldwork",
  "Reporting",
  "Follow-up",
  "Closed",
] as const;
export type AuditPhase = (typeof auditPhases)[number];

// Control schema
export const controlSchema = z.object({
  id: z.string(),
  controlId: z.string(),
  name: z.string(),
  description: z.string(),
  riskRating: z.enum(riskRatings),
  controlType: z.enum(controlTypes),
  owner: z.string(),
  frequency: z.string(),
  lastTestDate: z.string().nullable(),
  nextTestDate: z.string().nullable(),
  testStatus: z.enum(testStatuses),
  framework: z.string(),
});

export const insertControlSchema = controlSchema.omit({ id: true });

export type Control = z.infer<typeof controlSchema>;
export type InsertControl = z.infer<typeof insertControlSchema>;

// Control Test schema
export const controlTestSchema = z.object({
  id: z.string(),
  controlId: z.string(),
  testerId: z.string(),
  testerName: z.string(),
  testDate: z.string(),
  status: z.enum(testStatuses),
  sampleSize: z.number(),
  exceptionsFound: z.number(),
  findings: z.string().nullable(),
  conclusion: z.string().nullable(),
  reviewerId: z.string().nullable(),
  reviewerName: z.string().nullable(),
  reviewDate: z.string().nullable(),
  reviewNotes: z.string().nullable(),
});

export const insertControlTestSchema = controlTestSchema.omit({ id: true });

export type ControlTest = z.infer<typeof controlTestSchema>;
export type InsertControlTest = z.infer<typeof insertControlTestSchema>;

// Audit schema
export const auditSchema = z.object({
  id: z.string(),
  auditId: z.string(),
  name: z.string(),
  description: z.string(),
  auditType: z.string(),
  phase: z.enum(auditPhases),
  startDate: z.string(),
  endDate: z.string().nullable(),
  leadAuditor: z.string(),
  department: z.string(),
  riskRating: z.enum(riskRatings),
  findingsCount: z.number(),
  progress: z.number(),
});

export const insertAuditSchema = auditSchema.omit({ id: true });

export type Audit = z.infer<typeof auditSchema>;
export type InsertAudit = z.infer<typeof insertAuditSchema>;

// Evidence schema
export const evidenceSchema = z.object({
  id: z.string(),
  controlTestId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  uploadedBy: z.string(),
  uploadDate: z.string(),
  description: z.string().nullable(),
});

export const insertEvidenceSchema = evidenceSchema.omit({ id: true });

export type Evidence = z.infer<typeof evidenceSchema>;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;

// User schema (keeping existing)
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  name: z.string(),
  role: z.string(),
  avatar: z.string().nullable(),
});

export const insertUserSchema = userSchema.omit({ id: true });

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Notification schema
export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(["system", "mention", "deadline", "review", "update"]),
  title: z.string(),
  message: z.string(),
  link: z.string().nullable(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const insertNotificationSchema = notificationSchema.omit({ id: true });

export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  recipientId: z.string(),
  subject: z.string(),
  content: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const insertMessageSchema = messageSchema.omit({ id: true });

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Task schema (for outstanding tasks on home page)
export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["Test", "Review", "Evidence", "Remediation", "Walkthrough"]),
  controlId: z.string(),
  status: z.enum(["Not Started", "In Progress", "Pending", "Blocked", "Completed"]),
  dueDate: z.string(),
  riskRating: z.enum(riskRatings),
  assigneeId: z.string(),
  assigneeName: z.string(),
  dependency: z.string().nullable(),
  blockerReason: z.string().nullable(),
  sampleSize: z.number().nullable(),
  evidenceRequired: z.boolean(),
});

export const insertTaskSchema = taskSchema.omit({ id: true });

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Dashboard metrics type
export interface DashboardMetrics {
  totalControls: number;
  passedControls: number;
  failedControls: number;
  pendingReview: number;
  overdueTests: number;
  activeAudits: number;
  findingsTotal: number;
  remediationInProgress: number;
}

// Report schemas
export const reportChartSpecSchema = z.object({
  type: z.enum(["bar", "pie", "line"]),
  data: z.array(z.number()),
  labels: z.array(z.string()).optional(),
  title: z.string().optional(),
  position: z.enum(["above", "below", "inline"]).optional(),
});

export const reportSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  charts: z.array(reportChartSpecSchema).default([]),
});

export const reportTocItemSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const reportSchema = z.object({
  reportId: z.string(),
  title: z.string(),
  sections: z.array(reportSectionSchema),
  toc: z.array(reportTocItemSchema),
  createdAt: z.string(),
  prompt: z.string().optional(),
});

export const insertReportSchema = reportSchema.omit({ reportId: true });

export type ReportChartSpec = z.infer<typeof reportChartSpecSchema>;
export type ReportSection = z.infer<typeof reportSectionSchema>;
export type ReportTocItem = z.infer<typeof reportTocItemSchema>;
export type Report = z.infer<typeof reportSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;

// SharedLink schema for report sharing
export const sharedLinkSchema = z.object({
  id: z.string(),
  token: z.string(),
  reportId: z.string(),
  customSlug: z.string().nullable(),
  expiresAt: z.string().nullable(),
  allowedEmails: z.array(z.string()).nullable(),
  createdBy: z.string(),
  createdAt: z.string(),
});

export const insertSharedLinkSchema = sharedLinkSchema.omit({ id: true, token: true, createdAt: true });

export type SharedLink = z.infer<typeof sharedLinkSchema>;
export type InsertSharedLink = z.infer<typeof insertSharedLinkSchema>;
