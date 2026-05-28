import cron from "node-cron";
import { runCrawlAndAnalysis } from "@/lib/scanner";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[Scheduler] Active - Setting up automatic competitive scans (Every 2 Minutes for Testing)...");

    // Schedule to run every 2 minutes: '*/2 * * * *'
    cron.schedule("*/2 * * * *", async () => {
      console.log("[Scheduler] Initiating automatic 2-minute competitive landscape crawl & analysis...");
      try {
        const result = await runCrawlAndAnalysis();
        console.log(`[Scheduler] Automatic landscape crawl succeeded: ${result.message}`);
      } catch (err) {
        console.error("[Scheduler Error] Automatic landscape crawl failed:", err);
      }
    });
  }
}
