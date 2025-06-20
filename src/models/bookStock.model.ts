import { bookType, itemBorrower } from "../types/enums/book.enum.js";
import { book } from "../types/book.type.js";
import mongoose, { model, models, Schema } from "mongoose";
import { issuedBook } from "./bookIssue.model.js";
import { returnedBook } from "./bookReturn.model.js";

const AddBookSchema = new Schema<book>(
  {
    title: {
      type: String,
      required: true,
      lowercase: true,
    },
    authorName: {
      type: String,
      required: true,
      lowercase: true,
    },
    type: {
      // item type
      type: String,
      enum: Object.values(bookType),
      required: true,
    },
    bookAccessionNo: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      lowercase: true,
    },
    isIssueableItems: {
      type: Boolean,
      required: true,
      default: true,
    },
    publication: {
      type: String,
      required: true,
      lowercase: true,
    },
    edition: {
      type: String,
      required: true,
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 0,
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 0,
    },
    bookPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    screenshot: {
      type: String,
      required: true,
    },
    issuedToInfo: {
      type: [issuedBook], // here we use this schema as array of object
    },
    isAvailable: {
      type: Boolean,
      default: function () {
        // this is function that run automatic when new data is created
        return this.availableCopies > 0;
      },
    },
  },
  {
    timestamps: true,
  }
);
export const Book = models?.Book || model("Book", AddBookSchema);
