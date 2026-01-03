import express from "express";
import { authUser } from "../middleware/authUser.js";
import {
  getCradles,
  getLatestStatus,
  getHistory,
  createCradle,
  updateCradle
} from "../controllers/cradle.controller.js";

const router = express.Router();

router.post("/", authUser, createCradle);
router.get("/", authUser, getCradles);
router.get("/:cradleId/latest", authUser, getLatestStatus);
router.get("/:cradleId/history", authUser, getHistory);
router.put("/:cradleId", authUser, updateCradle);

export default router;
