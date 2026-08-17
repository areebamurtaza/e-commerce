// lib/cloudinary.ts
import crypto from 'crypto';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

interface UploadToCloudinaryOptions {
  folder?: string;
  transformation?: string;
}

/**
 * Resolves Cloudinary configuration from environment variables
 */
export function getCloudinaryConfig() {
  let cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    '';
  let apiKey = process.env.CLOUDINARY_API_KEY || '';
  let apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    '';

  // Fallback: parse CLOUDINARY_URL if provided (e.g. cloudinary://123456:abcdef@mycloud)
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
    try {
      const parsed = new URL(cloudinaryUrl);
      cloudName = parsed.hostname;
      apiKey = parsed.username;
      apiSecret = parsed.password;
    } catch {
      // ignore parsing error
    }
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
    isConfigured: Boolean(cloudName && ((apiKey && apiSecret) || uploadPreset)),
  };
}

/**
 * Uploads a Buffer / File to Cloudinary directly via Cloudinary REST API
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  filename: string,
  options: UploadToCloudinaryOptions = {}
): Promise<{ success: boolean; url?: string; publicId?: string; error?: string }> {
  const config = getCloudinaryConfig();

  if (!config.cloudName) {
    return {
      success: false,
      error:
        'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.',
    };
  }

  const folder = options.folder || 'shopco/products';
  const timestamp = Math.floor(Date.now() / 1000);

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)]);
  formData.append('file', blob, filename);

  if (config.apiKey && config.apiSecret) {
    // Authenticated Signed Upload (Most Secure & Best Practice)
    const paramsToSign: Record<string, string> = {
      folder,
      timestamp: timestamp.toString(),
    };

    const sortedParams = Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(sortedParams + config.apiSecret)
      .digest('hex');

    formData.append('api_key', config.apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);
  } else if (config.uploadPreset) {
    // Unsigned Preset Upload fallback
    formData.append('upload_preset', config.uploadPreset);
    formData.append('folder', folder);
  } else {
    return {
      success: false,
      error:
        'Cloudinary credentials incomplete. Please configure CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET).',
    };
  }

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = (await res.json()) as CloudinaryUploadResult & {
      error?: { message: string };
    };

    if (!res.ok || data.error) {
      console.error('[CLOUDINARY_UPLOAD_ERROR]:', data.error);
      return {
        success: false,
        error: data.error?.message || `Upload failed with status ${res.status}`,
      };
    }

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('[CLOUDINARY_NETWORK_EXCEPTION]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error uploading to Cloudinary.',
    };
  }
}
