/**
 * GET  /api/competitors — List all competitors with stats
 * POST /api/competitors — Add a new competitor
 */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { runCrawlAndAnalysis } from "@/lib/scanner";
import { sendWhatsAppMessage } from "@/lib/twilio";

export async function GET() {
  try {
    const competitors = await prisma.competitor.findMany({
      include: {
        changes: {
          orderBy: { detectedAt: "desc" },
          take: 5,
          select: {
            id: true,
            category: true,
            severity: true,
            title: true,
            detectedAt: true,
            isRead: true,
          },
        },
        _count: {
          select: { changes: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const enriched = competitors.map((c) => ({
      ...c,
      totalChanges: c._count.changes,
      unreadChanges: c.changes.filter((ch) => !ch.isRead).length,
      lastActivity: c.changes[0]?.detectedAt || c.createdAt,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Competitors GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, website, pricingUrl, blogUrl, careersUrl, color } = body;

    if (!name || !website) {
      return NextResponse.json(
        { error: "name and website are required" },
        { status: 400 }
      );
    }

    let domain = "";
    try {
      domain = new URL(website).hostname;
    } catch {
      domain = website.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    }
    const autoLogoUrl = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const competitor = await prisma.competitor.create({
      data: {
        name,
        slug,
        website,
        logoUrl: autoLogoUrl,
        pricingUrl: pricingUrl || null,
        blogUrl: blogUrl || null,
        careersUrl: careersUrl || null,
        color: color || "#6366f1",
      },
    });

    // Trigger immediate automatic crawl and analysis in the background
    runCrawlAndAnalysis(competitor.id).catch((err) => {
      console.error(`Automatic crawl failed for competitor ${competitor.id}:`, err);
    });

    // Send immediate WhatsApp notification about the newly tracked competitor
    try {
      const waMessage = `➕ *New Target Tracked* ➕\n\n` +
        `🏢 *Company:* ${name}\n` +
        `🌐 *Website:* ${website}\n` +
        (pricingUrl ? `💰 *Pricing:* ${pricingUrl}\n` : "") +
        (blogUrl ? `📰 *Blog:* ${blogUrl}\n` : "") +
        (careersUrl ? `💼 *Careers:* ${careersUrl}\n` : "") +
        `\n🚀 *Status:* Starting initial intelligence crawl and analysis...`;
      await sendWhatsAppMessage(waMessage, autoLogoUrl);
    } catch (waErr) {
      console.error("Failed to send WhatsApp notification for new competitor:", waErr);
    }

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error("Competitors POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
