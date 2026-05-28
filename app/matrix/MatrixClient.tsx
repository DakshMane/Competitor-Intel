"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Globe, 
  DollarSign, 
  BookOpen, 
  Briefcase, 
  Sparkles, 
  ArrowUpRight, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  Activity
} from "lucide-react";
import { MatrixSwotModal } from "../components/MatrixSwotModal";

interface CompetitorData {
  id: number;
  name: string;
  slug: string;
  website: string;
  logoUrl: string | null;
  color: string;
  pricingUrl: string | null;
  blogUrl: string | null;
  careersUrl: string | null;
  totalChanges: number;
  criticalChanges: number;
  highChanges: number;
  mediumChanges: number;
  lowChanges: number;
  lastChangeCategory: string | null;
}

export default function MatrixClient({ competitors }: { competitors: CompetitorData[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minChanges, setMinChanges] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"name" | "changes" | "critical">("name");

  // SWOT Modal state
  const [swotOpen, setSwotOpen] = useState(false);
  const [selectedCompId, setSelectedCompId] = useState<number | null>(null);
  const [selectedCompName, setSelectedCompName] = useState<string | null>(null);

  const openSwot = (id: number, name: string) => {
    setSelectedCompId(id);
    setSelectedCompName(name);
    setSwotOpen(true);
  };

  const filteredAndSorted = useMemo(() => {
    return competitors
      .filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.website.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesChanges = c.totalChanges >= minChanges;
        return matchesSearch && matchesChanges;
      })
      .sort((a, b) => {
        if (sortBy === "changes") {
          return b.totalChanges - a.totalChanges;
        }
        if (sortBy === "critical") {
          return b.criticalChanges - a.criticalChanges;
        }
        return a.name.localeCompare(b.name);
      });
  }, [competitors, searchTerm, minChanges, sortBy]);

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl glass border border-white/5">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Min changes slider */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg">
            <span>Min Updates:</span>
            <input
              type="range"
              min="0"
              max="20"
              value={minChanges}
              onChange={(e) => setMinChanges(parseInt(e.target.value))}
              className="w-20 accent-primary"
            />
            <span className="font-semibold text-white w-4 text-right">{minChanges}</span>
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg">
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="name" className="bg-zinc-900">Name</option>
              <option value="changes" className="bg-zinc-900">Total Updates</option>
              <option value="critical" className="bg-zinc-900">Critical Alerts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Glass Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/10 glass-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="px-6 py-4">Target Brand</th>
              <th className="px-6 py-4">Channels Tracked</th>
              <th className="px-6 py-4">Update Volume</th>
              <th className="px-6 py-4">Severity Mix</th>
              <th className="px-6 py-4">Latest Category</th>
              <th className="px-6 py-4 text-right">Strategic AI Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAndSorted.map((comp) => {
              const totalChanges = comp.totalChanges;
              const hasPricing = !!comp.pricingUrl;
              const hasBlog = !!comp.blogUrl;
              const hasCareers = !!comp.careersUrl;

              // Ratios for custom heat bar
              const critRatio = totalChanges > 0 ? (comp.criticalChanges / totalChanges) * 100 : 0;
              const highRatio = totalChanges > 0 ? (comp.highChanges / totalChanges) * 100 : 0;
              const medRatio = totalChanges > 0 ? (comp.mediumChanges / totalChanges) * 100 : 0;
              const lowRatio = totalChanges > 0 ? (comp.lowChanges / totalChanges) * 100 : 0;

              return (
                <tr key={comp.id} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Brand & Website */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        {comp.logoUrl ? (
                          <img
                            src={comp.logoUrl}
                            alt={comp.name}
                            className="w-10 h-10 rounded-lg bg-white/5 p-1 border border-white/10 object-contain shadow-md"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-md border"
                            style={{ 
                              backgroundColor: `${comp.color}20`,
                              borderColor: `${comp.color}40`,
                              color: comp.color 
                            }}
                          >
                            {comp.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{comp.name}</span>
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: comp.color }}
                          />
                        </div>
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
                        >
                          <Globe size={11} />
                          {comp.website.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]}
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Channels Monitored */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {/* Homepage */}
                      <span 
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        title="Main Site (Monitored)"
                      >
                        <Globe size={13} />
                      </span>
                      {/* Pricing */}
                      <span 
                        className={`p-1.5 rounded-lg border transition-all ${
                          hasPricing 
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                            : "bg-white/[0.02] text-zinc-600 border-white/5"
                        }`}
                        title={hasPricing ? `Pricing Page Tracked: ${comp.pricingUrl}` : "Pricing Track Not Configured"}
                      >
                        <DollarSign size={13} />
                      </span>
                      {/* Blog */}
                      <span 
                        className={`p-1.5 rounded-lg border transition-all ${
                          hasBlog 
                            ? "bg-pink-500/10 text-pink-400 border-pink-500/20" 
                            : "bg-white/[0.02] text-zinc-600 border-white/5"
                        }`}
                        title={hasBlog ? `Blog Feed Tracked: ${comp.blogUrl}` : "Blog Track Not Configured"}
                      >
                        <BookOpen size={13} />
                      </span>
                      {/* Careers */}
                      <span 
                        className={`p-1.5 rounded-lg border transition-all ${
                          hasCareers 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                            : "bg-white/[0.02] text-zinc-600 border-white/5"
                        }`}
                        title={hasCareers ? `Careers Feed Tracked: ${comp.careersUrl}` : "Careers Track Not Configured"}
                      >
                        <Briefcase size={13} />
                      </span>
                    </div>
                  </td>

                  {/* Change Volume */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-base">{totalChanges}</span>
                      <span className="text-xs text-muted-foreground">updates</span>
                    </div>
                  </td>

                  {/* Severity Breakdown Custom Heatbar */}
                  <td className="px-6 py-4 min-w-[160px]">
                    {totalChanges > 0 ? (
                      <div className="space-y-1.5">
                        <div className="w-full h-2 rounded-full overflow-hidden bg-white/5 flex">
                          {comp.criticalChanges > 0 && (
                            <div 
                              className="h-full bg-red-500 transition-all"
                              style={{ width: `${critRatio}%` }}
                              title={`Critical: ${comp.criticalChanges}`}
                            />
                          )}
                          {comp.highChanges > 0 && (
                            <div 
                              className="h-full bg-orange-500 transition-all"
                              style={{ width: `${highRatio}%` }}
                              title={`High: ${comp.highChanges}`}
                            />
                          )}
                          {comp.mediumChanges > 0 && (
                            <div 
                              className="h-full bg-yellow-500 transition-all"
                              style={{ width: `${medRatio}%` }}
                              title={`Medium: ${comp.mediumChanges}`}
                            />
                          )}
                          {comp.lowChanges > 0 && (
                            <div 
                              className="h-full bg-zinc-500 transition-all"
                              style={{ width: `${lowRatio}%` }}
                              title={`Low: ${comp.lowChanges}`}
                            />
                          )}
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span className="text-red-400 font-medium">C:{comp.criticalChanges}</span>
                          <span className="text-orange-400 font-medium">H:{comp.highChanges}</span>
                          <span className="text-yellow-400 font-medium">M:{comp.mediumChanges}</span>
                          <span className="text-zinc-400 font-medium">L:{comp.lowChanges}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500 italic">No events logged</span>
                    )}
                  </td>

                  {/* Latest Change Category */}
                  <td className="px-6 py-4">
                    {comp.lastChangeCategory ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 border border-primary/20 text-primary font-medium uppercase tracking-wide">
                        {comp.lastChangeCategory}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>

                  {/* Strategic Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openSwot(comp.id, comp.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary hover:bg-primary text-xs font-semibold hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                      >
                        <Sparkles size={12} />
                        AI SWOT
                      </button>
                      <Link
                        href={`/competitors/${comp.slug}`}
                        className="p-1.5 rounded-lg bg-white/[0.03] text-muted-foreground hover:text-white hover:bg-white/10 border border-white/5 transition-colors"
                        title="View Profile"
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                  No competitors match the search or filter settings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SWOT Modal Portal */}
      <MatrixSwotModal
        isOpen={swotOpen}
        onClose={() => setSwotOpen(false)}
        competitorId={selectedCompId}
        competitorName={selectedCompName}
      />
    </div>
  );
}
