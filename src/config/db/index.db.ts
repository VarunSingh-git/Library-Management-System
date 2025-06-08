import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

const DBconnect = asyncHandler(async (req, res, next) => {
  await mongoose.connect(process.env.MONGODB_URI as string);
});

export { DBconnect };
