/**
 * GET   /api/changes — Query changes with filters
 * PATCH /api/changes — Mark changes as read
 */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ChangeCategory, Severity } from "../../generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get("competitor");
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};
    if (competitorId) where.competitorId = parseInt(competitorId);
    if (category) where.category = category as ChangeCategory;
    if (severity) where.severity = severity as Severity;

    const [changes, total] = await Promise.all([
      prisma.change.findMany({
        where,
        include: {
          competitor: {
            select: { name: true, slug: true, color: true, logoUrl: true },
          },
        },
        orderBy: { detectedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.change.count({ where }),
    ]);

    return NextResponse.json({ changes, total, limit, offset });
  } catch (error) {
    console.error("Changes GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, isRead } = body;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 }
      );
    }

    await prisma.change.updateMany({
      where: { id: { in: ids } },
      data: { isRead: isRead ?? true },
    });

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error) {
    console.error("Changes PATCH error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
