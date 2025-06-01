import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config(); 


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadVideoToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'videos'
    }, (err, result) => {
      fs.unlinkSync(filePath); // clean local temp
      if (err) return reject(err);
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration
      });
    });
  });
};

export const uploadThumbnailToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      folder: 'thumbnails'
    }, (err, result) => {
      fs.unlinkSync(filePath); // clean local temp
      if (err) return reject(err);
      resolve(result.secure_url);
    });
  });
};
