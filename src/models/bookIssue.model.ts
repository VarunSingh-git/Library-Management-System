import { itemBorrower } from "../types/enums/book.enum.js";
import { issuedToStructure } from "../types/book.type.js";
import mongoose from "mongoose";
import { model, Schema } from "mongoose";
import { User } from "./user.model.js";

const issuedToSchema = new Schema<issuedToStructure>(
  {
    // this is seperate schema of issuedTo
    bookBorrower: {
      type: String,
      required: true,
      enum: Object.values(itemBorrower),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    returnDate: {
      type: Date,
      default: Date.now(),
      required: true,
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

issuedToSchema.pre("save", async function (next) {
  if (this.fine[0] && this.fine.length > 0) {
    return next(new Error("Outstanding fine exists. Cannot issue new book."));
  }
  next();
});

export const IssuedBook = mongoose.model("IssueBook", issuedToSchema);
