// server/controllers/roomController.js

import Room from "../models/Room.js";

// Add new room
export const addRoom = async (req, res) => {
  try {
    const { title, nightlyRate, summary, managerId, capacity } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No room photo uploaded" });
    }

    let numericCapacity;
    if (capacity !== undefined) {
      numericCapacity = Number(capacity);
      if (Number.isNaN(numericCapacity) || numericCapacity < 1) {
        return res
          .status(400)
          .json({ message: "Capacity must be a positive number" });
      }
    }

    const newRoom = new Room({
      title,
      nightlyRate,
      summary,
      photo: req.file.filename, // multer filename
      managerId,
      ...(numericCapacity ? { capacity: numericCapacity } : {}),
    });

    await newRoom.save();
    res
      .status(201)
      .json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    console.error("addRoom error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ rooms belonging to one manager
export const getManagerRooms = async (req, res) => {
  try {
    const managerId = req.params.managerId;
    const rooms = await Room.find({ managerId }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    console.error("getManagerRooms error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// All rooms (optional / for admin)
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    console.error("getAllRooms error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    await Room.findByIdAndDelete(roomId);
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("deleteRoom error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { title, nightlyRate, summary, capacity } = req.body;

    const updateData = { title, nightlyRate, summary };

    if (capacity !== undefined) {
      const numericCapacity = Number(capacity);
      if (Number.isNaN(numericCapacity) || numericCapacity < 1) {
        return res
          .status(400)
          .json({ message: "Capacity must be a positive number" });
      }
      updateData.capacity = numericCapacity;
    }

    const updated = await Room.findByIdAndUpdate(roomId, updateData, {
      new: true,
    });

    res.json({ message: "Room updated successfully", room: updated });
  } catch (error) {
    console.error("updateRoom error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
