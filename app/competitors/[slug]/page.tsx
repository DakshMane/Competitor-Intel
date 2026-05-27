import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChangeFeed } from "../../components/ChangeFeed";
import { InsightsPanel } from "../../components/InsightsPanel";
import { ExternalLink, Link as LinkIcon } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { SyncButton } from "../../components/SyncButton";

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

  return (
    <div className="flex flex-col gap-8 h-full animate-slide-up">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            {(() => {
              let domain = "";
              try {
                domain = new URL(competitor.website).hostname;
              } catch {
                domain = competitor.website.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
              }
              const logoSrc = competitor.logoUrl || `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
              return (
                <img 
                  src={logoSrc} 
                  alt={competitor.name} 
                  className="w-20 h-20 rounded-xl bg-white/5 p-2 object-contain border border-white/10 shadow-lg" 
                  onError={(e) => {
                    // Failover to initials box if image fails to load entirely
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              );
            })()}
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{competitor.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <a href={competitor.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                <LinkIcon size={14} />
                {new URL(competitor.website).hostname}
              </a>
              {competitor.pricingUrl && (
                <a href={competitor.pricingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink size={14} />
                  Pricing
                </a>
              )}
            </div>
          </div>
        </div>
        <SyncButton competitorId={competitor.id} />
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        <ChangeFeed initialChanges={serializedChanges as any} />
        <InsightsPanel insights={enrichedInsights as any} />
      </section>
    </div>
  );
}
