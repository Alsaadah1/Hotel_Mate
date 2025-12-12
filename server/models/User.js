// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 🔹 Roles: customer (default), owner (admin), staff
    role: {
      type: String,
      enum: ["customer", "owner", "staff"],
      default: "customer",
    },

    // 🔹 Used to block login if deactivated by admin
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
