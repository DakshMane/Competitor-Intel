/**
 * GET  /api/competitors — List all competitors with stats
 * POST /api/competitors — Add a new competitor
 */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error("Competitors POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
