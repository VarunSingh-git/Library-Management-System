import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

import userRoute from "./routes/user.routes.js";
import adminRoute from "./routes/admin.routes.js";

app.use("/api/v1/user", userRoute);

export default app;
