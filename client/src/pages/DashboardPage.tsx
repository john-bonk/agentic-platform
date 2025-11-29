/**
 * Business Continuity Dashboard
 * 
 * Complete dashboard matching the Figma design with:
 * - Filter bar with dropdowns
 * - Metric cards
 * - Charts (RTO, Risk Trend, Plan Effectiveness)
 * - Business Processes Overview table
 */

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  RefreshCw,
  MoreHorizontal,
  ArrowUpDown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { useLocation } from "wouter";
import { useTabStore } from "@/lib/tabStore";

const rtoData = [
  { name: "Retail Ban...", q1: 60, q2: 45, q3: 70, q4: 50 },
  { name: "Human Reso...", q1: 40, q2: 35, q3: 55, q4: 40 },
  { name: "Treasury &...", q1: 30, q2: 25, q3: 40, q4: 30 },
  { name: "IT Operati...", q1: 20, q2: 15, q3: 25, q4: 20 },
];

const riskTrendData = [
  { month: "Jan", low: 20, medium: 45, high: 70 },
  { month: "Feb", low: 25, medium: 50, high: 65 },
  { month: "Mar", low: 22, medium: 55, high: 60 },
  { month: "Apr", low: 28, medium: 48, high: 55 },
  { month: "May", low: 30, medium: 52, high: 50 },
  { month: "Jun", low: 25, medium: 50, high: 45 },
  { month: "Jul", low: 28, medium: 48, high: 40 },
  { month: "Aug", low: 32, medium: 45, high: 38 },
  { month: "Sep", low: 30, medium: 42, high: 35 },
  { month: "Oct", low: 28, medium: 40, high: 32 },
  { month: "Nov", low: 25, medium: 38, high: 30 },
  { month: "Dec", low: 22, medium: 35, high: 28 },
];

const planEffectivenessData = [
  { name: "Effective", value: 61, color: "#22c55e" },
  { name: "Ineffective", value: 24, color: "#ef4444" },
  { name: "Untested", value: 15, color: "#94a3b8" },
];

const businessProcesses = [
  { 
    id: "1",
    name: "Account Management", 
    businessUnit: "Retail Banking Operations", 
    criticality: "High",
    bcpStatus: "Not Started",
    rto: "1 hour",
    owner: "Baylor Cruz"
  },
  { 
    id: "2",
    name: "Loan Origination and Servicing", 
    businessUnit: "Retail Banking Operations", 
    criticality: "Low",
    bcpStatus: "Not Started",
    rto: "30 mins",
    owner: "Baylor Cruz"
  },
  { 
    id: "3",
    name: "Customer Service and Support", 
    businessUnit: "Retail Banking Operations", 
    criticality: "Low",
    bcpStatus: "Not Started",
    rto: "24 hours",
    owner: "Baylor Cruz"
  },
  { 
    id: "4",
    name: "Employee Onboarding and Offboarding", 
    businessUnit: "Human Resources", 
    criticality: "Low",
    bcpStatus: "Not Started",
    rto: "1 hour",
    owner: "Dante Bradford"
  },
  { 
    id: "5",
    name: "Payroll Processing", 
    businessUnit: "Human Resources", 
    criticality: "High",
    bcpStatus: "Not Started",
    rto: "4 hours",
    owner: "Dante Bradford"
  },
];

