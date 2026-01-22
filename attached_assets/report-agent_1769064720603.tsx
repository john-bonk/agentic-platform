import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Sparkles,
  Search,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  Loader2,
  ChevronUp,
  Wand2,
  Check,
} from "lucide-react";
import type { Control, DashboardMetrics, ReportSection, User } from "@shared/schema";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: {
    type: "add_section" | "edit_section" | "remove_section" | "search_result";
    data?: any;
  };
  timestamp: Date;
}

interface ChartSpec {
  type: "bar" | "pie" | "line";
  data: number[];
  labels?: string[];
  title?: string;
  position?: "above" | "below" | "inline";
}

interface ReportAgentProps {
  sections: ReportSection[];
  onAddSection: (section: Omit<ReportSection, "id">) => void;
  onEditSection: (sectionId: string, content: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onAddChart: (sectionId: string, chartSpec: ChartSpec) => void;
  onRemoveChart: (sectionId: string, chartIndex: number) => void;
}

const quickActions = [
  { icon: Search, label: "Search controls", prompt: "Search for high risk controls" },
  { icon: Plus, label: "Add summary", prompt: "Create an executive summary" },
  { icon: BarChart3, label: "Add insights", prompt: "Generate insights about the audit" },
  { icon: Edit3, label: "Show sections", prompt: "Show all sections" },
];

const suggestionPrompts = [
  "Add a summary of high-risk controls",
  "Search for controls with failed tests",
  "Create an executive summary section",
  "Add metrics about pending reviews",
  "Search for users in audit team",
];

export function ReportAgent({ sections, onAddSection, onEditSection, onRemoveSection, onAddChart, onRemoveChart }: ReportAgentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingEditSection, setPendingEditSection] = useState<ReportSection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: controls } = useQuery<Control[]>({
    queryKey: ["/api/controls"],
  });

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const processQuery = async (userQuery: string): Promise<{ content: string; action?: Message["action"] }> => {
    const lowerQuery = userQuery.toLowerCase();
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));

    // Handle pending edit - apply changes to the section
    if (pendingEditSection) {
      const sectionToEdit = pendingEditSection;
      setPendingEditSection(null);
      
      // Determine the type of edit
      if (lowerQuery.includes("add") || lowerQuery.includes("append") || lowerQuery.includes("include")) {
        const newContent = sectionToEdit.content + "\n\n" + userQuery.replace(/add|append|include|:|\./gi, "").trim();
        onEditSection(sectionToEdit.id, newContent);
        return {
          content: `I've added your content to the "${sectionToEdit.title}" section.`,
          action: { type: "edit_section", data: { ...sectionToEdit, content: newContent } }
        };
      } else if (lowerQuery.includes("replace") || lowerQuery.includes("change to") || lowerQuery.includes("update to")) {
        const newContent = userQuery.replace(/replace|change to|update to|with|:|\./gi, "").trim();
        onEditSection(sectionToEdit.id, newContent);
        return {
          content: `I've replaced the content in "${sectionToEdit.title}" with your new text.`,
          action: { type: "edit_section", data: { ...sectionToEdit, content: newContent } }
        };
      } else if (lowerQuery.includes("remove") || lowerQuery.includes("delete")) {
        const termToRemove = userQuery.replace(/remove|delete|the|text|word|:|\./gi, "").trim();
        const newContent = sectionToEdit.content.replace(new RegExp(termToRemove, "gi"), "");
        onEditSection(sectionToEdit.id, newContent);
        return {
          content: `I've removed "${termToRemove}" from the "${sectionToEdit.title}" section.`,
          action: { type: "edit_section", data: { ...sectionToEdit, content: newContent } }
        };
      } else {
        // Default: append the content
        const newContent = sectionToEdit.content + "\n\n" + userQuery;
        onEditSection(sectionToEdit.id, newContent);
        return {
          content: `I've added your content to "${sectionToEdit.title}".`,
          action: { type: "edit_section", data: { ...sectionToEdit, content: newContent } }
        };
      }
    }

    // Search for users
    if (lowerQuery.includes("search") && (lowerQuery.includes("user") || lowerQuery.includes("team") || lowerQuery.includes("owner"))) {
      const searchTerm = lowerQuery.replace(/search|for|users?|team|members?|owners?|related|to|in|the/gi, "").trim();
      
      // Get unique owners from controls as users
      const controlOwners = Array.from(new Set(controls?.map(c => c.owner) || []));
      const matchingUsers = users?.filter(u => 
        u.name.toLowerCase().includes(searchTerm) ||
        u.role.toLowerCase().includes(searchTerm)
      ).slice(0, 5) || [];

      if (matchingUsers.length > 0) {
        return {
          content: `Found ${matchingUsers.length} user(s) matching your search:\n\n${matchingUsers.map(u => 
            `- **${u.name}**: ${u.role}`
          ).join("\n")}\n\nWould you like me to add a section about these team members?`,
          action: { type: "search_result", data: matchingUsers }
        };
      } else if (controlOwners.length > 0) {
        return {
          content: `Found ${controlOwners.length} control owners:\n\n${controlOwners.slice(0, 5).map(o => `- **${o}**`).join("\n")}\n\nThese are the team members assigned to various controls.`,
          action: { type: "search_result", data: controlOwners }
        };
      } else {
        return {
          content: `No users found matching "${searchTerm}". Try searching for "audit team" or a specific name.`,
        };
      }
    }

    // Search for metrics
    if (lowerQuery.includes("search") && (lowerQuery.includes("metric") || lowerQuery.includes("stat") || lowerQuery.includes("number"))) {
      const passRate = metrics && metrics.totalControls > 0 
        ? Math.round((metrics.passedControls / metrics.totalControls) * 100) 
        : 0;
        
      return {
        content: `Here are the current audit metrics:\n\n- **Total Controls**: ${metrics?.totalControls || 0}\n- **Pass Rate**: ${passRate}%\n- **Passed**: ${metrics?.passedControls || 0}\n- **Failed**: ${metrics?.failedControls || 0}\n- **Pending Review**: ${metrics?.pendingReview || 0}\n- **Active Audits**: ${metrics?.activeAudits || 0}\n- **Overdue Tests**: ${metrics?.overdueTests || 0}\n- **Total Findings**: ${metrics?.findingsTotal || 0}\n\nWould you like me to add these to the report?`,
        action: { type: "search_result", data: metrics }
      };
    }

    // Search for controls
    if (lowerQuery.includes("search") || (lowerQuery.includes("find") && lowerQuery.includes("control"))) {
      const searchTerm = lowerQuery.replace(/search|find|for|controls?|related|to|with/gi, "").trim();
      const matchingControls = controls?.filter(c => 
        c.name.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm) ||
        c.controlId.toLowerCase().includes(searchTerm) ||
        c.riskRating.toLowerCase().includes(searchTerm) ||
        c.testStatus.toLowerCase().includes(searchTerm)
      ).slice(0, 5) || [];

      if (matchingControls.length > 0) {
        return {
          content: `Found ${matchingControls.length} control(s) matching your search:\n\n${matchingControls.map(c => 
            `- **${c.controlId}**: ${c.name} (${c.riskRating} risk, ${c.testStatus})`
          ).join("\n")}\n\nWould you like me to add any of these to the report?`,
          action: { type: "search_result", data: matchingControls }
        };
      } else {
        return {
          content: `No controls found matching "${searchTerm}". Try searching for terms like "high risk", "failed", "revenue", or specific control IDs.`,
        };
      }
    }

    // Helper function to find section by number or name - DEFINE FIRST before any handlers
    const findSectionFromQuery = (query: string): ReportSection | undefined => {
      const lower = query.toLowerCase();
      
      // Try multiple patterns for section numbers: "section 1", "section 01", "sec 1", "#1", "to section 1"
      const sectionPatterns = [
        /(?:to\s+|in\s+)?section\s*#?(\d+)/i,   // "section 1", "to section 1", "in section 1", "section #1"
        /(?:to\s+|in\s+)?sec\s*#?(\d+)/i,       // "sec 1", "to sec 1"
        /#(\d+)\b/i,                             // "#1"
        /\bsection\s+(\d+)\b/i,                  // "section 1" with word boundaries
        /\b(\d+)(?:st|nd|rd|th)?\s+section/i,    // "1st section", "2nd section"
      ];
      
      for (const pattern of sectionPatterns) {
        const match = lower.match(pattern);
        if (match) {
          // Extract digits and parse - handle leading zeros like "01"
          const numStr = match[1].replace(/^0+/, '') || '0';
          const num = parseInt(numStr, 10) || parseInt(match[1], 10);
          if (num >= 1 && num <= sections.length) {
            return sections[num - 1];
          }
        }
      }
      
      // Try to find by name - check if query contains section title or keywords
      const sectionByName = sections.find(s => {
        const titleLower = s.title.toLowerCase();
        // Check for exact title match
        if (lower.includes(titleLower)) return true;
        // Check for key unique words from title (executive, summary, insights, news, etc.)
        const keyWords = ["executive", "summary", "insights", "key", "news", "industry", "analysis"];
        const titleWords = titleLower.split(/\s+/).filter(w => keyWords.includes(w));
        return titleWords.some(word => lower.includes(word));
      });
      
      if (sectionByName) return sectionByName;
      
      // If user mentioned position like "first", default to first section
      if (sections.length > 0 && (lower.includes("first section") || lower.includes("1st section"))) {
        return sections[0];
      }
      
      // If user says "last section"
      if (sections.length > 0 && lower.includes("last section")) {
        return sections[sections.length - 1];
      }
      
      return undefined;
    };

    // Show all sections - be VERY specific to avoid matching "showing"
    if ((lowerQuery.startsWith("show section") || lowerQuery.startsWith("show all section") || 
         lowerQuery.startsWith("list section") || lowerQuery === "show sections" || 
         lowerQuery === "list sections" || lowerQuery.startsWith("what section")) && 
        !lowerQuery.includes("chart") && !lowerQuery.includes("graph")) {
      return {
        content: `Your report has ${sections.length} section(s):\n\n${sections.map((s, i) => `${i + 1}. **${s.title}** (${s.charts?.length || 0} chart${(s.charts?.length || 0) !== 1 ? 's' : ''})`).join("\n")}\n\nYou can say "edit section 1" or "add chart to section 2" to modify them.`,
      };
    }

    // Create/Add chart to a section (also handles "edit section X, add visualization")
    if ((lowerQuery.includes("chart") || lowerQuery.includes("graph") || lowerQuery.includes("visualization") || lowerQuery.includes("visualize")) &&
        (lowerQuery.includes("create") || lowerQuery.includes("add") || lowerQuery.includes("insert") || lowerQuery.includes("show") || lowerQuery.includes("want") || lowerQuery.includes("edit"))) {
      
      // Find the target section using helper
      let targetSection = findSectionFromQuery(lowerQuery);
      
      // Check if this is the news section (not allowed)
      if (targetSection && (targetSection.title.toLowerCase().includes("news") || targetSection.title.toLowerCase().includes("industry"))) {
        return {
          content: `I can't add charts to the Industry News section as it displays news cards instead. Please choose a different section.`,
        };
      }
      
      if (!targetSection) {
        if (sections.length === 0) {
          return {
            content: `There are no sections in your report yet. Please generate a report first, then I can add charts to the sections.`,
          };
        }
        return {
          content: `I found ${sections.length} section(s) in your report:\n\n${sections.map((s, i) => `${i + 1}. ${s.title}${s.title.toLowerCase().includes("news") ? " (no charts)" : ""}`).join("\n")}\n\nWhich section would you like me to add the chart to? You can say "add chart to section 1" or use the section name.`,
        };
      }
      
      // Parse time range from query (e.g., "last 7 days", "past 30 days", "last week")
      const timeRangeMatch = lowerQuery.match(/(?:last|past)\s*(\d+)\s*(day|week|month)s?/i);
      let timeRange = 7; // default 7 days
      let timeUnit = "days";
      if (timeRangeMatch) {
        timeRange = parseInt(timeRangeMatch[1], 10);
        timeUnit = timeRangeMatch[2].toLowerCase() + (timeRange > 1 ? "s" : "");
      } else if (lowerQuery.includes("week")) {
        timeRange = 7;
        timeUnit = "days";
      } else if (lowerQuery.includes("month")) {
        timeRange = 30;
        timeUnit = "days";
      }
      
      // Parse chart position from query
      let chartPosition: "above" | "below" | "inline" = "inline";
      if (lowerQuery.includes("above") || lowerQuery.includes("before") || lowerQuery.includes("top")) {
        chartPosition = "above";
      } else if (lowerQuery.includes("below") || lowerQuery.includes("after") || lowerQuery.includes("bottom")) {
        chartPosition = "below";
      }
      
      // Determine chart type - more sophisticated detection
      let chartType: "bar" | "pie" | "line" = "bar";
      if (lowerQuery.includes("pie") || lowerQuery.includes("donut") || lowerQuery.includes("breakdown") || lowerQuery.includes("distribution")) {
        chartType = "pie";
      } else if (lowerQuery.includes("line") || lowerQuery.includes("trend") || lowerQuery.includes("over time") || 
                 lowerQuery.includes("timeline") || lowerQuery.includes("gantt") || lowerQuery.includes("progress") ||
                 lowerQuery.includes("completion") || lowerQuery.includes("burn") || lowerQuery.includes("last") ||
                 lowerQuery.includes("past") || lowerQuery.includes("days") || lowerQuery.includes("week")) {
        chartType = "line";
      }
      
      // Generate meaningful chart data based on detailed context parsing
      let chartData: number[] = [];
      let chartLabels: string[] = [];
      let chartTitle = "";
      let chartDescription = "";
      
      // Parse what data the user wants to show
      const showsMatch = lowerQuery.match(/(?:show(?:s|ing)?|display(?:s|ing)?|that shows?)\s+(?:my\s+)?(.+?)(?:\s+(?:over|for|in|during)|\s*$)/i);
      const dataDescription = showsMatch ? showsMatch[1].trim() : "";
      
      // Gantt/Timeline/Work completion data
      if (lowerQuery.includes("gantt") || lowerQuery.includes("timeline") || lowerQuery.includes("work completion") || 
          lowerQuery.includes("task completion") || lowerQuery.includes("work progress")) {
        chartType = "line";
        // Generate realistic work completion data over the time range
        const baseCompletion = 15;
        const dailyProgress = 12;
        chartData = [];
        chartLabels = [];
        const today = new Date();
        for (let i = timeRange - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          chartLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          // Simulate progressive completion with some variance
          const progress = Math.min(100, baseCompletion + (timeRange - 1 - i) * dailyProgress + Math.floor(Math.random() * 8));
          chartData.push(progress);
        }
        chartTitle = `Work Completion - Last ${timeRange} ${timeUnit}`;
        chartDescription = `work completion timeline over the last ${timeRange} ${timeUnit}`;
      }
      // Control status breakdown
      else if (lowerQuery.includes("control status") || lowerQuery.includes("status breakdown") || 
               (lowerQuery.includes("control") && lowerQuery.includes("status"))) {
        chartType = "pie";
        chartData = [
          metrics?.passedControls || 12,
          metrics?.failedControls || 3,
          metrics?.pendingReview || 6,
          controls?.filter(c => c.testStatus === "In Progress").length || 4
        ];
        chartLabels = ["Passed", "Failed", "Pending Review", "In Progress"];
        chartTitle = "Control Status Breakdown";
        chartDescription = "control status breakdown";
      }
      // Test results/testing progress
      else if (lowerQuery.includes("test result") || lowerQuery.includes("testing") || 
               (lowerQuery.includes("test") && (lowerQuery.includes("status") || lowerQuery.includes("result")))) {
        chartType = "bar";
        chartData = [
          metrics?.passedControls || 12,
          metrics?.failedControls || 3,
          metrics?.pendingReview || 6
        ];
        chartLabels = ["Passed", "Failed", "Pending"];
        chartTitle = "Testing Results";
        chartDescription = "testing results";
      }
      // Risk distribution
      else if (lowerQuery.includes("risk") || lowerQuery.includes("risk distribution") || lowerQuery.includes("risk breakdown")) {
        chartType = "pie";
        const highRisk = controls?.filter(c => c.riskRating === "High").length || 5;
        const medRisk = controls?.filter(c => c.riskRating === "Medium").length || 12;
        const lowRisk = controls?.filter(c => c.riskRating === "Low").length || 8;
        chartData = [highRisk, medRisk, lowRisk];
        chartLabels = ["High Risk", "Medium Risk", "Low Risk"];
        chartTitle = "Risk Distribution";
        chartDescription = "risk distribution across controls";
      }
      // Audit phase distribution
      else if (lowerQuery.includes("audit phase") || lowerQuery.includes("phase distribution") ||
               (lowerQuery.includes("audit") && lowerQuery.includes("phase"))) {
        chartType = "bar";
        chartData = [3, 5, 2, 1, 2];
        chartLabels = ["Planning", "Fieldwork", "Reporting", "Follow-up", "Closed"];
        chartTitle = "Audit Phase Distribution";
        chartDescription = "audit phase distribution";
      }
      // Workload/burn-down
      else if (lowerQuery.includes("workload") || lowerQuery.includes("burn") || lowerQuery.includes("burndown")) {
        chartType = "line";
        chartData = [];
        chartLabels = [];
        const today = new Date();
        let remaining = 100;
        for (let i = timeRange - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          chartLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          remaining = Math.max(5, remaining - (8 + Math.floor(Math.random() * 6)));
          chartData.push(remaining);
        }
        chartTitle = `Workload Burndown - Last ${timeRange} ${timeUnit}`;
        chartDescription = `workload burndown over the last ${timeRange} ${timeUnit}`;
      }
      // Tasks by type
      else if (lowerQuery.includes("task") && (lowerQuery.includes("type") || lowerQuery.includes("category"))) {
        chartType = "bar";
        chartData = [8, 12, 5, 3, 6];
        chartLabels = ["Review", "Test", "Evidence", "Walkthrough", "Remediation"];
        chartTitle = "Tasks by Type";
        chartDescription = "tasks broken down by type";
      }
      // Completion/progress over time
      else if (lowerQuery.includes("completion") || lowerQuery.includes("progress")) {
        chartType = "line";
        chartData = [];
        chartLabels = [];
        const today = new Date();
        for (let i = timeRange - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          chartLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          const progress = Math.min(100, 20 + (timeRange - 1 - i) * 10 + Math.floor(Math.random() * 5));
          chartData.push(progress);
        }
        chartTitle = `Completion Progress - Last ${timeRange} ${timeUnit}`;
        chartDescription = `completion progress over the last ${timeRange} ${timeUnit}`;
      }
      // Findings by severity
      else if (lowerQuery.includes("finding") || lowerQuery.includes("issue") || lowerQuery.includes("deficiency")) {
        chartType = "bar";
        chartData = [2, 5, 8, 3];
        chartLabels = ["Critical", "High", "Medium", "Low"];
        chartTitle = "Findings by Severity";
        chartDescription = "findings broken down by severity";
      }
      // Evidence status
      else if (lowerQuery.includes("evidence")) {
        chartType = "pie";
        chartData = [15, 8, 4, 3];
        chartLabels = ["Uploaded", "Pending", "Under Review", "Missing"];
        chartTitle = "Evidence Status";
        chartDescription = "evidence documentation status";
      }
      // Generic timeline data
      else if (lowerQuery.includes("timeline") || lowerQuery.includes("over time") || 
               lowerQuery.includes("last") || lowerQuery.includes("past")) {
        chartType = "line";
        chartData = [];
        chartLabels = [];
        const today = new Date();
        for (let i = timeRange - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          chartLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          chartData.push(Math.floor(Math.random() * 40) + 30);
        }
        chartTitle = `Activity Timeline - Last ${timeRange} ${timeUnit}`;
        chartDescription = `activity timeline over the last ${timeRange} ${timeUnit}`;
      }
      // Default - comprehensive metrics
      else {
        chartType = "bar";
        chartData = [
          metrics?.passedControls || 10,
          metrics?.failedControls || 4,
          metrics?.pendingReview || 6,
          metrics?.overdueTests || 2
        ];
        chartLabels = ["Passed", "Failed", "Pending", "Overdue"];
        chartTitle = "Audit Metrics Overview";
        chartDescription = "overall audit metrics";
      }
      
      // Create the enhanced chart spec
      const newChartSpec: ChartSpec = {
        type: chartType,
        data: chartData,
        labels: chartLabels.length > 0 ? chartLabels : undefined,
        title: chartTitle || undefined,
        position: chartPosition
      };
      
      // Add the chart to the section (appends to existing charts)
      onAddChart(targetSection.id, newChartSpec);
      
      const existingChartCount = targetSection.charts?.length || 0;
      const positionText = chartPosition !== "inline" ? ` (positioned ${chartPosition} the content)` : "";
      const chartNumber = existingChartCount + 1;
      
      return {
        content: `I've added chart #${chartNumber} (${chartType}) showing ${chartDescription} to "${targetSection.title}"${positionText}. This section now has ${chartNumber} chart(s). You can ask me to add more charts, or remove a specific chart by saying "remove chart 1 from section X".`,
        action: { type: "edit_section", data: { ...targetSection, charts: [...(targetSection.charts || []), newChartSpec] } }
      };
    }

    // Remove chart from section
    if ((lowerQuery.includes("remove") || lowerQuery.includes("delete")) && 
        (lowerQuery.includes("chart") || lowerQuery.includes("graph") || lowerQuery.includes("visualization"))) {
      
      const sectionMatch = findSectionFromQuery(lowerQuery);
      const chartNumberMatch = lowerQuery.match(/chart\s*#?(\d+)/i) || lowerQuery.match(/#(\d+)\s*chart/i);
      const chartIndex = chartNumberMatch ? parseInt(chartNumberMatch[1], 10) - 1 : 0;
      
      let targetSection: ReportSection | undefined;
      
      if (sectionMatch) {
        targetSection = sectionMatch;
      } else {
        // Find first section with charts
        targetSection = sections.find(s => (s.charts?.length || 0) > 0);
      }
      
      if (targetSection && (targetSection.charts?.length || 0) > 0) {
        const charts = targetSection.charts || [];
        if (chartIndex >= 0 && chartIndex < charts.length) {
          onRemoveChart(targetSection.id, chartIndex);
          return {
            content: `I've removed chart #${chartIndex + 1} from the "${targetSection.title}" section. ${charts.length - 1} chart(s) remaining.`,
            action: { type: "edit_section", data: { ...targetSection, charts: charts.filter((_, i) => i !== chartIndex) } }
          };
        } else {
          return {
            content: `Chart #${chartIndex + 1} doesn't exist in "${targetSection.title}". This section has ${charts.length} chart(s). Try "remove chart 1 from section X".`,
          };
        }
      } else {
        return {
          content: `I couldn't find any charts to remove. Specify which section, e.g., "remove chart from section 2".`,
        };
      }
    }

    // Remove section or content within section - check EARLY
    if (lowerQuery.includes("remove") || lowerQuery.includes("delete")) {
      // Check if this is a partial content removal request (not entire section)
      const isPartialRemoval = 
        lowerQuery.includes("snippet") || 
        lowerQuery.includes("item") || 
        lowerQuery.includes("line") || 
        lowerQuery.includes("paragraph") ||
        lowerQuery.includes("bullet") ||
        lowerQuery.includes("point") ||
        lowerQuery.includes("news") ||
        lowerQuery.includes("last") ||
        lowerQuery.includes("first") ||
        (lowerQuery.includes("in section") || lowerQuery.includes("from section"));
      
      // Extract section number if mentioned (e.g., "section 4", "section 2")
      const sectionNumberMatch = lowerQuery.match(/section\s*(\d+)/i);
      const sectionNumber = sectionNumberMatch ? parseInt(sectionNumberMatch[1], 10) : null;
      
      // Also check for "last section", "first section"
      const isLastSection = lowerQuery.includes("last section");
      const isFirstSection = lowerQuery.includes("first section");
      
      // Find section by number, position, or name
      let sectionMatch: ReportSection | undefined;
      
      if (sectionNumber && sectionNumber >= 1 && sectionNumber <= sections.length) {
        sectionMatch = sections[sectionNumber - 1];
      } else if (isLastSection && sections.length > 0) {
        sectionMatch = sections[sections.length - 1];
      } else if (isFirstSection && sections.length > 0) {
        sectionMatch = sections[0];
      } else {
        // Try to match by name
        const cleanQuery = lowerQuery.replace(/remove|delete|the|section|please|can you|could you|snippet|item|line|paragraph|bullet|point|news|last|first|in|from|\d+/gi, "").trim();
        sectionMatch = sections.find(s => {
          const titleLower = s.title.toLowerCase();
          return lowerQuery.includes(titleLower) || 
                 titleLower.includes(cleanQuery) ||
                 (cleanQuery.length > 3 && cleanQuery.split(" ").some(word => word.length > 3 && titleLower.includes(word)));
        });
      }
      
      // Handle partial content removal within a section
      if (isPartialRemoval && sectionMatch) {
        const content = sectionMatch.content;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length <= 1) {
          return {
            content: `The section "${sectionMatch.title}" only has one item. Would you like me to remove the entire section instead? Say "remove section ${sections.indexOf(sectionMatch) + 1}" to confirm.`,
          };
        }
        
        // Determine what to remove
        let newContent = content;
        let removedDescription = "";
        
        if (lowerQuery.includes("last")) {
          // Remove last item/line/snippet
          const lastLineIndex = lines.length - 1;
          newContent = lines.slice(0, lastLineIndex).join('\n');
          removedDescription = "the last item";
        } else if (lowerQuery.includes("first")) {
          // Remove first item (but keep headers if they exist)
          const headerLines = lines.filter(l => l.startsWith('**') || l.startsWith('#'));
          const contentLines = lines.filter(l => !l.startsWith('**') && !l.startsWith('#'));
          if (contentLines.length > 0) {
            contentLines.shift();
            newContent = [...headerLines, ...contentLines].join('\n');
            removedDescription = "the first item";
          }
        } else {
          // Generic removal - remove last item by default
          newContent = lines.slice(0, -1).join('\n');
          removedDescription = "the last item";
        }
        
        onEditSection(sectionMatch.id, newContent);
        return {
          content: `I've removed ${removedDescription} from "${sectionMatch.title}".`,
          action: { type: "edit_section", data: { ...sectionMatch, content: newContent } }
        };
      }
      
      // Handle entire section removal
      if (sectionMatch) {
        onRemoveSection(sectionMatch.id);
        return {
          content: `I've removed the "${sectionMatch.title}" section from your report.`,
          action: { type: "remove_section", data: sectionMatch }
        };
      } else {
        return {
          content: `Which section would you like to remove? Here are the available sections:\n\n${sections.map((s, i) => `${i + 1}. ${s.title}`).join("\n")}\n\nYou can say "remove section 1" or "remove [section name]".`,
        };
      }
    }

    // High-risk controls - check BEFORE generic summary
    if (lowerQuery.includes("high") && lowerQuery.includes("risk")) {
      const highRiskControls = controls?.filter(c => c.riskRating === "High").slice(0, 5) || [];
      
      const newSection: Omit<ReportSection, "id"> = {
        title: "High-Risk Controls Summary",
        content: `**High-Risk Controls Requiring Attention:**\n\n${highRiskControls.map(c => 
          `- **${c.controlId}**: ${c.name}\n  Status: ${c.testStatus} | Owner: ${c.owner}`
        ).join("\n\n")}\n\nThese controls have been identified as high priority and require immediate focus from the audit team.`,
        charts: [],
      };
      
      onAddSection(newSection);
      
      return {
        content: `I've added a High-Risk Controls Summary section with ${highRiskControls.length} controls that need attention.`,
        action: { type: "add_section", data: newSection }
      };
    }

    // Failed controls - check BEFORE generic summary
    if (lowerQuery.includes("failed") || lowerQuery.includes("fail")) {
      const failedControls = controls?.filter(c => c.testStatus === "Failed").slice(0, 5) || [];
      
      if (failedControls.length > 0) {
        const newSection: Omit<ReportSection, "id"> = {
          title: "Failed Controls Report",
          content: `**Controls with Failed Tests:**\n\n${failedControls.map(c => 
            `- **${c.controlId}**: ${c.name}\n  Risk: ${c.riskRating} | Owner: ${c.owner}`
          ).join("\n\n")}\n\nThese controls require immediate remediation to address compliance gaps.`,
          charts: [],
        };
        
        onAddSection(newSection);
        
        return {
          content: `I've added a Failed Controls Report section with ${failedControls.length} controls that need remediation.`,
          action: { type: "add_section", data: newSection }
        };
      } else {
        return {
          content: `Great news! There are currently no failed controls in the system.`,
        };
      }
    }

    // Add summary section (generic - after specific checks)
    if (lowerQuery.includes("summary") || lowerQuery.includes("executive")) {
      const passRate = metrics && metrics.totalControls > 0 
        ? Math.round((metrics.passedControls / metrics.totalControls) * 100) 
        : 0;
      
      const newSection: Omit<ReportSection, "id"> = {
        title: "Executive Summary",
        content: `This audit report provides a comprehensive overview of the current compliance status.\n\n**Key Highlights:**\n- Total Controls: ${metrics?.totalControls || 0}\n- Pass Rate: ${passRate}%\n- Controls Passed: ${metrics?.passedControls || 0}\n- Active Audits: ${metrics?.activeAudits || 0}\n- Pending Reviews: ${metrics?.pendingReview || 0}\n\nThe organization demonstrates strong compliance posture with continued focus on remediation activities.`,
        charts: [],
      };
      
      onAddSection(newSection);
      
      return {
        content: `I've added an Executive Summary section to your report with the latest metrics. You can edit or reorder it as needed.`,
        action: { type: "add_section", data: newSection }
      };
    }

    // Add insights section
    if (lowerQuery.includes("insight") || lowerQuery.includes("analysis")) {
      const highRiskCount = controls?.filter(c => c.riskRating === "High").length || 0;
      const failedCount = controls?.filter(c => c.testStatus === "Failed").length || 0;
      
      const newSection: Omit<ReportSection, "id"> = {
        title: "Audit Insights & Analysis",
        content: `Based on the current audit data, here are key insights:\n\n**Risk Distribution:**\n- High-risk controls require immediate attention: ${highRiskCount} identified\n- Controls with failed tests need remediation: ${failedCount} pending\n\n**Recommendations:**\n1. Prioritize remediation of failed high-risk controls\n2. Schedule follow-up testing for pending reviews\n3. Update evidence documentation for upcoming audits\n\n**Trend Analysis:**\nThe current testing cycle shows steady progress with most controls on track for completion.`,
        charts: [{
          type: "bar",
          data: [metrics?.passedControls || 0, metrics?.failedControls || 0, metrics?.pendingReview || 0],
          labels: ["Passed", "Failed", "Pending"],
          title: "Control Status"
        }],
      };
      
      onAddSection(newSection);
      
      return {
        content: `I've created an Insights & Analysis section with recommendations and a chart visualization. This section highlights key areas requiring attention.`,
        action: { type: "add_section", data: newSection }
      };
    }

    // Add metrics section
    if (lowerQuery.includes("metric") || lowerQuery.includes("pending") || lowerQuery.includes("review")) {
      const newSection: Omit<ReportSection, "id"> = {
        title: "Pending Review Status",
        content: `**Current Review Queue:**\n\n- Controls Pending Review: ${metrics?.pendingReview || 0}\n- Overdue Tests: ${metrics?.overdueTests || 0}\n- Remediation In Progress: ${metrics?.remediationInProgress || 0}\n- Total Findings: ${metrics?.findingsTotal || 0}\n\nThese items require attention from the review team to maintain compliance deadlines.`,
        charts: [{
          type: "pie",
          data: [metrics?.pendingReview || 0, metrics?.overdueTests || 0, metrics?.remediationInProgress || 0],
          labels: ["Pending Review", "Overdue", "In Progress"],
          title: "Review Queue Status"
        }],
      };
      
      onAddSection(newSection);
      
      return {
        content: `Added a Pending Review Status section with current queue metrics and a pie chart breakdown.`,
        action: { type: "add_section", data: newSection }
      };
    }

    // Modify/Edit section - handle combined prompts like "Edit section 1. Add text about X"
    if (lowerQuery.includes("modify") || lowerQuery.includes("edit") || lowerQuery.includes("change") || lowerQuery.includes("update")) {
      const sectionMatch = findSectionFromQuery(lowerQuery);
      
      if (sectionMatch) {
        // Check if user already specified what to do (combined prompt)
        const hasAddIntent = lowerQuery.includes("add ") || lowerQuery.includes("append") || lowerQuery.includes("include");
        const hasReplaceIntent = lowerQuery.includes("replace") || lowerQuery.includes("change to") || lowerQuery.includes("update to");
        const hasRemoveIntent = lowerQuery.includes("remove ") || lowerQuery.includes("delete ");
        
        // If user specified an action, perform it directly
        if (hasAddIntent || hasReplaceIntent || hasRemoveIntent) {
          // Extract the content after the action keyword
          let actionContent = "";
          let actionType = "";
          
          if (hasAddIntent) {
            actionType = "added";
            // Extract text after "add", handling various patterns
            const addMatch = userQuery.match(/(?:add|append|include)\s+(?:a\s+)?(?:text|note|content|section|paragraph|line|info|information|details?)?\s*(?:about|for|on|regarding|that|:)?\s*(.+)/i);
            if (addMatch) {
              actionContent = addMatch[1].trim();
            } else {
              // Fallback: take everything after common keywords
              const parts = userQuery.split(/add|append|include/i);
              if (parts[1]) {
                actionContent = parts[1].replace(/^[\s.,:]+/, "").trim();
              }
            }
            
            if (actionContent) {
              const newContent = sectionMatch.content + "\n\n" + actionContent;
              onEditSection(sectionMatch.id, newContent);
              return {
                content: `I've added your content to the "${sectionMatch.title}" section.`,
                action: { type: "edit_section", data: { ...sectionMatch, content: newContent } }
              };
            }
          } else if (hasReplaceIntent) {
            actionType = "replaced";
            const replaceMatch = userQuery.match(/(?:replace|change\s+to|update\s+to)\s*(?:with|:)?\s*(.+)/i);
            if (replaceMatch) {
              actionContent = replaceMatch[1].trim();
              onEditSection(sectionMatch.id, actionContent);
              return {
                content: `I've replaced the content in "${sectionMatch.title}" with your new text.`,
                action: { type: "edit_section", data: { ...sectionMatch, content: actionContent } }
              };
            }
          } else if (hasRemoveIntent) {
            const removeMatch = userQuery.match(/(?:remove|delete)\s+(?:the\s+)?(?:text|word|phrase|line|content)?\s*(?:about|for|regarding|:)?\s*(.+)/i);
            if (removeMatch) {
              const termToRemove = removeMatch[1].trim();
              const newContent = sectionMatch.content.replace(new RegExp(termToRemove, "gi"), "");
              onEditSection(sectionMatch.id, newContent);
              return {
                content: `I've removed "${termToRemove}" from the "${sectionMatch.title}" section.`,
                action: { type: "edit_section", data: { ...sectionMatch, content: newContent } }
              };
            }
          }
        }
        
        // No specific action found, ask for clarification
        setPendingEditSection(sectionMatch);
        return {
          content: `I found the section "${sectionMatch.title}". What changes would you like me to make?\n\nYou can:\n- **Add** more content (e.g., "Add a note about compliance")\n- **Replace** content (e.g., "Replace with new summary text")\n- **Remove** specific text (e.g., "Remove the word pending")\n- **Add visualization** (e.g., "Add a bar chart")\n\nPlease describe the changes you'd like.`,
          action: { type: "edit_section", data: sectionMatch }
        };
      } else {
        return {
          content: `Which section would you like to modify? Here are the available sections:\n\n${sections.map((s, i) => `${i + 1}. ${s.title}`).join("\n")}\n\nPlease specify the section name or number.`,
        };
      }
    }

    // Default helpful response
    return {
      content: `I can help you with:\n\n- **Search**: "Search for high risk controls" or "Search for users"\n- **Add sections**: "Create an executive summary" or "Generate insights"\n- **Modify sections**: "Edit section [name]" then describe changes\n- **Remove sections**: "Remove section [name]"\n- **View metrics**: "Search for metrics"\n\nWhat would you like me to do?`,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsProcessing(true);

    try {
      const response = await processQuery(userMessage.content);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response.content,
        action: response.action,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-submit when clicking suggestions
  const handleSuggestionClick = async (prompt: string) => {
    if (isProcessing) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await processQuery(prompt);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response.content,
        action: response.action,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {/* Pulsing tooltip */}
        <div 
          className="absolute right-full mr-3 px-3 py-1.5 rounded-md text-xs font-medium text-white whitespace-nowrap animate-pulse"
          style={{ backgroundColor: "#059669" }}
        >
          Use AI to modify your report
          <div 
            className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent"
            style={{ borderLeftColor: "#059669" }}
          />
        </div>
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          data-testid="button-expand-agent"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[600px] flex flex-col bg-background border rounded-xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-lg bg-primary/20">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              Report Agent
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              {pendingEditSection ? `Editing: ${pendingEditSection.title}` : "Modify & enhance your report"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(false)}
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
          data-testid="button-minimize-agent"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Pending edit indicator */}
      {pendingEditSection && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Edit3 className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-amber-700 dark:text-amber-400">
              Editing: <strong>{pendingEditSection.title}</strong>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPendingEditSection(null)}
            className="h-6 text-xs text-amber-600 hover:text-amber-700"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[200px] max-h-[350px]">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Ask me to search, add, or modify sections in your report.
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(action.prompt)}
                  className="flex items-center gap-2 px-3 py-2 text-left text-xs rounded-lg border hover:bg-muted transition-colors"
                  data-testid={`quick-action-${idx}`}
                  disabled={isProcessing}
                >
                  <action.icon className="h-3.5 w-3.5 text-primary" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>

            {/* Suggestions */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Suggestions</p>
              {suggestionPrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs rounded-lg hover:bg-muted transition-colors group"
                  data-testid={`suggestion-${idx}`}
                  disabled={isProcessing}
                >
                  <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {message.content.split(/(\*\*[^*]+\*\*)/).map((part, idx) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={idx}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </div>
                  {message.action?.type === "add_section" && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Section added
                    </Badge>
                  )}
                  {message.action?.type === "edit_section" && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Section updated
                    </Badge>
                  )}
                  {message.action?.type === "remove_section" && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Section removed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-muted/30">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={pendingEditSection ? "Describe the changes..." : "Ask to search, add, or modify..."}
            className="flex-1 text-sm"
            disabled={isProcessing}
            data-testid="input-agent-query"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!query.trim() || isProcessing}
            className="shrink-0"
            data-testid="button-send-query"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
