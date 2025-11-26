export interface BusinessUnit {
  id: string;
  name: string;
  type: "Corporate" | "Department" | "Team";
  class: string;
  residualRisk: "Low" | "Medium" | "High";
  parent?: string;
}

export interface Location {
  id: string;
  name: string;
  type: "Region" | "Country" | "State";
  class: string;
  residualRisk: "Low" | "Medium" | "High";
  parent?: string;
}

export interface Application {
  id: string;
  name: string;
  type: string;
  class: string;
  residualRisk: "Low" | "Medium" | "High";
  vendor: string;
  usedByTeams: string[];
  deployedInLocations: string[];
}

export interface Vendor {
  id: string;
  name: string;
  type: string;
  class: string;
  residualRisk: "Low" | "Medium" | "High";
  products: string[];
}

export const businessUnits: BusinessUnit[] = [
  { id: "CORP-001", name: "MegaCorp", type: "Corporate", class: "Business Units", residualRisk: "Medium" },
  { id: "DEPT-IT", name: "IT", type: "Department", class: "Business Units", residualRisk: "High", parent: "CORP-001" },
  { id: "TEAM-DEV", name: "Development", type: "Team", class: "Business Units", residualRisk: "High", parent: "DEPT-IT" },
  { id: "TEAM-INFRA", name: "Infrastructure", type: "Team", class: "Business Units", residualRisk: "High", parent: "DEPT-IT" },
  { id: "TEAM-SEC", name: "Security Team", type: "Team", class: "Business Units", residualRisk: "Medium", parent: "DEPT-IT" },
  { id: "DEPT-FIN", name: "Finance", type: "Department", class: "Business Units", residualRisk: "Low", parent: "CORP-001" },
  { id: "TEAM-ACC", name: "Accounting", type: "Team", class: "Business Units", residualRisk: "Low", parent: "DEPT-FIN" },
  { id: "TEAM-TREAS", name: "Treasury", type: "Team", class: "Business Units", residualRisk: "Low", parent: "DEPT-FIN" },
  { id: "TEAM-FP", name: "Financial Planning", type: "Team", class: "Business Units", residualRisk: "Low", parent: "DEPT-FIN" },
  { id: "DEPT-HR", name: "HR", type: "Department", class: "Business Units", residualRisk: "Low", parent: "CORP-001" },
  { id: "TEAM-REC", name: "Recruiting", type: "Team", class: "Business Units", residualRisk: "Low", parent: "DEPT-HR" },
  { id: "TEAM-PAY", name: "Payroll", type: "Team", class: "Business Units", residualRisk: "Medium", parent: "DEPT-HR" },
  { id: "TEAM-EMPREL", name: "Employee Relations", type: "Team", class: "Business Units", residualRisk: "Low", parent: "DEPT-HR" },
  { id: "DEPT-SALES", name: "Sales", type: "Department", class: "Business Units", residualRisk: "Medium", parent: "CORP-001" },
  { id: "TEAM-ENTSALES", name: "Enterprise Sales", type: "Team", class: "Business Units", residualRisk: "Medium", parent: "DEPT-SALES" },
  { id: "TEAM-SMBSALES", name: "SMB Sales", type: "Team", class: "Business Units", residualRisk: "Low", parent: "DEPT-SALES" },
  { id: "TEAM-SALESOPS", name: "Sales Operations", type: "Team", class: "Business Units", residualRisk: "Medium", parent: "DEPT-SALES" },
];

export const locations: Location[] = [
  { id: "REG-NAM", name: "North America", type: "Region", class: "Location", residualRisk: "Medium" },
  { id: "COUNTRY-US", name: "United States", type: "Country", class: "Location", residualRisk: "Medium", parent: "REG-NAM" },
  { id: "STATE-CA", name: "California", type: "State", class: "Location", residualRisk: "High", parent: "COUNTRY-US" },
  { id: "STATE-NY", name: "New York", type: "State", class: "Location", residualRisk: "Medium", parent: "COUNTRY-US" },
  { id: "STATE-TX", name: "Texas", type: "State", class: "Location", residualRisk: "Medium", parent: "COUNTRY-US" },
  { id: "STATE-IL", name: "Illinois", type: "State", class: "Location", residualRisk: "Low", parent: "COUNTRY-US" },
  { id: "COUNTRY-CA", name: "Canada", type: "Country", class: "Location", residualRisk: "Low", parent: "REG-NAM" },
  { id: "STATE-ON", name: "Ontario", type: "State", class: "Location", residualRisk: "Low", parent: "COUNTRY-CA" },
  { id: "REG-EMEA", name: "EMEA", type: "Region", class: "Location", residualRisk: "Medium" },
  { id: "COUNTRY-UK", name: "United Kingdom", type: "Country", class: "Location", residualRisk: "Medium", parent: "REG-EMEA" },
  { id: "STATE-ENG", name: "England", type: "State", class: "Location", residualRisk: "Medium", parent: "COUNTRY-UK" },
  { id: "COUNTRY-DE", name: "Germany", type: "Country", class: "Location", residualRisk: "Low", parent: "REG-EMEA" },
  { id: "STATE-BER", name: "Berlin", type: "State", class: "Location", residualRisk: "Low", parent: "COUNTRY-DE" },
  { id: "REG-APAC", name: "APAC", type: "Region", class: "Location", residualRisk: "Medium" },
  { id: "COUNTRY-JP", name: "Japan", type: "Country", class: "Location", residualRisk: "Medium", parent: "REG-APAC" },
  { id: "STATE-TYO", name: "Tokyo", type: "State", class: "Location", residualRisk: "Medium", parent: "COUNTRY-JP" },
  { id: "COUNTRY-SG", name: "Singapore", type: "Country", class: "Location", residualRisk: "Low", parent: "REG-APAC" },
  { id: "STATE-SGC", name: "Singapore Central", type: "State", class: "Location", residualRisk: "Low", parent: "COUNTRY-SG" },
];

