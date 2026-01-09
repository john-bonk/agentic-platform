/**
 * Risk Components Export
 * 
 * Exports all risk-related components for the Global Residual Risk view
 * and CAE M&A Audit and Compliance view.
 */

// CRO Global Residual Risk Components
export { RiskCard } from "./RiskCard";
export type { RiskData, RiskSeverity, MitigationStatus, MitigationItem } from "./RiskCard";

export { StrategicObjectives } from "./StrategicObjectives";
export type { StrategicObjective, Initiative } from "./StrategicObjectives";

export { RegionalTreemap, RegionalTreemaps } from "./RegionalTreemap";
export type { RegionData, CompanyData, LocationData, CompanyTooltipData } from "./RegionalTreemap";

// CAE M&A Audit Components
export { AuditRiskCard } from "./AuditRiskCard";
export type { AuditRiskData, AuditRiskSeverity, AuditStatus, AuditMitigationItem } from "./AuditRiskCard";

export { AuditTreemapTooltip } from "./AuditTreemapTooltip";
export type { AuditTooltipData, AuditTest, IssuePastSLA } from "./AuditTreemapTooltip";

export { StrategicAuditObjectives } from "./StrategicAuditObjectives";
export type { StrategicAuditObjective, AuditObjectiveStatus } from "./StrategicAuditObjectives";

export { AuditRegionalTreemap, AuditRegionalTreemaps } from "./AuditRegionalTreemap";
export type { AuditRegionData, AuditCompanyData, AuditLocationData } from "./AuditRegionalTreemap";
