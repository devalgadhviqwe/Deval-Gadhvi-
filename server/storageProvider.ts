import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { getStore } from '@netlify/blobs';

// Initialize Cloudinary if environment variables are present
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

if (hasCloudinary) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }
}

export interface UploadResult {
  url: string;
  storageProvider: 'cloudinary' | 'netlify-blobs' | 'local';
  filename: string;
  fileSize: number;
  dimensions?: string;
}

/**
 * Upload an image buffer or file path to durable cloud storage or local disk.
 */
export async function uploadImageToStorage(
  fileBuffer: Buffer,
  originalFilename: string,
  mimetype: string,
  category = 'general'
): Promise<UploadResult> {
  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const cleanBase = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueName = `${cleanBase}_${Date.now()}_${Math.round(Math.random() * 1e4)}${ext}`;

  // 1. If Cloudinary is configured, upload to Cloudinary CDN
  if (hasCloudinary) {
    try {
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `nma_uploads/${category}`,
            public_id: `${cleanBase}_${Date.now()}`,
            resource_type: 'image',
            overwrite: true
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });

      const res = await uploadPromise;
      if (res && res.secure_url) {
        return {
          url: res.secure_url,
          storageProvider: 'cloudinary',
          filename: uniqueName,
          fileSize: res.bytes || fileBuffer.length,
          dimensions: res.width && res.height ? `${res.width}x${res.height}` : undefined
        };
      }
    } catch (cErr) {
      console.warn('Cloudinary upload failed, falling back to durable blob/local storage:', cErr);
    }
  }

  // 2. If running on Netlify with Netlify Blobs available
  const isNetlifyEnv = Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
  if (isNetlifyEnv) {
    try {
      const blobStore = getStore('nma-media-blobs');
      const blobKey = `uploads/${uniqueName}`;
      await blobStore.set(blobKey, fileBuffer as any, {
        metadata: {
          contentType: mimetype,
          filename: originalFilename,
          category,
          uploadedAt: new Date().toISOString()
        }
      });

      // Netlify Blobs provides persistent storage accessible via /api/blobs/ or public CDN URL
      return {
        url: `/api/blobs/${uniqueName}`,
        storageProvider: 'netlify-blobs',
        filename: uniqueName,
        fileSize: fileBuffer.length
      };
    } catch (blobErr) {
      console.warn('Netlify Blobs upload failed:', blobErr);
    }
  }

  // 3. Local filesystem persistence (mirrors to uploads/, public/uploads/, and src/assets/images/)
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const publicUploadsDir = path.resolve(process.cwd(), 'public/uploads');
  const srcAssetsDir = path.resolve(process.cwd(), 'src/assets/images');

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });
  if (!fs.existsSync(srcAssetsDir)) fs.mkdirSync(srcAssetsDir, { recursive: true });

  const targetPath1 = path.join(uploadsDir, uniqueName);
  const targetPath2 = path.join(publicUploadsDir, uniqueName);
  const targetPath3 = path.join(srcAssetsDir, uniqueName);

  fs.writeFileSync(targetPath1, fileBuffer);
  try {
    fs.writeFileSync(targetPath2, fileBuffer);
  } catch (err) {
    console.warn('Could not write to public/uploads:', err);
  }
  try {
    fs.writeFileSync(targetPath3, fileBuffer);
  } catch (err) {
    console.warn('Could not write to src/assets/images:', err);
  }

  return {
    url: `/uploads/${uniqueName}`,
    storageProvider: 'local',
    filename: uniqueName,
    fileSize: fileBuffer.length
  };
}

/**
 * Cloud Metadata Store for Netlify and Production.
 * Persists custom image overrides permanently across deployments.
 */
export async function getPersistentOverrides(): Promise<Record<string, string>> {
  try {
    const isNetlifyEnv = Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
    if (isNetlifyEnv) {
      const blobStore = getStore('nma-clinic-metadata');
      const data = await blobStore.get('custom_image_overrides', { type: 'json' });
      if (data && typeof data === 'object') {
        return data as Record<string, string>;
      }
    }
  } catch (err) {
    console.warn('Could not load overrides from Netlify Blobs:', err);
  }

  // Fallback to reading data/clinic_data.json
  try {
    const dataFile = path.resolve(process.cwd(), 'data/clinic_data.json');
    if (fs.existsSync(dataFile)) {
      const raw = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      const overrides: Record<string, string> = {};
      
      if (raw.globalSettings?.logoUrl) overrides['logo_main'] = raw.globalSettings.logoUrl;
      if (raw.globalSettings?.logoDarkUrl) overrides['logo_dark'] = raw.globalSettings.logoDarkUrl;
      
      if (Array.isArray(raw.doctors)) {
        raw.doctors.forEach((d: any) => {
          if (d.imageUrl) {
            overrides[`doctor_${d.id}`] = d.imageUrl;
            overrides[`doctor_${d.slug}`] = d.imageUrl;
          }
        });
      }

      if (Array.isArray(raw.services)) {
        raw.services.forEach((s: any) => {
          if (s.imageUrl) {
            overrides[`service_${s.id}`] = s.imageUrl;
            overrides[`service_${s.slug}`] = s.imageUrl;
          }
        });
      }

      if (Array.isArray(raw.sections)) {
        raw.sections.forEach((sec: any) => {
          if (sec.imageUrl) {
            overrides[`section_${sec.id}`] = sec.imageUrl;
            overrides[`section_${sec.sectionKey}`] = sec.imageUrl;
          }
          if (sec.secondaryImageUrl) {
            overrides[`section_${sec.id}_secondary`] = sec.secondaryImageUrl;
            overrides[`section_${sec.sectionKey}_secondary`] = sec.secondaryImageUrl;
          }
          if (sec.additionalImages && sec.additionalImages.length > 0) {
            overrides[`section_${sec.id}_additional`] = JSON.stringify(sec.additionalImages);
            overrides[`section_${sec.sectionKey}_additional`] = JSON.stringify(sec.additionalImages);
          }
        });
      }

      return overrides;
    }
  } catch (err) {
    console.warn('Could not parse clinic_data.json for overrides:', err);
  }

  return {};
}

/**
 * Save persistent override to cloud storage and local database.
 */
export async function savePersistentOverride(key: string, url: string): Promise<void> {
  try {
    const isNetlifyEnv = Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
    if (isNetlifyEnv) {
      const blobStore = getStore('nma-clinic-metadata');
      const current = (await blobStore.get('custom_image_overrides', { type: 'json' })) as Record<string, string> || {};
      current[key] = url;
      await blobStore.setJSON('custom_image_overrides', current);
    }
  } catch (err) {
    console.warn('Could not save override to Netlify Blobs:', err);
  }
}
