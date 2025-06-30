import { Router } from "express";
import { registration, logIn } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { authMiddlerware } from "../middlewares/auth.midlewares.js";

const router = Router();

router.route("/registration").post(upload.single("photo"), registration);

router.route("/login").post(logIn);

export default router;
