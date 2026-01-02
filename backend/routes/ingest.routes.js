import express from "express";
import { authDevice } from "../middleware/authDevice.js";
import { ingestLog } from "../controllers/ingest.controller.js";

const router = express.Router();

router.post("/log", authDevice, ingestLog);

export default router;
