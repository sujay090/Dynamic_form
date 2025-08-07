import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiArror.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Generate tokens function (same as user controller)
export const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

export const login = asyncHandler(async (req, res) => {
  try {
    console.log("SuperAdmin login - Received body:", req.body);

    const { email, password } = req.body;

    if (!password || !email) {
      console.error("SuperAdmin login error: Email or password missing", { email, password });
      throw new ApiError(400, "Email and password required");
    }

    // First check if any users exist in database
    const totalUsers = await User.countDocuments();
    console.log("SuperAdmin login - Total users in database:", totalUsers);

    let user = null;
    let isEnvLogin = false;

    if (totalUsers === 0) {
      // No users in database, check against .env credentials
      console.log("🔧 SuperAdmin: No users found in database, checking .env credentials...");
      
      const envCredentials = [
        {
          email: process.env.SUPER_ADMIN_EMAIL,
          password: process.env.SUPER_ADMIN_PASSWORD,
          username: process.env.SUPER_ADMIN_USERNAME,
          role: "superadmin"
        },
        {
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          username: process.env.ADMIN_USERNAME,
          role: "admin"
        }
      ];

      const matchedCred = envCredentials.find(cred => 
        cred.email === email && cred.password === password
      );

      if (matchedCred) {
        console.log("✅ SuperAdmin: .env credentials matched, creating user in database...");
        
        // Create user in database
        user = await User.create({
          name: matchedCred.username,
          email: matchedCred.email,
          password: matchedCred.password,
          role: matchedCred.role
        });
        
        console.log("✅ SuperAdmin: User created in database:", user.name);
        isEnvLogin = true;
      }
    } else {
      // Users exist in database, check normally
      console.log("📋 SuperAdmin: Users found in database, checking credentials...");
      user = await User.findOne({ email });
    }

    if (!user) {
      console.error("SuperAdmin login error: User not found", { email });
      throw new ApiError(401, "Invalid credentials");
    }

    // Check if user has admin/superadmin role
    if (!['admin', 'superadmin'].includes(user.role)) {
      console.error("SuperAdmin login error: User not authorized", { email, role: user.role });
      throw new ApiError(403, "Access denied. Admin privileges required.");
    }

    // Check password
    const isPasswordCorrect = isEnvLogin ? true : await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      console.error("SuperAdmin login error: Invalid user credentials", { email });
      throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    console.log("✅ SuperAdmin login successful for:", loggedInUser.name, "Role:", loggedInUser.role);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
            token: accessToken // For compatibility with frontend
          },
          `${isEnvLogin ? 'First time login from .env - ' : ''}SuperAdmin logged in successfully`
        )
      );
  } catch (error) {
    console.error("SuperAdmin login error: ", error);
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      data: null,
      message: error.message || "Internal server error",
      errors: [error.message || error],
    });
  }
});