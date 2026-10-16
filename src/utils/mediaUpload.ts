import { MediaAsset } from '../types';
import defaultClinicData from '../../data/clinic_data.json';
import { setIdbItem, getIdbItem, removeIdbItem } from './idbStorage';

const LOCAL_MEDIA_KEY = 'nma_uploaded_media_assets';

// Converts a file to an optimized Base64 data URL using an offscreen canvas
export async function optimizeImageToDataUrl(
  file: File,
  maxDim = 1200,
  quality = 0.82
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed reading selected image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed decoding image format'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: e.target?.result as string, width: img.width, height: img.height });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Prefer webp for ultra-compact storage (~60KB–120KB) with high fidelity and transparency support.
        // If webp isn't supported by the browser canvas, fall back to jpeg (or png for transparent logos).
        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            const isTransparent = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png') || file.type === 'image/svg+xml';
            dataUrl = canvas.toDataURL(isTransparent ? 'image/png' : 'image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve({ dataUrl, width, height });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Stores custom media in local storage and IndexedDB
export function getLocalMediaAssets(): MediaAsset[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEDIA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveLocalMediaAsset(asset: MediaAsset): Promise<void> {
  // 1. Always persist to IndexedDB (virtually unlimited browser storage)
  try {
    const idbList: MediaAsset[] = (await getIdbItem<MediaAsset[]>(LOCAL_MEDIA_KEY)) || [];
    const updatedIdb = [asset, ...idbList.filter((item) => item.id !== asset.id && item.url !== asset.url)];
    await setIdbItem(LOCAL_MEDIA_KEY, updatedIdb.slice(0, 50));
  } catch (err) {
    console.warn('Could not save to IndexedDB:', err);
  }

  // 2. Also try localStorage (keep up to 10 most recent to prevent quota errors)
  try {
    const current = getLocalMediaAssets();
    const updated = [asset, ...current.filter((item) => item.id !== asset.id && item.url !== asset.url)];
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(updated.slice(0, 10)));
  } catch {
    // Gracefully handled if quota is reached
  }
}

export async function removeLocalMediaAsset(id: string): Promise<void> {
  try {
    const current = getLocalMediaAssets();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  try {
    const idbList: MediaAsset[] = (await getIdbItem<MediaAsset[]>(LOCAL_MEDIA_KEY)) || [];
    const updated = idbList.filter((item) => item.id !== id);
    await setIdbItem(LOCAL_MEDIA_KEY, updated);
  } catch {
    // Ignore
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'image/avif',
    'image/heic',
    'image/heif',
    'image/bmp'
  ];
  if (!allowedMimes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files (JPEG, PNG, WebP, SVG, AVIF, GIF) are allowed.' };
  }
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds maximum limit of 25MB.' };
  }
  return { valid: true };
}

// Unified image upload to permanent cloud storage or durable backend
export async function uploadImageUnified(
  file: File,
  category = 'general',
  authHeaders?: Record<string, string>
): Promise<MediaAsset> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file');
  }

  // 1. Direct Cloudinary Client Upload if client environment has preset configured
  const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (cloudName && uploadPreset) {
    try {
      const cFormData = new FormData();
      cFormData.append('file', file);
      cFormData.append('upload_preset', uploadPreset);
      cFormData.append('folder', `nma_uploads/${category}`);

      const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cFormData
      });

      if (cRes.ok) {
        const cJson = await cRes.json();
        const asset: MediaAsset = {
          id: `med-cld-${Date.now()}`,
          filename: file.name,
          url: cJson.secure_url,
          alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          category: category as any,
          fileSize: cJson.bytes || file.size,
          dimensions: cJson.width && cJson.height ? `${cJson.width}x${cJson.height}` : undefined,
          uploadedAt: new Date().toISOString()
        };
        await saveLocalMediaAsset(asset);
        return asset;
      }
    } catch (cErr) {
      console.warn('Direct Cloudinary client upload failed, trying server API:', cErr);
    }
  }

  // 2. Upload via Server / Netlify API endpoint
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('alt', file.name.replace(/\.[^/.]+$/, ''));

    const res = await fetch('/api/admin/media/upload', {
      method: 'POST',
      headers: authHeaders || {},
      body: formData
    });

    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const serverAsset: MediaAsset = await res.json();
      await saveLocalMediaAsset(serverAsset);
      return serverAsset;
    } else if (!res.ok && contentType && contentType.includes('application/json')) {
      const errJson = await res.json();
      throw new Error(errJson.error || 'Server upload failed');
    }
  } catch (apiErr: any) {
    if (apiErr.message && !apiErr.message.includes('fetch')) {
      throw apiErr;
    }
    console.warn('API upload encountered network error:', apiErr);
  }

  throw new Error('Unable to complete durable image upload. Please ensure server is running or cloud storage is configured.');
}

// Unified media list retrieval merging IndexedDB, localStorage, and bundled assets
export async function fetchMediaListUnified(authHeaders?: Record<string, string>): Promise<MediaAsset[]> {
  const localAssets = getLocalMediaAssets();
  const idbAssets: MediaAsset[] = (await getIdbItem<MediaAsset[]>(LOCAL_MEDIA_KEY)) || [];
  const bundledAssets: MediaAsset[] = (defaultClinicData.mediaAssets as any[]) || [];

  try {
    const res = await fetch('/api/admin/media', {
      headers: authHeaders || {}
    });
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const serverAssets: MediaAsset[] = await res.json();
      const map = new Map<string, MediaAsset>();
      [...idbAssets, ...localAssets, ...serverAssets].forEach((a) => {
        if (!map.has(a.id) && !map.has(a.url)) map.set(a.url, a);
      });
      return Array.from(map.values());
    }
  } catch {
    // Static mode
  }

  // Combine IndexedDB, local uploads and default clinic assets
  const map = new Map<string, MediaAsset>();
  [...idbAssets, ...localAssets, ...bundledAssets].forEach((a) => {
    if (!map.has(a.id) && !map.has(a.url)) map.set(a.url, a);
  });
  return Array.from(map.values());
}
