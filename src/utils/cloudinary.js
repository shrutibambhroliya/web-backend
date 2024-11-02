import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("res", response);
    console.log("file has been upload on cloudinary", response.url);

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  const publicId = url.split("/").pop().split(".")[0];
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new error(400, "error while deleting from cloudinary");
  }
};

export { uploadCloudinary, deleteFromCloudinary };
