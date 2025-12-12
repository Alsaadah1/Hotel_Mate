// server/routes/roomRoutes.js

import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  addRoom,
  getAllRooms,
  getManagerRooms,
  deleteRoom,
  updateRoom,
} from "../controllers/roomController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// ✅ store uploaded photos in /assets/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../assets/images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "room-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// POST /api/rooms  → create room (now also accepts capacity)
router.post("/", upload.single("photo"), addRoom);

// GET /api/rooms  → all rooms (for future use/admin)
router.get("/", getAllRooms);

// ⭐ GET /api/rooms/manager/:managerId  → rooms for this manager
router.get("/manager/:managerId", getManagerRooms);

// DELETE /api/rooms/:id  → delete room
router.delete("/:id", deleteRoom);

// PUT /api/rooms/:id  → update title/nightlyRate/summary/capacity
router.put("/:id", updateRoom);

export default router;
