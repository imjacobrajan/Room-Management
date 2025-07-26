import { Request } from "express";
import { cloudinary } from "../config/cloudinary";

export interface MulterRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
  file?: Express.Multer.File;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export const uploadImagesToCloudinary = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  if (!files?.length) return [];

  const uploadPromises = files.map(async (file) => {
    const result = (await cloudinary.uploader.upload(file.path, {
      folder: "room-management/rooms",
      transformation: [
        { width: 800, height: 600, crop: "limit", quality: "auto" },
      ],
      resource_type: "image",
    })) as CloudinaryUploadResult;

    return result.secure_url;
  });

  return Promise.all(uploadPromises);
};

export const deleteImagesFromCloudinary = async (
  imageUrls: string[]
): Promise<void> => {
  if (!imageUrls?.length) return;

  const deletePromises = imageUrls.map(async (url) => {
    try {
      const urlParts = url.split("/");
      const publicIdWithExtension = urlParts.slice(-2).join("/");
      const publicId = publicIdWithExtension.split(".")[0];
      await cloudinary.uploader.destroy(`room-management/rooms/${publicId}`);
    } catch (error) {
      console.error(`Failed to delete image ${url}:`, error);
    }
  });

  await Promise.allSettled(deletePromises);
};

export const extractPublicIdFromUrl = (url: string): string => {
  const urlParts = url.split("/");
  const publicIdWithExtension = urlParts.slice(-2).join("/");
  return publicIdWithExtension.split(".")[0];
};
