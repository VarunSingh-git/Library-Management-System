import { bookType, itemBorrower } from "./enums/book.enum.js";
import mongoose from "mongoose";

export interface book {
  title: string;
  authorName: string;
  type: bookType;
  bookAccessionNo: string;
  isbn: string;
  isIssueableItems: boolean;
  publication: string;
  edition: string;
  totalCopies: number;
  availableCopies: number;
  bookPrice: number;
  isAvailable: boolean;
  issuedToInfo: issuedToStructure[];
  screenshot: string;
}

export interface issuedToStructure {
  bookBorrower: itemBorrower;
  bookId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  fine: Array<{
    fine: number;
    bookId: { type: mongoose.Types.ObjectId; ref: string };
    userId: { type: mongoose.Types.ObjectId; ref: string };
  }>;
  ref: string;
  issueDate: Date;
  returnDate: Date;
}

export interface returnedToStructure {
  bookBorrower: itemBorrower;
  bookId: { type: mongoose.Types.ObjectId; ref: string };
  userId: { type: mongoose.Types.ObjectId; ref: string };
  ref: string;
  issueDate: Date;
  returnDate: Date;
}
