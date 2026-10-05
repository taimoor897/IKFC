import express from "express";

import {
  createRFQ,
  getRFQs,
  getRFQ,
  getPublicRFQ,
  submitQuotation,
  deleteRFQ,
} from "../controllers/rfqController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================

// Get public RFQ
router.get(
  "/public/:id/:token",
  getPublicRFQ
);

// Submit public quotation
router.post(
  "/public/:id/:token",
  submitQuotation
);

// ============================================================
// AUTHENTICATED MANAGER ROUTES
// ============================================================

router.post(
  "/",
  authMiddleware,
  createRFQ
);

router.get(
  "/",
  authMiddleware,
  getRFQs
);

router.get(
  "/:id",
  authMiddleware,
  getRFQ
);

router.delete(
  "/:id",
  authMiddleware,
  deleteRFQ
);

export default router;