// Post-build step: Vite/React SPA renders meta tags client-side via useSeo(),
// but the host serves the same static index.html for every route, so any
// crawler or tool reading the raw HTML response sees identical title/
// description on every page (duplicate metadata). This generates a
// dedicated index.html per route — both the fixed static routes and, by
// fetching the live article list at build time, one per press article too —
// with the correct title/meta/JSON-LD baked in. The SPA JS bundle is
// unchanged and still hydrates/handles client-side navigation normally.
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");
const SITE_URL = "https://www.youthcapital.org";
const API_URL = process.env.VITE_API_URL || "https://youth-capital-backend.vercel.app";

const PAGES = {
  "/about": {
    title: "About Youth Capital | Morocco's Youth Governance Simulation",
    description: "Learn how Youth Capital simulates the Moroccan Parliament, Ministries, and Regional Councils to give young Moroccans hands-on civic and leadership experience.",
    changefreq: "monthly",
    priority: "0.8",
  },
  "/press": {
    title: "Press & Reports | Youth Capital Morocco",
    description: "Read the latest briefings and reports from Youth Capital's simulated Moroccan Parliament, Ministries, and Regional Councils.",
    changefreq: "daily",
    priority: "0.8",
  },
  "/apply": {
    title: "Apply | Youth Capital Morocco",
    description: "Claim your seat in Youth Capital's Moroccan youth governance simulation as a Minister, MP, Regional Councillor, or Diaspora Representative.",
    changefreq: "monthly",
    priority: "0.9",
  },
  "/events": {
    title: "Events & Sessions | Youth Capital Morocco",
    description: "See upcoming parliamentary sessions, ministry briefings, and regional council meetings in Youth Capital's Moroccan youth governance simulation.",
    changefreq: "weekly",
    priority: "0.6",
  },
  "/polls": {
    title: "Civic Polls & Consultations | Youth Capital Morocco",
    description: "Vote on live civic consultations and legislative polls in Youth Capital's simulated Moroccan governance platform.",
    changefreq: "weekly",
    priority: "0.6",
  },
  "/rules": {
    title: "Simulation Rules | Youth Capital Morocco",
    description: "The official rulebook for Youth Capital's Moroccan youth governance simulation: membership, roles, conduct, and legislative procedure.",
    changefreq: "monthly",
    priority: "0.5",
  },
  "/privacy": {
    title: "Privacy Policy | Youth Capital Morocco",
    description: "How Youth Capital collects, uses, and protects your information on Morocco's youth governance simulation platform.",
    noindex: true,
  },
  "/support": {
    title: "Support | Youth Capital Morocco",
    description: "Get help with your Youth Capital account, simulation rules, or technical issues on Morocco's youth governance simulation platform.",
    changefreq: "monthly",
    priority: "0.4",
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

function stripJsonLd(html) {
  // Drop the default Organization/WebSite JSON-LD from index.html when a
  // page provides its own more specific block (e.g. NewsArticle), so we
  // don't ship two conflicting schema blocks on the same page.
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
}

function renderPage(template, { path, title, description, image, noindex, jsonLd }) {
  const url = `${SITE_URL}${path}`;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const robots = noindex ? "noindex, nofollow" : "index, follow";
  const absoluteImage = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image}`)
    : `${SITE_URL}/opengraph.jpg`;

  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${safeDescription}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${safeTitle}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${safeDescription}" />`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${absoluteImage}" />`)
    .replace(/<meta property="twitter:url" content="[^"]*"\s*\/>/, `<meta property="twitter:url" content="${url}" />`)
    .replace(/<meta property="twitter:title" content="[^"]*"\s*\/>/, `<meta property="twitter:title" content="${safeTitle}" />`)
    .replace(/<meta property="twitter:description" content="[^"]*"\s*\/>/, `<meta property="twitter:description" content="${safeDescription}" />`)
    .replace(/<meta property="twitter:image" content="[^"]*"\s*\/>/, `<meta property="twitter:image" content="${absoluteImage}" />`);

  if (jsonLd) {
    html = stripJsonLd(html);
    const script = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`;
    html = html.replace(/<\/head>/, script);
  }

  const outDir = join(distDir, path.slice(1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
}

function stripHtmlEntities(str) {
  return str.replace(/\s+/g, " ").trim();
}

async function fetchArticles() {
  try {
    const res = await fetch(`${API_URL}/api/press?limit=100`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.articles || [];
  } catch (err) {
    console.warn(`Could not fetch articles for static generation (${err.message}) — press articles will only get SEO metadata client-side for this deploy.`);
    return [];
  }
}

const template = readFileSync(join(distDir, "index.html"), "utf8");
const sitemapUrls = [
  { loc: SITE_URL + "/", changefreq: "weekly", priority: "1.0" },
];

for (const [path, meta] of Object.entries(PAGES)) {
  renderPage(template, { path, title: meta.title, description: meta.description, noindex: meta.noindex });
  console.log(`generated ${path}/index.html`);
  if (!meta.noindex) {
    sitemapUrls.push({ loc: SITE_URL + path, changefreq: meta.changefreq, priority: meta.priority });
  }
}

const articles = await fetchArticles();
for (const article of articles) {
  const path = `/press/${article.slug}`;
  const description = `${stripHtmlEntities(article.content).slice(0, 155)}…`;
  renderPage(template, {
    path,
    title: `${article.title} | Youth Capital Morocco`,
    description,
    image: article.thumbnailUrl,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.title,
      image: article.thumbnailUrl ? [article.thumbnailUrl] : undefined,
      datePublished: article.publishedAt,
      author: article.author?.fullName ? { "@type": "Person", name: article.author.fullName } : undefined,
      publisher: { "@type": "Organization", name: "Youth Capital", url: SITE_URL + "/" },
      mainEntityOfPage: SITE_URL + path,
    },
  });
  console.log(`generated ${path}/index.html`);
  sitemapUrls.push({ loc: SITE_URL + path, changefreq: "monthly", priority: "0.7" });
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ""}${u.priority ? `\n    <priority>${u.priority}</priority>` : ""}
  </url>`).join("\n")}
</urlset>
`;
writeFileSync(join(distDir, "sitemap.xml"), sitemapXml);
console.log(`generated sitemap.xml with ${sitemapUrls.length} URLs (${articles.length} articles)`);
