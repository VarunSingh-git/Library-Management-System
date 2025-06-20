import mongoose, { models, model, Schema } from "mongoose";
import { userType } from "../types/user.type.js";
import { userRole } from "../types/enums/user.enum.js";
import bcryptjs from "bcryptjs";

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
        bookId: mongoose.Types.ObjectId,
        ref: "Book",
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
    await bcryptjs.hash(this.pswrd, 10);
  }
});

userSchema.methods.issPswrdCorrect = async function (pswrd: string) {
  return await bcryptjs.compare(pswrd, this.pswrd);
};

userSchema.methods.generateRefreshToken

export const User = models?.User || model("User", userSchema);
