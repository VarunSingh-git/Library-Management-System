import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NextFunction, Request, Response } from "express";
import { JWT_Payload } from "../types/interfaces.type.js";

export const authMiddlerware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.cookies.accessToken!;
    if (!token) next(new Error("Token missing. please login"));
    // console.log("token", token);
    try {
      const decode: JWT_Payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_KEY!
      ) as JWT_Payload;
      if (!decode) {
        next(new Error("Invalid or expired token. Please login again."));
      }
      req.user = decode;
      console.log(decode);
      next();
    } catch (error) {
      console.log("auth middleware");
      next(new Error("User must have login first"));
    }
  }
);

export const authorizeMiddlware = function (...role: Array<string>) {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const allowedRoles = req.user?.role as string;
      console.log(allowedRoles);
      if (!role.includes(allowedRoles)) next(new Error("Access denied"));
      next();
    }
  );
};
