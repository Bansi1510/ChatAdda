import cloudinary from "./cloudinary";
import fs from "fs/promises";

export const uploadToCloudinary = async (
  filePath: string
): Promise<string | null> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "chat-app",
    });
    return result.secure_url;
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn("File delete failed:", err);
    }
  }
};