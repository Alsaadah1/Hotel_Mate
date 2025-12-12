// server/routes/bookingRequestRoutes.js

import express from "express";
import {
  createBookingRequest,
  getOwnerBookingRequests,
  updateBookingRequestStatus,
} from "../controllers/bookingRequestController.js";

const router = express.Router();

// Create booking request (by guest)
router.post("/", createBookingRequest);

// Fetch all booking requests for a specific owner (hotel owner)
router.get("/owner/:ownerId", getOwnerBookingRequests);

// Update booking request status (approve / reject)
router.put("/:id", updateBookingRequestStatus);

export default router;
