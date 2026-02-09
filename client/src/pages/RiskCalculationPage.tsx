import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Pin, Share2, MoreHorizontal, X } from "lucide-react";
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

function computeTrace(selectedId: string): { nodes: Set<string>; edges: Set<string> } {
  const downstream: Record<string, string[]> = {};
  const upstream: Record<string, string[]> = {};
  for (const e of EDGES) {
    if (!downstream[e.from]) downstream[e.from] = [];
    downstream[e.from].push(e.to);
    if (!upstream[e.to]) upstream[e.to] = [];
    upstream[e.to].push(e.from);
  }

  const traceNodes = new Set<string>();
  const traceEdges = new Set<string>();
  traceNodes.add(selectedId);

  const walkDown = (id: string) => {
    for (const child of (downstream[id] || [])) {
      const edgeKey = `${id}->${child}`;
      if (!traceEdges.has(edgeKey)) {
        traceEdges.add(edgeKey);
        traceNodes.add(child);
        walkDown(child);
      }
    }
  };

  const walkUp = (id: string) => {
    for (const parent of (upstream[id] || [])) {
      const edgeKey = `${parent}->${id}`;
      if (!traceEdges.has(edgeKey)) {
        traceEdges.add(edgeKey);
        traceNodes.add(parent);
        walkUp(parent);
      }
    }
  };

  walkDown(selectedId);
  walkUp(selectedId);

  return { nodes: traceNodes, edges: traceEdges };
}

