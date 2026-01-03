import express from "express";
import { authUser } from "../middleware/authUser.js";
import {
  getCradles,
  getLatestStatus,
  getHistory,
  createCradle,
  updateCradle,
  deleteCradle
} from "../controllers/cradle.controller.js";

const router = express.Router();

router.post("/", authUser, createCradle);
router.get("/", authUser, getCradles);
router.get("/:cradleId/latest", authUser, getLatestStatus);
router.get("/:cradleId/history", authUser, getHistory);
router.put("/:cradleId", authUser, updateCradle);
router.delete("/:cradleId", authUser, deleteCradle);

export default router;
