// server/controllers/userController.js

import User from "../models/User.js";

// ✅ Update only name (customer / staff profile)
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// ✅ Change password (plain comparison, no hashing)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password !== oldPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Error changing password" });
  }
};

/* ============================
   ADMIN / STAFF MANAGEMENT APIs
   Used by UserManagement.jsx
   ============================ */

// ✅ GET /api/users  – list all users (frontend filters to staff)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Error fetching users." });
  }
};

// ✅ POST /api/users/admin-create – admin creates STAFF user
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, isActive } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const user = await User.create({
      name,
      email,
      password,       // same plain pattern as rest of app
      role: "staff",  // 🔒 FORCE staff
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    const userToSend = user.toObject();
    delete userToSend.password;

    res.status(201).json({
      message: "Staff user created successfully.",
      user: userToSend,
    });
  } catch (err) {
    console.error("Admin create user error:", err);
    res.status(500).json({ message: "Error creating user." });
  }
};

// ✅ PUT /api/users/:id  – update staff name/email/isActive (role stays staff)
export const updateUser = async (req, res) => {
  try {
    const { name, email, isActive } = req.body;

    const update = {
      name,
      email,
      role: "staff", // keep as staff regardless of what comes from frontend
    };

    if (typeof isActive === "boolean") {
      update.isActive = isActive;
    }

    const updated = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Staff user updated successfully.", user: updated });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Error updating user." });
  }
};

// ✅ PATCH /api/users/:id/status  – toggle active/inactive
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: !!isActive },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: `User status updated to ${updated.isActive ? "active" : "inactive"}.`,
      user: updated,
    });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Error updating user status." });
  }
};
