

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config(); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// export const uploadVideoToCloudinary = async (filePath) => {
//   console.log("from cloudnaryservice:",process.env.CLOUDINARY_API_KEY);
//   const result = await cloudinary.uploader.upload(filePath, {
//     resource_type: 'video',
//     folder: 'lecture_videos'
//   });
//   fs.unlinkSync(filePath);
//   return {  
//     url: result.secure_url,
//     publicId: result.public_id
//   };
// };

export const uploadVideoToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'lecture_videos',
    });

    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: Number(result.duration) || 0, // duration in seconds
    };
  } catch (err) {
    console.error("Cloudinary upload error:", err.message);
    throw err;
  }
};

