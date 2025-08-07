#!/usr/bin/env node

import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";

// Load environment variables
dotenv.config({
  path: "./.env",
});

const resetAdminUsers = async () => {
  try {
    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🗑️ Removing all admin users from database...");
    
    // Remove all admin and superadmin users
    const deleteResult = await User.deleteMany({ 
      role: { $in: ["admin", "superadmin"] } 
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} admin users`);
    
    // Show remaining users
    const remainingUsers = await User.find().select("-password -refreshToken");
    console.log("\n📋 Remaining Users in Database:");
    if (remainingUsers.length === 0) {
      console.log("  - No users found (database is clean)");
    } else {
      remainingUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
    
    console.log("\n🎉 Admin users reset completed!");
    console.log("💡 Next login will use .env credentials and create users in database");

  } catch (error) {
    console.error("❌ Error resetting admin users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the script
resetAdminUsers();
