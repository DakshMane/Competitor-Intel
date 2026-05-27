"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Globe, DollarSign, BookOpen, Briefcase, Palette, Loader2 } from "lucide-react";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#06b6d4",
];

export function AddCompetitorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [pricingUrl, setPricingUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [careersUrl, setCareersUrl] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const resetForm = () => {
    setName("");
    setWebsite("");
    setPricingUrl("");
    setBlogUrl("");
    setCareersUrl("");
    setColor(PRESET_COLORS[0]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          website,
          pricingUrl: pricingUrl || undefined,
          blogUrl: blogUrl || undefined,
          careersUrl: careersUrl || undefined,
          color,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed (${res.status})`);
      }

      const competitor = await res.json();
      
      // Trigger background scrape and AI analysis for this target immediately
      try {
        await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ competitorId: competitor.id }),
        });
      } catch (scanErr) {
        console.error("Immediate scan failed:", scanErr);
      }

      resetForm();
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 rounded-2xl p-0 overflow-hidden animate-slide-up shadow-2xl shadow-primary/10 border border-white/10" style={{ background: '#18181b' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Add Competitor</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Start tracking a new target
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Company Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stripe"
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              <Globe size={14} className="inline mr-1.5 -mt-0.5" />
              Website URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              required
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://stripe.com"
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Optional URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                <DollarSign size={12} className="inline mr-1 -mt-0.5" />
                Pricing URL
              </label>
              <input
                type="url"
                value={pricingUrl}
                onChange={(e) => setPricingUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                <BookOpen size={12} className="inline mr-1 -mt-0.5" />
                Blog URL
              </label>
              <input
                type="url"
                value={blogUrl}
                onChange={(e) => setBlogUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                <Briefcase size={12} className="inline mr-1 -mt-0.5" />
                Careers URL
              </label>
              <input
                type="url"
                value={careersUrl}
                onChange={(e) => setCareersUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <Palette size={14} className="inline mr-1.5 -mt-0.5" />
              Brand Color
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    color === c
                      ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-110 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name || !website}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Target
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
