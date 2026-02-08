import type { Node, Edge } from "@xyflow/react";

const TEAL = "#266C92";

export interface InventoryColumnItem {
  id: string;
  label: string;
  highlighted?: boolean;
}

export interface InventoryColumnData {
  label: string;
  headerColor: string;
  items: InventoryColumnItem[];
}

export interface InventoryConfig {
  columns: {
    id: string;
    position: { x: number; y: number };
    data: InventoryColumnData;
  }[];
  edges: { id: string; source: string; sourceHandle: string; target: string; targetHandle: string; strokeWidth?: number }[];
}

export interface CoverageBannerConfig {
  title: string;
  subtitle: string;
}

export interface CoverageGroupData {
  id: string;
  label: string;
  headerColor: string;
  items: InventoryColumnItem[];
  column: "left" | "right";
  position: { x: number; y: number };
}

export interface CoverageConfig {
  banner: CoverageBannerConfig;
  groups: CoverageGroupData[];
  edges: { id: string; source: string; sourceHandle: string; target: string; targetHandle: string; strokeWidth?: number }[];
}

export interface WorkspaceViewConfig {
  inventory: InventoryConfig;
  coverage: CoverageConfig;
}

const enterpriseAuditInventory: InventoryConfig = {
  columns: [
    {
      id: "locations",
      position: { x: 0, y: 0 },
      data: {
        label: "Locations",
        headerColor: TEAL,
        items: [
          { id: "north-america", label: "North America" },
          { id: "united-states", label: "United States" },
          { id: "mexico", label: "Mexico" },
          { id: "canada", label: "Canada" },
          { id: "europe", label: "Europe" },
          { id: "germany", label: "Germany" },
          { id: "france", label: "France" },
          { id: "united-kingdom", label: "United Kingdom" },
          { id: "asia-pacific", label: "Asia-Pacific", highlighted: true },
          { id: "singapore", label: "Singapore", highlighted: true },
        ],
      },
    },
    {
      id: "legal-entities",
      position: { x: 200, y: 0 },
      data: {
        label: "Legal Entities",
        headerColor: TEAL,
        items: [
          { id: "evergrow-logistics", label: "Evergrow Logistics" },
          { id: "climatecare-ventures", label: "ClimateCare Ventures" },
          { id: "nuharvest-innovations", label: "NuHarvest Innovations" },
          { id: "suncoast-foods", label: "SunCoast Foods" },
          { id: "greenfoods-holdings", label: "GreenFoods Holdings" },
          { id: "agri-hub", label: "Agri-Hub Distributors" },
          { id: "sea-foodsource", label: "SEA FoodSource", highlighted: true },
        ],
      },
    },
    {
      id: "facilities",
      position: { x: 400, y: 0 },
      data: {
        label: "Facilities",
        headerColor: TEAL,
        items: [
          { id: "us-west-agri", label: "US-West Agri" },
          { id: "us-mid-pro", label: "US-Mid Pro" },
          { id: "us-south-pack", label: "US-South Pack" },
          { id: "us-east-dist", label: "US-East Dist" },
          { id: "ca-se-propack", label: "CA-SE Pro/Pack" },
          { id: "mx-central-farm", label: "MX-Central Farm" },
          { id: "mx-south-hub", label: "MX-South Hub" },
          { id: "de-north-euro", label: "DE-North Euro" },
          { id: "fr-south-green", label: "FR-South Green" },
          { id: "uk-central-hub", label: "UK-Central Hub" },
          { id: "uk-innovation", label: "UK-Innovation" },
          { id: "se-east-bio", label: "SE-East Bio", highlighted: true },
          { id: "se-west-hq", label: "SE-West HQ", highlighted: true },
        ],
      },
    },
    {
      id: "product-lines",
      position: { x: 600, y: 0 },
      data: {
        label: "Product Lines",
        headerColor: TEAL,
        items: [
          { id: "beverages", label: "Beverages" },
          { id: "frozen-foods", label: "Frozen Foods" },
          { id: "plant-based-proteins", label: "Plant-Based Proteins" },
          { id: "dairy-products", label: "Dairy Products" },
          { id: "meat-processing", label: "Meat Processing" },
          { id: "packaged-goods", label: "Packaged Goods" },
          { id: "cereals-grains", label: "Cereals & Grains" },
          { id: "organic-vegetables", label: "Organic Vegetables" },
          { id: "algae-proteins", label: "Algae-Based Proteins", highlighted: true },
          { id: "hydro-microgreens", label: "Hydro Microgreens", highlighted: true },
          { id: "seafood-alternatives", label: "Seafood Alternatives", highlighted: true },
        ],
      },
    },
    {
      id: "teams",
      position: { x: 800, y: 0 },
      data: {
        label: "Teams",
        headerColor: TEAL,
        items: [
          { id: "sourcing-supply", label: "Sourcing & Supply", highlighted: true },
          { id: "sustainability", label: "Sustainability", highlighted: true },
          { id: "food-safety", label: "Food Safety", highlighted: true },
          { id: "distribution", label: "Distribution", highlighted: true },
          { id: "operations", label: "Operations", highlighted: true },
          { id: "corporate", label: "Corporate", highlighted: true },
        ],
      },
    },
    {
      id: "it-systems",
      position: { x: 1000, y: 0 },
      data: {
        label: "IT Systems",
        headerColor: TEAL,
        items: [
          { id: "sap", label: "SAP" },
          { id: "oracle-fusion", label: "Oracle Fusion", highlighted: true },
          { id: "salesforce", label: "Salesforce" },
          { id: "azure-sql", label: "Azure SQL Database..." },
          { id: "bpc", label: "BPC" },
          { id: "firebase", label: "Firebase Realtime Da...", highlighted: true },
          { id: "jd-tableau", label: "JD Tableau" },
          { id: "zapier", label: "Zapier Automations" },
        ],
      },
    },
  ],
  edges: [
    { id: "e-ap-sea", source: "locations", sourceHandle: "source-asia-pacific", target: "legal-entities", targetHandle: "target-sea-foodsource", strokeWidth: 2 },
    { id: "e-sg-sea", source: "locations", sourceHandle: "source-singapore", target: "legal-entities", targetHandle: "target-sea-foodsource", strokeWidth: 2 },
    { id: "e-sea-se1", source: "legal-entities", sourceHandle: "source-sea-foodsource", target: "facilities", targetHandle: "target-se-east-bio", strokeWidth: 2 },
    { id: "e-sea-se2", source: "legal-entities", sourceHandle: "source-sea-foodsource", target: "facilities", targetHandle: "target-se-west-hq", strokeWidth: 2 },
    { id: "e-se1-algae", source: "facilities", sourceHandle: "source-se-east-bio", target: "product-lines", targetHandle: "target-algae-proteins", strokeWidth: 2 },
    { id: "e-se1-hydro", source: "facilities", sourceHandle: "source-se-east-bio", target: "product-lines", targetHandle: "target-hydro-microgreens", strokeWidth: 2 },
    { id: "e-se2-seafood", source: "facilities", sourceHandle: "source-se-west-hq", target: "product-lines", targetHandle: "target-seafood-alternatives", strokeWidth: 2 },
    { id: "e-bev-sourcing", source: "product-lines", sourceHandle: "source-beverages", target: "teams", targetHandle: "target-sourcing-supply", strokeWidth: 1.5 },
    { id: "e-frozen-dist", source: "product-lines", sourceHandle: "source-frozen-foods", target: "teams", targetHandle: "target-distribution", strokeWidth: 1.5 },
    { id: "e-plant-sustain", source: "product-lines", sourceHandle: "source-plant-based-proteins", target: "teams", targetHandle: "target-sustainability", strokeWidth: 1.5 },
    { id: "e-dairy-safety", source: "product-lines", sourceHandle: "source-dairy-products", target: "teams", targetHandle: "target-food-safety", strokeWidth: 1.5 },
    { id: "e-meat-ops", source: "product-lines", sourceHandle: "source-meat-processing", target: "teams", targetHandle: "target-operations", strokeWidth: 1.5 },
    { id: "e-pack-corp", source: "product-lines", sourceHandle: "source-packaged-goods", target: "teams", targetHandle: "target-corporate", strokeWidth: 1.5 },
    { id: "e-cereal-sourcing", source: "product-lines", sourceHandle: "source-cereals-grains", target: "teams", targetHandle: "target-sourcing-supply", strokeWidth: 1.5 },
    { id: "e-organic-sustain", source: "product-lines", sourceHandle: "source-organic-vegetables", target: "teams", targetHandle: "target-sustainability", strokeWidth: 1.5 },
    { id: "e-algae-sustain", source: "product-lines", sourceHandle: "source-algae-proteins", target: "teams", targetHandle: "target-sustainability", strokeWidth: 2 },
    { id: "e-hydro-safety", source: "product-lines", sourceHandle: "source-hydro-microgreens", target: "teams", targetHandle: "target-food-safety", strokeWidth: 2 },
    { id: "e-seafood-ops", source: "product-lines", sourceHandle: "source-seafood-alternatives", target: "teams", targetHandle: "target-operations", strokeWidth: 2 },
    { id: "e-sourcing-sap", source: "teams", sourceHandle: "source-sourcing-supply", target: "it-systems", targetHandle: "target-sap", strokeWidth: 1.5 },
    { id: "e-sustain-oracle", source: "teams", sourceHandle: "source-sustainability", target: "it-systems", targetHandle: "target-oracle-fusion", strokeWidth: 2 },
    { id: "e-safety-firebase", source: "teams", sourceHandle: "source-food-safety", target: "it-systems", targetHandle: "target-firebase", strokeWidth: 2 },
    { id: "e-dist-salesforce", source: "teams", sourceHandle: "source-distribution", target: "it-systems", targetHandle: "target-salesforce", strokeWidth: 1.5 },
    { id: "e-ops-azure", source: "teams", sourceHandle: "source-operations", target: "it-systems", targetHandle: "target-azure-sql", strokeWidth: 1.5 },
    { id: "e-corp-bpc", source: "teams", sourceHandle: "source-corporate", target: "it-systems", targetHandle: "target-bpc", strokeWidth: 1.5 },
    { id: "e-sustain-tableau", source: "teams", sourceHandle: "source-sustainability", target: "it-systems", targetHandle: "target-jd-tableau", strokeWidth: 1.5 },
    { id: "e-ops-zapier", source: "teams", sourceHandle: "source-operations", target: "it-systems", targetHandle: "target-zapier", strokeWidth: 1.5 },
  ],
};

