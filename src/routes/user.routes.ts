import { Router } from "express";
import { registration } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();


router.route("/registration").post(upload.single("photo"), registration);

export default router;
