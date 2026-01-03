import express from "express";
import { authUser } from "../middleware/authUser.js";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", authUser, getNotifications);
router.put("/:id/read", authUser, markAsRead);
router.put("/read-all", authUser, markAllAsRead);

export default router;
