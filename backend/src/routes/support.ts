import { Router, type IRouter } from "express";
import { db, supportTicketsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireAdmin, safeUser } from "../lib/session.js";
import { validateBody } from "../middlewares/validate.js";

const router: IRouter = Router();

const TICKET_CATEGORIES = ["technical", "rules", "account", "other"] as const;
const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

const CreateTicketSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  category: z.enum(TICKET_CATEGORIES).optional(),
});

const UpdateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES),
  adminResponse: z.string().trim().max(5000).optional(),
});

router.get("/tickets", requireAuth, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    let tickets;
    if (currentUser.role === "admin") {
      tickets = await db.select().from(supportTicketsTable);
    } else {
      tickets = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.userId, currentUser.id));
    }
    const withUsers = await Promise.all(
      tickets.map(async (t: any) => {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, t.userId));
        return { ...t, user: safeUser(user) };
      })
    );
    res.json({ tickets: withUsers, total: withUsers.length });
  } catch (err: any) {
    req.log.error({ err }, "Get tickets error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/tickets", requireAuth, validateBody(CreateTicketSchema), async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { subject, message, category } = req.body;
    const [ticket] = await db.insert(supportTicketsTable).values({
      userId: currentUser.id,
      subject,
      message,
      category: category || "other",
    }).returning();
    res.status(201).json({ ...ticket, user: safeUser(currentUser) });
  } catch (err: any) {
    req.log.error({ err }, "Create ticket error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.patch("/tickets/:id", requireAuth, requireAdmin, validateBody(UpdateTicketSchema), async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const targetIdString = String(req.params.id);
    const [ticket] = await db
      .update(supportTicketsTable)
      .set({ status, adminResponse: adminResponse || null, updatedAt: new Date() })
      .where(eq(supportTicketsTable.id, parseInt(targetIdString)))
      .returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, ticket.userId));
    res.json({ ...ticket, user: safeUser(user) });
  } catch (err: any) {
    req.log.error({ err }, "Update ticket error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
