import { rejects } from "assert";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


// export const publicId=async()
export const uploadToCloudinary = async (fileBuffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "Lib_Mgmt",
        resource_type: "image",
      },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
// streamifier.createReadStream(file.buffer).pipe(stream);
// 1. (streamifier.createReadStream) ek pipe hai
// 2. (file.buffer) hume multer se mila h jo hamara data h (Paani)
// 3. (.pipe) joint h. cloudinary ke tank se jaha data store hoga
// 4. (stream) tank h cloudinary ka
