import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ObjectId } from "mongoose";
import jwt from "jsonwebtoken";

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

const register = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const filename = req.file?.filename || null;
    if ([name, email, password, role].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
    const existeduser = await User.findOne({ email });
    if (existeduser) {
      throw new ApiError(400, "User already exists");
    }

    let avatar;
    if (filename) {
      avatar = `${req.protocol}://${req.get("host")}/assets/${filename}`;
    } else {
      avatar = "";
    }

    const user = await User.create({ name, email, password, role, avatar });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Somthing went wrong while creating user");
    }
    // check for user creation
    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User created successfully"));
  } catch (error) {
    console.error("Register error: ", error);
    return res.status(500).json({
      statusCode: 500,
      data: null,
      errors: [error.message || error],
    });
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const { email, password } = req.body;

    if (!password || !email) {
      console.error("Login error: Email or password missing", { email, password });
      throw new ApiError(400, "Email and password required");
    }

    // First check if any users exist in database
    const totalUsers = await User.countDocuments();
    console.log("Total users in database:", totalUsers);

    let user = null;
    let isEnvLogin = false;

    if (totalUsers === 0) {
      // No users in database, check against .env credentials
      console.log("🔧 No users found in database, checking .env credentials...");
      
      const envCredentials = [
        {
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          username: process.env.ADMIN_USERNAME,
          role: "admin"
        },
        {
          email: process.env.SUPER_ADMIN_EMAIL,
          password: process.env.SUPER_ADMIN_PASSWORD,
          username: process.env.SUPER_ADMIN_USERNAME,
          role: "superadmin"
        }
      ];

      const matchedCred = envCredentials.find(cred => 
        cred.email === email && cred.password === password
      );

      if (matchedCred) {
        console.log("✅ .env credentials matched, creating user in database...");
        
        // Create user in database
        user = await User.create({
          name: matchedCred.username,
          email: matchedCred.email,
          password: matchedCred.password,
          role: matchedCred.role
        });
        
        console.log("✅ User created in database:", user.name);
        isEnvLogin = true;
      }
    } else {
      // Users exist in database, check normally
      console.log("📋 Users found in database, checking credentials...");
      user = await User.findOne({ email });
    }

    if (!user) {
      console.error("Login error: User not found", { email });
      throw new ApiError(401, "Invalid credentials");
    }

    // Check password
    const isPasswordCorrect = isEnvLogin ? true : await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      console.error("Login error: Invalid user credentials", { email });
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

    console.log("✅ Login successful for:", loggedInUser.name, "Role:", loggedInUser.role);

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
          },
          `${isEnvLogin ? 'First time login from .env - ' : ''}User logged in successfully`
        )
      );
  } catch (error) {
    console.error("Login error: ", error);
    return res.status(500).json({
      statusCode: 500,
      data: null,
      errors: [error.message || error],
    });
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, " refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: user,
            accessToken,
            refreshToken,
          },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    console.error("Refresh token error: ", error);
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1, // this removes the field from document
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged Out"));
  } catch (error) {
    console.error("Logout error: ", error);
    return res.status(500).json({
      statusCode: 500,
      data: null,
      errors: [error.message || error],
    });
  }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    const { oldPasswored, newPasswored } = req.body;
    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPasswored);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid password");
    }
    user.password = newPasswored;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "password updated"));
  } catch (error) {
    console.error("Change password error: ", error);
    return res.status(500).json({
      statusCode: 500,
      data: null,
      errors: [error.message || error],
    });
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "branch" }).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

export {
  register,
  login,
  logout,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  getAllUsers,
};
