import { Router } from "express";
import * as collabController from "../controllers/collab.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const collabRouter = Router({ mergeParams: true });

// Mounted at /api/jihat/:jihaCode/ideas/:ideaId/collab-requests
collabRouter.use(requireAuth);
collabRouter.post("/", collabController.request);
collabRouter.patch("/:requestId", collabController.decide);
