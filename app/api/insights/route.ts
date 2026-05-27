/**
 * GET /api/insights — Returns latest AI-generated insights
 */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const insights = await prisma.insight.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Enrich with competitor names
    const competitorIds = [
      ...new Set(insights.flatMap((i) => i.competitors)),
    ];
    const competitors = await prisma.competitor.findMany({
      where: { id: { in: competitorIds } },
      select: { id: true, name: true, slug: true, color: true },
    });

    const competitorMap = Object.fromEntries(
      competitors.map((c) => [c.id, c])
    );

    const enriched = insights.map((i) => ({
      ...i,
      competitorDetails: i.competitors
        .map((id) => competitorMap[id])
        .filter(Boolean),
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Insights GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
