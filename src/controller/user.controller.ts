import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { RegisterUserInput } from "../types/user.type.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const registration = asyncHandler(async (req, res) => {
  const { name, photo, department, phoneNo, pswrd, role }: RegisterUserInput =
    req.body;

  const existedUser = await User.findOne({
    $or: [{ name }, { phoneNo }],
  });

  if (existedUser) throw new Error("Registration is already done");

  // if (!name || !photo || !department || !phoneNo || !pswrd || !role) {
  //   throw new Error("All fields are required");
  // }
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
  const uploadResult = await uploadToCloudinary(req.file.buffer);

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

export { registration };
