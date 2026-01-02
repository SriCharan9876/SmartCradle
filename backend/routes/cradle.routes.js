import express from "express";
import { authUser } from "../middleware/authUser.js";
import {
  getCradles,
  getLatestStatus,
  getHistory
} from "../controllers/cradle.controller.js";

const router = express.Router();

router.get("/", authUser, getCradles);
router.get("/:cradleId/latest", authUser, getLatestStatus);
router.get("/:cradleId/history", authUser, getHistory);

export default router;
