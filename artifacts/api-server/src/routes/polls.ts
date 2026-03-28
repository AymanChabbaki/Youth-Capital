import { Router, type IRouter } from "express";
import { db, pollsTable, pollOptionsTable, pollVotesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/session.js";

const router: IRouter = Router();

async function formatPoll(poll: any, userId?: number) {
  const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, poll.id));
  let userVote: string | null = null;
  if (userId) {
    const [vote] = await db
      .select()
      .from(pollVotesTable)
      .where(and(eq(pollVotesTable.pollId, poll.id), eq(pollVotesTable.userId, userId)));
    if (vote) userVote = vote.optionKey;
  }
  const totalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0);
  return {
    ...poll,
    options: options.map((o) => ({
      id: o.optionKey,
      label: o.label,
      labelAr: o.labelAr,
      votes: o.votes,
      percentage: totalVotes > 0 ? Math.round(((o.votes || 0) / totalVotes) * 100) : 0,
    })),
    totalVotes,
    userVote,
  };
}

router.get("/", async (req, res) => {
  try {
    const polls = await db.select().from(pollsTable);
    const currentUser = (req as any).user;
    const formatted = await Promise.all(polls.map((p) => formatPoll(p, currentUser?.id)));
    res.json({ polls: formatted });
  } catch (err) {
    req.log.error({ err }, "Get polls error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { title, titleAr, description, options, endsAt } = req.body;
    const [poll] = await db.insert(pollsTable).values({
      title,
      titleAr,
      description: description || null,
      endsAt: endsAt ? new Date(endsAt) : null,
      createdById: currentUser.id,
    }).returning();
    for (let i = 0; i < options.length; i++) {
      await db.insert(pollOptionsTable).values({
        pollId: poll.id,
        optionKey: `opt_${i + 1}`,
        label: options[i].label,
        labelAr: options[i].labelAr,
      });
    }
    const formatted = await formatPoll(poll, currentUser.id);
    res.status(201).json(formatted);
  } catch (err) {
    req.log.error({ err }, "Create poll error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/:id/vote", requireAuth, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const pollId = parseInt(req.params.id);
    const { optionId } = req.body;
    const [existingVote] = await db
      .select()
      .from(pollVotesTable)
      .where(and(eq(pollVotesTable.pollId, pollId), eq(pollVotesTable.userId, currentUser.id)));
    if (existingVote) {
      res.status(409).json({ error: "Conflict", message: "Already voted" });
      return;
    }
    const [option] = await db
      .select()
      .from(pollOptionsTable)
      .where(and(eq(pollOptionsTable.pollId, pollId), eq(pollOptionsTable.optionKey, optionId)));
    if (!option) {
      res.status(404).json({ error: "NotFound", message: "Option not found" });
      return;
    }
    await db.insert(pollVotesTable).values({ pollId, userId: currentUser.id, optionKey: optionId });
    await db
      .update(pollOptionsTable)
      .set({ votes: (option.votes || 0) + 1 })
      .where(eq(pollOptionsTable.id, option.id));
    const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.id, pollId));
    const formatted = await formatPoll(poll, currentUser.id);
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Cast vote error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