function BezierEdge({ from, to, highlighted, faded }: {
  from: RiskNode;
  to: RiskNode;
  highlighted: boolean;
  faded: boolean;
}) {
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

  const cp1x = sx + dx * 0.3 + (-ny * 0.35 * dist * 0.3) * 0.3;
  const cp1y = sy + dy * 0.1;
  const cp2x = ex - dx * 0.3 + (-ny * 0.35 * dist * 0.3) * 0.3;
  const cp2y = ey - dy * 0.1;

  const stroke = highlighted ? "#266C92" : "#94a3b8";
  const strokeW = highlighted ? 2.5 : 1.5;
  const opacity = faded ? 0.15 : highlighted ? 0.8 : 0.5;
  const markerId = highlighted ? "url(#arrowhead-active)" : "url(#arrowhead)";

  return (
    <path
      d={`M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeW}
      opacity={opacity}
      markerEnd={markerId}
      style={{ transition: "all 0.3s ease" }}
    />
  );
}

function CircleNode({ node, isHovered, isSelected, highlighted, faded, onHover, onLeave, onClick }: {
  node: RiskNode;
  isHovered: boolean;
  isSelected: boolean;
  highlighted: boolean;
  faded: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const r = getNodeRadius(node.size);
  const cx = node.x;
  const cy = node.y;
  const lines = node.label.split("\n");
  const fontSize = node.size === "xl" ? 11 : node.size === "lg" ? 10.5 : 9.5;
  const lineHeight = fontSize * 1.3;
  const totalHeight = lines.length * lineHeight;
  const startY = cy - totalHeight / 2 + lineHeight / 2;

  const normalFill = node.color === "teal" ? "#266C92" : "#1e293b";
  const activeFill = "#b91c1c";
  const selectedFill = isSelected ? "#991b1b" : highlighted ? activeFill : normalFill;
  const hoverFill = isHovered && !highlighted ? (node.color === "teal" ? "#1d5a7a" : "#0f172a") : selectedFill;
  const fillColor = isHovered ? hoverFill : selectedFill;
  const nodeOpacity = faded ? 0.2 : 1;

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ cursor: "pointer", opacity: nodeOpacity, transition: "opacity 0.3s ease" }}
      data-testid={`risk-node-${node.id}`}
    >
      {(isHovered || isSelected) && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 6}
          fill="none"
          stroke={highlighted || isSelected ? "#b91c1c" : "#266C92"}
          strokeWidth="1.5"
          opacity="0.3"
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fillColor}
        style={{ transition: "fill 0.2s ease" }}
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
          <p className="text-sm font-medium text-foreground">Risk Score Details</p>
          <Badge
            variant="destructive"
            className="text-[10px] rounded-full no-default-hover-elevate no-default-active-elevate"
          >
            CRITICAL
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs text-muted-foreground">Overall Risk Score</p>
          <p className="text-3xl font-bold text-foreground">92</p>
        </div>
        <div className="w-full h-2 rounded-full bg-muted mt-1 mb-4">
          <div
            className="h-2 rounded-full"
            style={{ width: "92%", backgroundColor: "#dc2626" }}
          />
        </div>
      </div>
      <div className="border-t border-border px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Cost Impact</p>
          <p className="text-xs font-semibold text-foreground">$10M</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Geopolitical Weight</p>
          <p className="text-xs font-semibold text-foreground">0.82</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Exposure Level</p>
          <p className="text-xs font-semibold text-foreground">High</p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-2.5">
        <p className="text-[10px] text-muted-foreground italic">
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
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#266C92" }} />
          <p className="text-sm font-medium text-foreground">Global Risk Calculation Formula</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Editable</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
      <div className="p-4">
        <Textarea
          ref={textareaRef}
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full font-mono text-[12px] leading-[1.7] text-foreground bg-muted/50 rounded-md border border-border focus:border-[#266C92] focus:ring-1 focus:ring-[#266C92]/20 resize-none min-h-[200px]"
          spellCheck={false}
          data-testid="formula-textarea"
        />
      </div>
    </Card>
  );
}

export default function RiskCalculationPage() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const nodeMap = NODES.reduce((acc, n) => ({ ...acc, [n.id]: n }), {} as Record<string, RiskNode>);

  const trace = useMemo(() => {
    if (!selectedNode) return null;
    return computeTrace(selectedNode);
  }, [selectedNode]);

  const handleNodeHover = useCallback((id: string) => setHoveredNode(id), []);
  const handleNodeLeave = useCallback(() => setHoveredNode(null), []);
  const handleNodeClick = useCallback((id: string) => {
    setSelectedNode(prev => prev === id ? null : id);
  }, []);

  const selectedLabel = selectedNode
    ? NODES.find(n => n.id === selectedNode)?.label.replace(/\n/g, " ") || ""
    : "";

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-var(--browser-chrome-height,0px))]">
        <div className="flex items-center justify-between gap-2 px-6 pt-5 pb-3 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground">Risk Calculation Analysis</h1>
            {selectedNode && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                <span>Trace:</span>
                <span className="font-medium text-foreground">{selectedLabel}</span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="ml-1 hover:text-foreground transition-colors"
                  data-testid="button-clear-trace"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
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
              style={{ height: "calc((100vh - var(--browser-chrome-height, 0px)) * 0.55)", minHeight: 320 }}
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
                  <marker
                    id="arrowhead-active"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#266C92" opacity="0.8" />
                  </marker>
                </defs>
                {EDGES.map((edge, i) => {
                  const from = nodeMap[edge.from];
                  const to = nodeMap[edge.to];
                  if (!from || !to) return null;
                  const edgeKey = `${edge.from}->${edge.to}`;
                  const isHighlighted = trace ? trace.edges.has(edgeKey) : false;
                  const isFaded = trace ? !trace.edges.has(edgeKey) : false;
                  return (
                    <BezierEdge
                      key={i}
                      from={from}
                      to={to}
                      highlighted={isHighlighted}
                      faded={isFaded}
                    />
                  );
                })}
                {NODES.map((node) => {
                  const isHighlighted = trace ? trace.nodes.has(node.id) : false;
                  const isFaded = trace ? !trace.nodes.has(node.id) : false;
                  return (
                    <CircleNode
                      key={node.id}
                      node={node}
                      isHovered={hoveredNode === node.id}
                      isSelected={selectedNode === node.id}
                      highlighted={isHighlighted}
                      faded={isFaded}
                      onHover={() => handleNodeHover(node.id)}
                      onLeave={handleNodeLeave}
                      onClick={() => handleNodeClick(node.id)}
                    />
                  );
                })}
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
