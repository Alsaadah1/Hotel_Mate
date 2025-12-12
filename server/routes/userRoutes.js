// server/routes/userRoutes.js

import express from "express";
import {
  updateProfile,
  changePassword,
  getAllUsers,
  adminCreateUser,
  updateUser,
  updateUserStatus,
} from "../controllers/userController.js";

const router = express.Router();

// Profile + password (existing)
router.put("/:id/profile", updateProfile);
router.put("/:id/change-password", changePassword);

// Admin / staff management (used by UserManagement.jsx)
router.get("/", getAllUsers);
router.post("/admin-create", adminCreateUser);
router.put("/:id", updateUser);
router.patch("/:id/status", updateUserStatus);

export default router;
