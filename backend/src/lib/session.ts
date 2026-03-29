import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

const sessions: Map<string, { userId: number; expiresAt: Date }> = new Map();

export function createSession(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  sessions.set(token, { userId, expiresAt });
  return token;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export function getSessionUserId(token: string): number | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    sessions.delete(token);
    return null;
  }
  return session.userId;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session || req.headers["x-session-token"];
  if (!token) {
    res.status(401).json({ error: "Unauthorized", message: "Please log in" });
    return;
  }
  const userId = getSessionUserId(String(token));
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
    const userId = getSessionUserId(String(token));
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
  const { passwordHash, ...rest } = user;
  return rest;
}
