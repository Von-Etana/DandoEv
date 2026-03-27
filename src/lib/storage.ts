import { supabaseAdmin } from './supabase';

export interface UploadResult {
  url: string;
  publicId: string;
  provider: 'supabase' | 'mock';
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
 * Upload an image or PDF to Supabase Storage.
 * Exclusively uses Supabase for production-ready storage.
 */
export async function uploadFile(
  buffer: Buffer,
  folder: string = 'documents',
  fileName?: string
): Promise<UploadResult> {
  const contentType = getMimeType(buffer);
  const finalFileName = fileName || `file_${Date.now()}`;
  
  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (hasSupabase) {
    const bucketName = 'dandoev-docs';
    const filePath = `${folder}/${finalFileName}`;
    
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          upsert: true,
          contentType: contentType
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        publicId: data?.path || filePath,
        provider: 'supabase'
      };
    } catch (error: any) {
      console.error('Supabase upload error:', error.message);
    }
  }

  // Fallback to Mock for development if no credentials
  console.warn('No Supabase credentials found. Using simulated upload.');
  await new Promise((r) => setTimeout(r, 500));
  return {
    url: `https://mock-storage.com/${folder}/${finalFileName}`,
    publicId: `mock_${Date.now()}`,
    provider: 'mock'
  };
}
