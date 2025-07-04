import { Router } from "express";
import {
  registration,
  logIn,
  logOut,
  updateUserDetails,
  chnagePassowrd,
  getUserData,
  test,
} from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  authMiddlerware,
  authorizeMiddlware,
} from "../middlewares/auth.midlewares.js";

const router = Router();

router.route("/registration").post(upload.single("photo"), registration);

router.route("/log-in").post(logIn);

router.route("/update-user-details").post(authMiddlerware, updateUserDetails);

router.route("/update-user-password").post(authMiddlerware, chnagePassowrd);

router
  .route("/get-user-data")
  .get(authMiddlerware, authorizeMiddlware("admin"), getUserData);

router.route("/log-out").post(authMiddlerware, logOut);

// router.route("/test").get(authMiddlerware, test);

export default router;
