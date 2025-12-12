// server/models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  roomName: { type: String, required: true },
  image: { type: String, required: true },

  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  stayDuration: { type: String, required: true },

  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guestCount: { type: Number, required: true, min: 1 },

  totalCost: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },

  // 🔹 Store simple payment details for this demo
  cardNumber: { type: String },
  walletNumber: { type: String },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

bookingSchema.index({ roomId: 1, checkInDate: 1, checkOutDate: 1 });

export default mongoose.model("Booking", bookingSchema);
