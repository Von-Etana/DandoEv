import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload an image or PDF to Cloudinary.
 * If credentials are missing, falls back to a simulated upload for development.
 */
export async function uploadFile(
  buffer: Buffer,
  folder: string = 'dandoev',
  fileName?: string
): Promise<UploadResult> {
  // Check if credentials exist
  const hasCreds = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

  if (!hasCreds) {
    console.warn('Cloudinary credentials missing. Using simulated upload.');
    // Simulate delay
    await new Promise((r) => setTimeout(r, 1000));
    return {
      url: `https://res.cloudinary.com/dummy-cloud/image/upload/v123456/${folder}/${fileName || 'mock_file'}.jpg`,
      publicId: `mock_${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Support PDF, images, etc.
        public_id: fileName,
        tags: ['dandoev-bnpl'],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}
