import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import rolesRouter from "./roles.js";
import communityRouter from "./community.js";
import pollsRouter from "./polls.js";
import pressRouter from "./press.js";
import eventsRouter from "./events.js";
import supportRouter from "./support.js";
import crisesRouter from "./crises.js";
import statsRouter from "./stats.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/roles", rolesRouter);
router.use("/community", communityRouter);
router.use("/polls", pollsRouter);
router.use("/press", pressRouter);
router.use("/events", eventsRouter);
router.use("/support", supportRouter);
router.use("/crises", crisesRouter);
router.use("/stats", statsRouter);

export default router;
