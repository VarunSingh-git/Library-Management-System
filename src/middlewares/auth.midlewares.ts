import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NextFunction, Request, Response } from "express";
import { JWT_Payload } from "../types/interfaces.type.js";

export const authMiddlerware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.cookies?.accessToken as string;
    console.log("token", token);
    try {
      const decode: JWT_Payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_KEY as string
      ) as JWT_Payload;
      if (!decode) {
        next(new Error("Invalid or expired token. Please login again."));
      }
      req.user = decode;
      next();
    } catch (error) {
      return next(new Error("abcd"));
    }
  }
);
