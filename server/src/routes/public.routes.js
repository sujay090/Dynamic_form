import { Router } from "express";
import { getPublicStatistics } from "../controllers/public.controller.js";

const router = Router();

// Public routes - no authentication required
router.get("/statistics", getPublicStatistics);

export default router;
