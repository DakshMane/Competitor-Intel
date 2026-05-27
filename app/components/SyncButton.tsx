"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

export function SyncButton({ competitorId }: { competitorId?: number }) {
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setIsScanning(true);
    setMessage(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      
      setMessage(`Success: ${data.message}`);
      // Reload page to show new data
      window.location.reload();
    } catch (error: any) {
      console.error("Scan error:", error);
      setMessage(`Error: ${error.message || "Failed to scan"}`);
    } finally {
      setIsScanning(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 relative">
      <button
        onClick={handleSync}
        disabled={isScanning}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/10 transition-all ${
          isScanning
            ? "bg-white/5 text-muted-foreground cursor-not-allowed"
            : "bg-white/5 hover:bg-white/10 text-white hover:border-white/20 active:scale-95"
        }`}
        title={competitorId ? "Trigger manual crawl for this competitor" : "Trigger manual crawl & generate AI insights"}
      >
        {isScanning ? (
          <>
            <Loader2 size={16} className="animate-spin text-primary" />
            <span>{competitorId ? "Crawling Target..." : "Scanning Landscape..."}</span>
          </>
        ) : (
          <>
            <RefreshCw size={16} className="text-primary hover:rotate-180 transition-transform duration-500" />
            <span>{competitorId ? "Sync Target" : "Scan & Refresh"}</span>
          </>
        )}
      </button>

      {message && (
        <div className="absolute top-full right-0 mt-2 z-[999] animate-slide-up">
          <div className={`px-3 py-2 rounded-lg text-xs border backdrop-blur-md shadow-lg ${
            message.startsWith("Error:")
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-green-500/10 border-green-500/20 text-green-400"
          }`}>
            {message}
          </div>
        </div>
      )}
    </div>
  );
}
