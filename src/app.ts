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
import bookRoutes from "./routes/book.routes.js";

app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/book", bookRoutes);

// export app;
export default app;
