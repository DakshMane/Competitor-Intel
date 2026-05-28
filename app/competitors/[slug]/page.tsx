import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChangeFeed } from "../../components/ChangeFeed";
import { InsightsPanel } from "../../components/InsightsPanel";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { CompetitorDetailComponent } from "@/app/components/CompetitorDetailComponent";
import { summarizeCompetitor } from "@/lib/gemini";
export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default async function CompetitorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const competitor = await prisma.competitor.findUnique({
    where: { slug },
    include: {
      changes: {
        orderBy: { detectedAt: 'desc' },
        take: 50
      }
    }
  });

  if (!competitor) {
    notFound();
  }

  // Mark all unread changes for this competitor as read
  await prisma.change.updateMany({
    where: {
      competitorId: competitor.id,
      isRead: false
    },
    data: {
      isRead: true
    }
  });

  // Find insights that relate to this competitor
  const rawInsights = await prisma.insight.findMany({
    where: {
      competitors: { has: competitor.id }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const enrichedInsights = rawInsights.map(i => ({
    id: i.id,
    title: i.title,
    content: i.content,
    insightType: i.insightType,
    createdAt: i.createdAt.toISOString(),
    competitorDetails: [
      {
        id: competitor.id,
        name: competitor.name,
        slug: competitor.slug,
        color: competitor.color || '#666',
        logoUrl: competitor.logoUrl
      }
    ]
  }));

  const serializedChanges = competitor.changes.map(c => ({
    ...c,
    detectedAt: c.detectedAt.toISOString(),
    competitor: {
      name: competitor.name,
      logoUrl: competitor.logoUrl,
      color: competitor.color || '#666',
    }
  }));

  const changesStr = competitor.changes.map(c => `• [${c.category.toUpperCase()}] ${c.title}: ${c.summary}`).join("\n");
  const aiSummary = await summarizeCompetitor(competitor.name, changesStr || "No changes logged yet.");

  return (
    <CompetitorDetailComponent
      competitor={competitor}
      serializedChanges={serializedChanges}
      enrichedInsights={enrichedInsights}
      aiSummary={aiSummary}
    />
  );
}
