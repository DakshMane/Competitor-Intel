import { prisma } from "@/lib/prisma";
import MatrixClient from "./MatrixClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MatrixPage() {
  // Fetch all competitors and their changes
  const competitors = await prisma.competitor.findMany({
    include: {
      changes: {
        orderBy: { detectedAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Transform data for the MatrixClient layout
  const formattedCompetitors = competitors.map((c) => {
    const changes = c.changes;
    const criticalChanges = changes.filter((ch) => ch.severity === "critical").length;
    const highChanges = changes.filter((ch) => ch.severity === "high").length;
    const mediumChanges = changes.filter((ch) => ch.severity === "medium").length;
    const lowChanges = changes.filter((ch) => ch.severity === "low").length;
    const lastChangeCategory = changes[0]?.category || null;

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      website: c.website,
      logoUrl: c.logoUrl,
      color: c.color || "#6366f1",
      pricingUrl: c.pricingUrl,
      blogUrl: c.blogUrl,
      careersUrl: c.careersUrl,
      totalChanges: changes.length,
      criticalChanges,
      highChanges,
      mediumChanges,
      lowChanges,
      lastChangeCategory,
    };
  });

  return (
    <div className="flex flex-col gap-8 h-full animate-slide-up">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Competitive Landscape Matrix</h1>
        <p className="text-muted-foreground">
          Side-by-side comparison of active competitor channels, change severity volumes, and AI SWOT synthesis.
        </p>
      </header>

      <section className="flex-1">
        <MatrixClient competitors={formattedCompetitors} />
      </section>
    </div>
  );
}
