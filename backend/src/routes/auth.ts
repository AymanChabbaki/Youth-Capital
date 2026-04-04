import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { createSession, destroySession, requireAuth, safeUser } from "../lib/session.js";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "ycc_salt_2024").digest("hex");
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: "none" as const,
  secure: true, // Required for sameSite: "none"
};

router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, fullNameAr, languagePreference } = req.body;
    if (!email || !password || !fullName) {
      res.status(400).json({ error: "BadRequest", message: "Missing required fields" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Email already registered" });
      return;
    }
    const passwordHash = hashPassword(password);
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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "BadRequest", message: "Missing credentials" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }
    if (user.status === "banned") {
      res.status(403).json({ error: "Forbidden", message: "Account is banned" });
      return;
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
