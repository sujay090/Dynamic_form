import { User } from "../models/user.model.js";

const initializeAdminUsers = async () => {
  try {
    console.log("🔧 Checking admin users initialization...");
    
    // Check if any admin users exist in database
    const adminUsersCount = await User.countDocuments({ 
      role: { $in: ["admin", "superadmin"] } 
    });
    
    console.log(`📊 Found ${adminUsersCount} admin users in database`);
    
    if (adminUsersCount > 0) {
      console.log("ℹ️ Admin users already exist in database, skipping initialization");
      return;
    }
    
    console.log("🚀 No admin users found, initializing from .env...");
    
    // Check if Super Admin exists
    const existingSuperAdmin = await User.findOne({ 
      $or: [
        { email: process.env.SUPER_ADMIN_EMAIL },
        { name: process.env.SUPER_ADMIN_USERNAME }
      ]
    });

    if (!existingSuperAdmin) {
      const superAdmin = new User({
        name: process.env.SUPER_ADMIN_USERNAME,
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
        role: "superadmin"
      });
      
      await superAdmin.save();
      console.log("✅ Super Admin created successfully:", {
        username: process.env.SUPER_ADMIN_USERNAME,
        email: process.env.SUPER_ADMIN_EMAIL,
        role: "superadmin"
      });
    } else {
      console.log("ℹ️ Super Admin already exists");
    }

    // Check if Admin exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: process.env.ADMIN_EMAIL },
        { name: process.env.ADMIN_USERNAME }
      ]
    });

    if (!existingAdmin) {
      const admin = new User({
        name: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: "admin"
      });
      
      await admin.save();
      console.log("✅ Admin created successfully:", {
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        role: "admin"
      });
    } else {
      console.log("ℹ️ Admin already exists");
    }

    console.log("🎉 Admin users initialization completed!");

  } catch (error) {
    console.error("❌ Error initializing admin users:", error);
  }
};

export { initializeAdminUsers };
