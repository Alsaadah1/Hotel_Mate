// server/controllers/bookingController.js

import Booking from "../models/Booking.js";
import User from "../models/User.js";

// Create a booking
export const createBooking = async (req, res) => {
  try {
    const {
      // old rental fields
      equipmentId,
      equipmentName,
      rentalDuration,

      // new hotel fields
      roomId,
      roomName,
      stayDuration,

      image,
      ownerId,
      customerId,
      totalCost,

      // dates + guests
      checkInDate,
      checkOutDate,
      guestCount,

      // 🔹 payment fields (demo only)
      cardNumber,
      walletNumber,
    } = req.body;

    const finalRoomId = roomId || equipmentId;
    const finalRoomName = roomName || equipmentName;
    const finalStayDuration =
      stayDuration ||
      rentalDuration ||
      (checkInDate && checkOutDate
        ? `${checkInDate} to ${checkOutDate}`
        : null);

    const start = checkInDate ? new Date(checkInDate) : null;
    const end = checkOutDate ? new Date(checkOutDate) : null;

    if (
      !finalRoomId ||
      !ownerId ||
      !customerId ||
      !finalStayDuration ||
      totalCost == null ||
      !start ||
      !end ||
      !guestCount
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid check-in or check-out date" });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date" });
    }

    if (guestCount <= 0) {
      return res
        .status(400)
        .json({ message: "Guest count must be at least 1" });
    }

    // prevent overlapping bookings for same room
    const overlappingBooking = await Booking.findOne({
      roomId: finalRoomId,
      status: { $ne: "Rejected" },
      checkInDate: { $lt: end },
      checkOutDate: { $gt: start },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: "Room is already booked for the selected dates",
      });
    }

    const newBooking = new Booking({
      roomId: finalRoomId,
      roomName: finalRoomName,
      image,
      ownerId,
      customerId,
      stayDuration: finalStayDuration,
      totalCost,
      bookingDate: new Date(),
      status: "Pending",
      checkInDate: start,
      checkOutDate: end,
      guestCount,
      // 🔹 store payment info
      cardNumber: cardNumber || null,
      walletNumber: walletNumber || null,
    });

    await newBooking.save();

    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Guest: get bookings by customer
export const getBookingsByCustomer = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerId: req.params.customerId,
    }).sort({ bookingDate: -1 }); // use bookingDate from schema

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Owner/Manager: get bookings by owner
export const getBookingsByOwner = async (req, res) => {
  try {
    const bookings = await Booking.find({
      ownerId: req.params.ownerId,
    }).sort({ bookingDate: -1 });

    // Attach customer names
    const bookingsWithCustomerNames = await Promise.all(
      bookings.map(async (booking) => {
        const customer = await User.findById(booking.customerId).select("name");
        return {
          ...booking._doc,
          customerName: customer ? customer.name : "Unknown",
        };
      })
    );

    res.json(bookingsWithCustomerNames);
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};
