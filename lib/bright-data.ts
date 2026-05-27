/**
 * Bright Data Integration
 *
 * Provides two functions:
 * 1. scrapeUrl() — Uses Bright Data's Web Unlocker to fetch rendered HTML
 * 2. searchSerp() — Uses Bright Data's SERP API for structured search results
 */

const API_TOKEN = process.env.BRIGHT_DATA_API_KEY!;

// ─── Web Scraper (Web Unlocker) ─────────────────────

export interface ScrapeResult {
  url: string;
  html: string;
  status: number;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  console.log(`[Bright Data Scraper] Initiating scrape for URL: ${url}`);
  console.log(`[Bright Data Scraper] API Token configured: ${API_TOKEN ? "YES (starts with " + API_TOKEN.slice(0, 4) + "...)" : "NO"}`);
  
  try {
    const response = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        zone: "web_unlocker1",
        url,
        format: "raw",
      }),
    });

    console.log(`[Bright Data Scraper] Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(
        `[Bright Data Scraper] Scrape failed for ${url}: ${response.status} ${response.statusText}`
      );
      return { url, html: "", status: response.status };
    }

    const html = await response.text();
    console.log(`[Bright Data Scraper] Successfully scraped ${html.length} bytes of content.`);
    console.log(`[Bright Data Scraper] HTML Snippet (first 300 chars): ${html.substring(0, 300)}...`);
    return { url, html, status: response.status };
  } catch (error) {
    console.error(`[Bright Data Scraper] Scrape error for ${url}:`, error);
    return { url, html: "", status: 500 };
  }
}

// ─── SERP API ───────────────────────────────────────

export interface SerpResult {
  title: string;
  url: string;
  description: string;
}

export interface SerpResponse {
  query: string;
  results: SerpResult[];
}

export async function searchSerp(query: string): Promise<SerpResponse> {
  console.log(`[Bright Data SERP] Query: "${query}"`);
  
  try {
    const params = new URLSearchParams({
      query,
      brd_json: "1",
    });

    console.log(`[Bright Data SERP] Requesting: https://api.brightdata.com/serp/req?${params.toString()}`);

    const response = await fetch(
      `https://api.brightdata.com/serp/req?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`[Bright Data SERP] Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(
        `[Bright Data SERP] SERP API failed for "${query}": ${response.status} ${response.statusText}`
      );
      return { query, results: [] };
    }

    const data = await response.json();
    
    // Extract organic results from Bright Data SERP response
    const organic = data.organic || data.results || [];
    console.log(`[Bright Data SERP] Found ${organic.length} raw results. Processing...`);

    const results: SerpResult[] = organic.slice(0, 10).map(
      (r: Record<string, string>) => ({
        title: r.title || "",
        url: r.link || r.url || "",
        description: r.description || r.snippet || "",
      })
    );

    console.log(`[Bright Data SERP] Successfully parsed ${results.length} organic search results:`);
    results.forEach((r, idx) => {
      console.log(`  [Result #${idx + 1}] ${r.title} (${r.url})`);
    });

    return { query, results };
  } catch (error) {
    console.error(`[Bright Data SERP] SERP API error for "${query}":`, error);
    return { query, results: [] };
  }
}

// ─── Batch Helpers ──────────────────────────────────

export async function scrapeCompetitorPages(urls: string[]): Promise<ScrapeResult[]> {
  const results = await Promise.allSettled(urls.map((url) => scrapeUrl(url)));
  return results
    .filter((r): r is PromiseFulfilledResult<ScrapeResult> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function searchCompetitorNews(
  competitorName: string
): Promise<SerpResponse[]> {
  const queries = [
    `${competitorName} pricing changes 2025 2026`,
    `${competitorName} new features announcement`,
    `${competitorName} product update blog`,
    `${competitorName} hiring jobs engineering`,
  ];

  const results = await Promise.allSettled(
    queries.map((q) => searchSerp(q))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<SerpResponse> => r.status === "fulfilled")
    .map((r) => r.value);
}
