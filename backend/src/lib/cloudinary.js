import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary using a stream.
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @returns {Promise<object>} Cloudinary upload result
 */
export function uploadBuffer(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    const extIdx = originalName.lastIndexOf('.');
    const baseName = extIdx !== -1 ? originalName.substring(0, extIdx) : originalName;
    const cleanName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const publicId = `products/${Date.now()}_${cleanName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
}
