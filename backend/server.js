import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";

import authRoutes from "./routes/auth.routes.js";
import ingestRoutes from "./routes/ingest.routes.js";
import cradleRoutes from "./routes/cradle.routes.js";
import { initSocket } from "./config/webSocket.js";
import { createServer } from "node:http";


import notificationRoutes from "./routes/notification.routes.js";

const app = express();
const server = createServer(app);

initSocket(server);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-cradle-monitor.vercel.app",
    "https://smartcradle.up.railway.app",
    "https://smartcradle.vercel.app"
  ]
}));

app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/cradles", cradleRoutes);
app.use("/api/notifications", notificationRoutes);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
