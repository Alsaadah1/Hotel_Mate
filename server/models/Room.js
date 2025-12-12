// server/models/Room.js
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  // Hotel-friendly fields
  title: { type: String, required: true }, // e.g. "Deluxe King Room"
  nightlyRate: { type: Number, required: true }, // price per night
  summary: { type: String, required: true }, // short description
  photo: { type: String, required: true }, // uploaded filename from multer

  // NEW: how many guests this room supports
  capacity: {
    type: Number,
    min: 1,
    default: 2, // safe default for old records
  },

  // Which manager owns this room
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Room", roomSchema);
