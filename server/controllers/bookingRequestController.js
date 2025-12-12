// server/models/BookingRequest.js
import mongoose from "mongoose";

const bookingRequestSchema = new mongoose.Schema({
  // Which room the guest wants
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },

  // Guest who is requesting the booking
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Manager/owner of the room
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Stay dates
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },

  // Full price for the requested stay
  totalAmount: {
    type: Number,
    required: true,
  },

  // pending → approved → rejected / cancelled
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("BookingRequest", bookingRequestSchema);
