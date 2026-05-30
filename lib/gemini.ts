/**
 * Gemini AI Integration
 *
 * Uses Google's Gemini API with structured output and automatic model failover/fail-back.
 */

import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Fallback chain order to ensure maximum resilience
const MODELS_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-3.5-flash"

];

// ─── Core Failover Runner ───────────────────────────

async function generateWithFailover(
  prompt: string,
  generationConfig?: { responseMimeType?: string; responseSchema?: Schema }
): Promise<string> {
  let lastError: any = null;

  for (const modelName of MODELS_FALLBACK_CHAIN) {
    try {
      console.log(`[Gemini] Dispatching request to model: ${modelName}`);
      const currentModel = genAI.getGenerativeModel({ model: modelName });

      const result = await currentModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const text = result.response.text();
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[Gemini Warning] Model "${modelName}" request failed:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models in fallback chain failed.");
}

// ─── Types ──────────────────────────────────────────

export interface ClassifiedChange {
  category: "pricing" | "feature" | "blog" | "jobs" | "other";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  summary: string;
}

export interface AIInsight {
  title: string;
  content: string;
  insightType: "trend" | "alert" | "opportunity";
  competitorNames: string[];
}

// ─── Classify Change ────────────────────────────────

const classificationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["pricing", "feature", "blog", "jobs", "other"],
      description:
        "The type of change: pricing=pricing page or plan changes, feature=new product features or updates, blog=blog posts or announcements, jobs=job postings or hiring news, other=anything else",
    },
    severity: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["critical", "high", "medium", "low"],
      description:
        "Impact severity: critical=major pricing overhaul or competitive threat, high=significant feature launch, medium=notable update, low=minor news",
    },
    title: {
      type: SchemaType.STRING,
      description:
        "A concise, compelling title for this change (max 80 chars). Should be actionable and specific.",
    },
    summary: {
      type: SchemaType.STRING,
      description:
        "A 2-3 sentence summary of the change and its competitive implications. Be specific about what changed and why it matters.",
    },
  },
  required: ["category", "severity", "title", "summary"],
};

export async function classifyChange(
  rawContent: string,
  competitorName: string,
  sourceUrl: string
): Promise<ClassifiedChange | null> {
  try {
    const prompt = `You are a competitive intelligence analyst. Analyze the following content scraped from ${competitorName}'s website (${sourceUrl}).

Classify this content and extract the most important competitive insight.

Content (truncated to 3000 chars):
${rawContent.slice(0, 3000)}`;

    const text = await generateWithFailover(prompt, {
      responseMimeType: "application/json",
      responseSchema: classificationSchema,
    });

    return JSON.parse(text) as ClassifiedChange;
  } catch (error) {
    console.error("Gemini classification error:", error);
    return null;
  }
}

// ─── Generate Insights ──────────────────────────────

const insightsSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: "Compelling insight title (max 100 chars)",
      },
      content: {
        type: SchemaType.STRING,
        description:
          "Detailed insight with strategic recommendations (3-5 sentences)",
      },
      insightType: {
        type: SchemaType.STRING,
        format: "enum",
        enum: ["trend", "alert", "opportunity"],
        description:
          "trend=market pattern emerging, alert=competitive threat to address, opportunity=gap to exploit",
      },
      competitorNames: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Names of competitors relevant to this insight",
      },
    },
    required: ["title", "content", "insightType", "competitorNames"],
  },
};

export async function generateInsights(
  changesDescription: string
): Promise<AIInsight[]> {
  try {
    const prompt = `You are a strategic competitive intelligence analyst. Based on the following recent competitor changes, generate 3-5 actionable insights for our product team.

Focus on:
- Emerging trends across competitors
- Competitive threats that need immediate attention
- Market opportunities we could exploit

Recent changes:
${changesDescription}`;

    const text = await generateWithFailover(prompt, {
      responseMimeType: "application/json",
      responseSchema: insightsSchema,
    });

    return JSON.parse(text) as AIInsight[];
  } catch (error) {
    console.error("Gemini insights error:", error);
    return [];
  }
}

// ─── Summarize Competitor ───────────────────────────

export async function summarizeCompetitor(
  competitorName: string,
  recentChanges: string
): Promise<string> {
  try {
    const prompt = `In 1-2 sentences, summarize the recent competitive activity of ${competitorName}. Be specific and actionable.

Recent changes:
${recentChanges}`;

    const text = await generateWithFailover(prompt);
    return text;
  } catch (error) {
    console.error("Gemini summary error:", error);
    return `${competitorName} is being monitored for changes.`;
  }
}

// ─── Generate Dynamic Fallback Content ───────────────────

export async function generateDynamicFallbackContent(
  competitorName: string,
  label: string
): Promise<string> {
  try {
    const prompt = `You are a web crawling simulator. Generate a highly realistic HTML block representing a ${label} page for the company "${competitorName}".
Include some exciting recent updates, pricing tiers, blog announcements, or job listings depending on the page type (${label}). Keep it under 600 characters, make it customized to this specific company, and return only the raw HTML snippet without any markdown formatting.`;

    const text = await generateWithFailover(prompt);
    return text;
  } catch (error) {
    console.error("Gemini dynamic fallback error:", error);
    return "";
  }
}

