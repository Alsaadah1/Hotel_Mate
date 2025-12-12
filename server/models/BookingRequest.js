import mongoose from "mongoose";

const bookingRequestSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  stayDuration: { type: String, required: true },            // e.g. "2 Nights"
  status: { type: String, default: "pending" },

  totalCost: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("BookingRequest", bookingRequestSchema);
