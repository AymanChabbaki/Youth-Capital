import { Router } from "express";
import * as ideasController from "../controllers/ideas.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const ideasRouter = Router({ mergeParams: true });

// Mounted at /api/jihat/:jihaCode/ideas
ideasRouter.use(requireAuth);
ideasRouter.get("/board/submitted", ideasController.submittedBoard);
ideasRouter.get("/board/approved", ideasController.approvedBoard);
ideasRouter.post("/", ideasController.create);
ideasRouter.get("/:ideaId", ideasController.getOne);
