// Full indexing audit: checks real per-URL indexing status (via the URL
// Inspection API) and sitemap processing status, instead of guessing from
// searchanalytics data alone.
import { google } from "googleapis";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const SITE_URL = process.env.GSC_SITE_URL || "sc-domain:youthcapital.org";
const ORIGIN = "https://www.youthcapital.org";

const PAGES_TO_CHECK = [
  "/", "/about", "/press", "/apply", "/events", "/polls", "/rules", "/support",
];

async function main() {
  const keyPath = process.env.GSC_KEY_PATH || join(homedir(), ".config", "youthcapital-gsc", "service-account.json");
  const key = JSON.parse(readFileSync(keyPath, "utf8"));
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/webmasters"],
  });

  const sc = google.searchconsole({ version: "v1", auth });

  if (process.argv.includes("--resubmit-sitemap")) {
    await sc.sitemaps.submit({ siteUrl: SITE_URL, feedpath: `${ORIGIN}/sitemap.xml` });
    console.log(`Resubmitted ${ORIGIN}/sitemap.xml — this nudges Google to refetch it sooner, doesn't guarantee a crawl time.\n`);
  }

  console.log("=== SITEMAPS ===");
  const sitemaps = await sc.sitemaps.list({ siteUrl: SITE_URL });
  for (const s of sitemaps.data.sitemap || []) {
    console.log(`${s.path}`);
    console.log(`  last submitted: ${s.lastSubmitted} | last downloaded: ${s.lastDownloaded} | errors: ${s.errors} | warnings: ${s.warnings}`);
    for (const c of s.contents || []) {
      console.log(`  type=${c.type} submitted=${c.submitted} indexed=${c.indexed}`);
    }
  }

  console.log("\n=== PER-PAGE INDEXING STATUS ===");
  for (const path of PAGES_TO_CHECK) {
    const url = `${ORIGIN}${path}`;
    try {
      const res = await sc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl: SITE_URL },
      });
      const result = res.data.inspectionResult?.indexStatusResult;
      console.log(`${path.padEnd(12)} verdict=${result?.verdict} coverage=${result?.coverageState} lastCrawl=${result?.lastCrawlTime || "never"} canonical=${result?.googleCanonical}`);
    } catch (err: any) {
      console.log(`${path.padEnd(12)} ERROR: ${err?.response?.data?.error?.message || err.message}`);
    }
  }
}

main().catch((err) => {
  console.error("GSC audit failed:", err?.response?.data || err.message || err);
  process.exit(1);
});
