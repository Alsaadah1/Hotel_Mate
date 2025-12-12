// server/index.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import * as ENV from "./config.js";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";        // Rooms / inventory
import bookingRoutes from "./routes/bookingRoutes.js";  // Bookings
import userRoutes from "./routes/userRoutes.js";        // Users + staff management

// Seeder: ensure fixed owner account exists
import { seedOwnerIfNeeded } from "./scripts/seedOwner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// -------------------- CORS SETUP --------------------
const FRONTEND_ORIGIN = ENV.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// -------------------- STATIC FILES --------------------
app.use(
  "/assets/images",
  express.static(path.join(__dirname, "assets/images"))
);

// -------------------- API ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

// Simple root check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// -------------------- MONGODB CONNECTION --------------------
const dbUser = ENV.DB_USER;
const dbPassword = encodeURIComponent(ENV.DB_PASSWORD || "");
const dbCluster = ENV.DB_CLUSTER;
const dbName = ENV.DB_NAME;

const connectString = `mongodb+srv://${dbUser}:${dbPassword}@${dbCluster}/${dbName}?appName=Cluster0`;

mongoose
  .connect(connectString)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Seed owner only once
    await seedOwnerIfNeeded();

    const port = ENV.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`🌐 Allowed frontend origin: ${FRONTEND_ORIGIN}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message || err);
  });
