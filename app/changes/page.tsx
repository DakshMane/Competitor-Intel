import { prisma } from "@/lib/prisma";
import { ChangeFeed } from "../components/ChangeFeed";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ChangesPage() {
  const rawChanges = await prisma.change.findMany({
    include: {
      competitor: {
        select: { name: true, logoUrl: true, color: true }
      }
    },
    orderBy: { detectedAt: 'desc' },
    take: 100
  });

  const serializedChanges = rawChanges.map(c => ({
    ...c,
    detectedAt: c.detectedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-8 h-full animate-slide-up">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Global Change Feed</h1>
        <p className="text-muted-foreground">A comprehensive log of all detected competitive changes.</p>
      </header>

      <section className="flex-1 min-h-[800px]">
        <ChangeFeed initialChanges={serializedChanges as any} />
      </section>
    </div>
  );
}