const enterpriseAuditCoverage: CoverageConfig = {
  banner: {
    title: "Suggested Mapping for SEA FoodSource M&A",
    subtitle: "3 new risks added to library. Issues detected in 1 Compliance Framework, and 1 Control.",
  },
  groups: [
    {
      id: "regulatory-frameworks", label: "Regulatory Frameworks", headerColor: TEAL, column: "left",
      position: { x: 50, y: 50 },
      items: [{ id: "ava-food-safety", label: "AVA Food Safety" }],
    },
    {
      id: "compliance-frameworks", label: "Compliance Frameworks", headerColor: TEAL, column: "left",
      position: { x: 50, y: 150 },
      items: [
        { id: "iso-22000", label: "ISO 22000 (Food Safety)" },
        { id: "iso-14001", label: "ISO 14001 (Environmental Management)" },
        { id: "ohsas-18001", label: "OHSAS 18001 (Health & Safety)" },
      ],
    },
    {
      id: "policies", label: "Policies", headerColor: TEAL, column: "left",
      position: { x: 50, y: 320 },
      items: [{ id: "sustainable-sourcing", label: "Sustainable Sourcing" }],
    },
    {
      id: "risks", label: "Risks", headerColor: TEAL, column: "left",
      position: { x: 50, y: 420 },
      items: [
        { id: "climate-supply-disruption", label: "Climate-Related Supply Disruption" },
        { id: "food-contamination", label: "Food Contamination & Safety Incidents" },
        { id: "cybersecurity-breach", label: "Cybersecurity Breach" },
        { id: "market-volatility", label: "Market Volatility" },
      ],
    },
    {
      id: "controls", label: "Controls", headerColor: TEAL, column: "left",
      position: { x: 50, y: 640 },
      items: [
        { id: "climate-change-mitigation", label: "Climate Change Mitigation" },
        { id: "supply-chain-traceability", label: "Supply Chain Traceability" },
        { id: "regulatory-compliance-audits", label: "Regulatory Compliance Audits" },
      ],
    },
    {
      id: "facilities", label: "Facilities", headerColor: TEAL, column: "right",
      position: { x: 520, y: 50 },
      items: [
        { id: "se-east-bio", label: "SE-East Bio" },
        { id: "se-west-hq", label: "SE-West HQ" },
      ],
    },
    {
      id: "product-lines", label: "Product Lines", headerColor: TEAL, column: "right",
      position: { x: 520, y: 170 },
      items: [
        { id: "algae-based-proteins", label: "Algae-Based Proteins", highlighted: true },
        { id: "hydroponic-microgreens", label: "Hydroponic Microgreens" },
        { id: "seafood-alternatives", label: "Seafood Alternatives" },
      ],
    },
    {
      id: "it-systems", label: "IT Systems", headerColor: TEAL, column: "right",
      position: { x: 520, y: 340 },
      items: [
        { id: "supply-chain-mgmt", label: "Supply Chain Management" },
        { id: "environmental-monitoring", label: "Environmental Monitoring" },
        { id: "climate-data-analytics", label: "Climate Data Analytics" },
        { id: "hr-payroll", label: "HR & Payroll" },
      ],
    },
    {
      id: "processes", label: "Processes", headerColor: TEAL, column: "right",
      position: { x: 520, y: 560 },
      items: [
        { id: "raw-material-procurement", label: "Raw Material Procurement" },
        { id: "waste-treatment", label: "Waste Treatment & Disposal" },
        { id: "energy-consumption", label: "Energy Consumption & Monitoring" },
        { id: "water-usage", label: "Water Usage Optimization" },
      ],
    },
  ],
  edges: [
    { id: "e1", source: "regulatory-frameworks", sourceHandle: "source-ava-food-safety", target: "facilities", targetHandle: "target-se-east-bio" },
    { id: "e2", source: "regulatory-frameworks", sourceHandle: "source-ava-food-safety", target: "facilities", targetHandle: "target-se-west-hq" },
    { id: "e3", source: "compliance-frameworks", sourceHandle: "source-iso-22000", target: "product-lines", targetHandle: "target-algae-based-proteins" },
    { id: "e4", source: "compliance-frameworks", sourceHandle: "source-iso-14001", target: "product-lines", targetHandle: "target-hydroponic-microgreens" },
    { id: "e5", source: "compliance-frameworks", sourceHandle: "source-ohsas-18001", target: "product-lines", targetHandle: "target-seafood-alternatives" },
    { id: "e6", source: "policies", sourceHandle: "source-sustainable-sourcing", target: "it-systems", targetHandle: "target-supply-chain-mgmt" },
    { id: "e7", source: "risks", sourceHandle: "source-climate-supply-disruption", target: "it-systems", targetHandle: "target-environmental-monitoring" },
    { id: "e8", source: "risks", sourceHandle: "source-food-contamination", target: "it-systems", targetHandle: "target-climate-data-analytics" },
    { id: "e9", source: "risks", sourceHandle: "source-cybersecurity-breach", target: "it-systems", targetHandle: "target-hr-payroll" },
    { id: "e10", source: "risks", sourceHandle: "source-market-volatility", target: "processes", targetHandle: "target-raw-material-procurement" },
    { id: "e11", source: "controls", sourceHandle: "source-climate-change-mitigation", target: "processes", targetHandle: "target-waste-treatment" },
    { id: "e12", source: "controls", sourceHandle: "source-supply-chain-traceability", target: "processes", targetHandle: "target-energy-consumption" },
    { id: "e13", source: "controls", sourceHandle: "source-regulatory-compliance-audits", target: "processes", targetHandle: "target-water-usage" },
  ],
};

