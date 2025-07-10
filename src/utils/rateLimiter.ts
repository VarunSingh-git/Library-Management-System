import rateLimit from "express-rate-limit";

export const loginRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  message: "Too many attempts for login. Please try again 10 min later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpRateLimit = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 3,
  message: "Too many OTP request. Please try again 20 min later",
  standardHeaders: true,
  legacyHeaders: false,
});
