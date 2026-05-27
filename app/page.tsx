import { prisma } from "@/lib/prisma";
import { StatsBar } from "./components/StatsBar";
import { CompetitorGrid } from "./components/CompetitorGrid";
import { ChangeFeed } from "./components/ChangeFeed";
import { InsightsPanel } from "./components/InsightsPanel";

// Force dynamic rendering since we are fetching from DB directly in Server Component
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { SyncButton } from "./components/SyncButton";

export default async function Home() {
  // Fetch initial data on the server
  const [competitors, changesCount, latestScrape, rawChanges, rawInsights] = await Promise.all([
    prisma.competitor.findMany({
      include: {
        _count: { select: { changes: true } },
        changes: { where: { isRead: false }, select: { id: true } }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.change.count(),
    prisma.scrapeRun.findFirst({ orderBy: { startedAt: 'desc' } }),
    prisma.change.findMany({
      include: {
        competitor: {
          select: { name: true, logoUrl: true, color: true }
        }
      },
      orderBy: { detectedAt: 'desc' },
      take: 20
    }),
    prisma.insight.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  const formattedCompetitors = competitors.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    color: c.color || '#666',
    logoUrl: c.logoUrl,
    totalChanges: c._count.changes,
    unreadChanges: c.changes.length
  }));

  // Enrich insights with competitor details for the UI
  const competitorMap = Object.fromEntries(
    formattedCompetitors.map(c => [c.id, c])
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

  // Parse dates to strings for Client Components
  const serializedChanges = rawChanges.map(c => ({
    ...c,
    detectedAt: c.detectedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-8 h-full animate-slide-up">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Competitor Intelligence</h1>
        <p className="text-muted-foreground">Real-time monitoring and AI analysis of your competitive landscape.</p>
      </header>

      <StatsBar 
        totalChanges={changesCount}
        activeCompetitors={competitors.length}
        insightsGenerated={rawInsights.length}
        lastScanTime={latestScrape?.startedAt.toISOString() || new Date().toISOString()}
      />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Tracked Targets</h2>
        </div>
        <CompetitorGrid competitors={formattedCompetitors} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        <ChangeFeed initialChanges={serializedChanges as any} />
        <InsightsPanel insights={enrichedInsights as any} />
      </section>
    </div>
  );
}