const enterpriseRiskInventory: InventoryConfig = {
  columns: [
    {
      id: "locations",
      position: { x: 0, y: 0 },
      data: {
        label: "Locations",
        headerColor: TEAL,
        items: [
          { id: "north-america", label: "North America" },
          { id: "united-states", label: "United States" },
          { id: "mexico", label: "Mexico", highlighted: true },
          { id: "canada", label: "Canada" },
          { id: "europe", label: "Europe" },
          { id: "germany", label: "Germany" },
          { id: "france", label: "France" },
          { id: "united-kingdom", label: "United Kingdom" },
          { id: "asia-pacific", label: "Asia-Pacific" },
          { id: "china", label: "China", highlighted: true },
        ],
      },
    },
    {
      id: "legal-entities",
      position: { x: 200, y: 0 },
      data: {
        label: "Legal Entities",
        headerColor: TEAL,
        items: [
          { id: "evergrow-logistics", label: "Evergrow Logistics" },
          { id: "climatecare-ventures", label: "ClimateCare Ventures" },
          { id: "nuharvest-innovations", label: "NuHarvest Innovations" },
          { id: "suncoast-foods", label: "SunCoast Foods", highlighted: true },
          { id: "greenfoods-holdings", label: "GreenFoods Holdings" },
          { id: "agri-hub", label: "Agri-Hub Distributors", highlighted: true },
          { id: "pacific-trading", label: "Pacific Trading Co.", highlighted: true },
        ],
      },
    },
    {
      id: "facilities",
      position: { x: 400, y: 0 },
      data: {
        label: "Facilities",
        headerColor: TEAL,
        items: [
          { id: "us-west-agri", label: "US-West Agri" },
          { id: "us-mid-pro", label: "US-Mid Pro" },
          { id: "us-south-pack", label: "US-South Pack" },
          { id: "us-east-dist", label: "US-East Dist" },
          { id: "ca-se-propack", label: "CA-SE Pro/Pack" },
          { id: "mx-central-farm", label: "MX-Central Farm", highlighted: true },
          { id: "mx-south-hub", label: "MX-South Hub", highlighted: true },
          { id: "de-north-euro", label: "DE-North Euro" },
          { id: "fr-south-green", label: "FR-South Green" },
          { id: "uk-central-hub", label: "UK-Central Hub" },
          { id: "uk-innovation", label: "UK-Innovation" },
          { id: "cn-shenzhen-mfg", label: "CN-Shenzhen Mfg", highlighted: true },
          { id: "cn-shanghai-dist", label: "CN-Shanghai Dist", highlighted: true },
        ],
      },
    },
    {
      id: "product-lines",
      position: { x: 600, y: 0 },
      data: {
        label: "Product Lines",
        headerColor: TEAL,
        items: [
          { id: "beverages", label: "Beverages" },
          { id: "frozen-foods", label: "Frozen Foods", highlighted: true },
          { id: "plant-based-proteins", label: "Plant-Based Proteins" },
          { id: "dairy-products", label: "Dairy Products" },
          { id: "meat-processing", label: "Meat Processing", highlighted: true },
          { id: "packaged-goods", label: "Packaged Goods", highlighted: true },
          { id: "cereals-grains", label: "Cereals & Grains" },
          { id: "organic-vegetables", label: "Organic Vegetables" },
          { id: "imported-spices", label: "Imported Spices", highlighted: true },
          { id: "canned-goods", label: "Canned Goods", highlighted: true },
          { id: "raw-materials", label: "Raw Materials", highlighted: true },
        ],
      },
    },
    {
      id: "teams",
      position: { x: 800, y: 0 },
      data: {
        label: "Teams",
        headerColor: TEAL,
        items: [
          { id: "trade-compliance", label: "Trade Compliance", highlighted: true },
          { id: "sourcing-supply", label: "Sourcing & Supply", highlighted: true },
          { id: "logistics", label: "Logistics", highlighted: true },
          { id: "legal-regulatory", label: "Legal & Regulatory", highlighted: true },
          { id: "finance-treasury", label: "Finance & Treasury", highlighted: true },
          { id: "operations", label: "Operations" },
        ],
      },
    },
    {
      id: "it-systems",
      position: { x: 1000, y: 0 },
      data: {
        label: "IT Systems",
        headerColor: TEAL,
        items: [
          { id: "sap-gts", label: "SAP GTS", highlighted: true },
          { id: "oracle-fusion", label: "Oracle Fusion" },
          { id: "customs-broker", label: "Customs Broker Portal", highlighted: true },
          { id: "azure-sql", label: "Azure SQL Database..." },
          { id: "trade-analytics", label: "Trade Analytics Eng...", highlighted: true },
          { id: "erp-central", label: "ERP Central" },
          { id: "jd-tableau", label: "JD Tableau" },
          { id: "duty-calc-engine", label: "Duty Calc Engine", highlighted: true },
        ],
      },
    },
  ],
  edges: [
    { id: "e-mx-suncoast", source: "locations", sourceHandle: "source-mexico", target: "legal-entities", targetHandle: "target-suncoast-foods", strokeWidth: 2 },
    { id: "e-mx-agrihub", source: "locations", sourceHandle: "source-mexico", target: "legal-entities", targetHandle: "target-agri-hub", strokeWidth: 2 },
    { id: "e-cn-pacific", source: "locations", sourceHandle: "source-china", target: "legal-entities", targetHandle: "target-pacific-trading", strokeWidth: 2 },
    { id: "e-sun-mx1", source: "legal-entities", sourceHandle: "source-suncoast-foods", target: "facilities", targetHandle: "target-mx-central-farm", strokeWidth: 2 },
    { id: "e-agri-mx2", source: "legal-entities", sourceHandle: "source-agri-hub", target: "facilities", targetHandle: "target-mx-south-hub", strokeWidth: 2 },
    { id: "e-pac-cn1", source: "legal-entities", sourceHandle: "source-pacific-trading", target: "facilities", targetHandle: "target-cn-shenzhen-mfg", strokeWidth: 2 },
    { id: "e-pac-cn2", source: "legal-entities", sourceHandle: "source-pacific-trading", target: "facilities", targetHandle: "target-cn-shanghai-dist", strokeWidth: 2 },
    { id: "e-mx1-frozen", source: "facilities", sourceHandle: "source-mx-central-farm", target: "product-lines", targetHandle: "target-frozen-foods", strokeWidth: 2 },
    { id: "e-mx2-meat", source: "facilities", sourceHandle: "source-mx-south-hub", target: "product-lines", targetHandle: "target-meat-processing", strokeWidth: 2 },
    { id: "e-cn1-spices", source: "facilities", sourceHandle: "source-cn-shenzhen-mfg", target: "product-lines", targetHandle: "target-imported-spices", strokeWidth: 2 },
    { id: "e-cn2-canned", source: "facilities", sourceHandle: "source-cn-shanghai-dist", target: "product-lines", targetHandle: "target-canned-goods", strokeWidth: 2 },
    { id: "e-cn1-raw", source: "facilities", sourceHandle: "source-cn-shenzhen-mfg", target: "product-lines", targetHandle: "target-raw-materials", strokeWidth: 2 },
    { id: "e-bev-sourcing", source: "product-lines", sourceHandle: "source-beverages", target: "teams", targetHandle: "target-sourcing-supply", strokeWidth: 1.5 },
    { id: "e-frozen-trade", source: "product-lines", sourceHandle: "source-frozen-foods", target: "teams", targetHandle: "target-trade-compliance", strokeWidth: 2 },
    { id: "e-meat-logistics", source: "product-lines", sourceHandle: "source-meat-processing", target: "teams", targetHandle: "target-logistics", strokeWidth: 2 },
    { id: "e-pack-legal", source: "product-lines", sourceHandle: "source-packaged-goods", target: "teams", targetHandle: "target-legal-regulatory", strokeWidth: 2 },
    { id: "e-spice-trade", source: "product-lines", sourceHandle: "source-imported-spices", target: "teams", targetHandle: "target-trade-compliance", strokeWidth: 2 },
    { id: "e-canned-finance", source: "product-lines", sourceHandle: "source-canned-goods", target: "teams", targetHandle: "target-finance-treasury", strokeWidth: 2 },
    { id: "e-raw-sourcing", source: "product-lines", sourceHandle: "source-raw-materials", target: "teams", targetHandle: "target-sourcing-supply", strokeWidth: 2 },
    { id: "e-cereal-ops", source: "product-lines", sourceHandle: "source-cereals-grains", target: "teams", targetHandle: "target-operations", strokeWidth: 1.5 },
    { id: "e-trade-sapgts", source: "teams", sourceHandle: "source-trade-compliance", target: "it-systems", targetHandle: "target-sap-gts", strokeWidth: 2 },
    { id: "e-sourcing-customs", source: "teams", sourceHandle: "source-sourcing-supply", target: "it-systems", targetHandle: "target-customs-broker", strokeWidth: 2 },
    { id: "e-logistics-trade", source: "teams", sourceHandle: "source-logistics", target: "it-systems", targetHandle: "target-trade-analytics", strokeWidth: 2 },
    { id: "e-legal-erp", source: "teams", sourceHandle: "source-legal-regulatory", target: "it-systems", targetHandle: "target-erp-central", strokeWidth: 1.5 },
    { id: "e-finance-duty", source: "teams", sourceHandle: "source-finance-treasury", target: "it-systems", targetHandle: "target-duty-calc-engine", strokeWidth: 2 },
    { id: "e-ops-oracle", source: "teams", sourceHandle: "source-operations", target: "it-systems", targetHandle: "target-oracle-fusion", strokeWidth: 1.5 },
    { id: "e-trade-tableau", source: "teams", sourceHandle: "source-trade-compliance", target: "it-systems", targetHandle: "target-jd-tableau", strokeWidth: 1.5 },
    { id: "e-finance-azure", source: "teams", sourceHandle: "source-finance-treasury", target: "it-systems", targetHandle: "target-azure-sql", strokeWidth: 1.5 },
  ],
};

