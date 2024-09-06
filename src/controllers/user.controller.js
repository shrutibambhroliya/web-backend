import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/userModel.js";
import { deleteFromCloudinary, uploadCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(user, "user");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // console.log("userRef", user.refreshToken);

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("token genrare k time error");
    throw new apiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  console.log("email", email);

  if ([userName, email, password].some((field) => field?.trim() === "")) {
    throw new apiError(404, "all field is required");
  }

  const existUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existUser) {
    throw new apiError(
      404,
      "User with userName and email already exist account"
    );
  }

  let localPathAvatar;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    localPathAvatar = req.files.avatar[0].path;
  }

  if (!localPathAvatar) {
    throw new apiError(409, "avatar files is require");
  }

  const avatar = await uploadCloudinary(localPathAvatar);
  if (!avatar) {
    throw new apiError(409, "avatar files is require");
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    avatar: avatar.url,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "user register successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName && !email) {
    throw new apiError(400, "userName and emil is require");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new apiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "invalid user credential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
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
    .json(new apiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(400, "unAuthorized refreshToken");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    console.log(user);

    if (!user) {
      throw new apiError(400, "invalid refreshToken");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new apiError(400, "refresh token is expire or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user?._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "access token refresh"
        )
      );
  } catch (error) {
    throw new apiError(400, error?.message || "invalid refresh token");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "get user fetched successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isCorrectPass = user.isPasswordCorrect(oldPassword);
  console.log("oldPass", isCorrectPass);

  if (!isCorrectPass) {
    throw new apiError(400, "invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "password change successfully"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { userName, email } = req.body;

  if (!userName || !email) {
    throw new apiError(400, "all field is require");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        userName: userName,
        email: email,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new apiResponse(200, user, "profile detail updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const localFileAvatar = req.file?.path;

  const user = await User.findById(req.user?._id);

  const oldAvatar = user.avatar;

  if (!oldAvatar) {
    throw new apiError(400, "oldAvatar is require");
  }

  // old avatar deleted
  await deleteFromCloudinary(oldAvatar);

  const avatar = await uploadCloudinary(localFileAvatar);

  if (!avatar.url) {
    throw new apiError(400, "error while uploading avatar");
  }

  const updateAvatar = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, updateAvatar, "avatar updated successfully"));
});

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.find({}).select("-password -refreshToken");

    if (!user || user.length === 0) {
      throw new apiError(400, "users not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, user, "users have founded"));
  } catch (error) {
    throw new apiError(400, error?.message || "server error");
  }
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (role !== "admin" && role !== "user") {
    throw new apiError(400, "invalid role provided");
  }

  const updateRole = await User.findByIdAndUpdate(
    userId,
    {
      $set: { role: role },
    },
    {
      new: true,
    }
  );

  if (!updateRole) {
    throw new apiError(400, "user not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updateRole, "role updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new apiError(400, "access denied");
  }
  console.log("User Role:", req.user.role);

  const { userId } = req.params;
  console.log("userId", userId);

  try {
    const result = await User.findByIdAndDelete(userId);
    console.log("result", result);
    if (!result) {
      throw new apiError(400, "user not found");
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Error during deletion:", error);
    throw new apiError(400, error.message || "server error");
  }
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  getUserProfile,
  changeCurrentPassword,
  updateUserProfile,
  updateAvatar,
  getAllUser,
  updateUserRole,
  deleteUser,
};
