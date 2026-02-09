import { useState, useCallback, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Pin, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface RiskNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: "lg" | "md" | "xl";
  color: "teal" | "dark";
}

interface RiskEdge {
  from: string;
  to: string;
}

const NODES: RiskNode[] = [
  { id: "trade-data", label: "Trade\nData", x: 150, y: 175, size: "lg", color: "teal" },
  { id: "policy-intel", label: "Policy\nIntelligence", x: 150, y: 305, size: "lg", color: "teal" },
  { id: "supplier-network", label: "Supplier\nNetwork", x: 150, y: 435, size: "lg", color: "teal" },
  { id: "tariff-rate", label: "Tariff\nRate\nChanges", x: 310, y: 130, size: "md", color: "dark" },
  { id: "geopolitical", label: "Geopolitical\nRisk", x: 318, y: 255, size: "md", color: "dark" },
  { id: "supply-chain", label: "Supply\nChain\nDisruption", x: 310, y: 370, size: "md", color: "dark" },
  { id: "volume-analysis", label: "Volume\nAnalysis", x: 310, y: 480, size: "md", color: "dark" },
  { id: "cost-impact", label: "Cost\nImpact\nModel", x: 480, y: 175, size: "md", color: "teal" },
  { id: "risk-weighting", label: "Risk\nWeighting", x: 490, y: 320, size: "md", color: "teal" },
  { id: "exposure-calc", label: "Exposure\nCalculation", x: 480, y: 450, size: "md", color: "teal" },
  { id: "tariff-assessment", label: "Tariff Risk\nAssessment", x: 660, y: 305, size: "xl", color: "dark" },
];

const EDGES: RiskEdge[] = [
  { from: "trade-data", to: "tariff-rate" },
  { from: "trade-data", to: "geopolitical" },
  { from: "policy-intel", to: "geopolitical" },
  { from: "policy-intel", to: "supply-chain" },
  { from: "supplier-network", to: "supply-chain" },
  { from: "supplier-network", to: "volume-analysis" },
  { from: "tariff-rate", to: "cost-impact" },
  { from: "geopolitical", to: "cost-impact" },
  { from: "geopolitical", to: "risk-weighting" },
  { from: "supply-chain", to: "risk-weighting" },
  { from: "supply-chain", to: "exposure-calc" },
  { from: "volume-analysis", to: "exposure-calc" },
  { from: "cost-impact", to: "risk-weighting" },
  { from: "risk-weighting", to: "tariff-assessment" },
  { from: "exposure-calc", to: "tariff-assessment" },
];

function getNodeRadius(size: RiskNode["size"]): number {
  switch (size) {
    case "xl": return 52;
    case "lg": return 44;
    case "md": return 40;
  }
}

function BezierEdge({ from, to }: { from: RiskNode; to: RiskNode }) {
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;
  const r1 = getNodeRadius(from.size);
  const r2 = getNodeRadius(to.size);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  const sx = x1 + nx * r1;
  const sy = y1 + ny * r1;
  const ex = x2 - nx * (r2 + 4);
  const ey = y2 - ny * (r2 + 4);

  const curvature = 0.35;
  const perpX = -ny * curvature * dist * 0.3;
  const perpY = nx * curvature * dist * 0.3;

  const cp1x = sx + dx * 0.3 + perpX * 0.3;
  const cp1y = sy + dy * 0.1;
  const cp2x = ex - dx * 0.3 + perpX * 0.3;
  const cp2y = ey - dy * 0.1;

  return (
    <path
      d={`M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`}
      fill="none"
      stroke="#94a3b8"
      strokeWidth="1.5"
      opacity="0.5"
      markerEnd="url(#arrowhead)"
    />
  );
}

