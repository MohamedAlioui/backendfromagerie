import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file, folder = 'products') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `fromagerie/${folder}`,
      use_filename: true,
    });
    
    return result;
  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`);
    throw error;
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`);
    throw error;
  }
};