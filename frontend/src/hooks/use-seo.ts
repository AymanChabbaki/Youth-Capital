import { useEffect } from "react";

const SITE_URL = "https://www.youthcapital.org";
const DEFAULT_IMAGE = "/opengraph.jpg";

interface SeoOptions {
  /** Full <title> tag content — keep it under ~60 characters. */
  title: string;
  /** Meta description — aim for ~150-160 characters. */
  description: string;
  /** Root-relative path of the current route, e.g. "/about". */
  path: string;
  /** Root-relative or absolute OG/Twitter image. Defaults to the site's opengraph.jpg. */
  image?: string;
  /** Set true for pages that shouldn't be indexed (auth-gated, admin, utility pages). */
  noindex?: boolean;
  /** Optional schema.org structured data object to inject as JSON-LD. */
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets per-route document title, description, canonical, Open Graph/Twitter
 * tags, and optional JSON-LD. Needed because this is a client-rendered SPA
 * with a single static index.html — without this every route shares the
 * homepage's title/description in search results.
 */
export function useSeo({ title, description, path, image = DEFAULT_IMAGE, noindex = false, jsonLd }: SeoOptions) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : undefined;

  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", absoluteImage);
    upsertMeta("property", "twitter:title", title);
    upsertMeta("property", "twitter:description", description);
    upsertMeta("property", "twitter:url", url);
    upsertMeta("property", "twitter:image", absoluteImage);
    upsertLink("canonical", url);

    let script: HTMLScriptElement | null = null;
    if (jsonLdString) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = jsonLdString;
      document.head.appendChild(script);
    }

    return () => {
      if (script) document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, noindex, jsonLdString]);
}
