import { itemBorrower } from "../types/enums/book.enum.js";
import { returnedToStructure } from "../types/book.type.js";
import mongoose, { model, Schema } from "mongoose";

const returnBookSchema = new Schema<returnedToStructure>(
  {
    // this is seperate schema of issuedTo
    bookBorrower: {
      type: String,
      required: true,
      enum: Object.values(itemBorrower),
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

export const returnedBook = model("returnBook", returnBookSchema);