export const applications: Application[] = [
  { id: "APP-SLACK", name: "Slack", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Slack Technologies", usedByTeams: ["Development", "Infrastructure", "Security Team", "Recruiting", "Accounting", "Treasury", "Financial Planning"], deployedInLocations: ["California", "New York", "Illinois", "Ontario", "England", "Berlin", "Tokyo"] },
  { id: "APP-ZOOM", name: "Zoom", type: "Application", class: "IT Systems", residualRisk: "Low", vendor: "Zoom Video Communications", usedByTeams: ["Development", "Infrastructure", "Security Team", "Recruiting", "Accounting", "Financial Planning"], deployedInLocations: ["Illinois", "Singapore Central"] },
  { id: "APP-GITHUB", name: "GitHub", type: "Application", class: "IT Systems", residualRisk: "High", vendor: "GitHub Inc.", usedByTeams: ["Development", "Infrastructure", "Security Team"], deployedInLocations: ["California"] },
  { id: "APP-JIRA", name: "Jira", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Atlassian", usedByTeams: ["Development", "Infrastructure", "Security Team"], deployedInLocations: ["Texas", "Ontario", "Berlin"] },
  { id: "APP-CONFLUENCE", name: "Confluence", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Atlassian", usedByTeams: ["Development", "Infrastructure", "Security Team", "Financial Planning"], deployedInLocations: ["Texas", "England"] },
  { id: "APP-NOTION", name: "Notion", type: "Application", class: "IT Systems", residualRisk: "Low", vendor: "Notion Labs Inc.", usedByTeams: ["Development", "Infrastructure", "Financial Planning", "Recruiting"], deployedInLocations: [] },
  { id: "APP-DATADOG", name: "Datadog", type: "Application", class: "IT Systems", residualRisk: "High", vendor: "Datadog Inc.", usedByTeams: ["Development", "Infrastructure", "Security Team"], deployedInLocations: ["California"] },
  { id: "APP-PAGERDUTY", name: "PagerDuty", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "PagerDuty Inc.", usedByTeams: ["Development", "Infrastructure", "Security Team"], deployedInLocations: [] },
  { id: "APP-TERRAFORM", name: "Terraform Cloud", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "HashiCorp", usedByTeams: ["Infrastructure", "Security Team"], deployedInLocations: [] },
  { id: "APP-SPLUNK", name: "Splunk", type: "Application", class: "IT Systems", residualRisk: "High", vendor: "Splunk Inc.", usedByTeams: ["Security Team", "Infrastructure"], deployedInLocations: [] },
  { id: "APP-OKTA", name: "Okta", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Okta Inc.", usedByTeams: ["Development", "Infrastructure", "Security Team", "Recruiting", "Accounting"], deployedInLocations: [] },
  { id: "APP-AWS-EC2", name: "AWS EC2 Compute", type: "Application", class: "IT Systems", residualRisk: "High", vendor: "Amazon Web Services", usedByTeams: ["Development", "Infrastructure", "Security Team"], deployedInLocations: ["California", "New York"] },
  { id: "APP-AWS-S3", name: "AWS S3 Storage", type: "Application", class: "IT Systems", residualRisk: "High", vendor: "Amazon Web Services", usedByTeams: ["Development", "Infrastructure", "Security Team", "Financial Planning"], deployedInLocations: ["California", "Texas", "Singapore Central"] },
  { id: "APP-AWS-RDS", name: "AWS RDS Database Service", type: "Application", class: "IT Systems", residualRisk: "High", vendor: "Amazon Web Services", usedByTeams: ["Development", "Infrastructure"], deployedInLocations: ["Illinois"] },
  { id: "APP-GWORKSPACE", name: "Google Workspace", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Google LLC", usedByTeams: ["Development", "Infrastructure", "Security Team", "Recruiting", "Accounting", "Treasury", "Financial Planning"], deployedInLocations: ["Texas", "Ontario", "Tokyo"] },
  { id: "APP-GCP", name: "Google Cloud Platform", type: "Application", class: "IT Systems", residualRisk: "High", vendor: "Google LLC", usedByTeams: ["Development", "Infrastructure", "Security Team"], deployedInLocations: ["England"] },
  { id: "APP-MSOFFICE", name: "Microsoft Office 365", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Microsoft Corporation", usedByTeams: ["Development", "Recruiting", "Accounting", "Treasury", "Financial Planning"], deployedInLocations: ["New York", "Berlin"] },
  { id: "APP-AZURE", name: "Microsoft Azure Platform", type: "Application", class: "IT Systems", residualRisk: "High", vendor: "Microsoft Corporation", usedByTeams: ["Development", "Infrastructure", "Security Team"], deployedInLocations: ["England"] },
  { id: "APP-MSTEAMS", name: "Microsoft Teams", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Microsoft Corporation", usedByTeams: ["Development", "Infrastructure", "Recruiting", "Accounting", "Financial Planning"], deployedInLocations: ["Berlin"] },
  { id: "APP-SALESFORCE-SALES", name: "Salesforce Sales Cloud", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Salesforce Inc.", usedByTeams: ["Accounting", "Financial Planning"], deployedInLocations: ["New York", "Singapore Central"] },
  { id: "APP-SALESFORCE-SERVICE", name: "Salesforce Service Cloud", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Salesforce Inc.", usedByTeams: ["Accounting"], deployedInLocations: [] },
  { id: "APP-TABLEAU", name: "Tableau", type: "Application", class: "IT Systems", residualRisk: "Low", vendor: "Salesforce Inc.", usedByTeams: ["Financial Planning", "Accounting", "Infrastructure"], deployedInLocations: ["New York", "Singapore Central"] },
  { id: "APP-QUICKBOOKS", name: "QuickBooks", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Intuit Inc.", usedByTeams: ["Accounting", "Treasury"], deployedInLocations: [] },
  { id: "APP-NETSUITE", name: "NetSuite", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Oracle Corporation", usedByTeams: ["Accounting", "Financial Planning", "Treasury"], deployedInLocations: [] },
  { id: "APP-WORKDAY", name: "Workday", type: "Application", class: "IT Systems", residualRisk: "Low", vendor: "Workday Inc.", usedByTeams: ["Recruiting", "Accounting"], deployedInLocations: [] },
  { id: "APP-BAMBOOHR", name: "BambooHR", type: "Application", class: "IT Systems", residualRisk: "Low", vendor: "BambooHR Inc.", usedByTeams: ["Recruiting"], deployedInLocations: [] },
  { id: "APP-GREENHOUSE", name: "Greenhouse", type: "Application", class: "IT Systems", residualRisk: "Low", vendor: "Greenhouse Software", usedByTeams: ["Recruiting"], deployedInLocations: [] },
  { id: "APP-ADP", name: "ADP", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "ADP Inc.", usedByTeams: ["Payroll"], deployedInLocations: [] },
  { id: "APP-GUSTO", name: "Gusto", type: "Application", class: "IT Systems", residualRisk: "Low", vendor: "Gusto Inc.", usedByTeams: ["Payroll"], deployedInLocations: [] },
  { id: "APP-EXPENSIFY", name: "Expensify", type: "Application", class: "IT Systems", residualRisk: "Low", vendor: "Expensify Inc.", usedByTeams: ["Accounting"], deployedInLocations: [] },
  { id: "APP-KYRIBA", name: "Kyriba", type: "Application", class: "IT Systems", residualRisk: "Medium", vendor: "Kyriba Corp.", usedByTeams: ["Treasury"], deployedInLocations: [] },
  { id: "APP-ANAPLAN", name: "Anaplan", type: "Application", class: "IT Systems", residualRisk: "Low", vendor: "Anaplan Inc.", usedByTeams: ["Financial Planning"], deployedInLocations: [] },
];

export const vendors: Vendor[] = [
  { id: "VENDOR-AWS", name: "Amazon Web Services", type: "Vendor", class: "Vendors", residualRisk: "High", products: ["AWS EC2 Compute", "AWS S3 Storage", "AWS RDS Database Service"] },
  { id: "VENDOR-MSFT", name: "Microsoft Corporation", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["Microsoft Office 365", "Microsoft Azure Platform", "Microsoft Teams"] },
  { id: "VENDOR-GOOGLE", name: "Google LLC", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["Google Workspace", "Google Cloud Platform"] },
  { id: "VENDOR-SALESFORCE", name: "Salesforce Inc.", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["Salesforce Sales Cloud", "Salesforce Service Cloud", "Tableau"] },
  { id: "VENDOR-ATLASSIAN", name: "Atlassian", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["Jira", "Confluence"] },
  { id: "VENDOR-SLACK", name: "Slack Technologies", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["Slack"] },
  { id: "VENDOR-ZOOM", name: "Zoom Video Communications", type: "Vendor", class: "Vendors", residualRisk: "Low", products: ["Zoom"] },
  { id: "VENDOR-GITHUB", name: "GitHub Inc.", type: "Vendor", class: "Vendors", residualRisk: "High", products: ["GitHub"] },
  { id: "VENDOR-NOTION", name: "Notion Labs Inc.", type: "Vendor", class: "Vendors", residualRisk: "Low", products: ["Notion"] },
  { id: "VENDOR-DATADOG", name: "Datadog Inc.", type: "Vendor", class: "Vendors", residualRisk: "High", products: ["Datadog"] },
  { id: "VENDOR-PAGERDUTY", name: "PagerDuty Inc.", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["PagerDuty"] },
  { id: "VENDOR-HASHICORP", name: "HashiCorp", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["Terraform Cloud"] },
  { id: "VENDOR-SPLUNK", name: "Splunk Inc.", type: "Vendor", class: "Vendors", residualRisk: "High", products: ["Splunk"] },
  { id: "VENDOR-OKTA", name: "Okta Inc.", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["Okta"] },
  { id: "VENDOR-ORACLE", name: "Oracle Corporation", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["NetSuite"] },
  { id: "VENDOR-INTUIT", name: "Intuit Inc.", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["QuickBooks"] },
  { id: "VENDOR-WORKDAY", name: "Workday Inc.", type: "Vendor", class: "Vendors", residualRisk: "Low", products: ["Workday"] },
  { id: "VENDOR-BAMBOOHR", name: "BambooHR Inc.", type: "Vendor", class: "Vendors", residualRisk: "Low", products: ["BambooHR"] },
  { id: "VENDOR-GREENHOUSE", name: "Greenhouse Software", type: "Vendor", class: "Vendors", residualRisk: "Low", products: ["Greenhouse"] },
  { id: "VENDOR-ADP", name: "ADP Inc.", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["ADP"] },
  { id: "VENDOR-GUSTO", name: "Gusto Inc.", type: "Vendor", class: "Vendors", residualRisk: "Low", products: ["Gusto"] },
  { id: "VENDOR-EXPENSIFY", name: "Expensify Inc.", type: "Vendor", class: "Vendors", residualRisk: "Low", products: ["Expensify"] },
  { id: "VENDOR-KYRIBA", name: "Kyriba Corp.", type: "Vendor", class: "Vendors", residualRisk: "Medium", products: ["Kyriba"] },
  { id: "VENDOR-ANAPLAN", name: "Anaplan Inc.", type: "Vendor", class: "Vendors", residualRisk: "Low", products: ["Anaplan"] },
];

export function getApplicationsForTeam(teamName: string): Application[] {
  return applications.filter(app => app.usedByTeams.includes(teamName));
}

export function getVendorsForApplications(apps: Application[]): Vendor[] {
  const vendorNames = Array.from(new Set(apps.map(app => app.vendor)));
  return vendors.filter(v => vendorNames.includes(v.name));
}

export function getLocationsForApplications(apps: Application[]): Location[] {
  const locationNames = Array.from(new Set(apps.flatMap(app => app.deployedInLocations)));
  return locations.filter(loc => locationNames.includes(loc.name));
}

export function getTeamsUsingApplications(apps: Application[]): BusinessUnit[] {
  const teamNames = Array.from(new Set(apps.flatMap(app => app.usedByTeams)));
  return businessUnits.filter(bu => bu.type === "Team" && teamNames.includes(bu.name));
}

export function getBusinessUnitById(id: string): BusinessUnit | undefined {
  return businessUnits.find(bu => bu.id === id);
}

export function getLocationById(id: string): Location | undefined {
  return locations.find(loc => loc.id === id);
}

export function getTeamByName(name: string): BusinessUnit | undefined {
  return businessUnits.find(bu => bu.name === name && bu.type === "Team");
}

export function getDepartmentForTeam(team: BusinessUnit): BusinessUnit | undefined {
  if (!team.parent) return undefined;
  return businessUnits.find(bu => bu.id === team.parent);
}
