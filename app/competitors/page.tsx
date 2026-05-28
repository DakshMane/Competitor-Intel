import { prisma } from "@/lib/prisma";
import { CompetitorGrid } from "../components/CompetitorGrid";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CompetitorsPage() {
  const competitors = await prisma.competitor.findMany({
    include: {
      _count: { select: { changes: true } },
      changes: { where: { isRead: false }, select: { id: true } }
    },
    orderBy: { name: 'asc' }
  });

  const formattedCompetitors = competitors.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    color: c.color || '#666',
    logoUrl: c.logoUrl,
    totalChanges: c._count.changes,
    unreadChanges: c.changes.length
  }));

  return (
    <div className="flex flex-col gap-8 h-full animate-slide-up">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Tracked Targets</h1>
        <p className="text-muted-foreground">All competitors currently being monitored by the system.</p>
      </header>

      <section className="flex-1">
        <CompetitorGrid competitors={formattedCompetitors} />
      </section>
    </div>
  );
}
