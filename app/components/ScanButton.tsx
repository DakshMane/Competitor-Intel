"use client";

import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";

export function ScanButton() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{success?: boolean, message?: string} | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      
      setResult({ 
        success: true, 
        message: data.message || `Scan complete! Found ${data.changesFound} new events.` 
      });
      
      // Refresh the page data
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      setResult({ success: false, message: error.message || "Scan failed" });
    } finally {
      setIsScanning(false);
      setTimeout(() => setResult(null), 5000);
    }
  };

  return (
    <div className="relative w-full">
      <button
        onClick={handleScan}
        disabled={isScanning}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 ${
          isScanning
            ? "bg-primary/20 text-primary cursor-not-allowed"
            : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
        }`}
      >
        {isScanning ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Scanning targets...
          </>
        ) : (
          <>
            <Zap size={18} className="fill-current" />
            Scan Now
          </>
        )}
      </button>

      {/* Toast Notification */}
      {result && (
        <div className="absolute bottom-full left-0 right-0 mb-4 animate-slide-up">
          <div className={`p-3 rounded-md text-sm text-center border backdrop-blur-md ${
            result.success 
              ? "bg-green-500/10 border-green-500/20 text-green-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {result.message}
          </div>
        </div>
      )}
    </div>
  );
}
