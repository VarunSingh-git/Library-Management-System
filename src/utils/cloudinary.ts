import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
import { CloudinaryUploadResult } from "../types/cloudinary.type.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = async (
  fileBuffer?: Buffer
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "Lib_Mgmt",
        resource_type: "image",
      },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result as CloudinaryUploadResult);
        return result;
      }
    );
    if (!fileBuffer) throw new Error("Please provide some data for image");
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
// streamifier.createReadStream(file.buffer).pipe(stream);
// 1. (streamifier.createReadStream) ek pipe hai
// 2. (file.buffer) hume multer se mila h jo hamara data h (Paani)
// 3. (.pipe) joint h. cloudinary ke tank se jaha data store hoga
// 4. (stream) tank h cloudinary ka

export const publicId = async (public_id: string) => {
  try {
    const deletedImage = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });
    if (!deletedImage)
      throw new Error("Error occur during img deletion from server");
    else {
      console.log("Image successfully deleted from cloudinary using public id");
    }
  } catch (error) {
    console.log("cloudinary");
    throw new Error("Error in deletion function of image");
  }
};


export const getPublicId = (url: string) => {
  const publicId = url.split("/");
  const finalPublicId = publicId.slice(-2).join("/").split(".")[0];
  return finalPublicId;
};
