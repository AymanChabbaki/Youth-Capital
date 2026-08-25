import express, { type Express } from "express";
import type { IncomingMessage, ServerResponse } from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { optionalAuth } from "./lib/session.js";
import { globalLimiter } from "./middlewares/rateLimit.js";

const app: Express = express();

const isProd = process.env.NODE_ENV === "production";
const DEV_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean);

if (isProd && !allowedOrigins?.length) {
  logger.warn("ALLOWED_ORIGINS is not set in production — cross-origin requests will be rejected.");
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: string | number }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (curl, server-to-server, same-origin) — allow.
      if (!origin) {
        callback(null, true);
        return;
      }
      const allowList = allowedOrigins?.length ? allowedOrigins : isProd ? [] : DEV_ORIGINS;
      // Omit CORS headers rather than throwing — the browser then blocks the
      // response from being read, without us leaking a stack trace via Express's
      // default error handler.
      callback(null, allowList.includes(origin));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use("/api", globalLimiter);
app.use(optionalAuth);

app.get("/", (req, res) => {
  res.json({
    status: "alive",
    message: "Simulation Governing API is active and resilient.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", router);

export default app;
