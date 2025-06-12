import { itemBorrower } from "../types/enums/book.enum.js";
import { issuedToStructure } from "../types/book.type.js";
import mongoose, { model, Schema } from "mongoose";

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
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const issuedBook = model("issueBook", issuedToSchema);
