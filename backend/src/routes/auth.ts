import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createSession, destroySession, requireAuth, safeUser } from "../lib/session.js";
import { hashPassword, verifyPassword, isLegacyHash } from "../lib/password.js";
import { validateBody } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const router: IRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(1).max(120),
  fullNameAr: z.string().trim().max(120).optional(),
  languagePreference: z.enum(["en", "ar"]).optional(),
});

const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(72),
});

const isProd = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  secure: isProd,
};

router.post("/register", authLimiter, validateBody(RegisterSchema), async (req, res) => {
  try {
    const { email, password, fullName, fullNameAr, languagePreference } = req.body;
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Email already registered" });
      return;
    }
    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      email,
      passwordHash,
      fullName,
      fullNameAr: fullNameAr || null,
      languagePreference: languagePreference || "en",
    }).returning();
    
    const token = await createSession(user.id);
    res.cookie("session", token, COOKIE_OPTIONS);
    res.status(201).json({ user: safeUser(user), token });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/login", authLimiter, validateBody(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }
    if (user.status === "banned") {
      res.status(403).json({ error: "Forbidden", message: "Account is banned" });
      return;
    }
    if (isLegacyHash(user.passwordHash)) {
      const upgraded = await hashPassword(password);
      await db.update(usersTable).set({ passwordHash: upgraded }).where(eq(usersTable.id, user.id));
    }

    const token = await createSession(user.id);
    res.cookie("session", token, COOKIE_OPTIONS);
    res.json({ user: safeUser(user), token });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies?.session || req.headers["x-session-token"];
  if (token) await destroySession(String(token));
  res.clearCookie("session", COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged out" });
});

router.get("/me", requireAuth, (req, res) => {
  res.json(safeUser((req as any).user));
});

export default router;
