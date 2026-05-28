import { NextRequest, NextResponse } from "next/server";
import { runCrawlAndAnalysis } from "@/lib/scanner";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let competitorId: number | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.competitorId === "number") {
        competitorId = body.competitorId;
      }
    } catch {
      // No JSON body or invalid, scan all
    }

    const result = await runCrawlAndAnalysis(competitorId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        changesFound: result.changesFound,
      });
    } else {
      return NextResponse.json({ success: false, error: result.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Scan API route error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
