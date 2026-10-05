import express from "express";
import {
  createWorkerInvoice
} from "../controllers/workerInvoiceController.js";


const router = express.Router();


router.post(
  "/",
  createWorkerInvoice
);


export default router;