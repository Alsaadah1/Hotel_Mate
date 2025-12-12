// server/scripts/seedOwner.js

import User from "../models/User.js";

const FIXED_OWNER_EMAIL = "admin@gmail.com";
const FIXED_OWNER_PASSWORD = "admin@123"; 
const FIXED_OWNER_NAME = "Hotel Owner";

export const seedOwnerIfNeeded = async () => {
  try {
    

    const existingOwner = await User.findOne({
      email: FIXED_OWNER_EMAIL,
      role: "owner",
    });

    if (existingOwner) {
      
      return;
    }

    const newOwner = await User.create({
      name: FIXED_OWNER_NAME,
      email: FIXED_OWNER_EMAIL,
      password: FIXED_OWNER_PASSWORD,
      role: "owner",
    });

    console.log("🎉 Fixed owner created successfully");
    console.log(`   Email: ${newOwner.email}`);
    console.log(`   Password: ${FIXED_OWNER_PASSWORD}`);
  } catch (err) {
    console.error("❌ Error in seedOwnerIfNeeded:", err);
  }
};