const enterpriseRiskCoverage: CoverageConfig = {
  banner: {
    title: "Tariff Mitigation Impact Analysis",
    subtitle: "4 supply chains exposed to new tariff regimes. 2 Controls require re-evaluation, 3 Risks escalated.",
  },
  groups: [
    {
      id: "regulatory-frameworks", label: "Regulatory Frameworks", headerColor: TEAL, column: "left",
      position: { x: 50, y: 50 },
      items: [
        { id: "us-trade-act", label: "US Trade Expansion Act" },
        { id: "wto-tariff-schedule", label: "WTO Tariff Schedule", highlighted: true },
      ],
    },
    {
      id: "compliance-frameworks", label: "Compliance Frameworks", headerColor: TEAL, column: "left",
      position: { x: 50, y: 170 },
      items: [
        { id: "cbp-ctpat", label: "CBP C-TPAT Certification" },
        { id: "itar-ear", label: "ITAR / EAR Export Controls", highlighted: true },
        { id: "customs-valuation", label: "Customs Valuation Standards" },
      ],
    },
    {
      id: "policies", label: "Policies", headerColor: TEAL, column: "left",
      position: { x: 50, y: 340 },
      items: [
        { id: "duty-drawback-policy", label: "Duty Drawback Policy" },
        { id: "origin-determination", label: "Country of Origin Rules", highlighted: true },
      ],
    },
    {
      id: "risks", label: "Risks", headerColor: TEAL, column: "left",
      position: { x: 50, y: 460 },
      items: [
        { id: "tariff-escalation", label: "Tariff Escalation Exposure", highlighted: true },
        { id: "supply-chain-rerouting", label: "Supply Chain Rerouting Cost" },
        { id: "fx-hedging-gap", label: "FX Hedging Gap" },
        { id: "retaliatory-sanctions", label: "Retaliatory Sanctions Risk", highlighted: true },
      ],
    },
    {
      id: "controls", label: "Controls", headerColor: TEAL, column: "left",
      position: { x: 50, y: 680 },
      items: [
        { id: "tariff-classification-review", label: "Tariff Classification Review" },
        { id: "ftz-utilization", label: "FTZ Utilization Controls", highlighted: true },
        { id: "vendor-diversification", label: "Vendor Diversification" },
      ],
    },
    {
      id: "trade-zones", label: "Trade Zones", headerColor: TEAL, column: "right",
      position: { x: 520, y: 50 },
      items: [
        { id: "nafta-usmca", label: "USMCA / NAFTA Zone" },
        { id: "apac-free-trade", label: "APAC Free Trade Zone", highlighted: true },
        { id: "eu-gsp", label: "EU GSP Program" },
      ],
    },
    {
      id: "supply-chains", label: "Supply Chains", headerColor: TEAL, column: "right",
      position: { x: 520, y: 200 },
      items: [
        { id: "raw-material-import", label: "Raw Material Import Path", highlighted: true },
        { id: "finished-goods-export", label: "Finished Goods Export" },
        { id: "components-assembly", label: "Components Assembly Line" },
        { id: "packaging-materials", label: "Packaging Material Chain", highlighted: true },
      ],
    },
    {
      id: "financial-systems", label: "Financial Systems", headerColor: TEAL, column: "right",
      position: { x: 520, y: 400 },
      items: [
        { id: "duty-calc-engine", label: "Duty Calculation Engine", highlighted: true },
        { id: "cost-allocation", label: "Cost Allocation Module" },
        { id: "transfer-pricing", label: "Transfer Pricing System" },
        { id: "trade-analytics", label: "Trade Analytics Platform" },
      ],
    },
    {
      id: "mitigation-processes", label: "Mitigation Processes", headerColor: TEAL, column: "right",
      position: { x: 520, y: 600 },
      items: [
        { id: "supplier-negotiation", label: "Supplier Re-negotiation" },
        { id: "alternative-sourcing", label: "Alternative Sourcing Plan", highlighted: true },
        { id: "bonded-warehouse", label: "Bonded Warehouse Strategy" },
        { id: "tariff-engineering", label: "Tariff Engineering Review" },
      ],
    },
  ],
  edges: [
    { id: "e1", source: "regulatory-frameworks", sourceHandle: "source-us-trade-act", target: "trade-zones", targetHandle: "target-nafta-usmca" },
    { id: "e2", source: "regulatory-frameworks", sourceHandle: "source-wto-tariff-schedule", target: "trade-zones", targetHandle: "target-apac-free-trade" },
    { id: "e3", source: "compliance-frameworks", sourceHandle: "source-cbp-ctpat", target: "trade-zones", targetHandle: "target-nafta-usmca" },
    { id: "e4", source: "compliance-frameworks", sourceHandle: "source-itar-ear", target: "supply-chains", targetHandle: "target-raw-material-import" },
    { id: "e5", source: "compliance-frameworks", sourceHandle: "source-customs-valuation", target: "supply-chains", targetHandle: "target-finished-goods-export" },
    { id: "e6", source: "policies", sourceHandle: "source-duty-drawback-policy", target: "financial-systems", targetHandle: "target-duty-calc-engine" },
    { id: "e7", source: "policies", sourceHandle: "source-origin-determination", target: "supply-chains", targetHandle: "target-components-assembly" },
    { id: "e8", source: "risks", sourceHandle: "source-tariff-escalation", target: "financial-systems", targetHandle: "target-cost-allocation" },
    { id: "e9", source: "risks", sourceHandle: "source-supply-chain-rerouting", target: "supply-chains", targetHandle: "target-packaging-materials" },
    { id: "e10", source: "risks", sourceHandle: "source-fx-hedging-gap", target: "financial-systems", targetHandle: "target-transfer-pricing" },
    { id: "e11", source: "risks", sourceHandle: "source-retaliatory-sanctions", target: "mitigation-processes", targetHandle: "target-alternative-sourcing" },
    { id: "e12", source: "controls", sourceHandle: "source-tariff-classification-review", target: "financial-systems", targetHandle: "target-trade-analytics" },
    { id: "e13", source: "controls", sourceHandle: "source-ftz-utilization", target: "mitigation-processes", targetHandle: "target-bonded-warehouse" },
    { id: "e14", source: "controls", sourceHandle: "source-vendor-diversification", target: "mitigation-processes", targetHandle: "target-supplier-negotiation" },
  ],
};

