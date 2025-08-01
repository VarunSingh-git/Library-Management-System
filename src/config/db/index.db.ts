import mongoose from "mongoose";
import { DB_NAME } from "../../constant.js";
import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}` as string
    );
    console.log(connectionInstance.connection.host);
  } catch (err) {
    console.log(`Err: ${err}`);
    process.exit(1);
  }
};

export default connectDB;
