import { db, auditLogsTable } from "@workspace/db";
import { logger } from "./logger.js";

/**
 * Records an admin action for the activity log. Deliberately fire-and-forget
 * with its own error handling — a logging failure should never break the
 * actual request it's describing.
 */
export function logAudit(
  actorId: number | null,
  action: string,
  targetType?: string,
  targetId?: number,
  metadata?: Record<string, unknown>
) {
  db.insert(auditLogsTable)
    .values({ actorId, action, targetType: targetType ?? null, targetId: targetId ?? null, metadata: metadata ?? null })
    .catch((err) => logger.error({ err, action }, "Failed to write audit log"));
}
