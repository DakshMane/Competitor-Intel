/**
 * POST /api/seed
 * Initialize database with competitor data and demo changes
 */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const COMPETITORS = [
  {
    name: "Notion",
    slug: "notion",
    website: "https://www.notion.so",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    color: "#000000",
    pricingUrl: "https://www.notion.so/pricing",
    blogUrl: "https://www.notion.so/blog",
    careersUrl: "https://www.notion.so/careers",
  },
  {
    name: "Linear",
    slug: "linear",
    website: "https://linear.app",
    logoUrl: "https://linear.app/static/apple-touch-icon.png",
    color: "#5E6AD2",
    pricingUrl: "https://linear.app/pricing",
    blogUrl: "https://linear.app/blog",
    careersUrl: "https://linear.app/careers",
  },
  {
    name: "Figma",
    slug: "figma",
    website: "https://www.figma.com",
    logoUrl: "https://static.figma.com/app/icon/1/touch-76.png",
    color: "#F24E1E",
    pricingUrl: "https://www.figma.com/pricing",
    blogUrl: "https://www.figma.com/blog",
    careersUrl: "https://www.figma.com/careers",
  },
  {
    name: "Slack",
    slug: "slack",
    website: "https://slack.com",
    logoUrl: "https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png",
    color: "#4A154B",
    pricingUrl: "https://slack.com/pricing",
    blogUrl: "https://slack.com/blog",
    careersUrl: "https://slack.com/careers",
  },
];

