import type { Request } from "express";

// Where to send people back to after OAuth / in password-reset emails.
// FRONTEND_URL wins; otherwise the first ALLOWED_ORIGINS entry; otherwise prod.
export function frontendUrl(): string {
  const explicit = process.env.FRONTEND_URL?.trim();
  const fromOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean)[0];
  return (explicit || fromOrigins || "https://www.youthcapital.org").replace(/\/+$/, "");
}

// Public base URL of this API, used to build OAuth redirect URIs. Must match
// exactly what's registered with Google/LinkedIn, so PUBLIC_API_URL should be
// set in production; the request host is a fallback for local development.
export function apiBaseUrl(req: Request): string {
  const explicit = process.env.PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host")}`;
}
