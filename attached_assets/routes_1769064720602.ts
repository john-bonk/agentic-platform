import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertControlSchema, insertAuditSchema } from "@shared/schema";
import type { ReportSection, ReportTocItem } from "@shared/schema";
import { z } from "zod";
import Parser from "rss-parser";

// RSS feed sources for audit/compliance industry news
const RSS_FEEDS = [
  { name: "SEC Press Releases", url: "https://www.sec.gov/news/pressreleases.rss" },
  { name: "PCAOB News", url: "https://pcaobus.org/news-events/rss" },
  { name: "Compliance Week", url: "https://www.complianceweek.com/rss" },
  { name: "JD Supra - Compliance", url: "https://www.jdsupra.com/topics/compliance/rss.xml" },
  { name: "ISACA", url: "https://www.isaca.org/RSS%20Feeds/isaca-now-blog-rss" },
];

interface IndustryNewsItem {
  source: string;
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  imageUrl: string | null;
}

// Stock images for audit/compliance news when no image is available
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop", // Charts/analytics
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=250&fit=crop", // Business professional
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop", // Computer data
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop", // Dashboard
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop", // Documents
];

// Extract image URL from RSS item
function extractImageFromItem(item: any): string | null {
  // Try enclosure (common for podcasts and media)
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
    return item.enclosure.url;
  }
  // Try media:content
  if (item['media:content']?.['$']?.url) {
    return item['media:content']['$'].url;
  }
  // Try to extract from content HTML
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
  }
  // Try itunes:image
  if (item['itunes:image']?.['$']?.href) {
    return item['itunes:image']['$'].href;
  }
  return null;
}

// Fetch industry news from RSS feeds
async function fetchIndustryNews(maxItems: number = 3): Promise<IndustryNewsItem[]> {
  const parser = new Parser({
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AuditDashboard/1.0)',
    },
    customFields: {
      item: [
        ['media:content', 'media:content'],
        ['enclosure', 'enclosure'],
        ['itunes:image', 'itunes:image'],
      ]
    }
  });
  
  const allItems: IndustryNewsItem[] = [];
  
  // Fetch from multiple feeds in parallel, with error handling for each
  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items || []).slice(0, 2).map((item, idx) => ({
        source: feed.name,
        title: item.title || "Untitled",
        link: item.link || "",
        pubDate: item.pubDate || new Date().toISOString(),
        snippet: (item.contentSnippet || item.content || "").replace(/<[^>]*>/g, '').substring(0, 150).trim() + "...",
        imageUrl: extractImageFromItem(item),
      }));
      return items;
    } catch (error) {
      console.log(`Failed to fetch RSS from ${feed.name}:`, error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  });
  
  const results = await Promise.allSettled(feedPromises);
  
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allItems.push(...result.value);
    }
  }
  
  // Sort by date (newest first) and take top items
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  
  // Assign fallback images to items without images
  const finalItems = allItems.slice(0, maxItems).map((item, idx) => ({
    ...item,
    imageUrl: item.imageUrl || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]
  }));
  
  // If we got real items, return them; otherwise return fallback
  if (finalItems.length > 0) {
    return finalItems;
  }
  
  // Fallback static items if all feeds fail
  return [
    {
      source: "SEC",
      title: "SEC Updates Internal Control Requirements for 2026",
      link: "https://www.sec.gov",
      pubDate: new Date().toISOString(),
      snippet: "New guidelines for internal control over financial reporting take effect this quarter...",
      imageUrl: FALLBACK_IMAGES[0]
    },
    {
      source: "PCAOB",
      title: "PCAOB Issues New Audit Quality Indicators",
      link: "https://pcaobus.org",
      pubDate: new Date().toISOString(),
      snippet: "The PCAOB released updated metrics for measuring audit quality across registered firms...",
      imageUrl: FALLBACK_IMAGES[1]
    },
    {
      source: "ISACA",
      title: "Emerging Trends in IT Audit and Governance",
      link: "https://www.isaca.org",
      pubDate: new Date().toISOString(),
      snippet: "Technology risk continues to dominate audit committees' agendas in 2026...",
      imageUrl: FALLBACK_IMAGES[2]
    }
  ];
}

// Schema for report generation request
const generateReportSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  insights: z.array(z.string()).optional(),
  style: z.string().optional(),
});

const refreshReportSchema = z.object({
  prompt: z.string().optional(),
});

const sendSmsSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  shareUrl: z.string().url("Share URL must be a valid URL"),
  reportTitle: z.string().min(1, "Report title is required"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (_req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Controls CRUD
  app.get("/api/controls", async (_req, res) => {
    try {
      const controls = await storage.getControls();
      res.json(controls);
    } catch (error) {
      console.error("Error fetching controls:", error);
      res.status(500).json({ error: "Failed to fetch controls" });
    }
  });

  app.get("/api/controls/:id", async (req, res) => {
    try {
      const control = await storage.getControl(req.params.id);
      if (!control) {
        return res.status(404).json({ error: "Control not found" });
      }
      res.json(control);
    } catch (error) {
      console.error("Error fetching control:", error);
      res.status(500).json({ error: "Failed to fetch control" });
    }
  });

  app.post("/api/controls", async (req, res) => {
    try {
      const parsed = insertControlSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const control = await storage.createControl(parsed.data);
      res.status(201).json(control);
    } catch (error) {
      console.error("Error creating control:", error);
      res.status(500).json({ error: "Failed to create control" });
    }
  });

  app.patch("/api/controls/:id", async (req, res) => {
    try {
      const control = await storage.updateControl(req.params.id, req.body);
      if (!control) {
        return res.status(404).json({ error: "Control not found" });
      }
      res.json(control);
    } catch (error) {
      console.error("Error updating control:", error);
      res.status(500).json({ error: "Failed to update control" });
    }
  });

  // Audits CRUD
  app.get("/api/audits", async (_req, res) => {
    try {
      const audits = await storage.getAudits();
      res.json(audits);
    } catch (error) {
      console.error("Error fetching audits:", error);
      res.status(500).json({ error: "Failed to fetch audits" });
    }
  });

  app.get("/api/audits/:id", async (req, res) => {
    try {
      const audit = await storage.getAudit(req.params.id);
      if (!audit) {
        return res.status(404).json({ error: "Audit not found" });
      }
      res.json(audit);
    } catch (error) {
      console.error("Error fetching audit:", error);
      res.status(500).json({ error: "Failed to fetch audit" });
    }
  });

  app.post("/api/audits", async (req, res) => {
    try {
      const parsed = insertAuditSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const audit = await storage.createAudit(parsed.data);
      res.status(201).json(audit);
    } catch (error) {
      console.error("Error creating audit:", error);
      res.status(500).json({ error: "Failed to create audit" });
    }
  });

  app.patch("/api/audits/:id", async (req, res) => {
    try {
      const audit = await storage.updateAudit(req.params.id, req.body);
      if (!audit) {
        return res.status(404).json({ error: "Audit not found" });
      }
      res.json(audit);
    } catch (error) {
      console.error("Error updating audit:", error);
      res.status(500).json({ error: "Failed to update audit" });
    }
  });

  // Control Tests
  app.get("/api/control-tests", async (req, res) => {
    try {
      const controlId = req.query.controlId as string | undefined;
      const tests = await storage.getControlTests(controlId);
      res.json(tests);
    } catch (error) {
      console.error("Error fetching control tests:", error);
      res.status(500).json({ error: "Failed to fetch control tests" });
    }
  });

  // Evidence
  app.get("/api/evidence", async (req, res) => {
    try {
      const controlTestId = req.query.controlTestId as string | undefined;
      const evidence = await storage.getEvidence(controlTestId);
      res.json(evidence);
    } catch (error) {
      console.error("Error fetching evidence:", error);
      res.status(500).json({ error: "Failed to fetch evidence" });
    }
  });

  // Current User
  app.get("/api/user/current", async (_req, res) => {
    try {
      const user = await storage.getCurrentUser();
      res.json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ error: "Failed to fetch current user" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const assigneeId = req.query.assigneeId as string | undefined;
      const tasks = await storage.getTasks(assigneeId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (_req, res) => {
    try {
      await storage.markAllNotificationsRead();
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all as read" });
    }
  });

  // Messages
  app.get("/api/messages", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const messages = await storage.getMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const message = await storage.markMessageRead(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to update message" });
    }
  });

  // Report generation endpoints

  /** Generate report with real industry news from RSS feeds */
  async function callLLM(prompt: string): Promise<{
    title: string;
    sections: ReportSection[];
    toc: ReportTocItem[];
    createdAt: string;
  }> {
    // Fetch real industry news from RSS feeds (request extra to ensure we get 3)
    let industryNews = await fetchIndustryNews(5);
    
    // Fallback news items if RSS feeds don't return enough
    const fallbackNews = [
      {
        source: "AICPA Insights",
        title: "New SOX Compliance Guidelines for 2026",
        snippet: "The AICPA has released updated guidance on internal control testing procedures, emphasizing automation and continuous monitoring for enhanced compliance efficiency.",
        link: "https://www.aicpa.org",
        imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
        pubDate: new Date().toISOString()
      },
      {
        source: "Deloitte Audit",
        title: "AI-Powered Internal Controls: The Future of Audit",
        snippet: "Leading firms are adopting machine learning to identify control deficiencies faster and improve testing accuracy across financial reporting processes.",
        link: "https://www.deloitte.com",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
        pubDate: new Date().toISOString()
      },
      {
        source: "CFO Magazine",
        title: "Top 5 IT General Controls Every Auditor Should Monitor",
        snippet: "From access management to change control, these critical IT controls remain the foundation of a robust SOX compliance program in the digital era.",
        link: "https://www.cfo.com",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
        pubDate: new Date().toISOString()
      }
    ];
    
    // If we don't have enough news items, add fallbacks
    while (industryNews.length < 3 && fallbackNews.length > 0) {
      industryNews.push(fallbackNews.shift()!);
    }
    
    // Format news items as JSON for card rendering (limit to exactly 3)
    const newsItemsJson = JSON.stringify(industryNews.slice(0, 3).map(item => ({
      source: item.source,
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      imageUrl: item.imageUrl,
      pubDate: new Date(item.pubDate).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      })
    })));
    
    // Build report with real news
    const report = {
      title: "Audit Cycle Insights — Generated Report",
      sections: [
        {
          id: "sec1",
          title: "Executive Summary",
          content: `This report provides a comprehensive overview of the current audit cycle status. We analyzed your SOX testing progress, compliance controls, and identified key areas requiring attention.\n\nThe following sections detail our findings and recommendations based on your organization's risk profile and the latest regulatory guidance.`,
          charts: [{ type: "bar" as const, data: [5, 9, 3], labels: ["Passed", "In Progress", "Failed"], title: "Control Status Overview" }]
        },
        {
          id: "sec2",
          title: "Key Insights",
          content: "Our analysis highlights the following priority areas:\n\n• **High-Risk Controls**: Several controls require immediate testing attention, particularly in financial reporting and IT general controls.\n• **Process Gaps**: Evidence collection workflows show opportunities for automation and efficiency improvements.\n• **Risk Indicators**: The current testing cycle is on track, with 68% of controls tested or in progress.",
          charts: [{ type: "pie" as const, data: [2, 3, 5], labels: ["High Risk", "Medium Risk", "Low Risk"], title: "Risk Distribution" }]
        },
        {
          id: "sec3",
          title: "Industry News & Regulatory Updates",
          content: `__NEWS_CARDS__${newsItemsJson}`,
          charts: []
        }
      ],
      toc: [
        { id: "sec1", title: "Executive Summary" },
        { id: "sec2", title: "Key Insights" },
        { id: "sec3", title: "Industry News & Regulatory Updates" }
      ],
      createdAt: new Date().toISOString()
    };
    return report;
  }

  /** POST /api/generate-report - Generate a new report */
  app.post("/api/generate-report", async (req, res) => {
    try {
      const parsed = generateReportSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      
      const { prompt, insights, style } = parsed.data;
      
      // Build an instruction for the LLM
      const llmPrompt = `You are an AI report assistant. Generate a digital news-feed style audit report.
      Title: "Audit Cycle Insights"
      Requirements:
      - Structure into sections with titles and content
      - Each section should have at least two sentences
      - Include an Industry News section with 2-3 snippets sourced from reputable outlets
      - Produce a JSON payload with { title, sections, toc, createdAt }
      - Left-hand Table of Contents (toc) should map to sections
      - Provide simple chartSpec for sections that have charts
      - Include: ${prompt}`;

      // Call LLM (replace with real API in production)
      const llmOutput = await callLLM(llmPrompt);

      // Create the report in storage
      const report = await storage.createReport({
        title: llmOutput.title,
        sections: llmOutput.sections,
        toc: llmOutput.toc,
        createdAt: llmOutput.createdAt,
        prompt,
      });

      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  /** GET /api/reports - Get all reports */
  app.get("/api/reports", async (_req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  /** GET /api/reports/:reportId - Get a specific report */
  app.get("/api/reports/:reportId", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.reportId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });

  /** POST /api/refresh-report - Re-generate a report */
  app.post("/api/refresh-report", async (req, res) => {
    try {
      const parsed = refreshReportSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      
      const { prompt } = parsed.data;
      const llmOutput = await callLLM(`Refresh: ${prompt || ''}`);
      
      const report = await storage.createReport({
        title: llmOutput.title,
        sections: llmOutput.sections,
        toc: llmOutput.toc,
        createdAt: llmOutput.createdAt,
        prompt: prompt || undefined,
      });

      res.json(report);
    } catch (error) {
      console.error("Error refreshing report:", error);
      res.status(500).json({ error: "Failed to refresh report" });
    }
  });

  /** GET /api/users - Get all users for coworker suggestions */
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getUsers();
      const safeUsers = users.map(({ password, ...rest }) => rest);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  /** POST /api/share/create - Create a shared link for a report */
  app.post("/api/share/create", async (req, res) => {
    try {
      const { reportId, expiresIn, customSlug, allowedEmails } = req.body;

      if (!reportId) {
        return res.status(400).json({ error: "reportId is required" });
      }

      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (customSlug) {
        const existingSlug = await storage.getSharedLinkBySlug(customSlug);
        if (existingSlug) {
          return res.status(400).json({ error: "Custom slug already in use" });
        }
      }

      let expiresAt: string | null = null;
      if (expiresIn && expiresIn !== "infinite") {
        const now = new Date();
        const expirationMap: Record<string, number> = {
          "24h": 24 * 60 * 60 * 1000,
          "2d": 2 * 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "14d": 14 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
        };
        const duration = expirationMap[expiresIn];
        if (duration) {
          expiresAt = new Date(now.getTime() + duration).toISOString();
        }
      }

      const currentUser = await storage.getCurrentUser();
      const sharedLink = await storage.createSharedLink({
        reportId,
        customSlug: customSlug || null,
        expiresAt,
        allowedEmails: allowedEmails || null,
        createdBy: currentUser.id,
      });

      res.json(sharedLink);
    } catch (error) {
      console.error("Error creating shared link:", error);
      res.status(500).json({ error: "Failed to create shared link" });
    }
  });

  /** GET /api/share/links/:reportId - Get all shared links for a report */
  app.get("/api/share/links/:reportId", async (req, res) => {
    try {
      const links = await storage.getSharedLinks(req.params.reportId);
      res.json(links);
    } catch (error) {
      console.error("Error fetching shared links:", error);
      res.status(500).json({ error: "Failed to fetch shared links" });
    }
  });

  /** GET /r/:token - Access a shared report via token */
  app.get("/r/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      let sharedLink = await storage.getSharedLinkByToken(token);
      if (!sharedLink) {
        sharedLink = await storage.getSharedLinkBySlug(token);
      }
      
      if (!sharedLink) {
        return res.status(404).json({ error: "Shared link not found" });
      }

      if (sharedLink.expiresAt) {
        const expirationDate = new Date(sharedLink.expiresAt);
        if (expirationDate < new Date()) {
          return res.status(410).json({ error: "This link has expired" });
        }
      }

      const report = await storage.getReport(sharedLink.reportId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      res.json({ report, sharedLink });
    } catch (error) {
      console.error("Error accessing shared report:", error);
      res.status(500).json({ error: "Failed to access shared report" });
    }
  });

  /** DELETE /api/share/:id - Delete a shared link */
  app.delete("/api/share/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSharedLink(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Shared link not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting shared link:", error);
      res.status(500).json({ error: "Failed to delete shared link" });
    }
  });

  /** POST /api/share/sms - Send a report link via SMS using Twilio */
  app.post("/api/share/sms", async (req, res) => {
    try {
      const parsed = sendSmsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid request data" });
      }

      const { phoneNumber, shareUrl, reportTitle } = parsed.data;

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !twilioPhoneNumber) {
        return res.status(500).json({ 
          error: "Twilio is not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your secrets." 
        });
      }

      const currentUser = await storage.getCurrentUser();
      const senderName = currentUser?.name || "Someone";
      
      const messageBody = `${senderName} has shared the ${reportTitle} with you:\n\n${shareUrl}`;

      const twilio = await import("twilio");
      const client = twilio.default(accountSid, authToken);

      await client.messages.create({
        body: messageBody,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });

      res.json({ success: true, message: "SMS sent successfully" });
    } catch (error) {
      console.error("Error sending SMS:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send SMS";
      res.status(500).json({ error: errorMessage });
    }
  });

  return httpServer;
}
