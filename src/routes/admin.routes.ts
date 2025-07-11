import { Router } from "express";
import {
  adminRegistration,
  adminLogin,
  adminLogout,
} from "../controller/admin.controller.js";
import {
  authMiddlerware,
  authorizeMiddlware,
} from "../middlewares/auth.midlewares.js";

const router = Router();

router
  .route("/admin-registration")
  .post(authorizeMiddlware("admin"), adminRegistration);

router.route("/admin-login").post(authorizeMiddlware("admin"), adminLogin);

router
  .route("/admin-logout")
  .post(authMiddlerware, authorizeMiddlware("admin"), adminLogout);

export default router;
