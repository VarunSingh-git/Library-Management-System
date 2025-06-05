import { bookType, itemBorrower } from "../types/enums/book.enum";
import { book, issuedToStructure } from "../types/book.type";
import mongoose, { model, Schema } from "mongoose";

const issuedTo = new Schema<issuedToStructure>({
  bookBorrower: {
    type: String,
    required: true,
    enum: Object.values(itemBorrower),
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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
});
const BookSchema = new Schema<book>(
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
    issuedToInfo: {
      type: [issuedTo],
    },
    isAvailable: {
      type: Boolean,
      default: function () {
        return this.availableCopies > 0;
      },
    },
  },
  {
    timestamps: true,
  }
);
export const Book = model("Book", BookSchema);
