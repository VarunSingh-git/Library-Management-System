import { asyncHandler } from "../utils/asyncHandler.js";
import { Book } from "../models/bookStock.model.js";
import { Request, Response } from "express";

const addBook = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    authorName,
    type,
    bookAccessionNo,
    isbn,
    publication,
    edition,
    bookPrice,
    screenshot,
  } = req.body;

  if (
    !title ||
    !authorName ||
    !type ||
    !bookAccessionNo ||
    !isbn ||
    !publication ||
    !edition
  ) {
    throw new Error("All fields are required");
  }

  const existingBook = await Book.findOne({
    title,
    authorName,
    type,
    isbn,
    publication,
    edition,
  });
  if (existingBook) {
    const updatedBook = await Book.findByIdAndUpdate(
      existingBook?._id,
      { $inc: { totalCopies: 1, availableCopies: 1 } },
      { new: true }
    );
    return res.status(200).json({
      message: "Book added successfully",
      book: updatedBook,
    });
  }

  const newBook = await Book.create({
    title,
    authorName,
    type,
    bookAccessionNo,
    isbn,
    publication,
    edition,
    totalCopies: 1,
    availableCopies: 1,
    bookPrice,
    screenshot,
  });

  return res.status(201).json({
    message: "New Book added successfully",
    book: newBook,
  });
});
export { addBook };
