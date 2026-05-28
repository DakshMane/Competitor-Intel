import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const swotSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    strengths: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Strengths of the competitor based on their recent developments, feature releases, hiring trends, or branding.",
    },
    weaknesses: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Weaknesses or potential areas of vulnerability (e.g., pricing hikes that may alienate users, slow execution, gaps in product offering).",
    },
    opportunities: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Strategic opportunities open to our product to capture their market share or exploit their changes.",
    },
    threats: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Direct threats they pose to our positioning (e.g., expanding into key markets, aggressive AI features, hiring key talent).",
    },
    strategicSummary: {
      type: SchemaType.STRING,
      description: "A 1-2 sentence recommendation advising our product or leadership team on the optimal next step.",
    },
  },
  required: ["strengths", "weaknesses", "opportunities", "threats", "strategicSummary"],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const competitorId = parseInt(id);

    if (isNaN(competitorId)) {
      return NextResponse.json({ error: "Invalid competitor ID" }, { status: 400 });
    }

    const competitor = await prisma.competitor.findUnique({
      where: { id: competitorId },
      include: {
        changes: {
          orderBy: { detectedAt: "desc" },
          take: 25,
        },
      },
    });

    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    const recentChangesText = competitor.changes
      .map(
        (c) =>
          `[${c.category.toUpperCase()} - Severity: ${c.severity}] ${c.title}: ${c.summary}`
      )
      .join("\n");

    const prompt = `You are a world-class strategic competitive analyst.
Analyze the following competitive profile and recent detected updates for the competitor: "${competitor.name}".

Competitor Website: ${competitor.website}
Number of recent changes detected: ${competitor.changes.length}

Detected Changes Feed:
${recentChangesText || "No changes detected yet."}

Based on this information (and standard industry knowledge of this competitor if no changes are logged yet), generate a highly detailed, professional, and actionable SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) and a direct Strategic Recommendation advising our leadership team.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: swotSchema,
      },
    });

    const swotData = JSON.parse(result.response.text());

    return NextResponse.json({
      competitorName: competitor.name,
      ...swotData,
    });
  } catch (error) {
    console.error("SWOT API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate SWOT analysis: " + String(error) },
      { status: 500 }
    );
  }
}
