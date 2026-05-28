"use client";

import { useEffect, useState } from "react";
import { X, ShieldAlert, Sparkles, AlertTriangle, Compass, Lightbulb, Loader2 } from "lucide-react";

interface SWOTData {
  competitorName: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategicSummary: string;
}

export function MatrixSwotModal({
  isOpen,
  onClose,
  competitorId,
  competitorName,
}: {
  isOpen: boolean;
  onClose: () => void;
  competitorId: number | null;
  competitorName: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swot, setSwot] = useState<SWOTData | null>(null);

  useEffect(() => {
    if (!isOpen || !competitorId) {
      setSwot(null);
      setError(null);
      return;
    }

    const fetchSWOT = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/competitors/${competitorId}/swot`);
        if (!res.ok) {
          throw new Error(`Failed to generate SWOT analysis (${res.status})`);
        }
        const data = await res.json();
        setSwot(data);
      } catch (err: any) {
        console.error("SWOT load error:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchSWOT();
  }, [isOpen, competitorId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden animate-slide-up shadow-2xl border border-white/10 flex flex-col max-h-[90vh]" style={{ background: '#0e0e11' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                AI Strategic SWOT Analysis
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Real-time competitor synthesis for <span className="text-primary font-semibold">{competitorName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <div className="text-center">
                <p className="text-zinc-300 font-medium">Analyzing market intelligence feed...</p>
                <p className="text-xs text-muted-foreground mt-1">Classifying trends, severity weights, and strategic opportunities</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex flex-col items-center justify-center text-center gap-2 py-8">
              <AlertTriangle size={32} />
              <h3 className="font-semibold text-lg">Failed to Generate Analysis</h3>
              <p className="text-sm text-red-300/80 max-w-md">{error}</p>
              <button
                onClick={() => {
                  // retry
                  setError(null);
                  const fetchSWOT = async () => {
                    setLoading(true);
                    try {
                      const res = await fetch(`/api/competitors/${competitorId}/swot`);
                      if (!res.ok) throw new Error("Failed to generate SWOT");
                      const data = await res.json();
                      setSwot(data);
                    } catch (err: any) {
                      setError(err.message || "An unexpected error occurred.");
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchSWOT();
                }}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg text-sm font-medium transition-colors border border-red-500/30"
              >
                Try Again
              </button>
            </div>
          )}

          {swot && !loading && !error && (
            <div className="space-y-6">
              {/* 4 Quadrants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths */}
                <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                  <h3 className="text-emerald-400 font-semibold flex items-center gap-2 mb-4 text-base border-b border-emerald-500/10 pb-2">
                    <Sparkles size={18} />
                    Strengths (S)
                  </h3>
                  <ul className="space-y-2.5 text-zinc-300 text-sm">
                    {swot.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 animate-pulse" />
                        <span>{str}</span>
                      </li>
                    ))}
                    {swot.strengths.length === 0 && (
                      <li className="text-zinc-500 italic">No major strengths identified yet.</li>
                    )}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/[0.02] shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
                  <h3 className="text-rose-400 font-semibold flex items-center gap-2 mb-4 text-base border-b border-rose-500/10 pb-2">
                    <AlertTriangle size={18} />
                    Weaknesses (W)
                  </h3>
                  <ul className="space-y-2.5 text-zinc-300 text-sm">
                    {swot.weaknesses.map((weak, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0 animate-pulse" />
                        <span>{weak}</span>
                      </li>
                    ))}
                    {swot.weaknesses.length === 0 && (
                      <li className="text-zinc-500 italic">No major weaknesses identified yet.</li>
                    )}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="p-5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.02] shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
                  <h3 className="text-cyan-400 font-semibold flex items-center gap-2 mb-4 text-base border-b border-cyan-500/10 pb-2">
                    <Compass size={18} />
                    Opportunities (O)
                  </h3>
                  <ul className="space-y-2.5 text-zinc-300 text-sm">
                    {swot.opportunities.map((opp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 animate-pulse" />
                        <span>{opp}</span>
                      </li>
                    ))}
                    {swot.opportunities.length === 0 && (
                      <li className="text-zinc-500 italic">No major opportunities identified yet.</li>
                    )}
                  </ul>
                </div>

                {/* Threats */}
                <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.02] shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
                  <h3 className="text-amber-400 font-semibold flex items-center gap-2 mb-4 text-base border-b border-amber-500/10 pb-2">
                    <ShieldAlert size={18} />
                    Threats (T)
                  </h3>
                  <ul className="space-y-2.5 text-zinc-300 text-sm">
                    {swot.threats.map((thr, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0 animate-pulse" />
                        <span>{thr}</span>
                      </li>
                    ))}
                    {swot.threats.length === 0 && (
                      <li className="text-zinc-500 italic">No major threats identified yet.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Strategic Summary Banner */}
              <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shrink-0">
                  <Lightbulb size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-semibold text-sm">AI Strategic Recommendation</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {swot.strategicSummary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-white/5 text-sm font-semibold"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
