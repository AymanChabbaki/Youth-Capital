import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { ideasRouter } from "./routes/ideas.routes";
import { collabRouter } from "./routes/collab.routes";

export const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/jihat/:jihaCode/ideas/:ideaId/collab-requests", collabRouter);
app.use("/api/jihat/:jihaCode/ideas", ideasRouter);

app.use(errorHandler);
