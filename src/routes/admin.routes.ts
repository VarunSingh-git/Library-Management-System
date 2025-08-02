import { Router } from "express";
import {
  adminRegistration,
  adminLogin,
  adminLogout,
  getAllUsers,
  deleteUser,
  sendOtpController,
  verifyOTPandResetPassword,
  removeUserImg,
  updateUserImg,
} from "../controller/admin.controller.js";
import { otpRateLimit, loginRateLimit } from "../utils/rateLimiter.js";
import {
  authMiddlerware,
  authorizeMiddlware,
} from "../middlewares/auth.midlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router
  .route("/admin-registration")
  .post(upload.single("photo"), adminRegistration);

router.route("/admin-login").post(loginRateLimit, adminLogin);

router
  .route("/admin-logout")
  .post(authMiddlerware, authorizeMiddlware("admin"), adminLogout);

router
  .route("/get-all-users")
  .get(authMiddlerware, authorizeMiddlware("admin"), getAllUsers);

router
  .route("/delet-user/:userId")
  .delete(authMiddlerware, authorizeMiddlware("admin"), deleteUser);

router.route("/sent-otp").post(otpRateLimit, sendOtpController);

router.route("/validate-otp").post(verifyOTPandResetPassword);
router
  .route("/remove-user-image/:userId")
  .patch(authMiddlerware, authorizeMiddlware("admin"), removeUserImg);

router
  .route("/img-update/:userId")
  .patch(
    authMiddlerware,
    authorizeMiddlware("admin"),
    upload.single("photo"),
    updateUserImg
  );

export default router;
