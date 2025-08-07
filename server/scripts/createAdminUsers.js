#!/usr/bin/env node

import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";

// Load environment variables
dotenv.config({
  path: "./.env",
});

const createAdminUsers = async () => {
  try {
    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🔧 Creating/Updating admin users...");
    
    // Create or Update Super Admin
    const superAdminData = {
      name: process.env.SUPER_ADMIN_USERNAME,
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
      role: "superadmin"
    };

    const superAdmin = await User.findOneAndUpdate(
      { 
        $or: [
          { email: process.env.SUPER_ADMIN_EMAIL },
          { name: process.env.SUPER_ADMIN_USERNAME }
        ]
      },
      superAdminData,
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    );

    console.log("✅ Super Admin created/updated:", {
      id: superAdmin._id,
      username: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role
    });

    // Create or Update Admin
    const adminData = {
      name: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin"
    };

    const admin = await User.findOneAndUpdate(
      { 
        $or: [
          { email: process.env.ADMIN_EMAIL },
          { name: process.env.ADMIN_USERNAME }
        ]
      },
      adminData,
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    );

    console.log("✅ Admin created/updated:", {
      id: admin._id,
      username: admin.name,
      email: admin.email,
      role: admin.role
    });

    console.log("🎉 Admin users setup completed successfully!");

    // List all admin users
    const allAdmins = await User.find({ role: { $in: ["admin", "superadmin"] } }).select("-password -refreshToken");
    console.log("\n📋 Current Admin Users:");
    allAdmins.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error("❌ Error creating admin users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the script
createAdminUsers();
