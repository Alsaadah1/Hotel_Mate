// server/controllers/authController.js
import User from "../models/User.js";

const FIXED_OWNER_EMAIL = "admin@gmail.com";

// ✅ Public registration – only customer or fixed owner
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔐 Password must contain at least one special character
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (!specialCharRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character.",
      });
    }

    // ❌ Prevent manual owner registration except fixed email
    if (role === "owner" && email !== FIXED_OWNER_EMAIL) {
      return res.status(403).json({
        message: `Only one owner is allowed, and it must be ${FIXED_OWNER_EMAIL}`,
      });
    }

    // 🔎 Duplicate email check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Role rules:
    // - if role === "owner" and email == FIXED_OWNER_EMAIL → owner
    // - otherwise always "customer" (staff will be created from admin panel only)
    const finalRole =
      role === "owner" && email === FIXED_OWNER_EMAIL ? "owner" : "customer";

    const newUser = new User({
      name,
      email,
      password, // (plain as per your current setup)
      role: finalRole,
      isActive: true, // new field in schema
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Login – also checks isActive flag
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🚫 Block deactivated users (admin/staff/customer)
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account is inactive. Please contact the hotel admin.",
      });
    }

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
