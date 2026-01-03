import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";

import authRoutes from "./routes/auth.routes.js";
import ingestRoutes from "./routes/ingest.routes.js";
import cradleRoutes from "./routes/cradle.routes.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-cradle-monitor.vercel.app",
    "https://smartcradle.up.railway.app"
  ]
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/cradles", cradleRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
