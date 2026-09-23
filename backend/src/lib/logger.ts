import pino from "pino";
import { db, systemLogsTable } from "@workspace/db";

const isProduction = process.env.NODE_ENV === "production";

const REDACT = [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers['set-cookie']",
];

// Vercel's own runtime logs get truncated fast, especially on lower tiers —
// this persists warn/error entries to our own DB so they survive past that
// window. Wired in as a pino stream rather than sprinkled into route catch
// blocks, so every existing req.log.error(...)/logger.warn(...) call across
// the codebase is captured automatically, including future ones.
function dbStream() {
  return {
    write(chunk: string) {
      try {
        const record = JSON.parse(chunk.trim());
        const { level, msg, time, pid, hostname, ...context } = record;
        db.insert(systemLogsTable)
          .values({
            level: pino.levels.labels[level] ?? String(level),
            message: msg ?? "",
            context,
          })
          .catch((err) => {
            // Never let the logging pipeline recurse back through pino or
            // crash the process — fall back to a plain stderr write.
            console.error("Failed to persist system log:", err);
          });
      } catch {
        // Malformed/partial log line — drop it rather than crash.
      }
    },
  };
}

export const logger = isProduction
  ? pino(
      { level: process.env.LOG_LEVEL ?? "info", redact: REDACT },
      pino.multistream([
        { stream: process.stdout, level: process.env.LOG_LEVEL ?? "info" },
        { stream: dbStream(), level: "warn" },
      ]),
    )
  : pino({
      level: process.env.LOG_LEVEL ?? "info",
      redact: REDACT,
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    });
