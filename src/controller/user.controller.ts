import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { RegisterUserInput } from "../types/user.type.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// const generateAccessAndRefreshToken = async (userId: string) => {
//   try {
//     const user = await User.findById(userId);
//     if (!user) throw new Error("User not found");
//     const accessToken = await user?.generateAccessToken();
//     const refreshToken = await user?.generateRefreshToken();
//     // user.refreshToken = refreshToken;
//     await user.save({
//       validateBeforeSave: false,
//     });
//     return {
//       accessToken,
//       refreshToken,
//     };
//   } catch (error) {
//     throw new Error("Error in generateAccessAndRefreshToken");
//   }
// };
const registration = asyncHandler(async (req, res) => {
  const { name, department, phoneNo, pswrd, role }: RegisterUserInput =
    req.body;

  const existedUser = await User.findOne({
    $and: [{ name }, { phoneNo }],
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

  const isPasswordCorrect = userExitence.isPswrdCorrect(pswrd);
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
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      msg: "Login Successfully",
      user: logginUser,
    });
});
export { registration, logIn };
