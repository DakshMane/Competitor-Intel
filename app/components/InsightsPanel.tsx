"use client";

import { TrendingUp, AlertOctagon, Target } from "lucide-react";

interface Insight {
  id: number;
  title: string;
  content: string;
  insightType: "trend" | "alert" | "opportunity";
  createdAt: string;
  competitorDetails: {
    id: number;
    name: string;
    color: string;
  }[];
}

const typeConfig = {
  trend: { icon: TrendingUp, color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", label: "Market Trend" },
  alert: { icon: AlertOctagon, color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10", label: "Competitive Alert" },
  opportunity: { icon: Target, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", label: "Opportunity" },
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="glass-card flex flex-col h-full items-center justify-center p-8 text-center text-muted-foreground">
        <TrendingUp size={48} className="opacity-20 mb-4" />
        <p>Run a scan to generate AI insights.</p>
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Gemini AI</span> 
          Analysis
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Strategic intelligence from recent data</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {insights.map((insight, i) => {
          const config = typeConfig[insight.insightType];
          const Icon = config.icon;

          return (
            <div 
              key={insight.id} 
              className={`p-5 rounded-xl border ${config.border} bg-black/40 relative overflow-hidden group animate-slide-up`}
              style={{ animationDelay: `${(i + 4) * 100}ms` }}
            >
              {/* Subtle gradient background based on insight type */}
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl transition-opacity group-hover:opacity-20 ${config.bg.replace('/10', '')}`} />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className={`p-2 rounded-lg ${config.bg} ${config.color} shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">{insight.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">{insight.content}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {insight.competitorDetails.map(comp => (
                      <span 
                        key={comp.id} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: comp.color }} />
                        {comp.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
