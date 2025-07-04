import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { RegisterUserInput } from "../types/user.type.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const registration = asyncHandler(async (req, res) => {
  const { name, department, phoneNo, pswrd, role }: RegisterUserInput =
    req.body;

  const existedUser = await User.findOne({
    role,
    $or: [{ name }, { phoneNo }],
  });

  if (existedUser) throw new Error("Registration is already done");

  if (!name || !department || !phoneNo || !pswrd || !role) {
    throw new Error("All fields are required");
  }
  if (name.length < 2 || name.length > 20) {
    throw new Error(
      "Name should be greater then 2 and less then 20 characters "
    );
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
  console.log("req.file?.buffer", req.file);
  if (!req.file?.buffer || !req.file) {
    throw new Error("Please upload your image");
  }
  const uploadResult: string = (await uploadToCloudinary(
    req.file.buffer
  )) as string;
  console.log(uploadResult);
  if (!uploadResult) throw new Error("File is compulsory");

  const user = await User.create({
    name,
    photo: uploadResult,
    department,
    phoneNo,
    pswrd,
    role,
  });
  const finalResult = await User.findById(user?._id).select(
    "-pswrd -refreshToken"
  );
  if (!finalResult) throw new Error("Server error occur... try again");
  console.log(finalResult);
  res.status(200).json({
    finalResult,
    message: "User registred successfully",
  });
});

const logIn = asyncHandler(async (req, res) => {
  const { name, phone, pswrd } = req.body;
  console.log(req.body);
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
  console.log(isPasswordCorrect);
  if (!isPasswordCorrect) throw new Error("Wrong Password");

  const accessToken = userExitence.generateAccessToken();
  const refreshToken = userExitence.generateRefreshToken();

  const logginUser = await User.findById(userExitence?._id).select(
    "_id name photo role"
  );
  console.log("logginUser", logginUser);
  if (!logginUser) throw new Error("login error occur");

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
  console.log("req.user?._id", req.user?._id);
  const result = await User.findByIdAndUpdate(
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
  console.log("result", result);
  return res
    .status(201)
    .cookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", {
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
    const { username, department, phone, role } = req.body;
    const allowedRoles = ["admin", "student", "faculty", "guest"];
    console.log(username, department, phone, role);
    if (!username && !department && !phone && !role) {
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
    if (!role || typeof role !== "string" || !allowedRoles.includes(role)) {
      throw new Error("Please enter your role");
    }

    const userData = await User.findById(req.user?._id).select(
      "-pswrd -refreshToken"
    );

    if (
      userData?.name === username &&
      userData?.department === department &&
      userData?.phoneNo === phone &&
      userData?.role === role
    ) {
      throw new Error("No changes in data");
    }

    const result = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          name: username,
          department: department,
          phoneNo: phone,
          role: role,
          refreshToken: "",
        },
      },
      {
        new: true,
      }
    ).select("-pswrd");
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json({
        success: true,
        message: "Role updated successfully. Please login again.",
      });
  } catch (error) {
    console.log(error);
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

//this is for testing
const test = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    return res.status(200).json({ msg: "user is still login" });
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
  test,
};
