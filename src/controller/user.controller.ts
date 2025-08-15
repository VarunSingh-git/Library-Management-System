import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { RegisterUserInput } from "../types/user.type.js";
import {
  uploadToCloudinary,
  publicId,
  getPublicId,
} from "../utils/cloudinary.js";
import { sendOTP } from "../utils/sendEmail.js";
import { otpGenerator } from "../utils/generateOTP.js";
import bcryptjs from "bcryptjs";
import { loginRateLimit } from "../utils/rateLimiter.js";

const registration = asyncHandler(async (req, res) => {
  const { name, department, phoneNo, pswrd, role, email }: RegisterUserInput =
    req.body;
  console.log(name, department, phoneNo, pswrd, role, email);
  if (req.body.role)
    return res.status(403).json({ message: "Role tampering detected." });

  const existedUser = await User.findOne({
    $and: [{ name }, { phoneNo }],
  });

  if (existedUser) throw new Error("Registration is already done");

  if (!name || !department || !phoneNo || !pswrd || !email) {
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
  if (role) {
    throw new Error("Role can't set by non-admin user");
  }
  if (!req.file?.buffer || !req.file) {
    throw new Error("Please upload your image");
  }
  const uploadResult = await uploadToCloudinary(req.file?.buffer);
  if (!uploadResult) throw new Error("File is compulsory");

  const user = await User.create({
    name,
    photo: uploadResult.secure_url,
    email,
    department,
    phoneNo,
    pswrd,
    role: "student",
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

const logIn = asyncHandler(async (req, res) => {
  const { name, phone, pswrd } = req.body;
  const userExitence = await User.findOne({
    name: name,
    phoneNo: phone,
  });

  if (!userExitence) throw new Error("User not found");
  if (userExitence?.isDeleted === true)
    throw new Error("User account is deleted");

  if (userExitence.role !== "user")
    throw new Error("Access denied: Only users can access this login");
  console.log(userExitence.name);
  console.log(userExitence.phoneNo);

  if (userExitence.name !== name || userExitence.phoneNo !== phone || !pswrd)
    throw new Error("Invalid credentials");

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

const logOut = asyncHandler(async (req, res) => {
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

const updateUserDetails = asyncHandler(async (req, res) => {
  try {
    const { username, department, phone, email } = req.body;

    if (!username && !department && !phone && !email) {
      throw new Error("All fields are required");
    }
    if (
      username.length < 2 ||
      username.length > 20 ||
      typeof username !== "string"
    ) {
      throw new Error(
        "Name should be greater then 2 and less then 20 characters "
      );
    }

    if (
      !email.includes("@") ||
      email.startsWith("@") ||
      email.endsWith("@") ||
      email.split("@").length !== 2 ||
      email.split("@")[1].indexOf(".") === -1 ||
      email.split("@")[1].startsWith(".") ||
      email.split(".").pop().length < 2
    ) {
      throw new Error("Invalid email address");
    }

    if (phone.toString().length !== 10 || typeof phone !== "number") {
      throw new Error("Phone no must be 10 numbers only");
    }

    if (
      !department ||
      department.length > 50 ||
      typeof department !== "string"
    ) {
      throw new Error("Please enter your department");
    }

    const userData = await User.findById(req.user?._id).select(
      "-pswrd -refreshToken"
    );

    if (
      userData?.name === username &&
      userData?.department === department &&
      userData?.phoneNo === phone &&
      userData?.email === email
    ) {
      throw new Error("No changes in data");
    }

    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          name: username,
          department: department,
          phoneNo: phone,
          email: email,
          refreshToken: "",
        },
      },
      {
        new: true,
      }
    ).select("-pswrd");
    return res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json({
        success: true,
        message: "Role updated successfully. Please login again.",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

const chnagePassowrd = asyncHandler(async (req, res) => {
  const { oldPass, newPass, confirmPass } = req.body;
  console.log(req.body);
  if (
    typeof confirmPass !== "string" ||
    typeof oldPass !== "string" ||
    typeof newPass !== "string"
  ) {
    throw new Error("Invalid Passoword");
  }
  if (!oldPass) throw new Error("Enter old password first");
  if (newPass !== confirmPass)
    throw new Error("new password and confirm password should be same");

  const user = await User.findById(req.user?._id);
  if (!user) throw new Error("User not found");
  const confirmPassword = await user.isPswrdCorrect(oldPass);
  if (!confirmPassword) throw new Error("please enter your old password first");

  user.refreshToken = "";
  try {
    user.pswrd = newPass;
    await user.save();
  } catch (err) {
    return new Error("Server internal error during changing the password");
  }
  console.log(user.pswrd);
  const opts = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(201)
    .cookie("accessToken", opts)
    .cookie("refreshToken", opts)
    .json({
      msg: "Password changed successfully. Please login again",
      user: {},
    });
});

const getUserData = asyncHandler(async (req, res) => {
  console.log("req.user", req.user);
  const user = await User.findById(req.user?._id).select(
    "-refreshToken -pswrd"
  );
  if (!user) throw new Error("User not found");
  return res.status(200).json({
    msg: "User data fetch successfull",
    user,
  });
});

const updateUserImg = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new Error("User not found");

  const file = req.file;
  if (!file) throw new Error("Image not found");

  const uploadedData = await uploadToCloudinary(file?.buffer);
  console.log("uploadedData", uploadedData.public_id);

  if (!uploadedData) throw new Error("Error occur during updation image");

  const result = await User.findByIdAndUpdate(
    req.user?._id,
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
  const user = await User.findById(req.user?._id);
  if (!user) throw new Error("user not found");

  const url = user.photo;
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        photo: 1,
      },
    },
    {
      new: true,
    }
  ).select("_id name photo departmen phoneNo role");
  const removeFromCloudinary = publicId(getPublicId(url));
  if (!updatedUser || !removeFromCloudinary)
    throw new Error("Image can't be remove");

  return res
    .status(200)
    .json({ msg: "Image remove successfully", updatedUser });
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
//this is for testing
const test = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    const user = req.user?.role;
    return res.status(200).json({ msg: "user is still login", user });
  } else {
    return false;
  }
});

export {
  registration,
  logIn,
  logOut,
  updateUserDetails,
  chnagePassowrd,
  getUserData,
  test, //  for testing
  updateUserImg,
  removeUserImg,
  sendOtpController,
  verifyOTPandResetPassword,
};
