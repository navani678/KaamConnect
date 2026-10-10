import express from "express";
import { getJobMatches } from "../controllers/workers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

// GET /api/jobs/:id/matches
router.get("/:id/matches", requireAuth, getJobMatches);

export default router;
