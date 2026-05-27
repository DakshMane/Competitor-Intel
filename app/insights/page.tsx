import { prisma } from "@/lib/prisma";
import { InsightsPanel } from "../components/InsightsPanel";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InsightsPage() {
  const [competitors, rawInsights] = await Promise.all([
    prisma.competitor.findMany({
      select: { id: true, name: true, slug: true, color: true, logoUrl: true }
    }),
    prisma.insight.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  ]);

  const competitorMap = Object.fromEntries(
    competitors.map(c => [c.id, { ...c, color: c.color || '#666' }])
  );
  
  const enrichedInsights = rawInsights.map(i => ({
    id: i.id,
    title: i.title,
    content: i.content,
    insightType: i.insightType,
    createdAt: i.createdAt.toISOString(),
    competitorDetails: i.competitors
      .map(id => competitorMap[id])
      .filter(Boolean)
  }));

  return (
    <div className="flex flex-col gap-8 h-full animate-slide-up">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">AI Strategic Insights</h1>
        <p className="text-muted-foreground">Automated analysis and tactical recommendations based on recent activity.</p>
      </header>

      <section className="flex-1 min-h-[800px]">
        <InsightsPanel insights={enrichedInsights as any} />
      </section>
    </div>
  );
}