const itSecurityInventory: InventoryConfig = {
  columns: [
    {
      id: "locations",
      position: { x: 0, y: 0 },
      data: {
        label: "Locations",
        headerColor: TEAL,
        items: [
          { id: "north-america", label: "North America" },
          { id: "united-states", label: "United States", highlighted: true },
          { id: "mexico", label: "Mexico" },
          { id: "canada", label: "Canada" },
          { id: "europe", label: "Europe" },
          { id: "germany", label: "Germany", highlighted: true },
          { id: "france", label: "France" },
          { id: "united-kingdom", label: "United Kingdom" },
          { id: "asia-pacific", label: "Asia-Pacific" },
          { id: "singapore", label: "Singapore" },
        ],
      },
    },
    {
      id: "legal-entities",
      position: { x: 200, y: 0 },
      data: {
        label: "Legal Entities",
        headerColor: TEAL,
        items: [
          { id: "evergrow-logistics", label: "Evergrow Logistics" },
          { id: "climatecare-ventures", label: "ClimateCare Ventures", highlighted: true },
          { id: "nuharvest-innovations", label: "NuHarvest Innovations" },
          { id: "suncoast-foods", label: "SunCoast Foods" },
          { id: "greenfoods-holdings", label: "GreenFoods Holdings", highlighted: true },
          { id: "agri-hub", label: "Agri-Hub Distributors" },
          { id: "techops-global", label: "TechOps Global", highlighted: true },
        ],
      },
    },
    {
      id: "facilities",
      position: { x: 400, y: 0 },
      data: {
        label: "Facilities",
        headerColor: TEAL,
        items: [
          { id: "us-west-agri", label: "US-West Agri" },
          { id: "us-mid-pro", label: "US-Mid Pro" },
          { id: "us-south-pack", label: "US-South Pack" },
          { id: "us-east-dist", label: "US-East Dist", highlighted: true },
          { id: "ca-se-propack", label: "CA-SE Pro/Pack" },
          { id: "mx-central-farm", label: "MX-Central Farm" },
          { id: "mx-south-hub", label: "MX-South Hub" },
          { id: "de-north-euro", label: "DE-North Euro", highlighted: true },
          { id: "fr-south-green", label: "FR-South Green" },
          { id: "uk-central-hub", label: "UK-Central Hub" },
          { id: "uk-innovation", label: "UK-Innovation" },
          { id: "us-soc-center", label: "US-SOC Center", highlighted: true },
          { id: "de-cyber-lab", label: "DE-Cyber Lab", highlighted: true },
        ],
      },
    },
    {
      id: "product-lines",
      position: { x: 600, y: 0 },
      data: {
        label: "Product Lines",
        headerColor: TEAL,
        items: [
          { id: "beverages", label: "Beverages" },
          { id: "frozen-foods", label: "Frozen Foods" },
          { id: "plant-based-proteins", label: "Plant-Based Proteins" },
          { id: "dairy-products", label: "Dairy Products" },
          { id: "meat-processing", label: "Meat Processing" },
          { id: "packaged-goods", label: "Packaged Goods" },
          { id: "cereals-grains", label: "Cereals & Grains" },
          { id: "organic-vegetables", label: "Organic Vegetables" },
          { id: "iot-sensors", label: "IoT Sensor Arrays", highlighted: true },
          { id: "cloud-services", label: "Cloud Services", highlighted: true },
          { id: "scada-systems", label: "SCADA Systems", highlighted: true },
        ],
      },
    },
    {
      id: "teams",
      position: { x: 800, y: 0 },
      data: {
        label: "Teams",
        headerColor: TEAL,
        items: [
          { id: "soc-team", label: "SOC Operations", highlighted: true },
          { id: "threat-intel", label: "Threat Intelligence", highlighted: true },
          { id: "vuln-mgmt", label: "Vulnerability Mgmt", highlighted: true },
          { id: "incident-response", label: "Incident Response", highlighted: true },
          { id: "network-security", label: "Network Security", highlighted: true },
          { id: "identity-access", label: "Identity & Access", highlighted: true },
        ],
      },
    },
    {
      id: "it-systems",
      position: { x: 1000, y: 0 },
      data: {
        label: "IT Systems",
        headerColor: TEAL,
        items: [
          { id: "crowdstrike", label: "CrowdStrike EDR", highlighted: true },
          { id: "splunk-siem", label: "Splunk SIEM", highlighted: true },
          { id: "palo-alto", label: "Palo Alto NGFW", highlighted: true },
          { id: "azure-sentinel", label: "Azure Sentinel" },
          { id: "qualys", label: "Qualys Scanner", highlighted: true },
          { id: "okta", label: "Okta IAM" },
          { id: "jd-tableau", label: "JD Tableau" },
          { id: "servicenow", label: "ServiceNow ITSM", highlighted: true },
        ],
      },
    },
  ],
  edges: [
    { id: "e-us-climate", source: "locations", sourceHandle: "source-united-states", target: "legal-entities", targetHandle: "target-climatecare-ventures", strokeWidth: 2 },
    { id: "e-us-techops", source: "locations", sourceHandle: "source-united-states", target: "legal-entities", targetHandle: "target-techops-global", strokeWidth: 2 },
    { id: "e-de-green", source: "locations", sourceHandle: "source-germany", target: "legal-entities", targetHandle: "target-greenfoods-holdings", strokeWidth: 2 },
    { id: "e-climate-soc", source: "legal-entities", sourceHandle: "source-climatecare-ventures", target: "facilities", targetHandle: "target-us-east-dist", strokeWidth: 2 },
    { id: "e-green-de", source: "legal-entities", sourceHandle: "source-greenfoods-holdings", target: "facilities", targetHandle: "target-de-north-euro", strokeWidth: 2 },
    { id: "e-tech-soc", source: "legal-entities", sourceHandle: "source-techops-global", target: "facilities", targetHandle: "target-us-soc-center", strokeWidth: 2 },
    { id: "e-tech-cyber", source: "legal-entities", sourceHandle: "source-techops-global", target: "facilities", targetHandle: "target-de-cyber-lab", strokeWidth: 2 },
    { id: "e-soc-iot", source: "facilities", sourceHandle: "source-us-soc-center", target: "product-lines", targetHandle: "target-iot-sensors", strokeWidth: 2 },
    { id: "e-soc-cloud", source: "facilities", sourceHandle: "source-us-soc-center", target: "product-lines", targetHandle: "target-cloud-services", strokeWidth: 2 },
    { id: "e-cyber-scada", source: "facilities", sourceHandle: "source-de-cyber-lab", target: "product-lines", targetHandle: "target-scada-systems", strokeWidth: 2 },
    { id: "e-east-cloud", source: "facilities", sourceHandle: "source-us-east-dist", target: "product-lines", targetHandle: "target-cloud-services", strokeWidth: 1.5 },
    { id: "e-bev-ops", source: "product-lines", sourceHandle: "source-beverages", target: "teams", targetHandle: "target-network-security", strokeWidth: 1.5 },
    { id: "e-iot-soc", source: "product-lines", sourceHandle: "source-iot-sensors", target: "teams", targetHandle: "target-soc-team", strokeWidth: 2 },
    { id: "e-cloud-threat", source: "product-lines", sourceHandle: "source-cloud-services", target: "teams", targetHandle: "target-threat-intel", strokeWidth: 2 },
    { id: "e-scada-vuln", source: "product-lines", sourceHandle: "source-scada-systems", target: "teams", targetHandle: "target-vuln-mgmt", strokeWidth: 2 },
    { id: "e-frozen-incident", source: "product-lines", sourceHandle: "source-frozen-foods", target: "teams", targetHandle: "target-incident-response", strokeWidth: 1.5 },
    { id: "e-dairy-identity", source: "product-lines", sourceHandle: "source-dairy-products", target: "teams", targetHandle: "target-identity-access", strokeWidth: 1.5 },
    { id: "e-meat-network", source: "product-lines", sourceHandle: "source-meat-processing", target: "teams", targetHandle: "target-network-security", strokeWidth: 1.5 },
    { id: "e-pack-soc", source: "product-lines", sourceHandle: "source-packaged-goods", target: "teams", targetHandle: "target-soc-team", strokeWidth: 1.5 },
    { id: "e-soc-crowd", source: "teams", sourceHandle: "source-soc-team", target: "it-systems", targetHandle: "target-crowdstrike", strokeWidth: 2 },
    { id: "e-threat-splunk", source: "teams", sourceHandle: "source-threat-intel", target: "it-systems", targetHandle: "target-splunk-siem", strokeWidth: 2 },
    { id: "e-vuln-qualys", source: "teams", sourceHandle: "source-vuln-mgmt", target: "it-systems", targetHandle: "target-qualys", strokeWidth: 2 },
    { id: "e-incident-snow", source: "teams", sourceHandle: "source-incident-response", target: "it-systems", targetHandle: "target-servicenow", strokeWidth: 2 },
    { id: "e-network-palo", source: "teams", sourceHandle: "source-network-security", target: "it-systems", targetHandle: "target-palo-alto", strokeWidth: 2 },
    { id: "e-identity-okta", source: "teams", sourceHandle: "source-identity-access", target: "it-systems", targetHandle: "target-okta", strokeWidth: 1.5 },
    { id: "e-soc-sentinel", source: "teams", sourceHandle: "source-soc-team", target: "it-systems", targetHandle: "target-azure-sentinel", strokeWidth: 1.5 },
    { id: "e-threat-tableau", source: "teams", sourceHandle: "source-threat-intel", target: "it-systems", targetHandle: "target-jd-tableau", strokeWidth: 1.5 },
  ],
};

