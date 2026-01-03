import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { authUser } from "../middleware/authUser.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authUser, getMe);

export default router;