// Demo changes for a compelling first-load experience
function generateDemoChanges(competitorIds: Record<string, number>) {
  const now = new Date();
  const changes = [
    // Notion
    {
      competitorId: competitorIds["notion"],
      category: "pricing" as const,
      severity: "critical" as const,
      title: "Notion raises Enterprise plan price by 20%",
      summary:
        "Notion has increased Enterprise plan pricing from $25/user/month to $30/user/month. This represents a significant shift in their enterprise strategy and may open opportunities for competitive positioning in the mid-market segment.",
      sourceUrl: "https://www.notion.so/pricing",
      detectedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      competitorId: competitorIds["notion"],
      category: "feature" as const,
      severity: "high" as const,
      title: "Notion launches AI-powered project management",
      summary:
        "Notion has integrated AI agents directly into their project management workflow, enabling automated task assignment, sprint planning, and standup summaries. This positions them more directly against Linear and Monday.com.",
      sourceUrl: "https://www.notion.so/blog/ai-project-management",
      detectedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    },
    {
      competitorId: competitorIds["notion"],
      category: "blog" as const,
      severity: "medium" as const,
      title: "Notion publishes SOC 2 Type II compliance update",
      summary:
        "Notion announced completion of SOC 2 Type II certification, strengthening their enterprise security story. This removes a common objection in enterprise sales cycles.",
      sourceUrl: "https://www.notion.so/blog/security-update",
      detectedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    // Linear
    {
      competitorId: competitorIds["linear"],
      category: "feature" as const,
      severity: "critical" as const,
      title: "Linear ships real-time collaboration with multiplayer cursors",
      summary:
        "Linear now supports real-time multiplayer editing in issue descriptions and project documents, bringing Figma-style collaboration to project management. This is a significant differentiation move.",
      sourceUrl: "https://linear.app/changelog/multiplayer",
      detectedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      competitorId: competitorIds["linear"],
      category: "jobs" as const,
      severity: "medium" as const,
      title: "Linear hiring 12 new engineers for AI team",
      summary:
        "Linear posted 12 engineering positions focused on AI/ML, suggesting a major push into AI-powered development workflows. Roles include ML engineers, data scientists, and AI product managers.",
      sourceUrl: "https://linear.app/careers",
      detectedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    },
    {
      competitorId: competitorIds["linear"],
      category: "pricing" as const,
      severity: "high" as const,
      title: "Linear introduces free tier for teams up to 10",
      summary:
        "Linear expanded their free tier from 5 to 10 users and added unlimited issues. This aggressive move targets early-stage startups and could significantly impact top-of-funnel acquisition for competitors.",
      sourceUrl: "https://linear.app/pricing",
      detectedAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    },
    // Figma
    {
      competitorId: competitorIds["figma"],
      category: "feature" as const,
      severity: "critical" as const,
      title: "Figma launches AI-powered design-to-code generation",
      summary:
        "Figma now offers one-click design-to-production-ready code generation supporting React, Vue, and SwiftUI. This could disrupt the handoff workflow and impact tools like Zeplin and Storybook.",
      sourceUrl: "https://www.figma.com/blog/design-to-code",
      detectedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
    {
      competitorId: competitorIds["figma"],
      category: "pricing" as const,
      severity: "high" as const,
      title: "Figma bundles FigJam into all paid plans at no extra cost",
      summary:
        "FigJam (whiteboarding) is now included free in all Figma Professional and Organization plans. Previously $5/editor/month separately, this bundling pressures standalone whiteboard tools like Miro.",
      sourceUrl: "https://www.figma.com/pricing",
      detectedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
    },
    {
      competitorId: competitorIds["figma"],
      category: "blog" as const,
      severity: "low" as const,
      title: "Figma Config 2026 dates announced",
      summary:
        "Figma announced Config 2026 will take place June 24-25 in San Francisco. Early bird registration is open. Major product announcements expected around developer experience.",
      sourceUrl: "https://config.figma.com",
      detectedAt: new Date(now.getTime() - 96 * 60 * 60 * 1000),
    },
    // Slack
    {
      competitorId: competitorIds["slack"],
      category: "feature" as const,
      severity: "high" as const,
      title: "Slack launches native AI assistant across all paid plans",
      summary:
        "Slack AI is now available to all paid plans (previously Enterprise only). Features include channel summaries, thread catch-up, and AI-powered search. This democratizes AI features previously reserved for top-tier customers.",
      sourceUrl: "https://slack.com/blog/ai-assistant",
      detectedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
    {
      competitorId: competitorIds["slack"],
      category: "pricing" as const,
      severity: "medium" as const,
      title: "Slack adjusts Pro plan from per-user to per-seat licensing",
      summary:
        "Slack is transitioning Pro plan billing from active-user to seat-based licensing, effective next quarter. Organizations with many inactive users may see cost increases, while active teams could see savings.",
      sourceUrl: "https://slack.com/pricing",
      detectedAt: new Date(now.getTime() - 60 * 60 * 60 * 1000),
    },
    {
      competitorId: competitorIds["slack"],
      category: "jobs" as const,
      severity: "low" as const,
      title: "Slack opening new engineering hub in London",
      summary:
        "Salesforce (Slack's parent) announced a new engineering hub in London focused on Slack platform and integrations. 50+ engineering roles to be filled in the next 6 months.",
      sourceUrl: "https://slack.com/careers",
      detectedAt: new Date(now.getTime() - 120 * 60 * 60 * 1000),
    },
  ];

  return changes;
}

function generateDemoInsights(competitorIds: Record<string, number>) {
  return [
    {
      title: "AI Feature Arms Race Intensifying Across All Competitors",
      content:
        "All four tracked competitors have made significant AI investments in the past week. Notion launched AI project management, Linear is hiring 12 AI engineers, Figma shipped design-to-code AI, and Slack democratized their AI assistant. This signals an industry-wide pivot where AI is no longer a premium feature but a baseline expectation. Consider accelerating your own AI roadmap to avoid falling behind.",
      insightType: "trend" as const,
      competitors: Object.values(competitorIds),
    },
    {
      title: "Pricing Pressure in Mid-Market Segment",
      content:
        "Linear expanding their free tier to 10 users while Notion raises enterprise prices creates a pincer movement in the mid-market. Linear captures price-sensitive teams from below, while Notion pushes enterprise-focused buyers up. This opens a potential sweet spot for competitively priced mid-market offerings.",
      insightType: "opportunity" as const,
      competitors: [competitorIds["linear"], competitorIds["notion"]],
    },
    {
      title: "Figma's Design-to-Code Threatens Developer Tool Ecosystem",
      content:
        "Figma's AI-powered design-to-code generation could disrupt the design-development handoff workflow. Tools that depend on the gap between design and code (Storybook, Zeplin, etc.) may face existential pressure. Monitor adoption rates closely and consider integrating with Figma's API proactively.",
      insightType: "alert" as const,
      competitors: [competitorIds["figma"]],
    },
    {
      title: "Enterprise Security as Table Stakes",
      content:
        "Notion's SOC 2 Type II announcement follows Figma and Linear's earlier compliance milestones. Enterprise security certifications are now table stakes. If you haven't completed SOC 2 Type II, prioritize it — it's increasingly a gate in enterprise procurement.",
      insightType: "alert" as const,
      competitors: [competitorIds["notion"]],
    },
  ];
}

export async function POST() {
  try {
    // Upsert competitors
    const competitorIds: Record<string, number> = {};

    for (const comp of COMPETITORS) {
      const result = await prisma.competitor.upsert({
        where: { slug: comp.slug },
        update: comp,
        create: comp,
      });
      competitorIds[comp.slug] = result.id;
    }

    // Clear old demo data & insert fresh
    await prisma.change.deleteMany({});
    await prisma.insight.deleteMany({});

    const demoChanges = generateDemoChanges(competitorIds);
    await prisma.change.createMany({ data: demoChanges });

    const demoInsights = generateDemoInsights(competitorIds);
    await prisma.insight.createMany({ data: demoInsights });

    return NextResponse.json({
      success: true,
      message: "Database seeded with demo data",
      competitors: Object.keys(competitorIds).length,
      changes: demoChanges.length,
      insights: demoInsights.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
