import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { supabaseAdmin } from './supabase';

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
  provider: 'cloudinary' | 'supabase' | 'mock';
}

/**
 * Simple magic-number based MIME type detection.
 * Supports PDF, JPEG, PNG.
 */
function getMimeType(buffer: Buffer): string {
  const header = buffer.toString('hex', 0, 8).toUpperCase();
  if (header.startsWith('25504446')) return 'application/pdf';
  if (header.startsWith('FFD8FF')) return 'image/jpeg';
  if (header.startsWith('89504E47')) return 'image/png';
  return 'application/octet-stream';
}

/**
 * Upload an image or PDF to Cloudinary OR Supabase.
 * Prioritizes Cloudinary if credentials exist, otherwise falls back to Supabase.
 */
export async function uploadFile(
  buffer: Buffer,
  folder: string = 'documents',
  fileName?: string
): Promise<UploadResult> {
  const contentType = getMimeType(buffer);
  const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);
  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const finalFileName = fileName || `file_${Date.now()}`;

  // 1. Try Cloudinary
  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `dandoev/${folder}`,
          resource_type: 'auto',
          public_id: finalFileName,
          format: contentType.split('/')[1], // optional hint
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            provider: 'cloudinary'
          });
        }
      );

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  // 2. Try Supabase Storage
  if (hasSupabase) {
    const bucketName = 'dandoev-docs';
    const filePath = `${folder}/${finalFileName}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        upsert: true,
        contentType: contentType
      });

    if (error) {
      console.error('Supabase upload error:', error);
    } else if (data) {
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        publicId: data.path,
        provider: 'supabase'
      };
    }
  }

  // 3. Fallback to Mock
  console.warn('No storage credentials found. Using simulated upload.');
  await new Promise((r) => setTimeout(r, 1000));
  return {
    url: `https://mock-storage.com/${folder}/${finalFileName}.jpg`,
    publicId: `mock_${Date.now()}`,
    provider: 'mock'
  };
}