const itSecurityCoverage: CoverageConfig = {
  banner: {
    title: "Zero Day Vulnerability Response Mapping",
    subtitle: "Critical CVE detected across 3 systems. 2 attack vectors identified, 4 Controls under emergency review.",
  },
  groups: [
    {
      id: "threat-sources", label: "Threat Sources", headerColor: TEAL, column: "left",
      position: { x: 50, y: 50 },
      items: [
        { id: "apt-group-lazarus", label: "APT Group: Lazarus" },
        { id: "ransomware-lockbit", label: "Ransomware: LockBit 4.0", highlighted: true },
      ],
    },
    {
      id: "attack-vectors", label: "Attack Vectors", headerColor: TEAL, column: "left",
      position: { x: 50, y: 170 },
      items: [
        { id: "cve-2026-0001", label: "CVE-2026-0001 (RCE)", highlighted: true },
        { id: "phishing-spearphish", label: "Spear Phishing Campaign" },
        { id: "supply-chain-compromise", label: "Supply Chain Compromise", highlighted: true },
      ],
    },
    {
      id: "vulnerabilities", label: "Vulnerabilities", headerColor: TEAL, column: "left",
      position: { x: 50, y: 340 },
      items: [
        { id: "unpatched-exchange", label: "Unpatched Exchange Server", highlighted: true },
        { id: "weak-api-auth", label: "Weak API Authentication" },
      ],
    },
    {
      id: "risks", label: "Risks", headerColor: TEAL, column: "left",
      position: { x: 50, y: 460 },
      items: [
        { id: "data-exfiltration", label: "Data Exfiltration Risk", highlighted: true },
        { id: "lateral-movement", label: "Lateral Movement Spread" },
        { id: "service-disruption", label: "Critical Service Disruption", highlighted: true },
        { id: "regulatory-breach", label: "Regulatory Breach Notification" },
      ],
    },
    {
      id: "controls", label: "Controls", headerColor: TEAL, column: "left",
      position: { x: 50, y: 680 },
      items: [
        { id: "edr-monitoring", label: "EDR Continuous Monitoring", highlighted: true },
        { id: "network-segmentation", label: "Network Micro-Segmentation" },
        { id: "patch-management", label: "Emergency Patch Management", highlighted: true },
      ],
    },
    {
      id: "affected-systems", label: "Affected Systems", headerColor: TEAL, column: "right",
      position: { x: 520, y: 50 },
      items: [
        { id: "exchange-server", label: "Exchange Server 2019", highlighted: true },
        { id: "vpn-gateway", label: "VPN Gateway Cluster" },
        { id: "ad-domain", label: "Active Directory DC", highlighted: true },
      ],
    },
    {
      id: "impacted-assets", label: "Impacted Assets", headerColor: TEAL, column: "right",
      position: { x: 520, y: 210 },
      items: [
        { id: "customer-db", label: "Customer PII Database", highlighted: true },
        { id: "scada-network", label: "SCADA Control Network" },
        { id: "cloud-workloads", label: "Azure Cloud Workloads", highlighted: true },
        { id: "erp-financials", label: "ERP Financial Module" },
      ],
    },
    {
      id: "detection-tools", label: "Detection & Response", headerColor: TEAL, column: "right",
      position: { x: 520, y: 400 },
      items: [
        { id: "crowdstrike-edr", label: "CrowdStrike EDR", highlighted: true },
        { id: "splunk-siem", label: "Splunk SIEM Alerts" },
        { id: "qualys-scanner", label: "Qualys Vuln Scanner", highlighted: true },
        { id: "palo-alto-fw", label: "Palo Alto NGFW" },
      ],
    },
    {
      id: "response-actions", label: "Response Actions", headerColor: TEAL, column: "right",
      position: { x: 520, y: 600 },
      items: [
        { id: "isolate-endpoints", label: "Endpoint Isolation" },
        { id: "ioc-sweep", label: "IOC Sweep & Forensics", highlighted: true },
        { id: "emergency-patching", label: "Emergency Patch Deploy" },
        { id: "threat-hunting", label: "Active Threat Hunting", highlighted: true },
      ],
    },
  ],
  edges: [
    { id: "e1", source: "threat-sources", sourceHandle: "source-apt-group-lazarus", target: "affected-systems", targetHandle: "target-exchange-server" },
    { id: "e2", source: "threat-sources", sourceHandle: "source-ransomware-lockbit", target: "affected-systems", targetHandle: "target-vpn-gateway" },
    { id: "e3", source: "attack-vectors", sourceHandle: "source-cve-2026-0001", target: "affected-systems", targetHandle: "target-exchange-server" },
    { id: "e4", source: "attack-vectors", sourceHandle: "source-phishing-spearphish", target: "affected-systems", targetHandle: "target-ad-domain" },
    { id: "e5", source: "attack-vectors", sourceHandle: "source-supply-chain-compromise", target: "impacted-assets", targetHandle: "target-cloud-workloads" },
    { id: "e6", source: "vulnerabilities", sourceHandle: "source-unpatched-exchange", target: "impacted-assets", targetHandle: "target-customer-db" },
    { id: "e7", source: "vulnerabilities", sourceHandle: "source-weak-api-auth", target: "impacted-assets", targetHandle: "target-erp-financials" },
    { id: "e8", source: "risks", sourceHandle: "source-data-exfiltration", target: "detection-tools", targetHandle: "target-crowdstrike-edr" },
    { id: "e9", source: "risks", sourceHandle: "source-lateral-movement", target: "detection-tools", targetHandle: "target-splunk-siem" },
    { id: "e10", source: "risks", sourceHandle: "source-service-disruption", target: "detection-tools", targetHandle: "target-palo-alto-fw" },
    { id: "e11", source: "risks", sourceHandle: "source-regulatory-breach", target: "response-actions", targetHandle: "target-ioc-sweep" },
    { id: "e12", source: "controls", sourceHandle: "source-edr-monitoring", target: "detection-tools", targetHandle: "target-qualys-scanner" },
    { id: "e13", source: "controls", sourceHandle: "source-network-segmentation", target: "response-actions", targetHandle: "target-isolate-endpoints" },
    { id: "e14", source: "controls", sourceHandle: "source-patch-management", target: "response-actions", targetHandle: "target-emergency-patching" },
  ],
};

