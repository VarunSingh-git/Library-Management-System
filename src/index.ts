import { Mongoose } from "mongoose";
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db/index.db.js";
import express from "express";
dotenv.config({
  path: "/.env",
});
import type {} from "./types/index.d.ts";

const startServer = async () => {
  await connectDB()
    .then(() => {
      app.listen(process.env.PORT, () => {
        console.log(`Database is connected on ${process.env.PORT}`);
      });
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
      process.on("uncaughtException", (err) => {
        console.error(err.name, err.message);
        process.exit(1);
      });
    });
};

startServer();
