import { Router } from "express";
import { addBook } from "../controller/book.controller.js";
import {
  authMiddlerware,
  authorizeMiddlware,
} from "../middlewares/auth.midlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router
  .route("/addBook")
  .post(authMiddlerware, authorizeMiddlware("admin"), addBook);

export default router;
