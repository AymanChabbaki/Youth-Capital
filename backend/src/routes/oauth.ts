import crypto from "crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authLimiter } from "../middlewares/rateLimit.js";
import { hashPassword } from "../lib/password.js";
import { createSession, SESSION_COOKIE_OPTIONS } from "../lib/session.js";
import { apiBaseUrl, frontendUrl } from "../lib/urls.js";
import { logAudit } from "../lib/audit.js";

// "Continue with Google / LinkedIn" via OpenID Connect (authorization code flow).
// Both providers return a verified email, which is how accounts are matched:
// an existing account with that email is signed in; otherwise a new account
// is created and sent to /apply to finish the membership application.

const router: IRouter = Router();

type Provider = "google" | "linkedin";

const PROVIDERS: Record<Provider, {
  authUrl: string; tokenUrl: string; userInfoUrl: string; scope: string; clientId?: string; clientSecret?: string;
}> = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid email profile",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userInfoUrl: "https://api.linkedin.com/v2/userinfo",
    scope: "openid profile email",
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
};

const isProvider = (p: string): p is Provider => p === "google" || p === "linkedin";
const isConfigured = (p: Provider) => Boolean(PROVIDERS[p].clientId && PROVIDERS[p].clientSecret);
const redirectUri = (req: Request, p: Provider) => `${apiBaseUrl(req)}/api/auth/oauth/${p}/callback`;

// The state cookie only has to survive the round trip to the provider and
// back, which is a top-level navigation to this API's own domain — so Lax works.
const STATE_COOKIE = "oauth_state";
const STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 10 * 60 * 1000,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth/oauth",
};

const fail = (res: Response, code: string) => res.redirect(`${frontendUrl()}/login?oauth_error=${encodeURIComponent(code)}`);

// Which buttons the login page should show.
router.get("/oauth/providers", (_req, res) => {
  res.json({ google: isConfigured("google"), linkedin: isConfigured("linkedin") });
});

router.get("/oauth/:provider", authLimiter, (req, res) => {
  const provider = String(req.params.provider);
  if (!isProvider(provider) || !isConfigured(provider)) {
    fail(res, "provider_unavailable");
    return;
  }
  const lang = req.query.lang === "ar" ? "ar" : "en";
  const nonce = crypto.randomBytes(24).toString("hex");
  // The state carries the language so new accounts get the right default.
  const state = `${nonce}.${lang}`;
  res.cookie(STATE_COOKIE, nonce, STATE_COOKIE_OPTIONS);

  const cfg = PROVIDERS[provider];
  const params = new URLSearchParams({
    response_type: "code",
    client_id: cfg.clientId!,
    redirect_uri: redirectUri(req, provider),
    scope: cfg.scope,
    state,
  });
  if (provider === "google") params.set("prompt", "select_account");
  res.redirect(`${cfg.authUrl}?${params.toString()}`);
});

router.get("/oauth/:provider/callback", async (req, res) => {
  const provider = String(req.params.provider);
  if (!isProvider(provider) || !isConfigured(provider)) {
    fail(res, "provider_unavailable");
    return;
  }
  try {
    if (req.query.error) {
      // e.g. the user pressed "Cancel" on the consent screen.
      fail(res, "cancelled");
      return;
    }
    const code = String(req.query.code || "");
    const [nonce, lang = "en"] = String(req.query.state || "").split(".");
    const expected = req.cookies?.[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE, { ...STATE_COOKIE_OPTIONS, maxAge: undefined });
    if (!code || !nonce || !expected || nonce.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(nonce), Buffer.from(expected))) {
      fail(res, "invalid_state");
      return;
    }

    const cfg = PROVIDERS[provider];
    const tokenRes = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri(req, provider),
        client_id: cfg.clientId!,
        client_secret: cfg.clientSecret!,
      }),
    });
    const tokens: any = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokens.access_token) {
      req.log.error({ provider, status: tokenRes.status, error: tokens.error }, "OAuth token exchange failed");
      fail(res, "token_exchange_failed");
      return;
    }

    const infoRes = await fetch(cfg.userInfoUrl, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const info: any = await infoRes.json().catch(() => ({}));
    const email = typeof info.email === "string" ? info.email.trim().toLowerCase() : "";
    // Only trust an email the provider has verified — otherwise anyone could
    // claim someone else's address and take over their account.
    const verified = info.email_verified === true || info.email_verified === "true";
    if (!infoRes.ok || !email || !verified) {
      fail(res, "email_not_verified");
      return;
    }

    let [user] = await db.select().from(usersTable).where(sql`lower(${usersTable.email}) = ${email}`);
    let isNew = false;
    if (user && user.status === "banned") {
      fail(res, "banned");
      return;
    }
    if (!user) {
      const fullName = String(info.name || [info.given_name, info.family_name].filter(Boolean).join(" ") || email.split("@")[0]).slice(0, 120);
      // No password yet: a random one nobody knows. They can set a real one
      // later with "Forgot password", or keep using social sign-in.
      const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
      [user] = await db.insert(usersTable).values({
        email,
        passwordHash,
        fullName,
        languagePreference: lang === "ar" ? "ar" : "en",
        avatarUrl: typeof info.picture === "string" ? info.picture : null,
        applicationStatus: "none",
      }).returning();
      isNew = true;
    } else if (!user.avatarUrl && typeof info.picture === "string") {
      await db.update(usersTable).set({ avatarUrl: info.picture }).where(eq(usersTable.id, user.id));
    }

    logAudit(user.id, isNew ? "auth.oauth_signup" : "auth.oauth_login", "user", user.id, { provider });
    const session = await createSession(user.id);
    res.cookie("session", session, SESSION_COOKIE_OPTIONS);

    // New (or never-applied) accounts finish the membership application;
    // everyone else lands where a normal login would take them.
    const dest = user.role === "admin" ? "/admin"
      : user.applicationStatus === "none" ? `/apply?oauth=${provider}`
      : "/dashboard";
    res.redirect(`${frontendUrl()}${dest}`);
  } catch (err) {
    req.log.error({ err, provider }, "OAuth callback error");
    fail(res, "server_error");
  }
});

export default router;
