import { bookType, itemBorrower } from "../types/enums/book.enum.js";
import { Types } from "mongoose";

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
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  ref: string;
  issueDate: Date;
  returnDate: Date;
}

export interface returnedToStructure {
  bookBorrower: itemBorrower;
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  ref: string;
  issueDate: Date;
  returnDate: Date;
}
