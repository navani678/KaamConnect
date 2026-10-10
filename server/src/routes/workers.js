import express from "express";
import {
  getMe,
  updateMe,
  addPortfolioItem,
  deletePortfolioItem,
  updateAvailability,
  getWorkerById,
  getWorkerReviews,
  listWorkers
} from "../controllers/workers.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public worker discovery & profile
router.get("/", listWorkers);
router.get("/:id", getWorkerById);
router.get("/:id/reviews", getWorkerReviews);

// Worker authenticated routes
router.get("/me", requireAuth, requireRole("worker", "admin"), getMe);
router.put("/me", requireAuth, requireRole("worker", "admin"), updateMe);
router.post(
  "/me/portfolio",
  requireAuth,
  requireRole("worker", "admin"),
  addPortfolioItem
);
router.delete(
  "/me/portfolio/:itemId",
  requireAuth,
  requireRole("worker", "admin"),
  deletePortfolioItem
);
router.patch(
  "/me/availability",
  requireAuth,
  requireRole("worker", "admin"),
  updateAvailability
);

export default router;
