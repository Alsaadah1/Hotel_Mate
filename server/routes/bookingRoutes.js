// server/routes/bookingRoutes.js

import express from "express";
import {
  createBooking,
  getBookingsByCustomer,
  getBookingsByOwner,
} from "../controllers/bookingController.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// Create a confirmed booking (used from frontend checkout)
router.post("/", createBooking);

// Guest: see own bookings
router.get("/customer/:customerId", getBookingsByCustomer);

// Owner: see bookings for their rooms
router.get("/owner/:ownerId", getBookingsByOwner);

// Inline booking status update (e.g. Pending → Approved / Rejected)
router.put("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = req.body.status;
    await booking.save();

    res.json({ message: "Booking status updated successfully" });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
