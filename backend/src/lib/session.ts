import crypto from "crypto";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await db.insert(sessionsTable).values({
    token,
    userId,
    expiresAt,
  });
  
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
}

export async function getSessionUserId(token: string): Promise<number | null> {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.token, token),
        gt(sessionsTable.expiresAt, new Date())
      )
    );
    
  if (!session) return null;
  return session.userId;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session || req.headers["x-session-token"];
  if (!token) {
    res.status(401).json({ error: "Unauthorized", message: "Please log in" });
    return;
  }
  
  const userId = await getSessionUserId(String(token));
  if (!userId) {
    res.status(401).json({ error: "Unauthorized", message: "Session expired" });
    return;
  }
  
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.status === "banned") {
    res.status(401).json({ error: "Unauthorized", message: "Account not active" });
    return;
  }
  
  (req as any).user = user;
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.session || req.headers["x-session-token"];
  if (token) {
    const userId = await getSessionUserId(String(token));
    if (userId) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      if (user && user.status !== "banned") {
        (req as any).user = user;
      }
    }
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden", message: "Admin access required" });
    return;
  }
  next();
}

export function safeUser(user: any) {
  const { passwordHash, termsAcceptedAt, ...rest } = user;
  return rest;
}

const isProd = process.env.NODE_ENV === "production";
// Frontend and API live on different domains in production, so the session
// cookie must be SameSite=None (+ Secure) to be sent on credentialed fetches.
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  secure: isProd,
};

// Signs the user out everywhere — used after a password reset.
export async function destroyAllSessions(userId: number): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
}
