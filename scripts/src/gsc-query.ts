// Query the Google Search Console API directly instead of screenshotting the
// dashboard. Auth is via a service account key that must live OUTSIDE this
// repo (never commit it) — granted access under Search Console > Settings >
// Users and permissions.
//
// Usage:
//   npm run gsc -- --dimensions=query --days=28 --limit=25
//   npm run gsc -- --dimensions=page --days=90 --limit=50
//   npm run gsc -- --dimensions=query,page --days=7
//
// Env vars:
//   GSC_KEY_PATH   path to the service account JSON key
//                  (default: ~/.config/youthcapital-gsc/service-account.json)
//   GSC_SITE_URL   the exact property as registered in Search Console
//                  (default: sc-domain:youthcapital.org)
import { google } from "googleapis";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

function parseArgs() {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return {
    dimensions: (args.dimensions || "query").split(","),
    days: parseInt(args.days || "28", 10),
    limit: parseInt(args.limit || "25", 10),
  };
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const { dimensions, days, limit } = parseArgs();
  const keyPath = process.env.GSC_KEY_PATH || join(homedir(), ".config", "youthcapital-gsc", "service-account.json");
  const siteUrl = process.env.GSC_SITE_URL || "sc-domain:youthcapital.org";

  const key = JSON.parse(readFileSync(keyPath, "utf8"));
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const searchconsole = google.searchconsole({ version: "v1", auth });

  const startDate = isoDaysAgo(days);
  const endDate = isoDaysAgo(1); // GSC data usually lags ~1-2 days

  console.log(`Querying ${siteUrl} | ${startDate} to ${endDate} | dimensions=${dimensions.join(",")}\n`);

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit: limit,
    },
  });

  const rows = res.data.rows || [];
  if (rows.length === 0) {
    console.log("No data returned — either no traffic in this range, or the service account doesn't have access to this property yet.");
    return;
  }

  console.log(`${"Keys".padEnd(50)} Clicks  Impr.  CTR     Pos`);
  for (const row of rows) {
    const keys = (row.keys || []).join(" | ");
    const clicks = String(row.clicks ?? 0).padStart(6);
    const impressions = String(row.impressions ?? 0).padStart(6);
    const ctr = `${((row.ctr ?? 0) * 100).toFixed(1)}%`.padStart(7);
    const position = (row.position ?? 0).toFixed(1).padStart(5);
    console.log(`${keys.slice(0, 50).padEnd(50)} ${clicks} ${impressions} ${ctr} ${position}`);
  }
}

main().catch((err) => {
  console.error("GSC query failed:", err?.response?.data || err.message || err);
  process.exit(1);
});