function CircleNode({ node, isHovered, onHover, onLeave }: {
  node: RiskNode;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const r = getNodeRadius(node.size);
  const cx = node.x;
  const cy = node.y;
  const lines = node.label.split("\n");
  const fontSize = node.size === "xl" ? 11 : node.size === "lg" ? 10.5 : 9.5;
  const lineHeight = fontSize * 1.3;
  const totalHeight = lines.length * lineHeight;
  const startY = cy - totalHeight / 2 + lineHeight / 2;

  const fillColor = node.color === "teal" ? "#266C92" : "#1e293b";
  const hoverFill = node.color === "teal" ? "#1d5a7a" : "#0f172a";

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
      data-testid={`risk-node-${node.id}`}
    >
      {isHovered && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 6}
          fill="none"
          stroke="#266C92"
          strokeWidth="1.5"
          opacity="0.25"
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={isHovered ? hoverFill : fillColor}
        style={{ transition: "fill 0.15s ease" }}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={startY + i * lineHeight}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={fontSize}
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight={node.size === "xl" ? 600 : 500}
          style={{ pointerEvents: "none" }}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function RiskScoreDetails() {
  return (
    <Card
      style={{ width: 230 }}
      data-testid="risk-score-details"
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <p className="text-sm font-medium text-gray-700">Risk Score Details</p>
          <Badge
            variant="destructive"
            className="text-[10px] rounded-full no-default-hover-elevate no-default-active-elevate"
          >
            CRITICAL
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs text-gray-500">Overall Risk Score</p>
          <p className="text-3xl font-bold text-gray-900">92</p>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100 mt-1 mb-4">
          <div
            className="h-2 rounded-full"
            style={{ width: "92%", backgroundColor: "#dc2626" }}
          />
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500">Cost Impact</p>
          <p className="text-xs font-semibold text-gray-800">$10M</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500">Geopolitical Weight</p>
          <p className="text-xs font-semibold text-gray-800">0.82</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500">Exposure Level</p>
          <p className="text-xs font-semibold text-gray-800">High</p>
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-2.5">
        <p className="text-[10px] text-gray-400 italic">
          Click any node to view detailed calculations and data sources
        </p>
      </div>
    </Card>
  );
}

const FORMULA_TEXT = `// Tariff Risk Score Calculation Formula
// Weighted composite score based on multiple risk factors

RiskScore = (
  // Cost Impact Component (40% weight)
  (TariffRateChange * TradeVolume * AvgProductValue) * 0.40 +

  // Geopolitical Risk Component (35% weight)
  (GeopoliticalRiskIndex * SupplyChainDisruption * PolicyVolatility) * 0.35 +

  // Exposure Component (25% weight)
  ((TotalExposureValue / AnnualRevenue) * 100) * 0.25
) * ComplianceMultiplier

// Current Values:
// TariffRateChange = 0.25 (25% increase)
// TradeVolume = 1,247,000 units
// AvgProductValue = $480.00
// GeopoliticalRiskIndex = 0.82
// SupplyChainDisruption = 0.71
// PolicyVolatility = 0.68
// TotalExposureValue = $142,500,000
// AnnualRevenue = $1,850,000,000
// ComplianceMultiplier = 1.15

// Result: 92 (Critical Risk Level)`;

function FormulaEditor() {
  const [formula, setFormula] = useState(FORMULA_TEXT);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [formula]);

  return (
    <Card data-testid="formula-editor">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-100 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#266C92" }} />
          <p className="text-sm font-medium text-gray-700">Global Risk Calculation Formula</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Editable</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
      <div className="p-4">
        <Textarea
          ref={textareaRef}
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full font-mono text-[12px] leading-[1.7] text-gray-700 bg-gray-50 rounded-md border border-gray-100 focus:border-[#266C92] focus:ring-1 focus:ring-[#266C92]/20 resize-none min-h-[200px]"
          spellCheck={false}
          data-testid="formula-textarea"
        />
      </div>
    </Card>
  );
}

export default function RiskCalculationPage() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const nodeMap = NODES.reduce((acc, n) => ({ ...acc, [n.id]: n }), {} as Record<string, RiskNode>);

  const handleNodeHover = useCallback((id: string) => setHoveredNode(id), []);
  const handleNodeLeave = useCallback(() => setHoveredNode(null), []);

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-var(--browser-chrome-height,0px))]">
        <div className="flex items-center justify-between gap-2 px-6 pt-5 pb-3 flex-shrink-0 flex-wrap">
          <h1 className="text-xl font-semibold text-gray-900">Risk Calculation Analysis</h1>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" data-testid="button-pin-risk">
              <Pin className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-share-risk">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-more-risk">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="flex gap-5 mb-5">
            <Card
              className="flex-1 relative p-0"
              style={{ minHeight: 520 }}
              data-testid="risk-canvas"
            >
              <svg
                viewBox="60 60 700 480"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" opacity="0.6" />
                  </marker>
                </defs>
                {EDGES.map((edge, i) => {
                  const from = nodeMap[edge.from];
                  const to = nodeMap[edge.to];
                  if (!from || !to) return null;
                  return <BezierEdge key={i} from={from} to={to} />;
                })}
                {NODES.map((node) => (
                  <CircleNode
                    key={node.id}
                    node={node}
                    isHovered={hoveredNode === node.id}
                    onHover={() => handleNodeHover(node.id)}
                    onLeave={handleNodeLeave}
                  />
                ))}
              </svg>
            </Card>

            <div className="flex-shrink-0">
              <RiskScoreDetails />
            </div>
          </div>

          <FormulaEditor />
        </div>
      </div>
    </AppLayout>
  );
}
