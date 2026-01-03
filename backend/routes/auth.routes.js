import express from "express";
import { register, login, getMe, verifyEmail, googleLogin } from "../controllers/auth.controller.js";
import { authUser } from "../middleware/authUser.js";

const router = express.Router();

router.post("/register", register);
router.post("/google", googleLogin);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.get("/me", authUser, getMe);

export default router;
