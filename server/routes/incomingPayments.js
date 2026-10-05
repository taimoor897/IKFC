import express from "express";

import {
  createIncomingPayment,
  getIncomingPayments,
  getIncomingPayment,
  updateIncomingPayment,
  deleteIncomingPayment,
} from "../controllers/incomingPaymentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All incoming payment routes require authentication

router.use(authMiddleware);

router.post("/", createIncomingPayment);

router.get("/", getIncomingPayments);

router.get("/:id", getIncomingPayment);

router.put("/:id", updateIncomingPayment);

router.delete("/:id", deleteIncomingPayment);

export default router;