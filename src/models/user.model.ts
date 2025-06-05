import mongoose, { model, Schema } from "mongoose";
import { userType } from "../types/user.type";
import { userRole } from "../types/enums/user.enum";
const userSchema = new Schema<userType>(
  {
    name: {
      type: String,
      required: true,
      lowerCase: true,
      trime: true,
    },
    rollNo: {
      type: String,
    },
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
    },
    pswrd: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(userRole),
    },
    issuedBook: [
      {
        _id: String,
        date: Date,
      },
    ],
    returnedBook: [
      {
        _id: String,
        date: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = model("User", userSchema);
