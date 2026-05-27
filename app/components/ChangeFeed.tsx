"use client";

import { useState , useEffect} from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Tag,
  Briefcase,
  PenTool,
  Newspaper,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface Change {
  id: number;
  category: "pricing" | "feature" | "blog" | "jobs" | "other";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  summary: string;
  sourceUrl: string | null;
  detectedAt: string;
  isRead: boolean;
  competitor: {
    name: string;
    logoUrl: string | null;
    color: string;
  };
}

const severityConfig = {
  critical: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { icon: Info, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { icon: CheckCircle2, color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
};

const categoryConfig = {
  pricing: { icon: Tag, label: "Pricing Update" },
  feature: { icon: Zap, label: "Product Feature" },
  blog: { icon: Newspaper, label: "Blog Post" },
  jobs: { icon: Briefcase, label: "Job Posting" },
  other: { icon: PenTool, label: "Other News" },
};

import { Zap } from "lucide-react";

function TimeAgo({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="opacity-0">Just now</span>;
  }

  return <>{formatDistanceToNow(new Date(date), { addSuffix: true })}</>;
}

export function ChangeFeed({ initialChanges }: { initialChanges: Change[] }) {
  const [changes, setChanges] = useState<Change[]>(initialChanges);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const markAsRead = async (id: number) => {
    // Optimistic update
    setChanges(changes.map(c => c.id === id ? { ...c, isRead: true } : c));

    // In real app, call PATCH /api/changes
    try {
      await fetch('/api/changes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], isRead: true })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredChanges = changes.filter(c => filter === "all" || !c.isRead);

  return (
    <div className="glass-card flex flex-col h-full">
      <div className="p-6 border-b border-border/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Live Radar Feed</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time competitive changes</p>
        </div>

        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredChanges.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
            <Activity size={48} className="opacity-20 mb-4" />
            <p>No changes found in the radar.</p>
          </div>
        ) : (
          filteredChanges.map((change, i) => {
            const sev = severityConfig[change.severity];
            const cat = categoryConfig[change.category];
            const SevIcon = sev.icon;
            const CatIcon = cat.icon;

            return (
              <div
                key={change.id}
                className={`p-4 rounded-xl border ${change.isRead ? 'bg-white/5 border-white/5 opacity-70' : `bg-black/40 ${sev.border} shadow-lg`} transition-all animate-slide-up relative group`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {!change.isRead && (
                  <div className="absolute top-4 right-4 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${sev.color} animate-pulse`} />
                    <button
                      onClick={() => markAsRead(change.id)}
                      className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Mark read
                    </button>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="shrink-0 pt-1">
                    {change.competitor.logoUrl ? (
                      <img src={change.competitor.logoUrl} alt={change.competitor.name} className="w-10 h-10 rounded bg-white/10 p-1 object-contain" />
                    ) : (
                      <div className="w-10 h-10 rounded flex items-center justify-center font-bold text-white" style={{ backgroundColor: change.competitor.color }}>
                        {change.competitor.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white">{change.competitor.name}</span>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-muted-foreground text-xs">
                        <TimeAgo date={change.detectedAt} />
                      </span>

                      <div className={`ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.color}`}>
                        <SevIcon size={12} />
                        {change.severity}
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-zinc-300">
                        <CatIcon size={12} />
                        {cat.label}
                      </div>
                    </div>

                    <h4 className="text-lg font-medium text-white mt-2 mb-1.5 leading-snug">{change.title}</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-3">{change.summary}</p>

                    {change.sourceUrl && (
                      <a
                        href={change.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink size={12} />
                        View Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
