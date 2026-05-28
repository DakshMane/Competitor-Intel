"use client"

import { SyncButton } from "./SyncButton";
import { ChangeFeed } from "./ChangeFeed";
import { InsightsPanel } from "./InsightsPanel";
import { ExternalLink, Link as LinkIcon, Sparkles } from "lucide-react";
export  function CompetitorDetailComponent({
  competitor,
  serializedChanges,
  enrichedInsights,
  aiSummary
}: {
  competitor: any;
  serializedChanges: any[];
  enrichedInsights: any[];
  aiSummary: string;
}){

  return(
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

      {/* AI Strategic Executive Summary Alert */}
      {aiSummary && (
        <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative overflow-hidden flex items-start gap-4 shadow-lg shadow-primary/5">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shrink-0">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              AI Strategic Executive Summary
            </h4>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {aiSummary}
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        <ChangeFeed initialChanges={serializedChanges as any} />
        <InsightsPanel insights={enrichedInsights as any} />
      </section>
    </div>
  )
}
