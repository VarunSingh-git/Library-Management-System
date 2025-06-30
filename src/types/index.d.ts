import { CookieShape, JWT_Payload } from "./interfaces.type.js";

declare global {
  namespace Express {
    interface Request {
      cookies?: CookieShape;
      user?: JWT_Payload;
    }
  }
}

export {};
