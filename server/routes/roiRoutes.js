import express from "express";

import {
  getProjectROI
} from "../controllers/roiController.js";


const router = express.Router();


router.get(
  "/:projectId",
  getProjectROI
);


export default router;