import { Mongoose } from "mongoose";
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db/index.db.js";
import express from "express";
dotenv.config({
  path: "/.env",
});
// import cookieParser from "cookie-parser";
// const app = express();
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

const startServer = async () => {
  await connectDB()
    .then(() => {
      app.listen(process.env.PORT, () => {
        console.log(`Database is connected on ${process.env.PORT}`);
      });
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
      process.exit(1);
    });
};
startServer();
