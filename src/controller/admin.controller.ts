import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  publicId,
  getPublicId,
} from "../utils/cloudinary.js";
import { RegisterUserInput } from "../types/user.type.js";
import { loginRateLimit } from "../utils/rateLimiter.js";
import bcryptjs from "bcryptjs";
import { sendOTP } from "../utils/sendEmail.js";
import { otpGenerator } from "../utils/generateOTP.js";

const adminRegistration = asyncHandler(async (req, res) => {
  const { name, department, phoneNo, pswrd, role, email }: RegisterUserInput =
    req.body;
  console.log(name, department, phoneNo, pswrd, role, email);
  const existedUser = await User.findOne({
    role,
    $or: [{ name }, { phoneNo }],
  });

  if (existedUser) throw new Error("Registration is already done");

  if (!name || !department || !phoneNo || !pswrd || !role || !email) {
    throw new Error("All fields are required");
  }
  if (name.length < 2 || name.length > 20) {
    throw new Error(
      "Name should be greater then 2 and less then 20 characters "
    );
  }
  if (!email) throw new Error("Email not found");
  if (
    !email.includes("@") ||
    email.startsWith("@") ||
    email.endsWith("@") ||
    email.split("@").length !== 2 ||
    email.split("@")[1].indexOf(".") === -1 ||
    email.split("@")[1].startsWith(".")
  ) {
    throw new Error("Invalid email address");
  }
  if (phoneNo.toString().length !== 10) {
    throw new Error("Phone no must be 10 numbers only");
  }
  if (!department || department.length > 15) {
    throw new Error("Please enter your department");
  }
  if (pswrd.length < 6 || pswrd.length > 20) {
    throw new Error("Password should be 6 to 20 characters long");
  }
  if (!role) {
    throw new Error("Please enter your role");
  }
  // console.log("req.file?.buffer", req.file);
  if (!req.file?.buffer || !req.file) {
    throw new Error("Please upload your image");
  }
  const uploadResult = await uploadToCloudinary(req.file?.buffer);
  // console.log(uploadResult);
  if (!uploadResult) throw new Error("File is compulsory");

  const user = await User.create({
    name,
    photo: uploadResult.secure_url,
    email,
    department,
    phoneNo,
    pswrd,
    role,
  });
  const finalResult = await User.findById(user?._id).select(
    "-pswrd -refreshToken"
  );
  if (!finalResult) throw new Error("Server error occur... try again");
  // console.log(finalResult);
  return res.status(200).json({
    finalResult,
    message: "User registred successfully",
  });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { name, phone, pswrd } = req.body;
  // console.log(req.body);
  const userExitence = await User.findOne({
    name: name,
    phoneNo: phone,
  });
  if (!userExitence) throw new Error("User not found");
  if (userExitence.role !== "admin") throw new Error("Access Denied");
  if (userExitence.name !== name || !pswrd || typeof pswrd !== "string") {
    throw new Error("Invalid credentials");
  }

  const isPasswordCorrect = await userExitence.isPswrdCorrect(pswrd);
  // console.log(isPasswordCorrect);
  if (!isPasswordCorrect) throw new Error("Wrong Password");

  const accessToken = userExitence.generateAccessToken();
  const refreshToken = userExitence.generateRefreshToken();

  const logginUser = await User.findById(userExitence?._id).select(
    "_id name photo role"
  );
  // console.log("logginUser", logginUser);
  if (logginUser?.role !== "admin")
    throw new Error("Accessiable only for admin");
  if (!logginUser) throw new Error("login error occur");
  loginRateLimit.resetKey(req.ip!.toString());
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000, // 15 Minutes
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    })
    .json({
      msg: "Login Successfully",
      user: logginUser,
    });
});

const adminLogout = asyncHandler(async (req, res) => {
  // console.log("req.user?._id", req.user?._id);
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  // console.log("result", result);
  return res
    .status(201)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      msg: "Log out Successfully",
      user: {},
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const user = await User.find().select("-pswrd");
  return res.status(200).json({
    msg: `${user.length} users are fetched`,
    user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const userToDelete = await User.findById(userId);
  if (!userToDelete) throw new Error("User not found");

  if (userToDelete?.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount === 1)
      throw new Error(
        "Cannot delete the only admin. Please assign another admin first."
      );
  }

  const user = await User.deleteOne({ _id: userToDelete?._id });
  console.log("a", user);

  if (user.deletedCount === 0)
    throw new Error("Deletion is not completed yet..");
  return res.status(200).json({ msg: "User delete successfully", user });
});

const sendOtpController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new Error("Invalid email address");
  const user = await User.findOne({ email });
  if (!user) throw new Error("user not found");

  const OTP: string = otpGenerator();
  (user.otp = OTP), (user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000));
  await user.save();
  await sendOTP(email, OTP);
  return res.status(200).json({
    msg: `Dear ${user.name} your OTP sent to your registered mail.`,
  });
});

const verifyOTPandResetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email) throw new Error("Invalid email address");
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (
    !otp ||
    user.otp !== otp ||
    typeof otp !== "string" ||
    user.otpExpiry! < new Date()
  )
    throw new Error("Invalid or expired OTP");

  if (!newPassword || newPassword.length < 6 || newPassword.length > 20) {
    throw new Error("Password should be 6 to 20 characters long");
  }

  const hashed = await bcryptjs.hash(newPassword, 10);
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: { pswrd: hashed },
      $unset: { refreshToken: 1, otp: 1, otpExpiry: 1 },
    },
    { new: true }
  );
  if (!updatedUser) throw new Error("Server error occur during reset password");
  console.log("updatedUser", updatedUser);
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({
      msg: "Password reset successfully. Please login again",
    });
});

const updateUserImg = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  // console.log("updateUserc", user);
  if (!user) throw new Error("User not found");

  const file = req.file;
  if (!file) throw new Error("Image not found");

  const uploadedData = await uploadToCloudinary(file?.buffer);
  console.log("uploadedData", uploadedData.public_id);

  if (!uploadedData) throw new Error("Error occur during updation image");

  const result = await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        photo: uploadedData.secure_url,
      },
    },
    {
      new: true,
    }
  ).select("_id name photo departmen phoneNo role");
  if (!result) throw new Error("Technical error occur during img updation");
  console.log("result from img updation", result);

  return res.status(200).json({ msg: "image successfully updated", result });
});

const removeUserImg = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  console.log("updateUserc", user);

  if (!user) throw new Error("User not found");

  const url = user.photo;
  const updatedUser = await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        photo: "",
      },
    },
    {
      new: true,
    }
  ).select("_id name photo department phoneNo role");
  const removeFromCloudinary = publicId(getPublicId(url));
  console.log("removeFromCloudinary", await removeFromCloudinary);
  console.log("updatedUser", updatedUser);
  if (!updatedUser || !removeFromCloudinary)
    throw new Error("Image can't be remove");

  return res
    .status(200)
    .json({ msg: "Image remove successfully", updatedUser });
});

export {
  adminRegistration,
  adminLogin,
  adminLogout,
  getAllUsers,
  deleteUser,
  verifyOTPandResetPassword,
  sendOtpController,
  removeUserImg,
  updateUserImg,
};
