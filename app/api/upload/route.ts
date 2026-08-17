// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify administrative authorization
    await verifyAdmin();

    // 2. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string) || 'shopco/products';

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No valid image file provided.' },
        { status: 400 }
      );
    }

    // 3. Validate File Type & Size (Max 10MB)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files (PNG, JPG, WEBP, GIF, AVIF) are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image size exceeds maximum limit of 10MB.' },
        { status: 400 }
      );
    }

    // 4. Convert File to ArrayBuffer and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImageToCloudinary(buffer, file.name, { folder });

    if (!result.success || !result.url) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to upload image to Cloudinary.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error('[API_UPLOAD_ROUTE_ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server upload error occurred.';
    const isAuthError = errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('forbidden');

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: isAuthError ? 403 : 500 }
    );
  }
}
