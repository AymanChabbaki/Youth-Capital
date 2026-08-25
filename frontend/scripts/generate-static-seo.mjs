// Post-build step: Vite/React SPA renders meta tags client-side via useSeo(),
// but Vercel serves the same static index.html for every route, so any crawler
// or tool reading the raw HTML response sees identical title/description on
// every page (duplicate metadata). This generates a dedicated index.html per
// known static route with the correct title/meta baked in, so the server
// response itself is unique per page — the SPA JS bundle is unchanged and
// still hydrates/handles client-side navigation normally.
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");
const SITE_URL = "https://www.youthcapital.org";

const PAGES = {
  "/about": {
    title: "About Youth Capital | Morocco's Youth Governance Simulation",
    description: "Learn how Youth Capital simulates the Moroccan Parliament, Ministries, and Regional Councils to give young Moroccans hands-on civic and leadership experience.",
  },
  "/press": {
    title: "Press & Reports | Youth Capital",
    description: "Read the latest briefings and reports from Youth Capital's simulated Moroccan Parliament, Ministries, and Regional Councils.",
  },
  "/apply": {
    title: "Apply | Youth Capital",
    description: "Claim your seat in Youth Capital's Moroccan youth governance simulation as a Minister, MP, Regional Councillor, or Diaspora Representative.",
  },
  "/events": {
    title: "Events & Sessions | Youth Capital",
    description: "See upcoming parliamentary sessions, ministry briefings, and regional council meetings in Youth Capital's Moroccan youth governance simulation.",
  },
  "/polls": {
    title: "Civic Polls & Consultations | Youth Capital",
    description: "Vote on live civic consultations and legislative polls in Youth Capital's simulated Moroccan governance platform.",
  },
  "/rules": {
    title: "Simulation Rules | Youth Capital",
    description: "The official rulebook for Youth Capital's Moroccan youth governance simulation: membership, roles, conduct, and legislative procedure.",
  },
  "/privacy": {
    title: "Privacy Policy | Youth Capital",
    description: "How Youth Capital collects, uses, and protects your information on Morocco's youth governance simulation platform.",
    noindex: true,
  },
  "/support": {
    title: "Support | Youth Capital",
    description: "Get help with your Youth Capital account, simulation rules, or technical issues on Morocco's youth governance simulation platform.",
  },
  "/login": {
    title: "Log In | Youth Capital",
    description: "Log in to your Youth Capital account.",
    noindex: true,
  },
  "/dashboard": {
    title: "Dashboard | Youth Capital",
    description: "Your Youth Capital simulation dashboard.",
    noindex: true,
  },
  "/profile": {
    title: "My Profile | Youth Capital",
    description: "Manage your Youth Capital profile.",
    noindex: true,
  },
  "/community": {
    title: "Community | Youth Capital",
    description: "Discuss and debate with fellow delegates in the Youth Capital community.",
    noindex: true,
  },
  "/admin": {
    title: "Admin | Youth Capital",
    description: "Youth Capital platform administration.",
    noindex: true,
  },
};

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const template = readFileSync(join(distDir, "index.html"), "utf8");

for (const [path, meta] of Object.entries(PAGES)) {
  const url = `${SITE_URL}${path}`;
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const robots = meta.noindex ? "noindex, nofollow" : "index, follow";

  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="twitter:url" content="[^"]*"\s*\/>/, `<meta property="twitter:url" content="${url}" />`)
    .replace(/<meta property="twitter:title" content="[^"]*"\s*\/>/, `<meta property="twitter:title" content="${title}" />`)
    .replace(/<meta property="twitter:description" content="[^"]*"\s*\/>/, `<meta property="twitter:description" content="${description}" />`);

  const outDir = join(distDir, path.slice(1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  console.log(`generated ${path}/index.html`);
}
