import { MediaAsset } from '../types';
import defaultClinicData from '../../data/clinic_data.json';

const LOCAL_MEDIA_KEY = 'nma_uploaded_media_assets';

// Converts a file to an optimized Base64 data URL using an offscreen canvas
export async function optimizeImageToDataUrl(file: File, maxDim = 1600, quality = 0.88): Promise<{ dataUrl: string; width: number; height: number }> {
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
        const mimeType = file.type === 'image/png' || file.type === 'image/svg+xml' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({ dataUrl, width, height });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Stores custom media in local storage for persistence across visits in static deployments
export function getLocalMediaAssets(): MediaAsset[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEDIA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalMediaAsset(asset: MediaAsset): void {
  try {
    const current = getLocalMediaAssets();
    const updated = [asset, ...current.filter((item) => item.id !== asset.id)];
    // Cap stored assets to avoid exceeding browser storage quotas
    const capped = updated.slice(0, 30);
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(capped));
  } catch (err) {
    console.warn('Could not persist media asset to localStorage:', err);
  }
}

export function removeLocalMediaAsset(id: string): void {
  try {
    const current = getLocalMediaAssets();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not remove media asset from localStorage:', err);
  }
}

// Unified image upload that tries server endpoint, then falls back seamlessly to client storage
export async function uploadImageUnified(
  file: File,
  category = 'general',
  authHeaders?: Record<string, string>
): Promise<MediaAsset> {
  // 1. Try server endpoint first
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
      saveLocalMediaAsset(serverAsset);
      return serverAsset;
    }
  } catch {
    // Backend API unavailable (e.g. Netlify static hosting)
  }

  // 2. Client-side optimized image generation
  const { dataUrl, width, height } = await optimizeImageToDataUrl(file);

  const localAsset: MediaAsset = {
    id: `med-local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    filename: file.name,
    url: dataUrl,
    alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    category: category as any,
    fileSize: Math.round(dataUrl.length * 0.75),
    dimensions: `${width}x${height}`,
    uploadedAt: new Date().toISOString()
  };

  saveLocalMediaAsset(localAsset);
  return localAsset;
}

// Unified media list retrieval
export async function fetchMediaListUnified(authHeaders?: Record<string, string>): Promise<MediaAsset[]> {
  const localAssets = getLocalMediaAssets();
  const bundledAssets: MediaAsset[] = (defaultClinicData.mediaAssets as any[]) || [];

  try {
    const res = await fetch('/api/admin/media', {
      headers: authHeaders || {}
    });
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const serverAssets: MediaAsset[] = await res.json();
      // Combine server assets with any local additions
      const map = new Map<string, MediaAsset>();
      [...localAssets, ...serverAssets].forEach((a) => {
        if (!map.has(a.id) && !map.has(a.url)) map.set(a.url, a);
      });
      return Array.from(map.values());
    }
  } catch {
    // Static mode
  }

  // Combine local uploads with default clinic assets
  const map = new Map<string, MediaAsset>();
  [...localAssets, ...bundledAssets].forEach((a) => {
    if (!map.has(a.id) && !map.has(a.url)) map.set(a.url, a);
  });
  return Array.from(map.values());
}
