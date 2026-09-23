import { Router, type IRouter } from "express";
import { db, usersTable, roleApplicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createSession, destroySession, requireAuth, safeUser } from "../lib/session.js";
import { hashPassword, verifyPassword, isLegacyHash } from "../lib/password.js";
import { validateBody } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { optionalLinkedinUrl } from "../validation/common.js";
import { CreateApplicationSchema } from "./roles.js";

const router: IRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(1).max(120),
  fullNameAr: z.string().trim().max(120).optional(),
  languagePreference: z.enum(["en", "ar"]).optional(),
  phone: z.string().trim().min(6, "Phone number is required").max(30),
  linkedinUrl: optionalLinkedinUrl,
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the Rules and Privacy Policy to register",
  }),
});

// Registration + role application in one atomic request. The old flow called
// /register then POST /roles/applications as two separate requests — if
// anything interrupted the client between them (closed tab, dropped
// connection, mid-flow network error, which happens often on mobile), the
// user account was created with no application ever attached, and since the
// email was now taken, they couldn't even retry through the form. Wrapping
// both inserts in one transaction means it's both-or-neither.
const RegisterAndApplySchema = RegisterSchema.merge(CreateApplicationSchema);

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
    const { email, password, fullName, fullNameAr, languagePreference, phone, linkedinUrl } = req.body;
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
      phone: phone || null,
      linkedinUrl: linkedinUrl || null,
      termsAcceptedAt: new Date(),
    }).returning();
    
    const token = await createSession(user.id);
    res.cookie("session", token, COOKIE_OPTIONS);
    res.status(201).json({ user: safeUser(user), token });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/register-and-apply", authLimiter, validateBody(RegisterAndApplySchema), async (req, res) => {
  try {
    const {
      email, password, fullName, fullNameAr, languagePreference, phone, linkedinUrl,
      preferredRole, region, ministryPreference, parliamentHouse, motivation,
      gender, age, country, occupationStatus, fieldOfStudy, educationLevel, interests,
    } = req.body;

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);

    const { user, application } = await db.transaction(async (tx) => {
      const [user] = await tx.insert(usersTable).values({
        email,
        passwordHash,
        fullName,
        fullNameAr: fullNameAr || null,
        languagePreference: languagePreference || "en",
        phone,
        linkedinUrl: linkedinUrl || null,
        termsAcceptedAt: new Date(),
        applicationStatus: "pending",
      }).returning();

      const [application] = await tx.insert(roleApplicationsTable).values({
        userId: user.id,
        preferredRole,
        region,
        ministryPreference: ministryPreference || null,
        parliamentHouse: parliamentHouse || null,
        motivation,
        languagePreference: languagePreference || "en",
        gender: gender || null,
        age: age ?? null,
        country: country || null,
        occupationStatus: occupationStatus || null,
        fieldOfStudy: fieldOfStudy || null,
        educationLevel: educationLevel || null,
        interests: interests?.length ? interests.join(", ") : null,
      }).returning();

      return { user, application };
    });

    const token = await createSession(user.id);
    res.cookie("session", token, COOKIE_OPTIONS);
    res.status(201).json({ user: safeUser(user), application });
  } catch (err) {
    req.log.error({ err }, "Register and apply error");
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
