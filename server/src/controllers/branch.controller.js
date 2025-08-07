import { asyncHandler } from "../utils/asyncHandler.js";
import { Branch } from "../models/branch.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt";
const registerBranch = asyncHandler(async (req, res) => {
  const {
    name,
    password,
    branchName,
    email,
    code,
    address,
    phone,
    directorname,
    directoradress,
    location,
    dist,
    state,
    religion,
    coursefees,
  } = req.body;
  const { signature, image } = req.files;
  if (
    [
      name,
      password,
      branchName,
      email,
      address,
      phone,
      code,
      directorname,
      directoradress,
      location,
      dist,
      state,
      religion,
    ].some((field) => field?.trim() === "") ||
    !signature ||
    !image
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // console.log(coursefees);
  let coursefees2 = [];
  if (coursefees) {
    coursefees2 = JSON.parse(coursefees).map((item) => ({
      duration: item.duration,
      fees: Number(item.fees),
    }));
  } else {
    throw new ApiError(400, "Course is required");
  }

  // Check for duplicate email
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  // Check for duplicate branch code
  const existedBranchCode = await Branch.findOne({ code });
  if (existedBranchCode) {
    throw new ApiError(400, "Branch with this code already exists");
  }

  // Check for duplicate branch name
  const existedBranchName = await Branch.findOne({ branchName });
  if (existedBranchName) {
    throw new ApiError(400, "Branch with this name already exists");
  }

  const directorsignature = `${req.protocol}://${req.get("host")}/assets/${
    signature[0].filename
  }`;
  const avatar = `${req.protocol}://${req.get("host")}/assets/${
    image[0].filename
  }`;

  const user = await User.create({
    name,
    email,
    password,
    role: "branch",
    avatar,
  });
  const branch = await Branch.create({
    user: user._id,
    branchName,
    address,
    phone,
    code,
    directorname,
    directoradress,
    directorsignature,
    location,
    dist,
    state,
    religion,
    isActive: true,
    coursefees: coursefees2,
  });
  if (!user || !branch) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  const createdBranch = await Branch.findById(branch._id).populate(
    "user",
    "-password -refreshToken"
  );

  res
    .status(200)
    .json(new ApiResponse(200, createdBranch, "Branch created successfully"));
});
//get all branches with rearch and sort
const getAllBranches = asyncHandler(async (req, res) => {
  const { search = "", sortBy = "createdAt", order = "asc" } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortOrder = order === "desc" ? -1 : 1;

  const searchQuery = search
    ? {
        $or: [
          { branchName: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { directorname: { $regex: search, $options: "i" } },
        ],
      }
    : {};
  const branches = await Branch.find(searchQuery)
    .populate("user", "-password -refreshToken")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
  const count = branches.length;
  const totalBranches = await Branch.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalBranches / limit);
  const pagination = {
    totalBranches,
    totalPages,
    currentPage: page,
    limit,
    count,
  };

  if (!branches) {
    throw new ApiError(500, "Something went wrong while fetching branches");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        branches,
        pagination,
      },
      "Branches fetched successfully"
    )
  );
});

//get all
const getAllbranchesName = asyncHandler(async (_, res) => {
  const branches = await Branch.find().select("branchName _id");
  const data = branches.map((branch) => ({
    value: branch._id.toString(),
    label: branch.branchName || "",
  }));
  res.status(200).json(new ApiResponse(200, data, "success"));
});

const getBranchById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const branch = await Branch.findById(id).populate(
    "user",
    "-password -refreshToken"
  );
  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, branch, "Branch fetched successfully"));
});

const updateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    branchName,
    email,
    code,
    address,
    phone,
    directorname,
    directoradress,
    location,
    dist,
    state,
    religion,
    coursefees,
  } = req.body;

  // Find the branch first
  const branch = await Branch.findById(id).populate("user");
  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  // Check if email is being changed and if it already exists
  if (email && email !== branch.user.email) {
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      throw new ApiError(400, "User already exists with this email");
    }
  }

  // Check if branch code is being changed and if it already exists
  if (code && code !== branch.code) {
    const existedBranchCode = await Branch.findOne({ code });
    if (existedBranchCode) {
      throw new ApiError(400, "Branch with this code already exists");
    }
  }

  // Check if branch name is being changed and if it already exists
  if (branchName && branchName !== branch.branchName) {
    const existedBranchName = await Branch.findOne({ branchName });
    if (existedBranchName) {
      throw new ApiError(400, "Branch with this name already exists");
    }
  }

  // Prepare update data for branch
  const branchUpdateData = {};
  if (branchName) branchUpdateData.branchName = branchName;
  if (address) branchUpdateData.address = address;
  if (phone) branchUpdateData.phone = phone;
  if (code) branchUpdateData.code = code;
  if (directorname) branchUpdateData.directorname = directorname;
  if (directoradress) branchUpdateData.directoradress = directoradress;
  if (location) branchUpdateData.location = location;
  if (dist) branchUpdateData.dist = dist;
  if (state) branchUpdateData.state = state;
  if (religion) branchUpdateData.religion = religion;

  // Handle course fees
  if (coursefees) {
    let coursefees2 = [];
    if (typeof coursefees === 'string') {
      coursefees2 = JSON.parse(coursefees).map((item) => ({
        duration: item.duration,
        fees: Number(item.fees),
      }));
    } else {
      coursefees2 = coursefees.map((item) => ({
        duration: item.duration,
        fees: Number(item.fees),
      }));
    }
    branchUpdateData.coursefees = coursefees2;
  }

  // Handle file uploads if present
  if (req.files) {
    const { signature, image } = req.files;
    if (signature) {
      branchUpdateData.directorsignature = `${req.protocol}://${req.get("host")}/assets/${signature[0].filename}`;
    }
    if (image) {
      // Update user avatar
      const userUpdateData = {};
      userUpdateData.avatar = `${req.protocol}://${req.get("host")}/assets/${image[0].filename}`;
      if (name) userUpdateData.name = name;
      if (email) userUpdateData.email = email;
      
      await User.findByIdAndUpdate(branch.user._id, userUpdateData, { new: true });
    }
  } else {
    // Update user data without files
    const userUpdateData = {};
    if (name) userUpdateData.name = name;
    if (email) userUpdateData.email = email;
    
    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(branch.user._id, userUpdateData, { new: true });
    }
  }

  // Update branch
  const updatedBranch = await Branch.findByIdAndUpdate(
    id,
    branchUpdateData,
    { new: true }
  ).populate("user", "-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedBranch, "Branch updated successfully"));
});

const deleteBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the branch first
  const branch = await Branch.findById(id).populate("user");
  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  // Delete the associated user first
  await User.findByIdAndDelete(branch.user._id);

  // Delete the branch
  await Branch.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Branch deleted successfully"));
});

export { registerBranch, getAllBranches, getBranchById, getAllbranchesName, updateBranch, deleteBranch };
