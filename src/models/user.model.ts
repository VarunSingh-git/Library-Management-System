import mongoose from "mongoose";
import { model } from "mongoose";
import { Schema } from "mongoose";
import { userType } from "../types/user.type.js";
import bcryptjs from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

const userSchema = new Schema<userType>(
  {
    name: {
      type: String,
      required: true,
      lowerCase: true,
      trime: true,
      index: true,
    },
    rollNo: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: { type: String },
    otpExpiry: { type: Date },
    photo: {
      type: String, // cloudinary
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: String,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
    pswrd: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student", "faculty", "guest"],
      required: true,
      default: "student",
    },
    bookIssueLimit: {
      type: Number,
      required: true,
      default: 0,
    },
    issuedBook: [
      // we put here user id in array so that we can track users
      {
        _id: String,
        date: Date,
      },
    ],
    returnedBook: [
      // same as above
      {
        _id: String,
        date: Date,
      },
    ],
    refreshToken: {
      type: String,
    },
    fine: [
      {
        fine: Number,
        bookId: { type: mongoose.Types.ObjectId, ref: "Book" },
        userId: { type: mongoose.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // this is middleware for encrypt password
  if (this.isModified("pswrd")) {
    this.pswrd = await bcryptjs.hash(this.pswrd, 10);
    next();
  }
});

userSchema.methods.isPswrdCorrect = async function (pswrd: string) {
  return await bcryptjs.compare(pswrd, this.pswrd);
};

userSchema.methods.generateAccessToken = function (): string {
  const secret = process.env.ACCESS_TOKEN_KEY!;
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRE!;
  if (!secret || !expiresIn) throw new Error("JWT Error...!");

  const payload = {
    _id: this._id,
    name: this.name,
    phone: this.phoneNo,
    role: this.role,
  };
  const options: SignOptions = {
    expiresIn: "1h",
    algorithm: "HS256",
  };

  return jwt.sign(payload, secret, options);
};
userSchema.methods.generateRefreshToken = function (): string {
  const secret = process.env.REFRESH_TOKEN_KEY!;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRE!;
  if (!secret || !expiresIn) throw new Error("JWT Error...!");

  const payload = {
    _id: this._id,
  };
  const options: SignOptions = {
    expiresIn: "30d",
    algorithm: "HS256",
  };

  return jwt.sign(payload, secret, options);
};

export const User = model("User", userSchema);
