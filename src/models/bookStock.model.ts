import { itemBorrower } from "../types/enums/book.enum.js";
import { book } from "../types/book.type.js";
import mongoose from "mongoose";
import { Schema } from "mongoose";
import { model } from "mongoose";
import { IssuedBook } from "./bookIssue.model.js";

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
      type: String,
      required: true,
    },
    bookAccessionNo: {
      type: String,
      required: true,
      unique: true,
    },
    isbn: {
      type: String,
      required: true,
      lowercase: true,
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
export const Book = model("Book", AddBookSchema);
