// Image Upload Service with Multi-tier Resilience (imghosting.in CDN -> Firebase Storage -> Base64)

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const API_KEY = process.env.NEXT_PUBLIC_IMGHOSTING_API_KEY || 'sk_live_0so3yunv01pg3fzqb3doe3a';
const BASE_URL = process.env.NEXT_PUBLIC_IMGHOSTING_BASE_URL || 'https://api.imghosting.in';

export interface UploadImageResult {
  success: boolean;
  url?: string;
  id?: string;
  size?: number;
  type?: string;
  provider?: 'imghosting' | 'firebase' | 'base64';
  usage?: {
    current: number;
    limit: number;
  };
  error?: string;
}

export interface UsageResult {
  count: number;
  plan: string;
}

/**
 * Upload an image file directly to imghosting.in CDN with Firebase Storage and Base64 fallbacks.
 * @param file The File object (JPG, PNG, WEBP, GIF, etc.)
 */
export async function uploadImage(file: File): Promise<UploadImageResult> {
  if (!file) {
    return { success: false, error: 'No file selected for upload.' };
  }

  // Validate image type
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Only image files (JPG, PNG, WEBP, etc.) are supported.' };
  }

  // 20MB upload limit check
  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { success: false, error: 'File size exceeds the 20MB upload limit.' };
  }

  // ─────────────────────────────────────────────
  // Strategy 1: imghosting.in CDN
  // ─────────────────────────────────────────────
  try {
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'X-Free-API-Key': API_KEY,
      },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.url) {
        return {
          success: true,
          url: data.data.url,
          id: data.data.id,
          size: data.data.size || file.size,
          type: data.data.type || file.type,
          provider: 'imghosting',
          usage: data.usage,
        };
      }
    }
  } catch (err: any) {
    console.warn('imghosting.in upload attempt failed, falling back to Firebase Storage...', err?.message || err);
  }

  // ─────────────────────────────────────────────
  // Strategy 2: Firebase Storage Fallback
  // ─────────────────────────────────────────────
  try {
    const cleanExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `products/${Date.now()}-${sanitizedName}`;
    const storageRef = ref(storage, storagePath);

    const snap = await uploadBytes(storageRef, file, { contentType: file.type });
    const downloadUrl = await getDownloadURL(snap.ref);

    return {
      success: true,
      url: downloadUrl,
      id: storagePath,
      size: file.size,
      type: file.type,
      provider: 'firebase',
    };
  } catch (fbErr: any) {
    console.warn('Firebase Storage upload failed, falling back to Base64 data URL...', fbErr?.message || fbErr);
  }

  // ─────────────────────────────────────────────
  // Strategy 3: Inline Base64 Data URL (Guaranteed to work anywhere)
  // ─────────────────────────────────────────────
  try {
    const base64Url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image as data URL'));
      reader.readAsDataURL(file);
    });

    return {
      success: true,
      url: base64Url,
      id: `local-${Date.now()}`,
      size: file.size,
      type: file.type,
      provider: 'base64',
    };
  } catch (base64Err: any) {
    return {
      success: false,
      error: base64Err.message || 'Failed to process image file.',
    };
  }
}

/**
 * Retrieve current CDN upload quota and usage for the API key
 */
export async function getImageHostingUsage(): Promise<UsageResult | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/usage?key=${API_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch image hosting quota:', err);
    return null;
  }
}
