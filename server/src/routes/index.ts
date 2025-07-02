import { Router } from "express";
import workerRoutes from "./worker";
import emailRoutes from "./email";
import statsRoutes from "./stats";

const router = Router();

router.use("/worker", workerRoutes);
router.use("/email", emailRoutes);
router.use("/stats", statsRoutes);

export default router;