const workspaceViewConfigs: Record<string, WorkspaceViewConfig> = {
  "enterprise-audit": {
    inventory: enterpriseAuditInventory,
    coverage: enterpriseAuditCoverage,
  },
  "enterprise-risk": {
    inventory: enterpriseRiskInventory,
    coverage: enterpriseRiskCoverage,
  },
  "it-security": {
    inventory: itSecurityInventory,
    coverage: itSecurityCoverage,
  },
};

const customConfigPool = ["enterprise-audit", "enterprise-risk", "it-security"];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getWorkspaceViewConfig(workspaceId: string, isCustom?: boolean): WorkspaceViewConfig {
  if (!isCustom && workspaceViewConfigs[workspaceId]) {
    return workspaceViewConfigs[workspaceId];
  }
  const idx = hashString(workspaceId || "custom") % customConfigPool.length;
  return workspaceViewConfigs[customConfigPool[idx]];
}

export function buildInventoryNodes(
  config: InventoryConfig,
  onItemClick: (itemId: string, itemLabel: string, groupType: string) => void
): Node[] {
  return config.columns.map((col) => ({
    id: col.id,
    type: "columnNode",
    position: col.position,
    data: {
      ...col.data,
      onItemClick,
    },
  }));
}

export function buildInventoryEdges(config: InventoryConfig): Edge[] {
  return config.edges.map((e) => ({
    id: e.id,
    source: e.source,
    sourceHandle: e.sourceHandle,
    target: e.target,
    targetHandle: e.targetHandle,
    type: "default" as const,
    style: { stroke: TEAL, strokeWidth: e.strokeWidth ?? 2 },
    animated: false,
  }));
}

export function buildCoverageNodes(
  config: CoverageConfig,
  onItemClick: (itemId: string, itemLabel: string, groupType: string) => void
): Node[] {
  return config.groups.map((group) => ({
    id: group.id,
    type: "groupNode",
    position: group.position,
    data: {
      label: group.label,
      headerColor: group.headerColor,
      items: group.items,
      column: group.column,
      onItemClick,
    },
  }));
}

export function buildCoverageEdges(config: CoverageConfig): Edge[] {
  return config.edges.map((e) => ({
    id: e.id,
    source: e.source,
    sourceHandle: e.sourceHandle,
    target: e.target,
    targetHandle: e.targetHandle,
    type: "default" as const,
    style: { stroke: TEAL, strokeWidth: e.strokeWidth ?? 2 },
    animated: false,
  }));
}
