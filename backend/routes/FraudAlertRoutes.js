import express from "express";
import {
  getFraudAlerts,
  createFraudAlert,
} from "../controllers/FraudAlertController.js";

const router = express.Router();

router.get("/", getFraudAlerts);
router.post("/", createFraudAlert);

export default router;
