import { Router } from "express";
import {
  registration,
  logIn,
  logOut,
  updateUserDetails,
  chnagePassowrd,
  getUserData,
  test,
  updateUserImg,
  removeUserImg,
  sendOtpController,
  verifyOTPandResetPassword,
} from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  authMiddlerware,
  authorizeMiddlware,
} from "../middlewares/auth.midlewares.js";
import { otpRateLimit, loginRateLimit } from "../utils/rateLimiter.js";

const router = Router();

router.route("/registration").post(upload.single("photo"), registration);

router.route("/log-in").post(loginRateLimit, logIn);

router.route("/update-user-details").post(authMiddlerware, updateUserDetails);

router.route("/update-user-password").post(authMiddlerware, chnagePassowrd);

router.route("/get-user-data").get(authMiddlerware, getUserData);

router.route("/log-out").post(authMiddlerware, logOut);

router
  .route("/img-update")
  .patch(authMiddlerware, upload.single("photo"), updateUserImg);

router.route("/remove-user-image").patch(authMiddlerware, removeUserImg);

router.route("/sent-otp").post(otpRateLimit, sendOtpController);
router.route("/validate-otp").post(verifyOTPandResetPassword);

router.route("/test").get(authMiddlerware, test);

export default router;
