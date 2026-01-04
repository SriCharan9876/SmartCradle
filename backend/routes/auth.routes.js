import express from "express";
import { register, login, getMe, verifyEmail, googleLogin, updateProfile, sendSecurityOTP, verifySecurityOTP, changePassword, deleteAccount } from "../controllers/auth.controller.js";
import { authUser } from "../middleware/authUser.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/register", register);
router.post("/google", googleLogin);
router.post("/verify-email", upload.single('profileImage'), verifyEmail);
router.post("/login", login);
router.get("/me", authUser, getMe);
router.put("/update", authUser, upload.single('profileImage'), updateProfile);

router.post("/send-otp-security", authUser, sendSecurityOTP);
router.post("/verify-otp-security", authUser, verifySecurityOTP);
router.put("/change-password", authUser, changePassword);
router.delete("/delete-account", authUser, deleteAccount);

export default router;