export function DashboardPage() {
  const [businessUnit, setBusinessUnit] = useState("all");
  const [criticality, setCriticality] = useState("all");
  const [bcpStatus, setBcpStatus] = useState("all");
  const [, setLocation] = useLocation();
  const { openTab } = useTabStore();

  const clearFilters = () => {
    setBusinessUnit("all");
    setCriticality("all");
    setBcpStatus("all");
  };

  const filteredProcesses = businessProcesses.filter(process => {
    const matchesBusinessUnit = businessUnit === "all" || 
      (businessUnit === "retail" && process.businessUnit === "Retail Banking Operations") ||
      (businessUnit === "hr" && process.businessUnit === "Human Resources");
    const matchesCriticality = criticality === "all" || 
      process.criticality.toLowerCase() === criticality;
    const matchesBcpStatus = bcpStatus === "all" || 
      (bcpStatus === "not-started" && process.bcpStatus === "Not Started") ||
      (bcpStatus === "in-progress" && process.bcpStatus === "In Progress") ||
      (bcpStatus === "complete" && process.bcpStatus === "Complete");
    return matchesBusinessUnit && matchesCriticality && matchesBcpStatus;
  });

  const totalActivePlans = filteredProcesses.length > 0 ? filteredProcesses.length : businessProcesses.length;
  const highCriticalityCount = filteredProcesses.filter(p => p.criticality === "High").length;

  const handleProcessClick = (process: typeof businessProcesses[0]) => {
    const tab = {
      id: `process-${process.id}`,
      name: process.name,
      path: `/items/${process.id}`,
    };
    openTab(tab);
    setLocation(`/items/${process.id}`);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900" data-testid="text-dashboard-title">Dashboard Template</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-more"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Business Unit</span>
            <Select value={businessUnit} onValueChange={setBusinessUnit}>
              <SelectTrigger 
                className="w-[200px] h-9 text-sm bg-white"
                data-testid="select-business-unit"
              >
                <SelectValue placeholder="All Business Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Business Units</SelectItem>
                <SelectItem value="retail">Retail Banking Operations</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="treasury">Treasury</SelectItem>
                <SelectItem value="it">IT Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Criticality</span>
            <Select value={criticality} onValueChange={setCriticality}>
              <SelectTrigger 
                className="w-[200px] h-9 text-sm bg-white"
                data-testid="select-criticality"
              >
                <SelectValue placeholder="All Criticalities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Criticalities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">BCP Status</span>
            <Select value={bcpStatus} onValueChange={setBcpStatus}>
              <SelectTrigger 
                className="w-[200px] h-9 text-sm bg-white"
                data-testid="select-bcp-status"
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end h-full ml-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="text-gray-600"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-6 space-y-6 bg-[#f9fafb]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white py-4 text-center border border-gray-200 rounded">
              <div className="text-2xl font-semibold text-gray-900" data-testid="metric-total-plans">{filteredProcesses.length}</div>
              <div className="text-sm text-gray-500 mt-1">Total Active Plans</div>
            </div>
            <div className="bg-white py-4 text-center border border-gray-200 rounded">
              <div className="text-2xl font-semibold text-gray-900" data-testid="metric-compliance">92%</div>
              <div className="text-sm text-gray-500 mt-1">Exercise Compliance</div>
            </div>
            <div className="bg-white py-4 text-center border border-gray-200 rounded">
              <div className="text-2xl font-semibold text-gray-900" data-testid="metric-findings">8</div>
              <div className="text-sm text-gray-500 mt-1">Open Findings</div>
            </div>
            <div className="bg-white py-4 text-center border border-gray-200 rounded">
              <div className="text-2xl font-semibold text-gray-900" data-testid="metric-incidents">1</div>
              <div className="text-sm text-gray-500 mt-1">Vendor Incidents</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded bg-white">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-medium text-gray-700">RTO by Business Unit</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rtoData} layout="vertical" barGap={1} barSize={12}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => v} fontSize={10} />
                      <YAxis type="category" dataKey="name" width={80} fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="q1" fill="#3b82f6" name="Q1" />
                      <Bar dataKey="q2" fill="#1d4ed8" name="Q2" />
                      <Bar dataKey="q3" fill="#60a5fa" name="Q3" />
                      <Bar dataKey="q4" fill="#93c5fd" name="Q4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Q1</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-700" />
                    <span>Q2</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <span>Q3</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-300" />
                    <span>Q4</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded bg-white">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-medium text-gray-700">Risk Trend</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={10} />
                      <YAxis domain={[0, 100]} fontSize={10} />
                      <Tooltip />
                      <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={false} name="Low" />
                      <Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={2} dot={false} name="Medium" />
                      <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={false} name="High" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded bg-white">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-medium text-gray-700">Plan Effectiveness</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planEffectivenessData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {planEffectivenessData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">61%</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-400" />
                    <span>Untested</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-red-500" />
                    <span>Ineffective</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                    <span>Effective</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded bg-white">
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium text-gray-700">Business Processes Overview</h3>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">{filteredProcesses.length} processes</span>
                  <span className="mx-2">|</span>
                  <span>{highCriticalityCount} high criticality</span>
                </div>
              </div>
            </div>
            <div className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Name
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">Business Unit</TableHead>
                    <TableHead className="font-medium text-gray-600">Criticality</TableHead>
                    <TableHead className="font-medium text-gray-600">BCP Status</TableHead>
                    <TableHead className="font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        RTO
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-gray-600">Process Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcesses.map((process) => (
                    <TableRow 
                      key={process.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      data-testid={`row-process-${process.id}`}
                    >
                      <TableCell>
                        <button
                          onClick={() => handleProcessClick(process)}
                          className="text-blue-600 hover:underline text-left font-medium"
                          data-testid={`link-process-${process.id}`}
                        >
                          {process.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-gray-600">{process.businessUnit}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            process.criticality === "High" 
                              ? "text-red-600 border-red-200 bg-red-50" 
                              : "text-blue-600 border-blue-200 bg-blue-50"
                          }`}
                        >
                          {process.criticality}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="text-xs text-gray-600 border-gray-300 bg-gray-100"
                        >
                          {process.bcpStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{process.rto}</TableCell>
                      <TableCell className="text-gray-600">{process.owner}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
