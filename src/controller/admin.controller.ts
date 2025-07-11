import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { RegisterUserInput } from "../types/user.type.js";
import { loginRateLimit } from "../utils/rateLimiter.js";

const adminRegistration = asyncHandler(async (req, res) => {
  const { name, department, phoneNo, pswrd, role, email }: RegisterUserInput =
    req.body;

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
  if (
    userExitence.name !== name ||
    userExitence.phoneNo !== phone ||
    !pswrd ||
    typeof pswrd !== "string"
  ) {
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
  if (!logginUser) throw new Error("login error occur");
  loginRateLimit.resetKey(req.ip!.toString());
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
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



export { adminRegistration, adminLogin, adminLogout };
